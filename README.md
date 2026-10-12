# HomeValue — Northern Gold Coast

A simple, front-end-only property appraisal site for postcode **4209** (Coomera, Upper Coomera, Pimpama,
Willow Vale) and surrounding suburbs (Ormeau 4208, Oxenford 4210, Pacific Pines 4211, Helensvale and
Hope Island 4212). Built for GitHub Pages — no server or build step.

## How it works

1. **The property** — suburb, type (house / townhouse / unit), beds, baths, car spaces, land size (m²),
   year built, condition, pool.
2. **Email** — visitors must enter their email (name and a market-updates opt-in are optional) to get the
   estimate. It's shown on screen and emailed to them, with a copy to the site owner.

The estimate starts from the suburb's median for that property type (which describes a typical property,
see `TYPICAL`) and adjusts up or down for each difference, showing every adjustment.

## Email setup (EmailJS)

GitHub Pages can't send email, so the site uses [EmailJS](https://www.emailjs.com) (free plan: about 200
emails a month).

1. Sign up at emailjs.com.
2. **Email Services → Add New Service** → connect the inbox emails should come from (e.g. Gmail).
3. **Email Templates → Create New Template**:
   - Subject: `Your HomeValue estimate: {{estimate}}`
   - To Email: `{{to_email}}` · From Name: `HomeValue` · Reply To and **Bcc**: your own email (the Bcc gives
     you a copy of every request)
   - Content: paste `_email/estimate-template.html` (the `_email` folder isn't published on the site).
4. Put the Public Key, Service ID and Template ID into `js/config.js`.
5. **Account → Security**: restrict requests to your site's domain to stop others using your quota.

Until `js/config.js` is filled in, estimates still show on screen but no email is sent.

## Data

`js/suburbs.js` holds each suburb's 12-month median house and unit price with its source and date
(mid-2026 figures from published suburb profiles, mostly Cotality). Prices are not pulled live, so update
`SUBURBS` periodically as new medians are published. Where no unit median is available, it falls back to 75% of the house median.

## Files

- `index.html` — the page
- `css/style.css` — styles (light/dark, mobile, print)
- `js/suburbs.js` — suburb medians and typical-property profiles
- `js/app.js` — valuation logic and email sending; adjustment rates live in `RATES` at the top
- `js/config.js` — EmailJS keys
- `_email/estimate-template.html` — the email design to paste into EmailJS

Estimates are informational only — not a formal valuation by a registered valuer.
