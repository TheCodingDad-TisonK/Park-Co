//@ Park Co, part 42: the Lindenburg Railway - rolling stock. A green 4-4-0 "American" steam locomotive with a coal tender,
  // and eight open fairy-tale wagons of four seats each. Every unit is a group in the line's frame (+x forward, +z right).
  var TR_WAGONS = [
    { n: 'SLEEPING BEAUTY', body: 0x8a6fb8, trim: 0xf3d36a, roof: 'spires' },
    { n: 'SEVEN DWARFS', body: 0xb3262b, trim: 0xf6f0e2, roof: 'mushroom' },
    { n: 'GINGERBREAD HOUSE', body: 0x8b5a2b, trim: 0xf6f0e2, roof: 'gingerbread' },
    { n: 'THE FROG KING', body: 0x3f8f4a, trim: 0xf3d36a, roof: 'crown' },
    { n: 'FATA MORGANA', body: 0x1fa9a3, trim: 0xf3d36a, roof: 'onion' },
    { n: 'FAIRYTALE TREE', body: 0x6b4a2e, trim: 0x7fae52, roof: 'tree' },
    { n: 'CARNIVAL FESTIVAL', body: 0xd94f4f, trim: 0xf6f0e2, roof: 'tent' },
    { n: 'DREAM FLIGHT', body: 0x233a7a, trim: 0xf3d36a, roof: 'moon' }
  ];
  function trWheel(r, mat, rimMat, parent, x, y, z, spokes) {
    var w = new THREE.Group(); w.position.set(x, y, z); parent.add(w);
    var tire = new THREE.Mesh(new THREE.TorusGeometry(r - 0.04, 0.045, 6, 20), rimMat); w.add(tire); tire.castShadow = true;
    var disc = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.06, r - 0.06, 0.04, 18), mat); disc.rotation.x = Math.PI / 2; w.add(disc);
    for (var i = 0; i < (spokes || 6); i++) { var sp = box(0.05, (r - 0.1) * 2, 0.05, rimMat, 0, 0, 0, w); sp.rotation.z = i * Math.PI / (spokes || 6); }
    var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 10), rimMat); hub.rotation.x = Math.PI / 2; w.add(hub);
    return w;
  }
  function trGauge(parent, x, y, z, ry, label, key) {   // a brass dial with a needle that the update turns
    var M = trMats(), g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
    var cv = document.createElement('canvas'); cv.width = cv.height = 128; var c = cv.getContext('2d');
    if (c) { c.fillStyle = '#f4efe0'; c.beginPath(); c.arc(64, 64, 62, 0, 7); c.fill(); c.strokeStyle = '#222'; c.lineWidth = 3;
      for (var i = 0; i <= 10; i++) { var a = (-0.75 + i * 0.15) * Math.PI * 1.0 - Math.PI / 2 + 0.0; var a2 = a; c.beginPath(); c.moveTo(64 + Math.cos(a2) * 50, 64 + Math.sin(a2) * 50); c.lineTo(64 + Math.cos(a2) * 58, 64 + Math.sin(a2) * 58); c.stroke(); }
      c.fillStyle = '#222'; c.font = 'bold 15px Arial'; c.textAlign = 'center'; c.fillText(label, 64, 100); }
    var face = new THREE.Mesh(new THREE.CircleGeometry(0.15, 20), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) })); face.position.z = 0.012; g.add(face);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.02, 6, 20), M.brass); g.add(ring);
    var needle = new THREE.Group(); needle.position.z = 0.02; g.add(needle); box(0.012, 0.12, 0.004, M.black, 0, 0.05, 0, needle);
    TR.gauges = TR.gauges || {}; TR.gauges[key] = needle; return g;
  }
  // ── The locomotive ────────────────────────────────────────────────
  function trBuildLoco() {
    var M = trMats(), P = pkMats(), g = trDyn(), u = { kind: 'loco', g: g, len: 8.4, d: 4.2, bf: 2.6, br: 2.6, wheels: [], drivers: [], rods: [] };
    g.userData.unit = u;
    var rim = M.black, red = pkPaint(0xb3262b, 0.45, 0.3);
    // frame, running boards, buffer beams
    pkBevelBox(8.4, 0.28, 1.7, M.black, 0, 1.06, 0, g, 0.03); pkBevelBox(0.3, 0.5, 2.2, M.red, 4.2, 1.1, 0, g, 0.03); pkBevelBox(0.3, 0.5, 2.2, M.red, -4.2, 1.1, 0, g, 0.03);
    [-0.7, 0.7].forEach(function (z) { var b = pkRoundCyl(0.12, 0.3, M.iron, 4.45, 1.1, z, g, 10); b.rotation.z = Math.PI / 2; var d = pkRoundCyl(0.2, 0.05, M.iron, 4.62, 1.1, z, g, 12); d.rotation.z = Math.PI / 2; });
    [-1, 1].forEach(function (s) { pkBevelBox(5.0, 0.07, 0.42, M.black, 1.7, 1.55, s * 0.98, g, 0.02); box(4.9, 0.03, 0.04, M.brass, 1.7, 1.6, s * 1.18, g); });
    // the boiler, with brass bands, and the smokebox
    var boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 4.3, 24), M.green); boiler.rotation.z = Math.PI / 2; boiler.position.set(0.75, 2.0, 0); boiler.castShadow = true; g.add(boiler);
    var sbx = new THREE.Mesh(new THREE.CylinderGeometry(0.77, 0.77, 1.1, 24), M.black); sbx.rotation.z = Math.PI / 2; sbx.position.set(3.45, 2.0, 0); sbx.castShadow = true; g.add(sbx);
    var door = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.06, 20), M.black); door.rotation.z = Math.PI / 2; door.position.set(4.02, 2.0, 0); g.add(door);
    var dring = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.03, 6, 22), M.brass); dring.rotation.y = Math.PI / 2; dring.position.set(4.04, 2.0, 0); g.add(dring);
    sphere(0.07, M.brass, 4.08, 2.0, 0, g);
    [-0.4, 1.0, 2.2].forEach(function (bx) { var t = new THREE.Mesh(new THREE.TorusGeometry(0.745, 0.035, 8, 28), M.brass); t.rotation.y = Math.PI / 2; t.position.set(bx, 2.0, 0); g.add(t); });
    // chimney, domes, whistle, safety valves, headlamp
    var ch = pkLathe([[0.01, 0], [0.19, 0], [0.2, 0.45], [0.33, 0.85], [0.42, 1.0], [0.3, 1.02], [0.02, 1.0]], M.black, 3.55, 2.72, 0, g, 16); u.chimney = new THREE.Vector3(3.55, 3.8, 0);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 6, 20), M.brass); ring.rotation.x = Math.PI / 2; ring.position.set(3.55, 3.72, 0); g.add(ring);
    pkLathe([[0.01, 0], [0.5, 0], [0.5, 0.2], [0.32, 0.55], [0.2, 0.62], [0.01, 0.64]], M.green, 1.8, 2.72, 0, g, 18); pkRoundCyl(0.16, 0.2, M.brass, 1.8, 3.4, 0, g, 12); sphere(0.17, M.brass, 1.8, 3.5, 0, g);
    pkLathe([[0.01, 0], [0.34, 0], [0.34, 0.18], [0.2, 0.42], [0.01, 0.46]], M.green, 0.5, 2.72, 0, g, 14); pkRoundCyl(0.1, 0.18, M.brass, 0.5, 3.2, 0, g, 10);
    [-0.12, 0.12].forEach(function (z) { pkRoundCyl(0.04, 0.34, M.brass, -0.45, 2.88, z, g, 8); });
    var wh = pkLathe([[0.01, 0], [0.08, 0], [0.09, 0.22], [0.14, 0.34], [0.09, 0.36], [0.01, 0.36]], M.brass, -0.8, 2.72, 0, g, 10); u.whistle = new THREE.Vector3(-0.8, 3.1, 0);
    var hl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 14), M.black); hl.rotation.z = Math.PI / 2; hl.position.set(3.9, 3.04, 0); g.add(hl);
    u.lamp = new THREE.Mesh(new THREE.CircleGeometry(0.17, 14), new THREE.MeshBasicMaterial({ color: 0x55503a })); u.lamp.rotation.y = Math.PI / 2; u.lamp.position.set(4.06, 3.04, 0); u.lamp.userData.noBake = true; g.add(u.lamp);
    // the pilot: a slatted cow-catcher
    for (var i = -3; i <= 3; i++) { var sl = box(0.9, 0.04, 0.07, M.iron, 4.55, 0.55 + 0.0, i * 0.28, g); sl.rotation.z = 0.6; sl.position.y = 0.55 + 0.02; }
    // cylinders, cross-heads and the valve gear's silhouette
    [-1, 1].forEach(function (s) {
      var cy = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 1.0, 14), M.black); cy.rotation.z = Math.PI / 2; cy.position.set(2.7, 1.0, s * 1.05); g.add(cy);
      var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 12), M.brass); cap.rotation.z = Math.PI / 2; cap.position.set(3.23, 1.0, s * 1.05); g.add(cap);
      var rod = box(1, 0.1, 0.07, M.iron, 0, 0, s * 1.2, g), cross = box(0.22, 0.2, 0.1, M.iron, 0, 1.0, s * 1.12, g);
      var coup = box(1, 0.1, 0.06, M.iron, 0, 0, s * 1.24, g), pr = box(0.9, 0.05, 0.05, M.iron, 0, 1.0, s * 1.05, g);
      u.rods.push({ s: s, rod: rod, cross: cross, coup: coup, pr: pr });
    });
    // wheels: two big drivers each side, a leading truck of four small ones
    [-1, 1].forEach(function (s) {
      [-0.2, 1.4].forEach(function (x) { var w = trWheel(0.62, red, rim, g, x, 0.88, s * 0.82, 8); u.drivers.push({ w: w, x: x, s: s }); u.wheels.push({ w: w, r: 0.62 }); });
      [2.9, 3.7].forEach(function (x) { var w = trWheel(0.3, M.black, rim, g, x, 0.56, s * 0.8, 6); u.wheels.push({ w: w, r: 0.3 }); });
    });
    pkBevelBox(1.6, 0.14, 1.8, M.black, 3.3, 0.9, 0, g, 0.02);
    // the cab: green panels, brass trim, a cream roof, spectacle windows in front
    pkBevelBox(3.1, 0.14, 2.3, M.woodD, -2.65, 1.28, 0, g, 0.02);   // the footplate
    [-1, 1].forEach(function (s) {
      pkBevelBox(3.1, 1.0, 0.08, M.green, -2.65, 1.85, s * 1.1, g, 0.02); box(3.1, 0.05, 0.1, M.brass, -2.65, 2.38, s * 1.1, g);
      box(0.1, 1.1, 0.1, M.greenD, -4.15, 2.9, s * 1.1, g); box(0.1, 1.1, 0.1, M.greenD, -1.2, 2.9, s * 1.1, g); box(3.1, 0.07, 0.1, M.greenD, -2.65, 3.4, s * 1.1, g);
      pkBevelBox(0.06, 0.2, 0.5, M.black, -4.12, 1.0, s * 1.2, g, 0.01);
    });
    pkBevelBox(0.08, 2.2, 2.3, M.green, -1.12, 2.4, 0, g, 0.02);   // the front wall: the backhead stands against it
    [-0.55, 0.55].forEach(function (z) { var wn = new THREE.Mesh(new THREE.CircleGeometry(0.2, 18), M.glass); wn.rotation.y = -Math.PI / 2; wn.position.set(-1.07, 3.05, z); g.add(wn); var wr = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.025, 6, 18), M.brass); wr.rotation.y = Math.PI / 2; wr.position.set(-1.07, 3.05, z); g.add(wr); });
    pkBevelBox(3.6, 0.16, 2.6, M.cream, -2.6, 3.58, 0, g, 0.04); pkBevelBox(3.2, 0.1, 2.2, P.cream, -2.6, 3.7, 0, g, 0.03); box(3.62, 0.04, 0.05, M.brass, -2.6, 3.52, 1.3, g); box(3.62, 0.04, 0.05, M.brass, -2.6, 3.52, -1.3, g);
    var cl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), M.lampOn); cl.position.set(-2.6, 3.35, 0); g.add(cl);
    sign(['No. 1', 'LINDENBURG'], 1.2, 0.34, -2.65, 1.85, 1.15, 0, { w: 256, h: 96, bg: '#102a1c', fg: '#f3d36a' }, g); sign(['No. 1', 'LINDENBURG'], 1.2, 0.34, -2.65, 1.85, -1.15, Math.PI, { w: 256, h: 96, bg: '#102a1c', fg: '#f3d36a' }, g);
    sign(['LINDENBURG'], 1.5, 0.3, 1.0, 2.05, 0.77, 0, { w: 384, h: 80, bg: '#1d5b3b', fg: '#f3d36a', plate: false }, g); sign(['LINDENBURG'], 1.5, 0.3, 1.0, 2.05, -0.77, Math.PI, { w: 384, h: 80, bg: '#1d5b3b', fg: '#f3d36a', plate: false }, g);
    // the backhead: dials, levers, switches (their hit boxes are live while the driver is in the cab)
    trBuildCabControls(g, u);
    // the doorway: climb up into the cab
    [-1, 1].forEach(function (s) { box(0.7, 0.06, 0.5, M.iron, -2.9, 0.75, s * 1.35, g); box(0.7, 0.06, 0.5, M.iron, -2.9, 1.02, s * 1.25, g); });
    hitBox(1.2, 1.6, 1.0, -2.9, 1.9, 1.6, { prompt: function () { return trCanBoard() ? 'Climb into the cab' : ''; }, use: function () { trEnterCab(); } }, g);
    hitBox(1.2, 1.6, 1.0, -2.9, 1.9, -1.6, { prompt: function () { return trCanBoard() ? 'Climb into the cab' : ''; }, use: function () { trEnterCab(); } }, g);
    TR.units.push(u); return u;
  }
  // the controls: each is { group that moves, hit box }. Levers swing about z; the gas and the brake sit on the left, the switches and
  // the horn on the right. The same actions are on the keyboard (see part 43).
  function trBuildCabControls(g, u) {
    var M = trMats(), X = -1.2;
    pkBevelBox(0.1, 1.0, 1.9, pkPaint(0x1d2a24, 0.5, 0.4), X - 0.02, 2.0, 0, g, 0.02);
    trGauge(g, X - 0.09, 2.45, -0.62, -Math.PI / 2, 'STEAM', 'press'); trGauge(g, X - 0.09, 2.45, 0.0, -Math.PI / 2, 'km/h', 'speed'); trGauge(g, X - 0.09, 2.45, 0.62, -Math.PI / 2, 'COAL', 'fuel');
    // the water gauge glass
    var gl = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), M.glass); gl.position.set(X - 0.1, 2.0, 0.85); g.add(gl);
    var wl = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.5, 0.02), new THREE.MeshBasicMaterial({ color: 0x4aa8ff })); wl.position.set(X - 0.1, 1.76, 0.85); wl.geometry.translate(0, 0.25, 0); wl.position.y = 1.75; g.add(wl); TR.waterGlass = wl;
    function lever(key, z, y, col, label, prompt, use) {
      var pv = new THREE.Group(); pv.position.set(X - 0.08, y, z); g.add(pv);
      pkBevelBox(0.14, 0.06, 0.3, M.brass, 0, 0, 0, pv, 0.01);
      var st = new THREE.Group(); pv.add(st); pkRod(0, 0, 0, 0, 0.62, 0, 0.022, M.iron, st, 6); sphere(0.055, col, 0, 0.66, 0, st);
      sign([label], 0.3, 0.07, X - 0.075, y - 0.16, z, -Math.PI / 2, { w: 192, h: 48, bg: '#1b232c', fg: '#f5f2e8' }, g);
      hitBox(0.5, 0.9, 0.35, X - 0.3, y + 0.35, z, { prompt: function () { return TR.t && TR.t.driving ? prompt() : ''; }, use: use }, g);
      u[key] = st; return st;
    }
    lever('gasLever', -0.62, 1.45, M.red, 'GAS', function () { return 'Gas: ' + Math.round(TR.t.throttle * 100) + '% (W / S)'; }, function () { TR.t.throttle = TR.t.throttle >= 0.99 ? 0 : Math.min(1, TR.t.throttle + 0.25); });
    lever('brakeLever', -0.15, 1.45, pkPaint(0x2a5fd0, 0.4, 0.3), 'BRAKE', function () { return 'Brake: ' + Math.round(TR.t.brake * 100) + '% (Space)'; }, function () { TR.t.brake = TR.t.brake >= 0.99 ? 0 : Math.min(1, TR.t.brake + 0.5); });
    lever('revLever', 0.3, 1.45, M.brass, 'REVERSER', function () { return 'Reverser: ' + (TR.t.dir > 0 ? 'FORWARD' : 'REVERSE') + ' (R)'; }, function () { trToggleDir(); });
    function sw(key, z, y, label, prompt, use) {
      var pv = new THREE.Group(); pv.position.set(X - 0.09, y, z); g.add(pv);
      pkRoundCyl(0.06, 0.04, M.brass, 0, 0, 0, pv, 12).rotation.z = Math.PI / 2;
      var lv = new THREE.Group(); pv.add(lv); pkRod(0, 0, 0, -0.0, 0.16, 0, 0.016, M.iron, lv, 6); sphere(0.03, M.red, 0, 0.17, 0, lv); u[key] = lv;
      sign([label], 0.26, 0.07, X - 0.075, y + 0.22, z, -Math.PI / 2, { w: 160, h: 48, bg: '#1b232c', fg: '#f5f2e8' }, g);
      var led = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), M.ledOff); led.position.set(-0.03, -0.13, 0); pv.add(led); led.userData.noBake = true; u[key + 'Led'] = led;
      hitBox(0.3, 0.4, 0.3, X - 0.28, y + 0.05, z, { prompt: function () { return TR.t && TR.t.driving ? prompt() : ''; }, use: use }, g);
    }
    sw('engSw', 0.62, 1.8, 'ENGINE', function () { return 'Engine ' + (TR.t.engine ? 'ON' : 'off') + ' (Y)'; }, function () { trToggleEngine(); });
    sw('doorSw', 0.9, 1.8, 'DOORS', function () { return 'Wagon doors ' + (TR.t.doorsOpen ? 'open' : 'shut') + ' (O)'; }, function () { trToggleDoors(); });
    // the horn button and the whistle pull
    var hb = pkRoundCyl(0.09, 0.06, M.red, X - 0.12, 1.6, 0.78, g, 14); hb.rotation.z = Math.PI / 2; u.hornBtn = hb; hb.userData.rest = hb.position.x;
    sign(['HORN'], 0.22, 0.07, X - 0.075, 1.78, 0.78, -Math.PI / 2, { w: 128, h: 48, bg: '#1b232c', fg: '#f5f2e8' }, g);
    hitBox(0.3, 0.3, 0.3, X - 0.3, 1.6, 0.78, { prompt: function () { return TR.t && TR.t.driving ? 'Horn (H - hold)' : ''; }, use: function () { trBlast('horn', 0.9); } }, g);
    var cord = new THREE.Group(); cord.position.set(-1.6, 3.55, 0.45); g.add(cord); u.cord = cord; pkRod(0, 0, 0, 0, -0.9, 0, 0.012, M.black, cord, 4); sphere(0.06, M.brass, 0, -0.95, 0, cord);
    hitBox(0.3, 0.5, 0.3, -1.6, 2.7, 0.45, { prompt: function () { return TR.t && TR.t.driving ? 'Steam whistle (F - hold)' : ''; }, use: function () { trBlast('whistle', 1.4); } }, g);
  }
  // ── The tender ────────────────────────────────────────────────────
  function trBuildTender() {
    var M = trMats(), g = trDyn(), u = { kind: 'tender', g: g, len: 4.0, d: 10.9, bf: 1.2, br: 1.2, wheels: [], rods: [], drivers: [] };
    pkBevelBox(4.0, 0.26, 1.8, M.black, 0, 1.0, 0, g, 0.03);
    pkBevelBox(3.8, 1.1, 1.9, M.green, 0, 1.7, 0, g, 0.03); box(3.8, 0.05, 1.95, M.brass, 0, 2.2, 0, g); box(3.9, 0.05, 1.95, M.brass, 0, 1.2, 0, g);
    pkBevelBox(2.4, 0.4, 1.5, M.black, -0.5, 2.4, 0, g, 0.03);
    for (var i = 0; i < 12; i++) sphere(0.28 + (i % 3) * 0.05, M.coal, -1.3 + (i % 5) * 0.55, 2.7 + (i % 2) * 0.12, ((i * 7) % 5 - 2) * 0.28, g);
    pkBevelBox(0.9, 0.5, 1.9, M.green, 1.4, 2.5, 0, g, 0.03);   // the water filler hatch
    sign(['LINDENBURG', 'RAILWAY'], 1.8, 0.5, 0, 1.7, 0.97, 0, { w: 384, h: 128, bg: '#102a1c', fg: '#f3d36a' }, g); sign(['LINDENBURG', 'RAILWAY'], 1.8, 0.5, 0, 1.7, -0.97, Math.PI, { w: 384, h: 128, bg: '#102a1c', fg: '#f3d36a' }, g);
    [-1, 1].forEach(function (s) { [-1.2, 1.2].forEach(function (x) { var w = trWheel(0.34, M.black, M.black, g, x, 0.6, s * 0.85, 6); u.wheels.push({ w: w, r: 0.34 }); }); });
    [-0.7, 0.7].forEach(function (z) { var b = pkRoundCyl(0.1, 0.3, M.iron, 2.2, 1.1, z, g, 10); b.rotation.z = Math.PI / 2; });
    box(0.7, 0.1, 0.1, M.iron, -2.25, 1.1, 0, g);
    TR.units.push(u); return u;
  }
  // ── A wagon: four seats, doors at the sides, a fairy-tale roof ────
  function trBuildWagon(k) {
    var M = trMats(), P = pkMats(), T = TR_WAGONS[k], g = trDyn(), u = { kind: 'wagon', g: g, idx: k, len: 4.6, d: 15.7 + 5.1 * k, bf: 1.5, br: 1.5, wheels: [], rods: [], drivers: [], doors: [], seats: [] };
    var body = pkPaint(T.body, 0.45, 0.2), trim = pkPaint(T.trim, 0.4, 0.4);
    pkBevelBox(4.6, 0.16, 2.3, M.black, 0, 0.86, 0, g, 0.02); pkBevelBox(4.5, 0.06, 2.2, M.wood, 0, 0.93, 0, g, 0.01);
    // the half walls, with a gap at the door, and the doors themselves
    [-1, 1].forEach(function (s) {
      [-1.4, 1.4].forEach(function (x) { pkBevelBox(1.8, 0.62, 0.08, body, x, 1.27, s * 1.12, g, 0.02); box(1.8, 0.05, 0.1, trim, x, 1.6, s * 1.12, g); });
      sign([T.n], 1.6, 0.2, -1.4, 1.27, s * 1.165, s > 0 ? 0 : Math.PI, { w: 384, h: 48, bg: '#' + ('000000' + T.body.toString(16)).slice(-6), fg: '#' + ('000000' + T.trim.toString(16)).slice(-6), plate: false }, g);
      [-1, 1].forEach(function (h) {
        var pv = new THREE.Group(); pv.position.set(h * 0.5, 1.27, s * 1.12); dyn_add(g, pv);
        pkBevelBox(0.5, 0.62, 0.05, body, -h * 0.25, 0, 0, pv, 0.01); box(0.5, 0.05, 0.07, trim, -h * 0.25, 0.33, 0, pv); sphere(0.03, M.brass, -h * 0.4, 0.05, s * 0.04, pv);
        u.doors.push({ pv: pv, side: s, h: h });
      });
    });
    // corner posts, roof beams and lanterns
    [[-2.2, -1.1], [2.2, -1.1], [-2.2, 1.1], [2.2, 1.1]].forEach(function (p) { pkRoundCyl(0.06, 1.6, trim, p[0], 1.75, p[1], g, 8); sphere(0.1, M.brass, p[0], 2.58, p[1], g); });
    [-1.1, 1.1].forEach(function (z) { [-0.7, 0.7].forEach(function (x) { pkRoundCyl(0.04, 1.6, trim, x, 1.75, z * 0.98, g, 6); }); });
    pkBevelBox(4.9, 0.12, 2.7, body, 0, 2.56, 0, g, 0.03); box(4.95, 0.06, 2.75, trim, 0, 2.5, 0, g);
    for (var sc = -2.3; sc <= 2.3; sc += 0.46) { var s1 = trCone(0.16, 0.26, trim, sc, 2.38, 1.34, g, 4); s1.rotation.x = Math.PI; var s2 = trCone(0.16, 0.26, trim, sc, 2.38, -1.34, g, 4); s2.rotation.x = Math.PI; }
    var lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), M.lampOn); lamp.position.set(0, 2.38, 0); lamp.userData.noBake = true; g.add(lamp); u.lamp = lamp;
    // two benches, face to face, two seats each: the aisle between them is the door
    [-1, 1].forEach(function (b) {
      var bx = b * 1.6, cush = pkPaint(0x7a1f2a, 0.8, 0.05);
      pkBevelBox(0.62, 0.14, 2.0, cush, bx, 1.2, 0, g, 0.04); pkBevelBox(0.14, 0.7, 2.0, cush, bx + b * 0.34, 1.6, 0, g, 0.05); box(0.6, 0.22, 2.0, M.woodD, bx, 1.04, 0, g);
      box(0.05, 0.06, 0.04, trim, bx, 1.21, 0, g);
      [-0.5, 0.5].forEach(function (zz) { var seat = { x: bx - b * 0.05, y: 1.2, z: zz, face: b > 0 ? Math.PI : 0, taken: false }; u.seats.push(seat);
        hitBox(0.8, 0.9, 0.9, bx, 1.5, zz, { prompt: function () { return trCanSit(u) ? 'Sit down' : (trSeatedIn() ? '' : (TR.t.v < 0.3 ? 'The doors are shut' : '')); }, use: function () { trSit(u, seat); } }, g); });
    });
    trWagonRoof(g, T.roof, k, u);
    // wheels and couplings
    [-1, 1].forEach(function (s) { [-1.5, -0.6, 0.6, 1.5].forEach(function (x) { var w = trWheel(0.32, M.black, M.black, g, x, 0.58, s * 0.72, 6); u.wheels.push({ w: w, r: 0.32 }); }); });
    [-1, 1].forEach(function (e) { [-0.6, 0.6].forEach(function (z) { var bf = pkRoundCyl(0.09, 0.2, M.iron, e * 2.4, 0.9, z, g, 8); bf.rotation.z = Math.PI / 2; pkRoundCyl(0.16, 0.04, M.iron, e * 2.5, 0.9, z, g, 10).rotation.z = Math.PI / 2; }); });
    box(0.6, 0.08, 0.1, M.iron, -2.55, 0.9, 0, g);
    sign([String(k + 1)], 0.26, 0.26, 0, 2.05, 1.38, 0, { w: 96, h: 96, bg: '#1b232c', fg: '#f3d36a' }, g); sign([String(k + 1)], 0.26, 0.26, 0, 2.05, -1.38, Math.PI, { w: 96, h: 96, bg: '#1b232c', fg: '#f3d36a' }, g);
    TR.units.push(u); return u;
  }
  function dyn_add(g, o) { g.add(o); return o; }
  function trWagonRoof(g, kind, k, u) {
    var M = trMats(), P = pkMats(), gold = M.gold, y = 2.64;
    if (kind === 'spires') {
      trCone(1.2, 2.4, pkPaint(0x6a4fa6, 0.4, 0.3), 0, y + 1.2, 0, g, 12); sphere(0.1, gold, 0, y + 2.45, 0, g);
      [[-2.1, -1.0], [2.1, -1.0], [-2.1, 1.0], [2.1, 1.0]].forEach(function (p) { pkRoundCyl(0.2, 0.7, pkPaint(0xcdbbe8, 0.5, 0.2), p[0], y + 0.35, p[1], g, 10); trCone(0.28, 0.8, pkPaint(0x6a4fa6, 0.4, 0.3), p[0], y + 1.1, p[1], g, 10); sphere(0.05, gold, p[0], y + 1.55, p[1], g); });
      for (var r = 0; r < 12; r++) { var a = r / 12 * 6.283; sphere(0.07, pkPaint(0xe0508a, 0.6, 0.1), Math.cos(a) * 1.6, y + 0.1, Math.sin(a) * 1.15, g); }   // the briar roses
    } else if (kind === 'mushroom') {
      pkLathe([[0.01, 1.05], [0.5, 1.0], [1.2, 0.75], [1.9, 0.35], [2.4, 0.0], [2.3, -0.05], [1.4, 0.05], [0.01, 0.1]], pkPaint(0xc4262b, 0.5, 0.1), 0, y + 0.05, 0, g, 24);
      for (var d = 0; d < 10; d++) { var a2 = d * 2.4, rr = 0.5 + (d % 4) * 0.38, dh = 0.95 - rr * 0.37; var dt = sphere(0.19 - (d % 3) * 0.03, M.white, Math.cos(a2) * rr * 0.9, y + dh + 0.05, Math.sin(a2) * rr * 0.65, g); dt.scale.y = 0.35; }
    } else if (kind === 'gingerbread') {
      pkGableRoof(4.8, 2.6, 1.3, pkPaint(0x7a4a25, 0.8, 0), pkPaint(0x7a4a25, 0.8, 0), 0, y, 0, g, 0.25);
      for (var ic = -2.2; ic <= 2.2; ic += 0.55) { [-1, 1].forEach(function (sd) { var dr = sphere(0.14, M.white, ic, y + 0.2, sd * 1.45, g); dr.scale.set(1, 1.5, 1); dr.position.y = y + 0.05; }); }
      box(5.2, 0.1, 0.12, M.white, 0, y + 1.38, 0, g);
      [-1.5, 0, 1.5].forEach(function (gx) { sphere(0.17, pkPaint(0xe24a7a, 0.4, 0.1), gx, y + 1.5, 0, g); });
      var cane = pkStripes('#d83a34', '#f6f6f2'); [-2.3, 2.3].forEach(function (cx) { var c = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.3, 8), cane); c.position.set(cx, y + 0.65, 0); g.add(c); });
    } else if (kind === 'crown') {
      pkBevelBox(2.6, 0.45, 1.8, gold, 0, y + 0.3, 0, g, 0.06);
      for (var c2 = 0; c2 < 7; c2++) { var cx2 = -1.1 + c2 * 0.37; trCone(0.16, 0.7, gold, cx2, y + 0.85, 0.7, g, 4); trCone(0.16, 0.7, gold, cx2, y + 0.85, -0.7, g, 4); sphere(0.07, pkPaint(0xd94f4f, 0.3, 0.2), cx2, y + 1.22, 0.7, g); sphere(0.07, pkPaint(0xd94f4f, 0.3, 0.2), cx2, y + 1.22, -0.7, g); }
      var fg = pkPaint(0x58b84a, 0.5, 0.05); var fb = sphere(0.42, fg, 0, y + 0.95, 0, g); fb.scale.set(1.1, 0.8, 1);
      [-0.2, 0.2].forEach(function (ez) { sphere(0.13, fg, 0.28, y + 1.3, ez, g); sphere(0.05, pkPaint(0x111111, 0.3, 0), 0.38, y + 1.33, ez, g); }); box(0.3, 0.03, 0.2, pkPaint(0xc7352f, 0.5, 0), 0.4, y + 0.9, 0, g);
    } else if (kind === 'onion') {
      pkLathe([[0.01, 0], [0.9, 0], [1.25, 0.3], [1.2, 0.7], [0.8, 1.2], [0.35, 1.7], [0.1, 2.1], [0.02, 2.3]], gold, 0, y, 0, g, 24);
      [[-2.1, -1.0], [2.1, -1.0], [-2.1, 1.0], [2.1, 1.0]].forEach(function (p) { pkRoundCyl(0.12, 1.0, pkPaint(0xe9f7f5, 0.5, 0.1), p[0], y + 0.5, p[1], g, 8); pkLathe([[0.01, 0], [0.22, 0], [0.26, 0.2], [0.14, 0.45], [0.02, 0.6]], gold, p[0], y + 1.0, p[1], g, 12); });
      var cr = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 6, 14, Math.PI * 1.5), gold); cr.position.set(0, y + 2.45, 0); g.add(cr);
    } else if (kind === 'tree') {
      var cols = P.leaves; [[0, 1.0, 0, 1.2], [-1.0, 0.6, 0.4, 0.9], [1.0, 0.7, -0.3, 0.95], [0.4, 0.5, 0.8, 0.8], [-0.5, 0.55, -0.8, 0.85], [1.5, 0.45, 0.6, 0.7], [-1.6, 0.45, -0.3, 0.75]].forEach(function (b, i) { sphere(b[3], cols[i % cols.length], b[0], y + b[1], b[2], g); });
      var ow = sphere(0.22, pkPaint(0x8a6a44, 0.9, 0), 0.3, y + 2.2, 0.1, g); ow.scale.y = 1.3; sphere(0.06, M.white, 0.45, y + 2.28, 0.0, g); sphere(0.06, M.white, 0.45, y + 2.28, 0.22, g); sphere(0.025, M.black, 0.5, y + 2.28, 0.0, g); sphere(0.025, M.black, 0.5, y + 2.28, 0.22, g);
    } else if (kind === 'tent') {
      var st = pkStripes('#d94f4f', '#f6f6f2'); var tent = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.8, 12), st); tent.position.set(0, y + 0.9, 0); tent.scale.set(1.25, 1, 0.8); tent.castShadow = true; g.add(tent);
      pkRod(0, y + 1.7, 0, 0, y + 2.6, 0, 0.025, M.iron, g, 6); var fl = box(0.7, 0.4, 0.02, pkPaint(0xf3d36a, 0.6, 0), 0.35, y + 2.45, 0, g); u.flag = fl; sphere(0.06, gold, 0, y + 2.62, 0, g);
      var bl = []; for (var q = 0; q <= 8; q++) { var tq = q / 8; bl.push([-2.2 + 4.4 * tq, y + 0.05 - Math.sin(tq * Math.PI) * 0.18, 1.45]); } pkBulbs(bl, M.bulbWarm || pkMats().bulbWarm, 0.06, g);
    } else {   // moon
      var moon = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.16, 8, 28, Math.PI * 1.45), gold); moon.position.set(0, y + 1.2, 0); moon.rotation.z = 0.8; moon.rotation.y = Math.PI / 2; moon.castShadow = true; g.add(moon);
      [[-1.6, 0.6, 0.7], [1.4, 0.5, -0.8], [0.3, 1.0, 0.9], [-0.8, 0.9, -0.9], [1.9, 0.4, 0.5], [-2.0, 0.4, -0.4]].forEach(function (p, i) { var s2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.1 + (i % 3) * 0.03), gold); s2.position.set(p[0], y + p[1], p[2]); g.add(s2); });
    }
  }
  // ── Putting the whole train on the line ───────────────────────────
  function trBuildTrain() {
    TR.units = []; trBuildLoco(); trBuildTender(); for (var k = 0; k < 8; k++) trBuildWagon(k);
    var last = TR.units[TR.units.length - 1]; TR.len = last.d + last.len / 2;
  }
  var _trA = {}, _trB = {};
  function trPlaceUnits() {
    var t = TR.t, mode = t.mode;
    for (var i = 0; i < TR.units.length; i++) {
      var u = TR.units[i], pf = trPos(t.s - (u.d - u.bf), mode, _trA), fx = pf.x, fz = pf.z, pr = trPos(t.s - (u.d + u.br), mode, _trB);
      u.g.position.set((fx + pr.x) / 2, 0, (fz + pr.z) / 2); u.g.rotation.y = Math.atan2(-(fz - pr.z), fx - pr.x);
    }
  }
