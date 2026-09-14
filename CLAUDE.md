# CLAUDE.md

## Project

Amazon.com clone — a **24-hour timeboxed assignment** for 8x. Fidelity to Amazon's actual product
and visual behaviour is the grading criterion, not originality.

**Ahmed decides what gets built, how, and in what order.** Propose and recommend; don't reorder the
roadmap unilaterally. When a task is ambiguous, pick the option that ships and say which assumption
you made.

## Stack

- **Backend:** FastAPI · SQLite + FTS5 · SQLModel/SQLAlchemy
- **Frontend:** Vite + React · TanStack Router · TanStack Start (SSR) · TanStack Query
- **Styling:** Tailwind, tokens from `docs/01-amazon-analysis.md` §2

## Read before building

- `docs/01-amazon-analysis.md` — design philosophy, measured tokens, surface inventory
- `docs/02-technical-plan.md` — feature ledger with priorities, architecture, data model
- `reference/screenshots/{desktop,mobile}/` — ground truth. **Look at these before styling a screen**
  rather than recalling what Amazon looks like. Gitignored; regenerate with
  `node scripts/capture-amazon.mjs [--mobile]`.
- `reference/design-tokens.json` — computed styles pulled off the live site

## Non-negotiables

These are the ones that are expensive to retrofit. Everything else is negotiable.

1. **Money is integer minor units.** No floats in any price path, ever.
2. **Orders snapshot their data** — price, title, and address are copied onto the order at placement.
   An order never changes because a product changed.
3. **Price and stock live on `Variant`, not `Product`.** The colour/size selector changes the price.
4. **Auth is a JWT in an httpOnly SameSite=Lax cookie.** Never localStorage.
5. **SSR must forward the auth cookie explicitly** — SSR fetches originate from Node, not the
   browser, so the cookie is not attached for you. One helper, written early.
6. **All business logic is in FastAPI.** TanStack Start server functions are render/BFF only — no
   pricing, no permission checks.
7. **Search state lives in the URL** via TanStack Router typed search params.
8. **Checkout recalculates every amount server-side.** The client sends item IDs and quantities —
   never prices. See the security table below.

## Production do's and don'ts

Not every production practice earns its cost at 24 hours. These are the ones that do — each is
cheap now and expensive or embarrassing later. §"Deliberately skipped" below is the other half:
things that look professional and are theater at this scale. Knowing the difference is the point.

### Security — the ones a reviewer will actually check

| ✅ Do | ❌ Don't |
|---|---|
| **Recalculate the order total server-side from current DB prices at checkout.** | **Never trust a client-sent price, subtotal, or total.** This is *the* classic e-commerce vulnerability. If `POST /checkout` accepts an amount from the browser, nothing else in the repo matters. |
| Hash passwords with `passlib[bcrypt]` or argon2 | Store plaintext, MD5, SHA-256, or hand-rolled hashing |
| Check ownership on every `/orders/{id}`, `/addresses/{id}`, cart mutation | Assume a URL is unguessable — that's IDOR, and it's the second thing a reviewer probes |
| Separate Pydantic read/write schemas; responses never carry `password_hash` | Return the ORM object directly and hope the serializer omits secrets |
| CORS allowlist of explicit origins | `allow_origins=["*"]` together with `allow_credentials=True` — it's silently ignored by browsers and signals you don't know why |
| Secrets from env, `.env.example` committed with dummy values | Commit `.env`, the SQLite file, or a JWT signing key |
| Rate-limit `/auth/login` and `/auth/register` (in-memory counter is fine) | Leave credential-stuffing wide open |
| Let the ORM parameterize queries — including the FTS5 `MATCH` arg | f-string a user's search term into SQL |
| Validate at the boundary: qty ≥ 1, page size capped, enum sorts | Pass raw query params into a query and let the DB decide |

### Data integrity

- **Do** wrap checkout in a single DB transaction: create order → copy items → decrement stock →
  clear cart. Partial success here means a customer paid for nothing.
- **Do** make place-order idempotent. A double-click must not create two orders — a client-supplied
  idempotency key, or a unique constraint on `(user_id, cart_id)`, both work.
