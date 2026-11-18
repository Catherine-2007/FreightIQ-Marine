// FreightIQ Marine :: Forecast page logic
(async function () {
  const routeSelect = document.getElementById('routeSelect');
  const classSelect = document.getElementById('classSelect');
  let chart;

  try {
    const ref = await FIQ.get('reference_data.php');
    routeSelect.innerHTML = ref.routes.map(r => `<option value="${r.id}">${r.load_point}, ${r.country} → ${r.dest_port} (${r.commodity})</option>`).join('');
    classSelect.innerHTML = ref.vessel_classes.map(c => `<option value="${c.id}">${c.class_name}</option>`).join('');
  } catch (e) { console.error(e); if (e.status === 401) window.location.href = '../login.php'; }

  function fmtRange(lo, hi) { return `${fiqMoney(lo)} – ${fiqMoney(hi)}`; }

  let lastForecastData = null;
  document.addEventListener('fiq-refresh-money', () => { if (lastForecastData) renderForecast(lastForecastData); });

  document.getElementById('forecastForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const loading = document.getElementById('loadingState');
    const resultArea = document.getElementById('resultArea');
    resultArea.classList.add('hidden'); loading.classList.remove('hidden');

    try {
      const data = await FIQ.get('forecast.php', { route_id: routeSelect.value, vessel_class_id: classSelect.value });
      loading.classList.add('hidden');
      if (data.error) { alert(data.error); return; }
      lastForecastData = data;
      renderForecast(data);
      resultArea.classList.remove('hidden');
    } catch (err) {
      loading.classList.add('hidden');
      alert(err.data?.error || 'Forecast failed.');
      console.error(err);
    }
  });

  function renderForecast(data) {
      const f7 = data.forecast_7, f14 = data.forecast_14, f30 = data.forecast_30;
      document.getElementById('f7rate').textContent = fiqMoney(f7.predicted_rate);
      document.getElementById('f7range').textContent = fmtRange(f7.lower_bound, f7.upper_bound);
      document.getElementById('f7conf').textContent = `Confidence: ${f7.confidence_pct}% · ${f7.market_direction}`;
      document.getElementById('f14rate').textContent = fiqMoney(f14.predicted_rate);
      document.getElementById('f14range').textContent = fmtRange(f14.lower_bound, f14.upper_bound);
      document.getElementById('f14conf').textContent = `Confidence: ${f14.confidence_pct}% · ${f14.market_direction}`;
      document.getElementById('f30rate').textContent = fiqMoney(f30.predicted_rate);
      document.getElementById('f30range').textContent = fmtRange(f30.lower_bound, f30.upper_bound);
      document.getElementById('f30conf').textContent = `Confidence: ${f30.confidence_pct}% · ${f30.market_direction}`;
      document.getElementById('dataFreshness').textContent = '⚠ ' + data.data_freshness;

      if (data.market_entry) {
        document.getElementById('marketEntryLabel').innerHTML = `<b>${data.market_entry.label}</b> — composite score ${data.market_entry.score}/100`;
        document.getElementById('marketEntryReasons').innerHTML = data.market_entry.reasons.map(r => `<li>${r}</li>`).join('');
      }

      const labels = data.history.map(h => h.date);
      const values = data.history.map(h => h.rate);
      const d7 = new Date(); d7.setDate(d7.getDate()+7);
      const d14 = new Date(); d14.setDate(d14.getDate()+14);
      const d30 = new Date(); d30.setDate(d30.getDate()+30);
      const fLabels = [...labels, d7.toISOString().slice(0,10), d14.toISOString().slice(0,10), d30.toISOString().slice(0,10)];
      const histSeries = [...values, null, null, null];
      const forecastSeries = new Array(values.length).fill(null).concat([f7.predicted_rate, f14.predicted_rate, f30.predicted_rate]);

      const ctx = document.getElementById('forecastChart');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'line',
        data: { labels: fLabels, datasets: [
          { label: 'Historical Rate', data: histSeries, borderColor: '#2fb8c9', backgroundColor: 'rgba(47,184,201,0.12)', fill: true, tension: 0.35, pointRadius: 0 },
          { label: 'Forecast (7/14/30d)', data: forecastSeries, borderColor: '#ffb84d', backgroundColor: '#ffb84d', pointRadius: 6, showLine: false },
        ]},
        options: { plugins: { legend: { labels: { color: '#e9f7fa' } } }, scales: { x: { ticks: { color: '#93b8c5', maxTicksLimit: 10 } }, y: { ticks: { color: '#93b8c5' } } } }
      });
  }

  document.getElementById('cfForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const data = await FIQ.post('counterfactual.php', {
        route_id: routeSelect.value, vessel_class_id: classSelect.value, horizon: fd.get('horizon'),
        demand_change_pct: fd.get('demand_change_pct'), congestion_change_pct: fd.get('congestion_change_pct'), bunker_change_pct: fd.get('bunker_change_pct'),
      });
      if (data.error) { alert(data.error); return; }
      lastCfData = data;
      renderCf(data);
    } catch (err) { alert(err.data?.error || 'Simulation failed.'); }
  });

  let lastCfData = null;
  document.addEventListener('fiq-refresh-money', () => { if (lastCfData) renderCf(lastCfData); });

  function renderCf(data) {
      document.getElementById('cfBaseline').textContent = fiqMoney(data.baseline.predicted_rate);
      document.getElementById('cfAdjusted').textContent = fiqMoney(data.counterfactual_rate);
      const sign = data.delta_abs >= 0 ? '+' : '';
      document.getElementById('cfDelta').textContent = `${sign}${fiqMoney(Math.abs(data.delta_abs))} (${sign}${data.delta_pct.toFixed(1)}%) vs baseline`;
      document.getElementById('cfAssumptions').innerHTML = data.assumptions.length ? data.assumptions.map(a=>`<li>${a}</li>`).join('') : '<li>No shocks applied — showing baseline.</li>';
      document.getElementById('cfResult').classList.remove('hidden');
  }
})();
