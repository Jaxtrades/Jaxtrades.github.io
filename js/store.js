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
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>',
  gift: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18M12 9v11M12 9S10.5 4 8 4.5 7.5 9 12 9Zm0 0s1.5-5 4-4.5S16.5 9 12 9Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/></svg>',
};

/* ---------- Chrome ---------- */
function renderChrome() {
  const header = document.getElementById("site-header");
  if (header) {
    header.outerHTML = `
    <div class="announce">💛 $${STORE.donationPerPlush} from every plush donated to ${STORE.charity} &nbsp;|&nbsp; Free shipping over $${STORE.freeShippingThreshold}</div>
    <header class="site-header">
      <div class="wrap nav">
        <button class="icon-btn nav-toggle" aria-label="Open menu" aria-expanded="false">${ICON.menu}</button>
        <a href="index.html" class="brand">Cozy Cubs</a>
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
          <div class="brand">Cozy Cubs</div>
          <p>Weighted plush comfort, made to be held.<br><a href="mailto:${STORE.email}">${STORE.email}</a></p>
          <p class="give-line">${ICON.heart} $${STORE.donationPerPlush} from every plush goes to ${STORE.charity}.</p>
        </div>
        <div><b>Shop</b><a href="shop.html">All pals</a><a href="index.html#why">Why weighted</a><a href="about.html">Our story</a></div>
        <div><b>Support</b><a href="about.html#faq">FAQ</a><a href="about.html#shipping">Shipping and returns</a><a href="mailto:${STORE.email}">Contact us</a></div>
        <div><b>Follow</b><a href="#contact">Instagram</a><a href="#contact">TikTok</a><a href="#contact">Facebook</a></div>
      </div>
      <div class="wrap footer-bottom">© 2026 Cozy Cubs. All prices in ${STORE.currency}.</div>
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

/* "Thank you, $X from this order is going to <charity>." — $X scales with the number of plushies. */
function giveNoteHtml(count) {
  if (!count || !STORE.charity) return "";
  return `<p class="give-note">${ICON.heart}<span>Thank you, <b>$${STORE.donationPerPlush * count}</b> from this order is going to ${STORE.charity}.</span></p>`;
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
    <h3>Add another pal</h3>
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
    ${giveNoteHtml(count)}
    <a href="checkout.html" class="btn block checkout-btn">${ICON.lock} Checkout</a>
    <p class="instal">or ${STORE.instalments} interest-free payments of <b>${formatPrice(subtotal / STORE.instalments)}</b></p>
    <div class="pay-icons" aria-label="Accepted payments"><span>Visa</span><span>Mastercard</span><span>Amex</span><span>PayPal</span><span>Afterpay</span></div>
    <a href="cart.html" class="view-cart">View full cart</a>`;
}

/* ---------- Welcome pop-up ----------
   Shows once per visitor, a few seconds after their first visit, never on
   cart or checkout. Signing up reveals the discount code. */
const POPUP_KEY = "cozycollectives_popup_seen";

function popupSeen() {
  try { return localStorage.getItem(POPUP_KEY) === "1"; } catch (e) { return false; }
}

function markPopupSeen() {
  try { localStorage.setItem(POPUP_KEY, "1"); } catch (e) {}
}

function onCartOrCheckout() {
  const where = (location.pathname + location.hash).toLowerCase();
  return /cart|checkout/.test(where);
}

function renderPopup() {
  if (popupSeen() || onCartOrCheckout()) return;
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="popup-overlay" data-close-popup></div>
    <div class="popup" id="welcome-popup" role="dialog" aria-modal="true" aria-labelledby="popup-title" aria-hidden="true">
      <button class="icon-btn popup-close" data-close-popup aria-label="Close">${ICON.close}</button>
      <div class="popup-media"><img src="images/popup.webp" alt="A woman relaxing in bed hugging Biscuit the Puppy, with Juno, Sully and Kip beside her" loading="lazy"></div>
      <div class="popup-body">
        <div class="popup-form-view">
          <div class="eyebrow">Join the club</div>
          <h2 id="popup-title"><span class="popup-big">${STORE.welcomeDiscount}% off</span> your first pal</h2>
          <p>Sign up for early access to new pals and member offers, and we'll send ${STORE.welcomeDiscount}% off your first order.</p>
          <form class="popup-form" id="popup-form">
            <label for="popup-email" class="sr-only">Email address</label>
            <input id="popup-email" type="email" placeholder="Your email" autocomplete="email" required>
            <button class="btn block" type="submit">Get my ${STORE.welcomeDiscount}% off</button>
          </form>
          <button class="popup-skip" type="button" data-close-popup>No thanks</button>
          <p class="popup-fine">One use per customer. Unsubscribe any time.</p>
        </div>
        <div class="popup-success-view" hidden>
          <div class="eyebrow">You're in</div>
          <h2>Here's your ${STORE.welcomeDiscount}% off</h2>
          <p>Use this code at checkout:</p>
          <div class="popup-code"><span id="popup-code">${STORE.welcomeCode}</span><button class="btn-mini" type="button" id="popup-copy">Copy</button></div>
          <a href="shop.html" class="btn block" data-close-popup>Shop the pals</a>
        </div>
      </div>
    </div>`;
  document.body.append(...wrap.children);

  const popup = document.getElementById("welcome-popup");
  let lastFocusPopup = null;
  const open = () => {
    if (popupSeen() || onCartOrCheckout() || document.body.classList.contains("cart-open")) return;
    lastFocusPopup = document.activeElement;
    document.body.classList.add("popup-open");
    popup.setAttribute("aria-hidden", "false");
    document.getElementById("popup-email").focus({ preventScroll: true });
  };
  const close = () => {
    markPopupSeen();
    document.body.classList.remove("popup-open");
    popup.setAttribute("aria-hidden", "true");
    if (lastFocusPopup) lastFocusPopup.focus({ preventScroll: true });
  };

  document.addEventListener("click", e => { if (e.target.closest("[data-close-popup]")) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && document.body.classList.contains("popup-open")) close(); });
  document.getElementById("popup-form").addEventListener("submit", e => {
    e.preventDefault();
    markPopupSeen();
    popup.querySelector(".popup-form-view").hidden = true;
    popup.querySelector(".popup-success-view").hidden = false;
    document.getElementById("popup-copy").focus();
  });
  document.getElementById("popup-copy").addEventListener("click", e => {
    const btn = e.currentTarget;
    const done = () => { btn.textContent = "Copied"; };
    try {
      navigator.clipboard.writeText(STORE.welcomeCode).then(done, () => selectCode());
    } catch (err) { selectCode(); }
  });
  function selectCode() {
    const range = document.createRange();
    range.selectNodeContents(document.getElementById("popup-code"));
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
  }

  setTimeout(open, STORE.welcomeDelay * 1000);
}

document.addEventListener("DOMContentLoaded", renderChrome);
document.addEventListener("DOMContentLoaded", renderPopup);
