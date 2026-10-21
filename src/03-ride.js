//@ Park Co, part 03: the coaster - the track, the train, the station, the operator's room and the snack stand
  // ── The coaster ───────────────────────────────────────────────────
  // One closed circuit behind the station: a lift hill in the north-east, a drop, a hill, a turn and a run home.
  // The train is three cars of four seats. The operator's room stands east of the platform, with the desk that runs the ride.
  var PK_CAR_N = 3;
  // the four seats of a car, in the order they fill: the platform side first, then the far side, front row before back
  var PK_SEAT_LOCAL = [[-0.35, 0.62], [-0.35, -0.62], [0.35, 0.62], [0.35, -0.62]];
  var PK_CAR_COLS = [0xd94f4f, 0xf0c04a, 0x4f8fd9];
  // the control points of the circuit. The station straight runs x -9..9 at z -4.6; the track then swings east and north,
  // climbs to 14 m, comes back west and drops home. It stays clear of the operator's room (x 11..17, z -4..2), and the whole
  // circuit keeps to the band behind the station (z -4..-36, between the two streets), so the middle of the park beyond it is
  // gardens and paths rather than the inside of a loop nobody can walk into. Points 3..5 are the lift (PK.liftU).
  var PK_TRACK_PTS = [
    [-9, 0.6, -4.6], [9, 0.6, -4.6],
    [20.5, 0.8, -6.2], [25.5, 3, -12], [27, 8.5, -19.5], [25.5, 14, -27.5],
    [18, 9.5, -33], [8, 2.4, -33.5], [-2, 7.5, -32], [-11, 3.2, -30],
    [-19.5, 5, -24], [-20.5, 7.5, -16.5], [-17, 3, -10], [-13, 0.6, -6]
  ];
  // the u of the point on the curve nearest a world point: the station is found this way, never guessed
  function pkNearestU(x, y, z) {
    var N = 1200, best = 0, bd = Infinity;
    for (var i = 0; i < N; i++) {
      var p = PK.curve.getPointAt(i / N), d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y) + (p.z - z) * (p.z - z);
      if (d < bd) { bd = d; best = i; }
    }
    return best / N;
  }
  function pkBuildCoaster() {
    var pts = PK_TRACK_PTS.map(function (p) { return new THREE.Vector3(p[0], p[1], p[2]); });
    PK.curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);
    PK.len = PK.curve.getLength();
    var N = 1200, samples = [];
    for (var i = 0; i < N; i++) samples.push(PK.curve.getPointAt(i / N));
    PK.cpU = pts.map(function (p) {
      var best = 0, bd = Infinity;
      for (var k = 0; k < N; k++) { var d = samples[k].distanceToSquared(p); if (d < bd) { bd = d; best = k; } }
      return best / N;
    });
    PK.liftU = [PK.cpU[3], PK.cpU[5]];
    // the train travels +x along the station, so the front car sits at the highest x: aim the front car at x 4
    PK.stationU = pkNearestU(4, PK_PLATFORM_Y, PK_STATION_Z);
    PK.stationX0 = PK.curve.getPointAt(PK.stationU).x;
    PK.ride.u = PK.stationU;
    pkTrack(); pkStation(); pkTrain(); pkQueueLine();
    pkPlaceTrain();
  }
  function pkTrack() {
    var M = pkMats();
    // the spine: deep blue steel, so the circuit reads against the sky
    var spine = new THREE.Mesh(new THREE.TubeGeometry(PK.curve, 500, 0.24, 8, true), M.steelBlue);
    spine.castShadow = true; spine.receiveShadow = true; scene.add(spine);
    // the two running rails, pale steel
    var railPts = [[], []];
    for (var i = 0; i < 500; i++) {
      var u = i / 500, p = PK.curve.getPointAt(u), t = PK.curve.getTangentAt(u);
      var lat = new THREE.Vector3(-t.z, 0, t.x).normalize();
      railPts[0].push(p.clone().addScaledVector(lat, 0.55));
      railPts[1].push(p.clone().addScaledVector(lat, -0.55));
    }
    railPts.forEach(function (rp) {
      var c = new THREE.CatmullRomCurve3(rp, true, 'catmullrom', 0.5);
      var m = new THREE.Mesh(new THREE.TubeGeometry(c, 500, 0.09, 6, true), MAT.chrome);
      m.castShadow = true; scene.add(m);
    });
    // the ties, every couple of metres
    var tieN = Math.max(8, Math.round(PK.len / 2));
    for (var j = 0; j < tieN; j++) {
      var u2 = j / tieN, p2 = PK.curve.getPointAt(u2), t2 = PK.curve.getTangentAt(u2);
      var tie = box(1.5, 0.1, 0.24, MAT.steelDark, p2.x, p2.y - 0.16, p2.z);
      tie.rotation.order = 'YXZ'; tie.rotation.y = Math.atan2(t2.x, t2.z); tie.rotation.x = -Math.asin(clamp(t2.y, -1, 1));
    }
    // the legs, wherever the track is off the ground
    var supN = Math.max(4, Math.round(PK.len / 6));
    for (var k = 0; k < supN; k++) {
      var u3 = k / supN, p3 = PK.curve.getPointAt(u3);
      if (p3.y < 1.6) continue;
      var h = p3.y - 0.2;
      cyl(0.16, h, MAT.steelDark, p3.x, h / 2, p3.z, null, 8);
      box(0.7, 0.3, 0.7, MAT.grey, p3.x, 0.15, p3.z);
    }
  }
  function pkStation() {
    // the platform, south of the track, with a ramp down to the apron at its south edge
    box(20, 0.6, 3.0, MAT.floor, 0, 0.3, -2.1);
    var ramp = box(20, 0.1, 1.17, MAT.floor, 0, 0.3, 0.1);
    ramp.rotation.x = -0.54;
    // the canopy over it
    [[-9.4, -3.4], [9.4, -3.4], [-9.4, -0.8], [9.4, -0.8]].forEach(function (p) { cyl(0.1, 3.2, MAT.steelDark, p[0], 2.2, p[1], null, 8); });
    box(20.4, 0.2, 3.4, MAT.roof, 0, 3.9, -2.1);
    sign(['PARK CO', 'the coaster'], 3.2, 0.8, 0, 3.0, -4.4, 0, { bg: '#1b232c', fg: '#f5b53d' });
    // the gates along the platform edge, one per car door
    [-6, -2, 2, 6].forEach(function (x) {
      var g = new THREE.Group(); g.position.set(x, PK_PLATFORM_Y, -3.6); scene.add(g);
      box(0.14, 1.0, 0.14, MAT.steelDark, 0, 0.5, 0, g);          // the hinge post
      var arm = new THREE.Group(); arm.position.set(0, 0.9, 0); g.add(arm);
      box(1.0, 0.1, 0.1, MAT.hazard, 0.5, 0.14, 0, arm);          // the top rail, across the way in
      box(1.0, 0.1, 0.1, MAT.hazard, 0.5, -0.28, 0, arm);         // the bottom rail
      for (var m = 0; m < 5; m++) box(0.05, 0.42, 0.05, MAT.steel, 0.12 + m * 0.19, -0.07, 0, arm);
      box(0.12, 0.12, 0.12, MAT.red, 0.98, 0.14, 0, arm);         // the end cap
      PK.gates.push({ x: x, z: -3.6, g: g, leaf: arm, bar: arm, open: false, t: 0 });
    });
  }
  function pkTrain() {
    for (var i = 0; i < PK_CAR_N; i++) {
      var car = pkCoasterCarBetter(i, 0, 0, 0, 0, PK_CAR_COLS[i % PK_CAR_COLS.length]);
      // the bevelled tub, seats and lap bars all come from pkCoasterCarBetter
      PK.cars.push(car);
      // the seats, in the order they fill
      PK_SEAT_LOCAL.forEach(function (sl) {
        PK.seats.push({ car: i, local: { x: sl[0], y: -0.06, z: sl[1] }, guest: null });
      });
    }
  }
  function pkQueueLine() {
    // the waiting line: two runs of park fence with both ends open, so the guests walk in at the south and out at the north
    pkParkFence(6.2, 8.6, 6.2, -0.4);
    pkParkFence(7.8, 8.6, 7.8, -0.4);
    // the lane floor: a kerbed strip in the park pavers, so the line reads as a place of its own
    box(1.92, 0.10, 10.6, pkMats().kerb, 7, 0.012, 4.3);
    box(1.54, 0.05, 10.2, pkMats().pavers, 7, 0.035, 4.3);
    // the entry arch at the back, facing the gate
    [-1, 1].forEach(function (sx) {
      pkRoundCyl(0.085, 2.34, MAT.steelDark, 7 + sx * 0.86, 1.17, 9.35, null, 8);
      sphere(0.09, pkMats().gold, 7 + sx * 0.86, 2.36, 9.35);
    });
    pkBevelBox(1.98, 0.16, 0.14, MAT.steelDark, 7, 2.32, 9.35);
    pkSign3D(['QUEUE', 'THE COASTER'], 1.50, 0.34, 7, 2.58, 9.35, 0, { bg: '#1b232c', fg: '#f5b53d' });
    // the player's way on: press E at the back of the line and the train carries you
    hitBox(2.2, 2.2, 2.0, 7, 1.1, 9.0, {
      prompt: function () {
        if (PK.playerRide || PK.closed) return '';
        if (PK.playerWait && PK.playerWait.coaster) return 'Waiting for the coaster - press E to leave the line';
        return 'Ride the coaster';
      },
      use: function () { pkPlayerRideJoin(null); }
    });
  }
  // ── The operator's room ───────────────────────────────────────────
  function pkBuildOperatorRoom() {
    // ── The coaster's control room ────────────────────────────────────
    // A proper control building at the end of the platform, in the booths' language (part 17): a brick base, coaster-red
    // framing, steel-framed glazing and a flat roof behind a parapet with the coaster's name lit along it. Inside: the coaster
    // desk on the north wall (part 14, where it always stood) under the status board; the station desk under the long window
    // onto the platform with the CCTV monitors; the equipment bay at the east end, the lift drive and the PLC rack under the
    // clerestory and the track mimic on the east wall; and the staff corner by the door. OP holds the room's extents (the
    // floor, the roof and the walls the engine asks about).
    var OP = PK_OP, X0 = OP.x0, X1 = OP.x1, Z0 = OP.z0, Z1 = OP.z1, H = OP.h, T = 0.2, CX = (X0 + X1) / 2, CZ = (Z0 + Z1) / 2;
    var W = X1 - X0, D = Z1 - Z0, DX0 = 13.02, DX1 = 14.18, SILL = 0.95, HEAD = 2.55;
    var M = pkMats(), S2 = pkBkStd;
    var cream = S2({ color: 0xece5d7, roughness: 0.9 }), red = S2({ color: 0xa8402c, roughness: 0.6 }), brick = pkMatBrick();
    var steel = S2({ color: 0x39434a, roughness: 0.45, metalness: 0.45 }), dark = S2({ color: 0x20272c, roughness: 0.62, metalness: 0.3 });
    var inner = S2({ color: 0xe6e1d6, roughness: 0.92 }), oak = pkMatWoodRich(), glass = pkMatGlassRich();
    var hzDark = S2({ color: 0x111417, roughness: 0.7 }), hzGold = S2({ color: 0xc9a227, roughness: 0.7 });
    // a wall along x (at z) from xa to xb with glazing between ga and gb (or none), and one along z (at x) the same way
    function wallX(z, xa, xb, ga, gb, outSide) {
      var segs = ga === undefined ? [[xa, xb, false]] : [[xa, ga, false], [ga, gb, true], [gb, xb, false]];
      segs.forEach(function (sg) {
        var a0 = sg[0], a1 = sg[1], len = a1 - a0, mx = (a0 + a1) / 2; if (len < 0.01) return;
        if (!sg[2]) { box(len, H, T, cream, mx, H / 2, z); return; }
        box(len, SILL, T, cream, mx, SILL / 2, z); box(len, H - HEAD, T, cream, mx, HEAD + (H - HEAD) / 2, z);
        box(len - 0.08, HEAD - SILL, 0.04, glass, mx, (SILL + HEAD) / 2, z + outSide * 0.02);
        box(len, 0.08, 0.14, steel, mx, SILL, z + outSide * 0.03); box(len, 0.08, 0.14, steel, mx, HEAD, z + outSide * 0.03);
        for (var m = 1, n = Math.max(1, Math.round(len / 1.3)); m < n; m++) box(0.06, HEAD - SILL, 0.1, steel, a0 + len * m / n, (SILL + HEAD) / 2, z + outSide * 0.03);
      });
    }
    function wallZ(x, za, zb, ga, gb, outSide) {
      var segs = ga === undefined ? [[za, zb, false]] : [[za, ga, false], [ga, gb, true], [gb, zb, false]];
      segs.forEach(function (sg) {
        var a0 = sg[0], a1 = sg[1], len = a1 - a0, mz = (a0 + a1) / 2; if (len < 0.01) return;
        if (!sg[2]) { box(T, H, len, cream, x, H / 2, mz); return; }
        box(T, SILL, len, cream, x, SILL / 2, mz); box(T, H - HEAD, len, cream, x, HEAD + (H - HEAD) / 2, mz);
        box(0.04, HEAD - SILL, len - 0.08, glass, x + outSide * 0.02, (SILL + HEAD) / 2, mz);
        box(0.14, 0.08, len, steel, x + outSide * 0.03, SILL, mz); box(0.14, 0.08, len, steel, x + outSide * 0.03, HEAD, mz);
        for (var m = 1, n = Math.max(1, Math.round(len / 1.3)); m < n; m++) box(0.1, HEAD - SILL, 0.06, steel, x + outSide * 0.03, (SILL + HEAD) / 2, a0 + len * m / n);
      });
    }

    // ── the shell ──
    // north, toward the track: solid to the console's height, a clerestory over the equipment bay
    box(W, H, T, cream, CX, H / 2, Z0);
    box(3.6, 0.6, 0.04, glass, 18.0, 2.85, Z0 - 0.02); box(3.6, 0.07, 0.14, steel, 18.0, 2.55, Z0 - 0.03); box(3.6, 0.07, 0.14, steel, 18.0, 3.15, Z0 - 0.03);
    // west, onto the platform: the long window over the station desk
    wallZ(X0, Z0, Z1, -3.6, 1.9, -1);
    // south, onto the square: a window, the door, a long window, then the staff corner's solid end
    wallX(Z1, X0, DX0, X0 + 0.3, DX0 - 0.3, 1);                    // a window in the wall west of the door
    box(DX1 - DX0, H - 2.1, T, cream, (DX0 + DX1) / 2, 2.1 + (H - 2.1) / 2, Z1);   // the wall over the door
    wallX(Z1, DX1, X1, 14.6, 17.3, 1);
    // east: solid, the equipment wall
    box(T, H, D, cream, X1, H / 2, CZ);
    // the brick base course round the outside, a stone cap on it and the coaster-red band at the sill, corner pilasters
    // the south course stops either side of the doorway
    box(W + 0.12, SILL, 0.06, brick, CX, SILL / 2, Z0 - 0.13);
    box(DX0 - 0.12 - (X0 - 0.06), SILL, 0.06, brick, (X0 - 0.06 + DX0 - 0.12) / 2, SILL / 2, Z1 + 0.13);
    box(X1 + 0.06 - (DX1 + 0.12), SILL, 0.06, brick, (DX1 + 0.12 + X1 + 0.06) / 2, SILL / 2, Z1 + 0.13);
    box(0.06, SILL, D + 0.12, brick, X0 - 0.13, SILL / 2, CZ); box(0.06, SILL, D + 0.12, brick, X1 + 0.13, SILL / 2, CZ);
    box(W + 0.3, 0.06, 0.14, M.stone, CX, SILL + 0.02, Z0 - 0.13);
    box(DX0 - 0.12 - (X0 - 0.15), 0.06, 0.14, M.stone, (X0 - 0.15 + DX0 - 0.12) / 2, SILL + 0.02, Z1 + 0.13);
    box(X1 + 0.15 - (DX1 + 0.12), 0.06, 0.14, M.stone, (DX1 + 0.12 + X1 + 0.15) / 2, SILL + 0.02, Z1 + 0.13);
    box(0.14, 0.06, D + 0.3, M.stone, X0 - 0.13, SILL + 0.02, CZ); box(0.14, 0.06, D + 0.3, M.stone, X1 + 0.13, SILL + 0.02, CZ);
    box(W + 0.2, 0.14, 0.08, red, CX, HEAD + 0.18, Z1 + 0.14); box(0.08, 0.14, D + 0.2, red, X0 - 0.14, HEAD + 0.18, CZ);
    box(W + 0.2, 0.14, 0.08, red, CX, HEAD + 0.18, Z0 - 0.14); box(0.08, 0.14, D + 0.2, red, X1 + 0.14, HEAD + 0.18, CZ);
    [[X0, Z0], [X0, Z1], [X1, Z0], [X1, Z1], [15.6, Z1]].forEach(function (c) {
      box(0.3, H, 0.3, red, c[0], H / 2, c[1]); box(0.36, 0.1, 0.36, M.stone, c[0], 0.05, c[1]);
    });
    // a hazard band along the south kick plate, as on every booth
    for (var hz = 0; hz < 16; hz++) box(0.08, 0.1, 0.02, hz % 2 ? hzGold : hzDark, 14.7 + hz * 0.17, 0.08, Z1 + 0.17);
    // the roof: a slab with eaves, the coaster-red cornice, a parapet with a stone coping
    box(W + 0.5, 0.18, D + 0.5, MAT.roof, CX, H + 0.09, CZ);
    box(W + 0.7, 0.12, D + 0.7, red, CX, H + 0.02, CZ);
    [[CX, Z0 - 0.17, W + 0.5, 0.16], [CX, Z1 + 0.17, W + 0.5, 0.16]].forEach(function (p) { box(p[2], 0.5, p[3], cream, p[0], H + 0.43, p[1]); box(p[2] + 0.04, 0.06, p[3] + 0.06, M.stone, p[0], H + 0.71, p[1]); });
    [[X0 - 0.17, CZ], [X1 + 0.17, CZ]].forEach(function (p) { box(0.16, 0.5, D + 0.5, cream, p[0], H + 0.43, p[1]); box(0.22, 0.06, D + 0.54, M.stone, p[0], H + 0.71, p[1]); });
    // the roof sign over the square, and the smaller one over the platform
    [-2.1, 2.1].forEach(function (dx) { box(0.1, 0.5, 0.1, MAT.steelDark, 15.0 + dx, H + 0.95, Z1 - 0.15); });
    box(5.0, 0.9, 0.22, MAT.steelDark, 15.0, H + 1.62, Z1 - 0.15);
    pkSign3D(['THE COASTER'], 4.8, 0.74, 15.0, H + 1.62, Z1 - 0.03, 0, { bg: '#151a20', fg: '#ffcf5a' });
    pkSign3D(['RIDE CONTROL'], 2.6, 0.36, X0 - 0.28, H + 0.43, CZ, -Math.PI / 2, { bg: '#151a20', fg: '#ffcf5a' });
    // the plant on the roof, its fan turning
    var acG = new THREE.Group(); acG.position.set(18.4, H + 0.18, -2.6); scene.add(acG);
    pkBevelBox(1.3, 0.7, 0.9, S2({ color: 0xd9d6cc, roughness: 0.5 }), 0, 0.35, 0, acG, 0.03);
    for (var acl = 0; acl < 6; acl++) box(0.9, 0.03, 0.02, MAT.steelDark, -0.1, 0.12 + acl * 0.08, 0.455, acG);
    var acFanG = new THREE.Group(); acFanG.position.set(0, 0.71, 0.05); acFanG.userData.dynamic = true; acG.add(acFanG);
    cyl(0.34, 0.03, MAT.black, 0, 0.705, 0.05, acG, 16);
    for (var fb = 0; fb < 4; fb++) { var fbl = box(0.06, 0.012, 0.28, MAT.steel, 0, 0, 0.14, null); var fa = new THREE.Group(); fa.rotation.y = fb * Math.PI / 2; acFanG.add(fa); fa.add(fbl); }
    pkCtlLive({ tick: function (dt) { acFanG.rotation.y += dt * 8; } });
    // the signal tower on the roof's platform corner (pkOpSignal lights it), a camera sweeping the platform, an aerial
    pkRoundCyl(0.035, 0.9, MAT.steelDark, X0 + 0.4, H + 0.63, Z1 - 0.5, null, 8);
    var opLampM = [0xff3b30, 0xf0c04a, 0x5fd38d].map(function (col) { return glowMat(col, 0.12); });
    [2, 1, 0].forEach(function (li, k) { pkRoundCyl(0.075, 0.12, opLampM[li], X0 + 0.4, H + 1.14 + k * 0.13, Z1 - 0.5, null, 16); pkRoundCyl(0.08, 0.012, MAT.steelDark, X0 + 0.4, H + 1.205 + k * 0.13, Z1 - 0.5, null, 16); });
    var beacon = sphere(0.09, glowMat(0xff3b30, 0.4), X0 + 0.4, H + 1.62, Z1 - 0.5);
    PK.opLamps = { mats: opLampM, beacon: beacon.material };
    pkBkCamera(scene, X0 - 0.17, H - 0.35, Z0 + 0.4, -Math.PI / 2 - 0.35, 0.5);
    pkRoundCyl(0.025, 1.6, MAT.steelDark, X1 - 0.4, H + 1.0, Z0 + 0.4, null, 6);
    // the east wall outside: louvres, the services box and its conduit, a downpipe
    for (var lv = 0; lv < 7; lv++) box(0.04, 0.05, 1.0, MAT.steelDark, X1 + 0.13, 1.6 + lv * 0.11, -2.4);
    pkBevelBox(0.2, 0.7, 0.55, S2({ color: 0x8a949b, roughness: 0.45, metalness: 0.5 }), X1 + 0.22, 1.25, 0.6, null, 0.02);
    pkSign3D(['DANGER 400V'], 0.34, 0.1, X1 + 0.33, 1.45, 0.6, Math.PI / 2, { bg: '#f0c04a', fg: '#1b232c' });
    cyl(0.04, 0.9, MAT.steelDark, X1 + 0.22, 0.45, 0.6, null, 8);
    pkRoundCyl(0.05, H, MAT.steelDark, X1 + 0.18, H / 2, Z1 - 0.3, null, 8);

    // ── the door, the porch and the square ──
    [[DX0 - 0.06, Z1 + 0.06], [DX1 + 0.06, Z1 + 0.06]].forEach(function (c) { box(0.12, 2.2, 0.13, red, c[0], 1.1, c[1]); });
    box(DX1 - DX0 + 0.26, 0.12, 0.13, red, (DX0 + DX1) / 2, 2.16, Z1 + 0.06);
    PK.opDoor = pkBkDoor(scene, DX0, 0, Z1 - 0.02, Math.PI / 2, -1.5, DX1 - DX0, 2.08, { leaf: cream, glass: M.glass, kick: MAT.hazard }, 'the control room door');
    pkAwning(2.0, 0.8, 0.5, '#a8402c', '#f3ead6', (DX0 + DX1) / 2, 2.62, Z1 + 0.12, 0, null);
    pkSign3D(['RIDE CONTROL', 'THE COASTER'], 2.3, 0.36, 15.9, 2.95, Z1 + 0.13, 0, { bg: '#1b232c', fg: '#f5b53d' });
    box(1.4, 0.03, 0.7, MAT.steelDark, (DX0 + DX1) / 2, 0.05, Z1 + 0.5);
    var opPlantG = new THREE.Group(); opPlantG.position.set(0, 0, 0); scene.add(opPlantG);
    pkBoothLantern(opPlantG, DX0 - 0.3, 2.1, Z1 + 0.22);
    pkBoothLantern(opPlantG, DX1 + 0.3, 2.1, Z1 + 0.22);
    pkPlanter(1.6, opPlantG, 11.9, 0, Z1 + 0.65);
    pkPlanter(1.6, opPlantG, 16.2, 0, Z1 + 0.65);
    pkBkFirePoint(scene, 17.6, 0.0, Z1 + 0.1, 0);
    pkPaved(2.6, 6.6, M.paversWarm, (DX0 + DX1) / 2, 0.045, Z1 + 3.4, 0);
    // the queue board on its post by the lane's entry, facing the square: the wait, in amber dots
    pkRoundCyl(0.05, 2.2, MAT.steelDark, 9.0, 1.1, 9.6, null, 10);
    pkBevelBox(0.3, 0.12, 0.3, M.stoneDark, 9.0, 0.06, 9.6, null, 0.02);
    solid(8.85, 9.15, 9.45, 9.75, 0, 2.3);
    var qbG = new THREE.Group(); qbG.position.set(9.0, 2.45, 9.68); scene.add(qbG);
    pkBevelBox(1.36, 0.42, 0.08, MAT.steelDark, 0, 0, -0.03, qbG, 0.015);
    var qb = touchScreen({ w: 320, h: 96, pw: 1.24, ph: 0.34, x: 0, y: 0, z: 0.012, parent: qbG, title: 'The coaster: the queue board',
      draw: function (c, s) {
        c.fillStyle = '#0a0806'; c.fillRect(0, 0, s.w, s.h);
        c.fillStyle = 'rgba(255,170,40,0.05)'; for (var yy = 2; yy < s.h; yy += 4) for (var xx = 2; xx < s.w; xx += 4) c.fillRect(xx, yy, 2, 2);
        var R = PK.ride, n = PK.queue.length, wait = Math.ceil(Math.ceil((n + 1) / Math.max(1, PK.seats.length)) * 75 / 60);
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = '#ffb03a'; c.font = 'bold 28px ' + SCREEN_THEME.font; c.fillText('THE COASTER', s.w / 2, 26);
        c.fillStyle = R.fault ? '#ff5a3c' : '#ffcf6a'; c.font = 'bold 24px ' + SCREEN_THEME.font;
        c.fillText(R.fault ? 'STOPPED' : PK.closed ? 'PARK CLOSED' : (n ? 'WAIT ' + wait + ' MIN' : 'NO WAIT · WALK ON'), s.w / 2, 68);
      } });
    PK_BK_LIVE.push({ sc: qb, g: qbG, every: 1.0 });

    // ── inside ──
    pkPaved(W - 0.2, D - 0.2, S2({ color: 0x8f969b, roughness: 0.85 }), CX, 0.043, CZ, 0.6);   // grey anti-static floor tiles
    box(W - 0.2, 0.06, D - 0.2, inner, CX, H - 0.03, CZ);                                       // the ceiling
    // a wainscot round the walls: the coaster's green to the chair rail
    var wains = S2({ color: 0x3d5b49, roughness: 0.62 });
    box(W - 0.4, 0.9, 0.04, wains, CX, 0.45, Z0 + 0.12); box(W - 0.38, 0.06, 0.08, oak, CX, 0.92, Z0 + 0.13);
    box(0.04, 0.9, D - 0.4, wains, X1 - 0.12, 0.45, CZ); box(0.08, 0.06, D - 0.38, oak, X1 - 0.13, 0.92, CZ);
    [0.6, 2.1, 3.6].forEach(function (k) { pkBkBatten(scene, X0 + 1.4 + (k / 3.6) * (W - 2.8), H - 0.06, CZ - 0.6, 0, 1.3); });
    // the coaster desk under the long window, facing it: the operator works the ride with the platform and the train in
    // front of them; the status board hangs on the north wall at their right hand
    pkBuildCoasterConsole({ x: X0 + 0.6, z: -0.85, ry: Math.PI / 2 });
    pkBkChair(scene, X0 + 1.55, -0.85, -Math.PI / 2, 0);
    box(1.08, 0.96, 0.06, MAT.steelDark, 14.8, 2.02, Z0 + 0.07);
    // the station desk on the north wall: oak on a steel frame, the CCTV monitors on their stands, the radio and the log
    var sdz = Z0 + 0.5;
    pkBevelBox(3.0, 0.05, 0.72, oak, 14.8, 0.78, sdz, null, 0.012);
    pkBevelBox(3.0, 0.72, 0.04, dark, 14.8, 0.38, sdz - 0.28, null, 0.008);
    [13.4, 16.2].forEach(function (x) { pkBevelBox(0.06, 0.74, 0.66, steel, x, 0.38, sdz, null, 0.01); });
    pkOpMonitors(14.5, sdz - 0.08, 0);
    pkBkRadio(scene, 15.9, 0.805, sdz - 0.05, 0);
    pkBevelBox(0.22, 0.03, 0.3, S2({ color: 0x2f4f7a, roughness: 0.7 }), 15.45, 0.82, sdz + 0.05, null, 0.008);
    pkRoundCyl(0.045, 0.1, S2({ color: 0xf2efe6, roughness: 0.5 }), 13.7, 0.85, sdz + 0.12, null, 12);
    pkBkChair(scene, 14.6, sdz + 0.95, Math.PI, 0);
    // the equipment bay: the lift drive and the PLC rack under the clerestory, the track mimic on the east wall
    pkOpLiftDrive(16.95, Z0 + 0.42);
    pkOpPlcRack(18.75, Z0 + 0.42);
    pkOpMimic(X1 - 0.13, -0.6);
    // the staff corner by the door: lockers, a water cooler, the key box, the clock, the intercom, a vest on its hook
    for (var lk = 0; lk < 4; lk++) {
      var lx = 17.75 + lk * 0.52;
      pkBevelBox(0.5, 1.85, 0.48, S2({ color: lk % 2 ? 0x5a6f7c : 0x51656f, roughness: 0.5, metalness: 0.35 }), lx, 0.925, Z1 - 0.36, null, 0.01);
      for (var sl = 0; sl < 4; sl++) box(0.3, 0.012, 0.01, MAT.black, lx, 1.55 + sl * 0.04, Z1 - 0.6);
      box(0.03, 0.12, 0.02, MAT.chrome, lx + 0.17, 1.0, Z1 - 0.61);
    }
    pkRoundCyl(0.16, 1.0, S2({ color: 0xe8e6e0, roughness: 0.5 }), 17.2, 0.5, Z1 - 0.3, null, 14);
    pkRoundCyl(0.14, 0.38, S2({ color: 0x8fc6e8, roughness: 0.1, transparent: true, opacity: 0.6 }), 17.2, 1.2, Z1 - 0.3, null, 14);
    pkBkKeyBox(scene, 12.3, 1.6, Z1 - 0.12, Math.PI);
    pkBkClock(scene, 12.2, 2.55, Z0 + 0.12, 0, 0.17);
    pkBkIntercom(scene, 11.7, 1.5, Z0 + 0.1, 0);
    pkBkVest(scene, X1 - 0.13, 1.85, 1.2, -Math.PI / 2);
    pkBkFirstAid(scene, X1 - 0.13, 2.2, -2.6, -Math.PI / 2);
    pkBkClipboard(scene, 16.25, 1.6, Z0 + 0.11, 0);
    // the screen on the north wall: a status board that reports, while the desk does the work
    PK.screen = touchScreen({
      w: 420, h: 380, pw: 0.9, ph: 0.78, x: 14.8, y: 2.02, z: Z0 + 0.12, parent: null, title: 'Ride control',
      draw: function (ctx, s) {
        var R = PK.ride;
        scBg(ctx, s.w, s.h); scHead(ctx, s.w, 'RIDE CONTROL', pkRideWord());
        var live = R.fault ? 'STOPPED' : R.state === 'running' ? 'ON TRACK' : R.state === 'dispatch' ? 'DISPATCHING' : R.state === 'ready' ? 'READY TO SEND' : R.state === 'unloading' ? 'UNLOADING' : 'AT THE STATION';
        var col = R.fault ? '#ff6b5e' : R.state === 'running' ? '#5fd38d' : '#f5b53d';
        ctx.fillStyle = col; ctx.font = 'bold 42px ' + SCREEN_THEME.font; ctx.textAlign = 'left'; ctx.fillText(live, 16, 92);
        ctx.textAlign = 'right'; ctx.fillStyle = '#a0acb8'; ctx.font = '16px ' + SCREEN_THEME.font;
        ctx.fillText((R.v || 0).toFixed(1) + ' m/s', s.w - 16, 92);
        ctx.textAlign = 'left';
        var cars = 3, per = Math.ceil(PK.seats.length / cars);
        for (var c = 0; c < cars; c++) {
          var x0 = 16 + c * 132, y0 = 112;
          ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(x0, y0, 120, 46);
          for (var q = 0; q < per; q++) { ctx.fillStyle = ((c * per + q) < R.riders) ? '#5fd38d' : 'rgba(255,255,255,0.18)'; ctx.fillRect(x0 + 8 + q * 18, y0 + 10, 13, 26); }
          ctx.fillStyle = '#7d8a96'; ctx.font = '12px ' + SCREEN_THEME.font; ctx.fillText('CAR ' + (c + 1), x0 + 4, y0 + 44);
        }
        var rows = [
          ['GATES', PK.gates[0] && PK.gates[0].open ? 'OPEN' : 'CLOSED', PK.gates[0] && PK.gates[0].open ? '#5fd38d' : '#a0acb8'],
          ['RESTRAINTS', R.barsWant > 0.5 ? 'DOWN' : 'UP', R.barsWant > 0.5 ? '#5fd38d' : '#a0acb8'],
          ['OPERATION', R.fault ? R.fault.toUpperCase() : (S.auto || S.operator ? 'AUTOMATIC' : 'MANUAL'), R.fault ? '#ff6b5e' : '#f5b53d'],
          ['TRACK WEAR', Math.round(S.wear || 0) + ' %', (S.wear || 0) > 70 ? '#ff6b5e' : '#eef1f5']
        ];
        for (var i = 0; i < rows.length; i++) {
          var y = 186 + i * 34;
          ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(16, y - 16, s.w - 32, 28);
          ctx.fillStyle = '#a0acb8'; ctx.font = '14px ' + SCREEN_THEME.font; ctx.fillText(rows[i][0], 26, y + 3);
          ctx.fillStyle = rows[i][2]; ctx.font = 'bold 15px ' + SCREEN_THEME.font; ctx.textAlign = 'right';
          ctx.fillText(rows[i][1], s.w - 26, y + 3); ctx.textAlign = 'left';
        }
        scText(ctx, 16, 336, 'Cycles ' + (S.cycles || 0) + '   Riders today ' + PK.today.rides, '#a0acb8', 13);
        scText(ctx, 16, 356, 'Level ' + PK.level + '   Tickets ' + PK.today.tickets + '   Snacks ' + PK.today.snacks, '#7d8a96', 13);
      }
    });

    // ── collision ──
    solid(X0 - 0.15, X0 + 0.15, Z0, Z1, 0, H);                       // west
    solid(X1 - 0.15, X1 + 0.15, Z0, Z1, 0, H);                       // east
    solid(X0, X1, Z0 - 0.15, Z0 + 0.15, 0, H);                       // north
    solid(X0, DX0 - 0.04, Z1 - 0.15, Z1 + 0.15, 0, H);               // south, west of the door
    solid(DX1 + 0.04, X1, Z1 - 0.15, Z1 + 0.15, 0, H);               // south, east of the door
    solid(13.3, 16.3, Z0 + 0.15, Z0 + 0.86, 0, 1.0);                 // the station desk (the coaster desk makes its own)
    solid(16.4, 19.6, Z0 + 0.15, Z0 + 0.75, 0, 2.0);                 // the lift drive and the rack
    solid(17.45, X1 - 0.1, Z1 - 0.65, Z1 - 0.1, 0, 1.9);             // the lockers
  }
  // the room's extents: the floor the player stands on indoors, the roof over it and the walls the engine asks about
  var PK_OP = { x0: 11, x1: 20, z0: -4, z1: 2.4, h: 3.4 };

  // ── The lift drive ────────────────────────────────────────────────
  // a floor-standing cabinet for the lift motor: its current and speed on meters, the interlock lamps (lift run, the anti-
  // rollback dogs, the station brakes, the block ahead clear) and a lamp test. It reads the train: the motor pulls while the
  // lead car is on the lift.
  function pkOpLiftDrive(x, z) {
    var M = pkCtlM(), H2 = new THREE.Group(); H2.position.set(x, 0, z); scene.add(H2);
    pkBevelBox(1.05, 1.95, 0.55, M.case, 0, 0.975, 0, H2, 0.02);
    pkBevelBox(1.1, 0.05, 0.6, M.face, 0, 1.97, 0, H2, 0.01);
    for (var v = 0; v < 6; v++) box(0.6, 0.014, 0.01, M.well, 0, 0.18 + v * 0.04, 0.281, H2);
    var PW = 0.86, PH = 0.9;
    var P = pkCtlPanel({ w: PW, h: PH, x: 0, y: 1.35, z: 0.28, parent: H2, key: 'pk-op-lift',
      draw: function (c, W2, H3) {
        var R2 = pkCtlRuler(W2, H3, PW, PH); R2.c = c;
        R2.engrave('LIFT DRIVE', 0, 0.405, 0.030);
        R2.txt('M1  ·  90 kW  ·  VFD', 0, 0.37, 0.0135, '#a6b4bc');
        R2.txt('MOTOR A', -0.21, 0.13, 0.016, '#aebcc4'); R2.txt('CHAIN m/s', 0.21, 0.13, 0.016, '#aebcc4');
        var L = ['LIFT RUN', 'ANTI-ROLLBACK', 'STATION BRAKES', 'BLOCK CLEAR'];
        for (var i = 0; i < L.length; i++) R2.txt(L[i], -0.24, -0.03 - i * 0.07, 0.0145, '#d6dee3', 'left');
        R2.txt('LAMP TEST', 0.27, -0.25, 0.013, '#aebcc4');
        R2.txt('ISOLATE BEFORE OPENING', 0, -0.425, 0.013, '#7d8a96');
      } });
    function onLift() { var u = PK.ride.u; return PK.ride.state === 'running' && u >= PK.liftU[0] && u <= PK.liftU[1]; }
    pkCtlGauge(P, -0.21, 0.24, { id: 'liftA', unit: 'amps', min: 0, max: 200, red: 0.85, ticks: 5, r: 0.085, ease: 3, get: function () { return onLift() ? 0.62 + 0.04 * Math.sin(PK_BK_T * 6) : 0.04; } });
    pkCtlGauge(P, 0.21, 0.24, { id: 'chain', unit: 'm/s', min: 0, max: 6, red: 0.8, ticks: 6, r: 0.085, ease: 2, get: function () { return onLift() ? 0.66 : (PK.ride.state === 'running' ? 0.66 : 0); } });
    var lamps = [0x5fd38d, 0xf0c04a, 0xff3b30, 0x5fd38d].map(function (col, i) { return pkCtlLamp(P, -0.31, -0.03 - i * 0.07, { r: 0.016, col: col }); });
    var testT = 0;
    pkCtlBtn(P, 0.27, -0.17, { id: 'liftTest', label: 'LAMP TEST', col: 'white', r: 0.026, lampCol: 0xe8e4d8, prompt: 'Lamp test', act: function () { testT = 2; sfx('click'); } });
    pkCtlLive({ tick: function (dt) {
      if (testT > 0) testT -= dt;
      var all = testT > 0, R = PK.ride, d = Math.abs(((R.u - PK.stationU + 1.5) % 1) - 0.5);
      lamps[0].on = all || onLift();
      lamps[1].on = all || (R.state === 'running' && R.u >= PK.liftU[0] && R.u <= PK.liftU[1] + 0.02);
      lamps[2].on = all || d < 0.02;
      lamps[3].on = all || (R.state !== 'running' || d > 0.15);
    } });
  }
  // ── The PLC rack ──────────────────────────────────────────────────
  // a glazed rack with the ride computer: rows of I/O cards whose lamps flicker with the ride, a power supply and a patch field
  function pkOpPlcRack(x, z) {
    var M = pkCtlM(), H2 = new THREE.Group(); H2.position.set(x, 0, z); scene.add(H2);
    pkBevelBox(1.05, 1.95, 0.55, M.case, 0, 0.975, 0, H2, 0.02);
    box(0.92, 1.6, 0.02, pkMats().glass, 0, 1.05, 0.285, H2);
    var leds = [];
    for (var row = 0; row < 4; row++) {
      var ry = 1.6 - row * 0.32;
      pkBevelBox(0.86, 0.26, 0.04, S2c(0x23292e), 0, ry, 0.24, H2, 0.006);
      for (var card = 0; card < 10; card++) {
        var cx = -0.38 + card * 0.084;
        box(0.07, 0.22, 0.03, S2c(card % 3 ? 0x6a7680 : 0x4f6a5a), cx, ry, 0.26, H2);
        for (var l = 0; l < 4; l++) { var m = glowMat([0x5fd38d, 0xf0c04a, 0x5fd38d, 0xff3b30][l], 0.1); leds.push({ m: m, k: Math.random() * 6, f: 2 + Math.random() * 7, base: l === 0 }); box(0.012, 0.012, 0.01, m, cx - 0.02, ry + 0.07 - l * 0.035, 0.277, H2); }
      }
    }
    pkBevelBox(0.86, 0.2, 0.05, S2c(0x8a949b), 0, 0.32, 0.24, H2, 0.008);
    box(0.03, 0.03, 0.01, glowMat(0x5fd38d, 1.4), 0.36, 0.32, 0.27, H2);
    pkSign3D(['RIDE PLC'], 0.4, 0.1, 0, 1.88, 0.29, 0, { bg: '#1b232c', fg: '#e8e4d8' }, H2);
    pkCtlLive({ tick: function (dt) {
      var busy = PK.ride.state === 'running' ? 1 : (PK.ride.state === 'idle' ? 0.25 : 0.6);
      for (var i = 0; i < leds.length; i++) { var L = leds[i]; L.k += dt * L.f; L.m.emissiveIntensity = L.base ? 1.4 : (Math.sin(L.k) > 1 - busy * 1.6 ? 1.6 : 0.08); }
    } });
    function S2c(c) { return pkBkStd({ color: c, roughness: 0.5, metalness: 0.35 }); }
  }

  // ── The track mimic board ─────────────────────────────────────────
  // the circuit drawn from above on a lit panel: the station, the lift, the blocks, and the train going round it live. Each
  // block is a lamp: red while the train is in it, green when it is clear.
  var PK_MIMIC = null;
  function pkOpMimic(x, z) {
    var g = new THREE.Group(); g.position.set(x, 1.95, z); g.rotation.y = -Math.PI / 2; scene.add(g);
    pkBevelBox(1.5, 0.92, 0.06, MAT.steelDark, 0, 0, -0.03, g, 0.015);
    var N = 240, P = [], xs = [], zs = [];
    for (var i = 0; i < N; i++) { var p = PK.curve.getPointAt(i / N); P.push(p); xs.push(p.x); zs.push(p.z); }
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), z0 = Math.min.apply(null, zs), z1 = Math.max.apply(null, zs);
    var BL = 8;   // blocks round the lap
    var sc = touchScreen({ w: 420, h: 256, pw: 1.4, ph: 0.85, x: 0, y: 0, z: 0.006, parent: g, title: 'The track mimic',
      draw: function (c, s) {
        c.fillStyle = '#10161b'; c.fillRect(0, 0, s.w, s.h);
        c.fillStyle = '#c9a227'; c.font = 'bold 14px ' + SCREEN_THEME.font; c.textAlign = 'left'; c.fillText('THE COASTER  ·  TRACK MIMIC', 12, 20);
        c.fillStyle = '#7d8a96'; c.font = '11px ' + SCREEN_THEME.font; c.fillText('BLOCKS ' + BL + '   LAP ' + Math.round(PK.len) + ' m', 12, 36);
        var m = 30, kx = (s.w - m * 2) / (x1 - x0), kz = (s.h - 60 - m) / (z1 - z0), k = Math.min(kx, kz), ox = (s.w - (x1 - x0) * k) / 2, oz = 48;
        function X(p) { return ox + (p.x - x0) * k; } function Z(p) { return oz + (p.z - z0) * k; }
        var R = PK.ride, tb = Math.floor((((R.u - PK.stationU) % 1 + 1) % 1) * BL);
        for (var b = 0; b < BL; b++) {
          c.strokeStyle = b === tb ? '#ff4a3a' : '#3f8f5f'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath();
          for (var j = 0; j <= N / BL; j++) { var q = P[(Math.floor(PK.stationU * N) + b * N / BL + j) % N]; if (j === 0) c.moveTo(X(q), Z(q)); else c.lineTo(X(q), Z(q)); }
          c.stroke();
        }
        // the lift and the station, marked
        c.fillStyle = '#9fb2c0'; c.font = '10px ' + SCREEN_THEME.font; c.textAlign = 'center';
        var ps = PK.curve.getPointAt(PK.stationU), pl = PK.curve.getPointAt((PK.liftU[0] + PK.liftU[1]) / 2);
        c.fillText('STATION', X(ps), Z(ps) + 18); c.fillText('LIFT', X(pl) + 18, Z(pl));
        // the train: three cars, the lead one brighter
        for (var t = 0; t < 3; t++) { var u = ((R.u - t * PK.carGap / PK.len) % 1 + 1) % 1, pt = PK.curve.getPointAt(u); c.fillStyle = t ? '#ffd27a' : '#ffffff'; c.beginPath(); c.arc(X(pt), Z(pt), t ? 4 : 5, 0, 6.283); c.fill(); }
        c.textAlign = 'left'; c.fillStyle = R.fault ? '#ff6b5e' : '#d6dee3'; c.font = 'bold 12px ' + SCREEN_THEME.font;
        c.fillText((R.fault ? 'STOP  ' : '') + 'BLOCK ' + (tb + 1) + '   ' + (R.v || 0).toFixed(1) + ' m/s', 12, s.h - 10);
      } });
    PK_BK_LIVE.push({ sc: sc, g: g, every: 0.25 });
    PK_MIMIC = sc;
  }
  // two CCTV monitors on their stands on the station desk, turned to the operator: the queue lane and the platform
  function pkOpMonitors(x, z, ry) {
    var g = new THREE.Group(); g.position.set(x, 1.12, z); g.rotation.y = ry === undefined ? Math.PI / 2 : ry; scene.add(g);
    [-0.27, 0.27].forEach(function (dx) { pkRoundCyl(0.025, 0.2, pkMats().iron, dx, -0.22, -0.08, g, 6); pkBevelBox(0.22, 0.02, 0.16, pkMats().iron, dx, -0.32, -0.06, g, 0.006); });
    pkBkMonitor(g, -0.27, 0, 0, 0.15, -0.05, 'CAM 1 · the coaster queue', function (c, s) {
      c.fillStyle = '#071108'; c.fillRect(0, 0, s.w, s.h);
      c.fillStyle = '#8fe0a0'; c.font = 'bold 13px monospace'; c.textAlign = 'left'; c.fillText('CAM 1  QUEUE LANE', 8, 16);
      c.textAlign = 'right'; c.fillText(fmtTime(S.time), s.w - 8, 16);
      var n = PK_QUEUE_SLOTS.length, q = PK.queue.length, bw = (s.w - 24) / n;
      for (var i = 0; i < n; i++) { c.strokeStyle = 'rgba(143,224,160,0.3)'; c.strokeRect(12 + i * bw, 60, bw - 4, 38); if (i < q) { c.fillStyle = '#cfe9d4'; c.beginPath(); c.arc(12 + i * bw + (bw - 4) / 2, 79, Math.min(9, bw / 3), 0, 6.283); c.fill(); } }
      c.fillStyle = '#8fe0a0'; c.textAlign = 'left'; c.font = '13px monospace'; c.fillText('IN LINE ' + q, 10, 132);
      if (Math.floor(PK_BK_T) % 2 === 0) { c.fillStyle = '#ff3b30'; c.beginPath(); c.arc(s.w - 14, 150, 5, 0, 6.283); c.fill(); }
      pkBkScanlines(c, s.w, s.h);
    });
    pkBkMonitor(g, 0.27, 0, 0, -0.15, -0.05, 'CAM 2 · the platform', function (c, s) {
      var R = PK.ride;
      c.fillStyle = '#070b11'; c.fillRect(0, 0, s.w, s.h);
      c.fillStyle = '#9fc6ff'; c.font = 'bold 13px monospace'; c.textAlign = 'left'; c.fillText('CAM 2  PLATFORM', 8, 16);
      for (var cr = 0; cr < 3; cr++) for (var st = 0; st < 4; st++) {
        var x = 12 + cr * 74 + (st % 2) * 30, y = 36 + Math.floor(st / 2) * 30, seat = PK.seats[cr * 4 + st];
        c.strokeStyle = 'rgba(159,198,255,0.45)'; c.strokeRect(x, y, 26, 26);
        if (seat && seat.guest) { c.fillStyle = '#d7e6ff'; c.fillRect(x + 3, y + 3, 20, 20); }
      }
      c.fillStyle = R.fault ? '#ff6b5e' : '#9fc6ff'; c.font = 'bold 14px monospace'; c.fillText(pkRideWord().toUpperCase(), 10, 120);
      c.font = '12px monospace'; c.fillText('BARS ' + (R.bars > 0.5 ? 'LOCKED' : 'OPEN') + '   GATES ' + (PK.gates[0] && PK.gates[0].open ? 'OPEN' : 'SHUT'), 10, 148);
      pkBkScanlines(c, s.w, s.h);
    });
  }
  // the desk buttons and the AUTO lever are gone: the screen carries every control
  // ── The snack stand ───────────────────────────────────────────────
  function pkBuildSnack() {
    var g = new THREE.Group(); g.position.set(-13, 0, 8); scene.add(g);
    box(3.4, 3.0, 0.2, MAT.plaster, 0, 1.5, -1.6, g);
    box(0.2, 3.0, 3.4, MAT.plaster, -1.6, 1.5, 0, g);
    box(0.2, 3.0, 3.4, MAT.plaster, 1.6, 1.5, 0, g);
    box(3.6, 0.16, 3.6, MAT.roof, 0, 3.05, 0, g);
    box(3.4, 1.05, 0.5, MAT.wood, 0, 0.52, 1.5, g);
    box(3.5, 0.08, 0.6, MAT.trim, 0, 1.08, 1.5, g);
    box(3.4, 0.5, 0.2, MAT.plaster, 0, 2.75, 1.6, g);
    box(0.2, 3.0, 0.2, MAT.plaster, -1.6, 1.5, 1.6, g);
    box(0.2, 3.0, 0.2, MAT.plaster, 1.6, 1.5, 1.6, g);
    solid(-14.75, -11.25, 6.25, 6.6, 0, 3.0);
    solid(-14.75, -14.4, 6.25, 9.75, 0, 3.0);
    solid(-11.6, -11.25, 6.25, 9.75, 0, 3.0);
    solid(-14.75, -11.25, 9.3, 9.75, 0, 1.1);
    // the stand is dressed on every side, because the path runs round it: a timber skirt and
    // battens, a service door at the back, a menu board on the west flank, a roof fascia and a
    // small canopy over the hatch. Without these the moved stand is a white box from the north.
    box(3.4, 0.5, 0.06, MAT.wood, 0, 0.25, -1.73, g);
    for (var sb = 0; sb < 5; sb++) box(0.07, 2.2, 0.05, MAT.trim, -1.45 + sb * 0.725, 1.75, -1.74, g);
    box(0.85, 2.0, 0.07, MAT.wood, 0.75, 1.0, -1.74, g);
    sphere(0.035, MAT.gold, 1.05, 1.0, -1.79, g);
    box(0.06, 0.5, 3.4, MAT.wood, -1.73, 0.25, 0, g);
    box(0.06, 0.5, 3.4, MAT.wood, 1.73, 0.25, 0, g);
    for (var sw = 0; sw < 4; sw++) {
      box(0.05, 2.2, 0.07, MAT.trim, -1.74, 1.75, -1.25 + sw * 0.83, g);
      box(0.05, 2.2, 0.07, MAT.trim, 1.74, 1.75, -1.25 + sw * 0.83, g);
    }
    sign(['MENU', 'FRIES', 'DRINKS'], 0.8, 0.7, -1.78, 1.95, 0.35, -Math.PI / 2, { bg: '#0d1216', fg: '#eef1f5' }, g);
    box(3.66, 0.14, 0.08, MAT.trim, 0, 2.93, -1.79, g);
    box(3.66, 0.14, 0.08, MAT.trim, 0, 2.93, 1.79, g);
    box(0.08, 0.14, 3.58, MAT.trim, -1.79, 2.93, 0, g);
    box(0.08, 0.14, 3.58, MAT.trim, 1.79, 2.93, 0, g);
    box(3.6, 0.09, 0.85, MAT.trim, 0, 2.5, 1.98, g);
    box(0.07, 0.3, 0.07, MAT.trim, -1.55, 2.36, 2.3, g);
    box(0.07, 0.3, 0.07, MAT.trim, 1.55, 2.36, 2.3, g);
    sign(['SNACKS'], 2.6, 0.6, 0, 2.75, 1.72, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);
    sign(['FRIES ' + money(S.snackPrice)], 2.2, 0.4, 0, 1.9, 1.72, 0, { bg: '#0d1216', fg: '#eef1f5' }, g);
    hitBox(3.0, 1.4, 0.6, 0, 1.5, 1.5, {
      prompt: function () { return PK.snackOpen ? 'Sell a snack (' + money(S.snackPrice) + ')' : 'The snack stand is shut'; },
      use: function () { pkSnackBuy(); }
    }, g);
    PK.snack = touchScreen({
      w: 300, h: 220, pw: 0.62, ph: 0.45, x: 0, y: 1.35, z: 1.28, parent: g, title: 'Snack stand',
      draw: function (ctx, s) {
        scBg(ctx, s.w, s.h); scHead(ctx, s.w, 'SNACKS', 'Day ' + S.day);
        scText(ctx, 16, 66, 'Fries ' + money(S.snackPrice));
        scText(ctx, 16, 88, PK.snackOpen ? 'Open' : 'Shut until level 2', PK.snackOpen ? '#5fd38d' : '#a0acb8');
        scText(ctx, 16, 110, 'Sold today: ' + PK.today.snacks, '#a0acb8');
        scButton(s, 16, 130, 130, 40, 'Sell', PK.snackOpen, function () { pkSnackBuy(); });
        scButton(s, 154, 130, 130, 40, 'Price +', true, function () { pkSnackPrice(1); });
      }
    });
  }
  function pkSnackPrice(n) {
    S.snackPrice = clamp(Math.round((S.snackPrice + n) * 100) / 100, 1, 40);
    screenDirtyAll(); hudDirty = true;
    toast('Fries ' + money(S.snackPrice), '');
    return S.snackPrice;
  }
  function pkSnackBuy() {
    if (!PK.snackOpen) { sfx('bad'); toast('The snack stand is not open yet', 'bad'); return false; }
    var gu = pkNearestHuman(-13, 8);
    if (!gu) { sfx('bad'); toast('Nobody is at the stand', 'bad'); return false; }
    pay(S.snackPrice, 'Snack');
    PK.today.snacks++; PK.today.earned += S.snackPrice;
    pkXp(1); sfx('cash'); say(gu, 'Thanks!'); toast('Snack sold', 'good');
    screenDirtyAll(); hudDirty = true; return true;
  }
  // ── Placing the train ─────────────────────────────────────────────
  function pkPlaceCar(car, u) {
    var p = PK.curve.getPointAt(u), t = PK.curve.getTangentAt(u);
    car.position.set(p.x, p.y, p.z);
    car.rotation.order = 'YXZ';
    car.rotation.y = Math.atan2(t.x, t.z);
    car.rotation.x = -Math.asin(clamp(t.y, -1, 1));
    car.rotation.z = 0;
    car.updateMatrixWorld(true);
  }
  function pkPlaceTrain() {
    if (!PK.curve) return;
    for (var i = 0; i < PK.cars.length; i++) pkPlaceCar(PK.cars[i], (PK.ride.u - i * PK.carGap / PK.len + 1) % 1);
  }
  function pkSpeedAt(u) {
    if (u >= PK.liftU[0] && u <= PK.liftU[1]) return 4.0;
    var p = PK.curve.getPointAt(u);
    return clamp(Math.sqrt(Math.max(1, 2 * 9.81 * (15.5 - p.y))), 4, 26);
  }
  // ── Seating ───────────────────────────────────────────────────────
  function pkBlobOf(g) {
    for (var i = 0; i < g.children.length; i++) {
      var c = g.children[i];
      if (c.isMesh && c.userData && c.userData.noBake && c.geometry && c.geometry.type === 'PlaneGeometry') return c;
    }
    return null;
  }
  function pkSeatWorld(seat) {
    var car = PK.cars[seat.car];
    car.updateMatrixWorld(true);
    return car.localToWorld(new THREE.Vector3(seat.local.x, seat.local.y, seat.local.z));
  }
  function pkSeatGuest(guest, seat) {
    var car = PK.cars[seat.car];
    car.add(guest.g);
    guest.g.position.set(seat.local.x, seat.local.y, seat.local.z);
    guest.g.rotation.set(0, 0, 0);
    guest.g.userData.baseY = seat.local.y;
    var blob = pkBlobOf(guest.g); if (blob) blob.visible = false;
    guest.seat = seat; seat.guest = guest; guest.state = 'seated'; guest.qslot = -1;
    var qi = PK.queue.indexOf(guest); if (qi >= 0) PK.queue.splice(qi, 1);
    PK.ride.riders++;
    hudDirty = true;
    return true;
  }
  function pkUnseatGuest(guest) {
    var seat = guest.seat; if (!seat) return false;
    var w = pkSeatWorld(seat);
    scene.add(guest.g);
    guest.g.position.set(w.x, PK_PLATFORM_Y, -3.2);
    guest.g.rotation.set(0, 0, 0);
    guest.g.userData.baseY = PK_PLATFORM_Y;
    var blob = pkBlobOf(guest.g); if (blob) blob.visible = true;
    guest.seat = null; seat.guest = null;
    guest.rec.x = w.x; guest.rec.z = -3.2; guest.rec.path = [];
    guest.state = 'off'; guest.qslot = -1;
    PK.ride.riders = Math.max(0, PK.ride.riders - 1);
    hudDirty = true;
    return true;
  }
  function pkSeatsFull() {
    for (var i = 0; i < PK.seats.length; i++) if (!PK.seats[i].guest && !PK.seats[i].player) return false;
    return true;
  }
  // any guest still walking from the queue to their seat? The bars and the dispatch wait for them.
  function pkStillBoarding() {
    for (var i = 0; i < PK.guests.length; i++) if (PK.guests[i].state === 'board') return true;
    return false;
  }
  // the gates are open: invite the front of the line in, one seat each, and send them to walk to their car. They are seated
  // when they arrive (part 02), so the operator sees the crowd file in rather than blink into the train.
  function pkRideLoad() {
    if (!PK.gates[0] || !PK.gates[0].open) return 0;
    var n = 0;
    while (PK.queue.length) {
      var gu = PK.queue[0];
      if (gu.state !== 'queue') break;   // the front has not reached the line yet
      var seat = null;
      for (var i = 0; i < PK.seats.length; i++) if (!PK.seats[i].guest && !PK.seats[i].player) { seat = PK.seats[i]; break; }
      if (!seat) break;
      PK.queue.shift();
      gu.seat = seat; seat.guest = gu; gu.state = 'board';
      var car = PK.cars[seat.car];
      gu.rec.path = route({ x: gu.rec.x, z: gu.rec.z }, { x: car.position.x, z: -2.2 });
      n++;
    }
    if (n) { pkQueueReslot(); sfx('click'); hudDirty = true; }
    return n;
  }
  // ── The controls ──────────────────────────────────────────────────
  var PK_REFUSE_M = '', PK_REFUSE_T = 0;
  function pkRefuse(msg) {
    PK.refused++;
    // the same refusal twice in a row is one refusal: no toast storms when a hand comes down twice
    var now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    if (msg !== PK_REFUSE_M || now - PK_REFUSE_T > 1200) {
      sfx('bad'); toast(msg, 'bad'); PK_REFUSE_M = msg; PK_REFUSE_T = now;
    }
    return false;
  }
  function pkOpenGates() {
    var R = PK.ride;
    if (PK.closed) return pkRefuse('The park is closed');
    if (R.fault) return pkRefuse('The ride is stopped');
    if (R.state === 'dispatch' || R.state === 'running' || R.state === 'arrive') return pkRefuse('Not while the train is moving');
    PK.gates.forEach(function (gt) { gt.open = true; });
    if (R.state === 'idle' || R.state === 'unload' || R.state === 'ready') R.state = 'loading';   // with the bars down too: back to boarding
    sfx('unlock'); hudDirty = true; return true;
  }
  function pkCloseGates() {
    var R = PK.ride;
    if (R.fault) return pkRefuse('The ride is stopped');
    if (R.state === 'ready' || R.state === 'dispatch' || R.state === 'running' || R.state === 'arrive') return pkRefuse('Not while the train is moving');
    PK.gates.forEach(function (gt) { gt.open = false; });
    sfx('lock'); hudDirty = true; return true;
  }
  // one button for the gates: open to start boarding, close once the cars are full - whenever the train is in the station,
  // line or no line, bars up or down. The state decides, not the gate leaf, so after the train comes home (gates already
  // open, state unload) the next press lets the queue in.
  function pkGatesToggle() {
    var R = PK.ride;
    if (R.fault) return pkRefuse('The ride is stopped');
    if (R.state === 'idle' || R.state === 'unload') return pkOpenGates();
    if (R.state === 'loading') return pkCloseGates();
    if (R.state === 'ready') return PK.gates[0] && PK.gates[0].open ? pkCloseGates() : pkOpenGates();
    return pkRefuse('Not while the train is moving');
  }
  function pkBarsDown() {
    var R = PK.ride;
    if (R.fault) return pkRefuse('The ride is stopped');
    if (R.state !== 'loading' && R.state !== 'ready') return pkRefuse('Open the gates and load first');
    if (pkStillBoarding()) return pkRefuse('Let the riders sit first');
    R.barsWant = 1; R.state = 'ready';
    sfx('lock'); hudDirty = true; return true;
  }
  function pkBarsUp() {
    var R = PK.ride;
    if (R.fault) return pkRefuse('The ride is stopped');
    if (R.state === 'running' || R.state === 'arrive' || R.state === 'dispatch') return pkRefuse('Not while the train is moving');
    R.barsWant = 0;
    if (R.state === 'ready') R.state = 'loading';
    sfx('unlock'); hudDirty = true; return true;
  }
  function pkService() {
    if (!(S.wear || 0)) { toast('The coaster is already serviced', ''); return false; }
    if (S.bank < 150 || S.bank < 0) { sfx('bad'); toast('Not enough money to service it', 'bad'); return false; }
    pay(-150, 'Service');
    S.wear = 0;
    sfx('ok'); toast('Coaster serviced', 'good'); logEvent('Coaster serviced', 'good');
    screenDirtyAll(); hudDirty = true;
    return true;
  }
  function pkFire(which) {
    if (which === 'clerk' && !S.clerk) return 'No clerk to let go';
    if (which === 'operator' && !S.operator) return 'No operator to let go';
    if (which === 'clerk') { S.clerk = false; PK.clerk = false; }
    else if (which === 'operator') { S.operator = false; PK.operator = false; }
    else return 'nobody';
    sfx('bad'); toast('Staff let go', 'bad'); logEvent('Staff let go', '');
    screenDirtyAll(); hudDirty = true;
    return 'Let go';
  }
  function pkDispatch() {
    var R = PK.ride;
    if (PK.closed && R.riders === 0) return pkRefuse('The park is closed');
    if (R.fault) return pkRefuse('The ride is stopped');
    if (R.state !== 'ready') return pkRefuse('Restraints first, then dispatch');
    if (pkStillBoarding()) return pkRefuse('Wait for the riders to sit');
    if ((S.wear || 0) >= 90) return pkRefuse('Service the coaster before it goes again');
    // an empty dispatch is a test run: an operator may send an empty train, it just earns nothing
    var empty = R.riders === 0;
    S.wear = Math.min(100, (S.wear || 0) + 1.5);
    PK.gates.forEach(function (gt) { gt.open = false; });
    R.state = 'dispatch'; R.beat = 1.2;
    if (empty) { sfx('bell'); logEvent('Test run, empty train', ''); toast('Test run', ''); }
    else { pkXp(2); sfx('bell'); logEvent('Dispatch with ' + R.riders + ' aboard', 'good'); }
    hudDirty = true; return true;
  }
  function pkTestRun() {
    // a test run: send the empty train round from the screen, without needing the gates and the bars first
    var R = PK.ride;
    if (PK.closed) return pkRefuse('The park is closed');
    if (R.fault) return pkRefuse('The ride is stopped');
    if (R.state === 'dispatch' || R.state === 'running' || R.state === 'arrive') return pkRefuse('Not while the train is moving');
    if (R.state !== 'idle' && R.state !== 'loading' && R.state !== 'ready' && R.state !== 'unload') return pkRefuse('Not while the train is moving');
    if (PK.queue.length) return pkRefuse('Riders are waiting - dispatch them first');
    if (R.riders > 0 || pkStillBoarding()) return pkRefuse('Riders aboard - dispatch them');
    if ((S.wear || 0) >= 90) return pkRefuse('Service the coaster before it goes again');
    S.wear = Math.min(100, (S.wear || 0) + 1.5);
    PK.gates.forEach(function (gt) { gt.open = false; });
    R.barsWant = 1;
    R.state = 'dispatch'; R.beat = 1.2;
    sfx('bell'); logEvent('Test run, empty train', ''); toast('Test run', '');
    screenDirtyAll(); hudDirty = true; return true;
  }
  function pkStop() {
    var R = PK.ride;
    if (R.fault) return pkReset();
    R.fault = 'E-stop'; R.state = 'fault'; R.v = 0;
    sfx('bad'); toast('E-stop', 'bad'); logEvent('E-stop', 'bad');
    hudDirty = true; return true;
  }
  function pkReset() {
    var R = PK.ride;
    R.fault = '';
    var d = Math.abs(((R.u - PK.stationU + 1.5) % 1) - 0.5);
    R.state = d < 0.01 ? 'idle' : 'running';
    sfx('ok'); toast('Ride reset', 'good'); hudDirty = true; return true;
  }
  function pkSetAuto(on) {
    S.auto = !!on; PK.ride.autoT = 0;
    sfx('click'); toast(S.auto ? 'AUTO on' : 'AUTO off', S.auto ? 'good' : '');
    logEvent(S.auto ? 'AUTO on' : 'AUTO off', '');
    screenDirtyAll(); hudDirty = true;
    return true;
  }
  function pkArrive() {
    var R = PK.ride, n = R.riders;
    R.state = 'unload'; R.barsWant = 0; R.bars = 0;
    PK.gates.forEach(function (gt) { gt.open = true; });
    S.cycles = (S.cycles || 0) + 1;
    PK.today.rides += n;
    if (n > 0) pkXp(1);
    PK.seats.forEach(function (s) { if (s.guest) pkUnseatGuest(s.guest); });
    R.riders = 0;
    sfx('bell'); logEvent('The train is back with ' + n + ' aboard', 'good');
    screenDirtyAll(); hudDirty = true;
  }
  // ── The ride, one tick ────────────────────────────────────────────
  function pkOpSignal() {
    // the three signal lamps over the operator door and the roof beacon follow the ride,
    // exactly as the booth lamps do: green idle, amber boarding/unloading, red running or fault
    var L = PK.opLamps;
    if (!L) return;
    var st = PK.ride ? PK.ride.state : 'idle', fault = PK.ride && PK.ride.fault;
    var on = fault ? 0 : (st === 'running' ? 0 : (st === 'boarding' || st === 'loading' || st === 'ready' || st === 'unload' || st === 'dispatch' || st === 'arrive') ? 1 : 2);
    for (var i = 0; i < L.mats.length; i++) if (L.mats[i].emissive) L.mats[i].emissiveIntensity = i === on ? 1.8 : 0.12;
    if (L.beacon && L.beacon.emissive) L.beacon.emissiveIntensity = st === 'running' ? (Math.sin(performance.now() / 210) > 0 ? 1.9 : 0.25) : 0.3;
  }
  function pkRideTick(dt) {
    var R = PK.ride;
    pkOpSignal();
    // the gates and the restraints ease to where they were told to be
    PK.gates.forEach(function (gt) { gt.t += ((gt.open ? 1 : 0) - gt.t) * Math.min(1, dt * 4); gt.bar.rotation.z = gt.t * Math.PI / 2; });
    R.bars += (R.barsWant - R.bars) * Math.min(1, dt * 3);
    PK.cars.forEach(function (car) { car.userData.bars.forEach(function (b) { b.rotation.x = -1.3 * (1 - R.bars); }); });
    // the turnstiles spin as they are passed
    PK.turnstiles.forEach(function (t) {
      if (t.spin > 0) { t.spin -= dt * 3; t.arm.rotation.x += dt * 6; if (t.spin <= 0) { t.spin = 0; t.arm.rotation.x = 0; } }
    });
    if (R.fault) { R.v = 0; pkPlaceTrain(); return; }
    // the ride runs itself when AUTO is on, or when an operator is on the payroll
    if ((pkCoasterAuto() || S.operator) && !R.fault) {
      R.autoT -= dt;
      if (R.autoT <= 0) {
        R.autoT = 1.4;
        // AUTO asks before it acts, so it never trips a refusal: an empty train waits with its gates open and its bars up,
        // the bars come down once someone is aboard and seated (a full train at once, else after eight seconds of boarding),
        // and a train readied with nobody aboard is put back to boarding once, not flapped
        var walking = pkStillBoarding();
        if (R.state === 'idle' || R.state === 'unload') { if (!PK.closed) { pkOpenGates(); R.loadT = 0; } }
        else if (R.state === 'loading') { R.loadT += 1.4; if (R.riders > 0 && !walking && (pkSeatsFull() || R.loadT > 8)) pkBarsDown(); }
        else if (R.state === 'ready') {
          if (R.riders === 0) { pkBarsUp(); R.loadT = 0; }
          else if ((S.wear || 0) >= 90) { R.wearT = (R.wearT || 0) - 1.4; if (R.wearT <= 0) { R.wearT = 20; sfx('bad'); toast('The coaster needs a service - press MAINT on the desk', 'bad'); } }
          else if (!walking) pkDispatch();
        }
      }
    }
    if (R.state === 'loading') pkRideLoad();
    if (R.state === 'dispatch') {
      R.beat -= dt;
      if (R.beat <= 0) { R.state = 'running'; R.v = 2; }
    } else if (R.state === 'running') {
      var d = (PK.stationU - R.u + 1) % 1;
      if (R.u > 0.5 && d < 0.25) R.state = 'arrive';
      else { R.v = pkSpeedAt(R.u); R.u = (R.u + R.v * dt / PK.len) % 1; }
    } else if (R.state === 'arrive') {
      var d2 = (PK.stationU - R.u + 1) % 1;
      R.v = Math.max(1.0, Math.min(R.v, Math.sqrt(2 * 4 * d2 * PK.len)));
      R.u = (R.u + R.v * dt / PK.len) % 1;
      if (d2 * PK.len < 0.4) { R.u = PK.stationU; R.v = 0; pkArrive(); }
    }
    pkPlaceTrain();
  }
  // ── Staff ─────────────────────────────────────────────────────────
  function pkHire(which) {
    if (which !== 'clerk' && which !== 'operator') return 'No such role';
    var cost = which === 'clerk' ? 400 : 600;
    if (which === 'clerk' && S.clerk) return 'A clerk already works the window';
    if (which === 'operator' && S.operator) return 'An operator already runs the ride';
    if (S.bank < cost || S.bank < 0) { sfx('bad'); toast('Not enough money', 'bad'); return 'Not enough money'; }
    pay(-cost, which === 'clerk' ? 'Ticket clerk' : 'Ride operator');
    if (which === 'clerk') { S.clerk = true; PK.clerk = true; }
    else { S.operator = true; PK.operator = true; }
    sfx('cash'); logEvent((which === 'clerk' ? 'Ticket clerk' : 'Ride operator') + ' hired', 'good');
    screenDirtyAll(); hudDirty = true;
    return 'Hired';
  }
