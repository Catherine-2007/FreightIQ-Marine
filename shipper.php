<?php require_once __DIR__ . '/../../backend/middleware/security.php'; require_permission('cargo.view', false); ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Shipper Workspace | FreightIQ Marine</title>
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
    <div><h2>📦 <span data-i18n="t_shipper">Shipper Workspace</span></h2>
    <p class="subtle" data-i18n="s_shipper">Submit cargo requirements and get instant recommendations</p></div>
  </header>

  <?php if (has_permission('cargo.create')): ?>
  <section class="panel">
    <h3 data-i18n="sec_new_cargo">New Cargo Requirement</h3>
    <form id="cargoForm" class="grid-form">
      <label><span data-i18n="x_commodity">Commodity</span> <select name="commodity_id" id="commoditySelect" required></select></label>
      <label><span data-i18n="x_origin">Origin</span> <select name="origin_id" id="originSelect" required></select></label>
      <label><span data-i18n="l_port">Destination Port</span> <select name="destination_port_id" id="destSelect" required></select></label>
      <label><span data-i18n="l_qty">Cargo Quantity (t)</span> <input type="number" name="quantity_tonnes" min="1000" required></label>
      <label><span data-i18n="x_load_start">Loading Window Start</span> <input type="date" name="loading_window_start"></label>
      <label><span data-i18n="x_load_end">Loading Window End</span> <input type="date" name="loading_window_end"></label>
      <label><span data-i18n="x_deliv_start">Delivery Window Start</span> <input type="date" name="delivery_window_start"></label>
      <label><span data-i18n="x_deliv_end">Delivery Window End</span> <input type="date" name="delivery_window_end"></label>
      <label><span data-i18n="l_ctype">Contract Type</span> <select name="contract_duration"><option>Spot</option><option>Short-Term</option><option>Medium-Term</option></select></label>
      <button type="submit" class="btn-primary"><span data-i18n="b_submit_cargo">Submit & Get Recommendation</span></button>
    </form>
  </section>
  <?php endif; ?>

  <div id="loadingState" class="hidden loading-ship">🚢 <span>Matching cargo to fleet…</span></div>

  <section id="recResult" class="hidden panel">
    <h3>Instant Recommendation</h3>
    <div id="recContent"></div>
  </section>

  <section class="panel">
    <h3 data-i18n="sec_my_cargo">My Cargo Requests</h3>
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th data-i18n="x_commodity">Commodity</th><th data-i18n="c_route">Route</th><th>Qty</th><th>Duration</th><th>Recommended Vessel</th><th>Est. Freight</th><th data-i18n="c_risk">Risk</th><th data-i18n="c_status">Status</th></tr></thead>
        <tbody id="cargoTableBody"><tr><td colspan="8" class="empty">Loading…</td></tr></tbody>
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
<script src="../assets/js/shipper.js"></script>
<script src="../assets/js/fx.js"></script>
<script src="../assets/js/palette.js"></script>
</body>
</html>
