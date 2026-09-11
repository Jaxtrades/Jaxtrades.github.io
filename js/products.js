/* Cozzy product catalog.
   Each product has `variants` (color options, all the same price unless
   noted) and a `kind` used for card styling / badges. */
const PRODUCTS = [
  {
    id: "cozzy-pillow",
    name: "The Cozzy Pillow",
    kind: "hero",
    tagline: "Cordless heat therapy for period cramps, on demand.",
    description:
      "Our signature electric heating pillow — a plush, huggable companion that pumps out soothing, even heat exactly where you need it. Three heat settings, a 90-minute auto shut-off, and a velvet-soft removable cover you can machine wash. Cordless after charging, so it moves with you from the couch to bed to your desk.",
    bullets: [
      "3 heat settings (95°F / 110°F / 122°F)",
      "USB-C rechargeable, 2+ hrs cordless heat per charge",
      "Auto shut-off at 90 minutes — fall asleep worry-free",
      "Removable, machine-washable plush cover",
      "Gentle vibration soothe mode",
    ],
    price: 59,
    compareAt: 74,
    variants: [
      { code: "terracotta", label: "Terracotta", hex: "#D97A52" },
      { code: "blush", label: "Blush", hex: "#F3B7C0" },
      { code: "sage", label: "Sage", hex: "#93A683" },
      { code: "midnight", label: "Midnight", hex: "#332722" },
    ],
    reviewCount: 2148,
    rating: 4.9,
  },
  {
    id: "cozzy-duo",
    name: "Cozzy Duo Bundle",
    kind: "bundle",
    tagline: "Two pillows, one for you, one for your bestie (or your bag).",
    description:
      "Keep one at home and one in your tote — or split the set with someone who needs a little warmth this week. Comes with two full Cozzy Pillows in the colors of your choice, at a sweeter price than buying twice.",
    bullets: [
      "2× Cozzy Pillow, mix & match colors",
      "Save $19 vs. buying separately",
      "Ships in one gift-ready box",
    ],
    price: 99,
    compareAt: 118,
    variants: [
      { code: "terracotta", label: "Terracotta", hex: "#D97A52" },
      { code: "blush", label: "Blush", hex: "#F3B7C0" },
      { code: "sage", label: "Sage", hex: "#93A683" },
      { code: "midnight", label: "Midnight", hex: "#332722" },
    ],
    reviewCount: 612,
    rating: 4.9,
  },
  {
    id: "cozzy-cover",
    name: "Spare Plush Cover",
    kind: "accessory",
    tagline: "A fresh cuddle layer for your Cozzy.",
    description:
      "Life happens. Keep a backup cover on hand so your Cozzy is always ready — soft, quick-dry, and easy to swap on and off in seconds.",
    bullets: ["Fits all Cozzy Pillows", "Machine washable", "Quick-dry fabric"],
    price: 19,
    compareAt: null,
    variants: [
      { code: "terracotta", label: "Terracotta", hex: "#D97A52" },
      { code: "blush", label: "Blush", hex: "#F3B7C0" },
      { code: "sage", label: "Sage", hex: "#93A683" },
      { code: "midnight", label: "Midnight", hex: "#332722" },
    ],
    reviewCount: 341,
    rating: 4.8,
  },
  {
    id: "cozzy-pouch",
    name: "Cozzy Travel Pouch",
    kind: "accessory",
    tagline: "For dorm rooms, desks, and everywhere in between.",
    description:
      "A cute quilted pouch sized just for your Cozzy Pillow and charging cable, so comfort fits in any bag.",
    bullets: ["Fits Cozzy Pillow + cable", "Quilted, wipeable exterior", "Drawstring close"],
    price: 15,
    compareAt: null,
    variants: [
      { code: "terracotta", label: "Terracotta", hex: "#D97A52" },
      { code: "blush", label: "Blush", hex: "#F3B7C0" },
      { code: "sage", label: "Sage", hex: "#93A683" },
    ],
    reviewCount: 158,
    rating: 4.7,
  },
];

function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function getVariant(product, code) {
  return product.variants.find((v) => v.code === code) || product.variants[0];
}

function formatPrice(n) {
  return "$" + n.toFixed(2).replace(/\.00$/, "");
}
