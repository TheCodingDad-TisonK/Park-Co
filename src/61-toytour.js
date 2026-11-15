//@ Park Co, part 61: Teddy's Toy Tour, an indoor dark ride for the little ones (tison, 2026-11-14: "new ride for kids, something indoors,
//@ like Dream Flight"). It stands on the old ferris wheel plot east of the midway: a toy-box hall, a gentle slow loop on the coaster kit
//@ (three little cars, six seats, steady as a pedal train) through a nursery at night: a block castle, a tea party of teddies, a rainbow
//@ to pass under, a moon and stars. It is the kit's own pace (pedal) so it loads, runs and parks like the other rides.
  var PK_TT = { x: 15.4, z: 22.8, HX: 7.7, HZ: 9.8, DOOR: 1.5, H: 4.4 };   // the hall's middle, half sides, half door width, wall height
  PK_PLOTS.push({ id: 'ktoy', name: "Teddy's Toy Tour", x: PK_TT.x, z: PK_TT.z, r: 11, q: [PK_TT.x, 11.2], qdx: -1, level: 20, pad: 1.0, boothAt: [20.6, 9.6] });
  PK_THEME.ktoy = { a: 0x3f6fc4, b: 0xf0c04a, ground: 0x9ab07a, name: "Teddy's Toy Tour", noBunting: true, noDecor: true };
  PK_KEEP.push([PK_TT.x, PK_TT.z, 11]);

  // the loop in world coordinates: a rounded rectangle 8.4 m by 13.2 m (corner radius 2.4), run counter-clockwise from the north: west
  // along the short north side, south down the long west side (the station), east along the south, north up the east side over a
  // small rise under the rainbow, about 40 m
  function pkTtPts() {
    var cx = PK_TT.x, cz = PK_TT.z, P = [], R = 2.4, HXT = 4.2, HZT = 6.6, i, a;
    var add = function (lx, lz, y) { P.push([+(cx + lx).toFixed(2), +(y === undefined ? 0.4 : y).toFixed(2), +(cz + lz).toFixed(2)]); };
    var arc = function (ccx, ccz, a0, a1) { for (i = 1; i < 4; i++) { a = a0 + (a1 - a0) * i / 4; add(ccx + R * Math.cos(a), ccz + R * Math.sin(a)); } };
    add(HXT - R, -HZT); add(0, -HZT);                                                                          // the north side, heading west
    add(-(HXT - R), -HZT); arc(-(HXT - R), -(HZT - R), -Math.PI / 2, -Math.PI); add(-HXT, -(HZT - R));       // round the north-west corner
    for (var z = -(HZT - R) + 1.2; z < HZT - R - 0.4; z += 1.2) add(-HXT, z);                                  // down the west side: the station
    add(-HXT, HZT - R); arc(-(HXT - R), HZT - R, Math.PI, Math.PI / 2); add(-(HXT - R), HZT);                 // round the south-west corner
    add(0, HZT); add(HXT - R, HZT); arc(HXT - R, HZT - R, Math.PI / 2, 0); add(HXT, HZT - R);                  // east along the south, round the south-east corner
    for (var zn = HZT - R - 1.2; zn > -(HZT - R) + 0.4; zn -= 1.2) add(HXT, zn, 0.4 + 0.62 * Math.pow(Math.sin(Math.PI * clamp((zn + 3.6) / 7.2, 0, 1)), 2));   // up the east side, over the rise
    add(HXT, -(HZT - R)); arc(HXT - R, -(HZT - R), 0, -Math.PI / 2);                                           // round the north-east corner, back to the start
    return P;
  }

  // a sitting teddy: body, head, snout, ears, arms and feet, in one colour with a lighter muzzle, facing along +z at ry = 0
  function pkTtTeddy(parent, x, z, s, ry, col, bow) {
    var fur = std({ color: col, roughness: 0.95 }), pale = std({ color: 0xe9d5b0, roughness: 0.95 }), dark = std({ color: 0x2a1c14, roughness: 0.6 });
    var t = new THREE.Group(); t.position.set(x, 0, z); t.rotation.y = ry; t.scale.set(s, s, s); parent.add(t);
    pkBlob(0.5, 0.55, 0.45, fur, 0, 0.55, 0, t);                                   // body
    pkBlob(0.34, 0.3, 0.1, pale, 0, 0.52, 0.4, t);                                 // belly
    sphere(0.36, fur, 0, 1.38, 0.02, t);                                           // head
    pkBlob(0.17, 0.13, 0.14, pale, 0, 1.3, 0.33, t); sphere(0.05, dark, 0, 1.36, 0.46, t);   // muzzle and nose
    [-1, 1].forEach(function (sd) {
      sphere(0.13, fur, sd * 0.27, 1.66, 0, t); sphere(0.07, pale, sd * 0.27, 1.66, 0.06, t);   // ears
      sphere(0.04, dark, sd * 0.13, 1.45, 0.32, t);                                // eyes
      pkBlob(0.14, 0.34, 0.14, fur, sd * 0.56, 0.62, 0.08, t).rotation.z = -sd * 0.45;   // arms
      pkBlob(0.2, 0.15, 0.3, fur, sd * 0.28, 0.12, 0.28, t);                       // feet
    });
    if (bow) { var bm = std({ color: bow, roughness: 0.6 }); pkBlob(0.12, 0.07, 0.05, bm, -0.1, 1.1, 0.3, t); pkBlob(0.12, 0.07, 0.05, bm, 0.1, 1.1, 0.3, t); sphere(0.04, bm, 0, 1.1, 0.31, t); }
    return t;
  }

  function pkBuildToyTour(p) {
    var M = pkMats(), th = PK_THEME.ktoy, cx = PK_TT.x, cz = PK_TT.z, HX = PK_TT.HX, HZ = PK_TT.HZ, H = PK_TT.H, i, k;
    var g = new THREE.Group(); scene.add(g);
    var bx = function (w, h, d, mat, lx, y, lz, par) { return box(w, h, d, mat, cx + lx, y, cz + lz, par || g); };
    var sol = function (lx0, lx1, lz0, lz1, y0, y1) { solid(cx + lx0, cx + lx1, cz + lz0, cz + lz1, y0, y1); };
    // the materials: a painted nursery, all warm, the inside lit by its own glow rather than by the sun
    var cream = std({ color: 0xf2e6c8, roughness: 0.85 }), blue = std({ color: 0x3f6fc4, roughness: 0.6 }), red = std({ color: 0xd2493a, roughness: 0.6 });
    var yellow = std({ color: 0xf0c04a, roughness: 0.55 }), green = std({ color: 0x4f9a5a, roughness: 0.6 }), wood = std({ color: 0xa87a4a, roughness: 0.8 });
    var glowW = std({ color: 0x4a3a20, emissive: 0xffd890, emissiveIntensity: 0.9, roughness: 0.6 });
    var navy = std({ color: 0x141a3a, roughness: 0.95, emissive: 0x0a0e24, emissiveIntensity: 0.6, side: THREE.DoubleSide });
    var carpet = std({ color: 0x23306a, roughness: 1, emissive: 0x0e1638, emissiveIntensity: 0.5 });
    var star = new THREE.MeshBasicMaterial({ color: 0xfff2c8 });
    var moonM = new THREE.MeshBasicMaterial({ color: 0xf6efc8 });
    var cloudM = std({ color: 0xf0f2ff, roughness: 1, emissive: 0x6a74a8, emissiveIntensity: 0.55 });
    // ── The hall: stone base, painted walls with a toy-block band, a hipped roof ───────────────────────
    bx(2 * HX + 0.8, 0.3, 2 * HZ + 0.8, M.stoneDark, 0, 0.15, 0);                                  // plinth
    bx(2 * HX - 0.8, 0.06, 2 * HZ - 0.8, carpet, 0, 0.33, 0);                                       // the floor, a night-blue carpet
    var T = 0.4, wh = H - 0.3;
    bx(2 * HX, wh, T, cream, 0, 0.3 + wh / 2, HZ - T / 2);                                         // south wall
    bx(T, wh, 2 * HZ - 2 * T, cream, -HX + T / 2, 0.3 + wh / 2, 0); bx(T, wh, 2 * HZ - 2 * T, cream, HX - T / 2, 0.3 + wh / 2, 0);   // west and east
    var dw = PK_TT.DOOR;                                                                            // the north wall, with the door
    bx(HX - dw, wh, T, cream, -(HX + dw) / 2, 0.3 + wh / 2, -HZ + T / 2); bx(HX - dw, wh, T, cream, (HX + dw) / 2, 0.3 + wh / 2, -HZ + T / 2);
    bx(2 * dw, wh - 2.9, T, cream, 0, 0.3 + 2.9 + (wh - 2.9) / 2, -HZ + T / 2);
    // the toy-block band: alternating coloured blocks along the foot of every wall, a gilt rail above them
    var bands = [blue, red, yellow, green];
    for (k = 0; k < 4; k++) {
      var len = k % 2 ? 2 * HZ : 2 * HX, n = Math.round(len / 1.1), bw = len / n;
      for (i = 0; i < n; i++) {
        var m = bands[(i + k) % 4];
        if (k === 0) bx(bw - 0.06, 0.7, 0.12, m, -HX + bw * (i + 0.5), 0.65, -HZ - 0.02);
        if (k === 2) bx(bw - 0.06, 0.7, 0.12, m, -HX + bw * (i + 0.5), 0.65, HZ + 0.02);
        if (k === 1) bx(0.12, 0.7, bw - 0.06, m, -HX - 0.02, 0.65, -HZ + bw * (i + 0.5));
        if (k === 3) bx(0.12, 0.7, bw - 0.06, m, HX + 0.02, 0.65, -HZ + bw * (i + 0.5));
      }
    }
    // windows with a warm glow, two a side on the long walls, shuttered and boxed
    [-4.5, 4.5].forEach(function (wz) {
      [-HX, HX].forEach(function (wx) {
        var sg = wx < 0 ? -1 : 1;
        bx(0.1, 1.3, 1.7, glowW, wx - sg * 0.18, 2.35, wz);
        [-1, 1].forEach(function (sd) { bx(0.12, 1.4, 0.55, blue, wx - sg * 0.2, 2.35, wz + sd * 1.15); });
        bx(0.2, 0.12, 2.0, yellow, wx - sg * 0.24, 1.62, wz); bx(0.2, 0.12, 2.0, yellow, wx - sg * 0.24, 3.1, wz);
      });
    });
    pkHipRoof(2 * HX + 1.2, 2 * HZ + 1.2, 2.6, std({ color: 0x8f3524, roughness: 0.65, side: THREE.DoubleSide }), cx, H + 0.05, cz, g);
    bx(2 * HX + 1.4, 0.25, 2 * HZ + 1.4, yellow, 0, H - 0.1, 0);                                    // the eaves board
    pkRoundCyl(0.9, 0.4, M.stoneDark, cx, H + 2.7, cz, g, 12);
    // the front: a rounded door frame, a teddy's face over it and the name on blocks
    bx(2 * dw + 0.7, 0.45, 0.5, yellow, 0, 3.55, -HZ - 0.1);
    [-1, 1].forEach(function (sd) { bx(0.35, 3.3, 0.5, yellow, sd * (dw + 0.17), 1.95, -HZ - 0.1); });
    var face = new THREE.Group(); face.position.set(cx, 6.1, cz - HZ - 1.3); g.add(face);
    var fur = std({ color: 0xb98550, roughness: 0.95 }), pale = std({ color: 0xe9d5b0, roughness: 0.95 }), dk = std({ color: 0x2a1c14, roughness: 0.6 });
    sphere(1.35, fur, 0, 0, 0, face); pkBlob(0.62, 0.48, 0.4, pale, 0, -0.3, 1.0, face); sphere(0.17, dk, 0, -0.12, 1.38, face);
    [-1, 1].forEach(function (sd) { sphere(0.55, fur, sd * 1.05, 1.05, 0, face); sphere(0.3, pale, sd * 1.05, 1.05, 0.2, face); sphere(0.14, dk, sd * 0.5, 0.35, 1.2, face); });
    bx(3.4, 1.6, 0.4, yellow, 0, 5.15, -HZ - 0.9);
    pkSign3D(["TEDDY'S TOY TOUR"], 4.9, 0.62, cx, 3.95, cz - HZ - 0.38, Math.PI, { bg: '#2a3f7a', fg: '#ffd96a' }, g);
    pkSign3D(['FOR SMALL RIDERS'], 3.2, 0.34, cx, 0.95, cz - HZ - 0.2, Math.PI, { bg: '#3f6fc4', fg: '#ffffff' }, g);
    // the inside: a deep blue lining under a gilt rail, so the nursery reads as night
    var lin = std({ color: 0x2c3a78, roughness: 0.95, emissive: 0x141c44, emissiveIntensity: 0.7 }), LI = 0.04, lh = wh - 0.2;
    bx(2 * HX - 2 * T, lh, LI, lin, 0, 0.3 + lh / 2, HZ - T - LI / 2);
    bx(LI, lh, 2 * HZ - 2 * T, lin, -HX + T + LI / 2, 0.3 + lh / 2, 0); bx(LI, lh, 2 * HZ - 2 * T, lin, HX - T - LI / 2, 0.3 + lh / 2, 0);
    bx(HX - T - dw, lh, LI, lin, -(HX - T + dw) / 2, 0.3 + lh / 2, -HZ + T + LI / 2); bx(HX - T - dw, lh, LI, lin, (HX - T + dw) / 2, 0.3 + lh / 2, -HZ + T + LI / 2);
    bx(2 * HX - 2 * T, 0.07, 0.07, yellow, 0, 1.35, HZ - T - 0.06); bx(0.07, 0.07, 2 * HZ - 2 * T, yellow, -HX + T + 0.06, 1.35, 0); bx(0.07, 0.07, 2 * HZ - 2 * T, yellow, HX - T - 0.06, 1.35, 0);
    // ── Solid walls: the hall is a room, the door is not a wall ───────────────────────────────────────
    sol(-HX, HX, HZ - T, HZ, 0, H); sol(-HX, -HX + T, -HZ, HZ, 0, H); sol(HX - T, HX, -HZ, HZ, 0, H);
    sol(-HX, -dw, -HZ, -HZ + T, 0, H); sol(dw, HX, -HZ, -HZ + T, 0, H);
    // a ceiling of night: a navy ceiling, stars strung under it and a moon
    var ceil = new THREE.Mesh(new THREE.PlaneGeometry(2 * HX - 0.6, 2 * HZ - 0.6), navy); ceil.rotation.x = Math.PI / 2; ceil.position.set(cx, H - 0.45, cz); g.add(ceil);
    var rnd = pkRng(61), sp = [];
    for (i = 0; i < 140; i++) sp.push([cx + (rnd() * 2 - 1) * (HX - 1), H - 0.5 - rnd() * 0.5, cz + (rnd() * 2 - 1) * (HZ - 1)]);
    pkBulbs(sp, star, 0.07, g);
    sphere(0.8, moonM, cx - 1.2, H - 1.4, cz + 1.0, g);
    // ── The track and the three little cars ───────────────────────────────────────────────────────
    var curve = pkCoCurve(pkTtPts()), len = curve.getLength(), uP = pkCoUAt(curve, cx - 4.2, cz + 2.2);
    var F = pkCoFrames(curve, 160, pkCoProfile(curve, len, uP, { pedal: 1.4 }), uP);
    var E = { curve: curve, len: len, F: F, gap: 2.2, cars: [], uPark: uP, uOfF: [], run: 34 };
    pkCoLevel(F, curve, E.uPark, 2.2 * 2 + 1.2, 1.2);
    var seats = [], cols = [0xd2493a, 0xf0c04a, 0x3f6fc4];
    for (i = 0; i < 3; i++) {
      var car = pkCoCar(cols[i], { w: 1.2, d: 1.7 });
      scene.add(car.g); E.cars.push(car);
      car.seats.forEach(function (st) { seats.push({ par: car.g, x: st.x, y: st.y, z: st.z, ry: 0, guest: null }); });
    }
    pkCoTrackBuild(g, E, { spineMat: std({ color: 0x8a6a4a, roughness: 0.75 }), supMat: std({ color: 0x4a443c, roughness: 0.7 }), tieMat: std({ color: 0x59503f, roughness: 0.85 }), skip: function () { return true; } });
    pkCoPlan(E, { pedal: 1.4 });
    // sleepers under the line, so it sits on the floor like a toy railway
    for (var s = 0.4; s < len; s += 0.9) { var q = curve.getPointAt(s / len), tg = curve.getTangentAt(s / len); var sl = box(1.5, 0.05, 0.16, wood, q.x, 0.36, q.z, g); sl.rotation.y = Math.atan2(tg.x, tg.z) + Math.PI / 2; }
    // the platform on the north side of the station straight, against the door
    bx(1.4, 0.1, 7.8, M.kerb, -5.5, 0.4, 0); bx(1.3, 0.04, 7.7, M.pavers, -5.5, 0.46, 0); bx(0.14, 0.03, 7.8, MAT.hazard, -4.82, 0.485, 0);
    // ── The nursery: the scenes the line runs past ────────────────────────────────────────────────
    // north: a castle of toy blocks stacked against the wall, with a red tower; letter blocks beside it
    var blk = [blue, red, yellow, green, cream];
    [[-6.2, 2], [-4.9, 3], [-3.6, 2]].forEach(function (b, bi) { for (k = 0; k < b[1]; k++) bx(1.25, 0.9, 1.25, blk[(bi + k) % 5], b[0], 0.78 + k * 0.9, -8.5); });
    pkRoundCyl(0.42, 2.4, red, cx - 4.9, 3.9, cz - 8.5, g, 10); pkRoundCyl(0.6, 0.18, yellow, cx - 4.9, 5.2, cz - 8.5, g, 10);
    var cn = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.9, 10), blue); cn.position.set(cx - 4.9, 5.75, cz - 8.5); g.add(cn);
    ['A', 'B', 'C'].forEach(function (ch, ci) { bx(0.62, 0.62, 0.62, blk[ci + 1], 2.6 + ci * 0.7, 0.67, -8.7); });
    // south: the tea party: a low table, a teapot and teddies in bows round it
    pkRoundCyl(0.68, 0.07, wood, cx, 0.85, cz + 8.3, g, 20); pkRoundCyl(0.1, 0.5, wood, cx, 0.6, cz + 8.3, g, 8);
    pkLathe([[0, 0], [0.2, 0], [0.3, 0.12], [0.32, 0.26], [0.23, 0.4], [0, 0.42]], cream, cx, 0.9, cz + 8.3, g, 14);
    pkTtTeddy(g, cx - 1.5, cz + 8.4, 0.8, Math.PI / 2, 0xb98550, 0xe0508a);
    pkTtTeddy(g, cx + 1.5, cz + 8.4, 0.8, -Math.PI / 2, 0xd8b078, 0x3f6fc4);
    pkTtTeddy(g, cx + 4.2, cz + 8.1, 0.95, -Math.PI * 0.75, 0x8a5a38, 0xf0c04a);
    // east: a rainbow over the rise, seven bands, on two cloud banks
    var rbc = [0xe03a3a, 0xf08a2a, 0xf0d23a, 0x4fb04f, 0x3a8ae0, 0x4a4ad0, 0x9a4ad0];
    rbc.forEach(function (c, ri) {
      var rm = std({ color: c, emissive: c, emissiveIntensity: 0.45, roughness: 0.6 });
      var rr = 2.15 - ri * 0.15, ar = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.09, 6, 28, Math.PI), rm);
      ar.position.set(cx + 4.2, 0.55, cz); g.add(ar);
    });
    [-1, 1].forEach(function (sd) { [0, 1].forEach(function (oi) { sphere(0.6 - oi * 0.1, cloudM, cx + 4.2 + sd * (1.7 + oi * 0.5), 0.55 + oi * 0.2, cz + (oi - 0.5) * 0.4, g); }); });
    // the corners: balloons on strings, soldiers on guard
    [[6.5, -8.4, 0xd2493a], [-6.5, 8.4, 0x3f6fc4], [6.6, 8.4, 0xf0c04a], [-6.6, -8.4, 0x4f9a5a]].forEach(function (b) {
      pkRod(cx + b[0], 0.4, cz + b[1], cx + b[0], 2.3, cz + b[1], 0.012, MAT.steel, g, 4);
      var bl = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), std({ color: b[2], emissive: b[2], emissiveIntensity: 0.3, roughness: 0.4 })); bl.scale.y = 1.2; bl.position.set(cx + b[0], 2.65, cz + b[1]); g.add(bl);
    });
    [[6.4, -5.0], [6.4, 5.0]].forEach(function (b, bi) {
      pkRoundCyl(0.2, 1.1, bi ? blue : red, cx + b[0], 0.9, cz + b[1], g, 10); sphere(0.2, cream, cx + b[0], 1.6, cz + b[1], g); pkRoundCyl(0.16, 0.36, dk, cx + b[0], 1.9, cz + b[1], g, 10);
    });
    pkTtTeddy(g, cx + 3.4, cz - 8.2, 0.85, Math.PI, 0xc9a078, 0xd2493a);                            // a doorman by the door
    // scenery solids, so no one walks through a castle or a teapot table
    sol(-6.9, -2.9, -9.2, -7.7, 0.3, 3.0); sol(-0.8, 0.8, 7.5, 9.1, 0.3, 1.2);
    pkFuse(g);
    var a = pkAttr({ id: p.id, name: p.name, x: p.x, z: p.z, qx: p.q[0], qz: p.q[1], qdx: p.qdx, g: g, seats: seats, board: 6, run: E.run, unload: 5, extra: E, tickRun: function (at) { pkCoRun(at); } });
    var C = pkCtl(a);
    E.a = a;
    [-2.6, -0.4, 1.8].forEach(function (gz) {
      var gp = new THREE.Group(); gp.position.set(cx - 4.8, 0.95, cz + gz); gp.userData.dynamic = true; gp.userData.keep = true; g.add(gp);
      box(0.07, 0.09, 0.92, MAT.hazard, 0, 0, 0.46, gp, { r: 0.02 }); box(0.05, 0.05, 0.92, MAT.steel, 0, -0.2, 0.46, gp); box(0.1, 0.14, 0.1, MAT.red, 0, 0, 0.9, gp);
      C.stationGateObjs.push(function (t) { gp.rotation.x = -t * Math.PI / 2.1; });
      pkRoundCyl(0.09, 1.06, MAT.steelDark, cx - 4.8, 0.55, cz + gz, g, 8);
    });
    E.cars.forEach(function (c) { C.barObjs.push(function (bb) { c.bar.rotation.x = -1.35 * (1 - bb); }); });
    pkCoPlace(E, E.uPark);
    return a;
  }
  // built before the standard pass, so the booth pass finds it
  var _pkBuildAttractionsTT = pkBuildAttractions;
  pkBuildAttractions = function () {
    PK_PLOTS.forEach(function (p) {
      if (p.id !== 'ktoy') return;
      var a = pkBuildToyTour(p);
      a.level = p.level; a.plot = p; a.open = pkRideSavedOpen(p.id);
      if (S.rides) S.rides[p.id] = a.open;
    });
    _pkBuildAttractionsTT();
  };
