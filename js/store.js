/* Cart state (localStorage) + shared page chrome: announcement bar, header,
   footer and the slide-out cart drawer. Every page includes products.js then
   this file, and puts <div id="site-header"></div> / <div id="site-footer"></div>
   where the chrome goes. Cart lines are keyed by product id. */
const CART_KEY = "cozycollectives_cart";
const NOTE_KEY = "cozycollectives_note";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveCart(cart) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  renderCart();
}

function addToCart(productId, qty) {
  const cart = getCart();
  cart[productId] = (cart[productId] || 0) + (qty || 1);
  saveCart(cart);
}

function setCartQty(productId, qty) {
  const cart = getCart();
  if (qty <= 0) delete cart[productId];
  else cart[productId] = qty;
  saveCart(cart);
}

function clearCart() {
  try { localStorage.removeItem(CART_KEY); localStorage.removeItem(NOTE_KEY); } catch (e) {}
  renderCart();
}

function getCartLines() {
  const cart = getCart();
  return Object.keys(cart)
    .map(id => ({ product: getProduct(id), qty: cart[id] }))
    .filter(l => l.product)
    .map(l => ({ ...l, lineTotal: l.product.price * l.qty }));
}

function cartCount() {
  return getCartLines().reduce((n, l) => n + l.qty, 0);
}

function cartSubtotal() {
  return getCartLines().reduce((n, l) => n + l.lineTotal, 0);
}

function shippingFor(subtotal) {
  return subtotal >= STORE.freeShippingThreshold ? 0 : STORE.flatShipping;
}

function getNote() {
  try { return localStorage.getItem(NOTE_KEY) || ""; } catch (e) { return ""; }
}

/* Product image or a placeholder tile when no photos have been added yet. */
function productMedia(p, index) {
  const src = p.images[index || 0];
  if (src) return `<img src="${src}" alt="${p.name}" loading="lazy">`;
  return `<div class="ph" style="background:${p.tone}"><span>${p.animal}</span></div>`;
}

/* ---------- Icons (inline stroke SVG) ---------- */
const ICON = {
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  truck: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.5"/><circle cx="17" cy="17.5" r="1.5"/></svg>',
  gift: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18M12 9v11M12 9S10.5 4 8 4.5 7.5 9 12 9Zm0 0s1.5-5 4-4.5S16.5 9 12 9Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/></svg>',
};

/* ---------- Chrome ---------- */
function renderChrome() {
  const header = document.getElementById("site-header");
  if (header) {
    header.outerHTML = `
    <div class="announce">Free shipping on orders over $${STORE.freeShippingThreshold} &nbsp;|&nbsp; Gift-ready packaging on every pal</div>
    <header class="site-header">
      <div class="wrap nav">
        <button class="icon-btn nav-toggle" aria-label="Open menu" aria-expanded="false">${ICON.menu}</button>
        <a href="index.html" class="brand">Cozy Collectives</a>
        <nav class="nav-links" aria-label="Main">
          <a href="shop.html">Shop</a>
          <a href="index.html#why">Why Weighted?</a>
          <a href="index.html#calm">Anxiety &amp; Calm</a>
          <a href="about.html">Our Story</a>
          <a href="about.html#faq">FAQ</a>
          <a href="#contact">Contact</a>
        </nav>
        <button class="cart-btn" data-open-cart aria-label="Open cart">${ICON.bag}<span>Cart</span><b class="cart-count">0</b></button>
      </div>
    </header>`;
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.outerHTML = `
    <footer class="site-footer" id="contact">
      <div class="wrap footer-grid">
        <div class="footer-about">
          <div class="brand">Cozy Collectives</div>
          <p>Weighted plush comfort, made to be held.<br><a href="mailto:${STORE.email}">${STORE.email}</a></p>
        </div>
        <div><b>Shop</b><a href="shop.html">All pals</a><a href="index.html#why">Why weighted</a><a href="about.html">Our story</a></div>
        <div><b>Support</b><a href="about.html#faq">FAQ</a><a href="about.html#shipping">Shipping and returns</a><a href="mailto:${STORE.email}">Contact us</a></div>
        <div><b>Follow</b><a href="#contact">Instagram</a><a href="#contact">TikTok</a><a href="#contact">Facebook</a></div>
      </div>
      <div class="wrap footer-bottom">© 2026 Cozy Collectives. All prices in ${STORE.currency}.</div>
    </footer>`;
  }

  // Cart drawer lives at the end of <body> on every page.
  const drawer = document.createElement("div");
  drawer.innerHTML = `
    <div class="drawer-overlay" data-close-cart></div>
    <aside class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-hidden="true">
      <div class="drawer-head">
        <h2 id="cart-title">Your cart <span class="drawer-count"></span></h2>
        <button class="icon-btn" data-close-cart aria-label="Close cart">${ICON.close}</button>
      </div>
      <div class="ship-bar" id="ship-bar"></div>
      <div class="drawer-body" id="drawer-body"></div>
      <div class="drawer-foot" id="drawer-foot"></div>
    </aside>`;
  document.body.append(...drawer.children);

  const toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = document.querySelector(".nav-links").classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
  }

  document.addEventListener("click", e => {
    if (e.target.closest("[data-open-cart]")) { e.preventDefault(); openCart(); }
    if (e.target.closest("[data-close-cart]")) closeCart();

    const qtyBtn = e.target.closest("[data-qty]");
    if (qtyBtn) {
      const id = qtyBtn.dataset.id;
      setCartQty(id, (getCart()[id] || 0) + Number(qtyBtn.dataset.qty));
    }
    const removeBtn = e.target.closest("[data-remove]");
    if (removeBtn) setCartQty(removeBtn.dataset.remove, 0);

    const quickAdd = e.target.closest("[data-add]");
    if (quickAdd) {
      e.preventDefault();
      addToCart(quickAdd.dataset.add, 1);
      openCart();
    }
  });

  document.addEventListener("input", e => {
    if (e.target.id === "cart-note") {
      try { localStorage.setItem(NOTE_KEY, e.target.value); } catch (err) {}
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && document.body.classList.contains("cart-open")) closeCart();
  });

  renderCart();
}

