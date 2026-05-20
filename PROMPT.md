# Skyline Skydiving Portal — Project Context for LLM Agents

This file is the **single source of truth** that any LLM (Claude Code, Cursor, Copilot, etc.) should read first when joining work on this repo. It captures *what* this project is, *why* it exists, *who* uses it, and the *rules of engagement* for changing it.

If you only read one file, read this one.

---

## 1. What this project is

A new **participant portal** for **Skyline Skydiving** (www.skylineskydiving.co.uk), a UK tandem-skydiving business.

The portal is **post-booking**. Users log in *after* they have already booked a skydive to:

- Manage their booking details (email, password, sessions)
- Request changes to their venue or jump date
- Complete their jumper profile (phone, DOB, sex, height, weight, fundraising URL, T&Cs)
- View venue-specific information (address, weight limits, facilities)
- Download required PDF forms (medical 115A, 115B, parental consent)
- Track fundraising progress against their charity minimum

This portal **replaces an existing WordPress + ACF portal** that is broken (failed updates, security concerns) and has poor UX. The original WordPress version's UI is preserved as design reference in the project screenshots.

The portal is **not** the public marketing website. The marketing site (www.skylineskydiving.co.uk) is a separate codebase that handles bookings, gift vouchers, charity selection, etc.

---

## 2. Who uses it

The end user is a **post-booking participant** — usually a first-time skydiver, charity fundraiser, or someone who has received a gift voucher. They are non-technical. The portal must work on a phone in the field (375px width minimum) and be confidence-inspiring rather than fiddly.

The internal Skyline office team processes change requests directly in the CRM (MS SQL) — not in this portal.

---

## 3. Architecture (whole system)

| Component | Tech | Responsibility |
|---|---|---|
| **Frontend** | Next.js 14+ App Router, TypeScript strict, Tailwind CSS, deployed to Vercel | UI, routing, forms, validation, conditional rendering. Talks to backend over HTTPS REST. |
| **Backend** | FastAPI (Python 3.11+), deployed to a DigitalOcean droplet | Auth, sessions, business logic, orchestration. Reads/writes Postgres. Calls N8N webhooks for CRM operations. |
| **Database** | PostgreSQL via DigitalOcean Managed Postgres | User accounts, sessions, password hashes, profile data, change-request bookkeeping. |
| **CRM integration** | Existing N8N instance on the client's droplet | Bridges to MS SQL CRM. Booking details, venue info, sponsorship reads/writes go through N8N webhooks called by the FastAPI backend. |

Data flow: Frontend → FastAPI → (Postgres for portal-owned data) or (N8N → MS SQL CRM for CRM-owned data) → typed JSON back to frontend.

**The frontend never talks to N8N or any database directly.** It only talks to the FastAPI backend.

---

## 4. Repo layout

```
skyline-portal/
  PROMPT.md            <-- this file (project context for any LLM)
  CLAUDE.md            <-- project-wide Claude Code guidance
  README.md            <-- developer setup, commands, deployment
  .gitignore
  .env.example
  frontend/            <-- Next.js app, deploys to Vercel
    CLAUDE.md          <-- frontend-specific guidance
    src/
      app/             <-- routes (login, forgot-password, portal/*)
      components/
        ui/            <-- primitives: Button, Input, Card, Dialog, ...
        forms/         <-- form widgets: TextField, HeightField, ...
        portal/        <-- domain components: Sidebar, BookingDetailsCard, ...
      lib/             <-- api.ts (mocked for v0), auth.ts, validation.ts, units.ts, format.ts, cn.ts
      content/         <-- TEAM-EDITABLE STATIC COPY
        checklist.ts
        faqs.ts
        forms.ts
        sponsorship-policy.ts
        airfields/     <-- one file per airfield
      types/           <-- shared TypeScript types
    public/
      images/          <-- skyline-logo-colour.png, skyline-logo-white.png
      pdfs/            <-- 115A, 115B, parental consent
  backend/             <-- FastAPI app (not yet implemented)
  docs/                <-- architecture decisions, runbooks
```

### Editable vs. developer-only

- **`src/content/`** — Skyline's team edits these files directly via Claude Code. Plain TypeScript data. Add airfields here. Update FAQs here. Tweak checklist copy here.
- **Everything else under `src/`** — developer territory. Routes, components, validation, API calls, types.

---

## 5. Pages

Six portal pages plus three auth pages.

### Unauthenticated

| Route | Purpose |
|---|---|
| `/login` | Email + password sign-in. |
| `/forgot-password` | Email entry; backend sends a 30-minute reset link. |
| `/reset-password` | Token-protected form to set a new password. |

