import {
  matchFaq,
  isWithinBusinessHours,
  FALLBACK_SMS,
  FALLBACK_EMAIL_SUBJECT,
  FALLBACK_EMAIL_BODY,
} from "./config.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/webhooks/sms") {
      return handleSms(request, url, env);
    }
    if (request.method === "POST" && url.pathname === "/webhooks/email") {
      return handleEmail(request, env);
    }
    return new Response("Not found", { status: 404 });
  },
};

async function handleSms(request, url, env) {
  const bodyText = await request.text();
  const params = Object.fromEntries(new URLSearchParams(bodyText));

  if (env.TWILIO_AUTH_TOKEN) {
    const signature = request.headers.get("X-Twilio-Signature");
    const valid = await validateTwilioSignature(
      env.TWILIO_AUTH_TOKEN,
      url.toString(),
      params,
      signature
    );
    if (!valid) {
      return new Response("Invalid signature", { status: 403 });
    }
  }

  const incoming = params.Body || "";
  const reply = matchFaq(incoming) || replyForNow();

  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(
    reply
  )}</Message></Response>`;
  return new Response(twiml, {
    headers: { "Content-Type": "text/xml" },
  });
}

async function handleEmail(request, env) {
  const form = await request.formData();
  const from = form.get("from") || "";
  const subject = form.get("subject") || "";
  const text = form.get("text") || "";

  // Extract a bare email address out of a "Name <email@x.com>" style From header.
  const match = from.match(/<(.+)>/);
  const toAddress = match ? match[1] : from.trim();

  const faqReply = matchFaq(`${subject} ${text}`);
  const replyBody = faqReply || `${FALLBACK_EMAIL_BODY}\n\n${replyForNow(true)}`;

  if (!env.SENDGRID_API_KEY || !env.FROM_EMAIL) {
    return new Response("Email auto-reply not configured", { status: 500 });
  }

  const sgResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toAddress }] }],
      from: { email: env.FROM_EMAIL },
      subject: `Re: ${subject || FALLBACK_EMAIL_SUBJECT}`,
      content: [{ type: "text/plain", value: replyBody }],
    }),
  });

  if (!sgResponse.ok) {
    const errText = await sgResponse.text();
    return new Response(`SendGrid error: ${errText}`, { status: 502 });
  }
  return new Response("OK");
}

function replyForNow(forEmail = false) {
  if (forEmail) {
    return isWithinBusinessHours()
      ? "We're open now and will get back to you shortly."
      : "We're currently outside business hours and will reply when we're back.";
  }
  return isWithinBusinessHours()
    ? "We're open now — a team member will follow up shortly."
    : FALLBACK_SMS;
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Twilio request validation: https://www.twilio.com/docs/usage/security#validating-requests
async function validateTwilioSignature(authToken, url, params, signature) {
  if (!signature) return false;
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + params[key];
  }
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(authToken),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return expected === signature;
}
