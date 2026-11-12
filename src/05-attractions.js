//@ Park Co, part 05: the rides - the attraction system and the flat rides that stand either side of the midway
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
    if (n) { pkAttrQueueReslot(a, true); screenDirtyAll(); }
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
    pkAttrQueueReslot(a, true);
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
      if (f && f.open && (!f.canQueue || f.canQueue()) && f.ctl && !f.ctl.fault && !f.ctl.maint && f.queue.length < f.seats.length * 3 && !(gu.gaveUp && gu.gaveUp[f.id]) && Math.random() < 0.65) return pkAttrQueueJoin(gu, f);
    }
    var open = [];
    // a ride with its operator key OFF still takes a line (the guests wait for it to open), but one that is running is
    // preferred; a ride in a fault or in MAINT takes nobody, and a guest does not go back to a line they gave up on
    for (var i = 0; i < PK.attractions.length; i++) { var at = PK.attractions[i]; if (at.open && (!at.canQueue || at.canQueue()) && at.ctl && !at.ctl.fault && !at.ctl.maint && at.queue.length < at.seats.length * 2 && !(gu.gaveUp && gu.gaveUp[at.id])) open.push(at); }
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
  // a ride that cannot run yet (the Skyline before stage 1) is neither open nor one of the rides to count
  function pkRideLive(a) { return !a.canQueue || a.canQueue(); }
  function pkRideTotal() { var n = 1; for (var i = 0; i < PK.attractions.length; i++) if (pkRideLive(PK.attractions[i])) n++; return n; }
  function pkOpenCount() { var n = pkCoasterOpen() ? 1 : 0; for (var i = 0; i < PK.attractions.length; i++) if (PK.attractions[i].open && pkRideLive(PK.attractions[i])) n++; return n; }
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
  // ── Shapes the rides are modelled from ───────────────────────────
  // a rod that tapers from r0 at a to r1 at b: a leg, a neck, a spout
  function pkRodT(a, b, r0, r1, mat, parent, seg) {
    var d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), len = d.length(); if (len < 1e-4) return null;
    var m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, seg || 10), mat);
    m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
    m.quaternion.setFromUnitVectors(PK_UP, d.multiplyScalar(1 / len));
    m.castShadow = true; m.receiveShadow = true; parentOf(parent).add(m); return m;
  }
  // a ball squashed to three radii: a barrel, a rump, a bonnet
  function pkBlob(rx, ry, rz, mat, x, y, z, parent) {
    var m = new THREE.Mesh(cachedGeo('pkblob', function () { return new THREE.SphereGeometry(1, 18, 12); }), mat);
    m.scale.set(rx, ry, rz); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parentOf(parent).add(m); return m;
  }
  // a cross-section [[x, y], ...] (x to the left of the way of travel, y up) drawn along a line of points. The section
  // stays upright whatever the line does, the way a channel or a walkway is built. closed: the last point is the first.
  function pkSweep(profile, pts, mat, parent, closed, vScale) {
    var n = pts.length, m = closed ? n - 1 : n, pos = [], uv = [], idx = [], t = new THREE.Vector3(), i, e, run = 0, fr = [];
    for (i = 0; i < n; i++) {
      var a = closed ? pts[(i - 1 + m) % m] : pts[Math.max(0, i - 1)], b = closed ? pts[(i + 1) % m] : pts[Math.min(n - 1, i + 1)];
      t.subVectors(b, a).normalize();
      var sx = t.z, sz = -t.x, sl = Math.sqrt(sx * sx + sz * sz) || 1; sx /= sl; sz /= sl;
      if (i) run += pts[i].distanceTo(pts[i - 1]);
      fr.push({ p: pts[i], sx: sx, sz: sz, ux: t.y * sz, uy: t.z * sx - t.x * sz, uz: -t.y * sx, v: run * (vScale || 0.4) });
    }
    var du = 0;
    for (e = 0; e < profile.length - 1; e++) {
      var A = profile[e], B = profile[e + 1], el = Math.sqrt(Math.pow(B[0] - A[0], 2) + Math.pow(B[1] - A[1], 2)), base = pos.length / 3;
      for (i = 0; i < n; i++) {
        var f = fr[i];
        [A, B].forEach(function (q, k) {
          pos.push(f.p.x + f.sx * q[0] + f.ux * q[1], f.p.y + f.uy * q[1], f.p.z + f.sz * q[0] + f.uz * q[1]);
          uv.push((du + k * el) * 0.5, f.v);
        });
        if (i < n - 1) { var o = base + i * 2; idx.push(o, o + 2, o + 1, o + 1, o + 2, o + 3); }
      }
      du += el;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx); geo.computeVertexNormals();
    var mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true; mesh.receiveShadow = true; parentOf(parent).add(mesh); return mesh;
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
  // ── A carved horse ───────────────────────────────────────────────
  // A galloper in the round, not a cut-out: a barrel with a chest and a rump, an arched neck, a long head with ears, four
  // legs gathered under it in the jump, a flowing tail and mane, a saddle on its cloth, a breast strap and reins in gilt.
  // It stands on the deck at the group's origin and faces +z; the saddle's top is 1.455 up.
  function pkHorse3D(hg, coat, cloth, M, hair) {
    pkBlob(0.25, 0.27, 0.6, coat, 0, 1.17, 0, hg);
    pkBlob(0.25, 0.3, 0.3, coat, 0, 1.2, 0.36, hg);
    pkBlob(0.27, 0.3, 0.32, coat, 0, 1.2, -0.38, hg);
    pkRodT([0, 1.24, 0.46], [0, 1.74, 0.76], 0.2, 0.115, coat, hg, 12);
    pkBlob(0.115, 0.13, 0.15, coat, 0, 1.78, 0.78, hg);
    pkRodT([0, 1.8, 0.8], [0, 1.58, 1.1], 0.115, 0.07, coat, hg, 10);
    pkBlob(0.072, 0.07, 0.085, coat, 0, 1.57, 1.115, hg);
    [-1, 1].forEach(function (s) {
      var ear = new THREE.Mesh(cachedGeo('pkear', function () { return new THREE.ConeGeometry(0.035, 0.12, 6); }), coat); ear.position.set(s * 0.06, 1.94, 0.74); ear.rotation.z = -s * 0.2; hg.add(ear);
      sphere(0.022, M.seat, s * 0.085, 1.74, 0.93, hg);                                          // the eye
      // the forelegs, tucked up; the hind legs, thrown back
      var fk = s > 0 ? 0 : 0.1;
      pkRodT([s * 0.13, 1.08, 0.42], [s * 0.13, 0.8 - fk, 0.66 - fk], 0.085, 0.055, coat, hg, 8);
      pkRodT([s * 0.13, 0.8 - fk, 0.66 - fk], [s * 0.13, 0.5 - fk, 0.52 - fk], 0.05, 0.04, coat, hg, 8);
      pkRodT([s * 0.13, 0.5 - fk, 0.52 - fk], [s * 0.13, 0.42 - fk, 0.5 - fk], 0.055, 0.06, M.gold, hg, 8);
      pkRodT([s * 0.15, 1.1, -0.42], [s * 0.15, 0.76, -0.56 - fk], 0.105, 0.06, coat, hg, 8);
      pkRodT([s * 0.15, 0.76, -0.56 - fk], [s * 0.15, 0.46, -0.8 - fk], 0.055, 0.04, coat, hg, 8);
      pkRodT([s * 0.15, 0.46, -0.8 - fk], [s * 0.15, 0.39, -0.85 - fk], 0.055, 0.06, M.gold, hg, 8);
      pkRod(s * 0.1, 1.72, 0.98, s * 0.2, 1.42, 0.22, 0.012, M.gold, hg, 5);                     // a rein
    });
    pkTube([[0, 1.3, -0.66], [0, 1.3, -0.84], [0, 1.08, -0.98], [0, 0.8, -1.0]], 0.065, hair, hg, false, 12, 7);
    pkTube([[0, 1.93, 0.7], [0, 1.8, 0.6], [0, 1.58, 0.5], [0, 1.4, 0.42]], 0.05, hair, hg, false, 10, 6);
    pkBlob(0.045, 0.06, 0.05, hair, 0, 1.92, 0.8, hg);                                           // the forelock
    // the saddle cloth lies over the back, the saddle on it, a cantle behind and a gilt pommel in front
    var sc = new THREE.Mesh(cachedGeo('pkcloth', function () { return new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, 1.75); }), cloth);
    sc.scale.set(0.268, 0.29, 0.34); sc.position.set(0, 1.17, -0.02); hg.add(sc);
    pkBlob(0.17, 0.05, 0.25, M.seat, 0, 1.43, 0.0, hg);
    pkBlob(0.15, 0.08, 0.05, M.seat, 0, 1.47, -0.24, hg);
    sphere(0.035, M.gold, 0, 1.49, 0.24, hg);
    var strap = pkRing(0.262, 0.018, M.gold, 0, 1.19, 0.33, hg, 18, false); strap.scale.y = 1.12;
    pkRing(0.08, 0.012, M.gold, 0, 1.63, 1.02, hg, 10, false);                                   // the noseband
  }
  // ── The carousel ─────────────────────────────────────────────────
  function pkBuildCarousel(p, open) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(p.x, 0, p.z); scene.add(g);
    pkLathe([[0, 0], [8.0, 0], [8.0, 0.17], [7.65, 0.17], [7.65, 0.34], [7.35, 0.34], [7.35, 0.5], [0, 0.5]], M.stone, 0, 0, 0, g, 64);
    var spin = pkMover(g, 0, 0.5, 0);
    pkPrism(7.1, 0.16, 48, MAT.wood, 0, 0.08, 0, spin);
    pkRing(7.1, 0.06, M.gold, 0, 0.16, 0, spin, 64);
    pkPrism(7.12, 0.14, 48, MAT.red, 0, 0.07, 0, spin, 7.12, true);
    // the drum in the middle: painted panels between gilt pilasters, a looking-glass in each, a turned cornice top and bottom
    pkPrism(1.2, 3.9, 8, M.cream, 0, 2.11, 0, spin);
    var glassM = std({ color: 0xbfd6e4, roughness: 0.12, metalness: 0.35 }), panelM = std({ color: 0x9c2a26, roughness: 0.6 });
    for (var f = 0; f < 8; f++) {
      var th = (f + 0.5) * Math.PI / 4, rr = 1.2 * Math.cos(Math.PI / 8) + 0.012;
      var pan = box(0.74, 3.3, 0.02, panelM, Math.sin(th) * (rr - 0.006), 2.1, Math.cos(th) * (rr - 0.006), spin); pan.rotation.y = th;
      var fr = box(0.56, 1.7, 0.02, M.gold, Math.sin(th) * (rr + 0.004), 2.35, Math.cos(th) * (rr + 0.004), spin); fr.rotation.y = th;
      var mir = box(0.46, 1.6, 0.02, glassM, Math.sin(th) * (rr + 0.014), 2.35, Math.cos(th) * (rr + 0.014), spin); mir.rotation.y = th;
      var low = box(0.56, 0.7, 0.02, M.gold, Math.sin(th) * (rr + 0.004), 0.92, Math.cos(th) * (rr + 0.004), spin); low.rotation.y = th;
      var low2 = box(0.46, 0.6, 0.02, M.cream, Math.sin(th) * (rr + 0.014), 0.92, Math.cos(th) * (rr + 0.014), spin); low2.rotation.y = th;
      var ca = f * Math.PI / 4;
      cyl(0.07, 3.5, M.gold, Math.sin(ca) * 1.2, 2.1, Math.cos(ca) * 1.2, spin, 10);
    }
    pkLathe([[0, 0], [1.5, 0], [1.5, 0.08], [1.36, 0.14], [1.3, 0.3], [0, 0.3]], M.gold, 0, 0.16, 0, spin, 8);
    pkLathe([[0, 0], [1.3, 0], [1.36, 0.14], [1.55, 0.22], [1.55, 0.3], [0, 0.3]], M.gold, 0, 3.8, 0, spin, 8);
    var ceilMat = std({ map: pkTexSunburst('#c8342a', '#f3ead6'), roughness: 0.8, emissive: 0x2a1208, emissiveIntensity: 0.35 });
    var ceil = new THREE.Mesh(new THREE.CircleGeometry(7.45, 48), ceilMat); ceil.rotation.x = Math.PI / 2; ceil.position.y = 4.1; spin.add(ceil);
    // the sweeps: the timber arms that carry the roof and the horses, out from the drum under the ceiling
    for (var sw = 0; sw < 16; sw++) { var swa = sw / 16 * Math.PI * 2; pkRod(Math.cos(swa) * 1.3, 4.02, Math.sin(swa) * 1.3, Math.cos(swa) * 7.4, 4.02, Math.sin(swa) * 7.4, 0.05, M.gold, spin, 6); }
    var boardMat = std({ map: pkTexRounding('#f3ead6', '#c8342a'), roughness: 0.7, emissive: 0x1e0c05, emissiveIntensity: 0.3 });
    pkPrism(7.5, 0.8, 48, boardMat, 0, 4.5, 0, spin, 7.5, true);
    pkRing(7.52, 0.05, M.gold, 0, 4.1, 0, spin, 64); pkRing(7.52, 0.05, M.gold, 0, 4.9, 0, spin, 64);
    var bulbs = [];
    for (var b = 0; b < 72; b++) { var ba = b / 72 * Math.PI * 2; bulbs.push([Math.cos(ba) * 7.56, 4.32, Math.sin(ba) * 7.56]); bulbs.push([Math.cos(ba + 0.04) * 7.56, 4.7, Math.sin(ba + 0.04) * 7.56]); }
    for (var b2 = 0; b2 < 16; b2++) { var b2a = b2 / 16 * Math.PI * 2; for (var bq = 1; bq <= 7; bq++) bulbs.push([Math.cos(b2a) * (1.3 + bq * 0.78), 3.95, Math.sin(b2a) * (1.3 + bq * 0.78)]); }
    pkBulbs(bulbs, M.bulb, 0.045, spin);
    for (var sc = 0; sc < 48; sc++) {
      var sa = (sc + 0.5) / 48 * Math.PI * 2;
      var sv = new THREE.Mesh(cachedGeo('pkscalC', function () { return new THREE.CircleGeometry(0.48, 12, Math.PI, Math.PI); }), sc % 2 ? MAT.red : M.gold);
      sv.position.set(Math.cos(sa) * 7.53, 4.1, Math.sin(sa) * 7.53); sv.rotation.y = Math.PI / 2 - sa; spin.add(sv);
    }
    // the roof: a striped tilt that sweeps up in a curve to the crown, with a gilt rib down every seam
    var roofTex = pkTexStripes('#c8342a', '#f3ead6', 8); roofTex.repeat.set(3, 1);
    var roof = new THREE.Mesh(new THREE.LatheGeometry([[7.75, 0], [6.4, 0.42], [4.6, 0.9], [2.8, 1.38], [1.5, 1.86], [0.9, 2.3]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 48),
      std({ map: roofTex, roughness: 0.75, side: THREE.DoubleSide }));
    roof.position.y = 4.9; roof.castShadow = true; spin.add(roof);
    for (var rb = 0; rb < 24; rb++) { var rba = rb / 24 * Math.PI * 2, cr = Math.cos(rba), sr = Math.sin(rba); pkTube([[cr * 7.75, 4.93, sr * 7.75], [cr * 4.6, 5.83, sr * 4.6], [cr * 1.5, 6.79, sr * 1.5], [cr * 0.9, 7.23, sr * 0.9]], 0.035, M.gold, spin, false, 10, 5); }
    pkPrism(0.95, 0.7, 12, M.cream, 0, 7.5, 0, spin);
    pkRing(0.97, 0.05, M.gold, 0, 7.17, 0, spin, 24); pkRing(0.97, 0.05, M.gold, 0, 7.85, 0, spin, 24);
    pkLathe([[0, 0], [1.15, 0], [1.1, 0.1], [0.7, 0.42], [0.3, 0.8], [0.1, 1.0], [0, 1.02]], MAT.red, 0, 7.85, 0, spin, 16);
    pkLathe([[0, 0], [0.12, 0], [0.06, 0.2], [0.14, 0.38], [0.04, 0.6], [0, 0.66]], M.gold, 0, 8.82, 0, spin, 12);
    pkRod(0, 9.4, 0, 0, 10.3, 0, 0.025, M.iron, spin, 6);
    var flag = box(0.7, 0.42, 0.02, MAT.red, 0.36, 10.05, 0, spin);
    // the horses: an outer ring that carries riders and an inner ring that dresses the deck. Each rises and falls on its pole.
    var coats = [0xf3eee4, 0x2a2420, 0x8a5a3a, 0xc9c4bc, 0xf3eee4, 0x6b4a2a, 0xe8d8b8, 0x3a3a40];
    var manes = [0xd9c9a0, 0x141210, 0x2a1a10, 0x6a6660, 0x8a6a3a, 0x1a1210, 0x8a5a2a, 0x101014];
    var saddles = [0xc8342a, 0x2f6fb3, 0x2f9e44, 0xd4a73a, 0x8a3fb3, 0xc8342a, 0x2f6fb3, 0xd4a73a];
    var seats = [], horses = [];
    function horse(ang, r, k, rider) {
      var hg = pkMover(spin, Math.cos(ang) * r, 0, Math.sin(ang) * r); hg.rotation.y = Math.PI - ang;
      pkHorse3D(hg, pkCoat(coats[k % 8]), pkCoat(saddles[k % 8]), M, pkCoat(manes[k % 8]));
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
  // Built the way a park wheel is: two trussed rims (an outer ring and a lighter one inside it, laced together), spokes
  // to a flanged hub with a painted star, the axle in bearing blocks on two braced A-frames with raking stays, tyre
  // drives pinching the rim at the bottom, and sixteen round gondolas under little parasols hung from their own axles.
  // The gondolas pass through a slot between two boarding decks.
  function pkBuildFerris(p, open) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(p.x, 0, p.z); scene.add(g);
    var R = 8.8, HUB = 11.2, RX = 1.15, frame = pkPaint(0xf4f4f0, 0.4, 0.35), blue = pkPaint(0x2c5f9e, 0.45, 0.3), dark = MAT.steelDark;
    // the A-frames
    [-1, 1].forEach(function (s) {
      [-1, 1].forEach(function (zs) {
        pkRodT([s * 2.5, 0.5, zs * 4.6], [s * 1.8, HUB, zs * 0.3], 0.26, 0.2, frame, g, 14);
        box(1.5, 0.7, 1.5, M.stone, s * 2.5, 0.35, zs * 4.6, g);
        box(0.9, 0.08, 0.9, dark, s * 2.5, 0.72, zs * 4.6, g);
        // a raking stay out to its own footing, so the frame cannot rack sideways
        pkRodT([s * 4.9, 0.4, zs * 3.3], [s * 1.95, HUB - 2.4, zs * 0.9], 0.13, 0.11, frame, g, 10);
        box(0.9, 0.5, 0.9, M.stone, s * 4.9, 0.25, zs * 3.3, g);
        solid(p.x + s * 2.5 - 0.6, p.x + s * 2.5 + 0.6, p.z + zs * 4.6 - 0.6, p.z + zs * 4.6 + 0.6, 0, 3);
      });
      var legAt = function (y) { var f = (y - 0.5) / (HUB - 0.5); return [2.5 * (1 - f) + 1.8 * f, 4.6 * (1 - f) + 0.3 * f]; };
      var tiers = [2.6, 5.0, 7.2, 9.2];
      tiers.forEach(function (y, k) {
        var q = legAt(y); pkRod(s * q[0], y, -q[1], s * q[0], y, q[1], 0.09, frame, g, 8);
        if (k) { var q0 = legAt(tiers[k - 1]); pkRod(s * q0[0], tiers[k - 1], -q0[1], s * q[0], y, q[1], 0.05, frame, g, 6); pkRod(s * q0[0], tiers[k - 1], q0[1], s * q[0], y, -q[1], 0.05, frame, g, 6); }
      });
      // the bearing block on the head of the frame
      box(0.7, 0.9, 1.3, dark, s * 1.8, HUB, 0, g, { r: 0.08 });
      var cap = cyl(0.42, 0.2, blue, s * 2.2, HUB, 0, g, 20); cap.rotation.z = Math.PI / 2;
      sphere(0.14, M.gold, s * 2.32, HUB, 0, g);
    });
    pkRod(-2.2, HUB, 0, 2.2, HUB, 0, 0.3, dark, g, 20);
    // the boarding decks either side of the slot the gondolas pass through: steps at both ends, a rail along the outside
    [-1, 1].forEach(function (s) {
      box(1.5, 0.5, 4.4, M.stone, s * 2.0, 0.25, 0, g);
      box(1.5, 0.04, 4.4, MAT.rubberMat, s * 2.0, 0.52, 0, g);
      box(0.08, 0.05, 4.4, MAT.hazard, s * 1.29, 0.53, 0, g);
      [-1, 1].forEach(function (zs) { box(1.5, 0.25, 0.4, M.stone, s * 2.0, 0.125, zs * 2.4, g); });
      for (var rp = -2; rp <= 2; rp++) pkRod(s * 2.72, 0.5, rp * 1.05, s * 2.72, 1.5, rp * 1.05, 0.03, frame, g, 6);
      pkRod(s * 2.72, 1.5, -2.1, s * 2.72, 1.5, 2.1, 0.035, blue, g, 6); pkRod(s * 2.72, 1.0, -2.1, s * 2.72, 1.0, 2.1, 0.02, frame, g, 6);
      // the tyre drive: two rubber wheels on a motor frame, pinching the rim as it passes
      [-0.75, 0.75].forEach(function (dz) {
        var ty = cyl(0.3, 0.22, M.rubber, s * (RX + 0.02), HUB - R - 0.44, dz, g, 18); ty.rotation.z = Math.PI / 2;
        var hb = cyl(0.12, 0.26, dark, s * (RX + 0.02), HUB - R - 0.44, dz, g, 10); hb.rotation.z = Math.PI / 2;
        box(0.34, 0.42, 0.42, blue, s * (RX + 0.42), HUB - R - 0.44, dz, g, { r: 0.04 });
        box(0.2, HUB - R - 1.17, 0.2, dark, s * (RX + 0.42), 0.52 + (HUB - R - 1.17) / 2, dz, g);
      });
    });
    // the drive cabinet
    box(1.2, 1.4, 0.9, blue, 3.7, 0.7, -1.9, g, { r: 0.05 });
    box(0.8, 0.5, 0.03, dark, 3.7, 0.9, -1.44, g);
    box(1.3, 0.06, 1.0, dark, 3.7, 1.43, -1.9, g);
    var wheel = pkMover(g, 0, HUB, 0);
    var R2 = R - 0.95, NB = 48;
    [-RX, RX].forEach(function (x) {
      var rim = pkRing(R, 0.13, frame, x, 0, 0, wheel, 120, false); rim.rotation.y = Math.PI / 2;
      var rim2 = pkRing(R2, 0.07, frame, x, 0, 0, wheel, 96, false); rim2.rotation.y = Math.PI / 2;
      var inner = pkRing(R * 0.5, 0.07, frame, x, 0, 0, wheel, 64, false); inner.rotation.y = Math.PI / 2;
      // the lacing between the two rings of the rim
      for (var z = 0; z < NB; z++) {
        var a0 = z / NB * Math.PI * 2, a1 = (z + 0.5) / NB * Math.PI * 2, a2 = (z + 1) / NB * Math.PI * 2;
        pkRod(x, Math.sin(a0) * R, Math.cos(a0) * R, x, Math.sin(a1) * R2, Math.cos(a1) * R2, 0.035, frame, wheel, 5);
        pkRod(x, Math.sin(a1) * R2, Math.cos(a1) * R2, x, Math.sin(a2) * R, Math.cos(a2) * R, 0.035, frame, wheel, 5);
      }
      for (var k = 0; k < 16; k++) { var sa = k / 16 * Math.PI * 2; pkRod(x, Math.sin(sa) * 1.0, Math.cos(sa) * 1.0, x, Math.sin(sa) * R, Math.cos(sa) * R, 0.055, frame, wheel, 6); }
      // the hub: a flanged drum, and on its face a painted star with a gilt boss
      var hub = cyl(1.05, 0.3, dark, x, 0, 0, wheel, 28); hub.rotation.z = Math.PI / 2;
      var sgn = x < 0 ? -1 : 1;
      var disc = cyl(1.5, 0.06, blue, x + sgn * 0.17, 0, 0, wheel, 32); disc.rotation.z = Math.PI / 2;
      for (var st = 0; st < 8; st++) {
        var sta = st / 8 * Math.PI * 2;
        var ray = new THREE.Mesh(cachedGeo('pkray', function () { var gg = new THREE.ConeGeometry(0.2, 1.3, 4); gg.translate(0, 0.65, 0); gg.scale(1, 1, 0.18); return gg; }), M.gold);
        ray.position.set(x + sgn * 0.21, Math.sin(sta) * 0.3, Math.cos(sta) * 0.3); ray.rotation.x = Math.PI / 2 - sta; wheel.add(ray);
      }
      pkBlob(0.07, 0.42, 0.42, M.gold, x + sgn * 0.2, 0, 0, wheel);
      pkRing(1.5, 0.045, M.gold, x + sgn * 0.19, 0, 0, wheel, 40, false).rotation.y = Math.PI / 2;
    });
    // what ties the two sides together: the gondola axles on the rim, and struts further in where no gondola swings
    for (var c = 0; c < 16; c++) {
      var ca = c / 16 * Math.PI * 2, cb = (c + 0.5) / 16 * Math.PI * 2;
      pkRod(-RX, Math.sin(ca) * R, Math.cos(ca) * R, RX, Math.sin(ca) * R, Math.cos(ca) * R, 0.07, dark, wheel, 8);
      pkRod(-RX, Math.sin(cb) * 6.1, Math.cos(cb) * 6.1, RX, Math.sin(cb) * 6.1, Math.cos(cb) * 6.1, 0.045, frame, wheel, 6);
      pkRod(-RX, Math.sin(ca) * R * 0.5, Math.cos(ca) * R * 0.5, RX, Math.sin(cb) * R * 0.5, Math.cos(cb) * R * 0.5, 0.04, frame, wheel, 6);
      pkRod(RX, Math.sin(ca) * R * 0.5, Math.cos(ca) * R * 0.5, -RX, Math.sin(cb) * R * 0.5, Math.cos(cb) * R * 0.5, 0.04, frame, wheel, 6);
    }
    var lights = [];
    for (var lb = 0; lb < 96; lb++) { var la = lb / 96 * Math.PI * 2; lights.push([RX + 0.15, Math.sin(la) * (R + 0.18), Math.cos(la) * (R + 0.18)]); lights.push([-RX - 0.15, Math.sin(la) * (R + 0.18), Math.cos(la) * (R + 0.18)]); }
    for (var sp = 0; sp < 16; sp++) { var spa = sp / 16 * Math.PI * 2; for (var q = 1; q <= 7; q++) { var rq = 1.5 + q * (R - 1.5) / 8; lights.push([RX + 0.07, Math.sin(spa) * rq, Math.cos(spa) * rq]); lights.push([-RX - 0.07, Math.sin(spa) * rq, Math.cos(spa) * rq]); } }
    pkBulbs(lights, M.bulb, 0.05, wheel);
    // sixteen gondolas, each kept level as the wheel turns: a round tub with a door gap, two benches, a parasol on six
    // slim posts and a hanger from the axle. Every other one carries the riders.
    var cabCols = [0xc8342a, 0xf0a020, 0xf3d36b, 0x2f9e44, 0x2f8fb3, 0x2f5fb3, 0x7a3fb3, 0xd94f8a];
    var seats = [], HANG = 1.95;
    for (var k2 = 0; k2 < 16; k2++) {
      var ang = k2 / 16 * Math.PI * 2;
      var gon = pkMover(wheel, 0, Math.sin(ang) * R, Math.cos(ang) * R);
      var car = pkMover(gon, 0, -HANG, 0);
      var col = pkCoat(cabCols[(k2 >> 1) % 8 ^ (k2 & 1 ? 4 : 0)]);
      pkLathe([[0, 0], [0.74, 0], [0.92, 0.1], [0.96, 0.3], [0.96, 0.66], [0.9, 0.7], [0.86, 0.66], [0.86, 0.16], [0, 0.16]], col, 0, 0, 0, car, 24);
      pkRing(0.93, 0.035, M.gold, 0, 0.69, 0, car, 32);
      pkRing(0.965, 0.02, M.white, 0, 0.36, 0, car, 32);
      for (var mu = 0; mu < 6; mu++) { var ma = mu / 6 * Math.PI * 2 + Math.PI / 6; pkRod(Math.sin(ma) * 0.9, 0.68, Math.cos(ma) * 0.9, Math.sin(ma) * 0.9, 1.5, Math.cos(ma) * 0.9, 0.022, M.white, car, 6); }
      pkLathe([[0, -0.04], [1.0, -0.04], [1.02, 0.02], [0.74, 0.15], [0.38, 0.28], [0, 0.34]], col, 0, 1.5, 0, car, 24);
      for (var gs = 0; gs < 6; gs++) { var ga = gs / 6 * Math.PI * 2; pkRod(Math.sin(ga) * 1.0, 1.52, Math.cos(ga) * 1.0, 0, 1.85, 0, 0.018, M.white, car, 5); }
      sphere(0.07, M.gold, 0, 1.87, 0, car);
      // the hanger: a strap each side from the axle down to the parasol's rim
      [-1, 1].forEach(function (s) { pkRod(s * 1.04, HANG, 0, s * 0.98, 1.5, 0.22, 0.03, dark, car, 6); pkRod(s * 1.04, HANG, 0, s * 0.98, 1.5, -0.22, 0.03, dark, car, 6); cyl(0.11, 0.12, dark, s * 1.04, HANG, 0, car, 10).rotation.z = Math.PI / 2; });
      box(0.3, 0.1, 1.2, M.seat, -0.58, 0.47, 0, car, { r: 0.04 }); box(0.3, 0.1, 1.2, M.seat, 0.58, 0.47, 0, car, { r: 0.04 });
      box(0.3, 0.3, 1.1, col, -0.6, 0.3, 0, car); box(0.3, 0.3, 1.1, col, 0.6, 0.3, 0, car);
      cyl(0.03, 0.55, M.brass, 0, 0.44, 0, car, 8); pkRing(0.2, 0.025, M.brass, 0, 0.72, 0, car, 16);     // the little wheel in the middle
      pkFuse(car);
      if (k2 % 2 === 0) {
        seats.push({ par: car, x: -0.5, y: 0.52 - 0.76, z: 0, ry: Math.PI / 2, guest: null, gon: gon });
        seats.push({ par: car, x: 0.5, y: 0.52 - 0.76, z: 0, ry: -Math.PI / 2, guest: null, gon: gon });
      } else gon.userData.spare = true;
      (wheel.userData.gons = wheel.userData.gons || []).push(gon);
    }
    pkFuse(wheel);
    var gons = wheel.userData.gons;
    var a = pkAttr({ id: 'ferris', name: 'Ferris wheel', x: p.x, z: p.z, qx: p.q[0], qz: p.q[1], g: g, seats: seats, board: 10, run: 45, unload: 6,
      // one slow turn per ride (about 1.3 rpm, a walking pace at the rim, as a real wheel goes), eased in and out, so every
      // cabin is back at the platform when it stops
      start: function (at) { at.extra.a0 = wheel.rotation.x; },
      tickRun: function (at, dt) {
        if (at.state === 'running') { var f = clamp(at.t / at.run, 0, 1); wheel.rotation.x = (at.extra.a0 || 0) + Math.PI * 2 * (f - Math.sin(Math.PI * 2 * f) / (Math.PI * 2)); }
        for (var i = 0; i < gons.length; i++) gons[i].rotation.x = -wheel.rotation.x;
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
      // a bonnet with a chrome flash and two headlamps, a padded seat back with a roll, and a number roundel on each flank
      pkBlob(0.6, 0.24, 0.5, body, 0, 0.7, 0.52, c);
      box(0.1, 0.03, 0.9, M.steel, 0, 0.93, 0.5, c, { r: 0.012 });
      [-1, 1].forEach(function (hs) { sphere(0.085, glowMat(0xfff4d0, 1.4), hs * 0.36, 0.72, 0.95, c); pkRing(0.09, 0.016, M.steel, hs * 0.36, 0.72, 0.95, c, 12, false); cyl(0.13, 0.02, M.white, hs * 0.685, 0.56, 0.1, c, 14).rotation.z = Math.PI / 2; });
      box(1.1, 0.5, 0.1, M.seat, 0, 0.9, -0.55, c, { r: 0.04 }); pkRod(-0.56, 1.15, -0.62, 0.56, 1.15, -0.62, 0.07, M.seat, c, 8);
      box(1.32, 0.06, 0.04, M.steel, 0, 0.68, -0.79, c);
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
  // A steel tube tower in bolted sections on a skirted plinth, four guide rails and the brake fins up its lower third, a
  // machine deck with a railing and the hoist sheaves under a pointed crown, and a ring gondola that wraps the tower:
  // eight outward-facing seats in pairs, each with its over-the-shoulder harness.
  function pkBuildDropTower(p, open) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(p.x, 0, p.z); scene.add(g);
    var H = 30, body = pkPaint(0x39424e, 0.45, 0.35), cream = pkPaint(0xece6d6, 0.45, 0.2), red = pkGloss(0xc8342a), dark = MAT.steelDark, k, ang;
    pkPrism(4.3, 0.24, 8, M.stoneDark, 0, 0.12, 0, g);
    pkPrism(3.7, 0.6, 8, M.stone, 0, 0.3, 0, g);
    box(4.6, 0.04, 4.6, MAT.rubberMat, 0, 0.62, 0, g);
    // the plinth: a skirt round the foot of the tower, with an access door and a row of bolts
    pkPrism(1.85, 1.0, 8, body, 0, 1.1, 0, g, 1.5);
    pkRing(1.52, 0.05, M.gold, 0, 1.6, 0, g, 32);
    box(0.7, 0.8, 0.06, dark, 0, 1.05, -1.6, g);
    // the tower: ten sections with a flange at every joint; the top third is painted light, with a red band under it
    var mast = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, H, 28), body); mast.position.y = H / 2; mast.castShadow = true; g.add(mast);
    for (k = 1; k <= 10; k++) pkPrism(1.07, 0.14, 28, dark, 0, k * 3, 0, g);
    pkPrism(1.02, 9.0, 28, cream, 0, 25.5, 0, g);
    pkPrism(1.03, 1.2, 28, red, 0, 20.4, 0, g);
    pkRing(1.05, 0.04, M.gold, 0, 19.8, 0, g, 32); pkRing(1.05, 0.04, M.gold, 0, 21.0, 0, g, 32);
    var copper = std({ color: 0xb8733a, roughness: 0.35, metalness: 0.85 });
    for (k = 0; k < 4; k++) {
      ang = k * Math.PI / 2 + Math.PI / 4;
      // a guide rail, with its stand-offs
      var rail = box(0.16, H - 2.2, 0.2, dark, Math.cos(ang) * 1.12, (H - 2.2) / 2 + 1.7, Math.sin(ang) * 1.12, g); rail.rotation.y = -ang;
      // the brakes: a row of copper fins the carriage's magnets run past on the way down
      var a2 = k * Math.PI / 2;
      var fin = box(0.24, 8.0, 0.03, copper, Math.cos(a2) * 1.1, 6.2, Math.sin(a2) * 1.1, g); fin.rotation.y = -a2;
      // the hoist rope, from its sheave down the tower
      pkRod(Math.cos(a2) * 1.24, 2.4, Math.sin(a2) * 1.24, Math.cos(a2) * 1.24, H + 0.6, Math.sin(a2) * 1.24, 0.016, M.iron, g, 5);
      var sh = cyl(0.42, 0.1, dark, Math.cos(a2) * 1.3, H + 0.75, Math.sin(a2) * 1.3, g, 18); sh.rotation.order = 'YXZ'; sh.rotation.y = -a2; sh.rotation.x = Math.PI / 2;
    }
    // the machine deck and its railing, the machine house, and the crown
    pkPrism(2.5, 0.18, 24, dark, 0, H + 0.09, 0, g);
    for (k = 0; k < 16; k++) { ang = k / 16 * Math.PI * 2; pkRod(Math.cos(ang) * 2.42, H + 0.18, Math.sin(ang) * 2.42, Math.cos(ang) * 2.42, H + 1.2, Math.sin(ang) * 2.42, 0.025, dark, g, 5); }
    pkRing(2.42, 0.03, M.gold, 0, H + 1.2, 0, g, 40); pkRing(2.42, 0.02, dark, 0, H + 0.7, 0, g, 40);
    pkPrism(1.55, 2.3, 12, body, 0, H + 1.33, 0, g);
    for (k = 0; k < 6; k++) { ang = k / 6 * Math.PI * 2 + 0.26; var lv = box(0.6, 0.7, 0.04, dark, Math.cos(ang) * 1.5, H + 1.5, Math.sin(ang) * 1.5, g); lv.rotation.y = Math.PI / 2 - ang; }
    pkLathe([[0, 0], [1.95, 0], [1.9, 0.14], [1.2, 0.8], [0.5, 1.6], [0.16, 2.3], [0, 2.36]], red, 0, H + 2.48, 0, g, 24);
    pkRing(1.93, 0.05, M.gold, 0, H + 2.5, 0, g, 40);
    sphere(0.2, M.gold, 0, H + 4.9, 0, g);
    pkRod(0, H + 5.0, 0, 0, H + 7.2, 0, 0.035, M.iron, g, 6);
    sphere(0.14, glowMat(0xff2a1a, 2.0), 0, H + 7.25, 0, g);
    var tb = [];
    for (var t = 0; t < 36; t++) { var tA = t / 36 * Math.PI * 2; tb.push([Math.cos(tA) * 1.98, H + 2.42, Math.sin(tA) * 1.98]); tb.push([Math.cos(tA) * 2.56, H + 0.09, Math.sin(tA) * 2.56]); }
    for (k = 0; k < 4; k++) { ang = k * Math.PI / 2 + Math.PI / 4; for (var by = 22; by < 30; by += 0.8) tb.push([Math.cos(ang) * 1.24, by, Math.sin(ang) * 1.24]); }
    pkBulbs(tb, M.bulb, 0.06, g);
    // the carriage: a collar round the tower on roller bogies, a ring, and eight seats facing out
    var car = pkMover(g, 0, 2.2, 0);
    pkPrism(1.4, 0.9, 24, dark, 0, 0.1, 0, car);
    pkRing(1.42, 0.06, red, 0, 0.55, 0, car, 36); pkRing(1.42, 0.06, red, 0, -0.35, 0, car, 36);
    for (k = 0; k < 4; k++) {
      ang = k * Math.PI / 2 + Math.PI / 4;
      var bog = box(0.42, 0.5, 0.34, body, Math.cos(ang) * 1.36, 0.8, Math.sin(ang) * 1.36, car, { r: 0.04 }); bog.rotation.y = -ang;
      [0.68, 0.92].forEach(function (wy) { var w = cyl(0.11, 0.3, M.rubber, Math.cos(ang) * 1.3, wy, Math.sin(ang) * 1.3, car, 10); w.rotation.order = 'YXZ'; w.rotation.y = -ang; w.rotation.x = Math.PI / 2; });
    }
    pkRing(2.25, 0.3, red, 0, 0, 0, car, 48);
    pkRing(2.25, 0.05, M.gold, 0, 0.3, 0, car, 48);
    var ub = []; for (k = 0; k < 32; k++) { ang = k / 32 * Math.PI * 2; ub.push([Math.cos(ang) * 2.25, -0.31, Math.sin(ang) * 2.25]); }
    pkBulbs(ub, M.bulb, 0.05, car);
    var seats = [], shell = pkPaint(0x2b3038, 0.5, 0.3);
    for (var i = 0; i < 8; i++) {
      var a0 = i / 8 * Math.PI * 2 + Math.PI / 8, sx = Math.cos(a0) * 2.62, sz = Math.sin(a0) * 2.62, ry = Math.atan2(Math.cos(a0), Math.sin(a0));
      pkRod(Math.cos(a0) * 1.38, 0, Math.sin(a0) * 1.38, Math.cos(a0) * 2.1, 0, Math.sin(a0) * 2.1, 0.11, dark, car, 8);
      pkRod(Math.cos(a0) * 1.38, 0.5, Math.sin(a0) * 1.38, Math.cos(a0) * 2.2, 0.12, Math.sin(a0) * 2.2, 0.05, dark, car, 6);
      var sg = new THREE.Group(); sg.position.set(sx, 0.2, sz); sg.rotation.y = ry; car.add(sg);
      // a moulded seat: a shell behind, a pad, a tall back with side wings and a headrest
      box(0.78, 1.5, 0.08, shell, 0, 0.72, -0.37, sg, { r: 0.04 });
      box(0.6, 0.14, 0.52, M.seat, 0, 0.1, 0.0, sg, { r: 0.05 });
      box(0.6, 1.05, 0.12, M.seat, 0, 0.68, -0.28, sg, { r: 0.05 });
      [-1, 1].forEach(function (s) { box(0.08, 0.34, 0.5, shell, s * 0.35, 0.2, -0.04, sg, { r: 0.03 }); box(0.07, 0.5, 0.2, shell, s * 0.36, 1.0, -0.22, sg, { r: 0.03 }); });
      box(0.34, 0.28, 0.12, M.seat, 0, 1.32, -0.26, sg, { r: 0.05 });
      box(0.78, 0.1, 0.1, red, 0, 1.5, -0.37, sg, { r: 0.03 });
      box(0.5, 0.06, 0.26, dark, 0, -0.34, 0.32, sg); pkRod(-0.2, -0.02, 0.1, -0.2, -0.34, 0.3, 0.025, dark, sg, 5); pkRod(0.2, -0.02, 0.1, 0.2, -0.34, 0.3, 0.025, dark, sg, 5);   // the footrest
      var hn = pkMover(sg, 0, 1.15, -0.2);
      pkTube([[-0.2, 0, 0.02], [-0.24, -0.25, 0.26], [-0.18, -0.62, 0.34], [0.18, -0.62, 0.34], [0.24, -0.25, 0.26], [0.2, 0, 0.02]], 0.045, dark, hn, false, 24, 8);
      box(0.14, 0.32, 0.14, red, -0.22, -0.18, 0.2, hn, { r: 0.05 }); box(0.14, 0.32, 0.14, red, 0.22, -0.18, 0.2, hn, { r: 0.05 });
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
  // A double-drop chute: out of the dock the belt lifts the log eleven metres up the west of the course, through the
  // lift house on the crest and down the long chute into the first splash pool; the channel turns east, climbs a second,
  // shorter lift through the rock and drops again beside a mill race, then runs home along the east side and round the
  // north end of the station. The order round the lap is the order of this list; the boats ride a smooth line through it.
  var PK_FLUME_PTS = [
    [0, 0.25, 10.5], [0, 0.25, 6], [0, 0.3, 1.5],                                              // the dock
    [0, 1.2, -1.2], [0, 4.6, -4.2], [0, 8.2, -7.2], [0, 10.8, -10.4],                          // the belt lift
    [0, 11.2, -13.4],                                                                          // the crest
    [0, 9.6, -15.6], [0, 5.2, -17.6], [0, 1.2, -19.0],                                         // the long chute
    [0.8, 0.5, -21.6], [2.8, 0.35, -23.6], [5.2, 0.35, -24.8], [6.9, 0.6, -22.6],               // the turn out of the pool
    [7.2, 1.6, -18.8], [7.2, 3.4, -14.8], [7.1, 3.8, -11.2],                                   // the second lift (through the tunnel)
    [7.0, 2.6, -8.6], [6.9, 0.7, -6.4],                                                        // the second drop
    [6.6, 0.35, -3.4], [6.2, 0.3, 1.0], [5.8, 0.28, 5.6], [5.4, 0.27, 9.2], [4.1, 0.26, 11.7], [2.2, 0.25, 12.75], [0.6, 0.25, 12.3]   // home round the house
  ];
  function pkBuildFlume(p, open) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(p.x, 0, p.z); scene.add(g);
    var PTS = PK_FLUME_PTS, i, k;
    var curve = new THREE.CatmullRomCurve3(PTS.map(function (q) { return new THREE.Vector3(q[0], q[1], q[2]); }), true, 'centripetal');
    curve.arcLengthDivisions = 900;
    var total = curve.getLength(), NS = 280, P = curve.getSpacedPoints(NS), step = total / NS;
    var T = []; for (i = 0; i <= NS; i++) T.push(curve.getTangentAt(i / NS));
    var sideOf = function (i) { var t = T[i], l = Math.sqrt(t.x * t.x + t.z * t.z) || 1; return [t.z / l, -t.x / l]; };
    // the channel: a planked timber trough with a steel lip, lined in sea-green glass fibre, on steel hoops
    var timber = std({ map: M.clap.map, color: 0x8f6a48, roughness: 0.9, side: THREE.DoubleSide });
    var liner = std({ color: 0x5f97a3, roughness: 0.45, metalness: 0.05, side: THREE.DoubleSide });
    var beam = std({ color: 0x5c4630, roughness: 0.9 }), lip = MAT.steelDark;
    pkSweep([[-1.08, 0.72], [-1.24, 0.72], [-1.24, -0.3], [1.24, -0.3], [1.24, 0.72], [1.08, 0.72]], P, timber, g, true, 0.8);
    pkSweep([[-1.08, 0.72], [-1.0, -0.08], [1.0, -0.08], [1.08, 0.72]], P, liner, g, true);
    pkSweep([[-1.06, 0.72], [-1.06, 0.78], [-1.27, 0.78], [-1.27, 0.7]], P, lip, g, true);
    pkSweep([[1.06, 0.72], [1.06, 0.78], [1.27, 0.78], [1.27, 0.7]], P, lip, g, true);
    var water = pkSweep([[-1.01, 0.14], [1.01, 0.14]], P, M.water, g, true, 1 / 3); water.castShadow = false;
    // the lifts: where the line climbs, a ribbed belt carries the log and (on the big lift) a catwalk runs up beside it
    var lifts = [], cur = null;
    for (i = 0; i <= NS; i++) { if (T[i].y > 0.2) { if (!cur) lifts.push(cur = [i, i]); cur[1] = i; } else cur = null; }
    var belt = std({ color: 0x1c1d1f, roughness: 0.95, side: THREE.DoubleSide }), cat = {};
    lifts.forEach(function (L) {
      var seg = P.slice(Math.max(0, L[0] - 2), L[1] + 3);
      pkSweep([[-0.72, 0.19], [0.72, 0.19]], seg, belt, g, false).castShadow = false;
      for (var c = L[0]; c <= L[1]; c += 2) { var cs = sideOf(c), cl = box(1.44, 0.05, 0.07, lip, P[c].x, P[c].y + 0.21, P[c].z, g); cl.rotation.order = 'YXZ'; cl.rotation.y = Math.atan2(T[c].x, T[c].z); cl.rotation.x = -Math.asin(T[c].y); }
      if (P[L[1]].y < 6) return;
      for (var c2 = L[0] - 1; c2 <= L[1] + 4; c2++) cat[c2] = true;
      var cw = P.slice(L[0] - 1, L[1] + 5);
      pkSweep([[1.28, -0.22], [2.12, -0.22], [2.12, -0.3], [1.28, -0.3], [1.28, -0.22]], cw, timber, g, false, 0.8);
      pkSweep([[2.09, 0.8], [2.15, 0.8], [2.15, 0.86], [2.09, 0.86], [2.09, 0.8]], cw, lip, g, false);
      pkSweep([[2.1, 0.3], [2.14, 0.3], [2.14, 0.34], [2.1, 0.34], [2.1, 0.3]], cw, lip, g, false);
      for (var c3 = L[0] - 1; c3 <= L[1] + 4; c3 += 3) { var s3 = sideOf(c3), q3 = P[c3]; pkRod(q3.x + s3[0] * 2.12, q3.y - 0.26, q3.z + s3[1] * 2.12, q3.x + s3[0] * 2.12, q3.y + 0.84, q3.z + s3[1] * 2.12, 0.025, lip, g, 5); }
      for (var c4 = L[0]; c4 <= L[1] + 3; c4++) { var tr = box(0.84, 0.04, 0.1, beam, P[c4].x + sideOf(c4)[0] * 1.7, P[c4].y - 0.2, P[c4].z + sideOf(c4)[1] * 1.7, g); tr.rotation.y = Math.atan2(T[c4].x, T[c4].z); }   // the treads
    });
    // the hoops round the trough, the cradles under the low runs and the trestle bents under everything raised: two raked
    // posts and a cap, cross-braced in tiers, with a girt and a diagonal from each bent to the next
    var every = Math.max(1, Math.round(2.5 / step)), prev = null;
    for (i = 0; i < NS; i += every) {
      var q = P[i], s = sideOf(i), yaw = Math.atan2(T[i].x, T[i].z), pit = -Math.asin(T[i].y);
      var hoop = new THREE.Group(); hoop.position.copy(q); hoop.rotation.order = 'YXZ'; hoop.rotation.y = yaw; hoop.rotation.x = pit; g.add(hoop);
      box(2.62, 0.09, 0.14, lip, 0, -0.35, 0, hoop); box(0.09, 1.1, 0.14, lip, -1.29, 0.2, 0, hoop); box(0.09, 1.1, 0.14, lip, 1.29, 0.2, 0, hoop);
      var by = q.y - 0.4;
      if (by < 1.1) {
        if (by > 0.12) { var cr = box(2.9, by, 0.34, M.stoneDark, q.x, by / 2, q.z, g); cr.rotation.y = yaw; }
        solid(p.x + q.x - 1.35, p.x + q.x + 1.35, p.z + q.z - 1.35, p.z + q.z + 1.35, 0, 1.2);
        prev = null; continue;
      }
      var wl = cat[i] ? 2.2 : 1.12, wr = -1.12, rake = Math.min(0.9, by * 0.07);
      var top = [[q.x + s[0] * wl, by, q.z + s[1] * wl], [q.x + s[0] * wr, by, q.z + s[1] * wr]];
      var foot = [[q.x + s[0] * (wl + rake), 0, q.z + s[1] * (wl + rake)], [q.x + s[0] * (wr - rake), 0, q.z + s[1] * (wr - rake)]];
      var at = function (e, f) { return [foot[e][0] + (top[e][0] - foot[e][0]) * f, by * f, foot[e][2] + (top[e][2] - foot[e][2]) * f]; };
      [0, 1].forEach(function (e) {
        pkRod(foot[e][0], 0, foot[e][2], top[e][0], by, top[e][2], 0.15, beam, g, 6);
        box(0.6, 0.3, 0.6, M.stoneDark, foot[e][0], 0.15, foot[e][2], g);
        solid(p.x + foot[e][0] - 0.25, p.x + foot[e][0] + 0.25, p.z + foot[e][2] - 0.25, p.z + foot[e][2] + 0.25, 0, Math.min(by, 3));
      });
      var capb = box(wl - wr + 0.5, 0.24, 0.26, beam, q.x + s[0] * (wl + wr) / 2, by - 0.02, q.z + s[1] * (wl + wr) / 2, g); capb.rotation.y = yaw;
      var nt = Math.max(1, Math.round(by / 3.2));
      for (k = 0; k < nt; k++) {
        var f0 = k / nt, f1 = (k + 1) / nt, A0 = at(0, f0 + 0.04), A1 = at(0, f1 - 0.04), B0 = at(1, f0 + 0.04), B1 = at(1, f1 - 0.04);
        if (by > 2.2) { pkRod(A0[0], A0[1], A0[2], B1[0], B1[1], B1[2], 0.055, beam, g, 5); pkRod(B0[0], B0[1], B0[2], A1[0], A1[1], A1[2], 0.055, beam, g, 5); }
        if (k) pkRod(A0[0], A0[1], A0[2], B0[0], B0[1], B0[2], 0.07, beam, g, 5);
      }
      if (prev) [0, 1].forEach(function (e) {
        var a1 = prev.at(e, 0.5), b1 = at(e, prev.by * 0.5 / by), b2 = at(e, 0.96);
        pkRod(a1[0], a1[1], a1[2], b1[0], b1[1], b1[2], 0.07, beam, g, 5);
        pkRod(a1[0], a1[1], a1[2], b2[0], b2[1], b2[2], 0.05, beam, g, 5);
      });
      prev = { at: at, by: by };
    }
    // the lift house on the crest: a boarded shed astride the channel on its own braced timber tower, the log running
    // in at one gable and out over the drop at the other
    var iTop = 0; for (i = 1; i < NS; i++) if (P[i].y > P[iTop].y) iTop = i;
    var hx = P[iTop].x, hz = P[iTop].z + 0.6, hy = P[iTop].y - 0.75, shed = std({ map: M.clap.map, color: 0xa5825c, roughness: 0.9 });
    var HW0 = -2.45, HW1 = 1.75, HL = 2.1;                       // the shed's two side walls (the catwalk lands inside the west one) and half its length
    [HW0, HW1].forEach(function (wx) {
      box(0.14, 3.0, HL * 2, shed, hx + wx, hy + 1.5, hz, g);
      box(0.2, 0.16, HL * 2 + 0.2, beam, hx + wx, hy + 0.05, hz, g); box(0.2, 0.16, HL * 2 + 0.2, beam, hx + wx, hy + 3.0, hz, g);
      var wsg = wx < 0 ? -1 : 1;
      box(0.06, 0.8, 1.0, M.pane, hx + wx + wsg * 0.06, hy + 1.9, hz, g);
      box(0.08, 0.08, 1.2, beam, hx + wx + wsg * 0.08, hy + 2.34, hz, g); box(0.08, 0.08, 1.2, beam, hx + wx + wsg * 0.08, hy + 1.46, hz, g);
      [-1, 1].forEach(function (zs) {
        var px = hx + wx, pz = hz + zs * HL;
        pkRod(px + wsg * 0.5, 0, pz + zs * 0.4, px, hy + 3.0, pz, 0.19, beam, g, 6);
        box(0.8, 0.36, 0.8, M.stoneDark, px + wsg * 0.5, 0.18, pz + zs * 0.4, g);
        solid(p.x + px + wsg * 0.5 - 0.3, p.x + px + wsg * 0.5 + 0.3, p.z + pz + zs * 0.4 - 0.3, p.z + pz + zs * 0.4 + 0.3, 0, 3);
      });
      // the tower's long faces, braced in three tiers
      for (k = 0; k < 3; k++) {
        var y0 = 0.4 + k * (hy - 0.4) / 3, y1 = 0.4 + (k + 1) * (hy - 0.4) / 3, o0 = 0.5 * (1 - y0 / (hy + 3)), o1 = 0.5 * (1 - y1 / (hy + 3));
        pkRod(hx + wx + wsg * o0, y0, hz - HL - 0.4 * (1 - y0 / (hy + 3)), hx + wx + wsg * o1, y1, hz + HL + 0.4 * (1 - y1 / (hy + 3)), 0.06, beam, g, 5);
        pkRod(hx + wx + wsg * o0, y0, hz + HL + 0.4 * (1 - y0 / (hy + 3)), hx + wx + wsg * o1, y1, hz - HL - 0.4 * (1 - y1 / (hy + 3)), 0.06, beam, g, 5);
        pkRod(hx + wx + wsg * o1, y1, hz - HL - 0.4 * (1 - y1 / (hy + 3)), hx + wx + wsg * o1, y1, hz + HL + 0.4 * (1 - y1 / (hy + 3)), 0.08, beam, g, 5);
      }
    });
    [-1, 1].forEach(function (zs) { box(HW1 - HW0, 0.2, 0.2, beam, hx + (HW0 + HW1) / 2, hy + 0.05, hz + zs * HL, g); box(HW1 - HW0, 0.2, 0.2, beam, hx + (HW0 + HW1) / 2, hy + 3.0, hz + zs * HL, g); });
    box(1.1, 0.1, HL * 2, beam, hx - 1.85, hy + 0.5, hz, g);     // the landing inside, at the head of the catwalk
    var hroof = pkGableRoof(HL * 2 + 0.5, HW1 - HW0 + 0.3, 1.5, M.slate, shed, hx + (HW0 + HW1) / 2, hy + 3.08, hz, g, 0.4); hroof.rotation.y = Math.PI / 2;
    sign(['LOG LIFT'], 2.2, 0.5, hx + (HW0 + HW1) / 2, hy + 3.7, hz + HL + 0.32, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);
    // ── The two splash pools ────────────────────────────────────────
    // Each chute throws the log into a stone basin with a dressed coping. The first is the big one under the eleven-metre
    // drop; the second, smaller, sits under the short chute by the mill race.
    var pools = [{ x: 0, z: -20.4, w: 8.6, d: 6.6 }, { x: 6.8, z: -5.2, w: 5.6, d: 4.6 }], waters = [water];
    pools.forEach(function (Pl) {
      [[Pl.x, Pl.z - Pl.d / 2, Pl.w + 0.5, 0.5], [Pl.x, Pl.z + Pl.d / 2, Pl.w + 0.5, 0.5], [Pl.x - Pl.w / 2, Pl.z, 0.5, Pl.d - 0.5], [Pl.x + Pl.w / 2, Pl.z, 0.5, Pl.d - 0.5]].forEach(function (w) {
        box(w[2], 0.6, w[3], M.stoneDark, w[0], 0.3, w[1], g);
        box(w[2] + 0.16, 0.12, w[3] + 0.16, M.stone, w[0], 0.66, w[1], g);
      });
      var pl = new THREE.Mesh(new THREE.PlaneGeometry(Pl.w - 0.5, Pl.d - 0.5), M.water);
      pl.rotation.x = -Math.PI / 2; pl.position.set(Pl.x, 0.42, Pl.z); g.add(pl); waters.push(pl);
    });
    // the rock gorge round the first pool
    for (var rk = 0; rk < 18; rk++) {
      var rs = randf(0.5, 1.15), side = rk % 2 ? 1 : -1;
      pkBoulder(pools[0].x + side * randf(4.2, 5.8), pools[0].z + randf(-3.4, 3.4), rs, g);
    }
    for (var rk2 = 0; rk2 < 6; rk2++) pkBoulder(pools[0].x + randf(-3.6, 3.6), pools[0].z - 4.2 - randf(0, 0.8), randf(0.7, 1.3), g);
    // the tunnel on the second lift: an outcrop of piled rock, the channel running through a dark bore in it
    var tA = null, tB = null;
    for (i = 0; i <= NS; i++) if (P[i].x > 5 && T[i].z > 0.5 && P[i].z > -18.6 && P[i].z < -12.2) { if (!tA) tA = P[i]; tB = P[i]; }
    if (tA && tB) {
      var bd = new THREE.Vector3().subVectors(tB, tA), bl = bd.length();
      var bore = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.75, bl, 16, 1, true), std({ color: 0x24231f, roughness: 1, side: THREE.DoubleSide }));
      bore.position.set((tA.x + tB.x) / 2, (tA.y + tB.y) / 2 + 0.7, (tA.z + tB.z) / 2); bore.quaternion.setFromUnitVectors(PK_UP, bd.normalize()); g.add(bore);
      var rock = function (x, y, z, r) { var b = pkBoulder(x, z, r, g, 0); b.position.y = y; return b; };
      for (k = 0; k < 7; k++) {
        var f = k / 6, cx = tA.x + (tB.x - tA.x) * f, cy = tA.y + (tB.y - tA.y) * f + 0.7, cz = tA.z + (tB.z - tA.z) * f;
        [-1, 1].forEach(function (sd) {
          rock(cx + sd * randf(3.3, 3.7), 1.0, cz + randf(-0.3, 0.3), randf(3.2, 3.8));
          rock(cx + sd * randf(2.7, 3.0), cy + 0.2, cz + randf(-0.3, 0.3), randf(2.8, 3.3));
          rock(cx + sd * randf(1.5, 1.9), cy + 1.7, cz + randf(-0.3, 0.3), randf(2.6, 3.0));
        });
        rock(cx + randf(-0.3, 0.3), cy + 2.5, cz, randf(2.6, 3.0));
      }
      solid(p.x + tA.x - 4.2, p.x + tA.x - 1.4, p.z + tA.z, p.z + tB.z, 0, 4); solid(p.x + tA.x + 1.4, p.x + tA.x + 4.2, p.z + tA.z, p.z + tB.z, 0, 4);
    }
    // the station deck along the dock; the mill house below is its walls and roof
    var lane = p.x < 0 ? 1 : -1;
    box(5.0, 0.12, 10.5, MAT.wood, lane * 3.95, 0.06, 7.0, g);
    pkRailRun(p.x + lane * 6.45, p.z + 1.8, p.x + lane * 6.45, p.z + 6.3, { solid: true });
    pkRailRun(p.x + lane * 6.45, p.z + 9.8, p.x + lane * 6.45, p.z + 12.2, { solid: true });
    // the boats: logs hollowed out for two, a rounded prow, cut ends showing the rings, padded seats with backs, rubbing
    // wheels on the flanks and a lap bar
    var bark2 = std({ map: M.bark.map, roughness: 1, side: THREE.DoubleSide }), heart = std({ color: 0xc79a62, roughness: 0.8, side: THREE.DoubleSide }), ringM = std({ color: 0x8a6238, roughness: 0.85 });
    var boats = [], seats = [];
    for (var b = 0; b < 3; b++) {
      var bt = pkMover(g, 0, 0, 0);
      var hull = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 2.6, 20, 1, true, -0.74 * Math.PI, 1.48 * Math.PI), bark2); hull.rotation.x = Math.PI / 2; hull.position.y = 0.62; hull.castShadow = true; bt.add(hull);
      var inn = new THREE.Mesh(new THREE.CylinderGeometry(0.57, 0.57, 2.6, 20, 1, true, -0.74 * Math.PI, 1.48 * Math.PI), heart); inn.rotation.x = Math.PI / 2; inn.position.y = 0.62; bt.add(inn);
      [-1, 1].forEach(function (sd) { box(0.075, 0.05, 2.6, heart, sd * 0.56, 1.065, 0, bt); });                    // the cut edge of the hollow
      // the prow and the stern: solid lengths of log, the prow tapered, each cut end with its rings
      var prow = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.64, 0.5, 20), bark2); prow.rotation.x = Math.PI / 2; prow.position.set(0, 0.62, 1.55); prow.castShadow = true; bt.add(prow);
      var stern = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.6, 0.3, 20), bark2); stern.rotation.x = Math.PI / 2; stern.position.set(0, 0.62, -1.45); stern.castShadow = true; bt.add(stern);
      [[1.805, 0.4, 0], [-1.605, 0.6, Math.PI]].forEach(function (e) {
        var c0 = new THREE.Mesh(new THREE.CircleGeometry(e[1], 20), heart); c0.position.set(0, 0.62, e[0]); c0.rotation.y = e[2]; bt.add(c0);
        [0.3, 0.62].forEach(function (rf) { var rg = new THREE.Mesh(new THREE.TorusGeometry(e[1] * rf, 0.012, 4, 20), ringM); rg.position.set(0, 0.62, e[0]); bt.add(rg); });
      });
      box(1.04, 0.06, 2.5, ringM, 0, 0.3, 0, bt);                                                                   // the floor
      [0.45, -0.7].forEach(function (sz) {
        box(0.98, 0.1, 0.4, M.seat, 0, 0.56, sz, bt, { r: 0.04 });
        var bk = box(0.98, 0.5, 0.08, M.seat, 0, 0.8, sz - 0.24, bt, { r: 0.03 }); bk.rotation.x = -0.14;
      });
      box(1.0, 0.36, 0.06, ringM, 0, 0.72, 1.24, bt);                                                               // the dash board
      pkRod(-0.3, 0.86, 1.2, 0.3, 0.86, 1.2, 0.022, MAT.steelDark, bt, 6);
      [-1, 1].forEach(function (sd) { [0.95, -0.95].forEach(function (wz) { cyl(0.1, 0.07, M.rubber, sd * 0.66, 0.5, wz, bt, 10); }); });
      var bar = pkMover(bt, 0, 0.9, 0.12);
      pkTube([[-0.42, 0, 0], [-0.4, -0.05, 0.3], [0.4, -0.05, 0.3], [0.42, 0, 0]], 0.035, MAT.steelDark, bar, false, 16, 6);
      pkFuse(bt);
      seats.push({ par: bt, x: -0.26, y: 0.6 - 0.76, z: 0.42, ry: 0, guest: null, boat: bt });
      seats.push({ par: bt, x: 0.26, y: 0.6 - 0.76, z: 0.42, ry: 0, guest: null, boat: bt });
      boats.push({ g: bt, u0: b * 3.5 / total, u: b * 3.5 / total, bar: bar });
    }
    var _bp = new THREE.Vector3(), _btn = new THREE.Vector3();
    function placeBoat(bt, u) {
      var f = ((u % 1) + 1) % 1;
      curve.getPointAt(f, _bp); curve.getTangentAt(f, _btn);
      bt.g.position.set(_bp.x, _bp.y - 0.12, _bp.z);
      bt.g.rotation.order = 'YXZ'; bt.g.rotation.y = Math.atan2(_btn.x, _btn.z); bt.g.rotation.x = -Math.asin(clamp(_btn.y, -1, 1));
    }
    boats.forEach(function (bt) { placeBoat(bt, bt.u); });
    // the dock's edge: a station gate at each boat's berth (hung once the ride has its controls, below) and a rail between
    var dockX = lane * 1.5, gw = 1.8, berths = boats.map(function (bt) { return clamp(bt.g.position.z, 2.8, 11.2); }).sort(function (q1, q2) { return q1 - q2; });
    var railFrom = 1.8;
    berths.concat([12.2 + gw / 2 + 0.06]).forEach(function (gzz) { var z1 = gzz - gw / 2 - 0.06; if (z1 - railFrom > 0.3) pkRailRun(p.x + dockX, p.z + railFrom, p.x + dockX, p.z + z1, { solid: true }); railFrom = gzz + gw / 2 + 0.06; });
    // where each chute meets its pool, as a fraction of the lap: the boats throw up a splash when they cross one
    var splashes = [];
    [10, 19].forEach(function (vi) {
      var best = 0, bd2 = 1e9;
      for (var c = 0; c < NS; c++) { var d2 = Math.pow(P[c].x - PTS[vi][0], 2) + Math.pow(P[c].y - PTS[vi][1], 2) + Math.pow(P[c].z - PTS[vi][2], 2); if (d2 < bd2) { bd2 = d2; best = c; } }
      splashes.push({ u: best / NS, x: p.x + PTS[vi][0], z: p.z + PTS[vi][2] });
    });
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
