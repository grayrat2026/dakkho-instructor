// OneSignal Service Worker for Cloudflare Pages (static export)
// This file is required by the OneSignal Web SDK.
// On static hosts like Cloudflare Pages, importScripts from CDN can fail
// due to CORS or network issues. Wrapping in try-catch prevents the
// "Uncaught NetworkError: Failed to execute 'importScripts'" error.
try { importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js"); } catch (e) {}