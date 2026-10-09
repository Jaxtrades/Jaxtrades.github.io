/* Cart drawer behaviour on top of Shopify's AJAX Cart API.
   Every change asks Shopify to re-render the cart-drawer section and swaps it in,
   so prices, discounts and stock always come from Shopify. */
(function () {
  var SECTION = 'cart-drawer';
  var lastFocus = null;

  function isCartPage() {
    return document.body.classList.contains('template-cart') || location.pathname === '/cart';
  }

  function drawer() { return document.getElementById('cart-drawer'); }

  function openCart() {
    var d = drawer();
    if (!d) return;
    lastFocus = document.activeElement;
    document.body.classList.add('cart-open');
    d.setAttribute('aria-hidden', 'false');
    var close = d.querySelector('[data-close-cart]');
    if (close) close.focus();
  }

  function closeCart() {
    var d = drawer();
    if (!d) return;
    document.body.classList.remove('cart-open');
    d.setAttribute('aria-hidden', 'true');
    if (lastFocus) lastFocus.focus();
  }

  function renderSection(html) {
    if (!html) return;
    var wrapper = document.getElementById('shopify-section-' + SECTION);
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var fresh = doc.getElementById('shopify-section-' + SECTION);
    if (wrapper && fresh) wrapper.innerHTML = fresh.innerHTML;
    var d = drawer();
    if (d && document.body.classList.contains('cart-open')) d.setAttribute('aria-hidden', 'false');
  }

  function setCount(n) {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = n;
      el.hidden = n === 0;
    });
  }

  function post(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body)
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.description || data.message || 'Something went wrong. Please try again.');
        return data;
      });
    });
  }

  function refreshCount() {
    return fetch(window.cozy.routes.cart, { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (c) { setCount(c.item_count); });
  }

  function addItems(items) {
    return post(window.cozy.routes.cartAdd, { items: items, sections: SECTION })
      .then(function (data) {
        if (isCartPage()) { location.reload(); return; }
        renderSection(data.sections && data.sections[SECTION]);
        openCart();
        return refreshCount();
      })
      .catch(function (err) { alert(err.message); });
  }

  function changeLine(key, qty) {
    return post(window.cozy.routes.cartChange, { id: key, quantity: qty, sections: SECTION })
      .then(function (cart) {
        if (isCartPage()) { location.reload(); return; }
        renderSection(cart.sections && cart.sections[SECTION]);
        setCount(cart.item_count);
      })
      .catch(function (err) { alert(err.message); });
  }

  window.cozyCart = { open: openCart, close: closeCart, add: addItems };

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-open-cart]');
    if (opener && drawer() && !isCartPage()) { e.preventDefault(); openCart(); return; }
    if (e.target.closest('[data-close-cart]')) { closeCart(); return; }
    var qtyBtn = e.target.closest('[data-qty][data-key]');
    if (qtyBtn) {
      qtyBtn.disabled = true;
      changeLine(qtyBtn.dataset.key, Number(qtyBtn.dataset.qty));
    }
  });

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[data-add-form]');
    if (!form) return;
    e.preventDefault();
    var btn = form.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;
    var fd = new FormData(form);
    addItems([{ id: Number(fd.get('id')), quantity: Number(fd.get('quantity') || 1) }])
      .then(function () { if (btn) btn.disabled = false; });
  });

  var noteTimer;
  document.addEventListener('input', function (e) {
    if (!e.target.matches('[data-cart-note]')) return;
    clearTimeout(noteTimer);
    var note = e.target.value;
    noteTimer = setTimeout(function () { post(window.cozy.routes.cartUpdate, { note: note }); }, 500);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('cart-open')) closeCart();
  });
})();
