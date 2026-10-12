// Renders PRODUCT and STORE (js/product.js) and runs the cart. The cart lives in localStorage;
// checkout opens the shopper's email app with the order addressed to STORE.contactEmail.

const $ = (sel) => document.querySelector(sel);
const CART_KEY = "shop-cart-" + PRODUCT.id;
const money = new Intl.NumberFormat("en-AU", { style: "currency", currency: STORE.currency });
const fmt = (n) => money.format(n);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Grey stand-in shown when PRODUCT.images is empty.
const PLACEHOLDER = (n) => `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Product photo coming soon">
  <rect width="400" height="400" fill="#EFEFF2"/>
  <path d="M130 250l50-60 40 45 30-30 50 45z" fill="#D5D5DC"/><circle cx="250" cy="150" r="22" fill="#D5D5DC"/>
  <text x="200" y="320" text-anchor="middle" font-family="Inter, sans-serif" font-size="18" fill="#9A9AA6">Photo ${n}</text></svg>`;

const images = PRODUCT.images.length ? PRODUCT.images : [null, null, null, null];
const imageHtml = (i, alt = PRODUCT.title) => images[i] ? `<img src="${esc(images[i])}" alt="${esc(alt)}" loading="lazy">` : PLACEHOLDER(i + 1);

// ---------- Product page ----------

let selected = PRODUCT.options.map(() => 0);   // chosen value index per option group
let currentImage = 0;

function unitPrice() {
  let p = PRODUCT.price;
  PRODUCT.options.forEach((o, i) => { if (o.values[selected[i]].price != null) p = o.values[selected[i]].price; });
  return p;
}
const variantLabel = () => PRODUCT.options.map((o, i) => o.values[selected[i]].label).join(" / ");

function showImage(i) {
  currentImage = i;
  $("#main-img").innerHTML = imageHtml(i);
  document.querySelectorAll(".thumbs button").forEach((b, j) => b.setAttribute("aria-current", j === i));
}

function renderPrice() {
  const p = unitPrice();
  $("#price").textContent = fmt(p);
  const onSale = PRODUCT.compareAt && PRODUCT.compareAt > p;
  $("#compare").textContent = onSale ? fmt(PRODUCT.compareAt) : "";
  $("#save").textContent = onSale ? `Save ${Math.round((1 - p / PRODUCT.compareAt) * 100)}%` : "";
  $("#save").hidden = !onSale;
}

function renderOptions() {
  $("#options").innerHTML = PRODUCT.options.map((o, i) => `
    <div class="opt" role="group" aria-label="${esc(o.name)}">
      <span class="label">${esc(o.name)}: <em>${esc(o.values[selected[i]].label)}</em></span>
      <div class="chips">${o.values.map((v, j) =>
        `<button type="button" class="chip" data-opt="${i}" data-val="${j}" aria-pressed="${j === selected[i]}">${esc(v.label)}</button>`).join("")}
      </div>
    </div>`).join("");
}

$("#options").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  const i = +chip.dataset.opt, j = +chip.dataset.val;
  selected[i] = j;
  renderOptions();
  renderPrice();
  const img = PRODUCT.options[i].values[j].image;
  if (img != null && images[img] !== undefined) showImage(img);
});

