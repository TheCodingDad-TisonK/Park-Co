//@ Park Co, part 25: the owner's PC - a proper workstation on the office desk, and Park OS on it: a desktop with seven apps that run the park
  // ── What it is ────────────────────────────────────────────────────
  // On the desk: an ultrawide main screen on an aluminium stand with a webcam and a bias light behind it, a second screen
  // turned toward the chair with the live park map, a soundbar, a lit keyboard and mouse on a desk mat, a mug. Beside the desk
  // on the floor: the tower, a glass side with three lit fans and a lit graphics card. The lights cycle slowly through colour.
  // On the main screen, Park OS: a lock screen that wakes on a tap and locks itself when you walk away, a top bar with the
  // day, the time and the bank, a dock of apps down the left, and the apps:
  //   Dashboard  the day at a glance: the bank, guests, rides open, tickets, the bank through the day, alerts, the level
  //   Finance    the ticket and snack prices with buttons to change them, the wages, today, and the ledger
  //   Rides      every ride, its state, queue, riders and cycles, open or shut it; the coaster's AUTO and its service
  //   Guests     where the guests are (arriving, queuing, riding, walking, leaving) and the longest queues
  //   Staff      hire or let go the clerk and the operator, and everyone on duty: who, what, where
  //   Security   four live cameras over the park: the paths, the rides, the guests, the staff and the guards
  //   Inbox      the park's news, newest first
  // Every button is a tap zone on the screen (E or a click while aiming at it); the full management panel is a tap away.
  var PK_PC = { app: 'home', awake: false, idle: 0, page: 0, hist: [], lastSample: -1, sc: null, side: null, x: 0, z: 0, hue: 0, rgb: [] };
  var PK_PC_APPS = [['home', 'Dashboard', '#f5b53d'], ['money', 'Finance', '#5fd38d'], ['rides', 'Rides', '#ff8a5c'], ['guests', 'Guests', '#8fc3ff'],
    ['staff', 'Staff', '#c79bff'], ['cctv', 'Security', '#ff6b5e'], ['mail', 'Inbox', '#f0d58a']];
  var PK_PC_W = 960, PK_PC_H = 420, PK_PC_SIDE = 150, PK_PC_TOP = 30;

  // ── The hardware ──────────────────────────────────────────────────
  function pkHQOwnerPC(x, y, z) {
    var S2 = pkBkStd, alu = S2({ color: 0xb9bec4, roughness: 0.32, metalness: 0.85 }), black = S2({ color: 0x15181b, roughness: 0.45, metalness: 0.3 });
    var dark = S2({ color: 0x23282d, roughness: 0.6, metalness: 0.2 }), steel = S2({ color: 0x2f363c, roughness: 0.5, metalness: 0.6 });
    var pc = new THREE.Group(); pc.position.set(x, y, z); scene.add(pc);
    var lit = new THREE.Group(); lit.userData.dynamic = true; pc.add(lit);                     // the lights that change colour: never baked
    PK_PC.x = x; PK_PC.z = z;
    function rgb() { var m = new THREE.MeshBasicMaterial({ color: 0xffffff }); m.userData.noBake = true; PK_PC.rgb.push(m); return m; }

    // the desk mat, the keyboard and the mouse
    pkBevelBox(0.92, 0.004, 0.4, S2({ color: 0x1b2129, roughness: 0.95 }), -0.02, 0.002, 0.2, pc, 0.002);
    box(0.92, 0.0045, 0.006, S2({ color: 0xc9a227, roughness: 0.4, metalness: 0.7 }), -0.02, 0.003, 0.398, pc);
    var keyTex = tex(512, 160, pkPCKeyboardArt, 1, 1);
    pkBevelBox(0.46, 0.022, 0.15, black, -0.08, 0.013, 0.2, pc, 0.006);
    var keys = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.135), new THREE.MeshStandardMaterial({ map: keyTex, roughness: 0.55 }));
    keys.rotation.x = -Math.PI / 2 + 0.06; keys.position.set(-0.08, 0.026, 0.2); pc.add(keys);
    box(0.44, 0.003, 0.004, rgb(), -0.08, 0.004, 0.276, lit);                                   // the underglow along its front
    pkBevelBox(0.065, 0.032, 0.11, black, 0.31, 0.018, 0.21, pc, 0.028);                       // a wireless mouse
    box(0.006, 0.003, 0.05, rgb(), 0.31, 0.035, 0.18, lit);
    // the main screen: an ultrawide on an aluminium stand, a webcam on its top edge, a bias light behind it
    var mon = new THREE.Group(); mon.position.set(0, 0.36, -0.36); mon.rotation.x = -0.05; pc.add(mon);
    pkBevelBox(1.06, 0.5, 0.03, black, 0, 0, -0.012, mon, 0.012);
    pkBevelBox(0.4, 0.22, 0.05, dark, 0, 0, -0.045, mon, 0.02);
    box(1.0, 0.012, 0.012, alu, 0, -0.256, 0.0, mon);                                          // the chin
    pkBevelBox(0.07, 0.034, 0.03, black, 0, 0.268, 0.004, mon, 0.01);
    sphere(0.008, S2({ color: 0x0a0c0e, roughness: 0.1, metalness: 0.4 }), 0, 0.268, 0.02, mon);
    // the bias light: a soft glow on the air behind the screen, brightest at its middle
    var glow = tex(128, 128, function (cx, w, h) { var r = cx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2); r.addColorStop(0, 'rgba(255,255,255,0.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); cx.fillStyle = r; cx.fillRect(0, 0, w, h); }, 1, 1);
    var biasM = new THREE.MeshBasicMaterial({ map: glow, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }); biasM.userData.noBake = true; PK_PC.rgb.push(biasM);
    var bias = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), biasM); bias.position.set(0, 0.38, -0.44); lit.add(bias);
    pkBevelBox(0.07, 0.3, 0.035, alu, 0, 0.17, -0.42, pc, 0.012);                              // the stand's neck
    pkBevelBox(0.32, 0.012, 0.22, alu, 0, 0.006, -0.38, pc, 0.006);                             // and its foot
    var sc = touchScreen({ w: PK_PC_W, h: PK_PC_H, res: 1.5, pw: 1.0, ph: 1.0 * PK_PC_H / PK_PC_W, x: 0, y: 0, z: 0.006, parent: mon, title: 'Park OS', draw: pkPCDraw });
    PK_PC.sc = sc; PK.officeScreen = sc;
    PK_BK_LIVE.push({ sc: sc, g: mon, every: 0.5 });
    // the soundbar under it
    pkBevelBox(0.62, 0.055, 0.07, black, 0, 0.03, -0.17, pc, 0.025);
    box(0.5, 0.004, 0.002, rgb(), 0, 0.012, -0.134, lit);
    // the second screen, turned toward the chair: the live park map
    var side = new THREE.Group(); side.position.set(0.78, 0.28, -0.22); side.rotation.y = -0.55; pc.add(side);
    pkBevelBox(0.56, 0.35, 0.03, black, 0, 0, -0.012, side, 0.01);
    pkBevelBox(0.05, 0.26, 0.03, alu, 0, -0.13, -0.05, side, 0.01);
    pkBevelBox(0.2, 0.012, 0.16, alu, 0, -0.274, -0.05, side, 0.006);
    var ss = touchScreen({ w: 480, h: 288, pw: 0.52, ph: 0.312, x: 0, y: 0, z: 0.006, parent: side, title: 'Live park map', draw: pkPCDrawMap });
    PK_PC.side = ss; PK_BK_LIVE.push({ sc: ss, g: side, every: 1.0 });
    // a mug with the park's name
    var mug = S2({ color: 0xf4f1e6, roughness: 0.35 });
    pkRoundCyl(0.042, 0.1, mug, -0.86, 0.05, -0.12, pc, 16);
    pkRoundCyl(0.036, 0.004, S2({ color: 0x3a2418, roughness: 0.2 }), -0.86, 0.097, -0.12, pc, 14);
    var handle = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.007, 6, 12), mug); handle.position.set(-0.81, 0.05, -0.12); handle.rotation.y = Math.PI / 2; pc.add(handle);
    box(0.05, 0.03, 0.002, S2({ color: 0xf5b53d, roughness: 0.5 }), -0.86, 0.055, -0.078, pc);

    // the tower, on the floor beside the desk, its glass side to the room
    var tw = new THREE.Group(); tw.position.set(-1.72, -y + PK_HQ.lv[2], -0.1); pc.add(tw);
    var twLit = new THREE.Group(); twLit.userData.dynamic = true; tw.add(twLit);
    pkBevelBox(0.46, 0.5, 0.22, black, 0, 0.27, 0, tw, 0.012);
    [[-0.19, 0.19], [0.19, 0.19], [-0.19, -0.09], [0.19, -0.09]].forEach(function (f) { pkRoundCyl(0.02, 0.02, steel, f[0], 0.01, f[1] * 0.4, tw, 8); });
    box(0.42, 0.44, 0.004, S2({ color: 0x1a2a33, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.35 }), 0, 0.28, 0.112, tw);
    box(0.4, 0.42, 0.004, S2({ color: 0x0c0f12, roughness: 0.8 }), 0, 0.28, -0.098, tw);      // the board, behind the glass
    box(0.22, 0.05, 0.12, S2({ color: 0x2a3036, roughness: 0.4, metalness: 0.6 }), -0.08, 0.22, 0.0, tw);   // the graphics card
    box(0.2, 0.006, 0.002, rgb(), -0.08, 0.245, 0.061, twLit);
    box(0.08, 0.08, 0.06, S2({ color: 0x3b444c, roughness: 0.3, metalness: 0.8 }), -0.08, 0.38, -0.05, tw);  // the cooler
    // three fans up the front, facing the glass
    PK_PC.fans = [];
    [[0.13, 0.42], [0.13, 0.27], [0.13, 0.12]].forEach(function (f) {
      var fan = new THREE.Group(); fan.position.set(f[0], f[1], 0.02); twLit.add(fan);
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.007, 6, 24), rgb()); fan.add(ring);
      var hub = new THREE.Group(); fan.add(hub);
      for (var b = 0; b < 5; b++) { var arm = new THREE.Group(); arm.rotation.z = b * Math.PI * 2 / 5; hub.add(arm); box(0.018, 0.045, 0.004, S2({ color: 0x20262b, roughness: 0.6 }), 0, 0.028, 0, arm); }
      PK_PC.fans.push(hub);
    });
    sphere(0.006, glowMat(0x5fd38d, 2.0), -0.23, 0.47, 0.06, tw);                                  // the power light
    solid(x - 1.72 - 0.25, x - 1.72 + 0.25, z - 0.1 - 0.13, z - 0.1 + 0.13, PK_HQ.lv[2], PK_HQ.lv[2] + 0.55);

    // E on the keyboard: the full management panel
    hitBox(0.5, 0.12, 0.25, -0.08, 0.04, 0.2, { prompt: function () { return 'Park management (the full panel)'; }, use: function () { openPanel('admin'); } }, pc);
    return pc;
  }
  // the keycaps, printed once: rows of dark caps with pale legends, the wide keys where they belong
  function pkPCKeyboardArt(c, w, h) {
    c.fillStyle = '#111417'; c.fillRect(0, 0, w, h);
    var rows = [['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Del'], ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Bksp'],
      ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'], ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
      ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'], ['Ctrl', 'Win', 'Alt', ' ', 'Alt', 'Fn', 'Ctrl']];
    var wide = { Bksp: 1.8, Tab: 1.4, '\\': 1.4, Caps: 1.7, Enter: 2.1, Shift: 2.3, ' ': 6.4, Ctrl: 1.3, Win: 1.2, Alt: 1.2, Fn: 1.2 };
    var rh = h / rows.length;
    rows.forEach(function (r, j) {
      var units = r.reduce(function (s, k) { return s + (wide[k] || 1); }, 0), u = (w - 8) / units, cx = 4;
      r.forEach(function (k) {
        var kw = (wide[k] || 1) * u;
        c.fillStyle = '#23292f'; c.fillRect(cx + 1.5, j * rh + 2, kw - 3, rh - 4);
        c.fillStyle = '#2d343b'; c.fillRect(cx + 3, j * rh + 3, kw - 6, rh - 9);
        c.fillStyle = '#d8dee4'; c.font = (k.length > 1 ? 9 : 13) + 'px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
        if (k !== ' ') c.fillText(k, cx + kw / 2, j * rh + rh / 2 - 2);
        cx += kw;
      });
    });
  }

  // ── Park OS ───────────────────────────────────────────────────────
  function pkPCZone(sc, x, y, w, h, label, act) { sc.zones.push({ x: x, y: y, w: w, h: h, label: label, act: function () { act(); PK_PC.idle = 0; sc.dirty = true; } }); }
  function pkPCRound(c, x, y, w, h, r) { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); }
  function pkPCText(c, t, x, y, size, col, bold, align) { c.font = (bold ? 'bold ' : '') + size + 'px ' + SCREEN_THEME.font; c.fillStyle = col || '#eef1f5'; c.textAlign = align || 'left'; c.textBaseline = 'alphabetic'; c.fillText(t, x, y); c.textAlign = 'left'; }
  function pkPCPanel(c, x, y, w, h, title) {
    pkPCRound(c, x, y, w, h, 10); c.fillStyle = 'rgba(255,255,255,0.045)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,0.08)'; c.lineWidth = 1; c.stroke();
    if (title) pkPCText(c, title.toUpperCase(), x + 12, y + 20, 11, '#8b98a4', true);
  }
  function pkPCBtn(sc, x, y, w, h, label, act, on, col) { scButton(sc, x, y, w, h, label, on !== false, function () { act(); PK_PC.idle = 0; }, col); }
  function pkPCWords(id) { var s = String(id).replace(/([A-Z])/g, ' $1').toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); }
  function pkPCDraw(c, sc) {
    var W = PK_PC_W, H = PK_PC_H;
    if (!PK_PC.awake) return pkPCLock(c, sc);
    // the desktop: a deep wallpaper, the top bar, the dock
    var g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0e1620'); g.addColorStop(1, '#101d1a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(0, 0, W, PK_PC_TOP);
    pkPCText(c, 'PARK OS', 12, 20, 13, '#f5b53d', true);
    var app = PK_PC_APPS.filter(function (a) { return a[0] === PK_PC.app; })[0];
    pkPCText(c, app ? app[1] : '', 92, 20, 13, '#d7dee4');
    pkPCText(c, 'Day ' + S.day + '   ' + fmtTime(S.time) + '   ' + money(S.bank), W - 14, 20, 13, '#d7dee4', false, 'right');
    c.fillStyle = PK.closed ? '#ff6b5e' : '#5fd38d'; c.beginPath(); c.arc(W - 250, 15, 4, 0, 6.283); c.fill();
    pkPCText(c, PK.closed ? 'CLOSED' : 'OPEN', W - 240, 20, 11, PK.closed ? '#ff6b5e' : '#5fd38d', true);
    // the dock
    c.fillStyle = 'rgba(0,0,0,0.28)'; c.fillRect(0, PK_PC_TOP, PK_PC_SIDE, H - PK_PC_TOP);
    PK_PC_APPS.forEach(function (a, i) {
      var y = PK_PC_TOP + 8 + i * 40, on = a[0] === PK_PC.app;
      if (on) { pkPCRound(c, 6, y, PK_PC_SIDE - 12, 36, 8); c.fillStyle = 'rgba(255,255,255,0.09)'; c.fill(); }
      pkPCRound(c, 14, y + 5, 26, 26, 7); c.fillStyle = a[2]; c.fill();
      pkPCText(c, a[1].charAt(0), 27, y + 24, 15, '#14181c', true, 'center');
      pkPCText(c, a[1], 50, y + 23, 14, on ? '#ffffff' : '#c3ccd4', on);
      pkPCZone(sc, 6, y, PK_PC_SIDE - 12, 36, a[1], function () { PK_PC.app = a[0]; PK_PC.page = 0; });
    });
    pkPCBtn(sc, 10, H - 82, PK_PC_SIDE - 20, 30, 'Full panel', function () { openPanel('admin'); });
    pkPCBtn(sc, 10, H - 44, PK_PC_SIDE - 20, 30, 'Lock', function () { PK_PC.awake = false; }, false);
    var X = PK_PC_SIDE + 12, Y = PK_PC_TOP + 12, CW = W - X - 12, CH = H - Y - 12;
    ({ home: pkPCHome, money: pkPCMoney, rides: pkPCRides, guests: pkPCGuests, staff: pkPCStaff, cctv: pkPCCctv, mail: pkPCMail }[PK_PC.app] || pkPCHome)(c, sc, X, Y, CW, CH);
  }
  // the lock screen: the time, big, over the wallpaper; a tap anywhere signs in
  function pkPCLock(c, sc) {
    var W = PK_PC_W, H = PK_PC_H, g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#13243a'); g.addColorStop(1, '#0b1418'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    [[180, 320, 220, 'rgba(245,181,61,0.10)'], [760, 90, 260, 'rgba(95,211,141,0.08)'], [520, 380, 160, 'rgba(143,195,255,0.07)']].forEach(function (b) { var r = c.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]); r.addColorStop(0, b[3]); r.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = r; c.fillRect(0, 0, W, H); });
    pkPCText(c, fmtTime(S.time), W / 2, 196, 104, '#f4f1e6', true, 'center');
    pkPCText(c, 'Day ' + S.day + '  ·  ' + (PK.closed ? 'the gate is shut' : 'the gate is open') + '  ·  ' + PK.guests.length + ' guests', W / 2, 236, 18, '#c3ccd4', false, 'center');
    pkPCRound(c, W / 2 - 110, 290, 220, 44, 22); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fill();
    pkPCText(c, 'Tap to sign in', W / 2, 318, 17, '#ffffff', true, 'center');
    pkPCText(c, 'PARK CO', 24, H - 22, 15, '#f5b53d', true);
    pkPCZone(sc, 0, 0, W, H, 'Sign in to Park OS', function () { PK_PC.awake = true; });
  }
  function pkPCTile(c, x, y, w, h, label, value, col, sub) {
    pkPCPanel(c, x, y, w, h);
    pkPCText(c, label.toUpperCase(), x + 14, y + 22, 11, '#8b98a4', true);
    pkPCText(c, value, x + 14, y + 52, 26, col || '#eef1f5', true);
    if (sub) pkPCText(c, sub, x + 14, y + h - 10, 11, '#8b98a4');
  }
  // the alerts: what wants the owner's attention now
  function pkPCAlerts() {
    var out = [];
    if (PK.ride.fault) out.push(['The coaster is stopped: ' + PK.ride.fault, '#ff6b5e']);
    if ((S.wear || 0) >= 60) out.push(['The coaster wants a service (' + Math.round(S.wear) + ' % wear)', '#f0c04a']);
    PK.attractions.forEach(function (a) {
      if (a.ctl && a.ctl.fault) out.push([a.name + ' is stopped', '#ff6b5e']);
      else if (a.ctl && a.ctl.maint) out.push([a.name + ' is in maintenance', '#f0c04a']);
      else { var wq = pkAttrWaiting(a); if (wq >= 8) out.push([a.name + ': ' + wq + ' in the queue', '#f0c04a']); }
    });
    var tq = PK.booths.reduce(function (s, b) { return s + b.queue.length; }, 0);
    if (!S.clerk && tq >= 4) out.push(['No clerk: ' + tq + ' waiting at the windows', '#f0c04a']);
    if (S.bank < 0) out.push(['The bank is overdrawn', '#ff6b5e']);
    return out;
  }
  function pkPCHome(c, sc, X, Y, W, H) {
    var tw = (W - 30) / 4;
    pkPCTile(c, X, Y, tw, 78, 'Bank', money(S.bank), '#f5b53d', 'earned today ' + money(PK.today.earned || 0));
    pkPCTile(c, X + (tw + 10), Y, tw, 78, 'Guests', String(PK.guests.length), '#8fc3ff', 'in the park now');
    pkPCTile(c, X + (tw + 10) * 2, Y, tw, 78, 'Rides open', pkOpenCount() + ' / ' + (PK.attractions.length + 1), '#5fd38d', S.coasterKey ? 'coaster key on' : 'coaster key off');
    pkPCTile(c, X + (tw + 10) * 3, Y, tw, 78, 'Tickets', String(PK.today.tickets), '#eef1f5', 'rides ridden ' + PK.today.rides);
    // the gate: yours to open and shut, not the clock
    var gy = Y + 90;
    pkPCPanel(c, X, gy, W, 34);
    pkPCText(c, S.gateOpen ? 'The gate is open' : 'The gate is shut', X + 14, gy + 22, 14, S.gateOpen ? '#5fd38d' : '#ff8a5c', true);
    pkPCBtn(sc, X + W - 150, gy + 5, 136, 24, S.gateOpen ? 'Shut the gate' : 'Open the gate', pkGateToggle, true, S.gateOpen ? '#ff8a5c' : '#5fd38d');
    // the bank through the day
    var cy = gy + 44, cw = W * 0.6, ch = H - 134 - 46;
    pkPCPanel(c, X, cy, cw, ch, 'The bank today');
    var pts = PK_PC.hist.filter(function (p) { return p.d === S.day; });
    if (pts.length > 1) {
      var lo = Math.min.apply(null, pts.map(function (p) { return p.v; })), hi = Math.max.apply(null, pts.map(function (p) { return p.v; })); if (hi - lo < 1) { hi += 1; lo -= 1; }
      var px = function (t) { return X + 14 + (t / 24) * (cw - 28); }, py = function (v) { return cy + ch - 16 - (v - lo) / (hi - lo) * (ch - 50); };
      c.beginPath(); c.moveTo(px(pts[0].t), cy + ch - 16); pts.forEach(function (p) { c.lineTo(px(p.t), py(p.v)); }); c.lineTo(px(pts[pts.length - 1].t), cy + ch - 16); c.closePath();
      var ag = c.createLinearGradient(0, cy + 30, 0, cy + ch); ag.addColorStop(0, 'rgba(245,181,61,0.35)'); ag.addColorStop(1, 'rgba(245,181,61,0)'); c.fillStyle = ag; c.fill();
      c.beginPath(); pts.forEach(function (p, i) { if (i) c.lineTo(px(p.t), py(p.v)); else c.moveTo(px(p.t), py(p.v)); }); c.strokeStyle = '#f5b53d'; c.lineWidth = 2.5; c.stroke();
      pkPCText(c, money(hi), X + cw - 14, cy + 20, 11, '#8b98a4', false, 'right'); pkPCText(c, money(lo), X + cw - 14, cy + ch - 20, 11, '#8b98a4', false, 'right');
      [9, 12, 15, 18, 21].forEach(function (hr) { pkPCText(c, hr + ':00', px(hr), cy + ch - 3, 10, '#6b7781', false, 'center'); });
    } else pkPCText(c, 'The day has only just begun.', X + 14, cy + 60, 14, '#8b98a4');
    // the alerts
    var ax = X + cw + 10, aw = W - cw - 10;
    pkPCPanel(c, ax, cy, aw, ch, 'Alerts');
    var al = pkPCAlerts();
    if (!al.length) { pkPCText(c, 'All clear', ax + 14, cy + 52, 18, '#5fd38d', true); pkPCText(c, 'Nothing wants you now.', ax + 14, cy + 74, 12, '#8b98a4'); }
    al.slice(0, 7).forEach(function (a, i) { c.fillStyle = a[1]; c.beginPath(); c.arc(ax + 18, cy + 42 + i * 24, 4, 0, 6.283); c.fill(); c.save(); c.font = '13px ' + SCREEN_THEME.font; var t = scFit(c, a[0], aw - 40); c.restore(); pkPCText(c, t, ax + 30, cy + 47 + i * 24, 13, '#d7dee4'); });
    // the level
    var L = PK_LEVELS[PK.level - 1], N = PK_LEVELS[PK.level], ly = Y + H - 34;
    pkPCPanel(c, X, ly, W, 34);
    pkPCText(c, 'Level ' + PK.level + '  ' + (L ? L.name : ''), X + 14, ly + 22, 13, '#eef1f5', true);
    var f = N ? clamp((PK.xp - L.xp) / (N.xp - L.xp), 0, 1) : 1, bx = X + 260, bw = W - 400;
    pkPCRound(c, bx, ly + 12, bw, 10, 5); c.fillStyle = 'rgba(255,255,255,0.1)'; c.fill();
    pkPCRound(c, bx, ly + 12, Math.max(10, bw * f), 10, 5); c.fillStyle = '#f5b53d'; c.fill();
    pkPCText(c, N ? PK.xp + ' / ' + N.xp + ' xp: ' + N.name : 'Every level reached', X + W - 14, ly + 22, 12, '#8b98a4', false, 'right');
  }
  function pkPCMoney(c, sc, X, Y, W, H) {
    var lw = W * 0.44;
    pkPCPanel(c, X, Y, lw, 150, 'Prices');
    pkPCText(c, 'Adult ticket', X + 14, Y + 52, 15, '#d7dee4'); pkPCText(c, money(S.ticketPrice), X + 150, Y + 54, 22, '#f5b53d', true);
    pkPCBtn(sc, X + lw - 150, Y + 32, 64, 30, '- 1', function () { pkPrice(-1); });
    pkPCBtn(sc, X + lw - 78, Y + 32, 64, 30, '+ 1', function () { pkPrice(1); });
    pkPCText(c, 'Fries', X + 14, Y + 104, 15, '#d7dee4'); pkPCText(c, money(S.snackPrice), X + 150, Y + 106, 22, '#f5b53d', true);
    pkPCBtn(sc, X + lw - 150, Y + 84, 64, 30, '- 0.50', function () { pkSnackPrice(-0.5); });
    pkPCBtn(sc, X + lw - 78, Y + 84, 64, 30, '+ 0.50', function () { pkSnackPrice(0.5); });
    pkPCText(c, PK.snackOpen ? 'the snack stand is open' : 'the snack stand opens at level 2', X + 14, Y + 138, 11, '#8b98a4');
    var ty = Y + 160, wages = pkWages(), st = S.stats || {};
    pkPCPanel(c, X, ty, lw, H - 160, 'Today and all time');
    [['Earned today', money(PK.today.earned || 0), '#5fd38d'], ['Tickets / snacks', PK.today.tickets + ' / ' + PK.today.snacks, '#eef1f5'], ['Wages a day', money(wages), '#f0c04a'],
      ['Earned, all time', money(st.earned || 0), '#5fd38d'], ['Spent, all time', money(st.spent || 0), '#ff8a5c']].forEach(function (r, i) {
      pkPCText(c, r[0], X + 14, ty + 48 + i * 30, 14, '#a0acb8'); pkPCText(c, r[1], X + lw - 14, ty + 48 + i * 30, 15, r[2], true, 'right');
    });
    // the ledger
    var gx = X + lw + 10, gw = W - lw - 10;
    pkPCPanel(c, gx, Y, gw, H, 'Ledger');
    var L = (S.ledger || []).slice(0, 13);
    if (!L.length) pkPCText(c, 'Nothing paid in or out yet.', gx + 14, Y + 52, 13, '#8b98a4');
    L.forEach(function (e, i) {
      var y = Y + 46 + i * 25;
      pkPCText(c, 'D' + e.day + ' ' + e.t, gx + 14, y, 12, '#6b7781');
      c.save(); c.font = '13px ' + SCREEN_THEME.font; var why = scFit(c, String(e.why || ''), gw - 220); c.restore();
      pkPCText(c, why, gx + 100, y, 13, '#d7dee4');
      pkPCText(c, (e.n >= 0 ? '+' : '-') + money(Math.abs(e.n)), gx + gw - 14, y, 13, e.n >= 0 ? '#5fd38d' : '#ff8a5c', true, 'right');
    });
  }
  function pkPCRideRows() {
    var rows = [{ coaster: true, name: 'The coaster', state: pkRideWord(), queue: pkQueueWaiting(), riders: PK.ride.riders, seats: PK.seats.length, cycles: S.cycles || 0, open: true, bad: !!PK.ride.fault }];
    PK.attractions.forEach(function (a) {
      var C = a.ctl || {}, w = C.fault ? 'stopped' : C.maint ? 'maintenance' : !a.open ? 'shut' : a.state;
      rows.push({ a: a, name: a.name, state: w, queue: pkAttrWaiting(a), riders: a.riders || 0, seats: a.seats.length, cycles: a.cycles || 0, open: !!a.open, bad: !!(C.fault || C.maint) });
    });
    return rows;
  }
  function pkPCRides(c, sc, X, Y, W, H) {
    var rows = pkPCRideRows(), per = 8, pages = Math.ceil(rows.length / per); PK_PC.page = clamp(PK_PC.page, 0, pages - 1);
    pkPCPanel(c, X, Y, W, H);
    var cols = [X + 32, X + 250, X + 400, X + 470, X + 560];
    ['RIDE', 'STATE', 'QUEUE', 'ON RIDE', 'CYCLES'].forEach(function (h, i) { pkPCText(c, h, cols[i], Y + 22, 11, '#8b98a4', true); });
    rows.slice(PK_PC.page * per, PK_PC.page * per + per).forEach(function (r, i) {
      var y = Y + 34 + i * 34;
      if (i % 2 === 0) { c.fillStyle = 'rgba(255,255,255,0.03)'; c.fillRect(X + 6, y, W - 12, 32); }
      c.fillStyle = r.bad ? '#ff6b5e' : !r.open ? '#6b7781' : (r.state === 'running' || r.state === 'boarding' || r.state === 'dispatching') ? '#ff9d6b' : '#5fd38d';
      c.beginPath(); c.arc(X + 18, y + 16, 5, 0, 6.283); c.fill();
      pkPCText(c, r.name, cols[0], y + 21, 14, '#eef1f5', true);
      pkPCText(c, r.state, cols[1], y + 21, 13, r.bad ? '#ff6b5e' : '#c3ccd4');
      pkPCText(c, String(r.queue), cols[2], y + 21, 13, r.queue >= 8 ? '#f0c04a' : '#c3ccd4');
      pkPCText(c, r.riders + ' / ' + r.seats, cols[3], y + 21, 13, '#c3ccd4');
      pkPCText(c, String(r.cycles), cols[4], y + 21, 13, '#c3ccd4');
      if (r.coaster) {
        var auto = pkCoasterAuto();
        pkPCBtn(sc, X + W - 236, y + 3, 104, 26, auto ? 'AUTO on' : 'AUTO off', function () { pkSetAuto(!S.auto); }, auto);
        pkPCBtn(sc, X + W - 124, y + 3, 112, 26, 'Service ' + Math.round(S.wear || 0) + '%', function () { pkService(); }, (S.wear || 0) > 0, '#f0c04a');
      } else pkPCBtn(sc, X + W - 124, y + 3, 112, 26, r.open ? 'Shut it' : 'Open it', function () { pkSetRideOpen(r.a.id, !r.a.open); }, !r.open, '#5fd38d');
    });
    var py = Y + H - 40;
    pkPCText(c, 'Page ' + (PK_PC.page + 1) + ' of ' + pages + '   ·   ' + pkOpenCount() + ' of ' + rows.length + ' open', X + 16, py + 24, 13, '#8b98a4');
    pkPCBtn(sc, X + W - 236, py + 4, 104, 30, 'Previous', function () { PK_PC.page = Math.max(0, PK_PC.page - 1); }, PK_PC.page > 0);
    pkPCBtn(sc, X + W - 124, py + 4, 112, 30, 'Next', function () { PK_PC.page = Math.min(pages - 1, PK_PC.page + 1); }, PK_PC.page < pages - 1);
  }
  var PK_PC_GROUPS = [['Arriving', ['walkBooth', 'boothQueue', 'walkTurn'], '#8fc3ff'], ['Queuing', ['queue', 'qwait', 'walkQueue'], '#f0c04a'], ['Riding', ['board', 'seated', 'walkSeat'], '#ff9d6b'],
    ['Walking', ['walkAttr', 'toSnack', 'off'], '#5fd38d'], ['Leaving', ['leave'], '#a0acb8']];
  function pkPCGuests(c, sc, X, Y, W, H) {
    var tw = (W - 40) / 5;
    PK_PC_GROUPS.forEach(function (gp, i) {
      var n = PK.guests.filter(function (g) { return gp[1].indexOf(g.state) >= 0; }).length;
      pkPCTile(c, X + i * (tw + 10), Y, tw, 78, gp[0], String(n), gp[2]);
    });
    var by = Y + 90, bw = W * 0.62;
    pkPCPanel(c, X, by, bw, H - 90, 'The longest queues');
    var q = [{ name: 'The coaster', n: pkQueueWaiting() }].concat(PK.attractions.map(function (a) { return { name: a.name, n: pkAttrWaiting(a) }; })).sort(function (p, r) { return r.n - p.n; }).slice(0, 8);
    var top = Math.max(1, q[0] ? q[0].n : 1);
    q.forEach(function (r, i) {
      var y = by + 38 + i * 28;
      pkPCText(c, r.name, X + 14, y + 14, 13, '#d7dee4');
      pkPCRound(c, X + 170, y + 2, bw - 230, 16, 6); c.fillStyle = 'rgba(255,255,255,0.06)'; c.fill();
      if (r.n) { pkPCRound(c, X + 170, y + 2, Math.max(12, (bw - 230) * r.n / top), 16, 6); c.fillStyle = r.n >= 8 ? '#f0c04a' : '#8fc3ff'; c.fill(); }
      pkPCText(c, String(r.n), X + bw - 14, y + 15, 13, '#eef1f5', true, 'right');
    });
    var dx = X + bw + 10, dw = W - bw - 10;
    pkPCPanel(c, dx, by, dw, H - 90, 'Today');
    [['Tickets sold', PK.today.tickets], ['Rides ridden', PK.today.rides], ['Snacks sold', PK.today.snacks], ['Adult ticket', money(S.ticketPrice)], ['At the windows', PK.booths.reduce(function (s, b) { return s + b.queue.length; }, 0)]].forEach(function (r, i) {
      pkPCText(c, r[0], dx + 14, by + 50 + i * 30, 14, '#a0acb8'); pkPCText(c, String(r[1]), dx + dw - 14, by + 50 + i * 30, 15, '#eef1f5', true, 'right');
    });
  }
  function pkPCRole(id) { return /^operator/.test(id) ? ['Rides', '#ffd166'] : /^guard/.test(id) ? ['Security', '#8fc3ff'] : /^cashier/.test(id) ? ['Tickets', '#ff8a5c'] : /^(sweeper|gardener)/.test(id) ? ['Grounds', '#5fd38d'] : ['Staff', '#c3ccd4']; }
  function pkPCWhere(x, z) { var best = '', bd = 1e9; for (var k in NPCS.spots) { var p = NPCS.spots[k], d = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z); if (d < bd) { bd = d; best = k; } } return bd < 900 ? 'by the ' + pkPCWords(best).toLowerCase() : 'on the move'; }
  function pkPCStaff(c, sc, X, Y, W, H) {
    var cw = (W - 10) / 2;
    var said = function (res) { if (res !== 'Hired' && res !== 'Let go' && typeof res === 'string') toast(res, 'bad'); };
    // the clerk: one, or none
    pkPCPanel(c, X, Y, cw, 96);
    pkPCText(c, 'Ticket clerk', X + 14, Y + 30, 17, '#eef1f5', true);
    pkPCText(c, 'Serves both ticket windows  ·  ' + money(40) + ' a day', X + 14, Y + 52, 12, '#8b98a4');
    pkPCText(c, S.clerk ? 'ON THE PAYROLL' : 'NOT HIRED', X + 14, Y + 80, 12, S.clerk ? '#5fd38d' : '#a0acb8', true);
    pkPCBtn(sc, X + cw - 150, Y + 56, 136, 30, S.clerk ? 'Let go' : 'Hire (' + money(400) + ')', function () { said(S.clerk ? pkFire('clerk') : pkHire('clerk')); }, !S.clerk, S.clerk ? '#ff8a5c' : '#5fd38d');
    // the operators: up to four, working the booths in shifts
    var ox = X + cw + 10, n = pkOpCount();
    pkPCPanel(c, ox, Y, cw, 96);
    pkPCText(c, 'Ride operators  ' + n + ' / ' + PK_OPS_MAX, ox + 14, Y + 30, 17, '#eef1f5', true);
    pkPCText(c, 'Shifts in the ride booths  ·  ' + money(60) + ' a day each', ox + 14, Y + 52, 12, '#8b98a4');
    for (var k = 0; k < PK_OPS_MAX; k++) { c.fillStyle = k < n ? '#5fd38d' : 'rgba(255,255,255,0.14)'; c.beginPath(); c.arc(ox + 20 + k * 16, Y + 76, 5, 0, 6.283); c.fill(); }
    pkPCBtn(sc, ox + cw - 232, Y + 60, 108, 28, 'Hire (' + money(600) + ')', function () { said(pkHire('operator')); }, n < PK_OPS_MAX, '#5fd38d');
    pkPCBtn(sc, ox + cw - 116, Y + 60, 102, 28, 'Let one go', function () { said(pkFire('operator')); }, n > 0, '#ff8a5c');
    var ry = Y + 106;
    pkPCPanel(c, X, ry, W, H - 106, 'On duty now');
    var list = pkPCStaffNow();
    if (!list.length) pkPCText(c, 'Nobody is on duty: the staff work from 09:00 to 22:00.', X + 14, ry + 50, 13, '#8b98a4');
    var colW = (W - 20) / 2;
    list.slice(0, 14).forEach(function (n, i) {
      var cx = X + 10 + Math.floor(i / 7) * colW, y = ry + 44 + (i % 7) * 30, role = pkPCRole(n.charId);
      c.fillStyle = role[1]; c.beginPath(); c.arc(cx + 10, y - 4, 5, 0, 6.283); c.fill();
      pkPCText(c, n.name, cx + 22, y, 14, '#eef1f5', true);
      pkPCText(c, role[0], cx + 100, y, 12, role[1], true);
      c.save(); c.font = '12px ' + SCREEN_THEME.font; var st = scFit(c, n.st, colW - 190); c.restore();
      pkPCText(c, st, cx + 172, y, 12, '#c3ccd4');
    });
  }
  // everyone working now: the engine's staff and guards, and the ride operators (part 26), each with what they are doing
  function pkPCStaffNow() {
    var out = npcList.filter(function (n) { return !n.gone && n.g.visible; }).map(function (n) {
      return { name: n.name, charId: n.charId, x: n.x, z: n.z, st: n.leaving ? 'going home' : (n.path && n.path.length ? 'walking, ' : '') + pkPCWhere(n.x, n.z) };
    });
    if (typeof PK_OPS !== 'undefined') PK_OPS.list.forEach(function (o) { out.push({ name: o.name, charId: 'operator', x: o.x, z: o.z, st: pkOpWords(o) }); });
    return out;
  }
  // a camera: a stretch of the park from above, the paths and the rides, the guests and the staff on them, live
  var PK_PC_CAMS = [['GATE AND CAR PARK', -34, 34, 24, 74], ['MIDWAY AND STATION SQUARE', -30, 30, -10, 30], ['THE FAIRGROUND AND THE DARK WOODS', -72, -14, -78, 40], ['GARDENS, COASTER COUNTRY, EAST WALK', -36, 123, -118, -8]];
  function pkPCCam(c, x, y, w, h, cam, i) {
    var x0 = cam[1], x1 = cam[2], z0 = cam[3], z1 = cam[4], k = Math.min(w / (x1 - x0), h / (z1 - z0));
    var ox = x + w / 2 - (x0 + x1) / 2 * k, oz = y + h / 2 - (z0 + z1) / 2 * k;
    var X = function (v) { return ox + v * k; }, Z = function (v) { return oz + v * k; };
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.fillStyle = '#0d1a12'; c.fillRect(x, y, w, h);
    c.strokeStyle = 'rgba(200,190,160,0.32)'; c.lineCap = 'round';
    PK_ROUTES.forEach(function (r) { c.lineWidth = Math.max(1.5, r[4] * k); c.beginPath(); c.moveTo(X(r[0]), Z(r[1])); c.lineTo(X(r[2]), Z(r[3])); c.stroke(); });
    c.fillStyle = 'rgba(200,190,160,0.32)'; c.fillRect(X(-7), Z(-4), 14 * k, 34 * k); c.fillRect(X(-17), Z(35), 34 * k, 18 * k); c.fillStyle = 'rgba(120,124,130,0.35)'; c.fillRect(X(-31), Z(53), 62 * k, 18 * k);
    PK.attractions.forEach(function (a) { var C = a.ctl || {}; c.strokeStyle = C.fault || C.maint ? '#ff6b5e' : a.open ? 'rgba(95,211,141,0.8)' : 'rgba(160,172,184,0.5)'; c.lineWidth = 1.5; c.beginPath(); c.arc(X(a.x), Z(a.z), Math.max(3, 5 * k), 0, 6.283); c.stroke(); });
    c.fillStyle = '#f5d36b'; PK.guests.forEach(function (g) { var r = g.rec; c.fillRect(X(r.x) - 1.5, Z(r.z) - 1.5, 3, 3); });
    pkPCStaffNow().forEach(function (n) { var role = pkPCRole(n.charId); c.fillStyle = role[1]; c.beginPath(); c.arc(X(n.x), Z(n.z), 3.2, 0, 6.283); c.fill(); });
    if (player) { c.strokeStyle = '#ffffff'; c.lineWidth = 1.5; c.beginPath(); c.arc(X(player.x), Z(player.z), 4, 0, 6.283); c.stroke(); }
    pkBkScanlines(c, x + w, y + h);
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    pkPCText(c, 'CAM ' + (i + 1) + '  ' + cam[0], x + 8, y + 16, 11, '#8fe0a0', true);
    pkPCText(c, fmtTime(S.time), x + w - 8, y + 16, 11, '#8fe0a0', false, 'right');
    if (Math.floor(worldTime * 1.5 + i) % 2 === 0) { c.fillStyle = '#ff3b30'; c.beginPath(); c.arc(x + w - 14, y + h - 12, 4, 0, 6.283); c.fill(); pkPCText(c, 'REC', x + w - 22, y + h - 8, 10, '#ff6b5e', true, 'right'); }
  }
  function pkPCCctv(c, sc, X, Y, W, H) {
    var cw = (W - 8) / 2, ch = (H - 34) / 2;
    PK_PC_CAMS.forEach(function (cam, i) { pkPCCam(c, X + (i % 2) * (cw + 8), Y + Math.floor(i / 2) * (ch + 8), cw, ch, cam, i); });
    var guards = npcList.filter(function (n) { return !n.gone && /^guard/.test(n.charId); });
    var ly = Y + H - 12;
    [['#f5d36b', 'guests'], ['#5fd38d', 'grounds'], ['#8fc3ff', 'guards'], ['#ff8a5c', 'tickets'], ['#ffd166', 'rides'], ['#ffffff', 'you']].forEach(function (k, i) { c.fillStyle = k[0]; c.beginPath(); c.arc(X + 8 + i * 74, ly - 4, 4, 0, 6.283); c.fill(); pkPCText(c, k[1], X + 18 + i * 74, ly, 12, '#a0acb8'); });
    pkPCText(c, guards.length ? guards.map(function (n) { return n.name; }).join(', ') + ' on patrol' : 'No guards on duty', X + W, ly, 12, '#8fc3ff', true, 'right');
  }
  function pkPCMail(c, sc, X, Y, W, H) {
    pkPCPanel(c, X, Y, W, H, 'Park news, newest first');
    var L = (S.log || []).slice(0, 13);
    if (!L.length) pkPCText(c, 'No news yet.', X + 14, Y + 52, 13, '#8b98a4');
    L.forEach(function (e, i) {
      var y = Y + 48 + i * 26, col = e.kind === 'good' ? '#5fd38d' : e.kind === 'bad' ? '#ff6b5e' : '#8b98a4';
      c.fillStyle = col; c.beginPath(); c.arc(X + 20, y - 4, 4, 0, 6.283); c.fill();
      pkPCText(c, 'Day ' + e.day + '  ' + e.t, X + 34, y, 12, '#6b7781');
      c.save(); c.font = '14px ' + SCREEN_THEME.font; var m = scFit(c, String(e.msg || ''), W - 180); c.restore();
      pkPCText(c, m, X + 150, y, 14, '#e6ebef');
    });
  }
  // the second screen: the whole park, live
  function pkPCDrawMap(c, sc) {
    c.fillStyle = '#0b1210'; c.fillRect(0, 0, sc.w, sc.h);
    pkPCCam(c, 6, 6, sc.w - 12, sc.h - 12, ['THE WHOLE PARK', PK_PARK.x0, PK_PARK.x1, PK_PARK.z0, 74], 0);
  }

  var _pkPCT = GAME.T;
  GAME.T = function () { var t = _pkPCT(); t.PK_PC = PK_PC; return t; };
  // ── Live: the colour cycle, the fans, the bank's history, the lock ──
  animate(function (dt) {
    if (!PK_PC.sc) return;
    PK_PC.hue = (PK_PC.hue + dt * 0.04) % 1;
    for (var i = 0; i < PK_PC.rgb.length; i++) PK_PC.rgb[i].color.setHSL((PK_PC.hue + i * 0.03) % 1, 0.85, 0.58);
    if (PK_PC.fans) PK_PC.fans.forEach(function (f) { f.rotation.z -= dt * 14; });
    var slot = S.day * 1000 + Math.floor(S.time * 6);                       // every ten game minutes
    if (slot !== PK_PC.lastSample) { PK_PC.lastSample = slot; PK_PC.hist.push({ d: S.day, t: S.time, v: S.bank }); if (PK_PC.hist.length > 300) PK_PC.hist.shift(); }
    if (typeof player !== 'undefined' && player) {
      var far = Math.hypot(player.x - PK_PC.x, player.z - PK_PC.z) > 5 || player.y < PK_HQ.lv[2] - 0.5;
      PK_PC.idle = far ? PK_PC.idle + dt : 0;
      if (PK_PC.awake && PK_PC.idle > 20) { PK_PC.awake = false; PK_PC.sc.dirty = true; }
    }
  });
