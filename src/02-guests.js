//@ Park Co, part 02: the guests - who arrives, how they queue, how they buy a ticket and how they ride
  // ── The guests ────────────────────────────────────────────────────
  // A guest arrives from the car park, joins the shorter ticket line, buys a ticket, passes a turnstile, queues for the
  // coaster, boards when the gates open, rides, and goes home. The whole thing is a small state machine on a walk record.
  var PK_POOL = [];
  function pkTakeHuman() {
    if (PK_POOL.length) { var g = PK_POOL.pop(); g.visible = true; scene.add(g); return g; }
    return makeHuman({});
  }
  function pkParkHuman(g) {
    scene.remove(g);
    if (PK_POOL.length < 40) { g.visible = false; PK_POOL.push(g); return; }
    var blob = pkBlobOf(g);
    if (blob) g.remove(blob);
    disposeTree(g);
    if (blob) g.add(blob);
  }
  function pkSpawnGuest() {
    var g = pkTakeHuman();
    var x = randf(-18, 18), z = randf(58, 64);
    g.position.set(x, 0, z);
    g.rotation.set(0, Math.PI, 0);
    var gu = {
      id: PK.nextId++, g: g,
      rec: { x: x, z: z, yaw: Math.PI, path: [], speed: randf(1.3, 1.9) },
      state: 'toBooth', ticket: false, booth: -1, seat: null, attr: null, slot: -1, qslot: -1, rides: 0, pose: 'sit',
      hunger: randf(30, 90), ate: false, mood: 'neutral', t: 0
    };
    PK.guests.push(gu);
    return gu;
  }
  function pkGuestAt(x, z) {
    var best = null, bd = 9;
    PK.guests.forEach(function (gu) { var d = dist2(gu.rec.x, gu.rec.z, x, z); if (d < bd) { bd = d; best = gu; } });
    return best;
  }
  function pkPickBooth() {
    var best = 0, bl = 1e9;
    for (var i = 0; i < PK.booths.length; i++) { var n = PK.booths[i].queue.length; if (n < bl) { bl = n; best = i; } }
    return best;
  }
  function pkTurnstileAt(x) {
    for (var i = 0; i < PK.turnstiles.length; i++) if (Math.abs(PK.turnstiles[i].x - x) < 0.6) return PK.turnstiles[i];
    return null;
  }
  function pkGo(gu, x, z, next) {
    gu.rec.path = route({ x: gu.rec.x, z: gu.rec.z }, { x: x, z: z });
    gu.state = next;
  }
  // the coaster queue: one lane, one guest to a slot. A guest joins at the back, stands on their slot, and shuffles up as the
  // line drains. PK.queue is the line, front first; gu.qslot is where in it they stand.
  function pkQueueJoin(gu) {
    if (gu.state === 'walkQueue' || gu.state === 'queue' || gu.state === 'board' || gu.state === 'seated') return false;
    if (PK.queue.indexOf(gu) >= 0) return false;
    if (PK.queue.length >= PK_QUEUE_SLOTS.length) return false;
    gu.qslot = PK.queue.length;
    PK.queue.push(gu);
    gu.state = 'walkQueue';
    var s = PK_QUEUE_SLOTS[gu.qslot];
    gu.rec.path = route({ x: gu.rec.x, z: gu.rec.z }, PK_QUEUE_ENTRY).concat(route(PK_QUEUE_ENTRY, s));
    return true;
  }
  // Reserve an attraction slot when the guest commits to walking there. This
  // prevents arrivals from racing for the same queue position while in flight.
  function pkAttrQueueJoin(gu, a) {
    if (!a || !a.open || a.queue.indexOf(gu) >= 0) return false;
    if (a.queue.length >= a.seats.length * 2) return false;
    gu.attr = a.id;
    gu.slot = a.queue.length;
    a.queue.push(gu);
    var s = pkAttrSlot(a, gu.slot);
    pkGo(gu, s.x, s.z, 'walkAttr');
    return true;
  }
  function pkAttrQueueLeave(gu, a) {
    var i = a ? a.queue.indexOf(gu) : -1;
    if (i >= 0) { a.queue.splice(i, 1); if (typeof pkAttrQueueReslot === 'function') pkAttrQueueReslot(a); screenDirtyAll(); }
    gu.attr = null; gu.slot = -1;
  }
  function pkAttrQueueReslot(a) {
    for (var i = 0; i < a.queue.length; i++) {
      var gu = a.queue[i];
      if (gu.slot === i) continue;
      gu.slot = i;
      if (gu.state === 'walkAttr' || gu.state === 'qwait' || gu.state === 'qmove') {
        var s = pkAttrSlot(a, i);
        gu.rec.path = route({ x: gu.rec.x, z: gu.rec.z }, s);
        gu.state = gu.rec.path.length ? (gu.state === 'walkAttr' ? 'walkAttr' : 'qmove') : 'qwait';
      }
    }
  }
  function pkQueueReslot() {
    for (var i = 0; i < PK.queue.length; i++) {
      var gu = PK.queue[i];
      if (gu.qslot === i) continue;
      gu.qslot = i;
      if (gu.state === 'queue' || gu.state === 'walkQueue') {
        gu.rec.path = route({ x: gu.rec.x, z: gu.rec.z }, PK_QUEUE_SLOTS[i]);
        gu.state = 'walkQueue';
      }
    }
  }
  function pkGuestStep(gu, dt) {
    var rec = gu.rec, g = gu.g;
    gu.t += dt;
    var arrived = rec.path.length ? walkAlong(rec, rec.path, rec.speed, dt) : true;
    if (gu.state === 'toBooth') {
      var b = pkPickBooth();
      gu.booth = b;
      var s = pkBoothSlot(b, PK.booths[b].queue.length);
      pkGo(gu, s.x, s.z, 'walkBooth');
    } else if (gu.state === 'walkBooth') {
      if (arrived) { PK.booths[gu.booth].queue.push(gu); gu.state = 'boothQueue'; }
    } else if (gu.state === 'boothQueue') {
      // the window serves the front of the line
    } else if (gu.state === 'toTurn') {
      var tb = PK.booths[gu.booth] || PK.booths[0];
      if (!rec.path.length) pkGo(gu, tb.turnstile, PK_GATE_Z + 2, 'walkTurn');
    } else if (gu.state === 'walkTurn') {
      if (arrived) {
        var tb2 = PK.booths[gu.booth] || PK.booths[0];
        var t = pkTurnstileAt(tb2.turnstile);
        if (t) { t.spin = 1; t.pass++; }
        sfx('click');
        pkGuestPickRide(gu);
      }
    } else if (gu.state === 'walkQueue') {
      if (arrived) gu.state = 'queue';
    } else if (gu.state === 'queue') {
      // standing in line: the front of the line is invited in when the gates open (pkRideLoad)
    } else if (gu.state === 'walkAttr') {
      if (arrived) {
        var at = PK.attrById[gu.attr];
        if (!at || !at.open) {
          pkAttrQueueLeave(gu, at); pkGuestPickRide(gu);
        } else {
          gu.state = 'qwait';
          gu.rec.path = [];
          pkAttrQueueReslot(at);
          screenDirtyAll();
        }
      }
    } else if (gu.state === 'qwait') {
      // the ride boards this guest when its boarding starts
    } else if (gu.state === 'qmove') {
      if (arrived) gu.state = 'qwait';
    } else if (gu.state === 'walkSeat') {
      if (arrived) {
        var seatAttr = PK.attrById[gu.attr];
        if (seatAttr && gu.seat) pkAttrSit(seatAttr, gu, gu.seat);
        else gu.state = 'off';
      }
    } else if (gu.state === 'board') {
      if (arrived) pkSeatGuest(gu, gu.seat);   // they reached their car: step in and sit
    } else if (gu.state === 'seated') {
      // nothing to do but enjoy it
    } else if (gu.state === 'toSnack') {
      if (arrived) {
        if (!PK.closed && PK.snackOpen && S.bank >= S.snackPrice) {
          pay(S.snackPrice, 'Snack'); PK.today.snacks++; PK.today.earned += S.snackPrice; pkXp(1);
          gu.ate = true; sfx('cash'); say(g, 'Thanks!'); screenDirtyAll(); hudDirty = true;
        }
        if (PK.closed || S.bank < S.snackPrice) pkGo(gu, randf(-14, 14), randf(40, 56), 'leave');
        else gu.state = 'off';
      }
    } else if (gu.state === 'off') {
      if (!rec.path.length) {
        if (PK.closed) pkGo(gu, randf(-14, 14), randf(40, 56), 'leave');
        else if (PK.snackOpen && !gu.ate && gu.hunger > 60 && S.bank >= S.snackPrice) pkGo(gu, -13, 10.4, 'toSnack');
        else if ((gu.rides || 0) < 2 && randf(0, 1) < 0.55 && (pkQueueJoin(gu) || pkAttrPick(gu))) { /* off to another ride */ }
        else pkGo(gu, randf(-14, 14), randf(40, 56), 'leave');
      }
    } else if (gu.state === 'leave') {
      if (arrived) gu.state = 'gone';
    }
    if (gu.state !== 'seated') {
      g.position.set(rec.x, pkFloor(rec.x, rec.z), rec.z);
      g.rotation.y = rec.yaw;
      var moving = rec.path.length > 0;
      var mode = moving ? 'walk' : (gu.state === 'boothQueue' || gu.state === 'queue' || gu.state === 'board' ? 'wait' : 'idle');
      animateHuman(g, dt, mode, rec.speed, null, false);
    } else {
      animateHuman(g, dt, gu.pose === 'stand' ? 'idle' : 'sit', 0, null, false);
    }
  }
  function pkGuestTick(dt) {
    for (var i = PK.guests.length - 1; i >= 0; i--) {
      var gu = PK.guests[i];
      pkGuestStep(gu, dt);
      if (gu.state === 'gone') {
        pkParkHuman(gu.g);
        var qi = PK.queue.indexOf(gu); if (qi >= 0) { PK.queue.splice(qi, 1); pkQueueReslot(); }
        if (gu.attr) { var aq = PK.attrById[gu.attr]; if (aq) { var ai = aq.queue.indexOf(gu); if (ai >= 0) { aq.queue.splice(ai, 1); pkAttrQueueReslot(aq); } } }
        PK.guests.splice(i, 1);
      }
    }
  }
  function pkCloseGuests() {
    PK.guests.forEach(function (gu) {
      if (gu.state === 'seated' || gu.state === 'board') return;
      if (gu.booth >= 0 && PK.booths[gu.booth]) {
        var b = PK.booths[gu.booth], bi = b.queue.indexOf(gu);
        if (bi >= 0) { b.queue.splice(bi, 1); screenDirtyAll(); }
      }
      if ((gu.state === 'toBooth' || gu.state === 'walkBooth') && !gu.ticket) {
        gu.booth = -1;
        gu.state = 'leave'; pkGo(gu, randf(-14, 14), randf(40, 56), 'leave'); return;
      }
      if (gu.attr) pkAttrQueueLeave(gu, PK.attrById[gu.attr]);
      if (PK.queue.indexOf(gu) >= 0) { PK.queue.splice(PK.queue.indexOf(gu), 1); pkQueueReslot(); }
      gu.state = 'leave';
      pkGo(gu, randf(-14, 14), randf(40, 56), 'leave');
    });
  }
  // ── The ticket window ─────────────────────────────────────────────
  function pkServe(bi) {
    if (PK.closed) { sfx('bad'); toast('The park is closed', 'bad'); return false; }
    var b = PK.booths[bi]; if (!b) return false;
    var gu = null;
    for (var i = 0; i < b.queue.length; i++) if (b.queue[i].state === 'boothQueue') { gu = b.queue[i]; break; }
    if (!gu) { sfx('bad'); toast('Nobody is waiting at the window', 'bad'); return false; }
    pay(S.ticketPrice, 'Ticket');
    PK.today.tickets++; PK.today.earned += S.ticketPrice;
    pkXp(1);
    gu.ticket = true; gu.state = 'toTurn'; gu.booth = bi;
    b.queue.splice(b.queue.indexOf(gu), 1);
    sfx('cash'); say(gu.g, 'One, please!');
    toast('Ticket sold - ' + money(S.ticketPrice), 'good');
    screenDirtyAll(); hudDirty = true;
    return true;
  }
  // ── The day ───────────────────────────────────────────────────────
  function pkNewDay() {
    var wages = (S.clerk ? 40 : 0) + (S.operator ? 60 : 0);
    if (wages) pay(-wages, 'Wages');
    PK.today = S.today = { tickets: 0, snacks: 0, rides: 0, earned: 0 };
    logEvent('Day ' + S.day + ' begins' + (wages ? ' - wages ' + money(wages) : ''), '');
    screenDirtyAll(); hudDirty = true;
  }
