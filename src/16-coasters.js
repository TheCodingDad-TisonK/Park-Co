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
      // on a near-vertical stretch the push says nothing about which way is up (it only spun the train round the track, a
      // corkscrew down every dive), so the roll is held there and carried through from either side
      wt.push(Math.abs(tans[i].y) > 0.88 ? 0 : clamp(f.length() / 9.81 - 0.15, 0, 1));
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
      for (i = 0; i <= c; i++) if (ys[i] >= ys[c] - 0.05) { c = i; break; }   // a level crest: the lift ends where it first gets within 5 cm of the top
      var l0 = c;
      while (l0 > 1 && ys[l0 - 1] < ys[l0] - 1e-4) l0--;                // back down the climb to where it starts
      if (c - l0 > 4) lift = [l0, c];
    }
    var trims = (o.trim || []).map(function (t) { return [Math.round(((t[0] - u0 + 1) % 1) * K), Math.round(((t[1] - u0 + 1) % 1) * K), t[2]]; });
    var vSt = o.vStation || 2.5, vChain = o.vChain || 2.4, mu = 0.022, drag = 0.0009, V = [0], dIn = o.rollIn || 2.5;
    for (i = 1; i <= K; i++) {
      var v, s = i * S, d = Math.max(0, len - s);   // (a hair under zero at the last step would make the roll-in root NaN)
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
      // the ramp runs from the deck's south edge (at the deck's own height) down to the ground rampLen further south. A
      // positive turn about x drops the south end; it was turned the other way, so the ramp rose away from the platform
      // and dipped under the deck where it should have met it
      var ramp = box(x1 - x0, 0.1, Math.sqrt(rampLen * rampLen + surf * surf), pkMats().kerb, (x0 + x1) / 2, surf / 2 - 0.05, zS + rampLen / 2, g);
      ramp.rotation.x = Math.atan2(surf, rampLen);
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
  // A looper laid from arcs (tools/scratch/tracks/serpent.js): out of the station east, the chain lift up the east side to
  // 25 m, a slow spiral over the north-east corner (two and a quarter turns, descending), then the first drop in one long
  // falling curve to the west side, a trim brake and the vertical loop, and home down the west column and a turn into the
  // station. The middle lies open: the stone serpent coils there.
  var PK_SERPENT_PTS = [
    [47, 1.05, -70], [48.23, 1.05, -70], [49.46, 1.05, -70], [50.69, 1.05, -70], [51.92, 1.05, -70], [53.15, 1.05, -70],
    [54.38, 1.05, -70], [55.62, 1.05, -70], [56.85, 1.05, -70], [58.08, 1.05, -70], [59.31, 1.05, -70], [60.54, 1.05, -70],
    [61.77, 1.05, -70], [63, 1.05, -70], [64.17, 1.05, -70.12], [65.3, 1.05, -70.46], [66.33, 1.05, -71.01], [67.24, 1.05, -71.76],
    [67.99, 1.05, -72.67], [68.54, 1.05, -73.7], [68.88, 1.05, -74.83], [69, 1.05, -76], [69, 1.33, -77.2], [69, 2.18, -78.4],
    [69, 3.5, -79.6], [69, 4.86, -80.8], [69, 6.22, -82], [69, 7.58, -83.2], [69, 8.94, -84.4], [69, 10.3, -85.6],
    [69, 11.66, -86.8], [69, 13.03, -88], [69, 14.39, -89.2], [69, 15.75, -90.4], [69, 17.11, -91.6], [69, 18.47, -92.8],
    [69, 19.83, -94], [69, 21.19, -95.2], [69, 22.55, -96.4], [69, 23.87, -97.6], [69, 24.72, -98.8], [69, 25, -100],
    [69, 25, -101.2], [69, 25, -102.4], [69, 25, -103.6], [69, 25, -104.8], [69, 25, -106], [68.9, 25, -107.2],
    [68.59, 24.99, -108.37], [68.08, 24.97, -109.46], [67.4, 24.96, -110.45], [66.56, 24.93, -111.31], [65.58, 24.9, -112.02], [64.49, 24.87, -112.54],
    [63.33, 24.83, -112.87], [62.13, 24.78, -113], [60.93, 24.73, -112.92], [59.76, 24.68, -112.63], [58.66, 24.62, -112.15], [57.65, 24.56, -111.48],
    [56.77, 24.5, -110.66], [56.05, 24.43, -109.69], [55.51, 24.35, -108.62], [55.15, 24.28, -107.46], [55.01, 24.2, -106.27], [55.06, 24.11, -105.06],
    [55.33, 24.03, -103.89], [55.79, 23.94, -102.77], [56.43, 23.85, -101.76], [57.24, 23.75, -100.86], [58.2, 23.66, -100.12], [59.26, 23.56, -99.56],
    [60.41, 23.45, -99.18], [61.6, 23.35, -99.01], [62.8, 23.24, -99.05], [63.98, 23.14, -99.29], [65.11, 23.03, -99.73], [66.14, 22.92, -100.35],
    [67.04, 22.8, -101.15], [67.8, 22.69, -102.08], [68.39, 22.57, -103.14], [68.78, 22.46, -104.27], [68.98, 22.34, -105.46], [68.97, 22.22, -106.67],
    [68.75, 22.11, -107.85], [68.33, 21.99, -108.99], [67.73, 21.87, -110.03], [66.95, 21.75, -110.95], [66.03, 21.63, -111.73], [64.99, 21.51, -112.33],
    [63.85, 21.39, -112.75], [62.67, 21.28, -112.97], [61.46, 21.16, -112.98], [60.27, 21.04, -112.78], [59.14, 20.93, -112.39], [58.08, 20.81, -111.8],
    [57.15, 20.7, -111.04], [56.35, 20.58, -110.14], [55.73, 20.47, -109.11], [55.29, 20.36, -107.98], [55.05, 20.26, -106.8], [55.01, 20.15, -105.6],
    [55.18, 20.05, -104.41], [55.56, 19.94, -103.26], [56.12, 19.84, -102.2], [56.86, 19.75, -101.24], [57.76, 19.65, -100.43], [58.77, 19.56, -99.79],
    [59.89, 19.47, -99.33], [61.06, 19.39, -99.06], [62.27, 19.3, -99.01], [63.46, 19.22, -99.15], [64.62, 19.15, -99.51], [65.69, 19.07, -100.05],
    [66.66, 19, -100.77], [67.48, 18.94, -101.65], [68.15, 18.88, -102.66], [68.63, 18.82, -103.76], [68.92, 18.77, -104.93], [69, 18.72, -106.13],
    [68.87, 18.67, -107.33], [68.54, 18.63, -108.49], [68.02, 18.6, -109.58], [67.31, 18.57, -110.56], [66.45, 18.54, -111.4], [65.46, 18.53, -112.08],
    [64.37, 18.51, -112.59], [63.2, 18.5, -112.9], [62, 18.5, -113], [60.81, 18.44, -112.97], [59.63, 18.28, -112.87], [58.46, 18.01, -112.71],
    [57.29, 17.66, -112.49], [56.14, 17.21, -112.2], [55.01, 16.7, -111.85], [53.89, 16.11, -111.44], [52.8, 15.46, -110.98], [51.74, 14.76, -110.45],
    [50.71, 14.02, -109.87], [49.71, 13.24, -109.23], [48.75, 12.44, -108.53], [47.82, 11.61, -107.79], [46.94, 10.77, -107], [46.1, 9.93, -106.16],
    [45.31, 9.09, -105.28], [44.57, 8.26, -104.35], [43.87, 7.46, -103.39], [43.23, 6.68, -102.39], [42.65, 5.94, -101.36], [42.12, 5.24, -100.3],
    [41.66, 4.59, -99.21], [41.25, 4, -98.09], [40.9, 3.49, -96.96], [40.61, 3.04, -95.81], [40.39, 2.69, -94.64], [40.23, 2.42, -93.47],
    [40.13, 2.26, -92.29], [40.1, 2.2, -91.1], [40.1, 2.2, -89.96], [40.1, 2.2, -88.81], [40.1, 2.2, -87.67], [40.1, 2.2, -86.53],
    [40.1, 2.2, -85.39], [40.1, 2.2, -84.24], [40.1, 2.2, -83.1], [40.03, 2.33, -81.92], [39.96, 2.71, -80.79], [39.88, 3.32, -79.77],
    [39.81, 4.14, -78.91], [39.74, 5.12, -78.24], [39.67, 6.23, -77.8], [39.59, 7.4, -77.61], [39.52, 8.59, -77.67], [39.45, 9.74, -77.99],
    [39.38, 10.79, -78.55], [39.3, 11.69, -79.32], [39.23, 12.41, -80.26], [39.16, 12.91, -81.34], [39.09, 13.17, -82.51], [39.01, 13.17, -83.69],
    [38.94, 12.91, -84.86], [38.87, 12.41, -85.94], [38.8, 11.69, -86.88], [38.72, 10.79, -87.65], [38.65, 9.74, -88.21], [38.58, 8.59, -88.53],
    [38.51, 7.4, -88.59], [38.43, 6.23, -88.4], [38.36, 5.12, -87.96], [38.29, 4.14, -87.29], [38.22, 3.32, -86.43], [38.14, 2.71, -85.41],
    [38.07, 2.33, -84.28], [38, 2.2, -83.1], [38, 2.2, -81.77], [38, 2.2, -80.43], [38, 2.2, -79.1], [38, 2.2, -78.07],
    [38, 2.2, -77.03], [38, 2.2, -76], [38.12, 2.15, -74.83], [38.46, 2.02, -73.7], [39.01, 1.84, -72.67], [39.76, 1.63, -71.76],
    [40.67, 1.41, -71.01], [41.7, 1.23, -70.46], [42.83, 1.1, -70.12], [44, 1.05, -70], [45, 1.05, -70], [46, 1.05, -70]
  ];
  var PK_SERPENT_TRIM = [[40.4, -92.6], [40.4, -87], 15.4];   // the trim brake before the loop: from, to (x, z), and the speed it trims to (m/s)
  function pkBuildSerpent(p) {
    var th = PK_THEME.serpent, M = pkMats(), i;
    var g = new THREE.Group(); scene.add(g);
    var curve = pkCoCurve(PK_SERPENT_PTS), len = curve.getLength(), uP = pkCoUAt(curve, 57.4, -70);
    var opt = { trim: [[pkCoUAt(curve, PK_SERPENT_TRIM[0][0], PK_SERPENT_TRIM[0][1]), pkCoUAt(curve, PK_SERPENT_TRIM[1][0], PK_SERPENT_TRIM[1][1]), PK_SERPENT_TRIM[2]]] };   // the trim brake holds the loop's entry speed
    var F = pkCoFrames(curve, 700, pkCoProfile(curve, len, uP, opt), uP);
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
    pkCoPlan(E, opt);
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
  // A dive coaster laid from arcs (tools/scratch/tracks/baron.js). Out of the station a right turn and the steep chain lift
  // down the east side to 23 m, a short top turn, and the first dive, straight down, pulling out west along the south lane
  // through the splash basin. Then two vertical loops, a water brake, a slow U-turn at the west end, and the run home east
  // through the rockery tunnel into the station.
  var PK_BARON_PTS = [
    [46.8, 0.95, 15.5], [48, 0.95, 15.5], [49.2, 0.95, 15.5], [50.4, 0.95, 15.5], [51.6, 0.95, 15.5], [52.8, 0.95, 15.5],
    [54, 0.95, 15.5], [55.2, 0.95, 15.5], [56.4, 0.95, 15.5], [57.6, 0.95, 15.5], [58.8, 0.95, 15.5], [60, 0.95, 15.5],
    [61.2, 0.95, 15.5], [62.4, 0.95, 15.5], [63.6, 0.95, 15.5], [64.8, 0.95, 15.5], [66.04, 0.95, 15.7], [67.15, 0.95, 16.26],
    [68.04, 0.95, 17.15], [68.6, 0.95, 18.26], [68.8, 0.95, 19.5], [68.8, 1.05, 20.28], [68.8, 1.35, 21], [68.8, 1.83, 21.62],
    [68.8, 2.45, 22.1], [68.8, 3.17, 22.4], [68.8, 3.95, 22.5], [68.8, 5.18, 22.5], [68.8, 6.41, 22.5], [68.8, 7.64, 22.5],
    [68.8, 8.87, 22.5], [68.8, 10.1, 22.5], [68.8, 11.33, 22.5], [68.8, 12.57, 22.5], [68.8, 13.8, 22.5], [68.8, 15.03, 22.5],
    [68.8, 16.26, 22.5], [68.8, 17.49, 22.5], [68.8, 18.72, 22.5], [68.8, 19.95, 22.5], [68.8, 20.73, 22.6], [68.8, 21.45, 22.9],
    [68.8, 22.07, 23.38], [68.8, 22.55, 24], [68.8, 22.85, 24.72], [68.8, 22.95, 25.5], [68.63, 22.95, 26.58], [68.13, 22.95, 27.56],
    [67.36, 22.95, 28.33], [66.38, 22.95, 28.83], [65.3, 22.95, 29], [64.39, 22.83, 29], [63.55, 22.48, 29], [62.83, 21.92, 29],
    [62.27, 21.2, 29], [61.92, 20.36, 29], [61.8, 19.45, 29], [61.8, 18.24, 29], [61.8, 17.02, 29], [61.8, 15.81, 29],
    [61.8, 14.59, 29], [61.8, 13.38, 29], [61.8, 12.16, 29], [61.8, 10.95, 29], [61.73, 9.74, 29], [61.51, 8.56, 29],
    [61.15, 7.4, 29], [60.65, 6.3, 29], [60.03, 5.27, 29], [59.29, 4.32, 29], [58.43, 3.46, 29], [57.48, 2.72, 29],
    [56.45, 2.1, 29], [55.35, 1.6, 29], [54.19, 1.24, 29], [53.01, 1.02, 29], [51.8, 0.95, 29], [50.6, 0.95, 29],
    [49.4, 0.95, 29], [48.2, 0.95, 29], [47, 0.95, 29], [45.8, 0.95, 29], [44.61, 1.06, 28.94], [43.45, 1.39, 28.87],
    [42.38, 1.92, 28.81], [41.42, 2.65, 28.74], [40.61, 3.53, 28.68], [39.98, 4.55, 28.61], [39.55, 5.67, 28.55], [39.33, 6.85, 28.48],
    [39.33, 8.05, 28.42], [39.55, 9.23, 28.35], [39.98, 10.35, 28.29], [40.61, 11.37, 28.22], [41.42, 12.25, 28.16], [42.38, 12.98, 28.09],
    [43.45, 13.51, 28.03], [44.61, 13.84, 27.96], [45.8, 13.95, 27.9], [46.99, 13.84, 27.84], [48.15, 13.51, 27.77], [49.22, 12.98, 27.71],
    [50.18, 12.25, 27.64], [50.99, 11.37, 27.58], [51.62, 10.35, 27.51], [52.05, 9.23, 27.45], [52.27, 8.05, 27.38], [52.27, 6.85, 27.32],
    [52.05, 5.67, 27.25], [51.62, 4.55, 27.19], [50.99, 3.53, 27.12], [50.18, 2.65, 27.06], [49.22, 1.92, 26.99], [48.15, 1.39, 26.93],
    [46.99, 1.06, 26.86], [45.8, 0.95, 26.8], [44.8, 0.95, 26.8], [43.8, 0.95, 26.8], [42.8, 0.95, 26.8], [41.61, 1.06, 26.74],
    [40.45, 1.39, 26.67], [39.38, 1.92, 26.61], [38.42, 2.65, 26.54], [37.61, 3.53, 26.48], [36.98, 4.55, 26.41], [36.55, 5.67, 26.35],
    [36.33, 6.85, 26.28], [36.33, 8.05, 26.22], [36.55, 9.23, 26.15], [36.98, 10.35, 26.09], [37.61, 11.37, 26.02], [38.42, 12.25, 25.96],
    [39.38, 12.98, 25.89], [40.45, 13.51, 25.83], [41.61, 13.84, 25.76], [42.8, 13.95, 25.7], [43.99, 13.84, 25.64], [45.15, 13.51, 25.57],
    [46.22, 12.98, 25.51], [47.18, 12.25, 25.44], [47.99, 11.37, 25.38], [48.62, 10.35, 25.31], [49.05, 9.23, 25.25], [49.27, 8.05, 25.18],
    [49.27, 6.85, 25.12], [49.05, 5.67, 25.05], [48.62, 4.55, 24.99], [47.99, 3.53, 24.92], [47.18, 2.65, 24.86], [46.22, 1.92, 24.79],
    [45.15, 1.39, 24.73], [43.99, 1.06, 24.66], [42.8, 0.95, 24.6], [41.55, 0.95, 24.6], [40.3, 0.95, 24.6], [39.05, 0.95, 24.6],
    [37.8, 0.95, 24.6], [36.62, 0.95, 24.44], [35.53, 0.95, 23.99], [34.58, 0.95, 23.27], [33.86, 0.95, 22.33], [33.41, 0.95, 21.23],
    [33.25, 0.95, 20.05], [33.41, 0.95, 18.87], [33.86, 0.95, 17.78], [34.58, 0.95, 16.83], [35.53, 0.95, 16.11], [36.62, 0.95, 15.66],
    [37.8, 0.95, 15.5], [38.93, 0.95, 15.5], [40.05, 0.95, 15.5], [41.18, 0.95, 15.5], [42.3, 0.95, 15.5], [43.43, 0.95, 15.5],
    [44.55, 0.95, 15.5], [45.68, 0.95, 15.5]
  ];
  // the trim brakes: [from, to] in (x, z) and the speed they hold (m/s): before the loops (their entry speed), then the water brake
  var PK_BARON_TRIM = [[[50.6, 29], [47.4, 29], 17.2], [[41.4, 24.6], [38.6, 24.6], 7.5]];
  function pkBuildBaron(p) {
    var th = PK_THEME.baron, i;
    var g = new THREE.Group(); scene.add(g);
    var curve = pkCoCurve(PK_BARON_PTS), len = curve.getLength(), uP = pkCoUAt(curve, 56.8, 15.5);
    var opt = { trim: PK_BARON_TRIM.map(function (t) { return [pkCoUAt(curve, t[0][0], t[0][1]), pkCoUAt(curve, t[1][0], t[1][1]), t[2]]; }) };
    var F = pkCoFrames(curve, 540, pkCoProfile(curve, len, uP, opt), uP);
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
      skip: function (x, z) { return (x > 45.5 && x < 66 && z > 14.3 && z < 20) || (x > 50.5 && x < 59.8 && z > 27.2 && z < 30.8); }   // the station and the splash basin: no legs
    });
    pkCoPlan(E, opt);
    // the splash basin under the second drop: a stone rim, the water, and rocks along the fence side
    var splash = { x: 55.2, z: 29.0, u: pkCoUAt(curve, 55.2, 29.0) };
    [[55.2, 27.4, 9.2, 0.5], [55.2, 30.6, 9.2, 0.5], [50.8, 29.0, 0.5, 3.2], [59.6, 29.0, 0.5, 3.2]].forEach(function (w) {
      box(w[2], 0.75, w[3], pkMatStone(), w[0], 0.37, w[1], g);
    });
    var bwater = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 2.8), pkMats().water);
    bwater.rotation.x = -Math.PI / 2; bwater.position.set(splash.x, 0.5, splash.z); g.add(bwater);
    for (var sb = 0; sb < 5; sb++) pkBoulder(52.4 + sb * 1.5, 26.4 + randf(-0.2, 0.2), randf(0.6, 1.0), g);   // the rocks go on the station side of the basin: the south side is the hall's wall
    E.splash = splash;
    // the tunnel mouth: a stone ring round the track, a dark bore, and the rockery heaped over it
    var uT = pkCoUAt(curve, 39.6, 15.5);   // the run home east: the ring stands here, the rock heaped on east of it
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
  // fence, laid from arcs (tools/scratch/tracks/wildhunt.js). Out of the lodge it turns back on itself and takes the long
  // chain lift west, right behind the station, to 28 m; it sweeps round the west end on the crest, dives the first drop east
  // along the north fence, climbs into a high turnaround at the east end, comes home west through the middle over a
  // camelback, takes a slow turn at the west end (a trim brake holds it to 9 m/s) and brakes east along the station line
  // into the lodge. It stands in a pine wood, on braced twin columns, not on poles.
  var PK_HUNT_PTS = [
    [-6, 1, -84.5], [-4.82, 1, -84.5], [-3.65, 1, -84.5], [-2.47, 1, -84.5], [-1.29, 1, -84.5], [-0.12, 1, -84.5],
    [1.06, 1, -84.5], [2.24, 1, -84.5], [3.41, 1, -84.5], [4.59, 1, -84.5], [5.76, 1, -84.5], [6.94, 1, -84.5],
    [8.12, 1, -84.5], [9.29, 1, -84.5], [10.47, 1, -84.5], [11.65, 1, -84.5], [12.82, 1, -84.5], [14, 1, -84.5],
    [15.16, 1, -84.68], [16.2, 1, -85.22], [17.03, 1, -86.05], [17.57, 1, -87.09], [17.75, 1, -88.25], [17.57, 1, -89.41],
    [17.03, 1, -90.45], [16.2, 1, -91.28], [15.16, 1, -91.82], [14, 1, -92], [12.8, 1.05, -92], [11.59, 1.21, -92],
    [10.39, 1.48, -92], [9.18, 1.85, -92], [7.98, 2.33, -92], [6.78, 2.92, -92], [5.57, 3.54, -92], [4.37, 4.17, -92],
    [3.16, 4.79, -92], [1.96, 5.42, -92], [0.76, 6.05, -92], [-0.45, 6.67, -92], [-1.65, 7.3, -92], [-2.86, 7.93, -92],
    [-4.06, 8.55, -92], [-5.27, 9.18, -92], [-6.47, 9.8, -92], [-7.67, 10.43, -92], [-8.88, 11.06, -92], [-10.08, 11.68, -92],
    [-11.29, 12.31, -92], [-12.49, 12.93, -92], [-13.69, 13.56, -92], [-14.9, 14.19, -92], [-16.1, 14.81, -92], [-17.31, 15.44, -92],
    [-18.51, 16.07, -92], [-19.71, 16.69, -92], [-20.92, 17.32, -92], [-22.12, 17.94, -92], [-23.33, 18.57, -92], [-24.53, 19.2, -92],
    [-25.73, 19.82, -92], [-26.94, 20.45, -92], [-28.14, 21.07, -92], [-29.35, 21.7, -92], [-30.55, 22.33, -92], [-31.76, 22.95, -92],
    [-32.96, 23.58, -92], [-34.16, 24.21, -92], [-35.37, 24.83, -92], [-36.57, 25.46, -92], [-37.78, 26.08, -92], [-38.98, 26.67, -92],
    [-40.18, 27.15, -92], [-41.39, 27.52, -92], [-42.59, 27.79, -92], [-43.8, 27.95, -92], [-45, 28, -92], [-46.21, 28, -92.07],
    [-47.39, 27.98, -92.29], [-48.55, 27.96, -92.65], [-49.65, 27.94, -93.15], [-50.68, 27.9, -93.77], [-51.63, 27.86, -94.51], [-52.49, 27.82, -95.37],
    [-53.23, 27.77, -96.32], [-53.85, 27.72, -97.35], [-54.35, 27.67, -98.45], [-54.71, 27.61, -99.61], [-54.93, 27.56, -100.79], [-55, 27.5, -102],
    [-54.93, 27.44, -103.21], [-54.71, 27.39, -104.39], [-54.35, 27.33, -105.55], [-53.85, 27.28, -106.65], [-53.23, 27.23, -107.68], [-52.49, 27.18, -108.63],
    [-51.63, 27.14, -109.49], [-50.68, 27.1, -110.23], [-49.65, 27.06, -110.85], [-48.55, 27.04, -111.35], [-47.39, 27.02, -111.71], [-46.21, 27, -111.93],
    [-45, 27, -112], [-43.81, 26.96, -112], [-42.61, 26.85, -112], [-41.42, 26.67, -112], [-40.22, 26.42, -112], [-39.03, 26.11, -112],
    [-37.83, 25.74, -112], [-36.64, 25.32, -112], [-35.44, 24.85, -112], [-34.25, 24.34, -112], [-33.06, 23.79, -112], [-31.86, 23.21, -112],
    [-30.67, 22.59, -112], [-29.47, 21.95, -112], [-28.28, 21.29, -112], [-27.08, 20.61, -112], [-25.89, 19.91, -112], [-24.69, 19.21, -112],
    [-23.5, 18.5, -112], [-22.31, 17.79, -112], [-21.11, 17.09, -112], [-19.92, 16.39, -112], [-18.72, 15.71, -112], [-17.53, 15.05, -112],
    [-16.33, 14.41, -112], [-15.14, 13.79, -112], [-13.94, 13.21, -112], [-12.75, 12.66, -112], [-11.56, 12.15, -112], [-10.36, 11.68, -112],
    [-9.17, 11.26, -112], [-7.97, 10.89, -112], [-6.78, 10.58, -112], [-5.58, 10.33, -112], [-4.39, 10.15, -112], [-3.19, 10.04, -112],
    [-2, 10, -112], [-0.83, 10.09, -112], [0.33, 10.34, -112], [1.5, 10.74, -112], [2.67, 11.26, -112], [3.83, 11.89, -112],
    [5, 12.59, -112], [6.17, 13.36, -112], [7.33, 14.17, -112], [8.5, 15, -112], [9.67, 15.83, -112], [10.83, 16.64, -112],
    [12, 17.41, -112], [13.17, 18.11, -112], [14.33, 18.74, -112], [15.5, 19.26, -112], [16.67, 19.66, -112], [17.83, 19.91, -112],
    [19, 20, -112], [20.17, 19.99, -111.88], [21.3, 19.96, -111.54], [22.33, 19.91, -110.99], [23.24, 19.84, -110.24], [23.99, 19.77, -109.33],
    [24.54, 19.68, -108.3], [24.88, 19.59, -107.17], [25, 19.5, -106], [24.88, 19.41, -104.83], [24.54, 19.32, -103.7], [23.99, 19.23, -102.67],
    [23.24, 19.16, -101.76], [22.33, 19.09, -101.01], [21.3, 19.04, -100.46], [20.17, 19.01, -100.12], [19, 19, -100], [17.78, 18.92, -100],
    [16.57, 18.68, -100], [15.35, 18.3, -100], [14.13, 17.8, -100], [12.91, 17.18, -100], [11.7, 16.47, -100], [10.48, 15.68, -100],
    [9.26, 14.82, -100], [8.04, 13.91, -100], [6.83, 12.96, -100], [5.61, 11.99, -100], [4.39, 11.01, -100], [3.17, 10.04, -100],
    [1.96, 9.09, -100], [0.74, 8.18, -100], [-0.48, 7.32, -100], [-1.7, 6.53, -100], [-2.91, 5.82, -100], [-4.13, 5.2, -100],
    [-5.35, 4.7, -100], [-6.57, 4.32, -100], [-7.78, 4.08, -100], [-9, 4, -100], [-10.19, 4.05, -100], [-11.37, 4.19, -100],
    [-12.56, 4.42, -100], [-13.75, 4.7, -100], [-14.94, 5.04, -100], [-16.12, 5.42, -100], [-17.31, 5.83, -100], [-18.5, 6.25, -100],
    [-19.69, 6.67, -100], [-20.87, 7.08, -100], [-22.06, 7.46, -100], [-23.25, 7.8, -100], [-24.44, 8.08, -100], [-25.62, 8.31, -100],
    [-26.81, 8.45, -100], [-28, 8.5, -100], [-29.19, 8.44, -100], [-30.37, 8.26, -100], [-31.56, 7.99, -100], [-32.75, 7.64, -100],
    [-33.94, 7.22, -100], [-35.12, 6.76, -100], [-36.31, 6.26, -100], [-37.5, 5.75, -100], [-38.69, 5.24, -100], [-39.87, 4.74, -100],
    [-41.06, 4.28, -100], [-42.25, 3.86, -100], [-43.44, 3.51, -100], [-44.62, 3.24, -100], [-45.81, 3.06, -100], [-47, 3, -100],
    [-48.21, 3, -99.9], [-49.39, 3, -99.62], [-50.52, 3, -99.16], [-51.56, 3, -98.52], [-52.48, 3, -97.73], [-53.27, 3, -96.81],
    [-53.91, 3, -95.77], [-54.37, 3, -94.64], [-54.65, 3, -93.46], [-54.75, 3, -92.25], [-54.65, 3, -91.04], [-54.37, 3, -89.86],
    [-53.91, 3, -88.73], [-53.27, 3, -87.69], [-52.48, 3, -86.77], [-51.56, 3, -85.98], [-50.52, 3, -85.34], [-49.39, 3, -84.88],
    [-48.21, 3, -84.6], [-47, 3, -84.5], [-45.79, 2.99, -84.5], [-44.59, 2.98, -84.5], [-43.38, 2.96, -84.5], [-42.18, 2.92, -84.5],
    [-40.97, 2.88, -84.5], [-39.76, 2.84, -84.5], [-38.56, 2.78, -84.5], [-37.35, 2.72, -84.5], [-36.15, 2.65, -84.5], [-34.94, 2.58, -84.5],
    [-33.74, 2.51, -84.5], [-32.53, 2.43, -84.5], [-31.32, 2.35, -84.5], [-30.12, 2.26, -84.5], [-28.91, 2.18, -84.5], [-27.71, 2.09, -84.5],
    [-26.5, 2, -84.5], [-25.29, 1.91, -84.5], [-24.09, 1.82, -84.5], [-22.88, 1.74, -84.5], [-21.68, 1.65, -84.5], [-20.47, 1.57, -84.5],
    [-19.26, 1.49, -84.5], [-18.06, 1.42, -84.5], [-16.85, 1.35, -84.5], [-15.65, 1.28, -84.5], [-14.44, 1.22, -84.5], [-13.24, 1.16, -84.5],
    [-12.03, 1.12, -84.5], [-10.82, 1.08, -84.5], [-9.62, 1.04, -84.5], [-8.41, 1.02, -84.5], [-7.21, 1.01, -84.5]
  ];
  var PK_HUNT_TRIM = [[[-39, -100], [-46, -100], 9]];   // the trim brake before the slow west turn: from, to (x, z), and the speed it holds (m/s)
  PK_KEEP.push([-48, -100, 13], [-50, -90, 9], [-24, -102, 12], [-6, -104, 14], [16, -104, 12]);
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
    // (part 12 lays it with the rest of the paving: pkPaveCore)
    var curve = pkCoCurve(PK_HUNT_PTS), len = curve.getLength(), uP = pkCoUAt(curve, 4, -84.5);
    var opt = { trim: PK_HUNT_TRIM.map(function (t) { return [pkCoUAt(curve, t[0][0], t[0][1]), pkCoUAt(curve, t[1][0], t[1][1]), t[2]]; }) };
    var P0 = pkCoProfile(curve, len, uP, opt);
    var F = pkCoFrames(curve, 1000, P0, uP);
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
    var supMat = std({ color: 0x626872, roughness: 0.55, metalness: 0.25 });   // was 0x33363c: read as flat black from any distance
    var inStation = function (x, z) { return z > -87.2 && x > -8.5 && x < 16.5; };   // nothing stands through the station and its platform
    pkCoTrackBuild(g, E, { spineMat: spineMat, supMat: supMat, tieMat: std({ color: 0x2b2434, roughness: 0.75 }), skip: function () { return true; } });
    var feet = pkCoBents(g, E, { mat: supMat, every: 6.4, skip: inStation });
    pkCoPlan(E, opt);
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
      var tx = randf(-51, 21), tz = randf(-116, -88), ts = randf(0.75, 1.25);
      if (inStation(tx, tz + 1.5) || near(tx, tz, 3.4, 15) || footNear(tx, tz)) continue;
      pkConifer(tx, tz, ts, g, planted * 7 + 3); planted++;
    }
    for (i = 0, tries = 0; i < 16 && tries < 300; tries++) {
      var bx = randf(-50, 21), bz = randf(-115, -89);
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
  // the Serpent's line fills the strip north of its station (x 38 to 69, z -113 to -70): no tree or lamp goes in it, and the open middle is the serpent's own
  PK_KEEP.push([47, -105, 11], [62, -104, 11], [53, -90, 19]);
  // Baron's Drop runs west across the lawn from its station (x 33 to 70, z 11 to 31): nothing is planted or hung in it
  PK_KEEP.push([39, 20, 9], [48, 25, 9], [60, 23, 9]);
  // the kids' area: The Little Meadow, on the north half of the east strip (it stood on the west lawn, each ride against
  // the next). From the north: the Puffin Line, the Little Roundabout, Wobbly Pots and the acorn playhouse, each a good
  // ten metres from the next, their lines running west to the East Parade
  PK_PLOTS.push(
    { id: 'kround', name: 'Little Roundabout', x: 150, z: -79, r: 6, q: [139, -79], level: 17, pad: 1.1 },
    { id: 'kpots', name: 'Wobbly Pots', x: 150, z: -54, r: 5.5, q: [139, -54], level: 18, pad: 1.1 },
    { id: 'kpuffin', name: 'Puffin Line', x: 150, z: -106, r: 7.5, q: [142.5, -101.5], level: 19, pad: 1.05 }
  );
  var PK_PLAYHOUSE = { x: 147, z: -29 };
  PK_THEME.kround = { a: 0xb8452f, b: 0xf4f1e6, ground: 0x8fae6a, name: 'Little Roundabout' };
  PK_THEME.kpots = { a: 0x2f7f8f, b: 0xf0c04a, ground: 0x8fae6a, name: 'Wobbly Pots' };
  PK_THEME.kpuffin = { a: 0x8a6a4a, b: 0xf0c04a, ground: 0x9ab07a, name: 'Puffin Line' };
  PK_THEME.serpent = { a: 0x2f8f6f, b: 0xf0c04a, ground: 0x9aab8c, name: 'The Serpent', noBunting: true, noDecor: true };
  PK_THEME.baron = { a: 0x8a3b2c, b: 0xd8c9a8, ground: 0xa89a8a, name: "Baron's Drop", noBunting: true, noDecor: true };
  PK_THEME.wildhunt = { a: 0x3a2a4a, b: 0xc9a227, ground: 0x5a5548, name: 'The Wild Hunt', noBunting: true, noDecor: true };
  // the spurs from the North Promenade up to the queues, and the kids' lane from the Fairground avenue down into the kids'
  // garden, west of the carousel, past the three little rides' gateways
  // (their streets are in the one table of routes, part 12)
  PK_KEEP.push([35.5, -62.5, 5.5], [42.5, -65.5, 5], [PK_PLAYHOUSE.x, PK_PLAYHOUSE.z, 6.5]);

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
  // (tison, 2026-11-15: "let me move each booth myself in the editor"): the cabin is a world item now, like the kit booth: Ctrl and the left
  // button drag it, its solids go with it, and its walkable floor and the operator's places follow (pkCabinSync). It moves, it does not turn.
  var PK_CABINS = [];
  function pkCabinBuild(g, a, o) {
    var n0 = PK_FLOOR_RECTS.length, cg = null;
    worldItem('booth', function () { cg = new THREE.Group(); parentOf(null).add(cg); cg.userData.movesOnly = true; pkCabinBuildInner(cg, a, o); });
    var rs = PK_FLOOR_RECTS.slice(n0), p0 = new THREE.Vector3();
    cg.updateWorldMatrix(true, false); cg.getWorldPosition(p0);
    PK_CABINS.push({ a: a, g: cg, p0: p0, rects: rs, base: rs.map(function (r) { return { x0: r.x0, x1: r.x1, z0: r.z0, z1: r.z1 }; }), dx: 0, dz: 0 });
  }
  function pkCabinSync() {
    var v = new THREE.Vector3();
    PK_CABINS.forEach(function (c) {
      c.g.updateWorldMatrix(true, false); c.g.getWorldPosition(v);
      var dx = v.x - c.p0.x, dz = v.z - c.p0.z;
      if (Math.abs(dx - c.dx) < 1e-4 && Math.abs(dz - c.dz) < 1e-4) return;
      c.dx = dx; c.dz = dz;
      c.rects.forEach(function (r, i) { var b = c.base[i]; r.x0 = b.x0 + dx; r.x1 = b.x1 + dx; r.z0 = b.z0 + dz; r.z1 = b.z1 + dz; });
      c.a.opSpots = undefined;   // the operator's places are read again from the moved door, clock and desk
    });
  }
  hook('boot', pkCabinSync);
  pkCtlLive({ tick: function () { PK_CAB_T = (PK_CAB_T || 0) - 1; if (PK_CAB_T <= 0) { PK_CAB_T = 60; pkCabinSync(); } } });
  var PK_CAB_T = 0;
  function pkCabinBuildInner(g, a, o) {
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
        pkScreenBoard(ctx, sc, a, pkCtl(a), { room: true, cycle: true, hint: 'Window: the track. Back panel: the board.' });   // part 63
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
    // the line was drawn on the west lawn round (-60, 40) with its platform's line end to the east. It is laid from those
    // same numbers, carried to the plot and flipped east-west, so the line end faces the Parade
    var MX = function (x) { return p.x - (x + 60); }, MZ = function (z) { return p.z + (z - 40); };
    // a straight station along the platform, a round turn north, a little hill with a tunnel along the north lane, a round
    // turn at the west end and home. Laid offline (tools/scratch/tracks/puffin.js), radius 4.2 m, 52 m, in world coordinates
    var pts = [
      [145.2, 0.4, -102.4], [146.39, 0.4, -102.4], [147.57, 0.4, -102.4], [148.76, 0.4, -102.4], [149.95, 0.4, -102.4], [151.14, 0.4, -102.4],
      [152.32, 0.4, -102.4], [153.51, 0.4, -102.4], [154.7, 0.4, -102.4], [156, 0.4, -102.61], [157.17, 0.4, -103.2], [158.1, 0.4, -104.13],
      [158.69, 0.4, -105.3], [158.9, 0.4, -106.6], [158.9, 0.4, -107.67], [158.9, 0.4, -108.73], [158.9, 0.4, -109.8], [158.69, 0.4, -111.1],
      [158.1, 0.4, -112.27], [157.17, 0.4, -113.2], [156, 0.4, -113.79], [154.7, 0.4, -114], [153.45, 0.54, -114], [152.2, 0.85, -114],
      [150.95, 1.16, -114], [149.7, 1.3, -114], [148.58, 1.16, -114], [147.45, 0.85, -114], [146.33, 0.54, -114], [145.2, 0.4, -114],
      [143.9, 0.4, -113.79], [142.73, 0.4, -113.2], [141.8, 0.4, -112.27], [141.21, 0.4, -111.1], [141, 0.4, -109.8], [141, 0.4, -108.73],
      [141, 0.4, -107.67], [141, 0.4, -106.6], [141.21, 0.4, -105.3], [141.8, 0.4, -104.13], [142.73, 0.4, -103.2], [143.9, 0.4, -102.61]
    ];
    var curve = pkCoCurve(pts), len = curve.getLength(), uP = pkCoUAt(curve, MX(-61.2), MZ(43.6));
    var F = pkCoFrames(curve, 200, pkCoProfile(curve, len, uP, { pedal: 1.8 }), uP);
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
    pkCoPlatform(g, MX(-56.5), MX(-63.5), MZ(43.9), MZ(45.3), th, 0.4);
    // a row of planted rocks down the middle of the loop, clear of the track all round
    [147.5, 149.5, 151.5, 153.5].forEach(function (rx) {
      var rz = -108.2;
      pkRoundCyl(0.34, 0.42, std({ color: 0x7a6a52, roughness: 0.85 }), rx, 0.21, rz, g, 12);
      sphere(0.3, std({ color: 0x4d7a3a, roughness: 0.95 }), rx, 0.5, rz, g);
    });
    // the little tunnel under the hill's west slope: two stone walls, a turfed roof and a mound over it
    var tw = std({ color: 0x7a6a52, roughness: 0.9 }), turf = std({ color: 0x4d7a3a, roughness: 0.95 });
    [-1, 1].forEach(function (sd) { box(2.6, 2.7, 0.35, tw, 147.3, 1.35, -114.0 + sd * 0.95, g); });
    box(2.8, 0.3, 2.5, tw, 147.3, 2.85, -114.0, g);
    var mound = sphere(1.0, turf, 147.3, 2.7, -114.0, g); mound.scale.set(1.5, 0.7, 1.3);
    var a = pkAttr({
      id: p.id, name: p.name, x: p.x, z: p.z, qx: p.q[0], qz: p.q[1], g: g, seats: seats,
      board: 4, run: E.run, unload: 5, extra: E, tickRun: function (at) { pkCoRun(at); }
    });
    var C = pkCtl(a);
    E.a = a;
    pkCoGates(g, [MX(-59.0), MX(-61.2)], MZ(43.95), C);
    E.cars.forEach(function (c) { C.barObjs.push(function (bb) { c.bar.rotation.x = -1.35 * (1 - bb); }); });
    pkCoPlace(E, E.uPark);
    return a;
  }
  // the acorn playhouse: a sandpit, a little tower and a slide, for the ones too small to queue
  function pkBuildPlayhouse() {
    var g = new THREE.Group(); g.position.set(PK_PLAYHOUSE.x, 0, PK_PLAYHOUSE.z); scene.add(g);
    if (typeof PK_PLAY !== 'undefined') PK_PLAY.g = g;   // part 54 measures its distance to the rides
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
