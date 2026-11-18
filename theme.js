// FreightIQ Marine :: Multi-theme support
const FIQ_THEMES = [
  { code: 'ocean', name: 'Ocean (default)', icon: '🌊' },
  { code: 'light', name: 'Light', icon: '☀️' },
  { code: 'midnight', name: 'Midnight', icon: '🌑' },
  { code: 'sunrise', name: 'Sunrise', icon: '🌅' },
];

function fiqCurrentTheme() {
  return localStorage.getItem('fiq_theme') || 'ocean';
}

function fiqApplyTheme() {
  const theme = fiqCurrentTheme();
  if (theme === 'ocean') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  // Let canvas-drawn effects (ocean.js) know they should re-read CSS theme
  // colors — CSS custom properties alone don't repaint <canvas> content.
  window.dispatchEvent(new CustomEvent('fiq-theme-changed'));
}

function fiqSetTheme(code) {
  localStorage.setItem('fiq_theme', code);
  fiqApplyTheme();
}

function fiqBuildThemeSwitcher(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const current = fiqCurrentTheme();
  el.innerHTML = `<select id="themeSwitcher">${FIQ_THEMES.map(t => `<option value="${t.code}" ${t.code===current?'selected':''}>${t.icon} ${t.name}</option>`).join('')}</select>`;
  document.getElementById('themeSwitcher').addEventListener('change', (e) => fiqSetTheme(e.target.value));
}

fiqApplyTheme();
