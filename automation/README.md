# Business text/email auto-responder

A small Cloudflare Worker that auto-replies to incoming customer SMS (via Twilio)
and incoming customer email (via SendGrid Inbound Parse). Replies are keyword-matched
FAQ answers, falling back to a business-hours-aware message. This runs independently
of the GitHub Pages site — it's a separate deployable service.

Edit `config.js` to change FAQ answers, fallback messages, and business hours. No
other code changes are needed for day-to-day tweaks.

## What you need

- A [Cloudflare](https://dash.cloudflare.com/sign-up) account (free tier is enough)
- A [Twilio](https://www.twilio.com/try-twilio) account with a phone number (~$1/mo +
  ~$0.0079/SMS) — for text auto-replies
- A [SendGrid](https://signup.sendgrid.com/) account (free tier: 100 emails/day) with
  a verified sending domain — for email auto-replies
- [Node.js](https://nodejs.org/) installed locally to run `wrangler`, the Cloudflare CLI

You only need Twilio if you want SMS auto-replies, and only SendGrid if you want email
auto-replies — you can set up just one.

## 1. Deploy the Worker

```sh
cd automation
npx wrangler login          # opens a browser to authorize Cloudflare
npx wrangler deploy
```

This prints a URL like `https://jaxtrades-auto-responder.<your-subdomain>.workers.dev`.
Your webhook endpoints are:

- SMS: `https://<worker-url>/webhooks/sms`
- Email: `https://<worker-url>/webhooks/email`

## 2. Set secrets

```sh
npx wrangler secret put TWILIO_AUTH_TOKEN     # from your Twilio console (used to verify inbound requests are really from Twilio)
npx wrangler secret put SENDGRID_API_KEY      # from SendGrid > Settings > API Keys (needs "Mail Send" permission)
```

Also edit `FROM_EMAIL` in `wrangler.toml` to an address on your verified SendGrid
sending domain, then redeploy (`npx wrangler deploy`).

## 3. Connect Twilio (SMS)

In the [Twilio console](https://console.twilio.com/), open your phone number's
configuration and set **"A message comes in"** to your `/webhooks/sms` URL, method
`HTTP POST`.

## 4. Connect SendGrid (email)

1. In SendGrid, go to **Settings > Inbound Parse** and add a host, e.g.
   `support.yourdomain.com`.
2. Point that subdomain's MX record at `mx.sendgrid.net` (priority 10) in your DNS
   provider.
3. Set the Inbound Parse **Destination URL** to your `/webhooks/email` URL.
4. Give customers `support@yourdomain.com` (or whatever address you configured) as
   the contact email — mail sent there will trigger the auto-reply.

## 5. Test it

- Text your Twilio number something containing "hours" or "shipping" and confirm you
  get the matching FAQ reply; text something unrelated and confirm you get the
  fallback message.
- Email your support address the same way.

## Customizing

- **FAQ answers & keywords**: edit `FAQ_RULES` in `config.js`.
- **Business hours**: edit `BUSINESS_HOURS` in `config.js` (used for the fallback
  message's wording — the auto-reply always fires immediately, it just says whether
  you're currently open).
- **Fallback wording**: edit `FALLBACK_SMS`, `FALLBACK_EMAIL_SUBJECT`, and
  `FALLBACK_EMAIL_BODY` in `config.js`.

After editing `config.js`, redeploy with `npx wrangler deploy`.

## Notes

- This only sends **automated acknowledgement/FAQ replies** — it does not replace a
  human answering complex questions. Nothing here reads or summarizes messages with
  an LLM; it's plain keyword matching, so it stays predictable and free to run at
  volume.
- SMS marketing/auto-reply is subject to TCPA rules in the US — this auto-responder
  only replies to inbound messages from customers who already texted you (not
  unsolicited outbound marketing), which is the lower-risk case, but confirm your
  own compliance obligations if you plan to expand into outbound campaigns.
- Twilio inbound requests are verified with `X-Twilio-Signature` if
  `TWILIO_AUTH_TOKEN` is set, so random POSTs to your `/webhooks/sms` URL are
  rejected. SendGrid Inbound Parse doesn't sign requests by default, so treat that
  URL as a secret — don't publish it.
