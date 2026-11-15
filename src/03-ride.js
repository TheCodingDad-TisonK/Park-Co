//@ Park Co, part 03: the coaster - the track, the train, the station, the operator's room and the snack stand
  // ── The coaster ───────────────────────────────────────────────────
  // A looping coaster that fills its yard behind the station (x -24..30.5, z -37..-1.5). Out of the station east, round the
  // control room and up a 20 m chain lift along the east side; over the top turning west, a vertical dive along the north lane;
  // a rising 540 degree helix at the west end; a long run east, down and under the lift into a teardrop loop (13 m, gentle at the
  // foot, tight at the top); a high turn at the east fence; back west under the lift, a dip into a corkscrew; a trim brake, a
  // turn inside the helix, south and the brakes home. The train is three cars of four seats. The operator's room stands east
  // of the platform.
  var PK_CAR_N = 6;
  // the four seats of a car, in the order they fill: the platform side first, then the far side, front row before back
  var PK_SEAT_LOCAL = [[-0.35, 0.62], [-0.35, -0.62], [0.35, 0.62], [0.35, -0.62]];
  var PK_CAR_COLS = [0xd94f4f, 0xf0c04a, 0x4f8fd9];
  // the circuit, laid offline from straights, arcs, the loop and the corkscrew with a height profile of vertical arcs and
  // sampled every 1.2 m along the track (the same kit as the indoor halls; tools/scratch/tracks/main.js). The station straight
  // runs x -11..9.5 at z -4.6, dead level; the train runs +x along it. Checked clear of itself (2.1 m at the closest), of the
  // platform and the control room, inside the yard, and at most 5.0 g at the speeds pkCoProfile gives it, with the trim
  // brake after the corkscrew (PK_MAIN_TRIM).
  var PK_TRACK_PTS = [
    [-11, 0.6, -4.6], [-9.79, 0.6, -4.6], [-8.59, 0.6, -4.6], [-7.38, 0.6, -4.6], [-6.18, 0.6, -4.6], [-4.97, 0.6, -4.6],
    [-3.76, 0.6, -4.6], [-2.56, 0.6, -4.6], [-1.35, 0.6, -4.6], [-0.15, 0.6, -4.6], [1.06, 0.6, -4.6], [2.26, 0.6, -4.6],
    [3.47, 0.6, -4.6], [4.68, 0.6, -4.6], [5.88, 0.6, -4.6], [7.09, 0.6, -4.6], [8.29, 0.6, -4.6], [9.5, 0.6, -4.6],
    [10.72, 0.67, -4.71], [11.89, 0.84, -5.02], [13, 1.09, -5.54], [14, 1.39, -6.24], [14.86, 1.71, -7.1], [15.56, 2.01, -8.1],
    [16.08, 2.26, -9.21], [16.39, 2.43, -10.38], [16.5, 2.5, -11.6], [16.5, 2.91, -12.77], [16.5, 4.08, -13.94], [16.5, 5.45, -15.11],
    [16.5, 6.81, -16.29], [16.5, 8.17, -17.46], [16.5, 9.54, -18.63], [16.5, 10.9, -19.8], [16.5, 12.26, -20.97], [16.5, 13.63, -22.14],
    [16.5, 14.99, -23.31], [16.5, 16.35, -24.49], [16.5, 17.72, -25.66], [16.5, 18.89, -26.83], [16.5, 19.3, -28], [16.36, 19.3, -29.22],
    [15.96, 19.3, -30.39], [15.3, 19.3, -31.43], [14.43, 19.3, -32.3], [13.39, 19.3, -32.96], [12.22, 19.3, -33.36], [11, 19.3, -33.5],
    [10.09, 19.18, -33.5], [9.25, 18.83, -33.5], [8.53, 18.27, -33.5], [7.97, 17.55, -33.5], [7.62, 16.71, -33.5], [7.5, 15.8, -33.5],
    [7.5, 14.66, -33.5], [7.5, 13.52, -33.5], [7.5, 12.38, -33.5], [7.5, 11.24, -33.5], [7.5, 10.1, -33.5], [7.41, 8.89, -33.5],
    [7.16, 7.71, -33.5], [6.73, 6.57, -33.5], [6.15, 5.5, -33.5], [5.42, 4.53, -33.5], [4.57, 3.68, -33.5], [3.6, 2.95, -33.5],
    [2.53, 2.37, -33.5], [1.39, 1.94, -33.5], [0.21, 1.69, -33.5], [-1, 1.6, -33.5], [-2.23, 1.68, -33.5], [-3.45, 1.9, -33.5],
    [-4.68, 2.22, -33.5], [-5.91, 2.62, -33.5], [-7.14, 3.07, -33.5], [-8.36, 3.53, -33.5], [-9.59, 3.98, -33.5], [-10.82, 4.38, -33.5],
    [-12.05, 4.7, -33.5], [-13.27, 4.92, -33.5], [-14.5, 5, -33.5], [-15.69, 5, -33.41], [-16.86, 5.01, -33.14], [-17.97, 5.03, -32.71],
    [-19.01, 5.05, -32.11], [-19.94, 5.07, -31.36], [-20.75, 5.1, -30.49], [-21.43, 5.14, -29.5], [-21.95, 5.18, -28.42], [-22.3, 5.22, -27.28],
    [-22.48, 5.27, -26.1], [-22.48, 5.32, -24.9], [-22.3, 5.38, -23.72], [-21.95, 5.44, -22.58], [-21.43, 5.5, -21.5], [-20.75, 5.57, -20.51],
    [-19.94, 5.64, -19.64], [-19.01, 5.72, -18.89], [-17.97, 5.79, -18.29], [-16.86, 5.87, -17.86], [-15.69, 5.95, -17.59], [-14.5, 6.04, -17.5],
    [-13.31, 6.12, -17.59], [-12.14, 6.21, -17.86], [-11.03, 6.3, -18.29], [-9.99, 6.39, -18.89], [-9.06, 6.48, -19.64], [-8.25, 6.57, -20.51],
    [-7.57, 6.67, -21.5], [-7.05, 6.76, -22.58], [-6.7, 6.86, -23.72], [-6.52, 6.95, -24.9], [-6.52, 7.05, -26.1], [-6.7, 7.14, -27.28],
    [-7.05, 7.24, -28.42], [-7.57, 7.33, -29.5], [-8.25, 7.43, -30.49], [-9.06, 7.52, -31.36], [-9.99, 7.61, -32.11], [-11.03, 7.7, -32.71],
    [-12.14, 7.79, -33.14], [-13.31, 7.88, -33.41], [-14.5, 7.96, -33.5], [-15.69, 8.05, -33.41], [-16.86, 8.13, -33.14], [-17.97, 8.21, -32.71],
    [-19.01, 8.28, -32.11], [-19.94, 8.36, -31.36], [-20.75, 8.43, -30.49], [-21.43, 8.5, -29.5], [-21.95, 8.56, -28.42], [-22.3, 8.62, -27.28],
    [-22.48, 8.68, -26.1], [-22.48, 8.73, -24.9], [-22.3, 8.78, -23.72], [-21.95, 8.82, -22.58], [-21.43, 8.86, -21.5], [-20.75, 8.9, -20.51],
    [-19.94, 8.93, -19.64], [-19.01, 8.95, -18.89], [-17.97, 8.97, -18.29], [-16.86, 8.99, -17.86], [-15.69, 9, -17.59], [-14.5, 9, -17.5],
    [-13.3, 8.92, -17.5], [-12.1, 8.71, -17.5], [-10.9, 8.38, -17.5], [-9.7, 7.95, -17.5], [-8.5, 7.44, -17.5], [-7.3, 6.89, -17.5],
    [-6.1, 6.3, -17.5], [-4.9, 5.7, -17.5], [-3.7, 5.11, -17.5], [-2.5, 4.56, -17.5], [-1.3, 4.05, -17.5], [-0.1, 3.62, -17.5],
    [1.1, 3.29, -17.5], [2.3, 3.08, -17.5], [3.5, 3, -17.5], [4.72, 3.09, -17.63], [5.91, 3.37, -17.75], [7.03, 3.85, -17.88],
    [8.05, 4.52, -18], [8.91, 5.38, -18.13], [9.58, 6.4, -18.26], [10.01, 7.54, -18.38], [10.16, 8.75, -18.51], [10, 9.96, -18.63],
    [9.54, 11.09, -18.76], [8.79, 12.05, -18.89], [7.79, 12.75, -19.01], [6.63, 13.13, -19.14], [5.42, 13.13, -19.26], [4.26, 12.75, -19.39],
    [3.27, 12.05, -19.51], [2.51, 11.09, -19.64], [2.05, 9.96, -19.77], [1.89, 8.75, -19.89], [2.04, 7.54, -20.02], [2.47, 6.4, -20.14],
    [3.14, 5.38, -20.27], [4, 4.52, -20.4], [5.02, 3.85, -20.52], [6.14, 3.37, -20.65], [7.33, 3.09, -20.77], [8.55, 3, -20.9],
    [9.74, 3.09, -20.9], [10.92, 3.35, -20.9], [12.1, 3.74, -20.9], [13.29, 4.24, -20.9], [14.47, 4.81, -20.9], [15.66, 5.43, -20.9],
    [16.84, 6.07, -20.9], [18.03, 6.69, -20.9], [19.21, 7.26, -20.9], [20.4, 7.76, -20.9], [21.58, 8.15, -20.9], [22.77, 8.41, -20.9],
    [23.95, 8.5, -20.9], [25.13, 8.51, -21.07], [26.22, 8.54, -21.57], [27.13, 8.59, -22.35], [27.77, 8.65, -23.36], [28.11, 8.72, -24.5],
    [28.11, 8.78, -25.7], [27.77, 8.85, -26.84], [27.13, 8.91, -27.85], [26.22, 8.96, -28.63], [25.13, 8.99, -29.13], [23.95, 9, -29.3],
    [22.72, 8.91, -29.3], [21.49, 8.67, -29.3], [20.26, 8.3, -29.3], [19.03, 7.83, -29.3], [17.8, 7.28, -29.3], [16.57, 6.7, -29.3],
    [15.34, 6.1, -29.3], [14.1, 5.52, -29.3], [12.87, 4.97, -29.3], [11.64, 4.5, -29.3], [10.41, 4.13, -29.3], [9.18, 3.89, -29.3],
    [7.95, 3.8, -29.3], [7.06, 3.8, -29.4], [6.16, 3.84, -29.69], [5.27, 3.97, -30.12], [4.37, 4.29, -30.62], [3.48, 4.85, -31.06],
    [2.58, 5.63, -31.29], [1.69, 6.5, -31.17], [0.79, 7.28, -30.65], [-0.1, 7.74, -29.79], [-1, 7.74, -28.81], [-1.89, 7.28, -27.95],
    [-2.79, 6.5, -27.43], [-3.68, 5.63, -27.31], [-4.58, 4.85, -27.54], [-5.47, 4.29, -27.98], [-6.36, 3.97, -28.48], [-7.26, 3.84, -28.91],
    [-8.15, 3.8, -29.2], [-9.05, 3.8, -29.3], [-10.16, 3.52, -29.3], [-11.27, 2.9, -29.3], [-12.39, 2.28, -29.3], [-13.5, 2, -29.3],
    [-14.58, 1.92, -29.13], [-15.56, 1.72, -28.63], [-16.33, 1.48, -27.86], [-16.83, 1.28, -26.88], [-17, 1.2, -25.8], [-17, 1.19, -24.63],
    [-17, 1.16, -23.46], [-17, 1.12, -22.29], [-17, 1.06, -21.12], [-17, 1, -19.95], [-17, 0.93, -18.78], [-17, 0.87, -17.62],
    [-17, 0.8, -16.45], [-17, 0.74, -15.28], [-17, 0.68, -14.11], [-17, 0.64, -12.94], [-17, 0.61, -11.77], [-17, 0.6, -10.6],
    [-16.88, 0.6, -9.43], [-16.54, 0.6, -8.3], [-15.99, 0.6, -7.27], [-15.24, 0.6, -6.36], [-14.33, 0.6, -5.61], [-13.3, 0.6, -5.06],
    [-12.17, 0.6, -4.72]
  ];
  var PK_MAIN_TRIM = [[-9, -29.3], [-13.4, -29.3], 6];     // the trim brake: from, to (x, z), and the speed it trims to (m/s)
  function pkMainOpt() {
    var t = PK_MAIN_TRIM;
    return { lift: PK.liftU, trim: [[pkCoUAt(PK.curve, t[0][0], t[0][1]), pkCoUAt(PK.curve, t[1][0], t[1][1]), t[2]]] };
  }
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
    PK.curve = pkCoCurve(PK_TRACK_PTS);
    PK.len = PK.curve.getLength();
    // the train travels +x along the station, so the front car sits at the highest x: aim the front car at x 5.6, so six cars stand on the 20 m platform
    PK.stationU = pkNearestU(5.6, PK_PLATFORM_Y, PK_STATION_Z);
    PK.stationX0 = PK.curve.getPointAt(PK.stationU).x;
    PK.ride.u = PK.stationU;
    // the lift is the sustained climb to the lap's highest point, found from the track as for the kit coasters
    var P0 = pkCoProfile(PK.curve, PK.len, PK.stationU);
    PK.liftU = [(PK.stationU + P0.lift[0] / P0.K) % 1, (PK.stationU + P0.lift[1] / P0.K) % 1];
    PK.prof = pkCoProfile(PK.curve, PK.len, PK.stationU, pkMainOpt());
    // the frames bank the turns by speed and carry the train through the loop and the corkscrew; the station stays level
    PK.F = pkCoFrames(PK.curve, 1000, PK.prof, PK.stationU, { roll: [[pkCoUAt(PK.curve, 8, -29.3), pkCoUAt(PK.curve, -9, -29.3)]] });   // the corkscrew
    pkCoLevel(PK.F, PK.curve, PK.stationU, PK.carGap * (PK_CAR_N - 1) + 1.6, 1.6);
    pkTrack(); pkStation(); pkTrain(); pkQueueLine();
    pkPlaceTrain();
  }
  function pkTrack() {
    var M = pkMats(), g = new THREE.Group(); scene.add(g);
    g.userData.pkRideRoot = true; PK.coasterG = g;   // the ride-light scan walks up to here, so the coaster's own lamps follow the ride switch
    // the kit's track on the coaster's own frames: deep blue spine and lattice, pale running rails, legs in steel grey,
    // none in the station, round the platform or the control room
    pkCoTrackBuild(g, { curve: PK.curve, len: PK.len, F: PK.F }, {
      gauge: 1.1, spineMat: M.steelBlue, railMat: MAT.chrome, tieMat: MAT.steelDark, supMat: MAT.steelDark,
      skip: function (x, z) { return z > -6.5 && x > -12.5 && x < 18.5; }
    });
  }
  function pkStation() {
    // the platform, south of the track, with a ramp down to the apron at its south edge
    box(20, 0.6, 3.0, MAT.floor, 0, 0.3, -2.1);
    var ramp = box(20, 0.1, 1.17, MAT.floor, 0, 0.3, 0.1);
    ramp.rotation.x = 0.54;
    // the canopy over it
    [[-9.4, -3.4], [9.4, -3.4], [-9.4, -0.8], [9.4, -0.8]].forEach(function (p) { cyl(0.1, 3.2, MAT.steelDark, p[0], 2.2, p[1], null, 8); });
    box(20.4, 0.2, 3.4, MAT.roof, 0, 3.9, -2.1);
    sign(['PARK CO', 'the coaster'], 3.2, 0.8, 0, 3.0, -4.4, 0, { bg: '#1b232c', fg: '#f5b53d' });
    // the gates along the platform edge, one per car door
    for (var ci = 0; ci < PK_CAR_N; ci++) {
      var x = PK.stationX0 - ci * PK.carGap - 1.05;   // the hinge post stands just behind the car's last row, the arm runs the whole car
      var g = new THREE.Group(); g.position.set(x, PK_PLATFORM_Y, -3.6); scene.add(g);
      box(0.14, 1.0, 0.14, MAT.steelDark, 0, 0.5, 0, g);          // the hinge post
      var arm = new THREE.Group(); arm.position.set(0, 0.9, 0); arm.userData.dynamic = true; arm.userData.keep = true; g.add(arm);   // it swings, so it must not be baked into the static scene
      box(2.1, 0.1, 0.1, MAT.hazard, 1.05, 0.14, 0, arm);         // the top rail, across the way in
      box(2.1, 0.1, 0.1, MAT.hazard, 1.05, -0.28, 0, arm);        // the bottom rail
      for (var m = 0; m < 10; m++) box(0.05, 0.42, 0.05, MAT.steel, 0.12 + m * 0.2, -0.07, 0, arm);
      box(0.12, 0.12, 0.12, MAT.red, 2.08, 0.14, 0, arm);         // the end cap
      PK.gates.push({ x: x, z: -3.6, g: g, leaf: arm, bar: arm, open: false, t: 0 });
    }
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
        var R = PK.ride, n = pkQueueWaiting(), wait = Math.ceil((n + 1) / Math.max(1, PK.seats.length));   // a cycle is ~75 real s, one game minute at dt / 75
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = '#ffb03a'; c.font = 'bold 28px ' + SCREEN_THEME.font; c.fillText('THE COASTER', s.w / 2, 26);
        c.fillStyle = R.fault ? '#ff5a3c' : '#ffcf6a'; c.font = 'bold 24px ' + SCREEN_THEME.font;
        c.fillText(R.fault ? 'STOPPED' : PK.closed ? 'PARK CLOSED' : (n ? 'WAIT ' + wait + ' MIN' : 'NO WAIT · WALK ON'), s.w / 2, 68);
      } });
    pkPowerScreen(qb, pkCoasterOpen);
    PK_BK_LIVE.push({ sc: qb, g: qbG, every: 1.0 });

    // ── inside ──
    pkPaved(W - 0.2, D - 0.2, S2({ color: 0x8f969b, roughness: 0.85 }), CX, 0.043, CZ, 0.6);   // grey anti-static floor tiles
    box(W - 0.2, 0.06, D - 0.2, inner, CX, H - 0.03, CZ);                                       // the ceiling
    // a wainscot round the walls: the coaster's green to the chair rail
    var wains = S2({ color: 0x3d5b49, roughness: 0.62 });
    box(W - 0.4, 0.9, 0.04, wains, CX, 0.45, Z0 + 0.12); box(W - 0.38, 0.06, 0.08, oak, CX, 0.92, Z0 + 0.13);
    box(0.04, 0.9, D - 0.4, wains, X1 - 0.12, 0.45, CZ); box(0.08, 0.06, D - 0.38, oak, X1 - 0.13, 0.92, CZ);
    var opBattens = [0.6, 2.1, 3.6].map(function (k) { return pkBkBatten(scene, X0 + 1.4 + (k / 3.6) * (W - 2.8), H - 0.06, CZ - 0.6, 0, 1.3); });
    PK.opLights = pkBkLights('coaster', scene, opBattens, CX, H - 0.5, CZ - 0.6);
    PK.opLights.setPower(pkCoasterOpen());
    pkBkSwitch(scene, DX0 - 0.35, 1.2, Z1 - 0.11, Math.PI, PK.opLights, 'the control room');
    // the coaster desk under the long window, facing it: the operator works the ride with the platform and the train in
    // front of them; the status board hangs on the north wall at their right hand.
    pkBuildCoasterConsole({ x: X0 + 0.6, z: -0.85, ry: Math.PI / 2 });
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
    // the lived-in desk: a logbook and pen by the left hand, a desk lamp and a telephone on the right wing
    pkBevelBox(0.32, 0.025, 0.24, S2({ color: 0xece4d0, roughness: 0.8 }), 13.25, 0.825, sdz + 0.1, null, 0.004);
    pkBevelBox(0.008, 0.026, 0.24, S2({ color: 0x5a2a1a, roughness: 0.7 }), 13.25, 0.827, sdz + 0.1, null, 0.002);
    var pen2 = pkBevelBox(0.13, 0.011, 0.011, S2({ color: 0x15171a, roughness: 0.5 }), 13.38, 0.84, sdz + 0.16, null, 0.002); pen2.rotation.y = 0.5;
    pkRoundCyl(0.07, 0.025, M.brass, 16.35, 0.82, sdz + 0.1, null, 14);
    pkRod(16.35, 0.82, sdz + 0.1, 16.32, 1.15, sdz + 0.16, 0.012, M.brass, null, 6);
    pkRod(16.32, 1.15, sdz + 0.16, 16.22, 1.17, sdz + 0.28, 0.012, M.brass, null, 6);
    var lshade = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.1, 14, 1, true), S2({ color: 0x1f4a3a, roughness: 0.5, side: THREE.DoubleSide })); lshade.position.set(16.22, 1.13, sdz + 0.32); scene.add(lshade);
    sphere(0.035, glowMat(0xffd88a, 1.6), 16.22, 1.1, sdz + 0.32);
    pkBevelBox(0.18, 0.06, 0.2, S2({ color: 0x15171a, roughness: 0.5 }), 16.55, 0.83, sdz - 0.08, null, 0.008);
    var hs2 = pkBevelBox(0.2, 0.04, 0.05, S2({ color: 0x15171a, roughness: 0.5 }), 16.55, 0.88, sdz - 0.08, null, 0.004); hs2.rotation.y = Math.PI / 2;
    pkRod(16.46, 0.83, sdz - 0.08, 16.3, 0.81, sdz - 0.02, 0.008, S2({ color: 0x15171a, roughness: 0.5 }), null, 4);
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
    PK.opClock = pkBkTimeClock(scene, 11.7, 1.5, Z0 + 0.1, 0, 'coaster', 'the coaster');
    pkBkVest(scene, X1 - 0.13, 1.85, 1.2, -Math.PI / 2);
    pkBkFirstAid(scene, X1 - 0.13, 2.2, -2.6, -Math.PI / 2);
    pkBkClipboard(scene, 16.25, 1.6, Z0 + 0.11, 0);
    // the screen on the north wall: a status board that reports, while the desk does the work
    PK.screen = touchScreen({
      w: 420, h: 380, pw: 0.9, ph: 0.78, x: 14.8, y: 2.02, z: Z0 + 0.12, parent: null, title: 'Ride control',
      draw: function (ctx, s) {
        var R = PK.ride;
        scBg(ctx, s.w, s.h); scHead(ctx, s.w, 'RIDE CONTROL', pkRideWord());   // part 63's look
        var live = R.fault ? 'STOPPED' : R.state === 'running' ? 'ON TRACK' : R.state === 'dispatch' ? 'DISPATCHING' : R.state === 'ready' ? 'READY TO SEND' : R.state === 'unloading' ? 'UNLOADING' : 'AT THE STATION';
        var col = R.fault ? '#ff7a6b' : R.state === 'running' ? '#6fe0a0' : '#ffc65a';
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(26, 77, 6, 0, 6.283); ctx.fill();
        ctx.fillStyle = col; ctx.font = 'bold 32px ' + SCREEN_THEME.font; ctx.textAlign = 'left'; ctx.fillText(live, 42, 89);
        ctx.textAlign = 'right'; ctx.fillStyle = '#9fb0c3'; ctx.font = '600 15px ' + SCREEN_THEME.font;
        ctx.fillText((R.v || 0).toFixed(1) + ' m/s', s.w - 18, 89);
        ctx.textAlign = 'left';
        var cars = PK_CAR_N, per = Math.ceil(PK.seats.length / cars), cgap = 6, cw = (s.w - 36 - cgap * (cars - 1)) / cars;
        for (var c = 0; c < cars; c++) {
          var x0 = 18 + c * (cw + cgap), y0 = 106;
          ctx.fillStyle = 'rgba(255,255,255,0.055)'; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x0, y0, cw, 46, 8); else ctx.rect(x0, y0, cw, 46); ctx.fill();
          var sw = (cw - 12 - (per - 1) * 3) / per;
          for (var q = 0; q < per; q++) { ctx.fillStyle = ((c * per + q) < R.riders) ? '#6fe0a0' : 'rgba(255,255,255,0.17)'; ctx.fillRect(x0 + 6 + q * (sw + 3), y0 + 8, sw, 20); }
          ctx.fillStyle = '#7f8fa1'; ctx.font = '600 10.5px ' + SCREEN_THEME.font; ctx.fillText('CAR ' + (c + 1), x0 + 7, y0 + 41);
        }
        var rows = [
          ['GATES', PK.gates[0] && PK.gates[0].open ? 'OPEN' : 'CLOSED', PK.gates[0] && PK.gates[0].open ? '#6fe0a0' : '#9fb0c3'],
          ['RESTRAINTS', R.barsWant > 0.5 ? 'DOWN' : 'UP', R.barsWant > 0.5 ? '#6fe0a0' : '#9fb0c3'],
          ['OPERATION', R.fault ? R.fault.toUpperCase() : (S.auto ? 'AUTOMATIC' : 'MANUAL'), R.fault ? '#ff7a6b' : '#ffc65a'],
          ['TRACK WEAR', Math.round(S.wear || 0) + ' %', (S.wear || 0) > 70 ? '#ff7a6b' : '#eef2f7'],
          ['FASTEST TODAY', (PK.today.fast || 0).toFixed(1) + ' m/s', '#eef2f7']
        ];
        for (var i = 0; i < rows.length; i++) {
          var y = 172 + i * 30;
          ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(18, y, s.w - 36, 26, 8); else ctx.rect(18, y, s.w - 36, 26); ctx.fill();
          ctx.fillStyle = '#9fb0c3'; ctx.font = '600 12px ' + SCREEN_THEME.font; ctx.fillText(rows[i][0], 30, y + 18);
          ctx.fillStyle = rows[i][2]; ctx.font = 'bold 15px ' + SCREEN_THEME.font; ctx.textAlign = 'right';
          ctx.fillText(rows[i][1], s.w - 30, y + 18); ctx.textAlign = 'left';
        }
        scChip(ctx, 18, 330, 'CYCLES ' + (S.cycles || 0), '#eef2f7'); scChip(ctx, 128, 330, 'RIDERS ' + PK.today.rides, '#eef2f7'); scChip(ctx, 238, 330, 'LEVEL ' + PK.level, '#9fb0c3');
        scChip(ctx, 18, 356, 'TICKETS ' + PK.today.tickets, '#9fb0c3'); scChip(ctx, 128, 356, 'SNACKS ' + PK.today.snacks, '#9fb0c3');
      }
    });
    pkPowerScreen(PK.screen, pkCoasterOpen);

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
        R2.txt('OPERATORS', -0.21, -0.255, 0.0135, '#aebcc4'); R2.txt('SOLO', -0.29, -0.345, 0.013, '#aebcc4'); R2.txt('DUO', -0.13, -0.345, 0.013, '#f0c04a');   // part 64
        R2.txt('ISOLATE BEFORE OPENING', 0, -0.425, 0.013, '#7d8a96');
      } });
    pkCtlSetPower(P, pkCoasterOpen);
    function onLift() { var u = PK.ride.u; return PK.ride.state === 'running' && u >= PK.liftU[0] && u <= PK.liftU[1]; }
    pkCtlGauge(P, -0.21, 0.24, { id: 'liftA', unit: 'amps', min: 0, max: 200, red: 0.85, ticks: 5, r: 0.085, ease: 3, get: function () { return onLift() ? 0.62 + 0.04 * Math.sin(PK_BK_T * 6) : 0.04; } });
    pkCtlGauge(P, 0.21, 0.24, { id: 'chain', unit: 'm/s', min: 0, max: 6, red: 0.8, ticks: 6, r: 0.085, ease: 2, get: function () { return onLift() ? 0.66 : (PK.ride.state === 'running' ? 0.66 : 0); } });
    var lamps = [0x5fd38d, 0xf0c04a, 0xff3b30, 0x5fd38d].map(function (col, i) { return pkCtlLamp(P, -0.31, -0.03 - i * 0.07, { r: 0.016, col: col }); });
    var mainDuoKey = pkCtlRotary(P, -0.21, -0.3, { id: 'duo', n: 2, pos: pkMainDuo() ? 1 : 0, r: 0.03, names: ['SOLO', 'DUO'], prompt: 'The coaster operators: SOLO or DUO',
      act: function (pos) { if (!PK_MAIN) { sfx('bad'); mainDuoKey.set(0, true); return; } if (pkSetDuo(PK_MAIN, pos === 1) === false) mainDuoKey.set(pos === 1 ? 0 : 1, true); } });
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
    var plcPower = box(0.03, 0.03, 0.01, glowMat(0x5fd38d, 1.4), 0.36, 0.32, 0.27, H2);
    pkSign3D(['RIDE PLC'], 0.4, 0.1, 0, 1.88, 0.29, 0, { bg: '#1b232c', fg: '#e8e4d8' }, H2);
    pkCtlLive({ tick: function (dt) {
      var live = pkCoasterOpen();
      plcPower.material.emissiveIntensity = live ? 1.4 : 0;
      if (!live) { for (var z = 0; z < leds.length; z++) leds[z].m.emissiveIntensity = 0; return; }
      var busy = PK.ride.state === 'running' ? 1 : (PK.ride.state === 'idle' ? 0.25 : 0.6);
      for (var i = 0; i < leds.length; i++) { var L = leds[i]; L.k += dt * L.f; L.m.emissiveIntensity = L.base ? 1.4 : (Math.sin(L.k) > 1 - busy * 1.6 ? 1.6 : 0.08); }
    } });
    function S2c(c) { return pkBkStd({ color: c, roughness: 0.5, metalness: 0.35 }); }
  }

  // ── The track mimic board ─────────────────────────────────────────
  // The control room's big display: the circuit from above on a lit panel, eight blocks that go red while the train is in
  // them, the six named sections the desk's status bank shows, the lift with its chain, the train car by car with every seat,
  // and a trail behind it coloured by its speed. Down the side the live numbers: speed, height, the load the riders feel,
  // the lap clock and the last lap. Along the foot the lap's height profile, with this lap's speed traced over it and the
  // last lap's beside it in grey, so a slow trim or a stuck brake shows as a dip on the trace.
  var PK_MIMIC = null;
  function pkOpMimic(x, z) {
    var g = new THREE.Group(); g.position.set(x, 1.95, z); g.rotation.y = -Math.PI / 2; scene.add(g);
    pkBevelBox(1.5, 0.92, 0.06, MAT.steelDark, 0, 0, -0.03, g, 0.015);
    pkBevelBox(1.54, 0.03, 0.08, pkMats().brass || MAT.chrome, 0, 0.475, -0.02, g, 0.008);
    var N = 360, P = [], xs = [], zs = [], ys = [];
    for (var i = 0; i < N; i++) { var p = PK.curve.getPointAt(((PK.stationU + i / N) % 1)); P.push(p); xs.push(p.x); zs.push(p.z); ys.push(p.y); }
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), z0 = Math.min.apply(null, zs), z1 = Math.max.apply(null, zs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var BL = 8, BINS = 180, trace = new Array(BINS).fill(0), last = null, trail = [], trailT = 0, prevD = 0, prevPos = null, gLoad = 1, prevVel = new THREE.Vector3(), vNow = new THREE.Vector3(), topV = 0;
    var lift = [((PK.liftU[0] - PK.stationU) % 1 + 1) % 1, ((PK.liftU[1] - PK.stationU) % 1 + 1) % 1];
    var W = 900, H = 546, PLAN = { x: 18, y: 48, w: 600, h: 330 }, SIDE = { x: 636, y: 48, w: 248, h: 330 }, PROF = { x: 18, y: 398, w: 866, h: 128 };
    var k = Math.min((PLAN.w - 40) / (x1 - x0), (PLAN.h - 40) / (z1 - z0)), ox = PLAN.x + (PLAN.w - (x1 - x0) * k) / 2, oz = PLAN.y + (PLAN.h - (z1 - z0) * k) / 2;
    function X(p) { return ox + (p.x - x0) * k; } function Z(p) { return oz + (p.z - z0) * k; }
    function PX(f) { return PROF.x + 40 + f * (PROF.w - 56); } function PY(y) { return PROF.y + PROF.h - 22 - (y - y0) / Math.max(1, y1 - y0) * (PROF.h - 44); }
    function VY(v) { return PROF.y + PROF.h - 22 - clamp(v / 30, 0, 1) * (PROF.h - 44); }
    function lapOf(u) { return ((u - PK.stationU) % 1 + 1) % 1; }
    var font = SCREEN_THEME.font, bg = null;
    // the parts that never move, drawn once: the panel, the grid, the plan's casing, the profile and its scales
    function background() {
      var cv = document.createElement('canvas'); cv.width = W; cv.height = H; var c = cv.getContext('2d');
      var gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0d1620'); gr.addColorStop(1, '#070b10'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
      [PLAN, SIDE, PROF].forEach(function (b) { c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(b.x, b.y, b.w, b.h); c.strokeStyle = 'rgba(201,162,39,0.45)'; c.lineWidth = 1.5; c.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1); });
      c.strokeStyle = 'rgba(143,195,255,0.06)'; c.lineWidth = 1;
      for (var gx = PLAN.x; gx < PLAN.x + PLAN.w; gx += 20) { c.beginPath(); c.moveTo(gx, PLAN.y); c.lineTo(gx, PLAN.y + PLAN.h); c.stroke(); }
      for (var gy = PLAN.y; gy < PLAN.y + PLAN.h; gy += 20) { c.beginPath(); c.moveTo(PLAN.x, gy); c.lineTo(PLAN.x + PLAN.w, gy); c.stroke(); }
      // a scale bar and the north arrow
      c.fillStyle = '#7d8a96'; c.font = '11px ' + font; c.textAlign = 'left';
      c.fillRect(PLAN.x + 14, PLAN.y + PLAN.h - 16, 10 * k, 3); c.fillText('10 m', PLAN.x + 18 + 10 * k, PLAN.y + PLAN.h - 11);
      c.beginPath(); c.moveTo(PLAN.x + PLAN.w - 22, PLAN.y + 12); c.lineTo(PLAN.x + PLAN.w - 28, PLAN.y + 28); c.lineTo(PLAN.x + PLAN.w - 16, PLAN.y + 28); c.closePath(); c.fill(); c.fillText('N', PLAN.x + PLAN.w - 26, PLAN.y + 42);
      // the track's casing under the live block colours
      c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = 'rgba(0,0,0,0.7)'; c.lineWidth = 12; c.beginPath(); P.forEach(function (q, n) { if (n) c.lineTo(X(q), Z(q)); else c.moveTo(X(q), Z(q)); }); c.closePath(); c.stroke();
      // the profile: height over the lap, five-metre lines, the lift picked out
      c.strokeStyle = 'rgba(143,195,255,0.12)'; c.fillStyle = '#7d8a96'; c.font = '10px ' + font; c.textAlign = 'right';
      for (var hm = 0; hm <= y1 - y0 + 0.1; hm += 5) { var yy = PY(y0 + hm); c.beginPath(); c.moveTo(PX(0), yy); c.lineTo(PX(1), yy); c.stroke(); c.fillText(hm + ' m', PX(0) - 4, yy + 3); }
      c.beginPath(); c.moveTo(PX(0), PY(y0)); P.forEach(function (q, n) { c.lineTo(PX(n / N), PY(q.y)); }); c.lineTo(PX(1), PY(y0)); c.closePath();
      var fg = c.createLinearGradient(0, PROF.y, 0, PROF.y + PROF.h); fg.addColorStop(0, 'rgba(143,195,255,0.28)'); fg.addColorStop(1, 'rgba(143,195,255,0.04)'); c.fillStyle = fg; c.fill();
      c.strokeStyle = '#8fc3ff'; c.lineWidth = 1.5; c.beginPath(); P.forEach(function (q, n) { if (n) c.lineTo(PX(n / N), PY(q.y)); else c.moveTo(PX(0), PY(q.y)); }); c.stroke();
      c.strokeStyle = '#ffcf5a'; c.lineWidth = 3; c.beginPath(); for (var n = Math.floor(lift[0] * N); n <= Math.ceil(lift[1] * N) && n < N; n++) { if (n === Math.floor(lift[0] * N)) c.moveTo(PX(n / N), PY(P[n].y)); else c.lineTo(PX(n / N), PY(P[n].y)); } c.stroke();
      c.textAlign = 'left'; c.fillStyle = '#c9a227'; c.font = 'bold 11px ' + font; c.fillText('PROFILE  ·  HEIGHT AND SPEED OVER THE LAP', PROF.x + 10, PROF.y + 14);
      c.fillStyle = '#7d8a96'; c.font = '10px ' + font; c.textAlign = 'right'; c.fillText('SPEED 0 - 108 KM/H', PROF.x + PROF.w - 10, PROF.y + 14);
      // the section names along the profile's foot
      var SEC = PK.coasterSections || [];
      c.textAlign = 'left'; c.font = '10px ' + font;
      for (var s2 = 0; s2 < SEC.length - 1; s2++) { var fx = PX(SEC[s2][1]); c.fillStyle = 'rgba(143,195,255,0.3)'; c.fillRect(fx, PROF.y + 20, 1, PROF.h - 40); c.fillStyle = '#9fb2c0'; c.fillText(SEC[s2][0].replace(/\n/g, ' ').replace('- ', ''), fx + 3, PROF.y + PROF.h - (s2 % 2 ? 22 : 8)); }
      bg = cv;
    }
    var sc = touchScreen({ w: W, h: H, pw: 1.4, ph: 0.85, x: 0, y: 0, z: 0.006, parent: g, title: 'The track mimic',
      draw: function (c, s) {
        if (!bg) background();
        c.drawImage(bg, 0, 0, s.w, s.h);
        var R = PK.ride, d = lapOf(R.u), tb = Math.floor(d * BL), run = R.state === 'running' || R.state === 'dispatch' || R.state === 'arrive';
        c.textAlign = 'left'; c.textBaseline = 'alphabetic';
        c.fillStyle = '#ffcf5a'; c.font = 'bold 20px ' + font; c.fillText('THE COASTER  ·  TRACK MIMIC', 18, 30);
        c.fillStyle = R.fault ? '#ff6b5e' : '#d6dee3'; c.font = 'bold 15px ' + font; c.textAlign = 'right';
        c.fillText((R.fault ? 'STOPPED  ' : '') + pkRideWord().toUpperCase() + '   ' + fmtTime(S.time), W - 18, 30);
        // the blocks: green clear, red occupied, the block behind the train amber while it clears
        c.lineCap = 'round'; c.lineJoin = 'round';
        for (var b = 0; b < BL; b++) {
          var occ = b === tb, behind = run && b === (tb + BL - 1) % BL;
          c.strokeStyle = occ ? '#ff4a3a' : behind ? '#f0c04a' : '#3f9f6a'; c.lineWidth = 6; c.beginPath();
          for (var j = 0; j <= N / BL; j++) { var q = P[(b * N / BL + j) % N]; if (j === 0) c.moveTo(X(q), Z(q)); else c.lineTo(X(q), Z(q)); }
          c.stroke();
          var mid = P[Math.floor((b + 0.5) * N / BL) % N]; c.fillStyle = 'rgba(214,222,227,0.55)'; c.font = '10px ' + font; c.textAlign = 'center'; c.fillText('B' + (b + 1), X(mid), Z(mid) - 9);
        }
        // the lift's chain, ticking along while it runs
        c.strokeStyle = 'rgba(0,0,0,0.75)'; c.lineWidth = 2; c.setLineDash([4, 4]); c.lineDashOffset = -PK_BK_T * (run ? 20 : 0); c.beginPath();
        for (var n = Math.floor(lift[0] * N); n <= Math.ceil(lift[1] * N) && n < N; n++) { if (n === Math.floor(lift[0] * N)) c.moveTo(X(P[n]), Z(P[n])); else c.lineTo(X(P[n]), Z(P[n])); }
        c.stroke(); c.setLineDash([]);
        // the station and the named sections
        var ps = P[0], pl = P[Math.floor((lift[0] + lift[1]) / 2 * N)];
        c.fillStyle = '#ffcf5a'; c.fillRect(X(ps) - 7, Z(ps) - 7, 14, 14);
        c.fillStyle = '#9fb2c0'; c.font = 'bold 11px ' + font; c.textAlign = 'center'; c.fillText('STATION', X(ps), Z(ps) + 22); c.fillText('LIFT', X(pl) + 22, Z(pl) + 4);
        var top = P[ys.indexOf(y1)]; c.fillStyle = '#d6dee3'; c.font = '10px ' + font; c.fillText('^ ' + (y1 - y0).toFixed(1) + ' m', X(top), Z(top) - 12);
        // the trail: where the train has been the last few seconds, coloured by its speed
        for (var t = 1; t < trail.length; t++) { var A = trail[t - 1], B2 = trail[t], f = clamp(B2.v / 25, 0, 1); c.strokeStyle = 'rgba(' + Math.round(120 + 135 * f) + ',' + Math.round(220 - 150 * f) + ',' + Math.round(255 - 200 * f) + ',' + (t / trail.length).toFixed(2) + ')'; c.lineWidth = 4; c.beginPath(); c.moveTo(X(A.p), Z(A.p)); c.lineTo(X(B2.p), Z(B2.p)); c.stroke(); }
        // the train: each car along the track, its seats lit for the riders in it
        for (var ci = 0; ci < PK.cars.length; ci++) {
          var u = ((R.u - ci * PK.carGap / PK.len) % 1 + 1) % 1, pt = PK.curve.getPointAt(u), tg = PK.curve.getTangentAt(u), an = Math.atan2(tg.z * k, tg.x * k);
          c.save(); c.translate(X(pt), Z(pt)); c.rotate(an);
          c.fillStyle = ci ? '#d8b04a' : '#ffffff'; c.strokeStyle = '#000'; c.lineWidth = 1.5; roundRect(c, -11, -7, 22, 14, 4); c.fill(); c.stroke();
          for (var st = 0; st < 4; st++) { var seat = PK.seats[ci * 4 + st]; c.fillStyle = seat && seat.guest ? '#1b6fd0' : 'rgba(0,0,0,0.25)'; c.beginPath(); c.arc(-5 + (st >> 1) * 10, -3 + (st & 1) * 6, 2.4, 0, 6.283); c.fill(); }
          c.restore();
        }
        // the side column: the live numbers
        var sx = SIDE.x + 14, sy = SIDE.y + 26, v = (R.v || 0) * 3.6;
        c.textAlign = 'left'; c.fillStyle = '#7d8a96'; c.font = 'bold 11px ' + font; c.fillText('SPEED', sx, sy);
        c.fillStyle = '#ffcf5a'; c.font = 'bold 46px ' + font; c.fillText(v.toFixed(0), sx, sy + 46); var vw = c.measureText(v.toFixed(0)).width; c.font = 'bold 14px ' + font; c.fillStyle = '#c9a227'; c.fillText('KM/H', sx + vw + 8, sy + 46);
        c.fillStyle = 'rgba(255,207,90,0.15)'; c.fillRect(sx, sy + 56, SIDE.w - 28, 8); c.fillStyle = '#ffcf5a'; c.fillRect(sx, sy + 56, (SIDE.w - 28) * clamp(v / 108, 0, 1), 8);
        var rows = [['HEIGHT', (PK.cars[0] ? Math.max(0, PK.cars[0].position.y - y0) : 0).toFixed(1) + ' m'], ['LOAD', gLoad.toFixed(2) + ' g'], ['TOP SPEED', (topV * 3.6).toFixed(0) + ' km/h'],
          ['BLOCK', 'B' + (tb + 1) + ' of ' + BL], ['LAP CLOCK', (PK.lapT || 0).toFixed(1) + ' s'], ['LAST LAP', PK.lastLap ? PK.lastLap.toFixed(1) + ' s' : '--'], ['ABOARD', R.riders + ' / ' + PK.seats.length], ['CYCLES', String(S.cycles || 0)]];
        rows.forEach(function (rw, i2) { var yy = sy + 92 + i2 * 26; c.fillStyle = '#7d8a96'; c.font = 'bold 11px ' + font; c.textAlign = 'left'; c.fillText(rw[0], sx, yy); c.fillStyle = '#e8eef2'; c.font = 'bold 15px ' + font; c.textAlign = 'right'; c.fillText(rw[1], SIDE.x + SIDE.w - 14, yy); });
        // the foot: this lap's speed over the profile, the last lap's in grey, the train's cursor
        var drawTrace = function (arr, col, w) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); var on = false; for (var bi = 0; bi < BINS; bi++) { if (!arr[bi]) { on = false; continue; } var xx = PX(bi / BINS), yy = VY(arr[bi]); if (on) c.lineTo(xx, yy); else { c.moveTo(xx, yy); on = true; } } c.stroke(); };
        if (last) drawTrace(last, 'rgba(200,210,220,0.35)', 1.5);
        drawTrace(trace, '#ff9d6b', 2);
        var cy = PY(P[Math.min(N - 1, Math.floor(d * N))].y); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(PX(d), cy, 5, 0, 6.283); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(PX(d), PROF.y + 20, 1, PROF.h - 40);
      } });
    // the board keeps the trace and the trail whether or not anyone is looking, so it is right when you look up
    pkCtlLive({ tick: function (dt) {
      var R = PK.ride, d = lapOf(R.u), car = PK.cars[0];
      if (d + 0.5 < prevD) { if (trace.some(function (v) { return v > 0; })) last = trace.slice(); trace = new Array(BINS).fill(0); }
      prevD = d;
      if (R.state === 'running' || R.state === 'arrive') { var bi = Math.min(BINS - 1, Math.floor(d * BINS)); trace[bi] = Math.max(0.01, R.v || 0); topV = Math.max(topV, R.v || 0); }
      trailT -= dt;
      if (trailT <= 0) { trailT = 0.12; trail.push({ p: PK.curve.getPointAt(R.u).clone(), v: R.v || 0 }); if (trail.length > 30) trail.shift(); }
      if (car && dt > 0) {
        if (prevPos) { vNow.copy(car.position).sub(prevPos).divideScalar(dt); var acc = vNow.clone().sub(prevVel).divideScalar(dt); prevVel.copy(vNow); var gl = Math.sqrt(acc.x * acc.x + (acc.y + 9.81) * (acc.y + 9.81) + acc.z * acc.z) / 9.81; if (!isFinite(gl) || gl > 7 || R.state !== 'running') gl = 1; gLoad += (gl - gLoad) * Math.min(1, dt * 2.5); }
        else prevPos = new THREE.Vector3();
        prevPos.copy(car.position);
      }
    } });
    pkPowerScreen(sc, pkCoasterOpen);
    PK_BK_LIVE.push({ sc: sc, g: g, every: 0.2 });
    PK_MIMIC = sc; sc.board = g;
  }
  // two CCTV monitors on their stands on the station desk, turned to the operator: the queue lane and the platform
  function pkOpMonitors(x, z, ry) {
    var g = new THREE.Group(); g.position.set(x, 1.12, z); g.rotation.y = ry === undefined ? Math.PI / 2 : ry; scene.add(g);
    [-0.27, 0.27].forEach(function (dx) { pkRoundCyl(0.025, 0.2, pkMats().iron, dx, -0.22, -0.08, g, 6); pkBevelBox(0.22, 0.02, 0.16, pkMats().iron, dx, -0.32, -0.06, g, 0.006); });
    // two live CCTV monitors on their stands, turned to the operator: the queue lane and the platform
    pkCctvFeed(g, -0.27, 0, 0, 0.15, -0.05, [7, 5.5, 11], [7, 0.5, 4], pkCoasterOpen);
    pkCctvFeed(g, 0.27, 0, 0, -0.15, -0.05, [0, 4.5, 1], [0, 1, -2], pkCoasterOpen);
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
    sphere(0.035, pkMats().gold, 1.05, 1.0, -1.79, g);
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
    // interior: a fryer counter along the back wall, a shelf of cups and napkins, and a warm pendant lamp
    box(3.0, 0.85, 0.5, MAT.wood, 0, 0.425, -1.25, g);
    box(2.9, 0.06, 0.46, MAT.trim, 0, 0.86, -1.25, g);
    box(0.9, 0.35, 0.4, MAT.steelDark, -0.95, 0.62, -1.25, g);
    box(0.9, 0.35, 0.4, MAT.steelDark, 0.05, 0.62, -1.25, g);
    box(0.9, 0.35, 0.4, MAT.steelDark, 1.05, 0.62, -1.25, g);
    box(2.6, 0.18, 0.28, MAT.wood, 0, 1.55, -1.5, g);
    for (var sc = 0; sc < 5; sc++) box(0.16, 0.22, 0.12, std({ color: 0xf3efe4, roughness: 0.9 }), -1.0 + sc * 0.52, 1.7, -1.5, g);
    pkRoundCyl(0.04, 0.5, std({ color: 0xffe2a0, emissive: 0xffc966, emissiveIntensity: 1.2, roughness: 0.3 }), 0, 2.4, 0, g, 8);

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
  function pkBuildIceCream() {
    var g = new THREE.Group(); g.position.set(-8, 0, 8); scene.add(g);
    box(3.4, 3.0, 0.2, MAT.plaster, 0, 1.5, -1.6, g);
    box(0.2, 3.0, 3.4, MAT.plaster, -1.6, 1.5, 0, g);
    box(0.2, 3.0, 3.4, MAT.plaster, 1.6, 1.5, 0, g);
    box(3.6, 0.16, 3.6, MAT.roof, 0, 3.05, 0, g);
    box(3.4, 1.05, 0.5, MAT.wood, 0, 0.52, 1.5, g);
    box(3.5, 0.08, 0.6, MAT.trim, 0, 1.08, 1.5, g);
    // interior
    box(3.0, 0.85, 0.5, MAT.wood, 0, 0.425, -1.25, g);
    box(2.9, 0.06, 0.46, MAT.trim, 0, 0.86, -1.25, g);
    box(1.2, 0.5, 0.4, std({ color: 0x9fd0ff, roughness: 0.4 }), -0.9, 0.62, -1.25, g);
    box(1.2, 0.5, 0.4, std({ color: 0x9fd0ff, roughness: 0.4 }), 0.9, 0.62, -1.25, g);
    box(2.6, 0.18, 0.28, MAT.wood, 0, 1.55, -1.5, g);
    // worker figure (decorative)
    var wg = new THREE.Group(); wg.position.set(0.6, 0, -0.6); g.add(wg);
    box(0.35, 0.9, 0.25, std({ color: 0xffffff, roughness: 0.9 }), 0, 1.3, 0, wg);
    sphere(0.16, std({ color: 0xf2d4a0, roughness: 0.9 }), 0, 1.95, 0, wg);
    // signs
    sign(['ICE CREAM'], 2.6, 0.6, 0, 2.75, 1.72, 0, { bg: '#1b232c', fg: '#9fd0ff' }, g);
    sign(['SCOOP ' + money(S.icePrice)], 2.2, 0.4, 0, 1.9, 1.72, 0, { bg: '#0d1216', fg: '#eef1f5' }, g);
    solid(-9.75, -6.25, 6.25, 9.75, 0, 3.0);
    hitBox(3.0, 1.4, 0.6, 0, 1.5, 1.5, {
      prompt: function () { return PK.iceOpen ? 'Buy ice cream (' + money(S.icePrice) + ')' : 'The ice cream stand is shut'; },
      use: function () { pkIceBuy(); }
    }, g);
    PK.ice = touchScreen({ w: 300, h: 220, pw: 0.62, ph: 0.45, x: 0, y: 1.35, z: 1.28, parent: g, title: 'Ice cream', draw: function (ctx, s) {
        scBg(ctx, s.w, s.h); scHead(ctx, s.w, 'ICE CREAM', 'Day ' + S.day);
        scText(ctx, 16, 66, 'Scoop ' + money(S.icePrice));
        scText(ctx, 16, 88, PK.iceOpen ? 'Open' : 'Shut', PK.iceOpen ? '#5fd38d' : '#a0acb8');
        scText(ctx, 16, 110, 'Sold today: ' + (PK.today.ice || 0), '#a0acb8');
        scButton(s, 16, 130, 130, 40, 'Sell', PK.iceOpen, function () { pkIceBuy(); });
        scButton(s, 154, 130, 130, 40, 'Price +', true, function () { pkIcePrice(1); });
      }
    });
  }
  function pkBuildToys() {
    var g = new THREE.Group(); g.position.set(-18, 0, 8); scene.add(g);
    box(3.4, 3.0, 0.2, MAT.plaster, 0, 1.5, -1.6, g);
    box(0.2, 3.0, 3.4, MAT.plaster, -1.6, 1.5, 0, g);
    box(0.2, 3.0, 3.4, MAT.plaster, 1.6, 1.5, 0, g);
    box(3.6, 0.16, 3.6, MAT.roof, 0, 3.05, 0, g);
    box(3.4, 1.05, 0.5, MAT.wood, 0, 0.52, 1.5, g);
    box(3.5, 0.08, 0.6, MAT.trim, 0, 1.08, 1.5, g);
    // interior
    box(3.0, 0.85, 0.5, MAT.wood, 0, 0.425, -1.25, g);
    box(2.9, 0.06, 0.46, MAT.trim, 0, 0.86, -1.25, g);
    for (var t = 0; t < 6; t++) box(0.35, 0.45, 0.25, std({ color: [0xd94f6a, 0xf3c84a, 0x5fd38d, 0x2f8fb3, 0x7a3fb3, 0xd94f8a][t], roughness: 0.8 }), -1.2 + t * 0.5, 0.7, -1.25, g);
    box(2.6, 0.18, 0.28, MAT.wood, 0, 1.55, -1.5, g);
    // worker figure (decorative)
    var wg = new THREE.Group(); wg.position.set(0.6, 0, -0.6); g.add(wg);
    box(0.35, 0.9, 0.25, std({ color: 0xfff0c0, roughness: 0.9 }), 0, 1.3, 0, wg);
    sphere(0.16, std({ color: 0xf2d4a0, roughness: 0.9 }), 0, 1.95, 0, wg);
    sign(['TOYS'], 2.6, 0.6, 0, 2.75, 1.72, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);
    sign(['TOY ' + money(S.toyPrice)], 2.2, 0.4, 0, 1.9, 1.72, 0, { bg: '#0d1216', fg: '#eef1f5' }, g);
    solid(-19.75, -16.25, 6.25, 9.75, 0, 3.0);
    hitBox(3.0, 1.4, 0.6, 0, 1.5, 1.5, {
      prompt: function () { return PK.toyOpen ? 'Buy a toy (' + money(S.toyPrice) + ')' : 'The toys stand is shut'; },
      use: function () { pkToyBuy(); }
    }, g);
    PK.toy = touchScreen({ w: 300, h: 220, pw: 0.62, ph: 0.45, x: 0, y: 1.35, z: 1.28, parent: g, title: 'Toys', draw: function (ctx, s) {
        scBg(ctx, s.w, s.h); scHead(ctx, s.w, 'TOYS', 'Day ' + S.day);
        scText(ctx, 16, 66, 'Toy ' + money(S.toyPrice));
        scText(ctx, 16, 88, PK.toyOpen ? 'Open' : 'Shut', PK.toyOpen ? '#5fd38d' : '#a0acb8');
        scText(ctx, 16, 110, 'Sold today: ' + (PK.today.toys || 0), '#a0acb8');
        scButton(s, 16, 130, 130, 40, 'Sell', PK.toyOpen, function () { pkToyBuy(); });
        scButton(s, 154, 130, 130, 40, 'Price +', true, function () { pkToyPrice(1); });
      }
    });
  }
  function pkIcePrice(n) { S.icePrice = clamp(Math.round((S.icePrice + n) * 100) / 100, 1, 40); screenDirtyAll(); hudDirty = true; toast('Ice cream ' + money(S.icePrice), ''); return S.icePrice; }
  function pkIceBuy() {
    if (!PK.iceOpen) { sfx('bad'); toast('The ice cream stand is not open yet', 'bad'); return false; }
    var gu = pkNearestHuman(-8, 8);
    if (!gu) { sfx('bad'); toast('Nobody is at the stand', 'bad'); return false; }
    pay(S.icePrice, 'Ice cream'); PK.today.ice = (PK.today.ice || 0) + 1; PK.today.earned += S.icePrice; pkXp(1); sfx('cash'); say(gu, 'Thanks!'); toast('Ice cream sold', 'good');
    var _gi = null; PK.guests.forEach(function (x) { if (x.g === gu) _gi = x; });
    if (_gi) { _gi.carryItem = 'ice'; pkGuestItemEnsure(_gi, 'ice'); }
    screenDirtyAll(); hudDirty = true; return true;
  }
  function pkToyPrice(n) { S.toyPrice = clamp(Math.round((S.toyPrice + n) * 100) / 100, 1, 40); screenDirtyAll(); hudDirty = true; toast('Toy ' + money(S.toyPrice), ''); return S.toyPrice; }
  function pkToyBuy() {
    if (!PK.toyOpen) { sfx('bad'); toast('The toys stand is not open yet', 'bad'); return false; }
    var gu = pkNearestHuman(-18, 8);
    if (!gu) { sfx('bad'); toast('Nobody is at the stand', 'bad'); return false; }
    pay(S.toyPrice, 'Toy'); PK.today.toys = (PK.today.toys || 0) + 1; PK.today.earned += S.toyPrice; pkXp(1); sfx('cash'); say(gu, 'Thanks!'); toast('Toy sold', 'good');
    var _gt = null; PK.guests.forEach(function (x) { if (x.g === gu) _gt = x; });
    if (_gt) { _gt.carryItem = 'toy'; pkGuestItemEnsure(_gt, 'toy'); }
    screenDirtyAll(); hudDirty = true; return true;
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
    var _gs = null; PK.guests.forEach(function (x) { if (x.g === gu) _gs = x; });
    if (_gs) { _gs.carryItem = 'fries'; pkGuestItemEnsure(_gs, 'fries'); }
    screenDirtyAll(); hudDirty = true; return true;
  }
  // ── Placing the train ─────────────────────────────────────────────
  // on the track's own frame: banked in the turns, over on its back through the loop and the corkscrew
  function pkPlaceCar(car, u) {
    var p = PK.curve.getPointAt(u), t = PK.curve.getTangentAt(u).normalize();
    pkCoUpAt(PK.F, u);
    PK_CO_RIGHT.crossVectors(PK_CO_UP, t).normalize();
    PK_CO_M4.makeBasis(PK_CO_RIGHT, PK_CO_UP, t);
    car.position.set(p.x, p.y, p.z);
    car.quaternion.setFromRotationMatrix(PK_CO_M4);
    car.updateMatrixWorld(true);
  }
  function pkPlaceTrain() {
    if (!PK.curve) return;
    for (var i = 0; i < PK.cars.length; i++) pkPlaceCar(PK.cars[i], (PK.ride.u - i * PK.carGap / PK.len + 1) % 1);
  }
  // the speed at any point of the lap, from the same physics as the kit coasters (station tyres, a chain lift at
  // 2.4 m/s, the drop with friction after the crest, the brake run home), worked out once from the station
  function pkSpeedAt(u) {
    var P = PK.prof;
    if (!P) P = PK.prof = pkCoProfile(PK.curve, PK.len, PK.stationU, pkMainOpt());
    var f = ((u - PK.stationU + 1) % 1) * P.K, k = Math.min(P.K - 1, Math.floor(f)), r = f - k;
    return Math.max(0.4, P.V[k] + (P.V[k + 1] - P.V[k]) * r);         // never quite 0, or the train could not pull away
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
    if (!PK.gates[0] || !PK.gates[0].open || PK.stnForce === false) return 0;
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
  // the coaster's operator key: ON unlocks the coaster and its desk; OFF locks them (not while the train is out)
  function pkSetCoasterKey(on) {
    var R = PK.ride;
    if (on && !pkCoasterOpen()) { sfx('bad'); toast('The coaster breaker is off at the park board', 'bad'); return false; }
    if (!on && (R.state === 'dispatch' || R.state === 'running' || R.state === 'arrive' || R.riders)) { sfx('bad'); toast('Not with the train out or riders aboard', 'bad'); return false; }
    S.coasterKey = !!on;
    if (!on) { PK.gates.forEach(function (gt) { gt.open = false; }); if (R.state === 'loading' || R.state === 'ready' || R.state === 'unload') R.state = 'idle'; }
    toast(S.coasterKey ? 'The coaster: operator key ON - unlocked' : 'The coaster: operator key OFF - locked', S.coasterKey ? 'good' : '');
    logEvent(S.coasterKey ? 'The coaster unlocked' : 'The coaster locked', '');
    screenDirtyAll(); hudDirty = true;
    return true;
  }
  function pkOpenGates() {
    var R = PK.ride;
    if (!pkCoasterOpen()) return pkRefuse('The coaster breaker is off at the park board');
    if (!S.coasterKey) return pkRefuse('The coaster is locked - turn the operator key on');
    if (PK.closed) return pkRefuse('The park is closed');
    if (R.fault) return pkRefuse('The ride is stopped');
    if (!pkCoasterAuto() && R.state === 'unload' && (R.riders > 0 || R.bars > 0.05)) return pkRefuse('Raise the restraints to let the riders off');
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
  // The station gates are a master barrier worked by their own button. PK.stnForce is null while they stand open between trains (the boarding gates work on their own),
  // true/false once the operator has forced them open/shut. AUTO keeps re-opening the boarding gates (pkOpenGates), so a
  // forced state is what stops it from undoing the button. It clears when the train leaves.
  function pkStnMoving() { var st = PK.ride.state; return st === 'dispatch' || st === 'running' || st === 'arrive'; }
  function pkStnOpen() {
    if (pkStnMoving()) return false;
    if (PK.stnForce === true || PK.stnForce === false) return PK.stnForce;
    return true;   // unforced: open between trains. The boarding gates (the GATES button) no longer drag the station gates with them
  }
  function pkStationGates() {
    if (pkMainDeskRefuse('station gates')) return false;   // DUO (part 64)
    if (pkStnMoving()) return pkRefuse('Not while the train is moving');
    PK.stnForce = !pkStnOpen();
    var open = PK.stnForce;
    sfx('click'); toast('Station gates ' + (open ? 'open' : 'shut'), open ? '' : 'bad');
    hudDirty = true; screenDirtyAll(); return true;
  }
  // one button for the gates: open to start boarding, close once the cars are full - whenever the train is in the station,
  // line or no line, bars up or down. The state decides, not the gate leaf, so after a manual train comes home and the
  // restraints are up (state unload) the next press lets the queue in.
  function pkGatesToggle() {
    var R = PK.ride;
    if (R.fault) return pkRefuse('The ride is stopped');
    if (R.state === 'idle' || R.state === 'unload') return pkOpenGates();
    if (R.state === 'loading') return pkCloseGates();
    if (R.state === 'ready') return PK.gates[0] && PK.gates[0].open ? pkCloseGates() : pkOpenGates();
    return pkRefuse('Not while the train is moving');
  }
  function pkBarsDown() {
    if (pkMainDeskRefuse('restraints')) return false;   // DUO (part 64)
    var R = PK.ride;
    if (!pkCoasterOpen()) return pkRefuse('The coaster breaker is off at the park board');
    if (!S.coasterKey) return pkRefuse('The coaster is locked - turn the operator key on');
    if (R.fault) return pkRefuse('The ride is stopped');
    if (R.state !== 'loading' && R.state !== 'ready') return pkRefuse('Open the gates and load first');
    if (pkStillBoarding()) return pkRefuse('Let the riders sit first');
    R.barsWant = 1; R.state = 'ready';
    sfx('lock'); hudDirty = true; return true;
  }
  function pkBarsUp() {
    if (pkMainDeskRefuse('restraints')) return false;   // DUO (part 64)
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
    else if (which === 'operator') { S.operators = Math.max(0, pkOpCount() - 1); S.operator = PK.operator = S.operators > 0; }   // one at a time, the last hired first
    else return 'nobody';
    sfx('bad'); toast('Staff let go', 'bad'); logEvent('Staff let go', '');
    screenDirtyAll(); hudDirty = true;
    return 'Let go';
  }
  function pkDispatch() {
    var R = PK.ride;
    if (!S.coasterKey) return pkRefuse('The coaster is locked - turn the operator key on');
    if (PK.closed && R.riders === 0) return pkRefuse('The park is closed');
    if (R.fault) return pkRefuse('The ride is stopped');
    if (R.state !== 'ready') return pkRefuse('Restraints first, then dispatch');
    if (pkStillBoarding()) return pkRefuse('Wait for the riders to sit');
    if ((S.wear || 0) >= 90) return pkRefuse('Service the coaster before it goes again');
    if (!pkPlatDispatchOk(PK_MAIN || { riders: 0 }, true)) return false;   // DUO (part 64): the platform release first
    pkMainUsed();
    // an empty dispatch is a test run: an operator may send an empty train, it just earns nothing
    var empty = R.riders === 0;
    S.wear = Math.min(100, (S.wear || 0) + 1.5);
    PK.gates.forEach(function (gt) { gt.open = false; });
    PK.stnForce = null;
    R.state = 'dispatch'; R.beat = 1.2;
    if (empty) { sfx('bell'); logEvent('Test run, empty train', ''); toast('Test run', ''); }
    else { pkXp(pkOnDutyAt('coaster') ? 3 : 2); sfx('pkCoasterHorn'); logEvent('Dispatch with ' + R.riders + ' aboard', 'good'); }
    hudDirty = true; return true;
  }
  function pkTestRun() {
    // a test run: send the empty train round from the screen, without needing the gates and the bars first
    var R = PK.ride;
    if (!S.coasterKey) return pkRefuse('The coaster is locked - turn the operator key on');
    if (PK.closed) return pkRefuse('The park is closed');
    if (R.fault) return pkRefuse('The ride is stopped');
    if (R.state === 'dispatch' || R.state === 'running' || R.state === 'arrive') return pkRefuse('Not while the train is moving');
    if (R.state !== 'idle' && R.state !== 'loading' && R.state !== 'ready' && R.state !== 'unload') return pkRefuse('Not while the train is moving');
    if (PK.queue.length) return pkRefuse('Riders are waiting - dispatch them first');
    if (R.riders > 0 || pkStillBoarding()) return pkRefuse('Riders aboard - dispatch them');
    if ((S.wear || 0) >= 90) return pkRefuse('Service the coaster before it goes again');
    S.wear = Math.min(100, (S.wear || 0) + 1.5);
    PK.gates.forEach(function (gt) { gt.open = false; });
    PK.stnForce = null;
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
    var R = PK.ride, n = R.riders, auto = pkCoasterAuto();
    R.state = 'unload';
    S.cycles = (S.cycles || 0) + 1;
    PK.today.rides += n;
    if (n > 0) pkXp(1);
    if (auto && !pkMainDuo()) {
      // AUTO lets the riders off by itself: the restraints lift and the platform gates open
      R.barsWant = 0; R.bars = 0;
      PK.gates.forEach(function (gt) { gt.open = true; });
      PK.seats.forEach(function (s) { if (s.guest) pkUnseatGuest(s.guest); });
      R.riders = 0;
    } else {
      // MANUAL: the train stands with the bars still down and the gates still shut. Raising the
      // restraints is the operator's next job, and the riders only step off once they are up.
      R.barsWant = 1;
      if (n > 0) toast('Train home - raise the restraints', '');
    }
    sfx('bell'); logEvent('The train is back with ' + n + ' aboard', 'good');
    screenDirtyAll(); hudDirty = true;
  }
  // ── The ride, one tick ────────────────────────────────────────────
  function pkOpSignal() {
    // the three signal lamps over the operator door and the roof beacon follow the ride,
    // exactly as the booth lamps do: green idle, amber boarding/unloading, red running or fault
    var L = PK.opLamps;
    if (!L) return;
    if (!pkCoasterOpen()) {
      for (var i = 0; i < L.mats.length; i++) if (L.mats[i] && L.mats[i].emissive) L.mats[i].emissiveIntensity = 0;
      if (L.beacon && L.beacon.emissive) L.beacon.emissiveIntensity = 0;
      return;
    }
    var st = PK.ride ? PK.ride.state : 'idle', fault = PK.ride && PK.ride.fault;
    var on = fault ? 0 : (st === 'running' ? 0 : (st === 'boarding' || st === 'loading' || st === 'ready' || st === 'unload' || st === 'dispatch' || st === 'arrive') ? 1 : 2);
    for (var i = 0; i < L.mats.length; i++) if (L.mats[i].emissive) L.mats[i].emissiveIntensity = i === on ? 1.8 : 0.12;
    if (L.beacon && L.beacon.emissive) L.beacon.emissiveIntensity = st === 'running' ? (Math.sin(performance.now() / 210) > 0 ? 1.9 : 0.25) : 0.3;
  }
  function pkRideTick(dt) {
    var R = PK.ride;
    pkOpSignal();
    // the gates and the restraints ease to where they were told to be
    PK.gates.forEach(function (gt) { gt.t += ((pkStnOpen() ? 1 : 0) - gt.t) * Math.min(1, dt * 4); gt.bar.rotation.z = gt.t * Math.PI / 2; });
    R.bars += (R.barsWant - R.bars) * Math.min(1, dt * 3);
    PK.cars.forEach(function (car) { car.userData.bars.forEach(function (b) { b.rotation.x = -1.3 * (1 - R.bars); }); });
    // once the operator has raised the restraints on a manual unload, the riders step off
    if (R.state === 'unload' && R.riders > 0 && R.barsWant < 0.5 && R.bars < 0.05) {
      PK.seats.forEach(function (s) { if (s.guest) pkUnseatGuest(s.guest); });
      hudDirty = true; screenDirtyAll();
    }
    // the turnstiles spin as they are passed: each guest adds a third of a turn, and three arms are identical, so the
    // arm group can be set back to zero once the whole turn is done without a visible snap
    PK.turnstiles.forEach(function (t) {
      if (t.spin > 0) {
        var step = Math.min(t.spin, dt * 6.0);
        t.spin -= step;
        t.arm.rotation.y -= step;
        if (t.spin <= 1e-4) { t.spin = 0; t.arm.rotation.y = 0; }
      }
    });
    if (!pkCoasterOpen()) { R.v = 0; pkPlaceTrain(); return; }
    if (R.fault) { R.v = 0; pkPlaceTrain(); return; }
    // the ride runs itself when AUTO is on (an operator hired switches it on; MANUAL is still the player's to choose)
    if (pkCoasterAuto() && !R.fault && S.coasterKey) {
      R.autoT -= dt;
      if (R.autoT <= 0) {
        R.autoT = 1.4;
        // AUTO asks before it acts, so it never trips a refusal: an empty train waits with its gates open and its bars up,
        // the bars come down once someone is aboard and seated (a full train at once, else after eight seconds of boarding),
        // and a train readied with nobody aboard is put back to boarding once, not flapped
        var walking = pkStillBoarding();
        if (R.state === 'unload' && (R.riders > 0 || R.barsWant > 0.5)) { if (!pkMainDuo()) R.barsWant = 0; }   // in DUO the platform operator lifts the restraints
        else if (R.state === 'idle' || R.state === 'unload') { if (!PK.closed && (S.wear || 0) < 90) { pkOpenGates(); R.loadT = 0; } }
        else if (R.state === 'loading') { R.loadT += 1.4; if (R.riders > 0 && !walking && (pkSeatsFull() || R.loadT > 8) && !pkMainDuo()) pkBarsDown(); }   // (DUO: the platform operator's)
        else if (R.state === 'ready') {
          if (R.riders === 0) { if (!pkMainDuo()) pkBarsUp(); R.loadT = 0; }
          else if ((S.wear || 0) >= 90) {
            // out of service: the riders get off rather than sit with the bars down, and the line stops refilling (pkQueueJoin)
            R.barsWant = 0; R.bars = 0;
            PK.gates.forEach(function (gt) { gt.open = true; });
            PK.seats.forEach(function (s) { if (s.guest) pkUnseatGuest(s.guest); });
            R.riders = 0; R.state = 'unload';
            logEvent('The coaster is out of service until it is serviced', 'bad'); sfx('bad'); toast('The coaster needs a service - press MAINT on the desk', 'bad');
          }
          else if (!walking && (!pkMainDuo() || pkMainPlatDispatchOk())) pkDispatch();
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
      R.v = Math.max(0.35, Math.min(pkSpeedAt(R.u), Math.sqrt(2 * 4 * d2 * PK.len)));
      R.u = (R.u + R.v * dt / PK.len) % 1;
      if (d2 * PK.len < 0.4) { R.u = PK.stationU; R.v = 0; pkArrive(); }
    }
    if (R.v > (PK.today.fast || 0)) PK.today.fast = R.v;   // the day's fastest run, shown on the status board
    pkPlaceTrain();
  }
  // ── Staff ─────────────────────────────────────────────────────────
  // one clerk; up to fifteen ride operators, who work the rides in shifts (part 26). S.operator stays true while any is hired
  var PK_OPS_MAX = 15;
  function pkOpCount() { return typeof S.operators === 'number' ? S.operators : (S.operator ? 1 : 0); }
  function pkWages() { return (S.clerk ? 40 : 0) + 60 * pkOpCount(); }
  function pkHire(which) {
    if (which !== 'clerk' && which !== 'operator') return 'No such role';
    var cost = which === 'clerk' ? 400 : 600;
    if (which === 'clerk' && S.clerk) return 'A clerk already works the window';
    if (which === 'operator' && pkOpCount() >= PK_OPS_MAX) return 'All ' + PK_OPS_MAX + ' operators already work the rides';
    if (S.bank < cost || S.bank < 0) { sfx('bad'); toast('Not enough money', 'bad'); return 'Not enough money'; }
    pay(-cost, which === 'clerk' ? 'Ticket clerk' : 'Ride operator');
    if (which === 'clerk') { S.clerk = true; PK.clerk = true; }
    else { S.operators = pkOpCount() + 1; S.operator = true; PK.operator = true; if (!S.auto) { S.auto = true; PK.ride.autoT = 0; } }   // the operators keep the coaster on AUTO
    sfx('cash'); logEvent((which === 'clerk' ? 'Ticket clerk' : 'Ride operator') + ' hired', 'good');
    screenDirtyAll(); hudDirty = true;
    return 'Hired';
  }
