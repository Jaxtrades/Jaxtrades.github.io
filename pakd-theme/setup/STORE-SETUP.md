# PAKD store setup: single source of truth

Every number on the site is read from **one** place. Copy never hard-codes a price,
pouch count, threshold or offer. If a value is blank, the theme shows a visible
`[PLACEHOLDER: …]` marker instead of guessing.

| Fact | Where it lives | Used by |
|---|---|---|
| Price | Product variant price (Shopify admin) | Cards, product page, bundles, cart |
| Pouches per tin | `Product line` metaobject → `pouches_per_tin` | Cards ("N pouches"), price per pouch, FAQ, product page |
| Tins in a variant/bundle | Variant metafield `pakd.tins` (integer, default 1) | Price per pouch for packs and bundles |
| Flavour name and colour | Product metafields `pakd.flavour`, `pakd.flavour_colour` | Chips, cards, tin illustration |
| Line live/coming soon | `Product line` metaobject → `status` | Selector tiles; later, the menu |
| Free shipping threshold | Theme settings → PAKD facts | Announcement bar, cart progress bar, shipping policy, FAQ |
| Shipping rates and times, returns window | Theme settings → PAKD facts | Policies, FAQ, trust row |
| Offers (announcement, signup, subscription) | Theme settings → PAKD facts | Announcement bar, signup, product page |
| Nicotine-free, caffeine, shelf life, allergens | Theme settings → PAKD facts (confirmed from label) | Why PAKD, FAQ, What's in it |
| Ingredients, doses, nutrition, warnings, directions | Product metafields `pakd.ingredients` etc. (from label, step 2) | Product page, Ingredients page |
| Ratings | `reviews.rating` / `reviews.rating_count`, written by Judge.me or Okendo | Stars on cards, review summary |

> The free shipping threshold must also be set as a real shipping rate in
> **Settings → Shipping and delivery**. The theme reads the number; Shopify charges it.

## 1. Metaobject definition: `pakd_line` ("Product line")

Fields:
- `name`: single line text (e.g. Recovery)
- `status`: single line text, choices `Live` / `Coming soon`
- `accent_key`: single line text, choices `recovery`, `energy`, `hydration`, `performance`, `daily`
- `pouches_per_tin`: integer
- `short_description`: single line text
- `collection`: collection reference

Entries (handle → values):
- `recovery`: Recovery · Live · recovery · **[N]** · *[PLACEHOLDER description]* · Recovery collection
- `energy`: Energy · Coming soon · energy
- `hydration`: Hydration · Coming soon · hydration
- `performance`: Performance · Coming soon · performance
- `daily`: Daily · Coming soon · daily

## 2. Product metafield definitions (namespace `pakd`)

- `pakd.line`: metaobject reference → `pakd_line`
- `pakd.flavour`: single line text
- `pakd.flavour_colour`: color
- Variant: `pakd.tins`: integer
- (Product page step) `pakd.ingredients`, `pakd.nutrition`, `pakd.warnings`, `pakd.directions`, `pakd.allergens`: rich text, from the label only

## 3. Products (all created as **Draft**)

Product type `Recovery Pouches`, one product per flavour so each gets its own card, URL and reviews:

| Handle | Flavour | Proposed tin colour (approve or replace) | Price |
|---|---|---|---|
| `recovery-lime-mint` | Lime Mint | `#B8F33A` lime | [PRICE] |
| `recovery-lemon-mint` | Lemon Mint | `#FFE45C` lemon | [PRICE] |
| `recovery-mango` | Mango | `#FF9F1C` mango | [PRICE] |
| `recovery-grapefruit` | Grapefruit | `#FF6B6B` grapefruit pink | [PRICE] |

Tags: `badge:best-seller` / `badge:new` show card badges. Bundles and the Variety Pack get product type `Recovery Bundle`, so they never count as a flavour.

Optional, status unconfirmed: `pakd-electrolytes-mango` (Mango, nicotine-free, 20 pouches) — **not created** until you confirm.

## 4. Collections and menus

- Collection `recovery-pouches` (existing collection; products added manually), sorted Best selling
- `pakd-main-menu` (new; the live theme keeps `main-menu`): Shop, Recovery, About, FAQ
- `footer-shop`: Shop all, Recovery, Bundles, When to use
- `footer-help`: About, FAQ, Contact, Shipping, Returns
- `footer-work-with-us`: Wholesale, Creator Programme, Sponsorship
- Terms and Privacy render automatically from **Settings → Policies**.

## 5. Theme

Upload this folder as a new **unpublished** theme named `PAKD draft`. The live theme is never touched.
