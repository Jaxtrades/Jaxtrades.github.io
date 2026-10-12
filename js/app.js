// HomeValue — property estimates for postcode 4209 and surrounds, entirely client-side.
// Relies on SUBURBS, TYPICAL and DATA_UPDATED from suburbs.js.

// Adjustment rates, as a share of the suburb median per unit of difference.
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

const form = document.getElementById('appraisal-form');
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
  renderSnapshot();
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
  document.getElementById('land-field').hidden = type === 'unit';
}

function renderSnapshot() {
  const local = SUBURBS.filter(s => s.postcode === '4209');
  document.getElementById('snap-list').innerHTML = local.map(s => `
    <li>
      <span class="sub">${s.name}</span><span class="house">${money(s.house)}</span>
      <span class="lbl">Median house</span><span class="unit">${s.unit ? 'Unit ' + money(s.unit) : 'Unit: limited data'}</span>
    </li>`).join('');
  document.getElementById('snap-foot').textContent = `Mostly Cotality data, mid-2026. Updated ${DATA_UPDATED}.`;
}

function renderMarketTable() {
  const rows = [...SUBURBS].sort((a, b) => a.house - b.house).map(s => `
    <tr>
      <td><strong>${s.name}</strong> ${s.postcode === '4209' ? '<span class="tag">4209</span>' : `<span class="muted">${s.postcode}</span>`}</td>
      <td class="num">${money(s.house)}</td>
      <td>${s.unit ? money(s.unit) : '<span class="muted">—</span>'}</td>
      <td class="src-cell">${s.source}, ${s.asOf}</td>
    </tr>`).join('');
  document.getElementById('market-table').innerHTML =
    '<thead><tr><th>Suburb</th><th>Median house</th><th>Median unit</th><th>Source</th></tr></thead><tbody>' + rows + '</tbody>';
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

// ---------- Valuation ----------
// Adjusts a reference price for how the subject differs from the reference property.
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
  return { price, adj, net, adjusted: price + net };
}

// Starts from the suburb median, which describes a typical property, and adjusts for how this one differs.
function appraise(s) {
  const suburb = findSuburb(s.suburb);
  const median = medianFor(suburb, s.type);
  const typical = { ...TYPICAL[s.type], condition: 3, pool: false };
  if (!s.land) typical.land = 0;
  const r = adjust(s, typical, median);
  const exactType = s.type === 'house' || (s.type === 'unit' && suburb.unit);
  return {
    ...r, suburb, median, typical,
    method: `Based on ${suburb.name} median` + (exactType ? '' : ' (estimated for this type)'),
    value: roundTo(r.adjusted, 5000), low: roundTo(r.adjusted * 0.9, 5000), high: roundTo(r.adjusted * 1.1, 5000),
  };
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
  document.getElementById('r-source').textContent = `Data: ${r.suburb.source}, ${r.suburb.asOf}`;
  document.getElementById('r-method').textContent = r.method;

  const desc = [`${TYPE_LABELS[s.type]}, ${r.suburb.name} ${r.suburb.postcode}`, `${s.beds} bed · ${s.baths} bath · ${s.cars} car`];
  if (s.land) desc.push(`${s.land.toLocaleString('en-AU')} m²`);
  if (s.year) desc.push(`built ${s.year}`);
  document.getElementById('r-address').textContent = (s.address ? s.address + ' · ' : '') + desc.join(' · ');

  document.getElementById('r-grid-hint').textContent =
    `Starts from the ${r.suburb.name} median ${typeWord} price, which reflects a typical ${typeWord} there, then adjusts for how yours differs.`;

  const t = r.typical;
  const cond = n => ['', 'Poor', 'Fair', 'Average', 'Good', 'Excellent'][n];
  const rows = [
    ['Bedrooms', t.beds, s.beds, r.adj.beds],
    ['Bathrooms', t.baths, s.baths, r.adj.baths],
    ['Car spaces', t.cars, s.cars, r.adj.cars],
    ['Land size', t.land ? `${t.land} m²` : '—', s.land ? `${s.land.toLocaleString('en-AU')} m²` : '—', r.adj.land],
    ['Year built', t.year, s.year || '—', r.adj.age],
    ['Condition', cond(t.condition), cond(s.condition), r.adj.condition],
    ['Pool', 'No', s.pool ? 'Yes' : 'No', r.adj.pool],
  ];
  document.getElementById('r-grid').innerHTML =
    `<thead><tr><th></th><th>Typical ${typeWord}</th><th>Yours</th><th>Adjustment</th></tr></thead><tbody>` +
    `<tr><td>${r.suburb.name} median</td><td></td><td></td><td>${money(r.median)}</td></tr>` +
    rows.map(([label, a, b, n]) => `<tr><td>${label}</td><td>${a}</td><td>${b}</td><td>${adjCell(n)}</td></tr>`).join('') +
    `<tr class="total"><td>Estimated value</td><td></td><td></td><td>${money(r.adjusted)}</td></tr></tbody>`;

  resultEl.hidden = false;
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    open.addEventListener('click', () => { fillForm(item.subject); form.requestSubmit(); });
    const del = document.createElement('button');
    del.type = 'button'; del.className = 'link'; del.textContent = 'Delete';
    del.addEventListener('click', () => { storeSaved(loadSaved().filter(x => x.id !== item.id)); renderSaved(); });
    btns.append(open, del);

    li.append(info, btns);
    ul.appendChild(li);
  });
}

function fillForm(s) {
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
  updateSuburbInfo();
}

// ---------- Events ----------
form.addEventListener('submit', e => {
  e.preventDefault();
  const s = readSubject();
  const r = appraise(s);
  lastReport = { subject: s, value: r.value };
  renderResult(s, r);
});

document.getElementById('reset').addEventListener('click', () => {
  form.reset();
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

// Example inputs for a typical Coomera house.
document.getElementById('load-sample').addEventListener('click', () => {
  fillForm(
    { address: 'Example property', suburb: 'Coomera', type: 'house', beds: 4, baths: 2, cars: 2, land: 520, year: 2016, condition: 4, pool: true }
  );
  form.requestSubmit();
});

// ---------- Init ----------
initSuburbs();
renderSaved();
