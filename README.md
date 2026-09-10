# JaxTrades Peptides

A static, front-end-only storefront for research peptides, built for GitHub Pages (no server/build step required).

## Pages

- `index.html` — Landing page: leads with the Q&A matcher, links out to the Menu
- `menu.html` — Full product catalog, browsable on its own
- `product.html?id=<slug>` — Product detail with a size/price selector + add to cart
- `quiz.html` — 9-question Q&A that recommends peptides based on the shopper's answers
- `cart.html` — Cart (stored in `localStorage`)
- `checkout.html` — Shipping form + simulated order placement

## Catalog & pricing

`js/products.js` holds 36 products, each with one or more `sizes` (e.g. different mg strengths), sourced
from a supplier wholesale price list (USD, priced per box of 10 vials, tiered by order volume). Each size's
`price` here is a **per-vial AUD price**, computed as: lowest available box-quantity tier (USD) ÷ 10 vials,
converted at ~1 USD = 1.38 AUD, rounded to the nearest dollar. That means these are close to the raw
wholesale cost per vial with **no retail margin added** — adjust `price` in `js/products.js` per size once
you decide on markup, shipping, and payment-processing costs.

Cart line items are keyed as `"<productId>::<sizeCode>"` (see `js/store.js`) so the same product can appear
as multiple cart lines at different sizes.

## How the matcher works

`js/quiz.js` defines the questions. Each answer option awards weighted points to one or more categories
(e.g. `recovery`, `muscle`, `sleep`). Each product in `js/products.js` has its own per-category weights (`tags`).
Scoring multiplies the answer's points by each product's weight for that category and sums across all
answers — the highest-scoring product is the recommended match, shown alongside up to 4 runner-ups.

## Editing the catalog

Add or edit products directly in `js/products.js`. Each product needs an `id`, `name`, `icon`, `tagline`,
`description`, a `tags` object mapping category → relevance (0–3), and a `sizes` array of `{ code, spec, price }`.
Categories used by the quiz live in `CATEGORY_LABELS` in the same file — add a new category there and to
`QUIZ_QUESTIONS` in `js/quiz.js` if you introduce one.

## Checkout

There is no backend, so `checkout.html` simulates order placement client-side (collects shipping info,
generates an order number, clears the cart) rather than processing real payment. To take real payments,
wire the form submit handler in `checkout.html` to a hosted payment processor (e.g. Stripe Checkout /
Payment Links) or a serverless function.

## Compliance note

All copy on the site frames products as research-use-only (RUO) with disclaimers against human/animal
consumption. If you change the product list or copy, keep those disclaimers intact/accurate for your
jurisdiction — this is not legal advice.
