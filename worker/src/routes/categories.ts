/**
 * Categories routes — GET, POST, PUT, DELETE
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import type { AuthVariables } from '../lib/auth';
import { adminAuthMiddleware } from '../lib/auth';
import { listDocuments, createDocument, updateDocument, deleteDocument, Query } from '../lib/appwrite';
import { APPWRITE_COLLECTIONS } from '../lib/types';
import { logAudit } from '../lib/audit';
import { getErrorMessage } from '../lib/utils';

const categoryRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// Apply auth middleware to all category routes
categoryRoutes.use('*', adminAuthMiddleware);

// GET / — List categories
categoryRoutes.get('/', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');

    const result = await listDocuments(c.env, APPWRITE_COLLECTIONS.CATEGORIES, [
      Query.limit(limit),
      Query.orderAsc('sort_order'),
    ]);

    return c.json({ documents: result.documents, total: result.total });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// POST / — Create category
categoryRoutes.post('/', async (c) => {
  try {
    const data = await c.req.json<Record<string, unknown>>();
    const result = await createDocument(c.env, APPWRITE_COLLECTIONS.CATEGORIES, data);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'CREATE_CATEGORY', 'categories', result.$id, data);

    return c.json({ document: result });
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

    const result = await updateDocument(c.env, APPWRITE_COLLECTIONS.CATEGORIES, String(categoryId), updates);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'UPDATE_CATEGORY', 'categories', String(categoryId), updates);

    return c.json({ document: result });
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

    await deleteDocument(c.env, APPWRITE_COLLECTIONS.CATEGORIES, categoryId);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'DELETE_CATEGORY', 'categories', categoryId);

    return c.json({ success: true });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

export default categoryRoutes;
