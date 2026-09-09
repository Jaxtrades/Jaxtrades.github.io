/* Product catalog + tag weights used by the quiz matcher.
   tags: category -> relevance weight (0-3). */
const PRODUCTS = [
  {
    id: "bpc-157",
    name: "BPC-157",
    icon: "🩹",
    price: 54.99,
    size: "5mg vial",
    tagline: "Tissue & gut recovery support",
    description:
      "A synthetic peptide fragment widely studied in animal models for its role in supporting tissue repair and gastrointestinal integrity.",
    tags: { recovery: 3, muscle: 1 },
  },
  {
    id: "tb-500",
    name: "TB-500",
    icon: "🔧",
    price: 59.99,
    size: "5mg vial",
    tagline: "Flexibility & recovery research",
    description:
      "A synthetic version of Thymosin Beta-4, studied for its potential role in cell migration and recovery-related research models.",
    tags: { recovery: 3, muscle: 1 },
  },
  {
    id: "ipamorelin",
    name: "Ipamorelin",
    icon: "💪",
    price: 44.99,
    size: "5mg vial",
    tagline: "Lean muscle & GH research",
    description:
      "A selective growth-hormone secretagogue studied for its targeted effects with minimal impact on other hormones in research models.",
    tags: { muscle: 3, sleep: 1, recovery: 1 },
  },
  {
    id: "cjc-1295",
    name: "CJC-1295",
    icon: "🏋️",
    price: 49.99,
    size: "5mg vial",
    tagline: "Muscle & recovery research",
    description:
      "A growth-hormone releasing hormone analog studied for sustained effects on growth hormone pulses in research settings.",
    tags: { muscle: 3, recovery: 1 },
  },
  {
    id: "ghk-cu",
    name: "GHK-Cu",
    icon: "✨",
    price: 39.99,
    size: "50mg vial",
    tagline: "Skin, hair & collagen research",
    description:
      "A copper peptide complex studied extensively for its role in skin remodeling, collagen synthesis, and hair follicle research.",
    tags: { skin: 3, antiaging: 2 },
  },
  {
    id: "epithalon",
    name: "Epithalon",
    icon: "🌙",
    price: 47.99,
    size: "10mg vial",
    tagline: "Longevity & sleep-cycle research",
    description:
      "A synthetic tetrapeptide studied for its role in telomerase activity and circadian rhythm regulation in longevity research.",
    tags: { antiaging: 3, sleep: 2 },
  },
  {
    id: "selank",
    name: "Selank",
    icon: "🧘",
    price: 42.99,
    size: "5mg vial",
    tagline: "Calm focus & stress research",
    description:
      "A synthetic peptide analog studied for anxiolytic-like effects and modulation of stress response in research models.",
    tags: { stress: 3, cognitive: 1 },
  },
  {
    id: "semax",
    name: "Semax",
    icon: "🧠",
    price: 42.99,
    size: "5mg vial",
    tagline: "Mental clarity & focus research",
    description:
      "A synthetic peptide derived from ACTH, studied for nootropic and neuroprotective properties in cognitive research.",
    tags: { cognitive: 3, stress: 1 },
  },
  {
    id: "aod-9604",
    name: "AOD-9604",
    icon: "⚖️",
    price: 46.99,
    size: "5mg vial",
    tagline: "Metabolism & weight research",
    description:
      "A modified fragment of human growth hormone studied for its targeted effects on fat metabolism in research models.",
    tags: { weight: 3 },
  },
  {
    id: "thymosin-alpha-1",
    name: "Thymosin Alpha-1",
    icon: "🛡️",
    price: 64.99,
    size: "10mg vial",
    tagline: "Immune resilience research",
    description:
      "A naturally occurring thymic peptide studied for its role in modulating and supporting immune system research models.",
    tags: { immune: 3 },
  },
];

const CATEGORY_LABELS = {
  recovery: "Recovery",
  muscle: "Muscle & Performance",
  antiaging: "Anti-Aging",
  cognitive: "Cognitive Focus",
  skin: "Skin & Hair",
  weight: "Weight Management",
  sleep: "Sleep",
  stress: "Stress & Mood",
  immune: "Immune Support",
};

function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function formatPrice(n) {
  return "$" + n.toFixed(2);
}
