/* ===== FX: dym, cząsteczki, eksplozje, tilt, ripple ===== */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===== FEEL APLIKACJI: blokada pinch-zoom i double-tap zoom ===== */
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(ev =>
    document.addEventListener(ev, e => e.preventDefault(), { passive: false }));

  document.addEventListener('touchstart', e => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  let lastTap = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    const onControl = e.target instanceof Element &&
      e.target.closest('button,a,input,textarea,select,label,.method,.chip,.btn');
    if (now - lastTap < 320 && !onControl) e.preventDefault();
    lastTap = now;
  }, { passive: false });

  const canvas = document.getElementById('fx');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

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
    for (let i = 0; i < 22; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (2 + Math.random() * 3) * DPR;
      bursts.push({
        x: clientX * DPR, y: clientY * DPR,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1 * DPR,
        r: (2.2 + Math.random() * 2.6) * DPR,
        life: 1, decay: 0.013 + Math.random() * 0.016,
        hue: 118 + Math.random() * 30,
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
      b.vy += 0.05 * DPR; b.vx *= 0.98;
      b.life -= b.decay;
      if (b.life <= 0) { bursts.splice(i, 1); continue; }
      ctx.fillStyle = `hsla(${b.hue},80%,58%,${b.life * 0.8})`;
      ctx.shadowColor = `hsla(${b.hue},85%,55%,.7)`;
      ctx.shadowBlur = 9 * DPR;
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

  /* ===== PRZEWIJANIE: karty płyną ===== */
  if (!reduced) {
    const items = [...document.querySelectorAll('.card')]
      .map(el => ({ el, ty: 34, op: 0, sc: 0.96 }));
    let raf = 0;

    // stan startowy synchronicznie, żeby nie było mignięcia
    for (const c of items) {
      c.el.style.translate = '0 34px';
      c.el.style.opacity = '0';
      c.el.style.scale = '0.96';
    }

    function step() {
      const H = innerHeight || 1;
      let moving = false;
      for (const c of items) {
        const top = c.el.getBoundingClientRect().top;
        let p = (H - top) / (H * 0.62);
        p = p < 0 ? 0 : p > 1 ? 1 : p;
        const e = p * p * (3 - 2 * p);          // smoothstep
        const tyT = (1 - e) * 34;
        const opT = 0.2 + e * 0.8;
        const scT = 0.96 + e * 0.04;
        c.ty += (tyT - c.ty) * 0.18;            // wygładzenie -> "płynięcie"
        c.op += (opT - c.op) * 0.18;
        c.sc += (scT - c.sc) * 0.18;
        if (Math.abs(tyT - c.ty) > 0.05 || Math.abs(opT - c.op) > 0.002 ||
            Math.abs(scT - c.sc) > 0.0005) moving = true;
        c.el.style.translate = '0 ' + c.ty.toFixed(2) + 'px';
        c.el.style.opacity = c.op.toFixed(3);
        c.el.style.scale = c.sc.toFixed(4);
      }
      raf = moving ? requestAnimationFrame(step) : 0;
    }

    const kick = () => { if (!raf) raf = requestAnimationFrame(step); };
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', kick);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
    new ResizeObserver(kick).observe(document.body);
    kick();
  }
})();
