<p align="center">
  <img src="public/dakkho-logo.png" alt="DAKKHO Logo" width="120" />
</p>

<h1 align="center">DAKKHO Admin Panel</h1>

<p align="center">
  <strong>Next.js 16 Admin Dashboard for the DAKKHO Student Streaming Platform</strong>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss" alt="Tailwind CSS 4" /></a>
  <a href="https://ui.shadcn.com/"><img src="https://img.shields.io/badge/shadcn%2Fui-latest-000?logo=shadcnui" alt="shadcn/ui" /></a>
  <a href="https://appwrite.io/"><img src="https://img.shields.io/badge/Appwrite-SDK-fd366e?logo=appwrite" alt="Appwrite" /></a>
  <a href="https://www.cloudflare.com/r2/"><img src="https://img.shields.io/badge/Cloudflare_R2-S3-orange?logo=cloudflare" alt="Cloudflare R2" /></a>
  <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-Edge-3ecf8e?logo=supabase" alt="Supabase" /></a>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**DAKKHO Admin Panel** is a full-featured, single-page admin dashboard built with Next.js 16 App Router for managing the DAKKHO student streaming platform. It provides 12 dedicated admin panels for managing users, courses, videos, instructors, and more — all wrapped in a sleek dark glassmorphism UI theme.

The panel integrates with **Appwrite** for authentication and database operations, **Cloudflare R2** for media storage, **Supabase** for edge functions and realtime, **Resend** for email delivery, and **HiveMQ Cloud MQTT** for real-time configuration broadcast to mobile clients.

---

## Features

### 12 Admin Panels

| # | Panel | Description |
|---|-------|-------------|
| 1 | **Dashboard** | System overview, live metrics, service health status |
| 2 | **Users** | User management with Appwrite Auth integration |
| 3 | **Categories** | Course categories CRUD operations |
| 4 | **Instructors** | Instructor profile management |
| 5 | **Courses** | Course management with chapter organization |
| 6 | **Videos** | Video management with R2 storage upload |
| 7 | **Institutes** | Educational institute management |
| 8 | **Config** | App configuration with MQTT broadcast to clients |
| 9 | **Notifications** | Push notification management and delivery |
| 10 | **Analytics** | Charts and data visualization with Recharts |
| 11 | **Email** | Email composition and delivery via Resend |
| 12 | **Settings** | Service health monitoring and API key management |

### Key Highlights

- **Dark Glassmorphism Theme** — A premium, modern UI with frosted-glass effects throughout
- **Real-time Config Broadcast** — Push configuration changes to mobile apps instantly via MQTT
- **S3-Compatible Storage** — Upload and manage videos, thumbnails, avatars, and resources on Cloudflare R2
- **Server-Side Auth** — Appwrite Server SDK for secure admin authentication
- **Local Fallback DB** — Prisma + SQLite for config, audit logs, and email logs
- **Form Validation** — Zod schemas with React Hook Form for all inputs
- **State Management** — Zustand for lightweight, reactive client state

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Auth & Database** | Appwrite Server SDK |
| **Object Storage** | Cloudflare R2 (S3-compatible) |
| **Edge Functions & Realtime** | Supabase |
| **Email** | Resend |
| **Real-time Messaging** | HiveMQ Cloud MQTT |
| **Local Database** | Prisma + SQLite |
| **State Management** | Zustand |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod |
| **Table** | TanStack React Table |
| **Data Fetching** | TanStack React Query |

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18 or **Bun** runtime
- An **Appwrite** project with a database and API key
- A **Cloudflare R2** bucket for media storage
- A **Supabase** project (for edge functions / realtime)
- A **Resend** account (for email delivery)
- A **HiveMQ Cloud** instance (for MQTT config broadcast)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/dakkho-admin.git
cd dakkho-admin

# 2. Install dependencies
npm install
# or: bun install

# 3. Create your environment file
cp .env.example .env
# Then edit .env with your actual credentials

# 4. Set up the local database
npx prisma db push

