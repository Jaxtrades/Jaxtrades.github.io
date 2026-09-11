/* Inline SVG illustration of the Cozzy pillow, reused across pages with a
   configurable body color. No product photography — this is the brand mark. */
function cozzyIllustration(hex, opts) {
  opts = opts || {};
  const showHeat = opts.heat !== false;
  const showSpark = opts.spark !== false;
  const uid = "g" + Math.random().toString(36).slice(2, 9);
  return `
  <svg viewBox="0 0 220 220" class="cozzy-illo" role="img" aria-label="The Cozzy heating pillow">
    <defs>
      <radialGradient id="glow-${uid}" cx="50%" cy="42%" r="60%">
        <stop offset="0%" stop-color="${hex}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${hex}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="body-${uid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${hex}"/>
        <stop offset="100%" stop-color="${hex}" stop-opacity="0.88"/>
      </linearGradient>
    </defs>

    <circle cx="110" cy="105" r="95" fill="url(#glow-${uid})"/>

    ${showHeat ? `
    <g stroke="${hex}" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.55" class="heat-waves">
      <path d="M70,38 C66,28 74,22 70,12" />
      <path d="M108,32 C104,22 112,16 108,6" />
      <path d="M146,38 C142,28 150,22 146,12" />
    </g>` : ""}

    <path d="M44,72 C46,32 168,30 174,68 C182,112 180,158 142,182 C104,204 60,198 36,168 C12,138 18,96 44,72 Z"
      fill="url(#body-${uid})" stroke="#2B1710" stroke-opacity="0.08" stroke-width="2"/>

    <g stroke="#FFFBF6" stroke-opacity="0.55" stroke-width="2.5" stroke-dasharray="1 9" stroke-linecap="round" fill="none">
      <path d="M32,92 C80,78 148,78 190,96"/>
      <path d="M28,124 C82,110 146,110 194,126"/>
      <path d="M40,156 C86,146 142,146 180,158"/>
    </g>

    <path d="M110,108 c-10,-12 -30,-6 -30,10 c0,14 20,24 30,34 c10,-10 30,-20 30,-34 c0,-16 -20,-22 -30,-10 z"
      fill="#FFFBF6" opacity="0.5"/>

    <g>
      <circle cx="152" cy="150" r="15" fill="#FFFBF6" opacity="0.92"/>
      <circle cx="147" cy="150" r="2.6" fill="${hex}"/>
      <circle cx="152" cy="150" r="2.6" fill="${hex}"/>
      <circle cx="157" cy="150" r="2.6" fill="${hex}" opacity="0.35"/>
    </g>

    <path d="M162,162 C176,170 182,184 176,200" stroke="#2B1710" stroke-opacity="0.18" stroke-width="4" fill="none" stroke-linecap="round"/>

    ${showSpark ? `
    <g fill="#FFC93C">
      <path d="M186,58 l3,8 8,3 -8,3 -3,8 -3,-8 -8,-3 8,-3 z" opacity="0.9"/>
      <path d="M26,52 l2,5 5,2 -5,2 -2,5 -2,-5 -5,-2 5,-2 z" opacity="0.7"/>
    </g>` : ""}
  </svg>`;
}