let lastFocus = null;

function openCart() {
  lastFocus = document.activeElement;
  document.body.classList.add("cart-open");
  document.getElementById("cart-drawer").setAttribute("aria-hidden", "false");
  document.querySelector("#cart-drawer [data-close-cart]").focus();
}

function closeCart() {
  document.body.classList.remove("cart-open");
  document.getElementById("cart-drawer").setAttribute("aria-hidden", "true");
  if (lastFocus) lastFocus.focus();
}

/* Free-shipping progress message + bar, shared by drawer and cart page. */
function shipBarHtml(subtotal) {
  const left = STORE.freeShippingThreshold - subtotal;
  const pct = Math.min(100, (subtotal / STORE.freeShippingThreshold) * 100);
  const msg = left > 0
    ? `You're <b>${formatPrice(left)}</b> away from <b>free shipping</b>`
    : `${ICON.truck}<span>You've unlocked <b>free shipping</b></span>`;
  return `<p class="ship-msg">${msg}</p><div class="ship-track"><div class="ship-fill" style="width:${pct}%"></div></div>`;
}

function lineHtml(l) {
  const p = l.product;
  return `
  <div class="line">
    <a href="product.html?id=${p.id}" class="line-img">${productMedia(p)}</a>
    <div class="line-info">
      <a href="product.html?id=${p.id}" class="line-name">${p.name}</a>
      <div class="line-price">${formatPrice(p.price)}${p.compareAt ? ` <s>${formatPrice(p.compareAt)}</s>` : ""}</div>
      <div class="line-actions">
        <div class="stepper">
          <button data-qty="-1" data-id="${p.id}" aria-label="Decrease quantity of ${p.name}">${ICON.minus}</button>
          <span aria-live="polite">${l.qty}</span>
          <button data-qty="1" data-id="${p.id}" aria-label="Increase quantity of ${p.name}">${ICON.plus}</button>
        </div>
        <button class="remove" data-remove="${p.id}" aria-label="Remove ${p.name}">${ICON.trash}</button>
      </div>
    </div>
    <div class="line-total">${formatPrice(l.lineTotal)}</div>
  </div>`;
}

function upsellHtml(lines) {
  const inCart = new Set(lines.map(l => l.product.id));
  const picks = PRODUCTS.filter(p => !inCart.has(p.id)).slice(0, 3);
  if (!picks.length) return "";
  return `
  <div class="upsell">
    <h3>Add a friend to the collective</h3>
    <div class="upsell-row">
      ${picks.map(p => `
      <div class="upsell-card">
        <a href="product.html?id=${p.id}" class="upsell-img">${productMedia(p)}</a>
        <div class="upsell-name">${p.name}</div>
        <div class="upsell-price">${formatPrice(p.price)}</div>
        <button class="btn-mini" data-add="${p.id}">Add</button>
      </div>`).join("")}
    </div>
  </div>`;
}

function renderCart() {
  const count = cartCount();
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = count;
    el.hidden = count === 0;
  });

  const body = document.getElementById("drawer-body");
  if (!body) return;
  const lines = getCartLines();
  const subtotal = cartSubtotal();
  document.querySelector(".drawer-count").textContent = count ? `(${count})` : "";
  document.getElementById("ship-bar").innerHTML = shipBarHtml(subtotal);

  if (!lines.length) {
    body.innerHTML = `
      <div class="drawer-empty">
        <p>Your cart is empty.</p>
        <a href="shop.html" class="btn">Shop the pals</a>
      </div>
      ${upsellHtml(lines)}`;
    document.getElementById("drawer-foot").innerHTML = "";
    return;
  }

  body.innerHTML = lines.map(lineHtml).join("") + upsellHtml(lines);

  const savings = lines.reduce((n, l) => n + ((l.product.compareAt || l.product.price) - l.product.price) * l.qty, 0);
  const noteOpen = document.querySelector(".note-box[open]") ? " open" : "";
  document.getElementById("drawer-foot").innerHTML = `
    <details class="note-box"${noteOpen}>
      <summary>Add a gift note</summary>
      <label for="cart-note" class="sr-only">Gift note</label>
      <textarea id="cart-note" rows="3" placeholder="We'll handwrite it on a card for you">${getNote()}</textarea>
    </details>
    ${savings > 0 ? `<div class="sum-row save"><span>You save</span><span>${formatPrice(savings)}</span></div>` : ""}
    <div class="sum-row total"><span>Subtotal</span><span>${formatPrice(subtotal)} ${STORE.currency}</span></div>
    <p class="fine">Taxes included. Shipping calculated at checkout.</p>
    <a href="checkout.html" class="btn block checkout-btn">${ICON.lock} Checkout</a>
    <p class="instal">or ${STORE.instalments} interest-free payments of <b>${formatPrice(subtotal / STORE.instalments)}</b></p>
    <div class="pay-icons" aria-label="Accepted payments"><span>Visa</span><span>Mastercard</span><span>Amex</span><span>PayPal</span><span>Afterpay</span></div>
    <a href="cart.html" class="view-cart">View full cart</a>`;
}

document.addEventListener("DOMContentLoaded", renderChrome);
