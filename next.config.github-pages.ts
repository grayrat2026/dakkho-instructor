import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/dakkho-admin",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Env variable to tell the app we're in static/GitHub Pages mode
  env: {
    NEXT_PUBLIC_STATIC_MODE: "true",
    NEXT_PUBLIC_API_BASE_URL: "https://dakkho-admin-api.dakkho-admin.workers.dev",
    NEXT_PUBLIC_BASE_PATH: "/dakkho-admin",
  },
};

export default nextConfig;
