//@ Park Co, part 26: the ride operators - up to four hired hands who work the ride booths in shifts, by hand, on the real desk
  // ── What they do ─────────────────────────────────────────────────
  // Each operator is a person in the park (not one of the engine's step NPCs: they climb booth steps and stand on a raised
  // floor, which the engine's NPCs cannot). A shift goes like this:
  //   pick a ride: an open booth ride with a line, nobody else in its booth, the player not on duty there, no fault, no MAINT
  //   walk there, up the steps, the door opens and shuts behind them, clock in at the time clock (turning the operator key on
  //   if it was off), switch the desk to MANUAL, and work it by hand: GATES to board, GATES to shut, BARS down, DISPATCH, and
  //   after the ride BARS up to let the riders off. A few rounds of that (two to four), then AUTO back on, clock out, down the
  //   steps, and on to the next ride, or a break on a bench first.
  // They press the desk's own buttons (the caps go down), so a player in the booth sees the work done. Their presses are quiet
  // unless the player is near: no toasts, no log lines, only the sounds within earshot. They work 08:30 to 22:00; let go, or at
  // the end of the day, the last ride goes back on AUTO and they walk to HQ and go.
  var PK_OPS = { list: [], quiet: 0, near: false };
  var PK_OP_NAMES = ['Jan', 'Fatima', 'Ruud', 'Mei', 'Bram', 'Ayesha', 'Finn', 'Noor', 'Daan', 'Lotte'];
  var PK_OP_SKINS = [0xd8a97c, 0xc99266, 0xe8c49b, 0xe0b48e, 0xb87b5a, 0xf1d2b6, 0x8d5a3c, 0xd9a98a, 0xe2b48f, 0x5c3a28];
  var PK_OP_HAIRS = [0x3a2a1c, 0x1e1712, 0x8a6a4a, 0x2a2a2a, 0x6b4a2b, 0x1d1510, 0xa8793f, 0x8a8a8a, 0xd9b36a, 0xb0352a];
  var PK_OP_HOME = { x: -16.6, z: 42.5 };                     // HQ's door on the forecourt
  var PK_OP_BREAKS = [[-6.5, 20], [6.5, 20], [-6.5, 10], [6.5, 10], [-6.5, 2.5], [6.5, 2.5], [0, 26]];   // the midway's benches and the plaza

  // presses made by an operator: quiet, unless the player is close enough to hear them
  var _pkOpToast = toast, _pkOpLog = logEvent, _pkOpSfx = sfx;
  toast = function () { if (PK_OPS.quiet) return; return _pkOpToast.apply(null, arguments); };
  logEvent = function () { if (PK_OPS.quiet) return; return _pkOpLog.apply(null, arguments); };
  sfx = function () { if (PK_OPS.quiet && !PK_OPS.near) return; return _pkOpSfx.apply(null, arguments); };
  function pkOpDo(op, fn) {
    PK_OPS.quiet++; PK_OPS.near = typeof player !== 'undefined' && player && Math.hypot(player.x - op.x, player.z - op.z) < 9;
    try { return fn(); } finally { PK_OPS.quiet--; }
  }
  // the operator working a ride, by name ('' for none): the time clock shows it
  function pkOpAt(id) { for (var i = 0; i < PK_OPS.list.length; i++) { var o = PK_OPS.list[i]; if (o.ride && o.ride.id === id && o.clocked) return o.name; } return ''; }

  // ── The booth, in the booth's own frame ──────────────────────────
  function pkOpLocal(a, lx, lz) { var f = a.boothFrame, c = Math.cos(f.ry), s = Math.sin(f.ry); return { x: f.x + lx * c + lz * s, z: f.z - lx * s + lz * c }; }
  function pkOpSpots(a) {
    var K = PK_BK, f = a.boothFrame, ds = f.ds, HW = K.W / 2, HD = K.D / 2, DZ = K.DOORZ;
    return {
      foot: pkOpLocal(a, ds * (HW + 1.35), DZ), out: pkOpLocal(a, ds * (HW + 0.35), DZ), inn: pkOpLocal(a, ds * (HW - 0.55), DZ),
      clock: pkOpLocal(a, ds * (HW - 0.55), -HD + 0.6), clockYaw: f.ry + Math.PI,
      desk: pkOpLocal(a, -0.5, HD - 1.1), deskYaw: f.ry
    };
  }
  function pkOpCanWork(a) {
    var C = a.ctl;
    if (!a.open || !a.boothFrame || !a.boothPanel || !a.boothDoor || !C || C.fault || C.maint) return false;
    if (PK.duty && PK.duty.id === a.id) return false;                 // the player is on duty there
    for (var i = 0; i < PK_OPS.list.length; i++) if (PK_OPS.list[i].ride === a) return false;
    return true;
  }
  function pkOpPick(op) {
    var best = null, bs = -1e9;
    PK.attractions.forEach(function (a) {
      if (!pkOpCanWork(a) || a === op.last) return;
      var d = Math.hypot(a.boothFrame.x - op.x, a.boothFrame.z - op.z), sc = a.queue.length * 3 - d / 25 + Math.random() * 4 + (a.ctl.key ? 0 : 2);
      if (sc > bs) { bs = sc; best = a; }
    });
    return best;
  }

  // ── A person ──────────────────────────────────────────────────────
  function pkOpMake(i) {
    var name = PK_OP_NAMES[i % PK_OP_NAMES.length];
    var g = makeHuman({ key: 'operator:' + name, skin: PK_OP_SKINS[i % PK_OP_SKINS.length], hair: PK_OP_HAIRS[i % PK_OP_HAIRS.length],
      shirt: std({ map: TEX.cloth, color: 0x1f7a8c, roughness: 0.92 }), pants: std({ map: TEX.cloth, color: 0x23282e, roughness: 0.95 }) });
    g.userData.dynamic = true; scene.add(g);
    var op = { i: i, name: name, g: g, x: PK_OP_HOME.x, z: PK_OP_HOME.z, yaw: Math.PI / 2, path: [], speed: 1.6, state: 'pick', t: 0, wait: 0,
      ride: null, last: null, clocked: false, rounds: 0, target: 0, quietT: 0, pose: 'idle', faceYaw: null };
    op.hit = hitBox(0.8, 1.9, 0.8, 0, 0.95, 0, { prompt: function () { return op.name + ', ride operator: ' + pkOpWords(op); }, use: function () { say(op.g, pkOpLine(op)); } }, g);
    pkOpPlace(op);
    return op;
  }
  function pkOpRemove(op) {
    pkOpLeaveRide(op);
    var k = inter.indexOf(op.hit); if (k >= 0) inter.splice(k, 1);
    scene.remove(op.g); var j = PK_OPS.list.indexOf(op); if (j >= 0) PK_OPS.list.splice(j, 1);
  }
  function pkOpPlace(op) { var y = floorY(op.x, op.z, op.y || 0); op.y = y; op.g.position.set(op.x, y, op.z); op.g.userData.baseY = y; op.g.rotation.y = op.yaw; }
  function pkOpWords(op) {
    var r = op.ride ? op.ride.name : '';
    return { pick: 'choosing a ride', toBooth: 'on the way to ' + r, enter: 'going into the booth', clockIn: 'clocking in', work: 'working ' + r + ' (round ' + Math.min(op.rounds + 1, op.target) + ' of ' + op.target + ')',
      finish: 'putting ' + r + ' back on AUTO', clockOut: 'clocking out', leave: 'leaving the booth', toBreak: 'off for a break', onBreak: 'on a break', home: 'going home' }[op.state] || op.state;
  }
  function pkOpLine(op) { return op.state === 'work' ? 'Running ' + op.ride.name + ' by hand. I put it back on AUTO when I go.' : op.state === 'onBreak' ? 'Five minutes, boss.' : 'Hi! ' + pkOpWords(op).charAt(0).toUpperCase() + pkOpWords(op).slice(1) + '.'; }
  // a walk: the route finder over the park, or a straight line inside a booth
  function pkOpGo(op, p, straight) { op.path = straight ? [{ x: p.x, z: p.z }] : route({ x: op.x, z: op.z }, { x: p.x, z: p.z }); op.faceYaw = null; }
  function pkOpWalkThrough(op, pts) { op.path = pts.map(function (p) { return { x: p.x, z: p.z }; }); op.faceYaw = null; }

  // ── At the desk ───────────────────────────────────────────────────
  function pkOpPress(op, part) { var P = op.ride.boothPanel; return pkOpDo(op, function () { if (part === 'auto') return pkBoothAuto(op.ride); if (part === 'dispatch') return pkBoothDispatch(op.ride); var b = P.buttons[part]; if (b) return b.press(); }); }
  function pkOpLeaveRide(op) {
    var a = op.ride; if (!a) return;
    if (a.ctl && !a.ctl.auto) pkOpDo(op, function () { pkBoothAuto(a); });   // never leave a ride on MANUAL with nobody in the booth
    if (op.clocked) { op.clocked = false; screenDirtyAll(); }
    op.ride = null;
  }
  // one look at the desk: what the ride wants now, done after a human pause
  function pkOpWork(op, dt) {
    var a = op.ride, C = a.ctl;
    op.wait -= dt; if (op.wait > 0) return;
    op.wait = 0.4;
    if (C.fault) return;                                    // stopped: the operator waits for whoever pressed it to reset it
    if (C.auto) { op.state = 'finish'; return; }            // someone put it back on AUTO: the shift here is over
    var done = op.rounds >= op.target || PK.closed || op.going;
    var walkers = pkAttrWalkers(a);
    switch (a.state) {
      case 'idle':
        if (done) { op.state = 'finish'; return; }
        if (a.queue.length) { pkOpPress(op, 'gates'); op.wait = randf(1.2, 2.0); op.idleT = 0; }
        else { op.idleT = (op.idleT || 0) + 0.4; if (op.idleT > 20) { op.target = op.rounds; op.state = 'finish'; } }
        break;
      case 'boarding':
      case 'ready':                                         // loaded with the gates shut: bars, then dispatch
        op.boardT = (op.boardT || 0) + 0.4;
        if (C.gates) {
          // loaded: nobody still walking to a seat, and the ride full or nobody at the head of the lane ready to step on
          // (guests still on their way to the line do not hold the ride), or it has boarded long enough
          var head = a.queue[0], boardable = !!head && (head.state === 'qwait' || head.state === 'qmove');
          var loaded = a.riders > 0 && !walkers && op.boardT > 3 && (!pkAttrHasSeat(a) || !boardable || op.boardT > 25);
          var empty = !a.riders && !a.queue.length && !walkers && op.boardT > 10;
          if (loaded || empty) { pkOpPress(op, 'gates'); op.wait = randf(0.9, 1.5); }
        } else if (a.riders > 0 && !walkers) {
          if (C.barsWant < 0.5) { pkOpPress(op, 'bars'); op.wait = randf(1.2, 1.8); }
          else if (C.bars > 0.9) { pkOpPress(op, 'dispatch'); if (a.state === 'running') { op.rounds++; op.boardT = 0; } op.wait = randf(1.0, 1.6); }
        } else if (!a.riders && !a.queue.length) { op.boardT = 0; }
        else if (a.queue.length && !walkers) { pkOpPress(op, 'gates'); op.wait = randf(1.2, 2.0); }   // shut too soon: open again
        break;
      case 'unloading':
        if (a.awaitBars) { pkOpPress(op, 'bars'); op.wait = randf(1.0, 1.6); }
        else if (done) { op.state = 'finish'; }
        break;
    }
  }

  // ── A shift, one frame ────────────────────────────────────────────
  function pkOpTick(op, dt) {
    var moving = false;
    if (op.path && op.path.length) { moving = !walkAlong(op, op.path, op.speed, dt); }
    else if (op.faceYaw !== null) op.yaw += Math.atan2(Math.sin(op.faceYaw - op.yaw), Math.cos(op.faceYaw - op.yaw)) * Math.min(1, dt * 6);
    pkOpPlace(op);
    animateHuman(op.g, dt, moving ? 'walk' : op.pose, op.speed);
    if (moving) return;
    op.t += dt;
    var a = op.ride, sp = a ? pkOpSpots(a) : null;
    switch (op.state) {
      case 'pick':
        if (op.going) { op.state = 'home'; pkOpGo(op, PK_OP_HOME); return; }
        a = pkOpPick(op);
        if (!a) { op.state = 'toBreak'; var b = PK_OP_BREAKS[Math.floor(Math.random() * PK_OP_BREAKS.length)]; pkOpGo(op, { x: b[0], z: b[1] }); return; }
        op.ride = a; op.rounds = 0; op.target = 2 + Math.floor(Math.random() * 3); op.state = 'toBooth'; pkOpGo(op, pkOpSpots(a).foot);
        break;
      case 'toBooth':
        if (!pkOpStillFree(op)) { op.ride = null; op.state = 'pick'; return; }
        a.boothDoor.want = 1; op.state = 'enter'; pkOpWalkThrough(op, [sp.out, sp.inn, sp.clock]);
        break;
      case 'enter':
        op.faceYaw = sp.clockYaw; op.state = 'clockIn'; op.t = 0; op.pose = 'work';
        break;
      case 'clockIn':
        if (op.t < 1.4) return;
        a.boothDoor.want = 0;
        op.clocked = true; screenDirtyAll();
        if (!a.ctl.key) pkOpDo(op, function () { pkSetRideKey(a, true); });
        if (a.ctl.auto) { pkOpPress(op, 'auto'); if (S.ctlAuto) S.ctlAuto[a.id] = true; }   // MANUAL for the shift only: a save mid-shift loads the ride on AUTO
        if (Math.random() < 0.5) say(op.g, 'Clocked in. ' + a.name + ' is mine.');
        op.state = 'toDesk'; op.pose = 'idle'; pkOpWalkThrough(op, [sp.desk]);
        break;
      case 'toDesk':
        op.faceYaw = sp.deskYaw; op.pose = 'work'; op.state = 'work'; op.wait = 1.0; op.boardT = 0; op.idleT = 0;
        break;
      case 'work':
        op.faceYaw = sp.deskYaw; pkOpWork(op, dt);
        break;
      case 'finish':
        if (a.ctl && !a.ctl.auto) pkOpPress(op, 'auto');
        op.state = 'toClockOut'; op.pose = 'idle'; pkOpWalkThrough(op, [sp.clock]);
        break;
      case 'toClockOut':
        op.faceYaw = sp.clockYaw; op.pose = 'work'; op.state = 'clockOut'; op.t = 0;
        break;
      case 'clockOut':
        if (op.t < 1.2) return;
        op.clocked = false; screenDirtyAll(); a.boothDoor.want = 1; op.pose = 'idle';
        op.state = 'leave'; pkOpWalkThrough(op, [sp.inn, sp.out, sp.foot]);
        break;
      case 'leave':
        a.boothDoor.want = 0; op.last = a; op.ride = null;
        if (op.going) { op.state = 'home'; pkOpGo(op, PK_OP_HOME); return; }
        if (Math.random() < 0.4) { op.state = 'toBreak'; var bb = PK_OP_BREAKS[Math.floor(Math.random() * PK_OP_BREAKS.length)]; pkOpGo(op, { x: bb[0], z: bb[1] }); }
        else op.state = 'pick';
        break;
      case 'toBreak':
        op.state = 'onBreak'; op.t = 0; op.breakFor = randf(25, 60); op.pose = 'wait';
        if (Math.random() < 0.3) say(op.g, 'Coffee time.');
        break;
      case 'onBreak':
        if (op.going || op.t > op.breakFor) { op.pose = 'idle'; op.state = 'pick'; }
        break;
      case 'home':
        pkOpRemove(op);
        break;
    }
  }
  // a ride stays theirs only while it can still be worked and nobody else got there first
  function pkOpStillFree(op) {
    var a = op.ride; if (!a || !a.open || !a.ctl || a.ctl.fault || a.ctl.maint || (PK.duty && PK.duty.id === a.id)) return false;
    for (var i = 0; i < PK_OPS.list.length; i++) { var o = PK_OPS.list[i]; if (o !== op && o.ride === a) return false; }
    return true;
  }

  // ── The roster: as many as are hired, in their hours ──────────────
  hook('frame', function (dt) {
    if (!ui.started || !PK.attractions) return;
    var want = S.time >= 8.5 && S.time < 22 ? pkOpCount() : 0;
    // too many: the last ones finish where they are and go home
    PK_OPS.list.forEach(function (op, i) {
      var go = i >= want;
      if (go && !op.going) { op.going = true; if (op.state === 'work' || op.state === 'clockIn' || op.state === 'toDesk') op.state = 'finish'; else if (op.state === 'onBreak' || op.state === 'toBreak' || op.state === 'pick') { op.state = 'home'; pkOpGo(op, PK_OP_HOME); } }
      if (!go) op.going = false;
    });
    // too few: the missing ones come out of HQ, one at a time
    PK_OPS.spawnT = (PK_OPS.spawnT || 0) - dt;
    if (PK_OPS.list.filter(function (o) { return !o.going; }).length < want && PK_OPS.spawnT <= 0) {
      var used = PK_OPS.list.map(function (o) { return o.i; }), i = 0; while (used.indexOf(i) >= 0) i++;
      PK_OPS.list.push(pkOpMake(i)); PK_OPS.spawnT = 6;
    }
    PK_OPS.list.slice().forEach(function (op) { pkOpTick(op, Math.min(dt, 0.1)); });
  });
  // a save from before the team: one operator hired, and the coaster on AUTO as it used to run
  var _pkOpMigrate = GAME.migrate;
  GAME.migrate = function (s) { s = _pkOpMigrate ? _pkOpMigrate(s) : s; if (s.operator && typeof s.operators !== 'number') { s.operators = 1; s.auto = true; } return s; };
  var _pkOpT = GAME.T;
  GAME.T = function () { var t = _pkOpT(); t.PK_OPS = PK_OPS; t.pkOpTick = pkOpTick; t.pkOpMake = pkOpMake; t.pkOpRemove = pkOpRemove; t.pkOpCount = pkOpCount; return t; };
