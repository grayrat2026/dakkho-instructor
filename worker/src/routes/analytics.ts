/**
 * Analytics routes — GET
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import type { AuthVariables } from '../lib/auth';
import { adminAuthMiddleware } from '../lib/auth';
import { listDocuments, Query } from '../lib/appwrite';
import { APPWRITE_COLLECTIONS } from '../lib/types';
import { getErrorMessage } from '../lib/utils';

const analyticsRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// Apply auth middleware
analyticsRoutes.use('*', adminAuthMiddleware);

// GET / — Get analytics stats
analyticsRoutes.get('/', async (c) => {
  try {
    const [usersRes, coursesRes, videosRes, enrollmentsRes] = await Promise.all([
      listDocuments(c.env, APPWRITE_COLLECTIONS.USERS, [Query.limit(1)]),
      listDocuments(c.env, APPWRITE_COLLECTIONS.COURSES, [Query.limit(1)]),
      listDocuments(c.env, APPWRITE_COLLECTIONS.VIDEOS, [Query.limit(1)]),
      listDocuments(c.env, APPWRITE_COLLECTIONS.ENROLLMENTS, [Query.limit(1)]),
    ]);

    const stats = {
      totalUsers: usersRes.total,
      totalCourses: coursesRes.total,
      totalVideos: videosRes.total,
      totalEnrollments: enrollmentsRes.total,
      activeSessions: 0,
      newSignupsToday: 0,
    };

    // Try to get today's signups
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const recentUsers = await listDocuments(c.env, APPWRITE_COLLECTIONS.USERS, [
        Query.greaterThanEqual('$createdAt', today.toISOString()),
        Query.limit(1),
      ]);
      stats.newSignupsToday = recentUsers.total;
    } catch {
      // Ignore — may fail if query not indexed
    }

    // Get recent enrollments and popular courses in parallel
    const [recentEnrollments, popularCourses] = await Promise.all([
      listDocuments(c.env, APPWRITE_COLLECTIONS.ENROLLMENTS, [
        Query.limit(10),
        Query.orderDesc('$createdAt'),
      ]),
      listDocuments(c.env, APPWRITE_COLLECTIONS.COURSES, [
        Query.limit(5),
        Query.orderDesc('totalStudents'),
      ]),
    ]);

    // Get active sessions from D1
    try {
      const activeSessions = await c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM admin_sessions WHERE is_active = 1 AND expires_at > datetime('now')"
      ).first<{ count: number }>();
      stats.activeSessions = activeSessions?.count || 0;
    } catch {
      // Ignore D1 errors
    }

    return c.json({
      stats,
      recentEnrollments: recentEnrollments.documents,
      popularCourses: popularCourses.documents,
    });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

export default analyticsRoutes;
