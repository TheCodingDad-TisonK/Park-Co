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
  function trGauge(parent, x, y, z, ry, label, key, rad) {   // a brass dial with a needle that the update turns
    var M = trMats(), R = rad || 0.15, g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
    var cv = document.createElement('canvas'); cv.width = cv.height = 192; var c = cv.getContext('2d');
    var cx = 96, cr = 90, a0 = -Math.PI / 2 - 1.1, a1 = -Math.PI / 2 + 1.1;
    if (c) {
      c.fillStyle = '#f6f0df'; c.beginPath(); c.arc(cx, cx, cr, 0, 7); c.fill();
      c.strokeStyle = '#b9ad8c'; c.lineWidth = 4; c.beginPath(); c.arc(cx, cx, cr - 3, 0, 7); c.stroke();
      // a red band over the top quarter of the scale, so a full boiler reads at a glance
      c.strokeStyle = '#a2321f'; c.lineWidth = 8; c.beginPath(); c.arc(cx, cx, cr - 13, a0 + (a1 - a0) * 0.78, a1); c.stroke();
      for (var i = 0; i <= 10; i++) {
        var a = a0 + (a1 - a0) * i / 10, big = i % 2 === 0;
        c.strokeStyle = '#22231f'; c.lineWidth = big ? 3.2 : 1.8;
        c.beginPath(); c.moveTo(cx + Math.cos(a) * (cr - 20), cx + Math.sin(a) * (cr - 20));
        c.lineTo(cx + Math.cos(a) * (cr - (big ? 30 : 26)), cx + Math.sin(a) * (cr - (big ? 30 : 26))); c.stroke();
        if (big) { c.fillStyle = '#22231f'; c.font = 'bold 15px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(i), cx + Math.cos(a) * (cr - 42), cx + Math.sin(a) * (cr - 42)); }
      }
      c.fillStyle = '#22231f'; c.font = 'bold 19px Bahnschrift, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, cx, cx + 36);
      c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 6; c.beginPath(); c.arc(cx, cx, cr - 14, Math.PI * 1.08, Math.PI * 1.34); c.stroke();
    }
    var back = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.014, R + 0.014, 0.03, 24), M.iron); back.rotation.x = Math.PI / 2; back.position.z = -0.018; g.add(back);
    var face = new THREE.Mesh(new THREE.CircleGeometry(R, 24), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) })); face.position.z = 0.012; g.add(face);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(R + 0.005, R * 0.1, 6, 26), M.brass); ring.position.z = 0.016; g.add(ring);
    for (var sc = 0; sc < 4; sc++) { var sa = Math.PI / 4 + sc * Math.PI / 2; sphere(R * 0.045, M.brass, Math.cos(sa) * R * 0.86, Math.sin(sa) * R * 0.86, 0.018, g); }
    var needle = new THREE.Group(); needle.position.z = 0.022; g.add(needle);
    box(R * 0.055, R * 0.9, 0.004, M.black, 0, R * 0.42, 0, needle);
    sphere(R * 0.07, M.brass, 0, 0, 0.004, needle);
    TR.gauges = TR.gauges || {}; TR.gauges[key] = needle; return g;
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
    var ironPanel = pkPaint(0x17221d, 0.5, 0.45);      // dark firebox backhead

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

    // --- the backhead: a proud iron firebox end with the name plate up top ---
    pkBevelBox(0.18, 1.04, 1.7, ironPanel, X - 0.03, 1.9, 0, g, 0.05);
    box(0.02, 0.94, 0.035, brass, X - 0.11, 1.9, -0.82, g); box(0.02, 0.94, 0.035, brass, X - 0.11, 1.9, 0.82, g);
    box(0.02, 0.03, 1.62, brass, X - 0.11, 2.4, 0, g); box(0.02, 0.03, 1.62, brass, X - 0.11, 1.4, 0, g);
    sign(['LINDENBURG', 'No. 1'], 0.46, 0.15, X - 0.13, 2.31, 0, -Math.PI / 2, { w: 224, h: 72, bg: '#102a1c', fg: '#f3d36a' }, g);

    // --- four dials in one row across the top of the backhead, evenly spaced ---
    var gp = new THREE.Group(); gp.position.set(X - 0.16, 2.06, 0); g.add(gp);
    trGauge(gp, 0, 0, -0.52, -Math.PI / 2, 'STEAM', 'press', 0.13);
    trGauge(gp, 0, 0, -0.173, -Math.PI / 2, 'km/h', 'speed', 0.13);
    trGauge(gp, 0, 0, 0.173, -Math.PI / 2, 'COAL', 'fuel', 0.13);
    trGauge(gp, 0, 0, 0.52, -Math.PI / 2, 'BRAKE', 'brake', 0.13);

    // --- the firebox door: big, centred, the heart of the cab ---
    var fbGlow = new THREE.Mesh(new THREE.CircleGeometry(0.15, 24), new THREE.MeshBasicMaterial({ color: 0xff7a24 })); fbGlow.rotation.y = -Math.PI / 2; fbGlow.position.set(X - 0.14, 1.62, 0); fbGlow.userData.noBake = true; g.add(fbGlow);
    var fbRing = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.03, 6, 24), brass); fbRing.rotation.y = -Math.PI / 2; fbRing.position.set(X - 0.13, 1.62, 0); g.add(fbRing);
    var fbDoor = new THREE.Group(); fbDoor.position.set(X - 0.18, 1.62, -0.14); g.add(fbDoor);
    var fbPlate = new THREE.Mesh(new THREE.CircleGeometry(0.14, 24), pkPaint(0x2a1a12, 0.7, 0.3)); fbPlate.rotation.y = -Math.PI / 2; fbPlate.position.z = 0.14; fbDoor.add(fbPlate);
    var fbEdge = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 5, 18), brass); fbEdge.rotation.y = -Math.PI / 2; fbEdge.position.z = 0.14; fbDoor.add(fbEdge);
    box(0.03, 0.12, 0.03, brass, 0, 0.1, 0.27, fbDoor);
    var fbLever = new THREE.Group(); fbLever.position.set(-1.4, 2.28, 0.985); g.add(fbLever);   // damper: on the right wall between the backhead and the displays
    pkBevelBox(0.12, 0.14, 0.02, brass, -1.4, 2.25, 0.995, g, 0.01);
    pkRoundCyl(0.04, 0.03, brass, 0, 0, 0.015, fbLever, 10).rotation.x = Math.PI / 2;
    pkRod(0, 0, -0.02, 0, -0.22, -0.02, 0.02, iron, fbLever, 5); sphere(0.04, brass, 0, -0.23, -0.02, fbLever);
    sign(['DAMPER'], 0.2, 0.055, -1.4, 1.98, 0.995, Math.PI, { w: 168, h: 44, bg: '#151a1e', fg: '#f5f2e8' }, g);
    hitBox(0.22, 0.42, 0.24, -1.4, 2.1, 0.9, { prompt: function () { return TR.t && TR.t.driving ? (TR.fireOpen ? 'Damper: shut the firebox door (V)' : 'Damper: open the firebox door (V)') : ''; }, use: function () { sfx('click'); TR.fireOpen = !TR.fireOpen; } }, g);
    var fireLight = new THREE.PointLight(0xff7a2a, 0, 3, 2); fireLight.position.set(X - 0.45, 1.7, 0); g.add(fireLight);
    hitBox(0.3, 0.45, 0.36, X - 0.2, 1.65, 0, { prompt: function () { return TR.t && TR.t.driving ? (TR.fireOpen ? 'Shut the firebox door' : 'Open the firebox door') : ''; }, use: function () { sfx('click'); TR.fireOpen = !TR.fireOpen; } }, g);
    u.fbLever = fbLever; u.fbDoor = fbDoor; u.fbGlow = fbGlow; u.fireLight = fireLight;
    
    // --- water gauge: on the backhead, left of the firebox door, where the driver can see it ---
    var wgX = X - 0.135, wgZ = -0.62;   // the backhead's face is at X - 0.12: plates sit just proud of it
    pkBevelBox(0.03, 0.44, 0.26, pkPaint(0xd8d2bc, 0.65, 0.05), wgX, 1.63, wgZ, g, 0.015);
    box(0.012, 0.3, 0.14, pkPaint(0x2a3a30, 0.7, 0.15), wgX - 0.02, 1.59, wgZ, g);
    var gl = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.28, 8), M.glass); gl.position.set(wgX - 0.035, 1.59, wgZ); g.add(gl);
    var wl = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.28, 0.03), new THREE.MeshBasicMaterial({ color: 0x54b4ff })); wl.geometry.translate(0, 0.14, 0); wl.position.set(wgX - 0.035, 1.45, wgZ); g.add(wl); TR.waterGlass = wl;
    box(0.08, 0.04, 0.08, brass, wgX - 0.035, 1.74, wgZ, g); box(0.08, 0.04, 0.08, brass, wgX - 0.035, 1.44, wgZ, g);
    sign(['WATER'], 0.22, 0.055, wgX - 0.02, 1.795, wgZ, -Math.PI / 2, { w: 168, h: 44, bg: '#151a1e', fg: '#f5f2e8' }, g);

    // --- the control desk: one low console in front of the backhead. Levers on the left, horn + passenger-info controls to the right.
    // Everything on it is labelled on the front face, in one row, at one height. It stays 0.04 clear of the firebox door's swing.
    var deskX = -1.77, deskTop = 1.58, labelX = -1.88, labelY = 1.41;
    pkBevelBox(0.2, 0.24, 1.9, pkPaint(0x20262b, 0.55, 0.4), deskX, 1.46, 0, g, 0.03);
    box(0.02, 0.025, 1.9, brass, deskX - 0.095, deskTop + 0.005, 0, g);
    function label(txt, z, w) { sign([txt], w || 0.22, 0.06, labelX, labelY, z, -Math.PI / 2, { w: 168, h: 44, bg: '#151a1e', fg: '#f5f2e8' }, g); }
    function lever(key, z, col, txt, prompt, use) {
      var pv = new THREE.Group(); pv.position.set(deskX, deskTop + 0.02, z); g.add(pv);
      pkBevelBox(0.12, 0.04, 0.2, brass, 0, 0, 0, pv, 0.01);
      pkRoundCyl(0.04, 0.07, iron, 0, 0.05, 0, pv, 8);
      var st = new THREE.Group(); pv.add(st); pkRod(0, 0.03, 0, 0, 0.4, 0, 0.02, iron, st, 6); sphere(0.045, col, 0, 0.44, 0, st);
      label(txt, z);
      hitBox(0.22, 0.5, 0.14, deskX, deskTop + 0.24, z, { prompt: function () { return TR.t && TR.t.driving ? prompt() : ''; }, use: use }, g);
      u[key] = st; return st;
    }
    lever('gasLever', -0.8, M.red, 'GAS', function () { return 'Gas: ' + Math.round(TR.t.throttle * 100) + '% (W / S)'; }, function () { TR.t.throttle = TR.t.throttle >= 0.99 ? 0 : Math.min(1, TR.t.throttle + 0.25); });
    lever('brakeLever', -0.56, pkPaint(0x2a5fd0, 0.4, 0.3), 'BRAKE', function () { return 'Brake: ' + Math.round(TR.t.brake * 100) + '% (Space)'; }, function () { TR.t.brake = TR.t.brake >= 0.99 ? 0 : Math.min(1, TR.t.brake + 0.5); });
    lever('revLever', -0.32, brass, 'REVERSE', function () { return 'Reverser: ' + (TR.t.dir > 0 ? 'FORWARD' : 'REVERSE') + ' (R)'; }, function () { trToggleDir(); });

    // push buttons sit in the desk's front face (the update sinks the horn button 0.03 when it is pressed)
    function pushBtn(z, r, mat, txt, hit) {
      var b = pkRoundCyl(r, 0.06, mat, labelX + 0.0, 1.5, z, g, 14); b.rotation.z = Math.PI / 2; b.position.x = deskX - 0.1 - 0.03;
      var ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.015, 0.012, 6, 20), brass); ring.rotation.y = Math.PI / 2; ring.position.set(deskX - 0.1 - 0.005, 1.5, z); g.add(ring);
      label(txt, z); hitBox(0.2, 0.2, 0.2, deskX - 0.11, 1.5, z, hit, g); return b;
    }
    var hb = pushBtn(0.12, 0.055, M.red, 'HORN', { prompt: function () { return TR.t && TR.t.driving ? 'Horn (H - hold)' : ''; }, use: function () { trBlast('horn', 0.9); } });
    u.hornBtn = hb; hb.userData.rest = hb.position.x;
    pushBtn(0.72, 0.045, pkPaint(0xe8e0c8, 0.5, 0.1), 'REPEAT', { prompt: function () { return TR.t && TR.t.driving ? 'Repeat passenger announcement' : ''; }, use: function () { trRepeatPassengerInfo(); } });
    // page lever for the passenger display: a small lever on the desk (the display tick swings it about z)
    var pageLever = new THREE.Group(); pageLever.position.set(deskX, deskTop + 0.015, 0.42); g.add(pageLever);
    pkRoundCyl(0.035, 0.04, brass, 0, 0.01, 0, pageLever, 10);
    pkRod(0, 0, 0, 0, 0.17, 0, 0.014, iron, pageLever, 5); sphere(0.032, M.brass, 0, 0.18, 0, pageLever);
    label('PAGE', 0.42);
    hitBox(0.22, 0.3, 0.22, deskX, deskTop + 0.17, 0.42, { prompt: function () { return TR.t && TR.t.driving ? 'Passenger display: change page' : ''; }, use: function () { trTogglePassengerPage(); } }, g);
    u.pageLeverRef = pageLever;

    // --- the switch panel: a plate bolted ON the right half of the backhead (it used to be buried inside it) ---
    var swX = X - 0.135;
    pkBevelBox(0.03, 0.46, 0.48, pkPaint(0x1c2a24, 0.5, 0.42), swX, 1.63, 0.55, g, 0.02);
    box(0.012, 0.012, 0.48, brass, swX - 0.018, 1.865, 0.55, g); box(0.012, 0.012, 0.48, brass, swX - 0.018, 1.395, 0.55, g);
    box(0.012, 0.46, 0.012, brass, swX - 0.018, 1.63, 0.31, g); box(0.012, 0.46, 0.012, brass, swX - 0.018, 1.63, 0.79, g);
    function sw(key, z, txt, prompt, use) {
      var pv = new THREE.Group(); pv.position.set(swX - 0.04, 1.65, z); g.add(pv);
      pkRoundCyl(0.05, 0.04, brass, 0, 0, 0, pv, 12).rotation.z = Math.PI / 2;
      var lv = new THREE.Group(); pv.add(lv); pkRod(0, 0, 0, 0, 0.13, 0, 0.016, iron, lv, 6); sphere(0.03, M.red, 0, 0.14, 0, lv); u[key] = lv;
      var led = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), M.ledOff); led.position.set(-0.01, -0.1, 0); pv.add(led); led.userData.noBake = true; u[key + 'Led'] = led;
      sign([txt], 0.2, 0.055, swX - 0.02, 1.455, z, -Math.PI / 2, { w: 168, h: 44, bg: '#151a1e', fg: '#f5f2e8' }, g);
      hitBox(0.14, 0.48, 0.22, swX - 0.06, 1.65, z, { prompt: function () { return TR.t && TR.t.driving ? prompt() : ''; }, use: use }, g);
    }
    sw('engSw', 0.43, 'ENGINE', function () { return 'Engine ' + (TR.t.engine ? 'ON' : 'off') + ' (I)'; }, function () { trToggleEngine(); });
    sw('doorSw', 0.67, 'DOORS', function () { return 'Wagon doors ' + (TR.t.doorsOpen ? 'open' : 'shut') + ' (U)'; }, function () { trToggleDoors(); });

    // --- steam vent: a brass handwheel next to the STEAM dial. Each click opens it another quarter turn; it opens the roof vent pipe ---
    var vx = X - 0.14, vz = -0.74, vy = 2.06;
    pkRoundCyl(0.025, 0.05, M.iron, X - 0.125, vy, vz, g, 8).rotation.z = Math.PI / 2;               // stub on the panel
    var ventWheel = new THREE.Group(); ventWheel.position.set(vx, vy, vz); g.add(ventWheel);
    var vrim = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.011, 6, 20), brass); vrim.rotation.y = Math.PI / 2; ventWheel.add(vrim);
    for (var vs = 0; vs < 4; vs++) { var sp2 = box(0.01, 0.11, 0.01, brass, 0, 0, 0, ventWheel); sp2.rotation.x = vs * Math.PI / 4; }
    sphere(0.02, M.gold, -0.005, 0, 0, ventWheel);
    sign(['VENT'], 0.15, 0.045, X - 0.15, vy - 0.115, vz, -Math.PI / 2, { w: 120, h: 40, bg: '#151a1e', fg: '#f5f2e8' }, g);
    hitBox(0.2, 0.2, 0.2, X - 0.2, vy, vz, { prompt: function () { return TR.t && TR.t.driving ? 'Steam vent: ' + Math.round((TR.vent || 0) * 100) + '% (click to turn)' : ''; }, use: function () { sfx('click'); TR.vent = (TR.vent || 0) >= 0.99 ? 0 : Math.min(1, (TR.vent || 0) + 0.25); } }, g);
    u.ventWheel = ventWheel;
    // the vent pipe on the cab roof, front right
    pkRoundCyl(0.06, 0.05, brass, -1.55, 3.78, 0.8, g, 10); pkRoundCyl(0.035, 0.34, iron, -1.55, 3.93, 0.8, g, 8);
    var vnoz = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.015, 6, 12), brass); vnoz.rotation.x = Math.PI / 2; vnoz.position.set(-1.55, 4.1, 0.8); g.add(vnoz);
    u.ventPos = new THREE.Vector3(-1.55, 4.15, 0.8);

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
      var cv = document.createElement('canvas'); cv.width = 512; cv.height = 300;
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
    sign(['STOP'], 0.2, 0.05, -1.528, 2.77, 0.692, -3 * Math.PI / 4, { w: 128, h: 36, bg: '#151a1e', fg: '#f5f2e8' }, g);   // little captions under each screen
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

    var a = D.alignment, c = a.canvas.getContext('2d');
    if (c) {
      c.fillStyle = '#10211b'; c.fillRect(0, 0, 512, 300); c.strokeStyle = '#c9a45e'; c.lineWidth = 4; c.strokeRect(7, 7, 498, 286);
      c.textAlign = 'left'; c.fillStyle = '#f2d48c'; c.font = 'bold 25px Consolas, monospace'; c.fillText('PLATFORM ALIGNMENT', 24, 43);
      c.fillStyle = '#dbe8d7'; c.font = '20px Consolas, monospace'; c.fillText(st ? st.name : 'ROUTE UNKNOWN', 24, 88);
      c.fillStyle = t.at >= 0 && t.v < 0.25 ? '#83e5a3' : '#f2c75c'; c.font = 'bold 25px Consolas, monospace';
      c.fillText(t.at >= 0 && t.v < 0.25 ? 'STOP POSITION: ALIGNED' : 'STOP IN: ' + distance + ' m', 24, 139);
      c.fillStyle = '#dbe8d7'; c.font = '20px Consolas, monospace';
      c.fillText('SPEED: ' + Math.round(t.v * 3.6) + ' km/h', 24, 192);
      c.fillText('PLATFORM GATES: ' + (st && st.gatesAmt > 0.5 ? 'OPEN' : 'CLOSED'), 24, 230);
      c.fillText('WAGON DOORS: ' + (t.doorsOpen ? 'OPEN' : 'SHUT'), 24, 268);
      // alignment bar: wagon door vs platform gate
      var barX = 24, barY = 150, barW = 460, barH = 16;
      c.fillStyle = '#0a1410'; c.fillRect(barX, barY, barW, barH);
      c.strokeStyle = '#c9a45e'; c.lineWidth = 1; c.strokeRect(barX, barY, barW, barH);
      // platform gate marker (centre)
      c.fillStyle = '#5fd38d'; c.fillRect(barX + barW / 2 - 2, barY - 4, 4, barH + 8);
      // wagon door marker, offset by remaining distance (clamped)
      var off = clamp(distance, -50, 50) / 50 * (barW / 2);
      c.fillStyle = '#f2c75c'; c.fillRect(barX + barW / 2 + off - 3, barY - 6, 6, barH + 12);
      c.fillStyle = '#dbe8d7'; c.font = '14px Consolas, monospace'; c.fillText('gate', barX + barW / 2 - 12, barY - 8);
      c.fillText('door', barX + barW / 2 + off - 12, barY + barH + 14);
      a.tex.needsUpdate = true;
    }

    var p = D.passenger, pc = p.canvas.getContext('2d');
    if (pc) {
      pc.fillStyle = '#10211b'; pc.fillRect(0, 0, 512, 300); pc.strokeStyle = '#c9a45e'; pc.lineWidth = 4; pc.strokeRect(7, 7, 498, 286);
      pc.textAlign = 'left'; pc.fillStyle = '#f2d48c'; pc.font = 'bold 23px Consolas, monospace'; pc.fillText('LINDENBURG RAILWAY', 24, 42);
      if (!t.passengerRoutePage) {
        pc.fillStyle = '#83e5a3'; pc.font = 'bold 21px Consolas, monospace'; pc.fillText(t.at >= 0 ? 'NOW AT' : 'NEXT STOP', 24, 93);
        pc.fillStyle = '#ffffff'; pc.font = 'bold 28px Arial, sans-serif'; pc.fillText(st ? st.name : 'PLEASE WAIT', 24, 143);
        pc.fillStyle = '#dbe8d7'; pc.font = '17px Arial, sans-serif'; pc.fillText(t.at >= 0 ? 'Please remain seated until the train stops.' : 'Please remain seated until your stop.', 24, 197);
        pc.fillText('Thank you for travelling with us.', 24, 231);
      } else {
        pc.fillStyle = '#83e5a3'; pc.font = 'bold 21px Consolas, monospace'; pc.fillText('ROUTE', 24, 80);
        pc.font = '19px Arial, sans-serif';
        TR.st.forEach(function (station, i) {
          pc.fillStyle = i === stopIndex ? '#f2d48c' : '#dbe8d7';
          pc.fillText((i === stopIndex ? '> ' : '  ') + station.name, 28, 116 + i * 31);
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
      // Proper framed passenger windows rather than an open-sided shell.
      [-1.4, 1.4].forEach(function (wx) {
        pkBevelBox(1.58, 0.84, 0.055, trim, wx, 2.0, s * 1.125, g, 0.015);
        box(1.38, 0.64, 0.016, M.glass, wx, 2.0, s * 1.16, g);
        box(0.045, 0.69, 0.026, trim, wx, 2.0, s * 1.17, g);
        box(1.44, 0.035, 0.026, trim, wx, 2.0, s * 1.17, g);
      });
      [-0.62, 0.62].forEach(function (dx) { pkRoundCyl(0.022, 0.56, M.brass, dx, 1.63, s * 1.17, g, 6); });
    });
    // corner posts, roof beams and lanterns
    [[-2.2, -1.1], [2.2, -1.1], [-2.2, 1.1], [2.2, 1.1]].forEach(function (p) { pkRoundCyl(0.06, 1.6, trim, p[0], 1.75, p[1], g, 8); sphere(0.1, M.brass, p[0], 2.58, p[1], g); });
    [-1.1, 1.1].forEach(function (z) { [-0.7, 0.7].forEach(function (x) { pkRoundCyl(0.04, 1.6, trim, x, 1.75, z * 0.98, g, 6); }); });
    pkBevelBox(4.9, 0.12, 2.7, body, 0, 2.56, 0, g, 0.03); box(4.95, 0.06, 2.75, trim, 0, 2.5, 0, g);
    for (var sc = -2.3; sc <= 2.3; sc += 0.46) { var s1 = trCone(0.16, 0.26, trim, sc, 2.38, 1.34, g, 4); s1.rotation.x = Math.PI; var s2 = trCone(0.16, 0.26, trim, sc, 2.38, -1.34, g, 4); s2.rotation.x = Math.PI; }
    var lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), M.lampOn); lamp.position.set(0, 2.38, 0); lamp.userData.noBake = true; g.add(lamp); u.lamp = lamp;
    // Interior luggage racks and reading lamps make every carriage feel occupied and usable.
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
    [-1.5, -0.6, 0.6, 1.5].forEach(function (ax) { var axle = pkRoundCyl(0.045, 1.65, M.iron, ax, 0.58, 0, g, 8); axle.rotation.x = Math.PI / 2; });
    [-1.05, 1.05].forEach(function (bx) { pkBevelBox(1.15, 0.12, 1.52, M.iron, bx, 0.72, 0, g, 0.02); });
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
