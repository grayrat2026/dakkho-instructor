# 🎓 DAKKHO Student App

<p align="center">
  <strong>Student-facing application for the DAKKHO online learning platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/shadcn/ui-latest-000000?logo=shadcnui" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare" alt="Cloudflare Pages" />
  <img src="https://img.shields.io/badge/Framer_Motion-latest-0055FF?logo=framer" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Zustand-latest-764ABC" alt="Zustand" />
  <img src="https://img.shields.io/badge/Recharts-latest-8884D8" alt="Recharts" />
</p>

---

## 📋 Overview

DAKKHO Student App is the learner-facing single-page application for the DAKKHO online learning platform. Students can browse courses, view detailed curriculum information, enroll with flexible package options, stream video content, track their learning progress, and manage their accounts. The app features smooth animations, responsive design, and a modern UI built with shadcn/ui.

## 🛠 Tech Stack

| Technology       | Version | Purpose                          |
|------------------|---------|----------------------------------|
| Next.js          | 16      | React framework (SPA mode)       |
| React            | 19      | UI library                       |
| Tailwind CSS     | 4       | Utility-first CSS framework      |
| shadcn/ui        | latest  | Accessible component library     |
| Framer Motion    | latest  | Smooth page & component animations|
| Zustand          | latest  | Lightweight state management     |
| Recharts         | latest  | Progress charts & visualizations |
| TypeScript       | 5       | Type safety                      |

## ✨ Features

### 🔍 Course Discovery
- **Course Browsing** — Browse all available courses with filtering and search
- **Course Detail Pages** — Rich course pages with curriculum overview, instructor info, and enrollment options
- **Featured Instructors** — Discover and explore top instructors on the platform

### 📚 Learning Experience
- **Video Streaming** — Stream course videos directly in the app with progress tracking
- **My Courses** — Access all enrolled courses from a unified dashboard
- **Watch History** — Track viewing history and resume where you left off
- **Curriculum Navigation** — Browse chapters, lessons, and learning points

### 🔐 Authentication
- **Email OTP Login** — Passwordless authentication via one-time email codes
- **Password Authentication** — Traditional email + password login
- **Session Management** — Secure session handling with automatic token refresh

### 💳 Enrollment & Payment
- **Package Selection** — Choose enrollment packages (Single, Duo, etc.)
- **PipraPay Integration** — Secure payment processing in BDT (Bangladeshi Taka)
- **Enrollment History** — View all past and current enrollments

### 📞 Support
- **Support Center** — Submit and track support tickets
- **About Page** — Learn about the DAKKHO platform

## 🏗 Architecture

```
┌─────────────────────────────────────────────┐
│           DAKKHO Student App                │
│          (Next.js 16 SPA)                   │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │  Routes   │ │Components│ │  Zustand     │ │
│  │  (Pages)  │ │  (UI)    │ │  Stores      │ │
│  └─────┬─────┘ └────┬─────┘ └──────┬──────┘ │
│        │             │              │        │
│        └─────────────┼──────────────┘        │
│                      │                       │
│              ┌───────┴───────┐               │
│              │  API Service   │               │
│              └───────┬───────┘               │
└──────────────────────┼───────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────┐
│        DAKKHO API Worker                    │
│    (Hono + Cloudflare Workers)              │
│                                             │
│  /api/*     ──► Student API Routes          │
│  /auth/*    ──► Authentication              │
│  /upload/*  ──► R2 File Serving             │
│                                             │
│  ┌────┐  ┌────┐  ┌────┐                    │
│  │ D1 │  │ R2 │  │ KV │                    │
│  └────┘  └────┘  └────┘                    │
└─────────────────────────────────────────────┘
```

## 🌐 API Endpoints (Student-Facing)

The student app communicates with the backend via the `/api/*` route group:

| Endpoint                  | Method  | Description                          |
|---------------------------|---------|--------------------------------------|
| `/api/courses`            | GET     | List all published courses           |
| `/api/courses/:id`        | GET     | Get course detail with curriculum    |
| `/api/instructors`        | GET     | List featured instructors            |
| `/api/enrollments/mine`   | GET     | Get current user's enrollments       |
| `/api/watch-history`      | GET     | Get user's watch history             |
| `/api/video/stream`       | GET     | Get video stream URL                 |
| `/api/about`              | GET     | Get about page content               |
| `/api/support`            | GET/POST| List/create support tickets          |

**Base API URL**: `https://dakkho-admin-api.dakkho-admin.workers.dev/api/`

### Authentication Endpoints

| Endpoint                  | Method  | Description                          |
|---------------------------|---------|--------------------------------------|
| `/auth/login`             | POST    | Login with email + password          |
| `/auth/otp/send`          | POST    | Send OTP to email                    |
| `/auth/otp/verify`        | POST    | Verify OTP and authenticate          |
| `/auth/check`             | GET     | Verify current session               |
| `/auth/logout`            | POST    | End current session                  |
| `/auth/forgot-password`   | POST    | Request password reset               |
| `/auth/reset-password`    | POST    | Reset password with token            |