function renderProduct() {
  document.title = `${PRODUCT.title} | ${STORE.name}`;
  document.querySelector('meta[name="description"]').content = PRODUCT.tagline;
  $("#brand").textContent = STORE.name;
  $("#announce").textContent = STORE.shippingFee ? "Fast, tracked shipping Australia-wide" : "Free shipping Australia-wide";
  $("#title").textContent = PRODUCT.title;
  $("#tagline").textContent = PRODUCT.tagline;
  $("#sold").textContent = PRODUCT.sold ? `${PRODUCT.sold.toLocaleString("en-AU")}+ sold` : "";

  if (PRODUCT.rating) {
    const full = Math.round(PRODUCT.rating);
    $("#rating").innerHTML = `<span class="stars" aria-hidden="true">${"★".repeat(full)}${"☆".repeat(5 - full)}</span> ${PRODUCT.rating.toFixed(1)}` +
      (PRODUCT.reviews ? ` · ${PRODUCT.reviews.toLocaleString("en-AU")} reviews` : "");
    $("#rating").hidden = false;
  }

  $("#thumbs").innerHTML = images.map((_, i) =>
    `<button type="button" data-i="${i}" aria-label="Show photo ${i + 1}">${imageHtml(i, "")}</button>`).join("");
  $("#thumbs").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) showImage(+b.dataset.i); });
  showImage(0);

  renderOptions();
  renderPrice();

  $("#highlights").innerHTML = PRODUCT.highlights.map((h) => `<li>${esc(h)}</li>`).join("");
  $("#perk-shipping").textContent = PRODUCT.shipping;
  $("#perk-returns").textContent = PRODUCT.returns;
  // Description entries that look like image links are shown as images.
  $("#description").innerHTML = PRODUCT.description.map((d) =>
    /^https?:\/\/\S+\.(jpe?g|png|webp|gif|avif)(\?\S*)?$/i.test(d) ? `<img src="${esc(d)}" alt="" loading="lazy">` : `<p>${esc(d)}</p>`).join("");
  $("#specs").innerHTML = PRODUCT.specs.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("");
  $("#ship-text").textContent = PRODUCT.shipping;
  $("#returns-text").textContent = PRODUCT.returns;
  $("#footer-text").textContent = `© ${new Date().getFullYear()} ${STORE.name}. Prices in ${STORE.currency}.`;
}

// Quantity stepper
const qtyInput = $("#qty");
const clampQty = (n) => Math.min(99, Math.max(1, Math.floor(n) || 1));
$("#qty-minus").onclick = () => { qtyInput.value = clampQty(+qtyInput.value - 1); };
$("#qty-plus").onclick = () => { qtyInput.value = clampQty(+qtyInput.value + 1); };
qtyInput.onchange = () => { qtyInput.value = clampQty(+qtyInput.value); };

// Details tabs
document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach((t) => t.setAttribute("aria-selected", t === tab));
  document.querySelectorAll(".panel").forEach((p) => { p.hidden = p.dataset.panel !== tab.dataset.tab; });
}));

// ---------- Cart ----------

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}
let cart = loadCart();
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* private mode: cart lasts for this visit */ }
  renderCart();
}

function addToCart() {
  const qty = clampQty(+qtyInput.value);
  const variant = variantLabel();
  const line = cart.find((l) => l.variant === variant);
  if (line) line.qty = Math.min(99, line.qty + qty);
  else cart.push({ variant, price: unitPrice(), qty, image: currentImage });
  saveCart();
}

const subtotal = () => cart.reduce((s, l) => s + l.price * l.qty, 0);
const shippingCost = () => (cart.length ? STORE.shippingFee : 0);

function renderCart() {
  const count = cart.reduce((s, l) => s + l.qty, 0);
  $("#cart-count").textContent = count;
  $("#cart-empty").hidden = cart.length > 0;
  $("#cart-list").innerHTML = cart.map((l, i) => `
    <li class="cart-item">
      <div class="thumb">${imageHtml(l.image ?? 0, "")}</div>
      <div>
        <h4>${esc(PRODUCT.title)}</h4>
        <p class="variant">${esc(l.variant)} · ${fmt(l.price)}</p>
        <div class="qty">
          <button type="button" data-act="dec" data-i="${i}" aria-label="Decrease">−</button>
          <span>${l.qty}</span>
          <button type="button" data-act="inc" data-i="${i}" aria-label="Increase">+</button>
        </div>
      </div>
      <div>
        <div class="line-price">${fmt(l.price * l.qty)}</div>
        <button type="button" class="remove" data-act="rm" data-i="${i}">Remove</button>
      </div>
    </li>`).join("");
  $("#subtotal").textContent = fmt(subtotal());
  $("#shipping").textContent = shippingCost() ? fmt(shippingCost()) : "Free";
  $("#total").textContent = fmt(subtotal() + shippingCost());
  $("#checkout-btn").disabled = !cart.length && view !== "done";
}

