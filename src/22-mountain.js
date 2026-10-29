//@ Park Co, part 22: The Mountain King - one big coaster that runs partly indoors and partly outdoors: a castle hall holds the station and a dark helix round the king; the lift bursts out through the north wall into a loop, a high turnaround and camelbacks, and the train dives back in through a low portal
  // ── Why ──────────────────────────────────────────────────────────
  // The park's one indoor/outdoor coaster, in the south-east corner the park takes in for it (the fence along z 30 east of
  // the car park moves out to z 71). You queue at the castle's west door, board in the half-light of the great hall, and the
  // chain lift carries you up and out through an opening high in the north wall into daylight, 20.5 m up. Then the drop into
  // a 14.9 m loop, a banked turnaround at the west end, camelbacks back east, a turn south onto the block brake, and in
  // through a low portal into the dark, where the train spirals down round the Mountain King on his throne, past glowing
  // crystals, onto the brakes and home. 269 m, 68 km/h, 53 s, at most 4.7 g (the bottom of the loop).
  // The circuit was laid offline in world x/z with the same kit and checks as the others: clear of itself (1.02 at the
  // closest, the helix's turns over each other), inside its ground, the station dead level, the portals where the track
  // crosses the wall (the lift at x 116, 9.2 m up; the return at x 102, 5.3 m up).
  var PK_MK = { x0: 86, x1: 120.5, z0: 40, z1: 69, H: 13, liftPortal: [114.4, 117.6, 6.8, 12.4], lowPortal: [100.2, 103.8, 3.6, 8.6],
    king: [98, 51], door: [63.2, 66.0], trim: [[102, 29], [102, 37], 7], park: [109.5, 64] };
  var PK_MK_PTS = [
    [98, 0.6, 64], [99.2, 0.6, 64], [100.4, 0.6, 64], [101.6, 0.6, 64], [102.8, 0.6, 64], [104, 0.6, 64],
    [105.2, 0.6, 64], [106.4, 0.6, 64], [107.6, 0.6, 64], [108.81, 0.6, 64], [110, 0.6, 64], [111.21, 0.6, 63.99],
    [112.39, 0.6, 63.8], [113.49, 0.6, 63.33], [114.45, 0.64, 62.62], [115.2, 0.8, 61.7], [115.71, 1.11, 60.66], [115.96, 1.54, 59.57],
    [116, 1.97, 58.46], [116, 2.41, 57.34], [116, 2.85, 56.22], [116, 3.29, 55.1], [116, 3.73, 53.98], [116, 4.16, 52.87],
    [116, 4.6, 51.75], [116, 5.04, 50.63], [116, 5.48, 49.51], [116, 5.92, 48.4], [116, 6.35, 47.28], [116, 6.79, 46.16],
    [116, 7.23, 45.04], [116, 7.67, 43.92], [116, 8.1, 42.81], [116, 8.54, 41.69], [116, 8.98, 40.57], [116, 9.42, 39.45],
    [116, 9.86, 38.34], [116, 10.29, 37.22], [116, 10.73, 36.1], [116, 11.17, 34.98], [116, 11.61, 33.86], [116, 12.04, 32.75],
    [116, 12.48, 31.63], [116, 12.92, 30.51], [116, 13.36, 29.39], [116, 13.79, 28.27], [116, 14.23, 27.16], [116, 14.67, 26.04],
    [116, 15.11, 24.92], [116, 15.55, 23.8], [116, 15.98, 22.68], [116, 16.42, 21.57], [116, 16.86, 20.45], [116, 17.3, 19.33],
    [116, 17.73, 18.21], [116, 18.17, 17.1], [116, 18.61, 15.98], [116, 19.05, 14.86], [116, 19.49, 13.74], [116, 19.93, 12.63],
    [116, 20.35, 11.5], [116, 20.49, 10.31], [116, 20.29, 9.14], [115.91, 19.75, 8.08], [115.68, 18.9, 7.26], [115.46, 17.85, 6.75],
    [115.27, 16.71, 6.41], [115.08, 15.57, 6.11], [114.86, 14.42, 5.83], [114.62, 13.28, 5.56], [114.37, 12.13, 5.31], [114.1, 10.98, 5.08],
    [113.81, 9.84, 4.87], [113.5, 8.69, 4.68], [113.14, 7.57, 4.49], [112.66, 6.49, 4.29], [112.04, 5.47, 4.11], [111.28, 4.55, 4.01],
    [110.41, 3.73, 4], [109.44, 3.01, 4], [108.4, 2.42, 4], [107.29, 1.96, 4], [106.14, 1.63, 4], [104.95, 1.45, 4],
    [103.76, 1.41, 4], [102.56, 1.51, 4], [101.39, 1.75, 4.01], [100.25, 2.13, 4.02], [99.17, 2.65, 4.04], [98.16, 3.31, 4.07],
    [97.25, 4.08, 4.09], [96.44, 4.97, 4.13], [95.77, 5.96, 4.17], [95.24, 7.04, 4.22], [94.88, 8.18, 4.28], [94.71, 9.37, 4.35],
    [94.74, 10.56, 4.44], [95, 11.73, 4.54], [95.5, 12.81, 4.66], [96.22, 13.75, 4.8], [97.17, 14.46, 4.98], [98.29, 14.85, 5.19],
    [99.46, 14.86, 5.41], [100.58, 14.48, 5.61], [101.53, 13.78, 5.79], [102.27, 12.85, 5.94], [102.77, 11.77, 6.06], [103.04, 10.61, 6.16],
    [103.08, 9.41, 6.24], [102.92, 8.22, 6.32], [102.56, 7.08, 6.38], [102.04, 6, 6.42], [101.38, 5.01, 6.47], [100.57, 4.12, 6.5],
    [99.66, 3.33, 6.53], [98.66, 2.68, 6.56], [97.58, 2.15, 6.58], [96.45, 1.76, 6.59], [95.27, 1.51, 6.6], [94.08, 1.41, 6.6],
    [92.88, 1.44, 6.6], [91.69, 1.63, 6.6], [90.54, 1.96, 6.6], [89.43, 2.42, 6.6], [88.39, 3.01, 6.6], [87.43, 3.73, 6.62],
    [86.57, 4.56, 6.73], [85.84, 5.48, 6.93], [85.23, 6.49, 7.18], [84.61, 7.46, 7.52], [83.94, 8.33, 8], [83.28, 9.09, 8.65],
    [82.68, 9.74, 9.46], [82.2, 10.26, 10.42], [81.89, 10.65, 11.51], [81.79, 10.9, 12.68], [81.79, 11, 13.88], [81.79, 10.95, 15.08],
    [81.82, 10.76, 16.26], [82.04, 10.43, 17.39], [82.44, 9.97, 18.42], [83.01, 9.42, 19.32], [83.73, 8.88, 20.11], [84.57, 8.33, 20.76],
    [85.52, 7.78, 21.25], [86.54, 7.24, 21.56], [87.6, 6.69, 21.69], [88.67, 6.15, 21.7], [89.78, 5.69, 21.7], [90.93, 5.35, 21.7],
    [92.11, 5.12, 21.7], [93.31, 5.01, 21.7], [94.5, 5.02, 21.7], [95.7, 5.1, 21.74], [96.88, 5.19, 21.96], [98, 5.27, 22.38],
    [99.03, 5.35, 22.98], [99.95, 5.44, 23.75], [100.72, 5.52, 24.66], [101.32, 5.6, 25.7], [101.74, 5.69, 26.82], [101.96, 5.77, 27.99],
    [102, 5.85, 29.19], [102, 5.94, 30.39], [102, 6, 31.59], [102, 5.95, 32.78], [102, 5.85, 33.98], [102, 5.74, 35.18],
    [102, 5.64, 36.37], [102, 5.53, 37.57], [102, 5.42, 38.76], [102, 5.32, 39.96], [102, 5.21, 41.16], [101.98, 5.11, 42.35],
    [101.7, 5, 43.51], [101.09, 4.9, 44.53], [100.21, 4.79, 45.33], [99.13, 4.69, 45.83], [97.95, 4.58, 46], [96.77, 4.48, 46.16],
    [95.65, 4.37, 46.59], [94.68, 4.27, 47.27], [93.89, 4.16, 48.17], [93.33, 4.06, 49.22], [93.05, 3.95, 50.38], [93.03, 3.85, 51.57],
    [93.31, 3.74, 52.73], [93.86, 3.64, 53.79], [94.64, 3.53, 54.7], [95.61, 3.43, 55.38], [96.72, 3.32, 55.83], [97.9, 3.22, 55.99],
    [99.08, 3.11, 55.88], [100.21, 3.01, 55.48], [101.21, 2.9, 54.83], [102.03, 2.8, 53.96], [102.61, 2.69, 52.92], [102.94, 2.59, 51.77],
    [102.98, 2.48, 50.58], [102.74, 2.38, 49.42], [102.23, 2.27, 48.34], [101.47, 2.17, 47.41], [100.53, 2.06, 46.69], [99.43, 1.96, 46.22],
    [98.26, 1.85, 46.01], [97.07, 1.75, 46.09], [95.93, 1.64, 46.45], [94.91, 1.53, 47.07], [94.07, 1.43, 47.92], [93.45, 1.32, 48.94],
    [93.09, 1.22, 50.07], [93, 1.11, 51.26], [93, 1.02, 52.46], [93, 0.98, 53.66], [93, 0.89, 54.86], [93, 0.79, 56.05],
    [93, 0.7, 57.25], [93, 0.61, 58.45], [93.05, 0.6, 59.65], [93.34, 0.6, 60.81], [93.91, 0.6, 61.86], [94.7, 0.6, 62.75],
    [95.69, 0.6, 63.43], [96.81, 0.6, 63.85]
  ];
  // ── The plot, the walk, the ground ───────────────────────────────
  (function () {
    PK_PLOTS.push({ id: 'mountain', name: 'The Mountain King', x: 103, z: 54, r: 17, q: [83.2, 64.6], qdx: -1, level: 21, pad: 0.02 });
    PK_THEME.mountain = { a: 0x4a5a86, b: 0xd8b04a, ground: 0x8a8a96, name: 'The Mountain King', noBunting: true, noDecor: true, portal: function (p, side, g) { pkMkPortal(p, side, g); } };
    PK_ROUTES.push([76, -6, 72.5, -6, 3.2, 'coaster'], [72.5, -6, 72.5, 64.6, 3.2, 'coaster'], [72.5, 64.6, 76.4, 64.6, 3.2, 'coaster']);
  })();

  // ── The hall ─────────────────────────────────────────────────────
  // a castle: rubble-stone walls with a darker plinth, the portals cut where the track runs through, a pitched slate roof, round
  // towers with spires at the corners, a stepped gable over the west door, battlements along the north wall where the lift
  // bursts out, and the name. Inside: a flagstone floor, a dark ceiling, the king on his throne in the helix, crystals.
  function pkMkWall(g, mat, x0, z0, x1, z1, H, holes, inMat, inSign) {
    // a wall along x (z0 === z1) or along z (x0 === x1), with rectangular holes [a0, a1, y0, y1] along its length. inMat, if
    // given, is a thin inside face on the inSign side (the hall's interior), so the outside stone does not light the inside
    var alongX = z0 === z1, a0 = alongX ? Math.min(x0, x1) : Math.min(z0, z1), a1 = alongX ? Math.max(x0, x1) : Math.max(z0, z1), T = 0.7;
    var cuts = [[a0, a0]].concat((holes || []).slice().sort(function (p, q) { return p[0] - q[0]; })).concat([[a1, a1]]);
    var piece = function (b0, b1, y0, y1) {
      if (b1 - b0 < 0.01 || y1 - y0 < 0.01) return;
      var m = (b0 + b1) / 2, L = b1 - b0;
      if (alongX) { box(L, y1 - y0, T, mat, m, (y0 + y1) / 2, z0, g); solid(b0, b1, z0 - T / 2, z0 + T / 2, y0, y1); }
      else { box(T, y1 - y0, L, mat, x0, (y0 + y1) / 2, m, g); solid(x0 - T / 2, x0 + T / 2, b0, b1, y0, y1); }
      if (inMat) { if (alongX) box(L, y1 - y0, 0.04, inMat, m, (y0 + y1) / 2, z0 + inSign * (T / 2 + 0.02), g); else box(0.04, y1 - y0, L, inMat, x0 + inSign * (T / 2 + 0.02), (y0 + y1) / 2, m, g); }
    };
    for (var i = 0; i < cuts.length - 1; i++) {
      piece(cuts[i][1], cuts[i + 1][0], 0, H);                          // the full-height run between holes
      var h = cuts[i + 1]; if (h.length === 4) { piece(h[0], h[1], 0, h[2]); piece(h[0], h[1], h[3], H); }   // under and over a hole
    }
  }
  function pkMkHall(g) {
    var K = PK_MK, M = pkFtM(), H = K.H, cx = (K.x0 + K.x1) / 2, cz = (K.z0 + K.z1) / 2, W = K.x1 - K.x0, D = K.z1 - K.z0;
    var stone = std({ color: 0x8f8a80, roughness: 0.95, map: pkMats().stone.map }), dark = std({ color: 0x5f5a54, roughness: 0.95 });
    // walls: the lift's portal and the low portal in the north wall, the west door, a blank south and east
    var inner = std({ color: 0x34302c, roughness: 0.97, map: pkMats().stone.map });
    pkMkWall(g, stone, K.x0, K.z0, K.x1, K.z0, H, [K.liftPortal, K.lowPortal], inner, 1);
    pkMkWall(g, stone, K.x0, K.z1, K.x1, K.z1, H, [], inner, -1);
    pkMkWall(g, stone, K.x1, K.z0, K.x1, K.z1, H, [], inner, -1);
    pkMkWall(g, stone, K.x0, K.z0, K.x0, K.z1, H, [[K.door[0], K.door[1], 0, 3.1]], inner, 1);
    // a darker plinth band and a string course outside
    [[cx, K.z0 - 0.4, W + 0.2, 0.1], [cx, K.z1 + 0.4, W + 0.2, 0.1]].forEach(function (b) { box(b[2], 1.0, b[3], dark, b[0], 0.5, b[1], g); box(b[2], 0.25, b[3] + 0.06, dark, b[0], 7.5, b[1], g); });
    [[K.x0 - 0.4, cz], [K.x1 + 0.4, cz]].forEach(function (b) { box(0.1, 1.0, D + 0.2, dark, b[0], 0.5, b[1], g); box(0.16, 0.25, D + 0.2, dark, b[0], 7.5, b[1], g); });
    // portal arches: a dressed-stone frame round each opening in the north wall
    [K.liftPortal, K.lowPortal].forEach(function (p) {
      var w = p[1] - p[0], m = (p[0] + p[1]) / 2;
      box(w + 1.0, 0.6, 0.9, dark, m, p[3] + 0.3, K.z0, g);
      [p[0] - 0.25, p[1] + 0.25].forEach(function (x) { box(0.5, p[3] - p[2] + 0.6, 0.9, dark, x, (p[2] + p[3]) / 2, K.z0, g); });
    });
    // battlements along the north wall
    for (var bx = K.x0 + 0.6; bx < K.x1 - 0.4; bx += 1.6) box(0.8, 0.9, 0.8, stone, bx, H + 0.45, K.z0, g);
    // the roof: a pitched slate roof over the whole hall, ridge along x
    pkGableRoof(W + 1.0, D + 1.0, 5.0, M.slate, stone, cx, H, cz, g, 0.4);
    // round towers with spires at the four corners, the north-east one tallest
    [[K.x0, K.z0, 2.2, H + 4], [K.x1, K.z0, 2.6, H + 7], [K.x0, K.z1, 2.2, H + 3], [K.x1, K.z1, 2.2, H + 3]].forEach(function (t) {
      pkRoundCyl(t[2], t[3], stone, t[0], t[3] / 2, t[1], g, 18);
      solid(t[0] - t[2], t[0] + t[2], t[1] - t[2], t[1] + t[2], 0, t[3]);
      pkRoundCyl(t[2] + 0.2, 0.4, dark, t[0], t[3], t[1], g, 18);
      for (var k = 0; k < 3; k++) box(0.34, 1.1, 0.12, M.glass, t[0] + Math.cos(k * 2.1) * (t[2] - 0.02), t[3] * (0.45 + k * 0.15), t[1] + Math.sin(k * 2.1) * (t[2] - 0.02), g).rotation.y = -k * 2.1 + Math.PI / 2;
      pkFtSpire(g, t[0], t[3] + 0.2, t[1], t[2] + 0.6, t[2] * 3 + 2, M.slate, 12);
    });
    // the west front: a stepped gable over the door, the name, lanterns
    var gg = new THREE.Group(); gg.position.set(K.x0 - 0.05, H, (K.door[0] + K.door[1]) / 2 - 4); gg.rotation.y = -Math.PI / 2; g.add(gg);
    [[11, 1.4], [8.4, 1.4], [5.8, 1.4], [3.2, 1.3]].reduce(function (y, s) { box(s[0], s[1], 0.7, stone, 0, y + s[1] / 2, 0, gg); box(s[0] + 0.3, 0.14, 0.86, dark, 0, y + s[1], 0, gg); return y + s[1]; }, 0);
    var ro = pkRoundCyl(1.0, 0.2, M.glass, 0, 2.6, -0.38, gg, 24); ro.rotation.x = Math.PI / 2;
    // the door: a stone arch, iron-studded doors stood open, two lanterns
    var dz = (K.door[0] + K.door[1]) / 2, dw = K.door[1] - K.door[0];
    box(1.0, 0.6, dw + 1.2, dark, K.x0 - 0.1, 3.4, dz, g);
    var iron = std({ color: 0x23272b, roughness: 0.5, metalness: 0.5 });
    [K.door[0] - 0.35, K.door[1] + 0.35].forEach(function (z, k) {
      var s = k ? 1 : -1;
      box(1.0, 3.4, 0.6, dark, K.x0 - 0.1, 1.7, z, g);
      // the door leaf, folded back flat against the inside of the wall beside the opening: iron-studded oak in iron straps
      var lz = z + s * (0.3 + dw / 4);
      box(0.1, 3.0, dw / 2, M.wood, K.x0 + 0.42, 1.5, lz, g);
      [0.5, 1.5, 2.5].forEach(function (y) { box(0.04, 0.12, dw / 2, iron, K.x0 + 0.49, y, lz, g); });
      // a lantern on an iron bracket each side of the door, facing out
      pkRod(K.x0 - 0.6, 2.85, z, K.x0 - 1.0, 2.85, z, 0.03, iron, g, 6);
      box(0.3, 0.06, 0.3, iron, K.x0 - 1.0, 2.8, z, g);
      var lg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.34, 0.22), std({ color: 0xe8cf98, roughness: 0.25, emissive: 0xffc070, emissiveIntensity: 1.1 })); lg.position.set(K.x0 - 1.0, 2.6, z); g.add(lg);
      var cap = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.22, 4), iron); cap.rotation.y = Math.PI / 4; cap.position.set(K.x0 - 1.0, 2.88, z); g.add(cap);
      box(0.28, 0.04, 0.28, iron, K.x0 - 1.0, 2.42, z, g);
    });
  }
  // inside: the floor, the ceiling, the king in the helix, crystals along the walls, low light
  function pkMkInside(g) {
    var K = PK_MK, cx = (K.x0 + K.x1) / 2, cz = (K.z0 + K.z1) / 2, W = K.x1 - K.x0, D = K.z1 - K.z0;
    pkPaved(W - 0.7, D - 0.7, std({ color: 0x3e3a35, roughness: 0.95, map: pkMats().stone.map }), cx, 0.03, cz, 1.6, g);
    var ceil = box(W - 0.7, 0.12, D - 0.7, std({ color: 0x1c1d26, roughness: 0.95 }), cx, K.H - 0.06, cz, g); ceil.castShadow = false;
    // the king: a throne on a rock, a robed figure, a gold crown, a glowing staff. Inside the helix (rail at 5 m round him)
    var kx = K.king[0], kz = K.king[1], rock = std({ color: 0x4a4650, roughness: 0.95 }), robe = std({ color: 0x5a2a6a, roughness: 0.8 }), gold = pkFtM().gold;
    pkRoundCyl(3.0, 1.0, rock, kx, 0.5, kz, g, 9); pkRoundCyl(2.4, 1.0, rock, kx, 1.5, kz, g, 8);
    pkBevelBox(2.4, 3.2, 0.5, std({ color: 0x3a2a20, roughness: 0.8 }), kx, 3.6, kz - 0.9, g, 0.1);                // the throne's back
    pkBevelBox(2.0, 0.5, 1.6, std({ color: 0x3a2a20, roughness: 0.8 }), kx, 2.25, kz - 0.2, g, 0.08);
    pkRoundCyl(0.95, 2.0, robe, kx, 3.4, kz - 0.2, g, 14);                                                      // the robed body
    sphere(0.6, std({ color: 0xc9a07a, roughness: 0.8 }), kx, 4.9, kz - 0.1, g);                               // the head
    sphere(0.55, std({ color: 0xe8e4dc, roughness: 0.9 }), kx, 4.55, kz + 0.25, g);                            // the beard
    pkRoundCyl(0.62, 0.35, gold, kx, 5.45, kz - 0.1, g, 10);
    for (var c = 0; c < 6; c++) { var a = c / 6 * Math.PI * 2; var sp = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.4, 4), gold); sp.position.set(kx + Math.cos(a) * 0.55, 5.8, kz - 0.1 + Math.sin(a) * 0.55); g.add(sp); }
    pkRoundCyl(0.06, 4.2, gold, kx + 1.1, 3.4, kz + 0.2, g, 8);
    sphere(0.3, std({ color: 0x9fe0ff, emissive: 0x6fc8ff, emissiveIntensity: 1.6, roughness: 0.2 }), kx + 1.1, 5.6, kz + 0.2, g);
    var kl = new THREE.PointLight(0x9fd8ff, 1.0, 14, 2); kl.position.set(kx + 1.1, 6.2, kz + 0.2); g.add(kl);
    // crystals in clusters along the walls, glowing
    var cry = [std({ color: 0x7ad0ff, emissive: 0x3aa0ff, emissiveIntensity: 1.1, roughness: 0.2, transparent: true, opacity: 0.85 }),
      std({ color: 0xc07aff, emissive: 0x8a3aff, emissiveIntensity: 1.1, roughness: 0.2, transparent: true, opacity: 0.85 })];
    var rng = pkRng(2211);
    [[87.2, 44], [87.2, 52], [88, 60], [94, 41.2], [108, 41.2], [119.3, 47], [119.3, 55], [106, 58]].forEach(function (p, i) {
      for (var k = 0; k < 4; k++) {
        var cr = new THREE.Mesh(new THREE.ConeGeometry(0.25 + rng() * 0.25, 1.2 + rng() * 1.6, 5), cry[(i + k) % 2]);
        cr.position.set(p[0] + (rng() - 0.5) * 1.2, 0.6 + rng() * 0.4, p[1] + (rng() - 0.5) * 1.2); cr.rotation.set((rng() - 0.5) * 0.6, rng() * 3, (rng() - 0.5) * 0.6); g.add(cr);
      }
    });
    [[92, 60], [110, 50], [96, 44]].forEach(function (p) { var l = new THREE.PointLight(0xb08aff, 0.6, 12, 2); l.position.set(p[0], 3, p[1]); g.add(l); });
    // the station is lit warmer
    [100, 105, 110].forEach(function (x) { var l = new THREE.PointLight(0xffe3b0, 0.8, 10, 2); l.position.set(x, 3.2, 66); g.add(l); });
  }

  // ── The way in: the castle's barbican over the head of the line ───────────────────────────────────────────────
  // Two stone piers on dark plinths, a true round arch in dressed voussoirs with a keystone carrying the crown, a
  // crenellated parapet with the king's crown on it, the name carved on a timber board under the parapet, a banner of the
  // king hung either side, and iron torch brackets on the piers. It stands where the stock gateway stood, the lane passing
  // under it, facing the midway.
  function pkMkBanner() {
    return tex(128, 256, function (c, W, H) {
      c.fillStyle = '#2c3f6e'; c.fillRect(0, 0, W, H - 30);
      c.beginPath(); c.moveTo(0, H - 30); c.lineTo(W / 2, H); c.lineTo(W, H - 30); c.fill();
      c.strokeStyle = '#d8b04a'; c.lineWidth = 6; c.strokeRect(8, 8, W - 16, H - 52);
      c.fillStyle = '#d8b04a'; c.beginPath(); c.moveTo(28, 150); c.lineTo(28, 96); c.lineTo(46, 122); c.lineTo(64, 86); c.lineTo(82, 122); c.lineTo(100, 96); c.lineTo(100, 150); c.closePath(); c.fill();
      c.fillRect(28, 150, 72, 14); [46, 64, 82].forEach(function (x) { c.fillStyle = '#b8323a'; c.beginPath(); c.arc(x, 157, 4, 0, 6.283); c.fill(); });
    });
  }
  function pkMkPortal(p, side, parent) {
    var M = pkFtM(), g = new THREE.Group(); g.position.set(p.q[0], 0, p.q[1]); g.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2; parent.add(g);
    var stone = std({ color: 0x8f8a80, roughness: 0.95, map: pkMats().stone.map }), dark = std({ color: 0x5f5a54, roughness: 0.95 }), gold = pkMats().gold;
    var iron = std({ color: 0x23272b, roughness: 0.5, metalness: 0.5 }), oak = std({ color: 0x3a2617, roughness: 0.8 });
    var R = 2.0, PH = 3.6, D = 1.2;                  // the arch's radius, the height it springs from, the piers' depth
    // the piers: a plinth, the shaft, a moulded impost where the arch springs
    [-1, 1].forEach(function (s) {
      var px = s * (R + 0.6);
      pkBevelBox(1.5, 0.9, D + 0.3, dark, px, 0.45, 0, g, 0.04);
      pkBevelBox(1.2, PH - 0.9, D, stone, px, 0.9 + (PH - 0.9) / 2, 0, g, 0.03);
      pkBevelBox(1.4, 0.25, D + 0.2, dark, px, PH, 0, g, 0.03);
      // a torch on an iron bracket, facing out to the midway
      pkRod(px - s * 0.0, 2.5, D / 2, px, 2.75, D / 2 + 0.4, 0.03, iron, g, 6);
      pkRoundCyl(0.09, 0.3, iron, px, 2.85, D / 2 + 0.42, g, 8);
      pkRoundCyl(0.16, 0.12, iron, px, 3.04, D / 2 + 0.42, g, 10);   // the torch's iron cup
      // the flame is fire, not a lamp: it burns by day too (a glow lamp goes black when the park's lights are off)
      var fl = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.6, 10), new THREE.MeshBasicMaterial({ color: 0xff8a2a })); fl.position.set(px, 3.4, D / 2 + 0.42); fl.userData.noBake = true; g.add(fl);
      var fl2 = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.4, 8), new THREE.MeshBasicMaterial({ color: 0xffe08a })); fl2.position.set(px, 3.3, D / 2 + 0.47); fl2.userData.noBake = true; g.add(fl2);
    });
    // the arch: a band of voussoirs (cut from one shape, a half ring) and the wall over it up to the parapet
    var ring = new THREE.Shape(); ring.absarc(0, 0, R + 0.55, 0, Math.PI, false); ring.lineTo(-R, 0); ring.absarc(0, 0, R, Math.PI, 0, true); ring.closePath();
    var arch = new THREE.Mesh(new THREE.ExtrudeGeometry(ring, { depth: D, bevelEnabled: false, curveSegments: 20 }), stone); arch.position.set(0, PH, -D / 2); arch.castShadow = true; g.add(arch);
    for (var v = 1; v < 9; v++) { var va = v / 9 * Math.PI, jx = Math.cos(va), jy = Math.sin(va); var jt = box(0.04, 0.58, D + 0.02, dark, jx * (R + 0.27), PH + jy * (R + 0.27), 0, g); jt.rotation.z = va - Math.PI / 2; }
    var spandrel = new THREE.Shape(); spandrel.moveTo(-(R + 1.2), 0); spandrel.lineTo(-(R + 1.2), R + 1.2); spandrel.lineTo(R + 1.2, R + 1.2); spandrel.lineTo(R + 1.2, 0); spandrel.lineTo(R + 0.55, 0); spandrel.absarc(0, 0, R + 0.55, 0, Math.PI, false); spandrel.closePath();
    var sp = new THREE.Mesh(new THREE.ExtrudeGeometry(spandrel, { depth: D - 0.1, bevelEnabled: false, curveSegments: 20 }), stone); sp.position.set(0, PH, -(D - 0.1) / 2); sp.castShadow = true; g.add(sp);
    // the keystone with the crown on it
    pkBevelBox(0.6, 0.8, D + 0.12, dark, 0, PH + R + 0.3, 0, g, 0.04);
    var kc = new THREE.Shape(); kc.moveTo(-0.22, 0); kc.lineTo(-0.22, 0.22); kc.lineTo(-0.11, 0.12); kc.lineTo(0, 0.28); kc.lineTo(0.11, 0.12); kc.lineTo(0.22, 0.22); kc.lineTo(0.22, 0); kc.closePath();
    var kcm = new THREE.Mesh(new THREE.ExtrudeGeometry(kc, { depth: 0.05, bevelEnabled: false }), gold); kcm.position.set(0, PH + R + 0.2, D / 2 + 0.07); g.add(kcm);
    // the string course, the parapet and its merlons, the king's crown standing on it
    var top = PH + R + 1.2;
    pkBevelBox(2 * (R + 1.2) + 0.3, 0.22, D + 0.25, dark, 0, top + 0.11, 0, g, 0.03);
    pkBevelBox(2 * (R + 1.2), 0.5, D, stone, 0, top + 0.47, 0, g, 0.02);
    for (var m = -2; m <= 2; m++) pkBevelBox(0.7, 0.6, D, stone, m * 1.3, top + 1.0, 0, g, 0.03);
    var crown = new THREE.Group(); crown.position.set(0, top + 1.32, 0); g.add(crown);
    pkRoundCyl(0.55, 0.28, gold, 0, 0.14, 0, crown, 16);
    for (var cp = 0; cp < 5; cp++) { var ca = cp / 5 * Math.PI * 2; var pt = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.42, 6), gold); pt.position.set(Math.cos(ca) * 0.45, 0.48, Math.sin(ca) * 0.45); crown.add(pt); sphere(0.06, std({ color: 0xb8323a, roughness: 0.3, metalness: 0.2 }), Math.cos(ca) * 0.45, 0.72, Math.sin(ca) * 0.45, crown); }
    // the name, carved into a timber board under the string course, gilt-edged
    pkBevelBox(4.4, 0.78, 0.12, oak, 0, top - 0.55, D / 2 + 0.06, g, 0.03);
    box(4.5, 0.05, 0.14, gold, 0, top - 0.14, D / 2 + 0.06, g); box(4.5, 0.05, 0.14, gold, 0, top - 0.96, D / 2 + 0.06, g);
    pkSign3D(['THE MOUNTAIN KING'], 4.1, 0.56, 0, top - 0.55, D / 2 + 0.13, 0, { bg: '#2a1d14', fg: '#f0c04a' }, g);
    // the king's banners, hung from iron poles off the parapet either side of the arch
    var bmat = std({ map: pkMkBanner(), roughness: 0.85, side: THREE.DoubleSide });
    [-1, 1].forEach(function (s) {
      var bx = s * (R + 0.6);
      pkRod(bx, top + 0.3, D / 2 - 0.1, bx, top + 0.3, D / 2 + 0.55, 0.035, iron, g, 6);
      var ban = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.9), bmat); ban.position.set(bx, top - 0.68, D / 2 + 0.56); g.add(ban);
      sphere(0.06, gold, bx, top + 0.3, D / 2 + 0.58, g);
    });
    // the passage back to the castle: the barbican's side walls run back to the hall's west wall, under a ceiling and a
    // slate roof, so it reads as the castle's gatehouse rather than an arch stood in front of it
    var back = Math.abs(PK_MK.x0 - 0.35 - p.q[0]) - D / 2, bz = -(D / 2 + back / 2);
    if (back > 0.2) {
      [-1, 1].forEach(function (s) { box(1.2, top, back + 0.05, stone, s * (R + 0.6), top / 2, bz, g); box(1.5, 0.9, back + 0.05, dark, s * (R + 0.6), 0.45, bz, g); });
      box(2 * R + 0.1, 0.25, back + 0.1, dark, 0, PH + R + 0.12, bz, g);                    // the passage's ceiling
      box(2 * R + 1.2, 0.04, back + D + 0.1, pkMats().pavers, 0, 0.022, -back / 2, g);        // and its floor, paved through to the door
      box(2 * (R + 1.2), top - (PH + R + 0.25), back + 0.05, stone, 0, (top + PH + R + 0.25) / 2, bz, g);
      pkGableRoof(2 * (R + 1.2) + 0.2, back + 0.3, 1.2, M.slate, stone, 0, top + 0.72, bz, g, 0.2);
    }
    // the piers stop the player, as the stock gateway's posts did
    g.updateMatrixWorld(true);
    [-1, 1].forEach(function (s) { var w = g.localToWorld(new THREE.Vector3(s * (R + 0.6), 0, 0)); solid(w.x - 0.75, w.x + 0.75, w.z - 0.75, w.z + 0.75, 0, PH); });
    return g;
  }
  // ── The coaster ──────────────────────────────────────────────────
  function pkBuildMountain(p) {
    var K = PK_MK, th = PK_THEME.mountain, i;
    var g = new THREE.Group(); scene.add(g);
    pkMkHall(g); pkMkInside(g);
    var curve = pkCoCurve(PK_MK_PTS), len = curve.getLength(), uP = pkCoUAt(curve, K.park[0], K.park[1]);
    var opt = { rollIn: 12, trim: [[pkCoUAt(curve, K.trim[0][0], K.trim[0][1]), pkCoUAt(curve, K.trim[1][0], K.trim[1][1]), K.trim[2]]] };
    var F = pkCoFrames(curve, 1000, pkCoProfile(curve, len, uP, opt), uP);
    var E = { curve: curve, len: len, F: F, gap: 2.35, cars: [], uPark: uP, uOfF: [], run: 53 };
    pkCoLevel(F, curve, E.uPark, 4 * 2.35 + 1.4, 1.4);
    var seats = [], cols = [0x4a5a86, 0xd8b04a, 0x4a5a86, 0xd8b04a, 0x4a5a86];
    for (i = 0; i < 5; i++) {
      var car = pkCoCar(cols[i]); scene.add(car.g); E.cars.push(car);
      car.seats.forEach(function (s) { seats.push({ par: car.g, x: s.x, y: s.y, z: s.z, ry: 0, guest: null }); });
    }
    pkCoTrackBuild(g, E, {
      spineMat: std({ color: 0x4a5a86, roughness: 0.45, metalness: 0.3 }), supMat: std({ color: 0x3a3a44, roughness: 0.6, metalness: 0.25 }),
      tieMat: std({ color: 0x2a2a30, roughness: 0.75 }),
      skip: function (x, z) { return z > 62.5 && x > 95 && x < 120; }                 // the platform and the cabin
    });
    pkCoPlan(E, opt);
    // the platform south of the station track, the gates, the canopy lamps
    pkCoPlatform(g, 96.4, 111.4, 64.75, 67.6, th, 0.6, [true, false]);   // the east end leads to the cabin: kept clear
    var a = pkAttr({
      id: 'mountain', name: 'The Mountain King', x: p.x, z: p.z, qx: p.q[0], qz: p.q[1], qdx: -1, g: g, seats: seats,
      board: 11, run: E.run, unload: 6, exit: [97.2, 67.2],
      extra: E, tickRun: function (at) { pkCoRun(at); }
    });
    var C = pkCtl(a);
    E.a = a;
    var gx = []; for (i = 0; i < 5; i++) gx.push(K.park[0] - i * 2.35);
    pkCoGates(g, gx, 64.8, C, 0.6);
    E.cars.forEach(function (c) { C.barObjs.push(function (b) { c.bar.rotation.x = -1.35 * (1 - b); }); });
    pkCoPlace(E, E.uPark);
    // the control cabin at the platform's east end, its long window over the station turn
    // the cabin stands level with the platform (0.6), on a stone base, and the step between them is filled in level
    pkCabinBuild(g, a, { s: 1, AX: 0, K: { u0: 112.2, u1: 117.8, z0: 65.0, z1: 68.4, door: [65.9, 66.95] }, trim: 0x3a3a44, band: 0x4a5a86, name: 'The Mountain King', sign: '#f6e2a6', H: 2.9, y: 0.48 });
    box(0.9, 0.6, 2.85, pkMats().kerb, 111.8, 0.3, 66.175, g); box(0.86, 0.04, 2.8, pkMats().pavers, 111.8, 0.6, 66.175, g);
    PK_FLOOR_RECTS.push({ axis: 'z', x0: 111.3, x1: 112.3, z0: 64.75, z1: 67.6, y: 0.6 });
    return a;
  }
  var _pkBuildAttractionsMK = pkBuildAttractions;
  pkBuildAttractions = function () {
    PK_PLOTS.forEach(function (p) {
      if (p.id !== 'mountain') return;
      var a = pkBuildMountain(p);
      a.level = p.level; a.plot = p; a.open = pkRideSavedOpen(p.id);
      if (S.rides) S.rides[p.id] = a.open;
    });
    _pkBuildAttractionsMK();
  };
