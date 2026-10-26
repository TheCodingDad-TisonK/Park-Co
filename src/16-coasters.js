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
  // The track's frames: a point, a tangent and an 'up' every sample. 'up' is carried along the curve (parallel transport) but
  // held to the world's up as it goes, so turns on a slope and helices do not wind roll into it: wherever the track is not
  // near vertical, any roll it has gathered is eased back to upright, or to cleanly inverted over the top of a loop.
  // P (the speed profile from pkCoProfile, laid from u0) banks the turns by physics: tan(bank) = v^2 x curvature / g.
  // o.roll lists stretches [ua, ub] (a corkscrew) where the felt force rolls the train on round over the top instead of being
  // held upright as it would be floating over a hill: there it is the track's shape, not airtime, that turns it over.
  function pkCoFrames(curve, N, P, u0, o) {
    var rolls = (o && o.roll) || [], inRoll = function (u) { for (var r = 0; r < rolls.length; r++) { var a = rolls[r][0], b = rolls[r][1]; if (a <= b ? (u >= a && u <= b) : (u >= a || u <= b)) return true; } return false; };
    var pts = [], tans = [], ups = [], i;
    for (i = 0; i < N; i++) { pts.push(curve.getPointAt(i / N)); tans.push(curve.getTangentAt(i / N).normalize()); }
    var up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(up.dot(tans[0])) > 0.92) up.set(1, 0, 0);
    up.addScaledVector(tans[0], -up.dot(tans[0])).normalize();
    ups.push(up.clone());
    var ref = new THREE.Vector3(), crs = new THREE.Vector3();
    for (i = 1; i < N; i++) {
      var ti = tans[i];
      PK_CO_Q.setFromUnitVectors(tans[i - 1], ti);
      up.applyQuaternion(PK_CO_Q);
      up.addScaledVector(ti, -up.dot(ti));
      if (up.lengthSq() < 1e-5) up.set(0, 1, 0).addScaledVector(ti, -ti.y);
      up.normalize();
      if (Math.abs(ti.y) < 0.88) {
        ref.set(0, 1, 0).addScaledVector(ti, -ti.y).normalize();
        var roll = Math.atan2(crs.crossVectors(ref, up).dot(ti), ref.dot(up));
        var want = Math.abs(roll) <= Math.PI / 2 ? 0 : (roll > 0 ? Math.PI : -Math.PI);
        PK_CO_Q.setFromAxisAngle(ti, -(roll - want) * 0.25);
        up.applyQuaternion(PK_CO_Q).normalize();
      }
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
    // Roll by the felt force: the seat's 'up' follows where the ride pushes the rider, v^2 x the curvature plus gravity's
    // pull, taken across the track. In a turn that banks by speed; over a slow crest it stays upright, over a fast loop top
    // it is inverted, and where the force says nothing (straight up or down, or floating over a hill) the roll is carried
    // through from either side. The roll is measured off the carried frame, unwrapped from the station round, smoothed.
    var ds = curve.getLength() / N, raw = [], wt = [], f = new THREE.Vector3(), cr2 = new THREE.Vector3(), i0 = 0;
    if (P) i0 = Math.round(u0 * N) % N;
    for (var j = 0; j < N; j++) {
      i = (i0 + j) % N;
      var v2 = 11.5 * 11.5;                                    // with no profile, as if at 41 km/h everywhere
      if (P) { var kq = Math.min(P.K, Math.round(j / N * P.K)); v2 = P.V[kq] * P.V[kq]; }
      f.subVectors(tans[(i + 1) % N], tans[(i - 1 + N) % N]).multiplyScalar(v2 / (2 * ds));
      f.y += 9.81;
      f.addScaledVector(tans[i], -f.dot(tans[i]));
      wt.push(clamp(f.length() / 9.81 - 0.15, 0, 1));
      var ra = Math.atan2(cr2.crossVectors(ups[i], f).dot(tans[i]), ups[i].dot(f));
      // floating over a hump on an upright stretch pulls the rider up out of the seat: that keeps the track upright (banked
      // by the sideways part only), it never rolls the train over. Only the track's own shape turns it upside down.
      if (Math.abs(ra) > Math.PI / 2 && Math.abs(tans[i].y) < 0.88 && ups[i].y > 0 && !inRoll(i / N)) ra -= (ra > 0 ? Math.PI : -Math.PI);
      raw.push(ra);
    }
    // unwrap where the force is clear; where it is not, hold the last clear roll, then ease across the gap
    var th = [], last = 0, lastJ = -1;
    for (j = 0; j < N; j++) {
      if (wt[j] > 0.05) {
        var d = raw[j] - last; d -= Math.round(d / (Math.PI * 2)) * Math.PI * 2;
        var now = last + d;
        if (lastJ >= 0 && j - lastJ > 1) for (var q = lastJ + 1; q < j; q++) th[q] = last + (now - last) * (q - lastJ) / (j - lastJ);
        th[j] = now; last = now; lastJ = j;
      } else th[j] = last;
    }
    for (var pass = 0; pass < 40; pass++) {
      var prev = th.slice();
      for (j = 1; j < N - 1; j++) th[j] = prev[j - 1] * 0.25 + prev[j] * 0.5 + prev[j + 1] * 0.25;
    }
    for (j = 0; j < N; j++) {
      i = (i0 + j) % N;
      if (Math.abs(th[j]) < 0.002) continue;
      PK_CO_Q.setFromAxisAngle(tans[i], th[j]);
      ups[i].applyQuaternion(PK_CO_Q).addScaledVector(tans[i], -ups[i].dot(tans[i])).normalize();
    }
    return { p: pts, t: tans, up: ups, n: N };
  }
  // the station: where the train stands the track is dead level and unbanked. Over the train's length (plus a car either end)
  // every frame's 'up' is the world's up, faded back into the lap's own banking over the 6 m beyond. The curve itself is laid
  // straight and level there by its control points; this takes out the bank the smoothing spreads in from the turns.
  function pkCoLevel(F, curve, uPark, back, ahead) {
    var L = curve.getLength(), N = F.n, fade = 6, up = new THREE.Vector3(), t = new THREE.Vector3();
    for (var i = 0; i < N; i++) {
      var du = ((i / N - uPark + 1.5) % 1 - 0.5) * L;                  // metres from the park point, + ahead, - behind
      var out = du > ahead ? du - ahead : (du < -back ? -back - du : 0);
      var w = out <= 0 ? 1 : out >= fade ? 0 : 1 - out / fade; w = w * w * (3 - 2 * w);
      if (w <= 0) continue;
      t.copy(F.t[i]); up.set(0, 1, 0).addScaledVector(t, -t.y).normalize();
      F.up[i].lerp(up, w).addScaledVector(t, -F.up[i].dot(t)).normalize();
    }
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
  // The speed of a train round a lap, by physics rather than by height. From the park point the train rolls out on the
  // station's tyres (to 2.5 m/s), climbs the lift at chain speed, and from the crest on runs on what the drop gave it:
  // v² grows by 2g for every metre it falls and loses a little to wheel friction and air over every metre it covers.
  // Booster tyres keep it from ever stalling, and a brake run brings it home to a slow roll and a stop at the platform.
  // The lift is the sustained climb up to the lap's highest point, found from the track (o.lift overrides it, as
  // [u0, u1]); o.pedal gives a kiddie train its steady pace instead. o.rollIn stretches the final slow roll to that many metres
  // before the stop (2.5 by default), for a station entered round a tight turn. o.trim lists trim brakes as [u0, u1, v]: through
  // that stretch the train is held to v m/s, and runs on from there. Returns the speed and the time at K+1 even steps.
  function pkCoProfile(curve, len, u0, o) {
    o = o || {};
    var K = Math.max(240, Math.ceil(len / 0.3)), S = len / K, ys = [], i, g = 9.81;
    for (i = 0; i <= K; i++) ys.push(curve.getPointAt((u0 + i / K) % 1).y);
    var lift = [-1, -1];
    if (o.lift) {
      lift = o.lift.map(function (u) { return Math.round(((u - u0 + 1) % 1) * K); });
    } else if (!o.pedal) {
      var c = 0;
      for (i = 0; i <= K * 0.7; i++) if (ys[i] > ys[c]) c = i;
      var l0 = c;
      while (l0 > 1 && ys[l0 - 1] < ys[l0] - 1e-4) l0--;                // back down the climb to where it starts
      if (c - l0 > 4) lift = [l0, c];
    }
    var trims = (o.trim || []).map(function (t) { return [Math.round(((t[0] - u0 + 1) % 1) * K), Math.round(((t[1] - u0 + 1) % 1) * K), t[2]]; });
    var vSt = o.vStation || 2.5, vChain = o.vChain || 2.4, mu = 0.022, drag = 0.0009, V = [0], dIn = o.rollIn || 2.5;
    for (i = 1; i <= K; i++) {
      var v, s = i * S, d = len - s;
      if (o.pedal) v = o.pedal;
      else if (i >= lift[0] && i <= lift[1]) v = vChain;
      else {
        var w = V[i - 1];
        var v2 = w * w + 2 * g * (ys[i - 1] - ys[i]) - 2 * g * mu * S - 2 * drag * w * w * S;
        v = Math.sqrt(Math.max(0, v2));
        v = Math.max(v, i < lift[0] ? vSt : 2.0);                          // station tyres before the lift, boosters after
        for (var tb = 0; tb < trims.length; tb++) if (i >= trims[tb][0] && i <= trims[tb][1]) v = Math.min(v, trims[tb][2]);
      }
      if (s < 4) v = Math.min(v, Math.max(0.5, Math.sqrt(2 * 0.9 * s)));  // pulling away from the platform
      v = Math.min(v, Math.sqrt(4 + 2 * 4 * d));                          // the brake run
      if (d < dIn) v = Math.min(v, Math.max(0.35, Math.sqrt(2 * 0.8 * d)));   // and the roll in to the stop
      else if (o.rollIn) v = Math.min(v, Math.sqrt(2 * 0.8 * dIn + 2 * 4 * (d - dIn)));   // braked down to meet it
      V.push(v);
    }
    var T = [0];
    for (i = 1; i <= K; i++) T.push(T[i - 1] + S / Math.max(0.2, (V[i - 1] + V[i]) / 2));
    return { K: K, V: V, T: T, lift: lift };
  }
  // The lap plan: integrate the profile once, so progress by time maps exactly back onto the track. E.run is the lap's
  // real length in seconds; E.vTop and E.vLow (after the lift) are kept for the speed test.
  function pkCoPlan(E, o) {
    var P = pkCoProfile(E.curve, E.len, E.uPark, o), K = P.K, T = P.T, u0 = E.uPark;
    var M = 600, uOfF = [], j = 1;
    for (var k = 0; k <= M; k++) {
      var tt = (k / M) * T[K];
      while (j < K && T[j] < tt) j++;
      var t0 = T[j - 1], t1 = T[j], f = t1 > t0 ? (tt - t0) / (t1 - t0) : 0;
      uOfF.push((j - 1 + f) / K);                                         // laps from the park point, 0..1
    }
    E.u0 = u0; E.uOfF = uOfF;
    E.run = Math.round(T[K] * 10) / 10;
    E.vTop = 0; E.vLow = 99;
    for (var i = 0; i <= K; i++) { E.vTop = Math.max(E.vTop, P.V[i]); if (P.lift[1] > 0 && i > P.lift[1] && i < K * 0.85) E.vLow = Math.min(E.vLow, P.V[i]); }
  }
  // the train between two planned steps, eased linearly, so a slow lap does not move in jumps
  function pkCoRun(at) {
    var E = at.extra;
    if (!E || !E.uOfF || !E.uOfF.length) return;
    var M = E.uOfF.length - 1, f = at.state === 'running' ? clamp(at.t / at.run, 0, 1) * M : 0;
    var k = Math.min(M - 1, Math.floor(f)), r = f - k;
    pkCoPlace(E, (E.u0 + E.uOfF[k] + (E.uOfF[k + 1] - E.uOfF[k]) * r) % 1);
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
      var c = new THREE.CatmullRomCurve3(rp, true, 'centripetal');
      var m = new THREE.Mesh(new THREE.TubeGeometry(c, N, 0.075, 6, true), railMat);
      m.castShadow = true; m.receiveShadow = true; g.add(m);
    });
    var sp = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spine, true, 'centripetal'), N, 0.15, 10, true), spineMat);
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
      if (Math.abs(t2.y) > 0.72 || p2.y < 1.5 || E.F.up[i].y < 0.3) continue;      // not on the steep, not under an inversion
      var under = false;                                                     // nor down through a lower pass of the track
      for (var jj = 0; jj < N && !under; jj += 2) { var pj = E.F.p[jj]; if (pj.y < p2.y - 0.8 && Math.abs(pj.x - p2.x) < 1.0 && Math.abs(pj.z - p2.z) < 1.0) under = true; }
      if (under) continue;
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
  function pkCoGates(g, xs, z, C, y) {
    var lift = (y === undefined ? 0.18 : y) - 0.18;
    xs.forEach(function (x) {
      pkRoundCyl(0.09, 1.06, MAT.steelDark, x, 0.53 + lift, z, g, 8);
      var boom = new THREE.Group(); boom.position.set(x, 0.92 + lift, z); boom.userData.dynamic = true; boom.userData.keep = true; g.add(boom);
      box(0.92, 0.09, 0.07, MAT.hazard, 0.46, 0, 0, boom, { r: 0.02 });
      box(0.92, 0.05, 0.05, MAT.steel, 0.46, -0.2, 0, boom);
      for (var i = 0; i < 4; i++) box(0.04, 0.22, 0.04, MAT.steel, 0.12 + i * 0.24, -0.11, 0, boom);
      box(0.1, 0.14, 0.1, MAT.red, 0.9, 0, 0, boom);
      C.stationGateObjs.push(function (t) { boom.rotation.z = t * Math.PI / 2.1; });
    });
  }
  function pkCoCanopy(g, x0, x1, zSouth, depth, label, th, y) {
    var lift = (y === undefined ? 0.18 : y) - 0.18;
    var i, x;
    for (i = 0; i < 4; i++) {
      x = x0 + 0.45 + (x1 - x0 - 0.9) * i / 3;
      pkRoundCyl(0.085, 3.0, MAT.steelDark, x, 1.5 + lift, zSouth, g, 8);
      pkRod(x, 3.0 + lift, zSouth, x, 3.0 + lift, zSouth - depth + 0.2, 0.05, MAT.steel, g, 6);
      solid(x - 0.14, x + 0.14, zSouth - 0.14, zSouth + 0.14, lift, 3.0 + lift);
    }
    var mid = (x0 + x1) / 2;
    box(x1 - x0, 0.1, depth, pkMats().roof, mid, 3.06 + lift, zSouth - depth / 2, g);
    box(x1 - x0, 0.06, depth - 0.3, std({ color: th.a, roughness: 0.6 }), mid, 3.12 + lift, zSouth - depth / 2, g);
    box(x1 - x0, 0.34, 0.1, MAT.steelDark, mid, 3.02 + lift, zSouth + 0.02, g);
    pkSign3D([label], Math.min(4.8, x1 - x0 - 1.2), 0.28, mid, 3.02 + lift, zSouth + 0.08, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);
    [-1, 1].forEach(function (sx) {
      pkRoundCyl(0.16, 0.22, MAT.bulb, mid + sx * (x1 - x0) / 4, 2.86 + lift, zSouth - 0.6, g, 10);
    });
  }
  // a coaster platform: kerb, deck, edge stripe, a plant tub and a lamp at each end
  function pkCoPlatform(g, x0, x1, zN, zS, th, y) {
    var surf = y === undefined ? 0.18 : y, lift = surf - 0.18;
    if (lift > 0.02) box(x1 - x0, lift, zS - zN, pkMats().kerb, (x0 + x1) / 2, lift / 2, (zN + zS) / 2, g);
    box(x1 - x0, 0.12, zS - zN, pkMats().kerb, (x0 + x1) / 2, 0.06 + lift, (zN + zS) / 2, g);
    box(x1 - x0 - 0.12, 0.07, zS - zN - 0.12, pkMats().pavers, (x0 + x1) / 2, 0.145 + lift, (zN + zS) / 2, g);
    box(x1 - x0, 0.03, 0.16, MAT.hazard, (x0 + x1) / 2, 0.17 + lift, zN + 0.08, g);
    [x0 + 0.5, x1 - 0.5].forEach(function (x) {
      pkRoundCyl(0.26, 0.5, MAT.stone, x, 0.25 + lift, zS - 0.4, g, 12);
      pkRoundCyl(0.3, 0.08, MAT.stone, x, 0.52 + lift, zS - 0.4, g, 12);
      pkRoundCyl(0.04, 2.5, MAT.steelDark, x, 1.25 + lift, zS - 0.34, g, 8);
      pkRoundCyl(0.17, 0.24, MAT.bulb, x, 2.6 + lift, zS - 0.34, g, 10);
    });
    if (lift > 0.02) {
      var rampLen = Math.max(2, lift * 2);
      var ramp = box(x1 - x0, 0.1, rampLen, pkMats().kerb, (x0 + x1) / 2, lift / 2, zS + rampLen / 2, g);
      ramp.rotation.x = -Math.atan2(lift, rampLen);
      PK_FLOOR_RECTS.push({ axis: 'z', x0: x0, x1: x1, z0: zN, z1: zS, y: surf, ramp: rampLen });
    }
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
  // A double looper in the north-east corner: a long straight station, an 18 m lift up the east fence, the big drop along the
  // back, a turnaround and a camelback run, then two vertical loops (each shifted sideways, so it crosses over itself) and
  // home down the west side into the station.
  var PK_SERPENT_PTS = [
    [47, 1.05, -70], [49.4, 1.05, -70], [51.8, 1.05, -70], [54.2, 1.05, -70], [56.6, 1.05, -70], [59, 1.05, -70],
    [61.4, 1.05, -70], [64, 1.3, -70.9], [66.4, 2.2, -72.8], [67.4, 3.8, -75.4], [67.6, 6.5, -78.4], [67.6, 10, -81.8],
    [67.5, 13.5, -85.2], [67, 16.5, -88.4], [65.6, 18.2, -90.9], [63.2, 18.4, -91.9], [60.4, 17.8, -92.1], [57.6, 13, -91.9],
    [55.2, 6.2, -91.4], [53, 2.2, -90.6], [50.2, 3.4, -91.6], [47.4, 5.4, -91.1], [45.9, 6.8, -89.6], [46.6, 7, -88.2],
    [48.8, 6.4, -88], [51.2, 4.4, -88], [53.4, 6.2, -88.1], [55.4, 6, -88.1], [57.6, 3.6, -88], [60.4, 2.6, -87.7],
    [63, 3, -86.6], [64.4, 3.4, -84.6], [64, 3, -82], [62.2, 2.7, -80.6], [59.6, 2.5, -80.3], [56.9, 2.5, -80.3],
    [54.85, 2.91, -80.44], [53.12, 4.07, -80.59], [51.96, 5.8, -80.73], [51.55, 7.85, -80.88], [51.96, 9.9, -81.02], [53.12, 11.63, -81.16],
    [54.85, 12.79, -81.31], [56.9, 13.2, -81.45], [58.95, 12.79, -81.59], [60.68, 11.63, -81.74], [61.84, 9.9, -81.88], [62.25, 7.85, -82.02],
    [61.84, 5.8, -82.17], [60.68, 4.07, -82.31], [58.95, 2.91, -82.46], [56.9, 2.5, -82.6], [53.6, 2.7, -83], [49.8, 3.3, -83.4],
    [48.02, 3.71, -83.57], [46.59, 4.84, -83.74], [45.8, 6.49, -83.91], [45.8, 8.31, -84.09], [46.59, 9.96, -84.26], [48.02, 11.09, -84.43],
    [49.8, 11.5, -84.6], [51.58, 11.09, -84.77], [53.01, 9.96, -84.94], [53.8, 8.31, -85.11], [53.8, 6.49, -85.29], [53.01, 4.84, -85.46],
    [51.58, 3.71, -85.63], [49.8, 3.3, -85.8], [47.6, 3.4, -86], [45.4, 3.5, -86.1], [43.7, 3.6, -84.7], [43.6, 3.3, -82.2],
    [44.2, 2.6, -79.6], [44.4, 1.6, -76.6], [44.45, 1.1, -73.8], [44.9, 1.05, -71.8], [45.8, 1.05, -70.5]
  ];
  function pkBuildSerpent(p) {
    var th = PK_THEME.serpent, M = pkMats(), i;
    var g = new THREE.Group(); scene.add(g);
    var curve = pkCoCurve(PK_SERPENT_PTS), len = curve.getLength(), uP = pkCoUAt(curve, 57.4, -70);
    var F = pkCoFrames(curve, 520, pkCoProfile(curve, len, uP), uP);
    var E = { curve: curve, len: len, F: F, gap: 2.35, cars: [], uPark: uP, uOfF: [], run: 30 };
    pkCoLevel(F, curve, E.uPark, 4 * 2.35 + 1.4, 1.4);
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
      skip: function (x, z) { return z > -71.6 && x > 45.5 && x < 62.5; }
    });
    pkCoBrace(g, 69.2, -80.2, 8.6, 67.7, 8.2, -80.2, supMat);
    pkCoBrace(g, 69.2, -86.6, 15.6, 67.3, 15.2, -86.7, supMat);
    pkCoPlan(E);
    // the station: platform, boom gates, canopy
    pkCoPlatform(g, 47.0, 58.6, -69.35, -66.85, th, 1.05);
    var a = pkAttr({
      id: 'serpent', name: 'The Serpent', x: p.x, z: p.z,
      qx: p.q[0], qz: p.q[1], qdx: -1, g: g, seats: seats,
      board: 11, run: E.run, unload: 6, exit: [53.0, -67.6],
      extra: E, tickRun: function (at) { pkCoRun(at); }
    });
    var C = pkCtl(a);
    E.a = a;
    pkCoGates(g, [57.4, 55.05, 52.7, 50.35, 48.0], -69.42, C, 1.05);
    pkCoCanopy(g, 47.9, 58.5, -66.95, 2.3, 'THE SERPENT', th, 1.05);
    E.cars.forEach(function (c) {
      C.barObjs.push(function (b) { c.bar.rotation.x = -1.35 * (1 - b); });
    });
    pkCoPlace(E, E.uPark);
    return a;
  }
  // ── Baron's Drop ─────────────────────────────────────────────────
  // A dive coaster in the south-east: a long straight station, the near-vertical lift, a slow turn at the top, a straight
  // vertical drop into a tunnel mouth in the rockery, a loop along the east fence (clear of the lift), then round the corner,
  // back along the fence over a camelback and up the west side into the station.
  var PK_BARON_PTS = [
    [48.4, 0.95, 15.5], [50.8, 0.95, 15.5], [53.2, 0.95, 15.5], [55.6, 0.95, 15.5], [58, 0.95, 15.5], [60.4, 0.95, 15.5],
    [62.8, 0.95, 15.5], [64.6, 2, 16], [65.4, 6, 16.6], [65.8, 11.5, 17.3], [65.6, 16.5, 18.3], [64.4, 20.6, 19.6],
    [61.6, 21.2, 20.8], [60.2, 21.2, 21.1], [57.9, 21.1, 21.9], [56.2, 20.7, 22.5], [56, 19, 22.55], [55.95, 12, 22.55],
    [55.9, 4, 22.55], [55.9, 1.6, 22.5], [56.4, 1.15, 22.1], [57.6, 1.6, 20.8], [59.4, 2.2, 20.2], [61.8, 2.6, 20.6],
    [64.2, 3.4, 21.4], [65.6, 4.4, 22.6], [65.8, 5, 23.6], [65.97, 5.4, 25.34], [66.14, 6.51, 26.73], [66.31, 8.11, 27.5],
    [66.49, 9.89, 27.5], [66.66, 11.49, 26.73], [66.83, 12.6, 25.34], [67, 13, 23.6], [67.17, 12.6, 21.86], [67.34, 11.49, 20.47],
    [67.51, 9.89, 19.7], [67.69, 8.11, 19.7], [67.86, 6.51, 20.47], [68.03, 5.4, 21.86], [68.2, 5, 23.6], [68.6, 4.6, 25.8],
    [67.4, 4.2, 28.1], [64.4, 3.6, 28.7], [61.2, 4.6, 28.7], [58.2, 6, 28.7], [55.2, 3, 28.7], [51.6, 2, 28.5],
    [48.2, 1.8, 27.6], [46.6, 1.4, 25.4], [46.4, 1.05, 22.6], [46.4, 0.95, 19.8], [46.7, 0.95, 17.4], [47.4, 0.95, 16]
  ];
  function pkBuildBaron(p) {
    var th = PK_THEME.baron, i;
    var g = new THREE.Group(); scene.add(g);
    var curve = pkCoCurve(PK_BARON_PTS), len = curve.getLength(), uP = pkCoUAt(curve, 56.8, 15.5);
    var F = pkCoFrames(curve, 500, pkCoProfile(curve, len, uP), uP);
    var E = { curve: curve, len: len, F: F, gap: 2.42, cars: [], uPark: uP, uOfF: [], run: 30 };
    pkCoLevel(F, curve, E.uPark, 3 * 2.42 + 1.4, 1.4);
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
      skip: function (x, z) { return (x > 47.5 && x < 63.2 && z > 14.8 && z < 19.4); }
    });
    // the lift tower and the drop tower: two columns with rods out to the spine
    pkCoBrace(g, 67.0, 17.3, 9.6, 65.6, 9.8, 17.4, supMat);
    pkCoBrace(g, 54.6, 22.55, 18.4, 55.7, 18.2, 22.55, supMat);
    pkCoBrace(g, 57.3, 22.55, 18.4, 56.1, 18.2, 22.55, supMat);
    pkCoPlan(E);
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
    pkCoPlatform(g, 48.5, 57.9, 16.35, 18.55, th, 0.95);
    var a = pkAttr({
      id: 'baron', name: "Baron's Drop", x: p.x, z: p.z,
      qx: p.q[0], qz: p.q[1], qdx: -1, g: g, seats: seats,
      board: 10, run: E.run, unload: 6, exit: [52.4, 17.4],
      extra: E, tickRun: function (at) { pkCoRun(at); }
    });
    var C = pkCtl(a);
    E.a = a;
    pkCoGates(g, [56.8, 54.4, 52.0, 49.6], 16.3, C, 0.95);
    pkCoCanopy(g, 48.7, 57.7, 18.5, 2.0, "BARON'S DROP", th, 0.95);
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
    { id: 'baron', name: "Baron's Drop", x: 57, z: 19, r: 12, q: [58.6, 19], qdx: 1, level: 13, pad: 0.82, boothAt: [67.4, 9.8] },   // the line runs east from the gate: the train comes home up the west side
    { id: 'nocturne', name: 'Nocturne', x: -50, z: -94.75, r: 16, q: [-59.1, -76.4], qdx: 1, level: 14, pad: 0.02 },
    { id: 'wreck', name: 'The Wreck', x: -20, z: -94.75, r: 16, q: [-29.1, -76.4], qdx: 1, level: 15, pad: 0.02 },
    { id: 'moonwood', name: 'Moonwood', x: 30, z: -94.75, r: 16, q: [39.1, -76.4], qdx: -1, level: 16, pad: 0.02 }
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
      a.open = pkRideSavedOpen(p.id);
      if (S.rides) S.rides[p.id] = a.open;
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
  // Three show buildings along the north wall, 24 m wide, 31.5 m deep and 14 m tall. Each has a wide portal on the promenade
  // side, a queue lane outside under its portico, a station just inside the portal and a glazed control cabin at the end of
  // the platform, so the booth hardware sits with the ride instead of out on the promenade. All three climb an 11 m chain
  // lift up the far wall and dive along the back; then each runs its own circuit round its own centrepiece: Nocturne
  // U-turns up to the moon and spirals a turn and a half down round it; The Wreck flies a figure-eight with the ship in one
  // loop, high through the crossing the first time and low the second; Moonwood runs a camelback up the portal side and
  // three quarters round the trunk under the crown, back under its own way in.
  var PK_INDOOR = {
    nocturne: { name: 'Nocturne', box: [-62, -38, -110.5, -79], portal: 'w', wall: 0x2b2e3d, band: 0x8f7bd6, trim: 0x40465e, roof: 0x1d2030, sign: '#b9a7f0', ground: 0x767b93, centre: 'moon', at: [12.8, -96.4] },
    wreck:    { name: 'The Wreck', box: [-32, -8, -110.5, -79], portal: 'w', wall: 0x5b5348, band: 0xd8a24a, trim: 0x4a443c, roof: 0x3b3630, sign: '#e8bd6a', ground: 0x8a7c66, centre: 'ship', at: [13.8, -95.0] },
    moonwood: { name: 'Moonwood', box: [18, 42, -110.5, -79], portal: 'e', wall: 0x6b5340, band: 0x8fd3c7, trim: 0x4f4132, roof: 0x4a3a2c, sign: '#9fe0d4', ground: 0x7c7058, centre: 'tree', at: [10.0, -95.7] }
  };
  var PK_HALL_H = 14.0, PK_HALL_CEIL = 13.5;
  // The circuits are laid out in the hall's own frame: u is metres in from the portal wall (the hall is mirrored for an east
  // portal), z is the world z. The inside of the hall is u 0.3..23.7, z -110.2..-79.3; the track keeps to u 1.4..22.3,
  // z -108.7..-83.2 and below 11.1 m, under the ceiling beams. Every circuit shares the station (the platform straight along
  // z -83.35 from u 3.3, dead level) and the lift. The points are laid offline from straights and arcs in plan with a height
  // profile of vertical arcs, then sampled every 1.2 m along the track: checked clear of itself (2.5 m between passes stacked
  // over each other, 1.9 m side by side), of the control cabin at u 14.6..19.6, z > -82.6, and under 4.5 g at the speeds
  // pkCoProfile gives (with the 12 m station roll-in).
  var PK_INDOOR_LAYOUT = {
    moon: [
      [3.3, 1, -83.35], [4.5, 1, -83.35], [5.71, 1, -83.35], [6.92, 1, -83.35], [8.12, 1, -83.35], [9.32, 1, -83.35],
      [10.53, 1, -83.35], [11.73, 1, -83.35], [12.94, 1, -83.35], [14.14, 1, -83.35], [15.35, 1, -83.4], [16.52, 1, -83.68],
      [17.6, 1.06, -84.19], [18.55, 1.29, -84.9], [19.29, 1.7, -85.75], [19.84, 2.25, -86.67], [20.2, 2.82, -87.66], [20.38, 3.39, -88.71],
      [20.4, 3.96, -89.77], [20.4, 4.53, -90.83], [20.4, 5.1, -91.89], [20.4, 5.67, -92.95], [20.4, 6.25, -94.01], [20.4, 6.82, -95.07],
      [20.4, 7.39, -96.13], [20.4, 7.96, -97.2], [20.4, 8.53, -98.26], [20.4, 9.1, -99.32], [20.4, 9.67, -100.38], [20.4, 10.24, -101.44],
      [20.34, 10.78, -102.52], [20.07, 11, -103.66], [19.55, 10.81, -104.72], [18.93, 10.22, -105.55], [18.37, 9.31, -106.09], [18.03, 8.21, -106.35],
      [17.65, 7.02, -106.6], [17.11, 6.01, -106.88], [16.36, 5.11, -107.16], [15.45, 4.36, -107.35], [14.4, 3.78, -107.4], [13.26, 3.39, -107.4],
      [12.07, 3.21, -107.4], [10.86, 3.24, -107.4], [9.68, 3.48, -107.4], [8.53, 3.83, -107.4], [7.38, 4.18, -107.4], [6.23, 4.54, -107.4],
      [5.08, 4.89, -107.4], [3.94, 5.24, -107.23], [2.92, 5.6, -106.71], [2.13, 5.95, -105.89], [1.63, 6.3, -104.85], [1.51, 6.66, -103.71],
      [1.76, 7.01, -102.59], [2.35, 7.37, -101.61], [3.24, 7.72, -100.88], [4.34, 7.97, -100.47], [5.54, 8, -100.4], [6.74, 8, -100.4],
      [7.95, 8, -100.4], [9.15, 8, -100.4], [10.35, 8, -100.4], [11.56, 8, -100.4], [12.76, 8, -100.4], [13.95, 7.89, -100.22],
      [15.02, 7.72, -99.72], [15.9, 7.54, -98.92], [16.5, 7.36, -97.9], [16.78, 7.18, -96.75], [16.7, 7, -95.57], [16.29, 6.82, -94.45],
      [15.56, 6.64, -93.52], [14.6, 6.46, -92.83], [13.47, 6.28, -92.46], [12.28, 6.1, -92.44], [11.14, 5.92, -92.77], [10.15, 5.74, -93.41],
      [9.39, 5.56, -94.32], [8.92, 5.38, -95.42], [8.81, 5.2, -96.6], [9.04, 5.02, -97.76], [9.61, 4.84, -98.8], [10.46, 4.67, -99.63],
      [11.51, 4.49, -100.19], [12.68, 4.31, -100.39], [13.85, 4.13, -100.25], [14.94, 3.95, -99.77], [15.83, 3.77, -99], [16.47, 3.59, -97.99],
      [16.77, 3.41, -96.84], [16.73, 3.23, -95.66], [16.34, 3.05, -94.54], [15.63, 2.87, -93.58], [14.68, 2.69, -92.87], [13.56, 2.51, -92.48],
      [12.38, 2.33, -92.4], [11.19, 2.15, -92.4], [9.99, 1.97, -92.4], [8.8, 1.79, -92.4], [7.61, 1.61, -92.4], [6.42, 1.44, -92.4],
      [5.23, 1.26, -92.4], [4.05, 1.08, -92.3], [2.97, 1, -91.77], [2.19, 1, -90.87], [1.83, 1, -89.73], [1.8, 1, -88.53],
      [1.8, 1, -87.32], [1.8, 1, -86.12], [1.8, 1, -84.91], [2.23, 1, -83.83]
    ],
    ship: [
      [3.3, 1, -83.35], [4.5, 1, -83.35], [5.7, 1, -83.35], [6.9, 1, -83.35], [8.1, 1, -83.35], [9.3, 1, -83.35],
      [10.5, 1, -83.35], [11.71, 1, -83.35], [12.91, 1, -83.35], [14.11, 1, -83.35], [15.3, 1, -83.4], [16.47, 1, -83.66],
      [17.56, 1.05, -84.17], [18.51, 1.28, -84.86], [19.26, 1.68, -85.7], [19.81, 2.23, -86.61], [20.18, 2.83, -87.58], [20.37, 3.43, -88.61],
      [20.4, 4.03, -89.65], [20.4, 4.62, -90.69], [20.4, 5.22, -91.73], [20.4, 5.82, -92.77], [20.4, 6.42, -93.81], [20.4, 7.01, -94.85],
      [20.4, 7.61, -95.9], [20.4, 8.21, -96.94], [20.4, 8.8, -97.98], [20.4, 9.4, -99.02], [20.4, 10, -100.06], [20.4, 10.6, -101.11],
      [20.38, 10.96, -102.24], [20.15, 10.92, -103.41], [19.73, 10.43, -104.41], [19.31, 9.6, -105.08], [19.01, 8.32, -105.46], [18.76, 7.28, -105.73],
      [18.32, 6.25, -106.13], [17.67, 5.35, -106.58], [16.82, 4.62, -107], [15.79, 4.09, -107.3], [14.64, 3.78, -107.4], [13.44, 3.7, -107.4],
      [12.25, 3.82, -107.4], [11.06, 3.97, -107.4], [9.87, 4.12, -107.4], [8.67, 4.27, -107.4], [7.48, 4.42, -107.4], [6.29, 4.57, -107.4],
      [5.11, 4.72, -107.3], [4, 4.88, -106.89], [3.04, 5.03, -106.17], [2.33, 5.18, -105.23], [1.91, 5.33, -104.12], [1.81, 5.48, -102.94],
      [2.06, 5.63, -101.78], [2.61, 5.78, -100.73], [3.44, 5.93, -99.88], [4.47, 6.08, -99.3], [5.63, 6.23, -99.02], [6.82, 6.38, -99.02],
      [8.01, 6.54, -99.05], [9.2, 6.69, -99.08], [10.39, 6.84, -99.11], [11.58, 6.99, -99.14], [12.77, 7.14, -99.17], [13.96, 7.29, -99.18],
      [15.13, 7.4, -98.98], [16.19, 7.29, -98.44], [17.05, 7.02, -97.65], [17.66, 6.74, -96.65], [17.96, 6.46, -95.53], [17.95, 6.17, -94.37],
      [17.62, 5.89, -93.25], [16.99, 5.62, -92.27], [16.13, 5.33, -91.5], [15.07, 5.05, -91], [13.93, 4.78, -90.8], [12.77, 4.49, -90.92],
      [11.7, 4.21, -91.37], [10.78, 3.93, -92.08], [10.1, 3.65, -93.03], [9.7, 3.37, -94.12], [9.61, 3.09, -95.28], [9.7, 2.81, -96.44],
      [9.79, 2.53, -97.61], [9.87, 2.25, -98.77], [9.96, 1.97, -99.94], [10.05, 1.69, -101.1], [10.14, 1.42, -102.27], [10.18, 1.26, -103.45],
      [9.94, 1.24, -104.62], [9.38, 1.23, -105.68], [8.54, 1.22, -106.53], [7.49, 1.21, -107.11], [6.33, 1.2, -107.38], [5.13, 1.19, -107.3],
      [4.01, 1.18, -106.89], [3.04, 1.17, -106.18], [2.33, 1.15, -105.22], [1.9, 1.14, -104.11], [1.79, 1.13, -102.92], [1.79, 1.12, -101.72],
      [1.79, 1.11, -100.51], [1.79, 1.1, -99.31], [1.79, 1.09, -98.11], [1.79, 1.07, -96.91], [1.79, 1.06, -95.71], [1.79, 1.05, -94.51],
      [1.79, 1.04, -93.31], [1.79, 1.03, -92.11], [1.79, 1.02, -90.91], [1.79, 1.01, -89.71], [1.79, 1, -88.51], [1.79, 1, -87.31],
      [1.79, 1, -86.11], [1.79, 1, -84.91], [2.23, 1, -83.82]
    ],
    tree: [
      [3.3, 1, -83.35], [4.5, 1, -83.35], [5.71, 1, -83.35], [6.91, 1, -83.35], [8.12, 1, -83.35], [9.32, 1, -83.35],
      [10.53, 1, -83.35], [11.73, 1, -83.35], [12.94, 1, -83.35], [14.14, 1, -83.35], [15.34, 1, -83.4], [16.52, 1, -83.68],
      [17.6, 1.06, -84.19], [18.54, 1.29, -84.9], [19.29, 1.7, -85.74], [19.84, 2.25, -86.66], [20.2, 2.82, -87.66], [20.38, 3.39, -88.7],
      [20.4, 3.96, -89.76], [20.4, 4.53, -90.82], [20.4, 5.1, -91.89], [20.4, 5.67, -92.95], [20.4, 6.24, -94.01], [20.4, 6.81, -95.07],
      [20.4, 7.38, -96.13], [20.4, 7.95, -97.19], [20.4, 8.52, -98.25], [20.4, 9.09, -99.31], [20.4, 9.66, -100.37], [20.4, 10.23, -101.44],
      [20.34, 10.78, -102.51], [20.07, 11, -103.65], [19.56, 10.78, -104.71], [18.97, 10.14, -105.5], [18.52, 9.24, -105.95], [18.23, 7.72, -106.2],
      [17.97, 6.8, -106.39], [17.46, 5.75, -106.7], [16.75, 4.85, -107.03], [15.83, 4.12, -107.29], [14.76, 3.58, -107.4], [13.6, 3.28, -107.4],
      [12.4, 3.2, -107.4], [11.2, 3.35, -107.4], [10.04, 3.65, -107.4], [8.87, 3.97, -107.4], [7.71, 4.28, -107.4], [6.55, 4.6, -107.4],
      [5.39, 4.92, -107.39], [4.25, 5.23, -107.17], [3.25, 5.55, -106.6], [2.48, 5.87, -105.74], [2.01, 6.18, -104.68], [1.9, 6.5, -103.53],
      [1.9, 6.81, -102.36], [1.9, 7.13, -101.2], [1.9, 7.38, -100.02], [1.9, 7.35, -98.82], [1.9, 7.08, -97.65], [1.9, 6.79, -96.48],
      [1.9, 6.49, -95.31], [2.09, 6.2, -94.16], [2.63, 5.91, -93.13], [3.47, 5.61, -92.33], [4.53, 5.32, -91.84], [5.69, 5.06, -91.7],
      [6.89, 5, -91.7], [8.1, 5, -91.7], [9.3, 5, -91.7], [10.5, 5, -91.73], [11.65, 4.88, -92.06], [12.64, 4.66, -92.7],
      [13.4, 4.43, -93.6], [13.86, 4.21, -94.69], [14, 3.99, -95.86], [13.77, 3.76, -97.01], [13.22, 3.54, -98.06], [12.4, 3.31, -98.9],
      [11.36, 3.09, -99.45], [10.2, 2.87, -99.69], [9.03, 2.64, -99.57], [7.94, 2.42, -99.12], [7.03, 2.19, -98.38], [6.38, 1.97, -97.39],
      [6.04, 1.75, -96.26], [6, 1.52, -95.08], [6, 1.4, -93.88], [6, 1.37, -92.68], [6, 1.33, -91.47], [5.98, 1.29, -90.27],
      [5.62, 1.25, -89.13], [4.85, 1.22, -88.22], [3.79, 1.18, -87.67], [2.77, 1.14, -87.05], [2.07, 1.1, -86.08], [1.8, 1.06, -84.91],
      [2.23, 1.02, -83.82]
    ]
  };
  // the ride's circuit, from its layout, into world space
  function pkIndoorPts(cfg) {
    var s = cfg.portal === 'w' ? 1 : -1, AX = s > 0 ? cfg.box[0] : cfg.box[1];
    return PK_INDOOR_LAYOUT[cfg.centre].map(function (q) { return [AX + s * q[0], q[1], q[2]]; });
  }
  // the shell: four walls with the portal cut in, a gable roof, a show facade (name board, marquee lights, the ride's emblem
  // and blind arches), a portico over the queue, a paved apron and the run of interior floor
  function pkIndoorShell(g, cfg) {
    var b = cfg.box, X0 = b[0], X1 = b[1], Z0 = b[2], Z1 = b[3], CX = (X0 + X1) / 2, CZ = (Z0 + Z1) / 2;
    var H = PK_HALL_H, PW = 5.8, PH = 4.0, i, x;
    var s = cfg.portal === 'w' ? 1 : -1, AX = s > 0 ? X0 : X1;
    var wall = std({ color: cfg.wall, roughness: 0.85, metalness: 0.04 });
    var band = std({ color: cfg.band, roughness: 0.5, metalness: 0.3 });
    var trim = std({ color: cfg.trim, roughness: 0.7, metalness: 0.15 });
    var glow = std({ color: cfg.band, emissive: cfg.band, emissiveIntensity: 0.6, roughness: 0.4 });
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
    // the inside of the shell: a timber wainscot, pilasters, cross beams and a ceiling. The outside has order; without this
    // the inside is four flat planes and a dark gable overhead.
    box(X1 - X0 - 0.6, 1.35, 0.05, trim, CX, 0.68, Z0 + 0.33, g);
    box(0.05, 1.35, Z1 - Z0 - 0.6, trim, X0 + 0.33, 0.68, CZ, g);
    box(0.05, 1.35, Z1 - Z0 - 0.6, trim, X1 - 0.33, 0.68, CZ, g);
    for (i = 0; i < 5; i++) {
      x = X0 + 2.4 + (X1 - X0 - 4.8) * i / 4;
      box(0.24, 11.0, 0.1, trim, x, 5.5, Z0 + 0.34, g);
    }
    for (i = 0; i < 7; i++) {
      var zi = Z0 + 2.6 + (Z1 - Z0 - 5.2) * i / 6;
      box(0.1, 11.0, 0.24, trim, X0 + 0.34, 5.5, zi, g);
      box(0.1, 11.0, 0.24, trim, X1 - 0.34, 5.5, zi, g);
    }
    for (i = 0; i < 8; i++) {
      box(X1 - X0 - 0.8, 0.26, 0.3, trim, CX, PK_HALL_CEIL - 0.3, Z0 + 3 + (Z1 - Z0 - 6) * i / 7, g);
    }
    var hallCeil = box(X1 - X0 - 0.6, 0.1, Z1 - Z0 - 0.6, std({ color: cfg.roof, roughness: 0.9 }), CX, PK_HALL_CEIL, CZ, g);
    hallCeil.castShadow = false;
    // band courses (the lower one carries the marquee bulbs) and pilasters
    box(X1 - X0 + 0.4, 0.5, 0.16, band, CX, 6.6, Z1 + 0.36, g);
    box(X1 - X0 + 0.4, 0.5, 0.16, band, CX, 6.6, Z0 - 0.36, g);
    box(X1 - X0 + 0.6, 0.6, 0.3, trim, CX, H - 0.3, Z1 + 0.42, g);
    box(X1 - X0 + 0.6, 0.6, 0.3, trim, CX, H - 0.3, Z0 - 0.42, g);
    for (i = 0; i <= 4; i++) {
      x = X0 + 2.0 + (X1 - X0 - 4.0) * i / 4;
      box(0.5, H, 0.5, trim, x, H / 2, Z1 + 0.42, g);
      box(0.5, H, 0.5, trim, x, H / 2, Z0 - 0.42, g);
    }
    for (i = 0; i <= 6; i++) {                                                    // the long sides get pilasters too
      var zp = Z0 + 2.0 + (Z1 - Z0 - 4.0) * i / 6;
      box(0.5, H, 0.5, trim, X0 - 0.42, H / 2, zp, g);
      box(0.5, H, 0.5, trim, X1 + 0.42, H / 2, zp, g);
    }
    box(0.16, 0.5, Z1 - Z0 + 0.4, band, X0 - 0.36, 6.6, CZ, g);
    box(0.16, 0.5, Z1 - Z0 + 0.4, band, X1 + 0.36, 6.6, CZ, g);
    // the show front: blind arches between the pilasters, the name board across the top, the emblem over the portal side
    // and a line of marquee bulbs along the band course
    for (i = 0; i < 4; i++) {
      x = X0 + 2.0 + (X1 - X0 - 4.0) * (i + 0.5) / 4;
      box(3.2, 4.2, 0.1, std({ color: new THREE.Color(cfg.wall).multiplyScalar(0.6), roughness: 0.9 }), x, 9.6, Z1 + 0.33, g);
      box(3.5, 0.18, 0.18, band, x, 11.8, Z1 + 0.38, g);
    }
    var boardX = CX + s * 2.2;
    box(13.6, 2.3, 0.3, std({ color: 0x151a20, roughness: 0.6 }), boardX, 10.0, Z1 + 0.48, g);
    box(14.0, 0.14, 0.34, band, boardX, 11.2, Z1 + 0.5, g);
    box(14.0, 0.14, 0.34, band, boardX, 8.8, Z1 + 0.5, g);
    pkSign3D([cfg.name.toUpperCase()], 12.6, 1.5, boardX, 10.0, Z1 + 0.66, 0, { bg: '#151a20', fg: cfg.sign }, g);
    var emX = AX + s * 3.5;
    var disc = pkRoundCyl(2.0, 0.3, band, emX, 10.0, Z1 + 0.5, g, 28); disc.rotation.x = Math.PI / 2;
    var inner = pkRoundCyl(1.62, 0.34, std({ color: 0x151a20, roughness: 0.6 }), emX, 10.0, Z1 + 0.52, g, 28); inner.rotation.x = Math.PI / 2;
    pkIndoorEmblem(g, cfg, emX, 10.0, Z1 + 0.72, glow);
    for (i = 0; i < 26; i++) sphere(0.1, MAT.bulb, X0 + 0.8 + (X1 - X0 - 1.6) * i / 25, 6.95, Z1 + 0.46, g);
    // the portal: jambs, lintel, the marquee, the portico
    box(0.5, PH + 0.6, 0.55, trim, P0 + s * 0.25, (PH + 0.6) / 2, Z1 + 0.3, g);
    box(0.5, PH + 0.6, 0.55, trim, P1 - s * 0.25, (PH + 0.6) / 2, Z1 + 0.3, g);
    box(PW + 1.5, 0.62, 0.6, band, (pLo + pHi) / 2, PH + 0.45, Z1 + 0.3, g);
    pkSign3D([cfg.name.toUpperCase()], Math.min(6.8, PW + 1.8), 0.46, (pLo + pHi) / 2, PH + 1.3, Z1 + 0.46, 0, { bg: '#151a20', fg: cfg.sign }, g);
    for (i = 0; i < 9; i++) sphere(0.09, MAT.bulb, pLo - 0.4 + (PW + 0.8) * i / 8, PH + 0.86, Z1 + 0.62, g);
    box(PW + 3.4, 0.22, 3.5, pkMats().roof, (pLo + pHi) / 2, 4.78, Z1 + 1.75, g);
    box(PW + 3.4, 0.5, 0.16, band, (pLo + pHi) / 2, 4.62, Z1 + 3.42, g);
    [pLo - 0.5, pHi + 0.5].forEach(function (px) {
      box(0.34, 4.7, 0.34, trim, px, 2.35, Z1 + 1.1, g);
      solid(px - 0.24, px + 0.24, Z1 + 0.86, Z1 + 1.34, 0, 4.7);
    });
    // roof
    pkGableRoof(X1 - X0 + 1.2, Z1 - Z0 + 1.6, 3.4, std({ color: cfg.roof, roughness: 0.8 }), trim, CX, H, CZ, g, 0.45);
    box(X1 - X0 - 3, 0.8, 1.4, std({ color: cfg.roof, roughness: 0.8 }), CX, H + 3.4, CZ, g);
    // the fairy-tale silhouette, after the Efteling halls: a stepped Dutch gable rising over the front with a lit round window,
    // and a round tower with a pointed roof at each front corner
    var steps = [12.0, 9.6, 7.2, 4.8, 2.4];
    steps.forEach(function (w, k) {
      box(w, 1.25, 0.7, wall, CX, H + 0.62 + k * 1.25, Z1 + 0.05, g);
      box(w + 0.3, 0.16, 0.86, trim, CX, H + 1.25 + k * 1.25, Z1 + 0.05, g);
    });
    sphere(0.22, pkMats().gold, CX, H + steps.length * 1.25 + 0.4, Z1 + 0.05, g);
    var ocu = pkRoundCyl(1.1, 0.2, glow, CX, H + 2.5, Z1 + 0.45, g, 24); ocu.rotation.x = Math.PI / 2;
    var ocuRim = pkRoundCyl(1.32, 0.16, trim, CX, H + 2.5, Z1 + 0.4, g, 24); ocuRim.rotation.x = Math.PI / 2;
    var coneMat = std({ color: new THREE.Color(cfg.roof).lerp(new THREE.Color(cfg.band), 0.35), roughness: 0.6, metalness: 0.2 });
    // the far corner stands a full tower on the ground; the portal corner, where the portico is, carries an oriel turret
    // corbelled out from 7 m up, so the queue passes under it
    var farX = s > 0 ? X1 : X0;
    [[farX, 0, 1.5], [AX, 7.4, 1.2]].forEach(function (T) {
      var tx = T[0], y0 = T[1], r = T[2], top = H + 3.0;
      pkRoundCyl(r, top - y0, wall, tx, (top + y0) / 2, Z1, g, 16);
      if (y0 > 0) {
        var corbel = new THREE.Mesh(new THREE.ConeGeometry(r, 1.8, 16, 1), trim);
        corbel.rotation.x = Math.PI; corbel.position.set(tx, y0 - 0.9, Z1); corbel.castShadow = true; g.add(corbel);
      } else {
        solid(tx - r, tx + r, Z1 - r, Z1 + r, 0, top);
        pkRoundCyl(r + 0.12, 0.3, band, tx, 6.6, Z1, g, 16);
      }
      pkRoundCyl(r + 0.2, 0.4, trim, tx, top, Z1, g, 16);
      for (var w2 = 0; w2 < 2; w2++) box(0.46, 1.3, 0.12, glow, tx, 9.4 + w2 * 3.4, Z1 + r - 0.02, g);
      var cone = new THREE.Mesh(new THREE.ConeGeometry(r + 0.45, 4.0 + r, 16, 1), coneMat);
      cone.position.set(tx, top + 0.2 + (4.0 + r) / 2, Z1); cone.castShadow = true; g.add(cone);
      pkRoundCyl(0.05, 1.0, pkMats().gold, tx, top + 4.7 + r, Z1, g, 6);
      sphere(0.16, pkMats().gold, tx, top + 5.25 + r, Z1, g);
    });
    pkIndoorTheme(g, cfg, X0, X1, Z0, Z1, glow);
  }
  // the ride's emblem in the disc on the front: a crescent moon, a ship's wheel, a tree
  function pkIndoorEmblem(g, cfg, x, y, z, glow) {
    var i, a;
    if (cfg.centre === 'moon') {
      var m = pkRoundCyl(1.2, 0.12, std({ color: 0xe8ecff, emissive: 0xc8d0ff, emissiveIntensity: 0.4, roughness: 0.5 }), x - 0.25, y, z, g, 24); m.rotation.x = Math.PI / 2;
      var cut = pkRoundCyl(1.05, 0.14, std({ color: 0x151a20, roughness: 0.6 }), x + 0.3, y + 0.25, z + 0.03, g, 24); cut.rotation.x = Math.PI / 2;
      for (i = 0; i < 5; i++) { a = i / 5 * Math.PI * 2 + 0.3; sphere(0.08, MAT.bulb, x + Math.cos(a) * 1.3, y + Math.sin(a) * 1.3, z + 0.05, g); }
    } else if (cfg.centre === 'ship') {
      var hub = pkRoundCyl(0.3, 0.16, glow, x, y, z, g, 14); hub.rotation.x = Math.PI / 2;
      for (i = 0; i < 8; i++) {
        a = i / 8 * Math.PI * 2;
        pkRod(x, y, z, x + Math.cos(a) * 1.4, y + Math.sin(a) * 1.4, z, 0.06, glow, g, 6);
        sphere(0.13, glow, x + Math.cos(a) * 1.5, y + Math.sin(a) * 1.5, z, g);
      }
      for (i = 0; i < 24; i++) { a = i / 24 * Math.PI * 2; sphere(0.07, glow, x + Math.cos(a) * 1.05, y + Math.sin(a) * 1.05, z, g); }
    } else {
      box(0.28, 1.4, 0.12, std({ color: 0x8a6a4a, roughness: 0.8 }), x, y - 0.6, z, g);
      [[0, 0.5, 0.7], [-0.55, 0.15, 0.5], [0.55, 0.15, 0.5], [-0.3, 0.85, 0.45], [0.3, 0.85, 0.45]].forEach(function (c) { sphere(c[2], glow, x + c[0], y + c[1], z, g); });
    }
  }
  // the hall's own sky: Nocturne has a starfield on its ceiling, The Wreck a sea floor and lanterns, Moonwood fireflies and
  // undergrowth. Everything here keeps to the ceiling, the walls or the middle of the centrepiece, clear of the track.
  function pkIndoorTheme(g, cfg, X0, X1, Z0, Z1, glow) {
    var rng = pkRng(cfg.centre === 'moon' ? 501 : cfg.centre === 'ship' ? 502 : 503), i;
    var s = cfg.portal === 'w' ? 1 : -1, AX = s > 0 ? X0 : X1, cx = AX + s * cfg.at[0], cz = cfg.at[1];
    if (cfg.centre === 'moon') {
      var star = std({ color: 0xf4f6ff, emissive: 0xdfe6ff, emissiveIntensity: 1.0, roughness: 0.4 });
      for (i = 0; i < 70; i++) sphere(0.05 + rng() * 0.07, star, X0 + 1 + rng() * (X1 - X0 - 2), PK_HALL_CEIL - 0.08, Z0 + 1 + rng() * (Z1 - Z0 - 3), g);
    } else if (cfg.centre === 'ship') {
      // the sea floor round the wreck, inside its loop of track
      var sea = pkRoundCyl(3.0, 0.04, std({ color: 0x1f4f5a, emissive: 0x0f3a46, emissiveIntensity: 0.35, roughness: 0.3 }), cx, 0.08, cz, g, 28);
      sea.receiveShadow = true;
      var lamp = std({ color: 0xffd28a, emissive: 0xffb84a, emissiveIntensity: 0.8, roughness: 0.5 });
      for (i = 0; i < 6; i++) {
        var lz = Z0 + 3 + (Z1 - Z0 - 8) * i / 5;
        [X0 + 0.55, X1 - 0.55].forEach(function (lx) { pkRoundCyl(0.16, 0.34, lamp, lx, 4.2, lz, g, 10); box(0.06, 0.5, 0.06, MAT.steelDark, lx, 4.6, lz, g); });
      }
    } else {
      var fly = std({ color: 0xe8ffb0, emissive: 0xcfff70, emissiveIntensity: 1.0, roughness: 0.4 });
      for (i = 0; i < 40; i++) sphere(0.05, fly, X0 + 1 + rng() * (X1 - X0 - 2), 11.6 + rng() * 1.6, Z0 + 1 + rng() * (Z1 - Z0 - 6), g);
      var leaf = [0x2f4a2a, 0x3a5a33, 0x2a4226];
      for (i = 0; i < 7; i++) { var a = i / 7 * Math.PI * 2; sphere(0.55 + rng() * 0.3, std({ color: leaf[i % 3], roughness: 0.95 }), cx + Math.cos(a) * 2.2, 0.35, cz + Math.sin(a) * 2.2, g); }
    }
  }
  // the piece the circuit winds round, at the centre of its helix, loop or ring
  function pkIndoorCentre(g, cfg, CX, CZ) {
    var i, a;
    if (cfg.centre === 'moon') {
      // inside the helix (the rail runs at 4 m round it, from 8 m down): a column with a lit collar and the moon on top
      pkRoundCyl(1.7, 8.2, std({ color: 0x232637, roughness: 0.9 }), CX, 4.1, CZ, g, 20);
      pkRoundCyl(2.0, 0.4, std({ color: 0x2f3350, roughness: 0.8 }), CX, 8.4, CZ, g, 20);
      sphere(2.3, std({ color: 0xe8ecff, emissive: 0x9aa4d8, emissiveIntensity: 0.25, roughness: 0.5 }), CX, 10.9, CZ, g);
      for (i = 0; i < 16; i++) {
        a = i / 16 * Math.PI * 2;
        sphere(0.09 + (i % 3) * 0.04, MAT.bulb, CX + Math.cos(a) * 1.85, 8.65 + (i % 4) * 0.1, CZ + Math.sin(a) * 1.85, g);
      }
      var moonLight = new THREE.PointLight(0xc8d4ff, 0.7, 14, 2); moonLight.position.set(CX, 7.5, CZ); g.add(moonLight);
    } else if (cfg.centre === 'ship') {
      // the wreck lies inside the figure-eight's wreck loop (radius 4.2), run aground, the train flying round it
      var hull = new THREE.Group(); hull.position.set(CX, 0, CZ); hull.rotation.set(0.06, Math.PI / 2 + 0.5, 0.26); hull.scale.setScalar(0.8); g.add(hull);
      pkBevelBox(3.0, 2.2, 7.0, std({ color: 0x6a4f33, roughness: 0.85 }), 0, 1.5, 0, hull, 0.12);
      pkBevelBox(2.7, 1.5, 6.4, std({ color: 0x543d27, roughness: 0.9 }), 0, 2.6, 0, hull, 0.08);
      pkRoundCyl(0.16, 6.4, std({ color: 0x4a341f, roughness: 0.85 }), 0, 5.2, -1.2, hull, 8);
      pkRoundCyl(0.14, 5.2, std({ color: 0x4a341f, roughness: 0.85 }), 0.4, 4.6, 1.6, hull, 8);
      box(3.4, 0.12, 1.1, std({ color: 0xc9c2b0, roughness: 0.8 }), 0, 4.4, -1.2, hull);
      box(2.6, 1.6, 0.05, std({ color: 0xc9c2b0, roughness: 0.85, side: THREE.DoubleSide }), 0, 6.2, -1.2, hull);
      sphere(0.25, std({ color: 0xffd28a, emissive: 0xffb84a, emissiveIntensity: 0.9 }), 0, 3.6, 3.1, hull);
      for (i = 0; i < 6; i++) {
        a = i / 6 * Math.PI * 2;
        box(0.5 + (i % 3) * 0.1, 0.4, 0.5, std({ color: [0x5a4a36, 0x6e5a40, 0x4e4030][i % 3], roughness: 0.9 }), CX + Math.cos(a) * 2.4, 0.2, CZ + Math.sin(a) * 1.6, g);
      }
    } else {
      // the trunk in the middle of the ring (radius 4); the crown spreads over the ring, its underside above the train
      pkRoundCyl(1.2, 9.4, std({ color: 0x4e3a26, roughness: 0.92 }), CX, 4.7, CZ, g, 14);
      for (i = 0; i < 4; i++) {
        a = i / 4 * Math.PI * 2 + 0.4;
        var root = pkRoundCyl(0.35, 2.2, std({ color: 0x4e3a26, roughness: 0.92 }), CX + Math.cos(a) * 1.4, 0.4, CZ + Math.sin(a) * 1.4, g, 8);
        root.rotation.set(Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1);
      }
      var greens = [0x3e5a3a, 0x476340, 0x35502f];
      for (i = 0; i < 9; i++) {
        a = i / 9 * Math.PI * 2;
        sphere(1.7 + (i % 2) * 0.25, std({ color: greens[i % 3], roughness: 0.95 }), CX + Math.cos(a) * 3.4, 9.6 + (i % 3) * 0.35, CZ + Math.sin(a) * 3.4, g);
      }
      for (i = 0; i < 4; i++) {
        a = i / 4 * Math.PI * 2 + 0.6;
        sphere(1.8, std({ color: greens[i % 3], roughness: 0.95 }), CX + Math.cos(a) * 1.3, 11.4, CZ + Math.sin(a) * 1.3, g);
      }
      // the hanging lamps under the crown: brass cords, a warm core
      var shade = std({ color: 0xfff3d6, emissive: 0xffdda0, emissiveIntensity: 0.55, roughness: 0.55 });
      for (i = 0; i < 5; i++) {
        a = i / 5 * Math.PI * 2 + 0.4;
        var lx = CX + Math.cos(a) * 2.2, lz = CZ + Math.sin(a) * 2.2;
        pkRoundCyl(0.032, 1.4, MAT.brass || MAT.gold, lx, 7.6, lz, g, 6);
        pkRoundCyl(0.19, 0.26, shade, lx, 6.85, lz, g, 10);
      }
    }
  }
  // the control cabin: a glazed room at the far end of the platform, the operator's back to the portal wall. A long window
  // over the track, a side window and the door onto the platform, the desk under the long window and the status board on
  // the back wall. Laid out in the hall's own u, so it mirrors with the hall and its screen still reads the right way round.
  var PK_CABIN = { u0: 15.2, u1: 18.8, z0: -82.45, z1: -79.35, door: [-81.4, -80.45] };
  function pkIndoorCabin(g, cfg, a) {
    var s = cfg.portal === 'w' ? 1 : -1;
    return pkCabinBuild(g, a, { s: s, AX: s > 0 ? cfg.box[0] : cfg.box[1], K: PK_CABIN, trim: cfg.trim, band: cfg.band, name: cfg.name, sign: cfg.sign });
  }
  // the cabin itself, for a hall or a free-standing control house: o.K is the room in a frame where X(u) = AX + s*u is world
  // x and z is world z ({ u0, u1, z0, z1, door: [z, z] }); the long window is on the z0 side, the door in the u0 wall
  function pkCabinBuild(g, a, o) {
    var s = o.s, AX = o.AX, K = o.K, T = 0.12, H = o.H || 2.9;
    var cfg = { name: o.name, sign: o.sign };
    function X(u) { return AX + s * u; }
    var trim = std({ color: o.trim, roughness: 0.7, metalness: 0.15 });
    var band = std({ color: o.band, roughness: 0.5, metalness: 0.3 });
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
    a.boothDoor = pkBkDoor(g, xn - s * 0.03, 0.12, d1, Math.PI, s * 1.55, d1 - d0, 1.98, { leaf: trim, glass: glass, kick: std({ color: 0x20272c, roughness: 0.62 }) }, 'the cabin door');
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
    a.boothClock = pkBkTimeClock(k, -s * 1.2, 1.5, K.z1 - 0.08 - cz, Math.PI, a.id, a.name);
    pkBkKeyBox(k, s * 1.2, 2.05, K.z1 - 0.08 - cz, Math.PI);
    pkBkChair(k, 0.1, -0.35, Math.PI, 0);   // facing the desk under the long window
    var cabBatten = pkBkBatten(k, 0, H - 0.17, 0.2, 0, 1.4);
    a.boothLights = pkBkLights(a.id, k, [cabBatten], 0, H - 0.5, 0.2);
    a.boothLights.setPower(!!a.open);
    pkBkSwitch(k, (xn - cx) + s * 0.1, 1.2, (d1 - cz) + 0.25, s * Math.PI / 2, a.boothLights, a.name);
    pkBkStack(a, k, s * 1.3, H + 0.02, 0.9);
    pkBkCamera(k, -s * (W / 2 + 0.02), H - 0.3, K.z0 - cz + 0.3, s * Math.PI / 2 + Math.PI, 0.5);
    // the status board on the back wall, facing the operator
    var screen = touchScreen({
      w: 380, h: 320, pw: 0.94, ph: 0.80, x: cx, y: 1.62, z: K.z1 - 0.1, ry: Math.PI, parent: g, title: a.name,
      draw: function (ctx, sc) {
        var C = pkCtl(a), waiting = pkAttrWaiting(a);
        scBg(ctx, sc.w, sc.h);
        scHead(ctx, sc.w, a.name.toUpperCase(), pkBoothStatus(a, C));
        scText(ctx, 16, 62, 'ON RIDE', '#a0acb8');
        scText(ctx, 16, 88, a.riders + ' / ' + a.seats.length, a.riders ? '#5fd38d' : '#eef1f5');
        scText(ctx, 200, 62, 'QUEUE', '#a0acb8');
        scText(ctx, 200, 88, String(waiting), waiting ? '#f0c04a' : '#eef1f5');
        scText(ctx, 16, 122, 'GATES  ' + (C.gates ? 'OPEN' : 'CLOSED'), C.gates ? '#5fd38d' : '#a0acb8');
        scText(ctx, 16, 152, 'RESTRAINTS  ' + (C.barsWant > 0.5 ? 'DOWN' : 'UP'), C.barsWant > 0.5 ? '#5fd38d' : '#a0acb8');
        scText(ctx, 16, 182, 'AUTO  ' + (C.auto ? 'ON' : 'OFF'), C.auto ? '#5fd38d' : '#a0acb8');
        scText(ctx, 16, 212, 'CYCLE  ' + a.run.toFixed(1) + 's', '#eef1f5');
        scText(ctx, 16, 242, 'CONTROL ROOM  ' + (C.fault ? 'RESET' : (C.maint ? 'MAINT' : 'READY')), C.fault || C.maint ? '#ff6b5e' : '#8f98a4');
        scText(ctx, 16, 272, 'WAIT  ' + pkBkWait(a) + ' MIN', '#eef1f5');
      }
    });
    pkPowerScreen(screen, function () { return !!a.open; });
    var anchor = new THREE.Group(); anchor.position.set(cx, 0, cz); g.add(anchor);
    a.booth = anchor;
    a.boothScreen = screen;
  }
  // a whole indoor coaster: shell, centrepiece, track, station, cabin
  function pkBuildIndoor(p) {
    var cfg = PK_INDOOR[p.id], th = PK_THEME[p.id], i;
    var b = cfg.box, CZ = (b[2] + b[3]) / 2, zS = -83.35, RIDE = { rollIn: 12 };   // the platform straight; a slow roll in round the tight turn
    var s = cfg.portal === 'w' ? 1 : -1, AX = s > 0 ? b[0] : b[1];
    var g = new THREE.Group(); scene.add(g);
    pkIndoorShell(g, cfg);
    pkIndoorCentre(g, cfg, AX + s * cfg.at[0], cfg.at[1]);
    var curve = pkCoCurve(pkIndoorPts(cfg)), len = curve.getLength(), uP = pkCoUAt(curve, AX + s * 12.0, zS);
    var F = pkCoFrames(curve, 560, pkCoProfile(curve, len, uP, RIDE), uP);
    var E = { curve: curve, len: len, F: F, gap: 2.4, cars: [], uPark: uP, uOfF: [], run: 30 };
    pkCoLevel(F, curve, E.uPark, 3 * 2.4 + 1.4, 1.4);
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
    pkCoPlan(E, RIDE);
    // the station inside: kerbed platform, the boom gates at the car doors, hanging lamps
    pkCoPlatform(g, Math.min(AX + s * 0.6, AX + s * 14.8), Math.max(AX + s * 0.6, AX + s * 14.8), -82.8, -80.2, th, 1.0);
    var stationShade = std({ color: 0xfff3d6, emissive: 0xffdda0, emissiveIntensity: 0.5, roughness: 0.55 });
    [AX + s * 3, AX + s * 8, AX + s * 13].forEach(function (lx) {
      pkRoundCyl(0.045, PK_HALL_CEIL - 5.9, MAT.gold, lx, (PK_HALL_CEIL + 5.9) / 2, -81.5, g, 6);
      pkRoundCyl(0.34, 0.24, stationShade, lx, 5.75, -81.5, g, 12);
    });
    // the station and the hall are lit, so the train and the platform are not silhouettes
    [3.5, 8.5, 13.5].forEach(function (lx) {
      var pl = new THREE.PointLight(0xffe3b0, 0.9, 12, 2);
      pl.position.set(AX + s * lx, 3.0, -81.5); g.add(pl);
    });
    var hallLight = new THREE.PointLight(0xfff0d0, 0.85, 30, 2);
    hallLight.position.set(AX + s * 12, 9.5, CZ - 1.5); g.add(hallLight);
    var a = pkAttr({
      id: p.id, name: cfg.name, x: p.x, z: p.z,
      qx: p.q[0], qz: p.q[1], qdx: s, g: g, seats: seats,
      board: 11, run: E.run, unload: 6, exit: [AX + s * 1.3, -81.6],
      extra: E, tickRun: function (at) { pkCoRun(at); }
    });
    var C = pkCtl(a);
    E.a = a;
    pkCoGates(g, [AX + s * 12.0, AX + s * 9.6, AX + s * 7.2, AX + s * 4.8], -82.85, C, 1.0);
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
    // a straight station along the platform, round the west end, a wiggle and a little hill along the north side, round the
    // east end home: longer than the old oval, and clear of Wobbly Pots' booth and its own
    var pts = [
      [-54.8, 0.4, 43.6], [-57, 0.4, 43.6], [-59.2, 0.4, 43.6], [-61.4, 0.4, 43.6], [-63.6, 0.4, 43.6], [-65.8, 0.4, 43.6],
      [-67.9, 0.4, 43], [-69.3, 0.42, 41.4], [-69.2, 0.5, 39.8], [-67.6, 0.62, 38.9], [-65, 0.85, 38.6], [-62.4, 1, 39.3],
      [-59.8, 0.85, 39], [-57.4, 0.6, 38.9], [-55.2, 0.45, 39.1], [-53.5, 0.4, 40.4], [-53.2, 0.4, 42.2]
    ];
    var curve = pkCoCurve(pts), len = curve.getLength(), uP = pkCoUAt(curve, -61.2, 43.6);
    var F = pkCoFrames(curve, 300, pkCoProfile(curve, len, uP, { pedal: 1.8 }), uP);
    var E = { curve: curve, len: len, F: F, gap: 2.2, cars: [], uPark: uP, uOfF: [], run: 34 };
    pkCoLevel(F, curve, E.uPark, 2.2 + 1.2, 1.2);
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
    pkCoPlan(E, { pedal: 1.8 });                // a kiddie train: a steady 6.5 km/h
    for (s = 0.9; s < len; s += 1.7) {
      var q = curve.getPointAt(s / len);
      pkRoundCyl(0.055, q.y, std({ color: 0x4a443c, roughness: 0.8 }), q.x, q.y / 2, q.z, g, 6);
    }
    pkCoPlatform(g, -63.5, -56.5, 43.9, 45.3, th, 0.4);
    // a row of planted rocks down the middle of the loop, clear of the track all round
    [-66.0, -63.5, -61.0, -58.5, -56.2].forEach(function (rx) {
      pkRoundCyl(0.34, 0.42, std({ color: 0x7a6a52, roughness: 0.85 }), rx, 0.21, 41.2, g, 12);
      sphere(0.3, std({ color: 0x4d7a3a, roughness: 0.95 }), rx, 0.5, 41.2, g);
    });
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
