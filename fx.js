/* ===== FX: dym, cząsteczki, eksplozje, tilt, ripple ===== */
(() => {
  const canvas = document.getElementById('fx');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W, H, DPR;
  function resize() {
    DPR = Math.min(2, devicePixelRatio || 1);
    W = canvas.width = innerWidth * DPR;
    H = canvas.height = innerHeight * DPR;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  }
  resize();
  addEventListener('resize', resize);

  const pointer = { x: -9999, y: -9999 };
  addEventListener('pointermove', e => { pointer.x = e.clientX * DPR; pointer.y = e.clientY * DPR; });
  addEventListener('pointerleave', () => { pointer.x = -9999; pointer.y = -9999; });

  /* --- unoszący się dym / spory --- */
  const smoke = [];
  const SMOKE_N = reduced ? 0 : 42;
  function newSmoke(p = {}) {
    return {
      x: Math.random() * W,
      y: p.fromBottom ? H + 40 : Math.random() * H,
      r: (30 + Math.random() * 90) * DPR,
      vy: (0.12 + Math.random() * 0.35) * DPR,
      vx: (Math.random() - .5) * 0.15 * DPR,
      o: 0.03 + Math.random() * 0.06,
      hue: 130 + Math.random() * 40,
      wob: Math.random() * Math.PI * 2,
      wobSpd: 0.002 + Math.random() * 0.006,
    };
  }
  for (let i = 0; i < SMOKE_N; i++) smoke.push(newSmoke());

  /* --- małe świetliki --- */
  const spores = [];
  const SPORE_N = reduced ? 0 : 26;
  for (let i = 0; i < SPORE_N; i++) spores.push({
    x: Math.random() * W, y: Math.random() * H,
    r: (0.8 + Math.random() * 1.8) * DPR,
    vy: (0.15 + Math.random() * 0.4) * DPR,
    ph: Math.random() * Math.PI * 2,
  });

  /* --- eksplozje (przy zapisie sesji) --- */
  const bursts = [];
  window.fxBurst = (clientX, clientY) => {
    if (reduced) return;
    for (let i = 0; i < 46; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (2 + Math.random() * 6) * DPR;
      bursts.push({
        x: clientX * DPR, y: clientY * DPR,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2 * DPR,
        r: (2 + Math.random() * 4) * DPR,
        life: 1, decay: 0.012 + Math.random() * 0.02,
        hue: 110 + Math.random() * 60,
      });
    }
  };

  let t = 0;
  function frame() {
    t++;
    ctx.clearRect(0, 0, W, H);

    // dym
    for (const s of smoke) {
      s.wob += s.wobSpd;
      s.x += s.vx + Math.sin(s.wob) * 0.3 * DPR;
      s.y -= s.vy;
      // odpychanie od kursora
      const dx = s.x - pointer.x, dy = s.y - pointer.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 240 * 240 * DPR * DPR && d2 > 1) {
        const d = Math.sqrt(d2), f = (240 * DPR - d) / (240 * DPR) * 1.6;
        s.x += dx / d * f; s.y += dy / d * f;
      }
      if (s.y < -s.r * 2) Object.assign(s, newSmoke({ fromBottom: true }));
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
      g.addColorStop(0, `hsla(${s.hue},60%,45%,${s.o})`);
      g.addColorStop(1, 'hsla(140,60%,30%,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
    }

    // świetliki
    for (const sp of spores) {
      sp.ph += 0.03;
      sp.y -= sp.vy;
      sp.x += Math.sin(sp.ph) * 0.4 * DPR;
      if (sp.y < -10) { sp.y = H + 10; sp.x = Math.random() * W; }
      const tw = 0.4 + Math.sin(sp.ph * 2) * 0.35;
      ctx.fillStyle = `hsla(120,90%,70%,${tw * 0.7})`;
      ctx.shadowColor = 'hsla(130,90%,65%,.9)';
      ctx.shadowBlur = 8 * DPR;
      ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r, 0, 7); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // eksplozje
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.x += b.vx; b.y += b.vy;
      b.vy += 0.08 * DPR; b.vx *= 0.985;
      b.life -= b.decay;
      if (b.life <= 0) { bursts.splice(i, 1); continue; }
      ctx.fillStyle = `hsla(${b.hue},85%,62%,${b.life})`;
      ctx.shadowColor = `hsla(${b.hue},90%,60%,.9)`;
      ctx.shadowBlur = 12 * DPR;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r * b.life, 0, 7); ctx.fill();
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(frame);
  }
  if (!reduced || true) frame();

  /* --- tilt 3D kart --- */
  if (!reduced && matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        card.style.transform =
          `perspective(900px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) translateY(-2px)`;
        card.style.setProperty('--mx', (px * 100 + 50) + '%');
        card.style.setProperty('--my', (py * 100 + 50) + '%');
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* --- ripple na przyciskach --- */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn,.chip,.method');
    if (!btn || reduced) return;
    const r = btn.getBoundingClientRect();
    const rip = document.createElement('span');
    rip.className = 'ripple';
    const size = Math.max(r.width, r.height) * 2;
    rip.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    btn.appendChild(rip);
    setTimeout(() => rip.remove(), 650);
  });

  /* --- animowane liczniki --- */
  const counters = new Map();
  window.fxCountTo = (el, val) => {
    if (typeof val !== 'number' || isNaN(val)) { el.textContent = val; return; }
    const from = counters.get(el) || 0;
    counters.set(el, val);
    if (reduced || from === val) { el.textContent = val; return; }
    const start = performance.now(), dur = 500;
    (function step(now) {
      const k = Math.min(1, (now - start) / dur);
      const ease = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (val - from) * ease);
      if (k < 1) requestAnimationFrame(step);
    })(start);
  };
})();
