//@ Park Co, part 02: the guests - who arrives, how they queue, how they buy a ticket and how they ride
  // ── The guests ────────────────────────────────────────────────────
  // A guest arrives from the car park, joins the shorter ticket line, buys a ticket, passes a turnstile, queues for the
  // coaster, boards when the gates open, rides, and goes home. The whole thing is a small state machine on a walk record.
  var PK_POOL = [], PK_GUEST_MAX = 200;
  function pkTakeHuman() {
    if (PK_POOL.length) { var g = PK_POOL.pop(); g.visible = true; scene.add(g); return g; }
    // makeHuman builds the figure but does not put it in the world: without this every new guest walked, queued and rode
    // unseen, and only the odd one back from the pool showed
    var h = makeHuman({}); scene.add(h); return h;
  }
  function pkParkHuman(g) {
    scene.remove(g);
    if (PK_POOL.length < PK_GUEST_MAX) { g.visible = false; PK_POOL.push(g); return; }
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
      state: 'toBooth', ticket: false, booth: -1, turn: undefined, seat: null, attr: null, slot: -1, qslot: -1, rides: 0, pose: 'sit',
      hunger: randf(30, 90), ate: false, mood: 'neutral', t: 0, trash: false,
    gaveUp: {}, patience: 0, mWait: 0, lockWait: 0, lifeT: 0, lifeKind: null, lifeLook: null, binTarget: null, benchSeat: null, benchYaw: 0, turnSpun: false, goHome: false, carryItem: null
    };
    PK.guests.push(gu);
    return gu;
  }
  function pkGuestAt(x, z) {
    if (!PK.guests || !PK.guests.length) return null;
    var best = null, bd = 9;
    PK.guests.forEach(function (gu) { var d = dist2(gu.rec.x, gu.rec.z, x, z); if (d < bd) { bd = d; best = gu; } });
    return best;
  }
  function pkPickBooth() {
    if (!PK.booths || !PK.booths.length) return 0;
    // the shorter line, and a coin toss when both are empty: tie-breaking to the west window sent every guest through one
    // turnstile and left the east booth looking closed. The guests already on their way to a window count as in its line,
    // or a whole car park's worth arriving at once all picked the same empty window
    var best = [], bl = 1e9, coming = PK.booths.map(function () { return 0; });
    PK.guests.forEach(function (g) { if (g.state === 'walkBooth' && coming[g.booth] !== undefined) coming[g.booth]++; });
    for (var i = 0; i < PK.booths.length; i++) {
      var n = PK.booths[i].queue.length + coming[i];
      if (n < bl) { bl = n; best = [i]; } else if (n === bl) best.push(i);
    }
    return best[Math.floor(Math.random() * best.length)];
  }
  function pkTurnstileAt(x) {
    for (var i = 0; i < PK.turnstiles.length; i++) if (Math.abs(PK.turnstiles[i].x - x) < 0.6) return PK.turnstiles[i];
    return null;
  }
  // the two gates beside this booth, picking the one that has seen fewer guests so both arms in the bank keep working
  function pkPickTurnstile(bi) {
    if (!PK.booths || !PK.booths.length) return 0;
    var b = PK.booths[bi] || PK.booths[0];
    if (!b) return 0;
    var xs = (b && b.turnstiles) || [b ? b.turnstile : 0];
    if (!xs || !xs.length) return b.turnstile || 0;
    var best = xs[0], bestPass = Infinity;
    for (var i = 0; i < xs.length; i++) {
      var t = pkTurnstileAt(xs[i]), p = t ? t.pass : Infinity;
      if (p < bestPass) { bestPass = p; best = xs[i]; }
    }
    return best;
  }
  function pkGo(gu, x, z, next) {
    gu.rec.path = route({ x: gu.rec.x, z: gu.rec.z }, { x: x, z: z });
    gu.state = next;
  }
  // the coaster queue: one lane, one guest to a slot. A guest joins at the back, stands on their slot, and shuffles up as the
  // line drains. PK.queue is the line, front first; gu.qslot is where in it they stand.
  // A locked coaster (key OFF) still takes a line: the guests stand and wait for it to open, and give up in time (pkGuestBored).
  function pkQueueJoin(gu) {
    if (gu.gaveUp && gu.gaveUp.coaster) return false;
    if (gu.state === 'walkQueue' || gu.state === 'queue' || gu.state === 'board' || gu.state === 'seated') return false;
    if (!PK.queue || PK.queue.indexOf(gu) >= 0) return false;
    if (!PK_QUEUE_SLOTS || PK.queue.length >= PK_QUEUE_SLOTS.length) return false;
    gu.qslot = PK.queue.length;
    PK.queue.push(gu);
    gu.lockWait = 0;
    gu.state = 'walkQueue';
    var s = PK_QUEUE_SLOTS[gu.qslot];
    gu.rec.path = route({ x: gu.rec.x, z: gu.rec.z }, PK_QUEUE_ENTRY).concat(route(PK_QUEUE_ENTRY, s));
    return true;
  }
  // Reserve an attraction slot when the guest commits to walking there. This
  // prevents arrivals from racing for the same queue position while in flight.
  function pkAttrQueueJoin(gu, a) {
    if (!a || !a.open || !a.queue || a.queue.indexOf(gu) >= 0) return false;
    if (!a.seats || a.queue.length >= a.seats.length * 2) return false;
    gu.attr = a.id;
    gu.lockWait = 0;
    gu.slot = a.queue.length;
    a.queue.push(gu);
    gu.rec.path = pkAttrWalkTo(a, gu, gu.slot);
    gu.state = 'walkAttr';
    return true;
  }
  function pkAttrQueueLeave(gu, a) {
    if (!a || !a.queue) { gu.attr = null; gu.slot = -1; return; }
    var i = a.queue.indexOf(gu);
    if (i >= 0) { a.queue.splice(i, 1); if (typeof pkAttrQueueReslot === 'function') pkAttrQueueReslot(a); screenDirtyAll(); }
    gu.attr = null; gu.slot = -1;
  }
  function pkAttrQueueReslot(a) {
    if (!a || !a.queue) return;
    for (var i = 0; i < a.queue.length; i++) {
      var gu = a.queue[i];
      if (gu.slot === i) continue;
      var was = gu.slot;
      gu.slot = i;
      if (gu.state === 'walkAttr' || gu.state === 'qwait' || gu.state === 'qmove') {
        gu.rec.path = pkAttrWalkTo(a, gu, i, gu.state === 'walkAttr' ? undefined : was);
        gu.state = gu.rec.path.length ? (gu.state === 'walkAttr' ? 'walkAttr' : 'qmove') : 'qwait';
      }
    }
  }
  function pkQueueReslot() {
    if (!PK.queue) return;
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
  // the line as a guest sees it: guests standing on a slot, not the ones still walking across the park to reach it
  function pkQueueWaiting() {
    var n = 0;
    for (var i = 0; i < PK.queue.length; i++) if (PK.queue[i].state === 'queue') n++;
    return n;
  }
  // Waiting in a line for a ride that is locked (its operator key OFF) wears out: past the guest's patience they leave the
  // line, say so, and go and find something else. A ride that is open keeps its line; it is the lock nobody waits out.
  function pkGuestBored(gu, dt) {
    var coaster = gu.state === 'queue' || gu.state === 'walkQueue', at = coaster ? null : (PK.attrById ? PK.attrById[gu.attr] : null);
    var locked = coaster ? !S.coasterKey : !!(at && at.ctl && !at.ctl.key);
    if (!locked) return;
    gu.lockWait = (gu.lockWait || 0) + dt;
    if (!gu.patience) gu.patience = randf(70, 160);
    if (gu.lockWait < gu.patience) return;
    gu.gaveUp = gu.gaveUp || {};
    if (coaster) {
      gu.gaveUp.coaster = true;
      var qi = PK.queue.indexOf(gu); if (qi >= 0) { PK.queue.splice(qi, 1); pkQueueReslot(); }
    } else {
      gu.gaveUp[gu.attr] = true;
      pkAttrQueueLeave(gu, at);
    }
    say(gu.g, pick(['Still shut...', 'Not opening today', 'Something else, then']));
    gu.mood = 'sad';
    gu.lockWait = 0;
    pkGo(gu, randf(-6, 6), randf(8, 22), 'off');
  }
  // The self-service machine beside each ticket window: with no clerk staffing the window and the player not at it, the guest
  // at the front of the line waits a moment, then buys there at the same price, so the park keeps filling while you run a
  // ride. Selling at the window yourself (or a clerk) still serves first.
  var PK_MACHINE_WAIT = 6;
  function pkGuestMachine(gu, dt) {
    var b = PK.booths[gu.booth];
    if (S.clerk || PK.closed || !b || !b.queue || b.queue[0] !== gu) { gu.mWait = 0; return; }
    if (player && Math.hypot(player.x - b.x, player.z - (b.z + 2.0)) < 3.2) { gu.mWait = 0; return; }   // you are at the window
    gu.mWait = (gu.mWait || 0) + dt;
    if (gu.mWait < PK_MACHINE_WAIT) return;
    gu.mWait = 0;
    if (pkServe(gu.booth, true) && b.machine) b.machine.blink = 1.2;
  }
  function pkGuestStep(gu, dt) {
    var rec = gu.rec, g = gu.g;
    gu.t += dt;
    var arrived = rec.path.length ? walkAlong(rec, rec.path, rec.speed, dt) : true;
    // the gate is the only way in. While it is shut nobody still outside gets to start their day - not a guest who bought a
    // ticket just before the shut, and not a party whose car pulled in a moment later. pkCloseGuests handles the moment the
    // gate shuts; this also catches a loaded save and a car that unloads after it.
    if (PK.closed && (gu.state === 'toBooth' || gu.state === 'walkBooth' || gu.state === 'boothQueue' || gu.state === 'toTurn' || gu.state === 'walkTurn')) {
      if (PK.booths && gu.booth >= 0 && PK.booths[gu.booth]) {
        var gq = PK.booths[gu.booth].queue, gi = gq.indexOf(gu);
        if (gi >= 0) { gq.splice(gi, 1); screenDirtyAll(); }
      }
      gu.booth = -1; gu.ticket = false;
      gu.state = 'leave';
      pkGo(gu, randf(-14, 14), randf(40, 56), 'leave');
    }
    if (gu.state === 'toBooth') {
      var b = pkPickBooth();
      if (!PK.booths || !PK.booths[b]) { gu.state = 'off'; return; }
      gu.booth = b;
      var s = pkBoothSlot(b, PK.booths[b].queue.length);
      pkGo(gu, s.x, s.z, 'walkBooth');
    } else if (gu.state === 'walkBooth') {
      if (arrived && PK.booths && PK.booths[gu.booth]) { PK.booths[gu.booth].queue.push(gu); gu.state = 'boothQueue'; }
      else if (arrived) gu.state = 'off';
    } else if (gu.state === 'boothQueue') {
      // the window serves the front of the line; when nobody staffs it, the front of the line pays at the machine
      pkGuestMachine(gu, dt);
    } else if (gu.state === 'toTurn') {
      if (gu.turn === undefined) { gu.turn = pkPickTurnstile(gu.booth); gu.turnSpun = false; }
      if (gu.turn == null) { gu.state = 'off'; return; }
      if (!rec.path.length) pkGo(gu, gu.turn, PK_GATE_Z - 0.35, 'walkTurn');
    } else if (gu.state === 'walkTurn') {
      // the arms turn when the guest reaches the bars, not when they are still two metres short: push the arm as the
      // body passes through, and only then choose a ride
      var t = pkTurnstileAt(gu.turn);
      if (!gu.turnSpun && t && Math.hypot(rec.x - gu.turn, rec.z - PK_GATE_Z) <= 0.62) {
        gu.turnSpun = true;
        t.spin += Math.PI * 2 / 3; t.pass++;
        sfx('click');
      }
      if (arrived) pkGuestPickRide(gu);
    } else if (gu.state === 'walkQueue') {
      if (arrived) gu.state = 'queue';
    } else if (gu.state === 'queue') {
      // standing in line: the front of the line is invited in when the gates open (pkRideLoad)
      pkGuestBored(gu, dt);
    } else if (gu.state === 'walkAttr') {
      if (arrived) {
        var at = PK.attrById ? PK.attrById[gu.attr] : null;
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
      pkGuestBored(gu, dt);
    } else if (gu.state === 'qmove') {
      if (arrived) gu.state = 'qwait';
    } else if (gu.state === 'walkSeat') {
      if (arrived) {
        var seatAttr = PK.attrById[gu.attr];
        if (seatAttr && gu.seat) pkAttrSit(seatAttr, gu, gu.seat);
        else gu.state = 'off';
      }
    } else if (gu.state === 'board') {
      if (arrived) { gu.mood = 'happy'; pkSeatGuest(gu, gu.seat); }   // they reached their car: step in and sit
    } else if (gu.state === 'seated') {
      // nothing to do but enjoy it
    } else if (gu.state === 'toSnack') {
      if (arrived) {
        if (!PK.closed && PK.snackOpen && S.bank >= S.snackPrice) {
          pay(S.snackPrice, 'Snack'); PK.today.snacks++; PK.today.earned += S.snackPrice; pkXp(1);
          gu.ate = true; gu.trash = true; gu.mood = 'happy'; gu.carryItem = 'fries'; pkGuestItemEnsure(gu, 'fries'); sfx('cash'); say(g, 'Thanks!'); screenDirtyAll(); hudDirty = true;
        }
        if (PK.closed || S.bank < S.snackPrice) pkGo(gu, randf(-14, 14), randf(40, 56), 'leave');
        else gu.state = 'off';
      }
    } else if (gu.state === 'toIce') {
      if (arrived) {
        if (!PK.closed && PK.iceOpen && S.bank >= S.icePrice) {
          pay(S.icePrice, 'Ice cream'); PK.today.ice = (PK.today.ice || 0) + 1; PK.today.earned += S.icePrice; pkXp(1);
          gu.ate = true; gu.trash = true; gu.mood = 'happy'; gu.carryItem = 'ice'; pkGuestItemEnsure(gu, 'ice'); sfx('cash'); say(g, 'Thanks!'); screenDirtyAll(); hudDirty = true;
        }
        if (PK.closed || S.bank < S.icePrice) pkGo(gu, randf(-14, 14), randf(40, 56), 'leave');
        else gu.state = 'off';
      }
    } else if (gu.state === 'toToy') {
      if (arrived) {
        if (!PK.closed && PK.toyOpen && S.bank >= S.toyPrice) {
          pay(S.toyPrice, 'Toy'); PK.today.toys = (PK.today.toys || 0) + 1; PK.today.earned += S.toyPrice; pkXp(1);
          gu.mood = 'happy'; gu.carryItem = 'toy'; pkGuestItemEnsure(gu, 'toy'); sfx('cash'); say(g, 'Thanks!'); screenDirtyAll(); hudDirty = true;
        }
        gu.state = 'off';
      }
    } else if (gu.state === 'off') {
      if (!gu.trash && !PK.closed && Math.random() < dt * 0.02) gu.trash = true;   // picked up a drink or a wrapper somewhere off-screen
      // what next means a route across the park (a few ms each from far away), so a crowd standing up at once - a show
      // letting out, closing time - takes its turns over a few frames instead of all in one
      if (!rec.path.length && performance.now() - PK_THINK_T0 < PK_THINK_MS) {
        if (PK.closed || gu.goHome) { gu.goHome = false; pkGo(gu, randf(-14, 14), randf(40, 56), 'leave'); }
        else if (gu.trash && pkGuestBinGo(gu)) { /* off to the nearest bin */ }
        else if (PK.snackOpen && !gu.ate && gu.hunger > 60 && S.bank >= S.snackPrice) pkGo(gu, -13, 10.4, 'toSnack');
        else if (PK.iceOpen && !gu.ate && gu.hunger > 50 && S.bank >= S.icePrice) pkGo(gu, -8, 10.4, 'toIce');
        else if (PK.toyOpen && Math.random() < 0.15) pkGo(gu, -18, 10.4, 'toToy');
        else if (!gu.trash && randf(0, 1) < 0.22 && pkGuestLifeStart(gu)) { /* a bench, a phone call, a smoke, a chat */ }
        else if ((gu.rides || 0) < 4 && randf(0, 1) < 0.8 && (pkQueueJoin(gu) || pkAttrPick(gu))) { /* off to another ride */ }
        else pkGo(gu, randf(-14, 14), randf(40, 56), 'leave');
      }
    } else if (gu.state === 'toBin') {
      if (arrived) pkGuestBinArrive(gu);
    } else if (gu.state === 'toBench') {
      if (arrived) { gu.state = 'bench'; rec.path = []; rec.yaw = gu.benchYaw; }
    } else if (gu.state === 'bench') {
      gu.lifeT -= dt;
      if (gu.lifeT <= 0 || PK.closed) { pkLifeEnd(gu); gu.state = 'off'; }
    } else if (gu.state === 'life') {
      pkGuestLifeTick(gu, dt);
      if (gu.lifeT <= 0 || PK.closed) { pkLifeEnd(gu); gu.state = 'off'; }
    } else if (gu.state === 'leave') {
      if (arrived && !(typeof pkLotHome === 'function' && pkLotHome(gu))) gu.state = 'gone';             // out through the gate, then back to the car they came in
    } else if (gu.state === 'toCar') {
      if (arrived) pkLotBoard(gu);
    }
    if (gu.state === 'seated') {
      animateHuman(g, dt, gu.pose === 'stand' ? 'idle' : 'sit', 0, null, false);
      if (gu.clap) pkGuestClap(g);
    } else if (gu.state === 'bench') {
      g.position.set(rec.x, g.userData.baseY = pkFloor(rec.x, rec.z), rec.z);
      g.rotation.y = rec.yaw;
      animateHuman(g, dt, 'sit', 0, null, false);
    } else {
      // animateHuman puts the body at baseY, so baseY follows the floor: up a stair, onto a stand, back down again
      g.position.set(rec.x, g.userData.baseY = pkFloor(rec.x, rec.z), rec.z);
      g.rotation.y = rec.yaw;
      var moving = rec.path.length > 0;
      var carry = false, look = null;
      if (!moving && gu.state === 'life') {
        if (gu.lifeKind === 'smoke') carry = pkArmRaised(-1);
        else if (gu.lifeKind === 'phone') carry = pkArmRaised(1);
        else if (gu.lifeKind === 'chat' && gu.lifeLook) look = gu.lifeLook;
      }
      var mode = moving ? 'walk' : (gu.state === 'boothQueue' || gu.state === 'queue' || gu.state === 'qwait' || gu.state === 'board' ? 'wait' : 'idle');
      animateHuman(g, dt, mode, rec.speed, look, carry);
      if (g.userData.pkCig) g.userData.pkCig.visible = (!moving && gu.state === 'life' && gu.lifeKind === 'smoke');
      if (g.userData.pkPhone) g.userData.pkPhone.visible = (!moving && gu.state === 'life' && gu.lifeKind === 'phone');
      if (g.userData.pkItem) g.userData.pkItem.visible = !!gu.carryItem && gu.state !== 'seated' && gu.state !== 'bench' && gu.state !== 'board';
    }
  }
  var PK_THINK_T0 = 0, PK_THINK_MS = 4;   // the guests' share of a frame for working out where to go next
  function pkGuestTick(dt) {
    if (!PK.guests) return;
    PK_THINK_T0 = performance.now();
    for (var i = PK.guests.length - 1; i >= 0; i--) {
      var gu = PK.guests[i];
      if (!gu) continue;
      pkGuestStep(gu, dt);
      if (gu.state === 'gone') {
        if (gu.benchSeat) pkBenchRelease(gu);
        if (gu.g.userData.pkItem) { var _it = gu.g.userData.pkItem; if (_it.parent) _it.parent.remove(_it); gu.g.userData.pkItem = null; gu.g.userData.pkItemType = null; }
        gu.carryItem = null;
        pkParkHuman(gu.g);
        var qi = PK.queue.indexOf(gu); if (qi >= 0) { PK.queue.splice(qi, 1); pkQueueReslot(); }
        if (gu.attr) { var aq = PK.attrById[gu.attr]; if (aq) { var ai = aq.queue.indexOf(gu); if (ai >= 0) { aq.queue.splice(ai, 1); pkAttrQueueReslot(aq); } } }
        PK.guests.splice(i, 1);
      }
    }
  }
  function pkCloseGuests() {
    if (!PK.guests) return;
    PK.guests.forEach(function (gu) {
      if (!gu) return;
      if (gu.state === 'seated' || gu.state === 'board') return;
      if (gu.booth >= 0 && PK.booths[gu.booth]) {
        var b = PK.booths[gu.booth], bi = b.queue.indexOf(gu);
        if (bi >= 0) { b.queue.splice(bi, 1); screenDirtyAll(); }
      }
      if ((gu.state === 'toBooth' || gu.state === 'walkBooth') && !gu.ticket) {
        gu.booth = -1;
        gu.state = 'off'; gu.goHome = true; gu.rec.path = []; return;
      }
      // out of any line (the lines are put back in order once, below, not once a guest), and home through the guests'
      // own decision step, which spreads the routes over a few frames
      if (gu.attr) { var at = PK.attrById[gu.attr], ai = at ? at.queue.indexOf(gu) : -1; if (ai >= 0) at.queue.splice(ai, 1); gu.attr = null; gu.slot = -1; }
      var qi = PK.queue.indexOf(gu); if (qi >= 0) PK.queue.splice(qi, 1);
      gu.state = 'off'; gu.goHome = true; gu.rec.path = [];
    });
    if (PK.attractions) PK.attractions.forEach(function (a) { pkAttrQueueReslot(a); });
    pkQueueReslot(); screenDirtyAll();
  }
  // ── The ticket window ─────────────────────────────────────────────
  function pkServe(bi, machine) {
    if (PK.closed) { sfx('bad'); toast('The park is closed', 'bad'); return false; }
    var b = PK.booths[bi]; if (!b) return false;
    var gu = null;
    for (var i = 0; i < b.queue.length; i++) if (b.queue[i].state === 'boothQueue') { gu = b.queue[i]; break; }
    if (!gu) { sfx('bad'); toast('Nobody is waiting at the window', 'bad'); return false; }
    pay(S.ticketPrice, 'Ticket');
    PK.today.tickets++; PK.today.earned += S.ticketPrice;
    pkXp(1);
    gu.ticket = true; gu.state = 'toTurn'; gu.booth = bi; gu.turn = undefined; gu.mood = 'happy';
    var qi = b.queue.indexOf(gu); if (qi >= 0) b.queue.splice(qi, 1);
    if (machine) { say(gu.g, pick(['The machine, then', 'Card, beep, done', 'Got it!'])); PK.today.machine = (PK.today.machine || 0) + 1; }
    else { sfx('cash'); say(gu.g, 'One, please!'); toast('Ticket sold - ' + money(S.ticketPrice), 'good'); }
    screenDirtyAll(); hudDirty = true;
    return true;
  }
  // ── The day ───────────────────────────────────────────────────────
  function pkNewDay() {
    var wages = pkWages();
    if (wages) pay(-wages, 'Wages');
    PK.today = S.today = { tickets: 0, snacks: 0, rides: 0, earned: 0, ice: 0, toys: 0 };
    S.gateOpen = false; PK.gateWarn = {};   // shut till you open it yourself; the reminders get their day back too
    logEvent('Day ' + S.day + ' begins' + (wages ? ' - wages ' + money(wages) : '') + ' - the gate is shut', '');
    screenDirtyAll(); hudDirty = true;
  }
