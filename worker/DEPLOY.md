# DAKKHO Admin API — Cloudflare Workers Deployment

## Prerequisites
1. Cloudflare account with Workers enabled
2. Wrangler CLI authenticated (`wrangler login`)

## First-Time Setup

### 1. Create KV Namespace
```bash
wrangler kv namespace create KV_CONFIG
# Copy the ID and update wrangler.toml
```

### 2. Create D1 Database
```bash
wrangler d1 create dakkho-admin-db
# Copy the database_id and update wrangler.toml
```

### 3. Initialize D1 Tables
```bash
wrangler d1 execute dakkho-admin-db --file=./schema.sql
```

### 4. Set Secrets
```bash
wrangler secret put APPWRITE_API_KEY
wrangler secret put RESEND_API_KEY
wrangler secret put ADMIN_SECRET_KEY
```

### 5. Deploy
```bash
wrangler deploy
```

## API Endpoints
All endpoints are prefixed with `/admin/`

| Method | Path | Description |
|--------|------|-------------|
| POST | /admin/auth | Login |
| DELETE | /admin/auth | Logout |
| GET | /admin/auth/check | Verify session |
| GET | /admin/system/status | System health check |
| GET | /admin/users | List users |
| PUT | /admin/users | Update user |
| DELETE | /admin/users | Delete user |
| GET | /admin/categories | List categories |
| POST | /admin/categories | Create category |
| PUT | /admin/categories | Update category |
| DELETE | /admin/categories | Delete category |
| GET | /admin/instructors | List instructors |
| POST | /admin/instructors | Create instructor |
| PUT | /admin/instructors | Update instructor |
| DELETE | /admin/instructors | Delete instructor |
| GET | /admin/courses | List courses |
| POST | /admin/courses | Create course |
| PUT | /admin/courses | Update course |
| DELETE | /admin/courses | Delete course |
| GET | /admin/videos | List videos |
| POST | /admin/videos | Create video |
| PUT | /admin/videos | Update video |
| DELETE | /admin/videos | Delete video |
| GET | /admin/institutes | List institutes |
| POST | /admin/institutes | Create institute |
| PUT | /admin/institutes | Update institute |
| DELETE | /admin/institutes | Delete institute |
| GET | /admin/config | Get app config |
| PUT | /admin/config | Update app config |
| GET | /admin/notifications | List notifications |
| POST | /admin/notifications | Send notification |
| GET | /admin/analytics | Get analytics data |
| POST | /admin/upload | Upload file to R2 |
| DELETE | /admin/upload | Delete file from R2 |
| POST | /admin/email/test | Send test email |

## CORS
All responses include CORS headers for cross-origin access from GitHub Pages.
