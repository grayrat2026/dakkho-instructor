/**
 * Institutes routes — GET, POST, PUT, DELETE
 * D1-only: No Appwrite dependencies
 */
import { Hono } from 'hono';
import { adminAuthMiddleware } from '../lib/auth';
import { logAudit } from '../lib/audit';
import { getErrorMessage } from '../lib/utils';
const instituteRoutes = new Hono();
// Apply auth middleware to all institute routes
instituteRoutes.use('*', adminAuthMiddleware);
// GET / — List institutes
instituteRoutes.get('/', async (c) => {
    try {
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '20');
        const offset = (page - 1) * limit;
        const countResult = await c.env.DB.prepare('SELECT COUNT(*) as total FROM institutes').first();
        const total = countResult?.total || 0;
        const result = await c.env.DB.prepare('SELECT * FROM institutes ORDER BY created_at DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
        return c.json({ documents: result.results, total });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
// POST / — Create institute
instituteRoutes.post('/', async (c) => {
    try {
        const data = await c.req.json();
        await c.env.DB.prepare(`
      INSERT INTO institutes (name, name_bn, division, district, eiin_number, type, is_requested, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(data.name || '', data.name_bn || null, data.division || null, data.district || null, data.eiin_number || null, data.type || 'polytechnic', data.is_requested ? 1 : 0, data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1).run();
        const created = await c.env.DB.prepare('SELECT * FROM institutes WHERE rowid = last_insert_rowid()').first();
        const user = c.get('user');
        await logAudit(c.env, user.id, 'CREATE_INSTITUTE', 'institutes', String(created?.id), data);
        return c.json({ document: created });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
// PUT / — Update institute
instituteRoutes.put('/', async (c) => {
    try {
        const data = await c.req.json();
        const { instituteId, ...updates } = data;
        if (!instituteId) {
            return c.json({ error: 'Institute ID required' }, 400);
        }
        const allowedFields = ['name', 'name_bn', 'division', 'district', 'eiin_number', 'type', 'is_requested', 'requested_by', 'approved_by', 'approved_at', 'is_active'];
        const setClauses = [];
        const setValues = [];
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                if (key === 'is_requested' || key === 'is_active') {
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
        setValues.push(String(instituteId));
        await c.env.DB.prepare(`UPDATE institutes SET ${setClauses.join(', ')} WHERE id = ?`).bind(...setValues).run();
        const updated = await c.env.DB.prepare('SELECT * FROM institutes WHERE id = ?').bind(String(instituteId)).first();
        const user = c.get('user');
        await logAudit(c.env, user.id, 'UPDATE_INSTITUTE', 'institutes', String(instituteId), updates);
        return c.json({ document: updated });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
// DELETE / — Delete institute
instituteRoutes.delete('/', async (c) => {
    try {
        const instituteId = c.req.query('id');
        if (!instituteId) {
            return c.json({ error: 'Institute ID required' }, 400);
        }
        await c.env.DB.prepare('DELETE FROM institutes WHERE id = ?').bind(instituteId).run();
        const user = c.get('user');
        await logAudit(c.env, user.id, 'DELETE_INSTITUTE', 'institutes', instituteId);
        return c.json({ success: true });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
export default instituteRoutes;