# 5. Start the development server
npm run dev
# or: bun run dev

# 6. Open http://localhost:3000
```

### Default Login

The admin panel uses Appwrite authentication. Create an admin user in your Appwrite project to log in.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your credentials. All variables are documented below:

### Database

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Prisma SQLite connection string | `file:./dev.db` |

### Appwrite

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Appwrite server endpoint | `https://cloud.appwrite.io/v1` |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Appwrite project ID | `your-project-id` |
| `APPWRITE_DATABASE_ID` | Appwrite database ID | `your-database-id` |
| `APPWRITE_API_KEY` | Appwrite server API key (secret) | `your-appwrite-api-key` |

### Cloudflare R2

| Variable | Description | Example |
|----------|-------------|---------|
| `R2_ACCESS_KEY_ID` | R2 access key | `your-r2-access-key` |
| `R2_SECRET_ACCESS_KEY` | R2 secret key | `your-r2-secret-key` |
| `R2_ENDPOINT` | R2 S3-compatible endpoint | `https://your-account-id.r2.cloudflarestorage.com` |
| `R2_ACCOUNT_ID` | Cloudflare account ID | `your-account-id` |
| `R2_API_TOKEN` | R2 API token | `your-r2-api-token` |
| `R2_BUCKET_VIDEOS` | Videos bucket name | `dakkho-videos` |
| `R2_BUCKET_THUMBNAILS` | Thumbnails bucket name | `dakkho-thumbnails` |
| `R2_BUCKET_AVATARS` | Avatars bucket name | `dakkho-avatars` |
| `R2_BUCKET_RESOURCES` | Resources bucket name | `dakkho-resources` |

### Supabase

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `your-anon-key` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (secret) | `your-service-role-key` |

### Resend

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend API key (secret) | `your-resend-api-key` |
| `RESEND_FROM_EMAIL` | Default sender email | `noreply@yourdomain.com` |
| `RESEND_SUPPORT_EMAIL` | Support email address | `support@yourdomain.com` |

### HiveMQ MQTT

| Variable | Description | Example |
|----------|-------------|---------|
| `MQTT_BROKER_URL` | MQTT WebSocket broker URL | `wss://your-broker.hivemq.cloud:8884/mqtt` |
| `MQTT_USERNAME` | MQTT username | `your-mqtt-username` |
| `MQTT_PASSWORD` | MQTT password (secret) | `your-mqtt-password` |

### App

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Public app URL | `https://yourdomain.com` |
| `NEXT_PUBLIC_API_BASE_URL` | Supabase edge functions base URL | `https://your-project.supabase.co/functions/v1` |

---

## API Documentation

All API routes are prefixed with `/api/admin/` and require authentication.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/auth` | Admin login (email + password) |
| `GET` | `/api/admin/auth/check` | Verify current auth session |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/system/status` | System health check (all services) |
| `GET/POST` | `/api/admin/system/api-key` | API key management |

### Resources

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/admin/users` | List / Create users |
| `GET/POST` | `/api/admin/categories` | List / Create categories |
| `GET/POST` | `/api/admin/instructors` | List / Create instructors |
| `GET/POST` | `/api/admin/courses` | List / Create courses |
| `GET/POST` | `/api/admin/videos` | List / Create videos |
| `GET/POST` | `/api/admin/institutes` | List / Create institutes |
| `GET/POST` | `/api/admin/config` | Read / Update app configuration |
| `GET/POST` | `/api/admin/notifications` | List / Send notifications |
| `GET` | `/api/admin/analytics` | Analytics data for charts |
| `POST` | `/api/admin/upload` | Upload file to Cloudflare R2 |

> Individual resource routes also support `PUT` and `DELETE` with an `id` query parameter for update and delete operations.

---

## Deployment

### Option 1: GitHub Pages + Supabase Edge Functions

Deploy the frontend as a static site on GitHub Pages, with API logic moved to Supabase Edge Functions.

```bash
# Build static export
npm run build

