// Edit this file to customize auto-reply behavior. No code changes needed elsewhere.

// Business hours per weekday (0 = Sunday ... 6 = Saturday). Use `null` for closed days,
// or [openHour, closeHour] in 24h local time for the `timezone` below.
export const BUSINESS_HOURS = {
  timezone: "America/New_York",
  days: {
    0: null,
    1: [9, 17],
    2: [9, 17],
    3: [9, 17],
    4: [9, 17],
    5: [9, 17],
    6: null,
  },
};

// Keyword-based FAQ auto-replies. The first rule whose keyword appears
// (case-insensitive) in the incoming message wins.
export const FAQ_RULES = [
  {
    keywords: ["hour", "open", "closed"],
    reply:
      "We're open Mon-Fri 9am-5pm ET. Outside those hours we'll get back to you as soon as we're back.",
  },
  {
    keywords: ["ship", "delivery"],
    reply:
      "Orders ship within 1-2 business days and typically arrive in 2-5 business days depending on location.",
  },
  {
    keywords: ["track", "status"],
    reply:
      "You can find your order status in the confirmation email we sent when you checked out. If you can't locate it, reply with your order number and we'll look it up.",
  },
  {
    keywords: ["refund", "return"],
    reply:
      "For refunds or returns, reply with your order number and the reason and our team will follow up with next steps.",
  },
];

export const FALLBACK_SMS =
  "Thanks for texting us! We've received your message and will reply during business hours (Mon-Fri 9am-5pm ET).";

export const FALLBACK_EMAIL_SUBJECT = "We received your message";
export const FALLBACK_EMAIL_BODY =
  "Thanks for reaching out! This is an automated confirmation that we received your email. " +
  "A team member will reply personally during business hours (Mon-Fri 9am-5pm ET).";

export function isWithinBusinessHours(date = new Date()) {
  const local = new Date(
    date.toLocaleString("en-US", { timeZone: BUSINESS_HOURS.timezone })
  );
  const hours = BUSINESS_HOURS.days[local.getDay()];
  if (!hours) return false;
  const [open, close] = hours;
  const hour = local.getHours();
  return hour >= open && hour < close;
}

export function matchFaq(text) {
  const lower = (text || "").toLowerCase();
  for (const rule of FAQ_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.reply;
    }
  }
  return null;
}
