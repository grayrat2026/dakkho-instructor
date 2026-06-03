/**
 * Email routes — POST /test
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import type { AuthVariables } from '../lib/auth';
import { adminAuthMiddleware } from '../lib/auth';
import { sendTestEmail } from '../lib/resend';
import { logAudit } from '../lib/audit';
import { getErrorMessage } from '../lib/utils';

const emailRoutes = new Hono<{ Bindings: Env; Variables: AuthVariables }>();

// Apply auth middleware to all email routes
emailRoutes.use('*', adminAuthMiddleware);

// POST /test — Send test email
emailRoutes.post('/test', async (c) => {
  try {
    const { to } = await c.req.json<{ to: string }>();

    if (!to) {
      return c.json({ error: 'Recipient email is required' }, 400);
    }

    const result = await sendTestEmail(c.env, to);

    const user = c.get('user');
    await logAudit(c.env, user.id, 'SEND_TEST_EMAIL', 'email', undefined, { to });

    return c.json({ success: true, emailId: result.id });
  } catch (error) {
    const message = getErrorMessage(error);
    return c.json({ error: message }, 500);
  }
});

export default emailRoutes;
