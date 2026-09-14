# Amazon.com — Product & Design Analysis

> Reference capture: `reference/screenshots/{desktop,mobile}/` (20 full-page + above-fold PNGs, gitignored).
> Computed style dump: `reference/design-tokens.json`. Re-run with `node scripts/capture-amazon.mjs [--mobile]`.
> Captured 2026-09-14 from an unauthenticated session geolocated to Pakistan (prices render in PKR, "Deliver to Pakistan").

---

## 1. The design philosophy in one sentence

**Amazon optimises for conversion per pixel, not for beauty.** Every layout decision trades
aesthetic restraint for information density, and every element that could be a link, is one.
If you find yourself making it prettier, you are making it less like Amazon.

Five principles fall out of that, all verifiable in the capture:

### 1.1 Density over whitespace

Base body text is **14px on a 20px line-height**, root 16px. Search-result cards are separated by
a 1px hairline, not by generous margin. The home page fits four merchandising cards across a
1600px viewport with ~20px gutters. Compare to a modern SaaS landing page and the ink-to-paper
ratio is roughly double.

### 1.2 Flat, near-zero radius

`border-radius` is **0px on essentially everything** — cards, buttons, the sort `<select>`, result
tiles. The single exception in the capture is the search input at `8px`. There are no drop shadows
on content cards, no gradients outside the CTA buttons, no glassmorphism. This reads as
"utilitarian catalogue", and it is load-bearing: it is the fastest thing to render and the cheapest
thing to keep consistent across a hundred thousand merchandising slots.

### 1.3 Price is the hero, not the product name

On a search result the price renders at **28px** while the product title renders at **18px**.
The most expensive typographic real estate on the page is the number. Struck-through list price,
`-25%` badges, and "You pay X with coupon" highlights stack directly under it. Design accordingly:
in the clone, the price component is the one that deserves care.

### 1.4 Trust signals are stacked, never singular

