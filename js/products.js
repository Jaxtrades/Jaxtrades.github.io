/* Cozy Collectives store settings + product catalog.

   STORE holds the numbers the cart drawer and checkout use.
   PRODUCTS holds the pals. To add the AliExpress photos, save them into
   images/<product-id>/ and list the file paths in that product's `images`
   array (first image = the main/card photo). A product with no images shows
   a soft placeholder tile instead. Fields left as "" are hidden on the site. */
const STORE = {
  name: "Cozy Collectives",
  currency: "AUD",
  freeShippingThreshold: 100, // cart drawer progress bar unlocks free shipping at this subtotal
  flatShipping: 9.95,         // shipping charged below the threshold
  instalments: 4,             // "or 4 interest-free payments of $X"
  email: "hello@cozycollectives.com.au",
};

const PRODUCTS = [
  {
    id: "kip-the-koala",
    name: "Kip the Koala",
    animal: "Koala",
    tagline: "The sleepy one. Always up for a cuddle.",
    price: 79.0,
    compareAt: 99.0,
    weight: "",          // e.g. "1.5kg"
    size: "",            // e.g. "40cm"
    tone: "#D9D4CC",     // placeholder tile colour until photos are added
    images: ["images/kip-the-koala/1.webp"],
    badge: "Bestseller",
  },
  {
    id: "sully-the-sloth",
    name: "Sully the Sloth",
    animal: "Sloth",
    tagline: "Slow, steady and in no rush to let go.",
    price: 79.0,
    compareAt: 99.0,
    weight: "",
    size: "",
    tone: "#D8C7B0",
    images: ["images/sully-the-sloth/1.webp"],
    badge: "",
  },
  {
    id: "juno-the-giraffe",
    name: "Juno the Giraffe",
    animal: "Giraffe",
    tagline: "Tall on comfort, long on hugs.",
    price: 79.0,
    compareAt: 99.0,
    weight: "",
    size: "",
    tone: "#E8D3A8",
    images: ["images/juno-the-giraffe/1.webp"],
    badge: "New",
  },
  {
    id: "biscuit-the-puppy",
    name: "Biscuit the Puppy",
    animal: "Puppy",
    tagline: "Loyal, floppy-eared and very good at listening.",
    price: 79.0,
    compareAt: 99.0,
    weight: "",
    size: "",
    tone: "#E2C9B4",
    images: ["images/biscuit-the-puppy/1.webp"],
    badge: "",
  },
];

/* Shared copy for every pal's product page. Replace the [BRACKETED] parts with
   the details from the supplier listing. */
const PRODUCT_DETAILS = {
  description:
    "A soft, gently weighted plush made to be held. The weight is spread through the body and limbs, so it settles over your lap or chest like a long, steady hug. Bring it to bed, keep it on the couch, or take it to your desk.",
  features: [
    "Gently weighted for an even, hug-like feel",
    "Super-soft plush fabric",
    "Weight spread through the body and limbs",
    "Arrives gift-ready",
    "Long arms made for hugging, 50–65cm long",
    "Recommended for ages 14+",
  ],
  specs: [
    ["Length", "50cm, 60cm or 65cm, depending on the pal"],
    ["Design", "Long-arm plush, unisex"],
    ["Material", "High-quality plush fabric"],
    ["Filling", "PP cotton"],
    ["Weight", "1.14kg"],
    ["Package size", "28 × 23 × 14cm"],
    ["Recommended age", "14+ (not recommended for younger children due to size and design)"],
    ["In the box", "1 plush"],
    ["Electrical parts", "None"],
  ],
  care: "[CARE INSTRUCTIONS, e.g. spot clean with a damp cloth and mild soap; air dry]",
  shipping:
    "Free shipping on orders over $" + STORE.freeShippingThreshold + ". Orders are packed within [X] business days; delivery usually takes [X–X] business days across Australia. Not in love? Return unused pals within [30] days.",
};

function getProduct(id) {
  return PRODUCTS.find(p => p.id === id);
}

function formatPrice(n) {
  return "$" + n.toFixed(2);
}
