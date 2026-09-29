/* ==========================================================================
   Molecular field — one persistent particle system that morphs between
   scientific forms as the visitor moves through the page:
   powder cloud → fused-ring molecule → double helix → data terrain →
   globe & orbits → concentric rings → the Cynerva arc.
   ========================================================================== */
(function () {
  'use strict';
  const TAU = Math.PI * 2;

  function mulberry(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---- Shape generators (model space, roughly -1..1) ------------------- */
  function buildShapes(N) {
    const R = mulberry(20260928);
    const g = () => (R() + R() + R() + R() - 2);          // ~gaussian, sd≈.58
    const out = {};
    const mk = (fn) => { const a = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const p = fn(i); a[i * 3] = p[0]; a[i * 3 + 1] = p[1]; a[i * 3 + 2] = p[2]; } return a; };

    // 1 — powder cloud
    out.cloud = mk(() => [g() * 1.5, g() * 1.0, g() * 1.0]);

    // 2 — fused-ring molecule (coronene + a short side chain)
    {
      const r = 0.3, verts = [], key = new Map(), bonds = [];
      const addV = (x, y) => { const k = Math.round(x * 500) + ',' + Math.round(y * 500); if (!key.has(k)) { key.set(k, verts.length); verts.push([x, y]); } return key.get(k); };
      const centers = [[0, 0]];
      for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; centers.push([Math.cos(a) * Math.sqrt(3) * r, Math.sin(a) * Math.sqrt(3) * r]); }
      const seen = new Set();
      centers.forEach(([cx, cy]) => {
        const ids = [];
        for (let j = 0; j < 6; j++) { const a = Math.PI / 6 + j * Math.PI / 3; ids.push(addV(cx + Math.cos(a) * r, cy + Math.sin(a) * r)); }
        for (let j = 0; j < 6; j++) { const a = ids[j], b = ids[(j + 1) % 6], kk = a < b ? a + '-' + b : b + '-' + a; if (!seen.has(kk)) { seen.add(kk); bonds.push([a, b]); } }
      });
      // side chain from the right-most vertex
      let far = 0; verts.forEach((v, i) => { if (v[0] > verts[far][0]) far = i; });
      let prev = far, ang = -0.35;
      for (let s = 0; s < 3; s++) { const v = verts[prev]; const id = addV(v[0] + Math.cos(ang) * r, v[1] + Math.sin(ang) * r); bonds.push([prev, id]); prev = id; ang += s % 2 ? -0.9 : 0.9; }
      const nAtoms = verts.length;
      out.lattice = mk((i) => {
        let x, y;
        if (i % 10 < 3) { const v = verts[i % nAtoms]; x = v[0] + (R() - .5) * 0.02; y = v[1] + (R() - .5) * 0.02; }
        else { const b = bonds[Math.floor(R() * bonds.length)], t = R(), a = verts[b[0]], c = verts[b[1]]; x = a[0] + (c[0] - a[0]) * t + (R() - .5) * 0.008; y = a[1] + (c[1] - a[1]) * t + (R() - .5) * 0.008; }
        return [x - 0.12, y, Math.sin(x * 5 + y * 3) * 0.14 + (R() - .5) * 0.02];
      });
    }

    // 3 — double helix along x
    out.helix = mk((i) => {
      const rung = i % 4 === 0;
      if (rung) {
        const t = (Math.floor(R() * 46) / 46) * 2 - 1, a = t * 3.6 * TAU;
        const s = R();
        const y1 = Math.sin(a) * .36, z1 = Math.cos(a) * .36;
        return [t * 2.1, y1 * (1 - 2 * s), z1 * (1 - 2 * s)];
      }
      const t = R() * 2 - 1, a = t * 3.6 * TAU + (i % 2) * Math.PI;
      return [t * 2.1, Math.sin(a) * .36 + (R() - .5) * .02, Math.cos(a) * .36 + (R() - .5) * .02];
    });

    // 4 — data terrain
    {
      const side = Math.ceil(Math.sqrt(N * 1.6)), rows = Math.ceil(N / side);
      out.grid = mk((i) => {
        const gx = i % side, gz = Math.floor(i / side);
        const x = (gx / (side - 1)) * 2 - 1, z = (gz / Math.max(rows - 1, 1)) * 2 - 1;
        return [x * 2.3, Math.sin(x * 5) * .1 + Math.cos(z * 4 + x * 2) * .12 + (R() - .5) * .01, z * 1.5];
      });
    }

    // 5 — globe with orbits
    out.globe = mk((i) => {
      if (i % 6 === 0) {
        const k = (i / 6) % 3, th = R() * TAU, rr = 1.32 + k * 0.1;
        let x = Math.cos(th) * rr, y = Math.sin(th) * rr, z = 0;
        const tilt = [0.5, -0.9, 1.4][k], c = Math.cos(tilt), s = Math.sin(tilt);
        const y2 = y * c - z * s, z2 = y * s + z * c; y = y2; z = z2;
        const c2 = Math.cos(k * 1.1), s2 = Math.sin(k * 1.1); const x3 = x * c2 - y * s2, y3 = x * s2 + y * c2;
        return [x3, y3, z];
      }
      const k = i + 0.5, phi = Math.acos(1 - 2 * k / N), th = Math.PI * (1 + Math.sqrt(5)) * k;
      const rr = 0.98;
      return [Math.cos(th) * Math.sin(phi) * rr, Math.cos(phi) * rr, Math.sin(th) * Math.sin(phi) * rr];
    });

    // 6 — concentric rings
    out.rings = mk((i) => {
      const ring = 1 + (i % 6), th = R() * TAU, rr = ring * 0.26;
      return [Math.cos(th) * rr * 1.25, (R() - .5) * 0.03, Math.sin(th) * rr * 1.25];
    });

    // 7 — the Cynerva arc
    out.arc = mk((i) => {
      if (i % 5 === 0) return [g() * 2.0, g() * 0.9 + 0.35, g() * 0.8];
      const x = (R() * 2 - 1) * 1.75, u = x / 1.75, body = Math.max(1 - u * u, 0);
      const th = 0.012 + Math.pow(body, .7) * 0.075;
      return [x, -0.55 * body + 0.2 + g() * th * 2, g() * 0.14];
    });

    out.hush = out.cloud;   // same targets, drawn invisible: used where text needs the whole width
    return out;
  }

  /* ---- Layout (where/how each shape is presented) ---------------------- */
  // Desktop layout sits beside the text; `m` is the phone layout, which uses the
  // free bands between text blocks (hero gap, bottom of About, top of Journey ...).
  const LAYOUT = {
    cloud:   { q: 1,   cx: .79, cy: .5,  s: .5,  rx: .12, spin: .05, a: .8,  net: .25, m: { cx: .5, cy: .54, s: .38, a: .95 } },
    lattice: { q: 1,   cx: .79, cy: .5,  s: .56, rx: .22, spin: .12, a: 1,   net: 0,   m: { cx: .5, cy: .9,  s: .3,  a: .7 } },
    helix:   { q: .55, cx: .5,  cy: .1,  s: .4,  rx: .35, spin: .22, a: .5,  net: 0,   m: { cx: .5, cy: .075, s: .36, a: .4 } },
    grid:    { q: .3,  cx: .5,  cy: .62, s: .62, rx: .95, spin: .0,  a: .16, net: 0,   m: { cx: .5, cy: .7,  s: .6,  a: 0 } },
    globe:   { q: 1,   cx: .79, cy: .52, s: .44, rx: .3,  spin: .16, a: 1,   net: .45, m: { cx: .5, cy: .8,  s: .4,  a: 1 } },
    rings:   { q: .6,  cx: .8,  cy: .26, s: .38, rx: .95, spin: .1,  a: .55, net: 0,   m: { cx: .5, cy: .5,  s: .5,  a: 0 } },
    hush:    { q: .3,  cx: .5,  cy: .5,  s: .5,  rx: .1,  spin: .02, a: 0,   net: 0,   m: { cx: .5, cy: .5, s: .5, a: 0 } },
    arc:     { q: .55, cx: .5,  cy: .09, s: .5,  rx: .1,  spin: .04, a: .55, net: 0,   m: { cx: .5, cy: .07, s: .4,  a: .4 } }
  };

  /* ---- Field ------------------------------------------------------------ */
  function Field(canvas, opts) {
    opts = opts || {};
    const ctx = canvas.getContext('2d', { alpha: true });
    const reduce = !!opts.reduce;
    const mobile = () => innerWidth < 900;
    const N = mobile() ? 380 : 1000;
    const shapes = buildShapes(N);
    const R = mulberry(99);

    const pos = new Float32Array(N * 3);
    const kk = new Float32Array(N), ph = new Float32Array(N), col = new Uint8Array(N), sz = new Float32Array(N);
    const dx = new Float32Array(N), dy = new Float32Array(N);
    const sx = new Float32Array(N), sy = new Float32Array(N), sr = new Float32Array(N), key = new Uint8Array(N);
    const order = new Uint16Array(N), counts = new Uint16Array(19);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (R() - .5) * 5; pos[i * 3 + 1] = (R() - .5) * 3; pos[i * 3 + 2] = (R() - .5) * 2;
      kk[i] = 0.018 + R() * 0.05; ph[i] = R() * TAU; sz[i] = 0.8 + Math.pow(R(), 2.4) * 2.2;
      const c = R(); col[i] = c < .58 ? 0 : c < .88 ? 1 : 2;
    }

    let W = 0, H = 0, dpr = 1, U = 500;
    const cur = { cx: .58, cy: .5, s: .55, rx: .12, spin: .05, a: 0, net: .35, dark: 0, q: 1 };
    let shapeName = 'cloud', cur3 = shapes.cloud;
    let time = 0, rot = 0, scrollVel = 0, lastScroll = scrollY;
    const mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999, on: false };

    const LIGHT = [[66, 25, 122], [10, 130, 131], [124, 96, 200]];
    const DARK = [[190, 168, 255], [102, 218, 204], [255, 255, 255]];

    // adaptive quality: if the device can't hold ~40fps, draw fewer particles
    let active = N, slowMs = 0, avg = 16;

    let enabled = true;
    function resize() {
      enabled = true;
      dpr = 1;
      W = innerWidth; H = innerHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      U = 0.5 * Math.min(W * 1.05, Math.max(W * 0.6, H * 1.1));
    }
    addEventListener('resize', resize); resize();

    if (!mobile()) {
      addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; }, { passive: true });
      document.addEventListener('pointerleave', () => { mouse.on = false; });
    }

    function layoutFor(name) {
      const l = LAYOUT[name], mob = mobile(), m = mob ? l.m : l;
      return { cx: m.cx, cy: m.cy, s: m.s, rx: l.rx, spin: l.spin, a: mob ? m.a : l.a, net: mob ? 0 : l.net, q: l.q };
    }
    function setShape(name) {
      if (!shapes[name] || name === shapeName) return;
      shapeName = name; cur3 = shapes[name];
      const l = layoutFor(name);
      if (window.gsap && !reduce) gsap.to(cur, Object.assign({ duration: 1.6, ease: 'power3.inOut', overwrite: 'auto' }, l));
      else Object.assign(cur, l);
    }
    function setDark(on) {
      if (window.gsap && !reduce) gsap.to(cur, { dark: on ? 1 : 0, duration: 1, ease: 'power2.inOut', overwrite: 'auto' });
      else cur.dark = on ? 1 : 0;
    }
    Object.assign(cur, layoutFor('cloud'), { a: 0 });
    if (window.gsap) gsap.to(cur, { a: layoutFor('cloud').a, duration: 2, ease: 'power2.out', delay: .2 }); else cur.a = .95;

    const NODES = 90;
    const nodeIdx = []; for (let k = 0; k < NODES; k++) nodeIdx.push(Math.floor(k * N / NODES));
    const NODE_STEP = Math.floor(N / NODES);
    let last = performance.now(), skip = 0;

    function frame(now) {
      requestAnimationFrame(frame);
      if (document.hidden || !enabled) { last = now; return; }
      const mob = mobile();
      const gap = mob ? 33 : (cur.a < .3 ? 30 : 14);                    // faint scenes ~30fps, others full rate
      if (now - last < gap) return;
      const rawDt = (now - last) / 1000;
      const dt = Math.min(rawDt, 0.05); last = now;
      const f = dt * 60;
      time += dt;

      // adapt particle budget to device speed
      avg += (rawDt * 1000 - avg) * 0.05;
      if (avg > (mob ? 40 : 24)) { slowMs += rawDt; if (slowMs > 1.2 && active > N * 0.35) { active = Math.max(Math.floor(N * 0.35), Math.floor(active * 0.8)); slowMs = 0; } } else slowMs = 0;

      const sc = scrollY; scrollVel += ((sc - lastScroll) - scrollVel) * 0.12; lastScroll = sc;
      rot += dt * cur.spin * (reduce ? 0 : 1) + scrollVel * 0.0009;
      mouse.sx += (mouse.x - mouse.sx) * .18; mouse.sy += (mouse.y - mouse.sy) * .18;

      const cy = Math.cos(rot), sy_ = Math.sin(rot);
      const cxr = Math.cos(cur.rx), sxr = Math.sin(cur.rx);
      const ox = cur.cx * W, oy = cur.cy * H, u = U * cur.s;
      const wob = reduce ? 0 : 0.012;
      const PR = 200, PR2 = PR * PR, useMouse = mouse.on && !mob;
      const alpha = cur.a;
      const act = Math.min(active, Math.max(80, Math.floor(N * cur.q)));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (alpha < 0.01) return;

      const cA = [];
      for (let c = 0; c < 3; c++) cA.push([
        Math.round(LIGHT[c][0] + (DARK[c][0] - LIGHT[c][0]) * cur.dark),
        Math.round(LIGHT[c][1] + (DARK[c][1] - LIGHT[c][1]) * cur.dark),
        Math.round(LIGHT[c][2] + (DARK[c][2] - LIGHT[c][2]) * cur.dark)]);

      counts.fill(0);
      for (let i = 0; i < act; i++) {
        const i3 = i * 3, k = Math.min(kk[i] * f, 1);
        pos[i3] += (cur3[i3] - pos[i3]) * k;
        pos[i3 + 1] += (cur3[i3 + 1] - pos[i3 + 1]) * k;
        pos[i3 + 2] += (cur3[i3 + 2] - pos[i3 + 2]) * k;
        const p = ph[i];
        const x = pos[i3] + Math.sin(time * .6 + p) * wob;
        const y = pos[i3 + 1] + Math.cos(time * .5 + p * 1.7) * wob;
        const z = pos[i3 + 2] + Math.sin(time * .4 + p * 2.3) * wob;
        const x1 = x * cy - z * sy_, z1 = x * sy_ + z * cy;
        const y2 = y * cxr - z1 * sxr, z2 = y * sxr + z1 * cxr;
        const persp = 1.7 / (1.7 - z2 * 0.5);
        let px = ox + x1 * u * persp, py = oy + y2 * u * persp;

        if (useMouse) {
          const ddx = px - mouse.sx, ddy = py - mouse.sy, d2 = ddx * ddx + ddy * ddy;
          if (d2 < PR2 && d2 > 1) { const d = Math.sqrt(d2), s = (1 - d / PR); const push = s * s * 5.5; dx[i] += ddx / d * push; dy[i] += ddy / d * push; }
          dx[i] *= 0.9; dy[i] *= 0.9; px += dx[i]; py += dy[i];
        }

        sx[i] = px; sy[i] = py;
        sr[i] = sz[i] * persp * (0.85 + (i % NODE_STEP === 0 ? 0.9 : 0)) * (act < N ? 1.25 : 1);
        const al = Math.max(0.08, Math.min(1, 0.35 + (z2 + 1) * 0.36)) * alpha;
        const kx = col[i] * 6 + Math.min(5, (al * 6) | 0);
        key[i] = kx; counts[kx + 1]++;
      }

      // constellation lines (desktop only), three alpha bands, one stroke each
      if (cur.net > 0.02 && !mob) {
        const th = 110, th2 = th * th, lc = cA[0];
        const bands = [[], [], []];
        for (let ai = 0; ai < NODES; ai++) {
          const a = nodeIdx[ai]; if (a >= act) break;
          for (let bi = ai + 1; bi < NODES; bi++) {
            const b = nodeIdx[bi]; if (b >= act) break;
            const ddx = sx[a] - sx[b], ddy = sy[a] - sy[b], d2 = ddx * ddx + ddy * ddy;
            if (d2 < th2) bands[d2 < th2 * .3 ? 0 : d2 < th2 * .65 ? 1 : 2].push(a, b);
          }
        }
        ctx.lineWidth = 1;
        for (let bi = 0; bi < 3; bi++) {
          const arr = bands[bi]; if (!arr.length) continue;
          ctx.strokeStyle = 'rgba(' + lc[0] + ',' + lc[1] + ',' + lc[2] + ',' + ((0.2 - bi * 0.07) * cur.net * alpha).toFixed(3) + ')';
          ctx.beginPath();
          for (let q = 0; q < arr.length; q += 2) { ctx.moveTo(sx[arr[q]], sy[arr[q]]); ctx.lineTo(sx[arr[q + 1]], sy[arr[q + 1]]); }
          ctx.stroke();
        }
      }

      // counting sort by (colour, depth-alpha) then one fill per group
      for (let k = 1; k < 19; k++) counts[k] += counts[k - 1];
      const fillIdx = counts.slice(0, 18);
      for (let i = 0; i < active; i++) order[fillIdx[key[i]]++] = i;
      let s0 = 0;
      for (let g = 0; g < 18; g++) {
        const e = counts[g + 1]; if (e === s0) continue;
        const c = (g / 6) | 0, b = g % 6, cc = cA[c];
        ctx.fillStyle = 'rgba(' + cc[0] + ',' + cc[1] + ',' + cc[2] + ',' + ((b + 0.6) / 6).toFixed(3) + ')';
        ctx.beginPath();
        for (let q = s0; q < e; q++) {
          const i = order[q], r = sr[i];
          if (r < 1.5) ctx.rect(sx[i] - r, sy[i] - r, r * 2, r * 2);
          else { ctx.moveTo(sx[i] + r, sy[i]); ctx.arc(sx[i], sy[i], r, 0, TAU); }
        }
        ctx.fill();
        s0 = e;
      }
    }
    requestAnimationFrame(frame);

    return { setShape, setDark, resize, get name() { return shapeName; } };
  }

  window.CynervaField = Field;
})();
