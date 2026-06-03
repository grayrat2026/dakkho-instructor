# DAKKHO Admin Panel

Comprehensive admin dashboard for DAKKHO Student Streaming Platform.

## Quick Start

```bash
# 1. Install dependencies
npm install
# or: bun install

# 2. Setup database
npx prisma db push

# 3. Start development server
npm run dev

# 4. Open http://localhost:3000
```

## Tech Stack

- **Next.js 16** (App Router + Turbopack)
- **TypeScript** + **Tailwind CSS 4** + **shadcn/ui**
- **Appwrite** — Primary database & authentication
- **Cloudflare R2** — File storage (videos, thumbnails, avatars, resources)
- **Supabase** — Edge functions & realtime
- **Resend** — Email delivery
- **HiveMQ Cloud MQTT** — Real-time config broadcast
- **Prisma + SQLite** — Local config & audit logs
- **Recharts** — Analytics charts
- **Zustand** — Client state management
- **Framer Motion** — Animations

## Admin Panel Sections

1. **Dashboard** — Stats overview, recent activity, system health
2. **Users** — Student management with search & filters
3. **Courses** — Course CRUD with chapters
4. **Videos** — Video management & R2 upload
5. **Instructors** — Instructor profiles
6. **Categories** — Course categories
7. **Institutes** — Educational institutes
8. **Notifications** — Push & in-app notifications
9. **Config** — Server-driven UI configuration (feature toggles, layout ordering)
10. **Email** — Email composer & test send
11. **Analytics** — Charts & statistics
12. **Settings** — System health, API key config, danger zone

## Environment Variables

All credentials are pre-configured in `.env`. For production:

1. Update `APPWRITE_API_KEY` — Create a key with all required scopes
2. Update `MQTT_USERNAME` / `MQTT_PASSWORD` — From HiveMQ Cloud
3. Update `RESEND_API_KEY` — From Resend dashboard

## Build for Production

```bash
npm run build
npm start
```
