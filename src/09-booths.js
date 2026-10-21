//@ Park Co, part 09: booths - the per-ride control system and the operator
// booths that stand beside each of the seven rides. The booth is enterable: a
// door onto the midway, and inside a screen with Gates, Dispatch, E-stop and
// AUTO. On AUTO (the default) a ride works its own gates, restraints and
// start; off AUTO it waits for the booth screen.

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
  // idle green, boarding amber, running red, unloading amber; a fault shows red
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
    if (lamp.material && lamp.material.emissive) lamp.material.emissive.setHex(col);
  }
}

function pkCtlLoad(a) {
  // the booth's AUTO setting remembers where it was left
  var C = pkCtl(a);
  if (S.ctlAuto && typeof S.ctlAuto[a.id] === 'boolean') C.auto = S.ctlAuto[a.id];
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

function pkBoothStatus(a, C) {
  if (C.fault) return 'E-STOP · RESET REQUIRED';
  if (PK.closed && !a.riders) return 'PARK CLOSED';
  if (a.state === 'idle') return a.queue.length ? 'READY TO BOARD' : 'OPEN · WAITING FOR GUESTS';
  if (a.state === 'boarding') {
    if (a.boarding > 0) return 'BOARDING · ' + a.boarding + ' WALKING';
    if (a.queue.length) return 'BOARDING · ' + a.queue.length + ' IN QUEUE';
    if (a.riders) return 'LOAD COMPLETE · DISPATCH READY';
    return 'BOARDING · WAITING FOR GUESTS';
  }
  if (a.state === 'ready') return 'READY TO DISPATCH';
  if (a.state === 'running') return 'RIDE IN MOTION';
  if (a.state === 'unloading') return 'UNLOADING · ' + a.riders + ' ABOARD';
  return String(a.state || 'UNKNOWN').toUpperCase();
}

function pkBoothGates(a) {
  var C = pkCtl(a);
  if (PK.closed && !a.riders) return pkBoothRefuse('The park is closed');
  if (C.fault) return pkBoothRefuse('Reset ' + a.name + ' first');
  if (a.state === 'idle' || a.state === 'unloading') {
    if (!a.queue.length) return pkBoothRefuse('Nobody is waiting at ' + a.name);
    a.manualStart = true;
    pkAttrBegin(a);
    if (a.state !== 'boarding') { a.manualStart = false; return pkBoothRefuse('Nobody is ready to board'); }
    sfx('ok'); toast(a.name + ': gates open', 'good');
    screenDirtyAll();
    return true;
  }
  if (a.state === 'boarding') {
    C.gates = !C.gates;
    if (!C.gates && a.state === 'ready') a.state = 'boarding';
    sfx('ok'); toast(a.name + ': gates ' + (C.gates ? 'open' : 'shut'), '');
    screenDirtyAll();
    return true;
  }
  return pkBoothRefuse('Not while ' + a.name + ' is ' + a.state);
}

function pkBoothDispatch(a) {
  var C = pkCtl(a);
  if (C.fault) return pkBoothRefuse('Reset ' + a.name + ' first');
  if (a.state !== 'boarding' && a.state !== 'ready') return pkBoothRefuse(a.state === 'idle' ? 'Board the guests first' : a.name + ' is ' + a.state);
  if (a.queue.length) return pkBoothRefuse('Wait for the queue to finish boarding');
  if (a.boarding && pkAttrWalkers(a)) return pkBoothRefuse('Wait for the riders to sit');
  if (!a.riders) return pkBoothRefuse('Nobody is aboard ' + a.name);
  if (a.state === 'boarding' && !C.gates) return pkBoothRefuse('Open the gates to board ' + a.name);
  if (a.state === 'boarding' && C.barsWant < 0.5) return pkBoothRefuse('Secure the restraints before dispatch');
  if (a.state !== 'ready' && a.state !== 'boarding') return pkBoothRefuse('The ride is not ready to dispatch');
  if (C.gates) return pkBoothRefuse('Close the gates before dispatch');
  if (!pkAttrStart(a)) return pkBoothRefuse('Could not dispatch ' + a.name);
  sfx('bell');
  toast(a.name + ' dispatched', 'good');
  screenDirtyAll(); hudDirty = true;
  return true;
}

function pkBoothStop(a) {
  var C = pkCtl(a);
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
  if (C.fault) return pkBoothRefuse('Reset ' + a.name + ' first');
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
// Geometry and screen layout live in pkRideBoothBetter (part 11).

var PK_BOOTH = {};

function pkBuildBooth(a, p, th) {
  pkRideBoothBetter(a, p, th);
  return;
}

// ── Hook into the build ─────────────────────────────────────────────
// After every ride is built, add its booth beside it.

var _pkBuildAttractions = pkBuildAttractions;
pkBuildAttractions = function () {
  _pkBuildAttractions();
  PK.attractions.forEach(function (a) {
    if (a.plot && !a.booth && a.open) {
      var th = PK_THEME[a.id];
      if (th) pkBuildBooth(a, a.plot, th);
    }
  });
};

// the test API picks up the booth controls
var _pkTestApi = GAME.T;
GAME.T = function () {
  var o = _pkTestApi();
  o.pkBoothTest = pkBoothTest; o.pkBoothGates = pkBoothGates; o.pkBoothDispatch = pkBoothDispatch; o.pkBoothStop = pkBoothStop; o.pkBoothAuto = pkBoothAuto; o.pkBoothStatus = pkBoothStatus; o.pkCtl = pkCtl;
  return o;
};
