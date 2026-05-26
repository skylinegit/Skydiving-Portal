# Skyline Skydiving Portal — Backend

FastAPI service that powers the participant portal. Hosted on a DigitalOcean
droplet, talks to DigitalOcean Managed Postgres directly, and reaches the
client's MS SQL CRM through N8N webhooks.

```
backend/
  pyproject.toml              # Poetry config (Python 3.11+, FastAPI, SQLAlchemy 2, passlib, ...)
  .python-version             # 3.11
  .env.example                # Template — copy to .env locally
  .gitignore
  README.md
  CLAUDE.md                   # Backend-specific Claude Code rules
  migrations/                 # SQL migrations (Alembic to be added when needed)
    0001_initial_schema.sql
    0001_initial_schema.down.sql
    README.md
  seed/
    seed_test_user.sql        # Reference SQL (use the Python script in practice)
  scripts/
    create_test_user.py       # Recommended way to seed a dev user
  src/
    main.py                   # FastAPI app entry
    config.py                 # Settings (pydantic-settings)
    db.py                     # Async SQLAlchemy engine + session factory + Base
    deps.py                   # FastAPI dependencies (get_db, get_current_user)
    auth/
      models.py               # Session, PasswordReset, EmailChangeConfirmation
      password.py             # passlib CryptContext (bcrypt + phpass)
      sessions.py             # Session create/delete/cookie
      schemas.py              # Pydantic request/response shapes
      service.py              # Business logic
      router.py               # /auth/* endpoints
    users/
      models.py               # User (profile inline per the handoff data model)
      schemas.py              # Pydantic UserPublic
      router.py               # GET /me
    integrations/
      email.py                # Transactional email (stub until provider is chosen)
  tests/                      # pytest tests (to follow)
```

---

## Auth endpoints

All endpoints are mounted at `/auth/*` except `GET /me`.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/login` | – | Email + password. Sets HTTP-only session cookie on success. |
| POST | `/auth/logout` | session | Invalidates current session, clears cookie. |
| POST | `/auth/forgot-password` | – | Sends a reset link if the email is registered. Same response either way. |
| POST | `/auth/reset-password` | – | Consumes the reset token, sets a new password. |
| POST | `/auth/change-password` | session | Requires current password; updates to a new one. |
| POST | `/auth/change-email` | session | Sends a confirmation link to the NEW email. Change applies on click. |
| POST | `/auth/confirm-email-change` | – | Consumes the token from the confirmation email. |
| POST | `/auth/logout-others` | session | Invalidates every other session for the current user. |
| GET | `/me` | session | Returns the signed-in user's profile (never includes the password hash). |
| GET | `/health` | – | Liveness probe for the droplet. |

### Security baked in

- Sessions are server-side rows in the `sessions` table. The cookie value is
  256 bits of `secrets.token_urlsafe`, never a JWT, never readable by JS.
- Cookies are HTTP-only, Secure (configurable), SameSite=Lax.
- Passwords are verified with passlib's CryptContext supporting both
  **bcrypt** (new) and **phpass** (WordPress legacy). On the first
  successful login of a phpass-hashed user, we re-hash to bcrypt invisibly
  and update `users.hash_algorithm`. This is the WordPress migration path
  from the handoff.
- Forgot-password always returns the same message regardless of whether the
  email is registered — prevents enumeration.
- Login response is timing-equalised — a failed lookup still runs a dummy
  bcrypt verify so the response time matches.
- Tokens (password reset, email change) are random URL-safe strings, single
  use, with TTLs of 30 / 60 minutes.

---

## Local development

### One-time setup

1. **Install Python 3.11** (matches `.python-version`).

2. **Install Poetry** (https://python-poetry.org/docs/#installation), then:
   ```powershell
   cd backend
   poetry install
   ```

3. **Copy the env template** and fill in the real values:
   ```powershell
   cp .env.example .env
   # Edit .env — set DATABASE_URL to the DigitalOcean Postgres URL
   # (use postgresql+asyncpg:// prefix and ?ssl=require suffix)
   ```

4. **Apply the schema migration** (if you haven't already):
   ```powershell
   # See backend/migrations/README.md for full details
   ```

5. **Seed a test user** (recommended way):
   ```powershell
   poetry run python -m scripts.create_test_user
   ```
   Prints:
   ```
   Created test user: test@skylineevents.co.uk
   Password: Skydive2025!
   ```

### Run the dev server

```powershell
poetry run uvicorn src.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000`. Visit
`http://localhost:8000/docs` for the auto-generated Swagger UI.

### Quick smoke test

```powershell
# Login (saves the cookie to cookies.txt)
curl -i -c cookies.txt -X POST http://localhost:8000/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@skylineevents.co.uk","password":"Skydive2025!"}'

# Get the current user using the cookie
curl -b cookies.txt http://localhost:8000/me
```

---

## Conventions

- Python 3.11, FastAPI, SQLAlchemy 2.x async, asyncpg, pydantic v2.
- argon2 / bcrypt for password hashing (bcrypt today; argon2 if we tighten later).
- Router stays thin; business logic lives in service modules.
- DB access via the `get_db` dependency. Never instantiate sessions directly.
- Pydantic schemas for every request body and response model. No untyped
  `dict[str, Any]` in/out.
- Errors raise `HTTPException` with British-English detail. No em dashes.
- Logging is structured-ready (JSON in prod) and never logs secrets, raw
  passwords, or session ids.
- Schema migrations get their own PR, separate from feature PRs.

See `CLAUDE.md` for the full backend-specific Claude Code guidance, and the
root `PROMPT.md` for project-wide context.
