// FreightIQ Marine :: Visual effects (spotlight, reveal, ripple, language ripple)
(function () {
  const reduced = () => document.documentElement.dataset.reducedMotion === 'true' || document.body.dataset.reducedMotion === 'true' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = (s) => (window.fiqX ? window.fiqX(s) : s);

  // 1) cursor spotlight: feeds --mx/--my to the nearest glass card
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest && e.target.closest('.panel, .kpi-card, .qa-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  // 2) staggered scroll-reveal
  function setupReveal() {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('fx-in'); io.unobserve(en.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll('.main-content .panel, .kpi-card, .qa-card').forEach((el, i) => {
      if (reduced()) return;
      el.classList.add('fx-reveal');
      el.style.setProperty('--fx-d', Math.min(i, 8) * 70 + 'ms');
      io.observe(el);
    });
  }

  // 3) button ripple
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('.btn-primary, .btn-secondary, .btn-mini');
    if (!b || reduced()) return;
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height);
    const s = document.createElement('span');
    s.className = 'fx-ripple';
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    b.appendChild(s); setTimeout(() => s.remove(), 650);
  });

  // 4) language-change ripple spreading from the selector, with a language badge
  window.addEventListener('fiq-lang-changed', () => {
    if (reduced()) return;
    const sel = document.getElementById('langSwitcher');
    const r = sel ? sel.getBoundingClientRect() : { left: innerWidth / 2, top: 80, width: 0, height: 0 };
    const w = document.createElement('div');
    w.className = 'fx-lang-wave';
    w.style.setProperty('--wx', (r.left + r.width / 2) + 'px'); w.style.setProperty('--wy', (r.top + r.height / 2) + 'px');
    document.body.appendChild(w); setTimeout(() => w.remove(), 950);
    const code = (typeof fiqCurrentLang === 'function') ? fiqCurrentLang() : 'en';
    const meta = (typeof FIQ_LANGUAGES !== 'undefined') && FIQ_LANGUAGES.find((l) => l.code === code);
    if (meta) {
      const bd = document.createElement('div'); bd.className = 'fx-lang-badge'; bd.textContent = '🌐 ' + meta.native;
      document.body.appendChild(bd); setTimeout(() => bd.remove(), 1150);
    }
  });

  // 5) login / register have no sidebar: give them a language chip
  function authLang() {
    if (!document.querySelector('.auth-card') || document.getElementById('langSwitcher') || typeof fiqBuildLanguageSwitcher !== 'function') return;
    const box = document.createElement('div'); box.id = 'fxAuthLang'; box.className = 'fx-auth-lang';
    document.body.appendChild(box); fiqBuildLanguageSwitcher('fxAuthLang');
  }

  document.addEventListener('DOMContentLoaded', () => { authLang(); setupReveal(); });
})();
