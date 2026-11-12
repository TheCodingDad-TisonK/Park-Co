//@ Park Co, part 12: the theme - the four lands, the routes that join them, the fountain at the hub, the garden walk through the middle, the planting and the signposts
  // ── What this part is for ────────────────────────────────────────
  // The park is a hub and four lands. The midway runs from the gate to Station Square, where the coaster stands like the castle
  // at the end of the street. Four lands sit round it: the Fairground (south-west), the Thrills (south-east), the Dark Woods
  // (north-west) and Coaster Country (north-east). A ring of streets joins them - west and east streets, the North Promenade -
  // and the Garden Walk cuts across the middle, so nobody walks a long street with nothing on it and nothing is a dead end.
  // It only adds. Where it needs to keep other things off its ground it answers pkThemeKeepClear (part 01's tree scatter asks).
  var PK_HUB = { x: 0, z: 10.5 };
  // the lands: a name, two colours for the arch, and the pavers every street in the land is laid in (0: the park's warm pavers)
  var PK_LANDS = {
    fair:    { name: 'THE FAIRGROUND',  a: 0xc94f4f, b: 0xf0c04a, pave: 0xd9b48a, sign: '#f5b53d' },
    thrill:  { name: 'THRILLS',         a: 0x2f6fb3, b: 0xf0c04a, pave: 0xa9b8c8, sign: '#9fd0ff' },
    dark:    { name: 'THE DARK WOODS',  a: 0x4a4a55, b: 0xff8a3d, pave: 0x8f8778, sign: '#ff9a52' },
    coaster: { name: 'COASTER COUNTRY', a: 0x2f8f6f, b: 0xf0c04a, pave: 0xc2ad86, sign: '#8fe0b0' },
    garden:  { name: 'THE GARDENS',     a: 0x4d7a3a, b: 0xf4f1e6, pave: 0, sign: '#f5e9c2' },
    kids:    { name: 'THE LITTLE MEADOW', a: 0xe58a2f, b: 0x2f9fb0, pave: 0xd8c9a0, sign: '#ffd27a' }
  };
  // the routes, as [x0, z0, x1, z1, width, land]. This is every street in the park, in one table (they used to be pushed in
  // from eight parts, each laying its own slab over whatever was there). The network, from the gate out:
  //   the midway and Station Square are plazas (pkPaveCore, below); everything else hangs off them:
  //   - the Avenue crosses the square east to west, from the Fairground lane to the East Walk;
  //   - West Street and East Street run north off it to the North Promenade, which closes the ring; the Garden Walk
  //     crosses the middle;
  //   - the East Walk runs the length of the old east side, and one footbridge walk leads off it over the Dragon Ride's
  //     line to the East Parade, the spine of the east strip;
  //   - a spur runs from the nearest street to each ride's line, square to the street, and nothing else.
  // No two routes run side by side and none is laid over another except where they join. The land a route belongs to names
  // it on the map and picks its arch; the paving is the same warm paver everywhere, so a joint is never a change of colour.
  var PK_ROUTES = [
    // the Avenue
    [-46.8, 3, -16, 3, 5, 'fair'], [20, 3, 74, 3, 5, 'thrill'],
    // the ring: West Street, East Street, the North Promenade; and the Garden Walk with its spine
    [-31, 3, -31, -60, 4, 'dark'], [35, 3, 35, -60, 4, 'coaster'], [-38.5, -60, 74, -60, 5, 'garden'],
    [-31, -44, 35, -44, 4, 'garden'], [2, -44, 2, -60, 4, 'garden'],
    // the Fairground lane: south off the Avenue past the carousel's west side, then east and south to the teacups' line
    [-46.8, 3, -46.8, 31.5, 3.6, 'fair'], [-46.8, 31.5, -34.6, 31.5, 3.6, 'fair'], [-34.6, 31.5, -34.6, 44.5, 3.6, 'fair'],
    // the Dark Woods: the abbey's spur, the Arena path, the drop tower's apron, the Wild Hunt's forecourt walk
    [-31, -24, -45.5, -24, 4, 'dark'], [-31, -40, -74, -40, 4, 'dark'], [-36.5, -60, -36.5, -64.6, 4, 'dark'], [-8.5, -62, -8.5, -80, 6, 'dark'],
    // Marerijk's promenade: south off the Arena path, along the palace front
    [-74, -40, -74, 12, 4, 'marerijk'],
    // the gardens: the windmill's spur
    [14, -60, 14, -66.6, 3, 'garden'],
    // Coaster Country: The Serpent's spur, the flume's spur
    [35, -60, 35, -65, 4, 'coaster'], [35, -65, 41, -65, 4, 'coaster'], [35, -20, 47.5, -20, 4, 'coaster'],
    // Thrills: Baron's Drop
    [56, 3, 56, 10.5, 4, 'thrill'],
    // the East Walk, one straight street from the Promenade to The Mountain King's line (it was two streets with a jog),
    // and off it: the Dragon Ride's line, the King's line, the footbridge walk
    [74, -60, 74, 64.6, 4, 'coaster'], [74, 1.5, 86.8, 1.5, 3.2, 'coaster'], [74, 64.6, 76.4, 64.6, 3.2, 'coaster'],
    [74, -3.3, 82, -3.3, 2.6, 'coaster'], [117, -3.3, 127, -3.3, 2.6, 'coaster'],
    // the east strip: the East Parade past Joris and The Mountain King, The Little Meadow (the kids' rides) north of Dragon
    // Gate's walk and the Thrills south of it, a spur east to each ride's line, and the walk out to Dragon Gate
    [127, -108, 127, -6, 4, 'kids'], [127, -6, 127, 60, 4, 'thrill'], [127, -2, 155, -2, 4.4, 'coaster'],
    [127, -101.5, 139, -101.5, 3.6, 'kids'], [127, -79, 139, -79, 4, 'kids'], [127, -54, 139, -54, 4, 'kids'], [127, -29, 141, -29, 3, 'kids'],
    [127, 22, 136, 22, 4.4, 'thrill'], [127, 52, 138, 52, 4.4, 'thrill']
  ];
  // the arches over the streets where each land begins: [x, z, the way the street runs ('x' or 'z'), land]
  var PK_ARCHES = [[-17.5, 3, 'x', 'fair'], [23.5, 3, 'x', 'thrill'], [-31, -6.5, 'z', 'dark'], [35, -6.5, 'z', 'coaster'], [127, -10, 'z', 'kids'], [127, 4.5, 'z', 'thrill']];
  var PK_KEEP = [];   // [x, z, r] circles other parts ask the planting to leave alone (part 13 adds its own)
  var PK_THEME_T = 0, PK_FOUNTAIN = { jet: null };

  function pkSegDist(px, pz, ax, az, bx, bz) {
    var dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz, t = l2 ? clamp(((px - ax) * dx + (pz - az) * dz) / l2, 0, 1) : 0;
    var cx = ax + dx * t, cz = az + dz * t;
    return Math.sqrt((px - cx) * (px - cx) + (pz - cz) * (pz - cz));
  }
  // true where something else (a tree) must not stand: the routes, the hub, the coaster's footprint
  function pkThemeKeepClear(x, z) {
    if (typeof pkXpClear === 'function' && pkXpClear(x, z)) return true;   // part 46: the expansion site, the new viaduct's line, the town and the farms
    for (var i = 0; i < PK_ROUTES.length; i++) {
      var r = PK_ROUTES[i], hw = r[4] / 2 + 2.5;
      if (x > Math.min(r[0], r[2]) - hw && x < Math.max(r[0], r[2]) + hw && z > Math.min(r[1], r[3]) - hw && z < Math.max(r[1], r[3]) + hw) return true;
    }
    for (var q = 0; q < PK_KEEP.length; q++) if (dist2(x, z, PK_KEEP[q][0], PK_KEEP[q][1]) < PK_KEEP[q][2] * PK_KEEP[q][2]) return true;
    return pkNearTrack(x, z, 4.5);
  }
  // close to the coaster's track, in plan: no tree grows up through the rails
  function pkNearTrack(x, z, d) {
    var P = PK_TRACK_PTS;
    for (var k = 0; k < P.length; k++) { var A = P[k], B = P[(k + 1) % P.length]; if (pkSegDist(x, z, A[0], A[2], B[0], B[2]) < d) return true; }
    return false;
  }
  function pkNearRoute(x, z, skip, d) {
    for (var i = 0; i < PK_ROUTES.length; i++) {
      if (i === skip) continue;
      var r = PK_ROUTES[i]; if (pkSegDist(x, z, r[0], r[1], r[2], r[3]) < r[4] / 2 + d) return true;
    }
    return false;
  }
  // inside a ride's pad, or close to its booth
  function pkNearRide(x, z, d) {
    for (var i = 0; i < PK_PLOTS.length; i++) { var p = PK_PLOTS[i]; if (dist2(x, z, p.x, p.z) < (p.r * 1.25 + d) * (p.r * 1.25 + d)) return true; }
    for (var q = 0; q < PK_KEEP.length; q++) if (dist2(x, z, PK_KEEP[q][0], PK_KEEP[q][1]) < (PK_KEEP[q][2] + d * 0.5) * (PK_KEEP[q][2] + d * 0.5)) return true;
    for (var j = 0; j < PK.attractions.length; j++) { var b = PK.attractions[j].booth; if (b && dist2(x, z, b.position.x, b.position.z) < (d + 2.9) * (d + 2.9)) return true; }
    return false;
  }

  function pkThemeBuild() {
    pkBuildRoutes();
    pkBuildHub();
    pkBuildRouteFurniture();
    PK_ARCHES.forEach(function (ar) { pkLandArch(ar[0], ar[1], ar[2], PK_LANDS[ar[3]]); });
    pkCoasterYard();
    pkBuildSignposts();
    if (typeof pkGardensBuild === 'function') pkGardensBuild();   // part 13: the plazas, the stalls and the North Promenade's attractions
  }

  // ── The routes ───────────────────────────────────────────────────
  // pavers on a stone edge, tinted to the land the street belongs to, so the ground tells you where you are. Every segment
  // sits a hair above the last, so where two meet there is no flicker.
  // ── The paving: one surface ──────────────────────────────────────
  // Every piece of paving in the park is a shape in one list: a street (a route), a plaza, a ride's pad, a forecourt. They
  // are drawn in two layers and nothing else: every shape grown by a kerb's width, in kerb stone, and above that every shape
  // itself, in pavers. A kerb can therefore only ever show round the outside of the paving as a whole: where two shapes
  // meet or cross there is no edge, no lip and no second slab, because the paving of one covers the kerb of the other.
  // The pavers are laid on the world's own grid (the texture is placed by where a point is, not by which shape it is in),
  // so the courses run straight through a joint. A ride's pad is tinted to its theme and lies just under the streets, so
  // a street carries on across it unbroken.
  var PK_PAVE = { shapes: [], meshes: [], dirty: false, built: false, KERB: 0.35, Y_KERB: 0.012, Y_PAD: 0.0135, Y_PAVE: 0.0165, tris: 0, mats: {} };
  // the layers lie millimetres apart, which a depth buffer cannot tell from high up (fly mode, the Skyline, the wheel): the
  // kerb showed through the pavers in pale strips. The kerb and the pads are drawn a few depth steps further away than they
  // lie, so the pavers always win over them; the pavers themselves are left alone, so whatever is inlaid on them (the
  // fountain's rings, a plaza's round) still lies on top as it always did
  function pkPaveMat(key, base, step) {
    var m = PK_PAVE.mats[key];
    if (!m) { m = PK_PAVE.mats[key] = base.clone(); m.polygonOffset = true; m.polygonOffsetFactor = step; m.polygonOffsetUnits = 3 * step; }
    return m;
  }
  function pkPaveSeg(x0, z0, x1, z1, w, tint) { PK_PAVE.shapes.push({ k: 'seg', x0: x0, z0: z0, x1: x1, z1: z1, w: w, tint: tint || 0 }); PK_PAVE.dirty = true; }
  function pkPaveRect(x0, x1, z0, z1, tint) { PK_PAVE.shapes.push({ k: 'rect', x0: x0, x1: x1, z0: z0, z1: z1, tint: tint || 0 }); PK_PAVE.dirty = true; }
  function pkPaveDisc(x, z, r, tint) { PK_PAVE.shapes.push({ k: 'disc', x: x, z: z, r: r, tint: tint || 0 }); PK_PAVE.dirty = true; }
  // a shape as triangles on the ground, grown by g: [[ax, az, bx, bz, cx, cz], ...]
  function pkPaveTris(s, g) {
    var out = [], i;
    if (s.k === 'disc') {
      var n = 48, r = s.r + g;
      for (i = 0; i < n; i++) { var a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2; out.push([s.x, s.z, s.x + Math.cos(a0) * r, s.z + Math.sin(a0) * r, s.x + Math.cos(a1) * r, s.z + Math.sin(a1) * r]); }
      return out;
    }
    var P;
    if (s.k === 'rect') P = [[s.x0 - g, s.z0 - g], [s.x1 + g, s.z0 - g], [s.x1 + g, s.z1 + g], [s.x0 - g, s.z1 + g]];
    else {
      // a street: its centre line, squared off half a width past each end so two streets meeting at a corner fill it
      var dx = s.x1 - s.x0, dz = s.z1 - s.z0, len = Math.sqrt(dx * dx + dz * dz) || 1, ux = dx / len, uz = dz / len, hw = s.w / 2 + g, e = s.w / 2 + g;
      var ax = s.x0 - ux * e, az = s.z0 - uz * e, bx = s.x1 + ux * e, bz = s.z1 + uz * e, nx = -uz * hw, nz = ux * hw;
      P = [[ax + nx, az + nz], [bx + nx, bz + nz], [bx - nx, bz - nz], [ax - nx, az - nz]];
    }
    out.push([P[0][0], P[0][1], P[1][0], P[1][1], P[2][0], P[2][1]], [P[0][0], P[0][1], P[2][0], P[2][1], P[3][0], P[3][1]]);
    return out;
  }
  // the plazas that are not streets: the forecourt, the gate, the midway, Station Square and the aprons off them
  function pkPaveCore() {
    pkPaveRect(-17, 17, 35, 53);            // the forecourt, where the guests arrive
    pkPaveRect(-14, 14, 28, 38);            // the plaza under the gate
    pkPaveRect(-19.6, -16.4, 40, 45);       // out of the HQ's door onto the forecourt
    pkPaveRect(-7, 7, -4, 28);              // the midway
    pkPaveRect(-16, 20, -6.5, 5.5);         // Station Square, up to the coaster's yard fence, and the strip along the platform
    pkPaveRect(-20.1, -11.1, 9.7, 16.7);    // the snack stand's apron
    pkPaveRect(-23, -7, 17, 23);            // out to the carousel
    pkPaveRect(-16, 10, -84.5, -62.5);      // the Wild Hunt's forecourt, off the Promenade
  }
  function pkPaveBuild() {
    var P = PK_PAVE, M = pkMats(), i;
    P.meshes.forEach(function (m) { if (m.parent) m.parent.remove(m); m.geometry.dispose(); });
    P.meshes = []; P.tris = 0;
    // each ride's own pad, from its plot and its theme (a big coaster sets its own ground and has no pad)
    var shapes = P.shapes.slice(), tints = [];
    PK_PLOTS.forEach(function (p) { var th = PK_THEME[p.id], r = p.r * (p.pad || 1.25); if (th && r >= 2) shapes.push({ k: 'disc', x: p.x, z: p.z, r: r, tint: th.ground }); });
    shapes.forEach(function (s) { if (s.tint && tints.indexOf(s.tint) < 0) tints.push(s.tint); });
    var layer = function (mat, y, pick, grow) {
      var pos = [], uv = [], nor = [];
      shapes.forEach(function (s) {
        if (!pick(s)) return;
        pkPaveTris(s, grow).forEach(function (t) {
          // wound to face up
          var up = (t[3] - t[1]) * (t[4] - t[0]) - (t[2] - t[0]) * (t[5] - t[1]) > 0, q = up ? t : [t[0], t[1], t[4], t[5], t[2], t[3]];
          for (var k = 0; k < 6; k += 2) { pos.push(q[k], y, q[k + 1]); uv.push(q[k] / 2.4, -q[k + 1] / 2.4); nor.push(0, 1, 0); }
        });
      });
      if (!pos.length) return;
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      var m = new THREE.Mesh(geo, mat); m.receiveShadow = true; m.userData.noBake = true; m.userData.pkPave = true; scene.add(m);
      P.meshes.push(m); P.tris += pos.length / 9;
    };
    layer(pkPaveMat('kerb', M.kerb, 2), P.Y_KERB, function () { return true; }, P.KERB);
    for (i = 0; i < tints.length; i++) (function (c, n) { layer(pkPaveMat('pad' + c, pkPadMat(c), 1), P.Y_PAD + n * 0.0002, function (s) { return s.tint === c; }, 0); })(tints[i], i);
    layer(M.paversWarm, P.Y_PAVE, function (s) { return !s.tint; }, 0);
    P.dirty = false; P.built = true;
    if (typeof PK_PF !== 'undefined' && PK_PF.m) PK_PF.dirty = 0.2;   // the path rail follows the paving: have it look again
  }
  function pkBuildRoutes() {
    pkPaveCore();
    PK_ROUTES.forEach(function (r) { pkPaveSeg(r[0], r[1], r[2], r[3], r[4]); });
    pkPaveBuild();
  }
  // a part that lays paving after the theme is built (the Skyline's forecourt, a land that opens) only adds its shapes: the
  // surface is laid again once, at boot or on the next frame
  hook('boot', function () { if (PK_PAVE.built && PK_PAVE.dirty) pkPaveBuild(); });
  hook('frame', function () { if (PK_PAVE.built && PK_PAVE.dirty) pkPaveBuild(); });
  // lamps, benches, flower beds and an avenue of trees along every route
  function pkBuildRouteFurniture() {
    var rng = pkRng(9001), lamps = [];
    var nearLamp = function (x, z, d) { return lamps.some(function (l) { return Math.hypot(l[0] - x, l[1] - z) < d; }); };
    PK_ROUTES.forEach(function (r, i) {
      var dx = r[2] - r[0], dz = r[3] - r[1], len = Math.sqrt(dx * dx + dz * dz), ux = dx / len, uz = dz / len, nx = -uz, nz = ux, w = r[4];
      function at(t, off) { return [r[0] + ux * t + nx * off, r[1] + uz * t + nz * off]; }
      // lamps every 9 m, alternating sides
      for (var t = 4.5, k = 0; t < len - 3; t += 9, k++) {
        var side = k % 2 ? 1 : -1, p = at(t, side * (w / 2 + 0.9));
        if (pkNearRide(p[0], p[1], 1.5) || pkNearRoute(p[0], p[1], i, 1.2)) continue;
        pkLamp(p[0], p[1], 4.4); lamps.push(p);
      }
      // a bench every 24 m, facing the route
      for (var tb = 11, kb = 0; tb < len - 6; tb += 24, kb++) {
        var sb = kb % 2 ? 1 : -1, pb = at(tb, sb * (w / 2 + 1.3));
        if (pkNearRide(pb[0], pb[1], 2) || pkNearRoute(pb[0], pb[1], i, 2)) continue;
        if (nearLamp(pb[0], pb[1], 2.2)) { pb = at(tb + 3.5, sb * (w / 2 + 1.3)); if (nearLamp(pb[0], pb[1], 2.2) || pkNearRoute(pb[0], pb[1], i, 2)) continue; }   // a lamp stands there: step along
        pkBench(pb[0], pb[1], Math.atan2(-sb * nx, -sb * nz));
      }
      // a bin every 40 m too, so there is always one within a short walk of wherever a guest is standing
      for (var ti = 23, ki = 0; ti < len - 6; ti += 40, ki++) {
        var si = ki % 2 ? 1 : -1, pi = at(ti, si * (w / 2 + 1.3));
        if (pkNearRide(pi[0], pi[1], 2) || pkNearRoute(pi[0], pi[1], i, 2)) continue;
        if (nearLamp(pi[0], pi[1], 2.2)) { pi = at(ti + 4, si * (w / 2 + 1.3)); if (nearLamp(pi[0], pi[1], 2.2) || pkNearRoute(pi[0], pi[1], i, 2)) continue; }
        pkBin(pi[0], pi[1]); solid(pi[0] - 0.35, pi[0] + 0.35, pi[1] - 0.35, pi[1] + 0.35, 0, 1.0);
      }
      // a flower bed on each outer corner of the route and at every 30 m
      for (var tf = 16, kf = 0; tf < len - 8; tf += 30, kf++) {
        var sf = kf % 2 ? -1 : 1, pf = at(tf, sf * (w / 2 + 1.5)), horiz = Math.abs(dx) > Math.abs(dz);
        if (pkNearRide(pf[0], pf[1], 2) || pkNearRoute(pf[0], pf[1], i, 2.5)) continue;
        pkFlowerBed(pf[0], pf[1], horiz ? 2.6 : 1.3, horiz ? 1.3 : 2.6);
      }
      // no avenue trees: the park is kept clear of trees (tison 2026-11-11)
    });
  }

  // ── The hub ──────────────────────────────────────────────────────
  // where the midway crosses its two spurs: a paved round with a fountain, and an inlaid round at each spur.
  function pkBuildHub() {
    var M = pkMats(), H = PK_HUB, x = H.x, z = H.z;
    // inlaid rounds at the two spur junctions: stone, a ring of dark radial courses, a warm band
    // and a brass medallion, so the round reads as designed rather than poured
    [3, 20].forEach(function (jz) {
      pkPavedDisc(3.5, M.stoneDark, 0, 0.0185, jz, null, 1.6);
      pkPavedDisc(3.1, M.paversWarm, 0, 0.0192, jz, null, 1.2);
      for (var k = 0; k < 12; k++) {
        var a = k / 12 * Math.PI * 2;
        var sp = box(1.35, 0.012, 0.16, M.stoneDark, Math.cos(a) * 2.3, 0.0196, jz + Math.sin(a) * 2.3);
        sp.rotation.y = -a;
      }
      pkPavedDisc(1.62, M.paversWarm, 0, 0.0204, jz, null, 1.2);
      pkPavedDisc(1.5, M.stone, 0, 0.0210, jz, null, 1.2);
      pkPavedDisc(0.42, M.brass, 0, 0.0216, jz, null, 1.0);
    });
    // the fountain's own paving: three rings, stone round warm round stone, with radial courses
    // across the walkable band and a brass ring against the basin
    pkPavedDisc(5.7, M.stoneDark, x, 0.0205, z, null, 1.6);
    pkPavedDisc(5.3, M.paversWarm, x, 0.0212, z, null, 1.4);
    for (var kf = 0; kf < 16; kf++) {
      var af = kf / 16 * Math.PI * 2;
      var spf = box(1.6, 0.012, 0.2, M.stoneDark, x + Math.cos(af) * 4.4, 0.0215, z + Math.sin(af) * 4.4);
      spf.rotation.y = -af;
    }
    pkPavedDisc(3.6, M.stone, x, 0.0224, z, null, 1.4);
    var g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    // the basin: a stone lip, and water just under it
    pkLathe([[0, 0], [2.95, 0], [2.95, 0.66], [2.7, 0.66], [2.7, 0.5], [0, 0.5]], M.stone, 0, 0, 0, g, 40);
    pkLathe([[2.95, 0.64], [3.05, 0.64], [3.05, 0.72], [2.62, 0.72], [2.62, 0.66], [2.95, 0.66]], M.stoneDark, 0, 0, 0, g, 40);
    var pool = new THREE.Mesh(new THREE.CircleGeometry(2.68, 40), M.water); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.58; g.add(pool);
    // the column, the upper bowl and the finial
    pkLathe([[0, 0], [0.7, 0], [0.7, 0.2], [0.34, 0.36], [0.24, 1.05], [0.36, 1.16], [1.0, 1.32], [1.28, 1.52], [1.3, 1.68], [1.1, 1.64], [0.2, 1.46], [0, 1.46]], M.stone, 0, 0.5, 0, g, 32);
    var bowl = new THREE.Mesh(new THREE.CircleGeometry(1.08, 28), M.water); bowl.rotation.x = -Math.PI / 2; bowl.position.y = 0.5 + 1.6; g.add(bowl);
    pkLathe([[0, 0], [0.16, 0], [0.08, 0.28], [0.2, 0.55], [0.07, 0.85], [0, 0.95]], M.gold, 0, 2.14, 0, g, 12);
    // water: six arcs from the bowl's lip into the basin, and a jet that breathes
    var spray = std({ color: 0xe2f4ff, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.62 });
    for (var k = 0; k < 8; k++) {
      var a = k / 8 * Math.PI * 2 + 0.2, c = Math.cos(a), s = Math.sin(a);
      pkTube([[1.1 * c, 2.08, 1.1 * s], [1.55 * c, 2.3, 1.55 * s], [2.05 * c, 1.7, 2.05 * s], [2.4 * c, 0.62, 2.4 * s]], 0.032, spray, g, false, 14, 5);
    }
    var jetG = new THREE.Group(); jetG.position.set(0, 3.1, 0); jetG.userData.dynamic = true; g.add(jetG);
    var jet = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.07, 1.5, 8), spray); jet.position.y = 0.75; jetG.add(jet);
    var drop = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), spray); drop.position.y = 1.55; jetG.add(drop);
    PK_FOUNTAIN.jet = jetG;
    solid(x - 3.0, x + 3.0, z - 3.0, z + 3.0, 0, 2.0);
  }

  // ── The land arches ──────────────────────────────────────────────
  // where a street enters a land: two stone-footed pillars in the land's colours either side of the street, a beam across with
  // the land's name on both faces, lanterns on the pillars and a pennant row under the beam. Nothing stands in the walkway.
  function pkLandArch(x, z, along, L) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = along === 'x' ? Math.PI / 2 : 0; scene.add(g);
    var colA = std({ color: L.a, roughness: 0.6, metalness: 0.1 }), colB = std({ color: L.b, roughness: 0.55, metalness: 0.2 });
    var HW = 3.15, H = 4.6, i;
    [-1, 1].forEach(function (s) {
      pkBevelBox(0.95, 0.5, 0.95, M.stoneDark, s * HW, 0.25, 0, g, 0.05);
      pkBevelBox(0.7, H - 0.5, 0.7, colA, s * HW, 0.5 + (H - 0.5) / 2, 0, g, 0.05);
      pkBevelBox(0.84, 0.2, 0.84, colB, s * HW, H + 0.1, 0, g, 0.04);
      sphere(0.22, colB, s * HW, H + 0.42, 0, g);
      [-1, 1].forEach(function (f) { pkRoundCyl(0.13, 0.3, glowMat(0xfff2c0, 1.0), s * HW, 3.05, f * 0.42, g, 10); });
    });
    pkBevelBox(HW * 2 + 0.6, 0.62, 0.5, colA, 0, H - 0.25, 0, g, 0.05);
    pkBevelBox(HW * 2 + 0.8, 0.12, 0.6, colB, 0, H + 0.1, 0, g, 0.03);
    var w = Math.min(5.4, L.name.length * 0.36 + 0.8);
    pkSign3D([L.name], w, 0.5, 0, H - 0.25, 0.27, 0, { bg: '#151a20', fg: L.sign }, g);
    pkSign3D([L.name], w, 0.5, 0, H - 0.25, -0.27, Math.PI, { bg: '#151a20', fg: L.sign }, g);
    for (i = 0; i < 9; i++) {
      var flag = new THREE.Mesh(pkPennantGeo(), pkBuntMat(i % 2 ? L.a : L.b));
      flag.position.set(-HW + 0.6 + i * (HW * 2 - 1.2) / 8, H - 0.6, 0); flag.castShadow = true; g.add(flag);
    }
    // the pillars are solid; the walkway between them is not
    var c = Math.cos(g.rotation.y), sn = Math.sin(g.rotation.y);
    [-1, 1].forEach(function (s) { var px = x + s * HW * c, pz = z - s * HW * sn; solid(px - 0.5, px + 0.5, pz - 0.5, pz + 0.5, 0, H); });
    return g;
  }

  // ── The coaster's yard ───────────────────────────────────────────
  // the ground the circuit stands on is fenced, west, north and east, and closed against the station at the south, so the
  // guests walk the streets round it instead of cutting across the rails, and the Garden Walk looks over the fence at the drop.
  // Each run is the park's own fence, a world item the editor can move.
  var PK_YARD = { x0: -24, x1: 30.5, z0: -37, z1: -1.5 };
  function pkCoasterYard() {
    var Y = PK_YARD;
    // the ground under the coaster is a garden, not a car park: lawn, with flower beds and clipped shrubs wherever the track
    // and its legs leave room, in a loose grid, and a gravel service path along the inside of the fence
    var M = pkMats(), rng = pkRng(4411), gx, gz;
    for (gx = Y.x0 + 3; gx < Y.x1 - 2; gx += 4.6) {
      for (gz = Y.z0 + 3; gz < Y.z1 - 3; gz += 4.6) {
        var bx = gx + (rng() - 0.5) * 1.6, bz = gz + (rng() - 0.5) * 1.6;
        if (pkNearTrack(bx, bz, 2.8) || (bx > 9 && bz > -6)) continue;
        if (rng() < 0.55) pkFlowerBed(bx, bz, 1.8 + rng() * 0.8, 1.0 + rng() * 0.5);
        else pkHedge(bx, bz, 0.9, 0.9, 0.7 + rng() * 0.3);
      }
    }
    pkPaved(Y.x1 - Y.x0 - 1.2, 1.2, std({ color: 0xb8ab94, roughness: 0.98 }), (Y.x0 + Y.x1) / 2, 0.015, Y.z0 + 1.0, 1.2);
    pkPaved(1.2, Y.z1 - Y.z0 - 2.0, std({ color: 0xb8ab94, roughness: 0.98 }), Y.x0 + 1.0, 0.015, (Y.z0 + Y.z1) / 2, 1.2);
    pkPaved(1.2, Y.z1 - Y.z0 - 2.0, std({ color: 0xb8ab94, roughness: 0.98 }), Y.x1 - 1.0, 0.015, (Y.z0 + Y.z1) / 2, 1.2);
    pkParkFence(Y.x0, Y.z1, Y.x0, Y.z0);       // west, along the Dark Woods street
    pkParkFence(Y.x0, Y.z0, Y.x1, Y.z0);       // north, along the Garden Walk
    pkParkFence(Y.x1, Y.z0, Y.x1, Y.z1);       // east, along Coaster Country's street
    pkParkFence(Y.x0, Y.z1, -10.3, Y.z1);      // south-west, to the platform's west end
    pkParkFence(PK_OP.x1 + 0.2, Y.z1, Y.x1, Y.z1);   // south-east, to the coaster control room
  }

  // ── Signposts ────────────────────────────────────────────────────
  // a pole with finger boards. Each board is two signs back to back, so it reads from either side.
  // pointing: 0 east, PI west, PI/2 north, -PI/2 south
  function pkSignpost(x, z, boards) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    var h = 2.9 + boards.length * 0.55;
    pkRoundCyl(0.075, h, M.iron, 0, h / 2, 0, g, 10);
    pkBevelBox(0.3, 0.14, 0.3, M.stoneDark, 0, 0.07, 0, g, 0.03);
    sphere(0.1, M.gold, 0, h + 0.08, 0, g);
    boards.forEach(function (b, i) {
      var y = h - 0.4 - i * 0.55, w = Math.max(1.8, b[0].length * 0.2 + 0.5);
      var bg = new THREE.Group(); bg.position.set(0, y, 0); bg.rotation.y = -b[1]; g.add(bg);
      pkSign3D([b[0]], w, 0.44, w / 2 + 0.08, 0, 0.01, 0, { bg: b[2] || '#1b232c', fg: '#f5b53d' }, bg);
      pkSign3D([b[0]], w, 0.44, w / 2 + 0.08, 0, -0.01, Math.PI, { bg: b[2] || '#1b232c', fg: '#f5b53d' }, bg);
    });
    solid(x - 0.15, x + 0.15, z - 0.15, z + 0.15, 0, h);
    return g;
  }
  function pkBuildSignposts() {
    // at the hub: the four lands and the coaster, split over two posts so the boards do not
    // stack into a knot from the middle of the plaza
    pkSignpost(-4.7, 7.0, [['FAIRGROUND <', Math.PI], ['THRILLS >', 0], ['COASTER ^', Math.PI / 2]]);
    pkSignpost(-4.7, 4.2, [['DARK WOODS <', Math.PI], ['COASTER COUNTRY >', 0]]);
    // at each crossroads plaza, tucked into the corner of the junction
    pkSignpost(-28.4, 0.4, [['TEACUPS <', Math.PI], ['DARK WOODS ^', Math.PI / 2], ['STATION SQUARE >', 0]]);
    pkSignpost(37.4, 0.4, [["BARON'S DROP >", 0], ['COASTER COUNTRY ^', Math.PI / 2], ['< STATION SQUARE', Math.PI]]);
    // where the streets cross the Garden Walk
    pkSignpost(-28.4, -41.4, [['GARDEN WALK >', 0], ['DROP TOWER ^', Math.PI / 2], ['DANCE RIDE v', -Math.PI / 2]]);
    pkSignpost(37.4, -41.4, [['< GARDEN WALK', Math.PI], ['WILD HUNT ^', Math.PI / 2], ['LOG FLUME v', -Math.PI / 2]]);
    // and where the streets meet the North Promenade
    pkSignpost(-28.4, -57.4, [['DROP TOWER <', Math.PI], ['NORTH GARDENS >', 0], ['STATION SQUARE v', -Math.PI / 2]]);
    pkSignpost(37.4, -57.4, [['NORTH GARDENS <', Math.PI], ['STATION SQUARE v', -Math.PI / 2]]);
    // on the East Parade, where Dragon Gate's walk crosses it
    pkSignpost(124.2, -6.4, [['LITTLE MEADOW ^', Math.PI / 2], ['DODGEMS & WHEEL v', -Math.PI / 2], ['< DRAGON RIDE', Math.PI]]);
  }

  // ── Life: the fountain breathes and the water moves ──────────────
  function pkThemeTick(dt) {
    PK_THEME_T += dt;
    if (PKM && PKM.waterTex) PKM.waterTex.offset.x += dt * 0.012;
    if (PK_FOUNTAIN.jet) { PK_FOUNTAIN.jet.scale.y = 1 + 0.14 * Math.sin(PK_THEME_T * 3.1); PK_FOUNTAIN.jet.scale.x = PK_FOUNTAIN.jet.scale.z = 1 + 0.08 * Math.sin(PK_THEME_T * 4.3); }
  }
  var _pkThemePrevTick = GAME.tick;
  GAME.tick = function (dt) { _pkThemePrevTick(dt); pkThemeTick(dt); };
