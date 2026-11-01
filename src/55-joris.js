//@ Park Co, part 55: Joris en de Draak - a twin-track wooden racing coaster on the east strip (The Dragon and The Firebird's old yards).
  // ── Why ──────────────────────────────────────────────────────────
  // Two wooden tracks (Water, blue, and Vuur, red) run side by side and race, in the spirit of Efteling's Joris en de Draak.
  // Both climb twin lift hills, drop, run a double out-and-back and come home through one shared station hall; the first
  // train home wins. The strip is long and narrow, so the out-and-back runs along world z (north) and the two tracks sit
  // side by side across world x (east). One pkAttr attraction holds both tracks so the shared station, dispatch and winner
  // stay one coupled unit.
  //
  // Plan view of ONE track (Vuur is its exact mirror across the centre line). lx = north, d = distance from the centre line:
  //
  //   lane D1 (2.5)  station -> lift -> drop -> pass 1 north ----.
  //   lane D2 (8.5)  <- final pass south, down to the station    |  (big outer turn, R 9)
  //   lane D3 (14.5) pass 3 north ---.                           |
  //   lane D4 (20.5) pass 2 south <--|---------------------------'
  //                       south turn '
  //
  // No lane ever crosses another: the loop is a "W" whose last leg tucks back under the station through a small
  // south turn, so the train always enters the station heading north.
  var PK_JORIS = {
    name: 'Joris en de Draak', ax: 100, az: -1, qz: 1, a: 0x2f6fbf, b: 0xc8452a, spine: 0x8a6a4a, legs: 0x5a4028, ground: 0x8fa080, sign: '#f0c04a'
  };
  // local frame -> world: forward (local x) runs north (world -z), yard (local z) runs east (world +x)
  function pkJorisW(lx, lz) { return [PK_JORIS.ax + lz, PK_JORIS.az - lx]; }
  function pkJorisSm(x) { x = x < 0 ? 0 : (x > 1 ? 1 : x); return x * x * (3 - 2 * x); }
  // One track as a chain of straights (with optional smooth hills) and half-circle turns. Every piece starts exactly
  // where the last one ended, so the spline never has a jump to wobble around. yd < 0 is Water, yd > 0 is Vuur (mirror).
  function pkJorisPoints(yd) {
    var sg = yd < 0 ? -1 : 1, P = [], cx0 = 14, cd = 2.5, cy = 0.6;
    var D1 = 2.5, D2 = 8.5, D3 = 14.5, D4 = 20.5;
    function add(x, d, y) { P.push([x, y, sg * d]); cx0 = x; cd = d; cy = y; }
    // a straight from the current point to (x1, d1, y1); o.h/o.n add n sin^2 humps h high, o.ease smooths the height change
    function run(x1, d1, y1, o) {
      o = o || {};
      var x0 = cx0, d0 = cd, y0 = cy, dx = x1 - x0, dd = d1 - d0, dy = y1 - y0;
      var k = Math.max(2, Math.ceil(Math.sqrt(dx * dx + dd * dd + dy * dy) / 1.6));
      for (var i = 1; i <= k; i++) {
        var t = i / k, te = o.ease ? t * t * (3 - 2 * t) : t, s = Math.sin(Math.PI * (o.n || 1) * t);
        add(x0 + dx * t, d0 + dd * t, y0 + dy * te + (o.h ? o.h * s * s : 0));
      }
    }
    // a 180 degree turn from lane da to lane db around x = cx; north turns bulge to +x, south turns bulge to -x
    function arc(cx, da, db, y1, north) {
      var R = Math.abs(db - da) / 2, mid = (da + db) / 2, sg2 = db > da ? 1 : -1, y0 = cy, k = Math.ceil(Math.PI * R / 1.3);
      for (var i = 1; i <= k; i++) {
        var t = i / k, th = sg2 * (-Math.PI / 2 + Math.PI * t), lx = north ? cx + R * Math.cos(th) : cx - R * Math.cos(th);
        add(lx, mid + R * Math.sin(th), y0 + (y1 - y0) * t);
      }
    }
    // the station roll and the lift
    run(24, D1, 0.6);
    run(54, D1, 22);
    run(72, D1, 5, { ease: true });                    // the first drop
    // pass 1, north: two airtime hills
    run(94, D1, 5, { h: sg > 0 ? 5.5 : 6.5, n: 1 });
    run(116, D1, 5, { h: sg > 0 ? 7.5 : 6.5, n: 1 });
    run(123, D1, 6.5);
    arc(123, D1, D4, 6.5, true);                       // the big outer turn to the far lane
    // pass 2, south on the outer lane
    run(100, D4, 5, { h: sg > 0 ? 6.5 : 5, n: 1 });
    run(76, D4, 5, { h: sg > 0 ? 5.5 : 7, n: 1 });
    run(54, D4, 5, { h: sg > 0 ? 4.5 : 3.4, n: 2 });
    run(36, D4, 5, { h: sg > 0 ? 4.0 : 5.5, n: 1 });
    arc(36, D4, D3, 5, false);                         // the south turn, over to the third lane
    // pass 3, north
    run(60, D3, 5, { h: sg > 0 ? 7.0 : 6, n: 1 });
    run(84, D3, 5, { h: sg > 0 ? 5.5 : 7, n: 1 });
    run(106, D3, 5, { h: sg > 0 ? 4.8 : 3.6, n: 2 });
    run(123, D3, 6);
    arc(123, D3, D2, 6, true);                         // the small north turn
    // pass 4, south, then the brake run down beside the hall
    run(102, D2, 5, { h: sg > 0 ? 4.5 : 5.5, n: 1 });
    run(78, D2, 5, { h: sg > 0 ? 6.5 : 7.5, n: 1 });
    run(56, D2, 5, { h: sg > 0 ? 4.2 : 3.5, n: 2 });
    run(40, D2, 4.2, { h: sg > 0 ? 5.0 : 4, n: 1 });
    run(24, D2, 2.2);
    run(8, D2, 1.2);
    arc(8, D2, D1, 1.0, false);                        // tuck back under the station, now heading north again
    run(14, D1, 0.6);                                  // and roll into the station (this is also where the lap began)
    return P;
  }
  // ── Registering the plot and the street ─────────────────────────
  (function () {
    var q = [PK_JORIS.ax - 5.2, PK_JORIS.qz];
    PK_PLOTS.push({ id: 'joris', name: PK_JORIS.name, x: PK_JORIS.ax + 15, z: PK_JORIS.qz, r: 26, q: q, qdx: -1, level: 20, pad: 0.02 });
    PK_THEME.joris = { a: PK_JORIS.a, b: PK_JORIS.b, ground: PK_JORIS.ground, name: PK_JORIS.name, noBunting: true, noDecor: true };
    PK_ROUTES.push([76, q[1], q[0] - 3.2, q[1], 3.2, 'coaster']);   // the spur from the East Walk to the line
  })();
  // ── Building the ride ───────────────────────────────────────────
  function pkBuildJoris(p) {
    var g = new THREE.Group(); scene.add(g);
    var wood = std({ color: PK_JORIS.spine, roughness: 0.5, metalness: 0.2 }), leg = std({ color: PK_JORIS.legs, roughness: 0.65, metalness: 0.15 });
    var tracks = [['water', -2.5, 0x2f6fbf], ['vuur', 2.5, 0xc8452a]];
    var subs = {}, seats = [];
    tracks.forEach(function (t) {
      var id = t[0], yd = t[1], col = t[2];
      var pts = pkJorisPoints(yd).map(function (q) { var w = pkJorisW(q[0], q[2]); return [w[0], q[1], w[1]]; });
      var curve = pkCoCurve(pts), len = curve.getLength();
      var park = pkJorisW(22, yd), uP = pkCoUAt(curve, park[0], park[1]);
      var F = pkCoFrames(curve, 1000, pkCoProfile(curve, len, uP, { rollIn: 12 }), uP, null);
      var E = { curve: curve, len: len, F: F, gap: 2.35, cars: [], uPark: uP, uOfF: [], run: Math.round(len / 7) };
      pkCoLevel(F, curve, E.uPark, 4 * 2.35 + 1.4, 1.4);
      for (var i = 0; i < 4; i++) { var car = pkCoCar(col); scene.add(car.g); E.cars.push(car); car.seats.forEach(function (s) { seats.push({ par: car.g, x: s.x, y: s.y, z: s.z, ry: 0, guest: null, track: id }); }); }
      pkCoTrackBuild(g, E, { spineMat: wood, supMat: leg, tieMat: std({ color: 0x4a3a28, roughness: 0.8 }), railMat: MAT.steelDark });
      pkCoPlan(E, { rollIn: 12 });
      pkCoPlace(E, E.uPark);
      subs[id] = E;
    });
    var run = Math.max(subs.water.run, subs.vuur.run);
    var a = pkAttr({
      id: 'joris', name: PK_JORIS.name, x: p.x, z: p.z, qx: p.q[0], qz: p.q[1], qdx: -1, g: g, seats: seats,
      board: 11, run: run, unload: 6, exit: [PK_JORIS.ax - 8, 3],
      extra: subs, tickRun: function (at2) { pkJorisRun(at2); },
      start: function (at2) { pkJorisStart(at2); }
    });
    subs.water.a = subs.vuur.a = a;
    subs.winner = null; subs.lag = 0; subs.winsWater = 0; subs.winsVuur = 0;
    // the fork: each guest picks Water or Vuur as they reach the front of the line and boards that track
    a.pickSeat = function (gu) {
      if (!gu.side) gu.side = Math.random() < 0.5 ? 'water' : 'vuur';
      var prefer = gu.side, fall = -1, i, s;
      for (i = 0; i < a.seats.length; i++) {
        s = a.seats[i];
        if (s.guest || s.player) continue;
        if (fall < 0) fall = i;
        if (s.track === prefer) return i;
      }
      return fall;
    };
    // the rider's way: down the line, into the lower hall at the station's south, up the Water or Vuur stair to the platform
    var HX = PK_JORIS.ax;
    var entry = { x: HX - 3.5, z: -7.5 };                       // west of the operator's stair, south of the hall
    var fork = { x: HX, z: -10.7 };                             // the split inside the lower hall
    var wB = { x: HX - 1.05, z: -10.7 }, wT = { x: HX - 1.05, z: -13 };
    var vB = { x: HX + 1.05, z: -10.7 }, vT = { x: HX + 1.05, z: -13 };
    a.seatPath = function (from, w) {
      var side = w.x < HX ? 'water' : 'vuur';
      var b = side === 'water' ? wB : vB, t = side === 'water' ? wT : vT;
      return route(from, entry).concat([fork, b, t], route(t, { x: w.x, z: w.z }));
    };
    // the station hall; it also hangs the banners, the FINISH sign and the two WINNAAR flags on its south face
    subs.fin = pkJorisStation(g, a);
    // the overhead control room: the operator's cabin tucked into the hall facade, glazed onto both tracks, reached by a stair
    var cx = PK_JORIS.ax;
    var K = { u0: cx - 3, u1: cx + 3, z0: -14.4, z1: -10.6, door: [-13.2, -12.3] };
    var n0 = g.children.length;
    pkCabinBuild(g, a, { s: 1, AX: 0, K: K, y: 3.5, trim: 0xfff2a8, band: PK_JORIS.b, name: PK_JORIS.name, sign: PK_JORIS.sign, H: 3.2 });
    pkJorisStripBase(g, n0, cx);                       // the kit's grey concrete plinth under the cabin goes; the timber gallery carries it
    // the walkable route: stair head at z -9, a landing across the hall front and along both cabin sides (the cabin door opens onto them)
    PK_FLOOR_RECTS.push({ axis: 'z', x0: cx - 2, x1: cx + 2, z0: -9.0, z1: -9.0, y: 3.62, ramp: 6.5 });
    PK_FLOOR_RECTS.push({ x0: cx - 4.4, x1: cx + 4.4, z0: -10.6, z1: -9.0, y: 3.62 });
    PK_FLOOR_RECTS.push({ x0: cx - 4.4, x1: cx - 3, z0: -14.4, z1: -10.6, y: 3.62 });
    PK_FLOOR_RECTS.push({ x0: cx + 3, x1: cx + 4.4, z0: -14.4, z1: -10.6, y: 3.62 });
    pkJorisStair(g, cx);
    pkJorisGallery(g, cx);
    // the lower hall: the split into the two coloured stairs, and the deck and stair heights the riders walk
    pkJorisLowerHall(g, HX);
    // Edna lies in her swamp west of the lift, her head turned toward the passing trains
    subs.dragon = pkJorisDragon(g, PK_JORIS.ax - 16, PK_JORIS.az - 22);
    return a;
  }
  // hide whatever the cabin kit built as a grounded base under the cabin floor (its grey concrete plinth)
  function pkJorisStripBase(g, n0, cx) {
    g.updateMatrixWorld(true);
    for (var i = n0; i < g.children.length; i++) {
      g.children[i].traverse(function (o) {
        if (!o.isMesh) return;
        var b = new THREE.Box3().setFromObject(o);
        if (b.max.y <= 3.48 && b.min.x >= cx - 3.4 && b.max.x <= cx + 3.4 && b.min.z >= -14.9 && b.max.z <= -10.1) o.visible = false;
      });
    }
  }
  // ── The timber stair up to the landing: open treads on two raked stringers, risers, posts and iron handrails ──
  function pkJorisStair(g, cx) {
    var tread = std({ color: 0x7a5a3a, roughness: 0.85 }), dark = std({ color: 0x3a2a1a, roughness: 0.7 }), wood = std({ color: 0x6a4a30, roughness: 0.85 });
    var iron = std({ color: 0x2a2d32, roughness: 0.5, metalness: 0.6 });
    var Z0 = -9.0, TOP = 3.62, RUN = 6.5, ang = Math.atan2(TOP, RUN), L = Math.sqrt(TOP * TOP + RUN * RUN), m, i;
    for (i = 0; i < 7; i++) {
      var top = TOP - (i + 0.5) * (TOP / 7), zz = Z0 + 0.465 + i * (RUN / 7);
      box(3.4, 0.12, 0.85, tread, cx, top, zz, g);
      box(3.4, TOP / 7, 0.06, dark, cx, top - TOP / 14 - 0.06, zz - 0.4, g);
    }
    [-1.8, 1.8].forEach(function (sx) {
      m = box(0.18, 0.45, L, wood, cx + sx, TOP / 2 - 0.1, Z0 + RUN / 2, g); if (m && m.rotation) m.rotation.x = ang;
      m = box(0.07, 0.07, L, iron, cx + sx * 1.03, TOP / 2 + 0.95, Z0 + RUN / 2, g); if (m && m.rotation) m.rotation.x = ang;
      for (var j = 0; j < 7; j++) { var tp = TOP - (j + 0.5) * (TOP / 7); cyl(0.04, 0.95, iron, cx + sx * 1.03, tp + 0.47, Z0 + 0.465 + j * (RUN / 7), g, 6); }
    });
  }
  // the gallery floor around the cabin: a landing across the hall front and along both cabin sides, on beams, joists and braces, with rails
  function pkJorisGallery(g, cx) {
    var wood = std({ color: 0x6a4a30, roughness: 0.85 }), dark = std({ color: 0x3a2a1a, roughness: 0.7 }), deck = std({ color: 0x8a6a48, roughness: 0.85 });
    var iron = std({ color: 0x2a2d32, roughness: 0.5, metalness: 0.6 }), m;
    box(9, 0.4, 0.45, dark, cx, 3.1, -9.0, g);
    box(8.8, 0.3, 1.6, deck, cx, 3.47, -9.8, g);
    [-1, 1].forEach(function (sg) {
      box(1.4, 0.3, 3.8, deck, cx + sg * 3.7, 3.47, -12.5, g);
      box(0.25, 0.3, 5.6, wood, cx + sg * 3.7, 3.15, -11.8, g);
      m = box(1.7, 0.2, 0.22, dark, cx + sg * 3.8, 2.5, -9.0, g); if (m && m.rotation) m.rotation.z = sg * 0.78;
      box(1.4, 0.08, 0.08, iron, cx + sg * 3.7, 4.55, -14.4, g);
      box(2.5, 0.08, 0.08, iron, cx + sg * 3.15, 4.55, -9.0, g);
      [[cx + sg * 3.0, -14.4], [cx + sg * 4.4, -14.4], [cx + sg * 1.9, -9.0], [cx + sg * 3.15, -9.0], [cx + sg * 4.4, -9.0]].forEach(function (p) { cyl(0.04, 0.95, iron, p[0], 4.1, p[1], g, 6); });
    });
  }
  // one of the two split stairs: five timber treads up onto a platform, the risers and handrail in the track's colour
  function pkJorisSplitStair(g, px, col) {
    var tread = std({ color: 0x7a5a3a, roughness: 0.85 }), dark = std({ color: 0x3a2a1a, roughness: 0.7 }), sideM = std({ color: col, roughness: 0.6 });
    var iron = std({ color: 0x2a2d32, roughness: 0.5, metalness: 0.6 });
    var Z0 = -13, RUN = 2.3, TOP = 0.6, ang = Math.atan2(TOP, RUN), L = Math.sqrt(TOP * TOP + RUN * RUN), i, m;
    for (i = 0; i < 5; i++) {
      var top = TOP - (i + 0.5) * (TOP / 5), zz = Z0 + 0.23 + i * (RUN / 5);
      box(1.3, 0.12, RUN / 5, tread, px, top, zz, g);
      box(1.3, TOP / 5, 0.05, sideM, px, top - TOP / 10 - 0.06, zz - 0.2, g);
    }
    [-0.7, 0.7].forEach(function (sx) {
      m = box(0.16, 0.4, L, dark, px + sx, TOP / 2 - 0.05, Z0 + RUN / 2, g); if (m && m.rotation) m.rotation.x = ang;
      m = box(0.05, 0.05, L, sideM, px + sx * 1.03, TOP / 2 + 0.55, Z0 + RUN / 2, g); if (m && m.rotation) m.rotation.x = ang;
      for (var j = 0; j < 5; j++) { var tp = TOP - (j + 0.5) * (TOP / 5); cyl(0.03, 0.6, iron, px + sx * 1.03, tp - 0.3, Z0 + 0.23 + j * (RUN / 5), g, 6); }
    });
  }
  // ── The lower hall: the ground-floor entry at the station's south, under the control gallery, where the line forks
  // into the blue Water stair (west) and the red Vuur stair (east) up to the two boarding decks. ──
  function pkJorisLowerHall(g, HX) {
    var wood = std({ color: 0x6a4a30, roughness: 0.85 }), plank = std({ color: 0x7a5a3a, roughness: 0.9 }), dark = std({ color: 0x3a2a1a, roughness: 0.7 });
    var blue = std({ color: PK_JORIS.a, roughness: 0.7 }), red = std({ color: PK_JORIS.b, roughness: 0.7 }), goldM = std({ color: 0xc9a23a, roughness: 0.4, metalness: 0.6 });
    var floorM = std({ color: 0x4a3826, roughness: 0.92 });
    // the hall floor between the two stairs
    box(7.4, 0.08, 3.4, floorM, HX, 0.04, -12.2, g);
    // a low timber rail round the split so the two lanes read as a fork, open at the south where the line arrives
    [[-3.7, -10.55], [3.7, -10.55], [-3.7, -13.6], [3.7, -13.6]].forEach(function (p) { cyl(0.07, 1.0, dark, HX + p[0], 0.5, p[1], g, 8); });
    [[-3.7, -10.55], [3.7, -10.55]].forEach(function (p) { cyl(0.05, 1.0, goldM, HX + p[0], 0.5, p[1], g, 6); });
    box(6.6, 0.08, 0.08, wood, HX - 1.85, 0.95, -10.55, g); box(6.6, 0.08, 0.08, wood, HX + 1.85, 0.95, -10.55, g);
    // the two stairs
    pkJorisSplitStair(g, HX - 1.05, PK_JORIS.a);
    pkJorisSplitStair(g, HX + 1.05, PK_JORIS.b);
    // signs over each stair and the "choose your track" board over the split
    pkSign3D(['WATER'], 1.4, 0.4, HX - 1.05, 2.0, -12.6, 0, { bg: PK_JORIS.a, fg: '#ffffff' }, g);
    pkSign3D(['VUUR'], 1.4, 0.4, HX + 1.05, 2.0, -12.6, 0, { bg: PK_JORIS.b, fg: '#ffffff' }, g);
    pkSign3D(['KIES UW SPOOR', 'WATER OF VUUR'], 2.3, 0.55, HX, 3.2, -10.45, 0, { bg: '#1b232c', fg: PK_JORIS.sign }, g);
    // the deck and stair heights the riders walk: the decks at 0.6, each stair ramping up onto it from the hall floor
    PK_FLOOR_RECTS.push({ x0: HX - 3.0, x1: HX - 0.2, z0: -26, z1: -12.9, y: 0.6 });
    PK_FLOOR_RECTS.push({ x0: HX + 0.2, x1: HX + 3.0, z0: -26, z1: -12.9, y: 0.6 });
    PK_FLOOR_RECTS.push({ axis: 'z', x0: HX - 1.6, x1: HX - 0.5, z0: -12.9, z1: -12.9, y: 0.6, ramp: 2.4 });
    PK_FLOOR_RECTS.push({ axis: 'z', x0: HX + 0.5, x1: HX + 1.6, z0: -12.9, z1: -12.9, y: 0.6, ramp: 2.4 });
  }
  // a triangular gable infill for the hall ends
  function pkJorisGable(w, rise, depth, mat, x, y, z, parent) {
    var sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(0, rise); sh.lineTo(-w / 2, 0);
    var m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: false }), mat);
    m.position.set(x, y, z - depth / 2); parent.add(m); return m;
  }
  // ── The station hall (the Tuyghuys): a stone-footed timber longhouse over the two boarding tracks. The ends are open for the
  // trains. The control room is not a loose box: it is a gallery carried on cross beams, joists and knee braces that
  // spring from the hall's own wall posts, with a timber soffit under it, sitting inside the hall like a mezzanine. ──
  function pkJorisStation(g, a) {
    var ax = PK_JORIS.ax, az = PK_JORIS.az;
    var wood = std({ color: 0x3a2a1a, roughness: 0.7 }), plank = std({ color: 0x9a7a5a, roughness: 0.85 }), siding = std({ color: 0xa88a6a, roughness: 0.8 }), dark = std({ color: 0x2a1a0a, roughness: 0.65 });
    var iron = std({ color: 0x2a2d32, roughness: 0.5, metalness: 0.6 }), stoneA = std({ color: 0xaaa090, roughness: 0.95 }), stoneB = std({ color: 0x76716a, roughness: 0.95 });
    var floorM = std({ color: 0x4a3826, roughness: 0.92 }), deckM = std({ color: 0x8a6a48, roughness: 0.85 });
    var blue = std({ color: PK_JORIS.a, roughness: 0.7 }), red = std({ color: PK_JORIS.b, roughness: 0.7 }), goldM = std({ color: 0xc9a23a, roughness: 0.4, metalness: 0.6 });
    var z1 = az - 9, z0 = az - 26, zc = (z0 + z1) / 2, len = z1 - z0, W = 4.5, H = 8, i;
    // floor, and one boarding deck per track on the inside of each train
    box(W * 2 + 0.6, 0.1, len, floorM, ax, 0.05, zc, g);
    [-1, 1].forEach(function (sg) {
      box(1.5, 0.5, len - 2.6, deckM, ax + sg * 1.05, 0.35, zc, g);
      box(0.12, 0.02, len - 3, MAT.hazard, ax + sg * 1.82, 0.62, zc, g);
    });
    // side walls: a rubble stone plinth, plank infill, heavy posts, a mid rail and top plate, iron straps, shields and banners
    var bays = 5, bw = (len - 0.44) / bays;
    [-W, W].forEach(function (sx) {
      var inx = ax + sx - (sx > 0 ? 1 : -1) * 0.2;
      for (i = 0; i * 1.4 < len; i++) { var sl = Math.min(1.3, len - i * 1.4); box(0.6, 0.7 + (i % 3) * 0.06, sl, i % 2 ? stoneA : stoneB, ax + sx, 0.35, z1 - i * 1.4 - sl / 2, g); }
      box(0.25, H - 0.7, len, siding, ax + sx, 0.7 + (H - 0.7) / 2, zc, g);
      box(0.5, 0.3, len, dark, ax + sx, H - 0.15, zc, g);
      box(0.4, 0.24, len, dark, ax + sx, 3.15, zc, g);
      for (i = 0; i <= bays; i++) box(0.45, H, 0.45, dark, ax + sx, H / 2, z0 + 0.22 + i * bw, g);
      var ox = ax + sx + (sx > 0 ? 1 : -1) * 0.17;
      for (i = 0; z1 - 0.5 - i * 1.0 > z0 + 0.3; i++) box(0.08, H - 0.9, 0.14, dark, ox, 0.7 + (H - 0.9) / 2, z1 - 0.5 - i * 1.0, g);
      box(0.1, 0.14, len, iron, ox, 2.0, zc, g); box(0.1, 0.14, len, iron, ox, 4.7, zc, g);
      for (i = 0; i < bays; i++) {
        var bz = z0 + 0.22 + (i + 0.5) * bw;
        box(0.06, 0.12, bw * 0.85, iron, inx, 1.9, bz, g);
        box(0.06, 0.12, bw * 0.85, iron, inx, 4.7, bz, g);
        var sh = cyl(0.5, 0.06, i % 2 ? red : blue, inx, 3.9, bz, g, 18); if (sh && sh.rotation) sh.rotation.z = Math.PI / 2;
        sphere(0.12, goldM, inx - (sx > 0 ? 1 : -1) * 0.04, 3.9, bz, g);
        box(0.05, 1.7, 0.8, i % 2 ? blue : red, inx, 6.3, bz, g);
        box(0.06, 0.1, 0.9, goldM, inx, 7.2, bz, g);
      }
    });
    // the two end facades: a heavy header over the open train gap, iron lintel, big posts and a gable infill above
    [z1, z0].forEach(function (zz) {
      box(W * 2 + 0.8, H - 5.2, 0.3, wood, ax, 5.2 + (H - 5.2) / 2, zz, g);
      box(W * 2 + 0.8, 0.3, 0.45, dark, ax, 5.2, zz, g);
      box(W * 2 + 0.8, 0.1, 0.5, iron, ax, 5.02, zz, g);
      box(0.6, 5.2, 0.6, dark, ax - W, 2.6, zz, g); box(0.6, 5.2, 0.6, dark, ax + W, 2.6, zz, g);
      pkJorisGable(W * 2 + 0.8, 2.2, 0.3, plank, ax, H, zz, g);
    });
    // lanterns at the south corners
    [-W, W].forEach(function (sx) { sphere(0.22, glowMat(0xffd070, 1.4), ax + sx, 4.7, z1 + 0.5, g); });
    // wall sconces between bays on both side walls
    for (i = 1; i < bays; i++) {
      var sz = z0 + 0.22 + i * bw;
      [-W, W].forEach(function (sx) { sphere(0.16, glowMat(0xffd070, 1.6), ax + sx + (sx > 0 ? 0.35 : -0.35), 3.6, sz, g); });
    }
    // the roof, a ridge beam, and a carved dragon head on each gable
    var gr = new THREE.Group(); gr.position.set(ax, H, zc); gr.rotation.y = Math.PI / 2; g.add(gr);
    pkGableRoof(len, W * 2 + 0.6, 3.2, dark, wood, 0, 0, 0, gr, 0.4);
    box(0.35, 0.3, len + 1.2, dark, ax, H + 2.2, zc, g);
    [[z1 + 0.7, 0], [z0 - 0.7, Math.PI]].forEach(function (f) {
      var fg = new THREE.Group(); fg.position.set(ax, H + 2.15, f[0]); fg.rotation.y = f[1]; g.add(fg);
      var nk = cyl(0.14, 1.3, dark, 0, 0.55, 0.35, fg, 6); if (nk && nk.rotation) nk.rotation.x = 0.5;
      sphere(0.28, dark, 0, 1.15, 0.7, fg).scale.set(0.8, 0.8, 1.5);
      sphere(0.06, glowMat(0xffc830, 1.4), 0.14, 1.25, 0.85, fg); sphere(0.06, glowMat(0xffc830, 1.4), -0.14, 1.25, 0.85, fg);
    });
    // the control gallery: the cabin sits on two cross beams and joists carried by the wall posts, braced with knees, soffit below
    [-14.5, -10.5].forEach(function (zz) {
      box(W * 2, 0.4, 0.45, dark, ax, 3.1, zz, g);
      [-1, 1].forEach(function (sg) { var kb = box(1.7, 0.2, 0.22, dark, ax + sg * 3.8, 2.5, zz, g); if (kb && kb.rotation) kb.rotation.z = sg * 0.78; });
    });
    [-3, 0, 3].forEach(function (jx) { box(0.25, 0.3, 4.3, wood, ax + jx, 3.15, -12.5, g); });
    box(6.4, 0.1, 4.4, wood, ax, 3.42, -12.5, g);
    // the south facade, seen by the queue: title, banners over each lane, FINISH, and the two winner flags
    var F = new THREE.Group(); F.position.set(ax, 0, z1 + 0.2); g.add(F);
    pkSign3D(['TUYGHUYS'], 3.4, 0.8, 0, 7.15, 0, 0, { bg: '#1b232c', fg: PK_JORIS.sign }, F);
    pkSign3D(['WATER  -  VUUR'], 3.0, 0.45, 0, 5.15, 0, 0, { bg: '#8a6a4a', fg: '#f0c04a' }, F);
    pkSign3D(['FINISH'], 2.6, 0.5, 0, 6.2, 0, 0, { bg: '#1b232c', fg: '#f0c04a' }, F);
    // checkered finish arch over the south facade
    for (var ci = -5; ci <= 5; ci++) {
      box(0.55, 0.28, 0.12, std({ color: (ci % 2 === 0) ? 0xffffff : 0x1b232c, roughness: 0.7 }), ci * 0.6, 7.6, -0.05, F);
    }
    box(7.2, 0.18, 0.12, std({ color: 0x8a6a4a, roughness: 0.8 }), 0, 7.45, -0.05, F);
    // bunting across the south facade
    for (var bi = -6; bi <= 6; bi++) {
      var bb = box(0.45, 0.22, 0.06, std({ color: (bi % 2 === 0) ? PK_JORIS.a : PK_JORIS.b, roughness: 0.6 }), bi * 0.55, 8.0, -0.05, F);
      if (bb && bb.rotation) bb.rotation.z = (bi % 2 === 0) ? 0.25 : -0.25;
    }
    [[-3, PK_JORIS.a, 'WATER'], [3, PK_JORIS.b, 'VUUR']].forEach(function (t) {
      box(2.1, 1.5, 0.08, std({ color: t[1], roughness: 0.6 }), t[0], 6.65, 0, F);
      pkSign3D([t[2]], 1.8, 0.6, t[0], 6.65, 0.06, 0, { bg: t[1], fg: '#ffffff' }, F);
    });
    var winWater = pkSign3D(['WINNAAR'], 2.0, 0.36, -3, 5.55, 0.06, 0, { bg: PK_JORIS.a, fg: '#ffffff' }, F);
    var winVuur = pkSign3D(['WINNAAR'], 2.0, 0.36, 3, 5.55, 0.06, 0, { bg: PK_JORIS.b, fg: '#ffffff' }, F);
    winWater.visible = false; winVuur.visible = false;
    // gold chandeliers over the lanes, hung from the roof on chains
    [14, 20].forEach(function (lx) {
      [-2.5, 2.5].forEach(function (lz) {
        var ch = new THREE.Group(); ch.position.set(ax + lz, 6.2, az - lx); g.add(ch);
        pkRing(0.7, 0.05, goldM, 0, 0, 0, ch, 20); pkRing(0.4, 0.04, goldM, 0, -0.16, 0, ch, 16);
        cyl(0.03, 1.6, goldM, 0, 0.8, 0, ch, 6);
        for (var c = 0; c < 6; c++) { var ca = c / 6 * 6.28; cyl(0.03, 0.16, glowMat(0xfff2c0, 1.4), Math.cos(ca) * 0.68, -0.08, Math.sin(ca) * 0.68, ch, 4); }
      });
    });
    // boom gates at the boarding decks, so the trains are held at the platform like the other coasters
    var C = (typeof pkCtl === 'function') ? pkCtl(a) : null;
    if (C) pkCoGates(g, [ax - 1.05, ax + 1.05], z1, C, 0.6);
    // proper platforms on each boarding deck: kerb, pavers, edge stripe, planters and lamps (like the other coasters)
    pkCoPlatform(g, ax - 1.85, ax - 0.25, z0, z1, PK_THEME.joris, 0.6);
    pkCoPlatform(g, ax + 0.25, ax + 1.85, z0, z1, PK_THEME.joris, 0.6);
    // a canopy over the south entrance, sheltering the boarding area
    pkCoCanopy(g, ax - 4.6, ax + 4.6, z1 + 0.6, 2.4, 'Joris en de Draak', PK_THEME.joris, 0.6);
    return { water: winWater, vuur: winVuur };
  }
  // ── Edna: the dragon in her swamp beside the lift. Her body lies north-south, her tail trails north and her head
  // is turned east toward the track. ──
  function pkJorisDragon(g, x, z) {
    var green = std({ color: 0x3f6b34, roughness: 0.8 }), dark = std({ color: 0x2a4a22, roughness: 0.85 });
    var d = new THREE.Group(); d.position.set(x, 0, z); g.add(d);
    // the body and the tail
    sphere(2.2, green, 0, 2.6, 0, d).scale.set(0.8, 0.7, 1.6);
    var i, t;
    for (i = 0; i < 6; i++) { t = i / 5; sphere(1.6 * (1 - t * 0.7), green, 0, 2.3 - t * 0.5, -2.6 - i * 1.3, d); }
    // a row of spikes down the back and along the tail
    for (i = 0; i < 5; i++) {
      var zz = 1.6 - i * 1.2, top = 2.6 + 1.54 * Math.sqrt(1 - (zz / 3.52) * (zz / 3.52));
      var sp = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 4), dark); sp.position.set(0, top + 0.25, zz); d.add(sp);
    }
    for (i = 0; i < 6; i++) {
      t = i / 5; var r = 1.6 * (1 - t * 0.7), sp2 = new THREE.Mesh(new THREE.ConeGeometry(0.3 * (1 - t * 0.4), 0.8, 4), dark);
      sp2.position.set(0, 2.3 - t * 0.5 + r + 0.2, -2.6 - i * 1.3); d.add(sp2);
    }
    // the neck leans east, the head looks east over the track
    cyl(0.7, 3.2, green, 0.8, 4.4, 0.4, d, 10).rotation.z = -0.35;
    var head = new THREE.Group(); head.position.set(1.6, 6.4, 0.4); head.rotation.y = Math.PI / 2; d.add(head);
    d.userData.head = head;
    sphere(1.0, green, 0, 0, 0, head); sphere(0.5, green, 0, -0.1, 0.9, head);
    sphere(0.12, glowMat(0xffc830, 1.4), 0.55, 0.25, 0.8, head); sphere(0.12, glowMat(0xffc830, 1.4), -0.55, 0.25, 0.8, head);
    var fire = sphere(0.32, glowMat(0xff5a1a, 2.4), 0, -0.2, 1.15, head);
    d.userData.fire = fire;
    // the legs
    [[-1.1, -1.0], [1.1, -1.0], [-1.1, 1.0], [1.1, 1.0]].forEach(function (p) { cyl(0.4, 1.4, dark, p[0], 0.7, p[1], d, 8); });
    // the wings, folded back
    [[-1], [1]].forEach(function (s) { var w = new THREE.Mesh(new THREE.ConeGeometry(2.6, 3.2, 4, 1), dark); w.position.set(s[0] * 1.3, 4.2, -0.4); w.rotation.set(0, 0, s[0] * -0.6); w.scale.set(1, 1, 0.25); d.add(w); });
    // the swamp: dark water, eggs and a charred tree
    var pond = new THREE.Mesh(new THREE.CircleGeometry(5.5, 24), std({ color: 0x1a2a20, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.85 })); pond.rotation.x = -Math.PI / 2; pond.position.y = 0.04; d.add(pond);
    for (var e = 0; e < 4; e++) { var a2 = e / 4 * 6.28; sphere(0.5, std({ color: 0xc8c0a0, roughness: 0.8 }), Math.cos(a2) * 3.4, 0.3, Math.sin(a2) * 3.4, d).scale.set(0.7, 0.6, 0.7); }
    cyl(0.25, 3.0, std({ color: 0x2a1a12, roughness: 1 }), 3.2, 1.5, -2.0, d, 6).rotation.z = 0.2;
    return d;
  }
  // each lap picks a winner and the loser lags a little, so the race is decided on the track
  function pkJorisStart(at) {
    var E = at.extra;
    E.winner = Math.random() < 0.5 ? 'water' : 'vuur';
    E.lag = 14 + Math.floor(Math.random() * 16);
    E.announced = false;
    toast(at.name + ': the king calls - whoever slays the dragon wins a thousand-and-one ducats!', 'good');
  }
  // both trains run together; the winner's train is the one not lagged, the loser closes most of the gap on the final
  // approach so neither train jumps at the finish, and the flag follows the winner
  function pkJorisRun(at) {
    var E = at.extra, w = E.water, v = E.vuur;
    var p = at.state === 'running' ? clamp(at.t / at.run, 0, 1) : 0;
    // Edna watches the trains go by: her head turns with the race, and her fire pulses as they pass
    if (E.dragon) {
      var head = E.dragon.userData && E.dragon.userData.head;
      if (head) head.rotation.y = Math.PI / 2 + Math.sin(p * Math.PI * 2) * 0.25;
      var fire = E.dragon.userData && E.dragon.userData.fire;
      if (fire) { var sc = 1 + 0.35 * (0.5 + 0.5 * Math.sin(p * Math.PI * 4)); fire.scale.set(sc, sc, sc); }
    }
    var fade = 1 - 0.8 * pkJorisSm((p - 0.7) / 0.3);
    function step(sub, lag) {
      if (!sub || !sub.uOfF || !sub.uOfF.length) return;
      var M = sub.uOfF.length - 1, f = p * M;
      f = Math.max(0, f - (lag || 0) * fade);
      var k = Math.min(M - 1, Math.floor(f)), r = f - k;
      pkCoPlace(sub, (sub.u0 + sub.uOfF[k] + (sub.uOfF[k + 1] - sub.uOfF[k]) * r) % 1);
    }
    step(w, E.winner === 'water' ? 0 : E.lag);
    step(v, E.winner === 'vuur' ? 0 : E.lag);
    if (E.fin) {
      var won = at.state !== 'running' && !!E.winner;
      E.fin.water.visible = won && E.winner === 'water';
      E.fin.vuur.visible = won && E.winner === 'vuur';
      if (won && !E.announced) { E.announced = true;
        if (E.winner === 'water') E.winsWater = (E.winsWater || 0) + 1; else E.winsVuur = (E.winsVuur || 0) + 1;
        toast(at.name + ': ' + (E.winner === 'water' ? 'Water' : 'Vuur') + ' wins the race! (Water ' + E.winsWater + ' - Vuur ' + E.winsVuur + ')', 'good'); sfx('chime'); }
      if (at.state === 'running') E.announced = false;
    }
  }
  // built before the standard pass so the booth pass sees a.booth (the control house) and builds none
  var _pkBuildAttractionsJoris = pkBuildAttractions;
  pkBuildAttractions = function () {
    PK_PLOTS.forEach(function (p) {
      if (p.id !== 'joris') return;
      var a = pkBuildJoris(p);
      a.level = p.level; a.plot = p; a.open = pkRideSavedOpen(p.id);
      if (S.rides) S.rides[p.id] = a.open;
    });
    _pkBuildAttractionsJoris();
  };
