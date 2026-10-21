//@ Park Co, part 13: the gardens - three plazas with food stalls, and the North Promenade: a flower clock, a bandstand, a windmill, a hedge maze and a picnic lawn
  // ── Why ──────────────────────────────────────────────────────────
  // A park is more than its rides. These are the places to stop: somewhere to eat where the streets cross, and a garden quarter at the
  // north end where the west and east spines meet. They are scenery - nothing here is staffed or sold - but they are solid, lit and lived in.
  var PK_PLAZAS = [{ x: -31, z: 3, r: 5.6 }, { x: 35, z: 3, r: 5.6 }, { x: 2, z: -44, r: 5.6 }];   // the two crossroads, and the Garden Walk's middle
  var PK_GARDEN = { clock: { x: 2, z: -60, r: 6.6 }, band: { x: 2, z: -73.5 }, maze: { x: 5, z: -86 }, mill: { x: 14, z: -70 } };
  var PK_SAILS = null, PK_CLOCK = null;
  PK_PLAZAS.forEach(function (p) { PK_KEEP.push([p.x, p.z, p.r + 1.5]); });
  PK_KEEP.push([2, -60, 8.5], [2, -73.5, 8.5], [5, -86, 11], [14, -70, 7], [2, -69, 5]);

  function pkFace(x, z, tx, tz) { return Math.atan2(tx - x, tz - z); }

  function pkGardensBuild() {
    PK_PLAZAS.forEach(pkPlaza);
    pkFlowerClock(); pkBandstand(); pkWindmill(); pkMaze(); pkPicnic();
  }

  // ── A food stall: counter, canopy, sign, a few goods ─────────────
  // faces local +z; the caller turns it toward the plaza
  function pkStall(x, z, ry, a, b, label) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
    pkBevelBox(2.6, 0.95, 0.75, M.cream, 0, 0.48, 0.5, g, 0.04);
    pkBevelBox(2.72, 0.08, 0.9, pkMatWoodRich(), 0, 1.0, 0.5, g, 0.02);
    pkBevelBox(2.6, 2.7, 0.14, M.cream, 0, 1.35, -0.35, g, 0.04);
    [-1.25, 1.25].forEach(function (px) { pkRoundCyl(0.05, 2.7, M.iron, px, 1.35, 0.95, g, 8); });
    var canopy = pkBevelBox(3.0, 0.1, 2.1, pkStripes(a, b), 0, 2.78, 0.35, g, 0.02); canopy.rotation.x = 0.16;
    pkBevelBox(3.0, 0.22, 0.1, pkStripes(b, a), 0, 2.52, 1.37, g, 0.02);
    sign([label], 2.1, 0.42, 0, 2.2, -0.26, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);
    for (var i = 0; i < 5; i++) {      // goods on the counter: cones, cups
      var cone = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 8), std({ color: [0xf0c04a, 0xe08fc0, 0xf2f2f2, 0xd94f4f, 0x8fd3c7][i], roughness: 0.6 }));
      cone.position.set(-0.9 + i * 0.45, 1.19, 0.5); cone.rotation.x = Math.PI; g.add(cone);
    }
    pkLocalSolid(g, -1.4, 1.4, -0.45, 0.95, 0, 2.7);
    return g;
  }
  // ── A crossroads plaza ───────────────────────────────────────────
  function pkPlaza(P) {
    var M = pkMats(), x = P.x, z = P.z, r = P.r;
    pkPavedDisc(r + 0.35, M.stoneDark, x, 0.0400, z, null, 1.6);
    pkPavedDisc(r, M.paversWarm, x, 0.0410, z, null, 1.4);
    pkPavedDisc(r * 0.42, M.stone, x, 0.0420, z, null, 1.2);
    pkPavedDisc(r * 0.30, M.paversWarm, x, 0.0430, z, null, 1.0);
    var defs = [[-1, -1, '#d94f4f', '#f4f4f0', 'ICE CREAM'], [1, -1, '#4f8fd9', '#f4f4f0', 'DRINKS'], [-1, 1, '#f0c04a', '#f4f4f0', 'PRETZELS'], [1, 1, '#5fa86a', '#f4f4f0', 'CHIPS']];
    defs.forEach(function (d) {
      var sx = x + d[0] * 4.3, sz = z + d[1] * 4.1;
      pkStall(sx, sz, pkFace(sx, sz, x, z), d[2], d[3], d[4]);
    });
    // benches on the open arcs between the stalls, and a lamp in each
    [[0, -1], [0, 1]].forEach(function (d) { /* the streets run through the middle; the arcs are the corners */ });
  }

  // ── The flower clock ─────────────────────────────────────────────
  // a planted dial laid on the promenade, with hands that tell the park's own time
  function pkFlowerClock() {
    var C = PK_GARDEN.clock, x = C.x, z = C.z, M = pkMats();
    var rings = [[C.r + 0.5, M.stoneDark, 0.0440], [C.r, std({ color: 0x4d7a3a, roughness: 0.95 }), 0.0450], [C.r * 0.86, std({ color: 0xd94f6a, roughness: 0.9 }), 0.0460],
      [C.r * 0.70, std({ color: 0xf3c84a, roughness: 0.9 }), 0.0470], [C.r * 0.56, std({ color: 0xf4f1e6, roughness: 0.9 }), 0.0480]];
    rings.forEach(function (rg) { pkPavedDisc(rg[0], rg[1], x, rg[2], z, null, 1.4); });
    for (var h = 0; h < 12; h++) {           // the hour marks
      var a = h / 12 * Math.PI * 2, rr = C.r * 0.63, tick = box(0.28, 0.03, h % 3 === 0 ? 1.1 : 0.6, M.iron, x + Math.sin(a) * rr, 0.052, z - Math.cos(a) * rr);
      tick.rotation.y = -a;
    }
    pkLathe([[0, 0], [0.5, 0], [0.5, 0.3], [0.2, 0.45], [0, 0.45]], M.gold, x, 0.05, z, null, 14);
    var hands = new THREE.Group(); hands.position.set(x, 0.09, z); hands.userData.dynamic = true; scene.add(hands);
    var hh = new THREE.Group(), mh = new THREE.Group(); hands.add(hh); hands.add(mh);
    var hb = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 2.6), M.iron); hb.position.z = -1.1; hh.add(hb);
    var mb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 3.8), M.gold); mb.position.z = -1.7; mb.position.y = 0.03; mh.add(mb);
    PK_CLOCK = { hour: hh, min: mh };
    [[-1, 0], [1, 0]].forEach(function (d) { pkLamp(x + d[0] * (C.r + 1.6), z + 3.4, 4.4); });
  }

  // ── The bandstand ────────────────────────────────────────────────
  function pkBandstand() {
    var B = PK_GARDEN.band, x = B.x, z = B.z, M = pkMats(), g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    pkPavedDisc(8.2, M.stoneDark, x, 0.040, z, null, 1.6); pkPavedDisc(7.8, M.paversWarm, x, 0.041, z, null, 1.4);
    var plat = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.6, 0.7, 8), M.stone); plat.position.y = 0.35; plat.castShadow = true; plat.receiveShadow = true; g.add(plat);
    var floor = new THREE.Mesh(new THREE.CylinderGeometry(4.1, 4.1, 0.06, 8), pkMatWoodRich()); floor.position.y = 0.72; floor.receiveShadow = true; g.add(floor);
    for (var i = 0; i < 8; i++) {
      var a = (i + 0.5) / 8 * Math.PI * 2, px = Math.sin(a) * 3.85, pz = Math.cos(a) * 3.85;
      pkRoundCyl(0.11, 3.4, M.white, px, 0.75 + 1.7, pz, g, 10);
      pkBevelBox(0.34, 0.14, 0.34, M.gold, px, 4.2, pz, g, 0.03);
      var a2 = (i + 1.5) / 8 * Math.PI * 2, qx = Math.sin(a2) * 3.85, qz = Math.cos(a2) * 3.85;
      if (i !== 3 && i !== 4) { pkRod(px, 1.55, pz, qx, 1.55, qz, 0.035, M.white, g, 6); pkRod(px, 1.15, pz, qx, 1.15, qz, 0.025, M.white, g, 6); }
    }
    var roof = new THREE.Mesh(new THREE.ConeGeometry(5.1, 2.1, 8), M.slateRed); roof.position.y = 4.3 + 1.05; roof.castShadow = true; g.add(roof);
    pkRoundCyl(0.05, 0.9, M.iron, 0, 6.8, 0, g, 6); sphere(0.14, M.gold, 0, 7.3, 0, g);
    pkBulbs((function () { var p = []; for (var k = 0; k < 16; k++) { var t = k / 16 * Math.PI * 2; p.push([Math.sin(t) * 4.95, 4.55, Math.cos(t) * 4.95]); } return p; })(), M.bulbWarm, 0.07, g);
    for (var s = 0; s < 3; s++) pkBevelBox(2.4, 0.2, 0.5, M.stone, 0, 0.1 + 0.0 + s * -0.0, 4.9 + s * 0.45, g, 0.03).position.y = 0.55 - s * 0.22;   // steps on the south (front) side
    for (var m = 0; m < 5; m++) {   // music stands
      pkRoundCyl(0.02, 0.9, M.iron, -1.6 + m * 0.8, 1.2, -0.8, g, 4);
      var st = pkBevelBox(0.4, 0.3, 0.03, M.white, -1.6 + m * 0.8, 1.7, -0.8, g, 0.01); st.rotation.x = -0.3;
    }
    solid(x - 4.5, x + 4.5, z - 4.5, z + 3.6, 0, 4.5);
    // benches ringed round the lawn, all facing the stage
    for (var b = 0; b < 7; b++) {
      var ba = (b / 7) * Math.PI * 1.15 + Math.PI * 0.42 + Math.PI, bx = x + Math.sin(ba) * 8.6, bz = z + Math.cos(ba) * 8.6;
      if (bz > z + 7.5) continue;
      pkBench(bx, bz, pkFace(bx, bz, x, z));
    }
  }

  // ── The windmill ─────────────────────────────────────────────────
  function pkWindmill() {
    var W = PK_GARDEN.mill, x = W.x, z = W.z, M = pkMats(), g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    var tower = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 3.0, 9.5, 12), M.cream); tower.position.y = 4.75; tower.castShadow = true; tower.receiveShadow = true; g.add(tower);
    var base = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.5, 1.1, 12), M.stoneDark); base.position.y = 0.55; g.add(base);
    var cap = new THREE.Mesh(new THREE.ConeGeometry(2.4, 2.4, 12), M.slate); cap.position.y = 10.7; cap.castShadow = true; g.add(cap);
    pkRod(0, 11.9, 0, 0, 13.0, 0, 0.05, M.iron, g, 6);
    pkBevelBox(1.3, 2.3, 0.3, pkMatWoodRich(), 0, 1.15 + 0.5, 2.85, g, 0.04);       // the door, facing the promenade (south)
    [[0, 5.2], [0, 7.8]].forEach(function (w) { pkWindow(g, w[0], w[1], 2.15, 0.7, 0.9, 0, M.white, M.pane); });
    var hub = new THREE.Group(); hub.position.set(0, 8.4, -2.4); hub.userData.dynamic = true; g.add(hub);      // the sails turn on the north face
    pkRoundCyl(0.35, 0.8, M.iron, 0, 0, 0.1, hub, 10).rotation.x = Math.PI / 2;
    for (var s = 0; s < 4; s++) {
      var arm = new THREE.Group(); arm.rotation.z = s * Math.PI / 2; hub.add(arm);
      var spar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 7.2, 0.14), pkMatWoodRich()); spar.position.y = 3.7; arm.add(spar);
      var cloth = new THREE.Mesh(new THREE.BoxGeometry(1.5, 5.6, 0.05), std({ color: 0xf2ead6, roughness: 0.9 })); cloth.position.set(0.85, 4.0, 0.06); arm.add(cloth);
      for (var l = 0; l < 6; l++) { var lat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.06), pkMatWoodRich()); lat.position.set(0.85, 1.4 + l * 0.9, 0.1); arm.add(lat); }
    }
    PK_SAILS = hub;
    solid(x - 3.4, x + 3.4, z - 3.4, z + 3.4, 0, 11);
    [[-4.2, 5.2], [4.2, 5.2]].forEach(function (p) { pkFlowerBed(x + p[0], z + p[1], 2.4, 1.2); });
  }

  // ── The hedge maze ───────────────────────────────────────────────
  // 5 x 5 cells, carved by a seeded depth-first walk, so every cell can be reached and the same maze stands every time.
  // The way in is on the south side, off the promenade; in the middle there is a fountain-topped plinth to reach.
  function pkMaze() {
    var Mz = PK_GARDEN.maze, N = 5, cs = 2.6, T = 0.85, H = 2.2, rng = pkRng(31337), M = pkMats();
    var ox = Mz.x - N * cs / 2, oz = Mz.z - N * cs / 2;
    var vis = [], right = [], down = [];   // right[r][c]: wall east of cell; down[r][c]: wall south of cell
    for (var r = 0; r < N; r++) { vis.push([]); right.push([]); down.push([]); for (var c = 0; c < N; c++) { vis[r].push(false); right[r].push(true); down[r].push(true); } }
    var stack = [[N - 1, 2]]; vis[N - 1][2] = true;
    while (stack.length) {
      var cur = stack[stack.length - 1], opts = [];
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function (d) { var nr = cur[0] + d[0], nc = cur[1] + d[1]; if (nr >= 0 && nr < N && nc >= 0 && nc < N && !vis[nr][nc]) opts.push([nr, nc, d]); });
      if (!opts.length) { stack.pop(); continue; }
      var pick = opts[Math.floor(rng() * opts.length)], d2 = pick[2];
      if (d2[0] === 1) down[cur[0]][cur[1]] = false; else if (d2[0] === -1) down[pick[0]][pick[1]] = false;
      else if (d2[1] === 1) right[cur[0]][cur[1]] = false; else right[pick[0]][pick[1]] = false;
      vis[pick[0]][pick[1]] = true; stack.push([pick[0], pick[1]]);
    }
    function wallH(r, c) { pkHedge(ox + (c + 0.5) * cs, oz + r * cs, cs + T, T, H); }     // along x, on the line above row r
    function wallV(r, c) { pkHedge(ox + c * cs, oz + (r + 0.5) * cs, T, cs + T, H); }     // along z, on the line left of column c
    for (var c2 = 0; c2 < N; c2++) wallH(0, c2);                       // north edge
    for (var c3 = 0; c3 < N; c3++) if (c3 !== 2) wallH(N, c3);         // south edge, with the way in at column 2
    for (var r2 = 0; r2 < N; r2++) { wallV(r2, 0); wallV(r2, N); }     // west and east edges
    for (var r3 = 0; r3 < N; r3++) for (var c4 = 0; c4 < N; c4++) {
      if (c4 < N - 1 && right[r3][c4]) wallV(r3, c4 + 1);
      if (r3 < N - 1 && down[r3][c4]) wallH(r3 + 1, c4);
    }
    // the prize: a plinth and a gilded ball, at the middle cell
    var mx = ox + 2.5 * cs, mz = oz + 2.5 * cs;
    pkBevelBox(0.9, 0.9, 0.9, M.stone, mx, 0.45, mz, null, 0.05); sphere(0.38, M.gold, mx, 1.3, mz);
    pkPavedDisc(1.1, M.paversWarm, mx, 0.041, mz, null, 1.0);
    // a sign at the way in
    var gx = ox + 2.5 * cs, gz = oz + N * cs;
    pkRoundCyl(0.05, 1.6, M.iron, gx + 1.9, 0.8, gz + 0.6, null, 6);
    pkSign3D(['THE HEDGE MAZE'], 1.9, 0.4, gx + 1.9, 1.7, gz + 0.62, 0, { bg: '#23493a', fg: '#f5e9c2' });
  }

  // ── The picnic lawn ──────────────────────────────────────────────
  function pkPicnic() {
    var M = pkMats();
    [[-10, -72, 0.2], [-5, -76.5, 0.1], [13.5, -84.5, 0], [15, -81, -0.1]].forEach(function (t) {
      var g = new THREE.Group(); g.position.set(t[0], 0, t[1]); g.rotation.y = t[2]; scene.add(g);
      pkBevelBox(2.2, 0.08, 0.9, pkMatWoodRich(), 0, 0.78, 0, g, 0.02);
      [-0.95, 0.95].forEach(function (lx) { var l = pkBevelBox(0.1, 0.78, 0.9, M.iron, lx, 0.39, 0, g, 0.02); });
      [-0.75, 0.75].forEach(function (bz) { pkBevelBox(2.2, 0.06, 0.34, pkMatWoodRich(), 0, 0.46, bz, g, 0.02); pkBevelBox(0.1, 0.46, 0.3, M.iron, -0.95, 0.23, bz, g, 0.02); pkBevelBox(0.1, 0.46, 0.3, M.iron, 0.95, 0.23, bz, g, 0.02); });
      var cloth = pkBevelBox(1.3, 0.02, 0.9, pkStripes('#d94f4f', '#f4f4f0'), 0, 0.84, 0, g, 0.005);
      pkLocalSolid(g, -1.2, 1.2, -1.1, 1.1, 0, 0.9);
    });
    // lamps and bins to serve the lawn
    [[-3, -76], [8, -76], [-3, -84], [8, -84]].forEach(function (p) { pkLamp(p[0], p[1], 4.4); });
    [[-12, -76], [16, -76]].forEach(function (p) { pkBin(p[0], p[1]); solid(p[0] - 0.4, p[0] + 0.4, p[1] - 0.4, p[1] + 0.4, 0, 1.0); });
  }

  // ── Life: the sails turn, the clock tells the park's time ────────
  function pkGardensTick(dt) {
    if (PK_SAILS) PK_SAILS.rotation.z -= dt * 0.35;
    if (PK_CLOCK && typeof S !== 'undefined' && S) {
      var hrs = S.time % 12, mins = (S.time * 60) % 60;
      PK_CLOCK.hour.rotation.y = -(hrs / 12) * Math.PI * 2;
      PK_CLOCK.min.rotation.y = -(mins / 60) * Math.PI * 2;
    }
  }
  var _pkGardensPrevTick = GAME.tick;
  GAME.tick = function (dt) { _pkGardensPrevTick(dt); pkGardensTick(dt); };
