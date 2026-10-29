//@ Park Co, part 46: the world past the railway, and the park growing into it. The ground now runs out to 550 m and the eye
//@ sees 620 m. Round the whole park, just outside the line, runs the expansion site: a band of land being cleared and built,
//@ fenced off with site fencing, so nobody walks into it. Trees felled to stumps and log stacks, earth stripped, spoil heaps,
//@ building shells in scaffolding, a new ride's steel going up, cranes, diggers, dump trucks, a site village, workers.
//@ Across the park runs the new railway on a viaduct, in every stage of building from the bare pile cap to the laid track. It
//@ crosses over the Lindenburg Railway twice, the Dark Woods street and the road, and never joins any of them: its own ends
//@ stop at buffer stops in the site. Past the site: the town of Lindenburg along the road west, farms and wind turbines east,
//@ a lake south, forest everywhere else and low hills on the horizon.
//@ Every placement asks pkXpFree first: clear of the railway (and its stations, depot and crossings), the road and the park.

  // ── Where things may go ──────────────────────────────────────────
  var PK_XP = { built: false, dyn: [], rng: null, mats: {} };
  // the signed distance from the railway's centre line: a rounded rectangle (part 40), negative inside it
  function pkXpRingD(x, z) {
    var W = -128, E = 170, N = -134, S = 112, R = 24, cx0 = W + R, cx1 = E - R, cz0 = N + R, cz1 = S - R;
    var qx = Math.max(cx0 - x, 0, x - cx1), qz = Math.max(cz0 - z, 0, z - cz1);
    if (qx > 0 && qz > 0) return Math.hypot(qx, qz) - R;
    if (qx > 0 || qz > 0) return Math.max(qx, qz) - R;
    return -Math.min(x - W, E - x, z - N, S - z);
  }
  var PK_XP_STATIONS = [[-128, 34], [-62, -134], [170, -2], [95, 112]];
  // a spot outside the ring that keeps clear of the line, its stations, the depot, the crossings' roads and footpath
  function pkXpFree(x, z, m) {
    m = m || 0;
    var d = pkXpRingD(x, z);
    if (d < 8 + m) return false;
    if (Math.abs(z - 76) < 7 + m) return false;
    for (var i = 0; i < PK_XP_STATIONS.length; i++) { var s = PK_XP_STATIONS[i]; if (Math.abs(x - s[0]) < 36 + m && Math.abs(z - s[1]) < 36 + m) return false; }
    if (x > 8 - m && x < 112 + m && z > -172 - m && z < -120) return false;           // the depot and its siding
    if (Math.abs(x + 17) < 6 + m && z < -120 && z > -158) return false;              // Windmill Halt's footpath out to the viewing platform
    return true;
  }
  // the expansion site: a band 10 to 50 m outside the line, wherever it is free
  function pkXpBand(x, z) { var d = pkXpRingD(x, z); return d > 10 && d < 50 && pkXpFree(x, z, 0); }
  // the town, the farms, the lake: their own ground, no forest on it
  function pkXpTown(x, z) { return x < -186 && x > -460 && z > 14 && z < 176; }
  function pkXpFarm(x, z) { return x > 222 && x < 500 && z > -330 && z < 330 && Math.abs(z - 76) > 6; }
  function pkXpLake(x, z) { return Math.hypot((x - 95) / 70, (z - 236) / 44) < 1.08; }
  // the viaduct's line across the park (north to south), and how near a spot is to it
  var PK_XP_VIA = [[-67, -178], [-67, 34], [-74, 52], [-90, 70], [-108, 86], [-112, 100], [-112, 152]];
  function pkXpViaNear(x, z, w) {
    for (var i = 0; i < PK_XP_VIA.length - 1; i++) { var A = PK_XP_VIA[i], B = PK_XP_VIA[i + 1]; if (pkSegDist(x, z, A[0], A[1], B[0], B[1]) < w) return true; }
    return false;
  }
  // what the forest keeps clear of (part 12 asks this): the site is felled, the viaduct's line is cleared, the town, the
  // farms and the lake stand on open ground
  function pkXpClear(x, z) { return pkXpBand(x, z) || pkXpViaNear(x, z, 6) || pkXpTown(x, z) || pkXpFarm(x, z) || pkXpLake(x, z); }
  // a point a given distance outside the line, by its distance round it (t, 0..1), and the way round there
  function pkXpRingPt(t, off) {
    var W = -128, E = 170, N = -134, S = 112, R = 24, r = R + off, L1 = E - W - 2 * R, L2 = S - N - 2 * R, q = Math.PI / 2 * r, P = 2 * (L1 + L2) + 4 * q;
    var s = ((t % 1) + 1) % 1 * P, segs = [
      function (u) { return [W + R + u, N - off, 1, 0]; }, L1,
      function (u) { var a = -Math.PI / 2 + u / r; return [E - R + Math.cos(a) * r, N + R + Math.sin(a) * r, -Math.sin(a), Math.cos(a)]; }, q,
      function (u) { return [E + off, N + R + u, 0, 1]; }, L2,
      function (u) { var a = u / r; return [E - R + Math.cos(a) * r, S - R + Math.sin(a) * r, -Math.sin(a), Math.cos(a)]; }, q,
      function (u) { return [E - R - u, S + off, -1, 0]; }, L1,
      function (u) { var a = Math.PI / 2 + u / r; return [W + R + Math.cos(a) * r, S - R + Math.sin(a) * r, -Math.sin(a), Math.cos(a)]; }, q,
      function (u) { return [W - off, S - R - u, 0, -1]; }, L2,
      function (u) { var a = Math.PI + u / r; return [W + R + Math.cos(a) * r, N + R + Math.sin(a) * r, -Math.sin(a), Math.cos(a)]; }, q
    ];
    for (var k = 0; k < segs.length; k += 2) { if (s <= segs[k + 1]) return segs[k](s); s -= segs[k + 1]; }
    return segs[0](0);
  }
  function pkXpPerim(off) { var R = 24 + off; return 2 * (298 - 48 + 246 - 48) + 2 * Math.PI * R; }

  // ── Materials and small kit ──────────────────────────────────────
  function XM(def) { var k = JSON.stringify(def); return PK_XP.mats[k] || (PK_XP.mats[k] = std(def)); }
  function pkXpM() {
    if (PK_XP.M) return PK_XP.M;
    var K = pkMats();
    var dirtT = tex(256, 256, function (c, W, H) { c.fillStyle = '#7a5f42'; c.fillRect(0, 0, W, H); for (var i = 0; i < 2600; i++) { c.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '40,28,16' : '160,130,96') + ',' + randf(0.08, 0.3) + ')'; c.fillRect(Math.random() * W, Math.random() * H, randf(1, 5), randf(1, 4)); } for (var t = 0; t < 14; t++) { c.strokeStyle = 'rgba(50,34,20,0.35)'; c.lineWidth = randf(3, 7); var y = Math.random() * H; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(W * 0.3, y + randf(-20, 20), W * 0.7, y + randf(-20, 20), W, y + randf(-10, 10)); c.stroke(); } }, 6, 6);
    var meshT = tex(64, 64, function (c, W, H) { c.clearRect(0, 0, W, H); c.strokeStyle = 'rgba(200,205,210,0.95)'; c.lineWidth = 2; for (var i = 0; i <= W; i += 8) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, H); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(W, i); c.stroke(); } }, 1, 1);
    var netT = tex(128, 128, function (c, W, H) { c.clearRect(0, 0, W, H); c.fillStyle = 'rgba(46,122,70,0.62)'; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'destination-out'; c.fillStyle = 'rgba(0,0,0,0.75)'; for (var y = 1; y < H; y += 4) for (var x = 1; x < W; x += 4) c.fillRect(x, y, 2, 2); c.globalCompositeOperation = 'source-over'; c.fillStyle = 'rgba(30,90,50,0.8)'; c.fillRect(0, 0, W, 3); c.fillRect(0, 0, 3, H); }, 1, 1);
    var bannerT = tex(1024, 256, function (c, W, H) { c.fillStyle = '#1b232c'; c.fillRect(0, 0, W, H); c.fillStyle = '#f5b53d'; c.fillRect(0, 0, W, 18); c.fillRect(0, H - 18, W, 18); c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 86px Bahnschrift, Arial, sans-serif'; c.fillText('PARK CO IS GROWING', W / 2, 96); c.fillStyle = '#e8e4d8'; c.font = '600 44px Bahnschrift, Arial, sans-serif'; c.fillText('A NEW LAND  ·  A NEW LINE  ·  OPENING SOON', W / 2, 180); });
    var cropT = function (a, b) { return std({ roughness: 1, map: tex(128, 128, function (c, W, H) { c.fillStyle = a; c.fillRect(0, 0, W, H); c.fillStyle = b; for (var y = 0; y < H; y += 8) c.fillRect(0, y, W, 3); for (var i = 0; i < 400; i++) { c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(Math.random() * W, Math.random() * H, 2, 2); } }, 30, 30) }); };
    PK_XP.M = {
      dirt: std({ map: dirtT, color: 0xffffff, roughness: 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
      dirtDark: std({ map: dirtT, color: 0xb09078, roughness: 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
      spoil: std({ map: dirtT, color: 0xc8a888, roughness: 1 }), gravel: std({ color: 0x8a8580, roughness: 1 }),
      heras: std({ map: meshT, color: 0xffffff, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.6 }),
      herasFoot: std({ color: 0x6a6f74, roughness: 0.7 }), net: std({ map: netT, transparent: true, side: THREE.DoubleSide, roughness: 0.9, depthWrite: false }),
      banner: std({ map: bannerT, roughness: 0.8, side: THREE.DoubleSide }),
      concrete: std({ map: TEX.plaster, color: 0xb8b4ac, roughness: 0.95 }), concreteDark: std({ map: TEX.plaster, color: 0x8f8b84, roughness: 0.95 }),
      tube: std({ color: 0xa8b0b6, roughness: 0.4, metalness: 0.8 }), plank: std({ color: 0xb08a50, roughness: 0.85 }),
      yellow: std({ color: 0xf0b41e, roughness: 0.45, metalness: 0.2 }), yellowDark: std({ color: 0xa87a10, roughness: 0.6 }),
      orange: std({ color: 0xe0702a, roughness: 0.5 }), red: std({ color: 0xb8362b, roughness: 0.5 }), white: std({ color: 0xeceae4, roughness: 0.6 }),
      black: std({ color: 0x1b1d20, roughness: 0.7 }), steel: std({ color: 0x5a6068, roughness: 0.45, metalness: 0.7 }), rust: std({ color: 0x8a4a2a, roughness: 0.8, metalness: 0.3 }),
      glass: std({ color: 0x223344, roughness: 0.1, metalness: 0.5 }), cabin: std({ color: 0xe8e4d8, roughness: 0.6 }), cabinBlue: std({ color: 0x2f5f9e, roughness: 0.6 }),
      bark: K.treeBark || std({ color: 0x6a4a30, roughness: 0.95 }), wood: std({ color: 0xc8a070, roughness: 0.85 }), woodEnd: std({ color: 0xdcb880, roughness: 0.8 }),
      brush: std({ color: 0x5a6a30, roughness: 1 }), hivis: std({ color: 0xd8ef2a, roughness: 0.6, emissive: 0x1a1f00, emissiveIntensity: 0.3 }),
      lamp: glowMat(0xfff0c8, 1.4), beacon: pkThGlow(0xff9020, 0.0),
      asphalt: pkAsphalt(), line: MAT.whiteLine,
      roofRed: std({ color: 0x9a3a2a, roughness: 0.8 }), roofSlate: std({ color: 0x4a4f58, roughness: 0.8 }), brick: pkMatBrick(), cream: std({ map: TEX.plaster, color: 0xefe3c8, roughness: 0.9 }),
      plaster: std({ map: TEX.plaster, color: 0xf4f1e8, roughness: 0.9 }), win: std({ color: 0x2a3440, roughness: 0.2, metalness: 0.4, emissive: 0xffc46a, emissiveIntensity: 0.0 }),
      door: std({ color: 0x3a5a3a, roughness: 0.7 }), green: std({ color: 0x2f6a3a, roughness: 0.7 }),
      field: [cropT('#c8b050', '#b09840'), cropT('#6a9a3a', '#5a8a30'), cropT('#8a6a3a', '#7a5a30'), cropT('#a8c060', '#98b050'), cropT('#d8c890', '#c8b878')],
      hedge: std({ color: 0x3a6a30, roughness: 1 }), hill: std({ color: 0x5a7a54, roughness: 1 }), hillFar: std({ color: 0x6f8aa0, roughness: 1 }),
      water: K.water, reed: std({ color: 0x8a9a4a, roughness: 1 })
    };
    return PK_XP.M;
  }
  function pkXpDyn(parent) { var g = new THREE.Group(); g.userData.dynamic = true; (parent || scene).add(g); return g; }
  function pkXpGroup(x, z, ry) { var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; scene.add(g); return g; }
  // a footprint (w, d) at (x, z) turned ry: is every corner and the middle free?
  function pkXpFits(x, z, w, d, ry, test) {
    var c = Math.cos(ry || 0), s = Math.sin(ry || 0), pts = [[0, 0], [-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]];
    for (var i = 0; i < pts.length; i++) { var px = x + pts[i][0] * c + pts[i][1] * s, pz = z - pts[i][0] * s + pts[i][1] * c; if (!(test || pkXpBand)(px, pz) || (!test && pkXpViaNear(px, pz, 9))) return false; }
    return true;
  }

  // ── The site's kit ───────────────────────────────────────────────
  // a run of site fencing (Heras panels on their concrete feet), solid to walk into, with a banner now and then
  function pkXpFenceRun(pts, solidIt, bannerEvery) {
    var M = pkXpM(), run = null;
    for (var i = 0; i < pts.length - 1; i++) {
      var A = pts[i], B = pts[i + 1], L = Math.hypot(B[0] - A[0], B[1] - A[1]); if (L < 0.5) continue;
      var ang = Math.atan2(B[1] - A[1], B[0] - A[0]), mx = (A[0] + B[0]) / 2, mz = (A[1] + B[1]) / 2;
      var g = pkXpGroup(mx, mz, -ang);
      box(L, 1.95, 0.03, M.heras, 0, 1.08, 0, g);
      box(L, 0.04, 0.04, M.tube, 0, 2.06, 0, g); box(L, 0.04, 0.04, M.tube, 0, 0.12, 0, g);
      box(0.04, 2.0, 0.04, M.tube, -L / 2, 1.06, 0, g);
      box(0.6, 0.12, 0.22, M.herasFoot, -L / 2, 0.06, 0, g);
      if (bannerEvery && i % bannerEvery === 0 && L > 3) box(L - 0.2, 0.9, 0.012, M.banner, 0, 1.3, 0.03, g);
      if (solidIt) {
        var x0 = Math.min(A[0], B[0]), x1 = Math.max(A[0], B[0]), z0 = Math.min(A[1], B[1]), z1 = Math.max(A[1], B[1]), axis = (x1 - x0) < 0.3 ? 'z' : (z1 - z0) < 0.3 ? 'x' : '';
        if (run && axis && run.axis === axis && Math.abs((axis === 'z' ? x0 : z0) - run.at) < 0.3) { run.x0 = Math.min(run.x0, x0); run.x1 = Math.max(run.x1, x1); run.z0 = Math.min(run.z0, z0); run.z1 = Math.max(run.z1, z1); }
        else { flush(); run = { axis: axis, at: axis === 'z' ? x0 : z0, x0: x0, x1: x1, z0: z0, z1: z1 }; if (!axis) flush(); }
      }
    }
    flush();
    function flush() { if (run) solid(run.x0 - 0.12, run.x1 + 0.12, run.z0 - 0.12, run.z1 + 0.12, 0, 2.1); run = null; }
  }
  // a tree's stump, cut level, with its rings showing
  function pkXpStump(x, z, s) { var M = pkXpM(), g = pkXpGroup(x, z, Math.random() * 6); pkRoundCyl(0.32 * s, 0.45 * s, M.bark, 0, 0.22 * s, 0, g, 9); pkRoundCyl(0.3 * s, 0.02, M.woodEnd, 0, 0.455 * s, 0, g, 9); return g; }
  // a stack of felled trunks on their bearers
  function pkXpLogs(x, z, ry, n) {
    var M = pkXpM(), g = pkXpGroup(x, z, ry); n = n || 9;
    [-2.2, 2.2].forEach(function (b) { box(0.2, 0.2, 2.6, M.wood, b, 0.1, 0, g); });
    var row = 0, k = 0;
    while (k < n) { var inRow = Math.max(1, 4 - row); for (var q = 0; q < inRow && k < n; q++, k++) { var lz = (q - (inRow - 1) / 2) * 0.62, ly = 0.5 + row * 0.53; var lg = pkRoundCyl(0.3, 6.2, M.bark, 0, ly, lz, g, 10); lg.rotation.z = Math.PI / 2; [-1, 1].forEach(function (e) { var en = pkRoundCyl(0.29, 0.02, M.woodEnd, e * 3.11, ly, lz, g, 10); en.rotation.z = Math.PI / 2; }); } row++; }
    return g;
  }
  function pkXpBrush(x, z, s) {
    var M = pkXpM(), g = pkXpGroup(x, z, Math.random() * 6), dead = XM({ color: 0x7a7a3a, roughness: 1 });
    for (var b = 0; b < 22; b++) {
      var L = randf(1.6, 3.4) * s, br = pkRoundCyl(randf(0.04, 0.09) * s, L, M.bark, randf(-1.2, 1.2) * s, randf(0.15, 1.0) * s, randf(-0.9, 0.9) * s, g, 5);
      br.rotation.set(randf(-0.6, 0.6), randf(0, 6.28), Math.PI / 2 + randf(-0.5, 0.5));
      if (b % 3 === 0) { var tw = pkRoundCyl(0.025 * s, L * 0.4, M.bark, br.position.x, br.position.y + 0.2 * s, br.position.z, g, 4); tw.rotation.set(randf(-1, 1), 0, randf(-1, 1)); }
    }
    for (var l = 0; l < 7; l++) { var lf = new THREE.Mesh(new THREE.IcosahedronGeometry(randf(0.25, 0.5) * s, 0), l % 2 ? dead : M.brush); lf.position.set(randf(-1.1, 1.1) * s, randf(0.4, 1.1) * s, randf(-0.8, 0.8) * s); lf.scale.y = 0.6; g.add(lf); }
    return g;
  }
  function pkXpSpoil(x, z, r, h) {
    var M = pkXpM(), geo = new THREE.IcosahedronGeometry(1, 2), p = geo.attributes.position, seed = Math.abs(Math.round(x * 7 + z * 13));
    for (var i = 0; i < p.count; i++) { var vx = p.getX(i), vy = p.getY(i), vz = p.getZ(i), n = 1 + 0.16 * Math.sin(vx * 5.1 + seed) * Math.cos(vz * 4.3 + seed * 0.7) + 0.08 * Math.sin(vy * 9 + vx * 3); if (vy < 0) vy = 0; p.setXYZ(i, vx * n, vy * n, vz * n); }
    geo.computeVertexNormals();
    var m = new THREE.Mesh(geo, M.spoil); m.scale.set(r, h, r * randf(0.7, 1.15)); m.position.set(x, -0.05, z); m.rotation.y = seed; m.castShadow = true; scene.add(m);
    for (var k = 0; k < 5; k++) { var a = k * 1.3 + seed, cl = new THREE.Mesh(new THREE.DodecahedronGeometry(randf(0.2, 0.45), 0), M.spoil); cl.position.set(x + Math.cos(a) * r * 1.05, 0.1, z + Math.sin(a) * r * 1.05); scene.add(cl); }
    return m;
  }
  // a site cabin, stackable, with its window and door, and a sign
  function pkXpCabin(x, z, ry, y0, label, blue) {
    var M = pkXpM(), g = pkXpGroup(x, z, ry); g.position.y = y0 || 0;
    pkBevelBox(6.0, 2.6, 2.4, blue ? M.cabinBlue : M.cabin, 0, 1.3, 0, g, 0.04);
    box(6.1, 0.1, 2.5, M.steel, 0, 2.65, 0, g);
    box(0.9, 2.0, 0.05, M.door, -2.0, 1.05, 1.22, g);
    [0.2, 1.6].forEach(function (wx) { box(1.0, 0.8, 0.05, M.win, wx, 1.7, 1.22, g); });
    if (label) sign([label], 1.7, 0.34, 1.0, 2.35, 1.24, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);
    return g;
  }
  function pkXpCabinStair(x, z, ry) {
    var M = pkXpM(), g = pkXpGroup(x, z, ry), stl = XM({ color: 0x5a6068, roughness: 0.5, metalness: 0.6 });
    for (var i = 0; i < 12; i++) box(1.0, 0.05, 0.3, stl, 3.6 + i * 0.25 * 0, 0.22 * (i + 1), 1.2 + 1.3 - i * 0.22 + 0.0, g);
    [-0.5, 0.5].forEach(function (o) { pkRod(3.6 + o, 0, 2.5, 3.6 + o, 2.7, -0.2, 0.04, stl, g, 4); pkRod(3.6 + o, 1.0, 2.5, 3.6 + o, 3.7, -0.2, 0.025, stl, g, 4); });
    box(1.2, 0.06, 1.6, stl, 3.6, 2.7, -0.6, g);
    [[3.05, -1.4], [4.15, -1.4], [3.05, 0.2], [4.15, 0.2]].forEach(function (c) { pkRoundCyl(0.03, 2.7, stl, c[0], 1.35, c[1], g, 5); });
    box(0.04, 0.04, 1.6, stl, 4.18, 3.7, -0.6, g); box(1.2, 0.04, 0.04, stl, 3.6, 3.7, -1.4, g);
    return g;
  }
  function pkXpContainer(x, z, ry, col) { var M = pkXpM(), g = pkXpGroup(x, z, ry), m = XM({ color: col, roughness: 0.6, metalness: 0.3 }); pkBevelBox(6.06, 2.59, 2.44, m, 0, 1.3, 0, g, 0.03); for (var r = -2.6; r <= 2.6; r += 0.35) box(0.06, 2.3, 2.5, m, r, 1.3, 0, g); return g; }
  // a builder's skip: a steel floor, trapezoid sides, sloped ends, a rim, the chain lugs, and a heap of earth in it
  function pkXpSkip(x, z, ry) {
    var M = pkXpM(), g = pkXpGroup(x, z, ry), L0 = 2.3, L1 = 3.5, H = 1.25, Wd = 1.7, y0 = 0.12;
    box(L0, 0.08, Wd, M.yellow, 0, y0, 0, g);
    [-1, 1].forEach(function (s) { box(0.12, 0.12, Wd - 0.1, M.black, s * (L0 / 2 - 0.3), 0.06, 0, g); });
    var tz = new THREE.Shape(); tz.moveTo(-L0 / 2, 0); tz.lineTo(L0 / 2, 0); tz.lineTo(L1 / 2, H); tz.lineTo(-L1 / 2, H); tz.closePath();
    var side = new THREE.ExtrudeGeometry(tz, { depth: 0.06, bevelEnabled: false });
    [-1, 1].forEach(function (s) { var m = new THREE.Mesh(side, M.yellow); m.position.set(0, y0, s * Wd / 2 - (s > 0 ? 0.06 : 0)); m.castShadow = true; g.add(m); });
    var slant = Math.atan2((L1 - L0) / 2, H), endL = Math.hypot((L1 - L0) / 2, H);
    [-1, 1].forEach(function (s) { var e = box(0.06, endL, Wd, M.yellow, s * (L0 + L1) / 4, y0 + H / 2, 0, g); e.rotation.z = -s * slant; });
    [-1, 1].forEach(function (s) { box(L1 + 0.04, 0.08, 0.1, M.yellowDark, 0, y0 + H, s * Wd / 2, g); box(0.1, 0.08, Wd, M.yellowDark, s * L1 / 2, y0 + H, 0, g); });
    [-1, 1].forEach(function (sx) { [-1, 1].forEach(function (sz) { var lug = pkRoundCyl(0.08, 0.12, M.steel, sx * (L0 / 2 + 0.25), y0 + H * 0.55, sz * (Wd / 2 + 0.06), g, 10); lug.rotation.x = Math.PI / 2; }); });
    box(0.5, 0.25, 0.02, M.black, 0, y0 + H * 0.55, Wd / 2 + 0.035, g); box(0.5, 0.25, 0.02, M.black, 0, y0 + H * 0.55, -Wd / 2 - 0.035, g);
    box(L0 + 0.6, 0.6, Wd - 0.14, M.spoil, 0, y0 + H - 0.42, 0, g);
    var heap = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.spoil); heap.scale.set(1.45, 0.55, 0.75); heap.position.set(0.15, y0 + H - 0.12, 0); heap.castShadow = true; g.add(heap);
    return g;
  }
  function pkXpToilet(x, z, ry) {
    var M = pkXpM(), g = pkXpGroup(x, z, ry), blue = XM({ color: 0x2f7fbf, roughness: 0.5 });
    pkBevelBox(1.15, 0.12, 1.15, M.black, 0, 0.06, 0, g, 0.03);
    pkBevelBox(1.1, 2.15, 1.1, blue, 0, 1.2, 0, g, 0.05);
    var roof = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.62, 0.18, 4, 1), M.white); roof.rotation.y = Math.PI / 4; roof.position.y = 2.36; g.add(roof);
    box(0.84, 1.9, 0.04, XM({ color: 0x276ba5, roughness: 0.5 }), 0, 1.15, 0.56, g);
    [-0.38, 0.38].forEach(function (hx) { box(0.04, 1.8, 0.03, M.white, hx, 1.15, 0.58, g); });
    box(0.12, 0.06, 0.04, M.steel, 0.3, 1.1, 0.6, g); box(0.16, 0.05, 0.02, XM({ color: 0xc8362b }), 0.3, 1.25, 0.59, g);
    pkRoundCyl(0.05, 0.5, M.black, -0.42, 2.5, -0.42, g, 6);
    for (var v = 0; v < 3; v++) box(0.5, 0.03, 0.02, M.white, 0, 2.0 - v * 0.06, 0.56, g);
    return g;
  }
  function pkXpPipes(x, z, ry) { var M = pkXpM(), g = pkXpGroup(x, z, ry); for (var r = 0; r < 3; r++) for (var c = 0; c < 4 - r; c++) { var p = pkRoundCyl(0.45, 5, XM({ color: 0x8a8f94, roughness: 0.8 }), 0, 0.45 + r * 0.8, (c - (3 - r) / 2) * 0.92, g, 14); p.rotation.z = Math.PI / 2; } return g; }
  function pkXpBeams(x, z, ry) { var M = pkXpM(), g = pkXpGroup(x, z, ry); for (var r = 0; r < 4; r++) for (var c = 0; c < 3; c++) { var y = 0.2 + r * 0.32, zz = (c - 1) * 0.5; box(7, 0.04, 0.3, M.rust, 0, y + 0.14, zz, g); box(7, 0.04, 0.3, M.rust, 0, y - 0.14, zz, g); box(7, 0.28, 0.03, M.rust, 0, y, zz, g); } [-2.5, 2.5].forEach(function (b) { box(0.2, 0.15, 1.8, M.wood, b, 0.05, 0, g); }); return g; }
  function pkXpPallets(x, z, ry) { var M = pkXpM(), g = pkXpGroup(x, z, ry); for (var i = 0; i < 4; i++) { box(1.2, 0.14, 1.0, M.wood, (i % 2) * 1.3, 0.07 + Math.floor(i / 2) * 1.1, 0, g); box(1.1, 0.9, 0.9, XM({ color: [0xc8c0b0, 0xa83a2a, 0xd8d0c0][i % 3], roughness: 0.9 }), (i % 2) * 1.3, 0.6 + Math.floor(i / 2) * 1.1, 0, g); } return g; }
  // a floodlight tower: a mast, a lamp bar that glows at night
  function pkXpFlood(x, z, ry) { var M = pkXpM(), g = pkXpGroup(x, z, ry); pkBevelBox(1.4, 0.6, 2.2, M.yellow, 0, 0.3, 0, g, 0.05); pkRoundCyl(0.1, 8, M.steel, 0, 4.3, 0, g, 8); for (var i = 0; i < 4; i++) { box(0.5, 0.4, 0.2, M.black, -0.75 + i * 0.5, 8.3, 0.1, g); box(0.42, 0.32, 0.02, M.lamp, -0.75 + i * 0.5, 8.3, 0.21, g); } return g; }
  // a worker in hard hat and hi-vis; some stand and look, some walk a beat
  function pkXpWorker(x, z, ry, beat) {
    var M = pkXpM(), hat = XM({ color: [0xf0c04a, 0xffffff, 0xe0702a][Math.floor(Math.random() * 3)], roughness: 0.4 });
    var g = makeHuman({ key: 'site:' + Math.round(x) + ',' + Math.round(z), shirt: std({ map: TEX.cloth, color: 0x2a3a5a, roughness: 0.9 }), pants: std({ map: TEX.cloth, color: 0x2a2d33, roughness: 0.9 }), vest: M.hivis, hardhat: hat, noBeard: Math.random() < 0.6 });
    g.userData.dynamic = true; g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
    PK_XP.dyn.push({ kind: 'worker', g: g, a: [x, z], b: beat ? [x + beat[0], z + beat[1]] : null, t: Math.random(), dir: 1 });
    return g;
  }

  // ── The machines ─────────────────────────────────────────────────
  // an excavator: tracks, a turning house with its cab, the boom, the stick and the bucket that dig and swing
  function pkXpExcavator(x, z, ry) {
    var M = pkXpM(), g = pkXpGroup(x, z, ry);
    [-1.1, 1.1].forEach(function (s) { pkBevelBox(0.7, 0.8, 4.0, M.black, s, 0.4, 0, g, 0.25); });
    pkRoundCyl(0.8, 0.3, M.steel, 0, 0.95, 0, g, 16);
    var house = pkXpDyn(g); house.position.y = 1.1;
    pkBevelBox(2.6, 1.3, 3.0, M.yellow, 0, 0.65, -0.3, house, 0.08);
    pkBevelBox(1.0, 1.5, 1.2, M.yellow, 0.75, 1.9, 0.6, house, 0.06); box(0.9, 1.0, 1.0, M.glass, 0.75, 2.0, 0.62, house);
    box(2.4, 0.9, 0.8, M.yellowDark, 0, 0.6, -1.9, house);
    var boom = new THREE.Group(); boom.position.set(-0.3, 1.1, 1.1); house.add(boom);
    pkBevelBox(0.45, 0.5, 3.6, M.yellow, 0, 0, 1.8, boom, 0.06);
    var stick = new THREE.Group(); stick.position.set(0, 0, 3.6); boom.add(stick);
    pkBevelBox(0.35, 0.4, 2.6, M.yellow, 0, 0, 1.3, stick, 0.05);
    var bucket = new THREE.Group(); bucket.position.set(0, 0, 2.6); stick.add(bucket);
    pkBevelBox(0.9, 0.6, 0.7, M.steel, 0, -0.2, 0.2, bucket, 0.08);
    PK_XP.dyn.push({ kind: 'dig', house: house, boom: boom, stick: stick, bucket: bucket, t: Math.random() * 10, x: x, z: z });
  }
  // a dump truck that runs a haul road between two points, loaded one way and empty back
  function pkXpTruck(ax, az, bx, bz) {
    var M = pkXpM(), g = pkXpDyn();
    [[-0.9, 1.6], [0.9, 1.6], [-0.9, -0.6], [0.9, -0.6], [-0.9, -1.8], [0.9, -1.8]].forEach(function (w) { var wh = pkRoundCyl(0.55, 0.45, M.black, w[0], 0.55, w[1], g, 12); wh.rotation.z = Math.PI / 2; });
    pkBevelBox(2.2, 0.4, 5.2, M.steel, 0, 0.9, 0, g, 0.05);
    pkBevelBox(2.2, 1.6, 1.6, M.orange, 0, 1.9, 2.0, g, 0.1); box(2.0, 0.7, 0.05, M.glass, 0, 2.2, 2.82, g);
    var bed = new THREE.Group(); bed.position.set(0, 1.2, -1.9); g.add(bed);
    pkBevelBox(2.4, 1.3, 3.4, M.orange, 0, 0.65, 1.5, bed, 0.06);
    var load = box(2.1, 0.5, 3.0, M.spoil, 0, 1.25, 1.5, bed);
    PK_XP.dyn.push({ kind: 'truck', g: g, bed: bed, load: load, a: [ax, az], b: [bx, bz], t: Math.random(), dir: 1, wait: 0 });
  }
  function pkXpDozer(x, z, ry) { var M = pkXpM(), g = pkXpGroup(x, z, ry); [-1, 1].forEach(function (s) { pkBevelBox(0.6, 0.9, 3.4, M.black, s * 1.1, 0.45, 0, g, 0.25); }); pkBevelBox(2.0, 1.2, 2.6, M.yellow, 0, 1.35, -0.2, g, 0.08); pkBevelBox(1.4, 1.2, 1.3, M.yellow, 0, 2.5, -0.6, g, 0.06); box(1.3, 0.9, 1.2, M.glass, 0, 2.6, -0.6, g); var bl = box(3.4, 1.2, 0.2, M.steel, 0, 0.7, 2.1, g); bl.rotation.x = -0.2; }
  function pkXpRoller(x, z, ry) {
    var M = pkXpM(), g = pkXpGroup(x, z, ry);
    var d = pkRoundCyl(0.75, 1.9, M.steel, 0, 0.75, 1.5, g, 18); d.rotation.z = Math.PI / 2;
    box(2.1, 0.3, 0.4, M.yellow, 0, 1.55, 1.5, g); [-1, 1].forEach(function (s2) { box(0.12, 1.2, 1.6, M.yellow, s2 * 1.02, 1.0, 1.5, g); });
    pkBevelBox(1.8, 1.0, 2.2, M.yellow, 0, 1.0, -0.7, g, 0.08);
    [-1, 1].forEach(function (s2) { var w = pkRoundCyl(0.6, 0.45, M.black, s2 * 0.75, 0.6, -1.2, g, 14); w.rotation.z = Math.PI / 2; });
    box(0.5, 0.12, 0.5, M.black, 0, 1.6, -0.5, g); box(0.5, 0.5, 0.1, M.black, 0, 1.85, -0.75, g);
    pkRod(0, 1.5, 0.05, 0, 1.95, -0.1, 0.03, M.black, g, 5); var wh = pkRoundCyl(0.18, 0.03, M.black, 0, 1.97, -0.12, g, 12); wh.rotation.x = 0.6;
    [[-0.8, 0.2], [0.8, 0.2], [-0.8, -1.6], [0.8, -1.6]].forEach(function (c) { box(0.06, 1.5, 0.06, M.black, c[0], 2.25, c[1], g); });
    pkBevelBox(1.9, 0.1, 2.1, M.yellow, 0, 3.0, -0.7, g, 0.04);
    var bc = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), M.beacon); bc.position.set(0.6, 3.12, -1.5); g.add(bc);
  }
  function pkXpMixer(x, z, ry) { var M = pkXpM(), g = pkXpGroup(x, z, ry); pkBevelBox(2.3, 0.4, 7, M.steel, 0, 0.9, 0, g, 0.05); pkBevelBox(2.3, 1.8, 1.8, M.white, 0, 2.0, 2.6, g, 0.1); var dr = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.7, 4.0, 14), M.red); dr.rotation.x = Math.PI / 2 + 0.25; dr.position.set(0, 2.5, -0.9); g.add(dr); for (var w = -2.6; w <= 2.6; w += 2.6) [-1, 1].forEach(function (s) { var wh = pkRoundCyl(0.5, 0.4, M.black, s * 1.0, 0.5, w, g, 12); wh.rotation.z = Math.PI / 2; }); }
  // the forestry harvester: a long boom with the felling head, a log in its grip
  function pkXpHarvester(x, z, ry) { var M = pkXpM(), g = pkXpGroup(x, z, ry); for (var w = -1.6; w <= 1.6; w += 1.6) [-1, 1].forEach(function (s) { var wh = pkRoundCyl(0.65, 0.6, M.black, s * 1.2, 0.65, w, g, 14); wh.rotation.z = Math.PI / 2; }); pkBevelBox(2.2, 1.2, 4.6, XM({ color: 0x3a7a3a, roughness: 0.5 }), 0, 1.4, 0, g, 0.1); pkBevelBox(1.6, 1.4, 1.5, XM({ color: 0x3a7a3a, roughness: 0.5 }), 0, 2.6, 1.2, g, 0.08); box(1.5, 1.0, 1.4, M.glass, 0, 2.7, 1.25, g); pkRod(0, 2.2, 0.4, 0.6, 3.8, 4.6, 0.18, M.yellow, g, 8); pkRod(0.6, 3.8, 4.6, 0.8, 1.8, 7.2, 0.14, M.yellow, g, 8); pkBevelBox(0.8, 0.9, 0.8, M.orange, 0.8, 1.4, 7.4, g, 0.08); var lg = pkRoundCyl(0.28, 5, M.bark, 0.8, 1.0, 7.4, g, 10); lg.rotation.z = Math.PI / 2; }
  // a tower crane: base, mast, the turning jib with its counterweight, the trolley and a load that goes up and down
  function pkXpCrane(x, z, h, jib) {
    var M = pkXpM(), g = pkXpGroup(x, z, 0); h = h || 34; jib = jib || 32;
    box(4, 1, 4, M.concrete, 0, 0.5, 0, g);
    for (var y = 1; y < h; y += 2.4) { [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]].forEach(function (c) { box(0.12, 2.4, 0.12, M.yellow, c[0], y + 1.2, c[1], g); }); pkRod(-0.9, y, -0.9, 0.9, y + 2.4, -0.9, 0.04, M.yellow, g, 4); pkRod(0.9, y, 0.9, -0.9, y + 2.4, 0.9, 0.04, M.yellow, g, 4); pkRod(-0.9, y, 0.9, -0.9, y + 2.4, -0.9, 0.04, M.yellow, g, 4); pkRod(0.9, y, -0.9, 0.9, y + 2.4, 0.9, 0.04, M.yellow, g, 4); }
    var slew = pkXpDyn(g); slew.position.y = h;
    pkBevelBox(2.4, 2.2, 2.4, M.yellow, 0, 1.1, 0, slew, 0.05); box(1.6, 1.4, 1.4, M.glass, 1.4, 1.0, 0.8, slew);
    box(jib, 0.15, 1.2, M.yellow, jib / 2, 2.4, 0, slew); box(jib, 0.15, 0.15, M.yellow, jib / 2, 3.4, 0, slew);
    for (var j = 0; j < jib; j += 2) pkRod(j, 2.4, 0.55, j + 2, 3.4, 0, 0.04, M.yellow, slew, 4);
    box(12, 0.5, 1.0, M.yellow, -6, 2.4, 0, slew); box(2.4, 2.2, 1.6, M.concrete, -10.5, 1.4, 0, slew);
    pkRoundCyl(0.12, 6, M.yellow, 0, 6, 0, slew, 6); pkRod(0, 9, 0, jib * 0.7, 3.4, 0, 0.03, M.steel, slew, 4); pkRod(0, 9, 0, -11, 2.6, 0, 0.03, M.steel, slew, 4);
    var trolley = new THREE.Group(); trolley.position.set(jib * 0.6, 2.25, 0); slew.add(trolley); box(1.2, 0.4, 1.0, M.steel, 0, 0, 0, trolley);
    var hookG = new THREE.Group(); trolley.add(hookG);
    var cable = box(0.04, 1, 0.04, M.black, 0, -0.5, 0, hookG);
    var load = new THREE.Group(); hookG.add(load); box(0.4, 0.4, 0.4, M.red, 0, 0, 0, load); pkXpBeamLoad(load);
    var lamp = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), M.beacon); lamp.position.set(jib, 3.7, 0); slew.add(lamp);
    PK_XP.dyn.push({ kind: 'crane', slew: slew, trolley: trolley, cable: cable, load: load, h: h, jib: jib, t: Math.random() * 40, a0: Math.random() * 6, drop: 10 });
  }
  function pkXpBeamLoad(load) { var M = pkXpM(); for (var i = 0; i < 3; i++) box(6, 0.3, 0.3, M.rust, 0, -1.2 - i * 0.32, 0, load); pkRod(-2.5, -1.0, 0, 0, 0, 0, 0.02, M.black, load, 4); pkRod(2.5, -1.0, 0, 0, 0, 0, 0.02, M.black, load, 4); }
  // a crawler crane: tracks, a cab, a long lattice boom raised to a pier, a girder hanging off it
  function pkXpCrawler(x, z, ry, tx, tz, ty) {
    var M = pkXpM(), g = pkXpGroup(x, z, 0), all = new THREE.Group(); all.userData.pkXpVia = true; scene.add(all); scene.remove(g); all.add(g);
    var bodyG = new THREE.Group(); bodyG.rotation.y = Math.atan2(tx - x, tz - z); g.add(bodyG);   // the cab and the boom's foot face the girder it is lifting
    [-1.8, 1.8].forEach(function (s) { pkBevelBox(1.1, 1.2, 7, M.black, s, 0.6, 0, bodyG, 0.35); });
    pkBevelBox(4.4, 2.0, 5.5, XM({ color: 0xc8362b, roughness: 0.5 }), 0, 2.2, -0.5, bodyG, 0.1); box(1.4, 1.6, 1.6, M.glass, 1.6, 2.8, 2.0, bodyG);
    box(4.2, 1.6, 1.4, M.concrete, 0, 2.0, -3.6, bodyG);
    // the boom from the body to over the target
    var bx = x, by = 3.2, bz = z, dx = tx - bx, dz = tz - bz, dh = Math.hypot(dx, dz), top = new THREE.Vector3(tx - dx / dh * 1.2, ty + 6, tz - dz / dh * 1.2);
    for (var k = 0; k < 4; k++) { var ox = (k % 2 ? 0.6 : -0.6), oz = (k < 2 ? 0.6 : -0.6), px = -dz / dh * ox, pz = dx / dh * ox; pkRod(bx + px, by + oz * 0.5, bz + pz, top.x + px * 0.4, top.y + oz * 0.2, top.z + pz * 0.4, 0.07, XM({ color: 0xc8362b, roughness: 0.5 }), all, 5); }
    var n = 12; for (var q = 0; q < n; q++) { var f0 = q / n, f1 = (q + 1) / n; pkRod(bx + (top.x - bx) * f0, by + (top.y - by) * f0 + 0.3, bz + (top.z - bz) * f0, bx + (top.x - bx) * f1, by + (top.y - by) * f1 - 0.3, bz + (top.z - bz) * f1, 0.035, XM({ color: 0xc8362b, roughness: 0.5 }), all, 4); }
    pkRod(top.x, top.y, top.z, tx, ty + 1.6, tz, 0.03, M.black, all, 4);
    var gir = pkXpGroup(tx, tz, Math.atan2(dx, dz) + Math.PI / 2); gir.position.y = ty + 0.8; scene.remove(gir); all.add(gir);
    box(10, 1.2, 0.5, M.rust, 0, 0, 0, gir); box(10, 0.1, 1.2, M.rust, 0, 0.55, 0, gir); box(10, 0.1, 1.2, M.rust, 0, -0.55, 0, gir);
    pkRod(-4, 0.6, 0, 0, 0.8 + 0.8, 0, 0.02, M.black, gir, 4); pkRod(4, 0.6, 0, 0, 0.8 + 0.8, 0, 0.02, M.black, gir, 4);
  }
  // scaffolding round a box (x0..x1, z0..z1) up to h: standards, ledgers, boards at every lift, the green net on some faces
  function pkXpScaffold(x0, x1, z0, z1, h, nets) {
    var M = pkXpM(), lift = 2.0;
    var face = function (ax, az, bx, bz, net) {
      var L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 2.4));
      for (var i = 0; i <= n; i++) { var px = ax + (bx - ax) * i / n, pz = az + (bz - az) * i / n; pkRoundCyl(0.035, h, M.tube, px, h / 2, pz, scene, 5); }
      for (var y = lift; y <= h + 0.01; y += lift) { pkRod(ax, y, az, bx, y, bz, 0.03, M.tube, scene, 4); pkRod(ax, y + 1.0, az, bx, y + 1.0, bz, 0.025, M.tube, scene, 4); }
      for (var j = 0; j < n; j += 2) pkRod(ax + (bx - ax) * j / n, 0, az + (bz - az) * j / n, ax + (bx - ax) * (j + 1) / n, Math.min(h, lift * 2), az + (bz - az) * (j + 1) / n, 0.025, M.tube, scene, 4);
      if (net) { var ng = new THREE.PlaneGeometry(L, h), nuv = ng.attributes.uv; for (var q = 0; q < nuv.count; q++) nuv.setXY(q, nuv.getX(q) * L / 1.2, nuv.getY(q) * h / 1.2); var m = new THREE.Mesh(ng, M.net); m.position.set((ax + bx) / 2, h / 2, (az + bz) / 2); m.rotation.y = -Math.atan2(bz - az, bx - ax); scene.add(m); }
    };
    var o = 1.1; face(x0 - o, z0 - o, x1 + o, z0 - o, nets & 1); face(x1 + o, z0 - o, x1 + o, z1 + o, nets & 2); face(x1 + o, z1 + o, x0 - o, z1 + o, nets & 4); face(x0 - o, z1 + o, x0 - o, z0 - o, nets & 8);
    for (var y = lift; y <= h + 0.01; y += lift) { box(x1 - x0 + 2 * o, 0.05, 0.6, M.plank, (x0 + x1) / 2, y, z0 - o + 0.35); box(x1 - x0 + 2 * o, 0.05, 0.6, M.plank, (x0 + x1) / 2, y, z1 + o - 0.35); }
  }
  // a building shell going up: columns, floor slabs, a stair core, the top storey still only columns and rebar
  function pkXpShell(x, z, w, d, floors, ry, nets) {
    var M = pkXpM(), g = pkXpGroup(x, z, ry), fh = 3.6;
    box(w + 1, 0.4, d + 1, M.concrete, 0, 0.2, 0, g);
    for (var f = 0; f < floors; f++) {
      var y0 = 0.4 + f * fh, last = f === floors - 1;
      for (var cx = -w / 2; cx <= w / 2 + 0.01; cx += w / Math.round(w / 6)) for (var cz = -d / 2; cz <= d / 2 + 0.01; cz += d / Math.round(d / 6)) {
        box(0.5, last ? fh * 0.6 : fh, 0.5, M.concrete, cx, y0 + (last ? fh * 0.3 : fh / 2), cz, g);
        if (last) for (var r = 0; r < 4; r++) box(0.03, 1.2, 0.03, M.rust, cx + (r % 2 ? 0.15 : -0.15), y0 + fh * 0.6 + 0.6, cz + (r < 2 ? 0.15 : -0.15), g);
      }
      if (!last) box(w + 0.5, 0.3, d + 0.5, M.concreteDark, 0, y0 + fh, 0, g);
    }
    box(3, floors * fh, 3, M.concreteDark, w / 2 - 2, floors * fh / 2 + 0.4, d / 2 - 2, g);
    if (!ry) pkXpScaffold(x - w / 2, x + w / 2, z - d / 2, z + d / 2, (floors - 1) * fh + 1, nets);
    return g;
  }
  // a new ride's steel going up: the lift hill's supports in a row, rising, and the first track pieces on the low ones
  function pkXpRideSteel(x, z, ry, n) {
    var M = pkXpM(), g = pkXpGroup(x, z, ry), blue = XM({ color: 0x2f6fb3, roughness: 0.4, metalness: 0.5 }), white = M.white, laid = Math.min(n - 3, 8);
    for (var i = 0; i < n; i++) {
      var h = 2.5 + i * 2.0, px = i * 4;
      box(1.8, 0.4, 3.4, M.concrete, px, 0.2, 0.8, g);
      [-0.4, 2.0].forEach(function (cz) { pkRoundCyl(0.24, h, blue, px, 0.4 + h / 2, cz, g, 10); });
      for (var b = 0.4 + 2.5; b < h; b += 3) { pkRod(px, b - 2.4, -0.4, px, b, 2.0, 0.07, blue, g, 5); box(0.12, 0.12, 2.4, blue, px, b, 0.8, g); }
      box(0.7, 0.5, 3.0, blue, px, 0.4 + h + 0.25, 0.8, g);
      if (i >= laid) { pkXpScaffoldTower(g, px - 1.6, Math.min(h, 12)); }
    }
    // the track on the bents already done: two running rails on their spine, the chain between them
    for (var k = 0; k < laid - 1; k++) {
      var x0 = k * 4, h0 = 0.4 + 2.5 + k * 2.0 + 0.75, h1 = h0 + 2.0;
      [-0.1, 1.7].forEach(function (s2) { pkRod(x0, h0 + 0.2, s2, x0 + 4, h1 + 0.2, s2, 0.08, white, g, 6); });
      pkRod(x0, h0 - 0.05, 0.8, x0 + 4, h1 - 0.05, 0.8, 0.16, blue, g, 8);
      pkRod(x0, h0 + 0.1, 0.8, x0 + 4, h1 + 0.1, 0.8, 0.04, M.black, g, 4);
      for (var t = 0; t < 4; t++) box(0.1, 0.1, 2.0, blue, x0 + t + 0.5, h0 + (h1 - h0) * (t + 0.5) / 4, 0.8, g);
    }
    // the next pieces waiting on their dunnage beside the bents
    for (var q = 0; q < 3; q++) { var tg = new THREE.Group(); tg.position.set(laid * 4 + q * 1.5, 0.25 + q * 0.55, 5.2); g.add(tg); box(0.3, 0.15, 6, M.wood, 0, -0.2, 0, tg); [-0.9, 0.9].forEach(function (s2) { pkRod(-2.8, 0.1, s2, 2.8, 0.1, s2, 0.08, white, tg, 6); }); pkRod(-2.8, 0, 0, 2.8, 0, 0, 0.15, blue, tg, 8); tg.rotation.y = Math.PI / 2; }
    return g;
  }
  function pkXpScaffoldTower(g, px, h) { var M = pkXpM(); [[-0.8, -0.4], [0.8, -0.4], [-0.8, 2.0], [0.8, 2.0]].forEach(function (c) { pkRoundCyl(0.035, h, M.tube, px + c[0], h / 2, c[1], g, 5); }); for (var y = 2; y < h; y += 2) { box(1.8, 0.05, 2.6, M.plank, px, y, 0.8, g); } }

  // ── The expansion site, all the way round ────────────────────────
  function pkXpSite() {
    var M = pkXpM(), rng = PK_XP.rng = pkRng(46046), i, t, p;
    // the stripped ground: earth over the band where it is free, on an 8 m grid, two shades
    for (var gx = -190; gx <= 232; gx += 8) for (var gz = -196; gz <= 176; gz += 8) {
      var cx = gx + 4, cz = gz + 4, d = pkXpRingD(cx, cz);
      if (d < 12 || d > 50) continue;
      if (!pkXpBand(cx, cz)) continue;   // the centre is enough: every keep-out's margin is wider than half a tile
      pkPaved(8.2, 8.2, rng() < 0.7 ? M.dirt : M.dirtDark, cx, 0.012 + rng() * 0.002, cz, 8);
    }
    // the fences: the site's inner edge (toward the line) and outer edge (toward the forest), panel by panel where the band is
    [[12, 4, true], [50, 3, false]].forEach(function (f) {
      var off = f[0], P = pkXpPerim(off), n = Math.round(P / 3.4), run = [];
      for (var k = 0; k <= n; k++) {
        var q = pkXpRingPt(k / n, off);
        if (pkXpFree(q[0], q[1], 0)) run.push([q[0], q[1]]);
        else { if (run.length > 1) pkXpFenceRun(run, f[2], f[1]); run = []; }
      }
      if (run.length > 1) pkXpFenceRun(run, f[2], f[1]);
    });
    // where the band meets a keep-out (a road, a station, the depot), the fence closes across it
    // the felled forest: stumps all over, log stacks and brush heaps by the outer fence, a harvester still at it
    for (i = 0; i < 900; i++) { t = rng(); var off = 14 + rng() * 34; p = pkXpRingPt(t, off); if (pkXpBand(p[0], p[1])) pkXpStump(p[0] + randf(-1, 1), p[1] + randf(-1, 1), 0.8 + rng() * 0.6); }
    var placed = [];
    var put = function (w, d, offMin, offMax, tries, fn, gap) {
      for (var k = 0; k < tries; k++) {
        var tt = rng(), oo = offMin + rng() * (offMax - offMin), q = pkXpRingPt(tt, oo), ry = Math.atan2(q[2], q[3]);
        if (!pkXpFits(q[0], q[1], w, d, ry)) continue;
        var ok = true; for (var j = 0; j < placed.length; j++) if (Math.hypot(placed[j][0] - q[0], placed[j][1] - q[1]) < placed[j][2] + Math.max(w, d) / 2 + (gap || 2)) { ok = false; break; }
        if (!ok) continue;
        placed.push([q[0], q[1], Math.max(w, d) / 2]); fn(q[0], q[1], ry, q); return true;
      }
      return false;
    };
    var many = function (n, w, d, o0, o1, fn, gap) { for (var k = 0; k < n; k++) put(w, d, o0, o1, 30, fn, gap); };
    // the big pieces first: building shells, the ride steel, the cranes beside them, the site villages
    many(7, 22, 16, 22, 34, function (x, z, ry) { pkXpShell(x, z, 20, 14, 3 + Math.floor(rng() * 2), 0, [5, 3, 10, 12][Math.floor(rng() * 4)]); var cx = x + 15 * Math.sign(rng() - 0.5), cz = z; if (pkXpFits(cx, cz, 5, 5, 0)) pkXpCrane(cx, cz, 30 + rng() * 10, 30); }, 8);
    many(3, 44, 6, 26, 36, function (x, z, ry) { pkXpRideSteel(x - Math.cos(ry) * 20, z + Math.sin(ry) * 20, ry, 11); }, 6);
    many(3, 16, 12, 30, 44, function (x, z, ry) {
      pkXpCabin(x - 3.2, z - 1.6, ry, 0, 'SITE OFFICE', false); pkXpCabin(x - 3.2, z - 1.6, ry, 2.7, 'PLANNING', true);
      pkXpCabinStair(x - 3.2, z - 1.6, ry);
      pkXpCabin(x + 3.4, z + 2.2, ry, 0, 'CANTEEN', true); pkXpToilet(x + 7.5, z - 2, ry); pkXpToilet(x + 9, z - 2, ry);
      pkXpContainer(x - 4, z + 5.5, ry, 0x2f7f6f); pkXpWorker(x + 1, z + 4, ry, [3, 0]); pkXpWorker(x - 6, z + 2, ry + 1, null);
    }, 6);
    // the earthworks: diggers at the spoil heaps, a dozer, a roller on the new car park's base, trucks on their haul roads
    many(12, 6, 6, 18, 44, function (x, z, ry) { pkXpExcavator(x, z, ry + Math.PI / 2); var sx = x + Math.cos(ry) * 6, sz = z - Math.sin(ry) * 6; if (pkXpBand(sx, sz)) pkXpSpoil(sx, sz, 3 + rng() * 2, 2.2 + rng() * 1.5); pkXpWorker(x + 3, z + 3, ry, null); }, 6);
    many(22, 7, 7, 16, 46, function (x, z) { pkXpSpoil(x, z, 2.5 + rng() * 3, 1.6 + rng() * 2); }, 3);
    many(6, 6, 6, 16, 44, function (x, z, ry) { pkXpDozer(x, z, ry); });
    many(4, 6, 6, 16, 44, function (x, z, ry) { pkXpRoller(x, z, ry); });
    many(4, 8, 4, 16, 44, function (x, z, ry) { pkXpMixer(x, z, ry); });
    for (var tr = 0; tr < 9; tr++) {
      for (var k2 = 0; k2 < 40; k2++) { var t0 = rng(), q0 = pkXpRingPt(t0, 30), q1 = pkXpRingPt(t0 + 60 / pkXpPerim(30), 30), mid = [(q0[0] + q1[0]) / 2, (q0[1] + q1[1]) / 2]; if (pkXpBand(q0[0], q0[1]) && pkXpBand(q1[0], q1[1]) && pkXpBand(mid[0], mid[1])) { pkXpTruck(q0[0], q0[1], q1[0], q1[1]); pkPaved(Math.hypot(q1[0] - q0[0], q1[1] - q0[1]) + 6, 6, M.gravel, mid[0], 0.016, mid[1], 3, null, -Math.atan2(q1[1] - q0[1], q1[0] - q0[0])); break; } }
    }
    // the forestry: log stacks and brush by the outer fence, harvesters at the forest's edge
    many(24, 7, 3, 40, 47, function (x, z, ry) { pkXpLogs(x, z, ry, 6 + Math.floor(rng() * 6)); }, 2);
    many(18, 4, 4, 38, 47, function (x, z) { pkXpBrush(x, z, 0.9 + rng() * 0.6); }, 2);
    many(5, 6, 8, 42, 47, function (x, z, ry) { pkXpHarvester(x, z, ry); pkXpWorker(x + 4, z, ry, [0, 4]); });
    // materials: pipes, steel, pallets, skips, containers; floodlights round it all; a few more hands
    many(10, 6, 4, 16, 44, function (x, z, ry) { pkXpPipes(x, z, ry); });
    many(10, 8, 3, 16, 44, function (x, z, ry) { pkXpBeams(x, z, ry); });
    many(14, 3, 2, 16, 44, function (x, z, ry) { pkXpPallets(x, z, ry); });
    many(10, 4, 3, 16, 44, function (x, z, ry) { pkXpSkip(x, z, ry); });
    many(9, 7, 3, 16, 44, function (x, z, ry) { pkXpContainer(x, z, ry, [0xb8362b, 0x2f5f9e, 0x3a7a3a, 0xd8a030][Math.floor(rng() * 4)]); });
    many(18, 3, 3, 14, 48, function (x, z, ry) { pkXpFlood(x, z, ry + Math.PI); });
    many(18, 2, 2, 16, 44, function (x, z, ry) { pkXpWorker(x, z, ry, rng() < 0.5 ? [randf(-4, 4), randf(-4, 4)] : null); });
    // the viewing platform at the end of Windmill Halt's footpath: steps up, a rail, a board about the works
    var vx = -17, vz = -160, vg = pkXpGroup(vx, vz, 0);
    box(6, 2.2, 4, M.wood, 0, 1.1, -1, vg); for (var st = 0; st < 6; st++) box(1.4, 0.36 * (st + 1), 0.4, M.wood, 0, 0.18 * (st + 1), 2.8 - st * 0.4, vg);
    [[-3, -3], [3, -3], [-3, 1], [3, 1]].forEach(function (c) { pkRoundCyl(0.05, 1.0, M.steel, c[0], 2.7, c[1] - 1, vg, 6); });
    box(6, 0.06, 0.06, M.steel, 0, 3.2, -4, vg); box(0.06, 0.06, 4, M.steel, -3, 3.2, -2, vg); box(0.06, 0.06, 4, M.steel, 3, 3.2, -2, vg);
    sign(['VIEWING PLATFORM', 'THE NEW LAND AND THE NEW LINE'], 3.4, 0.7, 0, 3.6, -4.1, 0, { bg: '#1b232c', fg: '#f5b53d' }, vg);
    solid(vx - 3.2, vx + 3.2, vz - 3.2, vz - 0.6, 0, 3.4);
  }

  // ── The new railway: a viaduct across the park ───────────────────
  // Piers every 24 m or so, each one placed where it is clear: never on a path, a plot's paving, a solid, the line or the
  // road. The spans are in every stage of building, north to south: track laid, deck poured, girders up, piers only with a
  // crawler crane lifting the next girder, piers still in their formwork, and finished deck again over the road and the line.
  var PK_XP_DECK = 15;
  function pkXpPierOK(x, z) {
    if (Math.abs(pkXpRingD(x, z)) < 9) return false;                                   // the Lindenburg Railway
    if (Math.abs(z - 76) < 7.5 && x > -150 && x < 110) return false;                    // the road
    for (var i = 0; i < PK_XP_STATIONS.length; i++) if (Math.hypot(x - PK_XP_STATIONS[i][0], z - PK_XP_STATIONS[i][1]) < (pkXpRingD(x, z) < 0 ? 34 : 14)) return false;
    for (var r = 0; r < PK_ROUTES.length; r++) { var R = PK_ROUTES[r], hw = R[4] / 2 + 2.2; if (x > Math.min(R[0], R[2]) - hw && x < Math.max(R[0], R[2]) + hw && z > Math.min(R[1], R[3]) - hw && z < Math.max(R[1], R[3]) + hw) return false; }
    for (var k = 0; k < solids.length; k++) { var s = solids[k]; if (x > s.x0 - 2.2 && x < s.x1 + 2.2 && z > s.z0 - 2.2 && z < s.z1 + 2.2) return false; }
    if (typeof PK_KEEP !== 'undefined') for (var q = 0; q < PK_KEEP.length; q++) if (PK_KEEP[q][2] < 12 && Math.hypot(x - PK_KEEP[q][0], z - PK_KEEP[q][1]) < PK_KEEP[q][2]) return false;
    // and whatever stands there that is not a solid: bunting, hedges, lamps, signs (read off the scene along the line)
    var O = PK_XP.near || [];
    for (var b = 0; b < O.length; b++) { var o = O[b]; if (x > o[0] - 1.9 && x < o[1] + 1.9 && z > o[2] - 1.9 && z < o[3] + 1.9) return false; }
    return true;
  }
  // everything that stands within 14 m of the viaduct's line, as boxes: what the piers keep clear of. Trees do not count
  // (part 01 and part 12 fell the ones in the way) and nor does the flat ground
  function pkXpNearScan() {
    var K = pkMats(), leafs = [K.treeBark], bb = new THREE.Box3(), out = [];
    (K.treeLeaves || []).concat(K.conifer || []).forEach(function (a) { leafs = leafs.concat(Array.isArray(a) ? a : [a]); });
    scene.updateMatrixWorld(true);
    scene.traverse(function (o) {
      if (!o.isMesh || !o.geometry || o.isInstancedMesh || o.userData.baked || leafs.indexOf(o.material) >= 0) return;
      bb.setFromObject(o);
      if (bb.max.y < 0.4 || bb.min.y > 12 || bb.max.x - bb.min.x > 90 || bb.max.z - bb.min.z > 90) return;
      var cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
      if (!pkXpViaNear(cx, cz, 14 + Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z) / 2)) return;
      out.push([bb.min.x, bb.max.x, bb.min.z, bb.max.z]);
    });
    PK_XP.near = out;
  }
  function pkXpViaduct() {
    pkXpNearScan();
    var M = pkXpM(), pts = PK_XP_VIA, line = [], total = 0, i;
    for (i = 0; i < pts.length - 1; i++) { var A = pts[i], B = pts[i + 1], L = Math.hypot(B[0] - A[0], B[1] - A[1]); line.push({ a: A, b: B, s0: total, L: L }); total += L; }
    var at = function (s) { for (var k = 0; k < line.length; k++) { var g = line[k]; if (s <= g.s0 + g.L || k === line.length - 1) { var f = clamp((s - g.s0) / g.L, 0, 1); return { x: g.a[0] + (g.b[0] - g.a[0]) * f, z: g.a[1] + (g.b[1] - g.a[1]) * f, yaw: Math.atan2(g.b[0] - g.a[0], g.b[1] - g.a[1]) }; } } };
    // the piers: the nominal spot every 24 m, slid along the line up to 9 m either way to the nearest clear one
    var piers = [], s = 0;
    while (s <= total + 0.1) {
      var found = null;
      for (var dd = 0; dd <= 9 && !found; dd += 1) [dd, -dd].forEach(function (o) { if (found) return; var q = at(clamp(s + o, 0, total)); if (pkXpPierOK(q.x, q.z)) found = { s: clamp(s + o, 0, total), p: q }; });
      if (found && (!piers.length || found.s - piers[piers.length - 1].s > 12)) piers.push(found);
      s = (found ? found.s : s) + 24;
    }
    var stage = function (f) { return f < 0.24 ? 'track' : f < 0.36 ? 'deck' : f < 0.5 ? 'girder' : f < 0.6 ? 'crane' : f < 0.7 ? 'girder' : f < 0.78 ? 'form' : 'deck'; };
    var concrete = M.concrete, D = PK_XP_DECK;
    piers.forEach(function (P, k) {
      var f = P.s / total, st = stage(f), q = P.p, g = pkXpGroup(q.x, q.z, q.yaw); g.userData.pkXpVia = true;
      // the pile cap, the column, the hammerhead
      box(4.6, 0.8, 4.6, M.concreteDark, 0, 0.4, 0, g);
      var colH = st === 'form' ? (k % 2 ? D * 0.45 : D * 0.7) : D - 1.6;
      box(1.8, colH, 2.4, concrete, 0, 0.8 + colH / 2, 0, g);
      if (st === 'form') {
        // the column still rising: rebar out of the top, the climbing formwork and its platform round it
        for (var rb = 0; rb < 10; rb++) box(0.04, 1.8, 0.04, M.rust, -0.7 + (rb % 5) * 0.35, 0.8 + colH + 0.9, rb < 5 ? -1 : 1, g);
        box(2.8, 2.2, 3.4, XM({ color: 0xd88a2a, roughness: 0.8 }), 0, 0.8 + colH - 1.0, 0, g);
        box(4.4, 0.1, 5.0, M.plank, 0, 0.8 + colH - 2.2, 0, g);
        pkXpScaffoldTower(g, -0.0, 0.8 + colH - 2.2);
      } else {
        box(5.6, 1.4, 2.8, concrete, 0, D - 1.6 + 0.7, 0, g);
        box(5.8, 0.1, 3.0, M.concreteDark, 0, D - 0.15, 0, g);
        if (st === 'crane') pkXpScaffold(q.x - 1.2, q.x + 1.2, q.z - 1.5, q.z + 1.5, D - 2, 0);
      }
      solid(q.x - 1.4, q.x + 1.4, q.z - 1.4, q.z + 1.4, 0, D);
      // inside the park every pier stands in its own fenced compound, with its number on the fence
      if (pkXpRingD(q.x, q.z) < 0) {
        var c = 3.6, corners = [[-c, -c], [c, -c], [c, c], [-c, c], [-c, -c]].map(function (o) { var cs = Math.cos(q.yaw), sn = Math.sin(q.yaw); return [q.x + o[0] * cs + o[1] * sn, q.z - o[0] * sn + o[1] * cs]; });
        pkXpFenceRun(corners, true, 0);
        sign(['VIADUCT PIER ' + (k + 1), 'NEW LINE WORKS'], 1.6, 0.5, 0, 1.4, c + 0.06, 0, { bg: '#f0c04a', fg: '#1b1b1b' }, g);
        pkXpStump(q.x + 2.2, q.z - 2.4, 0.9);
      }
      P.st = st;
    });
    // the crawler crane works out on the site, never over the park: inside the ring its stretch is girders, and the gap it
    // swings a girder into is the first span of the far deck stretch that stands well outside the railway
    var craneSpan = -1;
    for (i = 0; i < piers.length - 1 && craneSpan < 0; i++) {
      var cmx = (piers[i].p.x + piers[i + 1].p.x) / 2, cmz = (piers[i].p.z + piers[i + 1].p.z) / 2;
      if ((piers[i].s + piers[i + 1].s) / 2 / total > 0.78 && pkXpRingD(cmx, cmz) > 12 && piers[i].st !== 'form' && piers[i + 1].st !== 'form') craneSpan = i;
    }
    // the spans between piers: what each stage has to show
    for (i = 0; i < piers.length - 1; i++) {
      var A2 = piers[i], B2 = piers[i + 1], fm = (A2.s + B2.s) / 2 / total, st2 = stage(fm);
      if (st2 === 'crane') st2 = 'girder';
      if (i === craneSpan) st2 = 'crane';
      if (A2.st === 'form' || B2.st === 'form') st2 = 'none';
      var ax = A2.p.x, az = A2.p.z, bx = B2.p.x, bz = B2.p.z, L2 = Math.hypot(bx - ax, bz - az), yaw = Math.atan2(bx - ax, bz - az), mx = (ax + bx) / 2, mz = (az + bz) / 2;
      var sg = pkXpGroup(mx, mz, yaw); sg.userData.pkXpVia = true; sg.userData.span = [ax, az, bx, bz, st2];
      if (st2 === 'none') continue;
      if (st2 === 'crane') {
        // the gap: a crawler crane beside it, swinging the girder in
        var side = [-9, 9].find(function (o) { var cx = mx + Math.cos(yaw) * o, cz = mz - Math.sin(yaw) * o; return pkXpPierOK(cx, cz) && pkXpPierOK(cx + 3, cz + 3) && pkXpPierOK(cx - 3, cz - 3); });
        if (side !== undefined) pkXpCrawler(mx + Math.cos(yaw) * side, mz - Math.sin(yaw) * side, -yaw, mx, mz, D - 2);
        continue;
      }
      // two steel box girders from cap to cap
      [-1.2, 1.2].forEach(function (o) { box(0.7, 1.4, L2, M.rust, o, D - 1.6 - 0.7 + 1.4, 0, sg); });
      if (st2 === 'girder') { for (var cb = -L2 / 2 + 3; cb < L2 / 2; cb += 4) box(2.4, 0.3, 0.2, M.rust, 0, D - 0.9, cb, sg); continue; }
      // the deck slab and its parapets
      box(5.4, 0.45, L2, M.concrete, 0, D - 0.25, 0, sg);
      [-2.55, 2.55].forEach(function (o) { box(0.3, 1.0, L2, M.concrete, o, D + 0.45, 0, sg); });
      if (st2 === 'deck') { // the rails and sleepers stacked on the deck, waiting to be laid
        box(1.2, 0.5, 3.0, M.wood, -0.9, D + 0.2, -L2 / 4, sg); for (var rl = 0; rl < 4; rl++) box(0.1, 0.12, Math.min(18, L2 - 4), MAT.chrome, 0.6 + rl * 0.15, D + 0.05 + (rl > 1 ? 0.12 : 0), 0, sg);
        continue;
      }
      // the track itself: ballast, sleepers, the two rails
      box(3.2, 0.25, L2, XM({ color: 0x5a5750, roughness: 1 }), 0, D + 0.1, 0, sg);
      for (var sl = -L2 / 2 + 0.3; sl < L2 / 2; sl += 0.65) box(2.2, 0.12, 0.22, XM({ color: 0x4b3a2a, roughness: 0.95 }), 0, D + 0.28, sl, sg);
      [-0.5, 0.5].forEach(function (o) { box(0.08, 0.12, L2, MAT.chrome, o, D + 0.4, 0, sg); });
    }
    // the ends: a buffer stop on the deck at each, so the new line ends where it ends, and the site's spoil ramp under it
    [piers[0], piers[piers.length - 1]].forEach(function (P, e) {
      if (!P) return;
      var g = pkXpGroup(P.p.x, P.p.z, P.p.yaw + (e ? 0 : Math.PI)); g.userData.pkXpVia = true;
      box(3.4, 1.2, 0.6, M.red, 0, D + 1.0, 2.2, g); box(3.4, 0.2, 0.62, M.white, 0, D + 1.3, 2.2, g);
      sign(['END OF THE NEW LINE', 'WORKS CONTINUE'], 2.6, 0.6, 0, D + 2.2, 2.6, 0, { bg: '#b8362b', fg: '#ffffff' }, g);
    });
    PK_XP.viaduct = { piers: piers, total: total };
  }
  // the new line on the ground in the site: laid from the viaduct's ends along the band, then stopping at a buffer, the
  // rails and sleepers for the rest stacked beside it. It never comes nearer the Lindenburg Railway than 20 m.
  function pkXpGroundLine() {
    var M = pkXpM(), runs = [[[-67, -178], [-30, -178], [4, -178]], [[-112, 152], [-60, 152], [-10, 152]]];
    runs.forEach(function (R, ri) {
      for (var i = 0; i < R.length - 1; i++) {
        var A = R[i], B = R[i + 1], L = Math.hypot(B[0] - A[0], B[1] - A[1]), yaw = Math.atan2(B[0] - A[0], B[1] - A[1]), mx = (A[0] + B[0]) / 2, mz = (A[1] + B[1]) / 2;
        if (!pkXpFree(mx, mz, 0) || pkXpRingD(mx, mz) < 20) continue;
        var g = pkXpGroup(mx, mz, yaw), laid = i === 0;
        box(4.2, 0.35, L, M.gravel, 0, 0.17, 0, g);
        var sl = laid ? L : L * 0.45;
        for (var s = -L / 2 + 0.3; s < -L / 2 + sl; s += 0.65) box(2.2, 0.12, 0.22, XM({ color: 0x4b3a2a, roughness: 0.95 }), 0, 0.41, s, g);
        if (laid) [-0.5, 0.5].forEach(function (o) { box(0.08, 0.12, L, MAT.chrome, o, 0.53, 0, g); });
        else { for (var st = 0; st < 3; st++) box(2.4, 0.5, 1.4, M.wood, 3.6, 0.25 + st * 0.5, L * 0.2, g); for (var rl = 0; rl < 6; rl++) box(0.1, 0.12, 12, MAT.chrome, -3.4 + rl * 0.2, 0.06, L * 0.1, g); box(3.4, 1.2, 0.6, M.red, 0, 1.0, -L / 2 + sl + 0.6, g); }
      }
    });
  }

  // ── Beyond the site: the town, the farms, the lake, the forest, the hills ──
  // a house: a box with its windows, a door, a pitched roof (some with a stepped Dutch gable), a chimney
  function pkXpHouse(x, z, ry, w, d, h, wallM, roofM, dutch) {
    var M = pkXpM(), g = pkXpGroup(x, z, ry);
    box(w, h, d, wallM, 0, h / 2, 0, g);
    var cols = Math.max(2, Math.floor(w / 2.2)), floors = Math.max(1, Math.floor(h / 3));
    for (var f = 0; f < floors; f++) for (var c = 0; c < cols; c++) { var wx = -w / 2 + (c + 0.5) * w / cols, wy = 1.6 + f * 2.9; if (f === 0 && c === Math.floor(cols / 2)) continue; box(0.9, 1.3, 0.06, M.win, wx, wy, d / 2 + 0.02, g); box(1.05, 0.1, 0.12, M.white, wx, wy - 0.7, d / 2 + 0.05, g); }
    box(1.0, 2.1, 0.06, M.door, -w / 2 + (Math.floor(cols / 2) + 0.5) * w / cols, 1.05, d / 2 + 0.02, g);
    for (var f2 = 0; f2 < floors; f2++) {
      for (var c2 = 0; c2 < cols; c2++) box(0.9, 1.3, 0.06, M.win, -w / 2 + (c2 + 0.5) * w / cols, 1.6 + f2 * 2.9, -d / 2 - 0.02, g);
      var sc = Math.max(1, Math.floor(d / 3.2));
      for (var c3 = 0; c3 < sc; c3++) [-1, 1].forEach(function (sx) { box(0.06, 1.2, 0.8, M.win, sx * (w / 2 + 0.02), 1.6 + f2 * 2.9, -d / 2 + (c3 + 0.5) * d / sc, g); });
    }
    box(0.9, 2.0, 0.06, M.door, w / 4, 1.0, -d / 2 - 0.02, g);
    if (dutch) {
      for (var k = 0; k < 4; k++) { var sw = w * (1 - (k + 1) / 5); box(sw, 0.9, d, wallM, 0, h + 0.45 + k * 0.9, 0, g); box(sw + 0.12, 0.12, d + 0.1, M.white, 0, h + 0.9 + k * 0.9, 0, g); }
    } else {
      var rise = Math.min(d * 0.5, 3.4), rl = Math.hypot(rise, d / 2 + 0.3), sl = Math.atan2(rise, d / 2 + 0.3);
      [-1, 1].forEach(function (s) { var r = box(w + 0.5, 0.18, rl, roofM, 0, h + rise / 2, s * (d / 4 + 0.15), g); r.rotation.x = s * sl; });
      var gab = new THREE.Shape(); gab.moveTo(-d / 2, 0); gab.lineTo(d / 2, 0); gab.lineTo(0, rise); gab.closePath();
      [-1, 1].forEach(function (s) { var m = new THREE.Mesh(new THREE.ShapeGeometry(gab), wallM); m.position.set(s * w / 2, h, 0); m.rotation.y = Math.PI / 2; g.add(m); });
    }
    box(0.6, 1.6, 0.6, M.brick, w / 2 - 1.0, h + 1.6, -d / 4, g);
    PK_XP.windows = PK_XP.windows || 0; PK_XP.windows++;
    return g;
  }
  function pkXpRoad(x0, z0, x1, z1, w) {
    var M = pkXpM(), L = Math.hypot(x1 - x0, z1 - z0), ang = Math.atan2(z1 - z0, x1 - x0), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    var g = pkXpGroup(mx, mz, -ang);
    var m = new THREE.Mesh(new THREE.PlaneGeometry(L, w), M.asphalt); m.rotation.x = -Math.PI / 2; m.position.y = 0.009; m.receiveShadow = true; g.add(m);
    box(L, 0.012, 0.14, M.line, 0, 0.016, 0, g);
    return g;
  }
  function pkXpTownBuild() {
    var M = pkXpM(), rng = pkRng(77046), walls = [M.brick, M.cream, M.plaster, XM({ map: TEX.plaster, color: 0xe6c8b0, roughness: 0.9 }), XM({ map: TEX.plaster, color: 0xc9d6dc, roughness: 0.9 })];
    var roofs = [M.roofRed, M.roofSlate, XM({ color: 0x7a3a2a, roughness: 0.8 })];
    // the streets: the main road through it (part 01's road, carried on), two parallel streets and the cross streets
    pkXpRoad(-560, 76, -140, 76, 8);
    pkXpRoad(-450, 28, -196, 28, 6); pkXpRoad(-450, 124, -196, 124, 6);
    [-220, -280, -340, -400].forEach(function (x) { pkXpRoad(x, 20, x, 172, 6); });
    // the houses along each street, set back, both sides
    var street = function (z, x0, x1, faceN) {
      for (var x = x0; x < x1;) {
        var w = 6 + rng() * 5, d = 8 + rng() * 2, h = 5.5 + rng() * 4;
        var cx = x + w / 2; x += w + 0.6 + rng() * 1.2;
        if ([-220, -280, -340, -400].some(function (cs) { return Math.abs(cx - cs) < w / 2 + 5; })) continue;
        [-1, 1].forEach(function (s) { if (faceN === s) return; pkXpHouse(cx, z + s * (d / 2 + 6.5), s > 0 ? Math.PI : 0, w, d, h, walls[Math.floor(rng() * walls.length)], roofs[Math.floor(rng() * roofs.length)], rng() < 0.3); });
      }
    };
    street(76, -440, -200, 0); street(28, -440, -200, 0); street(124, -440, -200, 0);
    // the church on the square, its spire seen from the park, and the town hall facing it
    var cg = pkXpGroup(-310, 100, 0);
    box(10, 11, 22, M.brick, 0, 5.5, 0, cg); [-1, 1].forEach(function (sd) { var rs = box(7.6, 0.3, 23, M.roofSlate, sd * 2.7, 13.6, 0, cg); rs.rotation.z = -sd * 0.72; }); var cgab = new THREE.Shape(); cgab.moveTo(-5, 0); cgab.lineTo(5, 0); cgab.lineTo(0, 5); cgab.closePath(); [-11, 11].forEach(function (gz) { var gm = new THREE.Mesh(new THREE.ShapeGeometry(cgab), M.brick); gm.position.set(0, 11, gz); cg.add(gm); });
    box(6, 26, 6, M.brick, 0, 13, -12, cg); box(6.4, 0.5, 6.4, M.white, 0, 26.2, -12, cg);
    var sp = new THREE.Mesh(new THREE.ConeGeometry(4.2, 18, 8), M.roofSlate); sp.position.set(0, 35.5, -12); sp.castShadow = true; cg.add(sp);
    pkRoundCyl(0.12, 3, pkMats().gold, 0, 46, -12, cg, 6);
    for (var cw = -8; cw <= 8; cw += 4) [-1, 1].forEach(function (s) { box(0.06, 4, 1.4, M.win, s * 5.02, 6, cw, cg); });
    pkXpHouse(-280, 100, -Math.PI / 2, 16, 10, 10, M.cream, M.roofSlate, true);
    pkPaved(40, 30, pkMats().paversWarm || M.gravel, -295, 0.011, 100, 2.4);
    // a windmill on the town's edge, sails turning
    var mg = pkXpGroup(-470, 140, 0.5);
    pkRoundCyl(3.2, 12, M.brick, 0, 6, 0, mg, 10); var cap = new THREE.Mesh(new THREE.ConeGeometry(3.4, 4, 10), M.roofSlate); cap.position.y = 14; mg.add(cap);
    var sails = pkXpDyn(mg); sails.position.set(0, 13, 3.4);
    for (var s4 = 0; s4 < 4; s4++) { var arm = new THREE.Group(); arm.rotation.z = s4 * Math.PI / 2; sails.add(arm); box(0.25, 11, 0.12, M.wood, 0, 5.5, 0, arm); box(1.6, 9, 0.05, M.white, 0.9, 6, 0, arm); }
    PK_XP.dyn.push({ kind: 'spin', g: sails, v: 0.45, axis: 'z' });
    // the road's traffic out here, its own: cars along the main road beyond the line both ways, never onto a crossing
    pkXpTraffic([[-560, -146, 74.5, 1], [-560, -146, 77.5, -1], [184, 560, 74.5, 1], [184, 560, 77.5, -1]]);
    pkXpRoad(182, 76, 560, 76, 8);
  }
  // the engine's car runs along its own x: heading 0 drives +x, PI drives -x (as the engine's traffic sets it)
  function pkXpTraffic(lanes) {
    lanes.forEach(function (L) {
      for (var i = 0; i < 4; i++) { var g = carMesh(); g.userData.dynamic = true; scene.add(g); var x = L[0] + Math.random() * (L[1] - L[0]); g.position.set(x, 0, L[2]); g.rotation.y = L[3] > 0 ? 0 : Math.PI; PK_XP.dyn.push({ kind: 'car', g: g, x0: L[0], x1: L[1], dir: L[3], v: randf(9, 14) }); }
    });
  }
  function pkXpFarms() {
    var M = pkXpM(), rng = pkRng(88046);
    pkXpRoad(320, -540, 320, 540, 7);
    // a patchwork of fields with hedges between them
    for (var fx = 232; fx < 500; fx += 54) for (var fz = -320; fz < 320; fz += 46) {
      var cx = fx + 25, cz = fz + 21; if (Math.abs(cz - 76) < 26 || Math.abs(cx - 320) < 30) continue;
      var fm = M.field[Math.floor(rng() * M.field.length)], m = new THREE.Mesh(new THREE.PlaneGeometry(50, 42), fm); m.rotation.x = -Math.PI / 2; m.rotation.z = rng() < 0.5 ? 0 : Math.PI / 2; m.position.set(cx, 0.01, cz); m.receiveShadow = true; scene.add(m);
      box(50, 1.2, 1.0, M.hedge, cx, 0.6, cz + 21.5); box(1.0, 1.2, 42, M.hedge, cx + 25.5, 0.6, cz);
    }
    // the farmsteads: a house, a big barn, a silo
    [[290, -60], [350, 150], [290, 240], [356, -220]].forEach(function (f, i) {
      pkXpHouse(f[0], f[1], i % 2 ? Math.PI / 2 : -Math.PI / 2, 10, 9, 6, M.brick, M.roofRed, false);
      var bg = pkXpGroup(f[0] + (i % 2 ? -22 : 22), f[1] + 8, 0); box(16, 7, 24, XM({ color: 0x8a2a22, roughness: 0.8 }), 0, 3.5, 0, bg); [-1, 1].forEach(function (s) { var r = box(9.8, 0.2, 25, M.roofSlate, s * 4.0, 9.4, 0, bg); r.rotation.z = -s * 0.6; }); box(4, 5, 0.1, M.white, 0, 2.5, 12.06, bg);
      pkRoundCyl(3, 16, XM({ color: 0xb8bcc0, roughness: 0.4, metalness: 0.6 }), f[0] + (i % 2 ? -36 : 36), 8, f[1] - 6, null, 16);
    });
    // wind turbines on the far side, turning slowly
    [[440, -200], [460, -60], [470, 90], [450, 230], [-120, -420], [40, -440], [200, -430]].forEach(function (p) {
      var g = pkXpGroup(p[0], p[1], Math.atan2(-p[0], -p[1]));
      pkRoundCyl(1.6, 2, M.concrete, 0, 1, 0, g, 16); var tw = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 2.0, 70, 14), M.white); tw.position.y = 36; g.add(tw);
      pkBevelBox(2.6, 3, 8, M.white, 0, 72, 1, g, 0.4);
      var rot = pkXpDyn(g); rot.position.set(0, 72, 5.4); pkRoundCyl(1.2, 2, M.white, 0, 0, 0, rot, 12).rotation.x = Math.PI / 2;
      for (var b = 0; b < 3; b++) { var arm = new THREE.Group(); arm.rotation.z = b * Math.PI * 2 / 3; rot.add(arm); var bl = box(1.6, 30, 0.4, M.white, 0, 16, 0, arm); bl.scale.x = 0.8; }
      PK_XP.dyn.push({ kind: 'spin', g: rot, v: 0.55 + Math.random() * 0.2, axis: 'z' });
    });
  }
  function pkXpLakeBuild() {
    var M = pkXpM(), m = new THREE.Mesh(new THREE.CircleGeometry(1, 48), M.water); m.scale.set(70, 44, 1); m.rotation.x = -Math.PI / 2; m.position.set(95, 0.03, 236); scene.add(m);
    var rim = new THREE.Mesh(new THREE.RingGeometry(0.98, 1.06, 48), XM({ color: 0xb8a888, roughness: 1 })); rim.scale.set(70, 44, 1); rim.rotation.x = -Math.PI / 2; rim.position.set(95, 0.025, 236); scene.add(rim);
    for (var i = 0; i < 70; i++) { var a = Math.random() * 6.28, r = 1.02 + Math.random() * 0.05; var reed = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.6, 5), M.reed); reed.position.set(95 + Math.cos(a) * 70 * r, 0.8, 236 + Math.sin(a) * 44 * r); scene.add(reed); }
    // a jetty and two rowing boats
    box(2, 0.2, 14, M.wood, 95, 0.4, 199); for (var p = 0; p < 5; p++) [-0.9, 0.9].forEach(function (s) { pkRoundCyl(0.1, 1.2, M.wood, 95 + s, 0.0, 193 + p * 3, null, 6); });
    [[88, 214], [104, 222]].forEach(function (b, i) { var g = pkXpGroup(b[0], b[1], i * 1.2); var hull = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 4, 12, 1, true, 0, Math.PI), XM({ color: i ? 0x2f5f9e : 0xb8362b, roughness: 0.6, side: THREE.DoubleSide })); hull.rotation.set(Math.PI / 2, 0, Math.PI); hull.position.y = 0.6; g.add(hull); PK_XP.dyn.push({ kind: 'bob', g: g, t: i * 2 }); });
  }
  // the far forest: instanced, two kinds of tree, out to the edge of the world wherever nothing else stands
  function pkXpForest() {
    var M = pkXpM(), K = pkMats(), rng = pkRng(99046), pos = [];
    for (var x = -540; x <= 540; x += 11) for (var z = -540; z <= 540; z += 11) {
      var jx = x + (rng() - 0.5) * 8, jz = z + (rng() - 0.5) * 8, th = rng(), sc = 0.9 + rng() * 1.1;
      if (Math.abs(jx) < 212 && Math.abs(jz) < 212) continue;              // the woods part 01 plants already
      if (th < 0.25 || pkXpClear(jx, jz) || Math.abs(jz - 76) < 8 || Math.abs(jx - 320) < 6) continue;
      pos.push([jx, jz, sc, rng()]);
    }
    var crown = new THREE.IcosahedronGeometry(1, 1), cone = new THREE.ConeGeometry(1, 2.6, 8), trunk = new THREE.CylinderGeometry(0.12, 0.18, 1, 6);
    var leaves = [XM({ color: 0x3f6a32, roughness: 1 }), XM({ color: 0x4f7a3a, roughness: 1 }), XM({ color: 0x2f5a3a, roughness: 1 })];
    var groups = [[], [], [], []];
    pos.forEach(function (p) { groups[p[3] < 0.3 ? 3 : Math.floor(p[3] * 3) % 3].push(p); });
    var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sv = new THREE.Vector3(), pv = new THREE.Vector3();
    var inst = function (geo, mat, list, place) { if (!list.length) return; var im = new THREE.InstancedMesh(geo, mat, list.length); list.forEach(function (p, i) { place(p, pv, sv); m4.compose(pv, q, sv); im.setMatrixAt(i, m4); }); im.instanceMatrix.needsUpdate = true; im.castShadow = false; im.receiveShadow = false; im.frustumCulled = false; im.userData.noBake = true; scene.add(im); };
    [0, 1, 2].forEach(function (k) { inst(crown, leaves[k], groups[k], function (p, P, Sv) { P.set(p[0], 3.4 * p[2], p[1]); Sv.set(2.4 * p[2], 2.1 * p[2], 2.4 * p[2]); }); });
    inst(cone, leaves[2], groups[3], function (p, P, Sv) { P.set(p[0], 3.0 * p[2], p[1]); Sv.set(1.8 * p[2], 2.0 * p[2], 1.8 * p[2]); });
    inst(trunk, M.bark, pos, function (p, P, Sv) { P.set(p[0], 1.0 * p[2], p[1]); Sv.set(p[2], 2.2 * p[2], p[2]); });
    PK_XP.trees = pos.length;
    // low hills on the horizon, hazy with distance
    for (var h = 0; h < 22; h++) { var a = h / 22 * Math.PI * 2 + rng() * 0.2, r = 580 + rng() * 80, hm = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), h % 3 ? M.hillFar : M.hill); hm.scale.set(90 + rng() * 120, 22 + rng() * 34, 70 + rng() * 60); hm.position.set(Math.cos(a) * r, -2, Math.sin(a) * r); hm.rotation.y = -a; hm.userData.noBake = true; scene.add(hm); }
    // a line of pylons across the far east, wires slung between them
    var py = []; for (var pz = -520; pz <= 520; pz += 80) py.push([400, pz]);
    py.forEach(function (p, i) {
      var g = pkXpGroup(p[0], p[1], 0); [[-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(function (c) { pkRod(c[0], 0, c[1], c[0] * 0.25, 30, c[1] * 0.25, 0.12, M.steel, g, 4); }); [18, 24].forEach(function (y) { box(14, 0.3, 0.3, M.steel, 0, y, 0, g); });
      if (i) [-6.5, 6.5].forEach(function (o) { [18, 24].forEach(function (y) { pkRod(400 + o, y - 0.8, py[i - 1][1], 400 + o, y - 0.8, p[1], 0.03, M.black, scene, 3); }); });
    });
  }

  // ── The life of it: cranes, diggers, trucks, workers, sails, cars ──
  function pkXpTick(dt) {
    if (!PK_XP.built) return;
    var night = typeof S !== 'undefined' && S && (S.time < 7 || S.time > 19.5), M = pkXpM();
    M.beacon.emissiveIntensity = Math.sin(PK_XP.T = (PK_XP.T || 0) + dt * 3) > 0 ? 2.2 : 0.1;
    M.lamp.emissiveIntensity = night ? 1.8 : 0.15;
    M.win.emissiveIntensity = night ? 0.9 : 0.0;
    var px = typeof player !== 'undefined' && player ? player.x : 0, pz = typeof player !== 'undefined' && player ? player.z : 0;
    for (var i = 0; i < PK_XP.dyn.length; i++) {
      var D = PK_XP.dyn[i];
      if (D.kind === 'spin') { D.g.rotation[D.axis] += dt * D.v; continue; }
      if (D.kind === 'car') { var ws = D.g.userData.wheels; if (ws) for (var w = 0; w < ws.length; w++) ws[w].rotation.z -= D.dir * D.v * dt / 0.3; D.g.position.x += D.dir * D.v * dt; if (D.g.position.x > D.x1) D.g.position.x = D.x0; if (D.g.position.x < D.x0) D.g.position.x = D.x1; continue; }
      if (D.kind === 'bob') { D.t += dt; D.g.position.y = Math.sin(D.t * 1.3) * 0.06; D.g.rotation.z = Math.sin(D.t) * 0.04; continue; }
      if (D.kind === 'crane') {
        // swing to a new heading, run the trolley out, lower, pause, raise, and again
        D.t += dt; var ph = D.t % 40;
        D.slew.rotation.y = D.a0 + Math.sin(D.t * 0.05) * 1.6;
        D.trolley.position.x = D.jib * (0.45 + 0.35 * Math.sin(D.t * 0.07));
        var drop = 6 + (ph < 20 ? ph : 40 - ph) * 0.9;
        D.cable.scale.y = drop; D.cable.position.y = -drop / 2; D.load.position.y = -drop;
        continue;
      }
      if (D.kind === 'dig') {
        D.t += dt; var k = D.t % 12;
        D.house.rotation.y = k < 6 ? Math.sin(k / 6 * Math.PI) * 1.3 : 0;
        D.boom.rotation.x = -0.35 + Math.sin(D.t * 0.9) * 0.25; D.stick.rotation.x = 0.8 + Math.sin(D.t * 0.9 + 1) * 0.4; D.bucket.rotation.x = 0.6 + Math.sin(D.t * 0.9 + 2) * 0.5;
        continue;
      }
      if (D.kind === 'truck') {
        if (D.wait > 0) { D.wait -= dt; D.bed.rotation.x = D.dir < 0 && D.wait > 2 ? -0.6 * Math.sin((D.wait - 2) / 4 * Math.PI) : 0; continue; }
        D.t += D.dir * dt * 0.05; if (D.t > 1 || D.t < 0) { D.t = clamp(D.t, 0, 1); D.dir *= -1; D.wait = 6; D.load.visible = D.dir < 0; }
        var x = D.a[0] + (D.b[0] - D.a[0]) * D.t, z = D.a[1] + (D.b[1] - D.a[1]) * D.t;
        D.g.position.set(x, 0, z); D.g.rotation.y = Math.atan2((D.b[0] - D.a[0]) * D.dir, (D.b[1] - D.a[1]) * D.dir);
        continue;
      }
      if (D.kind === 'worker') {
        if ((D.g.position.x - px) * (D.g.position.x - px) + (D.g.position.z - pz) * (D.g.position.z - pz) > 160 * 160) continue;
        var moving = false;
        if (D.b) { D.t += D.dir * dt * 0.12; if (D.t > 1 || D.t < 0) { D.t = clamp(D.t, 0, 1); D.dir *= -1; } var wx = D.a[0] + (D.b[0] - D.a[0]) * D.t, wz = D.a[1] + (D.b[1] - D.a[1]) * D.t; D.g.position.set(wx, 0, wz); D.g.rotation.y = Math.atan2((D.b[0] - D.a[0]) * D.dir, (D.b[1] - D.a[1]) * D.dir); moving = true; }
        animateHuman(D.g, dt, moving ? 'walk' : 'idle', moving ? 1.1 : 0, null, false);
      }
    }
  }
  animate(pkXpTick);

  // ── Building it ──────────────────────────────────────────────────
  function pkXpBuild() {
    if (PK_XP.built) return;
    var tries = [['viaduct', pkXpViaduct], ['site', pkXpSite], ['ground line', pkXpGroundLine], ['town', pkXpTownBuild], ['farms', pkXpFarms], ['lake', pkXpLakeBuild], ['forest', pkXpForest]];
    tries.forEach(function (t) { try { t[1](); } catch (e) { if (window.console) console.error('world: ' + t[0] + ' failed', e); } });
    PK_XP.built = true;
  }
  var _pkXpPrevBuildWorld = GAME.buildWorld;
  GAME.buildWorld = function (loaded) { var r = _pkXpPrevBuildWorld ? _pkXpPrevBuildWorld(loaded) : undefined; pkXpBuild(); return r; };
  var _pkXpPrevT = GAME.T;
  GAME.T = function () { var o = _pkXpPrevT(); o.pkXpKit = { stump: pkXpStump, logs: pkXpLogs, brush: pkXpBrush, spoil: pkXpSpoil, cabin: pkXpCabin, container: pkXpContainer, skip: pkXpSkip, toilet: pkXpToilet, pipes: pkXpPipes, beams: pkXpBeams, pallets: pkXpPallets, flood: pkXpFlood, worker: pkXpWorker, excavator: pkXpExcavator, truck: pkXpTruck, dozer: pkXpDozer, roller: pkXpRoller, mixer: pkXpMixer, harvester: pkXpHarvester, crane: pkXpCrane, crawler: pkXpCrawler, shell: pkXpShell, ride: pkXpRideSteel, fence: pkXpFenceRun, house: pkXpHouse }; o.PK_XP = PK_XP; o.pkXpRingD = pkXpRingD; o.pkXpFree = pkXpFree; o.pkXpBand = pkXpBand; return o; };
