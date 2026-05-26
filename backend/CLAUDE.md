# Skyline Skydiving Portal — Backend (Claude Code guidance)

**Always read [`PROMPT.md`](../PROMPT.md) and the root [`CLAUDE.md`](../CLAUDE.md) first.**
This file adds backend-specific guidance on top.

---

## What lives here

The FastAPI service that powers the portal. Talks to:

- **DigitalOcean Managed Postgres** — portal-owned data (accounts, sessions,
  profiles, change-request audit log, correspondence log).
- **N8N webhooks** on the client's existing droplet — for everything CRM-owned
  (booking details, jump cost, venue list, charity list, change-request
  submission, pending-flag reads).

The backend NEVER:

- Connects to MS SQL directly. The N8N service owns that boundary.
- Stores duplicates of CRM-owned data. We read it fresh through N8N.

---

## Stack

- Python 3.11+
- FastAPI (async)
- SQLAlchemy 2.x (async sessions)
- asyncpg driver
- pydantic v2 for request/response models
- argon2-cffi (or bcrypt) for password hashing
- httpx for outbound calls to N8N

---

## Conventions

- **Routes** in `app/api/*.py`, grouped by feature (`auth`, `me`, `bookings`,
  `change_requests`).
- **Services** in `app/services/*.py`. Business logic lives here, not in
  route handlers.
- **DB models** in `app/db/models/*.py`. One SQLAlchemy class per table.
- **Schemas** in `app/schemas/*.py`. Pydantic v2 models for request and
  response shapes.
- **N8N client** in `app/services/n8n.py`. Every CRM call goes through it so
  the surface is testable.
- **Errors** raise `HTTPException` with British-English messages. No em
  dashes.
- **Logging**: structured (JSON) in production, friendly in development.
- **Tests** in `tests/`, mirroring the `app/` layout. pytest + httpx for
  endpoint tests, factory-style fixtures for DB rows.

---

## Database

- **Connection** via `DATABASE_URL` env var. SSL is required by the managed
  cluster — keep `?sslmode=require` in the URL.
- **Migrations** are plain SQL files in `migrations/`. See
  [`migrations/README.md`](migrations/README.md).
- **Schema migrations get their own PR**, separate from feature PRs that
  depend on them.

---

## Security non-negotiables

- Passwords are hashed with argon2 (or bcrypt). Never store plaintext.
- Session cookies are HTTP-only, Secure, SameSite=Lax.
- Brute-force protection on login: rate-limit per email and per IP.
- Email-change links go to the NEW address. The change applies only when the
  link is clicked.
- Password reset tokens are one-time, expire in 30 minutes, and only the hash
  is stored.
- Never log secrets, raw passwords, or session ids.

---

## Anti-patterns to refuse

- Reading or writing MS SQL from the backend. CRM access goes through N8N.
- Storing CRM-owned data in Postgres. Read it fresh via N8N on every request.
- Returning unmasked password hashes, session ids, or reset tokens in any
  response.
- Disabling SSL on the DB connection.
- Hardcoding any URL, secret, or env-specific value in the source tree.
- Skipping hooks or signing on commits.

---

## When you are unsure

- Re-read [`PROMPT.md`](../PROMPT.md).
- Re-read the data-flow section in the architecture brief.
- Ask before adding a new dependency, changing folder layout, or touching the
  schema.
