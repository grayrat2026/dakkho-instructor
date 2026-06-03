/**
 * Notifications routes — GET, POST
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import type { AuthVariables } from '../lib/auth';
import { adminAuthMiddleware } from '../lib/auth';
import { listDocuments, createDocument, Query } from '../lib/appwrite';
import { APPWRITE_COLLECTIONS } from '../lib/types';
import { logAudit } from '../lib/audit';
import { getErrorMessage } from '../lib/utils';

const notificationRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// Apply auth middleware to all notification routes
notificationRoutes.use('*', adminAuthMiddleware);

// GET / — List notifications
notificationRoutes.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const userId = c.req.query('userId') || '';

    const queries: string[] = [
      Query.limit(limit),
      Query.offset((page - 1) * limit),
      Query.orderDesc('$createdAt'),
    ];
    if (userId) queries.push(Query.equal('userId', userId));

    const result = await listDocuments(c.env, APPWRITE_COLLECTIONS.NOTIFICATIONS, queries);

    return c.json({ documents: result.documents, total: result.total });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// POST / — Send notification(s)
notificationRoutes.post('/', async (c) => {
  try {
    const data = await c.req.json<{
      targetAll?: boolean;
      targetUserId?: string;
      targetInstitute?: string;
      [key: string]: unknown;
    }>();

    const { targetAll, targetUserId, targetInstitute, ...notificationData } = data;
    const created: Record<string, unknown>[] = [];

    if (targetAll) {
      // Send to all users — paginate through users
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const usersResult = await listDocuments(c.env, APPWRITE_COLLECTIONS.USERS, [
          Query.limit(limit),
          Query.offset(offset),
        ]);

        for (const user of usersResult.documents) {
          const userObj = user as { $id: string };
          const doc = await createDocument(c.env, APPWRITE_COLLECTIONS.NOTIFICATIONS, {
            ...notificationData,
            userId: userObj.$id,
          });
          created.push(doc);
        }

        offset += limit;
        hasMore = usersResult.documents.length === limit;
      }
    } else if (targetInstitute) {
      // Send to all users in an institute
      const usersResult = await listDocuments(c.env, APPWRITE_COLLECTIONS.USERS, [
        Query.equal('institute', targetInstitute),
        Query.limit(500),
      ]);

      for (const user of usersResult.documents) {
        const userObj = user as { $id: string };
        const doc = await createDocument(c.env, APPWRITE_COLLECTIONS.NOTIFICATIONS, {
          ...notificationData,
          userId: userObj.$id,
        });
        created.push(doc);
      }
    } else if (targetUserId) {
      // Send to specific user
      const doc = await createDocument(c.env, APPWRITE_COLLECTIONS.NOTIFICATIONS, {
        ...notificationData,
        userId: targetUserId,
      });
      created.push(doc);
    } else {
      return c.json({ error: 'Specify targetAll, targetUserId, or targetInstitute' }, 400);
    }

    const user = c.get('user');
    await logAudit(c.env, user.id, 'SEND_NOTIFICATION', 'notifications', undefined, {
      targetAll,
      targetUserId,
      targetInstitute,
      count: created.length,
    });

    return c.json({ created, count: created.length });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

export default notificationRoutes;
