/**
 * Payment Gateway Helpers
 * Supports: Manual, SSLCommerz (plug & play), bKash (plug & play)
 */
export function getSSLCommerzBaseURL(sandbox) {
    return sandbox
        ? 'https://sandbox.sslcommerz.com'
        : 'https://securepay.sslcommerz.com';
}
export async function createSSLCommerzSession(env, params) {
    if (!env.SSLCOMMERZ_STORE_ID || !env.SSLCOMMERZ_STORE_PASSWORD) {
        return { error: 'SSLCommerz not configured. Set store credentials in Admin Panel.' };
    }
    const config = {
        store_id: env.SSLCOMMERZ_STORE_ID,
        store_password: env.SSLCOMMERZ_STORE_PASSWORD,
        sandbox: true, // Will read from payment_config
    };
    const baseURL = getSSLCommerzBaseURL(config.sandbox);
    const body = new URLSearchParams({
        store_id: config.store_id,
        store_passwd: config.store_password,
        total_amount: params.total_amount.toString(),
        currency: params.currency,
        tran_id: params.tran_id,
        success_url: params.success_url,
        fail_url: params.fail_url,
        cancel_url: params.cancel_url,
        cus_name: params.cus_name,
        cus_email: params.cus_email,
        cus_phone: params.cus_phone,
        cus_add1: params.cus_add1,
        cus_city: params.cus_city,
        product_name: params.product_name,
        product_category: params.product_category,
        product_profile: params.product_profile,
    });
    try {
        const response = await fetch(`${baseURL}/gwprocess/v4/api.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });
        const result = await response.json();
        if (result.status === 'SUCCESS') {
            return {
                sessionUrl: result.GatewayPageURL,
                sessionKey: result.sessionkey,
            };
        }
        else {
            return { error: result.failedreason || 'SSLCommerz session creation failed' };
        }
    }
    catch (error) {
        return { error: error instanceof Error ? error.message : 'SSLCommerz request failed' };
    }
}
export async function verifySSLCommerzPayment(env, tranId, valId) {
    if (!env.SSLCOMMERZ_STORE_ID || !env.SSLCOMMERZ_STORE_PASSWORD) {
        return false;
    }
    const baseURL = getSSLCommerzBaseURL(true); // Check sandbox config
    try {
        const response = await fetch(`${baseURL}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${env.SSLCOMMERZ_STORE_ID}&store_passwd=${env.SSLCOMMERZ_STORE_PASSWORD}&v=1&format=json`);
        const result = await response.json();
        return result.status === 'VALID' || result.status === 'VALIDATED';
    }
    catch {
        return false;
    }
}
export function getBkashBaseURL(sandbox) {
    return sandbox
        ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
        : 'https://tokenized.pay.bka.sh/v1.2.0-beta';
}
async function getBkashToken(env) {
    if (!env.BKASH_USERNAME || !env.BKASH_PASSWORD || !env.BKASH_APP_KEY || !env.BKASH_APP_SECRET) {
        return null;
    }
    const baseURL = getBkashBaseURL(true); // Check sandbox config
    try {
        const response = await fetch(`${baseURL}/tokenized/checkout/token/grant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                username: env.BKASH_USERNAME,
                password: env.BKASH_PASSWORD,
            },
            body: JSON.stringify({
                app_key: env.BKASH_APP_KEY,
                app_secret: env.BKASH_APP_SECRET,
            }),
        });
        const result = await response.json();
        return result.id_token || null;
    }
    catch {
        return null;
    }
}
export async function createBkashPayment(env, params) {
    const token = await getBkashToken(env);
    if (!token) {
        return { error: 'bKash not configured. Set credentials in Admin Panel.' };
    }
    const baseURL = getBkashBaseURL(true);
    try {
        const response = await fetch(`${baseURL}/tokenized/checkout/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
                'x-app-key': env.BKASH_APP_KEY,
            },
            body: JSON.stringify({
                mode: '0011',
                payerReference: params.merchantInvoiceNumber,
                callbackURL: params.successUrl,
                amount: params.amount.toString(),
                currency: params.currency || 'BDT',
                intent: params.intent || 'sale',
                merchantInvoiceNumber: params.merchantInvoiceNumber,
            }),
        });
        const result = await response.json();
        if (result.bkashURL) {
            return {
                paymentURL: result.bkashURL,
                paymentID: result.paymentID,
            };
        }
        else {
            return { error: result.errorMessage || 'bKash payment creation failed' };
        }
    }
    catch (error) {
        return { error: error instanceof Error ? error.message : 'bKash request failed' };
    }
}
export async function executeBkashPayment(env, paymentID) {
    const token = await getBkashToken(env);
    if (!token) {
        return { error: 'bKash not configured' };
    }
    const baseURL = getBkashBaseURL(true);
    try {
        const response = await fetch(`${baseURL}/tokenized/checkout/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
                'x-app-key': env.BKASH_APP_KEY,
            },
            body: JSON.stringify({ paymentID }),
        });
        const result = await response.json();
        if (result.statusCode === '0000') {
            return {
                status: result.transactionStatus,
                trxID: result.trxID,
            };
        }
        else {
            return { error: result.errorMessage || 'bKash payment execution failed' };
        }
    }
    catch (error) {
        return { error: error instanceof Error ? error.message : 'bKash execution failed' };
    }
}
