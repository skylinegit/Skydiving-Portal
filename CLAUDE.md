# Skyline Skydiving Portal — Claude Code guidance (root)

**Always read [PROMPT.md](./PROMPT.md) first.** It is the authoritative project context.

This file is for Claude Code-specific behavioural guidance that applies to the whole repo (frontend + backend). For frontend-only conventions, see [`frontend/CLAUDE.md`](./frontend/CLAUDE.md).

---

## What this repo is

The Skyline Skydiving participant portal. Two apps:

- `frontend/` — Next.js 14+ App Router (TypeScript, Tailwind). Deploys to Vercel.
- `backend/` — FastAPI on a DigitalOcean droplet. **Not yet implemented.**

Each app has its own `CLAUDE.md`.

---

## Project preferences

- **British English** everywhere — copy, commit messages, comments.
- **No em dashes** in user-facing copy. Use commas or full stops.
- Professional, reassuring tone. The end user is a first-time skydiver; they are nervous; they need clarity.
- Keep responses terse. The user can read the diff.

---

## Running things locally

```bash
cd frontend
pnpm install
pnpm dev          # http://localhost:3000
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

See [README.md](./README.md) for the full developer setup.

---

## Safe to edit without a developer

- `frontend/src/content/**` — static copy: checklist, FAQs, forms, sponsorship policy, airfield pages
- Tailwind class tweaks for copy polish

## Needs a developer

- `frontend/src/app/**` (routes)
- `frontend/src/components/**` (components)
- `frontend/src/lib/**` (API client, auth, validation)
- `frontend/src/types/**` (shared types)
- Database schema (when the backend exists)
- Authentication logic
- N8N workflows
- Dual-write logic
- Production deployment

---

## Commit and PR conventions

- **Conventional Commits:** `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- **Branch names:** `type/short-description`, lowercase, hyphens (e.g. `feat/profile-page`, `fix/login-redirect-loop`)
- **PR description:** what changed, why, how to test
- **CI must be green** before merge: lint, typecheck, tests
- **Squash-merge** to `main`
- **Schema migrations get their own PR**, separate from feature PRs that depend on them

---

## Anti-patterns to refuse

- Calling `fetch()` from a React component. Always go through `src/lib/api.ts`.
- Adding inline CSS, styled-components, or CSS modules. Tailwind only.
- Reading the session cookie from JavaScript. It is HTTP-only.
- Storing tokens in `localStorage`.
- Disabling `strict` in TypeScript.
- Adding em dashes to user-facing copy.
- Adding default exports outside Next.js route files.
- Bypassing pre-commit/CI hooks with `--no-verify`.

---

## When you are unsure

- Re-read [PROMPT.md](./PROMPT.md).
- Read the relevant page or component to see the existing pattern.
- Ask the user before adding a new dependency, changing a folder layout, or changing a public API.
