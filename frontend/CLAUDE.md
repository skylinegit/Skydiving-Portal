# Frontend — Claude Code guidance

This file is specific to the Next.js frontend. For project-wide context, see [`../PROMPT.md`](../PROMPT.md) and [`../CLAUDE.md`](../CLAUDE.md).

---

## Stack

- Next.js 14+ with App Router
- TypeScript with `strict: true` (plus `noUncheckedIndexedAccess`, `noImplicitOverride`)
- Tailwind CSS (no inline CSS, no styled-components, no CSS modules)
- React Hook Form + Zod for every form
- Radix UI primitives under `components/ui/`
- Framer Motion for layout animations and staggered reveals
- Lucide React for icons
- `date-fns` (en-GB locale) for dates
- Vitest for tests
- pnpm for packages

---

## Where things live

```
src/
  app/                          # Routes (Next.js App Router)
    layout.tsx                  # Root layout: fonts, Toaster, skip-to-content
    page.tsx                    # Redirect to /portal/checklist or /login
    login/                      # Sign-in form
    forgot-password/
    reset-password/
    portal/                     # Authenticated portal
      layout.tsx                # Authed shell with sidebar + header
      checklist/                # Dashboard
      profile/                  # Account, booking, change-requests, to-do form
      venue/                    # Per-airfield page
      faqs/                     # Searchable accordion
      forms/                    # PDF downloads
      sponsorship/              # Jump cost, fundraising progress, policy
  components/
    ui/                         # Primitives: Button, Input, Card, Dialog, Accordion, Switch, Select, Toast, Spinner, Skeleton, ProgressBar, Badge, Textarea, Label
    forms/                      # Form widgets: TextField, SelectField, DateField, SwitchField, HeightField, WeightField, FieldError, FormSection
    portal/                     # Domain components: Sidebar, Header, PortalShell, AuthShell, PageHeader, BookingDetailsCard, VenueChangeField, DatesChangeField, ProfileForm, AccountSection, ChecklistCard, CountdownHero, StatCard, ChangePasswordDialog, PendingChangeBanner
  lib/
    api.ts                      # MOCK API client (typed). Swap bodies for fetch when backend is ready.
    auth.ts                     # Client-side session helpers (mocked).
    validation.ts               # Zod schemas for every form.
    cn.ts                       # clsx + tailwind-merge helper.
    units.ts                    # cm <-> ft/in, kg <-> st/lb conversions.
    format.ts                   # Date and currency formatters (en-GB).
    mock-data.ts                # Mock user/booking for development.
  content/                      # TEAM-EDITABLE static copy
    checklist.ts
    faqs.ts
    forms.ts
    sponsorship-policy.ts
    airfields/{headcorn,old-sarum,maidstone}.ts
  types/
    index.ts                    # Shared TypeScript types
public/
  images/                       # Logos
  pdfs/                         # 115A, 115B, parental consent
```

---

## Patterns to follow

### Forms

Every form uses **React Hook Form + Zod**.

```ts
const schema = z.object({ ... });
type Input = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Input>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
});

const onSubmit = handleSubmit(async (values) => {
  await someApiCall(values);
  toast({ tone: 'success', title: '...' });
});
```

Compose using the widgets in `components/forms/`:

- `<TextField>` — text/email/url/tel inputs with label, hint, error
- `<DateField>` — date input
- `<SelectField>` — Radix-backed accessible select
- `<SwitchField>` — toggle for booleans
- `<HeightField>` — ft + in pair
- `<WeightField>` — st + lb pair

For `<SelectField>` and `<SwitchField>`, use `Controller` from React Hook Form since they are controlled.

### API calls

**Never** call `fetch()` from a component. Always go through `src/lib/api.ts`:

```ts
import { getBooking, updateProfile } from '@/lib/api';
```

If you need a new endpoint, add a typed function to `lib/api.ts` first.

### Server vs Client components

