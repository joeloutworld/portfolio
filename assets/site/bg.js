/* the page's moving ground: a slow grid and a drifting node network with pulses running along its links */
(() => {
  const c = document.createElement('canvas');
  c.className = 'bg-net'; c.setAttribute('aria-hidden', 'true');
  document.body.prepend(c);
  const x = c.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const L = 150, G = 64;
  let w, h, pts = [], pulses = [];
  function size() {
    const d = Math.min(devicePixelRatio || 1, 1.5);
    w = innerWidth; h = innerHeight;
    c.width = w * d; c.height = h * d; x.setTransform(d, 0, 0, d, 0, 0);
    const n = Math.min(90, Math.round(w * h / 22000));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .2, vy: (Math.random() - .5) * .2 }));
    pulses = [];
  }
  function draw(t) {
    x.clearRect(0, 0, w, h);
    const o = (t * .008) % G;
    x.lineWidth = 1; x.strokeStyle = 'rgba(159,199,184,.045)'; x.beginPath();
    for (let X = -o; X < w; X += G) { x.moveTo(X, 0); x.lineTo(X, h); }
    for (let Y = -o; Y < h; Y += G) { x.moveTo(0, Y); x.lineTo(w, Y); }
    x.stroke();
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], dd = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
      if (dd < L * L) {
        x.strokeStyle = `rgba(159,199,184,${.16 * (1 - Math.sqrt(dd) / L)})`;
        x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke();
      }
    }
    x.fillStyle = 'rgba(185,220,207,.55)';
    for (const p of pts) { x.beginPath(); x.arc(p.x, p.y, 1.5, 0, 7); x.fill(); }
    if (pulses.length < 7 && Math.random() < .04 && pts.length) {
      const a = pts[Math.random() * pts.length | 0];
      let b = null, best = L * L;
      for (const q of pts) { const dd = (q.x - a.x) ** 2 + (q.y - a.y) ** 2; if (q !== a && dd < best) { best = dd; b = q; } }
      if (b) pulses.push({ a, b, k: 0 });
    }
    for (const p of pulses) {
      p.k += .018;
      const px = p.a.x + (p.b.x - p.a.x) * p.k, py = p.a.y + (p.b.y - p.a.y) * p.k;
      const g = x.createRadialGradient(px, py, 0, px, py, 9);
      g.addColorStop(0, 'rgba(170,240,210,.95)'); g.addColorStop(1, 'rgba(170,240,210,0)');
      x.fillStyle = g; x.beginPath(); x.arc(px, py, 9, 0, 7); x.fill();
    }
    pulses = pulses.filter(p => p.k < 1);
  }
  function loop(t) { if (!document.hidden) draw(t); requestAnimationFrame(loop); }
  size();
  let r; addEventListener('resize', () => { clearTimeout(r); r = setTimeout(() => { size(); if (still) draw(0); }, 150); });
  if (still) draw(0); else requestAnimationFrame(loop);
})();

/* the workflow carousel: the open card faces front, the rest turn away on a ring; the front one's text below */
(() => {
  const root = document.querySelector('.wf3d');
  if (!root) return;
  const cards = [...root.querySelectorAll('.wf3d__card')];
  const name = root.querySelector('.wf3d__name'), text = root.querySelector('.wf3d__text');
  const dots = [...root.querySelectorAll('.wf3d__dot')];
  const n = cards.length;
  let cur = 0;
  function show(i) {
    cur = (i + n) % n;
    cards.forEach((c, k) => {
      let o = k - cur;
      if (o > n / 2) o -= n;
      if (o < -n / 2) o += n;
      c.style.setProperty('--o', o);
      c.style.setProperty('--ao', Math.abs(o));
      c.classList.toggle('is-on', o === 0);
      c.tabIndex = o === 0 ? 0 : -1;
      c.setAttribute('aria-hidden', o !== 0);
    });
    dots.forEach((d, k) => d.setAttribute('aria-current', k === cur));
    name.textContent = cards[cur].dataset.name;
    text.textContent = cards[cur].dataset.text;
  }
  cards.forEach((c, k) => c.addEventListener('click', e => { if (k !== cur) { e.preventDefault(); show(k); } }));
  dots.forEach((d, k) => d.addEventListener('click', () => show(k)));
  root.querySelector('.wf3d__prev').addEventListener('click', () => show(cur - 1));
  root.querySelector('.wf3d__next').addEventListener('click', () => show(cur + 1));
  root.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  let sx = null;
  root.addEventListener('pointerdown', e => { sx = e.clientX; });
  root.addEventListener('pointerup', e => { if (sx !== null && Math.abs(e.clientX - sx) > 40) show(cur + (e.clientX < sx ? 1 : -1)); sx = null; });
  show(0);
})();

/* live local time beside the availability pill: Joel's time and New York's */
(() => {
  const el = document.querySelector('[data-clock]');
  if (!el) return;
  const f = tz => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(new Date());
  const tick = () => { el.textContent = `${f('Asia/Manila')} here · ${f('America/New_York')} ET`; };
  tick(); el.hidden = false; setInterval(tick, 30000);
})();

/* numbers count up once when they come into view */
(() => {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(end * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(step); };
    el.textContent = '0'; requestAnimationFrame(step);
  }), { threshold: .6 });
  els.forEach(el => io.observe(el));
})();

/* screen-recording loops: play only while on screen, never under reduced motion (the poster stays) */
(() => {
  const vids = document.querySelectorAll('video[data-loop]');
  if (!vids.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.preload = 'auto'; e.target.play().catch(() => {}); } else e.target.pause();
  }), { threshold: .25 });
  vids.forEach(v => io.observe(v));
})();
