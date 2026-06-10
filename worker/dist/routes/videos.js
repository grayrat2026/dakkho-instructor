/**
 * Videos routes — GET, POST, PUT, DELETE
 * D1-only: No Appwrite dependencies
 */
import { Hono } from 'hono';
import { adminAuthMiddleware } from '../lib/auth';
import { logAudit } from '../lib/audit';
import { getErrorMessage, normalizeKeys } from '../lib/utils';
const videoRoutes = new Hono();
// Apply auth middleware to all video routes
videoRoutes.use('*', adminAuthMiddleware);
// GET / — List videos
videoRoutes.get('/', async (c) => {
    try {
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        const courseId = c.req.query('courseId') || '';
        const published = c.req.query('published') || '';
        const offset = (page - 1) * limit;
        let where = 'WHERE 1=1';
        const params = [];
        if (courseId) {
            where += ' AND course_id = ?';
            params.push(courseId);
        }
        if (published === 'true') {
            where += ' AND is_published = 1';
        }
        if (published === 'false') {
            where += ' AND is_published = 0';
        }
        const countResult = await c.env.DB.prepare(`SELECT COUNT(*) as total FROM videos ${where}`).bind(...params).first();
        const total = countResult?.total || 0;
        const result = await c.env.DB.prepare(`SELECT * FROM videos ${where} ORDER BY course_id, sort_order ASC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all();
        return c.json({ documents: result.results, total });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
// POST / — Create video
videoRoutes.post('/', async (c) => {
    try {
        const rawData = await c.req.json();
        const allowedFields = ['title', 'slug', 'description', 'course_id', 'video_url', 'thumbnail_url', 'duration', 'sort_order', 'is_preview', 'is_published', 'lesson_id', 'lesson_type'];
        const data = normalizeKeys(rawData, allowedFields);
        const id = crypto.randomUUID();
        const slug = data.slug || (data.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        // Set processing_status based on whether video_url is provided
        const processingStatus = (data.video_url && String(data.video_url).trim() !== '') ? 'pending' : null;
        await c.env.DB.prepare(`
      INSERT INTO videos (id, title, slug, description, course_id, video_url, thumbnail_url, duration, sort_order, is_preview, is_published, lesson_id, lesson_type, processing_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, data.title || '', slug, data.description || null, data.course_id || '', data.video_url || null, data.thumbnail_url || null, data.duration || 0, data.sort_order || 0, data.is_preview ? 1 : 0, data.is_published ? 1 : 0, data.lesson_id || null, data.lesson_type || null, processingStatus).run();
        const created = await c.env.DB.prepare('SELECT * FROM videos WHERE id = ?').bind(id).first();
        const user = c.get('user');
        await logAudit(c.env, user.id, 'CREATE_VIDEO', 'videos', id, data);
        return c.json({ document: created });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
// PUT / — Update video
videoRoutes.put('/', async (c) => {
    try {
        const rawData = await c.req.json();
        const { videoId, ...rawUpdates } = rawData;
        if (!videoId) {
            return c.json({ error: 'Video ID required' }, 400);
        }
        const allowedFields = ['title', 'slug', 'description', 'course_id', 'video_url', 'thumbnail_url', 'duration', 'sort_order', 'is_preview', 'is_published', 'lesson_id', 'lesson_type'];
        // Normalize camelCase keys from admin panel to snake_case for D1
        const updates = normalizeKeys(rawUpdates, allowedFields);
        const setClauses = [];
        const setValues = [];
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                if (key === 'is_preview' || key === 'is_published') {
                    setClauses.push(`${key} = ?`);
                    setValues.push(value ? 1 : 0);
                }
                else {
                    setClauses.push(`${key} = ?`);
                    setValues.push(value);
                }
            }
        }
        if (setClauses.length === 0) {
            return c.json({ error: 'No valid fields to update' }, 400);
        }
        setClauses.push("updated_at = datetime('now')");
        setValues.push(String(videoId));
        await c.env.DB.prepare(`UPDATE videos SET ${setClauses.join(', ')} WHERE id = ?`).bind(...setValues).run();
        const updated = await c.env.DB.prepare('SELECT * FROM videos WHERE id = ?').bind(String(videoId)).first();
        const user = c.get('user');
        await logAudit(c.env, user.id, 'UPDATE_VIDEO', 'videos', String(videoId), updates);
        return c.json({ document: updated });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
// DELETE / — Delete video
videoRoutes.delete('/', async (c) => {
    try {
        const videoId = c.req.query('id');
        if (!videoId) {
            return c.json({ error: 'Video ID required' }, 400);
        }
        await c.env.DB.prepare('DELETE FROM videos WHERE id = ?').bind(videoId).run();
        const user = c.get('user');
        await logAudit(c.env, user.id, 'DELETE_VIDEO', 'videos', videoId);
        return c.json({ success: true });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
export default videoRoutes;
