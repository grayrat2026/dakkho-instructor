/**
 * Users routes — GET, PUT, DELETE, POST /create-instructor
 * D1-only: No Appwrite dependencies
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import type { AuthVariables } from '../lib/auth';
import { adminAuthMiddleware } from '../lib/auth';
import { logAudit } from '../lib/audit';
import { getErrorMessage } from '../lib/utils';
import { hashPassword } from '../lib/auth-password';

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
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params: unknown[] = [];

    if (search) {
      where += ' AND full_name LIKE ?';
      params.push(`%${search}%`);
    }
    if (role) {
      where += ' AND role = ?';
      params.push(role);
    }
    if (status === 'active') {
      where += ' AND is_active = 1';
    }
    if (status === 'inactive') {
      where += ' AND is_active = 0';
    }

    const countResult = await c.env.DB.prepare(
      `SELECT COUNT(*) as total FROM users ${where}`
    ).bind(...params).first();

    const total = (countResult as any)?.total || 0;

    const result = await c.env.DB.prepare(
      `SELECT u.id, u.email, u.full_name, u.phone, u.bio, u.institute_id, u.technology, u.semester, u.avatar_url, u.role, u.email_verified, u.is_active, u.enrolled_course_ids, u.created_at, u.updated_at, i.name as institute_name, t.name as technology_name FROM users u LEFT JOIN institutes i ON u.institute_id = i.id LEFT JOIN technologies t ON u.technology = t.short_code ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`
    ).bind(...params, limit, offset).all();

    return c.json({ documents: result.results, total });
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

    // Build SET clause dynamically from allowed fields
    const allowedFields = ['full_name', 'phone', 'bio', 'institute_id', 'technology', 'semester', 'avatar_url', 'role', 'email_verified', 'is_active', 'enrolled_course_ids'];
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
    setValues.push(userId);

    await c.env.DB.prepare(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`
    ).bind(...setValues).run();

    // If admin deactivates a user, invalidate their student sessions
    if (updates.is_active === 0 || updates.is_active === false) {
      try {
        await c.env.DB.prepare(
          'DELETE FROM student_sessions WHERE user_id = ?'
        ).bind(userId).run();
      } catch {}
    }

    const updatedUser = await c.env.DB.prepare(
      'SELECT u.id, u.email, u.full_name, u.phone, u.bio, u.institute_id, u.technology, u.semester, u.avatar_url, u.role, u.email_verified, u.is_active, u.enrolled_course_ids, u.created_at, u.updated_at, i.name as institute_name, t.name as technology_name FROM users u LEFT JOIN institutes i ON u.institute_id = i.id LEFT JOIN technologies t ON u.technology = t.short_code WHERE u.id = ?'
    ).bind(userId).first();

    const user = c.get('user');
    await logAudit(c.env, user.id, 'UPDATE_USER', 'users', userId as string, updates);

    return c.json({ document: updatedUser });
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

    await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();

    const user = c.get('user');
    await logAudit(c.env, user.id, 'DELETE_USER', 'users', userId);

    return c.json({ success: true });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// POST /create-instructor — Create instructor account (user + instructor record)
userRoutes.post('/create-instructor', async (c) => {
  try {
    const body = await c.req.json<{
      fullName: string;
      email: string;
      password: string;
      phone?: string;
      department?: string;
      specialization?: string;
      title?: string;
      bio?: string;
      courseIds?: string[];
    }>();

    if (!body.fullName || !body.email || !body.password) {
      return c.json({ error: 'fullName, email, and password are required' }, 400);
    }

    if (body.password.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters' }, 400);
    }

    // Check if user already exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(body.email).first();

    if (existing) {
      // User exists — update their role to instructor
      const userId = (existing as any).id;
      const passwordHash = await hashPassword(body.password);

      await c.env.DB.prepare(
        `UPDATE users SET role = 'instructor', password_hash = ?, password_migrated = 1, full_name = ?, updated_at = ? WHERE id = ?`
      ).bind(passwordHash, body.fullName, new Date().toISOString(), userId).run();

      // Check if instructor record exists
      const existingInstructor = await c.env.DB.prepare(
        'SELECT id FROM instructors WHERE id = ?'
      ).bind(userId).first();

      if (existingInstructor) {
        // Update instructor record
        await c.env.DB.prepare(
          `UPDATE instructors SET name = ?, email = ?, specialization = ?, bio = ?, updated_at = ? WHERE id = ?`
        ).bind(
          body.fullName,
          body.email,
          body.specialization || null,
          body.bio || null,
          new Date().toISOString(),
          userId
        ).run();
      } else {
        // Create instructor record with same ID as user
        const avatarUrl = (await c.env.DB.prepare('SELECT avatar_url FROM users WHERE id = ?').bind(userId).first<{ avatar_url: string | null }>())?.avatar_url || null;

        await c.env.DB.prepare(`
          INSERT INTO instructors (id, name, email, bio, avatar_url, specialization, rating, total_students, total_courses, social_links, is_active)
          VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, '{}', 1)
        `).bind(
          userId,
          body.fullName,
          body.email,
          body.bio || null,
          avatarUrl,
          body.specialization || null
        ).run();
      }

      // Assign courses if provided
      if (body.courseIds && body.courseIds.length > 0) {
        for (const courseId of body.courseIds) {
          // Update course instructor_id
          try {
            await c.env.DB.prepare(
              "UPDATE courses SET instructor_id = ? WHERE id = ? AND instructor_id IS NULL"
            ).bind(userId, courseId).run();
          } catch {}

          // Add to course_instructors junction
          try {
            await c.env.DB.prepare(
              'INSERT OR IGNORE INTO course_instructors (course_id, instructor_id) VALUES (?, ?)'
            ).bind(courseId, userId).run();
          } catch {}
        }
      }

      const user = c.get('user');
      await logAudit(c.env, user.id, 'CREATE_INSTRUCTOR', 'users', userId, { email: body.email, fullName: body.fullName });

      return c.json({
        success: true,
        instructorId: userId,
        userId,
        message: 'Existing user promoted to instructor',
      });
    }

    // New user — create both user and instructor records
    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(body.password);

    // Create user with instructor role
    await c.env.DB.prepare(`
      INSERT INTO users (id, email, full_name, phone, bio, role, password_hash, password_migrated, is_active, email_verified)
      VALUES (?, ?, ?, ?, ?, 'instructor', ?, 1, 1, 0)
    `).bind(
      userId,
      body.email,
      body.fullName,
      body.phone || null,
      body.bio || null,
      passwordHash
    ).run();

    // Create instructor record with same ID
    await c.env.DB.prepare(`
      INSERT INTO instructors (id, name, email, bio, specialization, rating, total_students, total_courses, social_links, is_active)
      VALUES (?, ?, ?, ?, ?, 0, 0, 0, '{}', 1)
    `).bind(
      userId,
      body.fullName,
      body.email,
      body.bio || null,
      body.specialization || null
    ).run();

    // Assign courses if provided
    if (body.courseIds && body.courseIds.length > 0) {
      for (const courseId of body.courseIds) {
        try {
          await c.env.DB.prepare(
            'UPDATE courses SET instructor_id = ? WHERE id = ? AND instructor_id IS NULL'
          ).bind(userId, courseId).run();
        } catch {}

        try {
          await c.env.DB.prepare(
            'INSERT OR IGNORE INTO course_instructors (course_id, instructor_id) VALUES (?, ?)'
          ).bind(courseId, userId).run();
        } catch {}
      }
    }

    const user = c.get('user');
    await logAudit(c.env, user.id, 'CREATE_INSTRUCTOR', 'users', userId, { email: body.email, fullName: body.fullName });

    return c.json({
      success: true,
      instructorId: userId,
      userId,
      tempPassword: body.password,
    });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Create instructor error:', error);
    return c.json({ error: message }, 500);
  }
});

export default userRoutes;
