//@ Park Co, part 05: the rides - the attraction system and the seven rides that stand either side of the midway
  // ── One draw for a rigid shell ───────────────────────────────────
  // A ride car is built from twenty-odd little boxes, rings and pads, and every one of them is a draw call while the car
  // is in view; a train of six cars is a hundred and twenty. The car moves as one rigid body, so its shell can be one
  // mesh per material: the parts are merged in the group's own space and the group still turns, tilts and travels as
  // before. Only parts that the ride animates *inside* the car (the lap bar) are kept out, by name.
  function pkMergeShell(g, keep) {
    var byMat = {};
    g.children.slice().forEach(function (c) {
      if (!c.isMesh || c.isInstancedMesh || !c.visible || !c.geometry || !c.material || Array.isArray(c.material)) return;
      if (keep && keep.indexOf(c) >= 0) return;
      if (c.userData.it || c.userData.noBake || c.userData.dynamic) return;
      var m = c.material;
      if (m.transparent || (m.userData && (m.userData.noBake || m.userData.glow))) return;
      (byMat[m.uuid] = byMat[m.uuid] || { mat: m, items: [] }).items.push(c);
    });
    Object.keys(byMat).forEach(function (k) {
      var grp = byMat[k];
      if (grp.items.length < 2) return;
      var pos = [], nor = [], uv = [], hasUv = true, _m = new THREE.Matrix4();
      grp.items.forEach(function (o) {
        var geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        o.updateMatrix();
        geo.applyMatrix4(o.matrix);
        var pa = geo.attributes.position.array, na = geo.attributes.normal ? geo.attributes.normal.array : null, ua = geo.attributes.uv ? geo.attributes.uv.array : null;
        for (var i = 0; i < pa.length; i++) pos.push(pa[i]);
        if (na) for (var j = 0; j < na.length; j++) nor.push(na[j]); else for (var j2 = 0; j2 < pa.length; j2++) nor.push(0);
        if (ua) for (var u = 0; u < ua.length; u++) uv.push(ua[u]); else hasUv = false;
        geo.dispose();
      });
      var merged = new THREE.BufferGeometry();
      merged.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      merged.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      if (hasUv && uv.length === pos.length / 3 * 2) merged.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      merged.computeBoundingSphere();
      var mesh = new THREE.Mesh(merged, grp.mat);
      mesh.castShadow = grp.items[0].castShadow; mesh.receiveShadow = grp.items[0].receiveShadow;
      g.add(mesh);
      grp.items.forEach(function (o) { g.remove(o); });
    });
  }
  // ── The attraction system ────────────────────────────────────────
  // Every ride is the same shape: a queue lane, a set of seats parented to whatever moves, and five states.
  // idle -> boarding -> ready -> running -> unloading -> idle. A guest is attached to a seat for the ride and let go after it.
  // Each ride has its own operator booth (part 09). On AUTO (the default, or with an operator hired) the ride works its own
  // gates, restraints and start; off AUTO it waits for the desk. The coaster keeps its own state machine in part 03.
  // The queue lane folds into switchbacks: rows of at most six slots, 1.05 m apart, an odd number of rows 1.1 m apart so the
  // entry is at the outer end. Slot 0 is at the boarding gate; row 0 runs out from the gate along qdx, row 1 back, row 2 out
  // again, the rows stacked toward the plot's qside (+z unless the plot says -1) and centred on the old single lane's line
  // (z0 is row 0), so the block keeps within a hand's width of where the straight lane stood. A line longer than the lane
  // carries on straight out of the entry. The guests walk the rows slot by slot, never across a fence.
  function pkAttrLane(a) {
    if (a.laneGeo) return a.laneGeo;
    var N = Math.max(4, a.cap || 8), rows = Math.ceil(N / 6);
    if (rows % 2 === 0) rows++;
    var R = Math.ceil(N / rows);
    var sz = (a.plot && a.plot.qside) || 1;
    a.laneGeo = { N: R * rows, R: R, rows: rows, dir: a.qdx >= 0 ? 1 : -1, sz: sz, step: 1.05, pitch: 1.1, z0: a.qz - sz * 1.1 * (rows - 1) / 2 };
    return a.laneGeo;
  }
  function pkAttrSlot(a, i) {
    var L = pkAttrLane(a);
    if (i >= L.N) { var e = pkAttrSlot(a, L.N - 1); return { x: e.x + L.dir * L.step * (i - L.N + 1), z: e.z }; }
    var r = Math.floor(i / L.R), k = i % L.R, kk = r % 2 ? L.R - 1 - k : k;
    return { x: a.qx + L.dir * L.step * kk, z: L.z0 + L.sz * L.pitch * r };
  }
  // the walk down the lane from slot 'from' (exclusive) to slot 'to', one slot at a time
  function pkAttrLanePath(a, from, to) {
    var p = [];
    for (var i = from - 1; i >= to; i--) p.push(pkAttrSlot(a, i));
    return p;
  }
  // a guest's way to slot i: over the park to the lane's entry (or the end of the line, if it runs out of the lane), then
  // along the rows; a guest already in the lane just shuffles up it
  function pkAttrWalkTo(a, gu, i, fromSlot) {
    if (a.walkTo) return a.walkTo(gu, i, fromSlot);   // a ride with a line of its own walks its guests along it
    if (fromSlot !== undefined && fromSlot > i) return pkAttrLanePath(a, fromSlot, i);
    var E = Math.max(i, pkAttrLane(a).N);
    return route({ x: gu.rec.x, z: gu.rec.z }, pkAttrSlot(a, E)).concat(pkAttrLanePath(a, E, i));
  }
  // a seat's y is where the rider's feet line is: the sit pose puts the hips 0.86 above it, so a seat surface at s wants s - 0.76
  function pkAttrSeatWorld(seat) {
    seat.par.updateMatrixWorld(true);
    return seat.par.localToWorld(new THREE.Vector3(seat.x || 0, seat.y || 0, seat.z || 0));
  }
  // sit them down: the guest group leaves the walk and becomes a child of the moving seat
  function pkAttrSit(a, gu, seat) {
    if (!seat) return false;
    seat.guest = gu; gu.seat = seat; gu.state = 'seated';
    seat.par.add(gu.g);
    gu.g.position.set(seat.x, seat.y, seat.z);
    gu.g.rotation.set(0, seat.ry || 0, 0);
    gu.g.userData.baseY = seat.y;
    gu.pose = seat.pose || 'sit';
    var blob = pkBlobOf(gu.g); if (blob) blob.visible = false;
    a.riders++;
    if (a.state === 'boarding') a.boarding = pkAttrWalkers(a);
    return true;
  }
  // applause from a seat: the hands up in front, meeting and parting (drawn over the sit pose, so it runs after animateHuman)
  function pkGuestClap(g) {
    var u = g.userData; if (!u.arms) return;
    var la = u.arms[0], ra = u.arms[1], k = Math.max(0, Math.sin(worldTime * 13 + (u.phase || 0) * 7));
    la.rotation.x = ra.rotation.x = -1.2; la.userData.elbow.rotation.x = ra.userData.elbow.rotation.x = -1.15;
    la.rotation.z = 0.3 + k * 0.24; ra.rotation.z = -0.3 - k * 0.24;
  }
  function pkAttrSeat(a, gu, si) {
    var seat = a.seats[si]; if (!seat) return false;
    return pkAttrSit(a, gu, seat);
  }
  function pkAttrUnseatAll(a) {
    var n = 0;
    for (var i = 0; i < a.seats.length; i++) {
      var seat = a.seats[i]; if (!seat.guest) continue;
      if (a.rowWait && (seat.guest.state === 'walkRow' || seat.guest.state === 'rowWait')) continue;   // still on the platform, waiting to get on
      var gu = seat.guest; seat.guest = null; gu.seat = null; gu.clap = false;
      if (a.walkOut) {
        // a show lets out: everyone stands up where they sat and walks out the way they came in (a.walkOut gives the path)
        var sp = pkAttrSeatWorld(seat), sy = pkFloor(sp.x, sp.z);
        scene.add(gu.g); gu.g.position.set(sp.x, sy, sp.z); gu.g.rotation.set(0, 0, 0); gu.g.userData.baseY = sy;
        var bl = pkBlobOf(gu.g); if (bl) bl.visible = true;
        gu.rec.x = sp.x; gu.rec.z = sp.z; gu.rec.path = a.walkOut({ x: sp.x, z: sp.z });
        gu.state = 'off'; gu.rides = (gu.rides || 0) + 1; gu.mood = 'happy';
        n++; continue;
      }
      var ex = a.exit[0] + randf(-0.5, 0.5), ez = a.exit[1] + randf(-0.4, 0.4), fy = pkFloor(ex, ez);
      scene.add(gu.g);
      gu.g.position.set(ex, fy, ez);
      gu.g.rotation.set(0, 0, 0);
      gu.g.userData.baseY = fy;
      var blob = pkBlobOf(gu.g); if (blob) blob.visible = true;
      gu.rec.x = ex; gu.rec.z = ez; gu.rec.path = [];
      gu.state = 'off'; gu.rides = (gu.rides || 0) + 1;
      n++;
    }
    a.riders = 0;
    if (n) { PK.today.rides += n; pkXp(1); }
    return n;
  }
  function pkAttrReslot(a) {
    for (var i = 0; i < a.queue.length; i++) {
      var gu = a.queue[i];
      if (gu.slot === i && gu.state !== 'walkAttr') continue;
      var was = gu.slot;
      gu.slot = i;
      if (gu.state === 'walkAttr' || gu.state === 'qwait' || gu.state === 'qmove') {
        gu.rec.path = pkAttrWalkTo(a, gu, i, gu.state === 'walkAttr' ? undefined : was);
        gu.state = gu.rec.path.length ? (gu.state === 'walkAttr' ? 'walkAttr' : 'qmove') : 'qwait';
      }
    }
  }
  function pkAttrFill(a) {
    var n = 0;
    // the station gate is shut: nobody walks through it (a ride with a.rowWait lets them on up to its platform to wait at
    // their row: they step into their seats when the station gates open)
    if (a.stationGates === false && !a.rowWait) return 0;
    while (a.queue.length && n < a.cap) {
      var gu = a.queue[0];
      if (gu.state !== 'qwait' && gu.state !== 'qmove') break;
      var si = a.pickSeat ? a.pickSeat(gu) : -1;   // a ride with a choice (Water or Vuur) picks the seat itself
      if (si < 0) for (var i = 0; i < a.seats.length; i++) if (!a.seats[i].guest && !a.seats[i].player) { si = i; break; }
      if (si < 0) break;
      var seat = a.seats[si];
      a.queue.shift();
      gu.seat = seat; seat.guest = gu; gu.slot = -1;
      if (a.rowWait) {   // up to the platform, to wait at this seat's row (the ride's own tick seats them)
        gu.state = 'walkRow';
        gu.rec.path = a.seatPath({ x: gu.rec.x, z: gu.rec.z }, a.rowSpot(seat));
        if (!gu.rec.path.length) gu.state = 'rowWait';
        n++; continue;
      }
      gu.state = 'walkSeat';
      var w = pkAttrSeatWorld(seat);
      gu.rec.path = a.seatPath ? a.seatPath({ x: gu.rec.x, z: gu.rec.z }, w) : route({ x: gu.rec.x, z: gu.rec.z }, { x: w.x, z: w.z });   // a ride with stairs gives its own way up
      if (!gu.rec.path.length) pkAttrSit(a, gu, seat);   // already at the seat
      n++;
    }
    if (n) { pkAttrReslot(a); screenDirtyAll(); }
    return n;
  }
  // a seat nobody has taken or is walking to
  function pkAttrHasSeat(a) { for (var i = 0; i < a.seats.length; i++) if (!a.seats[i].guest && !a.seats[i].player) return true; return false; }
  // guests still walking from the gate to their seat: the gates stay open and the ride waits
  function pkAttrWalkers(a) {
    var n = 0;
    // (guests waiting at their rows behind shut station gates are not boarding yet: they do not hold the ride)
    var rows = a.stationGates !== false;
    for (var i = 0; i < a.seats.length; i++) { var s = a.seats[i], st = s.guest && s.guest.state; if (st === 'walkSeat' || (rows && (st === 'walkRow' || st === 'rowWait'))) n++; }
    return n;
  }
  // the queue as a guest sees it: guests standing on a lane slot, not the ones still walking over from the gate
  function pkAttrWaiting(a) {
    var n = 0;
    for (var i = 0; i < a.queue.length; i++) {
      var st = a.queue[i].state;
      if (st === 'qwait' || st === 'qmove') n++;
    }
    return n;
  }
  // raise the bars for boarding or getting off. A ride whose 'bars' are a show curtain (a.curtain: the Arena) is left alone:
  // opening the gates or ending the show must not open the curtain, only the show and the STAGE desk move it
  function pkAttrBarsUp(a, C) { if (!a.curtain) (C || pkCtl(a)).barsWant = 0; }
  function pkAttrBegin(a) {
    if (a.state !== 'idle' && a.state !== 'unloading') return;
    var C = pkCtl(a);
    if (C.maint || !C.key) return;       // locked out at the cabinet, or the operator key off: nobody boards
    if (a.stationGates === false && !a.rowWait) return;   // the station gate is shut: nobody walks through it
    a.state = 'boarding'; a.t = 0; C.gates = true; pkAttrBarsUp(a, C);
    pkAttrReslot(a);
    a.boarding = 0;
    pkAttrFill(a);
    if (!a.queue.length && !a.riders && !pkAttrWalkers(a)) { a.state = 'idle'; if (!a.rowWait) C.gates = false; }
  }
  function pkAttrStart(a) {
    var C = pkCtl(a);
    // the line holds the ride only while it can still board: gates shut or seats full, whoever is left waits for the next cycle
    if (C.fault || C.maint || !C.key || (a.queue.length && C.gates && !a.rowWait && pkAttrHasSeat(a)) || a.riders <= 0 || pkAttrWalkers(a)) return false;
    a.state = 'running'; a.t = 0; C.barsWant = 1;
    if (!a.rowWait) C.gates = false;   // a queue gate of its own (a.rowWait) stays as the operator left it
    if (a.holdRows) a.holdRows(a);     // and whoever waits at a row keeps their place there for the next train
    sfx('bell');
    if (a.start) a.start(a);
    screenDirtyAll(); hudDirty = true;
    return true;
  }
  // the ride has stopped. On AUTO it lifts the bars, lets the riders off and opens up; on MANUAL it waits with the bars down
  // and the gates shut until the operator raises the bars (pkAttrLetOff), and the gates stay as the operator leaves them
  function pkAttrEnd(a) {
    var C = pkCtl(a);
    a.state = 'unloading'; a.t = 0;
    a.cycles++;
    sfx('chime');
    if (a.curtain) { if (pkCtlAuto(a)) C.gates = true; pkAttrLetOff(a); }   // the house empties; the curtain stays as the show left it
    else if (pkCtlAuto(a)) { C.barsWant = 0; C.gates = true; pkAttrLetOff(a); }
    else { a.awaitBars = a.riders > 0; if (!a.awaitBars) C.barsWant = 0; }
    screenDirtyAll(); hudDirty = true;
  }
  function pkAttrLetOff(a) {
    a.awaitBars = false; a.t = 0;
    var n = pkAttrUnseatAll(a);
    if (n) logEvent(a.name + ': ' + n + ' rode', '');
    return n;
  }
  function pkAttrTick(a, dt) {
    if (a.skyline && typeof pkSkylineTick === 'function' && pkSkylineTick(a, dt)) return;   // the Skyline Shuttle runs a three station timetable of its own (part 52)
    if (!a.open) return;
    var C = pkCtl(a), auto = pkCtlAuto(a);   // AUTO is the desk's switch alone: on MANUAL nothing moves until someone works the desk
    // the gates and the restraints ease to where they were told to be, and the desk's lights follow
    C.gateT += ((C.gates ? 1 : 0) - C.gateT) * Math.min(1, dt * 3.5);
    C.bars += (C.barsWant - C.bars) * Math.min(1, dt * 3);
    for (var gi = 0; gi < C.gateObjs.length; gi++) C.gateObjs[gi](C.gateT);
    var sgOpen = (a.stationGates !== false) && a.state !== 'running' && a.state !== 'dispatch';
    C.sgT = (C.sgT || 0) + ((sgOpen ? 1 : 0) - (C.sgT || 0)) * Math.min(1, dt * 3.5);
    for (var si = 0; si < (C.stationGateObjs || []).length; si++) C.stationGateObjs[si](C.sgT);
    if (a.stationGate) a.stationGate.rotation.y = C.sgT * 1.5;
    for (var bi = 0; bi < C.barObjs.length; bi++) C.barObjs[bi](C.bars);
    pkCtlLamps(a);
    // the drive: up to speed while running, and wound down over the last few seconds so it stops before anyone gets off
    var want = (a.state === 'running' && !C.fault && a.t < a.run - 3) ? 1 : 0;
    C.spd += (want - C.spd) * Math.min(1, dt * (want ? 0.8 : 1.4));
    if (C.fault) { C.spd = 0; return; } // E-stop freezes the attraction exactly where it is.
    a.t += dt;
    if (a.tickRun) a.tickRun(a, dt, C.spd);
    if (a.state === 'idle') {
      if (auto && !PK.closed && a.queue.length) pkAttrBegin(a);
    } else if (a.state === 'boarding') {
      if (C.gates) pkAttrFill(a);
      a.boarding = pkAttrWalkers(a);
      if (auto && !PK.closed) {
        // close up when the ride is full, or when boarding time is up and the line has emptied into the seats, or (a line
        // that is not moving) a few seconds past it; then go once the bars are down and nobody is still walking to a seat.
        // Whoever is left in the line waits for the next cycle: a line longer than the ride never holds it at the gate.
        // (a show's 'bars' are its curtain, which stays closed through boarding: there it is the gates still open that says
        // the house has not been closed up yet)
        var full = !pkAttrHasSeat(a), walkers = a.boarding, notClosed = a.curtain ? C.gates : C.barsWant < 1;
        if (a.riders > 0 && !walkers && notClosed && (full || (a.t >= (a.boardMin || a.board - 1.4) && !a.queue.length) || a.t >= a.board + 6)) {   // a.boardMin: a ride with a long boarding can go sooner once its line has emptied
          if (!a.rowWait) C.gates = false;
          C.barsWant = 1; a.t = Math.max(a.t, a.board - 1.4);
        }
        if (a.t >= a.board && C.barsWant >= 1 && (!C.gates || a.rowWait) && a.riders > 0 && !walkers) pkAttrStart(a);
      }
    } else if (a.state === 'ready') {
        if (auto && !PK.closed) pkAttrStart(a);
    } else if (a.state === 'running') {
      if (a.t >= a.run) pkAttrEnd(a);
    } else if (a.state === 'unloading') {
      if (a.awaitBars) {                          // stopped with riders aboard: they get off when the bars come up
        if (auto || PK.closed) pkAttrBarsUp(a, C);   // (at closing nobody is left sitting in a stopped ride)
        if (C.barsWant < 0.5) pkAttrLetOff(a); else return;
      }
      if (a.t >= a.unload) {
        a.state = 'idle'; a.t = 0; if (auto && !a.rowWait) C.gates = false;
        if (!PK.closed && (auto || a.manualStart) && a.queue.length) { a.manualStart = false; pkAttrBegin(a); }
        screenDirtyAll();
      }
    }
  }
  // ── Who picks which ride ─────────────────────────────────────────
  function pkAttrPick(gu) {
    // the featured ride: guests make straight for it, so its queue fills first (part 25's Marketing app)
    if (S.featured) {
      var f = PK.attrById[S.featured];
      if (f && f.open && f.ctl && !f.ctl.fault && !f.ctl.maint && f.queue.length < f.seats.length * 3 && !(gu.gaveUp && gu.gaveUp[f.id]) && Math.random() < 0.65) return pkAttrQueueJoin(gu, f);
    }
    var open = [];
    // a ride with its operator key OFF still takes a line (the guests wait for it to open), but one that is running is
    // preferred; a ride in a fault or in MAINT takes nobody, and a guest does not go back to a line they gave up on
    for (var i = 0; i < PK.attractions.length; i++) { var at = PK.attractions[i]; if (at.open && at.ctl && !at.ctl.fault && !at.ctl.maint && at.queue.length < at.seats.length * 2 && !(gu.gaveUp && gu.gaveUp[at.id])) open.push(at); }
    if (!open.length) return false;
    // the shortest line wins, with a little spread so the crowd is not one queue
    var cost = function (a) { return a.queue.length + (a.ctl.key ? 0 : 6); };
    open.sort(function (a, b) { return cost(a) - cost(b); });
    var pick = open[Math.floor(randf(0, Math.min(3, open.length)))];
    return pkAttrQueueJoin(gu, pick);
  }
  function pkGuestPickRide(gu) {
    if (S.featured === 'coaster') {   // the featured coaster: guests make for its queue
      var fOk = pkCoasterOpen() && PK.ride.state !== 'fault' && !(gu.gaveUp && gu.gaveUp.coaster);
      if (fOk && Math.random() < 0.65 && pkQueueJoin(gu)) return;
    }
    var coasterOk = pkCoasterOpen() && PK.ride.state !== 'fault' && !(gu.gaveUp && gu.gaveUp.coaster);
    var anyOpen = false;
    for (var i = 0; i < PK.attractions.length; i++) if (PK.attractions[i].open) { anyOpen = true; break; }
    if (coasterOk && (!anyOpen || randf(0, 1) < (S.coasterKey ? 0.45 : 0.15))) {
      if (pkQueueJoin(gu)) return;      // the coaster line is never longer than its lane
      // the line is full: fall through to another ride, or wander the midway
    }
    if (!pkAttrPick(gu)) pkGo(gu, randf(-6, 6), randf(8, 22), 'off');
  }
  // ── Opening and counting ─────────────────────────────────────────
  function pkOpenRide(id) {
    if (id === 'coaster') return true;
    var a = PK.attrById[id]; if (!a) return false;
    if (a.open) return true;
    a.open = true;
    S.rides[id] = true;
    if (a.g) a.g.visible = true;
    if (a.hoard) a.hoard.visible = false;
    if (a.dress) a.dress.visible = true;
    // the world is baked into merged meshes, so a plot that changes has to be unbaked, changed and baked again
    if (typeof baked !== 'undefined' && baked.meshes && baked.meshes.length) {
      unbakeStatic();
      if (a.g) a.g.visible = true;
      if (a.hoard) a.hoard.visible = false;
      if (a.dress) a.dress.visible = true;
      bakeStatic();
    }
    sfx('unlock'); toast(a.name + ' opens', 'good'); logEvent(a.name + ' opens', 'good');
    pkRidePowerApply(id);
    screenDirtyAll(); hudDirty = true;
    return true;
  }
  function pkRideSavedOpen(id) { return !S.rides || S.rides[id] !== false; }
  function pkCoasterOpen() { return pkRideSavedOpen('coaster'); }
  function pkOpenCount() { var n = pkCoasterOpen() ? 1 : 0; for (var i = 0; i < PK.attractions.length; i++) if (PK.attractions[i].open) n++; return n; }
  // Cut a ride's breaker from the park board: guests stop joining that queue until it is
  // switched back up. A ride with anyone aboard or waiting will not shut down - the breaker
  // drops straight back rather than stranding a train full of people.
  function pkSetRideOpen(id, on) {
    on = !!on;
    if (id === 'coaster') {
      if (on === pkCoasterOpen()) return true;
      var R = PK.ride;
      if (!on && (R.riders || PK.queue.length || (R.state !== 'idle' && R.state !== 'fault'))) {
        sfx('bad'); toast('The coaster is still working - clear it first', 'bad'); return false;
      }
      if (!S.rides) S.rides = {};
      S.rides.coaster = on;
      pkRidePowerApply('coaster');
      if (on) { sfx('unlock'); toast('The coaster open', 'good'); logEvent('The coaster open', 'good'); }
      else { sfx('click'); toast('The coaster shut for the day', ''); logEvent('The coaster shut down', ''); }
      screenDirtyAll(); hudDirty = true;
      return true;
    }
    var a = PK.attrById[id]; if (!a) return false;
    if (on === !!a.open) return true;
    if (!on && (a.state !== 'idle' || a.riders || a.queue.length)) {
      sfx('bad'); toast(a.name + ' is still working - clear it first', 'bad'); return false;
    }
    a.open = on; if (S.rides) S.rides[id] = on;
    pkRidePowerApply(id);
    if (on) { sfx('unlock'); toast(a.name + ' open', 'good'); logEvent(a.name + ' open', 'good'); }
    else { sfx('click'); toast(a.name + ' shut for the day', ''); logEvent(a.name + ' shut down', ''); }
    screenDirtyAll(); hudDirty = true;
    return true;
  }
  function pkRideList() {
    var names = pkCoasterOpen() ? ['coaster'] : [];
    for (var i = 0; i < PK.attractions.length; i++) if (PK.attractions[i].open) names.push(PK.attractions[i].id);
    return names.join(', ');
  }
  // ── The hoarding a closed plot wears ─────────────────────────────
  function pkHoard(p) {
    var g = new THREE.Group(); g.position.set(p.x, 0, p.z); scene.add(g);
    var h = 2.4, r = p.r + 1.3;
    box(r * 2, h, 0.16, MAT.wood, 0, h / 2, -r, g);
    box(r * 2, h, 0.16, MAT.wood, 0, h / 2, r, g);
    box(0.16, h, r * 2, MAT.wood, -r, h / 2, 0, g);
    box(0.16, h, r * 2, MAT.wood, r, h / 2, 0, g);
    var side = p.x < 0 ? 1 : -1;
    sign([p.name.toUpperCase(), 'OPENS AT LEVEL ' + p.level], Math.min(r * 1.5, 5.2), 1.0, side * (r + 0.02), 1.55, 0,
      side > 0 ? Math.PI / 2 : -Math.PI / 2, { bg: '#1b232c', fg: '#f5b53d' }, g);
    solid(p.x - r, p.x + r, p.z - r, p.z - r + 0.4, 0, h);
    solid(p.x - r, p.x + r, p.z + r - 0.4, p.z + r, 0, h);
    solid(p.x - r, p.x - r + 0.4, p.z - r, p.z + r, 0, h);
    solid(p.x + r - 0.4, p.x + r, p.z - r, p.z + r, 0, h);
    return g;
  }
  // ── The build: every plot, open or boarded up ────────────────────
  function pkBuildAttractions() {
    pkMats();
    PK.xp = S.xp || 0;
    var makers = { carousel: pkBuildCarousel, teacups: pkBuildTeacups, ferris: pkBuildFerris, dodgems: pkBuildDodgems, droptower: pkBuildDropTower, flume: pkBuildFlume, danse: pkBuildDanse, droom: pkBuildDroom };
    PK_PLOTS.forEach(function (p) {
      var mk = makers[p.id]; if (!mk) return;
      var a = mk(p, true);
      a.level = p.level;
      a.plot = p;
      a.open = pkRideSavedOpen(p.id);   // the breaker remembers where it was left, but the ride still stands
      if (S.rides) S.rides[p.id] = a.open;
      pkCtl(a); pkCtlLoad(a);
    });
  }
  function pkAttr(o) {
    var side = o.x < 0 ? 1 : -1;   // the way back to the midway: the queue lane runs that way from its head at q
    var a = {
      id: o.id, name: o.name, kind: o.id, x: o.x, z: o.z, side: side,
      qx: o.qx, qz: o.qz, qdx: o.qdx === undefined ? side : o.qdx, qdz: o.qdz === undefined ? 0 : o.qdz,
      g: o.g, seats: o.seats || [], cap: (o.seats || []).length || o.cap || 8,
      board: o.board || 9, run: o.run || 16, unload: o.unload || 6,
      exit: o.exit || [o.qx + side * 1.0, o.qz - 2.3],
      state: 'idle', t: 0, riders: 0, queue: [], open: false,
      tickRun: o.tickRun || null, start: o.start || null, cycles: 0, hoard: null,
      extra: o.extra || {}
    };
    PK.attractions.push(a); PK.attrById[a.id] = a;
    if (o.g) o.g.userData.attr = a;
    pkCtl(a);
    return a;
  }
  // a part of a ride that moves on its own: drawn as a few merged meshes, never baked into the static world
  function pkMover(parent, x, y, z) { var m = new THREE.Group(); m.position.set(x || 0, y || 0, z || 0); m.userData.dynamic = true; m.userData.keep = true; parent.add(m); return m; }
  function pkPrism(r, h, n, mat, x, y, z, parent, rTop, open) {
    var m = new THREE.Mesh(new THREE.CylinderGeometry(rTop === undefined ? r : rTop, r, h, n, 1, !!open), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parentOf(parent).add(m); return m;
  }
  function pkRing(r, tube, mat, x, y, z, parent, seg, flat) {
    var m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, seg || 48), mat); m.position.set(x, y, z); if (flat !== false) m.rotation.x = Math.PI / 2; m.castShadow = true; parentOf(parent).add(m); return m;
  }
  var PK_HORSE_GEO = null;
  // a carved carousel horse in profile: prancing, one foreleg raised, tail out. Pulled out 0.22 m with rounded edges.
  function pkHorseGeo() {
    if (PK_HORSE_GEO) return PK_HORSE_GEO;
    var pts = [[-0.62, 0.88], [-0.40, 0.96], [0.05, 0.93], [0.28, 0.99], [0.45, 1.20], [0.56, 1.36], [0.60, 1.47], [0.66, 1.40], [0.72, 1.36], [0.93, 1.12], [0.97, 1.03], [0.88, 0.98],
      [0.64, 1.04], [0.50, 0.84], [0.56, 0.66], [0.76, 0.58], [0.78, 0.50], [0.50, 0.53], [0.40, 0.70], [0.36, 0.44], [0.38, 0.10], [0.27, 0.07], [0.26, 0.45], [0.18, 0.62],
      [-0.30, 0.62], [-0.36, 0.46], [-0.30, 0.26], [-0.42, 0.07], [-0.52, 0.07], [-0.45, 0.30], [-0.55, 0.53], [-0.62, 0.64], [-0.72, 0.66], [-0.88, 0.48], [-0.84, 0.72], [-0.68, 0.86]];
    var g = pkExtrudeGeo(pts, 0.2, 0.06); g.rotateY(-Math.PI / 2); g.userData.shared = true;
    return (PK_HORSE_GEO = g);
  }
  // ── The carousel ─────────────────────────────────────────────────
  function pkBuildCarousel(p, open) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(p.x, 0, p.z); scene.add(g);
    pkLathe([[0, 0], [8.0, 0], [8.0, 0.17], [7.65, 0.17], [7.65, 0.34], [7.35, 0.34], [7.35, 0.5], [0, 0.5]], M.stone, 0, 0, 0, g, 64);
    var spin = pkMover(g, 0, 0.5, 0);
    pkPrism(7.1, 0.16, 48, MAT.wood, 0, 0.08, 0, spin);
    pkRing(7.1, 0.06, M.gold, 0, 0.16, 0, spin, 64);
    // the mirrored drum in the middle, the sunburst ceiling, the rounding boards and their bulbs, the scalloped valance, the roof
    pkPrism(1.2, 3.9, 8, M.cream, 0, 2.11, 0, spin);
    for (var f = 0; f < 8; f++) {
      var th = (f + 0.5) * Math.PI / 4, rr = 1.2 * Math.cos(Math.PI / 8) + 0.012;
      var mir = box(0.66, 2.5, 0.02, M.mirror, Math.sin(th) * rr, 2.0, Math.cos(th) * rr, spin); mir.rotation.y = th;
      var fr = box(0.76, 2.62, 0.015, M.gold, Math.sin(th) * (rr - 0.004), 2.0, Math.cos(th) * (rr - 0.004), spin); fr.rotation.y = th;
    }
    pkPrism(1.32, 0.2, 8, M.gold, 0, 0.26, 0, spin); pkPrism(1.32, 0.2, 8, M.gold, 0, 3.98, 0, spin);
    var ceilMat = std({ map: pkTexSunburst('#c8342a', '#f3ead6'), roughness: 0.8, emissive: 0x2a1208, emissiveIntensity: 0.35 });
    var ceil = new THREE.Mesh(new THREE.CircleGeometry(7.45, 48), ceilMat); ceil.rotation.x = Math.PI / 2; ceil.position.y = 4.1; spin.add(ceil);
    var boardMat = std({ map: pkTexRounding('#f3ead6', '#c8342a'), roughness: 0.7, emissive: 0x1e0c05, emissiveIntensity: 0.3 });
    pkPrism(7.5, 0.8, 48, boardMat, 0, 4.5, 0, spin, 7.5, true);
    pkRing(7.52, 0.05, M.gold, 0, 4.1, 0, spin, 64); pkRing(7.52, 0.05, M.gold, 0, 4.9, 0, spin, 64);
    var bulbs = [];
    for (var b = 0; b < 72; b++) { var ba = b / 72 * Math.PI * 2; bulbs.push([Math.cos(ba) * 7.56, 4.32, Math.sin(ba) * 7.56]); bulbs.push([Math.cos(ba + 0.04) * 7.56, 4.7, Math.sin(ba + 0.04) * 7.56]); }
    pkBulbs(bulbs, M.bulb, 0.045, spin);
    for (var sc = 0; sc < 48; sc++) {
      var sa = (sc + 0.5) / 48 * Math.PI * 2;
      var sv = new THREE.Mesh(cachedGeo('pkscalC', function () { return new THREE.CircleGeometry(0.48, 12, Math.PI, Math.PI); }), sc % 2 ? MAT.red : M.gold);
      sv.position.set(Math.cos(sa) * 7.53, 4.1, Math.sin(sa) * 7.53); sv.rotation.y = Math.PI / 2 - sa; spin.add(sv);
    }
    var roofTex = pkTexStripes('#c8342a', '#f3ead6', 8); roofTex.repeat.set(3, 1);
    var roof = new THREE.Mesh(new THREE.ConeGeometry(7.75, 2.0, 48, 1), std({ map: roofTex, roughness: 0.75 })); roof.position.y = 5.9; roof.castShadow = true; spin.add(roof);
    pkPrism(0.9, 0.7, 12, M.cream, 0, 7.1, 0, spin);
    var cupola = new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.9, 12), MAT.red); cupola.position.y = 7.9; spin.add(cupola);
    pkLathe([[0, 0], [0.12, 0], [0.06, 0.2], [0.14, 0.38], [0.04, 0.6], [0, 0.66]], M.gold, 0, 8.3, 0, spin, 12);
    pkRod(0, 8.9, 0, 0, 9.9, 0, 0.025, M.iron, spin, 6);
    var flag = box(0.7, 0.42, 0.02, MAT.red, 0.36, 9.65, 0, spin);
    // the horses: an outer ring that carries riders and an inner ring that dresses the deck. Each rises and falls on its pole.
    var coats = [0xf3eee4, 0x2a2420, 0x8a5a3a, 0xc9c4bc, 0xf3eee4, 0x6b4a2a, 0xe8d8b8, 0x3a3a40];
    var saddles = [0xc8342a, 0x2f6fb3, 0x2f9e44, 0xd4a73a, 0x8a3fb3, 0xc8342a, 0x2f6fb3, 0xd4a73a];
    var seats = [], horses = [];
    function horse(ang, r, k, rider) {
      var hg = pkMover(spin, Math.cos(ang) * r, 0, Math.sin(ang) * r); hg.rotation.y = Math.PI - ang;
      var body = new THREE.Mesh(pkHorseGeo(), pkCoat(coats[k % 8])); body.position.y = 0.42; body.castShadow = true; hg.add(body);
      box(0.4, 0.09, 0.5, pkCoat(saddles[k % 8]), 0, 1.41, 0.02, hg, { r: 0.03 });
      box(0.06, 0.32, 0.06, M.gold, -0.22, 1.2, 0.04, hg); box(0.06, 0.32, 0.06, M.gold, 0.22, 1.2, 0.04, hg);
      for (var mn = 0; mn < 5; mn++) box(0.08, 0.18, 0.1, pkCoat(0x3a2a20), 0, 1.47 + mn * 0.05, 0.52 + mn * 0.06, hg, { r: 0.03 });
      box(0.24, 0.04, 0.06, pkCoat(saddles[k % 8]), 0, 1.52, 0.86, hg);
      // the pole is fixed to the deck, not to the horse: the horse rises and falls along it, and the
      // pole stays planted with a collar at the foot and under the canopy
      var px = Math.cos(ang) * r, pz = Math.sin(ang) * r;
      cyl(0.034, 3.62, M.brass, px, 1.81, pz, spin, 10);
      cyl(0.055, 0.05, M.gold, px, 0.1, pz, spin, 10);
      cyl(0.055, 0.05, M.gold, px, 3.54, pz, spin, 10);
      sphere(0.07, M.gold, px, 3.62, pz, spin);
      pkFuse(hg);
      var h = { hg: hg, bob: k * 0.79 + (rider ? 0 : 1.6) };
      horses.push(h);
      if (rider) seats.push({ par: hg, x: 0, y: 1.46 - 0.76, z: 0.02, ry: 0, guest: null, hg: hg, bob: h.bob });
    }
    for (var hn = 0; hn < 8; hn++) horse(hn / 8 * Math.PI * 2, 5.3, hn, true);
    for (var hi = 0; hi < 8; hi++) horse((hi + 0.5) / 8 * Math.PI * 2, 3.25, hi + 3, false);
    pkFuse(spin);
    // the canopy is closed, so the only light inside is what hangs from it: a warm lamp under the
    // sunburst and a low fill that grazes the horses, instead of the dark hemisphere bounce
    var pkLampWarm = new THREE.PointLight(0xffd9a0, 1.25, 13, 2); pkLampWarm.position.set(0, 3.15, 0); spin.add(pkLampWarm);
    var pkLampLow = new THREE.PointLight(0xffc07a, 0.45, 8, 2); pkLampLow.position.set(0, 1.05, 0); spin.add(pkLampLow);
    var a = pkAttr({ id: 'carousel', name: 'Carousel', x: p.x, z: p.z, qx: p.q[0], qz: p.q[1], g: g, seats: seats, board: 8, run: 20, unload: 5,
      tickRun: function (at, dt, k) {
        spin.rotation.y += dt * 0.62 * k;
        for (var i = 0; i < horses.length; i++) horses[i].hg.position.y = 0.08 + Math.sin(spin.rotation.y * 3 + horses[i].bob) * 0.2;
      } });
    a.extra.spin = spin; a.extra.horses = horses;
    return a;
  }
  var PK_COATS = {};
  function pkCoat(c) { return PK_COATS[c] || (PK_COATS[c] = std({ color: c, roughness: 0.32, metalness: 0.05 })); }
  // ── The teacups ──────────────────────────────────────────────────
  function pkBuildTeacups(p, open) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(p.x, 0, p.z); scene.add(g);
    pkLathe([[0, 0], [7.1, 0], [7.1, 0.2], [6.8, 0.2], [6.8, 0.42], [0, 0.42]], M.stone, 0, 0, 0, g, 64);
    var spin = pkMover(g, 0, 0.42, 0);
    pkPrism(6.4, 0.2, 64, MAT.chequer, 0, 0.1, 0, spin);
    var top = new THREE.Mesh(new THREE.CircleGeometry(6.38, 64), std({ map: pkTexSunburst('#8fd3c7', '#f6eef2'), roughness: 0.55 })); top.rotation.x = -Math.PI / 2; top.position.y = 0.205; spin.add(top);
    pkRing(6.42, 0.1, M.gold, 0, 0.2, 0, spin, 72);
    // the teapot in the middle: a turned body, a lid with a knob, a spout and a handle
    var pot = std({ color: 0xf0a6c0, roughness: 0.3, metalness: 0.05 });
    pkLathe([[0, 0], [0.9, 0], [1.35, 0.35], [1.55, 0.9], [1.45, 1.45], [1.05, 1.8], [0.6, 1.92], [0.66, 2.02], [0.4, 2.1], [0, 2.1]], pot, 0, 0.2, 0, spin, 32);
    pkLathe([[0, 0], [0.5, 0], [0.42, 0.18], [0.1, 0.3], [0.14, 0.42], [0, 0.52]], M.gold, 0, 2.28, 0, spin, 20);
    pkTube([[1.3, 0.9, 0], [1.9, 1.3, 0], [2.2, 2.0, 0], [2.45, 2.35, 0]], 0.16, pot, spin, false, 20, 10);
    var ph = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.11, 10, 20, Math.PI), pot); ph.position.set(-1.45, 1.2, 0); ph.rotation.z = Math.PI / 2; spin.add(ph);
    var cupCols = [['#f0a6c0', '#ffffff'], ['#8fc0e8', '#ffffff'], ['#f3d36b', '#ffffff']];
    var cupMats = cupCols.map(function (c) { return std({ map: pkTexDots(c[0], c[1]), roughness: 0.3, metalness: 0.05 }); });
    var seats = [];
    for (var i = 0; i < 6; i++) {
      var ang = i / 6 * Math.PI * 2;
      var cup = pkMover(spin, Math.cos(ang) * 4.1, 0.2, Math.sin(ang) * 4.1);
      pkLathe([[0, 0], [1.45, 0], [1.55, 0.08], [1.5, 0.14], [0, 0.14]], M.white, 0, 0, 0, cup, 32);
      pkLathe([[0, 0.14], [0.55, 0.14], [0.85, 0.22], [1.1, 0.48], [1.24, 0.85], [1.3, 1.2], [1.34, 1.27], [1.27, 1.29], [1.2, 1.2], [1.14, 0.88], [1.0, 0.56], [0.72, 0.4], [0, 0.4]], cupMats[i % 3], 0, 0, 0, cup, 32);
      pkRing(1.31, 0.04, M.gold, 0, 1.28, 0, cup, 40);
      var hd = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.075, 8, 16, Math.PI), cupMats[i % 3]); hd.position.set(1.28, 0.78, 0); hd.rotation.z = -Math.PI / 2; cup.add(hd);
      pkRing(0.78, 0.15, pkCoat(0xc8342a), 0, 0.56, 0, cup, 24);
      cyl(0.05, 0.45, M.iron, 0, 0.62, 0, cup, 8);
      pkRing(0.24, 0.035, M.iron, 0, 0.86, 0, cup, 18);
      pkFuse(cup);
      seats.push({ par: cup, x: -0.6, y: 0.62 - 0.76 + 0.2, z: 0, ry: Math.PI / 2, guest: null, cup: cup });
      seats.push({ par: cup, x: 0.6, y: 0.62 - 0.76 + 0.2, z: 0, ry: -Math.PI / 2, guest: null, cup: cup });
    }
    pkFuse(spin);
    return pkAttr({ id: 'teacups', name: 'Teacups', x: p.x, z: p.z, qx: p.q[0], qz: p.q[1], g: g, seats: seats, board: 8, run: 18, unload: 4,
      tickRun: function (at, dt, k) {
        spin.rotation.y += dt * 0.8 * k;
        for (var i = 0; i < 6; i++) at.seats[i * 2].cup.rotation.y += dt * (1.5 + i * 0.18) * k * (i % 2 ? -1 : 1);
      } });
  }
  // ── The ferris wheel ─────────────────────────────────────────────
  function pkBuildFerris(p, open) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(p.x, 0, p.z); scene.add(g);
    var R = 8.8, HUB = 10.6, frame = pkPaint(0xf4f4f0, 0.4, 0.35);
    // an A-frame each side of the wheel: two legs from wide footings up to the bearing, with braces between
    [-1, 1].forEach(function (s) {
      [-1, 1].forEach(function (zs) {
        pkRod(s * 2.3, 0.3, zs * 4.4, s * 1.75, HUB, zs * 0.25, 0.17, frame, g, 12);
        box(1.0, 0.6, 1.0, M.stone, s * 2.3, 0.3, zs * 4.4, g);
      });
      [3.2, 6.6].forEach(function (y) { var f = y / HUB, zz = 4.4 * (1 - f) + 0.25 * f, xx = 2.3 * (1 - f) + 1.75 * f; pkRod(s * xx, y, -zz, s * xx, y, zz, 0.08, frame, g, 8); });
      pkRod(s * 2.25, 0.8, -4.1, s * 2.02, 5.2, 2.2, 0.06, frame, g, 6);
      pkRod(s * 2.25, 0.8, 4.1, s * 2.02, 5.2, -2.2, 0.06, frame, g, 6);
      box(0.5, 0.7, 0.9, MAT.steelDark, s * 1.75, HUB, 0, g);
    });
    pkRod(-2.2, HUB, 0, 2.2, HUB, 0, 0.26, MAT.steelDark, g, 16);
    box(1.6, 1.4, 1.2, pkPaint(0x2c5f9e, 0.5, 0.3), 3.3, 0.7, 0, g);    // the drive house
    // the loading platform under the wheel, with steps and a rail
    box(4.2, 0.5, 3.0, M.stone, 0, 0.25, 0, g);
    box(4.2, 0.04, 3.0, MAT.rubberMat, 0, 0.52, 0, g);
    var wheel = pkMover(g, 0, HUB, 0);
    [-1.15, 1.15].forEach(function (x) {
      var rim = pkRing(R, 0.14, frame, x, 0, 0, wheel, 120, false); rim.rotation.y = Math.PI / 2;
      var inner = pkRing(R * 0.6, 0.08, frame, x, 0, 0, wheel, 80, false); inner.rotation.y = Math.PI / 2;
      var hub = cyl(0.85, 0.3, MAT.steelDark, x, 0, 0, wheel, 24); hub.rotation.z = Math.PI / 2;
      for (var k = 0; k < 16; k++) { var sa = k / 16 * Math.PI * 2; pkRod(x, Math.sin(sa) * 0.8, Math.cos(sa) * 0.8, x, Math.sin(sa) * R, Math.cos(sa) * R, 0.05, frame, wheel, 6); }
    });
    for (var c = 0; c < 16; c++) { var ca = c / 16 * Math.PI * 2; pkRod(-1.15, Math.sin(ca) * R, Math.cos(ca) * R, 1.15, Math.sin(ca) * R, Math.cos(ca) * R, 0.06, frame, wheel, 6); }
    var lights = [];
    for (var lb = 0; lb < 96; lb++) { var la = lb / 96 * Math.PI * 2; lights.push([1.3, Math.sin(la) * (R + 0.18), Math.cos(la) * (R + 0.18)]); lights.push([-1.3, Math.sin(la) * (R + 0.18), Math.cos(la) * (R + 0.18)]); }
    for (var sp = 0; sp < 16; sp++) { var spa = sp / 16 * Math.PI * 2; for (var q = 1; q <= 6; q++) { var rq = 0.8 + q * (R - 0.8) / 7; lights.push([1.22, Math.sin(spa) * rq, Math.cos(spa) * rq]); lights.push([-1.22, Math.sin(spa) * rq, Math.cos(spa) * rq]); } }
    pkBulbs(lights, M.bulb, 0.05, wheel);
    // eight cabins on hangers, each kept level as the wheel turns
    var cabCols = [0xc8342a, 0xf0a020, 0xf3d36b, 0x2f9e44, 0x2f8fb3, 0x2f5fb3, 0x7a3fb3, 0xd94f8a];
    var seats = [];
    for (var k2 = 0; k2 < 8; k2++) {
      var ang = k2 / 8 * Math.PI * 2;
      var gon = pkMover(wheel, 0, Math.sin(ang) * R, Math.cos(ang) * R);
      var car = pkMover(gon, 0, -1.45, 0);
      var col = pkCoat(cabCols[k2]);
      pkPrism(0.95, 0.12, 8, MAT.steelDark, 0, 0.06, 0, car);
      pkPrism(0.95, 0.55, 8, col, 0, 0.39, 0, car, 0.95, true);
      var gl = pkPrism(0.93, 0.55, 8, M.glass, 0, 0.94, 0, car, 0.93, true); gl.castShadow = false;
      for (var mu = 0; mu < 8; mu++) { var ma = mu / 8 * Math.PI * 2; box(0.05, 0.6, 0.05, col, Math.sin(ma) * 0.94, 0.94, Math.cos(ma) * 0.94, car); }
      pkPrism(1.05, 0.12, 8, col, 0, 1.27, 0, car);
      var cr = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.32, 8), col); cr.position.y = 1.49; car.add(cr);
      sphere(0.07, M.gold, 0, 1.68, 0, car);
      pkRod(-1.1, 1.45, 0, -0.5, 1.62, 0, 0.04, MAT.steelDark, car, 6); pkRod(1.1, 1.45, 0, 0.5, 1.62, 0, 0.04, MAT.steelDark, car, 6);
      box(0.32, 0.4, 1.3, M.seat, -0.62, 0.32, 0, car, { r: 0.05 }); box(0.32, 0.4, 1.3, M.seat, 0.62, 0.32, 0, car, { r: 0.05 });
      pkFuse(car);
      seats.push({ par: car, x: -0.5, y: 0.52 - 0.76, z: 0, ry: Math.PI / 2, guest: null, gon: gon });
      seats.push({ par: car, x: 0.5, y: 0.52 - 0.76, z: 0, ry: -Math.PI / 2, guest: null, gon: gon });
    }
    pkFuse(wheel);
    var a = pkAttr({ id: 'ferris', name: 'Ferris wheel', x: p.x, z: p.z, qx: p.q[0], qz: p.q[1], g: g, seats: seats, board: 10, run: 45, unload: 6,
      // one slow turn per ride (about 1.3 rpm, a walking pace at the rim, as a real wheel goes), eased in and out, so every
      // cabin is back at the platform when it stops
      start: function (at) { at.extra.a0 = wheel.rotation.x; },
      tickRun: function (at, dt) {
        if (at.state === 'running') { var f = clamp(at.t / at.run, 0, 1); wheel.rotation.x = (at.extra.a0 || 0) + Math.PI * 2 * (f - Math.sin(Math.PI * 2 * f) / (Math.PI * 2)); }
        for (var i = 0; i < at.seats.length; i += 2) at.seats[i].gon.rotation.x = -wheel.rotation.x;
      } });
    a.extra.wheel = wheel;
    return a;
  }
  // ── The dodgems ──────────────────────────────────────────────────
  function pkBuildDodgems(p, open) {
    var M = pkMats(), th = PK_THEME.dodgems, g = new THREE.Group(); g.position.set(p.x, 0, p.z); scene.add(g);
    var W = 14, D = 10;
    box(W + 1.2, 0.2, D + 1.2, M.stone, 0, 0.1, 0, g);
    box(W, 0.12, D, MAT.chequer, 0, 0.26, 0, g);
    // the fence round the floor: a low wall with a fat rubber bumper on its inside face
    [[0, -D / 2, W, 0.25], [0, D / 2, W, 0.25], [-W / 2, 0, 0.25, D], [W / 2, 0, 0.25, D]].forEach(function (w) {
      box(w[2], 0.55, w[3], pkPaint(0x23262b, 0.5, 0.4), w[0], 0.47, w[1], g);
      box(w[2] > 1 ? w[2] - 0.3 : 0.18, 0.22, w[3] > 1 ? w[3] - 0.3 : 0.18, MAT.hazard, w[0] - Math.sign(w[0]) * 0.12, 0.62, w[1] - Math.sign(w[1]) * 0.12, g);
    });
    // the pavilion: white columns, a striped fascia full of bulbs, the electric ceiling net and a hipped roof
    var colM = pkPaint(0xf4f4f0, 0.4, 0.3);
    [[-7.4, -5.4], [0, -5.4], [7.4, -5.4], [-7.4, 5.4], [0, 5.4], [7.4, 5.4]].forEach(function (c) {
      cyl(0.16, 4.2, colM, c[0], 2.1, c[1], g, 16); cyl(0.24, 0.16, M.gold, c[0], 4.0, c[1], g, 16); cyl(0.24, 0.2, M.stone, c[0], 0.1, c[1], g, 16);
    });
    var fasc = pkStripes(hexCss(th.a), '#f3ead6');
    [[0, -5.6, 15.6, 0.12], [0, 5.6, 15.6, 0.12], [-7.8, 0, 0.12, 11.3], [7.8, 0, 0.12, 11.3]].forEach(function (f) { box(f[2], 0.7, f[3], fasc, f[0], 4.45, f[1], g); });
    var net = plane(W, D, MAT.mesh, 0, 3.9, 0, Math.PI / 2, 0, g);
    pkHipRoof(16.4, 12.0, 2.0, M.slateRed, 0, 4.8, 0, g);
    var db = [];
    for (var bx = 0; bx <= 30; bx++) { db.push([-7.5 + bx * 0.5, 4.45, -5.7]); db.push([-7.5 + bx * 0.5, 4.45, 5.7]); }
    for (var bz = 1; bz < 22; bz++) { db.push([-7.9, 4.45, -5.5 + bz * 0.5]); db.push([7.9, 4.45, -5.5 + bz * 0.5]); }
    pkBulbs(db, M.bulb, 0.05, g);
    var sideX = p.x < 0 ? 1 : -1;
    sign(['DODGEMS'], 5.0, 0.9, sideX * 7.9, 5.3, 0, sideX > 0 ? Math.PI / 2 : -Math.PI / 2, { bg: '#1b232c', fg: '#f5b53d' }, g);
    var seats = [], cars = [];
    var bodyCols = [0xd94f4f, 0xf0c04a, 0x2f8fd9, 0x2f9e44, 0xe07fb8, 0xf4f4f0];
    for (var k = 0; k < 6; k++) {
      var c = pkMover(g, -4.5 + (k % 3) * 4.5, 0.32, k < 3 ? -2.2 : 2.2);
      var body = pkGloss(bodyCols[k]);
      var tub = new THREE.Mesh(pkDodgemGeo(), body); tub.position.y = 0.36; tub.castShadow = true; c.add(tub);
      pkTube(pkRoundRect(0.78, 1.08, 0.36).map(function (q) { return [q[0], 0.2, q[1]]; }), 0.11, M.rubber, c, true, 48, 8);
      box(1.2, 0.62, 0.22, body, 0, 0.82, -0.66, c, { r: 0.08 });
      box(1.1, 0.12, 0.62, M.seat, 0, 0.6, -0.25, c, { r: 0.04 });
      pkRod(0, 0.55, 0.62, 0, 0.88, 0.42, 0.03, M.iron, c, 6);
      var sw = pkRing(0.17, 0.025, M.iron, 0, 0.9, 0.4, c, 18); sw.rotation.x = Math.PI / 2 - 0.5;
      pkRod(0, 1.1, -0.72, 0, 3.55, -0.72, 0.03, M.steel, c, 6);
      box(0.24, 0.06, 0.06, MAT.steelDark, 0, 3.58, -0.72, c);
      sphere(0.06, glowMat(0x9fd0ff, 1.8), 0, 3.6, -0.72, c);
      pkFuse(c);
      seats.push({ par: c, x: -0.3, y: 0.66 - 0.76, z: -0.25, ry: 0, guest: null, car: c });
      seats.push({ par: c, x: 0.3, y: 0.66 - 0.76, z: -0.25, ry: 0, guest: null, car: c });
      cars.push({ g: c, vx: randf(-1.3, 1.3), vz: randf(-1.0, 1.0), t: randf(0, 4) });
    }
    var a = pkAttr({ id: 'dodgems', name: 'Dodgems', x: p.x, z: p.z, qx: p.q[0], qz: p.q[1], g: g, seats: seats, board: 10, run: 26, unload: 6,
      tickRun: function (at, dt, k) {
        var cs = at.extra.cars; if (k < 0.01) return;
        for (var i = 0; i < cs.length; i++) {
          var c = cs[i];
          c.t -= dt;
          if (c.t <= 0) { c.t = randf(1.4, 3.2); c.vx = randf(-1.7, 1.7); c.vz = randf(-1.3, 1.3); }   // a bumper car's pace, up to ~8 km/h
          var x = c.g.position.x + c.vx * dt * k, z = c.g.position.z + c.vz * dt * k;
          if (x < -5.9 || x > 5.9) { c.vx *= -1; x = clamp(x, -5.9, 5.9); }
          if (z < -3.8 || z > 3.8) { c.vz *= -1; z = clamp(z, -3.8, 3.8); }
          c.g.position.x = x; c.g.position.z = z;
        }
        // bumps: two cars that touch push apart and swap their way of going
        for (var m = 0; m < cs.length; m++) for (var n = m + 1; n < cs.length; n++) {
          var A = cs[m].g.position, B = cs[n].g.position, dx = B.x - A.x, dz = B.z - A.z, d = Math.sqrt(dx * dx + dz * dz);
          if (d > 0.01 && d < 2.0) {
            var push = (2.0 - d) / 2, ux = dx / d, uz = dz / d;
            A.x -= ux * push; A.z -= uz * push; B.x += ux * push; B.z += uz * push;
            var t1 = cs[m].vx, t2 = cs[m].vz; cs[m].vx = cs[n].vx; cs[m].vz = cs[n].vz; cs[n].vx = t1; cs[n].vz = t2;
          }
        }
        for (var r = 0; r < cs.length; r++) { var want = Math.atan2(cs[r].vx, cs[r].vz); cs[r].g.rotation.y += yawWrap(want - cs[r].g.rotation.y) * Math.min(1, dt * 3 * k); }
      } });
    a.extra.cars = cars;
    return a;
  }
  function pkRoundRect(hw, hl, r) {
    var pts = [], corners = [[hw - r, hl - r, 0], [-hw + r, hl - r, Math.PI / 2], [-hw + r, -hl + r, Math.PI], [hw - r, -hl + r, Math.PI * 1.5]];
    corners.forEach(function (c) { for (var i = 0; i <= 4; i++) { var a = c[2] + i / 4 * Math.PI / 2; pts.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); } });
    return pts;
  }
  var PK_DODGEM_GEO = null;
  function pkDodgemGeo() {
    if (PK_DODGEM_GEO) return PK_DODGEM_GEO;
    var g = pkExtrudeGeo(pkRoundRect(0.66, 0.96, 0.32), 0.36, 0.07, 6); g.rotateX(-Math.PI / 2); g.userData.shared = true;
    return (PK_DODGEM_GEO = g);
  }
  // ── The drop tower ───────────────────────────────────────────────
  function pkBuildDropTower(p, open) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(p.x, 0, p.z); scene.add(g);
    var H = 30, white = pkPaint(0xf4f4f0, 0.4, 0.35);
    pkPrism(3.7, 0.6, 8, M.stone, 0, 0.3, 0, g);
    box(4.6, 0.04, 4.6, MAT.rubberMat, 0, 0.62, 0, g);
    // the mast: a tapered white column with four guide rails, yellow bands and a machine house on top with an aviation light
    var mast = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.2, H, 20), white); mast.position.y = H / 2; mast.castShadow = true; g.add(mast);
    for (var r4 = 0; r4 < 4; r4++) { var ra = r4 * Math.PI / 2 + Math.PI / 4; box(0.14, H - 3, 0.14, MAT.steelDark, Math.cos(ra) * 1.1, (H - 3) / 2 + 1.0, Math.sin(ra) * 1.1, g); }
    for (var bnd = 0; bnd < 5; bnd++) pkPrism(1.12 - bnd * 0.055, 0.5, 20, M.gold, 0, 5 + bnd * 5.4, 0, g);
    pkPrism(1.7, 2.4, 16, pkPaint(0x3a3f48, 0.5, 0.4), 0, H + 1.2, 0, g);
    var hood = new THREE.Mesh(new THREE.ConeGeometry(1.9, 1.0, 16), MAT.red); hood.position.y = H + 2.9; hood.castShadow = true; g.add(hood);
    pkRod(0, H + 3.3, 0, 0, H + 6.0, 0, 0.04, M.iron, g, 6);
    sphere(0.14, glowMat(0xff2a1a, 2.0), 0, H + 6.05, 0, g);
    var tb = []; for (var t = 0; t < 32; t++) { var tA = t / 32 * Math.PI * 2; tb.push([Math.cos(tA) * 1.74, H + 1.9, Math.sin(tA) * 1.74]); tb.push([Math.cos(tA) * 1.74, H + 0.5, Math.sin(tA) * 1.74]); }
    pkBulbs(tb, M.bulb, 0.06, g);
    // the carriage: a collar round the mast, a ring, and four seats facing out, each with an over-the-shoulder harness
    var car = pkMover(g, 0, 2.2, 0);
    pkPrism(1.35, 0.9, 16, MAT.steelDark, 0, 0.1, 0, car, 1.35, false);
    pkRing(2.2, 0.32, pkGloss(0xc8342a), 0, 0, 0, car, 40);
    var seats = [];
    for (var i = 0; i < 4; i++) {
      var a0 = i / 4 * Math.PI * 2 + Math.PI / 4, sx = Math.cos(a0) * 2.5, sz = Math.sin(a0) * 2.5, ry = Math.atan2(Math.cos(a0), Math.sin(a0));
      pkRod(Math.cos(a0) * 1.35, 0, Math.sin(a0) * 1.35, Math.cos(a0) * 2.1, 0, Math.sin(a0) * 2.1, 0.12, MAT.steelDark, car, 8);
      var sg = new THREE.Group(); sg.position.set(sx, 0.2, sz); sg.rotation.y = ry; car.add(sg);
      box(0.62, 0.14, 0.56, M.seat, 0, 0.1, 0.02, sg, { r: 0.05 });
      box(0.62, 1.05, 0.14, M.seat, 0, 0.68, -0.26, sg, { r: 0.05 });
      box(0.34, 0.28, 0.12, M.seat, 0, 1.32, -0.24, sg, { r: 0.05 });
      box(0.5, 0.1, 0.3, MAT.steelDark, 0, -0.04, 0.3, sg);   // the footrest
      var hn = pkMover(sg, 0, 1.15, -0.2);
      pkTube([[-0.2, 0, 0.02], [-0.24, -0.25, 0.26], [-0.18, -0.62, 0.34], [0.18, -0.62, 0.34], [0.24, -0.25, 0.26], [0.2, 0, 0.02]], 0.045, MAT.steelDark, hn, false, 24, 8);
      box(0.14, 0.32, 0.14, M.seat, -0.22, -0.18, 0.2, hn, { r: 0.05 }); box(0.14, 0.32, 0.14, M.seat, 0.22, -0.18, 0.2, hn, { r: 0.05 });
      pkFuse(hn);
      seats.push({ par: sg, x: 0, y: 0.17 - 0.76, z: 0.02, ry: 0, guest: null, harness: hn });
    }
    pkFuse(car);
    var a = pkAttr({ id: 'droptower', name: 'Drop tower', x: p.x, z: p.z, qx: p.q[0], qz: p.q[1], g: g, seats: seats, board: 10, run: 21, unload: 5,
      // up at 2 m/s, three seconds' hold at the top, a true free fall to 10 m (64 km/h), then the magnetic brakes take it
      // to a stop at the bottom at about 2 g: no bounce, real brakes do not bounce
      tickRun: function (at, dt) {
        var t = at.state === 'running' ? at.t : 99, y, fall = Math.sqrt(2 * 16.2 / 9.81), vB = 9.81 * fall, aB = vB * vB / (2 * 7.8);
        if (t < 12) { var e = t / 12; y = 2.2 + 24.0 * (e < 0.04 ? e * e / 0.08 / 0.96 : e > 0.96 ? 1 - (1 - e) * (1 - e) / 0.08 / 0.96 : (e - 0.02) / 0.96); }
        else if (t < 15) y = 26.2;
        else if (t < 15 + fall) { var tf = t - 15; y = 26.2 - 0.5 * 9.81 * tf * tf; }
        else if (t < 15 + fall + vB / aB) { var tb = t - 15 - fall; y = 10 - (vB * tb - 0.5 * aB * tb * tb); }
        else y = 2.2;
        car.position.y = y;
      } });
    a.extra.car = car;
    pkCtl(a).barObjs.push(function (b) { for (var s = 0; s < seats.length; s++) seats[s].harness.rotation.x = -1.7 * (1 - b); });
    return a;
  }
  // ── The log flume ────────────────────────────────────────────────
  // A double-drop chute now: out of the dock the chain lifts the log eleven metres up the west of the course, over the
  // crest and down the long chute into the first splash pool; the channel turns east, climbs a second, shorter lift and
  // drops again beside a mill race, then runs home along the east side and round the north end of the station.
  // The order round the lap is the order of this list; the boats ride it as one closed loop.
  var PK_FLUME_PTS = [
    [0, 0.25, 10.5], [0, 0.25, 6], [0, 0.3, 1.5],                                              // the dock
    [0, 1.2, -1.2], [0, 4.6, -4.2], [0, 8.2, -7.2], [0, 10.8, -10.4],                          // the chain lift
    [0, 11.2, -13.4],                                                                          // the crest
    [0, 9.6, -15.6], [0, 5.2, -17.6], [0, 1.2, -19.0],                                         // the long chute
    [0.8, 0.5, -21.6], [2.8, 0.35, -23.6], [5.2, 0.35, -24.8], [6.9, 0.6, -22.6],               // the turn out of the pool
    [7.2, 1.6, -18.8], [7.2, 3.4, -14.8], [7.1, 3.8, -11.2],                                   // the second lift (through the tunnel)
    [7.0, 2.6, -8.6], [6.9, 0.7, -6.4],                                                        // the second drop
    [6.6, 0.35, -3.4], [6.2, 0.3, 1.0], [5.6, 0.28, 5.6], [4.2, 0.26, 9.6], [2.4, 0.25, 12.0], [1.4, 0.25, 12.6]   // home round the house
  ];
  function pkBuildFlume(p, open) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(p.x, 0, p.z); scene.add(g);
    var PTS = PK_FLUME_PTS, N = PTS.length, lens = [], total = 0;
    for (var i = 0; i < N; i++) { var A = PTS[i], B = PTS[(i + 1) % N]; var L = Math.sqrt(Math.pow(B[0] - A[0], 2) + Math.pow(B[1] - A[1], 2) + Math.pow(B[2] - A[2], 2)); lens.push(L); total += L; }
    var trough = pkPaint(0xe9eef0, 0.35, 0.1), U = [[-1.25, -0.25], [1.25, -0.25], [1.25, 0.75], [1.0, 0.75], [1.0, -0.05], [-1.0, -0.05], [-1.0, 0.75], [-1.25, 0.75]];
    var waters = [];
    for (var j = 0; j < N; j++) {
      var A2 = PTS[j], B2 = PTS[(j + 1) % N], dx = B2[0] - A2[0], dy = B2[1] - A2[1], dz = B2[2] - A2[2], hz = Math.sqrt(dx * dx + dz * dz), yaw = Math.atan2(dx, dz), pitch = -Math.atan2(dy, hz), Lj = lens[j] + 0.5;
      var seg = new THREE.Group(); seg.position.set((A2[0] + B2[0]) / 2, (A2[1] + B2[1]) / 2, (A2[2] + B2[2]) / 2); seg.rotation.order = 'YXZ'; seg.rotation.y = yaw; seg.rotation.x = pitch; g.add(seg);
      var tm = new THREE.Mesh(pkExtrudeGeo(U, Lj, 0), trough); tm.castShadow = true; tm.receiveShadow = true; seg.add(tm);
      var wg = new THREE.PlaneGeometry(1.98, Lj), wuv = wg.attributes.uv; for (var wu = 0; wu < wuv.count; wu++) wuv.setXY(wu, wuv.getX(wu), wuv.getY(wu) * Lj / 3);
      var wm = new THREE.Mesh(wg, M.water); wm.rotation.x = -Math.PI / 2; wm.position.y = 0.12; seg.add(wm); waters.push(wm);
      // timber trestles under every raised stretch
      var steps = Math.floor(lens[j] / 2.4);
      for (var s = 1; s < steps; s++) {
        var f = s / steps, px = A2[0] + dx * f, py = A2[1] + dy * f, pz = A2[2] + dz * f; if (py < 1.4) continue;
        [-1.0, 1.0].forEach(function (o) { var ox = Math.cos(yaw) * o, oz = -Math.sin(yaw) * o; box(0.24, py - 0.25, 0.24, MAT.wood, px + ox, (py - 0.25) / 2, pz + oz, g); solid(p.x + px + ox - 0.15, p.x + px + ox + 0.15, p.z + pz + oz - 0.15, p.z + pz + oz + 0.15, 0, py); });
        var cb = box(2.4, 0.2, 0.2, MAT.wood, px, py - 0.35, pz, g); cb.rotation.y = yaw;
        if (py > 3) { var cb2 = box(2.4, 0.16, 0.16, MAT.wood, px, py * 0.45, pz, g); cb2.rotation.y = yaw; }
      }
      if (Math.max(A2[1], B2[1]) < 1.4) solid(p.x + Math.min(A2[0], B2[0]) - 1.35, p.x + Math.max(A2[0], B2[0]) + 1.35, p.z + Math.min(A2[2], B2[2]) - 1.35, p.z + Math.max(A2[2], B2[2]) + 1.35, 0, 1.2);
    }
    // the lift: a chain up the middle of the climb, and the plant room at the crest
    box(2.8, 2.4, 2.6, pkPaint(0x8a6a4a, 0.85, 0), 1.6, 12.0, -14.6, g);
    pkHipRoof(3.3, 3.1, 1.0, M.slate, 1.6, 13.2, -14.6, g);
    // ── The two splash pools ────────────────────────────────────────
    // Each chute throws the log into a stone basin. The first is the big one under the eleven-metre drop; the second,
    // smaller, sits under the short chute by the mill race.
    var pools = [{ x: 0, z: -20.4, w: 8.6, d: 6.6 }, { x: 6.8, z: -5.2, w: 5.6, d: 4.6 }];
    pools.forEach(function (P) {
      [[P.x, P.z - P.d / 2, P.w, 0.5], [P.x, P.z + P.d / 2, P.w, 0.5], [P.x - P.w / 2, P.z, 0.5, P.d], [P.x + P.w / 2, P.z, 0.5, P.d]].forEach(function (w) {
        box(w[2], 0.7, w[3], M.stoneDark, w[0], 0.35, w[1], g);
      });
      var pl = new THREE.Mesh(new THREE.PlaneGeometry(P.w - 0.5, P.d - 0.5), M.water);
      pl.rotation.x = -Math.PI / 2; pl.position.set(P.x, 0.42, P.z); g.add(pl); waters.push(pl);
    });
    // the rock gorge round the first pool, and the mouth of the tunnel over the second lift
    for (var rk = 0; rk < 18; rk++) {
      var rs = randf(0.5, 1.15), side = rk % 2 ? 1 : -1;
      pkBoulder(pools[0].x + side * randf(4.2, 5.8), pools[0].z + randf(-3.4, 3.4), rs, g);
    }
    for (var rk2 = 0; rk2 < 6; rk2++) pkBoulder(pools[0].x + randf(-3.6, 3.6), pools[0].z - 4.2 - randf(0, 0.8), randf(0.7, 1.3), g);
    // a boulder tunnel over the second lift: a rock mound with the chute running through a bore in it
    for (var tb = 0; tb < 16; tb++) {
      var tz = -17.6 + (tb % 8) * 0.55, sgn = tb < 8 ? -1 : 1;
      pkBoulder(7.2 + sgn * randf(1.5, 2.6), tz, randf(0.9, 1.6), g);
    }
    var bore = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 5.2, 14, 1, true), std({ color: 0x2a2a26, roughness: 1, side: THREE.DoubleSide }));
    bore.rotation.x = Math.PI / 2; bore.position.set(7.2, 3.2, -15.0); g.add(bore);
    // the station deck along the dock; the mill house in the remodel below is its walls and roof now
    var lane = p.x < 0 ? 1 : -1;
    box(5.0, 0.12, 10.5, MAT.wood, lane * 3.95, 0.06, 7.0, g);
    pkRailRun(p.x + lane * 6.45, p.z + 1.8, p.x + lane * 6.45, p.z + 6.3, { solid: true });
    pkRailRun(p.x + lane * 6.45, p.z + 9.8, p.x + lane * 6.45, p.z + 12.2, { solid: true });
    // the boats: hollowed logs with two seats and a lap bar
    var bark2 = std({ map: M.bark.map, roughness: 1, side: THREE.DoubleSide });
    var boats = [], seats = [];
    for (var b = 0; b < 3; b++) {
      var bt = pkMover(g, 0, 0, 0);
      var hull = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 3.0, 18, 1, true, -0.72 * Math.PI, 1.44 * Math.PI), bark2); hull.rotation.x = Math.PI / 2; hull.position.y = 0.62; hull.castShadow = true; bt.add(hull);
      [-1.5, 1.5].forEach(function (ez) { var cap = new THREE.Mesh(new THREE.CircleGeometry(0.62, 18, -1.22 * Math.PI, 1.44 * Math.PI), MAT.wood); cap.position.set(0, 0.62, ez); if (ez < 0) cap.rotation.y = Math.PI; bt.add(cap); });
      box(1.0, 0.08, 0.36, MAT.wood, 0, 0.56, 0.45, bt); box(1.0, 0.08, 0.36, MAT.wood, 0, 0.56, -0.7, bt);
      var bar = pkMover(bt, 0, 0.9, 0.12);
      pkTube([[-0.42, 0, 0], [-0.4, -0.05, 0.3], [0.4, -0.05, 0.3], [0.42, 0, 0]], 0.035, MAT.steelDark, bar, false, 16, 6);
      pkFuse(bt);
      seats.push({ par: bt, x: -0.26, y: 0.6 - 0.76, z: 0.42, ry: 0, guest: null, boat: bt });
      seats.push({ par: bt, x: 0.26, y: 0.6 - 0.76, z: 0.42, ry: 0, guest: null, boat: bt });
      boats.push({ g: bt, u0: b * 3.5 / total, u: b * 3.5 / total, bar: bar });
    }
    function placeBoat(bt, u) {
      var d = ((u % 1) + 1) % 1 * total, k = 0;
      while (k < lens.length - 1 && d > lens[k]) { d -= lens[k]; k++; }
      var A = PTS[k], B = PTS[(k + 1) % N], f = lens[k] ? clamp(d / lens[k], 0, 1) : 0, dx = B[0] - A[0], dy = B[1] - A[1], dz = B[2] - A[2];
      bt.g.position.set(A[0] + dx * f, A[1] + dy * f - 0.12, A[2] + dz * f);
      bt.g.rotation.order = 'YXZ'; bt.g.rotation.y = Math.atan2(dx, dz); bt.g.rotation.x = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));
    }
    boats.forEach(function (bt) { placeBoat(bt, bt.u); });
    // the dock's edge: a station gate at each boat's berth (hung once the ride has its controls, below) and a rail between
    var dockX = lane * 1.5, gw = 1.8, berths = boats.map(function (bt) { return clamp(bt.g.position.z, 2.8, 11.2); }).sort(function (q1, q2) { return q1 - q2; });
    var railFrom = 1.8;
    berths.concat([12.2 + gw / 2 + 0.06]).forEach(function (gzz) { var z1 = gzz - gw / 2 - 0.06; if (z1 - railFrom > 0.3) pkRailRun(p.x + dockX, p.z + railFrom, p.x + dockX, p.z + z1, { solid: true }); railFrom = gzz + gw / 2 + 0.06; });
    // where each chute meets its pool, as a fraction of the lap: the boats throw up a splash when they cross one
    var cum = [0], splashes = [];
    for (var c = 0; c < N; c++) cum.push(cum[c] + lens[c]);
    [10, 19].forEach(function (vi) { splashes.push({ u: cum[vi] / total, x: p.x + PTS[vi][0], z: p.z + PTS[vi][2] }); });
    var a = pkAttr({ id: 'flume', name: 'Log flume', x: p.x, z: p.z, qx: p.q[0], qz: p.q[1], g: g, seats: seats, board: 10, run: 30, unload: 5,
      tickRun: function (at, dt) {
        M.waterTex.offset.y -= dt * 0.35;
        if (at.state !== 'running') return;
        var f = clamp(at.t / (at.run - 1), 0, 1);
        for (var i = 0; i < at.extra.boats.length; i++) {
          var bt = at.extra.boats[i], prev = bt.u;
          bt.u = bt.u0 + f;
          placeBoat(bt, bt.u);
          var pu = ((prev % 1) + 1) % 1, nu = ((bt.u % 1) + 1) % 1;
          for (var sp = 0; sp < splashes.length; sp++) {
            var S = splashes[sp];
            if (pu < S.u + 0.03 && nu >= S.u + 0.03) burst(S.x, 0.8, S.z, 0x9fd8ff, sp ? 22 : 38, 'up');
          }
        }
      } });
    a.extra.boats = boats;
    pkCtl(a).barObjs.push(function (bv) { for (var s = 0; s < boats.length; s++) boats[s].bar.rotation.x = -1.3 * (1 - bv); });
    berths.forEach(function (gzz) { pkStationGatePair(g, dockX, gzz, -lane, 0, gw, pkCtl(a), 0x2f6b4a); });   // swinging toward the boats
    // ── The mill ────────────────────────────────────────────────────
    // The dock is a timber mill house now, not a canopy over a deck: boarded walls with two windows on the queue side, a
    // hipped slate roof with a ridge vent, a painted name board over the way in, lanterns at the corners, a bench and a
    // paved apron outside. The wheel turns in the race beside the splash pool, where the drop actually puts the water.
    var millWall = pkPaint(0x8a6a4a, 0.92, 0), millTrim = std({ color: 0x4a3826, roughness: 0.85 }), millRoof = M.slateGreen;
    var WX = lane * 6.4;                                  // the house's back wall, on the side away from the water
    // the back wall, with a window either side of the door
    box(0.18, 2.7, 10.2, millWall, WX, 1.41, 7.0, g);
    [3.4, 10.0].forEach(function (wz) {
      box(0.22, 0.95, 1.5, std({ color: 0xbcd8e2, roughness: 0.25, metalness: 0.1 }), WX + lane * 0.02, 1.7, wz, g);
      box(0.26, 0.1, 1.7, millTrim, WX, 1.2, wz, g); box(0.26, 0.1, 1.7, millTrim, WX, 2.2, wz, g);
      box(0.26, 1.0, 0.1, millTrim, WX, 1.7, wz - 0.8, g); box(0.26, 1.0, 0.1, millTrim, WX, 1.7, wz + 0.8, g);
    });
    // the two ends, open toward the platform and the water
    box(5.0, 2.7, 0.18, millWall, lane * 3.95, 1.41, 12.1, g);
    box(5.0, 2.7, 0.18, millWall, lane * 3.95, 1.41, 1.9, g);
    // the roof: hipped, with a ridge vent and a weathervane
    pkHipRoof(5.8, 11.6, 1.9, millRoof, lane * 3.95, 2.76, 7.0, g);
    box(0.9, 0.5, 2.4, millTrim, lane * 3.95, 4.5, 7.0, g);
    pkRod(lane * 3.95, 4.75, 7.0, lane * 3.95, 5.6, 7.0, 0.035, MAT.iron, g, 6);
    box(1.1, 0.06, 0.06, MAT.iron, lane * 3.95 + 0.35, 5.55, 7.0, g).rotation.y = 0.6;
    // the name board, over the door on the queue side
    pkSign3D(['THE LOG FLUME'], 3.4, 0.5, WX - lane * 0.05, 2.55, 7.0, lane * Math.PI / 2, { bg: '#1b232c', fg: '#f5b53d' }, g);
    // lanterns at the four corners of the house and a bench on the apron
    [[WX, 2.2], [WX, 11.8]].forEach(function (c) { pkLamp(p.x + c[0] + lane * 0.5, p.z + c[1], 4.0); });
    pkBench(p.x + WX + lane * 2.4, p.z + 4.6, lane * Math.PI / 2);
    // a paved apron from the queue to the house
    for (var apz = 2.4; apz < 12.0; apz += 2.0) pkPavedDisc(1.7, M.paversWarm, p.x + WX + lane * 1.6, 0.045, p.z + apz, null, 1.0);
    // the wheel: a stone head-race under it, a timber axle, twelve paddles, turning in the water. It stands on the west
    // side of the big pool, where the long chute comes down.
    var wheelX = -6.4, wheelZ = -20.4;
    box(1.2, 1.3, 4.4, M.stone, wheelX - 0.9, 0.65, wheelZ, g);
    box(1.0, 0.5, 4.4, M.stoneDark, wheelX - 0.9, 1.35, wheelZ, g);
    var wheel = new THREE.Group(); wheel.position.set(wheelX, 2.1, wheelZ); g.add(wheel);
    wheel.userData.dynamic = true;
    var rimMat = pkPaint(0x6a4a2a, 0.85, 0), hub = pkRoundCyl(0.26, 0.9, MAT.iron, 0, 0, 0, wheel, 12); hub.rotation.z = Math.PI / 2;
    for (var wr = 0; wr < 12; wr++) {
      var wa = wr / 12 * Math.PI * 2;
      pkRod(0, 0, 0, 0, Math.cos(wa) * 2.15, Math.sin(wa) * 2.15, 0.06, MAT.wood, wheel, 6);
      var pad = box(0.24, 0.5, 0.09, rimMat, 0, Math.cos(wa) * 2.2, Math.sin(wa) * 2.2, wheel);
      pad.rotation.x = wa;
    }
    [-0.42, 0.42].forEach(function (oz) { var rim = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.09, 6, 28), rimMat); rim.rotation.y = Math.PI / 2; rim.position.z = oz; rim.castShadow = true; wheel.add(rim); });
    animate(function (dt) { if (wheel) wheel.rotation.x += dt * 0.5; });
    // the tail race: a sheet of water from the wheel back into the pool
    var race = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 3.2), M.water); race.rotation.x = -Math.PI / 2; race.position.set(wheelX + 1.0, 0.44, wheelZ); g.add(race); waters.push(race);
    // reeds round both pools
    for (var rl = 0; rl < 26; rl++) {
      var pool = pools[rl % 3 === 0 ? 1 : 0], ra = randf(0, Math.PI * 2), rr = randf(1.6, 2.4) + (rl % 3 === 0 ? 0.4 : 1.6);
      var reed = new THREE.Mesh(new THREE.ConeGeometry(0.05, randf(0.6, 1.1), 5), std({ color: 0x4d6b32, roughness: 0.95 }));
      reed.position.set(pool.x + Math.cos(ra) * rr * 0.9, 0.75, pool.z + Math.sin(ra) * rr * 0.8); g.add(reed);
    }
    return a;
  }
  // Danse Macabre, on the old manor's plot, is built in part 49
