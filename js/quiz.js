/* Q&A matcher.
   Question 1 asks the shopper's single main focus directly — a broad
   pick across the categories the catalog actually covers, weighted
   heavily (5x) so whatever they say they care about most clearly
   drives the top match and bundle. Questions 2-7 each dig into one
   specific category on its own, with natural, graded answers
   (none/mild/significant) rather than another flat list of category
   names — these refine the primary pick rather than override it.
   Categories match the curated ~15-product catalog in products.js:
   recovery, muscle & performance, weight/metabolism, skin & hair,
   anti-aging, and sleep (a secondary trait of a couple of longevity
   and GH-axis products, not its own product line).
   Each answer option awards weighted points to one or more categories.
   Products are scored by summing (option weight * product's own tag
   weight for that category). Highest total score wins. */

const QUIZ_QUESTIONS = [
  {
    icon: "🎯",
    text: "What would you like to focus on most?",
    options: [
      { label: "Muscle growth & performance", points: { muscle: 5 } },
      { label: "Injury / tissue recovery", points: { recovery: 5 } },
      { label: "Weight & metabolism", points: { weight: 5 } },
      { label: "Skin, hair & appearance", points: { skin: 5 } },
      { label: "Anti-aging & longevity", points: { antiaging: 5 } },
      { label: "Sleep quality", points: { sleep: 5 } },
    ],
  },
  {
    icon: "💪",
    text: "How active is your training or exercise routine?",
    options: [
      { label: "Sedentary — I rarely exercise", points: {} },
      { label: "Moderate — active a few times a week", points: { muscle: 1 } },
      { label: "Intense — athletic training or performance-focused", points: { muscle: 3, recovery: 1 } },
    ],
  },
  {
    icon: "🩹",
    text: "Do you have any nagging injuries, joint pain, or areas that heal slowly?",
    options: [
      { label: "No issues at the moment", points: {} },
      { label: "Some minor stiffness or soreness", points: { recovery: 1 } },
      { label: "Yes — ongoing pain or an injury", points: { recovery: 3 } },
    ],
  },
  {
    icon: "⚖️",
    text: "Is managing your weight or metabolism a priority right now?",
    options: [
      { label: "Not really", points: {} },
      { label: "Somewhat", points: { weight: 1 } },
      { label: "Yes — it's a main focus", points: { weight: 3 } },
    ],
  },
  {
    icon: "✨",
    text: "Any concerns about your skin, hair, or signs of aging skin?",
    options: [
      { label: "Not really", points: {} },
      { label: "A little", points: { skin: 1 } },
      { label: "Yes — it's something I'd like to improve", points: { skin: 3 } },
    ],
  },
  {
    icon: "🎂",
    text: "What age range are you in?",
    options: [
      { label: "18–29", points: {} },
      { label: "30–44", points: { antiaging: 1 } },
      { label: "45–59", points: { antiaging: 2 } },
      { label: "60+", points: { antiaging: 3 } },
    ],
  },
  {
    icon: "🌙",
    text: "How would you describe your sleep lately?",
    options: [
      { label: "Great — no complaints", points: {} },
      { label: "Okay — could be better", points: { sleep: 1 } },
      { label: "Poor — I struggle to fall or stay asleep", points: { sleep: 3 } },
    ],
  },
];

function scoreProducts(answers) {
  const totals = {};
  PRODUCTS.forEach((p) => (totals[p.id] = 0));

  answers.forEach((option) => {
    if (!option) return;
    Object.entries(option.points).forEach(([category, weight]) => {
      PRODUCTS.forEach((p) => {
        const productWeight = p.tags[category] || 0;
        if (productWeight > 0) {
          totals[p.id] += weight * productWeight;
        }
      });
    });
  });

  return Object.entries(totals)
    .map(([id, score]) => ({ product: getProduct(id), score }))
    .sort((a, b) => b.score - a.score);
}
