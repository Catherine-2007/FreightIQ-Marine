// FreightIQ Marine :: Risk Center logic
let lastRiskData = null;
document.addEventListener('fiq-refresh-money', () => { if (lastRiskData) renderRisk(lastRiskData); });

(async function () {
  try {
    const data = await FIQ.get('risk.php');
    lastRiskData = data;
    renderRisk(data);
  } catch (e) { console.error(e); if (e.status === 401) window.location.href = '../login.php'; }
})();

function levelClass(lvl) { return 'sev-' + lvl.toLowerCase(); }
function renderList(items, labelKey) {
  if (!items.length) return '<p class="subtle">No active items.</p>';
  return items.map(i => `
    <div class="alert-list"><li class="${levelClass(i.risk_level)}">
      <span class="sev-badge ${levelClass(i.risk_level)}">${fiqEnum(i.risk_level)}</span>
      <span><b>${i[labelKey]}</b> — ${i.detail}</span>
      <span class="alert-type">Score ${i.risk_score}</span>
    </li></div>`).join('');
}

function renderRisk(data) {
    document.getElementById('riskKpi').innerHTML = `
      <div class="kpi-card wave-bg"><div class="kpi-icon">🧭</div><div class="kpi-value">${data.overall_score.toFixed(1)}</div><div class="kpi-label">${fiqT('x_overall_risk')} (0-100)</div></div>
      <div class="kpi-card wave-bg"><div class="kpi-icon">⏸️</div><div class="kpi-value">${data.idle_summary.open_scenarios}</div><div class="kpi-label">Open Idle Scenarios</div></div>
      <div class="kpi-card wave-bg"><div class="kpi-icon">💸</div><div class="kpi-value">${fiqMoneyWhole(data.idle_summary.total_idle_cost_usd)}</div><div class="kpi-label">Total Idle Cost Exposure</div></div>
      <div class="kpi-card wave-bg"><div class="kpi-icon">♻️</div><div class="kpi-value">${fiqMoneyWhole(data.idle_summary.recoverable_via_alternatives_usd)}</div><div class="kpi-label">Recoverable via Alternatives</div></div>
    `;

    document.getElementById('freightRisk').innerHTML = renderList(data.freight, 'route');
    document.getElementById('portRisk').innerHTML = renderList(data.port, 'port');
    document.getElementById('vesselRisk').innerHTML = renderList(data.vessel, 'metric');
    document.getElementById('routeRisk').innerHTML = renderList(data.route, 'route');

    const idleKpi = document.getElementById('idleKpi');
    idleKpi.innerHTML = `
      <div class="kpi-card wave-bg"><div class="kpi-value">${data.idle_summary.open_scenarios}</div><div class="kpi-label">Vessels Idle/At Risk</div></div>
      <div class="kpi-card wave-bg"><div class="kpi-value">${fiqMoneyWhole(data.idle_summary.total_idle_cost_usd)}</div><div class="kpi-label">Total Idle Cost</div></div>
      <div class="kpi-card wave-bg"><div class="kpi-value">${fiqMoneyWhole(data.idle_summary.recoverable_via_alternatives_usd)}</div><div class="kpi-label">Recoverable</div></div>
    `;

    document.getElementById('idleTableBody').innerHTML = data.idle_scenarios.length ? data.idle_scenarios.map(i => `
      <tr>
        <td>${i.vessel_name}</td><td>${i.class_name}</td><td>${i.cause}</td>
        <td>${i.estimated_idle_days}</td><td>${fiqMoneyWhole(i.estimated_idle_cost_usd)}</td>
        <td>${i.suggested_action}</td><td class="positive">${fiqMoneyWhole(i.alternative_revenue_usd)}</td>
      </tr>`).join('') : '<tr><td colspan="7" class="empty">No idle scenarios currently open.</td></tr>';
}
