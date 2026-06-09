/**
 * System routes — GET /status
 * D1-only: No Appwrite health check
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import type { AuthVariables } from '../lib/auth';
import { adminAuthMiddleware } from '../lib/auth';
import { checkBucket } from '../lib/r2';
import { getErrorMessage } from '../lib/utils';
import { logAudit } from '../lib/audit';
import type { ServiceStatus } from '../lib/types';

const systemRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// GET /status — Check all service statuses
systemRoutes.get('/status', async (c) => {
  try {
    const status: Record<string, unknown> = {};

    // --- D1 Database Check ---
    try {
      const result = await c.env.DB.prepare('SELECT 1 as ok').first();
      // Also count tables to verify schema is loaded
      const tableCount = await c.env.DB.prepare(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'"
      ).first<{ count: number }>();
      status.d1 = {
        status: 'connected',
        message: `D1 database working (${tableCount?.count || 0} tables)`,
      } as ServiceStatus;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      status.d1 = { status: 'error', message: msg } as ServiceStatus;
    }

    // --- R2 Bucket Checks ---
    status.r2 = {};
    const buckets: Record<string, { binding: R2Bucket; name: string }> = {
      videos: { binding: c.env.R2_VIDEOS, name: 'dakkho-videos' },
      thumbnails: { binding: c.env.R2_THUMBNAILS, name: 'dakkho-thumbnails' },
      avatars: { binding: c.env.R2_AVATARS, name: 'dakkho-avatars' },
      resources: { binding: c.env.R2_RESOURCES, name: 'dakkho-resources' },
    };

    for (const [name, { binding, name: bucketName }] of Object.entries(buckets)) {
      try {
        const ok = await checkBucket(binding);
        (status.r2 as Record<string, ServiceStatus>)[name] = ok
          ? { status: 'connected', message: `Bucket "${bucketName}" accessible` }
          : { status: 'error', message: `Bucket "${bucketName}" not found or inaccessible` };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        (status.r2 as Record<string, ServiceStatus>)[name] = { status: 'error', message: msg };
      }
    }

    // --- Workers KV Check ---
    try {
      await c.env.KV_CONFIG.put('_health_check', 'ok', { expirationTtl: 60 });
      const val = await c.env.KV_CONFIG.get('_health_check');
      status.kv = val === 'ok'
        ? { status: 'connected', message: 'Workers KV working' } as ServiceStatus
        : { status: 'error', message: 'KV read/write mismatch' } as ServiceStatus;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      status.kv = { status: 'error', message: msg } as ServiceStatus;
    }

    // --- Email (Resend) Check ---
    try {
      if (c.env.RESEND_API_KEY) {
        status.email = { status: 'connected', message: 'Resend API key configured' } as ServiceStatus;
      } else {
        status.email = { status: 'error', message: 'Resend API key not configured' } as ServiceStatus;
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      status.email = { status: 'error', message: msg } as ServiceStatus;
    }

    return c.json(status);
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

// POST /api-key — Update D1 admin key (stores in KV for hot-reload)
systemRoutes.post('/api-key', adminAuthMiddleware, async (c) => {
  try {
    const { apiKey } = await c.req.json<{ apiKey: string }>();

    if (!apiKey) {
      return c.json({ error: 'API key is required' }, 400);
    }

    // Store the key in KV for reference
    await c.env.KV_CONFIG.put('admin_api_key_override', apiKey);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'UPDATE_API_KEY', 'system', undefined, {
      keyPrefix: apiKey.substring(0, 20) + '...',
    });

    return c.json({
      success: true,
      message: 'API key stored in KV.',
    });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

export default systemRoutes;
