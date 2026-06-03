/**
 * Courses routes — GET, POST, PUT, DELETE
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import type { AuthVariables } from '../lib/auth';
import { adminAuthMiddleware } from '../lib/auth';
import { listDocuments, createDocument, updateDocument, deleteDocument, Query } from '../lib/appwrite';
import { APPWRITE_COLLECTIONS } from '../lib/types';
import { logAudit } from '../lib/audit';
import { getErrorMessage } from '../lib/utils';

const courseRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// Apply auth middleware to all course routes
courseRoutes.use('*', adminAuthMiddleware);

// GET / — List courses
courseRoutes.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const search = c.req.query('search') || '';
    const level = c.req.query('level') || '';
    const published = c.req.query('published') || '';
    const featured = c.req.query('featured') || '';

    const queries: string[] = [];
    if (search) queries.push(Query.search('title', search));
    if (level) queries.push(Query.equal('level', level));
    if (published === 'true') queries.push(Query.equal('isPublished', true));
    if (published === 'false') queries.push(Query.equal('isPublished', false));
    if (featured === 'true') queries.push(Query.equal('isFeatured', true));

    queries.push(Query.limit(limit));
    queries.push(Query.offset((page - 1) * limit));
    queries.push(Query.orderDesc('$createdAt'));

    const result = await listDocuments(c.env, APPWRITE_COLLECTIONS.COURSES, queries);

    return c.json({ documents: result.documents, total: result.total });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// POST / — Create course
courseRoutes.post('/', async (c) => {
  try {
    const data = await c.req.json<Record<string, unknown>>();
    const result = await createDocument(c.env, APPWRITE_COLLECTIONS.COURSES, data);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'CREATE_COURSE', 'courses', result.$id, data);

    return c.json({ document: result });
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

    const result = await updateDocument(c.env, APPWRITE_COLLECTIONS.COURSES, String(courseId), updates);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'UPDATE_COURSE', 'courses', String(courseId), updates);

    return c.json({ document: result });
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

    await deleteDocument(c.env, APPWRITE_COLLECTIONS.COURSES, courseId);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'DELETE_COURSE', 'courses', courseId);

    return c.json({ success: true });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

export default courseRoutes;
