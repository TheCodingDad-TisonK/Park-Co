//@ Park Co, part 54: the clearances - how much ground every ride really stands on, and how far it is from the next one.
  // ── Why ──────────────────────────────────────────────────────────
  // The park grew ride by ride, and each new one was fitted into whatever was left: a booth four metres from the abbey's
  // wall, a queue across another ride's fence. The rule now is simple and it is measured, not promised: between any two
  // rides there are at least PK_CLEAR.ride metres, fence to fence, and no ride stands within PK_CLEAR.pier metres of a pier
  // of the Skyline's viaduct. The smoke test asks pkRideGaps and pkPierGaps and fails on anything they return.
  //
  // What a ride stands on (its footprint) is read off what was actually built, as boxes on the ground:
  //   - its own group (everything taller than a kerb: a painted pad or a lawn is not a ride),
  //   - its station fence (the ring round a flat ride),
  //   - its queue lane,
  //   - its operator booth,
  //   - anything it declares itself (a.foot, for a ride that is not one group: the Arena).
  // The Skyline is not on the list: she runs on the viaduct, and the rule for her is the pier rule.
  //
  // A few things stand closer than the rule and are named here, not hidden: they are the big builds along the west and
  // east edges that cannot be shifted without being rebuilt, and each waits for its own rework.
  //   - Dragon Ride and The Mountain King: 5.3 m between the racer's south turns and the King's outdoor run, with the
  //     racer's line in the gap. The racer also overruns the north fence and the railway; both go with its rebuild.
  //   - The Dance Ride and the Arena: the abbey's north-west corner and the grandstand's south-east corner (2.8 m).
  //   - The Dance Ride and the coaster: 7.9 m across the Dark Woods street, a hand short of the rule.
  //   - Dream Flight and the Arena: 4.7 m between the palace's north wall and the city's south wall.
  //   - The viaduct was threaded between those two, so its piers stand nearer to them than the pier rule allows.
  var PK_CLEAR = { ride: 8, pier: 6, feet: null, waive: { pairs: [['joris', 'mountain'], ['danse', 'theater'], ['danse', 'coaster'], ['droom', 'theater']], piers: ['danse', 'theater'] } };
  var PK_PLAY = { g: null };   // the acorn playhouse (part 16 sets it): not a ride with a queue, but it keeps the same distance
  function pkFootBox(o) {
    // the ground box of everything under o that stands taller than a kerb
    var b = null, v = new THREE.Vector3();
    o.updateMatrixWorld(true);
    o.traverse(function (m) {
      if (!m.isMesh || !m.geometry || m.userData.pkStatic) return;
      var g = m.geometry; if (!g.boundingBox) g.computeBoundingBox();
      var bb = g.boundingBox; if (!bb || bb.isEmpty()) return;
      var pts = [], top = -1e9, i, j, k;
      for (i = 0; i < 2; i++) for (j = 0; j < 2; j++) for (k = 0; k < 2; k++) {
        v.set(i ? bb.max.x : bb.min.x, j ? bb.max.y : bb.min.y, k ? bb.max.z : bb.min.z).applyMatrix4(m.matrixWorld);
        pts.push([v.x, v.z]); if (v.y > top) top = v.y;
      }
      if (top < 0.3) return;
      if (!b) b = [1e9, -1e9, 1e9, -1e9];
      for (i = 0; i < pts.length; i++) { b[0] = Math.min(b[0], pts[i][0]); b[1] = Math.max(b[1], pts[i][0]); b[2] = Math.min(b[2], pts[i][1]); b[3] = Math.max(b[3], pts[i][1]); }
    });
    return b;
  }
  // every ride's footprint: [{ id, name, rects: [[x0, x1, z0, z1], ...] }]. Measured once, with the bake lifted (the bake
  // takes a ride's static meshes out of its group), and kept: nothing here moves after the park is built.
  function pkRideFeet(again) {
    if (PK_CLEAR.feet && !again) return PK_CLEAR.feet;
    var wasBaked = typeof baked !== 'undefined' && baked.meshes && baked.meshes.length;
    if (wasBaked && typeof unbakeStatic === 'function') unbakeStatic();
    var out = [];
    var add = function (id, name, list) { var rects = []; list.forEach(function (r) { if (r) rects.push(r); }); if (rects.length) out.push({ id: id, name: name, rects: rects }); };
    PK.attractions.forEach(function (a) {
      if (a.id === 'skyline') return;
      var list = [];
      var body = a.g ? pkFootBox(a.g) : null;
      if (a.station) {
        // a flat ride inside its ring fence: the ring is the footprint, as the circle it is (a round ride boxed as a square
        // would claim four corners of ground it does not stand on)
        var sr = a.station.r;
        list.push({ c: [a.plot.x, a.plot.z, sr] });
        if (body && (body[0] < a.plot.x - sr - 0.5 || body[1] > a.plot.x + sr + 0.5 || body[2] < a.plot.z - sr - 0.5 || body[3] > a.plot.z + sr + 0.5)) list.push(body);
      } else if (body) list.push(body);
      PK.lanes.forEach(function (l) { if (l.a === a) list.push([l.x0, l.x1, l.zA, l.zB]); });
      if (a.boothG || a.booth) list.push(pkFootBox(a.boothG || a.booth));
      if (a.foot) a.foot.forEach(function (r) { list.push(r); });
      add(a.id, a.name, list);
    });
    if (PK.coasterG) add('coaster', 'The coaster', [pkFootBox(PK.coasterG)]);
    if (PK_PLAY.g) add('playhouse', 'The acorn playhouse', [pkFootBox(PK_PLAY.g)]);
    if (wasBaked && typeof bakeStatic === 'function') bakeStatic();
    PK_CLEAR.feet = out;
    return out;
  }
  // the gap between two shapes: a box [x0, x1, z0, z1] or a circle { c: [x, z, r] }
  function pkRectGap(a, b) {
    if (a.c && b.c) return Math.max(0, Math.hypot(a.c[0] - b.c[0], a.c[1] - b.c[1]) - a.c[2] - b.c[2]);
    if (a.c || b.c) {
      var C = a.c || b.c, R = a.c ? b : a, nx = Math.max(R[0], Math.min(C[0], R[1])), nz = Math.max(R[2], Math.min(C[1], R[3]));
      return Math.max(0, Math.hypot(C[0] - nx, C[1] - nz) - C[2]);
    }
    var dx = Math.max(0, a[0] - b[1], b[0] - a[1]), dz = Math.max(0, a[2] - b[3], b[2] - a[3]);
    return Math.sqrt(dx * dx + dz * dz);
  }
  function pkFootGap(A, B) {
    var best = 1e9;
    for (var i = 0; i < A.rects.length; i++) for (var j = 0; j < B.rects.length; j++) best = Math.min(best, pkRectGap(A.rects[i], B.rects[j]));
    return best;
  }
  // every pair of rides that stand closer than min (PK_CLEAR.ride): [{ a, b, gap }]. An empty list is the rule kept.
  function pkRideGaps(min, all) {   // all: the waived pairs too, marked
    var F = pkRideFeet(), bad = [], lim = min === undefined ? PK_CLEAR.ride : min;
    for (var i = 0; i < F.length; i++) for (var j = i + 1; j < F.length; j++) {
      var g = pkFootGap(F[i], F[j]);
      if (g >= lim) continue;
      var w = PK_CLEAR.waive.pairs.some(function (p) { return (p[0] === F[i].id && p[1] === F[j].id) || (p[1] === F[i].id && p[0] === F[j].id); });
      if (w && !all) continue;
      bad.push({ a: F[i].id, b: F[j].id, gap: Math.round(g * 10) / 10, waived: w });
    }
    return bad;
  }
  // every ride that stands closer than min (PK_CLEAR.pier) to a pier of the viaduct: [{ a, pier: [x, z], gap }]
  function pkPierGaps(min, all) {
    var F = pkRideFeet(), bad = [], lim = min === undefined ? PK_CLEAR.pier : min;
    var P = (typeof PK_XP !== 'undefined' && PK_XP.pierPts) || [];
    P.forEach(function (p) {
      var box = [p[0] - 1.2, p[0] + 1.2, p[1] - 1.2, p[1] + 1.2];
      F.forEach(function (f) {
        var best = 1e9; f.rects.forEach(function (r) { best = Math.min(best, pkRectGap(r, box)); });
        var w = PK_CLEAR.waive.piers.indexOf(f.id) >= 0;
        if (best < lim && (all || !w)) bad.push({ waived: w, a: f.id, pier: [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10], gap: Math.round(best * 10) / 10 });
      });
    });
    return bad;
  }
  var _pkClrPrevT = GAME.T;
  GAME.T = function () {
    var t = _pkClrPrevT();
    t.PK_CLEAR = PK_CLEAR; t.pkRideFeet = pkRideFeet; t.pkRideGaps = pkRideGaps; t.pkPierGaps = pkPierGaps; t.pkRectGap = pkRectGap;
    t.PK_PARK = PK_PARK; t.PK_ROUTES = PK_ROUTES; t.PK_PLOTS = PK_PLOTS;
    return t;
  };
