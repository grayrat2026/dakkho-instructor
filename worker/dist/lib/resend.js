/**
 * Resend email helper for Cloudflare Workers
 * Uses REST API — NO Resend SDK!
 */
/**
 * Send an email via Resend REST API
 */
export async function sendEmail(env, to, subject, html) {
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: env.RESEND_FROM_EMAIL,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to send email' }));
        throw new Error(err.message || 'Failed to send email');
    }
    return res.json();
}
/**
 * Send a test email
 */
export async function sendTestEmail(env, to) {
    return sendEmail(env, to, 'DAKKHO Admin - Test Email', `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366f1;">DAKKHO Admin Panel</h1>
      <h2>Test Email</h2>
      <p>This is a test email from the DAKKHO Admin Panel (Cloudflare Workers).</p>
      <p>If you received this email, your email configuration is working correctly.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #6b7280; font-size: 12px;">
        Sent from DAKKHO Admin API on Cloudflare Workers<br />
        Timestamp: ${new Date().toISOString()}
      </p>
    </div>
    `);
}
