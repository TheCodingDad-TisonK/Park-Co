//@ Park Co, part 40: the Lindenburg Railway - the route, the track and the level crossings.
  // A narrow-gauge steam railway rings the park outside its fence: four stations, a depot siding north of the park and three level
  // crossings. The route is a rounded rectangle (clockwise on the map, north is -z). Everything on it is built from the headless
  // map of the world: W = -128 keeps the west run clear of the tree belt, E = 170 and S = 112 clear the Mountain King and the town.
  // Local frame of anything standing on the line: +x is the way the train runs, +z is its right hand (the platform side, toward the park).
  var TR = {
    W: -128, E: 170, N: -134, S: 112, R: 24, GAUGE: 1.0,
    main: null, byp: null, sJ1: 0, sJ2: 0, dL: 0, M: null,
    st: [], xing: [], units: [], len: 56, built: false, t: null, depot: null
  };
  var TR_GAPS = [   // the gates the stations have in the park's palisade: { axis: the run's own axis, x, z, w }
    { axis: 'z', x: -32.5, z: 62, w: 5 }, { axis: 'z', x: 123, z: -2, w: 5 },   { axis: 'x', x: 95, z: 71, w: 5 }
  ];
  // the palisade steps around each gate: the run is cut in two and each half is built (and made solid) on its own
  var _trPalisade = pkPalisade;
  pkPalisade = function (x0, z0, x1, z1) {
    for (var i = 0; i < TR_GAPS.length; i++) {
      var g = TR_GAPS[i], h = g.w / 2;
      if (g.axis === 'z' && Math.abs(x0 - g.x) < 0.01 && Math.abs(x1 - g.x) < 0.01 && g.z > Math.min(z0, z1) + h && g.z < Math.max(z0, z1) - h) {
        var lo = Math.min(z0, z1), hi = Math.max(z0, z1);
        pkPalisade(x0, lo, x0, g.z - h); pkPalisade(x0, g.z + h, x0, hi); return;
      }
      if (g.axis === 'x' && Math.abs(z0 - g.z) < 0.01 && Math.abs(z1 - g.z) < 0.01 && g.x > Math.min(x0, x1) + h && g.x < Math.max(x0, x1) - h) {
        var l2 = Math.min(x0, x1), h2 = Math.max(x0, x1);
        pkPalisade(l2, z0, g.x - h, z0); pkPalisade(g.x + h, z0, h2, z0); return;
      }
    }
    return _trPalisade(x0, z0, x1, z1);
  };

  // ── Materials ─────────────────────────────────────────────────────
  function trMats() {
    if (TR.M) return TR.M;
    var M = TR.M = {}, P = pkMats();
    M.ballast = std({ color: 0x5a5750, roughness: 1 });
    M.sleeper = std({ color: 0x4b3a2a, roughness: 0.95 });
    M.rail = std({ color: 0xaeb4ba, roughness: 0.32, metalness: 0.85 });
    M.deck = std({ color: 0x3a3d42, roughness: 0.9 });
    M.coal = std({ color: 0x15161a, roughness: 0.7, metalness: 0.2 });
    M.green = pkPaint(0x1d5b3b, 0.38, 0.35);      // loco green
    M.greenD = pkPaint(0x123a27, 0.4, 0.3);
    M.black = pkPaint(0x14161a, 0.45, 0.4);
    M.red = pkPaint(0xb3262b, 0.4, 0.3);
    M.cream = pkPaint(0xefe3c2, 0.5, 0.1);
    M.wood = std({ map: TEX.wood || null, color: 0x9a6b3d, roughness: 0.85 });
    M.woodD = std({ color: 0x5a3b22, roughness: 0.9 });
    M.brass = P.brass; M.gold = P.gold; M.iron = P.iron; M.stone = P.stone; M.stoneDark = P.stoneDark; M.cream2 = P.cream;
    M.slateRed = P.slateRed; M.slate = P.slate; M.glass = P.glass; M.rubber = P.rubber; M.seat = P.seat; M.white = P.white;
    M.led = new THREE.MeshBasicMaterial({ color: 0x331111 });          // swapped red/dark by the crossings: not a "glow" lens, so the park lights switch leaves it alone
    M.ledOn = new THREE.MeshBasicMaterial({ color: 0xff2a1e });
    M.ledGreen = new THREE.MeshBasicMaterial({ color: 0x3ddc6a }); M.ledAmber = new THREE.MeshBasicMaterial({ color: 0xffb02e }); M.ledOff = new THREE.MeshBasicMaterial({ color: 0x20262b });
    M.lampOn = new THREE.MeshBasicMaterial({ color: 0xfff0c0 }); M.lampOff = new THREE.MeshBasicMaterial({ color: 0x59564c });
    ['led', 'ledOn', 'ledGreen', 'ledAmber', 'ledOff', 'lampOn', 'lampOff'].forEach(function (k) { M[k].userData.noBake = true; keepShared(M[k]); });
    return M;
  }
  var TR_UP = new THREE.Vector3(0, 1, 0);
  function trCone(r, h, mat, x, y, z, parent, seg) { var m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg || 12), mat); m.position.set(x, y, z); m.castShadow = true; (parent || scene).add(m); return m; }
  function trDyn(parent) { var g = new THREE.Group(); g.userData.dynamic = true; (parent || scene).add(g); return g; }
  function trFrameGroup(x, z, yaw, parent) { var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; (parent || scene).add(g); return g; }
  function trInstanced(geo, mat, mats, shadow) {
    var im = new THREE.InstancedMesh(geo, mat, mats.length);
    for (var i = 0; i < mats.length; i++) im.setMatrixAt(i, mats[i]);
    im.instanceMatrix.needsUpdate = true; im.castShadow = !!shadow; im.receiveShadow = true; im.frustumCulled = false; scene.add(im); return im;
  }

  // ── The route ─────────────────────────────────────────────────────
  // a closed (or open) polyline resampled to an even step, so a distance along it is an index
  function trResample(raw, closed) {
    var n0 = raw.length, cum = [0], i;
    for (i = 1; i < n0; i++) cum.push(cum[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
    var L = cum[n0 - 1];
    if (closed) { L += Math.hypot(raw[0][0] - raw[n0 - 1][0], raw[0][1] - raw[n0 - 1][1]); cum.push(L); }
    var n = Math.max(2, Math.round(L)), ds = closed ? L / n : L / (n - 1), xs = new Float32Array(n), zs = new Float32Array(n), j = 0;
    for (i = 0; i < n; i++) {
      var d = i * ds;
      while (j < cum.length - 2 && cum[j + 1] < d) j++;
      var a = raw[j], b = raw[(j + 1) % n0], seg = cum[j + 1] - cum[j] || 1, u = Math.max(0, Math.min(1, (d - cum[j]) / seg));
      xs[i] = a[0] + (b[0] - a[0]) * u; zs[i] = a[1] + (b[1] - a[1]) * u;
    }
    return { x: xs, z: zs, n: n, ds: ds, L: closed ? L : (n - 1) * ds, closed: closed };
  }
  // a point, the heading (yaw for rotation.y and the unit vector) at distance s along a resampled path
  function trSamp(P, s, o) {
    var n = P.n, f = s / P.ds, i = Math.floor(f), u = f - i, i2, ia, ib;
    if (P.closed) { i = ((i % n) + n) % n; i2 = (i + 1) % n; ia = (i + n - 1) % n; ib = (i + 2) % n; }
    else { if (i < 0) { i = 0; u = 0; } if (i > n - 2) { i = n - 2; u = 1; } i2 = i + 1; ia = Math.max(0, i - 1); ib = Math.min(n - 1, i + 2); }
    o.x = P.x[i] + (P.x[i2] - P.x[i]) * u; o.z = P.z[i] + (P.z[i2] - P.z[i]) * u;
    var dx = P.x[ib] - P.x[ia], dz = P.z[ib] - P.z[ia], l = Math.hypot(dx, dz) || 1;
    o.dx = dx / l; o.dz = dz / l; o.yaw = Math.atan2(-o.dz, o.dx); return o;
  }
  // the train's own coordinate s runs along the route it took: 'M' the main loop, 'D' the loop that passes through the depot
  function trLoopLen(mode) { return TR.main.L + (mode === 'D' ? TR.dL : 0); }
  function trPos(s, mode, o) {
    var L = trLoopLen(mode); s = ((s % L) + L) % L;
    if (mode === 'D' && s >= TR.sJ1) { if (s <= TR.sJ1 + TR.byp.L) return trSamp(TR.byp, s - TR.sJ1, o); s -= TR.dL; }
    return trSamp(TR.main, s, o);
  }
  function trNearestS(x, z) {
    var P = TR.main, best = 1e18, bi = 0;
    for (var i = 0; i < P.n; i++) { var d = (P.x[i] - x) * (P.x[i] - x) + (P.z[i] - z) * (P.z[i] - z); if (d < best) { best = d; bi = i; } }
    return bi * P.ds;
  }
  function trBuildRoute() {
    var R = TR.R, W = TR.W, E = TR.E, N = TR.N, S = TR.S, cs = [[W, N], [E, N], [E, S], [W, S]], raw = [];
    for (var i = 0; i < 4; i++) {
      var p = cs[(i + 3) % 4], c = cs[i], nx = cs[(i + 1) % 4];
      var d1x = Math.sign(c[0] - p[0]), d1z = Math.sign(c[1] - p[1]), d2x = Math.sign(nx[0] - c[0]), d2z = Math.sign(nx[1] - c[1]);
      var ax = c[0] - d1x * R, az = c[1] - d1z * R, cx = ax + d2x * R, cz = az + d2z * R;
      var a0 = Math.atan2(az - cz, ax - cx), a1 = Math.atan2(c[1] + d2z * R - cz, c[0] + d2x * R - cx), da = a1 - a0;
      while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      for (var k = 0; k <= 24; k++) { var t = a0 + da * k / 24; raw.push([cx + Math.cos(t) * R, cz + Math.sin(t) * R]); }
    }
    TR.main = trResample(raw, true);
    // the depot siding: it leaves the north run at x = J1, runs 12 m north through the shed and rejoins at x = J2
    var J1 = -4, J2 = 140, H = 12, EASE = 46, bp = [];
    for (var x = J1; x <= J2 + 0.01; x += 0.5) {
      var off = x < J1 + EASE ? H * (1 - Math.cos(Math.PI * (x - J1) / EASE)) / 2 : x > J2 - EASE ? H * (1 - Math.cos(Math.PI * (J2 - x) / EASE)) / 2 : H;
      bp.push([x, N - off]);
    }
    TR.byp = trResample(bp, false);
    TR.sJ1 = trNearestS(J1, N); TR.sJ2 = trNearestS(J2, N); TR.dL = TR.byp.L - (TR.sJ2 - TR.sJ1);
    TR.J1 = J1; TR.J2 = J2;
  }

  // ── The track: ballast, sleepers and rails ────────────────────────
  function trRibbon(P, w, y, mat, s0, s1) {
    var pos = [], idx = [], uv = [], o = {}, a = s0 === undefined ? 0 : s0, b = s1 === undefined ? P.L : s1, n = Math.max(2, Math.round((b - a) / 2)), k;
    for (k = 0; k <= n; k++) {
      var s = a + (b - a) * k / n; trSamp(P, s, o);
      var rx = -o.dz, rz = o.dx;
      pos.push(o.x - rx * w / 2, y, o.z - rz * w / 2, o.x + rx * w / 2, y, o.z + rz * w / 2); uv.push(0, s / 2, 1, s / 2);
      if (k > 0) { var q = (k - 1) * 2; idx.push(q, q + 2, q + 1, q + 1, q + 2, q + 3); }
    }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    var m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.frustumCulled = false; scene.add(m); return m;
  }
  function trLayTrack(P, a, b) {
    var M = trMats(), o = {}, sl = [], rl = [], mm = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1), pv = new THREE.Vector3(), s;
    for (s = a; s < b; s += 0.8) { trSamp(P, s, o); q.setFromAxisAngle(TR_UP, o.yaw); pv.set(o.x, 0.09, o.z); sl.push(new THREE.Matrix4().compose(pv.clone(), q.clone(), sc)); }
    for (s = a; s < b; s += 1.0) {
      trSamp(P, s + 0.5, o); q.setFromAxisAngle(TR_UP, o.yaw);
      [-1, 1].forEach(function (side) { var rx = -o.dz * side * TR.GAUGE / 2, rz = o.dx * side * TR.GAUGE / 2; pv.set(o.x + rx, 0.2, o.z + rz); rl.push(new THREE.Matrix4().compose(pv.clone(), q.clone(), sc)); });
    }
    trInstanced(new THREE.BoxGeometry(0.2, 0.1, 1.9), M.sleeper, sl, false);
    trInstanced(new THREE.BoxGeometry(1.08, 0.12, 0.08), M.rail, rl, false);
  }
  function trBuildTrack() {
    var M = trMats();
    trRibbon(TR.main, 3.3, 0.05, M.ballast); trLayTrack(TR.main, 0, TR.main.L);
    trRibbon(TR.byp, 3.3, 0.05, M.ballast); trLayTrack(TR.byp, 0, TR.byp.L);
    // the road west of the park ends at the line: a short stub so the west crossing has a road to cross
    pkSlab(40, 8, -120, 76, 0.011, pkAsphalt());
    box(40, 0.02, 0.14, MAT.whiteLine, -120, 0.022, 76);
  }

  // ── Level crossings ───────────────────────────────────────────────
  // Poles that climb out of the ground either side of the line, red LEDs that flash in turn and a two-tone warning, from when the
  // head of the train is 80 m out until the last wagon has cleared. lanes: where along the road the poles stand (the road's width).
  var TR_XDEFS = [
    { id: 'west', x: -128, z: 76, lanes: [-2.9, 0, 2.9], road: true },
    { id: 'east', x: 170, z: 76, lanes: [-2.9, 0, 2.9], road: true },
    { id: 'lane', x: -17, z: -134, lanes: [-1.4, 1.4], road: false }
  ];
  function trBuildCrossings() {
    var M = trMats(), strip = pkStripes('#d83a34', '#f6f6f2');
    TR_XDEFS.forEach(function (d) {
      var s = trNearestS(d.x, d.z), o = trSamp(TR.main, s, {}), g = trFrameGroup(o.x, o.z, o.yaw), dyn = trDyn(g);
      var X = { id: d.id, s: s, x: o.x, z: o.z, yaw: o.yaw, dx: o.dx, dz: o.dz, g: g, poles: [], leds: [], lanes: d.lanes, road: d.road, up: 0, active: false, beepT: 0, flip: 0, hold: false };
      // the crossing deck: planks between and beside the rails
      box(3.4, 0.07, d.road ? 8.4 : 3.6, M.deck, 0, 0.085, 0, g);
      // a sleeper-and-sand apron at each side
      [-1, 1].forEach(function (side) {
        d.lanes.forEach(function (lane) {
          var pole = new THREE.Group(); pole.position.set(lane, -1.35, side * 2.5); dyn.add(pole);
          var p = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 1.4, 12), strip); p.position.y = 0.7; p.castShadow = true; pole.add(p);
          sphere(0.1, M.iron, 0, 1.43, 0, pole);
          var led = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), M.led); led.position.set(0, 1.3, side * -0.07); pole.add(led); led.userData.noBake = true;
          X.poles.push(pole); X.leds.push({ m: led, phase: (side > 0 ? 0 : 1) });
        });
        // the signal mast: a cross-buck, two LED lenses and the horn, either side of the road
        var mast = new THREE.Group(); mast.position.set(d.lanes[d.lanes.length - 1] + 1.9, 0, side * 3.3); g.add(mast);
        pkRoundCyl(0.06, 3.1, M.iron, 0, 1.55, 0, mast, 8);
        var bx = box(0.14, 0.9, 0.9, M.white, 0, 2.55, 0, mast); bx.rotation.x = 0;
        [-0.25, 0.25].forEach(function (zz, k) { var lens = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), M.led); lens.position.set(0.08, 2.55, zz); mast.add(lens); lens.userData.noBake = true; X.leds.push({ m: lens, phase: k }); });
        box(0.04, 0.6, 0.6, M.red, 0.075, 2.55, 0, mast);
      });
      TR.xing.push(X);
    });
  }
  // the poles are a wall while they are up
  function trXingBlocks(x, z) {
    for (var i = 0; i < TR.xing.length; i++) {
      var X = TR.xing[i]; if (X.up < 0.55) continue;
      var dx = x - X.x, dz = z - X.z, lx = dx * X.dx + dz * X.dz, lz = -dx * X.dz + dz * X.dx;   // local to the line
      if (Math.abs(lz) < 3.1 && Math.abs(lx) < 6.0 && Math.abs(lz) > 1.8) { return true; }
    }
    return false;
  }
