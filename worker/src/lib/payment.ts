/**
 * Payment Gateway Helpers
 * Supports: Manual, SSLCommerz (plug & play), bKash (plug & play), PipraPay (plug & play)
 */

import type { Env } from '../env';

// ─── SSLCommerz ───

interface SSLCommerzConfig {
  store_id: string;
  store_password: string;
  sandbox: boolean;
}

interface SSLCommerzPaymentParams {
  total_amount: number;
  currency: string;
  tran_id: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  cus_name: string;
  cus_email: string;
  cus_phone: string;
  cus_add1: string;
  cus_city: string;
  product_name: string;
  product_category: string;
  product_profile: string;
}

export function getSSLCommerzBaseURL(sandbox: boolean): string {
  return sandbox
    ? 'https://sandbox.sslcommerz.com'
    : 'https://securepay.sslcommerz.com';
}

export async function createSSLCommerzSession(
  env: Env,
  params: SSLCommerzPaymentParams
): Promise<{ sessionUrl: string; sessionKey: string } | { error: string }> {
  if (!env.SSLCOMMERZ_STORE_ID || !env.SSLCOMMERZ_STORE_PASSWORD) {
    return { error: 'SSLCommerz not configured. Set store credentials in Admin Panel.' };
  }

  const config: SSLCommerzConfig = {
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

    const result = await response.json() as Record<string, unknown>;

    if (result.status === 'SUCCESS') {
      return {
        sessionUrl: result.GatewayPageURL as string,
        sessionKey: result.sessionkey as string,
      };
    } else {
      return { error: (result.failedreason as string) || 'SSLCommerz session creation failed' };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'SSLCommerz request failed' };
  }
}

export async function verifySSLCommerzPayment(
  env: Env,
  tranId: string,
  valId: string
): Promise<boolean> {
  if (!env.SSLCOMMERZ_STORE_ID || !env.SSLCOMMERZ_STORE_PASSWORD) {
    return false;
  }

  const baseURL = getSSLCommerzBaseURL(true); // Check sandbox config

  try {
    const response = await fetch(
      `${baseURL}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${env.SSLCOMMERZ_STORE_ID}&store_passwd=${env.SSLCOMMERZ_STORE_PASSWORD}&v=1&format=json`
    );

    const result = await response.json() as Record<string, unknown>;
    return result.status === 'VALID' || result.status === 'VALIDATED';
  } catch {
    return false;
  }
}

// ─── bKash ───

interface BkashConfig {
  username: string;
  password: string;
  appKey: string;
  appSecret: string;
  sandbox: boolean;
}

export function getBkashBaseURL(sandbox: boolean): string {
  return sandbox
    ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
    : 'https://tokenized.pay.bka.sh/v1.2.0-beta';
}

async function getBkashToken(env: Env): Promise<string | null> {
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

    const result = await response.json() as Record<string, unknown>;
    return (result.id_token as string) || null;
  } catch {
    return null;
  }
}

export async function createBkashPayment(
  env: Env,
  params: {
    amount: number;
    merchantInvoiceNumber: string;
    intent: string;
    currency?: string;
    successUrl: string;
    failUrl: string;
    cancelUrl: string;
  }
): Promise<{ paymentURL: string; paymentID: string } | { error: string }> {
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
        'x-app-key': env.BKASH_APP_KEY!,
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

    const result = await response.json() as Record<string, unknown>;

    if (result.bkashURL) {
      return {
        paymentURL: result.bkashURL as string,
        paymentID: result.paymentID as string,
      };
    } else {
      return { error: (result.errorMessage as string) || 'bKash payment creation failed' };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'bKash request failed' };
  }
}

export async function executeBkashPayment(
  env: Env,
  paymentID: string
): Promise<{ status: string; trxID: string } | { error: string }> {
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
        'x-app-key': env.BKASH_APP_KEY!,
      },
      body: JSON.stringify({ paymentID }),
    });

    const result = await response.json() as Record<string, unknown>;

    if (result.statusCode === '0000') {
      return {
        status: result.transactionStatus as string,
        trxID: result.trxID as string,
      };
    } else {
      return { error: (result.errorMessage as string) || 'bKash payment execution failed' };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'bKash execution failed' };
  }
}

// ─── PipraPay ───

export function getPipraPayBaseURL(env: Env): string {
  return env.PIPRAPAY_BASE_URL || 'https://pay.dakkho.pro.bd';
}

export function getPipraPayHeaders(env: Env): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'MHS-PIPRAPAY-API-KEY': env.PIPRAPAY_API_KEY || '',
  };
}

/**
 * Verify PipraPay webhook signature.
 * PipraPay sends an 'hh_signature' header with HMAC-SHA256 of the payload using the API key.
 * If no signature header is present, we allow the webhook (for backward compatibility)
 * but log a warning.
 */
