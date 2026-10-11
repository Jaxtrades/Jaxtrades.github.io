/* Product card used on the home and shop grids. "Add to cart" adds one and
   slides the cart drawer open (handled by the [data-add] listener in store.js). */
function productCard(p) {
  const onSale = p.compareAt && p.compareAt > p.price;
  const badge = p.badge
    ? `<span class="badge">${p.badge}</span>`
    : onSale ? `<span class="badge sale">Save ${formatPrice(p.compareAt - p.price)}</span>` : "";
  return `
  <div class="card">
    ${badge}
    <a href="product.html?id=${p.id}" class="card-img">${productMedia(p)}</a>
    <div class="card-body">
      <a href="product.html?id=${p.id}" class="card-name">${p.name}</a>
      <div class="card-tag">${p.tagline}</div>
      <div class="price-row">
        <span class="price">${formatPrice(p.price)}</span>
        ${onSale ? `<span class="compare">${formatPrice(p.compareAt)}</span>` : ""}
      </div>
      <button class="btn dark" data-add="${p.id}">Add to cart</button>
    </div>
  </div>`;
}
