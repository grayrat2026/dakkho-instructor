/**
 * Email routes — POST /test, POST /custom, POST /template
 */
import { Hono } from 'hono';
import { adminAuthMiddleware } from '../lib/auth';
import { sendEmail, sendTestEmail } from '../lib/resend';
import { logAudit } from '../lib/audit';
import { getErrorMessage } from '../lib/utils';
const emailRoutes = new Hono();
// Apply auth middleware to all email routes
emailRoutes.use('*', adminAuthMiddleware);
// POST /test — Send test email
emailRoutes.post('/test', async (c) => {
    try {
        const { to } = await c.req.json();
        if (!to) {
            return c.json({ error: 'Recipient email is required' }, 400);
        }
        const result = await sendTestEmail(c.env, to);
        const user = c.get('user');
        await logAudit(c.env, user.id, 'SEND_TEST_EMAIL', 'email', undefined, { to });
        return c.json({ success: true, emailId: result.id });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
// POST /custom — Send custom email with subject and HTML body
emailRoutes.post('/custom', async (c) => {
    try {
        const { to, subject, html } = await c.req.json();
        if (!to || !subject || !html) {
            return c.json({ error: 'Recipient, subject, and HTML body are required' }, 400);
        }
        const result = await sendEmail(c.env, to, subject, html);
        const user = c.get('user');
        await logAudit(c.env, user.id, 'SEND_CUSTOM_EMAIL', 'email', undefined, { to, subject });
        return c.json({ success: true, emailId: result.id });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
// POST /template — Send email using a template with variables
emailRoutes.post('/template', async (c) => {
    try {
        const { to, templateId, variables } = await c.req.json();
        if (!to || !templateId) {
            return c.json({ error: 'Recipient and template ID are required' }, 400);
        }
        // Template is rendered client-side, so the client sends the rendered HTML
        // But we also support server-side rendering for the template subject + html
        // The client sends: { to, templateId, subject, html, variables }
        // For now, the client pre-renders the template and sends via /custom
        // This endpoint exists for future server-side template rendering
        return c.json({ success: true, message: 'Use /custom endpoint with pre-rendered template HTML' });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
export default emailRoutes;
