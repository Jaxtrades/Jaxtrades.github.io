# PAKD additions for the Horizon-based theme

Files added to the "Updated copy of PAKD — DRAFT (Claude)" theme (unpublished):

- `blocks/pakd-packs.liquid` + `snippets/pakd-pack-card.liquid`: "Choose your bundle" pack cards
  (1/3/5/10 tins, pouches, price per pouch, % off, saving, Most popular). Driven by a product
  option named "Pack"; works with the existing PAKD purchase options block (one-time / subscribe).
- `sections/pakd-scratch.liquid`: scratch-to-reveal pop-up. Email sign-up (tag `scratch-10`)
  reveals discount code SCRATCH10 (10% off, once per customer).
- `templates/product.json`: adds the pack cards block above the purchase options.
- `layout/theme.liquid`: renders the pop-up section on every page.
