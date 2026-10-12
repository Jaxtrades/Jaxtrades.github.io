(() => {
  const config = window.QuitStick || { routes: {}, strings: {} };

  /* Mobile menu */
  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-menu-toggle]');
    if (!toggle) return;
    const header = toggle.closest('.site-header');
    const open = header.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  /* Age gate */
  const ageGate = document.querySelector('[data-age-gate]');
  if (ageGate) {
    let confirmed = false;
    try { confirmed = localStorage.getItem('qs-age-ok') === '1'; } catch (e) {}
    if (!confirmed && !window.Shopify?.designMode) {
      ageGate.hidden = false;
      document.body.classList.add('is-locked');
    }
    ageGate.querySelector('[data-age-yes]')?.addEventListener('click', () => {
      try { localStorage.setItem('qs-age-ok', '1'); } catch (e) {}
      ageGate.hidden = true;
      document.body.classList.remove('is-locked');
    });
    ageGate.querySelector('[data-age-no]')?.addEventListener('click', () => {
      ageGate.querySelector('[data-age-message]').hidden = false;
    });
  }

  /* Cart drawer */
  const drawer = document.querySelector('[data-cart-drawer]');

  const openDrawer = () => {
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    drawer.querySelector('[data-drawer-close]')?.focus();
  };

  const closeDrawer = () => {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  };

  const updateCount = (count) => {
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = count;
      el.hidden = count === 0;
    });
  };

  const refreshDrawer = async () => {
    if (!drawer) return;
    const res = await fetch(`${window.Shopify?.routes?.root || '/'}?section_id=cart-drawer`);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const fresh = doc.querySelector('[data-cart-drawer-content]');
    const current = drawer.querySelector('[data-cart-drawer-content]');
    if (fresh && current) current.replaceWith(fresh);
    const count = Number(fresh?.dataset.cartCount || 0);
    updateCount(count);
  };

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-drawer-close]') || event.target.matches('.drawer__overlay')) {
      closeDrawer();
    }
    const opener = event.target.closest('[data-cart-open]');
    if (opener && drawer && drawer.dataset.enabled === 'true') {
      event.preventDefault();
      openDrawer();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDrawer();
  });

  const changeLine = async (key, quantity, container) => {
    container?.classList.add('is-loading');
    try {
      await fetch(`${config.routes.cart_change_url}.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: key, quantity })
      });
      if (container?.closest('[data-cart-drawer]')) {
        await refreshDrawer();
      } else {
        window.location.reload();
      }
    } finally {
      container?.classList.remove('is-loading');
    }
  };

  /* Quantity steppers (product page and cart) */
  document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-qty]');
    if (!btn) return;
    const wrap = btn.closest('.quantity');
    const input = wrap.querySelector('input');
    const step = btn.dataset.qty === 'plus' ? 1 : -1;
    const min = Number(input.min || 0);
    const next = Math.max(min, Number(input.value || 0) + step);
    input.value = next;
    const line = btn.closest('[data-line-key]');
    if (line) changeLine(line.dataset.lineKey, next, line.closest('[data-cart-drawer-content], .cart-page'));
  });

  document.addEventListener('click', (event) => {
    const remove = event.target.closest('[data-line-remove]');
    if (!remove) return;
    event.preventDefault();
    const line = remove.closest('[data-line-key]');
    changeLine(line.dataset.lineKey, 0, line.closest('[data-cart-drawer-content], .cart-page'));
  });

  document.addEventListener('change', (event) => {
    const input = event.target.closest('[data-line-key] .quantity input');
    if (!input) return;
    const line = input.closest('[data-line-key]');
    changeLine(line.dataset.lineKey, Number(input.value), line.closest('[data-cart-drawer-content], .cart-page'));
  });

  /* Add to cart */
  document.addEventListener('submit', async (event) => {
    const form = event.target.closest('form[data-product-form]');
    if (!form || !drawer || drawer.dataset.enabled !== 'true') return;
    event.preventDefault();
    const button = form.querySelector('[type="submit"]');
    const label = button.querySelector('span') || button;
    const original = label.textContent;
    button.disabled = true;
    label.textContent = config.strings.adding || 'Adding...';
    const error = form.querySelector('[data-form-error]');
    if (error) error.hidden = true;
    try {
      const res = await fetch(`${config.routes.cart_add_url}.js`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.description || data.message || 'Could not add to cart');
      await refreshDrawer();
      openDrawer();
    } catch (err) {
      if (error) {
        error.textContent = err.message;
        error.hidden = false;
      }
    } finally {
      button.disabled = false;
      label.textContent = original;
    }
  });

  /* Variant picker */
  document.querySelectorAll('[data-product]').forEach((root) => {
    const dataEl = root.querySelector('[data-product-json]');
    if (!dataEl) return;
    const product = JSON.parse(dataEl.textContent);
    const idInput = root.querySelector('input[name="id"]');
    const priceEl = root.querySelector('[data-price]');
    const compareEl = root.querySelector('[data-compare-price]');
    const button = root.querySelector('[data-add-button]');
    const buttonLabel = button?.querySelector('span');
    const mainImage = root.querySelector('.js-main-image');
    const money = (cents) => new Intl.NumberFormat(document.documentElement.lang || 'en', {
      style: 'currency',
      currency: product.currency
    }).format(cents / 100);

    const showImage = (src, alt, mediaId) => {
      if (!mainImage || !src) return;
      mainImage.src = src;
      mainImage.removeAttribute('srcset');
      if (alt) mainImage.alt = alt;
      root.querySelectorAll('[data-thumb]').forEach((t) => {
        t.setAttribute('aria-current', String(t.dataset.mediaId === String(mediaId)));
      });
    };

    root.querySelectorAll('[data-thumb]').forEach((thumb) => {
      thumb.addEventListener('click', () => showImage(thumb.dataset.src, thumb.dataset.alt, thumb.dataset.mediaId));
    });

    root.addEventListener('change', (event) => {
      if (!event.target.matches('[data-option]')) return;
      const selected = [...root.querySelectorAll('[data-option-group]')].map((group) => {
        const checked = group.querySelector('input:checked');
        const label = group.querySelector('[data-selected-value]');
        if (label && checked) label.textContent = checked.value;
        return checked?.value;
      });
      const variant = product.variants.find((v) => v.options.every((opt, i) => opt === selected[i]));
      if (!variant) {
        if (button) button.disabled = true;
        if (buttonLabel) buttonLabel.textContent = config.strings.unavailable;
        return;
      }
      idInput.value = variant.id;
      if (priceEl) priceEl.textContent = money(variant.price);
      if (compareEl) {
        const onSale = variant.compare_at_price > variant.price;
        compareEl.textContent = onSale ? money(variant.compare_at_price) : '';
        compareEl.hidden = !onSale;
      }
      if (button) button.disabled = !variant.available;
      if (buttonLabel) buttonLabel.textContent = variant.available ? config.strings.addToCart : config.strings.soldOut;
      if (variant.featured_image) {
        const mediaId = variant.featured_media ? variant.featured_media.id : null;
        showImage(variant.featured_image.src, variant.featured_image.alt, mediaId);
      }
      if (root.dataset.updateUrl === 'true') {
        const url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url);
      }
    });
  });
})();
