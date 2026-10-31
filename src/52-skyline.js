//@ Park Co, part 52: Stage 1 of the expansion, The Skyline. The viaduct across the park finished as a working railway:
//@ three deck stations with raised platforms under glazed canopies, a brick lift tower at each with a lift the player rides,
//@ and the Skyline Shuttle, a two-car modern metro unit that runs north to south and back on its own, calling at all three.
//@ The ride is one attraction (part 05) with its own control cabin and panel sheet (part 14); its plot and queue stand at
//@ Woods Halt, the only station inside the park, and a rider rides out to the far end and back there. The viaduct itself is
//@ part 46: this part tells it where the platforms stand and builds what stands on the deck.
  var PK_SKY = { built: false, t: 0, s: 0, v: 0, dir: 1, mode: 'dwell', at: 0, next: 1, dwell: 0, home: 1, veh: [], lamps: [], through: false };
  var PK_SKY_DECK = 15, PK_SKY_RAIL = 15.4, PK_SKY_FLOOR = 0.9;   // deck top, rail top over the ballast, the car floor above the rail
  var PK_SKY_TOP = PK_SKY_RAIL + PK_SKY_FLOOR;                     // the platform stands at the car floor: level boarding
  var PK_SKY_GREEN = 0x1d5b3b;

  // ── The line and where the stations stand ────────────────────────
  // part 46's smoothed alignment: straight legs and real curves, sampled every metre
  var PK_SKY_PTS = pkXpViaPts();
  function pkSkyLine() {
    if (PK_SKY.line) return PK_SKY.line;
    var pts = PK_SKY_PTS, segs = [], total = 0;
    for (var i = 0; i < pts.length - 1; i++) {
      var A = pts[i], B = pts[i + 1], L = Math.hypot(B[0] - A[0], B[1] - A[1]);
      segs.push({ ax: A[0], az: A[1], bx: B[0], bz: B[1], s0: total, L: L });
      total += L;
    }
    return (PK_SKY.line = { segs: segs, total: total });
  }
  // the point, the heading (a unit vector along the line) and the yaw of the span frame at a distance s along it
  function pkSkyAt(s, o) {
    var L = pkSkyLine(), segs = L.segs; s = clamp(s, 0, L.total);
    for (var i = 0; i < segs.length; i++) {
      var g = segs[i];
      if (s <= g.s0 + g.L || i === segs.length - 1) {
        var f = g.L ? clamp((s - g.s0) / g.L, 0, 1) : 0, dx = (g.bx - g.ax) / (g.L || 1), dz = (g.bz - g.az) / (g.L || 1);
        o = o || {};
        o.x = g.ax + (g.bx - g.ax) * f; o.z = g.az + (g.bz - g.az) * f; o.dx = dx; o.dz = dz;
        o.yaw = Math.atan2(-dz, dx);   // the train frame: local +x forward
        return o;
      }
    }
    return o;
  }
  // the distance along the line of the point on it nearest (x, z)
  function pkSkySOf(x, z) {
    var L = pkSkyLine(), best = 0, bd = 1e9;
    for (var i = 0; i < L.segs.length; i++) {
      var g = L.segs[i], ux = g.bx - g.ax, uz = g.bz - g.az, ll = ux * ux + uz * uz || 1;
      var t = clamp(((x - g.ax) * ux + (z - g.az) * uz) / ll, 0, 1), px = g.ax + ux * t, pz = g.az + uz * t, d = (px - x) * (px - x) + (pz - z) * (pz - z);
      if (d < bd) { bd = d; best = g.s0 + t * g.L; }
    }
    return best;
  }
  function pkSkySide(x, z, dx, dz, o) { return { x: x + dz * o, z: z - dx * o }; }

  // ── The stations ─────────────────────────────────────────────────
  // Each tower is drawn in its own frame with the street door on its local +z face; ry turns that face to where the plan
  // puts it. land names the face (in that frame) the deck-level door opens on, landAt where along it.
  var PK_SKY_ST = [
    { id: 'north', name: 'SKYLINE NORTH', x: -67, z0: -178, z1: -138, tower: [-60, -172], towerH: 5, ry: 0, land: '-x', landAt: 0, link: [-63.4, -62.2, -174.6, -169.4] },
    { id: 'woods', name: 'WOODS HALT', x: -67, z0: -34, z1: -6, tower: [-61, -44.6], towerH: 5, ry: 0, land: '+z', landAt: -1.6, link: null },
    { id: 'south', name: 'SKYLINE SOUTH', x: -112, z0: 112, z1: 152, tower: [-104, 146], towerH: 5, ry: -Math.PI / 2, land: '+z', landAt: 0, link: [-107.6, -106.3, 143.2, 148.8] }
  ];
  PK_SKY_ST.forEach(function (st) {
    st.px0 = st.x + 1.45; st.px1 = st.x + 4.8;                 // the platform, from 0.15 m off the car's side out to its rail
    st.s0 = pkSkySOf(st.x, st.z0); st.s1 = pkSkySOf(st.x, st.z1);
    if (st.s0 > st.s1) { var t = st.s0; st.s0 = st.s1; st.s1 = t; }
    st.stop = (st.s0 + st.s1) / 2 - 8.1;                       // where the front car's centre stands: the whole train on the platform
    st.tx0 = st.tower[0] - st.towerH / 2; st.tx1 = st.tower[0] + st.towerH / 2;
    st.tz0 = st.tower[1] - st.towerH / 2; st.tz1 = st.tower[1] + st.towerH / 2;
  });
  // the Woods Halt tower stands off the Dark Woods street; its deck-level door opens on a covered gallery that runs south
  // over the street to the platform's north end
  PK_SKY_ST[1].gal = [-65.2, -61.9, -42.3, -34.0];
  // a point in a tower's own frame, in the world
  function pkSkyTW(st, lx, lz) { var c = Math.cos(st.ry), s = Math.sin(st.ry); return { x: st.tower[0] + lx * c + lz * s, z: st.tower[1] - lx * s + lz * c }; }
  // a rectangle in a tower's frame, as the world box the solids want
  function pkSkyTRect(st, x0, x1, z0, z1, y0, y1) {
    var a = pkSkyTW(st, x0, z0), b = pkSkyTW(st, x1, z1);
    solid(Math.min(a.x, b.x), Math.max(a.x, b.x), Math.min(a.z, b.z), Math.max(a.z, b.z), y0, y1);
  }

  // ── The floors up on the line: the platform, the tower landings and the ways between them ──
  // pkFloor is the park's, and it is flat. Guests ask this table first (pkGuestFloor); the player stands on it only once he
  // is up there (GAME.floorY below), so the street under a platform stays the street.
  var PK_SKY_FLOORS = [];
  PK_SKY_ST.forEach(function (st) {
    PK_SKY_FLOORS.push([st.px0, st.px1, st.z0, st.z1, PK_SKY_TOP]);
    PK_SKY_FLOORS.push([st.tx0, st.tx1, st.tz0, st.tz1, PK_SKY_TOP]);
    if (st.link) PK_SKY_FLOORS.push(st.link.concat([PK_SKY_TOP]));
  });
  PK_SKY_FLOORS.push(PK_SKY_ST[1].gal.concat([PK_SKY_TOP]));
  function pkSkyFloorAt(x, z) {
    for (var i = 0; i < PK_SKY_FLOORS.length; i++) {
      var f = PK_SKY_FLOORS[i];
      if (x > f[0] && x < f[1] && z > f[2] && z < f[3]) return f[4];
    }
    return null;
  }
  // A guest is upstairs (gu.skyUp) from the moment the lift has carried them up until it carries them down; only then is
  // the deck their floor, so a guest in the tower's street hall stays in the street hall. In the lift itself (the next
  // point of their walk carries lift: +1 or -1) they crawl a few centimetres across the cage while the height follows.
  function pkGuestFloor(x, z, gu) {
    if (!gu) { var h0 = pkSkyFloorAt(x, z); return h0 !== null ? h0 : pkFloor(x, z); }
    var p0 = gu.rec && gu.rec.path && gu.rec.path[0];
    if (p0 && p0.lift) {
      if (!gu.liftSpd) { gu.liftSpd = gu.rec.speed || 1.2; gu.liftD = Math.max(0.02, Math.hypot(p0.x - x, p0.z - z)); gu.liftDir = p0.lift; gu.rec.speed = 0.012; }
      var f = 1 - clamp(Math.hypot(p0.x - x, p0.z - z) / gu.liftD, 0, 1);
      return p0.lift > 0 ? PK_SKY_TOP * f : PK_SKY_TOP * (1 - f);
    }
    if (gu.liftSpd) { gu.rec.speed = gu.liftSpd; gu.liftSpd = 0; gu.skyUp = gu.liftDir > 0; }
    if (gu.skyUp) {
      var h = pkSkyFloorAt(x, z); if (h !== null) return h;
      // stepping through a door into the car, or out of it: the car's floor is level with the platform. Guests only walk
      // here while she stands at the station, so this needs no train test (the player's floor never comes this way)
      for (var i = 0; i < PK_SKY_ST.length; i++) { var st = PK_SKY_ST[i]; if (x > st.x - PK_SKY_W / 2 - 0.1 && x <= st.px0 + 0.05 && z > st.z0 && z < st.z1) return PK_SKY_TOP; }
    }
    return pkFloor(x, z);
  }
  var _pkSkyPrevFloorY = GAME.floorY;
  GAME.floorY = function (x, z, y) {
    var b = _pkSkyPrevFloorY ? _pkSkyPrevFloorY(x, z, y) : 0;
    if (y === undefined || y < PK_SKY_TOP - 1.0) return b;
    var h = pkSkyFloorAt(x, z); return h !== null ? Math.max(h, b) : b;
  };
  // a wall at deck height only: it stops the player walking off a platform or a gallery, and is nothing in the street
  function pkSkyDeckSolid(x0, x1, z0, z1) { solid(x0, x1, z0, z1, PK_SKY_TOP - 0.3, PK_SKY_TOP + 1.4); }

  // ── Materials ────────────────────────────────────────────────────
  var PK_SKY_M = null;
  function pkSkyM() {
    if (PK_SKY_M) return PK_SKY_M;
    var M = pkMats();
    // brick drawn to scale and tiled in metres: 225 mm stretchers in running bond, 75 mm courses, light mortar, the reds
    // varied brick by brick, so a 20 m tower reads as laid brick up close and from across the park
    var brickT = tex(512, 512, function (c, W, H) {
      var rows = 16, cols = 5, bh = H / rows, bw = W / cols, gap = 3, reds = ['#8e3f2c', '#9a4a33', '#7d3826', '#a3543a', '#8a4430', '#95412d'];
      c.fillStyle = '#cfc6b4'; c.fillRect(0, 0, W, H);
      for (var r = 0; r < rows; r++) for (var k = -1; k < cols + 1; k++) {
        var x = k * bw + (r % 2 ? bw / 2 : 0), y = r * bh;
        c.fillStyle = reds[(r * 7 + k * 3 + 13) % reds.length]; c.fillRect(x + gap / 2, y + gap / 2, bw - gap, bh - gap);
        c.fillStyle = 'rgba(0,0,0,' + (0.04 + ((r * 5 + k * 11) % 7) * 0.012) + ')'; c.fillRect(x + gap / 2, y + bh * 0.55, bw - gap, bh * 0.45 - gap / 2);
      }
      for (var i = 0; i < 1800; i++) { c.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '0,0,0' : '255,240,220') + ',' + (Math.random() * 0.08) + ')'; c.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
    }, 1, 1);
    brickT.wrapS = brickT.wrapT = THREE.RepeatWrapping;
    var brick = std({ map: brickT, roughness: 0.92 }); brick.userData.tile = [1.125, 1.2];
    var plaster = std({ map: TEX.plaster, color: 0xefe8d8, roughness: 0.9 }); plaster.userData.tile = [2, 2];
    var tileT = tex(256, 256, function (c, W, H) { c.fillStyle = '#e9e4d6'; c.fillRect(0, 0, W, H); for (var y = 0; y < 8; y++) for (var x = 0; x < 4; x++) { c.fillStyle = (x + y) % 2 ? '#1f5f45' : '#256b4e'; c.fillRect(x * 64 + 2, y * 32 + 2, 60, 28); } }, 1, 1);
    tileT.wrapS = tileT.wrapT = THREE.RepeatWrapping;
    var tiles = std({ map: tileT, roughness: 0.35, metalness: 0.05 }); tiles.userData.tile = [0.6, 0.6];
    var stone = std({ map: TEX.plaster, color: 0xd9d2c2, roughness: 0.9 }); stone.userData.tile = [2, 2];
    var pavers = std({ map: M.pavers && M.pavers.map ? M.pavers.map : TEX.plaster, color: 0xd8d4cc, roughness: 0.9 });
    PK_SKY_M = {
      brick: brick, plaster: plaster, tiles: tiles, stone: stone, stoneDark: M.stoneDark, slate: M.slate, iron: M.iron, brass: M.brass, gold: M.gold,
      wood: std({ map: TEX.wood || null, color: 0x8a5a36, roughness: 0.82 }), cream: M.cream, white: M.white, pavers: pavers,   // part 11 has no wood of its own
      slab: std({ map: TEX.plaster, color: 0xc9c4ba, roughness: 0.92 }),
      green: pkPaint(PK_SKY_GREEN, 0.4, 0.3), greenD: pkPaint(0x123a27, 0.42, 0.3),
      glass: std({ color: 0xa8c8d4, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide }),
      psd: std({ color: 0xe2f2f4, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.13, depthWrite: false, side: THREE.DoubleSide }),
      roofGlass: std({ color: 0xcfe4ea, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.42, depthWrite: false, side: THREE.DoubleSide }),
      winPane: std({ color: 0x2c3a44, roughness: 0.15, metalness: 0.5, emissive: 0xffd9a0, emissiveIntensity: 0.0 }),
      steelP: std({ color: 0x5f6a72, roughness: 0.4, metalness: 0.7 }), black: std({ color: 0x14161a, roughness: 0.45 }),
      yellow: pkPaint(0xf0c63a, 0.6, 0.1), lineW: pkPaint(0xf6f2e6, 0.7, 0.05), seat: std({ color: 0x2c4f6e, roughness: 0.85 }),
      lamp: glowMat(0xffe6b0, 1.5), led: glowMat(0xeaf6ff, 1.4), tail: glowMat(0xff3a2e, 1.0), clock: std({ color: 0xf6f2e8, roughness: 0.6 })
    };
    return PK_SKY_M;
  }

  // ── Stage 1 asks of the viaduct (part 46 calls these) ────────────
  function pkSkyStationAt(x, z) {
    for (var i = 0; i < PK_SKY_ST.length; i++) {
      var st = PK_SKY_ST[i];
      if (z > st.z0 && z < st.z1 && x > st.x - 6 && x < st.x + 6) return st;
    }
    return null;
  }
  // is this stretch of the line beside a platform (the deck's east railing gives way there)?
  function pkSkyPlatformRun(ax, az, bx, bz) {
    var mx = (ax + bx) / 2, mz = (az + bz) / 2;
    for (var i = 0; i < PK_SKY_ST.length; i++) {
      var st = PK_SKY_ST[i];
      if (Math.abs(mx - st.x) < 0.9 && mz > st.z0 - 1 && mz < st.z1 + 1) return true;
    }
    return false;
  }

  // ── A lift tower ─────────────────────────────────────────────────
  // Five metres square and 20.5 m to the cornice: brick laid to scale on a stone plinth, stone quoins, two string courses,
  // a tall window on each face at three levels, a dentilled cornice, a slate hip roof with a glazed lantern, the station's
  // name and a railway clock over the street door, a glass canopy over the door. Inside: a tiled hall, the lift in a green
  // glass shaft in the middle (the player's way up), and the stair winding up the walls round it to the landing.
  var PK_SKY_TH = 20.5, PK_SKY_LIFT = null;
  function pkSkyWall(g, st, face, H, holes) {
    var M = pkSkyM(), HW = st.towerH / 2, T = 0.34, alongX = face === '+z' || face === '-z', sg = (face === '+z' || face === '+x') ? 1 : -1;
    var fix = sg * (HW - T / 2), lo = alongX ? -HW : -HW + T, hi = alongX ? HW : HW - T;
    var edges = [lo, hi];
    holes.forEach(function (h) { edges.push(clamp(h.a0, lo, hi), clamp(h.a1, lo, hi)); });
    edges.sort(function (p, q) { return p - q; });
    var piece = function (b0, b1, y0, y1) {
      if (b1 - b0 < 0.01 || y1 - y0 < 0.01) return;
      var m = (b0 + b1) / 2, L = b1 - b0;
      if (alongX) { box(L, y1 - y0, T, M.brick, m, (y0 + y1) / 2, fix, g); pkSkyTRect(st, b0, b1, fix - T / 2, fix + T / 2, y0, y1); }
      else { box(T, y1 - y0, L, M.brick, fix, (y0 + y1) / 2, m, g); pkSkyTRect(st, fix - T / 2, fix + T / 2, b0, b1, y0, y1); }
    };
    for (var i = 0; i < edges.length - 1; i++) {
      var b0 = edges[i], b1 = edges[i + 1], mid = (b0 + b1) / 2, y = 0;
      if (b1 - b0 < 0.01) continue;
      var here = holes.filter(function (h) { return mid > h.a0 && mid < h.a1; }).sort(function (p, q) { return p.y0 - q.y0; });
      here.forEach(function (h) { piece(b0, b1, y, h.y0); y = h.y1; });
      piece(b0, b1, y, H);
    }
  }
  // the inside of a wall: cream plaster, a green tiled dado at the street and at the landing, broken round the doors
  function pkSkyLining(g, st, face, H, holes) {
    var M = pkSkyM(), HW = st.towerH / 2, T = 0.34, IN = HW - T, alongX = face === '+z' || face === '-z', sg = (face === '+z' || face === '+x') ? 1 : -1;
    var fix = sg * (IN - 0.015), TOP = PK_SKY_TOP, dados = [[0, 1.3], [TOP, TOP + 1.3]], edges = [-IN, IN];
    holes.forEach(function (h) { edges.push(clamp(h.a0, -IN, IN), clamp(h.a1, -IN, IN)); });
    edges.sort(function (p, q) { return p - q; });
    var skin = function (b0, b1, y0, y1, mat) {
      if (b1 - b0 < 0.01 || y1 - y0 < 0.01) return;
      if (alongX) box(b1 - b0, y1 - y0, 0.03, mat, (b0 + b1) / 2, (y0 + y1) / 2, fix, g); else box(0.03, y1 - y0, b1 - b0, mat, fix, (y0 + y1) / 2, (b0 + b1) / 2, g);
    };
    var piece = function (b0, b1, y0, y1) {
      var cuts = [y0];
      dados.forEach(function (d) { if (d[0] > y0 && d[0] < y1) cuts.push(d[0]); if (d[1] > y0 && d[1] < y1) cuts.push(d[1]); });
      cuts.push(y1); cuts.sort(function (p, q) { return p - q; });
      for (var i = 0; i < cuts.length - 1; i++) { var mid = (cuts[i] + cuts[i + 1]) / 2; skin(b0, b1, cuts[i], cuts[i + 1], dados.some(function (d) { return mid > d[0] && mid < d[1]; }) ? M.tiles : M.plaster); }
    };
    for (var i = 0; i < edges.length - 1; i++) {
      var b0 = edges[i], b1 = edges[i + 1], mid = (b0 + b1) / 2, y = 0;
      if (b1 - b0 < 0.01) continue;
      holes.filter(function (h) { return mid > h.a0 && mid < h.a1; }).sort(function (p, q) { return p.y0 - q.y0; }).forEach(function (h) { piece(b0, b1, y, h.y0); y = h.y1; });
      piece(b0, b1, y, H);
    }
  }
  // a skin on a face (plinth, string course, frame): the same box on each face, broken where a hole would be crossed
  function pkSkyFaceBand(g, st, face, y0, y1, out, mat, holes) {
    var HW = st.towerH / 2, alongX = face === '+z' || face === '-z', sg = (face === '+z' || face === '+x') ? 1 : -1, fix = sg * (HW + out / 2);
    var lo = -HW - out, hi = HW + out, cuts = [[lo, lo]];
    holes.filter(function (h) { return h.y0 < y1 && h.y1 > y0; }).sort(function (p, q) { return p.a0 - q.a0; }).forEach(function (h) { cuts.push([h.a0 - 0.12, h.a1 + 0.12]); });
    cuts.push([hi, hi]);
    for (var i = 0; i < cuts.length - 1; i++) {
      var b0 = cuts[i][1], b1 = cuts[i + 1][0]; if (b1 - b0 < 0.02) continue;
      if (alongX) box(b1 - b0, y1 - y0, out, mat, (b0 + b1) / 2, (y0 + y1) / 2, fix, g);
      else box(out, y1 - y0, b1 - b0, mat, fix, (y0 + y1) / 2, (b0 + b1) / 2, g);
    }
  }
  function pkSkyTower(st) {
    var M = pkSkyM(), g = new THREE.Group();
    g.position.set(st.tower[0], 0, st.tower[1]); g.rotation.y = st.ry; scene.add(g);
    var H = PK_SKY_TH, W = st.towerH, HW = W / 2, T = 0.34, IN = HW - T, TOP = PK_SKY_TOP;
    // the holes: the street door on +z, the landing door at deck height on the face the plan's link or gallery comes in on
    var holes = { '+z': [{ a0: -1.2, a1: 1.2, y0: 0, y1: 2.7 }], '-z': [], '+x': [], '-x': [] };
    holes[st.land].push({ a0: st.landAt - 0.65, a1: st.landAt + 0.65, y0: TOP, y1: TOP + 2.2 });
    ['+z', '-z', '+x', '-x'].forEach(function (f) { pkSkyWall(g, st, f, H, holes[f]); pkSkyLining(g, st, f, H - 0.5, holes[f]); });
    // the stone: a plinth course, two string courses, the frames round the doors, and the quoins up each corner
    ['+z', '-z', '+x', '-x'].forEach(function (f) {
      pkSkyFaceBand(g, st, f, 0, 0.9, 0.08, M.stone, holes[f]);
      pkSkyFaceBand(g, st, f, 7.0, 7.32, 0.12, M.stone, holes[f]);
      pkSkyFaceBand(g, st, f, 11.8, 12.1, 0.12, M.stone, holes[f]);
      pkSkyFaceBand(g, st, f, TOP - 0.25, TOP, 0.1, M.stone, holes[f]);
    });
    for (var qy = 0.9, qk = 0; qy < H - 0.3; qy += 0.6, qk++) {
      var qs = qk % 2 ? 0.36 : 0.56;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { box(qs, 0.52, qs, M.stone, c[0] * (HW - qs / 2 + 0.05), qy + 0.27, c[1] * (HW - qs / 2 + 0.05), g); });
    }
    // the openings framed in stone: jambs and a lintel with a keystone
    var frame = function (f, a, w, y0, h) {
      var alongX = f === '+z' || f === '-z', sg = (f === '+z' || f === '+x') ? 1 : -1, o = sg * (HW + 0.06);
      var put = function (along, y, sw, sh) { if (alongX) box(sw, sh, 0.14, M.stone, along, y, o, g); else box(0.14, sh, sw, M.stone, o, y, along, g); };
      put(a - w / 2 - 0.13, y0 + h / 2, 0.26, h); put(a + w / 2 + 0.13, y0 + h / 2, 0.26, h);
      put(a, y0 + h + 0.18, w + 0.52, 0.36); put(a, y0 + h + 0.26, 0.34, 0.5);
    };
    frame('+z', 0, 2.4, 0, 2.7);
    frame(st.land, st.landAt, 1.3, TOP, 2.2);
    // the windows: a tall pane with a stone sill and head on each face at three levels, wherever no door stands
    [5.2, 9.6, 14.0].forEach(function (wy) {
      ['+z', '-z', '+x', '-x'].forEach(function (f) {
        var clash = holes[f].some(function (h) { return h.a0 < 0.6 && h.a1 > -0.6 && h.y0 < wy + 1.1 && h.y1 > wy - 1.1; });
        if (clash) return;
        var alongX = f === '+z' || f === '-z', sg = (f === '+z' || f === '+x') ? 1 : -1, o = sg * (HW + 0.02);
        if (alongX) { box(0.8, 1.9, 0.04, M.winPane, 0, wy, o, g); box(1.1, 0.12, 0.3, M.stone, 0, wy - 1.0, o + sg * 0.06, g); box(1.1, 0.24, 0.16, M.stone, 0, wy + 1.07, o + sg * 0.04, g); box(0.06, 1.9, 0.08, M.greenD, 0, wy, o + sg * 0.02, g); }
        else { box(0.04, 1.9, 0.8, M.winPane, o, wy, 0, g); box(0.3, 0.12, 1.1, M.stone, o + sg * 0.06, wy - 1.0, 0, g); box(0.16, 0.24, 1.1, M.stone, o + sg * 0.04, wy + 1.07, 0, g); box(0.08, 1.9, 0.06, M.greenD, o + sg * 0.02, wy, 0, g); }
      });
    });
    // the top: a dentilled cornice, the slate roof, a glazed lantern and a finial
    box(W + 0.24, 0.5, W + 0.24, M.stone, 0, H - 0.25, 0, g);
    for (var d = -HW; d <= HW + 0.01; d += 0.32) {
      box(0.14, 0.16, 0.12, M.stone, d, H - 0.6, HW + 0.08, g); box(0.14, 0.16, 0.12, M.stone, d, H - 0.6, -HW - 0.08, g);
      box(0.12, 0.16, 0.14, M.stone, HW + 0.08, H - 0.6, d, g); box(0.12, 0.16, 0.14, M.stone, -HW - 0.08, H - 0.6, d, g);
    }
    box(W + 0.6, 0.22, W + 0.6, M.stone, 0, H + 0.11, 0, g);
    pkHipRoof(W + 0.9, W + 0.9, 2.6, M.slate, 0, H + 0.22, 0, g, 0.3);
    box(1.0, 0.9, 1.0, M.green, 0, H + 2.7, 0, g); box(1.04, 0.6, 1.04, M.glass, 0, H + 2.7, 0, g);
    var cap = new THREE.Mesh(new THREE.ConeGeometry(0.78, 0.7, 4), M.slate); cap.rotation.y = Math.PI / 4; cap.position.set(0, H + 3.5, 0); g.add(cap);
    pkRoundCyl(0.04, 0.9, M.iron, 0, H + 4.2, 0, g, 6); sphere(0.1, M.gold, 0, H + 4.7, 0, g);
    // the street face: the station's name over the door, a railway clock under the cornice, a glass canopy over the door,
    // a lamp either side
    sign([st.name], 3.4, 0.46, 0, 3.55, HW + 0.1, 0, { w: 640, h: 88, bg: '#1d5b3b', fg: '#f2e6b8' }, g);
    // the clock: over the street door, beside the landing door when that shares the face, on the side face if it is central
    var cg = new THREE.Group(), cy = H - 1.75, onSide = st.land === '+z' && Math.abs(st.landAt) < 1;
    if (onSide) { cg.position.set(HW, cy, 0); cg.rotation.y = Math.PI / 2; } else cg.position.set(st.land === '+z' ? (st.landAt < 0 ? 0.75 : -0.75) : 0, cy, HW);
    g.add(cg);
    var cf = pkRoundCyl(0.7, 0.1, M.green, 0, 0, 0.06, cg, 32); cf.rotation.x = Math.PI / 2;
    var cd = pkRoundCyl(0.6, 0.1, M.clock, 0, 0, 0.09, cg, 32); cd.rotation.x = Math.PI / 2;
    for (var hr = 0; hr < 12; hr++) { var ha = hr / 12 * Math.PI * 2; box(0.05, hr % 3 ? 0.08 : 0.15, 0.02, M.black, Math.sin(ha) * 0.5, Math.cos(ha) * 0.5, 0.15, cg).rotation.z = -ha; }
    var hh = box(0.06, 0.3, 0.02, M.black, 0.1, 0.1, 0.16, cg); hh.rotation.z = -0.9;
    var mh = box(0.04, 0.46, 0.02, M.black, -0.05, 0.21, 0.17, cg); mh.rotation.z = 0.25;
    [-1, 1].forEach(function (s) { box(0.1, 0.1, 1.5, M.green, s * 1.4, 3.0, HW + 0.75, g); var br = box(0.08, 0.08, 1.5, M.green, s * 1.4, 2.62, HW + 0.62, g); br.rotation.x = -0.55; });
    box(3.0, 0.08, 1.6, M.green, 0, 3.08, HW + 0.8, g); box(2.8, 0.03, 1.5, M.roofGlass, 0, 3.14, HW + 0.8, g);
    [-1.65, 1.65].forEach(function (lx) { box(0.18, 0.4, 0.18, M.black, lx, 2.3, HW + 0.18, g); box(0.14, 0.3, 0.14, M.lamp, lx, 2.3, HW + 0.2, g); });
    // inside: the tiled hall, the landing at deck height (open only round the shaft), the lift and the stair
    box(2 * IN, 0.04, 2 * IN, M.slab, 0, 0.02, 0, g);
    var SH = 0.85;
    [[-IN, -SH, -IN, IN], [SH, IN, -IN, IN], [-SH, SH, -IN, -SH], [-SH, SH, SH, IN]].forEach(function (r) { box(r[1] - r[0], 0.25, r[3] - r[2], M.slab, (r[0] + r[1]) / 2, TOP - 0.125, (r[2] + r[3]) / 2, g); });
    [[-SH, -SH], [SH, -SH], [-SH, SH], [SH, SH]].forEach(function (c) { box(0.12, H - 0.5, 0.12, M.green, c[0], (H - 0.5) / 2, c[1], g); });
    box(2 * SH, 0.14, 2 * SH, M.green, 0, H - 0.5, 0, g);
    box(0.04, H - 0.5, 2 * SH - 0.12, M.glass, -SH, (H - 0.5) / 2, 0, g); box(0.04, H - 0.5, 2 * SH - 0.12, M.glass, SH, (H - 0.5) / 2, 0, g); box(2 * SH - 0.12, H - 0.5, 0.04, M.glass, 0, (H - 0.5) / 2, -SH, g);
    // the gate side carries the call buttons and a gate at each level; the shaft is solid, the lift is the way in
    [0, TOP].forEach(function (ly) { box(2 * SH - 0.12, 2.2, 0.05, M.glass, 0, ly + 1.1, SH, g); box(2 * SH, 0.1, 0.1, M.green, 0, ly + 2.25, SH, g); box(0.14, 0.24, 0.05, M.black, SH + 0.18, ly + 1.2, SH + 0.03, g); box(0.07, 0.07, 0.03, M.led, SH + 0.18, ly + 1.25, SH + 0.06, g); });
    pkSkyTRect(st, -SH, SH, -SH, SH, 0, H);
    var cage = new THREE.Group(); cage.userData.dynamic = true; g.add(cage);
    box(1.5, 0.08, 1.5, M.steelP, 0, 0.04, 0, cage); box(1.5, 0.08, 1.5, M.green, 0, 2.3, 0, cage);
    [[-0.72, -0.72], [0.72, -0.72], [-0.72, 0.72], [0.72, 0.72]].forEach(function (c) { box(0.06, 2.3, 0.06, M.green, c[0], 1.15, c[1], cage); });
    box(1.3, 0.04, 1.3, M.led, 0, 2.24, 0, cage);
    st.cage = cage;
    // the stair, six flights up the walls round the shaft, a landing at each turn
    var c = IN - 0.45, rise = TOP / 6, run = 2 * c, hyp = Math.hypot(run, rise), th = Math.atan2(rise, run);
    var flights = [['x', c, 1, -1], ['z', -c, -1, -1], ['x', -c, -1, 1], ['z', c, 1, 1], ['x', c, 1, -1], ['z', -c, -1, -1]];
    flights.forEach(function (f, k) {
      var y = rise * k + rise / 2;
      if (f[0] === 'x') { var fb = box(0.9, 0.14, hyp, M.slab, f[1], y, 0, g); fb.rotation.x = f[3] < 0 ? th : -th; box(0.04, 0.04, hyp, M.green, f[1] - f[2] * 0.42, y + 0.95, 0, g).rotation.x = f[3] < 0 ? th : -th; }
      else { var fz = box(hyp, 0.14, 0.9, M.slab, 0, y, f[1], g); fz.rotation.z = f[3] > 0 ? th : -th; box(hyp, 0.04, 0.04, M.green, 0, y + 0.95, f[1] - f[2] * 0.42, g).rotation.z = f[3] > 0 ? th : -th; }
      var end = [[c, -c], [-c, -c], [-c, c], [c, c], [c, -c], [-c, -c]][k];
      box(0.9, 0.14, 0.9, M.slab, end[0], rise * (k + 1) - 0.07, end[1], g);
    });
    // two warm lamps inside, one in the hall, one on the landing
    [1.4, TOP + 1.9].forEach(function (ly) { box(0.3, 0.06, 0.3, M.lamp, 0, ly + 1.0, IN - 0.4, g); });
    // the lift: a call at the street and on the landing; E takes you up or down (pkSkyLiftGo)
    hitBox(1.5, 2.0, 0.5, 0, 1.1, SH + 0.3, { prompt: function () { return PK_SKY_LIFT || PK.playerRide ? '' : 'Take the lift up to the platform'; }, use: function () { pkSkyLiftGo(st, true); } }, g);
    hitBox(1.5, 2.0, 0.5, 0, TOP + 1.1, SH + 0.3, { prompt: function () { return PK_SKY_LIFT || PK.playerRide ? '' : 'Take the lift down to the street'; }, use: function () { pkSkyLiftGo(st, false); } }, g);
    return g;
  }
  // the lift ride: the player stands in the cage, which climbs 16 m in seven seconds and lets him out on the gate side
  function pkSkyLiftGo(st, up) {
    if (PK_SKY_LIFT || PK.playerRide) return false;
    PK_SKY_LIFT = { st: st, y0: up ? 0 : PK_SKY_TOP, y1: up ? PK_SKY_TOP : 0, t: 0, dur: 7 };
    if (st.cage) st.cage.position.y = PK_SKY_LIFT.y0;
    sfx('click'); toast(up ? 'Up to the platform' : 'Down to the street', '');
    return true;
  }
  var _pkSkyPrevOverride = GAME.playerOverride;
  GAME.playerOverride = function (dt) {
    var L = PK_SKY_LIFT;
    if (!L) return _pkSkyPrevOverride ? _pkSkyPrevOverride(dt) : false;
    L.t += dt;
    var f = clamp(L.t / L.dur, 0, 1), e = f * f * (3 - 2 * f), y = L.y0 + (L.y1 - L.y0) * e, c = pkSkyTW(L.st, 0, 0);
    if (L.st.cage) L.st.cage.position.y = y;
    player.x = c.x; player.z = c.z; player.y = y + 0.08; player.vy = 0;
    camera.position.set(player.x, player.y + 1.62, player.z);
    camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');
    if (f >= 1) {
      var o = pkSkyTW(L.st, 0, 1.45);
      player.x = o.x; player.z = o.z; player.y = L.y1; player.grounded = true;
      PK_SKY_LIFT = null; sfx('chime');
    }
    return true;
  };

  // ── A platform: raised to the car floor beside the deck, screen doors along the edge, a glazed canopy ──
  function pkSkyPlatform(st) {
    var M = pkSkyM(), L = st.z1 - st.z0, zc = (st.z0 + st.z1) / 2, w = st.px1 - st.px0, xc = (st.px0 + st.px1) / 2, TOP = PK_SKY_TOP;
    var g = new THREE.Group(); scene.add(g);
    var base = PK_SKY_DECK - 0.6;
    // the body: a cream concrete platform standing up from the deck's edge, paved on top, a stone coping on the outer face
    box(w, TOP - base - 0.1, L, M.slab, xc, (TOP - 0.1 + base) / 2, zc, g);
    box(w - 0.1, 0.1, L - 0.1, M.pavers, xc, TOP - 0.05, zc, g);
    box(0.3, 0.3, L + 0.1, M.stone, st.px1 + 0.05, TOP - 0.15, zc, g);
    box(0.26, 0.012, L - 0.4, M.yellow, st.px0 + 0.35, TOP + 0.006, zc, g);
    // it overhangs the deck on steel brackets
    for (var b = st.z0 + 1.6; b < st.z1; b += 4.0) { var br = box(2.6, 0.24, 0.24, M.green, xc + 0.3, base - 0.7, b, g); br.rotation.z = -0.42; }
    // platform screen doors along the track edge: clear glass in green frames, an opening wherever one of the train's doors
    // stops (her stopping mark is the same every time), two leaves in each that slide apart with hers (pkSkyTick)
    var ex = st.px0 + 0.06, ops = [], offs = pkSkyOffsets();
    PK_SKY_DOORS.forEach(function (ds, ci) { ds.forEach(function (dx) { ops.push(pkSkyAt(st.stop + offs[ci] - dx).z); }); });
    ops.sort(function (p, q) { return p - q; });
    var fixed = [], zc0 = st.z0 + 0.1;
    ops.forEach(function (oz) { fixed.push([zc0, oz - 0.78]); zc0 = oz + 0.78; });
    fixed.push([zc0, st.z1 - 0.1]);
    fixed.forEach(function (r) {
      for (var a0 = r[0]; a0 < r[1] - 0.05; a0 += 2.0) {
        var a1 = Math.min(r[1], a0 + 2.0);
        box(0.07, 1.6, 0.07, M.green, ex, TOP + 0.8, a0, g);
        box(0.025, 1.45, a1 - a0 - 0.08, M.psd, ex, TOP + 0.78, (a0 + a1) / 2, g);
      }
      box(0.07, 1.6, 0.07, M.green, ex, TOP + 0.8, r[1], g);
    });
    st.gates = [];
    ops.forEach(function (oz) {
      [-1, 1].forEach(function (dir) {
        var lg = new THREE.Group(); lg.userData.dynamic = true; lg.position.set(ex, 0, oz + dir * 0.38); scene.add(lg);
        [-0.35, 0.35].forEach(function (e) { box(0.06, 1.5, 0.05, M.green, 0, TOP + 0.75, e, lg); });
        box(0.06, 0.06, 0.74, M.green, 0, TOP + 1.47, 0, lg); box(0.06, 0.1, 0.74, M.green, 0, TOP + 0.05, 0, lg);
        box(0.025, 1.36, 0.66, M.psd, 0, TOP + 0.78, 0, lg);
        st.gates.push({ g: lg, z0: oz + dir * 0.38, dir: dir });
      });
    });
    box(0.12, 0.2, L - 0.4, M.green, st.px0 + 0.06, TOP + 1.8, zc, g);
    pkSkyDeckSolid(st.px0 - 0.05, st.px0 + 0.15, st.z0, st.z1);
    // the outer rail, broken where the link from the tower comes in
    var gaps = st.link ? [[st.link[2], st.link[3]]] : [];
    var runs = [[st.z0, st.z1]];
    gaps.forEach(function (gp) { runs = [[st.z0, gp[0]], [gp[1], st.z1]]; });
    runs.forEach(function (r) {
      var l = r[1] - r[0], m = (r[0] + r[1]) / 2; if (l < 0.2) return;
      box(0.07, 0.07, l, M.green, st.px1 - 0.1, TOP + 1.1, m, g); box(0.05, 0.05, l, M.green, st.px1 - 0.1, TOP + 0.6, m, g);
      for (var p = r[0] + 0.3; p < r[1]; p += 1.6) box(0.06, 1.1, 0.06, M.green, st.px1 - 0.1, TOP + 0.55, p, g);
      pkSkyDeckSolid(st.px1 - 0.2, st.px1 + 0.1, r[0], r[1]);
    });
    // the ends: a rail across, open at Woods Halt where the gallery comes on at the north end
    [st.z0, st.z1].forEach(function (ze, k) {
      if (st.id === 'woods' && k === 0) return;
      box(w, 0.07, 0.07, M.green, xc, TOP + 1.1, ze + (k ? -0.05 : 0.05), g);
      pkSkyDeckSolid(st.px0, st.px1, ze + (k ? -0.15 : 0), ze + (k ? 0 : 0.15));
    });
    // the canopy: green columns on the outer edge, cantilevers over the platform, a glazed roof between green ribs
    for (var cz = st.z0 + 2.0; cz <= st.z1 - 1.5; cz += 6.0) {
      box(0.16, 3.4, 0.16, M.green, st.px1 - 0.35, TOP + 1.7, cz, g);
      var ca = box(w + 0.3, 0.14, 0.14, M.green, xc - 0.1, TOP + 3.45, cz, g); ca.rotation.z = 0.06;
      pkSkyDeckSolid(st.px1 - 0.45, st.px1 - 0.25, cz - 0.1, cz + 0.1);
    }
    var rf = box(w + 0.2, 0.04, L - 2.6, M.roofGlass, xc - 0.1, TOP + 3.56, zc, g); rf.rotation.z = 0.06;
    for (var rb = st.z0 + 1.3; rb <= st.z1 - 1.3; rb += 1.5) { var rr = box(w + 0.3, 0.05, 0.06, M.green, xc - 0.1, TOP + 3.6, rb, g); rr.rotation.z = 0.06; }
    box(0.08, 0.3, L - 2.6, M.green, st.px0 - 0.05, TOP + 3.5, zc, g);
    box(0.1, 0.22, L - 2.6, M.cream, st.px0 - 0.05, TOP + 3.28, zc, g);
    // two benches, a lamp every 8 m, the name boards, a departure board
    [zc - 7, zc + 7].forEach(function (bz) {
      var bg = new THREE.Group(); bg.position.set(st.px1 - 0.9, TOP, bz); bg.rotation.y = -Math.PI / 2; g.add(bg);
      // slatted, the seat and the back, on two cast green ends with arms
      [-0.17, -0.06, 0.05, 0.16].forEach(function (sz) { pkBevelBox(1.7, 0.045, 0.095, M.wood, 0, 0.46, sz, bg, 0.012); });
      [0.6, 0.73, 0.86].forEach(function (sy) { var sl = pkBevelBox(1.7, 0.095, 0.035, M.wood, 0, sy, -0.24 - (sy - 0.6) * 0.12, bg, 0.012); sl.rotation.x = -0.12; });
      [-0.75, 0.75].forEach(function (pp) {
        box(0.07, 0.44, 0.07, M.green, pp, 0.22, 0.17, bg); box(0.07, 0.95, 0.07, M.green, pp, 0.47, -0.21, bg).rotation.x = -0.1;
        box(0.07, 0.06, 0.44, M.green, pp, 0.42, -0.02, bg); box(0.06, 0.05, 0.42, M.green, pp, 0.66, 0.0, bg); box(0.05, 0.22, 0.05, M.green, pp, 0.55, 0.18, bg);
      });
    });
    for (var lz = st.z0 + 5; lz < st.z1 - 2; lz += 8) box(0.24, 0.06, 0.6, M.lamp, xc, TOP + 3.3, lz, g);
    // at Woods Halt the gallery comes on at the north end: close the sliver of edge it does not cover
    if (st.id === 'woods' && PK_SKY_ST[1].gal) pkSkyDeckSolid(st.px0 - 0.05, PK_SKY_ST[1].gal[0], st.z0 - 0.15, st.z0 + 0.05);
    [st.z0 + 6, st.z1 - 6].forEach(function (bz) {
      box(0.08, 0.6, 3.3, M.green, xc - 0.2, TOP + 2.7, bz, g);
      sign([st.name], 3.1, 0.5, xc - 0.15, TOP + 2.7, bz, -Math.PI / 2, { w: 512, h: 72, bg: '#1d5b3b', fg: '#f2e6b8' }, g);
      sign([st.name], 3.1, 0.5, xc - 0.25, TOP + 2.7, bz, Math.PI / 2, { w: 512, h: 72, bg: '#1d5b3b', fg: '#f2e6b8' }, g);
      [-1.2, 1.2].forEach(function (o) { box(0.03, 0.4, 0.03, M.iron, xc - 0.2, TOP + 3.2, bz + o, g); });
    });
    sign(['SKYLINE', 'NEXT TRAIN  ' + (st.id === 'woods' ? 'NORTH / SOUTH' : 'WOODS HALT')], 1.6, 0.5, xc + 0.1, TOP + 2.2, zc, -Math.PI / 2, { w: 384, h: 120, bg: '#0b1014', fg: '#ffb84a' }, g);
    return g;
  }
  // the covered gallery from the Woods Halt tower over the Dark Woods street to the platform
  function pkSkyGallery(r) {
    var M = pkSkyM(), w = r[1] - r[0], d = r[3] - r[2], xc = (r[0] + r[1]) / 2, zc = (r[2] + r[3]) / 2, TOP = PK_SKY_TOP;
    var g = new THREE.Group(); scene.add(g);
    box(w, 0.3, d, M.slab, xc, TOP - 0.15, zc, g);
    box(w - 0.1, 0.04, d - 0.1, M.pavers, xc, TOP + 0.02, zc, g);
    box(w + 0.2, 0.32, d, M.stone, xc, TOP - 0.42, zc, g);
    [-1, 1].forEach(function (s) {
      var x = xc + s * (w / 2 - 0.06);
      box(0.07, 0.07, d, M.green, x, TOP + 1.1, zc, g);
      box(0.03, 1.0, d, M.glass, x, TOP + 0.55, zc, g);
      for (var z = r[2] + 0.4; z < r[3]; z += 2.0) box(0.08, 2.9, 0.08, M.green, x, TOP + 1.45, z, g);
      pkSkyDeckSolid(x - 0.1, x + 0.1, r[2], r[3]);
    });
    // its tower end: where the gallery runs past the tower's corner there is no wall, so close that bit of the end
    var tw = PK_SKY_ST[1];
    if (r[0] < tw.tx0) pkSkyDeckSolid(r[0], tw.tx0, r[2], r[2] + 0.15);
    box(w + 0.4, 0.04, d, M.roofGlass, xc, TOP + 2.95, zc, g);
    for (var z2 = r[2] + 0.4; z2 < r[3]; z2 += 2.0) box(w + 0.4, 0.08, 0.08, M.green, xc, TOP + 2.95, z2, g);
    // it hangs off the viaduct's deck on brackets, so nothing stands in the Dark Woods street it crosses
    for (var z3 = r[2] + 0.6; z3 < r[3]; z3 += 2.2) { var br = box(2.4, 0.2, 0.22, M.green, r[0] + 0.9, TOP - 0.8, z3, g); br.rotation.z = 0.26; }
    return g;
  }
  // the short link from a tower's landing door onto the platform (north and south)
  function pkSkyLink(st) {
    var M = pkSkyM(), r = st.link, w = r[1] - r[0], d = r[3] - r[2], xc = (r[0] + r[1]) / 2, zc = (r[2] + r[3]) / 2, TOP = PK_SKY_TOP;
    box(w, 0.3, d, M.slab, xc, TOP - 0.15, zc, null);
    box(w, 0.04, d - 0.1, M.pavers, xc, TOP + 0.02, zc, null);
    [r[2], r[3]].forEach(function (zz, k) {
      box(w, 0.07, 0.07, M.green, xc, TOP + 1.1, zz + (k ? -0.06 : 0.06), null);
      pkSkyDeckSolid(r[0], r[1], zz + (k ? -0.15 : 0), zz + (k ? 0 : 0.15));
    });
  }
  // the precincts at North and South: their own paved ground round the tower, the cabin and the platform's foot, inside a
  // low green railing, a lamp at each corner; part 46 keeps the site and the forest off it
  function pkSkyPrecinct(r) {
    var M = pkSkyM(), x0 = r[0] + 1, x1 = r[1] - 1, z0 = r[2] + 1, z1 = r[3] - 1, g = new THREE.Group(); scene.add(g);
    pkPaved(x1 - x0, z1 - z0, M.pavers, (x0 + x1) / 2, 0.02, (z0 + z1) / 2, 2.4);
    [[x0, z0, x1, z0], [x1, z0, x1, z1], [x1, z1, x0, z1], [x0, z1, x0, z0]].forEach(function (e) {
      var l = Math.hypot(e[2] - e[0], e[3] - e[1]), mx = (e[0] + e[2]) / 2, mz = (e[1] + e[3]) / 2, along = Math.abs(e[3] - e[1]) < 0.01;
      if (along) { box(l, 0.06, 0.06, M.green, mx, 1.0, mz, g); box(l, 0.05, 0.05, M.green, mx, 0.5, mz, g); for (var p = Math.min(e[0], e[2]); p <= Math.max(e[0], e[2]); p += 2) box(0.06, 1.0, 0.06, M.green, p, 0.5, mz, g); solid(Math.min(e[0], e[2]), Math.max(e[0], e[2]), mz - 0.08, mz + 0.08, 0, 1.0); }
      else { box(0.06, 0.06, l, M.green, mx, 1.0, mz, g); box(0.05, 0.05, l, M.green, mx, 0.5, mz, g); for (var q = Math.min(e[1], e[3]); q <= Math.max(e[1], e[3]); q += 2) box(0.06, 1.0, 0.06, M.green, mx, 0.5, q, g); solid(mx - 0.08, mx + 0.08, Math.min(e[1], e[3]), Math.max(e[1], e[3]), 0, 1.0); }
    });
    [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(function (c) { box(0.14, 3.6, 0.14, M.green, c[0], 1.8, c[1], g); box(0.4, 0.3, 0.4, M.black, c[0], 3.7, c[1], g); box(0.32, 0.2, 0.32, M.lamp, c[0], 3.55, c[1], g); });
    return g;
  }

  // ── The Skyline Shuttle: a three-car modern metro unit ───────────
  // A cab at each end (she runs both ways), passengers in all three cars, closed gangways between them. Each car's origin is
  // the rail top and its floor is PK_SKY_FLOOR above it, level with the platforms. The body is a pearl shell on a rounded
  // underbody, a deep Park Co green window band of tinted glass from the seat backs to the roof, a gold pinstripe, gold
  // double plug doors, a rounded roof with its equipment pods, bogies under a skirt.
  var PK_SKY_LOCO = { len: 8.4 }, PK_SKY_COACH = { len: 7.4 }, PK_SKY_GAP = 0.7;
  var PK_SKY_W = 2.7, PK_SKY_SILL = 0.72, PK_SKY_CANT = 1.95, PK_SKY_CROWN = 2.38;   // body width; sill, cant rail and roof crown above the floor
  function pkSkyOffsets() {
    var c = PK_SKY_COACH.len, l = PK_SKY_LOCO.len;
    return [0, l / 2 + PK_SKY_GAP + c / 2, l / 2 + PK_SKY_GAP + c + PK_SKY_GAP + c / 2];
  }
  var PK_SKY_CM = null;
  function pkSkyCarM() {
    if (PK_SKY_CM) return PK_SKY_CM;
    return (PK_SKY_CM = {
      pearl: std({ color: 0xf2eee4, roughness: 0.32, metalness: 0.25 }),
      green: std({ color: PK_SKY_GREEN, roughness: 0.3, metalness: 0.35 }),
      gold: std({ color: 0xd4a23a, roughness: 0.3, metalness: 0.55 }),
      tint: std({ color: 0x24363e, roughness: 0.04, metalness: 0.6, transparent: true, opacity: 0.36, depthWrite: false, side: THREE.DoubleSide }),
      black: std({ color: 0x15171a, roughness: 0.55 }), skirt: std({ color: 0x3a4045, roughness: 0.6, metalness: 0.3 }),
      bogie: std({ color: 0x2a2e33, roughness: 0.6, metalness: 0.4 }), wheel: std({ color: 0x8c9196, roughness: 0.35, metalness: 0.8 }),
      floor: std({ color: 0x4a4e52, roughness: 0.9 }), lining: std({ color: 0xe4e2dc, roughness: 0.7 }), ceiling: std({ color: 0xf4f3ef, roughness: 0.6 }),
      fabric: std({ color: 0x1f5f4a, roughness: 0.95 }), shell: std({ color: 0xc9ccd0, roughness: 0.5, metalness: 0.2 }),
      steel: std({ color: 0xc8ccd0, roughness: 0.25, metalness: 0.9 }), bellows: std({ color: 0x202226, roughness: 0.85 }),
      dark: std({ color: 0x0d171c, roughness: 0.05, metalness: 0.85 }), led: glowMat(0xf2f8ff, 1.6), tail: glowMat(0xff3a2e, 1.2), strip: glowMat(0xfff6e6, 0.9)
    });
  }
  // an extruded section along the car (x0..x1): the shape is drawn across the car (u = across, v = up), extruded along x
  function pkSkyAlong(shape, x0, x1, mat, g) {
    var geo = new THREE.ExtrudeGeometry(shape, { depth: x1 - x0, bevelEnabled: false, curveSegments: 10 });
    geo.rotateY(Math.PI / 2); geo.translate(x0, 0, 0);
    var m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
  }
  // the underbody under the floor, its lower corners rounded; the roof over the cant rail, a low arch
  function pkSkyUnderShape() {
    var HW = PK_SKY_W / 2, FL = PK_SKY_FLOOR, b = 0.62, s = new THREE.Shape();
    s.moveTo(-HW, FL); s.lineTo(HW, FL); s.lineTo(HW, b + 0.24); s.quadraticCurveTo(HW, b, HW - 0.26, b); s.lineTo(-HW + 0.26, b); s.quadraticCurveTo(-HW, b, -HW, b + 0.24); s.closePath();
    return s;
  }
  function pkSkyRoofShape() {
    var HW = PK_SKY_W / 2 - 0.06, c = PK_SKY_FLOOR + PK_SKY_CANT, t = PK_SKY_FLOOR + PK_SKY_CROWN, s = new THREE.Shape();
    s.moveTo(-HW, c); s.bezierCurveTo(-HW, c + 0.3, -HW + 0.42, t, -HW + 0.95, t); s.lineTo(HW - 0.95, t); s.bezierCurveTo(HW - 0.42, t, HW, c + 0.3, HW, c); s.closePath();
    return s;
  }
  // the cab nose, drawn in side view (forward is +x from the body's end) in three pieces so it is hollow: the low front
  // under the windscreen (the driver's desk stands on it inside), the cap over the windscreen, the glass between them.
  // Each is extruded across the car with rounded edges; bs is how far the rounding pushes a surface out past its outline.
  function pkSkyNoseLow() {
    var FL = PK_SKY_FLOOR, s = new THREE.Shape();
    s.moveTo(0, 0.62); s.lineTo(0.72, 0.62); s.quadraticCurveTo(1.02, 0.64, 1.04, 0.92); s.lineTo(1.0, FL + 0.62); s.lineTo(0, FL + 0.62); s.closePath();
    return s;
  }
  function pkSkyNoseCap() {
    var FL = PK_SKY_FLOOR, c = FL + PK_SKY_CANT, t = FL + PK_SKY_CROWN, s = new THREE.Shape();
    s.moveTo(0.47, c + 0.03); s.quadraticCurveTo(0.24, t, 0, t); s.lineTo(0, c - 0.08); s.lineTo(0.53, c - 0.08); s.closePath();
    return s;
  }
  function pkSkyCab(g, x, dir) {
    var C = pkSkyCarM(), FL = PK_SKY_FLOOR, W = PK_SKY_W, c = FL + PK_SKY_CANT, n = new THREE.Group();
    n.position.set(x, 0, 0); n.rotation.y = dir > 0 ? 0 : Math.PI; g.add(n);
    var bt = 0.12, bs = 0.03;
    [pkSkyNoseLow(), pkSkyNoseCap()].forEach(function (sh) {
      var geo = new THREE.ExtrudeGeometry(sh, { depth: W - 2 * bt, bevelEnabled: true, bevelThickness: bt, bevelSize: bs, bevelSegments: 4, curveSegments: 12 });
      geo.translate(0, 0, -(W - 2 * bt) / 2);
      var m = new THREE.Mesh(geo, C.green); m.castShadow = true; n.add(m);
    });
    // the raked windscreen, real glass the driver looks out through, between green pillars, in a black surround
    var ax = 0.985, ay = FL + 0.66, bx = 0.5, by = c - 0.05, len = Math.hypot(ax - bx, by - ay), nx = (by - ay) / len, ny = (ax - bx) / len, ang = Math.atan2(ax - bx, by - ay);
    var mx = (ax + bx) / 2, my = (ay + by) / 2;
    var ws = box(0.02, len, W - 0.44, C.tint, mx + nx * 0.02, my + ny * 0.02, 0, n); ws.rotation.z = ang;
    [-1, 1].forEach(function (s) {
      var pl = box(0.07, len + 0.08, 0.22, C.green, mx + nx * 0.02, my + ny * 0.02, s * (W / 2 - 0.11), n); pl.rotation.z = ang;
      var fr = box(0.03, len + 0.04, 0.03, C.black, mx + nx * 0.05, my + ny * 0.05, s * (W / 2 - 0.23), n); fr.rotation.z = ang;
    });
    [[ax, ay], [bx, by]].forEach(function (e) { box(0.05, 0.05, W - 0.4, C.black, e[0] + nx * 0.03, e[1] + ny * 0.03, 0, n); });
    // the cab's side windows, from the low front up to the cap, either side
    var sw = new THREE.Shape(); sw.moveTo(0.02, FL + 0.62); sw.lineTo(0.99, FL + 0.62); sw.lineTo(0.51, c - 0.08); sw.lineTo(0.02, c - 0.08); sw.closePath();
    [-1, 1].forEach(function (s) { var sg = new THREE.ExtrudeGeometry(sw, { depth: 0.02, bevelEnabled: false }); sg.translate(0, 0, s > 0 ? W / 2 - 0.05 : -W / 2 + 0.03); n.add(new THREE.Mesh(sg, C.tint)); });
    // the destination display across the top of the windscreen
    var dg = new THREE.Group(), tx = bx + (ax - bx) * 0.1, ty = by + (ay - by) * 0.1; dg.position.set(tx + nx * 0.05, ty + ny * 0.05, 0); dg.rotation.z = Math.atan2(ny, nx); n.add(dg);
    box(0.02, 0.24, 1.5, C.black, -0.01, 0, 0, dg);
    sign(['SKYLINE'], 1.3, 0.19, 0.002, 0, 0, Math.PI / 2, { w: 384, h: 60, bg: '#0b0d10', fg: '#ffb84a' }, dg);
    // the front: LED headlight strips, tail lights, a gold line, the coupler
    var fx = 1.04 + bs + 0.02;
    [-1, 1].forEach(function (s) {
      box(0.03, 0.08, 0.62, C.black, fx - 0.01, FL + 0.3, s * 0.78, n); box(0.03, 0.05, 0.56, C.led, fx, FL + 0.3, s * 0.78, n);
      box(0.03, 0.06, 0.24, C.tail, fx, FL + 0.17, s * 0.98, n);
    });
    box(0.03, 0.045, W - 0.8, C.gold, fx, FL + 0.46, 0, n);
    box(0.32, 0.28, 0.9, C.black, fx + 0.08, 0.78, 0, n);
    // inside: the cab floor, the cab's back partition with its door, a light over the desk
    [-1, 1].forEach(function (s) { box(0.05, c - FL, 0.75, C.lining, -1.3, (FL + c) / 2, s * (W / 2 - 0.45), n); });
    box(0.05, c - FL - 1.95, 0.9, C.lining, -1.3, FL + 1.95 + (c - FL - 1.95) / 2, 0, n);
    box(0.04, 1.9, 0.86, C.tint, -1.3, FL + 0.97, 0, n); box(0.05, 1.95, 0.05, C.black, -1.3, FL + 0.97, 0.45, n); box(0.05, 1.95, 0.05, C.black, -1.3, FL + 0.97, -0.45, n);
    box(0.4, 0.03, 0.3, C.strip, -0.4, c - 0.1, 0, n);
    return n;
  }
  // the gangway at an inner end: a black bellows half that meets the next car's in the gap
  function pkSkyGangway(g, x, dir) {
    var C = pkSkyCarM(), FL = PK_SKY_FLOOR, h = PK_SKY_CANT + 0.1, w = 1.6, d = PK_SKY_GAP / 2 + 0.02, xm = x + dir * d / 2;
    box(d, 0.08, w, C.bellows, xm, FL + h, 0, g); box(d, 0.08, w, C.bellows, xm, FL - 0.02, 0, g);
    box(d, h, 0.08, C.bellows, xm, FL + h / 2, w / 2, g); box(d, h, 0.08, C.bellows, xm, FL + h / 2, -w / 2, g);
    for (var r = 0; r < 4; r++) { var rx = x + dir * (r + 0.5) * d / 4; box(0.03, h + 0.06, 0.1, C.black, rx, FL + h / 2, w / 2 + 0.02, g); box(0.03, h + 0.06, 0.1, C.black, rx, FL + h / 2, -w / 2 - 0.02, g); box(0.03, 0.1, w + 0.04, C.black, rx, FL + h + 0.02, 0, g); }
  }
  // a car: x0..x1 is its body; cab says which end carries a cab (+1 front, -1 back, 0 none); doors are door centres;
  // n is its share of the 32 seats
  function pkSkyCar(x0, x1, cab, doors, n, num) {
    var C = pkSkyCarM(), g = new THREE.Group(); g.userData.dynamic = true; scene.add(g);
    var FL = PK_SKY_FLOOR, W = PK_SKY_W, HW = W / 2, SILL = FL + PK_SKY_SILL, CANT = FL + PK_SKY_CANT, L = x1 - x0, xm = (x0 + x1) / 2, leaves = [], cabG = null;
    // the shell
    pkSkyAlong(pkSkyUnderShape(), x0, x1, C.pearl, g);
    pkSkyAlong(pkSkyRoofShape(), x0, x1, C.pearl, g);
    box(L - 0.3, 0.02, W - 0.3, C.ceiling, xm, CANT - 0.09, 0, g);   // the ceiling hangs clear of the roof's underside, so the two never flicker through each other
    [-1, 1].forEach(function (s) {
      var z = s * (HW - 0.035);
      box(L, SILL - FL, 0.07, C.pearl, xm, (FL + SILL) / 2, z, g);
      box(L, 0.05, 0.08, C.gold, xm, SILL - 0.1, s * (HW - 0.03), g);
      box(L, 0.08, 0.09, C.green, xm, SILL + 0.04, s * (HW - 0.03), g);
      box(L, CANT - SILL - 0.08, 0.03, C.tint, xm, (SILL + CANT) / 2 + 0.04, s * (HW - 0.05), g);
      box(L, 0.1, 0.09, C.green, xm, CANT - 0.05, s * (HW - 0.03), g);
      for (var px = x0 + 0.9; px < x1 - 0.5; px += 1.85) box(0.06, CANT - SILL - 0.1, 0.06, C.black, px, (SILL + CANT) / 2, s * (HW - 0.04), g);
      // the doors: a black frame, two gold leaves each with its own tall window, the black seal between them
      doors.forEach(function (dx) {
        // the frame round the doorway: two jambs and a header, so a shut door shows as a shut door from either side
        [-1, 1].forEach(function (j) { box(0.07, CANT - FL + 0.04, 0.09, C.black, dx + j * 0.68, (FL + CANT) / 2, s * HW, g); });
        box(1.42, 0.07, 0.09, C.black, dx, CANT + 0.0, s * HW, g);
        [-1, 1].forEach(function (lf) {
          // on the platform side each leaf is its own group, kept out of the fuse, so it slides open at a station
          var lg = new THREE.Group(); lg.position.set(dx + lf * 0.34, 0, s * HW); g.add(lg);
          if (s > 0) { lg.userData.keep = true; leaves.push({ g: lg, x0: dx + lf * 0.34, dir: lf }); }
          box(0.64, CANT - FL - 0.08, 0.07, C.gold, 0, (FL + CANT) / 2 - 0.02, 0, lg);
          box(0.4, 0.95, 0.072, C.tint, 0, SILL + 0.45, 0, lg);
          box(0.015, CANT - FL - 0.08, 0.075, C.black, -lf * 0.31, (FL + CANT) / 2 - 0.02, 0, lg);
        });
      });
      // inside: the lining below the windows and a handrail along the side
      box(L - 0.4, SILL - FL - 0.1, 0.03, C.lining, xm, (FL + SILL) / 2, s * (HW - 0.09), g);
      box(L - 1.2, 0.035, 0.035, C.steel, xm, CANT - 0.22, s * (HW - 0.45), g);
      // the skirt along the side, between the bogies
      box(L - 4.2, 0.3, 0.06, C.skirt, xm, 0.5, s * (HW - 0.12), g);
    });
    // the floor, the lights along the ceiling, the poles at the doors
    box(L - 0.2, 0.03, W - 0.2, C.floor, xm, FL + 0.015, 0, g);
    [-0.5, 0.5].forEach(function (lz) { box(L - 1.0, 0.03, 0.12, C.strip, xm, CANT - 0.115, lz, g); });
    doors.forEach(function (dx) { [-0.62, 0.62].forEach(function (pz) { pkRoundCyl(0.022, CANT - FL, C.steel, dx, (FL + CANT) / 2, pz, g, 8); }); });
    // the roof's own kit: two equipment pods, a shallow fairing between them
    [x0 + L * 0.25, x0 + L * 0.75].forEach(function (rx) { pkBevelBox(1.6, 0.22, 1.5, C.shell, rx, FL + PK_SKY_CROWN + 0.1, 0, g, 0.08); });
    // the bogies: a frame, four wheels, the air springs
    [x0 + 1.7, x1 - 1.7].forEach(function (bx) {
      box(2.5, 0.26, 1.9, C.bogie, bx, 0.42, 0, g);
      [-0.95, 0.95].forEach(function (wx) { [-1, 1].forEach(function (s) { var w = pkRoundCyl(0.38, 0.12, C.wheel, bx + wx, 0.38, s * 0.62, g, 16); w.rotation.x = Math.PI / 2; }); });
      [-1, 1].forEach(function (s) { pkRoundCyl(0.2, 0.18, C.black, bx, 0.62, s * 0.7, g, 10); });
    });
    // the ends: a cab, or a gangway with an end wall round its opening
    [[x1, 1], [x0, -1]].forEach(function (e) {
      if (cab === e[1]) { cabG = pkSkyCab(g, e[0], e[1]); return; }
      [-1, 1].forEach(function (s) { box(0.06, CANT - FL, (W - 1.5) / 2, C.pearl, e[0], (FL + CANT) / 2, s * (0.75 + (W - 1.5) / 4), g); });
      box(0.06, CANT - FL - 2.05, 1.5, C.pearl, e[0], FL + 2.05 + (CANT - FL - 2.05) / 2, 0, g);
      pkSkyGangway(g, e[0], e[1]);
    });
    // the name on the pearl below the windows, and the car's number
    sign(['SKYLINE'], 1.5, 0.26, xm, FL + 0.38, HW + 0.012, 0, { w: 420, h: 72, bg: '#f2eee4', fg: '#1d5b3b' }, g);
    sign(['SKYLINE'], 1.5, 0.26, xm, FL + 0.38, -(HW + 0.012), Math.PI, { w: 420, h: 72, bg: '#f2eee4', fg: '#1d5b3b' }, g);
    sign([String(num)], 0.28, 0.28, x0 + 0.45, FL + 0.38, HW + 0.012, 0, { w: 96, h: 96, bg: '#1d5b3b', fg: '#f2e6b8' }, g);
    // the seats: bays of four (two either side of the aisle), clear of the doors and the cab, spread down the car
    var seats = [], CUSH = FL + 0.45, lo = x0 + 0.5 + (cab < 0 ? 1.3 : 0), hi = x1 - 0.5 - (cab > 0 ? 1.3 : 0), cands = [], rows = [], k = n / 4;
    for (var rx = lo; rx <= hi; rx += 0.66) if (doors.every(function (dx) { return Math.abs(rx - dx) > 0.98; })) cands.push(rx);
    for (var ri0 = 0; ri0 < k && cands.length; ri0++) rows.push(cands[k > 1 ? Math.round(ri0 * (cands.length - 1) / (k - 1)) : Math.floor(cands.length / 2)]);
    rows.forEach(function (x, ri) {
      var face = ri % 2 ? -1 : 1;   // the rows face each other in bays
      [-1.0, -0.5, 0.5, 1.0].forEach(function (z) {
        pkBevelBox(0.46, 0.1, 0.46, C.fabric, x, CUSH - 0.05, z, g, 0.03);
        pkBevelBox(0.08, 0.55, 0.46, C.fabric, x - face * 0.24, CUSH + 0.27, z, g, 0.03);
        seats.push({ par: g, x: x, y: CUSH - 0.76, z: z, ry: face > 0 ? Math.PI / 2 : -Math.PI / 2, guest: null });
      });
      [-0.75, 0.75].forEach(function (z) { box(0.36, CUSH - FL - 0.1, 0.9, C.steel, x, (FL + CUSH - 0.1) / 2, z, g); });
    });
    pkFuse(g);
    return { g: g, seats: seats, leaves: leaves, cab: cabG };
  }
  var PK_SKY_DOORS = [[-2.45, 0.95], [-1.85, 1.85], [-0.95, 2.1]];   // door centres along each car, cab car, middle car, cab car
  function pkSkyLoco() { var L = PK_SKY_LOCO.len; return pkSkyCar(-L / 2, L / 2, 1, PK_SKY_DOORS[0], 12, 1); }
  function pkSkyCoach(k) { var L = PK_SKY_COACH.len; return k === 1 ? pkSkyCar(-L / 2, L / 2, -1, PK_SKY_DOORS[2], 12, 3) : pkSkyCar(-L / 2, L / 2, 0, PK_SKY_DOORS[1], 8, 2); }

  // ── Building the stage ───────────────────────────────────────────
  function pkSkyBuild() {
    if (PK_SKY.built) return;
    PK_SKY_ST.forEach(function (st) { pkSkyPlatform(st); pkSkyTower(st); if (st.link) pkSkyLink(st); });
    pkSkyGallery(PK_SKY_ST[1].gal);
    if (typeof PK_XP_PRECINCTS !== 'undefined') PK_XP_PRECINCTS.forEach(pkSkyPrecinct);
    pkSkyForecourt();
    var c0 = pkSkyLoco(), c1 = pkSkyCoach(0), c2 = pkSkyCoach(1);
    PK_SKY.veh = [{ g: c0.g, off: 0, kind: 'cab' }, { g: c1.g, off: pkSkyOffsets()[1], kind: 'car' }, { g: c2.g, off: pkSkyOffsets()[2], kind: 'cab' }];
    PK_SKY.seats = c0.seats.concat(c1.seats, c2.seats);
    // boarding from the platform: aim at a door on the platform side while she stands at a station with her doors to be
    // opened, press E, and take a free seat in that car. The doors are the cars' own, so they ride along with the train.
    PK_SKY.leaves = c0.leaves.concat(c1.leaves, c2.leaves);
    PK_SKY.cabs = [{ car: c0, g: c0.cab, face: -1, sideX: PK_SKY_LOCO.len / 2 - 0.65 }, { car: c2, g: c2.cab, face: 1, sideX: -(PK_SKY_COACH.len / 2 - 0.65) }];
    PK_SKY.cabs.forEach(function (cab, i) { if (cab.g) pkSkyDesk(cab, i); });
    [[c0, PK_SKY_DOORS[0]], [c1, PK_SKY_DOORS[1]], [c2, PK_SKY_DOORS[2]]].forEach(function (cd) {
      cd[1].forEach(function (dx) {
        hitBox(1.3, 1.9, 0.5, dx, PK_SKY_FLOOR + 0.95, PK_SKY_W / 2 + 0.15, {
          prompt: function () { return pkSkyDoorOpen() ? 'Board The Skyline' : ''; },
          use: function () { pkSkyBoardAt(cd[0]); }
        }, cd[0].g);
      });
    });
    pkSkyClearPlatforms();
    PK_SKY.built = true;
    PK_SKY.s = PK_SKY_ST[0].stop; PK_SKY.at = 0; PK_SKY.mode = 'dwell'; PK_SKY.dwell = 0;
    pkSkyPlace(PK_SKY.s);
  }
  // nothing of a neighbour pokes up through a platform: Woods Halt stands over a buttress of the Danse Macabre chapel, whose
  // pinnacle and finial would come up through the boards. Small pieces of other rides inside a platform's room (from
  // just under its floor to its canopy) are taken out; the buttress itself stops short under the slab.
  function pkSkyClearPlatforms() {
    var bb = new THREE.Box3(), dead = [];
    scene.updateMatrixWorld(true);
    scene.children.forEach(function (root) {
      var at = root.userData && root.userData.attr; if (!at || (at.id || at) === 'skyline') return;
      root.traverse(function (o) {
        if (!o.isMesh || !o.geometry) return;
        bb.setFromObject(o);
        if (bb.max.x - bb.min.x > 3 || bb.max.z - bb.min.z > 3 || bb.max.y - bb.min.y > 3) return;
        PK_SKY_ST.forEach(function (st) {
          if (bb.max.x > st.px0 - 0.2 && bb.min.x < st.px1 + 0.3 && bb.max.z > st.z0 - 0.3 && bb.min.z < st.z1 + 0.3 && bb.max.y > PK_SKY_TOP - 2.2 && bb.min.y < PK_SKY_TOP + 4) dead.push(o);
        });
      });
    });
    dead.forEach(function (o) { if (o.parent) o.parent.remove(o); });
    PK_SKY.cleared = dead.length;
  }
  // the little forecourt at the foot of the Woods Halt tower, off the Dark Woods street: the way to the queue
  function pkSkyForecourt() {
    var M = pkSkyM();
    pkPaved(11.0, 7.6, M.pavers, -54.6, 0.0185, -45.2, 2.4);
    pkPaved(3.2, 3.0, M.pavers, -61.0, 0.0186, -40.6, 2.4);
    pkPavedDisc(6.4, M.pavers, -55.5, 0.0187, -45.0, null, 2.4);
    var kerb = pkMats().kerb;
    if (kerb) { box(11.2, 0.07, 0.16, kerb, -54.6, 0.035, -48.95); box(0.16, 0.07, 7.6, kerb, -49.15, 0.035, -45.2); }
  }
  // put the three vehicles on the line at a front-car distance s; a vehicle faces the way the line runs
  // Each car hangs between its two bogies, 1.7 m in from its ends: its middle is midway between them and it points from
  // the one to the other. On a curve that turns the car smoothly (taking its heading from the short piece of line under
  // its middle turned it in steps, and a rider's view stuttered through every bend). Its cab (local +x) leads north.
  var PK_SKY_PA = {}, PK_SKY_PB = {};
  function pkSkyPlace(s) {
    for (var i = 0; i < PK_SKY.veh.length; i++) {
      var V = PK_SKY.veh[i], half = (i === 0 ? PK_SKY_LOCO.len : PK_SKY_COACH.len) / 2 - 1.7, sc = s + V.off;
      pkSkyAt(sc - half, PK_SKY_PA); pkSkyAt(sc + half, PK_SKY_PB);
      V.g.position.set((PK_SKY_PA.x + PK_SKY_PB.x) / 2, PK_SKY_RAIL, (PK_SKY_PA.z + PK_SKY_PB.z) / 2);
      V.g.rotation.set(0, Math.atan2(-(PK_SKY_PA.z - PK_SKY_PB.z), PK_SKY_PA.x - PK_SKY_PB.x), 0);
    }
  }

  // ── The ride's own way up: into the tower, up to the landing, over the gallery, along the platform ──
  // There is no queue lane in the street: the Skyline's line waits on her platform. A guest walks in at the tower's street
  // door, takes the lift up, crosses the gallery and stands on a waiting spot on the platform; when the train is in they
  // walk along the platform to a door and sit down. Off the train, the same way back down to the Dark Woods street.
  var PK_SKY_WAY = { door: [-61.0, -41.6], hall: [-61.0, -43.1], cage: [-61.0, -44.6], land: [-62.6, -42.9], gallery: [-63.4, -40.8], plat: [-63.6, -35.0] };
  function pkSkyUp() { var W = PK_SKY_WAY; return [{ x: W.hall[0], z: W.hall[1] }, { x: W.cage[0], z: W.cage[1] }, { x: W.cage[0] + 0.08, z: W.cage[1], lift: 1 }, { x: W.hall[0], z: W.hall[1] }, { x: W.land[0], z: W.land[1] }, { x: W.gallery[0], z: W.gallery[1] }, { x: W.plat[0], z: W.plat[1] }]; }
  function pkSkyDown() { var W = PK_SKY_WAY; return [{ x: W.plat[0], z: W.plat[1] }, { x: W.gallery[0], z: W.gallery[1] }, { x: W.land[0], z: W.land[1] }, { x: W.hall[0], z: W.hall[1] }, { x: W.cage[0], z: W.cage[1] }, { x: W.cage[0] + 0.08, z: W.cage[1], lift: -1 }, { x: W.hall[0], z: W.hall[1] }, { x: W.door[0], z: W.door[1] }]; }
  // the waiting spots: two rows down the Woods Halt platform, clear of the edge and of the benches
  function pkSkyWaitSpot(i) { var st = PK_SKY_ST[PK_SKY.home], k = i % 64; return { x: st.px0 + (k % 2 ? 1.75 : 0.95), z: st.z0 + 1.2 + Math.floor(k / 2) * 0.82 }; }
  function pkSkyUpstairs(gu) { return !!gu && !!gu.skyUp; }
  var _pkSkyPrevSlot = pkAttrSlot;
  pkAttrSlot = function (a, i) { return a && a.skyline ? pkSkyWaitSpot(i) : _pkSkyPrevSlot(a, i); };
  var _pkSkyPrevWalkTo = pkAttrWalkTo;
  pkAttrWalkTo = function (a, gu, i, fromSlot) {
    if (!a || !a.skyline) return _pkSkyPrevWalkTo(a, gu, i, fromSlot);
    var spot = pkSkyWaitSpot(i), W = PK_SKY_WAY;
    if (pkSkyUpstairs(gu)) return [spot];
    return route({ x: gu.rec.x, z: gu.rec.z }, { x: W.door[0], z: W.door[1] }).concat(pkSkyUp(), [spot]);
  };
  function pkSkySeatPath(from, w) {
    var W = PK_SKY_WAY, st = PK_SKY_ST[PK_SKY.home], up = from.x > st.px0 - 0.3 && from.x < st.px1 + 0.3 && from.z > st.z0 - 9 && from.z < st.z1 + 0.5;
    var edge = { x: st.px0 + 0.6, z: Math.max(st.z0 + 0.6, Math.min(st.z1 - 0.6, w.z)) };
    if (up) return [edge, { x: w.x, z: w.z }];
    return route(from, { x: W.door[0], z: W.door[1] }).concat(pkSkyUp(), [edge, { x: w.x, z: w.z }]);
  }
  function pkSkyWalkOut(sp) {
    var W = PK_SKY_WAY, a = PK.attrById.skyline, st = PK_SKY_ST[PK_SKY.home];
    var z = Math.max(st.z0 + 0.6, Math.min(st.z1 - 0.6, (sp && sp.z) || -20));
    return [{ x: st.px0 + 0.8, z: z }, { x: W.plat[0], z: Math.max(z, W.plat[1]) }].concat(pkSkyDown(), route({ x: W.door[0], z: W.door[1] }, { x: a.exit[0], z: a.exit[1] }));
  }
  // riders who stand up off the train stand up upstairs, on the platform
  var _pkSkyPrevUnseat = pkAttrUnseatAll;
  pkAttrUnseatAll = function (a) {
    var up = a && a.skyline ? a.seats.filter(function (s) { return !!s.guest; }).map(function (s) { return s.guest; }) : [];
    var n = _pkSkyPrevUnseat(a);
    up.forEach(function (gu) { gu.skyUp = true; gu.liftSpd = 0; });
    return n;
  };
  // the player gets off where the train stands: on the Woods Halt platform, beside his seat, up at deck level. The lift in
  // the tower takes him down to the street.
  var _pkSkyPrevStepOff = pkPlayerRideStepOff;
  pkPlayerRideStepOff = function () {
    var pr = PK.playerRide;
    if (!pr || pr.kind !== 'attr' || !pr.a || !pr.a.skyline) return _pkSkyPrevStepOff();
    var w = pkAttrSeatWorld(pr.seat), st = PK_SKY_ST[PK_SKY.at] || PK_SKY_ST[PK_SKY.home], r = _pkSkyPrevStepOff();
    player.x = st.px0 + 1.1; player.z = clamp(w.z, st.z0 + 1.2, st.z1 - 1.2); player.y = PK_SKY_TOP; player.vy = 0; player.grounded = true;
    player.yaw = -Math.PI / 2; player.pitch = 0;
    return r;
  };

  // can the player step aboard here and now: on a platform (up at its height), the train standing at a station, not
  // already riding, the ride open and running its timetable, and not in the middle of letting its riders off
  function pkSkyDoorOpen() {
    var a = PK_SKY.ride;
    if (!a || !a.open || PK.playerRide || PK_SKY_LIFT || PK_SKY_DRV || PK_SKY.mode !== 'dwell' || a.state === 'unloading' || a.state === 'running') return false;
    if (typeof pkExpansionOpen === 'function' && pkExpansionOpen(1) !== true) return false;
    var C = pkCtl(a); if (!C.key || C.maint || C.fault) return false;
    return Math.abs(player.y - PK_SKY_TOP) < 0.6;
  }
  function pkSkyBoardAt(car) {
    var a = PK_SKY.ride; if (!pkSkyDoorOpen()) return false;
    var seat = null;
    for (var i = 0; i < car.seats.length && !seat; i++) if (!car.seats[i].guest && !car.seats[i].player) seat = car.seats[i];
    if (!seat) { toast('This car is full - try the next door', ''); return false; }
    pkPlayerSeatAttr(a, seat);
    if (PK_SKY.at === PK_SKY.home) PK_SKY.dwell = Math.max(PK_SKY.dwell, 6);   // the doors hold a moment for you to sit down
    return true;
  }

  // ── Driving her: the cab desks ───────────────────────────────────
  // Either cab can be driven. Climb in at the cab's side from the platform, turn the master key, and the timetable stands
  // down: W and S move the master controller (power forward, brake back), Space is the emergency brake, R the direction
  // switch, O the doors, L the headlights, H the chime, K the key. The doors open only at a stand at a platform; at Woods
  // Halt the riders get off and the line on the platform boards, as on AUTO. Train protection keeps her off the buffers.
  // Stop, and E aimed at nothing climbs out: the timetable takes her back from wherever she stands.
  var PK_SKY_DRV = null, PK_SKY_V3 = new THREE.Vector3(), PK_SKY_V3b = new THREE.Vector3();
  function pkSkyDesk(cab, i) {
    var n = cab.g, FL = PK_SKY_FLOOR;
    var frame = std({ color: 0x3a4048, roughness: 0.55, metalness: 0.35 }), seatM = std({ color: 0x23262b, roughness: 0.8 });
    // the driver's seat on its column
    pkBevelBox(0.5, 0.1, 0.48, seatM, -0.62, FL + 0.48, 0, n, 0.05); pkBevelBox(0.1, 0.62, 0.48, seatM, -0.86, FL + 0.82, 0, n, 0.05);
    pkBevelBox(0.1, 0.18, 0.4, seatM, -0.86, FL + 1.22, 0, n, 0.05);
    pkRoundCyl(0.05, 0.4, frame, -0.62, FL + 0.23, 0, n, 10);
    // the desk on the low front, its fascia tilted to the driver
    var P = pkCtlPanel({ w: 1.1, h: 0.42, x: 0.2, y: FL + 0.84, z: 0, ry: -Math.PI / 2, tilt: -1.0, parent: n, key: 'pk-sky-desk-' + i,
      paint: function (c, W, H) { c.fillStyle = '#1f2a26'; c.fillRect(0, 0, W, H); for (var k = 0; k < 2200; k++) { c.fillStyle = 'rgba(255,255,255,' + randf(0.01, 0.03) + ')'; c.fillRect(Math.random() * W, Math.random() * H, randf(1, 12), 1); } },
      draw: function (c, W, H) {
        var R = pkCtlRuler(W, H, 1.1, 0.42); R.c = c;
        R.engrave('MASTER', -0.45, 0.17, 0.018); R.engrave('DIRECTION', -0.3, 0.17, 0.018); R.txt('R   N   F', -0.3, 0.035, 0.014, '#9fb0bc');
        R.engrave('HEADLIGHTS', -0.45, -0.17, 0.013); R.engrave('KM/H', -0.12, -0.185, 0.015); R.engrave('BRAKE', 0.02, -0.185, 0.015);
        R.engrave('DOORS', 0.36, 0.17, 0.016); R.engrave('OPEN', 0.3, -0.02, 0.013); R.engrave('CLOSE', 0.42, -0.02, 0.013);
        R.engrave('CHIME', 0.3, -0.185, 0.013); R.engrave('EMERGENCY', 0.44, -0.185, 0.012);
        R.txt('THE SKYLINE  ·  CAB ' + (i + 1), -0.05, 0.192, 0.013, '#f0c04a', 'center', '700');
      } });
    var K = {};
    K.key = pkCtlKey(P, -0.45, 0.09, { id: 'key', label: 'Master key', on: false, act: function (on) { pkSkyDrvKey(on); } });
    K.dir = pkCtlRotary(P, -0.3, 0.09, { id: 'dir', n: 3, pos: 1, prompt: 'Direction switch', names: ['REVERSE', 'NEUTRAL', 'FORWARD'], act: function (p) { pkSkyDrvDir(p - 1); } });
    K.head = pkCtlToggle(P, -0.45, -0.09, { id: 'head', on: true, prompt: 'Headlights', act: function (on) { if (PK_SKY_DRV) PK_SKY_DRV.head = on; } });
    K.read = pkCtlReadout(P, -0.05, 0.1, 0.36, 0.13, {});
    K.gV = pkCtlGauge(P, -0.12, -0.08, { r: 0.058, label: 'KM/H', min: 0, max: 40, unit: 'km/h', dial: 'black', get: function () { return clamp(PK_SKY.v * 3.6 / 40, 0, 1); } });
    K.gB = pkCtlGauge(P, 0.02, -0.08, { r: 0.058, label: 'BAR', min: 0, max: 5, unit: 'bar', dial: 'black', get: function () { return PK_SKY_DRV ? clamp(PK_SKY_DRV.brakeK || 0, 0, 1) : 1; } });
    K.open = pkCtlBtn(P, 0.3, 0.06, { id: 'open', label: 'OPEN', col: 'green', r: 0.03, lampCol: 0x5fd38d, prompt: 'Doors open (O)', act: function () { pkSkyDrvDoors(true); } });
    K.close = pkCtlBtn(P, 0.42, 0.06, { id: 'close', label: 'CLOSE', col: 'red', r: 0.03, lampCol: 0xff6a3a, prompt: 'Doors close (O)', act: function () { pkSkyDrvDoors(false); } });
    K.chime = pkCtlBtn(P, 0.3, -0.1, { id: 'chime', label: 'CHIME', col: 'amber', r: 0.028, lampCol: 0xffd23a, prompt: 'Chime (H)', act: function () { sfx('pkSkyWhistle'); } });
    K.stop = pkCtlMushroom(P, 0.44, -0.1, { r: 0.045, prompt: 'Emergency stop', act: function () { if (PK_SKY_DRV) PK_SKY_DRV.estop = true; }, release: function () { if (PK_SKY_DRV) PK_SKY_DRV.estop = false; } });
    cab.ctl = K;
    // the master controller: a T handle on a quadrant at the right hand; back is brake, the middle coast, forward power
    var mc = new THREE.Group(); mc.position.set(-0.12, FL + 0.8, 0.5); n.add(mc);
    pkBevelBox(0.42, 0.14, 0.2, frame, 0, 0, 0, mc, 0.02);
    var piv = new THREE.Group(); piv.position.set(0, 0.07, 0); piv.userData.dynamic = true; mc.add(piv); cab.mcPiv = piv;
    pkRoundCyl(0.014, 0.2, MAT.chrome, 0, 0.1, 0, piv, 10);
    var tH = pkRoundCyl(0.024, 0.16, std({ color: 0x1b1d20, roughness: 0.5 }), 0, 0.21, 0, piv, 12); tH.rotation.x = Math.PI / 2;
    sphere(0.018, std({ color: 0xc8322a, roughness: 0.4 }), 0, 0.21, 0.085, piv);
    hitBox(0.45, 0.35, 0.25, -0.12, FL + 0.95, 0.5, { prompt: function () { return PK_SKY_DRV && PK_SKY_DRV.cab === cab ? 'Master controller: ' + pkSkyNotch() + ' (W power, S brake)' : ''; }, use: function () { if (PK_SKY_DRV) PK_SKY_DRV.lever = Math.min(1, PK_SKY_DRV.lever + 0.25); sfx('click'); } }, n);
    // climbing in: at the cab's side, from the platform
    hitBox(1.2, 1.9, 0.5, cab.sideX, FL + 0.95, PK_SKY_W / 2 + 0.15, { prompt: function () { return pkSkyCanDrive() ? 'Climb into the driver\'s cab' : ''; }, use: function () { pkSkyDrvEnter(cab); } }, cab.car.g);
  }
  // how far to the next mark the way she is facing, for the cab display
  function pkSkyMarkText() {
    var n = pkSkyNear();
    if (Math.abs(n.d) < 40) return 'MARK ' + (n.d * (PK_SKY.dir || 1) >= 0 ? '' : '-') + Math.abs(n.d).toFixed(1) + ' M';
    return 'ON THE LINE';
  }
  function pkSkyNotch() { var c = PK_SKY_DRV ? PK_SKY_DRV.lever : 0; if (c < -0.05) return 'BRAKE ' + Math.round(-c * 100) + '%'; if (c < 0.05) return 'COAST'; return 'POWER ' + Math.min(4, Math.ceil(c * 4)); }
  function pkSkyCanDrive() {
    return PK_SKY.built && !PK_SKY_DRV && !PK.playerRide && !PK_SKY_LIFT && PK_SKY.v < 0.2 && (typeof pkExpansionOpen !== 'function' || pkExpansionOpen(1) === true) && Math.abs(player.y - PK_SKY_TOP) < 0.7;
  }
  function pkSkyDrvEnter(cab) {
    if (!pkSkyCanDrive()) return false;
    PK_SKY_DRV = { cab: cab, key: false, dir: 0, lever: -1, head: true, estop: false, doors: false, brakeK: 1, look: { yaw: 0, pitch: -0.12 } };
    if (cab.ctl) { cab.ctl.dir.set(1, true); cab.ctl.key.set(false); }
    sfx('click');
    toast('The Skyline cab: turn the master key (K) to drive. W / S master controller, Space emergency brake, R direction, O doors, L headlights, H chime. Stop, then E aimed at nothing, to climb out.', '');
    return true;
  }
  function pkSkyDrvKey(on) {
    var D = PK_SKY_DRV; if (!D) return;
    if (D.cab.ctl && D.cab.ctl.key.on !== on) D.cab.ctl.key.set(on);
    if (on === D.key) return;
    D.key = on;
    if (on) { D.doors = PK_SKY.mode === 'dwell' && (PK_SKY.doorF || 0) > 0.5; D.lever = Math.min(D.lever, 0); if (!D.doors) PK_SKY.mode = 'drive'; toast('Master key ON: you have the Skyline, AUTO stands down', 'good'); }
    else { pkSkyAutoBack(); toast('Master key OFF: climb out (E) and the timetable has her again', ''); }
  }
  function pkSkyDrvDir(d) {
    var D = PK_SKY_DRV; if (!D) return;
    if (PK_SKY.v > 0.2) { toast('Stop before you change direction', 'bad'); if (D.cab.ctl) D.cab.ctl.dir.set(D.dir + 1, true); return; }
    D.dir = clamp(d, -1, 1); if (D.cab.ctl) D.cab.ctl.dir.set(D.dir + 1, true); sfx('click');
  }
  // the nearest stopping mark, signed along the line; at a stop means on the mark to within a hand's width
  function pkSkyNear() { var r = { k: -1, d: 1e9 }; PK_SKY_ST.forEach(function (st, k) { var d = st.stop - PK_SKY.s; if (Math.abs(d) < Math.abs(r.d)) { r.k = k; r.d = d; } }); return r; }
  function pkSkyAtStop() { var n = pkSkyNear(); return Math.abs(n.d) < 0.3 ? n.k : -1; }
  var PK_SKY_BERTH = 16;   // inside this, a driver short of the mark asks for the doors and she creeps the rest on her own
  function pkSkyDrvDoors(open) {
    var D = PK_SKY_DRV, a = PK_SKY.ride; if (!D) return;
    if (!D.key) { toast('Turn the master key first', 'bad'); return; }
    if (open === undefined) open = !D.doors;
    if (open === D.doors) return;
    if (open) {
      if (PK_SKY.v > 0.1) { toast('Stop before you open the doors', 'bad'); return; }
      var at = pkSkyAtStop(), nr = pkSkyNear();
      if (at < 0 && Math.abs(nr.d) < PK_SKY_BERTH) { D.berth = nr.k; toast('Berthing: she creeps to the ' + PK_SKY_ST[nr.k].name + ' mark and opens up there', ''); return; }
      if (at < 0) { toast('Not at a platform: bring her to within ' + PK_SKY_BERTH + ' m of the stopping mark first', 'bad'); return; }
      PK_SKY.s = PK_SKY_ST[at].stop; PK_SKY.v = 0; PK_SKY.at = at; D.doors = true; PK_SKY.mode = 'dwell'; pkSkyArrive(a);
    } else {
      if (a.state === 'unloading' && a.riders > 0) { toast('Wait: the riders are still getting off', 'bad'); return; }
      if (pkAttrWalkers(a) > 0) { toast('Wait: someone is still stepping aboard', 'bad'); return; }
      var C = pkCtl(a); D.doors = false; C.gates = false; C.barsWant = 1;
      a.state = a.riders > 0 ? 'running' : 'idle'; PK_SKY.through = a.riders > 0 && PK_SKY.at !== PK_SKY.home; PK_SKY.mode = 'drive';
    }
    sfx('click');
  }
  // hand her back to the timetable: at a platform she stands there as if she had just come in; between stations she runs on
  // to the next one the way she was going
  function pkSkyAutoBack() {
    var K = PK_SKY, a = K.ride, D = PK_SKY_DRV;
    if (D) { D.key = false; D.doors = false; D.berth = null; }
    var at = pkSkyAtStop(), nr = pkSkyNear();
    if (at < 0 && Math.abs(nr.d) < PK_SKY_BERTH) { K.next = nr.k; K.mode = 'run'; a.state = 'running'; K.through = false; pkSkyPlace(K.s); return; }
    if (at >= 0 && K.v < 0.3) { K.s = PK_SKY_ST[at].stop; K.v = 0; K.at = at; K.mode = 'dwell'; pkSkyArrive(a); K.dwell = 8; }
    else {
      var nx = -1, best = 1e9, dir = K.dir || 1;
      PK_SKY_ST.forEach(function (st, k) { var d = (st.stop - K.s) * dir; if (d > 0.5 && d < best) { best = d; nx = k; } });
      if (nx < 0) { K.dir = -dir; nx = K.dir > 0 ? PK_SKY_ST.length - 1 : 0; }
      K.next = nx; K.mode = 'run'; a.state = 'running'; K.through = false;
    }
    pkSkyPlace(K.s);
  }
  function pkSkyDrvLeave() {
    var D = PK_SKY_DRV; if (!D) return false;
    if (PK_SKY.v > 0.2) { toast('Stop first', 'bad'); return true; }
    if (D.key) pkSkyAutoBack();
    if (PK_SKY.mode === 'dwell') PK_SKY.dwell = Math.max(PK_SKY.dwell, 8);   // the platform gets its time once the driver is out
    var car = D.cab.car.g; car.updateMatrixWorld(true);
    var w = PK_SKY_V3.set(D.cab.sideX, 0, PK_SKY_W / 2 + 1).applyMatrix4(car.matrixWorld), st = null;
    PK_SKY_ST.forEach(function (s2) { if (w.z > s2.z0 - 1 && w.z < s2.z1 + 1 && Math.abs(w.x - s2.x) < 7) st = s2; });
    if (st) { player.x = st.px0 + 1.0; player.z = clamp(w.z, st.z0 + 1, st.z1 - 1); player.y = PK_SKY_TOP; }
    else { var n0 = pkSkyAt(pkSkySOf(w.x, w.z)), o = pkSkySide(n0.x, n0.z, n0.dx, n0.dz, -1.9); player.x = o.x; player.z = o.z; player.y = PK_SKY_DECK + 0.15; }
    player.vy = 0; player.grounded = true; player.pitch = 0;
    PK_SKY_DRV = null; sfx('click');
    return true;
  }
  // the drive itself, while the key is on and the doors are shut
  function pkSkyDrive(D, a, dt) {
    var K = PK_SKY, keys = player.keys || {}, want = D.dir * D.cab.face, last = PK_SKY_ST[PK_SKY_ST.length - 1].stop;
    if (keys.KeyW) D.lever = Math.min(1, D.lever + dt * 0.9);
    if (keys.KeyS) D.lever = Math.max(-1, D.lever - dt * 0.9);
    var emer = D.estop || keys.Space, power = !emer && D.lever > 0.05 && want ? Math.ceil(D.lever * 4) / 4 : 0;
    // berthing: the last few metres to the mark at walking pace, then the doors, the way an automatic metro squares up
    if (D.berth != null) {
      var bd = PK_SKY_ST[D.berth].stop - K.s;
      if (emer || power > 0 || Math.abs(bd) > PK_SKY_BERTH) D.berth = null;
      else {
        if (K.v < 0.05) K.dir = bd < 0 ? -1 : 1;
        var bw = Math.min(1.5, Math.sqrt(2 * 0.6 * Math.max(0, Math.abs(bd) - 0.03)));
        K.v = Math.max(0, K.v + clamp(bw - K.v, -1.6 * dt, 0.6 * dt));
        K.s += Math.min(K.v * dt, Math.abs(bd)) * K.dir;
        pkSkyPlace(K.s); a.state = 'running'; pkCtl(a).spd = Math.min(1, K.v / 8);
        if (Math.abs(PK_SKY_ST[D.berth].stop - K.s) <= 0.06 && K.v < 0.4) { K.v = 0; D.berth = null; pkSkyDrvDoors(true); }
        return;
      }
    }
    if (K.v < 0.05 && power > 0) K.dir = want;
    if (power > 0 && K.dir === want) K.v += power * 0.9 * dt;
    var brake = (D.lever < -0.05 ? -D.lever * 1.6 : 0) + (emer ? 3.0 : 0) + (power > 0 && K.dir !== want ? 1.2 : 0) + 0.04;
    D.brakeK = clamp((D.lever < -0.05 ? -D.lever : 0) + (emer ? 1 : 0), 0, 1);
    K.v = Math.max(0, K.v - brake * dt);
    // train protection: never past the stopping marks at the two ends of the line, never over 8 m/s
    var lim = K.dir < 0 ? K.s - PK_SKY_ST[0].stop : last - K.s;
    K.v = Math.min(K.v, 8, Math.sqrt(Math.max(0, 2 * 1.2 * Math.max(0, lim))));
    K.s = clamp(K.s + K.v * K.dir * dt, PK_SKY_ST[0].stop, last);
    pkSkyPlace(K.s);
    a.state = a.riders > 0 || K.v > 0.1 ? 'running' : 'idle';
    pkCtl(a).spd = Math.min(1, K.v / 8);
  }
  // keys, the mouse and the camera while the player has a cab
  var _pkSkyPrevKey = GAME.key;
  GAME.key = function (e) {
    var D = PK_SKY_DRV;
    if (D && !e.repeat) {
      if (e.code === 'KeyE') { if (focusText) return false; return pkSkyDrvLeave(); }
      if (e.code === 'KeyK') { pkSkyDrvKey(!D.key); return true; }
      if (e.code === 'KeyR') { pkSkyDrvDir(D.dir + (e.shiftKey ? -1 : 1)); return true; }
      if (e.code === 'KeyO') { pkSkyDrvDoors(); return true; }
      if (e.code === 'KeyL') { if (D.cab.ctl) D.cab.ctl.head.flip(); else D.head = !D.head; return true; }
      if (e.code === 'KeyH') { sfx('pkSkyWhistle'); return true; }
      if (e.code === 'Space') { e.preventDefault(); player.keys.Space = true; return true; }
    }
    return _pkSkyPrevKey ? _pkSkyPrevKey(e) : false;
  };
  var _pkSkyPrevMouse = GAME.mouseLook;
  GAME.mouseLook = function (e, sx, iy) {
    var D = PK_SKY_DRV;
    if (D) { D.look.yaw = clamp(D.look.yaw - e.movementX * sx, -2.4, 2.4); D.look.pitch = clamp(D.look.pitch - e.movementY * sx * iy, -1.2, 1.2); return true; }
    return _pkSkyPrevMouse ? _pkSkyPrevMouse(e, sx, iy) : false;
  };
  var _pkSkyPrevOverride2 = GAME.playerOverride;
  GAME.playerOverride = function (dt) {
    var D = PK_SKY_DRV;
    if (!D) return _pkSkyPrevOverride2 ? _pkSkyPrevOverride2(dt) : false;
    var n = D.cab.g; n.updateMatrixWorld(true);
    var p = PK_SKY_V3.set(-0.55, PK_SKY_FLOOR + 1.3, 0).applyMatrix4(n.matrixWorld), f = PK_SKY_V3b.set(1, 0, 0).transformDirection(n.matrixWorld);
    var yaw = Math.atan2(-f.x, -f.z) + D.look.yaw;
    player.x = p.x; player.z = p.z; player.y = p.y - 1.62; player.vy = 0;
    camera.position.copy(p); camera.rotation.set(D.look.pitch, yaw, 0, 'YXZ');
    player.yaw = yaw; player.pitch = D.look.pitch;
    return true;
  };

  // ── The shuttle's own state machine, run from part 05's hook ─────
  // North, Woods Halt, South and back. Riders board at Woods Halt and stay aboard through the far station's stop, so a
  // ride is out to the end of the line and back; they get off where they got on.
  function pkSkylineTick(a, dt) {
    if (!a.open) return true;
    // the line is only finished once stage 1's three-day build is done; before that the breaker can be on and the
    // key can be turned, but the shuttle stands fast on the unfinished deck, same as a fault
    if (typeof pkExpansionOpen === 'function' && pkExpansionOpen(1) !== true) { var C0 = pkCtl(a); C0.spd = 0; return true; }
    var K = PK_SKY, C = pkCtl(a);
    C.gateT += ((C.gates ? 1 : 0) - C.gateT) * Math.min(1, dt * 3.5);
    C.bars += (C.barsWant - C.bars) * Math.min(1, dt * 3);
    for (var gi = 0; gi < C.gateObjs.length; gi++) C.gateObjs[gi](C.gateT);
    pkCtlLamps(a);
    if (C.fault) { C.spd = 0; return true; }          // E-stop: the shuttle stands exactly where it is
    if (!K.built) return true;
    K.t += dt; a.t += dt;
    var D = PK_SKY_DRV;
    if (D && D.key) {
      if (!D.doors) { K.mode = 'drive'; pkSkyDrive(D, a, dt); return true; }
      K.mode = 'dwell'; K.dwell = Math.max(K.dwell, 5);   // doors open under the driver: the platform works as on AUTO, she never leaves on her own
    }
    C.spd = Math.min(1, K.v / 8);
    if (K.mode === 'run') {
      var target = PK_SKY_ST[K.next].stop, dist = Math.abs(target - K.s);
      // a driver still in the cab with the key out: she squares up to a mark close by, but never sets off down the line
      // with them aboard; the timetable takes her once they have climbed out
      if (D && K.v < 0.05 && dist > PK_SKY_BERTH) { C.spd = 0; return true; }
      if (target < K.s) K.dir = -1; else if (target > K.s) K.dir = 1;
      var vWant = Math.min(8, Math.sqrt(Math.max(0, 2 * 0.85 * Math.max(0, dist - 0.05))));
      // obstacle detection: someone standing on the track ahead and the train brakes to a stand short of them, and waits
      var ob = pkSkyObstacle(K);
      if (ob !== null) vWant = Math.min(vWant, Math.sqrt(Math.max(0, 2 * 1.4 * Math.max(0, ob - 4))));
      K.v += clamp(vWant - K.v, -1.6 * dt, 0.9 * dt);
      K.v = Math.max(0, K.v);
      if (dist <= 0.06 && K.v < 0.5) { K.s = target; K.v = 0; K.at = K.next; K.mode = 'dwell'; pkSkyArrive(a); }
      else K.s += K.v * K.dir * dt;
      pkSkyPlace(K.s);
      return true;
    }
    // standing at a station; with the operator key off (or in MAINT) she stands where she is, as every ride does
    if (!C.key || C.maint) { if (a.state === 'boarding') a.state = 'idle'; C.gates = false; K.dwell = Math.max(K.dwell, 1); return true; }
    K.dwell -= dt;
    var home = K.at === K.home;
    if (a.state === 'unloading') {
      C.barsWant = 0; C.gates = false;
      if (a.riders > 0 && C.bars < 0.5) pkAttrLetOff(a);
      if (a.riders <= 0) { a.state = 'idle'; a.t = 0; }
      else return true;
    }
    if (K.dwell > 0) {
      if (home && C.key && !C.maint && !PK.closed && a.riders < a.seats.length) {
        if (a.state === 'idle' && a.queue.length) pkAttrBegin(a);
        if (a.state === 'boarding') {
          C.gates = true;
          pkAttrFill(a);
          a.boarding = pkAttrWalkers(a);
          var full = !pkAttrHasSeat(a);
          if (a.riders > 0 && !a.boarding && (full || a.t >= a.board || (a.t >= a.board - 1.4 && !a.queue.length) || a.t >= a.board + 6)) { C.gates = false; C.barsWant = 1; }
          if (C.barsWant > 0.5 && C.bars > 0.85 && !a.boarding && a.riders > 0 && !a.queue.length) K.dwell = Math.min(K.dwell, 0.2);
        }
      }
      if (a.state === 'running' && !K.through) { K.dwell = 0; }   // a test run or a dispatch from the desk
      return true;
    }
    if (D) return true;   // nobody leaves on the timetable with a driver still in the cab
    // the timetable waits a moment for anyone still walking to a seat, so nobody is left on the platform
    if (pkAttrWalkers(a) > 0 && (K.waitT = (K.waitT || 0) + dt) < 20) return true;
    K.waitT = 0;
    pkSkyDepart(a);
    return true;
  }
  // how far ahead of the leading end the player stands on the track, or null: only on the deck, within the track's width
  function pkSkyObstacle(K) {
    if (typeof player === 'undefined' || !player || PK.playerRide || PK_SKY_DRV || Math.abs(player.y - (PK_SKY_DECK + 0.15)) > 0.8) return null;
    var ps = pkSkySOf(player.x, player.z), p = pkSkyAt(ps); if (Math.hypot(p.x - player.x, p.z - player.z) > 1.8) return null;
    var front = K.dir < 0 ? K.s - PK_SKY_LOCO.len / 2 - 1.1 : K.s + pkSkyOffsets()[2] + PK_SKY_COACH.len / 2 + 1.1, ahead = (ps - front) * K.dir;
    return ahead > -1 && ahead < 60 ? Math.max(0, ahead) : null;
  }
  function pkSkyArrive(a) {
    var K = PK_SKY, C = pkCtl(a);
    K.dwell = 25; K.v = 0; a.t = 0;
    if (K.at === K.home) {
      K.through = false;
      // the doors open at every stop here, riders aboard or not, so the line waiting on the platform can board
      C.gates = true; C.barsWant = 0;
      if (a.riders > 0) { a.state = 'unloading'; a.cycles++; sfx('chime'); } else a.state = 'idle';
      if (C.bars < 0.5) pkAttrLetOff(a);
    } else {
      // a far station: the doors stay shut on the riders (their land is not open yet) and the ride runs on through it
      C.gates = false; C.barsWant = 1;
      if (a.riders > 0) { a.state = 'running'; K.through = true; } else a.state = 'idle';
    }
    screenDirtyAll(); hudDirty = true;
  }
  function pkSkyDepart(a) {
    var K = PK_SKY, C = pkCtl(a), nx = K.at + K.dir;
    if (nx < 0 || nx > PK_SKY_ST.length - 1) { K.dir = -K.dir; nx = K.at + K.dir; }
    C.gates = false; C.barsWant = 1;
    a.state = 'running'; a.t = 0; K.through = false;
    K.next = nx; K.toS = PK_SKY_ST[nx].stop; K.mode = 'run'; K.dwell = 0;
    sfx('pkSkyWhistle');
    screenDirtyAll(); hudDirty = true;
  }
  function pkSkyFrac() { return clamp(PK_SKY.s / pkSkyLine().total, 0, 1); }

  // ── The plot, the ride and its control cabin ────────────────────
  // boothAt sits clear of the north tower (tower centre -60,-172, half-width 2.5: its footprint runs x -62.5 to -57.5,
  // z -174.5 to -169.5); at -55,-170 the booth's own footprint (half-width 1.9, half-depth 1.45) clears it by a margin,
  // and boothDs forces the door onto the east wall, away from the tower, since the queue point is 125 m south and gives
  // the auto door-side pick nothing useful to go on
  PK_PLOTS.push({ id: 'skyline', name: 'The Skyline', x: -55.5, z: -45, r: 6, q: [-55.5, -44.0], level: 26, pad: 1.15, boothAt: [-55, -170], boothDs: 1 });
  PK_THEME.skyline = { a: PK_SKY_GREEN, b: 0xf2e6b8, ground: 0x9a938a, name: 'The Skyline', noBunting: true, noDecor: true, noLane: true, portal: function () {} };
  function pkBuildSkyline(p) {
    pkSkyBuild();
    var a = pkAttr({
      id: 'skyline', name: 'The Skyline', x: p.x, z: p.z, qx: p.q[0], qz: p.q[1],
      g: pkMover(scene, 0, 0, 0), seats: PK_SKY.seats, cap: PK_SKY.seats.length,
      board: 20, run: 110, unload: 4, exit: [-59.6, -39.4],   // the guests come out of the tower's street door onto the Dark Woods street
      start: function (at) { sfx('pkSkyWhistle'); },
      tickRun: function (at, dt) { pkSkyPlace(PK_SKY.s); }
    });
    a.skyline = true;
    a.level = p.level; a.plot = p; a.open = pkRideSavedOpen(p.id);
    if (S.rides) S.rides[p.id] = a.open;
    a.seatPath = pkSkySeatPath;
    a.walkOut = pkSkyWalkOut;
    a.extra.curve = new THREE.CatmullRomCurve3(pkSkyLine().segs.map(function (g) { return new THREE.Vector3(g.ax, PK_SKY_RAIL, g.az); }).concat([new THREE.Vector3(PK_SKY_PTS[PK_SKY_PTS.length - 1][0], PK_SKY_RAIL, PK_SKY_PTS[PK_SKY_PTS.length - 1][1])]));
    a.extra.uPark = 0;
    a.extra.cars = PK_SKY.veh.map(function (V) { return { g: V.g }; });
    a.extra.blocks = ['SKYLINE NORTH', 'WOODS HALT', 'SKYLINE SOUTH', 'ON LINE'];
    PK_SKY.ride = a;
    // her own control cabin at Skyline North, on the ground beside the lift tower
    if (typeof pkBuildBooth === 'function') pkBuildBooth(a, p, PK_THEME.skyline);
    pkCtl(a); pkCtlLoad(a);
    return a;
  }
  var _pkSkyPrevBuild = pkBuildAttractions;
  pkBuildAttractions = function () {
    _pkSkyPrevBuild();
    PK_PLOTS.forEach(function (p) { if (p.id === 'skyline' && !PK.attrById.skyline) pkBuildSkyline(p); });
  };

  // ── The panel sheet: its own style, crest, voice and windows ────
  var _pkSkyPrevStyles = pkPnStyles;
  pkPnStyles = function () {
    var S = _pkSkyPrevStyles();
    if (!S.skyline) {
      S.skyline = { font: 'Bahnschrift, "Segoe UI", Arial, sans-serif', head: 'Georgia, serif', ink: '#f2ead0', dim: '#c8c0a0', acc: '#f0c04a',
        zone: 'rgba(6,26,16,0.55)', zone2: '#123a26', edge: 'rgba(240,192,74,0.6)', win: '#04140c', grid: 'rgba(140,220,170,0.08)',
        rim: pkMats().gold, collar: pkMats().brass, dial: 'brass', lever: 'jade', tele: '#b8e8a0', glow: 0.3,
        base: function (c, W, H) {
          pkPnFill(c, W, H, '#1d5b3b', '#0b2417');
          pkPnPinstripe(c, W, H, 9, '#f0c04a', 4, 8); pkPnPinstripe(c, W, H, 20, 'rgba(242,230,184,0.54)', 1.5, 6);
          c.strokeStyle = 'rgba(242,230,184,0.12)'; c.lineWidth = 5;
          for (var x = -H; x < W + H; x += 46) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + H, H); c.stroke(); }
          for (var i = 0; i < 40; i++) { c.fillStyle = 'rgba(242,230,184,0.05)'; c.fillRect(Math.random() * W, Math.random() * H, 3, 3); }
          pkPnVignette(c, W, H, 0.4);
        } };
    }
    return S;
  };
  if (typeof PK_PN_CRESTS !== 'undefined') {
    PK_PN_CRESTS.skyline = function (c, x, y, r, S) {
      // a viaduct arch on its piers, with the metro car crossing it
      c.fillStyle = S.ink || '#f2ead0';
      c.fillRect(x - r * 0.78, y - r * 0.06, r * 1.56, r * 0.16);
      [-0.6, 0.6].forEach(function (o) { c.fillRect(x + o * r - r * 0.06, y + r * 0.06, r * 0.12, r * 0.5); });
      c.beginPath(); c.arc(x, y + r * 0.56, r * 0.42, Math.PI, 0); c.fill();
      c.fillStyle = S.acc || '#f0c04a';
      c.beginPath(); c.moveTo(x - r * 0.5, y - r * 0.08); c.lineTo(x + r * 0.34, y - r * 0.08); c.lineTo(x + r * 0.52, y - r * 0.22); c.lineTo(x + r * 0.4, y - r * 0.44); c.lineTo(x - r * 0.5, y - r * 0.44); c.closePath(); c.fill();
      c.fillStyle = S.zone2 || '#123a26';
      for (var w = 0; w < 3; w++) c.fillRect(x - r * 0.42 + w * r * 0.26, y - r * 0.38, r * 0.2, r * 0.14);
    };
  }
  // the two-tone chime of a modern metro, and the doors' hiss
  if (typeof SFX !== 'undefined') {
    SFX.pkSkyWhistle = function (t) {
      sTone('sine', 880, t, 0.42, 0.06, { attack: 0.01 });
      sTone('sine', 698, t + 0.45, 0.6, 0.06, { attack: 0.01 });
      sNoise(t + 0.2, 0.5, 0.025, { type: 'highpass', freq: 2400, shape: 'swell', fade: true });
    };
  }
  PK_PANEL.skyline = { style: 'skyline', title: 'The Skyline', model: 'METRO SHUTTLE SL-1 · 3 STATIONS · ' + Math.round(pkSkyLine().total) + ' M · 8 M/S', kind: 'track', seatCol: 0xf0c04a,
    blocks: ['NORTH', 'WOODS HALT', 'SOUTH', 'ON LINE'],
    g2: { unit: 'km/h', min: 0, max: 30, ticks: 6, red: 0.88, get: function (T) { return (T.v || 0) * 3.6 / 30; } },
    sig: { label: 'CHIME', sfx: 'pkSkyWhistle', words: 'the shuttle sounds her chime', col: 'gold' },
    ann: [['turn', 'DOORS\nSHUT', '#f0c04a'], ['pumps', 'ON LINE', '#5fd38d']],
    tele: function (a, C, T) {
      // the two windows are lit from the same facts the desk shows: the doors' state and whether she is out on the line
      T.rpm = (C.gates ? 0 : 1); T.flow = (a.state === 'running' ? 1000 : 0);
      var st = PK_SKY_ST[PK_SKY.at] || PK_SKY_ST[0];
      return ['V ' + ('  ' + ((T.v || 0) * 3.6).toFixed(1)).slice(-5) + ' KM/H  H ' + ((T.h || 0)).toFixed(1) + ' M  ' + st.name,
        'ABOARD ' + a.riders + '/' + a.seats.length + '  ' + (PK_SKY.mode === 'run' ? 'ON THE LINE' : 'AT ' + st.id.toUpperCase())];
    },
    blockOf: function (fr) {   // which section the front car is in, read off its own distance along the line
      var s = PK_SKY.s;
      for (var i = 0; i < PK_SKY_ST.length; i++) { var st = PK_SKY_ST[i]; if (Math.abs(s - st.stop) < 6 || (s > st.s0 - 2 && s < st.s1 + 2)) return i; }
      return 3;
    },
    lap: function () { return pkSkyFrac(); }
  };

  // ── The life of it: the windows and lamps at night ──
  function pkSkyTick(dt) {
    if (!PK_SKY.built) return;
    var night = typeof S !== 'undefined' && S && (S.time < 7 || S.time > 19.5), M = pkSkyM();
    M.lamp.emissiveIntensity = night ? 1.8 : 0.4;
    M.winPane.emissiveIntensity = night ? 0.55 : 0.0;
    var a = PK_SKY.ride, C = a ? pkCtl(a) : null;
    var D = PK_SKY_DRV, want = a && C && PK_SKY.mode === 'dwell' && PK_SKY.at === PK_SKY.home && !PK_SKY.through && PK_SKY.dwell > 1.6 && !(C.barsWant > 0.5 && C.bars > 0.85) && C.key && !C.fault ? 1 : 0;
    if (D && D.key) want = D.doors ? 1 : 0;
    var CM = pkSkyCarM(); CM.led.emissiveIntensity = D && !D.head ? 0.05 : 1.6;
    if (D) {
      if (D.cab.mcPiv) D.cab.mcPiv.rotation.z = -D.lever * 0.6;
      var atS = pkSkyAtStop();
      if (D.cab.ctl && D.cab.ctl.read) D.cab.ctl.read.set([(PK_SKY.v * 3.6).toFixed(1) + ' KM/H  ' + ['REV', 'NEU', 'FWD'][D.dir + 1], D.key ? pkSkyNotch() : 'KEY OFF  AUTO', (D.doors ? 'DOORS OPEN' : D.berth != null ? 'BERTHING' : 'DOORS SHUT') + '  ' + (atS >= 0 ? PK_SKY_ST[atS].name : pkSkyMarkText())]);
    }
    PK_SKY.doorF = (PK_SKY.doorF || 0) + (want - (PK_SKY.doorF || 0)) * Math.min(1, dt * 2.2);
    var f = PK_SKY.doorF;
    (PK_SKY.leaves || []).forEach(function (L) { L.g.position.x = L.x0 + L.dir * 0.6 * f; });
    PK_SKY_ST.forEach(function (st, i) { var ff = i === PK_SKY.at ? f : 0; (st.gates || []).forEach(function (G) { G.g.position.z = G.z0 + G.dir * 0.7 * ff; }); });
  }
  animate(pkSkyTick);

  var _pkSkyPrevT2 = GAME.T;
  GAME.T = function () {
    var o = _pkSkyPrevT2();
    o.PK_SKY = PK_SKY; o.PK_SKY_ST = PK_SKY_ST; o.PK_SKY_FLOORS = PK_SKY_FLOORS; o.PK_SKY_TOP = PK_SKY_TOP;
    o.pkSkyFloorAt = pkSkyFloorAt; o.pkGuestFloor = pkGuestFloor; o.pkSkyAt = pkSkyAt; o.pkSkySOf = pkSkySOf; o.pkSkyLine = pkSkyLine;
    o.pkSkylineTick = pkSkylineTick; o.pkSkyFrac = pkSkyFrac; o.pkSkyBuild = pkSkyBuild; o.pkSkyPlace = pkSkyPlace;
    o.pkSkyLiftGo = pkSkyLiftGo; o.pkSkyLift = function () { return PK_SKY_LIFT; };
    o.pkSkyDrvEnter = pkSkyDrvEnter; o.pkSkyDrvKey = pkSkyDrvKey; o.pkSkyDrvDir = pkSkyDrvDir; o.pkSkyDrvDoors = pkSkyDrvDoors; o.pkSkyDrvLeave = pkSkyDrvLeave; o.pkSkyDrv = function () { return PK_SKY_DRV; }; o.pkSkyNear = pkSkyNear; o.pkSkyMarkText = pkSkyMarkText;
    return o;
  };
