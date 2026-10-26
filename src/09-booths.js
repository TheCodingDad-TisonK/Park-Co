//@ Park Co, part 09: booths - the per-ride control system and the operator
// booths that stand beside each ride. The booth itself (part 17) is a raised
// cabin with the ride's desk, its control cabinet and its monitors. On AUTO (the
// default) a ride works its own gates, restraints and start; off AUTO it waits
// for the desk. The key switch on the cabinet locks a ride out for maintenance.

// ── Per-ride control ────────────────────────────────────────────────
// Every attraction gets a small control object: gate and restraint state that
// eases toward its target, signal lamps, and the callback arrays that move the
// ride's gates and restraints.

function pkCtl(a) {
  if (a.ctl) return a.ctl;
  var C = a.ctl = {
    gates: false,      // gates open? eased by gateT
    barsWant: 0,       // target restraint position (0 up, 1 down)
    bars: 0,           // current restraint position, eased
    gateT: 0,          // current gate position, eased (0 closed, 1 open)
    gateObjs: [],      // callbacks (t) -> move the gates
    barObjs: [],       // callbacks (b) -> move the restraints
    spd: 0,            // drive speed (0..1)
    fault: '',         // fault string; stops everything when set
    lamps: [],         // lamp meshes above the booth window
    maint: false,      // the cabinet's key switch in MAINT: the ride will not board or run
    key: false,        // the operator key on the desk: OFF (the start) locks the ride and its desk; ON unlocks them
    auto: true         // AUTO: the ride runs its own gates, restraints, start
  };
  return C;
}

function pkCtlAuto(a) {
  // AUTO is the default: the ride runs itself.
  if (!a.ctl) pkCtl(a);
  return a.ctl.auto;
}

function pkCtlLamps(a) {
  // signal lamps above the booth window follow the ride state:
  // idle green, boarding amber, running red, unloading amber; a fault shows red. A ride whose
  // breaker is down has no lit lamps at all, whatever state it was left in.
  if (!a.ctl) return;
  var C = a.ctl, col;
  switch (a.state) {
    case 'idle':      col = 0x5fd38d; break;
    case 'boarding':  col = 0xf0c04a; break;
    case 'ready':     col = 0xf0c04a; break;
    case 'running':   col = 0xff3b30; break;
    case 'unloading': col = 0xf0c04a; break;
    default:          col = 0x5fd38d;
  }
  if (C.fault) col = 0xff3b30;
  for (var i = 0; i < C.lamps.length; i++) {
    var lamp = C.lamps[i];
    if (!lamp.material || !lamp.material.emissive) continue;
    if (lamp.material.userData.pkLampBase === undefined) lamp.material.userData.pkLampBase = lamp.material.emissiveIntensity || 1;
    lamp.material.emissive.setHex(a.open ? col : 0x000000);
    lamp.material.emissiveIntensity = a.open ? lamp.material.userData.pkLampBase : 0;
  }
}

function pkCtlLoad(a) {
  // the booth's AUTO setting remembers where it was left
  var C = pkCtl(a);
  if (S.ctlAuto && typeof S.ctlAuto[a.id] === 'boolean') C.auto = S.ctlAuto[a.id];
  C.key = !!(S.ctlKey && S.ctlKey[a.id]);
}

// ── The desk, worked from the booth screen ─────────────────────────
// Keep status text and button availability derived from the live ride state.

var PK_BREFUSE_M = '', PK_BREFUSE_T = 0;
function pkBoothRefuse(msg) {
  var now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  if (msg !== PK_BREFUSE_M || now - PK_BREFUSE_T > 1200) {
    sfx('bad'); toast(msg, 'bad'); PK_BREFUSE_M = msg; PK_BREFUSE_T = now;
  }
  return false;
}

// the operator key: ON unlocks the ride and its desk, OFF locks them (not while the ride is running or carrying riders)
function pkSetRideKey(a, on) {
  var C = pkCtl(a);
  if (on && !a.open) return pkBoothRefuse(a.name + ' has no power - the breaker is off');
  if (!on && (a.state === 'running' || a.riders)) { sfx('bad'); toast('Not with riders aboard ' + a.name, 'bad'); return false; }
  C.key = !!on;
  if (!S.ctlKey) S.ctlKey = {};
  S.ctlKey[a.id] = C.key;
  if (!C.key) { C.gates = false; a.manualStart = false; if (a.state === 'boarding' || a.state === 'ready') { a.state = 'idle'; a.t = 0; } }
  toast(a.name + (C.key ? ': operator key ON - unlocked' : ': operator key OFF - locked'), C.key ? 'good' : '');
  logEvent(a.name + (C.key ? ' unlocked' : ' locked'), '');
  screenDirtyAll(); hudDirty = true;
  return true;
}
function pkBoothStatus(a, C) {
  if (!a.open) return 'NO POWER · BREAKER OFF';
  if (!C.key) return 'KEY OFF · RIDE LOCKED';
  if (C.fault) return 'E-STOP · RESET REQUIRED';
  if (C.maint) return 'MAINTENANCE · KEY IN MAINT';
  if (PK.closed && !a.riders) return 'PARK CLOSED';
  if (a.state === 'idle') return pkAttrWaiting(a) ? 'READY TO BOARD' : 'OPEN · WAITING FOR GUESTS';
  if (a.state === 'boarding') {
    if (a.boarding > 0) return 'BOARDING · ' + a.boarding + ' WALKING';
    var wq = pkAttrWaiting(a);
    if (wq) return 'BOARDING · ' + wq + ' IN QUEUE';
    if (a.riders) return 'LOAD COMPLETE · DISPATCH READY';
    return 'BOARDING · WAITING FOR GUESTS';
  }
  if (a.state === 'ready') return 'READY TO DISPATCH';
  if (a.state === 'running') return 'RIDE IN MOTION';
  if (a.state === 'unloading') return a.awaitBars ? 'STOPPED · RAISE THE BARS · ' + a.riders + ' ABOARD' : 'UNLOADING · ' + a.riders + ' ABOARD';
  return String(a.state || 'UNKNOWN').toUpperCase();
}

