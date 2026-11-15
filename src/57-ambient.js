//@ Park Co, part 57: the park breathes - the small things that move when nothing is happening
  // ── Why ──────────────────────────────────────────────────────────
  // Between a ride cycle and the next the park stood perfectly still: every lantern the same flat yellow, every pond a
  // sheet of glass, the sky empty. A real park is never still. This part adds the small movement, none of it tied to a
  // ride or to the player:
  //   - every lantern and lamp flickers on its own: its flame drifts from yellow to a slightly darker amber and back, and
  //     now and then gutters for a moment; no two keep the same time;
  //   - the coloured bulbs on the rides twinkle and chase;
  //   - the water moves: every pond, basin and channel drifts and glints;
  //   - flags fly: tall pennants along the East Parade and at the gate, rippling in the wind, which gusts;
  //   - birds circle over the park in loose flocks, wings beating, and drift off at dusk;
  //   - butterflies wander round the flower beds and the plazas by day;
  //   - fireflies drift over the lawns at night;
  //   - steam rises from the popcorn cart and the snack stand.
  // All of it is cheap: the lamps are walked a slice at a time, the flags and the butterflies only move near the eye, the
  // fireflies are one draw.
  var PK_AMB = { t: 0, lampAt: 0, rideAt: 0, flags: [], birds: [], flies: [], fire: null, steam: [], gust: 0, built: false, puffTex: null };
  function pkAmbNight() { return S.time >= 18.5 || S.time < 6.5; }
  function pkAmbRand(seed) { var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  // ── The lamps ────────────────────────────────────────────────────
  // a lamp's own slow breath (two sines that never line up) and a rare quick gutter; 0 is full, 1 is the dimmest
  function pkAmbFlame(t, ph) {
    var slow = 0.5 + 0.5 * Math.sin(t * 1.7 + ph) * Math.sin(t * 2.9 + ph * 1.73);
    var fast = 0.5 + 0.5 * Math.sin(t * 11.0 + ph * 3.1);
    var gut = Math.sin(t * 0.37 + ph * 5.3) > 0.985 ? 0.6 : 0;
    return Math.min(1, slow * 0.7 + fast * 0.18 + gut);
  }
  function pkAmbLamps(dt) {
    var A = PK_AMB, t = A.t, i, m, n, k;
    // the park's lamps: a slice of them each frame (there are thousands), so each is touched about fifteen times a second
    if (PK_GLOW_PARK && PK_GLOW_PARK_ON) {
      n = PK_GLOW_PARK.length; k = Math.max(40, Math.ceil(n / 4));
      for (i = 0; i < k && n; i++) {
        A.lampAt = (A.lampAt + 1) % n; m = PK_GLOW_PARK[A.lampAt];
        if (!m.userData.pkAmb) {
          var e = m.emissive, warm = e.r > 0.75 && e.g > 0.5 && e.b < 0.9 && e.r >= e.b;
          m.userData.pkAmb = { r: e.r, g: e.g, b: e.b, warm: warm, ph: pkAmbRand(A.lampAt + 1) * 50 };
        }
        var U = m.userData.pkAmb; if (!U.warm) continue;
        var f = pkAmbFlame(t, U.ph);
        // yellow, a little darker yellow, yellow: the flame drops toward amber as it dims
        m.emissive.setRGB(U.r * (1 - 0.06 * f), U.g * (1 - 0.24 * f), U.b * (1 - 0.5 * f));
        m.emissiveIntensity = m.userData.pkGlowBase * (1 - 0.3 * f);
      }
    }
    // the rides' bulbs: each twinkles on its own beat, so a rim of bulbs reads as a chase
    if (PK_GLOW_RIDE && PK_GLOW_RIDE_ON) {
      n = PK_GLOW_RIDE.length; k = Math.max(40, Math.ceil(n / 3));
      for (i = 0; i < k && n; i++) {
        A.rideAt = (A.rideAt + 1) % n; m = PK_GLOW_RIDE[A.rideAt];
        if (m.userData.pkAmbPh === undefined) m.userData.pkAmbPh = pkAmbRand(A.rideAt + 7) * 6.2832;
        var s = Math.sin(t * 3.2 + m.userData.pkAmbPh);
        m.emissiveIntensity = m.userData.pkGlowBase * (s > 0.2 ? 1.12 : 0.5 + 0.3 * (s + 1));
      }
    }
  }

  // ── The water ────────────────────────────────────────────────────
  function pkAmbWater(dt) {
    var M = pkMats(), w = M.water; if (!w || !w.map) return;
    w.map.offset.x = (w.map.offset.x + dt * 0.018) % 1; w.map.offset.y = (w.map.offset.y + dt * 0.011) % 1;
    w.emissiveIntensity = 0.35 + 0.1 * Math.sin(PK_AMB.t * 0.9);
  }

  // ── The flags ────────────────────────────────────────────────────
  // a tall pole with a long swallow-tailed pennant, laid as a strip of quads that ripple from the hoist out
  function pkAmbFlag(x, z, h, colA, colB) {
    var K = pkMats(), g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    pkBevelBox(0.4, 0.3, 0.4, K.stone, 0, 0.15, 0, g, 0.04);
    pkRoundCyl(0.06, h, pkPaint(0xf4f1e6, 0.5, 0.2), 0, h / 2, 0, g, 10);
    sphere(0.11, K.gold, 0, h + 0.08, 0, g);
    solid(x - 0.2, x + 0.2, z - 0.2, z + 0.2, 0, 2.2);
    var L = 2.6, Hh = 1.0, NX = 14, pos = [], col = [], idx = [], cA = new THREE.Color(colA), cB = new THREE.Color(colB), i;
    for (i = 0; i <= NX; i++) {
      var u = i / NX, tail = u > 0.72 ? (u - 0.72) / 0.28 : 0;            // the swallow tail: the fly end narrows to two points
      var top = Hh / 2 * (1 - 0.35 * u), bot = -Hh / 2 * (1 - 0.35 * u);
      pos.push(u * L, top, 0, u * L - tail * 0.55, 0, 0, u * L, bot, 0);   // the middle of the fly end is cut back: the notch
      var c = Math.floor(u * 5) % 2 ? cB : cA;
      col.push(c.r, c.g, c.b, c.r, c.g, c.b, c.r, c.g, c.b);
    }
    for (i = 0; i < NX; i++) { var a = i * 3, b = a + 3; idx.push(a, b, a + 1, b, b + 1, a + 1, a + 1, b + 1, a + 2, b + 1, b + 2, a + 2); }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    var mat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.85 }); mat.userData.noBake = true;
    var fl = new THREE.Mesh(geo, mat); fl.position.set(0, h - 0.7, 0); fl.castShadow = true; fl.userData.dynamic = true; fl.userData.noBake = true; g.add(fl);
    PK_AMB.flags.push({ m: fl, base: pos.slice(), L: L, ph: pkAmbRand(x * 3 + z) * 20, x: x, z: z });
  }
  function pkAmbFlags(dt) {
    var A = PK_AMB, t = A.t, cx = camera.position.x, cz = camera.position.z;
    A.gust = 0.75 + 0.25 * Math.sin(t * 0.23) + 0.15 * Math.sin(t * 0.71 + 1.3);       // the wind comes and goes
    for (var f = 0; f < A.flags.length; f++) {
      var F = A.flags[f]; if ((F.x - cx) * (F.x - cx) + (F.z - cz) * (F.z - cz) > 110 * 110) continue;
      var P = F.m.geometry.attributes.position, B = F.base, g = A.gust;
      for (var i = 0; i < P.count; i++) {
        var x = B[i * 3], u = x / F.L, w = Math.sin(x * 2.6 - t * 5.2 * g + F.ph) * 0.2 * u + Math.sin(x * 5.3 - t * 8.1 * g + F.ph * 1.7) * 0.06 * u;
        P.setXYZ(i, x - 0.12 * u * u * (1.2 - g), B[i * 3 + 1] - 0.5 * u * u * (1.2 - g) + Math.sin(x * 2.1 - t * 4.4 + F.ph) * 0.04 * u, w);
      }
      P.needsUpdate = true;
      F.m.rotation.y = 0.5 + 0.3 * Math.sin(t * 0.17 + F.ph);                           // and veers a little
    }
  }

  // ── The birds ────────────────────────────────────────────────────
  function pkAmbBird(col) {
    var g = new THREE.Group(); g.userData.dynamic = true;
    var m = std({ color: col, roughness: 0.9, side: THREE.DoubleSide }); m.userData.noBake = true;
    var body = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.55, 5), m); body.rotation.x = Math.PI / 2; g.add(body);
    var wg = new THREE.BufferGeometry();
    wg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.16, 0.62, 0, -0.05, 0, 0, 0.14], 3)); wg.computeVertexNormals();
    var wl = new THREE.Mesh(wg, m), wr = new THREE.Mesh(wg, m); wr.scale.x = -1; g.add(wl); g.add(wr);
    scene.add(g);
    return { g: g, wl: wl, wr: wr };
  }
  function pkAmbBirdsBuild() {
    // three loose flocks: [centre x, centre z, radius, height, how many, the way round]
    [[0, -20, 46, 34, 6, 1], [104, -62, 38, 30, 5, -1], [-66, 8, 34, 27, 5, 1], [140, 10, 30, 32, 4, -1]].forEach(function (F, fi) {
      for (var i = 0; i < F[4]; i++) {
        var b = pkAmbBird(i % 3 ? 0x2b2b30 : 0xe9e6dc), r = pkAmbRand(fi * 31 + i);
        b.cx = F[0]; b.cz = F[1]; b.r = F[2] * (0.75 + 0.5 * r); b.h = F[3] + 8 * pkAmbRand(fi * 17 + i * 3); b.dir = F[5];
        b.a = r * 6.2832; b.sp = (0.11 + 0.05 * pkAmbRand(fi * 7 + i * 5)) * 46 / b.r; b.ph = r * 9; b.flap = 7 + 3 * r;
        PK_AMB.birds.push(b);
      }
    });
  }
  function pkAmbBirds(dt) {
    var A = PK_AMB, t = A.t, roost = pkAmbNight();
    for (var i = 0; i < A.birds.length; i++) {
      var b = A.birds[i];
      if (b.g.visible === roost) b.g.visible = !roost;        // gone to roost after dark
      if (roost) continue;
      b.a += b.dir * b.sp * dt;
      var wob = 1 + 0.18 * Math.sin(t * 0.21 + b.ph), x = b.cx + Math.cos(b.a) * b.r * wob, z = b.cz + Math.sin(b.a) * b.r * wob * 0.8;
      var y = b.h + 2.5 * Math.sin(t * 0.33 + b.ph * 2);
      b.g.position.set(x, y, z);
      b.g.rotation.y = -b.a + (b.dir > 0 ? Math.PI : 0);
      b.g.rotation.z = -b.dir * 0.3;                           // banked into the turn
      // a few beats, then a glide
      var cyc = (t * 0.25 + b.ph) % 1, w = cyc < 0.7 ? Math.sin(t * b.flap + b.ph) * 0.75 : 0.12;
      b.wl.rotation.z = w; b.wr.rotation.z = -w;
    }
  }

  // ── The butterflies ──────────────────────────────────────────────
  function pkAmbFliesBuild() {
    var spots = [[0, 10.5, 6], [-31, 3, 6], [35, 3, 6], [2, -44, 6], [2, -52, 6], [-15, -44, 5], [18, -44, 5], [147, -29, 6], [141, -66, 7], [-46.8, 20, 4], [0, 44, 7], [131, 30, 6], [-8.5, -70, 6], [56, 6, 4]];
    var cols = [0xf2c230, 0xf08a2c, 0xffffff, 0x7fb8f0, 0xe85a8a];
    spots.forEach(function (sp, si) {
      for (var k = 0; k < 2; k++) {
        var g = new THREE.Group(); g.userData.dynamic = true; scene.add(g);
        var m = std({ color: cols[(si + k) % cols.length], roughness: 0.8, side: THREE.DoubleSide }); m.userData.noBake = true;
        var wg = new THREE.BufferGeometry();
        wg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.05, 0.13, 0, -0.1, 0.11, 0, 0.07, 0, 0, -0.05, 0.11, 0, 0.07, 0, 0, 0.06], 3)); wg.computeVertexNormals();
        var wl = new THREE.Mesh(wg, m), wr = new THREE.Mesh(wg, m); wr.scale.x = -1; g.add(wl); g.add(wr);
        PK_AMB.flies.push({ g: g, wl: wl, wr: wr, cx: sp[0], cz: sp[1], r: sp[2], ph: pkAmbRand(si * 13 + k * 5) * 30 });
      }
    });
  }
  function pkAmbFlies(dt) {
    var A = PK_AMB, t = A.t, off = pkAmbNight() || (typeof WEATHER !== 'undefined' && WEATHER && WEATHER.rain > 0.3), cx = camera.position.x, cz = camera.position.z;
    for (var i = 0; i < A.flies.length; i++) {
      var f = A.flies[i], near = (f.cx - cx) * (f.cx - cx) + (f.cz - cz) * (f.cz - cz) < 45 * 45, show = !off && near;
      if (f.g.visible !== show) f.g.visible = show;
      if (!show) continue;
      // a wandering figure of eight round its patch, never straight, rising and dipping
      var a = t * 0.5 + f.ph, x = f.cx + Math.sin(a) * f.r * (0.6 + 0.4 * Math.sin(a * 0.37)), z = f.cz + Math.sin(a * 1.31 + 1) * f.r * 0.8;
      var y = 0.7 + 0.5 * Math.sin(a * 2.3) + 0.25 * Math.sin(t * 3.1 + f.ph);
      f.g.rotation.y = Math.atan2(x - f.g.position.x, z - f.g.position.z);
      f.g.position.set(x, y, z);
      var w = Math.sin(t * 16 + f.ph) * 1.1;
      f.wl.rotation.z = w; f.wr.rotation.z = -w;
    }
  }

  // ── The fireflies ────────────────────────────────────────────────
  function pkAmbFireBuild() {
    // the lawns they drift over, [x0, x1, z0, z1, how many]
    var lawns = [[-28, 32, -58, -46, 26], [131, 158, -48, -12, 22], [-62, -48, -6, 12, 14], [12, 60, 8, 30, 18], [-28, -10, 26, 29, 4]].map(function (L) { return [L[0], L[1], L[2], L[3], L[4] * 3]; });
    var pos = [], seed = [], n = 0;
    lawns.forEach(function (L, li) { for (var i = 0; i < L[4]; i++) { var a = pkAmbRand(li * 91 + i * 3), b = pkAmbRand(li * 57 + i * 7 + 1); pos.push(L[0] + (L[1] - L[0]) * a, 1, L[2] + (L[3] - L[2]) * b); seed.push(a * 40, b * 40); n++; } });
    // a soft round glow, added to the night, big enough to read at thirty metres; 70 more follow the eye over the grass
    var NEAR = 70, glowTex = makeAlphaTex(32, 32, function (c, w, h) { var gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
    var nearOff = []; for (var q = 0; q < NEAR; q++) { pos.push(0, 1, 0); seed.push(pkAmbRand(q * 17 + 5) * 40, pkAmbRand(q * 29 + 3) * 40); nearOff.push((pkAmbRand(q * 11 + 1) - 0.5) * 60, (pkAmbRand(q * 23 + 7) - 0.5) * 60); n++; }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({ color: 0xe0ff70, size: 0.55, map: glowTex, transparent: true, opacity: 0.95, depthWrite: false, sizeAttenuation: true, blending: THREE.AdditiveBlending }); mat.userData.noBake = true;
    var pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.userData.dynamic = true; pts.userData.noBake = true; pts.visible = false; scene.add(pts);
    PK_AMB.fire = { pts: pts, base: pos.slice(), seed: seed, n: n, nearFrom: n - NEAR, nearOff: nearOff };
  }
  function pkAmbFire(dt) {
    var F = PK_AMB.fire; if (!F) return;
    var on = pkAmbNight(); if (F.pts.visible !== on) F.pts.visible = on;
    if (!on) return;
    var P = F.pts.geometry.attributes.position, t = PK_AMB.t, cxe = camera.position.x, cze = camera.position.z, hi = player.y > 3;
    // the cloud that follows the eye: fixed spots in the world, repeating every 60 m, so there are always some within thirty metres
    for (var k = F.nearFrom; k < F.n; k++) { var ox = F.nearOff[(k - F.nearFrom) * 2], oz = F.nearOff[(k - F.nearFrom) * 2 + 1]; F.base[k * 3] = ox + 60 * Math.round((cxe - ox) / 60); F.base[k * 3 + 2] = oz + 60 * Math.round((cze - oz) / 60); }
    for (var i = 0; i < F.n; i++) {
      var a = F.seed[i * 2], b = F.seed[i * 2 + 1];
      P.setXYZ(i, F.base[i * 3] + Math.sin(t * 0.31 + a) * 2.2, 0.9 + 0.7 * Math.sin(t * 0.47 + b) + 0.3 * Math.sin(t * 1.3 + a), F.base[i * 3 + 2] + Math.sin(t * 0.27 + b) * 2.2);
    }
    P.needsUpdate = true;
    F.pts.material.opacity = 0.55 + 0.4 * Math.sin(t * 2.3);       // they pulse together, as they do
  }

  // ── The steam ────────────────────────────────────────────────────
  function pkAmbSteamBuild() {
    PK_AMB.puffTex = makeAlphaTex(64, 64, function (c, w, h) {
      var gr = c.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = gr; c.fillRect(0, 0, w, h);
    });
    // [x, y, z, how far it rises, how wide it grows]
    [[7.1, 2.0, 17.6, 1.6, 0.7], [-15.6, 3.3, 13.2, 2.6, 1.1]].forEach(function (E, ei) {
      for (var i = 0; i < 5; i++) {
        var m = new THREE.SpriteMaterial({ map: PK_AMB.puffTex, color: 0xf4f4f0, transparent: true, opacity: 0, depthWrite: false }); m.userData.noBake = true;
        var s = new THREE.Sprite(m); s.userData.dynamic = true; s.userData.noBake = true; scene.add(s);
        PK_AMB.steam.push({ s: s, x: E[0], y: E[1], z: E[2], rise: E[3], wide: E[4], ph: i / 5 + ei * 0.13 });
      }
    });
  }
  function pkAmbSteam(dt) {
    var A = PK_AMB, t = A.t, cx = camera.position.x, cz = camera.position.z;
    for (var i = 0; i < A.steam.length; i++) {
      var p = A.steam[i], near = (p.x - cx) * (p.x - cx) + (p.z - cz) * (p.z - cz) < 70 * 70;
      if (p.s.visible !== near) p.s.visible = near;
      if (!near) continue;
      var u = (t * 0.22 + p.ph) % 1;
      p.s.position.set(p.x + Math.sin(t * 0.6 + p.ph * 9) * 0.25 * u + 0.5 * u * A.gust, p.y + u * p.rise, p.z + Math.cos(t * 0.5 + p.ph * 7) * 0.2 * u);
      var sc = 0.25 + p.wide * u; p.s.scale.set(sc, sc, 1);
      p.s.material.opacity = 0.5 * Math.sin(Math.PI * u) * (1 - 0.4 * u);
    }
  }

  // ── Building it, and the beat ────────────────────────────────────
  function pkAmbientBuild() {
    if (PK_AMB.built) return;
    PK_AMB.built = true;
    // the flags: along the East Parade (east side, between the spurs) in each land's colours, and a pair at the gate
    [[-106, 0xe58a2f, 0x2f9fb0], [-66, 0x2f9fb0, 0xf4f1e6], [-41, 0xe58a2f, 0xf4f1e6], [-16, 0x2f9fb0, 0xe58a2f]].forEach(function (q) { pkAmbFlag(130.2, q[0], 7.5, q[1], q[2]); });
    [[9, 0x2f6fb3, 0xf0c04a], [37, 0xf0c04a, 0x2f6fb3]].forEach(function (q) { pkAmbFlag(130.2, q[0], 7.5, q[1], q[2]); });
    pkAmbFlag(-15.8, 39.5, 8.5, 0xb8231c, 0xf5b53d); pkAmbFlag(15.8, 39.5, 8.5, 0xf5b53d, 0xb8231c);
    pkAmbBirdsBuild(); pkAmbFliesBuild(); pkAmbFireBuild(); pkAmbSteamBuild();
  }
  function pkAmbientTick(dt) {
    if (!PK_AMB.built || !dt) return;
    var d = Math.min(dt, 0.1); PK_AMB.t += d;
    pkAmbLamps(d); pkAmbWater(d); pkAmbFlags(d); pkAmbBirds(d); pkAmbFlies(d); pkAmbFire(d); pkAmbSteam(d);
  }
  var _pkAmbPrevTheme = pkThemeBuild;
  pkThemeBuild = function () { _pkAmbPrevTheme(); pkAmbientBuild(); };
  hook('frame', function (dt) { pkAmbientTick(dt); });

  var _pkAmbPrevT = GAME.T;
  GAME.T = function () { var t = _pkAmbPrevT(); t.PK_AMB = PK_AMB; t.pkAmbientTick = pkAmbientTick; t.pkAmbFlame = pkAmbFlame; return t; };
