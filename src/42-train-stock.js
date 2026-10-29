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
  // ── The locomotive ────────────────────────────────────────────────
  // A wheel for the engine and its tender: tyre, open spokes, a brass hub and, on the drivers (o.pin set), a counterweight
  // and a crank pin. o.pin is the crank angle in the wheel's own frame - the valve gear in the update follows it.
  function trLocoWheel(r, mat, rimMat, parent, x, y, z, spokes, o) {
    o = o || {}; var M = trMats(), s = o.s || 1, n = spokes || 5, w = new THREE.Group(); w.position.set(x, y, z); parent.add(w);
    var tire = new THREE.Mesh(new THREE.TorusGeometry(r - 0.05, 0.055, 8, 32), rimMat); tire.castShadow = true; w.add(tire);
    var fl = new THREE.Mesh(new THREE.TorusGeometry(r - 0.075, 0.03, 6, 32), rimMat); fl.position.z = -s * 0.05; w.add(fl);
    var inner = new THREE.Mesh(new THREE.TorusGeometry(r * 0.62, 0.03, 6, 24), mat); w.add(inner);
    for (var i = 0; i < n; i++) { var sp = box(0.06, (r - 0.1) * 2, 0.045, mat, 0, 0, 0, w); sp.rotation.z = i * Math.PI / n; }
    var boss = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.2, r * 0.2, 0.1, 14), rimMat); boss.rotation.x = Math.PI / 2; w.add(boss);
    var hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.12, r * 0.12, 0.15, 12), M.brass); hub.rotation.x = Math.PI / 2; w.add(hub);
    if (o.pin !== undefined) {
      var ca = Math.cos(o.pin), sa = Math.sin(o.pin), sh = new THREE.Shape();
      sh.absarc(0, 0, r - 0.1, o.pin + Math.PI - 0.95, o.pin + Math.PI + 0.95, false); sh.absarc(0, 0, r * 0.22, o.pin + Math.PI + 0.95, o.pin + Math.PI - 0.95, true);
      var cw = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.07, bevelEnabled: false, curveSegments: 10 }), o.cwMat || rimMat); cw.position.z = -0.035; cw.castShadow = true; w.add(cw);
      var pin = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.42, 10), M.brass); pin.rotation.x = Math.PI / 2; pin.position.set(ca * 0.22, sa * 0.22, s * 0.2); w.add(pin);
      sphere(0.075, M.brass, ca * 0.22, sa * 0.22, s * 0.42, w);
    }
    return w;
  }
  var TR_CAB_SEAT = 1.99;   // the top of the driver's cushion, above the rail
  function trBuildLoco() {
    var M = trMats(), P = pkMats(), g = trDyn(), u = { kind: 'loco', g: g, len: 8.4, d: 4.2, bf: 2.6, br: 2.6, wheels: [], drivers: [], rods: [] };
    g.userData.unit = u;
    var rim = M.black, red = pkPaint(0xb3262b, 0.45, 0.3), steel = std({ color: 0xaab2b8, roughness: 0.3, metalness: 0.55 }), gold = M.gold, brass = M.brass;
    function rAt(x) { return 0.76 - (x + 0.9) / 3.9 * 0.04; }   // the boiler tapers a touch toward the smokebox
    // frame, buffer beams (gilded, with the engine's number), buffers and a centre coupler
    pkBevelBox(8.4, 0.28, 1.7, M.black, 0, 1.06, 0, g, 0.03);
    [4.2, -4.2].forEach(function (bx) { var f = bx > 0 ? 1 : -1; pkBevelBox(0.3, 0.5, 2.2, M.red, bx, 1.1, 0, g, 0.03); box(0.02, 0.035, 2.0, gold, bx + f * 0.155, 1.3, 0, g); box(0.02, 0.035, 2.0, gold, bx + f * 0.155, 0.92, 0, g); });
    sign(['1'], 0.42, 0.42, 4.37, 1.12, 0, Math.PI / 2, { w: 128, h: 128, bg: '#102a1c', fg: '#f3d36a' }, g);
    [-0.7, 0.7].forEach(function (z) {
      var b = pkRoundCyl(0.12, 0.3, M.iron, 4.45, 1.1, z, g, 10); b.rotation.z = Math.PI / 2; var d = pkRoundCyl(0.2, 0.05, steel, 4.62, 1.1, z, g, 14); d.rotation.z = Math.PI / 2;
      var c = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.025, 6, 14), brass); c.rotation.y = Math.PI / 2; c.position.set(4.4, 1.1, z); g.add(c);
    });
    box(0.5, 0.1, 0.1, M.iron, 4.6, 1.0, 0, g); sphere(0.06, brass, 4.82, 1.0, 0, g);
    // running boards with a brass edge, handrails along the boiler
    [-1, 1].forEach(function (s) { pkBevelBox(5.0, 0.07, 0.42, M.black, 1.7, 1.55, s * 0.98, g, 0.02); box(4.9, 0.03, 0.04, brass, 1.7, 1.6, s * 1.18, g); box(4.9, 0.02, 0.012, gold, 1.7, 1.575, s * 1.2, g); });
    // the boiler (tapered), the smokebox and its dished, riveted door
    var boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.72, 3.9, 28), M.green); boiler.rotation.z = Math.PI / 2; boiler.position.set(1.05, 2.0, 0); boiler.castShadow = true; g.add(boiler);
    var sbx = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 1.1, 28), M.black); sbx.rotation.z = Math.PI / 2; sbx.position.set(3.5, 2.0, 0); sbx.castShadow = true; g.add(sbx);
    var door = pkLathe([[0.01, 0.1], [0.3, 0.085], [0.52, 0.04], [0.66, 0.0]], M.black, 4.04, 2.0, 0, g, 28); door.rotation.z = -Math.PI / 2;
    var dring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.04, 6, 30), brass); dring.rotation.y = Math.PI / 2; dring.position.set(4.05, 2.0, 0); g.add(dring);
    for (var rv = 0; rv < 16; rv++) { var ra = rv / 16 * Math.PI * 2; sphere(0.022, brass, 4.065, 2.0 + Math.cos(ra) * 0.58, Math.sin(ra) * 0.58, g); }
    box(0.03, 0.06, 1.1, M.iron, 4.14, 2.22, 0, g); box(0.03, 0.06, 1.1, M.iron, 4.14, 1.78, 0, g);
    sphere(0.08, brass, 4.17, 2.0, 0, g); var hw = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 6, 16), brass); hw.rotation.y = Math.PI / 2; hw.position.set(4.19, 2.0, 0); g.add(hw);
    // brass bands with gold pinstripes
    [-0.5, 1.95, 2.9].forEach(function (bx) {
      var r = rAt(bx), t = new THREE.Mesh(new THREE.TorusGeometry(r + 0.01, 0.035, 8, 32), brass); t.rotation.y = Math.PI / 2; t.position.set(bx, 2.0, 0); g.add(t);
      [-0.08, 0.08].forEach(function (dx) { var t2 = new THREE.Mesh(new THREE.TorusGeometry(r + 0.005, 0.012, 6, 32), gold); t2.rotation.y = Math.PI / 2; t2.position.set(bx + dx, 2.0, 0); g.add(t2); });
    });
    // boiler handrails on stanchions, with a brass knob at each end
    [-1, 1].forEach(function (s) {
      pkRod(-0.8, 2.4, s * 0.72, 3.3, 2.4, s * 0.72, 0.018, brass, g, 6); sphere(0.03, brass, -0.8, 2.4, s * 0.72, g); sphere(0.03, brass, 3.3, 2.4, s * 0.72, g);
      [-0.3, 0.9, 2.1, 3.0].forEach(function (hx) { pkRod(hx, 2.4, s * 0.62, hx, 2.4, s * 0.72, 0.016, brass, g, 6); });
    });
    // diamond stack with brass collars, then the sand dome, steam dome, bell, safety valves and whistle
    pkLathe([[0.01, 0], [0.34, 0], [0.29, 0.07], [0.16, 0.26], [0.15, 0.42], [0.36, 0.68], [0.47, 0.82], [0.4, 0.95], [0.27, 1.03], [0.01, 1.03]], M.black, 3.4, 2.68, 0, g, 20); u.chimney = new THREE.Vector3(3.4, 3.8, 0);
    [[0.34, 0.16], [0.82, 0.47]].forEach(function (c) { var ring = new THREE.Mesh(new THREE.TorusGeometry(c[1], 0.028, 6, 24), brass); ring.rotation.x = Math.PI / 2; ring.position.set(3.4, 2.68 + c[0] + 0.0, 0); g.add(ring); });
    pkLathe([[0.01, 0], [0.4, 0], [0.4, 0.1], [0.3, 0.42], [0.2, 0.52], [0.01, 0.56]], M.green, 2.35, 2.7, 0, g, 18); pkRoundCyl(0.12, 0.14, brass, 2.35, 3.3, 0, g, 12); sphere(0.07, brass, 2.35, 3.4, 0, g);
    pkLathe([[0.01, 0], [0.5, 0], [0.5, 0.1], [0.42, 0.3], [0.4, 0.34], [0.01, 0.34]], M.green, 1.0, 2.68, 0, g, 20);
    pkLathe([[0.01, 0], [0.4, 0], [0.4, 0.04], [0.32, 0.34], [0.14, 0.46], [0.01, 0.5]], brass, 1.0, 3.0, 0, g, 20); sphere(0.06, brass, 1.0, 3.53, 0, g);
    pkLathe([[0.2, 0], [0.18, 0.08], [0.12, 0.25], [0.06, 0.32], [0.01, 0.34]], brass, 1.7, 2.83, 0, g, 14);
    [-1, 1].forEach(function (s) { box(0.06, 0.44, 0.06, M.iron, 1.7 + s * 0.24, 2.98, 0, g); }); box(0.54, 0.05, 0.05, M.iron, 1.7, 3.2, 0, g);
    [-0.14, 0.14].forEach(function (z) { pkLathe([[0.01, 0], [0.07, 0], [0.05, 0.1], [0.07, 0.2], [0.03, 0.3], [0.01, 0.32]], brass, -0.4, 2.74, z, g, 8); });
    pkLathe([[0.01, 0], [0.08, 0], [0.09, 0.22], [0.14, 0.34], [0.09, 0.36], [0.01, 0.36]], brass, -0.8, 2.72, 0, g, 10); u.whistle = new THREE.Vector3(-0.8, 3.1, 0);
    // the headlamp: a black drum with a brass bezel on a saddle, a little vent on top
    pkBevelBox(0.36, 0.1, 0.3, M.black, 3.96, 2.78, 0, g, 0.02);
    var hl = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.42, 16), M.black); hl.rotation.z = Math.PI / 2; hl.position.set(3.96, 3.04, 0); hl.castShadow = true; g.add(hl);
    var hb = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 6, 20), brass); hb.rotation.y = Math.PI / 2; hb.position.set(4.17, 3.04, 0); g.add(hb);
    pkRoundCyl(0.06, 0.1, brass, 3.9, 3.3, 0, g, 8); sphere(0.06, brass, 3.9, 3.37, 0, g);
    u.lamp = new THREE.Mesh(new THREE.CircleGeometry(0.19, 16), new THREE.MeshBasicMaterial({ color: 0x55503a })); u.lamp.rotation.y = Math.PI / 2; u.lamp.position.set(4.175, 3.04, 0); u.lamp.userData.noBake = true; g.add(u.lamp);
    // the pilot: a V of iron slats, leaning forward
    var PL = Math.sqrt(0.85 * 0.85 + 1.0 * 1.0), pang = Math.atan2(1.0, 0.85);
    [-1, 1].forEach(function (s) {
      var wing = new THREE.Group(); wing.position.set(4.4, 1.05, s * 1.0); wing.rotation.y = s * pang; g.add(wing);
      var sl = new THREE.Group(); sl.rotation.z = -0.22; wing.add(sl);
      box(PL, 0.1, 0.1, M.iron, PL / 2, 0, 0, sl); box(PL, 0.08, 0.08, M.iron, PL / 2, -0.3, 0, sl);
      for (var i = 1; i < 14; i++) box(0.06, 0.3, 0.06, M.iron, i * PL / 14, -0.15, 0, sl);
      box(0.1, 0.4, 0.14, M.iron, 0.04, -0.15, 0, sl);
    });
    sphere(0.09, M.iron, 5.27, 0.6, 0, g); pkRod(4.4, 0.95, 0, 5.2, 0.62, 0, 0.045, M.iron, g, 6);
    // cylinders (brass-banded, with steam chests and steam pipes), guide bars, and the valve gear's moving parts
    [-1, 1].forEach(function (s) {
      var cy = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.8, 16), M.black); cy.rotation.z = Math.PI / 2; cy.position.set(3.6, 1.0, s * 1.05); cy.castShadow = true; g.add(cy);
      [3.24, 3.96].forEach(function (bx) { var cb = new THREE.Mesh(new THREE.TorusGeometry(0.255, 0.03, 6, 20), brass); cb.rotation.y = Math.PI / 2; cb.position.set(bx, 1.0, s * 1.05); g.add(cb); });
      var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.06, 14), brass); cap.rotation.z = Math.PI / 2; cap.position.set(4.02, 1.0, s * 1.05); g.add(cap); sphere(0.05, brass, 4.07, 1.0, s * 1.05, g);
      pkBevelBox(0.9, 0.28, 0.34, M.black, 3.6, 1.34, s * 1.0, g, 0.03); box(0.04, 0.3, 0.36, brass, 3.18, 1.34, s * 1.0, g); box(0.04, 0.3, 0.36, brass, 4.02, 1.34, s * 1.0, g);
      pkRod(3.4, 1.45, s * 0.95, 3.4, 1.8, s * 0.62, 0.05, M.black, g, 8);
      box(1.05, 0.04, 0.08, steel, 2.68, 1.13, s * 1.12, g); box(1.05, 0.04, 0.08, steel, 2.68, 0.87, s * 1.12, g); box(0.1, 0.4, 0.1, M.iron, 2.15, 1.0, s * 1.12, g);
      var rod = box(1, 0.1, 0.07, steel, 0, 0, s * 1.2, g), cross = box(0.22, 0.2, 0.1, steel, 0, 1.0, s * 1.12, g);
      var coup = box(1, 0.1, 0.06, steel, 0, 0, s * 1.24, g), pr = box(0.9, 0.05, 0.05, steel, 0, 1.0, s * 1.05, g);
      u.rods.push({ s: s, rod: rod, cross: cross, coup: coup, pr: pr });
    });
    // wheels: two big red drivers each side (counterweighted, crank-pinned), a leading truck of four small ones
    [-1, 1].forEach(function (s) {
      var pin = s > 0 ? 0 : Math.PI / 2;
      [-0.2, 1.4].forEach(function (x) { var w = trLocoWheel(0.62, red, rim, g, x, 0.88, s * 0.82, 5, { s: s, pin: pin, cwMat: M.black }); u.drivers.push({ w: w, x: x, s: s }); u.wheels.push({ w: w, r: 0.62 }); });
      [2.9, 3.7].forEach(function (x) { var w = trLocoWheel(0.3, M.black, rim, g, x, 0.56, s * 0.8, 6, { s: s }); u.wheels.push({ w: w, r: 0.3 }); });
    });
    pkBevelBox(1.6, 0.14, 1.5, M.black, 3.3, 0.9, 0, g, 0.02);
    
    // the cab: green panels, brass trim, a cream roof, spectacle windows in front
    pkBevelBox(3.1, 0.14, 2.3, M.woodD, -2.65, 1.28, 0, g, 0.02);   // the footplate
    [-1, 1].forEach(function (s) {
      // Taller side panel carries the cab hardware farther up toward the window line.
      pkBevelBox(3.1, 1.2, 0.08, M.green, -2.65, 1.95, s * 1.1, g, 0.02); box(3.1, 0.05, 0.1, M.brass, -2.65, 2.58, s * 1.1, g);
      box(0.1, 1.1, 0.1, M.greenD, -4.15, 2.9, s * 1.1, g); box(0.1, 1.1, 0.1, M.greenD, -1.2, 2.9, s * 1.1, g); box(3.1, 0.07, 0.1, M.greenD, -2.65, 3.4, s * 1.1, g);
      pkBevelBox(0.06, 0.2, 0.5, M.black, -4.12, 1.0, s * 1.2, g, 0.01);
    });
    // Build the front wall around two openings so the portholes are clear from inside.
    pkBevelBox(0.08, 1.1, 2.3, M.green, -1.12, 1.85, 0, g, 0.02); // below windows
    pkBevelBox(0.08, 0.12, 2.3, M.green, -1.12, 3.38, 0, g, 0.02); // above windows
    pkBevelBox(0.08, 0.94, 0.12, M.green, -1.12, 2.85, 0, g, 0.02); // slim centre mullion
    pkBevelBox(0.08, 0.94, 0.16, M.green, -1.12, 2.85, -1.07, g, 0.02); // outer edges
    pkBevelBox(0.08, 0.94, 0.16, M.green, -1.12, 2.85, 1.07, g, 0.02);
    // The boiler ends at x=-0.9, leaving a visible void before the cab wall at x=-1.12.
    // A short, slightly wider firebox jacket bridges that gap and visually seats the boiler into the cab.
    pkBevelBox(0.48, 1.18, 1.48, M.greenD, -0.95, 2.0, 0, g, 0.12);
    pkBevelBox(0.12, 1.08, 1.34, M.green, -1.17, 2.0, 0, g, 0.08);
    [-0.62, 0.62].forEach(function (z) {
      var fbBand = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.025, 6, 24), brass);
      fbBand.rotation.y = Math.PI / 2; fbBand.position.set(-0.78, 2.0, z * 0.12); g.add(fbBand);
    });
    
    // Roof spans exactly between the rear posts and front wall; it should read as a seated cab ceiling, not an overhang.
    pkBevelBox(3.1, 0.16, 2.6, M.greenD, -2.65, 3.58, 0, g, 0.04); pkBevelBox(2.75, 0.1, 2.2, M.green, -2.65, 3.7, 0, g, 0.03); box(3.12, 0.04, 0.05, M.brass, -2.65, 3.52, 1.3, g); box(3.12, 0.04, 0.05, M.brass, -2.65, 3.52, -1.3, g);
    var cl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), M.lampOn); cl.position.set(-2.6, 3.35, 0); g.add(cl);
    sign(['No. 1', 'LINDENBURG'], 1.2, 0.34, -2.65, 1.85, 1.15, 0, { w: 256, h: 96, bg: '#102a1c', fg: '#f3d36a' }, g); sign(['No. 1', 'LINDENBURG'], 1.2, 0.34, -2.65, 1.85, -1.15, Math.PI, { w: 256, h: 96, bg: '#102a1c', fg: '#f3d36a' }, g);
    sign(['LINDENBURG'], 1.5, 0.3, 1.0, 2.05, 0.77, 0, { w: 384, h: 80, bg: '#1d5b3b', fg: '#f3d36a', plate: false }, g); sign(['LINDENBURG'], 1.5, 0.3, 1.0, 2.05, -0.77, Math.PI, { w: 384, h: 80, bg: '#1d5b3b', fg: '#f3d36a', plate: false }, g);
    
    // gilded cab sides, grab rails by the doorway, a clerestory ventilator on the roof with corner finials
    [-1, 1].forEach(function (s) {
      box(2.9, 0.025, 0.012, gold, -2.65, 1.5, s * 1.145, g); box(2.9, 0.025, 0.012, gold, -2.65, 2.5, s * 1.145, g);
      [-1.3, -4.0].forEach(function (gx2) { pkRod(gx2, 1.45, s * 1.2, gx2, 2.55, s * 1.2, 0.022, brass, g, 6); });
      [-0.55, 0, 0.55].forEach(function (wx) { box(0.34, 0.07, 0.012, M.glass, -2.65 + wx, 3.86, s * 0.505, g); });
    });
    pkBevelBox(2.0, 0.16, 1.0, M.greenD, -2.65, 3.86, 0, g, 0.05); box(2.1, 0.03, 1.1, brass, -2.65, 3.77, 0, g); box(2.06, 0.03, 1.06, brass, -2.65, 3.95, 0, g);
    [[-4.2, -1.3], [-4.2, 1.3], [-1.1, -1.3], [-1.1, 1.3]].forEach(function (c) { sphere(0.07, gold, c[0], 3.7, c[1], g); });
    
    // the driver's seat: a padded leather seat on a pillar and a bracket off the cab side, set high enough for the eye to
    // clear the spectacle glass (the camera sits 0.72 above its cushion; trSeatTop/playerOverride in part 43 use the same)
    var leather = pkPaint(0x4a2a1c, 0.7, 0.05);
    pkBevelBox(0.44, 0.08, 0.42, leather, -2.55, TR_CAB_SEAT - 0.04, -0.68, g, 0.03);
    pkBevelBox(0.46, 0.04, 0.44, M.black, -2.55, TR_CAB_SEAT - 0.1, -0.68, g, 0.01);
    pkBevelBox(0.08, 0.36, 0.38, leather, -2.8, TR_CAB_SEAT + 0.16, -0.68, g, 0.03);
    pkRoundCyl(0.035, TR_CAB_SEAT - 0.12 - 1.35, M.black, -2.55, (TR_CAB_SEAT - 0.12 + 1.35) / 2, -0.68, g, 8);
    pkRoundCyl(0.12, 0.03, M.black, -2.55, 1.365, -0.68, g, 12);
    pkRod(-2.55, TR_CAB_SEAT - 0.12, -0.68, -2.55, TR_CAB_SEAT - 0.3, -1.06, 0.025, M.black, g, 6);
    // the backhead: dials, levers, switches
    trBuildCabControls(g, u);
    
    // the doorway: climb up into the cab
    [-1, 1].forEach(function (s) { box(0.7, 0.06, 0.5, M.iron, -2.9, 0.75, s * 1.35, g); box(0.7, 0.06, 0.5, M.iron, -2.9, 1.02, s * 1.25, g); });
    hitBox(1.2, 1.6, 1.0, -2.9, 1.9, 1.6, { prompt: function () { return trCanBoard() ? 'Climb into the cab' : ''; }, use: function () { trEnterCab(); } }, g);
    hitBox(1.2, 1.6, 1.0, -2.9, 1.9, -1.6, { prompt: function () { return trCanBoard() ? 'Climb into the cab' : ''; }, use: function () { trEnterCab(); } }, g);

    TR.units.push(u); return u;
  }

  // ── The cab interior: a proper little room inside the green shell ──
  function trBuildCabControls(g, u) {
    var M = trMats(), X = -1.2;
    var brass = M.brass, iron = M.iron;
    var cream = M.cream;
    var wain = pkPaint(0x6b4a2e, 0.85, 0.05);          // warm wood wainscot
    var seatMat = pkPaint(0x7a3b2e, 0.82, 0.05);       // oxblood seats
    var seatEdge = pkPaint(0x4a241c, 0.86, 0.05);

    // --- finished floor: warm planks with a brass threshold ---
    pkBevelBox(3.0, 0.06, 2.15, pkPaint(0x6b4a2e, 0.9, 0.02), -2.65, 1.33, 0, g, 0.02);
    for (var fp = -3.95; fp <= -1.35; fp += 0.32) box(0.045, 0.012, 1.86, pkPaint(0x7c5636, 0.85, 0), fp, 1.37, 0, g);
    box(2.9, 0.02, 0.035, brass, -2.65, 1.375, 1.05, g); box(2.9, 0.02, 0.035, brass, -2.65, 1.375, -1.05, g);
    pkBevelBox(0.9, 0.02, 0.7, pkPaint(0x7a1f2a, 0.9, 0.05), -3.25, 1.375, 0, g, 0.04);

    // --- interior walls: warm ivory above a wood wainscot, so it reads bright and finished ---
    [-1, 1].forEach(function (s) {
      var wz = s * 1.03;
      // ivory upper wall with two open side windows (x -3.93..-2.95 and -2.95..-1.85), so the driver can see out and along the train
      pkBevelBox(2.95, 0.14, 0.05, cream, -2.65, 2.49, wz, g, 0.02);       // sill
      pkBevelBox(2.95, 0.18, 0.05, cream, -2.65, 3.385, wz, g, 0.02);      // header
      pkBevelBox(0.2, 1.055, 0.05, cream, -4.025, 2.95, wz, g, 0.02);      // rear post
      pkBevelBox(0.1, 1.055, 0.05, cream, -2.95, 2.95, wz, g, 0.02);       // mullion
      pkBevelBox(0.675, 1.055, 0.05, cream, -1.5125, 2.95, wz, g, 0.02);   // front pillar (carries the clock on the left side)
      box(2.7, 0.025, 0.07, brass, -2.65, 2.565, wz, g);                    // brass sill capping
      pkBevelBox(2.95, 0.7, 0.06, wain, -2.65, 2.02, wz, g, 0.02);
      box(2.95, 0.028, 0.07, brass, -2.65, 2.37, wz, g);
    });

    // --- the footplate: backhead, firehole, glasses, regulator, manifold, gauges, reverser, brake valve, shovel, electrics (part 45) ---
    trBuildFootplate(g, u, X);

    // --- whistle cord: hangs from the front-right of the roof, out of the line of sight and clear of every lever ---
    var cord = new THREE.Group(); cord.position.set(-1.8, 3.55, 0.8); g.add(cord); u.cord = cord; pkRod(0, 0, 0, 0, -1.2, 0, 0.012, M.black, cord, 4); sphere(0.055, brass, 0, -1.25, 0, cord);
    pkRoundCyl(0.05, 0.04, brass, -1.8, 3.43, 0.8, g, 8);
    hitBox(0.2, 0.25, 0.2, -1.8, 2.3, 0.8, { prompt: function () { return TR.t && TR.t.driving ? 'Steam whistle (F - hold)' : ''; }, use: function () { trBlast('whistle', 1.4); } }, g);

    // --- ceiling: three light ribs and a warm brass pendant lamp ---
    pkBevelBox(3.0, 0.05, 2.1, pkPaint(0x2f2317, 0.85, 0.1), -2.65, 3.45, 0, g, 0.02);
    [-3.6, -2.6, -1.6].forEach(function (rx) { pkBevelBox(0.07, 0.07, 2.0, iron, rx, 3.4, 0, g, 0.015); });
    var lampG = new THREE.Group(); lampG.position.set(-2.15, 3.45, 0); g.add(lampG);
    pkRoundCyl(0.04, 0.12, brass, 0, -0.06, 0, lampG, 8);
    var shade = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.18, 16, 1, true), brass); shade.position.y = -0.2; shade.castShadow = true; lampG.add(shade);
    var cabBulbOn = new THREE.MeshBasicMaterial({ color: 0xf0a050 }), cabBulbOff = new THREE.MeshBasicMaterial({ color: 0x5a5148 });
    cabBulbOn.userData.noBake = true; cabBulbOff.userData.noBake = true;
    var lampLens = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), cabBulbOn); lampLens.scale.y = 0.95; lampLens.position.y = -0.29; lampLens.userData.noBake = true; lampG.add(lampLens);
    var cabLight = new THREE.PointLight(0xffd9a0, 2.1, 5.6, 2); cabLight.position.set(0, -0.34, 0); lampG.add(cabLight);
    u.cabLamp = lampG; u.cabBulb = lampLens; u.cabLight = cabLight; u.cabBulbOn = cabBulbOn; u.cabBulbOff = cabBulbOff;
    
    // --- a brass bulkhead clock on the front wall, screwed to the green centre mullion above the backhead ---
    var clockG = new THREE.Group(); clockG.position.set(-1.185, 3.0, 0); clockG.rotation.y = -Math.PI / 2; clockG.scale.setScalar(0.85); g.add(clockG);
    var cface = document.createElement('canvas'); cface.width = cface.height = 128; var cc = cface.getContext('2d');
    if (cc) {
      cc.fillStyle = '#f6f0df'; cc.beginPath(); cc.arc(64, 64, 60, 0, 7); cc.fill();
      cc.strokeStyle = '#22231f'; cc.lineWidth = 3; cc.beginPath(); cc.arc(64, 64, 57, 0, 7); cc.stroke();
      for (var ci = 0; ci < 12; ci++) {
        var ca = ci / 12 * Math.PI * 2, bigc = ci % 3 === 0;
        cc.lineWidth = bigc ? 4 : 2; cc.beginPath();
        cc.moveTo(64 + Math.cos(ca) * (bigc ? 43 : 48), 64 + Math.sin(ca) * (bigc ? 43 : 48));
        cc.lineTo(64 + Math.cos(ca) * 53, 64 + Math.sin(ca) * 53); cc.stroke();
        if (bigc) { cc.fillStyle = '#22231f'; cc.font = 'bold 15px Arial'; cc.textAlign = 'center'; cc.textBaseline = 'middle'; cc.fillText(String(ci === 0 ? 12 : ci), 64 + Math.cos(ca) * 33, 64 + Math.sin(ca) * 33); }
      }
    }
    var cback = pkRoundCyl(0.13, 0.05, brass, 0, 0, 0, clockG, 20); cback.rotation.x = Math.PI / 2;
    var cplate = new THREE.Mesh(new THREE.CircleGeometry(0.115, 24), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cface) })); cplate.position.z = 0.028; clockG.add(cplate);
    var crim = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.018, 6, 24), brass); crim.position.z = 0.03; clockG.add(crim);
    var clockH = new THREE.Group(); clockH.position.z = 0.04; clockG.add(clockH); box(0.012, 0.07, 0.006, M.black, 0, 0.035, 0, clockH);
    var clockM = new THREE.Group(); clockM.position.z = 0.045; clockG.add(clockM); box(0.01, 0.1, 0.006, M.black, 0, 0.05, 0, clockM);
    sphere(0.012, brass, 0, 0, 0.048, clockG);
    u.clockH = clockH; u.clockM = clockM;
    sign(['TIME'], 0.18, 0.045, -1.175, 2.78, 0, -Math.PI / 2, { w: 152, h: 42, bg: '#151a1e', fg: '#f5f2e8' }, g);

    // --- operator displays: right-hand wall, ahead of the crew seat (the PAGE / REPEAT controls sit on the desk right below) ---
    function cabDisplay(x, y, z, w, h, ry) {
      var frame = new THREE.Group(); frame.position.set(x, y, z); frame.rotation.y = ry; g.add(frame);
      pkBevelBox(w + 0.14, h + 0.14, 0.04, brass, 0, 0, 0.015, frame, 0.012);        // brass border, seated on the wall
      pkBevelBox(w + 0.08, h + 0.08, 0.02, M.black, 0, 0, 0.04, frame, 0.01);         // black bezel
      var cv = document.createElement('canvas'); cv.width = 1024; cv.height = 600;   // drawn at 2x (the tick scales the 512 x 300 layout) so the text stays sharp
      var tex = new THREE.CanvasTexture(cv);
      var screen = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
      screen.position.z = 0.052; screen.userData.noBake = true; frame.add(screen);
      return { canvas: cv, tex: tex };
    }
    TR.cabDisplays = {
      alignment: cabDisplay(-1.5, 3.05, 0.72, 0.56, 0.33, -3 * Math.PI / 4),   // hangs in the front-right corner, angled toward the driver
      passenger: cabDisplay(-2.0, 2.22, 1.0, 0.56, 0.33, Math.PI)
    };
    // two brass rods hang the alignment screen from the roof, with little ceiling flanges
    [[-1.656, 0.876], [-1.344, 0.564]].forEach(function (r) {
      pkRod(r[0], 3.285, r[1], r[0], 3.52, r[1], 0.014, brass, g, 6);
      pkRoundCyl(0.04, 0.02, brass, r[0], 3.49, r[1], g, 10);
    });
    TR.cabDisplays.pageLever = u.pageLeverRef;   // the display tick swings this lever
    sign(['STOP'], 0.2, 0.05, -1.542, 2.825, 0.678, -3 * Math.PI / 4, { w: 128, h: 36, bg: '#151a1e', fg: '#f5f2e8' }, g);   // little captions under each screen
    sign(['PASSENGERS'], 0.3, 0.05, -2.0, 2.0, 0.96, Math.PI, { w: 192, h: 36, bg: '#151a1e', fg: '#f5f2e8' }, g);

    // --- rear bulkhead, open in the middle ---
    pkBevelBox(0.1, 0.1, 2.2, M.greenD, -4.08, 3.24, 0, g, 0.02);
    [-1, 1].forEach(function (s) {
      pkBevelBox(0.08, 1.8, 0.5, cream, -4.08, 2.3, s * 0.87, g, 0.02);
      box(0.02, 1.7, 0.03, brass, -4.02, 2.3, s * 0.62, g);
    });

    // --- the two crew seats: big, tall driver's armchairs on a pedestal (seat top 1.96, so a seated eye is ~2.71) ---
    [-1, 1].forEach(function (s) {
      var sg = new THREE.Group(); sg.position.set(-2.55, 1.79, s * 0.68); g.add(sg);
      pkRoundCyl(0.07, 0.42, iron, 0, -0.21, 0, sg, 10); pkRoundCyl(0.2, 0.03, iron, 0, -0.405, 0, sg, 16);   // pedestal and floor flange
      pkRoundCyl(0.09, 0.06, brass, 0, -0.01, 0, sg, 10);
      pkBevelBox(0.5, 0.05, 0.46, iron, 0, 0.0, 0, sg, 0.02);
      pkBevelBox(0.54, 0.14, 0.5, seatMat, 0, 0.1, 0, sg, 0.04);                                   // cushion
      var bk = new THREE.Group(); bk.position.set(-0.24, 0.15, 0); bk.rotation.z = 0.14; sg.add(bk);
      pkBevelBox(0.11, 0.72, 0.5, seatMat, 0, 0.38, 0, bk, 0.04);                                  // tall backrest
      pkBevelBox(0.05, 0.66, 0.42, seatEdge, -0.07, 0.38, 0, bk, 0.02);
      [-1, 1].forEach(function (k) {                                                                // brass armrests on posts
        pkRod(0.2, 0.3, k * 0.27, -0.2, 0.3, k * 0.27, 0.02, brass, sg, 6);
        pkRod(0.17, 0.17, k * 0.27, 0.17, 0.3, k * 0.27, 0.016, brass, sg, 5);
        sphere(0.03, brass, 0.2, 0.3, k * 0.27, sg);
      });
    });
  }

  function trCabDisplaysTick(dt) {
    var t = TR.t, D = TR.cabDisplays;
    if (!t || !D) return;
    t.cabDisplayT = (t.cabDisplayT || 0) + dt;
    if (t.cabDisplayT < 0.35) return;
    t.cabDisplayT = 0;
    var stopIndex = t.at >= 0 ? t.at : t.nextSt, st = TR.st[stopIndex], next = TR.st[t.nextSt];
    var distance = next ? Math.max(0, Math.round(trFwdDist(t, trTargetS(t.nextSt, t.mode)))) : 0;
    if (D.pageLever) D.pageLever.rotation.z = t.passengerRoutePage ? -0.45 : 0.45;

    var a = D.alignment, c = a.canvas.getContext('2d'), p = D.passenger, pc = p.canvas.getContext('2d');
    if (!(t.dynamo && t.press > 0.12)) {   // no steam on the turbo-generator: the screens are dark
      if (!D.dark) { D.dark = true; [[c, a], [pc, p]].forEach(function (q) { if (q[0]) { q[0].setTransform(1, 0, 0, 1, 0, 0); q[0].fillStyle = '#050807'; q[0].fillRect(0, 0, 1024, 600); q[1].tex.needsUpdate = true; } }); }
      return;
    }
    D.dark = false;
    if (c) {
      c.setTransform(2, 0, 0, 2, 0, 0);
      c.fillStyle = '#10211b'; c.fillRect(0, 0, 512, 300); c.strokeStyle = '#c9a45e'; c.lineWidth = 4; c.strokeRect(7, 7, 498, 286);
      c.textAlign = 'left'; c.fillStyle = '#f2d48c'; c.font = 'bold 25px Consolas, monospace'; c.fillText('PLATFORM ALIGNMENT', 24, 43);
      c.fillStyle = '#dbe8d7'; c.font = '20px Consolas, monospace'; c.fillText(st ? st.name : 'ROUTE UNKNOWN', 24, 88);
      // the stop assist: offered within reach of the platform, lit while the driver holds Space
      if (t.assist || (t.driving && trAssistDist(t) >= 0)) { c.textAlign = 'right'; c.fillStyle = t.assist ? '#83e5a3' : '#f2c75c'; c.font = 'bold 17px Consolas, monospace'; c.fillText(t.assist ? 'STOP ASSIST ON' : 'HOLD SPACE: STOP ASSIST', 488, 88); c.textAlign = 'left'; }
      c.fillStyle = t.at >= 0 && t.v < 0.25 ? '#83e5a3' : '#f2c75c'; c.font = 'bold 25px Consolas, monospace';
      c.fillText(t.at >= 0 && t.v < 0.25 ? 'STOP POSITION: ALIGNED' : 'STOP IN: ' + distance + ' m', 24, 128);
      c.fillStyle = '#dbe8d7'; c.font = '20px Consolas, monospace';
      c.fillText('SPEED: ' + Math.round(t.v * 3.6) + ' km/h', 24, 206);
      c.fillText('PLATFORM GATES: ' + (st && st.gatesAmt > 0.5 ? 'OPEN' : 'CLOSED'), 24, 238);
      c.fillText('WAGON DOORS: ' + (t.doorsOpen ? 'OPEN' : 'SHUT'), 24, 270);
      // alignment bar: approach progress to the stop point
      var barX = 24, barY = 162, barW = 460, barH = 14;
      c.fillStyle = '#0a1410'; c.fillRect(barX, barY, barW, barH);
      c.strokeStyle = '#c9a45e'; c.lineWidth = 1; c.strokeRect(barX, barY, barW, barH);
      var prog = clamp(1 - distance / 60, 0, 1);
      c.fillStyle = (distance < 2) ? '#5fd38d' : '#f2c75c';
      c.fillRect(barX, barY, barW * prog, barH);
      c.fillStyle = '#dbe8d7'; c.font = '14px Consolas, monospace';
      c.fillText('APPROACH', barX, barY - 6);
      c.textAlign = 'right'; c.fillText(distance.toFixed(1) + ' m', barX + barW, barY - 6); c.textAlign = 'left';
      a.tex.needsUpdate = true;
    }

    if (pc) {
      pc.setTransform(2, 0, 0, 2, 0, 0);
      pc.fillStyle = '#10211b'; pc.fillRect(0, 0, 512, 300); pc.strokeStyle = '#c9a45e'; pc.lineWidth = 4; pc.strokeRect(7, 7, 498, 286);
      pc.textAlign = 'left'; pc.fillStyle = '#f2d48c'; pc.font = 'bold 26px Consolas, monospace'; pc.fillText('LINDENBURG RAILWAY', 24, 44);
      if (!t.passengerRoutePage) {
        // big type so it reads from the driver's seat: the station name shrinks only if it would not fit
        pc.fillStyle = '#83e5a3'; pc.font = 'bold 26px Consolas, monospace'; pc.fillText(t.at >= 0 ? 'NOW AT' : 'NEXT STOP', 24, 98);
        var nm = st ? st.name : 'PLEASE WAIT', fs = 46; pc.font = 'bold ' + fs + 'px Arial, sans-serif';
        while (fs > 26 && pc.measureText(nm).width > 464) { fs -= 2; pc.font = 'bold ' + fs + 'px Arial, sans-serif'; }
        pc.fillStyle = '#ffffff'; pc.fillText(nm, 24, 156);
        pc.fillStyle = '#dbe8d7'; pc.font = '25px Arial, sans-serif';
        pc.fillText('Please remain seated', 24, 214); pc.fillText(t.at >= 0 ? 'until the train stops.' : 'until your stop.', 24, 248);
      } else {
        pc.fillStyle = '#83e5a3'; pc.font = 'bold 24px Consolas, monospace'; pc.fillText('ROUTE', 24, 86);
        pc.font = 'bold 26px Arial, sans-serif';
        TR.st.forEach(function (station, i) {
          pc.fillStyle = i === stopIndex ? '#f2d48c' : '#dbe8d7';
          pc.fillText((i === stopIndex ? '> ' : '  ') + station.name, 28, 128 + i * 40);
        });
      }
      p.tex.needsUpdate = true;
    }
  }

  // ── The tender ────────────────────────────────────────────────────
  function trBuildTender() {
    var M = trMats(), g = trDyn(), u = { kind: 'tender', g: g, len: 4.0, d: 10.9, bf: 1.2, br: 1.2, wheels: [], rods: [], drivers: [] };
    var gold = M.gold, brass = M.brass, steel = std({ color: 0xaab2b8, roughness: 0.3, metalness: 0.55 });
    // frame and the water tank: green, beaded in brass, lined in gold, with the line's name plate
    pkBevelBox(4.0, 0.26, 1.8, M.black, 0, 1.0, 0, g, 0.03);
    pkBevelBox(3.8, 1.1, 1.9, M.green, 0, 1.7, 0, g, 0.07); box(3.8, 0.05, 1.95, brass, 0, 2.2, 0, g); box(3.9, 0.05, 1.95, brass, 0, 1.2, 0, g);
    pkBevelBox(3.7, 0.06, 1.8, M.greenD, 0, 2.26, 0, g, 0.02);
    [-1, 1].forEach(function (s) { box(3.5, 0.02, 0.01, gold, 0, 2.08, s * 0.955, g); box(3.5, 0.02, 0.01, gold, 0, 1.32, s * 0.955, g); });
    sign(['LINDENBURG', 'RAILWAY'], 1.8, 0.5, 0, 1.7, 0.97, 0, { w: 384, h: 128, bg: '#102a1c', fg: '#f3d36a' }, g); sign(['LINDENBURG', 'RAILWAY'], 1.8, 0.5, 0, 1.7, -0.97, Math.PI, { w: 384, h: 128, bg: '#102a1c', fg: '#f3d36a' }, g);
    // the coal bunker: iron boards, a bulkhead toward the engine, a mounded load
    [-1, 1].forEach(function (s) { pkBevelBox(2.6, 0.42, 0.06, M.black, -0.45, 2.5, s * 0.8, g, 0.015); });
    pkBevelBox(0.06, 0.42, 1.66, M.black, -1.75, 2.5, 0, g, 0.015); pkBevelBox(0.08, 0.6, 1.66, M.black, 0.85, 2.58, 0, g, 0.02);
    box(2.5, 0.2, 1.5, M.coal, -0.45, 2.4, 0, g);
    for (var i = 0; i < 22; i++) {
      var cx = -1.55 + (i % 7) * 0.33, cz = (((i * 5) % 7) - 3) * 0.2, cr = 0.2 + ((i * 3) % 4) * 0.045;
      var cyy = 2.42 + 0.28 * (1 - Math.abs(cz) / 0.8) * (1 - Math.abs(cx + 0.45) / 1.4) + (i % 3) * 0.03;
      var lump = new THREE.Mesh(new THREE.IcosahedronGeometry(cr, 0), M.coal); lump.position.set(cx, cyy, cz); lump.rotation.set(i, i * 2, i * 3); lump.castShadow = true; g.add(lump);
    }
    // water filler hatch with a brass rim, and a pair of tool boxes
    pkLathe([[0.01, 0], [0.4, 0], [0.4, 0.1], [0.32, 0.2], [0.01, 0.24]], M.green, 1.45, 2.28, 0, g, 20);
    var hr = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.03, 6, 22), brass); hr.rotation.x = Math.PI / 2; hr.position.set(1.45, 2.32, 0); g.add(hr); sphere(0.06, brass, 1.45, 2.54, 0, g);
    [-1, 1].forEach(function (s) { pkBevelBox(0.9, 0.22, 0.24, M.black, 1.4, 2.38, s * 0.78, g, 0.025); box(0.9, 0.02, 0.26, gold, 1.4, 2.5, s * 0.78, g); });
    // the rear: a ladder and two red marker lamps
    [-1, 1].forEach(function (s) { pkRod(-1.95, 1.3, s * 0.55, -1.95, 2.35, s * 0.55, 0.025, M.iron, g, 6); });
    for (var r = 0; r < 5; r++) pkRod(-1.95, 1.4 + r * 0.2, -0.55, -1.95, 1.4 + r * 0.2, 0.55, 0.02, M.iron, g, 6);
    [-1, 1].forEach(function (s) { pkBevelBox(0.16, 0.2, 0.16, M.black, -1.98, 2.0, s * 0.8, g, 0.02); sphere(0.06, M.ledOn, -2.07, 2.0, s * 0.8, g); });
    [-1, 1].forEach(function (s) { [-1.2, 1.2].forEach(function (x) { var w = trLocoWheel(0.34, M.black, M.black, g, x, 0.6, s * 0.85, 6, { s: s }); u.wheels.push({ w: w, r: 0.34 }); }); });
    // buffers (front ones just touch the engine's rear beam, rear ones the first wagon) and the drawbar
    [-0.7, 0.7].forEach(function (z) {
      var b = pkRoundCyl(0.1, 0.3, M.iron, 2.15, 1.1, z, g, 10); b.rotation.z = Math.PI / 2; var d = pkRoundCyl(0.16, 0.05, steel, 2.325, 1.1, z, g, 12); d.rotation.z = Math.PI / 2;
      var b2 = pkRoundCyl(0.1, 0.2, M.iron, -2.1, 1.1, z, g, 10); b2.rotation.z = Math.PI / 2; var d2 = pkRoundCyl(0.15, 0.05, steel, -2.225, 1.1, z, g, 12); d2.rotation.z = Math.PI / 2;
    });
    box(0.7, 0.1, 0.1, M.iron, -2.25, 1.1, 0, g);
    TR.units.push(u); return u;
  }

  // ── A wagon: four seats, doors at the sides, a fairy-tale roof ────
  // ── The carriages ─────────────────────────────────────────────────
  // Each carriage tells one of the park's tales: its colours, its name on a scroll board, its crest painted on the sides
  // and ends, and its roof (trWagonRoof). The body is a heritage summer coach: a steel underframe on leaf springs, beaded
  // waist panels lined in gold, turned corner posts, glazed windows under a scalloped valance and an arched roof with a
  // painted ceiling inside; two buttoned benches face each other across the doorway.
  function trCrestTex(kind, body, trim) {
    var hex = function (c) { return '#' + ('000000' + c.toString(16)).slice(-6); };
    return tex(256, 256, function (c) {
      var circ = function (x, y, r, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); };
      var star = function (x, y, r, col) { c.fillStyle = col; c.beginPath(); for (var q = 0; q < 10; q++) { var rr = q % 2 ? r * 0.42 : r, aa = q / 10 * 6.283 - 1.571; c.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); } c.fill(); };
      circ(128, 128, 126, hex(trim)); circ(128, 128, 112, '#f6efdc');
      c.strokeStyle = hex(body); c.lineWidth = 6; c.beginPath(); c.arc(128, 128, 100, 0, 6.283); c.stroke();
      c.lineCap = 'round'; c.lineJoin = 'round';
      if (kind === 'spires') {            // a briar rose
        c.strokeStyle = '#2f6b34'; c.lineWidth = 7; c.beginPath(); c.moveTo(128, 205); c.bezierCurveTo(110, 170, 150, 150, 128, 120); c.stroke();
        [[96, 165, -0.6], [160, 150, 0.6]].forEach(function (l) { c.save(); c.translate(l[0], l[1]); c.rotate(l[2]); c.fillStyle = '#3f8a44'; c.beginPath(); c.ellipse(0, 0, 22, 10, 0, 0, 6.283); c.fill(); c.restore(); });
        for (var i = 0; i < 6; i++) { var a = i / 6 * 6.283; circ(128 + Math.cos(a) * 22, 95 + Math.sin(a) * 22, 22, '#c8324e'); }
        circ(128, 95, 20, '#e0566f'); circ(128, 95, 9, '#f3d36a');
      } else if (kind === 'mushroom') {   // a toadstool
        c.fillStyle = '#efe6cf'; c.fillRect(110, 120, 36, 70); c.strokeStyle = '#a89c80'; c.lineWidth = 3; c.strokeRect(110, 120, 36, 70);
        c.fillStyle = '#c4262b'; c.beginPath(); c.moveTo(48, 130); c.quadraticCurveTo(128, 20, 208, 130); c.closePath(); c.fill();
        [[90, 100, 12], [130, 75, 14], [168, 104, 11], [110, 120, 8], [150, 124, 8]].forEach(function (d) { circ(d[0], d[1], d[2], '#ffffff'); });
        c.fillStyle = '#5a8a3c'; c.fillRect(60, 188, 136, 10);
      } else if (kind === 'gingerbread') { // a gingerbread man
        var gb = '#a8662e'; circ(128, 72, 28, gb); c.fillStyle = gb; c.beginPath(); c.ellipse(128, 140, 38, 46, 0, 0, 6.283); c.fill();
        c.strokeStyle = gb; c.lineWidth = 24; c.beginPath(); c.moveTo(92, 118); c.lineTo(62, 140); c.moveTo(164, 118); c.lineTo(194, 140); c.moveTo(108, 178); c.lineTo(94, 210); c.moveTo(148, 178); c.lineTo(162, 210); c.stroke();
        circ(118, 66, 4, '#2a1a10'); circ(138, 66, 4, '#2a1a10'); [124, 146, 168].forEach(function (y) { circ(128, y - 20, 5, '#ffffff'); });
        c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.beginPath(); c.arc(128, 78, 10, 0.2, 2.9); c.stroke();
      } else if (kind === 'crown') {      // the frog king's crown
        c.fillStyle = '#d9a93a'; c.beginPath(); c.moveTo(60, 170); c.lineTo(60, 92); c.lineTo(94, 130); c.lineTo(128, 74); c.lineTo(162, 130); c.lineTo(196, 92); c.lineTo(196, 170); c.closePath(); c.fill();
        c.fillStyle = '#b8862a'; c.fillRect(60, 160, 136, 22); [94, 128, 162].forEach(function (x) { circ(x, 171, 7, '#c8324e'); }); [60, 128, 196].forEach(function (x, i) { circ(x, i === 1 ? 70 : 88, 9, '#f3d36a'); });
      } else if (kind === 'onion') {      // Fata Morgana's dome and a star
        c.fillStyle = '#d9a93a'; c.beginPath(); c.moveTo(128, 50); c.bezierCurveTo(176, 110, 190, 130, 160, 160); c.lineTo(96, 160); c.bezierCurveTo(66, 130, 80, 110, 128, 50); c.fill();
        c.fillStyle = '#1fa9a3'; c.fillRect(92, 160, 72, 40); c.fillStyle = '#16807b'; c.beginPath(); c.arc(128, 200, 14, Math.PI, 0); c.fill();
        star(190, 70, 14, '#f3d36a');
      } else if (kind === 'tree') {       // the fairytale tree, with its face
        c.fillStyle = '#6b4a2e'; c.fillRect(110, 120, 36, 82);
        [[128, 92, 52], [88, 112, 34], [168, 112, 34]].forEach(function (t2) { circ(t2[0], t2[1], t2[2], '#4f8a3a'); });
        circ(118, 150, 5, '#1b1208'); circ(138, 150, 5, '#1b1208'); c.strokeStyle = '#1b1208'; c.lineWidth = 3; c.beginPath(); c.arc(128, 168, 9, 0.3, 2.8); c.stroke();
      } else if (kind === 'tent') {       // a carnival mask
        c.fillStyle = '#d94f4f'; c.beginPath(); c.moveTo(60, 110); c.quadraticCurveTo(128, 70, 196, 110); c.quadraticCurveTo(190, 168, 128, 150); c.quadraticCurveTo(66, 168, 60, 110); c.fill();
        c.fillStyle = '#f6efdc'; c.beginPath(); c.ellipse(100, 118, 18, 11, -0.2, 0, 6.283); c.fill(); c.beginPath(); c.ellipse(156, 118, 18, 11, 0.2, 0, 6.283); c.fill();
        c.strokeStyle = '#f3d36a'; c.lineWidth = 5; c.beginPath(); c.moveTo(150, 150); c.quadraticCurveTo(170, 200, 140, 214); c.stroke(); circ(140, 214, 7, '#f3d36a');
      } else {                            // the dream flight's moon and stars
        circ(118, 128, 62, '#f3d36a'); circ(146, 112, 56, '#f6efdc');
        [[176, 74, 10], [190, 156, 7], [154, 186, 6]].forEach(function (st) { star(st[0], st[1], st[2], '#d9a93a'); });
      }
    });
  }
  // a row of scallops hanging from the eaves, cut from one flat shape
  function trValance(len, h, n) {
    var sh = new THREE.Shape(), w = len / n; sh.moveTo(-len / 2, 0); sh.lineTo(len / 2, 0); sh.lineTo(len / 2, -h * 0.45);
    for (var i = n - 1; i >= 0; i--) { var x0 = -len / 2 + i * w; sh.quadraticCurveTo(x0 + w / 2, -h * 1.6, x0, -h * 0.45); }
    sh.closePath(); return new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false });
  }
  function trBuildWagon(k) {
    var M = trMats(), P = pkMats(), T = TR_WAGONS[k], g = trDyn(), u = { kind: 'wagon', g: g, idx: k, len: 4.6, d: 15.7 + 5.1 * k, bf: 1.5, br: 1.5, wheels: [], rods: [], drivers: [], doors: [], seats: [] };
    var body = pkPaint(T.body, 0.42, 0.18), trim = pkPaint(T.trim, 0.38, 0.4), gold = M.gold || pkPaint(0xd9a93a, 0.3, 0.8), dark = pkPaint(new THREE.Color(T.body).multiplyScalar(0.55).getHex(), 0.5, 0.15);
    var red = pkPaint(0x8e2a22, 0.5, 0.2), wood = M.woodD, steel = M.black;
    // the underframe: solebars and headstocks, the floor, and a step board under each doorway
    [-1, 1].forEach(function (s) { box(4.7, 0.22, 0.1, steel, 0, 0.8, s * 0.98, g); box(1.5, 0.05, 0.3, wood, 0, 0.6, s * 1.32, g); [-0.6, 0.6].forEach(function (bx) { box(0.05, 0.25, 0.05, steel, bx, 0.72, s * 1.2, g); }); });
    [-1, 1].forEach(function (e) { box(0.14, 0.28, 2.3, red, e * 2.38, 0.86, 0, g); });
    pkBevelBox(4.6, 0.16, 2.3, M.black, 0, 0.86, 0, g, 0.02); pkBevelBox(4.5, 0.06, 2.2, M.wood, 0, 0.93, 0, g, 0.01);
    box(2.6, 0.012, 0.86, dark, 0, 0.967, 0, g);   // the aisle's runner
    // the running gear: four wheelsets in axleboxes on leaf springs
    [-1, 1].forEach(function (s) { [-1.5, -0.6, 0.6, 1.5].forEach(function (x) { var w = trWheel(0.32, M.black, M.black, g, x, 0.58, s * 0.72, 6); u.wheels.push({ w: w, r: 0.32 });
      pkBevelBox(0.2, 0.2, 0.14, steel, x, 0.58, s * 0.88, g, 0.02);
      for (var lf = 0; lf < 3; lf++) box(0.66 - lf * 0.16, 0.035, 0.1, steel, x, 0.72 + lf * 0.035, s * 0.88, g);
    }); });
    [-1.5, -0.6, 0.6, 1.5].forEach(function (ax) { var axle = pkRoundCyl(0.045, 1.65, M.iron, ax, 0.58, 0, g, 8); axle.rotation.x = Math.PI / 2; });
    [-1, 1].forEach(function (e) { [-0.6, 0.6].forEach(function (z) { var bf = pkRoundCyl(0.09, 0.2, M.iron, e * 2.5, 0.9, z, g, 8); bf.rotation.z = Math.PI / 2; pkRoundCyl(0.16, 0.04, M.iron, e * 2.6, 0.9, z, g, 10).rotation.z = Math.PI / 2; }); });
    box(0.6, 0.08, 0.1, M.iron, -2.65, 0.9, 0, g);
    // the sides: beaded waist panels lined in gold, the name on a scroll board, the tale's crest, and the doors
    var crestMat = std({ map: trCrestTex(T.roof, T.body, T.trim), roughness: 0.5, metalness: 0.1 });
    [-1, 1].forEach(function (s) {
      var zo = s * 1.12, zf = s * 1.165;
      [-1.4, 1.4].forEach(function (x) {
        pkBevelBox(1.8, 0.62, 0.08, body, x, 1.27, zo, g, 0.02);
        [[1.56, 0.03, 0, 0.2], [1.56, 0.03, 0, -0.2], [0.03, 0.43, -0.765, 0], [0.03, 0.43, 0.765, 0]].forEach(function (b) { box(b[0], b[1], 0.03, trim, x + b[2], 1.27 + b[3], zf, g); });
        box(1.62, 0.012, 0.01, gold, x, 1.05, zf + s * 0.01, g);
      });
      pkBevelBox(4.7, 0.07, 0.16, trim, 0, 1.62, zo, g, 0.02);                    // the waist rail
      // the name, on a gilt-edged scroll on one panel; the crest in a gilt ring on the other
      var nx = s > 0 ? -1.4 : 1.4, cx = -nx;
      box(1.34, 0.26, 0.02, gold, nx, 1.27, zf + s * 0.012, g);
      sign([T.n], 1.26, 0.2, nx, 1.27, zf + s * 0.025, s > 0 ? 0 : Math.PI, { w: 384, h: 60, bg: '#' + ('000000' + T.body.toString(16)).slice(-6), fg: '#' + ('000000' + T.trim.toString(16)).slice(-6), plate: false }, g);
      [-1, 1].forEach(function (e) { pkRoundCyl(0.05, 0.3, gold, nx + e * 0.68, 1.27, zf + s * 0.02, g, 8); });
      var crest = new THREE.Mesh(new THREE.CircleGeometry(0.22, 28), crestMat); crest.position.set(cx, 1.27, zf + s * 0.03); crest.rotation.y = s > 0 ? 0 : Math.PI; g.add(crest);
      var cring = new THREE.Mesh(new THREE.TorusGeometry(0.225, 0.02, 6, 28), gold); cring.position.copy(crest.position); cring.rotation.y = crest.rotation.y; g.add(cring);
      // the doors: panelled leaves on their hinges, beaded, with a brass handle
      [-1, 1].forEach(function (h) {
        var pv = new THREE.Group(); pv.position.set(h * 0.5, 1.27, zo); dyn_add(g, pv);
        pkBevelBox(0.5, 0.62, 0.05, body, -h * 0.25, 0, 0, pv, 0.01); box(0.5, 0.05, 0.07, trim, -h * 0.25, 0.33, 0, pv);
        [[0.36, 0.025, 0, 0.18], [0.36, 0.025, 0, -0.18], [0.025, 0.36, -0.18, 0], [0.025, 0.36, 0.18, 0]].forEach(function (b) { box(b[0], b[1], 0.02, trim, -h * 0.25 + b[2], b[3], s * 0.035, pv); });
        sphere(0.03, M.brass, -h * 0.4, 0.05, s * 0.04, pv);
        u.doors.push({ pv: pv, side: s, h: h });
      });
      // glazed windows above the waist, each in its frame with a glazing bar
      [-1.4, 1.4].forEach(function (wx) {
        pkBevelBox(1.58, 0.84, 0.055, trim, wx, 2.0, s * 1.125, g, 0.015);
        box(1.38, 0.64, 0.016, M.glass, wx, 2.0, s * 1.16, g);
        box(0.045, 0.69, 0.026, trim, wx, 2.0, s * 1.17, g);
      });
      // brass grab rails either side of the doorway
      [-0.62, 0.62].forEach(function (dx) { pkRoundCyl(0.022, 0.9, M.brass, dx, 1.95, s * 1.17, g, 6); });
      // the cornice, and a scalloped valance along the eaves
      box(4.95, 0.08, 0.1, trim, 0, 2.52, s * 1.32, g);
      var val = new THREE.Mesh(trValance(4.9, 0.16, 14), trim); val.position.set(0, 2.48, s * 1.33 - (s > 0 ? 0 : 0.03)); g.add(val);
    });
    // turned corner posts with brass caps, and slim posts each side of the doorway
    var postGeo = [[0, 0], [0.075, 0], [0.075, 0.1], [0.05, 0.16], [0.05, 0.62], [0.07, 0.68], [0.045, 0.76], [0.045, 1.5], [0.07, 1.56], [0.07, 1.6], [0, 1.6]];
    [[-2.25, -1.1], [2.25, -1.1], [-2.25, 1.1], [2.25, 1.1]].forEach(function (p) { pkLathe(postGeo, trim, p[0], 0.96, p[1], g, 10); sphere(0.08, M.brass, p[0], 2.6, p[1], g); });
    [-1.1, 1.1].forEach(function (z) { [-0.7, 0.7].forEach(function (x) { pkRoundCyl(0.04, 1.6, trim, x, 1.75, z * 0.98, g, 6); }); });
    // the ends: a panel below the waist with the crest, and an end rail
    [-1, 1].forEach(function (e) {
      pkBevelBox(0.08, 0.62, 2.16, body, e * 2.25, 1.27, 0, g, 0.02); box(0.1, 0.07, 2.3, trim, e * 2.25, 1.62, 0, g);
      var ec = new THREE.Mesh(new THREE.CircleGeometry(0.2, 28), crestMat); ec.position.set(e * 2.3, 1.27, 0); ec.rotation.y = e * Math.PI / 2; g.add(ec);
    });
    // the arched roof (a shallow barrel, 0.17 high in the middle), its painted ceiling, and the end boards
    var R0 = 5.78, half = Math.asin(1.38 / R0), y0 = 2.56 + 0.17 - R0;
    var barrel = function (r, len, mat, dy) { var geo = new THREE.CylinderGeometry(r, r, len, 28, 1, true, -half, half * 2); geo.rotateZ(Math.PI / 2); geo.rotateX(-Math.PI / 2); var m = new THREE.Mesh(geo, mat); m.position.set(0, y0 + (dy || 0), 0); g.add(m); return m; };
    barrel(R0, 4.9, std({ color: T.body, roughness: 0.55, metalness: 0.15, side: THREE.FrontSide })).castShadow = true;
    // the ceiling hangs 0.1 under the roof, below the foot of every roof topper (trWagonRoof starts them at 2.64)
    barrel(R0 - 0.05, 4.86, std({ color: new THREE.Color(T.trim).lerp(new THREE.Color(0xf6efdc), 0.6).getHex(), roughness: 0.8, side: THREE.BackSide }), -0.1);
    [-1, 1].forEach(function (e) { var fas = new THREE.Shape(); fas.moveTo(-1.38, 0); fas.quadraticCurveTo(0, 0.34, 1.38, 0); fas.lineTo(1.38, -0.08); fas.quadraticCurveTo(0, 0.26, -1.38, -0.08); fas.closePath();
      var fm = new THREE.Mesh(new THREE.ExtrudeGeometry(fas, { depth: 0.05, bevelEnabled: false }), trim); fm.rotation.y = Math.PI / 2; fm.position.set(e * 2.47, 2.58, 0); g.add(fm); });
    // the ceiling lamp in its brass rose, the reading lamps and the luggage racks
    var lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), M.lampOn); lamp.position.set(0, 2.42, 0); lamp.userData.noBake = true; g.add(lamp); u.lamp = lamp;
    pkRoundCyl(0.16, 0.05, M.brass, 0, 2.555, 0, g, 12);
    var caseCols = [0x7b2530, 0x254a78, 0x6a4b2d, 0x40552b];
    [-1, 1].forEach(function (side) {
      [-1.4, 1.4].forEach(function (rx, ri) {
        box(1.5, 0.05, 0.22, M.woodD, rx, 2.31, side * 0.9, g);
        box(1.5, 0.025, 0.03, trim, rx, 2.35, side * 0.98, g);
        [-0.62, 0.62].forEach(function (off) { pkRoundCyl(0.025, 0.23, trim, rx + off, 2.18, side * 0.92, g, 6); });
        if ((ri + k + (side > 0 ? 1 : 0)) % 2 === 0) {
          pkBevelBox(0.34, 0.18, 0.2, pkPaint(caseCols[(k + ri) % caseCols.length], 0.7, 0.15), rx + (ri ? -0.28 : 0.28), 2.43, side * 0.9, g, 0.025);
          box(0.23, 0.022, 0.03, M.brass, rx + (ri ? -0.28 : 0.28), 2.46, side * 1.01, g);
        }
      });
      [-1.4, 1.4].forEach(function (lx) { var rl = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), M.lampOn); rl.position.set(lx, 2.34, side * 0.99); rl.userData.noBake = true; g.add(rl); });
    });
    // two benches, face to face, two seats each: buttoned cushions, a raked back, wooden ends with armrests
    [-1, 1].forEach(function (b) {
      var bx = b * 1.6, cush = pkPaint(0x7a1f2a, 0.8, 0.05);
      pkBevelBox(0.62, 0.14, 2.0, cush, bx, 1.2, 0, g, 0.04); box(0.6, 0.22, 2.0, M.woodD, bx, 1.04, 0, g);
      var back = pkBevelBox(0.14, 0.7, 2.0, cush, bx + b * 0.34, 1.6, 0, g, 0.05); back.rotation.z = -b * 0.08;
      for (var bt = -0.75; bt <= 0.76; bt += 0.5) sphere(0.022, dark, bx + b * 0.26, 1.7, bt, g);
      [-1.04, 1.04].forEach(function (ez) { pkBevelBox(0.66, 0.56, 0.06, M.woodD, bx, 1.24, ez, g, 0.02); pkBevelBox(0.5, 0.05, 0.1, M.woodD, bx - b * 0.02, 1.53, ez, g, 0.02); });
      [-0.5, 0.5].forEach(function (zz) { var seat = { x: bx - b * 0.05, y: 1.2, z: zz, face: b > 0 ? Math.PI : 0, taken: false }; u.seats.push(seat);
        hitBox(0.8, 0.9, 0.9, bx, 1.5, zz, { prompt: function () { return trCanSit(u) ? 'Sit down' : (trSeatedIn() ? '' : (TR.t.v < 0.3 ? 'The doors are shut' : '')); }, use: function () { trSit(u, seat); } }, g); });
    });
    trWagonRoof(g, T.roof, k, u);
    sign([String(k + 1)], 0.26, 0.26, 0, 2.05, 1.38, 0, { w: 96, h: 96, bg: '#1b232c', fg: '#f3d36a' }, g); sign([String(k + 1)], 0.26, 0.26, 0, 2.05, -1.38, Math.PI, { w: 96, h: 96, bg: '#1b232c', fg: '#f3d36a' }, g);
    trMergeStatic(g, [u.lamp, u.flag].concat(u.doors.map(function (d) { return d.pv; }), u.wheels.map(function (w) { return w.w; })));
    TR.units.push(u); return u;
  }
  // A carriage is a moving group, so the park's bake leaves it alone and every little part of it was a draw of its own.
  // This merges every part that never moves or changes into one mesh per look (colour, finish, texture), in the
  // carriage's own frame. Doors, wheels, lamps, the flag, glass, the ceiling and whatever the player aims at stay apart.
  function trMergeStatic(g, keep) {
    g.updateMatrixWorld(true);
    var inv = new THREE.Matrix4().copy(g.matrixWorld).invert(), rel = new THREE.Matrix4(), groups = {};
    var kept = function (o) { for (var p = o; p && p !== g; p = p.parent) if (keep.indexOf(p) >= 0) return true; return false; };
    g.traverse(function (o) {
      if (o === g || !o.isMesh || o.isInstancedMesh || kept(o)) return;
      var m = o.material;
      if (!m || Array.isArray(m) || m.transparent || m.visible === false || m.side === THREE.BackSide || (m.userData && (m.userData.noBake || m.userData.glow)) || o.userData.it || o.userData.noBake) return;
      if (!o.geometry || !o.geometry.attributes.position) return;
      var key = [m.type, m.color ? m.color.getHex() : 0, m.roughness, m.metalness, m.map ? m.map.uuid : '', m.side, m.emissive ? m.emissive.getHex() : 0, m.emissiveIntensity, o.castShadow ? 1 : 0].join('|');
      (groups[key] = groups[key] || { mat: m, items: [] }).items.push(o);
    });
    Object.keys(groups).forEach(function (key) {
      var grp = groups[key]; if (grp.items.length < 2) return;
      var pos = [], nor = [], uv = [];
      grp.items.forEach(function (o) {
        var geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        rel.multiplyMatrices(inv, o.matrixWorld); geo.applyMatrix4(rel);
        var pa = geo.attributes.position.array, na = geo.attributes.normal ? geo.attributes.normal.array : null, ua = geo.attributes.uv ? geo.attributes.uv.array : null, n = pa.length / 3;
        for (var i = 0; i < pa.length; i++) pos.push(pa[i]);
        for (var j = 0; j < n * 3; j++) nor.push(na ? na[j] : 0);
        for (var q = 0; q < n * 2; q++) uv.push(ua ? ua[q] : 0);
        geo.dispose(); o.parent.remove(o);
      });
      var merged = new THREE.BufferGeometry();
      merged.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); merged.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); merged.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      merged.computeBoundingSphere();
      var mm = new THREE.Mesh(merged, grp.mat); mm.castShadow = grp.items[0].castShadow; mm.receiveShadow = true; g.add(mm);
    });
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
    // every wheel (tyre, disc, spokes, hub, a driver's counterweight) turns as one piece, and each door leaf swings as one:
    // merged inside themselves, so the whole train costs a fraction of the draws it did
    TR.units.forEach(function (u) {
      u.wheels.forEach(function (w) { trMergeStatic(w.w, []); });
      if (u.doors) u.doors.forEach(function (d) { trMergeStatic(d.pv, []); });
      if (u.kind === 'tender') trMergeStatic(u.g, u.wheels.map(function (w) { return w.w; }));
    });
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
