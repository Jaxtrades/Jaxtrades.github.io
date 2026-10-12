// Shopify version of shop/js/shop.js: options, gallery and quantity on the product page, plus a cart
// drawer backed by Shopify's AJAX cart (/cart/add.js, /cart/change.js, /cart.js). Checkout is Shopify's.

(() => {
  const $ = (sel) => document.querySelector(sel);
  const cfg = window.SHOP_COPY;
  const money = new Intl.NumberFormat(cfg.locale, { style: "currency", currency: cfg.currency });
  const fmt = (cents) => money.format(cents / 100);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  async function post(url, body) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.description || data.message || "Something went wrong");
    return data;
  }

  // ---------- Cart drawer ----------

  const drawer = $("#drawer"), overlay = $("#overlay");

  function renderCart(cart) {
    $("#cart-count").textContent = cart.item_count;
    $("#cart-empty").hidden = cart.items.length > 0;
    $("#checkout-btn").disabled = !cart.items.length;
    $("#cart-list").innerHTML = cart.items.map((item) => `
      <li class="cart-item">
        <div class="thumb">${item.image ? `<img src="${esc(item.image + (item.image.includes("?") ? "&" : "?") + "width=160")}" alt="">` : ""}</div>
        <div>
          <h4>${esc(item.product_title)}</h4>
          <p class="variant">${item.variant_title ? esc(item.variant_title) + " · " : ""}${fmt(item.final_price)}</p>
          <div class="qty">
            <button type="button" data-key="${esc(item.key)}" data-qty="${item.quantity - 1}" aria-label="Decrease">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-key="${esc(item.key)}" data-qty="${item.quantity + 1}" aria-label="Increase">+</button>
          </div>
        </div>
        <div>
          <div class="line-price">${fmt(item.final_line_price)}</div>
          <button type="button" class="remove" data-key="${esc(item.key)}" data-qty="0">Remove</button>
        </div>
      </li>`).join("");
    $("#subtotal").textContent = fmt(cart.items_subtotal_price);
    $("#total").textContent = fmt(cart.total_price);
  }

  async function refreshCart() {
    const res = await fetch(cfg.routes.cart, { headers: { Accept: "application/json" } });
    renderCart(await res.json());
  }

  $("#cart-list").addEventListener("click", async (e) => {
    const b = e.target.closest("button[data-key]");
    if (!b) return;
    drawer.classList.add("busy");
    try { renderCart(await post(cfg.routes.cartChange, { id: b.dataset.key, quantity: Math.max(0, +b.dataset.qty) })); }
    catch (err) { toast(err.message); }
    finally { drawer.classList.remove("busy"); }
  });

  function openDrawer() {
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
  }
  $("#open-cart").onclick = () => { refreshCart(); openDrawer(); };
  $("#close-drawer").onclick = closeDrawer;
  overlay.onclick = closeDrawer;
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer(); });
  $("#checkout-btn").onclick = () => { window.location.href = "/checkout"; };

  refreshCart();

  // ---------- Product page ----------

  const productEl = $("#product-json");
  if (!productEl) return;
  const product = JSON.parse(productEl.textContent);
  let variant = product.variants.find((v) => v.id === JSON.parse($("#current-variant").textContent)) || product.variants[0];
  const selected = [...variant.options];

  function showImage(src, alt, mediaId) {
    const main = $("#main-img");
    if (!main || !src) return;
    main.innerHTML = `<img src="${esc(src)}" alt="${esc(alt)}">`;
    document.querySelectorAll("#thumbs button").forEach((b) => b.setAttribute("aria-current", String(b.dataset.mediaId === String(mediaId))));
  }

  $("#thumbs")?.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) showImage(b.dataset.src, b.dataset.alt, b.dataset.mediaId);
  });

  function renderVariant() {
    $("#price").textContent = fmt(variant.price);
    const onSale = variant.compare_at_price > variant.price;
    $("#compare").textContent = onSale ? fmt(variant.compare_at_price) : "";
    $("#save").textContent = onSale ? `Save ${Math.round((1 - variant.price / variant.compare_at_price) * 100)}%` : "";
    $("#save").hidden = !onSale;
    const sku = $("#sku");
    if (sku) sku.textContent = variant.sku || "—";
    ["#add-to-cart", "#buy-now"].forEach((s) => { $(s).disabled = !variant.available; });
    $("#add-to-cart").textContent = variant.available ? "Add to cart" : "Sold out";
    if (variant.featured_media) {
      const thumb = document.querySelector(`#thumbs button[data-media-id="${variant.featured_media.id}"]`);
      if (thumb) showImage(thumb.dataset.src, thumb.dataset.alt, thumb.dataset.mediaId);
    }
    const url = new URL(window.location.href);
    url.searchParams.set("variant", variant.id);
    history.replaceState(null, "", url);
  }

  $("#options")?.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const i = +chip.dataset.opt;
    selected[i] = chip.dataset.value;
    chip.parentElement.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    document.querySelector(`[data-selected="${i}"]`).textContent = chip.dataset.value;
    const match = product.variants.find((v) => v.options.every((o, j) => o === selected[j]));
    if (match) { variant = match; renderVariant(); }
    else {
      ["#add-to-cart", "#buy-now"].forEach((s) => { $(s).disabled = true; });
      $("#add-to-cart").textContent = "Unavailable";
    }
  });

  const qtyInput = $("#qty");
  const clampQty = (n) => Math.min(99, Math.max(1, Math.floor(n) || 1));
  $("#qty-minus").onclick = () => { qtyInput.value = clampQty(+qtyInput.value - 1); };
  $("#qty-plus").onclick = () => { qtyInput.value = clampQty(+qtyInput.value + 1); };
  qtyInput.onchange = () => { qtyInput.value = clampQty(+qtyInput.value); };

  async function addToCart() {
    await post(cfg.routes.cartAdd, { items: [{ id: variant.id, quantity: clampQty(+qtyInput.value) }] });
    await refreshCart();
  }

  $("#add-to-cart").onclick = async () => {
    try { await addToCart(); toast("Added to cart"); }
    catch (err) { toast(err.message); }
  };
  $("#buy-now").onclick = async () => {
    try { await addToCart(); window.location.href = "/checkout"; }
    catch (err) { toast(err.message); }
  };

  document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
    document.querySelectorAll(".panel").forEach((p) => { p.hidden = p.dataset.panel !== tab.dataset.tab; });
  }));
})();
