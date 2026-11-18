<?php require_once __DIR__ . '/../../backend/middleware/security.php'; require_permission('ports.view', false); ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Laytime & Demurrage | FreightIQ Marine</title>
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
    <div><h2>⏳ <span>Laytime & Demurrage</span></h2>
    <p class="subtle">Estimate demurrage, despatch and port-side cost per tonne, and find the cheapest compatible port</p></div>
    <span class="data-badge">Indicative planning model</span>
  </header>

  <section class="panel">
    <div class="panel-head"><h3>Assumptions</h3></div>
    <div class="lt-form">
      <label><span>Destination Port</span><select id="ltPort"></select></label>
      <label><span>Vessel Class</span><select id="ltClass"></select></label>
      <label><span>Cargo Quantity (t)</span><input type="number" id="ltQty" value="60000" min="1000" step="1000"></label>
      <label><span>Contract discharge rate (t/day)</span><input type="number" id="ltRate" value="8000" min="500" step="500"></label>
      <label><span>Demurrage rate (USD/day)</span><input type="number" id="ltDem" min="1000" step="500"></label>
      <label><span>Despatch (% of demurrage)</span><input type="number" id="ltDesp" value="50" min="0" max="100" step="5"></label>
      <label><span>Extra waiting days</span><input type="number" id="ltExtra" value="0" min="0" max="30" step="0.5"></label>
    </div>
    <p class="subtle" style="margin-top:8px;">Indicative planning model. Uses a congestion-based waiting estimate, not real berth schedules or charter-party terms.</p>
  </section>

  <section class="panel" id="ltResult">
    <div class="panel-head"><h3 id="ltTitle">Sounding the harbour…</h3><span id="ltFit"></span></div>
    <div class="lt-bars" id="ltBars"></div>
    <div class="kpi-grid" id="ltKpis"></div>
    <p class="recommendation-text" id="ltBest"></p>
  </section>

  <section class="panel">
    <div class="panel-head"><h3>Port ranking for this cargo</h3>
      <div class="panel-controls"><button class="btn-secondary" id="ltCsv">⬇️ <span data-i18n="btn_export_csv">Export CSV</span></button></div></div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Port</th><th>Fit</th><th>Waiting</th><th>Cargo handling</th><th>Time used</th><th>Demurrage / Despatch</th><th>Handling cost</th><th>Port-side cost / tonne</th></tr></thead>
      <tbody id="ltRank"><tr><td colspan="8" class="empty">Loading…</td></tr></tbody>
    </table></div>
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
<script src="../assets/js/export_csv.js"></script>
<script src="../assets/js/laytime.js"></script>
<script src="../assets/js/fx.js"></script>
<script src="../assets/js/palette.js"></script>
</body>
</html>
