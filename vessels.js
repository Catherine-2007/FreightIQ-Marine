// FreightIQ Marine :: Vessel optimizer logic
(async function () {
  const portSelect = document.getElementById('portSelect');
  const routeSelect = document.getElementById('routeSelect');

  try {
    const ref = await FIQ.get('reference_data.php');
    portSelect.innerHTML = ref.ports.map(p => `<option value="${p.id}">${p.name} (draft ≤${p.max_draft_m}m, LOA ≤${p.max_loa_m}m)</option>`).join('');
    routeSelect.innerHTML += ref.routes.map(r => `<option value="${r.id}" data-port="${r.dest_port}">${r.load_point} → ${r.dest_port} (${r.commodity})</option>`).join('');
  } catch (e) { console.error(e); if (e.status === 401) window.location.href = '../login.php'; }

  document.getElementById('optForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const loading = document.getElementById('loadingState');
    const resultArea = document.getElementById('optResult');
    resultArea.classList.add('hidden'); loading.classList.remove('hidden');

    const fd = new FormData(e.target);
    try {
      const data = await FIQ.get('vessels_optimize.php', {
        cargo_volume: fd.get('cargo_volume'), port_id: fd.get('port_id'), route_id: fd.get('route_id') || '',
      });
      loading.classList.add('hidden');
      if (data.error) { alert(data.error); return; }
      lastOptData = data;
      renderOptResult(data);
      resultArea.classList.remove('hidden');
    } catch (err) {
      loading.classList.add('hidden');
      alert(err.data?.error || 'Optimization failed.');
    }
  });

  let lastOptData = null;
  document.addEventListener('fiq-refresh-money', () => { if (lastOptData) renderOptResult(lastOptData); });

  function renderOptResult(data) {
      document.getElementById('portName').textContent = data.port.name;
      document.getElementById('portSnapshot').innerHTML = `
        <div><span class="explain-label">Max Draft</span>${data.port.max_draft_m} m</div>
        <div><span class="explain-label">Max LOA</span>${data.port.max_loa_m} m</div>
        <div><span class="explain-label">Max Beam</span>${data.port.max_beam_m} m</div>
        <div><span class="explain-label">Congestion</span>${data.congestion.congestion_level} (${data.congestion.congestion_index}x)</div>
        <div><span class="explain-label">Est. Turnaround</span>${data.congestion.estimated_turnaround_days} days</div>
      `;

      const compatClass = s => 'compat-' + s.toLowerCase().replace(/ /g,'-');
      // "Greenest option": lowest CO2 per tonne of cargo among port-compatible classes
      const compatible = data.candidates.filter(c => c.port_compatibility === 'Compatible');
      const greenest = compatible.length ? compatible.reduce((a, b) => (b.co2_kg_per_tonne_cargo < a.co2_kg_per_tonne_cargo ? b : a)) : null;
      document.getElementById('candidateList').innerHTML = data.candidates.map((c, idx) => `
        <div class="vessel-card ${idx===0 ? 'top-pick' : ''}">
          <div class="vessel-card-head">
            <div>${idx===0 ? '🏆 ' : ''}<b>${c.class_name}</b> ${greenest && c === greenest ? '<span class="eco-badge">🌿 Greenest</span>' : ''}</div>
            <span class="compat-badge ${compatClass(c.port_compatibility)}">${c.port_compatibility}</span>
          </div>
          <div class="mini-ship-preview">${fiqShipSvg({ className: c.class_name, loa: 220, beam: 32, draft: 14, status: c.available_vessels > 0 ? 'Available' : 'Idle', idW: 500, idH: 130 })}</div>
          <div class="vessel-metrics">
            <div><b>${c.voyages_needed}</b>Voyages needed</div>
            <div><b>${c.utilisation_pct}%</b>Utilisation</div>
            <div><b>${c.estimated_voyage_days}d</b>Est. voyage time</div>
            <div><b>${fiqMoney(c.estimated_freight_usd_per_tonne)}</b>Est. cost/tonne</div>
            <div><b>${c.available_vessels}</b>Available now</div>
            <div><b>${c.idle_time_estimate_days}d</b>Est. idle risk</div>
            <div><b>🌿 ${Number(c.estimated_co2_tonnes).toLocaleString()} t</b>${fiqT('u_co2_est')} (${c.co2_kg_per_tonne_cargo} kg/t)</div>
          </div>
          <span class="status-badge status-${c.risk_level.toLowerCase()==='severe'?'cancelled':c.risk_level.toLowerCase()==='high'?'cancelled':c.risk_level.toLowerCase()==='moderate'?'draft':'active'}">${fiqEnum(c.risk_level)} · ${fiqT('c_risk')}</span>
          <ul class="reason-list">${c.reasons.map(r=>`<li>${r}</li>`).join('')}</ul>
        </div>
      `).join('');
  }
})();
