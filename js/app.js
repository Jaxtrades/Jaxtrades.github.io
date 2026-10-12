// HomeValue — sales comparison appraisal, entirely client-side.

// Adjustment rates, as a share of each comparable's sale price per unit of difference.
const RATES = {
  sizeShareOfPpsf: 0.5, // extra sq ft is worth ~half the average $/sq ft
  bed: 0.02,
  bath: 0.03,
  agePerYear: 0.003,
  ageCapYears: 30,
  condition: 0.05,
  garage: 0.02,
  pool: 0.03,
};
const CONDITION_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Average', 4: 'Good', 5: 'Excellent' };
const STORAGE_KEY = 'homevalue.saved';
const MAX_COMPS = 6;

const form = document.getElementById('appraisal-form');
const compsEl = document.getElementById('comps');
const compTpl = document.getElementById('comp-template');
const errorEl = document.getElementById('form-error');
const resultEl = document.getElementById('result');
let lastReport = null;

const money = n => '$' + Math.round(n).toLocaleString('en-US');
const roundK = n => Math.round(n / 1000) * 1000;
const num = v => (v === '' || v == null ? null : Number(v));
const signed = n => (n === 0 ? '—' : (n > 0 ? '+' : '−') + money(Math.abs(n)));

// ---------- Comparable rows ----------
function addComp(values = {}) {
  if (compsEl.children.length >= MAX_COMPS) return;
  const node = compTpl.content.firstElementChild.cloneNode(true);
  node.querySelectorAll('[data-f]').forEach(input => {
    if (values[input.dataset.f] != null) input.value = values[input.dataset.f];
  });
  node.querySelector('.remove-comp').addEventListener('click', () => {
    node.remove();
    renumberComps();
  });
  compsEl.appendChild(node);
  renumberComps();
}

function renumberComps() {
  [...compsEl.children].forEach((c, i) => { c.querySelector('.comp-title').textContent = `Sale ${i + 1}`; });
  document.getElementById('add-comp').hidden = compsEl.children.length >= MAX_COMPS;
}

// ---------- Reading inputs ----------
function readSubject() {
  const f = form.elements;
  return {
    address: f.address.value.trim(),
    type: f.type.value,
    sqft: num(f.sqft.value),
    beds: num(f.beds.value) ?? 0,
    baths: num(f.baths.value) ?? 0,
    year: num(f.year.value),
    garage: num(f.garage.value) ?? 0,
    condition: Number(f.condition.value),
    pool: f.pool.checked,
    ppsf: num(f.ppsf.value),
  };
}

function readComps() {
  return [...compsEl.children].map(node => {
    const c = {};
    node.querySelectorAll('[data-f]').forEach(input => { c[input.dataset.f] = input.value; });
    return c;
  });
}

// ---------- Valuation ----------
function adjustComp(s, raw) {
  const price = num(raw.price);
  const sqft = num(raw.sqft);
  // Blank comp fields are treated as matching the subject property.
  const c = {
    beds: num(raw.beds) ?? s.beds,
    baths: num(raw.baths) ?? s.baths,
    year: num(raw.year) ?? s.year,
    garage: num(raw.garage) ?? s.garage,
    condition: raw.condition === '' ? s.condition : Number(raw.condition),
    pool: raw.pool === '' ? s.pool : raw.pool === '1',
  };
  const ppsf = price / sqft;
  const cap = (n, max) => Math.max(-max, Math.min(max, n));

  const adj = {
    size: (s.sqft - sqft) * ppsf * RATES.sizeShareOfPpsf,
    beds: (s.beds - c.beds) * price * RATES.bed,
    baths: (s.baths - c.baths) * price * RATES.bath,
    age: s.year && c.year ? cap(s.year - c.year, RATES.ageCapYears) * price * RATES.agePerYear : 0,
    condition: (s.condition - c.condition) * price * RATES.condition,
    garage: (Math.min(s.garage, 3) - Math.min(c.garage, 3)) * price * RATES.garage,
    pool: (Number(s.pool) - Number(c.pool)) * price * RATES.pool,
  };
  const net = Object.values(adj).reduce((a, b) => a + b, 0);
  const gross = Object.values(adj).reduce((a, b) => a + Math.abs(b), 0);
  return { price, sqft, ppsf, adj, adjusted: price + net, net, grossPct: gross / price };
}

