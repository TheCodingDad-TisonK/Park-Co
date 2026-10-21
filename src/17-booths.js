//@ Park Co, part 17: the operator booths - a proper control cabin beside every ride, outside and in
  // ── What a booth is now ───────────────────────────────────────────
  // A raised cabin on a stone plinth, three steps up to its door from the queue side, glazed on the front and both front
  // corners so the operator sees the ride and the line. Outside: the ride's striped canopy, a signal tower on the roof that
  // shows the ride's state, a CCTV camera panning over the ride, an LED board over the door telling the queue the wait, a
  // fire point, a wall-hung air unit with a turning fan and the services box on the back wall. Inside: the desk with the
  // ride's panel (part 14, unchanged), a ride control cabinet with live meters, a lamp column, a key switch and a lamp test,
  // two CCTV monitors over the desk, the status board, a clock on park time, the intercom, the key box, the radio on its
  // charger and the rest of a room someone works in. The whole booth is one world item: the editor moves it in one piece,
  // walls, solids and all. The kit (pkBk*) is shared with the indoor coasters' cabins.
  var PK_BK_LIVE = [];          // the booths' canvases, repainted while the player is near enough to read them
  var PK_BK_T = 0;
  // one material per look, shared by every booth: the bake merges by material, so twelve booths of the same paint cost one
  // draw for that paint instead of one per part per booth
  var PK_BK_MATS = {};
  function pkBkStd(def) { var k = JSON.stringify(def); return PK_BK_MATS[k] || (PK_BK_MATS[k] = std(def)); }

  // ── Small parts ───────────────────────────────────────────────────
  // a wall clock that keeps the park's own time
  function pkBkClock(parent, x, y, z, ry, r) {
    r = r || 0.16;
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parent.add(g);
    var rim = new THREE.Mesh(roundCylGeo(r * 1.08, r * 1.08, 0.04, 28), MAT.steelDark); rim.rotation.x = Math.PI / 2; g.add(rim);
    var face = new THREE.Mesh(new THREE.CircleGeometry(r, 28), pkBkStd({ color: 0xf3efe4, roughness: 0.6 })); face.position.z = 0.021; g.add(face);
    for (var h = 0; h < 12; h++) {
      var a = h / 12 * Math.PI * 2, tk = box(0.012, h % 3 ? 0.018 : 0.032, 0.004, MAT.black, Math.sin(a) * r * 0.84, Math.cos(a) * r * 0.84, 0.024, g);
      tk.rotation.z = -a;
    }
    var hands = new THREE.Group(); hands.position.z = 0.026; hands.userData.dynamic = true; g.add(hands);
    var hh = new THREE.Group(), mh = new THREE.Group(); hands.add(hh); hands.add(mh);
    box(0.014, r * 0.55, 0.004, MAT.black, 0, r * 0.25, 0, hh);
    box(0.009, r * 0.82, 0.004, MAT.black, 0, r * 0.37, 0.003, mh);
    pkCtlLive({ tick: function () {
      if (typeof S === 'undefined' || !S) return;
      hh.rotation.z = -((S.time % 12) / 12) * Math.PI * 2;
      mh.rotation.z = -(((S.time * 60) % 60) / 60) * Math.PI * 2;
    } });
    return g;
  }
  // a fan on a bracket, blades turning
  function pkBkFan(parent, x, y, z, ry) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parent.add(g);
    var M = pkMats();
    pkBevelBox(0.16, 0.05, 0.14, M.iron, 0, -0.16, 0, g, 0.01);
    pkRoundCyl(0.016, 0.16, M.iron, 0, -0.08, 0, g, 6);
    var cage = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.008, 6, 22), MAT.chrome); cage.position.z = 0.03; g.add(cage);
    pkRoundCyl(0.035, 0.07, M.iron, 0, 0, -0.01, g, 10).rotation.x = Math.PI / 2;
    var rot = new THREE.Group(); rot.position.z = 0.03; rot.userData.dynamic = true; g.add(rot);
    for (var b = 0; b < 3; b++) { var bl = box(0.04, 0.11, 0.006, pkBkStd({ color: 0xd8dde0, roughness: 0.5 }), 0, 0.06, 0, rot); bl.rotation.z = 0; var arm = new THREE.Group(); arm.rotation.z = b * Math.PI * 2 / 3; rot.add(arm); arm.add(bl); }
    pkCtlLive({ tick: function (dt) { rot.rotation.z -= dt * 14; } });
    return g;
  }
  // the radio on its charger, a walkie-talkie standing in the cradle with its aerial up
  function pkBkRadio(parent, x, y, z, ry) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parent.add(g);
    pkBevelBox(0.16, 0.05, 0.12, pkBkStd({ color: 0x22272b, roughness: 0.6 }), 0, 0.025, 0, g, 0.01);
    box(0.02, 0.008, 0.004, glowMat(0x5fd38d, 1.4), 0.05, 0.035, 0.061, g);
    pkBevelBox(0.065, 0.2, 0.045, pkBkStd({ color: 0x1b1f22, roughness: 0.55 }), -0.02, 0.15, 0, g, 0.012);
    box(0.045, 0.05, 0.004, pkBkStd({ color: 0x3a4a42, roughness: 0.3, emissive: 0x1d3a2a, emissiveIntensity: 0.6 }), -0.02, 0.19, 0.024, g);
    pkRoundCyl(0.007, 0.14, MAT.black, -0.04, 0.32, 0, g, 6);
    return g;
  }
  // the daily checklist: a clipboard with a printed sheet, ticked off in pen
  var PK_BK_SHEET = null;
  function pkBkClipboard(parent, x, y, z, ry) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parent.add(g);
    pkBevelBox(0.26, 0.36, 0.015, pkBkStd({ color: 0x8a6a4a, roughness: 0.8 }), 0, 0, 0, g, 0.004);
    if (!PK_BK_SHEET) PK_BK_SHEET = std({ roughness: 0.9, map: tex(256, 340, function (c, w, h) {
      c.fillStyle = '#f4f1e8'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#1b232c'; c.font = 'bold 26px sans-serif'; c.fillText('DAILY CHECKS', 18, 44);
      c.fillStyle = 'rgba(27,35,44,0.5)'; c.fillRect(18, 56, w - 36, 2);
      ['Restraints lock', 'Gates & latches', 'E-stop & reset', 'Lamp test', 'Horn', 'Queue rails', 'Signage'].forEach(function (t, i) {
        var yy = 96 + i * 34; c.strokeStyle = '#1b232c'; c.lineWidth = 2; c.strokeRect(18, yy - 18, 20, 20);
        c.fillStyle = '#1b232c'; c.font = '20px sans-serif'; c.fillText(t, 50, yy);
        if (i < 5) { c.strokeStyle = '#2f5d8a'; c.lineWidth = 3; c.beginPath(); c.moveTo(21, yy - 8); c.lineTo(27, yy - 1); c.lineTo(40, yy - 20); c.stroke(); }
      });
      c.fillStyle = '#2f5d8a'; c.font = 'italic 20px sans-serif'; c.fillText('signed: the operator', 18, h - 20);
    }, 1, 1) });
    var sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.29), PK_BK_SHEET); sheet.position.set(0, -0.02, 0.009); g.add(sheet);
    pkBevelBox(0.1, 0.035, 0.025, MAT.chrome, 0, 0.16, 0.012, g, 0.004);
    return g;
  }
  // a framed notice, a sign on a board
  function pkBkNotice(parent, x, y, z, ry, lines, w, h, opt) {
    opt = opt || {};
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parent.add(g);
    pkBevelBox(w + 0.04, h + 0.04, 0.02, opt.board || pkMatWoodRich(), 0, 0, 0, g, 0.006);
    pkSign3D(lines, w, h, 0, 0, 0.012, 0, { bg: opt.bg || '#f1ecdf', fg: opt.fg || '#1b232c' }, g);
    if (opt.clip) pkBevelBox(0.09, 0.03, 0.02, MAT.chrome, 0, h / 2 + 0.005, 0.02, g, 0.004);
    return g;
  }
  // the intercom: a wall box with a handset on its hook and a call button
  function pkBkIntercom(parent, x, y, z, ry) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parent.add(g);
    pkBevelBox(0.16, 0.26, 0.06, pkBkStd({ color: 0xd9d5c9, roughness: 0.6 }), 0, 0, 0.03, g, 0.012);
    for (var i = 0; i < 4; i++) box(0.08, 0.006, 0.004, MAT.black, 0, 0.07 - i * 0.016, 0.062, g);
    pkBevelBox(0.05, 0.22, 0.045, MAT.black, 0.11, -0.01, 0.04, g, 0.015);
    pkRoundCyl(0.016, 0.012, glowMat(0xf0c04a, 0.9), 0, -0.07, 0.064, g, 12).rotation.x = Math.PI / 2;
    return g;
  }
  // the key box: a steel cabinet with a glazed door and the ride keys on their hooks
  function pkBkKeyBox(parent, x, y, z, ry) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parent.add(g);
    pkBevelBox(0.28, 0.34, 0.06, pkBkStd({ color: 0x8a949b, roughness: 0.45, metalness: 0.5 }), 0, 0, 0.03, g, 0.01);
    box(0.24, 0.30, 0.004, pkMats().glass, 0, 0, 0.062, g);
    for (var k = 0; k < 6; k++) {
      var kx = -0.08 + (k % 3) * 0.08, ky = 0.07 - Math.floor(k / 3) * 0.13;
      box(0.012, 0.012, 0.03, MAT.chrome, kx, ky, 0.045, g);
      box(0.018, 0.05, 0.004, [MAT.red, MAT.yellow, MAT.blue][k % 3], kx, ky - 0.04, 0.05, g);
    }
    return g;
  }
  // a first-aid box
  function pkBkFirstAid(parent, x, y, z, ry) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parent.add(g);
    pkBevelBox(0.3, 0.22, 0.1, pkBkStd({ color: 0x2f8f4f, roughness: 0.5 }), 0, 0, 0.05, g, 0.015);
    box(0.08, 0.025, 0.004, MAT.white, 0, 0, 0.101, g); box(0.025, 0.08, 0.004, MAT.white, 0, 0, 0.101, g);
    return g;
  }
  // a hi-vis vest on a hook
  function pkBkVest(parent, x, y, z, ry) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parent.add(g);
    box(0.03, 0.03, 0.06, MAT.chrome, 0, 0.02, 0.03, g);
    pkBevelBox(0.34, 0.46, 0.03, MAT.hivis || MAT.yellow, 0, -0.24, 0.05, g, 0.012);
    box(0.34, 0.03, 0.004, pkBkStd({ color: 0xd8dde0, roughness: 0.3, metalness: 0.6 }), 0, -0.3, 0.067, g);
    box(0.34, 0.03, 0.004, pkBkStd({ color: 0xd8dde0, roughness: 0.3, metalness: 0.6 }), 0, -0.4, 0.067, g);
    return g;
  }
  // a fire point: a red extinguisher on a bracket, with its sign above
  function pkBkFirePoint(parent, x, y, z, ry) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parent.add(g);
    var red = pkBkStd({ color: 0xb8362b, roughness: 0.4, metalness: 0.2 });
    pkRoundCyl(0.075, 0.42, red, 0, 0.26, 0.09, g, 14);
    pkRoundCyl(0.03, 0.06, MAT.black, 0, 0.5, 0.09, g, 8);
    pkRod(0, 0.52, 0.09, 0.07, 0.36, 0.14, 0.012, MAT.black, g, 6);
    box(0.06, 0.04, 0.06, MAT.steelDark, 0, 0.4, 0.03, g);
    pkSign3D(['FIRE'], 0.22, 0.14, 0, 0.72, 0.012, 0, { bg: '#b8362b', fg: '#ffffff' }, g);
    return g;
  }
  // a fluorescent batten on the ceiling
  function pkBkBatten(parent, x, y, z, ry, len) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parent.add(g);
    pkBevelBox(len || 1.2, 0.05, 0.12, pkBkStd({ color: 0xe6e3da, roughness: 0.5 }), 0, 0, 0, g, 0.01);
    box((len || 1.2) - 0.08, 0.02, 0.07, glowMat(0xf4f7ff, 1.3), 0, -0.032, 0, g);
    return g;
  }

  // ── The ride's state, as lamps and words ─────────────────────────
  function pkBkWord(a) {
    var C = pkCtl(a);
    if (C.maint) return 'MAINTENANCE';
    if (C.fault) return 'STOPPED';
    if (!a.open) return 'CLOSED';
    if (PK.closed && !a.riders) return 'PARK CLOSED';
    return { idle: 'OPEN', boarding: 'BOARDING', ready: 'READY', running: 'RIDE IN MOTION', unloading: 'UNLOADING' }[a.state] || 'OPEN';
  }
  // the wait, in whole minutes: a full load per cycle, a cycle being boarding + run + unload
  function pkBkWait(a) {
    var cap = Math.max(1, a.seats.length), cyc = (a.board || 10) + (a.run || 20) + (a.unload || 5);
    return Math.ceil(Math.ceil((a.queue.length + 1) / cap) * cyc / 60);
  }

  // ── The signal tower on the roof ──────────────────────────────────
  // red over amber over green, a horn on top: green open and waiting, amber boarding or unloading, red in motion,
  // red flashing on a stop, amber flashing in maintenance
  function pkBkStack(a, parent, x, y, z) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
    pkRoundCyl(0.03, 0.5, M.iron, 0, 0.25, 0, g, 8);
    pkRoundCyl(0.075, 0.05, MAT.steelDark, 0, 0.53, 0, g, 14);
    var cols = [0x5fd38d, 0xf0c04a, 0xff3b30], mats = [];
    for (var i = 0; i < 3; i++) {
      var m = glowMat(cols[i], 0.08); mats.push(m);
      pkRoundCyl(0.068, 0.11, m, 0, 0.62 + i * 0.12, 0, g, 16);
      pkRoundCyl(0.072, 0.012, MAT.steelDark, 0, 0.68 + i * 0.12, 0, g, 16);
    }
    var horn = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.02, 0.1, 12, 1, true), pkBkStd({ color: 0x2b3136, roughness: 0.5, side: THREE.DoubleSide }));
    horn.position.set(0, 1.0, 0); g.add(horn);
    var C = pkCtl(a);
    pkCtlLive({ tick: function () {
      var blink = Math.floor(PK_BK_T * 2.5) % 2 === 0, on = [false, false, false];
      if (C.fault) on[2] = blink;
      else if (C.maint) on[1] = blink;
      else if (C.bkTest) on = [true, true, true];
      else if (a.state === 'running') on[2] = true;
      else if (a.state === 'boarding' || a.state === 'unloading' || a.state === 'ready') on[1] = true;
      else on[0] = a.open && !PK.closed;
      for (var k = 0; k < 3; k++) mats[k].emissiveIntensity += ((on[k] ? 2.2 : 0.08) - mats[k].emissiveIntensity) * 0.35;
    } });
    return g;
  }
  // a CCTV camera on a wall bracket, slowly sweeping its field
  function pkBkCamera(parent, x, y, z, ry, sweep) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parent.add(g);
    var body = pkBkStd({ color: 0xe8e6e0, roughness: 0.45 });
    pkBevelBox(0.1, 0.1, 0.03, MAT.steelDark, 0, 0, 0.015, g, 0.01);
    pkRod(0, 0, 0.03, 0, 0, 0.2, 0.014, MAT.steelDark, g, 6);
    var head = new THREE.Group(); head.position.set(0, -0.02, 0.22); head.userData.dynamic = true; g.add(head);
    head.rotation.x = 0.35;
    pkBevelBox(0.09, 0.08, 0.24, body, 0, -0.04, 0.06, head, 0.02);
    pkBevelBox(0.12, 0.012, 0.28, body, 0, 0.005, 0.07, head, 0.004);
    pkRoundCyl(0.03, 0.02, MAT.black, 0, -0.04, 0.185, head, 12).rotation.x = Math.PI / 2;
    var rec = sphere(0.009, glowMat(0xff3b30, 1.6), 0.03, -0.01, 0.18, head);
    var ph = Math.random() * 6;
    pkCtlLive({ tick: function () {
      head.rotation.y = Math.sin(PK_BK_T * 0.35 + ph) * (sweep || 0.6);
      rec.visible = Math.floor(PK_BK_T * 1.2 + ph) % 2 === 0;
    } });
    return g;
  }
  // the LED board over the door: the ride's name, its state and the wait, in amber dots
  function pkBkWaitBoard(a, parent, x, y, z, ry) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parent.add(g);
    pkBevelBox(1.36, 0.42, 0.08, MAT.steelDark, 0, 0, -0.03, g, 0.015);
    var sc = touchScreen({
      w: 320, h: 96, pw: 1.24, ph: 0.34, x: 0, y: 0, z: 0.012, parent: g, title: a.name + ': the queue board',
      draw: function (c, s) {
        c.fillStyle = '#0a0806'; c.fillRect(0, 0, s.w, s.h);
        c.fillStyle = 'rgba(255,170,40,0.05)'; for (var yy = 2; yy < s.h; yy += 4) for (var xx = 2; xx < s.w; xx += 4) c.fillRect(xx, yy, 2, 2);
        var word = pkBkWord(a), open = word === 'OPEN' || word === 'BOARDING' || word === 'READY' || word === 'RIDE IN MOTION' || word === 'UNLOADING';
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = '#ffb03a'; c.font = 'bold 28px ' + SCREEN_THEME.font; c.fillText(a.name.toUpperCase(), s.w / 2, 26, s.w - 16);
        c.fillStyle = open ? '#ffcf6a' : '#ff5a3c'; c.font = 'bold 24px ' + SCREEN_THEME.font;
        c.fillText(open ? (word === 'OPEN' && !a.queue.length ? 'NO WAIT · WALK ON' : 'WAIT ' + pkBkWait(a) + ' MIN · ' + word) : word, s.w / 2, 68, s.w - 16);
      }
    });
    PK_BK_LIVE.push({ sc: sc, g: g, every: 1.0 });
    return sc;
  }

  // ── The CCTV monitors over the desk ───────────────────────────────
  function pkBkScanlines(c, w, h) { c.fillStyle = 'rgba(0,0,0,0.22)'; for (var y = 0; y < h; y += 3) c.fillRect(0, y, w, 1); }
  function pkBkMonitor(parent, x, y, z, ry, tilt, title, draw) {
    var g = new THREE.Group(); g.rotation.order = 'YXZ'; g.position.set(x, y, z); g.rotation.y = ry || 0; g.rotation.x = tilt || 0; parent.add(g);
    var caseM = pkBkStd({ color: 0x23292e, roughness: 0.5, metalness: 0.3 });
    pkBevelBox(0.5, 0.36, 0.12, caseM, 0, 0, -0.065, g, 0.02);
    box(0.02, 0.02, 0.004, glowMat(0x5fd38d, 1.4), 0.2, -0.16, 0.0, g);
    var sc = touchScreen({ w: 240, h: 168, pw: 0.44, ph: 0.3, x: 0, y: 0.01, z: 0.0, parent: g, title: title, draw: draw });
    PK_BK_LIVE.push({ sc: sc, g: g, every: 0.5 });
    return sc;
  }
  function pkBkMonitors(a, parent, x, y, z, ry, spread) {
    var C = pkCtl(a), sp = spread || 0.27;
    // a bracket from the ceiling, the two screens hung on it, toed in toward the chair
    var M = pkMats(), g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parent.add(g);
    pkRoundCyl(0.02, 0.36, M.iron, 0, 0.42, -0.06, g, 6);
    box(sp * 2 + 0.4, 0.04, 0.04, M.iron, 0, 0.24, -0.06, g);
    pkBkMonitor(g, -sp, 0.0, 0.0, 0.18, 0.22, 'CAM 1 · the queue', function (c, s) {
      c.fillStyle = '#071108'; c.fillRect(0, 0, s.w, s.h);
      c.fillStyle = '#8fe0a0'; c.font = 'bold 13px monospace'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      c.fillText('CAM 1  QUEUE', 8, 16); c.textAlign = 'right'; c.fillText(fmtTime(S.time), s.w - 8, 16);
      var n = Math.max(6, Math.min(12, a.cap || 8)), q = a.queue.length, bw = (s.w - 24) / n;
      c.strokeStyle = 'rgba(143,224,160,0.6)'; c.lineWidth = 1.5; c.strokeRect(10, 56, s.w - 20, 46);
      for (var i = 0; i < n; i++) {
        c.strokeStyle = 'rgba(143,224,160,0.25)'; c.strokeRect(12 + i * bw, 60, bw - 4, 38);
        if (i < q) { c.fillStyle = '#cfe9d4'; c.beginPath(); c.arc(12 + i * bw + (bw - 4) / 2, 79, Math.min(9, bw / 3), 0, 6.283); c.fill(); }
      }
      c.fillStyle = '#8fe0a0'; c.textAlign = 'left'; c.font = '13px monospace';
      c.fillText('IN LINE ' + q + (q > n ? ' (+' + (q - n) + ' BEYOND)' : ''), 10, 128);
      c.fillText('WAIT ~' + pkBkWait(a) + ' MIN', 10, 148);
      if (Math.floor(PK_BK_T) % 2 === 0) { c.fillStyle = '#ff3b30'; c.beginPath(); c.arc(s.w - 14, 150, 5, 0, 6.283); c.fill(); }
      pkBkScanlines(c, s.w, s.h);
    });
    pkBkMonitor(g, sp, 0.0, 0.0, -0.18, 0.22, 'CAM 2 · the ride', function (c, s) {
      c.fillStyle = '#070b11'; c.fillRect(0, 0, s.w, s.h);
      c.fillStyle = '#9fc6ff'; c.font = 'bold 13px monospace'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      c.fillText('CAM 2  ' + a.name.toUpperCase().slice(0, 14), 8, 16);
      var N = a.seats.length, cols = Math.min(8, N), rows = Math.ceil(N / cols), cw = (s.w - 24) / cols, ch = Math.min(26, 70 / rows);
      for (var i = 0; i < N; i++) {
        var cx = 12 + (i % cols) * cw, cy = 30 + Math.floor(i / cols) * (ch + 4);
        c.strokeStyle = 'rgba(159,198,255,0.45)'; c.strokeRect(cx, cy, cw - 4, ch);
        if (a.seats[i].guest) { c.fillStyle = '#d7e6ff'; c.fillRect(cx + 3, cy + 3, cw - 10, ch - 6); }
      }
      var y0 = 30 + rows * (ch + 4) + 10;
      c.fillStyle = C.fault ? '#ff6b5e' : '#9fc6ff'; c.font = 'bold 14px monospace';
      c.fillText(pkBkWord(a), 10, y0 + 6);
      var f = a.state === 'running' ? clamp((a.t || 0) / Math.max(1, a.run || 1), 0, 1) : a.state === 'boarding' ? clamp((a.t || 0) / Math.max(1, a.board || 1), 0, 1) : 0;
      c.strokeStyle = 'rgba(159,198,255,0.6)'; c.strokeRect(10, y0 + 16, s.w - 20, 12);
      c.fillStyle = a.state === 'running' ? '#ff9d6b' : '#9fc6ff'; c.fillRect(12, y0 + 18, (s.w - 24) * f, 8);
      c.fillStyle = '#9fc6ff'; c.font = '12px monospace'; c.fillText('BARS ' + (C.bars > 0.5 ? 'LOCKED' : 'OPEN') + '   GATES ' + (C.gateT > 0.5 ? 'OPEN' : 'SHUT'), 10, s.h - 10);
      pkBkScanlines(c, s.w, s.h);
    });
    return g;
  }

  // ── The ride control cabinet ──────────────────────────────────────
  // a steel enclosure on the wall with its own fascia: motor and supply meters, the lamp column, the key switch (RUN or
  // MAINT: in MAINT the ride will not board or run, whatever the desk says), a lamp test, the horn, and a cycle counter
  function pkBkCabinet(a, parent, x, y, z, ry) {
    var C = pkCtl(a), M = pkCtlM();
    var PW = 0.78, PH = 1.04;
    var H = new THREE.Group(); H.position.set(x, y, z); H.rotation.y = ry || 0; parent.add(H);
    pkBevelBox(PW + 0.12, PH + 0.12, 0.2, M.case, 0, 0, -0.1, H, 0.02);
    pkBevelBox(PW + 0.18, 0.04, 0.24, M.face, 0, PH / 2 + 0.08, -0.09, H, 0.01);
    cyl(0.026, 0.5, MAT.steelDark, PW / 2 - 0.1, PH / 2 + 0.32, -0.1, H, 8);          // the conduit up to the roof
    [0.32, -0.32].forEach(function (hy) { pkBevelBox(0.04, 0.1, 0.05, MAT.chrome, -PW / 2 - 0.05, hy, -0.02, H, 0.008); });
    var LAMPS = [['POWER', 0x5fd38d], ['AUTO', 0x5fd38d], ['GATES OPEN', 0xf0c04a], ['BARS LOCKED', 0x5fd38d], ['IN MOTION', 0xff3b30], ['FAULT', 0xff3b30], ['MAINT', 0xf0c04a]];
    var P = pkCtlPanel({
      w: PW, h: PH, x: 0, y: 0, z: 0.005, parent: H, key: 'pk-bk-cab-' + a.id,
      draw: function (c, W, Hh) {
        var R = pkCtlRuler(W, Hh, PW, PH); R.c = c;
        R.engrave('RIDE CONTROL', 0, 0.475, 0.030);
        R.txt(a.name.toUpperCase() + '  ·  PLC-01  ·  400 V 3~', 0, 0.44, 0.0135, '#a6b4bc');
        R.box(-0.2, 0.27, 0.36, 0.24, 'rgba(0,0,0,0.22)', 0.004);
        R.box(0.2, 0.27, 0.36, 0.24, 'rgba(0,0,0,0.22)', 0.004);
        R.txt('MOTOR A', -0.2, 0.162, 0.016, '#aebcc4');
        R.txt('SUPPLY V', 0.2, 0.162, 0.016, '#aebcc4');
        R.box(-0.2, -0.12, 0.36, 0.48, 'rgba(0,0,0,0.22)', 0.004);
        for (var i = 0; i < LAMPS.length; i++) R.txt(LAMPS[i][0], -0.155, 0.075 - i * 0.062, 0.0145, '#d6dee3', 'left');
        R.box(0.2, -0.04, 0.36, 0.32, 'rgba(0,0,0,0.22)', 0.004);
        R.txt('KEY', 0.2, 0.095, 0.016, '#aebcc4');
        R.txt('RUN', 0.135, -0.005, 0.013, '#aebcc4'); R.txt('MAINT', 0.27, -0.005, 0.013, '#f0c04a');
        R.txt('LAMP TEST', 0.12, -0.175, 0.013, '#aebcc4'); R.txt('HORN', 0.285, -0.175, 0.013, '#aebcc4');
        R.box(0.2, -0.33, 0.36, 0.12, 'rgba(0,0,0,0.22)', 0.004);
        R.txt('CYCLES', 0.2, -0.255, 0.013, '#aebcc4');
        R.txt('ISOLATE BEFORE OPENING', 0, -0.495, 0.013, '#7d8a96');
      }
    });
    var parts = { lamps: {} };
    parts.amps = pkCtlGauge(P, -0.2, 0.29, { id: 'amps', unit: 'amps', min: 0, max: 40, red: 0.85, ticks: 5, r: 0.085, ease: 4,
      get: function () { return C.fault ? 0 : 0.06 + C.spd * 0.62 + (C.spd > 0.05 ? 0.05 * Math.sin(PK_BK_T * 7.3) : 0); } });
    parts.volts = pkCtlGauge(P, 0.2, 0.29, { id: 'volts', unit: 'volts', min: 0, max: 500, red: 0.9, ticks: 5, r: 0.085, ease: 2,
      get: function () { return 0.8 - C.spd * 0.03 + 0.006 * Math.sin(PK_BK_T * 1.7); } });
    for (var i = 0; i < LAMPS.length; i++) parts.lamps[LAMPS[i][0]] = pkCtlLamp(P, -0.3, 0.075 - i * 0.062, { r: 0.016, col: LAMPS[i][1] });
    parts.key = pkCtlRotary(P, 0.2, 0.035, { id: 'key', n: 2, pos: C.maint ? 1 : 0, r: 0.032, names: ['RUN', 'MAINT'], prompt: a.name + ' key switch',
      act: function (pos) {
        if (pos === 1 && (a.state === 'running' || a.riders)) { sfx('bad'); toast('Not with riders aboard ' + a.name, 'bad'); parts.key.set(0, true); return; }
        C.maint = pos === 1;
        if (C.maint) { C.gates = false; a.manualStart = false; }
        sfx('click'); toast(a.name + (C.maint ? ': MAINTENANCE - locked out' : ': key to RUN'), C.maint ? 'bad' : 'good');
        logEvent(a.name + (C.maint ? ' locked out for maintenance' : ' back in service'), C.maint ? 'bad' : '');
        screenDirtyAll(); hudDirty = true;
      } });
    var testT = 0;
    parts.test = pkCtlBtn(P, 0.12, -0.12, { id: 'lamptest', label: 'LAMP TEST', col: 'white', r: 0.026, lampCol: 0xe8e4d8, prompt: 'Lamp test',
      act: function () { testT = 2.0; C.bkTest = true; sfx('click'); } });
    parts.horn = pkCtlBtn(P, 0.285, -0.12, { id: 'horn', label: 'HORN', col: 'amber', r: 0.026, lampCol: 0xf0c04a, prompt: 'Sound the horn',
      act: function () { sfx('bell'); toast(a.name + ': stand clear', ''); } });
    var counter = touchScreen({ w: 160, h: 40, pw: 0.26, ph: 0.065, x: 0.2, y: -0.345, z: 0.008, parent: P, title: a.name + ' cycle counter',
      draw: function (c, s) {
        c.fillStyle = '#0b0606'; c.fillRect(0, 0, s.w, s.h);
        c.fillStyle = '#ff4a2e'; c.font = 'bold 30px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
        var n = String(a.cycles || 0); while (n.length < 6) n = '0' + n; c.fillText(n, s.w / 2, s.h / 2 + 1);
      } });
    PK_BK_LIVE.push({ sc: counter, g: P, every: 1.0 });
    pkCtlLive({ tick: function (dt) {
      if (testT > 0) { testT -= dt; if (testT <= 0) C.bkTest = false; }
      var all = testT > 0, blink = Math.floor(PK_BK_T * 3) % 2 === 0, L = parts.lamps;
      L['POWER'].on = true;
      L['AUTO'].on = all || (C.auto && !C.maint);
      L['GATES OPEN'].on = all || C.gateT > 0.5;
      L['BARS LOCKED'].on = all || C.bars > 0.5;
      L['IN MOTION'].on = all || a.state === 'running';
      L['FAULT'].on = all || (!!C.fault && blink);
      L['MAINT'].on = all || !!C.maint;
      if ((parts.key.pos === 1) !== !!C.maint) parts.key.set(C.maint ? 1 : 0, true);
      parts.horn.setLit(a.state === 'boarding' || a.state === 'ready');
    } });
    a.boothCabinet = parts;
    return parts;
  }

  // the desk the panel stands on: a steel cabinet the width of the window with two doors and a kick plate, in the
  // panel's own frame (local +Z toward the operator)
  function pkBkDesk(con, w) {
    w = w || 1.98;
    var caseM = pkBkStd({ color: 0x2b333a, roughness: 0.5, metalness: 0.35 });
    pkBevelBox(w, 0.70, 0.56, caseM, 0, 0.35, 0, con, 0.02);
    pkBevelBox(w + 0.04, 0.05, 0.60, pkBkStd({ color: 0x39434a, roughness: 0.45, metalness: 0.45 }), 0, 0.72, 0, con, 0.012);
    pkBevelBox(w - 0.08, 0.10, 0.02, pkBkStd({ color: 0x171d22, roughness: 0.9 }), 0, 0.05, 0.285, con, 0.006);
    [-1, 1].forEach(function (sx) {
      pkBevelBox(w / 2 - 0.17, 0.44, 0.02, pkBkStd({ color: 0x333c44, roughness: 0.55 }), sx * w / 4.2, 0.40, 0.285, con, 0.008);
      pkBevelBox(0.20, 0.035, 0.03, MAT.chrome, sx * w / 4.2, 0.52, 0.30, con, 0.006);
    });
    // a coffee mug and the ride's log book on the desk top, by the panel's end
    pkRoundCyl(0.045, 0.1, pkBkStd({ color: 0xf2efe6, roughness: 0.5 }), w / 2 - 0.12, 0.8, 0.12, con, 12);
    pkBevelBox(0.22, 0.03, 0.3, pkBkStd({ color: 0x2f4f7a, roughness: 0.7 }), -w / 2 + 0.16, 0.76, 0.1, con, 0.008);
  }
  // the operator's chair: five-star base, gas lift, seat and back
  function pkBkChair(parent, x, z, ry, y0) {
    var g = new THREE.Group(); g.position.set(x, y0 || 0, z); g.rotation.y = ry || 0; parent.add(g);
    var chairM = pkBkStd({ color: 0x222a31, roughness: 0.85 }), iron = MAT.steelDark;
    pkBevelBox(0.46, 0.08, 0.46, chairM, 0, 0.44, 0, g, 0.03);
    pkBevelBox(0.46, 0.5, 0.08, chairM, 0, 0.72, -0.24, g, 0.03);
    pkRoundCyl(0.035, 0.4, iron, 0, 0.21, 0, g, 8);
    for (var c = 0; c < 5; c++) { var arm = pkBevelBox(0.04, 0.035, 0.28, iron, Math.sin(c * 1.2566) * 0.13, 0.04, Math.cos(c * 1.2566) * 0.13, g, 0.008); arm.rotation.y = c * 1.2566; }
    return g;
  }

  // ── The booth ─────────────────────────────────────────────────────
  var PK_BK = { W: 3.8, D: 2.9, FLOOR: 0.45, WALL: 2.5, SILL: 0.95, HEAD: 2.05, T: 0.14, DOORW: 0.95, DOORZ: -0.35 };
  function pkRideBooth(a, plot, th) {
    // where it stands: beside the head of the queue, off the lane on the side away from the ride (or the plot's boothSide),
    // the window (local +Z) at the ride and the door in the side wall facing the queue
    var q = plot.q || [plot.x, plot.z], OFF = 6.6;
    var dx = plot.x - q[0], dz = plot.z - q[1], L = Math.sqrt(dx * dx + dz * dz) || 1;
    var ax = q[0] + (dx / L) * 4.4;
    var c1x = ax, c1z = q[1] + OFF, c2x = ax, c2z = q[1] - OFF, bx = c1x, bz = c1z;
    if (dist2(c2x, c2z, plot.x, plot.z) > dist2(c1x, c1z, plot.x, plot.z)) { bx = c2x; bz = c2z; }
    if (plot.boothSide === 1) { bx = c1x; bz = c1z; } else if (plot.boothSide === -1) { bx = c2x; bz = c2z; }
    var ry = Math.atan2(plot.x - bx, plot.z - bz);
    var toQ = Math.atan2(q[0] - bx, q[1] - bz);
    var ds = Math.cos(toQ - (ry + Math.PI / 2)) >= 0 ? 1 : -1;          // the door side, in local x
    var K = PK_BK, W = K.W, D = K.D, HW = W / 2, HD = D / 2, F = K.FLOOR, T = K.T, WH = K.WALL;
    var host = null, out = null;
    worldItem('booth', function () {
      host = WORLD_PARENT;
      var g = new THREE.Group(); g.position.set(bx, 0, bz); g.rotation.y = ry; parentOf(null).add(g);
      out = pkRideBoothBuild(a, th, g, ds, bx, bz, ry);
    });
    a.booth = host || out.g;
    a.boothScreen = out.screen;
    a.boothFrame = { x: bx, z: bz, ry: ry, ds: ds };
    pkCtlLamps(a);
    PK_BOOTH[a.id] = a.booth;
    return a.booth;
  }
  function pkRideBoothBuild(a, th, g, ds, bx, bz, ry) {
    var K = PK_BK, W = K.W, D = K.D, HW = W / 2, HD = D / 2, F = K.FLOOR, T = K.T, WH = K.WALL, SILL = K.SILL, HEAD = K.HEAD;
    var DW = K.DOORW, DZ = K.DOORZ, M = pkMats(), C = pkCtl(a);
    var timber = pkMatWoodRich(), plaster = pkMatPlasterRich();
    var steel = pkBkStd({ color: 0x39434a, roughness: 0.45, metalness: 0.45 });
    var dark = pkBkStd({ color: 0x20272c, roughness: 0.62, metalness: 0.3 });
    var cream = pkBkStd({ color: 0xece2cc, roughness: 0.9 });
    var theme = pkBkStd({ color: th.a, roughness: 0.6, metalness: 0.1 });
    var themeB = pkBkStd({ color: th.b, roughness: 0.6, metalness: 0.1 });
    var inner = pkBkStd({ color: 0xe9e4d8, roughness: 0.92 });
    var glass = pkMatGlassRich();
    var wy = F + WH / 2, fz = HD - T / 2, bz0 = -HD + T / 2;

    // the plinth: a stone base under the whole floor, a dark course at its foot and vents along the front
    pkBevelBox(W + 0.2, F, D + 0.2, pkMatStone(), 0, F / 2, 0, g, 0.03);
    pkBevelBox(W + 0.26, 0.08, D + 0.26, M.stoneDark, 0, 0.04, 0, g, 0.01);
    [-1.1, 0, 1.1].forEach(function (vx) { pkBevelBox(0.36, 0.12, 0.02, dark, vx, 0.24, HD + 0.105, g, 0.006); });
    pkBevelBox(W, 0.06, D, timber, 0, F + 0.03, 0, g, 0.01);                                   // the boarded floor
    pkBevelBox(W - 0.6, 0.012, 1.0, MAT.rubberMat || dark, 0.1, F + 0.066, 0.25, g, 0.004);     // the anti-fatigue mat at the desk

    // the front: theme panel to the sill, glass, header; steel frame and mullions
    pkBevelBox(W, SILL, T, theme, 0, F + SILL / 2, fz, g, 0.015);
    pkBevelBox(W + 0.02, 0.08, T + 0.04, themeB, 0, F + SILL - 0.04, fz + 0.01, g, 0.01);
    pkBevelBox(W, WH - HEAD, T, cream, 0, F + HEAD + (WH - HEAD) / 2, fz, g, 0.015);
    pkBevelBox(W - 0.2, HEAD - SILL, 0.04, glass, 0, F + (SILL + HEAD) / 2, fz + 0.03, g, 0.01);
    pkBevelBox(W, 0.09, 0.12, steel, 0, F + SILL, fz + 0.03, g, 0.01);
    pkBevelBox(W, 0.09, 0.12, steel, 0, F + HEAD, fz + 0.03, g, 0.01);
    [-0.65, 0.65].forEach(function (mx) { pkBevelBox(0.06, HEAD - SILL, 0.1, steel, mx, F + (SILL + HEAD) / 2, fz + 0.03, g, 0.01); });
    [-1, 1].forEach(function (sx) { pkBevelBox(0.14, WH, 0.18, steel, sx * (HW - 0.07), wy, HD - 0.09, g, 0.012); pkBevelBox(0.14, WH, 0.18, steel, sx * (HW - 0.07), wy, -HD + 0.09, g, 0.012); });
    // the hazard band along the kick plate
    for (var hz = 0; hz < 22; hz++) {
      var hzc = -HW + 0.09 + hz * 0.17;
      pkBevelBox(0.08, 0.1, 0.02, pkBkStd({ color: 0x111417, roughness: 0.7 }), hzc, F + 0.08, fz + 0.08, g, 0.004);
      pkBevelBox(0.08, 0.1, 0.02, pkBkStd({ color: 0xc9a227, roughness: 0.7 }), hzc + 0.085, F + 0.08, fz + 0.08, g, 0.004);
    }

    // the sides: glazed over the front half on both; the door side has its door behind the window, the far side a solid back
    var winZ0 = DZ + DW / 2 + 0.12, winZ1 = HD - 0.18;                 // the side windows run from just ahead of the door to the front
    [-1, 1].forEach(function (sx) {
      var wx = sx * (HW - T / 2);
      // the glazed front part, the same on both sides
      pkBevelBox(T, SILL, winZ1 - winZ0 + 0.18, theme, wx, F + SILL / 2, (winZ0 + winZ1 + 0.18) / 2, g, 0.012);
      pkBevelBox(0.04, HEAD - SILL, winZ1 - winZ0, glass, wx + sx * 0.03, F + (SILL + HEAD) / 2, (winZ0 + winZ1) / 2, g, 0.008);
      pkBevelBox(T, WH - HEAD, winZ1 - winZ0 + 0.18, cream, wx, F + HEAD + (WH - HEAD) / 2, (winZ0 + winZ1 + 0.18) / 2, g, 0.012);
      pkBevelBox(0.12, 0.08, winZ1 - winZ0, steel, wx + sx * 0.02, F + SILL, (winZ0 + winZ1) / 2, g, 0.008);
      if (sx !== ds) {
        pkBevelBox(T, WH, winZ0 + HD, cream, wx, wy, (winZ0 - HD) / 2, g, 0.015);
        pkBevelBox(T + 0.02, SILL, winZ0 + HD, theme, wx, F + SILL / 2, (winZ0 - HD) / 2, g, 0.012);
        return;
      }
      // the door side: a pier between window and door, the door opening, the wall behind it
      var d0 = DZ - DW / 2, d1 = DZ + DW / 2;
      pkBevelBox(T, WH, winZ0 - d1, cream, wx, wy, (d1 + winZ0) / 2, g, 0.012);
      pkBevelBox(T, WH, d0 + HD, cream, wx, wy, (d0 - HD) / 2, g, 0.012);
      pkBevelBox(T, WH - 2.05, DW, cream, wx, F + 2.05 + (WH - 2.05) / 2, DZ, g, 0.012);
      [d0 - 0.04, d1 + 0.04].forEach(function (jz) { pkBevelBox(T + 0.07, 2.1, 0.08, theme, wx, F + 1.05, jz, g, 0.01); });
      pkBevelBox(T + 0.07, 0.09, DW + 0.16, theme, wx, F + 2.08, DZ, g, 0.01);
      // the door, propped open against the wall behind it, with its wired glass and push plate
      var leaf = new THREE.Group(); leaf.position.set(wx + sx * 0.02, F, d0); leaf.rotation.y = sx * 1.55; g.add(leaf);
      pkBevelBox(0.05, 2.0, DW - 0.06, cream, 0, 1.0, DW / 2, leaf, 0.012);
      pkBevelBox(0.055, 0.5, 0.34, glass, 0, 1.45, DW / 2, leaf, 0.008);
      pkBevelBox(0.065, 0.18, 0.08, MAT.chrome, sx * 0.02, 1.0, DW - 0.14, leaf, 0.01);
      pkBevelBox(0.06, 0.16, DW - 0.1, dark, 0, 0.1, DW / 2, leaf, 0.006);
      // three steps up to the door, with a handrail each side, and the landing
      for (var st = 0; st < 3; st++) {
        var sh = F * (3 - st) / 3;
        pkBevelBox(0.32, sh, DW + 0.4, pkMatStone(), wx + sx * (0.2 + st * 0.3), sh / 2, DZ, g, 0.02);
      }
      [-1, 1].forEach(function (rz) {
        var rzz = DZ + rz * (DW / 2 + 0.16);
        pkRoundCyl(0.025, 0.95, MAT.steelDark, wx + sx * 1.0, 0.475, rzz, g, 8);
        pkRoundCyl(0.025, 0.95, MAT.steelDark, wx + sx * 0.2, F + 0.475, rzz, g, 8);
        pkRod(wx + sx * 1.0, 0.95, rzz, wx + sx * 0.2, F + 0.95, rzz, 0.022, MAT.steelDark, g, 6);
      });
      // the queue board on its own post at the front corner, facing the queue; the lamp, the fire point and the staff sign
      var postX = sx * (HW + 0.75), postZ = HD - 0.15;
      pkRoundCyl(0.05, 2.1, MAT.steelDark, postX, 1.05, postZ, g, 10);
      pkBevelBox(0.3, 0.12, 0.3, M.stoneDark, postX, 0.06, postZ, g, 0.02);
      pkBkWaitBoard(a, g, postX + sx * 0.06, 2.35, postZ, sx * Math.PI / 2);
      pkBoothLantern(g, wx + sx * 0.12, F + 2.0, d1 + 0.32);
      pkBkFirePoint(g, wx + sx * 0.08, F + 0.65, d0 - 0.42, sx * Math.PI / 2);
      pkSign3D(['STAFF ONLY'], 0.5, 0.16, wx + sx * 0.08, F + 1.55, d1 + 0.3, sx * Math.PI / 2, { bg: '#e8e3d6', fg: '#1b232c' }, g);
      pkAwning(DW + 0.5, 0.55, 0.42, pkCss(th.a), '#f3ead6', wx + sx * 0.08, F + 2.32, DZ, sx * Math.PI / 2, g);
    });

    // the back, toward the path: solid, with the services box and its conduit, a downpipe, the air unit and a notice
    pkBevelBox(W, WH, T, cream, 0, wy, bz0, g, 0.015);
    pkBevelBox(W + 0.02, SILL, T + 0.02, theme, 0, F + SILL / 2, bz0, g, 0.012);
    var ex = -ds;                                                          // the far side of the back, away from the door
    pkBevelBox(0.5, 0.62, 0.2, pkBkStd({ color: 0x8a949b, roughness: 0.45, metalness: 0.5 }), ex * 1.15, F + 1.2, bz0 - 0.17, g, 0.02);
    pkSign3D(['DANGER 400V'], 0.34, 0.1, ex * 1.15, F + 1.38, bz0 - 0.275, Math.PI, { bg: '#f0c04a', fg: '#1b232c' }, g);
    cyl(0.04, F + 0.9, MAT.steelDark, ex * 1.15, (F + 0.9) / 2, bz0 - 0.17, g, 8);
    pkRoundCyl(0.045, WH + F, MAT.steelDark, ds * (HW - 0.2), (WH + F) / 2, bz0 - 0.1, g, 8);
    var ac = new THREE.Group(); ac.position.set(0.15, F + 1.95, bz0 - 0.2); g.add(ac);
    pkBevelBox(0.9, 0.36, 0.26, pkBkStd({ color: 0xe6e3da, roughness: 0.5 }), 0, 0, 0, ac, 0.03);
    var grille = new THREE.Mesh(new THREE.CircleGeometry(0.14, 20), dark); grille.position.set(0.22, 0, -0.131); grille.rotation.y = Math.PI; ac.add(grille);
    var acFan = new THREE.Group(); acFan.position.set(0.22, 0, -0.135); acFan.userData.dynamic = true; ac.add(acFan);
    for (var fb = 0; fb < 4; fb++) { var bl = box(0.03, 0.12, 0.005, pkBkStd({ color: 0x9aa1a6, roughness: 0.5 }), 0, 0.06, 0, null); var arm = new THREE.Group(); arm.rotation.z = fb * Math.PI / 2; acFan.add(arm); arm.add(bl); }
    for (var lv = 0; lv < 5; lv++) box(0.36, 0.02, 0.01, dark, -0.18, -0.12 + lv * 0.06, -0.133, ac);
    pkCtlLive({ tick: function (dt) { acFan.rotation.z += dt * 9; } });
    pkBkNotice(g, ds * 0.6, F + 1.25, bz0 - 0.09, Math.PI, ['RIDE OPERATOR', 'ON DUTY'], 0.5, 0.3, { bg: '#1b232c', fg: '#f5b53d' });
    pkPlanter(1.3, g, ex * 0.6, 0, -HD - 0.6);

    // the roof: the ride's striped canopy, the signal tower on its ridge, a camera at the front corner on the far side
    var roof = pkBoothTentRoof(g, { w: W, d: D, wallTop: F + WH, roofA: pkCss(th.a), roofB: '#f3ead6', trimMat: theme, roofH: 1.0 });
    pkBkStack(a, g, -ds * 0.5, roof.roofY - 0.42, -0.3);
    pkBkCamera(g, -ds * (HW + 0.04), F + WH - 0.25, HD - 0.3, -ds * Math.PI / 2 + ds * 0.5, 0.55);
    pkPlanter(1.5, g, -0.95, 0, HD + 0.65);
    pkPlanter(1.5, g, 0.95, 0, HD + 0.65);
    pkSign3D(['RIDE CONTROL', th.name.toUpperCase()], 2.4, 0.34, 0, F + 0.56, HD + 0.08, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);

    // ── inside ──
    // the walls inside: a timber wainscot round the room under a cream finish, and the ceiling
    pkBevelBox(W - 0.3, 0.8, 0.03, timber, 0, F + 0.46, bz0 + 0.085, g, 0.01);
    pkBevelBox(W - 0.28, 0.04, 0.05, MAT.trim, 0, F + 0.88, bz0 + 0.09, g, 0.008);
    box(W - 0.2, 0.04, D - 0.2, inner, 0, F + WH - 0.02, 0, g);
    pkBkBatten(g, 0, F + WH - 0.07, -0.25, 0, 1.4);

    // the desk under the front window, the ride's panel on it, the chair behind
    var con = new THREE.Group(); con.position.set(0, F, HD - 0.5); con.rotation.y = Math.PI; g.add(con);
    pkBkDesk(con, 2.6);
    pkBoothPanel(a, con);
    pkBkChair(g, 0.15, HD - 1.35, Math.PI, F);
    // the CCTV monitors hang from the ceiling over the desk, toed in at the chair
    pkBkMonitors(a, g, 0, F + 1.92, HD - 0.36, Math.PI, 0.3);

    // the far wall, inside: the ride control cabinet; above it the fan on its bracket
    var fx = -ds * (HW - T - 0.11);
    pkBkCabinet(a, g, fx, F + 1.42, -0.55, ds * Math.PI / 2);
    pkBkFan(g, fx + ds * 0.05, F + 2.2, 0.35, ds * Math.PI / 2 + ds * 0.4);

    // the back wall, inside: the status board in the middle, the clock and intercom by the door, the key box, the checklist,
    // the first-aid box, the radio on its shelf and the vest on its hook
    var bw = bz0 + T / 2 + 0.01;
    var screen = touchScreen({
      w: 420, h: 300, pw: 1.0, ph: 0.72, x: -ds * 0.35, y: F + 1.5, z: bw + 0.02, ry: 0, parent: g, title: a.name,
      draw: function (ctx, s) {
        scBg(ctx, s.w, s.h);
        var status = pkBoothStatus(a, C);
        var statusCol = C.fault || C.maint ? '#ff6b5e' : (a.state === 'running' ? '#ff9d6b' : (a.state === 'idle' && !a.queue.length ? '#a0acb8' : '#5fd38d'));
        scHead(ctx, s.w, a.name.toUpperCase(), status);
        scText(ctx, 16, 66, 'ON RIDE', '#a0acb8');
        scText(ctx, 16, 92, a.riders + ' / ' + a.seats.length, a.riders ? '#5fd38d' : '#eef1f5', 22);
        scText(ctx, 160, 66, 'QUEUE', '#a0acb8');
        scText(ctx, 160, 92, String(a.queue.length), a.queue.length ? '#f0c04a' : '#eef1f5', 22);
        scText(ctx, 290, 66, 'WAIT', '#a0acb8');
        scText(ctx, 290, 92, pkBkWait(a) + ' min', '#eef1f5', 22);
        var pills = [['GATES', C.gates ? 'OPEN' : 'SHUT', C.gates], ['BARS', C.barsWant > 0.5 ? 'DOWN' : 'UP', C.barsWant > 0.5], ['MODE', C.maint ? 'MAINT' : (C.auto ? 'AUTO' : 'MANUAL'), C.auto && !C.maint]];
        for (var pl = 0; pl < pills.length; pl++) {
          var px2 = 16 + pl * 132, py2 = 112;
          ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(px2, py2, 120, 54);
          ctx.strokeStyle = pills[pl][2] ? 'rgba(95,211,141,0.55)' : 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5; ctx.strokeRect(px2, py2, 120, 54);
          ctx.fillStyle = '#8b98a4'; ctx.font = '12px ' + SCREEN_THEME.font; ctx.fillText(pills[pl][0], px2 + 10, py2 + 20);
          ctx.fillStyle = pills[pl][2] ? '#5fd38d' : '#d7dee4'; ctx.font = 'bold 17px ' + SCREEN_THEME.font; ctx.fillText(pills[pl][1], px2 + 10, py2 + 42);
        }
        scText(ctx, 16, 196, C.fault ? 'STOP LATCHED - TURN THE MUSHROOM TO RESET' : (C.maint ? 'KEY SWITCH IN MAINT - TURN IT TO RUN' : 'SIGNAL  ' + status), statusCol, 14);
        scText(ctx, 16, 230, 'TODAY', '#a0acb8');
        scText(ctx, 100, 230, 'Cycles ' + (a.cycles || 0), '#eef1f5');
        scText(ctx, 230, 230, 'Tests ' + (a.tests || 0), '#eef1f5');
        scText(ctx, 16, 268, 'Desk: gates, bars, dispatch, test, auto, stop.  Cabinet: key, lamp test, horn.', '#8b98a4', 12);
      }
    });
    var dx = ds * (HW - 0.55);                                              // the door end of the back wall
    pkBkClock(g, dx, F + 2.05, bw + 0.02, 0, 0.15);
    pkBkIntercom(g, dx + ds * 0.02, F + 1.45, bw, 0);
    pkBkKeyBox(g, dx - ds * 0.05, F + 0.98 + 0.12, bw, 0);
    pkBkClipboard(g, ds * 0.42, F + 1.55, bw + 0.012, 0);
    pkBkFirstAid(g, -ds * (HW - 0.45), F + 2.05, bw, 0);
    var shelf = -ds * (HW - 0.45);
    pkBevelBox(0.5, 0.03, 0.2, timber, shelf, F + 1.0, bw + 0.1, g, 0.006);
    pkBkRadio(g, shelf + 0.06, F + 1.015, bw + 0.1, 0);
    pkBkVest(g, ds * (HW - T - 0.06), F + 1.85, DZ - DW / 2 - 0.3, -ds * Math.PI / 2);
    pkRoundCyl(0.14, 0.32, pkBkStd({ color: 0x39424a, roughness: 0.8 }), -ds * 0.95, F + 0.16, -0.65, g, 12);   // the bin

    // ── collision: the plinth is a step, the walls are solid, the doorway, the steps and the floor stay walkable ──
    function wp(lx, lz) { var c = Math.cos(ry), s = Math.sin(ry); return [bx + lx * c + lz * s, bz - lx * s + lz * c]; }
    function wallSolid(lx0, lz0, lx1, lz1, y1) {
      var N = 8;
      for (var i = 0; i < N; i++) {
        var p0 = wp(lx0 + (lx1 - lx0) * i / N, lz0 + (lz1 - lz0) * i / N), p1 = wp(lx0 + (lx1 - lx0) * (i + 1) / N, lz0 + (lz1 - lz0) * (i + 1) / N);
        solid(Math.min(p0[0], p1[0]) - 0.07, Math.max(p0[0], p1[0]) + 0.07, Math.min(p0[1], p1[1]) - 0.07, Math.max(p0[1], p1[1]) + 0.07, 0, F + WH + 0.3);
      }
    }
    function boxSolid(lx, lz, hw, hd, y1) {
      var pts = [wp(lx - hw, lz - hd), wp(lx + hw, lz - hd), wp(lx - hw, lz + hd), wp(lx + hw, lz + hd)];
      var x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (var k = 0; k < 4; k++) { x0 = Math.min(x0, pts[k][0]); x1 = Math.max(x1, pts[k][0]); z0 = Math.min(z0, pts[k][1]); z1 = Math.max(z1, pts[k][1]); }
      solid(x0, x1, z0, z1, 0, y1);
    }
    wallSolid(-HW, bz0, HW, bz0);
    wallSolid(-HW, fz, HW, fz);
    var owx = ds * (HW - T / 2), dgap = DW / 2 + 0.1;
    wallSolid(owx, -HD, owx, DZ - dgap);
    wallSolid(owx, DZ + dgap, owx, HD);
    wallSolid(-owx, -HD, -owx, HD);
    for (var ci = 0; ci < 10; ci++) boxSolid(-1.3 + (ci + 0.5) * 0.26, HD - 0.5, 0.13, 0.28, F + 1.3);     // the desk
    boxSolid(-ds * (HW - 0.3), -0.55, 0.16, 0.45, F + 2.0);                                               // the cabinet
    boxSolid(ds * (HW + 0.75), HD - 0.15, 0.09, 0.09, 2.3);                                               // the queue board's post
    // the handrails keep the steps to their width
    [-1, 1].forEach(function (rz) { var p0 = wp(owx + ds * 0.2, DZ + rz * (DW / 2 + 0.16)), p1 = wp(owx + ds * 1.0, DZ + rz * (DW / 2 + 0.16)); solid(Math.min(p0[0], p1[0]) - 0.05, Math.max(p0[0], p1[0]) + 0.05, Math.min(p0[1], p1[1]) - 0.05, Math.max(p0[1], p1[1]) + 0.05, 0, 1.4); });
    return { g: g, screen: screen };
  }

  // the floor of a booth is up its steps: the player and the guests stand on it, and climb the steps to it
  function pkBkFloorAt(x, z) {
    for (var i = 0; i < PK.attractions.length; i++) {
      var a = PK.attractions[i], f = a.boothFrame; if (!f) continue;
      var dx = x - f.x, dz = z - f.z, c = Math.cos(f.ry), s = Math.sin(f.ry);
      var lx = dx * c - dz * s, lz = dx * s + dz * c;
      if (Math.abs(lx) < PK_BK.W / 2 && Math.abs(lz) < PK_BK.D / 2) return PK_BK.FLOOR;
      var o = (lx - f.ds * PK_BK.W / 2) * f.ds;                           // out from the door wall
      if (o >= 0 && o < 0.95 && Math.abs(lz - PK_BK.DOORZ) < PK_BK.DOORW / 2 + 0.2) return PK_BK.FLOOR * clamp(1 - o / 0.95, 0, 1);
    }
    return 0;
  }

  // ── Live: the canvases repaint while the player is close enough to read them ──
  pkCtlLive({ tick: function (dt) {
    PK_BK_T += dt;
    var px = typeof player !== 'undefined' && player ? player.x : 0, pz = typeof player !== 'undefined' && player ? player.z : 0;
    for (var i = 0; i < PK_BK_LIVE.length; i++) {
      var L = PK_BK_LIVE[i];
      L.t = (L.t || Math.random() * L.every) + dt;
      if (L.t < L.every) continue;
      L.t = 0;
      L.g.getWorldPosition(PK_BK_V);
      if ((PK_BK_V.x - px) * (PK_BK_V.x - px) + (PK_BK_V.z - pz) * (PK_BK_V.z - pz) < 900) L.sc.dirty = true;
    }
  } });
  var PK_BK_V = new THREE.Vector3();
