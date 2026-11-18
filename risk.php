<?php require_once __DIR__ . '/../../backend/middleware/security.php'; require_permission('risk.view', false); ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Risk Center | FreightIQ Marine</title>
<link rel="stylesheet" href="../assets/css/style.css">
<link rel="stylesheet" href="../assets/css/ocean.css">
<link rel="stylesheet" href="../assets/css/fx.css">
<script src="../assets/js/theme.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
</head>
<body data-reduced-motion="false">
<canvas id="ocean-canvas"></canvas>
<div class="aurora-sweep"></div>
<div class="wave-layer wave-back fixed-wave"></div>
<div class="wave-layer wave-accent fixed-wave"></div>
<?php include __DIR__ . '/../includes/nav.php'; ?>

  <header class="topbar">
    <div><h2>⚠️ <span data-i18n="t_risk">Risk Center</span></h2>
    <p class="subtle" data-i18n="s_risk">Freight, port, vessel and route risk with idle-vessel impact</p></div>
  </header>

  <section class="kpi-grid" id="riskKpi"></section>

  <section class="two-col">
    <div class="panel"><h3 data-i18n="x_risk_freight">Freight Risk</h3><div id="freightRisk"></div></div>
    <div class="panel"><h3 data-i18n="x_risk_port">Port Risk</h3><div id="portRisk"></div></div>
  </section>
  <section class="two-col">
    <div class="panel"><h3 data-i18n="x_risk_vessel">Vessel Risk</h3><div id="vesselRisk"></div></div>
    <div class="panel"><h3 data-i18n="x_risk_route">Route Risk</h3><div id="routeRisk"></div></div>
  </section>

  <section class="panel">
    <h3>⏸️ <span data-i18n="sec_idle">Idle Vessel Management</span></h3>
    <div class="kpi-grid" id="idleKpi"></div>
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th data-i18n="c_vessel">Vessel</th><th data-i18n="c_class">Class</th><th>Cause</th><th>Idle Days</th><th>Idle Cost</th><th>Suggested Action</th><th>Alt. Revenue</th></tr></thead>
        <tbody id="idleTableBody"><tr><td colspan="7" class="empty">Loading…</td></tr></tbody>
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
<script src="../assets/js/risk.js"></script>
<script src="../assets/js/fx.js"></script>
<script src="../assets/js/palette.js"></script>
</body>
</html>
