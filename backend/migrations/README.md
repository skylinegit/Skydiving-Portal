# Database migrations

Plain SQL migrations against the portal's PostgreSQL database (DigitalOcean
Managed Postgres). Each migration is numbered and has a forward file and a
rollback file.

```
backend/migrations/
  0001_initial_schema.sql        -- forward
  0001_initial_schema.down.sql   -- rollback
  README.md                      -- this file
```

When the FastAPI backend lands we may move to Alembic. For now, plain SQL
keeps the contract obvious and reviewable.

---

## Before you run anything

1. **Connection string lives in `.env`, never in this repo.** See
   [`backend/.env.example`](../.env.example).
2. **SSL is required** by DigitalOcean Managed Postgres. Always append
   `?sslmode=require` to the URL.
3. **Take a backup first** for any non-trivial change in production. DO has
   one-click backups in the cluster dashboard.

---

## Applying a migration

Pick whichever you have on hand.

### Option A — psql

```bash
# Set the URL once for the shell session (so it never enters command history).
export DATABASE_URL='postgresql://USER:PASSWORD@HOST:25060/defaultdb?sslmode=require'

psql "$DATABASE_URL" -f backend/migrations/0001_initial_schema.sql
```

PowerShell equivalent:

```powershell
$env:DATABASE_URL = 'postgresql://USER:PASSWORD@HOST:25060/defaultdb?sslmode=require'
psql $env:DATABASE_URL -f backend/migrations/0001_initial_schema.sql
```

### Option B — DigitalOcean web console

1. DigitalOcean → Databases → your cluster → **Connection details** →
   **Open console** (built-in web psql).
2. Paste the contents of `0001_initial_schema.sql` and submit.
3. Confirm with `\dt` to list the new tables.

### Option C — GUI (DBeaver, TablePlus, pgAdmin, DataGrip)

1. Add a new Postgres connection with the cluster details, SSL mode
   **require**.
2. Open `backend/migrations/0001_initial_schema.sql`, run as a script.

---

## Verifying

After applying, run:

```sql
SELECT table_name
FROM   information_schema.tables
WHERE  table_schema = 'public'
ORDER  BY table_name;
```

You should see all 11 tables:

```
bookings
charities
charity_codes
correspondence
email_change_confirmations
password_resets
payments
sessions
sponsorship_collected
users
venues
```

---

## Rolling back

Only if you need to wipe the portal schema (this is destructive):

```bash
psql "$DATABASE_URL" -f backend/migrations/0001_initial_schema.down.sql
```

The rollback drops every table created by the forward migration in reverse
foreign-key order.

---

## Conventions

- File naming: `NNNN_short_description.sql` and matching `.down.sql`.
- One migration per logical change. Multiple unrelated changes get their own
  files so they can be rolled back independently.
- Migrations wrap their statements in `BEGIN ... COMMIT;` so they apply
  atomically — if any statement fails, the whole migration is rolled back.
- Schema migrations get their **own PR**, separate from the feature PR that
  depends on them. (See `CLAUDE.md` for the full convention.)
