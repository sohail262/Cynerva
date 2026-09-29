/* ==========================================================================
   Cynerva — interaction layer
   Lenis (smooth scroll) · GSAP + ScrollTrigger · molecular particle field
   ========================================================================== */
(function () {
  'use strict';

  if (!window.gsap || !window.ScrollTrigger) { document.documentElement.classList.remove('js'); document.body.classList.remove('is-loading'); var l = document.getElementById('loader'); if (l) l.remove(); return; }
  gsap.registerPlugin(ScrollTrigger);

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const D = window.CYNERVA_DATA;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const body = document.body;

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (!reduce && finePointer && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const scrollTo = (target, o) => {
    if (lenis) lenis.scrollTo(target, Object.assign({ duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) }, o));
    else if (typeof target === 'number') scrollTo_(target); else target.scrollIntoView({ behavior: 'smooth' });
  };
  function scrollTo_(y) { window.scrollTo({ top: y, behavior: 'smooth' }); }

  /* ---------- helpers ---------- */
  function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  /* Split text into word spans. mode 'mask' → clipped wrappers for line-rise reveals. */
  function split(el, mode) {
    const words = [];
    (function walk(node, inEm) {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span'); s.textContent = p;
            if (mode === 'mask') {
              const w = document.createElement('span'); w.className = 'w'; if (inEm) s.className = 'grad';
              w.appendChild(s); frag.appendChild(w);
            } else { s.className = 'sw'; frag.appendChild(s); }
            words.push(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) {
          if (n.tagName === 'EM' && mode === 'mask') n.classList.add('split');
          walk(n, inEm || n.tagName === 'EM');
        }
      });
    })(el, false);
    return words;
  }

  /* Procedural skeletal-formula sketch, seeded by the molecule name. */
  function moleculeSVG(seed, o) {
    o = o || {};
    const R = mulberry(hash(seed)), r = 14, S3 = Math.sqrt(3);
    const nRings = o.rings || (1 + Math.floor(R() * 3));
    const centers = [[0, 0]]; let guard = 0;
    while (centers.length < nRings && guard++ < 60) {
      const b = centers[Math.floor(R() * centers.length)], a = Math.floor(R() * 6) * Math.PI / 3;
      const c = [b[0] + Math.cos(a) * S3 * r, b[1] + Math.sin(a) * S3 * r];
      if (!centers.some((q) => Math.hypot(q[0] - c[0], q[1] - c[1]) < S3 * r * 0.9)) centers.push(c);
    }
    const vmap = new Map(), verts = [], deg = [], seen = new Set(), bonds = [], inner = [];
    const addV = (x, y) => { const k = Math.round(x * 10) + ',' + Math.round(y * 10); if (!vmap.has(k)) { vmap.set(k, verts.length); verts.push([x, y]); deg.push(0); } return vmap.get(k); };
    centers.forEach(([cx, cy], ri) => {
      const ids = [];
      for (let j = 0; j < 6; j++) { const a = Math.PI / 6 + j * Math.PI / 3; ids.push(addV(cx + Math.cos(a) * r, cy + Math.sin(a) * r)); }
      for (let j = 0; j < 6; j++) {
        const a = ids[j], b = ids[(j + 1) % 6], k = a < b ? a + '-' + b : b + '-' + a;
        if (!seen.has(k)) { seen.add(k); bonds.push([verts[a], verts[b]]); deg[a]++; deg[b]++; }
        if (j % 2 === (ri % 2)) {
          const p = verts[a], q = verts[b], m = 0.2;
          const p1 = [p[0] + (cx - p[0]) * m, p[1] + (cy - p[1]) * m], q1 = [q[0] + (cx - q[0]) * m, q[1] + (cy - q[1]) * m];
          const sh = 0.16; inner.push([[p1[0] + (q1[0] - p1[0]) * sh, p1[1] + (q1[1] - p1[1]) * sh], [q1[0] + (p1[0] - q1[0]) * sh, q1[1] + (p1[1] - q1[1]) * sh]]);
        }
      }
    });
    const mx = centers.reduce((s, c) => s + c[0], 0) / centers.length, my = centers.reduce((s, c) => s + c[1], 0) / centers.length;
    const outer = verts.map((v, i) => i).filter((i) => deg[i] === 2).sort(() => R() - 0.5);
    const atoms = []; const nSub = o.subs || (2 + Math.floor(R() * 3));
    const labels = ['N', 'O', 'F', 'N', 'O', 'S', '', 'Cl'];
    for (let s = 0; s < Math.min(nSub, outer.length); s++) {
      const v = verts[outer[s]]; let ang = Math.atan2(v[1] - my, v[0] - mx), cur = v;
      const len = 1 + Math.floor(R() * 2);
      for (let k = 0; k < len; k++) {
        const nx = [cur[0] + Math.cos(ang) * r, cur[1] + Math.sin(ang) * r]; bonds.push([cur, nx]); cur = nx; ang += (R() > .5 ? 1 : -1) * Math.PI / 3;
      }
      atoms.push({ x: cur[0], y: cur[1], t: labels[Math.floor(R() * labels.length)] });
    }
    const pts = verts.concat(atoms.map((a) => [a.x, a.y]));
    const minx = Math.min(...pts.map((p) => p[0])) - 12, maxx = Math.max(...pts.map((p) => p[0])) + 12;
    const miny = Math.min(...pts.map((p) => p[1])) - 12, maxy = Math.max(...pts.map((p) => p[1])) + 12;
    const w = maxx - minx, h = maxy - miny, f = (n) => n.toFixed(1);
    const d = bonds.map((b) => 'M' + f(b[0][0]) + ' ' + f(b[0][1]) + 'L' + f(b[1][0]) + ' ' + f(b[1][1])).join('');
    const di = inner.map((b) => 'M' + f(b[0][0]) + ' ' + f(b[0][1]) + 'L' + f(b[1][0]) + ' ' + f(b[1][1])).join('');
    const at = atoms.map((a) => a.t ? '<circle cx="' + f(a.x) + '" cy="' + f(a.y) + '" r="5" fill="none" stroke="none"/><text x="' + f(a.x) + '" y="' + f(a.y + 2.5) + '" text-anchor="middle">' + a.t + '</text>' : '<circle class="atom" cx="' + f(a.x) + '" cy="' + f(a.y) + '" r="2.4"/>').join('');
    const style = o.k ? ' style="width:' + Math.round(w * o.k) + 'px;height:auto"' : '';
    return '<svg class="mol" viewBox="' + f(minx) + ' ' + f(miny) + ' ' + f(w) + ' ' + f(h) + '"' + style + ' aria-hidden="true"><path class="draw" pathLength="1" d="' + d + '"/><path class="in draw" pathLength="1" d="' + di + '"/>' + at + '</svg>';
  }

  /* ---------- static content builders ---------- */
  const field = window.CynervaField ? window.CynervaField($('#field'), { reduce }) : null;

  // molecule slots in journey panels
  $$('.mol-slot').forEach((el) => {
    el.innerHTML = moleculeSVG(el.dataset.seed, { rings: +el.dataset.rings, subs: 3, k: 4.6 });
    const svg = el.firstElementChild; svg.classList.add('vis'); svg.style.width = 'min(78%, 360px)';
    el.style.display = 'contents';
  });

  // marquee rows
  const focus = ['Niche APIs', 'Complex Molecules', 'Process Development', 'Commercial Manufacturing', 'Global Supply'];
  const rows = $$('.marquee__row').map((row) => {
    const html = focus.map((t) => '<span class="marquee__item">' + t + '<i></i></span>').join('');
    row.innerHTML = html + html;
    return { el: row, dir: +row.dataset.dir, x: 0, half: 0 };
  });
  const measureRows = () => rows.forEach((r) => { r.half = r.el.scrollWidth / 2; if (r.dir > 0 && !r.x) r.x = -r.half * 0.35; });

  // nav rail
  const chapters = $$('[data-chapter]');
  const rail = $('#rail');
  chapters.forEach((s, i) => {
    const a = document.createElement('a'); a.href = '#' + s.id; a.setAttribute('data-link', ''); a.innerHTML = '<span>' + String(i).padStart(2, '0') + ' ' + s.dataset.chapter + '</span>';
    rail.appendChild(a);
  });
  const railLinks = $$('a', rail);

  /* ---------- portfolio ---------- */
  const items = D.items;
  const stageOrder = ['developed', 'development', 'validation', 'planned'];
  const countBy = (fn) => items.filter(fn).length;
  const st = { stage: 'all', area: 'all', q: '' };
  const grid = $('#grid');

  const statVals = {
    'all-apis': countBy((i) => i.stage !== 'intermediate'),
    developed: countBy((i) => i.stage === 'developed'),
    intermediate: countBy((i) => i.stage === 'intermediate'),
    pipeline: countBy((i) => i.stage === 'development' || i.stage === 'validation')
  };

  const pipeBar = $('#pipeBar');
  stageOrder.forEach((k) => {
    const b = document.createElement('button'); b.className = 'pipe__seg'; b.dataset.stage = k; b.setAttribute('data-link', '');
    b.style.setProperty('--n', countBy((i) => i.stage === k)); b.setAttribute('aria-label', 'Filter: ' + D.stages[k].label);
    b.innerHTML = '<b>' + countBy((i) => i.stage === k) + '</b><span>' + D.stages[k].label + '</span>';
    b.addEventListener('click', () => setStage(st.stage === k ? 'all' : k));
    pipeBar.appendChild(b);
  });

  const stageChips = $('#stageChips'), areaChips = $('#areaChips');
  function chip(host, key, label, n, on) {
    const c = document.createElement('button'); c.className = 'chip' + (on ? ' is-on' : ''); c.dataset.key = key; c.setAttribute('data-link', '');
    c.innerHTML = label + '<small>' + n + '</small>'; host.appendChild(c); return c;
  }
  chip(stageChips, 'all', 'All', items.length, true);
  ['developed', 'development', 'validation', 'planned', 'intermediate'].forEach((k) => chip(stageChips, k, k === 'intermediate' ? 'Intermediates' : D.stages[k].label.replace(' APIs', ''), countBy((i) => i.stage === k)));
  chip(areaChips, 'all', 'All areas', items.length, true);
  Object.keys(D.areas).forEach((k) => chip(areaChips, k, D.areas[k], countBy((i) => i.area === k)));
  stageChips.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) setStage(c.dataset.key); });
  areaChips.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) { st.area = c.dataset.key; $$('.chip', areaChips).forEach((x) => x.classList.toggle('is-on', x === c)); applyFilter(); } });
  $('#q').addEventListener('input', (e) => { st.q = e.target.value.trim().toLowerCase(); applyFilter(); });

  function setStage(k) {
    st.stage = k;
    $$('.chip', stageChips).forEach((x) => x.classList.toggle('is-on', x.dataset.key === k));
    $$('.pipe__seg').forEach((x) => x.classList.toggle('is-on', x.dataset.stage === k));
    $('#pipe').classList.toggle('is-filtering', stageOrder.indexOf(k) > -1);
    applyFilter();
  }

  const cards = items.map((it) => {
    const el = document.createElement('article');
    el.className = 'card'; el.dataset.stage = it.stage; el.setAttribute('role', 'button'); el.tabIndex = 0;
    const no = it.stage === 'intermediate' ? 'INT-' + String(it.n).padStart(2, '0') : String(it.n).padStart(2, '0');
    el.setAttribute('aria-label', it.name + ' — ' + it.ind);
    el.innerHTML =
      '<div class="card__top"><span class="card__no">' + no + '</span><span class="card__stage">' + (it.stage === 'intermediate' ? 'Intermediate' : D.stages[it.stage].label.replace(' APIs', '')) + '</span></div>' +
      '<div class="card__mol">' + moleculeSVG(it.name + (it.v || ''), { k: 1.75 }) + '</div>' +
      '<h3 class="card__name">' + it.name + '</h3>' +
      '<p class="card__ind">' + it.ind + '</p>' +
      '<div class="card__area"><span>' + D.areas[it.area] + '</span><i>→</i></div>';
    el._item = it; el._no = no;
    el.addEventListener('click', () => openModal(el));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(el); } });
    if (finePointer && !reduce) {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', (px * 100) + '%'); el.style.setProperty('--my', (py * 100) + '%');
        gsap.to(el, { transformPerspective: 900, rotateY: (px - .5) * 9, rotateX: -(py - .5) * 9, duration: .6, ease: 'power3.out', overwrite: 'auto' });
      });
      el.addEventListener('pointerleave', () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: .9, ease: 'power3.out', overwrite: 'auto' }));
    }
    grid.appendChild(el);
    return el;
  });
  const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = 'No molecules match this filter.'; empty.hidden = true; grid.appendChild(empty);
  const countEl = $('#count');
  let filterTimer;

  function applyFilter() {
    const before = new Map();
    cards.forEach((c) => { if (!c.hidden) before.set(c, c.getBoundingClientRect()); });
    const show = [], hide = [];
    cards.forEach((c) => {
      const it = c._item;
      const ok = (st.stage === 'all' || it.stage === st.stage) && (st.area === 'all' || it.area === st.area) && (!st.q || (it.name + ' ' + it.ind + ' ' + D.areas[it.area]).toLowerCase().indexOf(st.q) > -1);
      (ok ? show : hide).push(c);
    });
    countEl.textContent = show.length + ' / ' + items.length + ' molecules';
    const leaving = hide.filter((c) => !c.hidden);
    const proceed = () => {
      leaving.forEach((c) => { c.hidden = true; });
      show.forEach((c) => { c.hidden = false; });
      empty.hidden = show.length > 0;
      show.forEach((c, i) => {
        const b = before.get(c);
        if (b && !reduce) {
          const a = c.getBoundingClientRect(), dx = b.left - a.left, dy = b.top - a.top;
          if (Math.abs(dx) > 1 || Math.abs(dy) > 1) gsap.fromTo(c, { x: dx, y: dy, opacity: 1, scale: 1 }, { x: 0, y: 0, duration: .95, ease: 'expo.out', clearProps: 'x,y,scale' });
          else gsap.set(c, { opacity: 1, scale: 1 });
        } else if (!reduce) gsap.fromTo(c, { opacity: 0, scale: .92, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: .9, delay: .08 + Math.min(i, 14) * .03, ease: 'expo.out', clearProps: 'y,scale' });
        else gsap.set(c, { opacity: 1 });
      });
      clearTimeout(filterTimer); filterTimer = setTimeout(() => ScrollTrigger.refresh(), 1100);
    };
    if (leaving.length && !reduce) gsap.to(leaving, { opacity: 0, scale: .94, duration: .22, ease: 'power2.in', onComplete: proceed });
    else proceed();
  }
  countEl.textContent = items.length + ' / ' + items.length + ' molecules';

  /* ---------- modal ---------- */
  const modal = $('#modal'); let lastFocus = null;
  function openModal(card) {
    const it = card._item;
    lastFocus = card;
    $('#mVis').innerHTML = moleculeSVG(it.name + (it.v || ''), { k: 3.4 });
    $('#mStage').textContent = it.stage === 'intermediate' ? 'Developed intermediate' : D.stages[it.stage].label;
    $('#mName').textContent = it.name; $('#mInd').textContent = it.ind;
    $('#mNo').textContent = card._no; $('#mArea').textContent = D.areas[it.area];
    $('#mStatus').textContent = it.stage === 'intermediate' ? 'Developed intermediate' : D.stages[it.stage].label;
    $('#mCta').href = 'mailto:info@cynerva.in?subject=' + encodeURIComponent('Enquiry: ' + it.name) + '&body=' + encodeURIComponent('Hello Cynerva team,\n\nI would like to know more about ' + it.name + ' (' + it.ind + ').\n\n');
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop(); else body.style.overflow = 'hidden';
    gsap.to('#modalBack', { opacity: 1, duration: .5 });
    gsap.fromTo('#modalBox', { opacity: 0, y: 50, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .8, ease: 'expo.out' });
    gsap.fromTo('#mVis .mol path', { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', delay: .2 });
    $('#modalClose').focus({ preventScroll: true });
  }
  function closeModal() {
    if (!modal.classList.contains('is-open')) return;
    gsap.to('#modalBack', { opacity: 0, duration: .4 });
    gsap.to('#modalBox', { opacity: 0, y: 30, duration: .4, ease: 'power2.in', onComplete: () => {
      modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true');
      if (lenis) lenis.start(); else body.style.overflow = '';
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    } });
  }
  $('#modalClose').addEventListener('click', closeModal); $('#modalBack').addEventListener('click', closeModal);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeMenu(); } });

  /* ---------- menu ---------- */
  const burger = $('#burger'), menu = $('#menu');
  function closeMenu() { if (!menu.classList.contains('is-open')) return; menu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-hidden', 'true'); if (lenis) lenis.start(); else body.style.overflow = ''; }
  burger.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', open); menu.setAttribute('aria-hidden', !open);
    if (lenis) open ? lenis.stop() : lenis.start(); else body.style.overflow = open ? 'hidden' : '';
  });

  /* ---------- anchors ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href'); const t = id === '#top' ? 0 : $(id); if (t === null || t === undefined) return;
    e.preventDefault(); closeMenu();
    setTimeout(() => scrollTo(t === 0 ? 0 : t, { offset: 0 }), menu.classList.contains('is-open') ? 350 : 0);
  });

  /* ---------- form ---------- */
  $('#form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target, ok = $('#formOk'), v = (n) => f.elements[n].value.trim();
    if (!v('name') || !/^\S+@\S+\.\S+$/.test(v('email')) || !v('interest')) { ok.textContent = 'Please add your name, a valid email and your area of interest.'; ok.classList.add('is-on'); return; }
    const bodyTxt = 'Name: ' + v('name') + '\nCompany: ' + (v('company') || '—') + '\nEmail: ' + v('email') + '\nInterested in: ' + v('interest') + '\n\n' + v('message');
    location.href = 'mailto:info@cynerva.in?subject=' + encodeURIComponent('Enquiry from ' + v('name') + (v('company') ? ' — ' + v('company') : '')) + '&body=' + encodeURIComponent(bodyTxt);
    ok.textContent = 'Opening your email app with your enquiry…'; ok.classList.add('is-on');
  });

  /* ---------- cursor & magnetic ---------- */
  if (finePointer) {
    body.classList.add('has-cursor');
    const cur = $('#cursor'), dot = $('#cursorDot'), ring = $('#cursorRing');
    let x = -100, y = -100, rx = -100, ry = -100;
    addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
    gsap.ticker.add(() => {
      if (Math.abs(x - rx) < .1 && Math.abs(y - ry) < .1 && rx > -99) return;
      rx += (x - rx) * .16; ry += (y - ry) * .16;
      dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    });
    document.addEventListener('pointerover', (e) => {
      const c = e.target.closest('[data-cursor]'), l = e.target.closest('a, button, [data-link], .chip, input, select, textarea');
      cur.classList.toggle('is-hover', !!c); cur.classList.toggle('is-link', !c && !!l);
      ring.textContent = c ? c.dataset.cursor : '';
    });
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .32, y: (e.clientY - r.top - r.height / 2) * .42, duration: .6, ease: 'power3.out' }); });
      el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1,.4)' }));
    });
  }

  /* ---------- scroll-driven scene state (shape, theme, chapter) ---------- */
  const shapeSecs = $$('[data-shape]'), darkSecs = $$('[data-theme="dark"]');
  const navLinks = $$('.nav__links a');
  let isDark = false, activeChap = -1, tick = 0, lastStateY = -1;
  const geo = new Map();
  function measureGeo() {
    const sy = scrollY;
    new Set([].concat(shapeSecs, darkSecs, chapters)).forEach((sec) => { const r = sec.getBoundingClientRect(); geo.set(sec, [r.top + sy, r.bottom + sy]); });
  }
  const inMid = (sec, y, f) => { const g = geo.get(sec); return g && g[0] < y + innerHeight * f && g[1] > y + innerHeight * f; };
  function updateState() {
    const y = scrollY; if (y === lastStateY) return; lastStateY = y;
    let shape = null, dark = false, chap = -1;
    shapeSecs.forEach((sec) => { if (inMid(sec, y, .6)) shape = sec.dataset.shape; });
    darkSecs.forEach((sec) => { const g = geo.get(sec); if (g && g[0] < y + innerHeight * .75 && g[1] > y + innerHeight * .25) dark = true; });
    chapters.forEach((sec, i) => { if (inMid(sec, y, .5)) chap = i; });
    if (shape && field) field.setShape(shape);
    if (dark !== isDark) { isDark = dark; body.classList.toggle('is-dark', dark); if (field) field.setDark(dark); }
    if (chap > -1 && chap !== activeChap) {
      activeChap = chap;
      railLinks.forEach((a, i) => a.classList.toggle('is-active', i === chap));
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + chapters[chap].id));
    }
    const heroOff = y > innerHeight * 1.2;
    if (heroOff !== body.classList.contains('hero-off')) body.classList.toggle('hero-off', heroOff);
  }
  gsap.ticker.add(() => { if (++tick % 6 === 0) updateState(); });
  ScrollTrigger.addEventListener('refresh', () => { measureGeo(); lastStateY = -1; updateState(); });

  /* ---------- marquee motion (only while on screen) ---------- */
  let lastY = scrollY, vel = 0, ts = 1, marqueeOn = false;
  if ('IntersectionObserver' in window) new IntersectionObserver((e) => { marqueeOn = e[0].isIntersecting; }, { rootMargin: '100px' }).observe($('.marquee'));
  else marqueeOn = true;
  gsap.ticker.add((time, dtms) => {
    const dt = Math.min(dtms, 50) / 1000;
    vel += ((scrollY - lastY) - vel) * .12; lastY = scrollY;
    if (!marqueeOn) return;
    ts += ((1 + Math.min(Math.abs(vel) / 6, 5)) - ts) * .08;
    rows.forEach((r) => {
      if (!r.half) return;
      if (!reduce) r.x += r.dir * 56 * ts * dt;
      r.x = ((r.x % r.half) - r.half) % r.half;
      r.el.style.transform = 'translate3d(' + r.x.toFixed(1) + 'px,0,0)';
    });
  });

  /* ---------- capabilities (native horizontal swipe/scroll) ---------- */
  const track = $('#track'), panels = $$('.panel');
  const jbar = $('#jbar'), jlabel = $('#jlabel');
  let centers = [], lastLabel = '', lastBar = -1;
  const measurePanels = () => { centers = panels.map((p) => p.offsetLeft + p.offsetWidth / 2); };
  function updateJourney() {
    if (!centers.length) return;
    const scrollLeft = track.scrollLeft, vw = track.clientWidth || innerWidth;
    let best = -1, bestD = 9;
    panels.forEach((p, i) => {
      const off = (centers[i] - (scrollLeft + vw / 2)) / vw, a = Math.abs(off);
      if (a < bestD) { bestD = a; best = i; }
      const on = a < .3;
      if (on !== p.classList.contains('is-active')) p.classList.toggle('is-active', on);
      if (on) p.classList.add('is-seen');
    });
    const max = track.scrollWidth - track.clientWidth;
    const progress = max > 0 ? scrollLeft / max : 0;
    const b = Math.round(progress * 500);
    if (b !== lastBar) { lastBar = b; jbar.style.transform = 'scaleX(' + (b / 500) + ')'; }
    const label = bestD < .3 ? String(best + 1).padStart(2, '0') + ' / 05 ' + panels[best].dataset.title : '00 / 05';
    if (label !== lastLabel) { lastLabel = label; jlabel.textContent = label; }
  }
  if (!reduce) {
    measurePanels();
    let ticking = false;
    track.addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => { updateJourney(); ticking = false; });
    }, { passive: true });
    addEventListener('resize', () => { measurePanels(); updateJourney(); });
    addEventListener('load', () => { measurePanels(); updateJourney(); });
    updateJourney();
  } else {
    panels.forEach((p) => p.classList.add('is-seen'));
  }

  // click-and-drag support: without this, a mouse "swipe" just selects the text
  (function enableDragScroll() {
    let dragging = false, startX = 0, startScroll = 0, moved = false;
    const down = (e) => {
      if (e.pointerType === 'touch') return; // touch already scrolls natively
      dragging = true; moved = false;
      startX = e.clientX; startScroll = track.scrollLeft;
      track.classList.add('is-dragging');
      if (track.setPointerCapture) track.setPointerCapture(e.pointerId);
    };
    const move = (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      track.scrollLeft = startScroll - dx;
    };
    const up = () => { dragging = false; track.classList.remove('is-dragging'); };
    track.addEventListener('pointerdown', down);
    track.addEventListener('pointermove', move);
    track.addEventListener('pointerup', up);
    track.addEventListener('pointerleave', up);
    track.addEventListener('pointercancel', up);
    track.addEventListener('dragstart', (e) => e.preventDefault());
    // suppress the click that would otherwise fire on an element after a drag
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  })();

  /* ---------- reveal choreography ---------- */
  function setupScroll() {
    // hero exit
    if (!reduce) {
      gsap.to('#heroInner', { scale: .95, opacity: 0, y: -50, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom 25%', scrub: true } });
      gsap.to('#stamp', { rotate: 240, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    }

    // masked headline reveals
    ['#aboutTitle', '#portfolioTitle', '#valuesTitle', '#contactTitle', '.jintro .h2'].forEach((sel) => {
      const el = $(sel); if (!el) return; const ws = split(el, 'mask'); if (reduce) return;
      gsap.from(ws, { yPercent: 118, duration: 1.4, stagger: .055, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 84%', toggleActions: 'play none none none' } });
    });

    // generic fade-ups
    $$('[data-reveal]').forEach((el) => {
      if (reduce) { gsap.set(el, { clearProps: 'all' }); return; }
      gsap.fromTo(el, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', clearProps: 'transform', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    if (!reduce) {
      // about manifesto — words ignite with scroll
      const stEl = $('#aboutStatement'); stEl.innerHTML = '<span class="scrub">' + stEl.innerHTML + '</span>';
      const stSpan = stEl.firstChild, ap = { v: 0 };
      gsap.to(ap, { v: 1, ease: 'none', scrollTrigger: { trigger: '#about', start: 'top 30%', end: 'bottom 140%', scrub: .6 }, onUpdate: () => stSpan.style.setProperty('--p', (ap.v * 118 - 8).toFixed(1) + '%') });
      gsap.fromTo('.about__tag', { opacity: 0 }, { opacity: .6, scrollTrigger: { trigger: '#about', start: 'top 20%', end: 'top -20%', scrub: true } });

      // purpose — vision → mission
      const vEl = $('#visionText'), mEl = $('#missionText');
      vEl.innerHTML = '<span class="scrub">' + vEl.innerHTML + '</span>'; mEl.innerHTML = '<span class="scrub">' + mEl.innerHTML + '</span>';
      const vS = vEl.firstChild, mS = mEl.firstChild, pv = { v: 0 }, pm = { v: 0 };
      const setP = (el, o) => el.style.setProperty('--p', (o.v * 118 - 8).toFixed(1) + '%');
      gsap.set('#pm', { opacity: 0 });
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#purpose', start: 'top top', end: 'bottom bottom', scrub: .6,
        onUpdate: (s) => { $('#pbar').style.transform = 'scaleX(' + s.progress.toFixed(3) + ')'; $('#lv').style.opacity = s.progress < .5 ? 1 : .35; $('#lm').style.opacity = s.progress < .5 ? .35 : 1; } } });
      tl.to(pv, { v: 1, duration: 3.6, onUpdate: () => setP(vS, pv) }, 0)
        .to('#pv', { opacity: 0, y: -50, duration: .9, ease: 'power1.in' }, 4.6)
        .fromTo('#pm', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: .9, ease: 'power1.out' }, 5.2)
        .to(pm, { v: 1, duration: 3.6, onUpdate: () => setP(mS, pm) }, 6.0)
        .to({}, { duration: .6 }, 9.4);

      // portfolio
      $$('.stat__n').forEach((el) => {
        const target = statVals[el.dataset.count], o = { v: 0 };
        gsap.to(o, { v: target, duration: 2.2, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); }, scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
      });
      gsap.from('.pipe__seg', { clipPath: 'inset(0 100% 0 0)', duration: 1.4, stagger: .12, ease: 'expo.out', clearProps: 'clipPath', scrollTrigger: { trigger: '#pipe', start: 'top 88%' } });
      gsap.set(cards, { opacity: 0 });
      ScrollTrigger.batch(cards, { start: 'top 94%', once: true,
        onEnter: (b) => gsap.fromTo(b.filter((c) => !c.hidden), { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: .05, clearProps: 'transform', ease: 'expo.out', overwrite: 'auto' }) });

      // values — stacked cards recede
      const vc = $$('.vcard');
      vc.forEach((c, i) => {
        if (i === vc.length - 1) return;
        gsap.to(c, { scale: .93 - (vc.length - i) * .004, '--dim': .42, ease: 'none', scrollTrigger: { trigger: vc[i + 1], start: 'top 82%', end: 'top 22%', scrub: true } });
      });
      vc.forEach((c) => gsap.from(c.querySelector('h3'), { yPercent: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 80%' } }));

      if ('IntersectionObserver' in window) { const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting)), { rootMargin: '10% 0px' }); vc.forEach((c) => io.observe(c)); } else vc.forEach((c) => c.classList.add('is-live'));

      // journey headline & panel parallax already scroll-linked; big type on contact
      gsap.from('.contact__meta a', { y: 30, opacity: 0, stagger: .12, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.contact__meta', start: 'top 92%' } });
    }
  }

  /* ---------- nav visibility & progress ---------- */
  const nav = $('#nav'), progressEl = $('#progress'), navState = { sc: false, hid: false };
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => {
    const y = s.scroll();
    const sc = y > 40, hid = s.direction === 1 && y > 600 && !menu.classList.contains('is-open');
    if (sc !== navState.sc) { navState.sc = sc; nav.classList.toggle('is-scrolled', sc); }
    if (hid !== navState.hid) { navState.hid = hid; nav.classList.toggle('is-hidden', hid); }
    progressEl.style.transform = 'scaleX(' + s.progress.toFixed(4) + ')';
  } });

  /* ---------- intro ---------- */
  function heroIn() {
    if (reduce) { gsap.set('.hero__title .line > span, [data-fade]', { clearProps: 'all' }); return; }
    gsap.from('#nav', { yPercent: -120, duration: 1.2, ease: 'expo.out' });
    gsap.to('.hero__title .line > span', { yPercent: 0, y: 0, duration: 1.6, stagger: .13, ease: 'expo.out' });
    gsap.to('[data-fade]', { opacity: 1, y: 0, duration: 1.3, stagger: .12, delay: .5, ease: 'expo.out' });
    gsap.fromTo('#stamp', { scale: .5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, delay: .8, ease: 'expo.out' });
  }
  function finishLoad() {
    $('#loader').remove(); body.classList.remove('is-loading');
    if (lenis) lenis.start();
    ScrollTrigger.refresh();
  }
  function intro() {
    if (reduce) { $('#loader').remove(); body.classList.remove('is-loading'); heroIn(); return; }
    const count = $('#loaderCount'), o = { v: 0 };
    let seen = false; try { seen = !!sessionStorage.getItem('cyn-seen'); sessionStorage.setItem('cyn-seen', '1'); } catch (e) {}
    const d = seen ? .45 : 1.05;
    const tl = gsap.timeline({ onComplete: finishLoad });
    tl.to(o, { v: 100, duration: d, ease: 'power2.inOut', onUpdate: () => { count.textContent = String(Math.round(o.v)).padStart(3, '0'); } }, 0)
      .to('#loaderLogo', { clipPath: 'inset(0 0% 0 0)', duration: d, ease: 'power2.inOut' }, 0)
      .to('#loaderBar', { scaleX: 1, duration: d, ease: 'power2.inOut' }, 0)
      .fromTo('#loader', { clipPath: 'inset(0% 0 0% 0)' }, { clipPath: 'inset(0% 0 100% 0)', duration: .8, ease: 'expo.inOut' }, d + .15)
      .add(heroIn, d + .45);
  }

  /* ---------- boot ---------- */
  $('.hero__title .line > span'); // ensure query works before hidden state
  gsap.set('.hero__title .line > span', { yPercent: 115 });
  gsap.set('[data-fade]', { opacity: 0, y: 26 });
  setupScroll();
  measureRows();
  addEventListener('resize', () => { measureRows(); });
  const boot = () => { measureRows(); updateState(); ScrollTrigger.refresh(); };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => { boot(); });
  addEventListener('load', boot);
  intro();
})();
