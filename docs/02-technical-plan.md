# Amazon Clone — Technical Plan & Feature Ledger

**Constraint: 24 hours.** That number drives every recommendation below. This document is a menu
with prices, not a schedule — you pick what and in what order.

Stack is fixed: **FastAPI** backend, **Vite + React** frontend with **TanStack Router / Start / Query**.

---

## 1. The one thing to decide first

A 24-hour Amazon clone can go one of two ways, and they are mutually exclusive:

| | **A. Deep spine** | **B. Wide surface** |
|---|---|---|
| Shape | Browse → search → PDP → cart → checkout → order, fully working | 12 screens that look right, half of them wired to real data |
| Demo | "Buy something" — end to end, real state | "Look at all these pages" |
| Risk | Looks sparse — few screens | Falls apart the moment the reviewer clicks anything |
| Grades well when | Reviewer is an engineer | Reviewer is a designer / PM |

**Recommendation: A, with enough of B bolted on to not look thin.** A working checkout is the thing
that is genuinely hard and genuinely differentiating. Twelve static screens are a weekend of
Tailwind, and every reviewer knows it. The ledger below is ordered on that assumption — override it
if you disagree, the tiers are independent enough to reshuffle.

---

## 2. Feature ledger

Effort is solo-dev hours **including** the frontend, assuming the scaffolding in §4 already exists.
"Demonstrates" is what a reviewer learns about you from it — that is the real currency here.

### P0 — The spine. Without these there is no assignment. (~11h)

| # | Feature | Effort | Depends on | Demonstrates |
|---|---|---|---|---|
| 0.1 | Project scaffold, Docker/compose or single-command dev, seeded DB | 1.5h | — | You can set up a repo someone else can run |
| 0.2 | Catalog data model + seed (~300 products, 8 categories, images, variations) | 1.5h | 0.1 | Data modelling; realistic seed beats lorem ipsum |
| 0.3 | Product listing — category browse, grid, pagination | 1.5h | 0.2 | List rendering, TanStack Query caching |
| 0.4 | **Search** — keyword, FTS-backed, result count, sort | 1.5h | 0.2 | Not doing `LIKE '%q%'` |
| 0.5 | **PDP** — gallery, buy box, bullets, specs, variation selector | 2h | 0.2 | The highest-fidelity screen; where design chops show |
| 0.6 | **Cart** — add/update/remove, guest cart, persistence | 1.5h | 0.5 | State management across anon→auth boundary |
| 0.7 | **Auth** — register, login, httpOnly-cookie JWT, guest cart merge | 1.5h | 0.6 | Security hygiene; the merge is the tell of a real dev |

### P1 — Makes it read as *Amazon* rather than *a store*. (~6h)

| # | Feature | Effort | Depends on | Demonstrates |
|---|---|---|---|---|
| 1.1 | **Checkout** — address, delivery option, mock payment, place order | 2h | 0.6, 0.7 | Transactional integrity, the money path |
| 1.2 | Order confirmation + order history + order detail | 1h | 1.1 | Closing the loop |
| 1.3 | **Faceted filters** — brand, price range, rating, in-stock; URL-driven | 1.5h | 0.4 | Search UX depth; TanStack Router search-param mastery |
| 1.4 | Amazon chrome — two-tier dark nav, footer, the design tokens from §2 of the analysis | 1h | 0.1 | Visual fidelity, cheaply |
| 1.5 | Ratings & reviews — display, histogram, star filter, write a review | 1.5h* | 0.5 | *Display-only is 0.5h. Writing reviews is the other 1h. |

### P2 — Differentiators. Pick one or two, not all. (~5h)

| # | Feature | Effort | Why it's worth it |
|---|---|---|---|
| 2.1 | **Delivery-date promise** on results + PDP + checkout | 0.5h | Highest fidelity-per-hour on the entire list. Just `today + zone_days`, skipping weekends. Do this one. |
| 2.2 | Search autocomplete / suggestions dropdown | 1h | Very visible, feels expensive, is a debounced query |
| 2.3 | Recently viewed + "customers also bought" rails | 1h | Makes the site feel alive; co-occurrence query or same-category fallback |
| 2.4 | Multi-seller offers + buy-box winner selection | 2h | The one genuinely *Amazon* mechanic nobody clones. High signal if you have the time. |
| 2.5 | Today's Deals page with countdowns + coupon badges | 1h | Merchandising surface, cheap |
| 2.6 | Wishlist / save-for-later | 1h | Expected, low signal |
| 2.7 | Prime membership flag gating free delivery | 0.5h | Cheap flavour, ties into 2.1 |
| 2.8 | Mobile responsive pass | 1.5h | Reviewers *will* open it on a phone. Budget for this. |