// the gates open and shut whenever the operator likes, line or no line: only a ride in motion, a stop or the key in MAINT
// holds them. Opening from idle, after a ride or with the bars down puts the ride to boarding; shutting an empty ride
// that is boarding puts it back to idle.
function pkBoothGates(a) {
  var C = pkCtl(a);
  if (!a.open) return pkBoothRefuse(a.name + ' has no power - the breaker is off');
  if (!C.key) return pkBoothRefuse(a.name + ' is locked - turn the operator key on');
  if (C.fault) return pkBoothRefuse('Reset ' + a.name + ' first');
  if (C.maint) return pkBoothRefuse(a.name + ' is locked out - turn the key to RUN');
  if (a.stationGates === false) return pkBoothRefuse('Open the station gates first');
  if (a.state === 'running') return pkBoothRefuse('Not while ' + a.name + ' is running');
  if (a.awaitBars) return pkBoothRefuse('Raise the restraints first: the riders are still aboard ' + a.name);
  if (C.gates && a.state !== 'idle') {   // an idle ride's gates count as shut: a press there always opens them
    C.gates = false;
    if ((a.state === 'boarding' || a.state === 'ready') && !a.riders && !pkAttrWalkers(a)) { a.state = 'idle'; a.t = 0; a.manualStart = false; }
    else if (a.state === 'boarding' && a.riders && !pkAttrWalkers(a) && !C.auto) a.state = 'ready';   // loaded and shut: bars, then dispatch
    sfx('ok'); toast(a.name + ': gates shut', '');
    screenDirtyAll();
    return true;
  }
  if (PK.closed && !a.riders) return pkBoothRefuse('The park is closed');
  if (a.state === 'idle' || a.state === 'unloading' || a.state === 'ready') { a.state = 'boarding'; a.t = 0; a.boarding = 0; a.manualStart = true; }
  C.gates = true; C.barsWant = 0;
  pkAttrReslot(a); pkAttrFill(a);
  sfx('ok'); toast(a.name + ': gates open', 'good');
  screenDirtyAll();
  return true;
}
// the station platform gates: a master barrier across the platform entrance, independent of the boarding gates
function pkStationGatesRide(a, on) {
  a.stationGates = on === undefined ? (a.stationGates === false ? true : false) : !!on;
  if (!a.stationGates && a.ctl) a.ctl.gates = false;
  sfx('click'); toast(a.name + ': station gates ' + (a.stationGates ? 'open' : 'shut'), a.stationGates ? '' : 'bad');
  screenDirtyAll(); return true;
}

function pkBoothDispatch(a) {
  var C = pkCtl(a);
  if (!a.open) return pkBoothRefuse(a.name + ' has no power - the breaker is off');
  if (!C.key) return pkBoothRefuse(a.name + ' is locked - turn the operator key on');
  if (C.fault) return pkBoothRefuse('Reset ' + a.name + ' first');
  if (C.maint) return pkBoothRefuse(a.name + ' is locked out - turn the key to RUN');
  // the order on the desk: board with the gates open, shut the gates, bars down, dispatch. (Until 0.2.4 a boarding ride
  // refused with the gates shut, 'open the gates', and with them open, 'close the gates': on MANUAL nothing ever went.)
  if (a.state !== 'boarding' && a.state !== 'ready') return pkBoothRefuse(a.state === 'idle' ? 'Board the guests first' : a.name + ' is ' + a.state);
  if (pkAttrWalkers(a)) return pkBoothRefuse('Wait for the riders to sit');
  if (!a.riders) return pkBoothRefuse('Nobody is aboard ' + a.name);
  if (C.gates) return pkBoothRefuse('Close the gates before dispatch');
  if (C.barsWant < 0.5) return pkBoothRefuse('Secure the restraints before dispatch');
  if (!pkAttrStart(a)) return pkBoothRefuse('Could not dispatch ' + a.name);
  if (pkOnDutyAt(a.id)) pkXp(1);   // on duty here: the operator's own dispatch earns a little more
  sfx('bell');
  toast(a.name + ' dispatched', 'good');
  screenDirtyAll(); hudDirty = true;
  return true;
}

