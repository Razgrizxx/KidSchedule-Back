# KidSchedule — Backend API

REST API for the KidSchedule co-parenting and family management platform.
Built with **NestJS**, **Prisma v7**, and **PostgreSQL**.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18 or later |
| npm | 9 or later |
| PostgreSQL | 14 or later |

---

## Local Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd kidSchedule
npm install
```

### 2. Create your environment file

```bash
cp .env.example .env
```

Open `.env` and fill in your values. Minimum required:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/kidschedule_db
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
PORT=3000
DEV_MODE=true
```

> **DEV_MODE=true** skips phone SMS verification during local development so you can register without an SMS provider.

For a JWT secret you can run:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

For SMTP, [Mailtrap](https://mailtrap.io) has a free sandbox that works out of the box.

### 3. Create the PostgreSQL database

```bash
psql -U postgres -c "CREATE DATABASE kidschedule_db;"
```

### 4. Push the schema and generate the Prisma client

```bash
npx prisma db push
npx prisma generate
```

### 5. Seed the database (recommended)

Creates a test user and a sample family so you can log in immediately.

```bash
npx ts-node prisma/seed.ts
```

**Seed credentials:**

| Field | Value |
|-------|-------|
| Email | `christian@kidschedule.app` |
| Password | `Admin@2026!` |

### 6. Start the development server

```bash
npm run start:dev
```

API is now available at **`http://localhost:3000/api/v1`**

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start with hot-reload |
| `npm run start` | Start without hot-reload |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run compiled build |
| `npm run lint` | Lint and auto-fix |

---

## API Reference

All endpoints are prefixed with `/api/v1`.

| Module | Base path | Auth |
|--------|-----------|------|
| Auth | `/auth` | Public |
| Families | `/families` | JWT |
| Children | `/families/:id/children` | JWT |
| Caregivers | `/families/:id/caregivers` | JWT |
| Schedule | `/families/:id/schedules` | JWT |
| Messaging | `/families/:id/messages` | JWT |
| Expenses | `/families/:id/expenses` | JWT |
| Change Requests | `/families/:id/requests` | JWT |
| Moments | `/families/:id/moments` | JWT |
| Settings (family) | `/families/:id/settings` | JWT |
| Settings (user) | `/users/me/settings` | JWT |
| Blog (read) | `/blog`, `/blog/:slug` | Public |
| Blog (write) | `/blog` POST/PATCH/DELETE | JWT |

Protected endpoints require the header:
```
Authorization: Bearer <token>
```

The token is returned from `POST /auth/login`.

---

## Project Structure

```
src/
├── auth/            # JWT auth, register, login, password reset
├── blog/            # Public blog posts
├── caregivers/      # Caregiver management with permissions
├── children/        # Child profiles
├── common/          # Guards, decorators, exception filters
├── expenses/        # Shared expense tracking and balances
├── family/          # Family groups and email invitations
├── messaging/       # Immutable SHA-256 hash-chained messages
├── moments/         # Photo gallery metadata
├── prisma/          # PrismaService (PrismaPg adapter)
├── requests/        # Custody change requests workflow
├── schedule/        # Custody schedule generation (5 patterns)
└── settings/        # Family and per-user settings
prisma/
├── schema.prisma    # Full Prisma data model
└── seed.ts          # Dev seed (test user + family)
```
