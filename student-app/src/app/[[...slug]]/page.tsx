import { DakkhoApp } from '@/components/dakkho/DakkhoApp';

// This catch-all route ensures ALL paths render the SPA.
// The client-side router (Zustand store) handles the actual page display.
// Without this, refreshing on any non-root path returns 404 on Cloudflare Pages.

// Required for static export: pre-render only the root page.
// All other routes are handled client-side by the SPA router on Cloudflare.
export async function generateStaticParams() {
  return [{ slug: [] }];
}

export default function CatchAllPage() {
  return <DakkhoApp />;
}
