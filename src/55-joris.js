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
    name: 'Dragon Ride', ax: 100, az: -1, qz: 1, a: 0x2f6fbf, b: 0xc8452a, spine: 0x8a6a4a, legs: 0x5a4028, ground: 0x8fa080, sign: '#f0c04a'
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
  // The guest side of the station. Both tracks loop round in front of the hall (the south turnarounds, z -6 to -9, about
  // 1.1 m up) and their brake runs pass just outside both walls, so the only clear way in is the corridor straight up
  // the middle, between the two turnarounds, to the lower hall. The line (part 55's own, not the generic switchback
  // lane) enters under the dragon gate to the west at Q, bends east and then runs up that corridor to a gate at H; the
  // operator's stair shares the corridor on its east side, behind a rail, up to the landing at the booth's back.
  var PK_JORIS_Q = [90.0, 1.5];
  var PK_JORIS_LINE = [[99.45, -9.4], [99.45, -4.0], [99.3, -2.6], [98.7, -1.2], [97.5, 0.2], [95.8, 1.1], [93.6, 1.5], [90.8, 1.5]];
  (function () {
    var q = PK_JORIS_Q;
    PK_PLOTS.push({ id: 'joris', name: PK_JORIS.name, x: PK_JORIS.ax + 15, z: q[1], r: 26, q: q, qdx: -1, level: 20, pad: 0.02 });
    PK_THEME.joris = { a: PK_JORIS.a, b: PK_JORIS.b, ground: PK_JORIS.ground, name: PK_JORIS.name, noBunting: true, noDecor: true, portal: function (p, side, g) { pkJorisPortal(p, side, g); } };
    PK_ROUTES.push([76, q[1], q[0] - 3.2, q[1], 3.2, 'coaster']);   // the spur from the East Walk to the line
    // no trees in Edna's swamp, on the line, in the entrance corridor, or growing out of the lift's timber hill
    PK_KEEP.push([PK_JORIS.ax - 16, PK_JORIS.az - 22, 7.5], [95, -0.5, 6], [100, -6.5, 3.5]);
    [-2.5, 2.5].forEach(function (yd) {   // no trees growing up through either track's timber frame
      var P = pkJorisPoints(yd);
      for (var k = 0; k < P.length; k += 2) { var w = pkJorisW(P[k][0], P[k][2]); PK_KEEP.push([w[0], w[1], 2.2]); }
    });
    for (var bx = 78; bx <= 123; bx += 3.5) PK_KEEP.push([bx, -3.3, 2.4]);   // the walk to the train station gate
    // that walk is two park routes (so it is paved, lit and railed like any street, and joins the East Walk properly)
    // with the footbridge between them (pkJorisBridge), whose footprint the path rail leaves open (part 24)
    PK_ROUTES.push([72.5, -3.3, 82, -3.3, 2.2, 'coaster'], [117, -3.3, 124.5, -3.3, 2.2, 'coaster']);
    PK_PF_OPEN.push([81.6, 117.4, -4.5, -2.1]);
  })();
  // ── The cars: a timber racing cart on the standard coaster car's chassis, wheels, seats and lap bar (the seat
  // positions and the bar are what the riders and the restraints use, so those stay exactly as pkCoCar has them).
  // Plank sides with iron bands, a padded top rail and a shield on each flank in the track's colour, a carved prow,
  // and on the lead car of each train a short mast with the track's pennant. ──
  function pkJorisCar(col, lead) {
    var M0 = pkMats();
    var g = new THREE.Group(); g.userData.dynamic = true; g.userData.keep = true;
    var W = 1.44, D = 2.02;
    var plank = std({ map: M0.clap.map, color: 0x8a5c36, roughness: 0.8 }), dark = std({ map: M0.bark.map, color: 0x3a2716, roughness: 0.85 });
    var paint = std({ color: col, roughness: 0.45, metalness: 0.1 }), iron = std({ color: 0x24282c, roughness: 0.5, metalness: 0.6 });
    var leather = std({ color: 0x3a2418, roughness: 0.75 }), gold = M0.gold;
    [[-0.56, 0.62], [0.56, 0.62], [-0.56, -0.62], [0.56, -0.62]].forEach(function (w) {
      var wh = pkRoundCyl(0.15, 0.11, MAT.steelDark, w[0], 0, w[1], g, 10); wh.rotation.z = Math.PI / 2;
    });
    pkBevelBox(W * 0.78, 0.13, D * 0.9, MAT.steelDark, 0, 0.17, 0, g, 0.02);
    pkBevelBox(W - 0.08, 0.08, D - 0.1, dark, 0, 0.27, 0, g, 0.02);
    [-1, 1].forEach(function (sx) {
      pkBevelBox(0.09, 0.5, D - 0.1, plank, sx * (W / 2 - 0.045), 0.53, 0, g, 0.02);
      [-0.62, 0.62].forEach(function (bz) { box(0.11, 0.52, 0.06, iron, sx * (W / 2 - 0.04), 0.53, bz, g); });   // iron bands
      pkRoundCyl(0.055, D - 0.15, paint, sx * (W / 2 - 0.04), 0.8, 0, g, 8).rotation.x = Math.PI / 2;           // padded rail
      var sh = pkRoundCyl(0.2, 0.04, paint, sx * (W / 2 + 0.01), 0.52, 0.1, g, 14); sh.rotation.z = Math.PI / 2;   // shield
      sphere(0.05, gold, sx * (W / 2 + 0.035), 0.52, 0.1, g);
    });
    pkBevelBox(W - 0.12, 0.5, 0.08, plank, 0, 0.53, -(D / 2 - 0.04), g, 0.02);
    // the prow: a rounded timber nose, banded in the track's colour, with a carved scroll on top
    pkBevelBox(W * 0.86, 0.55, 0.26, plank, 0, 0.5, D / 2 + 0.04, g, 0.06);
    box(W * 0.88, 0.1, 0.28, paint, 0, 0.72, D / 2 + 0.04, g);
    var scroll = pkRoundCyl(0.12, W * 0.5, dark, 0, 0.86, D / 2 + 0.08, g, 10); scroll.rotation.z = Math.PI / 2;
    if (lead) {
      pkRoundCyl(0.025, 1.0, dark, 0, 1.3, D / 2 + 0.1, g, 6);
      var pen = new THREE.Shape(); pen.moveTo(0, 0); pen.lineTo(0, 0.3); pen.lineTo(-0.55, 0.15); pen.lineTo(0, 0);
      var pm = new THREE.Mesh(new THREE.ShapeGeometry(pen), std({ color: col, roughness: 0.7, side: THREE.DoubleSide })); pm.position.set(0, 1.45, D / 2 + 0.1); pm.rotation.y = -Math.PI / 2; g.add(pm);
      sphere(0.05, gold, 0, 1.82, D / 2 + 0.1, g);
    }
    // two seats, side by side, in leather, their backs capped in the track's colour
    [-0.31, 0.31].forEach(function (sx) {
      pkBevelBox(0.5, 0.09, 0.6, leather, sx, 0.66, -0.06, g, 0.03);
      pkBevelBox(0.5, 0.56, 0.11, leather, sx, 0.97, -0.4, g, 0.03);
      pkBevelBox(0.34, 0.22, 0.1, paint, sx, 1.3, -0.42, g, 0.03);
    });
    // lap bar: a padded U on a pivot behind the seats (the restraints swing it)
    var bar = new THREE.Group(); bar.position.set(0, 0.76, -0.55); g.add(bar);
    pkRoundCyl(0.045, 0.94, MAT.steelDark, 0, 0.28, 0.62, bar, 8).rotation.z = Math.PI / 2;
    pkRoundCyl(0.075, 0.7, leather, 0, 0.28, 0.62, bar, 8).rotation.z = Math.PI / 2;
    [-0.42, 0.42].forEach(function (sx) { pkRod(sx, 0, 0, sx, 0.28, 0.62, 0.04, MAT.steelDark, bar, 6); });
    return { g: g, bar: bar, seats: [{ x: -0.31, y: -0.06, z: -0.02 }, { x: 0.31, y: -0.06, z: -0.02 }] };
  }
  // ── Building the ride ───────────────────────────────────────────
  function pkBuildJoris(p) {
    var g = new THREE.Group(); scene.add(g);
    var M0 = pkMats();
    var wood = std({ map: M0.bark.map, color: PK_JORIS.spine, roughness: 0.6 }), leg = std({ map: M0.bark.map, color: PK_JORIS.legs, roughness: 0.7 });
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
      for (var i = 0; i < 4; i++) { var car = pkJorisCar(col, i === 0); scene.add(car.g); E.cars.push(car); car.seats.forEach(function (s) { seats.push({ par: car.g, x: s.x, y: s.y, z: s.z, ry: 0, guest: null, track: id }); }); }
      pkCoTrackBuild(g, E, { spineMat: wood, supMat: leg, tieMat: std({ color: 0x4a3a28, roughness: 0.8 }), railMat: MAT.steelDark, skip: function () { return true; } });   // no lone legs: pkJorisTrestle frames it
      pkCoPlan(E, { rollIn: 12 });
      pkCoPlace(E, E.uPark);
      subs[id] = E;
    });
    var run = Math.max(subs.water.run, subs.vuur.run);
    var a = pkAttr({
      id: 'joris', name: PK_JORIS.name, x: p.x, z: p.z, qx: p.q[0], qz: p.q[1], qdx: -1, g: g, seats: seats,
      board: 11, run: run, unload: 6, exit: [86.5, -2.0],   // set down west of the dragon gate, clear of the line
      extra: subs, tickRun: function (at2) { pkJorisRun(at2); },
      start: function (at2) { pkJorisStart(at2); }
    });
    subs.water.a = subs.vuur.a = a;
    subs.winner = null; subs.lag = 0; subs.winsWater = 0; subs.winsVuur = 0;
    // the booth's live mimic screen (part 14) reads a.extra.curve and a.extra.cars; with two tracks neither lives at the
    // top level of subs, so it fell through to isFlume and drew the log flume's path instead of Joris's own. Point it at
    // the water track's curve for the plan (Vuur is its mirror, close enough for the schematic) and both trains' cars.
    subs.curve = subs.water.curve;
    subs.cars = subs.water.cars.concat(subs.vuur.cars);
    // the mimic (part 14) also reads these straight off a.extra: hand it the water track's own, so the plan starts at the
    // station and the profile cursor and block lamps follow the run instead of sitting at the first frame
    subs.uPark = subs.water.uPark;
    subs.uOfF = subs.water.uOfF;
    subs.u0 = subs.water.u0;
    if (PK_PANEL.joris) PK_PANEL.joris.curve2 = subs.vuur.curve;   // the mimic draws both lanes once this is set (part 14)
    // where the first drop bottoms out (lx 72), on the Water curve: the race keeps both trains level until here
    var dropW = pkJorisW(74, -2.5); subs.uDrop = pkCoUAt(subs.water.curve, dropW[0], dropW[1]);
    // the foot of the lift (lx 24), and where the last car of the train clears its top (lx 54 plus the train's length)
    var liftW = pkJorisW(26, -2.5), topW = pkJorisW(54 + 4 * 2.35, -2.5);
    subs.uLift = pkCoUAt(subs.water.curve, liftW[0], liftW[1]); subs.uTop = pkCoUAt(subs.water.curve, topW[0], topW[1]);
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
    // the rider's way: up the line to its gate at the head of the corridor, into the lower hall, up the Water or Vuur
    // stair to the platform
    var HX = PK_JORIS.ax;
    var entry = { x: PK_JORIS_LINE[0][0], z: PK_JORIS_LINE[0][1] - 0.3 };   // just past the head of the line
    a.ownLane = function (parent) { pkJorisLane(a, parent); };
    a.qSlot = function (i) { return pkJorisSlot(i, subs); };
    a.walkTo = function (gu, i) { return pkJorisWalkTo(a, gu, i); };
    var fork = { x: HX, z: -10.7 };                             // the split inside the lower hall
    var wB = { x: HX - 1.05, z: -10.7 }, wT = { x: HX - 1.05, z: -13 };
    var vB = { x: HX + 1.05, z: -10.7 }, vT = { x: HX + 1.05, z: -13 };
    // the platform: guests come up and wait in their car's pen, two to a row (the car's two seats), and step in when the
    // station gates open (pkJorisQueueTick). The way is spelled out point by point: no detours through the park's paths.
    a.rowWait = true;
    a.holdRows = pkJorisHoldRows;
    a.rowSpot = function (seat) {
      var w = pkAttrSeatWorld(seat), side = seat.track === 'water' ? -1 : 1;
      return { x: HX + side * 1.32, z: w.z + (seat.x < 0 ? 0.35 : -0.35) };
    };
    a.seatPath = function (from, w) {
      var side = w.x < HX ? -1 : 1, b = side < 0 ? wB : vB, t = side < 0 ? wT : vT, aisle = HX + side * 0.5;
      return pkJorisLineFrom(from.x, from.z).concat([entry, fork, b, t, { x: aisle, z: -13.4 }, { x: aisle, z: w.z }, { x: w.x, z: w.z }]);
    };
    // the row spots stay fixed while the train runs (the cars move, the pens do not), so they are remembered once here
    // against the parked train; the queue fills them while the ride is out on the track (pkjorisFillRows)
    a.parkedRow = a.seats.map(function (seat) { return a.rowSpot(seat); });
    // leaving: a rider stands up in the car and walks out the way they came in - down the stair, through the lower hall
    // and down the line to the exit, instead of blinking out of the car
    a.walkOut = function (from) {
      var side = from.x < HX ? -1 : 1, b = side < 0 ? wB : vB, t = side < 0 ? wT : vT, aisle = HX + side * 0.5;
      var out = [{ x: aisle, z: from.z }, { x: aisle, z: -13.4 }, t, b, fork, entry];
      for (var i = 0; i < PK_JORIS_LINE.length; i++) out.push({ x: PK_JORIS_LINE[i][0], z: PK_JORIS_LINE[i][1] });
      out.push({ x: a.exit[0], z: a.exit[1] });
      return out;
    };
    // the station hall; it also hangs the banners, the FINISH sign and the two WINNAAR flags on its south face
    subs.banners = pkJorisStation(g, a);
    pkJorisRowGates(g, a, subs);                       // a gate on the platform edge at every car's seat row
    // the overhead control room: the operator's cabin tucked into the hall facade, glazed onto both tracks, reached by a stair
    var cx = PK_JORIS.ax;
    var K = { u0: cx - 3, u1: cx + 3, z0: -14.4, z1: -10.6, door: [-13.2, -12.3] };
    var n0 = g.children.length;
    pkCabinBuild(g, a, { s: 1, AX: 0, K: K, y: 3.5, trim: 0x3e2c1e, band: PK_JORIS.b, name: PK_JORIS.name, sign: PK_JORIS.sign, H: 3.2, desk: pkJorisDesk });
    pkJorisStripBase(g, n0, cx);                       // the kit's grey concrete plinth under the cabin goes; the timber gallery carries it
    // the walkable gallery: a landing across the hall front, at the booth's back, where the operator's stair arrives
    // (pkJorisStair adds its own ramp), and along both cabin sides (the cabin door opens onto the west one)
    // the gallery and its stair are the operator's own (STAFF ONLY), standing over the riders' lower hall: guests walk
    // straight through the hall beneath, so these floors are 'overhead' — only a walker with a height (the operator)
    // stands on them; guests pass under and stay on the hall floor below.
    PK_FLOOR_RECTS.push({ x0: cx - 4.4, x1: cx + 4.4, z0: -10.6, z1: -9.0, y: 3.62, overhead: true });
    PK_FLOOR_RECTS.push({ x0: cx - 4.4, x1: cx - 3, z0: -14.4, z1: -10.6, y: 3.62, overhead: true });
    PK_FLOOR_RECTS.push({ x0: cx + 3, x1: cx + 4.4, z0: -14.4, z1: -10.6, y: 3.62, overhead: true });
    pkJorisStair(g, cx);
    pkJorisGallery(g, cx);
    pkJorisEnclosure(g, cx);
    // the lower hall: the split into the two coloured stairs, and the deck and stair heights the riders walk
    pkJorisLowerHall(g, HX);
    // Edna lies in her swamp west of the lift, her head turned toward the passing trains
    subs.dragon = pkJorisDragon(g, PK_JORIS.ax - 16, PK_JORIS.az - 22);
    pkJorisPerimeter(g);                               // keep everyone off the turnarounds and the low brake runs
    pkJorisTrestle(g, subs);                           // a timber frame under each track, all the way round
    pkJorisBridge(g);                                  // the walk to the train station gate, bridging the line
    return a;
  }
  // ── The line (in place of the generic switchback lane, as Droomvlucht does): a timber-railed path from the dragon gate
  // to the head gate, laid along PK_JORIS_LINE (head first). Slot i stands 0.95 m along it from the head; past its tail
  // the line runs on west down the street. ──
  var PK_JORIS_SLOT_GAP = 0.95, PK_JORIS_PATH = null;
  function pkJorisPath() {
    if (PK_JORIS_PATH) return PK_JORIS_PATH;
    var P = PK_JORIS_LINE, seg = [], tot = 0;
    for (var i = 0; i < P.length - 1; i++) { var l = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); seg.push(l); tot += l; }
    return (PK_JORIS_PATH = { seg: seg, len: tot });
  }
  function pkJorisAlong(d) {
    var P = PK_JORIS_LINE, S = pkJorisPath();
    if (d >= S.len) { var t = P[P.length - 1]; return { x: t[0] - (d - S.len), z: t[1] }; }
    for (var i = 0; i < S.seg.length; i++) {
      if (d <= S.seg[i]) { var f = d / S.seg[i]; return { x: P[i][0] + (P[i + 1][0] - P[i][0]) * f, z: P[i][1] + (P[i + 1][1] - P[i][1]) * f }; }
      d -= S.seg[i];
    }
    return { x: P[P.length - 1][0], z: P[P.length - 1][1] };
  }
  // With the queue gate (the arch) open, the line runs from the corridor head back along the path and out through the
  // arch. With it shut, whoever was already inside keeps their place (the first E.qK slots) and everyone else lines up in
  // front of the shut gate, out along the street.
  function pkJorisSlot(i, E) {
    var k = E && E.qK !== undefined ? E.qK : Infinity;
    if (i < k) return pkJorisAlong(0.2 + i * PK_JORIS_SLOT_GAP);
    return { x: PK_JORIS_Q[0] - 1.1 - (i - k) * 0.9, z: PK_JORIS_Q[1] };
  }
  function pkJorisInside(x, z) { return x > PK_JORIS_Q[0] + 0.4 || z < PK_JORIS_Q[1] - 1.2; }
  // the way up the line to its head from (x, z), bend by bend: from out in the street, in through the arch and the whole
  // path; from inside, on from the nearest bend ahead
  function pkJorisLineFrom(x, z) {
    var P = PK_JORIS_LINE, out = [], i, start = P.length - 1;
    if (!pkJorisInside(x, z)) out.push({ x: PK_JORIS_Q[0] - 0.4, z: PK_JORIS_Q[1] });
    else {
      var best = 1e9;
      for (i = 0; i < P.length - 1; i++) {
        var ax = P[i][0], az = P[i][1], dx = P[i + 1][0] - ax, dz = P[i + 1][1] - az, L2 = dx * dx + dz * dz;
        var f = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (L2 || 1))), d = Math.hypot(ax + dx * f - x, az + dz * f - z);
        if (d < best) { best = d; start = i; }
      }
    }
    for (i = start; i >= 0; i--) out.push({ x: P[i][0], z: P[i][1] });
    return out;
  }
  // A guest's way to line slot i. Out in the street (a slot in front of the shut gate): over the park to it. In the line:
  // up the line from wherever they are, bend by bend, to their slot, never back down it; from the street, first over
  // the park to the arch.
  var PK_JORIS_ALONG = null;
  function pkJorisWalkTo(a, gu, i) {
    var E = a.extra, s = pkJorisSlot(i, E), x = gu.rec.x, z = gu.rec.z, k = E.qK === undefined ? Infinity : E.qK;
    if (i >= k) return route({ x: x, z: z }, { x: s.x, z: s.z });
    if (!PK_JORIS_ALONG) { var P = PK_JORIS_LINE, d = 0; PK_JORIS_ALONG = [0]; for (var j = 1; j < P.length; j++) { d += Math.hypot(P[j][0] - P[j - 1][0], P[j][1] - P[j - 1][1]); PK_JORIS_ALONG.push(d); } }
    var di = 0.2 + i * PK_JORIS_SLOT_GAP, out = [];
    if (!pkJorisInside(x, z)) {
      var arch = { x: PK_JORIS_Q[0] - 0.4, z: PK_JORIS_Q[1] };
      if (Math.hypot(x - arch.x, z - arch.z) > 3) out = route({ x: x, z: z }, arch); else out.push(arch);
      if (di >= PK_JORIS_ALONG[PK_JORIS_ALONG.length - 1]) { out.push({ x: s.x, z: s.z }); return out; }   // a slot in the arch itself
    }
    pkJorisLineFrom(x, z).forEach(function (p) {
      var idx = -1; for (var j = 0; j < PK_JORIS_LINE.length; j++) if (PK_JORIS_LINE[j][0] === p.x && PK_JORIS_LINE[j][1] === p.z) idx = j;
      if (idx >= 0 && PK_JORIS_ALONG[idx] > di) out.push(p);
    });
    out.push({ x: s.x, z: s.z });
    return out;
  }
  // every tick: follow the queue gate, and move the platform along
  function pkJorisQueueTick(at) {
    var E = at.extra, C = pkCtl(at), open = !!C.gates;
    if (E.qOpen !== open) {
      E.qOpen = open;
      if (open) E.qK = Infinity;
      else { var k = 0; at.queue.forEach(function (gu) { if ((gu.state === 'qwait' || gu.state === 'qmove') && pkJorisInside(gu.rec.x, gu.rec.z)) k++; }); E.qK = k; }
      at.queue.forEach(function (gu, i) {
        if (gu.state !== 'qwait' && gu.state !== 'qmove' && gu.state !== 'walkAttr') return;
        gu.slot = i;
        gu.rec.path = pkJorisWalkTo(at, gu, i);
        gu.state = gu.state === 'walkAttr' ? 'walkAttr' : (gu.rec.path.length ? 'qmove' : 'qwait');
      });
      screenDirtyAll();
    }
    // on the platform: walkers reach their pen and wait; with the station gates open, and the train home, each steps in
    var home = at.state !== 'running' && at.state !== 'dispatch';
    // the train is back and its riders are off: whoever kept a place at a row through the run takes that seat again
    if (home && E.held && E.held.length) {
      if (PK.closed) { E.held.forEach(function (h) { h.gu.state = 'off'; h.gu.attr = null; }); E.held = []; }
      else E.held = E.held.filter(function (h) {
        var s = at.seats[h.si]; if (s.guest || s.player) return true;
        s.guest = h.gu; h.gu.seat = s; h.gu.state = h.gu.rec.path.length ? 'walkRow' : 'rowWait';
        return false;
      });
    }
    var board = false;
    at.seats.forEach(function (s) {
      var gu = s.guest; if (!gu) return;
      // closing time behind shut station gates: the ones still waiting at a row give up and go
      if (PK.closed && at.stationGates === false && (gu.state === 'walkRow' || gu.state === 'rowWait')) {
        s.guest = null; gu.seat = null; gu.attr = null; gu.state = 'off'; gu.rec.path = []; return;
      }
      if (gu.state === 'walkRow' && !gu.rec.path.length) gu.state = 'rowWait';
      if (gu.state === 'rowWait' && home && at.stationGates !== false) {
        var w = pkAttrSeatWorld(s); gu.state = 'walkSeat'; gu.rec.path = [{ x: w.x, z: w.z }]; board = true;
      }
    });
    if (board && at.state === 'idle') { at.state = 'boarding'; at.t = 0; at.boarding = 0; at.manualStart = true; }
    // while the train is out, the empty pens are filled from the line and the next batch waits at their rows
    if (at.state === 'running') {
      if (E.held) E.held.forEach(function (h) { if (h.gu.state === 'walkRow' && !h.gu.rec.path.length) h.gu.state = 'rowWait'; });
      if (C.gates && at.queue.length && !PK.closed) pkJorisFillRows(at);
    }
    // the queue gate open with the train home: the line comes up to the rows whenever the ride is not already boarding
    if (home && C.gates && at.state === 'idle' && at.queue.length && !PK.closed && C.key && !C.maint && !C.fault) pkAttrBegin(at);
    else if (home && C.gates && (at.state === 'unloading' && !at.awaitBars) && at.queue.length && !PK.closed) pkAttrFill(at);
  }
  // dispatch: the guests still waiting at a row (behind the shut station gates) step back from the train and keep their place
  // at the row for the next one; their seat leaves with the train (pkJorisQueueTick gives it back once it is home and empty)
  function pkJorisHoldRows(at) {
    var E = at.extra; E.held = E.held || [];
    at.seats.forEach(function (s, si) {
      var gu = s.guest;
      if (!gu || (gu.state !== 'rowWait' && gu.state !== 'walkRow')) return;
      s.guest = null; gu.seat = null; gu.state = 'rowHold';
      E.held.push({ gu: gu, si: si });
    });
  }
  // while the train is out on the track the platform pens are empty: the line comes up and fills them, one guest to a row,
  // and they wait there for the train home (pkJorisQueueTick seats them once the riders have left). The rows are fixed
  // (a.parkedRow), so a guest walks to a pen even though the car they will board is still on its lap.
  function pkJorisFillRows(at) {
    var E = at.extra; E.held = E.held || [];
    var taken = {};
    E.held.forEach(function (h) { taken[h.si] = true; });
    var n = 0;
    while (at.queue.length && n < at.seats.length) {
      var gu = at.queue[0];
      if (gu.state !== 'qwait' && gu.state !== 'qmove') break;
      var side = gu.side || (gu.side = Math.random() < 0.5 ? 'water' : 'vuur');
      var si = -1, fall = -1;
      for (var i = 0; i < at.seats.length; i++) {
        if (taken[i]) continue;
        if (fall < 0) fall = i;
        if (at.seats[i].track === side) { si = i; break; }
      }
      if (si < 0) si = fall;
      if (si < 0) break;
      at.queue.shift();
      gu.slot = -1;
      gu.state = 'walkRow';
      gu.rec.path = at.seatPath({ x: gu.rec.x, z: gu.rec.z }, at.parkedRow[si]);
      if (!gu.rec.path.length) gu.state = 'rowWait';
      E.held.push({ gu: gu, si: si });
      taken[si] = true;
      n++;
    }
    if (n) { pkAttrReslot(at); screenDirtyAll(); }
  }
  function pkJorisLane(a, parent) {
    var M0 = pkMats(), C = pkCtl(a), P = PK_JORIS_LINE;
    var post = std({ map: M0.bark.map, color: 0x4a3420, roughness: 0.85 }), rail = std({ map: M0.clap.map, color: 0x6a4a30, roughness: 0.85 });
    var iron = std({ color: 0x23272b, roughness: 0.5, metalness: 0.45 }), HWD = 1.0;
    // the walk itself: kerbed stone, one rotated run per leg
    for (var i = 0; i < P.length - 1; i++) {
      var ax0 = P[i][0], az0 = P[i][1], ax1 = P[i + 1][0], az1 = P[i + 1][1], L = Math.hypot(ax1 - ax0, az1 - az0), ang = Math.atan2(ax1 - ax0, az1 - az0);
      var mk = box(HWD * 2 + 0.3, 0.05, L + 0.3, M0.kerb, (ax0 + ax1) / 2, 0.012, (az0 + az1) / 2, parent); mk.rotation.y = ang;
      var mp = box(HWD * 2, 0.06, L + 0.2, M0.pavers, (ax0 + ax1) / 2, 0.03, (az0 + az1) / 2, parent); mp.rotation.y = ang;
    }
    // and through the dragon arch out to where the street's paving ends (q[0] - 3.2), street width, so there is no grass gap
    var T0 = P[P.length - 1], xs = PK_JORIS_Q[0] - 3.3;
    box(T0[0] - xs + 0.3, 0.05, 3.5, M0.kerb, (T0[0] + xs) / 2, 0.012, T0[1], parent);
    box(T0[0] - xs + 0.2, 0.06, 3.2, M0.pavers, (T0[0] + xs) / 2, 0.03, T0[1], parent);
    // the rails either side: posts on the offset lines at each bend and every ~1.6 m between, two rails, a lantern now and then
    [-1, 1].forEach(function (s) {
      var pts = [];
      for (var i = 0; i < P.length; i++) {
        var a0 = P[Math.max(0, i - 1)], a1 = P[Math.min(P.length - 1, i + 1)], dx = a1[0] - a0[0], dz = a1[1] - a0[1], l = Math.hypot(dx, dz) || 1;
        pts.push([P[i][0] + s * (dz / l) * HWD, P[i][1] - s * (dx / l) * HWD]);
      }
      var lamp = 0;
      for (var k = 0; k < pts.length - 1; k++) {
        var p0 = pts[k], p1 = pts[k + 1], L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), n = Math.max(1, Math.round(L / 1.6));
        for (var j = 0; j <= n; j++) {
          if (j === n && k < pts.length - 2) continue;
          var x = p0[0] + (p1[0] - p0[0]) * j / n, z = p0[1] + (p1[1] - p0[1]) * j / n;
          cyl(0.06, 1.1, post, x, 0.55, z, parent, 6);
          if (s > 0 && (lamp++ % 4) === 2) {
            cyl(0.04, 1.4, iron, x, 1.8, z, parent, 6);
            var nx = s * (p1[1] - p0[1]) / L, nz = -s * (p1[0] - p0[0]) / L;   // outward from the path; the lantern leans in over it
            pkJorisLantern(parent, x, 2.35, z, -nx, -nz, 0.9);
          }
        }
        [0.5, 0.98].forEach(function (y) { pkRod(p0[0], y, p0[1], p1[0], y, p1[1], 0.035, rail, parent, 6); });
      }
    });
    // the corridor between the two tracks: a timber pergola over the line, its rails solid so no one steps onto the track
    var xW = P[0][0] - HWD, xE = P[0][0] + HWD, zS = P[1][1], zN = P[0][1];
    for (var pz = zS; pz >= zN - 0.01; pz -= 1.8) {
      [xW, xE].forEach(function (x) { cyl(0.08, 2.6, post, x, 1.3, pz, parent, 6); });
      box(xE - xW + 0.4, 0.18, 0.16, rail, (xW + xE) / 2, 2.62, pz, parent);
    }
    box(0.16, 0.14, zS - zN, rail, xW, 2.5, (zS + zN) / 2, parent); box(0.16, 0.14, zS - zN, rail, xE, 2.5, (zS + zN) / 2, parent);
    solid(xW - 0.08, xW + 0.08, zN, zS, 0, 1.2); solid(xE - 0.08, xE + 0.08, zN, zS, 0, 1.2);
    // the line's gate is the wooden one in the dragon arch (pkJorisPortal), worked by GATES; the corridor head stays open
    pkSign3D(['BLUE  OR  RED'], 1.7, 0.3, (xW + xE) / 2, 2.25, zS + 0.05, 0, { bg: '#1b232c', fg: PK_JORIS.sign }, parent);
    // the player's way on: press E at the tail of the line, by the dragon gate
    var T = P[P.length - 1];
    hitBox(2.0, 2.2, 2.0, T[0] + 0.6, 1.1, T[1], {
      prompt: function () {
        if (!a.open || PK.playerRide) return '';
        if (PK.playerWait && PK.playerWait.a === a) return 'Waiting for ' + a.name + ' - press E to leave the line';
        return 'Ride ' + a.name;
      },
      use: function () { pkPlayerRideJoin(a); }
    }, parent);
    // the arch gate, closed, holds the player back like the generic lane's boarding gate does (part 15, pkLaneCollides)
    var Q = PK_JORIS_Q;
    PK.lanes.push({ a: a, x0: Q[0] - 1, x1: Q[0] + 1, zA: Q[1] - 2.2, zB: Q[1] + 2.2, gx: Q[0], gz0: Q[1] - 2, gz1: Q[1] + 2, segs: [], rows: 1, leafL: a.jorisGateL || null, leafR: a.jorisGateR || null });
  }
  // hide whatever the cabin kit built as a grounded base under the cabin floor (its grey concrete plinth)
  function pkJorisStripBase(g, n0, cx) {
    g.updateMatrixWorld(true);
    for (var i = n0; i < g.children.length; i++) {
      g.children[i].traverse(function (o) {
        if (!o.isMesh) return;
        var b = new THREE.Box3().setFromObject(o);
        if (b.max.y <= 3.52 && b.min.x >= cx - 3.4 && b.max.x <= cx + 3.4 && b.min.z >= -14.9 && b.max.z <= -10.1) o.visible = false;
      });
    }
  }
  // ── The operator's stair: small and steep, in the east half of the entrance corridor beside the line (a solid rail
  // between them), climbing north from the ground at z -4.4 onto the gallery landing at the booth's back (z -9, 3.62).
  // Its east side is a solid rail too: the Vuur track passes just beyond it. Nothing across its foot but a header with
  // the sign: the player is the operator; guests never route here. ──
  function pkJorisStair(g, cx) {
    var M0 = pkMats();
    var tread = std({ map: M0.bark.map, color: 0x7a5a3a, roughness: 0.85 }), dark = std({ map: M0.clap.map, color: 0x3a2a1a, roughness: 0.7 }), wood = std({ map: M0.clap.map, color: 0x6a4a30, roughness: 0.85 });
    var iron = std({ color: 0x2a2d32, roughness: 0.5, metalness: 0.6 }), post = std({ map: M0.bark.map, color: 0x4a3420, roughness: 0.85 });
    var sx = PK_JORIS_LINE[0][0] + 1.6, HW = 0.45, N = 8;   // walls at sx -/+ 0.54 (pkJorisEnclosure): 1 m clear
    var ZF = -4.4, RUN = 4.6, TOP = 3.62, ang = Math.atan2(TOP, RUN), L = Math.sqrt(TOP * TOP + RUN * RUN), m, i;
    for (i = 0; i < N; i++) {
      var top = TOP * (i + 1) / N, zz = ZF - (i + 0.5) * RUN / N;
      box(HW * 2, 0.1, RUN / N + 0.04, tread, sx, top - 0.05, zz, g);
      box(HW * 2, TOP / N, 0.05, dark, sx, top - TOP / (2 * N), zz + RUN / (2 * N), g);
    }
    // it climbs toward -z, so the +z end of each raked piece goes down (+ang)
    [-1, 1].forEach(function (s) {
      m = box(0.1, 0.34, L, wood, sx + s * (HW + 0.05), TOP / 2 - 0.12, ZF - RUN / 2, g); m.rotation.x = ang;
      m = box(0.05, 0.05, L, iron, sx + s * (HW + 0.05), TOP / 2 + 0.9, ZF - RUN / 2, g); m.rotation.x = ang;
      for (var j = 0; j < N; j += 2) cyl(0.03, 0.9, iron, sx + s * (HW + 0.05), TOP * (j + 1) / N + 0.45, ZF - (j + 0.5) * RUN / N, g, 6);
    });
    PK_FLOOR_RECTS.push({ axis: 'z', x0: sx - HW, x1: sx + HW, z0: -9.2, z1: ZF - RUN, y: TOP, ramp: RUN, overhead: true });
    // (its walls and roof are pkJorisEnclosure's) the STAFF ONLY sign over the doorway at its foot
    pkSign3D(['STAFF ONLY'], 1.0, 0.24, sx, 2.0, ZF + 0.08, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);
  }
  // the gallery floor around the cabin: a landing across the hall front and along both cabin sides, on beams, joists and braces, with rails
  function pkJorisGallery(g, cx) {
    var M0 = pkMats();
    var wood = std({ map: M0.clap.map, color: 0x6a4a30, roughness: 0.85 }), dark = std({ map: M0.clap.map, color: 0x3a2a1a, roughness: 0.7 }), deck = std({ map: M0.bark.map, color: 0x8a6a48, roughness: 0.85 });
    var iron = std({ color: 0x2a2d32, roughness: 0.5, metalness: 0.6 }), m;
    box(9, 0.4, 0.45, dark, cx, 3.1, -9.0, g);
    box(8.8, 0.3, 1.6, deck, cx, 3.47, -9.8, g);
    [-1, 1].forEach(function (sg) {
      box(1.4, 0.3, 3.8, deck, cx + sg * 3.7, 3.47, -12.5, g);
      box(0.25, 0.3, 5.6, wood, cx + sg * 3.7, 3.15, -11.8, g);
      // the front beam overhangs the hall's end posts by a metre, so it gets its own post at each end, and a knee brace
      // from that post up to the beam (low end at the post, high end under the beam)
      box(0.3, 2.95, 0.3, dark, cx + sg * 4.3, 1.47, -9.0, g);
      m = box(1.7, 0.2, 0.22, dark, cx + sg * 3.7, 2.5, -9.0, g); m.rotation.z = -sg * 0.78;
    });
    // (the edges are walled, not railed: pkJorisEnclosure)
  }
  // ── The staff side, out of sight: the gallery landing round the booth and the operator's stair up to it are closed
  // in, timber walls in the hall's own manner (tan plank siding between dark posts) under a slate roof, instead of open
  // railings. The landing's front, which stands out over both tracks, gets a wall the full width of the hall with a
  // pent roof back to the hall's end wall; it carries the BLUE and RED boards over the tracks. The stair gets walls
  // both sides and a sloped roof, joined to the landing through an opening in that front wall; the STAFF ONLY doorway
  // stays at its foot. The two side landings get a wall across their north ends. All solid. ──
  function pkJorisEnclosure(g, cx) {
    var M0 = pkMats();
    var siding = std({ map: M0.clap.map, color: 0xa88a6a, roughness: 0.8 }), dark = std({ map: M0.clap.map, color: 0x2a1a0a, roughness: 0.65 });
    var roof = std({ map: M0.slate.map, color: 0x3a2a1a, roughness: 0.75, side: THREE.DoubleSide });
    var Y0 = 3.32, Y1 = 6.1, ZF = -8.95, X0 = cx - 4.5, X1 = cx + 4.5;
    var s0 = PK_JORIS_LINE[0][0] + 1.06, s1 = PK_JORIS_LINE[0][0] + 2.14;   // where the stair comes through
    function wallX(xa, xb, z, ya, yb) {   // a wall along x: siding and a post every ~1.5 m and at each end
      box(xb - xa, yb - ya, 0.12, siding, (xa + xb) / 2, (ya + yb) / 2, z, g);
      var n = Math.max(1, Math.round((xb - xa) / 1.5));
      for (var i = 0; i <= n; i++) box(0.2, yb - ya, 0.18, dark, xa + (xb - xa) * i / n, (ya + yb) / 2, z, g);
      box(xb - xa + 0.1, 0.16, 0.2, dark, (xa + xb) / 2, yb - 0.08, z, g);
      solid(xa, xb, z - 0.08, z + 0.08, ya, yb);
    }
    function wallZ(x, za, zb, ya, yb) {   // a wall along z
      box(0.12, yb - ya, Math.abs(zb - za), siding, x, (ya + yb) / 2, (za + zb) / 2, g);
      [za, zb].forEach(function (z) { box(0.18, yb - ya, 0.2, dark, x, (ya + yb) / 2, z, g); });
      box(0.2, 0.16, Math.abs(zb - za) + 0.1, dark, x, yb - 0.08, (za + zb) / 2, g);
      solid(x - 0.08, x + 0.08, Math.min(za, zb), Math.max(za, zb), ya, yb);
    }
    // the front landing: the front wall (open where the stair arrives), its two ends back to the hall, the pent roof
    wallX(X0, s0, ZF, Y0, Y1); wallX(s1, X1, ZF, Y0, Y1);
    box(s1 - s0 + 0.1, 0.25, 0.2, dark, (s0 + s1) / 2, Y1 - 0.12, ZF, g);   // the lintel over the stair's way in
    [X0, X1].forEach(function (x) { wallZ(x, -10.0, ZF, Y0, Y1); });
    var pr = box(X1 - X0 + 0.5, 0.12, 1.5, roof, cx, Y1 + 0.18, -9.45, g); pr.rotation.x = 0.18;   // falls to the south
    [-1, 1].forEach(function (s) { pkJorisLantern(g, cx + s * 4.05, 5.1, ZF + 0.1, 0, 1, 1.0); });  // the facade's corner lanterns
    // the BLUE and RED boards, on the front wall right over each track, and a lantern inside so it is not black in there
    [[-2.5, PK_JORIS.a, 'BLUE'], [2.5, PK_JORIS.b, 'RED']].forEach(function (t) {
      pkSign3D([t[2]], 1.6, 0.45, cx + t[0], 4.65, ZF + 0.08, 0, { bg: '#' + new THREE.Color(t[1]).getHexString(), fg: '#ffffff' }, g);
    });
    pkJorisLantern(g, cx - 1.5, 5.6, ZF - 0.08, 0, -1, 0.8);
    // the side landings: a wall across each one's north end (the hall's own walls and the booth close the rest)
    [-1, 1].forEach(function (sg) { wallX(cx + sg * 3.0 - (sg > 0 ? 0 : 1.5), cx + sg * 3.0 + (sg > 0 ? 1.5 : 0), -14.4, Y0, Y1); });
    // the operator's stair: walls both sides, stepping up with the treads, and a sloped roof over them
    // each wall is one piece with a straight sloped top running parallel to the stair, the roof laid right on it
    var ZB = -4.4, RUN = 4.6, TOP = 3.62, HD = 2.5;
    var wsh = new THREE.Shape(); wsh.moveTo(0, 0); wsh.lineTo(RUN, 0); wsh.lineTo(RUN, TOP + HD); wsh.lineTo(0, HD); wsh.lineTo(0, 0);
    [s0, s1].forEach(function (x) {
      var wm = new THREE.Mesh(new THREE.ExtrudeGeometry(wsh, { depth: 0.12, bevelEnabled: false }), siding);
      wm.rotation.y = Math.PI / 2; wm.position.set(x - 0.06, 0, ZB); g.add(wm);   // shape x runs up the stair (-z), shape y up
      [ZB, ZB - RUN / 2, ZB - RUN].forEach(function (z) { var h = TOP * (ZB - z) / RUN + HD; box(0.18, h, 0.2, dark, x, h / 2, z, g); });
      solid(x - 0.05, x + 0.05, ZB - RUN, ZB, 0, TOP + HD);
    });
    var ang = Math.atan2(TOP, RUN), L = Math.hypot(TOP, RUN) + 0.3;
    var sr = box(s1 - s0 + 0.5, 0.12, L, roof, (s0 + s1) / 2, HD + TOP / 2 + 0.06, ZB - RUN / 2, g); sr.rotation.x = ang;
    box(s1 - s0 + 0.24, 0.2, 0.2, dark, (s0 + s1) / 2, HD, ZB, g);   // the lintel over the door
    pkJorisLantern(g, s1 - 0.06, TOP / 2 + 2.1, ZB - RUN / 2, -1, 0, 0.7);   // a lantern halfway up, so it is not pitch dark
  }
  // one of the two split stairs: five timber treads up onto a platform, the risers and handrail in the track's colour
  // one of the two split stairs, from the hall floor at z -10.7 up five steps to the deck (0.6) at z -13: plank treads
  // with a nosing, dark risers with a painted kick strip, closed timber stringers, a newel post with a gold cap at each
  // end, balusters standing on the treads, and a handrail in the track's colour at 0.95 above the nosings
  function pkJorisSplitStair(g, px, col) {
    var M0 = pkMats();
    var tread = std({ map: M0.clap.map, color: 0x8a6a48, roughness: 0.85 }), dark = std({ map: M0.bark.map, color: 0x3a2716, roughness: 0.8 });
    var paint = std({ color: col, roughness: 0.55 }), gold = M0.gold;
    var ZB = -10.7, RUN = 2.3, TOP = 0.6, N = 5, HW = 0.62, RH = 0.95, d = RUN / N, ang = Math.atan2(TOP, RUN), L = Math.hypot(TOP, RUN), k;
    for (k = 0; k < N; k++) {
      var yk = TOP * (k + 1) / N, z0 = ZB - k * d;
      box(HW * 2, 0.06, d + 0.05, tread, px, yk - 0.03, z0 - d / 2 + 0.025, g);           // the tread, nosing over the riser
      box(HW * 2, TOP / N - 0.04, 0.05, dark, px, yk - TOP / (2 * N) - 0.03, z0 - 0.02, g);  // the riser
      box(HW * 2, 0.04, 0.02, paint, px, yk - 0.08, z0 + 0.012, g);                         // a kick strip in the track's colour
    }
    [-1, 1].forEach(function (s) {
      var x = px + s * (HW + 0.04);
      var st = box(0.07, 0.32, L, dark, x, TOP / 2 - 0.02, ZB - RUN / 2, g); st.rotation.x = ang;      // stringer, high at -z
      [[ZB + 0.05, 0], [ZB - RUN - 0.03, TOP]].forEach(function (n) {                                   // newels
        box(0.12, RH + 0.12, 0.12, dark, x, n[1] + (RH + 0.12) / 2, n[0], g);
        sphere(0.07, gold, x, n[1] + RH + 0.18, n[0], g);
      });
      pkRod(x, RH, ZB + 0.05, x, TOP + RH, ZB - RUN - 0.03, 0.035, paint, g, 8);                       // handrail
      for (k = 0; k < N; k++) {                                                                        // balusters on the treads
        var zz = ZB - (k + 0.5) * d, yt = TOP * (k + 1) / N, yr = RH + TOP * (ZB - zz) / RUN;
        cyl(0.018, yr - yt, dark, x, (yt + yr) / 2, zz, g, 5);
      }
    });
  }
  // ── The lower hall: the ground-floor entry at the station's south, under the control gallery, where the line forks
  // into the blue Water stair (west) and the red Vuur stair (east) up to the two boarding decks. ──
  function pkJorisLowerHall(g, HX) {
    var M0 = pkMats();
    var wood = std({ map: M0.clap.map, color: 0x6a4a30, roughness: 0.85 }), plank = std({ map: M0.clap.map, color: 0x7a5a3a, roughness: 0.9 }), dark = std({ map: M0.clap.map, color: 0x3a2a1a, roughness: 0.7 });
    var blue = std({ color: PK_JORIS.a, roughness: 0.7 }), red = std({ color: PK_JORIS.b, roughness: 0.7 }), goldM = std({ color: 0xc9a23a, roughness: 0.4, metalness: 0.6 });
    var floorM = std({ map: M0.stoneDark.map, color: 0x4a3826, roughness: 0.92 });
    // the hall floor, between the two tracks only (they pass through here at about 0.9 m on their way into the station),
    // from the line's head gate to the foot of the stairs
    box(3.5, 0.08, 4.4, floorM, HX, 0.04, -11.6, g);
    // a timber guard rail on each side, track-side, solid, from the head gate to where the stairs' own handrails take over
    [-1, 1].forEach(function (s) {
      var x = HX + s * 1.76;
      [-9.5, -10.05].forEach(function (z) { cyl(0.06, 1.05, dark, x, 0.52, z, g, 8); });
      sphere(0.07, goldM, x, 1.08, -9.5, g);
      [0.5, 0.95].forEach(function (y) { box(0.07, 0.07, 1.1, wood, x, y, -10.05, g); });   // meets the stair's own newel at -10.65
      solid(x - 0.06, x + 0.06, -13.0, -9.4, 0, 1.2);
    });
    // the two stairs
    pkJorisSplitStair(g, HX - 1.05, PK_JORIS.a);
    pkJorisSplitStair(g, HX + 1.05, PK_JORIS.b);
    // a sign over each stair, hung on two rods from the gallery's soffit above (a post from the floor stood in the
    // middle of the treads), and the "choose your track" board under the gallery's front edge
    var signIron = std({ color: 0x2a2d32, roughness: 0.5, metalness: 0.6 });
    [[-1.05, PK_JORIS.a, 'BLUE'], [1.05, PK_JORIS.b, 'RED']].forEach(function (t) {
      [-0.55, 0.55].forEach(function (dx) { cyl(0.02, 0.85, signIron, HX + t[0] + dx, 2.95, -12.6, g, 6); });
      pkSign3D([t[2]], 1.4, 0.4, HX + t[0], 2.45, -12.6, 0, { bg: t[1], fg: '#ffffff' }, g);
    });
    pkSign3D(['CHOOSE YOUR TRACK', 'BLUE OR RED'], 2.3, 0.55, HX, 2.8, -10.75, 0, { bg: '#1b232c', fg: PK_JORIS.sign }, g);
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
    var M0 = pkMats();
    var wood = std({ map: M0.bark.map, color: 0x3a2a1a, roughness: 0.7 }), plank = std({ map: M0.clap.map, color: 0x9a7a5a, roughness: 0.85 }), siding = std({ map: M0.clap.map, color: 0xa88a6a, roughness: 0.8 }), dark = std({ map: M0.clap.map, color: 0x2a1a0a, roughness: 0.65 });
    var iron = std({ color: 0x2a2d32, roughness: 0.5, metalness: 0.6 }), stoneA = std({ map: M0.stone.map, color: 0xaaa090, roughness: 0.95 }), stoneB = std({ map: M0.stone.map, color: 0x76716a, roughness: 0.95 });
    var roofMat = std({ map: M0.slate.map, color: 0x3a2a1a, roughness: 0.75, side: THREE.DoubleSide });
    var floorM = std({ color: 0x4a3826, roughness: 0.92 }), deckM = std({ color: 0x8a6a48, roughness: 0.85 });
    var blue = std({ color: PK_JORIS.a, roughness: 0.7 }), red = std({ color: PK_JORIS.b, roughness: 0.7 }), goldM = std({ color: 0xc9a23a, roughness: 0.4, metalness: 0.6 });
    var z1 = az - 9, z0 = az - 26, zc = (z0 + z1) / 2, len = z1 - z0, W = 4.5, H = 8, i;
    // floor, and one boarding deck per track on the inside of each train
    box(W * 2 + 0.6, 0.1, len, floorM, ax, 0.05, zc, g);
    // the decks run from the hall's north end to z -13, where the split stairs (pkJorisLowerHall) arrive at their height
    var dN = z0 + 1.3, dS = -13, dc = (dN + dS) / 2;
    [-1, 1].forEach(function (sg) { box(0.12, 0.02, dS - dN - 0.3, MAT.hazard, ax + sg * 1.76, 0.61, dc, g); });   // the edge stripes
    // side walls: a rubble stone plinth, plank infill, heavy posts, a mid rail and top plate, iron straps, shields and banners
    var bays = 5, bw = (len - 0.44) / bays;
    [-W, W].forEach(function (sx) {
      var inx = ax + sx - (sx > 0 ? 1 : -1) * 0.2;
      for (i = 0; i * 1.4 < len; i++) { var sl = Math.min(1.3, len - i * 1.4); box(0.6, 0.7 + (i % 3) * 0.06, sl, i % 2 ? stoneA : stoneB, ax + sx, 0.35, z1 - i * 1.4 - sl / 2, g); }
      box(0.25, H - 0.7, len, siding, ax + sx, 0.7 + (H - 0.7) / 2, zc, g);
      solid(ax + sx - 0.2, ax + sx + 0.2, z0, z1, 0, H);   // the wall is a wall: no walking (or falling) through it
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
      [-W, W].forEach(function (sx) { solid(ax + sx - 0.3, ax + sx + 0.3, zz - 0.3, zz + 0.3, 0, H); });
      pkJorisGable(W * 2 + 0.8, 2.2, 0.3, plank, ax, H, zz, g);
    });
    // lanterns at the south corners (on the end posts, facing the line) and between the bays on both side walls,
    // each a proper lantern on an iron bracket rather than a bare glowing ball
    for (i = 1; i < bays; i++) {
      var sz = z0 + 0.22 + i * bw;
      [-W, W].forEach(function (sx) { pkJorisLantern(g, ax + sx + (sx > 0 ? 0.12 : -0.12), 3.6, sz, sx > 0 ? 1 : -1, 0, 1); });
    }
    // the departure signals: one over each track on the north wall, facing the platform. Red while the train stands,
    // amber once the station gates are shut and the bars are down (ready to go), green from dispatch until it is home.
    pkJorisSignals(g, a, z0 + 0.32);
    // the roof, a ridge beam, and a carved dragon head on each gable
    var gr = new THREE.Group(); gr.position.set(ax, H, zc); gr.rotation.y = Math.PI / 2; g.add(gr);
    pkGableRoof(len, W * 2 + 0.6, 3.2, roofMat, wood, 0, 0, 0, gr, 0.4);
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
      // a post against the wall under each beam end (the bay posts don't line up with these beams), braced up to the beam
      [-1, 1].forEach(function (sg) {
        box(0.3, 2.95, 0.3, dark, ax + sg * 4.1, 1.47, zz, g);
        var kb = box(1.7, 0.2, 0.22, dark, ax + sg * 3.5, 2.5, zz, g); kb.rotation.z = -sg * 0.78;
      });
    });
    [-3, 0, 3].forEach(function (jx) { box(0.25, 0.3, 4.3, wood, ax + jx, 3.15, -12.5, g); });
    box(6.4, 0.1, 4.4, wood, ax, 3.42, -12.5, g);
    // the south facade, seen by the queue: the title, a BLUE and a RED board on the header right over each track's
    // opening, the checkered finish strip and bunting
    var F = new THREE.Group(); F.position.set(ax, 0, z1 + 0.2); g.add(F);
    pkSign3D(['THE ARMOURY'], 3.4, 0.8, 0, 7.15, 0, 0, { bg: '#1b232c', fg: PK_JORIS.sign }, F);
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
    // the winner's banners, rolled up under the roof over each track (pkJorisRun drops the winner's; the booth rolls them up)
    var banners = pkJorisBanners(g, ax, -18.0);
    // gold chandeliers over the lanes, hung from the roof on chains
    [14, 20].forEach(function (lx) {
      [-2.5, 2.5].forEach(function (lz) {
        var ch = new THREE.Group(); ch.position.set(ax + lz, 6.2, az - lx); g.add(ch);
        pkRing(0.7, 0.05, goldM, 0, 0, 0, ch, 20); pkRing(0.4, 0.04, goldM, 0, -0.16, 0, ch, 16);
        cyl(0.03, 1.6, goldM, 0, 0.8, 0, ch, 6);
        for (var c = 0; c < 6; c++) { var ca = c / 6 * 6.28; (a.extra.hallLamps = a.extra.hallLamps || []).push(cyl(0.03, 0.16, glowMat(0xfff2c0, 1.4), Math.cos(ca) * 0.68, -0.08, Math.sin(ca) * 0.68, ch, 4)); }
      });
    });
    // work lights under the roof, for the crew after hours: white tubes in steel troughs, off until the booth's switch
    a.extra.workLamps = [];
    [-1.4, 1.4].forEach(function (dx) {
      [-14.5, -19.5, -24.5].forEach(function (wz) {
        box(0.2, 0.08, 2.0, iron, ax + dx, 7.72, wz, g);
        var tube = box(0.08, 0.04, 1.9, glowMat(0xeef4ff, 2.0), ax + dx, 7.66, wz, g); tube.visible = false; a.extra.workLamps.push(tube);
      });
    });
    // the platform proper (kerb, pavers, edge stripe) on the island between the two trains, one half per track, meeting
    // at the centre line: the trains stand at ax -/+ 2.5 and their inner edges at about -/+ 1.8, so that island is all
    // the platform there is. North end to z -13, where the split stairs arrive. No planters or lamps at its ends (they
    // would stand in the stair heads), and its own south ramp is dropped: riders come up the split stairs instead (the
    // ramp is always the last child pkCoPlatform adds, and the last floor rect). The per-row gates are pkJorisRowGates.
    pkCoPlatform(g, ax - 1.82, ax + 1.82, dN, dS, PK_THEME.joris, 0.6, [false, false]);
    g.children[g.children.length - 1].visible = false; PK_FLOOR_RECTS[PK_FLOOR_RECTS.length - 1].ramp = 0;
    return banners;
  }
  // ── A walk from the East Walk to the train station gate in the park's east fence (x 123, z -4.4 to 0.2), along z -3,
  // outside the ride's track fence (z -4.6). Joris's own line runs across it into the entrance corridor, so a timber
  // footbridge carries the walk over the line: ramps up from the west and down to the east, a trussed main span over
  // the line, on trestle bents. Its floors are 'overhead' (only the player walks them; guests in the line pass under). ──
  function pkJorisBridge(g) {
    var M0 = pkMats();
    var plank = std({ map: M0.clap.map, color: 0x7a5a3a, roughness: 0.85 }), beam = std({ map: M0.bark.map, color: 0x4a3420, roughness: 0.85 });
    var stone = std({ map: M0.stone.map, color: 0x9a948a, roughness: 0.95 });
    var Z = -3.3, HW = 1.1, Y = 3.1, D0 = 96.0, D1 = 103.0, RL = 14.0, XW = D0 - RL, XE = D1 + RL;
    var hAt = function (x) { return x <= D0 ? Y * Math.max(0, (x - XW) / RL) : x >= D1 ? Y * Math.max(0, (XE - x) / RL) : Y; };
    // (the walk on the ground at both ends is two park routes, registered with the plot)
    // the deck: the two ramps as sloped runs and the level span, each a plank deck on two stringers
    var ang = Math.atan2(Y, RL), RLen = Math.hypot(Y, RL);
    [[XW, D0, -1], [D1, XE, 1]].forEach(function (r) {
      var mx = (r[0] + r[1]) / 2, my = Y / 2;
      var d = box(RLen, 0.12, HW * 2, plank, mx, my, Z, g); d.rotation.z = -r[2] * ang;   // west rises toward +x, east falls
      [-1, 1].forEach(function (s) { var st = box(RLen, 0.3, 0.14, beam, mx, my - 0.2, Z + s * (HW - 0.1), g); st.rotation.z = -r[2] * ang; });
    });
    box(D1 - D0, 0.12, HW * 2, plank, (D0 + D1) / 2, Y - 0.06, Z, g);
    [-1, 1].forEach(function (s) { box(D1 - D0, 0.3, 0.14, beam, (D0 + D1) / 2, Y - 0.27, Z + s * (HW - 0.1), g); });
    // stone abutments where the ramps meet the ground
    [XW, XE].forEach(function (x) { box(0.8, 0.3, HW * 2 + 0.4, stone, x, 0.15, Z, g); });
    // trestle bents under the ramps (none under the main span: it clears the line below), each two posts, a cap and a brace
    [XW + 4.5, XW + 9.5, D0, D1, XE - 9.5, XE - 4.5].forEach(function (x) {
      var h = hAt(x) - 0.3;
      [-1, 1].forEach(function (s) { box(0.22, h, 0.22, beam, x, h / 2, Z + s * (HW - 0.05), g); });
      box(0.26, 0.2, HW * 2 + 0.3, beam, x, h - 0.05, Z, g);
      if (h > 1.2) { var br = box(0.1, Math.hypot(h * 0.8, HW * 2), 0.1, beam, x, h * 0.45, Z, g); br.rotation.x = Math.atan2(HW * 2, h * 0.8); }
    });
    // railings: posts every ~1.6 m along both edges, a top and a mid rail following the deck; on the main span a timber
    // truss (diagonals between the posts) as the parapet. Solid at deck height so no one steps off the side.
    [-1, 1].forEach(function (s) {
      var zr = Z + s * (HW + 0.02), xs = [];
      for (var x = XW + 0.4; x <= XE - 0.4 + 0.01; x += 1.6) xs.push(x);
      xs.forEach(function (x) { var h = hAt(x); box(0.12, 1.1, 0.12, beam, x, h + 0.55, zr, g); });
      for (var k = 0; k < xs.length - 1; k++) {
        var a0 = xs[k], a1 = xs[k + 1], h0 = hAt(a0), h1 = hAt(a1);
        [0.5, 1.05].forEach(function (dy) { pkRod(a0, h0 + dy, zr, a1, h1 + dy, zr, 0.04, plank, g, 6); });
        if (a0 >= D0 - 0.01 && a1 <= D1 + 0.01) pkRod(a0, h0 + 0.1, zr, a1, h1 + 1.0, zr, 0.04, beam, g, 6);
        solid(a0, a1, zr - 0.06, zr + 0.06, Math.min(h0, h1) + 0.2, Math.max(h0, h1) + 1.15);
      }
    });
    // a lantern on each corner of the main span
    [[D0, -1], [D0, 1], [D1, -1], [D1, 1]].forEach(function (c) {
      var zr = Z + c[1] * (HW + 0.02);
      box(0.14, 1.6, 0.14, beam, c[0], Y + 0.8, zr, g);
      pkJorisLantern(g, c[0], Y + 1.45, zr, 0, -c[1], 0.8);
    });
    // the floors: one rect over the span, ramping down west (rampDir -1) and east
    PK_FLOOR_RECTS.push({ x0: D0, x1: D1, z0: Z - HW, z1: Z + HW, y: Y, ramp: RL, overhead: true });
    PK_FLOOR_RECTS.push({ x0: D0, x1: D1, z0: Z - HW, z1: Z + HW, y: Y, ramp: RL, rampDir: -1, overhead: true });
  }
  // ── The operator's desk (pkCabinBuild calls this in place of the kit's desk; the ride panel goes in its middle). In the
  // desk group's own frame: +z toward the chair, -z toward the window, the top at 0.745. A walnut desk the full width of
  // the window with a brass nosing, pedestals at both wings and the knee space in the middle; on the left wing the public
  // address console with its gooseneck microphone, the logbook and the queue camera; on the right the show effects
  // console, the telephone, the radio, a desk lamp and the race board; on a riser along the back the screens. ──
  function pkJorisDesk(a, con, W) {
    var M0 = pkMats(), E = a.extra;
    var walnut = std({ map: M0.clap.map, color: 0x3a2618, roughness: 0.6 }), dark = std({ color: 0x1a1410, roughness: 0.7 });
    var topM = std({ map: M0.bark.map, color: 0x2e1e12, roughness: 0.4 }), brass = M0.brass || M0.gold, black = std({ color: 0x15171a, roughness: 0.5 });
    var DW = W - 0.3, TOPY = 0.745, WING = (DW - 1.9) / 2;
    // the desk
    box(DW + 0.04, 0.05, 0.66, topM, 0, TOPY - 0.025, 0, con);
    box(DW + 0.04, 0.03, 0.02, brass, 0, TOPY - 0.03, 0.335, con);
    [-1, 1].forEach(function (s) {
      var xc = s * (0.95 + WING / 2);
      box(WING, TOPY - 0.05, 0.6, walnut, xc, (TOPY - 0.05) / 2, 0, con);
      for (var d = 0; d < 3; d++) {   // raised drawer fronts with brass pulls
        box(WING - 0.12, 0.17, 0.02, dark, xc, 0.14 + d * 0.2, 0.305, con);
        box(0.16, 0.025, 0.025, brass, xc, 0.14 + d * 0.2, 0.32, con);
      }
    });
    box(1.9, 0.55, 0.03, walnut, 0, 0.42, -0.28, con);                          // the modesty panel behind the knees
    box(DW, 0.03, 0.24, walnut, 0, 0.98, -0.2, con);                            // the screen riser along the back
    [-DW / 2 + 0.05, -0.97, 0.97, DW / 2 - 0.05].forEach(function (x) { box(0.05, 0.24, 0.2, walnut, x, 0.865, -0.2, con); });
    // the two side consoles: printed plates on sloped housings, real caps and switches on them
    function consolePlate(key, x, title, draw) {
      var P = pkCtlPanel({ w: 1.0, h: 0.34, x: x, y: TOPY + 0.17, z: 0.12, tilt: -0.5, key: key, parent: con,
        paint: function (c, w, h) { var gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#163a34'); gr.addColorStop(1, '#0a201c'); c.fillStyle = gr; c.fillRect(0, 0, w, h); },
        draw: function (c, w, h) {
          c.fillStyle = '#9fe0d4'; c.font = 'bold ' + Math.round(h * 0.13) + 'px Bahnschrift, Arial, sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
          c.fillText(title, w * 0.03, h * 0.12); c.strokeStyle = 'rgba(159,224,212,0.5)'; c.lineWidth = 4; c.strokeRect(w * 0.015, h * 0.24, w * 0.97, h * 0.72);
          draw(c, w, h);
        }, rim: brass, screw: brass, glow: 0.3 });
      box(1.04, 0.38, 0.24, black, 0, 0, -0.16, P);   // the sloped housing behind the plate (its lower edge sinks into the desk top)
      return P;
    }
    function label(c, w, h, t, fx, fy) { c.fillStyle = '#cfeee6'; c.font = Math.round(h * 0.075) + 'px Bahnschrift, Arial, sans-serif'; c.textAlign = 'center'; c.fillText(t, w * fx, h * fy); }
    var ZONES = ['STATION', 'QUEUE', 'PLAZA', 'EXIT', 'LIFT', 'ALL CALL'];
    var PA = consolePlate('pk-joris-pa', -1.55, 'PUBLIC ADDRESS', function (c, w, h) {
      ZONES.forEach(function (z, i) { label(c, w, h, z, 0.1 + i * 0.13, 0.82); });
      for (var b = 0; b < 12; b++) { c.fillStyle = b < 8 ? '#3fae6a' : b < 10 ? '#e0b030' : '#d84a3a'; c.fillRect(w * (0.06 + b * 0.034), h * 0.36, w * 0.026, h * 0.08); }
      label(c, w, h, 'LEVEL', 0.26, 0.52); label(c, w, h, 'TALK', 0.84, 0.52); label(c, w, h, 'CHIME', 0.84, 0.82);
    });
    // the public address: pick a zone (its button stays lit), then TALK to announce there; CHIME rings the chime
    var FXS = E.fx = E.fx || { fire: false, fog: false, roarT: 0, zone: 5 };
    var SAY = ['Please keep your arms and legs inside the train, and hold on to the bar.', 'Choose your side: Blue or Red. The dragon is waiting!',
      'The Dragon Ride is racing - knights wanted at the Armoury!', 'Thank you for riding. Please mind your step on the way out.',
      'Lift crew, stand clear of the chain.', 'Attention please: the Dragon Ride is racing now!'];
    var ZCOL = ['green', 'blue', 'white', 'white', 'amber', 'red'], zoneBtns = [];
    ZONES.forEach(function (z, i) {
      zoneBtns.push(pkCtlBtn(PA, -0.4 + i * 0.13, -0.05, { r: 0.028, col: ZCOL[i], lampCol: 0xfff0b0, label: z + ' zone', prompt: 'Speak to the ' + z.toLowerCase() + (i === 5 ? '' : ' zone'),
        act: function () { FXS.zone = i; sfx('click'); zoneBtns.forEach(function (b, k) { b.setLit(k === i); }); } }));
    });
    zoneBtns[FXS.zone].setLit(true);
    pkCtlBtn(PA, 0.34, 0.045, { r: 0.042, col: 'red', label: 'TALK', prompt: 'Talk on the public address',
      act: function () { sfx('chime'); toast('PA - ' + ZONES[FXS.zone] + ': "' + SAY[FXS.zone] + '"', ''); } });
    pkCtlBtn(PA, 0.34, -0.05, { r: 0.03, col: 'white', label: 'CHIME', prompt: 'Ring the chime', act: function () { sfx('chime'); } });
    // the show effects: switches for the dragon's fire, the fog over her swamp, the hall's chandeliers and the work
    // lights; buttons for her roar and the bell; and BANNERS UP, which rolls the winner's banners back into the roof
    var FXN = ['DRAGON FIRE', 'ROAR', 'FOG', 'HALL LIGHTS', 'WORK LIGHTS', 'BELL'];
    var FX = consolePlate('pk-joris-fx', 1.55, 'SHOW EFFECTS', function (c, w, h) {
      FXN.forEach(function (n, i) { label(c, w, h, n, 0.15 + (i % 3) * 0.24, i < 3 ? 0.56 : 0.93); });
      c.fillStyle = '#e8c45a'; c.font = 'bold ' + Math.round(h * 0.08) + 'px Bahnschrift, Arial, sans-serif'; c.textAlign = 'center';
      c.fillText('BANNERS', w * 0.88, h * 0.4); c.fillText('UP', w * 0.88, h * 0.5);
    });
    var fxX = function (i) { return -0.35 + (i % 3) * 0.24; }, fxY = function (i) { return i < 3 ? 0.065 : -0.075; };
    var showSet = function (list, on) { (list || []).forEach(function (m) { m.visible = on; }); };
    pkCtlToggle(FX, fxX(0), fxY(0), { prompt: 'Dragon fire', onName: 'FIRE', offName: 'OFF', act: function (on) { FXS.fire = on; sfx(on ? 'pkDanseThunder' : 'click'); } });
    pkCtlBtn(FX, fxX(1), fxY(1), { r: 0.03, col: 'red', label: 'ROAR', prompt: 'Make the dragon roar', act: function () { FXS.roarT = 1.8; sfx('pkDanseGrowl'); } });
    pkCtlToggle(FX, fxX(2), fxY(2), { prompt: 'Swamp fog', onName: 'FOG', offName: 'OFF', act: function (on) { FXS.fog = on; pkJorisFog(E); showSet(E.fogPuffs, on); } });
    pkCtlToggle(FX, fxX(3), fxY(3), { on: true, prompt: 'Hall lights', act: function (on) { showSet(E.hallLamps, on); } });
    pkCtlToggle(FX, fxX(4), fxY(4), { prompt: 'Work lights', act: function (on) { showSet(E.workLamps, on); } });
    pkCtlBtn(FX, fxX(5), fxY(5), { r: 0.03, col: 'amber', label: 'BELL', prompt: 'Ring the bell', act: function () { sfx('bell'); } });
    pkCtlBtn(FX, 0.38, -0.07, { r: 0.045, col: 'amber', label: 'BANNERS UP', prompt: 'Roll the winner\'s banners up',
      act: function () { var B = E.banners; if (B) { B.water.want = 0; B.vuur.want = 0; } sfx('click'); } });
    // the effects themselves, every frame: her fire roars while the switch is on, she shakes her head while roaring,
    // the fog drifts
    pkCtlLive({ tick: function (dt) {
      var D = E.dragon; if (!D) return;
      var t = performance.now() / 1000, head = D.userData.head, fire = D.userData.fire;
      if (FXS.fire && fire) { var s = 1.9 + 0.5 * Math.sin(t * 17) + 0.3 * Math.sin(t * 7.3); fire.scale.set(s, s, s * 1.6); }
      if (head) { FXS.roarT = Math.max(0, FXS.roarT - dt); head.rotation.z = FXS.roarT > 0 ? Math.sin(t * 28) * 0.12 * Math.min(1, FXS.roarT) : 0; }
      if (FXS.fog && E.fogPuffs) E.fogPuffs.forEach(function (p, i) { p.position.x = p.userData.x + Math.sin(t * 0.3 + i) * 0.6; p.position.z = p.userData.z + Math.cos(t * 0.25 + i * 1.7) * 0.6; });
    } });
    // the gooseneck microphone, its "on air" ring, by the left edge of the ride panel
    var mx = -1.0, mz = 0.22, iron = std({ color: 0x2a2d32, roughness: 0.4, metalness: 0.7 });
    pkRoundCyl(0.07, 0.03, black, mx, TOPY + 0.015, mz, con, 16);
    var neck = [[mx, TOPY + 0.03, mz], [mx, TOPY + 0.2, mz - 0.02], [mx + 0.03, TOPY + 0.34, mz + 0.03], [mx + 0.06, TOPY + 0.4, mz + 0.12]];
    for (var n = 0; n < neck.length - 1; n++) pkRod(neck[n][0], neck[n][1], neck[n][2], neck[n + 1][0], neck[n + 1][1], neck[n + 1][2], 0.012, iron, con, 6);
    sphere(0.035, black, mx + 0.075, TOPY + 0.41, mz + 0.16, con).scale.set(1, 1, 1.4);
    pkRoundCyl(0.075, 0.012, glowMat(0xff3a2a, 1.2), mx, TOPY + 0.034, mz, con, 16);
    // the logbook, open, and a pen
    box(0.34, 0.02, 0.24, std({ color: 0xece4d0, roughness: 0.8 }), -2.45, TOPY + 0.01, 0.15, con);
    box(0.01, 0.025, 0.24, std({ color: 0x5a2a1a, roughness: 0.7 }), -2.45, TOPY + 0.012, 0.15, con);
    var pen = box(0.14, 0.012, 0.012, black, -2.35, TOPY + 0.03, 0.2, con); pen.rotation.y = 0.5;
    // the telephone: a body, a handset on its cradle and a coiled cord
    box(0.18, 0.06, 0.2, black, 2.55, TOPY + 0.03, 0.17, con);
    var hs = box(0.2, 0.04, 0.05, black, 2.55, TOPY + 0.08, 0.17, con); hs.rotation.y = Math.PI / 2;
    pkRod(2.46, TOPY + 0.03, 0.17, 2.3, TOPY + 0.01, 0.24, 0.01, black, con, 4);
    // the coffee mug, by the phone
    pkRoundCyl(0.04, 0.09, std({ color: PK_JORIS.b, roughness: 0.5 }), 2.25, TOPY + 0.045, 0.22, con, 12);
    // the radio: a cabinet with a speaker grille, a dial, a handset clipped to its side and an aerial
    box(0.3, 0.2, 0.16, black, 2.45, TOPY + 0.1 + 0.23, -0.2, con);
    for (var gl = 0; gl < 5; gl++) box(0.12, 0.012, 0.005, MAT.chrome, 2.39, TOPY + 0.29 + gl * 0.025, -0.118, con);
    sphere(0.025, MAT.chrome, 2.54, TOPY + 0.36, -0.115, con);
    box(0.06, 0.12, 0.04, black, 2.62, TOPY + 0.33, -0.2, con);
    pkRod(2.36, TOPY + 0.43, -0.22, 2.3, TOPY + 0.75, -0.24, 0.006, MAT.chrome, con, 4);
    // a desk lamp, its glow on the right wing
    pkRoundCyl(0.07, 0.025, brass, 2.75, TOPY + 0.24, -0.2, con, 14);
    pkRod(2.75, TOPY + 0.25, -0.2, 2.72, TOPY + 0.6, -0.08, 0.012, brass, con, 6);
    pkRod(2.72, TOPY + 0.6, -0.08, 2.62, TOPY + 0.62, 0.06, 0.012, brass, con, 6);
    var shade = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.1, 14, 1, true), std({ color: 0x1f4a3a, roughness: 0.5, side: THREE.DoubleSide })); shade.position.set(2.62, TOPY + 0.58, 0.08); con.add(shade);
    sphere(0.035, glowMat(0xffd88a, 1.6), 2.62, TOPY + 0.55, 0.08, con);
    // a little carved dragon at the right end of the riser
    var dg = std({ color: 0x3f6b34, roughness: 0.6 }), dy = 1.0;
    sphere(0.07, dg, 1.15, dy + 0.06, -0.2, con).scale.set(1, 0.8, 1.6);
    pkRod(1.15, dy + 0.08, -0.13, 1.17, dy + 0.18, -0.07, 0.025, dg, con, 6);
    sphere(0.04, dg, 1.17, dy + 0.2, -0.05, con).scale.set(1, 0.9, 1.4);
    [-1, 1].forEach(function (s) { var wg = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.12, 3), dg); wg.position.set(1.15 + s * 0.06, dy + 0.12, -0.22); wg.rotation.z = -s * 0.8; wg.scale.set(1, 1, 0.3); con.add(wg); });
    // the screens on the riser: the queue camera and the race board over the left wing, the block map over the right
    var mon = function (x, title, draw) { var sc = pkBkMonitor(con, x, 1.2, -0.2, 0, -0.08, title, draw); pkPowerScreen(sc, function () { return !!a.open; }); box(0.06, 0.04, 0.12, black, x, 1.0, -0.21, con); return sc; };
    // CAM 1: a live feed from a camera over the dragon gate, looking down the queue
    pkCctvFeed(con, -2.25, 1.2, -0.2, 0, -0.08, [90.2, 3.0, 1.5], [98, 0.5, -3]);
    box(0.06, 0.04, 0.12, black, -2.25, 1.0, -0.21, con);
    mon(-1.45, 'RACE · blue against red', function (c, s) {
      c.fillStyle = '#0b0d12'; c.fillRect(0, 0, s.w, s.h); c.textBaseline = 'alphabetic';
      c.fillStyle = '#e8d8a0'; c.font = 'bold 13px monospace'; c.textAlign = 'center'; c.fillText('THE RACE', s.w / 2, 18);
      [['BLUE', '#4f8fe0', E.winsWater || 0, 0.27], ['RED', '#e0604a', E.winsVuur || 0, 0.73]].forEach(function (t) {
        c.fillStyle = t[1]; c.font = 'bold 16px monospace'; c.fillText(t[0], s.w * t[3], 48); c.font = 'bold 40px monospace'; c.fillText(String(t[2]), s.w * t[3], 95);
      });
      c.fillStyle = '#e8d8a0'; c.font = '13px monospace';
      var st = a.state === 'running' ? 'RACING...' : (E.winner && E.announced ? (E.winner === 'water' ? 'BLUE' : 'RED') + ' WON' : 'READY');
      c.fillText(st, s.w / 2, 135); pkBkScanlines(c, s.w, s.h);
    });
    var PLAN = null;
    mon(1.75, 'BLOCKS · both tracks', function (c, s) {
      c.fillStyle = '#070b11'; c.fillRect(0, 0, s.w, s.h);
      if (!PLAN) {
        var xs = [], zs = []; PLAN = [E.water.curve, E.vuur.curve].map(function (cv) { var P = []; for (var i = 0; i <= 120; i++) { var q = cv.getPointAt(i / 120); P.push([q.x, q.z]); xs.push(q.x); zs.push(q.z); } return P; });
        PLAN.x0 = Math.min.apply(null, xs); PLAN.x1 = Math.max.apply(null, xs); PLAN.z0 = Math.min.apply(null, zs); PLAN.z1 = Math.max.apply(null, zs);
      }
      // the strip runs north up the screen, so the plan is turned: world z down the screen width, world x up it
      var k = Math.min((s.w - 30) / (PLAN.z1 - PLAN.z0), (s.h - 40) / (PLAN.x1 - PLAN.x0));
      var X = function (x, z) { return [15 + (PLAN.z1 - z) * k, s.h - 15 - (x - PLAN.x0) * k]; };
      ['#4f8fe0', '#e0604a'].forEach(function (col, j) {
        c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); PLAN[j].forEach(function (p, i) { var q = X(p[0], p[1]); if (i) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); }); c.stroke();
        var lead = (j ? E.vuur : E.water).cars[0].g.position, q = X(lead.x, lead.z);
        c.fillStyle = '#ffffff'; c.beginPath(); c.arc(q[0], q[1], 4, 0, 6.283); c.fill();
      });
      c.fillStyle = '#9fc6ff'; c.font = 'bold 12px monospace'; c.textAlign = 'left'; c.fillText('BLOCKS  ' + pkBkWord(a), 8, 14);
      pkBkScanlines(c, s.w, s.h);
    });
    // four more screens hang from the ceiling, two on each side in the corners: the platform, the lift, the exit and the
    // departure signals, so the operator can watch the whole ride without leaving the chair
    var bracket = function (x, z, ry) {
      var hg = new THREE.Group(); hg.position.set(x, 2.6, z); hg.rotation.y = ry; con.add(hg);
      pkRoundCyl(0.02, 0.4, M0.iron, 0, 0.42, -0.06, hg, 6);      // the drop rod
      box(0.94, 0.04, 0.04, M0.iron, 0, 0.24, -0.06, hg);          // the crossbar
      return hg;
    };
    var sig = function () {   // the departure signal, the same as the lamps over the tracks (pkjorisSignals)
      var C = pkCtl(a), E = a.extra, st;
      if (!a.open) st = -1;
      else if (a.state === 'running' || a.state === 'dispatch') {
        if (E.pLift === undefined && E.water && E.water.uOfF && E.water.uOfF.length) { E.pLift = pkJorisShare(E, E.uLift, 0.08); E.pTop = pkJorisShare(E, E.uTop, 0.22); }
        var p = clamp(a.t / Math.max(1, a.run), 0, 1);
        st = p < (E.pLift || 0.08) ? 2 : p < (E.pTop || 0.22) ? 1 : 0;
      } else st = (a.stationGates === false && (C.barsWant || 0) > 0.5) ? 1 : 0;
      return st;
    };
    // the pairs hang from the ceiling, pulled in off the walls so they can turn toward the chair without poking through
    var hgL = bracket(-2.5, 0.3, Math.PI / 2 - 0.5);   // left, angled ~29 deg toward the chair
    pkCctvFeed(hgL, -0.27, 0, 0, 0, 0.5, [100, 4.5, -13.5], [100, 0.5, -22]);   // CAM 2: the platform
    pkCctvFeed(hgL, 0.27, 0, 0, 0, 0.5, [100, 18, -45], [100, 2, -25]);        // CAM 3: the lift
    var hgR = bracket(2.5, 0.3, -Math.PI / 2 + 0.5);  // right, angled ~29 deg toward the chair
    pkCctvFeed(hgR, -0.27, 0, 0, 0, 0.5, [86.5, 3.0, -2.0], [94, 1, -1]);       // CAM 4: the exit
    var sg = pkBkMonitor(hgR, 0.27, 0, 0, 0, 0.5, 'SIGNALS', function (c, s) {
        c.fillStyle = '#070b11'; c.fillRect(0, 0, s.w, s.h);
        c.fillStyle = '#e8d8a0'; c.font = 'bold 13px monospace'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
        c.fillText('DEPARTURE', s.w / 2, 16);
        var st = sig(), cols = [0xff2a1a, 0xffa31a, 0x2aff5a], names = ['HOLD', 'READY', 'GO'];
        [['RED', 0xff2a1a], ['AMBER', 0xffa31a], ['GREEN', 0x2aff5a]].forEach(function (t, i) {
          var y = 42 + i * 40;
          c.fillStyle = st === i ? t[1] : 'rgba(255,255,255,0.14)';
          c.beginPath(); c.arc(24, y, 10, 0, 6.283); c.fill();
          c.fillStyle = st === i ? t[1] : '#7d8a96'; c.textAlign = 'left'; c.font = 'bold 14px monospace';
          c.fillText(t[0], 44, y + 5);
        });
        c.fillStyle = '#e8d8a0'; c.textAlign = 'center'; c.font = 'bold 16px monospace';
        c.fillText(!a.open ? 'NO POWER' : names[Math.max(0, st)], s.w / 2, 150);
        pkBkScanlines(c, s.w, s.h);
      });
    pkPowerScreen(sg, function () { return !!a.open; });
  }
  // ── The winner's banners: one over each track, rolled up on a pole under the roof. Dropping, the cloth unrolls from
  // the pole (the pole turns as it pays out) to hang 3 m in the track's colour with a gold border and a fringe, its
  // track's name and WINS on it, and a weighted batten along the hem. want 1 drops it, 0 rolls it up; a tick eases it. ──
  function pkJorisBanners(g, ax, z) {
    var out = {}, L = 3.0, BW = 2.0, TOP = 7.55, gold = pkMats().gold;
    [['water', -2.5, PK_JORIS.a, 'BLUE'], ['vuur', 2.5, PK_JORIS.b, 'RED']].forEach(function (t) {
      var col = '#' + new THREE.Color(t[2]).getHexString();
      var cloth = tex(256, 384, function (c, w, h) {
        c.clearRect(0, 0, w, h);
        c.fillStyle = col; c.beginPath(); c.moveTo(0, 0); c.lineTo(w, 0); c.lineTo(w, h - 34);
        for (var k = 8; k >= 0; k--) c.lineTo(w * k / 8, k % 2 ? h - 34 : h - 4);
        c.closePath(); c.fill();
        c.strokeStyle = '#e8c45a'; c.lineWidth = 8; c.strokeRect(14, 14, w - 28, h - 64);
        c.fillStyle = '#e8c45a'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.font = 'bold 64px Bahnschrift, Arial, sans-serif'; c.fillText(t[3], w / 2, h * 0.36);
        c.font = 'bold 46px Bahnschrift, Arial, sans-serif'; c.fillText('WINS', w / 2, h * 0.56);
        c.beginPath(); c.arc(w / 2, h * 0.17, 22, 0, 6.283); c.fill();
      });
      cloth.wrapS = cloth.wrapT = THREE.ClampToEdgeWrapping; cloth.repeat.set(1, 1);
      var B = new THREE.Group(); B.position.set(ax + t[1], TOP, z); B.userData.dynamic = true; g.add(B);
      [-1, 1].forEach(function (s) { pkRod(s * (BW / 2 - 0.1), 0.05, 0, s * (BW / 2 - 0.1), 0.45, 0, 0.012, gold, B, 4); });   // the cords up to the roof
      var roll = pkRoundCyl(0.09, BW + 0.1, std({ color: t[2], roughness: 0.7 }), 0, 0, 0, B, 12); roll.rotation.z = Math.PI / 2;
      [-1, 1].forEach(function (s) { sphere(0.11, gold, s * (BW / 2 + 0.1), 0, 0, B); });
      var C = new THREE.Group(); C.position.y = -0.06; B.add(C);
      var pl = new THREE.Mesh(new THREE.PlaneGeometry(BW, L), std({ map: cloth, roughness: 0.85, side: THREE.DoubleSide, alphaTest: 0.5 }));
      pl.position.y = -L / 2; C.add(pl);
      box(BW + 0.06, 0.05, 0.05, gold, 0, -L + 0.3, 0, C);                                   // the batten along the hem
      var o = { want: 0, f: 0, C: C, roll: roll };
      C.scale.y = 0.01; C.visible = false;
      out[t[0]] = o;
    });
    pkCtlLive({ tick: function () {
      ['water', 'vuur'].forEach(function (k) {
        var o = out[k], f0 = o.f; o.f += (o.want - o.f) * 0.04; if (Math.abs(o.want - o.f) < 0.002) o.f = o.want;
        if (o.f === f0) return;
        o.C.scale.y = Math.max(0.01, o.f); o.C.visible = o.f > 0.02; o.roll.rotation.x += (o.f - f0) * 14;
      });
    } });
    return out;
  }
  // the swamp fog (the SHOW EFFECTS fog switch): a ring of soft low puffs over Edna's pond, made the first time it is used
  function pkJorisFog(E) {
    if (E.fogPuffs || !E.dragon) return;
    var mist = new THREE.MeshBasicMaterial({ map: typeof pkDmMistTex === 'function' ? pkDmMistTex() : null, color: 0xdfe8e4, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide });
    E.fogPuffs = [];
    for (var i = 0; i < 14; i++) {
      var a = i / 14 * 6.283, r = 2.2 + (i % 3) * 1.3, p = new THREE.Mesh(new THREE.SphereGeometry(1.0, 10, 6), mist);
      p.scale.set(1.6, 0.35, 1.6); p.position.set(Math.cos(a) * r, 0.35 + (i % 2) * 0.25, Math.sin(a) * r);
      p.userData.x = p.position.x; p.userData.z = p.position.z; p.userData.noBake = true; p.visible = false;
      E.dragon.add(p); E.fogPuffs.push(p);
    }
  }
  function pkJorisSignals(g, a, z) {
    var housing = std({ color: 0x15171a, roughness: 0.5, metalness: 0.3 }), plate = std({ color: 0xe8e2d0, roughness: 0.6 });
    var COLS = [0xff2a1a, 0xffa31a, 0x2aff5a], heads = [];
    [-2.5, 2.5].forEach(function (dx) {
      var h = new THREE.Group(); h.position.set(PK_JORIS.ax + dx, 5.85, z); h.userData.dynamic = true; g.add(h);
      box(0.44, 1.02, 0.04, plate, 0, 0, -0.1, h);                                    // the white backboard
      box(0.34, 0.92, 0.2, housing, 0, 0, 0, h);
      pkRod(0, 0.46, -0.1, 0, 0.75, -0.14, 0.03, housing, h, 6);                       // hung from the header
      var lamps = COLS.map(function (col, i) {
        var y = 0.28 - i * 0.28;
        var hood = box(0.26, 0.02, 0.14, housing, 0, y + 0.13, 0.17, h); hood.rotation.x = -0.25;
        var off = pkRoundCyl(0.1, 0.03, std({ color: new THREE.Color(col).multiplyScalar(0.18).getHex(), roughness: 0.3 }), 0, y, 0.11, h, 16); off.rotation.x = Math.PI / 2;
        // the lit lamp is a plain unlit disc (MeshBasicMaterial), not a glowMat: glowMat lamps are collected into the
        // ride-light circuit and dimmed to nothing while the sun is up, which would leave the signal dark all day
        var on = pkRoundCyl(0.1, 0.032, new THREE.MeshBasicMaterial({ color: col }), 0, y, 0.115, h, 16); on.rotation.x = Math.PI / 2; on.visible = false;
        return on;
      });
      heads.push(lamps);
    });
    var C = pkCtl(a), last = -2;
    pkCtlLive({ tick: function () {
      // moving: green out of the station, amber while both trains climb the lift, red once both have cleared its top;
      // standing: amber when the station gates are shut and the bars are down (ready to go), red otherwise
      var E = a.extra, run = a.state === 'running' || a.state === 'dispatch', st;
      if (!a.open) st = -1;
      else if (run) {
        if (E.pLift === undefined && E.water && E.water.uOfF && E.water.uOfF.length) { E.pLift = pkJorisShare(E, E.uLift, 0.08); E.pTop = pkJorisShare(E, E.uTop, 0.22); }
        var p = clamp(a.t / Math.max(1, a.run), 0, 1);
        st = p < (E.pLift || 0.08) ? 2 : p < (E.pTop || 0.22) ? 1 : 0;
      } else st = (a.stationGates === false && (C.barsWant || 0) > 0.5) ? 1 : 0;
      if (st === last) return; last = st;
      heads.forEach(function (L) { L.forEach(function (m, i) { m.visible = i === st; }); });
    } });
  }
  // a wall lantern: a wrought-iron bracket out from the wall at (x, y, z) along (dx, dz), a lantern hanging from its
  // tip, a glowing glass body in an iron frame with a pyramid cap and a ring on top; s scales the whole thing
  var PK_JORIS_LANT = null;
  function pkJorisLantern(g, x, y, z, dx, dz, s) {
    if (!PK_JORIS_LANT) PK_JORIS_LANT = { iron: std({ color: 0x1e2226, roughness: 0.5, metalness: 0.6 }), glass: glowMat(0xffc878, 1.5) };
    var L = PK_JORIS_LANT, out = 0.45 * s, tx = x + dx * out, tz = z + dz * out;
    box(Math.abs(dx) > 0 ? 0.04 : 0.16, 0.22 * s, Math.abs(dz) > 0 ? 0.04 : 0.16, L.iron, x, y, z, g);          // the wall plate
    pkRod(x, y + 0.05 * s, z, tx, y + 0.05 * s, tz, 0.022 * s, L.iron, g, 6);                                      // the arm
    pkRod(x, y - 0.12 * s, z, tx - dx * out * 0.35, y + 0.05 * s, tz - dz * out * 0.35, 0.016 * s, L.iron, g, 6);  // the stay
    var hy = y - 0.08 * s;
    cyl(0.012 * s, 0.1 * s, L.iron, tx, hy + 0.06 * s, tz, g, 4);                                                  // the hook
    var h = 0.3 * s, w = 0.17 * s;
    box(w * 0.8, h * 0.8, w * 0.8, L.glass, tx, hy - h / 2, tz, g);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { box(0.018 * s, h, 0.018 * s, L.iron, tx + c[0] * w / 2, hy - h / 2, tz + c[1] * w / 2, g); });
    box(w + 0.02 * s, 0.03 * s, w + 0.02 * s, L.iron, tx, hy - h, tz, g);
    var cap = new THREE.Mesh(new THREE.ConeGeometry(w * 0.8, 0.12 * s, 4), L.iron); cap.position.set(tx, hy + 0.05 * s, tz); cap.rotation.y = Math.PI / 4; g.add(cap);
  }
  // ── The gateway over the queue: a stone arch like the Mountain King's, but a carved dragon finial instead of a crown,
  // and the Water/Vuur colours on its banners and torches instead of a generic royal blue. ──
  function pkJorisPortal(p, side, g) {
    var M0 = pkMats();
    var fr = new THREE.Group(); fr.position.set(p.q[0], 0, p.q[1]); fr.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2; g.add(fr);
    var stone = std({ color: 0x8f8a80, roughness: 0.95, map: M0.stone.map }), dark = std({ color: 0x5f5a54, roughness: 0.95 });
    var iron = std({ color: 0x23272b, roughness: 0.5, metalness: 0.5 }), oak = std({ map: M0.clap.map, color: 0x3a2617, roughness: 0.8 });
    var R = 2.0, PH = 3.6, D = 1.2;
    [-1, 1].forEach(function (s) {
      var px = s * (R + 0.6);
      pkBevelBox(1.5, 0.9, D + 0.3, dark, px, 0.45, 0, fr, 0.04);
      pkBevelBox(1.2, PH - 0.9, D, stone, px, 0.9 + (PH - 0.9) / 2, 0, fr, 0.03);
      pkBevelBox(1.4, 0.25, D + 0.2, dark, px, PH, 0, fr, 0.03);
      // a torch on an iron bracket, a real flame so it reads lit by day as well as at night
      pkRod(px, 2.5, D / 2, px, 2.75, D / 2 + 0.4, 0.03, iron, fr, 6);
      pkRoundCyl(0.09, 0.3, iron, px, 2.85, D / 2 + 0.42, fr, 8);
      pkRoundCyl(0.16, 0.12, iron, px, 3.04, D / 2 + 0.42, fr, 10);
      var fl = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.6, 10), new THREE.MeshBasicMaterial({ color: 0xff8a2a })); fl.position.set(px, 3.4, D / 2 + 0.42); fl.userData.noBake = true; fr.add(fl);
      var fl2 = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.4, 8), new THREE.MeshBasicMaterial({ color: 0xffe08a })); fl2.position.set(px, 3.3, D / 2 + 0.47); fl2.userData.noBake = true; fr.add(fl2);
    });
    var ring = new THREE.Shape(); ring.absarc(0, 0, R + 0.55, 0, Math.PI, false); ring.lineTo(-R, 0); ring.absarc(0, 0, R, Math.PI, 0, true); ring.closePath();
    var arch = new THREE.Mesh(new THREE.ExtrudeGeometry(ring, { depth: D, bevelEnabled: false, curveSegments: 20 }), stone); arch.position.set(0, PH, -D / 2); arch.castShadow = true; fr.add(arch);
    for (var v = 1; v < 9; v++) { var va = v / 9 * Math.PI, jx = Math.cos(va), jy = Math.sin(va); var jt = box(0.04, 0.58, D + 0.02, dark, jx * (R + 0.27), PH + jy * (R + 0.27), 0, fr); jt.rotation.z = va - Math.PI / 2; }
    var spandrel = new THREE.Shape(); spandrel.moveTo(-(R + 1.2), 0); spandrel.lineTo(-(R + 1.2), R + 1.2); spandrel.lineTo(R + 1.2, R + 1.2); spandrel.lineTo(R + 1.2, 0); spandrel.lineTo(R + 0.55, 0); spandrel.absarc(0, 0, R + 0.55, 0, Math.PI, false); spandrel.closePath();
    var sp = new THREE.Mesh(new THREE.ExtrudeGeometry(spandrel, { depth: D - 0.1, bevelEnabled: false, curveSegments: 20 }), stone); sp.position.set(0, PH, -(D - 0.1) / 2); sp.castShadow = true; fr.add(sp);
    // the keystone, and instead of a crown: a small carved dragon head looking down over the line
    pkBevelBox(0.6, 0.8, D + 0.12, dark, 0, PH + R + 0.3, 0, fr, 0.04);
    var top = PH + R + 1.2;
    pkBevelBox(2 * (R + 1.2) + 0.3, 0.22, D + 0.25, dark, 0, top + 0.11, 0, fr, 0.03);
    pkBevelBox(2 * (R + 1.2), 0.5, D, stone, 0, top + 0.47, 0, fr, 0.02);
    for (var m = -2; m <= 2; m++) pkBevelBox(0.7, 0.6, D, stone, m * 1.3, top + 1.0, 0, fr, 0.03);
    var head = new THREE.Group(); head.position.set(0, top + 1.1, D / 2 - 0.1); head.rotation.x = 0.55; fr.add(head);
    var hgreen = std({ map: M0.bark.map, color: 0x3f6b34, roughness: 0.8 }), hdark = std({ map: M0.bark.map, color: 0x2a4a22, roughness: 0.85 });
    sphere(0.32, hgreen, 0, 0, 0, head); sphere(0.17, hgreen, 0, -0.06, 0.32, head);
    sphere(0.045, glowMat(0xffc830, 1.4), 0.17, 0.08, 0.26, head); sphere(0.045, glowMat(0xffc830, 1.4), -0.17, 0.08, 0.26, head);
    [[-0.12, 0.42], [0.12, 0.42]].forEach(function (hp) { var horn = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 4), hdark); horn.position.set(hp[0], 0.3, hp[1]); horn.rotation.x = -0.6; head.add(horn); });
    // the name board, carved oak gilt-edged, and the twin Water/Vuur banners either side under the parapet
    pkBevelBox(4.4, 0.78, 0.12, oak, 0, top - 0.55, D / 2 + 0.06, fr, 0.03);
    box(4.5, 0.05, 0.14, M0.gold, 0, top - 0.14, D / 2 + 0.06, fr); box(4.5, 0.05, 0.14, M0.gold, 0, top - 0.96, D / 2 + 0.06, fr);
    pkSign3D(['DRAGON RIDE'], 4.1, 0.56, 0, top - 0.55, D / 2 + 0.13, 0, { bg: '#2a1d14', fg: PK_JORIS.sign }, fr);
    // the line's own gate, in the arch: two timber leaves of vertical boards on a frame, with iron straps and a ring,
    // hung on the piers and swinging in toward the line when GATES opens it
    var A = PK.attrById && PK.attrById.joris, C = A ? pkCtl(A) : null;
    var board = std({ map: M0.clap.map, color: 0x5e4028, roughness: 0.85 }), frame = std({ map: M0.bark.map, color: 0x3a2716, roughness: 0.85 });
    var LW = R - 0.04, GH = 1.5;
    var leaf = function (s) {
      var h = new THREE.Group(); h.position.set(s * R, 0, -0.1); h.userData.dynamic = true; fr.add(h);
      for (var b = 0; b < 7; b++) { var bx2 = -s * (0.15 + b * (LW - 0.3) / 6); box(0.24, GH - (b % 2) * 0.08, 0.06, board, bx2, 0.1 + (GH - (b % 2) * 0.08) / 2, 0, h); }
      [0.35, GH - 0.15].forEach(function (y) { box(LW, 0.12, 0.08, frame, -s * LW / 2, y, 0.05, h); });
      var br = box(Math.hypot(LW, GH - 0.5), 0.1, 0.07, frame, -s * LW / 2, 0.1 + GH / 2, 0.05, h); br.rotation.z = s * Math.atan2(GH - 0.5, LW);
      [0.35, GH - 0.15].forEach(function (y) { box(0.6, 0.06, 0.03, iron, -s * 0.3, y, 0.1, h); });
      pkRing(0.07, 0.015, iron, -s * (LW - 0.15), 0.95, 0.1, h, 10);
      return h;
    };
    var GL = leaf(-1), GR = leaf(1);
    if (A) { A.jorisGateL = GL; A.jorisGateR = GR; }   // the lane (built straight after) picks these up as its gate leaves
    if (C) C.gateObjs.push(function (t) { GL.rotation.y = t * 1.45; GR.rotation.y = -t * 1.45; });
    [[-1, PK_JORIS.a], [1, PK_JORIS.b]].forEach(function (t) {
      var bx = t[0] * (R + 0.6);
      pkRod(bx, top + 0.3, D / 2 - 0.1, bx, top + 0.3, D / 2 + 0.55, 0.035, iron, fr, 6);
      var ban = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.9), std({ color: t[1], roughness: 0.85, side: THREE.DoubleSide })); ban.position.set(bx, top - 0.68, D / 2 + 0.56); fr.add(ban);
      sphere(0.06, M0.gold, bx, top + 0.3, D / 2 + 0.58, fr);
    });
  }
  // ── The fence round the station's track side. Both turnarounds (z -6 to -9) and both brake runs (x 91.5 and 108.5,
  // under 3 m up until z -30) are low enough to walk straight into, so a timber post-and-rail fence closes them off:
  // west and east of the entrance corridor along z -4.6, then north beside each brake run to z -31, where the track is
  // high enough to walk under. Two short runs close the gaps between the hall's walls and the lift at its north end.
  // Every run is solid. ──
  function pkJorisPerimeter(g) {
    var M0 = pkMats(), post = std({ map: M0.bark.map, color: 0x4a3420, roughness: 0.85 }), rail = std({ map: M0.clap.map, color: 0x6a4a30, roughness: 0.85 });
    var xC0 = PK_JORIS_LINE[0][0] - 1.0, xC1 = PK_JORIS_LINE[0][0] + 2.22;
    var runs = [[[90.5, -31], [90.5, -4.6], [xC0, -4.6]], [[xC1, -4.6], [109.6, -4.6], [109.6, -31]], [[95.65, -27.3], [96.7, -27.3]], [[103.3, -27.3], [104.35, -27.3]]];
    runs.forEach(function (R) {
      for (var k = 0; k < R.length - 1; k++) {
        var p0 = R[k], p1 = R[k + 1], L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), n = Math.max(1, Math.round(L / 1.8));
        for (var j = 0; j <= n; j++) cyl(0.07, 1.15, post, p0[0] + (p1[0] - p0[0]) * j / n, 0.57, p0[1] + (p1[1] - p0[1]) * j / n, g, 6);
        [0.45, 0.95].forEach(function (y) { pkRod(p0[0], y, p0[1], p1[0], y, p1[1], 0.04, rail, g, 6); });
        solid(Math.min(p0[0], p1[0]) - 0.08, Math.max(p0[0], p1[0]) + 0.08, Math.min(p0[1], p1[1]) - 0.08, Math.max(p0[1], p1[1]) + 0.08, 0, 1.2);
      }
    });
  }
  // ── The wooden frame under each track, the whole way round (it stands in for the kit's lone legs, which the track
  // build skips): a bent every ~2.6 m across the track, two posts just outside the rails on concrete footings, a cap
  // under the track, ledgers every ~1.6 m up, an X brace in each tier, and runners along the track tying each bent to
  // the last at every ledger. None inside the station hall (it has its own floor), none where the track is down near
  // the ground, none where a lower stretch of either track passes through the column. Each bent is solid. ──
  function pkJorisTrestle(g, subs) {
    var M0 = pkMats();
    var post = std({ map: M0.bark.map, color: 0x5a4028, roughness: 0.8 }), brace = std({ map: M0.bark.map, color: 0x7a5a3a, roughness: 0.8 });
    var foot = std({ map: M0.stone.map, color: 0x9a948a, roughness: 0.95 });
    var HALL = [95.2, 104.8, -27.4, -9.6], HW = 0.78, TIER = 1.6;
    var all = [];
    [subs.water.curve, subs.vuur.curve].forEach(function (c) { for (var i = 0; i < 1600; i++) all.push(c.getPointAt(i / 1600)); });
    function blocked(x, z, y) {
      for (var k = 0; k < all.length; k++) { var q = all[k]; if (q.y < y - 1.4 && Math.abs(q.x - x) < 1.3 && Math.abs(q.z - z) < 1.3) return true; }
      return false;
    }
    [subs.water, subs.vuur].forEach(function (E) {
      var n = Math.round(E.len / 2.6), prev = null;
      for (var i = 0; i < n; i++) {
        var u = i / n, p = E.curve.getPointAt(u), t = E.curve.getTangentAt(u);
        var yb = p.y - 0.72;
        if (yb < 0.5 || (p.x > HALL[0] && p.x < HALL[1] && p.z > HALL[2] && p.z < HALL[3]) || blocked(p.x, p.z, p.y)) { prev = null; continue; }
        var hx = -t.z, hz = t.x, hl = Math.hypot(hx, hz) || 1; hx /= hl; hz /= hl;      // across the track, level
        var A = [p.x + hx * HW, p.z + hz * HW], B = [p.x - hx * HW, p.z - hz * HW], ang = Math.atan2(hx, hz);
        [A, B].forEach(function (q) {
          box(0.24, yb, 0.24, post, q[0], yb / 2, q[1], g);
          box(0.5, 0.18, 0.5, foot, q[0], 0.09, q[1], g);
        });
        var cap = box(0.22, 0.24, HW * 2 + 0.4, post, p.x, yb - 0.12, p.z, g); cap.rotation.y = ang;
        var lv = []; for (var y = TIER; y < yb - 0.5; y += TIER) lv.push(y);
        lv.forEach(function (y) { var l = box(0.12, 0.16, HW * 2 + 0.2, brace, p.x, y, p.z, g); l.rotation.y = ang; });
        var ys = [0.25].concat(lv, [yb - 0.24]);
        for (var k = 0; k < ys.length - 1; k++) {
          var lo = k % 2 ? A : B, hi = k % 2 ? B : A;
          pkRod(lo[0], ys[k], lo[1], hi[0], ys[k + 1], hi[1], 0.06, brace, g, 4);
        }
        if (prev && Math.hypot(prev.A[0] - A[0], prev.A[1] - A[1]) < 4) {
          lv.forEach(function (y) { if (y < prev.yb - 0.3) [[prev.A, A], [prev.B, B]].forEach(function (s) { pkRod(s[0][0], y, s[0][1], s[1][0], y, s[1][1], 0.055, brace, g, 4); }); });
        }
        solid(Math.min(A[0], B[0]) - 0.15, Math.max(A[0], B[0]) + 0.15, Math.min(A[1], B[1]) - 0.15, Math.max(A[1], B[1]) + 0.15, 0, yb);
        prev = { A: A, B: B, yb: yb };
      }
    });
  }
  // ── A gate at every seat row: a short boom on the platform edge beside each car where it stands parked, swinging up
  // with the station gates (STN GATES), and a waist-high rail between the rows, so the platform is one pen per car. ──
  function pkJorisRowGates(g, a, subs) {
    var C = pkCtl(a), M0 = pkMats(), rail = std({ map: M0.clap.map, color: 0x6a4a30, roughness: 0.85 }), D = 0.6;
    [['water', -1], ['vuur', 1]].forEach(function (t) {
      var E = subs[t[0]], s = t[1], xE = PK_JORIS.ax + s * 1.68, xI = PK_JORIS.ax + s * 0.92, seen = {};
      E.cars.forEach(function (car) {
        var cz = car.g.position.z, z0 = cz + 1.0;
        pkRoundCyl(0.07, 0.95, MAT.steelDark, xE, D + 0.47, z0, g, 8);
        var boom = new THREE.Group(); boom.position.set(xE, D + 0.88, z0); boom.userData.dynamic = true; boom.userData.keep = true; g.add(boom);
        box(0.07, 0.09, 1.9, MAT.hazard, 0, 0, -0.95, boom);
        box(0.05, 0.05, 1.9, MAT.steel, 0, -0.22, -0.95, boom);
        for (var i = 0; i < 4; i++) box(0.04, 0.22, 0.04, MAT.steel, 0, -0.11, -0.25 - i * 0.48, boom);
        C.stationGateObjs.push(function (tt) { boom.rotation.x = tt * Math.PI / 2.1; });
        [cz + 1.175, cz - 1.175].forEach(function (zr) {
          var key = Math.round(zr * 10); if (seen[key]) return; seen[key] = true;
          [xE, xI].forEach(function (x) { cyl(0.04, 1.0, MAT.steelDark, x, D + 0.5, zr, g, 6); });
          [D + 0.55, D + 0.95].forEach(function (y) { box(Math.abs(xI - xE), 0.05, 0.06, rail, (xE + xI) / 2, y, zr, g); });
        });
      });
    });
  }
  // ── Edna: the dragon in her swamp beside the lift. Her body lies north-south, her tail trails north and her head
  // is turned east toward the track. ──
  function pkJorisDragon(g, x, z) {
    var M0 = pkMats();
    // her hide: overlapping rounded scales, lit at the crown and dark at the rim, drawn once
    var hide = tex(256, 256, function (c, w, h) {
      c.fillStyle = '#1f3a1c'; c.fillRect(0, 0, w, h);
      var r = 18;
      for (var row = 0; row * r * 0.62 < h + r; row++) for (var col = -1; col * r < w + r; col++) {
        var sx = col * r + (row % 2 ? r / 2 : 0), sy = row * r * 0.62;
        var gr = c.createRadialGradient(sx, sy + r * 0.15, 1, sx, sy + r * 0.25, r * 0.62);
        gr.addColorStop(0, '#7aa65a'); gr.addColorStop(0.65, '#3f6a36'); gr.addColorStop(1, '#1b3218');
        c.fillStyle = gr; c.beginPath(); c.arc(sx, sy, r * 0.6, 0, Math.PI); c.closePath(); c.fill();
      }
    }, 4, 4);
    var skin = std({ map: hide, roughness: 0.6, metalness: 0.08 }), dark = std({ color: 0x1c3018, roughness: 0.8 });
    var belly = std({ color: 0xb59a5a, roughness: 0.7 }), horn = std({ color: 0xd9d0b4, roughness: 0.45 });
    var wingM = std({ color: 0x4e2622, roughness: 0.85, side: THREE.DoubleSide });
    var water = std({ map: M0.waterTex, color: 0x1a2a20, roughness: 0.1, metalness: 0.15, emissive: 0x0a1a10, emissiveIntensity: 0.3, transparent: true, opacity: 0.88 }); water.userData.noBake = true;
    var d = new THREE.Group(); d.position.set(x, 0, z); g.add(d);
    var UP = new THREE.Vector3(0, 1, 0);
    function cone(r, h, mat, px, py, pz, dir, parent) {   // a cone standing on (px, py, pz), pointing along dir
      var m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), mat), v = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
      m.quaternion.setFromUnitVectors(UP, v); m.position.set(px + v.x * h / 2, py + v.y * h / 2, pz + v.z * h / 2); parent.add(m); return m;
    }
    // the body: one spine from the spade of her tail (north) through the haunch and chest up the neck to the head, laid as
    // overlapping scaled ellipsoids, a pale belly under the torso and a ridge of spines along the top
    var K = [[0.4, 0.35, -11.5], [-1.4, 0.5, -9.2], [-0.6, 0.9, -6.8], [0.3, 1.6, -4.4], [0, 2.3, -1.8], [0, 2.6, 0.6], [0.5, 3.5, 2.2], [1.3, 4.9, 2.9], [2.2, 6.0, 2.7]];
    var RAD = [0.12, 0.3, 0.6, 1.1, 1.7, 1.9, 1.15, 0.85, 0.7];
    var spine = new THREE.CatmullRomCurve3(K.map(function (p) { return new THREE.Vector3(p[0], p[1], p[2]); })), NS = 48, i;
    for (i = 0; i <= NS; i++) {
      var u = i / NS, p = spine.getPointAt(u), f = u * (K.length - 1), k0 = Math.min(K.length - 2, Math.floor(f)), r = RAD[k0] + (RAD[k0 + 1] - RAD[k0]) * (f - k0);
      sphere(r, skin, p.x, p.y, p.z, d).scale.set(1, 0.86, 1.15);
      if (u > 0.3 && u < 0.72) sphere(r * 0.82, belly, p.x, p.y - r * 0.32, p.z, d).scale.set(0.9, 0.7, 1.1);
      if (i % 2 === 0 && u > 0.04 && u < 0.86) cone(Math.max(0.05, r * 0.24), r * 0.55 + 0.15, dark, p.x, p.y + r * 0.78, p.z, [0, 1, -0.35], d);
    }
    // the spade at the tip of her tail
    var tip = spine.getPointAt(0);
    var spade = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.0, 4), dark); spade.position.set(tip.x, tip.y, tip.z - 0.5); spade.rotation.set(-Math.PI / 2, 0, 0); spade.scale.set(1, 1, 0.25); d.add(spade);
    // the head, at the top of the neck, looking east over the track (pkJorisRun turns it as the trains pass): a long
    // skull and snout, the lower jaw dropped open on the fire in her throat, teeth, glowing eyes under heavy brows, and
    // two pairs of horns swept back. Left out of the static bake so it can turn.
    var head = new THREE.Group(), hp = spine.getPointAt(1); head.position.set(hp.x, hp.y, hp.z); head.rotation.y = Math.PI / 2; head.userData.dynamic = true; d.add(head);
    d.userData.head = head;
    sphere(0.72, skin, 0, 0, 0, head).scale.set(0.9, 0.8, 1.1);
    sphere(0.5, skin, 0, -0.08, 0.85, head).scale.set(0.8, 0.62, 1.55);
    [-1, 1].forEach(function (s) {
      sphere(0.07, dark, s * 0.16, 0.12, 1.55, head);                                           // nostril
      sphere(0.11, glowMat(0xffc830, 1.6), s * 0.42, 0.22, 0.45, head);                       // eye
      var brow = box(0.32, 0.09, 0.42, dark, s * 0.4, 0.37, 0.42, head); brow.rotation.z = -s * 0.3;
      cone(0.13, 1.15, horn, s * 0.32, 0.42, -0.15, [s * 0.3, 0.55, -1], head);               // the long horns
      cone(0.08, 0.7, horn, s * 0.52, 0.18, -0.3, [s * 0.75, 0.15, -1], head);                // the short ones
      for (var t = 0; t < 5; t++) cone(0.035, 0.15, horn, s * 0.27, -0.3, 0.6 + t * 0.19, [0, -1, 0.15], head);   // teeth
      for (var fr = 0; fr < 3; fr++) cone(0.05, 0.35, dark, s * 0.55, -0.15 - fr * 0.1, 0.1 - fr * 0.18, [s, -0.2, -0.6], head);   // cheek frills
    });
    var jaw = new THREE.Group(); jaw.position.set(0, -0.3, 0.2); jaw.rotation.x = 0.3; head.add(jaw);
    sphere(0.42, skin, 0, -0.08, 0.6, jaw).scale.set(0.8, 0.35, 1.65);
    d.userData.fire = sphere(0.26, glowMat(0xff5a1a, 2.4), 0, -0.32, 1.0, head);
    // the legs, folded under her as she lies: forelegs reaching forward, haunches tucked, three claws on each foot
    function claws(fx, fz, s) { for (var c = -1; c <= 1; c++) cone(0.06, 0.32, horn, fx + c * 0.16 + s * 0.04, 0.12, fz + 0.2, [c * 0.25, -0.35, 1], d); }
    [-1, 1].forEach(function (s) {
      sphere(0.55, skin, s * 1.2, 2.1, 1.0, d).scale.set(0.9, 1.1, 1.0);                       // shoulder
      pkRod(s * 1.25, 2.0, 1.1, s * 1.85, 1.0, 1.4, 0.38, skin, d, 8);
      sphere(0.36, skin, s * 1.85, 1.0, 1.4, d);                                                  // elbow
      pkRod(s * 1.85, 1.0, 1.4, s * 1.7, 0.3, 2.3, 0.3, skin, d, 8);
      sphere(0.36, skin, s * 1.7, 0.2, 2.55, d).scale.set(1, 0.5, 1.4); claws(s * 1.7, 2.75, s);
      sphere(0.8, skin, s * 1.25, 1.6, -3.6, d).scale.set(0.9, 1.1, 1.3);
      pkRod(s * 1.6, 1.1, -3.2, s * 1.8, 0.3, -2.4, 0.3, skin, d, 8);
      sphere(0.3, skin, s * 1.8, 0.16, -2.15, d).scale.set(1, 0.5, 1.4); claws(s * 1.8, -1.95, s);
    });
    // the wings, half folded back along her flanks: a membrane between the arm and three fingers, scalloped trailing edge
    [-1, 1].forEach(function (s) {
      var W = new THREE.Group(); W.position.set(s * 0.95, 3.75, 0.5); W.rotation.set(s * 0.55, Math.PI / 2, 0, 'YXZ'); d.add(W);
      var sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(1.6, 1.4); sh.lineTo(3.4, 2.4); sh.lineTo(5.0, 1.6);
      sh.quadraticCurveTo(4.3, 1.3, 3.9, 0.5); sh.quadraticCurveTo(3.3, 0.9, 2.7, 0.1); sh.quadraticCurveTo(2.0, 0.4, 1.4, -0.5); sh.quadraticCurveTo(0.8, -0.1, 0, 0);
      W.add(new THREE.Mesh(new THREE.ShapeGeometry(sh), wingM));
      var arm = [[0, 0], [1.6, 1.4], [3.4, 2.4], [5.0, 1.6]];
      for (var a = 0; a < 3; a++) pkRod(arm[a][0], arm[a][1], 0, arm[a + 1][0], arm[a + 1][1], 0, 0.1 - a * 0.02, skin, W, 6);
      [[3.9, 0.5], [2.7, 0.1], [1.4, -0.5]].forEach(function (q) { pkRod(3.4, 2.4, 0, q[0], q[1], 0, 0.05, skin, W, 5); });
      cone(0.08, 0.35, horn, 3.4, 2.4, 0, [0.2, 1, 0], W);                                      // the thumb claw
    });
    // the swamp: dark water, her clutch of eggs in a nest of sticks by her tail, a charred tree, wisps over the water
    var pond = new THREE.Mesh(new THREE.CircleGeometry(5.5, 24), water); pond.rotation.x = -Math.PI / 2; pond.position.y = 0.04; d.add(pond);
    for (var wi = 0; wi < 5; wi++) { var wa = wi / 5 * 6.28 + 0.4; var wisp = sphere(0.09, glowMat(0x9affb0, 1.6), Math.cos(wa) * 4.2, 0.6 + (wi % 2) * 0.4, Math.sin(wa) * 4.2, d); wisp.userData.pkWispSeed = wi; }
    var stick = std({ color: 0x3a2a1a, roughness: 1 }), egg = std({ color: 0xd6ccae, roughness: 0.6 }), nx = -2.6, nz = -6.0;
    for (var n = 0; n < 10; n++) { var na = n / 10 * 6.28; pkRod(nx + Math.cos(na) * 0.9, 0.12, nz + Math.sin(na) * 0.9, nx + Math.cos(na + 1.4) * 0.9, 0.2, nz + Math.sin(na + 1.4) * 0.9, 0.05, stick, d, 5); }
    [[0, 0], [0.35, 0.2], [-0.3, 0.25], [0.05, -0.35]].forEach(function (o) { sphere(0.28, egg, nx + o[0], 0.32, nz + o[1], d).scale.set(0.8, 1.15, 0.8); });
    cyl(0.25, 3.0, std({ color: 0x2a1a12, roughness: 1 }), 3.2, 1.5, -2.0, d, 6).rotation.z = 0.2;
    return d;
  }
  // each lap picks a winner and the loser lags a little, so the race is decided on the track
  function pkJorisStart(at) {
    var E = at.extra;
    E.winner = Math.random() < 0.5 ? 'water' : 'vuur';
    E.swing = 6 + Math.random() * 6;                         // how far ahead a train gets mid-race, in frames
    E.swaps = 2 + Math.floor(Math.random() * 2);             // how many times the lead changes hands
    E.ph = Math.random() < 0.5 ? 0 : Math.PI;                // which train leads first: not the winner's tell
    E.margin = 2 + Math.random() * 3;                        // the winning margin at the line: close
    E.pDrop = null;                                          // found on the first tick, from the run's own frames
    E.announced = false;
    toast(at.name + ': the king calls - whoever slays the dragon wins a thousand-and-one ducats!', 'good');
  }
  // The race is decided at the start but must not show until the end: both trains climb the lift side by side, the
  // lead swings back and forth through the middle (whoever leads first is a coin toss, not the winner), and only over
  // the last stretch does the winner pull ahead, by a small margin, so it is close at the line. d is Water's lead in
  // frames: positive, Vuur trails by d; negative, Water trails by -d.
  // Out of the station, up the lift and down the first drop the two trains run dead level (the first drop's bottom is
  // pDrop, the share of the run it takes to get there); only after it do they part.
  // the share of the run (0 to 1) at which the lead train reaches curve position u on the Water track
  function pkJorisShare(E, u, dflt) {
    var w = E.water;
    if (!w || !w.uOfF || !w.uOfF.length || u === undefined) return dflt;
    var M = w.uOfF.length - 1, target = ((u - (w.u0 || 0)) % 1 + 1) % 1;
    for (var k = 0; k <= M; k++) if (w.uOfF[k] >= target) return k / M;
    return dflt;
  }
  function pkJorisDropShare(E) { return pkJorisShare(E, E.uDrop, 0.3); }
  function pkJorisLead(E, p) {
    var p0 = E.pDrop === null || E.pDrop === undefined ? 0.3 : E.pDrop, span = Math.max(0.2, 1 - p0);
    var q = Math.max(0, (p - p0) / span);                     // 0 at the foot of the first drop, 1 at the line
    var env = pkJorisSm(q / 0.15), fin = pkJorisSm((q - 0.55) / 0.35);
    var mid = Math.sin(Math.PI * (E.swaps || 2) * q + (E.ph || 0)) * (E.swing || 8) * env;
    var target = (E.winner === 'water' ? 1 : -1) * (E.margin || 3);
    return p <= p0 ? 0 : mid * (1 - fin) + target * fin;
  }
  function pkJorisRun(at) {
    var E = at.extra, w = E.water, v = E.vuur;
    pkJorisQueueTick(at);
    var p = at.state === 'running' ? clamp(at.t / at.run, 0, 1) : 0;
    // Edna watches the trains go by: her head turns with the race, and her fire pulses as they pass
    if (E.dragon) {
      var head = E.dragon.userData && E.dragon.userData.head;
      if (head) head.rotation.y = Math.PI / 2 + Math.sin(p * Math.PI * 2) * 0.25;
      var fire = E.dragon.userData && E.dragon.userData.fire;
      if (fire && !(E.fx && E.fx.fire)) { var sc = 1 + 0.35 * (0.5 + 0.5 * Math.sin(p * Math.PI * 4)); fire.scale.set(sc, sc, sc); }
    }
    if (at.state === 'running' && (E.pDrop === null || E.pDrop === undefined)) E.pDrop = pkJorisDropShare(E);
    var d = at.state === 'running' ? pkJorisLead(E, p) : 0;
    function step(sub, lag) {
      if (!sub || !sub.uOfF || !sub.uOfF.length) return;
      var M = sub.uOfF.length - 1, f = p * M;
      f = Math.max(0, f - (lag || 0));
      var k = Math.min(M - 1, Math.floor(f)), r = f - k;
      pkCoPlace(sub, (sub.u0 + sub.uOfF[k] + (sub.uOfF[k + 1] - sub.uOfF[k]) * r) % 1);
    }
    step(w, Math.max(0, -d));
    step(v, Math.max(0, d));
    if (E.banners) {
      // the race is over once the trains are home: the winner's banner drops, and stays down until the booth rolls it up
      var won = at.state !== 'running' && at.state !== 'dispatch' && !!E.winner;
      if (won && !E.announced) { E.announced = true; E.banners[E.winner].want = 1;
        if (E.winner === 'water') E.winsWater = (E.winsWater || 0) + 1; else E.winsVuur = (E.winsVuur || 0) + 1;
        toast(at.name + ': ' + (E.winner === 'water' ? 'Blue' : 'Red') + ' wins the race! (Blue ' + E.winsWater + ' - Red ' + E.winsVuur + ')', 'good'); sfx('chime'); }
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
