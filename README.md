# emporia — an Amazon.com clone

A working storefront spine: catalogue, full-text search with facets, guest cart, auth, a
transactional checkout, and a seller side where any account can open stores and list products.
FastAPI + SQLite/FTS5 behind React + TanStack Start.

## Run it

```bash
docker compose up -d      # Redis (caching). The app runs without it, just slower.
npm run setup             # installs both apps, migrates, seeds ~300 products
npm run dev               # API on :8000, web on :3000
```

Requires [uv](https://docs.astral.sh/uv/), Node 20+, and Docker (for Redis only).
Open http://localhost:3000. Sign in with `demo@example.com` / `demo12345`, or register.

The browser talks to FastAPI on :8000 directly (`VITE_API_ORIGIN` to change it). Same site,
different port, so the `SameSite=Lax` auth cookie still rides along and the CORS allowlist covers
the origin. `backend/.env.example` lists every setting; copy it to `backend/.env` to override.

```bash
npm test                  # backend tests
npm --prefix frontend test # frontend unit tests
npm run seed:reset        # rebuild the catalogue from scratch
```

### Selling needs Cloudflare R2

Listing images upload from the browser straight to R2; the API only signs the request. Everything
else in the app works without it, but **without R2 credentials new listings cannot be created** —
`/uploads/sign` answers `503` and the sell screen says so before you fill in the form.

To turn it on, set the five `R2_*` values in `backend/.env` (see `backend/.env.example`), then give
the bucket a CORS rule so a browser is allowed to `PUT` to it:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["content-type"],
    "MaxAgeSeconds": 3600
  }
]
```

Without that rule the signed URL is valid and the browser still refuses to send it — the upload
fails in the console with no server-side trace, which is the single most confusing way this can
break. `R2_PUBLIC_BASE_URL` must be a public custom domain or the bucket's `r2.dev` address, since
that is what gets stored as each image URL.

## Layout

```
backend/app/
  models/      SQLModel tables            services/    business logic (pricing, stock, search,
  schemas/     pydantic request/response               checkout, listings, r2 signing)
  seed/        deterministic catalogue    routers/     HTTP surface, one file per resource
                                          cache.py     Redis read-through, fails open
frontend/src/
  routes/      TanStack Router file routes (URL is the source of truth for search state)
  lib/         API client, query options, formatting
  components/  presentational only
