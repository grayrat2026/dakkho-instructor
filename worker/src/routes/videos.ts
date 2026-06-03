/**
 * Videos routes — GET, POST, PUT, DELETE
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import type { AuthVariables } from '../lib/auth';
import { adminAuthMiddleware } from '../lib/auth';
import { listDocuments, createDocument, updateDocument, deleteDocument, Query } from '../lib/appwrite';
import { APPWRITE_COLLECTIONS } from '../lib/types';
import { logAudit } from '../lib/audit';
import { getErrorMessage } from '../lib/utils';

const videoRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// Apply auth middleware to all video routes
videoRoutes.use('*', adminAuthMiddleware);

// GET / — List videos
videoRoutes.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const courseId = c.req.query('courseId') || '';
    const published = c.req.query('published') || '';

    const queries: string[] = [];
    if (courseId) queries.push(Query.equal('courseId', courseId));
    if (published === 'true') queries.push(Query.equal('isPublished', true));
    if (published === 'false') queries.push(Query.equal('isPublished', false));

    queries.push(Query.limit(limit));
    queries.push(Query.offset((page - 1) * limit));
    queries.push(Query.orderAsc('order'));

    const result = await listDocuments(c.env, APPWRITE_COLLECTIONS.VIDEOS, queries);

    return c.json({ documents: result.documents, total: result.total });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// POST / — Create video
videoRoutes.post('/', async (c) => {
  try {
    const data = await c.req.json<Record<string, unknown>>();
    const result = await createDocument(c.env, APPWRITE_COLLECTIONS.VIDEOS, data);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'CREATE_VIDEO', 'videos', result.$id, data);

    return c.json({ document: result });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// PUT / — Update video
videoRoutes.put('/', async (c) => {
  try {
    const data = await c.req.json<Record<string, unknown>>();
    const { videoId, ...updates } = data;

    if (!videoId) {
      return c.json({ error: 'Video ID required' }, 400);
    }

    const result = await updateDocument(c.env, APPWRITE_COLLECTIONS.VIDEOS, String(videoId), updates);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'UPDATE_VIDEO', 'videos', String(videoId), updates);

    return c.json({ document: result });
  } catch (error) {
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

    await deleteDocument(c.env, APPWRITE_COLLECTIONS.VIDEOS, videoId);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'DELETE_VIDEO', 'videos', videoId);

    return c.json({ success: true });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

export default videoRoutes;
