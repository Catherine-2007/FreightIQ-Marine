// FreightIQ Marine :: Command palette (Ctrl/Cmd+K or "/") - jump to any page, vessel or port.
// Labels are read from the already-translated sidebar, so it follows the active language.
(function () {
  if (!document.querySelector('.sidebar nav')) return;
  const X = (s) => (window.fiqX ? window.fiqX(s) : s);
  const ROOT = '/FreightIQ-Marine/frontend/';
  let data = null, shown = [], sel = 0;

  const hint = document.createElement('div');
  hint.className = 'fx-kbd-hint'; hint.setAttribute('role', 'button'); hint.tabIndex = 0;
  hint.innerHTML = `🔎 <span>Jump to anywhere</span> <kbd>Ctrl K</kbd>`;
  const ov = document.createElement('div');
  ov.className = 'fx-pal-overlay hidden';
  ov.innerHTML = `<div class="fx-pal" role="dialog" aria-modal="true">
      <input type="text" id="fxPalInput" autocomplete="off" placeholder="Search pages, vessels, ports…">
      <div class="fx-pal-list" id="fxPalList"></div>
      <div class="fx-pal-foot"><span><kbd>↑</kbd> <kbd>↓</kbd></span><span><kbd>Enter</kbd></span><span><kbd>Esc</kbd></span></div></div>`;
  document.body.append(hint, ov);
  const input = ov.querySelector('#fxPalInput'), list = ov.querySelector('#fxPalList');

  async function load() {
    if (data) return data;
    const pages = [...document.querySelectorAll('.sidebar nav a')].map((a) => ({
      group: 'Pages', icon: (a.firstChild && a.firstChild.textContent.trim()) || '•',
      label: (a.querySelector('span') || a).textContent.trim(), sub: '', href: a.href }));
    let vessels = [], ports = [];
    try { const r = await FIQ.get('vessels.php', { per_page: 50 }); vessels = (r.data || []).map((v) => ({
      group: 'Vessels', icon: '🚢', label: v.vessel_name, sub: v.class_name + ' · ' + v.imo_number, href: ROOT + 'pages/fleet.php#v=' + v.id })); } catch (e) {}
    try { const r = await FIQ.get('ports.php'); ports = (Array.isArray(r) ? r : []).map((p) => ({
      group: 'Ports', icon: '⚓', label: p.name, sub: p.coast ? p.coast + ' coast' : '', href: ROOT + 'pages/ports.php' })); } catch (e) {}
    return (data = [...pages, ...vessels, ...ports]);
  }
  function render() {
    const q = input.value.trim().toLowerCase();
    const per = { Pages: 12, Vessels: 8, Ports: 6 }, count = {};
    shown = (data || []).filter((i) => !q || (i.label + ' ' + i.sub).toLowerCase().includes(q))
      .filter((i) => (count[i.group] = (count[i.group] || 0) + 1) <= per[i.group]);
    if (!shown.length) { list.innerHTML = `<div class="fx-pal-empty">${X('No results')}</div>`; return; }
    sel = Math.min(sel, shown.length - 1);
    let html = '', last = '';
    shown.forEach((i, n) => {
      if (i.group !== last) { html += `<div class="fx-pal-group">${X(i.group)}</div>`; last = i.group; }
      html += `<div class="fx-pal-item ${n === sel ? 'sel' : ''}" data-i="${n}"><span>${i.icon}</span><span>${i.label}</span><small>${i.sub}</small></div>`;
    });
    list.innerHTML = html;
    const cur = list.querySelector('.sel'); if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
  }
  function go(i) {
    if (!i) return;
    close();
    if (i.href.split('#')[0] === location.href.split('#')[0]) { location.href = i.href; location.reload(); }
    else location.href = i.href;
  }
  async function open() { ov.classList.remove('hidden'); input.value = ''; sel = 0; input.focus(); await load(); render(); }
  function close() { ov.classList.add('hidden'); }

  hint.addEventListener('click', open);
  hint.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
  ov.addEventListener('mousedown', (e) => { if (e.target === ov) close(); });
  input.addEventListener('input', () => { sel = 0; render(); });
  list.addEventListener('click', (e) => { const el = e.target.closest('.fx-pal-item'); if (el) go(shown[+el.dataset.i]); });
  list.addEventListener('mousemove', (e) => { const el = e.target.closest('.fx-pal-item'); if (el && +el.dataset.i !== sel) { sel = +el.dataset.i; list.querySelectorAll('.fx-pal-item').forEach((n) => n.classList.toggle('sel', +n.dataset.i === sel)); } });
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || '')) || e.target.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ov.classList.contains('hidden') ? open() : close(); return; }
    if (e.key === '/' && !typing && ov.classList.contains('hidden')) { e.preventDefault(); open(); return; }
    if (ov.classList.contains('hidden')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); go(shown[sel]); }
  });
  window.addEventListener('fiq-lang-changed', () => { data = null; });
})();
