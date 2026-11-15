//@ Park Co, part 65: the box on its pole (tison, 2026-11-15). At the end of every platform, on the platform side of the train: a pole with a
//@ little box on it, three buttons (STN GATES, BARS, RELEASE) and a status face that says SOLO or DUO and who is on the platform. The player
//@ presses the buttons with E; a hired hand presses them too (part 64 holds the rules). They work only in DUO. The box is placed once the park
//@ is up, on a spot a walker can stand: the first free one near the platform's front end for a coaster built on the kit, on the platform ring's
//@ edge for a flat ride, at the ride's gate for the others. Its face looks away from the train, so whoever works it looks at the box with the
//@ train beyond it.
  // the three rides with a look of their own get a box and pole to match: Dance Macabre (black iron, bone and violet, a skull on top),
  // the Dragon Ride (oak and iron, brass buttons, a little dragon's head) and Dream Flight (silver and lilac, a moon and a star)
  var PK_PL_STYLE = {
    danse: { pole: 0x17131d, body: 0x2b1d3b, hood: 0x17131d, band: 0xe6dcc4, caps: [0xe6dcc4, 0xb48cff, 0xd2493a], title: '#d0b0ff', glow: 0xb48cff, metal: 0.55,
      top: function (g, M) { var bone = std({ color: 0xe6dcc4, roughness: 0.7 }), dk = std({ color: 0x120d16, roughness: 0.6 }); sphere(0.075, bone, 0, 1.76, 0, g); box(0.09, 0.04, 0.07, bone, 0, 1.69, 0.015, g); sphere(0.02, dk, -0.028, 1.775, 0.062, g); sphere(0.02, dk, 0.028, 1.775, 0.062, g); } },
    joris: { pole: 0x7a5636, body: 0x5c3f26, hood: 0x3f2a18, band: 0x2c2a2c, caps: [0xe0b050, 0xe0b050, 0x4fb04f], title: '#f0c06a', glow: 0xe0b050, metal: 0.25,
      top: function (g, M) { var gr = std({ color: 0x3f8f4a, roughness: 0.6 }); var hd = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 8), gr); hd.rotation.x = Math.PI / 2; hd.position.set(0, 1.72, 0.05); g.add(hd); sphere(0.055, gr, 0, 1.72, -0.02, g); [-1, 1].forEach(function (s2) { var hn = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.08, 6), std({ color: 0xe8dcb8, roughness: 0.6 })); hn.position.set(s2 * 0.04, 1.79, -0.03); hn.rotation.z = -s2 * 0.5; g.add(hn); }); } },
    droom: { pole: 0xb8c0d8, body: 0x20284a, hood: 0x8a7ad0, band: 0xd8d0f0, caps: [0xc9b8ff, 0x9fd0ff, 0xffe9a0], title: '#cdd6ff', glow: 0x9fb8ff, metal: 0.6,
      top: function (g, M) { var moon = new THREE.Mesh(new THREE.RingGeometry(0.035, 0.07, 20, 1, 0.5, 3.8), new THREE.MeshBasicMaterial({ color: 0xe8dcff, side: THREE.DoubleSide })); moon.position.set(0, 1.74, 0.02); g.add(moon); sphere(0.018, new THREE.MeshBasicMaterial({ color: 0xfff2c8 }), 0.05, 1.78, 0.02, g); } }
  };
  function pkPlatRectAt(x, z) {
    if (typeof PK_FLOOR_RECTS === 'undefined') return null;
    for (var i = 0; i < PK_FLOOR_RECTS.length; i++) { var r = PK_FLOOR_RECTS[i]; if (!r.overhead && x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1 && r.y > 0.3) return r; }
    return null;
  }
  // is a solid in the way of someone standing at (x, z) on a floor at height y
  function pkPlatSolid(x, z, y) {
    for (var i = 0; i < solids.length; i++) { var s = solids[i]; if (x > s.x0 - 0.3 && x < s.x1 + 0.3 && z > s.z0 - 0.3 && z < s.z1 + 0.3 && y + 0.1 < s.y1 && y + 1.7 > s.y0) return true; }
    return false;
  }
  function pkPlatFree(x, z, y0) { return !collides(x, z) && Math.abs(floorY(x, z, 0) - y0) < 0.45; }
  function pkPlatSpot(a) {
    var E = a.extra, y0 = floorY(a.qx, a.qz, 0), ds = [1.9, 2.5, 3.1, 1.5, 3.7, 1.2], i, found = null;
    if (a.id === 'ktoy') return { x: PK_TT.x - 5.5, z: PK_TT.z + 3.5, nx: 0, nz: -1 };   // inside the hall, at the south end of the platform, face to the north

    if (a.main) {   // the main coaster's platform: its front (east) end, on the south side of the train
      for (var mx = 3.4; mx < 9 && !found; mx += 0.6) for (var mz = -2.6; mz < 1.2 && !found; mz += 0.4) if (!pkPlatSolid(PK.stationX0 + mx, mz, 0) && !pkPlatSolid(PK.stationX0 + mx, mz + 0.4, 0)) found = { x: PK.stationX0 + mx, z: mz, nx: 0, nz: 1 };
      return found;
    }
    if (E && E.curve && E.uPark !== undefined && E.len) {
      // the platform deck beside the train's parking place: the biggest raised floor within 4 m of it. The box stands on its middle line a
      // little short of its front end (the way the train leaves), its face turned away from the track
      var p0 = E.curve.getPointAt(E.uPark), t0 = E.curve.getTangentAt(E.uPark), best = null, bestA = 0;
      if (typeof PK_FLOOR_RECTS !== 'undefined') PK_FLOOR_RECTS.forEach(function (r) {
        if (r.overhead || !(r.y > 0.3)) return;
        var dx = Math.max(r.x0 - p0.x, 0, p0.x - r.x1), dz = Math.max(r.z0 - p0.z, 0, p0.z - r.z1), ar = (r.x1 - r.x0) * (r.z1 - r.z0);
        if (Math.hypot(dx, dz) < 4 && ar > bestA) { best = r; bestA = ar; }
      });
      if (best) {
        var ax = Math.abs(t0.x) >= Math.abs(t0.z), fwd = ax ? (t0.x >= 0 ? 1 : -1) : (t0.z >= 0 ? 1 : -1);
        var mid = ax ? (best.z0 + best.z1) / 2 : (best.x0 + best.x1) / 2, trk = ax ? p0.z : p0.x, away = mid >= trk ? 1 : -1;
        for (var step = 0; step < 9 && !found; step++) {
          var along = (ax ? (fwd > 0 ? best.x1 : best.x0) : (fwd > 0 ? best.z1 : best.z0)) - fwd * (0.8 + step * 0.6);
          var bx2 = ax ? along : mid, bz2 = ax ? mid : along;
          if (bx2 >= best.x0 && bx2 <= best.x1 && bz2 >= best.z0 && bz2 <= best.z1 && !pkPlatSolid(bx2, bz2, best.y)) found = { x: bx2, z: bz2, nx: ax ? 0 : away, nz: ax ? away : 0, y: best.y };
        }
      }
    }
    if (!found && !a.continuous && a.seats && a.seats.length && typeof PK_FLOOR_RECTS !== 'undefined') {
      // a ride with its own platform deck (the Dragon Ride, the Dance Ride): the biggest raised deck within 6 m of where its seats stand
      // at the station, the box at the deck's far end from the queue, on its middle line, its face turned away from the seats
      var cx0 = 0, cz0 = 0, n0 = 0;
      a.seats.forEach(function (st) { try { var w = pkAttrSeatWorld(st); cx0 += w.x; cz0 += w.z; n0++; } catch (e) {} });
      if (n0) {
        cx0 /= n0; cz0 /= n0;
        var bestR = null, bestAr = 0;
        PK_FLOOR_RECTS.forEach(function (r) {
          if (r.overhead || !(r.y > 0.3)) return;
          var dx = Math.max(r.x0 - cx0, 0, cx0 - r.x1), dz = Math.max(r.z0 - cz0, 0, cz0 - r.z1), ar = (r.x1 - r.x0) * (r.z1 - r.z0);
          if (Math.hypot(dx, dz) < 6 && ar > bestAr) { bestR = r; bestAr = ar; }
        });
        if (bestR) {
          var wide = (bestR.x1 - bestR.x0) >= (bestR.z1 - bestR.z0), qpos = wide ? a.qx : a.qz, lo = wide ? bestR.x0 : bestR.z0, hi = wide ? bestR.x1 : bestR.z1;
          var far = Math.abs(qpos - lo) > Math.abs(qpos - hi) ? lo : hi, dirE = far === lo ? 1 : -1, midc = wide ? (bestR.z0 + bestR.z1) / 2 : (bestR.x0 + bestR.x1) / 2, seatc = wide ? cz0 : cx0, awayS = midc >= seatc ? 1 : -1;
          for (var st2 = 0; st2 < 9 && !found; st2++) {
            var al = far + dirE * (0.8 + st2 * 0.6), px = wide ? al : midc, pz = wide ? midc : al;
            if (px >= bestR.x0 && px <= bestR.x1 && pz >= bestR.z0 && pz <= bestR.z1 && !pkPlatSolid(px, pz, bestR.y)) found = { x: px, z: pz, nx: wide ? 0 : awayS, nz: wide ? awayS : 0, y: bestR.y };
          }
        }
      }
    }
    if (!found && a.station && a.station.r) {
      var R = a.station.r, ex = a.station.exit ? a.station.exit[0] - a.x : a.qx - a.x, ez = a.station.exit ? a.station.exit[1] - a.z : a.qz - a.z, base = Math.atan2(ez, ex);
      for (i = 0; i < 24 && !found; i++) {
        var ang = base + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 0.17, rr = R - [0.7, 1.0, 0.45, 1.3][i % 4];   // just inside the fence, outside the ride's own turn; the face looks inward
        var cx = a.x + Math.cos(ang) * rr, cz = a.z + Math.sin(ang) * rr;
        if (pkPlatFree(cx, cz, y0)) found = { x: cx, z: cz, nx: -Math.cos(ang), nz: -Math.sin(ang) };
      }
    }
    if (!found) {
      for (var rr2 = 1.8; rr2 < 4.6 && !found; rr2 += 0.6) for (var k = 0; k < 12 && !found; k++) {
        var an = (a.qdx >= 0 ? Math.PI : 0) + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.5, x2 = a.qx + Math.cos(an) * rr2, z2 = a.qz + Math.sin(an) * rr2;
        if (pkPlatFree(x2, z2, y0)) { var l = Math.hypot(x2 - a.x, z2 - a.z) || 1; found = { x: x2, z: z2, nx: (x2 - a.x) / l, nz: (z2 - a.z) / l }; }
      }
    }
    return found;
  }
  // (tison, 2026-11-15: "let me move it myself in the Co Engine editor"): a world item, so Ctrl and the left button drag it, Ctrl and the wheel
  // turn it, and where it ends up is saved with the world's other edits. Its logic follows: the stand-point, the distance for the platform
  // crew and the worker's place are read from the group every frame.
  function pkPlatBoxBuild(a) {
    var sp = pkPlatSpot(a); if (!sp) return null;
    var box = null;
    worldItem('platform box', function () { box = pkPlatBoxMake(a, sp); });
    return box;
  }
  function pkPlatBoxMake(a, sp) {
    var g = new THREE.Group(), yaw = Math.atan2(sp.nx, sp.nz), gy = sp.y !== undefined ? sp.y : floorY(sp.x, sp.z, 0);
    g.position.set(sp.x, gy, sp.z); g.rotation.y = yaw; parentOf(null).add(g);
    var ST = PK_PL_STYLE[a.id] || null, steel = ST ? std({ color: ST.pole, roughness: 0.5, metalness: ST.metal }) : MAT.steelDark, yel = std({ color: ST ? ST.band : 0xf0c04a, roughness: 0.55 });
    pkRoundCyl(0.15, 0.04, steel, 0, 0.02, 0, g, 14);                       // the base plate
    pkRoundCyl(0.036, 1.16, steel, 0, 0.62, 0, g, 10);                      // the pole
    pkRoundCyl(0.042, 0.12, yel, 0, 0.26, 0, g, 10);                        // a safety band
    pkBevelBox(0.42, 0.34, 0.15, std({ color: ST ? ST.body : 0x1f2a36, roughness: 0.5, metalness: ST ? ST.metal : 0.3 }), 0, 1.42, 0, g, 0.02);
    pkBevelBox(0.46, 0.04, 0.19, ST ? std({ color: ST.hood, roughness: 0.6, metalness: ST.metal }) : yel, 0, 1.6, 0, g, 0.01);                  // the hood
    if (ST) ST.top(g, pkMats());
    solid(sp.x - 0.12, sp.x + 0.12, sp.z - 0.12, sp.z + 0.12, gy, gy + 1.2);
    var W = 380, H = 300, face = touchScreen({
      w: W, h: H, pw: 0.38, ph: 0.30, x: 0, y: 1.42, z: 0.078, parent: g, title: a.name + ': platform box',
      draw: function (c) {
        var C = pkCtl(a), P = pkPlat(a), duo = pkDuo(a);
        scBg(c, W, H);
        c.textAlign = 'left'; c.fillStyle = ST ? ST.title : '#ffc65a'; c.font = 'bold 22px ' + SCREEN_THEME.font; c.fillText('PLATFORM', 18, 34);
        var chip = duo ? 'DUO' : 'SOLO'; c.font = 'bold 15px ' + SCREEN_THEME.font; var cw = c.measureText(chip).width + 22;
        c.fillStyle = duo ? 'rgba(245,181,61,0.22)' : 'rgba(255,255,255,0.09)'; c.beginPath(); if (c.roundRect) c.roundRect(W - 18 - cw, 14, cw, 26, 13); else c.rect(W - 18 - cw, 14, cw, 26); c.fill();
        c.fillStyle = duo ? '#ffc65a' : '#9fb0c3'; c.textAlign = 'center'; c.fillText(chip, W - 18 - cw / 2, 33);
        c.textAlign = 'left'; c.fillStyle = '#9fb0c3'; c.font = '600 14px ' + SCREEN_THEME.font;
        c.fillText(!duo ? 'Set the cabinet to DUO to use this box' : (P.crew ? 'ON THE PLATFORM: ' + pkPlatWho(a) : 'NOBODY ON THE PLATFORM'), 18, 62, W - 36);
        var cols = [[70, 'STN GATES', duo && a.stationGates === false, '#6fe0a0'], [190, 'BARS', duo && C.barsWant > 0.5, '#ffc65a'], [310, 'RELEASE', duo && P.rel, '#7fb4ff']];
        for (var i = 0; i < 3; i++) {
          c.fillStyle = cols[i][2] ? cols[i][3] : 'rgba(255,255,255,0.13)'; c.beginPath(); c.arc(cols[i][0], 100, 9, 0, 6.283); c.fill();
          if (cols[i][2]) { c.strokeStyle = cols[i][3]; c.globalAlpha = 0.35; c.lineWidth = 5; c.beginPath(); c.arc(cols[i][0], 100, 14, 0, 6.283); c.stroke(); c.globalAlpha = 1; }
          c.fillStyle = '#eef2f7'; c.font = 'bold 15px ' + SCREEN_THEME.font; c.textAlign = 'center'; c.fillText(cols[i][1], cols[i][0], 252);
          c.fillStyle = cols[i][2] ? cols[i][3] : '#7f8fa1'; c.font = '600 12px ' + SCREEN_THEME.font; c.fillText(i === 0 ? (cols[i][2] ? 'SHUT' : 'OPEN') : i === 1 ? (cols[i][2] ? 'DOWN' : 'UP') : (cols[i][2] ? 'GIVEN' : 'WAITING'), cols[i][0], 275);
        }
        c.textAlign = 'left';
      }
    });
    pkPowerScreen(face, function () { return !!a.open; });
    var fi = inter.indexOf(face.mesh); if (fi >= 0) inter.splice(fi, 1);   // the face is not a target: the three buttons in front of it are
    var caps = [], defs = [['station', -0.12, ST ? ST.caps[0] : 0x6fe0a0], ['bars', 0, ST ? ST.caps[1] : 0xffc65a], ['release', 0.12, ST ? ST.caps[2] : 0x7fb4ff]];
    defs.forEach(function (d) {
      var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.03, 18), std({ color: d[2], roughness: 0.4, metalness: 0.1, emissive: d[2], emissiveIntensity: 0.12 }));
      cap.rotation.x = Math.PI / 2; cap.position.set(d[1], 1.40, 0.1); cap.userData.dynamic = true; cap.userData.keep = true; g.add(cap);
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.007, 8, 20), MAT.chrome); ring.position.set(d[1], 1.40, 0.088); g.add(ring);
      caps.push({ which: d[0], mesh: cap, z0: 0.1, press: 0 });
      hitBox(0.1, 0.11, 0.12, d[1], 1.40, 0.11, {
        prompt: function () { return !pkDuo(a) ? a.name + ': platform box (DUO only)' : d[0] === 'station' ? 'Station gates: ' + (a.stationGates === false ? 'open them' : 'shut them') : d[0] === 'bars' ? 'Restraints: ' + (pkCtl(a).barsWant > 0.5 ? 'raise' : 'lower') : 'Give the release (platform clear)'; },
        use: function () { pkPlatPress(a, d[0]); pkPlatBoxPress(a, d[0]); }
      }, g);
    });
    var box = { x: sp.x, z: sp.z, sx: sp.x + sp.nx * 0.95, sz: sp.z + sp.nz * 0.95, faceYaw: Math.atan2(-sp.nx, -sp.nz), g: g, caps: caps, face: face, sig: '' };
    var V = new THREE.Vector3(), Q = new THREE.Quaternion(), EU = new THREE.Euler();
    animate(function (dt) {
      g.updateWorldMatrix(true, false); g.getWorldPosition(V); g.getWorldQuaternion(Q); EU.setFromQuaternion(Q, 'YXZ');
      var nx = Math.sin(EU.y), nz = Math.cos(EU.y); box.x = V.x; box.z = V.z; box.sx = V.x + nx * 0.95; box.sz = V.z + nz * 0.95; box.faceYaw = Math.atan2(-nx, -nz);
      caps.forEach(function (c2) { if (c2.press > 0) c2.press = Math.max(0, c2.press - dt * 5); c2.mesh.position.z = c2.z0 - 0.014 * c2.press; });
      var C = pkCtl(a), P = pkPlat(a), sig = [pkDuo(a), P.crew ? pkPlatWho(a) : '', a.stationGates === false, C.barsWant > 0.5, P.rel, !!a.open].join('|');
      if (sig !== box.sig) { box.sig = sig; face.dirty = true; }
    });
    pkFuse(g);
    return box;
  }
  function pkPlatBoxPress(a, which) { var b = a.platBox; if (!b) return; b.caps.forEach(function (c) { if (c.which === which) c.press = 1; }); }
  // built last at boot, once every ride, its platform decks and solids are in
  var _pkBuildAttractionsPB = pkBuildAttractions;
  pkBuildAttractions = function () {
    _pkBuildAttractionsPB();
    if (!PK_MAIN && PK.ride && PK.gates) pkMainMake();
    pkPlatList().forEach(function (a) {
      if (!pkPlatRide(a) || !a.boothPanel) return;
      var bx = pkPlatBoxBuild(a); if (bx) { a.platBox = bx; PK_PL.boxes.push(bx); }
    });
  };
  var _pkPlatT = GAME.T;
  GAME.T = function () { var t = _pkPlatT(); t.PK_PL = PK_PL; t.pkDuo = pkDuo; t.pkSetDuo = pkSetDuo; t.pkPlatPress = pkPlatPress; t.pkPlatAssign = pkPlatAssign; t.pkFreeHand = pkFreeHand; t.pkAskAnswer = pkAskAnswer; t.pkPlatWho = pkPlatWho; t.PK_FLOOR_RECTS = PK_FLOOR_RECTS; t.PK_MAIN = function () { return PK_MAIN; }; t.pkPlatSpot = pkPlatSpot; return t; };
