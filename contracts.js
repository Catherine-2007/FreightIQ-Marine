// FreightIQ Marine :: Contracts page logic
(async function () {
  let ref;
  try {
    ref = await FIQ.get('reference_data.php');
    const routeOptions = ref.routes.map(r => `<option value="${r.id}">${r.load_point} → ${r.dest_port} (${r.commodity})</option>`).join('');
    const classOptions = ref.vessel_classes.map(c => `<option value="${c.id}">${c.class_name}</option>`).join('');
    ['routeSelect','routeSelect2'].forEach(id => document.getElementById(id).innerHTML = routeOptions);
    ['classSelect','classSelect2'].forEach(id => document.getElementById(id).innerHTML = classOptions);
  } catch (e) { console.error(e); if (e.status === 401) window.location.href = '../login.php'; }

  document.getElementById('compareForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const data = await FIQ.get('contracts.php', {
        action: 'compare', route_id: fd.get('route_id'), vessel_class_id: fd.get('vessel_class_id'), volume_per_voyage: fd.get('volume_per_voyage'),
      });
      if (data.error) { alert(data.error); return; }
      lastCompareData = data;
      renderCompare(data);
    } catch (err) { alert(err.data?.error || 'Comparison failed.'); }
  });

  let lastCompareData = null;
  document.addEventListener('fiq-refresh-money', () => { if (lastCompareData) renderCompare(lastCompareData); loadContracts(); });

  function renderCompare(data) {
      document.getElementById('compareCards').innerHTML = data.options.map(o => `
        <div class="panel">
          <h3>${o.contract_type}</h3>
          <div class="big-number">${fiqMoney(o.rate_usd_per_tonne)}</div>
          <p class="subtle">Range: ${fiqMoney(o.rate_range[0])} – ${fiqMoney(o.rate_range[1])}</p>
          <p class="subtle" style="margin-top:8px;">Voyages: ${o.num_voyages}</p>
          <p class="subtle">Total exposure: ${fiqMoneyWhole(o.total_exposure_usd)}</p>
          <p class="subtle" style="margin-top:8px;">${o.volatility_exposure}</p>
          <p class="subtle">Flexibility: ${o.flexibility}</p>
          <p class="subtle" style="margin-top:8px; font-style:italic;">${o.estimated_note}</p>
        </div>`).join('');
      document.getElementById('savingsSummary').innerHTML =
        `Estimated savings — Short-Term vs Spot: <b>${fiqMoneyWhole(data.estimated_savings_short_vs_spot_usd)}</b> ·
         Medium-Term vs Spot: <b>${fiqMoneyWhole(data.estimated_savings_medium_vs_spot_usd)}</b>`;
      document.getElementById('disclaimer').textContent = '⚠ ' + data.disclaimer;
      document.getElementById('compareResult').classList.remove('hidden');
  }

  const contractForm = document.getElementById('contractForm');
  if (contractForm) {
    contractForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = Object.fromEntries(fd.entries());
      try {
        const data = await FIQ.post('contracts.php', payload);
        if (data.error) { alert(data.error); return; }
        alert(`Contract #${data.id} created. Estimated savings vs current spot: ${fiqMoneyWhole(data.estimated_savings_usd)}` + (data.estimated_co2_tonnes ? `\n🌿 ${fiqT('u_co2_est')}: ${Number(data.estimated_co2_tonnes).toLocaleString()} t` : '') + (data.integrity_hash ? `\n${fiqT('u_hash')}: ${data.integrity_hash.slice(0, 16)}…` : ''));
        contractForm.reset();
        loadContracts();
      } catch (err) { alert(err.data?.error || 'Could not create contract.'); }
    });
  }

  async function loadContracts() {
    try {
      const rows = await FIQ.get('contracts.php');
      lastContractRows = rows;
      document.getElementById('contractTableBody').innerHTML = rows.length ? rows.map(c => `
        <tr>
          <td>${c.load_point} → ${c.dest_port}</td><td>${c.class_name}</td><td>${c.contract_type}</td>
          <td>${c.num_voyages}</td><td>${Number(c.cargo_volume_tonnes_per_voyage).toLocaleString()} t</td>
          <td>${fiqMoney(c.target_rate_usd_per_tonne)}</td>
          <td><span class="status-badge status-${c.status.toLowerCase()}">${fiqEnum(c.status)}</span></td>
          <td class="positive">${fiqMoneyWhole(c.estimated_savings_usd)}</td>
          <td>${c.estimated_co2_tonnes ? `<span class="eco-badge">🌿 ${Number(c.estimated_co2_tonnes).toLocaleString()} t</span>` : '—'}</td>
          <td>${c.integrity_hash
              ? `<span class="hash-chip" id="hash-${c.id}" title="${c.integrity_hash}">#${c.integrity_hash.slice(0, 8)}…</span> <button class="btn-mini" onclick="verifyContract(${c.id})">${fiqT('b_verify')}</button>`
              : '—'}</td>
        </tr>`).join('') : `<tr><td colspan="10" class="empty">${fiqT('no_data')}</td></tr>`;
    } catch (e) { console.error(e); }
  }
  let lastContractRows = [];
  document.getElementById('exportContractsCsv').addEventListener('click', () => {
    exportTableToCsv(
      ['Route','Vessel','Type','Voyages','Volume/Voyage','Rate','Status','Est Savings','Est CO2 (t)','Integrity Hash'],
      lastContractRows.map(c => [`${c.load_point} -> ${c.dest_port}`, c.class_name, c.contract_type, c.num_voyages, c.cargo_volume_tonnes_per_voyage, c.target_rate_usd_per_tonne, c.status, c.estimated_savings_usd, c.estimated_co2_tonnes || '', c.integrity_hash || '']),
      'contract_ledger.csv'
    );
  });
  loadContracts();
})();

/** Recompute the contract's SHA-256 fingerprint server-side and compare with the stored one. */
async function verifyContract(id) {
  const chip = document.getElementById('hash-' + id);
  try {
    const r = await FIQ.get('contracts.php', { action: 'verify', id });
    if (!r.verifiable) { alert(r.note || 'Not verifiable.'); return; }
    if (chip) {
      chip.classList.remove('ok', 'bad');
      chip.classList.add(r.match ? 'ok' : 'bad');
      chip.textContent = (r.match ? '✓ ' : '✗ ') + (r.match ? fiqT('u_hash_ok') : fiqT('u_hash_bad'));
      chip.title = 'stored: ' + r.stored_hash + '\nrecomputed: ' + r.recomputed_hash;
    }
  } catch (e) { alert(e.data?.error || 'Verification failed.'); }
}
