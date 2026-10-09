# Cozy Collectives

A static storefront for **Cozy Collectives** weighted plushies, built for GitHub Pages (no build step).
The look follows the Cozy Collective mockup canvas: Fraunces + DM Sans, cream ground, sage accent.

## Pages

- `index.html`: home (hero, Meet the Pals grid, How it works, reviews, story, sign-up)
- `shop.html`: all pals
- `product.html?id=<id>`: product page with gallery, pal picker, quantity, Add to cart / Buy it now,
  accordions and a sticky add-to-cart bar
- `cart.html`: full cart page
- `checkout.html`: demo checkout (no payment taken)
- `about.html`: story + FAQ

## Cart

`js/store.js` holds the cart (in `localStorage`) and injects the announcement bar, header, footer and the
slide-out cart drawer on every page. Adding a product opens the drawer, which has:

- free-shipping progress bar ("You're $X away from free shipping")
- line items with quantity stepper and remove
- "Add a friend to the collective" upsells
- gift note, savings, subtotal, Checkout button, instalment line and payment badges
- Esc / overlay click to close

## Editing products

Everything is in `js/products.js`:

- `STORE`: currency, free-shipping threshold, flat shipping rate, contact email
- `PRODUCTS`: one entry per pal (name, price, compare-at price, weight, size, badge, `images`)
- `PRODUCT_DETAILS`: description, features, specifications, care and shipping copy shared by every
  product page; replace the `[BRACKETED]` placeholders

To add photos, put them in `images/<product-id>/` and list the paths in that product's `images` array,
first image first. Products with no images show a coloured placeholder tile.

## Going live

Checkout is simulated. To take payments, point the Checkout button at Shopify, Stripe Checkout / Payment
Links or PayPal.

## Shopify theme

`shopify-theme/` is an Online Store 2.0 theme that recreates this site on Shopify, and
`cozy-collectives-theme.zip` is the same theme ready to upload (Online Store › Themes › Add theme ›
Upload zip file).

- Same design, sections and copy as the static site, all editable in the theme editor.
- The slide-out cart drawer runs on Shopify's AJAX Cart API and re-renders through the Section Rendering
  API, so it shows real prices, discounts and stock. Free-shipping threshold is in Theme settings › Cart.
- Product cards read a `custom.tagline` product metafield. A product tag like `badge:Bestseller` shows a
  badge; otherwise a sale price shows "Save $X".
- The Our Story page uses the `page.about` template (story + FAQ). The header uses built-in links unless a
  menu is picked in the header settings.

Check it with `npx @shopify/cli theme check --path shopify-theme`.
