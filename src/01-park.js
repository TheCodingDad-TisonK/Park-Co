//@ Park Co, part 01: the park - the state, the tables, the ground, the gate, the ticket windows, the midway and the props
  // ── Park Co ───────────────────────────────────────────────────────
  // A small park: a gate at the south, two ticket windows outside it, a midway running north to the coaster station, and the
  // operator's room beside the platform. Guests arrive from the car park, buy a ticket at a window, pass a turnstile, queue
  // for the coaster and ride it. The player works the window and the ride.
  var PK_GATE_Z = 30, PK_PLATFORM_Y = 0.6, PK_STATION_Z = -4.6, PK_KIDS_Z = 56;   // PK_KIDS_Z: the south fence of the kids' garden
  // the park is a long rectangle: the gate at the south, the coaster across the north, and rides either side of the midway
  var PK_PARK = { x0: -72, x1: 123, z0: -118, z1: 70 };   // z0 was -95: the north fence moved back for the bigger indoor halls; x1 was 72, out east for The Dragon and The Firebird
  var PK_BOOTHS = [{ x: -9, z: 36, turnstile: -6 }, { x: 9, z: 36, turnstile: 6 }];
  var PK_TURNSTILES = [-6, -2, 2, 6];
  // the coaster queue: a single lane beside the platform, fenced on both sides. Guests join at the back (PK_QUEUE_ENTRY,
  // south, off the midway), stand one to a slot, and shuffle toward the front (north) as the line moves. Slot 0 is the front.
  var PK_QUEUE_SLOTS = [];
  for (var pkQi = 0; pkQi < 8; pkQi++) PK_QUEUE_SLOTS.push({ x: 7, z: 0.6 + pkQi * 1.0 });
  var PK_QUEUE_ENTRY = { x: 7, z: 9.4 };
  // the plots: every ride the park can open. level is the level that opens it, q the point the queue stands at
  var PK_PLOTS = [
    { id: 'carousel',  name: 'Carousel',     x: -34, z: 20, r: 8.5,  q: [-22, 20],  level: 2 },
    { id: 'teacups',   name: 'Teacups',      x: -56, z: 3,  r: 7.2,  q: [-44, 3],   level: 4, boothSide: -1 },   // the south side is the kids' lane
    { id: 'ferris',    name: 'Ferris wheel', x: 34,  z: 20, r: 9.5,  q: [22, 20],   level: 6 },
    { id: 'dodgems',   name: 'Dodgems',      x: 56,  z: 3,  r: 8.2,  q: [44, 3],    level: 8 },
    { id: 'droptower', name: 'Drop tower',   x: -54, z: -52, r: 6.5, q: [-44, -52], level: 9 },
    { id: 'flume',     name: 'Log flume',    x: 54,  z: -32, r: 9.0, q: [46.4, -24], level: 10 },
    { id: 'haunted',   name: 'Haunted house',x: -58, z: -24, r: 9.5, q: [-44, -24],  level: 11 }
  ];
  // the ladder: what the park earns its way to. Every ride is open from the first day; the levels open the services.
  var PK_LEVELS = [
    { xp: 0,   name: 'The gate',      note: 'Sell tickets at the window and work the coaster.' },
    { xp: 40,  name: 'Snack stand',   note: 'A snack stand opens on the midway.', unlock: 'snack' },
    { xp: 120, name: 'Ticket clerk',  note: 'Hire a clerk and the window serves itself.', unlock: 'clerk' },
    { xp: 280, name: 'Ride operator', note: 'Hire an operator and the coaster runs itself.', unlock: 'operator' },
    { xp: 520, name: 'Park lights',   note: 'The park stays open into the evening.', unlock: 'lights' }
  ];
  // the live park: everything that is not worth saving. The saved bits live in S (ticketPrice, auto, xp, the hires)
  var PK = {
    guests: [], booths: [], turnstiles: [], gates: [], seats: [], cars: [], train: null,
    curve: null, len: 1, cpU: [], stationU: 0.02, stationX0: 0, liftU: [0, 0], carGap: 2.9,
    ride: { state: 'idle', t: 0, u: 0.02, v: 0, riders: 0, bars: 0, barsWant: 0, gates: 0, beat: 0, autoT: 0, loadT: 0, wait: 0, fault: '', last: '' },
    queue: [], spawnT: 0, nextId: 1, today: { tickets: 0, snacks: 0, rides: 0, earned: 0 },
    attractions: [], attrById: {}, plots: {}, rides: {}, lanes: [],
    playerRide: null, playerWait: null,
    lastMin: -1, lastDay: 1, level: 1, xp: 0, clerk: false, operator: false, snackOpen: false, train2: false, lights: false, duty: null,
    served: 0, refused: 0, screen: null, snack: null, closed: false
  };
  // ── The tables the park reads ─────────────────────────────────────
  function pkLevel() { var lv = 1; for (var i = 0; i < PK_LEVELS.length; i++) if (PK.xp >= PK_LEVELS[i].xp) lv = i + 1; return lv; }
  function pkXp(n) {
    PK.xp += n; S.xp = PK.xp; var lv = pkLevel();
    if (lv > PK.level) {
      var from = PK.level;
      PK.level = lv; S.level = lv;
      for (var i = from + 1; i <= lv; i++) pkLevelUp(i);   // every level crossed opens what it opens
    }
    hudDirty = true;
  }
  function pkLevelUp(lv) {
    var L = PK_LEVELS[lv - 1]; if (!L) return;
    sfx('ok'); logEvent('Level ' + lv + ': ' + L.name, 'good');
    showCard('h-card', '<b>Level ' + lv + '</b><br>' + esc(L.name) + '<br><span class="dc-sub">' + esc(L.note) + '</span>', 6);
    toast('Level ' + lv + ' - ' + L.name, 'good');
    if (L.unlock === 'snack') { PK.snackOpen = true; S.snackOpen = true; }
    if (L.unlock === 'lights') { PK.lights = true; S.lights = true; }
    if (L.unlock && L.unlock !== 'snack' && L.unlock !== 'lights' && L.unlock !== 'clerk' && L.unlock !== 'operator') pkOpenRide(L.unlock);
    hudDirty = true;
  }
  // the platform sits south of the track, so the queue and the guests reach it without crossing the rails.
  // a short ramp at its south edge carries the player and the guests up the 0.6 m step.
  function pkFloor(x, z) {
    if (pkOnPlatform(x, z)) return PK_PLATFORM_Y;
    if (x > -10 && x < 10 && z >= -0.6 && z < 0.4) return PK_PLATFORM_Y * (0.4 - z);
    return pkBkFloorAt(x, z);            // up the steps into a ride's booth (part 17)
  }
  function pkOnPlatform(x, z) { return x > -10 && x < 10 && z > -3.6 && z < -0.6; }
  function pkInsidePark(x, z) { return x > PK_PARK.x0 && x < PK_PARK.x1 && z > PK_PARK.z0 && z < PK_PARK.z1; }
  function pkBoothSlot(bi, i) { var b = PK_BOOTHS[bi]; return { x: b.x, z: b.z + 2.0 + i * 1.1 }; }
  function pkCoasterAuto() { return !!S.auto || !!S.operator; }
  function pkRideWord() {
    var R = PK.ride;
    if (R.fault) return 'stopped';
    if (!S.coasterKey) return 'locked';
    return { idle: 'waiting', loading: 'boarding', ready: 'ready', dispatch: 'dispatching', running: 'running', arrive: 'arriving', unload: 'unloading' }[R.state] || R.state;
  }
  // ── The ground, the gate and the midway ───────────────────────────
  // a seeded stream, so the planting is the same park every time it loads
  function pkRng(seed) {
    var a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  var PK_ASPHALT = null;
  function pkAsphalt() { return PK_ASPHALT || (PK_ASPHALT = std({ color: 0x3c4046, roughness: 0.96 })); }
  // pavers keep their size whatever the slab: the slab sizes and heights below are the ones the editor's world file refers to
  function pkSlab(w, d, x, z, y, mat) {
    // built with the engine's own plane(), so the editor's world file still finds it by the same key; the UVs are stretched to metres afterwards
    var p = plane(w, d, mat || pkMats().pavers, x, y, z, -Math.PI / 2);
    p.geometry = p.geometry.clone();
    var uv = p.geometry.attributes.uv; for (var i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 2.4, uv.getY(i) * d / 2.4);
    p.receiveShadow = true; return p;
  }
  function pkGround() {
    var M = pkMats();
    // the lawn: the shared grass map tiles at 14 m, which turns the hand-drawn blades into pencil hatching. Clone the map and the
    // material for the ground alone, and repeat it at 2.8 m a tile, so the blades read as turf underfoot.
    var lawnMap = TEX.grass.clone();
    lawnMap.wrapS = lawnMap.wrapT = THREE.RepeatWrapping;
    lawnMap.repeat.set(150, 150);   // 420 m plane / 150 = a 2.8 m tile
    lawnMap.needsUpdate = true;
    var lawnMat = MAT.grass.clone();
    lawnMat.map = lawnMap;
    plane(420, 420, lawnMat, 0, -0.03, 0, -Math.PI / 2);
    pkSlab(34, 18, 0, 44, 0.012, M.paversWarm);      // the forecourt, where the guests arrive
    pkSlab(28, 10, 0, 33, 0.014, M.paversWarm);      // the plaza under the gate
    pkSlab(14, 32, 0, 12, 0.016);      // the midway
    pkSlab(36, 18, 2, -4, 0.018);      // the station apron
    pkSlab(9.4, 6.8, 15.5, -0.8, 0.02);   // the coaster control room's floor
    pkSlab(10, 8, -13, 8, 0.02, M.paversWarm);       // the snack stand apron
    pkSlab(62, 18, 0, 62, 0.01, pkAsphalt());       // the car park: two ranks of bays off a wide aisle
    // the entrance drive up from the road
    pkSlab(11, 5, 0, 73.5, 0.011, pkAsphalt());
    // each ride's own paved pad is laid by the dressing (part 06), tinted to its theme
    pkSlab(18, 6, -14, 20, 0.017);   // out to the carousel
    pkSlab(18, 6, -14, 3, 0.017);    // the start of the street out to the teacups (part 12 carries it on)
    pkSlab(18, 6, 14, 20, 0.017);    // out to the ferris wheel
    pkSlab(18, 6, 14, 3, 0.017);     // the start of the street out to the dodgems
    // the routes out to the lands, the hub, the Garden Walk and the planting are laid in part 12
    // the car park markings: 22 bays a side, two removed for the walk through to the gate
    var bayW = 2.75, bayN = 22, bayX0 = -bayW * bayN / 2 + bayW / 2;
    for (var i = 0; i < bayN; i++) {
      var bx = bayX0 + i * bayW;
      if (i === 11) continue;
      box(0.12, 0.02, 5, MAT.whiteLine, bx - bayW / 2, 0.02, 55.5);   // rank A, heads to the north
      box(0.12, 0.02, 5, MAT.whiteLine, bx - bayW / 2, 0.02, 68.5);   // rank B, heads to the south
    }
    box(0.12, 0.02, 5, MAT.whiteLine, -bayW * bayN / 2, 0.02, 55.5);
    box(0.12, 0.02, 5, MAT.whiteLine, -bayW * bayN / 2, 0.02, 68.5);
    box(0.12, 0.02, 5, MAT.whiteLine, bayW * bayN / 2, 0.02, 55.5);
    box(0.12, 0.02, 5, MAT.whiteLine, bayW * bayN / 2, 0.02, 68.5);
    box(62, 0.02, 0.14, MAT.whiteLine, 0, 0.02, 53.1);
    box(62, 0.02, 0.14, MAT.whiteLine, 0, 0.02, 70.9);
    // the walk up the middle of the near rank, so nobody has to squeeze between cars
    pkSlab(5.5, 5, 0, 55.5, 0.016, M.paversWarm);
    box(5.5, 0.02, 0.14, MAT.whiteLine, 0, 0.02, 58.05);
  }
  function pkGate() {
    // stone piers with caps, a pitched roof over the turnstiles and 3D signage
    [-10, 10].forEach(function (x) { pkGatePier(x, PK_GATE_Z); });
    solid(-12.2, -7.8, 27.8, 32.2, 0, 5.6); solid(7.8, 12.2, 27.8, 32.2, 0, 5.6);
    box(24, 2.4, 4, MAT.plaster, 0, 6.6, PK_GATE_Z);
    box(24.9, 0.24, 4.9, MAT.trim, 0, 7.9, PK_GATE_Z);
    box(24.4, 0.16, 4.4, MAT.trim, 0, 5.42, PK_GATE_Z);
    // the roof: two slabs tilted up to a ridge
    var rA = box(27.5, 0.34, 3.2, MAT.roof, 0, 8.1, PK_GATE_Z + 1.4); rA.rotation.x = 0.24;
    var rB = box(27.5, 0.34, 3.2, MAT.roof, 0, 8.1, PK_GATE_Z - 1.4); rB.rotation.x = -0.24;
    // the name on the outside face, over the arriving guests, and on the park side
    pkSign3D(['PARK CO'], 12.0, 1.55, 0, 6.95, PK_GATE_Z + 2.06, 0, { bg: '#1b232c', fg: '#f5b53d' });
    pkSign3D(['WELCOME'], 5.0, 0.5, 0, 5.86, PK_GATE_Z + 2.06, 0, { bg: '#0d1216', fg: '#eef1f5' });
    pkSign3D(['PARK CO'], 9.0, 1.1, 0, 6.95, PK_GATE_Z - 2.06, Math.PI, { bg: '#1b232c', fg: '#f5b53d' });
    pkSign3D(['OPEN 09:00 - 22:00'], 5.8, 0.5, 0, 5.86, PK_GATE_Z - 2.06, Math.PI, { bg: '#0d1216', fg: '#eef1f5' });
    // pilasters framing the name, and downlights under the beam
    [-11.4, -7.1, 7.1, 11.4].forEach(function (x) {
      box(0.5, 2.3, 0.16, MAT.trim, x, 6.6, PK_GATE_Z + 2.02);
      box(0.5, 2.3, 0.16, MAT.trim, x, 6.6, PK_GATE_Z - 2.02);
    });
    [-9, -4.5, 0, 4.5, 9].forEach(function (x) {
      cyl(0.22, 0.16, MAT.steelDark, x, 5.34, PK_GATE_Z + 1.2, null, 12);
      sphere(0.16, glowMat(0xfff2c0, 1.5), x, 5.26, PK_GATE_Z + 1.2);
    });
    [-8.6, 8.6].forEach(function (x) { sphere(0.24, glowMat(0xfff2c0, 0.9), x, 6.9, PK_GATE_Z - 2.24); });
    // the turnstile bank: a brushed cabinet between each pair, a turnstile in each gap
    var bankM = std({ color: 0xc2c7cd, roughness: 0.34, metalness: 0.72 });
    [[-8, -6.8], [-5.2, -2.8], [-1.2, 1.2], [2.8, 5.2], [6.8, 8]].forEach(function (b) {
      var w = b[1] - b[0], cx = (b[0] + b[1]) / 2;
      box(w, 0.92, 0.5, bankM, cx, 0.46, PK_GATE_Z);
      box(w + 0.08, 0.07, 0.58, MAT.steelDark, cx, 0.95, PK_GATE_Z);
      box(w - 0.12, 0.16, 0.03, MAT.black, cx, 0.8, PK_GATE_Z + 0.26);   // the reader face, toward the guests
      box(w - 0.2, 0.03, 0.01, glowMat(0x5fd38d, 1.4), cx, 0.9, PK_GATE_Z + 0.27);
      box(w - 0.12, 0.1, 0.02, MAT.hazard || MAT.steelDark, cx, 0.06, PK_GATE_Z + 0.26);
      solid(b[0], b[1], PK_GATE_Z - 0.28, PK_GATE_Z + 0.28, 0, 1.1);
    });
    PK_TURNSTILES.forEach(function (x) { pkTurnstileBetter(x, PK_GATE_Z); });
    // planters and lamps at the entrance
    [[-15, 33.5], [15, 33.5]].forEach(function (p) { pkFlowerBed(p[0], p[1], 3.0, 1.6); });
    [[-13.5, 27.5], [13.5, 27.5]].forEach(function (p) { pkLamp(p[0], p[1], 4.6); });
    // a welcome line across the forecourt
    box(22, 0.02, 0.4, MAT.whiteLine, 0, 0.03, PK_GATE_Z + 5);
    // the fence either side of the gate: the only way in is a turnstile. A palisade of iron spears on a stone kerb.
    pkPalisade(-32.5, PK_GATE_Z, -12, PK_GATE_Z);
    pkPalisade(12, PK_GATE_Z, PK_PARK.x1, PK_GATE_Z);
    // and round the park. West of the forecourt the fence steps south round the kids' garden, so the little rides and the
    // playhouse are inside the park and reached from the Fairground, not stranded beyond the palisade.
    pkPalisade(PK_PARK.x0, PK_KIDS_Z, PK_PARK.x0, PK_PARK.z0);
    pkPalisade(PK_PARK.x0, PK_KIDS_Z, -32.5, PK_KIDS_Z);
    pkPalisade(PK_PARK.x1, PK_GATE_Z, PK_PARK.x1, PK_PARK.z0);
    pkPalisade(PK_PARK.x0, PK_PARK.z0, PK_PARK.x1, PK_PARK.z0);
    // the boundary round the forecourt and the car park, with the drive in at the south
    pkPalisade(-32.5, PK_GATE_Z, -32.5, 72);
    pkPalisade(32.5, PK_GATE_Z, 32.5, 72);
    pkPalisade(-32.5, 72, -5.8, 72);
    pkPalisade(5.8, 72, 32.5, 72);
  }
  // the park office: a small room on the forecourt with the owner's PC, which opens the management panel
  function pkOffice() {
    pkBuildHQ();   // Park Co HQ, part 18: three floors on the forecourt, the owner's office at the top
  }
  function pkTurnstile(x, z) {
    pkTurnstileBetter(x, z);
  }
  function pkBooths() {
    PK_BOOTHS.forEach(function (b, i) { pkTicketBoothBetter(b, i); });
  }
  function pkPrice(n) {
    S.ticketPrice = clamp(Math.round((S.ticketPrice + n) * 100) / 100, 5, 200);
    screenDirtyAll(); hudDirty = true;
    toast('Adults ' + money(S.ticketPrice), '');
    return S.ticketPrice;
  }
  // is this spot free for a tree? Keeps the rides, the routes, the midway, the gate and the coaster's footprint clear.
  function pkTreeOK(x, z) {
    for (var i = 0; i < PK_PLOTS.length; i++) { var p = PK_PLOTS[i]; if (dist2(x, z, p.x, p.z) < (p.r + 3.5) * (p.r + 3.5)) return false; }
    if (x > -12 && x < 12 && z > -14 && z < 30) return false;
    if (Math.abs(z - 20) < 5 && Math.abs(x) < 32) return false;   // the carousel and ferris paths
    if (Math.abs(z - 3) < 5 && Math.abs(x) < 32) return false;    // the teacup and dodgem paths
    if (z > 27) return false;
    if (typeof PK_INDOOR !== 'undefined') for (var k in PK_INDOOR) { var hb = PK_INDOOR[k].box; if (x > hb[0] - 3 && x < hb[1] + 3 && z > hb[2] - 3 && z < hb[3] + 3) return false; }
    if (typeof pkThemeKeepClear === 'function' && pkThemeKeepClear(x, z)) return false;
    return true;
  }
  function pkMidway() {
    // lanterns down the midway, benches and bins at the sides
    [[-7, 24], [7, 24], [-7, 12], [5.9, 12.8], [-7, 0], [7, 0], [-14, 40], [14, 40], [-14, 52], [14, 52]].forEach(function (p) { pkLamp(p[0], p[1], 4.6); });
    [[-8, 20], [8, 20], [-8, 10], [8, 10], [-8, 2], [8, 2]].forEach(function (p) { pkBench(p[0], p[1], p[0] < 0 ? Math.PI / 2 : -Math.PI / 2); });
    [[-6, 26], [6, 26], [-6, 6], [8.4, 13.7], [-6, 38], [6, 38]].forEach(function (p) { pkBin(p[0], p[1]); solid(p[0] - 0.35, p[0] + 0.35, p[1] - 0.35, p[1] + 0.35, 0, 1.0); });
    // hedges either side of the midway, with a gap at each ride path: clipped hedge on a stone kerb,
    // broken by flower beds so it reads as planting, not a wall
    [-9.5, 9.5].forEach(function (x) {
      for (var z = 6; z <= 26; z += 2.2) {
        if (Math.abs(z - 19) < 2.4 || Math.abs(z - 3) < 2.4) continue;
        if (Math.round(z * 10) % 11 === 0) { pkFlowerBed(x, z, 1.6, 2.0); continue; }
        var M = pkMats();
        box(1.0, 0.22, 2.1, M.stone, x, 0.11, z);
        pkHedge(x, z, 0.8, 1.9, 0.85);
      }
    });
    // trees: a seeded scatter over the park, skipping the rides, the routes and the midway.
    // broadleafs with a conifer mixed in, each seeded so it keeps its shape - and the park keeps its trees from one load to the next
    var rng = pkRng(20260418);
    for (var tx = -68; tx <= 68; tx += 9) {
      for (var tz = -92; tz <= 26; tz += 9) {
        var px = tx + (rng() - 0.5) * 6, pz = tz + (rng() - 0.5) * 6, keep = rng(), ps = 0.85 + rng() * 0.8;
        if (keep < 0.42 || !pkTreeOK(px, pz)) continue;
        var seed = Math.abs(Math.round(px * 13 + pz * 7));
        if (seed % 5 === 0) pkConifer(px, pz, ps, null, seed); else pkTree(px, pz, ps, null, seed);
      }
    }
    // the east strip, between the walk and the yards
    var rng4 = pkRng(20261022);
    for (tx = 76; tx <= 120; tx += 8) {
      for (tz = -114; tz <= 26; tz += 8) {
        px = tx + (rng4() - 0.5) * 5; pz = tz + (rng4() - 0.5) * 5; keep = rng4(); ps = 0.85 + rng4() * 0.8;
        if (keep < 0.35 || !pkTreeOK(px, pz)) continue;
        seed = Math.abs(Math.round(px * 13 + pz * 7));
        if (seed % 5 === 0) pkConifer(px, pz, ps, null, seed); else pkTree(px, pz, ps, null, seed);
      }
    }
    // the strip the north fence gave up behind the indoor halls, on its own seed so the trees above keep their places
    var rng3 = pkRng(20261021);
    for (tx = -68; tx <= 68; tx += 9) {
      for (tz = -113; tz <= -104; tz += 9) {
        px = tx + (rng3() - 0.5) * 6; pz = tz + (rng3() - 0.5) * 5; keep = rng3(); ps = 0.85 + rng3() * 0.8;
        if (keep < 0.42 || !pkTreeOK(px, pz)) continue;
        seed = Math.abs(Math.round(px * 13 + pz * 7));
        if (seed % 5 === 0) pkConifer(px, pz, ps, null, seed); else pkTree(px, pz, ps, null, seed);
      }
    }
    // a forest wraps the park, so the palisade is the edge of the trees rather than of a bare green field
    var rng2 = pkRng(77123);
    for (var fx = -88; fx <= PK_PARK.x1 + 16; fx += 7) {
      for (var fz = -127; fz <= 88; fz += 7) {
        if (fx > PK_PARK.x0 - 3 && fx < PK_PARK.x1 + 3 && fz > PK_PARK.z0 - 3 && fz < 71) continue;   // the park and a breathing margin
        if (fz >= 72 && fz <= 80) continue;                         // the road runs along z 76
        var jx = (rng2() - 0.5) * 4, jz = (rng2() - 0.5) * 4, thin = rng2(), sc = 0.95 + rng2() * 1.2;
        if (thin < 0.28) continue;                                  // thin the ring a little
        var qx = fx + jx, qz = fz + jz, qseed = Math.abs(Math.round(qx * 13 + qz * 7));
        if (qseed % 4 === 0) pkConifer(qx, qz, sc, null, qseed); else pkTree(qx, qz, sc, null, qseed);
      }
    }
    // flower beds either side of the gate
    [[-13, 33], [13, 33]].forEach(function (p) { pkFlowerBed(p[0], p[1], 3.0, 1.6); });
    // the park sign on the forecourt, beside the walk up from the car park
    sign(['PARK CO', 'a small park, growing'], 6.0, 1.4, -9.6, 2.6, 50.6, 0.25, { bg: '#1b232c', fg: '#f5b53d' });
    box(0.2, 2.6, 0.2, MAT.wood, -12.2, 1.3, 50.6); box(0.2, 2.6, 0.2, MAT.wood, -7.0, 1.3, 50.6);
    solid(-12.6, -6.6, 50.4, 50.8, 0, 2.6);
    // the road past the car park, with a little traffic
    plane(200, 8, MAT.yard, 0, 0.008, 76, -Math.PI / 2);
    box(200, 0.02, 0.16, MAT.whiteLine, 0, 0.02, 76);
    traffic.x0 = -90; traffic.x1 = 90;
    for (var i = 0; i < 5; i++) trafficAdd(74.5, 1, randf(7, 11));
    for (var j = 0; j < 4; j++) trafficAdd(77.5, -1, randf(7, 11));
    // the cars are the guests' own now (part 19): the lot fills through the day and empties at closing. A wheel stop heads
    // every bay
    pkLotBays().forEach(function (b) { box(1.7, 0.12, 0.22, MAT.steelDark, b.x, 0.06, b.front + (b.front < 62 ? 0.5 : -0.5)); });
    // lamp posts down the edges of the lot
    [[-31.6, 55.5], [31.6, 55.5], [-31.6, 68.5], [31.6, 68.5]].forEach(function (p) { pkLamp(p[0], p[1], 5.2); });
    // and a barrier at the entrance drive, with a little booth
    [[-5.5, 72.6], [5.5, 72.6]].forEach(function (p) { cyl(0.14, 1.1, MAT.steelDark, p[0], 0.55, p[1], null, 10); });
    pkLotBarrier();                                    // the boom lifts for the guests' cars (part 19)
    box(0.5, 1.0, 0.5, MAT.steelDark, -5.9, 0.5, 72.6);
    box(0.34, 0.24, 0.02, glowMat(0x5fd38d, 1.1), -5.9, 1.12, 72.6);
  }
  function pkBenchAt(x, z, rot) {
    var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot * Math.PI / 2; scene.add(g);
    box(1.8, 0.08, 0.5, MAT.wood, 0, 0.45, 0, g);
    box(1.8, 0.5, 0.08, MAT.wood, 0, 0.72, -0.22, g);
    [[-0.75, -0.18], [0.75, -0.18], [-0.75, 0.18], [0.75, 0.18]].forEach(function (p) { box(0.08, 0.45, 0.08, MAT.steelDark, p[0], 0.22, p[1], g); });
    solid(x - 0.95, x + 0.95, z - 0.35, z + 0.35, 0, 0.9);
  }
  function pkBinAt(x, z) {
    var g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    cyl(0.34, 0.9, MAT.green, 0, 0.45, 0, g, 14);
    cyl(0.38, 0.08, MAT.steelDark, 0, 0.94, 0, g, 14);
    box(0.3, 0.22, 0.02, MAT.black, 0, 0.62, 0.34, g);
    hitBox(0.9, 1.2, 0.9, 0, 0.6, 0, {
      prompt: function () { return 'Papier hier!'; },
      use: function () { sfx('ok'); say(pkNearestHuman(x, z), 'Papier hier!'); toast('Papier hier!', 'good'); }
    }, g);
    solid(x - 0.4, x + 0.4, z - 0.4, z + 0.4, 0, 1.0);
  }
  function pkBedAt(x, z) {
    var g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    box(3.0, 0.3, 1.6, MAT.brick, 0, 0.15, 0, g);
    box(2.8, 0.12, 1.4, MAT.grass, 0, 0.32, 0, g);
    for (var i = 0; i < 9; i++) { var c = [0xd94f4f, 0xf0c04a, 0xe08fc0, 0xf2f2f2][i % 4]; sphere(0.13, std({ color: c, roughness: 0.8 }), -1.1 + (i % 3) * 1.1, 0.44, -0.4 + Math.floor(i / 3) * 0.4, g); }
    solid(x - 1.5, x + 1.5, z - 0.8, z + 0.8, 0, 0.5);
  }
  function pkNearestHuman(x, z) {
    var best = null, bd = 9;
    PK.guests.forEach(function (g) { var d = dist2(g.rec.x, g.rec.z, x, z); if (d < bd) { bd = d; best = g.g; } });
    return best;
  }
  // ── The props the park can place in build mode ────────────────────
  function pkDefProps() {
    defProp('pkBench', { label: 'park bench', x: -8, z: 20, rot: 1, cat: 'park', build: function (c) {
      c.box(1.8, 0.08, 0.5, MAT.wood, 0, 0.45, 0); c.box(1.8, 0.5, 0.08, MAT.wood, 0, 0.72, -0.22);
      [[-0.75, -0.18], [0.75, -0.18], [-0.75, 0.18], [0.75, 0.18]].forEach(function (p) { c.box(0.08, 0.45, 0.08, MAT.steelDark, p[0], 0.22, p[1]); });
      c.solid(-0.95, 0.95, -0.35, 0.35, 0, 0.9);
    } });
    defProp('pkBin', { label: 'paper bin', x: -6, z: 26, rot: 0, cat: 'park', build: function (c) {
      c.cyl(0.34, 0.9, MAT.green, 0, 0.45, 0, 14); c.cyl(0.38, 0.08, MAT.steelDark, 0, 0.94, 0, 14); c.box(0.3, 0.22, 0.02, MAT.black, 0, 0.62, 0.34);
      c.hit(0.9, 1.2, 0.9, 0, 0.6, 0, { prompt: function () { return 'Papier hier!'; }, use: function () { sfx('ok'); toast('Papier hier!', 'good'); } });
      c.solid(-0.4, 0.4, -0.4, 0.4, 0, 1.0);
    } });
    defProp('pkBed', { label: 'flower bed', x: -13, z: 33, rot: 0, cat: 'park', build: function (c) {
      c.box(3.0, 0.3, 1.6, MAT.brick, 0, 0.15, 0); c.box(2.8, 0.12, 1.4, MAT.grass, 0, 0.32, 0);
      for (var i = 0; i < 9; i++) c.sphere(0.13, std({ color: [0xd94f4f, 0xf0c04a, 0xe08fc0, 0xf2f2f2][i % 4], roughness: 0.8 }), -1.1 + (i % 3) * 1.1, 0.44, -0.4 + Math.floor(i / 3) * 0.4);
      c.solid(-1.5, 1.5, -0.8, 0.8, 0, 0.5);
    } });
    defProp('pkLamp', { label: 'lamp post', x: -7, z: 24, rot: 0, cat: 'park', build: function (c) {
      c.cyl(0.06, 5, MAT.steelDark, 0, 2.5, 0, 8, 0.09); c.box(0.9, 0.06, 0.06, MAT.steelDark, 0.45, 4.95, 0);
      var lens = c.box(0.36, 0.14, 0.3, glowMat(0xfff2c0, 0.6), 0.9, 4.88, 0); lampMeshes.push(lens);
      c.solid(-0.15, 0.15, -0.15, 0.15, 0, 5);
    } });
    defProp('pkTree', { label: 'tree', x: -16, z: 24, rot: 0, cat: 'park', build: function (c) {
      c.cyl(0.12, 2.6, std({ color: 0x5b4634, roughness: 1 }), 0, 1.3, 0, 8, 0.18);
      [[0, 3.2, 0, 1.3], [0.7, 2.7, 0.4, 0.9], [-0.6, 2.9, -0.5, 1.0], [0.1, 4.0, 0.2, 0.8]].forEach(function (b, i) { c.sphere(b[3], std({ color: [0x3f6f2e, 0x5c8f44, 0x45752f, 0x6f9a4a][i], roughness: 1 }), b[0], b[1], b[2]); });
      c.solid(-0.3, 0.3, -0.3, 0.3, 0, 2.6);
    } });
    defProp('pkSign', { label: 'park sign', x: 0, z: 51.5, rot: 0, cat: 'park', build: function (c) {
      c.sign(['PARK CO'], 2.4, 0.6, 0, 2.2, 0.06, 0, { bg: '#1b232c', fg: '#f5b53d' });
      c.box(0.14, 2.2, 0.14, MAT.wood, -1.0, 1.1, 0); c.box(0.14, 2.2, 0.14, MAT.wood, 1.0, 1.1, 0);
      c.solid(-1.2, 1.2, -0.15, 0.15, 0, 2.4);
    } });
  }
  // ── The game ──────────────────────────────────────────────────────
  var GAME = {
    handle: 'PARK_CO', version: '0.1.1',
    floorY: function (x, z) { return pkFloor(x, z); },
    insideWalk: function (x, z) { return pkInsidePark(x, z); },
    // the coaster's control room (part 03, PK_OP): indoors, under its roof, inside its four walls
    indoors: function (x, z) { var O = PK_OP; return x > O.x0 && x < O.x1 && z > O.z0 && z < O.z1; },
    roofAt: function (x, z) { var O = PK_OP; return x > O.x0 && x < O.x1 && z > O.z0 && z < O.z1 ? O.h : 0; },
    wallPlanes: function () { var O = PK_OP; return [{ a: 'x', v: O.x0, n: 1, z0: O.z0, z1: O.z1 }, { a: 'x', v: O.x1, n: -1, z0: O.z0, z1: O.z1 }, { a: 'z', v: O.z0, n: 1, x0: O.x0, x1: O.x1 }, { a: 'z', v: O.z1, n: -1, x0: O.x0, x1: O.x1 }]; },
    editClamp: function (pt) { return { x: clamp(pt.x, PK_PARK.x0 + 1, PK_PARK.x1 - 1), z: clamp(pt.z, PK_PARK.z0 + 1, PK_PARK.z1 - 1) }; },
    doorOpeners: function () {
      var w = PK.guests.map(function (g) { return { x: g.rec.x, z: g.rec.z }; });
      if (typeof player !== 'undefined' && player) w.push({ x: player.x, z: player.z });   // the player opens doors by walking up to them
      return w;
    },
    stepSurface: function (x, z) { return pkInsidePark(x, z) ? 'floor' : 'outside'; },
    collides: function (x, z) { return pkLaneCollides(x, z); },
    playerOverride: function (dt) { return pkPlayerRideOverride(dt); },
    key: function (e) {
      if (e.code === 'KeyE' && !e.repeat && PK.playerRide) return pkPlayerRideExitTry();
      return false;
    },
    powered: function () { return !!PK.lights && (S.time >= 18 || S.time < 7); },
    freshState: function () {
      return { day: 1, time: 9, bank: 500, level: 1, log: [], ledger: [], stats: { earned: 0, spent: 0 }, layout: {}, custom: [], hdoors: {},
        ticketPrice: 25, snackPrice: 6, auto: false, ctlAuto: {}, ctlKey: {}, coasterKey: false, cycles: 0, xp: 0, clerk: true, operator: false, snackOpen: false, train2: false, lights: false,   // the starter clerk works day one for free
        wear: 0, rides: {}, today: { tickets: 0, snacks: 0, rides: 0, earned: 0 } };
    },
    // a day one save from before the starter clerk gets one too; later days keep the park they earned
    migrate: function (s) { if (s.day === 1 && !s.clerk) s.clerk = true; return s; },
    buildWorld: function (loaded) {
      pkGround(); pkGate(); pkBooths(); pkOffice(); pkMidway(); pkBuildCoaster(); pkBuildOperatorRoom(); pkBuildSnack();
      pkBuildAttractions();
      pkDressAll();
      if (typeof pkThemeBuild === 'function') pkThemeBuild();   // part 12: the lands, the routes, the hub, the planting
      pkBuildNpcs();
      pkDefProps(); buildProps();
      buildSky({ clouds: 6, rainN: 2500, snowN: 1200 });
      // the grid keeps the cell lattice it was tuned on (origin z -99 when the fence stood at -95): moving the fence by a
      // distance that is not a whole number of cells shifts every cell edge and can shut a narrow way through
      var navZ0 = -99 - 0.6 * Math.ceil((-99 - (PK_PARK.z0 - 4)) / 0.6 - 1e-9);
      navSetup({ x0: PK_PARK.x0 - 4, z0: navZ0, width: (PK_PARK.x1 - PK_PARK.x0) + 8, depth: (PK_PARK.z1 - navZ0) + 4, cell: 0.6 });
    },
    afterBuild: function (loaded) { pkSyncSaved(); },
    onEnter: function (loaded) { pkLog('The gate opens. Day ' + S.day + '.'); if (!loaded && S.clerk) toast('Your clerk works the ticket window - wages from day 2', 'good'); },
    tick: function (dt) { pkTick(dt); },
    startStats: function (loaded) {
      return loaded ? ['Day ' + S.day, money(S.bank), 'level ' + PK.level, pkOpenCount() + ' of ' + (PK.attractions.length + 1) + ' rides open']
        : ['A small park', money(500), 'one coaster', 'seven rides to open'];
    },
    startNote: function (loaded) { return loaded ? 'Slot ' + CO.save.slot + ' · last saved ' + (S.savedAt ? new Date(S.savedAt).toLocaleString() : 'never') : 'Slot ' + CO.save.slot + ' · a new park'; },
    hud: function () {
      var g = $('h-guests'); if (g) g.textContent = PK.guests.length + ' in the park';
      // the main coaster's own state (it is the ride you work), how many rides are open, and - only while you are on one - the
      // ride you are on, so the pill never reads as if you were riding when you are not
      var r = $('h-ride');
      if (r) {
        var pr = PK.playerRide, on = pr ? (pr.kind === 'coaster' ? 'the coaster' : pr.a && pr.a.name) : '';
        r.textContent = (PK.duty ? 'On duty at ' + PK.duty.name + ' · ' : '') + (on ? 'Riding ' + on + ' · ' : '') + 'Coaster: ' + pkRideWord() + (pkCoasterAuto() ? ' (auto)' : '') + ' · ' + pkOpenCount() + ' of ' + (PK.attractions.length + 1) + ' rides open';
      }
    },
    panel: function (kind, tab) { return pkPanel(kind, tab); },
    panelAct: function (act, arg) { return pkPanelAct(act, arg); },
    guideHtml: function () { return pkGuide(); },
    commands: {
      cash: function (n) { pay(+n || 0, 'dev'); return 'bank ' + money(S.bank); },
      guests: function () { return PK.guests.length + ' guests, ' + PK.queue.length + ' in the coaster queue'; },
      ride: function () { return 'ride ' + PK.ride.state + (S.auto ? ' (auto)' : ' (manual)') + ', ' + PK.ride.riders + ' riding, ' + S.cycles + ' cycles'; },
      ticket: function (n) { return 'adults ' + money(pkPrice(+n || 0)); },
      xp: function (n) { pkXp(+n || 0); return 'xp ' + PK.xp + ', level ' + PK.level; },
      spawn: function (n) { var k = clamp(+n || 1, 1, 20); for (var i = 0; i < k; i++) pkSpawnGuest(); return k + ' guests arrive'; },
      auto: function () { var on = pkSetAuto(!pkCoasterAuto()); return 'coaster auto ' + (on ? 'on' : 'off'); },
      dispatch: function () { return pkDispatch() ? 'dispatched' : 'the ride will not go: ' + PK.ride.fault; },
      rides: function () { return pkOpenCount() + ' of ' + (PK.attractions.length + 1) + ' open: ' + pkRideList(); },
      open: function (id) { return pkOpenRide(String(id || '')) ? 'opened ' + id : 'no ride called ' + id; }
    },
    devState: function () { return { guests: PK.guests.length, queue: PK.queue.length, ride: PK.ride.state, auto: !!S.auto, cycles: S.cycles || 0, level: PK.level, xp: PK.xp, tickets: PK.today.tickets }; },
    T: function () {
      return { GAME: GAME, PK: PK, PK_LEVELS: PK_LEVELS, PK_QUEUE_SLOTS: PK_QUEUE_SLOTS, PK_BOOTHS: PK_BOOTHS,
        pkSpawnGuest: pkSpawnGuest, pkServe: pkServe, pkDispatch: pkDispatch, pkTestRun: pkTestRun, pkSetAuto: pkSetAuto, pkPrice: pkPrice,
        pkRideWord: pkRideWord, pkLevel: pkLevel, pkXp: pkXp, pkFloor: pkFloor, pkOnPlatform: pkOnPlatform,
        pkBoothSlot: pkBoothSlot, pkGuestAt: pkGuestAt, pkSeatWorld: pkSeatWorld, pkRideTick: pkRideTick, pkGuestTick: pkGuestTick,
        pkQueueJoin: pkQueueJoin, pkQueueReslot: pkQueueReslot, pkPool: function () { return PK_POOL; }, pkLot: function () { return PK_LOT; }, pkLotArrive: pkLotArrive,
        pkOpenGates: pkOpenGates, pkCloseGates: pkCloseGates, pkGatesToggle: pkGatesToggle, pkBarsDown: pkBarsDown, pkBarsUp: pkBarsUp, pkStop: pkStop, pkReset: pkReset,
        pkTick: pkTick, pkPanel: pkPanel, pkPanelAct: pkPanelAct, pkGuide: pkGuide, pkTrack: function () { return PK.curve; }, pkTrain: function () { return PK.cars; },
        pkCoasterAuto: pkCoasterAuto,
        pkSeats: function () { return PK.seats; }, pkCounts: function () { return { guests: PK.guests.length, queue: PK.queue.length, seats: PK.seats.length, cars: PK.cars.length, track: PK.len }; },
        pkBuildCoaster: pkBuildCoaster, pkBuildOperatorRoom: pkBuildOperatorRoom, pkBuildSnack: pkBuildSnack,
        pkBuildAttractions: pkBuildAttractions, pkOpenRide: pkOpenRide, pkOpenCount: pkOpenCount, pkRideList: pkRideList,
        pkSetRideOpen: pkSetRideOpen,
        pkOffice: pkOffice, pkService: pkService, pkFire: pkFire, pkAdminPanel: pkAdminPanel,
        pkAttractions: function () { return PK.attractions; }, pkAttraction: function (id) { return PK.attrById[id]; },
        pkAttrQueueJoin: pkAttrQueueJoin, pkAttrQueueLeave: pkAttrQueueLeave,
        pkPlayerRideJoin: pkPlayerRideJoin, pkPlayerRideStepOff: pkPlayerRideStepOff, pkPlayerRideExitTry: pkPlayerRideExitTry,
        pkPlayerRides: pkPlayerRides, pkPlayerTick: pkPlayerTick, pkLanes: function () { return PK.lanes; },
        pkAttrTick: pkAttrTick, pkAttrSeat: pkAttrSeat, pkAttrUnseatAll: pkAttrUnseatAll, pkAttrSlot: pkAttrSlot, pkAttrLanePath: pkAttrLanePath, pkLaneCollides: pkLaneCollides,
        pkTurnstiles: function () { return PK.turnstiles; }, pkGates: function () { return PK.gates; }, pkBooths: function () { return PK.booths; },
        pkSnack: function () { return PK.snack; }, pkScreen: function () { return PK.screen; },
        pkConsole: function () { return PK.console; },
        pkCabinet: function () { return PK.console && PK.console.cabinet; },
        pkNearestHuman: pkNearestHuman, pkLog: pkLog, pkNewDay: pkNewDay,
        pkHire: pkHire, pkSnackBuy: pkSnackBuy, pkSnackPrice: pkSnackPrice, pkRideLoad: pkRideLoad, pkPlaceTrain: pkPlaceTrain, pkSeatGuest: pkSeatGuest, pkUnseatGuest: pkUnseatGuest,
        spanCut: spanCut, lineWall: lineWall, roomFloor: roomFloor, troffer: troffer, highBay: highBay, fenceRun: fenceRun, tree: tree, lampPost: lampPost,
        insideWalk: insideWalk, inRect: inRect, navSetup: navSetup, yawWrap: yawWrap, sfxCount: function () { return sfxCount; }, SFX: SFX,
        geoCache: geoCache, BEVEL: BEVEL, bevelGeo: bevelGeo, roundCylGeo: roundCylGeo, boxGeo: boxGeo, taperGeo: taperGeo, textTex: textTex,
        box: box, cyl: cyl, sign: sign, groundBlob: groundBlob, disposeTree: disposeTree, burst: burst, tickBursts: tickBursts, bursts: bursts,
        lightBudget: lightBudget, seededStream: seededStream, hexCss: hexCss, mergeById: mergeById, scFit: scFit, catalogueHtml: catalogueHtml,
        cards: cards, tickCards: tickCards, tickSky: tickSky, weatherFlash: function () { return weatherFlash; }, updateLightBudget: updateLightBudget,
        shadowTick: shadowTick, faceTex: faceTex, humanGeo: humanGeo, collides: collides, panel: panel, hitBox: hitBox, addInter: addInter, inter: inter,
        propSeed: propSeed, mixHex: mixHex, fmtTime: fmtTime, money: money, hook: hook, runHooks: runHooks, floorY: floorY, tickWeatherState: tickWeatherState };
    }
  };
  // the engine pulls the fog in to 70 m every frame; a park this wide needs to be seen across it
  hook('lighting', function (day, dawn, overcast, power) {
    if (scene.fog) { scene.fog.near = 210 - (overcast || 0) * 60; scene.fog.far = 540 - (overcast || 0) * 200; }
  });
  CO.setup({ canvas: 'co-canvas', save: 'park-co', game: GAME, spawn: { x: 0, z: 42, yaw: 0 }, sun: { box: 120, far: 320, mapSize: 2048, target: [0, 0, 0] }, lightBudget: 10, fog: { color: 0x9dbbd8, near: 210, far: 520 } });
