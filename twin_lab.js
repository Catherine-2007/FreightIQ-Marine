// FreightIQ Marine :: Digital Twin extras
//  1) Draft-Aware Load Lab  - drag cargo tonnage, watch the waterline/draught change and see
//     which ports (real draft/LOA/beam limits from the database) the loaded ship can still enter,
//     plus the maximum safe cargo for each port.  <- the feature generic freight dashboards skip.
// HONEST LIMITS: draught is linearly interpolated between an estimated light-ship draught
// (38% of the vessel's loaded draft) and its recorded loaded draft; cargo = 94% of DWT at full
// load. It is a planning aid, not a class-approved loading computer, and ignores trim, density,
// squat, tide and under-keel clearance.
window.FIQTwinLab = (function () {
  const X = (s) => (window.fiqX ? window.fiqX(s) : s);
  const LIGHT_RATIO = 0.38, CARGO_OF_DWT = 0.94;
  
  const calc = (v, load) => {
    const design = +v.draft_m, light = design * LIGHT_RATIO;
    return { design, light, draught: light + (design - light) * load, cargo: load * (+v.dwt) * CARGO_OF_DWT };
  };

  function portReach(v, ports, load) {
    const c = calc(v, load);
    return ports.map((p) => {
      const maxD = +p.max_draft_m, maxL = +p.max_loa_m, maxB = +p.max_beam_m;
      const hullOk = (!maxL || +v.loa_m <= maxL) && (!maxB || +v.beam_m <= maxB);
      const margin = maxD - c.draught;
      const fMax = Math.max(0, Math.min(1, (maxD - c.light) / (c.design - c.light)));
      return { name: (p.name || '').replace(/ Port$/, ''), maxD, margin, hullOk, ok: hullOk && margin >= 0, maxTonnes: hullOk ? fMax * (+v.dwt) * CARGO_OF_DWT : 0 };
    }).sort((a, b) => (b.ok - a.ok) || (b.margin - a.margin));
  }

  /** Side-on gauge: ship waterline fixed, keel drops with load, port limits drawn as depth ticks. */
  function gaugeSvg(v, ports, load) {
    const c = calc(v, load), k = 120 / c.design, wl = 34, W = 150, H = 190;
    const yKeel = wl + c.draught * k;
    let ticks = '';
    ports.forEach((p) => {
      const d = +p.max_draft_m, y = wl + d * k;
      if (y > H - 6) return;                                   // limit is far deeper than this ship: off-scale
      const ok = (!(+p.max_loa_m) || +v.loa_m <= +p.max_loa_m) && (!(+p.max_beam_m) || +v.beam_m <= +p.max_beam_m) && d >= c.draught;
      ticks += `<line x1="86" x2="${W - 8}" y1="${y}" y2="${y}" stroke="${ok ? 'var(--teal)' : 'var(--coral)'}" stroke-width="1.4" stroke-dasharray="3 3" opacity=".85"/><circle cx="${W - 8}" cy="${y}" r="2.6" fill="${ok ? 'var(--teal)' : 'var(--coral)'}"/>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" class="lab-gauge" aria-hidden="true">
      <defs><linearGradient id="labW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--cyan)" stop-opacity=".30"/><stop offset="1" stop-color="var(--cyan)" stop-opacity=".03"/></linearGradient></defs>
      <rect x="0" y="${wl}" width="${W}" height="${H - wl}" fill="url(#labW)"/>
      <path d="M0 ${wl} q 9 -4 18 0 t 18 0 t 18 0 t 18 0 t 18 0 t 18 0 t 18 0 t 18 0 t 18 0" fill="none" stroke="var(--cyan)" stroke-width="1.3"/>
      <path d="M10 ${wl - 22} h 62 l 10 ${22 + (yKeel - wl) * 0.45} l -12 ${(yKeel - wl) * 0.55} h -52 q -10 0 -10 -${(yKeel - wl) * 0.4} z" fill="rgba(var(--cyan-rgb),.20)" stroke="var(--cyan)" stroke-width="1.4" style="transition:d .25s"/>
      <line x1="2" x2="84" y1="${yKeel}" y2="${yKeel}" stroke="var(--amber)" stroke-width="1.6"/>
      <text x="4" y="${Math.min(H - 4, yKeel + 12)}" font-size="9.5" fill="var(--amber)" font-family="JetBrains Mono, monospace">${c.draught.toFixed(1)} m</text>
      ${ticks}
    </svg>`;
  }

  function mount(host, v, ports, onLoad) {
    if (!host || !ports || !ports.length) { if (host) host.innerHTML = ''; return; }
    host.innerHTML = `
      <h3 style="margin-top:18px;">⚖️ ${X('Draft-Aware Load Lab')}</h3>
      <div class="lab-grid">
        <div class="lab-ctrl">
          <label class="explain-label">${X('Cargo on board')}</label>
          <div class="lab-big"><b id="labCargo"></b> <span id="labPct" class="subtle"></span></div>
          <input type="range" id="labSlider" min="0" max="100" step="1" value="100" aria-label="${X('Cargo on board')}">
          <div class="lab-read"><span class="explain-label">${X('Draught at this load')}</span><b id="labDraught" class="mono"></b></div>
          <div class="lab-read"><span class="explain-label">${X('Port Reach')}</span><b id="labReach"></b></div>
        </div>
        <div id="labGauge" class="lab-gauge-wrap"></div>
      </div>
      <div id="labChips" class="lab-chips"></div>
      <p class="subtle" style="margin-top:8px;">⚠ ${X('Light-ship estimate. Planning aid only, not a loading computer.')}</p>`;
    const slider = host.querySelector('#labSlider');
    let raf = 0;
    const paint = () => {
      const load = slider.value / 100, c = calc(v, load), reach = portReach(v, ports, load);
      host.querySelector('#labCargo').textContent = Math.round(c.cargo).toLocaleString() + ' t';
      host.querySelector('#labPct').textContent = slider.value === '100' ? '· ' + X('Full load') : '· ' + slider.value + '%';
      host.querySelector('#labDraught').textContent = c.draught.toFixed(2) + ' m';
      const n = reach.filter((r) => r.ok).length;
      host.querySelector('#labReach').textContent = n + ' / ' + reach.length;
      host.querySelector('#labReach').style.color = n === reach.length ? 'var(--teal)' : n === 0 ? 'var(--coral)' : 'var(--amber)';
      host.querySelector('#labGauge').innerHTML = gaugeSvg(v, ports, load);
      host.querySelector('#labChips').innerHTML = reach.map((r) => `
        <div class="lab-chip ${r.ok ? 'ok' : 'bad'}">
          <b>${r.name}</b>
          <span class="mono">${r.hullOk ? (r.margin >= 0 ? '+' : '−') + Math.abs(r.margin).toFixed(1) + ' m' : '✕ LOA / ' + X('Beam')}</span>
          <small>${r.ok ? '✓ ' + X('Fits') : '✕ ' + (r.hullOk ? X('Too deep') : 'LOA / ' + X('Beam'))} · ${X('Max safe load')}: ${r.hullOk ? Math.round(r.maxTonnes).toLocaleString() + ' t' : '—'}</small>
        </div>`).join('');
      if (onLoad) onLoad(load);
    };
    slider.addEventListener('input', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); });
    paint();
  }

  function stop() {}

  return { mount, stop, _calc: calc, _reach: portReach };
})();
