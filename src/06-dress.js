//@ Park Co, part 06: the dressing - each ride gets its own little world: a gateway, bunting, its colours and a signature piece
  // ── The dressing ─────────────────────────────────────────────────
  // Everything here is static and parented to one group per plot, so a plot that is not open yet is not drawn and is not
  // baked; opening it flips the group visible and the world is baked again.
  var PK_THEME = {
    carousel:  { a: 0xc94f4f, b: 0xf0c04a, ground: 0xb8a48a, name: 'The Grand Carousel' },
    teacups:   { a: 0x8fd3c7, b: 0xf0a6c0, ground: 0xb9d6cf, name: 'The Tea Garden' },
    ferris:    { a: 0x4f8fd9, b: 0x9fd0ff, ground: 0xa8bccd, name: 'The Sky Wheel' },
    dodgems:   { a: 0xe0563f, b: 0xf0c04a, ground: 0x8a8f96, name: 'The Dodgem Arena' },
    droptower: { a: 0x3a3f48, b: 0xf0c04a, ground: 0x9a938a, name: 'The Drop' },
    flume:     { a: 0x3f7fa8, b: 0x8a6a4a, ground: 0x8a9a7a, name: 'The Log Flume' },
    haunted:   { a: 0x4a4a55, b: 0xff8a3d, ground: 0x6e6a60, name: 'The Haunted Manor' }
  };
  // the pavers, tinted toward the ride's own colour so each plot reads as a place of its own
  var PK_PADS = {};
  function pkPadMat(c) {
    if (PK_PADS[c]) return PK_PADS[c];
    var col = new THREE.Color(c).lerp(new THREE.Color(0xffffff), 0.45);
    return (PK_PADS[c] = std({ map: pkMats().paverTex, color: col.getHex(), roughness: 0.9 }));
  }
  function pkDressAll() {
    PK.attractions.forEach(function (a) {
      var th = PK_THEME[a.id], p = a.plot; if (!th || !p) return;
      var side = p.x < 0 ? 1 : -1;                        // the way back to the midway
      var dg = new THREE.Group(); dg.visible = !!a.open; scene.add(dg); a.dress = dg;
      // the plot's own paving (a big coaster plot sets its own pad, so it does not pave over its neighbours)
      var padR = p.r * (p.pad || 1.25), padY = 0.0195 + PK_PLOTS.indexOf(p) * 0.0025;
      pkPavedDisc(padR, pkPadMat(th.ground), p.x, padY, p.z, dg, 2.4);
      pkPavedDisc(padR + 0.55, pkMats().kerb, p.x, padY - 0.001, p.z, dg, 2.4);   // a stone lip round the pad
      // bunting along the three sides away from the midway (a big coaster plot hangs its own)
      if (!th.noBunting) {
        pkBunting(p.x - p.r - 1.2, p.z - p.r - 1.2, p.x + p.r + 1.2, p.z - p.r - 1.2, th, dg);
        pkBunting(p.x + side * (p.r + 1.2), p.z - p.r - 1.2, p.x + side * (p.r + 1.2), p.z + p.r + 1.2, th, dg);
        pkBunting(p.x - p.r - 1.2, p.z - p.r - 1.2, p.x - p.r - 1.2, p.z + p.r + 1.2, th, dg);
      }
      // the gateway over the queue, facing the midway
      pkGatewayBetter(p.q[0], p.q[1], th.name, th, side, dg);
      // the line itself: a fenced lane behind the arch with a boarding gate
      pkQueueLaneBetter(a, th, dg);
      // planters by the gateway and two lamps, where the plot has the room for them
      if (!th.noDecor) {
        pkBedIn(p.q[0] + side * 2.8, p.q[1] - 2.6, dg);
        pkBedIn(p.q[0] + side * 2.8, p.q[1] + 2.6, dg);
        lampPost(p.q[0] - side * 1.2, p.q[1] - 3.8, 0, 4.5);
        lampPost(p.q[0] - side * 1.2, p.q[1] + 3.8, 0, 4.5);
      }
      pkSignature(a, p, th, dg);
    });
  }
  // one triangular pennant, top edge along local x, hanging down: shared by every flag on the cord
  var PK_PENNANT = null;
  function pkPennantGeo() {
    if (PK_PENNANT) return PK_PENNANT;
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-0.15, 0, 0, 0.15, 0, 0, 0, -0.34, 0], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 0.5, 0], 2));
    g.computeVertexNormals();
    return (PK_PENNANT = g);
  }
  var PK_BUNT_MATS = {};
  function pkBuntMat(c) {
    return PK_BUNT_MATS[c] || (PK_BUNT_MATS[c] = std({ color: c, roughness: 0.9, side: THREE.DoubleSide }));
  }
  function pkBunting(x0, z0, x1, z1, th, parent) {
    var n = 10;
    var dx = x1 - x0, dz = z1 - z0, len = Math.sqrt(dx * dx + dz * dz);
    var rot = Math.atan2(-dz, dx);
    // the cord: a shallow parabola sagging between the two posts
    var endY = 2.55, dip = Math.min(0.5, len * 0.055), pts = [];
    for (var k = 0; k <= 8; k++) {
      var u = 2 * k / 8 - 1;
      pts.push([x0 + dx * (k / 8), endY - dip * (1 - u * u), z0 + dz * (k / 8)]);
    }
    pkTube(pts, 0.013, std({ color: 0x5a4c3a, roughness: 0.95 }), parent, false, 24, 5);
    // a post at each end, capped
    for (var e = 0; e <= 1; e++) {
      var ex = e ? x1 : x0, ez = e ? z1 : z0;
      pkRoundCyl(0.1, 2.6, MAT.wood, ex, 1.3, ez, parent, 8);
      sphere(0.08, pkMats().gold, ex, 2.64, ez, parent);
    }
    // pennants hanging from the cord, alternating the ride's colours
    for (var i = 1; i < n; i++) {
      var t = i / n, u2 = 2 * t - 1;
      var flag = new THREE.Mesh(pkPennantGeo(), pkBuntMat(i % 2 ? th.a : th.b));
      flag.position.set(x0 + dx * t, endY - dip * (1 - u2 * u2) - 0.02, z0 + dz * t);
      flag.rotation.y = rot;
      flag.castShadow = true;
      parent.add(flag);
    }
  }
  function pkGateway(x, z, label, th, side, parent) {
    pkGatewayBetter(x, z, label, th, side, parent);
  }
  // ── The queue lane ────────────────────────────────────────────────
  // Every ride runs a proper line: the gateway arch stands over the boarding gate at
  // the front, a low steel fence holds the lane on both sides, and an open entry at the
  // back carries the QUEUE sign. The slot the guests stand in is unchanged; the lane is
  // built around it. The boarding gate opens with the ride's own gates (C.gates).
  function pkQueueLaneBetter(a, th, parent) {
    var C = pkCtl(a);
    var N = Math.max(4, a.cap || 8);
    var dir = a.qdx >= 0 ? 1 : -1;
    var qx = a.qx, qz = a.qz;
    var xGate = qx - dir * 0.66;                       // under the arch, clear of slot 0
    var xBack = qx + dir * (N * 1.05 + 1.1);           // open entry at the back
    var zA = qz - 0.92, zB = qz + 0.92;
    var lo = Math.min(xGate, xBack), hi = Math.max(xGate, xBack), mid = (lo + hi) / 2;
    // the lane floor: a tinted strip with a stone kerb, a hand's width wider than the fence
    box(hi - lo + 0.9, 0.10, 2.24, pkMats().kerb, mid, 0.012, qz, parent);
    box(hi - lo + 0.6, 0.055, 1.98, pkPadMat(th.ground), mid, 0.035, qz, parent);
    // a fence down each side, from the boarding gate to the entry
    pkLaneFence(xGate, xBack, zA, parent);
    pkLaneFence(xGate, xBack, zB, parent);
    // the boarding gate: two steel leaves on the gate posts, under the arch. They swing
    // toward the ride as C.gates opens, which is the same signal the platform gates use.
    [-1, 1].forEach(function (sz) {
      var z = sz < 0 ? zA - 0.02 : zB + 0.02;
      pkRoundCyl(0.075, 1.30, MAT.steelDark, xGate, 0.65, z, parent, 8);
      sphere(0.075, pkMats().gold, xGate, 1.33, z, parent);
    });
    var leafL = new THREE.Group(); leafL.position.set(xGate, 0, zA); parent.add(leafL);
    var leafR = new THREE.Group(); leafR.position.set(xGate, 0, zB); parent.add(leafR);
    var gateMat = std({ color: 0x2f3a42, roughness: 0.5, metalness: 0.35 });
    pkBevelBox(0.055, 0.92, 0.86, gateMat, 0, 0.55, 0.44, leafL, 0.015);
    pkBevelBox(0.055, 0.92, 0.86, gateMat, 0, 0.55, -0.44, leafR, 0.015);
    pkBevelBox(0.075, 0.06, 0.80, pkMats().gold, 0, 0.98, 0.44, leafL, 0.01);
    pkBevelBox(0.075, 0.06, 0.80, pkMats().gold, 0, 0.98, -0.44, leafR, 0.01);
    pkBevelBox(0.07, 0.05, 0.80, MAT.steelDark, 0, 0.30, 0.44, leafL, 0.01);
    pkBevelBox(0.07, 0.05, 0.80, MAT.steelDark, 0, 0.30, -0.44, leafR, 0.01);
    C.gateObjs.push(function (t) { leafL.rotation.y = -t * 1.42; leafR.rotation.y = t * 1.42; });
    // the entry arch at the back: two posts, a header and the sign facing the midway
    [-1, 1].forEach(function (sz) {
      pkRoundCyl(0.085, 2.30, MAT.steelDark, xBack, 1.15, qz + sz * 1.02, parent, 8);
      sphere(0.09, pkMats().gold, xBack, 2.33, qz + sz * 1.02, parent);
    });
    pkBevelBox(0.13, 0.16, 2.30, MAT.steelDark, xBack, 2.28, qz, parent, 0.02);
    pkSign3D(['QUEUE', th.name.toUpperCase()], 1.72, 0.34, xBack, 2.58, qz, dir > 0 ? Math.PI / 2 : -Math.PI / 2, { bg: '#1b232c', fg: '#f5b53d' }, parent);
    // the line's own number plate, so the player can see where it starts
    pkRoundCyl(0.045, 1.55, MAT.steelDark, xBack + dir * 0.30, 0.77, qz + 1.30, parent, 8);
    pkSign3D(['QUEUE FROM HERE'], 1.25, 0.20, xBack + dir * 0.30, 1.62, qz + 1.30, dir > 0 ? Math.PI / 2 : -Math.PI / 2, { bg: '#1b232c', fg: '#eef1f5' }, parent);
    // the player's way in: press E at the entry to ride
    hitBox(2.4, 2.2, 2.4, xBack, 1.1, qz, {
      prompt: function () {
        if (!a.open || PK.playerRide) return '';
        if (PK.playerWait && PK.playerWait.a === a) return 'Waiting for ' + a.name + ' - press E to leave the line';
        return 'Ride ' + a.name;
      },
      use: function () { pkPlayerRideJoin(a); }
    }, parent);
    // the fences block the player, but only while the ride is open and the lane is drawn
    PK.lanes.push({ a: a, x0: Math.min(xGate, xBack), x1: Math.max(xGate, xBack), zA: zA, zB: zB, gx: xGate, leafL: leafL, leafR: leafR });
  }
  function pkLaneFence(x0, x1, z, parent) {
    var n = Math.max(1, Math.round(Math.abs(x1 - x0) / 1.65));
    for (var i = 0; i <= n; i++) {
      var x = x0 + (x1 - x0) * (i / n);
      pkRoundCyl(0.055, 1.06, MAT.steelDark, x, 0.53, z, parent, 8);
      sphere(0.052, pkMats().gold, x, 1.09, z, parent);
    }
    pkBevelBox(Math.abs(x1 - x0), 0.05, 0.05, MAT.steelDark, (x0 + x1) / 2, 0.99, z, parent, 0.008);
    pkBevelBox(Math.abs(x1 - x0), 0.045, 0.045, MAT.steelDark, (x0 + x1) / 2, 0.52, z, parent, 0.008);
  }
  function pkBedIn(x, z, parent) {
    pkFlowerBed(x, z, 1.8, 1.1, parent, true);
  }
  // the one thing each ride is known for
  function pkSignature(a, p, th, parent) {
    var g = parent;
    if (a.id === 'carousel') {
      var band = new THREE.Mesh(new THREE.TorusGeometry(7.2, 0.1, 6, 44), std({ color: 0xf0c04a, roughness: 0.35, metalness: 0.45 }));
      band.rotation.x = Math.PI / 2; band.position.set(p.x, 4.0, p.z); parent.add(band);
      box(1.7, 1.9, 1.0, std({ color: 0x8a5a3a, roughness: 0.9 }), p.x - p.r - 2.6, 0.95, p.z + 2.4, g);
      for (var i = 0; i < 5; i++) cyl(0.07, 1.0 - i * 0.13, std({ color: 0xf0c04a, roughness: 0.4 }), p.x - p.r - 3.1 + i * 0.25, 2.2, p.z + 2.4, g, 8);
      // the fairground quarter: brass lamps on the rim, a souvenir kiosk by the organ
      // box, flower beds flanking the west lamp and a bench on the north rim
      [[-41.6, 12.5], [-41.6, 27.5], [-43.0, 20]].forEach(function (q) { pkLandLamp(q[0], q[1], g, th); });
      parent.add(pkStall(-46.8, 14.6, Math.PI / 2, th.a, th.b, 'SOUVENIRS'));
      pkFlowerBed(-44.7, 17.3, 1.8, 1.1, g, true);
      pkFlowerBed(-44.7, 25.2, 1.8, 1.1, g, true);
      pkBench(-37.5, 30.4, Math.PI, g);
    } else if (a.id === 'teacups') {
      var pot = new THREE.Mesh(new THREE.SphereGeometry(1.55, 16, 12), std({ color: 0xf0a6c0, roughness: 0.5 }));
      pot.position.set(p.x + p.r + 3.2, 1.8, p.z - 3.4); pot.scale.y = 0.85; parent.add(pot);
      cyl(0.5, 0.35, std({ color: 0xf0a6c0, roughness: 0.5 }), p.x + p.r + 3.2, 3.1, p.z - 3.4, g, 12);
      var sp = cyl(0.17, 1.2, std({ color: 0xf0a6c0, roughness: 0.5 }), p.x + p.r + 4.7, 1.8, p.z - 3.4, g, 8); sp.rotation.z = -0.9;
      var hd = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.11, 6, 14), std({ color: 0xf0a6c0, roughness: 0.5 }));
      hd.position.set(p.x + p.r + 1.7, 1.9, p.z - 3.4); parent.add(hd);
      // the tea garden: clipped hedges and topiary balls on the far sides, a table set
      // on the south-west pad, cup lamps flanking the approach and a trellis arch over
      // the walk in from the midway
      pkHedgeRun(-65.6, -3.4, -65.6, 9.4, g, 1.05);
      pkHedgeRun(-63.6, 12.6, -49.2, 12.6, g, 1.05);
      [[-63.4, -4.4], [-63.4, 10.4], [-49.4, 10.4]].forEach(function (q) { pkTopiary(q[0], q[1], g, 1); });
      pkTeaTable(-49.8, -4.8, g);
      [[-47.6, 5.6], [-47.6, 0.4]].forEach(function (q) { pkCupLamp(q[0], q[1], g); });
      pkTrellis(-40.8, 3, g);
    } else if (a.id === 'ferris') {
      for (var b = 0; b < 24; b++) {
        var ang = b / 24 * Math.PI * 2;
        sphere(0.17, glowMat(0xfff2c0, 0.9), p.x + Math.cos(ang) * 9.1, 10.6 + Math.sin(ang) * 9.1, p.z, g);
      }
      box(2.4, 2.2, 2.0, std({ color: th.a, roughness: 0.8 }), p.x + p.r + 2.6, 1.1, p.z - 4.2, g);
      sign(['TICKETS'], 1.8, 0.4, p.x + p.r + 2.6, 2.4, p.z - 5.22, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);
      // the sky quarter: three flag poles with festoon strung between them on the north
      // rim, a viewing deck with a brass telescope on the south rim, globe lamps and benches
      pkFlagPole(27, 30.1, g, th, 5.6); pkFlagPole(34, 29.9, g, th, 6.5); pkFlagPole(41, 30.1, g, th, 5.6);
      pkFestoon(27, 30.1, 34, 29.9, g, th, 4.4, 5.1); pkFestoon(34, 29.9, 41, 30.1, g, th, 5.1, 4.4);
      pkViewDeck(32.6, 9.4, g);
      pkLandLamp(29.2, 10.2, g, th, 'globe'); pkLandLamp(40.0, 10.2, g, th, 'globe');
      pkBench(30.0, 11.6, Math.PI, g); pkBench(40.4, 11.6, Math.PI, g);
    } else if (a.id === 'dodgems') {
      for (var n = 0; n < 4; n++) box(14, 0.1, 0.1, glowMat(0x5fd3ff, 1.1), p.x, 3.55, p.z - 5 + n * 0.06, g);
      box(0.1, 0.1, 10, glowMat(0xff5f8a, 1.1), p.x - 7.05, 3.55, p.z, g);
      box(0.1, 0.1, 10, glowMat(0xff5f8a, 1.1), p.x + 7.05, 3.55, p.z, g);
    } else if (a.id === 'droptower') {
      for (var h = 0; h < 5; h++) cyl(0.64, 0.5, std({ color: 0xf0c04a, roughness: 0.6 }), p.x, 5 + h * 5.2, p.z, g, 12);
      box(5.0, 0.3, 3.0, MAT.steelDark, p.x, 3.2, p.z - 6.5, g);
      box(0.2, 3.0, 0.2, MAT.steel, p.x - 2.4, 1.5, p.z - 6.5, g);
      box(0.2, 3.0, 0.2, MAT.steel, p.x + 2.4, 1.5, p.z - 6.5, g);
    } else if (a.id === 'flume') {
      // boulders along the channel: lumpy flat-shaded granite at varied scales, half sunk into the ground
      for (var r = 0; r < 18; r++) pkBoulder(p.x + randf(-4.6, 4.6), p.z + randf(-23, 11), randf(0.55, 1.25), g);
      box(2.6, 6.2, 0.3, glowMat(0x9fd8ff, 0.55), p.x, 4.1, p.z - 15.6, g);
      box(3.0, 2.4, 2.6, std({ color: 0x8a6a4a, roughness: 0.95 }), p.x + p.r + 2.8, 1.2, p.z + 4.0, g);
      sign(['LOGS'], 1.6, 0.5, p.x + p.r + 2.8, 2.6, p.z + 5.32, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);
    } else if (a.id === 'haunted') {
      for (var d = 0; d < 8; d++) {
        var dx = p.x + randf(-9, 9), dz = p.z + randf(6, 12);
        cyl(0.12, randf(2.6, 4.4), std({ color: 0x3a332c, roughness: 1 }), dx, 2.0, dz, g, 6);
        box(0.9, 0.09, 0.09, std({ color: 0x3a332c, roughness: 1 }), dx, 3.1, dz, g);
      }
      for (var f = 0; f < 6; f++) sphere(randf(0.7, 1.4), glowMat(0x8fb0d4, 0.3), p.x + randf(-7, 7), randf(0.5, 1.8), p.z + randf(6, 11), g);
    }
  }
  // ── The land kit ─────────────────────────────────────────────────
  // Small themed pieces shared by the per-ride lands: a lamp with an emissive lens, a
  // string of festoon bulbs, a topiary, a clipped hedge, a tea table, a cup lamp, a
  // trellis arch, a flag pole, a viewing deck. None of these adds a real point light —
  // the engine keeps only the nearest dozen, and glow materials carry a land at night.
  function pkLandLamp(x, z, parent, th, style) {
    var h = style === 'low' ? 2.3 : 3.6;
    pkRoundCyl(0.055, h, MAT.steelDark, x, h / 2, z, parent, 8);
    box(0.18, 0.06, 0.18, pkMats().gold, x, 0.05, z, parent);
    if (style === 'globe') {
      sphere(0.21, glowMat(0xffecc8, 0.85), x, h + 0.17, z, parent);
      pkRoundCyl(0.028, 0.16, MAT.steelDark, x, h + 0.44, z, parent, 6);
      sphere(0.05, pkMats().gold, x, h + 0.55, z, parent);
    } else {
      box(0.2, 0.3, 0.2, glowMat(0xffe8b8, 0.8), x, h + 0.17, z, parent);
      var cap = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.17, 6), MAT.steelDark); cap.position.set(x, h + 0.42, z); parent.add(cap);
      sphere(0.05, pkMats().gold, x, h + 0.53, z, parent);
    }
  }
  function pkFestoon(x0, z0, x1, z1, parent, th, yA, yB) {
    var dx = x1 - x0, dz = z1 - z0, len = Math.sqrt(dx * dx + dz * dz), n = Math.max(6, Math.round(len / 0.8));
    yA = yA === undefined ? 3.2 : yA; yB = yB === undefined ? 3.2 : yB;
    var dip = Math.min(0.55, len * 0.045), pts = [];
    for (var k = 0; k <= 10; k++) { var u = 2 * k / 10 - 1; pts.push([x0 + dx * (k / 10), yA + (yB - yA) * (k / 10) - dip * (1 - u * u), z0 + dz * (k / 10)]); }
    pkTube(pts, 0.012, std({ color: 0x3a332c, roughness: 0.9 }), parent, false, 24, 4);
    for (var i = 1; i < n; i++) {
      var t = i / n, u2 = 2 * t - 1;
      sphere(0.065, glowMat(i % 2 ? 0xffe8b0 : 0xffd060, 0.8), x0 + dx * t, yA + (yB - yA) * t - dip * (1 - u2 * u2) - 0.08, z0 + dz * t, parent);
    }
  }
  function pkTopiary(x, z, parent, s) {
    s = s || 1;
    var leaf = std({ color: 0x46763e, roughness: 1 });
    pkRoundCyl(0.34 * s, 0.5, pkMats().stone, x, 0.25, z, parent, 10);
    var ball = new THREE.Mesh(new THREE.SphereGeometry(0.75 * s, 12, 10), leaf); ball.position.set(x, 1.5 * s, z); ball.castShadow = true; parent.add(ball);
    sphere(0.4 * s, leaf, x, 2.35 * s, z, parent);
  }
  function pkHedgeRun(x0, z0, x1, z1, parent, h) {
    h = h || 1.0;
    var dx = x1 - x0, dz = z1 - z0, len = Math.sqrt(dx * dx + dz * dz), rot = Math.atan2(-dz, dx);
    var body = pkBevelBox(len, h, 0.85, std({ color: 0x3e6b38, roughness: 1 }), (x0 + x1) / 2, h / 2, (z0 + z1) / 2, parent, 0.12);
    body.rotation.y = rot;
    var top = pkBevelBox(len - 0.2, 0.18, 0.7, std({ color: 0x4f8046, roughness: 1 }), (x0 + x1) / 2, h + 0.04, (z0 + z1) / 2, parent, 0.08);
    top.rotation.y = rot;
  }
  function pkTeaTable(x, z, parent) {
    var M = pkMats();
    pkRoundCyl(0.07, 0.72, MAT.steelDark, x, 0.36, z, parent, 8);
    pkRoundCyl(0.55, 0.06, M.cream, x, 0.75, z, parent, 20);
    sphere(0.05, M.gold, x, 0.81, z, parent);
    [[-0.95, 0.3], [0.95, -0.3]].forEach(function (q) {
      pkRoundCyl(0.05, 0.42, MAT.steelDark, x + q[0], 0.21, z + q[1], parent, 8);
      pkRoundCyl(0.28, 0.08, std({ color: 0xf0a6c0, roughness: 0.5 }), x + q[0], 0.46, z + q[1], parent, 14);
    });
  }
  function pkCupLamp(x, z, parent) {
    pkRoundCyl(0.05, 1.9, MAT.steelDark, x, 0.95, z, parent, 8);
    pkLathe([[0, 0], [0.26, 0], [0.3, 0.05], [0.27, 0.3], [0.24, 0.32], [0, 0.32]], std({ color: 0xf6eef2, roughness: 0.4 }), x, 1.9, z, parent, 16);
    var glow = new THREE.Mesh(new THREE.CircleGeometry(0.2, 12), glowMat(0xfff0d0, 0.9));
    glow.rotation.x = -Math.PI / 2; glow.position.set(x, 2.22, z); parent.add(glow);
    sphere(0.04, pkMats().gold, x, 2.3, z, parent);
  }
  function pkTrellis(x, z, parent) {
    [-1.6, 1.6].forEach(function (dz) { pkRoundCyl(0.06, 2.4, MAT.wood, x, 1.2, z + dz, parent, 8); });
    var arc = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.06, 6, 16, Math.PI), MAT.wood);
    arc.position.set(x, 2.4, z); arc.rotation.y = Math.PI / 2; parent.add(arc);
    for (var v = 0; v < 7; v++) sphere(randf(0.14, 0.26), std({ color: v % 2 ? 0x5f8f4a : 0x7fae5a, roughness: 1 }), x + randf(-0.15, 0.15), 2.35 + Math.sin(v / 6 * Math.PI) * 1.45 + randf(-0.1, 0.2), z - 1.5 + v * 0.5, parent);
  }
  function pkFlagPole(x, z, parent, th, h) {
    h = h || 5.6;
    pkRoundCyl(0.07, h, MAT.steelDark, x, h / 2, z, parent, 8);
    pkRoundCyl(0.16, 0.14, pkMats().stone, x, 0.07, z, parent, 10);
    sphere(0.09, pkMats().gold, x, h + 0.05, z, parent);
    box(0.9, 0.5, 0.02, std({ color: th.a, roughness: 0.8, side: THREE.DoubleSide }), x + 0.48, h - 0.5, z, parent);
    box(0.9, 0.5, 0.02, std({ color: th.b, roughness: 0.8, side: THREE.DoubleSide }), x + 0.48, h - 1.05, z, parent);
  }
  function pkViewDeck(x, z, parent) {
    var M = pkMats();
    box(4.4, 0.28, 2.2, M.stone, x, 0.14, z, parent);
    box(4.4, 0.05, 2.2, MAT.rubberMat, x, 0.3, z, parent);
    [-2.0, -1.0, 0, 1.0, 2.0].forEach(function (dx) { pkRoundCyl(0.045, 1.0, MAT.steelDark, x + dx, 0.8, z - 1.0, parent, 8); });
    box(4.2, 0.05, 0.05, MAT.steelDark, x, 1.26, z - 1.0, parent);
    pkRoundCyl(0.06, 1.05, MAT.steelDark, x + 1.4, 0.82, z, parent, 8);
    var tube = pkRoundCyl(0.09, 0.7, M.brass, x + 1.4, 1.5, z, parent, 10);
    tube.rotation.z = Math.PI / 2 - 0.35; tube.rotation.y = 0.4;
    sphere(0.08, M.gold, x + 1.4, 1.5, z, parent);
  }
