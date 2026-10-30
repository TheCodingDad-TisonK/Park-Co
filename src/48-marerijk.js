//@ Park Co, part 48: Marerijk - the story realm in the west woods, and Droomvlucht, the suspended dark ride
  // ── Marerijk ─────────────────────────────────────────────────────
  // Efteling's Droomvlucht at full scale, in the woods west of the Dark Woods: a show building 30 by 62 m and 16 m high,
  // its fairy-palace front (a gatehouse with a pointed portal and a round dream window, slender towers with pointed roofs,
  // two great flower medallions, a big round corner tower, lily ponds either side) looking east onto the Marerijk promenade,
  // which leaves the Arena path at x -74. Inside, the station hall (the queue, the platform, the glazed control cabin) is
  // walled off from the dream: eight two-seat gondolas hang 2.5 m under an overhead rail and fly a closed course of about
  // 260 m. Out of the station they climb into the Castle Realm and over its castles on their rocks, through the canopy of
  // the Wondrous Forest at 11 m, down into the Fairy Garden past King Oberon on his sunflower throne, through the Star
  // Tunnel, among the floating Heavenly Strongholds, then two turns fast down the spiral round the hollow swamp tree of
  // the Squelch Forest, past the Dream Swamp and through the fog wall back into the station. The building keeps west of
  // the viaduct (part 46, x -67 here) and inside the ring line's west station (x -115).
  var PK_DV = { X0: -110, X1: -80, Z0: -32, Z1: 30, H: 16, ROOF: 16.4, g: null,
    ST: { x: -85, z0: -9, z1: -22.5, y: 3.2 },          // the boarding leg of the U: the rail at y, the gondolas leaving -z
    HALL: { x0: -94, x1: -80, z0: -24, z1: -1, h: 7 },   // the station hall, walled off from the scenes
    SP: { x: -86, z: 4.5, r: 4.2, y0: 12.5, y1: 4.6 },   // the spiral round the swamp tree: top and bottom of its rail
    DOOR: -9, EXIT: -22, HANG: 2.55, N: 12, GAP: 2.7, DGAP: 6 };   // DGAP: how far the last one out has to be before the next goes: the walkway never stops
  PK_LANDS.marerijk = { name: 'MARERIJK', a: 0x8a5fb3, b: 0xf0c04a, pave: 0xc9b0d9, sign: '#e0c0ff' };
  PK_ROUTES.push([-74, -40, -74, 12, 4.0, 'marerijk']);   // the promenade: south off the Arena path, along the palace front
  PK_ARCHES.push([-74, -36.5, 'z', 'marerijk']);
  PK_PLOTS.push({ id: 'droom', name: 'Droomvlucht', x: -95, z: -1, r: 16, q: [-88.0, -2.75], level: 22, pad: 0.02 });
  PK_THEME.droom = { a: 0x8a5fb3, b: 0xf0c04a, ground: 0xb9a8c9, name: 'Droomvlucht', noBunting: true, noDecor: true, portal: function () {} };
  PK_KEEP.push([-95, -24, 13], [-95, -4, 13], [-95, 16, 13], [-95, 27, 9], [-77, -9, 8], [-77, -24, 6]);   // the woods stand round it, not in it

  // ── Materials ────────────────────────────────────────────────────
  var PK_DV_M = null;
  function pkDvNightTex() {
    return tex(512, 512, function (c, w, h) {
      var rnd = pkRng(321), gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a0d24'); gr.addColorStop(1, '#151a3a'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      for (var i = 0; i < 260; i++) { var r = rnd() < 0.9 ? 1 : 2; c.fillStyle = 'rgba(230,236,255,' + (0.4 + rnd() * 0.6).toFixed(2) + ')'; c.fillRect(rnd() * w, rnd() * h, r, r); }
    }, 1, 1);
  }
  function pkDvM() {
    if (PK_DV_M) return PK_DV_M;
    var M = pkMats(), X = PK_DV_M = {}, night = pkDvNightTex();
    X.stucco = std({ map: TEX.plaster, color: 0xf3ede2, roughness: 0.88 });
    X.trim = std({ map: TEX.plaster, color: 0xd9ccb2, roughness: 0.85 });
    X.base = std({ map: TEX.plaster, color: 0xa99d88, roughness: 0.92 });
    X.lilac = std({ map: TEX.plaster, color: 0xb79ad6, roughness: 0.8 });
    X.roof = std({ map: M.slate.map, color: 0x8a6ab8, roughness: 0.7, side: THREE.DoubleSide });
    X.roofBlue = std({ map: M.slate.map, color: 0x6f86cf, roughness: 0.7, side: THREE.DoubleSide });
    X.roofGrey = std({ map: M.slate.map, color: 0x6c6878, roughness: 0.8, side: THREE.DoubleSide });
    X.gold = M.gold; X.iron = M.iron; X.bark = M.bark; X.water = M.water; X.soil = M.soil;
    X.night = std({ map: night, color: 0xffffff, emissive: 0xffffff, emissiveMap: night, emissiveIntensity: 0.35, roughness: 1 }); X.night.userData.tile = [9, 9];
    X.dark = std({ color: 0x14162a, roughness: 1 });
    X.rail = std({ color: 0x3a3f46, roughness: 0.4, metalness: 0.6 });
    X.rock = std({ color: 0x6a6476, roughness: 0.95, flatShading: true });
    X.rockDark = std({ color: 0x3a3a44, roughness: 0.95, flatShading: true });
    X.trunk = std({ map: M.bark.map, color: 0x6a5a48, roughness: 1 });
    X.swampTrunk = std({ map: M.bark.map, color: 0x3e4632, roughness: 1 });
    X.leaf = [0x2f5a4a, 0x3a6a52, 0x284a40].map(function (c) { return std({ map: M.leafTex, color: c, roughness: 0.95, flatShading: true }); });
    X.moss = std({ color: 0x4a5a2a, roughness: 1, side: THREE.DoubleSide });
    X.mud = std({ map: M.water.map, color: 0x3a4a2a, roughness: 0.3, emissive: 0x0a1a08, emissiveIntensity: 0.4 });
    X.cloud = std({ color: 0xf0f2ff, roughness: 1, emissive: 0x30365a, emissiveIntensity: 0.5 });
    // the lit things answer to the scene, not to the park's lamps (part 01), so they start low and the tick sets them
    X.win = std({ color: 0x332211, emissive: 0xffd28a, emissiveIntensity: 0.4 });
    X.fall = std({ map: M.water.map, color: 0x9fd8ff, emissive: 0x6ab8ff, emissiveIntensity: 0.4, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
    X.shroom = std({ color: 0x4a2a5a, emissive: 0xff70d0, emissiveIntensity: 0.4 });
    X.elf = std({ color: 0x8aa890, emissive: 0xb8ffd8, emissiveIntensity: 0.4 });
    X.fairy = std({ color: 0x664422, emissive: 0xffe9a0, emissiveIntensity: 0.4 });
    X.petal = [0xf0a6c0, 0xb89ae0, 0xf6d36a, 0x9ad0f0].map(function (c) { return std({ color: c, emissive: c, emissiveIntensity: 0.3, roughness: 0.6, side: THREE.DoubleSide }); });
    X.sun = std({ color: 0xf0c040, emissive: 0xd09020, emissiveIntensity: 0.3, roughness: 0.6, side: THREE.DoubleSide });
    X.starA = std({ color: 0x222233, emissive: 0xeef2ff, emissiveIntensity: 0.4 });
    X.starB = std({ color: 0x222233, emissive: 0xfff2c8, emissiveIntensity: 0.4 });
    X.planet = [0x9a7ae0, 0xe08a6a, 0x6ac0e0].map(function (c) { return std({ color: c, emissive: c, emissiveIntensity: 0.25, roughness: 0.5 }); });
    X.comet = std({ color: 0x223344, emissive: 0xd8f0ff, emissiveIntensity: 0.4 });
    X.wisp = std({ color: 0x223322, emissive: 0xb8ff70, emissiveIntensity: 0.4 });
    X.troll = std({ color: 0x5a6a3a, roughness: 0.9 });
    X.oberon = std({ color: 0x6a3a8a, emissive: 0x3a1a5a, emissiveIntensity: 0.4, roughness: 0.6 });
    X.white = std({ color: 0xf4f2ee, roughness: 0.6, emissive: 0x404050, emissiveIntensity: 0.3 });
    X.brown = std({ color: 0x6a4a2e, roughness: 0.9 });
    X.globe = std({ color: 0x444444, emissive: 0xfff6e0, emissiveIntensity: 0.4 });
    X.blueLamp = std({ color: 0x112244, emissive: 0x5a9aff, emissiveIntensity: 0.4 });
    X.fog = new THREE.MeshBasicMaterial({ map: pkDmMistTex(), transparent: true, opacity: 0.5, depthWrite: false, color: 0xcfe0ff, side: THREE.DoubleSide });
    X.gondola = [0x1c2442, 0x1f2846, 0x1a2140, 0x202a48].map(function (c) { return std({ color: c, roughness: 0.45, metalness: 0.1 }); });
    X.seat = std({ color: 0x4a2a5a, roughness: 0.8 });
    return X;
  }

  // ── The course ───────────────────────────────────────────────────
  // the rail, as points the curve runs through (x, y, z): the station straight, the climb, the castles, the forest, the
  // garden, the star tunnel, the strongholds, the way down to the spiral, two turns down it, and back into the station
  function pkDvPoints() {
    var D = PK_DV, S = D.ST, P = D.SP, pts = [
      [S.x, S.y, S.z0], [S.x, S.y, -15.5], [S.x, S.y, S.z1],
      [-85.2, 3.5, -26.0], [-86.8, 4.8, -29.0], [-91.0, 6.2, -30.2], [-96.5, 7.2, -30.0], [-101.5, 7.9, -29.4],
      [-106.4, 8.5, -27.2], [-107.4, 9.5, -20.5], [-103.6, 10.0, -14.6], [-98.4, 10.6, -13.0],
      [-97.6, 11.0, -7.5], [-101.8, 11.4, -3.6], [-106.8, 11.0, 1.0],
      [-106.2, 10.0, 7.6], [-100.4, 9.0, 11.4], [-104.2, 8.5, 16.6],
      [-107.0, 9.0, 22.0], [-102.0, 9.4, 27.0], [-95.0, 10.0, 27.6],
      [-88.0, 11.4, 27.0], [-82.6, 12.4, 22.2], [-84.4, 13.0, 15.4], [-88.6, 13.0, 10.6], [P.x - P.r, P.y0 + 0.2, P.z + 2.2]
    ];
    // the spiral: two turns down, starting and ending at its west point heading -z
    for (var i = 0; i <= 32; i++) { var f = i / 32, th = Math.PI - 4 * Math.PI * (1 - f); pts.push([P.x + Math.cos(th) * P.r, P.y0 + (P.y1 - P.y0) * f, P.z + Math.sin(th) * P.r]); }
    // home: west under the strongholds, north up the corridor behind the station wall through the fog, round into the
    // arriving leg of the U and round its bend
    pts.push([-92.6, 3.9, 1.6], [-95.6, 3.65, 0.5], [-95.7, 3.55, -4.0], [-95.5, 3.5, -12], [-95.5, 3.4, -21.5], [-94.6, 3.3, -26.4], [-92.4, 3.2, -27.3],
      [-91, 3.2, -24], [-91, 3.2, -16], [-91, 3.2, -11], [-90.6, 3.2, -7.5], [-89.5, 3.2, -6.4], [-88, 3.2, -6.0], [-86.5, 3.2, -6.4], [-85.4, 3.2, -7.5]);
    return pts;
  }
  // where along the course each scene is, by the lead gondola's distance from the station head: the speed there
  function pkDvSpeed(D, s) {
    var L = D.L, v = 2.2;
    if (s > D.sSpiral0 && s < D.sSpiral1) v = 4.6;                     // fast down the spiral
    else if (s < D.sClimb) v = 1.8;                                    // the climb out of the station
    else if (s > D.sSpiral1) v = 1.6;                                  // the wake-up and the way home
    return Math.max(0.35, Math.min(v, 0.6 + s * 0.6, 0.6 + (L - s) * 0.45));   // eased out of the station and into it
  }
  function pkDvCourse() {
    var D = PK_DV, pts = pkDvPoints().map(function (p) { return new THREE.Vector3(p[0], p[1], p[2]); });
    var curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal'), L = curve.getLength(), n = Math.ceil(L / 0.25);
    var P = [], T = [];
    for (var i = 0; i <= n; i++) { var u = i / n; P.push(curve.getPointAt(u)); T.push(curve.getTangentAt(u)); }
    var sAt = function (x, z, y) { var best = 0, bd = 1e9; for (var k = 0; k <= n; k++) { var d = Math.pow(P[k].x - x, 2) + Math.pow(P[k].z - z, 2) + (y === undefined ? 0 : Math.pow(P[k].y - y, 2)); if (d < bd) { bd = d; best = k; } } return best / n * L; };
    D.curve = curve; D.L = L; D.n = n; D.P = P; D.T = T;
    D.sHead = sAt(D.ST.x, D.ST.z1);
    // distances counted from the station head, the way the gondolas go
    var rel = function (s) { return ((s - D.sHead) % L + L) % L; };
    D.sClimb = rel(sAt(-101.5, -29.4));
    D.sSpiral0 = rel(sAt(D.SP.x - D.SP.r, D.SP.z + 2.2, D.SP.y0 + 0.2));
    D.sSpiral1 = rel(sAt(-92.6, 1.2));
    D.sStationIn = rel(sAt(-91, -24, 3.2));            // the arriving leg: in from the corridor
    D.sUnload = D.sStationIn + 2.5;                     // where the riders get off
    D.sLoad0 = rel(sAt(-90.6, -7.5, 3.2));              // the bend of the U and the leg out: where they get on
    // the run: the time each stretch takes at its speed, summed; the table turns time back into distance
    var tab = [0], dt = 0, step = 0.5;
    for (var s = step; s <= L + 1e-6; s += step) { dt += step / pkDvSpeed(D, s - step / 2); tab.push(dt); }
    D.tab = tab; D.step = step; D.run = Math.ceil(dt) + 1;
    return D;
  }
  // the course at distance s from the station head: a point and the way along
  function pkDvAt(D, s, out, tan) {
    var a = ((D.sHead + s) % D.L + D.L) % D.L, f = a / D.L * D.n, k = Math.min(D.n - 1, Math.floor(f)), r = f - k;
    out.copy(D.P[k]).lerp(D.P[k + 1], r); if (tan) tan.copy(D.T[k]).lerp(D.T[k + 1], r).normalize();
    return out;
  }

  // ── The gondolas ─────────────────────────────────────────────────
  // a gondola for two, hung from its bogie on the rail by a curved arm behind the riders: a rounded tub in its own
  // colour, gilt rims, a cushioned bench, a star on its nose and a lap bar. The group sits on the rail; the tub hangs
  // HANG metres under it, swinging out a little on the curves.
  function pkDvGondola(g, i, seats, bars) {
    var D = PK_DV, X = pkDvM(), paint = X.gondola[i % X.gondola.length], gd = pkMover(g, D.ST.x, D.ST.y, D.ST.z1); gd.rotation.order = 'YXZ';
    box(0.42, 0.28, 0.9, X.rail, 0, 0.05, 0, { parent: gd, r: 0.04 });
    [-0.3, 0.3].forEach(function (z) { cyl(0.09, 0.06, X.iron, 0, 0.2, z, gd, 10).rotation.z = Math.PI / 2; });
    pkTube([[0, -0.08, -0.15], [0, -0.7, -0.55], [0, -1.6, -0.7], [0, -2.2, -0.55]], 0.06, X.rail, gd, false, 20, 8);
    var b = new THREE.Group(); b.position.y = -D.HANG; gd.add(b);
    box(1.34, 0.12, 1.2, paint, 0, -0.32, 0, { parent: b, r: 0.05 });
    box(1.34, 0.52, 0.1, paint, 0, -0.06, -0.55, { parent: b, r: 0.04 });
    box(1.34, 0.44, 0.1, paint, 0, -0.1, 0.56, { parent: b, r: 0.04 });
    [-1, 1].forEach(function (s) { box(0.1, 0.48, 1.2, paint, s * 0.67, -0.08, 0, { parent: b, r: 0.04 }); });
    box(1.4, 0.05, 0.06, X.gold, 0, 0.17, 0.58, b); box(1.4, 0.05, 0.06, X.gold, 0, 0.2, -0.58, b);
    [-1, 1].forEach(function (s) { box(0.06, 0.05, 1.24, X.gold, s * 0.7, 0.17, 0, b); });
    box(1.2, 0.12, 0.5, X.seat, 0, -0.06, -0.22, { parent: b, r: 0.04 });
    box(1.2, 0.5, 0.1, X.seat, 0, 0.2, -0.46, { parent: b, r: 0.04 });
    pkExtrude([[0, 0.16], [0.05, 0.05], [0.16, 0.05], [0.07, -0.02], [0.1, -0.13], [0, -0.06], [-0.1, -0.13], [-0.07, -0.02], [-0.16, 0.05], [-0.05, 0.05]], 0.03, X.gold, 0, -0.06, 0.62, b, 0.005);
    var mine = [];
    [-0.3, 0.3].forEach(function (x) { var st = { par: gd, x: x, y: -D.HANG - 0.02 - 0.76 + 0.02, z: -0.18, ry: 0, guest: null }; seats.push(st); mine.push(st); });
    var bar = pkMover(b, 0, 0.3, 0.0);
    pkTube([[-0.6, 0, 0], [-0.6, 0, 0.32], [0.6, 0, 0.32], [0.6, 0, 0]], 0.03, X.iron, bar, false, 14, 6);
    bars.push(bar);
    pkFuse(gd);
    return { g: gd, i: i, roll: 0, yaw: 0, s: 0, v: 0, seats: mine, bar: bar, barT: 1, hold: 0, unloaded: true };
  }

  // ── The scenes ───────────────────────────────────────────────────
  function pkDvRockPillar(par, x, z, h, r, seed) {
    var X = pkDvM(), rnd = pkRng(seed), y = 0;
    for (var k = 0; k < 3; k++) {
      var hh = h / 3 * (1.1 - k * 0.1), rr = r * (1 - k * 0.22), m = new THREE.Mesh(new THREE.CylinderGeometry(rr * 0.8, rr, hh, 7, 1), k % 2 ? X.rockDark : X.rock);
      m.position.set(x + (rnd() - 0.5) * 0.4, y + hh / 2, z + (rnd() - 0.5) * 0.4); m.rotation.y = rnd() * 3; m.castShadow = true; par.add(m); y += hh * 0.92;
    }
    return y;
  }
  // a fairy-tale castle: a keep and towers with pointed roofs, lit windows; built round (0, 0, 0) of its own group
  function pkDvCastle(par, x, y, z, s, roofM, seed) {
    var X = pkDvM(), rnd = pkRng(seed), c = new THREE.Group(); c.position.set(x, y, z); c.scale.setScalar(s); par.add(c);
    box(2.2, 1.8, 1.8, X.stucco, 0, 0.9, 0, c); box(2.3, 0.2, 1.9, X.trim, 0, 1.85, 0, c);
    for (var m = 0; m < 4; m++) box(0.3, 0.3, 0.3, X.stucco, -0.9 + m * 0.6, 2.1, 0.8, c);
    [[-1.1, -0.9, 3.4], [1.1, -0.9, 2.8], [1.1, 0.9, 3.8], [-1.1, 0.9, 2.6], [0, 0, 4.6]].forEach(function (t, k) {
      var tr = k === 4 ? 0.55 : 0.42; cyl(tr, t[2], X.stucco, t[0], t[2] / 2, t[1], c, 12);
      var cone = new THREE.Mesh(new THREE.ConeGeometry(tr * 1.3, tr * 3.2, 12), roofM); cone.position.set(t[0], t[2] + tr * 1.6, t[1]); cone.castShadow = true; c.add(cone);
      sphere(0.07, X.gold, t[0], t[2] + tr * 3.25, t[1], c);
      for (var w = 0; w < 2; w++) { var wa = rnd() * 6.28; box(0.12, 0.22, 0.04, X.win, t[0] + Math.cos(wa) * tr, t[2] * (0.45 + w * 0.3), t[1] + Math.sin(wa) * tr, c).rotation.y = -wa + Math.PI / 2; }
    });
    for (var w2 = 0; w2 < 4; w2++) box(0.18, 0.3, 0.04, X.win, -0.75 + w2 * 0.5, 1.1, 0.92, c);
    return c;
  }
  function pkDvTree(par, x, z, h, r, seed, canopyY) {
    var X = pkDvM(), rnd = pkRng(seed);
    cyl(r * 0.55, h, X.trunk, x, h / 2, z, par, 10, r);
    for (var k = 0; k < 4; k++) { var a = k / 4 * 6.28 + rnd(); var rt = pkRod(x, 0.6, z, x + Math.cos(a) * r * 2.2, 0.0, z + Math.sin(a) * r * 2.2, r * 0.35, X.trunk, par, 6); }
    for (var b = 0; b < 4; b++) { var ba = rnd() * 6.28, by = h * (0.55 + b * 0.1), bl = 2 + rnd() * 2; pkRod(x, by, z, x + Math.cos(ba) * bl, by + bl * 0.6, z + Math.sin(ba) * bl, r * 0.25, X.trunk, par, 6); }
    for (var c = 0; c < 7; c++) { var ca = rnd() * 6.28, cr = 1.6 + rnd() * 1.6, m = new THREE.Mesh(cachedGeo('pkdvleaf', function () { return new THREE.IcosahedronGeometry(1, 1); }), X.leaf[c % 3]); m.scale.set(cr, cr * 0.7, cr); m.position.set(x + Math.cos(ca) * rnd() * 3, (canopyY || h) + rnd() * 2, z + Math.sin(ca) * rnd() * 3); m.castShadow = true; par.add(m); }
  }
  function pkDvFlower(par, x, z, h, headR, petalM, seed) {
    var X = pkDvM(), rnd = pkRng(seed), f = new THREE.Group(); f.position.set(x, 0, z); par.add(f);
    pkTube([[0, 0, 0], [0.2, h * 0.4, 0.1], [-0.1, h * 0.75, 0], [0, h, 0]], headR * 0.07, X.leaf[1], f, false, 16, 6);
    var head = new THREE.Group(); head.position.y = h; head.rotation.x = -0.4 - rnd() * 0.4; head.rotation.y = rnd() * 6; f.add(head);
    for (var p = 0; p < 8; p++) { var a = p / 8 * 6.28, pm = sphere(headR * 0.45, petalM, Math.cos(a) * headR * 0.6, 0, Math.sin(a) * headR * 0.6, head); pm.scale.set(1, 0.25, 0.55); pm.rotation.y = -a; }
    sphere(headR * 0.3, X.win, 0, 0.05, 0, head).scale.set(1, 0.5, 1);
    var leaf = sphere(headR * 0.5, X.leaf[0], 0.3, h * 0.35, 0, f); leaf.scale.set(1, 0.15, 0.4);
    return f;
  }
  function pkDvHorse(par, x, y, z, ry, s, mat, horn) {
    var X = pkDvM(), m = new THREE.Mesh(pkHorseGeo(), mat); m.position.set(x, y, z); m.rotation.y = ry; m.scale.setScalar(s); m.castShadow = true; par.add(m);
    if (horn) { var hn = new THREE.Mesh(new THREE.ConeGeometry(0.03 * s, 0.35 * s, 8), X.gold); hn.position.set(x + Math.sin(ry) * 0.95 * s, y + 1.45 * s, z + Math.cos(ry) * 0.95 * s); hn.rotation.set(Math.cos(ry) * 0.7, 0, -Math.sin(ry) * 0.7); par.add(hn); }
    return m;
  }

  // ── The building ─────────────────────────────────────────────────
  // the great box: stucco walls with an arched frieze under a low slate roof, the night sky inside; its walls are solid
  // but for the doors in the front
  function pkDvShell(g) {
    var D = PK_DV, X = pkDvM(), x0 = D.X0, x1 = D.X1, z0 = D.Z0, z1 = D.Z1, H = D.H, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, W = x1 - x0, L = z1 - z0, T = 0.6;
    var doorAt = [[D.DOOR, 2.6, 4.2], [D.EXIT, 2.0, 3.0]];
    // the front (east) wall, its two doorways
    var front = [[z0, D.EXIT - 1.0], [D.EXIT + 1.0, D.DOOR - 1.3], [D.DOOR + 1.3, z1]];
    front.forEach(function (r) { box(T, H, r[1] - r[0], X.stucco, x1 - T / 2, H / 2, (r[0] + r[1]) / 2, g); solid(x1 - T, x1, r[0], r[1], 0, H); });
    doorAt.forEach(function (d) { box(T, H - d[2], d[1], X.stucco, x1 - T / 2, d[2] + (H - d[2]) / 2, d[0], g); });
    box(T, H, L, X.stucco, x0 + T / 2, H / 2, cz, g); solid(x0, x0 + T, z0, z1, 0, H);
    box(W, H, T, X.stucco, cx, H / 2, z0 + T / 2, g); solid(x0, x1, z0, z0 + T, 0, H);
    box(W, H, T, X.stucco, cx, H / 2, z1 - T / 2, g); solid(x0, x1, z1 - T, z1, 0, H);
    // inside: the night sky on the walls and the ceiling, a dark floor
    box(0.04, H, L - 1.2, X.night, x0 + T + 0.02, H / 2, cz, g);
    box(W - 1.2, H, 0.04, X.night, cx, H / 2, z0 + T + 0.02, g); box(W - 1.2, H, 0.04, X.night, cx, H / 2, z1 - T - 0.02, g);
    [[z0 + 0.6, D.HALL.z0 - 0.3], [D.HALL.z1 + 0.3, z1 - 0.6]].forEach(function (r) { box(0.04, H, r[1] - r[0], X.night, x1 - T - 0.02, H / 2, (r[0] + r[1]) / 2, g); });   // (the hall lines its own stretch)
    box(W, 0.3, L, X.night, cx, H + 0.15, cz, g);
    box(W - 1.2, 0.04, L - 1.2, X.dark, cx, 0.02, cz, g);
    // outside: a stone base, a string course, an arched frieze under the cornice, the roof
    [[x1 + 0.05, z0 - 0.1, D.EXIT - 1.0], [x1 + 0.05, D.EXIT + 1.0, D.DOOR - 1.3], [x1 + 0.05, D.DOOR + 1.3, z1 + 0.1]].forEach(function (r) { box(0.12, 1.0, r[2] - r[1], X.base, r[0], 0.5, (r[1] + r[2]) / 2, g); });
    [[x0 - 0.05, cz, 0.12, L + 0.2], [cx, z0 - 0.05, W + 0.2, 0.12], [cx, z1 + 0.05, W + 0.2, 0.12], [x1 + 0.05, cz, 0.12, L + 0.2]].forEach(function (b, bi) {
      if (bi < 3) box(b[2], 1.0, b[3], X.base, b[0], 0.5, b[1], g); box(b[2] + 0.1, 0.25, b[3] + 0.1, X.trim, b[0], 8.0, b[1], g); box(b[2] + 0.2, 0.5, b[3] + 0.2, X.trim, b[0], H - 0.1, b[1], g);
    });
    for (var fz = z0 + 1.0; fz < z1 - 0.5; fz += 1.6) [x0 - 0.12, x1 + 0.12].forEach(function (fx) { pkDmFrame(pkDmArch(1.3, 0.3, 0.9), pkDmArch(1.0, 0.28, 0.75), 0.1, X.trim, g, fx, H - 1.4, fz).rotation.y = Math.PI / 2; });
    for (var fx2 = x0 + 1.0; fx2 < x1 - 0.5; fx2 += 1.6) [z0 - 0.12, z1 + 0.12].forEach(function (fz2) { pkDmFrame(pkDmArch(1.3, 0.3, 0.9), pkDmArch(1.0, 0.28, 0.75), 0.1, X.trim, g, fx2, H - 1.4, fz2); });
    pkHipRoof(W + 1.2, L + 1.2, 4.5, X.roofGrey, cx, H, cz, g);
    // climbing roses up the walls
    for (var r = 0; r < 10; r++) { var rz = z0 + 4 + r * 6; pkDmIvy(g, x0 - 0.02, 0.6, rz, 2.4, 5 + (r % 3), -1, 0, 60 + r); }
  }
  // the palace front: the gatehouse round the entrance, two slender towers, the flower medallions, the round corner tower,
  // the exit porch and the lily ponds either side of the gatehouse, the slender towers standing in them
  function pkDvFront(g) {
    var D = PK_DV, X = pkDvM(), fx = D.X1, dz = D.DOOR;
    // the gatehouse: forward of the wall, a pointed portal and the round dream window, a crown of three turrets
    [-1, 1].forEach(function (s) { box(2.4, 13.0, 3.2, X.stucco, fx + 1.2, 6.5, dz + s * 2.9, g); box(2.6, 1.0, 3.3, X.base, fx + 1.3, 0.5, dz + s * 2.9, g); });
    box(2.4, 13.0 - 5.6, 2.6, X.stucco, fx + 1.2, 5.6 + (13.0 - 5.6) / 2, dz, g);
    [-1, 1].forEach(function (s) { box(2.4, 5.6, 0.06, X.night, fx + 1.2, 2.8, dz + s * 1.3, g); });
    box(2.4, 0.06, 2.6, X.night, fx + 1.2, 5.57, dz, g);
    box(2.6, 0.4, 9.4, X.trim, fx + 1.2, 13.1, dz, g);
    for (var m = 0; m < 7; m++) box(0.6, 0.9, 0.8, X.stucco, fx + 2.1, 13.7, dz - 3.9 + m * 1.3, g);
    solid(fx, fx + 2.4, dz - 4.5, dz - 1.4, 0, 13); solid(fx, fx + 2.4, dz + 1.4, dz + 4.5, 0, 13);
    var pf = pkDmFrame(pkDmArch(4.0, 3.6, 6.4), pkDmArch(2.6, 3.4, 5.4), 0.5, X.trim, g, fx + 2.25, 0, dz); pf.rotation.y = Math.PI / 2;
    box(0.2, 0.04, 2.6, X.trim, fx + 1.2, 0.02, dz, g);
    pkDmRose(g, fx + 2.45, 9.7, dz, Math.PI / 2, 1.9, X.night, X.gold);
    var moon = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.9, 24, 1, 0.6, 3.6), X.win); moon.position.set(fx + 2.5, 9.7, dz); moon.rotation.y = Math.PI / 2; g.add(moon);
    sign(['DROOMVLUCHT'], 4.6, 0.7, fx + 2.52, 7.05, dz, Math.PI / 2, { bg: '#2a1f4a', fg: '#f0d8ff' }, g);
    [-3.2, 0, 3.2].forEach(function (o, k) {
      var tz = dz + o, th = k === 1 ? 3.0 : 2.0, tr = k === 1 ? 0.9 : 0.6;
      cyl(tr, th, X.stucco, fx + 1.6, 13.4 + th / 2, tz, g, 14);
      var c = new THREE.Mesh(new THREE.ConeGeometry(tr * 1.35, tr * 4.0, 14), k === 1 ? X.roof : X.roofBlue); c.position.set(fx + 1.6, 13.4 + th + tr * 2, tz); c.castShadow = true; g.add(c);
      sphere(0.12, X.gold, fx + 1.6, 13.4 + th + tr * 4.05, tz, g);
      box(0.06, 0.5, 0.25, X.win, fx + 1.6 + tr, 13.4 + th * 0.55, tz, g);
    });
    // the slender towers either side of the gatehouse
    [-1, 1].forEach(function (s) {
      var tz = dz + s * 5.6;
      cyl(1.05, 17.0, X.stucco, fx + 1.0, 8.5, tz, g, 16); box(2.4, 1.0, 2.4, X.base, fx + 1.0, 0.5, tz, g);
      pkRing(1.08, 0.08, X.trim, fx + 1.0, 8.0, tz, g, 24); pkRing(1.1, 0.1, X.trim, fx + 1.0, 16.6, tz, g, 24);
      var c = new THREE.Mesh(new THREE.ConeGeometry(1.45, 6.0, 16), X.roof); c.position.set(fx + 1.0, 20.0, tz); c.castShadow = true; g.add(c);
      pkRod(fx + 1.0, 22.9, tz, fx + 1.0, 24.0, tz, 0.04, X.gold, g, 6); sphere(0.16, X.gold, fx + 1.0, 23.4, tz, g);
      [5, 9, 13].forEach(function (y) { pkDmLancet(g, fx + 2.06, y, tz, Math.PI / 2, 0.45, 1.5, X.win, X.trim); });
      solid(fx, fx + 2.1, tz - 1.1, tz + 1.1, 0, 17);
    });
    // the flower medallions, great roses of eight petals, either side
    [[D.DOOR - 10.5, 0], [D.DOOR + 10.0, 1]].forEach(function (fm) {
      var f = new THREE.Group(); f.position.set(fx + 0.15, 8.5, fm[0]); f.rotation.y = Math.PI / 2; g.add(f);
      for (var p = 0; p < 8; p++) { var a = p / 8 * 6.28, pm = sphere(0.9, X.petal[fm[1] ? 0 : 2], Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0.15, f); pm.scale.set(1, 0.6, 0.25); pm.rotation.z = a; }
      sphere(0.7, X.petal[1], 0, 0, 0.3, f).scale.set(1, 1, 0.4); pkRing(2.3, 0.1, X.gold, 0, 0, 0.1, f, 40, false);
      for (var l = 0; l < 6; l++) { var la = l / 6 * 6.28 + 0.3; var lf = sphere(0.5, X.leaf[1], Math.cos(la) * 2.6, Math.sin(la) * 2.6, 0.05, f); lf.scale.set(1, 0.35, 0.15); lf.rotation.z = la; }
    });
    // the round corner tower at the north end of the front
    var rx = fx + 1.0, rz = D.Z0 + 3.0;
    cyl(3.2, 18.0, X.stucco, rx, 9.0, rz, g, 24); box(6.8, 1.0, 6.8, X.base, rx, 0.5, rz, g);
    pkRing(3.25, 0.12, X.trim, rx, 8.0, rz, g, 40); pkRing(3.3, 0.16, X.trim, rx, 17.8, rz, g, 40);
    for (var cr = 0; cr < 16; cr++) { var ca = cr / 16 * 6.28; box(0.6, 0.8, 0.5, X.stucco, rx + Math.cos(ca) * 3.15, 18.4, rz + Math.sin(ca) * 3.15, g).rotation.y = -ca; }
    var tc = new THREE.Mesh(new THREE.ConeGeometry(3.8, 9.0, 24), X.roof); tc.position.set(rx, 23.0, rz); tc.castShadow = true; g.add(tc);
    pkRod(rx, 27.4, rz, rx, 29.4, rz, 0.06, X.gold, g, 6); sphere(0.28, X.gold, rx, 28.0, rz, g);
    var moonV = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.5, 16, 1, 0.6, 3.6), X.gold); moonV.position.set(rx, 29.2, rz); g.add(moonV);
    [0.6, 1.4, 2.2].forEach(function (a) { [6, 11, 15].forEach(function (y) { pkDmLancet(g, rx + Math.cos(a) * 3.22, y, rz + Math.sin(a) * 3.22, Math.PI / 2 - a, 0.6, 1.8, X.win, X.trim); }); });
    solid(rx - 3.2, rx + 3.2, rz - 3.2, rz + 3.2, 0, 18);
    // the exit porch: a little gabled roof on posts over the door, its sign
    var ez = D.EXIT;
    [-1, 1].forEach(function (s) { cyl(0.12, 3.2, X.trim, fx + 2.0, 1.6, ez + s * 1.2, g, 10); });
    var pr = new THREE.Group(); pr.position.set(fx + 1.1, 3.2, ez); pr.rotation.y = Math.PI / 2; g.add(pr); pkGableRoof(3.0, 2.4, 1.2, X.roof, X.stucco, 0, 0, 0, pr, 0.2);
    sign(['UITGANG  *  DROMERIJEN'], 2.4, 0.36, fx + 2.15, 2.8, ez, Math.PI / 2, { bg: '#2a1f4a', fg: '#f0d8ff' }, g);
    [[dz - 11.2, dz - 4.7], [dz + 4.7, dz + 11.2]].forEach(function (pz, k) {
      var px0 = fx + 0.2, px1 = fx + 3.7, cz = (pz[0] + pz[1]) / 2, pw = pz[1] - pz[0];
      var mx = (px0 + px1) / 2 + 0.25, mw = px1 - px0 + 0.5;
      box(mw, 0.5, 0.3, X.base, mx, 0.25, pz[0] - 0.1, g); box(mw, 0.5, 0.3, X.base, mx, 0.25, pz[1] + 0.1, g); box(0.3, 0.5, pw + 0.5, X.base, px1 + 0.4, 0.25, cz, g);
      box(mw - 0.3, 0.04, pw, X.dark, mx - 0.15, 0.04, cz, g);
      var wtr = new THREE.Mesh(new THREE.PlaneGeometry(mw - 0.3, pw), X.water); wtr.rotation.x = -Math.PI / 2; wtr.position.set(mx - 0.15, 0.36, cz); g.add(wtr);
      for (var lp = 0; lp < 6; lp++) { var lx = px0 + 0.8 + (lp % 2) * 1.6, lz = pz[0] + 0.9 + Math.floor(lp / 2) * 2.0; if (Math.abs(lz - (dz + (k ? 5.6 : -5.6))) < 1.4 && lx < fx + 2.2) continue; sphere(0.28, X.leaf[1], lx, 0.42, lz, g).scale.set(1, 0.1, 1); if (lp % 2) sphere(0.1, X.petal[0], lx, 0.48, lz, g); }
      solid(px0, px1 + 0.5, pz[0] - 0.25, pz[1] + 0.25, 0, 0.8);
    });
    // light globes on posts along the front, and a little paved court before the gate
    [-13.6, -3.6, 3.6, 13.6].forEach(function (o) { var lz2 = dz + o; cyl(0.06, 3.6, X.iron, fx + 4.4, 1.8, lz2, g, 8); sphere(0.24, X.globe, fx + 4.4, 3.8, lz2, g); });
    box(4.0, 0.05, 9.0, pkPadMat(0xc9b0d9), fx + 4.0, 0.03, dz, g);
    box(4.0, 0.05, 4.0, pkPadMat(0xc9b0d9), fx + 4.0, 0.03, D.EXIT, g);
    box(2.5, 0.05, 2.6, pkPadMat(0xc9b0d9), fx + 1.2, 0.035, dz, g); box(2.2, 0.05, 2.6, pkPadMat(0xc9b0d9), fx + 1.1, 0.035, D.EXIT, g);
    box(0.7, 0.05, 2.6, pkPadMat(0xc9b0d9), fx - 0.3, 0.035, dz, g); box(0.7, 0.05, 2.0, pkPadMat(0xc9b0d9), fx - 0.3, 0.035, D.EXIT, g);
  }
  // the station hall, as Efteling's is: the rail runs in a U, the gondolas come down one leg, round the bend and away up
  // the other, the operator's booth standing in the middle of the U. Cream walls painted with gold stars over a gold
  // stripe and a dark green dado, a tiled floor with the gondolas' guide slot in it and the moving walkway along the
  // boarding side, black columns, small lamps in a dark ceiling. Walled off from the dream; the rail comes in and goes out
  // through two low portals in the north wall.
  function pkDvStarTex() {
    return tex(256, 256, function (c, w, h) {
      var rnd = pkRng(44); c.fillStyle = '#e9e1cc'; c.fillRect(0, 0, w, h);
      for (var i = 0; i < 2000; i++) { c.fillStyle = 'rgba(120,100,70,' + (rnd() * 0.06).toFixed(3) + ')'; c.fillRect(rnd() * w, rnd() * h, 2, 2); }
      for (var s = 0; s < 9; s++) { var x = rnd() * w, y = rnd() * h, r = 5 + rnd() * 5; c.fillStyle = '#7a6338'; c.beginPath(); for (var k = 0; k < 8; k++) { var a = k / 8 * 6.283, rr = k % 2 ? r * 0.25 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 1.4); } c.closePath(); c.fill(); }
    }, 1, 1);
  }
  function pkDvTileTex() {
    return tex(256, 256, function (c, w, h) {
      var rnd = pkRng(45); c.fillStyle = '#3a3630'; c.fillRect(0, 0, w, h);
      for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) { c.fillStyle = (x + y) % 2 ? pkDmShade('#a89c88', 0.92 + rnd() * 0.1) : pkDmShade('#8a7e6c', 0.92 + rnd() * 0.1); c.fillRect(x * 64 + 1, y * 64 + 1, 62, 62); }
    }, 1, 1);
  }
  function pkDvHall(g) {
    var D = PK_DV, X = pkDvM(), H = D.HALL, h = H.h, T = 0.3, legA = -91, legB = -85, U = { x: -88, z: -9, r: 3 };
    var cream = std({ map: pkDvStarTex(), roughness: 0.85 }); cream.userData.tile = [3, 3];
    var green = std({ color: 0x324a36, roughness: 0.7 }), stripe = std({ color: 0xc9962a, roughness: 0.5, metalness: 0.3 });
    var tile = std({ map: pkDvTileTex(), roughness: 0.6 }); tile.userData.tile = [1.6, 1.6];
    var wall = function (x0, x1, z0, z1, y0, y1) { box(x1 - x0, y1 - y0, z1 - z0, X.stucco, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, g); if (y0 < 1.6) solid(x0, x1, z0, z1, y0, y1); };
    // the walls: the west wall, the south wall, the north wall with its two portals (the front wall is the building's)
    wall(H.x0 - T, H.x0, H.z0 - T, H.z1 + T, 0, h);
    wall(H.x0, H.x1, H.z1, H.z1 + T, 0, h);
    [[H.x0, legA - 1.1], [legA + 1.1, legB - 1.1], [legB + 1.1, H.x1]].forEach(function (r) { wall(r[0], r[1], H.z0 - T, H.z0, 0, h); });
    [legA, legB].forEach(function (x) { wall(x - 1.1, x + 1.1, H.z0 - T, H.z0, 4.2, h); });
    // their inside face: the dado, the cream with its stars, the gold stripe; a run of these along a wall, with gaps
    var line = function (ax, az, bx, bz, nx, nz, gaps) {
      var L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, cuts = [[0, L]];
      (gaps || []).forEach(function (gp) { var out = []; cuts.forEach(function (c) { if (gp[1] <= c[0] || gp[0] >= c[1]) out.push(c); else { if (gp[0] > c[0]) out.push([c[0], gp[0]]); if (gp[1] < c[1]) out.push([gp[1], c[1]]); } }); cuts = out; });
      cuts.forEach(function (c) {
        var m = (c[0] + c[1]) / 2, len = c[1] - c[0], px = ax + ux * m + nx * 0.03, pz = az + uz * m + nz * 0.03, ry = Math.atan2(ux, uz) + Math.PI / 2;
        [[0, 1.15, green], [1.15, h, cream]].forEach(function (b) { var bx2 = box(len, b[1] - b[0], 0.04, b[2], px, (b[0] + b[1]) / 2, pz, g); bx2.rotation.y = ry; });
        var sb = box(len, 0.22, 0.06, stripe, px + nx * 0.02, 3.3, pz + nz * 0.02, g); sb.rotation.y = ry;
        var cap = box(len, 0.06, 0.08, std({ color: 0x1e2a20, roughness: 0.6 }), px + nx * 0.02, 1.18, pz + nz * 0.02, g); cap.rotation.y = ry;
      });
    };
    line(H.x0, H.z0, H.x0, H.z1, 1, 0);
    line(H.x0, H.z1, H.x1 - 0.6, H.z1, 0, -1);
    line(H.x1 - 0.6, H.z0, H.x0, H.z0, 0, 1, [[H.x1 - 0.6 - legB - 1.1, H.x1 - 0.6 - legB + 1.1], [H.x1 - 0.6 - legA - 1.1, H.x1 - 0.6 - legA + 1.1]]);
    line(H.x1 - 0.6, H.z1, H.x1 - 0.6, H.z0, -1, 0, [[H.z1 - D.DOOR - 1.3, H.z1 - D.DOOR + 1.3], [H.z1 - D.EXIT - 1.0, H.z1 - D.EXIT + 1.0]]);
    // the ceiling and its lamps, the tiled floor, the guide slot under the rail, the moving walkway on the boarding side
    box(H.x1 - H.x0 + T, 0.3, H.z1 - H.z0 + 2 * T, X.dark, (H.x0 + H.x1) / 2, h + 0.15, (H.z0 + H.z1) / 2, g);
    for (var k = 0; k < 12; k++) { var lx = H.x0 + 1.2 + (k % 2) * (H.x1 - H.x0 - 3.0), lz = H.z0 + 1.5 + Math.floor(k / 2) * 4.0; cyl(0.14, 0.06, X.globe, lx, h - 0.03, lz, g, 12); }
    box(H.x1 - H.x0, 0.05, H.z1 - H.z0, tile, (H.x0 + H.x1) / 2, 0.03, (H.z0 + H.z1) / 2, g);
    var slot = std({ color: 0x15171a, roughness: 0.4, metalness: 0.5 }), walk = std({ color: 0x2a2c30, roughness: 0.9 });
    [legA, legB].forEach(function (x) { [-0.06, 0.06].forEach(function (o) { box(0.03, 0.02, H.z0 - U.z > 0 ? 0 : U.z - H.z0, slot, x + o, 0.065, (H.z0 + U.z) / 2, g); }); });
    for (var a2 = 0; a2 < 12; a2++) { var t0 = a2 / 12 * Math.PI, t1 = (a2 + 1) / 12 * Math.PI, tm = (t0 + t1) / 2; var sg2 = box(0.1, 0.02, U.r * (t1 - t0) + 0.02, slot, U.x - Math.cos(tm) * U.r, 0.065, U.z + Math.sin(tm) * U.r, g); sg2.rotation.y = -tm; }
    box(1.0, 0.04, U.z - H.z0 - 1.0, walk, legB + 1.25, 0.07, (H.z0 + 1.0 + U.z) / 2, g);
    box(1.0, 0.05, U.z - H.z0 - 1.0, X.gold, legB + 0.72, 0.075, (H.z0 + 1.0 + U.z) / 2, g).scale.x = 0.06;
    // the black columns in the U
    [[U.x, -11.4]].forEach(function (c) { cyl(0.22, h, X.dark, c[0], h / 2, c[1], g, 14); box(0.8, 0.5, 0.8, X.dark, c[0], 0.25, c[1], g); solid(c[0] - 0.4, c[0] + 0.4, c[1] - 0.4, c[1] + 0.4, 0, h); });
    sign(['UITGANG'], 1.2, 0.3, H.x1 - 0.7, 3.0, D.EXIT, -Math.PI / 2, { bg: '#123a22', fg: '#c8ffd8' }, g);
    pkDvHallDress(g, legA, legB, U, h);
    var lt = new THREE.PointLight(0xffe8c8, 1.2, 22, 1.6); lt.position.set(-87, 5.6, -13); g.add(lt);
  }
  // the station's dressing: the track's own band in the floor with its yellow safety edges, the moving walkway round the
  // outside of the U, the railed way from the doors to the queue (kept apart from the platform and the riders leaving), a
  // gilt arch round the doors, a planter round the column and a lit gilt star in the middle of the U, and along the walls
  // the dreams in gilt frames, lamps on brackets, plants in pots and a bench by the way out
  function pkDvHallDress(g, legA, legB, U, h) {
    var D = PK_DV, X = pkDvM(), H = D.HALL, band = std({ color: 0x24262c, roughness: 0.8 }), yel = std({ color: 0xe0b020, roughness: 0.6 }), belt = std({ color: 0x1c1d20, roughness: 0.9 });
    var run = function (ax, az, bx, bz, w, mat, y) { var L = Math.hypot(bx - ax, bz - az), b = box(w, 0.02, L, mat, (ax + bx) / 2, y, (az + bz) / 2, g); b.rotation.y = Math.atan2(bx - ax, bz - az); return b; };
    var path = function (r, w, mat, y, also) {   // a strip that follows the rail: down a leg, round the bend, up the other, r out from it
      run(legA - r, H.z0, legA - r, U.z, w, mat, y); run(legB + r, H.z0, legB + r, U.z, w, mat, y);
      for (var k = 0; k < 16; k++) { var t0 = k / 16 * Math.PI, t1 = (k + 1) / 16 * Math.PI, R0 = U.r + r; run(U.x - Math.cos(t0) * R0, U.z + Math.sin(t0) * R0, U.x - Math.cos(t1) * R0, U.z + Math.sin(t1) * R0, w, mat, y); }
    };
    path(0, 1.7, band, 0.058); path(-0.9, 0.08, yel, 0.062); path(0.9, 0.08, yel, 0.062);
    // the moving walkway along the outside, grooved, between gilt edges
    path(1.15, 0.8, belt, 0.075); path(1.57, 0.05, X.gold, 0.085); path(0.73, 0.05, X.gold, 0.085);
    for (var gz = H.z0 + 1.2; gz < U.z; gz += 0.5) [legA - 1.15, legB + 1.15].forEach(function (gx) { box(0.7, 0.012, 0.04, std({ color: 0x3a3c42, roughness: 0.8 }), gx, 0.088, gz, g); });
    // the railed way in: the door, a rail on its platform side and one between it and the way out
    var rail = function (ax, az, bx, bz) {
      var L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(L / 1.2));
      pkRod(ax, 1.0, az, bx, 1.0, bz, 0.035, X.gold, g, 8); pkRod(ax, 0.5, az, bx, 0.5, bz, 0.02, X.iron, g, 6);
      for (var i = 0; i <= n; i++) { var f = i / n, px = ax + (bx - ax) * f, pz = az + (bz - az) * f; cyl(0.04, 1.0, std({ color: 0x1a2236, roughness: 0.5 }), px, 0.5, pz, g, 8); sphere(0.06, X.gold, px, 1.04, pz, g); }
      solid(Math.min(ax, bx) - 0.06, Math.max(ax, bx) + 0.06, Math.min(az, bz) - 0.06, Math.max(az, bz) + 0.06, 0, 1.0);
    };
    rail(-83.3, D.DOOR - 1.5, -83.3, -7.95); rail(-83.3, -5.45, -83.3, -4.85); rail(-83.3, -4.85, D.X1 - 0.7, -4.85); rail(-83.3, D.DOOR - 1.5, D.X1 - 0.7, D.DOOR - 1.5);   // the gate is in the platform side, on the walkway
    box(2.7, 0.04, 5.8, pkPadMat(0xc9b0d9), -81.95, 0.07, -7.6, g);
    sign(['DROOMVLUCHT  >'], 1.4, 0.26, -83.24, 1.35, -9.25, Math.PI / 2, { bg: '#1a2236', fg: '#e8c870' }, g);
    // the doors' gilt arch inside, and a globe either side
    var arch = pkDmFrame(pkDmArch(3.4, 3.6, 5.0), pkDmArch(2.6, 3.4, 4.6), 0.12, X.gold, g, D.X1 - 0.66, 0, D.DOOR); arch.rotation.y = Math.PI / 2;
    [-1.9, 1.9].forEach(function (o) { pkRod(D.X1 - 0.62, 2.8, D.DOOR + o, D.X1 - 0.95, 2.8, D.DOOR + o, 0.02, X.gold, g, 6); sphere(0.17, X.globe, D.X1 - 0.95, 2.62, D.DOOR + o, g); });
    // the middle of the U: a planter round the column, a gilt star lit on a pedestal, low planters
    cyl(1.0, 0.55, X.trim, U.x, 0.28, -11.4, g, 24); cyl(0.92, 0.06, X.soil, U.x, 0.56, -11.4, g, 24);
    for (var f2 = 0; f2 < 10; f2++) { var fa = f2 / 10 * 6.283; sphere(0.2, X.petal[f2 % 4], U.x + Math.cos(fa) * 0.65, 0.68, -11.4 + Math.sin(fa) * 0.65, g).scale.set(1, 0.7, 1); }
    solid(U.x - 1.0, U.x + 1.0, -12.4, -10.4, 0, 0.6);
    cyl(0.32, 1.0, std({ color: 0x1a2236, roughness: 0.5 }), U.x, 0.5, -16.2, g, 16); pkRing(0.33, 0.03, X.gold, U.x, 1.0, -16.2, g, 24);
    var starM = std({ color: 0x6a4a10, emissive: 0xffd070, emissiveIntensity: 0.8, roughness: 0.4, metalness: 0.6 });
    var star = pkExtrude([[0, 0.5], [0.12, 0.16], [0.48, 0.16], [0.2, -0.06], [0.3, -0.42], [0, -0.2], [-0.3, -0.42], [-0.2, -0.06], [-0.48, 0.16], [-0.12, 0.16]], 0.1, starM, U.x, 1.6, -16.2, g, 0.02); star.rotation.y = Math.PI / 2;
    solid(U.x - 0.35, U.x + 0.35, -16.55, -15.85, 0, 1.2);
    // the walls: the dreams in gilt frames, lamps on brackets
    var art = function (seed, sky, ground, moon) { return tex(256, 180, function (c, w, hh) { var rnd = pkRng(seed), gr = c.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, sky[0]); gr.addColorStop(1, sky[1]); c.fillStyle = gr; c.fillRect(0, 0, w, hh); for (var i = 0; i < 40; i++) { c.fillStyle = 'rgba(255,240,200,' + (0.3 + rnd() * 0.6).toFixed(2) + ')'; c.fillRect(rnd() * w, rnd() * hh * 0.6, 2, 2); } c.fillStyle = '#f0d890'; c.beginPath(); c.arc(moon[0], moon[1], 16, 0, 6.3); c.fill(); c.fillStyle = sky[0]; c.beginPath(); c.arc(moon[0] + 7, moon[1] - 4, 14, 0, 6.3); c.fill(); c.fillStyle = ground; c.beginPath(); c.moveTo(0, hh); for (var x = 0; x <= w; x += 16) c.lineTo(x, hh * 0.72 - Math.abs(Math.sin(x * 0.03 + seed)) * 30 - (x > w * 0.35 && x < w * 0.55 ? 40 : 0)); c.lineTo(w, hh); c.fill(); }, 1, 1); };
    var pics = [[art(1, ['#1a2050', '#6a5aa0'], '#2a2040', [200, 40]), H.x0 + 0.06, -19.5, Math.PI / 2], [art(2, ['#20304a', '#6aa0b0'], '#1a3020', [60, 50]), H.x0 + 0.06, -12.5, Math.PI / 2], [art(3, ['#3a1a40', '#c08ab0'], '#3a2030', [170, 35]), H.x0 + 0.06, -5.5, Math.PI / 2], [art(4, ['#101a40', '#4060a0'], '#202848', [90, 40]), -91.5, H.z1 - 0.06, Math.PI], [art(5, ['#2a1a10', '#a07040'], '#3a2a18', [180, 45]), -87.0, H.z1 - 0.06, Math.PI]];
    pics.forEach(function (pc) { var fr = new THREE.Group(); fr.position.set(pc[1], 2.25, pc[2]); fr.rotation.y = pc[3]; g.add(fr); box(1.62, 1.18, 0.06, X.gold, 0, 0, 0, fr); var cv = new THREE.Mesh(new THREE.PlaneGeometry(1.44, 1.0), std({ map: pc[0], roughness: 0.8 })); cv.position.z = 0.035; fr.add(cv); });
    [[H.x0 + 0.1, -22.5, 1], [H.x0 + 0.1, -16, 1], [H.x0 + 0.1, -9, 1], [H.x0 + 0.1, -2.5, 1], [-89.5, H.z1 - 0.1, 0], [-84.5, H.z1 - 0.1, 0]].forEach(function (l) { var dx = l[2] ? 0.35 : 0, dz = l[2] ? 0 : -0.35; pkRod(l[0], 3.0, l[1], l[0] + dx, 3.0, l[1] + dz, 0.02, X.gold, g, 6); sphere(0.14, X.globe, l[0] + dx, 2.85, l[1] + dz, g); });
    // plants in pots, and a bench by the way out
    [[-93.4, -23.3], [-81.1, -23.4], [-93.4, -1.6], [-81.1, -12.4]].forEach(function (pp) { cyl(0.28, 0.55, X.lilac, pp[0], 0.28, pp[1], g, 14, 0.22); for (var lf = 0; lf < 5; lf++) sphere(0.26, X.leaf[lf % 3], pp[0] + Math.cos(lf * 1.3) * 0.15, 0.85 + (lf % 2) * 0.25, pp[1] + Math.sin(lf * 1.3) * 0.15, g); solid(pp[0] - 0.3, pp[0] + 0.3, pp[1] - 0.3, pp[1] + 0.3, 0, 1); });
    var bw = std({ color: 0x6a4428, roughness: 0.7 }); box(0.45, 0.08, 1.6, bw, -81.0, 0.45, -18.0, g); box(0.06, 0.5, 1.6, bw, -80.8, 0.75, -18.0, g); [-0.7, 0.7].forEach(function (o) { box(0.4, 0.42, 0.06, X.iron, -81.0, 0.21, -18.0 + o, g); });
  }
  // the operator's booth in the middle of the U, built for the ride: dark navy panelling below, glass all round above,
  // a navy roof band, a glazed door at its south end; the desk looks east over the boarding leg
  function pkDvBooth(g, a) {
    var X = pkDvM(), x0 = -90.1, x1 = -85.9, z0 = -23.95, z1 = -19.6, F = 0.12, Hb = 2.8;   // against the north wall, between the rail's way in and way out
    var navy = std({ color: 0x1a2236, roughness: 0.5, metalness: 0.2 }), glass = std({ color: 0x9fb6cc, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.25 });
    box(x1 - x0, F, z1 - z0, std({ map: TEX.wood, color: 0x6a4a30, roughness: 0.6 }), (x0 + x1) / 2, F / 2, (z0 + z1) / 2, g);
    for (var sl = 0; sl < 9; sl++) cyl(0.04, 0.02, X.globe, x0 + 0.5 + (sl % 3) * 1.1, Hb - 0.01, z0 + 0.8 + Math.floor(sl / 3) * 1.7, g, 10);
    box(x1 - x0 - 0.2, 0.06, z1 - z0 - 0.2, X.gold, (x0 + x1) / 2, Hb - 0.02, (z0 + z1) / 2, g).scale.set(1, 1, 1);
    var side = function (ax, az, bx, bz, gapA, gapB) {
      var L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, ry = Math.atan2(ux, uz) + Math.PI / 2, segs = gapA !== undefined ? [[0, gapA], [gapB, L]] : [[0, L]];
      segs.forEach(function (s) {
        if (s[1] - s[0] < 0.01) return; var m = (s[0] + s[1]) / 2, px = ax + ux * m, pz = az + uz * m, len = s[1] - s[0];
        [[0, 1.0, navy, 0.1], [1.0, 2.4, glass, 0.04], [2.4, Hb, navy, 0.1]].forEach(function (b) { var bb = box(len, b[1] - b[0], b[3], b[2], px, (b[0] + b[1]) / 2, pz, g); bb.rotation.y = ry; if (b[2] === glass) bb.userData.noBake = true; });
        solid(Math.min(ax + ux * s[0], ax + ux * s[1]) - 0.06, Math.max(ax + ux * s[0], ax + ux * s[1]) + 0.06, Math.min(az + uz * s[0], az + uz * s[1]) - 0.06, Math.max(az + uz * s[0], az + uz * s[1]) + 0.06, 0, Hb);
      });
      if (gapA !== undefined) { var gm = (gapA + gapB) / 2, bx3 = box(gapB - gapA, Hb - 2.1, 0.1, navy, ax + ux * gm, 2.1 + (Hb - 2.1) / 2, az + uz * gm, g); bx3.rotation.y = ry; }
    };
    // glass on the three sides that look over the station, the door in the west one; the back is a solid wall, and everything
    // the room holds stands against it, so the glass is clear
    side(x1, z0, x1, z1); side(x0, z0, x0, z1, 1.3, 2.25); side(x0, z1, x1, z1);
    box(x1 - x0, Hb, 0.04, navy, (x0 + x1) / 2, Hb / 2, z0 + 0.02, g); solid(x0, x1, z0, z0 + 0.12, 0, Hb);
    [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(function (c) { box(0.12, Hb, 0.12, navy, c[0], Hb / 2, c[1], g); });
    box(x1 - x0 + 0.3, 0.16, z1 - z0 + 0.3, navy, (x0 + x1) / 2, Hb + 0.08, (z0 + z1) / 2, g);
    sign(['DROOMVLUCHT'], 1.8, 0.24, x1 + 0.08, 2.6, (z0 + z1) / 2, Math.PI / 2, { bg: '#1a2236', fg: '#e8c870' }, g);
    // its door: navy, glazed above, swinging out to the west
    var hinge = pkMover(g, x0, F, z0 + 1.3); hinge.rotation.y = 0;
    box(0.06, 2.05, 0.93, navy, 0, 1.03, 0.47, hinge); var dg = box(0.07, 0.7, 0.6, glass, 0, 1.5, 0.47, hinge); dg.userData.noBake = true;
    sphere(0.035, X.gold, 0.06, 1.0, 0.82, hinge);
    pkRoomDoor(hinge, 0.95, 2.05, -Math.PI / 2 * 0.95, 'the booth door', a);
    pkRoomKit(g, a, { x: (x0 + x1) / 2, z: (z0 + z1) / 2, y: 0, ry: Math.PI, W: x1 - x0, D: z1 - z0, H: Hb, cabBack: true, cabAt: [-1.5, 1.15], key: [-0.78, 1.9], clock: [0, 2.42], tc: [0.95, 1.3], sw: [(x1 - x0) / 2 - 0.35, (z1 - z0) / 2 - 0.06, Math.PI, 1.25], mon: [0, 2.15, -(z1 - z0) / 2 + 0.6, 0], console: 'droom' });
  }
  // the rail: an I-beam along the whole course, hung from the roof on rods (or from the swamp tree on arms in the spiral)
  function pkDvRail(g) {
    var D = PK_DV, X = pkDvM();
    var tube = new THREE.Mesh(new THREE.TubeGeometry(D.curve, Math.ceil(D.L / 0.5), 0.09, 6, true), X.rail); tube.castShadow = true; g.add(tube);
    var top = new THREE.CatmullRomCurve3(D.curve.points.map(function (p) { return new THREE.Vector3(p.x, p.y + 0.2, p.z); }), true, 'centripetal');
    var web = new THREE.Mesh(new THREE.TubeGeometry(top, Math.ceil(D.L / 0.5), 0.05, 5, true), X.rail); g.add(web);
    var P = D.P, n = D.n, step = Math.round(4.5 / (D.L / n));
    for (var i = 0; i < n; i += step) {
      var p = P[i], dsp = Math.hypot(p.x - D.SP.x, p.z - D.SP.z);
      if (dsp < D.SP.r + 0.5 && p.y < D.SP.y0 + 0.5 && p.y > D.SP.y1 - 0.5) { var ax = D.SP.x + (p.x - D.SP.x) / dsp * 1.9, az = D.SP.z + (p.z - D.SP.z) / dsp * 1.9; pkRod(ax, p.y + 0.25, az, p.x, p.y + 0.25, p.z, 0.06, X.rail, g, 6); continue; }
      var hit = false;
      for (var j = 0; j < n && !hit; j += 4) { var q = P[j]; if (q.y > p.y + 1.0 && Math.abs(q.x - p.x) < 1.6 && Math.abs(q.z - p.z) < 1.6) hit = true; }
      if (hit) continue;
      var topY = (p.x > D.HALL.x0 && p.x < D.HALL.x1 && p.z > D.HALL.z0 && p.z < D.HALL.z1) ? D.HALL.h : D.H;
      pkRod(p.x, p.y + 0.25, p.z, p.x, topY, p.z, 0.035, X.rail, g, 5);
    }
  }
  // the seven dreams
  function pkDvScenes(g, E) {
    var D = PK_DV, X = pkDvM(), A = E.anim = { sway: [], bob: [], spin: [], comets: [], pend: [], wave: [] }, i;
    var light = function (col, x, y, z, k, d) { var l = new THREE.PointLight(col, k, d || 16, 1.6); l.position.set(x, y, z); g.add(l); return l; };
    // 1 Kastelenrijk: four castles on rock pillars, swaying, waterfalls between them, mist below
    var castles = [[-102.5, -22.5, 4.5, 1.2, X.roof], [-108.4, -30.2, 5.5, 0.85, X.roofBlue], [-108.4, -15.5, 3.8, 0.85, X.roofBlue]];
    castles.forEach(function (c, k) { var top = pkDvRockPillar(g, c[0], c[1], c[2], 2.2, 10 + k); var ca = pkDvCastle(g, c[0], top, c[1], c[3], c[4], 20 + k); A.sway.push({ o: ca, ph: k * 1.3 }); });
    [[-105.6, -24.0, 6.5], [-100.2, -18.6, 4.5]].forEach(function (w) { var fp = new THREE.Mesh(new THREE.PlaneGeometry(1.6, w[2]), X.fall); fp.position.set(w[0], w[2] / 2, w[1]); fp.rotation.y = 0.6; fp.userData.noBake = true; g.add(fp); E.falls.push(fp); });
    for (i = 0; i < 8; i++) { var mm = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), X.fog); mm.rotation.x = -Math.PI / 2; mm.position.set(-108 + (i % 4) * 4, 0.6, -30 + Math.floor(i / 4) * 8); mm.userData.noBake = true; g.add(mm); }
    E.lights.push(light(0xffc8e0, -103, 8, -23, 1.6, 18));
    // 2 Wonderwoud: giant trees the gondolas fly through, glowing mushrooms, elves dancing round a bear, a flying elf, the
    // babbling tree's face, a unicorn
    [[-108, -10, 14, 1.0], [-100, -8.5, 13, 0.9], [-104, 3, 15, 1.1], [-99.6, 3.6, 12, 0.8], [-109, -2, 13, 0.9]].forEach(function (t, k) { pkDvTree(g, t[0], t[1], t[2], t[3], 30 + k, 14.6); });
    for (i = 0; i < 16; i++) { var mx = -109 + (i % 6) * 2.4, mz = -11 + Math.floor(i / 6) * 5 + (i % 2); cyl(0.08, 0.5 + (i % 3) * 0.3, X.white, mx, 0.3, mz, g, 6); pkLathe([[0, 0], [0.4 + (i % 2) * 0.2, 0.05], [0.3, 0.2], [0, 0.3]], X.shroom, mx, 0.55 + (i % 3) * 0.3, mz, g, 12); }
    var bear = new THREE.Group(); bear.position.set(-103, 0, -6); g.add(bear);
    sphere(0.8, X.brown, 0, 0.9, 0, bear).scale.set(1, 1.2, 0.9); sphere(0.45, X.brown, 0, 2.1, 0.2, bear); [-1, 1].forEach(function (s) { sphere(0.15, X.brown, s * 0.32, 2.45, 0.15, bear); });
    pkRing(0.55, 0.06, X.petal[0], 0, 1.75, 0.15, bear, 20);
    for (i = 0; i < 5; i++) { var ea = i / 5 * 6.28, el = pkDmFigure(X.elf, { s: 0.55 }); el.g.position.set(-103 + Math.cos(ea) * 2.1, 0, -6 + Math.sin(ea) * 2.1); el.g.rotation.y = -ea - Math.PI / 2; g.add(el.g); el.armL.rotation.z = -2.4; el.armR.rotation.z = 2.4; A.bob.push({ o: el.g, ph: i, amp: 0.25, y: 0 }); }
    var fly = pkDmFigure(X.elf, { s: 0.6 }); fly.g.position.set(-100, 7, -10); g.add(fly.g); fly.armL.rotation.z = -1.6; fly.armR.rotation.z = 1.6; A.bob.push({ o: fly.g, ph: 2, amp: 0.8, y: 7 });
    var face = new THREE.Group(); face.position.set(-104 + 1.1, 4.5, 3); face.rotation.y = Math.PI / 2; g.add(face);
    [-0.35, 0.35].forEach(function (x) { sphere(0.2, X.win, x, 0.4, 0, face); }); var mouth = box(0.6, 0.2, 0.1, X.dark, 0, -0.2, 0, face); A.wave.push({ o: mouth, mouth: true });
    pkDvHorse(g, -100.6, 0, -1.2, -2.2, 1.2, X.white, true);
    E.lights.push(light(0x9fe0a8, -103, 9, -4, 1.4, 16));
    // 3 Elfentuin: the pond, giant flowers, King Oberon waving from his sunflower throne, the peacock, deer, fairies
    var pond = new THREE.Mesh(new THREE.CircleGeometry(4.2, 32), X.water); pond.rotation.x = -Math.PI / 2; pond.position.set(-104, 0.06, 11); g.add(pond);
    pkRing(4.2, 0.18, X.base, -104, 0.08, 11, g, 40);
    [[-108.5, 6.5, 4.5, 0.9], [-108.5, 16, 5.5, 1.1], [-99, 16.5, 3.5, 0.8], [-97.5, 7, 4.0, 0.9], [-101, 18.5, 6.0, 1.2], [-107, 18.2, 3.0, 0.7]].forEach(function (f, k) { pkDvFlower(g, f[0], f[1], f[2], f[3], X.petal[k % 4], 40 + k); });
    var sunF = new THREE.Group(); sunF.position.set(-107.2, 0, 12.5); sunF.scale.setScalar(0.85); g.add(sunF);
    pkTube([[0, 0, 0], [0.3, 2.5, 0], [-0.2, 5.0, 0], [0, 6.2, 0]], 0.3, X.leaf[1], sunF, false, 20, 8);
    var disc = new THREE.Group(); disc.position.set(0, 6.3, 0); sunF.add(disc);
    cyl(1.4, 0.3, X.brown, 0, 0, 0, disc, 24);
    for (i = 0; i < 18; i++) { var pa2 = i / 18 * 6.28, pt = sphere(0.7, X.sun, Math.cos(pa2) * 1.9, 0, Math.sin(pa2) * 1.9, disc); pt.scale.set(1, 0.12, 0.4); pt.rotation.y = -pa2; }
    var ob = pkDmFigure(X.oberon, { seated: true, s: 1.4 }); ob.g.position.set(0, 0.15, -0.2); ob.g.rotation.y = Math.PI / 2 - 0.2; disc.add(ob.g);
    var crown = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.14, 8, 1, true), X.gold); crown.position.set(0, ob.top + 0.34, 0); ob.g.add(crown);
    ob.armR.rotation.z = 2.5; A.wave.push({ o: ob.armR });
    var peacock = new THREE.Group(); peacock.position.set(-99.5, 0, 9.5); peacock.rotation.y = -1.2; g.add(peacock);
    sphere(0.3, X.petal[3], 0, 0.6, 0, peacock).scale.set(0.8, 1, 1.3); sphere(0.14, X.petal[3], 0, 1.05, 0.25, peacock);
    for (i = 0; i < 13; i++) { var fa = -1.2 + i * 0.2, fe = box(0.12, 1.6, 0.02, X.petal[1], Math.sin(fa) * 0.6, 1.2 + Math.cos(fa) * 0.6, -0.35, peacock); fe.rotation.z = -fa; sphere(0.07, X.win, Math.sin(fa) * 1.25, 0.6 + Math.cos(fa) * 1.4 + 0.6, -0.36, peacock); }
    [[-107, 14, 0.6], [-106, 15.2, 2.2]].forEach(function (d) { var dm = pkDvHorse(g, d[0], 0, d[1], d[2], 0.7, X.brown, false); pkRod(d[0], 1.25, d[1], d[0] + 0.2, 1.7, d[1] + 0.3, 0.02, X.brown, g, 4); });
    for (i = 0; i < 14; i++) { var fy = sphere(0.09, X.fairy, -109 + (i % 7) * 1.8, 2.5 + (i % 4) * 1.2, 6 + Math.floor(i / 7) * 9 + (i % 3), g); A.bob.push({ o: fy, ph: i * 0.7, amp: 0.4, y: fy.position.y }); }
    E.lights.push(light(0xffc0e8, -103, 7, 12, 1.5, 16));
    // 4 Sterrentunnel: a long dark tube along the south wall, its inside full of twinkling stars
    var tz0 = 20.5, tz1 = 29.4, tx0 = -109.4, tx1 = -91.0, tyT = 12.5, tyB = 4.5;
    box(tx1 - tx0, 0.2, tz1 - tz0, X.dark, (tx0 + tx1) / 2, tyT, (tz0 + tz1) / 2, g);
    box(tx1 - tx0, 0.2, tz1 - tz0, X.dark, (tx0 + tx1) / 2, tyB, (tz0 + tz1) / 2, g);
    box(tx1 - tx0 - 6, tyT - tyB, 0.2, X.dark, (tx0 + tx1) / 2 + 3, (tyT + tyB) / 2, tz0, g);
    var starGeo = new THREE.SphereGeometry(0.05, 6, 4), m4 = new THREE.Matrix4(), rs = pkRng(9);
    [X.starA, X.starB].forEach(function (sm) {
      var im = new THREE.InstancedMesh(starGeo, sm, 260);
      for (var k = 0; k < 260; k++) { var face2 = k % 3, sx2 = tx0 + rs() * (tx1 - tx0), sy2, sz2; if (face2 === 0) { sy2 = tyT - 0.12; sz2 = tz0 + rs() * (tz1 - tz0); } else if (face2 === 1) { sy2 = tyB + 0.3 + rs() * (tyT - tyB - 0.6); sz2 = tz1 - 0.7; } else { sy2 = tyB + 0.3 + rs() * (tyT - tyB - 0.6); sz2 = tz0 + 0.12; } m4.makeTranslation(sx2, sy2, sz2); im.setMatrixAt(k, m4); }
      im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; im.userData.noBake = true; g.add(im);
    });
    // 5 Hemelburchten: castles floating on clouds, planets turning, comets crossing
    [[-88.5, 19.5, 10.0, X.roofBlue], [-83.6, 27.4, 10.8, X.roof], [-92.0, 15.0, 9.8, X.roof]].forEach(function (c, k) {
      var fl = new THREE.Group(); fl.position.set(c[0], c[2], c[1]); g.add(fl);
      for (var cl = 0; cl < 6; cl++) sphere(0.7 + (cl % 3) * 0.2, X.cloud, Math.cos(cl) * 1.3, -0.4, Math.sin(cl * 1.7) * 1.1, fl).scale.set(1, 0.5, 1);
      pkDvCastle(fl, 0, -0.1, 0, 0.6, c[3], 50 + k); A.bob.push({ o: fl, ph: k * 2, amp: 0.35, y: c[2] });
    });
    [[-82.0, 15.0, 18.5, 1.0, 0], [-91, 14.5, 26, 1.0, 1], [-82, 7.5, 18, 0.8, 2]].forEach(function (p, k) {
      var pl = new THREE.Group(); pl.position.set(p[0], p[1], p[2]); g.add(pl);
      sphere(p[3], X.planet[p[4]], 0, 0, 0, pl).geometry = new THREE.SphereGeometry(p[3], 24, 16);
      if (k !== 2) { var rg = pkRing(p[3] * 1.6, 0.06, X.gold, 0, 0, 0, pl, 40); rg.rotation.x = 1.2; }
      A.spin.push({ o: pl, w: 0.15 + k * 0.1 });
    });
    for (i = 0; i < 3; i++) { var cm = sphere(0.16, X.comet, 0, 0, 0, g); var tail = cyl(0.02, 1.6, X.comet, 0, 0, 0.9, cm, 6, 0.1); tail.rotation.x = Math.PI / 2; cm.userData.noBake = true; A.comets.push({ o: cm, ph: i * 2.1 }); }
    E.lights.push(light(0x8aa0ff, -87, 12, 21, 1.6, 18));
    // 6 Zompenwoud: the hollow swamp tree the spiral winds round, its roots in the mud, hanging moss, the swinging troll,
    // the startle troll, will-o'-the-wisps
    var S = D.SP;
    cyl(1.6, D.H, X.swampTrunk, S.x, D.H / 2, S.z, g, 14, 2.2);
    for (i = 0; i < 7; i++) { var ra = i / 7 * 6.28; pkRod(S.x + Math.cos(ra) * 1.4, 1.6, S.z + Math.sin(ra) * 1.4, S.x + Math.cos(ra) * 3.4, 0, S.z + Math.sin(ra) * 3.4, 0.35, X.swampTrunk, g, 6); }
    var mudp = new THREE.Mesh(new THREE.CircleGeometry(5.4, 32), X.mud); mudp.rotation.x = -Math.PI / 2; mudp.position.set(S.x, 0.05, S.z); g.add(mudp);
    for (i = 0; i < 18; i++) { var ma = i / 18 * 6.28, mr2 = 1.7 + (i % 3) * 0.15; var ms = box(0.25, 1.2 + (i % 4) * 0.4, 0.04, X.moss, S.x + Math.cos(ma) * mr2, 13.5 - (i % 5) * 1.8, S.z + Math.sin(ma) * mr2, g); ms.rotation.y = -ma; }
    var rope = new THREE.Group(); rope.position.set(-81.0, 15.8, 10.0); rope.userData.dynamic = true; g.add(rope);
    pkRod(0, 0, 0, 0, -6.5, 0, 0.03, X.brown, rope, 4);
    var st = pkDmFigure(X.troll, { s: 1.3 }); st.g.position.y = -8.6; rope.add(st.g); st.armL.rotation.z = -2.8; st.armR.rotation.z = 2.8; sphere(0.13, X.troll, 0, st.top + 0.2, 0.18, st.g);
    A.pend.push({ o: rope, ph: 0 });
    var tr2 = pkDmFigure(X.troll, { s: 1.6 }); tr2.g.position.set(S.x - 4.0, 0, S.z + 5.4); tr2.g.rotation.y = -0.6; g.add(tr2.g); tr2.armL.rotation.x = tr2.armR.rotation.x = -1.6; sphere(0.15, X.troll, 0, tr2.top + 0.2, 0.18, tr2.g);
    A.bob.push({ o: tr2.g, ph: 0, amp: 0.6, y: 0, jump: true });
    for (i = 0; i < 10; i++) { var wa2 = i / 10 * 6.28, wp = sphere(0.12, X.wisp, S.x + Math.cos(wa2) * 6, 1.5 + (i % 4) * 2.5, S.z + Math.sin(wa2) * 5.5, g); A.bob.push({ o: wp, ph: i, amp: 0.6, y: wp.position.y }); }
    E.lights.push(light(0x9aff9a, S.x, 7, S.z, 1.4, 16));
    // 7 Droommoeras, the waking: rabbits, the troll lifting three singing elves, the fog wall with its blue lamps at the
    // way home
    for (i = 0; i < 4; i++) { var rb = new THREE.Group(); rb.position.set(-97.5 + (i % 2) * 1.2, 0, 2 + Math.floor(i / 2) * 2.2); g.add(rb); sphere(0.22, X.white, 0, 0.22, 0, rb).scale.set(1, 0.9, 1.3); sphere(0.14, X.white, 0, 0.42, 0.22, rb); [-1, 1].forEach(function (s) { sphere(0.05, X.white, s * 0.06, 0.65, 0.18, rb).scale.set(1, 3, 1); }); A.bob.push({ o: rb, ph: i * 1.3, amp: 0.15, y: 0, jump: true }); }
    var lt2 = pkDmFigure(X.troll, { s: 1.5 }); lt2.g.position.set(-99, 0, 7); lt2.g.rotation.y = 1.0; g.add(lt2.g); lt2.armL.rotation.z = -2.9; lt2.armR.rotation.z = 2.9;
    for (i = 0; i < 3; i++) { var se = pkDmFigure(X.elf, { s: 0.4 }); se.g.position.set(-99 + (i - 1) * 0.35, 3.6, 7); g.add(se.g); A.bob.push({ o: se.g, ph: i, amp: 0.08, y: 3.6 }); }
    for (i = 0; i < 6; i++) { var fw = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 4.4), X.fog); fw.position.set(-95.5, 2.2, -15 - i * 0.35); fw.userData.noBake = true; fw.renderOrder = 3; g.add(fw); E.fogs.push(fw); }
    [-97.5, -94.55].forEach(function (x) { cyl(0.18, 3.8, X.blueLamp, x, 1.9, -15.9, g, 12); });
    E.lights.push(light(0x6aa0ff, -95.5, 3, -9, 1.3, 10));
  }

  // ── The tick ─────────────────────────────────────────────────────
  var PK_DV_V = new THREE.Vector3(), PK_DV_T = new THREE.Vector3(), PK_DV_T2 = new THREE.Vector3();
  function pkDvPlace(D, gd, s, dt, v) {
    pkDvAt(D, s, PK_DV_V, PK_DV_T); pkDvAt(D, s + 1.0, PK_DV_T2, null);
    gd.g.position.copy(PK_DV_V);
    var yaw = Math.atan2(PK_DV_T.x, PK_DV_T.z), ahead = Math.atan2(PK_DV_T2.x - PK_DV_V.x, PK_DV_T2.z - PK_DV_V.z), turn = Math.atan2(Math.sin(ahead - yaw), Math.cos(ahead - yaw));
    var want = clamp(-turn * v * v * 0.35, -0.32, 0.32);            // the tub swings out on the curves, more the faster it goes
    gd.roll += (want - gd.roll) * Math.min(1, (dt || 0.016) * 3);
    gd.g.rotation.y = yaw; gd.g.rotation.z = gd.roll;
  }
  function pkDvTick(a, dt) {
    var D = PK_DV, E = a.extra, X = pkDvM(), run = a.state === 'running';
    E.clock += dt; var ck = E.clock;
    // every gondola where the system has it (pkDvSystem), its bar where it should be
    for (var i = 0; i < E.gons.length; i++) { var gd0 = E.gons[i]; pkDvPlace(D, gd0, gd0.s, dt, gd0.v); gd0.bar.rotation.x = -1.4 * (1 - gd0.barT); }
    // the dream's lights: lit through a ride (and dimmed when the house is empty), the stars twinkling, everything alive
    var on = E.work ? 1.4 : (E.sys !== 'parked' ? 1 : 0.55);
    E.lit += (on - E.lit) * Math.min(1, dt * 1.5);
    var k = E.lit;
    X.win.emissiveIntensity = 1.2 * k; X.fall.emissiveIntensity = 0.9 * k; X.shroom.emissiveIntensity = 1.3 * k; X.elf.emissiveIntensity = 1.1 * k;
    X.fairy.emissiveIntensity = (1.2 + Math.sin(ck * 5) * 0.4) * k; X.petal.forEach(function (m) { m.emissiveIntensity = 0.35 * k; }); X.sun.emissiveIntensity = 0.6 * k;
    X.starA.emissiveIntensity = (0.6 + Math.max(0, Math.sin(ck * 3.1)) * 1.4) * k; X.starB.emissiveIntensity = (0.6 + Math.max(0, Math.sin(ck * 2.3 + 1.7)) * 1.4) * k;
    X.planet.forEach(function (m) { m.emissiveIntensity = 0.35 * k; }); X.comet.emissiveIntensity = 1.6 * k; X.wisp.emissiveIntensity = (1.0 + Math.sin(ck * 4) * 0.5) * k;
    X.oberon.emissiveIntensity = 0.5 * k; X.globe.emissiveIntensity = 1.3; X.blueLamp.emissiveIntensity = 1.5 * k; X.white.emissiveIntensity = 0.3 * k;
    E.lights.forEach(function (l, j) { l.intensity = (j === 6 ? 1.3 : 1.5) * k; });
    E.falls.forEach(function (f) { if (f.material.map) f.material.map.offset.y = (ck * 0.6) % 1; });
    if (E.fogBoost > 0) E.fogBoost -= dt;   // the console's FOG cue
    E.fogs.forEach(function (f, j) { f.material.opacity = Math.min(0.9, 0.32 + Math.sin(ck * 0.8 + j) * 0.08 + (E.fogBoost > 0 ? 0.35 : 0)); });
    var A = E.anim;
    A.sway.forEach(function (s) { s.o.rotation.z = Math.sin(ck * 0.6 + s.ph) * 0.04; s.o.rotation.x = Math.cos(ck * 0.5 + s.ph) * 0.03; });
    A.bob.forEach(function (b) { var w = Math.sin(ck * 1.6 + b.ph); b.o.position.y = b.y + (b.jump ? Math.max(0, w) : w) * b.amp; });
    A.spin.forEach(function (s) { s.o.rotation.y += s.w * dt; });
    A.pend.forEach(function (p) { p.o.rotation.x = Math.sin(ck * 1.1 + p.ph) * 0.3; });
    A.wave.forEach(function (w) { if (w.mouth) w.o.scale.y = 1 + Math.max(0, Math.sin(ck * 9)) * 1.5; else w.o.rotation.x = -0.4 + Math.sin(ck * 2.2) * 0.5; });
    A.comets.forEach(function (c) { var f = ((ck * 0.12 + c.ph) % 1); c.o.position.set(-81.5 - f * 12, 15.5 - f * 0.6, 14 + f * 14); c.o.rotation.y = -0.8; });
  }

  // ── The system ───────────────────────────────────────────────────
  // Droomvlucht does not run in cycles: the gondolas go round all the time, crawling through the station at the walkway's
  // pace (the riders get off on the arriving leg and on as the U swings them round), the bars lock on the leg out, and
  // at the line each one goes when the one before it is far enough out on the course (AUTO), or when the operator pulls
  // the release (MANUAL). START sets it going; STOP brings every gondola home: none passes the line again, they queue up
  // in the station and the system parks. The E-stop freezes them where they are. On AUTO the system starts itself when
  // a line forms and opens the gates, and parks at closing. Every booth still works the gates; the bars can be held open.
  // its own line, too: the railed way in from the doors, its head at a gate onto the platform, and when it is long, out
  // through the gatehouse and along the promenade (in place of the standard switchback lane, part 06)
  var _pkQueueLaneDv = pkQueueLaneBetter;
  pkQueueLaneBetter = function (a, th, parent) { if (a.ownLane) return a.ownLane(parent); return _pkQueueLaneDv(a, th, parent); };
  var _pkAttrSlotDv = pkAttrSlot;
  pkAttrSlot = function (a, i) { if (a.qSlot) return a.qSlot(i); return _pkAttrSlotDv(a, i); };
  function pkDvSlot(i) {
    if (i < 7) return [{ x: -82.5, z: -6.7 }, { x: -82.4, z: -7.6 }, { x: -82.3, z: -8.5 }, { x: -82.2, z: -9.4 }, { x: -81.7, z: -10.05 }, { x: -81.0, z: -9.6 }, { x: -80.6, z: -9.0 }][i];   // from the gate up the railed way to the doors
    if (i === 7) return { x: -79.4, z: -9.0 };
    if (i === 8) return { x: -76.9, z: -9.0 };
    if (i < 32) return { x: -74.6, z: -8.1 + (i - 9) * 0.9 };
    return { x: -73.3, z: 12.6 - (i - 32) * 0.9 };
  }
  function pkDvLane(a, parent) {
    // the gate sits in the rail on the platform side, opening the line straight onto the moving walkway
    var X = pkDvM(), C = pkCtl(a), navy = std({ color: 0x1a2236, roughness: 0.5 }), gx = -83.3, zn = -7.95, zs = -5.45, lw = (zs - zn) / 2 - 0.03;
    var leaf = function (hz, s) {
      var h = new THREE.Group(); h.position.set(gx, 0, hz); h.userData.dynamic = true; parent.add(h);
      box(0.04, 0.8, lw, navy, 0, 0.55, s * lw / 2, h); box(0.07, 0.05, lw, X.gold, 0, 1.0, s * lw / 2, h); box(0.06, 0.04, lw, X.gold, 0, 0.15, s * lw / 2, h);
      var st = pkExtrude([[0, 0.08], [0.025, 0.025], [0.08, 0.025], [0.035, -0.01], [0.05, -0.07], [0, -0.03], [-0.05, -0.07], [-0.035, -0.01], [-0.08, 0.025], [-0.025, 0.025]], 0.012, X.gold, -0.03, 0.6, s * lw / 2, h, 0); st.rotation.y = Math.PI / 2;
      cyl(0.05, 1.1, navy, gx, 0.55, hz, parent, 8); sphere(0.07, X.gold, gx, 1.14, hz, parent);
      return h;
    };
    var L = leaf(zn, 1), Rl = leaf(zs, -1);
    C.gateObjs.push(function (t) { L.rotation.y = -t * 1.4; Rl.rotation.y = t * 1.4; });
    var z = -4.85, xw = gx, xe = PK_DV.X1 - 0.65;
    sign(['QUEUE'], 0.9, 0.22, -82.0, 1.5, -10.42, 0, { bg: '#1a2236', fg: '#e8c870' }, parent);
    // the player's own way on: press E at the gate
    hitBox(1.4, 2.2, 1.6, -82.4, 1.1, -6.7, { prompt: function () { if (!a.open || PK.playerRide) return ''; if (PK.playerWait && PK.playerWait.a === a) return 'Waiting for a gondola - press E to leave the line'; return 'Ride ' + a.name; }, use: function () { pkPlayerRideJoin(a); } }, parent);
    PK.lanes.push({ a: a, x0: xw, x1: xe, zA: -10.5, zB: z, gx: 1e9, gz0: 0, gz1: 0, segs: [], rows: 1, leafL: L, leafR: Rl });
  }
  var _pkAttrTickDv = pkAttrTick;
  pkAttrTick = function (a, dt) { if (a.tickOwn) return a.tickOwn(a, dt); return _pkAttrTickDv(a, dt); };
  // the player rides it too (part 15), the continuous way: E at the gate takes the next free seat coming round the U (or
  // waits for one), the flight carries you, and you are set down at the exit when your gondola gets home; E steps you off
  // early only while your gondola is in the station
  function pkDvFreeSeat(a) { var D = PK_DV, best = null; a.extra.gons.forEach(function (g) { if (g.s < D.sLoad0 || g.s > D.L - 4) return; g.seats.forEach(function (st) { if (!st.guest && !st.player && (!best || g.s > best.g.s)) best = { g: g, st: st }; }); }); return best && best.st; }
  function pkDvSeatPlayer(a, seat) { seat.player = true; a.riders++; PK.playerRide = { kind: 'attr', a: a, seat: seat, started: true, dv: true, yaw0: player.yaw, pitch0: player.pitch, eye: 1.30, face: Math.PI + (seat.ry || 0) }; sfx('unlock'); toast('Riding ' + a.name + ' - look around with the mouse', 'good'); hudDirty = true; screenDirtyAll(); }
  var _pkPlayerRideJoinDv = pkPlayerRideJoin;
  pkPlayerRideJoin = function (a) {
    if (!a || !a.continuous) return _pkPlayerRideJoinDv(a);
    if (PK.playerRide) return false;
    if (PK.playerWait && PK.playerWait.a === a) { PK.playerWait = null; sfx('click'); toast('You step out of the line', ''); return true; }
    if (!a.open) return pkRefuse(a.name + ' is closed for the day');
    if (pkCtl(a).fault) return pkRefuse('The ride is stopped');
    if (a.extra.sys !== 'running') return pkRefuse(a.name + ' is not running - START it at the desk');
    var st = pkDvFreeSeat(a);
    if (!st) { PK.playerWait = { a: a, coaster: false, dv: true, x: player.x, z: player.z }; toast('Waiting for a gondola to come round', ''); return true; }
    pkDvSeatPlayer(a, st); return true;
  };
  var _pkPlayerTickDv = pkPlayerTick;
  pkPlayerTick = function (dt) {
    var w = PK.playerWait, pr = PK.playerRide;
    if (w && w.dv) { if (Math.abs(player.x - w.x) > 4.5 || Math.abs(player.z - w.z) > 4.5) PK.playerWait = null; else if (w.a.extra.sys === 'running') { var st = pkDvFreeSeat(w.a); if (st) { PK.playerWait = null; pkDvSeatPlayer(w.a, st); } } return; }
    if (pr && pr.dv) return;   // the system sets you down when your gondola is home
    return _pkPlayerTickDv(dt);
  };
  var _pkPlayerRideExitTryDv = pkPlayerRideExitTry;
  pkPlayerRideExitTry = function () {
    var pr = PK.playerRide; if (!pr || !pr.dv) return _pkPlayerRideExitTryDv();
    var gd = pr.a.extra.gons.filter(function (g) { return g.seats.indexOf(pr.seat) >= 0; })[0];
    if (gd && gd.s >= PK_DV.sStationIn) return pkPlayerRideStepOff();
    toast('Wait until your gondola is back in the station', ''); sfx('bad'); return true;
  };
  function pkDvCourseSpeed(D, s) { if (s >= D.sStationIn) return null; if (s > D.sSpiral0 && s < D.sSpiral1) return 4.6; if (s < D.sClimb) return 1.8; if (s > D.sSpiral1) return 1.6; return 2.2; }
  function pkDvUnseat(a, seat) {
    var gu = seat.guest; if (!gu) return; seat.guest = null; gu.seat = null; gu.clap = false;
    if (gu.state !== 'seated') { gu.state = 'off'; gu.rec.path = []; return; }
    var sp = pkAttrSeatWorld(seat), sy = pkFloor(sp.x, sp.z);
    scene.add(gu.g); gu.g.position.set(sp.x, sy, sp.z); gu.g.rotation.set(0, 0, 0); gu.g.userData.baseY = sy; gu.pose = 'sit';
    var bl = pkBlobOf(gu.g); if (bl) bl.visible = true;
    gu.rec.x = sp.x; gu.rec.z = sp.z; gu.rec.path = a.walkOut({ x: sp.x, z: sp.z });
    gu.state = 'off'; gu.rides = (gu.rides || 0) + 1; gu.mood = 'happy';
    a.riders = Math.max(0, a.riders - 1); PK.today.rides++; pkXp(1);
  }
  function pkDvSystem(a, dt) {
    var D = PK_DV, E = a.extra, C = pkCtl(a), L = D.L, G = E.gons, i;
    if (!a.open) return;
    var live = !!C.key && !C.maint;
    // AUTO: the system starts for a line and parks at closing; the key off or the park closed brings it home
    if (C.auto && live && !C.fault && !PK.closed && E.sys === 'parked' && a.queue.length) { E.sys = 'running'; C.gates = true; }
    // closing time brings it home once, as the park closes, if it is on AUTO; after that the operator can run it on AUTO or
    // by hand whenever they like (a test run before opening). The key off always brings it home.
    var closing = PK.closed && !E.wasClosed; E.wasClosed = !!PK.closed;
    if (((closing && C.auto) || !live) && E.sys === 'running') { E.sys = 'stopping'; C.gates = false; }
    if (E.sys !== 'running' && C.auto) C.gates = false;
    if (E.sys === 'running' && C.auto && live && !C.fault && !PK.closed) C.gates = true;   // on AUTO the gates stand open while it runs
    C.gateT += ((C.gates ? 1 : 0) - C.gateT) * Math.min(1, dt * 3.5);
    for (var gi = 0; gi < C.gateObjs.length; gi++) C.gateObjs[gi](C.gateT);
    pkCtlLamps(a);
    // the gondolas, front of the queue at the line first: each eases to its speed and keeps its distance from the next
    var order = G.slice().sort(function (p, q) { return q.s - p.s; });
    var lastOut = E.last ? E.last.s : L;   // how far out the last one sent is
    for (var k = 0; k < order.length; k++) {
      var gd = order[k], ahead = order[(k - 1 + order.length) % order.length];
      if (C.fault) { gd.v = 0; continue; }
      var inStation = gd.s >= D.sStationIn, want = E.sys === 'parked' ? 0 : (inStation ? E.walk : pkDvCourseSpeed(D, gd.s));
      gd.v += clamp(want - gd.v, -2.5 * dt, 1.2 * dt);
      var ns = gd.s + gd.v * dt;
      // the line: a gondola leaves only when the system runs, its bar is locked, nobody is still walking to it, and the
      // last one out is far enough on (AUTO) or the release is pulled (MANUAL)
      if (inStation && ns >= L - 0.02) {
        var walking = gd.seats.some(function (st) { return st.guest && st.guest.state === 'walkSeat'; });
        var spaced = !E.last || E.last === gd || E.last.s > D.DGAP;
        var go = E.sys === 'running' && !E.barsHold && gd.barT > 0.95 && !walking && spaced && (C.auto || E.release);
        if (walking) { gd.hold += dt; if (gd.hold > 10) gd.seats.forEach(function (st) { if (st.guest && st.guest.state === 'walkSeat') pkDvUnseat(a, st); }); }
        if (!go) { ns = L - 0.02; gd.v = 0; }
        else { ns = Math.max(ns, L + 0.001) - L; E.last = gd; E.release = false; gd.hold = 0; gd.unloaded = false; }   // over the line and out (never back behind it)
      }
      // no closer than GAP behind the one in front
      if (ahead !== gd) { var room = ((ahead.s - gd.s) % L + L) % L; if (room < 1e-3) room = L; var mx = gd.s + Math.max(0, room - D.GAP); if (ns > mx && room < L - 1) { ns = mx; gd.v = Math.min(gd.v, ahead.v); } }
      gd.s = ((ns % L) + L) % L;
      // off at the arriving leg, the bars open through the station and locking on the way to the line
      if (!gd.unloaded && gd.s >= D.sUnload && gd.s < L - 4) { gd.unloaded = true; gd.seats.forEach(function (st) { if (st.guest) pkDvUnseat(a, st); if (st.player) pkPlayerRideStepOff(); }); }
      var barOpen = gd.s >= D.sStationIn + 0.5 && (gd.s < L - 3 || E.barsHold);
      gd.barT += ((barOpen ? 0 : 1) - gd.barT) * Math.min(1, dt * 2.5);
    }
    // the riders get on: the front of the line walks to a free seat in a gondola on the U with time left to reach it
    E.loadT -= dt;
    if (E.loadT <= 0 && C.gates && E.sys === 'running' && live && !C.fault && !PK.closed && a.queue.length) {
      var gu = a.queue[0];
      if (gu.state === 'qwait' || gu.state === 'qmove') {
        var best = null;
        G.forEach(function (g2) { if (g2.s < D.sLoad0 || g2.s > L - 7) return; g2.seats.forEach(function (st) { if (!st.guest && !st.player && (!best || g2.s > best.g.s)) best = { g: g2, st: st }; }); });
        if (best) {
          a.queue.shift(); gu.seat = best.st; best.st.guest = gu; gu.slot = -1; gu.state = 'walkSeat';
          var w = pkAttrSeatWorld(best.st); gu.rec.path = route({ x: gu.rec.x, z: gu.rec.z }, { x: w.x, z: w.z });
          pkAttrReslot(a); screenDirtyAll(); E.loadT = 0.6;
        }
      }
    }
    // stopping or parked, nobody stays aboard a gondola that will not leave: they get off where they are
    if (E.sys !== 'running') G.forEach(function (g4) { if (g4.s >= D.sStationIn) g4.seats.forEach(function (st) { if (st.guest) pkDvUnseat(a, st); if (st.player) pkPlayerRideStepOff(); }); });
    // STOP: parked once every gondola is home and still
    if (E.sys === 'stopping' && G.every(function (g3) { return g3.s >= D.sStationIn && g3.v < 0.02; })) { E.sys = 'parked'; E.last = null; }
    a.state = E.sys === 'running' ? 'running' : E.sys === 'stopping' ? 'unloading' : 'idle';
    a.t += dt;
    pkDvTick(a, dt);
  }
  function pkDvStart(a) { var C = pkCtl(a), E = a.extra; if (!a.open) return pkBoothRefuse(a.name + ' has no power - the breaker is off'); if (!C.key) return pkBoothRefuse(a.name + ' is locked - turn the operator key on'); if (C.fault) return pkBoothRefuse('Reset ' + a.name + ' first'); if (E.sys === 'running') return; E.sys = 'running'; E.release = true; if (C.auto) C.gates = true; sfx('ok'); toast(a.name + (C.auto ? ': the system runs' : ': the system runs - MANUAL dispatch: pull the RELEASE for each gondola, or set DISPATCH to AUTO'), 'good'); logEvent(a.name + ' started', ''); screenDirtyAll(); }
  function pkDvStop(a) { var E = a.extra; if (E.sys === 'parked') { sfx('click'); toast(a.name + ' is parked', ''); return; } E.sys = 'stopping'; pkCtl(a).gates = false; sfx('chime'); toast(a.name + ': stopping - the gondolas come home', ''); logEvent(a.name + ' stopping', ''); screenDirtyAll(); }

  // ── Build ────────────────────────────────────────────────────────
  function pkBuildDroom(p) {
    var D = PK_DV, X = pkDvM(), g = new THREE.Group(); scene.add(g); D.g = g;
    pkDvCourse();
    var E = { gons: [], clock: 0, lit: 0.55, S: 0, lights: [], falls: [], fogs: [], anim: null, sys: 'parked', walk: 0.5, walkPos: 1, barsHold: false, work: false, release: false, last: null, loadT: 0, fogBoost: 0 };
    pkDvShell(g); pkDvFront(g); pkDvHall(g); pkDvRail(g); pkDvScenes(g, E);
    var seats = [], bars = [];
    for (var i = 0; i < D.N; i++) E.gons.push(pkDvGondola(g, i, seats, bars));
    E.gons.forEach(function (gd, k) { gd.s = D.L - 0.05 - k * D.GAP; pkDvPlace(D, gd, gd.s, 0.016, 0); });   // parked in the station, nose to tail back from the line
    var a = pkAttr({
      id: 'droom', name: 'Droomvlucht', x: p.x, z: p.z, qx: p.q[0], qz: p.q[1], g: g, seats: seats,
      board: 20, run: D.run, unload: 8, exit: [D.X1 + 6.0, D.EXIT], extra: E
    });
    a.stationGates = false; a.tickOwn = pkDvSystem; a.continuous = true;
    a.laneGeo = { N: 9 }; a.qSlot = pkDvSlot; a.ownLane = function (parent) { pkDvLane(a, parent); };
    // the riders' way out: round to the exit door at the north end of the front
    a.walkOut = function (sp) { return route(sp, { x: D.X1 - 2.0, z: D.EXIT }).concat([{ x: D.X1 - 1.0, z: D.EXIT }, { x: D.X1 + 1.2, z: D.EXIT }], route({ x: D.X1 + 1.2, z: D.EXIT }, { x: a.exit[0], z: a.exit[1] })); };
    pkDvBooth(g, a);
    return a;
  }
