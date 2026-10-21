//@ Park Co, part 19: arrivals - guests come by car: off the road, up the drive, into a free bay; out of the car to the ticket windows, and home the same way
  // ── Why ──────────────────────────────────────────────────────────
  // A park's day starts in its car park. A family drives in off the road, the barrier lifts, they find a free bay, get out
  // and walk up to the ticket windows; at the end of their day they walk back, get in, back out and drive away. The lot fills
  // through the morning and empties at closing. The cars are the game's own (the engine's road network wanders at random);
  // each follows a path laid from waypoints, and waits for the car in front.
  // The lot: rank A (z 53..58, noses north) and rank B (z 66..71, noses south), 22 bays a rank, 2.75 m wide, either side of an
  // aisle along z 62. Rank A's bay 11 is the walkway to the gate; rank B's bays 10 and 11 are the drive, and 9 and 12 beside it
  // stay empty (no car could turn into them off the drive). The traffic keeps
  // left, as on the road: up the drive on x -1.4, down it on x +1.4; along the aisle west on z 63.4, east on z 60.6.
  var PK_BAY_X0 = -28.875, PK_BAY_W = 2.75, PK_AISLE_W = 63.4, PK_AISLE_E = 60.6, PK_DRIVE_IN = -1.4, PK_DRIVE_OUT = 1.4;
  var PK_LOT = { bays: [], cars: [], boom: null, boomT: 0, spawnT: 1, seq: 0 };
  function pkLotBays() {
    if (PK_LOT.bays.length) return PK_LOT.bays;
    for (var i = 0; i < 22; i++) {
      var x = PK_BAY_X0 + i * PK_BAY_W;
      if (i !== 11) PK_LOT.bays.push({ x: x, z: 55.5, front: 53.0, mouth: 58.6, yaw: Math.PI / 2, car: null });     // rank A
      if (i < 9 || i > 12) PK_LOT.bays.push({ x: x, z: 68.5, front: 71.0, mouth: 65.4, yaw: -Math.PI / 2, car: null });   // rank B
    }
    return PK_LOT.bays;
  }
  // the barrier across the drive: a boom on a pivot that lifts while a car is close
  function pkLotBarrier() {
    var g = new THREE.Group(); g.position.set(-5.5, 1.05, 72.6); scene.add(g); g.userData.dynamic = true;
    box(11, 0.12, 0.12, MAT.whiteLine, 5.5, 0, 0, g);
    for (var k = 0; k < 5; k++) box(0.5, 0.125, 0.125, MAT.red, 1.2 + k * 2.1, 0, 0, g);
    PK_LOT.boom = g;
  }
  // a path through waypoints, sampled by distance; rev marks a stretch driven backwards
  function pkLotPath(pts) {
    var c = new THREE.CatmullRomCurve3(pts.map(function (p) { return new THREE.Vector3(p[0], 0, p[1]); }), false, 'centripetal');
    return { c: c, len: c.getLength() };
  }
  // a straight run along the aisle from a to b, dropped where the bay is too close to the drive for it (the turn takes it all)
  function pkLotAisle(a, b, dir) { return (b[0] - a[0]) * dir > 0.5 ? [a, b] : []; }
  function pkLotIn(bay, fromEast) {
    var sx = bay.x < PK_DRIVE_IN ? -1 : 1, lane = sx < 0 ? PK_AISLE_W : PK_AISLE_E, nose = bay.yaw === Math.PI / 2 ? -1 : 1;
    var road = fromEast ? [[95, 77.5], [12, 77.5], [4, 77.2], [0.2, 75.6]] : [[-95, 74.5], [-8, 74.5], [-3.4, 74.2]];
    return road.concat([[PK_DRIVE_IN, 72.4], [PK_DRIVE_IN, 67.0]], pkLotAisle([PK_DRIVE_IN + sx * 2.6, lane], [bay.x - sx * 3.6, lane], sx),
      [[bay.x - sx * 1.3, (lane + bay.mouth) / 2], [bay.x, bay.mouth + nose * 0.8], [bay.x, bay.z]]);
  }
  function pkLotOut(bay, toEast) {
    var sx = bay.x < PK_DRIVE_OUT ? -1 : 1, lane = sx < 0 ? PK_AISLE_E : PK_AISLE_W, nose = bay.yaw === Math.PI / 2 ? -1 : 1;
    // back out across the aisle with the tail swinging away from the drive, so the car ends up facing the way out
    var back = [[bay.x, bay.z], [bay.x, bay.mouth - nose * 0.6], [bay.x + sx * 1.6, lane]];
    var fwd = [[bay.x + sx * 1.6, lane]].concat(pkLotAisle([bay.x - sx * 2.4, lane], [PK_DRIVE_OUT + sx * 2.8, lane], -sx),
      [[PK_DRIVE_OUT + sx * 0.4, 65.0], [PK_DRIVE_OUT, 68.0], [PK_DRIVE_OUT, 72.4]]);
    fwd = fwd.concat(toEast ? [[3.6, 74.3], [9, 74.5], [95, 74.5]] : [[0.4, 76.6], [-4, 77.5], [-12, 77.5], [-95, 77.5]]);
    return { back: back, fwd: fwd };
  }
  // ── A car and its party ──────────────────────────────────────────
  var PK_LOT_COLS = [0xb23a2e, 0x2f5d8a, 0xe0dccf, 0x2f6f4f, 0x8a8f96, 0x1f2328, 0xc9a227, 0x6b4f8a, 0xd06a2a, 0x4b6b7a];
  function pkLotArrive() {
    var free = pkLotBays().filter(function (b) { return !b.car; });
    if (!free.length) return null;
    // the bays nearest the walk to the gate go first, with a little chance in it
    free.sort(function (a, b) { return Math.abs(a.x) + (a.z > 62 ? 4 : 0) - Math.abs(b.x) - (b.z > 62 ? 4 : 0); });
    var bay = free[Math.floor(Math.min(free.length - 1, Math.pow(Math.random(), 2) * free.length))];
    var g = carMesh({ col: pick(PK_LOT_COLS) }); g.userData.dynamic = true; scene.add(g);
    var r = Math.random(), n = r < 0.15 ? 1 : r < 0.5 ? 2 : r < 0.75 ? 3 : 4;
    var car = { id: ++PK_LOT.seq, g: g, bay: bay, n: n, party: [], state: 'in', path: pkLotPath(pkLotIn(bay, Math.random() < 0.5)), s: 0, v: 0, rev: false, wait: 0 };
    bay.car = car;
    PK_LOT.cars.push(car);
    pkLotPlace(car);
    return car;
  }
  function pkLotPlace(car) {
    var u = Math.min(1, car.s / car.path.len), p = car.path.c.getPointAt(u), t = car.path.c.getTangentAt(u);
    car.g.position.set(p.x, 0, p.z);
    var yaw = Math.atan2(-t.z, t.x) + (car.rev ? Math.PI : 0);            // the mesh runs along local +x
    car.g.rotation.y = yaw;
    var ws = car.g.userData.wheels; if (ws) ws.forEach(function (w) { w.rotation.z -= (car.rev ? -1 : 1) * car.v * 0.016 / 0.33; });
  }
  // out of the car: the party gets out on either side and walks up to the ticket windows
  function pkLotUnload(car) {
    var b = car.bay, side = [[-1, -0.6], [1, -0.6], [-1, 0.7], [1, 0.7]];
    for (var i = 0; i < car.n; i++) {
      var gu = pkSpawnGuest(), off = side[i];
      // the bay runs along z: the doors are either side in x
      gu.rec.x = b.x + off[0] * 1.15; gu.rec.z = b.z + off[1]; gu.g.position.set(gu.rec.x, 0, gu.rec.z);
      gu.car = car; car.party.push(gu);
    }
    car.state = 'parked';
  }
  // a guest heading home walks to the car and gets in; the car goes when the last of the party is in
  function pkLotHome(gu) {
    var car = gu.car; if (!car) return false;
    var b = car.bay, sd = gu.rec.x < b.x ? -1 : 1;
    pkGo(gu, b.x + sd * 1.25, b.z, 'toCar');
    return true;
  }
  function pkLotBoard(gu) {
    var car = gu.car; if (!car) return;
    gu.home = true; gu.state = 'gone';
  }
  function pkLotDepart(car) {
    var P = pkLotOut(car.bay, Math.random() < 0.5);
    car.out = P; car.state = 'back'; car.rev = true; car.path = pkLotPath(P.back); car.s = 0;
  }
  // the car in front: any other moving car within reach ahead and in the same lane keeps this one waiting (returned)
  function pkLotBlocker(car) {
    var fx = Math.cos(-car.g.rotation.y), fz = Math.sin(-car.g.rotation.y); if (car.rev) { fx = -fx; fz = -fz; }
    for (var i = 0; i < PK_LOT.cars.length; i++) {
      var o = PK_LOT.cars[i]; if (o === car || o.state === 'parked') continue;
      var dx = o.g.position.x - car.g.position.x, dz = o.g.position.z - car.g.position.z, ahead = dx * fx + dz * fz, side = Math.abs(dx * fz - dz * fx);
      if (ahead > 0.5 && ahead < 6.5 && side < 1.9) return o;
    }
    return null;
  }
  // a car leaves its bay only when no other car near it is backing out and the aisle at its bay is clear
  function pkLotMayLeave(car) {
    var b = car.bay, mz = (b.mouth + 62) / 2;
    for (var i = 0; i < PK_LOT.cars.length; i++) {
      var o = PK_LOT.cars[i]; if (o === car || o.state === 'parked') continue;
      var d = Math.hypot(o.g.position.x - b.x, o.g.position.z - mz);
      if ((o.state === 'back' && d < 16) || d < 7) return false;
    }
    return true;
  }
  function pkLotTick(dt, open) {
    var i, near = false;
    // a new car now and then while the gate is open, as long as the park has room for its party
    if (open) {
      PK_LOT.spawnT -= dt;
      var coming = 0; PK_LOT.cars.forEach(function (c) { if (c.state === 'in') coming += c.n; });
      if (PK_LOT.spawnT <= 0) { PK_LOT.spawnT = randf(2.2, 5.5); if (PK.guests.length + coming < PK_GUEST_MAX) pkLotArrive(); }
    }
    for (i = PK_LOT.cars.length - 1; i >= 0; i--) {
      var car = PK_LOT.cars[i];
      if (car.state === 'parked') {
        // everyone back in (or gone some other way): off home
        var out = car.party.filter(function (g) { return !g.home && PK.guests.indexOf(g) >= 0; }).length;
        if (car.party.length && !out && pkLotMayLeave(car)) pkLotDepart(car);
        continue;
      }
      car.blocker = pkLotBlocker(car);
    }
    for (i = PK_LOT.cars.length - 1; i >= 0; i--) {
      car = PK_LOT.cars[i];
      if (car.state === 'parked') continue;
      var left = car.path.len - car.s, onRoad = car.g.position.z > 73.2, vmax = car.rev ? 1.4 : onRoad ? 9 : 3.6;
      vmax = Math.min(vmax, Math.max(0.6, Math.sqrt(2 * 1.6 * left)));             // ease into the bay or the end of a reverse
      if (car.state === 'out' && onRoad) vmax = 9;
      // two cars each with the other in front: the one that came first goes
      // and a car held more than four seconds (a ring of cars each waiting on the next) eases through for a moment
      var bl = car.blocker, held = bl && !(bl.blocker === car && car.id < bl.id);
      if (car.ghost > 0) { car.ghost -= dt; held = false; }
      if (held) { car.wait += dt; vmax = 0; if (car.wait > 4) { car.ghost = 1.6; car.wait = 0; } } else car.wait = 0;
      car.v += clamp(vmax - car.v, -6 * dt, 2.5 * dt);
      car.s += car.v * dt;
      pkLotPlace(car);
      if (Math.hypot(car.g.position.x, car.g.position.z - 72.6) < 7) near = true;
      if (car.s < car.path.len - 0.02) continue;
      if (car.state === 'in') { car.s = car.path.len; car.v = 0; pkLotPlace(car); pkLotUnload(car); }
      else if (car.state === 'back') { car.state = 'out'; car.rev = false; car.path = pkLotPath(car.out.fwd); car.s = 0; car.bay.car = null; }
      else if (car.state === 'out') { scene.remove(car.g); PK_LOT.cars.splice(i, 1); }
    }
    // the barrier lifts for a car and drops behind it
    PK_LOT.boomT = clamp(PK_LOT.boomT + (near ? 1.6 : -0.8) * dt, 0, 1);
    if (PK_LOT.boom) PK_LOT.boom.rotation.z = PK_LOT.boomT * 1.35;
  }
