// Park Co's own smoke: the park booted through CO.boot. Run by tests/smoke.js. No backslash-quote in the body.
'use strict';
module.exports = `
  // boot
  ok(!!T.renderer && !!T.scene && !!T.camera && T.CO.ready === true && typeof T.enter === 'function', 'CO.setup and CO.boot ran: renderer, scene, camera and the handle stand');
  ok(T.ui.started === false && !document.getElementById('dc-start').hidden, 'the start screen is up before enter');
  ok(/A small park/.test(document.getElementById('dc-start-stats').textContent) && /Slot 1/.test(document.getElementById('dc-start-note').textContent), 'the start screen chips and note come from the game');
  T.enter(); ok(T.ui.started === true && document.getElementById('dc-start').hidden && !document.getElementById('dc-hud').hidden, 'enter hides the start screen and shows the HUD');
  await wait(500);
  ok(T.counts().draws > 0 && T.counts().baked > 0, 'frames draw with the bake in: ' + JSON.stringify(T.counts()));
  // the save and the HUD
  ok(T.CO.save.key === 'park-co-slot1' && S.bank === 500 && S.day === 1 && S.ticketPrice === 25 && S.snackPrice === 6 && S.clerk === true, 'a fresh save on slot 1: bank ' + S.bank + ', clerk on');
  T.updateHud(1); ok(document.getElementById('h-cash').textContent === '$500' && /Day 1/.test(document.getElementById('h-day').textContent) && /in the park/.test(document.getElementById('h-guests').textContent) && /Ride:/.test(document.getElementById('h-ride').textContent), 'the HUD shows the engine fields and the game fields');
  T.pay(-10, 'a test'); ok(S.bank === 490 && S.ledger[0].n === -10 && S.stats.spent === 10, 'pay writes the bank, the ledger and the stats');
  // the world
  ok(!!T.pkTrack() && T.pkTrack().getLength() > 100, 'the coaster is a closed circuit ' + T.pkTrack().getLength().toFixed(0) + ' m long');
  ok(T.pkTrain().length === 3 && T.pkSeats().length === 12, 'three cars and twelve seats');
  ok(T.pkTurnstiles().length === 4 && T.pkGates().length === 4, 'four turnstiles at the gate and four platform gates');
  ok(T.pkBooths().length === 2 && !!T.pkBooths()[0].screen && !!T.pkBooths()[1].screen, 'two ticket windows, a screen each');
  ok(!!T.pkScreen() && !!T.pkSnack() && !!T.pkConsole() && !!T.pkConsole().parts.buttons.dispatch && !!T.pkConsole().parts.gauges.speed && !!T.pkConsole().parts.lever, 'the operator room has its screen and a real desk: buttons, a throttle and gauges');
  ok(T.pkScreen().zones.length === 0, 'the room screen reports the ride; it does not take taps');
  { const attractions = T.PK.attractions;
    ok(attractions.length === 15 && attractions.every((a) => !!a.booth && !!a.boothScreen), 'every attraction has an operator booth and screen');
    ok(attractions.every((a) => {
      const sc = a.boothScreen, m = sc.mesh, g = a.booth, wp = m.getWorldPosition(new T.THREE.Vector3());
      const dx = wp.x - g.position.x, dz = wp.z - g.position.z;
      return Math.sqrt(dx * dx + dz * dz) < 2.0 && Math.abs(a.x - a.plot.x) < 0.01;
    }), 'ride screens sit on their booth wall, inside the room');
    ok(attractions.every((a) => { const sc = a.boothScreen; return sc.ctx.getImageData(20, 20, 1, 1).data[3] === 255 && sc.zones.length === 0; }), 'all ride screens are status displays: painted, with no button row');
    ok(attractions.every((a) => !!a.boothPanel && !!a.boothPanel.buttons.dispatch && !!a.boothPanel.stop && !!a.boothPanel.load), 'every booth desk has real hardware: buttons, a stop and a load gauge');
    ok(attractions.every((a) => !!a.boothCabinet && !!a.boothCabinet.key && !!a.boothCabinet.amps && Object.keys(a.boothCabinet.lamps).length === 7), 'every booth has its ride control cabinet: key switch, meters and a lamp column');
    { const f = T.PK.attrById.carousel.boothFrame;
      ok(!!f && T.pkBkFloorAt(f.x, f.z) === 0.45 && T.pkFloor(f.x, f.z) === 0.45, 'a booth floor stands up its steps: ' + (f && T.pkBkFloorAt(f.x, f.z))); } }
  // the key switch in MAINT locks a ride out: nobody boards, the desk refuses, and back to RUN it works again
  { const a = T.PK.attrById.teacups, C = T.pkCtl(a); a.state = 'idle'; a.t = 0; a.riders = 0; a.queue.length = 0; C.fault = ''; C.auto = true; T.pkAttrUnseatAll(a);
    const g = T.pkSpawnGuest(); const s0 = T.pkAttrSlot(a, 0); g.rec.x = s0.x; g.rec.z = s0.z; g.state = 'qwait'; g.slot = 0; g.attr = a.id; a.queue.push(g);
    a.boothCabinet.key.set(1);
    T.pkAttrTick(a, 0.05);
    ok(C.maint === true && a.state === 'idle' && T.pkBoothGates(a) === false && /MAINT/.test(T.pkBoothStatus(a, C)), 'MAINT locks the teacups out: ' + a.state + ', ' + T.pkBoothStatus(a, C));
    a.boothCabinet.key.set(0); T.pkAttrTick(a, 0.05);
    ok(C.maint === false && a.state === 'boarding', 'back to RUN, the line boards: ' + a.state);
    C.gates = false; a.state = 'idle'; a.queue.length = 0; T.pkAttrUnseatAll(a); g.state = 'leave'; g.attr = null; }
  ok(!!T.PK.console && T.PK.console.parts.mode && T.PK.console.parts.stop, 'the control desk runs off the physical hardware');
  ok(!!T.pkCabinet() && !!T.pkCabinet().rides.carousel && !!T.pkCabinet().gauges.load, 'the park switchboard has a breaker per ride and its own dials');
  { const a = T.PK.attrById.carousel; a.state = 'idle'; a.riders = 0; a.queue.length = 0;
    ok(T.pkSetRideOpen('carousel', false) === true && a.open === false, 'a breaker shuts a ride for the day');
    ok(T.pkSetRideOpen('carousel', true) === true && a.open === true, 'and the same breaker opens it again'); }
  ok(T.solids.length > 20 && T.lampMeshes.length >= 10, 'the park left solids and lamp lenses behind: ' + T.solids.length + ' solids, ' + T.lampMeshes.length + ' lenses');
  ok(!!T.sky.dome && T.sky.clouds.length === 6, 'the sky stands: a dome and six clouds');
  // the platform, the ramp and the floor
  ok(T.pkFloor(0, -2) === 0.6 && T.pkFloor(0, 5) === 0 && T.pkFloor(0, 0) > 0 && T.pkFloor(0, 0) < 0.6, 'the platform is 0.6 up, the ramp slopes and the midway is flat');
  ok(T.pkOnPlatform(0, -2) === true && T.pkOnPlatform(0, 5) === false && T.pkOnPlatform(20, -2) === false, 'on the platform only inside the slab');
  ok(T.floorY(0, -2) === 0.6 && T.floorY(0, 5) === 0, 'the engine floor follows the game floor');
  // the ticket window
  { const g = T.pkSpawnGuest(); ok(!!g && T.PK.guests.indexOf(g) >= 0 && g.state === 'toBooth' && !!g.g.userData.legs, 'a guest arrives from the car park');
    g.state = 'boothQueue'; T.PK.booths[0].queue.push(g);
    const b0 = S.bank, t0 = T.PK.today.tickets;
    ok(T.pkServe(0) === true && S.bank === b0 + S.ticketPrice && T.PK.today.tickets === t0 + 1 && g.ticket === true && g.state === 'toTurn', 'the window sells a ticket: bank ' + S.bank);
    ok(T.pkServe(0) === false && T.pkServe(1) === false, 'an empty window refuses'); }
  // the starter clerk serves the line without being asked
  { const g2 = T.pkSpawnGuest(); g2.state = 'boothQueue'; T.PK.booths[0].queue.push(g2);
    T.pkTick(2.5); ok(g2.ticket === true && g2.state === 'walkTurn', 'the starter clerk serves the line on their own'); }
  { const a = T.PK.attrById.carousel, g1 = T.pkSpawnGuest(), g2 = T.pkSpawnGuest();
    g1.rec.x = g2.rec.x = a.qx; g1.rec.z = g2.rec.z = a.qz - 4;
    ok(T.pkAttrQueueJoin(g1, a) && T.pkAttrQueueJoin(g2, a) && g1.slot === 0 && g2.slot === 1, 'attraction guests reserve distinct queue slots before arriving');
    g1.rec.x = a.qx; g1.rec.z = a.qz; g1.rec.path = []; g1.state = 'qwait';
    T.pkAttrQueueLeave(g2, a); ok(a.queue.length === 1 && g1.slot === 0, 'removing an attraction guest compacts its queue');
    a.queue.length = 0; g1.attr = g2.attr = null; }
  // the turnstile spins as it is passed
  { const t = T.pkTurnstiles()[0]; t.spin = 1; T.pkRideTick(0.05); ok(t.arm.rotation.x > 0 && t.spin < 1, 'a turnstile spins as it is passed'); }
  // the booth test run: an empty car goes round on its own
  { const a = T.pkAttractions()[0]; a.queue.length = 0;
    a.riders = 0; a.tests = 0; a.state = 'idle';
    const t0 = a.tests || 0;
    ok(T.pkBoothTest(a) === true && a.state === 'running' && a.tests === t0 + 1, a.name + ': a test run sends the empty car');
    ok(T.pkBoothTest(a) === false, 'a second test run refuses while it is running');
    T.pkCtl(a).fault = 'E-stop'; ok(T.pkBoothTest(a) === false, 'a faulted ride refuses a test run'); T.pkCtl(a).fault = '';
    T.pkAttrTick(a, 60); T.pkAttrTick(a, 10); ok(a.state === 'idle', 'the test run finishes and the ride is idle again'); }
  // the coaster queue: guests join at the back and shuffle up as the line drains
  { T.PK.queue.length = 0;
    const q1 = { id: -1, rec: { x: 7, z: 9, path: [], speed: 1.5 }, state: 'toTurn', qslot: -1, g: null };
    const q2 = { id: -2, rec: { x: 7, z: 9, path: [], speed: 1.5 }, state: 'toTurn', qslot: -1, g: null };
    ok(T.pkQueueJoin(q1) === true && T.pkQueueJoin(q2) === true, 'two guests join the coaster queue');
    ok(T.PK.queue.length === 2 && q1.qslot === 0 && q2.qslot === 1 && q1.state === 'walkQueue', 'they line up on the first two slots');
    ok(T.pkQueueJoin(q2) === false, 'a guest already in line does not join twice');
    T.PK.queue.shift(); T.pkQueueReslot();
    ok(q2.qslot === 0 && q2.state === 'walkQueue', 'the second guest shuffles up to the front slot');
    T.PK.queue.length = 0; }
  // the ride, by hand, in the wrong order and the right one
  { const R = T.PK.ride;
    ok(R.state === 'idle' && R.riders === 0 && T.pkGates()[0].open === false, 'the ride starts idle with the gates shut');
    ok(T.pkDispatch() === false, 'dispatch before the restraints is refused');
    ok(T.pkBarsDown() === false, 'restraints before the gates are open is refused');
    ok(T.pkOpenGates() === true && R.state === 'loading' && T.pkGates()[0].open === true, 'the gates open and the ride is loading');
    ok(T.pkDispatch() === false, 'dispatch before the restraints is still refused');
    ok(T.pkTestRun() === true && R.state === 'dispatch', 'the screen test run sends the empty train without the gates and bars');
    ok(T.pkTestRun() === false, 'a second test run refuses while the train is leaving');
    R.u = T.PK.stationU; R.v = 0; R.state = 'idle'; R.bars = 0; R.barsWant = 0; T.PK.gates.forEach((gt) => { gt.open = false; }); T.pkPlaceTrain();
    ok(T.pkOpenGates() === true && T.pkBarsDown() === true && R.state === 'ready', 'the ride is readied for the dispatch check');
    ok(T.pkDispatch() === true && R.state === 'dispatch', 'an empty train can still be dispatched as a test run');
    ok(T.PK.refused >= 3, 'the desk counted the refusals: ' + T.PK.refused);
    T.run(40); R.u = T.PK.stationU; R.v = 0; R.state = 'ready'; R.bars = 1; R.barsWant = 1; }
  // load: guests line up, the gates open, and they walk in one seat at a time
  { const R = T.PK.ride;
    R.fault = ''; R.state = 'idle'; R.riders = 0; R.bars = 0; R.barsWant = 0; R.u = T.PK.stationU; R.v = 0;
    T.PK.seats.forEach((s) => s.guest = null); T.PK.queue.length = 0; T.pkPlaceTrain();
    for (let i = 0; i < 4; i++) { const g = T.pkSpawnGuest(); g.qslot = i; g.state = 'queue'; g.rec.x = 7; g.rec.z = 0.6 + i; g.rec.path = []; T.PK.queue.push(g); }
    T.pkOpenGates(); ok(R.state === 'loading' && T.PK.queue.length === 4 && R.riders === 0, 'the gates open and the line waits its turn');
    T.pkRideLoad(); ok(T.PK.queue.length === 0 && R.riders === 0, 'the line is invited in, still walking to their seats');
    for (let k = 0; k < 800 && R.riders < 4; k++) T.pkGuestTick(0.05);
    ok(R.riders === 4 && T.PK.seats.filter((s) => s.guest).length === 4, 'four guests walk in and sit');
    ok(T.PK.seats[0].guest.g.parent === T.PK.cars[0], 'a seated guest rides in the car');
    ok(T.pkBarsDown() === true && R.state === 'ready', 'the restraints come down over the riders');
    ok(T.pkDispatch() === true && R.state === 'dispatch' && R.beat > 0, 'dispatch with guests aboard');
    T.run(2); ok(R.state === 'running' && R.v > 0, 'the train is away: ' + R.state + ' at ' + R.v.toFixed(1) + ' m/s');
    const c0 = S.cycles || 0; let n = 0;
    while (R.state !== 'unload' && n < 4000) { T.pkRideTick(0.05); n++; }
    ok(R.state === 'unload' && (S.cycles || 0) === c0 + 1 && R.riders === 0, 'the train comes home and the cycle counts: ' + n + ' ticks, ' + S.cycles + ' cycles');
    ok(T.PK.seats.every((s) => !s.guest), 'every seat is empty again');
    ok(T.PK.guests.some((g) => g.state === 'off'), 'the riders are back on the platform');
    ok(T.pkGates()[0].open === true && R.state === 'unload', 'the train comes home with the gates already open');
    ok(T.pkGatesToggle() === true && R.state === 'loading' && T.pkGates()[0].open === true, 'Gates after unload lets the next queue in instead of shutting');
    ok(T.pkGatesToggle() === true && T.pkGates()[0].open === false && R.state === 'loading', 'and a second press closes them while boarding'); }
  // the e-stop
  { const R = T.PK.ride; T.pkOpenGates();
    ok(T.pkStop() === true && R.state === 'fault' && R.fault === 'E-stop', 'the e-stop stops the ride');
    ok(T.pkOpenGates() === false && T.pkDispatch() === false && T.pkBarsDown() === false, 'nothing works while it is stopped');
    ok(T.pkTestRun() === false, 'the screen test run refuses while it is stopped');
    ok(T.pkStop() === true && R.fault === '' && R.state === 'idle', 'pressing it again resets the ride'); }
  // AUTO runs the ride by itself
  { const R = T.PK.ride;
    R.fault = ''; R.state = 'idle'; R.riders = 0; R.bars = 0; R.barsWant = 0; R.u = T.PK.stationU; R.v = 0;
    T.PK.seats.forEach((s) => s.guest = null); T.PK.queue.length = 0; T.pkPlaceTrain();
    T.pkSetAuto(true);
    ok(S.auto === true, 'AUTO turns the ride over to itself');
    for (let i = 0; i < 6; i++) { const g = T.pkSpawnGuest(); g.qslot = i; g.state = 'queue'; g.rec.x = 7; g.rec.z = 0.6 + i; g.rec.path = []; T.PK.queue.push(g); }
    const c0 = S.cycles || 0;
    for (let k = 0; k < 24; k++) {
      while (T.PK.queue.length < 6) { const g = T.pkSpawnGuest(); g.qslot = T.PK.queue.length; g.state = 'queue'; g.rec.x = 7; g.rec.z = 0.6 + g.qslot; g.rec.path = []; T.PK.queue.push(g); }
      T.run(10);
    }
    ok((S.cycles || 0) > c0 + 1, 'AUTO runs the ride by itself: ' + ((S.cycles || 0) - c0) + ' cycles');
    T.pkSetAuto(false); ok(S.auto === false, 'and AUTO hands it back'); }
  // a full lane walk: join at the entry, stand on a slot, file into a seat, come home, Gates lets the next line in
  { const R = T.PK.ride;
    R.fault = ''; R.state = 'idle'; R.riders = 0; R.bars = 0; R.barsWant = 0; R.u = T.PK.stationU; R.v = 0;
    T.PK.seats.forEach((s) => s.guest = null); T.PK.queue.length = 0; T.PK.gates.forEach((gt) => { gt.open = false; }); T.pkPlaceTrain();
    T.PK.guests.slice().forEach((g) => { g.state = 'leave'; g.rec.path = []; g.seat = null; });
    const line = [];
    for (let i = 0; i < 3; i++) {
      const g = T.pkSpawnGuest(); g.rec.x = 7; g.rec.z = 12 + i; g.rec.path = []; g.rides = 2;
      ok(T.pkQueueJoin(g) === true, 'guest ' + i + ' joins at the lane entry');
      line.push(g);
    }
    ok(line.every((g) => g.state === 'walkQueue' && g.rec.path.length > 0), 'they walk the lane from the entry, not blink onto a slot');
    for (let k = 0; k < 1200 && line.some((g) => g.state !== 'queue'); k++) T.pkGuestTick(0.05);
    ok(line.every((g) => g.state === 'queue'), 'they stand on their slots: ' + line.map((g) => g.qslot + '@' + g.rec.z.toFixed(1)).join(', '));
    ok(line[0].qslot === 0 && Math.abs(line[0].rec.z - T.PK_QUEUE_SLOTS[0].z) < 0.25, 'the front of the line is on the first slot');
    ok(T.pkGatesToggle() === true && R.state === 'loading', 'Gates opens boarding from idle');
    for (let k = 0; k < 1200 && R.riders < 3; k++) { T.pkRideTick(0.05); T.pkGuestTick(0.05); }
    ok(R.riders === 3 && line.every((g) => g.state === 'seated'), 'they walk from the lane into a seat');
    ok(T.pkBarsDown() === true && T.pkDispatch() === true, 'restraints and dispatch after the walk-in');
    let n = 0; while (R.state !== 'unload' && n < 4000) { T.pkRideTick(0.05); n++; }
    ok(R.state === 'unload' && T.pkGates()[0].open === true, 'home again, gates open for unload');
    T.PK.guests.forEach((g) => { if (line.indexOf(g) >= 0 || g.state === 'off' || g.state === 'leave') { g.state = 'leave'; g.rec.path = []; g.seat = null; } });
    T.PK.queue.length = 0; T.PK.seats.forEach((s) => s.guest = null);
    const next = [];
    for (let i = 0; i < 2; i++) {
      const g = T.pkSpawnGuest(); g.rec.x = 7; g.rec.z = 12 + i; g.rec.path = []; g.rides = 2;
      T.pkQueueJoin(g); next.push(g);
    }
    for (let k = 0; k < 1200 && next.some((g) => g.state !== 'queue'); k++) T.pkGuestTick(0.05);
    ok(next.every((g) => g.state === 'queue'), 'the next line has walked onto the slots');
    ok(T.pkGatesToggle() === true && R.state === 'loading' && T.pkGates()[0].open === true, 'Gates after the return keeps the gates up and starts loading');
    for (let k = 0; k < 1200 && R.riders < 2; k++) { T.pkRideTick(0.05); T.pkGuestTick(0.05); }
    ok(R.riders === 2 && next.every((g) => g.state === 'seated'), 'the second line walks in from the lane'); }
  // the rides
  ok(T.PK.attractions.length === 15, 'nine rides stand beside the midway: ' + T.PK.attractions.length);
  ok(T.PK.attrById.carousel && T.PK.attrById.carousel.seats.length === 8, 'the carousel has eight horses');
  ok(T.PK.attrById.ferris && T.PK.attrById.ferris.seats.length === 16, 'the ferris wheel has eight cabins of two');
  { const d = T.CO.npcs(); ok(d && d.characters && d.spawners.length === 3 && d.workers.length === 2, 'the crowd is described to the engine: ' + d.spawners.length + ' spawners, ' + d.workers.length + ' workers'); }
  { const a = T.PK.attrById.teacups; a.state = 'idle'; a.t = 0; a.queue.length = 0; a.riders = 0; a.ctl.fault = ''; T.pkAttrUnseatAll(a);
    for (let i = 0; i < 4; i++) { const g = T.pkSpawnGuest(); const s = T.pkAttrSlot(a, i); g.rec.x = s.x; g.rec.z = s.z; g.state = 'qwait'; g.slot = i; g.attr = a.id; a.queue.push(g); }
    T.pkAttrTick(a, 0.05);
    for (let k = 0; k < 600 && a.riders < 4; k++) { T.pkAttrTick(a, 0.05); T.pkGuestTick(0.05); }
    ok(a.state === 'boarding' && a.riders === 4 && a.queue.length === 0, 'four guests walk in and sit on the teacups');
    const c0 = a.cycles;
    for (let k = 0; k < 60 && a.state !== 'running'; k++) T.run(0.1);
    ok(a.state === 'running', 'the teacups run');
    T.run(a.run + 0.2); ok(a.state === 'unloading' && a.cycles === c0 + 1, 'the teacups finish a cycle'); }
  { const a = T.PK.attrById.teacups, guest = T.pkSpawnGuest(); a.state = 'idle'; a.ctl.auto = false; a.queue.length = 0; a.riders = 0; T.pkAttrUnseatAll(a); guest.state = 'qwait'; guest.attr = a.id; guest.slot = 0; const s0 = T.pkAttrSlot(a, 0); guest.rec.x = s0.x; guest.rec.z = s0.z; a.queue.push(guest);
    ok(guest.state === 'qwait' && a.riders === 0, 'the guest waits in the lane until the operator opens the gates');
    ok(T.pkBoothGates(a) === true && a.state === 'boarding', 'manual attraction opens boarding from idle');
    for (let i = 0; i < 1200 && a.riders === 0; i++) { T.pkAttrTick(a, 0.05); T.pkGuestTick(0.05); }
    ok(a.riders === 1 && a.queue.length === 0, 'manual boarding waits for the guest to reach a seat');
      a.ctl.barsWant = 1; a.ctl.gates = false; a.state = 'ready';
     ok(T.pkBoothDispatch(a) === true && a.state === 'running', 'manual dispatch waits until queue and boarding paths clear');
    T.pkCtl(a).fault = ''; a.state = 'unloading'; a.t = a.unload; a.queue.length = 0; a.riders = 0; T.pkAttrTick(a, 0.05); T.pkAttrUnseatAll(a); }
  // the real queue lanes and the player's own turn on the rides
  ok(T.pkLanes().length === 15 && T.pkLanes().every((L) => L.a && !!L.leafL && !!L.leafR), 'every ride has a fenced queue lane and a boarding gate');
  ok(T.pkLanes().every((L) => L.x1 > L.x0 && L.zB > L.zA), 'the lanes run from the gateway to an open entry with room for a line');
  // every ride can be walked to from Station Square. When the pathfinder finds no way it falls back to one straight leg to
  // the slot - through whatever fence is in the way - so a long walk that comes back as a single leg is a ride nobody can reach
  { const blocked = [];
    T.PK.attractions.forEach((a) => {
      const g = T.pkSpawnGuest(), q0 = a.queue.slice(); g.rec.x = 0; g.rec.z = 4; g.rec.path = []; a.queue.length = 0;
      T.pkAttrQueueJoin(g, a);
      const P = g.rec.path, far = P.length ? Math.hypot(P[P.length - 1].x, P[P.length - 1].z - 4) : 0;
      if (!P.length || (P.length === 1 && far > 12)) blocked.push(a.id + ' (' + P.length + ' leg, ' + far.toFixed(0) + ' m)');
      T.pkAttrQueueLeave(g, a); g.state = 'leave'; g.attr = null; a.queue.length = 0; q0.forEach((q) => a.queue.push(q));
    });
    ok(blocked.length === 0, 'every ride is reached on foot from Station Square' + (blocked.length ? ': blocked ' + blocked.join(', ') : '')); }
  { const a = T.PK.attrById.carousel; a.state = 'idle'; a.t = 0; a.riders = 0; a.queue.length = 0; a.ctl.auto = true; a.ctl.fault = ''; T.pkAttrUnseatAll(a);
    T.player.x = a.qx + 2; T.player.z = a.qz; T.player.y = 0;
    ok(T.pkPlayerRideJoin(a) === true && !!T.PK.playerRide && T.PK.playerRide.kind === 'attr', 'the player can walk up to a ride and get on');
    for (let k = 0; k < 1400 && T.PK.playerRide; k++) T.pkTick(0.05);
    ok(!T.PK.playerRide && Math.abs(T.player.x - a.exit[0]) < 0.7 && Math.abs(T.player.z - a.exit[1]) < 0.7, 'the carousel brings the player back and sets them down at the exit (' + (T.PK.playerRide ? 'still riding, state ' + a.state + ' t ' + a.t.toFixed(1) : 'at ' + T.player.x.toFixed(1) + ',' + T.player.z.toFixed(1)) + ')'); }
  { T.pkSetAuto(true); const R = T.PK.ride; R.state = 'idle'; R.fault = ''; R.u = 0.02; R.riders = 0; T.pkPlaceTrain(); T.player.x = 7; T.player.z = 9; T.player.y = 0;
    ok(T.pkPlayerRideJoin(null) === true && !!T.PK.playerRide && T.PK.playerRide.kind === 'coaster', 'the player can get on the coaster at its queue entry');
    for (let k = 0; k < 5000 && T.PK.playerRide; k++) T.pkTick(0.05);
    ok(!T.PK.playerRide && T.pkFloor(T.player.x, T.player.z) === 0.6, 'the coaster sets the player down on the platform after the lap'); }
  // the two outdoor loopers fly a real track: sample a whole lap and look for the high points
  ['serpent', 'baron'].forEach((id) => {
    const a = T.PK.attrById[id], E = a.extra;
    a.ctl.auto = true; a.ctl.fault = ''; a.queue.length = 0; a.riders = 1;
    a.state = 'running';
    let maxY = 0, tilt = 0;
    for (let k = 1; k < 60; k++) {
      a.t = a.run * k / 60; T.pkAttrTick(a, 0.016);
      const car = E.cars[0].g;
      if (car.position.y > maxY) maxY = car.position.y;
      tilt = Math.max(tilt, Math.abs(car.quaternion.x) + Math.abs(car.quaternion.z));
    }
    a.state = 'idle'; a.t = 0; a.riders = 0; T.pkAttrTick(a, 0.016);
    ok(maxY > 9 && tilt > 0.2, a.name + ' flies its loops: peak y ' + maxY.toFixed(1) + ', tilt ' + tilt.toFixed(2));
    ok(E.cars[0].g.position.y < 2.5 && Math.abs(E.cars[0].g.position.z - a.extra.curve.getPointAt(a.extra.uPark).z) < 0.6, a.name + ' parks back at the station'); });
  // the three indoor coasters fly their own circuits in the dark and park back at the platform
  ['nocturne', 'wreck', 'moonwood'].forEach((id) => {
    const a = T.PK.attrById[id], E = a.extra;
    a.ctl.auto = true; a.ctl.fault = ''; a.queue.length = 0; a.riders = 1;
    a.state = 'running';
    let maxY = 0, tilt = 0;
    for (let k = 1; k < 60; k++) {
      a.t = a.run * k / 60; T.pkAttrTick(a, 0.016);
      const car = E.cars[0].g;
      if (car.position.y > maxY) maxY = car.position.y;
      tilt = Math.max(tilt, Math.abs(car.quaternion.x) + Math.abs(car.quaternion.z));
    }
    a.state = 'idle'; a.t = 0; a.riders = 0; T.pkAttrTick(a, 0.016);
    ok(maxY > 5.5 && tilt > 0.05, a.name + ' flies its circuit: peak y ' + maxY.toFixed(1) + ', tilt ' + tilt.toFixed(2));
    ok(E.cars[0].g.position.y < 2.5, a.name + ' parks back at the station');
    ok(a.booth && a.boothScreen && a.seats.length === 8 && a.riders === 0, a.name + ' has its own control cabin');
  });
  // the cabin doors open off the end of the platform: walk the player in from the platform (a west hall and an east one)
  [[-62, 1, 'nocturne'], [42, -1, 'moonwood']].forEach(function (c) {
    var x0 = c[0] + c[1] * 14.3, s = []; for (var uu = 14.3; uu < 16.6; uu += 0.3) s.push(uu.toFixed(1) + ':' + (T.collides(c[0] + c[1] * uu, -80.9) ? 1 : 0));
    T.player.x = x0; T.player.z = -80.9; T.player.y = 0; T.player.yaw = -c[1] * Math.PI / 2;
    T.player.keys.KeyW = true; for (let i = 0; i < 30; i++) T.updatePlayer(0.05); T.player.keys.KeyW = false;
    ok((T.player.x - c[0]) * c[1] > 15.6, 'the ' + c[2] + ' cabin door walks (' + s.join(' ') + ') u ' + ((T.player.x - c[0]) * c[1]).toFixed(2));
  });
  // the kids' area turns, and the pedal line crawls its oval
  ['kround', 'kpots'].forEach((id) => {
    const a = T.PK.attrById[id];
    a.state = 'running'; a.ctl.fault = '';
    const p0 = a.seats[0].par.rotation.y;
    a.tickRun(a, 1, 1);
    ok(a.seats.length >= 6 && Math.abs(a.seats[0].par.rotation.y - p0) > 0.2, a.name + ' turns on its deck');
  });
  { const a = T.PK.attrById.kpuffin, E = a.extra;
    a.ctl.auto = true; a.ctl.fault = ''; a.state = 'running';
    const x0 = E.cars[0].g.position.x, z0 = E.cars[0].g.position.z;
    a.t = a.run * 0.5; T.pkAttrTick(a, 0.016);
    const moved = Math.hypot(E.cars[0].g.position.x - x0, E.cars[0].g.position.z - z0);
    a.state = 'idle'; a.t = 0; T.pkAttrTick(a, 0.016);
    ok(moved > 4 && E.cars[0].g.position.y < 1.2, 'the Puffin Line crawls its oval: ' + moved.toFixed(1) + ' m round'); }
  // the level ladder and the prices
  ok(T.PK_LEVELS.length === 5 && T.PK_LEVELS[0].name === 'The gate' && T.PK_LEVELS[4].unlock === 'lights', 'the level ladder runs from the gate to the park lights');
  ok(T.pkPrice(5) === 30 && T.pkPrice(-100) === 5 && T.pkPrice(1000) === 200, 'the ticket price clamps 5 to 200');
  ok(T.pkOpenCount() === 16, 'all ten rides are open from the first day');
  { const x0 = T.PK.xp; T.pkXp(60); ok(T.PK.xp === x0 + 60 && T.PK.level >= 2 && T.PK.snackOpen === true && S.snackOpen === true, 'xp opens the snack stand at level 2'); }
  ok(T.pkSnackPrice(1) === 7 && T.pkSnackPrice(-100) === 1, 'the snack price clamps 1 to 40');
  // the snack stand
  { const g = T.pkSpawnGuest(); g.rec.x = -13; g.rec.z = 8; const b0 = S.bank, s0 = T.PK.today.snacks;
    ok(T.pkSnackBuy() === true && S.bank === b0 + S.snackPrice && T.PK.today.snacks === s0 + 1, 'a snack sells to the guest at the stand: bank ' + S.bank); }
  // hiring
  T.pay(2000, 'a test float');
  { S.clerk = false; const b0 = S.bank; ok(T.pkHire('clerk') === 'Hired' && S.clerk === true && S.bank === b0 - 400, 'a clerk is hired for 400');
    ok(T.pkHire('clerk') === 'A clerk already works the window', 'and not hired twice');
    ok(T.pkHire('operator') === 'Hired' && S.operator === true && S.bank === b0 - 1000, 'an operator is hired for 600'); }
  // the panel
  T.openPanel('park'); ok(T.ui.panelOpen && document.getElementById('dc-panel-title').textContent === 'Park Co' && document.getElementById('dc-panel-tabs').children.length === 5 && /Day 1/.test(T.panelHtml()), 'the park panel renders its title, tabs and body');
  document.getElementById('dc-panel-tabs').children[1].click(); ok(/rides open/.test(T.panelHtml()), 'the rides tab rerenders');
  document.getElementById('dc-panel-tabs').children[2].click(); ok(/The coaster/.test(T.panelHtml()), 'the coaster tab');
  { const a0 = S.auto; const oldOperator = S.operator; S.operator = false; T.pkPanelAct('auto'); ok(S.auto !== a0, 'AUTO panel action reaches the game'); T.pkPanelAct('auto'); ok(S.auto === a0, 'AUTO panel action toggles back'); S.operator = oldOperator;
    S.operator = true; T.PK.operator = true; ok(T.pkCoasterAuto() === true, 'operator hire also runs the coaster automatically'); S.operator = false; T.PK.operator = false; }
  document.getElementById('dc-panel-tabs').children[3].click(); ok(/Ticket clerk/.test(T.panelHtml()), 'the staff tab');
  { const before = S.bank; S.clerk = false; T.pkPanelAct('hireClerk'); T.pkPanelAct('hireClerk'); ok(S.clerk === true && S.bank === before - 400, 'staff hire action charges once despite duplicate click'); T.pkFire('clerk'); }
  T.closePanel(); ok(!T.ui.panelOpen, 'closed');
  // the guide and the menu
  T.openMenu(); ok(T.ui.menuOpen, 'the pause menu opens');
  T.menuAct('guide'); ok(/Park Co/.test(document.getElementById('dc-menu-body').innerHTML) && /AUTO/.test(document.getElementById('dc-menu-body').innerHTML), 'the guide comes from the game');
  T.closeMenu(); ok(!T.ui.menuOpen, 'resume');
  // the player: the operator desk carries no buttons now, and the ramp
  { T.player.x = 13.4; T.player.z = -1.0; T.player.y = 0; T.lookAt(12.4, 1.1, -1.0); ok(!/Gates|Restraints|Dispatch|E-stop|MANUAL|AUTO/.test(T.focusText()), 'the old button row focuses nothing: ' + (T.focusText() || 'nothing')); }
  { T.player.x = 0; T.player.z = 3; T.player.y = 0; T.player.yaw = 0; T.player.keys.KeyW = true; for (let i = 0; i < 25; i++) T.updatePlayer(0.05); T.player.keys.KeyW = false; ok(T.player.z < -0.6 && T.player.y > 0.5, 'W walks up the ramp onto the platform: z ' + T.player.z.toFixed(2) + ', y ' + T.player.y.toFixed(2)); }
  { const desk = T.collides(14.3, -3.5), floor = T.collides(14.3, -1.6), midway = T.collides(0, 5);
    ok(desk === true && floor === false && midway === false, 'the control desk is solid and the booth floor stays walkable (' + desk + ', ' + floor + ', ' + midway + ')'); }
  // the day rolls over and pays the wages
   { const d0 = S.day; S.operator = true; S.clerk = true; const w = (S.clerk ? 40 : 0) + (S.operator ? 60 : 0);
        S.time = 22; T.setTime(22); for (let i = 0; i < 2520; i++) T.pkTick(0.05);
     const wage = S.ledger.find((e) => e.why === 'Wages');
    ok(S.day === d0 + 1 && !!wage && wage.n === -w && S.today === T.PK.today, 'midnight starts a new day and pays the wages: day ' + S.day + ', wages ' + (wage && wage.n)); }
  // cards, sound and the log
  T.showCard('h-card', '<b>Level 2</b>', 5); ok(!document.getElementById('h-card').hidden, 'a card shows'); T.tickCards(6); ok(document.getElementById('h-card').hidden, 'and times out');
  T.sfx('ok'); ok(T.sfxCount() >= 1, 'sfx plays');
  T.logEvent('the park opened', 'rare'); ok(S.log[0].msg === 'the park opened' && document.getElementById('h-feed').textContent.indexOf('the park opened') >= 0, 'logEvent writes the log and the feed');
  T.toast('hello', 'good'); { const tb = document.getElementById('h-toasts'); ok(tb.children.length >= 1 && tb.lastChild.textContent === 'hello', 'a toast shows'); }
  // the dev commands
  ok(T.devCommandList().indexOf('cash') >= 0 && T.devCommandList().indexOf('spawn') >= 0 && T.devCommandList().indexOf('dispatch') >= 0, 'the command list merges the engine and the game');
  { const b0 = S.bank; ok(/bank/.test(T.devCommand('cash', 5)) && S.bank === b0 + 5 && /guests/.test(T.devCommand('guests')) && /unknown/.test(T.devCommand('nope')), 'devCommand runs engine and game commands: bank ' + S.bank); }
  { const st = T.devState(); ok(st.bank === S.bank && st.engine === T.CO.version && Array.isArray(st.commands) && typeof st.guests === 'number' && typeof st.ride === 'string', 'devState merges the engine readout and the game readout'); }
  // the save round trip
  T.save(); { const raw = JSON.parse(localStorage.getItem('park-co-slot1')); ok(!!raw && raw.bank === S.bank && raw.ticketPrice === S.ticketPrice && raw.auto === S.auto && raw.xp === T.PK.xp, 'save wrote the slot: ' + JSON.stringify({ bank: raw && raw.bank, s: S.bank, failed: !!T.save.failed })); }
  // the pure layer
  ok(T.fmtTime(25.5) === '01:30' && T.money(-1234) === '-$1,234', 'time and money helpers');
  ok(T.bevelGeo(1, 1, 1) === T.bevelGeo(1, 1, 1) && T.propSeed('a', 1) !== T.propSeed('b', 1), 'the geometry cache and the prop seed');
  info('draws ' + T.counts().draws + ', baked ' + T.counts().baked + ', solids ' + T.solids.length + ', guests ' + T.PK.guests.length + ', cycles ' + S.cycles + ', level ' + T.PK.level);
`;