- **Do** put constraints in the schema: FKs, `UNIQUE(email)`, `CHECK(qty > 0)`, `NOT NULL`.
  App-layer-only validation drifts the moment there are two write paths.
- **Do** reject checkout when stock is insufficient, with `409`, and say which line item.
- **Don't** soft-delete speculatively, add `created_by`/`updated_by` audit columns nothing reads, or
  build a migration system for a DB that ships seeded.

### API

- **Do** paginate every list endpoint with a hard max page size. An unbounded list endpoint is a
  denial-of-service you wrote yourself.
- **Do** use real status codes — `201` create, `401` vs `403`, `404` for both missing-and-not-yours,
  `409` conflict, `422` validation — and one consistent error body shape.
- **Do** eager-load with `selectinload` on product lists. **Don't** ship the N+1 that renders a
  40-product grid as 41 queries; it's the most common thing a backend reviewer greps for.
- **Do** return facet counts in the same response as results. **Don't** make the left rail a second
  round trip.
- **Don't** version-negotiate, build a plugin system, or add a GraphQL layer "for flexibility".

### Frontend

- **Do** give every query three states — loading, error, empty — not just the happy path. Empty
  search results and an empty cart are *designed* screens on Amazon, not blank divs.
- **Do** disable submit buttons while a mutation is pending. Double-submitted checkout is the #1
  demo-day failure.
- **Do** use optimistic updates with rollback for cart qty changes — it's where TanStack Query earns
  its place, and it's visible in a demo.
- **Do** ship accessibility basics: real `<button>`/`<a>`, labels on the search input and qty
  stepper, `alt` on product images, visible focus rings, keyboard-reachable filters. This is never
  the thing to cut — it's cheap during and expensive after.
- **Do** set explicit `width`/`height` and `loading="lazy"` on product images. A product grid that
  reflows as images land looks broken.
- **Don't** fetch in `useEffect`, use array index as a key in reorderable lists, or leave
  `console.log` in committed code.

### Repo & ops

- **Do** make it start in one command from a clean clone, and write the README *before* you're tired.
- **Do** make the seed script idempotent and re-runnable — a reviewer will run it twice.
- **Do** add `GET /health`, and use `logging` rather than `print` on the backend.
- **Do** pin dependencies (`requirements.txt` / lockfile committed).
- **Don't** commit `node_modules`, the DB file, screenshots, or `.agent-logs` — see `.gitignore`.

### Deliberately skipped — say so in the README

Naming these reads as judgement. Silently omitting them reads as an oversight.

Microservices · message queues · Redis caching (nothing has been measured yet) · Kubernetes ·
CI/CD beyond a lint · OpenTelemetry / APM · error tracking · feature flags · multi-region · CDN ·
blue-green deploys · 100% coverage · load testing · a real payment gateway · WAF/bot mitigation.

Every one of these is correct in production and wrong in a 24-hour assignment. The README should
list them as *known* exclusions with a one-line reason.

## Conventions

- Backend: `snake_case`, Pydantic models for every request/response, routers under `/api/v1`.
- Frontend: TanStack Query for all server state — no `useEffect` fetching. Mutations invalidate.
- `borderRadius.DEFAULT: '0'` in the Tailwind config; Amazon is flat. Two font weights, 400 and 700.
- Keep the seven-step demo path in `docs/02-technical-plan.md` §6 working at all times. If a change
  breaks step 4, that outranks whatever feature you were adding.

## Working style

This is a 24-hour build. Ship the direct version; skip the abstraction layer. Don't add a dependency
for what a few lines do, don't build an interface with one implementation, and don't write a config
option for a value that never changes.

Where you deliberately cut a corner with a known ceiling, mark it:
`# ponytail: in-memory facet counts, move to a SQL GROUP BY past ~5k products`

Non-trivial logic leaves one runnable check behind — an `assert`-based `__main__` self-check or one
small `test_*.py`. Not a suite. The checkout total calculation and the guest-cart merge are the two
places this genuinely matters.

## Don't — assignment scope

- Build dark mode. Amazon has none; its absence is fidelity, not a gap.
- Use Amazon's logo or Amazon Ember (trademark / proprietary licence). Own wordmark, licensed font.
- Use real Amazon credentials in any script in this repo.
- Touch anything in P3 of the feature ledger without being asked.
