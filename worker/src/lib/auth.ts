/**
 * Auth middleware for DAKKHO Admin API on Cloudflare Workers
 * Checks Bearer token against D1 admin_sessions table
 */

import { Context, Next } from 'hono';
import type { Env } from '../env';

// Extend Hono's context variables
export type AuthVariables = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

/**
 * Admin auth middleware — validates Bearer token from D1 sessions
 * Sets c.set('user', ...) for downstream handlers
 */
export async function adminAuthMiddleware(c: Context<{ Bindings: Env; Variables: AuthVariables }>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Authentication required. Provide Authorization: Bearer <token>' }, 401);
  }

  const token = authHeader.substring(7);

  if (!token) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  try {
    // Look up session in D1 by session ID (token = sessionId in our auth model)
    const session = await c.env.DB.prepare(
      'SELECT id, user_id, email, name, role, expires_at, is_active FROM admin_sessions WHERE id = ? AND is_active = 1'
    )
      .bind(token)
      .first<{ id: string; user_id: string; email: string; name: string; role: string; expires_at: string; is_active: number }>();

    if (!session) {
      return c.json({ error: 'Invalid or expired session' }, 401);
    }

    // Check expiration
    const expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
      // Mark session as inactive
      await c.env.DB.prepare(
        'UPDATE admin_sessions SET is_active = 0 WHERE id = ?'
      ).bind(token).run();

      return c.json({ error: 'Session expired. Please login again.' }, 401);
    }

    // Set user info for downstream handlers
    c.set('user', {
      id: session.user_id,
      email: session.email,
      name: session.name || '',
      role: session.role,
    });

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
}

/**
 * Optional auth middleware — sets user if token provided, but doesn't require it
 */
export async function optionalAuthMiddleware(c: Context<{ Bindings: Env; Variables: AuthVariables }>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const session = await c.env.DB.prepare(
        'SELECT id, user_id, email, name, role, expires_at, is_active FROM admin_sessions WHERE id = ? AND is_active = 1'
      )
        .bind(token)
        .first<{ id: string; user_id: string; email: string; name: string; role: string; expires_at: string; is_active: number }>();

      if (session && new Date(session.expires_at) > new Date()) {
        c.set('user', {
          id: session.user_id,
          email: session.email,
          name: session.name || '',
          role: session.role,
        });
      }
    } catch {
      // Ignore auth errors for optional middleware
    }
  }

  await next();
}
