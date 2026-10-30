//@ Park Co, part 47: TOW-1, the railway's electric rescue tug. A train that dies out on the line (a cold fire, no coal or
//@ water, a breakdown) has no way back to the depot on her own: TOW-1 lives on its own spur east of the shed, on charge,
//@ and the player climbs in, drives it out along the siding and the main line, couples to either end of the train and
//@ hauls or shoves her home through the points into the shed. A small yellow shunter with a glazed cab full of a
//@ railway nerd's gear: three live screens (the battery, the drive, a map of the line with the train on it), rows of
//@ toggles, a laptop, a mug and a rubber duck.
(function () {
  var TG = { built: false, mode: 'S', s: 0, v: 0, face: -1, dir: 0, ctlPos: 0, master: true, headOn: true, beaconOn: true, estop: false, amps: 0, driving: false, coupled: false, off: 0, bay: true, look: { yaw: 0, pitch: -0.12 },
    batt: 100, beaconA: 0, scrT: 0, g: null, HL: 1.85 };
  var TG_MAX = 4.5, TG_MAX_TOW = 2.2, TG_SPUR_X0 = 100;

  // ── Where it runs ─────────────────────────────────────────────────
  // The spur leaves the depot siding at x 100 (east of the shed) and swings 3.2 m north onto a straight that ends at a
  // buffer stop. Its own coordinate runs from the junction (0) to the stop; below 0 the tug is back on the siding.
  function tgBuildSpur() {
    var P = TR.byp, bi = 0, best = 1e9;
    for (var i = 0; i < P.n; i++) { var d = Math.abs(P.x[i] - TG_SPUR_X0); if (d < best) { best = d; bi = i; } }
    TG.sJ = bi * P.ds;                                        // the junction on the siding, in the siding's own metres
    var jx = P.x[bi], jz = P.z[bi], pts = [];
    for (var x = jx; x <= jx + 26.01; x += 0.5) { var f = clamp((x - jx) / 16, 0, 1); f = f * f * (3 - 2 * f); pts.push([x, jz - 3.2 * f]); }
    TR.spur = trResample(pts, false);
  }
  // the tug's place: on the spur ('S'), or on the railway in the train's own coordinates ('M' the main loop, 'D' through
  // the depot). Off the spur's near end it is on the siding.
  function tgSamp(mode, s, o) {
    if (mode === 'S') { if (s < 0) return trPos(TR.sJ1 + TG.sJ + s, 'D', o); return trSamp(TR.spur, s, o); }
    return trPos(s, mode, o);
  }
  // a position in one coordinate given in another, or null when there is no such place (the siding is not on the main)
  function tgConv(s, from, to) {
    if (from === to) return s;
    if (from === 'S') { if (s >= 0) return null; s = TR.sJ1 + TG.sJ + s; from = 'D'; if (to === 'D') return s; }
    if (from === 'M' && to === 'D') { if (s < TR.sJ1) return s; if (s > TR.sJ2) return s + TR.dL; return null; }
    if (from === 'D' && to === 'M') { if (s < TR.sJ1) return s; if (s > TR.sJ1 + TR.byp.L) return s - TR.dL; return null; }
    return null;
  }
  function tgWrap(d, mode) { var L = trLoopLen(mode); d = ((d % L) + L) % L; return d > L / 2 ? d - L : d; }
  // the gaps to the train: ahead of her nose, and behind her tail (in the train's coordinates)
  function tgGaps() {
    var t = TR.t, ts = tgConv(TG.s, TG.mode, t.mode); if (ts === null) return null;
    return { s: ts, nose: tgWrap(ts - TG.HL - t.s, t.mode), tail: tgWrap((t.s - TR.len) - (ts + TG.HL), t.mode) };
  }
  // coupled, the tug rides on the train: off metres from her nose, in her coordinates, crossing the points ahead of her
  function tgFollow() {
    var t = TR.t, R = trState(), s = t.s + TG.off, mode = t.mode;
    if (mode === 'M' && R.points === 'depot') {
      if (TG.off > 0 && t.s < TR.sJ1 && s >= TR.sJ1) mode = 'D';                                   // leading into the siding
      else if (TG.off < 0 && t.s - TR.len >= TR.sJ2 && s < TR.sJ2) { mode = 'D'; s += TR.dL; }    // leading backwards into it
    }
    TG.mode = mode; TG.s = s;
  }

  // ── The model ─────────────────────────────────────────────────────
  function tgScreen(w, h, pw, ph) {
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h; var tx = new THREE.CanvasTexture(cv);
    var m = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshBasicMaterial({ map: tx })); m.userData.noBake = true;
    return { cv: cv, c: cv.getContext('2d'), tex: tx, m: m };
  }
  function tgBuild() {
    var M = trMats(), P = pkMats(), g = trDyn(); TG.g = g;
    var yellow = pkPaint(0xf2b522, 0.45, 0.25), black = M.black, iron = M.iron, haz = pkStripes('#f0c04a', '#1b1b1b');
    var glass = std({ color: 0x9fc6cc, roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.28 });
    // the frame, the buffers and a coupling hook at each end, four wheels in axleboxes
    pkBevelBox(3.7, 0.2, 1.7, black, 0, 0.78, 0, g, 0.02);
    [-1, 1].forEach(function (e) {
      box(0.12, 0.34, 1.9, haz, e * 1.86, 0.84, 0, g);
      [-0.55, 0.55].forEach(function (z) { var bf = pkRoundCyl(0.08, 0.22, iron, e * 2.0, 0.9, z, g, 8); bf.rotation.z = Math.PI / 2; pkRoundCyl(0.15, 0.04, iron, e * 2.11, 0.9, z, g, 10).rotation.z = Math.PI / 2; });
      box(0.3, 0.08, 0.12, iron, e * 2.05, 0.9, 0, g); box(0.06, 0.18, 0.12, iron, e * 2.2, 0.86, 0, g);
    });
    TG.wheels = [];
    [-1, 1].forEach(function (s) { [-1.1, 1.1].forEach(function (x) { TG.wheels.push(trWheel(0.3, black, black, g, x, 0.55, s * 0.72, 6)); pkBevelBox(0.22, 0.22, 0.14, black, x, 0.55, s * 0.88, g, 0.02); }); });
    [-1.1, 1.1].forEach(function (ax) { pkRoundCyl(0.045, 1.6, iron, ax, 0.55, 0, g, 8).rotation.x = Math.PI / 2; });
    // the hoods: battery boxes front and back, yellow with black-and-yellow ends and the charge socket
    [[1.25, 1.1], [-1.4, 0.8]].forEach(function (h) {
      pkBevelBox(h[1], 0.82, 1.5, yellow, h[0], 1.29, 0, g, 0.06);
      for (var v = 0; v < 4; v++) box(h[1] - 0.2, 0.03, 0.02, black, h[0], 1.08 + v * 0.13, 0.76, g);
    });
    pkRoundCyl(0.08, 0.06, iron, -1.82, 1.3, 0.4, g, 10).rotation.z = Math.PI / 2;
    // the cab: a glazed box in the middle with a white roof, an amber beacon, an LED bar and an aerial
    var cx0 = -0.95, cx1 = 0.65, cH = 2.75, cw = 1.6, ccx = (cx0 + cx1) / 2;
    box(cx1 - cx0, 0.08, cw, pkPaint(0x2b3238, 0.6, 0.3), ccx, 0.92, 0, g);                       // the floor
    [[cx0, -cw / 2], [cx0, cw / 2], [cx1, -cw / 2], [cx1, cw / 2]].forEach(function (c) { box(0.08, cH - 0.9, 0.08, yellow, c[0], 0.9 + (cH - 0.9) / 2, c[1], g); });
    [-1, 1].forEach(function (s) { box(cx1 - cx0, 0.55, 0.05, yellow, ccx, 1.2, s * cw / 2, g); box(cx1 - cx0 - 0.1, 1.1, 0.02, glass, ccx, 2.0, s * cw / 2, g); });
    [cx0, cx1].forEach(function (x) { box(0.05, 0.55, cw, yellow, x, 1.2, 0, g); box(0.02, 1.1, cw - 0.1, glass, x, 2.0, 0, g); });
    pkBevelBox(cx1 - cx0 + 0.2, 0.1, cw + 0.2, pkPaint(0xf2f2ee, 0.5, 0.1), ccx, cH, 0, g, 0.03);
    pkRoundCyl(0.11, 0.06, black, ccx, cH + 0.08, 0, g, 12);
    var beaconM = std({ color: 0xff9a1a, roughness: 0.3, transparent: true, opacity: 0.85, emissive: 0xff8a00, emissiveIntensity: 0.4 });
    var beacon = pkRoundCyl(0.1, 0.16, beaconM, ccx, cH + 0.19, 0, g, 12); beacon.userData.noBake = true; TG.beacon = beaconM;
    TG.beaconSpin = new THREE.Group(); TG.beaconSpin.position.set(ccx, cH + 0.19, 0); g.add(TG.beaconSpin);
    box(0.02, 0.1, 0.16, std({ color: 0xffffff, emissive: 0xffc060, emissiveIntensity: 1 }), 0.08, 0, 0, TG.beaconSpin).userData.noBake = true;
    box(0.06, 0.06, 1.1, black, cx1 + 0.08, cH - 0.05, 0, g); box(0.02, 0.04, 1.0, std({ color: 0xffffff, emissive: 0xdfe8ff, emissiveIntensity: 0.6 }), cx1 + 0.11, cH - 0.05, 0, g);
    pkRod(cx0 + 0.1, cH + 0.05, -0.6, cx0 + 0.1, cH + 0.75, -0.6, 0.01, black, g, 4); sphere(0.025, M.brass, cx0 + 0.1, cH + 0.77, -0.6, g);
    // headlights at both ends, and the tug's name
    [-1, 1].forEach(function (e) { [-0.5, 0.5].forEach(function (z) { var hl = pkRoundCyl(0.09, 0.05, std({ color: 0xfffbe8, emissive: 0xfff2c0, emissiveIntensity: 0.9 }), e * 1.83 + (e > 0 ? -0.02 : 0.28), 1.5, z, g, 12); hl.rotation.z = Math.PI / 2; }); });
    [-1, 1].forEach(function (s) { sign(['TOW-1'], 0.62, 0.2, 1.25, 1.45, s * 0.77, s > 0 ? 0 : Math.PI, { w: 256, h: 80, bg: '#1b1b1b', fg: '#f2b522' }, g); });
    // inside: a modern shunter's driving position. The driver's seat on its pedestal; a sloped desk in front with a lit
    // fascia (the key, the direction switch, the lights, an LED readout and three gauges, the warning lights, the coupler,
    // the horn and the route, the emergency stop); the master controller at the right hand on its own quadrant; a display
    // in a hood over the desk with the line map and the drive; a radio handset and an extinguisher on the back wall.
    var seat = std({ color: 0x23262b, roughness: 0.8 }), frame = std({ color: 0x3a4048, roughness: 0.55, metalness: 0.35 });
    pkBevelBox(0.5, 0.11, 0.48, seat, -0.45, 1.42, -0.15, g, 0.05); pkBevelBox(0.11, 0.66, 0.48, seat, -0.71, 1.78, -0.15, g, 0.05);
    pkBevelBox(0.11, 0.18, 0.4, seat, -0.71, 2.18, -0.15, g, 0.05);                                  // the headrest
    [-1, 1].forEach(function (s) { pkBevelBox(0.36, 0.05, 0.07, seat, -0.5, 1.62, -0.15 + s * 0.27, g, 0.02); });   // armrests
    pkRoundCyl(0.05, 0.42, frame, -0.45, 1.16, -0.15, g, 10); pkRoundCyl(0.2, 0.03, frame, -0.45, 0.97, -0.15, g, 14);
    box(0.95, 0.012, 1.3, std({ color: 0x15171a, roughness: 0.95 }), -0.25, 0.965, 0, g);           // the rubber floor mat
    // the desk: a carcass under a sloped top, and the fascia set into it facing the driver
    pkBevelBox(0.36, 0.6, 1.3, frame, 0.42, 1.26, -0.12, g, 0.03);
    var P = pkCtlPanel({
      w: 1.0, h: 0.42, x: 0.25, y: 1.62, z: -0.15, ry: -Math.PI / 2, tilt: -1.0, parent: g, key: 'pk-tow1-desk',
      paint: function (c, W, H) { c.fillStyle = '#2b3036'; c.fillRect(0, 0, W, H); for (var i = 0; i < 2600; i++) { c.fillStyle = 'rgba(255,255,255,' + randf(0.01, 0.035) + ')'; c.fillRect(Math.random() * W, Math.random() * H, randf(1, 14), 1); } },
      draw: function (c, W, H) {
        var R = pkCtlRuler(W, H, 1.0, 0.42); R.c = c;
        R.box(-0.36, 0.0, 0.25, 0.38, 'rgba(255,255,255,0.18)'); R.box(0.0, 0.0, 0.42, 0.38, 'rgba(255,255,255,0.18)'); R.box(0.35, 0.0, 0.26, 0.38, 'rgba(255,255,255,0.18)');
        R.engrave('MASTER', -0.43, 0.17, 0.018); R.engrave('DIRECTION', -0.3, 0.17, 0.018);
        R.txt('R   N   F', -0.3, 0.035, 0.014, '#9fb0bc');
        R.engrave('HEAD', -0.43, -0.17, 0.016); R.engrave('BEACON', -0.3, -0.17, 0.016);
        R.engrave('BRAKE', -0.12, -0.185, 0.015); R.engrave('BATTERY', 0.0, -0.185, 0.015); R.engrave('MOTOR', 0.12, -0.185, 0.015);
        R.engrave('COUPLER', 0.25, -0.02, 0.014); R.engrave('HORN', 0.35, -0.02, 0.014); R.engrave('ROUTE', 0.45, -0.02, 0.014);
        R.engrave('EMERGENCY', 0.3, -0.185, 0.014);
        R.txt('TOW-1  LINDENBURG RAILWAY', 0.0, 0.192, 0.013, '#f2b522', 'center', '700');
      }
    });
    TG.desk = P;
    TG.ctl = {};
    TG.ctl.key = pkCtlKey(P, -0.43, 0.09, { id: 'key', label: 'Master switch', on: true, act: function (on) { TG.master = on; } });
    TG.ctl.dir = pkCtlRotary(P, -0.3, 0.09, { id: 'dir', n: 3, pos: 1, prompt: 'Direction switch', names: ['REVERSE', 'NEUTRAL', 'FORWARD'], act: function (p) { TG.dir = p - 1; } });
    TG.ctl.head = pkCtlToggle(P, -0.43, -0.09, { id: 'head', on: true, prompt: 'Headlights', act: function (on) { TG.headOn = on; } });
    TG.ctl.beacon = pkCtlToggle(P, -0.3, -0.09, { id: 'beacon', on: true, prompt: 'Beacon', act: function (on) { TG.beaconOn = on; } });
    TG.ctl.read = pkCtlReadout(P, 0.0, 0.1, 0.38, 0.13, {});
    TG.ctl.gBrake = pkCtlGauge(P, -0.12, -0.08, { r: 0.058, label: 'BAR', min: 0, max: 5, unit: 'bar', dial: 'black', get: function () { return clamp((TG.brakeK || 0), 0, 1); } });
    TG.ctl.gBatt = pkCtlGauge(P, 0.0, -0.08, { r: 0.058, label: '%', min: 0, max: 100, unit: '%', red: 20, dial: 'black', get: function () { return TG.batt / 100; } });
    TG.ctl.gAmp = pkCtlGauge(P, 0.12, -0.08, { r: 0.058, label: 'A', min: 0, max: 400, unit: 'A', dial: 'black', get: function () { return clamp(TG.amps / 400, 0, 1); } });
    TG.ctl.ann = {};
    [['COUPLED', 0.25, '#5fd38d'], ['ON TOW', 0.335, '#f0c04a'], ['BATT LOW', 0.42, '#ff6a3a']].forEach(function (a) { TG.ctl.ann[a[0]] = pkCtlAnnun(P, a[1], 0.15, 0.075, 0.045, a[0], { col: a[2] }); });
    TG.ctl.couple = pkCtlBtn(P, 0.25, 0.06, { id: 'couple', label: 'COUPLER', col: 'blue', r: 0.03, lampCol: 0x4aa8ff, prompt: 'Coupler: couple or uncouple (C)', act: function () { tgCouple(); } });
    TG.ctl.horn = pkCtlBtn(P, 0.35, 0.06, { id: 'horn', label: 'HORN', col: 'amber', r: 0.03, lampCol: 0xffd23a, prompt: 'Horn (H)', act: function () { tgHorn(); } });
    TG.ctl.route = pkCtlBtn(P, 0.45, 0.06, { id: 'route', label: 'ROUTE', col: 'white', r: 0.03, lampCol: 0xffffff, prompt: 'Route: into the bay or out along the line (P)', act: function () { tgRoute(); } });
    TG.ctl.stop = pkCtlMushroom(P, 0.38, -0.1, { r: 0.05, prompt: 'Emergency stop', act: function () { TG.estop = true; }, release: function () { TG.estop = false; } });
    // the master controller: a T handle on a quadrant at the right hand. Back is brake, the middle coast, forward power
    var mc = new THREE.Group(); mc.position.set(-0.12, 1.5, 0.42); g.add(mc);
    pkBevelBox(0.42, 0.14, 0.2, frame, 0, 0, 0, mc, 0.02);
    var qd = pkCtlFace('pk-tow1-mc', 0.4, 0.18, function (c, W, H) { c.fillStyle = '#1b1f23'; c.fillRect(0, 0, W, H); c.font = '700 ' + Math.round(H * 0.24) + 'px Bahnschrift, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
      [['B', 0.08, '#ff6a3a'], ['0', 0.38, '#e4ebef'], ['1', 0.53, '#5fd38d'], ['2', 0.66, '#5fd38d'], ['3', 0.79, '#5fd38d'], ['4', 0.92, '#5fd38d']].forEach(function (n) { c.fillStyle = n[2]; c.fillText(n[0], n[1] * W, H * 0.3); });
      c.fillStyle = '#0a0c0e'; c.fillRect(W * 0.05, H * 0.55, W * 0.9, H * 0.16); });
    var qm = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.18), new THREE.MeshStandardMaterial({ map: qd, roughness: 0.5 })); qm.rotation.x = -Math.PI / 2; qm.position.y = 0.072; mc.add(qm);
    var mcPiv = new THREE.Group(); mcPiv.position.set(0, 0.07, 0.0); mc.add(mcPiv); TG.mcPiv = mcPiv;
    pkRoundCyl(0.014, 0.2, MAT.chrome, 0, 0.1, 0, mcPiv, 10);
    var tH = pkRoundCyl(0.024, 0.16, std({ color: 0x1b1d20, roughness: 0.5 }), 0, 0.21, 0, mcPiv, 12); tH.rotation.x = Math.PI / 2;
    sphere(0.018, std({ color: 0xc8322a, roughness: 0.4 }), 0, 0.21, 0.085, mcPiv);
    hitBox(0.45, 0.35, 0.25, -0.12, 1.65, 0.42, { prompt: function () { return 'Master controller: ' + tgNotchName() + ' (W more power, S brake)'; }, use: function () { TG.ctlPos = Math.min(1, (TG.ctlPos || 0) + 0.25); sfx('click'); } }, g);
    // the display in its hood over the middle of the desk
    var hood = pkCtlHood(g, 0.5, 2.05, -0.15, 0.5, 0.28, 0.25); hood.rotation.y = -Math.PI / 2;
    var dsp = tgScreen(512, 288, 0.5, 0.28); dsp.m.position.z = 0.004; hood.add(dsp.m); TG.dsp = dsp;
    // the back wall: the radio handset in its cradle and an extinguisher
    pkBevelBox(0.06, 0.28, 0.16, frame, -0.92, 2.0, 0.45, g, 0.02); pkBevelBox(0.05, 0.22, 0.07, std({ color: 0x15171a, roughness: 0.6 }), -0.88, 2.0, 0.45, g, 0.02);
    pkTube([[-0.88, 1.88, 0.45], [-0.84, 1.6, 0.5], [-0.9, 1.4, 0.42], [-0.92, 1.85, 0.36]], 0.008, std({ color: 0x15171a, roughness: 0.6 }), g, false, 12, 5);
    pkRoundCyl(0.065, 0.42, std({ color: 0xc8322a, roughness: 0.4 }), -0.86, 1.18, -0.6, g, 12); pkRoundCyl(0.03, 0.06, MAT.chrome, -0.86, 1.43, -0.6, g, 8);
    // climbing in: from the platform side or the other
    [-1, 1].forEach(function (s) { hitBox(1.0, 1.4, 0.8, ccx, 1.6, s * 1.05, { prompt: function () { return tgCanBoard() ? 'Climb into TOW-1, the rescue tug' : ''; }, use: function () { tgEnter(); } }, g); });
    TG.built = true;
  }
  // the spur itself: ballast and track, a buffer stop, the charging bay under its canopy, the charger and its sign
  function tgBuildBay() {
    var M = trMats(), P = pkMats(), S = TR.spur, iron = M.iron;
    trRibbon(S, 3.0, 0.05, M.ballast); trLayTrack(S, 0, S.L);
    var e = trSamp(S, S.L, {}), b = trSamp(S, S.L - 9, {});
    var g = trFrameGroup(e.x, e.z, e.yaw);
    // the buffer stop
    pkBevelBox(0.5, 1.0, 2.2, pkPaint(0x8e2a22, 0.6, 0.2), 0.4, 0.5, 0, g, 0.04); box(0.12, 0.3, 2.3, pkStripes('#f0c04a', '#1b1b1b'), 0.1, 0.9, 0, g);
    [-0.55, 0.55].forEach(function (z) { var bf = pkRoundCyl(0.1, 0.3, iron, -0.05, 0.9, z, g, 8); bf.rotation.z = Math.PI / 2; });
    // the canopy over the bay: four posts, a pitched roof
    [[-1.0, -1.7], [-1.0, 1.7], [-7.5, -1.7], [-7.5, 1.7]].forEach(function (c) { pkRoundCyl(0.08, 3.4, iron, c[0], 1.7, c[1], g, 8); });
    var roofG = new THREE.Group(); roofG.position.set(-4.25, 3.4, 0); g.add(roofG); pkGableRoof(7.2, 4.0, 0.7, P.slate, iron, 0, 0, 0, roofG, 0.15);
    // the charger: a cabinet with a screen and the cable to the tug's socket, and the bay's name
    pkBevelBox(0.5, 1.5, 0.6, pkPaint(0x2a5ad8, 0.5, 0.3), -5.2, 0.75, -2.3, g, 0.04);
    box(0.28, 0.2, 0.02, std({ color: 0x0a1410, emissive: 0x3ddc6a, emissiveIntensity: 0.5 }), -5.2, 1.2, -1.99, g);
    pkTube([[-5.2, 0.6, -2.0], [-5.1, 0.25, -1.6], [-5.6, 0.35, -1.1], [-5.8, 1.1, -0.85]], 0.03, M.black, g, false, 12, 6);
    sign(['TOW-1', 'RESCUE TUG BAY'], 1.6, 0.42, -4.25, 2.95, -1.75, 0, { w: 384, h: 100, bg: '#1b1b1b', fg: '#f2b522' }, g);
  }

  // ── Getting in and driving ────────────────────────────────────────
  function tgCanBoard() { var t = TR.t; return TG.built && !TG.driving && !(t && (t.driving || t.seat)) && Math.abs(TG.v) < 0.2; }
  function tgEnter() {
    if (!tgCanBoard()) return;
    TG.driving = true; TG.look.yaw = 0; TG.look.pitch = -0.2; sfx('click');
    toast('TOW-1: R / Shift+R direction switch, W / S master controller (power and brake), Space emergency brake, C coupler, H horn, L headlights, P route to the bay or the line, E to climb out. Couple to either end of the train and bring her home through the depot points.', '');
  }
  function tgLeave() {
    if (Math.abs(TG.v) > 0.2) { toast('Stop TOW-1 first', 'bad'); return true; }
    var g = TG.g, c = Math.cos(g.rotation.y), s = Math.sin(g.rotation.y), lz = 1.7;
    var ex = g.position.x + lz * s, ez = g.position.z + lz * c;
    player.x = ex; player.z = ez; player.y = floorY(ex, ez); player.vy = 0; player.yaw = g.rotation.y; player.pitch = 0;
    TG.driving = false; sfx('click'); return true;
  }
  function tgCouple() {
    var t = TR.t, R = trState();
    if (TG.coupled) {
      if (Math.abs(TG.v) > 0.15) { toast('Stop before you uncouple', 'bad'); return; }
      TG.coupled = false; t.towed = false; t.v = 0; t.brake = 1; TG.v = 0; sfx('click'); toast('Uncoupled: the train\'s brakes are back on', ''); return;
    }
    var gp = tgGaps();
    if (!gp || (Math.abs(gp.nose) > 1.0 && Math.abs(gp.tail) > 1.0)) { toast('Nothing to couple to: back TOW-1 up to the end of the train', 'bad'); return; }
    if (t.v > 0.25) { toast('The train is moving', 'bad'); return; }
    TG.off = tgWrap(gp.s - t.s, t.mode);                     // where the tug sits from her nose: ahead (+) or behind her tail (-)
    TG.coupled = true; t.towed = true; t.brake = 0; t.throttle = 0; t.v = 0;
    if (R.auto) { R.auto = false; toast('AUTO off: TOW-1 has the train', ''); }
    sfx('ok'); toast('Coupled to the ' + (TG.off > 0 ? 'engine' : 'last carriage') + '. Set the points to the DEPOT and bring her in.', 'good');
  }
  // ── The tick: the drive, the battery, the screens, the train it hauls ──
  // the drive: the master controller (TG.ctlPos, -1 full brake .. 0 coast .. +1 full power, moved by W and S like the steam
  // engine's regulator) and the direction switch (TG.dir: -1 reverse, 0 neutral, +1 forward, the cab's own way). Space and
  // the emergency stop put on the full brake.
  function tgNotchName() { var c = TG.ctlPos || 0; if (c < -0.05) return 'BRAKE ' + Math.round(-c * 100) + '%'; if (c < 0.05) return 'COAST'; return 'POWER ' + Math.min(4, Math.ceil(c * 4)); }
  function tgDrive(dt) {
    var keys = player.keys || {}, max = TG.coupled ? TG_MAX_TOW : TG_MAX, acc = TG.coupled ? 0.4 : 1.0;
    if (TG.driving) { if (keys.KeyW) TG.ctlPos = Math.min(1, (TG.ctlPos || 0) + dt * 0.9); if (keys.KeyS) TG.ctlPos = Math.max(-1, (TG.ctlPos || 0) - dt * 0.9); }
    var c = TG.ctlPos || 0, live = TG.master !== false && TG.batt > 0 && !TG.estop;
    var u = TG.v * TG.face, power = live && c > 0.05 && TG.dir ? Math.ceil(c * 4) / 4 : 0;
    if (power > 0) u += TG.dir * power * acc * dt;
    u = clamp(u, -max, max);
    var brake = (c < -0.05 ? -c * 2.2 : 0) + (keys.Space && TG.driving ? 3.0 : 0) + (TG.estop ? 3.0 : 0) + (power === 0 ? 0.12 : 0);
    TG.brakeK = clamp((c < -0.05 ? -c : 0) + ((keys.Space && TG.driving) || TG.estop ? 1 : 0), 0, 1);
    if (u > 0) u = Math.max(0, u - brake * dt); else if (u < 0) u = Math.min(0, u + brake * dt);
    TG.v = u * TG.face;
    TG.amps = power * (TG.coupled ? 360 : 140) + Math.abs(u) * 6;
    TG.batt = clamp(TG.batt - TG.amps * dt * 0.00012, 0, 100);
    if (TG.driving && c > 0.05 && !TG.dir && !TG.dirHinted) { TG.dirHinted = true; toast('TOW-1: set the direction switch (R) to FORWARD or REVERSE', 'bad'); }
    if (TG.dir) TG.dirHinted = false;
  }
  // the horn: a modern two-tone air horn, a minor third (311 and 370 Hz), each note two reeds a touch apart so they beat
  // like a real trumpet, shaped through a brassy peak. It sounds while H is held (or the button is pressed), and from
  // outside it carries less the further you stand from the tug.
  var TG_HORN = null;
  function tgHornVoice() {
    if (TG_HORN || !trOk()) return TG_HORN;
    var gn = AC.createGain(); gn.gain.value = 0;
    var hp = AC.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 170;
    var pk = AC.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 950; pk.Q.value = 1.1; pk.gain.value = 7;
    var lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2800;
    gn.connect(hp); hp.connect(pk); pk.connect(lp); lp.connect(sfxBus);
    [[311, 0.5], [312.8, 0.35], [370, 0.5], [372.4, 0.35], [155.5, 0.12]].forEach(function (f) {
      var o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f[0];
      var og = AC.createGain(); og.gain.value = f[1]; o.connect(og); og.connect(gn); o.start();
    });
    return (TG_HORN = { gn: gn, level: 0 });
  }
  function tgHorn() { TG.hornT = Math.max(TG.hornT || 0, 0.45); tgHornVoice(); }
  function tgHornTick(dt) {
    var V = TG_HORN; if (!V) return;
    TG.hornT = Math.max(0, (TG.hornT || 0) - dt);
    var on = TG.hornT > 0 || (TG.driving && player.keys && player.keys.KeyH), vol = TG.driving ? 1 : (TG.g ? trVol(TG.g.position.x, TG.g.position.z) : 0);
    var want = on ? 0.13 * vol : 0;
    V.level += (want - V.level) * Math.min(1, dt * (on ? 30 : 9)); V.gn.gain.value = V.level;
  }
  function tgRoute() { TG.bay = !TG.bay; sfx('click'); toast('TOW-1 route: ' + (TG.bay ? 'into the bay at the spur' : 'out along the line'), ''); }
  function tgSetDir(d) { if (Math.abs(TG.v) > 0.2) { toast('Stop before you change direction', 'bad'); return; } TG.dir = clamp(d, -1, 1); if (TG.ctl && TG.ctl.dir) TG.ctl.dir.set(TG.dir + 1, true); sfx('click'); }
  function tgMove(dt) {
    var R = trState(), ds = TG.v * dt, prev = TG.s; TG.s += ds;
    if (TG.mode === 'S') {
      if (TG.s > TR.spur.L - TG.HL - 0.6) { TG.s = TR.spur.L - TG.HL - 0.6; if (TG.v > 0.3) sfx('bad'); TG.v = 0; }   // the buffer stop
      if (TG.s < 0) { TG.mode = 'D'; TG.s = TR.sJ1 + TG.sJ + TG.s; }
      if (TG.mode === 'S' && TG.s > 3) { R.tug = { mode: 'S', s: TG.s }; TG.batt = Math.min(100, TG.batt + dt * 2); }   // on charge in the bay
      return;
    }
    if (TG.mode === 'D') {
      var j = TR.sJ1 + TG.sJ;
      if (ds > 0 && prev < j && TG.s >= j && TG.bay) { TG.mode = 'S'; TG.s -= j; return; }
      if (ds > 0 && TG.s > TR.sJ1 + TR.byp.L) { TG.mode = 'M'; TG.s -= TR.dL; }
      else if (ds < 0 && TG.s < TR.sJ1) TG.mode = 'M';
    } else {
      if (ds > 0 && prev < TR.sJ1 && TG.s >= TR.sJ1 && R.points === 'depot') TG.mode = 'D';
      else if (ds < 0 && prev >= TR.sJ2 && TG.s < TR.sJ2 && R.points === 'depot') { TG.mode = 'D'; TG.s += TR.dL; }
    }
    var L = trLoopLen(TG.mode); TG.s = ((TG.s % L) + L) % L;
    R.tug = { mode: TG.mode, s: TG.s };
  }
  // the train cannot pass through the tug: an uncoupled tug on the line stops her, and the tug stops against her
  function tgBumpers() {
    var t = TR.t, gp = tgGaps(); if (!gp) return;
    if (gp.nose < 0.05 && gp.nose > -3 && TG.v < 0) { TG.v = 0; sfx('bad'); }
    if (gp.tail < 0.05 && gp.tail > -3 && TG.v > 0) { TG.v = 0; sfx('bad'); }
    var noseGap = gp.nose, tailGap = gp.tail;
    if (t.dir > 0 && t.v > 0 && noseGap < 2.5 && noseGap > -3) { t.v = 0; t.brake = 1; if (!TG.warned) { TG.warned = true; toast('The train stopped short: TOW-1 is on the line', 'bad'); } }
    else if (t.dir < 0 && t.v > 0 && tailGap < 2.5 && tailGap > -3) { t.v = 0; t.brake = 1; if (!TG.warned) { TG.warned = true; toast('The train stopped short: TOW-1 is on the line', 'bad'); } }
    else TG.warned = false;
  }
  function tgPlace() {
    var a = tgSamp(TG.mode, TG.s + 1.1 * TG.face, {}), ax = a.x, az = a.z, b = tgSamp(TG.mode, TG.s - 1.1 * TG.face, {});   // its front the way the cab looks
    TG.g.position.set((ax + b.x) / 2, 0, (az + b.z) / 2); TG.g.rotation.y = Math.atan2(-(az - b.z), ax - b.x);
    TG.wheels.forEach(function (w) { w.rotation.z -= TG.dv * TG.face / 0.3; });
  }
  function tgScreens(dt) {
    var t = TR.t, R = trState(), gp = tgGaps();
    if (TG.mcPiv) TG.mcPiv.rotation.z = -(TG.ctlPos || 0) * 0.6;                         // forward for power, back for brake
    var C = TG.ctl; if (!C || !C.ann) return;
    C.ann['COUPLED'].on = TG.coupled; C.ann['ON TOW'].on = TG.coupled && Math.abs(TG.v) > 0.05 ? 'flash' : TG.coupled; C.ann['BATT LOW'].on = TG.batt < 20;
    C.couple.setLit(TG.coupled); C.route.setLit(TG.bay);
    TG.scr0 = (TG.scr0 || 0) - dt; if (TG.scr0 > 0) return; TG.scr0 = 0.25;
    C.read.set([(Math.abs(TG.v) * 3.6).toFixed(1) + ' KM/H  ' + ['REV', 'NEU', 'FWD'][(TG.dir || 0) + 1], tgNotchName(), 'BATT ' + Math.round(TG.batt) + '%  ' + Math.round(TG.amps || 0) + ' A']);
    var d = TG.dsp, c = d.c, W = 512, H = 288;
    c.fillStyle = '#0b0f14'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#16202b'; c.fillRect(0, 0, W, 30); c.fillStyle = '#e4ebef'; c.font = '700 17px Bahnschrift, Arial'; c.textAlign = 'left'; c.textBaseline = 'middle';
    c.fillText('TOW-1', 12, 15); c.fillStyle = '#9fb0bc'; c.fillText('POINTS ' + (R.points === 'depot' ? 'DEPOT' : 'MAIN') + '   ROUTE ' + (TG.bay ? 'BAY' : 'LINE'), 90, 15);
    c.textAlign = 'right'; c.fillText(fmtTime(S.time), W - 12, 15);
    // the line map on the left: the loop, the depot siding, the train in amber, TOW-1 in blue
    var P = TR.main, sx = function (x) { return 14 + (x + 140) / 320 * 300; }, sz = function (z) { return 44 + (z + 160) / 280 * 230; };
    c.strokeStyle = '#3a4b5a'; c.lineWidth = 4; c.beginPath(); for (var i = 0; i < P.n; i += 3) { var X = sx(P.x[i]), Z = sz(P.z[i]); if (i) c.lineTo(X, Z); else c.moveTo(X, Z); } c.closePath(); c.stroke();
    c.strokeStyle = '#5a7085'; c.lineWidth = 3; c.beginPath(); for (i = 0; i < TR.byp.n; i += 3) { X = sx(TR.byp.x[i]); Z = sz(TR.byp.z[i]); if (i) c.lineTo(X, Z); else c.moveTo(X, Z); } c.stroke();
    var tp = TR.units[0].g.position, up = TG.g.position;
    c.fillStyle = '#ffb02e'; c.beginPath(); c.arc(sx(tp.x), sz(tp.z), 7, 0, 6.283); c.fill(); c.fillStyle = '#4aa8ff'; c.beginPath(); c.arc(sx(up.x), sz(up.z), 6, 0, 6.283); c.fill();
    // the drive on the right
    c.textAlign = 'left'; c.fillStyle = '#e4ebef'; c.font = '700 44px Bahnschrift, Arial'; c.fillText((Math.abs(TG.v) * 3.6).toFixed(1), 334, 80);
    c.font = '600 15px Bahnschrift, Arial'; c.fillStyle = '#9fb0bc'; c.fillText('km/h', 334, 110);
    var rows = [['DIRECTION', ['REVERSE', 'NEUTRAL', 'FORWARD'][(TG.dir || 0) + 1]], ['CONTROLLER', tgNotchName()], ['COUPLER', TG.coupled ? 'LOCKED' : 'OPEN'], ['TRAIN', gp ? Math.round(Math.min(Math.abs(gp.nose), Math.abs(gp.tail))) + ' m' : '--'], ['ENGINE', t.engine ? 'IN STEAM' : 'DEAD']];
    rows.forEach(function (r, k) { c.fillStyle = '#9fb0bc'; c.fillText(r[0], 334, 140 + k * 28); c.fillStyle = '#e4ebef'; c.textAlign = 'right'; c.fillText(r[1], W - 12, 140 + k * 28); c.textAlign = 'left'; });
    d.tex.needsUpdate = true;
  }
  function tgTick(dt) {
    if (!TG.built || !TR.built) return;
    dt = Math.min(dt, 0.1);
    var t = TR.t;
    tgDrive(dt);
    if (TG.coupled) {
      // the train goes the tug's way at the tug's speed; trTick (run next) moves her, her points and her stations
      t.towed = true; t.v = Math.abs(TG.v); if (Math.abs(TG.v) > 0.01) t.dir = TG.v > 0 ? 1 : -1; t.brake = 0; t.throttle = 0;
    }
  }
  function tgAfter(dt) {
    if (!TG.built || !TR.built) return;
    dt = Math.min(dt, 0.1);
    if (TG.coupled) { tgFollow(); trState().tug = { mode: TG.mode, s: TG.s }; } else { tgMove(dt); tgBumpers(); }
    TG.dv = TG.v * dt;
    tgPlace();
    tgHornTick(dt);
    TG.beaconA += dt * 6; TG.beaconSpin.rotation.y = TG.beaconA; TG.beacon.emissiveIntensity = TG.beaconOn !== false && (Math.abs(TG.v) > 0.05 || TG.driving) ? 1.6 : 0.3;
    if (TG.driving) tgScreens(dt);
  }

  // ── Hooks: build, tick, keys, the camera ──────────────────────────
  var _tgPrevBuild = GAME.buildWorld;
  GAME.buildWorld = function (loaded) {
    var r = _tgPrevBuild ? _tgPrevBuild(loaded) : undefined;
    try {
      if (TR.built && !TG.built) {
        tgBuildSpur(); tgBuildBay(); tgBuild(); TR.tugRef = TG;   // the level crossings (part 43) watch it too
        var R = trState(), sv = R.tug;
        if (sv && (sv.mode === 'S' || sv.mode === 'M' || sv.mode === 'D') && isFinite(sv.s)) { TG.mode = sv.mode; TG.s = sv.s; } else { TG.mode = 'S'; TG.s = TR.spur.L - TG.HL - 0.6; }
        TG.dv = 0; tgPlace();
      }
    } catch (e) { if (window.console) console.error('TOW-1', e); }
    return r;
  };
  var _tgPrevTick = GAME.tick;
  GAME.tick = function (dt) {
    try { tgTick(dt); } catch (e) { if (window.console) console.error('TOW-1', e); }
    if (_tgPrevTick) _tgPrevTick(dt);
    try { tgAfter(dt); } catch (e2) { if (window.console) console.error('TOW-1', e2); }
  };
  var _tgPrevKey = GAME.key;
  GAME.key = function (e) {
    if (TG.driving && !e.repeat) {
      if (e.code === 'KeyE') { if (focusText) return false; return tgLeave(); }   // aimed at a control, E (or a click, which sends E) works the control; aimed away, it climbs out
      if (e.code === 'KeyR') { tgSetDir((TG.dir || 0) + (e.shiftKey ? -1 : 1)); return true; }
      if (e.code === 'KeyC') { TG.ctl.couple.press(); return true; }
      if (e.code === 'KeyH') { player.keys.KeyH = true; TG.ctl.horn.press(); return true; }   // held: the horn sounds until H comes up
      if (e.code === 'KeyL') { TG.ctl.head.flip(); return true; }
      if (e.code === 'KeyP') { TG.ctl.route.press(); return true; }
      if (e.code === 'Space') { e.preventDefault(); player.keys.Space = true; return true; }
    }
    return _tgPrevKey ? _tgPrevKey(e) : false;
  };
  var _tgPrevMouse = GAME.mouseLook;
  GAME.mouseLook = function (e, sx, iy) {
    if (TG.driving) { TG.look.yaw = clamp(TG.look.yaw - e.movementX * sx, -2.6, 2.6); TG.look.pitch = clamp(TG.look.pitch - e.movementY * sx * iy, -1.3, 1.3); return true; }
    return _tgPrevMouse ? _tgPrevMouse(e, sx, iy) : false;
  };
  var _tgPrevOverride = GAME.playerOverride;
  GAME.playerOverride = function (dt) {
    if (TG.driving && TG.g) {
      // the driver's seat, looking forward along the tug (its +x), the eye over the cushion
      var g = TG.g, c = Math.cos(g.rotation.y), s = Math.sin(g.rotation.y), lx = -0.45, lz = -0.15, ly = 1.47 + 0.72;
      var wx = g.position.x + lx * c + lz * s, wz = g.position.z - lx * s + lz * c;
      player.x = wx; player.z = wz; player.y = ly - 1.62; player.vy = 0;
      camera.position.set(wx, ly, wz); camera.rotation.order = 'YXZ'; camera.rotation.set(TG.look.pitch, g.rotation.y - Math.PI / 2 + TG.look.yaw, 0);
      player.yaw = camera.rotation.y; player.pitch = TG.look.pitch;
      return true;
    }
    return _tgPrevOverride ? _tgPrevOverride(dt) : false;
  };
  var _tgPrevT = GAME.T;
  GAME.T = function () { var o = _tgPrevT ? _tgPrevT() : {}; o.TG = TG; o.tgCouple = tgCouple; o.tgEnter = tgEnter; return o; };
})();