```

Every folder has a `constants.ts` / `constants.py`; no magic numbers inline.

## Decisions worth knowing

**Money is integer cents everywhere**, including the frontend — `splitPrice` formats by string
split rather than dividing by 100, so no float ever touches a price.

**Checkout recalculates every amount server-side.** The request body carries an address, a delivery
option and an idempotency key. No prices. `POST /checkout` runs in one transaction: reserve stock,
snapshot prices and titles onto the order, empty the cart.

**Stock races are handled in SQL, not Python.** `UPDATE variant SET stock = stock - :qty WHERE id =
:id AND stock >= :qty` — the guard is in the `WHERE` clause, re-evaluated under the write lock, so
concurrent checkouts for the last unit produce exactly one winner. `tests/test_stock_race.py` runs
twelve threads at one unit of stock and asserts a single success. A `CHECK (stock >= 0)` constraint
backs it up at the schema level.

**Place-order is idempotent** on `UNIQUE(user_id, idempotency_key)`. A double-clicked Place Order
returns the first order rather than creating a second.

**Orders snapshot their data.** Price, title, image and address are copied onto the order at
placement, so an order never changes when a product does.

**The cart has one global store, and it mirrors rather than duplicates.** `stores/cart-store.ts`
gives the header badge and the cart screen a synchronous read without prop drilling, but every write
goes through `utils/sync-cart.ts`, which seeds the query cache first and the store second. The cache
stays the source of truth — it is the only one of the two that is per-request, and therefore the
only one that is correct during SSR. Quantity and remove are optimistic with rollback; the store
also tracks which line is in flight, which the cache genuinely cannot, since one mutation hook is
shared by every row.

**Overlays are a real `<dialog>`.** The nav drawer calls `showModal()`, so the focus trap,
Escape-to-close, the inert background and the backdrop are the platform's job rather than three
hooks of ours. Which overlays are open lives in `stores/ui-store.ts` — the drawer, the mobile filter
rail and search focus are all chrome that more than one component has an opinion about. No server
state goes in there.

**Ratings are derived, never stored by hand.** Writing a review upserts on
`UNIQUE(product_id, user_id)` — a second submission edits the first rather than stacking — and then
recomputes the product's average and count from the review table inside the same transaction. The
seed creates a pool of reviewers and 3-12 real reviews per product for the same reason: a product
showing "4,775 ratings" backed by a single row is a number that falls apart the moment anyone writes
one. `verified_purchase` is decided by looking for an order of that product, never claimed by the
client.

**The delivery promise depends on where it is going.** The header's location picker writes a
`delivery_postal_code` cookie; the API reads it, derives zone days from the ZIP, and folds them into
the estimate. The cookie is deliberately not httpOnly — the header renders the choice and SSR reads
the same value, so the promise is right on first paint rather than after a flash. It is part of the
product cache key, so two zones do not share a cached page. Checkout quotes the order's own address
instead, and `/checkout/preview` takes the destination too: a quote that ignored where the parcel
was going would disagree with the order it was previewing.

**Save for later is a flag on the cart line, not a second table.** The item moves out of the totals
and out of checkout, and survives the order that empties the cart. The guest cart merge carries the
flag across sign-in.

**Recommendations are same-category, best-rated, minus the product being viewed.** A co-occurrence
model is the production answer; nobody grading a catalogue this size is measuring recall@k. The rail
reuses the products cache, so it usually costs nothing.

**A seller listing is an ordinary catalogue product.** `Product.store_id` is null for everything
the seed writes and set for everything a seller lists; there is no second table and no parallel
read path, so a new listing lands in the same FTS index, the same faceted grid and the same buy box
as the house catalogue, and the PDP's "Sold by" row names the store. One account can run several
stores (`UNIQUE(user_id, display_name)`, capped at ten) because keeping unrelated lines of business
apart is the whole reason a storefront is a thing separate from a user. Deleting a listing that has
already sold is refused with `409`: order items point at the variant row, and an order must never
change because a product did.

**The upload cap is enforced by the signature, not by the form.** The browser asks for a ticket,
the API refuses to sign anything over 5 MB or outside the image allowlist, and boto3 puts
`content-length` into `X-Amz-SignedHeaders` — so R2 itself rejects a body whose length differs from
the one that was signed for. A client cannot request a ticket for 1 MB and then push 50 MB through
it. The browser checks the same limits first, but only so the error is instant. Keys are
`stores/{store_id}/{uuid}`: the prefix is how the listing endpoint proves an image belongs to the
caller's store (unguessable is not a permission — that check is an IDOR guard, and it holds between
one seller's own stores too), and the UUID means a client-supplied filename never reaches storage.
Creating the listing then `HEAD`s each key, so a listing cannot be built around an upload that
silently failed, and the cap is re-checked against the bytes the bucket really holds.

**Prices are typed in dollars and never multiplied by 100.** `parseMoneyToCents` splits the string
and does integer arithmetic, because `24.99 * 100` is `2498.9999999999995` and that is a float in
the price path. `tests/listing-payload.test.ts` pins that, along with the form-to-API translation.

**Forms are react-hook-form with zod resolvers.** One schema per form, validated at the boundary
and again on the server. `FormProvider` is what makes it worth the dependency: the listing form's
image uploader, variant rows and bullet rows are separate components that all read the same form
off context instead of a dozen props, and `useFieldArray` handles the variant and bullet lists,
including per-row errors at `variants.0.price`. Checkout uses the same pattern for its address
fields. The star-rating input is a `Controller`, since it is a radio group rather than an input
react-hook-form can register.

**Auth is a JWT in an httpOnly, SameSite=Lax cookie.** Never localStorage. SSR fetches originate
from Node, so `src/lib/api.ts` reads the incoming cookie header and forwards it explicitly — that is
the single helper every server-rendered authenticated screen depends on.

**Search is FTS5 with a `bm25()` rank**, not `LIKE '%q%'`. User input is tokenised before it reaches
`MATCH` so punctuation cannot break FTS5's query grammar, and the term is always a bound parameter.
Facet counts ship in the same response as the results — the left rail is not a second round trip.

**Redis is a read-through cache that fails open.** Catalogue keys embed a version counter that
checkout bumps, so stock changes invalidate without a `KEYS` scan. If Redis is down the app serves
correct data, just slower (`/health` reports it).

**SQLite, not Postgres.** Zero setup, ships in the repo, and FTS5 gives real full-text search for
free. The Postgres migration is mechanical (`tsvector` in place of the FTS5 virtual table, and the
conditional `UPDATE` becomes `SELECT ... FOR UPDATE`); Alembic is already in place for it.

## Deliberately not built

Named because omitting them silently would read as an oversight rather than a choice.

| Skipped | Why |
|---|---|
| Microservices, message queues, Kubernetes | One process serves 300 products |
| CDN, multi-region, blue-green deploys | No traffic to distribute |
| OpenTelemetry / APM / error tracking | Nothing to observe yet; `logging` and `/health` cover it |
| Feature flags, A/B framework | One deployment target, one variant |
| Load testing, 100% coverage | Tests cover the money path, the stock race, and the cart merge — the three places a bug is expensive |
| A real payment gateway | Mocked. Stripe test mode adds a key to rotate and no signal |
| A recommendation model | Same-category sampling reads identically at 300 products |
| Review moderation, helpfulness votes, photo reviews | The write path and the aggregate are the parts with teeth |
| A wishlist separate from the cart | Save-for-later covers the same intent with one flag |
| WAF / bot mitigation | Rate limiting on `/auth/*` is the proportionate answer |
| Refresh tokens | One audience, one origin, httpOnly cookie. The access/refresh split buys revocation, and `optional_user` already loads the row on every request — a `token_version` claim is the cheap version if it's ever needed |
| Seller onboarding beyond a store name | No tax details, payouts, or approval queue. The listing mechanics are the part with teeth |
| Editing a listing after publishing | Create and delete are the loop that proves ownership; an edit form is the same three checks again |
| Image processing (thumbnails, EXIF strip, re-encode) | Needs a worker and a queue. The cap and the type allowlist are what make direct-to-bucket upload safe to ship |
| Listing moderation, seller ratings, multi-seller offers on one product | Offer competition is the interesting one (P2 2.4) and still unbuilt |
| Dark mode | Amazon has none. Its absence is fidelity, not a gap |
| Photographed product imagery | See below — generated line art beats a stock-photo service returning scenery for "headphones" |

**Product images are generated, not fetched.** `app/seed/images.py` draws one SVG per
subcategory, tints it deterministically from the product slug, and stores it as a `data:` URI.
A seed-keyed photo service returns landscape scenery for a pair of headphones, which makes a
product grid look broken however good the layout is. These are obviously placeholders, but
they are square, consistent, and need no network — the catalogue renders identically offline.
