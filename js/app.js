// HomeValue — property estimates for postcode 4209 and surrounds, entirely client-side.
// Relies on SUBURBS, TYPICAL, DATA_UPDATED and soldSearchUrl from suburbs.js.

// Adjustment rates, as a share of the sale price (or suburb median) per unit of difference.
const RATES = {
  bed: 0.04,
  bath: 0.03,
  car: 0.02,
  carCap: 3,
  landPer100m2: 0.04,
  landCapM2: 400, // land adjustments stop at ±400 m² of difference
  agePerYear: 0.004,
  ageCapYears: 30,
  condition: 0.05,
  pool: 0.03,
};
const TYPE_LABELS = { house: 'House', townhouse: 'Townhouse', unit: 'Unit' };
const STORAGE_KEY = 'homevalue.saved';
const MAX_COMPS = 6;

const form = document.getElementById('appraisal-form');
const compsEl = document.getElementById('comps');
const compTpl = document.getElementById('comp-template');
const errorEl = document.getElementById('form-error');
const resultEl = document.getElementById('result');
let lastReport = null;

const money = n => '$' + Math.round(n).toLocaleString('en-AU');
const roundTo = (n, step) => Math.round(n / step) * step;
const num = v => (v === '' || v == null ? null : Number(v));
const cap = (n, max) => Math.max(-max, Math.min(max, n));
const signed = n => (n === 0 ? '—' : (n > 0 ? '+' : '−') + money(Math.abs(n)));
const findSuburb = name => SUBURBS.find(s => s.name === name) || SUBURBS[0];

// Median for the chosen property type. Missing unit medians fall back to a typical local ratio.
function medianFor(suburb, type) {
  const unit = suburb.unit ?? suburb.house * 0.75;
  if (type === 'house') return suburb.house;
  if (type === 'unit') return unit;
  return (suburb.house + unit) / 2;
}

// ---------- Suburb UI ----------
function initSuburbs() {
  const select = document.getElementById('suburb-select');
  const byPostcode = {};
  SUBURBS.forEach(s => (byPostcode[s.postcode] ||= []).push(s));
  Object.keys(byPostcode).sort((a, b) => (b === '4209') - (a === '4209') || a.localeCompare(b)).forEach(pc => {
    const group = document.createElement('optgroup');
    group.label = pc === '4209' ? '4209' : `${pc} (nearby)`;
    byPostcode[pc].forEach(s => group.appendChild(new Option(`${s.name} ${s.postcode}`, s.name)));
    select.appendChild(group);
  });
  select.addEventListener('change', updateSuburbInfo);
  form.elements.type.addEventListener('change', updateSuburbInfo);
  document.getElementById('data-updated').textContent = DATA_UPDATED;
  renderMarketTable();
  updateSuburbInfo();
}

function updateSuburbInfo() {
  const s = findSuburb(form.elements.suburb.value);
  const type = form.elements.type.value;
  const unitText = s.unit ? money(s.unit) : 'not enough data';
  document.getElementById('suburb-box').innerHTML =
    `<strong>${s.name} ${s.postcode}</strong> · median house <strong>${money(s.house)}</strong> · median unit <strong>${unitText}</strong>` +
    `<span class="src">Source: ${s.source}, ${s.asOf}${s.lowVolume ? ' · few sales, so treat with caution' : ''}</span>`;
  const link = document.getElementById('sold-link');
  link.href = soldSearchUrl(s);
  link.textContent = `Find recent sales in ${s.name} on realestate.com.au ↗`;
  document.getElementById('land-field').hidden = type === 'unit';
}

