<?php require_once __DIR__ . '/../../backend/middleware/security.php'; require_permission('admin.manage_users', false); ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>User Management | FreightIQ Marine</title>
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
    <div><h2>🛡️ <span data-i18n="t_users">User Management</span></h2>
    <p class="subtle" data-i18n="s_users">Roles, activation and account unlocks (Admin only)</p></div>
  </header>

  <section class="panel">
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th data-i18n="c_name">Name</th><th data-i18n="email">Email</th><th>Organisation</th><th data-i18n="c_role">Role</th><th data-i18n="c_status">Status</th><th>Failed Attempts</th><th>Last Login</th><th data-i18n="c_actions">Actions</th></tr></thead>
        <tbody id="usersTableBody"><tr><td colspan="8" class="empty">Loading…</td></tr></tbody>
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
<script src="../assets/js/admin_users.js"></script>
<script src="../assets/js/fx.js"></script>
<script src="../assets/js/palette.js"></script>
</body>
</html>