- Default to Server Components.
- Add `'use client'` when you need: React Hook Form, dialogs, accordions, `useState`/`useEffect`, browser APIs.
- The auth pages, portal layout, and most portal pages are necessarily client components because they fetch user data or use forms.

### Styling

- Tailwind classes only.
- Use the `cn()` helper for conditional/merged classes:

```ts
import { cn } from '@/lib/cn';
<div className={cn('base classes', condition && 'conditional classes', className)} />
```

- Use design tokens, not literal colours: `bg-sky`, `text-navy`, `bg-soft`, `text-charcoal-400`.
- Brand colours, fonts and animations are defined in `tailwind.config.ts`. Add new tokens there, not as one-off classes.

### Animations

- Prefer Tailwind utilities (`animate-fade-in`, `animate-fade-in-up`, `animate-slide-in-right`, `animate-cloud-drift`, `animate-pulse-ring`).
- Use Framer Motion for: layout animations (e.g. the active-pill in the sidebar nav), staggered list reveals (`ChecklistCard` uses this), mobile drawer.
- `prefers-reduced-motion` is honoured globally via `globals.css`. Do not override it.

### Units

- Store metric, display imperial. Use the helpers in `lib/units.ts`:
  - `cmToFeetInches(cm)`, `feetInchesToCm({ feet, inches })`
  - `kgToStonePounds(kg)`, `stonePoundsToKg({ stone, pounds })`
- The form widget takes imperial input from the user. Convert to metric before sending to the backend.

### Copy

- **British English.** "colour", "organised", "centre".
- **No em dashes** in user-facing copy. Use commas, semicolons, or full stops.
- Be friendly and reassuring. The user is about to jump out of a plane.

---

## Component naming

- PascalCase file names: `BookingDetailsCard.tsx`, not `booking-details-card.tsx`.
- One component per file.
- **Named exports only.** Default exports are reserved for Next.js route files (`page.tsx`, `layout.tsx`).
- Co-locate small helper hooks or types inside the same file when they're only used by that component.

---

## Accessibility

Non-negotiable on every change:

- Use the right HTML element (`<button>`, never `<div onClick>`).
- Every input has an associated `<Label>`.
- Visible focus rings (`focus-visible:ring-2`). Do not remove them.
- Keyboard-navigable: every interactive element reachable by Tab.
- Provide `aria-label` on icon-only buttons.
- Loading states have `aria-busy` and `<span class="sr-only">` for screen readers.
- The root layout has a skip-to-content link; respect it.

---

## Testing

- Vitest is configured in `vitest.config.ts`.
- Test files live next to the file they test: `units.ts` → `units.test.ts`.
- Focus on:
  - Zod schemas in `lib/validation.ts`
  - Unit conversions in `lib/units.ts`
  - Form widgets' validation/error behaviour
  - The change-request state machine
- Do **not** snapshot test rendered HTML.

---

## Mock vs real backend

The API client in `lib/api.ts` returns hardcoded data with simulated latency. When the FastAPI backend is ready:

1. Replace function bodies with `fetch(NEXT_PUBLIC_API_BASE_URL + ...)` calls.
2. Keep every function signature identical.
3. Parse responses with Zod before returning.
4. Map non-2xx responses to a typed `ApiError`.
5. Sessions become HTTP-only cookies issued by the backend. Replace `lib/auth.ts` accordingly.

---

## Common pitfalls

- **Forgetting `'use client'`** on a file that uses `useState`, `useEffect`, RHF, or browser APIs. Next.js will throw a useful error.
- **Importing a Server Component from a Client Component** — fine. The reverse (Client into Server) is also fine in App Router but the Client tree is then sealed. Plan accordingly.
- **Using `<img>` instead of `<Image>`** — ESLint will warn. Always use `next/image`.
- **Hardcoding venue or charity data** — put it in `src/content/` so the team can edit it.
- **Disabling TypeScript strict** — don't. If a type is genuinely unsafe, narrow it explicitly.
