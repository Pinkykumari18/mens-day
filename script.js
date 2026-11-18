(() => {
  'use strict';

  /* ---------- config + helpers ---------- */
  const CFG = Object.assign(
    { title: "Happy International Men's Day", date: '19 November', from: '' },
    window.CONFIG || {}
  );
  const MEN = window.MEN || [];
  const $ = (s, r = document) => r.querySelector(s);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const vib = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* ignore */ } };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const firstName = n => String(n).trim().split(/\s+/)[0];
  const initials = n => String(n).trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

  let current = null;        // selected person
  let photoURL = null;       // resolved photo path (or null)
  let photoPromise = null;
  let runId = 0;             // lets "Replay" cancel an animation that is still running

  /* ---------- photo loading (tries jpg / jpeg / png / webp) ---------- */
  function photoList(m) {
    const base = m.photo || `photos/${m.id}`;
    if (/\.(jpe?g|png|webp|avif|gif)$/i.test(base)) return [base];
    return ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG', 'WEBP'].map(e => `${base}.${e}`);
  }
  function loadPhoto(m) {
    const list = photoList(m);
    return new Promise(resolve => {
      let i = 0;
      const next = () => {
        if (i >= list.length) return resolve(null);
        const url = list[i++];
        const im = new Image();
        im.onload = () => resolve(url);
        im.onerror = next;
        im.src = url;
      };
      next();
    });
  }

  /* ---------- floating gold sparkles (background) ---------- */
  function startBackground() {
    const c = $('#bg'), x = c.getContext('2d');
    let W, H, dpr;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = c.width = innerWidth * dpr;
      H = c.height = innerHeight * dpr;
    };
    resize();
    addEventListener('resize', resize);
    const make = init => ({
      x: Math.random() * W,
      y: init ? Math.random() * H : H + 10,
      r: (Math.random() * 1.8 + 0.5) * dpr,
      v: (Math.random() * 0.3 + 0.1) * dpr,
      a: Math.random() * Math.PI * 2,
      s: Math.random() * 0.02 + 0.01
    });
    const ps = Array.from({ length: reduce ? 20 : 60 }, () => make(true));
    (function loop() {
      x.clearRect(0, 0, W, H);
      x.fillStyle = '#c9a45c';
      for (const p of ps) {
        p.y -= p.v; p.a += p.s;
        if (p.y < -10) Object.assign(p, make(false));
        x.globalAlpha = 0.2 + 0.45 * Math.abs(Math.sin(p.a));
        x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.283); x.fill();
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- confetti ---------- */
  const fx = $('#fx'), fctx = fx.getContext('2d');
  let parts = [], fxRunning = false, FW = 0, FH = 0, fdpr = 1;
  function fxResize() {
    fdpr = Math.min(window.devicePixelRatio || 1, 2);
    FW = fx.width = innerWidth * fdpr;
    FH = fx.height = innerHeight * fdpr;
  }
  fxResize();
  addEventListener('resize', fxResize);
  const COLORS = ['#c9a45c', '#ecd596', '#f6ecd6', '#d9344f', '#3f8f5c', '#e8cf8f', '#ffffff'];

  function burst(px, py, n = 80, o = {}) {
    const spread = o.spread == null ? Math.PI * 2 : o.spread;
    const angle = o.angle == null ? -Math.PI / 2 : o.angle;
    const power = o.power || 14;
    if (reduce) n = Math.min(n, 18);
    for (let i = 0; i < n; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const v = (Math.random() * 0.6 + 0.4) * power * fdpr;
      parts.push({
        x: px * fdpr, y: py * fdpr,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        w: (Math.random() * 6 + 5) * fdpr, h: (Math.random() * 4 + 3) * fdpr,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        life: 1, round: Math.random() < 0.25
      });
    }
    if (!fxRunning) { fxRunning = true; requestAnimationFrame(tick); }
  }
  function tick() {
    fctx.clearRect(0, 0, FW, FH);
    for (const p of parts) {
      p.vy += 0.35 * fdpr; p.vx *= 0.992;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.008;
      fctx.save();
      fctx.globalAlpha = Math.max(p.life, 0);
      fctx.translate(p.x, p.y); fctx.rotate(p.rot);
      fctx.fillStyle = p.c;
      if (p.round) { fctx.beginPath(); fctx.arc(0, 0, p.h / 1.4, 0, 6.283); fctx.fill(); }
      else fctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      fctx.restore();
    }
    parts = parts.filter(p => p.life > 0 && p.y < FH + 60);
    if (parts.length) requestAnimationFrame(tick);
    else { fxRunning = false; fctx.clearRect(0, 0, FW, FH); }
  }
  function rain(ms = 2800) {
    const t0 = Date.now();
    const id = setInterval(() => {
      burst(Math.random() * innerWidth, -10, 10, { spread: 0.8, angle: Math.PI / 2, power: 4 });
      if (Date.now() - t0 > ms) clearInterval(id);
    }, 130);
  }

  /* ---------- run context: lets Replay cancel an old run ---------- */
  function makeCtx() {
    const id = ++runId;
    return { wait: async ms => { await sleep(ms); if (id !== runId) throw 'cancel'; } };
  }

  /* ---------- typewriter (reserves final layout so nothing jumps) ---------- */
  async function typeInto(el, text, speed, ctx) {
    if (reduce) { el.textContent = text; return; }
    el.innerHTML = '<span class="t"></span><span class="typing-h"></span>';
    const t = el.firstChild, h = el.lastChild;
    for (let i = 0; i <= text.length; i++) {
      t.textContent = text.slice(0, i);
      h.textContent = text.slice(i);
      if (i < text.length) await (ctx ? ctx.wait(speed) : sleep(speed));
    }
    el.textContent = text;
  }

  /* ================= SCENES ================= */

  // 1) Gift box shakes, opens, confetti
  async function gift(man, ctx, el) {
    el.className = 'scene sc-gift';
    el.innerHTML =
      '<div class="rays"></div>' +
      '<div class="gift"><div class="gift-lid"></div><div class="gift-box"></div></div>' +
      '<p class="hint">Something special is waiting for you</p>';
    const g = $('.gift', el), rays = $('.rays', el), hint = $('.hint', el);
    await ctx.wait(1200);
    g.classList.add('shake'); vib([30, 40, 30, 40, 30]);
    await ctx.wait(1500);
    g.classList.add('open'); rays.classList.add('on');
    hint.textContent = 'Surprise!';
    vib(60);
    burst(innerWidth / 2, innerHeight / 2, 130, { power: 17 });
    await ctx.wait(1700);
  }

  // 2) Curtains open on a spotlight
  async function curtain(man, ctx, el) {
    el.className = 'scene sc-curtain';
    el.innerHTML =
      '<div class="curtain left"></div><div class="curtain right"></div><div class="pelmet"></div><div class="spot"></div>' +
      '<div class="present"><div class="small">Ladies and gentlemen</div><div class="big">Presenting</div>' +
      '<div class="who">' + esc(firstName(man.name)) + '</div></div>';
    await ctx.wait(3100);
    el.classList.add('opened'); vib(40);
    await ctx.wait(2300);
  }

  // 3) Scan progress, 3-2-1, flash + confetti
  async function countdown(man, ctx, el) {
    el.className = 'scene sc-count';
    el.innerHTML =
      '<div class="cd-wrap"><svg class="cd-svg" viewBox="0 0 120 120"><circle class="trk" cx="60" cy="60" r="52"/><circle class="prg" cx="60" cy="60" r="52"/></svg>' +
      '<div class="cd-num">0%</div></div><p class="cd-msg">Scanning your code...</p><div class="flash"></div>';
    const prg = $('.prg', el), num = $('.cd-num', el), msg = $('.cd-msg', el);
    const C = 2 * Math.PI * 52;
    prg.style.strokeDasharray = C; prg.style.strokeDashoffset = C;
    const msgs = ['Scanning your code...', 'Verifying legend status...', 'Loading your wishes...', 'Awesomeness confirmed'];
    const T = 2600, t0 = performance.now();
    await new Promise(res => {
      (function f(now) {
        const p = Math.min((now - t0) / T, 1);
        prg.style.strokeDashoffset = C * (1 - p);
        num.textContent = Math.round(p * 100) + '%';
        msg.textContent = msgs[Math.min(3, Math.floor(p * 4))];
        if (p < 1) requestAnimationFrame(f); else res();
      })(t0);
    });
    await ctx.wait(300);
    msg.textContent = 'Get ready...';
    num.classList.add('digit');
    for (const n of [3, 2, 1]) {
      num.textContent = n;
      num.classList.remove('pop'); void num.offsetWidth; num.classList.add('pop');
      vib(25);
      await ctx.wait(800);
    }
    $('.flash', el).classList.add('go');
    vib(80);
    burst(0, innerHeight * 0.75, 90, { angle: -1.0, spread: 0.9, power: 21 });
    burst(innerWidth, innerHeight * 0.75, 90, { angle: -Math.PI + 1.0, spread: 0.9, power: 21 });
    await ctx.wait(800);
  }

  // 4) Polaroid drops in, photo develops, caption is written, hearts float
  function floater(host) {
    const colors = ['#d9344f', '#c9a45c', '#f6ecd6', '#ecd596'];
    const size = 14 + Math.random() * 22;
    const ns = 'http://www.w3.org/2000/svg';
    const s = document.createElementNS(ns, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', size); s.setAttribute('height', size);
    const p = document.createElementNS(ns, 'path');
    const star = Math.random() < 0.35;
    p.setAttribute('d', star
      ? 'M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.2l7.1-.6z'
      : 'M12 21s-7.5-4.6-9.6-9.4C.9 8.3 2.8 4.5 6.4 4.5c2.1 0 3.8 1.1 5.6 3.2 1.8-2.1 3.5-3.2 5.6-3.2 3.6 0 5.5 3.8 4 7.1C19.5 16.4 12 21 12 21z');
    p.setAttribute('fill', colors[(Math.random() * colors.length) | 0]);
    s.appendChild(p);
    s.style.left = (Math.random() * 92) + '%';
    s.style.animationDuration = (3.2 + Math.random() * 2.4) + 's';
    host.appendChild(s);
    setTimeout(() => s.remove(), 6000);
  }
  async function polaroid(man, ctx, el) {
    await Promise.race([photoPromise, sleep(2000)]);
    el.className = 'scene sc-pol';
    const inner = photoURL
      ? '<img src="' + esc(photoURL) + '" alt="">'
      : '<div class="pol-ini">' + esc(initials(man.name)) + '</div>';
    el.innerHTML =
      '<div class="pol"><div class="tape"></div><div class="pol-img">' + inner + '</div><div class="pol-cap"></div></div>' +
      '<div class="floaters"></div>';
    const pol = $('.pol', el), cap = $('.pol-cap', el), host = $('.floaters', el);
    await ctx.wait(150);
    pol.classList.add('drop');
    await ctx.wait(1400);
    pol.classList.add('develop');
    await ctx.wait(1700);
    const hi = setInterval(() => floater(host), 230);
    try {
      await typeInto(cap, "Happy Men's Day, " + firstName(man.name) + '!', 75, ctx);
      vib(50);
      await ctx.wait(1900);
    } finally { clearInterval(hi); }
  }

  const SCENES = { gift, curtain, countdown, polaroid };

  /* ================= REVEAL ================= */
  function fillCard(man) {
    $('#eyebrow').textContent = CFG.title;
    $('#name').textContent = man.name;
    const tag = $('#tag'); tag.textContent = man.tag || ''; tag.hidden = !man.tag;
    $('#date').textContent = CFG.date;
    $('#from').textContent = CFG.from ? 'With love, ' + CFG.from : '';
    const img = $('#photo'), ini = $('#initials');
    if (photoURL) { img.src = photoURL; img.alt = man.name; img.hidden = false; ini.hidden = true; }
    else { img.hidden = true; ini.hidden = false; ini.textContent = initials(man.name); }
    document.title = "Happy Men's Day, " + firstName(man.name) + '!';
  }

  async function showReveal(man, ctx) {
    await Promise.race([photoPromise, sleep(2500)]);
    fillCard(man);
    const rev = $('#reveal'), wish = $('#wish');
    wish.textContent = ''; wish.classList.remove('typing');
    wish.classList.toggle('long', man.wish.length > 300);
    rev.hidden = false;
    void rev.offsetWidth;
    rev.classList.add('show');
    window.scrollTo(0, 0);
    vib([60, 40, 60]);
    burst(innerWidth / 2, innerHeight * 0.33, 120, { power: 15 });
    rain(3000);
    await ctx.wait(1500);
    wish.classList.add('typing');
    await typeInto(wish, man.wish, Math.min(30, 7000 / man.wish.length), ctx);
    wish.classList.remove('typing');
  }

  async function play(man) {
    const ctx = makeCtx();
    const sceneEl = $('#scene'), rev = $('#reveal');
    rev.hidden = true; rev.classList.remove('show');
    $('#wish').textContent = '';
    sceneEl.hidden = false; sceneEl.className = 'scene'; sceneEl.innerHTML = '';
    try {
      const forced = new URLSearchParams(location.search).get('scene');
      const fn = SCENES[forced] || SCENES[man.scene] || gift;
      if (!reduce) {
        await ctx.wait(200);
        await fn(man, ctx, sceneEl);
        sceneEl.classList.add('out');
        await ctx.wait(750);
      }
      sceneEl.hidden = true;
      await showReveal(man, ctx);
    } catch (e) {
      if (e !== 'cancel') console.error(e);
    }
  }

  /* ================= SAVE CARD AS IMAGE ================= */
  function rrect(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }
  function wrapText(g, text, max) {
    const lines = [];
    text.split('\n').forEach((para, pi) => {
      if (pi > 0 && text.length > 300) lines.push('');
      let line = '';
      for (const w of para.split(' ')) {
        const t = line ? line + ' ' + w : w;
        if (g.measureText(t).width > max && line) { lines.push(line); line = w; } else line = t;
      }
      if (line) lines.push(line);
    });
    return lines;
  }
  const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

  async function saveCard(man) {
    try {
      await Promise.all([
        document.fonts.load('700 40px "Playfair Display"'),
        document.fonts.load('italic 600 40px "Cormorant Garamond"'),
        document.fonts.load('400 30px "Libre Baskerville"')
      ]);
    } catch (e) { /* fonts optional */ }

    const W = 1080, c = document.createElement('canvas');
    const long = man.wish.length > 300;
    const fs = long ? 34 : 52, lh = long ? 44 : 64;
    const WISHFONT = 'italic 600 ' + fs + 'px "Cormorant Garamond", Georgia, serif';
    const mg = document.createElement('canvas').getContext('2d');
    mg.font = WISHFONT;
    const lines = wrapText(mg, man.wish, long ? 900 : 820).slice(0, long ? 60 : 5);
    const H = Math.max(1500, 1125 + lines.length * lh + 170);
    c.width = W; c.height = H;
    const g = c.getContext('2d');

    const SERIF = '"Playfair Display", Georgia, serif', BODY = '"Libre Baskerville", Georgia, serif';
    const bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#2a2216'); bg.addColorStop(1, '#070504');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);

    g.strokeStyle = '#c9a45c'; g.lineWidth = 6; rrect(g, 40, 40, W - 80, H - 80, 14); g.stroke();
    g.strokeStyle = 'rgba(201,164,92,.6)'; g.lineWidth = 2; rrect(g, 62, 62, W - 124, H - 124, 8); g.stroke();

    // full (uncropped) photo, fitted inside a 820 x 660 box and centred in a gold frame
    const cx = W / 2, boxW = 820, boxH = 660, boxTop = 120;
    let drew = false;
    if (photoURL) {
      try {
        const im = await loadImg(photoURL);
        const s = Math.min(boxW / im.width, boxH / im.height);
        const dw = Math.round(im.width * s), dh = Math.round(im.height * s);
        const dx = Math.round(cx - dw / 2), dy = Math.round(boxTop + (boxH - dh) / 2);
        const grad = g.createLinearGradient(dx, dy, dx + dw, dy + dh);
        grad.addColorStop(0, '#ecd596'); grad.addColorStop(0.5, '#c9a45c'); grad.addColorStop(1, '#9a7430');
        g.fillStyle = grad; rrect(g, dx - 16, dy - 16, dw + 32, dh + 32, 10); g.fill();
        g.fillStyle = '#120f0a'; g.fillRect(dx - 4, dy - 4, dw + 8, dh + 8);
        g.drawImage(im, dx, dy, dw, dh);
        drew = true;
      } catch (e) { /* fall through */ }
    }
    if (!drew) {
      const dw = 520, dh = 620, dx = cx - dw / 2, dy = boxTop + (boxH - dh) / 2;
      g.fillStyle = '#c9a45c'; rrect(g, dx - 16, dy - 16, dw + 32, dh + 32, 10); g.fill();
      g.fillStyle = '#2a2319'; g.fillRect(dx, dy, dw, dh);
      g.fillStyle = '#d8b970'; g.font = '700 150px ' + SERIF; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(initials(man.name), cx, dy + dh / 2 + 8);
    }

    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.fillStyle = '#c9a45c'; g.font = '400 24px ' + BODY;
    if ('letterSpacing' in g) g.letterSpacing = '7px';
    g.fillText(CFG.title.toUpperCase(), cx, 872);
    if ('letterSpacing' in g) g.letterSpacing = '1px';

    g.fillStyle = '#f6ecd6'; g.font = '700 84px ' + SERIF;
    g.fillText(man.name, cx, 972);

    if (man.tag) {
      g.font = 'italic 400 30px ' + BODY; g.fillStyle = '#ecd596';
      g.fillText(man.tag, cx, 1030);
    }
    if ('letterSpacing' in g) g.letterSpacing = '0px';

    g.fillStyle = '#f6ecd6'; g.font = WISHFONT;
    lines.forEach((l, i) => g.fillText(l, cx, 1125 + i * lh));

    g.fillStyle = '#b9a889'; g.font = '400 24px ' + BODY;
    g.fillText((CFG.from ? 'With love, ' + CFG.from + '   -   ' : '') + CFG.date, cx, H - 98);

    c.toBlob(b => {
      if (!b) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'mens-day-' + firstName(man.name).toLowerCase() + '.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    }, 'image/png');
  }

  /* ================= INIT ================= */
  function init() {
    startBackground();
    const params = new URLSearchParams(location.search);
    const id = (params.get('id') || params.get('m') || '').trim().toLowerCase();
    const man = MEN.find(m => String(m.id).toLowerCase() === id);
    if (!man) {
      $('#scene').hidden = true;
      $('#missing').hidden = false;
      if (MEN[0]) $('#demo-link').href = '?id=' + encodeURIComponent(MEN[0].id);
      else $('#demo-link').hidden = true;
      return;
    }
    current = man;
    photoPromise = loadPhoto(man).then(u => (photoURL = u));
    $('#b-save').addEventListener('click', () => saveCard(current));
    play(man);
  }
  init();
})();