function pkBoothStop(a) {
  var C = pkCtl(a);
  if (!a.open) return pkBoothRefuse(a.name + ' has no power - the breaker is off');
  if (C.fault) {
    C.fault = '';
    C.spd = 0;
    if (a.state === 'running') {
      a.t = Math.max(a.t, a.run - 3);
      if (a.tickRun) a.tickRun(a, 0, 0);
    }
    else if (a.state === 'idle') { C.gates = false; C.barsWant = 0; }
    sfx('ok'); toast(a.name + ' reset', 'good');
    logEvent(a.name + ' reset after E-stop', '');
  } else {
    C.fault = 'E-stop';
    C.gates = false;
    a.manualStart = false;
    sfx('bad'); toast(a.name + ': E-stop', 'bad');
    logEvent(a.name + ': E-stop', 'bad');
  }
  screenDirtyAll(); hudDirty = true;
  return true;
}

function pkBoothTest(a) {
  // A test run is only safe from idle: it sends an empty car, never riders.
  var C = pkCtl(a);
  if (!a.open) return pkBoothRefuse(a.name + ' has no power - the breaker is off');
  if (!C.key) return pkBoothRefuse(a.name + ' is locked - turn the operator key on');
  if (C.fault) return pkBoothRefuse('Reset ' + a.name + ' first');
  if (C.maint) return pkBoothRefuse(a.name + ' is locked out - turn the key to RUN');
  if (a.state !== 'idle') return pkBoothRefuse(a.name + ' must be idle for a test run');
  if (a.queue.length || a.riders || a.boarding) return pkBoothRefuse('Clear the queue and ride before a test run');
  var oldRiders = a.riders;
  a.riders = 1; // shared start guard expects a non-empty dispatch
  var started = false;
  try { started = pkAttrStart(a); }
  finally { a.riders = oldRiders; }
  if (!started) return pkBoothRefuse('Could not start ' + a.name);
  a.tests = (a.tests || 0) + 1;
  toast(a.name + ': test run away', 'good');
  logEvent(a.name + ': test run', '');
  screenDirtyAll(); hudDirty = true;
  return true;
}

function pkBoothAuto(a) {
  var C = pkCtl(a);
  if (!a.open) return pkBoothRefuse(a.name + ' has no power - the breaker is off');
  if (!C.key) return pkBoothRefuse(a.name + ' is locked - turn the operator key on');
  if (PK.closed) return pkBoothRefuse('The park is closed');
  C.auto = !C.auto;
  if (C.auto) a.manualStart = false;
  if (C.auto && a.state === 'boarding' && !a.queue.length && a.riders > 0) a.t = Math.max(a.t, a.board);
  if (!S.ctlAuto) S.ctlAuto = {};
  S.ctlAuto[a.id] = C.auto;
  sfx('click');
  toast(a.name + ': ' + (C.auto ? 'AUTO - runs itself' : 'MANUAL - work the desk'), '');
  logEvent(a.name + ' set to ' + (C.auto ? 'AUTO' : 'MANUAL'), '');
  screenDirtyAll();
  return true;
}

// ── Operator booths ─────────────────────────────────────────────────
// Geometry, hardware and screens live in pkRideBooth (part 17).

var PK_BOOTH = {};

function pkBuildBooth(a, p, th) {
  pkCtlStart();
  return pkRideBooth(a, p, th);
}

// ── Hook into the build ─────────────────────────────────────────────
// After every ride is built, add its booth beside it.

var _pkBuildAttractions = pkBuildAttractions;
pkBuildAttractions = function () {
  _pkBuildAttractions();
  PK.attractions.forEach(function (a) {
    if (a.plot && !a.booth) {
      var th = PK_THEME[a.id];
      if (th) pkBuildBooth(a, a.plot, th);
    }
  });
};

// the test API picks up the booth controls
var _pkTestApi = GAME.T;
GAME.T = function () {
  var o = _pkTestApi();
  o.pkBoothTest = pkBoothTest; o.pkBoothGates = pkBoothGates; o.pkBoothDispatch = pkBoothDispatch; o.pkBoothStop = pkBoothStop; o.pkBoothAuto = pkBoothAuto; o.pkBoothStatus = pkBoothStatus; o.pkCtl = pkCtl; o.pkSetRideKey = pkSetRideKey; o.pkSetCoasterKey = pkSetCoasterKey; o.pkClockIn = pkClockIn; o.pkClockOut = pkClockOut; o.pkBkFloorAt = pkBkFloorAt; o.pkBkWait = pkBkWait; o.pkBkDoors = PK_BK_DOORS; o.pkBkDoorBlocks = pkBkDoorBlocks; o.pkBkSit = pkBkSit; o.pkBkStand = pkBkStand; o.pkBkSitting = function () { return PK_SIT; }; o.pkCoProfile = pkCoProfile; o.pkSpeedAt = pkSpeedAt; o.pkCoUAt = pkCoUAt; o.pkCtlTick = pkCtlTick; o.pkRidePowered = pkRidePowered; o.pkRidePowerApply = pkRidePowerApply;
  return o;
};