### P3 — Explicitly out of scope. Say so in the README; that is a feature.

Real payments · seller onboarding portal · returns/RMA workflow · a real recommendation model ·
inventory reservation & concurrency control · tax/shipping-rate engines · A/B framework ·
i18n/multi-currency · admin CMS · Prime Video/Music/anything non-commerce · dark mode (see analysis §4).

---

## 3. Suggested 24-hour allocation

One viable ordering. Yours to change.

| Block | Hours | Content |
|---|---|---|
| 1 | 0–2 | Scaffold, data model, seed script (0.1, 0.2) |
| 2 | 2–6 | Listing, search, PDP (0.3, 0.4, 0.5) |
| 3 | 6–9 | Cart + auth + merge (0.6, 0.7) |
| 4 | 9–12 | Checkout + orders (1.1, 1.2) — **do this while you are still fresh; it is the hardest part** |
| 5 | 12–15 | Chrome + filters (1.4, 1.3) |
| 6 | 15–18 | Reviews + delivery dates + one P2 pick (1.5, 2.1, +1) |
| 7 | 18–21 | Responsive pass + bug sweep (2.8) |
| 8 | 21–24 | README, demo script, seed reset, deploy or record a walkthrough |

**Reserve the last 3 hours.** Not for features — for the README, a one-command startup, and a
rehearsed demo path. An assignment that does not start on the reviewer's machine scores zero
regardless of what is inside it.

---

## 4. Architecture

```
┌─ Vite + React ────────────────┐        ┌─ FastAPI ──────────────┐
│  TanStack Start  (SSR shell)  │  HTTP  │  /api/v1/*             │
│  TanStack Router (routes,     │ ─────► │  business logic,       │
│    URL-as-state for search)   │ cookie │  auth, persistence     │
│  TanStack Query  (server      │ forward└───────────┬────────────┘
│    cache, mutations)          │                    │
└───────────────────────────────┘            SQLite + FTS5
```

### Division of responsibility — the rule that keeps this clean

**FastAPI owns all business logic. Full stop.** TanStack Start's server functions are a
render/BFF layer only: SSR the first paint, forward the auth cookie, maybe collapse two API calls
into one. The moment a price is calculated or a permission is checked in a server function, you have
two backends and 24 hours to debug both.

### Key decisions

**Database: SQLite with FTS5.** Zero setup, ships in the repo, gives you real full-text search for
free via a virtual table. Postgres `tsvector` is the production answer and the migration is
mechanical — note that in the README and move on. Do not spend assignment hours on docker-compose
for a database only you will run.

**Search: FTS5 `MATCH` with a `bm25()` rank, rating as tiebreaker.** Roughly:
```sql
SELECT p.* FROM products p
JOIN products_fts f ON f.rowid = p.id
WHERE products_fts MATCH ?
ORDER BY bm25(products_fts), p.rating DESC
```
That is the whole search engine. It looks far more sophisticated than `LIKE`, and it is fewer lines.

**Auth: JWT in an httpOnly, SameSite=Lax cookie**, issued by FastAPI. Not localStorage — a reviewer
who checks will notice, and it costs nothing to do right.

> ⚠️ **The gotcha that will eat an hour if you don't pre-empt it:** during SSR, the fetch to FastAPI
> originates from the *Node server*, not the browser, so the auth cookie is not attached
> automatically. You must read it off the incoming request and forward it explicitly. Write that
> helper once, in block 1, before you need it.

**Cart: server-side, keyed by `user_id` OR an anonymous `cart_token` cookie.** On login, merge the
anonymous cart into the user's and drop the token. Client-side-only carts fall apart the instant you
add auth, and you will add auth.

**Money: integer minor units.** No floats anywhere near a price. This is the single most common
failure in e-commerce assignments and it is a one-line decision.

**Styling: Tailwind with the §2 tokens in `tailwind.config`.** Amazon's flat, zero-radius,
two-weight aesthetic is unusually well suited to utility classes. Set `borderRadius.DEFAULT: '0'`
once and the whole app inherits the right feel.

