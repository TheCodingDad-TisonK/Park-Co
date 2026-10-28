//@ Park Co, part 45: the Lindenburg Railway - the footplate. A real backhead (firehole and butterfly doors, two gauge glasses,
  // the regulator, the steam manifold with its injector, blower and pump valves, the gauges), a Johnson bar, a straight-air brake
  // valve, the shovel, and the boiler that all of it works: the fire burns coal on the grate, the draught draws it, the injectors
  // feed the boiler from the tender, and a driver who lets the glass run dry melts the fusible plug.
  // Cab frame: +x forward, +z right, the backhead face at x = -1.32, the driver's seat on the left (z -0.68).

  // ── Dials: a Bourdon gauge face with a real scale, one needle (or two, for the duplex brake gauge) ──
  function trDial(parent, x, y, z, ry, R, o) {
    var M = trMats(), g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
    var cv = document.createElement('canvas'); cv.width = cv.height = 256; var c = cv.getContext('2d'), cx = 128, cr = 122;
    var a0 = Math.PI * 0.75, sweep = Math.PI * 1.5;   // 270 degrees, from bottom left round to bottom right
    if (c) {
      c.fillStyle = '#f7f1e1'; c.beginPath(); c.arc(cx, cx, cr, 0, 7); c.fill();
      c.strokeStyle = '#8c8063'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cx, cr - 3, 0, 7); c.stroke();
      if (o.red !== undefined) {   // the red line: the safety valves' setting, or the top of the scale
        var ar = a0 + sweep * o.red / o.max;
        c.strokeStyle = '#b02a1c'; c.lineWidth = 6; c.beginPath(); c.moveTo(cx + Math.cos(ar) * (cr - 10), cx + Math.sin(ar) * (cr - 10)); c.lineTo(cx + Math.cos(ar) * (cr - 44), cx + Math.sin(ar) * (cr - 44)); c.stroke();
        c.lineWidth = 7; c.beginPath(); c.arc(cx, cx, cr - 14, ar, a0 + sweep); c.stroke();
      }
      var n = o.max / o.minor;
      for (var i = 0; i <= n; i++) {
        var v = i * o.minor, a = a0 + sweep * v / o.max, big = Math.abs(v / o.major - Math.round(v / o.major)) < 1e-6;
        c.strokeStyle = '#1e1f1b'; c.lineWidth = big ? 3.4 : 1.6;
        c.beginPath(); c.moveTo(cx + Math.cos(a) * (cr - 12), cx + Math.sin(a) * (cr - 12)); c.lineTo(cx + Math.cos(a) * (cr - (big ? 30 : 22)), cx + Math.sin(a) * (cr - (big ? 30 : 22))); c.stroke();
        if (big) { c.fillStyle = '#1e1f1b'; c.font = 'bold 21px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(v), cx + Math.cos(a) * (cr - 48), cx + Math.sin(a) * (cr - 48)); }
      }
      c.fillStyle = '#1e1f1b'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = 'bold 20px Bahnschrift, Arial, sans-serif'; c.fillText(o.label, cx, cx + 42);
      c.font = '16px Arial, sans-serif'; c.fillText(o.unit, cx, cx + 66);
      if (o.twin) { c.font = 'bold 13px Arial'; c.fillStyle = '#b02a1c'; c.fillText('MAIN RES.', cx, cx - 40); c.fillStyle = '#1e1f1b'; c.fillText('BRAKE PIPE', cx, cx - 24); }
    }
    pkRoundCyl(R + 0.016, 0.035, M.black, 0, 0, -0.02, g, 24).rotation.x = Math.PI / 2;
    var face = new THREE.Mesh(new THREE.CircleGeometry(R, 32), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) })); face.position.z = 0.0; g.add(face);
    var bezel = new THREE.Mesh(new THREE.TorusGeometry(R + 0.006, R * 0.09, 8, 32), M.brass); bezel.position.z = 0.004; g.add(bezel);
    var glassF = new THREE.Mesh(new THREE.CircleGeometry(R, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, roughness: 0.05, metalness: 0.2 })); glassF.position.z = 0.012; g.add(glassF);
    function needle(mat, len) {
      var nd = new THREE.Group(); nd.position.z = 0.006; g.add(nd);
      box(R * 0.05, R * len, 0.003, mat, 0, R * len * 0.42, 0, nd); box(R * 0.1, R * 0.22, 0.003, mat, 0, -R * 0.1, 0, nd);
      sphere(R * 0.075, M.brass, 0, 0, 0.003, nd); return nd;
    }
    var d = { g: g, max: o.max, a0: a0, sweep: sweep, n1: needle(M.black, 0.92) };
    if (o.twin) d.n2 = needle(M.red, 0.8);
    return d;
  }
  // value -> needle angle (the needle points up at rotation 0; canvas angle phi maps to rotation -(phi + pi/2))
  function trDialSet(nd, d, v) { var phi = d.a0 + d.sweep * clamp(v / d.max, 0, 1.02); nd.rotation.z = -(phi + Math.PI / 2); }

  // a brass plate with engraved black letters
  function trPlate(txt, w, h, x, y, z, ry, g) { return sign([txt], w, h, x, y, z, ry, { w: Math.round(w * 2400), h: Math.round(h * 2400), bg: '#c49a45', fg: '#1d1408', flat: true }, g); }
  // a small brass handwheel, its face toward the driver (-x); the update turns it about x
  function trHandwheel(r, x, y, z, g) {
    var M = trMats(), w = new THREE.Group(); w.position.set(x, y, z); g.add(w);
    var rim = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.17, 6, 18), M.brass); rim.rotation.y = Math.PI / 2; w.add(rim);
    for (var k = 0; k < 3; k++) { var sp = box(0.008, r * 2, 0.008, M.brass, 0, 0, 0, w); sp.rotation.x = k * Math.PI / 3; }
    sphere(r * 0.3, M.brass, -0.008, 0, 0, w);
    return w;
  }

  // ── The backhead and everything on it ─────────────────────────────
  function trBuildFootplate(g, u, X) {
    var M = trMats(), brass = M.brass, iron = M.iron;
    var black = pkPaint(0x15191a, 0.55, 0.45), copper = pkPaint(0xb5653a, 0.32, 0.85), steel = pkPaint(0xa9b0b4, 0.28, 0.8), grip = pkPaint(0x4a2a17, 0.6, 0.05);
    var F = X - 0.12;   // the backhead's face
    var dials = TR.dials = {};

    // the boiler's end: a flat firebox backplate that rises into the round of the barrel, ringed with rivets
    var sh = new THREE.Shape(), HW = 0.82, Y0 = 1.37, YS = 2.12, AH = 0.5;
    sh.moveTo(-HW, Y0); sh.lineTo(HW, Y0); sh.lineTo(HW, YS); sh.absellipse(0, YS, HW, AH, 0, Math.PI, false); sh.lineTo(-HW, Y0);
    var bh = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2, curveSegments: 28 }), black);
    bh.rotation.y = Math.PI / 2; bh.position.set(F + 0.015, 0, 0); bh.castShadow = true; bh.receiveShadow = true; g.add(bh);
    // rivets round the edge, and a second row along the foundation ring above the firehole: one instanced draw
    var rv = [], k;
    for (k = 0; k <= 12; k++) rv.push([Y0 + 0.06 + (YS - Y0 - 0.06) * k / 12, -HW + 0.045], [Y0 + 0.06 + (YS - Y0 - 0.06) * k / 12, HW - 0.045]);
    for (k = 1; k < 26; k++) { var ea = Math.PI * k / 26; rv.push([YS + Math.sin(ea) * (AH - 0.045), Math.cos(ea) * (HW - 0.045)]); }
    for (k = 0; k <= 18; k++) rv.push([Y0 + 0.045, -HW + 0.08 + (2 * HW - 0.16) * k / 18]);
    var rivets = new THREE.InstancedMesh(new THREE.SphereGeometry(0.011, 6, 4), steel, rv.length), mtx = new THREE.Matrix4();
    rv.forEach(function (p, i) { mtx.makeTranslation(F - 0.003, p[0], p[1]); rivets.setMatrixAt(i, mtx); }); g.add(rivets);

    // --- the firehole: an oval mouth in a heavy ring, two butterfly doors that slide apart on a rail above it ---
    var fhY = 1.66;
    var fcv = document.createElement('canvas'); fcv.width = fcv.height = 128; var fc = fcv.getContext('2d');
    if (fc) {
      var gr = fc.createRadialGradient(64, 78, 4, 64, 64, 64); gr.addColorStop(0, '#fff7d6'); gr.addColorStop(0.35, '#ffc45a'); gr.addColorStop(0.7, '#e0581c'); gr.addColorStop(1, '#3a0c04');
      fc.fillStyle = gr; fc.fillRect(0, 0, 128, 128);
      for (var ci = 0; ci < 70; ci++) { var cx2 = 8 + ((ci * 37) % 112), cy2 = 70 + ((ci * 53) % 56), cr2 = 2 + (ci % 4) * 1.5; fc.fillStyle = 'rgba(40,10,4,' + (0.25 + (ci % 5) * 0.12) + ')'; fc.beginPath(); fc.arc(cx2, cy2, cr2, 0, 7); fc.fill(); }
    }
    var glowMat = new THREE.MeshBasicMaterial({ color: 0x1a0d08, map: new THREE.CanvasTexture(fcv) }); glowMat.userData.noBake = true;
    var glow = new THREE.Mesh(new THREE.CircleGeometry(0.17, 28), glowMat); glow.rotation.y = -Math.PI / 2; glow.scale.y = 0.72; glow.position.set(F - 0.004, fhY, 0); glow.userData.noBake = true; g.add(glow);
    var ringG = new THREE.Group(); ringG.position.set(F - 0.03, fhY, 0); ringG.rotation.y = Math.PI / 2; ringG.scale.y = 0.72; g.add(ringG);
    ringG.add(new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.035, 8, 30), iron));
    box(0.025, 0.04, 0.88, steel, F - 0.06, 1.87, 0, g);                                        // the door rail
    [-0.4, 0.4].forEach(function (rz) { box(0.05, 0.06, 0.03, iron, F - 0.035, 1.87, rz, g); });
    var doors = [-1, 1].map(function (s) {
      var d = new THREE.Group(); d.position.set(F - 0.085, fhY, s * 0.1); g.add(d);
      pkBevelBox(0.024, 0.3, 0.2, iron, 0, 0, 0, d, 0.008);
      box(0.012, 0.22, 0.012, steel, -0.016, 0, s * -0.085, d);                                  // the meeting edge
      box(0.03, 0.03, 0.03, steel, 0, 0.18, 0, d); sphere(0.016, steel, 0, 0.205, 0, d);       // the runner on the rail
      pkRod(-0.02, 0.0, s * 0.04, -0.07, 0.0, s * 0.04, 0.009, steel, d, 5); sphere(0.02, M.black, -0.075, 0.0, s * 0.04, d);
      return d;
    });
    var fireLight = new THREE.PointLight(0xff7a2a, 0, 3.2, 2); fireLight.position.set(F - 0.35, fhY, 0); g.add(fireLight);
    hitBox(0.14, 0.4, 0.5, F - 0.08, fhY, 0, { prompt: function () { var t = TR.t; if (!t || !t.driving) return ''; if (!t.engine) return 'Light the fire (I)'; return (TR.fireOpen ? 'Shut the firehole doors' : 'Open the firehole doors') + ' (V)  fire ' + Math.round(t.fire * 100) + '%'; },
      use: function () { var t = TR.t; if (!t.engine) { trToggleEngine(); return; } trFireDoors(); } }, g);
    u.fhDoors = doors; u.fhGlow = glow; u.fireLight = fireLight;

    // --- the builder's plate, oval brass, between the firehole and the regulator ---
    var wp = new THREE.Group(); wp.position.set(F - 0.012, 2.2, 0); wp.rotation.y = -Math.PI / 2; g.add(wp);
    var wpb = new THREE.Mesh(new THREE.CircleGeometry(0.17, 28), brass); wpb.scale.y = 0.5; wp.add(wpb);
    var wpr = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.008, 5, 28), pkPaint(0x8e6a28, 0.35, 0.8)); wpr.scale.y = 0.5; wpr.position.z = 0.002; wp.add(wpr);
    sign(['LINDENBURG', 'No. 1'], 0.24, 0.1, 0, 0, 0.004, 0, { w: 240, h: 100, bg: '#c49a45', fg: '#1d1408', flat: true }, wp);

    // --- two gauge glasses either side of the firehole: striped backing (the stripes kink the other way where the water is) ---
    var stripe = function (flip, bg, fg, n) {
      var cv = document.createElement('canvas'); cv.width = 32; cv.height = 128; var c = cv.getContext('2d');
      if (c) { c.fillStyle = bg; c.fillRect(0, 0, 32, 128); c.strokeStyle = fg; c.lineWidth = 5; for (var i = -4; i < n + 4; i++) { var y = i * 128 / n; c.beginPath(); c.moveTo(0, y); c.lineTo(32, y + (flip ? -18 : 18)); c.stroke(); } }
      var tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; return tx;
    };
    var backTex = stripe(false, '#f4f1e8', '#1b1b1b', 9), waterTex = stripe(true, '#cfe6f0', '#14232c', 6);
    var GY0 = 1.97, GH = 0.36; u.glasses = [];
    [-1, 1].forEach(function (s) {
      var gz = s * 0.42, gx = F - 0.1;
      pkBevelBox(0.07, 0.06, 0.07, brass, gx + 0.03, GY0 - 0.045, gz, g, 0.01); pkBevelBox(0.07, 0.06, 0.07, brass, gx + 0.03, GY0 + GH + 0.045, gz, g, 0.01);   // the gauge cocks
      pkRod(F, GY0 - 0.045, gz, gx + 0.03, GY0 - 0.045, gz, 0.016, brass, g, 6); pkRod(F, GY0 + GH + 0.045, gz, gx + 0.03, GY0 + GH + 0.045, gz, 0.016, brass, g, 6);
      [GY0 - 0.045, GY0 + GH + 0.045].forEach(function (cy) { pkRod(gx + 0.03, cy, gz, gx + 0.03, cy, gz - s * 0.09, 0.008, steel, g, 5); sphere(0.016, M.black, gx + 0.03, cy, gz - s * 0.095, g); });
      var back = new THREE.Mesh(new THREE.PlaneGeometry(0.05, GH), new THREE.MeshBasicMaterial({ map: backTex })); back.rotation.y = -Math.PI / 2; back.position.set(gx + 0.026, GY0 + GH / 2, gz); back.userData.noBake = true; g.add(back);
      var wg = new THREE.PlaneGeometry(0.036, 1); wg.translate(0, 0.5, 0);
      var water = new THREE.Mesh(wg, new THREE.MeshBasicMaterial({ map: waterTex })); water.rotation.y = -Math.PI / 2; water.position.set(gx + 0.002, GY0, gz); water.userData.noBake = true; g.add(water);
      var tube = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, GH, 12, 1, true), M.glass); tube.position.set(gx, GY0 + GH / 2, gz); g.add(tube);
      box(0.004, 0.008, 0.05, pkPaint(0xb02a1c, 0.5, 0.1), gx - 0.024, GY0 + GH * 0.12, gz, g);   // the lowest safe level
      [-1, 1].forEach(function (q) { pkRod(gx - 0.032, GY0 - 0.01, gz + q * 0.034, gx - 0.032, GY0 + GH + 0.01, gz + q * 0.034, 0.005, brass, g, 5); });   // the protector bars
      for (var tc = 0; tc < 3; tc++) { var ty = GY0 + 0.08 + tc * 0.1; pkRod(F, ty, gz + s * 0.09, F - 0.05, ty, gz + s * 0.09, 0.009, brass, g, 5); box(0.012, 0.012, 0.045, brass, F - 0.055, ty, gz + s * 0.09, g); }   // test cocks
      u.glasses.push(water);
    });
    TR.glassTex = waterTex;

    // --- the steam manifold (the "fountain") on the crown: four valves with their handwheels toward the driver ---
    var mY = 2.67;
    pkRoundCyl(0.04, 0.12, brass, F + 0.04, mY - 0.07, 0, g, 10);
    pkRod(F - 0.02, mY, -0.34, F - 0.02, mY, 0.34, 0.032, brass, g, 10);
    var valves = {};
    [['injL', -0.27, 'INJ'], ['blower', -0.09, 'BLOWER'], ['pump', 0.09, 'PUMP'], ['injR', 0.27, 'INJ']].forEach(function (v) {
      pkRod(F - 0.02, mY, v[1], F - 0.08, mY, v[1], 0.011, steel, g, 5); pkRoundCyl(0.02, 0.04, brass, F - 0.02, mY - 0.03, v[1], g, 8);
      valves[v[0]] = trHandwheel(0.034, F - 0.085, mY, v[1], g);
      trPlate(v[2], 0.085, 0.024, F - 0.03, mY + 0.06, v[1], -Math.PI / 2, g);
    });
    // copper pipes: the injector steam pipes run down the sides of the backhead and through the floor; the blower goes over the top to the smokebox
    [-1, 1].forEach(function (s) {
      pkRod(F - 0.02, mY, s * 0.34, F - 0.03, mY - 0.12, s * 0.58, 0.014, copper, g, 6);
      pkRod(F - 0.03, mY - 0.12, s * 0.58, F - 0.03, 1.4, s * 0.74, 0.014, copper, g, 6);
      pkRod(F - 0.05, 1.75, s * 0.7, F - 0.05, 1.38, s * 0.7, 0.018, copper, g, 6);   // and the feed water pipe from the tender
    });
    pkRod(F - 0.02, mY, -0.09, F + 0.1, mY + 0.1, -0.09, 0.012, copper, g, 5);
    u.valves = valves;
    hitBox(0.14, 0.12, 0.14, F - 0.09, mY, -0.27, { prompt: function () { return TR.t && TR.t.driving ? 'Injector, driver\'s side: ' + (TR.t.injL ? 'ON' : 'off') + ' (J)' : ''; }, use: function () { trInjector('L'); } }, g);
    hitBox(0.14, 0.12, 0.14, F - 0.09, mY, 0.27, { prompt: function () { return TR.t && TR.t.driving ? 'Injector, fireman\'s side: ' + (TR.t.injR ? 'ON' : 'off') + ' (Shift + J)' : ''; }, use: function () { trInjector('R'); } }, g);
    hitBox(0.14, 0.12, 0.14, F - 0.09, mY, -0.09, { prompt: function () { return TR.t && TR.t.driving ? 'Blower: ' + Math.round(TR.t.blower * 100) + '% (B)' : ''; }, use: function () { trBlower(); } }, g);
    hitBox(0.14, 0.12, 0.14, F - 0.09, mY, 0.09, { prompt: function () { return TR.t && TR.t.driving ? 'Air pump steam valve: open. Main reservoir ' + (TR.t.mr * 8).toFixed(1) + ' bar' : ''; }, use: function () { sfx('click'); } }, g);

    // --- the regulator: a long handle on a gland at the top of the backhead. Shut lies toward the driver; open swings it up ---
    var regG = new THREE.Group(); regG.position.set(F - 0.13, 2.46, 0); g.add(regG);
    pkRod(F, 2.46, 0, F - 0.13, 2.46, 0, 0.03, brass, g, 10); pkRoundCyl(0.055, 0.04, brass, F - 0.01, 2.46, 0, g, 14).rotation.z = Math.PI / 2;
    sphere(0.035, brass, 0, 0, 0, regG);
    pkRod(0, 0, 0, 0, -0.03, -0.36, 0.016, steel, regG, 6);
    pkRoundCyl(0.024, 0.12, grip, 0, -0.035, -0.42, regG, 10).rotation.x = Math.PI / 2;
    // the toothed quadrant it runs over
    var qd = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.013, 6, 28, 1.25), brass); qd.rotation.y = Math.PI / 2; qd.position.set(F - 0.1, 2.46, 0); g.add(qd);
    [0.08, 1.15].forEach(function (qa) { pkRod(F, 2.46 + Math.sin(qa) * 0.3, -Math.cos(qa) * 0.3, F - 0.1, 2.46 + Math.sin(qa) * 0.3, -Math.cos(qa) * 0.3, 0.01, brass, g, 5); });
    for (k = 1; k < 8; k++) { var qa2 = k / 8 * 1.25; box(0.006, 0.02, 0.006, M.black, F - 0.115, 2.46 + Math.sin(qa2) * 0.3, -Math.cos(qa2) * 0.3, g).rotation.x = qa2; }
    hitBox(0.14, 0.2, 0.5, F - 0.13, 2.5, -0.2, { prompt: function () { return TR.t && TR.t.driving ? 'Regulator: ' + Math.round(TR.t.throttle * 100) + '% (W / S)' : ''; }, use: function () { var t = TR.t; t.throttle = t.throttle >= 0.99 ? 0 : Math.min(1, t.throttle + 0.25); sfx('click'); } }, g);
    u.regH = regG;

    // --- gauges: boiler pressure big on the crown, steam chest on the fireman's side, speed and the duplex brake gauge by the driver ---
    pkRod(F, 2.46, 0.22, F - 0.04, 2.46, 0.22, 0.02, brass, g, 6);
    dials.press = trDial(g, F - 0.05, 2.46, 0.22, -Math.PI / 2, 0.12, { label: 'BOILER', unit: 'bar', max: 16, major: 2, minor: 1, red: 12 });
    pkRod(F, 2.31, 0.6, F - 0.035, 2.31, 0.6, 0.015, brass, g, 6);
    dials.chest = trDial(g, F - 0.04, 2.31, 0.6, -Math.PI / 2, 0.075, { label: 'CHEST', unit: 'bar', max: 16, major: 4, minor: 2 });
    pkRod(F, 2.27, -0.64, F - 0.035, 2.27, -0.64, 0.015, brass, g, 6);
    dials.speed = trDial(g, F - 0.04, 2.27, -0.64, -Math.PI / 2, 0.082, { label: 'SPEED', unit: 'km/h', max: 40, major: 10, minor: 5, red: 30 });
    pkRod(F, 2.07, -0.64, F - 0.035, 2.07, -0.64, 0.015, brass, g, 6);
    dials.air = trDial(g, F - 0.04, 2.07, -0.64, -Math.PI / 2, 0.082, { label: 'AIR', unit: 'bar', max: 10, major: 2, minor: 1, twin: true });

    // --- the sight-feed lubricator on the fireman's side: a brass box with two drip glasses ---
    pkBevelBox(0.07, 0.15, 0.16, brass, F - 0.035, 1.78, 0.62, g, 0.012);
    [-0.04, 0.04].forEach(function (dz) { var dg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.06, 8), M.glass); dg.position.set(F - 0.075, 1.77, 0.62 + dz, g); g.add(dg); });
    sphere(0.02, brass, F - 0.035, 1.88, 0.62, g); trPlate('LUBRICATOR', 0.12, 0.024, F - 0.075, 1.68, 0.62, -Math.PI / 2, g);
    pkRod(F - 0.035, 1.7, 0.62, F - 0.035, 1.38, 0.66, 0.009, copper, g, 5);

    // --- small levers on the backhead: the sander (driver's side, up) and the cylinder drain cocks (low), the damper (fireman's side, low) ---
    function faceLever(key, z, y, len, knob, label, ly, prompt, use) {
      pkRoundCyl(0.03, 0.03, brass, F - 0.015, y, z, g, 10).rotation.z = Math.PI / 2;
      var lv = new THREE.Group(); lv.position.set(F - 0.04, y, z); g.add(lv);
      pkRod(0, 0, 0, 0, len, 0, 0.011, steel, lv, 5); sphere(0.024, knob, 0, len + 0.01, 0, lv);
      trPlate(label, 0.12, 0.026, F - 0.012, ly, z, -Math.PI / 2, g);
      hitBox(0.12, len + 0.08, 0.12, F - 0.06, y + len / 2, z, { prompt: function () { return TR.t && TR.t.driving ? prompt() : ''; }, use: use }, g);
      u[key] = lv;
    }
    faceLever('sandLv', -0.66, 1.76, 0.12, M.black, 'SAND', 1.72, function () { return 'Sander (hold X)' + (TR.t.sand ? ': sanding' : ''); }, function () { TR.t.sandT = 2; sfx('click'); });
    faceLever('cockLv', -0.6, 1.46, 0.14, M.red, 'CYL COCKS', 1.42, function () { return 'Cylinder drain cocks: ' + (TR.t.cocks ? 'OPEN' : 'shut') + ' (K)'; }, function () { trCocks(); });
    faceLever('damperLv', 0.6, 1.46, 0.14, M.black, 'DAMPER', 1.42, function () { return 'Ashpan damper: ' + Math.round(TR.t.damper * 100) + '% open'; }, function () { var t = TR.t; t.damper = t.damper >= 0.99 ? 0 : Math.min(1, t.damper + 0.5); sfx('click'); });

    // --- the brake valve: a straight-air driver's valve on a stand pipe by the left window ---
    var bvX = -1.62, bvZ = -0.84;
    pkRod(bvX, 1.38, bvZ, bvX, 2.04, bvZ, 0.026, copper, g, 8); pkRoundCyl(0.06, 0.02, iron, bvX, 1.385, bvZ, g, 12);
    pkRoundCyl(0.075, 0.09, black, bvX, 2.08, bvZ, g, 18); pkRoundCyl(0.08, 0.012, brass, bvX, 2.13, bvZ, g, 18);
    pkRod(bvX, 2.0, bvZ, bvX + 0.3, 1.6, bvZ + 0.1, 0.014, copper, g, 6);   // the brake pipe off to the train line
    var bvq = document.createElement('canvas'); bvq.width = bvq.height = 128; var bq = bvq.getContext('2d');
    if (bq) {
      bq.fillStyle = '#c49a45'; bq.beginPath(); bq.arc(64, 64, 62, 0, 7); bq.fill(); bq.fillStyle = '#1d1408'; bq.font = 'bold 13px Arial'; bq.textAlign = 'center'; bq.textBaseline = 'middle';
      [['REL', -0.45], ['RUN', -0.2], ['SERV', 0.45], ['FULL', 1.0]].forEach(function (p) { var a = Math.PI + p[1]; bq.fillText(p[0], 64 + Math.cos(a) * 44, 64 + Math.sin(a) * 44); });
    }
    var bvTop = new THREE.Mesh(new THREE.CircleGeometry(0.078, 24), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bvq) })); bvTop.rotation.x = -Math.PI / 2; bvTop.position.set(bvX, 2.137, bvZ); g.add(bvTop);
    var bvH = new THREE.Group(); bvH.position.set(bvX, 2.15, bvZ); g.add(bvH);
    pkRoundCyl(0.022, 0.03, steel, 0, 0.0, 0, bvH, 8);
    pkRod(0, 0.012, 0, -0.26, 0.04, 0, 0.012, steel, bvH, 6); pkRoundCyl(0.02, 0.09, grip, -0.3, 0.045, 0, bvH, 10).rotation.z = Math.PI / 2;
    trPlate('BRAKE', 0.1, 0.026, bvX - 0.03, 1.94, bvZ + 0.04, -Math.PI / 2, g);
    hitBox(0.36, 0.2, 0.24, bvX - 0.14, 2.15, bvZ, { prompt: function () { return TR.t && TR.t.driving ? 'Brake valve: ' + trBrakePos() + ' (A / D)' : ''; }, use: function () { var t = TR.t; t.brake = t.brake >= 0.95 ? 0 : t.brake < 0.4 ? 0.45 : t.brake < 0.7 ? 0.8 : 1; sfx('click'); } }, g);
    u.bvH = bvH;

    // --- the reverser: a Johnson bar on the floor at the driver's left knee, with a notched quadrant ---
    var rvX = -1.98, rvY = 1.4, rvZ = -0.88;
    pkBevelBox(0.16, 0.05, 0.08, iron, rvX, rvY, rvZ, g, 0.01);
    var rvB = new THREE.Group(); rvB.position.set(rvX, rvY + 0.02, rvZ); g.add(rvB);
    pkBevelBox(0.03, 0.82, 0.025, steel, 0, 0.41, 0, rvB, 0.008);
    pkRoundCyl(0.022, 0.13, grip, 0, 0.87, 0, rvB, 10);
    pkRod(0.02, 0.8, 0, 0.02, 0.5, 0, 0.007, steel, rvB, 4); box(0.025, 0.03, 0.03, steel, 0.025, 0.79, 0, rvB);   // the latch rod and its trigger
    var qs = new THREE.Shape(), QA = 0.42, Q0 = 0.68, Q1 = 0.79, qn = 16;
    for (k = 0; k <= qn; k++) { var qa3 = -QA + 2 * QA * k / qn; if (k === 0) qs.moveTo(-Math.sin(qa3) * Q1, Math.cos(qa3) * Q1); else qs.lineTo(-Math.sin(qa3) * Q1, Math.cos(qa3) * Q1); }
    for (k = qn; k >= 0; k--) { var qa4 = -QA + 2 * QA * k / qn; qs.lineTo(-Math.sin(qa4) * Q0, Math.cos(qa4) * Q0); }
    var qp = new THREE.Mesh(new THREE.ExtrudeGeometry(qs, { depth: 0.016, bevelEnabled: false }), iron); qp.position.set(rvX, rvY + 0.02, rvZ - 0.055); qp.castShadow = true; g.add(qp);
    for (k = -6; k <= 6; k++) { var na = k / 6 * 0.38; box(0.012, 0.06, 0.006, k === 0 ? brass : M.black, rvX - Math.sin(na) * 0.76, rvY + 0.02 + Math.cos(na) * 0.76, rvZ - 0.036, g).rotation.z = na; }   // the notches
    pkRod(rvX, rvY, rvZ - 0.047, rvX, rvY + 0.69, rvZ - 0.047, 0.014, iron, g, 6);
    sign(['FWD'], 0.08, 0.03, rvX + 0.38, rvY + 0.62, rvZ - 0.036, 0, { w: 96, h: 36, bg: '#c49a45', fg: '#1d1408', flat: true }, g);
    sign(['REV'], 0.08, 0.03, rvX - 0.38, rvY + 0.62, rvZ - 0.036, 0, { w: 96, h: 36, bg: '#c49a45', fg: '#1d1408', flat: true }, g);
    hitBox(0.3, 0.4, 0.2, rvX, rvY + 0.75, rvZ, { prompt: function () { return TR.t && TR.t.driving ? 'Reverser: ' + trCutoffTxt() + ' (R forward / Shift + R back)' : ''; }, use: function () { trNotch(TR.t.cutoff >= 0.74 ? -1 : 1, true); } }, g);
    u.rvB = rvB;

    // --- the shovel: leans on the right-hand wall; a scoop swings it from the floor plate into the firehole ---
    var shG = new THREE.Group(); g.add(shG);
    pkBevelBox(0.26, 0.016, 0.22, steel, 0.12, 0, 0, shG, 0.006);
    box(0.24, 0.05, 0.012, steel, 0.12, 0.022, -0.105, shG); box(0.24, 0.05, 0.012, steel, 0.12, 0.022, 0.105, shG); box(0.012, 0.05, 0.22, steel, 0.0, 0.022, 0, shG);
    pkRod(0, 0.02, 0, -0.02, 0.86, 0, 0.016, M.woodD, shG, 6); pkRod(-0.02, 0.86, -0.06, -0.02, 0.86, 0.06, 0.014, M.woodD, shG, 6);
    var load = new THREE.Group(); shG.add(load);
    for (k = 0; k < 6; k++) { var lump = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035 + (k % 3) * 0.008, 0), M.coal); lump.position.set(0.06 + (k % 3) * 0.06, 0.03, (Math.floor(k / 3) - 0.5) * 0.09); load.add(lump); }
    load.visible = false;
    u.shovel = shG; u.shovelLoad = load; TR._shk = 0; trShovelPose(0, 0, u);
    hitBox(0.3, 0.6, 0.3, -1.8, 1.65, 0.8, { prompt: function () { return TR.t && TR.t.driving ? 'Fire a shovel of coal (G)  fire ' + Math.round(TR.t.fire * 100) + '%' : ''; }, use: function () { trScoop(false); } }, g);
    // a small heap on the floor plate under the tender's coal door, where the shovel loads
    for (k = 0; k < 9; k++) { var cl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06 + (k % 3) * 0.02, 0), M.coal); cl.position.set(-3.8 + (k % 3) * 0.12, 1.42 + (k % 2) * 0.03, (Math.floor(k / 3) - 1) * 0.16); cl.rotation.set(k, k * 2, k); g.add(cl); }

    // --- the electrics: a modern box on the right-hand wall (dynamo, doors, light) with the warning horn and the passenger-info controls ---
    var eX = -1.42, eZ = 0.975, eY = 1.75;
    pkBevelBox(0.44, 0.5, 0.05, pkPaint(0x1c2a24, 0.5, 0.42), eX, eY, eZ, g, 0.015);
    box(0.44, 0.012, 0.012, brass, eX, eY + 0.25, eZ - 0.026, g); box(0.44, 0.012, 0.012, brass, eX, eY - 0.25, eZ - 0.026, g);
    var fz = eZ - 0.03;
    function sw(key, x, txt, prompt, use) {
      var pv = new THREE.Group(); pv.position.set(x, eY + 0.1, fz); g.add(pv);
      pkRoundCyl(0.035, 0.03, brass, 0, 0, 0, pv, 12).rotation.x = Math.PI / 2;
      var lv = new THREE.Group(); pv.add(lv); pkRod(0, 0, 0, 0, 0, -0.1, 0.012, steel, lv, 6); sphere(0.022, M.red, 0, 0, -0.105, lv); u[key] = lv;
      var led = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), M.ledOff); led.position.set(0, 0.095, 0); pv.add(led); led.userData.noBake = true; u[key + 'Led'] = led;
      sign([txt], 0.12, 0.034, x, eY - 0.005, fz - 0.001, Math.PI, { w: 160, h: 44, bg: '#151a1e', fg: '#f5f2e8' }, g);
      hitBox(0.12, 0.26, 0.14, x, eY + 0.08, fz - 0.05, { prompt: function () { return TR.t && TR.t.driving ? prompt() : ''; }, use: use }, g);
    }
    sw('dynSw', eX + 0.14, 'DYNAMO', function () { return 'Turbo-generator ' + (TR.t.dynamo ? 'ON' : 'off') + ' (Y)'; }, function () { trDynamo(); });
    sw('doorSw', eX, 'DOORS', function () { return 'Wagon doors ' + (TR.t.doorsOpen ? 'open' : 'shut') + ' (U)'; }, function () { trToggleDoors(); });
    sw('lightSw', eX - 0.14, 'LIGHT', function () { return 'Cab light ' + (trCabLightLit() ? 'ON' : 'off') + ' (L)'; }, function () { trToggleCabLight(); });
    function pushBtn(x, r, mat, txt, hit) {
      var b = pkRoundCyl(r, 0.035, mat, x, eY - 0.14, fz - 0.015, g, 14); b.rotation.x = Math.PI / 2;
      var ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.01, 0.009, 6, 20), brass); ring.position.set(x, eY - 0.14, fz - 0.002); g.add(ring);
      sign([txt], 0.12, 0.034, x, eY - 0.215, fz - 0.001, Math.PI, { w: 160, h: 44, bg: '#151a1e', fg: '#f5f2e8' }, g);
      hitBox(0.12, 0.14, 0.12, x, eY - 0.14, fz - 0.04, hit, g); b.userData.rest = b.position.z; return b;
    }
    u.hornBtn = pushBtn(eX + 0.14, 0.04, M.red, 'HORN', { prompt: function () { return TR.t && TR.t.driving ? 'Warning horn (H - hold)' : ''; }, use: function () { trBlast('horn', 0.9); } });
    pushBtn(eX - 0.14, 0.032, pkPaint(0xe8e0c8, 0.5, 0.1), 'REPEAT', { prompt: function () { return TR.t && TR.t.driving ? 'Repeat passenger announcement' : ''; }, use: function () { trRepeatPassengerInfo(); } });
    var pageLever = new THREE.Group(); pageLever.position.set(eX, eY - 0.16, fz - 0.01); g.add(pageLever);
    pkRoundCyl(0.026, 0.03, brass, 0, 0, 0, pageLever, 10).rotation.x = Math.PI / 2;
    pkRod(0, 0, -0.01, 0, 0.09, -0.01, 0.01, steel, pageLever, 5); sphere(0.02, brass, 0, 0.1, -0.01, pageLever);
    sign(['PAGE'], 0.12, 0.034, eX, eY - 0.215, fz - 0.001, Math.PI, { w: 160, h: 44, bg: '#151a1e', fg: '#f5f2e8' }, g);
    hitBox(0.12, 0.16, 0.12, eX, eY - 0.12, fz - 0.04, { prompt: function () { return TR.t && TR.t.driving ? 'Passenger display: change page' : ''; }, use: function () { trTogglePassengerPage(); } }, g);
    u.pageLeverRef = pageLever;
  }

  // ── The shovel's swing: rest on the wall -> load on the floor plate -> into the firehole ──
  var TR_SHOVEL = [
    { p: [-1.8, 1.43, 0.74], r: [0.34, 0, 0] },
    { p: [-2.45, 1.44, 0.25], r: [0, 0, 1.05] },
    { p: [-1.42, 1.64, 0.02], r: [0, 0, 1.3] }
  ];
  function trShovelPose(a, b, u) {   // a, b: pose indices, the blend between them in TR._shk
    u = u || (TR.units && TR.units[0]); if (!u || !u.shovel) return; var A = TR_SHOVEL[a], B = TR_SHOVEL[b], k = TR._shk || 0, e = k * k * (3 - 2 * k);
    u.shovel.position.set(A.p[0] + (B.p[0] - A.p[0]) * e, A.p[1] + (B.p[1] - A.p[1]) * e, A.p[2] + (B.p[2] - A.p[2]) * e);
    u.shovel.rotation.set(A.r[0] + (B.r[0] - A.r[0]) * e, A.r[1] + (B.r[1] - A.r[1]) * e, A.r[2] + (B.r[2] - A.r[2]) * e);
  }

  // ── The driver's hands ────────────────────────────────────────────
  function trFireDoors(open) { TR.fireOpen = open === undefined ? !TR.fireOpen : open; trTone('square', 140, 0.08, 0.12, trHeadPos().x, trHeadPos().z, { lp: 900 }); }
  function trInjector(side) {
    var t = TR.t, k = 'inj' + side; t[k] = !t[k]; sfx('click');
    if (t[k] && t.press < 0.25) toast('The injector will not pick up below 3.5 bar', 'bad');
  }
  function trBlower() { var t = TR.t; t.blower = t.blower >= 0.99 ? 0 : Math.min(1, t.blower + 0.5); sfx('click'); }
  function trCocks() { var t = TR.t; t.cocks = !t.cocks; sfx('click'); }
  function trDynamo() { var t = TR.t; t.dynamo = !t.dynamo; sfx('click'); if (t.dynamo && t.press < 0.12) toast('No steam for the turbo-generator', 'bad'); }
  function trNotch(dir, wrap) {   // the reverser: 13 notches from full forward (75% cut-off) through mid gear to full back
    var t = TR.t, n = Math.round(t.cutoff / 0.125) + dir;
    if (wrap && n > 6) n = -6;
    n = clamp(n, -6, 6);
    if (t.v > 0.2 && n !== 0 && Math.sign(n) !== t.dir) { toast('Stop first before you put her into the other gear', 'bad'); return; }
    t.cutoff = n * 0.125; sfx('click');
  }
  function trCutoffTxt() { var c = TR.t.cutoff; return Math.abs(c) < 0.01 ? 'MID GEAR' : Math.round(Math.abs(c) * 100) + '% ' + (c > 0 ? 'FORWARD' : 'BACK'); }
  function trBrakePos() { var b = TR.t.brake; return b >= 0.95 ? 'FULL' : b < 0.02 ? 'RUNNING' : 'SERVICE ' + Math.round(b * 100) + '%'; }
  function trScoop(crew) {
    var t = TR.t, R = trState();
    if (TR._scoop > 0) return;
    if (!t.engine) { if (!crew) toast('There is no fire: light it first (I)', 'bad'); return; }
    if (R.fuel <= 0.5) { if (!crew) toast('The tender is out of coal', 'bad'); return; }
    if (!TR.fireOpen) { if (!crew) { toast('Open the firehole doors first (V)', 'bad'); return; } trFireDoors(true); TR._crewDoor = true; }
    TR._scoop = 1.1; TR._scoopDone = false;
    var p = trHeadPos(); sNoiseSafe(0.25, 0.08, 'bandpass', 1400, p);
  }
  function sNoiseSafe(dur, gain, type, freq, p) { if (!trOk()) return; var v = (TR.t.driving ? 1 : trVol(p.x, p.z)) * gain; if (v > 0.002) sNoise(AC.currentTime, dur, v, { type: type, freq: freq, fade: true }); }

  // ── The boiler ────────────────────────────────────────────────────
  // press: 0..1 of 14 bar (the safety valves lift at 12.2). glass: the water in the gauge glass, 0..1. fire: coal on the grate, 0..1.
  function trBoilerTick(dt) {
    var t = TR.t, R = trState(), crewOn = R.auto || t.fireman, attended = t.driving || crewOn;
    if (crewOn) trCrewTick(dt);
    if (t.engine && t.fire <= 0.003) { t.engine = false; t.fire = 0; toast('The fire has gone out', 'bad'); }
    if (t.sandT > 0) t.sandT -= dt;
    var gear = Math.abs(t.cutoff) / 0.75, spF = Math.min(1, Math.abs(t.v) / 6);
    var exhaust = t.throttle * gear * Math.min(1, Math.abs(t.v) / 2.5) * (t.press > 0.1 ? 1 : 0);
    var blow = t.press > 0.06 ? t.blower : 0;
    var draught = Math.min(1.3, (0.12 + 0.55 * blow + 0.9 * exhaust) * (0.3 + 0.7 * t.damper) * (TR.fireOpen ? 0.8 : 1));
    var burn = t.engine ? t.fire * draught * 0.008 : 0;
    var eff = (TR.fireOpen ? 0.62 : 1) * (t.fire > 0.85 ? 0.8 : 1) * (t.fire < 0.12 ? 0.75 : 1) * (t.greenT > 0 ? 0.85 : 1);
    t.fire = Math.max(0, t.fire - burn * dt); t.draught = draught;
    var made = burn * 9 * eff * (t.glass > 0.04 ? 1 : 0.2);
    // steam out: the cylinders (only out of mid gear), the cocks, the blower, the injectors, the air pump, the dynamo, the whistle, and what leaks away
    var cyl = t.throttle * t.press * gear * (0.25 + spF) * 0.032;
    if (t.cocks) cyl += t.throttle * t.press * 0.005;
    var pumpOn = t.mr < 0.97 && t.press > 0.12, inj = (t.injL ? 1 : 0) + (t.injR ? 1 : 0);
    var used = cyl + blow * 0.004 * t.press + inj * 0.004 * (t.press > 0.25 ? 1 : 0.3) + (pumpOn ? 0.0025 * t.press : 0) + (t.dynamo && t.press > 0.12 ? 0.0008 : 0) + ((t.whistleKey || t.whistleAuto > 0) ? 0.004 : 0) + 0.0012 * t.press;
    if (t.press > 0.872) { if (!t.safety && attended) toast('Blowing off: the safety valves have lifted', ''); t.safety = true; } else if (t.press < 0.85) t.safety = false;
    if (!attended) { made = Math.min(made, used); t.safety = false; }   // stabled: she simmers, the shed staff keep an eye on her
    if (t.safety) used += 0.03;
    t.press = clamp(t.press + (made - used) * dt, 0, 1);
    // water: what boils off leaves the glass; the injectors put it back from the tender (and cool the boiler a little)
    if (attended) t.glass -= made * 0.3 * dt;
    if (inj) {
      if (t.press > 0.25 && R.water > 0) { t.glass += inj * 0.01 * dt; R.water = Math.max(0, R.water - inj * 0.12 * dt); t.press = Math.max(0, t.press - inj * 0.0015 * dt); }
      else { R.water = Math.max(0, R.water - inj * 0.06 * dt); }   // not picking up: it all goes out of the overflow
    }
    if (t.glass > 0.995 && inj) { t.glass = 1; }
    t.glass = clamp(t.glass, 0, 1);
    t.priming = t.glass > 0.93;
    t.lowT -= dt;
    if (attended && t.engine && t.glass < 0.18 && t.lowT <= 0) { t.lowT = 12; toast('The water is low in the glass: put an injector on (J)', 'bad'); }
    if (t.engine && t.glass < 0.05) {
      t.engine = false; t.fire = 0; R.wear = 100; t.press = Math.min(t.press, 0.4);
      toast('Low water: the fusible plug has melted and put the fire out. She needs the depot', 'bad'); logEvent('The locomotive dropped her fusible plug', 'bad');
    }
    // the cylinders: cold ones fill with condensate, which must go out of the drain cocks before she is worked hard
    var working = cyl > 0.002 && Math.abs(t.v) > 0.2;
    if (working) t.cylCold = Math.max(0, t.cylCold - dt / (t.cocks ? 10 : 25)); else if (t.throttle < 0.02 && Math.abs(t.v) < 0.1) t.cylCold = Math.min(1, t.cylCold + dt / 240);
    t.knockT -= dt;
    if (working && !t.cocks && t.cylCold > 0.4 && t.knockT <= 0) {
      t.knockT = 1.4; R.wear = Math.min(100, R.wear + 0.6);
      var p = trHeadPos(); trTone('square', 70, 0.09, 0.5, p.x, p.z, { lp: 400 });
      if (t.driving && !t.knockWarned) { t.knockWarned = true; toast('Water in the cylinders: open the drain cocks (K) until she is warm', 'bad'); }
    }
    if (t.cylCold < 0.2) t.knockWarned = false;
    t.greenT -= dt;
    // the shovel
    if (TR._scoop > 0) {
      TR._scoop -= dt; var ph = 1 - TR._scoop / 1.1, u = TR.units[0];
      if (ph < 0.35) { TR._shk = ph / 0.35; trShovelPose(0, 1); u.shovelLoad.visible = ph > 0.28; }
      else if (ph < 0.65) { TR._shk = (ph - 0.35) / 0.3; trShovelPose(1, 2); u.shovelLoad.visible = true; }
      else { TR._shk = (ph - 0.65) / 0.35; trShovelPose(2, 0); u.shovelLoad.visible = false;
        if (!TR._scoopDone) {
          TR._scoopDone = true; t.fire = Math.min(1.1, t.fire + 0.07); R.fuel = Math.max(0, R.fuel - 0.6); t.greenT = 7;
          var fp = trWorldOf(u, new THREE.Vector3(-1.3, 1.66, 0)); burst(fp.x, 1.7 + (u.g.position.y || 0), fp.z, 0xff9a3a, 8, 'up');
          trTone('triangle', 180, 0.1, 0.25, fp.x, fp.z, { f1: 120 }); sNoiseSafe(0.18, 0.12, 'lowpass', 700, fp);
          if (t.fire > 0.9 && t.driving && !t.overWarned) { t.overWarned = true; toast('That is a heavy fire: she will smoke and steam poorly until it burns through', ''); }
          if (t.fire < 0.7) t.overWarned = false;
        }
      }
      if (TR._scoop <= 0) { TR._scoop = 0; TR._shk = 0; trShovelPose(0, 0); u.shovelLoad.visible = false; if (TR._crewDoor) { TR._crewDoor = false; trFireDoors(false); } }
    }
  }
  // the brake: a straight-air valve. The cylinders follow the handle with a lag; with too little air in the main reservoir they
  // cannot be released (and the pump needs steam to make air)
  function trBrakeTick(dt) {
    var t = TR.t, target = t.brake;
    if (t.mr < 0.45) target = Math.max(target, 1 - t.mr / 0.45);
    var rate = target > t.bc ? (target >= 0.95 ? 3 : 1.2) : 0.45;
    var before = t.bc; t.bc += clamp(target - t.bc, -rate * dt, rate * dt);
    if (t.bc > before) t.mr = Math.max(0, t.mr - (t.bc - before) * 0.06);
    if (t.mr < 0.97 && t.press > 0.12) { t.mr = Math.min(1, t.mr + dt * 0.04 * Math.min(1, t.press / 0.5)); t.pumpOn = true; } else t.pumpOn = false;
    return t.bc;
  }
  // tractive effort from the steam in the chest and the cut-off; past what the rail will hold, the drivers slip
  function trTractive(thr, dt) {
    var t = TR.t, R = trState(), gear = Math.abs(t.cutoff) / 0.75;
    if (gear < 0.05 || t.press < 0.12 || thr < 0.005) { t.slip = Math.max(0, t.slip - dt * 2); return 0; }
    var spF = Math.min(1, Math.abs(t.v) / 6);
    var f = thr * (t.press / 0.857) * Math.min(1, gear * 1.6) * (1 - 0.45 * spF * gear) * 1.25;
    if (t.priming) f *= 0.5; if (t.cocks) f *= 0.88; f *= (1 - R.wear / 220);
    var sanding = t.sand || t.sandT > 0, grip = (sanding ? 1.6 : 1.1) * (Math.abs(t.v) < 3 ? 1 : 1.4);
    if (f > grip) { if (t.slip < 0.05 && t.driving) toast('She is slipping: ease the regulator or sand the rail (X)', 'bad'); t.slip = Math.min(1, t.slip + dt * 3); }
    else if (f < grip * 0.85) t.slip = Math.max(0, t.slip - dt * 2);
    if (t.slip > 0.3) f = grip * 0.35;
    return f;
  }

  // ── The fireman: the hired crew (AUTO) or the player's mate (N) keeps the fire, the water and the cocks ──
  function trCrewTick(dt) {
    var t = TR.t, R = trState();
    if (!t.engine && R.wear < 100 && R.fuel > 1 && t.glass > 0.1) trToggleEngine();
    TR._crewT = (TR._crewT || 0) - dt; if (TR._crewT > 0) return; TR._crewT = 0.5;
    var hard = t.throttle > 0.3 && Math.abs(t.v) > 0.5;
    var want = hard ? 0.65 : 0.45;
    if (t.fire < want && t.press < 0.86 && !TR._scoop) trScoop(true);
    if (TR.fireOpen && !TR._scoop) trFireDoors(false);   // a fireman keeps the doors shut between rounds: cold air through them kills the steaming
    if (t.press > 0.3 && t.glass < (hard ? 0.55 : 0.5)) { if (!t.injL) t.injL = true; }
    else if (t.glass > 0.75 || t.press < 0.22) { if (t.injL) t.injL = false; }
    if (t.injR && t.glass > 0.75) t.injR = false;
    if (t.glass < 0.25 && t.press > 0.3) t.injR = true;
    t.blower = (t.throttle < 0.05 && t.press < 0.84) || (Math.abs(t.v) < 0.3 && t.press < 0.8) ? 0.5 : 0;
    if (t.damper < 0.5) t.damper = 1;
    if (R.auto) {
      if (t.cylCold > 0.25 && !t.cocks) t.cocks = true; else if (t.cylCold < 0.05 && t.cocks) t.cocks = false;
      var cw = Math.abs(t.v) < 2 ? 0.75 : Math.abs(t.v) < 5 ? 0.5 : 0.375; if (!(t.dir < 0 && t.v > 0.2)) t.cutoff = cw;   // AUTO only runs forward
      t.dynamo = true;
    }
  }

  // ── The footplate, animated ───────────────────────────────────────
  function trFootplateAnim(dt, lo, run) {
    var t = TR.t, R = trState(), M = trMats(), k = Math.min(1, dt * 10), D = TR.dials;
    if (lo.regH) lo.regH.rotation.x += (t.throttle * 1.15 - lo.regH.rotation.x) * k;
    if (lo.rvB) lo.rvB.rotation.z += (-t.cutoff / 0.75 * 0.38 - lo.rvB.rotation.z) * k;
    if (lo.bvH) lo.bvH.rotation.y += ((t.brake >= 0.95 ? 1.0 : -0.2 + t.brake * 0.75) - lo.bvH.rotation.y) * k;
    if (lo.valves) {
      lo.valves.injL.rotation.x += ((t.injL ? -2.4 : 0) - lo.valves.injL.rotation.x) * k * 0.6;
      lo.valves.injR.rotation.x += ((t.injR ? -2.4 : 0) - lo.valves.injR.rotation.x) * k * 0.6;
      lo.valves.blower.rotation.x += (-t.blower * 3 - lo.valves.blower.rotation.x) * k * 0.6;
      lo.valves.pump.rotation.x = -1.2;
    }
    if (lo.sandLv) lo.sandLv.rotation.x = (t.sand || t.sandT > 0) ? 0.5 : 0;
    if (lo.cockLv) lo.cockLv.rotation.x = t.cocks ? -0.6 : 0.4;
    if (lo.damperLv) lo.damperLv.rotation.x = 0.5 - t.damper;
    // the firehole doors slide apart; the fire shows through them, as bright as the draught makes it
    if (lo.fhDoors) { var op = TR.fireOpen ? 1 : 0; lo.fhDoors.forEach(function (d, i) { var s = i ? 1 : -1, tz = s * (0.1 + 0.2 * op); d.position.z += (tz - d.position.z) * Math.min(1, dt * 7); }); }
    var lit = t.engine && t.fire > 0.003, now = performance.now();
    var heat = lit ? clamp(0.25 + t.fire * 0.6 + (t.draught || 0) * 0.5, 0, 1.3) : 0;
    var fl = 0.88 + Math.sin(now / 95) * 0.08 + Math.sin(now / 37) * 0.05;
    if (lo.fhGlow) {
      var c = lo.fhGlow.material.color;
      var gb = Math.min(1, 0.4 + heat * 0.55) * fl;
      if (!lit) c.setHex(0x0c0806);
      else if (t.greenT > 4) c.setRGB(0.5 * fl, 0.24 * fl, 0.16 * fl);              // fresh coal: dark and smoky
      else c.setRGB(gb, gb * 0.88, gb * 0.8);
    }
    if (lo.fireLight) lo.fireLight.intensity = lit ? heat * fl * (TR.fireOpen ? 1.8 : 0.4) : 0;
    // the glasses
    if (lo.glasses) { var lv = Math.max(0.002, t.glass); lo.glasses.forEach(function (w) { w.scale.y = 0.36 * lv; }); if (TR.glassTex) TR.glassTex.repeat.y = lv; }
    // the gauges
    if (D) {
      if (D.press) trDialSet(D.press.n1, D.press, t.press * 14);
      if (D.chest) trDialSet(D.chest.n1, D.chest, t.press * 14 * t.throttle * (Math.abs(t.cutoff) > 0.01 ? 1 : 0.9));
      if (D.speed) trDialSet(D.speed.n1, D.speed, Math.abs(t.v) * 3.6 + (Math.abs(t.v) > 0.2 ? Math.sin(now / 160) * 0.15 : 0));
      if (D.air) { trDialSet(D.air.n2, D.air, t.mr * 8); trDialSet(D.air.n1, D.air, t.brake >= 0.95 && t.bc > 0.9 ? 0 : 5 * Math.min(1, t.mr / 0.6) - 1.6 * t.bc); }
    }
    // the electrics
    var power = t.dynamo && t.press > 0.12, cabLit = trCabLightLit() && power;
    if (lo.dynSw) {
      lo.dynSw.rotation.x = t.dynamo ? 0.6 : -0.6; lo.doorSw.rotation.x = t.doorsOpen ? 0.6 : -0.6; lo.lightSw.rotation.x = trCabLightLit() ? 0.6 : -0.6;
      lo.dynSwLed.material = power ? M.ledGreen : M.ledOff; lo.doorSwLed.material = t.doorsOpen ? M.ledAmber : M.ledOff; lo.lightSwLed.material = cabLit ? M.ledAmber : M.ledOff;
    }
    if (lo.hornBtn) lo.hornBtn.position.z = lo.hornBtn.userData.rest + ((t.hornKey || t.hornAuto > 0) ? 0.012 : 0);
    if (lo.cord) lo.cord.position.y = 3.55 - ((t.whistleKey || t.whistleAuto > 0) ? 0.12 : 0);
    if (lo.cabLight) lo.cabLight.intensity = cabLit ? 2.1 : 0;
    if (lo.cabBulb && lo.cabBulbOn) lo.cabBulb.material = cabLit ? lo.cabBulbOn : lo.cabBulbOff;
    lo.lamp.material.color.setHex(power && (S.time < 7 || S.time > 18.5) ? 0xfff0b0 : 0x55503a);
    if (lo.clockH) { var hr12 = S.time % 12; lo.clockH.rotation.z = -hr12 / 12 * Math.PI * 2; lo.clockM.rotation.z = -(S.time % 1) * Math.PI * 2; }
    // a slipping engine spins her drivers
    if (t.slip > 0.3 && lo.drivers) lo.drivers.forEach(function (dv) { dv.w.rotation.z -= dt * 14 * t.slip * (t.dir >= 0 ? 1 : -1); });
    // steam and noise: the safety valves, the drain cocks, the injectors, the blower, the pump
    TR._fxT = (TR._fxT || 0) - dt; if (TR._fxT > 0) return; TR._fxT = 0.2;
    var hp = trHeadPos(), inside = t.driving;
    if (t.safety) { var sv = trWorldOf(lo, new THREE.Vector3(-0.4, 3.1, 0)); burst(sv.x, 3.3, sv.z, 0xffffff, 5, 'up'); sNoiseSafe(0.3, 0.16, 'highpass', 2600, hp); }
    if (t.cocks && t.press > 0.1 && (t.throttle > 0.03 || Math.abs(t.v) > 0.3)) [-1, 1].forEach(function (s) { var cp = trWorldOf(lo, new THREE.Vector3(4.05, 0.8, s * 1.05)); burst(cp.x, 0.75, cp.z, 0xf4f6f8, 3, 'smoke'); });
    if (t.cocks && t.press > 0.1 && t.throttle > 0.03) sNoiseSafe(0.25, 0.06, 'highpass', 3200, hp);
    if ((t.injL || t.injR) && t.press > 0.25) sNoiseSafe(0.24, inside ? 0.035 : 0.012, 'bandpass', 2900, hp);
    if ((t.injL || t.injR) && t.press <= 0.25) { var ov = trWorldOf(lo, new THREE.Vector3(-1.6, 0.9, -1.05)); burst(ov.x, 0.9, ov.z, 0xe8eef2, 2, 'down'); }
    if (t.blower > 0 && t.press > 0.06) sNoiseSafe(0.24, (inside ? 0.03 : 0.015) * t.blower, 'lowpass', 900, hp);
    TR._pumpT = (TR._pumpT || 0) - 0.2;
    if (t.pumpOn && TR._pumpT <= 0) { TR._pumpT = 0.8; trTone('sine', 62, 0.14, 0.18, hp.x, hp.z, { f1: 45 }); sNoiseSafe(0.12, 0.05, 'lowpass', 500, hp); }
    if (t.priming && Math.abs(t.v) > 0.3) { var ch = trWorldOf(lo, lo.chimney); burst(ch.x, 3.9, ch.z, 0xf4f8fb, 3, 'up'); }
  }
