/* Product catalog + tag weights used by the quiz matcher.
   Curated to ~15 of the current best-selling research peptides, focused on
   muscle & performance, skin & hair, and anti-aging — plus weight-management
   GLP-1 compounds, which are the single biggest sellers in the category
   right now, and the recovery peptides most often bought alongside them.
   Prices are in AUD, per single vial — converted from the supplier's
   USD wholesale box pricing (lowest available box-quantity tier ÷ 10
   vials/box, converted at ~1 USD = 1.38 AUD).
   tags: category -> relevance weight (0-3), used by the Q&A matcher. */
const PRODUCTS = [
  {
    id: "tirzepatide",
    name: "Tirzepatide",
    icon: "🧪",
    tagline: "Studied for weight loss & appetite control",
    description: "A dual GIP/GLP-1 receptor agonist widely studied in metabolic and weight-management research models. Currently the single most in-demand compound in the category.",
    tags: { weight: 3 },
    sizes: [
      { code: "TR10", spec: "10mg/vial", price: 25 },
      { code: "TR15", spec: "15mg/vial", price: 30 },
      { code: "TR20", spec: "20mg/vial", price: 40 },
      { code: "TR30", spec: "30mg/vial", price: 50 },
      { code: "TR40", spec: "40mg/vial", price: 55 },
      { code: "TR50", spec: "50mg/vial", price: 65 },
      { code: "TR60", spec: "60mg/vial", price: 75 },
      { code: "TR80", spec: "80mg/vial", price: 85 },
      { code: "TR120", spec: "120mg/vial", price: 105 },
    ],
  },
  {
    id: "retatrutide",
    name: "Retatrutide",
    icon: "🧪",
    tagline: "Studied for weight loss & fat metabolism",
    description: "A GIP/GLP-1/glucagon triple receptor agonist studied for its effects on metabolic rate and weight in research models.",
    tags: { weight: 3 },
    sizes: [
      { code: "RT10", spec: "10mg/vial", price: 45 },
      { code: "RT15", spec: "15mg/vial", price: 55 },
      { code: "RT20", spec: "20mg/vial", price: 60 },
      { code: "RT30", spec: "30mg/vial", price: 70 },
      { code: "RT40", spec: "40mg/vial", price: 85 },
      { code: "RT60", spec: "60mg/vial", price: 115 },
    ],
  },
  {
    id: "semaglutide",
    name: "Semaglutide",
    icon: "🧪",
    tagline: "Studied for weight loss & appetite control",
    description: "A GLP-1 receptor agonist widely studied in metabolic, appetite, and weight-management research models — one of the most searched compounds in the category.",
    tags: { weight: 3 },
    sizes: [
      { code: "SM10", spec: "10mg/vial", price: 19 },
      { code: "SM15", spec: "15mg/vial", price: 25 },
      { code: "SM20", spec: "20mg/vial", price: 25 },
      { code: "SM30", spec: "30mg/vial", price: 30 },
    ],
  },
  {
    id: "aod-9604",
    name: "AOD-9604",
    icon: "🧪",
    tagline: "Studied for fat loss",
    description: "A modified fragment of human growth hormone studied for its targeted effects on fat metabolism in research models.",
    tags: { weight: 3 },
    sizes: [{ code: "AOD5", spec: "5mg/vial", price: 45 }],
  },
  {
    id: "bpc-157",
    name: "BPC-157",
    icon: "🧪",
    tagline: "Studied for injury healing & gut recovery",
    description: "A synthetic peptide fragment widely studied in animal models for its role in supporting tissue repair and gastrointestinal integrity — the top-selling recovery peptide.",
    tags: { recovery: 3, muscle: 1 },
    sizes: [
      { code: "BC5", spec: "5mg/vial", price: 20 },
      { code: "BC10", spec: "10mg/vial", price: 30 },
      { code: "BC20", spec: "20mg/vial", price: 40 },
    ],
  },
  {
    id: "tb-500",
    name: "TB-500",
    icon: "🧪",
    tagline: "Studied for muscle & tissue recovery",
    description: "A synthetic version of Thymosin Beta-4 (B4 Acetate), studied for its potential role in cell migration and recovery-related research models.",
    tags: { recovery: 3, muscle: 1 },
    sizes: [
      { code: "TB5", spec: "5mg/vial", price: 55 },
      { code: "TB10", spec: "10mg/vial", price: 80 },
    ],
  },
  {
    id: "cjc-1295",
    name: "CJC-1295 (no DAC)",
    icon: "🧪",
    tagline: "Studied for muscle growth & recovery",
    description: "A growth-hormone releasing hormone analog studied for sustained effects on growth hormone pulses in research settings.",
    tags: { muscle: 3, recovery: 1 },
    sizes: [{ code: "CJC10", spec: "10mg/vial", price: 60 }],
  },
  {
    id: "ipamorelin",
    name: "Ipamorelin",
    icon: "🧪",
    tagline: "Studied for lean muscle growth",
    description: "A selective growth-hormone secretagogue studied for its targeted effects with minimal impact on other hormones in research models.",
    tags: { muscle: 3, sleep: 1, recovery: 1 },
    sizes: [{ code: "IP10", spec: "10mg/vial", price: 30 }],
  },
  {
    id: "cjc-ipamorelin-blend",
    name: "CJC-1295 / Ipamorelin Blend",
    icon: "🧪",
    tagline: "Studied for muscle growth & recovery",
    description: "A combined-dose research blend of CJC-1295 without DAC (5mg) and Ipamorelin (5mg) — the most widely studied growth-hormone-axis stack for muscle and recovery research.",
    tags: { muscle: 3, sleep: 1 },
    sizes: [{ code: "CP10", spec: "10mg/vial (CJC-1295 5mg + Ipamorelin 5mg)", price: 60 }],
  },
  {
    id: "tesamorelin",
    name: "Tesamorelin",
    icon: "🧪",
    tagline: "Studied for fat loss & muscle tone",
    description: "A growth-hormone releasing hormone analog studied for its effects on visceral fat and lean mass in research models.",
    tags: { weight: 2, muscle: 2 },
    sizes: [
      { code: "TSM5", spec: "5mg/vial", price: 40 },
      { code: "TSM10", spec: "10mg/vial", price: 60 },
      { code: "TSM20", spec: "20mg/vial", price: 120 },
    ],
  },
  {
    id: "mots-c",
    name: "MOTS-c",
    icon: "🧪",
    tagline: "Studied for energy & metabolism",
    description: "A mitochondrial-derived peptide studied for its role in metabolic regulation and exercise-response research.",
    tags: { weight: 2, muscle: 1, antiaging: 1 },
    sizes: [
      { code: "MS10", spec: "10mg/vial", price: 30 },
      { code: "MS20", spec: "20mg/vial", price: 45 },
      { code: "MS40", spec: "40mg/vial", price: 70 },
    ],
  },
  {
    id: "ghk-cu",
    name: "GHK-Cu",
    icon: "🧪",
    tagline: "Studied for skin & hair health",
    description: "A copper peptide complex studied extensively for its role in skin remodeling, collagen synthesis, and hair follicle research — the leading skin/hair research peptide.",
    tags: { skin: 3, antiaging: 2 },
    sizes: [
      { code: "CU50", spec: "50mg/vial", price: 20 },
      { code: "CU100", spec: "100mg/vial", price: 25 },
    ],
  },
  {
    id: "recovery-glow-blend",
    name: "GLOW Recovery Blend",
    icon: "🧪",
    tagline: "Studied for recovery & skin health",
    description: "A research blend combining BPC-157 (10mg), TB-500 (10mg) and GHK-Cu (50mg) for combined recovery and skin research — a popular bundled stack.",
    tags: { recovery: 3, skin: 2 },
    sizes: [{ code: "BBG70", spec: "70mg/vial (BPC 10mg + TB-500 10mg + GHK-Cu 50mg)", price: 90 }],
  },
  {
    id: "epithalon",
    name: "Epithalon",
    icon: "🧪",
    tagline: "Studied for anti-aging & better sleep",
    description: "A synthetic tetrapeptide studied for its role in telomerase activity and circadian rhythm regulation in longevity research.",
    tags: { antiaging: 3, sleep: 2 },
    sizes: [
      { code: "ET10", spec: "10mg/vial", price: 25 },
      { code: "ET50", spec: "50mg/vial", price: 60 },
    ],
  },
  {
    id: "nad",
    name: "NAD+",
    icon: "🧪",
    tagline: "Studied for energy & anti-aging",
    description: "A coenzyme central to cellular energy metabolism, widely studied in longevity and mitochondrial-function research — one of the fastest-growing longevity compounds.",
    tags: { antiaging: 2, recovery: 1 },
    sizes: [
      { code: "NJ100", spec: "100mg/vial", price: 20 },
      { code: "NJ500", spec: "500mg/vial", price: 30 },
      { code: "NJ1000", spec: "1000mg/vial", price: 45 },
    ],
  },
];

const CATEGORY_LABELS = {
  recovery: "Recovery",
  muscle: "Muscle & Performance",
  antiaging: "Anti-Aging",
  skin: "Skin & Hair",
  weight: "Weight Management",
  sleep: "Sleep",
};

function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function getSize(product, code) {
  return product.sizes.find((s) => s.code === code);
}

function cheapestSize(product) {
  return product.sizes.reduce((min, s) => (s.price < min.price ? s : min), product.sizes[0]);
}

function formatPrice(n) {
  return "$" + n.toFixed(2) + " AUD";
}
