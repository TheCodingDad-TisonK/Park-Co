//@ Park Co, part 04: the clock, the day, the panel and the guide
  // ── The clock and the day ─────────────────────────────────────────
  function pkTick(dt) {
    var previousTime = S.time;
    S.time += dt / 60;   // a game minute a second
    var min = Math.floor(S.time * 60);
    if (min !== PK.lastMin) { PK.lastMin = min; hudDirty = true; }
    var open = S.time >= 9 && S.time < 22;
    var rolledDay = false;
    if (S.time >= 24) { S.time -= 24; S.day++; PK.lastDay = S.day; pkNewDay(); open = S.time >= 9 && S.time < 22; rolledDay = true; }
    var closing = !open;
    PK.closed = closing;
    // the guests arrive while the gate is open
    if (open) {
      PK.spawnT -= dt;
      if (PK.spawnT <= 0) {
        PK.spawnT = randf(1.2, 2.8);                              // a busier gate: the lines should look like lines
        if (PK.guests.length < PK_GUEST_MAX) pkSpawnGuest();
      }
    }
    // a clerk works the window on their own
    if (open && S.clerk) {
      PK.clerkT = (PK.clerkT || 0) - dt;
      if (PK.clerkT <= 0) {
        PK.clerkT = 2.2;
        for (var i = 0; i < PK.booths.length; i++) if (PK.booths[i].queue.length) { pkServe(i); break; }
      }
    }
    if (closing && (rolledDay || PK.timeWasOpen === true || (PK.timeWasOpen === undefined && previousTime >= 9 && previousTime < 22))) {
      pkCloseGuests();
      for (var ci = 0; ci < PK.attractions.length; ci++) PK.attractions[ci].manualStart = false;
    }
    PK.timeWasOpen = open;
    pkRideTick(dt);
    for (var ai = 0; ai < PK.attractions.length; ai++) pkAttrTick(PK.attractions[ai], dt);
    pkGuestTick(dt);
    pkPlayerTick(dt);
  }
  function pkClosePark() {
    // Stop accepting new arrivals; let people already in the grounds finish
    // their current visit and leave, without starting another attraction cycle.
    pkCloseGuests();
    screenDirtyAll(); hudDirty = true;
  }
  function pkLog(msg) { logEvent(msg, ''); }
  function pkSyncSaved() {
    PK.xp = S.xp || 0; PK.level = pkLevel();
    PK.clerk = !!S.clerk; PK.operator = !!S.operator;
    PK.snackOpen = !!S.snackOpen; PK.train2 = !!S.train2; PK.lights = !!S.lights;
    PK.today = S.today || (S.today = { tickets: 0, snacks: 0, rides: 0, earned: 0 });
    PK.lastDay = S.day;
    screenDirtyAll(); hudDirty = true;
  }
  // ── The panel ─────────────────────────────────────────────────────
  // ── The park office ───────────────────────────────────────────────
  function pkAdminPanel(tab) {
    var tabs = [['park', 'Park'], ['coaster', 'Coaster'], ['staff', 'Staff']];
    tab = tab || 'park';
    var body = '';
    if (tab === 'park') {
      body = '<p>Day ' + S.day + ' - ' + fmtTime(S.time) + (PK.closed ? ' (closed)' : '') + '</p>' +
        '<p>Bank ' + money(S.bank) + '<br>Guests in the park ' + PK.guests.length + '<br>Rides open ' + pkOpenCount() + ' of ' + (PK.attractions.length + 1) + '</p>' +
        '<p>Today: ' + PK.today.tickets + ' tickets, ' + PK.today.snacks + ' snacks, ' + PK.today.rides + ' rides, ' + money(PK.today.earned) + '</p>' +
        '<p>Ticket ' + money(S.ticketPrice) + ' - snack ' + money(S.snackPrice) + '</p>' +
        btn('ticket5', '', 'Ticket +' + money(5), '') + btn('ticket-5', '', 'Ticket -' + money(5), '') +
        btn('snack5', '', 'Snack +' + money(1), '') + btn('snack-5', '', 'Snack -' + money(1), '');
    } else if (tab === 'coaster') {
      var wear = Math.round(S.wear || 0);
      body = '<p>The coaster: ' + pkRideWord() + ' (' + (pkCoasterAuto() ? 'auto' : 'manual') + ')</p>' +
        '<p>Cycles ' + (S.cycles || 0) + ' - ' + PK.cars.length + ' cars of ' + Math.round(PK.seats.length / PK.cars.length) + '<br>Aboard now ' + PK.ride.riders + ' of ' + PK.seats.length + '</p>' +
        '<p>Track ' + Math.round(PK.len) + ' m<br>Wear ' + wear + '%' + (wear >= 90 ? ' - it will not dispatch until it is serviced' : wear > 70 ? ' - service it soon' : '') + '</p>' +
        btn('service', '', 'Service (' + money(150) + ')', wear > 0 && S.bank >= 150 ? 'primary' : '') +
        btn('auto', '', pkCoasterAuto() ? 'AUTO on' : 'AUTO off', '');
    } else {
      body = '<p>Ticket clerk: ' + (S.clerk ? 'hired' : 'not hired') + '<br>Ride operator: ' + (S.operator ? 'hired' : 'not hired') + '</p>' +
        '<p>Wages ' + money((S.clerk ? 40 : 0) + (S.operator ? 60 : 0)) + ' a day</p>' +
        (S.clerk ? btn('fireClerk', '', 'Let the clerk go', '') : btn('hireClerk', '', 'Hire a clerk (' + money(400) + ')', '')) +
        (S.operator ? btn('fireOperator', '', 'Let the operator go', '') : btn('hireOperator', '', 'Hire an operator (' + money(600) + ')', ''));
    }
    return { title: 'Park office', tabs: tabs, tab: tab, body: body };
  }
  function pkPanel(kind, tab) {
    if (kind === 'admin') return pkAdminPanel(tab);
    if (kind !== 'park') return null;
    var tabs = [['park', 'Park'], ['rides', 'Rides'], ['ride', 'Coaster'], ['staff', 'Staff'], ['guide', 'Guide']];
    tab = tab || 'park';
    var body = '';
    if (tab === 'park') {
      body = '<p>Day ' + S.day + ' - ' + fmtTime(S.time) + (PK.closed ? ' (closed)' : '') + '</p>' +
        '<p>Guests in the park: ' + PK.guests.length + '<br>In the coaster queue: ' + PK.queue.length + '<br>Rides open: ' + pkOpenCount() + ' of ' + (PK.attractions.length + 1) + '</p>' +
        '<p>Tickets today: ' + PK.today.tickets + ' (' + money(PK.today.earned) + ')<br>Snacks today: ' + PK.today.snacks + '<br>Rides today: ' + PK.today.rides + '</p>' +
        '<p>Level ' + PK.level + ' - ' + esc(PK_LEVELS[PK.level - 1].name) + ' (' + PK.xp + ' xp)</p>' +
        btn('ticket5', '', 'Ticket +' + money(5), '') + btn('ticket-5', '', 'Ticket -' + money(5), '');
    } else if (tab === 'rides') {
      body = '<p>' + pkOpenCount() + ' of ' + (PK.attractions.length + 1) + ' rides open. Guests pick the shortest line.</p>';
      PK.attractions.forEach(function (a) {
        var st = !a.open ? 'opens at level ' + a.level
          : a.state === 'running' ? 'running'
          : a.state === 'boarding' ? 'boarding'
          : a.state === 'unloading' ? 'unloading'
          : a.state + ', ' + a.queue.length + ' waiting';
        body += '<p>' + esc(a.name) + ': ' + esc(st) + (a.open ? ' - ' + a.cycles + ' cycles, ' + a.riders + ' aboard' : '') + '</p>';
      });
    } else if (tab === 'ride') {
      body = '<p>The coaster: ' + pkRideWord() + (pkCoasterAuto() ? ' (auto)' : ' (manual)') + (PK.ride.fault ? ' - ' + esc(PK.ride.fault) : '') + '</p>' +
        '<p>Cycles today: ' + (S.cycles || 0) + '<br>Rides today: ' + PK.today.rides + '<br>Aboard now: ' + PK.ride.riders + ' of ' + PK.seats.length + '</p>' +
        btn('gates', '', 'Gates', '') + btn('bars', '', 'Restraints', '') + btn('dispatch', '', 'Dispatch', 'primary') +
        btn('stop', '', 'E-stop', '') + btn('auto', '', pkCoasterAuto() ? 'AUTO on' : 'AUTO off', '');
    } else if (tab === 'staff') {
      body = '<p>Ticket clerk: ' + (S.clerk ? 'hired' : 'not hired') + ' (' + money(400) + ')</p>' +
        '<p>Ride operator: ' + (S.operator ? 'hired' : 'not hired') + ' (' + money(600) + ')</p>' +
        '<p>A clerk serves the window. A hired ride operator takes over the coaster and all seven attraction rides.</p>' +
        (S.clerk ? btn('fireClerk', '', 'Let the clerk go', '') : btn('hireClerk', '', 'Hire a clerk', '')) +
        (S.operator ? btn('fireOperator', '', 'Let the operator go', '') : btn('hireOperator', '', 'Hire an operator', ''));
    } else {
      body = pkGuide();
    }
    return { title: 'Park Co', tabs: tabs, tab: tab, body: body };
  }
  function pkPanelAct(act, arg) {
    if (act === 'ticket5') { pkPrice(5); return true; }
    if (act === 'ticket-5') { pkPrice(-5); return true; }
    if (act === 'gates') return pkGatesToggle();
    if (act === 'bars') return PK.ride.barsWant > 0.5 ? pkBarsUp() : pkBarsDown();
    if (act === 'dispatch') return pkDispatch();
    if (act === 'stop') return pkStop();
    if (act === 'auto') { pkSetAuto(!pkCoasterAuto()); return true; }
    if (act === 'snack5') { pkSnackPrice(1); return true; }
    if (act === 'snack-5') { pkSnackPrice(-1); return true; }
    if (act === 'service') return pkService();
    if (act === 'fireClerk') { var fc = pkFire('clerk'); return fc === 'Let go' ? true : 'Action failed: ' + fc; }
    if (act === 'fireOperator') { var fo = pkFire('operator'); return fo === 'Let go' ? true : 'Action failed: ' + fo; }
    if (act === 'hireClerk') { var hc = pkHire('clerk'); if (hc === 'Hired') return true; toast(hc, 'bad'); return true; }
    if (act === 'hireOperator') { var ho = pkHire('operator'); if (ho === 'Hired') return true; toast(ho, 'bad'); return true; }
    return false;
  }
  function pkGuide() {
    return '<p><b>Park Co</b> - a small park that grows.</p>' +
      '<p>Guests arrive from the car park. They queue at a ticket window, buy a ticket, pass a turnstile and then pick a ride: the coaster, or any of the seven rides.</p>' +
      '<p><b>The window.</b> Your clerk sells tickets to the line on their own; stand at a window and press E to keep up with a rush (the screen on the counter sells too). The clerk costs ' + money(40) + ' a day from day 2.</p>' +
      '<p><b>The coaster.</b> In the operator room, east of the platform: <b>Gates</b> lifts the platform gates and the queue walks in one seat at a time, <b>Restraints</b> pulls the bars down over the riders, <b>Dispatch</b> sends the train. In the wrong order the screen refuses. An empty train can be sent as a test run. <b>E-stop</b> stops the ride; press it again to reset.</p>' +
      '<p><b>AUTO.</b> Switch AUTO on - on the screen in the operator room, or on any booth screen - and the coaster runs itself: gates, restraints, dispatch, round and round.</p>' +
      '<p><b>The other rides.</b> The carousel, teacups, ferris wheel, dodgems, drop tower, log flume and haunted house run automatically when AUTO is on. Each has an operator booth beside it - walk in and use its screen to open gates, dispatch, E-stop, test-run or change AUTO. A hired operator runs these rides automatically. Guests need a ticket before riding.</p>' +
      '<p><b>Levels.</b> Tickets, rides and snacks earn xp. Each level opens a service: the snack stand, a hire or the park lights.</p>';
  }
