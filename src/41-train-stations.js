//@ Park Co, part 41: the Lindenburg Railway - five stations with their control cabinets, and the depot.
  // ── The saved state ───────────────────────────────────────────────
  function trState() {
    var r = S.tr || (S.tr = {});
    if (r.fuel === undefined) { r.fuel = 100; r.water = 100; r.wear = 0; r.dirt = 20; r.auto = false; r.points = 'main'; r.st = {}; r.laps = 0; }
    return r;
  }
  var TR_STATIONS = [
    { id: 'central', name: 'CENTRAL STATION', x: -128, z: 34, walk: [[-117.4, 34], [-117.4, 62], [-30, 62]], roof: 'slateRed' },
    { id: 'windmill', name: 'WINDMILL HALT', x: -62, z: -134, walk: [[-62, -123.4], [-17, -123.4], [-17, -160]], roof: 'slateRed' },
    { id: 'dragon', name: 'DRAGON GATE', x: 170, z: -2, walk: [[159.4, -2], [121, -2]], roof: 'slateGreen' },
    { id: 'lake', name: 'LAKESIDE HALT', x: 95, z: 112, walk: [[95, 101.4], [95, 66]], roof: 'slateRed' }
  ];
  // wagon centres along a stopped train, in a station's local x (the front buffer stops 28 m ahead of the middle of the platform)
  function trWagonX(k) { return 12.3 - 5.1 * k; }

  // ── Floors: the platforms and the ramps up to them ────────────────
  function trStationLocal(st, x, z) { var dx = x - st.x, dz = z - st.z; return { lx: dx * st.dx + dz * st.dz, lz: -dx * st.dz + dz * st.dx }; }
  function trFloorAt(x, z) {
    for (var i = 0; i < TR.st.length; i++) {
      var st = TR.st[i]; if (Math.abs(x - st.x) > 45 && Math.abs(z - st.z) > 45) continue;
      var l = trStationLocal(st, x, z);
      // platform floor
      if (Math.abs(l.lx) <= 32.2 && l.lz >= 1.9 && l.lz <= 7.3) return 0.95;
      // the new ramp sloping down away from the track
      if (Math.abs(l.lx) <= 1.7 && l.lz > 7.3 && l.lz < 12.5) return 0.95 * (12.5 - l.lz) / 5.2;
    }
    return null;
  }
  var _trPrevFloor = GAME.floorY;
  GAME.floorY = function (x, z, y) { var h = trFloorAt(x, z), b = _trPrevFloor ? _trPrevFloor(x, z, y) : 0; return h === null ? b : Math.max(h, b); };
  var _trPrevCollides = GAME.collides;
  GAME.collides = function (x, z, opt) { return (_trPrevCollides && _trPrevCollides(x, z, opt)) || trXingBlocks(x, z) || trGateBlocks(x, z); };
  function trGateBlocks(x, z) {   // a shut platform gate is a wall along the edge
    for (var i = 0; i < TR.st.length; i++) {
      var st = TR.st[i]; if (st.gatesAmt > 0.5 || Math.abs(x - st.x) > 45 && Math.abs(z - st.z) > 45) continue;
      var l = trStationLocal(st, x, z); if (Math.abs(l.lx) <= 32 && l.lz > 1.6 && l.lz < 2.45) return true;
    }
    return false;
  }

  // ── Small furniture ───────────────────────────────────────────────
  function trBench(g, x, z, ry, y) {
    var M = trMats(), b = new THREE.Group(); b.position.set(x, y, z); b.rotation.y = ry; g.add(b);
    pkBevelBox(1.7, 0.07, 0.5, M.wood, 0, 0.46, 0, b, 0.02); pkBevelBox(1.7, 0.4, 0.06, M.wood, 0, 0.75, -0.23, b, 0.02);
    [-0.75, 0.75].forEach(function (px) { box(0.08, 0.46, 0.46, M.iron, px, 0.23, 0, b); });
    return b;
  }
  function trBin(g, x, z, y) {
    var M = trMats(), b = new THREE.Group(); b.position.set(x, y, z); g.add(b);
    pkLathe([[0.01, 0], [0.18, 0], [0.2, 0.1], [0.22, 0.55], [0.24, 0.6], [0.01, 0.6]], pkPaint(0x2f4a35, 0.6, 0.3), 0, 0, 0, b, 12);
    box(0.48, 0.04, 0.48, M.iron, 0, 0.62, 0, b);
    return b;
  }
  function trLamp(st, x, z, y) {
    var M = trMats(), g = st.g;
    pkRoundCyl(0.05, 3.2, M.iron, x, y + 1.6, z, g, 8); pkBevelBox(0.3, 0.1, 0.3, M.iron, x, y + 0.05, z, g, 0.03);
    var lens = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), M.lampOff); lens.position.set(x, y + 3.35, z); lens.userData.noBake = true; g.add(lens);
    cyl(0.04, 0.22, M.iron, x, y + 3.62, z, g, 6, 0.2); sphere(0.05, M.brass, x, y + 3.76, z, g);
    var cage = new THREE.Group(); cage.position.set(x, y + 3.35, z); g.add(cage);
    for (var i = 0; i < 4; i++) { var a = i * Math.PI / 2; pkRod(Math.cos(a) * 0.19, 0.2, Math.sin(a) * 0.19, Math.cos(a) * 0.26, -0.2, Math.sin(a) * 0.26, 0.012, M.iron, cage, 4); }
    st.lamps.push(lens);
  }
  function trClockPole(g, x, z, y) {
    var M = trMats();
    pkRoundCyl(0.06, 2.6, M.iron, x, y + 1.3, z, g, 8); pkBevelBox(0.5, 0.1, 0.5, M.stoneDark, x, y + 0.05, z, g, 0.02);
    var face = new THREE.Mesh(new THREE.CircleGeometry(0.34, 22), std({ color: 0xf4efe0, roughness: 0.5 })); face.position.set(x, y + 2.62, z + 0.03); face.userData.noBake = true; g.add(face);
    var back = new THREE.Mesh(new THREE.CircleGeometry(0.34, 22), std({ color: 0xf4efe0, roughness: 0.5 })); back.position.set(x, y + 2.62, z - 0.03); back.rotation.y = Math.PI; back.userData.noBake = true; g.add(back);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.03, 6, 22), M.iron); ring.position.set(x, y + 2.62, z); g.add(ring);
    box(0.03, 0.24, 0.02, M.iron, x, y + 2.72, z + 0.05, g); box(0.16, 0.03, 0.02, M.iron, x + 0.06, y + 2.62, z + 0.05, g);
    sphere(0.04, M.brass, x, y + 3.02, z, g);
    return g;
  }
  function trPath(w, pts, y) {
    var M = pkMats();
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], horiz = Math.abs(b[1] - a[1]) < 0.01, len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (horiz) pkSlab(len + w, w, (a[0] + b[0]) / 2, a[1], y || 0.013, M.paversWarm); else pkSlab(w, len + w, a[0], (a[1] + b[1]) / 2, y || 0.013, M.paversWarm);
    }
  }
  function trPortal(x, z, axis) {   // the little stone gate where a station path meets the park's palisade
    var M = trMats(), g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    var o = axis === 'z' ? [0, 2.9] : [2.9, 0];
    [-1, 1].forEach(function (s) {
      var px = o[0] * s, pz = o[1] * s;
      pkBevelBox(0.7, 2.7, 0.7, M.stone, px, 1.35, pz, g, 0.05); pkBevelBox(0.9, 0.2, 0.9, M.stoneDark, px, 0.1, pz, g, 0.03);
      trCone(0.5, 0.9, M.slateRed, px, 3.15, pz, g, 4); sphere(0.07, M.gold, px, 3.65, pz, g);
      var l = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), M.lampOn); l.position.set(px, 2.9, pz); g.add(l); l.userData.noBake = true;
    });
    solid(x - 0.4 + (axis === 'z' ? 0 : -2.9), x + 0.4 + (axis === 'z' ? 0 : -2.9), z - 0.4 + (axis === 'z' ? -2.9 : 0), z + 0.4 + (axis === 'z' ? -2.9 : 0), 0, 3);
    solid(x - 0.4 + (axis === 'z' ? 0 : 2.9), x + 0.4 + (axis === 'z' ? 0 : 2.9), z - 0.4 + (axis === 'z' ? 2.9 : 0), z + 0.4 + (axis === 'z' ? 2.9 : 0), 0, 3);
  }

  // ── A station ─────────────────────────────────────────────────────
  function trBuildStation(def, idx) {
    var M = trMats(), P = pkMats(), s = trNearestS(def.x, def.z), o = trSamp(TR.main, s, {});
    var g = trFrameGroup(o.x, o.z, o.yaw), dyn = trDyn(g), R = trState(), mine = R.st[def.id] || (R.st[def.id] = { gates: false, lights: false });
    var st = { def: def, id: def.id, name: def.name, idx: idx, s: s, x: o.x, z: o.z, dx: o.dx, dz: o.dz, yaw: o.yaw, g: g, dyn: dyn, lamps: [], gateLeaves: [], gatesAmt: mine.gates ? 1 : 0,
      lightsOn: !!mine.lights, door: 0, doorWant: false, bellT: 0, bellG: null, board: null, light: null, sw: {}, led: {}, cabOpen: false, staff: 0, clockHands: null };
    TR.st.push(st);
    
    // the platform, edged in yellow, with steps down to the walk behind it
    pkBevelBox(64, 0.95, 5.4, M.stone, 0, 0.475, 4.6, g, 0.04); pkBevelBox(64.3, 0.05, 5.6, M.stoneDark, 0, 0.95, 4.6, g, 0.02);
    box(64, 0.02, 0.28, pkPaint(0xf0c63a, 0.6, 0.1), 0, 0.985, 2.3, g);
    // a tactile strip and a white edge line, a little more believable
    box(63.6, 0.015, 0.12, pkPaint(0xf6f2e6, 0.7, 0.05), 0, 0.986, 2.52, g);
    for (var tb = -31; tb <= 31; tb += 0.6) box(0.18, 0.02, 0.18, pkPaint(0xf0c63a, 0.6, 0.1), tb, 0.99, 2.72, g);
    
    // FIXED: The ramp properly slopes away from the platform down to the ground
    var ramp = box(3.3, 0.12, 5.2, M.stoneDark, 0, 0.47, 10.0, g); ramp.rotation.x = Math.atan2(0.95, 5.2);
    
    // a low back wall behind the platform, capped with stone, so the platform reads as raised ground
    pkBevelBox(64, 0.55, 0.35, M.stone, 0, 0.72, 7.28, g, 0.03); pkBevelBox(64.2, 0.08, 0.45, M.stoneDark, 0, 1.02, 7.28, g, 0.02);
    
    // Keep the station house on its original setback so the building clears the theater.
    pkBevelBox(12, 3.3, 4.4, P.cream, -22, 2.6, 9.8, g, 0.05);
    box(12.2, 0.14, 4.6, M.woodD, -22, 0.97 + 0.05, 9.8, g);
    for (var bx = -27.5; bx <= -16.5; bx += 2.2) box(0.14, 3.3, 0.1, M.woodD, bx, 2.6, 7.56, g);
    box(12.1, 0.14, 0.1, M.woodD, -22, 4.2, 7.55, g); box(12.1, 0.14, 0.1, M.woodD, -22, 2.4, 7.55, g);
    pkGableRoof(12, 4.4, 2.2, P[def.roof], P.cream, -22, 4.25, 9.8, g, 0.5);
    
    box(12.4, 0.12, 0.1, M.woodD, -22, 4.28, 7.52, g);
    var gut = pkRoundCyl(0.06, 12.2, M.iron, -22, 4.2, 7.62, g, 6); gut.rotation.z = Math.PI / 2;
    [-26, -19].forEach(function (wx) { pkWindow(g, wx, 3.2, 7.55, 1.1, 1.3, Math.PI, P.white, P.pane); });
    [-26, -19].forEach(function (wx) { box(1.2, 0.22, 0.26, M.woodD, wx, 2.42, 7.42, g); for (var f = 0; f < 5; f++) sphere(0.08, pkPaint([0xd94f4f, 0xf3d36a, 0xe9f7f5][f % 3], 0.6, 0.1), wx - 0.44 + f * 0.22, 2.58, 7.42, g); });
    var door = pkBevelBox(1.1, 2.2, 0.1, M.wood, -22.5, 2.05, 7.55, g, 0.03); door.rotation.y = 0; sphere(0.05, M.brass, -22.2, 2.05, 7.48, g);
    
    var porch = pkBevelBox(1.8, 0.1, 1.1, P[def.roof], -22.5, 3.5, 7.2, g, 0.02); porch.rotation.x = -0.18;
    [-23.2, -21.8].forEach(function (px) { pkRoundCyl(0.05, 1.4, M.iron, px, 2.6, 6.8, g, 6); });
    
    var tw = pkBevelBox(2.6, 6.6, 2.6, P.cream, -29.2, 4.25, 9.8, g, 0.05);
    for (var ty = 1.6; ty < 7; ty += 2.2) box(2.7, 0.12, 2.7, M.woodD, -29.2, ty + 0.95, 9.8, g);
    var sp = new THREE.Mesh(new THREE.ConeGeometry(2.0, 4.6, 8), P[def.roof]); sp.position.set(-29.2, 10.85, 9.8); sp.castShadow = true; g.add(sp);
    sphere(0.12, M.gold, -29.2, 13.25, 9.8, g);
    
    pkRod(-29.2, 13.2, 9.8, -29.2, 14.2, 9.8, 0.02, M.iron, g, 6);
    var vane = box(0.6, 0.03, 0.03, M.iron, -29.2, 14.1, 9.8, g); box(0.12, 0.2, 0.02, M.iron, -29.0, 14.2, 9.8, g); sphere(0.05, M.gold, -29.2, 14.2, 9.8, g);
    
    [[-29.2, 7.45, 0, Math.PI], [-27.88, 9.8, 1, Math.PI / 2]].forEach(function (c) {   // the clock
      var face = new THREE.Mesh(new THREE.CircleGeometry(0.8, 24), std({ color: 0xf4efe0, roughness: 0.5 })); face.position.set(c[0], 6.7, c[1]); face.rotation.y = c[3]; g.add(face);
      var hand = box(0.05, 0.6, 0.03, M.iron, c[0], 6.95, c[1] + (c[3] === Math.PI ? -0.03 : 0), g); hand.rotation.z = 0.5;
      var cr = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.04, 6, 24), M.brass); cr.position.set(c[0], 6.7, c[1] + (c[3] === Math.PI ? -0.02 : 0.02)); cr.rotation.y = c[3]; g.add(cr);
    });
    
    sign([def.name], 6.4, 0.7, -21, 4.7, 7.4, Math.PI, { w: 512, h: 64, bg: '#12301f', fg: '#f2e6b8' }, g);
    
    // the canopy over the platform
    for (var px = -4; px >= -28; px -= 6) { pkRoundCyl(0.07, 3.2, M.iron, px, 2.55, 3.4, g, 8); pkRoundCyl(0.12, 0.16, M.stoneDark, px, 0.02, 3.4, g, 10); }
    var roof = pkBevelBox(28, 0.12, 6.2, P[def.roof], -16, 4.3, 5.9, g, 0.03); roof.rotation.x = 0.06;
    for (var bx2 = -29; bx2 <= -3; bx2 += 6) box(0.1, 0.14, 6.0, M.woodD, bx2, 4.18, 5.9, g);
    for (var vx = -29.5; vx <= -2.5; vx += 0.9) { var sc = trCone(0.28, 0.45, [M.red, M.cream, M.green][Math.round((vx + 30) / 0.9) % 3], vx, 4.0, 2.9, g, 4); sc.rotation.x = Math.PI; }
    
    // FIXED: Benches now face the track properly
    trBench(g, -8, 6.4, Math.PI, 0.95); 
    trBench(g, 6, 6.4, Math.PI, 0.95); 
    trBench(g, 16, 6.4, Math.PI, 0.95); 
    trBench(g, -15, 3.1, 0, 0.95);
    
    trBin(g, -4.5, 6.6, 0.95); trBin(g, 20.5, 6.6, 0.95);
    [-10, 2, 14, 24].forEach(function (lx) { trLamp(st, lx, 6.7, 0.95); });
    trClockPole(g, 25.5, 4.6, 0.95);
    
    pkBevelBox(0.5, 0.36, 0.28, M.woodD, -7.2, 1.13, 5.9, g, 0.03); box(0.5, 0.04, 0.04, M.brass, -7.2, 1.3, 5.9, g);
    pkBevelBox(0.42, 0.3, 0.24, pkPaint(0x6b4a2e, 0.6, 0.2), -6.5, 1.1, 6.2, g, 0.03);
    
    st.light = new THREE.PointLight(0xffd9a0, 0, 26); st.light.position.set(-8, 4.0, 5); g.add(st.light);
    
    var cv = document.createElement('canvas'); cv.width = 384; cv.height = 128; var tex = new THREE.CanvasTexture(cv);
    var bm = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.8), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })); bm.position.set(-8, 3.55, 3.4); bm.userData.noBake = true; g.add(bm);
    box(2.5, 0.9, 0.06, M.iron, -8, 3.55, 3.44, g);
    [-8.9, -7.1].forEach(function (rx) { pkRod(rx, 3.95, 3.44, rx, 4.18, 3.44, 0.015, M.iron, g, 4); });
    st.board = { cv: cv, tex: tex, last: '' };
    
    // the station gates
    for (var k = 0; k < 8; k++) {
      var cx = trWagonX(k);
      [-1, 1].forEach(function (sd) {
        var pv = new THREE.Group(); pv.position.set(cx + sd * 0.62, 0.95, 2.05); dyn.add(pv);
        var leaf = pkBevelBox(0.62, 1.1, 0.05, M.wood, -sd * 0.31, 0.62, 0, pv, 0.01); box(0.62, 0.06, 0.07, M.brass, -sd * 0.31, 1.18, 0, pv);
        sign([String(k + 1)], 0.12, 0.12, -sd * 0.31, 0.75, -0.03, Math.PI, { w: 96, h: 96, bg: '#1b232c', fg: '#f3d36a' }, pv);
        st.gateLeaves.push({ pv: pv, sd: sd });
      });
      if (k < 7) { var fx = cx - 2.55; pkBevelBox(3.9, 0.06, 0.07, M.iron, fx, 2.0, 2.05, g, 0.01); pkBevelBox(3.9, 0.06, 0.07, M.iron, fx, 1.55, 2.05, g, 0.01); [-1.9, 1.9].forEach(function (pp) { box(0.07, 1.1, 0.07, M.iron, fx + pp, 1.5, 2.05, g); }); }
    }
    
    // the bell
    var bell = new THREE.Group(); bell.position.set(-14.5, 3.9, 7.1); g.add(bell); st.bellG = bell;
    pkLathe([[0.02, 0.5], [0.12, 0.45], [0.2, 0.3], [0.3, 0.1], [0.34, 0], [0.3, 0]], M.brass, 0, -0.5, 0, bell, 16); sphere(0.05, M.iron, 0, -0.52, 0, bell);
    box(0.1, 0.1, 0.7, M.iron, -14.5, 4.45, 6.95, g); pkRod(-14.5, 4.4, 7.1, -14.5, 4.4, 6.7, 0.03, M.iron, g, 6);
    
    trBuildCabinet(st);
    
    var p0 = trLocalToWorld(st, 0, 9.8), pts = def.walk.slice(); pts[0] = [p0.x, p0.z]; trPath(3.4, pts);
    trDrawBoard(st, true);
    return st;
  }
  function trLocalToWorld(st, lx, lz) { return { x: st.x + st.dx * lx - st.dz * lz, z: st.z + st.dz * lx + st.dx * lz }; }

  // ── The control cabinet ──────────────────────────────────────────
  function trBuildCabinet(st) {
    var M = trMats(), g = st.g, dyn = st.dyn, cx = 8, zf = 5.9, zb = 6.5, zp = 6.34, y0 = 0.95, shell = pkPaint(0x3b4650, 0.5, 0.5);
    pkBevelBox(1.2, 1.9, 0.06, shell, cx, y0 + 0.95, zb, g, 0.01);
    [-0.57, 0.57].forEach(function (sx) { pkBevelBox(0.06, 1.9, 0.6, shell, cx + sx, y0 + 0.95, (zf + zb) / 2, g, 0.01); });
    pkBevelBox(1.2, 0.06, 0.6, shell, cx, y0 + 1.9, (zf + zb) / 2, g, 0.01); pkBevelBox(1.2, 0.06, 0.6, shell, cx, y0 + 0.03, (zf + zb) / 2, g, 0.01);
    pkBevelBox(1.0, 1.7, 0.03, pkPaint(0x20262c, 0.8, 0.2), cx, y0 + 0.95, zp + 0.03, g, 0.005);
    sign(['TRAIN CONTROL'], 0.9, 0.16, cx, y0 + 2.05, zf - 0.02, Math.PI, { w: 256, h: 48, bg: '#1b232c', fg: '#f5b53d' }, g);
    pkBevelBox(0.5, 0.06, 0.5, M.stoneDark, cx, y0 + 0.01, (zf + zb) / 2, g, 0.01);
    var defs = [
      { k: 'auto', x: -0.32, y: 1.45, label: 'AUTO', sw: true }, { k: 'gates', x: 0, y: 1.45, label: 'GATES', sw: true }, { k: 'lights', x: 0.32, y: 1.45, label: 'LIGHTS', sw: true },
      { k: 'announce', x: -0.2, y: 0.78, label: 'ANNOUNCE', sw: false }, { k: 'bell', x: 0.2, y: 0.78, label: 'BELL', sw: false }
    ];
    defs.forEach(function (d) {
      var wx = cx + d.x, wy = y0 + d.y;
      sign([d.label], 0.28, 0.08, wx, wy + 0.22, zp - 0.005, Math.PI, { w: 192, h: 56, bg: '#1b232c', fg: '#f5f2e8' }, g);
      if (d.sw) {
        var base = pkRoundCyl(0.06, 0.04, M.brass, wx, wy, zp, g, 12); base.rotation.x = Math.PI / 2;
        var lv = new THREE.Group(); lv.position.set(wx, wy, zp - 0.03); dyn.add(lv);
        pkRoundCyl(0.016, 0.17, M.iron, 0, 0.085, 0, lv, 6); sphere(0.03, M.red, 0, 0.18, 0, lv);
        st.sw[d.k] = lv;
        var led = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), M.ledOff); led.position.set(wx, wy - 0.13, zp - 0.02); led.userData.noBake = true; g.add(led); st.led[d.k] = led;
      } else {
        var cap = pkRoundCyl(0.055, 0.05, d.k === 'bell' ? M.gold : M.red, wx, wy, zp - 0.05, dyn, 14); cap.rotation.x = Math.PI / 2; st.sw[d.k] = cap; cap.userData.rest = zp - 0.05;
      }
      var def = d;
      hitBox(0.24, 0.3, 0.3, wx, wy + 0.04, zp - 0.1, {
        prompt: function () { return st.cabOpen ? trSwitchPrompt(st, def.k) : ''; },
        use: function () { trSwitchUse(st, def.k); }
      }, g);
    });
    var pv = new THREE.Group(); pv.position.set(cx - 0.5, y0 + 0.95, zf); dyn.add(pv); st.doorPv = pv;
    pkBevelBox(1.0, 1.8, 0.05, pkPaint(0x4a5a68, 0.45, 0.5), 0.5, 0, 0, pv, 0.01);
    var lk = pkRoundCyl(0.05, 0.03, M.brass, 0.88, 0, -0.04, pv, 12); lk.rotation.x = Math.PI / 2; box(0.02, 0.07, 0.01, M.iron, 0.88, 0, -0.06, pv);
    sign(['STAFF ONLY'], 0.5, 0.1, 0.5, 0.55, -0.03, Math.PI, { w: 256, h: 48, bg: '#8a1f1f', fg: '#ffffff' }, pv);
    hitBox(1.0, 1.8, 0.3, 0.5, 0, -0.1, {
      prompt: function () { return st.cabOpen ? 'Close and lock the control cabinet' : 'Unlock the control cabinet with your key'; },
      use: function () { st.cabOpen = !st.cabOpen; }
    }, pv);
  }
  function trSwitchPrompt(st, k) {
    var R = trState();
    if (k === 'auto') return 'AUTO ' + (R.auto ? 'on' : 'off') + ' (all stations) - flip it';
    if (k === 'gates') return 'Station gates ' + (st.gatesAmt > 0.5 ? 'open' : 'shut') + ' - flip them';
    if (k === 'lights') return 'Station lights ' + (st.lightsOn ? 'on' : 'off') + ' - flip them';
    if (k === 'announce') return 'Announce: the train is leaving soon';
    return 'Ring the station bell';
  }
  function trSwitchUse(st, k) {
    var R = trState();
    if (k === 'auto') trSetAuto(!R.auto);
    else if (k === 'gates') trSetGates(st, st.gatesAmt < 0.5);
    else if (k === 'lights') { st.lightsOn = !st.lightsOn; R.st[st.id].lights = st.lightsOn; }
    else if (k === 'announce') trAnnounce(st);
    else trBell(st);
    sfx('click');
  }
  function trSetGates(st, open) { st.gatesWant = open; trState().st[st.id].gates = open; }

  function trDrawBoard(st, force) {
    var t = TR.t, txt1 = st.name, txt2 = '';
    if (t && t.at === st.idx && t.dwell > 0) { var d = Math.ceil(t.dwell); txt2 = 'DEPARTS IN ' + Math.floor(d / 60) + ':' + (d % 60 < 10 ? '0' : '') + (d % 60); }
    else if (t && t.nextSt === st.idx && t.at < 0) txt2 = 'TRAIN APPROACHING';
    else txt2 = 'NEXT TRAIN SOON';
    var key = txt1 + txt2; if (!force && st.board.last === key) return; st.board.last = key;
    var c = st.board.cv.getContext('2d'); if (!c) return;
    c.fillStyle = '#0d1a12'; c.fillRect(0, 0, 384, 128); c.fillStyle = '#f5b53d'; c.font = 'bold 34px Bahnschrift, Arial, sans-serif'; c.textAlign = 'center'; c.fillText(txt1, 192, 48);
    c.fillStyle = '#8ff0a8'; c.font = 'bold 30px Consolas, monospace'; c.fillText(txt2, 192, 100); st.board.tex.needsUpdate = true;
  }

  // ── The depot ─────────────────────────────────────────────────────
  function trBuildDepot() {
    var M = trMats(), P = pkMats(), zc = TR.N - 12, D = TR.depot = { x0: 44, x1: 95.5, z: zc, bays: {} };
    // The engine shed: a brick shed of two roads under a slate roof. The running road (the siding, z = zc) runs straight
    // through it from x 42, so the shed stands on that straight; the second road beside it is a dead end with the depot's
    // works van on it. Brick walls on a stone plinth, pilasters and tall arched windows, arched doorways at both ends with
    // their timber doors folded open, roof lights and a smoke vent along the ridge; inside the iron trusses, enamel
    // pendants, the inspection pit and the hoist, the wash bay, the benches, the lockers, the foreman's office.
    var X0 = 44, X1 = 95.5, ZN = zc - 9, ZS = zc + 5, H = 7.2, R1 = zc, R2 = zc - 5, cx = (X0 + X1) / 2, cz = (ZN + ZS) / 2;
    var brick = pkMatBrick(), stone = P.stone, dark = P.stoneDark, wood = M.woodD, iron = M.iron;
    var glass = std({ color: 0x2a3b4a, roughness: 0.08, metalness: 0.6 }), white = pkPaint(0xf0ece2, 0.6, 0.05), green = pkPaint(0x1d5b3b, 0.5, 0.2);
    var bayW = (X1 - X0) / 12;
    // the floor: concrete, and stone setts between and beside the running road's rails
    pkSlab(X1 - X0, ZS - ZN, cx, cz, 0.02, std({ color: 0x6d6a64, roughness: 0.95 }));
    box(X1 - X0, 0.02, 1.9, std({ color: 0x55524d, roughness: 0.95, map: P.paverTex }), cx, 0.035, R1, scene);
    // the long walls: a plinth, the brick, a pilaster at every bay, an arched window between, a cornice along the top
    [[ZN, -1], [ZS, 1]].forEach(function (w) {
      var z = w[0], o = w[1];
      box(X1 - X0, H, 0.45, brick, cx, H / 2, z, scene); solid(X0, X1, z - 0.25, z + 0.25, 0, H);
      box(X1 - X0 + 0.1, 0.9, 0.62, stone, cx, 0.45, z, scene);
      box(X1 - X0 + 0.2, 0.3, 0.7, stone, cx, H - 0.1, z, scene);
      for (var b = 0; b <= 12; b++) box(0.6, H - 0.9, 0.75, brick, X0 + b * bayW, 0.9 + (H - 0.9) / 2, z, scene);
      for (var bw = 0; bw < 12; bw++) {
        var wx = X0 + (bw + 0.5) * bayW;
        box(1.7, 2.8, 0.5, glass, wx, 3.6, z, scene);                                                  // the glass, both faces
        [-1, 1].forEach(function (f) {
          var fz = z + f * 0.26;
          var head = new THREE.Mesh(new THREE.CircleGeometry(0.85, 16, 0, Math.PI), glass); head.position.set(wx, 5.0, fz); head.rotation.y = f > 0 ? 0 : Math.PI; scene.add(head);
          var arc = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.12, 6, 18, Math.PI), stone); arc.position.set(wx, 5.0, fz); arc.rotation.y = f > 0 ? 0 : Math.PI; scene.add(arc);
          box(0.05, 2.8, 0.03, white, wx, 3.6, fz, scene); [2.7, 3.6, 4.5].forEach(function (y) { box(1.7, 0.04, 0.03, white, wx, y, fz, scene); });
          box(2.0, 0.16, 0.12, stone, wx, 2.16, fz, scene);                                            // the sill
        });
      }
    });
    // the gable ends: brick walls with an arched doorway over each road, a stone surround, the doors folded open outside
    function gableEnd(x, out) {
      var sh = new THREE.Shape(); sh.moveTo(ZN - 0.3, 0); sh.lineTo(ZS + 0.3, 0); sh.lineTo(ZS + 0.3, H); sh.lineTo(ZN - 0.3, H); sh.closePath();
      [R1, R2].forEach(function (rz) { var hp = new THREE.Path(), r = 2.2, sp = 4.6; hp.moveTo(rz - r, 0); hp.lineTo(rz - r, sp); hp.absarc(rz, sp, r, Math.PI, 0, true); hp.lineTo(rz + r, 0); hp.closePath(); sh.holes.push(hp); });
      var geo = new THREE.ExtrudeGeometry(sh, { depth: 0.5, bevelEnabled: false, curveSegments: 18 }), uv = geo.attributes.uv;
      for (var i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 4, uv.getY(i) / 4);
      var m = new THREE.Mesh(geo, brick); m.rotation.y = -Math.PI / 2; m.position.set(x + 0.25, 0, 0); m.castShadow = true; m.receiveShadow = true; scene.add(m);
      [R1, R2].forEach(function (rz) {
        var ring = new THREE.Mesh(new THREE.TorusGeometry(2.38, 0.2, 6, 20, Math.PI), stone); ring.rotation.y = Math.PI / 2; ring.position.set(x + out * 0.28, 4.6, rz); scene.add(ring);
        box(0.6, 1.2, 0.4, dark, x + out * 0.2, 0.6, rz - 2.45, scene); box(0.6, 1.2, 0.4, dark, x + out * 0.2, 0.6, rz + 2.45, scene);
        // the doors: two timber leaves on the jambs, stood open square to the wall (the doorways are too close together
        // for the leaves to fold back flat), strapped in iron
        [-1, 1].forEach(function (s) {
          var lz = rz + s * 2.32, lx = x + out * (0.3 + 1.1);
          box(2.2, 4.4, 0.12, green, lx, 2.2, lz, scene);
          [0.6, 2.2, 3.8].forEach(function (y) { box(2.2, 0.14, 0.04, iron, lx, y, lz + s * 0.07, scene); });
          for (var pl = -0.9; pl <= 0.91; pl += 0.3) box(0.02, 4.3, 0.02, pkPaint(0x174a30, 0.6, 0.1), lx + pl, 2.2, lz + s * 0.065, scene);
          solid(lx - 1.1, lx + 1.1, lz - 0.08, lz + 0.08, 0, 4.4);
        });
      });
      // the solid wall between and outside the doorways stops the player
      [[ZN - 0.3, R2 - 2.2], [R2 + 2.2, R1 - 2.2], [R1 + 2.2, ZS + 0.3]].forEach(function (seg) { solid(x - 0.25, x + 0.25, seg[0], seg[1], 0, H); });
    }
    gableEnd(X0, -1); gableEnd(X1, 1);
    // the roof: slate on brick gables, a run of roof lights down each slope, the smoke vent along the ridge
    var hd = (ZS - ZN) / 2 + 0.7, rise = 3.6, a = Math.atan2(rise, hd);
    pkGableRoof(X1 - X0 + 0.8, ZS - ZN + 1.4, rise, P.slate, brick, cx, H, cz, scene, 0.5);
    [-1, 1].forEach(function (s) {
      for (var rl = X0 + 4; rl < X1 - 3; rl += 6.5) {
        var gl = box(3.0, 0.04, 2.4, std({ color: 0x9fc6d8, roughness: 0.1, metalness: 0.4 }), rl, H + rise * 0.5 + 0.2, cz + s * hd * 0.5, scene); gl.rotation.x = s * a;
      }
    });
    box(X1 - X0 - 4, 1.0, 1.6, brick, cx, H + rise + 0.2, cz, scene);
    for (var lv = X0 + 2.5; lv < X1 - 2.4; lv += 0.6) [-1, 1].forEach(function (s) { var lb = box(0.5, 0.06, 0.04, iron, lv, H + rise + 0.25, cz + s * 0.82, scene); lb.rotation.x = s * 0.5; });
    pkGableRoof(X1 - X0 - 3.4, 2.2, 0.6, P.slate, brick, cx, H + rise + 0.7, cz, scene, 0.2);
    // the name and the date over the east doors
    sign(['LINDENBURG RAILWAY', 'LOCOMOTIVE DEPOT'], 7.6, 1.1, X1 + 0.32, H + 1.5, cz, Math.PI / 2, { w: 760, h: 110, bg: '#12301f', fg: '#f2e6b8' }, scene);
    var ds = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), stone); ds.rotation.y = Math.PI / 2; ds.position.set(X1 + 0.31, H + 2.9, cz); scene.add(ds);
    sign(['1904'], 0.7, 0.3, X1 + 0.33, H + 2.9, cz, Math.PI / 2, { w: 160, h: 64, bg: '#b8ae9c', fg: '#3a3026', plate: false }, scene);
    // inside: the iron trusses, a pendant lamp over each road at every other bay
    for (var tb = 1; tb < 12; tb++) {
      var tx = X0 + tb * bayW;
      pkRod(tx, H, ZN + 0.3, tx, H, ZS - 0.3, 0.05, iron, scene, 6);
      pkRod(tx, H, ZN + 0.3, tx, H + rise - 0.3, cz, 0.07, iron, scene, 6); pkRod(tx, H, ZS - 0.3, tx, H + rise - 0.3, cz, 0.07, iron, scene, 6);
      pkRod(tx, H, cz, tx, H + rise - 0.3, cz, 0.04, iron, scene, 6);
      if (tb % 2 === 1) [R1, R2].forEach(function (rz) {
        pkRod(tx, H, rz, tx, 5.6, rz, 0.012, iron, scene, 4);
        var shade = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.3, 16, 1, true), std({ color: 0x1d5b3b, roughness: 0.5, side: THREE.DoubleSide })); shade.position.set(tx, 5.45, rz); scene.add(shade);
        sphere(0.12, glowMat(0xfff0c8, 1.2), tx, 5.32, rz, scene);
      });
    }
    // the inspection pit under the running road, the hoist over it
    box(14, 0.05, 0.9, std({ color: 0x0a0b0c, roughness: 1 }), 59, 0.075, R1);
    for (var gx = 52.5; gx < 66; gx += 0.9) box(0.08, 0.04, 0.9, iron, gx, 0.115, R1);
    [R1 - 2.7, R1 + 2.7].forEach(function (zz) { pkBevelBox(0.35, 6.2, 0.35, iron, 59, 3.1, zz, scene, 0.03); });
    box(0.4, 0.45, 5.8, pkPaint(0xe3a02e, 0.5, 0.4), 59, 6.1, R1, scene); box(0.9, 0.5, 0.9, iron, 59, 5.65, R1 - 1.0, scene); pkRod(59, 5.4, R1 - 1.0, 59, 4.2, R1 - 1.0, 0.02, iron, scene, 4);
    // the wash bay: a portal over the running road at x 80, its two brushes and the spray (the wash in part 43 runs them)
    [R1 - 2.4, R1 + 2.4].forEach(function (zz) { pkBevelBox(0.3, 3.8, 0.3, iron, 80, 1.9, zz, scene, 0.03); });
    pkBevelBox(0.3, 0.3, 5.1, iron, 80, 3.8, R1, scene, 0.03);
    D.brushes = []; [-1, 1].forEach(function (sd) { var br = trDyn(); br.position.set(80, 0, R1 + sd * 1.9); pkRoundCyl(0.45, 2.6, pkPaint(0x2a7fd0, 0.9, 0), 0, 1.7, 0, br, 14); pkRoundCyl(0.05, 3.2, iron, 0, 1.7, 0, br, 6); D.brushes.push(br); });
    D.spray = []; for (var n = 0; n < 8; n++) { var sp = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.8 })); sp.visible = false; sp.userData.noBake = true; scene.add(sp); D.spray.push(sp); }
    // the second road: a dead end with a buffer stop, the depot's works van standing on it
    for (var sl = X0 + 0.6; sl < X1 - 2.5; sl += 0.7) box(1.6, 0.08, 0.22, wood, sl, 0.06, R2, scene);
    [-0.56, 0.56].forEach(function (o) { box(X1 - X0 - 3, 0.12, 0.07, iron, (X0 + X1 - 2.4) / 2, 0.16, R2 + o, scene); });
    pkBevelBox(0.5, 1.0, 2.2, pkPaint(0x8e2a22, 0.6, 0.2), X1 - 2.2, 0.5, R2, scene, 0.04); box(0.12, 0.3, 2.3, pkStripes('#f0c04a', '#1b1b1b'), X1 - 2.45, 0.9, R2, scene);
    var van = new THREE.Group(); van.position.set(64, 0, R2); scene.add(van);
    pkBevelBox(5.2, 0.18, 1.9, iron, 0, 0.8, 0, van, 0.02);
    pkBevelBox(5.0, 2.2, 2.1, pkPaint(0x6a2a22, 0.7, 0.1), 0, 2.0, 0, van, 0.04);
    var vr = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 5.1, 20, 1, false, -0.42, 0.84), pkPaint(0x3a3d40, 0.7, 0.2)); vr.rotation.z = Math.PI / 2; vr.rotation.y = 0; vr.geometry.rotateX(-Math.PI / 2); vr.position.set(0, 0.62, 0); van.add(vr);
    [-1, 1].forEach(function (s) { box(1.2, 1.8, 0.04, pkPaint(0x5a2420, 0.7, 0.1), 0, 1.95, s * 1.07, van); sign(['WORKS No. 2'], 1.4, 0.24, -1.5, 2.6, s * 1.08, s > 0 ? 0 : Math.PI, { w: 256, h: 44, bg: '#6a2a22', fg: '#f2e6b8', plate: false }, van); });
    [-1.6, 1.6].forEach(function (wx) { [-1, 1].forEach(function (s) { var wh = trWheel(0.4, M.black, M.black, van, wx, 0.5, s * 0.72, 6); }); });
    [-1, 1].forEach(function (e) { [-0.6, 0.6].forEach(function (z) { var bf = pkRoundCyl(0.09, 0.2, iron, e * 2.65, 0.9, z, van, 8); bf.rotation.z = Math.PI / 2; }); });
    solid(61.3, 66.7, R2 - 1.1, R2 + 1.1, 0, 3.2);
    // along the north wall: benches with vices, a tool board over each, lockers at the east end, a wheelset on its stands
    for (var bx = 50; bx <= 80; bx += 10) {
      pkBevelBox(2.6, 0.08, 0.8, wood, bx, 0.92, ZN + 0.75, scene, 0.02); [-1.2, 1.2].forEach(function (lx) { box(0.07, 0.9, 0.7, iron, bx + lx, 0.45, ZN + 0.75, scene); });
      box(0.2, 0.18, 0.2, iron, bx + 0.9, 1.05, ZN + 1.0, scene); pkRod(bx + 0.9, 1.1, ZN + 1.1, bx + 0.9, 1.1, ZN + 1.35, 0.015, iron, scene, 6);
      box(2.4, 1.2, 0.04, pkPaint(0xd8c9a8, 0.8, 0.05), bx, 1.9, ZN + 0.26, scene);
      for (var tl = 0; tl < 7; tl++) box(0.04, 0.2 + (tl % 3) * 0.1, 0.03, iron, bx - 1.0 + tl * 0.33, 1.9, ZN + 0.29, scene);
      solid(bx - 1.3, bx + 1.3, ZN + 0.3, ZN + 1.2, 0, 1.0);
    }
    for (var lk = 0; lk < 6; lk++) pkBevelBox(0.55, 1.9, 0.5, pkPaint(0x2f4a62, 0.5, 0.4), 86 + lk * 0.6, 0.95, ZN + 0.55, scene, 0.02);
    solid(85.6, 89.6, ZN + 0.25, ZN + 0.85, 0, 1.9);
    [70.2, 71.8].forEach(function (sx) { pkRoundCyl(0.06, 0.6, iron, sx, 0.3, ZN + 2.2, scene, 6); });
    var ws = new THREE.Group(); ws.position.set(71, 0.82, ZN + 2.2); scene.add(ws); ws.rotation.y = Math.PI / 2;
    [-0.6, 0.6].forEach(function (z) { trWheel(0.55, M.black, M.black, ws, 0, 0, z, 8); }); pkRoundCyl(0.06, 1.4, iron, 0, 0, 0, ws, 8).rotation.x = Math.PI / 2;
    // oil drums, fire buckets on the south wall, the service consoles along it
    [[74, ZS - 0.8], [74.8, ZS - 0.7], [74.4, ZS - 1.4]].forEach(function (d, i) { pkRoundCyl(0.3, 0.88, pkPaint([0x2a5a8a, 0x8a2a22, 0x2a6a3a][i], 0.6, 0.3), d[0], 0.44, d[1], scene, 14); });
    for (var fb = 0; fb < 4; fb++) { pkRoundCyl(0.13, 0.3, pkPaint(0xc8322a, 0.5, 0.2), 50 + fb * 0.45, 1.5, ZS - 0.35, scene, 10); box(0.02, 0.06, 0.02, iron, 50 + fb * 0.45, 1.7, ZS - 0.3, scene); }
    sign(['FIRE'], 1.6, 0.25, 50.7, 2.0, ZS - 0.24, Math.PI, { w: 256, h: 40, bg: '#c8322a', fg: '#ffffff', plate: false }, scene);
    function console3(x, label, prompt, fn) {
      pkBevelBox(0.9, 1.3, 0.5, pkPaint(0x3b4650, 0.5, 0.5), x, 0.65, R1 + 3.9, scene, 0.03);
      sign([label], 0.8, 0.2, x, 1.5, R1 + 3.63, Math.PI, { w: 256, h: 64, bg: '#1b232c', fg: '#f5b53d' }, scene);
      hitBox(0.9, 1.4, 0.6, x, 0.7, R1 + 3.75, { prompt: prompt, use: fn }, scene);
      solid(x - 0.45, x + 0.45, R1 + 3.65, R1 + 4.15, 0, 1.3);
    }
    console3(56, 'COAL + WATER', function () { return trInDepot() ? 'Fill up coal and water' + trFillCost() : 'Bring the train into the depot first'; }, function () { trDoFill(); });
    console3(66, 'SERVICE', function () { return trInDepot() ? 'Service the train - ' + trServiceCost() : 'Bring the train into the depot first'; }, function () { trDoService(); });
    console3(83, 'WASH', function () { return trInDepot() ? 'Wash the train ($30)' : 'Bring the train into the depot first'; }, function () { trDoWash(); });
    // the foreman's office in the south-west corner: a timber room glazed above the waist
    var ox0 = 45, ox1 = 49.5, oz0 = R1 + 2.6, oz1 = ZS - 0.25;
    box(ox1 - ox0, 1.1, 0.1, green, (ox0 + ox1) / 2, 0.55, oz0, scene); box(ox1 - ox0, 1.2, 0.04, glass, (ox0 + ox1) / 2, 1.7, oz0, scene); box(ox1 - ox0, 0.6, 0.1, green, (ox0 + ox1) / 2, 2.6, oz0, scene);
    box(0.1, 2.9, oz1 - oz0, green, ox1, 1.45, (oz0 + oz1) / 2, scene); box(ox1 - ox0 + 0.2, 0.1, oz1 - oz0 + 0.2, wood, (ox0 + ox1) / 2, 2.95, (oz0 + oz1) / 2, scene);
    pkBevelBox(1.4, 0.06, 0.7, wood, 46.6, 0.85, oz1 - 0.5, scene, 0.02); box(0.5, 0.35, 0.03, pkPaint(0x1b232c, 0.5, 0.2), 46.6, 1.1, oz1 - 0.75, scene);
    sign(['FOREMAN'], 1.1, 0.2, (ox0 + ox1) / 2, 2.45, oz0 - 0.06, Math.PI, { w: 256, h: 48, bg: '#12301f', fg: '#f2e6b8' }, scene);
    solid(ox0, ox1, oz0 - 0.05, oz0 + 0.05, 0, 2.9); solid(ox1 - 0.05, ox1 + 0.05, oz0, oz1, 0, 2.9);
    // the yard outside each end: a concrete apron
    pkSlab(10, 16, X1 + 5, cz, 0.018, std({ color: 0x6d6a64, roughness: 0.95 })); pkSlab(8, 16, X0 - 4, cz, 0.018, std({ color: 0x6d6a64, roughness: 0.95 }));
    var wt = new THREE.Group(); wt.position.set(104, 0, zc - 20); scene.add(wt);
    [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]].forEach(function (p) { pkRod(p[0], 0, p[1], p[0] * 0.8, 6, p[1] * 0.8, 0.12, M.woodD, wt, 8); });
    pkRoundCyl(2.2, 3.4, M.woodD, 0, 7.7, 0, wt, 20); trCone(2.5, 1.8, M.slateRed, 0, 10.2, 0, wt, 20);
    for (var h = 0; h < 4; h++) pkRoundCyl(2.24, 0.1, M.iron, 0, 6.4 + h * 0.9, 0, wt, 20);
    solid(102.4, 105.6, zc - 21.6, zc - 18.4, 0, 12);
    for (var cc = 0; cc < 6; cc++) trCone(2.0 - cc * 0.25, 1.6, M.coal, 20 + cc * 0.5, 0.8, zc - 14 + cc * 0.4, scene, 10);
    solid(17, 25, zc - 17, zc - 11, 0, 3);
    pkBevelBox(6, 3, 4, P.clapGrey, 56, 1.5, zc - 17, scene, 0.05); pkGableRoof(6, 4, 1.4, P.slate, P.clapGrey, 56, 3, zc - 17, scene, 0.3); solid(53, 59, zc - 19, zc - 15, 0, 4.5);
    sign(['DEPOT OFFICE'], 2.6, 0.4, 56, 2.5, zc - 14.93, 0, { w: 320, h: 56, bg: '#1b232c', fg: '#f5b53d' }, scene);
    trPath(3.0, [[-17, TR.N - 18], [-17, zc - 12], [56, zc - 12]], 0.013);
    var pl = new THREE.Group(); pl.position.set(TR.J1 + 4, 0, TR.N + 3.4); scene.add(pl);
    pkBevelBox(0.5, 0.5, 0.7, M.stoneDark, 0, 0.25, 0, pl, 0.03); var lvDyn = trDyn(pl); lvDyn.position.set(0, 0.5, 0); D.lever = lvDyn;
    pkRod(0, 0, 0, 0, 1.0, 0, 0.03, M.red, lvDyn, 6); sphere(0.07, M.red, 0, 1.0, 0, lvDyn);
    var tgt = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.04), M.white); tgt.position.set(0, 1.9, 0); pl.add(tgt); pkRoundCyl(0.03, 1.5, M.iron, 0, 1.15, 0, pl, 6);
    D.lamp = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), M.ledGreen); D.lamp.position.set(0, 2.2, 0); D.lamp.userData.noBake = true; pl.add(D.lamp);
    hitBox(0.9, 2.4, 0.9, 0, 1.2, 0, {
      prompt: function () { return trPointsLocked() ? 'Points are locked while a train is on them' : 'Points set to ' + (trState().points === 'depot' ? 'the DEPOT' : 'the MAIN line') + ' - throw them'; },
      use: function () { trThrowPoints(); }
    }, pl);
    sign(['POINTS', 'MAIN / DEPOT'], 1.2, 0.34, 0, 2.7, 0, Math.PI, { w: 256, h: 96, bg: '#1b232c', fg: '#f5b53d' }, pl);
  }
