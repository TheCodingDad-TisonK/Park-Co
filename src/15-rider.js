//@ Park Co, part 15: riding - the player's own turn on the rides. Walk to a ride's queue entry,
// press E, and the ride carries you: the camera sits in the seat, the mouse looks around and the
// whole cycle runs. When the ride comes back you step off at the exit. On AUTO the ride drives
// itself, so the player can simply get on and go; off AUTO it waits for the desk like everyone else.
  // ── Riding ────────────────────────────────────────────────────────
  // PK.playerRide: { kind:'attr'|'coaster', a, seat, started, yaw0, pitch0, eye, face }
  // PK.playerWait: { a, coaster, x, z } - the player is at the gate, waiting for the ride to come round.
  var PK_RV = new THREE.Vector3(), PK_RQ = new THREE.Quaternion(), PK_RQ2 = new THREE.Quaternion(), PK_RE = new THREE.Euler(0, 0, 0, 'YXZ');

  function pkPlayerRides() { return !!PK.playerRide; }
  function pkPlayerFreeAttrSeat(a) {
    for (var i = 0; i < a.seats.length; i++) if (!a.seats[i].guest && !a.seats[i].player) return a.seats[i];
    return null;
  }
  function pkPlayerFreeCoasterSeat() {
    for (var i = 0; i < PK.seats.length; i++) if (!PK.seats[i].guest && !PK.seats[i].player) return PK.seats[i];
    return null;
  }
  function pkPlayerRideJoin(a) {
    if (PK.playerRide) return false;
    var coaster = !a;
    if (PK.playerWait && PK.playerWait.a === a && PK.playerWait.coaster === coaster) {
      PK.playerWait = null; sfx('click'); toast('You step out of the line', ''); return true;
    }
    PK.playerWait = null;
    if (coaster) {
      if (PK.closed) return pkRefuse('The park is closed');
      if (PK.ride.fault) return pkRefuse('The coaster is stopped');
      var moving = PK.ride.state === 'ready' || PK.ride.state === 'dispatch' || PK.ride.state === 'running' || PK.ride.state === 'arrive';
      var seat = pkPlayerFreeCoasterSeat();
      if (moving || !seat) {
        PK.playerWait = { a: null, coaster: true, x: player.x, z: player.z };
        toast(moving ? 'Waiting for the train to come back' : 'The train is full - waiting in the line', '');
        return true;
      }
      pkPlayerSeatCoaster(seat);
      return true;
    }
    if (!a.open) return pkRefuse(a.name + ' is closed for the day');
    if (a.ctl && a.ctl.fault) return pkRefuse('The ride is stopped');
    var busy = a.state === 'ready' || a.state === 'running' || a.state === 'unloading';
    var st = pkPlayerFreeAttrSeat(a);
    if (busy || !st) {
      PK.playerWait = { a: a, coaster: false, x: player.x, z: player.z };
      toast(busy ? 'Waiting for ' + a.name + ' to come round' : a.name + ' is full - waiting in the line', '');
      return true;
    }
    pkPlayerSeatAttr(a, st);
    return true;
  }
  // The player's seat is marked with .player so the queue never fills it. That is the whole
  // booking: no guest record, no invisible body - the camera is the rider.
  function pkPlayerSeatAttr(a, seat) {
    seat.player = true; a.riders++;
    PK.playerRide = { kind: 'attr', a: a, seat: seat, started: a.state === 'running', yaw0: player.yaw, pitch0: player.pitch, eye: 1.30, face: Math.PI + (seat.ry || 0) };
    if (a.state === 'idle') {
      var C = pkCtl(a);
      a.state = 'boarding'; a.t = 0; C.gates = true; C.barsWant = 0; a.boarding = 0;
    }
    sfx('unlock'); toast('Riding ' + a.name + ' - look around with the mouse', 'good');
    hudDirty = true; screenDirtyAll();
  }
  function pkPlayerSeatCoaster(seat) {
    seat.player = true; PK.ride.riders++;
    PK.playerRide = { kind: 'coaster', a: null, seat: seat, started: false, yaw0: player.yaw, pitch0: player.pitch, eye: 1.24, face: Math.PI };
    sfx('unlock'); toast('On the coaster - look around with the mouse', 'good');
    hudDirty = true; screenDirtyAll();
  }
  function pkPlayerRideStepOff() {
    var pr = PK.playerRide; if (!pr) return false;
    var ex, ez;
    if (pr.kind === 'coaster') {
      pr.seat.player = false;
      PK.ride.riders = Math.max(0, PK.ride.riders - 1);
      var w = pkSeatWorld(pr.seat);
      ex = clamp(w.x, 4.2, 9.8); ez = -3.2;
    } else {
      pr.seat.player = false;
      pr.a.riders = Math.max(0, pr.a.riders - 1);
      ex = pr.a.exit[0]; ez = pr.a.exit[1];
      if (pr.a.state === 'boarding' && !pr.a.queue.length) { pr.a.state = 'idle'; pr.a.t = 0; pkCtl(pr.a).gates = false; }
    }
    var fy = pkFloor(ex, ez);
    player.x = ex; player.z = ez; player.y = fy; player.vy = 0; player.grounded = true;
    player.pitch = 0;
    PK.playerRide = null;
    sfx('putdown'); toast('Back on your feet', '');
    hudDirty = true; screenDirtyAll();
    return true;
  }
  // E while seated: step off when the ride is stopped or at the platform, never mid-cycle.
  function pkPlayerRideExitTry() {
    var pr = PK.playerRide; if (!pr) return false;
    var ok;
    if (pr.kind === 'coaster') ok = PK.ride.state === 'idle' || PK.ride.state === 'unload' || PK.ride.state === 'loading' || PK.ride.state === 'fault';
    else ok = pr.a.state === 'idle' || pr.a.state === 'boarding' || pr.a.state === 'unloading';
    if (!ok) { toast('Wait until the ride stops', ''); sfx('bad'); return true; }
    return pkPlayerRideStepOff();
  }
  // one tick: the wait at the gate, then the watch for the end of the cycle
  function pkPlayerTick(dt) {
    var w = PK.playerWait;
    if (w) {
      if (Math.abs(player.x - w.x) > 4.5 || Math.abs(player.z - w.z) > 4.5) PK.playerWait = null;
      else if (w.coaster) {
        var seat = pkPlayerFreeCoasterSeat(), R = PK.ride;
        if (seat && !R.fault && R.state !== 'ready' && R.state !== 'dispatch' && R.state !== 'running' && R.state !== 'arrive') {
          PK.playerWait = null; pkPlayerSeatCoaster(seat);
        }
      } else {
        var a = w.a, st = pkPlayerFreeAttrSeat(a);
        if (st && !(a.ctl && a.ctl.fault) && a.state !== 'ready' && a.state !== 'running' && a.state !== 'unloading') {
          PK.playerWait = null; pkPlayerSeatAttr(a, st);
        }
      }
    }
    var pr = PK.playerRide; if (!pr) return;
    if (!pr.started) pr.started = pr.kind === 'coaster'
      ? (PK.ride.state === 'dispatch' || PK.ride.state === 'running' || PK.ride.state === 'arrive')
      : (pr.a.state === 'running');
    var done = pr.kind === 'coaster'
      ? (pr.started && (PK.ride.state === 'unload' || PK.ride.state === 'idle'))
      : (pr.started && (pr.a.state === 'unloading' || pr.a.state === 'idle'));
    if (done) pkPlayerRideStepOff();
  }
  // the camera: in the seat, carried by the car or the horse, the mouse looking around it
  function pkPlayerRideOverride(dt) {
    var pr = PK.playerRide; if (!pr) return false;
    var q = PK_RQ, w = PK_RV;
    if (pr.kind === 'coaster') {
      var car = PK.cars[pr.seat.car];
      car.updateMatrixWorld(true);
      w.set(pr.seat.local.x, pr.seat.local.y, pr.seat.local.z);
      car.localToWorld(w);
      car.getWorldQuaternion(q);
    } else {
      var par = pr.seat.par;
      par.updateMatrixWorld(true);
      w.set(pr.seat.x || 0, pr.seat.y || 0, pr.seat.z || 0);
      par.localToWorld(w);
      par.getWorldQuaternion(q);
    }
    var up = new THREE.Vector3(0, pr.eye, 0.06).applyQuaternion(q);
    camera.position.set(w.x + up.x, w.y + up.y, w.z + up.z);
    var dy = yawWrap(player.yaw - pr.yaw0), dp = clamp(player.pitch - pr.pitch0, -1.25, 1.25);
    PK_RQ2.setFromEuler(PK_RE.set(dp, dy + pr.face, 0));
    camera.quaternion.copy(q).multiply(PK_RQ2);
    return true;
  }
  // the lane fences are blockers only while the ride is open: no invisible walls round a shut ride
  function pkLaneCollides(x, z) {
    for (var i = 0; i < PK.lanes.length; i++) {
      var L = PK.lanes[i];
      if (!L.a.open) continue;
      if (x < L.x0 - 0.3 || x > L.x1 + 0.3 || z < L.zA - 0.3 || z > L.zB + 0.3) continue;
      for (var k = 0; k < L.segs.length; k++) {
        var S = L.segs[k];
        if (x > S.x0 - 0.12 && x < S.x1 + 0.12 && z > S.z0 - 0.12 && z < S.z1 + 0.12) return true;
      }
      // a closed boarding gate carries across row 0
      if (!(L.a.ctl && L.a.ctl.gates) && x > L.gx - 0.14 && x < L.gx + 0.14 && z > L.gz0 && z < L.gz1) return true;
    }
    return false;
  }
