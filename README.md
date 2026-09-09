# JaxTrades Peptides

A static, front-end-only storefront for research peptides, built for GitHub Pages (no server/build step required).

## Pages

- `index.html` — Product catalog
- `product.html?id=<slug>` — Product detail + add to cart
- `quiz.html` — 7-question "Peptide Matcher" that recommends a product based on the shopper's answers
- `cart.html` — Cart (stored in `localStorage`)
- `checkout.html` — Shipping form + simulated order placement

## How the matcher works

`js/quiz.js` defines the questions. Each answer option awards weighted points to one or more categories
(e.g. `recovery`, `muscle`, `sleep`). Each product in `js/products.js` has its own per-category weights (`tags`).
Scoring multiplies the answer's points by each product's weight for that category and sums across all
answers — the highest-scoring product is the recommended match, with two runner-ups shown as alternates.

## Editing the catalog

Add or edit products directly in `js/products.js`. Each product needs an `id`, `name`, `price`, `size`,
`tagline`, `description`, and a `tags` object mapping category → relevance (0–3). Categories used by the
quiz live in `CATEGORY_LABELS` in the same file — add a new category there and to `QUIZ_QUESTIONS` in
`js/quiz.js` if you introduce one.

## Checkout

There is no backend, so `checkout.html` simulates order placement client-side (collects shipping info,
generates an order number, clears the cart) rather than processing real payment. To take real payments,
wire the form submit handler in `checkout.html` to a hosted payment processor (e.g. Stripe Checkout /
Payment Links) or a serverless function.

## Compliance note

All copy on the site frames products as research-use-only (RUO) with disclaimers against human/animal
consumption. If you change the product list or copy, keep those disclaimers intact/accurate for your
jurisdiction — this is not legal advice.
