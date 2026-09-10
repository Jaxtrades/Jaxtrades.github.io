/* Q&A matcher: each question option contributes weighted points to one or
   more categories. Products are scored by summing (option weight * product's
   own tag weight for that category). Highest total score wins. */

const QUIZ_QUESTIONS = [
  {
    icon: "🎯",
    text: "What's your main area of research interest right now?",
    options: [
      { label: "Injury / tissue recovery", points: { recovery: 3 } },
      { label: "Muscle growth & performance", points: { muscle: 3 } },
      { label: "Anti-aging & longevity", points: { antiaging: 3 } },
      { label: "Cognitive focus & mental clarity", points: { cognitive: 3 } },
      { label: "Skin, hair & appearance", points: { skin: 3 } },
      { label: "Weight & metabolism", points: { weight: 3 } },
      { label: "Sleep quality", points: { sleep: 3 } },
      { label: "Stress & mood", points: { stress: 3 } },
      { label: "Immune resilience", points: { immune: 3 } },
    ],
  },
  {
    icon: "🔍",
    text: "Is there a secondary area you're interested in?",
    options: [
      { label: "No secondary interest", points: {} },
      { label: "Injury / tissue recovery", points: { recovery: 2 } },
      { label: "Muscle growth & performance", points: { muscle: 2 } },
      { label: "Anti-aging & longevity", points: { antiaging: 2 } },
      { label: "Cognitive focus & mental clarity", points: { cognitive: 2 } },
      { label: "Skin, hair & appearance", points: { skin: 2 } },
      { label: "Weight & metabolism", points: { weight: 2 } },
      { label: "Sleep quality", points: { sleep: 2 } },
      { label: "Stress & mood", points: { stress: 2 } },
      { label: "Immune resilience", points: { immune: 2 } },
    ],
  },
  {
    icon: "🏃",
    text: "How active are you day to day?",
    options: [
      { label: "Mostly sedentary", points: { weight: 1, sleep: 1 } },
      { label: "Lightly active", points: { recovery: 1 } },
      { label: "Very active / athletic training", points: { recovery: 2, muscle: 2 } },
    ],
  },
  {
    icon: "🌙",
    text: "How would you describe your recent sleep quality?",
    options: [
      { label: "Poor — I struggle to fall or stay asleep", points: { sleep: 3 } },
      { label: "Okay — could be better", points: { sleep: 1 } },
      { label: "Great — no complaints", points: {} },
    ],
  },
  {
    icon: "🧘",
    text: "How would you rate your current stress levels?",
    options: [
      { label: "Low", points: {} },
      { label: "Moderate", points: { stress: 1 } },
      { label: "High", points: { stress: 3 } },
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
    icon: "🔬",
    text: "Any specific research focus you'd like to prioritize?",
    options: [
      { label: "Joint & tissue repair", points: { recovery: 2 } },
      { label: "Skin & hair appearance", points: { skin: 2 } },
      { label: "Cognitive performance", points: { cognitive: 2 } },
      { label: "None in particular", points: {} },
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
