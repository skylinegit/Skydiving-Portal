# Skyline Skydiving Portal

Participant portal for Skyline Skydiving. Authenticated users manage their tandem-skydive booking, request changes, view venue information, download forms, and track fundraising.

> **For LLM agents (Claude Code, Cursor, etc.):** start by reading [PROMPT.md](./PROMPT.md), then [CLAUDE.md](./CLAUDE.md).

---

## Project structure

```
skyline-portal/
  PROMPT.md           Project context (read first)
  CLAUDE.md           Repo-wide Claude Code guidance
  README.md           This file
  .env.example        Environment template
  frontend/           Next.js 14+ App Router (TypeScript, Tailwind). Deploys to Vercel.
  backend/            FastAPI + Postgres (async SQLAlchemy). Deploys to a DigitalOcean droplet.
```

---

## Architecture at a glance

```
Browser ──→ Next.js (Vercel) ──→ FastAPI (DigitalOcean droplet) ──→ Postgres (DO Managed)
                                            │
                                            └──→ N8N webhooks ──→ MS SQL CRM
```

- **Frontend**: Next.js App Router + Tailwind. UI, forms, validation, routing.
- **Backend**: FastAPI 0.115 + SQLAlchemy 2 async + asyncpg. Sessions, auth, profile, booking endpoints.
- **Database**: PostgreSQL on DigitalOcean Managed Postgres. Portal-owned data only.
- **CRM bridge**: existing N8N instance reaches the MS SQL CRM via webhooks (booking writeback, etc.).

---

## Frontend — quick start

Requires **Node 20+** and **pnpm 8+**.

```bash
cd frontend
pnpm install
cp .env.example .env.local        # then edit if needed
pnpm dev                           # http://localhost:3000
```

### Mock mode vs real backend

The frontend has a `USE_REAL_BACKEND` flag based on `NEXT_PUBLIC_API_BASE_URL`:

- **Unset** → runs in **mock mode**. `src/lib/api.ts` returns hardcoded data with simulated latency. Sign in with any email/password.
- **Set to** `http://localhost:8000` → all API calls hit the **real FastAPI backend**. You need the backend + Postgres running, see below.

Set it in `frontend/.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Restart `pnpm dev` after editing — Next.js reads env vars at startup.

### Frontend scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Next.js dev server with hot reload |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build locally |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest in watch mode |
| `pnpm test:run` | Vitest single run (CI) |
| `pnpm format` | Prettier write |
| `pnpm format:check` | Prettier check |

---

## Backend — quick start

Requires **Python 3.11** (pinned in `backend/.python-version`) and **Poetry**.

### 0. Install Python 3.11 and Poetry

```powershell
# Windows
winget install Python.Python.3.11

# In a venv shell (or globally)
python -m pip install poetry
```

> **Do not use Python 3.14+** — `asyncpg` does not yet ship wheels for Python 3.14 and the install will fail.

### 1. Install dependencies

```powershell
cd backend
py -3.11 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install poetry
poetry install
```

### 2. Apply the database schema

The schema lives in [`backend/migrations/0001_initial_schema.sql`](backend/migrations/0001_initial_schema.sql). Apply it once against a Postgres database (DigitalOcean Managed Postgres or local).

See [`backend/migrations/README.md`](backend/migrations/README.md) for the three ways to apply (DBeaver, psql CLI, DigitalOcean web console). Quick version with psql:

```powershell
$env:DATABASE_URL = 'postgresql://USER:PASSWORD@HOST:25060/defaultdb?sslmode=require'
psql $env:DATABASE_URL -f backend/migrations/0001_initial_schema.sql
```

### 3. Configure environment

```powershell
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL with the postgresql+asyncpg:// prefix
# Example:
#   DATABASE_URL=postgresql+asyncpg://USER:PASS@HOST:25060/defaultdb?ssl=require
```

> The backend uses the **asyncpg** SQLAlchemy driver, so the URL scheme is `postgresql+asyncpg://` and the SSL parameter is `ssl=require` (not `sslmode=require`).

### 4. Seed a development user

```powershell
poetry run python -m scripts.create_test_user
```

Output:
```
Updated existing user: test@skylineevents.co.uk
Created booking #24087482 at Headcorn on 2026-06-02

--- Seed complete ---
  Email:    test@skylineevents.co.uk
  Password: Skydive2025!
```

Idempotent — re-running updates the existing rows.

### 5. Run the dev server

```powershell
poetry run uvicorn src.main:app --reload --port 8000
```

- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs` (development only)
- Health probe: `http://localhost:8000/health`

