# HomeValue

A simple, front-end-only property appraisal site built for GitHub Pages — no server or build step required.

## How it works

`index.html` walks the user through three steps:

1. **The property** — living area (required), beds, baths, year built, garage, condition, pool.
2. **Recent nearby sales** — 3–5 comparable sales (price + sq ft required; blank fields are treated as
   matching the property). Without sales, an average neighborhood $/sq ft gives a quick ballpark instead.
3. **Calculate** — shows the estimated value, a likely range, a confidence level, and an adjustment grid.

It uses the sales comparison approach: each sale is adjusted up or down for differences from the property
(size, beds, baths, age, condition, garage, pool), then blended into a weighted average where sales needing
the smallest adjustments count most.

## Files

- `index.html` — the page
- `css/style.css` — styles (light/dark, mobile, print)
- `js/app.js` — valuation logic; adjustment rates live in the `RATES` object at the top

Results can be printed / saved as PDF, and saved estimates stay in the browser's `localStorage`.

Estimates are informational only — not a licensed appraisal.