$("#cart-list").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-act]");
  if (!b) return;
  const l = cart[+b.dataset.i];
  if (b.dataset.act === "inc") l.qty = Math.min(99, l.qty + 1);
  if (b.dataset.act === "dec") l.qty -= 1;
  if (b.dataset.act === "rm" || l.qty < 1) cart.splice(+b.dataset.i, 1);
  saveCart();
});

// ---------- Drawer: cart -> checkout -> done ----------

let view = "cart";
const drawer = $("#drawer"), overlay = $("#overlay");

function setView(v) {
  view = v;
  $("#cart-view").hidden = v !== "cart";
  $("#checkout-view").hidden = v !== "checkout";
  $("#done-view").hidden = v !== "done";
  $("#drawer-title").textContent = { cart: "Your cart", checkout: "Delivery details", done: "Order placed" }[v];
  $("#checkout-btn").textContent = { cart: "Checkout", checkout: "Place order", done: "Continue shopping" }[v];
  $("#back-btn").hidden = v !== "checkout";
  $("#drawer-foot").querySelectorAll(".sum-row").forEach((r) => { r.hidden = v === "done"; });
  renderCart();
}

function openDrawer(v = "cart") {
  setView(v);
  overlay.hidden = false;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  $("#close-drawer").focus();
}
function closeDrawer() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
  document.body.style.overflow = "";
  if (view === "done") setView("cart");
}

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

$("#add-to-cart").onclick = () => { addToCart(); toast("Added to cart"); };
$("#buy-now").onclick = () => { addToCart(); openDrawer("checkout"); };
$("#open-cart").onclick = () => openDrawer("cart");
$("#close-drawer").onclick = closeDrawer;
overlay.onclick = closeDrawer;
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer(); });
$("#back-btn").onclick = () => setView("cart");

$("#checkout-btn").onclick = () => {
  if (view === "cart") return cart.length && setView("checkout");
  if (view === "done") return closeDrawer();
  placeOrder();
};

function placeOrder() {
  const form = $("#checkout-view");
  let ok = true;
  form.querySelectorAll("input, select, textarea").forEach((el) => {
    const bad = !el.checkValidity() || (el.required && !el.value.trim());
    el.classList.toggle("invalid", bad);
    if (bad) ok = false;
  });
  $("#form-error").hidden = ok;
  if (!ok) return form.querySelector(".invalid").focus();

  const d = Object.fromEntries(new FormData(form));
  const ref = "ORD-" + Date.now().toString(36).toUpperCase();
  const lines = cart.map((l) => `${l.qty} × ${PRODUCT.title} (${l.variant}) @ ${fmt(l.price)} = ${fmt(l.price * l.qty)}`);
  const body = [
    `Order ${ref}`, "",
    ...lines, "",
    `Subtotal: ${fmt(subtotal())}`,
    `Shipping: ${shippingCost() ? fmt(shippingCost()) : "Free"}`,
    `Total: ${fmt(subtotal() + shippingCost())}`, "",
    "Deliver to:",
    d.name, d.address, `${d.suburb} ${d.state} ${d.postcode}`, d.country, "",
    `Email: ${d.email}`, `Phone: ${d.phone || "-"}`,
    d.notes ? `Notes: ${d.notes}` : ""
  ].join("\n");

  window.location.href = `mailto:${STORE.contactEmail}?subject=${encodeURIComponent(`New order ${ref}`)}&body=${encodeURIComponent(body)}`;
  $("#order-ref").textContent = `Order reference: ${ref}`;
  cart = [];
  saveCart();
  form.reset();
  setView("done");
}

renderProduct();
renderCart();
