//@ Park Co, part 33: the Lindenburg Arena - a park show in the manner of the Efteling's Raveleijn. A covered grandstand of six
  // stepped rows (sixty seats) looks across a sand arena at the front of a walled city: a great gatehouse with a curtain in
  // its arch and doors behind it, two towers, a clock tower, gabled houses, braziers, and a moat at the city's foot. The
  // control room sits at the top of the grandstand, behind the back row, glazed toward the arena. Five riders on horseback,
  // the Keeper on the gatehouse balcony, Count Grimwald rising from the moat with his guards, and a five-headed hydra that
  // comes up behind the wall: "The Five Riders of Lindenburg", five minutes long.
  // The ride system (part 05) runs the queue, the seats, AUTO and MANUAL; this part is the building, the desk and the show.

  // ── The site ─────────────────────────────────────────────────────
  // Everything is laid out from the arena's centre (CX, CZ): the city is at -z, the grandstand at +z, the forecourt and
  // the queue east of the grandstand, where the Dark Woods street (z -40) comes in from the spine at x -31.
  var PK_TH = { CX: -97, CZ: -68 };
  PK_PARK.x0 = Math.min(PK_PARK.x0, -132);   // a whole number of route cells (0.6 m) west of -72: the grid keeps its lattice
  PK_PLOTS.push({ id: 'theater', name: 'The Lindenburg Arena', x: PK_TH.CX, z: PK_TH.CZ, r: 30, q: [PK_TH.CX + 21.4, PK_TH.CZ + 18.1], level: 24 });
  PK_ROUTES.push([-31, -40, PK_TH.CX + 23, -40, 4.2, 'dark']);
  PK_KEEP.push([PK_TH.CX - 1, PK_TH.CZ, 44]);
  PK_CAB_RIDES.push(['theater', 'LINDENBURG ARENA']);

  // ── The grandstand's floor: six rows, the walkway behind the back row, the control room a step above it ──────────
  var PK_THG = { x: 14.6, z0: 10, row: 1.15, rows: 6, h0: 0.3, rise: 0.45, back: 21.4, booth: 3.6 };
  // the stair hall (part 37) beside the stand: a lobby at ground level, the stair along its west side, the landing at the
  // height of the stand's top walkway
  var PK_TH_HALL = { x1: 20.4, z0: 9.8, sx1: 17.6, s0: 12.6, s1: 18.0 };
  function pkTheaterFloorAt(x, z) {
    var G = PK_THG, lx = x - PK_TH.CX, lz = z - PK_TH.CZ, HL = PK_TH_HALL, top = G.h0 + G.rise * (G.rows - 1);
    if (lx > G.x && lx < HL.x1 && lz > HL.z0 && lz < G.back) {
      if (lz >= HL.s1) return top;
      if (lx < HL.sx1 && lz >= HL.s0) return top * (lz - HL.s0) / (HL.s1 - HL.s0);
      return null;
    }
    if (lx < -G.x || lx > G.x || lz < G.z0 || lz > G.back) return null;
    var k = Math.floor((lz - G.z0) / G.row);
    if (k >= G.rows) return G.h0 + G.rise * (Math.abs(lx) < G.booth ? G.rows : G.rows - 1);
    return G.h0 + G.rise * k;
  }
  var _pkThPrevFloor = pkFloor;   // the guests' floor and the player's (GAME.floorY reads pkFloor)
  pkFloor = function (x, z) { var h = pkTheaterFloorAt(x, z); return h === null ? _pkThPrevFloor(x, z) : h; };

  // ── Materials ────────────────────────────────────────────────────
  var PK_TH_M = null, PK_TH_WHITE = null;
  // a lit surface the show drives itself: the emissive map keeps it out of the park-lights sweep, which would zero it by day
  function pkThGlow(col, k, base) {
    if (!PK_TH_WHITE) PK_TH_WHITE = tex(4, 4, function (c) { c.fillStyle = '#fff'; c.fillRect(0, 0, 4, 4); });
    return std({ color: base === undefined ? 0x1a1410 : base, emissive: col, emissiveMap: PK_TH_WHITE, emissiveIntensity: k, roughness: 0.6, side: THREE.DoubleSide });
  }
  function pkThM() {
    if (PK_TH_M) return PK_TH_M;
    var M = pkMats();
    PK_TH_M = {
      stone: pkMatStone(), brick: pkMatBrick(), wood: pkMatWoodRich(), cream: M.cream, stoneDark: M.stoneDark, iron: M.iron,
      gold: M.gold, slate: M.slate, water: M.water, glass: M.glass,
      pave: pkPadMat(0xa89a84), sand: std({ map: TEX.plaster, color: 0xd6bd8e, roughness: 1 }),
      sandDark: std({ map: TEX.plaster, color: 0xc2a575, roughness: 1 }), sandPale: std({ map: TEX.plaster, color: 0xe5d0a7, roughness: 1 }),
      straw: std({ color: 0xd9bf7a, roughness: 0.95 }), timber: std({ color: 0x5a4028, roughness: 0.85 }),
      waterDeep: std({ map: M.water.map, color: 0x6f9f96, roughness: 0.12, metalness: 0.1, emissive: 0x0a2420, emissiveIntensity: 0.35 }),
      coal: pkThGlow(0xff6a1a, 0.5, 0x2a0a04), flame: pkThGlow(0xff8a2a, 1.6, 0x2a0a04), lampGlow: pkThGlow(0xffd9a0, 1.0),
      conc: std({ map: TEX.plaster, color: 0x9d968a, roughness: 0.95 }), nosing: std({ color: 0xe0b23a, roughness: 0.6 }),
      pink: std({ map: TEX.plaster, color: 0xe7c3b0, roughness: 0.88 }), blue: std({ map: TEX.plaster, color: 0xc9d6dc, roughness: 0.88 }),
      cloth: std({ color: 0x7a1f2b, roughness: 0.85, side: THREE.DoubleSide }), fold: std({ color: 0x5a1520, roughness: 0.9 }), lino: std({ color: 0x2b3036, roughness: 0.85 }),
      win: pkThGlow(0xffc46a, 0.15, 0x2a2018),
      // market stall canopies: striped awning cloth in the five riders' colours
      awningRed: pkStripes(0xd9472b, 0xf1e6cc), awningBlue: pkStripes(0x2f6fb3, 0xf1e6cc),
      awningGreen: pkStripes(0x4d7a3a, 0xf1e6cc), awningGold: pkStripes(0xf0c04a, 0xf1e6cc),
      awningPurple: pkStripes(0x7a4a2a, 0xf1e6cc),
      awningTimber: std({ color: 0x5a4028, roughness: 0.85 }),
      awningPost: std({ color: 0x4a3320, roughness: 0.8 }),
      stallGood: std({ color: 0xe8dcc0, roughness: 0.9, side: THREE.DoubleSide }),
      // bunting pennants: rider colours, double-sided so they read from both sides of the wall
      buntingRed: std({ color: 0xd9472b, roughness: 0.85, side: THREE.DoubleSide }),
      buntingBlue: std({ color: 0x2f6fb3, roughness: 0.85, side: THREE.DoubleSide }),
      buntingGreen: std({ color: 0x4d7a3a, roughness: 0.85, side: THREE.DoubleSide }),
      buntingGold: std({ color: 0xf0c04a, roughness: 0.85, side: THREE.DoubleSide }),
      buntingPurple: std({ color: 0x7a4a2a, roughness: 0.85, side: THREE.DoubleSide }),
      buntingRope: std({ color: 0x8a7350, roughness: 0.9 }),
      buntingPole: std({ color: 0x6a4a2a, roughness: 0.7 }),
      // shields: enamelled metal in rider colours with a gold rim
      shieldRed: std({ color: 0xd9472b, roughness: 0.35, metalness: 0.5 }),
      shieldBlue: std({ color: 0x2f6fb3, roughness: 0.35, metalness: 0.5 }),
      shieldGreen: std({ color: 0x4d7a3a, roughness: 0.35, metalness: 0.5 }),
      shieldGold: std({ color: 0xf0c04a, roughness: 0.35, metalness: 0.5 }),
      shieldPurple: std({ color: 0x7a4a2a, roughness: 0.35, metalness: 0.5 }),
      shieldRim: std({ color: 0xc9a227, roughness: 0.4, metalness: 0.8 }),
      shieldBoss: std({ color: 0xe8dcc0, roughness: 0.3 }),
      // wall torch: iron bracket, coal bed, flame
      torchCoal: pkThGlow(0xff6a1a, 0.4, 0x2a0a04),
      torchFlame: pkThGlow(0xff8a2a, 1.6, 0x2a0a04),
      // canopy over the booth window: deep awning cloth
      canopyCloth: std({ color: 0x2a1a12, roughness: 0.9, side: THREE.DoubleSide }),
      canopyFascia: std({ color: 0xf0c04a, roughness: 0.6 }),
      canopyRod: std({ color: 0x6a4a2a, roughness: 0.6 })
    };
    return PK_TH_M;
  }
  var PK_TH_CLOCK = null;
  function pkThClockTex() {
    if (PK_TH_CLOCK) return PK_TH_CLOCK;
    PK_TH_CLOCK = tex(256, 256, function (c, w, h) {
      c.fillStyle = '#f3ead6'; c.beginPath(); c.arc(w / 2, h / 2, 124, 0, 6.2832); c.fill();
      c.strokeStyle = '#c9a227'; c.lineWidth = 8; c.stroke();
      c.fillStyle = '#2a2018'; c.font = 'bold 28px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].forEach(function (n, i) { var a = i / 12 * 6.2832; c.fillText(n, w / 2 + Math.sin(a) * 92, h / 2 - Math.cos(a) * 92); });
      for (var i = 0; i < 60; i++) { var a = i / 60 * 6.2832, r0 = i % 5 ? 112 : 106; c.lineWidth = i % 5 ? 2 : 4; c.beginPath(); c.moveTo(w / 2 + Math.sin(a) * r0, h / 2 - Math.cos(a) * r0); c.lineTo(w / 2 + Math.sin(a) * 118, h / 2 - Math.cos(a) * 118); c.stroke(); }
    });
    PK_TH_CLOCK.wrapS = PK_TH_CLOCK.wrapT = THREE.ClampToEdgeWrapping;
    return PK_TH_CLOCK;
  }

  // ── The building ─────────────────────────────────────────────────
  // g sits at (CX, 0, CZ); every mesh below is local to it. solid() is world, so S_ adds the offset.
  function pkTheaterBuild(a) {
    var M = pkThM(), CX = PK_TH.CX, CZ = PK_TH.CZ, G = PK_THG, C = pkCtl(a), X = a.extra;
    var g = new THREE.Group(); g.position.set(CX, 0, CZ); scene.add(g); X.g = g;
    var S_ = function (x0, x1, z0, z1, y0, y1) { solid(CX + Math.min(x0, x1), CX + Math.max(x0, x1), CZ + Math.min(z0, z1), CZ + Math.max(z0, z1), y0, y1); };
    X.lightWant = { house: 1.4, wash: 0, spot: 0, city: 0.15 };
    X.spotAt = { x: 0, y: 0, z: -2 }; X.fires = []; X.gateWant = 0; X.gateK = 0; X.moatUp = 0; X.moatY = -2.4; X.pending = []; X.missed = 0;

    // ground: the whole site paved, a sand arena, the yard behind the city wall
    pkPaved(54, 61, M.pave, -1, 0.021, 0, 2.4, g);
    box(40, 0.04, 23, M.sand, 0, 0.03, -1.5, g);
    [[0, -13, 40.2, 0.2], [0, 10, 40.2, 0.2], [-20, -1.5, 0.2, 23], [20, -1.5, 0.2, 23]].forEach(function (k) { box(k[2], 0.1, k[3], M.stoneDark, k[0], 0.05, k[1], g); });

    // ── The city: wall, gatehouse, towers, clock tower, houses, braziers, moat ──────────────────────────────────────
    var WZ = -17, WH = 7.2;
    [[-26, -2.4], [2.4, 26]].forEach(function (s) {
      var w = s[1] - s[0], cx = (s[0] + s[1]) / 2;
      pkBevelBox(w, 1.6, 1.4, M.stoneDark, cx, 0.8, WZ, g, 0.05);
      box(w, WH - 1.6, 1.1, M.brick, cx, 1.6 + (WH - 1.6) / 2, WZ, g);
      box(w + 0.1, 0.35, 1.25, M.stone, cx, WH + 0.1, WZ, g);
      for (var m = s[0] + 0.4; m < s[1] - 0.6; m += 1.4) box(0.7, 0.7, 1.1, M.stone, m + 0.35, WH + 0.6, WZ, g);
      S_(s[0], s[1], WZ - 0.7, WZ + 0.7, 0, WH + 1);
    });
    // the gatehouse: two piers, a lintel, a stepped crown and a spire; the passage runs through to the yard behind
    var GH = 9.6, GZ0 = WZ - 0.7, GZ1 = -13.4, AW = 2.4, AH = 5.2, gmz = (GZ0 + GZ1) / 2;
    [-1, 1].forEach(function (s) {
      var px = s * (AW + 1.3);
      box(2.6, GH, GZ1 - GZ0, M.cream, px, GH / 2, gmz, g);
      box(2.7, 1.5, GZ1 - GZ0 + 0.1, M.brick, px, 0.75, gmz, g);
      box(2.75, 0.3, GZ1 - GZ0 + 0.15, M.gold, px, GH - 1.5, gmz, g);
      S_(px - 1.3, px + 1.3, GZ0, GZ1, 0, GH);
    });
    box(AW * 2, GH - AH, GZ1 - GZ0, M.cream, 0, AH + (GH - AH) / 2, gmz, g);
    var arch = new THREE.Mesh(new THREE.TorusGeometry(AW, 0.22, 8, 24, Math.PI), M.brick); arch.position.set(0, AH - 0.05, GZ1 + 0.06); g.add(arch);
    for (var cr = -4.6; cr <= 4.7; cr += 1.15) box(0.6, 0.8, GZ1 - GZ0, M.cream, cr, GH + 0.4, gmz, g);
    pkFtSpire(g, 0, GH, gmz, 2.4, 4.6, M.slate, 4);
    var shield = new THREE.Mesh(new THREE.CircleGeometry(0.75, 24), M.gold); shield.position.set(0, AH + 2.3, GZ1 + 0.02); g.add(shield);
    // the balcony over the arch, where the Keeper speaks
    box(5.6, 0.25, 1.15, M.stone, 0, AH + 0.55, GZ1 + 0.58, g);
    box(5.6, 0.08, 0.08, M.iron, 0, AH + 1.62, GZ1 + 1.12, g);
    for (var bp = -2.7; bp <= 2.75; bp += 0.45) box(0.05, 0.9, 0.05, M.iron, bp, AH + 1.15, GZ1 + 1.12, g);
    X.balconyY = AH + 0.675;
    // the gate doors behind the curtain: two leaves on their hinges, opening into the city
    var doors = [-1, 1].map(function (s) {
      var hinge = pkMover(g, s * AW, 0, -15.6);
      box(AW - 0.05, AH - 0.1, 0.22, M.wood, -s * AW / 2, AH / 2, 0, hinge);
      for (var b = 0; b < 3; b++) box(AW - 0.12, 0.12, 0.27, M.iron, -s * AW / 2, 0.9 + b * 1.7, 0, hinge);
      return hinge;
    });
    X.doors = doors;
    // the towers either side of the gatehouse (the park's own fairy-tale tower: lit slits, a band of gold, a pointed roof)
    [-1, 1].forEach(function (s) { pkFtTower(CX + s * 6.6, CZ - 15, 1.7, 11, M.cream, 1); });
    // the clock tower, telling the park's own time
    var KX = -17, KZ = -15.2, KH = 15;
    box(4.6, 1.6, 4.6, M.stoneDark, KX, 0.8, KZ, g);
    box(4.0, KH, 4.0, M.brick, KX, KH / 2, KZ, g);
    [0.3, 0.62].forEach(function (f) { box(4.2, 0.3, 4.2, M.cream, KX, KH * f, KZ, g); });
    for (var kw = 0; kw < 3; kw++) box(0.5, 1.1, 0.06, M.win, KX, 3.2 + kw * 3.3, KZ + 2.03, g);
    box(4.5, 2.3, 4.5, M.cream, KX, KH + 1.15, KZ, g);
    pkFtSpire(g, KX, KH + 2.3, KZ, 3.4, 6.5, M.slate, 4);
    S_(KX - 2.3, KX + 2.3, KZ - 2.3, KZ + 2.3, 0, KH + 3);
    var face = new THREE.Mesh(new THREE.CircleGeometry(0.98, 32), std({ map: pkThClockTex(), roughness: 0.6 })); face.position.set(KX, KH + 1.15, KZ + 2.27); g.add(face);
    var hh = pkMover(g, KX, KH + 1.15, KZ + 2.3), mh = pkMover(g, KX, KH + 1.15, KZ + 2.33);
    box(0.09, 0.52, 0.03, M.iron, 0, 0.22, 0, hh); box(0.06, 0.78, 0.03, M.iron, 0, 0.35, 0, mh);
    PK_TH.clock = { h: hh, m: mh };
    // the houses along the wall's foot: plastered fronts, stepped gables, two storeys of windows on the CITY circuit
    function house(x0, x1, h, wallMat, trim) {
      var w = x1 - x0, cx = (x0 + x1) / 2, z = WZ + 0.7 + 0.4;
      box(w, h, 0.8, wallMat, cx, h / 2, z, g);
      box(w + 0.1, 0.25, 0.9, trim, cx, 1.3, z, g);
      for (var i = 0, sw; i < 4; i++) { sw = w * (1 - (i + 1) / 5); box(sw, 0.8, 0.8, wallMat, cx, h + 0.4 + i * 0.8, z, g); box(sw + 0.12, 0.12, 0.9, trim, cx, h + 0.8 + i * 0.8, z, g); }
      var cols = Math.max(2, Math.floor(w / 1.6));
      for (var r = 0; r < 2; r++) for (var c = 0; c < cols; c++) {
        var wx = x0 + (c + 0.5) * w / cols, wy = 3.0 + r * 2.4;
        box(0.75, 1.15, 0.06, M.win, wx, wy, z + 0.41, g);
        box(0.92, 0.12, 0.14, trim, wx, wy - 0.63, z + 0.44, g);
        box(0.06, 1.15, 0.08, M.wood, wx, wy, z + 0.45, g);
      }
      box(1.0, 1.95, 0.06, M.wood, cx, 0.98, z + 0.41, g);
      S_(x0, x1, z - 0.4, z + 0.4, 0, h);
    }
    house(-26, -19.4, 8.0, M.pink, M.stone);
    house(-14.6, -8.4, 8.6, M.cream, M.brick);
    house(8.4, 14.8, 8.2, M.blue, M.stone);
    house(14.8, 20.6, 9.0, M.cream, M.brick);
    house(20.6, 26, 7.8, M.pink, M.stone);
    // the braziers: two on pedestals before the towers, two on the gatehouse; FIRE makes them roar
    function brazier(x, y, z, pedestal) {
      if (pedestal) { pkBevelBox(0.9, 1.1, 0.9, M.stone, x, 0.55, z, g, 0.04); pkRoundCyl(0.12, 0.9, M.iron, x, 1.55, z, g, 8); S_(x - 0.45, x + 0.45, z - 0.45, z + 0.45, 0, 2.4); }
      var by = pedestal ? 2.0 : y;
      var bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.32, 0.45, 14), M.iron); bowl.position.set(x, by + 0.22, z); bowl.castShadow = true; g.add(bowl);
      var coal = pkThGlow(0xff6a1a, 0.4, 0x2a0a04), coals = new THREE.Mesh(new THREE.CircleGeometry(0.55, 14), coal); coals.rotation.x = -Math.PI / 2; coals.position.set(x, by + 0.42, z); g.add(coals);
      X.fires.push({ x: x, y: by + 0.5, z: z, mat: coal });
    }
    brazier(-7.8, 0, -12.3, true); brazier(7.8, 0, -12.3, true);
    brazier(-4.2, GH + 0.8, -14.2, false); brazier(4.2, GH + 0.8, -14.2, false);
    // the moat at the city's foot: a stone rim, the water, and the hidden lift the Count rises on
    [[13, -12.1, 8.6, 0.4], [13, -7.1, 8.6, 0.4], [8.9, -9.6, 0.4, 5.4], [17.1, -9.6, 0.4, 5.4]].forEach(function (k) { pkBevelBox(k[2], 0.45, k[3], M.stone, k[0], 0.225, k[1], g, 0.04); });
    pkPaved(7.8, 4.6, M.water, 13, 0.2, -9.6, 4, g);
    S_(8.7, 17.3, -12.3, -6.9, 0, 0.45);
    X.moat = { x: 13, z: -9.6 };
    // the yard behind the city, where the cast waits, and the walls round the whole arena
    [[0, -30, 52, 0.4], [-26, -23.5, 0.4, 13], [26, -23.5, 0.4, 13]].forEach(function (k) { box(k[2], 3, k[3], M.stoneDark, k[0], 1.5, k[1], g); S_(k[0] - k[2] / 2, k[0] + k[2] / 2, k[1] - k[3] / 2, k[1] + k[3] / 2, 0, 3); });
    [[-26, 2.2, 0.5, 38.4], [-20.3, 21.4, 11.4, 0.5], [24, -3.7, 0.5, 26.6]].forEach(function (k) {
      box(k[2], 3.2, k[3], M.stone, k[0], 1.6, k[1], g); box(k[2] + 0.15, 0.25, k[3] + 0.15, M.stoneDark, k[0], 3.3, k[1], g);
      S_(k[0] - k[2] / 2, k[0] + k[2] / 2, k[1] - k[3] / 2, k[1] + k[3] / 2, 0, 3.4);
    });

    // ── The grandstand: six stepped rows, ten seats a row either side of the centre aisle, under a roof ────────────
    var seats = [];
    for (var k = 0; k < G.rows; k++) {
      var z0 = G.z0 + k * G.row, h = G.h0 + G.rise * k;
      box(G.x * 2, h, G.back - z0, M.conc, 0, h / 2, (z0 + G.back) / 2, g);
      box(7.2, 0.02, 0.1, M.nosing, 0, h + 0.01, z0 + 0.05, g);
      [-1, 1].forEach(function (s) {
        box(9.8, 0.08, 0.42, M.wood, s * 9, h + 0.42, z0 + 0.72, g);
        box(9.8, 0.4, 0.07, M.wood, s * 9, h + 0.68, z0 + 0.96, g);
        [4.5, 9, 13.5].forEach(function (lx) { box(0.08, 0.4, 0.36, M.iron, s * lx, h + 0.2, z0 + 0.72, g); });
        for (var sx = 5; sx <= 13; sx += 2) seats.push({ par: g, x: s * sx, y: h + 0.45 - 0.76, z: z0 + 0.72, ry: Math.PI });
      });
    }
    a.seats = seats; a.cap = seats.length;
    box(0.3, 4.4, G.back - 9.5, M.stone, -(G.x + 0.15), 2.2, (9.5 + G.back) / 2, g); S_(-G.x - 0.3, -G.x, 9.5, G.back, 0, 7.6);
    var HO = PK_TH_HALL.s1, top0 = G.h0 + G.rise * (G.rows - 1);
    box(0.3, 4.4, HO - 9.5, M.stone, G.x + 0.15, 2.2, (9.5 + HO) / 2, g); S_(G.x, G.x + 0.3, 9.5, HO, 0, 7.6);
    box(0.3, top0, G.back - HO, M.stone, G.x + 0.15, top0 / 2, (HO + G.back) / 2, g);
    // the parapet along the front of the stand: the audience comes in at the top, down the aisles, never up from the sand
    box(G.x * 2, 1.05, 0.3, M.stone, 0, 0.525, 9.65, g); box(G.x * 2 + 0.1, 0.08, 0.4, M.gold, 0, 1.09, 9.65, g); S_(-G.x, G.x, 9.45, 9.85, 0, 1.1);
    box(G.x * 2 + 0.6, 7.2, 0.3, M.brick, 0, 3.6, G.back + 0.15, g); S_(-G.x - 0.3, G.x + 0.3, G.back, G.back + 0.3, 0, 7.2);
    sign(['LINDENBURG ARENA'], 9, 1.1, 0, 5.4, G.back + 0.31, 0, { bg: '#2a1a12', fg: '#f0c04a' }, g);
    // the roof: posts, a slate deck falling to the back, a fascia with the show's name toward the arena
    [[-G.x, 9.7], [G.x, 9.7], [-G.x, G.back - 0.1], [G.x, G.back - 0.1], [-5, G.back - 0.1], [5, G.back - 0.1]].forEach(function (p) { pkRoundCyl(0.16, 7.6, M.iron, p[0], 3.8, p[1], g, 10); });
    var roof = new THREE.Mesh(new THREE.BoxGeometry(31.2, 0.18, 13.2), M.slate); roof.position.set(0, 7.35, 15.5); roof.rotation.x = Math.atan2(0.6, 13); roof.castShadow = true; g.add(roof);
    box(31.2, 0.6, 0.18, M.cream, 0, 7.55, 8.95, g);
    sign(['THE FIVE RIDERS OF LINDENBURG'], 10, 0.5, 0, 7.55, 8.84, Math.PI, { bg: '#2a1a12', fg: '#f0c04a' }, g);
    // the great curtain: hung from the roof right across the front of the seats, two halves that gather to the sides.
    // C.barsWant 1 is closed; the ride plumbing eases C.bars toward it and the halves follow
    var CZr = 9.35, CHt = 7.1, halves = [-1, 1].map(function (s) {
      var piv = pkMover(g, s * 15.1, 0, CZr);
      var cl = new THREE.Mesh(new THREE.PlaneGeometry(15.1, CHt), M.cloth); cl.position.set(-s * 7.55, 0.15 + CHt / 2, 0); piv.add(cl);
      for (var f = 0; f < 12; f++) box(0.14, CHt - 0.2, 0.06, M.fold, -s * (0.6 + f * 1.2), 0.15 + CHt / 2, 0.03, piv);
      box(15.1, 0.25, 0.08, M.gold, -s * 7.55, 0.3, 0.04, piv);
      return piv;
    });
    pkRoundCyl(0.06, 30.6, M.iron, 0, 7.3, CZr, g, 8).rotation.z = Math.PI / 2;
    box(30.4, 0.5, 0.16, M.cloth, 0, 7.12, CZr - 0.12, g);
    box(30.4, 0.08, 0.18, M.gold, 0, 6.88, CZr - 0.12, g);
    C.barObjs.push(function (b) { var sx = 0.1 + 0.9 * b; halves.forEach(function (h) { h.scale.x = sx; }); });
    // the lights: house under the roof, the wash over the arena, one follow spot hung from the roof's front edge
    var L = X.lights = {};
    L.house = [[-7, 15], [7, 15]].map(function (p) { var l = new THREE.PointLight(0xfff0d2, 1.4, 16, 2); l.position.set(p[0], 6.6, p[1]); g.add(l); return l; });
    L.wash = [[-9, 0], [9, 0]].map(function (p) { var l = new THREE.PointLight(0xffe9c0, 0, 30, 1.6); l.position.set(p[0], 10, p[1]); g.add(l); return l; });
    L.spot = new THREE.SpotLight(0xd8e6ff, 0, 40, 0.32, 0.45, 1.2); L.spot.position.set(0, 7.2, 9.2); g.add(L.spot); g.add(L.spot.target);
    L.fire = new THREE.PointLight(0xff7a2a, 0, 26, 1.8); L.fire.position.set(0, 6, -13); g.add(L.fire);
    L.hydra = new THREE.PointLight(0xff4a1a, 0, 30, 1.6); L.hydra.position.set(0, 9, -16); g.add(L.hydra);

    // ── The entrance: the audience comes in through the stair hall (part 37, which has the ride's gates); where the old
    // audience gate stood is the hall's north wall now, and the staff door beside it stays where it was ───
    [21.4, 23.4].forEach(function (x) { pkBevelBox(0.8, 5.0, 0.8, M.stone, x, 2.5, 9.8, g, 0.04); pkFtSpire(g, x, 5.0, 9.8, 0.75, 1.6, M.slate, 4); S_(x - 0.4, x + 0.4, 9.4, 10.2, 0, 5); });
    // the staff door between the gate and the east wall: E opens and shuts it, and it swings into the arena
    box(0.15, 2.3, 0.3, M.stone, 21.875, 1.15, 9.8, g); S_(21.8, 21.95, 9.6, 10.0, 0, 2.3);
    box(1.2, 2.7, 0.4, M.stone, 22.4, 3.65, 9.8, g);
    a.extra.staffDoor = pkBkDoor(g, 22.95, 0, 9.8, -Math.PI / 2, -Math.PI / 2, 1.0, 2.25, { leaf: M.wood, glass: M.glass, kick: M.iron }, 'the staff door');
    sign(['STAFF ONLY'], 0.9, 0.22, 22.4, 2.55, 10.02, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);

    // ── The control room: on the grandstand's top step, glazed toward the arena, the door on the aisle side ────────
    var BF = G.h0 + G.rise * G.rows, BZ0 = G.z0 + G.rows * G.row, BZ1 = G.back, BX = G.booth, BH = 2.7, bmz = (BZ0 + BZ1) / 2;
    box(BX * 2, BF, BZ1 - BZ0, M.conc, 0, BF / 2, bmz, g);
    box(BX * 2 - 0.2, 0.02, BZ1 - BZ0 - 0.2, M.lino, 0, BF + 0.01, bmz, g);
    pkBevelBox(5.9, 1.0, 0.14, M.wood, -0.65, BF + 0.5, BZ0, g, 0.02);
    box(5.9, 1.3, 0.03, M.glass, -0.65, BF + 1.65, BZ0, g);
    [-3.55, -1.6, 0.3, 2.25].forEach(function (mx) { box(0.1, 1.3, 0.16, M.wood, mx, BF + 1.65, BZ0, g); });
    box(7.2, 0.4, 0.14, M.wood, 0, BF + BH - 0.2, BZ0, g);
    box(0.3, BH, 0.14, M.wood, 3.45, BF + BH / 2, BZ0, g);
    S_(-BX, 2.3, BZ0 - 0.1, BZ0 + 0.1, BF - 0.45, BF + BH); S_(3.3, BX, BZ0 - 0.1, BZ0 + 0.1, BF - 0.45, BF + BH);
    [-1, 1].forEach(function (s) { box(0.14, BH, BZ1 - BZ0, M.wood, s * (BX - 0.07), BF + BH / 2, bmz, g); S_(s * (BX - 0.14), s * (BX + 0.1), BZ0, BZ1, BF - 0.45, BF + BH); });
    box(BX * 2 + 0.4, 0.18, BZ1 - BZ0 + 0.3, M.stoneDark, 0, BF + BH + 0.09, bmz, g);
    // the door: hinged on the right jamb, shut across the doorway, swinging into the room; E opens and shuts it
    a.extra.door = pkBkDoor(g, 3.3, BF, BZ0, -Math.PI / 2, Math.PI / 2, 1.0, 2.1, { leaf: M.wood, glass: M.glass, kick: M.iron }, 'the control room door');
    // three state lamps over the window, outside: the park's signal colours (part 09 drives them)
    [-1.6, 0, 1.6].forEach(function (lx) { var lm = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), pkThGlow(0x5fd38d, 1.2)); lm.position.set(lx, BF + BH - 0.2, BZ0 - 0.12); g.add(lm); C.lamps.push(lm); });
    // the room lights on two battens, and the switch by the door
    var tube = std({ color: 0xffffff, emissive: 0xfff4dc, emissiveIntensity: 0.04, roughness: 0.4 }), battens = [-1.6, 1.6].map(function (bx) {
      var bt = box(1.4, 0.05, 0.14, M.iron, bx, BF + BH - 0.06, bmz, g); box(1.3, 0.03, 0.07, tube, bx, BF + BH - 0.1, bmz, g); bt.userData.tube = tube; return bt;
    });
    a.boothLights = pkBkLights(a.id, g, battens, 0, BF + BH - 0.4, bmz);
    pkBkSwitch(g, 2.05, BF + 0.85, BZ0 + 0.08, 0, a.boothLights, a.name);   // on the sill wall by the door, clear of the leaf's swing
    a.boothClock = pkBkTimeClock(g, BX - 0.15, BF + 1.45, BZ0 + 1.2, -Math.PI / 2, a.id, a.name);
    pkBkClock(g, 0, BF + 2.15, BZ1 - 0.16, Math.PI, 0.17);
    // the desk under the window with the two consoles, the chair, the CCTV over the right end, the ride cabinet
    var desk = new THREE.Group(); desk.position.set(-0.75, BF, BZ0 + 0.5); g.add(desk); pkBkDesk(desk, 5.3);
    pkTheaterDesk(a, g, BF, BZ0);
    // a chair at each console (SHOW at x -2.15, STAGE at -0.35), and the two CCTV screens on one bracket, each hung over
    // the middle of its console
    pkBkChair(g, -2.15, BZ0 + 1.75, Math.PI, BF); pkBkChair(g, -0.35, BZ0 + 1.75, Math.PI, BF);
    pkBkMonitors(a, g, -1.25, BF + 1.95, BZ0 + 0.42, 0, 0.9);
    pkBkCabinet(a, g, BX - 0.18, BF + 1.35, BZ0 + 3.0, -Math.PI / 2);
    pkTheaterWallScreens(a, g, BF, BZ0, BX);

    // ── The queue lane on the forecourt: the park's own switchback (part 06), sized for sixty ───────────────────────
    var lane = new THREE.Group(); scene.add(lane);
    pkQueueLaneBetter(a, { ground: 0xa89a84, name: 'The Lindenburg Arena' }, lane);

    // ── The cast and the hydra wait, hidden, in the yard ─────────────────────────────────────────────────────────
    pkTheaterCast(a); X.hydra = pkThHydra(g);
    pkTheaterDress(a, g, M, G, X, BF, BZ0, BZ1, BX, BH, S_);
    pkArenaPlus(a, g, M, G, X, BF, BZ0, BZ1, BX, BH, S_);   // part 37: the castle front, the effects, backstage, the desk
    return g;
  }

  // ── Dressing: the arena's market, barrier, standards and inlay, and the control room's fit-out ─────────────────────
  // Everything stands on the ground or a wall: the sand is x -20..20, z -13..10; the paved strips run out to the side walls
  // (inner faces at x -25.75 and 23.75). The control room is x -3.46..3.46, z BZ0..BZ1, floor BF, ceiling BF + BH.
  function pkTheaterDress(a, g, M, G, X, BF, BZ0, BZ1, BX, BH, S_) {
    var RC = [0xb8322a, 0x2f5f9e, 0x3f6e34, 0xd9a730, 0x5e3a80];
    var cloth = RC.map(function (c) { return std({ color: c, roughness: 0.85, side: THREE.DoubleSide }); });
    var enamel = RC.map(function (c) { return std({ color: c, roughness: 0.35, metalness: 0.4 }); });
    function inlay(c) { return std({ map: TEX.plaster, color: c, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }); }
    function flat(geo, mat, x, z) { var m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.051, z); m.receiveShadow = true; g.add(m); return m; }
    function mesh(geo, mat, x, y, z, par) { var m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; (par || g).add(m); return m; }

    // ── The sand inlay: a raked star in darker sand, a gold ring, the five riders' marks ──
    var SZ = -1.5, star = new THREE.Shape(), dark = inlay(0xb39563), goldIn = inlay(0xc9a227);
    for (var i = 0; i < 10; i++) { var r = i % 2 ? 1.05 : 2.6, an = Math.PI / 2 + i * Math.PI / 5; star[i ? 'lineTo' : 'moveTo'](Math.cos(an) * r, Math.sin(an) * r); }
    star.closePath();
    flat(new THREE.ShapeGeometry(star), dark, 0, SZ);
    flat(new THREE.RingGeometry(2.85, 2.97, 64), goldIn, 0, SZ);
    flat(new THREE.RingGeometry(6.6, 6.85, 96), dark, 0, SZ);
    for (var t = 0; t < 5; t++) {
      var ta = Math.PI / 2 + t * 2 * Math.PI / 5, tx = Math.cos(ta) * 4.6, tz = SZ - Math.sin(ta) * 4.6;
      flat(new THREE.RingGeometry(0.42, 0.5, 32), goldIn, tx, tz);
      flat(new THREE.CircleGeometry(0.42, 32), inlay(RC[t]), tx, tz);
    }

    // ── The tilt barrier: a timber rail down both sides of the sand, open at the grandstand end ──
    function fence(x, z0, z1) {
      var n = Math.max(1, Math.round((z1 - z0) / 2)), st = (z1 - z0) / n, mz = (z0 + z1) / 2;
      for (var i = 0; i <= n; i++) { var z = z0 + i * st; pkBevelBox(0.16, 1.15, 0.16, M.timber, x, 0.575, z, g, 0.02); box(0.2, 0.06, 0.2, M.gold, x, 1.18, z, g); }
      box(0.09, 0.12, z1 - z0, M.timber, x, 1.02, mz, g);
      box(0.07, 0.1, z1 - z0, M.timber, x, 0.55, mz, g);
      S_(x - 0.1, x + 0.1, z0, z1, 0, 1.2);
    }
    fence(-20.6, -12.6, 6.8); fence(20.6, -12.6, 6.8);

    // ── The riders' standards: a swallow-tailed banner in each rider's colour on a pole outside the barrier ──
    var tail = new THREE.Shape(); tail.moveTo(-0.55, 0); tail.lineTo(0.55, 0); tail.lineTo(0.55, -2.6); tail.lineTo(0, -2.15); tail.lineTo(-0.55, -2.6); tail.closePath();
    var tailGeo = new THREE.ShapeGeometry(tail), emblem = new THREE.CircleGeometry(0.26, 24);
    function standard(x, z, k) {
      pkBevelBox(0.5, 0.3, 0.5, M.stoneDark, x, 0.15, z, g, 0.03);
      pkRoundCyl(0.07, 6.2, M.timber, x, 3.1, z, g, 8);
      mesh(new THREE.SphereGeometry(0.12, 12, 8), M.gold, x, 6.3, z);
      var b = new THREE.Group(); b.position.set(x, 6.0, z); b.rotation.y = Math.PI / 2; g.add(b);
      pkRoundCyl(0.035, 1.3, M.iron, 0, 0, 0, b, 6).rotation.z = Math.PI / 2;
      var bn = new THREE.Mesh(tailGeo, cloth[k]); bn.position.y = -0.05; b.add(bn);
      box(1.12, 0.1, 0.03, M.gold, 0, -0.1, 0, b);
      [1, -1].forEach(function (s) { var e = new THREE.Mesh(emblem, M.gold); e.position.set(0, -0.95, s * 0.012); e.rotation.y = s > 0 ? 0 : Math.PI; b.add(e); });
      S_(x - 0.25, x + 0.25, z - 0.25, z + 0.25, 0, 6);
    }
    [-6, 0, 6.3].forEach(function (z, i) { standard(-21.3, z, i); });
    [-9, -3, 3].forEach(function (z, i) { standard(21.3, z, (i + 3) % 5); });

    // ── The market on the west strip: three stalls facing the sand, goods on the counters, barrels at their feet ──
    function barrel(x, z) {
      mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.78, 14), M.timber, x, 0.39, z);
      mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.6, 14, 1, true), M.timber, x, 0.39, z);
      [0.12, 0.66].forEach(function (y) { var h = mesh(new THREE.TorusGeometry(0.295, 0.02, 6, 20), M.iron, x, y, z); h.rotation.x = Math.PI / 2; });
      S_(x - 0.3, x + 0.3, z - 0.3, z + 0.3, 0, 0.8);
    }
    function stall(z, k, kind, label) {
      var x0 = -24.6, x1 = -22.3, hw = 1.35, top = 0.995, stripes = pkStripes(hexCss(RC[k]), '#f1e6cc');
      [[x0, 2.75], [x1, 2.35]].forEach(function (p) { [-1, 1].forEach(function (s) { pkRoundCyl(0.06, p[1], M.awningPost, p[0], p[1] / 2, z + s * hw, g, 8); }); });
      var aw = box(2.75, 0.05, hw * 2 + 0.3, stripes, (x0 + x1) / 2 + 0.05, 2.58, z, g); aw.rotation.z = -Math.atan2(0.45, 2.3);
      box(0.04, 0.36, hw * 2 + 0.3, stripes, x1 + 0.12, 2.2, z, g);
      sign([label], 1.7, 0.28, x1 + 0.15, 2.2, z, Math.PI / 2, { bg: '#2a1a12', fg: '#f0c04a' }, g);
      pkBevelBox(0.6, 0.95, hw * 2 - 0.1, M.timber, x1 - 0.3, 0.475, z, g, 0.02);
      box(0.72, 0.05, hw * 2, M.wood, x1 - 0.3, 0.97, z, g);
      box(0.35, 0.04, hw * 2 - 0.2, M.wood, x0 + 0.25, 1.4, z, g);
      var gx = x1 - 0.3;
      if (kind === 'bread') {
        for (var i = 0; i < 7; i++) { var lf = mesh(new THREE.SphereGeometry(0.09, 12, 8), std({ color: i % 2 ? 0xb87a3a : 0xc98f4a, roughness: 0.9 }), gx + (i % 2 ? 0.12 : -0.12), top + 0.06, z - 0.9 + i * 0.3); lf.scale.set(1, 0.75, 1.9); }
        for (var j = 0; j < 4; j++) mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.07, 14), std({ color: 0xa8692f, roughness: 0.9 }), x0 + 0.25, 1.455, z - 0.6 + j * 0.4);
      } else if (kind === 'fruit') {
        [[-0.75, 0xb8322a], [-0.25, 0x7aa83a], [0.25, 0xe0a030], [0.75, 0x9a2a3a]].forEach(function (c) {
          box(0.5, 0.1, 0.38, M.wood, gx, top + 0.05, z + c[0], g);
          for (var q = 0; q < 9; q++) mesh(new THREE.SphereGeometry(0.055, 10, 8), std({ color: c[1], roughness: 0.55 }), gx - 0.14 + (q % 3) * 0.14, top + 0.14 + (q === 4 ? 0.05 : 0), z + c[0] - 0.12 + Math.floor(q / 3) * 0.12);
        });
      } else {
        for (var w = 0; w < 5; w++) { var wh = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.11, 18), std({ color: 0xe8c45a, roughness: 0.6 }), gx + (w % 2 ? 0.1 : -0.1), top + 0.06 + (w === 4 ? 0.11 : 0), z - 0.75 + (w === 4 ? 0.85 : w) * 0.42); wh.castShadow = true; }
        for (var h = 0; h < 3; h++) mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.16, 16), std({ color: 0xd9b24a, roughness: 0.6 }), x0 + 0.25, 1.5, z - 0.5 + h * 0.5);
      }
      mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.08, 8), M.iron, x1 - 0.6, 2.12, z);
      mesh(new THREE.SphereGeometry(0.1, 12, 10), M.lampGlow, x1 - 0.6, 2.0, z);
      barrel(x1 - 0.1, z + hw + 0.4);
      box(0.5, 0.5, 0.5, M.timber, x0 + 0.4, 0.25, z + hw + 0.45, g); S_(x0 + 0.15, x0 + 0.65, z + hw + 0.2, z + hw + 0.7, 0, 0.5);
      S_(x0 - 0.1, x1, z - hw - 0.1, z + hw + 0.1, 0, 2.8);
    }
    stall(-9, 0, 'bread', 'THE BAKER'); stall(-3, 3, 'fruit', 'ORCHARD FRUIT'); stall(3, 1, 'cheese', 'CHEESEMONGER');

    // ── The east strip: the riders' side. Shields and torches on the wall, hay, a lance rack and a horse trough ──
    var shieldSh = new THREE.Shape();
    shieldSh.moveTo(-0.45, 0.55); shieldSh.lineTo(0.45, 0.55); shieldSh.lineTo(0.45, 0);
    shieldSh.quadraticCurveTo(0.45, -0.45, 0, -0.68); shieldSh.quadraticCurveTo(-0.45, -0.45, -0.45, 0); shieldSh.closePath();
    var shieldGeo = new THREE.ExtrudeGeometry(shieldSh, { depth: 0.05, bevelEnabled: false });
    function onWall(x, z, ry) { var w = new THREE.Group(); w.position.set(x, 0, z); w.rotation.y = ry; g.add(w); return w; }
    function shieldAt(x, z, ry, k) {
      var w = onWall(x, z, ry);
      var rim = mesh(shieldGeo, M.shieldRim, 0, 2.3, 0, w); rim.scale.set(1.12, 1.1, 1);
      mesh(shieldGeo, enamel[k], 0, 2.3, 0.04, w);
      box(0.08, 0.95, 0.02, M.gold, 0, 2.2, 0.1, w);
      mesh(new THREE.SphereGeometry(0.09, 12, 10), M.shieldBoss, 0, 2.4, 0.11, w);
    }
    function torchAt(x, z, ry) {
      var w = onWall(x, z, ry);
      box(0.14, 0.3, 0.06, M.iron, 0, 2.55, 0.03, w);
      box(0.04, 0.04, 0.4, M.iron, 0, 2.6, 0.22, w);
      mesh(new THREE.CylinderGeometry(0.15, 0.08, 0.26, 10, 1, true), M.iron, 0, 2.75, 0.42, w);
      var coal = mesh(new THREE.CircleGeometry(0.13, 12), M.torchCoal, 0, 2.86, 0.42, w); coal.rotation.x = -Math.PI / 2;
      mesh(new THREE.ConeGeometry(0.1, 0.32, 8), M.torchFlame, 0, 3.04, 0.42, w);
    }
    [-12, -6, 0, 6].forEach(function (z, i) { shieldAt(23.75, z, -Math.PI / 2, i % 5); });
    [-9, -3, 3].forEach(function (z) { torchAt(23.75, z, -Math.PI / 2); });
    [-6, 0, 6.3].forEach(function (z) { torchAt(-25.75, z, Math.PI / 2); });
    [[22.5, -12.2, 0], [22.5, -11.0, 0], [22.5, -11.6, 0.5]].forEach(function (b) {
      box(0.55, 0.5, 1.1, M.straw, b[0], 0.25 + b[2], b[1], g);
      [-0.3, 0.3].forEach(function (d) { box(0.56, 0.51, 0.03, M.timber, b[0], 0.25 + b[2], b[1] + d, g); });
    });
    S_(22.2, 22.8, -12.8, -10.4, 0, 1.0);
    (function lanceRack(x, z) {
      [-0.8, 0.8].forEach(function (d) { pkBevelBox(0.12, 1.7, 0.12, M.timber, x, 0.85, z + d, g, 0.015); });
      box(0.12, 0.08, 1.75, M.timber, x, 1.55, z, g); box(0.3, 0.08, 1.75, M.timber, x, 0.25, z, g);
      for (var i = 0; i < 5; i++) {
        var lz = z - 0.6 + i * 0.3;
        pkRoundCyl(0.035, 3.0, cloth[i], x, 1.75, lz, g, 8);
        mesh(new THREE.ConeGeometry(0.11, 0.32, 10), M.wood, x, 0.43, lz).rotation.x = Math.PI;
        mesh(new THREE.ConeGeometry(0.045, 0.2, 8), M.iron, x, 3.35, lz);
      }
      S_(x - 0.2, x + 0.2, z - 0.9, z + 0.9, 0, 3.3);
    })(22.6, -4.6);
    box(0.7, 0.5, 1.7, M.timber, 22.7, 0.25, 4.6, g);
    box(0.56, 0.02, 1.56, M.water, 22.7, 0.44, 4.6, g);
    S_(22.35, 23.05, 3.75, 5.45, 0, 0.5);

    // ── Bunting along the tops of both side walls, on short poles, sagging between them ──
    function bunting(x) {
      var zs = [-16, -11, -6, -1, 4, 9], pts = [], k = 0;
      zs.forEach(function (z) { pkRoundCyl(0.035, 1.5, M.buntingPole, x, 4.18, z, g, 6); mesh(new THREE.SphereGeometry(0.06, 8, 6), M.gold, x, 4.95, z); });
      for (var s = 0; s < zs.length - 1; s++) {
        for (var q = 0; q <= 10; q++) { var u = q / 10; if (s && !q) continue; pts.push(new THREE.Vector3(x, 4.85 - 0.45 * Math.sin(Math.PI * u), zs[s] + 5 * u)); }
        for (var u2 = 0.08; u2 < 0.95; u2 += 0.105) {
          var pen = new THREE.Mesh(new THREE.ShapeGeometry(pennant), cloth[k++ % 5]);
          pen.position.set(x, 4.84 - 0.45 * Math.sin(Math.PI * u2), zs[s] + 5 * u2); pen.rotation.y = Math.PI / 2; g.add(pen);
        }
      }
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.015, 5, false), M.buntingRope));
    }
    var pennant = new THREE.Shape(); pennant.moveTo(-0.16, 0); pennant.lineTo(0.16, 0); pennant.lineTo(0, -0.42); pennant.closePath();
    bunting(23.7); bunting(-25.7);

    // ── The control room: a show-control rack, the running-order board, a crew bench, a tea counter, a proper ceiling ──
    var F = BF, mz = (BZ0 + BZ1) / 2, iw = BX - 0.14;
    var tile = std({ color: 0xdcd9d2, roughness: 0.95 }), grid = std({ color: 0x8e9196, roughness: 0.5, metalness: 0.4 });
    box(iw * 2, 0.02, BZ1 - BZ0 - 0.1, tile, 0, F + BH - 0.012, mz, g);
    for (var cx = -iw + 0.6; cx < iw; cx += 0.6) box(0.025, 0.012, BZ1 - BZ0 - 0.1, grid, cx, F + BH - 0.028, mz, g);
    for (var cz = BZ0 + 0.6; cz < BZ1 - 0.1; cz += 0.6) box(iw * 2, 0.012, 0.025, grid, 0, F + BH - 0.028, cz, g);
    box(5.9, 0.1, 0.1, std({ color: 0xe6e3dc, roughness: 0.6 }), -0.65, F + 2.24, BZ0 + 0.13, g);

    // the rack: two bays of show control, every unit with its status lights
    var rackM = std({ color: 0x1d2227, roughness: 0.5, metalness: 0.4 }), unitM = std({ color: 0x2c3339, roughness: 0.45, metalness: 0.5 });
    var leds = [pkThGlow(0x5fd38d, 1.4), pkThGlow(0xf0b030, 1.2), pkThGlow(0x4aa8ff, 1.2)];
    [-3.08, -2.42].forEach(function (x, b) {
      pkBevelBox(0.6, 1.9, 0.75, rackM, x, F + 0.95, BZ1 - 0.4, g, 0.015);
      for (var u = 0; u < 6; u++) {
        box(0.52, 0.18, 0.02, unitM, x, F + 0.3 + u * 0.24, BZ1 - 0.785, g);
        for (var l = 0; l < 3; l++) box(0.025, 0.025, 0.01, leds[(u + l + b) % 3], x - 0.2 + l * 0.05, F + 0.33 + u * 0.24, BZ1 - 0.797, g);
        box(0.22, 0.03, 0.01, std({ color: 0x0c0f12, roughness: 0.3 }), x + 0.1, F + 0.3 + u * 0.24, BZ1 - 0.797, g);
      }
      S_(x - 0.3, x + 0.3, BZ1 - 0.78, BZ1, F, F + 1.9);
    });
    sign(['SHOW CONTROL'], 1.2, 0.12, -2.75, F + 1.78, BZ1 - 0.8, Math.PI, { bg: '#1b232c', fg: '#f5b53d' }, g);

    // the running-order board under the clock
    box(1.84, 1.02, 0.04, std({ color: 0x9aa0a6, roughness: 0.4, metalness: 0.5 }), -0.4, F + 1.38, BZ1 - 0.02, g);
    sign(['RUNNING ORDER', '1 House to half, curtain', '2 Keeper on the balcony', '3 Gate: the five riders', '4 Moat up: Count Grimwald', '5 Hydra, fire and thunder', '6 Bow, curtain, house up'], 1.74, 0.92, -0.4, F + 1.38, BZ1 - 0.045, Math.PI, { bg: '#f4f3ee', fg: '#1d2b3a' }, g);
    box(1.3, 0.035, 0.08, M.iron, -0.4, F + 0.85, BZ1 - 0.06, g);
    [0x1d2b3a, 0xb8322a, 0x2f5f9e].forEach(function (c, i) { mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.13, 8), std({ color: c }), -0.7 + i * 0.1, F + 0.88, BZ1 - 0.07).rotation.z = Math.PI / 2; });

    // coat hooks and the operator's hi-vis
    box(0.62, 0.08, 0.03, M.wood, 0.9, F + 1.78, BZ1 - 0.02, g);
    [0.7, 0.9, 1.1].forEach(function (x) { box(0.03, 0.03, 0.08, M.iron, x, F + 1.76, BZ1 - 0.06, g); });
    box(0.42, 0.62, 0.05, std({ color: 0xd8ef2a, roughness: 0.7, emissive: 0x1a1f00, emissiveIntensity: 0.4 }), 0.7, F + 1.42, BZ1 - 0.08, g);
    [F + 1.3, F + 1.5].forEach(function (y) { box(0.43, 0.04, 0.055, std({ color: 0xc8ccd0, roughness: 0.2, metalness: 0.6 }), 0.7, y, BZ1 - 0.08, g); });

    // the tea counter in the back corner: base units, worktop, kettle, coffee machine, mugs, first-aid box above
    var kx = 2.05, unitW = std({ color: 0xe9e6df, roughness: 0.6 });
    pkBevelBox(1.4, 0.88, 0.6, unitW, kx, F + 0.44, BZ1 - 0.3, g, 0.015);
    box(0.012, 0.8, 0.01, std({ color: 0x9a978f }), kx, F + 0.44, BZ1 - 0.605, g);
    [-0.08, 0.08].forEach(function (d) { box(0.02, 0.14, 0.03, M.iron, kx + d, F + 0.66, BZ1 - 0.62, g); });
    box(1.46, 0.04, 0.64, std({ color: 0x3a3f44, roughness: 0.4 }), kx, F + 0.9, BZ1 - 0.32, g);
    mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.22, 14), std({ color: 0xf2f2f0, roughness: 0.3 }), kx - 0.48, F + 1.03, BZ1 - 0.3);
    box(0.25, 0.36, 0.3, std({ color: 0x1c1f22, roughness: 0.35, metalness: 0.4 }), kx - 0.1, F + 1.1, BZ1 - 0.28, g);
    box(0.03, 0.03, 0.01, leds[0], kx - 0.02, F + 1.2, BZ1 - 0.435, g);
    for (var m = 0; m < 3; m++) mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.095, 12), enamel[m + 1], kx + 0.28 + m * 0.12, F + 0.968, BZ1 - 0.3);
    box(0.4, 0.3, 0.1, std({ color: 0x2f8a4a, roughness: 0.5 }), kx + 0.3, F + 1.55, BZ1 - 0.05, g);
    box(0.16, 0.04, 0.01, std({ color: 0xffffff }), kx + 0.3, F + 1.55, BZ1 - 0.105, g);
    box(0.04, 0.16, 0.01, std({ color: 0xffffff }), kx + 0.3, F + 1.55, BZ1 - 0.105, g);
    S_(kx - 0.7, kx + 0.7, BZ1 - 0.62, BZ1, F, F + 0.92);

    // the crew bench on the west wall, under the two screens
    var seatM = std({ color: 0x7a1f2b, roughness: 0.9 });
    pkBevelBox(0.48, 0.42, 1.8, M.timber, -3.2, F + 0.21, 19.5, g, 0.02);
    pkBevelBox(0.46, 0.08, 1.76, seatM, -3.2, F + 0.46, 19.5, g, 0.03);
    pkBevelBox(0.08, 0.4, 1.76, seatM, -3.42, F + 0.72, 19.5, g, 0.03);
    S_(-3.46, -2.96, 18.6, 20.4, F, F + 0.5);

    // the operator's mat, the bin, the extinguisher by the door, the script and headset on the desk's free end
    box(1.5, 0.014, 1.1, std({ color: 0x1c1f22, roughness: 1 }), -1.2, F + 0.027, 18.5, g);
    mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.42, 14), std({ color: 0x3a3f44, roughness: 0.6, metalness: 0.3 }), -2.95, F + 0.21, 18.08);
    S_(-3.12, -2.78, 17.91, 18.25, F, F + 0.42);
    mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.5, 14), std({ color: 0xc8241a, roughness: 0.4 }), 3.3, F + 0.29, 18.75);
    mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.08, 10), M.iron, 3.3, F + 0.58, 18.75);
    box(0.04, 0.12, 0.2, M.iron, 3.43, F + 0.3, 18.75, g);
    S_(3.2, 3.46, 18.65, 18.85, F, F + 0.6);
    box(0.32, 0.045, 0.24, std({ color: 0x2f5f9e, roughness: 0.6 }), 1.25, F + 0.768, 17.5, g);
    box(0.29, 0.012, 0.21, std({ color: 0xf4f3ee, roughness: 0.9 }), 1.25, F + 0.796, 17.5, g);
    var band = mesh(new THREE.TorusGeometry(0.09, 0.012, 8, 18, Math.PI), M.iron, 1.65, F + 0.76, 17.32); band.rotation.x = -Math.PI / 2;
    [-1, 1].forEach(function (s) { mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.035, 14), std({ color: 0x15181b, roughness: 0.7 }), 1.65 + s * 0.09, F + 0.765, 17.32); });
  }

  // ── The two consoles ─────────────────────────────────────────────
  function pkTheaterDesk(a, g, BF, BZ0) {
    var C = pkCtl(a), X = a.extra, lw = X.lightWant, parts = { lamps: {} };
    a.boothShowPanel = parts;
    // SHOW: the key, AUTO, the gate, start/pause/end, the stop, two dials and the status screen
    // both desks wear the Arena's own plate (part 14, the booth panels, has the style): ebony and stage velvet in a gilt
    // proscenium, the five riders' colours along the foot. The SHOW desk carries the running order, the thirteen scenes
    // against the show clock; the STAGE desk a level meter under every lighting circuit and a travel meter under the
    // curtain and the city gate.
    var ST = pkPnStyles().arena, crest = function (R, mx, my) { var c = R.c, cx = R.X(mx), cy = R.Y(my), cr = R.L(0.032); c.save(); c.beginPath(); c.arc(cx, cy, cr * 1.1, 0, 6.2832); c.fillStyle = ST.zone2; c.fill(); c.lineWidth = R.L(0.0025); c.strokeStyle = ST.acc; c.stroke(); c.beginPath(); c.arc(cx, cy, cr, 0, 6.2832); c.clip(); PK_PN_CRESTS.arena(c, cx, cy, cr * 0.9, ST); c.restore(); };
    var RUNT = 300, TL = { x0: 0.04, x1: 0.6, y: 0.245 }, tlX = function (t) { return TL.x0 + clamp(t / RUNT, 0, 1) * (TL.x1 - TL.x0); };
    var W1 = 1.3, H1 = 0.85, P = pkCtlPanel({
      w: W1, h: H1, x: -2.15, y: BF + 1.02, z: BZ0 + 0.55, tilt: -0.9, parent: g, key: 'pk-th-show',
      paint: function (c, W, H) { ST.base(c, W, H); }, rim: ST.rim, screw: ST.screw, glow: ST.glow,
      draw: function (c, W, H) {
        var R = pkCtlRuler(W, H, W1, H1); R.c = c;
        crest(R, -0.6, 0.372);
        pkPnText(R, ST, 'The Lindenburg Arena', -0.56, 0.374, 0.03, { align: 'left', font: ST.head });
        pkPnText(R, ST, 'SHOW CONTROL  ·  PROMPT DESK', 0.57, 0.374, 0.013, { align: 'right', col: ST.dim });
        pkPnZone(R, ST, -0.64, 0.145, -0.015, 0.335);
        pkPnZone(R, ST, 0.0, 0.145, 0.64, 0.335, 'RUNNING ORDER');
        pkPnZone(R, ST, -0.64, -0.12, -0.015, 0.11, 'HOUSE');
        pkPnZone(R, ST, 0.0, -0.12, 0.64, 0.11, 'SHOW');
        pkPnZone(R, ST, -0.64, -0.405, 0.64, -0.14);
        // the running order: the show clock as a rail, a tick and a lamp for every scene, the minutes under it
        pkPnLine(R, [[TL.x0, TL.y], [TL.x1, TL.y]], ST.dim, 0.003);
        for (var m = 0; m <= 5; m++) { var mx = tlX(m * 60); pkPnLine(R, [[mx, TL.y - 0.012], [mx, TL.y - 0.022]], ST.dim, 0.0018); pkPnText(R, ST, m + ' MIN', mx, TL.y - 0.034, 0.0095, { col: ST.dim }); }
        PK_TH_SCENES.forEach(function (sc, i) { var close = i > 0 && tlX(sc[0]) - tlX(PK_TH_SCENES[i - 1][0]) < 0.03 && i % 2; pkPnText(R, ST, String(i + 1), tlX(sc[0]), TL.y + (close ? 0.05 : 0.03), 0.0095, { col: ST.ink }); });
        pkPnText(R, ST, 'RUN', 0.135, 0.175, 0.0115, { col: ST.dim, align: 'left' }); pkPnText(R, ST, 'AUTO', 0.295, 0.175, 0.0115, { col: ST.dim, align: 'left' }); pkPnText(R, ST, 'HOLD', 0.455, 0.175, 0.0115, { col: ST.dim, align: 'left' });
        pkPnText(R, ST, 'KEY', -0.5, -0.09, 0.0125); pkPnText(R, ST, 'AUTO', -0.3, -0.09, 0.0125); pkPnText(R, ST, 'GATE', -0.1, -0.09, 0.0125);
        pkPnText(R, ST, 'START', 0.15, -0.09, 0.0125, { col: '#9fe0b0' }); pkPnText(R, ST, 'PAUSE', 0.33, -0.09, 0.0125, { col: '#f0c04a' }); pkPnText(R, ST, 'END', 0.51, -0.09, 0.0125, { col: '#ff8a7a' });
        pkPnText(R, ST, 'SEATED', -0.42, -0.375, 0.0115, { col: ST.dim }); pkPnText(R, ST, 'SHOW CLOCK', -0.17, -0.375, 0.0115, { col: ST.dim });
        pkPnText(R, ST, 'TEST SHOW', 0.13, -0.375, 0.0115, { col: '#9fc6ff' }); pkPnText(R, ST, 'STAGE STOP', 0.42, -0.375, 0.0115, { col: '#ff8a7a' });
      }
    });
    parts.key = pkCtlKey(P, -0.5, 0.0, { id: 'opKey', on: !!C.key, label: a.name + ' operator key', act: function (on) { return pkSetRideKey(a, on); } });
    parts.auto = pkCtlBtn(P, -0.3, 0.0, { id: 'auto', label: 'AUTO', col: 'white', r: 0.032, lampCol: 0xe8e4d8, prompt: 'AUTO or MANUAL', act: function () { pkBoothAuto(a); } });
    parts.gate = pkCtlBtn(P, -0.1, 0.0, { id: 'gates', label: 'GATE', col: 'green', r: 0.034, lampCol: 0x5fd38d, prompt: 'Open or shut the audience gate', act: function () { pkBoothGates(a); } });
    parts.start = pkCtlBtn(P, 0.15, 0.0, { id: 'dispatch', label: 'START', col: 'green', r: 0.042, lampCol: 0x5fd38d, prompt: 'Start the show (gate shut, curtain closed)', act: function () { pkBoothDispatch(a); } });
    parts.pause = pkCtlBtn(P, 0.33, 0.0, { id: 'pause', label: 'PAUSE', col: 'amber', r: 0.036, lampCol: 0xf0c04a, prompt: 'Pause or resume the show', act: function () { pkTheaterPause(a); } });
    parts.end = pkCtlBtn(P, 0.51, 0.0, { id: 'end', label: 'END', col: 'red', r: 0.036, lampCol: 0xff3b30, prompt: 'End the show now', act: function () { pkTheaterEnd(a); } });
    // TEST SHOW: the park's booth test run - from idle with nobody queued or seated, the whole show to an empty house
    parts.test = pkCtlBtn(P, 0.13, -0.26, { id: 'test', label: 'TEST SHOW', col: 'blue', r: 0.034, lampCol: 0x9fc6ff, prompt: 'Run the show to an empty house (idle, nobody queued)',
      act: function () { if (pkBoothTest(a)) toast(a.name + ': test show - END stops it', ''); } });
    parts.stop = pkCtlMushroom(P, 0.42, -0.25, { id: 'estop', r: 0.055, prompt: 'Stop the stage',
      act: function () { if (C.fault === 'Paused') C.fault = ''; if (!C.fault) pkBoothStop(a); },
      release: function () { if (C.fault === 'E-stop') pkBoothStop(a); } });
    parts.load = pkCtlGauge(P, -0.42, -0.26, { id: 'seats', label: '', unit: 'seated', min: 0, max: a.seats.length || 60, ticks: 6, r: 0.07, ease: 3,
      get: function () { return a.seats.length ? a.riders / a.seats.length : 0; } });
    parts.clock = pkCtlGauge(P, -0.17, -0.26, { id: 'show', label: '', unit: 'minutes', min: 0, max: 5, ticks: 5, r: 0.07, ease: 4,
      get: function () { return a.state === 'running' ? clamp(a.t / a.run, 0, 1) : 0; } });
    parts.lamps.run = pkCtlLamp(P, 0.11, 0.175, { r: 0.014, col: 0xff3b30 });
    parts.lamps.auto = pkCtlLamp(P, 0.27, 0.175, { r: 0.014, col: 0x5fd38d });
    parts.lamps.hold = pkCtlLamp(P, 0.43, 0.175, { r: 0.014, col: 0xf0c04a });
    // a lamp for every scene on the rail, and the show clock's own light running along it
    parts.scenes = PK_TH_SCENES.map(function (sc, i) { return pkPnLed(P, tlX(sc[0]), TL.y, { col: [0xe04a3a, 0x4f8fe0, 0x5fae54, 0xf0c040, 0x9a6ad0][i % 5], r: 0.0085, bezel: ST.collar }); });
    parts.clockPip = pkPnPip(P, 0.007, 0xffffff); parts.clockPip.set(TL.x0, TL.y);
    var status = touchScreen({ w: 440, h: 120, pw: 0.58, ph: 0.16, x: -0.33, y: 0.24, z: 0.012, parent: P, title: 'Show status', draw: function (c, s) {
      c.fillStyle = '#0b0606'; c.fillRect(0, 0, s.w, s.h);
      c.fillStyle = '#ff9d6b'; c.font = 'bold 22px monospace'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      var line1 = !C.key ? 'KEY OFF' : C.maint ? 'MAINTENANCE' : C.fault === 'Paused' ? 'SHOW PAUSED' : C.fault ? 'STAGE STOPPED' : a.state === 'running' ? 'SHOW RUNNING' : a.state.toUpperCase();
      c.fillText(line1 + (C.auto ? '  AUTO' : '  MANUAL'), 10, 28);
      c.font = '17px monospace';
      c.fillText('AUDIENCE ' + a.riders + '/' + a.seats.length + '   QUEUE ' + pkAttrWaiting(a), 10, 54);
      var left = a.state === 'running' ? Math.max(0, Math.ceil(a.run - a.t)) : 0;
      c.fillText(a.state === 'running' ? 'TIME LEFT ' + Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2) + '   ' + pkThSceneAt(a.t) : 'CURTAIN ' + (C.bars > 0.5 ? 'CLOSED' : 'OPEN') + '   GATE ' + (C.gateT > 0.5 ? 'OPEN' : 'SHUT'), 10, 78);
      c.fillStyle = '#c98a5a'; c.fillText(!C.key ? 'TURN THE KEY TO RUN THE ARENA' : C.auto ? 'AUTO RUNS THE SHOW BY ITSELF' : 'GATE, SEATED, GATE SHUT, CURTAIN, START', 10, 104);
    } });
    pkPowerScreen(status, function () { return !!a.open; });
    PK_BK_LIVE.push({ sc: status, g: P, every: 0.5 });
    pkCtlSetPower(P, function () { return !!a.open; });

    // STAGE: the curtain, the city gate, four lighting circuits, five mechanics and the cue screen
    var W2 = 1.6, H2 = 0.85, Q = pkCtlPanel({
      w: W2, h: H2, x: -0.35, y: BF + 1.02, z: BZ0 + 0.55, tilt: -0.9, parent: g, key: 'pk-th-stage',
      paint: function (c, W, H) { ST.base(c, W, H); }, rim: ST.rim, screw: ST.screw, glow: ST.glow,
      draw: function (c, W, H) {
        var R = pkCtlRuler(W, H, W2, H2); R.c = c;
        crest(R, -0.75, 0.372);
        pkPnText(R, ST, 'Stage  ·  Lights  ·  Mechanics', -0.71, 0.374, 0.028, { align: 'left', font: ST.head });
        pkPnText(R, ST, 'THE LINDENBURG ARENA  ·  STAGE MANAGER', 0.72, 0.374, 0.012, { align: 'right', col: ST.dim });
        pkPnZone(R, ST, -0.78, -0.005, -0.32, 0.33, 'SCENERY');
        pkPnZone(R, ST, -0.3, -0.005, 0.78, 0.33, 'LIGHTING');
        pkPnZone(R, ST, -0.78, -0.325, 0.38, -0.025, 'MECHANICS AND EFFECTS');
        pkPnZone(R, ST, 0.4, -0.325, 0.78, -0.025, 'PROMPT');
        pkPnText(R, ST, 'CURTAIN', -0.65, 0.07, 0.0125); pkPnText(R, ST, 'CITY GATE', -0.45, 0.07, 0.0125);
        pkPnText(R, ST, 'HOUSE', -0.09, 0.07, 0.0125); pkPnText(R, ST, 'ARENA WASH', 0.15, 0.07, 0.0125); pkPnText(R, ST, 'FOLLOW SPOT', 0.39, 0.07, 0.0125); pkPnText(R, ST, 'CITY', 0.63, 0.07, 0.0125);
        pkPnText(R, ST, 'HYDRA', -0.64, -0.28, 0.0125); pkPnText(R, ST, 'FIRE', -0.42, -0.28, 0.0125); pkPnText(R, ST, 'MOAT', -0.2, -0.28, 0.0125);
        pkPnText(R, ST, 'THUNDER', 0.02, -0.28, 0.0125); pkPnText(R, ST, 'BOW', 0.24, -0.28, 0.0125);
        pkPnText(R, ST, 'CUE LAMPS: SLOW = STANDBY  ·  FAST = GO', -0.2, -0.372, 0.0115, { col: '#f0c04a' });
      }
    });
    var tog = function (name, x, on, onName, offName, prompt) {
      return pkCtlToggle(Q, x, 0.17, { id: name, on: on, onName: onName, offName: offName, prompt: prompt, act: function (want) { pkThOp(a, name, want ? 1 : 0); sfx('click'); return true; } });
    };
    parts.curtain = tog('curtain', -0.65, true, 'closed', 'open', 'The great curtain');
    parts.cityGate = tog('cityGate', -0.45, false, 'open', 'shut', 'The city gate doors');
    parts.house = tog('house', -0.09, true, 'up', 'down', 'House lights');
    parts.wash = tog('wash', 0.15, false, 'on', 'off', 'Arena wash');
    parts.spot = tog('spot', 0.39, false, 'on', 'off', 'Follow spot');
    parts.city = tog('city', 0.63, false, 'lit', 'dark', 'City windows');
    var btn = function (name, x, col, lampCol, prompt, want) {
      return pkCtlBtn(Q, x, -0.17, { id: name, label: name.toUpperCase(), col: col, r: 0.034, lampCol: lampCol, prompt: prompt, act: function () { pkThOp(a, name, want ? want() : null); } });
    };
    parts.hydra = btn('hydra', -0.64, 'amber', 0xe2a021, 'Raise or lower the hydra', function () { return X.hydraUp ? 0 : 1; });
    parts.fire = btn('fire', -0.42, 'red', 0xff6a1a, 'Fire in the braziers');
    parts.moat = btn('moat', -0.2, 'blue', 0x2f6fb3, 'The moat lift: up or down', function () { return X.moatUp ? 0 : 1; });
    parts.thunder = btn('thunder', 0.02, 'white', 0xd8e6ff, 'A flash and a crash');
    parts.bow = btn('bow', 0.24, 'green', 0x5fd38d, 'The cast takes a bow (with no show running: a curtain call)');
    // a cue lamp over every stage control: it blinks when that control is the operator's next cue
    parts.cue = {};
    [['curtain', -0.65, 0.265], ['cityGate', -0.45, 0.265], ['house', -0.09, 0.265], ['wash', 0.15, 0.265], ['spot', 0.39, 0.265], ['city', 0.63, 0.265],
      ['hydra', -0.64, -0.065], ['fire', -0.42, -0.065], ['moat', -0.2, -0.065], ['thunder', 0.02, -0.065], ['bow', 0.24, -0.065]].forEach(function (q) {
      parts.cue[q[0]] = pkCtlLamp(Q, q[1], q[2], { r: 0.013, col: 0xf0c04a });
    });
    // a bar of six lamps under every lighting circuit, lit to its level; under the curtain and the gate, how far they have run
    var meter = function (x, col) { var ls = []; for (var i = 0; i < 6; i++) ls.push(pkPnLed(Q, x - 0.06 + i * 0.024, 0.032, { col: i > 3 ? 0xff9d6b : col, r: 0.0075, bezel: ST.collar })); return ls; };
    parts.meters = { curtain: meter(-0.65, 0xe3c26a), cityGate: meter(-0.45, 0xe3c26a), house: meter(-0.09, 0xfff0c8), wash: meter(0.15, 0xffd27a), spot: meter(0.39, 0xd8e6ff), city: meter(0.63, 0xffb04a) };
    var cue = touchScreen({ w: 240, h: 150, pw: 0.34, ph: 0.21, x: 0.6, y: -0.19, z: 0.012, parent: Q, title: 'Cue screen', draw: function (c, s) {
      c.fillStyle = '#060a0e'; c.fillRect(0, 0, s.w, s.h);
      c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      var n = pkThNextOp(a);
      if (a.state !== 'running') { c.fillStyle = '#9fc6ff'; c.font = 'bold 15px monospace'; c.fillText('NO SHOW RUNNING', 8, 22); }
      else if (C.auto) { c.fillStyle = '#9fc6ff'; c.font = 'bold 15px monospace'; c.fillText('AUTO: SCRIPT HAS', 8, 22); c.fillText('THE CUES', 8, 40); }
      else if (n) {
        var blink = Math.floor(PK_BK_T * (n.go ? 6 : 1.6)) % 2 === 0;
        c.fillStyle = n.go ? (blink ? '#ffd166' : '#8a6a20') : '#f0c04a'; c.font = 'bold 17px monospace';
        c.fillText(n.go ? 'GO' : 'STANDBY', 8, 22);
        c.font = 'bold 14px monospace'; c.fillStyle = '#ffe6a0'; c.fillText(pkThOpName(n.cue.op, n.cue.want), 8, 42);
        c.font = '13px monospace'; c.fillStyle = '#c9b48a';
        c.fillText(n.go ? 'TAKEN FOR YOU IN ' + Math.max(0, Math.ceil(n.cue.t + PK_TH_LATE - a.t)) + ' S' : 'IN ' + Math.max(0, Math.ceil(n.cue.t - a.t)) + ' S', 8, 60);
      } else { c.fillStyle = '#6f8ea8'; c.font = 'bold 15px monospace'; c.fillText('NO CUE STANDING BY', 8, 22); }
      c.font = '13px monospace';
      var fx = [['CURTAIN', C.bars < 0.5 ? 'OPEN' : 'CLOSED'], ['HYDRA', X.hydraUp ? 'UP' : 'DOWN'], ['MOAT', X.moatUp ? 'UP' : 'DOWN'], ['MISSED', String(X.missed || 0)]];
      fx.forEach(function (f, i) { c.fillStyle = '#6f8ea8'; c.fillText(f[0], 8, 84 + i * 18); c.fillStyle = '#d7e6ff'; c.fillText(f[1], 120, 84 + i * 18); });
    } });
    pkPowerScreen(cue, function () { return !!a.open; });
    PK_BK_LIVE.push({ sc: cue, g: Q, every: 0.5 });
    pkCtlSetPower(Q, function () { return !!a.open; });

    // the hardware follows the show, whoever drives it
    pkCtlLive({ tick: function () {
      parts.lamps.run.on = a.state === 'running';
      parts.lamps.auto.on = !!C.auto && !C.maint;
      parts.lamps.hold.on = !!C.fault;
      parts.auto.setLit(!!C.auto);
      parts.gate.setLit(C.gateT > 0.5);
      parts.start.setLit((a.state === 'boarding' || a.state === 'ready') && a.riders > 0 && !C.gates && C.barsWant >= 0.5 && !C.auto);
      parts.pause.setLit(C.fault === 'Paused');
      parts.end.setLit(a.state === 'running');
      parts.test.setLit(a.state === 'running' && a.riders === 0);
      Object.keys(parts.cue).forEach(function (op) { parts.cue[op].on = pkThCueLamp(a, op); });
      parts.hydra.setLit(!!X.hydraUp || parts.cue.hydra.on); parts.fire.setLit(X.fire > 0 || parts.cue.fire.on); parts.moat.setLit(!!X.moatUp || parts.cue.moat.on);
      parts.thunder.setLit(parts.cue.thunder.on); parts.bow.setLit(parts.cue.bow.on);
      if (parts.key.on !== !!C.key) parts.key.set(!!C.key);
      if (parts.curtain.on !== (C.barsWant >= 0.5)) parts.curtain.set(C.barsWant >= 0.5);
      if (parts.cityGate.on !== (X.gateWant > 0.5)) parts.cityGate.set(X.gateWant > 0.5);
      if (parts.house.on !== (lw.house > 0.5)) parts.house.set(lw.house > 0.5);
      if (parts.wash.on !== (lw.wash > 0)) parts.wash.set(lw.wash > 0);
      if (parts.spot.on !== (lw.spot > 0)) parts.spot.set(lw.spot > 0);
      if (parts.city.on !== (lw.city > 0.5)) parts.city.set(lw.city > 0.5);
      // the running order and the meters
      var run = a.state === 'running', now = run ? a.t : 0, cur = -1;
      PK_TH_SCENES.forEach(function (sc, i) { if (run && now >= sc[0]) cur = i; });
      parts.scenes.forEach(function (l, i) { l.on = !a.open ? false : i === cur ? (C.fault ? 'flash' : true) : i < cur ? 'dim' : false; });
      parts.clockPip.set(tlX(now), TL.y + 0.018); pkPnPipLight(parts.clockPip, run ? 1 : 0, 0.05);
      var lvl = { curtain: C.bars, cityGate: X.gateK, house: lw.house / 1.4, wash: lw.wash / 2.2, spot: lw.spot / 3, city: lw.city / 1.1 };
      Object.keys(parts.meters).forEach(function (k) { var v = clamp(lvl[k] || 0, 0, 1); parts.meters[k].forEach(function (l, i) { l.on = a.open && v > (i + 0.5) / 6 - 0.001; }); });
    } });

    // what every booth in the park carries (part 09 and the smoke test read these); no boothFrame, so hired operators leave it be
    var anchor = new THREE.Group(); anchor.position.set(PK_TH.CX - 2.15, BF + 1.02, PK_TH.CZ + BZ0 + 0.55); scene.add(anchor);
    a.booth = anchor; a.boothScreen = status;
    a.boothPanel = { panel: P, buttons: { gates: parts.gate, dispatch: parts.start, auto: parts.auto }, stop: parts.stop, load: parts.load, key: parts.key };
  }

  // ── The wall screens: the running order and a plan of the arena ─────────────────────────────────────────────────
  var PK_TH_SCENES = [[0, 'House to half'], [3, 'Curtain up: the Keeper'], [26, 'The gate: five riders'], [58, 'The salute'], [72, 'Training in the square'],
    [98, 'Count Grimwald rises'], [124, 'The guards'], [149, 'The hydra wakes'], [183, 'Five riders, five gifts'], [203, 'The hydra falls'],
    [219, 'Lindenburg saved'], [256, 'The bow'], [270, 'Exit and curtain']];
  function pkThSceneAt(t) { var n = PK_TH_SCENES[0][1]; PK_TH_SCENES.forEach(function (s) { if (t >= s[0]) n = s[1]; }); return n.toUpperCase(); }
  function pkTheaterWallScreens(a, g, BF, BZ0, BX) {
    var X = a.extra;
    function mount(z, w, h, title, draw) {
      var m = new THREE.Group(); m.position.set(-BX + 0.1, BF + 1.55, z); m.rotation.y = Math.PI / 2; g.add(m);
      pkBevelBox(w + 0.08, h + 0.08, 0.05, pkBkStd({ color: 0x23292e, roughness: 0.5, metalness: 0.3 }), 0, 0, -0.03, m, 0.01);
      var sc = touchScreen({ w: 512, h: Math.round(512 * h / w), pw: w, ph: h, x: 0, y: 0, z: 0.0, parent: m, title: title, draw: draw });
      pkPowerScreen(sc, function () { return !!a.open; });
      PK_BK_LIVE.push({ sc: sc, g: m, every: 0.5 });
      return sc;
    }
    mount(BZ0 + 1.25, 1.15, 0.7, 'Show running order', function (c, s) {
      c.fillStyle = '#0a0806'; c.fillRect(0, 0, s.w, s.h);
      c.fillStyle = '#f0c04a'; c.font = 'bold 20px monospace'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      c.fillText('THE FIVE RIDERS OF LINDENBURG', 12, 26);
      var t = a.state === 'running' ? a.t : -1, rowH = (s.h - 60) / PK_TH_SCENES.length;
      PK_TH_SCENES.forEach(function (sc, i) {
        var next = PK_TH_SCENES[i + 1], live = t >= sc[0] && (!next || t < next[0]), done = t >= 0 && next && t >= next[0], y = 46 + i * rowH;
        if (live) { c.fillStyle = 'rgba(240,192,74,0.22)'; c.fillRect(6, y - rowH + 6, s.w - 12, rowH); }
        c.fillStyle = live ? '#ffe6a0' : done ? '#6b5a3a' : '#c9b48a'; c.font = (live ? 'bold ' : '') + '15px monospace';
        c.fillText(Math.floor(sc[0] / 60) + ':' + ('0' + sc[0] % 60).slice(-2) + '  ' + sc[1].toUpperCase(), 14, y);
      });
      c.fillStyle = '#3a2a14'; c.fillRect(12, s.h - 16, s.w - 24, 8);
      if (t >= 0) { c.fillStyle = '#f0c04a'; c.fillRect(12, s.h - 16, (s.w - 24) * clamp(t / a.run, 0, 1), 8); }
    });
    mount(BZ0 + 3.0, 1.15, 0.7, 'Arena plan', function (c, s) {
      c.fillStyle = '#06100a'; c.fillRect(0, 0, s.w, s.h);
      var x0 = -27, x1 = 27, z0 = -31, z1 = 22, sx = s.w / (x1 - x0), sz = s.h / (z1 - z0), P = function (x, z) { return [(x - x0) * sx, (z - z0) * sz]; };
      function rect(ax, az, bx, bz, col) { var p = P(ax, az), q = P(bx, bz); c.fillStyle = col; c.fillRect(p[0], p[1], q[0] - p[0], q[1] - p[1]); }
      rect(-20, -13, 20, 10, '#3a3020'); rect(-26, -17.7, 26, -16.3, '#6a4a3a'); rect(-5, -17.7, 5, -13.4, '#8a7a5a');
      rect(8.9, -12.1, 17.1, -7.1, X.moatUp ? '#2a6aa8' : '#1a3a5a'); rect(-14.6, 10, 14.6, 21.4, '#2a3a2a'); rect(-3.6, 16.9, 3.6, 21.4, '#3a5a3a');
      var seated = 0; a.seats.forEach(function (st) { if (st.guest && st.guest.state === 'seated') { seated++; var p = P(st.x, st.z); c.fillStyle = '#8fe0a0'; c.fillRect(p[0] - 2, p[1] - 2, 4, 4); } });
      if (X.hydraUp || (X.hydra && X.hydra.y > -10)) { var hp = P(0, -22); c.fillStyle = '#ff6a2a'; c.beginPath(); c.arc(hp[0], hp[1], 12, 0, 6.283); c.fill(); }
      var cast = X.cast; if (cast) Object.keys(cast).forEach(function (k) { var A = cast[k]; if (!A.on) return; var p = P(A.x, A.z); c.fillStyle = A.col || '#fff'; c.beginPath(); c.arc(p[0], p[1], 5, 0, 6.283); c.fill(); });
      c.fillStyle = '#8fe0a0'; c.font = 'bold 14px monospace'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      c.fillText('ARENA PLAN   SEATED ' + seated + '/' + a.seats.length, 8, 18);
    });
  }

  // ── Pause and end: the ride plumbing has neither, so these two are the arena's own ────────────────────────────
  // Pause sets the ride's fault: pkAttrTick returns before the clock, so the show, the cast and the effects hold where they
  // are. Lifting it carries on from there; unlike an E-stop reset it does not skip the show to its last seconds.
  function pkTheaterPause(a) {
    var C = pkCtl(a);
    if (!a.open) return pkBoothRefuse(a.name + ' has no power - the breaker is off');
    if (a.state !== 'running') return pkBoothRefuse('There is no show running');
    if (C.fault === 'Paused') { C.fault = ''; sfx('ok'); toast(a.name + ': the show goes on', 'good'); }
    else if (!C.fault) { C.fault = 'Paused'; C.spd = 0; sfx('click'); toast(a.name + ': show paused', ''); }
    screenDirtyAll(); hudDirty = true;
    return true;
  }
  function pkTheaterEnd(a) {
    var C = pkCtl(a);
    if (!a.open) return pkBoothRefuse(a.name + ' has no power - the breaker is off');
    if (a.state !== 'running') return pkBoothRefuse('There is no show running');
    if (C.fault === 'Paused') C.fault = '';
    a.t = a.run;   // the ride plumbing ends it on its next tick, and the arena tidies itself when it sees that
    sfx('chime'); toast(a.name + ': the show is ended early', '');
    return true;
  }

  // ── The horses ───────────────────────────────────────────────────
  function pkThHorse(coat, colour) {
    var g = new THREE.Group(); g.userData.dynamic = true; g.visible = false; scene.add(g);
    var hide = std({ color: coat, roughness: 0.7 }), dark = std({ color: 0x1c1612, roughness: 0.85 }), tack = std({ color: 0x4a2e1a, roughness: 0.7 });
    var body = new THREE.Group(); g.add(body);
    var add = function (geo, mat, x, y, z, rx, par) { var m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rx) m.rotation.x = rx; m.castShadow = true; (par || body).add(m); return m; };
    add(new THREE.CylinderGeometry(0.4, 0.38, 1.3, 14), hide, 0, 1.18, 0, Math.PI / 2);
    add(new THREE.SphereGeometry(0.42, 14, 10), hide, 0, 1.2, 0.62);
    add(new THREE.SphereGeometry(0.44, 14, 10), hide, 0, 1.22, -0.62);
    var neck = add(new THREE.CylinderGeometry(0.17, 0.27, 0.95, 10), hide, 0, 1.62, 0.92, 0.62);
    add(new THREE.BoxGeometry(0.07, 0.95, 0.12), dark, 0, 0.02, -0.17, 0, neck);
    var head = add(new THREE.BoxGeometry(0.24, 0.26, 0.62), hide, 0, 1.98, 1.3, 0.75);
    add(new THREE.BoxGeometry(0.2, 0.2, 0.18), dark, 0, -0.03, 0.32, 0, head);
    [-1, 1].forEach(function (s) { add(new THREE.ConeGeometry(0.05, 0.16, 6), hide, s * 0.08, 0.17, -0.22, 0, head); });
    add(new THREE.CylinderGeometry(0.05, 0.13, 0.85, 8), dark, 0, 1.0, -1.08, -0.45);
    add(new THREE.BoxGeometry(0.86, 0.5, 0.78), std({ color: colour, roughness: 0.8 }), 0, 1.42, -0.05);
    add(new THREE.BoxGeometry(0.5, 0.1, 0.58), tack, 0, 1.62, -0.05);
    var legs = [[-0.2, 0.58], [0.2, 0.58], [-0.2, -0.58], [0.2, -0.58]].map(function (p) {
      var piv = new THREE.Group(); piv.position.set(p[0], 1.0, p[1]); body.add(piv);
      add(new THREE.CylinderGeometry(0.08, 0.06, 0.92, 8), hide, 0, -0.46, 0, 0, piv);
      add(new THREE.BoxGeometry(0.13, 0.1, 0.16), dark, 0, -0.94, 0.02, 0, piv);
      return piv;
    });
    // a banner pole in a socket by the saddle, the rider's colour flying from it; it glows when the gifts are called
    add(new THREE.CylinderGeometry(0.025, 0.025, 2.4, 6), std({ color: 0x6a4a2a, roughness: 0.7 }), 0.34, 2.3, -0.35);
    var pm = pkThGlow(colour, 0.0, colour), sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0, 0.5); sh.lineTo(-0.85, 0.25); sh.lineTo(0, 0);
    var pen = add(new THREE.ShapeGeometry(sh), pm, 0.34, 3.0, -0.35); pen.rotation.y = Math.PI / 2;
    return { g: g, body: body, legs: legs, ph: Math.random() * 6, pennant: pm };
  }
  function pkThHorseTick(H, dt, spd) {
    var k = Math.min(1, spd / 4), amp = spd > 0.05 ? 0.15 + 0.5 * k : 0;
    H.ph += dt * (2.2 + spd * 1.7);
    var s = H.ph;
    H.legs[0].rotation.x = Math.sin(s) * amp; H.legs[1].rotation.x = Math.sin(s + 0.5) * amp;
    H.legs[2].rotation.x = Math.sin(s + Math.PI) * amp; H.legs[3].rotation.x = Math.sin(s + Math.PI + 0.5) * amp;
    H.body.position.y = amp ? Math.abs(Math.sin(s)) * 0.08 * (0.4 + k) : 0;
    H.body.rotation.x = amp ? Math.sin(s) * 0.04 * k : 0;
  }
  // astride: the sit pose's thighs eased down and spread round the barrel
  function pkThRiderLegs(g) {
    var u = g.userData; if (!u.legs) return;
    u.legs.forEach(function (L, i) { L.rotation.x = -0.6; L.rotation.z = i ? 0.42 : -0.42; L.userData.knee.rotation.x = 0.95; });
  }

  // ── The cast ─────────────────────────────────────────────────────
  var PK_TH_RIDERS = [
    ['fenna', 'Fenna', 'wind', 0x9fd0ff, 0xf2efe8, 'long'], ['bas', 'Bas', 'fire', 0xd9472b, 0x7a4a2a, 'short'], ['jet', 'Jet', 'water', 0x2f6fb3, 0x1c1a1a, 'bun'],
    ['wout', 'Wout', 'earth', 0x4d7a3a, 0x8a8a86, 'short'], ['isa', 'Isa', 'light', 0xf0c04a, 0x5a3a24, 'long']];
  function pkThActor(key, look, horse) {
    look.key = 'theater:' + key; look.glasses = false;
    var g = makeHuman(look), A = { key: key, g: g, root: g, horse: null, x: 0, z: -24, y: 0.05, yaw: 0, face: 0, path: [], loop: null, speed: 1.5, on: false, hideAtEnd: false };
    g.userData.dynamic = true;
    if (horse) { A.horse = horse; A.root = horse.g; horse.body.add(g); g.position.set(0, 0.86, -0.05); g.userData.baseY = 0.86; }
    else { g.visible = false; scene.add(g); }
    return A;
  }
  function pkTheaterCast(a) {
    if (a.extra.cast) return a.extra.cast;
    var cast = {};
    PK_TH_RIDERS.forEach(function (r) {
      var A = pkThActor(r[0], { style: r[5], shirt: std({ map: TEX.cloth, color: r[3], roughness: 0.9 }), pants: std({ color: 0x3a3226, roughness: 0.9 }), noBeard: true }, pkThHorse(r[4], r[3]));
      A.name = r[1]; A.gift = r[2]; A.col = '#' + ('00000' + r[3].toString(16)).slice(-6); A.rider = true; cast[r[0]] = A;
    });
    var armour = std({ color: 0x55595e, roughness: 0.35, metalness: 0.7 });
    ['guard1', 'guard2'].forEach(function (k) {
      var A = pkThActor(k, { style: 'short', shirt: std({ map: TEX.cloth, color: 0x2a2d33, roughness: 0.9 }), pants: std({ color: 0x15171a, roughness: 0.9 }), vest: armour, hardhat: armour }, null);
      pkRoundCyl(0.025, 2.4, std({ color: 0x5a3a24, roughness: 0.8 }), 0.34, 1.2, 0.12, A.g, 6);
      var tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 6), armour); tip.position.set(0.34, 2.55, 0.12); A.g.add(tip);
      A.col = '#7d858d'; A.speed = 2.6; cast[k] = A;
    });
    var count = pkThActor('count', { style: 'short', hair: 0x101010, beard: true, shirt: std({ map: TEX.cloth, color: 0x2a1030, roughness: 0.9 }), pants: std({ color: 0x0e0a10, roughness: 0.9 }) }, null);
    var u = count.g.userData, crown = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.03, 6, 14), pkMats().gold); crown.rotation.x = Math.PI / 2; crown.position.y = 0.43; u.head.add(crown);
    var cape = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 1.15), std({ color: 0x5a0a14, roughness: 0.85, side: THREE.DoubleSide })); cape.position.set(0, 0.12, -0.16); u.torso.add(cape);
    count.col = '#b04a6a'; cast.count = count;
    var keeper = pkThActor('keeper', { style: 'long', hair: 0xc8c8c8, noBeard: true, shirt: std({ map: TEX.cloth, color: 0xf1e6cc, roughness: 0.9 }), pants: std({ color: 0xe6dcc0, roughness: 0.9 }) }, null);
    var ku = keeper.g.userData, circ = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.018, 6, 14), std({ color: 0xd8dde2, roughness: 0.3, metalness: 0.9 })); circ.rotation.x = Math.PI / 2; circ.position.y = 0.4; ku.head.add(circ);
    keeper.col = '#f1e6cc'; cast.keeper = keeper;
    a.extra.cast = cast;
    return cast;
  }
  function pkThShow(A, x, z, face) { A.on = true; A.root.visible = true; A.g.visible = true; A.x = x; A.z = z; A.yaw = face === undefined ? A.yaw : face; A.face = A.yaw; A.path = []; A.loop = null; A.hideAtEnd = false; }
  // a rider's horse goes back to its stall in the yard (part 37 gives it one), saddled and riderless; everyone else drops out of sight
  function pkThHide(A) {
    A.on = false; A.path = []; A.loop = null;
    if (A.horse && A.stall) { A.root.visible = true; A.g.visible = false; A.root.position.copy(A.stall); A.root.rotation.y = 0; pkThHorseTick(A.horse, 0, 0); }
    else A.root.visible = false;
  }
  function pkThGo(A, pts, speed, opt) {
    A.path = pts.map(function (p) { return { x: p[0], z: p[1] }; }); A.speed = speed || A.speed;
    A.loop = opt && opt.loop ? opt.loop.map(function (p) { return { x: p[0], z: p[1] }; }) : null;
    A.hideAtEnd = !!(opt && opt.hide); if (opt && opt.face !== undefined) A.face = opt.face;
  }
  function pkThActorTick(A, dt) {
    var moving = false;
    if (A.path.length) {
      var p = A.path[0], dx = p.x - A.x, dz = p.z - A.z, d = Math.hypot(dx, dz), step = A.speed * dt;
      if (d > 0.01) { var want = Math.atan2(dx, dz); A.yaw += Math.atan2(Math.sin(want - A.yaw), Math.cos(want - A.yaw)) * Math.min(1, dt * (A.horse ? 4 : 8)); }
      if (d <= step) {
        A.x = p.x; A.z = p.z; A.path.shift();
        if (!A.path.length && A.loop) A.path = A.loop.map(function (q) { return { x: q.x, z: q.z }; });
        if (!A.path.length && A.hideAtEnd) { pkThHide(A); return; }
      } else { A.x += dx / d * step; A.z += dz / d * step; }
      moving = true;
    } else A.yaw += Math.atan2(Math.sin(A.face - A.yaw), Math.cos(A.face - A.yaw)) * Math.min(1, dt * 3);
    A.root.position.set(PK_TH.CX + A.x, A.y, PK_TH.CZ + A.z); A.root.rotation.y = A.yaw;
    if (A.horse) { pkThHorseTick(A.horse, dt, moving ? A.speed : 0); animateHuman(A.g, dt, 'sit', 0, null, false); pkThRiderLegs(A.g); }
    else { A.g.userData.baseY = A.y; animateHuman(A.g, dt, moving ? 'walk' : 'idle', A.speed, null, false); }
    // a bow: down from the waist and up again
    var T2 = A.g.userData.torso;
    if (A.bowT > 0) { A.bowT -= dt; T2.rotation.x = Math.sin(clamp(1 - A.bowT / 1.8, 0, 1) * Math.PI) * 0.6; }
    else if (T2.rotation.x) T2.rotation.x = 0;
  }
  function pkThSay(a, who, text) { var A = pkTheaterCast(a)[who]; if (A && A.on) say(A.g, text); }

  // ── The hydra: five necks and a pair of wings on a body that rises behind the wall ─────────────────────────────
  // A sculpted show beast: a scaled body with a plated belly and a ridge of back spikes, two forelegs whose claws come to
  // grip the city wall as it rises, a tail curled down into the pit, bat wings on finger bones, and five necks of tapered,
  // scaled segments with a spine fin down each. Every head has a long snout, a heavy brow, swept horns and a spiked frill,
  // glowing eyes and nostrils, and a jaw full of teeth that drops when it breathes fire.
  var PK_TH_SCALES = null;
  function pkThScaleMats() {
    if (PK_TH_SCALES) return PK_TH_SCALES;
    var skin = tex(512, 512, function (c, W, H) {
      c.fillStyle = '#26432d'; c.fillRect(0, 0, W, H);
      for (var row = 0, y = -16; y < H + 32; y += 16, row++) for (var x = (row % 2) * 16 - 32; x < W + 32; x += 32) {
        var g = c.createRadialGradient(x, y - 6, 2, x, y, 20); g.addColorStop(0, '#5f9a5a'); g.addColorStop(0.7, '#2f5a38'); g.addColorStop(1, '#1a3020');
        c.fillStyle = g; c.beginPath(); c.arc(x, y, 18, 0, Math.PI); c.fill();
        c.strokeStyle = 'rgba(10,20,12,0.6)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 18, 0, Math.PI); c.stroke();
      }
    }, 3, 3);
    var plates = tex(256, 256, function (c, W, H) {
      c.fillStyle = '#b09a5a'; c.fillRect(0, 0, W, H);
      for (var y = 0; y < H; y += 32) { var g = c.createLinearGradient(0, y, 0, y + 32); g.addColorStop(0, '#d8c48a'); g.addColorStop(1, '#7a683a'); c.fillStyle = g; c.fillRect(0, y + 2, W, 28); }
    }, 1, 2);
    PK_TH_SCALES = {
      skin: std({ map: skin, color: 0xffffff, roughness: 0.5, metalness: 0.15 }),
      dark: std({ color: 0x1a2a1e, roughness: 0.6, metalness: 0.1 }),
      belly: std({ map: plates, roughness: 0.6 }),
      horn: std({ color: 0xe6d6a6, roughness: 0.45 }),
      tooth: std({ color: 0xf4efe0, roughness: 0.35 }),
      mouth: std({ color: 0x5a1414, roughness: 0.7 }),
      wing: std({ color: 0x4a2a3a, roughness: 0.75, side: THREE.DoubleSide, transparent: true, opacity: 0.92 }),
      bone: std({ color: 0x6a5a3a, roughness: 0.6 }),
      eye: pkThGlow(0xffa01a, 2.6), nostril: pkThGlow(0xff4a10, 1.2)
    };
    return PK_TH_SCALES;
  }
  function pkThHydra(g) {
    var root = pkMover(g, 0, -11, -22.5); root.visible = false;
    var Q = pkThScaleMats(), add = function (geo, mat, x, y, z, par) { var m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; (par || root).add(m); return m; };
    // the body: a long barrel, the belly plates down its front, the spikes along its ridge
    var body = add(new THREE.SphereGeometry(3.2, 28, 18), Q.skin, 0, 4.2, 0); body.scale.set(1.25, 0.9, 1.0);
    var belly = add(new THREE.SphereGeometry(3.05, 24, 14, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.5), Q.belly, 0, 4.1, 0.25); belly.scale.set(1.0, 0.92, 1.0);
    for (var sp = 0; sp < 9; sp++) { var a = -0.9 + sp * 0.225, sk = add(new THREE.ConeGeometry(0.28, 1.3 - Math.abs(a) * 0.5, 6), Q.horn, Math.sin(a) * 3.3, 4.2 + Math.cos(a) * 2.75, -0.9); sk.rotation.z = -a; sk.rotation.x = -0.35; }
    // the forelegs: shoulder, an upper limb that reaches up over the city wall, a fore limb laid along the gatehouse's
    // battlements, and a foot whose four claws hook over the gatehouse's front edge. The feet sit in the crenel gaps either
    // side of the spire (x 4.03), the one stretch of the city's skyline the whole stand sees: the wall itself is behind the
    // houses, and the towers flank the gatehouse. (Risen, the root is at y 0, z -22.5: the gatehouse top is 9.6 high and
    // its front 9.1 ahead of the root; the wall's merlons top out at 8.15, 5.5 ahead.)
    // Each foreleg hangs on a pivot at its shoulder: held up and back behind the wall while the body climbs, swung forward
    // over the last three metres of the rise so the claws come down on the battlements (pkThHydraTick)
    var legs = [-1, 1].map(function (s) {
      var sh = new THREE.Vector3(s * 2.9, 4.6, 1.6), el = new THREE.Vector3(s * 4.03, 11.3, 5.4).sub(sh), ft = new THREE.Vector3(s * 4.03, 10.75, 8.35).sub(sh), o = new THREE.Vector3();   // the foot on the merlons' tops (10.4)
      add(new THREE.SphereGeometry(1.0, 14, 10), Q.skin, sh.x, sh.y, sh.z);
      var leg = new THREE.Group(); leg.position.copy(sh); root.add(leg);
      [[o, el, 0.85, 0.7], [el, ft, 0.66, 0.52]].forEach(function (L) { var d = L[1].clone().sub(L[0]), m = add(new THREE.CylinderGeometry(L[3], L[2], d.length(), 12), Q.skin, (L[0].x + L[1].x) / 2, (L[0].y + L[1].y) / 2, (L[0].z + L[1].z) / 2, leg); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); });
      add(new THREE.SphereGeometry(0.74, 12, 9), Q.skin, el.x, el.y, el.z, leg);
      var foot = add(new THREE.SphereGeometry(0.7, 14, 10), Q.skin, ft.x, ft.y, ft.z, leg); foot.scale.set(1.45, 0.55, 1.25);
      // four toes over the edge, each ending in a hooked claw that bites into the gatehouse's face
      for (var c2 = 0; c2 < 4; c2++) {
        var tx2 = ft.x + (c2 - 1.5) * 0.36;
        var toe = add(new THREE.CylinderGeometry(0.12, 0.17, 0.7, 8), Q.skin, tx2, ft.y - 0.2, ft.z + 0.82, leg); toe.rotation.x = 1.25;
        var cl = add(new THREE.ConeGeometry(0.15, 1.05, 6), Q.horn, tx2, ft.y - 0.85, ft.z + 1.02, leg); cl.rotation.x = Math.PI + 0.25;
      }
      leg.rotation.x = -0.9;
      return leg;
    });
    // the tail, curling down behind into the pit
    for (var tk = 0; tk < 8; tk++) { var tt = tk / 7, tx = Math.sin(tt * 2.4) * 2.2, ty = 3.2 - tt * 3.6, tz = -2.8 - tt * 2.4; add(new THREE.SphereGeometry(1.15 - tt * 0.8, 12, 9), Q.skin, tx, ty, tz); }
    // the wings: a membrane on four finger bones and a thumb claw at the wrist
    var wings = [-1, 1].map(function (s) {
      var piv = new THREE.Group(); piv.position.set(s * 2.6, 8.4, -0.8); root.add(piv);
      var sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(s * 3.2, 3.0); sh.lineTo(s * 7.4, 4.0); sh.quadraticCurveTo(s * 7.2, 2.6, s * 8.6, 1.4); sh.quadraticCurveTo(s * 7.0, 0.9, s * 7.4, -0.8);
      sh.quadraticCurveTo(s * 6.0, -0.4, s * 5.3, -2.2); sh.quadraticCurveTo(s * 4.2, -1.0, s * 2.6, -1.4); sh.lineTo(0, 0);
      piv.add(new THREE.Mesh(new THREE.ShapeGeometry(sh, 6), Q.wing));
      pkRod(0, 0, 0.03, s * 3.2, 3.0, 0.03, 0.12, Q.bone, piv, 6);
      [[7.4, 4.0], [8.6, 1.4], [7.4, -0.8], [5.3, -2.2]].forEach(function (q) { pkRod(s * 3.2, 3.0, 0.03, s * q[0], q[1], 0.03, 0.06, Q.bone, piv, 5); });
      var th = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.6, 6), Q.horn); th.position.set(s * 3.2, 3.35, 0.05); piv.add(th);
      return piv;
    });
    // the necks: tapered segments (re-laid every frame along each neck's curve), a joint between each, a fin on each
    var necks = [], NS = 8, cylGeo = new THREE.CylinderGeometry(1, 1, 1, 12, 1, true), jointGeo = new THREE.SphereGeometry(1, 12, 9), finGeo = new THREE.ConeGeometry(0.16, 0.7, 4);
    for (var i = 0; i < 5; i++) {
      var segs = [], joints = [];
      for (var k = 0; k < NS; k++) {
        var r = 0.74 - k * 0.042;
        var seg = add(cylGeo, Q.skin, 0, 0, 0); seg.userData.r = r; segs.push(seg);
        var fin = new THREE.Mesh(finGeo, Q.horn); fin.position.set(0, 0, -1.0); fin.rotation.x = -1.2; seg.add(fin);
        var jt = add(jointGeo, Q.skin, 0, 0, 0); jt.scale.setScalar(r); joints.push(jt);
      }
      var head = new THREE.Group(); root.add(head);
      var skull = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 12), Q.skin); skull.scale.set(1, 0.85, 1.15); skull.castShadow = true; head.add(skull);
      var snout = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.46, 1.3, 12), Q.skin); snout.rotation.x = Math.PI / 2; snout.position.set(0, 0.1, 0.95); head.add(snout);
      [-1, 1].forEach(function (s) {
        var brow = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.62), Q.dark); brow.position.set(s * 0.27, 0.42, 0.42); brow.rotation.z = s * 0.25; head.add(brow);
        var eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), Q.eye); eye.position.set(s * 0.33, 0.28, 0.48); head.add(eye);
        var nos = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), Q.nostril); nos.position.set(s * 0.12, 0.3, 1.58); head.add(nos);
        // the horns sweep back in three tapering pieces
        var hb = new THREE.Group(); hb.position.set(s * 0.3, 0.45, -0.15); hb.rotation.set(-0.9, 0, -s * 0.35); head.add(hb);
        for (var hk = 0; hk < 3; hk++) { var hm = new THREE.Mesh(new THREE.CylinderGeometry(0.05 - hk * 0.012, 0.1 - hk * 0.02, 0.4, 8), Q.horn); hm.position.y = 0.2 + hk * 0.36; hm.rotation.x = -hk * 0.25; hb.add(hm); }
        // the upper teeth along each side of the snout
        for (var tq = 0; tq < 4; tq++) { var tth = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.16, 5), Q.tooth); tth.position.set(s * (0.3 - tq * 0.04), -0.12, 0.6 + tq * 0.25); tth.rotation.x = Math.PI; head.add(tth); }
      });
      // the frill: a fan of spikes behind the skull
      for (var fq = 0; fq < 5; fq++) { var fa = -0.9 + fq * 0.45, fs = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.75, 5), Q.horn); fs.position.set(Math.sin(fa) * 0.5, 0.2 + Math.cos(fa) * 0.35, -0.55); fs.rotation.set(-1.0, 0, -fa); head.add(fs); }
      var jaw = new THREE.Group(); jaw.position.set(0, -0.22, 0.1); head.add(jaw);
      var jm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.36, 1.2, 10), Q.skin); jm.rotation.x = Math.PI / 2; jm.scale.set(1, 1, 0.5); jm.position.set(0, -0.05, 0.75); jaw.add(jm);
      var tongue = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.9), Q.mouth); tongue.position.set(0, 0.06, 0.8); jaw.add(tongue);
      [-1, 1].forEach(function (s) { for (var tq = 0; tq < 4; tq++) { var lt = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.13, 5), Q.tooth); lt.position.set(s * (0.22 - tq * 0.03), 0.1, 0.5 + tq * 0.25); jaw.add(lt); } });
      necks.push({ o: i - 2, segs: segs, joints: joints, head: head, jaw: jaw, ph: i * 1.3, to: PK_TH_HEADS[i] });
    }
    return { root: root, wings: wings, necks: necks, legs: legs, y: -11, t: 0 };
  }
  // where each head comes to rest (x, y): high over the houses either side and over the gatehouse spire, leaning out toward the stand,
  // so none of them sits in a tower, a gable or the spire
  var PK_TH_HEADS = [[-12.5, 15.4], [-8.6, 17.0], [0, 19.6], [8.6, 17.0], [12.5, 15.4]];
  var _thV = new THREE.Vector3(), _thD = new THREE.Vector3(), _thUp = new THREE.Vector3(0, 1, 0), _thPts = [];
  function pkThHydraTick(a, dt) {
    var X = a.extra, H = X.hydra; if (!H) return;
    var want = X.hydraUp ? 0 : -11;
    H.y += (want - H.y) * Math.min(1, dt * (X.hydraUp ? 0.7 : 1.0));
    H.root.position.y = H.y; H.root.visible = H.y > -10.8;
    if (!H.root.visible) return;
    H.t += dt;
    var breath = X.breath > 0;
    // the forelegs: up and back while it climbs, then forward and down onto the gatehouse as it reaches the top
    var reach = 1 - clamp(-H.y / 3, 0, 1); reach = reach * reach * (3 - 2 * reach);
    if (H.legs) H.legs.forEach(function (L) { L.rotation.x = -0.9 * (1 - reach); });
    H.wings.forEach(function (w, i) { var s = i ? 1 : -1; w.rotation.z = s * (0.15 + Math.sin(H.t * 1.6) * 0.22); w.rotation.y = -s * 0.25; });
    H.necks.forEach(function (N) {
      var o = N.o, sway = Math.sin(H.t * 0.9 + N.ph) * 0.6, bob = Math.sin(H.t * 1.3 + N.ph * 1.7) * 0.4;
      var bx = o * 0.9, by = 6.0, bz = 0.6, hx = N.to[0] + sway, hy = N.to[1] + bob, hz = 7.0 + (breath ? 0.8 : 0);
      var cx = N.to[0] * 0.5, cy = N.to[1] + 1.2, cz = 1.4;
      // the neck: a quadratic curve from the shoulder to the head, a tapered segment from each point to the next
      var n = N.segs.length;
      for (var k = 0; k <= n; k++) {
        var t = k / n, u = 1 - t, P = _thPts[k] || (_thPts[k] = new THREE.Vector3());
        P.set(u * u * bx + 2 * u * t * cx + t * t * hx, u * u * by + 2 * u * t * cy + t * t * hy, u * u * bz + 2 * u * t * cz + t * t * hz);
      }
      for (var k2 = 0; k2 < n; k2++) {
        var A = _thPts[k2], B = _thPts[k2 + 1], sg = N.segs[k2], r = sg.userData.r;
        _thD.subVectors(B, A); var L = _thD.length(); _thD.multiplyScalar(1 / Math.max(1e-4, L));
        sg.position.addVectors(A, B).multiplyScalar(0.5); sg.quaternion.setFromUnitVectors(_thUp, _thD); sg.scale.set(r, L * 1.08, r);
        N.joints[k2].position.copy(A);
      }
      N.head.position.set(hx, hy, hz);
      N.head.rotation.set(0.35 + bob * 0.15 + (breath ? 0.25 : 0), o * 0.18 + sway * 0.06, 0);
      N.jaw.rotation.x = breath ? 0.55 + Math.sin(H.t * 9 + N.ph) * 0.08 : 0.08;
    });
    if (breath) {
      X.breathT = (X.breathT || 0) - dt;
      if (X.breathT <= 0) {
        X.breathT = 0.09;
        H.root.updateMatrixWorld(true);
        H.necks.forEach(function (N) { _thV.set(0, -0.1, 1.6); N.head.localToWorld(_thV); burst(_thV.x, _thV.y, _thV.z, pick([0xff7a1a, 0xffb02a, 0xff4a10]), 8, 'down'); });
      }
    }
  }

  // ── Operator cues: the stage controls, each one a cue the script can call ──────────────────────────────────────
  // On AUTO the script fires them itself. On MANUAL they are the operator's: the control's cue lamp on the STAGE console
  // blinks slowly for a few seconds before (standby) and fast when it is due (GO); press it and the cue is taken. A cue left
  // more than PK_TH_LATE seconds is taken by stage management, so the tale never stalls. One press does what the script does.
  var PK_TH_OPS = {
    curtain: ['CURTAIN', 'OPEN', 'CLOSE'], cityGate: ['CITY GATE', 'SHUT', 'OPEN'], house: ['HOUSE LIGHTS', 'DOWN', 'UP'], wash: ['ARENA WASH', 'OFF', 'ON'],
    spot: ['FOLLOW SPOT', 'OFF', 'ON'], city: ['CITY WINDOWS', 'DARK', 'LIT'], hydra: ['HYDRA', 'DOWN', 'UP'], moat: ['MOAT LIFT', 'DOWN', 'UP'],
    fire: ['FIRE'], thunder: ['THUNDER'], bow: ['BOW']
  };
  var PK_TH_LATE = 8, PK_TH_STANDBY = 5;
  function pkThOpState(a, op) {
    var X = a.extra, lw = X.lightWant;
    switch (op) {
      case 'curtain': return pkCtl(a).barsWant >= 0.5 ? 1 : 0;
      case 'cityGate': return X.gateWant > 0.5 ? 1 : 0;
      case 'house': return lw.house > 0.5 ? 1 : 0;
      case 'wash': return lw.wash > 0 ? 1 : 0;
      case 'spot': return lw.spot > 0 ? 1 : 0;
      case 'city': return lw.city > 0.5 ? 1 : 0;
      case 'hydra': return X.hydraUp ? 1 : 0;
      case 'moat': return X.moatUp ? 1 : 0;
    }
    return null;   // a momentary cue: fire, thunder, bow
  }
  function pkThOpName(op, want) { var n = PK_TH_OPS[op]; return n.length > 1 ? n[0] + ' ' + n[want ? 2 : 1] : n[0]; }
  // do it, and mark any cue it answers as taken
  function pkThOp(a, op, want) {
    var X = a.extra, lw = X.lightWant;
    switch (op) {
      case 'curtain': pkCtl(a).barsWant = want ? 1 : 0; break;
      case 'cityGate': X.gateWant = want ? 1 : 0; break;
      case 'house': lw.house = want ? 1.4 : 0.25; break;
      case 'wash': lw.wash = want ? 2.2 : 0; break;
      case 'spot': lw.spot = want ? 3 : 0; break;
      case 'city': lw.city = want ? 1.1 : 0.15; break;
      case 'hydra': pkThCueHydra(a, want); break;
      case 'moat': pkThCueMoat(a, want); break;
      case 'fire': pkThCueFire(a, 6); break;
      case 'thunder': pkThCueThunder(a); break;
      case 'bow': pkThCueBow(a); break;
    }
    if (X.pending) X.pending = X.pending.filter(function (p) { return !(p.op === op && (pkThOpState(a, op) === null || p.want === pkThOpState(a, op))); });
  }
  // the operator's next cue: the earliest pending one (GO), else the next in the script within standby
  function pkThNextOp(a) {
    var X = a.extra;
    if (X.pending && X.pending.length) return { cue: X.pending[0], go: true };
    if (a.state !== 'running' || !X.cues || pkCtl(a).auto) return null;
    for (var i = X.cueI; i < X.cues.length; i++) { var c = X.cues[i]; if (c.t - a.t > PK_TH_STANDBY) break; if (c.op) return { cue: c, go: false }; }
    return null;
  }
  function pkThCueLamp(a, op) {
    var n = pkThNextOp(a), X = a.extra, hit = false, go = false;
    if (X.pending) X.pending.forEach(function (p) { if (p.op === op) { hit = true; go = true; } });
    if (!hit && n && !n.go && n.cue.op === op) hit = true;
    if (!hit) return false;
    return Math.floor(PK_BK_T * (go ? 6 : 1.6)) % 2 === 0;
  }

  // ── Cues: the script fires these and so do the STAGE console's buttons ──────────────────────────────────────────
  function pkThCueHydra(a, up) { a.extra.hydraUp = !!up; if (!up) a.extra.breath = 0; sfx(up ? 'bad' : 'click'); }
  function pkThCueFire(a, secs) { a.extra.fire = Math.max(a.extra.fire || 0, secs); sfx('bad'); }
  function pkThCueThunder(a) { a.extra.flash = 0.3; sfx('bad'); }
  function pkThCueMoat(a, up) {
    var X = a.extra, A = pkTheaterCast(a).count;
    X.moatUp = up ? 1 : 0; X.fountain = 3.0;
    if (up && !A.on) { pkThShow(A, X.moat.x, X.moat.z, 0); A.y = X.moatY; }
    sfx('click');
  }
  // BOW: whoever is out takes a bow. With no show running nobody is out, so it calls the cast out for a curtain call
  // (pkThCallTick runs it): the curtain and the gate open, the riders line up, the Keeper comes to the balcony, they bow,
  // and they go back in.
  function pkThCueBow(a) {
    var cast = pkTheaterCast(a), X = a.extra;
    if (a.state !== 'running' && !X.showOn && !cast.fenna.on) { X.call = 0; X.callStep = 0; sfx('bell'); return; }
    Object.keys(cast).forEach(function (k) { var A = cast[k]; if (A.on && k !== 'count' && k.indexOf('guard') !== 0) { say(A.g, pick(['Thank you!', 'Bravo to you all!', 'Until next time!'])); A.bowT = 1.8; } });
  }
  function pkThCallTick(a, dt) {
    var X = a.extra; if (X.call === null || X.call === undefined) return;
    if (a.state === 'running') { X.call = null; return; }   // a show starting takes the stage back
    var C = pkCtl(a), cast = pkTheaterCast(a), t = (X.call += dt);
    var at = function (s, fn) { if (X.callStep === s && t >= [0, 1.5, 12, 18, 26][s]) { fn(); X.callStep++; } };
    at(0, function () { C.barsWant = 0; X.gateWant = 1; X.lightWant.wash = 2.2; X.lightWant.city = 1.1; });
    at(1, function () {
      PK_TH_RIDERS.forEach(function (r, i) { var A = cast[r[0]]; pkThShow(A, 0, -22, 0); pkThGo(A, [[0, -17], [0, -12], PK_TH_LINE[i]], 3.4, { face: 0 }); });
      var K = cast.keeper; pkThShow(K, 0, -12.85, 0); K.y = X.balconyY;
    });
    at(2, function () { pkThCueBow(a); });
    at(3, function () { PK_TH_RIDERS.forEach(function (r) { var A = cast[r[0]]; pkThGo(A, [[A.x, -9], [0, -12], [0, -17], [0, -23]], 3.4, { hide: true }); }); pkThHide(cast.keeper); });
    at(4, function () { C.barsWant = 1; X.gateWant = 0; X.lightWant.wash = 0; X.lightWant.city = 0.15; X.call = null; });
  }

  // ── The tale: five minutes of cues against the show clock (a.t: the ride plumbing counts it and a pause holds it) ──
  var PK_TH_LAP = [[-6, -10.5], [-13.5, -8.5], [-17.5, -2.5], [-14.5, 4.5], [-5, 7], [5, 7], [14.5, 4.5], [17.5, -2], [14, -5.6], [8, -6.4], [5, -10.5]];
  var PK_TH_REV = PK_TH_LAP.slice().reverse();
  var PK_TH_LINE = [[-8, 3.5], [-4, 3.5], [0, 3.5], [4, 3.5], [8, 3.5]];
  var PK_TH_BACK = [[-8, 5.8], [-4, 5.8], [0, 5.8], [4, 5.8], [8, 5.8]];
  var PK_TH_VEE = [[-6, 0], [-3, -2], [0, -4], [3, -2], [6, 0]];
  function pkTheaterScript() {
    var R = PK_TH_RIDERS.map(function (r) { return r[0]; });
    var c = function (a) { return pkTheaterCast(a); };
    var each = function (fn) { return function (a) { var cast = c(a); R.forEach(function (k, i) { fn(cast[k], i, a); }); }; };
    var line = function (who, text) { return function (a) { pkThSay(a, who, text); }; };
    var op = function (t, name, want) { return { t: t, op: name, want: want === undefined ? null : want }; };
    var spotAt = function (t, x, y, z) { return { t: t, fn: function (a) { a.extra.spotAt = { x: x, y: y, z: z }; } }; };
    var cues = [
      op(1, 'house', 0), spotAt(2, 0, 6, -13), op(3, 'spot', 1), op(5, 'curtain', 0), op(9, 'city', 1),
      { t: 7, fn: function (a) { var K = c(a).keeper; pkThShow(K, 0, -12.85, 0); K.y = a.extra.balconyY; } },
      { t: 10, fn: line('keeper', 'Welcome, travellers, to Lindenburg!') },
      { t: 15, fn: line('keeper', 'For a hundred years, five riders have kept our gates.') },
      { t: 20, fn: line('keeper', 'Wind, fire, water, earth and light: one gift each.') },
      { t: 24, fn: line('keeper', 'Open the gate! Let the riders ride!') },
      op(26, 'cityGate', 1), op(27, 'wash', 1), spotAt(27, 0, 0, -4)
    ];
    R.forEach(function (k, i) {
      cues.push({ t: 28 + i * 1.8, fn: function (a) { var A = c(a)[k]; pkThShow(A, 0, -22, 0); pkThGo(A, [[0, -17], [0, -12]].concat(PK_TH_LAP), 4.8, { loop: PK_TH_LAP }); } });
    });
    [['fenna', 'Fenna, for the wind!'], ['bas', 'Bas, for the fire!'], ['jet', 'Jet, for the water!'], ['wout', 'Wout, for the earth!'], ['isa', 'Isa, for the light!']].forEach(function (l, i) {
      cues.push({ t: 44 + i * 2.5, fn: line(l[0], l[1]) });
    });
    cues.push(
      { t: 58, fn: each(function (A, i) { pkThGo(A, [PK_TH_LINE[i]], 3.4, { face: 0 }); }) },
      { t: 66, fn: line('keeper', 'Riders! Show our guests how you train.') },
      { t: 72, fn: each(function (A, i) { pkThGo(A, i % 2 ? PK_TH_REV : PK_TH_LAP, 4.2, { loop: i % 2 ? PK_TH_REV : PK_TH_LAP }); }) },
      op(98, 'thunder'), { t: 98.5, fn: function (a) { if (a.extra.lightWant.wash > 0) a.extra.lightWant.wash = 0.7; } }, op(100, 'city', 0),
      { t: 100, fn: each(function (A, i, a) { var p = PK_TH_BACK[i]; pkThGo(A, [p], 2.6, { face: Math.atan2(a.extra.moat.x - p[0], a.extra.moat.z - p[1]) }); }) },
      op(102, 'moat', 1), spotAt(102, 13, 1, -9.6),
      { t: 108, fn: line('count', 'Did you think the moat would hold me forever, Lindenburg?') },
      { t: 115, fn: line('keeper', 'Count Grimwald! You were banished from this city!') },
      { t: 121, fn: line('count', 'Banished, but never beaten. Guards! Take their horses!') },
      { t: 124, fn: function (a) { var cs = c(a); [['guard1', -1], ['guard2', 1]].forEach(function (g2) { var A = cs[g2[0]]; pkThShow(A, g2[1], -22, 0); pkThGo(A, [[g2[1], -17], [g2[1], -12], [g2[1] * 5, -6]], 2.8); }); } },
      { t: 128, fn: function (a) { a.extra.chase = true; each(function (A, i) { pkThGo(A, i % 2 ? PK_TH_REV : PK_TH_LAP, 4.6, { loop: i % 2 ? PK_TH_REV : PK_TH_LAP }); })(a); } },
      { t: 135, fn: line('guard1', 'Halt, in the name of the Count!') },
      { t: 141, fn: line('bas', 'Catch us if you can!') },
      { t: 146, fn: line('count', 'Enough games.') },
      { t: 149, fn: line('count', 'Rise, my beauty. Rise - and BURN!') },
      op(150, 'thunder'), op(152, 'hydra', 1), op(154, 'fire'), spotAt(152, 0, 9, -17),
      { t: 153, fn: function (a) { a.extra.chase = false; var cs = c(a); [['guard1', -1], ['guard2', 1]].forEach(function (g2) { pkThGo(cs[g2[0]], [[g2[1] * 6, -7.5]], 2.8, { face: 0 }); }); } },
      { t: 156, fn: each(function (A, i) { pkThGo(A, [PK_TH_BACK[i]], 3.6, { face: Math.PI }); }) },
      { t: 160, fn: function (a) { a.extra.breathAuto = true; } },
      { t: 166, fn: line('wout', 'It is too big!') },
      { t: 171, fn: line('fenna', 'Riders! Together - like the old songs say!') },
      { t: 177, fn: line('keeper', 'Five riders, five gifts! Wind, fire, water, earth and light!') },
      { t: 183, fn: function (a) { a.extra.gifts = true; a.extra.spotAt = { x: 0, y: 0, z: -2 }; each(function (A, i) { pkThGo(A, [PK_TH_VEE[i]], 3.6, { face: Math.PI }); })(a); } },
      op(188, 'thunder'), { t: 188, fn: each(function (A, i) { var v = PK_TH_VEE[i]; pkThGo(A, [[v[0] * 0.6, -9.6], v], 5.5, { face: Math.PI }); }) },
      op(196, 'fire'), { t: 196, fn: each(function (A, i) { var v = PK_TH_VEE[i]; pkThGo(A, [[v[0] * 0.6, -9.6], v], 5.5, { face: Math.PI }); }) },
      { t: 203, fn: function (a) { a.extra.breathAuto = false; a.extra.breath = 0; } }, op(203, 'thunder'),
      op(205, 'hydra', 0), spotAt(205, 13, 1, -9.6),
      { t: 209, fn: line('count', 'No! NO! This is not the end of Grimwald!') },
      op(213, 'moat', 0), { t: 213, fn: function (a) { var cs = c(a); [['guard1', -1], ['guard2', 1]].forEach(function (g2) { pkThGo(cs[g2[0]], [[g2[1], -12], [g2[1], -17], [0, -23]], 3.2, { hide: true }); }); } },
      { t: 219, fn: function (a) { a.extra.gifts = false; if (a.extra.lightWant.wash > 0) a.extra.lightWant.wash = 2.2; a.extra.spotAt = { x: 0, y: 0, z: 0 }; } }, op(219, 'city', 1),
      { t: 222, fn: line('keeper', 'The riders have saved Lindenburg once more!') },
      { t: 226, fn: each(function (A, i) { pkThGo(A, PK_TH_LAP.concat([PK_TH_LINE[i]]), 4.8, { face: 0 }); }) },
      { t: 252, fn: each(function (A, i) { pkThGo(A, [PK_TH_LINE[i]], 3.0, { face: 0 }); }) },
      op(256, 'bow'),
      { t: 262, fn: line('keeper', 'Safe roads, friends - and come back to Lindenburg!') }
    );
    R.forEach(function (k, i) { cues.push({ t: 268 + i * 1.2, fn: function (a) { var A = c(a)[k]; pkThGo(A, [[A.x, -9], [0, -12], [0, -17], [0, -23]], 3.6, { hide: true }); } }); });
    cues.push(
      { t: 276, fn: function (a) { pkThHide(c(a).keeper); } }, op(276, 'spot', 0),
      op(278, 'curtain', 1), op(281, 'cityGate', 0),
      op(286, 'house', 1), op(288, 'wash', 0), op(290, 'city', 0)
    );
    pkArenaPlusCues(cues, c, each, line);   // part 37: the music, the gifts' effects, the lights' moods, the fireworks
    cues.forEach(function (q, i) { q.i = i; });
    cues.sort(function (p, q) { return p.t - q.t || p.i - q.i; });
    return cues;
  }
  function pkTheaterShowBegin(a) {
    pkTheaterTidy(a);
    var X = a.extra; X.cueI = 0; X.cues = pkTheaterScript(); X.showOn = true; X.pending = []; X.missed = 0;
    logEvent(a.name + ': the curtain goes up on The Five Riders of Lindenburg', '');
  }
  // the arena put back after a show, however it ended: the cast in the yard, the hydra and the Count down, the gate shut
  function pkTheaterTidy(a) {
    var X = a.extra, cast = pkTheaterCast(a);
    Object.keys(cast).forEach(function (k) { pkThHide(cast[k]); });
    X.showOn = false; X.hydraUp = false; X.breath = 0; X.breathAuto = false; X.fire = 0; X.flash = 0; X.chase = false; X.gifts = false;
    X.moatUp = 0; X.moatY = -2.4; X.gateWant = 0; X.pending = [];
    var lw = X.lightWant; lw.house = 1.4; lw.wash = 0; lw.spot = 0; lw.city = 0.15;
    pkCtl(a).barsWant = 1;
    pkArenaPlusTidy(a);
  }
  function pkTheaterTickRun(a, dt) {
    var C = pkCtl(a), X = a.extra, lw = X.lightWant, cast = pkTheaterCast(a);
    // the audience applauds from the bow until the curtain is in
    var clap = a.state === 'running' && a.t >= 256 && a.t < 283;
    for (var si = 0; si < a.seats.length; si++) if (a.seats[si].guest) a.seats[si].guest.clap = clap;
    if (a.state === 'running' && X.cues) {
      while (X.cueI < X.cues.length && a.t >= X.cues[X.cueI].t) {
        var q = X.cues[X.cueI]; X.cueI++;
        if (!q.op) { q.fn(a, C); continue; }
        if (C.auto) pkThOp(a, q.op, q.want);
        else if (q.want === null || pkThOpState(a, q.op) !== q.want) X.pending.push({ op: q.op, want: q.want, t: q.t });
      }
      // a cue the operator has let slip is taken by stage management
      X.pending.slice().forEach(function (p) {
        if (!C.auto && a.t - p.t < PK_TH_LATE) return;
        X.missed += C.auto ? 0 : 1;
        if (!C.auto) toast('Stage management took the cue: ' + pkThOpName(p.op, p.want), '');
        pkThOp(a, p.op, p.want);
        X.pending = X.pending.filter(function (r) { return r !== p; });
      });
    } else if (X.showOn) pkTheaterTidy(a);
    // there are no restraints in an arena: when the show is over the audience gets up, AUTO or MANUAL
    if (a.state === 'unloading' && a.awaitBars) pkAttrLetOff(a);
    // the guards go after whichever rider is nearest
    if (X.chase) { X.chaseT = (X.chaseT || 0) - dt; if (X.chaseT <= 0) { X.chaseT = 0.8; ['guard1', 'guard2'].forEach(function (k) { var G2 = cast[k]; if (!G2.on) return; var best = null, bd = 1e9; PK_TH_RIDERS.forEach(function (r) { var R2 = cast[r[0]], d = Math.hypot(R2.x - G2.x, R2.z - G2.z); if (R2.on && d < bd) { bd = d; best = R2; } }); if (best) pkThGo(G2, [[clamp(best.x, -16, 16), clamp(best.z, -10, 6)]], 3.0); }); } }
    // the hydra breathes fire every few seconds while it is up and the script wants it
    if (X.breathAuto && X.hydraUp) { X.breathGap = (X.breathGap || 0) - dt; if (X.breathGap <= 0) { X.breathGap = 4.5; X.breath = 1.6; X.fire = Math.max(X.fire || 0, 1.0); sfx('bad'); } }
    if (X.breath > 0) X.breath -= dt;
    pkThCallTick(a, dt);
    Object.keys(cast).forEach(function (k) { if (cast[k].on) pkThActorTick(cast[k], dt); });
    // the moat lift: the Count rises with it and goes back down; the water boils while it moves
    X.moatY += ((X.moatUp ? 0.25 : -2.4) - X.moatY) * Math.min(1, dt * 0.9);
    if (cast.count.on) { cast.count.y = X.moatY; if (!X.moatUp && X.moatY < -2.2) pkThHide(cast.count); }
    if (X.fountain > 0) { X.fountain -= dt; X.fountT = (X.fountT || 0) - dt; if (X.fountT <= 0) { X.fountT = 0.1; burst(PK_TH.CX + X.moat.x + randf(-2.5, 2.5), 0.3, PK_TH.CZ + X.moat.z + randf(-1.5, 1.5), 0xbfe3ff, 10, 'up'); } }
    // the city gate doors
    X.gateK += (X.gateWant - X.gateK) * Math.min(1, dt * 1.2);
    X.doors.forEach(function (d, i) { d.rotation.y = (i ? -1 : 1) * X.gateK * 1.45; });
    // fire in the braziers
    if (X.fire > 0) {
      X.fire -= dt; X.fireT = (X.fireT || 0) - dt;
      if (X.fireT <= 0) { X.fireT = 0.08; X.fires.forEach(function (f) { burst(PK_TH.CX + f.x, f.y, PK_TH.CZ + f.z, pick([0xff7a1a, 0xffb02a, 0xff4a10]), 7, 'up'); }); }
    }
    var fireOn = X.fire > 0, flick = 0.75 + Math.random() * 0.5;
    X.fires.forEach(function (f) { f.mat.emissiveIntensity = fireOn ? 2.4 * flick : 0.4; });
    var L = X.lights, k = Math.min(1, dt * 2);
    L.house.forEach(function (l) { l.intensity += (lw.house - l.intensity) * k; });
    L.wash.forEach(function (l) { l.intensity += (lw.wash - l.intensity) * k; });
    L.spot.intensity += (lw.spot * 0.6 - L.spot.intensity) * k;   // the follow spot at 60% of the script's level: at full it burnt out whoever it was on
    L.spot.target.position.lerp(_thV.set(X.spotAt.x, X.spotAt.y, X.spotAt.z), Math.min(1, dt * 1.5));
    L.fire.intensity = fireOn ? 3.2 * flick : 0;
    L.hydra.intensity += ((X.hydraUp ? 2.5 : 0) * (X.breath > 0 ? 1.8 : 1) - L.hydra.intensity) * k;
    if (X.flash > 0) { X.flash -= dt; L.wash.forEach(function (l) { l.intensity = 7; }); }
    var M = pkThM(); M.win.emissiveIntensity += (lw.city - M.win.emissiveIntensity) * k;
    PK_TH_RIDERS.forEach(function (r) { var A = cast[r[0]]; A.horse.pennant.emissiveIntensity += ((X.gifts ? 2.2 : 0) - A.horse.pennant.emissiveIntensity) * k; });
    pkThHydraTick(a, dt);
    pkArenaPlusTick(a, dt);
  }
  // the clock tower keeps the park's time, whatever the show is doing
  hook('frame', function () {
    var K = PK_TH.clock; if (!K || typeof S.time !== 'number') return;
    K.h.rotation.z = -(S.time % 12) / 12 * Math.PI * 2;
    K.m.rotation.z = -(S.time % 1) * Math.PI * 2;
  });

  // ── Build and register ───────────────────────────────────────────
  function pkBuildTheater(p) {
    var a = pkAttr({
      id: 'theater', name: 'The Lindenburg Arena', x: p.x, z: p.z, qx: p.q[0], qz: p.q[1],
      seats: [], board: 120, run: 291, unload: 18, exit: [PK_TH.CX + 23.5, PK_TH.CZ + 11.0],   // out through the stair hall's gates, along the forecourt's north edge
      start: pkTheaterShowBegin, tickRun: pkTheaterTickRun   // doors open two minutes: the walk from the gate is about 95 s
    });
    pkTheaterBuild(a);
    var C = pkCtl(a); C.barsWant = 1; C.bars = 1;   // the curtain starts closed
    a.curtain = true;
    a.boardMin = 30;   // on AUTO the house closes once the line is in and seated, after half a minute at least
    // the audience's way between the stair hall and the seats: straight up the middle of the stair, across the landing and
    // through onto the stand's top walkway (route() finds the lobby, and the walkway and the row); out, the same in reverse
    var way = function () {
      var H = PK_TH_HALL, sm = (PK_THG.x + 0.3 + H.sx1) / 2, X0 = PK_TH.CX, Z0 = PK_TH.CZ;
      return [{ x: X0 + sm, z: Z0 + H.s0 - 0.5 }, { x: X0 + sm, z: Z0 + H.s1 + 0.4 }, { x: X0 + PK_THG.x + 0.9, z: Z0 + 19.7 }, { x: X0 + PK_THG.x - 0.6, z: Z0 + 19.7 }];
    };
    a.seatPath = function (from, w) { var W = way(); return route(from, W[0]).concat(W.slice(1), route(W[3], { x: w.x, z: w.z })); };
    a.walkOut = function (sp) { var W = way().reverse(); return route(sp, W[0]).concat(W.slice(1), route(W[3], { x: a.exit[0], z: a.exit[1] })); };                              // its 'bars' are the curtain: the gates and the end of a show leave it alone
    return a;
  }
  var _pkBuildAttractionsTH = pkBuildAttractions;
  pkBuildAttractions = function () {
    _pkBuildAttractionsTH();   // built last, so it lands at the end of PK.attractions
    PK_PLOTS.forEach(function (p) {
      if (p.id !== 'theater') return;
      var a = pkBuildTheater(p);
      a.level = p.level; a.plot = p; a.open = pkRideSavedOpen(p.id);
      if (S.rides) S.rides[p.id] = a.open;
      pkCtlLoad(a);
    });
  };

  // the show call: while the arena is taking its audience (idle or doors open, key on, room on the benches), a guest choosing
  // a ride heads for the show a third of the time; otherwise sixty seats among twenty rides would never fill
  var PK_TH_CALL = 0.35, _pkThPrevPick = pkAttrPick;
  pkAttrPick = function (gu) {
    var a = PK.attrById && PK.attrById.theater, C = a && a.ctl;
    if (a && a.open && C && C.key && !C.fault && !C.maint && !PK.closed && (a.state === 'idle' || a.state === 'boarding') &&
        a.queue.length + a.riders < a.seats.length && !(gu.gaveUp && gu.gaveUp.theater) && Math.random() < PK_TH_CALL && pkAttrQueueJoin(gu, a)) return true;
    return _pkThPrevPick(gu);
  };

  var _pkThTestApi = GAME.T;
  GAME.T = function () { var o = _pkThTestApi(); o.pkTheaterPause = pkTheaterPause; o.pkTheaterEnd = pkTheaterEnd; o.pkThCueHydra = pkThCueHydra; o.PK_TH = PK_TH; o.pkAttrPick = function (gu) { return pkAttrPick(gu); }; return o; };
