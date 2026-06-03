/**
 * Instructors routes — GET, POST, PUT, DELETE
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import type { AuthVariables } from '../lib/auth';
import { adminAuthMiddleware } from '../lib/auth';
import { listDocuments, createDocument, updateDocument, deleteDocument, Query } from '../lib/appwrite';
import { APPWRITE_COLLECTIONS } from '../lib/types';
import { logAudit } from '../lib/audit';
import { getErrorMessage } from '../lib/utils';

const instructorRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// Apply auth middleware to all instructor routes
instructorRoutes.use('*', adminAuthMiddleware);

// GET / — List instructors
instructorRoutes.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const search = c.req.query('search') || '';

    const queries: string[] = [];
    if (search) queries.push(Query.search('name', search));
    queries.push(Query.limit(limit));
    queries.push(Query.offset((page - 1) * limit));
    queries.push(Query.orderDesc('$createdAt'));

    const result = await listDocuments(c.env, APPWRITE_COLLECTIONS.INSTRUCTORS, queries);

    return c.json({ documents: result.documents, total: result.total });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// POST / — Create instructor
instructorRoutes.post('/', async (c) => {
  try {
    const data = await c.req.json<Record<string, unknown>>();
    const result = await createDocument(c.env, APPWRITE_COLLECTIONS.INSTRUCTORS, data);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'CREATE_INSTRUCTOR', 'instructors', result.$id, data);

    return c.json({ document: result });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// PUT / — Update instructor
instructorRoutes.put('/', async (c) => {
  try {
    const data = await c.req.json<Record<string, unknown>>();
    const { instructorId, ...updates } = data;

    if (!instructorId) {
      return c.json({ error: 'Instructor ID required' }, 400);
    }

    const result = await updateDocument(c.env, APPWRITE_COLLECTIONS.INSTRUCTORS, String(instructorId), updates);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'UPDATE_INSTRUCTOR', 'instructors', String(instructorId), updates);

    return c.json({ document: result });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// DELETE / — Delete instructor
instructorRoutes.delete('/', async (c) => {
  try {
    const instructorId = c.req.query('id');

    if (!instructorId) {
      return c.json({ error: 'Instructor ID required' }, 400);
    }

    await deleteDocument(c.env, APPWRITE_COLLECTIONS.INSTRUCTORS, instructorId);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'DELETE_INSTRUCTOR', 'instructors', instructorId);

    return c.json({ success: true });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

export default instructorRoutes;
