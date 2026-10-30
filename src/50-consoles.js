//@ Park Co, part 50: the ride consoles made for Danse Macabre and Droomvlucht, in place of the standard booth panel
  // ── Custom consoles ──────────────────────────────────────────────
  // Each of the two is its own piece of furniture, built for its ride, with the same working parts as every booth panel
  // (part 14): the operator key, AUTO, the gates, the restraints, the station gates, TEST, the E-stop and RESET, the
  // interlock chain and READY, the dispatch lever, the voice, the two dials, the annunciator bank and the readouts, all
  // driving the same booth functions (part 09). Danse Macabre's is an organ console: carved dark oak, two manuals of
  // ivory and ebony, its buttons set as brass-ringed ivory stops and gilt pipes crowning the bank, with a LIGHTNING cue.
  // Droomvlucht's is a dream desk: navy lacquer edged in gilt, its face a chart of the night sky, jewel buttons, a crescent
  // moon over the bank, with a FOG cue and a readout of which dream the leading gondola is in.
  var PK_CON = {
    danse: { body: 0x2e1c10, trim: 0xc9a050, face: ['#3a2416', '#1f130b'], ink: '#e8cf8a', dim: '#a88a5a', font: 'Georgia, serif',
      btnCol: 'white', collar: 'brass', g2: { unit: 'tilt deg', min: 0, max: 14, red: 0.86, ticks: 7, get: function (a) { return a.extra.tiltA * 180 / Math.PI / 14; } },
      cue: { label: 'LIGHTNING', col: 'blue', prompt: 'Strike the lightning', act: function (a) { a.extra.mflash = 0.45; if (typeof pkDmNear === 'function' && pkDmNear()) sfx('pkDanseThunder'); } },
      title: 'DANSE MACABRE', sub: 'ORGEL-CONSOLE  *  ABDIJ VAN HUYVERWOUD' },
    droom: { body: 0x18213a, trim: 0xd8b45a, face: ['#141c38', '#0a0f22'], ink: '#f0dcae', dim: '#9aa6d0', font: 'Georgia, serif',
      btnCol: 'purple', collar: 'gold', g2: { unit: 'height m', min: 0, max: 14, red: 0, ticks: 7, get: function (a) { var g0 = a.extra.gons && a.extra.gons[0]; return g0 ? g0.g.position.y / 14 : 0; } },
      cue: { label: 'FOG', col: 'sky', prompt: 'Fog the wall', act: function (a) { a.extra.fogBoost = 5; sfx('click'); } },
      title: 'DROOMVLUCHT', sub: 'DROOMLESSENAAR  *  MARERIJK' }
  };
  function pkConMat(c, r, m) { return std({ color: c, roughness: r === undefined ? 0.5 : r, metalness: m === undefined ? 0.2 : m }); }
  // the face: a gradient in the console's colours, engraved fields and every label, and (the dream desk) a sky of stars
  function pkConFace(id, K, PW, PH) {
    return function (c, W, H) {
      var R = pkCtlRuler(W, H, PW, PH), gr = c.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, K.face[0]); gr.addColorStop(1, K.face[1]); c.fillStyle = gr; c.fillRect(0, 0, W, H);
      var rnd = pkRng(id === 'danse' ? 3 : 4);
      if (id === 'droom') { for (var s = 0; s < 120; s++) { c.fillStyle = 'rgba(240,226,180,' + (0.2 + rnd() * 0.6).toFixed(2) + ')'; var sx = rnd() * W, sy = rnd() * H, sr = rnd() < 0.85 ? 1 : 2.4; c.beginPath(); c.arc(sx, sy, sr, 0, 6.283); c.fill(); } }
      else { for (var b = 0; b < 40; b++) { c.strokeStyle = 'rgba(0,0,0,' + (0.08 + rnd() * 0.12).toFixed(2) + ')'; c.lineWidth = 1 + rnd() * 3; c.beginPath(); var by = rnd() * H; c.moveTo(0, by); c.bezierCurveTo(W * 0.3, by + (rnd() - 0.5) * 60, W * 0.7, by + (rnd() - 0.5) * 60, W, by + (rnd() - 0.5) * 40); c.stroke(); } }
      var frame = function (x0, y0, x1, y1, label) {
        c.strokeStyle = K.trim2 || K.ink; c.globalAlpha = 0.55; c.lineWidth = R.L(0.003); c.strokeRect(R.X(x0), R.Y(y1), R.X(x1) - R.X(x0), R.Y(y0) - R.Y(y1)); c.globalAlpha = 1;
        if (label) txt(label, (x0 + x1) / 2, y1 - 0.022, 0.013, K.dim);
      };
      var txt = function (t, x, y, sz, col, weight) { c.fillStyle = col || K.ink; c.font = (weight || '700') + ' ' + Math.round(R.L(sz)) + 'px ' + K.font; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(t, R.X(x), R.Y(y)); };
      frame(-0.88, -0.2, -0.36, 0.2, 'OPERATOR'); frame(-0.34, -0.2, 0.34, 0.2, 'SEQUENCE'); frame(0.36, -0.2, 0.88, 0.2, 'SHOW');
      txt('LOAD', -0.74, -0.005, 0.012); txt(K.g2.unit.toUpperCase(), -0.5, -0.005, 0.012);
      txt('KEY', -0.74, -0.178, 0.011, K.dim); txt('VOICE', -0.5, -0.178, 0.011, K.dim);
      var sig = PK_PANEL[id] && PK_PANEL[id].sig ? PK_PANEL[id].sig.label : 'VOICE';
      if (id === 'droom') {
        // the continuous system: no cycle to send, a line to run
        [['GATES', -0.255], ['BARS HOLD', -0.085], ['WALKWAY', 0.085], ['DISPATCH', 0.255]].forEach(function (l) { txt(l[0], l[1], 0.155, 0.012); });
        txt('SLOW  NORM  FAST', 0.085, 0.045, 0.0075, K.dim); txt('AUTO / MANUAL', 0.255, 0.045, 0.0075, K.dim);
        [['KEY', -0.255], ['SYSTEM', -0.085], ['BARS', 0.085], ['SPACING', 0.255]].forEach(function (l) { txt(l[0], l[1], -0.025, 0.0085, K.dim); });
        txt('INTERLOCK', 0, 0.0, 0.009, K.dim);
        txt('WORK LIGHTS', -0.22, -0.185, 0.01); txt('E-STOP', 0, -0.188, 0.012, '#ff8a7a'); txt('RESET', 0.22, -0.185, 0.011);
        txt(sig, 0.46, 0.155, 0.011); txt(K.cue.label, 0.58, 0.155, 0.011); txt('NEXT', 0.72, 0.155, 0.011, '#8fe0a0');
        txt('START', 0.46, -0.188, 0.012, '#8fe0a0'); txt('STOP', 0.6, -0.188, 0.012, '#f0c04a'); txt('RELEASE', 0.78, -0.188, 0.011); txt('PULL', 0.83, -0.11, 0.009, K.dim);
        return;
      }
      [['GATES', -0.255], ['BARS', -0.085], ['STN GATES', 0.085], ['TEST', 0.255]].forEach(function (l) { txt(l[0], l[1], 0.155, 0.012); });
      txt('INTERLOCK', 0, 0.0, 0.009, K.dim);
      txt('AUTO', -0.22, -0.185, 0.011); txt('E-STOP', 0, -0.188, 0.012, '#ff8a7a'); txt('RESET', 0.22, -0.185, 0.011);
      txt(sig, 0.48, 0.155, 0.011); txt(K.cue.label, 0.62, 0.155, 0.011);
      txt('READY', 0.48, -0.04, 0.01, '#8fe0a0'); txt('DISPATCH', 0.74, -0.188, 0.012); txt('PULL', 0.80, -0.11, 0.009, K.dim);
    };
  }
  // Droomvlucht's controls, for a system that runs continuously (part 48): the gates and the bars' hold, the walkway's
  // speed, the dispatch AUTO or MANUAL, START and STOP, the release lever, the work lights, the chime and the fog
  function pkDvControls(a, con, P, K, sh, trim, top, hz) {
    var C = pkCtl(a), E = a.extra, D = PK_DV, parts = { buttons: {}, sheet: sh, panel: P }, BX = [-0.255, -0.085, 0.085, 0.255];
    var refuse = function () { if (!C.key) { pkBoothRefuse(a.name + ' is locked - turn the operator key on'); return true; } if (C.fault) { pkBoothRefuse('Reset ' + a.name + ' first'); return true; } return false; };
    parts.buttons.gates = pkCtlBtn(P, BX[0], 0.095, { id: 'gates', label: 'GATES', col: 'green', r: 0.028, collar: trim, lampCol: 0x5fd38d, prompt: 'Open or shut the station gates',
      act: function () { if (refuse()) return; C.gates = !C.gates; sfx('click'); toast(a.name + ': gates ' + (C.gates ? 'open' : 'shut'), ''); screenDirtyAll(); } });
    parts.buttons.bars = pkCtlBtn(P, BX[1], 0.095, { id: 'bars', label: 'BARS HOLD', col: 'amber', r: 0.028, collar: trim, lampCol: 0xf0c04a, prompt: 'Hold the bars open (no gondola leaves)',
      act: function () { if (!C.key) return pkBoothRefuse(a.name + ' is locked - turn the operator key on'); E.barsHold = !E.barsHold; sfx('click'); toast(a.name + ': bars ' + (E.barsHold ? 'held open - dispatch held' : 'on automatic'), ''); } });
    parts.walk = pkCtlRotary(P, BX[2], 0.095, { id: 'walk', n: 3, pos: E.walkPos, r: 0.03, prompt: 'Walkway speed', names: ['SLOW', 'NORMAL', 'FAST'], act: function (p) { E.walkPos = p; E.walk = [0.35, 0.5, 0.7][p]; } });
    parts.auto = pkCtlToggle(P, BX[3], 0.095, { id: 'auto', on: C.auto, prompt: 'Dispatch', onName: 'AUTO', offName: 'MANUAL', act: function (on) { C.auto = !!on; if (!S.ctlAuto) S.ctlAuto = {}; S.ctlAuto[a.id] = C.auto; sfx('click'); toast(a.name + ': dispatch ' + (C.auto ? 'AUTO - the gondolas go on their own' : 'MANUAL - pull the release for each'), ''); } });
    parts.chain = BX.map(function (x) { return pkPnLed(P, x, 0.008, { col: 0x5fd38d, r: 0.009 }); });
    parts.work = pkCtlToggle(P, -0.22, -0.11, { id: 'work', on: !!E.work, prompt: 'Work lights in the dream', onName: 'ON', offName: 'OFF', act: function (on) { E.work = !!on; sfx('click'); } });
    parts.stop = pkCtlMushroom(P, 0, -0.1, { id: 'stop', r: 0.044, prompt: 'Emergency stop', act: function () { pkBoothStop(a); } });
    parts.reset = pkCtlBtn(P, 0.22, -0.11, { id: 'reset', label: 'RESET', col: 'white', r: 0.026, collar: trim, lampCol: 0xe8e4d8, prompt: 'Reset after a stop', act: function () { if (C.fault) pkBoothStop(a); else { sfx('click'); toast(a.name + ': nothing to reset', ''); } } });
    parts.key = pkCtlKey(P, -0.74, -0.12, { id: 'opKey', on: !!C.key, label: a.name + ' operator key', tag: 'red', act: function (on) { return pkSetRideKey(a, on); } });
    parts.voice = pkCtlToggle(P, -0.5, -0.12, { id: 'voice', on: pkPnVoice(a.id), prompt: a.name + ': the music box on dispatch', onName: 'ON', offName: 'OFF', act: function (on) { pkPnSetVoice(a.id, on); sfx('click'); } });
    var gO = { dial: 'cream', bezel: trim, r: 0.058 };
    parts.load = pkCtlGauge(P, -0.74, 0.085, Object.assign({}, gO, { id: 'load', label: '', unit: 'riders', min: 0, max: a.seats.length, red: 0.92, ticks: 6, get: function () { return a.riders / a.seats.length; } }));
    parts.g2 = pkCtlGauge(P, -0.5, 0.085, Object.assign({}, gO, { id: 'g2', label: '', unit: 'line m/s', min: 0, max: 1, red: 0.8, ticks: 5, ease: 3, get: function () { var v = 0, n = 0; E.gons.forEach(function (g) { if (g.s >= D.sStationIn) { v += g.v; n++; } }); return n ? v / n : 0; } }));
    parts.sig = pkCtlBtn(P, 0.46, 0.09, { id: 'sig', label: sh.sig.label, col: 'sky', r: 0.026, collar: trim, lampCol: 0x9fd0ff, prompt: 'Press ' + sh.sig.label, act: function () { pkPnVoiceNow(a, sh, true); } });
    parts.cue = pkCtlBtn(P, 0.58, 0.09, { id: 'cue', label: K.cue.label, col: K.cue.col, r: 0.026, collar: trim, lampCol: 0x9fd0ff, prompt: K.cue.prompt, act: function () { if (pkCtlDead(P)) return; K.cue.act(a); } });
    parts.ready = pkPnLed(P, 0.72, 0.09, { col: 0x5fd38d, r: 0.015 });
    parts.start = pkCtlBtn(P, 0.46, -0.1, { id: 'start', label: 'START', col: 'green', r: 0.036, collar: trim, lampCol: 0x9fef6a, prompt: 'Start the system', act: function () { pkDvStart(a); } });
    parts.halt = pkCtlBtn(P, 0.6, -0.1, { id: 'halt', label: 'STOP', col: 'amber', r: 0.036, collar: trim, lampCol: 0xf0c04a, prompt: 'Stop: bring every gondola home and park', act: function () { pkDvStop(a); } });
    parts.lever = pkCtlLever(P, 0.78, -0.06, { id: 'release', len: 0.13, col: 'purple', prompt: 'Pull the release: the next gondola goes', act: function () { if (refuse()) return; if (E.sys !== 'running') return pkBoothRefuse(a.name + ' is not running - press START'); E.release = true; sfx('click'); } });
    var HB = pkCtlHood(con, 0, top + 0.15, hz, 1.56, 0.2, 0.22);
    var ANN = [['key', 'KEY\nON', '#5fd38d'], ['auto', 'AUTO\nDISPATCH', '#8fc3ff'], ['gates', 'GATES\nOPEN', '#f0c04a'], ['hold', 'BARS\nHELD', '#f0c04a'], ['run', 'SYSTEM\nRUNNING', '#5fd38d'], ['fault', 'FAULT\nMAINT', '#ff6b5e']].concat(sh.ann || []);
    parts.ann = {};
    ANN.forEach(function (d, k) { parts.ann[d[0]] = pkCtlAnnun(HB, -0.715 + k * 0.124, 0, 0.112, 0.1, d[1], { col: d[2], flash: d[0] === 'fault' || d[0] === 'hold' }); });
    parts.readout = pkCtlReadout(HB, 0.5, -0.025, 0.5, 0.12);
    parts.tele = pkCtlReadout(HB, 0.5, 0.11, 0.5, 0.06, { col: '#c8d8ff', bg: '#050505' });
    var moon = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.085, 20, 1, 0.5, 3.8), pkMats().gold); moon.position.set(0, 0.24, -0.01); HB.add(moon);
    for (var st = 0; st < 6; st++) sphere(0.012, pkMats().gold, -0.7 + st * 0.28, 0.19 + (st % 2) * 0.03, -0.01, HB);
    var near = false, nearT = 0, PV = new THREE.Vector3(), lastOut = null;
    pkCtlLive({ tick: function (dt) {
      var power = !!a.open, A = parts.ann, live = power && !C.fault && !!C.key, run = E.sys === 'running';
      if (parts.key.on !== !!C.key) parts.key.set(!!C.key);
      if (parts.auto.on !== C.auto) parts.auto.set(C.auto);
      if (parts.stop.latched !== !!C.fault) parts.stop.setLatched(!!C.fault);
      if (parts.voice.on !== pkPnVoice(a.id)) parts.voice.set(pkPnVoice(a.id));
      A.key.on = power && !!C.key; A.auto.on = live && !!C.auto; A.gates.on = live && !!C.gates; A.hold.on = live && E.barsHold ? 'flash' : false;
      A.run.on = live && (run ? true : E.sys === 'stopping' ? 'flash' : false); A.fault.on = power && !!C.key && ((C.fault || C.maint) ? 'flash' : false);
      if (A.voice) A.voice.on = live && pkPnVoice(a.id); if (A.fly) A.fly.on = live && run;
      Object.keys(A).forEach(function (k2) { if (A[k2].on === undefined) A[k2].on = live && run; });
      parts.buttons.gates.setLit(live && C.gates); parts.buttons.bars.setLit(live && E.barsHold);
      parts.start.setLit(live && E.sys === 'parked'); parts.halt.setLit(live && run);
      var front = null; E.gons.forEach(function (g) { if (g.s >= D.L - 0.3 && (!front || g.s > front.s)) front = g; });
      var spaced = !E.last || E.last.s > D.DGAP;
      var links = [!!C.key && !C.maint, run, !E.barsHold, spaced];
      parts.chain.forEach(function (l, k) { l.on = power ? (links[k] ? true : 'dim') : false; l.mat.emissive.setHex(links[k] ? 0x5fd38d : 0xff6b5e); });
      var ready = live && run && !!front && links[2] && links[3];
      parts.ready.on = ready ? (C.auto ? true : 'flash') : false;
      parts.sig.setLit(live && pkPnVoice(a.id) && run); parts.cue.setLit(live);
      // the music box as each gondola leaves the station
      if (E.last !== lastOut) { if (E.last && power && pkPnVoice(a.id) && near) pkPnVoiceNow(a, sh, false); lastOut = E.last; }
      nearT -= dt;
      if (nearT <= 0) { nearT = 0.5; P.getWorldPosition(PV); near = typeof player !== 'undefined' && player && (PV.x - player.x) * (PV.x - player.x) + (PV.z - player.z) * (PV.z - player.z) < 40 * 40; }
      parts.readout.setPower(power); parts.tele.setPower(power);
      if (!power) { parts.readout.set(['NO POWER', 'BREAKER OFF']); parts.tele.set(['NO POWER', '']); return; }
      parts.readout.set(['QUEUE ' + ('  ' + pkAttrWaiting(a)).slice(-3) + '  RIDE ' + a.riders + '/' + a.seats.length,
        C.fault ? 'FAULT  E-STOP' : C.maint ? 'MAINT' : !C.key ? 'LOCKED' : 'SYSTEM ' + E.sys.toUpperCase()]);
      if (near) parts.tele.set(C.fault ? ['E-STOP LATCHED', 'TURN THE STOP, THEN RESET'] : !C.key ? ['KEY OFF', 'STANDBY'] : pkConTele(a, 'droom'));
    } });
    a.boothPanel = parts;
    return parts;
  }
  function pkRideConsole(a, con, id) {
    var K = PK_CON[id], C = pkCtl(a), sh = PK_PANEL[id] || { sig: { label: 'VOICE', sfx: 'bell', words: 'stand clear' }, tele: function () { return ['', '']; } };
    var body = pkConMat(K.body, 0.45, 0.15), trim = id === 'danse' ? pkMats().brass : pkMats().gold, M = pkMats();
    // the body: a cabinet with its plinth and its cheeks, the ride's own way
    box(2.2, 0.08, 0.9, body, 0, 0.04, -0.02, { parent: con, r: 0.02 });
    box(2.1, 0.66, 0.78, body, 0, 0.41, -0.04, { parent: con, r: 0.03 });
    box(2.14, 0.04, 0.82, trim, 0, 0.74, -0.04, con);
    [-1, 1].forEach(function (s) {
      box(0.08, 0.95, 0.86, body, s * 1.09, 0.5, -0.04, { parent: con, r: 0.02 });
      if (id === 'danse') { pkRod(s * 1.09, 0.97, -0.4, s * 1.09, 0.97, 0.38, 0.05, body, con, 10); sphere(0.09, trim, s * 1.09, 0.97, 0.4, con); }
      else { box(0.1, 0.04, 0.9, trim, s * 1.09, 0.98, -0.04, con); sphere(0.06, trim, s * 1.09, 1.03, 0.38, con); }
    });
    for (var pnl = 0; pnl < 3; pnl++) {
      var px = -0.68 + pnl * 0.68;
      if (id === 'danse') pkDmFrame(pkDmArch(0.42, 0.3, 0.52), pkDmArch(0.32, 0.27, 0.44), 0.02, trim, con, px, 0.14, 0.36);
      else { box(0.5, 0.42, 0.02, trim, px, 0.4, 0.36, con); box(0.46, 0.38, 0.025, body, px, 0.4, 0.365, con); pkExtrude([[0, 0.05], [0.015, 0.015], [0.05, 0.015], [0.02, -0.006], [0.03, -0.04], [0, -0.018], [-0.03, -0.04], [-0.02, -0.006], [-0.05, 0.015], [-0.015, 0.015]], 0.01, trim, px, 0.4, 0.38, con, 0); }
    }
    // Danse: the two manuals in front of the face, ivory and ebony
    if (id === 'danse') {
      var ivory = pkConMat(0xeee6d0, 0.35, 0.05), ebony = pkConMat(0x111111, 0.35, 0.1);
      [[0.76, 0.40], [0.80, 0.30]].forEach(function (m, mi) {
        box(1.5, 0.03, 0.12, body, 0, m[0], m[1], con);
        for (var k = 0; k < 36; k++) { box(0.038, 0.018, 0.1, ivory, -0.7 + k * 0.04, m[0] + 0.022, m[1] + 0.005, con); if ([1, 2, 4, 5, 6].indexOf(k % 7) >= 0) box(0.022, 0.02, 0.06, ebony, -0.68 + k * 0.04, m[0] + 0.04, m[1] - 0.015, con); }
      });
    }
    // the face, tilted toward the operator
    var PW = 1.76, PH = 0.44, TILT = 0.55, TOP = 0.82;
    var PY = TOP + (PH / 2) * Math.cos(TILT), PZ = (PH / 2) * Math.sin(TILT) - 0.06;
    var P = pkCtlPanel({ w: PW, h: PH, x: 0, y: PY, z: PZ, tilt: -TILT, key: 'pk-con-' + id, parent: con, paint: pkConFace(id, K, PW, PH), draw: function () {},
      rim: trim, screw: trim, caseMat: body, glow: 0.3, rough: 0.5, metal: 0.15 });
    pkCtlSetPower(P, function () { return !!a.open; });
    if (id === 'droom') return pkDvControls(a, con, P, K, sh, trim, TOP + PH * Math.cos(TILT), PZ - (PH / 2) * Math.sin(TILT) - 0.05);   // a continuous system: its own controls
    var parts = { buttons: {}, sheet: sh, panel: P };
    var lamp = { white: 0xf0e8d0, purple: 0xc9a0ff, blue: 0x8fb8ff, sky: 0x9fd0ff, green: 0x5fd38d, amber: 0xf0c04a, red: 0xff6b5e };
    var BX = [-0.255, -0.085, 0.085, 0.255], B = [['gates', 'GATES', id === 'danse' ? 'white' : 'green'], ['bars', 'BARS', id === 'danse' ? 'white' : 'amber'], ['station', 'STN GATES', id === 'danse' ? 'white' : 'sky'], ['test', 'TEST', id === 'danse' ? 'white' : 'purple']];
    var ringCol = [0x5fd38d, 0xf0c04a, 0x9fd0ff, 0xc9a0ff];
    B.forEach(function (b, i) {
      parts.buttons[b[0]] = pkCtlBtn(P, BX[i], 0.095, { id: b[0], label: b[1], col: b[2], r: 0.028, collar: trim, lampCol: ringCol[i], prompt: 'Press ' + b[1],
        act: function () {
          if (C.fault && b[0] !== 'gates') { sfx('bad'); toast('Reset ' + a.name + ' first', 'bad'); return; }
          if (b[0] === 'gates') return pkBoothGates(a);
          if (b[0] === 'bars') { if (!C.key) { sfx('bad'); toast(a.name + ' is locked - turn the operator key on', 'bad'); return; } C.barsWant = C.barsWant > 0.5 ? 0 : 1; sfx('click'); toast(a.name + ': restraints ' + (C.barsWant > 0.5 ? 'down' : 'up'), ''); screenDirtyAll(); return true; }
          if (b[0] === 'station') return pkStationGatesRide(a);
          if (b[0] === 'test') return pkBoothTest(a);
        } });
    });
    parts.chain = BX.map(function (x) { return pkPnLed(P, x, 0.03, { col: 0x5fd38d, r: 0.009 }); });
    parts.auto = pkCtlToggle(P, -0.22, -0.11, { id: 'auto', on: C.auto, prompt: 'Automatic cycle', onName: 'AUTO', offName: 'MANUAL', act: function () { pkBoothAuto(a); } });
    parts.stop = pkCtlMushroom(P, 0, -0.1, { id: 'stop', r: 0.044, prompt: 'Emergency stop', act: function () { pkBoothStop(a); } });
    parts.reset = pkCtlBtn(P, 0.22, -0.11, { id: 'reset', label: 'RESET', col: 'white', r: 0.026, collar: trim, lampCol: 0xe8e4d8, prompt: 'Reset after a stop', act: function () { if (C.fault) pkBoothStop(a); else { sfx('click'); toast(a.name + ': nothing to reset', ''); } } });
    parts.key = pkCtlKey(P, -0.74, -0.12, { id: 'opKey', on: !!C.key, label: a.name + ' operator key', tag: 'red', act: function (on) { return pkSetRideKey(a, on); } });
    parts.voice = pkCtlToggle(P, -0.5, -0.12, { id: 'voice', on: pkPnVoice(id), prompt: a.name + ': the ride\'s voice on dispatch', onName: 'ON', offName: 'OFF', act: function (on) { pkPnSetVoice(id, on); sfx('click'); toast(a.name + ': voice ' + (on ? 'on' : 'off'), ''); } });
    var gO = { dial: 'cream', bezel: trim, r: 0.058 };
    parts.load = pkCtlGauge(P, -0.74, 0.085, Object.assign({}, gO, { id: 'load', label: '', unit: 'riders', min: 0, max: Math.max(4, a.seats.length), red: 0.92, ticks: 6, get: function () { return a.seats.length ? a.riders / a.seats.length : 0; } }));
    parts.g2 = pkCtlGauge(P, -0.5, 0.085, Object.assign({}, gO, { id: 'g2', label: '', unit: K.g2.unit, min: K.g2.min, max: K.g2.max, red: K.g2.red, ticks: K.g2.ticks, ease: 4, get: function () { return clamp(K.g2.get(a), 0, 1); } }));
    parts.sig = pkCtlBtn(P, 0.48, 0.09, { id: 'sig', label: sh.sig.label, col: id === 'danse' ? 'purple' : 'sky', r: 0.028, collar: trim, lampCol: 0xc9a0ff, prompt: 'Press ' + sh.sig.label, act: function () { pkPnVoiceNow(a, sh, true); } });
    parts.cue = pkCtlBtn(P, 0.62, 0.09, { id: 'cue', label: K.cue.label, col: K.cue.col, r: 0.028, collar: trim, lampCol: 0x9fd0ff, prompt: K.cue.prompt, act: function () { if (pkCtlDead(P)) return; K.cue.act(a); } });
    parts.ready = pkPnLed(P, 0.48, 0.0, { col: 0x5fd38d, r: 0.015 });
    parts.lever = pkCtlLever(P, 0.74, -0.06, { id: 'dispatchLever', len: 0.13, col: id === 'danse' ? 'black' : 'purple', prompt: 'Pull the dispatch lever', act: function () { pkBoothDispatch(a); } });
    // the bank over the face: the six windows, the ride's two, the counts; crowned the ride's way
    var top = TOP + PH * Math.cos(TILT), hz = PZ - (PH / 2) * Math.sin(TILT) - 0.05;
    var HB = pkCtlHood(con, 0, top + 0.15, hz, 1.56, 0.2, 0.22);
    var ANN = [['key', 'KEY\nON', '#5fd38d'], ['auto', 'AUTO', '#8fc3ff'], ['gates', 'GATES\nOPEN', '#f0c04a'], ['bars', 'BARS\nLOCKED', '#f0c04a'], ['run', 'RIDE\nRUNNING', '#5fd38d'], ['fault', 'FAULT\nMAINT', '#ff6b5e']].concat(sh.ann || []);
    parts.ann = {};
    ANN.forEach(function (d, k) { parts.ann[d[0]] = pkCtlAnnun(HB, -0.715 + k * 0.124, 0, 0.112, 0.1, d[1], { col: d[2], flash: d[0] === 'fault' }); });
    parts.readout = pkCtlReadout(HB, 0.5, -0.025, 0.5, 0.12);
    parts.tele = pkCtlReadout(HB, 0.5, 0.11, 0.5, 0.06, { col: id === 'danse' ? '#f0c060' : '#c8d8ff', bg: '#050505' });
    if (id === 'danse') {
      // gilt organ pipes along the top of the bank, a candle each end
      for (var pp = 0; pp < 15; pp++) { var ph = 0.18 + (7 - Math.abs(pp - 7)) * 0.028; cyl(0.016, ph, M.gold, -0.42 + pp * 0.06, 0.2 + ph / 2, -0.02, HB, 8); box(0.02, 0.012, 0.004, pkConMat(0x111111), -0.42 + pp * 0.06, 0.22, -0.004, HB); }
      [-0.8, 0.8].forEach(function (x) { cyl(0.02, 0.12, pkConMat(0xeee6d0, 0.6, 0), x, 0.2, -0.02, HB, 8); sphere(0.018, pkDmM().candle, x, 0.275, -0.02, HB).scale.set(0.8, 1.6, 0.8); });
    } else {
      // a crescent moon over the bank and a scatter of gilt stars
      var moon = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.085, 20, 1, 0.5, 3.8), M.gold); moon.position.set(0, 0.24, -0.01); HB.add(moon);
      for (var st = 0; st < 6; st++) sphere(0.012, M.gold, -0.7 + st * 0.28, 0.19 + (st % 2) * 0.03, -0.01, HB);
    }
    // ── live ──
    var near = false, nearT = 0, wasRun = false, PV = new THREE.Vector3();
    pkCtlLive({ tick: function (dt) {
      var power = !!a.open, A = parts.ann, live = power && !C.fault && !!C.key;
      if (parts.key.on !== !!C.key) parts.key.set(!!C.key);
      if (parts.auto.on !== C.auto) parts.auto.set(C.auto);
      if (parts.stop.latched !== !!C.fault) parts.stop.setLatched(!!C.fault);
      if (parts.voice.on !== pkPnVoice(id)) parts.voice.set(pkPnVoice(id));
      A.key.on = power && !!C.key; A.auto.on = live && !!C.auto; A.gates.on = live && !!C.gates; A.bars.on = live && C.barsWant > 0.5;
      A.run.on = live && a.state === 'running'; A.fault.on = power && !!C.key && ((C.fault || C.maint) ? 'flash' : false);
      if (A.voice) A.voice.on = live && pkPnVoice(id);
      if (A.motion) A.motion.on = live && a.extra.tiltA > 0.01;
      if (A.fly) A.fly.on = live && a.state === 'running';
      Object.keys(A).forEach(function (k2) { if (['key', 'auto', 'gates', 'bars', 'run', 'fault', 'voice', 'motion'].indexOf(k2) < 0 && A[k2].on === undefined) A[k2].on = live && a.state === 'running'; });
      parts.buttons.gates.setLit(live && (a.state === 'idle' || a.state === 'unloading' || a.state === 'boarding'));
      parts.buttons.station.setLit(live && a.stationGates === false);
      parts.buttons.test.setLit(live && !PK.closed && a.state === 'idle' && !a.queue.length && !a.riders);
      parts.buttons.bars.setLit(live && C.barsWant > 0.5);
      var walking = pkAttrWalkers(a), loading = a.state === 'boarding' || a.state === 'ready';
      var links = [!!C.key && !C.maint, !C.gates, C.barsWant > 0.5, a.riders > 0 && !walking];
      var ready = live && !C.maint && loading && links[0] && links[1] && links[2] && links[3];
      parts.chain.forEach(function (l, k) { l.on = power ? (links[k] ? true : 'dim') : false; l.mat.emissive.setHex(links[k] ? 0x5fd38d : 0xff6b5e); });
      parts.ready.on = ready ? (C.auto ? true : 'flash') : false;
      parts.sig.setLit(live && pkPnVoice(id) && a.state === 'running'); parts.cue.setLit(live);
      nearT -= dt;
      if (nearT <= 0) { nearT = 0.5; P.getWorldPosition(PV); near = typeof player !== 'undefined' && player && (PV.x - player.x) * (PV.x - player.x) + (PV.z - player.z) * (PV.z - player.z) < 40 * 40; }
      var run = a.state === 'running';
      if (run && !wasRun && power && pkPnVoice(id) && near) pkPnVoiceNow(a, sh, false);
      wasRun = run;
      parts.readout.setPower(power); parts.tele.setPower(power);
      if (!power) { parts.readout.set(['NO POWER', 'BREAKER OFF']); parts.tele.set(['NO POWER', '']); return; }
      var left = run ? Math.max(0, Math.ceil((a.run || 0) - (a.t || 0))) + 's' : '--';
      parts.readout.set(['QUEUE ' + ('  ' + pkAttrWaiting(a)).slice(-3) + '  RIDE ' + a.riders + '/' + a.seats.length,
        (C.fault ? 'FAULT   ' : C.maint ? 'MAINT   ' : !C.key ? 'LOCKED  ' : (a.state.toUpperCase() + '        ').slice(0, 8)) + ' END ' + left]);
      if (near) parts.tele.set(C.fault ? ['E-STOP LATCHED', 'TURN THE STOP, THEN RESET'] : !C.key ? ['KEY OFF', 'STANDBY'] : pkConTele(a, id));
    } });
    a.boothPanel = parts;
    return parts;
  }
  // what the second strip on the bank reads: the show's beat and the floor for the Danse, the dream the leading gondola is in
  // and its speed for Droomvlucht
  function pkConTele(a, id) {
    var E = a.extra, run = a.state === 'running';
    if (id === 'danse') return [run ? PK_DM_BEAT_NAMES[Math.max(0, E.show.beat)] : 'STAGE AT REST', 'H ' + E.h.toFixed(1) + ' M  TILT ' + (E.tiltA * 180 / Math.PI).toFixed(0) + ' DEG'];
    // the last gondola sent: which dream it is in; and how many are out and how many home
    var D = PK_DV, out = 0, g0 = E.last;
    E.gons.forEach(function (g) { if (g.s < D.sStationIn) out++; });
    var where = 'IN THE STATION';
    if (g0 && g0.s < D.sStationIn) {
      var p = g0.g.position;
      if (g0.s > D.sSpiral0 && g0.s < D.sSpiral1) where = 'ZOMPENWOUD';
      else if (g0.s > D.sSpiral1) where = 'DROOMMOERAS';
      else if (p.x < -95 && p.z < -14) where = 'KASTELENRIJK';
      else if (p.x < -95 && p.z < 5) where = 'WONDERWOUD';
      else if (p.x < -95 && p.z < 19.5) where = 'ELFENTUIN';
      else if (p.z >= 19.5 && p.x < -91) where = 'STERRENTUNNEL';
      else where = 'HEMELBURCHTEN';
    }
    return ['LAST OUT: ' + where, 'OUT ' + out + '  HOME ' + (E.gons.length - out) + '  ' + (pkCtl(a).auto ? 'AUTO' : 'MANUAL')];
  }
