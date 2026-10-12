// Published median sale prices for postcode 4209 and surrounding suburbs (northern Gold Coast, QLD).
// Figures are mid-2026 12-month medians gathered from public suburb profiles; `source` and `asOf`
// record where each came from. Update these as new figures are published.
// `unit` is null where no reliable unit median was available.
const DATA_UPDATED = 'October 2026';

const SUBURBS = [
  { name: 'Coomera',       postcode: '4209', house: 1050000, unit: 795000, source: 'Cotality',                     asOf: 'Jun 2026' },
  { name: 'Upper Coomera', postcode: '4209', house: 1100000, unit: 840250, source: 'Cotality',                     asOf: 'Jun 2026' },
  { name: 'Pimpama',       postcode: '4209', house: 1044750, unit: 836375, source: 'Andrea Monti suburb data',     asOf: 'Jul 2026' },
  { name: 'Willow Vale',   postcode: '4209', house: 1047500, unit: null,   source: 'Cotality',                     asOf: 'Jun 2026', lowVolume: true },
  { name: 'Ormeau',        postcode: '4208', house: 1056906, unit: 794635, source: 'Heatmaps (2026 YTD)',          asOf: 'Aug 2026' },
  { name: 'Oxenford',      postcode: '4210', house: 1180000, unit: 782000, source: 'Cotality',                     asOf: 'Jun 2026' },
  { name: 'Pacific Pines', postcode: '4211', house: 1200452, unit: null,   source: 'Heatmaps (2026 YTD)',          asOf: 'Aug 2026' },
  { name: 'Helensvale',    postcode: '4212', house: 1315000, unit: null,   source: 'PRD (FY2026)',                 asOf: 'Jun 2026' },
  { name: 'Hope Island',   postcode: '4212', house: 1917500, unit: 975500, source: 'Your Investment Property',     asOf: 'Jun 2026' },
];

// The "typical" property each suburb median roughly describes; estimates adjust from this.
const TYPICAL = {
  house:     { beds: 4, baths: 2, cars: 2, land: 450, year: 2012 },
  townhouse: { beds: 3, baths: 2, cars: 1, land: 0,   year: 2015 },
  unit:      { beds: 2, baths: 2, cars: 1, land: 0,   year: 2015 },
};

