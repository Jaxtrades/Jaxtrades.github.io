/* PAKD buy box: switches purchase type and pack, keeps the product form's
   variant id and selling_plan inputs in sync. Prices are pre-rendered by Liquid. */
if (!customElements.get('pakd-buy-box')) {
  customElements.define('pakd-buy-box', class extends HTMLElement {
    connectedCallback() {
      this.idInput = this.querySelector('form input[name="id"]');
      this.planInput = this.querySelector('[data-selling-plan]');
      this.submit = this.querySelector('.pakd-buy__submit');
      this.priceLabel = this.querySelector('[data-button-price]');
      this.addEventListener('change', (e) => {
        const t = e.target;
        if (t.name && t.name.endsWith('-mode')) this.dataset.mode = t.value;
        this.sync();
      });
      this.sync();
    }
    sync() {
      const pack = this.querySelector('input[name$="-pack"]:checked');
      const sub = this.dataset.mode === 'sub';
      if (this.planInput) this.planInput.disabled = !sub;
      if (!pack) return;
      if (this.idInput) {
        this.idInput.value = pack.value;
        this.idInput.disabled = pack.disabled;
      }
      if (this.submit) this.submit.disabled = pack.disabled;
      if (this.priceLabel) {
        this.priceLabel.textContent = (sub && pack.dataset.priceSub) || pack.dataset.priceOnce || '';
      }
    }
  });
}
