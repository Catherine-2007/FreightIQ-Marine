// FreightIQ Marine :: Ship "Digital Twin" SVG generator
// Original, data-driven illustrations (not photographs) — a labelled
// side-profile bulk carrier scaled and annotated per vessel class / actual
// vessel specs, plus a compact top-down icon used for realistic heading-
// rotated GPS markers. This avoids any copyright/stock-photo dependency and
// keeps the whole app self-contained for offline XAMPP use.

const FIQ_HATCH_COUNT = { 'Handysize': 4, 'Supramax': 5, 'Panamax': 7, 'Capesize': 9 };
let FIQ_TWIN_SEQ = 0;

function fiqShipSvg(opts) {
  const {
    className = 'Panamax',
    loa = 225, beam = 32.3, draft = 14.5,
    status = 'Available',
    loadPct = 0.62,   // 0..1 - drives the waterline (Draft-Aware Load Lab)
    idW = 640, idH = 220,
  } = opts;

  const uid = 'twin' + (FIQ_TWIN_SEQ++);
  const hatches = FIQ_HATCH_COUNT[className] || 6;
  const hullColor = { Available: 'var(--teal)', 'On Voyage': 'var(--seafoam)', Idle: 'var(--amber)', 'Under Repair': 'var(--coral)' }[status] || 'var(--teal)';
  const underway = status === 'On Voyage' || status === 'Available';

  const margin = 60;
  const hullLeft = margin, hullRight = idW - margin;
  const hullW = hullRight - hullLeft;
  const deckY = 70, keelY = 150, waterY = deckY + (keelY - deckY) * (0.34 + 0.34 * Math.max(0, Math.min(1, loadPct)));  // 0.62 reproduces the original 0.55
  const bowX = hullRight, sternX = hullLeft;

  let hatchSvg = '';
  const hatchW = (hullW * 0.62) / hatches;
  const hatchStartX = hullLeft + hullW * 0.18;
  for (let i = 0; i < hatches; i++) {
    const x = hatchStartX + i * (hatchW + 4);
    hatchSvg += `<rect x="${x}" y="${deckY - 14}" width="${hatchW - 4}" height="14" rx="2" fill="url(#${uid}hatchGrad)" stroke="${hullColor}" stroke-width="1"/>`;
  }

  // Portholes along the hull (purely decorative realism detail)
  let portholes = '';
  const nPorts = Math.max(4, Math.round(hullW / 48));
  for (let i = 0; i < nPorts; i++) {
    const x = sternX + 14 + i * (hullW - 28) / nPorts;
    portholes += `<circle cx="${x}" cy="${(deckY + keelY) / 2 + 6}" r="2.2" fill="${hullColor}" opacity="0.35"/>`;
  }

  const statusPulse = status === 'Available' ? `<circle cx="${sternX - 20}" cy="${deckY - 40}" r="5" fill="${hullColor}"><animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/></circle>` : '';

  // Funnel smoke — only when the vessel is actually underway
  let smoke = '';
  if (underway) {
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.9;
      smoke += `
        <circle cx="${sternX + 27}" cy="${deckY - 54}" r="3" fill="rgba(200,215,220,0.5)">
          <animate attributeName="cy" values="${deckY - 54};${deckY - 90}" dur="2.8s" begin="${delay}s" repeatCount="indefinite"/>
          <animate attributeName="cx" values="${sternX + 27};${sternX + 40}" dur="2.8s" begin="${delay}s" repeatCount="indefinite"/>
          <animate attributeName="r" values="3;9" dur="2.8s" begin="${delay}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;0" dur="2.8s" begin="${delay}s" repeatCount="indefinite"/>
        </circle>`;
    }
  }

  // Nav lights: port (red) at bow-left side, starboard (green) — blinking
  const navLights = `
    <circle cx="${bowX - 6}" cy="${deckY - 4}" r="2.2" fill="#ff5c5c">
      <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="${bowX - 6}" cy="${(deckY+keelY)/2}" r="2.2" fill="#5cff8a">
      <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite"/>
    </circle>`;

  // Bow wave ripple — only when underway
  const bowWave = underway ? `
    <path d="M ${bowX - 4},${waterY} q 14,-6 24,0 q -10,8 -24,0" fill="none" stroke="${hullColor}" stroke-width="1.2" opacity="0.5">
      <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.8s" repeatCount="indefinite"/>
    </path>` : '';

  const svg = `
  <svg viewBox="0 0 ${idW} ${idH}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;">
    <defs>
      <linearGradient id="${uid}waterGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${hullColor}" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="${hullColor}" stop-opacity="0.02"/>
      </linearGradient>
      <linearGradient id="${uid}hullGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${hullColor}" stop-opacity="0.05"/>
        <stop offset="55%" stop-color="${hullColor}" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="${hullColor}" stop-opacity="0.04"/>
      </linearGradient>
      <linearGradient id="${uid}hatchGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${hullColor}" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="${hullColor}" stop-opacity="0.15"/>
      </linearGradient>
      <marker id="${uid}arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6" fill="none" stroke="var(--text-muted)" stroke-width="1"/>
      </marker>
    </defs>

    <!-- waterline fill -->
    <rect x="0" y="${waterY}" width="${idW}" height="${idH - waterY}" fill="url(#${uid}waterGrad)"/>
    <!-- wavy water surface -->
    <path d="M0,${waterY} Q ${idW*0.1},${waterY-4} ${idW*0.2},${waterY} T ${idW*0.4},${waterY} T ${idW*0.6},${waterY} T ${idW*0.8},${waterY} T ${idW},${waterY}"
          stroke="${hullColor}" stroke-width="1.5" fill="none" opacity="0.6">
      <animate attributeName="d"
        values="M0,${waterY} Q ${idW*0.1},${waterY-4} ${idW*0.2},${waterY} T ${idW*0.4},${waterY} T ${idW*0.6},${waterY} T ${idW*0.8},${waterY} T ${idW},${waterY};
                M0,${waterY} Q ${idW*0.1},${waterY+4} ${idW*0.2},${waterY} T ${idW*0.4},${waterY} T ${idW*0.6},${waterY} T ${idW*0.8},${waterY} T ${idW},${waterY};
                M0,${waterY} Q ${idW*0.1},${waterY-4} ${idW*0.2},${waterY} T ${idW*0.4},${waterY} T ${idW*0.6},${waterY} T ${idW*0.8},${waterY} T ${idW},${waterY}"
        dur="4s" repeatCount="indefinite"/>
    </path>

    <!-- hull + superstructure group, gently rocking like a vessel at anchor/way -->
    <g>
      <animateTransform attributeName="transform" type="rotate"
        values="-0.6 ${(sternX+bowX)/2} ${keelY}; 0.6 ${(sternX+bowX)/2} ${keelY}; -0.6 ${(sternX+bowX)/2} ${keelY}"
        dur="6s" repeatCount="indefinite"/>

      <!-- hull -->
      <path d="M ${sternX},${deckY}
               L ${bowX - 30},${deckY}
               L ${bowX},${(deckY+keelY)/2}
               L ${bowX - 30},${keelY}
               L ${sternX + 15},${keelY}
               Q ${sternX - 5},${keelY} ${sternX - 5},${keelY - 20}
               L ${sternX - 5},${deckY + 15}
               Q ${sternX - 5},${deckY} ${sternX},${deckY} Z"
            fill="url(#${uid}hullGrad)" stroke="${hullColor}" stroke-width="2.5" stroke-linejoin="round"/>

      <!-- portholes -->
      ${portholes}

      <!-- bridge / superstructure (stern) -->
      <rect x="${sternX + 6}" y="${deckY - 38}" width="42" height="38" rx="3" fill="rgba(0,0,0,0.12)" stroke="${hullColor}" stroke-width="2"/>
      <rect x="${sternX + 12}" y="${deckY - 32}" width="8" height="8" fill="${hullColor}" opacity="0.5"/>
      <rect x="${sternX + 24}" y="${deckY - 32}" width="8" height="8" fill="${hullColor}" opacity="0.5"/>
      <line x1="${sternX + 27}" y1="${deckY - 38}" x2="${sternX + 27}" y2="${deckY - 52}" stroke="${hullColor}" stroke-width="2"/>
      ${statusPulse}
      ${smoke}

      <!-- cargo hatches -->
      ${hatchSvg}

      <!-- deck line -->
      <line x1="${sternX - 5}" y1="${deckY}" x2="${bowX}" y2="${deckY}" stroke="${hullColor}" stroke-width="1.5" opacity="0.7"/>

      ${navLights}
      ${bowWave}
    </g>

    <!-- LOA dimension -->
    <line x1="${sternX - 5}" y1="${keelY + 24}" x2="${bowX}" y2="${keelY + 24}" stroke="var(--text-muted)" stroke-width="1" marker-start="url(#${uid}arrow)" marker-end="url(#${uid}arrow)"/>
    <text x="${(sternX + bowX)/2}" y="${keelY + 40}" text-anchor="middle" font-size="12" fill="var(--text-muted)" font-family="JetBrains Mono, monospace">LOA ${loa} m</text>

    <!-- draft dimension -->
    <line x1="${bowX + 20}" y1="${deckY}" x2="${bowX + 20}" y2="${keelY}" stroke="var(--text-muted)" stroke-width="1"/>
    <text x="${bowX + 28}" y="${(deckY+keelY)/2}" font-size="12" fill="var(--text-muted)" font-family="JetBrains Mono, monospace">Draft ${draft} m</text>

    <!-- beam label -->
    <text x="${sternX}" y="${keelY + 60}" font-size="12" fill="var(--text-muted)" font-family="JetBrains Mono, monospace">Beam ${beam} m</text>
    <text x="${sternX}" y="${deckY - 60}" font-size="13" font-weight="700" fill="${hullColor}" font-family="Poppins, sans-serif">${className}</text>
  </svg>`;
  // SMIL <animate> elements ignore CSS, so strip them for Reduced Motion users.
  const reduced = localStorage.getItem('fiq_reduced_motion') === 'true' || document.documentElement.dataset.reducedMotion === 'true';
  return reduced ? svg.replace(/<animateTransform[\s\S]*?\/>/g, '').replace(/<animate\b[\s\S]*?\/>/g, '') : svg;
}

