/**
 * Users routes — GET, PUT, DELETE
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import type { AuthVariables } from '../lib/auth';
import { adminAuthMiddleware } from '../lib/auth';
import { listDocuments, updateDocument, deleteDocument, Query } from '../lib/appwrite';
import { APPWRITE_COLLECTIONS } from '../lib/types';
import { logAudit } from '../lib/audit';
import { getErrorMessage } from '../lib/utils';

const userRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// Apply auth middleware to all user routes
userRoutes.use('*', adminAuthMiddleware);

// GET / — List users
userRoutes.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const search = c.req.query('search') || '';
    const role = c.req.query('role') || '';
    const status = c.req.query('status') || '';

    const queries: string[] = [];
    if (search) queries.push(Query.search('fullName', search));
    if (role) queries.push(Query.equal('role', role));
    if (status === 'active') queries.push(Query.equal('isActive', true));
    if (status === 'inactive') queries.push(Query.equal('isActive', false));

    queries.push(Query.limit(limit));
    queries.push(Query.offset((page - 1) * limit));
    queries.push(Query.orderDesc('$createdAt'));

    const result = await listDocuments(c.env, APPWRITE_COLLECTIONS.USERS, queries);

    return c.json({ documents: result.documents, total: result.total });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// PUT / — Update user
userRoutes.put('/', async (c) => {
  try {
    const data = await c.req.json<Record<string, unknown>>();
    const { userId, ...updates } = data;

    if (!userId) {
      return c.json({ error: 'User ID required' }, 400);
    }

    const result = await updateDocument(c.env, APPWRITE_COLLECTIONS.USERS, userId as string, updates);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'UPDATE_USER', 'users', userId as string, updates);

    return c.json({ document: result });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// DELETE / — Delete user
userRoutes.delete('/', async (c) => {
  try {
    const userId = c.req.query('id');

    if (!userId) {
      return c.json({ error: 'User ID required' }, 400);
    }

    await deleteDocument(c.env, APPWRITE_COLLECTIONS.USERS, userId);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'DELETE_USER', 'users', userId);

    return c.json({ success: true });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

export default userRoutes;