### Authenticated portal (`/portal/*`)

| Route | Purpose |
|---|---|
| `/portal/checklist` | Dashboard-style landing page. Welcome banner with countdown to jump date, stat cards (days, fundraising, jump cost, profile), pre-jump checklist with cross-links. |
| `/portal/profile` | Account (email/password/sessions), read-only booking details from CRM, **change-request flow** for venue + dates (independent state machines), editable to-do list (phone, DOB, sex, fundraising URL, height ft/in, weight st/lb, T&Cs). |
| `/portal/venue` | Per-airfield page. Reads `venue_id` from booking, renders content from `src/content/airfields/{venueId}.ts`. Address, phone, weight limit, facilities, arrival info. |
| `/portal/faqs` | Searchable accordion grouped by category. Content in `src/content/faqs.ts`. |
| `/portal/forms` | PDF download cards (medical 115A, 115B, parental consent). Filenames in `src/content/forms.ts`. PDFs live in `public/pdfs/`. |
| `/portal/sponsorship` | Live jump cost (from CRM), live fundraising progress (charity jumps), static cancellation/payment policy from `src/content/sponsorship-policy.ts`. |

---

## 6. The change-request flow (most state-heavy part)

On the Profile page, `venue` and `dates` operate as **independent small state machines**. Each is modelled as a discriminated union:

```ts
type ChangeRequestState<T> =
  | { status: 'editable' }
  | { status: 'pending'; requested: T };
```

- On page load, the backend (via N8N → CRM) returns the current state and any pending requested values.
- When `status === 'editable'`, the dropdown/date inputs are usable.
- When `status === 'pending'`, the field is **locked** with a "We're currently working on changing your airfield/jump date" message and the requested value is shown read-only.
- On submit, backend calls N8N to write the request to the CRM and flips the flag.
- Internal Skyline team processes in CRM (out of scope here) and resets the flag.

**Venue and dates flags are independent.** A user can have a pending venue change while dates are editable, and vice versa. Render them separately.

---

## 7. Conventions — non-negotiable

These come from the developer handoff and are **fixed**:

- **Framework:** Next.js 14+ App Router, TypeScript with `strict: true`.
- **Styling:** **Tailwind only.** No inline CSS, no styled-components, no CSS modules.
- **Forms:** Zod schema + React Hook Form. Every form. No exceptions.
- **API calls:** Go through `src/lib/api.ts`. **Never** call `fetch` directly from a component.
- **Components:** PascalCase file names, one component per file, **named exports** (default exports only for Next.js route files where required).
- **Mobile-responsive:** Required on every page. Test at 375px, 768px, 1280px.
- **Accessibility:** Semantic HTML, labels on all inputs, sensible focus management, visible focus rings, `prefers-reduced-motion` respected.
- **Package manager:** pnpm. Lock file committed.
- **Linting:** ESLint + Prettier (Prettier sorts Tailwind classes via the plugin).
- **Testing:** Vitest where logic is non-trivial.
- **Copy:** British English. **No em dashes** in user-facing copy. Professional, reassuring tone.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
- **Branches:** `type/short-description`, lowercase, hyphens.

### Units

- Heights and weights are **stored as metric** (cm, kg) but **displayed as imperial** (ft/in, st/lb). The conversion lives in `src/lib/units.ts`. The form widget takes imperial input from the user and submits metric to the backend.

### Server vs Client components

- Default to Server Components.
- Add `'use client'` only when a file needs React Hook Form, dialogs, accordions, browser APIs, or other client-side interactivity. Most form-heavy pages are necessarily client components.

---

## 8. Brand and design system

Pulled from the public-site brand brief and codified into Tailwind tokens.

### Colours (defined in `tailwind.config.ts`)

| Token | Hex | Usage |
|---|---|---|
| `sky` (DEFAULT) | `#009FE3` | Primary CTAs, links, active states |
| `navy` (DEFAULT) | `#071E3D` | Headings, sidebar, navy gradients |
| `sunburst` (DEFAULT) | `#FF8A00` | Accent — urgency, pending states (use sparingly) |
| `cloud` | `#FFFFFF` | Card backgrounds |
| `soft` | `#EAF7FD` | Section tints, light backgrounds |
| `charcoal` (DEFAULT) | `#222831` | Body copy |
| `success` | `#2EAD4F` | Confirmation, milestones |
| `danger` | `#D64545` | Validation errors, destructive |

### Typography

- **Headings:** Montserrat (via `next/font`, exposed as `--font-heading`)
- **Body:** Inter (via `next/font`, exposed as `--font-body`)
- Use `font-heading` and `font-body` Tailwind classes.