/** Compact top-down hull icon used as a real, heading-rotated GPS marker
 *  (replaces a flat emoji so the fleet map reads like an actual chart). */
function fiqShipTopIcon(statusClass) {
  return `
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path class="hull-fill" d="M12,0 L17,9 L17,16 Q17,20 12,22 Q7,20 7,16 L7,9 Z" opacity="0.92"/>
    <path d="M12,0 L17,9 L17,16 Q17,20 12,22 Q7,20 7,16 L7,9 Z" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="0.5"/>
    <line x1="12" y1="9" x2="12" y2="2" stroke="rgba(0,0,0,0.3)" stroke-width="0.8"/>
  </svg>`;
}

/** Decorative hero illustration for login/landing pages: ship + waves + compass. */
function fiqHeroSvg() {
  return `
  <svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:340px;height:auto;opacity:0.9;">
    <defs>
      <radialGradient id="heroGlow" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="var(--cyan)" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="var(--cyan)" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="200" cy="70" r="70" fill="url(#heroGlow)"/>
    <circle cx="200" cy="70" r="38" fill="none" stroke="var(--cyan)" stroke-width="1.5" opacity="0.5"/>
    <circle cx="200" cy="70" r="2.5" fill="var(--cyan)"/>
    <g stroke="var(--cyan)" stroke-width="1" opacity="0.7">
      <line x1="200" y1="32" x2="200" y2="40"/>
      <line x1="200" y1="100" x2="200" y2="108"/>
      <line x1="162" y1="70" x2="170" y2="70"/>
      <line x1="230" y1="70" x2="238" y2="70"/>
    </g>
    <g transform="rotate(-18 200 70)">
      <polygon points="200,50 206,70 200,90 194,70" fill="var(--coral)" opacity="0.85"/>
    </g>
    <g transform="translate(120,110)">
      <path d="M0,20 L150,20 L165,35 L150,50 L15,50 Q0,50 0,38 Z" fill="none" stroke="var(--seafoam)" stroke-width="2"/>
      <rect x="10" y="0" width="26" height="20" fill="none" stroke="var(--seafoam)" stroke-width="2"/>
      <line x1="140" y1="20" x2="140" y2="6" stroke="var(--seafoam)" stroke-width="2"/>
    </g>
    <path d="M0,150 Q50,140 100,150 T200,150 T300,150 T400,150" stroke="var(--teal)" stroke-width="1.5" fill="none" opacity="0.6">
      <animate attributeName="d"
        values="M0,150 Q50,140 100,150 T200,150 T300,150 T400,150;
                M0,150 Q50,160 100,150 T200,150 T300,150 T400,150;
                M0,150 Q50,140 100,150 T200,150 T300,150 T400,150"
        dur="5s" repeatCount="indefinite"/>
    </path>
  </svg>`;
}
