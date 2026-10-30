//@ Park Co, part 51: the multi-storey - a paid car park of three levels east of the surface lot, with its own drive off the road
  // ── Why ──────────────────────────────────────────────────────────
  // The surface lot holds 39 cars, a little over a hundred guests, and the park takes two hundred. The multi-storey stands on
  // the lawn east of the lot, inside the boundary the Mountain King brought south: a ground floor and two decks, 3.2 m apart,
  // seven bays a rank and two ranks a level either side of an aisle along x. The ramps lie side by side with the decks along
  // the north edge, one over the other (each rises west, 22 m for its 3.2 m), so a car goes up by running east along a level,
  // turning up the ramp at the east end and coming off it at the west end of the level above; down is the same the other way.
  // Every car pays the parking fee (set on the PC's Finance page) as its party gets out. The free surface lot fills first,
  // then the multi-storey: its ground floor, then the decks. A party on a deck comes down the stair tower at the south-west
  // corner and walks out over the apron, through a gate in the lot's east fence; going home they go in at the tower's door.
  //   The traffic keeps left as everywhere: the aisle east on z 47.1 and west on z 49.9, the ramps up on z 37.4 and down on
  //   z 34.6, the drive in on x 45.85 and out on x 48.65.
  var PK_MS = {
    x0: 33, x1: 64.2, z0: 33, z1: 58, zDeck: 39, FH: 3.2, levels: 3,
    rx0: 39, rx1: 61, up: 37.4, dn: 34.6, aE: 47.1, aW: 49.9, aC: 48.5,
    dx: 47.25, din: 45.85, dout: 48.65, boomZ: 70.4,
    bayX0: 40.375, bayW: 2.75, bayN: 7, door: { x: 36.9, z: 60.4 },
    boom: null, boomT: 0, near: false
  };
  // the gates it needs in the fences: the drive through the boundary along z 71, and the walkers' gate in the lot's east fence
  var PK_MS_GAPS = [{ axis: 'x', x: PK_MS.dx, z: 71, w: 7.4 }, { axis: 'z', x: 32.5, z: 60.3, w: 2.6 }];
  var _pkMsPalisade = pkPalisade;
  pkPalisade = function (x0, z0, x1, z1) {
    for (var i = 0; i < PK_MS_GAPS.length; i++) {
      var g = PK_MS_GAPS[i], h = g.w / 2;
      if (g.axis === 'z' && Math.abs(x0 - g.x) < 0.01 && Math.abs(x1 - g.x) < 0.01 && g.z > Math.min(z0, z1) + h && g.z < Math.max(z0, z1) - h) {
        var lo = Math.min(z0, z1), hi = Math.max(z0, z1);
        pkPalisade(x0, lo, x0, g.z - h); pkPalisade(x0, g.z + h, x0, hi); return;
      }
      if (g.axis === 'x' && Math.abs(z0 - g.z) < 0.01 && Math.abs(z1 - g.z) < 0.01 && g.x > Math.min(x0, x1) + h && g.x < Math.max(x0, x1) - h) {
        var l2 = Math.min(x0, x1), h2 = Math.max(x0, x1);
        pkPalisade(l2, z0, g.x - h, z0); pkPalisade(g.x + h, z0, h2, z0); return;
      }
    }
    return _pkMsPalisade(x0, z0, x1, z1);
  };

  // ── The bays ─────────────────────────────────────────────────────
  // rank N noses north against the ramps' wall, rank S noses south; on the ground floor the drive takes bays 2 and 3 of rank S
  var _pkMsLotBays = pkLotBays;
  pkLotBays = function () {
    if (PK_LOT.bays.length) return PK_LOT.bays;
    var bays = _pkMsLotBays(), M = PK_MS;
    for (var L = 0; L < M.levels; L++) for (var i = 0; i < M.bayN; i++) {
      var x = M.bayX0 + i * M.bayW, y = L * M.FH;
      bays.push({ x: x, z: 42, y: y, front: 39.7, mouth: 44.6, aisle: M.aC, yaw: Math.PI / 2, car: null, ms: true, L: L });
      if (!(L === 0 && (i === 2 || i === 3))) bays.push({ x: x, z: 55, y: y, front: 57.3, mouth: 52.4, aisle: M.aC, yaw: -Math.PI / 2, car: null, ms: true, L: L });
    }
    return bays;
  };
  function pkMsFee() { return typeof S.parkFee === 'number' ? S.parkFee : 5; }
  function pkMsSetFee(n) { S.parkFee = clamp(Math.round(pkMsFee() + n), 0, 50); hudDirty = true; screenDirtyAll(); return S.parkFee; }
  function pkMsPay(car) {
    var fee = pkMsFee(); if (fee <= 0 || car.paid) return;
    car.paid = fee; pay(fee, 'Parking');
    PK.today.parking = (PK.today.parking || 0) + fee; PK.today.earned = (PK.today.earned || 0) + fee;
  }

  // ── The ways round it ────────────────────────────────────────────
  // a height on a level, and on a ramp: ramp k runs from level k at its east end (x 61) to level k+1 at its west end (x 39)
  function pkMsY(L) { return L * PK_MS.FH; }
  function pkMsRampY(k, x) { var M = PK_MS; return pkMsY(k) + M.FH * clamp((M.rx1 - x) / (M.rx1 - M.rx0), 0, 1); }
  function pkMsAt(pts, y) { return pts.map(function (p) { return [p[0], p[1], y]; }); }
  // up ramp k: in off level k's east lane at the east end, up the ramp westward, round onto level k+1's east lane
  function pkMsUp(k) {
    var M = PK_MS, pts = pkMsAt([[58.6, M.aE], [61.4, 46.3], [62.6, 43.6], [62.6, 40.2], [61.7, 38.0]], pkMsY(k));
    for (var x = M.rx1; x >= M.rx0 - 0.01; x -= 2.75) pts.push([x, M.up, pkMsRampY(k, x)]);
    return pts.concat(pkMsAt([[36.6, 37.8], [35.6, 40.0], [35.6, 44.4], [36.6, 46.5], [38.4, M.aE]], pkMsY(k + 1)));
  }
  // down ramp k: off level k+1's west lane at the west end, round onto the ramp, down it eastward, round onto level k's west lane
  function pkMsDown(k) {
    var M = PK_MS, pts = pkMsAt([[39.2, M.aW], [36.4, 49.6], [34.3, 47.6], [33.7, 44.0], [33.7, 38.6], [34.6, 35.6], [36.8, 34.7]], pkMsY(k + 1));
    for (var x = M.rx0; x <= M.rx1 + 0.01; x += 2.75) pts.push([x, M.dn, pkMsRampY(k, x)]);
    return pts.concat(pkMsAt([[62.0, 34.8], [63.4, 36.4], [63.6, 40.0], [63.6, 45.0], [62.9, 48.4], [61.2, 49.7], [58.8, M.aW]], pkMsY(k)));
  }
  function pkMsRoadIn(fromEast) {
    var M = PK_MS;
    return fromEast ? [[95, 77.5], [M.dx + 6, 77.5], [M.dx + 2.6, 77.2], [M.din + 1.2, 75.6]] : [[-95, 74.5], [M.dx - 9, 74.5], [M.dx - 3.6, 74.2]];
  }
  function pkMsRoadOut(toEast) {
    var M = PK_MS;
    return toEast ? [[M.dout + 2.2, 74.3], [M.dx + 9, 74.5], [95, 74.5]] : [[M.dout - 1, 76.6], [M.dx - 4, 77.5], [M.dx - 12, 77.5], [-95, 77.5]];
  }
  // the last of the way in: along the aisle and round into the bay (as the surface lot does it), at the bay's level
  function pkMsIntoBay(bay, sx, lane, fromX) {
    var y = bay.y, nose = bay.yaw === Math.PI / 2 ? -1 : 1;
    return pkMsAt(pkLotAisle([fromX, lane], [bay.x - sx * 3.6, lane], sx), y)
      .concat(pkMsAt([[bay.x - sx * 1.3, (lane + bay.mouth) / 2], [bay.x, bay.mouth + nose * 0.8], [bay.x, bay.z]], y));
  }
  function pkMsIn(bay, fromEast) {
    var M = PK_MS, pts = pkMsRoadIn(fromEast).concat([[M.din, 72.4], [M.din, 53.6]]);
    if (!bay.L) {
      var sx = bay.x < M.din ? -1 : 1, lane = sx < 0 ? M.aW : M.aE;
      return pts.concat(pkMsIntoBay(bay, sx, lane, M.din + sx * 2.6));
    }
    pts.push([M.din + 2.6, M.aE]);
    for (var k = 0; k < bay.L; k++) pts = pts.concat(pkMsUp(k));
    return pts.concat(pkMsIntoBay(bay, 1, M.aE, 38.4));
  }
  function pkMsOut(bay, toEast) {
    var M = PK_MS, nose = bay.yaw === Math.PI / 2 ? -1 : 1, y = bay.y;
    // on the ground floor the car heads for the drive, so its tail swings away from it; on a deck it heads west for the ramp down
    var sx = bay.L ? 1 : (bay.x < M.dout ? -1 : 1), lane = bay.L ? M.aW : (sx < 0 ? M.aE : M.aW);
    var back = pkMsAt([[bay.x, bay.z], [bay.x, bay.mouth - nose * 0.6], [bay.x + sx * 1.6, lane]], y);
    var fwd = [[bay.x + sx * 1.6, lane, y]];
    if (bay.L) {
      fwd = fwd.concat(pkMsAt(pkLotAisle([bay.x - 2.4, lane], [40.6, lane], -1), y));
      for (var k = bay.L - 1; k >= 0; k--) {
        fwd = fwd.concat(pkMsDown(k));
        if (k > 0) fwd = fwd.concat(pkMsAt([[42.0, M.aW]], pkMsY(k)));   // along the level below to its own ramp down
      }
      fwd = fwd.concat([[M.dout + 2.8, M.aW]]);
    } else fwd = fwd.concat(pkLotAisle([bay.x - sx * 2.4, lane], [M.dout + sx * 2.8, lane], -sx));
    fwd = fwd.concat([[M.dout + sx * 0.4, M.aC + 3.0], [M.dout, M.aC + 6.0], [M.dout, 72.4]], pkMsRoadOut(toEast));
    return { back: back, fwd: fwd };
  }

  // ── The building ─────────────────────────────────────────────────
  function pkMsMats() {
    if (PK_MS.M) return PK_MS.M;
    var M = PK_MS.M = {};
    M.concrete = std({ color: 0xa3a19b, roughness: 0.92 });
    M.deck = std({ color: 0x55585d, roughness: 0.95 });
    M.edge = std({ color: 0xc9c5bb, roughness: 0.85 });
    M.rail = std({ color: 0x2f6f4f, roughness: 0.5, metalness: 0.4 });
    M.brick = std({ color: 0x8a4b38, roughness: 0.85 });
    M.glass = std({ color: 0x9fc4d8, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.45 });
    M.yellow = std({ color: 0xe8c040, roughness: 0.6 });
    return M;
  }
  // a slab of deck between x0..x1, z0..z1 with its top at y
  function pkMsSlab(x0, x1, z0, z1, y) { var M = pkMsMats(); box(x1 - x0, 0.3, z1 - z0, M.deck, (x0 + x1) / 2, y - 0.15, (z0 + z1) / 2); box(x1 - x0 + 0.06, 0.12, z1 - z0 + 0.06, M.edge, (x0 + x1) / 2, y - 0.36, (z0 + z1) / 2); }
  // a parapet along one edge: a concrete upstand with a green rail on it
  function pkMsWall(x0, z0, x1, z1, y) {
    var M = pkMsMats(), dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz), w = box(L, 0.85, 0.2, M.concrete, (x0 + x1) / 2, y + 0.42, (z0 + z1) / 2);
    w.rotation.y = Math.atan2(-dz, dx);
    var r = box(L, 0.06, 0.08, M.rail, (x0 + x1) / 2, y + 1.05, (z0 + z1) / 2); r.rotation.y = w.rotation.y;
  }
  // a ramp from (x0, y0) to (x1, y1) along z centre zc, w wide, with a kerb wall along its outer edge
  function pkMsRamp(x0, y0, x1, y1, zc, w) {
    var M = pkMsMats(), L = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0);
    var s = box(L, 0.3, w, M.deck, (x0 + x1) / 2, (y0 + y1) / 2 - 0.15, zc); s.rotation.z = a;
    [-1, 1].forEach(function (s) {   // a kerb wall with a rail along both edges
      var k = box(L, 0.85, 0.2, M.concrete, (x0 + x1) / 2, (y0 + y1) / 2 + 0.42, zc + s * (w / 2 - 0.1)); k.rotation.z = a;
      var r = box(L, 0.06, 0.08, M.rail, (x0 + x1) / 2, (y0 + y1) / 2 + 1.05, zc + s * (w / 2 - 0.1)); r.rotation.z = a;
    });
    // the arrows painted up it
    for (var t = 0.2; t < 0.9; t += 0.3) {
      var ax = x0 + (x1 - x0) * t, ay = y0 + (y1 - y0) * t + 0.02;
      [[PK_MS.up, -1], [PK_MS.dn, 1]].forEach(function (l) { var m = box(1.2, 0.02, 0.18, MAT.whiteLine, ax, ay, l[0]); m.rotation.z = a; });
    }
  }
  // the bay lines and a wheel stop at the head of each bay, on a level
  function pkMsMarkings(L) {
    var M = PK_MS, y = pkMsY(L) + 0.015;
    [[42, 39.7], [55, 57.3]].forEach(function (r, ri) {
      for (var i = 0; i <= M.bayN; i++) {
        if (L === 0 && ri === 1 && i === 3) continue;   // the drive comes through bays 2 and 3 on the ground floor
        box(0.12, 0.02, 5, MAT.whiteLine, M.bayX0 - M.bayW / 2 + i * M.bayW, y, r[0]);
      }
    });
    PK_LOT.bays.forEach(function (b) { if (b.ms && b.L === L) box(1.7, 0.12, 0.22, MAT.steelDark, b.x, y + 0.05, b.front + (b.front < M.aC ? 0.5 : -0.5)); });
    // the aisle's centre line and the arrows that keep the traffic left
    box(M.rx1 - M.rx0 + 2, 0.02, 0.12, MAT.whiteLine, (M.rx0 + M.rx1) / 2, y, M.aC);
    if (L) { box(0.6, 0.02, 0.18, MAT.whiteLine, 37.2, y, 47.2); }
  }
  function pkMsBuild() {
    var M = PK_MS, C = pkMsMats(), y1 = pkMsY(1), y2 = pkMsY(2);
    // the ground floor, the drive up from the road and the walkers' apron to the lot's gate
    pkSlab(M.x1 - M.x0, M.z1 - M.z0, (M.x0 + M.x1) / 2, (M.z0 + M.z1) / 2, 0.012, pkAsphalt());
    pkSlab(6.2, 14.2, M.dx, 65.2, 0.011, pkAsphalt());
    pkSlab(13.6, 4.6, 37.3, 60.3, 0.013, pkMats().pavers);
    // the decks: level 1 has its landing at the west end of the ramp strip and the turn onto the ramp up at its east end;
    // level 2, the roof, has its landing only
    pkMsSlab(M.x0, M.x1, M.zDeck, M.z1, y1); pkMsSlab(M.x0, M.rx0, M.z0, M.zDeck, y1); pkMsSlab(M.rx1, M.x1, M.z0, M.zDeck, y1);
    pkMsSlab(M.x0, M.x1, M.zDeck, M.z1, y2); pkMsSlab(M.x0, M.rx0, M.z0, M.zDeck, y2);
    pkMsRamp(M.rx1, 0, M.rx0, y1, (M.z0 + M.zDeck) / 2, M.zDeck - M.z0);
    pkMsRamp(M.rx1, y1, M.rx0, y2, (M.z0 + M.zDeck) / 2, M.zDeck - M.z0);
    // the parapets round the decks, and the wall between the ramps and rank N on every level
    [y1, y2].forEach(function (y, i) {
      pkMsWall(M.x0, M.z1, M.x1, M.z1, y);                          // south
      pkMsWall(M.x0, M.z0, M.x0, M.z1, y);                          // west
      pkMsWall(M.x0, M.z0, M.rx0, M.z0, y);                         // the landing's north edge
      if (i === 0) { pkMsWall(M.rx1, M.z0, M.x1, M.z0, y); pkMsWall(M.x1, M.z0, M.x1, M.z1, y); }
      else pkMsWall(M.x1, M.zDeck, M.x1, M.z1, y);
    });
    [y1, y2].forEach(function (y) { pkMsWall(M.rx0, M.zDeck, M.rx1, M.zDeck, y); });
    pkMsWall(M.rx1 - 0.1, M.zDeck, M.x1 - 2.2, M.zDeck, y2);         // the roof's edge over the ramp's top end
    // the columns: along both long edges and down the ramps' outer kerb, every two bays
    var H = y2 + 1.1;
    [M.x0 + 0.3, 44.5, 50, 55.5, 61, M.x1 - 0.3].forEach(function (x) {
      [[M.z1 - 0.3, y2], [M.zDeck + 0.15, y2], [M.z0 + 0.3, x < M.rx0 ? y2 : y1]].forEach(function (c) {
        if (c[0] === M.z0 + 0.3 && x > M.rx0 && x < M.rx1) return;   // never in the ramps' way
        box(0.5, c[1], 0.5, C.concrete, x, c[1] / 2, c[0]); solid(x - 0.25, x + 0.25, c[0] - 0.25, c[0] + 0.25, 0, c[1]);
      });
    });
    // the stair tower at the south-west corner: brick, glazed up the stair, a door onto the apron, a lit P on top
    var tx0 = 37.4, tx1 = 41.0, tz0 = 58.5, tz1 = 62.2, tH = H + 1.6;
    box(tx1 - tx0, tH, tz1 - tz0, C.brick, (tx0 + tx1) / 2, tH / 2, (tz0 + tz1) / 2);
    box(0.06, tH - 2.6, 1.6, C.glass, tx0 - 0.03, (tH - 2.6) / 2 + 2.2, 60.4);
    box(0.08, 2.1, 1.1, std({ color: 0x2f6f4f, roughness: 0.5 }), tx0 - 0.04, 1.05, 60.4);
    box(tx1 - tx0 + 0.3, 0.25, tz1 - tz0 + 0.3, C.concrete, (tx0 + tx1) / 2, tH + 0.12, (tz0 + tz1) / 2);
    solid(tx0, tx1, tz0, tz1, 0, tH);
    sign(['P'], 1.4, 1.4, (tx0 + tx1) / 2, tH - 1.0, tz1 + 0.04, 0, { bg: '#2a5a9e', fg: '#ffffff' });
    sign(['STAIRS', 'LEVELS 0 - 2'], 1.3, 0.5, tx0 - 0.05, 2.7, 60.4, -Math.PI / 2, { bg: '#1b232c', fg: '#f5b53d' });
    // its name along the south parapet, over the drive
    sign(['MULTI-STOREY   P   3 LEVELS'], 9, 0.8, M.dx + 3, y2 + 0.5, M.z1 + 0.12, 0, { bg: '#2a5a9e', fg: '#ffffff' });
    // the markings, every level, and the strip lights under the decks over the aisle and the bays
    for (var L = 0; L < M.levels; L++) pkMsMarkings(L);
    var strip = glowMat(0xf4f1e6, 1.4);
    [y1, y2].forEach(function (y) {
      for (var sx = 40.5; sx < 60; sx += 4.5) [42.5, M.aC, 55].forEach(function (sz) { box(1.4, 0.06, 0.22, strip, sx, y - 0.47, sz); });
    });
    // the fence that keeps it out of the park: north of the ramps and west of the turn
    pkPalisade(32.5, 32.4, M.x1 + 0.8, 32.4);
    pkPalisade(M.x1 + 0.8, 32.4, M.x1 + 0.8, 71);
    // lamps on the roof and at the drive
    [[M.x0 + 0.8, M.z1 - 0.8], [M.x1 - 0.8, M.z1 - 0.8], [M.x0 + 0.8, M.zDeck + 0.8], [M.x1 - 0.8, M.zDeck + 0.8]].forEach(function (p) {
      cyl(0.07, 4.2, MAT.steelDark, p[0], y2 + 2.1, p[1], null, 8); box(0.6, 0.14, 0.3, glowMat(0xfff1c8, 1.2), p[0], y2 + 4.2, p[1]);
    });
    pkLamp(M.dx - 4.2, 66, 5.2); pkLamp(M.dx + 4.2, 62, 5.2);
    // the barrier across the drive and the pay machine beside it
    var g = new THREE.Group(); g.position.set(M.dx - 3.1, 1.05, M.boomZ); scene.add(g); g.userData.dynamic = true;
    box(6.2, 0.12, 0.12, MAT.whiteLine, 3.1, 0, 0, g);
    for (var k = 0; k < 3; k++) box(0.5, 0.125, 0.125, MAT.red, 1.2 + k * 2.1, 0, 0, g);
    M.boom = g;
    cyl(0.14, 1.1, MAT.steelDark, M.dx - 3.1, 0.55, M.boomZ, null, 10);
    box(0.55, 1.35, 0.45, C.yellow, M.dx - 3.9, 0.68, M.boomZ - 0.6);
    box(0.36, 0.26, 0.02, glowMat(0x5fd38d, 1.1), M.dx - 3.9, 1.12, M.boomZ - 0.37);
    sign(['PAY HERE', 'per car'], 0.5, 0.3, M.dx - 3.9, 1.62, M.boomZ - 0.36, 0, { bg: '#2a5a9e', fg: '#ffffff' });
  }
  function pkMsBoomTick(dt) {
    var M = PK_MS;
    M.boomT = clamp(M.boomT + (M.near ? 1.6 : -0.8) * dt, 0, 1); M.near = false;
    if (M.boom) M.boom.rotation.z = M.boomT * 1.35;
  }
  // built with the midway, before the bake: the multi-storey is static concrete, only its barrier moves
  var _pkMsMidway = pkMidway;
  pkMidway = function () { _pkMsMidway(); pkMsBuild(); };

  var _pkMsT = GAME.T;
  GAME.T = function () { var t = _pkMsT(); t.PK_MS = PK_MS; t.pkMsFee = pkMsFee; t.pkMsSetFee = pkMsSetFee; t.pkLotArrive = pkLotArrive; t.pkLotIn = pkLotIn; t.pkLotOut = pkLotOut; return t; };
