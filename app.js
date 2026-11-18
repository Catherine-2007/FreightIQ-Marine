// FreightIQ Marine :: App shell behaviours (logout, reduced motion, notifications, toasts)
(function () {
  // Language / currency / theme switchers
  fiqBuildLanguageSwitcher('langSwitcherBox');
  fiqBuildCurrencySwitcher('currencySwitcherBox');
  fiqBuildThemeSwitcher('themeSwitcherBox');
  window.addEventListener('fiq-currency-changed', () => {
    // Let the active page know it should re-render money values.
    document.dispatchEvent(new CustomEvent('fiq-refresh-money'));
  });

  // Reduced motion toggle
  const toggle = document.getElementById('reducedMotionToggle');
  const stored = localStorage.getItem('fiq_reduced_motion') === 'true';
  if (stored) document.documentElement.dataset.reducedMotion = 'true';
  if (toggle) {
    toggle.checked = stored;
    toggle.addEventListener('change', () => {
      document.documentElement.dataset.reducedMotion = toggle.checked ? 'true' : 'false';
      localStorage.setItem('fiq_reduced_motion', toggle.checked);
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try { await FIQ.post('auth_logout.php'); } catch (_) {}
      sessionStorage.removeItem('fiq_csrf');
      window.location.href = '/FreightIQ-Marine/frontend/login.php';
    });
  }

  // Notification bell
  const bell = document.getElementById('notifBell');
  const panel = document.getElementById('notifPanel');
  if (bell && panel) {
    bell.addEventListener('click', async () => {
      panel.classList.toggle('hidden');
      if (!panel.classList.contains('hidden')) {
        try {
          const notifs = await FIQ.get('notifications.php');
          panel.innerHTML = notifs.length
            ? notifs.map(n => `<div class="notif-item ${n.is_read == 0 ? 'unread' : ''}"><b>${n.title}</b><div>${n.message}</div><small>${n.category} · ${new Date(n.created_at).toLocaleString(window.fiqLocale ? fiqLocale() : undefined)}</small></div>`).join('')
            : '<div class="notif-item">No notifications.</div>';
        } catch (e) { panel.innerHTML = '<div class="notif-item">Could not load notifications.</div>'; }
      }
    });
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && !bell.contains(e.target)) panel.classList.add('hidden');
    });
  }

  // Toast notifications: on page load, show any unread notifications as
  // brief slide-in toasts (in addition to the persistent bell panel).
  (async function showToasts() {
    if (!document.getElementById('notifBell')) return; // only on pages with the app shell
    try {
      const notifs = await FIQ.get('notifications.php');
      const unread = notifs.filter(n => n.is_read == 0).slice(0, 3);
      if (!unread.length) return;
      let stack = document.getElementById('toastStack');
      if (!stack) {
        stack = document.createElement('div');
        stack.id = 'toastStack';
        stack.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:100;display:flex;flex-direction:column;gap:10px;max-width:320px;';
        document.body.appendChild(stack);
      }
      unread.forEach((n, i) => {
        setTimeout(() => {
          const sevColor = { Critical: '#ff6b6b', Warning: '#ffb84d', Success: '#7fe0d4', Info: '#2fb8c9' }[n.severity] || '#2fb8c9';
          const toast = document.createElement('div');
          toast.style.cssText = `background:var(--panel-solid-bg);border:1px solid ${sevColor};border-left:4px solid ${sevColor};border-radius:10px;padding:12px 14px;font-size:12.5px;color:var(--text-light);box-shadow:0 8px 24px rgba(0,0,0,0.4);animation:toastIn 0.35s ease-out;`;
          toast.innerHTML = `<b>${n.title}</b><div style="margin-top:4px;color:var(--text-muted);">${n.message}</div>`;
          stack.appendChild(toast);
          setTimeout(() => { toast.style.transition = 'opacity 0.4s, transform 0.4s'; toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)'; setTimeout(() => toast.remove(), 400); }, 6000);
        }, i * 400);
      });
      if (!document.getElementById('toastKeyframes')) {
        const style = document.createElement('style');
        style.id = 'toastKeyframes';
        style.textContent = '@keyframes toastIn { from { opacity:0; transform:translateX(20px);} to { opacity:1; transform:translateX(0);} }';
        document.head.appendChild(style);
      }
    } catch (e) { /* silent — toasts are a convenience, not critical path */ }
  })();
})();
