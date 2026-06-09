/**
 * Courses routes — GET, POST, PUT, DELETE
 * D1-only: No Appwrite dependencies
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import type { AuthVariables } from '../lib/auth';
import { adminAuthMiddleware } from '../lib/auth';
import { logAudit } from '../lib/audit';
import { getErrorMessage } from '../lib/utils';

const courseRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// Apply auth middleware to all course routes
courseRoutes.use('*', adminAuthMiddleware);

// Helper: generate slug from title
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// GET / — List courses
courseRoutes.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const search = c.req.query('search') || '';
    const level = c.req.query('level') || '';
    const published = c.req.query('published') || '';
    const featured = c.req.query('featured') || '';
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params: unknown[] = [];

    if (search) {
      where += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }
    if (level) {
      where += ' AND level = ?';
      params.push(level);
    }
    if (published === 'true') {
      where += ' AND is_published = 1';
    }
    if (published === 'false') {
      where += ' AND is_published = 0';
    }
    if (featured === 'true') {
      where += ' AND is_featured = 1';
    }

    const countResult = await c.env.DB.prepare(
      `SELECT COUNT(*) as total FROM courses ${where}`
    ).bind(...params).first();
    const total = (countResult as any)?.total || 0;

    const result = await c.env.DB.prepare(
      `SELECT * FROM courses ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(...params, limit, offset).all();

    return c.json({ documents: result.results, total });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// POST / — Create course
courseRoutes.post('/', async (c) => {
  try {
    const data = await c.req.json<Record<string, unknown>>();
    const id = crypto.randomUUID();
    const slug = (data.slug as string) || slugify(data.title as string);

    await c.env.DB.prepare(`
      INSERT INTO courses (id, title, slug, description, thumbnail_url, preview_video_url, category_id, instructor_id, technology_id, level, language, duration, total_videos, rating, total_reviews, total_students, price, is_featured, is_published, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.title || '',
      slug,
      data.description || null,
      data.thumbnail_url || null,
      data.preview_video_url || null,
      data.category_id || null,
      data.instructor_id || null,
      data.technology_id || null,
      data.level || 'beginner',
      data.language || 'bangla',
      data.duration || 0,
      data.total_videos || 0,
      data.rating || 0,
      data.total_reviews || 0,
      data.total_students || 0,
      data.price || 0,
      data.is_featured ? 1 : 0,
      data.is_published ? 1 : 0,
      data.tags || null
    ).run();

    const created = await c.env.DB.prepare('SELECT * FROM courses WHERE id = ?').bind(id).first();

    const user = c.get('user');
    await logAudit(c.env, user.id, 'CREATE_COURSE', 'courses', id, data);

    return c.json({ document: created });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// PUT / — Update course
courseRoutes.put('/', async (c) => {
  try {
    const data = await c.req.json<Record<string, unknown>>();
    const { courseId, ...updates } = data;

    if (!courseId) {
      return c.json({ error: 'Course ID required' }, 400);
    }

    const allowedFields = ['title', 'slug', 'description', 'thumbnail_url', 'preview_video_url', 'category_id', 'instructor_id', 'technology_id', 'level', 'language', 'duration', 'total_videos', 'rating', 'total_reviews', 'total_students', 'price', 'is_featured', 'is_published', 'tags'];
    const setClauses: string[] = [];
    const setValues: unknown[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        // Convert boolean to integer for SQLite
        if (key === 'is_featured' || key === 'is_published') {
          setClauses.push(`${key} = ?`);
          setValues.push(value ? 1 : 0);
        } else {
          setClauses.push(`${key} = ?`);
          setValues.push(value);
        }
      }
    }

    if (setClauses.length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }

    setClauses.push("updated_at = datetime('now')");
    setValues.push(String(courseId));

    await c.env.DB.prepare(
      `UPDATE courses SET ${setClauses.join(', ')} WHERE id = ?`
    ).bind(...setValues).run();

    const updated = await c.env.DB.prepare('SELECT * FROM courses WHERE id = ?').bind(String(courseId)).first();

    const user = c.get('user');
    await logAudit(c.env, user.id, 'UPDATE_COURSE', 'courses', String(courseId), updates);

    return c.json({ document: updated });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// DELETE / — Delete course
courseRoutes.delete('/', async (c) => {
  try {
    const courseId = c.req.query('id');

    if (!courseId) {
      return c.json({ error: 'Course ID required' }, 400);
    }

    await c.env.DB.prepare('DELETE FROM courses WHERE id = ?').bind(courseId).run();

    const user = c.get('user');
    await logAudit(c.env, user.id, 'DELETE_COURSE', 'courses', courseId);

    return c.json({ success: true });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

export default courseRoutes;
