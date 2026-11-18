// FreightIQ Marine :: Shipper workspace logic
(async function () {
  const commoditySelect = document.getElementById('commoditySelect');
  const originSelect = document.getElementById('originSelect');
  const destSelect = document.getElementById('destSelect');

  try {
    const ref = await FIQ.get('reference_data.php');
    if (commoditySelect) {
      commoditySelect.innerHTML = ref.commodities.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      originSelect.innerHTML = ref.origins.map(o => `<option value="${o.id}">${o.load_point}, ${o.country}</option>`).join('');
      destSelect.innerHTML = ref.ports.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
  } catch (e) { console.error(e); if (e.status === 401) window.location.href = '../login.php'; }

  const cargoForm = document.getElementById('cargoForm');
  if (cargoForm) {
    cargoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const loading = document.getElementById('loadingState');
      const recResult = document.getElementById('recResult');
      recResult.classList.add('hidden'); loading.classList.remove('hidden');

      const fd = new FormData(e.target);
      const payload = Object.fromEntries(fd.entries());
      try {
        const data = await FIQ.post('cargo.php', payload);
        loading.classList.add('hidden');
        if (data.error) { alert(data.error); return; }

        const rec = data.recommendation;
        const top = rec.recommended;
        document.getElementById('recContent').innerHTML = top ? `
          <div class="vessel-card top-pick">
            <div class="vessel-card-head"><b>🏆 ${top.class_name}</b><span class="compat-badge compat-${top.port_compatibility.toLowerCase().replace(/ /g,'-')}">${top.port_compatibility}</span></div>
            <div class="vessel-metrics">
              <div><b>${top.voyages_needed}</b>Voyages needed</div>
              <div><b>${top.utilisation_pct}%</b>Utilisation</div>
              <div><b>${fiqMoney(top.estimated_freight_usd_per_tonne)}</b>Est. cost/tonne</div>
              <div><b>${top.available_vessels}</b>${fiqT('st_available')}</div>
              <div><b>🌿 ${Number(top.estimated_co2_tonnes).toLocaleString()} t</b>${fiqT('u_co2_est')}</div>
            </div>
            <ul class="reason-list">${top.reasons.map(r=>`<li>${r}</li>`).join('')}</ul>
          </div>
          <p class="subtle">Cargo request #${data.id} submitted — status: Submitted.</p>
        ` : '<p class="subtle">No suitable vessel found for this configuration.</p>';
        recResult.classList.remove('hidden');
        cargoForm.reset();
        loadMyCargo();
      } catch (err) {
        loading.classList.add('hidden');
        alert(err.data?.error || 'Could not submit cargo request.');
      }
    });
  }

  async function loadMyCargo() {
    try {
      const rows = await FIQ.get('cargo.php');
      lastCargoRows = rows;
      renderCargo(rows);
    } catch (e) { console.error(e); }
  }
  let lastCargoRows = [];
  document.addEventListener('fiq-refresh-money', () => renderCargo(lastCargoRows));
  function renderCargo(rows) {
      const tbody = document.getElementById('cargoTableBody');
      tbody.innerHTML = rows.length ? rows.map(r => `
        <tr>
          <td>${r.commodity}</td><td>${r.load_point} → ${r.dest_port}</td><td>${Number(r.quantity_tonnes).toLocaleString()} t</td>
          <td>${r.contract_duration}</td><td>${r.class_name || '—'}</td>
          <td>${r.estimated_freight_usd_per_tonne ? fiqMoney(r.estimated_freight_usd_per_tonne) : '—'}</td>
          <td><span class="sev-badge sev-${r.risk_level.toLowerCase()}">${fiqEnum(r.risk_level)}</span></td>
          <td><span class="status-badge status-${r.status.toLowerCase().replace(/ /g,'-')}">${r.status}</span></td>
        </tr>`).join('') : '<tr><td colspan="8" class="empty">No cargo requests yet.</td></tr>';
  }
  loadMyCargo();
})();
