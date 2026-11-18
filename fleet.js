// FreightIQ Marine :: Fleet & GPS tracking + Digital Twin (unified)
// Map markers, roster rows and the Digital Twin modal all share one data
// model: click a vessel anywhere and you get the same twin — illustration,
// live-style GPS telemetry, animated compass, mini-map, ETA countdown and
// emissions estimate. All positions are SIMULATED (never presented as AIS).
(async function () {
  const FUEL_TPD = { Handysize: 18, Supramax: 26, Panamax: 32, Capesize: 55 }; // matches vessel_classes seed
  const CO2_FACTOR = 3.114; // IMO standard t-CO2 per t-fuel (HFO)

  const map = L.map('gpsMap', { worldCopyJump: true }).setView([14, 80], 4);

  // ---- theme-matched basemap (dark nautical chart for dark themes) ----
  function tileConfig() {
    const light = (localStorage.getItem('fiq_theme') || 'ocean') === 'light';
    return light
      ? { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '&copy; OpenStreetMap contributors' }
      : { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attr: '&copy; OpenStreetMap contributors &copy; CARTO' };
  }
  function makeTiles() { const t = tileConfig(); return L.tileLayer(t.url, { attribution: t.attr, maxZoom: 12, subdomains: 'abcd' }); }
  let currentTileLayer = makeTiles().addTo(map);
  let miniMap = null, miniTiles = null;
  window.addEventListener('fiq-theme-changed', () => {
    map.removeLayer(currentTileLayer); currentTileLayer = makeTiles().addTo(map);
    if (miniMap && miniTiles) { miniMap.removeLayer(miniTiles); miniTiles = makeTiles().addTo(miniMap); }
  });

  const mapEl = document.getElementById('gpsMap');

  // ---- icons ----
  function pulseIcon(cls) {
    return L.divIcon({ className: '', html: `<div class="pulse-marker ${cls}"><div class="ring"></div><div class="dot"></div></div>`, iconSize: [14, 14] });
  }
  function vesselIcon(statusClass, headingDeg, underway) {
    // rotation on an inner wrapper, bob animation on the outer (a CSS @keyframes
    // on `transform` would otherwise overwrite the inline rotate()).
    const sonar = underway ? '<span class="sonar-ring"></span><span class="sonar-ring delay"></span>' : '';
    return L.divIcon({
      className: '',
      html: `<div class="vessel-marker-wrap status-${statusClass}">${sonar}<div style="transform:rotate(${headingDeg}deg);width:100%;height:100%;display:flex;align-items:center;justify-content:center;">${fiqShipTopIcon(statusClass)}</div></div>`,
      iconSize: [26, 26], iconAnchor: [13, 13],
    });
  }
  function wakePts(lat, lon, headingDeg, speedKnots) {
    const rad = (headingDeg + 180) * Math.PI / 180, pts = [[lat, lon]];
    const stepDeg = 0.045 * Math.min(1.4, (speedKnots || 6) / 10);
    for (let i = 1; i <= 5; i++) pts.push([lat + Math.cos(rad) * stepDeg * i, lon + Math.sin(rad) * stepDeg * i]);
    return pts;
  }
  function drawWake(lat, lon, headingDeg, speedKnots) {
    return L.polyline(wakePts(lat, lon, headingDeg, speedKnots), { color: '#43d9e8', weight: 2, opacity: 0.35, className: 'wake-trail', dashArray: '1,6' }).addTo(map);
  }
  /** Dead-reckoning: where a vessel would be after `hours` on its current heading/speed (1 nm = 1/60 deg lat). */
  function deadReckon(v, hours) {
    const nm = (+v.speed_knots || 0) * hours, h = (+v.heading_deg || 0) * Math.PI / 180, lat = +v.latitude;
    return [lat + (nm * Math.cos(h)) / 60, +v.longitude + (nm * Math.sin(h)) / (60 * Math.max(0.2, Math.cos(lat * Math.PI / 180)))];
  }
  /** Curved trade-lane polyline (Mercator makes straight lines look wrong on long hauls). */
  function curvePoints(a, b, steps) {
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const dx = b[1] - a[1], dy = b[0] - a[0], len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ctrl = [mid[0] + (dx / len) * len * 0.12, mid[1] - (dy / len) * len * 0.12];
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, u = 1 - t;
      pts.push([u*u*a[0] + 2*u*t*ctrl[0] + t*t*b[0], u*u*a[1] + 2*u*t*ctrl[1] + t*t*b[1]]);
    }
    return pts;
  }

  // ---- state ----
  let GPS = null; const gpsById = {};
  const lanesLayer = L.layerGroup().addTo(map);
  let lastVesselRows = [], currentTwin = null, PORTS = [];
  const vesselMarkers = {}, wakeLines = {};
  const ringsLayer = L.layerGroup().addTo(map);
  const T = (s) => (window.fiqX ? window.fiqX(s) : s);

  // ---- helpers ----
  const fmtCoord = (lat, lon) => `${Math.abs(lat).toFixed(3)}°${lat >= 0 ? 'N' : 'S'}  ${Math.abs(lon).toFixed(3)}°${lon >= 0 ? 'E' : 'W'}`;
  const statusClassOf = (s) => s.toLowerCase().replace(/ /g, '-');
  function countdownText(etaStr) {
    if (!etaStr) return '—';
    const ms = new Date(etaStr.replace(' ', 'T')).getTime() - Date.now();
    if (isNaN(ms)) return '—';
    if (ms <= 0) return '✓';
    const s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    return `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`;
  }
  function tickCountdowns() {
    document.querySelectorAll('.eta-countdown[data-eta]').forEach(el => { el.textContent = countdownText(el.dataset.eta); });
  }
  setInterval(tickCountdowns, 1000);

  // ---- Digital Twin modal (ship illustration + GPS + telemetry) ----
  function compassSvg() {
    return `<svg viewBox="0 0 100 100" class="compass-svg" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="none" stroke="var(--cyan)" stroke-width="1.5" opacity="0.6"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="var(--cyan)" stroke-width="0.6" opacity="0.35"/>
      <g stroke="var(--cyan)" stroke-width="1.2" opacity="0.8"><line x1="50" y1="4" x2="50" y2="12"/><line x1="50" y1="88" x2="50" y2="96"/><line x1="4" y1="50" x2="12" y2="50"/><line x1="88" y1="50" x2="96" y2="50"/></g>
      <text x="50" y="22" text-anchor="middle" font-size="9" fill="var(--cyan)" font-family="JetBrains Mono">N</text>
      <g class="compass-needle" style="transform-origin:50px 50px;transform:rotate(0deg);">
        <polygon points="50,14 57,50 50,44 43,50" fill="var(--coral)"/>
        <polygon points="50,86 57,50 50,56 43,50" fill="var(--text-muted)" opacity="0.7"/>
      </g><circle cx="50" cy="50" r="3" fill="var(--cyan)"/></svg>`;
  }

  function closeTwin() {
    document.getElementById('twinOverlay').classList.add('hidden');
    if (miniMap) { miniMap.remove(); miniMap = null; miniTiles = null; }
    currentTwin = null;
    if (window.FIQTwinLab) FIQTwinLab.stop();
  }

  function openDigitalTwin(v) {
    const g = gpsById[v.id] || {};
    const d = Object.assign({}, v, g);
    currentTwin = v;
    const overlay = document.getElementById('twinOverlay');
    const content = document.getElementById('twinContent');
    const hasPos = d.latitude !== undefined && d.latitude !== null;
    const underway = d.availability === 'On Voyage';
    const fuel = FUEL_TPD[d.class_name] || 25;
    const co2Day = (fuel * CO2_FACTOR).toFixed(1);
    const sc = statusClassOf(d.availability);

    content.innerHTML = `
      <h2>🚢 ${d.vessel_name} <span class="subtle">— ${fiqT('tw_title')}</span></h2>
      <p class="subtle">IMO ${d.imo_number} · ${d.class_name} · ${d.flag || ''}</p>
      <div class="twin-hull-wrap">${fiqShipSvg({ className: d.class_name, loa: d.loa_m, beam: d.beam_m, draft: d.draft_m, status: d.availability, loadPct: 1 })}</div>

      <h3 style="margin-top:14px;">📡 ${fiqT('tw_telemetry')}</h3>
      <div class="twin-gps-row">
        <div id="twinMiniMap" class="twin-mini-map"></div>
        <div class="twin-compass">${compassSvg()}<div class="mono compass-readout">${hasPos ? d.heading_deg + '°' : '—'}</div></div>
      </div>
      <div class="twin-specs">
        <div><span class="explain-label">${fiqT('tw_position')}</span><b class="mono">${hasPos ? fmtCoord(+d.latitude, +d.longitude) : '—'}</b></div>
        <div><span class="explain-label">${fiqT('tw_speed')}</span><b>${hasPos ? d.speed_knots + ' kn' : '—'}</b></div>
        <div><span class="explain-label">${fiqT('tw_heading')}</span><b>${hasPos ? d.heading_deg + '°' : '—'}</b></div>
        <div><span class="explain-label">${fiqT('c_status')}</span><span class="status-badge status-${sc}">${fiqEnum(d.availability)}</span></div>
        <div><span class="explain-label">${fiqT('tw_eta_countdown')}</span><b class="mono eta-countdown" data-eta="${d.eta || ''}">${countdownText(d.eta)}</b></div>
        <div><span class="explain-label">${fiqT('u_co2_est')} / day</span><b>🌿 ${co2Day} t</b></div>
      </div>
      <div class="twin-specs" style="margin-top:8px;">
        <div><span class="explain-label">DWT</span><b>${Number(d.dwt).toLocaleString()} t</b></div>
        <div><span class="explain-label">LOA</span><b>${d.loa_m} m</b></div>
        <div><span class="explain-label">${T('Beam')}</span><b>${d.beam_m} m</b></div>
        <div><span class="explain-label">${T('Draught')}</span><b>${d.draft_m} m</b></div>
      </div>
      <div id="twinLab"></div>
      ${hasPos ? `<button class="btn-secondary" id="twinLocate" style="margin-top:12px;">📍 ${fiqT('tw_locate')}</button>` : ''}
      <p class="subtle" style="margin-top:12px;">⚠ ${fiqT('x_tw_disclaimer')}</p>`;
    overlay.classList.remove('hidden');

    if (hasPos) {
      // mini-map (GPS fix) — created after the overlay is visible so Leaflet can measure it
      setTimeout(() => {
        const el = document.getElementById('twinMiniMap'); if (!el || el._leaflet_id) return;   // guard: two quick opens must not init the same node twice
        if (miniMap) { try { miniMap.remove(); } catch (e) {} miniMap = null; }
        miniMap = L.map(el, { zoomControl: false, attributionControl: false, dragging: true }).setView([+d.latitude, +d.longitude], 5);
        miniTiles = makeTiles().addTo(miniMap);
        L.marker([+d.latitude, +d.longitude], { icon: vesselIcon(sc, +d.heading_deg, underway) }).addTo(miniMap);
        miniMap.invalidateSize();
      }, 120);
      // animate the compass needle swinging to the live heading
      setTimeout(() => {
        const needle = document.querySelector('.compass-needle');
        if (needle) { needle.style.transition = 'transform 1.4s cubic-bezier(.2,.8,.2,1)'; needle.style.transform = `rotate(${d.heading_deg}deg)`; }
      }, 200);
      const loc = document.getElementById('twinLocate');
      if (loc) loc.addEventListener('click', () => { closeTwin(); map.flyTo([+d.latitude, +d.longitude], 6, { duration: 1.4 }); });
    }
    tickCountdowns();

    // Digital Twin extra: Draft-Aware Load Lab (uses the real port limits from the database)
    if (window.FIQTwinLab) {
      FIQTwinLab.mount(document.getElementById('twinLab'), d, PORTS, (load) => {
        const wrap = document.querySelector('.twin-hull-wrap');
        if (wrap) wrap.innerHTML = fiqShipSvg({ className: d.class_name, loa: d.loa_m, beam: d.beam_m, draft: d.draft_m, status: d.availability, loadPct: load });
      });
    }
  }
  document.getElementById('twinClose').addEventListener('click', closeTwin);
  document.getElementById('twinOverlay').addEventListener('click', (e) => { if (e.target.id === 'twinOverlay') closeTwin(); });

  // ---- load map data ----
  try {
    GPS = await FIQ.get('gps.php');

    // animated trade lanes (flowing dashes show cargo direction origin -> India)
    GPS.lanes.forEach(l => {
      const pts = curvePoints([+l.o_lat, +l.o_lon], [+l.p_lat, +l.p_lon], 28);
      L.polyline(pts, { color: '#43d9e8', weight: 1.6, opacity: 0.55, className: 'lane-flow' })
        .bindTooltip(`${l.load_point} → ${l.port_name} · ${l.commodity} · ${Number(l.distance_nm).toLocaleString()} nm`, { sticky: true })
        .addTo(lanesLayer);
    });

    PORTS = GPS.ports;
    const RING = { Low: '#7fe0d4', Moderate: '#ffb84d', High: '#ff6b6b', Severe: '#ff3b3b' };
    GPS.ports.forEach(p => {
      const congested = p.congestion_level === 'High' || p.congestion_level === 'Severe';
      L.marker([p.latitude, p.longitude], { icon: pulseIcon(congested ? 'port congested' : 'port') })
        .addTo(map)
        .bindPopup(`<b>${p.name}</b><br>${fiqT('k_congestion')}: ${p.congestion_level ? fiqEnum(p.congestion_level) : 'N/A'} (${p.congestion_index || '—'}x)<br><span class="mono">${T('Max Draft')} ${p.max_draft_m} m · ${T('Max LOA')} ${p.max_loa_m} m · ${T('Max Beam')} ${p.max_beam_m} m</span>`);
      // Congestion Rings: radius and colour scale with the live-style congestion index
      const idx = Math.min(4, Math.max(0, (+p.congestion_index || 1) - 0.5));
      const col = RING[p.congestion_level] || '#7fe0d4';
      L.circle([p.latitude, p.longitude], { radius: 28000 + idx * 24000, color: col, weight: 1.5, fillColor: col, fillOpacity: 0.14, className: 'cong-ring', interactive: false }).addTo(ringsLayer);
    });
    GPS.origins.forEach(o => {
      L.circleMarker([o.latitude, o.longitude], { radius: 5, color: '#7fe0d4', fillOpacity: 0.7 })
        .addTo(map).bindPopup(`<b>${o.load_point}</b><br>${o.country}`);
    });

    GPS.vessels.forEach(v => {
      gpsById[v.id] = v;
      const sc = statusClassOf(v.availability), underway = v.availability === 'On Voyage';
      if (underway) wakeLines[v.id] = drawWake(+v.latitude, +v.longitude, +v.heading_deg, +v.speed_knots);
      vesselMarkers[v.id] = L.marker([+v.latitude, +v.longitude], { icon: vesselIcon(sc, +v.heading_deg, underway) })
        .addTo(map)
        .bindTooltip(`${v.vessel_name} · ${fiqEnum(v.availability)}`, { direction: 'top' })
        .on('click', () => openDigitalTwin(v));   // map marker -> Digital Twin
    });
  } catch (e) {
    console.error(e);
    if (e.status === 401) window.location.href = '../login.php';
  }

  // trade-lane toggle
  const laneBtn = document.getElementById('toggleLanes');
  if (laneBtn) laneBtn.addEventListener('click', () => {
    const on = map.hasLayer(lanesLayer);
    if (on) map.removeLayer(lanesLayer); else lanesLayer.addTo(map);
    laneBtn.classList.toggle('active', !on);
  });

  // congestion rings toggle + reset view
  const ringBtn = document.getElementById('toggleRings');
  if (ringBtn) ringBtn.addEventListener('click', () => {
    const on = map.hasLayer(ringsLayer);
    if (on) map.removeLayer(ringsLayer); else ringsLayer.addTo(map);
    ringBtn.classList.toggle('active', !on);
  });
  const resetBtn = document.getElementById('resetView');
  if (resetBtn) resetBtn.addEventListener('click', () => map.flyTo([14, 80], 4, { duration: 1 }));

  // ---- Time Machine: scrub underway vessels +/-24h along heading x speed (dead-reckoning) ----
  const tmRange = document.getElementById('tmRange'), tmLabel = document.getElementById('tmLabel');
  const tmPlay = document.getElementById('tmPlay'), tmNow = document.getElementById('tmNow');
  let tmTimer = null;
  function projectAll(hours) {
    if (!GPS) return;
    GPS.vessels.forEach(v => {
      if (v.availability !== 'On Voyage' || !vesselMarkers[v.id]) return;
      const [lat, lon] = deadReckon(v, hours);
      vesselMarkers[v.id].setLatLng([lat, lon]);
      if (wakeLines[v.id]) wakeLines[v.id].setLatLngs(wakePts(lat, lon, +v.heading_deg, +v.speed_knots));
    });
    tmLabel.textContent = hours === 0 ? T('Now') : 'T' + (hours > 0 ? '+' : '−') + Math.abs(hours).toFixed(hours % 1 ? 1 : 0) + ' h';
  }
  function tmStop() { if (tmTimer) { clearInterval(tmTimer); tmTimer = null; } if (tmPlay) tmPlay.textContent = '▶'; }
  if (tmRange) {
    tmRange.addEventListener('input', () => { tmStop(); projectAll(+tmRange.value); });
    tmNow.addEventListener('click', () => { tmStop(); tmRange.value = 0; projectAll(0); });
    tmPlay.addEventListener('click', () => {
      if (tmTimer) { tmStop(); return; }
      tmPlay.textContent = '⏸';
      tmTimer = setInterval(() => {
        let v = +tmRange.value + 0.25; if (v > 24) v = -24;
        tmRange.value = v; projectAll(v);
      }, 90);
    });
  }

  // deep link from the command palette: fleet.php#v=<vessel id> opens that vessel's twin
  function openFromHash() {
    const m = location.hash.match(/^#v=(\d+)/); if (!m || !GPS) return;
    const g = gpsById[+m[1]]; if (!g) return;
    map.flyTo([+g.latitude, +g.longitude], 5, { duration: 1 }); openDigitalTwin(g);
  }
  window.addEventListener('hashchange', openFromHash);
  setTimeout(openFromHash, 400);

  // ---- roster (search / filter / export) ----
  function renderRoster() {
    const tbody = document.getElementById('vesselTableBody');
    tbody.innerHTML = lastVesselRows.length ? lastVesselRows.map((v, i) => `
      <tr class="vessel-row-clickable" data-idx="${i}">
        <td>🚢 ${v.vessel_name}</td><td>${v.class_name}</td><td class="mono">${v.imo_number}</td>
        <td>${Number(v.dwt).toLocaleString()} t</td><td>${v.flag}</td>
        <td><span class="status-badge status-${statusClassOf(v.availability)}">${fiqEnum(v.availability)}</span></td>
        <td class="mono">${v.availability === 'On Voyage' && v.eta ? `<span class="eta-countdown" data-eta="${v.eta}">${countdownText(v.eta)}</span>` : (v.eta ? new Date(v.eta).toLocaleDateString(window.fiqLocale ? fiqLocale() : undefined) : '—')}</td>
      </tr>`).join('') : `<tr><td colspan="7" class="empty">${fiqT('no_data')}</td></tr>`;
    tbody.querySelectorAll('.vessel-row-clickable').forEach(row => {
      row.addEventListener('click', () => {
        const v = lastVesselRows[parseInt(row.dataset.idx)], g = gpsById[v.id];
        if (g) map.flyTo([+g.latitude, +g.longitude], 5, { duration: 1.1 });
        openDigitalTwin(v);
      });
    });
  }
  async function loadVessels() {
    const search = document.getElementById('vesselSearch').value;
    const status = document.getElementById('statusFilter').value;
    try {
      const res = await FIQ.get('vessels.php', { search, status, per_page: 50 });
      lastVesselRows = res.data; renderRoster();
    } catch (e) { console.error(e); }
  }
  // language switch -> re-render roster + re-open the twin in the new language
  document.addEventListener('fiq-refresh-money', () => { renderRoster(); if (currentTwin && !document.getElementById('twinOverlay').classList.contains('hidden')) { const t = currentTwin; closeTwin(); openDigitalTwin(t); } });

  document.getElementById('exportVesselsCsv').addEventListener('click', () => {
    exportTableToCsv(['Vessel','Class','IMO','DWT','Flag','Status','ETA'],
      lastVesselRows.map(v => [v.vessel_name, v.class_name, v.imo_number, v.dwt, v.flag, v.availability, v.eta || '']), 'fleet_roster.csv');
  });
  document.getElementById('vesselSearch').addEventListener('input', debounce(loadVessels, 350));
  document.getElementById('statusFilter').addEventListener('change', loadVessels);
  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
  loadVessels();
})();