A single result tile in the capture carries up to six independent credibility cues: star rating,
review count, "10K+ bought in past month", a `Best Seller` / `Overall Pick` badge, a named
superlative ("Top Reviewed for Battery life"), and a **dated delivery promise** ("delivery Tue,
Sep 22"). None of these is decorative. The delivery date in particular is the single
highest-leverage trust element on the page — it converts an abstract purchase into a calendar event.

### 1.5 Every surface merchandises, including failure states

The **empty cart page still sells**: it renders a full right-rail of "New international customers
purchased" products with inline Add-to-cart buttons. The out-of-stock PDP replaces the buy box with
"See Similar Items" rather than a dead end. There is no terminal page anywhere on the site.

### 1.6 Progressive disclosure everywhere

Filters collapse behind "See more". Product specs collapse behind "See more". Description bullets
truncate. The page always *looks* shorter than it is, and the expansion is free — no navigation,
no round trip.

---

## 2. Design tokens (measured, not guessed)

Pulled from `getComputedStyle` on the live site.

### Colour

| Token | Hex | Where |
|---|---|---|
| `--nav-belt` | `#131921` | Top navigation bar (logo / search / cart row) |
| `--nav-sub` | `#232F3E` | Second nav row, and the footer |
| `--ink` | `#0F1111` | All primary body text and headings |
| `--link` | `#2162A1` | Standard link blue |
| `--link-teal` | `#007185` | Secondary link colour on PDP / result metadata |
| `--cta-primary` | `#FFD814` | Add to Cart |
| `--cta-secondary` | `#FFA41C` | Buy Now |
| `--price-deal` | `#CC0C39` | Discount / deal red |
| `--badge-amber` | `#F08804` | "Best Seller" badge |
| `--surface` | `#FFFFFF` | Cards |
| `--page` | `#EAEDED` | Page background behind cards |
| `--border` | `#D5D9D9` | Hairlines |

> The CTA yellows and the deal red are read off the screenshots rather than computed style — the
> buy box did not render for an unauthenticated bot session. Verify against
> `reference/screenshots/desktop/04-product-detail-fold.png` before locking them in.

### Type

- Stack: **`"Amazon Ember", Arial, sans-serif`**. Ember is proprietary. Use a licensed fallback —
  `Inter` with slightly tightened tracking is the closest free substitute, or ship Arial/Helvetica
  and say so in the README.
- Scale actually in use: `12 / 13 / 14 / 18 / 21 / 24 / 28px`. Not a modular scale — it is ad hoc.
  Pick these seven and do not invent more.
- Weights: **400 and 700 only.** There is no 500 or 600 on any page captured.

### Layout

- Max content width ~1500px, fluid below.
- Search results: left filter rail ~230px fixed, results fill the remainder.
- PDP: three columns — image gallery / detail column / boxed buy box, right-aligned.

---

## 3. Product surface inventory

What Amazon actually *is*, as a set of screens, ordered by centrality to the purchase path.

### 3.1 The purchase spine (the path that must never break)

1. **Home** — merchandising grid, category cards, personalised rails, hero carousel.
2. **Search results** — keyword query, faceted left rail (brand, price, rating, feature, discount),
   sort (Featured / Price / Avg review / Newest), pagination, result count ("1-16 of over 30,000").
3. **Category / browse node** — same grid, entered by taxonomy rather than query.
4. **Product detail (PDP)** — gallery, title, brand link, rating summary, variation selector
   (colour / size / storage), buy box (price, delivery promise, stock, qty, Add to Cart, Buy Now),
   feature bullets, spec table, A+ content, Q&A, reviews, compare-with-similar, related rails.
5. **Cart** — line items with qty steppers, save-for-later, subtotal, proceed to checkout, plus a
   merchandising rail.
6. **Checkout** — address selection/entry, delivery option, payment method, order review, place order.
7. **Order confirmation** — order number, delivery estimate, what-next.

### 3.2 Account & post-purchase

8. **Auth** — sign in, create account, the "Hello, sign in / Account & Lists" affordance.
9. **Orders** — history list, order detail, tracking, invoice, buy-again, returns.
10. **Addresses** and **payment methods** CRUD.
11. **Wishlists / registries**.

### 3.3 Discovery & merchandising

12. **Today's Deals** — time-boxed offers, deal of the day, countdowns.
13. **Best Sellers** — ranked leaderboards per category.
14. **Reviews** — full review list with photo/video reviews, helpfulness voting, verified-purchase
    flag, rating histogram, filter by star.
15. **Recommendations** — customers-also-bought, inspired-by-browsing-history, recently viewed.

### 3.4 Marketplace mechanics (the part people forget)

16. **Multiple offers per product** — the *buy box* is a winner selected among competing sellers.
    "3 offers from PKR 4,513", "1 new offer", "See all buying options".
17. **Seller storefronts**, seller ratings, fulfilment badge (FBA vs merchant-fulfilled).
18. **Prime** — membership gating free/fast delivery and Prime-only deals.
19. **Coupons & promotions** — clippable coupons, "Buy More, Save More", promo codes at checkout.

### 3.5 Cross-cutting concerns

- **Geo & locale**: delivery country drives currency, price, availability, and the whole result set.
- **Guest → authenticated cart merge** on sign-in.
- **Session-level personalisation** driving nearly every rail.

---

## 4. Behavioural details worth stealing

Cheap to implement, and they are what make a clone *feel* right:

- **Result count phrasing** — "1-16 of over 30,000 results for ..." sets scale and implies depth.
- **Delivery date, not delivery speed** — "Tue, Sep 22" beats "3-5 business days" every time.
- **Scarcity / velocity copy** — "10K+ bought in past month", "New on Amazon in past month".
- **Coupon as a green highlight** — "You pay PKR 15,272.10 with coupon", visually distinct from the
  normal price.
- **Variation swatches on the result tile**, not only on the PDP — colour dots under each result.
- **Sticky nothing, mostly** — the desktop header is not sticky. Amazon bets fast pages beat
  persistent chrome.
- **No dark mode.** Do not build one. It is not a gap in the clone; it is a fidelity feature.

---

## 5. Deliberate non-goals

Things that look important and are not, for assignment purposes:

- Amazon Ember (proprietary), the exact sprite-sheet iconography, and the logo (trademark — use a
  wordmark that is visibly your own).
- Real payment processing. Stripe test mode at most; a mocked gateway is fine and faster.
- The recommendation engine. Customers-also-bought can be a co-occurrence query, or honestly
  same-category sampling. Nobody grading a 24-hour build is measuring recall@k.
- Real logistics, tax, or shipping-rate calculation. Flat rules per zone.
- A9 relevance ranking. SQLite FTS5 / Postgres `tsvector` with a rating tiebreaker looks entirely
  credible.

---

## 6. On using your Amazon credentials

You offered them — **you don't need to, and I'd rather you didn't.** Everything above came from
unauthenticated public pages, and all ten target URLs captured cleanly with no CAPTCHA. The only
surfaces a login would add are order history, the address book, and the live checkout funnel. Those
are (a) the most predictable screens on the site, (b) guarded by OTP/2FA that will fight a headless
browser, and (c) not worth putting real account credentials into a repo-adjacent automation script
for.

If you specifically want the checkout funnel captured for fidelity, the safer route is a throwaway
account with no payment method attached. Say the word and I'll script it — but I'd spend those
minutes on build time.
