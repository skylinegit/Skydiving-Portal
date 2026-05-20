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
  backend/            FastAPI + Postgres. Not yet implemented.
```

---

## Frontend — quick start

Requires **Node 20+** and **pnpm 8+**.

```bash
cd frontend
pnpm install
cp ../.env.example .env.local        # then edit if needed
pnpm dev                              # http://localhost:3000
```

The frontend currently runs in **mock mode** (`NEXT_PUBLIC_API_MODE=mock`). The API client in `src/lib/api.ts` returns hardcoded data with simulated latency, so you can develop the whole portal without the backend.

### Sign in (mock)

Enter any email and password on `/login`. The mock backend accepts anything and signs you in.

### Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Run the Next.js dev server with hot reload. |
| `pnpm build` | Production build. |
| `pnpm start` | Run the production build locally. |
| `pnpm typecheck` | `tsc --noEmit`. |
| `pnpm lint` | ESLint. |
| `pnpm test` | Vitest in watch mode. |
| `pnpm test:run` | Vitest single run (CI). |
| `pnpm format` | Prettier write. |
| `pnpm format:check` | Prettier check. |

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript strict |
| Styling | Tailwind CSS (only) |
| Forms | React Hook Form + Zod |
| UI primitives | Radix UI under `components/ui/` |
| Animations | Framer Motion (sparingly) |
| Icons | Lucide React |
| Dates | date-fns (en-GB locale) |
| Tests | Vitest |
| Package manager | pnpm |

---

## Conventions

- **Tailwind only.** No inline CSS, no styled-components, no CSS modules.
- **`fetch()` only inside `lib/api.ts`.** Components import typed functions.
- **PascalCase** component file names, **named exports** (default exports reserved for Next.js route files).
- **British English**, no em dashes in user-facing copy.
- **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
- **Squash merge** to `main`. CI must be green (lint, typecheck, tests).

See [CLAUDE.md](./CLAUDE.md) and [frontend/CLAUDE.md](./frontend/CLAUDE.md) for the full rules.

---

## Deployment

- **Frontend:** Vercel auto-deploys from `main`. Preview deploys per PR.
- **Backend:** DigitalOcean droplet (not yet set up).
- **Database:** DigitalOcean Managed Postgres (not yet set up).
- **CRM bridge:** Existing N8N instance on the client's droplet.

---

## Notes

- The Next.js 14.2.18 baseline has a known security advisory (2025-12-11). Bump to the latest 14.2.x patch before production.
- No CI pipeline is configured yet. GitHub Actions is the assumed target — add `.github/workflows/ci.yml` running lint + typecheck + tests on every PR.
- Pre-commit hooks (Husky / lint-staged) are not configured yet.

---

## License

Proprietary. © Skyline Skydiving.
