/* Shared cart utilities + nav badge used on every page.
   Cart keys are "<productId>::<variantCode>" so each color is its own line item. */
const CART_KEY = "cozzy_cart";

function cartKey(productId, variantCode) {
  return productId + "::" + variantCode;
}

function parseCartKey(key) {
  const [productId, variantCode] = key.split("::");
  return { productId, variantCode };
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, variantCode, qty) {
  qty = qty || 1;
  const key = cartKey(productId, variantCode);
  const cart = getCart();
  cart[key] = (cart[key] || 0) + qty;
  saveCart(cart);
}

function setCartQty(key, qty) {
  const cart = getCart();
  if (qty <= 0) {
    delete cart[key];
  } else {
    cart[key] = qty;
  }
  saveCart(cart);
}

function removeFromCart(key) {
  const cart = getCart();
  delete cart[key];
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

/* Resolves cart keys to {key, product, variant, qty, lineTotal}, skipping any
   line items whose product/variant no longer exists in the catalog. */
function getCartLines() {
  const cart = getCart();
  const lines = [];
  for (const key in cart) {
    const { productId, variantCode } = parseCartKey(key);
    const product = getProduct(productId);
    const variant = product && getVariant(product, variantCode);
    if (!product || !variant) continue;
    const qty = cart[key];
    lines.push({ key, product, variant, qty, lineTotal: product.price * qty });
  }
  return lines;
}

function cartCount() {
  const cart = getCart();
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

function cartTotal() {
  return getCartLines().reduce((sum, line) => sum + line.lineTotal, 0);
}

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = cartCount();
}

document.addEventListener("DOMContentLoaded", updateCartBadge);
