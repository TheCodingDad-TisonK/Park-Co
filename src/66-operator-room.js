//@ Park Co, part 66: the operator room (tison, 2026-11-15: "upgrade ALOT every single booth panel... and take the booth with it... it should feel
//@ more like a operator room"). Part 17 builds the standard booth room; this part wraps pkRideBoothBuild and dresses every one of them the same
//@ way after it: a crew screen on the wall (who runs the ride, SOLO or DUO, who is on the platform, release and the gates), a lamp bar over the
//@ desk that shows the ride's state at a glance (green ready, amber working, red stop or maintenance), the ceiling services (cable tray,
//@ conduit, smoke detector with its blinking lamp, the speaker), a pelmet and roller blind over the window, cable covers on the floor, a door
//@ mat, the inspection notice by the door and an aerial and a horn on the roof. Everything is built into the booth's own group, so it moves
//@ with the booth in the editor, and it is all live scenery (no solids, no new interactions).
  (function () {
    var inner = pkRideBoothBuild;
    function lampMat(hex) { var m = new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: 0.05, roughness: 0.4 }); m.userData.glow = true; return m; }   // glow: the static baker leaves it alone, so the lamp can change
    function crewBoard(ctx, s, a) {
      var C = pkCtl(a), w = s.w, h = s.h, duo = pkDuo(a), P = a.plat, rel = !!(P && P.rel);
      var main = pkOnDutyAt(a.id) ? 'YOU' : (pkOpAt(a.id) || '');
      scBg(ctx, w, h); scHead(ctx, w, 'CREW', duo ? 'DUO' : 'SOLO');
      var pad = 16, y = 62;
      scStat(ctx, pad, y, 'MAIN OPERATOR', main || 'NOBODY CLOCKED IN', main ? PK_SC.good : PK_SC.bad, 17);
      if (duo) {
        var who = P && P.crew ? pkPlatWho(a) : '';
        scStat(ctx, pad, y + 46, 'PLATFORM', who || 'NOBODY', who ? PK_SC.good : PK_SC.bad, 17);
        var cw = (w - 2 * pad - 10) / 2;
        scCard(ctx, pad, y + 94, cw, 50, 'RELEASE', rel ? 'GIVEN' : 'WAITING', rel, false);
        scCard(ctx, pad + cw + 10, y + 94, cw, 50, 'STN GATES', a.stationGates === false ? 'SHUT' : 'OPEN', a.stationGates === false, false);
        scText(ctx, pad, h - 14, 'The platform crew works bars and gates.', '#7f8fa1', 11);
      } else {
        scStat(ctx, pad, y + 46, 'PLATFORM', 'NOT STAFFED (SOLO)', PK_SC.mute, 15);
        scText(ctx, pad, h - 30, 'Flip the cabinet key to DUO', '#7f8fa1', 11.5);
        scText(ctx, pad, h - 14, 'to run with a second operator.', '#7f8fa1', 11.5);
      }
    }
    pkRideBoothBuild = function (a, th, g, ds, bx, bz, ry) {
      var out = inner.apply(this, arguments);
      try { pkRoomDress(a, th, g, ds); } catch (e) { if (typeof console !== 'undefined') console.warn('operator room: ' + e.message); }
      return out;
    };

    // the control cabins (the Mountain King's and the Dragon Ride's) get the same dressing in their own frame: o.K is the room, X(u) = AX + s*u
    var innerCab = pkCabinBuildInner;
    pkCabinBuildInner = function (g, a, o) {
      innerCab.apply(this, arguments);
      try { pkCabinDress(g, a, o); } catch (e) { if (typeof console !== 'undefined') console.warn('operator room (cabin): ' + e.message); }
    };
    function pkCabinDress(g0, a, o) {
      var s = o.s, AX = o.AX, K = o.K, H = o.H || 2.9, T = 0.12, lift = o.y || 0;
      var g = g0; if (lift) { g = new THREE.Group(); g.position.y = lift; g0.add(g); }
      function X(u) { return AX + s * u; }
      var xa = Math.min(X(K.u0), X(K.u1)), xb = Math.max(X(K.u0), X(K.u1)), cx = (xa + xb) / 2, cz = (K.z0 + K.z1) / 2;
      var xn = X(K.u0 + T / 2), xf = X(K.u1 - T / 2), d0 = K.door[0], d1 = K.door[1], fy = 0.12, cy = H - 0.04;
      var dark = pkBkStd({ color: 0x20272c, roughness: 0.62, metalness: 0.3 }), steel = pkBkStd({ color: 0x8a949b, roughness: 0.45, metalness: 0.55 }), rubber = pkBkStd({ color: 0x15181b, roughness: 0.9 });
      // the crew screen on the far wall, toward the window from the cabinet
      var sc = touchScreen({ w: 300, h: 224, pw: 0.5, ph: 0.373, x: xf - s * (T / 2 + 0.02), y: 1.6, z: cz - 0.75, ry: -s * Math.PI / 2, parent: g, title: 'Crew', draw: function (ctx, st) { crewBoard(ctx, st, a); } });
      pkPowerScreen(sc, function () { return !!a.open; });
      PK_BK_LIVE.push({ sc: sc, g: g, every: 0.5 });
      // the lamp bar over the desk, lenses toward the chair
      var lb = new THREE.Group(); lb.position.set(cx, cy - 0.06, K.z0 + 1.0); g.add(lb);
      pkBevelBox(0.5, 0.09, 0.1, dark, 0, 0, 0, lb, 0.012);
      var lg = lampMat(0x39d98a), la = lampMat(0xffb23d), lr = lampMat(0xff5a4d);
      [[lg, -0.15], [la, 0], [lr, 0.15]].forEach(function (l) { box(0.1, 0.05, 0.02, l[0], l[1], 0, 0.056, lb); });
      // the ceiling services
      pkBevelBox(0.14, 0.04, D2(K) - 0.4, steel, xf - s * 0.3, cy - 0.03, cz, g, 0.006);
      var sm = new THREE.Group(); sm.position.set(cx - s * 0.9, cy - 0.025, cz + 0.3); g.add(sm);
      pkRoundCyl(0.065, 0.04, pkBkStd({ color: 0xf2efe6, roughness: 0.5 }), 0, 0, 0, sm, 14);
      var blink = lampMat(0xff3b30); box(0.018, 0.01, 0.018, blink, 0.03, -0.022, 0, sm);
      pkRoundCyl(0.11, 0.05, pkBkStd({ color: 0xe6e3da, roughness: 0.55 }), cx + s * 0.9, cy - 0.025, cz + 0.3, g, 16);
      // the notice by the door and a mat inside it
      pkBkNotice(g, xn + s * (T / 2 + 0.012), 1.75, d1 + 0.6, s * Math.PI / 2, ['INSPECTED', 'PASSED'], 0.4, 0.3, { bg: '#f1ecdf', fg: '#1b232c', clip: true });
      pkBevelBox(0.8, 0.014, Math.min(1.0, d1 - d0), pkBkStd({ color: 0x6a5238, roughness: 0.98 }), xn + s * 0.6, fy + 0.007, (d0 + d1) / 2, g, 0.006);
      pkCtlLive({ tick: function () {
        var power = !!a.open, C = pkCtl(a), st = a.state;
        var red = power && (C.fault || C.maint), amber = power && !red && (st === 'running' || st === 'boarding' || st === 'ready' || st === 'unloading'), green = power && !red && !amber;
        lg.emissiveIntensity = green ? 1.5 : 0.05; la.emissiveIntensity = amber ? 1.5 : 0.05; lr.emissiveIntensity = red ? (Math.floor(Date.now() / 400) % 2 ? 1.6 : 0.6) : 0.05;
        blink.emissiveIntensity = power && Math.floor(Date.now() / 1000) % 4 === 0 ? 2.2 : 0.05;
      } });
    }
    function D2(K) { return K.z1 - K.z0; }

    // the same dressing for a room built in its own frame: spec { lamp: [x, y, z], scr: [x, y, z, ry], det: [x, y, z], spk: [x, y, z] }, the lamp lenses toward +z
    function pkDressCore(a, g, spec) {
      var dark = pkBkStd({ color: 0x20272c, roughness: 0.62, metalness: 0.3 });
      var sc = touchScreen({ w: 300, h: 224, pw: 0.5, ph: 0.373, x: spec.scr[0], y: spec.scr[1], z: spec.scr[2], ry: spec.scr[3], parent: g, title: 'Crew', draw: function (ctx, st) { crewBoard(ctx, st, a); } });
      pkPowerScreen(sc, function () { return !!a.open; });
      PK_BK_LIVE.push({ sc: sc, g: g, every: 0.5 });
      var lb = new THREE.Group(); lb.position.set(spec.lamp[0], spec.lamp[1], spec.lamp[2]); g.add(lb);
      pkBevelBox(0.5, 0.09, 0.1, dark, 0, 0, 0, lb, 0.012);
      var lg = lampMat(0x39d98a), la = lampMat(0xffb23d), lr = lampMat(0xff5a4d);
      [[lg, -0.15], [la, 0], [lr, 0.15]].forEach(function (l) { box(0.1, 0.05, 0.02, l[0], l[1], 0, 0.056, lb); });
      var sm = new THREE.Group(); sm.position.set(spec.det[0], spec.det[1], spec.det[2]); g.add(sm);
      pkRoundCyl(0.065, 0.04, pkBkStd({ color: 0xf2efe6, roughness: 0.5 }), 0, 0, 0, sm, 14);
      var blink = lampMat(0xff3b30); box(0.018, 0.01, 0.018, blink, 0.03, -0.022, 0, sm);
      pkRoundCyl(0.11, 0.05, pkBkStd({ color: 0xe6e3da, roughness: 0.55 }), spec.spk[0], spec.spk[1], spec.spk[2], g, 16);
      pkCtlLive({ tick: function () {
        var power = !!a.open, C = pkCtl(a), st = a.state;
        var red = power && (C.fault || C.maint), amber = power && !red && (st === 'running' || st === 'boarding' || st === 'ready' || st === 'unloading'), green = power && !red && !amber;
        lg.emissiveIntensity = green ? 1.5 : 0.05; la.emissiveIntensity = amber ? 1.5 : 0.05; lr.emissiveIntensity = red ? (Math.floor(Date.now() / 400) % 2 ? 1.6 : 0.6) : 0.05;
        blink.emissiveIntensity = power && Math.floor(Date.now() / 1000) % 4 === 0 ? 2.2 : 0.05;
      } });
    }
    // Danse Macabre's sacristy and Dream Flight's booth (pkRoomKit, part 49): the room's frame, -z the window, +z the back wall
    var innerKit = pkRoomKit;
    pkRoomKit = function (g, a, o) {
      var R = innerKit.apply(this, arguments);
      try {
        var W = o.W, D = o.D, H = o.H || 2.9, sx = o.cabBack ? -1 : -(o.cab || -1);
        pkDressCore(a, R, { lamp: [0, H - 0.1, -D / 2 + 1.0], scr: [sx * (W / 2 - 0.04), 1.6, -0.35, -sx * Math.PI / 2], det: [0.9, H - 0.03, 0.2], spk: [-0.9, H - 0.03, 0.2] });
      } catch (e) { if (typeof console !== 'undefined') console.warn('operator room (kit): ' + e.message); }
      return R;
    };
    // the Arena's control room
    var innerTh = pkTheaterDress;
    pkTheaterDress = function (a, g, M, G, X, BF, BZ0, BZ1, BX, BH) {
      var r = innerTh.apply(this, arguments);
      try { pkDressCore(a, g, { lamp: [0, BF + BH - 0.1, BZ0 + 1.0], scr: [-BX + 0.06, BF + 1.6, BZ0 + 3.0, Math.PI / 2], det: [1.0, BF + BH - 0.03, BZ0 + 2.4], spk: [-1.0, BF + BH - 0.03, BZ0 + 2.4] }); } catch (e) { if (typeof console !== 'undefined') console.warn('operator room (arena): ' + e.message); }
      return r;
    };
    function pkRoomDress(a, th, g, ds) {
      var K = PK_BK, HW = K.W / 2, HD = K.D / 2, F = K.FLOOR, T = K.T, WH = K.WALL, HEAD = K.HEAD, DZ = K.DOORZ;
      var ceilY = F + WH - 0.04;
      var dark = pkBkStd({ color: 0x20272c, roughness: 0.62, metalness: 0.3 });
      var steel = pkBkStd({ color: 0x8a949b, roughness: 0.45, metalness: 0.55 });
      var cableM = pkBkStd({ color: 0x15191c, roughness: 0.8 });
      var theme = pkBkStd({ color: th.a, roughness: 0.6, metalness: 0.1 });

      // the crew screen on the far wall, beside the cabinet
      var sc = touchScreen({ w: 300, h: 224, pw: 0.5, ph: 0.373, x: -ds * (HW - T - 0.02), y: F + 1.3, z: 0.02, ry: ds * Math.PI / 2, parent: g, title: 'Crew',
        draw: function (ctx, s) { crewBoard(ctx, s, a); } });
      pkPowerScreen(sc, function () { return !!a.open; });
      PK_BK_LIVE.push({ sc: sc, g: g, every: 0.5 });
      pkBevelBox(0.54, 0.03, 0.05, dark, -ds * (HW - T - 0.04), F + 1.3 - 0.2, 0.02, g, 0.006);

      // the lamp bar over the desk: ready, working, stop
      var lb = new THREE.Group(); lb.position.set(0, ceilY - 0.06, 0.58); g.add(lb);
      pkBevelBox(0.5, 0.09, 0.1, dark, 0, 0, 0, lb, 0.012);
      var lg = lampMat(0x39d98a), la = lampMat(0xffb23d), lr = lampMat(0xff5a4d);
      [[lg, -0.15], [la, 0], [lr, 0.15]].forEach(function (l) { box(0.1, 0.05, 0.02, l[0], l[1], 0, 0.056, lb); });
      pkRoundCyl(0.012, 0.1, dark, -0.2, 0.09, 0, lb, 6); pkRoundCyl(0.012, 0.1, dark, 0.2, 0.09, 0, lb, 6);
      lb.rotation.y = Math.PI;                                 // the lenses face the chair
      // the ceiling services: a cable tray along the cabinet wall, across the room and a drop to the cabinet
      var tx = -ds * (HW - 0.28);
      pkBevelBox(0.14, 0.04, 2.5, steel, tx, ceilY - 0.03, 0.0, g, 0.006);
      pkBevelBox(2.0, 0.04, 0.14, steel, tx + ds * 1.0, ceilY - 0.03, 0.72, g, 0.006);
      for (var rr = 0; rr < 10; rr++) pkBevelBox(0.12, 0.012, 0.02, dark, tx, ceilY - 0.055, -1.1 + rr * 0.25, g, 0.003);
      pkRoundCyl(0.03, WH - 0.45 - 1.85, steel, -ds * (HW - T - 0.14), F + 1.9 + (WH - 0.45 - 1.85) / 2 + 0.02, -0.55, g, 8);
      pkRoundCyl(0.025, 0.3, cableM, -ds * 0.55, ceilY - 0.2, 0.72, g, 6);
      // the smoke detector with its blinking lamp, and the speaker
      var sm = new THREE.Group(); sm.position.set(ds * 0.95, ceilY - 0.025, -0.78); g.add(sm);
      pkRoundCyl(0.065, 0.04, pkBkStd({ color: 0xf2efe6, roughness: 0.5 }), 0, 0, 0, sm, 14);
      var blink = lampMat(0xff3b30); box(0.018, 0.01, 0.018, blink, 0.03, -0.022, 0, sm);
      pkRoundCyl(0.11, 0.05, pkBkStd({ color: 0xe6e3da, roughness: 0.55 }), -ds * 0.95, ceilY - 0.025, -0.8, g, 16);
      pkRoundCyl(0.085, 0.012, dark, -ds * 0.95, ceilY - 0.055, -0.8, g, 16);
      pkCtlLive({ tick: function () {
        var power = !!a.open, C = pkCtl(a), st = a.state;
        var red = power && (C.fault || C.maint), amber = power && !red && (st === 'running' || st === 'boarding' || st === 'ready' || st === 'unloading');
        var green = power && !red && !amber;
        lg.emissiveIntensity = green ? 1.5 : 0.05; la.emissiveIntensity = amber ? 1.5 : 0.05; lr.emissiveIntensity = red ? (Math.floor(Date.now() / 400) % 2 ? 1.6 : 0.6) : 0.05;
        blink.emissiveIntensity = power && Math.floor(Date.now() / 1000) % 4 === 0 ? 2.2 : 0.05;
      } });

      // the window: a pelmet over it and the roller blind rolled up and tied
      var bz = HD - T - 0.05;
      pkBevelBox(K.W - 0.4, 0.14, 0.08, theme, 0, F + HEAD - 0.09, bz, g, 0.012);
      pkRoundCyl(0.035, K.W - 0.5, pkBkStd({ color: 0xe9e4d8, roughness: 0.8 }), 0, F + HEAD - 0.2, bz - 0.01, g, 10).rotation.z = Math.PI / 2;
      [-1, 1].forEach(function (sx) { pkBevelBox(0.03, 0.2, 0.012, pkBkStd({ color: 0xc9a227, roughness: 0.6 }), sx * (K.W / 2 - 0.45), F + HEAD - 0.2, bz - 0.04, g, 0.004); });

      // the floor: cable covers from the cabinet to the desk, and the mat at the door
      pkBevelBox(0.08, 0.02, 1.7, cableM, -ds * (HW - 0.42), F + 0.075, 0.28, g, 0.006);
      pkBevelBox(1.15, 0.02, 0.08, cableM, -ds * (HW - 0.42) + ds * 0.57, F + 0.075, 1.06, g, 0.006);
      pkBevelBox(0.8, 0.014, 1.0, pkBkStd({ color: 0x6a5238, roughness: 0.98 }), ds * (HW - 0.5), F + 0.07, DZ, g, 0.006);

      // the notice by the door on the near wall: the last inspection
      pkBkNotice(g, ds * (HW - T - 0.012), F + 1.88, -1.12, -ds * Math.PI / 2, ['INSPECTED', 'PASSED'], 0.4, 0.3, { bg: '#f1ecdf', fg: '#1b232c', clip: true });

      // the roof: an aerial with its warning lamp and a horn speaker
      var rx = ds * 1.05, ry0 = F + WH + 0.5;
      pkRoundCyl(0.014, 0.95, steel, rx, ry0 + 0.45, -0.7, g, 6);
      var tip = lampMat(0xff3b30); sphere(0.03, tip, rx, ry0 + 0.95, -0.7, g);
      pkRoundCyl(0.022, 0.5, steel, rx, ry0 + 0.35, -0.7, g, 6).rotation.z = 0;
      pkCtlLive({ tick: function () { tip.emissiveIntensity = a.open && Math.floor(Date.now() / 900) % 2 ? 1.8 : 0.1; } });
    }
  }());
