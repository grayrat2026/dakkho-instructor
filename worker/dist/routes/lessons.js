/**
 * Lessons routes — GET, POST, PUT, DELETE
 * D1-only: CRUD for lessons (Chapter → Lesson curriculum structure)
 * Supports: video_url, thumbnail_url, document_url per lesson
 */
import { Hono } from 'hono';
import { adminAuthMiddleware } from '../lib/auth';
import { logAudit } from '../lib/audit';
import { getErrorMessage, normalizeKeys } from '../lib/utils';
const lessonRoutes = new Hono();
// Apply auth middleware to all lesson routes
lessonRoutes.use('*', adminAuthMiddleware);
// Helper: generate slug from title
function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
// GET / — List lessons, filter by courseId, chapterId, subjectId
lessonRoutes.get('/', async (c) => {
    try {
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        const courseId = c.req.query('courseId') || '';
        const chapterId = c.req.query('chapterId') || '';
        const subjectId = c.req.query('subjectId') || '';
        const offset = (page - 1) * limit;
        let where = 'WHERE 1=1';
        const params = [];
        if (courseId) {
            where += ' AND course_id = ?';
            params.push(courseId);
        }
        if (chapterId) {
            where += ' AND chapter_id = ?';
            params.push(chapterId);
        }
        if (subjectId) {
            where += ' AND subject_id = ?';
            params.push(subjectId);
        }
        const countResult = await c.env.DB.prepare(`SELECT COUNT(*) as total FROM lessons ${where}`).bind(...params).first();
        const total = countResult?.total || 0;
        const result = await c.env.DB.prepare(`SELECT * FROM lessons ${where} ORDER BY chapter_id, sort_order ASC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all();
        return c.json({ documents: result.results, total });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
// POST / — Create lesson
lessonRoutes.post('/', async (c) => {
    try {
        const rawData = await c.req.json();
        const allowedFields = [
            'chapter_id', 'course_id', 'subject_id', 'title', 'slug',
            'description', 'lesson_type', 'sort_order', 'is_preview', 'duration',
            'video_url', 'thumbnail_url', 'document_url',
        ];
        const data = normalizeKeys(rawData, allowedFields);
        const id = crypto.randomUUID();
        const slug = data.slug || slugify(data.title || '');
        if (!data.title) {
            return c.json({ error: 'Title is required' }, 400);
        }
        if (!data.chapter_id) {
            return c.json({ error: 'Chapter ID is required' }, 400);
        }
        if (!data.course_id) {
            return c.json({ error: 'Course ID is required' }, 400);
        }
        // Auto-inherit subject_id from chapter if not provided
        if (!data.subject_id) {
            const chapter = await c.env.DB.prepare('SELECT subject_id FROM chapters WHERE id = ?').bind(String(data.chapter_id)).first();
            if (chapter && chapter.subject_id) {
                data.subject_id = chapter.subject_id;
            }
        }
        await c.env.DB.prepare(`
      INSERT INTO lessons (id, chapter_id, course_id, subject_id, title, slug, description, lesson_type, sort_order, is_preview, duration, video_url, thumbnail_url, document_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, data.chapter_id, data.course_id, data.subject_id || null, data.title, slug, data.description || null, data.lesson_type || 'video', data.sort_order || 0, data.is_preview ? 1 : 0, data.duration || 0, data.video_url || null, data.thumbnail_url || null, data.document_url || null).run();
        const created = await c.env.DB.prepare('SELECT * FROM lessons WHERE id = ?').bind(id).first();
        const user = c.get('user');
        await logAudit(c.env, user.id, 'CREATE_LESSON', 'lessons', id, data);
        return c.json({ document: created });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
// PUT / — Update lesson (requires lessonId in body)
lessonRoutes.put('/', async (c) => {
    try {
        const rawData = await c.req.json();
        const { lessonId, ...rawUpdates } = rawData;
        if (!lessonId) {
            return c.json({ error: 'Lesson ID required' }, 400);
        }
        // Check if lesson exists
        const existing = await c.env.DB.prepare('SELECT id FROM lessons WHERE id = ?').bind(String(lessonId)).first();
        if (!existing) {
            return c.json({ error: 'Lesson not found' }, 404);
        }
        const allowedFields = [
            'chapter_id', 'course_id', 'subject_id', 'title', 'slug',
            'description', 'lesson_type', 'sort_order', 'is_preview', 'duration',
            'video_url', 'thumbnail_url', 'document_url',
        ];
        // Normalize camelCase keys from admin panel to snake_case for D1
        const updates = normalizeKeys(rawUpdates, allowedFields);
        const setClauses = [];
        const setValues = [];
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                if (key === 'is_preview') {
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
        setValues.push(String(lessonId));
        await c.env.DB.prepare(`UPDATE lessons SET ${setClauses.join(', ')} WHERE id = ?`).bind(...setValues).run();
        const updated = await c.env.DB.prepare('SELECT * FROM lessons WHERE id = ?').bind(String(lessonId)).first();
        const user = c.get('user');
        await logAudit(c.env, user.id, 'UPDATE_LESSON', 'lessons', String(lessonId), updates);
        return c.json({ document: updated });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
// DELETE / — Delete lesson (supports both id and lessonId query params)
lessonRoutes.delete('/', async (c) => {
    try {
        const id = c.req.query('id') || c.req.query('lessonId');
        if (!id) {
            return c.json({ error: 'Lesson ID required' }, 400);
        }
        await c.env.DB.prepare('DELETE FROM lessons WHERE id = ?').bind(id).run();
        const user = c.get('user');
        await logAudit(c.env, user.id, 'DELETE_LESSON', 'lessons', id);
        return c.json({ success: true });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
export default lessonRoutes;