### Data model (minimum viable)

```
User(id, email, password_hash, name, is_prime, created_at)
Address(id, user_id, name, line1, line2, city, state, postal_code, country, phone, is_default)
Category(id, parent_id, name, slug)            -- self-referential tree
Product(id, slug, title, brand, category_id, description, bullets_json,
        specs_json, rating_avg, rating_count, created_at)
ProductImage(id, product_id, url, position)
Variant(id, product_id, sku, attrs_json,       -- {"color":"Midnight","storage":"256GB"}
        price_cents, list_price_cents, stock)
Cart(id, user_id NULL, token NULL, created_at) -- exactly one of user_id / token
CartItem(id, cart_id, variant_id, qty)
Order(id, user_id, status, subtotal_cents, shipping_cents, tax_cents,
      total_cents, address_snapshot_json, placed_at)
OrderItem(id, order_id, variant_id, qty, unit_price_cents, title_snapshot)
Review(id, product_id, user_id, rating, title, body, verified_purchase, created_at)
```

Two things here are non-obvious and both matter:

- **`Variant` carries price and stock, not `Product`.** Amazon's colour/size/storage selector changes
  the price. If price lives on Product you will rewrite this at hour 14.
- **Orders snapshot their data** (`address_snapshot_json`, `unit_price_cents`, `title_snapshot`).
  An order must not change when a product's price or title later changes. This is the detail that
  separates people who have shipped commerce from people who have not — and it costs one extra
  column.

### API surface

```
POST   /api/v1/auth/register · /login · /logout        GET /api/v1/auth/me
GET    /api/v1/products?q=&category=&brand=&min_price=&max_price=&min_rating=&sort=&page=
GET    /api/v1/products/{slug}
GET    /api/v1/products/{slug}/reviews      POST /api/v1/products/{slug}/reviews
GET    /api/v1/categories
GET    /api/v1/cart · POST /items · PATCH /items/{id} · DELETE /items/{id}
POST   /api/v1/checkout                                -- validates, creates Order, clears Cart
GET    /api/v1/orders · /orders/{id}
GET    /api/v1/addresses · POST /addresses
```

The product list endpoint returns facet counts alongside results in one response — Amazon's left
rail needs them, and a second round trip for facets is a wasted request.

### Frontend routes

```
/                                  home — merchandising grid
/s?k=&brand=&min_price=&sort=&page=  search (all state in the URL — TanStack Router's strength)
/c/$categorySlug                   category browse
/p/$productSlug                    PDP
/cart · /checkout · /orders · /orders/$orderId · /login · /register
```

Put **all** search state in the URL via TanStack Router's typed search params. Back/forward and
shareable filtered links then work for free, and it is the single clearest demonstration that you
chose TanStack Router deliberately rather than by default.

---

## 5. Risks

| Risk | Mitigation |
|---|---|
| **TanStack Start maturity.** It is the newest piece of the stack; SSR + a cross-origin API is exactly where its rough edges live. This is the biggest schedule risk in the plan. | Timebox it to 90 minutes in block 1. If SSR is not working by then, ship Vite SPA + TanStack Router — the router and Query work identically and the app is unaffected. Note the tradeoff in the README. |
| Seed data looks fake and sinks the whole demo | Budget the full 1.5h in 0.2. Real brand names, real-looking prices, real product photos (Unsplash/picsum, or a public product dataset). This is the highest-visibility hour in the build. |
| Checkout half-finished at hour 23 | Build it in block 4, not block 7 |
| Scope creep into P2 | Nothing from P2 starts until every P0 item is demoable |
| Time lost to CORS / cookie config | Same-origin via the Vite dev proxy; decide this in block 1 |

---

## 6. What "done" looks like

The reviewer should be able to:

1. Clone, run one command, and land on a populated home page.
2. Search "headphones", filter to a brand and 4+ stars, sort by price.
3. Open a product, switch the colour variant, watch the price change.
4. Add to cart **as a guest**, then register, and find the cart still intact.
5. Check out and land on a real order confirmation.
6. Reload `/orders` and see it there.
7. Do all of the above on a phone.

Seven steps. If all seven work, the assignment is done, whatever else is missing — and the README
should state plainly what is missing and why, using P3 above. Naming your own cut lines reads as
judgement. Leaving them unmentioned reads as an oversight.
