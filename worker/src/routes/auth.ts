/**
 * Auth routes — POST /login, POST /check, DELETE /logout
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import type { AuthVariables } from '../lib/auth';
import { adminAuthMiddleware } from '../lib/auth';
import { createSession, getAccount, deleteSession } from '../lib/appwrite';
import { generateId, getSessionExpiry, getErrorMessage } from '../lib/utils';
import { logAudit } from '../lib/audit';

const authRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// POST /login — Create admin session
authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json<{ email: string; password: string }>();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Step 1: Create Appwrite email session
    const { sessionCookie } = await createSession(c.env, email, password);

    // Step 2: Get account info using the session cookie
    const user = await getAccount(c.env, sessionCookie);

    // Step 3: Check admin role from preferences
    const userPrefs = (user as { prefs?: Record<string, unknown> }).prefs || {};

    if (userPrefs?.role !== 'admin') {
      // Delete the Appwrite session
      await deleteSession(c.env, sessionCookie);
      return c.json(
        { error: 'Access denied. Admin role required. Your account does not have admin privileges.' },
        403
      );
    }

    const userId = (user as { $id: string }).$id;
    const userEmail = (user as { email: string }).email;
    const userName = (user as { name: string }).name;

    // Step 4: Create admin session in D1
    const expiresAt = getSessionExpiry(7);
    const sessionId = generateId();

    // Delete any existing sessions for this user (active or inactive)
    await c.env.DB.prepare(
      'DELETE FROM admin_sessions WHERE user_id = ?'
    ).bind(userId).run();

    await c.env.DB.prepare(
      `INSERT INTO admin_sessions (id, user_id, email, name, role, ip_address, user_agent, expires_at, is_active)
       VALUES (?, ?, ?, ?, 'admin', ?, ?, ?, 1)`
    )
      .bind(
        sessionId,
        userId,
        userEmail,
        userName,
        c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
        c.req.header('user-agent') || 'unknown',
        expiresAt
      )
      .run();

    // Step 5: Delete the Appwrite session (we use our own token-based auth)
    await deleteSession(c.env, sessionCookie);

    // Step 6: Return success with session token
    return c.json({
      success: true,
      token: sessionId, // Token = session ID (secure, random, non-guessable)
      user: { id: userId, email: userEmail, name: userName, role: 'admin' },
    });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Login error:', error);
    return c.json({ error: message }, 401);
  }
});

// POST /check — Verify if session is valid
authRoutes.post('/check', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ authenticated: false }, 401);
    }

    const token = authHeader.substring(7);

    // Look up session by session ID (the token is now the session ID, not user_id)
    const session = await c.env.DB.prepare(
      'SELECT id, user_id, email, name, role, expires_at, is_active FROM admin_sessions WHERE id = ? AND is_active = 1'
    )
      .bind(token)
      .first<{ id: string; user_id: string; email: string; name: string; role: string; expires_at: string; is_active: number }>();

    if (!session || new Date(session.expires_at) < new Date()) {
      return c.json({ authenticated: false }, 401);
    }

    return c.json({
      authenticated: true,
      user: { id: session.user_id, email: session.email, name: session.name, role: session.role },
    });
  } catch {
    return c.json({ authenticated: false }, 401);
  }
});

// DELETE /logout — Invalidate admin session
authRoutes.delete('/logout', adminAuthMiddleware, async (c) => {
  try {
    const user = c.get('user');

    await c.env.DB.prepare(
      'UPDATE admin_sessions SET is_active = 0 WHERE user_id = ?'
    ).bind(user.id).run();

    return c.json({ success: true });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

export default authRoutes;
