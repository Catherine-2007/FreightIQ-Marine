<?php require_once __DIR__ . '/../../backend/middleware/security.php'; require_permission('alerts.view', false); ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Alerts | FreightIQ Marine</title>
<link rel="stylesheet" href="../assets/css/style.css">
<link rel="stylesheet" href="../assets/css/ocean.css">
<link rel="stylesheet" href="../assets/css/fx.css">
<script src="../assets/js/theme.js"></script>
</head>
<body data-reduced-motion="false">
<canvas id="ocean-canvas"></canvas>
<div class="aurora-sweep"></div>
<div class="wave-layer wave-back fixed-wave"></div>
<div class="wave-layer wave-accent fixed-wave"></div>
<?php include __DIR__ . '/../includes/nav.php'; ?>

  <header class="topbar">
    <div><h2>🔔 <span data-i18n="t_alerts">Alerts</span></h2>
    <p class="subtle" data-i18n="s_alerts">Volatility, congestion, delays and disruptions</p></div>
  </header>

  <section class="panel">
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th data-i18n="c_severity">Severity</th><th data-i18n="c_type">Type</th><th>Context</th><th data-i18n="c_message">Message</th><th>Raised</th><th data-i18n="c_status">Status</th><th></th></tr></thead>
        <tbody id="alertsTableBody"><tr><td colspan="7" class="empty">Loading…</td></tr></tbody>
      </table>
    </div>
  </section>

<?php include __DIR__ . '/../includes/footer.php'; ?>
<script src="../assets/js/ocean.js"></script>
<script src="../assets/js/api.js"></script>
<script src="../assets/js/i18n.js"></script>
<script src="../assets/js/i18n_ext.js"></script>
<script src="../assets/js/i18n_auto.js"></script>
<script src="../assets/js/currency.js"></script>
<script>FIQ.setCsrf(<?= json_encode(csrf_token()) ?>);</script>
<script src="../assets/js/app.js"></script>
<script>
const canResolve = <?= has_permission('alerts.resolve') ? 'true' : 'false' ?>;
async function loadAlerts() {
  try {
    const rows = await FIQ.get('alerts.php');
    document.getElementById('alertsTableBody').innerHTML = rows.length ? rows.map(a => `
      <tr class="${a.is_resolved ? 'row-resolved' : ''}">
        <td><span class="sev-badge sev-${a.severity.toLowerCase()}">${fiqEnum(a.severity)}</span></td>
        <td>${a.alert_type}</td>
        <td>${a.load_point ? a.load_point + ' → ' + a.port_name : (a.port_name || '—')}</td>
        <td>${a.message}</td>
        <td>${new Date(a.created_at).toLocaleString(window.fiqLocale ? fiqLocale() : undefined)}</td>
        <td>${a.is_resolved ? `<span class="status-badge status-completed">${fiqEnum('Resolved')}</span>` : `<span class="status-badge status-active">${fiqEnum('Open')}</span>`}</td>
        <td>${(!a.is_resolved && canResolve) ? `<button class="btn-mini" onclick="resolveAlert(${a.id})">${fiqT('b_resolve')}</button>` : ''}</td>
      </tr>`).join('') : '<tr><td colspan="7" class="empty">No alerts on record.</td></tr>';
  } catch (e) { console.error(e); if (e.status === 401) window.location.href = '../login.php'; }
}
async function resolveAlert(id) {
  try { await FIQ.post('alerts.php', { id }); loadAlerts(); } catch (e) { alert(e.data?.error || 'Could not resolve alert.'); }
}
document.addEventListener('fiq-refresh-money', loadAlerts);
loadAlerts();
</script>
<script src="../assets/js/fx.js"></script>
<script src="../assets/js/palette.js"></script>
</body>
</html>