function renderMarketTable() {
  const rows = [...SUBURBS].sort((a, b) => a.house - b.house).map(s => `
    <tr>
      <td><strong>${s.name}</strong> <span class="muted">${s.postcode}</span></td>
      <td>${money(s.house)}</td>
      <td>${s.unit ? money(s.unit) : '<span class="muted">—</span>'}</td>
      <td class="src-cell">${s.source}, ${s.asOf}</td>
      <td><a class="ext" href="${soldSearchUrl(s)}" target="_blank" rel="noopener">Sold ↗</a></td>
    </tr>`).join('');
  document.getElementById('market-table').innerHTML =
    '<thead><tr><th>Suburb</th><th>Median house</th><th>Median unit</th><th>Source</th><th></th></tr></thead><tbody>' + rows + '</tbody>';
}

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
  const type = f.type.value;
  return {
    address: f.address.value.trim(),
    suburb: f.suburb.value,
    type,
    beds: num(f.beds.value) ?? 0,
    baths: num(f.baths.value) ?? 0,
    cars: num(f.cars.value) ?? 0,
    land: type === 'unit' ? null : num(f.land.value),
    year: num(f.year.value),
    condition: Number(f.condition.value),
    pool: f.pool.checked,
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
// Adjusts a reference price (a sale, or the suburb median) for how the subject differs from it.
function adjust(s, ref, price) {
  const adj = {
    beds: (s.beds - ref.beds) * price * RATES.bed,
    baths: (s.baths - ref.baths) * price * RATES.bath,
    cars: (Math.min(s.cars, RATES.carCap) - Math.min(ref.cars, RATES.carCap)) * price * RATES.car,
    land: s.land && ref.land ? cap(s.land - ref.land, RATES.landCapM2) / 100 * price * RATES.landPer100m2 : 0,
    age: s.year && ref.year ? cap(s.year - ref.year, RATES.ageCapYears) * price * RATES.agePerYear : 0,
    condition: (s.condition - ref.condition) * price * RATES.condition,
    pool: (Number(s.pool) - Number(ref.pool)) * price * RATES.pool,
  };
  const net = Object.values(adj).reduce((a, b) => a + b, 0);
  const gross = Object.values(adj).reduce((a, b) => a + Math.abs(b), 0);
  return { price, adj, net, adjusted: price + net, grossPct: gross / price };
}

function compAsRef(s, raw) {
  // Blank fields are treated as matching the subject property.
  return {
    beds: num(raw.beds) ?? s.beds,
    baths: num(raw.baths) ?? s.baths,
    cars: num(raw.cars) ?? s.cars,
    land: num(raw.land) ?? s.land,
    year: num(raw.year) ?? s.year,
    condition: raw.condition === '' ? s.condition : Number(raw.condition),
    pool: raw.pool === '' ? s.pool : raw.pool === '1',
  };
}

function appraise(s, rawComps) {
  const suburb = findSuburb(s.suburb);
  const median = medianFor(suburb, s.type);

  if (rawComps.length) {
    const comps = rawComps.map(raw => ({ label: null, ...adjust(s, compAsRef(s, raw), num(raw.price)) }));
    // Sales needing fewer adjustments are more reliable, so they get more weight.
    const weights = comps.map(c => 1 / (c.grossPct + 0.05));
    const total = weights.reduce((a, b) => a + b, 0);
    comps.forEach((c, i) => { c.weight = weights[i] / total; c.label = `Sale ${i + 1}`; });
    const value = comps.reduce((a, c) => a + c.adjusted * c.weight, 0);

    const adjusted = comps.map(c => c.adjusted);
    const minSpread = comps.length > 1 ? 0.05 : 0.1;
    const low = Math.min(...adjusted, value * (1 - minSpread));
    const high = Math.max(...adjusted, value * (1 + minSpread));

    const avgGross = comps.reduce((a, c) => a + c.grossPct, 0) / comps.length;
    let confidence = 'Low confidence';
    if (comps.length >= 3 && avgGross <= 0.15) confidence = 'High confidence';
    else if (comps.length >= 2 && avgGross <= 0.25) confidence = 'Medium confidence';

    return {
      suburb, median, comps, confidence,
      method: `Based on ${comps.length} sale${comps.length > 1 ? 's' : ''}`,
      value: roundTo(value, 5000), low: roundTo(low, 5000), high: roundTo(high, 5000),
    };
  }

  // No sales entered: start from the suburb median for a typical property and adjust.
  const typical = { ...TYPICAL[s.type], condition: 3, pool: false };
  if (!s.land) typical.land = 0;
  const base = { label: `${suburb.name} median`, weight: 1, ...adjust(s, typical, median) };
  const value = base.adjusted;
  const exactType = s.type === 'house' || (s.type === 'unit' && suburb.unit);
  return {
    suburb, median, comps: [base], typical, fromMedian: true,
    confidence: 'Low confidence',
    method: 'Suburb median' + (exactType ? '' : ' (estimated for this type)'),
    value: roundTo(value, 5000), low: roundTo(value * 0.88, 5000), high: roundTo(value * 1.12, 5000),
  };
}

// ---------- Validation ----------
function validate(rawComps) {
  form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
  const problems = [];
  const filled = [];
  [...compsEl.children].forEach((node, i) => {
    const raw = rawComps[i];
    if (!Object.values(raw).some(v => v !== '')) return;
    if (num(raw.price) > 10000) filled.push(raw);
    else {
      node.querySelector('[data-f="price"]').classList.add('invalid');
      problems.push(`Sale ${i + 1} needs a sold price (or remove it).`);
    }
  });
  return { problems, comps: filled };
}

// ---------- Rendering ----------
function renderResult(s, r) {
  const diff = r.value / r.median - 1;
  const typeWord = s.type === 'house' ? 'house' : s.type === 'unit' ? 'unit' : 'townhouse';
  document.getElementById('r-value').textContent = money(r.value);
  document.getElementById('r-range').textContent = `${money(r.low)} – ${money(r.high)}`;
  document.getElementById('r-median').textContent = Math.abs(diff) < 0.01
    ? `In line with ${r.suburb.name} median ${typeWord}`
    : `${Math.abs(diff * 100).toFixed(0)}% ${diff > 0 ? 'above' : 'below'} ${r.suburb.name} median ${typeWord}`;
  document.getElementById('r-confidence').textContent = r.confidence;
  document.getElementById('r-method').textContent = r.method;

  const desc = [`${TYPE_LABELS[s.type]}, ${r.suburb.name} ${r.suburb.postcode}`, `${s.beds} bed · ${s.baths} bath · ${s.cars} car`];
  if (s.land) desc.push(`${s.land.toLocaleString('en-AU')} m²`);
  if (s.year) desc.push(`built ${s.year}`);
  document.getElementById('r-address').textContent = (s.address ? s.address + ' · ' : '') + desc.join(' · ');

  const note = document.getElementById('r-note');
  note.hidden = !r.fromMedian;
  if (r.fromMedian) {
    note.innerHTML = `This estimate is based only on the ${r.suburb.name} median. For a sharper figure, ` +
      `<a class="ext" href="${soldSearchUrl(r.suburb)}" target="_blank" rel="noopener">look up recent sales on realestate.com.au ↗</a> and add them in step 2.`;
  }

  document.getElementById('r-grid-hint').textContent = r.fromMedian
    ? `Starts from the ${r.suburb.name} median, which reflects a typical ${typeWord} (${describeTypical(r.typical)}), then adjusts for how yours differs.`
    : 'Each sale is adjusted up or down for differences from your property. Sales needing fewer adjustments count more toward the final value.';

  const rows = [
    [r.fromMedian ? 'Median price' : 'Sold price', c => money(c.price)],
    ['Bedrooms', c => adjCell(c.adj.beds)],
    ['Bathrooms', c => adjCell(c.adj.baths)],
    ['Car spaces', c => adjCell(c.adj.cars)],
    ['Land size', c => adjCell(c.adj.land)],
    ['Age', c => adjCell(c.adj.age)],
    ['Condition', c => adjCell(c.adj.condition)],
    ['Pool', c => adjCell(c.adj.pool)],
    ['Total adjustment', c => adjCell(c.net)],
    ['Adjusted value', c => `<strong>${money(c.adjusted)}</strong>`, 'total'],
  ];
  if (!r.fromMedian) rows.push(['Weight', c => `${Math.round(c.weight * 100)}%`]);
  const head = '<thead><tr><th></th>' + r.comps.map(c => `<th>${c.label}</th>`).join('') + '</tr></thead>';
  const body = rows.map(([label, fn, cls]) =>
    `<tr${cls ? ` class="${cls}"` : ''}><td>${label}</td>${r.comps.map(c => `<td>${fn(c)}</td>`).join('')}</tr>`
  ).join('');
  document.getElementById('r-grid').innerHTML = head + '<tbody>' + body + '</tbody>';

  resultEl.hidden = false;
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function describeTypical(t) {
  return `${t.beds} bed, ${t.baths} bath, ${t.cars} car` + (t.land ? `, ~${t.land} m²` : '') + `, built ~${t.year}`;
}

function adjCell(n) {
  const rounded = roundTo(n, 500);
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
  // Drop entries saved by the earlier US version of the site, which had no suburb.
  const list = loadSaved().filter(item => item.subject && item.subject.suburb);
  const ul = document.getElementById('saved-list');
  document.getElementById('saved-empty').hidden = list.length > 0;
  ul.innerHTML = '';
  list.forEach(item => {
    const li = document.createElement('li');
    const info = document.createElement('div');
    const title = document.createElement('div');
    title.textContent = item.subject.address
      ? `${item.subject.address}, ${item.subject.suburb}`
      : `${TYPE_LABELS[item.subject.type]} in ${item.subject.suburb}`;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `<span class="val">${money(item.value)}</span> · ${new Date(item.savedAt).toLocaleDateString('en-AU')}`;
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
  f.suburb.value = findSuburb(s.suburb).name;
  f.type.value = s.type || 'house';
  f.beds.value = s.beds ?? '';
  f.baths.value = s.baths ?? '';
  f.cars.value = s.cars ?? '';
  f.land.value = s.land ?? '';
  f.year.value = s.year ?? '';
  f.condition.value = String(s.condition || 3);
  f.pool.checked = !!s.pool;
  compsEl.innerHTML = '';
  (comps && comps.length ? comps : [{}, {}, {}]).forEach(c => addComp(c));
  updateSuburbInfo();
}

// ---------- Events ----------
form.addEventListener('submit', e => {
  e.preventDefault();
  const s = readSubject();
  const { problems, comps } = validate(readComps());
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
  updateSuburbInfo();
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

// Example only: these sales are made-up figures to show how the tool works, not real transactions.
document.getElementById('load-sample').addEventListener('click', () => {
  fillForm(
    { address: 'Example property', suburb: 'Coomera', type: 'house', beds: 4, baths: 2, cars: 2, land: 420, year: 2014, condition: 3, pool: false },
    [
      { price: 1020000, beds: 4, baths: 2, cars: 2, land: 400, year: 2013, condition: '3', pool: '0' },
      { price: 1085000, beds: 4, baths: 2, cars: 2, land: 480, year: 2016, condition: '4', pool: '0' },
      { price: 995000, beds: 4, baths: 2, cars: 2, land: 410, year: 2010, condition: '2', pool: '0' },
      { price: 1140000, beds: 5, baths: 3, cars: 2, land: 512, year: 2018, condition: '3', pool: '0' },
    ]
  );
  form.requestSubmit();
});

// ---------- Init ----------
initSuburbs();
for (let i = 0; i < 3; i++) addComp();
renderSaved();
