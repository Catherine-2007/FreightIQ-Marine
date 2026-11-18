<?php require_once __DIR__ . '/../../backend/middleware/security.php'; require_permission('gps.view', false); ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Fleet & GPS Tracking | FreightIQ Marine</title>
<link rel="stylesheet" href="../assets/css/style.css">
<link rel="stylesheet" href="../assets/css/ocean.css">
<link rel="stylesheet" href="../assets/css/fx.css">
<script src="../assets/js/theme.js"></script>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
</head>
<body data-reduced-motion="false">
<canvas id="ocean-canvas"></canvas>
<div class="aurora-sweep"></div>
<div class="wave-layer wave-back fixed-wave"></div>
<div class="wave-layer wave-accent fixed-wave"></div>
<?php include __DIR__ . '/../includes/nav.php'; ?>

  <header class="topbar">
    <div style="display:flex; align-items:center; gap:12px;">
      <div class="radar-sweep"></div>
      <div><h2>🚢 <span data-i18n="t_fleet">Fleet & GPS Tracking</span></h2>
      <p class="subtle" data-i18n="s_fleet">Live-style vessel positions with Digital Twin</p></div>
    </div>
    <span class="data-badge">Simulated positions — not live AIS</span>
  </header>

  <section class="panel">
    <div id="gpsMap"></div>
    <p class="subtle" style="margin-top:8px;">🔵 <span>Vessels</span> &nbsp; 🟠 <span>Ports</span> &nbsp; 🔴 <span>Congestion Rings</span></p>
    <div class="tm-bar">
      <span class="tm-title">⏱ <span>Time Machine</span></span>
      <button class="btn-secondary" id="tmPlay" aria-label="Play">▶</button>
      <input type="range" id="tmRange" min="-24" max="24" step="0.5" value="0">
      <output id="tmLabel" class="mono">Now</output>
      <button class="btn-secondary" id="tmNow"><span>Now</span></button>
      <span class="subtle tm-note">Dead-reckoning projection from heading and speed, not a real track.</span>
    </div>
    <div class="map-actions">
      <button class="btn-secondary active" id="toggleLanes">〰️ <span data-i18n="u_lanes">Trade Lanes</span></button>
      <button class="btn-secondary active" id="toggleRings">◎ <span>Congestion Rings</span></button>
      <button class="btn-secondary" id="resetView">⌖ <span>Reset view</span></button>
    </div>
  </section>

  <section class="panel">
    <div class="panel-head">
      <h3><span data-i18n="sec_fleet">Fleet Roster</span> <span class="subtle" data-i18n="x_click_twin">(click a vessel for its Digital Twin)</span></h3>
      <div class="panel-controls">
        <input type="text" id="vesselSearch" placeholder="Search vessel name or IMO…" data-i18n-placeholder="x_search_ph">
        <select id="statusFilter">
          <option value="" data-i18n="flt_all_status">All statuses</option>
          <option value="Available" data-i18n="st_available">Available</option><option value="On Voyage" data-i18n="st_on_voyage">On Voyage</option><option value="Idle" data-i18n="st_idle">Idle</option><option value="Under Repair" data-i18n="st_under_repair">Under Repair</option>
        </select>
        <button class="btn-secondary" id="exportVesselsCsv">⬇️ <span data-i18n="btn_export_csv">Export CSV</span></button>
      </div>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th data-i18n="c_vessel">Vessel</th><th data-i18n="c_class">Class</th><th>IMO</th><th>DWT</th><th>Flag</th><th data-i18n="c_status">Status</th><th data-i18n="c_eta">ETA</th></tr></thead>
        <tbody id="vesselTableBody"><tr><td colspan="7" class="empty">Loading…</td></tr></tbody>
      </table>
    </div>
  </section>

  <!-- Digital Twin modal -->
  <div id="twinOverlay" class="twin-overlay hidden">
    <div class="twin-modal">
      <button class="twin-close" id="twinClose">✕</button>
      <div id="twinContent"></div>
    </div>
  </div>

<?php include __DIR__ . '/../includes/footer.php'; ?>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="../assets/js/ocean.js"></script>
<script src="../assets/js/api.js"></script>
<script src="../assets/js/i18n.js"></script>
<script src="../assets/js/i18n_ext.js"></script>
<script src="../assets/js/i18n_auto.js"></script>
<script src="../assets/js/currency.js"></script>
<script>FIQ.setCsrf(<?= json_encode(csrf_token()) ?>);</script>
<script src="../assets/js/app.js"></script>
<script src="../assets/js/export_csv.js"></script>
<script src="../assets/js/ship_svg.js"></script>
<script src="../assets/js/twin_lab.js"></script>
<script src="../assets/js/fleet.js"></script>
<script src="../assets/js/fx.js"></script>
<script src="../assets/js/palette.js"></script>
</body>
</html>