# Deploy the out/ directory to GitHub Pages
# Deploy edge functions to Supabase
supabase functions deploy
```

Set `NEXT_PUBLIC_API_BASE_URL` to point to your Supabase edge functions URL.

### Option 2: Vercel (Full-stack)

The simplest deployment path — Vercel handles both the Next.js frontend and serverless API routes.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

All API routes work out of the box. No additional configuration needed beyond environment variables.

### Option 3: Docker (Self-hosted)

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", ".next/standalone/server.js"]
```

```bash
# Build and run
docker build -t dakkho-admin .
docker run -p 3000:3000 --env-file .env dakkho-admin
```

A `Caddyfile` is included in the repository for reverse proxy setup with automatic HTTPS.

---

## Project Structure

```
dakkho-admin/
├── prisma/
│   └── schema.prisma              # Prisma schema (AppConfig, AuditLog, EmailLog, AdminSession)
├── public/
│   ├── dakkho-logo.png            # DAKKHO brand logo
│   ├── logo.svg                   # SVG logo
│   └── robots.txt                 # Search engine directives
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── admin/
│   │   │       ├── auth/          # Authentication routes
│   │   │       ├── analytics/     # Analytics data endpoint
│   │   │       ├── categories/    # Category CRUD
│   │   │       ├── config/        # App configuration
│   │   │       ├── courses/       # Course CRUD
│   │   │       ├── institutes/    # Institute CRUD
│   │   │       ├── instructors/   # Instructor CRUD
│   │   │       ├── notifications/ # Notification management
│   │   │       ├── system/        # System status & API key
│   │   │       ├── upload/        # R2 file upload
│   │   │       ├── users/         # User CRUD
│   │   │       └── videos/        # Video CRUD
│   │   ├── globals.css            # Global styles & glassmorphism theme
│   │   ├── layout.tsx             # Root layout with dark mode
│   │   └── page.tsx               # SPA entry with Zustand routing
│   ├── components/
│   │   ├── admin/
│   │   │   ├── analytics-panel.tsx
│   │   │   ├── categories-table.tsx
│   │   │   ├── config-panel.tsx
│   │   │   ├── courses-table.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── email-panel.tsx
│   │   │   ├── header.tsx
│   │   │   ├── institutes-table.tsx
│   │   │   ├── instructors-table.tsx
│   │   │   ├── login-form.tsx
│   │   │   ├── notifications-panel.tsx
│   │   │   ├── settings-panel.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── users-table.tsx
│   │   │   └── videos-table.tsx
│   │   └── ui/                    # shadcn/ui component library
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   └── use-mobile.ts
│   └── lib/
│       ├── appwrite-server.ts     # Appwrite Server SDK client
│       ├── audit.ts               # Audit logging utilities
│       ├── constants.ts           # App-wide constants
│       ├── db.ts                  # Prisma client instance
│       ├── mqtt.ts                # HiveMQ MQTT client
│       ├── r2.ts                  # Cloudflare R2 S3 client
│       ├── resend.ts              # Resend email client
│       ├── store.ts               # Zustand global store
│       ├── supabase.ts            # Supabase client
│       ├── types.ts               # Shared TypeScript types
│       └── utils.ts               # Utility functions
├── .env.example                   # Environment variable template
├── Caddyfile                      # Caddy reverse proxy config
├── components.json                # shadcn/ui configuration
├── next.config.ts                 # Next.js configuration
├── package.json                   # Dependencies & scripts
├── postcss.config.mjs             # PostCSS configuration
├── tailwind.config.ts             # Tailwind CSS configuration
└── tsconfig.json                  # TypeScript configuration
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. Create a **feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

### Development Guidelines

- Follow the existing TypeScript and Tailwind CSS conventions
- Use **Zod** schemas for all form validation
- Maintain the dark glassmorphism theme consistency
- Add proper error handling for all API routes
- Keep components modular and reusable

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for the DAKKHO Student Streaming Platform
</p>