## 🗄 Database Schema (D1)

Key D1 tables used by the student app:

| Table               | Purpose                             |
|---------------------|-------------------------------------|
| `users`             | Student accounts and profiles       |
| `courses`           | Published course catalog            |
| `chapters`          | Course chapters                     |
| `lessons`           | Lessons within chapters             |
| `learning_points`   | Learning objectives per lesson      |
| `videos`            | Video metadata and R2 references   |
| `instructors`       | Instructor profiles                 |
| `enrollments`       | Student course enrollments          |
| `packages`          | Available enrollment packages       |
| `payments`          | Payment transaction records         |
| `watch_history`     | Video viewing progress tracking     |
| `support_tickets`   | Student support requests            |

### R2 Storage Buckets

| Bucket                | Purpose                             |
|-----------------------|-------------------------------------|
| `videos`              | Course video files                  |
| `thumbnails`          | Course and video thumbnails         |
| `avatars`             | User and instructor avatars         |
| `resources`           | Downloadable course resources       |
| `support-attachments` | Support ticket attachments          |

## 🚀 Deployment

| Platform         | URL                                        |
|------------------|--------------------------------------------|
| Cloudflare Pages | https://dakkho-student.pages.dev           |

### Deploy to Cloudflare Pages

```bash
# Build the application
npm run build

# Deploy via Wrangler
npx wrangler pages deploy out
```

## 🔧 Environment Variables

Create a `.env.local` file in the project root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://dakkho-admin-api.dakkho-admin.workers.dev/api

# App Configuration
NEXT_PUBLIC_APP_NAME=DAKKHO
NEXT_PUBLIC_APP_URL=https://dakkho-student.pages.dev

# Payment
NEXT_PUBLIC_PIPRAPAY_BASE_URL=https://api.piprapay.com
```

## 📁 Project Structure

```
dakkho-student-app/
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home / Course listing
│   │   ├── courses/         # Course browsing pages
│   │   │   ├── page.tsx     # Course list
│   │   │   └── [id]/        # Course detail page
│   │   ├── my-courses/      # Enrolled courses dashboard
│   │   ├── watch/           # Video player page
│   │   │   └── [videoId]/   # Specific video player
│   │   ├── history/         # Watch history page
│   │   ├── instructors/     # Featured instructors
│   │   ├── enroll/          # Enrollment flow
│   │   ├── about/           # About page
│   │   ├── support/         # Support center
│   │   ├── auth/            # Authentication pages
│   │   │   ├── login/       # Login page
│   │   │   ├── otp/         # OTP verification
│   │   │   └── register/    # Registration page
│   │   └── profile/         # User profile & settings
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── layout/          # Layout components (navbar, footer)
│   │   ├── course/          # Course-related components
│   │   ├── video/           # Video player components
│   │   ├── enrollment/      # Enrollment flow components
│   │   └── auth/            # Authentication components
│   ├── lib/                 # Utility functions and helpers
│   │   ├── api.ts           # API client with auth interceptors
│   │   ├── utils.ts         # General utilities
│   │   └── constants.ts     # App constants
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Authentication hook
│   │   ├── useCourses.ts    # Course data hook
│   │   └── useVideo.ts      # Video streaming hook
│   ├── store/               # Zustand state stores
│   │   ├── authStore.ts     # Authentication state
│   │   ├── courseStore.ts   # Course browsing state
│   │   └── playerStore.ts   # Video player state
│   └── types/               # TypeScript type definitions
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## 🏃 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/grayrat2026/dakkho-student-app.git
cd dakkho-student-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### Available Scripts

| Command          | Description                        |
|------------------|------------------------------------|
| `npm run dev`    | Start development server           |
| `npm run build`  | Build for production               |
| `npm run start`  | Start production server            |
| `npm run lint`   | Run ESLint                         |

## 🔑 Key Workflows

### Course Enrollment Flow

```
Browse Courses → View Course Detail → Select Package →
PipraPay Payment → Enrollment Confirmed → Access Content
```

### Video Streaming Flow

```
My Courses → Select Course → Choose Lesson →
Stream Video → Track Progress → Update Watch History
```

### Authentication Flow

```
Home → Login → [Email OTP | Password] →
Verify → Dashboard → Browse Courses
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New features
- `fix:` — Bug fixes
- `docs:` — Documentation changes
- `style:` — Code style changes
- `refactor:` — Code refactoring
- `test:` — Test additions
- `chore:` — Build/tooling changes

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

<p align="center">
  Built with ❤️ for the DAKKHO Platform
</p>
