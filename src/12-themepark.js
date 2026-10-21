//@ Park Co, part 12: the theme - the routes that join the far rides to the midway, the fountain at the hub, the lake in the coaster's heart, the planting and the signposts
  // ── What this part is for ────────────────────────────────────────
  // The park had a good gate and a good midway, then rides dropped on bare grass with nothing joining them. This part gives it a
  // spine and a skin: paved routes with lamps, benches and flower beds out to the haunted manor, the drop tower and the log flume;
  // a fountain where the midway crosses its two ride spurs; a lake in the middle of the coaster's loop; tree avenues; signposts.
  // It only adds. Where it needs to keep other things off its ground it answers pkThemeKeepClear (part 01's tree scatter asks).
  var PK_HUB = { x: 0, z: 10.5 };
  var PK_LAKE = { x: 1, z: -29, a: 13, b: 10.5 };
  // the routes, as [x0, z0, x1, z1, width]. Two long streets carry the teacup and dodgem spurs out to the park's flanks; a spine runs
  // north from each, with a side street to each far ride's queue, and the North Promenade joins the two spines - so the park is a loop.
  var PK_ROUTES = [
    [-22, 3, -46, 3, 4], [-31, 3, -31, -60, 3.6], [-31, -24, -45.5, -24, 3.8], [-31, -52, -45.5, -52, 3.8],       // west: teacups, haunted manor, drop tower
    [22, 3, 46, 3, 4], [35, 3, 35, -60, 3.6], [35, -24, 47.5, -24, 3.8],                                         // east: dodgems, log flume
    [-31, -60, 35, -60, 5],                                                                                       // the North Promenade
    [2, -60, 2, -66, 3.6], [9.5, -60, 9.5, -79, 3.4], [14, -60, 14, -66.6, 3]                                         // to the bandstand, the maze and the windmill
  ];
  var PK_KEEP = [];   // [x, z, r] circles other parts ask the planting to leave alone (part 13 adds its own)
  var PK_THEME_T = 0, PK_FOUNTAIN = { jet: null };

  function pkSegDist(px, pz, ax, az, bx, bz) {
    var dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz, t = l2 ? clamp(((px - ax) * dx + (pz - az) * dz) / l2, 0, 1) : 0;
    var cx = ax + dx * t, cz = az + dz * t;
    return Math.sqrt((px - cx) * (px - cx) + (pz - cz) * (pz - cz));
  }
  // true where something else (a tree) must not stand: the lake and its shore, the routes, the hub, the coaster's footprint
  function pkThemeKeepClear(x, z) {
    var L = PK_LAKE, ex = (x - L.x) / (L.a + 5), ez = (z - L.z) / (L.b + 5);
    if (ex * ex + ez * ez < 1) return true;
    for (var i = 0; i < PK_ROUTES.length; i++) {
      var r = PK_ROUTES[i], hw = r[4] / 2 + 2.5;
      if (x > Math.min(r[0], r[2]) - hw && x < Math.max(r[0], r[2]) + hw && z > Math.min(r[1], r[3]) - hw && z < Math.max(r[1], r[3]) + hw) return true;
    }
    for (var q = 0; q < PK_KEEP.length; q++) if (dist2(x, z, PK_KEEP[q][0], PK_KEEP[q][1]) < PK_KEEP[q][2] * PK_KEEP[q][2]) return true;
    var P = PK_TRACK_PTS;
    for (var k = 0; k < P.length; k++) { var A = P[k], B = P[(k + 1) % P.length]; if (pkSegDist(x, z, A[0], A[2], B[0], B[2]) < 4.5) return true; }
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
    pkBuildLake();
    pkBuildRouteFurniture();
    pkBuildSignposts();
    if (typeof pkGardensBuild === 'function') pkGardensBuild();   // part 13: the plazas, the stalls and the North Promenade's attractions
  }

  // ── The routes ───────────────────────────────────────────────────
  // warm pavers on a stone edge. Every segment sits a hair above the last, so where two meet there is no flicker.
  function pkBuildRoutes() {
    var M = pkMats();
    PK_ROUTES.forEach(function (r, i) {
      var dx = r[2] - r[0], dz = r[3] - r[1], len = Math.sqrt(dx * dx + dz * dz), w = r[4], ry = Math.atan2(dx, dz);
      var cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, y = 0.022 + i * 0.002;
      pkPaved(w + 0.7, len + w + 0.7, M.kerb, cx, y - 0.001, cz, 2.4, null, ry);
      pkPaved(w, len + w, M.paversWarm, cx, y, cz, 2.4, null, ry);
    });
  }
  // lamps, benches, flower beds and an avenue of trees along every route
  function pkBuildRouteFurniture() {
    var rng = pkRng(9001);
    PK_ROUTES.forEach(function (r, i) {
      var dx = r[2] - r[0], dz = r[3] - r[1], len = Math.sqrt(dx * dx + dz * dz), ux = dx / len, uz = dz / len, nx = -uz, nz = ux, w = r[4];
      function at(t, off) { return [r[0] + ux * t + nx * off, r[1] + uz * t + nz * off]; }
      // lamps every 9 m, alternating sides
      for (var t = 4.5, k = 0; t < len - 3; t += 9, k++) {
        var side = k % 2 ? 1 : -1, p = at(t, side * (w / 2 + 0.9));
        if (pkNearRide(p[0], p[1], 1.5) || pkNearRoute(p[0], p[1], i, 1.2)) continue;
        pkLamp(p[0], p[1], 4.4);
      }
      // a bench every 24 m, facing the route
      for (var tb = 11, kb = 0; tb < len - 6; tb += 24, kb++) {
        var sb = kb % 2 ? 1 : -1, pb = at(tb, sb * (w / 2 + 1.3));
        if (pkNearRide(pb[0], pb[1], 2) || pkNearRoute(pb[0], pb[1], i, 2)) continue;
        pkBench(pb[0], pb[1], Math.atan2(-sb * nx, -sb * nz));
      }
      // a flower bed on each outer corner of the route and at every 30 m
      for (var tf = 16, kf = 0; tf < len - 8; tf += 30, kf++) {
        var sf = kf % 2 ? -1 : 1, pf = at(tf, sf * (w / 2 + 1.5)), horiz = Math.abs(dx) > Math.abs(dz);
        if (pkNearRide(pf[0], pf[1], 2) || pkNearRoute(pf[0], pf[1], i, 2.5)) continue;
        pkFlowerBed(pf[0], pf[1], horiz ? 2.6 : 1.3, horiz ? 1.3 : 2.6);
      }
      // the avenue: a tree each side every 7.5 m, a little off true so it does not look ruled
      for (var ta = 6, ka = 0; ta < len - 4; ta += 7.5, ka++) {
        [-1, 1].forEach(function (sd) {
          var pa = at(ta + (rng() - 0.5) * 2, sd * (w / 2 + 3.3 + rng() * 1.2));
          if (pkNearRide(pa[0], pa[1], 3) || pkNearRoute(pa[0], pa[1], i, 3.2)) return;
          if (pkInsideLake(pa[0], pa[1], 4)) return;
          var seed = Math.abs(Math.round(pa[0] * 13 + pa[1] * 7)), sc = 0.9 + rng() * 0.5;
          if (seed % 6 === 0) pkConifer(pa[0], pa[1], sc, null, seed); else pkTree(pa[0], pa[1], sc, null, seed);
        });
      }
    });
  }
  function pkInsideLake(x, z, margin) {
    var L = PK_LAKE, ex = (x - L.x) / (L.a + margin), ez = (z - L.z) / (L.b + margin);
    return ex * ex + ez * ez < 1;
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

  // ── The lake ─────────────────────────────────────────────────────
  // in the heart of the coaster's loop: seen from the platform, from the train and over the apron fence.
  function pkBuildLake() {
    var L = PK_LAKE, M = pkMats(), C = pkCrownGeos(), rng = pkRng(4242);
    function ellipse(sx, sz, mat, y) {
      var geo = new THREE.CircleGeometry(1, 64);
      if (mat === M.water) { var uv = geo.attributes.uv; for (var i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * sx / 2.2, uv.getY(i) * sz / 2.2); }
      var m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.scale.set(sx, sz, 1); m.position.set(L.x, y, L.z); m.receiveShadow = true; scene.add(m); return m;
    }
    ellipse(L.a + 1.6, L.b + 1.6, M.soil, 0.03);
    ellipse(L.a + 0.5, L.b + 0.5, M.stoneDark, 0.045);
    ellipse(L.a, L.b, M.water, 0.07);
    // rocks round the rim
    var n = 44;
    for (var i = 0; i < n; i++) {
      var t = i / n * Math.PI * 2 + rng() * 0.12, rs = 0.45 + rng() * 0.75;
      var rock = new THREE.Mesh(C[i % 4], M.stoneDark); rock.scale.set(rs * (1.2 + rng() * 0.6), rs * 0.7, rs);
      rock.position.set(L.x + (L.a + 0.9) * Math.cos(t), 0.18, L.z + (L.b + 0.9) * Math.sin(t)); rock.rotation.y = rng() * 6; rock.castShadow = true; rock.receiveShadow = true; scene.add(rock);
    }
    // reeds in clumps at the edge
    var reed = std({ color: 0x5f7f3a, roughness: 0.95 }), reedGeo = new THREE.ConeGeometry(0.035, 1.2, 4);
    for (var c = 0; c < 22; c++) {
      var rt = rng() * Math.PI * 2, rx = L.x + (L.a - 0.4) * Math.cos(rt), rz = L.z + (L.b - 0.4) * Math.sin(rt);
      for (var q = 0; q < 5; q++) {
        var rm = new THREE.Mesh(reedGeo, reed), hh = 0.7 + rng() * 0.9; rm.scale.set(1, hh, 1);
        rm.position.set(rx + (rng() - 0.5) * 0.7, 0.07 + hh * 0.6, rz + (rng() - 0.5) * 0.7); rm.rotation.z = (rng() - 0.5) * 0.25; scene.add(rm);
      }
    }
    // lily pads on the water
    var pad = std({ color: 0x3f7a3a, roughness: 0.85, side: THREE.DoubleSide }), padGeo = new THREE.CircleGeometry(0.34, 10), bloom = std({ color: 0xf2b6d2, roughness: 0.6 });
    for (var lp = 0; lp < 20; lp++) {
      var la = rng() * Math.PI * 2, lr = Math.sqrt(rng()) * 0.82, lx = L.x + L.a * lr * Math.cos(la), lz = L.z + L.b * lr * Math.sin(la);
      var pm = new THREE.Mesh(padGeo, pad); pm.rotation.x = -Math.PI / 2; pm.position.set(lx, 0.085, lz); pm.scale.setScalar(0.7 + rng() * 0.8); scene.add(pm);
      if (lp % 4 === 0) { var bm = new THREE.Mesh(C[lp % 4], bloom); bm.scale.set(0.16, 0.1, 0.16); bm.position.set(lx, 0.14, lz); scene.add(bm); }
    }
    // an island with a willow-ish tree and a few stones
    var ix = L.x + 3.5, iz = L.z - 1.5;
    var mound = new THREE.Mesh(C[1], M.hedge); mound.scale.set(6.2, 1.4, 5.4); mound.position.set(ix, 0.2, iz); mound.receiveShadow = true; scene.add(mound);
    pkTree(ix, iz, 1.15, null, 17);
    for (var s = 0; s < 5; s++) { var sr = new THREE.Mesh(C[s % 4], M.stoneDark), ss = 0.35 + rng() * 0.3; sr.scale.set(ss * 1.4, ss * 0.8, ss); sr.position.set(ix + 2.6 * Math.cos(s * 1.3), 0.3, iz + 2.2 * Math.sin(s * 1.3)); scene.add(sr); }
    // the shore planting: a loose ring of trees outside the rocks, clear of the rails
    var m = 30;
    for (var j = 0; j < m; j++) {
      var ja = j / m * Math.PI * 2 + rng() * 0.15, d = 4.5 + rng() * 3.5;
      var tx = L.x + (L.a + d) * Math.cos(ja), tz = L.z + (L.b + d) * Math.sin(ja);
      var P = PK_TRACK_PTS, bad = tz > -14.5;
      for (var k = 0; k < P.length && !bad; k++) { var A = P[k], B = P[(k + 1) % P.length]; if (pkSegDist(tx, tz, A[0], A[2], B[0], B[2]) < 4.5) bad = true; }
      if (bad) continue;
      var seed = Math.abs(Math.round(tx * 13 + tz * 7)), sc = 0.9 + rng() * 0.7;
      if (seed % 4 === 0) pkConifer(tx, tz, sc, null, seed); else pkTree(tx, tz, sc, null, seed);
    }
    solid(L.x - L.a, L.x + L.a, L.z - L.b, L.z + L.b, 0, 0.8);
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
    // at the hub: the way to every corner of the park, split over two posts so the boards do not
    // stack into a knot from the middle of the plaza
    pkSignpost(-4.7, 7.0, [['CAROUSEL <', Math.PI], ['FERRIS WHEEL >', 0], ['COASTER ^', Math.PI / 2]]);
    pkSignpost(-4.7, 4.2, [['TEACUPS & THE WEST <', Math.PI], ['DODGEMS & THE EAST >', 0]]);
    // at each crossroads plaza, tucked into the corner of the junction
    pkSignpost(-28.4, 0.4, [['TEACUPS <', Math.PI], ['HAUNTED MANOR ^', Math.PI / 2], ['MIDWAY >', 0]]);
    pkSignpost(37.4, 0.4, [['DODGEMS >', 0], ['LOG FLUME ^', Math.PI / 2], ['<- MIDWAY', Math.PI]]);
    // and where the spines meet the North Promenade
    pkSignpost(-28.4, -57.4, [['DROP TOWER <', Math.PI], ['NORTH GARDENS >', 0], ['MIDWAY & RIDES v', -Math.PI / 2]]);
    pkSignpost(37.4, -57.4, [['NORTH GARDENS <', Math.PI], ['LOG FLUME v', -Math.PI / 2]]);
  }

  // ── Life: the fountain breathes and the water moves ──────────────
  function pkThemeTick(dt) {
    PK_THEME_T += dt;
    if (PKM && PKM.waterTex) PKM.waterTex.offset.x += dt * 0.012;
    if (PK_FOUNTAIN.jet) { PK_FOUNTAIN.jet.scale.y = 1 + 0.14 * Math.sin(PK_THEME_T * 3.1); PK_FOUNTAIN.jet.scale.x = PK_FOUNTAIN.jet.scale.z = 1 + 0.08 * Math.sin(PK_THEME_T * 4.3); }
  }
  var _pkThemePrevTick = GAME.tick;
  GAME.tick = function (dt) { _pkThemePrevTick(dt); pkThemeTick(dt); };