function appraise(s, rawComps) {
  const comps = rawComps.map(c => adjustComp(s, c));

  if (comps.length) {
    // Comps needing fewer adjustments are more reliable, so they get more weight.
    const weights = comps.map(c => 1 / (c.grossPct + 0.05));
    const total = weights.reduce((a, b) => a + b, 0);
    comps.forEach((c, i) => { c.weight = weights[i] / total; });
    const value = comps.reduce((a, c) => a + c.adjusted * c.weight, 0);

    const adjusted = comps.map(c => c.adjusted);
    const minSpread = comps.length > 1 ? 0.05 : 0.1;
    const low = Math.min(Math.min(...adjusted), value * (1 - minSpread));
    const high = Math.max(Math.max(...adjusted), value * (1 + minSpread));

    const avgGross = comps.reduce((a, c) => a + c.grossPct, 0) / comps.length;
    let confidence = 'Low confidence';
    if (comps.length >= 3 && avgGross <= 0.15) confidence = 'High confidence';
    else if (comps.length >= 2 && avgGross <= 0.25) confidence = 'Medium confidence';

    return {
      method: `Based on ${comps.length} sale${comps.length > 1 ? 's' : ''}`,
      value: roundK(value), low: roundK(low), high: roundK(high), confidence, comps,
    };
  }

  // Quick mode: neighborhood $/sq ft, nudged for condition and pool.
  const value = s.sqft * s.ppsf * (1 + (s.condition - 3) * RATES.condition) * (s.pool ? 1 + RATES.pool : 1);
  return {
    method: 'Quick ballpark ($/sq ft)',
    value: roundK(value), low: roundK(value * 0.9), high: roundK(value * 1.1),
    confidence: 'Low confidence', comps: [],
  };
}

// ---------- Validation ----------
function validate(s, rawComps) {
  form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
  const problems = [];

  if (!s.sqft || s.sqft < 100) {
    form.elements.sqft.classList.add('invalid');
    problems.push('Enter the living area of the property.');
  }

  const filled = [];
  [...compsEl.children].forEach((node, i) => {
    const raw = rawComps[i];
    const anyValue = Object.values(raw).some(v => v !== '');
    if (!anyValue) return;
    const priceEl = node.querySelector('[data-f="price"]');
    const sqftEl = node.querySelector('[data-f="sqft"]');
    let ok = true;
    if (!(num(raw.price) > 0)) { priceEl.classList.add('invalid'); ok = false; }
    if (!(num(raw.sqft) >= 100)) { sqftEl.classList.add('invalid'); ok = false; }
    if (ok) filled.push(raw);
    else problems.push(`Sale ${i + 1} needs a sale price and square footage.`);
  });

  if (!filled.length && !(s.ppsf > 0)) {
    problems.push('Add at least one recent sale, or enter an average $/sq ft for the area.');
  }
  return { problems, comps: filled };
}

// ---------- Rendering ----------
function renderResult(s, r) {
  document.getElementById('r-value').textContent = money(r.value);
  document.getElementById('r-range').textContent = `${money(r.low)} – ${money(r.high)}`;
  document.getElementById('r-ppsf').textContent = `${money(r.value / s.sqft)} / sq ft`;
  document.getElementById('r-confidence').textContent = r.confidence;
  document.getElementById('r-method').textContent = r.method;
  const desc = [s.type, `${s.sqft.toLocaleString()} sq ft`, `${s.beds} bd / ${s.baths} ba`];
  if (s.year) desc.push(`built ${s.year}`);
  document.getElementById('r-address').textContent = (s.address ? s.address + ' · ' : '') + desc.join(' · ');

  const wrap = document.getElementById('r-grid-wrap');
  wrap.hidden = !r.comps.length;
  if (r.comps.length) {
    const rows = [
      ['Sale price', c => money(c.price)],
      ['Price / sq ft', c => money(c.ppsf)],
      ['Size', c => adjCell(c.adj.size)],
      ['Bedrooms', c => adjCell(c.adj.beds)],
      ['Bathrooms', c => adjCell(c.adj.baths)],
      ['Age', c => adjCell(c.adj.age)],
      ['Condition', c => adjCell(c.adj.condition)],
      ['Garage', c => adjCell(c.adj.garage)],
      ['Pool', c => adjCell(c.adj.pool)],
      ['Total adjustment', c => adjCell(c.net) + ` <span class="muted">(${(c.grossPct * 100).toFixed(0)}% gross)</span>`],
      ['Adjusted value', c => `<strong>${money(c.adjusted)}</strong>`, 'total'],
      ['Weight', c => `${Math.round(c.weight * 100)}%`],
    ];
    const head = '<thead><tr><th></th>' + r.comps.map((_, i) => `<th>Sale ${i + 1}</th>`).join('') + '</tr></thead>';
    const body = rows.map(([label, fn, cls]) =>
      `<tr${cls ? ` class="${cls}"` : ''}><td>${label}</td>${r.comps.map(c => `<td>${fn(c)}</td>`).join('')}</tr>`
    ).join('');
    document.getElementById('r-grid').innerHTML = head + '<tbody>' + body + '</tbody>';
  }

  resultEl.hidden = false;
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function adjCell(n) {
  const rounded = Math.round(n / 100) * 100;
  const cls = rounded > 0 ? 'pos' : rounded < 0 ? 'neg' : '';
  return `<span class="${cls}">${signed(rounded)}</span>`;
}

// ---------- Saved appraisals (this browser only) ----------
function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function storeSaved(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); return true; } catch { return false; }
}

