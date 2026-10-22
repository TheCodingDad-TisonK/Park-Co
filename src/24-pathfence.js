//@ Park Co, part 24: the path fence - a low iron rail along every paved edge, and the player keeps to the paving
  // ── Why ──────────────────────────────────────────────────────────
  // The park is paths, plazas and ride pads laid on a lawn, and nothing kept the player on them: you could walk off any street
  // and across the grass to anywhere. This part reads the paving the world actually laid (every flat thing at ground level that
  // is not grass or water), draws a waist-high rail along its edge, and keeps the player, the guests and the NPCs on it. It
  // follows the paving by itself, so a new street or plaza gets its rail with no list to keep, and an editor move of a prop
  // redraws it.
  //   The mask: one top-down render of the ground-level meshes into a 0.5 m grid (the originals the bake hid are drawn for it),
  // plus the raised floors floorY knows (the platform, the booth steps). Specks under 15 m² are dropped, gaps under 6 m² filled.
  //   The rail: the edge of the mask is traced into loops, straightened, and broken wherever the grass side already has a wall,
  // a hedge or a fence of its own, or lies outside the palisade.
  //   The rule: inside the palisade and at ground level, a step that puts more of you on the grass is refused; a step back
  // toward the paving never is, so nobody dropped on the lawn by the editor is stuck there.
  var PK_PF = { m: null, block: null, W: 0, D: 0, X0: 0, Z0: 0, C: 0.5, group: null, dirty: 0, runs: 0, posts: 0 };
  var PK_PF_H = 0.95;   // the rail's height

  function pkPfMask() {
    var P = PK_PF, C = P.C;
    P.X0 = PK_PARK.x0 - 2; P.Z0 = PK_PARK.z0 - 2;
    P.W = Math.round((PK_PARK.x1 + 2 - P.X0) / C); P.D = Math.round((74 - P.Z0) / C);
    var W = P.W, D = P.D, X1 = P.X0 + W * C, Z1 = P.Z0 + D * C;
    // the ground-level meshes: flat, low, not the lawn, not grass, not water
    var M = pkMats(), bb = new THREE.Box3(), cand = [], lift = [];
    scene.updateMatrixWorld(true);
    scene.traverse(function (o) {
      if (!o.isMesh || o.isInstancedMesh || !o.geometry || o.userData.baked || o.userData.pkPathFence) return;
      var mt = o.material; if (!mt || Array.isArray(mt) || mt === MAT.grass || mt === M.water) return;
      if (mt.map && TEX.grass && mt.map.image === TEX.grass.image) return;
      var g = o.geometry; if (!g.boundingBox) g.computeBoundingBox();
      bb.copy(g.boundingBox).applyMatrix4(o.matrixWorld);
      if (!(bb.max.y < 0.3 && bb.max.y > -0.1 && bb.max.y - bb.min.y < 0.3) || bb.max.x - bb.min.x > 300) return;
      if (!o.visible && !o.userData.bakedAway) return;
      for (var p = o.parent; p; p = p.parent) if (!p.visible) return;
      cand.push(o);
    });
    var cam = new THREE.OrthographicCamera(P.X0, X1, -P.Z0, -Z1, 0.1, 60);
    cam.up.set(0, 0, -1); cam.position.set(0, 30, 0); cam.lookAt(0, 0, 0); cam.updateMatrixWorld(); cam.layers.set(7);
    var rt = new THREE.WebGLRenderTarget(W, D), white = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    cand.forEach(function (o) { lift.push([o.visible, o.layers.mask]); o.visible = true; o.layers.enable(7); });
    var ov = scene.overrideMaterial, bg = scene.background, fog = scene.fog, cc = new THREE.Color(), ca = renderer.getClearAlpha();
    renderer.getClearColor(cc);
    scene.overrideMaterial = white; scene.background = null; scene.fog = null; renderer.setClearColor(0x000000, 1);
    var px = new Uint8Array(W * D * 4);
    renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, cam); renderer.readRenderTargetPixels(rt, 0, 0, W, D, px); renderer.setRenderTarget(null);
    scene.overrideMaterial = ov; scene.background = bg; scene.fog = fog; renderer.setClearColor(cc, ca);
    cand.forEach(function (o, i) { o.visible = lift[i][0]; o.layers.mask = lift[i][1]; });
    rt.dispose(); white.dispose();
    // the render's rows run from the bottom (z1) up
    var m = new Uint8Array(W * D);
    for (var j = 0; j < D; j++) for (var i = 0; i < W; i++) {
      var x = P.X0 + (i + 0.5) * C, z = P.Z0 + (j + 0.5) * C;
      m[j * W + i] = px[((D - 1 - j) * W + i) * 4] > 127 || floorY(x, z, 0) > 0.02 ? 1 : 0;
    }
    pkPfClose(m, W, D, 2);       // a strip of lawn under 2 m between two pavings (a doorway, a booth's steps) is walked across
    pkPfClean(m, W, D, 1, 60);   // a stray slab or a step stone on the lawn is no path
    pkPfClean(m, W, D, 0, 24);   // a crack between two slabs is no lawn
    P.m = m;
  }
  // a closing: grow the paving r cells, then shrink it back, so the gaps narrower than 2r fill and the edges stay where they were
  function pkPfClose(m, W, D, r) {
    function pass(src, grow) {
      var a = new Uint8Array(W * D), b = new Uint8Array(W * D), i, j, k, v;
      for (j = 0; j < D; j++) for (i = 0; i < W; i++) {
        v = grow ? 0 : 1;
        for (k = -r; k <= r; k++) { var ii = i + k; var s = ii < 0 || ii >= W ? (grow ? 0 : 1) : src[j * W + ii]; if (grow ? s : !s) { v = grow ? 1 : 0; break; } }
        a[j * W + i] = v;
      }
      for (j = 0; j < D; j++) for (i = 0; i < W; i++) {
        v = grow ? 0 : 1;
        for (k = -r; k <= r; k++) { var jj = j + k; var t = jj < 0 || jj >= D ? (grow ? 0 : 1) : a[jj * W + i]; if (grow ? t : !t) { v = grow ? 1 : 0; break; } }
        b[j * W + i] = v;
      }
      return b;
    }
    m.set(pass(pass(m, true), false));
  }
  // flood the 4-connected pieces of value v; a piece smaller than n cells (and, for the lawn, not touching the edge) flips
  function pkPfClean(m, W, D, v, n) {
    var seen = new Uint8Array(W * D), stack = [], piece = [];
    for (var s = 0; s < W * D; s++) {
      if (seen[s] || m[s] !== v) continue;
      stack.length = 0; piece.length = 0; stack.push(s); seen[s] = 1; var edge = false;
      while (stack.length) {
        var k = stack.pop(), i = k % W, j = (k - i) / W; piece.push(k);
        if (i === 0 || j === 0 || i === W - 1 || j === D - 1) edge = true;
        if (i > 0 && !seen[k - 1] && m[k - 1] === v) { seen[k - 1] = 1; stack.push(k - 1); }
        if (i < W - 1 && !seen[k + 1] && m[k + 1] === v) { seen[k + 1] = 1; stack.push(k + 1); }
        if (j > 0 && !seen[k - W] && m[k - W] === v) { seen[k - W] = 1; stack.push(k - W); }
        if (j < D - 1 && !seen[k + W] && m[k + W] === v) { seen[k + W] = 1; stack.push(k + W); }
      }
      if (piece.length < n && !(v === 0 && edge)) for (var q = 0; q < piece.length; q++) m[piece[q]] = 1 - v;
    }
  }
  // inside the palisade: the park, the forecourt and the car park. Outside it the grass is nobody's business
  function pkPfInside(x, z) { return x > PK_PARK.x0 && x < PK_PARK.x1 && z > PK_PARK.z0 && z < 71.5 && !(x < -32.5 && z > PK_KIDS_Z); }

  // the lawn cells the player may not stand on, and the ones a rail would only double: a solid already stands there
  function pkPfBlockers() {
    var P = PK_PF, W = P.W, D = P.D, C = P.C, block = new Uint8Array(W * D), walled = new Uint8Array(W * D), pad = 0.8;
    for (var j = 0; j < D; j++) for (var i = 0; i < W; i++) {
      var k = j * W + i; if (P.m[k]) continue;
      if (pkPfInside(P.X0 + (i + 0.5) * C, P.Z0 + (j + 0.5) * C)) block[k] = 1;
    }
    solids.forEach(function (s) {
      if (s.y0 > 1.2 || s.y1 < 0.3) return;
      if (Math.max(s.x1 - s.x0, s.z1 - s.z0) < 1.2) return;   // a lamp post or a bin beside the kerb is no wall: the rail runs past it
      var i0 = Math.max(0, Math.floor((s.x0 - pad - P.X0) / C)), i1 = Math.min(W - 1, Math.floor((s.x1 + pad - P.X0) / C));
      var j0 = Math.max(0, Math.floor((s.z0 - pad - P.Z0) / C)), j1 = Math.min(D - 1, Math.floor((s.z1 + pad - P.Z0) / C));
      for (var jj = j0; jj <= j1; jj++) for (var ii = i0; ii <= i1; ii++) walled[jj * W + ii] = 1;
    });
    P.block = block; P.walled = walled;
  }

  // ── The rail ─────────────────────────────────────────────────────
  // every edge between a paved cell and a lawn cell, wound with the paving on its left, chained into loops
  function pkPfTrace() {
    var P = PK_PF, W = P.W, D = P.D, m = P.m, edges = [], from = {};
    function add(ax, az, bx, bz, g) { var e = { a: ax + ',' + az, b: bx + ',' + bz, ax: ax, az: az, bx: bx, bz: bz, g: g, used: false }; edges.push(e); (from[e.a] = from[e.a] || []).push(e); }
    for (var j = 0; j < D; j++) for (var i = 0; i < W; i++) {
      var k = j * W + i; if (!m[k]) continue;
      if (j === 0 || !m[k - W]) add(i, j, i + 1, j, j ? k - W : -1);
      if (i === W - 1 || !m[k + 1]) add(i + 1, j, i + 1, j + 1, i < W - 1 ? k + 1 : -1);
      if (j === D - 1 || !m[k + W]) add(i + 1, j + 1, i, j + 1, j < D - 1 ? k + W : -1);
      if (i === 0 || !m[k - 1]) add(i, j + 1, i, j, i ? k - 1 : -1);
    }
    var loops = [];
    edges.forEach(function (e0) {
      if (e0.used) return;
      var loop = [], e = e0;
      while (e && !e.used) {
        e.used = true; loop.push(e);
        var nx = from[e.b], next = null;
        if (nx) for (var q = 0; q < nx.length; q++) if (!nx[q].used) { next = nx[q]; break; }
        e = next;
      }
      loops.push(loop);
    });
    return loops;
  }
  // a rail stands on an edge whose lawn side is inside the palisade and has no wall of its own
  function pkPfRuns(loops) {
    var P = PK_PF, runs = [];
    loops.forEach(function (loop) {
      var ok = loop.map(function (e) { return e.g >= 0 && P.block[e.g] && !P.walled[e.g]; });
      var n = loop.length, start = ok.indexOf(false), cur = null;
      if (start < 0) { runs.push(loop.map(function (e) { return [e.ax, e.az]; }).concat([[loop[0].ax, loop[0].az]])); return; }
      for (var t = 1; t <= n; t++) {
        var q = (start + t) % n, e = loop[q];
        if (ok[q]) { if (!cur) cur = [[e.ax, e.az]]; cur.push([e.bx, e.bz]); }
        else if (cur) { runs.push(cur); cur = null; }
      }
      if (cur) runs.push(cur);
    });
    // grid corners to metres, and the stair steps of a curve or a slant pulled straight
    return runs.map(function (r) { return pkPfSimplify(r.map(function (p) { return [P.X0 + p[0] * P.C, P.Z0 + p[1] * P.C]; }), 0.36); })
      .filter(function (r) { var L = 0; for (var i = 1; i < r.length; i++) L += Math.hypot(r[i][0] - r[i - 1][0], r[i][1] - r[i - 1][1]); return L >= 1.4; });
  }
  // Douglas-Peucker: keep the corners, drop the points a straight line passes within tol of
  function pkPfSimplify(pts, tol) {
    if (pts.length < 3) return pts;
    var keep = new Uint8Array(pts.length), stack = [[0, pts.length - 1]]; keep[0] = keep[pts.length - 1] = 1;
    while (stack.length) {
      var s = stack.pop(), a = pts[s[0]], b = pts[s[1]], best = -1, bd = tol;
      for (var i = s[0] + 1; i < s[1]; i++) { var d = pkSegDist(pts[i][0], pts[i][1], a[0], a[1], b[0], b[1]); if (d > bd) { bd = d; best = i; } }
      if (best > 0) { keep[best] = 1; stack.push([s[0], best], [best, s[1]]); }
    }
    return pts.filter(function (p, i) { return keep[i]; });
  }
  // the rail itself: cast-iron posts with a gold ball, a top rail and a mid rail, all instanced so a park of it is three draws
  function pkPfBuildRail(runs) {
    var P = PK_PF, M = pkMats();
    if (P.group) { scene.remove(P.group); P.group.children.forEach(function (c) { c.geometry.dispose(); }); P.group = null; }
    var posts = [], rails = [];
    runs.forEach(function (r) {
      for (var i = 0; i < r.length; i++) {
        posts.push(r[i]);
        if (i === r.length - 1) break;
        var a = r[i], b = r[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(len / 1.8));
        for (var k = 1; k < n; k++) posts.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
        rails.push([a, b, len]);
      }
    });
    var g = new THREE.Group(); g.userData.pkPathFence = true; g.userData.dynamic = true;
    var postM = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, PK_PF_H, 0.07), M.iron, posts.length);
    var capM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 10, 6), M.gold, posts.length);
    var railM = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.045, 0.04), M.iron, rails.length * 2);
    var mx = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(1, 1, 1), up = new THREE.Vector3(0, 1, 0);
    posts.forEach(function (p, i) {
      mx.makeTranslation(p[0], PK_PF_H / 2, p[1]); postM.setMatrixAt(i, mx);
      mx.makeTranslation(p[0], PK_PF_H + 0.04, p[1]); capM.setMatrixAt(i, mx);
    });
    rails.forEach(function (r, i) {
      var a = r[0], b = r[1]; q.setFromAxisAngle(up, Math.atan2(-(b[1] - a[1]), b[0] - a[0])); sc.set(r[2], 1, 1);
      [PK_PF_H - 0.06, PK_PF_H * 0.45].forEach(function (y, h) { v.set((a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2); mx.compose(v, q, sc); railM.setMatrixAt(i * 2 + h, mx); });
    });
    [postM, capM, railM].forEach(function (im) { im.castShadow = true; im.receiveShadow = true; im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; im.userData.pkPathFence = true; g.add(im); });
    scene.add(g); P.group = g; P.runs = runs.length; P.posts = posts.length;
    if (typeof shadowDirty !== 'undefined') shadowDirty = true;
  }
  function pkPathFence() {
    var t0 = performance.now();
    pkPfMask(); pkPfBlockers(); pkPfBuildRail(pkPfRuns(pkPfTrace()));
    PK_PF.ms = Math.round(performance.now() - t0);
    NAV.dirty = true;   // the route finder rebuilds its grid with the lawn shut
  }

  // ── The rule ─────────────────────────────────────────────────────
  function pkPfLawn(x, z) {
    var P = PK_PF, i = Math.floor((x - P.X0) / P.C), j = Math.floor((z - P.Z0) / P.C);
    return i >= 0 && j >= 0 && i < P.W && j < P.D && P.block[j * P.W + i] ? 1 : 0;
  }
  // how much of the player's footprint is on the lawn: the centre and four points round it
  function pkPfOff(x, z) { var r = 0.28; return pkPfLawn(x, z) + pkPfLawn(x - r, z) + pkPfLawn(x + r, z) + pkPfLawn(x, z - r) + pkPfLawn(x, z + r); }
  var _pkPfPrevCollides = GAME.collides;
  GAME.collides = function (x, z, opt) {
    if (_pkPfPrevCollides && _pkPfPrevCollides(x, z, opt)) return true;
    if (!PK_PF.block || PK.playerRide || player.y > 0.4) return false;
    var off = pkPfOff(x, z);
    return off > 0 && off > pkPfOff(player.x, player.z);
  };
  // the guests and the NPCs keep to the paving too. Their route finder asks insideWalk of every cell, so the lawn is shut to it;
  // and an NPC's wander picks a spot at random and walks its last leg straight there, so a spot on the lawn is moved to the
  // nearest paving it can stand on whole (the guests' own spots are all paved already: the midway, the gate, the queues)
  var _pkPfPrevInsideWalk = GAME.insideWalk;
  // a cell is open only with the lawn 0.2 m clear of its centre, so a string-pulled run past a corner does not clip the grass
  function pkPfNear(x, z) { var r = 0.2; return pkPfLawn(x, z) || pkPfLawn(x - r, z - r) || pkPfLawn(x + r, z - r) || pkPfLawn(x - r, z + r) || pkPfLawn(x + r, z + r); }
  GAME.insideWalk = function (x, z) { return (!_pkPfPrevInsideWalk || _pkPfPrevInsideWalk(x, z)) && !(PK_PF.block && pkPfNear(x, z)); };
  // the route finder's open cells that join up with the gate. A paved spot off that (the gravel path inside the coaster
  // yard's fence) is one the route finder cannot reach, and it would send the walker straight over the lawn and the fence
  function pkPfReach() {
    if (NAV.dirty || !NAV.grid) navBuild();
    if (PK_PF.reachOf === NAV.grid) return PK_PF.reach;
    var W = NAV.w, H = NAV.h, reach = new Uint8Array(W * H), s = navNearestOpen(navCell({ x: 0, z: 26 })), stack = [s.j * W + s.i];
    reach[stack[0]] = 1;
    while (stack.length) {
      var k = stack.pop(), i = k % W, j = (k - i) / W;
      [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]].forEach(function (c) { var q = c[1] * W + c[0]; if (navOpen(c[0], c[1]) && !reach[q]) { reach[q] = 1; stack.push(q); } });
    }
    PK_PF.reach = reach; PK_PF.reachOf = NAV.grid; return reach;
  }
  function pkPfReachable(x, z) { var c = navCell({ x: x, z: z }); return !!pkPfReach()[c.j * NAV.w + c.i]; }
  function pkPfOnPaving(p) {
    if (!PK_PF.block || (!pkPfLawn(p.x, p.z) && pkPfReachable(p.x, p.z))) return p;
    for (var r = 0.5; r <= 8; r += 0.5) {
      var n = Math.max(8, Math.round(r * 8)), a0 = Math.random() * Math.PI * 2;
      for (var k = 0; k < n; k++) {
        var a = a0 + k / n * Math.PI * 2, x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r;
        if (!pkPfOff(x, z) && pkPfReachable(x, z)) { var q = {}; for (var key in p) q[key] = p[key]; q.x = x; q.z = z; return q; }
      }
    }
    return p;
  }
  // with the lawn shut a walk across the park goes round by the streets, and the far rides (The Mountain King) need more of
  // the route finder's search than its default 20000 steps: short of it, it gives up and sends the walker in a straight line
  NAV.steps = 60000;
  var _pkPfNpcWalkTo = npcWalkTo;
  // (a worker's own post is where the game put it on purpose - a cashier behind a counter - and is never moved)
  npcWalkTo = function (n, p) { var post = p && n.post && p.x === n.post.x && p.z === n.post.z; return _pkPfNpcWalkTo(n, p && !post ? pkPfOnPaving(p) : p); };
  // built once the world stands, the editor's edits are on it and the bake is done; redrawn a moment after a prop moves
  hook('boot', function () { pkPathFence(); });
  ['propPlaced', 'propDeleted', 'propRemoved'].forEach(function (h) { hook(h, function () { if (PK_PF.m) PK_PF.dirty = 0.6; }); });
  hook('frame', function (dt) { if (PK_PF.dirty > 0 && (PK_PF.dirty -= dt) <= 0) { PK_PF.dirty = 0; pkPathFence(); } });
  var _pkPfT = GAME.T;
  GAME.T = function () { var t = _pkPfT(); t.PK_PF = PK_PF; t.pkPathFence = pkPathFence; t.pkPfOff = pkPfOff; t.pkPfLawn = pkPfLawn; t.pkPfOnPaving = pkPfOnPaving; return t; };
  GAME.commands.fence =function () { pkPathFence(); return 'path fence: ' + PK_PF.runs + ' runs, ' + PK_PF.posts + ' posts, ' + PK_PF.ms + ' ms'; };
