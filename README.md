# HomeValue — Northern Gold Coast

A simple, front-end-only property appraisal site for postcode **4209** (Coomera, Upper Coomera, Pimpama,
Willow Vale) and surrounding suburbs (Ormeau 4208, Oxenford 4210, Pacific Pines 4211, Helensvale and
Hope Island 4212). Built for GitHub Pages — no server or build step.

## How it works

1. **The property** — suburb, type (house / townhouse / unit), beds, baths, car spaces, land size (m²),
   year built, condition, pool.
2. **Estimate** — starts from the suburb's median for that property type (which describes a typical
   property, see `TYPICAL`) and adjusts up or down for each difference, showing every adjustment.

## Data

`js/suburbs.js` holds each suburb's 12-month median house and unit price with its source and date
(mid-2026 figures from published suburb profiles, mostly Cotality). Prices are not pulled live, so update
`SUBURBS` periodically as new medians are published. Where no unit median is available, it falls back to 75% of the house median.

## Files

- `index.html` — the page
- `css/style.css` — styles (light/dark, mobile, print)
- `js/suburbs.js` — suburb medians and typical-property profiles
- `js/app.js` — valuation logic; adjustment rates live in `RATES` at the top

Estimates are informational only — not a formal valuation by a registered valuer.

## Shop (`shop/`)

A separate single-product store at `/shop/`, for AliExpress item
[1005009503631046](https://www.aliexpress.com/item/1005009503631046.html): gallery, option picker, quantity,
cart drawer (saved in the browser) and a checkout form that emails the order to `STORE.contactEmail`.

All product content is in `shop/js/product.js`. Fields marked `TODO` are placeholders — fill them from the
listing (title, image links, options, description, specs) and set your store name, contact email and retail price.

## Shopify copy (`shopify-theme/`)

The same product page as Shopify theme files, uploaded to the unpublished theme "Quit Stick - shop page copy"
in the quit stick store. It uses the store's real products, variants and photos, Shopify's cart (AJAX API)
and Shopify checkout. Preview any product with `?view=shop-copy`, e.g.
`/products/quit-stick-starter-kit?view=shop-copy`.

- `layout/shop-copy.liquid` — header, cart drawer, footer
- `templates/product.shop-copy.liquid` — product page
- `assets/shop-copy.css`, `assets/shop-copy.js` — styles and behaviour
