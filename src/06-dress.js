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
    danse:     { a: 0x4a4a55, b: 0xff8a3d, ground: 0x6e6a60, name: 'Danse Macabre' }
  };
  // the pavers, tinted toward the ride's own colour so each plot reads as a place of its own
  var PK_PADS = {};
  function pkPadMat(c) {
    if (PK_PADS[c]) return PK_PADS[c];
    var col = new THREE.Color(c).lerp(new THREE.Color(0xffffff), 0.45);
    return (PK_PADS[c] = std({ map: pkMats().paverTex, color: col.getHex(), roughness: 0.9 }));
  }
  // a piece of a ride's dressing as an editor item of its own: build(g) lays it into g, and the editor can then select, move,
  // turn, copy or delete it on its own instead of the whole ride's dressing at once
  function pkDressItem(kind, build) { return worldItem(kind, function () { var g = new THREE.Group(); parentOf(null).add(g); build(g); return g; }); }
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
        pkDressItem('bunting', function (g) { pkBunting(p.x - p.r - 1.2, p.z - p.r - 1.2, p.x + p.r + 1.2, p.z - p.r - 1.2, th, g); });
        pkDressItem('bunting', function (g) { pkBunting(p.x + side * (p.r + 1.2), p.z - p.r - 1.2, p.x + side * (p.r + 1.2), p.z + p.r + 1.2, th, g); });
        pkDressItem('bunting', function (g) { pkBunting(p.x - p.r - 1.2, p.z - p.r - 1.2, p.x - p.r - 1.2, p.z + p.r + 1.2, th, g); });
      }
      // the gateway over the queue, facing the midway
      pkDressItem('ride gateway', function (g) { if (th.portal) th.portal(p, side, g); else pkGatewayBetter(p.q[0], p.q[1], th.name, th, side, g); });   // centred on the switchbacks, its posts just outside them (a theme may bring its own portal)
      // the line itself: a fenced lane behind the arch with a boarding gate. It stays with the ride (the guests walk its slots)
      pkQueueLaneBetter(a, th, dg);
      // the ride's own station round it: the fence, the entrance porch and the exit
      pkFlatStation(a, th);
      // planters by the gateway and two lamps, where the plot has the room for them
      if (!th.noDecor) {
        pkBedIn(p.q[0] + side * 2.8, p.q[1] - 2.6, dg);
        pkBedIn(p.q[0] + side * 2.8, p.q[1] + 2.6, dg);
        lampPost(p.q[0] - side * 1.2, p.q[1] - 3.8, 0, 4.5);
        lampPost(p.q[0] - side * 1.2, p.q[1] + 3.8, 0, 4.5);
      }
      pkDressItem('ride decoration', function (g) { pkSignature(a, p, th, g); });
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
  function pkBuntingBuild(x0, z0, x1, z1, th, parent) {
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
  // Every ride runs a proper line, folded into switchbacks so it keeps to a small block beside the ride instead of a long
  // strip out into the paths (pkAttrLane has the rows). The boarding gate stands at the front of row 0 under the gateway
  // arch, a low steel fence runs round the block and between the rows (open at the turns), and an open entry at the end
  // of the last row carries the QUEUE sign. The boarding gate opens with the ride's own gates (C.gates).
  function pkQueueLaneBetter(a, th, parent) {
    var C = pkCtl(a), L = pkAttrLane(a), dir = L.dir, sz = L.sz, P = L.pitch;
    var qx = a.qx, qz = L.z0;                                  // row 0, the boarding row
    var xN = qx - dir * 0.66;                                   // the near end: the boarding gate, clear of slot 0
    var xF = qx + dir * (L.step * (L.R - 1) + 0.66);           // the far end: the turns and the entry
    var zb = function (r) { return qz + sz * P * (r + 0.5); }; // the fence line on the far side of row r (r = -1: row 0's near side)
    var zRow = function (r) { return qz + sz * P * r; };
    var lo = Math.min(xN, xF), hi = Math.max(xN, xF), zLo = Math.min(zb(-1), zb(L.rows - 1)), zHi = Math.max(zb(-1), zb(L.rows - 1));
    // the lane floor: a tinted block with a stone kerb, a hand's width wider than the fence
    box(hi - lo + 0.9, 0.10, zHi - zLo + 0.36, pkMats().kerb, (lo + hi) / 2, 0.012, (zLo + zHi) / 2, parent);
    box(hi - lo + 0.6, 0.055, zHi - zLo + 0.1, pkPadMat(th.ground), (lo + hi) / 2, 0.035, (zLo + zHi) / 2, parent);
    // the fences: round the block, and between the rows with the gap where the line turns
    var segs = [], r;
    var seg = function (x0, z0, x1, z1) { segs.push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) }); pkLaneFenceSeg(x0, z0, x1, z1, parent); };
    seg(xN, zb(-1), xF, zb(-1));
    seg(xN, zb(L.rows - 1), xF, zb(L.rows - 1));
    for (r = 0; r < L.rows - 1; r++) {
      if (r % 2 === 0) seg(xN, zb(r), xF - dir * 1.0, zb(r));          // row r turns into row r+1 at the far end
      else seg(xN + dir * 1.0, zb(r), xF, zb(r));                      // and back at the near end
    }
    if (L.rows > 1) {
      seg(xN, zb(0), xN, zb(L.rows - 1));                              // the near end, past the gate
      seg(xF, zb(-1), xF, zb(L.rows - 2));                             // the far end, short of the entry
    }
    // the boarding gate: two steel leaves on the gate posts across row 0. They swing toward the ride as C.gates opens,
    // which is the same signal the platform gates use.
    var zA = qz - P / 2, zB = qz + P / 2;
    [zA - 0.02, zB + 0.02].forEach(function (z) {
      pkRoundCyl(0.075, 1.30, MAT.steelDark, xN, 0.65, z, parent, 8);
      sphere(0.075, pkMats().gold, xN, 1.33, z, parent);
    });
    var leafL = new THREE.Group(); leafL.position.set(xN, 0, zA); parent.add(leafL);
    var leafR = new THREE.Group(); leafR.position.set(xN, 0, zB); parent.add(leafR);
    var gateMat = std({ color: 0x2f3a42, roughness: 0.5, metalness: 0.35 }), lw = P / 2 - 0.03;
    pkBevelBox(0.055, 0.92, lw, gateMat, 0, 0.55, lw / 2, leafL, 0.015);
    pkBevelBox(0.055, 0.92, lw, gateMat, 0, 0.55, -lw / 2, leafR, 0.015);
    pkBevelBox(0.075, 0.06, lw - 0.04, pkMats().gold, 0, 0.98, lw / 2, leafL, 0.01);
    pkBevelBox(0.075, 0.06, lw - 0.04, pkMats().gold, 0, 0.98, -lw / 2, leafR, 0.01);
    C.gateObjs.push(function (t) { leafL.rotation.y = -t * 1.42; leafR.rotation.y = t * 1.42; });
    // the entry at the end of the last row: two posts, a header and the sign facing out (a ride with its own portal over
    // the line has its way in there already, so it gets neither these nor the plate)
    var zE = zRow(L.rows - 1), xE = xF;
    if (!th.portal) {
    [-1, 1].forEach(function (k) {
      pkRoundCyl(0.085, 2.30, MAT.steelDark, xE, 1.15, zE + k * (P / 2 + 0.04), parent, 8);
      sphere(0.09, pkMats().gold, xE, 2.33, zE + k * (P / 2 + 0.04), parent);
    });
    pkBevelBox(0.13, 0.16, P + 0.3, MAT.steelDark, xE, 2.28, zE, parent, 0.02);
    pkSign3D(['QUEUE', th.name.toUpperCase()], 1.6, 0.34, xE, 2.58, zE, dir > 0 ? Math.PI / 2 : -Math.PI / 2, { bg: '#1b232c', fg: '#f5b53d' }, parent);
    // the line's own number plate, so the player can see where it starts
    var zPlate = zE + sz * (P / 2 + 0.5);
    pkRoundCyl(0.045, 1.55, MAT.steelDark, xE + dir * 0.30, 0.77, zPlate, parent, 8);
    pkSign3D(['QUEUE FROM HERE'], 1.25, 0.20, xE + dir * 0.30, 1.62, zPlate, dir > 0 ? Math.PI / 2 : -Math.PI / 2, { bg: '#1b232c', fg: '#eef1f5' }, parent);
    }
    // the player's way in: press E at the entry to ride
    hitBox(2.0, 2.2, 2.0, xE + dir * 0.4, 1.1, zE, {
      prompt: function () {
        if (!a.open || PK.playerRide) return '';
        if (PK.playerWait && PK.playerWait.a === a) return 'Waiting for ' + a.name + ' - press E to leave the line';
        return 'Ride ' + a.name;
      },
      use: function () { pkPlayerRideJoin(a); }
    }, parent);
    // the fences block the player, but only while the ride is open and the lane is drawn
    PK.lanes.push({ a: a, x0: lo, x1: hi, zA: zLo, zB: zHi, gx: xN, gz0: zA, gz1: zB, segs: segs, rows: L.rows, leafL: leafL, leafR: leafR });
  }
  // a run of lane fence between two points on a line along x or along z: posts, a top rail and a mid rail
  function pkLaneFenceSeg(x0, z0, x1, z1, parent) {
    var len = Math.hypot(x1 - x0, z1 - z0); if (len < 0.05) return;
    var n = Math.max(1, Math.round(len / 1.65)), alongX = Math.abs(x1 - x0) >= Math.abs(z1 - z0);
    for (var i = 0; i <= n; i++) {
      var x = x0 + (x1 - x0) * (i / n), z = z0 + (z1 - z0) * (i / n);
      pkRoundCyl(0.055, 1.06, MAT.steelDark, x, 0.53, z, parent, 8);
      sphere(0.052, pkMats().gold, x, 1.09, z, parent);
    }
    var mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    pkBevelBox(alongX ? len : 0.05, 0.05, alongX ? 0.05 : len, MAT.steelDark, mx, 0.99, mz, parent, 0.008);
    pkBevelBox(alongX ? len : 0.045, 0.045, alongX ? 0.045 : len, MAT.steelDark, mx, 0.52, mz, parent, 0.008);
  }
  function pkLaneFence(x0, x1, z, parent) { pkLaneFenceSeg(x0, z, x1, z, parent); }
  // ── The flat rides' stations ─────────────────────────────────────
  // Every flat ride stands in its own enclosure, the way a park does it: a ring of low ornamental iron fence round the ride
  // with gold finials, the operator's booth set into it, an entrance facing the queue under a little fairy-tale porch (a
  // pointed roof in the ride's colours, its name over the way in, two lanterns) and a separate exit round the ring with its
  // own sign, where the riders come off. The fence is solid; the gaps are the only ways in and out, so the guests walk in at
  // the entrance and leave by the exit. The radius keeps clear of everything the ride swings round. The flume (its own
  // channel) and Danse Macabre (its porch) have their stations already.
  // the fence radius, and 'arch' where something overhead (a ride's own canopy, the arena's eaves) leaves no room for a roof
  // A ride's station gate: a pair of railed steel leaves on capped posts, a gilt top rail and a hazard-striped meeting edge,
  // in the ride's colour. (x, z) is the middle of the opening, (ix, iz) the way the leaves swing (into the station for an
  // entrance, out of it for an exit), w the opening's width. They follow the ride's station-gate circuit (C.sgT): open
  // while the ride stands, shut while it runs.
  function pkStationGatePair(parent, x, z, ix, iz, w, C, col) {
    var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.atan2(ix, iz); parent.add(g);
    var steel = std({ color: 0x2b3238, roughness: 0.45, metalness: 0.55 }), paint = std({ color: col, roughness: 0.5, metalness: 0.2 }), gold = pkMats().gold, H = 1.05;
    [-1, 1].forEach(function (s) {
      pkRoundCyl(0.06, H + 0.15, steel, s * (w / 2 + 0.04), (H + 0.15) / 2, 0, g, 8); sphere(0.075, gold, s * (w / 2 + 0.04), H + 0.2, 0, g);
      pkRoundCyl(0.12, 0.06, steel, s * (w / 2 + 0.04), 0.03, 0, g, 10);
      var piv = new THREE.Group(); piv.position.set(s * w / 2, 0, 0); g.add(piv);
      var lw = w / 2 - 0.04, dx = -s;                      // each leaf runs from its hinge toward the middle
      box(lw, 0.06, 0.05, gold, dx * lw / 2, H, 0, piv, { r: 0.015 });
      box(lw, 0.05, 0.04, steel, dx * lw / 2, 0.2, 0, piv);
      box(lw, 0.18, 0.025, paint, dx * lw / 2, 0.62, 0, piv);
      [0.03, lw - 0.03].forEach(function (o) { box(0.05, H - 0.15, 0.05, steel, dx * o, (H + 0.15) / 2, 0, piv); });
      for (var b = 0.14; b < lw - 0.08; b += 0.12) box(0.02, H - 0.2, 0.02, steel, dx * b, (H + 0.2) / 2, 0, piv);
      box(0.04, H - 0.15, 0.06, MAT.hazard, dx * (lw - 0.005), (H + 0.15) / 2, 0, piv);
      C.stationGateObjs.push(function (t) { piv.rotation.y = -dx * t * 1.45; });
    });
    return g;
  }
  var PK_FLAT_STATIONS = { kround: [5.0, 'arch'], kpots: [5.3, 'arch'], carousel: [8.6], teacups: [7.4], ferris: [10.2], dodgems: [10.0, 'arch'], droptower: [6.2] };
  function pkFlatStation(a, th) {
    var S = PK_FLAT_STATIONS[a.id]; if (!S) return;
    var R = S[0], arch = S[1] === 'arch';
    var p = a.plot, cx = p.x, cz = p.z, L = pkAttrLane(a), i;
    var gx = a.qx - L.dir * 0.66, gz = L.z0;                                   // the boarding gate at the front of the line
    var aIn = Math.atan2(gz - cz, gx - cx);
    var bAng = a.booth ? Math.atan2(a.booth.position.z - cz, a.booth.position.x - cx) : aIn + Math.PI;
    var dAng = function (x, y) { var d = x - y; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
    // the exit goes round the ring from the entrance, on the side away from the booth
    var aOut = aIn + (dAng(bAng, aIn) > 0 ? -1 : 1) * 1.35;
    var gapIn = 1.25 / R, gapOut = 1.05 / R;
    var iron = std({ color: 0x23272b, roughness: 0.5, metalness: 0.45 }), gold = pkMats().gold, band = std({ color: th.a, roughness: 0.6, metalness: 0.15 });
    // where the fence breaks: the two gaps and the booth (which stands in the line of the fence)
    var bx = a.booth ? a.booth.position.x : 1e9, bz = a.booth ? a.booth.position.z : 1e9;
    var open = function (ang) {
      if (Math.abs(dAng(ang, aIn)) < gapIn || Math.abs(dAng(ang, aOut)) < gapOut) return true;
      var x = cx + Math.cos(ang) * R, z = cz + Math.sin(ang) * R;
      return Math.abs(x - bx) < 2.3 && Math.abs(z - bz) < 2.3;
    };
    // the ring: posts every metre and a bit, a top rail, a lower rail and a band in the ride's colour, laid as chords. Each part of
    // the station (the fence, the entrance, the exit) is an editor item of its own, built inside it so its solids go with it
    var postMat = std({ color: th.a, roughness: 0.55, metalness: 0.1 }), roofMat = std({ color: th.b, roughness: 0.6, metalness: 0.1 });
    pkDressItem('ride fence', function (parent) {
    var n = Math.max(16, Math.round(2 * Math.PI * R / 1.2)), prev = null;
    for (i = 0; i <= n; i++) {
      var ang = i / n * 2 * Math.PI, x = cx + Math.cos(ang) * R, z = cz + Math.sin(ang) * R, here = !open(ang);
      if (here && i < n) { pkRoundCyl(0.045, 1.0, iron, x, 0.5, z, parent, 6); sphere(0.06, gold, x, 1.04, z, parent); }
      if (here && prev) {
        var mx = (x + prev[0]) / 2, mz = (z + prev[1]) / 2, len = Math.hypot(x - prev[0], z - prev[1]), ry = Math.atan2(x - prev[0], z - prev[1]);
        box(0.05, 0.05, len, iron, mx, 0.94, mz, parent).rotation.y = ry;
        box(0.04, 0.04, len, iron, mx, 0.36, mz, parent).rotation.y = ry;
        box(0.03, 0.16, len, band, mx, 0.66, mz, parent).rotation.y = ry;
        solid(Math.min(x, prev[0]) - 0.06, Math.max(x, prev[0]) + 0.06, Math.min(z, prev[1]) - 0.06, Math.max(z, prev[1]) + 0.06, 0, 1.0);
      }
      prev = here ? [x, z] : null;
    }
    });
    // the entrance porch: four posts in the ride's colour astride the fence, a pointed roof, the name, lanterns
    var ex = cx + Math.cos(aIn) * R, ez = cz + Math.sin(aIn) * R, out = [Math.cos(aIn), Math.sin(aIn)], tg = [-Math.sin(aIn), Math.cos(aIn)];
    pkDressItem('ride entrance', function (parent) {
    var PH = arch ? 2.25 : 2.6, depth = arch ? 0 : 0.75;
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (s) {
      if (arch && s[1] > 0) return;                                          // an arch stands on two posts
      var px = ex + tg[0] * s[0] * 1.3 + out[0] * s[1] * depth, pz = ez + tg[1] * s[0] * 1.3 + out[1] * s[1] * depth;
      pkRoundCyl(0.09, PH, postMat, px, PH / 2, pz, parent, 8);
      pkRoundCyl(0.13, 0.16, gold, px, PH + 0.02, pz, parent, 8);
      solid(px - 0.12, px + 0.12, pz - 0.12, pz + 0.12, 0, PH);
    });
    var porch = new THREE.Group(); porch.position.set(ex, PH + 0.1, ez); porch.rotation.y = Math.atan2(out[0], out[1]); parent.add(porch);
    if (arch) {
      box(2.9, 0.16, 0.22, postMat, 0, 0, 0, porch);
      pkSign3D([th.name.toUpperCase()], 2.4, 0.34, 0, -0.3, 0.12, 0, { bg: '#151a20', fg: '#f5d38a' }, porch);
      sphere(0.14, gold, 0, 0.18, 0, porch);
    } else {
      box(3.0, 0.14, 1.9, postMat, 0, 0, 0, porch);
      var roof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.7, 4, 1), roofMat); roof.rotation.y = Math.PI / 4; roof.scale.set(1.0, 1.0, 0.68); roof.position.y = 0.92; roof.castShadow = true; porch.add(roof);
      pkRoundCyl(0.04, 0.6, gold, 0, 2.0, 0, porch, 6); sphere(0.12, gold, 0, 2.32, 0, porch);
      pkSign3D([th.name.toUpperCase()], 2.6, 0.36, 0, -0.32, 0.98, 0, { bg: '#151a20', fg: '#f5d38a' }, porch);
    }
    [-1, 1].forEach(function (s) { pkRoundCyl(0.11, 0.24, glowMat(0xfff2c0, 1.0), s * 1.3, -0.3, arch ? 0.15 : 0.9, porch, 10); });
    // the station gates in the fence's opening, swinging in toward the ride
    pkStationGatePair(parent, ex, ez, -out[0], -out[1], 2.3, pkCtl(a), th.a);
    });
    // the exit: two posts, an EXIT board facing out, and the riders come off just outside it
    var xx = cx + Math.cos(aOut) * R, xz = cz + Math.sin(aOut) * R, o2 = [Math.cos(aOut), Math.sin(aOut)], t2 = [-Math.sin(aOut), Math.cos(aOut)];
    pkDressItem('ride exit', function (parent) {
    [-1, 1].forEach(function (s) {
      var px = xx + t2[0] * s * 1.05, pz = xz + t2[1] * s * 1.05;
      pkRoundCyl(0.07, 2.2, postMat, px, 1.1, pz, parent, 8); sphere(0.09, gold, px, 2.24, pz, parent);
      solid(px - 0.1, px + 0.1, pz - 0.1, pz + 0.1, 0, 2.2);
    });
    pkStationGatePair(parent, xx, xz, o2[0], o2[1], 1.9, pkCtl(a), th.a);   // the exit's own gates, swinging out
    var exitSign = new THREE.Group(); exitSign.position.set(xx, 2.05, xz); exitSign.rotation.y = Math.atan2(o2[0], o2[1]); parent.add(exitSign);
    box(2.3, 0.1, 0.1, postMat, 0, 0.12, 0, exitSign);
    pkSign3D(['EXIT'], 1.2, 0.34, 0, -0.14, 0.07, 0, { bg: '#1d5c3a', fg: '#ffffff' }, exitSign);
    });
    a.exit = [xx + o2[0] * 1.3, xz + o2[1] * 1.3];
    a.station = { r: R, entry: [ex, ez], exit: [xx, xz] };
  }
  // the beds by a ride's gateway stand in the world on their own, not inside the ride's dressing group, so the editor can
  // pick each one up: move it, turn it, copy it or take it away (the parent is kept in the call only for the old signature)
  function pkBedIn(x, z, parent) {
    pkFlowerBed(x, z, 1.8, 1.1, null, true);
  }
  // the one thing each ride is known for
  function pkSignature(a, p, th, parent) {
    var g = parent;
    if (a.id === 'carousel') {
      var band = new THREE.Mesh(new THREE.TorusGeometry(7.2, 0.1, 6, 44), std({ color: 0xf0c04a, roughness: 0.35, metalness: 0.45 }));
      band.rotation.x = Math.PI / 2; band.position.set(p.x, 4.0, p.z); parent.add(band);
      box(1.7, 1.9, 1.0, std({ color: 0x8a5a3a, roughness: 0.9 }), p.x - p.r - 2.6, 0.95, p.z + 2.4, g);
      for (var i = 0; i < 5; i++) cyl(0.07, 1.0 - i * 0.13, std({ color: 0xf0c04a, roughness: 0.4 }), p.x - p.r - 3.1 + i * 0.25, 2.2, p.z + 2.4, g, 8);
      // the fairground quarter: brass lamps on the rim, a souvenir kiosk facing the avenue,
      // flower beds flanking the west lamp (inside the kids' lane) and a bench on the north rim
      [[-41.6, 12.5], [-41.6, 27.5], [-43.0, 20]].forEach(function (q) { pkLandLamp(q[0], q[1], g, th); });
      parent.add(pkStall(-36.5, 8.2, Math.PI, th.a, th.b, 'SOUVENIRS'));
      pkFlowerBed(-43.4, 17.3, 1.8, 1.1, null, true);   // in the world, so the editor can move them
      pkFlowerBed(-43.4, 25.2, 1.8, 1.1, null, true);
    } else if (a.id === 'teacups') {
      // the tea garden: clipped hedges and topiary balls on the far sides, a table set
      // on the south-west pad, cup lamps flanking the approach and a trellis arch over
      // the walk in from the midway
      pkHedgeRun(-65.6, -3.4, -65.6, 9.4, g, 1.05);
      pkHedgeRun(-63.6, 12.6, -49.2, 12.6, g, 1.05);
      [[-63.4, -4.4], [-63.4, 10.4], [-49.4, 10.4]].forEach(function (q) { pkTopiary(q[0], q[1], g, 1); });
      pkTeaTable(-58.5, -5.2, g);   // on the pad's north-west, clear of the booth
      [[-49.4, 6.0], [-47.6, 0.4]].forEach(function (q) { pkCupLamp(q[0], q[1], g); });   // the south one stands clear of the kids' lane
      pkTrellis(-40.8, 3, g);
    } else if (a.id === 'ferris') {
      // the sky quarter: three flag poles with festoon strung between them on the north
      // rim, a viewing deck with a brass telescope on the south rim, globe lamps and benches
      pkFlagPole(27, 30.1, g, th, 5.6); pkFlagPole(34, 29.9, g, th, 6.5); pkFlagPole(41, 30.1, g, th, 5.6);
      pkFestoon(27, 30.1, 34, 29.9, g, th, 4.4, 5.1); pkFestoon(34, 29.9, 41, 30.1, g, th, 5.1, 4.4);
      pkViewDeck(32.6, 9.4, g);
      pkLandLamp(29.2, 10.2, g, th, 'globe'); pkLandLamp(40.0, 10.2, g, th, 'globe');
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
    }
  }
  // ── Free pieces ──────────────────────────────────────────────────
  // the bunting, the lamps, the festoons and the flag poles round a ride stand in the world on their own, each one a world item,
  // rather than inside the ride's dressing group: the editor can pick any of them up and move, turn, copy or remove it. The
  // parent a caller passes is ignored for these; they are built where they are asked for.
  function pkBunting(x0, z0, x1, z1, th, parent) { return worldItem('bunting', function () { pkBuntingBuild(x0, z0, x1, z1, th, parentOf(null)); }); }
  function pkLandLamp(x, z, parent, th, style) { return worldItem('lamp', function () { pkLandLampBuild(x, z, parentOf(null), th, style); }); }
  function pkFestoon(x0, z0, x1, z1, parent, th, yA, yB) { return worldItem('festoon', function () { pkFestoonBuild(x0, z0, x1, z1, parentOf(null), th, yA, yB); }); }
  function pkCupLamp(x, z, parent) { return worldItem('cup lamp', function () { pkCupLampBuild(x, z, parentOf(null)); }); }
  function pkFlagPole(x, z, parent, th, h) { return worldItem('flag pole', function () { pkFlagPoleBuild(x, z, parentOf(null), th, h); }); }

  // ── The land kit ─────────────────────────────────────────────────
  // Small themed pieces shared by the per-ride lands: a lamp with an emissive lens, a
  // string of festoon bulbs, a topiary, a clipped hedge, a tea table, a cup lamp, a
  // trellis arch, a flag pole, a viewing deck. None of these adds a real point light —
  // the engine keeps only the nearest dozen, and glow materials carry a land at night.
  function pkLandLampBuild(x, z, parent, th, style) {
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
  function pkFestoonBuild(x0, z0, x1, z1, parent, th, yA, yB) {
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
  function pkCupLampBuild(x, z, parent) {
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
  function pkFlagPoleBuild(x, z, parent, th, h) {
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
