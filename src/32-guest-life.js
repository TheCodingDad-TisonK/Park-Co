//@ Park Co, part 32: guests make a mess - litter, bins that fill up and need the sweepers, and guests who stop to live a
  // little: a bench, a phone call, a smoke, a chat with whoever is standing near them.
  // ── Bins: every one pkBin() builds (part 08) registers itself here ────────────────────────────────────────────────
  function pkBinNear(x, z, maxD) {
    var best = null, bd = maxD * maxD;
    (PK.bins || []).forEach(function (b) { var d = dist2(x, z, b.x, b.z); if (d < bd) { bd = d; best = b; } });
    return best;
  }
  var PK_SCRAP_COLS = [0xe8e2d4, 0xc9d4e0, 0xe0c060];
  // paper and cups poking over the rim once a bin is most of the way full; back out of sight once it is emptied
  function pkBinScrap(b) {
    if (b.scrap) return b.scrap;
    var g = new THREE.Group(); g.visible = false; b.g.add(g);
    [[-0.1, 0.02], [0.08, -0.05], [0.0, 0.08]].forEach(function (p, i) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.01), std({ color: PK_SCRAP_COLS[i], roughness: 0.9 }));
      m.position.set(p[0], 1.02 + i * 0.03, p[1]); m.rotation.set(randf(-0.5, 0.5), randf(0, 6.28), randf(-0.5, 0.5)); g.add(m);
    });
    b.scrap = g; return g;
  }
  function pkBinRefreshLook(b) { pkBinScrap(b).visible = b.fill / b.cap >= 0.7; }
  // ── Ground litter: a dropped wrapper or cup, capped so it never piles up without bound ───────────────────────────
  var PK_LITTER_MAX = 50, PK_LITTER_GEOS = null, PK_LITTER_COLS = [0xe8e2d4, 0xc9d4e0, 0xe0c060, 0xd0785a];
  function pkLitterGeos() {
    if (PK_LITTER_GEOS) return PK_LITTER_GEOS;
    PK_LITTER_GEOS = [keepShared(new THREE.BoxGeometry(0.13, 0.01, 0.1)), keepShared(new THREE.CylinderGeometry(0.045, 0.05, 0.11, 10))];
    return PK_LITTER_GEOS;
  }
  function pkLitterDrop(x, z) {
    PK.litter = PK.litter || [];
    if (PK.litter.length >= PK_LITTER_MAX) { var old = PK.litter.shift(); scene.remove(old.g); disposeTree(old.g); }
    var geos = pkLitterGeos(), geo = pick(geos), isCup = geo === geos[1];
    var m = new THREE.Mesh(geo, std({ color: pick(PK_LITTER_COLS), roughness: 0.9 }));
    m.rotation.set(isCup ? Math.PI / 2 : randf(-0.1, 0.1), randf(0, 6.28), 0);
    m.position.set(x, pkFloor(x, z) + (isCup ? 0.055 : 0.01), z);
    m.castShadow = false; scene.add(m);
    PK.litter.push({ x: x, z: z, g: m });
  }
  function pkLitterClear(x, z, r) {
    if (!PK.litter) return;
    var r2 = r * r;
    for (var i = PK.litter.length - 1; i >= 0; i--) { var l = PK.litter[i]; if (dist2(x, z, l.x, l.z) < r2) { scene.remove(l.g); disposeTree(l.g); PK.litter.splice(i, 1); } }
  }
  // ── Benches: two seats each, claimed while a guest sits and freed when they get up ───────────────────────────────
  function pkBenchFree(x, z, maxD) {
    var best = null, bd = maxD * maxD;
    (PK.benches || []).forEach(function (b) {
      var d = dist2(x, z, b.x, b.z); if (d >= bd) return;
      for (var i = 0; i < b.seats.length; i++) if (!b.seats[i].taken) { bd = d; best = { seat: b.seats[i], x: b.seats[i].x, z: b.seats[i].z, ry: b.ry }; break; }
    });
    return best;
  }
  function pkBenchRelease(gu) { if (gu.benchSeat) gu.benchSeat.seat.taken = null; gu.benchSeat = null; }
  // ── A cigarette or a phone, held in a hand once a guest needs one, reused for as long as they are pooled ─────────
  var PK_CIG_GEO = null, PK_CIG_MAT = null, PK_EMBER_GEO = null, PK_EMBER_MAT = null, PK_PHONE_MAT = null;
  function pkCigAssets() {
    if (!PK_CIG_GEO) { PK_CIG_GEO = keepShared(new THREE.CylinderGeometry(0.006, 0.005, 0.07, 6)); PK_CIG_MAT = keepShared(std({ color: 0xf5f0e0, roughness: 0.9 })); PK_EMBER_GEO = keepShared(new THREE.SphereGeometry(0.009, 6, 6)); PK_EMBER_MAT = keepShared(glowMat(0xff6a1a, 2.0)); }
    return { geo: PK_CIG_GEO, mat: PK_CIG_MAT, emberGeo: PK_EMBER_GEO, emberMat: PK_EMBER_MAT };
  }
  function pkPhoneMat() { return PK_PHONE_MAT || (PK_PHONE_MAT = keepShared(std({ color: 0x14171c, roughness: 0.3, metalness: 0.2 }))); }
  function pkGuestHand(g, side) { var i = side < 0 ? 0 : 1, arm = g.userData.arms && g.userData.arms[i]; return arm && arm.userData.elbow && arm.userData.elbow.userData.hand; }
  function pkGuestCigEnsure(gu) {
    if (gu.g.userData.pkCig) return;
    var hand = pkGuestHand(gu.g, -1); if (!hand) return;
    var A = pkCigAssets(), grp = new THREE.Group(); grp.visible = false; grp.position.set(0, 0.02, 0.03); grp.rotation.x = -0.3; hand.add(grp);
    grp.add(new THREE.Mesh(A.geo, A.mat));
    var ember = new THREE.Mesh(A.emberGeo, A.emberMat); ember.position.y = 0.045; grp.add(ember);
    gu.g.userData.pkCig = grp;
  }
  function pkGuestPhoneEnsure(gu) {
    if (gu.g.userData.pkPhone) return;
    var hand = pkGuestHand(gu.g, 1); if (!hand) return;
    var grp = new THREE.Group(); grp.visible = false; grp.position.set(0, 0.03, 0.01); hand.add(grp);
    grp.add(new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.09, 0.012), pkPhoneMat()));
    gu.g.userData.pkPhone = grp;
  }
  // one arm bent up toward the head (a phone to the ear, a cigarette to the mouth); the other hangs relaxed
  function pkArmRaised(side) {
    return function (la, ra, le, re) {
      var sh = side < 0 ? la : ra, el = side < 0 ? le : re, osh = side < 0 ? ra : la, oel = side < 0 ? re : le;
      sh.rotation.x = -1.6; sh.rotation.z = side * 0.3; el.rotation.x = -2.0;
      osh.rotation.x = -0.1; osh.rotation.z = side * -0.05; oel.rotation.x = -0.15;
    };
  }
  // ── What a guest says while living a little ────────────────────────────────────────────────────────────────────
  var PK_LIFE_LINES = {
    phone: ['No way, really?', "Can you hear me?", "I'll call you back.", 'One sec, bad signal.', "We're at the park!"],
    smoke: ['Needed that.', 'Just a quick one.', 'Five minutes, promise.'],
    chat: ['Did you see that ride?', "I'm starving.", 'This place is great.', 'We should do the coaster next.', 'My feet hurt already.']
  };
  function pkNearbyIdleGuest(gu) {
    var best = null, bd = 2.3 * 2.3;
    PK.guests.forEach(function (o) { if (o === gu || o.state !== 'off') return; var d = dist2(gu.rec.x, gu.rec.z, o.rec.x, o.rec.z); if (d < bd) { bd = d; best = o; } });
    return best;
  }
  function pkGuestLifeStart(gu) {
    var roll = Math.random();
    if (roll < 0.3) {
      var seat = pkBenchFree(gu.rec.x, gu.rec.z, 14);
      if (seat) { gu.benchSeat = seat; seat.seat.taken = gu; gu.benchYaw = seat.ry; gu.lifeT = randf(14, 28); pkGo(gu, seat.x, seat.z, 'toBench'); return true; }
    }
    if (roll < 0.55) { gu.lifeKind = 'smoke'; gu.lifeT = randf(10, 18); gu.lifeNext = randf(1, 2); gu.state = 'life'; pkGuestCigEnsure(gu); return true; }
    if (roll < 0.8) { gu.lifeKind = 'phone'; gu.lifeT = randf(8, 16); gu.lifeNext = randf(0.5, 1.5); gu.state = 'life'; pkGuestPhoneEnsure(gu); return true; }
    var mate = pkNearbyIdleGuest(gu);
    if (mate) { gu.lifeKind = 'chat'; gu.lifeT = randf(8, 16); gu.lifeNext = randf(0.3, 1); gu.lifeLook = { x: mate.rec.x, z: mate.rec.z }; gu.state = 'life'; return true; }
    gu.lifeKind = 'idle'; gu.lifeT = randf(5, 10); gu.lifeNext = 9e9; gu.state = 'life'; return true;
  }
  function pkGuestLifeTick(gu, dt) {
    gu.lifeT -= dt;
    if (gu.lifeKind === 'idle') return;
    gu.lifeNext -= dt; if (gu.lifeNext > 0) return;
    if (gu.lifeKind === 'smoke') { gu.lifeNext = randf(3, 6); burst(gu.rec.x, pkFloor(gu.rec.x, gu.rec.z) + 1.55, gu.rec.z, 0xc9d1cc, 5, 'smoke'); if (Math.random() < 0.4) say(gu.g, pick(PK_LIFE_LINES.smoke)); }
    else if (gu.lifeKind === 'phone') { gu.lifeNext = randf(3, 6); say(gu.g, pick(PK_LIFE_LINES.phone)); }
    else if (gu.lifeKind === 'chat') { gu.lifeNext = randf(2.5, 5); say(gu.g, pick(PK_LIFE_LINES.chat)); }
  }
  function pkLifeEnd(gu) { pkBenchRelease(gu); gu.lifeKind = null; gu.lifeLook = null; }
  // ── Trash: a guest who is carrying something walks it to the nearest bin, and sometimes misses ─────────────────
  function pkGuestBinGo(gu) {
    var b = pkBinNear(gu.rec.x, gu.rec.z, 18); if (!b) return false;
    gu.binTarget = b; pkGo(gu, b.x + randf(-0.4, 0.4), b.z + randf(0.9, 1.3), 'toBin'); return true;
  }
  function pkGuestBinArrive(gu) {
    var b = gu.binTarget; gu.binTarget = null; gu.trash = false; gu.state = 'off';
    var overflow = !!b && b.fill >= b.cap, miss = !b || overflow || Math.random() < 0.15;
    if (b && !miss) { b.fill++; pkBinRefreshLook(b); sfx('ok'); say(gu.g, pick(['In it goes!', 'There we go.', 'Tidy!'])); }
    else { pkLitterDrop((b ? b.x : gu.rec.x) + randf(-0.6, 0.6), (b ? b.z : gu.rec.z) + randf(-0.6, 0.6)); say(gu.g, pick(['Oops, missed.', 'Close enough.', overflow ? 'Full already!' : 'Eh, somebody will get it.'])); }
  }
  // ── The sweepers (part 07's own NPCs) empty a bin and clear the litter around it as their wander takes them past ──
  hook('frame', function (dt) {
    if (typeof npcList === 'undefined' || !PK.bins) return;
    npcList.forEach(function (n) {
      if (!/^sweeper/.test(n.charId || '')) return;
      PK.bins.forEach(function (b) {
        if (dist2(n.x, n.z, b.x, b.z) >= 6.25) { b.sweepT = 0; return; }
        if (b.fill <= 0) return;
        b.sweepT = (b.sweepT || 0) + dt;
        if (b.sweepT > 1.2) { b.sweepT = 0; b.fill = Math.max(0, b.fill - 1); pkBinRefreshLook(b); pkLitterClear(b.x, b.z, 3); }
      });
    });
  });
