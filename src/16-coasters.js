//@ Park Co, part 16: the big coasters - a track kit that keeps a train upright through a loop, and the two outdoor loopers
  // ── The coaster kit ───────────────────────────────────────────────
  // A coaster is a closed curve sampled into frames that follow it: parallel transport keeps the train upright
  // through a vertical loop, and a little bank rolls it into the turns. The same frames draw the rails, the ties,
  // the spine and the legs, and one car builder serves every new coaster, so they all sit at the main line's standard.
  var PK_CO_UP = new THREE.Vector3(), PK_CO_RIGHT = new THREE.Vector3(), PK_CO_M4 = new THREE.Matrix4();
  var PK_CO_Q = new THREE.Quaternion();

  function pkCoCurve(pts) {
    return new THREE.CatmullRomCurve3(pts.map(function (p) { return new THREE.Vector3(p[0], p[1], p[2]); }), true, 'catmullrom', 0.5);
  }
  // the u of the track point nearest a world x/z: stations are found this way, never guessed
  function pkCoUAt(curve, x, z) {
    var best = 0, bd = Infinity;
    for (var i = 0; i < 900; i++) {
      var p = curve.getPointAt(i / 900), d = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z);
      if (d < bd) { bd = d; best = i; }
    }
    return best / 900;
  }
  // frames: position, tangent and 'up' at N points round the lap
  function pkCoFrames(curve, N) {
    var pts = [], tans = [], ups = [], i;
    for (i = 0; i < N; i++) { pts.push(curve.getPointAt(i / N)); tans.push(curve.getTangentAt(i / N).normalize()); }
    var up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(up.dot(tans[0])) > 0.92) up.set(1, 0, 0);
    up.addScaledVector(tans[0], -up.dot(tans[0])).normalize();
    ups.push(up.clone());
    for (i = 1; i < N; i++) {
      PK_CO_Q.setFromUnitVectors(tans[i - 1], tans[i]);
      up.applyQuaternion(PK_CO_Q);
      up.addScaledVector(tans[i], -up.dot(tans[i]));
      if (up.lengthSq() < 1e-5) up.set(0, 1, 0).addScaledVector(tans[i], -tans[i].y);
      up.normalize();
      ups.push(up.clone());
    }
    // close the frame: spread the twist from the last sample back round to the first
    PK_CO_Q.setFromUnitVectors(tans[N - 1], tans[0]);
    var v = new THREE.Vector3().copy(ups[N - 1]).applyQuaternion(PK_CO_Q);
    var cr = new THREE.Vector3().crossVectors(ups[0], v);
    var tw = Math.atan2(cr.dot(tans[0]), ups[0].dot(v));
    for (i = 0; i < N; i++) {
      PK_CO_Q.setFromAxisAngle(tans[i], -tw * i / N);
      ups[i].applyQuaternion(PK_CO_Q);
    }
    // bank into the turns; a loop's curvature is 'up', not 'left', so it never rolls there
    // The bank is driven by the SIDEWAYS part of the bend only (continuous, not just its sign), then smoothed
    // round the lap, so a loop (all bend is 'up') stays at zero roll and the rails run as clean curves.
    var ds = curve.getLength() / N, angs = [], lefts = [];
    for (i = 0; i < N; i++) {
      var a = tans[(i - 1 + N) % N], b = tans[(i + 1) % N];
      var kk = new THREE.Vector3().subVectors(b, a);
      var left = new THREE.Vector3().crossVectors(ups[i], tans[i]).normalize();
      lefts.push(left);
      if (kk.lengthSq() < 1e-10) { angs.push(0); continue; }
      var curv = Math.acos(clamp(a.dot(b), -1, 1)) / (2 * ds);
      var lat = curv * kk.normalize().dot(left);              // signed sideways curvature
      angs.push(Math.atan(clamp(lat * 13.5, -0.9, 0.9)));
    }
    for (var pass = 0; pass < 14; pass++) {
      var prev = angs.slice();
      for (i = 0; i < N; i++) angs[i] = prev[(i - 1 + N) % N] * 0.25 + prev[i] * 0.5 + prev[(i + 1) % N] * 0.25;
    }
    for (i = 0; i < N; i++) {
      var ang = angs[i], left = lefts[i];
      if (Math.abs(ang) < 0.004) continue;
      var nu = ups[i].clone().multiplyScalar(Math.cos(ang)).addScaledVector(left, Math.sin(ang));
      nu.addScaledVector(tans[i], -nu.dot(tans[i])).normalize();
      ups[i].copy(nu);
    }
    return { p: pts, t: tans, up: ups, n: N };
  }
  function pkCoUpAt(F, u) {
    var x = u * F.n, i0 = Math.floor(x) % F.n, i1 = (i0 + 1) % F.n, f = x - Math.floor(x);
    PK_CO_UP.copy(F.up[i0]).lerp(F.up[i1], f).normalize();
    return PK_CO_UP;
  }
  // ── The car ───────────────────────────────────────────────────────
  // One 2-seat car: the running wheels sit on the rails (the car's origin is the rail line), the tub is
  // glass-fibre over a steel frame, and the lap bar is a padded U that drops over both laps.
  function pkCoCar(col, opt) {
    opt = opt || {};
    var g = new THREE.Group(); g.userData.dynamic = true; g.userData.keep = true;
    var W = opt.w || 1.44, D = opt.d || 2.02;
    var body = std({ color: col, roughness: 0.34, metalness: 0.14 });
    var trim = std({ color: 0xf2f3f0, roughness: 0.5, metalness: 0.1 });
    [[-0.56, 0.62], [0.56, 0.62], [-0.56, -0.62], [0.56, -0.62]].forEach(function (w) {
      var wh = pkRoundCyl(0.15, 0.11, MAT.steelDark, w[0], 0, w[1], g, 10); wh.rotation.z = Math.PI / 2;
      var hub = pkRoundCyl(0.055, 0.13, MAT.chrome, w[0], 0, w[1], g, 8); hub.rotation.z = Math.PI / 2;
    });
    pkBevelBox(W * 0.78, 0.13, D * 0.9, MAT.steelDark, 0, 0.17, 0, g, 0.02);
    pkBevelBox(W - 0.08, 0.08, D - 0.1, body, 0, 0.27, 0, g, 0.03);
    [-1, 1].forEach(function (sx) {
      pkBevelBox(0.08, 0.5, D - 0.1, body, sx * (W / 2 - 0.04), 0.53, 0, g, 0.03);
      pkRoundCyl(0.03, D - 0.2, MAT.chrome, sx * (W / 2 - 0.04), 0.79, 0, g, 8).rotation.x = Math.PI / 2;
    });
    [-1, 1].forEach(function (sz) {
      pkBevelBox(W - 0.12, 0.5, 0.08, body, 0, 0.53, sz * (D / 2 - 0.04), g, 0.03);
    });
    // the nose and the tail caps
    pkBevelBox(W * 0.78, 0.3, 0.2, body, 0, 0.42, D / 2 + 0.02, g, 0.06);
    pkBevelBox(W * 0.82, 0.16, 0.16, trim, 0, 0.62, D / 2 + 0.02, g, 0.04);
    // two seats, side by side; the platform-side one is filled first
    [-0.31, 0.31].forEach(function (sx) {
      pkBevelBox(0.5, 0.09, 0.6, MAT.seat, sx, 0.66, -0.06, g, 0.03);
      pkBevelBox(0.5, 0.56, 0.11, MAT.seat, sx, 0.97, -0.4, g, 0.03);
      pkBevelBox(0.34, 0.22, 0.1, body, sx, 1.3, -0.42, g, 0.03);
    });
    // lap bar: a padded U on a pivot behind the seats
    var bar = new THREE.Group(); bar.position.set(0, 0.76, -0.55); g.add(bar);
    pkRoundCyl(0.045, 0.94, MAT.steelDark, 0, 0.28, 0.62, bar, 8).rotation.z = Math.PI / 2;
    pkRoundCyl(0.075, 0.7, MAT.rubberMat, 0, 0.28, 0.62, bar, 8).rotation.z = Math.PI / 2;
    [-0.42, 0.42].forEach(function (sx) {
      pkRod(sx, 0, 0, sx, 0.28, 0.62, 0.04, MAT.steelDark, bar, 6);
    });
    return { g: g, bar: bar, seats: [{ x: -0.31, y: -0.06, z: -0.02 }, { x: 0.31, y: -0.06, z: -0.02 }] };
  }
  // ── Placing the train ─────────────────────────────────────────────
  function pkCoPlace(E, u0) {
    for (var i = 0; i < E.cars.length; i++) {
      var u = (u0 - i * E.gap / E.len + 1) % 1;
      var p = E.curve.getPointAt(u), t = E.curve.getTangentAt(u).normalize();
      pkCoUpAt(E.F, u);
      PK_CO_RIGHT.crossVectors(PK_CO_UP, t).normalize();
      PK_CO_M4.makeBasis(PK_CO_RIGHT, PK_CO_UP, t);
      var car = E.cars[i].g;
      car.position.copy(p);
      car.quaternion.setFromRotationMatrix(PK_CO_M4);
      car.updateMatrixWorld(true);
    }
  }
  // The lap plan: a speed for every point (fast at the bottom, slow over the crest and through the station),
  // integrated once so progress by time maps exactly back onto the track. The lap closes on the button.
  function pkCoPlan(E, o) {
    var K = 240, curve = E.curve, len = E.len, u0 = E.uPark, i;
    var ys = [], ymin = Infinity, ymax = -Infinity;
    for (i = 0; i <= K; i++) {
      var y = curve.getPointAt((u0 + i / K) % 1).y;
      ys.push(y);
      if (y < ymin) ymin = y;
      if (y > ymax) ymax = y;
    }
    var vMin = o.vMin || 5, vMax = o.vMax || 22, T = [0], S = len / K;
    for (i = 1; i <= K; i++) {
      var v = vMin + (vMax - vMin) * (ymax - ys[i]) / Math.max(0.5, ymax - ymin);
      v = clamp(v, vMin, vMax);
      var f0 = (i - 0.5) / K;
      if (f0 < 0.05 || f0 > 0.95) v *= 0.5;
      T[i] = T[i - 1] + S / v;
    }
    var M = 240, uOfF = [];
    for (var k = 0; k <= M; k++) {
      var tt = (k / M) * T[K], j = 1;
      while (j < K && T[j] < tt) j++;
      var t0 = T[j - 1], t1 = T[j], f = t1 > t0 ? (tt - t0) / (t1 - t0) : 0;
      uOfF.push((u0 + (j - 1 + f) / K) % 1);
    }
    E.uOfF = uOfF;
    E.run = Math.max(12, Math.round(T[K] * 10) / 10);
  }
  function pkCoRun(at) {
    var E = at.extra;
    if (!E || !E.uOfF || !E.uOfF.length) return;
    var f = at.state === 'running' ? clamp(at.t / at.run, 0, 1) : 0;
    var k = Math.max(0, Math.min(240, Math.round(f * 240)));
    pkCoPlace(E, E.uOfF[k]);
  }
  // ── The track ─────────────────────────────────────────────────────
  function pkCoTrackBuild(g, E, o) {
    o = o || {};
    var N = E.F.n, i, gauge = o.gauge || 1.12, M = pkMats();
    var railMat = o.railMat || MAT.chrome, spineMat = o.spineMat || M.white, tieMat = o.tieMat || MAT.steelDark;
    var railA = [], railB = [], spine = [];
    for (i = 0; i < N; i++) {
      var p = E.F.p[i], up = E.F.up[i], t = E.F.t[i];
      var right = new THREE.Vector3().crossVectors(up, t).normalize();
      railA.push(p.clone().addScaledVector(right, gauge / 2).addScaledVector(up, 0.08));
      railB.push(p.clone().addScaledVector(right, -gauge / 2).addScaledVector(up, 0.08));
      spine.push(p.clone().addScaledVector(up, -0.56));
    }
    [railA, railB].forEach(function (rp) {
      var c = new THREE.CatmullRomCurve3(rp, true, 'catmullrom', 0.5);
      var m = new THREE.Mesh(new THREE.TubeGeometry(c, N, 0.075, 6, true), railMat);
      m.castShadow = true; m.receiveShadow = true; g.add(m);
    });
    var sp = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spine, true, 'catmullrom', 0.5), N, 0.15, 10, true), spineMat);
    sp.castShadow = true; sp.receiveShadow = true; g.add(sp);
    // ties
    var tieN = Math.max(8, Math.round(E.len / 1.7));
    for (i = 0; i < tieN; i++) {
      var u = i / tieN;
      var pp = E.curve.getPointAt(u), tt = E.curve.getTangentAt(u).normalize();
      pkCoUpAt(E.F, u);
      var rr = new THREE.Vector3().crossVectors(PK_CO_UP, tt).normalize();
      var tie = box(1.32, 0.07, 0.2, tieMat, 0, 0, 0, g, { r: 0.01 });
      tie.position.copy(pp).addScaledVector(PK_CO_UP, 0.01);
      PK_CO_M4.makeBasis(rr, PK_CO_UP, tt);
      tie.quaternion.setFromRotationMatrix(PK_CO_M4);
      // truss: a strut from each rail down to the spine, so the track reads as a triangular lattice
      var sp0 = pp.clone().addScaledVector(PK_CO_UP, -0.56);
      [-1, 1].forEach(function (sd) {
        var rp0 = pp.clone().addScaledVector(rr, sd * gauge / 2).addScaledVector(PK_CO_UP, 0.08);
        pkRod(rp0.x, rp0.y, rp0.z, sp0.x, sp0.y, sp0.z, 0.035, spineMat, g, 6);
      });
    }
    // legs: a column wherever the track is off the ground and not standing on its head
    var step = Math.max(1, Math.round(N * 5.4 / E.len)), last = null;
    for (i = 0; i < N; i += step) {
      var p2 = E.F.p[i], t2 = E.F.t[i];
      if (Math.abs(t2.y) > 0.72 || p2.y < 1.5) continue;
      if (last && dist2(p2.x, p2.z, last.x, last.z) < 10) continue;
      if (o.skip && o.skip(p2.x, p2.z, p2.y)) continue;
      var h = p2.y - 0.6;
      if (h < 0.8) continue;
      cyl(0.16, h, o.supMat || MAT.steel, p2.x, h / 2, p2.z, g, 8);
      box(0.62, 0.2, 0.62, M.stone, p2.x, 0.1, p2.z, g);
      box(0.34, 0.26, 0.34, o.supMat || MAT.steel, p2.x, h + 0.05, p2.z, g);
      solid(p2.x - 0.24, p2.x + 0.24, p2.z - 0.24, p2.z + 0.24, 0, h);
      last = p2;
    }
  }
  // ── The station ───────────────────────────────────────────────────
  // A kerbed platform, a row of boom gates that rise off the platform edge, and a cantilevered canopy
  // carrying the name. The lane's own gate is the barrier; these are the gates at the train itself.
  function pkCoGates(g, xs, z, C) {
    xs.forEach(function (x) {
      pkRoundCyl(0.09, 1.06, MAT.steelDark, x, 0.53, z, g, 8);
      var boom = new THREE.Group(); boom.position.set(x, 0.92, z); g.add(boom);
      box(0.92, 0.09, 0.07, MAT.hazard, 0.46, 0, 0, boom, { r: 0.02 });
      box(0.92, 0.05, 0.05, MAT.steel, 0.46, -0.2, 0, boom);
      for (var i = 0; i < 4; i++) box(0.04, 0.22, 0.04, MAT.steel, 0.12 + i * 0.24, -0.11, 0, boom);
      box(0.1, 0.14, 0.1, MAT.red, 0.9, 0, 0, boom);
      C.gateObjs.push(function (t) { boom.rotation.z = t * Math.PI / 2.1; });
    });
  }
  function pkCoCanopy(g, x0, x1, zSouth, depth, label, th) {
    var i, x;
    for (i = 0; i < 4; i++) {
      x = x0 + 0.45 + (x1 - x0 - 0.9) * i / 3;
      pkRoundCyl(0.085, 3.0, MAT.steelDark, x, 1.5, zSouth, g, 8);
      pkRod(x, 3.0, zSouth, x, 3.0, zSouth - depth + 0.2, 0.05, MAT.steel, g, 6);
      solid(x - 0.14, x + 0.14, zSouth - 0.14, zSouth + 0.14, 0, 3.0);
    }
    var mid = (x0 + x1) / 2;
    box(x1 - x0, 0.1, depth, pkMats().roof, mid, 3.06, zSouth - depth / 2, g);
    box(x1 - x0, 0.06, depth - 0.3, std({ color: th.a, roughness: 0.6 }), mid, 3.12, zSouth - depth / 2, g);
    box(x1 - x0, 0.34, 0.1, MAT.steelDark, mid, 3.02, zSouth + 0.02, g);
    pkSign3D([label], Math.min(4.8, x1 - x0 - 1.2), 0.28, mid, 3.02, zSouth + 0.08, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);
    [-1, 1].forEach(function (sx) {
      pkRoundCyl(0.16, 0.22, MAT.bulb, mid + sx * (x1 - x0) / 4, 2.86, zSouth - 0.6, g, 10);
    });
  }
  // a coaster platform: kerb, deck, edge stripe, a plant tub and a lamp at each end
  function pkCoPlatform(g, x0, x1, zN, zS, th) {
    box(x1 - x0, 0.12, zS - zN, pkMats().kerb, (x0 + x1) / 2, 0.06, (zN + zS) / 2, g);
    box(x1 - x0 - 0.12, 0.07, zS - zN - 0.12, pkMats().pavers, (x0 + x1) / 2, 0.145, (zN + zS) / 2, g);
    box(x1 - x0, 0.03, 0.16, MAT.hazard, (x0 + x1) / 2, 0.17, zN + 0.08, g);
    [x0 + 0.5, x1 - 0.5].forEach(function (x) {
      pkRoundCyl(0.26, 0.5, MAT.stone, x, 0.25, zS - 0.4, g, 12);
      pkRoundCyl(0.3, 0.08, MAT.stone, x, 0.52, zS - 0.4, g, 12);
      pkRoundCyl(0.04, 2.5, MAT.steelDark, x, 1.25, zS - 0.34, g, 8);
      pkRoundCyl(0.17, 0.24, MAT.bulb, x, 2.6, zS - 0.34, g, 10);
    });
  }
  // a lone support tower for the steep stretches the sampler rightly refuses: a column beside the
  // track with a rod out to the spine
  function pkCoBrace(g, x, z, h, tx, ty, tz, mat) {
    cyl(0.17, h, mat, x, h / 2, z, g, 8);
    box(0.62, 0.2, 0.62, pkMats().stone, x, 0.1, z, g);
    solid(x - 0.24, x + 0.24, z - 0.24, z + 0.24, 0, h);
    pkRod(x, h - 0.12, z, tx, ty, tz, 0.07, mat, g, 6);
  }
  // ── The Serpent ───────────────────────────────────────────────────
  // A double looper in the north-east corner: out of the station, up the lift, down the first drop
  // and straight into two vertical loops, then home along the trees.
  var PK_SERPENT_PTS = [
    [47.5, 1.05, -70], [53.5, 1.05, -70], [59.5, 1.05, -70],
    [63.5, 2.2, -70.6], [65.1, 6, -72], [65.5, 11, -74.5], [64, 14.8, -77.5],
    [61.5, 12, -80.2], [58.5, 5.5, -81.2],
    [56.9, 2.5, -81.6], [54.2, 3.12, -81.6], [52.22, 5.1, -81.6], [51.5, 7.8, -81.6],
    [52.22, 10.5, -81.6], [54.2, 12.48, -81.6], [56.9, 13.2, -81.6], [59.6, 12.48, -81.6],
    [61.58, 10.5, -81.6], [62.3, 7.8, -81.6], [61.58, 5.1, -81.6], [59.6, 3.12, -81.6],
    [56.5, 2.45, -81.7], [54.1, 2.6, -82.6], [52.1, 2.85, -83.9],
    [50.1, 3.3, -84.1], [48.05, 3.85, -84.1], [46.55, 5.35, -84.1], [46.0, 7.4, -84.1],
    [46.55, 9.45, -84.1], [48.05, 10.95, -84.1], [50.1, 11.5, -84.1], [52.15, 10.95, -84.1],
    [53.65, 9.45, -84.1], [54.2, 7.4, -84.1], [53.65, 5.35, -84.1], [52.15, 3.85, -84.1],
    [49.7, 3.35, -84.0], [47.4, 3.5, -83.6], [45.7, 4.6, -82.4], [44.8, 6.0, -80.3],
    [45.0, 5.6, -77.7], [46.0, 4.4, -75.3], [46.9, 2.6, -72.7]
  ];
  function pkBuildSerpent(p) {
    var th = PK_THEME.serpent, M = pkMats(), i;
    var g = new THREE.Group(); scene.add(g);
    var curve = pkCoCurve(PK_SERPENT_PTS), len = curve.getLength(), F = pkCoFrames(curve, 520);
    var E = { curve: curve, len: len, F: F, gap: 2.35, cars: [], uPark: pkCoUAt(curve, 57.4, -70), uOfF: [], run: 30 };
    var seats = [], cols = [0x2f8f6f, 0xf0c04a, 0x1f6f55, 0xf0c04a, 0x2f8f6f];
    for (i = 0; i < 5; i++) {
      var car = pkCoCar(cols[i]);
      scene.add(car.g);
      E.cars.push(car);
      car.seats.forEach(function (s) {
        seats.push({ par: car.g, x: s.x, y: s.y, z: s.z, ry: 0, guest: null });
      });
    }
    var spineMat = std({ color: 0xeef2f1, roughness: 0.4, metalness: 0.35 });
    var supMat = std({ color: 0x2c7a63, roughness: 0.55, metalness: 0.25 });
    pkCoTrackBuild(g, E, {
      spineMat: spineMat, supMat: supMat, tieMat: std({ color: 0x35514b, roughness: 0.7 }),
      skip: function (x, z) { return z > -71.6 && x > 46 && x < 60; }
    });
    pkCoBrace(g, 66.2, -73.2, 9.6, 65.2, 9.4, -73.8, supMat);
    pkCoPlan(E, { vMin: 4.5, vMax: 22 });
    // the station: platform, boom gates, canopy
    pkCoPlatform(g, 47.0, 58.6, -69.35, -66.85, th);
    var a = pkAttr({
      id: 'serpent', name: 'The Serpent', x: p.x, z: p.z,
      qx: p.q[0], qz: p.q[1], qdx: -1, g: g, seats: seats,
      board: 11, run: E.run, unload: 6, exit: [53.0, -67.6],
      extra: E, tickRun: function (at) { pkCoRun(at); }
    });
    var C = pkCtl(a);
    E.a = a;
    pkCoGates(g, [57.4, 55.05, 52.7, 50.35, 48.0], -69.42, C);
    pkCoCanopy(g, 47.9, 58.5, -66.95, 2.3, 'THE SERPENT', th);
    E.cars.forEach(function (c) {
      C.barObjs.push(function (b) { c.bar.rotation.x = -1.35 * (1 - b); });
    });
    pkCoPlace(E, E.uPark);
    return a;
  }
  // ── Baron's Drop ─────────────────────────────────────────────────
  // A dive coaster in the south-east: a long lift, a slow turn at the top, a straight vertical drop
  // into a tunnel mouth in the rockery, then a loop and a sweeping run home.
  var PK_BARON_PTS = [
    [48, 0.95, 15.5], [53, 0.95, 15.5], [58, 0.95, 15.5],
    [60.8, 1.6, 15.7], [62.4, 4.5, 16.4], [63.4, 10, 17.3], [63.6, 16.5, 18.3], [62.6, 20.6, 19.6],
    [60.2, 21.2, 20.9], [57.9, 21.1, 21.9], [56.2, 20.7, 22.5],
    [56.0, 19.0, 22.55], [55.95, 12.0, 22.55], [55.9, 4.0, 22.55], [55.9, 1.6, 22.5],
    [56.4, 1.15, 22.1], [57.6, 1.6, 20.8], [59.2, 3.0, 19.6], [60.4, 5.4, 18.6], [61.0, 6.2, 18.0],
    [63.25, 6.8, 18.0], [64.9, 8.45, 18.0], [65.5, 10.7, 18.0], [64.9, 12.95, 18.0], [63.25, 14.6, 18.0],
    [61.0, 15.2, 18.0], [58.75, 14.6, 18.0], [57.1, 12.95, 18.0], [56.5, 10.7, 18.0], [57.1, 8.45, 18.0],
    [58.75, 6.8, 18.0], [60.7, 6.15, 18.0], [63.0, 5.6, 17.2], [64.0, 4.6, 16.2], [63.6, 3.4, 14.8],
    [62.0, 2.6, 14.2], [59.5, 2.2, 14.4], [56.8, 2.0, 14.8], [54.0, 1.8, 15.2], [50.6, 1.3, 15.5]
  ];
  function pkBuildBaron(p) {
    var th = PK_THEME.baron, i;
    var g = new THREE.Group(); scene.add(g);
    var curve = pkCoCurve(PK_BARON_PTS), len = curve.getLength(), F = pkCoFrames(curve, 500);
    var E = { curve: curve, len: len, F: F, gap: 2.42, cars: [], uPark: pkCoUAt(curve, 56.8, 15.5), uOfF: [], run: 30 };
    var seats = [], cols = [0x3a3f48, 0xd8c9a8, 0x3a3f48, 0xd8c9a8];
    for (i = 0; i < 4; i++) {
      var car = pkCoCar(cols[i], { w: 1.5, d: 2.1 });
      scene.add(car.g);
      E.cars.push(car);
      car.seats.forEach(function (s) {
        seats.push({ par: car.g, x: s.x, y: s.y, z: s.z, ry: 0, guest: null });
      });
    }
    var spineMat = std({ color: 0x8a3b2c, roughness: 0.42, metalness: 0.3 });
    var supMat = std({ color: 0xd0c2a4, roughness: 0.6, metalness: 0.15 });
    pkCoTrackBuild(g, E, {
      spineMat: spineMat, supMat: supMat, tieMat: std({ color: 0x352a24, roughness: 0.75 }),
      skip: function (x, z) { return (x > 48 && x < 58.8 && z > 15.4 && z < 19.4); }
    });
    // the lift tower and the drop tower: two columns with rods out to the spine
    pkCoBrace(g, 64.9, 17.3, 9.6, 63.5, 9.8, 17.4, supMat);
    pkCoBrace(g, 54.6, 22.55, 18.4, 55.7, 18.2, 22.55, supMat);
    pkCoBrace(g, 57.3, 22.55, 18.4, 56.1, 18.2, 22.55, supMat);
    pkCoPlan(E, { vMin: 4, vMax: 24 });
    // the tunnel mouth: a stone ring round the track, a dark bore, and the rockery heaped over it
    var uT = pkCoUAt(curve, 56.9, 21.6);
    var pT = curve.getPointAt(uT), tT = curve.getTangentAt(uT).normalize();
    pkCoUpAt(F, uT);
    var upT = PK_CO_UP.clone();
    var ringMat = pkMatStone().clone(); ringMat.color.setHex(0x807a70);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.32, 8, 24), ringMat);
    ring.position.copy(pT).addScaledVector(upT, 1.6);
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tT);
    ring.castShadow = true; ring.receiveShadow = true; g.add(ring);
    // the bore is a short tube into the rock, not a flat black disc, so the mouth reads as a hole
    var bore = new THREE.Mesh(new THREE.CylinderGeometry(1.70, 1.70, 1.7, 24, 1, true), std({ color: 0x161310, roughness: 1, side: THREE.DoubleSide }));
    bore.position.copy(ring.position).addScaledVector(tT, 1.1);
    bore.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tT);
    g.add(bore);
    var dark = new THREE.Mesh(new THREE.CircleGeometry(1.70, 24), std({ color: 0x0b0908, roughness: 1, side: THREE.DoubleSide }));
    dark.position.copy(ring.position).addScaledVector(tT, 1.96);
    dark.quaternion.copy(ring.quaternion);
    g.add(dark);
    // the rockery: faceted boulders heaped over the bore - a wide base course from the ground,
    // then a stacked course round the ring itself. A rock that would reach into the mouth is
    // pushed out to the side, so the bore stays clear.
    var rightT = new THREE.Vector3().crossVectors(upT, tT).normalize();
    [[1.45, -2.3, 1.2], [1.5, 2.5, 1.4], [1.25, -3.1, 3.4], [1.35, 3.0, 3.6],
     [1.1, -2.0, 5.6], [1.2, 2.3, 5.8], [1.4, 0.3, 6.8], [1.0, -3.6, 2.3],
     [1.05, 3.5, 2.5], [0.95, -3.9, 4.6], [1.0, 3.7, 4.4]].forEach(function (rk) {
      var lat = rk[1], t = rk[2], rr = rk[0] * 1.45;
      if (Math.abs(lat) - rr < 2.0 && t < 4.8) lat = (lat < 0 ? -1 : 1) * (2.0 + rr);
      pkBoulder(pT.x + tT.x * t + rightT.x * lat, pT.z + tT.z * t + rightT.z * lat, rk[0], g);
    });
    // a stacked course round the ring, so the ring is the mouth of a pile rather than a ring
    // standing on its own: the flanks tuck against it and the cap overhangs the top of the hole
    function ringRock(lat, up, into, r) {
      var tg = new THREE.Group();
      tg.position.set(ring.position.x + rightT.x * lat + tT.x * into,
                      ring.position.y + up,
                      ring.position.z + rightT.z * lat + tT.z * into);
      g.add(tg);
      pkBoulder(0, 0, r, tg);
    }
    ringRock(-3.5, -2.1, 0.35, 1.35); ringRock(3.5, -2.1, 0.35, 1.35);
    ringRock(-2.2, -2.3, 0.9, 1.15); ringRock(2.2, -2.3, 0.9, 1.15);
    ringRock(-2.9, 1.35, 0.5, 1.1); ringRock(2.9, 1.35, 0.5, 1.1);
    ringRock(-1.5, 2.5, 0.75, 0.95); ringRock(1.55, 2.45, 0.75, 0.95);
    ringRock(0.15, 2.35, 0.6, 1.0);
    ringRock(-4.2, -1.8, 1.4, 1.5); ringRock(4.2, -1.8, 1.4, 1.5);
    ringRock(-0.4, -0.3, 3.2, 2.0);
    // sunken rocks at the foot, so the pile meets the pavement rather than stopping in mid air
    [[-4.9, 0.6, 0.8], [4.9, 1.0, 0.85], [-5.4, 3.0, 0.7], [5.5, 3.4, 0.75], [-4.6, 5.6, 0.7], [4.7, 5.9, 0.72]].forEach(function (rk) {
      pkBoulder(pT.x + tT.x * rk[1] + rightT.x * rk[0], pT.z + tT.z * rk[1] + rightT.z * rk[0], rk[2], g, 0);
    });
    // the station: platform, boom gates, canopy
    pkCoPlatform(g, 48.5, 57.9, 16.35, 18.55, th);
    var a = pkAttr({
      id: 'baron', name: "Baron's Drop", x: p.x, z: p.z,
      qx: p.q[0], qz: p.q[1], qdx: -1, g: g, seats: seats,
      board: 10, run: E.run, unload: 6, exit: [52.4, 17.4],
      extra: E, tickRun: function (at) { pkCoRun(at); }
    });
    var C = pkCtl(a);
    E.a = a;
    pkCoGates(g, [56.8, 54.4, 52.0, 49.6], 16.3, C);
    pkCoCanopy(g, 48.7, 57.7, 18.5, 2.0, "BARON'S DROP", th);
    E.cars.forEach(function (c) {
      C.barObjs.push(function (b) { c.bar.rotation.x = -1.35 * (1 - b); });
    });
    pkCoPlace(E, E.uPark);
    return a;
  }
  // ── Registering the plots ────────────────────────────────────────
  // Pushed at load time, before the trees are scattered and before the dressing runs, so the planting
  // keeps clear, the dressing dresses them, and the booth pass gives them the standard cabins.
  PK_PLOTS.push(
    { id: 'serpent', name: 'The Serpent', x: 55, z: -77.5, r: 12.5, q: [44.5, -65], level: 12, pad: 0.93 },
    { id: 'baron', name: "Baron's Drop", x: 57, z: 19, r: 12, q: [48, 19], level: 13, pad: 0.82 },
    { id: 'nocturne', name: 'Nocturne', x: -50, z: -86.75, r: 13.5, q: [-59.1, -76.4], qdx: 1, level: 14, pad: 0.02 },
    { id: 'wreck', name: 'The Wreck', x: -20, z: -86.75, r: 13.5, q: [-29.1, -76.4], qdx: 1, level: 15, pad: 0.02 },
    { id: 'moonwood', name: 'Moonwood', x: 30, z: -86.75, r: 13.5, q: [39.1, -76.4], qdx: -1, level: 16, pad: 0.02 }
  );
  // the kids' area on the west lawn
  PK_PLOTS.push(
    { id: 'kround', name: 'Little Roundabout', x: -60, z: 20, r: 6, q: [-49, 20], level: 17, pad: 1.1 },
    { id: 'kpots', name: 'Wobbly Pots', x: -60, z: 30, r: 5.5, q: [-49, 30], level: 18, pad: 1.1 },
    { id: 'kpuffin', name: 'Puffin Line', x: -60, z: 40, r: 7.5, q: [-52.5, 44.5], level: 19, pad: 1.05 }
  );
  PK_THEME.kround = { a: 0xb8452f, b: 0xf4f1e6, ground: 0x8fae6a, name: 'Little Roundabout' };
  PK_THEME.kpots = { a: 0x2f7f8f, b: 0xf0c04a, ground: 0x8fae6a, name: 'Wobbly Pots' };
  PK_THEME.kpuffin = { a: 0x8a6a4a, b: 0xf0c04a, ground: 0x9ab07a, name: 'Puffin Line' };
  PK_THEME.serpent = { a: 0x2f8f6f, b: 0xf0c04a, ground: 0x9aab8c, name: 'The Serpent', noBunting: true, noDecor: true };
  PK_THEME.baron = { a: 0x8a3b2c, b: 0xd8c9a8, ground: 0xa89a8a, name: "Baron's Drop", noBunting: true, noDecor: true };
  PK_THEME.nocturne = { a: 0x8f7bd6, b: 0xd8dcff, ground: 0x767b93, name: 'Nocturne', noBunting: true, noDecor: true };
  PK_THEME.wreck = { a: 0xd8a24a, b: 0x6a4f33, ground: 0x8a7c66, name: 'The Wreck', noBunting: true, noDecor: true };
  PK_THEME.moonwood = { a: 0x8fd3c7, b: 0xc9a06a, ground: 0x7c7058, name: 'Moonwood', noBunting: true, noDecor: true };
  // the spurs from the North Promenade up to the queues, and the kids' lane from the Fairground avenue down into the kids'
  // garden, west of the carousel, past the three little rides' gateways
  PK_ROUTES.push(
    [35, -60, 35, -65, 4.2, 'coaster'], [35, -65, 41, -65, 4.2, 'coaster'],
    [-46.5, -60, -31, -60, 5, 'dark'],
    [-46.5, -60, -46.5, -76.4, 3.4, 'dark'], [-16.5, -60, -16.5, -76.4, 3.4, 'dark'], [26.5, -60, 26.5, -76.4, 3.4, 'coaster'],
    [-46.8, 5.4, -46.8, 50, 3.4, 'fair']
  );
  PK_KEEP.push([35.5, -62.5, 5.5], [42.5, -65.5, 5], [-38.5, 42, 6.5]);

  function pkCoastersBuild() {
    var makers = {
      serpent: pkBuildSerpent, baron: pkBuildBaron,
      nocturne: pkBuildIndoor, wreck: pkBuildIndoor, moonwood: pkBuildIndoor,
      kround: pkBuildKiddie, kpots: pkBuildKiddie, kpuffin: pkBuildPuffin
    };
    PK_PLOTS.forEach(function (p) {
      var mk = makers[p.id];
      if (!mk) return;
      var a = mk(p);
      a.level = p.level;
      a.plot = p;
      a.open = true;
      if (S.rides) S.rides[p.id] = true;
    });
    pkBuildPlayhouse();
  }
  // built before the standard pass, so the booth pass finds them and the flat rides are untouched
  var _pkBuildAttractionsCo = pkBuildAttractions;
  pkBuildAttractions = function () {
    pkCoastersBuild();
    _pkBuildAttractionsCo();
  };

  // ── The indoor coasters ───────────────────────────────────────────
  // Three show buildings along the north wall. Each has a wide portal on the promenade side, a queue
  // lane outside under its portico, a station just inside the portal and a glazed control cabin at the
  // end of the platform, so the booth hardware sits with the ride instead of out on the promenade.
  // Each runs its own circuit round its own centrepiece: Nocturne dives, humps and spirals down round
  // the moon; The Wreck flies a figure-eight with the ship in one loop; Moonwood runs camelbacks along
  // the back wall and ducks under the tree's crown.
  var PK_INDOOR = {
    nocturne: { name: 'Nocturne', box: [-62, -38, -94.5, -79], portal: 'w', wall: 0x2b2e3d, band: 0x8f7bd6, trim: 0x40465e, roof: 0x1d2030, sign: '#b9a7f0', ground: 0x767b93, centre: 'moon', at: [5.0, -89.0] },
    wreck:    { name: 'The Wreck', box: [-32, -8, -94.5, -79], portal: 'w', wall: 0x5b5348, band: 0xd8a24a, trim: 0x4a443c, roof: 0x3b3630, sign: '#e8bd6a', ground: 0x8a7c66, centre: 'ship', at: [13.0, -89.2] },
    moonwood: { name: 'Moonwood', box: [18, 42, -94.5, -79], portal: 'e', wall: 0x6b5340, band: 0x8fd3c7, trim: 0x4f4132, roof: 0x4a3a2c, sign: '#9fe0d4', ground: 0x7c7058, centre: 'tree', at: [11.5, -88.6] }
  };
  // the circuits are laid out in the hall's own frame: u is metres in from the portal wall (the hall is mirrored for an east
  // portal), z is the world z. The inside of the hall is u 0.3..23.7, z -94.2..-79.3; the track keeps to u 1.4..22.3,
  // z -92.75..-83.3 and below 6.5 m, under the ceiling beams. Every circuit shares the station: the brake run down the portal
  // side, the turn in, the platform straight along z -83.35 and the turn out at its far end. Checked clear of itself
  // (2.5 m between passes stacked over each other, 1.9 m side by side) and of the control cabin at u 14.6..19.6, z > -82.6.
  function pkIndoorArc(cu, cz, r, a0, a1, y0, y1, n, out, yf) {
    for (var k = 0; k <= n; k++) { var f = k / n, a = a0 + (a1 - a0) * f; out.push([cu + r * Math.cos(a), yf ? yf(f) : y0 + (y1 - y0) * f, cz - r * Math.sin(a)]); }
    return out;
  }
  function pkIndoorStation(p, fromHelix) {
    if (!fromHelix) p.push([1.75, 1.0, -88.0]);
    p.push([2.0, 1.0, -85.4], [3.3, 1.0, -83.5], [6.0, 1.0, -83.35], [9.0, 1.0, -83.35], [12.0, 1.0, -83.35], [14.6, 1.0, -83.5]);
    return p;
  }
  var PK_INDOOR_LAYOUT = {
    // up the far wall, a dive and a camelback along the back, then a turn and a quarter down round the moon, out onto the brakes
    moon: function () {
      var p = pkIndoorStation([], true);
      p.push([16.6, 1.15, -84.5], [18.4, 1.8, -86.3], [19.5, 3.0, -88.3], [19.7, 4.6, -90.2], [19.0, 6.0, -91.9], [17.2, 6.4, -92.6]);
      p.push([15.0, 4.6, -92.6], [13.0, 3.0, -92.5], [11.0, 4.6, -92.4], [9.0, 6.0, -92.3]);
      return pkIndoorArc(5.0, -89.0, 3.0, Math.PI / 2 + 0.2, 3 * Math.PI, 6.2, 1.1, 26, p);
    },
    // up the far wall, then a figure-eight across the hall: high through the crossing the first time, low the second
    ship: function () {
      var p = pkIndoorStation([]);
      p.push([16.6, 1.15, -84.5], [18.6, 1.9, -86.5], [19.6, 3.4, -88.7], [19.5, 5.0, -90.8], [18.2, 6.2, -92.3], [16.2, 6.4, -92.6]);
      var key = [[0.75, 6.4], [1.0, 6.4], [1.25, 5.6], [1.5, 5.0], [1.75, 4.5], [1.9, 3.9], [2.0, 3.2], [2.25, 2.2], [2.5, 1.7], [2.7, 1.4]];
      function yAt(t) { var q = t / Math.PI; for (var i = 1; i < key.length; i++) if (q <= key[i][0]) { var f = (q - key[i - 1][0]) / (key[i][0] - key[i - 1][0]); return key[i - 1][1] + (key[i][1] - key[i - 1][1]) * f; } return 1.4; }
      for (var k = 0; k <= 36; k++) { var t = Math.PI * (0.75 + 1.95 * k / 36); p.push([10.0 + 6.0 * Math.sin(t), yAt(t), -89.2 + 2.6 * Math.sin(2 * t)]); }
      p.push([12.4, 1.2, -92.5], [9.0, 1.0, -92.6], [5.4, 1.0, -92.55], [3.2, 1.0, -92.0], [2.0, 1.0, -90.6]);
      return p;
    },
    // up the far wall, camelbacks along the back, down the near side and round the trunk under the crown
    tree: function () {
      var p = pkIndoorStation([]);
      p.push([16.6, 1.15, -84.5], [18.4, 1.8, -86.3], [19.5, 3.0, -88.3], [19.7, 4.4, -90.3], [19.0, 5.5, -92.0], [17.0, 5.6, -92.6]);
      p.push([14.4, 3.9, -92.6], [12.2, 4.8, -92.6], [9.8, 5.0, -92.6], [7.2, 4.5, -92.6], [5.4, 4.6, -92.5], [4.2, 4.4, -91.2], [4.5, 3.8, -89.6], [5.0, 2.6, -88.2], [6.4, 1.6, -86.5], [8.7, 1.4, -86.1]);
      pkIndoorArc(11.5, -88.6, 2.5, -Math.PI / 2 + 0.3, Math.PI / 2, 1.4, 1.4, 14, p);
      p.push([9.0, 1.3, -91.25], [6.0, 1.15, -91.3], [3.4, 1.0, -90.8], [2.1, 1.0, -89.6]);
      return p;
    }
  };
  // the ride's circuit, from its layout, into world space
  function pkIndoorPts(cfg) {
    var s = cfg.portal === 'w' ? 1 : -1, AX = s > 0 ? cfg.box[0] : cfg.box[1];
    return PK_INDOOR_LAYOUT[cfg.centre]().map(function (q) { return [AX + s * q[0], q[1], q[2]]; });
  }
  // the shell: four walls with the portal cut in, a gable roof, the marquee and a portico over the
  // queue, a paved apron and the run of interior floor
  function pkIndoorShell(g, cfg) {
    var b = cfg.box, X0 = b[0], X1 = b[1], Z0 = b[2], Z1 = b[3], CX = (X0 + X1) / 2, CZ = (Z0 + Z1) / 2;
    var H = 9.0, PW = 5.8, PH = 4.0, i, x;
    var s = cfg.portal === 'w' ? 1 : -1, AX = s > 0 ? X0 : X1;
    var wall = std({ color: cfg.wall, roughness: 0.85, metalness: 0.04 });
    var band = std({ color: cfg.band, roughness: 0.5, metalness: 0.3 });
    var trim = std({ color: cfg.trim, roughness: 0.7, metalness: 0.15 });
    var P0 = AX + s * 0.6, P1 = P0 + s * PW, pLo = Math.min(P0, P1), pHi = Math.max(P0, P1);
    // the floor inside is theme-tinted rather than a dark slab, so the hall reads as a place
    var floorCol = new THREE.Color(cfg.ground).multiplyScalar(0.42);
    box(X1 - X0 - 0.4, 0.06, Z1 - Z0 - 0.4, std({ color: floorCol, roughness: 0.92 }), CX, 0.03, CZ, g);
    box(X1 - X0 + 1.4, 0.05, 3.4, std({ color: 0x6e6a64, roughness: 0.95 }), CX, 0.025, Z1 + 1.8, g);
    // walls
    box(X1 - X0, H, 0.6, wall, CX, H / 2, Z0, g);
    solid(X0, X1, Z0 - 0.3, Z0 + 0.3, 0, H);
    box(0.6, H, Z1 - Z0, wall, X0, H / 2, CZ, g);
    solid(X0 - 0.3, X0 + 0.3, Z0, Z1, 0, H);
    box(0.6, H, Z1 - Z0, wall, X1, H / 2, CZ, g);
    solid(X1 - 0.3, X1 + 0.3, Z0, Z1, 0, H);
    box(pLo - X0, H, 0.6, wall, (X0 + pLo) / 2, H / 2, Z1, g);
    box(X1 - pHi, H, 0.6, wall, (pHi + X1) / 2, H / 2, Z1, g);
    box(PW, H - PH, 0.6, wall, (pLo + pHi) / 2, PH + (H - PH) / 2, Z1, g);
    solid(X0, pLo, Z1 - 0.3, Z1 + 0.3, 0, H);
    solid(pHi, X1, Z1 - 0.3, Z1 + 0.3, 0, H);
    solid(pLo, pHi, Z1 - 0.3, Z1 + 0.3, PH, H);
    // the inside of the shell: a timber wainscot, pilasters, cross beams and a ceiling. The outside
    // has order; without this the inside is four flat planes and a dark gable overhead.
    box(X1 - X0 - 0.6, 1.35, 0.05, trim, CX, 0.68, Z0 + 0.33, g);
    box(0.05, 1.35, Z1 - Z0 - 0.6, trim, X0 + 0.33, 0.68, CZ, g);
    box(0.05, 1.35, Z1 - Z0 - 0.6, trim, X1 - 0.33, 0.68, CZ, g);
    for (i = 0; i < 5; i++) {
      x = X0 + 2.4 + (X1 - X0 - 4.8) * i / 4;
      box(0.24, 6.4, 0.1, trim, x, 3.2, Z0 + 0.34, g);
    }
    for (i = 0; i < 4; i++) {
      var zi = Z0 + 2.6 + (Z1 - Z0 - 5.2) * i / 3;
      box(0.1, 6.4, 0.24, trim, X0 + 0.34, 3.2, zi, g);
      box(0.1, 6.4, 0.24, trim, X1 - 0.34, 3.2, zi, g);
    }
    for (i = 0; i < 5; i++) {
      box(X1 - X0 - 0.8, 0.22, 0.28, trim, CX, 8.45, Z0 + 3 + (Z1 - Z0 - 6) * i / 4, g);
    }
    var hallCeil = box(X1 - X0 - 0.6, 0.1, Z1 - Z0 - 0.6, std({ color: cfg.roof, roughness: 0.9 }), CX, 8.75, CZ, g);
    hallCeil.castShadow = false;
    // band course and pilasters
    box(X1 - X0 + 0.4, 0.5, 0.16, band, CX, 6.6, Z1 + 0.36, g);
    box(X1 - X0 + 0.4, 0.5, 0.16, band, CX, 6.6, Z0 - 0.36, g);
    for (i = 0; i <= 4; i++) {
      x = X0 + 2.0 + (X1 - X0 - 4.0) * i / 4;
      box(0.5, H, 0.5, trim, x, H / 2, Z1 + 0.42, g);
      box(0.5, H, 0.5, trim, x, H / 2, Z0 - 0.42, g);
    }
    // the portal: jambs, lintel, the marquee, the portico
    box(0.5, PH + 0.6, 0.55, trim, P0 + s * 0.25, (PH + 0.6) / 2, Z1 + 0.3, g);
    box(0.5, PH + 0.6, 0.55, trim, P1 - s * 0.25, (PH + 0.6) / 2, Z1 + 0.3, g);
    box(PW + 1.5, 0.62, 0.6, band, (pLo + pHi) / 2, PH + 0.45, Z1 + 0.3, g);
    pkSign3D([cfg.name.toUpperCase()], Math.min(6.8, PW + 1.8), 0.46, (pLo + pHi) / 2, PH + 1.3, Z1 + 0.46, 0, { bg: '#151a20', fg: cfg.sign }, g);
    box(PW + 3.4, 0.22, 3.5, pkMats().roof, (pLo + pHi) / 2, 4.78, Z1 + 1.75, g);
    box(PW + 3.4, 0.5, 0.16, band, (pLo + pHi) / 2, 4.62, Z1 + 3.42, g);
    [pLo - 0.5, pHi + 0.5].forEach(function (px) {
      box(0.34, 4.7, 0.34, trim, px, 2.35, Z1 + 1.1, g);
      solid(px - 0.24, px + 0.24, Z1 + 0.86, Z1 + 1.34, 0, 4.7);
    });
    // roof
    pkGableRoof(X1 - X0 + 1.2, Z1 - Z0 + 1.6, 2.2, std({ color: cfg.roof, roughness: 0.8 }), trim, CX, H, CZ, g, 0.45);
    box(X1 - X0 - 3, 0.8, 1.4, std({ color: cfg.roof, roughness: 0.8 }), CX, H + 2.2, CZ, g);
  }
  // the piece the helix winds around
  function pkIndoorCentre(g, cfg, CX, CZ) {
    var i, a;
    if (cfg.centre === 'moon') {
      pkRoundCyl(1.5, 6.4, std({ color: 0x232637, roughness: 0.9 }), CX, 3.2, CZ, g, 18);
      pkRoundCyl(1.95, 0.4, std({ color: 0x2f3350, roughness: 0.8 }), CX, 6.6, CZ, g, 18);
      sphere(1.45, std({ color: 0xe8ecff, roughness: 0.5 }), CX, 7.3, CZ, g);
      // the stars ride on the moon's collar, inside the helix (the track runs at 3 m round the column)
      for (i = 0; i < 12; i++) {
        a = i / 12 * Math.PI * 2;
        sphere(0.09 + (i % 3) * 0.04, MAT.bulb, CX + Math.cos(a) * 1.75, 6.85 + (i % 4) * 0.12, CZ + Math.sin(a) * 1.75, g);
      }
    } else if (cfg.centre === 'ship') {
      // the wreck lies in the figure-eight's east loop, run aground along it, small enough for the train to fly round
      var hull = new THREE.Group(); hull.position.set(CX, 0, CZ); hull.rotation.set(0.06, Math.PI / 2 + 0.12, 0.3); hull.scale.setScalar(0.42); g.add(hull);
      pkBevelBox(3.0, 2.2, 7.0, std({ color: 0x6a4f33, roughness: 0.85 }), 0, 1.5, 0, hull, 0.12);
      pkBevelBox(2.7, 1.5, 6.4, std({ color: 0x543d27, roughness: 0.9 }), 0, 2.6, 0, hull, 0.08);
      pkRoundCyl(0.16, 6.4, std({ color: 0x4a341f, roughness: 0.85 }), 0, 5.2, -1.2, hull, 8);
      pkRoundCyl(0.14, 5.2, std({ color: 0x4a341f, roughness: 0.85 }), 0.4, 4.6, 1.6, hull, 8);
      box(3.4, 0.12, 1.1, std({ color: 0xc9c2b0, roughness: 0.8 }), 0, 4.4, -1.2, hull);
      for (i = 0; i < 6; i++) {
        a = i / 6 * Math.PI * 2;
        box(0.5 + (i % 3) * 0.1, 0.4, 0.5, std({ color: [0x5a4a36, 0x6e5a40, 0x4e4030][i % 3], roughness: 0.9 }), CX + Math.cos(a) * 1.9, 0.2, CZ + Math.sin(a) * 1.25, g);
      }
    } else {
      pkRoundCyl(1.15, 5.8, std({ color: 0x4e3a26, roughness: 0.92 }), CX, 2.9, CZ, g, 12);
      // the crown is kept inside the helix: ring 1.45 m + crown 1.45-1.67 m stays under the 3.4 m
      // rail, and the whole crown sits below the ceiling beams
      for (i = 0; i < 7; i++) {
        a = i / 7 * Math.PI * 2;
        sphere(1.45 + (i % 2) * 0.22, std({ color: [0x3e5a3a, 0x476340, 0x35502f][i % 3], roughness: 0.95 }), CX + Math.cos(a) * 1.45, 5.9 + (i % 3) * 0.35, CZ + Math.sin(a) * 1.45, g);
      }
      // the hanging lamps: the cord is brass and reads against the dark, and the shade has a warm
      // core, so they are lamps rather than white cubes in mid air
      var shade = std({ color: 0xfff3d6, emissive: 0xffdda0, emissiveIntensity: 0.55, roughness: 0.55 });
      for (i = 0; i < 5; i++) {
        a = i / 5 * Math.PI * 2 + 0.4;
        var lx = CX + Math.cos(a) * 2.45, lz = CZ + Math.sin(a) * 2.45;
        pkRoundCyl(0.032, 1.1, MAT.brass || MAT.gold, lx, 4.95, lz, g, 6);
        pkRoundCyl(0.19, 0.26, shade, lx, 4.35, lz, g, 10);
      }
    }
  }
  // the control cabin: a glazed room at the far end of the platform, the operator's back to the portal wall. A long window
  // over the track, a side window and the door onto the platform, the desk under the long window and the status board on
  // the back wall. Laid out in the hall's own u, so it mirrors with the hall and its screen still reads the right way round.
  var PK_CABIN = { u0: 15.2, u1: 18.8, z0: -82.45, z1: -79.35, door: [-81.4, -80.45] };
  function pkIndoorCabin(g, cfg, a) {
    var s = cfg.portal === 'w' ? 1 : -1, AX = s > 0 ? cfg.box[0] : cfg.box[1], K = PK_CABIN, T = 0.12, H = 2.9;
    function X(u) { return AX + s * u; }
    var trim = std({ color: cfg.trim, roughness: 0.7, metalness: 0.15 });
    var band = std({ color: cfg.band, roughness: 0.5, metalness: 0.3 });
    var glass = std({ color: 0x9fc6cc, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.34 });
    var xa = Math.min(X(K.u0), X(K.u1)), xb = Math.max(X(K.u0), X(K.u1)), cx = (xa + xb) / 2, cz = (K.z0 + K.z1) / 2, W = xb - xa, D = K.z1 - K.z0;
    var xn = X(K.u0 + T / 2), xf = X(K.u1 - T / 2);          // the platform-side wall and the far wall
    box(W, 0.12, D, std({ color: 0x2e2e34, roughness: 0.95 }), cx, 0.06, cz, g);
    // the long window over the track: parapet, glass, header, posts
    box(W, 0.95, T, trim, cx, 0.475, K.z0 + T / 2, g);
    box(W - 0.2, 1.4, 0.05, glass, cx, 1.65, K.z0 + T / 2, g);
    box(W, 0.55, T, trim, cx, H - 0.275, K.z0 + T / 2, g);
    [xa + 0.06, cx, xb - 0.06].forEach(function (px) { box(0.12, H, 0.16, trim, px, H / 2, K.z0 + T / 2, g); });
    box(W + 0.1, 0.12, 0.2, band, cx, 0.98, K.z0 + 0.02, g);
    // the platform side: a window at the track end, then the door
    var d0 = K.door[0], d1 = K.door[1];
    box(T, 0.95, d0 - K.z0, trim, xn, 0.475, (K.z0 + d0) / 2, g);
    box(0.05, 1.4, d0 - K.z0 - 0.2, glass, xn, 1.65, (K.z0 + d0) / 2, g);
    box(T, 0.55, d0 - K.z0, trim, xn, H - 0.275, (K.z0 + d0) / 2, g);
    box(T, H - 2.1, d1 - d0, trim, xn, 2.1 + (H - 2.1) / 2, (d0 + d1) / 2, g);
    box(T, H, K.z1 - d1, trim, xn, H / 2, (d1 + K.z1) / 2, g);
    box(T + 0.06, 2.12, 0.08, band, xn, 1.06, d0 - 0.04, g); box(T + 0.06, 2.12, 0.08, band, xn, 1.06, d1 + 0.04, g);
    // the far wall and the back panel (the hall's own wall stands behind it)
    box(T, H, D, trim, xf, H / 2, cz, g);
    box(W, H, 0.06, std({ color: 0x34343c, roughness: 0.85 }), cx, H / 2, K.z1 - 0.05, g);
    box(W + 0.2, 0.1, D + 0.2, trim, cx, H + 0.05, cz, g);                                       // the roof slab
    pkSign3D([cfg.name.toUpperCase() + ' · CONTROL'], Math.min(3.2, W - 0.3), 0.26, cx, H - 0.27, K.z0 + T / 2 - 0.07, Math.PI, { bg: '#151a20', fg: cfg.sign }, g);
    // the walls are solid, the doorway is not; the desk is solid too
    solid(xa, xb, K.z0, K.z0 + T + 0.04, 0, H);
    solid(xf - 0.08, xf + 0.08, K.z0, K.z1, 0, H);
    solid(xn - 0.08, xn + 0.08, K.z0, d0, 0, H);
    solid(xn - 0.08, xn + 0.08, d1, K.z1, 0, H);
    // the desk under the long window, the operator facing the track with the platform on the side
    var con = new THREE.Group(); con.position.set(cx, 0.12, K.z0 + 0.5); g.add(con);
    pkBkDesk(con, 2.1);
    pkBoothPanel(a, con);
    solid(cx - 1.05, cx + 1.05, K.z0 + 0.1, K.z0 + 0.82, 0, 0.95);
    // the kit, in a frame at the room's middle: local -z is the long window, +z the back
    var k = new THREE.Group(); k.position.set(cx, 0.12, cz); g.add(k);
    var fxl = (xf - cx) - s * 0.17;
    pkBkCabinet(a, k, fxl, 1.42, 0.2, -s * Math.PI / 2);
    solid(Math.min(xf, xf - s * 0.36), Math.max(xf, xf - s * 0.36), cz - 0.3, cz + 0.7, 0, 2.0);
    pkBkMonitors(a, k, 0, 1.95, K.z0 + 0.36 - cz, 0, 0.32);
    pkBkClock(k, -s * 1.15, 2.2, K.z1 - 0.09 - cz, Math.PI, 0.14);
    pkBkIntercom(k, -s * 1.2, 1.5, K.z1 - 0.08 - cz, Math.PI);
    pkBkKeyBox(k, s * 1.2, 2.05, K.z1 - 0.08 - cz, Math.PI);
    pkBkChair(k, 0.1, -0.35, 0, 0);
    pkBkBatten(k, 0, H - 0.17, 0.2, 0, 1.4);
    pkBkStack(a, k, s * 1.3, H + 0.02, 0.9);
    pkBkCamera(k, -s * (W / 2 + 0.02), H - 0.3, K.z0 - cz + 0.3, s * Math.PI / 2 + Math.PI, 0.5);
    // the status board on the back wall, facing the operator
    var screen = touchScreen({
      w: 380, h: 320, pw: 0.94, ph: 0.80, x: cx, y: 1.62, z: K.z1 - 0.1, ry: Math.PI, parent: g, title: a.name,
      draw: function (ctx, sc) {
        var C = pkCtl(a);
        scBg(ctx, sc.w, sc.h);
        scHead(ctx, sc.w, a.name.toUpperCase(), pkBoothStatus(a, C));
        scText(ctx, 16, 62, 'ON RIDE', '#a0acb8');
        scText(ctx, 16, 88, a.riders + ' / ' + a.seats.length, a.riders ? '#5fd38d' : '#eef1f5');
        scText(ctx, 200, 62, 'QUEUE', '#a0acb8');
        scText(ctx, 200, 88, String(a.queue.length), a.queue.length ? '#f0c04a' : '#eef1f5');
        scText(ctx, 16, 122, 'GATES  ' + (C.gates ? 'OPEN' : 'CLOSED'), C.gates ? '#5fd38d' : '#a0acb8');
        scText(ctx, 16, 152, 'RESTRAINTS  ' + (C.barsWant > 0.5 ? 'DOWN' : 'UP'), C.barsWant > 0.5 ? '#5fd38d' : '#a0acb8');
        scText(ctx, 16, 182, 'AUTO  ' + (C.auto ? 'ON' : 'OFF'), C.auto ? '#5fd38d' : '#a0acb8');
        scText(ctx, 16, 212, 'CYCLE  ' + a.run.toFixed(1) + 's', '#eef1f5');
        scText(ctx, 16, 242, 'CONTROL ROOM  ' + (C.fault ? 'RESET' : (C.maint ? 'MAINT' : 'READY')), C.fault || C.maint ? '#ff6b5e' : '#8f98a4');
        scText(ctx, 16, 272, 'WAIT  ' + pkBkWait(a) + ' MIN', '#eef1f5');
      }
    });
    var anchor = new THREE.Group(); anchor.position.set(cx, 0, cz); g.add(anchor);
    a.booth = anchor;
    a.boothScreen = screen;
  }
  // a whole indoor coaster: shell, centrepiece, track, station, cabin
  function pkBuildIndoor(p) {
    var cfg = PK_INDOOR[p.id], th = PK_THEME[p.id], i;
    var b = cfg.box, CZ = (b[2] + b[3]) / 2, zS = CZ + 3.4;
    var s = cfg.portal === 'w' ? 1 : -1, AX = s > 0 ? b[0] : b[1];
    var g = new THREE.Group(); scene.add(g);
    pkIndoorShell(g, cfg);
    pkIndoorCentre(g, cfg, AX + s * cfg.at[0], cfg.at[1]);
    var curve = pkCoCurve(pkIndoorPts(cfg)), len = curve.getLength(), F = pkCoFrames(curve, 460);
    var E = { curve: curve, len: len, F: F, gap: 2.4, cars: [], uPark: pkCoUAt(curve, AX + s * 12.0, zS), uOfF: [], run: 30 };
    var seats = [], cols = [cfg.band, 0xece6d8, cfg.band, 0xece6d8];
    for (i = 0; i < 4; i++) {
      var car = pkCoCar(cols[i], { w: 1.46, d: 2.05 });
      scene.add(car.g);
      E.cars.push(car);
      car.seats.forEach(function (st) {
        seats.push({ par: car.g, x: st.x, y: st.y, z: st.z, ry: 0, guest: null });
      });
    }
    pkCoTrackBuild(g, E, {
      spineMat: std({ color: cfg.band, roughness: 0.4, metalness: 0.3 }),
      supMat: std({ color: cfg.trim, roughness: 0.6, metalness: 0.2 }),
      tieMat: std({ color: 0x2a2a30, roughness: 0.8 }),
      skip: function (x, z) { return z > -84.2; }                                     // the station, the platform and the cabin
    });
    pkCoPlan(E, { vMin: 4.5, vMax: 19 });
    // the station inside: kerbed platform, the boom gates at the car doors, hanging lamps
    pkCoPlatform(g, Math.min(AX + s * 0.6, AX + s * 14.8), Math.max(AX + s * 0.6, AX + s * 14.8), -82.8, -80.2, th);
    var stationShade = std({ color: 0xfff3d6, emissive: 0xffdda0, emissiveIntensity: 0.5, roughness: 0.55 });
    [AX + s * 3, AX + s * 8, AX + s * 13].forEach(function (lx) {
      pkRoundCyl(0.045, 3.0, MAT.gold, lx, 7.25, -81.5, g, 6);
      pkRoundCyl(0.34, 0.24, stationShade, lx, 5.75, -81.5, g, 12);
    });
    // the station and the hall are lit, so the train and the platform are not silhouettes
    [3.5, 8.5, 13.5].forEach(function (lx) {
      var pl = new THREE.PointLight(0xffe3b0, 0.9, 12, 2);
      pl.position.set(AX + s * lx, 3.0, -81.5); g.add(pl);
    });
    var hallLight = new THREE.PointLight(0xfff0d0, 0.75, 22, 2);
    hallLight.position.set(AX + s * 12, 5.8, CZ - 1.5); g.add(hallLight);
    var a = pkAttr({
      id: p.id, name: cfg.name, x: p.x, z: p.z,
      qx: p.q[0], qz: p.q[1], qdx: s, g: g, seats: seats,
      board: 11, run: E.run, unload: 6, exit: [AX + s * 1.3, -81.6],
      extra: E, tickRun: function (at) { pkCoRun(at); }
    });
    var C = pkCtl(a);
    E.a = a;
    pkCoGates(g, [AX + s * 12.0, AX + s * 9.6, AX + s * 7.2, AX + s * 4.8], -82.85, C);
    E.cars.forEach(function (c) {
      C.barObjs.push(function (bb) { c.bar.rotation.x = -1.35 * (1 - bb); });
    });
    pkCoPlace(E, E.uPark);
    pkIndoorCabin(g, cfg, a);
    return a;
  }

  // ── The kids' area ────────────────────────────────────────────────
  // Three gentle rides on the west lawn: a little roundabout, a pot-and-teapot spinner and the Puffin
  // Line, a hand-cranked pedal train on its own small oval of track.
  function pkBuildKiddie(p) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(p.x, 0, p.z); scene.add(g);
    var isPot = p.id === 'kpots', seats = [], pots = [], i, a;
    var R = isPot ? 3.5 : 3.1, deck = std({ color: isPot ? 0x2f7f8f : 0xb8452f, roughness: 0.7 });
    pkRoundCyl(R + 0.95, 0.22, M.stone, 0, 0.11, 0, g, 40);
    pkRoundCyl(R + 0.6, 0.3, deck, 0, 0.3, 0, g, 40);
    var spin = pkMover(g, 0, 0.44, 0);
    pkRoundCyl(R, 0.16, std({ color: 0xe8dfc8, roughness: 0.8 }), 0, 0.08, 0, spin, 40);
    pkRoundCyl(0.26, 2.5, std({ color: 0x3d3a35, roughness: 0.6, metalness: 0.3 }), 0, 1.35, 0, spin, 12);
    if (isPot) {
      sphere(0.7, deck, 0, 2.0, 0, spin);
      sphere(0.42, std({ color: 0xf2ead6, roughness: 0.8 }), 0, 2.6, 0, spin);
      pkRoundCyl(0.09, 0.8, deck, 0.85, 2.15, 0, spin, 8).rotation.z = -0.6;
      for (i = 0; i < 8; i++) {
        a = i / 8 * Math.PI * 2;
        var pot = pkMover(spin, Math.sin(a) * 2.45, 0, Math.cos(a) * 2.45);
        pkRoundCyl(0.56, 0.62, std({ color: i % 2 ? 0xf0c04a : 0xd2622f, roughness: 0.6 }), 0, 0.33, 0, pot, 14);
        pkRing(0.6, 0.07, std({ color: 0xf4f1e6, roughness: 0.7 }), 0, 0.62, 0, pot, 16);
        pots.push(pot);
        seats.push({ par: pot, x: 0, y: 0.78, z: 0, ry: 0, guest: null });
      }
    } else {
      for (i = 0; i < 6; i++) {
        a = i / 6 * Math.PI * 2;
        var px = Math.sin(a) * 2.3, pz = Math.cos(a) * 2.3, ry = Math.atan2(Math.cos(a), -Math.sin(a));
        pkRoundCyl(0.05, 2.3, std({ color: 0xd9d2c2, roughness: 0.4, metalness: 0.4 }), px, 1.35, pz, spin, 8);
        var hg = pkMover(spin, px, 0, pz), body = std({ color: i % 2 ? 0xf4f1e6 : 0x4d7a9b, roughness: 0.6 });
        pkBevelBox(1.0, 0.46, 0.4, body, 0, 1.18, 0, hg, 0.14);
        pkBevelBox(0.34, 0.42, 0.3, body, 0, 1.5, 0.42, hg, 0.1);
        pkBevelBox(0.5, 0.3, 0.26, body, 0, 1.36, 0.6, hg, 0.08);
        [-0.35, 0.35].forEach(function (lx) {
          [-0.14, 0.14].forEach(function (lz) {
            pkRoundCyl(0.06, 0.85, std({ color: 0x6b5a3e, roughness: 0.8 }), lx, 0.5, lz, hg, 6);
          });
        });
        hg.rotation.y = ry;
        seats.push({ par: spin, x: px, y: 1.42, z: pz, ry: ry, guest: null });
      }
    }
    pkRoundCyl(R + 0.5, 0.14, std({ color: 0xf4f1e6, roughness: 0.75 }), 0, 2.9, 0, spin, 40);
    var cone = new THREE.Mesh(new THREE.ConeGeometry(R + 0.75, 0.9, 40, 1), deck);
    cone.position.y = 3.4; spin.add(cone);
    sphere(0.28, M.gold, 0, 3.95, 0, spin);
    pkFuse(spin);
    return pkAttr({
      id: p.id, name: p.name, x: p.x, z: p.z, qx: p.q[0], qz: p.q[1], g: g, seats: seats,
      board: isPot ? 8 : 6, run: isPot ? 18 : 22, unload: 5,
      tickRun: function (at, dt, k) {
        spin.rotation.y += dt * 0.6 * k;
        for (var q = 0; q < pots.length; q++) pots[q].rotation.y -= dt * 1.1 * k;
      }
    });
  }
  // the Puffin Line: a slow pedal train on a small oval, built on the coaster kit so it loads,
  // runs and parks like the big rides
  function pkBuildPuffin(p) {
    var th = PK_THEME[p.id], i, s;
    var g = new THREE.Group(); scene.add(g);
    var pts = [[-65.5, 0.4, 40.0], [-64.0, 0.4, 36.6], [-60.0, 0.4, 36.2], [-56.0, 0.4, 36.6], [-54.5, 0.4, 40.0],
      [-56.0, 0.4, 43.4], [-60.0, 0.4, 43.7], [-64.0, 0.4, 43.4], [-65.5, 0.4, 40.0]];
    var curve = pkCoCurve(pts), len = curve.getLength(), F = pkCoFrames(curve, 300);
    var E = { curve: curve, len: len, F: F, gap: 2.2, cars: [], uPark: pkCoUAt(curve, -61.2, 43.6), uOfF: [], run: 34 };
    var seats = [], cols = [0xf0c04a, 0xd2622f];
    for (i = 0; i < 2; i++) {
      var car = pkCoCar(cols[i], { w: 1.2, d: 1.7 });
      scene.add(car.g);
      E.cars.push(car);
      car.seats.forEach(function (st) {
        seats.push({ par: car.g, x: st.x, y: st.y, z: st.z, ry: 0, guest: null });
      });
    }
    pkCoTrackBuild(g, E, {
      spineMat: std({ color: 0x8a6a4a, roughness: 0.75 }),
      supMat: std({ color: 0x4a443c, roughness: 0.7 }),
      tieMat: std({ color: 0x59503f, roughness: 0.85 }),
      skip: function () { return true; }
    });
    pkCoPlan(E, { vMin: 1.6, vMax: 4.4 });
    for (s = 0.9; s < len; s += 1.7) {
      var q = curve.getPointAt(s / len);
      pkRoundCyl(0.055, q.y, std({ color: 0x4a443c, roughness: 0.8 }), q.x, q.y / 2, q.z, g, 6);
    }
    pkCoPlatform(g, -63.5, -56.5, 43.9, 45.3, th);
    for (i = 0; i < 6; i++) {
      var qa = i / 6 * Math.PI * 2;
      pkRoundCyl(0.34, 0.42, std({ color: 0x7a6a52, roughness: 0.85 }), -60 + Math.sin(qa) * 6.6, 0.21, 40 + Math.cos(qa) * 4.6, g, 12);
      sphere(0.3, std({ color: 0x4d7a3a, roughness: 0.95 }), -60 + Math.sin(qa) * 6.6, 0.5, 40 + Math.cos(qa) * 4.6, g);
    }
    var a = pkAttr({
      id: p.id, name: p.name, x: p.x, z: p.z, qx: p.q[0], qz: p.q[1], g: g, seats: seats,
      board: 4, run: E.run, unload: 5, extra: E, tickRun: function (at) { pkCoRun(at); }
    });
    var C = pkCtl(a);
    E.a = a;
    pkCoGates(g, [-61.2, -59.0], 43.95, C);
    E.cars.forEach(function (c) { C.barObjs.push(function (bb) { c.bar.rotation.x = -1.35 * (1 - bb); }); });
    pkCoPlace(E, E.uPark);
    return a;
  }
  // the acorn playhouse: a sandpit, a little tower and a slide, for the ones too small to queue
  function pkBuildPlayhouse() {
    var g = new THREE.Group(); g.position.set(-38.5, 0, 42); scene.add(g);
    var wood = std({ color: 0x8a6a4a, roughness: 0.85 }), leaf = std({ color: 0x4d7a3a, roughness: 0.9 });
    pkRoundCyl(4.6, 0.12, std({ color: 0xd8c49a, roughness: 0.98 }), 0, 0.06, 0, g, 32);
    pkRing(4.7, 0.15, wood, 0, 0.12, 0, g, 32);
    pkRoundCyl(1.5, 3.2, std({ color: 0x9a8a6a, roughness: 0.9 }), -1.4, 1.6, -1.2, g, 18);
    var cap = new THREE.Mesh(new THREE.ConeGeometry(1.95, 1.3, 18, 1), leaf);
    cap.position.set(-1.4, 3.85, -1.2); cap.castShadow = true; g.add(cap);
    pkRoundCyl(0.42, 0.5, std({ color: 0xf4f1e6, roughness: 0.8 }), -1.4, 1.7, 0.15, g, 12);
    pkLocalSolid(g, -2.9, 0.1, -2.7, 0.3, 0, 3.4);
    var sx, sz;
    for (sx = 0; sx < 2; sx++) for (sz = 0; sz < 2; sz++) pkRoundCyl(0.1, 1.5, wood, 1.4 + sx * 1.6, 0.75, 0.6 + sz * 1.6, g, 8);
    box(2.0, 0.12, 2.0, wood, 2.2, 1.5, 1.4, g);
    box(2.0, 0.5, 0.08, wood, 2.2, 1.75, 0.42, g);
    var slide = box(0.95, 0.1, 3.2, std({ color: 0xf0c04a, roughness: 0.5 }), 3.1, 0.85, 2.6, g);
    slide.rotation.x = 0.42;
    pkLocalSolid(g, 1.3, 3.1, -0.2, 2.4, 0, 1.6);
    pkLocalSolid(g, 2.6, 3.7, 1.9, 4.3, 0, 0.9);
    box(1.9, 0.09, 0.5, wood, -3.4, 0.45, 2.6, g);
    pkLocalSolid(g, -4.4, -2.4, 2.2, 3.0, 0, 0.6);
    pkFuse(g);
  }
