# Business text/email auto-responder

Two ways to auto-reply to customer texts and emails, depending on whether you want
to keep using your existing phone number/Gmail as-is, or move to dedicated business
accounts (Twilio/SendGrid) for more control.

- **Option A — use what you already have** (`gmail-autoresponder.gs` + an Android app):
  no new accounts, works with your existing cell number and Gmail inbox.
- **Option B — dedicated accounts** (`worker.js` + `config.js`): a Cloudflare Worker
  using Twilio and SendGrid, independent of any personal phone/inbox. More setup, but
  centralized and API-driven.

Both use the same plain keyword-matched FAQ approach (no LLM), so replies stay
predictable. Pick one, or use Gmail from Option A alongside SMS from Option B — they
don't conflict.

---

## Option A: your existing number + Gmail

### Gmail auto-responder (free, no new accounts)

`gmail-autoresponder.gs` is a Google Apps Script that runs inside your own Google
account — no server, no signup, no cost.

**Setup:**

1. Go to [script.google.com](https://script.google.com), click **New project**.
2. Delete the placeholder code and paste in the contents of `gmail-autoresponder.gs`.
3. Edit the top section (`YOUR_BUSINESS_NAME`, `FAQ_RULES`, `BUSINESS_HOURS`) to match
   your business, then save (Ctrl/Cmd+S).
4. In the function dropdown at the top, select `createTimeTrigger` and click **Run**.
   Google will ask you to authorize the script to access your Gmail — approve it (it's
   your own script, running only in your own account).
5. That's it — `autoReplyToNewEmails` now runs automatically every 10 minutes, checking
   for new unread mail and replying based on `FAQ_RULES`, skipping anything already
   auto-replied to (tracked via an `AutoReplied` Gmail label) or that looks like another
   auto-responder/bounce (to avoid reply loops).

To change FAQ answers or hours later, edit the script at script.google.com and save —
no redeploy step needed, the trigger picks up the new code on its next run.

**Limits:** free Gmail accounts can send ~100 emails/day via Apps Script (1,500/day on
Google Workspace) — plenty for FAQ auto-replies on most small businesses.

### SMS on your existing cell number (no new accounts)

There's no way for outside code to see or reply to texts on a regular carrier SIM —
the carrier doesn't expose that. The no-account, no-porting option is an auto-reply
app installed directly on the phone that holds the SIM:

- **[Auto SMS Reply](https://play.google.com/store/apps/details?id=com.canhub.autoresponder.autoreply)**
  or **[SMS Auto Reply](https://play.google.com/store/apps/details?id=com.appmedia.smsautoreply)**
  (Android) — install on the business phone, set keyword-based rules and business
  hours directly in the app. Works entirely offline on-device; no code, no account.
- If the phone is iPhone: iOS doesn't allow third-party SMS auto-reply apps to
  intercept regular texts (only iMessage-to-iMessage "Do Not Disturb" auto-replies,
  which won't work for texts from Android users). An Android phone is required for
  this path.

This keeps your number exactly as-is with no porting. The tradeoff: rules live in the
phone's app instead of this repo, and the phone needs to stay powered on and connected.

If later you want SMS auto-replies driven by the same `FAQ_RULES` as email (centralized,
editable from this repo) without changing your number, Twilio's **Hosted SMS** can
attach SMS routing to your existing number while voice stays on your carrier — it
requires a Letter of Authorization and carrier approval (can take 1-4 weeks, not
guaranteed for all carriers/plans). Ask if you want to pursue that path.

---

## Option B: dedicated Twilio + SendGrid accounts

A Cloudflare Worker that auto-replies to incoming customer SMS (via Twilio) and
incoming customer email (via SendGrid Inbound Parse), independent of any personal
number or inbox. Replies are keyword-matched FAQ answers, falling back to a
business-hours-aware message.

Edit `config.js` to change FAQ answers, fallback messages, and business hours. No
other code changes are needed for day-to-day tweaks.

### What you need

- A [Cloudflare](https://dash.cloudflare.com/sign-up) account (free tier is enough)
- A [Twilio](https://www.twilio.com/try-twilio) account with a phone number (~$1/mo +
  ~$0.0079/SMS) — for text auto-replies
- A [SendGrid](https://signup.sendgrid.com/) account (free tier: 100 emails/day) with
  a verified sending domain — for email auto-replies
- [Node.js](https://nodejs.org/) installed locally to run `wrangler`, the Cloudflare CLI

You only need Twilio if you want SMS auto-replies, and only SendGrid if you want email
auto-replies — you can set up just one.

### 1. Deploy the Worker

```sh
cd automation
npx wrangler login          # opens a browser to authorize Cloudflare
npx wrangler deploy
```

This prints a URL like `https://jaxtrades-auto-responder.<your-subdomain>.workers.dev`.
Your webhook endpoints are:

- SMS: `https://<worker-url>/webhooks/sms`
- Email: `https://<worker-url>/webhooks/email`

### 2. Set secrets

```sh
npx wrangler secret put TWILIO_AUTH_TOKEN     # from your Twilio console (used to verify inbound requests are really from Twilio)
npx wrangler secret put SENDGRID_API_KEY      # from SendGrid > Settings > API Keys (needs "Mail Send" permission)
```

Also edit `FROM_EMAIL` in `wrangler.toml` to an address on your verified SendGrid
sending domain, then redeploy (`npx wrangler deploy`).

### 3. Connect Twilio (SMS)

In the [Twilio console](https://console.twilio.com/), open your phone number's
configuration and set **"A message comes in"** to your `/webhooks/sms` URL, method
`HTTP POST`.

### 4. Connect SendGrid (email)

1. In SendGrid, go to **Settings > Inbound Parse** and add a host, e.g.
   `support.yourdomain.com`.
2. Point that subdomain's MX record at `mx.sendgrid.net` (priority 10) in your DNS
   provider.
3. Set the Inbound Parse **Destination URL** to your `/webhooks/email` URL.
4. Give customers `support@yourdomain.com` (or whatever address you configured) as
   the contact email — mail sent there will trigger the auto-reply.

### 5. Test it

- Text your Twilio number something containing "hours" or "shipping" and confirm you
  get the matching FAQ reply; text something unrelated and confirm you get the
  fallback message.
- Email your support address the same way.

### Customizing

- **FAQ answers & keywords**: edit `FAQ_RULES` in `config.js`.
- **Business hours**: edit `BUSINESS_HOURS` in `config.js` (used for the fallback
  message's wording — the auto-reply always fires immediately, it just says whether
  you're currently open).
- **Fallback wording**: edit `FALLBACK_SMS`, `FALLBACK_EMAIL_SUBJECT`, and
  `FALLBACK_EMAIL_BODY` in `config.js`.

After editing `config.js`, redeploy with `npx wrangler deploy`.

### Notes

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
