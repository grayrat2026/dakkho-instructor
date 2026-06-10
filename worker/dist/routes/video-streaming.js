/**
 * Video Streaming & Processing Routes
 * ─────────────────────────────────────
 * - Tokenized HLS streaming for students
 * - Processing status updates from VPS transcoder
 * - Segment proxy with auth validation
 */
import { Hono } from 'hono';
import { adminAuthMiddleware } from '../lib/auth';
import { studentAuthMiddleware } from '../lib/student-auth-middleware';
import { getErrorMessage } from '../lib/utils';
const videoStreamingRoutes = new Hono();
// ─── Token Generation Helpers ───
function generateStreamToken(videoId, sessionId, expiry, secret) {
    // Simple HMAC-like token using Web Crypto
    const data = `${videoId}:${sessionId}:${expiry}`;
    // Use a simple encoding for now — in production, use proper HMAC
    const encoded = btoa(JSON.stringify({ v: videoId, s: sessionId, e: expiry }));
    return encoded;
}
function validateStreamToken(token, videoId) {
    try {
        const decoded = JSON.parse(atob(token));
        if (decoded.v !== videoId)
            return { valid: false };
        if (decoded.e && Date.now() > decoded.e)
            return { valid: false };
        return { valid: true, sessionId: decoded.s, expiry: decoded.e };
    }
    catch {
        return { valid: false };
    }
}
// ─── Student Streaming Endpoints ───
// POST /session/:videoId — Create streaming session
videoStreamingRoutes.post('/session/:videoId', studentAuthMiddleware, async (c) => {
    try {
        const videoId = c.req.param('videoId');
        const userId = c.get('studentId');
        // Check enrollment
        const video = await c.env.DB.prepare('SELECT course_id, is_preview, processing_status, hls_ready, available_qualities FROM videos WHERE id = ?').bind(videoId).first();
        if (!video) {
            return c.json({ error: 'Video not found' }, 404);
        }
        // If not a preview video, check enrollment
        if (!video.is_preview) {
            const enrollment = await c.env.DB.prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?').bind(userId, video.course_id).first();
            if (!enrollment) {
                return c.json({ error: 'Not enrolled in this course' }, 403);
            }
        }
        // Create streaming session
        const sessionId = crypto.randomUUID();
        const expiry = Date.now() + (10 * 60 * 1000); // 10 minutes
        const token = generateStreamToken(videoId, sessionId, expiry, 'dakkho-stream-secret');
        // Store session in KV (auto-expire in 15 minutes)
        await c.env.KV_CONFIG.put(`stream:${sessionId}`, JSON.stringify({
            videoId,
            userId,
            token,
            expiry,
            createdAt: Date.now(),
        }), { expirationTtl: 900 }); // 15 min
        return c.json({
            success: true,
            sessionId,
            token,
            expiresAt: expiry,
            hlsReady: video.hls_ready === 1,
            availableQualities: JSON.parse(video.available_qualities || '[]'),
            processingStatus: video.processing_status || 'pending',
        });
    }
    catch (error) {
        return c.json({ error: getErrorMessage(error) }, 500);
    }
});
// GET /playlist/:videoId — Return dynamic m3u8 with tokenized segment URLs
videoStreamingRoutes.get('/playlist/:videoId', async (c) => {
    try {
        const videoId = c.req.param('videoId');
        const session = c.req.query('session') || '';
        const token = c.req.query('token') || '';
        // Validate token
        const validation = validateStreamToken(token, videoId);
        if (!validation.valid || !validation.sessionId) {
            return c.json({ error: 'Invalid or expired token' }, 403);
        }
        // Check session in KV
        const sessionData = await c.env.KV_CONFIG.get(`stream:${validation.sessionId}`);
        if (!sessionData) {
            return c.json({ error: 'Session expired' }, 401);
        }
        const parsed = JSON.parse(sessionData);
        if (parsed.token !== token || parsed.videoId !== videoId) {
            return c.json({ error: 'Invalid session' }, 403);
        }
        // Get video info
        const video = await c.env.DB.prepare('SELECT hls_ready, available_qualities FROM videos WHERE id = ?').bind(videoId).first();
        if (!video || !video.hls_ready) {
            return c.json({ error: 'HLS not ready yet' }, 404);
        }
        const qualities = JSON.parse(video.available_qualities || '["360p"]');
        // Generate tokenized segment URLs
        const segExpiry = Math.floor(Date.now() / 1000) + 300; // 5 minutes
        const segToken = generateStreamToken(videoId, validation.sessionId, segExpiry * 1000, 'dakkho-stream-secret');
        const workerUrl = new URL(c.req.url).origin;
        // Build m3u8 playlist
        let m3u8 = '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n';
        for (const quality of qualities) {
            const height = quality.replace('p', '');
            let bandwidth = '800000';
            let resolution = '640x360';
            if (quality === '720p') {
                bandwidth = '2800000';
                resolution = '1280x720';
            }
            if (quality === '1080p') {
                bandwidth = '5000000';
                resolution = '1920x1080';
            }
            m3u8 += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n`;
            m3u8 += `${workerUrl}/api/video/stream/variant/${videoId}/${quality}/playlist.m3u8?session=${validation.sessionId}&token=${segToken}&exp=${segExpiry}\n`;
        }
        return new Response(m3u8, {
            headers: {
                'Content-Type': 'application/vnd.apple.mpegurl',
                'Cache-Control': 'no-store, no-cache',
                'Access-Control-Allow-Origin': c.req.header('origin') || '*',
            },
        });
    }
    catch (error) {
        return c.json({ error: getErrorMessage(error) }, 500);
    }
});
// GET /variant/:videoId/:quality/playlist.m3u8 — Quality-specific playlist
videoStreamingRoutes.get('/variant/:videoId/:quality/playlist.m3u8', async (c) => {
    try {
        const videoId = c.req.param('videoId');
        const quality = c.req.param('quality');
        const session = c.req.query('session') || '';
        const token = c.req.query('token') || '';
        const exp = c.req.query('exp') || '';
        // Validate token
        const validation = validateStreamToken(token, videoId);
        if (!validation.valid) {
            return c.json({ error: 'Invalid or expired token' }, 403);
        }
        // Check expiry
        if (exp && Math.floor(Date.now() / 1000) > parseInt(exp)) {
            return c.json({ error: 'Token expired' }, 403);
        }
        // Check session in KV
        const sessionData = await c.env.KV_CONFIG.get(`stream:${validation.sessionId}`);
        if (!sessionData) {
            return c.json({ error: 'Session expired' }, 401);
        }
        // Fetch the actual playlist from R2
        const key = `${videoId}/hls/${quality}/playlist.m3u8`;
        const object = await c.env.R2_VIDEOS.get(key);
        if (!object) {
            return c.json({ error: 'Quality playlist not found' }, 404);
        }
        // Rewrite segment URLs to include auth tokens
        let playlist = await object.text();
        // Replace relative segment references with tokenized absolute URLs
        const workerUrl = new URL(c.req.url).origin;
        const segExpiry = Math.floor(Date.now() / 1000) + 300;
        const segToken = generateStreamToken(videoId, validation.sessionId, segExpiry * 1000, 'dakkho-stream-secret');
        playlist = playlist.replace(/seg_(\d+)\.ts/g, `${workerUrl}/api/video/stream/seg/${videoId}/${quality}/seg_$1.ts?session=${validation.sessionId}&token=${segToken}&exp=${segExpiry}`);
        return new Response(playlist, {
            headers: {
                'Content-Type': 'application/vnd.apple.mpegurl',
                'Cache-Control': 'no-store, no-cache',
                'Access-Control-Allow-Origin': c.req.header('origin') || '*',
            },
        });
    }
    catch (error) {
        return c.json({ error: getErrorMessage(error) }, 500);
    }
});
// GET /seg/:videoId/:quality/:segFile — Serve individual .ts segment
videoStreamingRoutes.get('/seg/:videoId/:quality/:segFile', async (c) => {
    try {
        const videoId = c.req.param('videoId');
        const quality = c.req.param('quality');
        const segFile = c.req.param('segFile');
        const session = c.req.query('session') || '';
        const token = c.req.query('token') || '';
        const exp = c.req.query('exp') || '';
        // Validate token
        const validation = validateStreamToken(token, videoId);
        if (!validation.valid) {
            return c.json({ error: 'Invalid token' }, 403);
        }
        // Check expiry
        if (exp && Math.floor(Date.now() / 1000) > parseInt(exp)) {
            return c.json({ error: 'Token expired' }, 403);
        }
        // Validate session from KV (fast lookup)
        const sessionData = await c.env.KV_CONFIG.get(`stream:${validation.sessionId}`);
        if (!sessionData) {
            return c.json({ error: 'Session expired' }, 401);
        }
        const parsed = JSON.parse(sessionData);
        if (parsed.videoId !== videoId) {
            return c.json({ error: 'Invalid session for this video' }, 403);
        }
        // Fetch segment from R2
        const key = `${videoId}/hls/${quality}/${segFile}`;
        const object = await c.env.R2_VIDEOS.get(key);
        if (!object) {
            return c.json({ error: 'Segment not found' }, 404);
        }
        // Return with caching headers
        const headers = new Headers();
        headers.set('Content-Type', 'video/mp2t');
        headers.set('Cache-Control', 'private, max-age=300'); // 5 min browser cache
        headers.set('Access-Control-Allow-Origin', c.req.header('origin') || '*');
        if (object.httpMetadata?.contentType) {
            headers.set('Content-Type', object.httpMetadata.contentType);
        }
        return new Response(object.body, { headers });
    }
    catch (error) {
        return c.json({ error: getErrorMessage(error) }, 500);
    }
});
// GET /info/:videoId — Get video streaming info (for player AND VPS transcoder)
videoStreamingRoutes.get('/info/:videoId', async (c) => {
    try {
        const videoId = c.req.param('videoId');
        // Allow both student auth and admin auth
        const authHeader = c.req.header('Authorization');
        let isAuthorized = false;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            // Check admin session
            const adminSession = await c.env.DB.prepare('SELECT id FROM admin_sessions WHERE id = ? AND is_active = 1').bind(token).first();
            if (adminSession) {
                isAuthorized = true;
            }
        }
        // If not admin, check student auth via KV
        if (!isAuthorized) {
            // Simple student auth check — in production, use proper middleware
            return c.json({ error: 'Unauthorized' }, 401);
        }
        const video = await c.env.DB.prepare(`SELECT id, title, duration, video_url, thumbnail_url, course_id, is_preview,
              processing_status, hls_ready, available_qualities
       FROM videos WHERE id = ?`).bind(videoId).first();
        if (!video) {
            return c.json({ error: 'Video not found' }, 404);
        }
        return c.json({
            success: true,
            video: {
                id: video.id,
                title: video.title,
                duration: video.duration,
                thumbnailUrl: video.thumbnail_url,
                isPreview: video.is_preview === 1,
                hlsReady: video.hls_ready === 1,
                availableQualities: JSON.parse(video.available_qualities || '[]'),
                processingStatus: video.processing_status || 'pending',
                // Legacy fallback URL (for non-HLS mode)
                fallbackUrl: video.video_url,
            },
        });
    }
    catch (error) {
        return c.json({ error: getErrorMessage(error) }, 500);
    }
});
// ─── Admin/VPS Processing Endpoints ───
// PUT /processing-status/:videoId — Update processing status (from VPS transcoder)
videoStreamingRoutes.put('/processing-status/:videoId', adminAuthMiddleware, async (c) => {
    try {
        const videoId = c.req.param('videoId');
        const body = await c.req.json();
        const allowedFields = [
            'processing_status', 'hls_ready', 'available_qualities', 'raw_deleted',
            'file_size_original', 'file_size_360p', 'file_size_720p', 'file_size_1080p',
            'processing_started_at', 'processing_completed_at', 'processing_error',
        ];
        // Handle add_quality separately — appends to available_qualities
        if (body.add_quality) {
            const current = await c.env.DB.prepare('SELECT available_qualities FROM videos WHERE id = ?').bind(videoId).first();
            const existing = JSON.parse(current?.available_qualities || '[]');
            if (!existing.includes(body.add_quality)) {
                existing.push(body.add_quality);
                body.available_qualities = JSON.stringify(existing);
            }
            delete body.add_quality;
        }
        const setClauses = [];
        const setValues = [];
        for (const [key, value] of Object.entries(body)) {
            if (allowedFields.includes(key)) {
                setClauses.push(`${key} = ?`);
                setValues.push(value);
            }
        }
        if (setClauses.length === 0) {
            return c.json({ error: 'No valid fields to update' }, 400);
        }
        setClauses.push("updated_at = datetime('now')");
        setValues.push(videoId);
        await c.env.DB.prepare(`UPDATE videos SET ${setClauses.join(', ')} WHERE id = ?`).bind(...setValues).run();
        return c.json({ success: true, videoId, updated: setClauses.length });
    }
    catch (error) {
        return c.json({ error: getErrorMessage(error) }, 500);
    }
});
// GET /pending-transcode — List videos needing transcoding (for VPS poller)
videoStreamingRoutes.get('/pending-transcode', adminAuthMiddleware, async (c) => {
    try {
        const limit = parseInt(c.req.query('limit') || '5');
        const result = await c.env.DB.prepare(`SELECT id, title, video_url, duration, processing_status, created_at
       FROM videos 
       WHERE processing_status = 'pending' 
         AND video_url IS NOT NULL 
         AND video_url != ''
       ORDER BY created_at ASC 
       LIMIT ?`).bind(limit).all();
        return c.json({
            success: true,
            videos: result.results,
            total: result.results.length,
        });
    }
    catch (error) {
        return c.json({ error: getErrorMessage(error) }, 500);
    }
});
export default videoStreamingRoutes;
