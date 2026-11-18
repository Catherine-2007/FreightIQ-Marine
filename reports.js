// FreightIQ Marine :: Reports Center logic
let REF = null;
let CURRENT_CSV = { headers: [], rows: [], filename: 'report.csv' };

async function loadRef() {
  try { REF = await FIQ.get('reference_data.php'); } catch (e) { console.error(e); if (e.status===401) window.location.href='../login.php'; }
}

function fieldsFor(type) {
  if (!REF) return '';
  const routeOpts = REF.routes.map(r => `<option value="${r.id}">${r.load_point} → ${r.dest_port} (${r.commodity})</option>`).join('');
  const classOpts = REF.vessel_classes.map(c => `<option value="${c.id}">${c.class_name}</option>`).join('');
  const portOpts = REF.ports.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  switch (type) {
    case 'forecast':
    case 'contract':
      return `<label>Route <select name="route_id">${routeOpts}</select></label>
              <label>Vessel Class <select name="vessel_class_id">${classOpts}</select></label>`;
    case 'vessel':
      return `<label>Destination Port <select name="port_id">${portOpts}</select></label>
              <label>Cargo Volume (t) <input type="number" name="cargo_volume" value="60000" min="1000"></label>`;
    case 'port':
      return `<label>Port <select name="port_id">${portOpts}</select></label>`;
    case 'risk':
      return '<p class="subtle">Fleet-wide risk snapshot — no additional parameters needed.</p>';
    case 'cargo':
      return '<p class="subtle">Lists your submitted cargo requests.</p>';
    default: return '';
  }
}

document.getElementById('reportType').addEventListener('change', (e) => {
  document.getElementById('dynamicFields').innerHTML = fieldsFor(e.target.value);
});

function reportHeader(title) {
  const now = new Date().toLocaleString(window.fiqLocale ? fiqLocale() : undefined);
  return `<h2>${title}</h2><div class="report-meta">Generated ${now} · FreightIQ Marine · <b>⚠ Contains simulated demo data — not a real market/operational record</b></div>`;
}

