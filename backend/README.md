# Skyline Skydiving Portal — Backend

FastAPI service that powers the participant portal. Hosted on a DigitalOcean
droplet, talks to DigitalOcean Managed Postgres directly, and reaches the
client's MS SQL CRM through N8N webhooks.

**Status:** scaffolding only. The first thing in here is the database schema.
The FastAPI app itself will follow.

```
backend/
  .env.example          # Template for local environment variables
  .gitignore            # Local env, Python caches, editor configs
  README.md             # This file
  migrations/
    0001_initial_schema.sql       # Forward migration
    0001_initial_schema.down.sql  # Rollback migration
    README.md                     # Migration workflow
```

## What lives here

- **Database schema** — `migrations/*.sql`
- **(future)** FastAPI app — routes, auth, services, N8N client
- **(future)** Alembic config — if/when we migrate off plain SQL
- **(future)** Dockerfile + deploy scripts for the DO droplet

## What does NOT live here

- Booking details, jump cost, venue list, charity list — these are CRM-owned
  (MS SQL). The backend reads them via N8N webhooks. They are never copied
  into the portal database.
- Anything that should be team-editable copy — that lives in the frontend at
  `frontend/src/content/`.

## Quick start (when the FastAPI app exists)

```bash
cp .env.example .env
# Fill in DATABASE_URL and N8N_* values

python -m venv .venv
source .venv/bin/activate     # or .venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt

# Apply migrations (see migrations/README.md for full options)
psql "$DATABASE_URL" -f migrations/0001_initial_schema.sql

# Run the dev server
uvicorn app.main:app --reload --port 8000
```

## Conventions

- Python 3.11+, FastAPI, SQLAlchemy 2.x (async).
- Server-side sessions stored in Postgres. Cookies are HTTP-only, Secure,
  SameSite=Lax.
- Brute-force protection on the login endpoint (rate-limit per email and per
  IP).
- All CRM reads/writes go through `app/services/n8n.py` — no direct MS SQL
  access from the backend.
- Schema migrations get their own PR, separate from feature PRs that depend
  on them.

See the root [`CLAUDE.md`](../CLAUDE.md) and [`PROMPT.md`](../PROMPT.md) for
the full project context.
