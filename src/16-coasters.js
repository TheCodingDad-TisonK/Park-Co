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
      pkBevelBox(0.5, 0.09, 0.6, pkMats().seat, sx, 0.66, -0.06, g, 0.03);
      pkBevelBox(0.5, 0.56, 0.11, pkMats().seat, sx, 0.97, -0.4, g, 0.03);
      pkBevelBox(0.34, 0.22, 0.1, body, sx, 1.3, -0.42, g, 0.03);
    });
    // lap bar: a padded U on a pivot behind the seats
    var bar = new THREE.Group(); bar.position.set(0, 0.76, -0.55); g.add(bar);
    pkRoundCyl(0.045, 0.94, MAT.steelDark, 0, 0.28, 0.62, bar, 8).rotation.z = Math.PI / 2;
    pkRoundCyl(0.075, 0.7, MAT.rubberMat, 0, 0.28, 0.62, bar, 8).rotation.z = Math.PI / 2;
    [-0.42, 0.42].forEach(function (sx) {
      pkRod(sx, 0, 0, sx, 0.28, 0.62, 0.04, MAT.steelDark, bar, 6);
    });
    pkMergeShell(g, [bar]);   // the car's shell in one draw per material: the lap bar stays a part of its own
    return { g: g, bar: bar, seats: [{ x: -0.31, y: -0.06, z: -0.02 }, { x: 0.31, y: -0.06, z: -0.02 }] };
  }  // ── Placing the train ─────────────────────────────────────────────
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
    box(x1 - x0, 0.1, depth, MAT.roof, mid, 3.06 + lift, zSouth - depth / 2, g);
    box(x1 - x0, 0.06, depth - 0.3, std({ color: th.a, roughness: 0.6 }), mid, 3.12 + lift, zSouth - depth / 2, g);
    box(x1 - x0, 0.34, 0.1, MAT.steelDark, mid, 3.02 + lift, zSouth + 0.02, g);
    pkSign3D([label], Math.min(4.8, x1 - x0 - 1.2), 0.28, mid, 3.02 + lift, zSouth + 0.08, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);
    [-1, 1].forEach(function (sx) {
      pkRoundCyl(0.16, 0.22, pkMats().bulb, mid + sx * (x1 - x0) / 4, 2.86 + lift, zSouth - 0.6, g, 10);
    });
  }
  // a coaster platform: kerb, deck, edge stripe, a plant tub and a lamp at each end
  function pkCoPlatform(g, x0, x1, zN, zS, th, y, ends) {   // ends: [west, east] which ends get a planter and a lamp (both by default)
    var surf = y === undefined ? 0.18 : y, lift = surf - 0.18;
    if (lift > 0.02) box(x1 - x0, lift, zS - zN, pkMats().kerb, (x0 + x1) / 2, lift / 2, (zN + zS) / 2, g);
    box(x1 - x0, 0.12, zS - zN, pkMats().kerb, (x0 + x1) / 2, 0.06 + lift, (zN + zS) / 2, g);
    box(x1 - x0 - 0.12, 0.07, zS - zN - 0.12, pkMats().pavers, (x0 + x1) / 2, 0.145 + lift, (zN + zS) / 2, g);
    box(x1 - x0, 0.03, 0.16, MAT.hazard, (x0 + x1) / 2, 0.17 + lift, zN + 0.08, g);
    [x0 + 0.5, x1 - 0.5].forEach(function (x, ei) {
      if (ends && !ends[ei]) return;
      pkRoundCyl(0.26, 0.5, pkMats().stone, x, 0.25 + lift, zS - 0.4, g, 12);
      pkRoundCyl(0.3, 0.08, pkMats().stone, x, 0.52 + lift, zS - 0.4, g, 12);
      pkRoundCyl(0.04, 2.5, MAT.steelDark, x, 1.25 + lift, zS - 0.34, g, 8);
      pkRoundCyl(0.17, 0.24, pkMats().bulb, x, 2.6 + lift, zS - 0.34, g, 10);
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
  // ── Baron's Drop ─────────────────────────────────────────────────
  // The remodel: the vertical loop is gone. The Baron is a double-dive now. Out of the station the near-vertical lift
  // takes the car to 21 m, the top turn lines it up, and the first drop falls straight into the tunnel mouth in the
  // rockery. Out of the tunnel it climbs the south-east corner and drops a second time, shallower but steeper, into a
  // splash basin beside the fence; then the long banked run home past the gatehouse.
  var PK_BARON_PTS = [
    [48.4, 0.95, 15.5], [50.8, 0.95, 15.5], [53.2, 0.95, 15.5], [55.6, 0.95, 15.5], [58, 0.95, 15.5], [60.4, 0.95, 15.5],
    [62.8, 0.95, 15.5], [64.6, 2, 16], [65.4, 6, 16.6], [65.8, 11.5, 17.3], [65.6, 16.5, 18.3], [64.4, 20.6, 19.6],
    [61.6, 21.2, 20.8], [60.2, 21.2, 21.1], [57.9, 21.1, 21.9], [56.2, 20.7, 22.5], [56, 19, 22.55], [55.95, 12, 22.55],
    [55.9, 4, 22.55], [55.9, 1.6, 22.5], [56.4, 1.15, 22.1], [57.6, 1.6, 20.8], [59.4, 2.2, 20.2], [61.8, 2.6, 20.6],
    [64.2, 3.4, 21.4], [65.6, 4.6, 22.6],                                   // out of the tunnel, into the climb
    [67.0, 6.4, 24.2], [67.9, 8.6, 26.0], [68.1, 10.4, 27.6],               // the second climb
    [67.6, 6.0, 29.4], [66.4, 2.2, 30.2],                                   // the second, steeper drop
    [64.0, 1.6, 30.2], [61.0, 1.4, 30.0],                                   // the splash run
    [58.0, 4.2, 29.8], [55.0, 6.6, 29.6], [52.0, 4.0, 29.4],                // the banked camelback
    [49.0, 2.2, 28.6], [47.0, 1.4, 27.0], [46.4, 1.05, 24.6],               // the west turn
    [46.4, 0.95, 21.8], [46.5, 0.95, 19.0], [46.8, 0.95, 16.8], [47.4, 0.95, 16]
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
    // the splash basin under the second drop: a stone rim, the water, and rocks along the fence side
    var splash = { x: 62.4, z: 30.0, u: pkCoUAt(curve, 62.4, 30.0) };
    [[62.4, 28.4, 9.4, 0.5], [62.4, 31.6, 9.4, 0.5], [57.9, 30.0, 0.5, 3.2], [66.9, 30.0, 0.5, 3.2]].forEach(function (w) {
      box(w[2], 0.75, w[3], pkMatStone(), w[0], 0.37, w[1], g);
    });
    var bwater = new THREE.Mesh(new THREE.PlaneGeometry(8.8, 3.0), pkMats().water);
    bwater.rotation.x = -Math.PI / 2; bwater.position.set(splash.x, 0.5, splash.z); g.add(bwater);
    for (var sb = 0; sb < 7; sb++) pkBoulder(58.4 + sb * 1.25, 31.9 + randf(-0.2, 0.2), randf(0.6, 1.05), g);
    E.splash = splash;
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
      extra: E, tickRun: function (at) {
        pkCoRun(at);
        // a sheet of spray where the car crosses the basin: the second drop lands in it
        var X = at.extra, M = X.uOfF ? X.uOfF.length - 1 : 0;
        if (M < 1) return;
        var f = at.state === 'running' ? clamp(at.t / at.run, 0, 1) * M : 0;
        var k = Math.min(M - 1, Math.floor(f)), rr = f - k;
        var u = (X.u0 + X.uOfF[k] + (X.uOfF[k + 1] - X.uOfF[k]) * rr) % 1;
        if (X._pu !== undefined && X._pu < splash.u && u >= splash.u) burst(splash.x, 1.3, splash.z, 0xbfe6ff, 46, 'up');
        X._pu = u;
      }
    });
    var C = pkCtl(a);
    E.a = a;
    pkCoGates(g, [56.8, 54.4, 52.0, 49.6], 16.3, C, 0.95);
    pkCoCanopy(g, 48.7, 57.7, 18.5, 2.0, "BARON'S DROP", th, 0.95);
    E.cars.forEach(function (c) {
      C.barObjs.push(function (b) { c.bar.rotation.x = -1.35 * (1 - b); });
    });
    // ── The Baron's gatehouse ───────────────────────────────────────
    // The station was a canopy on a platform. It is a gatehouse now: a round stone tower at the west end with a cone roof,
    // a banner and a lantern, a run of battlemented wall behind the platform, braziers either side of the boarding edge,
    // and the Baron's crest over the canopy. All of it stands behind (south of) the platform, clear of the track and the line.
    var stone = pkMatStone(), darkStone = std({ color: 0x6a6258, roughness: 0.95 });
    var towerX = 47.3, towerZ = 19.4;
    pkRoundCyl(1.15, 6.4, stone, towerX, 3.2, towerZ, g, 18);
    pkRoundCyl(1.28, 0.35, darkStone, towerX, 6.5, towerZ, g, 18);
    for (var tw = 0; tw < 8; tw++) { var ta = tw / 8 * Math.PI * 2; box(0.42, 0.5, 0.42, stone, towerX + Math.cos(ta) * 1.05, 6.85, towerZ + Math.sin(ta) * 1.05, g); }
    var roof = new THREE.Mesh(new THREE.ConeGeometry(1.45, 3.4, 18), std({ color: 0x4a2a24, roughness: 0.7 })); roof.position.set(towerX, 8.8, towerZ); roof.castShadow = true; g.add(roof);
    pkRod(towerX, 10.5, towerZ, towerX, 11.6, towerZ, 0.05, MAT.iron, g, 6);
    pkSign3D(['BARON'], 1.3, 0.34, towerX + 0.02, 4.7, towerZ + 1.12, 0, { bg: th.a, fg: '#f4e2b0' }, g);
    var flag = box(0.06, 1.5, 2.2, pkStripes('#8a3b2c', '#d8c9a8'), towerX, 12.2, towerZ + 1.15, g); flag.rotation.y = 0.2;
    pkLamp(towerX + 1.5, towerZ + 1.4, 4.2);
    // the battlemented wall behind the platform, so the station reads as the Baron's court rather than a shed
    box(10.6, 1.9, 0.5, stone, 52.9, 0.95, 19.55, g);
    for (var cw = 0; cw < 9; cw++) box(0.55, 0.5, 0.55, stone, 47.9 + cw * 1.22, 2.15, 19.55, g);
    solid(47.6, 58.2, 19.3, 19.8, 0, 2.4);
    // the crest over the canopy: a shield on the boarding side, gilt rim
    pkSign3D(['\u25BC'], 1.05, 1.05, 53.2, 3.28, 18.44, Math.PI, { bg: th.a, fg: '#e3c26a' }, g);
    // braziers at each end of the platform edge, out of the walkway
    [[47.9, 20.2], [57.4, 20.2]].forEach(function (bp) {
      pkRoundCyl(0.07, 1.05, MAT.iron, bp[0], 0.52, bp[1], g, 6);
      var bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.2, 0.3, 12, 1, true), std({ color: 0x2a2622, roughness: 0.8, side: THREE.DoubleSide }));
      bowl.position.set(bp[0], 1.2, bp[1]); g.add(bowl);
      var flame = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 8), glowMat(0xff9a3c, 1.1));
      flame.position.set(bp[0], 1.55, bp[1]); g.add(flame);
      animate(function (dt) { flame.scale.y = 0.85 + Math.sin(worldTime * 7 + bp[0]) * 0.18; });
    });
    // a run of boulders along the back of the court, so it sits in the rockery it already had
    for (var br = 0; br < 7; br++) pkBoulder(48.4 + br * 1.5, 20.3 + randf(-0.3, 0.3), randf(0.8, 1.35), g);
    pkCoPlace(E, E.uPark);
    return a;
  }
  // ── The Wild Hunt ────────────────────────────────────────────────
  // The big one, in place of the three indoor halls: an out-and-back steel coaster that fills the north strip to the
  // fence. Out of the lodge it turns back on itself and takes the chain lift west, right behind the station, to 26 m; it
  // sweeps round the west end on the crest, dives the first drop along the north fence, floats a camelback, climbs into a
  // high turnaround at the east end, comes home through the middle over two airtime hills, ducks under its own crest in
  // a low west turn and brakes into the station. It stands in a pine wood, on braced twin columns, not on poles.
  var PK_HUNT_PTS = [
    [-6, 1.0, -84.5], [0, 1.0, -84.5], [6, 1.0, -84.5], [10, 1.0, -84.5], [13.5, 1.0, -84.5],        // the station straight
    [19.46, 1.05, -86.5], [19.46, 1.2, -90.5], [16, 1.45, -92.5],                                     // the turn back into the lift
    [13, 2.4, -92.5], [8, 5.4, -92.5], [2, 9.1, -92.5], [-5, 13.4, -92.5], [-12, 17.7, -92.5], [-19, 22.0, -92.5], [-24.5, 25.0, -92.5],
    [-30.5, 26.2, -92.7],                                                                              // the crest
    [-37.57, 25.9, -95.43], [-40.5, 25.3, -102.5], [-37.57, 24.6, -109.57], [-30.5, 23.8, -112.5],     // the sweep round the west end
    [-24.5, 20.5, -112.5], [-18.5, 13.5, -112.5], [-12.5, 6.5, -112.5], [-6, 2.8, -112.5], [0, 2.2, -112.5],   // the first drop
    [6, 5.5, -112.5], [11.5, 11.5, -112.5], [16.5, 15.6, -112.4],                                      // the camelback, up into
    [21.6, 16.8, -110.6], [23.5, 17.0, -106], [21.6, 16.4, -101.4], [17, 14.8, -99.5],                 // the high turnaround
    [11, 8.5, -99.5], [5, 4.2, -99.5], [-1, 6.5, -99.5], [-6.5, 10.0, -99.5], [-12, 7.0, -99.5], [-17.5, 4.0, -99.5], [-23, 5.6, -99.5], [-28, 7.2, -99.6],   // the airtime hills
    [-33.3, 7.0, -97.3], [-35.5, 6.2, -92], [-33.3, 5.0, -86.7], [-28, 3.8, -84.5],                    // the low west turn, under the crest
    [-22, 2.6, -84.5], [-16, 1.6, -84.5], [-11, 1.1, -84.5]                                            // the brake run
  ];
  PK_KEEP.push([-36, -104, 9], [20, -106, 9], [-8, -108, 12]);
  // Braced bents under a coaster: where the track is low, one stout column with a head; where it is high, two raked
  // columns under a cross head, tied in tiers and cross-braced, each on its own footing. A bent never comes down through
  // a lower pass of the track. Returns where the feet stand, so the planting can keep off them.
  function pkCoBents(g, E, o) {
    var F = E.F, N = F.n, step = Math.max(1, Math.round(N * (o.every || 6.5) / E.len)), mat = o.mat, M = pkMats(), feet = [], i, k;
    var clear = function (x, z, y) { for (var j = 0; j < N; j += 2) { var q = F.p[j]; if (q.y < y - 1.6 && Math.abs(q.x - x) < 1.25 && Math.abs(q.z - z) < 1.25) return false; } return true; };
    var footing = function (x, z, h) { box(0.9, 0.3, 0.9, M.stone, x, 0.15, z, g); solid(x - 0.3, x + 0.3, z - 0.3, z + 0.3, 0, Math.min(h, 3)); feet.push([x, z]); };
    for (i = 0; i < N; i += step) {
      var p = F.p[i], t = F.t[i], up = F.up[i];
      if (Math.abs(t.y) > 0.8 || p.y < 1.7 || up.y < 0.3) continue;
      if (o.skip && o.skip(p.x, p.z, p.y)) continue;
      var sx = p.x - up.x * 0.56, sy = p.y - up.y * 0.56, sz = p.z - up.z * 0.56, h = sy - 0.3;
      if (h < 0.9) continue;
      var rx = t.z, rz = -t.x, rl = Math.sqrt(rx * rx + rz * rz) || 1; rx /= rl; rz /= rl;
      var splay = 0.6 + h * 0.085, twin = h >= 3.6;
      if (twin) for (k = -1; k <= 1 && twin; k += 2) { if (!clear(sx + rx * k * splay, sz + rz * k * splay, h) || !clear(sx + rx * k * splay * 0.5, sz + rz * k * splay * 0.5, h)) twin = false; }
      if (!twin) {
        if (!clear(sx, sz, h)) continue;
        cyl(0.21, h, mat, sx, h / 2, sz, g, 12); footing(sx, sz, h);
        var hd = box(0.9, 0.22, 0.34, mat, sx, h + 0.02, sz, g); hd.rotation.y = Math.atan2(-rz, rx);
        pkRod(sx, h, sz, sx, sy, sz, 0.1, mat, g, 8);
        continue;
      }
      var at = function (s, f) { var w = splay + (0.5 - splay) * f; return [sx + rx * s * w, h * f, sz + rz * s * w]; };
      [-1, 1].forEach(function (s) { var a = at(s, 0), b = at(s, 1); pkRodT(a, b, 0.2, 0.15, mat, g, 12); footing(a[0], a[2], h); });
      var head = box(1.5, 0.26, 0.36, mat, sx, h + 0.02, sz, g); head.rotation.y = Math.atan2(-rz, rx);
      pkRod(sx, h, sz, sx, sy, sz, 0.11, mat, g, 8);
      var nt = Math.max(1, Math.round(h / 4.6));
      for (k = 1; k <= nt; k++) {
        var f0 = (k - 1) / nt + (k === 1 ? 0.06 : 0), f1 = k / nt - (k === nt ? 0.05 : 0), A0 = at(-1, f0), A1 = at(-1, f1), B0 = at(1, f0), B1 = at(1, f1);
        if (k < nt) pkRod(A1[0], A1[1], A1[2], B1[0], B1[1], B1[2], 0.07, mat, g, 6);
        if (h > 7) { pkRod(A0[0], A0[1], A0[2], B1[0], B1[1], B1[2], 0.04, mat, g, 5); pkRod(B0[0], B0[1], B0[2], A1[0], A1[1], A1[2], 0.04, mat, g, 5); }
      }
    }
    return feet;
  }
  function pkBuildWildHunt(p) {
    var th = PK_THEME.wildhunt, i, M = pkMats();
    var g = new THREE.Group(); scene.add(g);
    // The apron. It comes down the west side of the bandstand (the old garden bandstand still stands on the promenade,
    // square in front of the station) and turns east along the queue. The path fence reads the ground meshes to tell
    // path from lawn, so the walk has to be drawn, not just declared.
    pkPaved(26.0, 25.0, pkMats().paversWarm, -3.0, 0.043, -72.0, 2.4);
    pkPaved(26.0, 4.0, pkMats().paversWarm, -3.0, 0.044, -80.6, 2.4);
    var curve = pkCoCurve(PK_HUNT_PTS), len = curve.getLength(), uP = pkCoUAt(curve, 4, -84.5);
    var P0 = pkCoProfile(curve, len, uP);
    var F = pkCoFrames(curve, 760, P0, uP);
    var E = { curve: curve, len: len, F: F, gap: 2.35, cars: [], uPark: uP, uOfF: [], run: 30 };
    pkCoLevel(F, curve, E.uPark, 5 * 2.35 + 1.4, 1.4);
    var seats = [], cols = [0x6b4f8a, 0xc9a227, 0x2a2434, 0xc9a227, 0x6b4f8a, 0x2a2434];
    for (i = 0; i < 6; i++) {
      var car = pkCoCar(cols[i]);
      scene.add(car.g);
      E.cars.push(car);
      car.seats.forEach(function (s) {
        seats.push({ par: car.g, x: s.x, y: s.y, z: s.z, ry: 0, guest: null });
      });
    }
    var spineMat = std({ color: 0x5a3f7a, roughness: 0.4, metalness: 0.35 });
    var supMat = std({ color: 0x33363c, roughness: 0.5, metalness: 0.4 });
    var inStation = function (x, z) { return z > -87.2 && x > -8.5 && x < 16.5; };   // nothing stands through the station and its platform
    pkCoTrackBuild(g, E, { spineMat: spineMat, supMat: supMat, tieMat: std({ color: 0x2b2434, roughness: 0.75 }), skip: function () { return true; } });
    var feet = pkCoBents(g, E, { mat: supMat, every: 6.4, skip: inStation });
    pkCoPlan(E);
    // the lift: the chain up the middle, and a stair with a handrail up the station side of it
    var N = F.n, l0 = Math.round(((uP + P0.lift[0] / P0.K) % 1) * N), l1 = Math.round(((uP + P0.lift[1] / P0.K) % 1) * N), lp = [];
    for (i = l0; i <= l1; i++) lp.push(F.p[i % N]);
    if (lp.length > 8) {
      var chain = pkSweep([[-0.11, -0.06], [0.11, -0.06]], lp, M.chain, g, false, 1.2); chain.castShadow = false;
      var deckM = std({ color: 0x4a4d52, roughness: 0.7, metalness: 0.4, side: THREE.DoubleSide });
      pkSweep([[0.9, -0.42], [1.62, -0.42], [1.62, -0.48], [0.9, -0.48], [0.9, -0.42]], lp, deckM, g, false);
      pkSweep([[1.59, 0.62], [1.65, 0.62], [1.65, 0.68], [1.59, 0.68], [1.59, 0.62]], lp, supMat, g, false);
      pkSweep([[1.6, 0.14], [1.64, 0.14], [1.64, 0.18], [1.6, 0.18], [1.6, 0.14]], lp, supMat, g, false);
      for (i = 0; i < lp.length; i++) {
        var q = lp[i], tq = F.t[(l0 + i) % N], lx = tq.z, lz = -tq.x, ll = Math.sqrt(lx * lx + lz * lz) || 1; lx /= ll; lz /= ll;
        if (i % 2 === 0) { var tr = box(0.7, 0.04, 0.26, deckM, q.x + lx * 1.26, q.y - 0.38, q.z + lz * 1.26, g); tr.rotation.y = Math.atan2(tq.x, tq.z) + Math.PI / 2; }
        if (i % 4 === 0) pkRod(q.x + lx * 1.62, q.y - 0.45, q.z + lz * 1.62, q.x + lx * 1.62, q.y + 0.66, q.z + lz * 1.62, 0.022, supMat, g, 5);
        if (i % 6 === 0) pkRod(q.x, q.y - 0.56, q.z, q.x + lx * 1.62, q.y - 0.46, q.z + lz * 1.62, 0.04, supMat, g, 5);
      }
    }
    // the station: a platform on the promenade side, boom gates at the train, and over both a hunting lodge
    pkCoPlatform(g, -5.0, 14.5, -84.2, -81.7, th, 1.0);
    var a = pkAttr({
      id: 'wildhunt', name: 'The Wild Hunt', x: p.x, z: p.z,
      qx: p.q[0], qz: p.q[1], qdx: 1, g: g, seats: seats,
      board: 12, run: E.run, unload: 7, exit: [12.4, -82.7],
      extra: E, tickRun: function (at) { pkCoRun(at); }
    });
    var C = pkCtl(a);
    E.a = a;
    pkCoGates(g, [0.6, 3.0, 5.4, 7.8, 10.2], -84.25, C, 1.0);
    pkHuntLodge(g, th);
    E.cars.forEach(function (c) {
      C.barObjs.push(function (b) { c.bar.rotation.x = -1.35 * (1 - b); });
    });
    pkCoPlace(E, E.uPark);
    // the wood: pines and rock between the legs of the ride, kept off the track, the bents and the station
    var near = function (x, z, r, yMax) { for (var j = 0; j < N; j += 3) { var t3 = F.p[j]; if (t3.y < yMax && Math.abs(t3.x - x) < r && Math.abs(t3.z - z) < r) return true; } return false; };
    var footNear = function (x, z) { for (var j = 0; j < feet.length; j++) if (Math.abs(feet[j][0] - x) < 1.6 && Math.abs(feet[j][1] - z) < 1.6) return true; return false; };
    var planted = 0, tries = 0;
    while (planted < 46 && tries++ < 900) {
      var tx = randf(-41, 25.5), tz = randf(-116, -88), ts = randf(0.75, 1.25);
      if (inStation(tx, tz + 1.5) || near(tx, tz, 3.4, 15) || footNear(tx, tz)) continue;
      pkConifer(tx, tz, ts, g, planted * 7 + 3); planted++;
    }
    for (i = 0, tries = 0; i < 16 && tries < 300; tries++) {
      var bx = randf(-40, 24), bz = randf(-115, -89);
      if (inStation(bx, bz + 1.5) || near(bx, bz, 2.6, 6) || footNear(bx, bz)) continue;
      pkBoulder(bx, bz, randf(0.8, 1.7), g); i++;
    }
    return a;
  }
  // The Wild Hunt's station: a hunting lodge over the platform and the track. Timber posts on stone feet with knee braces,
  // tie beams, a slate gable roof the length of the train, a boarded back wall behind the track, lanterns under the eaves,
  // the name on the eaves beam and a stag's antlers over it.
  function pkHuntLodge(g, th) {
    var M = pkMats(), X0 = -5.2, X1 = 14.7, ZS = -81.75, ZN = -86.75, Y0 = 1.0, EV = 4.3, mid = (X0 + X1) / 2, i;
    var timber = std({ color: 0x4f3a26, roughness: 0.88 }), plank = std({ map: M.clap.map, color: 0x7a5c40, roughness: 0.9 });
    var xs = []; for (i = 0; i <= 4; i++) xs.push(X0 + 0.3 + (X1 - X0 - 0.6) * i / 4);
    xs.forEach(function (x) {
      [[ZS, Y0], [ZN, 0]].forEach(function (zy) {
        var z = zy[0], y0 = zy[1];
        box(0.5, 0.5, 0.5, M.stoneDark, x, y0 + 0.25, z, g);
        box(0.26, EV - y0 - 0.5, 0.26, timber, x, (EV + y0 + 0.5) / 2, z, g);
        solid(x - 0.2, x + 0.2, z - 0.2, z + 0.2, y0, EV);
        [-1, 1].forEach(function (s) { if ((s < 0 && x > X0 + 1) || (s > 0 && x < X1 - 1)) pkRod(x, EV - 0.9, z, x + s * 0.8, EV - 0.06, z, 0.07, timber, g, 4); });
      });
      box(0.24, 0.26, ZS - ZN + 0.6, timber, x, EV - 0.05, (ZS + ZN) / 2, g);                          // the tie beam
      pkRod(x, EV + 0.08, (ZS + ZN) / 2, x, EV + 1.9, (ZS + ZN) / 2, 0.08, timber, g, 4);             // the king post
      [ZS + 0.25, ZN - 0.25].forEach(function (z) { pkRoundCyl(0.09, 0.26, M.lantern, x, EV - 0.5, z, g, 8); box(0.22, 0.04, 0.22, MAT.iron, x, EV - 0.34, z, g); });
    });
    [ZS, ZN].forEach(function (z) { box(X1 - X0 + 0.5, 0.28, 0.26, timber, mid, EV + 0.06, z, g); });   // the eaves beams
    pkGableRoof(X1 - X0 + 0.6, ZS - ZN + 0.9, 2.1, M.slate, plank, mid, EV + 0.2, (ZS + ZN) / 2, g, 0.45);
    // the back wall, behind the track: boards to shoulder height between the posts, open above
    box(X1 - X0, 2.0, 0.1, plank, mid, 1.0, ZN, g);
    box(X1 - X0, 0.12, 0.2, timber, mid, 2.05, ZN, g);
    solid(X0, X1, ZN - 0.1, ZN + 0.1, 0, 2.1);
    // the name on the eaves beam, and the antlers over it
    pkSign3D(['THE WILD HUNT'], 4.8, 0.36, mid, EV + 0.06, ZS + 0.16, 0, { bg: '#1c1622', fg: '#e3c26a' }, g);
    var bone = std({ color: 0xd9cdb0, roughness: 0.7 });
    box(0.5, 0.6, 0.08, timber, mid, EV + 0.75, ZS + 0.18, g, { r: 0.03 });
    [-1, 1].forEach(function (s) {
      pkTube([[mid + s * 0.08, EV + 0.8, ZS + 0.24], [mid + s * 0.5, EV + 1.05, ZS + 0.3], [mid + s * 0.95, EV + 1.5, ZS + 0.3], [mid + s * 1.0, EV + 2.0, ZS + 0.26]], 0.045, bone, g, false, 14, 6);
      [[0.4, 0.98, 0.3, 1.5], [0.72, 1.24, 0.62, 1.78], [0.93, 1.5, 1.28, 1.86]].forEach(function (tn) { pkRodT([mid + s * tn[0], EV + tn[1], ZS + 0.3], [mid + s * tn[2], EV + tn[3], ZS + 0.3], 0.035, 0.012, bone, g, 6); });
    });
    // crossed banners at the two ends, in the ride's purple and gold
    [X0 - 0.05, X1 + 0.05].forEach(function (x) {
      var bn = box(0.04, 1.5, 0.7, std({ color: th.a, roughness: 0.7 }), x, EV - 1.0, ZS + 0.6, g); bn.rotation.y = 0;
      box(0.05, 0.1, 0.8, M.gold, x, EV - 0.22, ZS + 0.6, g); box(0.05, 0.08, 0.7, M.gold, x, EV - 1.72, ZS + 0.6, g);
    });
  }
  // ── Registering the plots ────────────────────────────────────────
  // Pushed at load time, before the trees are scattered and before the dressing runs, so the planting
  // keeps clear, the dressing dresses them, and the booth pass gives them the standard cabins.
  PK_PLOTS.push(
    { id: 'serpent', name: 'The Serpent', x: 55, z: -77.5, r: 12.5, q: [44.5, -65], level: 12, pad: 0.93 },
    { id: 'baron', name: "Baron's Drop", x: 57, z: 19, r: 12, q: [58.6, 19], qdx: 1, level: 13, pad: 0.82, boothAt: [67.4, 9.8] },   // the line runs east from the gate: the train comes home up the west side
    // The Wild Hunt stands where the three indoor halls were: one big outdoor coaster across the north strip, the length of
    // the old halls and then some. It takes the place of Nocturne, The Wreck and Moonwood in one go.
    { id: 'wildhunt', name: 'The Wild Hunt', x: -8, z: -94, r: 30, q: [-1.0, -79.2], qdx: 1, level: 15, pad: 0.02, boothAt: [-8.6, -78.6] }
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
  PK_THEME.wildhunt = { a: 0x3a2a4a, b: 0xc9a227, ground: 0x5a5548, name: 'The Wild Hunt', noBunting: true, noDecor: true };
  // the spurs from the North Promenade up to the queues, and the kids' lane from the Fairground avenue down into the kids'
  // garden, west of the carousel, past the three little rides' gateways
  PK_ROUTES.push(
    [35, -60, 35, -65, 4.2, 'coaster'], [35, -65, 41, -65, 4.2, 'coaster'],
    [-38, -60, -20, -60, 5, 'dark'], [-14, -60, -8.5, -60, 5, 'dark'], [-8.5, -60, -8.5, -80.0, 6.0, 'dark'], [-8.5, -79.8, 4.0, -79.8, 5.0, 'dark'],   // the Wild Hunt's approach and its queue apron
    [-46.8, 5.4, -46.8, 50, 3.4, 'fair']
  );
  PK_KEEP.push([35.5, -62.5, 5.5], [42.5, -65.5, 5], [-38.5, 42, 6.5]);

  function pkCoastersBuild() {
    var makers = {
      serpent: pkBuildSerpent, baron: pkBuildBaron, wildhunt: pkBuildWildHunt,
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

  // ── The control cabin ──────────────────────────────────────────
  // the cabin itself, for a hall or a free-standing control house: o.K is the room in a frame where X(u) = AX + s*u is world
  // x and z is world z ({ u0, u1, z0, z1, door: [z, z] }); the long window is on the z0 side, the door in the u0 wall
  function pkCabinBuild(g, a, o) {
    var s = o.s, AX = o.AX, K = o.K, T = 0.12, H = o.H || 2.9;
    // o.y raises the whole cabin (a station whose platform stands above the ground): the room is built in a group lifted by
    // it, its solids are lifted with it and its floor is walkable at that height
    var lift = o.y || 0, sol = function (x0, x1, z0, z1, y0, y1) { solid(x0, x1, z0, z1, (y0 || 0) + lift, (y1 || 0) + lift); };
    if (lift) { var g0 = g; g = new THREE.Group(); g.position.y = lift; g0.add(g); }
    var cfg = { name: o.name, sign: o.sign };
    function X(u) { return AX + s * u; }
    var trim = std({ map: pkMats().clap.map, color: o.trim, roughness: 0.7, metalness: 0.15 });
    var band = std({ color: o.band, roughness: 0.5, metalness: 0.3 });
    var glass = std({ color: 0x9fc6cc, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.34 });
    var xa = Math.min(X(K.u0), X(K.u1)), xb = Math.max(X(K.u0), X(K.u1)), cx = (xa + xb) / 2, cz = (K.z0 + K.z1) / 2, W = xb - xa, D = K.z1 - K.z0;
    var xn = X(K.u0 + T / 2), xf = X(K.u1 - T / 2);          // the platform-side wall and the far wall
    box(W, 0.12, D, std({ color: 0x2e2e34, roughness: 0.95 }), cx, 0.06, cz, g);
    if (lift) {
      box(W + 0.1, lift, D + 0.1, pkMats().kerb, cx, -lift / 2, cz, g);                      // the cabin's stone base
      // the cabin's own floor is for the operator alone: guests pass underneath (only a walker with a height stands on it)
      PK_FLOOR_RECTS.push({ axis: 'z', x0: xa, x1: xb, z0: K.z0, z1: K.z1, y: lift + 0.12, overhead: true });
    }
    // the long window over the track: parapet, glass, header, posts
    box(W, 0.95, T, trim, cx, 0.475, K.z0 + T / 2, g);
    var GH = H - 1.5, GY = 0.95 + GH / 2;   // the glass fills parapet (0.95) to header (H - 0.55); 1.4 at the default H 2.9
    box(W - 0.2, GH, 0.05, glass, cx, GY, K.z0 + T / 2, g);
    box(W, 0.55, T, trim, cx, H - 0.275, K.z0 + T / 2, g);
    [xa + 0.06, cx, xb - 0.06].forEach(function (px) { box(0.12, H, 0.16, trim, px, H / 2, K.z0 + T / 2, g); });
    box(W + 0.1, 0.12, 0.2, band, cx, 0.98, K.z0 + 0.02, g);
    // the platform side: a window at the track end, then the door
    var d0 = K.door[0], d1 = K.door[1];
    box(T, 0.95, d0 - K.z0, trim, xn, 0.475, (K.z0 + d0) / 2, g);
    box(0.05, GH, d0 - K.z0 - 0.2, glass, xn, GY, (K.z0 + d0) / 2, g);
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
    sol(xa, xb, K.z0, K.z0 + T + 0.04, 0, H);
    sol(xf - 0.08, xf + 0.08, K.z0, K.z1, 0, H);
    sol(xn - 0.08, xn + 0.08, K.z0, d0, 0, H);
    sol(xn - 0.08, xn + 0.08, d1, K.z1, 0, H);
    sol(xa, xb, K.z1 - T - 0.04, K.z1, 0, H);   // the back panel (south wall), behind the operator: a wall like the rest
    // the desk under the long window, the operator facing the track with the platform on the side
    var con = new THREE.Group(); con.position.set(cx, 0.12, K.z0 + 0.5); g.add(con);
    // o.desk(a, con, W) builds a ride's own desk (and its own screens) instead of the kit's; the ride panel still goes in its middle
    if (o.desk) o.desk(a, con, W); else pkBkDesk(con, 2.1);
    pkBoothPanel(a, con);
    var dw = o.desk ? W / 2 - 0.15 : 1.05;
    sol(cx - dw, cx + dw, K.z0 + 0.1, K.z0 + 0.82, 0, 0.95);
    // the kit, in a frame at the room's middle: local -z is the long window, +z the back
    var k = new THREE.Group(); k.position.set(cx, 0.12, cz); g.add(k);
    var fxl = (xf - cx) - s * 0.17;
    pkBkCabinet(a, k, fxl, 1.42, 0.2, -s * Math.PI / 2);
    sol(Math.min(xf, xf - s * 0.36), Math.max(xf, xf - s * 0.36), cz - 0.3, cz + 0.7, 0, 2.0);
    if (!o.desk) pkBkMonitors(a, k, 0, 1.95, K.z0 + 0.36 - cz, 0, 0.32);
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
    // a small filing cabinet and a potted plant in the back corner, so the room reads as lived-in
    box(0.5, 0.9, 0.45, std({ color: 0x3a3a42, roughness: 0.7 }), xf - s * 0.4, 0.45, K.z1 - 0.5, g);
    box(0.5, 0.08, 0.45, std({ color: 0x2a2a30, roughness: 0.8 }), xf - s * 0.4, 0.92, K.z1 - 0.5, g);
    var plantPot = new THREE.Group(); plantPot.position.set(xf - s * 1.0, 0.12, K.z1 - 0.5); g.add(plantPot);
    cyl(0.18, 0.28, std({ color: 0x6b4a2a, roughness: 0.8 }), 0, 0.14, 0, plantPot, 10);
    sphere(0.32, std({ color: 0x2f6b3a, roughness: 0.85 }), 0, 0.42, 0, plantPot);
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
  // ── The kids' area ────────────────────────────────────────────────
  // Three gentle rides on the west lawn: a little roundabout, a pot-and-teapot spinner and the Puffin
  // Line, a hand-cranked pedal train on its own small oval of track.
  function pkBuildKiddie(p) {
    var M = pkMats(), th = PK_THEME[p.id], g = new THREE.Group(); g.position.set(p.x, 0, p.z); scene.add(g);
    var isPot = p.id === 'kpots', seats = [], pots = [], i, a;
    var R = isPot ? 3.5 : 3.1, deck = std({ color: isPot ? 0x2f7f8f : 0xb8452f, roughness: 0.55 }), cream = std({ color: 0xf4f1e6, roughness: 0.6 });
    var cA = isPot ? '#2f7f8f' : '#b8452f', cB = '#f4f1e6';
    pkLathe([[0, 0], [R + 0.95, 0], [R + 0.95, 0.14], [R + 0.7, 0.22], [R + 0.62, 0.44], [0, 0.44]], M.stone, 0, 0, 0, g, 48);
    pkRing(R + 0.64, 0.05, deck, 0, 0.42, 0, g, 48);
    var spin = pkMover(g, 0, 0.44, 0);
    // the deck: boards under a painted sunburst, a gilt rim and a skirt in the ride's colour
    pkRoundCyl(R, 0.16, MAT.wood, 0, 0.08, 0, spin, 48);
    var top = new THREE.Mesh(new THREE.CircleGeometry(R - 0.04, 48), std({ map: pkTexSunburst(cA, cB), roughness: 0.6 })); top.rotation.x = -Math.PI / 2; top.position.y = 0.165; spin.add(top);
    pkPrism(R + 0.01, 0.15, 48, deck, 0, 0.08, 0, spin, R + 0.01, true);
    pkRing(R, 0.04, M.gold, 0, 0.16, 0, spin, 56);
    // the centre post: a turned column on a plinth, banded in gilt
    pkLathe([[0, 0], [0.55, 0], [0.55, 0.14], [0.36, 0.24], [0.26, 0.5], [0.22, 1.2], [0.26, 2.0], [0.22, 2.5], [0.4, 2.74], [0, 2.74]], cream, 0, 0.16, 0, spin, 20);
    [0.42, 0.7, 2.2, 2.66].forEach(function (y) { pkRing(0.28, 0.035, M.gold, 0, y, 0, spin, 20); });
    if (isPot) {
      // the teapot the pots dance round: a turned body on the post, a lid and knob, a spout and a handle
      pkLathe([[0, 0], [0.34, 0], [0.62, 0.16], [0.78, 0.45], [0.74, 0.78], [0.52, 1.0], [0.32, 1.06], [0.36, 1.12], [0.22, 1.18], [0, 1.18]], deck, 0, 1.25, 0, spin, 28);
      pkLathe([[0, 0], [0.3, 0], [0.24, 0.1], [0.07, 0.17], [0.1, 0.25], [0, 0.31]], M.gold, 0, 2.43, 0, spin, 16);
      pkRing(0.75, 0.03, M.gold, 0, 1.78, 0, spin, 32);
      pkTube([[0.66, 1.62, 0], [0.98, 1.8, 0], [1.14, 2.14, 0], [1.26, 2.3, 0]], 0.085, deck, spin, false, 16, 8);
      var ph = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.06, 8, 16, Math.PI), deck); ph.position.set(-0.74, 1.8, 0); ph.rotation.z = Math.PI / 2; spin.add(ph);
      var potMats = [std({ map: pkTexDots('#f0c04a', '#ffffff'), roughness: 0.35 }), std({ map: pkTexDots('#d2622f', '#ffffff'), roughness: 0.35 })];
      for (i = 0; i < 8; i++) {
        a = i / 8 * Math.PI * 2;
        var pot = pkMover(spin, Math.sin(a) * 2.45, 0.16, Math.cos(a) * 2.45);
        // a pot to sit in: a saucer, a hollow tub with a rolled rim, a bench round the inside and a little wheel to turn it by
        pkLathe([[0, 0], [0.66, 0], [0.72, 0.04], [0.7, 0.07], [0, 0.07]], cream, 0, 0, 0, pot, 24);
        pkLathe([[0, 0.07], [0.4, 0.07], [0.5, 0.12], [0.6, 0.46], [0.63, 0.66], [0.66, 0.7], [0.62, 0.73], [0.57, 0.68], [0.54, 0.46], [0.45, 0.2], [0, 0.2]], potMats[i % 2], 0, 0, 0, pot, 24);
        pkRing(0.635, 0.03, cream, 0, 0.71, 0, pot, 28);
        pkRing(0.36, 0.11, M.seat, 0, 0.34, 0, pot, 20);
        cyl(0.025, 0.42, M.iron, 0, 0.41, 0, pot, 6); pkRing(0.14, 0.022, M.iron, 0, 0.63, 0, pot, 14);
        var hd = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.045, 8, 14, Math.PI), potMats[i % 2]); hd.position.set(0.62, 0.42, 0); hd.rotation.z = -Math.PI / 2; pot.add(hd);
        pkFuse(pot);
        pots.push(pot);
        seats.push({ par: pot, x: 0, y: 0.45 - 0.76, z: -0.2, ry: 0, guest: null });   // on the bench, facing the wheel
      }
    } else {
      // six ponies, three colours, each on a brass pole
      var coats = [0xf4f1e6, 0x4d7a9b, 0xe8c9a0], hairs = [0xc9a36a, 0x24394a, 0x6b4a2a], cloths = [0xb8452f, 0xf0c04a, 0x2f7f8f];
      for (i = 0; i < 6; i++) {
        a = i / 6 * Math.PI * 2;
        var px = Math.sin(a) * 2.3, pz = Math.cos(a) * 2.3, ry = Math.atan2(Math.cos(a), -Math.sin(a));
        pkRoundCyl(0.03, 2.74, M.brass, px, 1.53, pz, spin, 8);
        cyl(0.05, 0.05, M.gold, px, 0.19, pz, spin, 8);
        var hg = pkMover(spin, px, 0.17, pz);
        var pony = new THREE.Group(); pony.scale.set(0.8, 0.8, 0.8); pony.position.y = 0.08; hg.add(pony);
        pkHorse3D(pony, pkCoat(coats[i % 3]), pkCoat(cloths[i % 3]), M, pkCoat(hairs[i % 3]));
        pkFuse(hg);
        hg.rotation.y = ry;
        seats.push({ par: spin, x: px, y: 1.41 - 0.76, z: pz, ry: ry, guest: null });   // in the saddle
      }
    }
    // the canopy: a ceiling, a striped rounding board with bulbs, a scalloped valance and a striped tilt up to a gilt ball
    var CR = R + 0.5, CY = 2.9;
    var ceil = new THREE.Mesh(new THREE.CircleGeometry(CR, 40), std({ color: 0xf4f1e6, roughness: 0.8, side: THREE.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.position.y = CY; spin.add(ceil);
    for (i = 0; i < 12; i++) { a = i / 12 * Math.PI * 2; pkRod(Math.cos(a) * 0.3, CY - 0.03, Math.sin(a) * 0.3, Math.cos(a) * CR, CY - 0.03, Math.sin(a) * CR, 0.03, M.gold, spin, 5); }
    var brd = pkTexStripes(cA, cB, 8); brd.repeat.set(4, 1);
    pkPrism(CR, 0.4, 40, std({ map: brd, roughness: 0.7, side: THREE.DoubleSide }), 0, CY + 0.2, 0, spin, CR, true);
    pkRing(CR + 0.01, 0.035, M.gold, 0, CY, 0, spin, 48); pkRing(CR + 0.01, 0.035, M.gold, 0, CY + 0.4, 0, spin, 48);
    for (i = 0; i < 28; i++) {
      a = (i + 0.5) / 28 * Math.PI * 2;
      var sv = new THREE.Mesh(cachedGeo('pkscalK', function () { return new THREE.CircleGeometry(0.3, 10, Math.PI, Math.PI); }), i % 2 ? deck : M.gold);
      sv.position.set(Math.cos(a) * (CR + 0.01), CY, Math.sin(a) * (CR + 0.01)); sv.rotation.y = Math.PI / 2 - a; spin.add(sv);
    }
    var kb = []; for (i = 0; i < 36; i++) { a = i / 36 * Math.PI * 2; kb.push([Math.cos(a) * (CR + 0.04), CY + 0.2, Math.sin(a) * (CR + 0.04)]); }
    pkBulbs(kb, M.bulb, 0.04, spin);
    var rt = pkTexStripes(cA, cB, 8); rt.repeat.set(2, 1);
    var roof = new THREE.Mesh(new THREE.LatheGeometry([[CR + 0.22, 0], [CR * 0.72, 0.3], [CR * 0.4, 0.62], [CR * 0.16, 0.98], [0.12, 1.3]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 40),
      std({ map: rt, roughness: 0.75, side: THREE.DoubleSide }));
    roof.position.y = CY + 0.4; roof.castShadow = true; spin.add(roof);
    pkLathe([[0, 0], [0.16, 0], [0.08, 0.12], [0.2, 0.3], [0.2, 0.42], [0.06, 0.6], [0, 0.64]], M.gold, 0, CY + 1.66, 0, spin, 14);
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