document.getElementById('reportForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  LAST_REPORT_SUBMIT = true;
  const loading = document.getElementById('loadingState');
  const out = document.getElementById('reportOutput');
  out.classList.add('hidden'); loading.classList.remove('hidden');

  const fd = new FormData(e.target);
  const type = fd.get('report_type');
  const sheet = document.getElementById('reportSheet');

  try {
    if (type === 'forecast') {
      const data = await FIQ.get('forecast.php', { route_id: fd.get('route_id'), vessel_class_id: fd.get('vessel_class_id') });
      if (data.error) throw { data };
      sheet.innerHTML = reportHeader('Freight Forecast Report') + `
        <table class="report-table"><thead><tr><th>Horizon</th><th>Predicted Rate</th><th>Range</th><th>Confidence</th><th>Direction</th></tr></thead>
        <tbody>
          <tr><td>7 days</td><td>${fiqMoney(data.forecast_7.predicted_rate)}</td><td>${fiqMoney(data.forecast_7.lower_bound)}–${fiqMoney(data.forecast_7.upper_bound)}</td><td>${data.forecast_7.confidence_pct}%</td><td>${data.forecast_7.market_direction}</td></tr>
          <tr><td>14 days</td><td>${fiqMoney(data.forecast_14.predicted_rate)}</td><td>${fiqMoney(data.forecast_14.lower_bound)}–${fiqMoney(data.forecast_14.upper_bound)}</td><td>${data.forecast_14.confidence_pct}%</td><td>${data.forecast_14.market_direction}</td></tr>
          <tr><td>30 days</td><td>${fiqMoney(data.forecast_30.predicted_rate)}</td><td>${fiqMoney(data.forecast_30.lower_bound)}–${fiqMoney(data.forecast_30.upper_bound)}</td><td>${data.forecast_30.confidence_pct}%</td><td>${data.forecast_30.market_direction}</td></tr>
        </tbody></table>
        ${data.market_entry ? `<p><b>Market-Entry Recommendation:</b> ${data.market_entry.label} (score ${data.market_entry.score}/100)</p><ul>${data.market_entry.reasons.map(r=>`<li>${r}</li>`).join('')}</ul>` : ''}
        <div class="report-footer">Model: ${data.model_used} · ${data.data_freshness}</div>`;
      CURRENT_CSV = { headers: ['Horizon','Predicted Rate','Lower','Upper','Confidence %','Direction'],
        rows: [['7d',data.forecast_7.predicted_rate,data.forecast_7.lower_bound,data.forecast_7.upper_bound,data.forecast_7.confidence_pct,data.forecast_7.market_direction],
               ['14d',data.forecast_14.predicted_rate,data.forecast_14.lower_bound,data.forecast_14.upper_bound,data.forecast_14.confidence_pct,data.forecast_14.market_direction],
               ['30d',data.forecast_30.predicted_rate,data.forecast_30.lower_bound,data.forecast_30.upper_bound,data.forecast_30.confidence_pct,data.forecast_30.market_direction]],
        filename: 'freight_forecast_report.csv' };
    }

    else if (type === 'vessel') {
      const data = await FIQ.get('vessels_optimize.php', { cargo_volume: fd.get('cargo_volume'), port_id: fd.get('port_id') });
      if (data.error) throw { data };
      sheet.innerHTML = reportHeader('Vessel Recommendation Report') + `
        <p><b>Destination:</b> ${data.port.name} · <b>Congestion:</b> ${data.congestion.congestion_level}</p>
        <table class="report-table"><thead><tr><th>Vessel Class</th><th>Port Fit</th><th>Voyages</th><th>Utilisation</th><th>Est. Cost/t</th><th>Risk</th><th>Score</th></tr></thead>
        <tbody>${data.candidates.map(c => `<tr><td>${c.class_name}${c===data.recommended?' 🏆':''}</td><td>${c.port_compatibility}</td><td>${c.voyages_needed}</td><td>${c.utilisation_pct}%</td><td>${fiqMoney(c.estimated_freight_usd_per_tonne)}</td><td>${c.risk_level}</td><td>${c.score}</td></tr>`).join('')}</tbody></table>
        <div class="report-footer">Recommendation reasoning available in-app under Vessel Optimizer.</div>`;
      CURRENT_CSV = { headers: ['Class','Port Fit','Voyages','Utilisation %','Est Cost/t','Risk','Score'],
        rows: data.candidates.map(c => [c.class_name, c.port_compatibility, c.voyages_needed, c.utilisation_pct, c.estimated_freight_usd_per_tonne, c.risk_level, c.score]),
        filename: 'vessel_recommendation_report.csv' };
    }

    else if (type === 'port') {
      const ports = await FIQ.get('ports.php');
      const p = ports.find(x => x.id == fd.get('port_id'));
      sheet.innerHTML = reportHeader('Port Compatibility Report — ' + p.name) + `
        <table class="report-table"><tbody>
          <tr><th>Max Draft</th><td>${p.max_draft_m} m</td></tr>
          <tr><th>Max LOA</th><td>${p.max_loa_m} m</td></tr>
          <tr><th>Max Beam</th><td>${p.max_beam_m} m</td></tr>
          <tr><th>Handling Capacity</th><td>${Number(p.cargo_handling_capacity_tpd).toLocaleString()} t/day</td></tr>
          <tr><th>Congestion</th><td>${p.congestion_level || 'N/A'} (${p.congestion_index || '—'}x)</td></tr>
          <tr><th>Berthing Limitations</th><td>${p.berthing_limitations}</td></tr>
        </tbody></table>
        <div class="report-footer">Data source: ${p.data_source}</div>`;
      CURRENT_CSV = { headers: ['Field','Value'], rows: [['Max Draft',p.max_draft_m],['Max LOA',p.max_loa_m],['Max Beam',p.max_beam_m],['Handling Capacity',p.cargo_handling_capacity_tpd],['Congestion Level',p.congestion_level],['Congestion Index',p.congestion_index]], filename: 'port_compatibility_report.csv' };
    }

    else if (type === 'risk') {
      const data = await FIQ.get('risk.php');
      const allRows = [...data.freight.map(r=>({cat:'Freight',...r})), ...data.port.map(r=>({cat:'Port',...r,route:r.port})), ...data.vessel.map(r=>({cat:'Vessel',...r,route:r.metric})), ...data.route.map(r=>({cat:'Route',...r}))];
      sheet.innerHTML = reportHeader('Risk Analysis Report') + `
        <p><b>Overall Risk Score:</b> ${data.overall_score}/100</p>
        <table class="report-table"><thead><tr><th>Category</th><th>Item</th><th>Score</th><th>Level</th><th>Detail</th></tr></thead>
        <tbody>${allRows.map(r => `<tr><td>${r.cat}</td><td>${r.route}</td><td>${r.risk_score}</td><td>${r.risk_level}</td><td>${r.detail}</td></tr>`).join('')}</tbody></table>
        <div class="report-footer">Idle scenarios: ${data.idle_summary.open_scenarios} · Total idle cost exposure: ${fiqMoneyWhole(data.idle_summary.total_idle_cost_usd)}</div>`;
      CURRENT_CSV = { headers: ['Category','Item','Score','Level','Detail'], rows: allRows.map(r=>[r.cat,r.route,r.risk_score,r.risk_level,r.detail]), filename: 'risk_analysis_report.csv' };
    }

    else if (type === 'contract') {
      const data = await FIQ.get('contracts.php', { action: 'compare', route_id: fd.get('route_id'), vessel_class_id: fd.get('vessel_class_id'), volume_per_voyage: 50000 });
      if (data.error) throw { data };
      sheet.innerHTML = reportHeader('Contract Comparison Report') + `
        <table class="report-table"><thead><tr><th>Type</th><th>Rate</th><th>Range</th><th>Voyages</th><th>Total Exposure</th><th>Flexibility</th></tr></thead>
        <tbody>${data.options.map(o => `<tr><td>${o.contract_type}</td><td>${fiqMoney(o.rate_usd_per_tonne)}</td><td>${fiqMoney(o.rate_range[0])}–${fiqMoney(o.rate_range[1])}</td><td>${o.num_voyages}</td><td>${fiqMoneyWhole(o.total_exposure_usd)}</td><td>${o.flexibility}</td></tr>`).join('')}</tbody></table>
        <p><b>Estimated savings</b> — Short-Term vs Spot: ${fiqMoneyWhole(data.estimated_savings_short_vs_spot_usd)} · Medium-Term vs Spot: ${fiqMoneyWhole(data.estimated_savings_medium_vs_spot_usd)}</p>
        <div class="report-footer">${data.disclaimer}</div>`;
      CURRENT_CSV = { headers: ['Type','Rate','Lower','Upper','Voyages','Total Exposure'], rows: data.options.map(o=>[o.contract_type,o.rate_usd_per_tonne,o.rate_range[0],o.rate_range[1],o.num_voyages,o.total_exposure_usd]), filename: 'contract_comparison_report.csv' };
    }

    else if (type === 'cargo') {
      const rows = await FIQ.get('cargo.php');
      sheet.innerHTML = reportHeader('Shipper Cargo Requirement Report') + `
        <table class="report-table"><thead><tr><th>Commodity</th><th>Route</th><th>Qty</th><th>Duration</th><th>Recommended Vessel</th><th>Est. Freight</th><th>Status</th></tr></thead>
        <tbody>${rows.map(r => `<tr><td>${r.commodity}</td><td>${r.load_point} → ${r.dest_port}</td><td>${Number(r.quantity_tonnes).toLocaleString()} t</td><td>${r.contract_duration}</td><td>${r.class_name||'—'}</td><td>${r.estimated_freight_usd_per_tonne?fiqMoney(r.estimated_freight_usd_per_tonne):'—'}</td><td>${r.status}</td></tr>`).join('')}</tbody></table>`;
      CURRENT_CSV = { headers: ['Commodity','Route','Qty','Duration','Vessel','Est Freight','Status'], rows: rows.map(r=>[r.commodity, r.load_point+' -> '+r.dest_port, r.quantity_tonnes, r.contract_duration, r.class_name, r.estimated_freight_usd_per_tonne, r.status]), filename: 'cargo_requirement_report.csv' };
    }

    loading.classList.add('hidden');
    out.classList.remove('hidden');
  } catch (err) {
    loading.classList.add('hidden');
    alert((err.data && err.data.error) || 'Could not generate report.');
  }
});

document.getElementById('downloadCsvBtn').addEventListener('click', () => {
  exportTableToCsv(CURRENT_CSV.headers, CURRENT_CSV.rows, CURRENT_CSV.filename);
});

let LAST_REPORT_SUBMIT = null;
document.addEventListener('fiq-refresh-money', () => {
  // Re-run the last report generation so money values reflect the new currency.
  if (LAST_REPORT_SUBMIT) document.getElementById('reportForm').dispatchEvent(new Event('submit', { cancelable: true }));
});

(async function init() {
  await loadRef();
  document.getElementById('dynamicFields').innerHTML = fieldsFor('forecast');
})();