function renderSaved() {
  const list = loadSaved();
  const ul = document.getElementById('saved-list');
  document.getElementById('saved-empty').hidden = list.length > 0;
  ul.innerHTML = '';
  list.forEach(item => {
    const li = document.createElement('li');
    const info = document.createElement('div');
    const title = document.createElement('div');
    title.textContent = item.subject.address || `${item.subject.sqft.toLocaleString()} sq ft ${item.subject.type.toLowerCase()}`;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `<span class="val">${money(item.value)}</span> · ${new Date(item.savedAt).toLocaleDateString()}`;
    info.append(title, meta);

    const btns = document.createElement('div');
    btns.className = 'btns';
    const open = document.createElement('button');
    open.type = 'button'; open.className = 'link open'; open.textContent = 'Open';
    open.addEventListener('click', () => { fillForm(item.subject, item.comps); form.requestSubmit(); });
    const del = document.createElement('button');
    del.type = 'button'; del.className = 'link'; del.textContent = 'Delete';
    del.addEventListener('click', () => { storeSaved(loadSaved().filter(x => x.id !== item.id)); renderSaved(); });
    btns.append(open, del);

    li.append(info, btns);
    ul.appendChild(li);
  });
}

function fillForm(s, comps) {
  const f = form.elements;
  f.address.value = s.address || '';
  f.type.value = s.type || 'Single-family home';
  f.sqft.value = s.sqft ?? '';
  f.beds.value = s.beds ?? '';
  f.baths.value = s.baths ?? '';
  f.year.value = s.year ?? '';
  f.garage.value = s.garage ?? '';
  f.condition.value = String(s.condition || 3);
  f.pool.checked = !!s.pool;
  f.ppsf.value = s.ppsf ?? '';
  compsEl.innerHTML = '';
  (comps.length ? comps : [{}, {}, {}]).forEach(c => addComp(c));
}

// ---------- Events ----------
form.addEventListener('submit', e => {
  e.preventDefault();
  const s = readSubject();
  const raw = readComps();
  const { problems, comps } = validate(s, raw);
  if (problems.length) {
    errorEl.textContent = problems[0];
    errorEl.hidden = false;
    resultEl.hidden = true;
    return;
  }
  errorEl.hidden = true;
  const r = appraise(s, comps);
  lastReport = { subject: s, comps, value: r.value };
  renderResult(s, r);
});

document.getElementById('add-comp').addEventListener('click', () => addComp());

document.getElementById('reset').addEventListener('click', () => {
  form.reset();
  compsEl.innerHTML = '';
  for (let i = 0; i < 3; i++) addComp();
  form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
  errorEl.hidden = true;
  resultEl.hidden = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('save').addEventListener('click', e => {
  if (!lastReport) return;
  const list = loadSaved();
  list.unshift({ id: Date.now().toString(36), savedAt: new Date().toISOString(), ...lastReport });
  const ok = storeSaved(list.slice(0, 50));
  e.target.textContent = ok ? 'Saved ✓' : 'Could not save';
  setTimeout(() => { e.target.textContent = 'Save appraisal'; }, 1800);
  renderSaved();
});

document.getElementById('load-sample').addEventListener('click', () => {
  fillForm(
    { address: '42 Maple Ave, Springfield', type: 'Single-family home', sqft: 1850, beds: 3, baths: 2, year: 1998, garage: 2, condition: 3, pool: false },
    [
      { price: 365000, sqft: 1920, beds: 3, baths: 2.5, year: 2001, garage: 2, condition: '4', pool: '0' },
      { price: 342000, sqft: 1780, beds: 3, baths: 2, year: 1994, garage: 2, condition: '3', pool: '0' },
      { price: 389000, sqft: 2050, beds: 4, baths: 2.5, year: 2004, garage: 2, condition: '3', pool: '1' },
      { price: 331000, sqft: 1810, beds: 3, baths: 2, year: 1989, garage: 1, condition: '2', pool: '0' },
    ]
  );
  form.requestSubmit();
});

// ---------- Init ----------
for (let i = 0; i < 3; i++) addComp();
renderSaved();
