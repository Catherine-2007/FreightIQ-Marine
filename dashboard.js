// FreightIQ Marine :: Dashboard logic
let lastDashboardData = null;
document.addEventListener('fiq-refresh-money', () => { if (lastDashboardData) renderDashboard(lastDashboardData); });

(async function () {
  try {
    const data = await FIQ.get('dashboard.php');
    lastDashboardData = data;
    renderDashboard(data);
  } catch (err) {
    console.error(err);
    if (err.status === 401) window.location.href = 'login.php';
  }
})();

function renderDashboard(data) {
    const k = data.kpis;
    const kpiGrid = document.getElementById('kpiGrid');
    const cur = fiqCurrentCurrency();
    const freightConverted = k.avg_freight_usd_per_tonne * cur.rate;
    const freightDecimals = cur.code === 'JPY' ? 0 : 2;
    kpiGrid.innerHTML = `
      <div class="kpi-card wave-bg"><div class="kpi-icon">💰</div><div class="kpi-value" data-countup="${freightConverted}" data-prefix="${cur.symbol}" data-decimals="${freightDecimals}">--</div><div class="kpi-label">${fiqT('k_avg_freight')}</div></div>
      <div class="kpi-card wave-bg"><div class="kpi-icon">🚢</div><div class="kpi-value" data-countup="${k.active_vessels}">--</div><div class="kpi-label">${fiqT('k_active_v')}</div></div>
      <div class="kpi-card wave-bg"><div class="kpi-icon">✅</div><div class="kpi-value" data-countup="${k.available_vessels}">--</div><div class="kpi-label">${fiqT('k_avail_v')}</div></div>
      <div class="kpi-card wave-bg ${k.idle_vessels > 3 ? 'kpi-alert' : ''}"><div class="kpi-icon">⏸️</div><div class="kpi-value" data-countup="${k.idle_vessels}">--</div><div class="kpi-label">${fiqT('k_idle_v')}</div></div>
      <div class="kpi-card wave-bg"><div class="kpi-icon">⚓</div><div class="kpi-value" data-countup="${k.avg_port_congestion_index}" data-decimals="2" data-suffix="x">--</div><div class="kpi-label">${fiqT('k_congestion')}</div></div>
      <div class="kpi-card wave-bg ${k.active_alerts > 3 ? 'kpi-alert' : ''}"><div class="kpi-icon">⚠️</div><div class="kpi-value" data-countup="${k.active_alerts}">--</div><div class="kpi-label">${fiqT('k_alerts')}</div></div>
      <div class="kpi-card wave-bg"><div class="kpi-icon">📄</div><div class="kpi-value" data-countup="${k.contract_opportunities}">--</div><div class="kpi-label">${fiqT('k_opps')}</div></div>
      <div class="kpi-card wave-bg kpi-green"><div class="kpi-icon">🌿</div><div class="kpi-value" data-countup="${k.fleet_daily_co2_tonnes}" data-decimals="1" data-suffix=" t">--</div><div class="kpi-label">${fiqT('u_co2_day')}</div></div>
    `;
    // re-run countup animation for dynamically injected nodes
    kpiGrid.querySelectorAll('[data-countup]').forEach(el => {
      const target = parseFloat(el.dataset.countup);
      const prefix = el.dataset.prefix || ''; const suffix = el.dataset.suffix || '';
      const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
      if (document.documentElement.dataset.reducedMotion === 'true') { el.textContent = prefix+target.toLocaleString(undefined,{minimumFractionDigits:decimals,maximumFractionDigits:decimals})+suffix; return; }
      let cur2 = 0; const steps = 24; const inc = target/steps; let i=0;
      const iv = setInterval(() => { i++; cur2 += inc; el.textContent = prefix+Math.min(cur2,target).toLocaleString(undefined,{minimumFractionDigits:decimals,maximumFractionDigits:decimals})+suffix; if (i>=steps) clearInterval(iv); }, 20);
    });

    // Vessel availability chart (stacked bar by class)
    const classes = [...new Set(data.vessel_availability.map(r => r.class_name))];
    const statuses = ['Available','On Voyage','Idle','Under Repair'];
    const colors = { 'Available':'#2fb8c9', 'On Voyage':'#7fe0d4', 'Idle':'#ffb84d', 'Under Repair':'#ff6b6b' };
    const datasets = statuses.map(s => ({
      label: s, backgroundColor: colors[s],
      data: classes.map(c => { const row = data.vessel_availability.find(r => r.class_name===c && r.availability===s); return row ? row.n : 0; })
    }));
    const existingChart1 = Chart.getChart('vesselAvailChart'); if (existingChart1) existingChart1.destroy();
    new Chart(document.getElementById('vesselAvailChart'), {
      type: 'bar',
      data: { labels: classes, datasets },
      options: { responsive:true, plugins:{legend:{labels:{color:'#e9f7fa'}}}, scales:{ x:{stacked:true, ticks:{color:'#93b8c5'}}, y:{stacked:true, ticks:{color:'#93b8c5'}} } }
    });

    // Congestion chart
    const existingChart2 = Chart.getChart('congestionChart'); if (existingChart2) existingChart2.destroy();
    new Chart(document.getElementById('congestionChart'), {
      type: 'bar',
      data: { labels: data.port_congestion.map(p=>p.name), datasets: [{ label:'Congestion Index', data: data.port_congestion.map(p=>p.congestion_index), backgroundColor: data.port_congestion.map(p=> p.congestion_level==='High' ? '#ff6b6b' : p.congestion_level==='Moderate' ? '#ffb84d' : '#2fb8c9') }] },
      options: { plugins:{legend:{display:false}}, scales:{ y:{ beginAtZero:true, ticks:{color:'#93b8c5'} }, x:{ ticks:{color:'#93b8c5'} } } }
    });

    const alertsList = document.getElementById('recentAlerts');
    alertsList.innerHTML = data.recent_alerts.length ? data.recent_alerts.map(a => `
      <li class="sev-${a.severity.toLowerCase()}"><span class="sev-badge sev-${a.severity.toLowerCase()}">${fiqEnum(a.severity)}</span><span>${a.message}</span><span class="alert-type">${a.alert_type}</span></li>
    `).join('') : '<li class="empty">No open alerts. Calm seas ⚓</li>';
}
