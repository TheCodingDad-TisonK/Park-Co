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
    var X0 = 11, X1 = 17, Z0 = -4, Z1 = 2, H = 3.2;
    var M = pkMats(), plaster = pkMatPlasterRich(), oak = pkMatWoodRich(), stone = pkMatStone();
    var paint = std({ color: 0xece5d7, roughness: 0.94, emissive: 0x3a352c, emissiveIntensity: 0.42 });        // the walls, painted cream
    var wains = std({ color: 0x3d5b49, roughness: 0.62, metalness: 0.04, emissive: 0x1b2a20, emissiveIntensity: 0.5 });   // the wainscot, park green
    var red = std({ color: 0xa8402c, roughness: 0.62 });          // the coaster's own red
    var iron = MAT.steelDark, brass = pkMatMetalRich();
    var steel = std({ color: 0x39434a, roughness: 0.45, metalness: 0.45 });      // the booth's steel
    var darkSill = std({ color: 0x20272c, roughness: 0.62, metalness: 0.30 });   // the anti-bandit sill
    var hzDark = std({ color: 0x111417, roughness: 0.7 }), hzGold = std({ color: 0xc9a227, roughness: 0.7 });
    // ── the shell: cream bays + coaster-red trim, striped tented canopy.
    // Window/door openings + all interior (desk, console, screen) stay
    // exactly as they were — only the exterior skin is rebuilt.
    // the west wall, with a window onto the platform
    // the west wall, with a window onto the platform
    box(0.2, H, 1, plaster, X0, H / 2, -3.5);
    box(0.2, H, 3, plaster, X0, H / 2, 0.5);
    box(0.2, 1.0, 2, plaster, X0, 0.5, -2);
    box(0.2, 1.0, 2, plaster, X0, 2.7, -2);
    box(0.2, H, 6, plaster, X1, H / 2, -1);
    box(6, H, 0.2, plaster, 14, H / 2, Z0);
    // the south wall: cream bays each side of the door, red trim band,
    // sill wall and header band (openings unchanged)
    [[11.96, 1.92], [15.64, 2.72]].forEach(function (bay) {
      var bx = bay[0], bw = bay[1], half = bw / 2, panes = bw > 2.2 ? 3 : 2;
      box(bw, 0.65, 0.2, paint, bx, 0.945, Z1);
      box(bw, 0.18, 0.22, red, bx, 0.72, Z1);
      box(bw + 0.06, 0.06, 0.28, MAT.steelDark, bx, 1.27, Z1);
      for (var hz2 = 0, hzN = Math.floor((bw - 0.2) / 0.18); hz2 < hzN; hz2++) {
        box(0.08, 0.10, 0.02, hz2 % 2 ? hzGold : hzDark, bx - half + 0.10 + hz2 * 0.18, 0.72, Z1 + 0.105);
      }
      var lw = Math.min(1.5, bw - 0.9);
      for (var lv2 = 0; lv2 < 5; lv2++) box(lw, 0.035, 0.03, iron, bx + half - lw / 2 - 0.15, 0.86 + lv2 * 0.075, Z1 + 0.105);
      box(bw, 0.93, 0.2, plaster, bx, 2.735, Z1);                        // the solid plaster header, as on the booths
      box(bw - 0.10, 1.0, 0.035, M.glass, bx, 1.77, Z1);                 // the same metre of glass, booth band height
      [bx - half + 0.03, bx + half - 0.03].forEach(function (vx) { box(0.08, 1.06, 0.09, MAT.steelDark, vx, 1.77, Z1 + 0.005); });
      for (var pm = 1; pm < panes; pm++) box(0.06, 1.0, 0.075, MAT.steelDark, bx - half + (bw / panes) * pm, 1.77, Z1 + 0.01);
      box(bw, 0.07, 0.09, MAT.steelDark, bx, 2.31, Z1 + 0.005);
      box(bw, 0.07, 0.09, MAT.steelDark, bx, 1.27, Z1 + 0.005);
    });
    box(1.2, 1.05, 0.2, paint, 13.6, 2.675, Z1);
    // striped tented canopy in coaster red/cream, shared booth recipe.
    // wallTop (3.2) clears the fascia sign (top 2.85) + lamps (2.98);
    // the valance hangs to ~2.86 in front of them (z 2.42 vs sign 2.13).
    var opRoofG = new THREE.Group(); opRoofG.position.set(14, 0, -1); scene.add(opRoofG);
    var opRoof = pkBoothTentRoof(opRoofG, { w: 6, d: 6, wallTop: H, roofA: '#a8402c', roofB: '#f3ead6', trimMat: red, roofH: 1.35 });
    solid(X0 - 0.1, X0 + 0.1, Z0, Z1, 0, H);
    solid(X1 - 0.1, X1 + 0.1, Z0, Z1, 0, H);
    solid(X0, X1, Z0 - 0.1, Z0 + 0.1, 0, H);
    solid(X0, 13, Z1 - 0.1, Z1 + 0.1, 0, H);
    solid(14.2, X1, Z1 - 0.1, Z1 + 0.1, 0, H);
    // the outside: the booth language — perimeter plinth strips (not a
    // filled slab), steel corner posts, red-trimmed sill
    var opPlinthG = new THREE.Group(); opPlinthG.position.set(14, 0, -1); scene.add(opPlinthG);
    pkBoothPlinth(6, 6, stone, opPlinthG);
    [[X0, Z0], [X0, Z1], [X1, Z0], [X1, Z1]].forEach(function (c) {
      box(0.14, H, 0.20, steel, c[0], H / 2, c[1]);
      box(0.22, 0.09, 0.28, steel, c[0], H - 0.05, c[1]);
    });
    // eave plant: the old deck AC pack tucks under the tented eave on the
    // west side, with the beacon on its own mast clear of the valance;
    // a vent stack stays at the back corner
    box(1.30, 0.52, 0.95, MAT.steel, 11.45, 2.85, 1.55);
    for (var ac2 = 0; ac2 < 5; ac2++) box(0.92, 0.03, 0.02, MAT.steelDark, 11.45, 2.71 + ac2 * 0.075, 2.05);
    cyl(0.30, 0.04, MAT.black, 11.45, 3.12, 1.55, null, 16);
    cyl(0.26, 0.02, pkMats().iron, 11.45, 3.14, 1.55, null, 16);
    // beacon on its own mast at the eave corner, clear of the valance
    pkRoundCyl(0.04, 0.30, MAT.steelDark, 16.6, 3.10, 2.15, null, 8);
    var beacon = sphere(0.11, glowMat(0xff3b30, 0.4), 16.6, 3.32, 2.15);
    pkRoundCyl(0.07, 0.62, MAT.steel, 16.10, 3.65, -3.35, null, 10);
    var cap = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.16, 10), MAT.steelDark); cap.position.set(16.10, 4.01, -3.35); scene.add(cap);
    // the east wall: ribbed steel and a louvered plant grille
    for (var er = 0; er < 8; er++) box(0.05, 1.86, 0.045, MAT.steelDark, 17.12, 1.55, -3.7 + er * 0.72);
    for (var lv = 0; lv < 7; lv++) box(0.04, 0.05, 0.80, MAT.steelDark, 17.13, 1.85 + lv * 0.11, -1.55);
    // the door: red-trimmed jambs, an open cream service door with a wired
    // pane, lanterns each side, planters flanking the approach
    [[12.94, 2.06], [14.26, 2.06]].forEach(function (c) { box(0.12, 2.2, 0.13, red, c[0], 1.1, c[1]); });
    box(1.44, 0.12, 0.13, red, 13.6, 2.21, 2.06);
    var leafG = new THREE.Group(); leafG.position.set(13.02, 0, 1.92); leafG.rotation.y = 1.34; scene.add(leafG);
    box(1.08, 2.10, 0.065, paint, 0.54, 1.05, 0, leafG);
    box(0.50, 0.56, 0.02, M.glass, 0.54, 1.56, 0.043, leafG);
    box(0.98, 0.24, 0.02, MAT.hazard, 0.54, 0.20, 0.043, leafG);
    box(0.72, 0.05, 0.04, MAT.chrome, 0.54, 1.02, 0.055, leafG);
    box(1.28, 0.03, 0.62, MAT.steelDark, 13.6, 0.05, 2.32);
    for (var hz = 0; hz < 6; hz++) box(0.20, 0.012, 0.05, MAT.hazard, 13.05 + hz * 0.22, 0.066, 2.32);
    // the fascia board over the door (below the eave, clears the valance)
    // and the three signal lamps tucked under the eave
    pkSign3D(['PARK CO · RIDE CONTROL', 'THE COASTER'], 2.1, 0.34, 13.6, 2.62, 2.13, 0, { bg: '#1b232c', fg: '#f5b53d' });
    box(0.66, 0.20, 0.12, red, 13.6, 2.94, 2.14);
    var opLampM = [0xff3b30, 0xf0c04a, 0x5fd38d].map(function (col) { return glowMat(col, 0.3); });
    var opLamps = [0, 1, 2].map(function (i2) { return sphere(0.055, opLampM[i2], 13.42 + i2 * 0.18, 2.94, 2.21); });
    PK.opLamps = { mats: opLampM, beacon: beacon.material };
    // lanterns flanking the door + planters on the forecourt (world coords)
    pkBoothLantern(opPlantG, -1.28, 2.10, 3.14);
    pkBoothLantern(opPlantG, 0.48, 2.10, 3.14);
    var opPlantG = new THREE.Group(); opPlantG.position.set(14, 0, -1); scene.add(opPlantG);
    pkPlanter(1.8, opPlantG, -2.2, 0, 3.9);
    pkPlanter(1.8, opPlantG, 2.2, 0, 3.9);
    // the tented eave shelters the door, as on every booth
    // the platform side: a canopy over the window, the fascia board, and the pane untouched
    box(1.15, 0.10, 2.55, MAT.steelDark, 10.42, 2.88, -2);
    box(1.18, 0.06, 0.07, MAT.chrome, 9.87, 2.92, -2);
    [[-3.30], [-0.70]].forEach(function (c) { pkRod(11.0, 3.06, c[0], 9.92, 2.92, c[0], 0.018, MAT.steelDark, null, 6); });
    pkSign3D(['PARK CO · RIDE CONTROL', 'THE COASTER'], 2.05, 0.36, 10.93, 2.58, -2, -Math.PI / 2, { bg: '#1b232c', fg: '#f5b53d' });
    // the forecourt: a paved way from the door to the fountain, so the booth is entered, not marooned
    pkPaved(2.6, 6.6, pkMats().paversWarm, 13.6, 0.045, 5.2, 0);
    // ── inside ──
    pkPaved(5.72, 5.72, MAT.tile, 14, 0.043, -1, 1.1);              // a tiled floor
    box(5.76, 0.06, 5.76, paint, 14, 3.15, -1);                     // the ceiling
    // wainscot round the room, with an oak chair rail on top
    box(5.6, 0.98, 0.05, wains, 14, 0.49, -3.87); box(5.62, 0.07, 0.09, oak, 14, 1.0, -3.86);
    box(5.6, 0.98, 0.05, wains, 16.87, 0.49, -1); box(5.62, 0.07, 0.09, oak, 16.86, 1.0, -1);
    [[11.1, 2.98], [11.1, -0.98]].forEach(function (c) { box(0.05, 0.98, 2.0, wains, 11.13, 0.49, c[1]); box(0.09, 0.07, 2.02, oak, 11.14, 1.0, c[1]); });
    [[12.05, 1.0], [15.5, 1.6]].forEach(function (c) { box(c[1], 0.98, 0.05, wains, c[0], 0.49, 1.87); box(c[1] + 0.02, 0.07, 0.09, oak, c[0], 1.0, 1.86); });
    // a skirting board all the way round
    [[14, -3.9, 5.7, 0.06], [14, 1.9, 5.7, 0.06]].forEach(function (w) { box(w[2], 0.12, w[3], oak, w[0], 0.06, w[1]); });
    [[11.12, -1], [16.88, -1]].forEach(function (w) { box(0.06, 0.12, 5.7, oak, w[0], 0.06, w[1]); });
    // two ceiling lights, which go dark with the power like every other lamp
    troffer(13, 3.11, -2.3, 1.15, 0.5);
    troffer(15.2, 3.11, 0.3, 1.15, 0.5);
    // the desk along the west wall, facing the platform: an oak top on a steel frame with a drawer pedestal
    box(0.86, 0.06, 3.1, oak, 12.4, 0.98, -2.2);
    box(0.86, 0.06, 3.1, red, 12.4, 0.94, -2.2);
    [[-3.66], [-0.74]].forEach(function (z) { box(0.08, 0.9, 0.08, iron, 12.82, 0.45, z[0]); box(0.08, 0.9, 0.08, iron, 12.05, 0.45, z[0]); });
    box(0.06, 0.86, 2.9, paint, 12.83, 0.45, -2.2);
    box(0.62, 0.6, 0.62, iron, 12.5, 0.3, -1.02);
    [0.44, 0.24, 0.04].forEach(function (y) { box(0.5, 0.02, 0.03, brass, 12.5, y + 0.14, -0.7); });
    solid(12.0, 12.8, -3.7, -0.7, 0, 1.0);
    // the monitor, turned to the operator's chair
    box(0.08, 0.34, 0.06, iron, 12.44, 1.24, -2.86);
    box(0.06, 0.16, 0.22, iron, 12.44, 1.06, -2.86);
    var mon = box(0.05, 0.5, 0.72, MAT.black, 12.4, 1.42, -2.86); mon.rotation.z = 0.02;
    box(0.01, 0.44, 0.66, glowMat(0x8fb6d8, 0.5), 12.37, 1.42, -2.86);
    // desk clutter: keyboard, mouse, papers, a mug, a radio and a lamp
    box(0.16, 0.025, 0.44, MAT.plastic, 12.62, 1.02, -2.2);
    box(0.06, 0.03, 0.1, MAT.plastic, 12.66, 1.02, -1.9);
    var paper = box(0.3, 0.008, 0.4, MAT.paper, 12.6, 1.02, -1.5); paper.rotation.y = 0.18;
    box(0.3, 0.008, 0.4, MAT.paper, 12.55, 1.03, -1.46);
    cyl(0.05, 0.11, std({ color: 0xf2efe6, roughness: 0.5 }), 12.62, 1.07, -0.86, null, 12);
    box(0.18, 0.12, 0.1, MAT.plastic, 12.44, 1.08, -3.34);
    box(0.14, 0.05, 0.02, brass, 12.5, 1.1, -3.34);
    cyl(0.09, 0.03, iron, 12.32, 1.03, -0.98, null, 12);
    pkRod(12.32, 1.03, -0.98, 12.34, 1.44, -0.94, 0.02, brass, null, 6);
    var shade = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.16, 14, 1, true), std({ color: 0x2c4739, roughness: 0.5, side: THREE.DoubleSide }));
    shade.position.set(12.34, 1.46, -0.94); scene.add(shade);
    sphere(0.055, glowMat(0xfff0c8, 1.1), 12.34, 1.4, -0.94);
    // the operator's chair, at the console on the north wall
    var seatMat = std({ color: 0x1f2a33, roughness: 0.85 });
    box(0.5, 0.09, 0.5, seatMat, 14.3, 0.47, -2.55);
    box(0.5, 0.52, 0.09, seatMat, 14.3, 0.74, -2.30);
    box(0.44, 0.06, 0.06, seatMat, 14.3, 0.97, -2.30);
    cyl(0.045, 0.42, iron, 14.3, 0.23, -2.55, null, 8);
    for (var ca = 0; ca < 5; ca++) {
      var an = ca / 5 * Math.PI * 2;
      var arm = box(0.05, 0.04, 0.34, iron, 14.3 + Math.sin(an) * 0.16, 0.06, -2.55 + Math.cos(an) * 0.16);
      arm.rotation.y = an;
    }
    // the control desk, and the status screen above it
    pkBuildCoasterConsole();
    // the north wall: the control screen in a steel bezel, a notice board and a clock
    box(1.08, 0.96, 0.06, iron, 14, 2.02, -3.93);
    box(0.98, 0.86, 0.03, MAT.black, 14, 2.02, -3.9);
    box(1.2, 0.72, 0.05, MAT.cork, 12.3, 1.95, -3.88);
    box(1.24, 0.06, 0.08, oak, 12.3, 2.34, -3.87);
    box(1.24, 0.06, 0.08, oak, 12.3, 1.56, -3.87);
    [[-0.36, 0.14, 0.3, 0.24], [0.02, -0.06, 0.34, 0.2], [0.32, 0.1, 0.22, 0.3]].forEach(function (p) {
      var pn = box(p[2], p[3], 0.01, MAT.paper, 12.3 + p[0], 1.95 + p[1], -3.85); pn.rotation.z = randf(-0.06, 0.06);
    });
    var clock = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 20), std({ color: 0xf4f1e8, roughness: 0.6 }));
    clock.position.set(15.7, 2.5, -3.87); clock.rotation.x = Math.PI / 2; scene.add(clock);
    cyl(0.19, 0.04, iron, 15.7, 2.5, -3.9, null, 20).rotation.x = Math.PI / 2;
    box(0.02, 0.11, 0.012, MAT.black, 15.7, 2.55, -3.84);
    box(0.08, 0.02, 0.012, MAT.black, 15.74, 2.5, -3.84);
    // the east wall: a framed safety notice, a first-aid box and the key cabinet by the door
    box(0.9, 0.62, 0.05, oak, 16.87, 1.95, -2.6);
    box(0.78, 0.5, 0.01, std({ color: 0xf2efe6, roughness: 0.85 }), 16.84, 1.95, -2.6);
    box(0.6, 0.34, 0.03, std({ color: 0xb8452f, roughness: 0.7 }), 16.83, 2.0, -2.6);
    box(0.34, 0.4, 0.12, std({ color: 0xf4f4f0, roughness: 0.6 }), 16.84, 1.5, -1.4);
    box(0.12, 0.05, 0.13, std({ color: 0x2f9e44, roughness: 0.6 }), 16.84, 1.68, -1.4);
    box(0.5, 0.66, 0.12, oak, 15.35, 1.6, 1.87);
    box(0.42, 0.58, 0.02, MAT.steelDark, 15.35, 1.6, 1.8);
    for (var kk = 0; kk < 6; kk++) box(0.03, 0.09, 0.01, brass, 15.2 + (kk % 3) * 0.14, 1.78 - Math.floor(kk / 3) * 0.16, 1.79);
    // the fire extinguisher by the door, and a hi-vis on a hook
    cyl(0.075, 0.46, red, 16.5, 0.62, 1.6, null, 12);
    cyl(0.03, 0.1, MAT.black, 16.5, 0.9, 1.6, null, 8);
    box(0.14, 0.05, 0.05, MAT.black, 16.5, 0.86, 1.53);
    box(0.06, 0.1, 0.06, iron, 16.86, 1.62, 1.48);
    var vest = box(0.03, 0.52, 0.36, MAT.hivis, 16.84, 1.32, 1.48); vest.rotation.z = 0.02;
    // a bin in the corner
    cyl(0.15, 0.42, iron, 16.4, 0.21, -3.5, null, 12);
    // the screen on the north wall: a status board that reports, while the desk does the work
    PK.screen = touchScreen({
      w: 420, h: 380, pw: 0.9, ph: 0.78, x: 14, y: 2.02, z: Z0 + 0.12, parent: null, title: 'Ride control',
      draw: function (ctx, s) {
        var R = PK.ride;
        scBg(ctx, s.w, s.h); scHead(ctx, s.w, 'RIDE CONTROL', pkRideWord());
        // the state, large, because it is the one thing you look up at
        var live = R.fault ? 'STOPPED' : R.state === 'running' ? 'ON TRACK' : R.state === 'dispatch' ? 'DISPATCHING' : R.state === 'ready' ? 'READY TO SEND' : R.state === 'unloading' ? 'UNLOADING' : 'AT THE STATION';
        var col = R.fault ? '#ff6b5e' : R.state === 'running' ? '#5fd38d' : '#f5b53d';
        ctx.fillStyle = col; ctx.font = 'bold 42px ' + SCREEN_THEME.font; ctx.textAlign = 'left'; ctx.fillText(live, 16, 92);
        ctx.textAlign = 'right'; ctx.fillStyle = '#a0acb8'; ctx.font = '16px ' + SCREEN_THEME.font;
        ctx.fillText((R.v || 0).toFixed(1) + ' m/s', s.w - 16, 92);
        ctx.textAlign = 'left';
        // the train, car by car: filled seats are riders
        var cars = 3, per = Math.ceil(PK.seats.length / cars), st = Math.round(R.u * PK.seats.length);
        for (var c = 0; c < cars; c++) {
          var x0 = 16 + c * 132, y0 = 112;
          ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(x0, y0, 120, 46);
          for (var q = 0; q < per; q++) {
            var filled = ((c * per + q) < R.riders);
            ctx.fillStyle = filled ? '#5fd38d' : 'rgba(255,255,255,0.18)';
            ctx.fillRect(x0 + 8 + q * 18, y0 + 10, 13, 26);
          }
          ctx.fillStyle = '#7d8a96'; ctx.font = '12px ' + SCREEN_THEME.font;
          ctx.fillText('CAR ' + (c + 1), x0 + 4, y0 + 44);
        }
        // the line of state, row by row
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
    if (R.state === 'ready' || R.state === 'dispatch' || R.state === 'running' || R.state === 'arrive') return pkRefuse('Not while the train is moving');
    PK.gates.forEach(function (gt) { gt.open = true; });
    if (R.state === 'idle' || R.state === 'unload') R.state = 'loading';
    sfx('unlock'); hudDirty = true; return true;
  }
  function pkCloseGates() {
    var R = PK.ride;
    if (R.fault) return pkRefuse('The ride is stopped');
    if (R.state === 'ready' || R.state === 'dispatch' || R.state === 'running' || R.state === 'arrive') return pkRefuse('Not while the train is moving');
    PK.gates.forEach(function (gt) { gt.open = false; });
    sfx('lock'); hudDirty = true; return true;
  }
  // one button for the gates: open to start boarding, close once the cars are full. The state decides, not the gate leaf,
  // so after the train comes home (gates already open, state unload) the next press lets the queue in.
  function pkGatesToggle() {
    var R = PK.ride;
    if (R.fault) return pkRefuse('The ride is stopped');
    if (R.state === 'idle' || R.state === 'unload') return pkOpenGates();
    if (R.state === 'loading') return pkCloseGates();
    return pkRefuse(R.state === 'ready' ? 'The restraints are down' : 'Not while the train is moving');
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
        if (R.state === 'idle' || R.state === 'unload') { pkOpenGates(); R.loadT = 0; }
        else if (R.state === 'loading') { R.loadT += 1.4; if (pkSeatsFull() || R.loadT > 8) pkBarsDown(); }
        else if (R.state === 'ready') { if (R.riders === 0) { pkBarsUp(); pkOpenGates(); } else pkDispatch(); }
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
