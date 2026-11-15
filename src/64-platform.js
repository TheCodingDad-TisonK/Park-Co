//@ Park Co, part 64: DUO mode and the platform crew (tison, 2026-11-15). A ride runs SOLO, as it always did (one operator at the desk does
//@ everything), or DUO, with two: the main operator in the booth and a second on the platform. A SOLO / DUO key on every ride's control cabinet
//@ (the one with the lamp test and the maintenance key) picks the mode. In DUO the work is split:
//@   the main operator keeps the main GATES (the queue gate), the start and DISPATCH;
//@   the platform operator alone works the STN GATES and the BARS, at the box on its pole at the end of the platform (part 65), and gives the
//@   RELEASE, the sign that the platform is clear, which is what lets the main operator dispatch.
//@ The booth desk's own BARS and STN GATES buttons refuse in DUO, and a dispatch (the desk's, AUTO's or a hired operator's) waits for the
//@ release. The second operator is the player at the box, or a hired worker: when the player is on duty in a booth in DUO with nobody on the
//@ platform, a free worker walks up and asks if they should work it (yes or no); when a hired operator runs the booth, a second hired worker
//@ takes the platform on their own, and with none to spare the operator checks the platform himself after a few seconds, so a ride never
//@ stands still for want of a hand. Three kinds of ride are covered by one set of rules through small adapters: the rides built on the
//@ attraction kit, the main coaster (its own state machine, behind a stand-in object PK_MAIN) and Dream Flight's endless line (the release
//@ lets the next gondola go). The Arena's show and the Skyline have no platform: always SOLO, no box.
  var PK_PL = { askFor: null, askT: 0, boxes: [] }, PK_PCALL = false, PK_MAIN = null;
  function pkPlatRide(a) { return !!a && !a.curtain && !a.skyline; }
  function pkDuo(a) { return !!(a && S && S.duo && S.duo[a.id] && pkPlatRide(a)); }
  function pkPlat(a) { return a.plat || (a.plat = { crew: null, who: '', rel: false, near: 0, holdT: 0, waitT: 0 }); }
  function pkKind(a) { return a.main ? 'main' : (a.continuous ? 'cont' : 'gen'); }
  function pkCrewOn(a) { return pkDuo(a) && !!(a.plat && a.plat.crew); }
  function pkMainDuo() { return pkDuo(PK_MAIN); }
  // ── The three kinds of ride behind one set of questions ──────────────────────────────────────────
  function plBarsDown(a) { var k = pkKind(a); return k === 'main' ? PK.ride.barsWant > 0.5 : k === 'cont' ? !a.extra.barsHold : a.ctl.barsWant > 0.5; }
  function plStnShut(a) { return a.main ? PK.stnForce === false : a.stationGates === false; }
  function plRiders(a) { return a.main ? PK.ride.riders : a.riders; }
  function plMoving(a) { if (a.continuous) return false; return a.main ? (PK.ride.state === 'dispatch' || PK.ride.state === 'running' || PK.ride.state === 'arrive') : (a.state === 'running' || a.state === 'dispatch'); }
  function plWalkers(a) { return a.main ? pkStillBoarding() : (a.continuous ? false : pkAttrWalkers(a)); }
  function plKeyOk(a) { return a.main ? !!S.coasterKey : !!a.ctl.key; }
  function plFault(a) { return a.main ? !!PK.ride.fault : !!a.ctl.fault; }
  function plMaint(a) { return a.main ? false : !!a.ctl.maint; }
  function plOpen(a) { return a.main ? pkCoasterOpen() : !!a.open; }
  function plGatesShut(a) { return a.main ? !(PK.gates[0] && PK.gates[0].open) : (a.continuous ? true : !a.ctl.gates); }
  // loaded and ready for the platform operator to close up: riders aboard and seated, the main gate shut
  function plLoaded(a) {
    var k = pkKind(a);
    if (k === 'main') { var R = PK.ride; return (R.state === 'loading' || R.state === 'ready') && R.riders > 0 && !pkStillBoarding() && plGatesShut(a); }
    if (k === 'cont') { var E = a.extra, D = PK_DV; if (E.sys !== 'running') return false; return E.gons.some(function (g) { return g.s >= D.sStationIn && g.s > D.L - 9 && g.seats.some(function (st) { return (st.guest || st.player) && !(st.guest && st.guest.state === 'walkSeat'); }) && !g.seats.some(function (st) { return st.guest && st.guest.state === 'walkSeat'; }); }); }
    return (a.state === 'boarding' || a.state === 'ready') && a.riders > 0 && !pkAttrWalkers(a) && !a.ctl.gates;
  }
  // a ride that has finished and holds its riders until the restraints are raised
  function plWaitsBars(a) { return a.main ? (PK.ride.state === 'unload' && PK.ride.riders > 0 && PK.ride.barsWant > 0.5) : (!a.continuous && a.state === 'unloading' && !!a.awaitBars); }
  function plBarsUp(a) {
    if (a.main) { PK_PCALL = true; try { return pkBarsUp(); } finally { PK_PCALL = false; } }
    if (a.continuous) { a.extra.barsHold = true; return true; }
    pkAttrBarsUp(a, a.ctl); return true;
  }

  function pkSetDuo(a, on, quiet) {
    if (!S.duo) S.duo = {};
    if (!!S.duo[a.id] === !!on) return;
    if (on && plMoving(a)) { toast('Not while ' + a.name + ' is running', 'bad'); sfx('bad'); return false; }
    S.duo[a.id] = !!on; var P = pkPlat(a); P.rel = false;
    if (a.continuous) a.extra.barsHold = !!on;   // in DUO the restraints are held open for boarding until the platform operator locks them
    if (!on) pkPlatDismiss(a);
    if (!quiet) { sfx('click'); toast(a.name + ': ' + (on ? 'DUO: a second operator works the platform' : 'SOLO: one operator'), on ? 'good' : ''); logEvent(a.name + (on ? ' set to DUO' : ' set to SOLO'), ''); }
    screenDirtyAll(); hudDirty = true; return true;
  }
  function pkPlatDismiss(a) {
    var P = a.plat; if (!P) return;
    if (P.crew && P.crew !== 'player' && P.crew.plat === a) { P.crew.plat = null; if (P.crew.state === 'platWalk' || P.crew.state === 'platWork') P.crew.state = 'platLeave'; }
    P.crew = null; P.who = ''; P.rel = false;
  }
  function pkPlatWho(a) { var P = a.plat; return !P || !P.crew ? '' : (P.crew === 'player' ? 'YOU' : P.crew.name.toUpperCase()); }

  // ── What the platform operator does (the box's three buttons; a hired hand does the same) ─────────
  function pkPlatRefuse(msg) { sfx('bad'); toast(msg, 'bad'); return false; }
  function pkPlatCan(a) {
    if (!plOpen(a)) return pkPlatRefuse(a.name + ' has no power - the breaker is off');
    if (!plKeyOk(a)) return pkPlatRefuse(a.name + ' is locked - turn the operator key on');
    if (plFault(a)) return pkPlatRefuse('Reset ' + a.name + ' first');
    if (plMaint(a)) return pkPlatRefuse(a.name + ' is locked out - turn the key to RUN');
    if (!pkDuo(a)) return pkPlatRefuse('Switch ' + a.name + ' to DUO at its cabinet to use the platform box');
    return true;
  }
  function pkPlatStation(a) {
    if (!pkPlatCan(a)) return false;
    if (plMoving(a)) return pkPlatRefuse('Not while ' + a.name + ' is running');
    if (a.main) { PK_PCALL = true; try { return pkStationGates(); } finally { PK_PCALL = false; } }
    a.stationGates = a.stationGates === false ? true : false;
    if (a.stationGates) pkPlat(a).rel = false;
    sfx('click'); toast(a.name + ': station gates ' + (a.stationGates ? 'open' : 'shut'), a.stationGates ? '' : 'good');
    screenDirtyAll(); return true;
  }
  function pkPlatBars(a) {
    if (!pkPlatCan(a)) return false;
    var k = pkKind(a), P = pkPlat(a);
    if (k === 'cont') {
      var E = a.extra; E.barsHold = !E.barsHold; if (E.barsHold) P.rel = false;
      sfx('click'); toast(a.name + ': restraints ' + (E.barsHold ? 'held open' : 'locking'), ''); screenDirtyAll(); return true;
    }
    if (plMoving(a)) return pkPlatRefuse('Not while ' + a.name + ' is running');
    if (plBarsDown(a)) { plBarsUp(a); P.rel = false; sfx('click'); if (!a.main) toast(a.name + ': restraints up', ''); screenDirtyAll(); return true; }
    if (k === 'main') { PK_PCALL = true; try { return pkBarsDown(); } finally { PK_PCALL = false; } }
    if (a.state !== 'boarding' && a.state !== 'ready') return pkPlatRefuse('Nothing to lock: ' + a.name + ' is not boarding');
    if (!a.riders) return pkPlatRefuse('Nobody is aboard ' + a.name);
    if (pkAttrWalkers(a)) return pkPlatRefuse('Let the riders sit first');
    a.ctl.barsWant = 1; if (a.state === 'boarding' && !a.ctl.gates) a.state = 'ready';
    sfx('click'); toast(a.name + ': restraints down', 'good'); screenDirtyAll(); return true;
  }
  function pkPlatRelease(a) {
    if (!pkPlatCan(a)) return false;
    var k = pkKind(a), P = pkPlat(a);
    if (k === 'main') { var R = PK.ride; if (R.state !== 'loading' && R.state !== 'ready') return pkPlatRefuse('Nothing to release: the train is not loading'); }
    else if (k === 'gen' && a.state !== 'boarding' && a.state !== 'ready') return pkPlatRefuse('Nothing to release: ' + a.name + ' is not boarding');
    if (k !== 'cont' && !plRiders(a)) return pkPlatRefuse('Nobody is aboard ' + a.name);
    if (!plStnShut(a)) return pkPlatRefuse('Shut the station gates first');
    if (!plBarsDown(a)) return pkPlatRefuse('Lower the restraints first');
    if (P.rel) { sfx('click'); return true; }
    P.rel = true; P.relT = worldTime;
    sfx('bell'); toast(a.name + ': platform clear, released', 'good'); logEvent(a.name + ': platform released', '');
    screenDirtyAll(); return true;
  }
  // the player's first press of a box takes the platform: while they stay near it they are the second operator
  function pkPlatPress(a, which) {
    var P = pkPlat(a);
    if (pkDuo(a) && P.crew && P.crew !== 'player') { sfx('bad'); toast(P.crew.name + ' is working the platform', 'bad'); return false; }
    if (pkDuo(a) && !P.crew && pkPlatCan(a)) { P.crew = 'player'; P.who = 'player'; P.near = 0; toast('You are on the platform at ' + a.name, ''); }
    if (which === 'station') return pkPlatStation(a);
    if (which === 'bars') return pkPlatBars(a);
    return pkPlatRelease(a);
  }

  // ── The gates in the existing flow (called from parts 03, 05, 09, 14, 26 and 48) ─────────────────
  // a dispatch of a loaded ride in DUO waits for the release; true: it may go
  function pkPlatDispatchOk(a, say) {
    if (!pkDuo(a) || plRiders(a) <= 0) return true;
    var P = pkPlat(a);
    if (P.rel) return true;
    if (say) { var m = P.crew ? 'Waiting for the platform release' : 'No one is on the platform: a second operator has to release ' + a.name; if (a.main) pkRefuse(m); else pkBoothRefuse(m); }
    return false;
  }
  function pkPlatUsed(a) { if (a.plat) a.plat.rel = false; if (a.continuous && pkDuo(a)) a.extra.barsHold = true; }   // a gondola went: the next one boards with the restraints open
  // the desk's BARS and STN GATES are the platform operator's in DUO
  function pkPlatDeskRefuse(a, what) {
    if (!pkDuo(a) || PK_PCALL) return false;
    var m = 'DUO: the ' + what + ' are the platform operator\'s: use the box on the platform';
    if (a.main) pkRefuse(m); else pkBoothRefuse(m);
    return true;
  }

  // ── The roster: who stands on the platform ───────────────────────────────────────────────────────
  function pkFreeHand() {
    var best = null;
    PK_OPS.list.forEach(function (op) { if (!op.going && !op.ride && !op.plat && !op.offer && (op.state === 'pick' || op.state === 'toBreak' || op.state === 'onBreak') && !best) best = op; });
    return best;
  }
  function pkPlatAssign(op, a) {
    var P = pkPlat(a); P.crew = op; P.who = 'worker'; P.rel = false;
    op.plat = a; op.offer = null; op.state = 'platWalk'; op.pose = 'idle'; op.going = false;
    var b = a.platBox; if (b) { op.path = route({ x: op.x, z: op.z }, { x: b.sx, z: b.sz }); op.faceYaw = null; }
    if (Math.random() < 0.6) say(op.g, 'I have the platform at ' + a.name + '.');
  }
  // the question: a card at the foot of the screen and Y or N (the crosshair is locked to the view, so keys answer it)
  function pkAskShow(op, a) {
    var el = document.getElementById('pk-ask');
    if (!el) { el = document.createElement('div'); el.id = 'pk-ask'; document.body.appendChild(el); }
    el.innerHTML = '<div class="who">' + op.name + '</div><div class="q">Want me to work the platform at ' + a.name + '?</div><div class="keys"><span><b>Y</b> Yes</span><span><b>N</b> No thanks</span></div>';
    el.hidden = false; PK_PL.askFor = { op: op, a: a }; PK_PL.askT = 25;
  }
  function pkAskHide() { var el = document.getElementById('pk-ask'); if (el) el.hidden = true; PK_PL.askFor = null; }
  function pkAskAnswer(yes) {
    var q = PK_PL.askFor; if (!q) return; pkAskHide();
    var op = q.op, a = q.a;
    if (yes && PK_OPS.list.indexOf(op) >= 0 && pkDuo(a) && !pkPlat(a).crew) { pkPlatAssign(op, a); sfx('ok'); say(op.g, 'On it.'); }
    else { op.offer = null; if (PK_OPS.list.indexOf(op) >= 0) { op.state = 'pick'; op.pose = 'idle'; } pkPlat(a).noT = worldTime + 150; say(op.g, yes ? 'Not needed after all.' : 'No problem.'); }
  }
  window.addEventListener('keydown', function (e) {
    if (!PK_PL.askFor || e.repeat) return;
    if (e.code === 'KeyY') { e.preventDefault(); e.stopPropagation(); pkAskAnswer(true); }
    else if (e.code === 'KeyN') { e.preventDefault(); e.stopPropagation(); pkAskAnswer(false); }
  }, true);

  // a hired hand on the platform, one look at a time
  function pkPlatWork(op, dt) {
    var a = op.plat, P = pkPlat(a);
    op.wait = (op.wait || 0) - dt; if (op.wait > 0) return;
    op.wait = 0.5;
    if (!pkDuo(a) || !plOpen(a) || plFault(a) || plMaint(a) || P.crew !== op) { op.state = 'platLeave'; return; }
    if (plWaitsBars(a)) { if (plBarsDown(a)) { pkOpPressPlat(op, a, 'bars'); op.wait = randf(1.0, 1.6); } return; }   // the riders are waiting for the bars
    if (plStnShut(a) && !P.rel && !plLoaded(a)) { pkOpPressPlat(op, a, 'station'); op.wait = randf(1.0, 1.6); return; }   // after a ride (or a gondola) the gates open for the next boarding
    if (!plLoaded(a)) { op.boardT = 0; return; }
    op.boardT = (op.boardT || 0) + 0.5;
    if (op.boardT < 3 && !(a.main ? false : (!a.continuous && !pkAttrHasSeat(a)))) return;
    if (!plStnShut(a)) { pkOpPressPlat(op, a, 'station'); op.wait = randf(0.9, 1.5); }
    else if (!plBarsDown(a)) { pkOpPressPlat(op, a, 'bars'); op.wait = randf(1.2, 1.8); }
    else if (!P.rel) { op.wait = randf(0.8, 1.4); pkOpPressPlat(op, a, 'release'); if (P.rel && Math.random() < 0.7) say(op.g, 'Clear!'); }
  }
  function pkOpPressPlat(op, a, which) {
    PK_OPS.quiet++; PK_OPS.near = typeof player !== 'undefined' && player && Math.hypot(player.x - op.x, player.z - op.z) < 9;
    try { if (which === 'station') pkPlatStation(a); else if (which === 'bars') pkPlatBars(a); else pkPlatRelease(a); } finally { PK_OPS.quiet--; }
    if (typeof pkPlatBoxPress === 'function') pkPlatBoxPress(a, which);
  }

  // ── Every frame: the second operator, the offer, the fall-backs ───────────────────────────────────
  function pkPlatList() { var l = PK.attractions.slice(); if (PK_MAIN) l.push(PK_MAIN); return l; }
  hook('frame', function (dt) {
    if (!ui.started || !PK.attractions) return;
    if (!PK_MAIN && PK.ride && PK.gates) pkMainMake();
    var now = worldTime;
    pkPlatList().forEach(function (a) {
      if (!pkDuo(a)) { if (a.plat && a.plat.crew) pkPlatDismiss(a); return; }
      var P = pkPlat(a), k = pkKind(a);
      if (P.crew === 'player') {
        var b = a.platBox, d = b ? Math.hypot(player.x - b.x, player.z - b.z) : 99;
        P.near = d > 16 ? P.near + dt : 0;
        if (P.near > 6) { P.crew = null; P.who = ''; P.rel = false; toast('You left the platform at ' + a.name, ''); }
      }
      if (P.crew && P.crew !== 'player' && (PK_OPS.list.indexOf(P.crew) < 0 || P.crew.plat !== a)) { P.crew = null; P.who = ''; }
      // gates open again for the next boarding when nobody works the platform
      if (!P.crew && !plLoaded(a) && !plMoving(a) && plStnShut(a)) { if (a.main) PK.stnForce = null; else a.stationGates = true; }
      // a finished ride holding its riders for the bars, with nobody on the platform: after a spell the bars go up
      if (plWaitsBars(a) && !P.crew) { P.holdT = (P.holdT || 0) + dt; if (P.holdT > 8) { P.holdT = 0; plBarsUp(a); toast(a.name + ': nobody on the platform, restraints up', ''); } }
      else if (!plWaitsBars(a)) P.holdT = 0;
      // the second operator (the player clocked in beside a hired operator): when the operator is gone the player holds the desk, and a platform nobody works falls back to the player
      if (PK.duty && PK.duty.id === a.id && PK.duty.second && !PK_OPS.list.some(function (o) { return o.ride === a && !o.going; })) { PK.duty.second = false; toast('The operator has gone: you run the desk at ' + a.name, ''); }
      var booth = !!PK.duty && PK.duty.id === a.id && !PK.duty.second, loaded = plLoaded(a);
      if (loaded && !P.crew) {
        P.waitT = (P.waitT || 0) + dt;
        if (!booth) {
          var free = pkFreeHand();
          if (free) pkPlatAssign(free, a);
          else if (P.waitT > 8) { P.rel = true; P.relT = now; P.waitT = 0; if (k === 'main') { if (PK.ride.barsWant < 0.5) { PK_PCALL = true; try { pkBarsDown(); } finally { PK_PCALL = false; } } } else if (k === 'cont') a.extra.barsHold = false; else if (a.ctl.barsWant < 0.5) a.ctl.barsWant = 1; }
        } else if (P.waitT > 12 && now > (P.hintT || 0)) { P.hintT = now + 40; toast(a.name + ' is on DUO with nobody on the platform: work the box, wait for a hand or switch to SOLO', ''); }
      } else if (!loaded) P.waitT = 0;
      // the player on duty in a booth in DUO with the platform empty: a free hand walks up and asks
      if (booth && !P.crew && !PK_PL.askFor && now > (P.noT || 0)) {
        var h = pkFreeHand();
        if (h) {
          h.offer = a; h.state = 'platAsk'; h.pose = 'idle'; h.faceYaw = null;
          var sp = !a.main && typeof pkOpSpots === 'function' ? (a.boothFrame || pkOpRoomSpotsSafe(a) ? pkOpSpots(a) : null) : null;
          h.path = route({ x: h.x, z: h.z }, sp && sp.foot ? { x: sp.foot.x, z: sp.foot.z } : { x: player.x, z: player.z });
          if (sp && sp.out && sp.inn) h.path = h.path.concat([{ x: sp.out.x, z: sp.out.z }, { x: sp.inn.x, z: sp.inn.z }]);
          if (a.boothDoor) a.boothDoor.want = 1;
        }
      }
    });
    if (PK_PL.askFor) {
      PK_PL.askT -= dt;
      var q = PK_PL.askFor;
      if (PK_PL.askT <= 0 || !PK.duty || PK.duty.id !== q.a.id || !pkDuo(q.a)) pkAskAnswer(false);
    }
  });
  function pkOpRoomSpotsSafe(a) { try { return !!pkOpRoomSpots(a); } catch (e) { return false; } }
  // the hired hand's own states, handed to part 26's tick (it calls this for any state it does not know)
  function pkPlatOpState(op, dt) {
    var a = op.plat || op.offer;
    switch (op.state) {
      case 'platAsk':
        if (!op.offer || !pkDuo(op.offer) || !PK.duty || PK.duty.id !== op.offer.id) { op.offer = null; op.state = 'pick'; if (op.ride === null && op.path) op.path = []; return true; }
        if (!(op.path && op.path.length)) {
          var dd = Math.hypot(player.x - op.x, player.z - op.z);
          if (dd < 3.6) { op.faceYaw = Math.atan2(player.x - op.x, player.z - op.z); if (!PK_PL.askFor) pkAskShow(op, op.offer); }
          else { op.path = route({ x: op.x, z: op.z }, { x: player.x, z: player.z }); op.faceYaw = null; }
        }
        return true;
      case 'platWalk':
        if (!op.plat) { op.state = 'platLeave'; return true; }
        op.state = 'platWork'; op.faceYaw = a.platBox ? a.platBox.faceYaw : null; op.pose = 'idle'; op.wait = 0.8; op.boardT = 0; return true;
      case 'platWork':
        if (!op.plat || op.going) { op.state = 'platLeave'; return true; }
        if (a.platBox) op.faceYaw = a.platBox.faceYaw;
        pkPlatWork(op, dt); return true;
      case 'platLeave':
        if (op.plat) { var P2 = pkPlat(op.plat); if (P2.crew === op) { P2.crew = null; P2.who = ''; P2.rel = false; } op.plat = null; }
        op.offer = null; op.pose = 'idle'; op.state = 'pick'; return true;
    }
    return false;
  }

  // ── The main coaster, as a ride the platform code can talk to ─────────────────────────────────────
  // PK_MAIN stands in for it: the same names (state, riders, queue, open) read live from the coaster's own state machine
  function pkMainMake() {
    PK_MAIN = { id: 'coaster', name: 'The coaster', main: true, boothPanel: {}, plat: null, platBox: null, qx: PK.stationX0, qz: -2.4, qdx: 1, x: 0, z: -20 };
    Object.defineProperty(PK_MAIN, 'open', { get: function () { return pkCoasterOpen(); } });
    Object.defineProperty(PK_MAIN, 'riders', { get: function () { return PK.ride.riders; } });
    Object.defineProperty(PK_MAIN, 'queue', { get: function () { return PK.queue; } });
    Object.defineProperty(PK_MAIN, 'state', { get: function () { var s = PK.ride.state; return s === 'loading' ? 'boarding' : s === 'unload' ? 'unloading' : (s === 'dispatch' || s === 'arrive') ? 'running' : s; } });
  }
  // the main coaster's own checks, called from part 03
  function pkMainPlatDispatchOk() { return pkPlatDispatchOk(PK_MAIN, false); }
  function pkMainDeskRefuse(what) { return PK_MAIN ? pkPlatDeskRefuse(PK_MAIN, what) : false; }
  function pkMainUsed() { if (PK_MAIN) pkPlatUsed(PK_MAIN); }
