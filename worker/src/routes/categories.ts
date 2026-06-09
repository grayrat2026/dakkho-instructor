/**
 * Categories routes — GET, POST, PUT, DELETE
 * D1-only: No Appwrite dependencies
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import type { AuthVariables } from '../lib/auth';
import { adminAuthMiddleware } from '../lib/auth';
import { logAudit } from '../lib/audit';
import { getErrorMessage } from '../lib/utils';

const categoryRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// Apply auth middleware to all category routes
categoryRoutes.use('*', adminAuthMiddleware);

// GET / — List categories
categoryRoutes.get('/', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');

    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM categories'
    ).first();
    const total = (countResult as any)?.total || 0;

    const result = await c.env.DB.prepare(
      'SELECT * FROM categories ORDER BY sort_order ASC LIMIT ?'
    ).bind(limit).all();

    return c.json({ documents: result.results, total });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// POST / — Create category
categoryRoutes.post('/', async (c) => {
  try {
    const data = await c.req.json<Record<string, unknown>>();
    const id = crypto.randomUUID();
    const slug = (data.slug as string) || (data.name as string).toLowerCase().replace(/[^a-z0-9]+/g, '-');

    await c.env.DB.prepare(`
      INSERT INTO categories (id, name, slug, icon, color, parent_id, sort_order, course_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.name || '',
      slug,
      data.icon || null,
      data.color || null,
      data.parent_id || null,
      data.sort_order || 0,
      data.course_count || 0
    ).run();

    const created = await c.env.DB.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first();

    const user = c.get('user');
    await logAudit(c.env, user.id, 'CREATE_CATEGORY', 'categories', id, data);

    return c.json({ document: created });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// PUT / — Update category
categoryRoutes.put('/', async (c) => {
  try {
    const data = await c.req.json<Record<string, unknown>>();
    const { categoryId, ...updates } = data;

    if (!categoryId) {
      return c.json({ error: 'Category ID required' }, 400);
    }

    const allowedFields = ['name', 'slug', 'icon', 'color', 'parent_id', 'sort_order', 'course_count'];
    const setClauses: string[] = [];
    const setValues: unknown[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = ?`);
        setValues.push(value);
      }
    }

    if (setClauses.length === 0) {
      return c.json({ error: 'No valid fields to update' }, 400);
    }

    setClauses.push("updated_at = datetime('now')");
    setValues.push(String(categoryId));

    await c.env.DB.prepare(
      `UPDATE categories SET ${setClauses.join(', ')} WHERE id = ?`
    ).bind(...setValues).run();

    const updated = await c.env.DB.prepare('SELECT * FROM categories WHERE id = ?').bind(String(categoryId)).first();

    const user = c.get('user');
    await logAudit(c.env, user.id, 'UPDATE_CATEGORY', 'categories', String(categoryId), updates);

    return c.json({ document: updated });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// DELETE / — Delete category
categoryRoutes.delete('/', async (c) => {
  try {
    const categoryId = c.req.query('id');

    if (!categoryId) {
      return c.json({ error: 'Category ID required' }, 400);
    }

    await c.env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(categoryId).run();

    const user = c.get('user');
    await logAudit(c.env, user.id, 'DELETE_CATEGORY', 'categories', categoryId);

    return c.json({ success: true });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

export default categoryRoutes;
