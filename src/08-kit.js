//@ Park Co, part 08: the kit - the materials and shapes the park is built from, so it reads as built rather than blocked out:
//@ pavers, painted steel, fibreglass, striped canvas, slate, clapboard, water, turned and extruded shapes, roofs, lanterns,
//@ benches, bins, trees, hedges, railings and the palisade. Everything here is a function the build parts call.
  // ── Painted textures ─────────────────────────────────────────────
  function pkTexPavers() {
    return tex(512, 512, function (c, w, h) {
      c.fillStyle = '#5d5a55'; c.fillRect(0, 0, w, h);
      var cols = ['#b3aa9c', '#a89e8f', '#bdb5a8', '#9d9385', '#aea392', '#c2baae'];
      for (var r = 0; r < 16; r++) {
        var off = (r % 2) * 32;
        for (var k = -1; k < 9; k++) {
          var x = k * 64 + off, y = r * 32;
          c.fillStyle = cols[(r * 7 + k * 3 + 64) % cols.length]; c.fillRect(x + 2, y + 2, 60, 28);
          c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(x + 2, y + 2, 60, 3);
          c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(x + 2, y + 27, 60, 3);
        }
      }
      grain(c, w, h, 3000, 0.03); grain(c, w, h, 1800, 0.025, true); blotches(c, w, h, 14, 20, 70, true, 0.08);
    }, 1, 1);
  }
  function pkTexStripes(a, b, n) {
    return tex(256, 64, function (c, w, h) {
      var k = n || 8; for (var i = 0; i < k; i++) { c.fillStyle = i % 2 ? b : a; c.fillRect(i * w / k, 0, w / k + 1, h); }
      grain(c, w, h, 600, 0.04, true);
    }, 1, 1);
  }
  function pkTexShingles() {
    return tex(256, 256, function (c, w, h) {
      c.fillStyle = '#3c3f44'; c.fillRect(0, 0, w, h);
      for (var r = 0; r < 8; r++) {
        var off = (r % 2) * 16;
        for (var k = -1; k < 9; k++) {
          var x = k * 32 + off, y = r * 32, v = 56 + ((r * 5 + k * 11 + 40) % 7) * 6;
          c.fillStyle = 'rgb(' + v + ',' + (v + 3) + ',' + (v + 8) + ')';
          c.beginPath(); c.moveTo(x + 1, y); c.lineTo(x + 31, y); c.lineTo(x + 31, y + 24); c.quadraticCurveTo(x + 16, y + 34, x + 1, y + 24); c.closePath(); c.fill();
          c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(x + 1, y + 26, 30, 3);
        }
      }
      grain(c, w, h, 3000, 0.06, true);
    }, 1, 1);
  }
  function pkTexClapboard() {
    return tex(256, 256, function (c, w, h) {
      c.fillStyle = '#d8d8d8'; c.fillRect(0, 0, w, h);
      for (var y = 0; y < h; y += 16) {
        var gr = c.createLinearGradient(0, y, 0, y + 16); gr.addColorStop(0, '#f0f0f0'); gr.addColorStop(0.85, '#c8c8c8'); gr.addColorStop(1, '#8a8a8a');
        c.fillStyle = gr; c.fillRect(0, y, w, 16);
      }
      grain(c, w, h, 2500, 0.05, true);
    }, 1, 1);
  }
  function pkTexWater() {
    return tex(256, 256, function (c, w, h) {
      var gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2f7fa6'); gr.addColorStop(1, '#3d93b8');
      c.fillStyle = gr; c.fillRect(0, 0, w, h);
      c.strokeStyle = 'rgba(220,245,255,0.35)'; c.lineWidth = 2;
      for (var i = 0; i < 40; i++) { var x = Math.random() * w, y = Math.random() * h, l = randf(10, 34); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y - 4, x + l, y); c.stroke(); }
    }, 1, 1);
  }
  function pkTexLeaves() {
    return tex(256, 256, function (c, w, h) {
      c.fillStyle = '#4f7a36'; c.fillRect(0, 0, w, h);
      for (var i = 0; i < 2600; i++) { var g = Math.floor(randf(70, 150)); c.fillStyle = 'rgba(' + Math.floor(g * 0.45) + ',' + g + ',' + Math.floor(g * 0.3) + ',0.7)'; c.beginPath(); c.arc(Math.random() * w, Math.random() * h, randf(1.5, 4), 0, Math.PI * 2); c.fill(); }
      for (var j = 0; j < 500; j++) { c.fillStyle = 'rgba(15,35,10,0.5)'; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    }, 1, 1);
  }
  function pkTexBark() {
    return tex(128, 256, function (c, w, h) {
      c.fillStyle = '#5a4634'; c.fillRect(0, 0, w, h);
      for (var i = 0; i < 70; i++) { c.strokeStyle = 'rgba(30,20,12,' + randf(0.3, 0.7) + ')'; c.lineWidth = randf(1, 3); var x = Math.random() * w; c.beginPath(); c.moveTo(x, 0); for (var y = 0; y < h; y += 16) c.lineTo(x + randf(-4, 4), y); c.stroke(); }
      grain(c, w, h, 1500, 0.08, true);
    }, 1, 1);
  }
  // a small trunk sheet for the park trees: vertical streaks in three browns, tiled twice up the trunk so the bark still reads at a distance
  function pkTexTreeBark() {
    return tex(64, 128, function (c, w, h) {
      c.fillStyle = '#67503a'; c.fillRect(0, 0, w, h);
      var tones = ['#7a6046', '#57422f', '#4a3728'];
      for (var i = 0; i < 26; i++) {
        var x = Math.random() * w, bend = randf(-3, 3);
        c.strokeStyle = tones[i % tones.length]; c.globalAlpha = randf(0.35, 0.65); c.lineWidth = randf(1, 2.5);
        for (var kx = -1; kx <= 1; kx++) for (var ky = -1; ky <= 1; ky++) {   // drawn across every edge so the sheet tiles without a seam
          c.beginPath(); c.moveTo(x + kx * w, ky * h);
          for (var y = 0; y <= h; y += 16) c.lineTo(x + kx * w + Math.sin(y / h * Math.PI * 4 + i) * bend, ky * h + y);
          c.stroke();
        }
      }
      c.globalAlpha = 1; grain(c, w, h, 700, 0.05, true);
    }, 1, 2);
  }
  function pkTexChain() {
    return tex(64, 256, function (c, w, h) {
      c.fillStyle = '#222428'; c.fillRect(0, 0, w, h);
      for (var y = 0; y < h; y += 32) { c.strokeStyle = '#8c9298'; c.lineWidth = 5; roundRect(c, 16, y + 4, 32, 24, 10); c.stroke(); c.fillStyle = '#5c6268'; c.fillRect(28, y + 26, 8, 12); }
    }, 1, 1);
  }
  function pkTexPalisade() {
    var t = makeAlphaTex(256, 256, function (c, w, h) {
      c.clearRect(0, 0, w, h); c.fillStyle = '#1d2226';
      for (var x = 8; x < w; x += 32) {
        c.fillRect(x, 30, 8, h - 30);
        c.beginPath(); c.moveTo(x - 4, 30); c.lineTo(x + 4, 4); c.lineTo(x + 12, 30); c.closePath(); c.fill();
      }
      c.fillRect(0, 44, w, 8); c.fillRect(0, h - 40, w, 8);
    });
    t.wrapS = THREE.RepeatWrapping; return t;
  }
  function pkTexDots(base, dot) {
    return tex(256, 256, function (c, w, h) {
      c.fillStyle = base; c.fillRect(0, 0, w, h); c.fillStyle = dot;
      for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) { c.beginPath(); c.arc(x * 32 + (y % 2) * 16 + 8, y * 32 + 16, 7, 0, Math.PI * 2); c.fill(); }
    }, 2, 1);
  }
  function pkTexRounding(a, b) {
    // the carousel's rounding boards: cream panels picked out in gold with a mirror in each, between painted scrolls
    return tex(512, 64, function (c, w, h) {
      c.fillStyle = a; c.fillRect(0, 0, w, h);
      for (var i = 0; i < 4; i++) {
        var x = i * 128;
        c.fillStyle = '#c9a23e'; c.fillRect(x + 4, 4, 120, 56); c.fillStyle = a; c.fillRect(x + 8, 8, 112, 48);
        var gr = c.createLinearGradient(x + 40, 0, x + 88, 0); gr.addColorStop(0, '#9fb6c9'); gr.addColorStop(0.5, '#eef4fa'); gr.addColorStop(1, '#8aa1b4');
        c.fillStyle = gr; c.fillRect(x + 44, 16, 40, 32);
        c.strokeStyle = b; c.lineWidth = 3; c.beginPath(); c.arc(x + 24, 32, 10, 0, Math.PI * 1.6); c.stroke(); c.beginPath(); c.arc(x + 104, 32, 10, Math.PI, Math.PI * 2.6); c.stroke();
      }
    }, 6, 1);
  }
  function pkTexSunburst(a, b) {
    return tex(512, 512, function (c, w, h) {
      var n = 24; c.translate(w / 2, h / 2);
      for (var i = 0; i < n; i++) { c.fillStyle = i % 2 ? a : b; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, w, i / n * Math.PI * 2, (i + 1) / n * Math.PI * 2); c.closePath(); c.fill(); }
      c.fillStyle = '#c9a23e'; c.beginPath(); c.arc(0, 0, 40, 0, Math.PI * 2); c.fill();
    }, 1, 1);
  }
  // ── The materials, made once ─────────────────────────────────────
  var PKM = null;
  function pkPaint(c, r, m) { return std({ color: c, roughness: r === undefined ? 0.42 : r, metalness: m === undefined ? 0.3 : m }); }
  function pkGloss(c) { return std({ color: c, roughness: 0.24, metalness: 0.1 }); }
  var PK_STRIPES = {};
  function pkStripes(a, b) {
    var k = a + '/' + b; if (PK_STRIPES[k]) return PK_STRIPES[k];
    return (PK_STRIPES[k] = std({ map: pkTexStripes(a, b), roughness: 0.85, side: THREE.DoubleSide }));
  }
  function pkMats() {
    if (PKM) return PKM;
    var M = PKM = {};
    M.paverTex = pkTexPavers();
    M.pavers = std({ map: M.paverTex, roughness: 0.9 });
    M.paversWarm = std({ map: M.paverTex, color: 0xf0d8c8, roughness: 0.9 });
    M.kerb = std({ map: TEX.plaster, color: 0xb9b4aa, roughness: 0.9 });
    M.stone = std({ map: TEX.plaster, color: 0xd8d0c0, roughness: 0.92 });
    M.stoneDark = std({ map: TEX.plaster, color: 0x8e887e, roughness: 0.95 });
    M.cream = std({ map: TEX.plaster, color: 0xf3ead6, roughness: 0.85 });
    M.white = pkPaint(0xf4f4f0, 0.5, 0.1);
    M.iron = pkPaint(0x1f2427, 0.5, 0.6);
    M.green = pkPaint(0x23493a, 0.45, 0.4);          // park furniture green
    M.steel = pkPaint(0xdfe3e6, 0.38, 0.55);          // coaster track white
    M.steelBlue = pkPaint(0x2c5f9e, 0.36, 0.45);      // coaster supports
    M.gold = std({ color: 0xd4a73a, roughness: 0.28, metalness: 0.9 });
    M.brass = std({ color: 0xc9a050, roughness: 0.22, metalness: 0.95 });
    M.mirror = std({ color: 0xe8eef4, roughness: 0.04, metalness: 1 });
    M.pane = std({ color: 0x24323f, roughness: 0.06, metalness: 0.7 });
    M.glass = new THREE.MeshPhysicalMaterial({ color: 0xcfe2ef, transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide });
    M.slate = std({ map: pkTexShingles(), roughness: 0.8, side: THREE.DoubleSide });
    M.slateRed = std({ map: M.slate.map, color: 0xd88a7a, roughness: 0.8, side: THREE.DoubleSide });
    M.slateGreen = std({ map: M.slate.map, color: 0x9fc4a8, roughness: 0.8, side: THREE.DoubleSide });
    M.clap = std({ map: pkTexClapboard(), roughness: 0.85 });
    M.clapGrey = std({ map: M.clap.map, color: 0x6c7176, roughness: 0.9 });
    M.waterTex = pkTexWater();
    M.water = std({ map: M.waterTex, roughness: 0.08, metalness: 0.15, emissive: 0x0b2a3a, emissiveIntensity: 0.35 });
    M.water.userData.noBake = true;
    M.leaves = [0x4c7a34, 0x5d8c3e, 0x3f6a2c, 0x6b9446, 0x557f39].map(function (c) { return std({ map: M.leafTex || (M.leafTex = pkTexLeaves()), color: c, roughness: 0.95 }); });
    M.hedge = std({ map: M.leafTex, color: 0x5a8a3e, roughness: 0.95 });
    M.bark = std({ map: pkTexBark(), roughness: 1 });
    M.treeBark = std({ map: pkTexTreeBark(), roughness: 1 });
    // three canopy palettes, each a light and a dark shade: the seed chooses one palette, so neighbouring trees differ without one material per tree
    M.treeLeaves = [
      [0x4c7a34, 0x5d8c3e],
      [0x56853b, 0x699347],
      [0x426c2e, 0x527b37]
    ].map(function (cols) { return cols.map(function (c) { return std({ map: M.leafTex, color: c, roughness: 0.95 }); }); });
    M.conifer = [
      [0x2f5a3a, 0x35633f],
      [0x336341, 0x3a6d48],
      [0x2a5336, 0x2e5839]
    ].map(function (cols) { return cols.map(function (c) { return std({ map: M.leafTex, color: c, roughness: 0.95 }); }); });
    M.soil = std({ color: 0x4a3626, roughness: 1 });
    M.chainTex = pkTexChain();
    M.chain = std({ map: M.chainTex, roughness: 0.5, metalness: 0.7 }); M.chain.userData.noBake = true;
    M.palisade = std({ map: pkTexPalisade(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.5 });
    M.rubber = std({ color: 0x18191b, roughness: 0.9 });
    M.seat = std({ color: 0x23262b, roughness: 0.55 });
    M.bulb = glowMat(0xfff0c2, 1.6);
    M.bulbWarm = glowMat(0xffc87a, 1.5);
    M.lantern = glowMat(0xfff2d0, 1.2);
    return M;
  }
  // ── Shapes ───────────────────────────────────────────────────────
  var PK_UP = new THREE.Vector3(0, 1, 0);
  // a cylinder from one point to another: a rod, a strut, a tie
  function pkRod(ax, ay, az, bx, by, bz, r, mat, parent, seg) {
    var dx = bx - ax, dy = by - ay, dz = bz - az, len = Math.sqrt(dx * dx + dy * dy + dz * dz); if (len < 1e-4) return null;
    var key = 'pkrod' + r.toFixed(3) + ',' + len.toFixed(3) + ',' + (seg || 8);
    var g = cachedGeo(key, function () { return new THREE.CylinderGeometry(r, r, len, seg || 8); });
    var m = new THREE.Mesh(g, mat); m.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
    m.quaternion.setFromUnitVectors(PK_UP, new THREE.Vector3(dx / len, dy / len, dz / len));
    m.castShadow = true; m.receiveShadow = true; parentOf(parent).add(m); return m;
  }
  // a tube along points [[x, y, z], ...]
  function pkTube(pts, r, mat, parent, closed, segs, radial) {
    var v = pts.map(function (p) { return new THREE.Vector3(p[0], p[1], p[2]); });
    var curve = new THREE.CatmullRomCurve3(v, !!closed, 'catmullrom', 0.5);
    var m = new THREE.Mesh(new THREE.TubeGeometry(curve, segs || Math.max(8, pts.length * 6), r, radial || 8, !!closed), mat);
    m.castShadow = true; m.receiveShadow = true; parentOf(parent).add(m); return m;
  }
  // a turned shape from a profile of [r, y] pairs
  function pkLathe(profile, mat, x, y, z, parent, seg) {
    var m = new THREE.Mesh(new THREE.LatheGeometry(profile.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), seg || 24), mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parentOf(parent).add(m); return m;
  }
  // a flat shape [[x, y], ...] pulled out depth along z, centred on its depth, with eased edges when bevel is given
  function pkExtrudeGeo(pts, depth, bevel, curveSeg) {
    var s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath();
    var g = new THREE.ExtrudeGeometry(s, { depth: depth, steps: 1, curveSegments: curveSeg || 6, bevelEnabled: !!bevel, bevelThickness: bevel || 0, bevelSize: bevel || 0, bevelSegments: bevel ? 3 : 0 });
    g.translate(0, 0, -depth / 2); g.computeVertexNormals(); return g;
  }
  function pkExtrude(pts, depth, mat, x, y, z, parent, bevel) {
    var m = new THREE.Mesh(pkExtrudeGeo(pts, depth, bevel), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parentOf(parent).add(m); return m;
  }
  // a four-sided pyramid roof w by d, h high, its foot at y
  function pkHipRoof(w, d, h, mat, x, y, z, parent) {
    var g = new THREE.ConeGeometry(Math.SQRT1_2, h, 4, 1); g.rotateY(Math.PI / 4); g.translate(0, h / 2, 0);
    var m = new THREE.Mesh(g, mat); m.scale.set(w, 1, d); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parentOf(parent).add(m); return m;
  }
  // a gabled roof: the ridge runs along x, w long, over a building d deep, the ridge h above the eaves at y. ov is the overhang.
  // The gable ends are filled in as a prism, the two slopes are slabs laid over it.
  function pkGableRoof(w, d, h, mat, wallMat, x, y, z, parent, ov) {
    ov = ov === undefined ? 0.35 : ov;
    var g = new THREE.Group(); g.position.set(x, y, z); parentOf(parent).add(g);
    var prism = new THREE.Mesh(pkExtrudeGeo([[-d / 2, 0], [d / 2, 0], [0, h]], w, 0), wallMat); prism.rotation.y = Math.PI / 2; prism.castShadow = true; prism.receiveShadow = true; g.add(prism);
    var ang = Math.atan2(h, d / 2), L = (d / 2 + ov) / Math.cos(ang);
    [-1, 1].forEach(function (s) {
      var sl = box(w + ov * 2, 0.12, L, mat, 0, 0, 0, { parent: g, r: 0.02 });
      sl.rotation.x = s * ang; sl.position.set(0, h - Math.sin(ang) * L / 2 + 0.07, s * Math.cos(ang) * L / 2);
    });
    box(w + ov * 2 + 0.1, 0.14, 0.18, MAT.steelDark, 0, h + 0.06, 0, g);
    return g;
  }
  // a window set in a wall: a frame, a pane and the glazing bars. ry turns it; the pane looks out along +z before the turn.
  function pkWindow(parent, x, y, z, w, h, ry, frame, pane, bars) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parentOf(parent).add(g);
    var f = frame || PKM.white, t = 0.08;
    box(w + t * 2, t, 0.12, f, 0, h / 2 + t / 2, 0, g); box(w + t * 2.6, t * 1.2, 0.2, f, 0, -h / 2 - t / 2, 0.04, g);
    box(t, h, 0.12, f, -w / 2 - t / 2, 0, 0, g); box(t, h, 0.12, f, w / 2 + t / 2, 0, 0, g);
    plane(w, h, pane || PKM.pane, 0, 0, -0.01, 0, 0, g);
    if (bars !== false) { box(0.035, h, 0.05, f, 0, 0, 0, g); box(w, 0.035, 0.05, f, 0, h * 0.1, 0, g); }
    return g;
  }
  // a set of lamp bulbs as one instanced mesh: points [[x, y, z], ...] in the parent's frame
  function pkBulbs(points, mat, r, parent) {
    if (!points.length) return null;
    var g = cachedGeo('pkbulb' + r, function () { return new THREE.SphereGeometry(r, 8, 6); });
    var im = new THREE.InstancedMesh(g, mat || PKM.bulb, points.length), m4 = new THREE.Matrix4();
    for (var i = 0; i < points.length; i++) { m4.makeTranslation(points[i][0], points[i][1], points[i][2]); im.setMatrixAt(i, m4); }
    im.instanceMatrix.needsUpdate = true; im.castShadow = false; im.frustumCulled = false; parentOf(parent).add(im); return im;
  }
  // a rectangle given in a group's own frame, turned and set where the group stands, laid down as a solid
  function pkLocalSolid(g, x0, x1, z0, z1, y0, y1) {
    var c = Math.cos(g.rotation.y), s = Math.sin(g.rotation.y), xs = [], zs = [];
    [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(function (p) { xs.push(g.position.x + p[0] * c + p[1] * s); zs.push(g.position.z - p[0] * s + p[1] * c); });
    solid(Math.min.apply(null, xs), Math.max.apply(null, xs), Math.min.apply(null, zs), Math.max.apply(null, zs), y0 === undefined ? 0 : y0, y1 === undefined ? 3 : y1);
  }
  // a paved slab whose pavers keep their size whatever the slab's size: the UVs are stretched to the slab in metres
  function pkPaved(w, d, mat, x, y, z, tile, parent, ry) {
    var geo = new THREE.PlaneGeometry(w, d), uv = geo.attributes.uv, t = tile || 2.4;
    for (var i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / t, uv.getY(i) * d / t);
    var m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.rotation.z = ry || 0; m.position.set(x, y, z); m.receiveShadow = true; parentOf(parent).add(m); return m;
  }
  function pkPavedDisc(r, mat, x, y, z, parent, tile) {
    var geo = new THREE.CircleGeometry(r, 48), uv = geo.attributes.uv, t = tile || 2.4;
    for (var i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * r * 2 / t, uv.getY(i) * r * 2 / t);
    var m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; parentOf(parent).add(m); return m;
  }
  // a path: pavers with a kerb along both long sides. Runs from (x0, z0) to (x1, z1), w wide.
  function pkPath(x0, z0, x1, z1, w, mat, y) {
    var dx = x1 - x0, dz = z1 - z0, len = Math.sqrt(dx * dx + dz * dz); if (len < 0.1) return;
    var ry = Math.atan2(dx, dz), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    var p = pkPaved(w, len + w, mat || PKM.pavers, cx, y || 0.016, cz, 2.4, null, ry);
    [-1, 1].forEach(function (s) {
      var k = box(0.16, 0.08, len + w, PKM.kerb, cx + Math.cos(ry) * s * (w / 2 + 0.08), 0.04, cz - Math.sin(ry) * s * (w / 2 + 0.08));
      k.rotation.y = ry;
    });
    return p;
  }
  // ── Merging a moving group's parts into a handful of meshes ───────
  // A ride is a lot of small parts that turn together. Left alone, every part is its own draw each frame. pkFuse joins every mesh
  // under a group (stopping at any child marked keep, which moves on its own) into one mesh per material, in the group's frame.
  function pkFuse(root) {
    root.updateMatrixWorld(true);
    var inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), byMat = {}, kill = [];
    (function walk(o) {
      for (var i = 0; i < o.children.length; i++) {
        var c = o.children[i];
        if (c.userData && (c.userData.keep || c.userData.it || c.userData.screen)) continue;
        if (c.isMesh && !c.isInstancedMesh && !c.children.length && c.geometry && c.geometry.attributes.position && !Array.isArray(c.material) && inter.indexOf(c) < 0 && !(c.userData && c.userData.sign)) {
          (byMat[c.material.uuid] = byMat[c.material.uuid] || { mat: c.material, items: [] }).items.push(c); kill.push(c);
        }
        if (!c.isMesh) walk(c);
      }
    })(root);
    var m4 = new THREE.Matrix4();
    Object.keys(byMat).forEach(function (k) {
      var grp = byMat[k]; if (grp.items.length < 2) { kill.splice(kill.indexOf(grp.items[0]), 1); return; }
      var pos = [], nor = [], uv = [];
      grp.items.forEach(function (o) {
        var g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        m4.multiplyMatrices(inv, o.matrixWorld); g.applyMatrix4(m4);
        var pa = g.attributes.position.array, na = g.attributes.normal ? g.attributes.normal.array : null, ua = g.attributes.uv ? g.attributes.uv.array : null, n = pa.length / 3;
        for (var i = 0; i < pa.length; i++) pos.push(pa[i]);
        for (var j = 0; j < pa.length; j++) nor.push(na ? na[j] : 0);
        for (var u = 0; u < n * 2; u++) uv.push(ua ? ua[u] : 0);
        g.dispose();
      });
      var merged = new THREE.BufferGeometry();
      merged.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      merged.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      merged.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      var mesh = new THREE.Mesh(merged, grp.mat); mesh.castShadow = true; mesh.receiveShadow = true; root.add(mesh);
    });
    kill.forEach(function (o) { if (o.parent) o.parent.remove(o); });
    return root;
  }
  // ── Park furniture ───────────────────────────────────────────────
  // a lantern post: upgraded model - rounded pole, proper housing with glass lens and warm glow.
  function pkLamp(x, z, h, parent, twin) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(x, 0, z); parentOf(parent).add(g);
    h = h || 4.2;
    pkRoundCyl(0.055, h, M.iron, 0, h / 2, 0, g, 10);
    pkBevelBox(0.5, 0.14, 0.5, M.iron, 0, 0.07, 0, g, 0.03);
    var arm = new THREE.Group(); arm.position.set(0, h - 0.35, 0); g.add(arm);
    pkRoundCyl(0.03, 0.9, M.iron, 0, 0, 0.45, arm, 6);
    var house = pkBevelBox(0.42, 0.2, 0.32, M.iron, 0.45, 0, 0, arm, 0.03);
    var lens = pkBevelBox(0.34, 0.12, 0.26, std({ color: 0xb8c8d8, roughness: 0.15, metalness: 0.05, transparent: true, opacity: 0.85 }), 0.45, 0, 0, arm, 0.02);
    var glow = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.22), glowMat(0xfff2c0, 0.7));
    glow.position.set(0.45, 0, 0); arm.add(glow);
    g.userData.lampLens = lens;
    solid(x - 0.2, x + 0.2, z - 0.2, z + 0.2, 0, h);
    return lens;
  }
  // a park bench: upgraded - cast-iron frame, slatted seat and backrest with armrests.
  function pkBench(x, z, ry, parent) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; parentOf(parent).add(g);
    [[-0.85, 0, 0.15], [0.85, 0, 0.15]].forEach(function (l) {
      pkRoundCyl(0.07, 0.42, M.iron, l[0], 0.21, l[2], g, 8);
    });
    [-0.18, 0, 0.18].forEach(function (sy) {
      pkBevelBox(1.8, 0.05, 0.42, M.wood, 0, 0.45, sy, g, 0.02);
    });
    pkBevelBox(1.9, 0.06, 0.5, M.iron, 0, 0.42, 0, g, 0.02);
    [-0.18, 0, 0.18].forEach(function (sy) {
      pkBevelBox(1.8, 0.32, 0.05, M.wood, 0, 0.78, sy - 0.2, g, 0.02);
    });
    pkBevelBox(1.9, 0.34, 0.12, M.iron, 0, 0.78, -0.22, g, 0.02);
    [[-0.95, 0.55, 0], [0.95, 0.55, 0]].forEach(function (a) {
      pkBevelBox(0.1, 0.07, 0.5, M.iron, a[0], a[1], a[2], g, 0.02);
    });
    var c = Math.cos(ry || 0), s = Math.sin(ry || 0), hx = Math.abs(c) * 0.95 + Math.abs(s) * 0.35, hz = Math.abs(s) * 0.95 + Math.abs(c) * 0.35;
    solid(x - hx, x + hx, z - hz, z + hz, 0, 0.9);
    // a world bench (not one dressed into another prop's local group) takes two sitting guests
    if (!parent) {
      (PK.benches = PK.benches || []).push({ x: x, z: z, ry: ry || 0, g: g, seats: [-0.5, 0.5].map(function (lx) {
        return { x: x + lx * c, z: z - lx * s, taken: null };
      }) });
    }
    return g;
  }
  // a litter bin: upgraded - turned body with domed hood, liner rim and foot pedal.
  // a bin's top: a round rim on the drum and a low dome over it with a knob (it was a cylinder lying on its side, 0.8 m across,
  // balanced on the bin like a drum)
  var PK_BIN_DOME = null;
  function pkBinLid(g, mat) {
    pkRoundCyl(0.385, 0.05, mat, 0, 0.935, 0, g, 18);
    var dome = new THREE.Mesh(PK_BIN_DOME || (PK_BIN_DOME = new THREE.SphereGeometry(0.37, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2)), mat);
    dome.position.set(0, 0.955, 0); dome.scale.set(1, 0.42, 1); dome.castShadow = true; g.add(dome);
    pkRoundCyl(0.05, 0.05, mat, 0, 1.13, 0, g, 10);
  }
  function pkBin(x, z, parent) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(x, 0, z); parentOf(parent).add(g);
    pkRoundCyl(0.36, 0.92, M.green, 0, 0.46, 0, g, 14);
    pkBinLid(g, M.iron);
    var pedal = pkBevelBox(0.22, 0.04, 0.12, M.iron, 0, 0.05, 0.42, g, 0.02);
    pedal.rotation.x = 0.25;
    pkRoundCyl(0.015, 0.1, M.iron, 0, 0.07, 0.48, g, 6);
    // a world bin (not one dressed into another prop's local group) takes guests' rubbish, fills up and can be emptied by hand
    if (!parent) {
      var rec = { x: x, z: z, g: g, fill: 0, cap: 8 };
      (PK.bins = PK.bins || []).push(rec);
      hitBox(0.9, 1.3, 0.9, 0, 0.6, 0, {
        prompt: function () { return rec.fill > 0 ? 'Empty the bin (' + rec.fill + ' of ' + rec.cap + ')' : 'The bin is empty'; },
        use: function () { if (rec.fill <= 0) { sfx('bad'); return; } rec.fill = 0; pkBinRefreshLook(rec); sfx('ok'); toast('Emptied the bin', 'good'); }
      }, g);
    }
    return g;
  }
  // trees: lumpy leaf crowns on a rounded trunk. The crowns share one handful of geometries and the textured leaf materials, so a
  // hundred trees stay cheap and fuse into the baked world. Every fourth seed is a tall oval crown (a poplar) for a change of line.
  function pkTree(x, z, s, parent, seed) {
    var M = pkMats(); s = s || 1; seed = seed === undefined ? Math.abs(Math.round(x * 13 + z * 7)) : seed;
    var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = seed * 0.9; parentOf(parent).add(g);
    var C = pkCrownGeos(), tall = seed % 4 === 0, th = (tall ? 3.3 : 2.7) * s;
    var v = Math.abs(Math.round(seed)), leaves = M.treeLeaves[v % M.treeLeaves.length];
    pkRoundCyl(0.17 * s, th, M.treeBark, 0, th / 2, 0, g, 8);
    if (!tall) {
      pkRod(0, 2.1 * s, 0, 0.9 * s, 3.3 * s, 0.3 * s, 0.07 * s, M.treeBark, g, 6);
      pkRod(0, 2.4 * s, 0, -0.7 * s, 3.6 * s, -0.4 * s, 0.06 * s, M.treeBark, g, 6);
    }
    var blobs = tall
      ? [[0, 3.7, 0, 1.05], [0.15, 4.7, 0.1, 0.95], [-0.15, 5.6, 0, 0.75], [0.35, 4.0, -0.3, 0.8], [-0.4, 4.4, 0.3, 0.8]]
      : [[0, 4.0, 0, 1.45], [0.95, 3.5, 0.3, 1.05], [-0.9, 3.7, -0.4, 1.1], [0.2, 4.8, 0.25, 1.0], [-0.3, 3.4, 0.8, 0.9], [0.5, 3.5, -0.85, 0.85]];
    blobs.forEach(function (b, i) {
      var m = new THREE.Mesh(C[(seed + i) % 4], leaves[(v + i) % leaves.length]), r = b[3] * s * 2;
      m.scale.set(r, r * (tall ? 1.3 : 0.92), r); m.position.set(b[0] * s, b[1] * s, b[2] * s); m.rotation.y = (seed + i) * 1.3;
      m.castShadow = true; m.receiveShadow = true; g.add(m);
    });
    return g;
  }
  function pkConifer(x, z, s, parent, seed) {
    var M = pkMats(); s = s || 1; seed = seed || 0;
    var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = seed * 0.7; parentOf(parent).add(g);
    var cones = M.conifer[Math.abs(Math.round(seed)) % M.conifer.length];
    pkRoundCyl(0.14 * s, 1.6 * s, M.treeBark, 0, 0.8 * s, 0, g, 8);
    [[1.0, 2.2, 1.9], [1.65, 1.9, 1.6], [2.3, 1.6, 1.35], [2.95, 1.25, 1.1], [3.55, 0.85, 0.9]].forEach(function (t, i) {
      var m = new THREE.Mesh(new THREE.ConeGeometry(t[1] * s, t[2] * s, 10), cones[i % cones.length]);
      m.position.set(0, (t[0] + t[2] / 2) * s, 0); m.castShadow = true; m.receiveShadow = true; g.add(m);
    });
    return g;
  }
  // a clipped hedge: a softened block of leaves on a soil line
  function pkHedge(x, z, w, d, h, parent, noSolid) {
    var M = pkMats();
    pkBevelBox(w, h, d, M.hedge, x, h / 2, z, parent, Math.min(0.22, h * 0.3, w * 0.3, d * 0.3));
    if (!noSolid) solid(x - w / 2, x + w / 2, z - d / 2, z + d / 2, 0, h);
  }

  var PK_CROWN_GEOS = null;
  // four lumpy blob shapes for foliage crowns, rocks and flower heads
  function pkCrownGeos() {
    if (PK_CROWN_GEOS) return PK_CROWN_GEOS;
    PK_CROWN_GEOS = [0, 1, 2, 3].map(function (i) {
      var geo = new THREE.IcosahedronGeometry(0.5, 1);
      var pos = geo.attributes.position, v = new THREE.Vector3();
      for (var j = 0; j < pos.count; j++) {
        v.fromBufferAttribute(pos, j);
        var n = Math.sin(v.x * 5.1 + i * 2.3) * Math.cos(v.y * 4.7 + i * 1.7) * Math.sin(v.z * 4.3 + i * 3.1);
        v.multiplyScalar(1 + n * 0.22);
        pos.setXYZ(j, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();
      return geo;
    });
    return PK_CROWN_GEOS;
  }
  // granite for boulders: flat-shaded, so the facets catch the light and it reads as stone rather than a smooth blob
  var PK_ROCK_MATS = null;
  function pkRockMats() {
    if (PK_ROCK_MATS) return PK_ROCK_MATS;
    PK_ROCK_MATS = [0x7b746a, 0x6a645c, 0x8a8378, 0x5e5952].map(function (c) {
      return std({ color: c, roughness: 0.95, flatShading: true });
    });
    return PK_ROCK_MATS;
  }
  // a boulder of the given radius, sunk part way into the ground, turned and squashed so no two look alike
  function pkBoulder(x, z, r, parent, sink) {
    var m = new THREE.Mesh(pkCrownGeos()[(Math.abs(x * 7 + z * 13) | 0) % 4], pkRockMats()[(Math.abs(x * 3 + z * 5) | 0) % 4]);
    m.scale.set(r * 1.45, r * 0.95, r * 1.2);
    m.position.set(x, r * 0.95 * 0.5 - (sink === undefined ? r * 0.28 : sink), z);
    m.rotation.set(randf(-0.22, 0.22), randf(0, 6.283), randf(-0.22, 0.22));
    m.castShadow = true; m.receiveShadow = true;
    parentOf(parent).add(m);
    return m;
  }

  // a flower bed: stone edging, soil and a scatter of flowers
  function pkFlowerBed(x, z, w, d, parent, noSolid) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(x, 0, z); parentOf(parent).add(g);
    pkBevelBox(w, 0.34, d, pkMatStone(), 0, 0.17, 0, g, 0.04);
    pkBevelBox(w - 0.2, 0.06, d - 0.2, M.soil, 0, 0.35, 0, g, 0.02);
    var cols = [0xd94f6a, 0xf3c84a, 0xe7e2f2, 0xb85cc7, 0xf08a3c], C = pkCrownGeos(), n = Math.max(4, Math.round(w * d * 2.2));
    for (var i = 0; i < n; i++) {
      var leaf = new THREE.Mesh(C[i % 4], M.leaves[i % M.leaves.length]); leaf.scale.set(0.2, 0.14, 0.2);
      var fx = randf(-w / 2 + 0.3, w / 2 - 0.3), fz = randf(-d / 2 + 0.3, d / 2 - 0.3); leaf.position.set(fx, 0.44, fz); g.add(leaf);
      var bl = new THREE.Mesh(C[(i + 1) % 4], pkFlowerMat(cols[i % cols.length])); bl.scale.set(0.11, 0.08, 0.11); bl.position.set(fx + randf(-0.06, 0.06), 0.56, fz + randf(-0.06, 0.06)); g.add(bl);
    }
    if (!noSolid) solid(x - w / 2, x + w / 2, z - d / 2, z + d / 2, 0, 0.5);
    return g;
  }
  var PK_FLOWER_MATS = {};
  function pkFlowerMat(c) { return PK_FLOWER_MATS[c] || (PK_FLOWER_MATS[c] = std({ color: c, roughness: 0.7 })); }
  // a queue railing: round posts every 1.6 m and two round rails, with a solid the length of the run
  function pkRailRun(x0, z0, x1, z1, opt) {
    opt = opt || {}; var M = pkMats(), mat = opt.mat || M.steel, y = opt.y || 0, hh = opt.h || 1.05;
    var dx = x1 - x0, dz = z1 - z0, len = Math.sqrt(dx * dx + dz * dz), n = Math.max(1, Math.round(len / 1.6));
    for (var i = 0; i <= n; i++) { var t = i / n; cyl(0.035, hh, mat, x0 + dx * t, y + hh / 2, z0 + dz * t, opt.parent, 10); cyl(0.05, 0.04, mat, x0 + dx * t, y + 0.02, z0 + dz * t, opt.parent, 10); }
    pkRod(x0, y + hh, z0, x1, y + hh, z1, 0.032, mat, opt.parent, 10);
    pkRod(x0, y + hh * 0.5, z0, x1, y + hh * 0.5, z1, 0.022, mat, opt.parent, 8);
    if (opt.solid !== false) solid(Math.min(x0, x1) - 0.06, Math.max(x0, x1) + 0.06, Math.min(z0, z1) - 0.06, Math.max(z0, z1) + 0.06, y, y + hh + 0.1);
  }
  // the park boundary: square iron posts every 2.5 m with ball caps, a palisade of spear-topped bars between, solid all along
  function pkPalisade(x0, z0, x1, z1) {
    var M = pkMats(), dx = x1 - x0, dz = z1 - z0, len = Math.sqrt(dx * dx + dz * dz), n = Math.max(1, Math.round(len / 2.5)), rot = Math.atan2(-dz, dx), seg = len / n;
    for (var i = 0; i <= n; i++) {
      var t = i / n, px = x0 + dx * t, pz = z0 + dz * t;
      box(0.12, 1.95, 0.12, M.iron, px, 0.975, pz); sphere(0.08, M.gold, px, 2.02, pz);
      box(0.3, 0.12, 0.3, M.stone, px, 0.06, pz);
      if (i < n) {
        var mx = x0 + dx * (t + 0.5 / n), mz = z0 + dz * (t + 0.5 / n);
        var pl = new THREE.Mesh(cachedGeo('pkpal' + seg.toFixed(2), function () { var g = new THREE.PlaneGeometry(seg - 0.12, 1.8), uv = g.attributes.uv; for (var u = 0; u < uv.count; u++) uv.setX(u, uv.getX(u) * (seg - 0.12) / 2); return g; }), M.palisade);
        pl.position.set(mx, 0.95, mz); pl.rotation.y = rot; pl.castShadow = true; parentOf(null).add(pl);
        var kb = box(seg, 0.16, 0.2, M.stone, mx, 0.08, mz); kb.rotation.y = rot;
      }
    }
    solid(Math.min(x0, x1) - 0.08, Math.max(x0, x1) + 0.08, Math.min(z0, z1) - 0.08, Math.max(z0, z1) + 0.08, 0, 2.1);
  }
  var PK_SPEAR_GEO = null;
  function pkSpearGeo() {
    return PK_SPEAR_GEO || (PK_SPEAR_GEO = new THREE.ConeGeometry(0.5, 1, 4, 1));
  }
  // the park's own fence, the one that keeps the queue in line and the boundary neat: cast-iron posts on stone plinths with
  // gold spear caps, a top and bottom rail, and slim bars between. opt: { y: ground height, h: height, bars: false, solid: false }
  // It is a world item of kind 'fence', so the editor's moves and copies of the old fence still land on it.
  function pkParkFence(x0, z0, x1, z1, opt) { return worldItem('fence', function () {
    opt = opt || {}; var M = pkMats(), Y = opt.y || 0, H = opt.h || 1.9, bars = opt.bars !== false;
    var dx = x1 - x0, dz = z1 - z0, len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.01) return;
    var n = Math.max(1, Math.round(len / 1.9)), rot = Math.atan2(-dz, dx), seg = len / n;
    var ux = Math.cos(rot), uz = -Math.sin(rot);           // the run direction, so bars can be spaced along it
    for (var i = 0; i <= n; i++) {
      var t = i / n, px = x0 + dx * t, pz = z0 + dz * t;
      box(0.17, 0.16, 0.17, M.stoneDark, px, Y + 0.08, pz);                       // plinth
      box(0.075, H, 0.075, M.iron, px, Y + H / 2, pz);                            // post
      var tip = new THREE.Mesh(pkSpearGeo(), M.gold);
      tip.position.set(px, Y + H + 0.09, pz); tip.scale.set(0.085, 0.2, 0.085);
      tip.rotation.y = Math.PI / 4; tip.castShadow = true; parentOf(null).add(tip);
      if (i < n) {
        var mx = x0 + dx * (t + 0.5 / n), mz = z0 + dz * (t + 0.5 / n);
        [H * 0.93, H * 0.14].forEach(function (ry) { var r = box(seg - 0.09, 0.05, 0.05, M.iron, mx, Y + ry, mz); r.rotation.y = rot; });
        if (bars) {
          var nb = Math.max(2, Math.round((seg - 0.2) / 0.22));
          for (var b = 1; b < nb; b++) {
            var off = (b / nb) * seg - seg / 2;
            var bar = box(0.026, H * 0.79, 0.026, M.iron, mx + ux * off, Y + H * 0.535, mz + uz * off);
            bar.rotation.y = rot;
          }
        }
      }
    }
    if (opt.solid !== false) solid(Math.min(x0, x1) - 0.07, Math.max(x0, x1) + 0.07, Math.min(z0, z1) - 0.07, Math.max(z0, z1) + 0.07, Y, Y + H + 0.12);
  }, opt && opt.parent); }
  // ── Shared ride-booth shell ────────────────────────────────────
  // One parametric cabin every ride booth and the coaster operator room
  // draw from: cream/red or theme-tinted walls, striped tented canopy,
  // scalloped valance, plinth strips, planters, lanterns and signal lamps.
  function pkCss(c) { if (typeof c === 'string') return c; var s = c.toString(16); while (s.length < 6) s = '0' + s; return '#' + s; }
  function pkTexBoothStripes(a, b, n) {
    return tex(512, 128, function (c, w, h) {
      var k = n || 10;
      for (var i = 0; i < k; i++) { c.fillStyle = i % 2 ? b : a; c.fillRect(Math.floor(i * w / k), 0, Math.ceil(w / k) + 1, h); }
      c.fillStyle = 'rgba(255,255,255,0.07)';
      for (var x = 0; x < w; x += 4) c.fillRect(x, 0, 1, h);
      var gr = c.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, 'rgba(255,255,255,0.10)'); gr.addColorStop(0.55, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.16)');
      c.fillStyle = gr; c.fillRect(0, 0, w, h);
      grain(c, w, h, 900, 0.035, true);
    }, 1, 1);
  }
  function pkTexValance(a, b, n) {
    // scalloped valance strip drawn procedurally so every booth matches
    return tex(512, 128, function (c, w, h) {
      var k = n || 8, sw = w / k;
      c.clearRect(0, 0, w, h);
      c.fillStyle = b; c.fillRect(0, 0, w, h * 0.34);
      c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(0, h * 0.34, w, 3);
      for (var i = 0; i < k; i++) {
        var cx = i * sw + sw / 2;
        c.fillStyle = i % 2 ? a : b;
        c.beginPath(); c.moveTo(i * sw, h * 0.34);
        c.lineTo(i * sw + sw, h * 0.34);
        c.lineTo(i * sw + sw, h * 0.62);
        c.arc(cx, h * 0.62, sw / 2, 0, Math.PI, false);
        c.closePath(); c.fill();
        c.strokeStyle = 'rgba(40,25,15,0.55)'; c.lineWidth = 3; c.stroke();
      }
      grain(c, w, h, 500, 0.04, true);
    }, 1, 1);
  }
  function pkBoothRoofMat(a, b) {
    // stripes run eave-to-ridge so the mapping wraps each slope cleanly
    var t = pkTexBoothStripes(pkCss(a), pkCss(b), 10);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.2, 1);
    return std({ map: t, roughness: 0.82, side: THREE.DoubleSide });
  }
  function pkValanceMat(a, b) {
    var t = pkTexValance(pkCss(a), pkCss(b), 8);
    t.wrapS = THREE.RepeatWrapping;
    return std({ map: t, transparent: true, roughness: 0.85, side: THREE.DoubleSide });
  }
  // a striped canvas awning: a quarter-round sweep w wide, d out from the wall and h tall, its back at the wall (local z 0)
  function pkAwning(w, d, h, a, b, x, y, z, ry, parent) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parentOf(parent).add(g);
    var geo = new THREE.CylinderGeometry(1, 1, w, 10, 1, true, 0, Math.PI / 2), pos = geo.attributes.position;
    // the open quarter cylinder, stretched to d by h and turned so it sweeps out from the wall and down
    for (var k = 0; k < pos.count; k++) { var px = pos.getX(k), pz = pos.getZ(k); pos.setXYZ(k, pos.getY(k), px * h, pz * d); }
    geo.computeVertexNormals();
    var m = new THREE.Mesh(geo, pkStripes(a, b)); m.position.set(0, 0, 0); m.castShadow = true; g.add(m);
    // the scalloped valance along its front edge
    for (var s = 0; s < Math.round(w / 0.4); s++) {
      var v = new THREE.Mesh(cachedGeo('pkscal', function () { return new THREE.CircleGeometry(0.2, 10, Math.PI, Math.PI); }), s % 2 ? pkStripes(b, b) : pkStripes(a, a));
      v.position.set(-w / 2 + 0.2 + s * 0.4, 0.02, d); g.add(v);
    }
    return g;
  }
  // perimeter plinth strips instead of a filled slab: four stone kerbs
  function pkBoothPlinth(w, d, mat, parent) {
    var M = mat || pkMats().stoneDark, t = 0.22, h = 0.24;
    pkBevelBox(w + t * 2, h, t, M, 0, h / 2, d / 2 + t / 2, parent, 0.02);
    pkBevelBox(w + t * 2, h, t, M, 0, h / 2, -d / 2 - t / 2, parent, 0.02);
    pkBevelBox(t, h, d, M, w / 2 + t / 2, h / 2, 0, parent, 0.02);
    pkBevelBox(t, h, d, M, -w / 2 - t / 2, h / 2, 0, parent, 0.02);
  }
  // a building's plinth as a band round its outside, never a block under its floor: the rectangle is the outer wall line, the
  // band runs t outward from it, h high from y (0 by default), and breaks for each gap ({ side: 'x0' | 'x1' | 'z0' | 'z1', a, b }:
  // a door's span). Up a wall it makes a cornice or a string course the same way
  function pkPlinthRing(x0, x1, z0, z1, h, t, mat, parent, gaps, y) {
    y = y || 0;
    var sides = [['z0', x0 - t, x1 + t, z0], ['z1', x0 - t, x1 + t, z1], ['x0', z0, z1, x0], ['x1', z0, z1, x1]];
    sides.forEach(function (sd) {
      var runs = [[sd[1], sd[2]]];
      (gaps || []).forEach(function (gp) {
        if (gp.side !== sd[0]) return;
        var o = []; runs.forEach(function (r) { if (gp.b <= r[0] || gp.a >= r[1]) { o.push(r); return; } if (gp.a > r[0]) o.push([r[0], gp.a]); if (gp.b < r[1]) o.push([gp.b, r[1]]); }); runs = o;
      });
      var out = sd[0] === 'z0' || sd[0] === 'x0' ? -1 : 1, at = sd[3] + out * t / 2;
      runs.forEach(function (r) {
        var len = r[1] - r[0], m = (r[0] + r[1]) / 2; if (len < 0.02) return;
        if (sd[0].charAt(0) === 'z') box(len, h, t, mat, m, y + h / 2, at, parent); else box(t, h, len, mat, at, y + h / 2, m, parent);
      });
    });
  }
  var PK_PLANTER_COLS =[0xd94f6a, 0xf3c84a, 0xe7e2f2, 0xb85cc7, 0xf08a3c, 0xf2f2f2];
  function pkPlanter(w, parent, x, y, z) {
    var M = pkMats(), g = new THREE.Group(); g.position.set(x, y, z); parentOf(parent).add(g);
    pkBevelBox(w, 0.34, 0.52, pkMatStone(), 0, 0.17, 0, g, 0.03);
    pkBevelBox(w - 0.16, 0.07, 0.40, M.soil, 0, 0.36, 0, g, 0.015);
    var n = Math.max(4, Math.round(w * 5));
    for (var i = 0; i < n; i++) {
      var fx = (w / 2 - 0.18) * (n === 1 ? 0 : (2 * i / (n - 1) - 1));
      pkRoundCyl(0.022, 0.22, M.hedge, fx, 0.48, 0, g, 5);
      var bl = new THREE.Mesh(cachedGeo('pkbloom8', function () { return new THREE.SphereGeometry(0.075, 8, 6); }),
        pkFlowerMat(PK_PLANTER_COLS[i % PK_PLANTER_COLS.length]));
      bl.position.set(fx, 0.62, 0); bl.castShadow = true; g.add(bl);
    }
    return g;
  }
  function pkBoothLantern(parent, x, y, z) {
    var M = pkMats();
    pkRoundCyl(0.025, 0.22, M.iron, x, y + 0.14, z, parent, 6);
    pkBevelBox(0.16, 0.24, 0.16, M.iron, x, y, z, parent, 0.015);
    pkBevelBox(0.12, 0.16, 0.12, glowMat(0xffd9a0, 1.1), x, y, z, parent, 0.008);
    var cap = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.10, 6), M.iron);
    cap.position.set(x, y + 0.17, z); cap.castShadow = true; parentOf(parent).add(cap);
    sphere(0.035, M.gold, x, y + 0.24, z, parent);
  }
  function pkBoothFinial(parent, x, y, z) {
    var M = pkMats();
    pkRoundCyl(0.035, 0.30, M.iron, x, y + 0.15, z, parent, 8);
    sphere(0.075, M.gold, x, y + 0.34, z, parent);
  }
  // striped tented canopy: hipped pyramid in theme stripes with a
  // scalloped valance, fascia boards, ridge finial. Returns eave/roof Y.
  function pkBoothTentRoof(g, o) {
    var M = pkMats(), W = o.w, D = o.d, wallTop = o.wallTop;
    var roofH = o.roofH || 0.95, ov = 0.42;
    var roof = new THREE.Mesh(new THREE.ConeGeometry(Math.SQRT1_2, roofH, 4, 1), pkBoothRoofMat(o.roofA, o.roofB));
    roof.geometry.rotateY(Math.PI / 4); roof.geometry.translate(0, roofH / 2, 0);
    roof.scale.set(W + ov * 2, 1, D + ov * 2);
    roof.position.set(0, wallTop, 0); roof.castShadow = true; roof.receiveShadow = true; g.add(roof);
    var trimM = o.trimMat || M.iron;
    pkBevelBox(W + ov * 2 + 0.06, 0.16, 0.07, trimM, 0, wallTop - 0.02, (D + ov * 2) / 2, g, 0.012);
    pkBevelBox(W + ov * 2 + 0.06, 0.16, 0.07, trimM, 0, wallTop - 0.02, -(D + ov * 2) / 2, g, 0.012);
    pkBevelBox(0.07, 0.16, D + ov * 2 + 0.06, trimM, (W + ov * 2) / 2, wallTop - 0.02, 0, g, 0.012);
    pkBevelBox(0.07, 0.16, D + ov * 2 + 0.06, trimM, -(W + ov * 2) / 2, wallTop - 0.02, 0, g, 0.012);
    var vMat = pkValanceMat(o.roofA, o.roofB), vH = 0.30;
    [[0, (D + ov * 2) / 2, W + ov * 2, 0], [0, -(D + ov * 2) / 2, W + ov * 2, 0]].forEach(function (s) {
      var vm = new THREE.Mesh(new THREE.PlaneGeometry(s[2], vH), vMat);
      vm.position.set(s[0], wallTop - 0.10 - vH / 2 + 0.06, s[1]); if (s[1] < 0) vm.rotation.y = Math.PI; g.add(vm);
    });
    [[(W + ov * 2) / 2, 0, D + ov * 2], [-(W + ov * 2) / 2, 0, D + ov * 2]].forEach(function (s2) {
      var vm2 = new THREE.Mesh(new THREE.PlaneGeometry(s2[2], vH), vMat);
      vm2.rotation.y = Math.PI / 2; vm2.position.set(s2[0], wallTop - 0.10 - vH / 2 + 0.06, s2[1]); g.add(vm2);
    });
    pkBoothFinial(g, 0, wallTop + roofH - 0.04, 0);
    return { roofY: wallTop + roofH, eaveY: wallTop - 0.10 };
  }