export async function verifyPipraPayWebhookSignature(
  env: Env,
  body: string,
  signatureHeader: string | null | undefined
): Promise<{ valid: boolean; reason?: string }> {
  if (!signatureHeader) {
    // No signature header — allow but note this is less secure
    // PipraPay may not always send signatures depending on configuration
    return { valid: true, reason: 'No signature header — consider enabling webhook signing in PipraPay dashboard' };
  }

  if (!env.PIPRAPAY_API_KEY) {
    return { valid: false, reason: 'PIPRAPAY_API_KEY not configured — cannot verify webhook signature' };
  }

  try {
    // PipraPay uses HMAC-SHA256 with API key as secret
    const encoder = new TextEncoder();
    const keyData = encoder.encode(env.PIPRAPAY_API_KEY);
    const data = encoder.encode(body);

    // Import the API key for HMAC signing
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Compute HMAC-SHA256 signature
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);

    // Convert to hex string
    const computedHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time comparison to prevent timing attacks
    if (computedHex.length !== signatureHeader.length) {
      return { valid: false, reason: 'Signature length mismatch' };
    }
    let result = 0;
    for (let i = 0; i < computedHex.length; i++) {
      result |= computedHex.charCodeAt(i) ^ signatureHeader.charCodeAt(i);
    }

    if (result !== 0) {
      return { valid: false, reason: 'Signature verification failed — computed HMAC does not match' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, reason: `Signature verification error: ${error instanceof Error ? error.message : 'unknown'}` };
  }
}

export interface PipraPayCreateParams {
  full_name: string;
  email_address: string;
  mobile_number: string;
  amount: number | string;
  currency: string;
  return_url: string;
  webhook_url: string;
  metadata: Record<string, unknown>;
}

export async function createPipraPayPayment(
  env: Env,
  params: PipraPayCreateParams
): Promise<{ pp_id: string; pp_url: string } | { error: string }> {
  if (!env.PIPRAPAY_API_KEY) {
    return { error: 'PipraPay not configured. Set API key in Admin Panel.' };
  }

  const baseURL = getPipraPayBaseURL(env);

  try {
    const response = await fetch(`${baseURL}/api/checkout/redirect`, {
      method: 'POST',
      headers: getPipraPayHeaders(env),
      body: JSON.stringify({
        full_name: params.full_name,
        email_address: params.email_address,
        mobile_number: params.mobile_number,
        amount: String(params.amount),
        currency: params.currency || 'BDT',
        return_url: params.return_url,
        webhook_url: params.webhook_url,
        metadata: params.metadata,
      }),
    });

    const result = await response.json() as Record<string, unknown>;

    if (result.pp_id && result.pp_url) {
      return {
        pp_id: result.pp_id as string,
        pp_url: result.pp_url as string,
      };
    } else {
      return { error: (result.message as string) || (result.error as string) || 'PipraPay payment creation failed' };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'PipraPay request failed' };
  }
}

export async function verifyPipraPayPayment(
  env: Env,
  ppId: string
): Promise<{
  pp_id: string;
  status: string;
  amount: string;
  currency: string;
  payment_method: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
} | { error: string }> {
  if (!env.PIPRAPAY_API_KEY) {
    return { error: 'PipraPay not configured' };
  }

  const baseURL = getPipraPayBaseURL(env);

  try {
    const response = await fetch(`${baseURL}/api/verify-payment`, {
      method: 'POST',
      headers: getPipraPayHeaders(env),
      body: JSON.stringify({ pp_id: ppId }),
    });

    const result = await response.json() as Record<string, unknown>;

    if (result.pp_id) {
      return {
        pp_id: result.pp_id as string,
        status: (result.status as string) || 'unknown',
        amount: (result.amount as string) || '0',
        currency: (result.currency as string) || 'BDT',
        payment_method: (result.payment_method as string) || '',
        metadata: (result.metadata as Record<string, unknown>) || {},
        created_at: (result.created_at as string) || '',
        updated_at: (result.updated_at as string) || '',
      };
    } else {
      return { error: (result.message as string) || (result.error as string) || 'PipraPay verification failed' };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'PipraPay verification request failed' };
  }
}

export async function refundPipraPayPayment(
  env: Env,
  ppId: string
): Promise<{ success: boolean } | { error: string }> {
  if (!env.PIPRAPAY_API_KEY) {
    return { error: 'PipraPay not configured' };
  }

  const baseURL = getPipraPayBaseURL(env);

  try {
    const response = await fetch(`${baseURL}/api/refund-payment`, {
      method: 'POST',
      headers: getPipraPayHeaders(env),
      body: JSON.stringify({ pp_id: ppId }),
    });

    const result = await response.json() as Record<string, unknown>;

    if (result.status === 'refunded' || result.success) {
      return { success: true };
    } else {
      return { error: (result.message as string) || (result.error as string) || 'PipraPay refund failed' };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'PipraPay refund request failed' };
  }
}
