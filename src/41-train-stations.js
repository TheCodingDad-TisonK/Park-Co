//@ Park Co, part 41: the Lindenburg Railway - five stations with their control cabinets, and the depot.
  // ── The saved state ───────────────────────────────────────────────
  function trState() {
    var r = S.tr || (S.tr = {});
    if (r.fuel === undefined) { r.fuel = 100; r.water = 100; r.wear = 0; r.dirt = 20; r.auto = false; r.points = 'main'; r.st = {}; r.laps = 0; }
    return r;
  }
  var TR_STATIONS = [
    { id: 'central', name: 'CENTRAL STATION', x: -128, z: 34, walk: [[-117.4, 34], [-117.4, 62], [-30, 62]], roof: 'slateRed' },
    { id: 'woods', name: 'ELFIN WOODS', x: -128, z: -72, walk: [[-117.4, -72], [-68, -72]], roof: 'slateGreen' },
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
      var st = TR.st[i]; if (Math.abs(x - st.x) > 40 && Math.abs(z - st.z) > 40) continue;
      var l = trStationLocal(st, x, z);
      if (Math.abs(l.lx) <= 32.2 && l.lz >= 1.9 && l.lz <= 7.3) return 0.95;
      if (Math.abs(l.lx) <= 1.7 && l.lz > 7.3 && l.lz < 10.5) return 0.95 * (10.5 - l.lz) / 3.2;
    }
    return null;
  }
  var _trPrevFloor = GAME.floorY;
  GAME.floorY = function (x, z, y) { var h = trFloorAt(x, z), b = _trPrevFloor ? _trPrevFloor(x, z, y) : 0; return h === null ? b : Math.max(h, b); };
  var _trPrevCollides = GAME.collides;
  GAME.collides = function (x, z, opt) { return (_trPrevCollides && _trPrevCollides(x, z, opt)) || trXingBlocks(x, z) || trGateBlocks(x, z); };
  function trGateBlocks(x, z) {   // a shut platform gate is a wall along the edge
    for (var i = 0; i < TR.st.length; i++) {
      var st = TR.st[i]; if (st.gatesAmt > 0.5 || Math.abs(x - st.x) > 40 && Math.abs(z - st.z) > 40) continue;
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
  function trLamp(st, x, z, y) {
    var M = trMats(), g = st.g;
    pkRoundCyl(0.05, 3.2, M.iron, x, y + 1.6, z, g, 8); pkBevelBox(0.3, 0.1, 0.3, M.iron, x, y + 0.05, z, g, 0.03);
    var lens = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), M.lampOff); lens.position.set(x, y + 3.35, z); lens.userData.noBake = true; g.add(lens);
    cyl(0.04, 0.22, M.iron, x, y + 3.62, z, g, 6, 0.2); sphere(0.05, M.brass, x, y + 3.76, z, g);
    st.lamps.push(lens);
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
      lightsOn: !!mine.lights, door: 0, doorWant: false, bellT: 0, bellG: null, board: null, light: null, sw: {}, led: {}, cabOpen: false, staff: 0 };
    TR.st.push(st);
    // the platform, edged in yellow, with steps down to the walk behind it
    pkBevelBox(64, 0.95, 5.4, M.stone, 0, 0.475, 4.6, g, 0.04); pkBevelBox(64.3, 0.05, 5.6, M.stoneDark, 0, 0.95, 4.6, g, 0.02);
    box(64, 0.02, 0.28, pkPaint(0xf0c63a, 0.6, 0.1), 0, 0.985, 2.3, g);
    var ramp = box(3.3, 0.12, 3.5, M.stoneDark, 0, 0.47, 8.95, g); ramp.rotation.x = -Math.atan2(0.95, 3.2);
    // the building: timber and cream, a steep gable roof, a clock tower with a pointed spire
    pkBevelBox(12, 3.3, 4.4, P.cream, -22, 2.6, 9.8, g, 0.05);
    box(12.2, 0.14, 4.6, M.woodD, -22, 0.97 + 0.05, 9.8, g);
    for (var bx = -27.5; bx <= -16.5; bx += 2.2) box(0.14, 3.3, 0.1, M.woodD, bx, 2.6, 7.56, g);
    box(12.1, 0.14, 0.1, M.woodD, -22, 4.2, 7.55, g); box(12.1, 0.14, 0.1, M.woodD, -22, 2.4, 7.55, g);
    pkGableRoof(12, 4.4, 2.2, P[def.roof], P.cream, -22, 4.25, 9.8, g, 0.5);
    [-26, -19].forEach(function (wx) { pkWindow(g, wx, 3.2, 7.55, 1.1, 1.3, Math.PI, P.white, P.pane); });
    var door = pkBevelBox(1.1, 2.2, 0.1, M.wood, -22.5, 2.05, 7.55, g, 0.03); door.rotation.y = 0; sphere(0.05, M.brass, -22.2, 2.05, 7.48, g);
    var tw = pkBevelBox(2.6, 6.6, 2.6, P.cream, -29.2, 4.25, 9.8, g, 0.05);
    for (var ty = 1.6; ty < 7; ty += 2.2) box(2.7, 0.12, 2.7, M.woodD, -29.2, ty + 0.95, 9.8, g);
    var sp = new THREE.Mesh(new THREE.ConeGeometry(2.0, 4.6, 8), P[def.roof]); sp.position.set(-29.2, 10.85, 9.8); sp.castShadow = true; g.add(sp);
    sphere(0.12, M.gold, -29.2, 13.25, 9.8, g);
    [[-29.2, 7.45, 0, Math.PI], [-27.88, 9.8, 1, Math.PI / 2]].forEach(function (c) {   // the clock, on the track side and the walk side
      var face = new THREE.Mesh(new THREE.CircleGeometry(0.8, 24), std({ color: 0xf4efe0, roughness: 0.5 })); face.position.set(c[0], 6.7, c[1]); face.rotation.y = c[3]; g.add(face);
      var hand = box(0.05, 0.6, 0.03, M.iron, c[0], 6.95, c[1] + (c[3] === Math.PI ? -0.03 : 0), g); hand.rotation.z = 0.5;
    });
    sign([def.name], 6.4, 0.7, -21, 4.7, 7.4, Math.PI, { w: 512, h: 64, bg: '#12301f', fg: '#f2e6b8' }, g);
    // the canopy over the platform: iron posts, a sloping roof with a scalloped, painted valance
    for (var px = -4; px >= -28; px -= 6) { pkRoundCyl(0.07, 3.2, M.iron, px, 2.55, 3.4, g, 8); }
    var roof = pkBevelBox(28, 0.12, 6.2, P[def.roof], -16, 4.3, 5.9, g, 0.03); roof.rotation.x = 0.06;
    for (var vx = -29.5; vx <= -2.5; vx += 0.9) { var sc = trCone(0.28, 0.45, [M.red, M.cream, M.green][Math.round((vx + 30) / 0.9) % 3], vx, 4.0, 2.9, g, 4); sc.rotation.x = Math.PI; }
    // benches, lamps, bins
    trBench(g, -8, 6.4, 0, 0.95); trBench(g, 6, 6.4, 0, 0.95); trBench(g, 16, 6.4, 0, 0.95); trBench(g, -15, 3.1, Math.PI, 0.95);
    [-10, 2, 14, 24].forEach(function (lx) { trLamp(st, lx, 6.7, 0.95); });
    st.light = new THREE.PointLight(0xffd9a0, 0, 26); st.light.position.set(-8, 4.0, 5); g.add(st.light);
    // the departure board, hung under the canopy
    var cv = document.createElement('canvas'); cv.width = 384; cv.height = 128; var tex = new THREE.CanvasTexture(cv);
    var bm = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.8), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })); bm.position.set(-8, 3.55, 3.4); bm.userData.noBake = true; g.add(bm);
    box(2.5, 0.9, 0.06, M.iron, -8, 3.55, 3.44, g); st.board = { cv: cv, tex: tex, last: '' };
    // the station gates: a rail along the platform edge with a pair of leaves at each wagon door
    for (var k = 0; k < 8; k++) {
      var cx = trWagonX(k);
      [-1, 1].forEach(function (sd) {
        var pv = new THREE.Group(); pv.position.set(cx + sd * 0.62, 0.95, 2.05); dyn.add(pv);
        var leaf = pkBevelBox(0.62, 1.1, 0.05, M.wood, -sd * 0.31, 0.62, 0, pv, 0.01); box(0.62, 0.06, 0.07, M.brass, -sd * 0.31, 1.18, 0, pv);
        st.gateLeaves.push({ pv: pv, sd: sd });
      });
      if (k < 7) { var fx = cx - 2.55; pkBevelBox(3.9, 0.06, 0.07, M.iron, fx, 2.0, 2.05, g, 0.01); pkBevelBox(3.9, 0.06, 0.07, M.iron, fx, 1.55, 2.05, g, 0.01); [-1.9, 1.9].forEach(function (pp) { box(0.07, 1.1, 0.07, M.iron, fx + pp, 1.5, 2.05, g); }); }
    }
    // the bell, on a bracket on the building: it swings while it rings
    var bell = new THREE.Group(); bell.position.set(-14.5, 3.9, 7.1); g.add(bell); st.bellG = bell;
    pkLathe([[0.02, 0.5], [0.12, 0.45], [0.2, 0.3], [0.3, 0.1], [0.34, 0], [0.3, 0]], M.brass, 0, -0.5, 0, bell, 16); sphere(0.05, M.iron, 0, -0.52, 0, bell);
    box(0.1, 0.1, 0.7, M.iron, -14.5, 4.45, 6.95, g); pkRod(-14.5, 4.4, 7.1, -14.5, 4.4, 6.7, 0.03, M.iron, g, 6);
    trBuildCabinet(st);
    // the walk, and where it meets the palisade
    var p0 = trLocalToWorld(st, 0, 10.7), pts = def.walk.slice(); pts[0] = [p0.x, p0.z]; trPath(3.4, pts);
    trDrawBoard(st, true);
    return st;
  }
  function trLocalToWorld(st, lx, lz) { return { x: st.x + st.dx * lx - st.dz * lz, z: st.z + st.dz * lx + st.dx * lz }; }

  // ── The control cabinet: a locked door and, behind it, 3 switches and 2 buttons ──
  function trBuildCabinet(st) {
    var M = trMats(), g = st.g, dyn = st.dyn, cx = 8, zf = 6.7, zb = 7.3, zp = 7.22, y0 = 0.95, shell = pkPaint(0x3b4650, 0.5, 0.5);
    pkBevelBox(1.2, 1.9, 0.06, shell, cx, y0 + 0.95, zb, g, 0.01);                                     // back
    [-0.57, 0.57].forEach(function (sx) { pkBevelBox(0.06, 1.9, 0.6, shell, cx + sx, y0 + 0.95, (zf + zb) / 2, g, 0.01); });
    pkBevelBox(1.2, 0.06, 0.6, shell, cx, y0 + 1.9, (zf + zb) / 2, g, 0.01); pkBevelBox(1.2, 0.06, 0.6, shell, cx, y0 + 0.03, (zf + zb) / 2, g, 0.01);
    pkBevelBox(1.0, 1.7, 0.03, pkPaint(0x20262c, 0.8, 0.2), cx, y0 + 0.95, zp + 0.03, g, 0.005);       // the inner plate
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
    var pv = new THREE.Group(); pv.position.set(cx - 0.5, y0 + 0.95, zf); dyn.add(pv); st.doorPv = pv;   // the door hangs on its left edge
    pkBevelBox(1.0, 1.8, 0.05, pkPaint(0x4a5a68, 0.45, 0.5), 0.5, 0, 0, pv, 0.01);
    var lk = pkRoundCyl(0.05, 0.03, M.brass, 0.88, 0, -0.04, pv, 12); lk.rotation.x = Math.PI / 2; box(0.02, 0.07, 0.01, M.iron, 0.88, 0, -0.06, pv);   // the lock and its keyhole
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

  // the departure board: the next stop and the time to go
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
  // the siding runs through a long shed north of the park: coal and water, a pit with a hoist, a wash. Between the points
  // lever near the north run and the shed it is a loop-through, so the train never has to reverse.
  function trBuildDepot() {
    var M = trMats(), P = pkMats(), zc = TR.N - 12, D = TR.depot = { x0: 28, x1: 92, z: zc, bays: {} };
    // the floor and the walls: open arches at both ends, tall windows along the south wall
    pkSlab(70, 14.4, 60, zc, 0.02, std({ color: 0x6d6a64, roughness: 0.95 }));
    pkBevelBox(70, 5.2, 0.5, P.cream, 60, 2.6, zc - 7.2, scene, 0.05);
    pkBevelBox(70, 1.2, 0.5, P.cream, 60, 0.6, zc + 7.2, scene, 0.05); pkBevelBox(70, 0.9, 0.5, P.cream, 60, 4.75, zc + 7.2, scene, 0.05);
    for (var px = 26; px <= 94; px += 4.25) box(0.4, 3.6, 0.5, M.woodD, px, 3.0, zc + 7.2, scene);
    for (var wx = 28.1; wx < 94; wx += 4.25) { plane(3.2, 2.7, P.pane, wx + 1.9, 2.95, zc + 6.94, 0, Math.PI, scene); }
    pkBevelBox(0.5, 5.2, 14.4, P.cream, 25.2, 2.6, zc, scene, 0.05); pkBevelBox(0.5, 5.2, 14.4, P.cream, 94.8, 2.6, zc, scene, 0.05);
    // the arches: the end walls are cut open for the train (a lintel over a 3.6 m opening)
    pkGableRoof(70, 15, 3.2, P.slate, P.cream, 60, 5.2, zc, scene, 0.6);
    pkBevelBox(0.7, 1.4, 4.0, P.stoneDark, 25.1, 4.5, zc, scene, 0.05); pkBevelBox(0.7, 1.4, 4.0, P.stoneDark, 94.9, 4.5, zc, scene, 0.05);
    sign(['LINDENBURG RAILWAY', 'LOCOMOTIVE DEPOT'], 6.4, 1.0, 60, 6.2, zc + 7.55, 0, { w: 640, h: 100, bg: '#12301f', fg: '#f2e6b8' }, scene);
    // the pit between the rails, covered by gratings
    box(14, 0.05, 0.9, std({ color: 0x0a0b0c, roughness: 1 }), 59, 0.075, zc);
    for (var gx = 52.5; gx < 66; gx += 0.9) box(0.08, 0.04, 0.9, M.iron, gx, 0.115, zc);
    // an overhead gantry: two columns and a rolling beam with a hoist
    [zc - 5.5, zc + 5.5].forEach(function (zz) { pkBevelBox(0.35, 5, 0.35, M.iron, 59, 2.5, zz, scene, 0.03); });
    box(0.4, 0.45, 11.6, pkPaint(0xe3a02e, 0.5, 0.4), 59, 4.8, zc, scene); var hoist = box(0.9, 0.5, 0.9, M.iron, 59, 4.35, zc - 1.5, scene); pkRod(59, 4.1, zc - 1.5, 59, 3.0, zc - 1.5, 0.02, M.iron, scene, 4);
    // 1. the coal stage and the water crane
    pkBevelBox(4.4, 2.6, 2.4, M.stoneDark, 40, 1.3, zc - 5.6, scene, 0.05); for (var c = 0; c < 9; c++) sphere(0.5 + (c % 3) * 0.12, M.coal, 38.6 + (c % 4) * 0.95, 2.7 + (c % 2) * 0.2, zc - 5.6 + ((c * 3) % 5 - 2) * 0.3, scene);
    box(0.6, 0.12, 2.6, M.iron, 40, 2.4, zc - 3.4, scene).rotation.x = 0.5;
    pkRoundCyl(0.12, 4.0, M.iron, 45, 2.0, zc + 3.3, scene, 10); pkRod(45, 3.9, zc + 3.3, 45, 3.5, zc + 1.2, 0.07, M.iron, scene, 8); pkRod(45, 3.5, zc + 1.2, 45, 2.3, zc + 1.2, 0.08, M.black, scene, 8);
    // 2./3. the wash: a frame over the rails with two rotating brushes; and a console at each bay
    [zc - 2.4, zc + 2.4].forEach(function (zz) { pkBevelBox(0.3, 3.8, 0.3, M.iron, 80, 1.9, zz, scene, 0.03); });
    pkBevelBox(0.3, 0.3, 5.1, M.iron, 80, 3.8, zc, scene, 0.03);
    D.brushes = []; [-1, 1].forEach(function (sd) { var br = trDyn(); br.position.set(80, 0, zc + sd * 1.9); pkRoundCyl(0.45, 2.6, pkPaint(0x2a7fd0, 0.9, 0), 0, 1.7, 0, br, 14); pkRoundCyl(0.05, 3.2, M.iron, 0, 1.7, 0, br, 6); D.brushes.push(br); });
    D.spray = []; for (var n = 0; n < 8; n++) { var sp = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.8 })); sp.visible = false; sp.userData.noBake = true; scene.add(sp); D.spray.push(sp); }
    function console3(x, label, cost, prompt, fn) {
      pkBevelBox(0.9, 1.3, 0.5, pkPaint(0x3b4650, 0.5, 0.5), x, 0.65, zc + 5.9, scene, 0.03);
      sign([label], 0.8, 0.2, x, 1.5, zc + 5.63, 0, { w: 256, h: 64, bg: '#1b232c', fg: '#f5b53d' }, scene);
      hitBox(0.9, 1.4, 0.6, x, 0.7, zc + 5.7, { prompt: prompt, use: fn }, scene);
    }
    console3(38, 'COAL + WATER', 0, function () { return trInDepot() ? 'Fill up coal and water' + trFillCost() : 'Bring the train into the depot first'; }, function () { trDoFill(); });
    console3(60, 'SERVICE', 0, function () { return trInDepot() ? 'Service the train - ' + trServiceCost() : 'Bring the train into the depot first'; }, function () { trDoService(); });
    console3(80, 'WASH', 0, function () { return trInDepot() ? 'Wash the train ($30)' : 'Bring the train into the depot first'; }, function () { trDoWash(); });
    // the yard: a water tower, a coal heap, a hut, a fence, and the lane in from the crossing
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
    // the points lever, just south of the north run where the siding leaves it
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
