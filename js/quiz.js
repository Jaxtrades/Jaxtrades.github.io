/* Q&A matcher: each question targets one research category with its own
   specific, natural-language question and graded answers (rather than
   asking the shopper to repeatedly pick from one big list of categories).
   Each answer option awards weighted points to one or more categories.
   Products are scored by summing (option weight * product's own tag
   weight for that category). Highest total score wins. */

const QUIZ_QUESTIONS = [
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
    icon: "💪",
    text: "How active is your training or exercise routine?",
    options: [
      { label: "Sedentary — I rarely exercise", points: {} },
      { label: "Moderate — active a few times a week", points: { muscle: 1 } },
      { label: "Intense — athletic training or performance-focused", points: { muscle: 3, recovery: 1 } },
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
    icon: "🌙",
    text: "How would you describe your sleep lately?",
    options: [
      { label: "Great — no complaints", points: {} },
      { label: "Okay — could be better", points: { sleep: 1 } },
      { label: "Poor — I struggle to fall or stay asleep", points: { sleep: 3 } },
    ],
  },
  {
    icon: "🧘",
    text: "How would you rate your everyday stress levels?",
    options: [
      { label: "Low", points: {} },
      { label: "Moderate", points: { stress: 1 } },
      { label: "High", points: { stress: 3 } },
    ],
  },
  {
    icon: "🧠",
    text: "Do you experience brain fog or trouble concentrating?",
    options: [
      { label: "Rarely", points: {} },
      { label: "Sometimes", points: { cognitive: 1 } },
      { label: "Often", points: { cognitive: 3 } },
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
    icon: "🛡️",
    text: "Do you get sick often, or want extra immune support?",
    options: [
      { label: "Rarely get sick — not a priority", points: {} },
      { label: "Sometimes", points: { immune: 1 } },
      { label: "Often, or it's a priority for me", points: { immune: 3 } },
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
