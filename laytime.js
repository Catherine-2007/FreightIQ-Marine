// FreightIQ Marine :: Laytime & Demurrage planner
// Answers a daily bulk-procurement question: "for THIS cargo and vessel class, which port costs
// least once waiting time, discharge speed, demurrage/despatch and handling charges are counted?"
//
//   waiting     = max(0, current estimated turnaround - historical turnaround) + extra what-if days
//   handling    = cargo / port handling capacity (t/day)
//   time used   = waiting + handling
//   allowed     = cargo / contract discharge rate
//   over allowed -> demurrage = overrun days x demurrage rate
//   under allowed-> despatch  = saved days x demurrage rate x despatch %
//   port-side/t = (handling charges + demurrage - despatch) / cargo
//
// HONEST LIMITS: indicative only. Real charter parties have notice time, SHINC/SHEX terms,
// weather days and berth queues that this model does not know. Demurrage defaults are typical
// round numbers per class, editable, and not market quotes.
(async function () {
  const DEM_DEFAULT = { Handysize: 9000, Supramax: 12000, Panamax: 15000, Capesize: 24000 };
  const $ = (id) => document.getElementById(id);
  let ports = [], classes = [], rows = [];

  try {
    const [p, ref] = await Promise.all([FIQ.get('ports.php'), FIQ.get('reference_data.php')]);
    ports = p; classes = ref.vessel_classes;
  } catch (e) {
    if (e.status === 401) window.location.href = '../login.php';
    $('ltTitle').textContent = 'Access denied'; return;
  }
  $('ltPort').innerHTML = ports.map((p) => `<option value="${p.id}">${p.name}</option>`).join('');
  $('ltClass').innerHTML = classes.map((c) => `<option value="${c.id}">${c.class_name}</option>`).join('');
  const defaultClass = classes.find((c) => c.class_name === 'Panamax') || classes[0];
  $('ltClass').value = defaultClass.id;
  const syncDem = () => { const c = classes.find((x) => x.id == $('ltClass').value); $('ltDem').value = DEM_DEFAULT[c.class_name] || 12000; };
  syncDem();

  const num = (id, d) => { const v = parseFloat($(id).value); return isFinite(v) && v >= 0 ? v : d; };
  const money = (v, dec) => fiqMoney(v, dec);

  function evaluate(port, cls, a) {
    const handlingDays = a.qty / (+port.cargo_handling_capacity_tpd || 1);
    const delay = Math.max(0, (+port.estimated_turnaround_days || +port.historical_turnaround_days || 0) - (+port.historical_turnaround_days || 0));
    const waiting = delay + a.extra;
    const used = waiting + handlingDays;
    const allowed = a.qty / a.rate;
    const diff = used - allowed;
    const demurrage = diff > 0 ? diff * a.dem : 0;
    const despatch = diff < 0 ? -diff * a.dem * (a.desp / 100) : 0;
    const handlingCost = a.qty * (+port.cargo_handling_rate_usd_per_tonne || 0);
    const net = handlingCost + demurrage - despatch;
    const reasons = [];
    if (+cls.typical_draft_m > +port.max_draft_m) reasons.push('draft');
    if (+cls.typical_loa_m > +port.max_loa_m) reasons.push('LOA');
    if (+cls.typical_beam_m > +port.max_beam_m) reasons.push('beam');
    return { port, waiting, handlingDays, used, allowed, demurrage, despatch, handlingCost, net, perTonne: net / a.qty, ok: reasons.length === 0, reasons };
  }
  const inputs = () => ({ qty: num('ltQty', 60000) || 60000, rate: num('ltRate', 8000) || 8000, dem: num('ltDem', 12000), desp: Math.min(100, num('ltDesp', 50)), extra: num('ltExtra', 0) });
  const fit = (r) => r.ok ? '<span class="status-badge status-available">Compatible</span>' : '<span class="status-badge status-under-repair">Not compatible</span>';
  const d1 = (n) => n.toFixed(1);

  function render() {
    const a = inputs(), cls = classes.find((c) => c.id == $('ltClass').value);
    rows = ports.map((p) => evaluate(p, cls, a)).sort((x, y) => (y.ok - x.ok) || (x.perTonne - y.perTonne));
    const sel = rows.find((r) => r.port.id == $('ltPort').value) || rows[0];

    $('ltTitle').textContent = `${sel.port.name} · ${cls.class_name}`;
    $('ltFit').innerHTML = fit(sel);
    const scale = Math.max(sel.used, sel.allowed) * 1.08 || 1;
    const pct = (v) => Math.min(100, (v / scale) * 100).toFixed(1) + '%';
    $('ltBars').innerHTML = `
      <div class="lt-row"><span class="explain-label">Allowed laytime</span>
        <div class="lt-track"><i class="lt-allowed" style="width:${pct(sel.allowed)}"></i></div><b class="mono">${d1(sel.allowed)} d</b></div>
      <div class="lt-row"><span class="explain-label">Time used</span>
        <div class="lt-track"><i class="lt-wait" style="width:${pct(sel.waiting)}" title="Waiting"></i><i class="lt-handle" style="width:${pct(sel.handlingDays)}" title="Cargo handling"></i><u class="lt-mark" style="left:${pct(sel.allowed)}"></u></div><b class="mono">${d1(sel.used)} d</b></div>
      <div class="lt-legend"><span><i class="lt-wait"></i> Waiting ${d1(sel.waiting)} d</span><span><i class="lt-handle"></i> Cargo handling ${d1(sel.handlingDays)} d</span></div>`;
    const over = sel.demurrage > 0;
    $('ltKpis').innerHTML = `
      <div class="kpi-card"><div class="kpi-icon">⏱</div><div class="kpi-value">${d1(sel.used)} d</div><div class="kpi-label">Time used</div></div>
      <div class="kpi-card ${over ? 'kpi-alert' : ''}"><div class="kpi-icon">${over ? '⚠️' : '✅'}</div><div class="kpi-value">${money(over ? sel.demurrage : sel.despatch, 0)}</div><div class="kpi-label">${over ? 'Demurrage' : 'Despatch'}</div></div>
      <div class="kpi-card"><div class="kpi-icon">🏗</div><div class="kpi-value">${money(sel.handlingCost, 0)}</div><div class="kpi-label">Handling cost</div></div>
      <div class="kpi-card"><div class="kpi-icon">💲</div><div class="kpi-value">${money(sel.perTonne, 2)}</div><div class="kpi-label">Port-side cost / tonne</div></div>`;
    const best = rows.find((r) => r.ok);
    $('ltBest').textContent = !best ? 'No compatible port for this vessel class.'
      : (best.port.id === sel.port.id ? 'The selected port is already the cheapest compatible option.'
        : `Cheapest compatible port: ${best.port.name} (${money(best.perTonne, 2)} per tonne)`);

    $('ltRank').innerHTML = rows.map((r) => `
      <tr class="vessel-row-clickable ${r.port.id === sel.port.id ? 'lt-sel' : ''}" data-id="${r.port.id}">
        <td>${r.port.name}</td><td>${fit(r)}</td><td class="mono">${d1(r.waiting)} d</td><td class="mono">${d1(r.handlingDays)} d</td><td class="mono">${d1(r.used)} d</td>
        <td>${r.demurrage > 0 ? `<span class="lt-over">Demurrage</span> ${money(r.demurrage, 0)}` : `<span class="lt-under">Despatch</span> ${money(r.despatch, 0)}`}</td>
        <td>${money(r.handlingCost, 0)}</td><td><b>${money(r.perTonne, 2)}</b></td></tr>`).join('');
    $('ltRank').querySelectorAll('tr').forEach((tr) => tr.addEventListener('click', () => { $('ltPort').value = tr.dataset.id; render(); }));
  }

  ['ltPort', 'ltQty', 'ltRate', 'ltDem', 'ltDesp', 'ltExtra'].forEach((id) => $(id).addEventListener('input', render));
  $('ltClass').addEventListener('change', () => { syncDem(); render(); });
  document.addEventListener('fiq-refresh-money', render);
  $('ltCsv').addEventListener('click', () => exportTableToCsv(
    ['Port', 'Compatible', 'Waiting (d)', 'Handling (d)', 'Time used (d)', 'Demurrage USD', 'Despatch USD', 'Handling cost USD', 'Port-side cost per tonne USD'],
    rows.map((r) => [r.port.name, r.ok ? 'yes' : 'no', d1(r.waiting), d1(r.handlingDays), d1(r.used), r.demurrage.toFixed(0), r.despatch.toFixed(0), r.handlingCost.toFixed(0), r.perTonne.toFixed(2)]),
    'laytime_port_ranking.csv'));
  render();
})();
