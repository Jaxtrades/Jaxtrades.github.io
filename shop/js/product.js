/*
 * Everything the shop shows about the product lives here.
 *
 * Source listing: https://www.aliexpress.com/item/1005009503631046.html
 * Only the price (AU$10.54 sale, AU$21.97 regular) and the ~2,858 orders come from that link's
 * URL. The listing itself could not be loaded, so every field marked TODO is a placeholder:
 * replace it with the real text and image links from the listing.
 *
 * The prices below are the AliExpress prices. If you resell, set `price` to your retail price.
 */
const STORE = {
  name: "Your Store",                       // TODO: store name
  currency: "AUD",
  shippingFee: 0,                           // flat shipping per order; 0 = free
  contactEmail: "orders@example.com"     // TODO: orders are emailed here from the checkout form
};

const PRODUCT = {
  id: "1005009503631046",
  title: "Product name",                    // TODO: product title from the listing
  tagline: "One-line pitch for the product.", // TODO
  price: 10.54,
  compareAt: 21.97,
  sold: 2858,
  rating: null,                             // TODO: e.g. 4.8 (null hides the stars)
  reviews: null,                            // TODO: review count

  // TODO: paste the listing's image links (right-click each photo > Copy image address).
  // Leave the array empty to show placeholders.
  images: [],

  // One entry per option group on the listing, e.g. Colour, Size. Each value can carry an
  // optional `price` that overrides the base price and an `image` index into `images`.
  options: [
    { name: "Option", values: [{ label: "Option 1" }, { label: "Option 2" }] } // TODO
  ],

  // Short selling points shown beside the buy box.
  highlights: [                             // TODO
    "Highlight one",
    "Highlight two",
    "Highlight three"
  ],

  // Paragraphs for the Description tab.
  description: [                            // TODO
    "Paste the product description from the listing here."
  ],

  // Rows for the Specifications tab: [label, value].
  specs: [                                  // TODO
    ["Brand", "—"],
    ["Material", "—"],
    ["Size", "—"]
  ],

  shipping: "Free shipping. Usually arrives in 7–15 business days.", // TODO: confirm
  returns: "30-day returns if the item arrives damaged or not as described." // TODO: confirm
};