### Buttons

- **Primary:** sky blue, white text, pill shape, min height 48px on `lg` size.
- **Secondary:** white bg, sky blue border + text.
- **Accent (sunburst):** use sparingly — campaign moments only.
- All have a built-in `loading` prop that shows a spinner and disables the button.

### Animation policy

- Use Tailwind's `animate-*` utilities and the custom keyframes in `tailwind.config.ts` (`fade-in`, `fade-in-up`, `slide-in-right`, `cloud-drift`, `pulse-ring`, `shimmer`).
- Use Framer Motion for layout animations (sidebar drawer, active-pill morph between nav items) and staggered reveals.
- **Always respect `prefers-reduced-motion`** — `globals.css` already disables animations when it is set.
- Keep durations short (200–400ms). Animations should indicate state change, not perform.

### Loading patterns

- Use `<Skeleton />` for content placeholders.
- Use `<Spinner />` or the `loading` prop on `<Button>` for action feedback.
- Use the `simulate-latency` already built into `lib/api.ts` to verify loading states render before swapping to the real backend.

---

## 9. Mock vs real backend

The backend is **not yet built** as of this writing. The frontend's `src/lib/api.ts` is a typed mock that returns hardcoded data from `src/lib/mock-data.ts` with simulated latency.

**When the FastAPI backend is ready:**

1. Replace the bodies of the functions in `src/lib/api.ts` with `fetch(NEXT_PUBLIC_API_BASE_URL + ...)` calls.
2. Keep every function signature identical.
3. Parse responses with Zod before returning (catch backend drift early).
4. Map non-2xx responses to a typed `ApiError`.
5. Pass the session cookie through (HTTP-only on the backend; the frontend never reads it).

`src/lib/auth.ts` is also a mock for v0. Real auth will be backend-issued HTTP-only cookies; replace `loginMock` and `getSession` accordingly.

---

## 10. Forbidden / requires-developer

The team can **safely edit**:

- Anything in `src/content/`
- FAQ items
- Airfield descriptions and contact info
- Checklist copy
- Sponsorship policy text
- Tailwind class tweaks for copy polish

The team **must not edit without a developer**:

- Routes (`src/app/`) or components (`src/components/`)
- Database schema (when the backend exists)
- Authentication logic
- N8N workflows
- Dual-write logic (when it exists)
- Production deployment configuration

---

## 11. Decisions made (so they don't get re-litigated)

These were in the handoff as "decisions needed" and are now made:

| Decision | Choice | Why |
|---|---|---|
| Node version | 20 LTS (`.nvmrc`) | Stable, satisfies Next.js 14+. |
| Component primitives | Radix UI under our `components/ui/` wrappers | Accessibility for free; we keep ownership of styling. |
| Class merging | `cn()` helper using `clsx` + `tailwind-merge` | Industry standard. Avoids conflict bugs. |
| Tailwind class order | `prettier-plugin-tailwindcss` | Auto-sorting on save. |
| Icons | Lucide React | Tree-shakeable, consistent stroke style. |
| Animation library | Framer Motion (sparingly) | For layout/stagger animations that pure CSS can't do well. |
| Date handling | `date-fns` (en-GB locale) | Lightweight, immutable, British conventions. |
| tsconfig strictness | `strict: true` + `noUncheckedIndexedAccess` + `noImplicitOverride` | Catches more real bugs. |

Open decisions that remain:

- Pre-commit hook runner (Husky vs alternative) — not added yet
- CI provider — GitHub Actions assumed but not configured yet
- Test coverage target — not set
- WCAG target — currently targeting 2.2 AA
- Error reporting (Sentry?) — not added
- Security headers in middleware — not added

---

## 12. How to talk to the user

- The client is **technical**. They have a unit-testing culture and value good engineering choices.
- Default to **brief, professional** explanations.
- Use **British English**. **No em dashes** in user-facing copy or commit messages.
- When you change something non-obvious, explain *why* in the PR description rather than in code comments.
- Don't add comments that just describe what the code does — code should be self-explanatory.
- Don't add backwards-compatibility shims or feature flags unless asked.

---

## 13. Quick start for a new agent

1. Read this file.
2. Read `frontend/CLAUDE.md` for frontend-specific rules.
3. Read the relevant page or component file to understand the shape.
4. Make the smallest possible change.
5. Run `pnpm typecheck && pnpm lint && pnpm test:run` before claiming done.
6. If you change copy in `src/content/`, no further checks needed.
7. If you change a route or component, also browse the page at 375px and 1280px.

Welcome aboard.
