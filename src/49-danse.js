//@ Park Co, part 49: Danse Macabre - the ruined Abbey of Huyverwoud in the Dark Woods and its Dynamic Motion Stage
  // ── Danse Macabre ────────────────────────────────────────────────
  // Efteling's Danse Macabre at full scale, on the old manor's plot. A ruined Gothic abbey fronts the Dark Woods street: a
  // broken gable over a deep pointed portal and a rose window, a bell tower with a slate spire, and behind them the ten-sided
  // chapel under its steep roof, one bay of it fallen in to the rafters. The queue runs along the abbey's front between the
  // graveyard (the orchestra's graves, Joseph Charlatan's mausoleum and his statue) and the ruined cloister with its herb
  // garden, from two pillars carrying a monk and the black kitten. Through the doors is the entrance hall (the violin glowing
  // under its cloth, the window into the control cabin); through the chapel door, the Dynamic Motion Stage: six oak choir
  // stalls round the instrument crate and the kitten, on a floor that turns, tilts, rises and drops. Round the walls stand
  // the organ (its middle turns to show Joseph conducting), three rose windows that light on the ghost orchestra and three
  // scrims that clear on the monk choir; the crypt shows under the floor when it rises. The riders leave by the chapel's east
  // door, out past the graveyard. Everything keeps east of the new viaduct's piers (part 46, the line at x -67) and south of
  // the Arena's path (z -40, part 33).
  var PK_DM = { CX: -54.6, CZ: -28, R: 8.4, T: 0.9, H: 12.5, RISE: 3.0,
    FX: -46.2, BX: -52.2, NZ: -26.3, SZ: -15.1, WH: 10.5, DZ: -20.7, g: null };
  PK_THEME.danse.noBunting = true; PK_THEME.danse.noDecor = true;
  PK_THEME.danse.portal = function (p, side, g) { pkDmPortal(g); };
  PK_KEEP.push([-54.6, -28, 11.5], [-49, -20, 8], [-40, -34, 6], [-41, -16, 6.5]);   // no forest through the abbey, its graveyard or its cloister

  // ── Materials ────────────────────────────────────────────────────
  var PK_DM_M = null;
  function pkDmShade(hex, k) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgb(' + Math.min(255, Math.round((n >> 16 & 255) * k)) + ',' + Math.min(255, Math.round((n >> 8 & 255) * k)) + ',' + Math.min(255, Math.round((n & 255) * k)) + ')';
  }
  // dressed stone in courses: blocks of every length and a little apart in shade, the joints, grime run down from the courses
  // above and moss in the damp places. One tile is five metres of wall.
  function pkDmAshlarTex(base, joint, seed) {
    return tex(512, 512, function (c, w, h) {
      var rnd = pkRng(seed), ch = 32;
      c.fillStyle = joint; c.fillRect(0, 0, w, h);
      for (var y = 0; y < h; y += ch) {
        var x = -Math.floor(rnd() * 90);
        while (x < w) {
          var bw = 56 + Math.floor(rnd() * 80);
          c.fillStyle = pkDmShade(base, 0.84 + rnd() * 0.28); c.fillRect(x + 2, y + 2, bw - 3, ch - 3);
          c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(x + 2, y + 2, bw - 3, 3);
          c.fillStyle = 'rgba(0,0,0,0.14)'; c.fillRect(x + 2, y + ch - 7, bw - 3, 5);
          x += bw;
        }
      }
      for (var i = 0; i < 3000; i++) { c.fillStyle = 'rgba(0,0,0,' + (rnd() * 0.14).toFixed(3) + ')'; c.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 3, 1 + rnd() * 2); }
      for (var s = 0; s < 16; s++) { var sx = rnd() * w, sy = rnd() * h * 0.6, gr = c.createLinearGradient(0, sy, 0, h); gr.addColorStop(0, 'rgba(24,28,20,0.24)'); gr.addColorStop(1, 'rgba(24,28,20,0)'); c.fillStyle = gr; c.fillRect(sx, sy, 4 + rnd() * 16, h - sy); }
      for (var m = 0; m < 10; m++) { var mx = rnd() * w, my = rnd() * h, mr = 20 + rnd() * 50, rg = c.createRadialGradient(mx, my, 0, mx, my, mr); rg.addColorStop(0, 'rgba(52,70,40,0.3)'); rg.addColorStop(1, 'rgba(52,70,40,0)'); c.fillStyle = rg; c.fillRect(mx - mr, my - mr, mr * 2, mr * 2); }
    }, 1, 1);
  }
  // the chapel floor: big worn flags, cracked here and there
  function pkDmFlagTex() {
    return tex(512, 512, function (c, w, h) {
      var rnd = pkRng(77);
      c.fillStyle = '#26231f'; c.fillRect(0, 0, w, h);
      for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) {
        c.fillStyle = pkDmShade('#5d5850', 0.8 + rnd() * 0.3); c.fillRect(x * 128 + 3, y * 128 + 3, 122, 122);
        c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1.5;
        if (rnd() < 0.4) { c.beginPath(); var px = x * 128 + rnd() * 128, py = y * 128 + 4; c.moveTo(px, py); for (var k = 0; k < 5; k++) { px += (rnd() - 0.5) * 40; py += 24; c.lineTo(px, py); } c.stroke(); }
      }
      for (var i = 0; i < 2500; i++) { c.fillStyle = 'rgba(0,0,0,' + (rnd() * 0.15).toFixed(3) + ')'; c.fillRect(rnd() * w, rnd() * h, 2, 2); }
    }, 1, 1);
  }
  // the stage floor: oak boards laid round the middle in rings, gilt bands, a ten-pointed star and the abbey's motto
  function pkDmDeckTex() {
    return tex(1024, 1024, function (c, w, h) {
      var cx = w / 2, cy = h / 2, R = w / 2, rnd = pkRng(13);
      c.fillStyle = '#1e140d'; c.fillRect(0, 0, w, h);
      var bands = [[1.0, 0.86, 60], [0.86, 0.62, 48], [0.62, 0.3, 30]];
      bands.forEach(function (b) {
        for (var k = 0; k < b[2]; k++) {
          var a0 = k / b[2] * Math.PI * 2, a1 = (k + 1) / b[2] * Math.PI * 2;
          c.beginPath(); c.arc(cx, cy, R * b[0], a0, a1); c.arc(cx, cy, R * b[1], a1, a0, true); c.closePath();
          c.fillStyle = pkDmShade('#5a3a22', 0.75 + rnd() * 0.35); c.fill(); c.strokeStyle = '#140c07'; c.lineWidth = 2; c.stroke();
        }
      });
      c.fillStyle = '#2a1a10'; c.beginPath(); c.arc(cx, cy, R * 0.3, 0, Math.PI * 2); c.fill();
      [[0.985, 8], [0.86, 5], [0.75, 3], [0.62, 6], [0.3, 5]].forEach(function (r) { c.strokeStyle = '#c9a050'; c.lineWidth = r[1]; c.beginPath(); c.arc(cx, cy, R * r[0], 0, Math.PI * 2); c.stroke(); });
      // the ten-pointed star
      c.beginPath();
      for (var s = 0; s <= 20; s++) { var sa = s / 20 * Math.PI * 2 - Math.PI / 2, sr = (s % 2 ? 0.12 : 0.28) * R; c[s ? 'lineTo' : 'moveTo'](cx + Math.cos(sa) * sr, cy + Math.sin(sa) * sr); }
      c.closePath(); c.fillStyle = '#8a6a2a'; c.fill(); c.strokeStyle = '#e0bf6a'; c.lineWidth = 4; c.stroke();
      // the motto round the middle ring
      var txt = 'DANSE MACABRE  *  ABDIJ VAN HUYVERWOUD  *  VRIJDAG DE DERTIENDE  *  MDCCCLXXVI  *  ';
      c.fillStyle = '#d8b45a'; c.font = 'bold 34px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (var i = 0; i < txt.length; i++) { var ta = i / txt.length * Math.PI * 2; c.save(); c.translate(cx + Math.cos(ta) * R * 0.685, cy + Math.sin(ta) * R * 0.685); c.rotate(ta + Math.PI / 2); c.fillText(txt[i], 0, 0); c.restore(); }
    }, 1, 1);
  }
  // leaded glass: the tall windows in quarries and medallions, the roses in petals round a boss
  function pkDmLancetTex() {
    return tex(256, 512, function (c, w, h) {
      var rnd = pkRng(5), cols = ['#5a2a8a', '#8a1f2a', '#d89a2a', '#2a4a9a', '#3a7a4a', '#b05a20', '#6a3aa0'];
      c.fillStyle = '#100c10'; c.fillRect(0, 0, w, h);
      for (var y = 0; y < h; y += 32) for (var x = 0; x < w; x += 32) { c.fillStyle = cols[Math.floor(rnd() * cols.length)]; c.fillRect(x + 3, y + 3, 26, 26); }
      [[w / 2, h * 0.3], [w / 2, h * 0.68]].forEach(function (p, k) { c.fillStyle = k ? '#e0b040' : '#c03040'; c.beginPath(); c.arc(p[0], p[1], 70, 0, Math.PI * 2); c.fill(); c.lineWidth = 7; c.strokeStyle = '#100c10'; c.stroke(); c.fillStyle = k ? '#5a2a8a' : '#2a4a9a'; c.beginPath(); c.arc(p[0], p[1], 34, 0, Math.PI * 2); c.fill(); c.stroke(); });
    }, 1, 1);
  }
  function pkDmRoseTex() {
    return tex(512, 512, function (c, w, h) {
      var cx = w / 2, cy = h / 2, cols = ['#7a2a9a', '#b02838', '#e0a030', '#2a52a8'];
      c.fillStyle = '#100c10'; c.fillRect(0, 0, w, h);
      for (var r = 5; r >= 1; r--) for (var k = 0; k < 12; k++) {
        var a0 = (k + (r % 2) * 0.5) / 12 * Math.PI * 2, a1 = a0 + Math.PI * 2 / 12;
        c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, r * 50, a0, a1); c.closePath(); c.fillStyle = cols[(k + r) % 4]; c.fill(); c.lineWidth = 5; c.strokeStyle = '#100c10'; c.stroke();
      }
      c.fillStyle = '#f0d070'; c.beginPath(); c.arc(cx, cy, 30, 0, Math.PI * 2); c.fill();
    }, 1, 1);
  }
  // a soft white puff for the mist that lies in the graveyard
  function pkDmMistTex() {
    return tex(128, 128, function (c, w, h) {
      var g = c.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(225,232,238,0.85)'); g.addColorStop(0.5, 'rgba(225,232,238,0.35)'); g.addColorStop(1, 'rgba(225,232,238,0)');
      c.clearRect(0, 0, w, h); c.fillStyle = g; c.fillRect(0, 0, w, h);
    }, 1, 1);
  }
  function pkDmM() {
    if (PK_DM_M) return PK_DM_M;
    var M = pkMats(), X = PK_DM_M = {};
    var tiled = function (t, m, col) { var mat = std({ map: t, color: col || 0xffffff, roughness: 0.95 }); mat.userData.tile = [m, m]; return mat; };
    var world = function (t, m, col, side) { var t2 = t.clone(); t2.needsUpdate = true; t2.repeat.set(1 / m, 1 / m); return std({ map: t2, color: col || 0xffffff, roughness: 0.95, side: side || THREE.FrontSide }); };
    var out = pkDmAshlarTex('#8d867a', '#4a463f', 1876), inn = pkDmAshlarTex('#5a554d', '#2c2925', 1313), flags = pkDmFlagTex();
    X.stone = tiled(out, 5); X.stoneW = world(out, 5);
    X.stoneIn = tiled(inn, 4); X.vault = world(inn, 4, 0xbcb4a8, THREE.DoubleSide);
    X.flags = tiled(flags, 3.2); X.flagsW = world(flags, 3.2);
    var fd = flags.clone(); fd.needsUpdate = true; fd.repeat.set(4.6, 4.6); X.flagDisc = std({ map: fd, roughness: 0.95 });
    X.carve = std({ map: TEX.plaster, color: 0xaaa293, roughness: 0.9 });
    X.carveDark = std({ map: TEX.plaster, color: 0x6a645a, roughness: 0.92 });
    X.slate = std({ map: M.slate.map, color: 0x7a7f8c, roughness: 0.8, side: THREE.DoubleSide });
    X.lead = std({ color: 0x474c52, roughness: 0.55, metalness: 0.5 });
    X.oak = std({ map: TEX.wood, color: 0x6a4428, roughness: 0.7 });
    X.oakDark = std({ map: TEX.wood, color: 0x3a2416, roughness: 0.72 });
    X.iron = M.iron; X.gold = M.gold; X.brass = M.brass; X.bark = M.bark; X.soil = M.soil;
    X.tin = std({ color: 0xc9ccd2, roughness: 0.25, metalness: 0.9 });
    X.velvet = std({ color: 0x4a0f1c, roughness: 0.9, side: THREE.DoubleSide });
    X.black = std({ color: 0x0c0c0f, roughness: 0.5 });
    X.bronze = std({ color: 0x4f6e5e, roughness: 0.45, metalness: 0.6 });
    X.bone = std({ color: 0xd8d0b8, roughness: 0.7 });
    X.grass = std({ map: TEX.grass, color: 0x6a7a52, roughness: 1 });
    X.gravel = std({ map: TEX.asphalt, color: 0x9a9284, roughness: 1 });
    X.ivy = [0x2f4a26, 0x3a5a2c, 0x263e20].map(function (c) { return std({ map: M.leafTex, color: c, roughness: 0.95 }); });
    X.herbs = [0x4f7a3a, 0x6a8a4a, 0x8a7ab0, 0x5a6a3a].map(function (c) { return std({ map: M.leafTex, color: c, roughness: 0.95 }); });
    var lt = pkDmLancetTex(), rt = pkDmRoseTex();
    X.glass = std({ map: lt, emissive: 0xffffff, emissiveMap: lt, emissiveIntensity: 0.55, roughness: 0.3 });
    X.roseOut = std({ map: rt, emissive: 0xffffff, emissiveMap: rt, emissiveIntensity: 0.6, roughness: 0.3 });
    X.roseIn = std({ map: rt, emissive: 0xffffff, emissiveMap: rt, emissiveIntensity: 0.12, roughness: 0.3 });   // the show lights these
    X.deck = std({ map: pkDmDeckTex(), roughness: 0.55, metalness: 0.05 });
    // what the show turns up and down: kept below the park's lamp switches (part 01), so they answer to the show alone
    X.flame = std({ color: 0x331100, emissive: 0xff7a1a, emissiveIntensity: 0.4, roughness: 1 });
    X.candle = std({ color: 0x332200, emissive: 0xffc870, emissiveIntensity: 0.4, roughness: 1 });
    X.eye = std({ color: 0x223300, emissive: 0xd8ff4a, emissiveIntensity: 0.4, roughness: 0.4 });
    X.ghostJ = std({ color: 0x6a7a72, emissive: 0x8affd8, emissiveIntensity: 0, roughness: 0.6 });
    X.ghostO = std({ color: 0x3a4440, emissive: 0x8affd8, emissiveIntensity: 0, roughness: 0.6, transparent: true, opacity: 0, depthWrite: false });   // not there until the show calls them up
    X.undead = std({ color: 0x8a8a70, emissive: 0x9aff9a, emissiveIntensity: 0, roughness: 0.7 });
    X.monk = std({ color: 0x2a2420, emissive: 0x6a5030, emissiveIntensity: 0, roughness: 0.9 });
    X.organGlow = std({ color: 0x221100, emissive: 0xffa040, emissiveIntensity: 0.1, roughness: 1 });
    X.violin = std({ color: 0x5a2a10, emissive: 0xffb050, emissiveIntensity: 0.45, roughness: 0.5 });
    X.cloth = std({ color: 0xe8e0cc, roughness: 0.9, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
    X.scrim = std({ color: 0x141118, roughness: 1, transparent: true, opacity: 0.96, side: THREE.DoubleSide, depthWrite: false });
    X.mist = new THREE.MeshBasicMaterial({ map: pkDmMistTex(), transparent: true, opacity: 0.3, depthWrite: false, color: 0xd0d8de });
    return X;
  }

  // ── Shapes ───────────────────────────────────────────────────────
  // a pointed (lancet) arch w wide, springing at hs and meeting at ha: the outline from the left foot round to the right foot
  function pkDmArch(w, hs, ha, n) {
    n = n || 8; var d = ha - hs, cx = (d * d - w * w / 4) / w, r = cx + w / 2, top = Math.atan2(d, cx), pts = [[-w / 2, 0], [w / 2, 0], [w / 2, hs]];
    for (var i = 1; i <= n; i++) { var t = top * i / n; pts.push([-cx + Math.cos(t) * r, hs + Math.sin(t) * r]); }
    for (var j = n - 1; j >= 0; j--) { var t2 = top * j / n; pts.push([cx - Math.cos(t2) * r, hs + Math.sin(t2) * r]); }
    return pts;
  }
  // only the curve of that arch, from the right springing over the top to the left, at y0 lifted: for mouldings
  function pkDmArchCurve(w, hs, ha, y0) { return pkDmArch(w, hs, ha, 10).slice(2).map(function (p) { return [p[0], p[1] + (y0 || 0)]; }); }
  function pkDmShape(pts) { var s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath(); return s; }
  // the UVs of a flat shape stretched over its own bounds, so a texture fills it once whatever its size
  function pkDmFitUV(geo) {
    geo.computeBoundingBox(); var b = geo.boundingBox, uv = geo.attributes.uv, p = geo.attributes.position, w = (b.max.x - b.min.x) || 1, h = (b.max.y - b.min.y) || 1;
    for (var i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) - b.min.x) / w, (p.getY(i) - b.min.y) / h);
    uv.needsUpdate = true; return geo;
  }
  // a flat outline with a hole through it, pulled out depth: a window's frame, a niche's surround
  function pkDmFrame(outer, inner, depth, mat, parent, x, y, z) {
    var s = pkDmShape(outer), hole = new THREE.Path(); hole.moveTo(inner[0][0], inner[0][1]); for (var i = 1; i < inner.length; i++) hole.lineTo(inner[i][0], inner[i][1]); hole.closePath(); s.holes.push(hole);
    var geo = new THREE.ExtrudeGeometry(s, { depth: depth, bevelEnabled: false }); geo.translate(0, 0, -depth / 2);
    var m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  }
  function pkDmFlat(pts, mat, parent, x, y, z) {
    var m = new THREE.Mesh(pkDmFitUV(new THREE.ShapeGeometry(pkDmShape(pts))), mat); m.position.set(x || 0, y || 0, z || 0); parent.add(m); return m;
  }
  // a tall pointed window: the leaded glass, a moulded frame, a mullion and a small round light in the head. Faces local +z.
  function pkDmLancet(parent, x, y, z, ry, w, h, glass, frame) {
    var X = pkDmM(), g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parent.add(g);
    var hs = h - w * 0.85;
    pkDmFlat(pkDmArch(w, hs, h), glass, g, 0, 0, 0);
    pkDmFrame(pkDmArch(w + 0.36, hs, h + 0.2).map(function (p) { return [p[0], p[1] - 0.12]; }), pkDmArch(w, hs, h), 0.22, frame || X.carve, g, 0, 0, 0.06);
    box(0.08, hs, 0.1, frame || X.carve, 0, hs / 2, 0.03, g);
    pkRing(w * 0.2, 0.035, frame || X.carve, 0, hs + w * 0.34, 0.03, g, 16, false);
    box(w + 0.5, 0.14, 0.34, X.carveDark, 0, -0.16, 0.1, g);
    return g;
  }
  // a rose window: the glass, a deep moulded ring, spokes and a ring of foils round a boss. Faces local +z.
  function pkDmRose(parent, x, y, z, ry, r, glass, frame) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parent.add(g);
    var disc = new THREE.Mesh(new THREE.CircleGeometry(r, 48), glass); g.add(disc);
    pkRing(r + 0.12, 0.15, frame, 0, 0, 0.05, g, 48, false); pkRing(r + 0.42, 0.11, frame, 0, 0, 0.02, g, 48, false);
    pkRing(r * 0.42, 0.06, frame, 0, 0, 0.04, g, 32, false);
    for (var k = 0; k < 12; k++) {
      var a = k / 12 * Math.PI * 2, sp = box(0.07, r * 0.58, 0.08, frame, Math.cos(a) * r * 0.71, Math.sin(a) * r * 0.71, 0.04, g); sp.rotation.z = a - Math.PI / 2;
      pkRing(r * 0.16, 0.03, frame, Math.cos(a + Math.PI / 12) * r * 0.74, Math.sin(a + Math.PI / 12) * r * 0.74, 0.04, g, 12, false);
    }
    sphere(r * 0.1, frame, 0, 0, 0.06, g);
    return g;
  }
  // a dead tree: a leaning trunk and crooked branches, forked again at their ends
  function pkDmDeadTree(parent, x, z, h, seed) {
    var X = pkDmM(), rnd = pkRng(seed), lean = (rnd() - 0.5) * 0.3, tx = x + lean * h, tz = z + (rnd() - 0.5) * 0.4;
    cyl(0.12, h, X.bark, (x + tx) / 2, h / 2, (z + tz) / 2, parent, 8, 0.26).rotation.z = -lean;
    for (var b = 0; b < 5; b++) {
      var by = h * (0.45 + b * 0.11), ba = rnd() * Math.PI * 2, bl = h * (0.32 - b * 0.03), bx0 = x + (tx - x) * by / h, bz0 = z + (tz - z) * by / h;
      var ex = bx0 + Math.cos(ba) * bl, ey = by + bl * (0.35 + rnd() * 0.4), ez = bz0 + Math.sin(ba) * bl;
      pkRod(bx0, by, bz0, ex, ey, ez, 0.07 - b * 0.008, X.bark, parent, 6);
      for (var t = 0; t < 2; t++) { var ta = ba + (t ? 0.7 : -0.7), tl = bl * 0.45; pkRod(ex, ey, ez, ex + Math.cos(ta) * tl, ey + tl * 0.5, ez + Math.sin(ta) * tl, 0.03, X.bark, parent, 5); }
    }
  }
  // ivy over a stretch of wall: leaf clusters scattered over w by h, set on the wall's face (nx, nz the way it looks)
  function pkDmIvy(parent, x, y, z, w, h, nx, nz, seed) {
    var X = pkDmM(), rnd = pkRng(seed), n = Math.round(w * h * 2.2), tx = -nz, tz = nx;
    for (var i = 0; i < n; i++) {
      var u = (rnd() - 0.5) * w, v = rnd() * h * (1 - Math.abs(u) / w * 0.6), r = 0.22 + rnd() * 0.25;
      var m = new THREE.Mesh(cachedGeo('pkdmivy', function () { return new THREE.IcosahedronGeometry(1, 0); }), X.ivy[i % 3]);
      m.scale.set(r, r * 0.8, r * 0.35); m.position.set(x + tx * u + nx * 0.12, y + v, z + tz * u + nz * 0.12); m.rotation.y = Math.atan2(nx, nz); m.castShadow = true; parent.add(m);
    }
  }
  // a show figure facing local +z: a hooded monk, a conductor in his tailcoat, a musician standing or seated. A few turned
  // shapes in one material. Returns the group and the two arms (pivots at the shoulders; rotation.x < 0 raises one forward).
  function pkDmFigure(mat, o) {
    o = o || {}; var X = pkDmM(), g = new THREE.Group(), seat = !!o.seated, hip = seat ? 0.5 : 0.9, top;
    if (o.robe) { pkLathe([[0, 0], [0.34, 0], [0.31, 0.3], [0.25, 0.9], [0.22, 1.25], [0.16, 1.42], [0, 1.46]], mat, 0, 0, 0, g, 12); top = 1.44; }
    else {
      [-1, 1].forEach(function (s) {
        if (seat) { pkRod(s * 0.1, hip, 0, s * 0.1, hip, 0.42, 0.075, mat, g, 6); pkRod(s * 0.1, hip, 0.42, s * 0.1, 0.05, 0.46, 0.065, mat, g, 6); }
        else pkRod(s * 0.1, 0.04, 0, s * 0.1, hip, 0, 0.075, mat, g, 6);
      });
      pkLathe([[0, 0], [0.19, 0], [0.2, 0.2], [0.23, 0.45], [0.2, 0.58], [0.08, 0.64], [0, 0.64]], mat, 0, hip, 0, g, 10);
      if (o.tails) { var tl = box(0.32, 0.62, 0.05, mat, 0, hip - 0.1, -0.18, g); tl.rotation.x = 0.22; }
      top = hip + 0.64;
    }
    cyl(0.05, 0.12, mat, 0, top + 0.04, 0, g, 6);
    var head = sphere(0.12, mat, 0, top + 0.19, 0.01, g); head.scale.set(0.9, 1.1, 1);
    if (o.robe) { pkLathe([[0, 0], [0.18, 0], [0.19, 0.14], [0.15, 0.3], [0, 0.4]], mat, 0, top, -0.03, g, 10); sphere(0.1, X.black, 0, top + 0.17, 0.08, g); }
    else { [-1, 1].forEach(function (s) { sphere(0.026, X.black, s * 0.045, top + 0.21, 0.115, g); }); if (o.hair) [-1, 0, 1].forEach(function (s) { sphere(0.075, mat, s * 0.1, top + 0.27 - Math.abs(s) * 0.04, -0.03, g); }); }
    var arms = [-1, 1].map(function (s) {
      var p = new THREE.Group(); p.position.set(s * 0.23, top - 0.08, 0); p.userData.keep = true; g.add(p);
      pkRod(0, 0, 0, 0, -0.56, 0, 0.045, mat, p, 6); sphere(0.05, mat, 0, -0.58, 0, p);
      return p;
    });
    if (o.s) g.scale.setScalar(o.s);
    return { g: g, armL: arms[0], armR: arms[1], top: top };
  }
  // the black kitten (the Unnameable's own shape): sitting, tail round, its eyes lit
  function pkDmKitten(parent, x, y, z, ry, s) {
    var X = pkDmM(), g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; g.scale.setScalar(s || 1); parent.add(g);
    sphere(0.16, X.black, 0, 0.17, -0.02, g).scale.set(0.85, 1.05, 1.15);
    sphere(0.11, X.black, 0, 0.38, 0.06, g).scale.set(1.05, 0.95, 0.95);
    [-1, 1].forEach(function (k) {
      var e = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.1, 4), X.black); e.position.set(k * 0.062, 0.48, 0.05); e.rotation.z = -k * 0.3; e.castShadow = true; g.add(e);
      sphere(0.023, X.eye, k * 0.043, 0.4, 0.155, g);
      sphere(0.045, X.black, k * 0.06, 0.03, 0.13, g);
    });
    pkTube([[0, 0.05, -0.16], [0.13, 0.04, -0.24], [0.21, 0.12, -0.19], [0.22, 0.24, -0.1]], 0.026, X.black, g, false, 12, 6);
    return g;
  }
  // a cat sitting, in outline: the weathervane and the reliefs
  var PK_DM_CAT = [[-0.28, 0], [0.3, 0], [0.34, 0.2], [0.3, 0.48], [0.22, 0.66], [0.27, 0.92], [0.17, 0.82], [0.05, 0.84], [-0.04, 0.93], [-0.04, 0.7], [-0.14, 0.52], [-0.18, 0.28], [-0.34, 0.22], [-0.52, 0.34], [-0.58, 0.28], [-0.4, 0.1]];
  // a violin in outline, length 1: the two bouts and the waist between them
  function pkDmViolinPts() {
    var right = [], left = [];
    for (var i = 0; i <= 30; i++) {
      var y = -0.5 + i / 30, lo = Math.abs(y + 0.22) < 0.28 ? 0.22 * Math.sqrt(1 - Math.pow((y + 0.22) / 0.28, 2)) : 0, up = Math.abs(y - 0.25) < 0.25 ? 0.17 * Math.sqrt(1 - Math.pow((y - 0.25) / 0.25, 2)) : 0;
      var hw = Math.max(lo, up, 0.01); right.push([hw, y]); left.unshift([-hw, y]);
    }
    return right.concat(left);
  }
  function pkDmViolin(parent, x, y, z, s, mat, rx, ry, rz) {
    var X = pkDmM(), g = new THREE.Group(); g.position.set(x, y, z); g.rotation.set(rx || 0, ry || 0, rz || 0); g.scale.setScalar(s); parent.add(g);
    var body = new THREE.Mesh(pkExtrudeGeo(pkDmViolinPts(), 0.12, 0.015), mat || X.oak); body.castShadow = true; g.add(body);
    box(0.06, 0.42, 0.05, X.black, 0, 0.66, 0.02, g); sphere(0.045, X.black, 0, 0.9, 0.02, g);
    [-0.04, 0.04].forEach(function (k) { box(0.012, 0.16, 0.02, X.black, k, 0.02, 0.07, g); });
    return g;
  }

  // ── The chapel ───────────────────────────────────────────────────
  // face k of the ten (its middle at 18 + 36k degrees from +x toward +z): a group on the outer face, local x along it, +z out
  function pkDmFace(k) {
    var D = PK_DM, phi = (18 + 36 * k) * Math.PI / 180, a = D.R * Math.cos(Math.PI / 10), L = 2 * D.R * Math.sin(Math.PI / 10);
    var g = new THREE.Group(); g.position.set(D.CX + Math.cos(phi) * a, 0, D.CZ + Math.sin(phi) * a); g.rotation.y = Math.PI / 2 - phi; D.g.add(g);
    return { g: g, k: k, phi: phi, a: a, L: L, Lin: L * (a - D.T) / a,
      at: function (u, v) { return { x: g.position.x + u * Math.sin(phi) + v * Math.cos(phi), z: g.position.z - u * Math.cos(phi) + v * Math.sin(phi) }; } };
  }
  // the wall of a face, outer stone and the darker lining inside, with a hole (u0..u1, from y0 or the floor up to y1) for a
  // door or the cabin's spyhole; the solids follow the wall in short squares and leave a doorway open
  function pkDmWall(f, hole) {
    var D = PK_DM, X = pkDmM(), T = D.T, H = D.H, L = f.L + 0.04, Li = f.Lin;
    var piece = function (u0, u1, y0, y1) {
      if (u1 - u0 < 0.01 || y1 - y0 < 0.01) return;
      box(u1 - u0, y1 - y0, T, X.stone, (u0 + u1) / 2, (y0 + y1) / 2, -T / 2, f.g);
      var a0 = Math.max(u0, -Li / 2), a1 = Math.min(u1, Li / 2);
      if (a1 > a0) box(a1 - a0, y1 - y0, 0.04, X.stoneIn, (a0 + a1) / 2, (y0 + y1) / 2, -T - 0.02, f.g);
    };
    if (hole) { piece(-L / 2, hole.u0, 0, H); piece(hole.u1, L / 2, 0, H); piece(hole.u0, hole.u1, hole.y1, H); if (hole.y0) piece(hole.u0, hole.u1, 0, hole.y0); }
    else piece(-L / 2, L / 2, 0, H);
    for (var u = -L / 2 + 0.25; u <= L / 2 - 0.2; u += 0.5) {
      if (hole && !hole.y0 && u > hole.u0 - 0.45 && u < hole.u1 + 0.45) continue;
      var p = f.at(u, -T / 2); solid(p.x - 0.42, p.x + 0.42, p.z - 0.42, p.z + 0.42, 0, H);
    }
    // inside: a dado (not across a doorway) and the cornice under the vault
    if (!hole || hole.y1 < 3.2) box(Li, 0.22, 0.16, X.carveDark, 0, 3.4, -T - 0.1, f.g);
    box(Li, 0.4, 0.32, X.carveDark, 0, H - 0.3, -T - 0.18, f.g);
  }
  // outside: the plinth, a string course, the cornice and (if the face is free) a tall window high up
  function pkDmWallOut(f, hole) {
    var X = pkDmM(), L = f.L;
    if (hole) [[-L / 2 - 0.15, hole.u0 - 0.05], [hole.u1 + 0.05, L / 2 + 0.15]].forEach(function (r) { box(r[1] - r[0], 0.8, 0.4, X.carveDark, (r[0] + r[1]) / 2, 0.4, 0.1, f.g); });
    else box(L + 0.3, 0.8, 0.4, X.carveDark, 0, 0.4, 0.1, f.g);
    box(L + 0.1, 0.24, 0.24, X.carve, 0, 6.5, 0.1, f.g);
    box(L + 0.6, 0.5, 0.55, X.carve, 0, PK_DM.H - 0.15, 0.2, f.g);
    pkDmLancet(f.g, 0, 7.1, 0.04, 0, 1.5, 4.6, X.glass, X.carve);
  }
  // a buttress at vertex j (36j degrees), d deep: stepped, a weathering slope, a pinnacle on top with its finial
  function pkDmButtress(j, d) {
    var D = PK_DM, X = pkDmM(), psi = j * Math.PI / 5, vx = D.CX + Math.cos(psi) * D.R, vz = D.CZ + Math.sin(psi) * D.R;
    var g = new THREE.Group(); g.position.set(vx, 0, vz); g.rotation.y = Math.PI / 2 - psi; D.g.add(g);
    box(1.3, 0.9, d + 0.4, X.carveDark, 0, 0.45, d / 2 - 0.15, g);
    box(1.05, 7.6, d, X.stone, 0, 3.8, d / 2 - 0.3, g);
    var sl = box(1.1, 0.24, d * 0.62, X.carve, 0, 7.75, d * 0.62 - 0.25, g); sl.rotation.x = 0.6;
    box(0.85, 5.0, d * 0.5, X.stone, 0, 10.1, d * 0.25 - 0.3, g);
    box(0.95, 0.22, d * 0.5 + 0.12, X.carve, 0, 12.6, d * 0.25 - 0.3, g);
    box(0.62, 1.3, 0.62, X.stone, 0, 13.35, d * 0.25 - 0.3, g);
    pkHipRoof(0.72, 0.72, 2.4, X.carve, 0, 14.0, d * 0.25 - 0.3, g);
    sphere(0.13, X.carve, 0, 16.5, d * 0.25 - 0.3, g);
    for (var c = 0; c < 3; c++) [-1, 1].forEach(function (s) { sphere(0.07, X.carve, s * (0.3 - c * 0.08), 14.4 + c * 0.6, d * 0.25 - 0.3, g); });
    if (d > 0.6) { var px = vx + Math.cos(psi) * (d / 2 - 0.3), pz = vz + Math.sin(psi) * (d / 2 - 0.3); solid(px - 0.55, px + 0.55, pz - 0.55, pz + 0.55, 0, 12); }
  }
  // a decagon in the chapel's own turn (its vertices at 36j degrees), for the cornices and the roof
  function pkDmDeca(rTop, rBot, h, mat, y, parent, open, len) {
    var D = PK_DM, m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, len ? Math.round(10 * len / (Math.PI * 2)) : 10, 1, !!open, Math.PI / 10, len || Math.PI * 2), mat);
    m.position.set(D.CX, y, D.CZ); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  }
  // a rose window high on a face, a balcony under it and the ghost musicians on the balcony (who: piano, harp or triangles)
  function pkDmRoseNiche(f, who) {
    var X = pkDmM(), z0 = -PK_DM.T - 0.04, gm = X.ghostO;
    pkDmRose(f.g, 0, 7.4, z0 - 0.02, Math.PI, 1.45, X.roseIn, X.carve);
    box(2.9, 0.3, 1.5, X.carve, 0, 4.85, z0 - 0.75, f.g);
    box(3.0, 0.1, 1.6, X.carveDark, 0, 5.05, z0 - 0.78, f.g);
    [-1.1, 0, 1.1].forEach(function (u) { box(0.28, 0.8, 0.9, X.carveDark, u, 4.3, z0 - 0.45, f.g); });
    for (var b = -1.35; b <= 1.36; b += 0.27) cyl(0.035, 0.7, X.carve, b, 5.45, z0 - 1.46, f.g, 6);
    box(2.9, 0.1, 0.12, X.carve, 0, 5.82, z0 - 1.46, f.g);
    var stand = new THREE.Group(); stand.position.set(0, 5.1, z0 - 0.75); stand.rotation.y = Math.PI; f.g.add(stand);   // local +z looks into the chapel
    if (who === 'piano') {
      box(1.5, 0.32, 0.95, X.black, 0.15, 0.78, 0.15, stand); var lid = box(1.4, 0.04, 0.9, X.black, 0.2, 1.1, 0.0, stand); lid.rotation.z = 0.5;
      [[-0.45, -0.2], [0.75, -0.2], [0.15, 0.5]].forEach(function (l) { cyl(0.04, 0.62, X.black, l[0], 0.31, l[1], stand, 6); });
      box(0.9, 0.06, 0.18, X.bone, -0.1, 0.92, 0.66, stand);   // the piano plays itself
    } else if (who === 'harp') {
      pkTube([[0.3, 0.05, 0], [0.38, 0.9, 0], [0.1, 1.55, 0], [-0.35, 1.25, 0]], 0.05, X.gold, stand, false, 24, 6);
      pkRod(0.3, 0.05, 0, -0.35, 1.25, 0, 0.04, X.gold, stand, 6);
      for (var st = 0; st < 7; st++) { var f2 = st / 7; pkRod(0.3 - f2 * 0.6, 0.1 + f2 * 1.15, 0, 0.3 - f2 * 0.6, 0.15 + f2 * 1.15 + (1 - f2) * 0.9, 0, 0.006, X.tin, stand, 4); }
      var hp = pkDmFigure(gm, { seated: true }); hp.g.position.set(-0.2, 0, -0.45); stand.add(hp.g); hp.armL.rotation.x = -0.9; hp.armR.rotation.x = -1.2;
    } else {
      [-0.8, 0, 0.8].forEach(function (u, i) {
        var t = pkDmFigure(gm, { s: 0.92 + i * 0.05 }); t.g.position.set(u, 0, 0); stand.add(t.g); t.armR.rotation.x = -1.3; t.armL.rotation.x = -1.0;
        pkTube([[0, -0.05, 0], [0.12, -0.25, 0], [-0.12, -0.25, 0]], 0.012, X.tin, t.armR, true, 12, 4).position.set(0, -0.62, 0.05);
      });
    }
  }
  // an arch-headed niche with three monks of the choir on its step, a candle in each pair of hands, behind a scrim that the
  // show turns clear
  function pkDmScrimNiche(f) {
    var X = pkDmM(), z0 = -PK_DM.T - 0.04;
    pkDmFrame(pkDmArch(3.7, 4.4, 6.3), pkDmArch(3.1, 4.3, 5.9), 0.2, X.carve, f.g, 0, 0, z0 - 0.08).rotation.y = Math.PI;
    box(3.1, 0.5, 0.7, X.carveDark, 0, 0.25, z0 - 0.35, f.g);
    var choir = new THREE.Group(); choir.position.set(0, 0.5, z0 - 0.35); choir.rotation.y = Math.PI; f.g.add(choir);
    [-0.95, 0, 0.95].forEach(function (u, i) {
      var m = pkDmFigure(X.monk, { robe: true, s: 1.0 + (i === 1 ? 0.06 : 0) }); m.g.position.set(u, 0, 0); choir.add(m.g);
      m.armL.rotation.x = m.armR.rotation.x = -0.9; m.armL.rotation.z = -0.35; m.armR.rotation.z = 0.35;
      cyl(0.035, 0.24, X.bone, 0, 1.12, 0.36, m.g, 8); sphere(0.05, X.candle, 0, 1.28, 0.36, m.g).scale.set(0.8, 1.5, 0.8);
    });
    var scrim = pkDmFlat(pkDmArch(3.2, 4.4, 6.0), X.scrim, f.g, 0, 0.05, z0 - 0.78); scrim.userData.noBake = true; scrim.renderOrder = 2;
  }
  // the organ on the north face: a cased lower stage with the console, two pipe towers, the gallery, and in the middle a
  // section that turns round on its post, pipes on one side and Joseph Charlatan conducting on the other
  function pkDmOrgan(f) {
    var X = pkDmM(), og = new THREE.Group(); og.position.set(0, 0, -PK_DM.T - 0.04); og.rotation.y = Math.PI; f.g.add(og);   // +z looks into the chapel
    box(4.8, 3.0, 1.0, X.oakDark, 0, 1.5, 0.5, og);
    [-1.6, 0, 1.6].forEach(function (u) { box(1.3, 2.2, 0.04, X.oak, u, 1.5, 1.01, og); box(1.36, 0.06, 0.06, X.gold, u, 2.62, 1.02, og); });
    box(1.9, 0.9, 0.3, X.oakDark, 0, 0.95, 1.15, og);
    box(1.6, 0.05, 0.16, X.bone, 0, 1.12, 1.26, og); box(1.6, 0.05, 0.14, X.bone, 0, 1.24, 1.18, og);
    box(5.0, 0.22, 0.3, X.gold, 0, 3.05, 0.95, og);
    box(4.4, 6.0, 0.05, X.organGlow, 0, 6.1, 0.05, og);
    [-1, 1].forEach(function (s) {
      box(1.2, 6.2, 1.0, X.oakDark, s * 1.75, 6.1, 0.5, og);
      pkHipRoof(1.35, 1.1, 1.8, X.oakDark, s * 1.75, 9.2, 0.5, og); sphere(0.12, X.gold, s * 1.75, 11.1, 0.5, og);
      for (var p = 0; p < 5; p++) { var ph = 3.0 + Math.abs(p - 2) * -0.4 + 1.6, px = s * 1.75 + (p - 2) * 0.2; cyl(0.08, ph, X.tin, px, 3.3 + ph / 2, 1.08, og, 10); box(0.09, 0.08, 0.02, X.black, px, 3.55, 1.16, og); }
      box(1.25, 0.16, 1.05, X.gold, s * 1.75, 3.15, 0.5, og);
    });
    // the middle turns: pipes toward the chapel to begin with, Joseph behind them
    var mid = pkMover(og, 0, 3.3, 0.75);
    box(1.5, 4.2, 0.06, X.oakDark, 0, 2.1, 0, mid);
    for (var q = 0; q < 7; q++) { var qh = 3.6 - Math.abs(q - 3) * 0.35; cyl(0.07, qh, X.tin, (q - 3) * 0.19, 0.15 + qh / 2, 0.12, mid, 10); }
    box(1.55, 0.12, 0.7, X.gold, 0, 4.25, 0, mid);
    box(1.2, 0.1, 0.5, X.oakDark, 0, 0.05, -0.32, mid);
    var jo = pkDmFigure(X.ghostJ, { tails: true, hair: true }); jo.g.position.set(0, 0.1, -0.32); jo.g.rotation.y = Math.PI; mid.add(jo.g);
    jo.armR.rotation.x = -2.2; jo.armL.rotation.x = -1.4; jo.armL.rotation.z = 0.4;
    pkRod(0, -0.58, 0, 0, -0.98, 0.1, 0.012, X.bone, jo.armR, 4);
    pkSign3D(['DANSE MACABRE'], 2.2, 0.36, 0, 9.7, 1.05, 0, { bg: '#1b1410', fg: '#d8b45a' }, og);
    return { mid: mid, arm: jo.armR, armL: jo.armL };
  }
  // the operator's spyhole through the south face (the cabin stands behind the wall): from the chapel an old barred window
  // in a carved surround, its glass painted dark on this side (a sheet that faces the chapel only, so the operator sees out
  // clearly), a skull and two candle stubs on the sill and a hanging lantern beside it
  function pkDmSpyhole(f, u) {
    var X = pkDmM(), z0 = -PK_DM.T - 0.04, w = 1.8, y0 = 1.2, h = 1.1;
    var fr = pkDmFrame(pkDmArch(w + 0.5, 0.75, 1.5).map(function (q) { return [q[0], q[1] - 0.18]; }), pkDmArch(w, 0.7, h), 0.2, X.carve, f.g, u, y0, z0 - 0.08); fr.rotation.y = Math.PI;
    var tint = std({ color: 0x07070a, roughness: 0.15, metalness: 0.6, transparent: true, opacity: 0.86 });
    var pane = pkDmFlat(pkDmArch(w, 0.7, h), tint, f.g, u, y0, z0 + 0.02); pane.rotation.y = Math.PI; pane.userData.noBake = true;
    for (var b = 0; b < 6; b++) cyl(0.022, h - 0.05, X.iron, u - w / 2 + 0.17 + b * (w - 0.34) / 5, y0 + (h - 0.05) / 2, z0 - 0.12, f.g, 6);
    box(w, 0.05, 0.05, X.iron, u, y0 + 0.55, z0 - 0.12, f.g);
    box(w + 0.7, 0.14, 0.45, X.carveDark, u, y0 - 0.07, z0 - 0.2, f.g);
    box(w + 0.3, 0.9, 0.12, X.carveDark, u, y0 - 0.6, z0 - 0.08, f.g);
    var sk = new THREE.Group(); sk.position.set(u - 0.55, y0 + 0.12, z0 - 0.25); sk.rotation.y = Math.PI + 0.3; f.g.add(sk);
    sphere(0.11, X.bone, 0, 0, 0, sk).scale.set(0.9, 1, 1.1); box(0.13, 0.06, 0.09, X.bone, 0, -0.08, 0.06, sk);
    [-1, 1].forEach(function (s) { sphere(0.028, X.black, s * 0.04, 0.01, 0.095, sk); });
    [[0.5, 0.18], [0.72, 0.11]].forEach(function (c) { cyl(0.04, c[1], X.bone, u + c[0], y0 + c[1] / 2, z0 - 0.25, f.g, 8); sphere(0.035, X.candle, u + c[0], y0 + c[1] + 0.05, z0 - 0.25, f.g).scale.set(0.8, 1.5, 0.8); });
    pkRod(u + 1.35, 2.7, z0, u + 1.35, 2.7, z0 - 0.4, 0.02, X.iron, f.g, 4);
    pkRod(u + 1.35, 2.7, z0 - 0.4, u + 1.35, 2.4, z0 - 0.4, 0.01, X.iron, f.g, 4);
    box(0.18, 0.26, 0.18, X.candle, u + 1.35, 2.25, z0 - 0.4, f.g); pkHipRoof(0.24, 0.24, 0.16, X.iron, u + 1.35, 2.38, z0 - 0.4, f.g);
  }
  // ── The stage ────────────────────────────────────────────────────
  // a choir stall for six on its own turntable (the stalls waltz on the turning floor): two raked rows of three on velvet
  // cushions, a low carved back with gilt arches under a turned rail, scrolled arm ends, and a lap bar for each row that
  // stands up when open. Kept inside a 1.6 m circle, so turning it never touches its neighbours or the crate. Local +z
  // faces the middle of the stage; the stall turns about its own middle.
  function pkDmStall(parent, ang, seats, bars) {
    var X = pkDmM(), rr = 3.9, st = pkMover(parent, Math.cos(ang) * rr, 0.13, Math.sin(ang) * rr);
    var base = Math.atan2(-Math.cos(ang), -Math.sin(ang)); st.rotation.y = base;
    var tt = new THREE.Mesh(new THREE.CircleGeometry(1.6, 40), X.oakDark); tt.rotation.x = -Math.PI / 2; tt.position.y = 0.006; tt.receiveShadow = true; st.add(tt);
    pkRing(1.6, 0.035, X.gold, 0, 0.01, 0, st, 48);
    box(2.7, 0.12, 1.55, X.oakDark, 0, 0.07, -0.05, { parent: st, r: 0.03 });
    box(2.55, 0.06, 0.04, X.gold, 0, 0.1, 0.73, st);
    // the front row, its backrest the riser of the row behind
    box(2.5, 0.34, 0.5, X.oak, 0, 0.3, 0.42, { parent: st, r: 0.02 });
    box(2.42, 0.1, 0.48, X.velvet, 0, 0.53, 0.42, { parent: st, r: 0.04 });
    box(2.6, 0.78, 0.7, X.oakDark, 0, 0.51, -0.33, { parent: st, r: 0.02 });
    box(2.42, 0.42, 0.08, X.velvet, 0, 1.05, 0.06, { parent: st, r: 0.03 });
    box(2.42, 0.1, 0.5, X.velvet, 0, 0.95, -0.36, { parent: st, r: 0.04 });
    // the back: carved, gilt arches, a turned rail and finials
    box(2.6, 1.05, 0.1, X.oakDark, 0, 1.42, -0.72, { parent: st, r: 0.02 });
    [-0.85, 0, 0.85].forEach(function (u) { pkDmFrame(pkDmArch(0.62, 0.45, 0.8), pkDmArch(0.44, 0.42, 0.68), 0.04, X.gold, st, u, 1.03, -0.66); });
    pkRod(-1.32, 1.98, -0.72, 1.32, 1.98, -0.72, 0.065, X.oak, st, 10);
    [-1, 1].forEach(function (s) {
      sphere(0.1, X.gold, s * 1.36, 2.02, -0.72, st);
      // the arm ends, low and scrolled
      box(0.1, 0.62, 1.3, X.oakDark, s * 1.3, 0.44, 0.05, { parent: st, r: 0.02 });
      pkRod(s * 1.3, 0.8, -0.6, s * 1.3, 0.8, 0.62, 0.06, X.oak, st, 8);
      sphere(0.09, X.oak, s * 1.3, 0.8, 0.66, st); pkRing(0.09, 0.02, X.gold, s * 1.3, 0.8, 0.66, st, 16, false).rotation.y = Math.PI / 2;
    });
    [-0.8, 0, 0.8].forEach(function (u) {
      seats.push({ par: st, x: u, y: -0.18, z: 0.42, ry: 0, guest: null });
      seats.push({ par: st, x: u, y: 0.24, z: -0.36, ry: 0, guest: null });
    });
    [[0.86, 0.18], [1.26, -0.6]].forEach(function (r) {
      var bar = pkMover(st, 0, r[0], r[1]);
      pkTube([[-1.22, 0, 0], [-1.22, 0, 0.42], [1.22, 0, 0.42], [1.22, 0, 0]], 0.035, X.iron, bar, false, 20, 6);
      box(2.3, 0.08, 0.1, X.velvet, 0, 0, 0.42, { parent: bar, r: 0.03 });
      bars.push(bar);
    });
    return { o: st, base: base };
  }
  // the instrument crate in the middle: banded oak with its lid ajar, a double bass leaning on it, a drum, a horn, a violin
  // and its bow, and the kitten on the lid
  function pkDmCrate(parent) {
    var X = pkDmM(), c = new THREE.Group(); c.position.y = 0.13; parent.add(c);
    box(1.7, 0.95, 1.1, X.oak, 0, 0.48, 0, c);
    [-0.6, 0, 0.6].forEach(function (u) { box(0.08, 0.97, 1.12, X.iron, u, 0.48, 0, c); });
    var lid = box(1.75, 0.08, 1.15, X.oakDark, 0, 1.02, -0.12, c); lid.rotation.x = -0.28;
    pkDmViolin(c, 1.05, 0.95, 0.15, 1.9, X.oak, 0, 0.2, -0.22);
    cyl(0.4, 0.5, std({ color: 0x6a1a1a, roughness: 0.6 }), -1.15, 0.25, 0.25, c, 18); pkRing(0.4, 0.03, X.gold, -1.15, 0.5, 0.25, c, 24); pkRing(0.4, 0.03, X.gold, -1.15, 0.02, 0.25, c, 24);
    pkTube([[-0.3, 1.05, 0.35], [-0.1, 1.2, 0.45], [0.15, 1.12, 0.38], [0.2, 0.98, 0.2], [0.0, 0.98, 0.1]], 0.045, X.brass, c, false, 20, 8);
    var bell = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.04, 0.3, 16, 1, true), X.brass); bell.position.set(-0.4, 1.12, 0.38); bell.rotation.z = 1.2; c.add(bell);
    pkDmViolin(c, 0.35, 1.12, -0.05, 0.6, X.oak, -1.35, 0, 0.5);
    pkDmKitten(c, -0.2, 1.06, -0.1, 0.3, 1.0);
    return c;
  }
  // the crypt under the floor, seen only when it rises: the sarcophagus with its lid pushed aside and the undead figure half
  // out of it, candles round. It rides up out of the ground with the floor.
  function pkDmCrypt(g) {
    var D = PK_DM, X = pkDmM(), cr = pkMover(g, D.CX, -1.8, D.CZ), a = 0.5;
    var s = new THREE.Group(); s.position.set(Math.cos(a) * 1.7, 0, Math.sin(a) * 1.7); s.rotation.y = -a; cr.add(s);
    box(0.95, 0.7, 2.1, X.carveDark, 0, 0.35, 0, s);
    var lid = box(1.0, 0.14, 2.15, X.carve, 0.35, 0.78, 0.35, s); lid.rotation.y = 0.35;
    var u = pkDmFigure(X.undead, { seated: true }); u.g.position.set(0, 0.25, -0.55); s.add(u.g); u.armL.rotation.x = u.armR.rotation.x = -1.4;
    for (var k = 0; k < 6; k++) { var ca = k / 6 * Math.PI * 2; cyl(0.04, 0.3, X.bone, Math.cos(ca) * 2.6, 0.15, Math.sin(ca) * 2.6, cr, 6); sphere(0.045, X.candle, Math.cos(ca) * 2.6, 0.35, Math.sin(ca) * 2.6, cr).scale.set(0.8, 1.5, 0.8); }
    cyl(0.6, 0.1, X.carveDark, 0, 0.05, 0, cr, 16);
    return cr;
  }

  // ── The front: the west-work, the hall, the lower range, the tower ──
  function pkDmFront(g, doors) {
    var D = PK_DM, X = pkDmM(), FX = D.FX, BX = D.BX, NZ = D.NZ, SZ = D.SZ, WH = D.WH, DZ = D.DZ, zc = (NZ + SZ) / 2;
    // the front wall with the doorway (2.6 wide, 4.6 high) in it
    box(0.8, WH, -22.0 - NZ, X.stone, FX - 0.4, WH / 2, (NZ - 22.0) / 2, g);
    box(0.8, WH, SZ + 19.4, X.stone, FX - 0.4, WH / 2, (SZ - 19.4) / 2, g);
    box(0.8, WH - 4.6, 2.62, X.stone, FX - 0.4, 4.6 + (WH - 4.6) / 2, DZ, g);
    box(0.4, 1.2, 2.62, X.carve, FX - 0.5, 4.0, DZ, g);                                                     // the tympanum over the doors
    pkExtrude(PK_DM_CAT, 0.08, X.gold, FX - 0.28, 3.55, DZ - 0.05, g, 0.01).rotation.y = Math.PI / 2;
    box(0.9, 0.06, 2.62, X.flags, FX - 0.4, 0.03, DZ, g);
    solid(FX - 0.8, FX, NZ, -21.95, 0, WH); solid(FX - 0.8, FX, -19.45, SZ, 0, WH);
    // the north return to the chapel, the south wall, the hall's west wall (behind the cabin it is the cabin's own)
    box(FX + 46.75, WH, 0.8, X.stone, (-46.75 + FX) / 2, WH / 2, NZ + 0.4, g);
    solid(-46.75, FX, NZ, NZ + 0.8, 0, WH);
    box(FX - BX, WH, 0.8, X.stone, (FX + BX) / 2, WH / 2, SZ - 0.4, g); solid(BX, FX, SZ - 0.8, SZ, 0, WH);
    box(0.4, 5.0, SZ - 0.8 + 16.8, X.stoneIn, BX + 0.2, 2.5, (-16.8 + SZ - 0.8) / 2, g); solid(BX, BX + 0.4, -16.8, SZ - 0.8, 0, 5);
    // the hall: a ceiling at 5 m over its whole shape (the wedge against the chapel's wall too) and a flagged floor
    var hallN = [[-52.05, -20.0], [-47.8, -23.06], [-46.75, -26.3], [FX, -26.3], [FX, -20.0]];
    box(FX - BX, 0.3, SZ + 20.0, X.carveDark, (FX + BX) / 2, 5.15, (SZ - 20.0) / 2, g);
    var ceilN = new THREE.Mesh(pkExtrudeGeo(hallN, 0.3, 0), X.carveDark); ceilN.rotation.x = Math.PI / 2; ceilN.position.y = 5.15; g.add(ceilN);
    box(FX - BX, 0.06, SZ + 20.0, X.flags, (FX + BX) / 2, 0.03, (SZ - 20.0) / 2, g);
    var floorN = new THREE.Mesh(pkExtrudeGeo(hallN, 0.06, 0), X.flagsW); floorN.rotation.x = Math.PI / 2; floorN.position.y = 0.03; floorN.receiveShadow = true; g.add(floorN);
    pkDmSecretWall(g);
    // the roof over the west-work, and its broken front gable standing proud of it
    pkGableRoof(5.6, SZ - NZ + 0.2, 6.6, X.slate, X.stoneW, (FX + BX) / 2 - 0.1, WH, zc, g, 0.35);
    var G = 7.2, hw = (SZ - NZ) / 2 + 0.05, gp = [[-hw, 0], [hw, 0], [1.6, G * (1 - 1.6 / hw)], [1.15, 4.95], [0.75, 5.6], [0.25, 4.5], [-0.35, 5.15], [-0.85, 4.35], [-1.7, G * (1 - 1.7 / hw)]];
    var gab = new THREE.Mesh(pkExtrudeGeo(gp, 0.8, 0), X.stoneW); gab.rotation.y = Math.PI / 2; gab.position.set(FX - 0.4, WH, zc); gab.castShadow = true; g.add(gab);
    [-1, 1].forEach(function (s) {
      var L = Math.hypot(hw - 1.65, G * (1 - 1.65 / hw)), cp = box(0.95, 0.2, L, X.carve, FX - 0.4, WH + G * (1 - 1.65 / hw) / 2 + 0.12, zc - s * (hw + 1.65) / 2, g);
      cp.rotation.x = -s * Math.atan2(G * (1 - 1.65 / hw), hw - 1.65);
      for (var k = 1; k < 7; k++) { var f = k / 7, cz = zc - s * (hw - f * (hw - 1.65)), cy = WH + f * G * (1 - 1.65 / hw) + 0.3; sphere(0.13, X.carve, FX - 0.1, cy, cz, g); }
      // the gable's shoulders: a pinnacle each side
      box(0.8, 1.6, 0.8, X.stone, FX - 0.4, WH + 0.8, zc - s * (hw - 0.2), g);
      pkHipRoof(0.9, 0.9, 2.4, X.carve, FX - 0.4, WH + 1.6, zc - s * (hw - 0.2), g); sphere(0.14, X.carve, FX - 0.4, WH + 4.1, zc - s * (hw - 0.2), g);
    });
    for (var rb = 0; rb < 7; rb++) pkBoulder(FX + 0.6 + (rb % 3) * 0.4, NZ + 0.4 + rb * 0.35, 0.18 + (rb % 3) * 0.08, g, 0.3);   // what came down off the gable
    // the corner buttress at the north end (the tower holds the south)
    box(1.0, 0.9, 1.6, X.carveDark, FX + 0.45, 0.45, NZ + 0.55, g);
    box(0.85, 8.0, 1.3, X.stone, FX + 0.3, 4.0, NZ + 0.55, g);
    var bs = box(0.9, 0.24, 1.4, X.carve, FX + 0.35, 8.1, NZ + 0.55, g); bs.rotation.z = -0.55;
    box(0.6, 3.6, 1.0, X.stone, FX + 0.05, 9.8, NZ + 0.55, g);
    pkHipRoof(0.8, 1.1, 2.2, X.carve, FX + 0.05, 11.6, NZ + 0.55, g); sphere(0.12, X.carve, FX + 0.05, 13.9, NZ + 0.55, g);
    solid(FX, FX + 0.95, NZ - 0.2, NZ + 1.3, 0, 8);
    // plinth and string course along the front
    box(0.35, 0.8, -22.0 - NZ, X.carveDark, FX + 0.1, 0.4, (NZ - 22.0) / 2, g);
    box(0.35, 0.8, SZ + 19.4, X.carveDark, FX + 0.1, 0.4, (SZ - 19.4) / 2, g);
    box(0.25, 0.24, SZ - NZ, X.carve, FX + 0.08, 10.2, zc, g);
    // the portal: clustered shafts either side, three pointed archivolts stepping out, the gable (wimperg) over them with its
    // crockets and finial, and the name over all
    [0, 1, 2].forEach(function (i) {
      var w = 2.9 + i * 0.55, off = 0.1 + i * 0.16;
      [-1, 1].forEach(function (s) {
        cyl(0.13, 3.0, X.carve, FX + off, 0.5 + 1.5, DZ + s * w / 2, g, 10);
        box(0.36, 0.22, 0.36, X.carve, FX + off, 3.55, DZ + s * w / 2, g); box(0.36, 0.5, 0.36, X.carveDark, FX + off, 0.25, DZ + s * w / 2, g);
      });
      var arc = pkDmArchCurve(w, 0, 1.55 + i * 0.35, 3.65).map(function (p) { return [FX + off, p[1], DZ + p[0]]; });
      pkTube(arc, 0.12, i === 1 ? X.carveDark : X.carve, g, false, 40, 8);
    });
    var wp = new THREE.Mesh(pkExtrudeGeo([[-2.5, 0], [2.5, 0], [0, 3.0]], 0.25, 0.02), X.carve); wp.rotation.y = Math.PI / 2; wp.position.set(FX + 0.5, 5.0, DZ); wp.castShadow = true; g.add(wp);
    var tre = new THREE.Mesh(pkExtrudeGeo(pkDmArch(1.3, 0.5, 1.4), 0.1, 0), X.carveDark); tre.rotation.y = Math.PI / 2; tre.position.set(FX + 0.6, 5.5, DZ); g.add(tre);
    for (var ck = 1; ck < 6; ck++) [-1, 1].forEach(function (s) { sphere(0.11, X.carve, FX + 0.55, 5.0 + ck * 0.5, DZ + s * (2.5 - ck * 0.42), g); });
    box(0.3, 0.6, 0.3, X.carve, FX + 0.5, 8.2, DZ, g); sphere(0.18, X.carve, FX + 0.5, 8.6, DZ, g);
    pkSign3D(['DANSE MACABRE'], 5.2, 0.8, FX + 0.12, 9.3, zc + 0.2, Math.PI / 2, { bg: '#1b232c', fg: '#ff8a3d' }, g);
    // the windows: a lancet each side of the portal, the rose in the gable
    pkDmLancet(g, FX + 0.02, 4.2, -24.6, Math.PI / 2, 1.3, 4.8, X.glass, X.carve);
    pkDmLancet(g, FX + 0.02, 4.2, -16.8, Math.PI / 2, 1.0, 4.4, X.glass, X.carve);
    pkDmRose(g, FX + 0.02, 12.6, zc, Math.PI / 2, 1.75, X.roseOut, X.carve);
    // the torches either side of the doors
    [-1, 1].forEach(function (s) {
      var tz = DZ + s * 2.25;
      pkRod(FX, 2.6, tz, FX + 0.45, 2.95, tz, 0.035, X.iron, g, 6);
      cyl(0.11, 0.2, X.iron, FX + 0.45, 3.05, tz, g, 8, 0.07);
      sphere(0.13, X.flame, FX + 0.45, 3.28, tz, g).scale.set(0.8, 1.6, 0.8);
    });
    // the doors: studded oak on iron straps, a lit grille in each, swinging in when the ride boards
    [-1, 1].forEach(function (s) {
      var hz = DZ + s * 1.29, hinge = pkMover(g, FX - 0.5, 0, hz);
      box(0.1, 3.4, 1.28, X.oakDark, 0, 1.7, -s * 0.64, hinge);
      [0.5, 1.7, 2.9].forEach(function (y) { box(0.13, 0.1, 1.2, X.iron, 0.02, y, -s * 0.62, hinge); });
      for (var st = 0; st < 5; st++) sphere(0.03, X.iron, 0.07, 0.4 + st * 0.62, -s * 1.1, hinge);
      box(0.12, 0.42, 0.34, X.candle, 0.01, 2.25, -s * 0.66, hinge);
      for (var gb = 0; gb < 3; gb++) box(0.14, 0.44, 0.03, X.iron, 0.02, 2.25, -s * (0.55 + gb * 0.11), hinge);
      sphere(0.07, X.iron, 0.08, 1.35, -s * 1.12, hinge);
      pkFuse(hinge); doors.push({ h: hinge, s: s });
    });
    // the lower range behind the west-work, where the cabin is: lower walls, a lead flat behind a battlemented parapet
    var LX = -58.0;
    box(BX - LX, 6.6, 0.8, X.stone, (LX + BX) / 2, 3.3, SZ - 0.4, g);
    box(0.8, 6.6, SZ + 20.0, X.stone, LX + 0.4, 3.3, (SZ - 20.0) / 2, g);
    box(BX - LX + 0.1, 0.3, SZ + 20.0, X.lead, (LX + BX) / 2, 6.55, (SZ - 20.0) / 2, g);
    for (var cr = 0; cr < 7; cr++) box(0.55, 0.7, 0.85, X.stone, LX + 0.4 + cr * 0.95, 7.05, SZ - 0.4, g);
    for (var cw = 0; cw < 5; cw++) box(0.85, 0.7, 0.55, X.stone, LX + 0.4, 7.05, SZ - 0.6 - cw * 0.95, g);
    box(BX - LX + 0.4, 0.8, 0.35, X.carveDark, (LX + BX) / 2, 0.4, SZ + 0.1, g);
    [-56.6, -54.0].forEach(function (x) { pkDmLancet(g, x, 2.0, SZ + 0.02, 0, 0.8, 3.0, X.glass, X.carve); });
    solid(LX, LX + 0.8, -20.0, SZ, 0, 6.6); solid(LX, BX, SZ - 0.8, SZ, 0, 6.6);   // the sacristy (the operator's room) is inside
    pkDmIvy(g, (LX + BX) / 2 - 1.5, 0.3, SZ + 0.05, 4.0, 4.5, 0, 1, 31);
    pkDmIvy(g, FX + 0.05, 0.4, -25.8, 2.4, 6.0, 1, 0, 32);
  }
  // the cabin's side onto the hall, walled up in the hall's own stone: a secret door in it where the cabin's door is, the
  // same ashlar on its face and no frame, that swings in on E (it works and blocks like the booths' doors, part 17)
  function pkDmSecretWall(g) {
    var X = pkDmM(), x0 = -52.2, x1 = -51.8, za = -20.05, zd0 = -18.25, zd1 = -17.2, zb = -16.8, H = 5.0, DH = 2.3;
    box(x1 - x0, H, zd0 - za, X.stoneIn, (x0 + x1) / 2, H / 2, (za + zd0) / 2, g);
    box(x1 - x0, H, zb - zd1, X.stoneIn, (x0 + x1) / 2, H / 2, (zd1 + zb) / 2, g);
    box(x1 - x0, H - DH, zd1 - zd0, X.stoneIn, (x0 + x1) / 2, DH + (H - DH) / 2, (zd0 + zd1) / 2, g);
    box(0.16, 0.22, zb - za, X.carveDark, x1 + 0.06, 3.4, (za + zb) / 2, g);
    solid(x0, x1, za, zd0, 0, H); solid(x0, x1, zd1, zb, 0, H);
    var hinge = pkMover(g, (x0 + x1) / 2, 0, zd0), w = zd1 - zd0;
    box(x1 - x0 - 0.02, DH - 0.01, w - 0.01, X.stoneIn, 0, DH / 2, w / 2, hinge);
    var d = { hinge: hinge, w: w, closedRy: 0, openDelta: 1.45, open: 0, want: 0, label: 'the hidden door',
      setNow: function (v) { d.want = d.open = v ? 1 : 0; hinge.rotation.y = d.openDelta * d.open; } };
    hitBox(0.5, DH, w, 0.1, DH / 2, w / 2, { prompt: function () { return d.want > 0.5 ? 'Shut the hidden door' : 'Push the loose stone'; }, use: function () { d.want = d.want > 0.5 ? 0 : 1; sfx('door'); } }, hinge);
    pkCtlLive({ tick: function (dt) { var k = d.open + (d.want - d.open) * Math.min(1, dt * 3); if (Math.abs(k - d.open) > 1e-4) { d.open = k; hinge.rotation.y = d.openDelta * k; } } });
    PK_BK_DOORS.push(d); PK_DM.secret = d;
    // a sconce beside it, the only tell
    pkRod(x1, 1.9, zd1 + 0.35, x1 + 0.3, 2.0, zd1 + 0.35, 0.025, X.iron, g, 4); cyl(0.07, 0.12, X.iron, x1 + 0.3, 2.06, zd1 + 0.35, g, 8, 0.05); sphere(0.06, X.flame, x1 + 0.3, 2.18, zd1 + 0.35, g).scale.set(0.8, 1.6, 0.8);
  }
  // the bell tower on the front's south corner: corner buttresses, slit windows, an open belfry with its bell, pinnacles,
  // and an eight-sided slate spire with dormers and the kitten weathervane
  function pkDmTower(g) {
    var X = pkDmM(), x0 = -50.0, x1 = -46.2, z0 = PK_DM.SZ, z1 = -11.3, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, W = x1 - x0, SH = 18.5;
    box(W + 0.4, 0.9, z1 - z0 + 0.4, X.carveDark, cx, 0.45, cz, g);
    box(W, SH, z1 - z0, X.stone, cx, SH / 2, cz, g);
    [6.4, 12.4].forEach(function (y) { box(W + 0.24, 0.22, z1 - z0 + 0.24, X.carve, cx, y, cz, g); });
    [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(function (c) {
      var ox = c[0] === x0 ? -1 : 1, oz = c[1] === z0 ? -1 : 1;
      box(0.7, 15.0, 0.7, X.stone, c[0] + ox * 0.15, 7.5, c[1] + oz * 0.15, g);
      var sl = box(0.75, 0.22, 0.75, X.carve, c[0] + ox * 0.15, 15.1, c[1] + oz * 0.15, g); sl.rotation.set(oz * 0.4, 0, -ox * 0.4);
    });
    [[cx, z1 + 0.02, 0], [x1 + 0.02, cz, Math.PI / 2]].forEach(function (w) { [3.0, 8.4, 13.4].forEach(function (y) { pkDmLancet(g, w[0], y, w[1], w[2], 0.45, 1.9, X.glass, X.carve); }); });
    // the belfry: open arches on all four sides, the bell on its beam
    var B0 = SH, BH = 4.2;
    [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(function (c) { box(0.9, BH, 0.9, X.stone, c[0] + (c[0] === x0 ? 0.45 : -0.45), B0 + BH / 2, c[1] + (c[1] === z0 ? 0.45 : -0.45), g); });
    [[cx, z0, 0], [cx, z1, 0], [x0, cz, Math.PI / 2], [x1, cz, Math.PI / 2]].forEach(function (s) {
      var fr = pkDmFrame([[-W / 2, 0], [W / 2, 0], [W / 2, BH], [-W / 2, BH]], pkDmArch(1.6, 2.2, 3.5), 0.5, X.stone, g, s[0], B0, s[1]); fr.rotation.y = s[2];
      for (var lv = 0; lv < 5; lv++) { var lb = box(1.5, 0.06, 0.32, X.oakDark, s[0], B0 + 0.6 + lv * 0.42, s[1], g); lb.rotation.y = s[2]; lb.rotation.x = 0.5; }
    });
    box(W - 0.6, 0.2, 0.25, X.oakDark, cx, B0 + 3.2, cz, g);
    pkLathe([[0, 0], [0.62, 0], [0.55, 0.12], [0.42, 0.5], [0.36, 0.9], [0.2, 1.05], [0, 1.08]], std({ color: 0x6a5a3a, roughness: 0.35, metalness: 0.8 }), cx, B0 + 1.95, cz, g, 20);
    box(W + 0.5, 0.5, z1 - z0 + 0.5, X.carve, cx, B0 + BH + 0.25, cz, g);
    [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(function (c) {
      var px = c[0] + (c[0] === x0 ? 0.25 : -0.25), pz = c[1] + (c[1] === z0 ? 0.25 : -0.25);
      box(0.55, 1.3, 0.55, X.stone, px, B0 + BH + 1.15, pz, g); pkHipRoof(0.65, 0.65, 2.0, X.carve, px, B0 + BH + 1.8, pz, g); sphere(0.1, X.carve, px, B0 + BH + 3.85, pz, g);
    });
    var sp = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 2.15, 9.5, 8, 1, false, Math.PI / 8), X.slate); sp.position.set(cx, B0 + BH + 0.5 + 4.75, cz); sp.castShadow = true; g.add(sp);
    [[cx, z0 - 0.2, 0], [cx, z1 + 0.2, Math.PI], [x0 - 0.2, cz, -Math.PI / 2], [x1 + 0.2, cz, Math.PI / 2]].forEach(function (d) {
      var dg = new THREE.Group(); dg.position.set(d[0], B0 + BH + 1.2, d[1]); dg.rotation.y = d[2]; g.add(dg);
      box(0.7, 1.0, 0.6, X.stone, 0, 0.5, 0.2, dg); box(0.4, 0.6, 0.05, X.candle, 0, 0.45, 0.51, dg);
      var dr = new THREE.Group(); dr.rotation.y = Math.PI / 2; dg.add(dr); pkGableRoof(0.8, 0.9, 0.55, X.slate, X.stoneW, -0.2, 1.0, 0, dr, 0.08);
    });
    var top = B0 + BH + 0.5 + 9.5;
    pkRod(cx, top - 0.2, cz, cx, top + 1.6, cz, 0.04, X.iron, g, 6); sphere(0.14, X.gold, cx, top + 0.2, cz, g);
    pkExtrude(PK_DM_CAT, 0.03, X.iron, cx, top + 1.0, cz, g, 0).scale.setScalar(1.3);
    solid(x0 - 0.3, x1 + 0.3, z0, z1 + 0.3, 0, SH);
    pkDmIvy(g, x0 + 1.0, 0.4, z1 + 0.05, 2.4, 5.0, 0, 1, 33);
  }

  // ── Outside: the graveyard, the cloister, the entry pillars ─────
  // the graveyard: iron railings on stone posts, the orchestra's graves, Joseph Charlatan's mausoleum (its door shudders
  // when knocked on) and his statue, dead trees and crows, grave lights, the squirting fountain and the mist
  function pkDmGraveyard(g, E) {
    var X = pkDmM(), x0 = -45.8, x1 = -33.6, z0 = -37.4, z1 = -32.2;
    var ground = box(x1 - x0 + 0.6, 0.04, z1 - z0, X.grass, (x0 + x1) / 2, 0.02, (z0 + z1) / 2, g); ground.receiveShadow = true;
    box(15.0, 0.05, 2.0, X.flags, -40.4, 0.035, -31.0, g);   // the riders' way out to the street, along the graveyard
    // the railings, broken at both ends of the path
    var rail = function (ax, az, bx, bz) {
      var L = Math.hypot(bx - ax, bz - az), n = Math.max(2, Math.round(L / 0.16));
      pkRod(ax, 1.05, az, bx, 1.05, bz, 0.025, X.iron, g, 6); pkRod(ax, 0.25, az, bx, 0.25, bz, 0.025, X.iron, g, 6);
      for (var i = 0; i <= n; i++) { var f = i / n, px = ax + (bx - ax) * f, pz = az + (bz - az) * f; box(0.025, 1.15, 0.025, X.iron, px, 0.58, pz, g); if (i % 2 === 0) { var tip = new THREE.Mesh(cachedGeo('pkdmspear', function () { return new THREE.ConeGeometry(0.03, 0.12, 4); }), X.iron); tip.position.set(px, 1.2, pz); g.add(tip); } }
      solid(Math.min(ax, bx) - 0.08, Math.max(ax, bx) + 0.08, Math.min(az, bz) - 0.08, Math.max(az, bz) + 0.08, 0, 1.2);
    };
    var post = function (x, z) { box(0.38, 1.5, 0.38, X.stone, x, 0.75, z, g); pkHipRoof(0.46, 0.46, 0.35, X.carve, x, 1.5, z, g); solid(x - 0.2, x + 0.2, z - 0.2, z + 0.2, 0, 1.5); };
    rail(x0, z1, -41.3, z1); rail(-39.5, z1, x1, z1); rail(x1, z1, x1, z0); rail(x1, z0, -48.0, z0);   // a gap in front of the tomb
    [[x0, z1], [-41.3, z1], [-39.5, z1], [x1, z1], [x1, z0], [-41.0, z0], [-48.0, z0]].forEach(function (p) { post(p[0], p[1]); });
    // Joseph Charlatan's mausoleum, its doors to the queue
    var mx = -40.4, mz = -35.0, ma = new THREE.Group(); ma.position.set(mx, 0, mz); g.add(ma);
    box(3.6, 0.4, 3.2, X.carveDark, 0, 0.2, 0, ma);
    box(3.0, 3.4, 2.6, X.stoneIn, 0, 2.1, 0, ma);
    [[-1.5, -1.3], [1.5, -1.3], [-1.5, 1.3], [1.5, 1.3]].forEach(function (c) { box(0.42, 3.6, 0.42, X.carve, c[0], 2.2, c[1], ma); pkHipRoof(0.5, 0.5, 0.9, X.carve, c[0], 4.0, c[1], ma); sphere(0.08, X.carve, c[0], 4.95, c[1], ma); });
    var mr = new THREE.Group(); mr.rotation.y = Math.PI / 2; mr.position.y = 3.8; ma.add(mr); pkGableRoof(2.8, 3.2, 1.7, X.slate, X.stoneW, 0, 0, 0, mr, 0.25);
    pkDmFrame(pkDmArch(1.9, 1.9, 3.3), pkDmArch(1.3, 1.8, 2.8), 0.3, X.carve, ma, 0, 0.4, 1.32);
    var md = pkMover(ma, 0, 0.4, 1.28);
    box(1.28, 2.3, 0.1, X.bronze, 0, 1.15, 0, md); box(0.03, 2.3, 0.12, X.black, 0, 1.15, 0, md);
    [-0.3, 0.3].forEach(function (u) { sphere(0.06, X.brass, u, 1.2, 0.07, md); });
    pkFuse(md);
    sign(['JOSEPH CHARLATAN', 'DIRIGENT  *  1876'], 1.9, 0.42, 0, 3.2, 1.33, 0, { bg: 'transparent', fg: '#2b2620' }, ma);
    pkDmKitten(ma, 0.0, 5.55, 0, 0, 0.9);
    solid(mx - 1.8, mx + 1.8, mz - 1.6, mz + 1.6, 0, 4);
    hitBox(1.4, 2.4, 0.5, mx, 1.6, mz + 1.6, { prompt: function () { return 'Knock on the mausoleum door'; }, use: function () { E.shake = 1.0; sfx('door'); toast('Something inside the tomb knocks back...', ''); } });
    E.mdoor = md;
    // his statue, baton raised, on a plinth beside it
    var stx = -36.4, stz = -34.6;
    box(1.1, 1.4, 1.1, X.carve, stx, 0.7, stz, g); box(1.3, 0.2, 1.3, X.carveDark, stx, 1.5, stz, g);
    sign(['J. CHARLATAN'], 0.9, 0.2, stx, 0.9, stz + 0.56, 0, { bg: 'transparent', fg: '#2b2620' }, g);
    var jf = pkDmFigure(X.bronze, { tails: true, hair: true, s: 1.1 }); jf.g.position.set(stx, 1.6, stz); jf.g.rotation.y = 0.4; g.add(jf.g);
    jf.armR.rotation.x = -2.5; jf.armL.rotation.x = -1.2; jf.armL.rotation.z = 0.5; pkRod(0, -0.58, 0, 0, -1.0, 0.12, 0.012, X.bronze, jf.armR, 4);
    solid(stx - 0.6, stx + 0.6, stz - 0.6, stz + 0.6, 0, 3);
    // the graves: rows north of the path and along the railing by the queue, the front ones carrying the musicians' names
    var rnd = pkRng(1876), names = [['A. DUVAL', 'VIOLON'], ['M. ROSIER', 'VIOLONCELLE'], ['E. VAN DAM', 'HARPE'], ['L. BRUNO', 'PIANO'], ['H. KLEIN', 'HAUTBOIS'], ['P. MOREAU', 'TRIANGLE'], ['C. JANSSEN', 'CONTREBASSE']], ni = 0;
    var round = [[-0.3, 0], [0.3, 0], [0.3, 0.68], [0.22, 0.84], [0, 0.9], [-0.22, 0.84], [-0.3, 0.68]];
    var spots = [];
    [-45.1, -44.0, -42.9].forEach(function (gx, i) { spots.push([gx, -35.9], [gx + 0.3, -33.6]); });
    spots.push([-37.75, -36.0], [-34.6, -36.0], [-34.6, -33.4]);
    spots.forEach(function (s, i) {
      var x = s[0] + (rnd() - 0.5) * 0.3, z = s[1] + (rnd() - 0.5) * 0.3, kind = i % 5, tilt = (rnd() - 0.5) * 0.18, ry = (rnd() - 0.5) * 0.25, stoneM = rnd() < 0.5 ? X.carve : X.carveDark;
      var gs = new THREE.Group(); gs.position.set(x, 0, z); gs.rotation.set(0, ry, tilt); g.add(gs);
      if (kind === 0 || kind === 3) pkExtrude(round, 0.15, stoneM, 0, 0, 0, gs, 0.02);
      else if (kind === 1) { pkExtrude(pkDmArch(0.55, 0.65, 1.05), 0.14, stoneM, 0, 0, 0, gs, 0.015); }
      else if (kind === 2) { box(0.12, 1.1, 0.12, stoneM, 0, 0.55, 0, gs); box(0.55, 0.12, 0.12, stoneM, 0, 0.8, 0, gs); }
      else { box(0.32, 1.3, 0.32, stoneM, 0, 0.65, 0, gs); pkHipRoof(0.34, 0.34, 0.4, stoneM, 0, 1.3, 0, gs); }
      box(0.75, 0.1, 1.4, X.soil, x, 0.05, z - 0.8, g);
      if (i % 2 === 0 && ni < names.length && kind !== 2) { var n = names[ni++]; sign([n[0], n[1], '1876'], 0.44, 0.32, 0, 0.45, 0.085, 0, { bg: 'transparent', fg: '#24201b' }, gs); }
      if (i % 6 === 2) { box(0.16, 0.22, 0.16, X.iron, x + 0.35, 0.11, z + 0.05, g); sphere(0.045, X.candle, x + 0.35, 0.16, z + 0.05, g); }
    });
    // dead trees, crows on them, the fountain that squirts
    [[-45.3, -37.0, 7.0, 3], [-33.9, -37.0, 6.4, 4], [-34.6, -29.1, 5.8, 5]].forEach(function (t) { pkDmDeadTree(g, t[0], t[1], t[2], t[3]); solid(t[0] - 0.3, t[0] + 0.3, t[1] - 0.3, t[1] + 0.3, 0, 4); });
    [[-45.0, 5.0, -36.7, 0.5], [-34.1, 4.6, -36.7, 2.2], [-39.8, 5.55, -35.0, -0.4]].forEach(function (c) {
      var cw = new THREE.Group(); cw.position.set(c[0], c[1], c[2]); cw.rotation.y = c[3]; g.add(cw);
      sphere(0.12, X.black, 0, 0.12, 0, cw).scale.set(0.8, 0.9, 1.4); sphere(0.07, X.black, 0, 0.24, 0.13, cw);
      var bk = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.09, 4), X.black); bk.rotation.x = Math.PI / 2; bk.position.set(0, 0.23, 0.22); cw.add(bk);
      box(0.12, 0.03, 0.2, X.black, 0, 0.1, -0.2, cw);
    });
    var fx = -42.5, fz = -29.2;
    pkLathe([[0, 0], [0.5, 0], [0.5, 0.15], [0.42, 0.2], [0.2, 0.3], [0.2, 0.75], [0.45, 0.8], [0.5, 0.95], [0.4, 0.95], [0, 0.9]], X.carve, fx, 0, fz, g, 16);
    box(0.3, 1.5, 0.3, X.carveDark, fx + 0.42, 0.75, fz, g); sphere(0.14, X.carve, fx + 0.42, 1.55, fz, g);
    pkRod(fx + 0.4, 1.3, fz, fx + 0.15, 1.25, fz, 0.03, X.brass, g, 6);
    solid(fx - 0.5, fx + 0.6, fz - 0.5, fz + 0.5, 0, 1.2);
    hitBox(1.0, 1.2, 1.0, fx, 0.7, fz, { prompt: function () { return 'Drink from the fountain'; }, use: function () { burst(fx + 0.1, 1.25, fz, 0x9fd8ff, 40, 'up'); burst(fx - 0.4, 1.0, fz, 0x9fd8ff, 30, 'up'); sfx('click'); toast('The fountain squirts you right in the face!', ''); } });
  }
  // the ruined cloister (de Kruysgang) south of the queue: an arcade of pointed arches on columns, two of them fallen, a
  // broken back wall with its blind arches, and the herb garden (de Kruydentuyn) with its tombstone labels
  function pkDmCloister(g) {
    var X = pkDmM(), z = -19.15, xs = [], i;
    box(10.4, 0.04, 6.9, X.gravel, -41.0, 0.02, -16.05, g);
    for (i = 0; i < 8; i++) xs.push(-45.3 + i * 1.25);
    xs.forEach(function (x, k) {
      var h = k === 5 ? 1.1 : 2.3;
      box(0.42, 0.3, 0.42, X.carveDark, x, 0.15, z, g); cyl(0.14, h, X.carve, x, 0.3 + h / 2, z, g, 10);
      if (k !== 5) box(0.38, 0.2, 0.38, X.carve, x, 2.7, z, g);
      solid(x - 0.22, x + 0.22, z - 0.22, z + 0.22, 0, 2.6);
    });
    for (i = 0; i < xs.length - 1; i++) {
      if (i === 2 || i === 4 || i === 5) continue;
      var arc = pkDmArchCurve(1.25, 0, 0.75, 2.8).map(function (p) { return [xs[i] + 0.625 + p[0], p[1], z]; });
      pkTube(arc, 0.11, X.carve, g, false, 24, 6);
      box(1.25, 0.32, 0.36, X.stone, xs[i] + 0.625, 3.75, z, g);
    }
    for (i = 0; i < 9; i++) pkBoulder(-40.3 + (i % 3) * 0.6 - 1.0, -18.4 + Math.floor(i / 3) * 0.45, 0.2 + (i % 2) * 0.12, g, 0.3);
    // the back wall: its top broken to different heights, blind arches along it
    var bz = -12.8, rnd = pkRng(99);
    for (var bx = -45.8; bx < -36.2; bx += 1.2) {
      var hh = 1.4 + rnd() * 2.6;
      box(1.22, hh, 0.6, X.stone, bx + 0.6, hh / 2, bz, g);
      if (hh > 2.6) pkDmFrame(pkDmArch(0.9, 1.3, 2.1), pkDmArch(0.66, 1.25, 1.9), 0.08, X.carve, g, bx + 0.6, 0.3, bz - 0.33);
    }
    solid(-45.8, -36.2, bz - 0.3, bz + 0.3, 0, 3);
    pkDmIvy(g, -43.2, 0.2, bz - 0.32, 3.4, 2.2, 0, -1, 34);
    // the herb garden: raised beds, the herbs, labels shaped like headstones
    [-44.2, -40.8, -37.4].forEach(function (x, k) {
      box(2.6, 0.32, 1.5, X.carveDark, x, 0.16, -15.9, g); box(2.4, 0.06, 1.3, X.soil, x, 0.33, -15.9, g);
      for (var h = 0; h < 14; h++) { var hx = x - 1.0 + (h % 7) * 0.33, hz = -16.3 + Math.floor(h / 7) * 0.7; sphere(0.15 + (h % 3) * 0.04, X.herbs[(h + k) % 4], hx, 0.42, hz, g).scale.set(1, 0.8, 1); }
      for (var lb = 0; lb < 3; lb++) pkExtrude([[-0.08, 0], [0.08, 0], [0.08, 0.14], [0, 0.2], [-0.08, 0.14]], 0.03, X.bone, x - 0.8 + lb * 0.8, 0.34, -15.12, g, 0);
      solid(x - 1.3, x + 1.3, -16.65, -15.15, 0, 0.5);
    });
  }
  // the entry, where the queue begins at the street end: two stone pillars, a monk on one and the black kitten on the other,
  // an iron arch between them with the ride's name, and a lantern on each
  function pkDmPortal(g) {
    var X = pkDmM(), x = -37.3, zs = [-28.55, -26.05];
    zs.forEach(function (z, k) {
      box(1.2, 0.5, 1.2, X.carveDark, x, 0.25, z, g); box(1.0, 2.8, 1.0, X.stone, x, 1.9, z, g); box(1.2, 0.3, 1.2, X.carve, x, 3.45, z, g);
      solid(x - 0.55, x + 0.55, z - 0.55, z + 0.55, 0, 3.6);
      pkRod(x + 0.5, 2.7, z, x + 0.85, 2.8, z, 0.03, X.iron, g, 6); box(0.18, 0.28, 0.18, X.candle, x + 0.85, 2.6, z, g); pkHipRoof(0.26, 0.26, 0.18, X.iron, x + 0.85, 2.74, z, g);
      if (k === 0) { var mk = pkDmFigure(X.carve, { robe: true, s: 0.85 }); mk.g.position.set(x, 3.6, z); mk.g.rotation.y = Math.PI / 2; g.add(mk.g); mk.armL.rotation.x = mk.armR.rotation.x = -0.8; }
      else pkDmKitten(g, x, 3.6, z, Math.PI / 2, 1.3);
    });
    var arc = pkDmArchCurve(2.5, 0, 1.4, 3.6).map(function (p) { return [x, p[1], -27.3 + p[0]]; });
    pkTube(arc, 0.05, X.iron, g, false, 30, 6);
    pkTube(pkDmArchCurve(2.2, 0, 1.15, 3.6).map(function (p) { return [x, p[1], -27.3 + p[0]]; }), 0.03, X.iron, g, false, 30, 6);
    sign(['DANSE MACABRE'], 2.0, 0.4, x + 0.06, 4.3, -27.3, Math.PI / 2, { bg: '#1b232c', fg: '#ff8a3d' }, g);
    sign(['DANSE MACABRE'], 2.0, 0.4, x - 0.06, 4.3, -27.3, -Math.PI / 2, { bg: '#1b232c', fg: '#ff8a3d' }, g);
  }

  // ── Sounds ───────────────────────────────────────────────────────
  // the show's own: thunder, the kitten, Death's fiddle tuned to the devil's interval, a bar of the waltz (the bass, the chords
  // and the xylophone's bones), the monk choir, and "Vade retro"
  SFX.pkDanseThunder = function (t) { sNoise(t, 1.8, 0.4, { type: 'lowpass', freq: 420, fade: true }); sNoise(t, 0.2, 0.22, { type: 'highpass', freq: 1800, fade: true }); sTone('sine', 58, t, 1.6, 0.14, { f1: 32 }); };
  SFX.pkDanseGrowl = function (t) { sTone('sawtooth', 92, t, 1.1, 0.05, { f1: 66, lp: 380 }); sNoise(t, 1.1, 0.05, { type: 'lowpass', freq: 300, shape: 'swell' }); };
  SFX.pkDanseMeow = function (t) { sTone('sine', 650, t, 0.28, 0.06, { f1: 1050 }); sTone('sine', 1050, t + 0.26, 0.42, 0.05, { f1: 520 }); sTone('triangle', 1300, t + 0.05, 0.5, 0.012, { f1: 900 }); };
  SFX.pkDanseFiddle = function (t) { [0, 0.55, 1.1].forEach(function (d) { sTone('sawtooth', 880, t + d, 0.46, 0.03, { lp: 3200 }); sTone('sawtooth', 622.25, t + d, 0.46, 0.03, { lp: 3200 }); }); };
  SFX.pkDanseWaltz = function (t, o) {
    var n = (o && o.n) || 0, mel = [[392, 392, 392], [392, 370, 392], [466, 440, 392], [349, 392, 466]][n % 4], bass = [98, 98, 117, 87][n % 4];
    sTone('triangle', bass, t, 0.55, 0.08);
    [0.6, 1.2].forEach(function (b) { sTone('triangle', bass * 2.5, t + b, 0.25, 0.03); sTone('triangle', bass * 3, t + b, 0.25, 0.026); });
    mel.forEach(function (f, i) { sTone('sawtooth', f, t + i * 0.6, 0.56, 0.026, { lp: 2400 }); sTone('sine', f * 4, t + i * 0.6 + 0.3, 0.07, 0.022); });
  };
  SFX.pkDanseChoir = function (t) { [196, 233, 294, 392].forEach(function (f, i) { sTone('sine', f, t + i * 0.05, 3.4, 0.03, { attack: 0.9 }); sTone('sawtooth', f, t, 3.4, 0.01, { attack: 1.0, lp: 900 }); }); };
  SFX.pkDanseVade = function (t) { [65, 98, 131].forEach(function (f) { sTone('sawtooth', f, t, 2.4, 0.05, { lp: 520, attack: 0.15 }); }); sNoise(t, 1.2, 0.25, { type: 'lowpass', freq: 200, fade: true }); };

  // ── The show ─────────────────────────────────────────────────────
  // the beats, in seconds: 0 lightning on the crate, 1 blackout and the kitten's growl, 3 the organ lights, 6 its middle
  // turns to show Joseph, 8 the waltz (the floor turns, rises and sways), 30 the intermezzo (all stops, a lone fiddle), 36
  // the build (faster, higher, the orchestra lit in the roses), 50 the scrims clear on the choir, 54 the climax at full
  // height ("Vade retro"), 57 lightning and the 3 m drop, 58.5 the end: the ghosts gone, the kitten mews.
  var PK_DM_BEATS = [0, 1, 3, 6, 8, 30, 36, 50, 54, 57, 58.5];
  function pkDmNear() { return typeof player !== 'undefined' && player && Math.hypot(player.x - PK_DM.CX, player.z - PK_DM.CZ) < 28; }
  function pkDmEase(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
  function pkDmTick(a, dt) {
    var D = PK_DM, E = a.extra, X = pkDmM(), t = a.t, run = a.state === 'running';
    E.clock += dt;
    var ck = E.clock, near = Math.hypot(player.x - D.CX, player.z - D.CZ) < 28;
    // the flames and the mist whatever the ride is doing; the mausoleum door when knocked on
    X.flame.emissiveIntensity = 1.5 + Math.sin(ck * 17) * 0.2 + Math.sin(ck * 7.3) * 0.25;
    X.candle.emissiveIntensity = 1.2 + Math.sin(ck * 11 + 1) * 0.15;
    E.mist.forEach(function (m, i) { m.o.position.x = m.x + Math.sin(ck * 0.09 + i * 1.7) * 1.4; m.o.position.z = m.z + Math.cos(ck * 0.07 + i * 2.3) * 1.1; m.o.material.opacity = (0.22 + Math.sin(ck * 0.3 + i) * 0.08) * (E.mistOn ? 1 : 0); });
    if (E.shake > 0) { E.shake -= dt; E.mdoor.position.x = Math.sin(E.shake * 70) * 0.02 * Math.min(1, E.shake * 2); if (E.shake <= 0) E.mdoor.position.x = 0; }
    // where each part of the show wants to be at this moment
    var h = 0, tiltA = 0, spinW = 0, stallW = 0, room = 0.9, flash = 0, organ = 0, josephT = 0, orch = 0, choir = 0, eyes = 0.5, beat = -1;
    if (run) {
      for (var b = 0; b < PK_DM_BEATS.length; b++) if (t >= PK_DM_BEATS[b]) beat = b;
      var lilt = Math.sin(t * Math.PI * 2 / 1.8);
      if (t < 1) { room = 0.4; flash = (t < 0.12 || (t > 0.28 && t < 0.38) || (t > 0.6 && t < 0.66)) ? 9 : 0; }
      else if (t < 3) { room = 0.06; eyes = 2.4; }
      else if (t < 8) { room = 0.18; organ = pkDmEase((t - 3) / 1.5); spinW = 0.25; josephT = pkDmEase((t - 6) / 1.6); eyes = 1.0; }
      else if (t < 30) { room = 0.5 + lilt * 0.12; organ = 1; josephT = 1; h = pkDmEase((t - 8) / 6) * 1.4 + lilt * 0.22 * pkDmEase((t - 9) / 3); tiltA = 0.12 * pkDmEase((t - 9) / 4); spinW = 0.5 + 0.22 * lilt; stallW = 1.1 * Math.sin(t * Math.PI * 2 / 3.6) * pkDmEase((t - 9) / 3); }
      else if (t < 36) { room = 1.0; organ = 0.6; josephT = 1; h = 1.4 - pkDmEase((t - 30) / 3) * 0.6; tiltA = 0.12 * (1 - pkDmEase((t - 30) / 2.5)); spinW = 0; }
      else if (t < 50) { room = 0.45 + Math.max(0, Math.sin(t * 5.2)) * 0.3; organ = 1; josephT = 1; orch = pkDmEase((t - 36.5) / 4); h = 0.8 + pkDmEase((t - 36) / 6) * 1.3 + lilt * 0.25; tiltA = 0.2 * pkDmEase((t - 36) / 3); spinW = 0.95; stallW = 1.5 * pkDmEase((t - 37) / 3); }
      else if (t < 54) { room = 0.35; organ = 1; josephT = 1; orch = 1; choir = pkDmEase((t - 50) / 2); h = 2.2; tiltA = 0.12; spinW = 0.6; stallW = 0.9; }
      else if (t < 57) { room = 0.12; organ = 0.8; josephT = 1; orch = 1; choir = 1; h = 2.2 + pkDmEase((t - 54) / 2.2) * (D.RISE - 2.2); tiltA = 0.06 * (1 - pkDmEase((t - 54) / 2)); spinW = 0.3; }
      else if (t < 58.5) { var fd = (t - 57) / 0.65; room = 0.08; flash = (t < 57.2 || (t > 57.35 && t < 57.45)) ? 9 : 0; organ = 0.4; josephT = 1; orch = 1 - fd; choir = 1; h = fd < 1 ? D.RISE * (1 - fd * fd) : Math.abs(Math.sin((t - 57.65) * 6)) * 0.12 * (1 - (t - 57.65) / 0.85); spinW = 0; eyes = 1.5; }
      else { room = 0.3 + pkDmEase((t - 58.5) / 1.2) * 0.6; eyes = 2.6; }
    }
    // what the cabin's show switches override: the lift and the turntables off, the house lights up
    if (!E.liftOn) { h = 0; tiltA = 0; }
    if (!E.turnOn) stallW = 0;
    if (E.house) room = Math.max(room, 1.15);
    // the exit doors open while the riders get off, or while the switch holds them
    var exitWant = (a.state === 'unloading' || E.exitHold) ? 1 : 0;
    E.exitDoors.forEach(function (d) { d.want = exitWant; d.open += (exitWant - d.open) * Math.min(1, dt * 2.2); d.hinge.rotation.y = d.closedRy + d.openDelta * d.open; });
    // the floor: its height eased (except in the drop, which is the point), the sway, the turn
    var k = Math.min(1, dt * 3);
    E.h = (run && t >= 57 && t < 58.5) ? h : E.h + (h - E.h) * k;
    E.tiltA += (tiltA - E.tiltA) * Math.min(1, dt * 1.5);
    E.spinW += (spinW - E.spinW) * Math.min(1, dt * 1.2);
    E.lift.position.y = E.h;
    E.tilt.rotation.x = E.tiltA * Math.sin(ck * Math.PI * 2 / 3.6); E.tilt.rotation.z = E.tiltA * Math.cos(ck * Math.PI * 2 / 3.6) * 0.8;
    E.spin.rotation.y += E.spinW * dt;
    // each stall on its turntable: back and forth in the waltz, round and round in the build, alternate stalls the other
    // way; at rest they come back round to face the crate for boarding
    E.stallW += (stallW - E.stallW) * Math.min(1, dt * 1.6);
    if (run && t < 54) E.stallA += E.stallW * dt;
    else { var home = Math.round(E.stallA / (Math.PI * 2)) * Math.PI * 2; E.stallA += (home - E.stallA) * Math.min(1, dt * 0.9); }
    for (var si = 0; si < E.stalls.length; si++) E.stalls[si].o.rotation.y = E.stalls[si].base + (si % 2 ? -1 : 1) * E.stallA;
    E.crypt.position.y = -1.8 + pkDmEase((E.h - 0.6) / 1.4) * 1.8;
    X.undead.emissiveIntensity = pkDmEase((E.h - 1.2) / 1.2) * 0.9;
    // the room and its lights
    E.room += (room - E.room) * Math.min(1, dt * 4);
    if (E.mflash > 0) { E.mflash -= dt; flash = 9; }   // the console's LIGHTNING cue
    E.roomLight.intensity = E.room * 1.6; E.flash.intensity = flash; E.candleK = 0.35 + E.room * 0.9;
    X.candle.emissiveIntensity *= E.candleK;
    E.organ += (organ - E.organ) * Math.min(1, dt * 2.5);
    X.organGlow.emissiveIntensity = 0.1 + E.organ * 1.4; E.organLight.intensity = E.organ * 2.4;
    // Joseph: the organ's middle turns round, and he conducts while he is out
    E.jo += (josephT - E.jo) * Math.min(1, dt * 2.2);
    E.organMid.rotation.y = E.jo * Math.PI;
    X.ghostJ.emissiveIntensity = E.jo * (1.2 + Math.sin(ck * 3) * 0.2);
    E.jArm.rotation.x = -2.2 + (run && t > 8 && t < 57 ? Math.sin(t * Math.PI * 2 / 0.6) * 0.45 : 0);
    E.jArm.rotation.z = run && t > 8 && t < 57 ? Math.sin(t * Math.PI * 2 / 1.8) * 0.35 : 0;
    E.ghostLight.intensity = Math.max(E.jo * 0.8, orch * 1.6, choir * 1.2);
    // the orchestra in the roses, the choir behind the scrims
    E.orch += (orch - E.orch) * Math.min(1, dt * 2);
    X.roseIn.emissiveIntensity = 0.12 + E.orch * 1.5; X.ghostO.emissiveIntensity = E.orch * 1.3; X.ghostO.opacity = E.orch * 0.85;
    E.choir += (choir - E.choir) * Math.min(1, dt * 2);
    X.scrim.opacity = 0.96 - E.choir * 0.84; X.monk.emissiveIntensity = E.choir * 0.7;
    E.eyes += (eyes - E.eyes) * Math.min(1, dt * 3);
    X.eye.emissiveIntensity = E.eyes * (Math.sin(ck * 0.7) > 0.97 ? 0.1 : 1);
    // what the desk reads (part 14): the floor's height, its tilt and the beat
    E.show.h = E.h + 1.3; E.show.tilt = E.tiltA * 180 / Math.PI; E.show.beat = beat;
    // the lightning's smoke, and the sounds, each once a cycle (heard only near the abbey)
    if (!run) return;
    var cue = function (id, at, fn) { if (t >= at && !E.cues[id]) { E.cues[id] = true; fn(); } };
    var play = function (s, o) { if (near) sfx(s, o); };
    cue('l0', 0, function () { burst(D.CX, 1.9, D.CZ, 0xdfe8ff, 40, 'smoke'); play('pkDanseThunder'); });
    cue('gr', 1.0, function () { play('pkDanseGrowl'); });
    cue('or', 3.0, function () { play('pkDanseOrgan'); });
    cue('fi', 6.2, function () { play('pkDanseFiddle'); });
    cue('in', 30.5, function () { play('pkDanseFiddle'); });
    cue('ch', 50.0, function () { play('pkDanseChoir'); });
    cue('va', 54.0, function () { play('pkDanseVade'); });
    cue('l1', 57.0, function () { burst(D.CX, 3.4, D.CZ, 0xdfe8ff, 50, 'smoke'); play('pkDanseThunder'); });
    cue('me', 58.8, function () { play('pkDanseMeow'); });
    if ((t >= 8 && t < 30) || (t >= 36 && t < 50)) { var bar = Math.floor((t - 8) / 1.8); if (bar !== E.bar) { E.bar = bar; play('pkDanseWaltz', { n: bar }); } }
  }

  // ── A built-in operator room ─────────────────────────────────────
  // The working kit of a control room (the desk with the ride's own panel, the cabinet, the hanging monitors, the clocks,
  // the key box, the chair, the lights and their switch, the status board, the stack lamp) without the glazed cabin round
  // it, for a ride whose room is built into its own building in its own style (Danse Macabre's sacristy, Droomvlucht's
  // booth in the U). o: { x, z, y, ry, W, D, H, cab (-1 or 1: the side wall the cabinet stands on) or cabBack (on the back wall), sw: [x, z, ry] the light
  // switch by the door, mon: [x, y, z, ry] the monitors, stack: false to leave the lamp off }. In the room's own frame local
  // -z is the window the operator looks out of over the desk, +z the back wall.
  function pkRoomKit(g, a, o) {
    var R = new THREE.Group(); R.position.set(o.x, o.y || 0, o.z); R.rotation.y = o.ry || 0; g.add(R);
    var W = o.W, D = o.D, H = o.H || 2.9, c = o.cab || -1;
    var con = new THREE.Group(); con.position.set(0, 0.12, -D / 2 + 0.5); R.add(con);
    if (o.console) pkRideConsole(a, con, o.console); else { pkBkDesk(con, 2.1); pkBoothPanel(a, con); }   // a ride with its own console (part 50)
    pkLocalSolid(R, -1.14, 1.14, -D / 2 + 0.05, -D / 2 + 0.88, 0, 0.95);
    var k = new THREE.Group(); k.position.set(0, 0.12, 0); R.add(k);
    if (o.cabBack) { var cb = o.cabAt || [-W / 2 + 0.55, 1.42]; pkBkCabinet(a, k, cb[0], cb[1], D / 2 - 0.2, Math.PI); pkLocalSolid(R, cb[0] - 0.45, cb[0] + 0.45, D / 2 - 0.45, D / 2, 0, 2.0); }   // against the back wall
    else { pkBkCabinet(a, k, c * (W / 2 - 0.17), 1.42, 0.2, -c * Math.PI / 2); pkLocalSolid(R, Math.min(c * W / 2, c * (W / 2 - 0.36)), Math.max(c * W / 2, c * (W / 2 - 0.36)), -0.3, 0.7, 0, 2.0); }
    var m = o.mon || [0, 1.95, -D / 2 + 0.36, 0];
    pkBkMonitors(a, k, m[0], m[1], m[2], m[3], 0.32);
    var cl = o.clock || [-1.15, 2.2], tc = o.tc || [1.2, 1.5], kb = o.key || [-1.2, 2.05];
    pkBkClock(k, cl[0], cl[1], D / 2 - 0.09, Math.PI, 0.14);
    a.boothClock = pkBkTimeClock(k, tc[0], tc[1], D / 2 - 0.08, Math.PI, a.id, a.name);
    pkBkKeyBox(k, kb[0], kb[1], D / 2 - 0.08, Math.PI);
    pkBkChair(k, 0.1, -D / 2 + 1.2, Math.PI, 0);
    var bat = pkBkBatten(k, 0, H - 0.17, 0.2, 0, 1.4);
    a.boothLights = pkBkLights(a.id, k, [bat], 0, H - 0.5, 0.2);
    a.boothLights.setPower(!!a.open);
    if (o.sw) pkBkSwitch(k, o.sw[0], o.sw[3] || 1.2, o.sw[1], o.sw[2], a.boothLights, a.name);
    if (o.stack !== false) pkBkStack(a, k, -c * 1.3, H + 0.02, 0.9);
    var screen = touchScreen({
      w: 380, h: 320, pw: 0.94, ph: 0.80, x: 0, y: 1.62, z: D / 2 - 0.1, ry: Math.PI, parent: R, title: a.name,
      draw: function (ctx, sc) {
        var C = pkCtl(a), waiting = pkAttrWaiting(a);
        scBg(ctx, sc.w, sc.h);
        scHead(ctx, sc.w, a.name.toUpperCase(), pkBoothStatus(a, C));
        scText(ctx, 16, 62, 'ON RIDE', '#a0acb8'); scText(ctx, 16, 88, a.riders + ' / ' + a.seats.length, a.riders ? '#5fd38d' : '#eef1f5');
        scText(ctx, 200, 62, 'QUEUE', '#a0acb8'); scText(ctx, 200, 88, String(waiting), waiting ? '#f0c04a' : '#eef1f5');
        scText(ctx, 16, 122, 'GATES  ' + (C.gates ? 'OPEN' : 'CLOSED'), C.gates ? '#5fd38d' : '#a0acb8');
        scText(ctx, 16, 152, 'RESTRAINTS  ' + (C.barsWant > 0.5 ? 'DOWN' : 'UP'), C.barsWant > 0.5 ? '#5fd38d' : '#a0acb8');
        scText(ctx, 16, 182, 'AUTO  ' + (C.auto ? 'ON' : 'OFF'), C.auto ? '#5fd38d' : '#a0acb8');
        scText(ctx, 16, 212, 'CYCLE  ' + a.run.toFixed(1) + 's', '#eef1f5');
        scText(ctx, 16, 242, 'CONTROL ROOM  ' + (C.fault ? 'RESET' : (C.maint ? 'MAINT' : 'READY')), C.fault || C.maint ? '#ff6b5e' : '#8f98a4');
        scText(ctx, 16, 272, 'WAIT  ' + pkBkWait(a) + ' MIN', '#eef1f5');
      }
    });
    pkPowerScreen(screen, function () { return !!a.open; });
    var anchor = new THREE.Group(); anchor.position.copy(R.position); g.add(anchor);   // in the building's frame, where the room is
    a.booth = anchor; a.boothScreen = screen;
    return R;
  }
  // a door of the room's own making that works and blocks like the booths' doors (part 17): a leaf built by the caller
  // on a hinge group, swinging openDelta on E
  function pkRoomDoor(hinge, w, h, openDelta, label, a) {
    var d = { hinge: hinge, w: w, closedRy: hinge.rotation.y, openDelta: openDelta, open: 0, want: 0, label: label,
      setNow: function (v) { d.want = d.open = v ? 1 : 0; hinge.rotation.y = d.closedRy + d.openDelta * d.open; } };
    hitBox(0.3, h, w, 0.05, h / 2, w / 2, { prompt: function () { return (d.want > 0.5 ? 'Shut ' : 'Open ') + label; }, use: function () { d.want = d.want > 0.5 ? 0 : 1; sfx('door'); } }, hinge);
    pkCtlLive({ tick: function (dt) { var k = d.open + (d.want - d.open) * Math.min(1, dt * 3); if (Math.abs(k - d.open) > 1e-4) { d.open = k; hinge.rotation.y = d.closedRy + d.openDelta * k; } } });
    PK_BK_DOORS.push(d);
    if (a) a.boothDoor = d;
    return d;
  }

  // ── The sacristy ─────────────────────────────────────────────────
  // the operator's room, built into the lower range behind the chapel's south wall: flagstones, oak panelling to the dado
  // with the stone above, an oak-beamed ceiling, a candle sconce and a tapestry of the Danse; the barred spyhole looks
  // onto the stage over the desk, and the way in is the secret door from the hall
  function pkDmSacristy(g, a) {
    var X = pkDmM(), x0 = -57.2, x1 = -52.2, z0 = -20.0, z1 = -15.9, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, H = 3.3;
    box(x1 - x0, 0.12, z1 - z0, X.flags, cx, 0.06, cz, g);
    box(x1 - x0, 0.14, z1 - z0, X.oakDark, cx, H + 0.07, cz, g);
    for (var b = 0; b < 4; b++) box(0.18, 0.24, z1 - z0, X.oak, x0 + 0.6 + b * 1.25, H - 0.12, cz, g);
    var panel = function (ax, az, bx, bz, nx, nz) {
      var L = Math.hypot(bx - ax, bz - az), mx = (ax + bx) / 2 + nx * 0.03, mz = (az + bz) / 2 + nz * 0.03, ry = Math.atan2(bx - ax, bz - az) + Math.PI / 2;
      box(L, H - 1.15, 0.04, X.stoneIn, mx, 1.15 + (H - 1.15) / 2, mz, g).rotation.y = ry;
      box(L, 1.05, 0.06, X.oakDark, mx + nx * 0.01, 0.65, mz + nz * 0.01, g).rotation.y = ry;
      box(L, 0.08, 0.1, X.oak, mx + nx * 0.03, 1.18, mz + nz * 0.03, g).rotation.y = ry;
    };
    panel(x0, z0, x0, z1, 1, 0); panel(x0, z1, x1, z1, 0, -1);
    panel(x0, z0, -55.6, z0, 0, 1); panel(-53.8, z0, x1, z0, 0, 1);
    // a sconce each side of the spyhole, the tapestry on the west wall
    [-56.3, -53.1].forEach(function (x) { pkRod(x, 2.2, z0 + 0.05, x, 2.2, z0 + 0.3, 0.02, X.iron, g, 4); cyl(0.05, 0.12, X.iron, x, 2.25, z0 + 0.3, g, 8); sphere(0.05, X.flame, x, 2.36, z0 + 0.3, g).scale.set(0.8, 1.6, 0.8); });
    var tp = tex(128, 192, function (c, w, h) { c.fillStyle = '#3a0f18'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c9a050'; c.lineWidth = 4; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#d8d0b8'; for (var k = 0; k < 3; k++) { var x = 30 + k * 34, y = 120 - (k % 2) * 16; c.beginPath(); c.arc(x, y - 30, 7, 0, 6.3); c.fill(); c.fillRect(x - 3, y - 22, 6, 26); c.fillRect(x - 12, y - 18 + k * 4, 24, 3); } c.fillStyle = '#0c0c0f'; c.beginPath(); c.arc(64, 160, 9, 0, 6.3); c.fill(); }, 1, 1);
    var tap = box(0.02, 1.4, 0.95, std({ map: tp, roughness: 0.9 }), x0 + 0.06, 2.1, -16.8, g);
    pkRoomKit(g, a, { x: cx, z: cz, y: 0, ry: 0, W: x1 - x0, D: z1 - z0, H: H, cab: -1, sw: [(x1 - x0) / 2 - 0.08, 0.85, -Math.PI / 2], mon: [-1.55, 2.0, -1.25, 0.55], stack: false, console: 'danse' });
    if (PK_DM.secret) a.boothDoor = PK_DM.secret;
  }

  // ── The cabin's extras ───────────────────────────────────────────
  // the show's own switches, on a panel on the cabin's back wall under the key box: the exit doors held open, the house
  // lights up (to walk the chapel), the stalls' turntables, the lift, and the graveyard mist
  function pkDmSwitches(g, a) {
    var E = a.extra, X = pkDmM(), p = new THREE.Group(); p.position.set(-57.14, 1.3, -19.15); p.rotation.y = Math.PI / 2; g.add(p);
    pkCtlSetPower(p, function () { return !!a.open; });
    box(0.8, 0.52, 0.03, X.oakDark, 0, 0, -0.016, p);
    box(0.84, 0.03, 0.05, X.gold, 0, 0.27, -0.01, p); box(0.84, 0.03, 0.05, X.gold, 0, -0.27, -0.01, p);
    sign(['SHOW SWITCHES'], 0.56, 0.07, 0, 0.19, 0.002, 0, { bg: 'transparent', fg: '#d8b45a' }, p);
    [['EXIT DOORS', 'exitHold', 'HELD OPEN', 'AUTO'], ['HOUSE LIGHTS', 'house', 'UP', 'SHOW'], ['TURNTABLES', 'turnOn', 'ON', 'OFF'], ['LIFT', 'liftOn', 'ON', 'OFF'], ['MIST', 'mistOn', 'ON', 'OFF']].forEach(function (d, i) {
      var x = -0.3 + i * 0.15;
      pkCtlToggle(p, x, 0.02, { id: 'dm-' + d[1], on: !!E[d[1]], prompt: d[0], onName: d[2], offName: d[3], act: function (want) { E[d[1]] = want; sfx('click'); return true; } });
      sign([d[0]], 0.145, 0.045, x, -0.11, 0.002, 0, { bg: 'transparent', fg: '#e8e0cc' }, p);
    });
  }
  // the third screen, hung to the operator's right: the stage seen three ways at once, the floor turning in plan with every
  // stall on it, each stall's own turn on a dial, and the lift and tilt from the side
  var PK_DM_BEAT_NAMES = ['LIGHTNING', 'BLACKOUT', 'THE ORGAN', 'JOSEPH', 'THE WALTZ', 'INTERMEZZO', 'CRESCENDO', 'THE CHOIR', 'VADE RETRO', 'THE DROP', 'THE END'];
  var PK_DM_V = new THREE.Vector3(), PK_DM_V2 = new THREE.Vector3();
  function pkDmStageDraw(a, c, s) {
    var E = a.extra, D = PK_DM, W = s.w, H = s.h, green = '#8fe0a0', dim = 'rgba(143,224,160,0.32)', amber = '#f0c04a';
    c.fillStyle = '#060c09'; c.fillRect(0, 0, W, H);
    c.font = 'bold 13px monospace'; c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.fillStyle = green;
    c.fillText('CAM 3  STAGE MOTION', 8, 16);
    c.textAlign = 'right'; c.fillStyle = a.state === 'running' ? amber : green;
    c.fillText(a.state === 'running' ? PK_DM_BEAT_NAMES[Math.max(0, E.show.beat)] + '  ' + Math.floor(a.t) + 's' : a.state.toUpperCase(), W - 8, 16);
    var panes = [[6, 24, 156, 222, 'PLAN  FLOOR'], [166, 24, 120, 222, 'STALLS'], [290, 24, 124, 222, 'LIFT  TILT']];
    c.lineWidth = 1; c.font = '10px monospace'; c.textAlign = 'left';
    panes.forEach(function (p) { c.strokeStyle = dim; c.strokeRect(p[0], p[1], p[2], p[3]); c.fillStyle = green; c.fillText(p[4], p[0] + 5, p[1] + 13); });
    // 1: the floor in plan, a mark on its rim so the turn shows, every stall where it is and the way it faces (its front
    // edge in amber, filled when someone sits in it)
    var px = 84, py = 140, R = 66, k = R / 5.6, th = E.spin.rotation.y;
    c.strokeStyle = green; c.lineWidth = 1.5; c.beginPath(); c.arc(px, py, R, 0, 6.283); c.stroke();
    c.fillStyle = amber; c.beginPath(); c.arc(px + Math.cos(th) * R, py - Math.sin(th) * R, 4, 0, 6.283); c.fill();
    c.fillStyle = dim; c.beginPath(); c.arc(px, py, 9, 0, 6.283); c.fill();
    E.stalls.forEach(function (st, i) {
      st.o.getWorldPosition(PK_DM_V); PK_DM_V2.set(0, 0, 1); st.o.localToWorld(PK_DM_V2); PK_DM_V2.sub(PK_DM_V);
      var sx = px + (PK_DM_V.x - D.CX) * k, sy = py + (PK_DM_V.z - D.CZ) * k, full = false;
      for (var q = 0; q < a.seats.length; q++) if (a.seats[q].par === st.o && a.seats[q].guest) { full = true; break; }
      c.save(); c.translate(sx, sy); c.rotate(Math.atan2(-PK_DM_V2.x, PK_DM_V2.z));
      c.fillStyle = full ? 'rgba(240,192,74,0.55)' : 'rgba(143,224,160,0.12)'; c.fillRect(-15, -8.5, 30, 17);
      c.strokeStyle = green; c.lineWidth = 1.2; c.strokeRect(-15, -8.5, 30, 17);
      c.strokeStyle = amber; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-13, 8.5); c.lineTo(13, 8.5); c.stroke();
      c.restore();
      c.fillStyle = green; c.font = '9px monospace'; c.textAlign = 'center'; c.fillText(String(i + 1), sx, sy + 3);
    });
    // 2: each stall's own turn on the floor, a dial apiece
    E.stalls.forEach(function (st, i) {
      var cx = 196 + (i % 2) * 60, cy = 68 + Math.floor(i / 2) * 64, turn = (i % 2 ? -1 : 1) * E.stallA, deg = ((turn * 180 / Math.PI) % 360 + 360) % 360;
      c.strokeStyle = dim; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, 20, 0, 6.283); c.stroke();
      for (var tk = 0; tk < 8; tk++) { var ta = tk / 8 * 6.283; c.beginPath(); c.moveTo(cx + Math.cos(ta) * 17, cy + Math.sin(ta) * 17); c.lineTo(cx + Math.cos(ta) * 20, cy + Math.sin(ta) * 20); c.stroke(); }
      c.strokeStyle = amber; c.lineWidth = 2.5; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(turn) * 17, cy - Math.cos(turn) * 17); c.stroke();
      c.fillStyle = green; c.font = '9px monospace'; c.textAlign = 'center'; c.fillText('S' + (i + 1) + ' ' + Math.round(deg) + ' DEG', cx, cy + 32);
    });
    // 3: the lift and the tilt from the side: the chapel floor, the ram, the floor and its stalls at their height and angle
    var gx = 356, gy = 222, km = 40, hh = E.h, roll = E.tilt.rotation.z;
    c.strokeStyle = dim; c.lineWidth = 1; c.beginPath(); c.moveTo(296, gy); c.lineTo(408, gy); c.stroke();
    c.fillStyle = green; c.font = '9px monospace'; c.textAlign = 'right';
    for (var m = 0; m <= 3; m++) { var my = gy - 6 - m * km; c.strokeStyle = dim; c.beginPath(); c.moveTo(300, my); c.lineTo(306, my); c.stroke(); c.fillText(m + 'M', 320, my + 3); }
    var ty = gy - 6 - hh * km;
    c.fillStyle = 'rgba(143,224,160,0.25)'; c.fillRect(gx - 6, ty, 12, gy - ty);
    c.save(); c.translate(gx, ty); c.rotate(-roll);
    c.fillStyle = green; c.fillRect(-44, -3, 88, 6);
    [-32, -11, 11, 32].forEach(function (u) { c.fillStyle = 'rgba(240,192,74,0.7)'; c.fillRect(u - 7, -15, 14, 12); });
    c.restore();
    c.strokeStyle = amber; c.lineWidth = 1; c.beginPath(); c.moveTo(322, ty); c.lineTo(330, ty); c.stroke();
    c.fillStyle = green; c.font = '10px monospace'; c.textAlign = 'left';
    c.fillText('H ' + hh.toFixed(2) + ' M', 296, 52); c.fillText('TILT ' + (E.tiltA * 180 / Math.PI).toFixed(0), 360, 52);
    // the footer: the two speeds and who is aboard
    var rpm = function (w) { return (Math.abs(w) * 60 / 6.283).toFixed(1); };
    c.font = '11px monospace'; c.textAlign = 'left'; c.fillStyle = green;
    c.fillText('FLOOR ' + rpm(E.spinW) + ' RPM   STALLS ' + rpm(E.stallW) + ' RPM   ON RIDE ' + a.riders + '/' + a.seats.length, 8, 266);
    pkBkScanlines(c, W, H);
  }
  function pkDmStageScreen(g, a) {
    var X = pkDmM(), m = new THREE.Group(); m.rotation.order = 'YXZ'; m.position.set(-52.86, 2.06, -19.4); m.rotation.y = -0.85; m.rotation.x = 0.18; g.add(m);
    pkRod(0, 0.28, -0.06, 0, 0.98, -0.06, 0.02, X.iron, m, 6);
    pkBevelBox(0.86, 0.58, 0.12, std({ color: 0x23292e, roughness: 0.5, metalness: 0.3 }), 0, 0, -0.065, m, 0.02);
    var sc = touchScreen({ w: 420, h: 280, pw: 0.79, ph: 0.53, x: 0, y: 0, z: 0, parent: m, title: 'CAM 3 - the stage', draw: function (c, s) { pkDmStageDraw(a, c, s); } });
    PK_BK_LIVE.push({ sc: sc, g: m, every: 0.08 });
    pkPowerScreen(sc, function () { return !!a.open; });
  }

  // ── Build ────────────────────────────────────────────────────────
  function pkBuildDanse(p, open) {
    var D = PK_DM, X = pkDmM(), g = new THREE.Group(); scene.add(g); D.g = g;
    var CX = D.CX, CZ = D.CZ, E = { show: { h: 1.3, tilt: 0, beat: -1 }, mist: [], cues: {}, bar: -1, clock: 0, shake: 0, h: 0, tiltA: 0, spinW: 0, room: 0.9, organ: 0, jo: 0, orch: 0, choir: 0, eyes: 0.5, candleK: 1, stallW: 0, stallA: 0, exitHold: false, house: false, turnOn: true, liftOn: true, mistOn: true };
    // the chapel: ten faces, each with its job inside
    var faces = [];
    for (var k = 0; k < 10; k++) faces.push(pkDmFace(k));
    var door = { u0: -1.1, u1: 1.1, y1: 4.1 };
    faces.forEach(function (f) {
      if (f.k === 1 || f.k === 9) pkDmWall(f, door);
      else if (f.k === 2) { pkDmWall(f, { u0: -1.0, u1: 0.8, y0: 1.2, y1: 2.3 }); pkDmSpyhole(f, -0.1); }
      else pkDmWall(f);
      if (f.k !== 1 && f.k !== 2) pkDmWallOut(f, f.k === 9 ? door : null);
    });
    pkDmRoseNiche(faces[0], 'piano'); pkDmRoseNiche(faces[3], 'harp'); pkDmRoseNiche(faces[5], 'triangle');
    pkDmScrimNiche(faces[4]); pkDmScrimNiche(faces[6]); pkDmScrimNiche(faces[8]);
    var organ = pkDmOrgan(faces[7]);
    // the doors through the chapel wall: a carved arch each side, the drapes at the way in, the exit's iron gates and sign
    // (the opening is a true pointed arch right through the wall: the spandrels over it are filled the wall's full depth)
    [faces[1], faces[9]].forEach(function (f) {
      pkDmFrame([[-1.13, 0], [1.13, 0], [1.13, 4.13], [-1.13, 4.13]], pkDmArch(2.2, 2.7, 4.0), PK_DM.T, X.stone, f.g, 0, 0, -PK_DM.T / 2);
      [0.04, -PK_DM.T - 0.06].forEach(function (zz, side) { var fr = pkDmFrame(pkDmArch(2.75, 2.75, 4.35), pkDmArch(2.2, 2.7, 4.0), 0.16, X.carve, f.g, 0, 0, zz); if (side) fr.rotation.y = Math.PI; });
    });
    pkRod(1.75, 3.3, 0.0, 1.75, 3.3, 0.5, 0.025, X.iron, faces[9].g, 4); pkRod(1.75, 3.3, 0.5, 1.75, 3.0, 0.5, 0.01, X.iron, faces[9].g, 4);
    box(0.2, 0.3, 0.2, X.candle, 1.75, 2.82, 0.5, faces[9].g); pkHipRoof(0.26, 0.26, 0.18, X.iron, 1.75, 2.97, 0.5, faces[9].g);
    [-1, 1].forEach(function (s) { var dr = box(0.5, 3.4, 0.25, X.velvet, s * 1.05, 1.75, -PK_DM.T - 0.3, faces[1].g); dr.rotation.y = s * 0.2; });
    // the exit doors: oak on iron straps under a fixed lunette in the arch. Shut through the show, they swing out to the
    // graveyard when the riders get off (or while the cabin's EXIT DOORS switch holds them), and only ever outward
    var lun = new THREE.Mesh(pkExtrudeGeo(pkDmArch(2.2, 0, 1.3), 0.08, 0), X.oakDark); lun.position.set(0, 2.7, -0.16); faces[9].g.add(lun);
    pkDmKitten(faces[9].g, 0, 3.0, -0.08, 0, 0.7);
    var exitDoors = [];
    [-1, 1].forEach(function (s) {
      var cr = -s * Math.PI / 2, hg = pkMover(faces[9].g, s * 1.1, 0, -0.16); hg.rotation.y = cr;
      box(0.08, 2.68, 1.08, X.oakDark, 0, 1.34, 0.55, hg);
      [0.45, 1.35, 2.25].forEach(function (y) { box(0.11, 0.08, 1.0, X.iron, 0, y, 0.54, hg); });
      [-1, 1].forEach(function (k) { sphere(0.06, X.iron, k * 0.07, 1.3, 0.95, hg); });
      pkFuse(hg);
      var dd = { hinge: hg, w: 1.08, closedRy: cr, openDelta: s * Math.PI / 2 * 0.95, open: 0, want: 0, label: 'the exit door', setNow: function () {} };
      exitDoors.push(dd); PK_BK_DOORS.push(dd);
    });
    sign(['EXIT'], 0.8, 0.28, 0, 4.62, 0.14, 0, { bg: '#123a22', fg: '#c8ffd8' }, faces[9].g);
    sign(['EXIT'], 0.8, 0.28, 0, 4.62, -PK_DM.T - 0.16, Math.PI, { bg: '#123a22', fg: '#c8ffd8' }, faces[9].g);
    // the buttresses (shallow on the west, toward the viaduct, and on the north, along the Arena path), the roof with its fallen bay, the vault inside
    [[0, 1.6], [4, 1.5], [5, 0.5], [6, 1.5], [7, 0.5], [8, 0.5], [9, 1.6]].forEach(function (b) { pkDmButtress(b[0], b[1]); });
    pkDmDeca(D.R + 0.55, D.R + 0.55, 0.5, X.lead, D.H + 0.25, g, true);
    var gap = Math.PI * 2 / 10, roof = new THREE.Mesh(new THREE.CylinderGeometry(0.12, D.R + 0.6, 9.5, 9, 1, true, Math.PI * 0.9, gap * 9), X.slate);
    roof.position.set(CX, D.H + 0.5 + 4.75, CZ); roof.castShadow = true; g.add(roof);
    for (var r = 0; r <= 5; r++) {
      var ta = 1.6 * Math.PI + r / 5 * gap * 1.0 + 0.0, ex = CX + Math.cos(ta) * (D.R + 0.4), ez = CZ + Math.sin(ta) * (D.R + 0.4), reach = r % 2 ? 0.55 : 0.92;
      pkRod(ex, D.H + 0.5, ez, ex + (CX - ex) * reach, D.H + 0.5 + 9.3 * reach, ez + (CZ - ez) * reach, 0.09, X.oakDark, g, 6);
    }
    [0.3, 0.55].forEach(function (f) { var p0a = 1.6 * Math.PI, p1a = 1.6 * Math.PI + gap, rr = (D.R + 0.4) * (1 - f); pkRod(CX + Math.cos(p0a) * rr, D.H + 0.5 + 9.3 * f, CZ + Math.sin(p0a) * rr, CX + Math.cos(p1a) * rr, D.H + 0.5 + 9.3 * f, CZ + Math.sin(p1a) * rr, 0.07, X.oakDark, g, 6); });
    var lan = D.H + 0.5 + 9.5;
    pkRod(CX, lan - 0.4, CZ, CX, lan + 1.6, CZ, 0.05, X.iron, g, 6); pkRod(CX - 0.4, lan + 1.1, CZ, CX + 0.4, lan + 1.1, CZ, 0.04, X.iron, g, 6); sphere(0.16, X.gold, CX, lan, CZ, g);
    var vR = (D.R * Math.cos(Math.PI / 10) - D.T) / Math.cos(Math.PI / 10);
    pkDmDeca(0.35, vR, 5.2, X.vault, D.H + 2.6, g, true);
    for (var j = 0; j < 10; j++) {
      var ps = j * Math.PI / 5, rx = CX + Math.cos(ps) * (vR - 0.15), rz = CZ + Math.sin(ps) * (vR - 0.15);
      cyl(0.14, D.H - 3.0, X.carve, rx, 3.0 + (D.H - 3.0) / 2, rz, g, 8);
      box(0.4, 0.3, 0.4, X.carveDark, rx, D.H - 0.15, rz, g);
      pkRod(rx, D.H, rz, CX, D.H + 5.0, CZ, 0.1, X.carve, g, 6);
      // a torch on each pier (the Catacomben's torches)
      var tx = CX + Math.cos(ps) * (vR - 0.45), tz = CZ + Math.sin(ps) * (vR - 0.45);
      cyl(0.08, 0.3, X.iron, tx, 3.6, tz, g, 8, 0.05); sphere(0.11, X.flame, tx, 3.85, tz, g).scale.set(0.8, 1.6, 0.8);
    }
    sphere(0.5, X.gold, CX, D.H + 5.0, CZ, g);
    // the chandelier
    pkRing(1.9, 0.06, X.iron, CX, 9.4, CZ, g, 40); pkRing(1.0, 0.05, X.iron, CX, 9.1, CZ, g, 30);
    for (var c = 0; c < 3; c++) { var ca = c / 3 * Math.PI * 2; pkRod(CX + Math.cos(ca) * 1.9, 9.4, CZ + Math.sin(ca) * 1.9, CX, D.H + 4.9, CZ, 0.025, X.iron, g, 4); }
    for (var cd = 0; cd < 12; cd++) { var cda = cd / 12 * Math.PI * 2; cyl(0.04, 0.28, X.bone, CX + Math.cos(cda) * 1.9, 9.6, CZ + Math.sin(cda) * 1.9, g, 6); sphere(0.05, X.candle, CX + Math.cos(cda) * 1.9, 9.8, CZ + Math.sin(cda) * 1.9, g).scale.set(0.8, 1.6, 0.8); }
    // the floor
    var fl = new THREE.Mesh(new THREE.CircleGeometry(D.R - 0.2, 10), X.flagDisc); fl.rotation.x = -Math.PI / 2; fl.position.set(CX, 0.02, CZ); fl.receiveShadow = true; g.add(fl);
    // the Dynamic Motion Stage: the lift (height), the tilt, the turn; under it the rams, only seen when it is up
    var lift = pkMover(g, CX, 0, CZ), tilt = pkMover(lift, 0, 0, 0), spin = pkMover(tilt, 0, 0, 0);
    var deck = new THREE.Mesh(new THREE.CircleGeometry(5.6, 64), X.deck); deck.rotation.x = -Math.PI / 2; deck.position.y = 0.13; deck.receiveShadow = true; spin.add(deck);
    var rim = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 5.6, 0.26, 64, 1, true), X.oakDark); rim.castShadow = true; spin.add(rim);
    pkRing(5.6, 0.045, X.gold, 0, 0.13, 0, spin, 64);
    var under = new THREE.Mesh(new THREE.CircleGeometry(5.6, 48), X.iron); under.rotation.x = Math.PI / 2; under.position.y = -0.13; tilt.add(under);
    var skirt = new THREE.Mesh(new THREE.CylinderGeometry(5.3, 5.3, 0.6, 40, 1, true), X.iron); skirt.position.y = -0.4; tilt.add(skirt);
    cyl(0.5, 3.6, X.tin, 0, -1.8, 0, lift, 16);
    for (var rm = 0; rm < 6; rm++) { var ra = rm / 6 * Math.PI * 2 + 0.26; cyl(0.16, 3.6, X.iron, Math.cos(ra) * 3.3, -1.8, Math.sin(ra) * 3.3, lift, 10); }
    var seats = [], bars = [];
    var stalls = [];
    for (var si = 0; si < 6; si++) stalls.push(pkDmStall(spin, si / 6 * Math.PI * 2 + Math.PI / 6, seats, bars));
    pkDmCrate(spin);
    pkFuse(spin); stalls.forEach(function (s) { pkFuse(s.o); });
    var crypt = pkDmCrypt(g);
    // the lights inside: the room, the lightning, the organ's glow, the ghosts' green
    var roomLight = new THREE.PointLight(0xffc890, 1.4, 24, 1.6); roomLight.position.set(CX, 10.5, CZ); g.add(roomLight);
    var flash = new THREE.PointLight(0xdfe8ff, 0, 30, 1.2); flash.position.set(CX, 12.5, CZ); g.add(flash);
    var organLight = new THREE.PointLight(0xff9a40, 0, 14, 1.5); organLight.position.set(CX, 6, CZ - 5.6); g.add(organLight);
    var ghostLight = new THREE.PointLight(0x7fffd0, 0, 20, 1.5); ghostLight.position.set(CX, 7.5, CZ); g.add(ghostLight);
    // the front, the tower, and everything outside
    var doors = [];
    pkDmFront(g, doors);
    pkDmTower(g);
    pkDmGraveyard(g, E);
    pkDmCloister(g);
    // the hall inside the doors: the violin glowing under its cloth on a pedestal, candelabra, a drape or two
    var vx = -48.6, vz = -17.6;
    box(0.7, 1.1, 0.7, X.carve, vx, 0.55, vz, g); box(0.85, 0.1, 0.85, X.carveDark, vx, 1.12, vz, g);
    pkDmViolin(g, vx, 1.45, vz, 0.55, X.violin, -1.35, 0.3, 0);
    var cl = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.75, 14, 1, true), X.cloth); cl.position.set(vx, 1.55, vz); cl.userData.noBake = true; g.add(cl);
    solid(vx - 0.4, vx + 0.4, vz - 0.4, vz + 0.4, 0, 1.6);
    [[-51.3, -16.6], [-47.6, -16.3]].forEach(function (q) {
      cyl(0.04, 1.7, X.iron, q[0], 0.85, q[1], g, 6); pkRing(0.25, 0.02, X.iron, q[0], 1.7, q[1], g, 16);
      for (var cn = 0; cn < 5; cn++) { var cna = cn / 5 * Math.PI * 2; cyl(0.03, 0.2, X.bone, q[0] + Math.cos(cna) * 0.25, 1.8, q[1] + Math.sin(cna) * 0.25, g, 6); sphere(0.035, X.candle, q[0] + Math.cos(cna) * 0.25, 1.94, q[1] + Math.sin(cna) * 0.25, g); }
    });
    [[-47.04, -23.6, -Math.PI / 2], [-47.04, -17.6, -Math.PI / 2]].forEach(function (q) { var dr = box(1.4, 4.4, 0.06, X.velvet, q[0], 2.6, q[1], g); dr.rotation.y = q[2]; });
    // the mist: soft sheets low over the graveyard and round the abbey's foot
    [[-42.6, -35.0, 6], [-36.0, -35.4, 5], [-44.0, -29.2, 4], [-38.0, -29.3, 4], [-47.4, -34.8, 4], [-41.0, -16.0, 6], [-45.3, -13.5, 5]].forEach(function (m) {
      var mm = new THREE.Mesh(new THREE.PlaneGeometry(m[2], m[2]), X.mist.clone()); mm.rotation.x = -Math.PI / 2; mm.position.set(m[0], 0.35, m[1]); mm.userData.noBake = true; mm.renderOrder = 3;
      var mv = pkMover(g, 0, 0, 0); mv.add(mm); E.mist.push({ o: mm, x: m[0], z: m[1] });
    });
    E.lift = lift; E.tilt = tilt; E.spin = spin; E.stalls = stalls; E.exitDoors = exitDoors; E.crypt = crypt; E.organMid = organ.mid; E.jArm = organ.arm;
    E.roomLight = roomLight; E.flash = flash; E.organLight = organLight; E.ghostLight = ghostLight;
    var a = pkAttr({
      id: 'danse', name: 'Danse Macabre', x: p.x, z: p.z, qx: p.q[0], qz: p.q[1], g: g, seats: seats,
      board: 22, run: 60, unload: 8, exit: [-35.5, -31.0], extra: E,
      start: function (at) { at.extra.cues = {}; at.extra.bar = -1; },
      tickRun: pkDmTick
    });
    a.boardMin = 12;
    var C = pkCtl(a);
    C.gateObjs.push(function (t) { doors.forEach(function (d) { d.h.rotation.y = d.s * 1.4 * t; }); });
    C.barObjs.push(function (b) { bars.forEach(function (bb) { bb.rotation.x = -1.5 * (1 - b); }); });
    // the riders' way: in at the doors, across the hall, through the chapel door to their stall; out by the east door and
    // through the graveyard to the street
    var ph = function (r, deg) { var q = deg * Math.PI / 180; return { x: CX + Math.cos(q) * r, z: CZ + Math.sin(q) * r }; };
    var inA = { x: D.FX + 1.1, z: D.DZ }, inB = { x: D.FX - 1.6, z: D.DZ }, inC = ph(9.25, 54), inD = ph(6.8, 54);
    var outA = ph(6.8, 342), outB = ph(9.6, 342);
    a.seatPath = function (from, w) { return route(from, inA).concat([inB, inC, inD], route(inD, { x: w.x, z: w.z })); };
    a.walkOut = function (sp) { return route(sp, outA).concat([outB], route(outB, { x: a.exit[0], z: a.exit[1] })); };
    // the control cabin, glazed onto the chapel through its south face, its side window and door onto the hall
    pkDmSwitches(g, a);
    pkDmStageScreen(g, a);
    pkDmSacristy(g, a);
    return a;
  }
