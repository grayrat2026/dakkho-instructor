/**
 * Institutes routes — GET, POST, PUT, DELETE
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import type { AuthVariables } from '../lib/auth';
import { adminAuthMiddleware } from '../lib/auth';
import { listDocuments, createDocument, updateDocument, deleteDocument, Query } from '../lib/appwrite';
import { APPWRITE_COLLECTIONS } from '../lib/types';
import { logAudit } from '../lib/audit';
import { getErrorMessage } from '../lib/utils';

const instituteRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// Apply auth middleware to all institute routes
instituteRoutes.use('*', adminAuthMiddleware);

// GET / — List institutes
instituteRoutes.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');

    const queries: string[] = [
      Query.limit(limit),
      Query.offset((page - 1) * limit),
      Query.orderDesc('$createdAt'),
    ];

    const result = await listDocuments(c.env, APPWRITE_COLLECTIONS.INSTITUTES, queries);

    return c.json({ documents: result.documents, total: result.total });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// POST / — Create institute
instituteRoutes.post('/', async (c) => {
  try {
    const data = await c.req.json<Record<string, unknown>>();
    const result = await createDocument(c.env, APPWRITE_COLLECTIONS.INSTITUTES, data);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'CREATE_INSTITUTE', 'institutes', result.$id, data);

    return c.json({ document: result });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// PUT / — Update institute
instituteRoutes.put('/', async (c) => {
  try {
    const data = await c.req.json<Record<string, unknown>>();
    const { instituteId, ...updates } = data;

    if (!instituteId) {
      return c.json({ error: 'Institute ID required' }, 400);
    }

    const result = await updateDocument(c.env, APPWRITE_COLLECTIONS.INSTITUTES, String(instituteId), updates);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'UPDATE_INSTITUTE', 'institutes', String(instituteId), updates);

    return c.json({ document: result });
  } catch (error) {
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

    await deleteDocument(c.env, APPWRITE_COLLECTIONS.INSTITUTES, instituteId);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'DELETE_INSTITUTE', 'institutes', instituteId);

    return c.json({ success: true });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

export default instituteRoutes;
