# Cozzy

A static, front-end-only storefront for **Cozzy** — a plush, cordless electric heating pillow built to ease
period cramps (and just be a really good hot-water-bottle replacement). Built for GitHub Pages, no
server/build step required.

## Pages

- `index.html` — Home: hero, "why Cozzy" features, product grid, how-it-works, reviews, newsletter
- `shop.html` — Full product grid (pillow, bundle, accessories)
- `product.html?id=<slug>` — Product detail with a color selector + add to cart
- `cart.html` — Cart (stored in `localStorage`)
- `checkout.html` — Shipping form + simulated order placement
- `about.html` — Brand story, "why heat helps," and FAQ

## Design

Warm, editorial DTC aesthetic aimed at women: cream background, a coral "pop" accent, soft blush/sage
supporting colors, `Fraunces` for display type paired with `Poppins` for body/UI. There's no product
photography — the brand mark is a reusable inline-SVG illustration of the pillow (`js/illustrations.js`,
`cozzyIllustration(hex, opts)`) recolored per product variant, used everywhere a "photo" would normally go
(hero, product cards, product detail, cart thumbnails).

## Catalog

`js/products.js` holds the catalog: the core Cozzy Pillow, a Duo Bundle, and two small accessories (spare
cover, travel pouch). Each product has a flat `price` (no per-size pricing) and a `variants` array of color
options (`{ code, label, hex }`) used for swatches and the illustration recolor.

Cart line items are keyed as `"<productId>::<variantCode>"` (see `js/store.js`) so the same product can
appear as multiple cart lines at different colors.

## Editing the catalog

Add or edit products directly in `js/products.js`. Each product needs an `id`, `name`, `kind`
(`hero` | `bundle` | `accessory`, used for card styling), `tagline`, `description`, `bullets`, a `price`
(+ optional `compareAt`), and a `variants` array of `{ code, label, hex }`.

## Checkout

There is no backend, so `checkout.html` simulates order placement client-side (collects shipping info,
generates an order number, clears the cart) rather than processing real payment. To take real payments,
wire the form submit handler in `checkout.html` to a hosted payment processor (e.g. Stripe Checkout /
Payment Links or Shopify) or a serverless function.
