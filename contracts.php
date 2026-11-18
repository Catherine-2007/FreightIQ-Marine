<?php require_once __DIR__ . '/../../backend/middleware/security.php'; require_permission('contracts.view', false); ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Contract Intelligence | FreightIQ Marine</title>
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
    <div><h2>📄 <span data-i18n="t_contracts">Contract Intelligence</span></h2>
    <p class="subtle" data-i18n="s_contracts">Spot vs short vs medium-term multi-voyage contracts</p></div>
  </header>

  <section class="panel">
    <h3 data-i18n="sec_compare">Compare Contract Types</h3>
    <form id="compareForm" class="grid-form">
      <label><span data-i18n="l_route">Route</span> <select name="route_id" id="routeSelect" required></select></label>
      <label><span data-i18n="l_vclass">Vessel Class</span> <select name="vessel_class_id" id="classSelect" required></select></label>
      <label><span data-i18n="x_vol_voyage">Volume / Voyage (t)</span> <input type="number" name="volume_per_voyage" value="50000" min="1000" required></label>
      <button type="submit" class="btn-primary"><span data-i18n="b_compare">Compare</span> 📊</button>
    </form>
  </section>

  <section id="compareResult" class="hidden">
    <section class="three-col" id="compareCards"></section>
    <section class="panel">
      <p class="recommendation-text" id="savingsSummary"></p>
      <p class="subtle" id="disclaimer"></p>
    </section>
  </section>

  <?php if (has_permission('contracts.create')): ?>
  <section class="panel">
    <h3 data-i18n="sec_new_contract">Create Contract</h3>
    <form id="contractForm" class="grid-form">
      <label><span data-i18n="l_route">Route</span> <select name="route_id" id="routeSelect2" required></select></label>
      <label><span data-i18n="l_vclass">Vessel Class</span> <select name="vessel_class_id" id="classSelect2" required></select></label>
      <label><span data-i18n="l_ctype">Contract Type</span> <select name="contract_type"><option>Spot</option><option>Short-Term (COA)</option><option>Medium-Term (COA)</option></select></label>
      <label><span data-i18n="x_n_voyages">Number of Voyages</span> <input type="number" name="num_voyages" min="1" value="1" required></label>
      <label><span data-i18n="x_vol_voyage">Volume / Voyage (t)</span> <input type="number" name="cargo_volume_tonnes_per_voyage" min="1000" required></label>
      <label><span data-i18n="x_target_rate">Target Rate (USD/t)</span> <input type="number" step="0.01" name="target_rate_usd_per_tonne" required></label>
      <label><span data-i18n="l_start">Start Date</span> <input type="date" name="start_date" required></label>
      <label><span data-i18n="l_end">End Date</span> <input type="date" name="end_date"></label>
      <button type="submit" class="btn-primary"><span data-i18n="b_create_contract">Create Contract</span></button>
    </form>
  </section>
  <?php endif; ?>

  <section class="panel">
    <div class="panel-head">
      <h3 data-i18n="sec_ledger">Contract Ledger</h3>
      <button class="btn-secondary" id="exportContractsCsv">⬇️ <span data-i18n="btn_export_csv">Export CSV</span></button>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th data-i18n="c_route">Route</th><th data-i18n="c_vessel">Vessel</th><th data-i18n="c_type">Type</th><th data-i18n="c_voyages">Voyages</th><th data-i18n="x_vol_voyage">Volume / Voyage (t)</th><th data-i18n="c_rate">Rate</th><th data-i18n="c_status">Status</th><th data-i18n="c_savings">Est. Savings</th><th data-i18n="u_co2_est">Est. CO₂ Emissions</th><th data-i18n="u_hash">Integrity Hash</th></tr></thead>
        <tbody id="contractTableBody"><tr><td colspan="10" class="empty">Loading…</td></tr></tbody>
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
<script src="../assets/js/export_csv.js"></script>
<script src="../assets/js/contracts.js"></script>
<script src="../assets/js/fx.js"></script>
<script src="../assets/js/palette.js"></script>
</body>
</html>
