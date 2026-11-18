// FreightIQ Marine :: Ocean visual effects (theme-aware)
(function () {
  const canvas = document.getElementById('ocean-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, particles, streaks, themeColors;
    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize); resize();

    // Read the live theme's RGB triplets so every canvas effect recolors
    // itself instantly when the person switches theme — a hardcoded teal
    // would otherwise look wrong (or invisible) against the Light theme.
    function readThemeColors() {
      const cs = getComputedStyle(document.documentElement);
      const g = (name, fallback) => (cs.getPropertyValue(name).trim() || fallback);
      themeColors = {
        teal: g('--teal-rgb', '47,184,201'),
        oceanBlue: g('--ocean-blue-rgb', '10,61,92'),
        seafoam: g('--seafoam-rgb', '127,224,212'),
        cyan: g('--cyan-rgb', '67,217,232'),
      };
    }
    readThemeColors();
    window.addEventListener('fiq-theme-changed', readThemeColors);

    function makeParticles(n) {
      particles = [];
      for (let i = 0; i < n; i++) {
        particles.push({ x: Math.random()*w, y: Math.random()*h, r: Math.random()*2+0.6, speed: Math.random()*0.4+0.1, drift: Math.random()*0.6-0.3, alpha: Math.random()*0.5+0.15 });
      }
    }
    makeParticles(80);

    // Occasional light streak (like a sonar ping / shooting light across
    // deep water) for a more "impressive", premium command-center feel.
    function makeStreaks(n) {
      streaks = [];
      for (let i = 0; i < n; i++) {
        streaks.push({ x: Math.random()*w, y: Math.random()*h*0.6, len: Math.random()*120+60, speed: Math.random()*2+1.2, angle: Math.PI*0.15, life: Math.random()*200, maxLife: Math.random()*300+200 });
      }
    }
    makeStreaks(3);

    let t = 0;
    function drawWaves() {
      const baseY = h * 0.74;
      const layers = [
        { amp: 16, freq: 0.006, speed: 0.014, color: `rgba(${themeColors.teal},0.09)` },
        { amp: 24, freq: 0.004, speed: 0.009, color: `rgba(${themeColors.oceanBlue},0.17)` },
        { amp: 11, freq: 0.010, speed: 0.020, color: `rgba(${themeColors.seafoam},0.07)` },
      ];
      layers.forEach((layer, idx) => {
        ctx.beginPath(); ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 8) {
          const y = baseY + idx*22 + Math.sin(x*layer.freq + t*layer.speed) * layer.amp;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h); ctx.closePath(); ctx.fillStyle = layer.color; ctx.fill();
      });
    }
    function drawParticles() {
      particles.forEach((p) => {
        p.y -= p.speed; p.x += Math.sin(p.y*0.01)*p.drift*0.3;
        if (p.y < -10) { p.y = h+10; p.x = Math.random()*w; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${themeColors.cyan},${p.alpha})`; ctx.fill();
      });
    }
    function drawStreaks() {
      streaks.forEach((s) => {
        s.life++;
        if (s.life > s.maxLife) { s.x = Math.random()*w; s.y = Math.random()*h*0.6; s.life = 0; s.maxLife = Math.random()*300+200; }
        const progress = s.life / s.maxLife;
        const fade = Math.sin(progress * Math.PI); // fades in then out
        const sx = s.x + Math.cos(s.angle) * s.speed * s.life;
        const sy = s.y + Math.sin(s.angle) * s.speed * s.life;
        const ex = sx - Math.cos(s.angle) * s.len;
        const ey = sy - Math.sin(s.angle) * s.len;
        const grad = ctx.createLinearGradient(sx, sy, ex, ey);
        grad.addColorStop(0, `rgba(${themeColors.cyan},${0.35*fade})`);
        grad.addColorStop(1, `rgba(${themeColors.cyan},0)`);
        ctx.strokeStyle = grad; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      });
    }
    function loop() {
      const reduced = document.documentElement.dataset.reducedMotion === 'true';
      ctx.clearRect(0, 0, w, h);
      drawWaves();
      if (!reduced) { drawParticles(); drawStreaks(); }
      t += reduced ? 0 : 1;
      requestAnimationFrame(loop);
    }
    loop();
  }

  const bubbleField = document.getElementById('bubble-field');
  if (bubbleField && document.documentElement.dataset.reducedMotion !== 'true') {
    for (let i = 0; i < 16; i++) {
      const b = document.createElement('div'); b.className = 'bubble';
      const size = Math.random()*14+4;
      b.style.width = size+'px'; b.style.height = size+'px';
      b.style.left = Math.random()*100+'vw';
      b.style.animationDuration = (Math.random()*12+10)+'s';
      b.style.animationDelay = (Math.random()*10)+'s';
      bubbleField.appendChild(b);
    }
  }

  const clockEl = document.getElementById('live-clock');
  if (clockEl) {
    function tick() {
      const now = new Date();
      clockEl.textContent = '⏱ ' + now.toLocaleString((window.fiqLocale ? fiqLocale() : 'en-IN'), { weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    tick(); setInterval(tick, 1000);
  }

  // Count-up animation for KPI numbers with data-countup attribute
  document.querySelectorAll('[data-countup]').forEach(el => {
    const target = parseFloat(el.dataset.countup);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    if (document.documentElement.dataset.reducedMotion === 'true') {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }
    let cur = 0; const steps = 30; const inc = target / steps; let i = 0;
    el.classList.add('counting');
    const iv = setInterval(() => {
      i++; cur += inc;
      el.textContent = prefix + Math.min(cur, target).toFixed(decimals) + suffix;
      if (i >= steps) clearInterval(iv);
    }, 20);
  });
})();