### Backend endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/login` | – | Email + password. Sets HTTP-only session cookie. Returns full user. |
| POST | `/auth/logout` | session | Invalidates current session, clears cookie. |
| POST | `/auth/forgot-password` | – | Issues a reset link if the email is registered. |
| POST | `/auth/reset-password` | – | Consumes the reset token, sets new password. |
| POST | `/auth/change-password` | session | Requires current password. |
| POST | `/auth/change-email` | session | Sends confirmation link to NEW email. |
| POST | `/auth/confirm-email-change` | – | Consumes the email-change token. |
| POST | `/auth/logout-others` | session | Invalidates every other session for the current user. |
| GET | `/me` | session | Current user profile (no password hash). |
| PATCH | `/me/profile` | session | Partial update of profile fields. |
| GET | `/bookings/me` | session | Current user's booking (joined with venue + charity). |
| POST | `/bookings/me/venue-change-request` | session | Submit venue change. |
| POST | `/bookings/me/dates-change-request` | session | Submit dates change. |
| GET | `/health` | – | Liveness probe. |

### Backend scripts

| Command | What it does |
|---|---|
| `poetry run uvicorn src.main:app --reload --port 8000` | Dev server with auto-reload |
| `poetry run python -m scripts.create_test_user` | Seed / refresh the development test user + booking |
| `poetry run pytest` | Run the test suite (when tests are added) |
| `poetry run ruff check src tests` | Lint |
| `poetry run black src tests` | Format |
| `poetry run mypy src` | Type-check |

---

## Full local dev (frontend + backend together)

Open two terminals:

```powershell
# Terminal 1 — backend
cd backend
.venv\Scripts\Activate.ps1
poetry run uvicorn src.main:app --reload --port 8000
```

```powershell
# Terminal 2 — frontend
cd frontend
# Make sure frontend/.env.local has NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
pnpm dev
```

Sign in at `http://localhost:3000/login` with `test@skylineevents.co.uk` / `Skydive2025!`.

---

## Tech stack

| Concern | Choice |
|---|---|
| Frontend framework | Next.js 14+ (App Router) |
| Frontend language | TypeScript strict |
| Styling | Tailwind CSS (only) |
| Forms | React Hook Form + Zod |
| UI primitives | Radix UI under `components/ui/` |
| Animations | Framer Motion (sparingly) |
| Icons | Lucide React |
| Dates | date-fns (en-GB locale) |
| Frontend tests | Vitest |
| Frontend pkg manager | pnpm |
| Backend framework | FastAPI 0.115 |
| Backend language | Python 3.11 |
| ORM | SQLAlchemy 2 (async) |
| DB driver | asyncpg |
| Auth | Server-side sessions in Postgres, HTTP-only cookies |
| Password hashing | passlib (bcrypt + phpass for WordPress legacy) |
| Settings | pydantic-settings |
| Backend tests | pytest |
| Backend pkg manager | Poetry |
| Database | PostgreSQL 13+ on DigitalOcean Managed |
| CRM bridge | N8N webhooks |

---

## Conventions

- **Tailwind only.** No inline CSS, no styled-components, no CSS modules.
- **`fetch()` only inside `lib/api.ts`.** Components import typed functions.
- **PascalCase** component file names, **named exports** (default exports reserved for Next.js route files).
- **British English**, no em dashes in user-facing copy.
- **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
- **Squash merge** to `main`. CI must be green (lint, typecheck, tests).
- **Schema migrations get their own PR**, separate from feature PRs that depend on them.
- **Never commit `.env`** — only `.env.example` templates.

See [CLAUDE.md](./CLAUDE.md), [frontend/CLAUDE.md](./frontend/CLAUDE.md), and [backend/CLAUDE.md](./backend/CLAUDE.md) for the full rules.

---

## Deployment

- **Frontend:** Vercel auto-deploys from `main`. Preview deploys per PR. Set `NEXT_PUBLIC_API_BASE_URL` to the production backend URL in Vercel env.
- **Backend:** DigitalOcean droplet. Run `uvicorn` behind nginx or Caddy with HTTPS.
- **Database:** DigitalOcean Managed Postgres. SSL required (`?ssl=require` for asyncpg / `?sslmode=require` for psql).
- **CRM bridge:** Existing N8N instance on the client's droplet.

---

## Notes

- The Next.js 14.2.18 baseline has a known security advisory (2025-12-11). Bump to the latest 14.2.x patch before production.
- No CI pipeline is configured yet. GitHub Actions is the assumed target — add `.github/workflows/ci.yml` running lint + typecheck + tests on every PR.
- Pre-commit hooks (Husky / lint-staged) are not configured yet.
- Email integration is a stub (`backend/src/integrations/email.py` logs to stdout in dev). Wire SMTP / Postmark / SES before production.
- Rate limiting on the login endpoint is not yet implemented — belongs in Redis or a SlowAPI middleware.

---

## License

Proprietary. © Skyline Skydiving.
