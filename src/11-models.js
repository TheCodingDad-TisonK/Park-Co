//@ Park Co, part 11: better models - richer procedural geometry for every object
// Trees, lamp posts, benches, bins, flower beds, gate, ticket booths, office,
// ride gateways, 3D signs, coaster cars and ride booths - all rebuilt with
// bevelled edges, rounded cylinders, layered materials and proper proportions.
// Nothing here replaces the layout/editor data; it only upgrades the geometry
// the build functions draw. Call these from the existing pk* builders.

// ── Material upgrades ─────────────────────────────────────────────────
function pkMatBrick() {
  return CO.material('pk-brick', {
    size: 512, repeat: [4, 4],
    layers: [
      { type: 'fill', color: '#c9c2b4' },
      { type: 'bricks', color: '#8a4a3a', color2: '#95553f', size: 64, size2: 22, gap: 2, vary: true },
      { type: 'grain', alpha: 0.12 },
      { type: 'blotches', color: '#6a3a2a', n: 40, sz: 90, dark: true }
    ],
    roughness: 0.95, metalness: 0.05,
    bump: { amp: 16, strength: 0.8 }
  });
}
function pkMatStone() {
  return CO.material('pk-stone', {
    size: 512, repeat: [3, 3],
    layers: [
      { type: 'fill', color: '#b8b6b0' },
      { type: 'grain', alpha: 0.1 },
      { type: 'cracks', color: '#505048', n: 25, sz: 120 }
    ],
    roughness: 0.9, metalness: 0.1,
    bump: { amp: 24, strength: 0.9 }
  });
}
function pkMatWoodRich() {
  return CO.material('pk-wood-rich', {
    size: 512, repeat: [2, 1],
    layers: [
      { type: 'fill', color: '#a07850' },
      { type: 'grain', alpha: 0.30 },
      { type: 'planks', color: '#9c7349', color2: '#7c5836', size: 64, vary: true, gap: 2 }
    ],
    roughness: 0.85, metalness: 0.05,
    bump: { amp: 12, strength: 0.6 }
  });
}
function pkMatMetalRich() {
  return CO.material('pk-metal-rich', {
    size: 256, repeat: [1, 1],
    layers: [
      { type: 'fill', color: '#4a5058' },
      { type: 'grain', alpha: 0.25 },
      { type: 'speckle', color: '#2a2d33', n: 2000 }
    ],
    roughness: 0.4, metalness: 0.8,
    bump: { amp: 8, strength: 0.4 }
  });
}
function pkMatGlassRich() {
  return CO.material('pk-glass-rich', {
    size: 128, repeat: [1, 1],
    layers: [
      { type: 'fill', color: '#dcecf5', alpha: 0.14 }
    ],
    roughness: 0.08, metalness: 0.04, transparent: true, opacity: 0.22
  });
}
function pkMatPlasterRich() {
  return CO.material('pk-plaster-rich', {
    size: 512, repeat: [2, 2],
    layers: [
      { type: 'fill', color: '#e9e6dc' },
      { type: 'grain', alpha: 0.10 },
      { type: 'grain', alpha: 0.05, dark: true }
    ],
    roughness: 0.93, metalness: 0.02,
    bump: { amp: 4, strength: 0.35 }
  });
}

// ── Helpers ───────────────────────────────────────────────────────────
function pkBevelBox(w, h, d, mat, x, y, z, parent, r) {
  var rOpt = r === undefined ? 0.12 : r;
  var m = new THREE.Mesh(new bevelGeo(w, h, d, rOpt, 6), mat);
  if (x !== undefined) m.position.set(x, y, z);
  if (parent) parent.add(m); else scene.add(m);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function pkRoundCyl(r, h, mat, x, y, z, parent, seg) {
  var g = new roundCylGeo(r, r, h, seg || 16);
  var m = new THREE.Mesh(g, mat);
  if (x !== undefined) m.position.set(x, y, z);
  if (parent) parent.add(m); else scene.add(m);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function pkSign3D(lines, w, h, x, y, z, ry, opt, parent) {
  var g = new THREE.Group();
  if (parent) parent.add(g); else scene.add(g);
  if (x !== undefined) g.position.set(x, y, z);
  if (ry !== undefined) g.rotation.y = ry;
  var o = opt || {};
  var bg = o.bg || '#1b232c';
  var fg = o.fg || '#f5b53d';
  var panel = pkBevelBox(w, h, 0.18, std({ color: bg, roughness: 0.9 }), 0, 0, 0.1, g, 0.04);
  var lip = pkBevelBox(w + 0.06, h + 0.06, 0.06, std({ color: '#3a3f45', roughness: 0.6 }), 0, 0, 0.16, g, 0.02);
  sign(lines, w * 0.9, h * 0.7, 0, 0, 0.2, 0, { bg: 'transparent', fg: fg }, g);
  return g;
}

// ── Tree: proper trunk with layered foliage ────────────────────────────
function pkTreeBetter(x, z, seed, scale) {
  var s = scale === undefined ? 1 : scale;
  var g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  var trunkH = 2.6 * s;
  var trunkR = 0.14 * s;
  var trunk = pkRoundCyl(trunkR, trunkH, pkMatWoodRich(), 0, trunkH / 2, 0, g, 10);
  [[0, trunkH * 0.7, 0.5, 0.6], [0.4, trunkH * 0.5, -0.4, 0.5], [-0.5, trunkH * 0.6, 0.2, 0.55]].forEach(function (b) {
    var br = new THREE.Mesh(new THREE.CylinderGeometry(b[3] * 0.5, b[3] * 0.1, b[2], 8), pkMatWoodRich());
    br.position.set(b[0], b[1] + b[2] / 2, 0);
    br.rotation.z = b[1] > trunkH * 0.6 ? -0.6 : 0.6;
    g.add(br);
  });
  var foliageCols = [0x3f6f2e, 0x5c8f44, 0x45752f, 0x6f9a4a];
  [[0, 3.4, 1.3], [0.6, 2.8, 1.0], [-0.7, 3.0, 0.9], [0.1, 4.2, 0.8], [-0.4, 2.5, 1.1], [0.5, 3.8, 0.9]].forEach(function (f, i) {
    var off = (seed || 0) * 0.37;
    var leaf = new THREE.Mesh(new THREE.SphereGeometry(f[2] * s, 12, 10), std({ color: foliageCols[i % 4], roughness: 1 }));
    leaf.position.set(f[0] * s + Math.sin(off + i) * 0.15, f[1] * s, Math.cos(off + i) * 0.15);
    leaf.castShadow = true; leaf.receiveShadow = true;
    g.add(leaf);
  });
  g.solid = { x0: -0.35 * s, x1: 0.35 * s, z0: -0.35 * s, z1: 0.35 * s, y0: 0, y1: trunkH * 1.4 };
  return g;
}

// ── Lamp post: proper housing with decorative top ──────────────────────
function pkLampBetter(x, z, h) {
  var hh = h === undefined ? 4.6 : h;
  var g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  pkRoundCyl(0.055, hh, MAT.steelDark, 0, hh / 2, 0, g, 8);
  pkBevelBox(0.5, 0.14, 0.5, MAT.steelDark, 0, 0.07, 0, g, 0.03);
  var arm = new THREE.Group(); arm.position.set(0, hh - 0.35, 0); g.add(arm);
  pkRoundCyl(0.03, 0.9, MAT.steelDark, 0, 0, 0.45, arm, 6);
  var house = pkBevelBox(0.42, 0.2, 0.32, MAT.steelDark, 0.45, 0, 0, arm, 0.03);
  var lens = pkBevelBox(0.34, 0.12, 0.26, pkMatGlassRich(), 0.45, 0, 0, arm, 0.02);
  var glow = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.22), glowMat(0xfff2c0, 0.7));
  glow.position.set(0.45, 0, 0); arm.add(glow);
  g.userData.lampLens = lens;
  return g;
}

// ── Bench: slatted seat, backrest, legs, armrests ──────────────────────
function pkBenchBetter(x, z, rot) {
  var g = new THREE.Group(); g.position.set(x, 0, z); if (rot) g.rotation.y = rot; scene.add(g);
  [[-0.85, 0, 0.15], [0.85, 0, 0.15]].forEach(function (l) {
    pkBevelBox(0.07, 0.42, 0.07, MAT.steelDark, l[0], 0.21, l[2], g, 0.02);
  });
  [-0.18, 0, 0.18].forEach(function (sy) {
    pkBevelBox(1.8, 0.05, 0.42, pkMatWoodRich(), 0, 0.45, sy, g, 0.02);
  });
  pkBevelBox(1.9, 0.06, 0.5, MAT.steelDark, 0, 0.42, 0, g, 0.02);
  [-0.18, 0, 0.18].forEach(function (sy) {
    pkBevelBox(1.8, 0.32, 0.05, pkMatWoodRich(), 0, 0.78, sy - 0.2, g, 0.02);
  });
  pkBevelBox(1.9, 0.34, 0.12, MAT.steelDark, 0, 0.78, -0.22, g, 0.02);
  [[-0.95, 0.55, 0], [0.95, 0.55, 0]].forEach(function (a) {
    pkBevelBox(0.1, 0.07, 0.5, MAT.steelDark, a[0], a[1], a[2], g, 0.02);
  });
  g.solid = { x0: -0.95, x1: 0.95, z0: -0.3, z1: 0.3, y0: 0, y1: 0.9 };
  return g;
}

// ── Bin: pedal bin with liner rim and foot pedal ───────────────────────
function pkBinBetter(x, z) {
  var g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  pkRoundCyl(0.36, 0.92, MAT.green, 0, 0.46, 0, g, 14);
  pkBinLid(g, MAT.steelDark);
  var pedal = pkBevelBox(0.22, 0.04, 0.12, MAT.steelDark, 0, 0.05, 0.42, g, 0.02);
  pedal.rotation.x = 0.25;
  pkRoundCyl(0.015, 0.1, MAT.steelDark, 0, 0.07, 0.48, g, 6);
  g.solid = { x0: -0.45, x1: 0.45, z0: -0.45, z1: 0.45, y0: 0, y1: 1.05 };
  return g;
}

// ── Flower bed: stone edging, soil, varied flowers ─────────────────────
function pkFlowerBedBetter(x, z, w, d) {
  var g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  pkBevelBox(w, 0.3, d, pkMatStone(), 0, 0.15, 0, g, 0.04);
  pkBevelBox(w - 0.1, 0.16, d - 0.1, std({ color: 0x5d4037, roughness: 1 }), 0, 0.31, 0, g, 0.02);
  var cols = [0xd94f4f, 0xf0c04a, 0xe08fc0, 0xf2f2f2, 0xff8a3d];
  var n = Math.floor((w * d) / 2);
  for (var i = 0; i < n; i++) {
    var fx = (Math.random() - 0.5) * (w - 0.2);
    var fz = (Math.random() - 0.5) * (d - 0.2);
    var col = cols[i % cols.length];
    var flower = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), std({ color: col, roughness: 0.8 }));
    flower.position.set(fx, 0.41, fz);
    g.add(flower);
  }
  g.solid = { x0: -w/2, x1: w/2, z0: -d/2, z1: d/2, y0: 0, y1: 0.5 };
  return g;
}

// ── The ticket offices ─────────────────────────────────────────────
// A little ticket office either side of the gate, a proper building you can walk into: a brick plinth, cream walls with
// timber framing, side windows with flower boxes, a door on the side toward the gate path with a lantern over it, and the
// slate spire on top (part 20). Inside: the counter under the front window with the till, the ticket printer, the bell and
// the window's screen; a chair to sit and serve from; a safe, shelves of ticket rolls, the noticeboard, a wall clock and a
// pendant lamp. Outside: the self-service machine on the outer wall, and the line forms in front of the window.
var PK_TK = { W: 4.6, D: 3.6, H: 3.0, T: 0.18 };
function pkTicketBoothBetter(b, i) {
  var g = new THREE.Group(); g.position.set(b.x, 0, b.z); scene.add(g);   // an editor item like any building (its door and machine move with it)
  var side = b.x < 0 ? 1 : -1;                                        // toward the gate path (x = 0)
  var K = PK_TK, HW = K.W / 2, HD = K.D / 2, T = K.T, H = K.H;
  var cream = pkMatPlasterRich(), wood = pkMatWoodRich();
  var timber = std({ color: 0x5a3e28, roughness: 0.8 }), brick = std({ color: 0x9a5b45, roughness: 0.9 });
  var glass = std({ color: 0xd8eef4, roughness: 0.07, metalness: 0.12, transparent: true, opacity: 0.18 });
  var iron = std({ color: 0x1f2a24, roughness: 0.45, metalness: 0.55 }), gold = std({ color: 0xc9a227, roughness: 0.35, metalness: 0.8 });
  // the floor and the plinth
  pkPaved(K.W - 0.2, K.D - 0.2, std({ color: 0x8a6a4a, roughness: 0.8, map: (MAT.wood && MAT.wood.map) || null }), 0, 0.035, 0, 0.9, g);
  var ceil = box(K.W - 0.2, 0.04, K.D - 0.2, std({ color: 0xf1e6cc, roughness: 0.9 }), 0, H - 0.04, 0, g); ceil.castShadow = false;
  // walls: the back, the outer side (with a window), the door side (with the door and a window), the front (the counter window)
  var DZ0 = -1.15, DZ1 = -0.15, SW0 = 0.15, SW1 = 1.25;                    // the door, and the side window, along z
  var wallZ = function (x, z0, z1, y0, y1) { box(T, y1 - y0, z1 - z0, cream, x, (y0 + y1) / 2, (z0 + z1) / 2, g); };
  box(K.W, H, T, cream, 0, H / 2, -HD + T / 2, g);                                        // back
  [-side, side].forEach(function (sx) {
    var x = sx * (HW - T / 2), door = sx === side;
    if (door) { wallZ(x, -HD, DZ0, 0, H); wallZ(x, DZ0, DZ1, 2.08, H); wallZ(x, DZ1, SW0, 0, H); }
    else wallZ(x, -HD, SW0, 0, H);
    wallZ(x, SW0, SW1, 0, 1.05); wallZ(x, SW0, SW1, 2.15, H); wallZ(x, SW1, HD, 0, H);  // the side window
    box(0.03, 1.1, SW1 - SW0 - 0.06, glass, x, 1.6, (SW0 + SW1) / 2, g);
    // a flower box under the side window, outside
    box(0.28, 0.22, SW1 - SW0, wood, x + sx * 0.22, 0.95, (SW0 + SW1) / 2, g);
    for (var f = 0; f < 4; f++) sphere(0.09, std({ color: [0xd94f6a, 0xf3c84a, 0xf4f1e6, 0xd94f6a][f], roughness: 0.9 }), x + sx * 0.22, 1.1, SW0 + 0.15 + f * 0.27, g);
  });
  box(K.W, 0.95, T, cream, 0, 0.475, HD - T / 2, g);                                     // under the front window
  box(K.W, H - 2.3, T, cream, 0, 2.3 + (H - 2.3) / 2, HD - T / 2, g);                    // over it
  box(K.W - 0.4, 1.3, 0.03, glass, 0, 1.62, HD - T / 2, g);
  [-HW + 0.1, -0.75, 0.75, HW - 0.1].forEach(function (x) { box(0.1, 1.35, 0.14, timber, x, 1.62, HD - T / 2, g); });
  // the brick plinth and the timber framing outside, so it reads as a little house
  [[0, -HD - 0.04, K.W + 0.16, 0.08], [0, HD + 0.04, K.W + 0.16, 0.08]].forEach(function (p) { box(p[2], 0.45, p[3], brick, p[0], 0.225, p[1], g); });
  [-HW - 0.04, HW + 0.04].forEach(function (x) { box(0.08, 0.45, K.D, brick, x, 0.225, 0, g); });
  [[0, -HD - 0.02, K.W + 0.1, 0.05], [0, HD + 0.02, K.W + 0.1, 0.05]].forEach(function (fr) { box(fr[2], 0.12, fr[3], timber, fr[0], H - 0.06, fr[1], g); box(fr[2], 0.12, fr[3], timber, fr[0], 0.95, fr[1], g); });
  [-HW - 0.02, HW + 0.02].forEach(function (x) { box(0.05, 0.12, K.D + 0.1, timber, x, H - 0.06, 0, g); box(0.05, H, 0.12, timber, x, H / 2, -HD, g); box(0.05, H, 0.12, timber, x, H / 2, HD, g); });
  // the door: a real one (E opens it), a lantern over it and a step
  var dx = side * (HW - T / 2);
  b.door = pkBkDoor(g, dx - side * 0.02, 0.0, DZ1, Math.PI, side * 1.55, DZ1 - DZ0, 2.04, { leaf: wood, glass: glass, kick: iron }, 'the ticket office door');
  box(0.4, 0.08, 1.2, std({ color: 0x8a8580, roughness: 0.9 }), dx + side * 0.25, 0.04, (DZ0 + DZ1) / 2, g);
  pkRoundCyl(0.02, 0.3, iron, dx + side * 0.25, 2.45, DZ1 + 0.3, g, 6);
  pkBevelBox(0.2, 0.3, 0.2, std({ color: 0xffe2a0, emissive: 0xffc966, emissiveIntensity: 1.1, roughness: 0.3 }), dx + side * 0.25, 2.2, DZ1 + 0.3, g, 0.02);
  // the roof slab and its trim (the spire over it is part 20's)
  pkBevelBox(K.W + 0.5, 0.16, K.D + 0.5, MAT.roof, 0, H + 0.08, 0, g, 0.04);
  pkBevelBox(K.W + 0.6, 0.22, K.D + 0.6, MAT.trim, 0, H + 0.2, 0, g, 0.02);
  // the fascia and the name over the window
  pkSign3D(['TICKETS'], 2.6, 0.5, 0, H - 0.32, HD + 0.06, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);
  pkSign3D(['ADULTS ' + money(S.ticketPrice)], 1.4, 0.28, -1.4, H - 0.32, HD + 0.06, 0, { bg: '#0d1216', fg: '#eef1f5' }, g);
  // outside: the counter shelf under the window, the bell
  pkBevelBox(K.W - 0.2, 0.08, 0.42, wood, 0, 0.98, HD + 0.2, g, 0.03);
  pkRoundCyl(0.05, 0.07, MAT.chrome, -1.3, 1.055, HD + 0.2, g, 12);
  // inside: the counter under the window, the till, the ticket printer, the screen, a chair
  pkBevelBox(K.W - 0.5, 0.9, 0.55, wood, 0, 0.45, HD - 0.45, g, 0.03);
  pkBevelBox(K.W - 0.4, 0.06, 0.62, std({ color: 0x3a2a1c, roughness: 0.6 }), 0, 0.93, HD - 0.45, g, 0.02);
  var tillM = std({ color: 0x2a3138, roughness: 0.55 });
  pkBevelBox(0.36, 0.18, 0.3, tillM, 0.95, 1.05, HD - 0.45, g, 0.03);
  pkBevelBox(0.22, 0.03, 0.15, MAT.black, 0.95, 1.16, HD - 0.4, g, 0.01);
  pkBevelBox(0.26, 0.16, 0.24, std({ color: 0xe8e2d2, roughness: 0.6 }), 0.45, 1.04, HD - 0.5, g, 0.03);       // the printer
  pkBevelBox(0.12, 0.01, 0.16, std({ color: 0xf5b53d, roughness: 0.7 }), 0.45, 1.13, HD - 0.36, g, 0.003);      // a ticket
  pkBkChair(g, 0, HD - 1.25, 0, 0);                                                                              // facing the window
  // the back: shelves of ticket rolls, the noticeboard, the safe, a wall clock
  pkBevelBox(1.4, 0.06, 0.3, wood, -1.3, 1.55, -HD + 0.3, g, 0.01);
  pkBevelBox(1.4, 0.06, 0.3, wood, -1.3, 1.95, -HD + 0.3, g, 0.01);
  for (var r = 0; r < 5; r++) { pkRoundCyl(0.06, 0.1, std({ color: [0xf5b53d, 0x8fc3ff, 0xf4f1e6][r % 3], roughness: 0.7 }), -1.8 + r * 0.25, 1.63, -HD + 0.3, g, 10); pkRoundCyl(0.06, 0.1, std({ color: [0x8fc3ff, 0xf4f1e6, 0xf5b53d][r % 3], roughness: 0.7 }), -1.8 + r * 0.25, 2.03, -HD + 0.3, g, 10); }
  pkBevelBox(1.2, 0.8, 0.05, wood, 0.6, 1.7, -HD + T + 0.03, g, 0.02);
  pkBevelBox(1.1, 0.7, 0.01, std({ color: 0xe8e2d2, roughness: 0.92 }), 0.6, 1.7, -HD + T + 0.06, g, 0.004);
  [[0.3, 1.85], [0.7, 1.6], [0.95, 1.85]].forEach(function (n) { pkBevelBox(0.2, 0.25, 0.01, std({ color: 0xf5d38a, roughness: 0.9 }), n[0], n[1], -HD + T + 0.075, g, 0.002); });
  var safe = std({ color: 0x3b4148, roughness: 0.45, metalness: 0.6 });
  pkBevelBox(0.6, 0.7, 0.55, safe, side * (HW - 0.55), 0.4, -HD + 0.45, g, 0.03);
  pkRoundCyl(0.08, 0.03, MAT.chrome, side * (HW - 0.55), 0.48, -HD + 0.74, g, 14).rotation.x = Math.PI / 2;
  pkBkClock(g, -1.3, 2.45, -HD + T + 0.02, 0, 0.14);
  // the pendant lamp
  pkRoundCyl(0.015, 0.45, iron, 0, H - 0.22, 0, g, 6);
  pkRoundCyl(0.2, 0.18, std({ color: 0xfff3d6, emissive: 0xffdda0, emissiveIntensity: 0.7, roughness: 0.55 }), 0, H - 0.52, 0, g, 12);
  // the window: serve from inside at the counter (or from the chair), and the window's screen on the counter
  var win = hitBox(K.W - 0.4, 1.3, 0.9, 0, 1.62, HD - 0.15, {
    prompt: function () { var q = PK.booths[i] ? PK.booths[i].queue.length : 0; return q ? 'Serve the guest at the window (' + q + ' waiting)' : 'The ticket window'; },
    use: function () { pkServe(i); }
  }, g);
  win.userData.pkWindow = i;
  var sc = touchScreen({
    w: 300, h: 220, pw: 0.56, ph: 0.4, x: -1.3, y: 1.22, z: HD - 0.62, ry: Math.PI, parent: g, title: 'Ticket window',
    draw: function (ctx, s) {
      scBg(ctx, s.w, s.h); scHead(ctx, s.w, 'TICKETS', 'Day ' + S.day);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f5b53d'; ctx.font = 'bold 34px ' + SCREEN_THEME.font; ctx.fillText(money(S.ticketPrice), 16, 92);
      ctx.fillStyle = '#8b98a4'; ctx.font = '12px ' + SCREEN_THEME.font; ctx.fillText('ADULTS', 18, 110);
      ctx.fillStyle = '#eef1f5'; ctx.font = 'bold 20px ' + SCREEN_THEME.font;
      ctx.fillText('Waiting  ' + (PK.booths[i] ? PK.booths[i].queue.length : 0), 16, 152);
      ctx.fillStyle = '#a0acb8'; ctx.font = '13px ' + SCREEN_THEME.font;
      ctx.fillText('Sold today  ' + PK.today.tickets + (PK.today.machine ? '  (machine ' + PK.today.machine + ')' : ''), 16, 178);
      ctx.fillText(S.clerk ? 'The clerk serves' : 'Serve at the window', 16, 202);
    }
  });
  // outside: the self-service machine on the outer wall, toward the front
  var mx = -side * (HW + 0.45), mg = new THREE.Group(); mg.position.set(mx, 0, HD - 0.5); mg.rotation.y = -side * Math.PI / 2 * 0; g.add(mg);
  pkBevelBox(0.62, 1.55, 0.46, std({ color: 0x21402e, roughness: 0.6, metalness: 0.2 }), 0, 0.78, 0, mg, 0.05);
  pkBevelBox(0.66, 0.1, 0.5, gold, 0, 1.6, 0, mg, 0.03);
  var mScr = std({ color: 0x0b1a12, emissive: 0x5fd38d, emissiveIntensity: 0.35, roughness: 0.3 });
  pkBevelBox(0.42, 0.3, 0.02, mScr, 0, 1.22, 0.235, mg, 0.01);
  pkBevelBox(0.16, 0.03, 0.02, MAT.steelDark, 0, 0.98, 0.235, mg, 0.005);
  sign(['TICKETS'], 0.5, 0.12, 0, 1.47, 0.24, 0, { bg: '#21402e', fg: '#f6e2a6' }, mg);
  b.machine = { blink: 0, mat: mScr };
  animate(function (dt) { var m = b.machine; if (m.blink > 0) m.blink -= dt; m.mat.emissiveIntensity = m.blink > 0 && Math.sin(m.blink * 18) > 0 ? 1.4 : 0.35; });
  solid(b.x + mx - 0.32, b.x + mx + 0.32, b.z + HD - 0.74, b.z + HD - 0.26, 0, 1.6);
  // the queue sign on a post, at the head of the line
  pkRoundCyl(0.05, 1.9, MAT.steelDark, side * 1.9, 0.95, HD + 1.0, g, 8);
  pkSign3D(['QUEUE HERE'], 1.3, 0.28, side * 1.9, 1.9, HD + 1.0, 0, { bg: '#0d1216', fg: '#eef1f5' }, g);
  PK.booths.push({ i: i, x: b.x, z: b.z, turnstile: b.turnstile, turnstiles: b.turnstiles, queue: [], screen: sc, g: g, machine: b.machine, door: b.door });
  // the walls are solid, the doorway is not (the door blocks while shut), the counter inside is solid, the front is solid
  var X = function (x) { return b.x + x; }, Zw = function (z) { return b.z + z; };
  solid(X(-HW), X(HW), Zw(-HD), Zw(-HD + T), 0, H);
  solid(X(-HW), X(HW), Zw(HD - T - 0.6), Zw(HD + 0.42), 0, 1.0);                          // the front wall and the counters
  solid(X(-HW), X(HW), Zw(HD - T), Zw(HD), 0, H);
  [-side, side].forEach(function (sx) {
    var x0 = X(sx * HW - (sx > 0 ? T : 0)), x1 = x0 + T;
    if (sx === side) { solid(x0, x1, Zw(-HD), Zw(DZ0), 0, H); solid(x0, x1, Zw(DZ1), Zw(HD), 0, H); }
    else solid(x0, x1, Zw(-HD), Zw(HD), 0, H);
  });
  solid(X(side * (HW - 0.55) - 0.32), X(side * (HW - 0.55) + 0.32), Zw(-HD + 0.15), Zw(-HD + 0.75), 0, 0.8);   // the safe
  return g;
}

// ── Gate pier: stone column with cap and base ──────────────────────────
function pkGatePier(x, z) {
  var g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  pkBevelBox(5.2, 0.5, 5.2, pkMatStone(), 0, 0.25, 0, g, 0.06);
  pkBevelBox(4.6, 4.9, 4.6, pkMatStone(), 0, 2.7, 0, g, 0.08);
  pkBevelBox(5.0, 0.4, 5.0, pkMatStone(), 0, 5.15, 0, g, 0.04);
  return g;
}

// ── Ride gateway: proper arch with pillars and decorative top ──────────
function pkGatewayBetter(x, z, label, th, side, parent) {
  var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2; parent.add(g);
  [[-1.95, 1.75, 0], [1.95, 1.75, 0]].forEach(function (p) {
    pkRoundCyl(0.28, 3.5, pkMatStone(), p[0], p[1], p[2], g, 10);
    pkBevelBox(0.38, 0.18, 0.38, pkMatStone(), p[0], 3.45, p[2], g, 0.04);
  });
  pkBevelBox(4.4, 0.6, 0.3, std({ color: th.a, roughness: 0.85 }), 0, 3.65, 0, g, 0.04);
  pkSign3D([label], 3.8, 0.62, 0, 3.65, 0.18, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);
  [[-1.95, 3.6], [1.95, 3.6]].forEach(function (p) {
    pkRoundCyl(0.12, 0.2, MAT.steelDark, p[0], p[1], 0, g, 8);
  });
  for (var i = 0; i < 9; i++) {
    var sx = -1.6 + i * 0.4;
    pkBevelBox(0.1, 0.4, 0.06, std({ color: i % 2 ? th.a : th.b, roughness: 0.9 }), sx, 3.16, 0.04, g, 0.02);
  }
  return g;
}

// ── Coaster car: proper body, seats, lap bars, wheels ──────────────────
function pkCoasterCarBetter(idx, x, y, z, ry, col) {
  var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry;
  g.userData.dynamic = true; scene.add(g);
  // the chassis and the plank floor, both bevelled
  pkBevelBox(1.4, 0.24, 2.5, MAT.steelDark, 0, 0.12, 0, g, 0.04);
  pkBevelBox(1.3, 0.06, 2.4, pkMatWoodRich(), 0, 0.27, 0, g, 0.02);
  // the coloured tub: four bevelled panels around an open cockpit
  var body = std({ color: col, roughness: 0.4, metalness: 0.1 });
  pkBevelBox(0.1, 0.55, 2.5, body, -0.6, 0.55, 0, g, 0.04);   // the sides
  pkBevelBox(0.1, 0.55, 2.5, body, 0.6, 0.55, 0, g, 0.04);
  pkBevelBox(1.2, 0.55, 0.1, body, 0, 0.55, 1.2, g, 0.04);    // the ends
  pkBevelBox(1.2, 0.55, 0.1, body, 0, 0.55, -1.2, g, 0.04);
  // a chrome trim rail along the top of each side
  var trim1 = pkRoundCyl(0.03, 2.4, MAT.chrome, -0.6, 0.84, 0, g, 8); trim1.rotation.x = Math.PI / 2;
  var trim2 = pkRoundCyl(0.03, 2.4, MAT.chrome, 0.6, 0.84, 0, g, 8); trim2.rotation.x = Math.PI / 2;
  // the wheels, lying on their sides
  [[-0.5, 0.9], [0.5, 0.9], [-0.5, -0.9], [0.5, -0.9]].forEach(function (w) {
    var wh = pkRoundCyl(0.16, 0.1, MAT.black, w[0], 0.16, w[1], g, 12); wh.rotation.z = Math.PI / 2;
  });
  // the bumpers front and rear
  pkRoundCyl(0.08, 0.2, MAT.steelDark, 0, 0.35, 1.3, g, 6);
  pkRoundCyl(0.08, 0.2, MAT.steelDark, 0, 0.35, -1.3, g, 6);
  // the seats and the restraint bars, one bar per row
  var bars = [];
  [0.62, -0.62].forEach(function (sz) {
    var row = [];
    [-0.35, 0.35].forEach(function (sx) {
      var seat = new THREE.Group(); seat.position.set(sx, 0, sz); g.add(seat);
      pkBevelBox(0.5, 0.08, 0.5, MAT.plastic, 0, 0.62, 0, seat, 0.03);
      pkBevelBox(0.5, 0.5, 0.08, MAT.plastic, 0, 0.86, -0.24, seat, 0.03);
      row.push(seat);
    });
    var barG = new THREE.Group(); barG.position.set(0, 0.78, sz); g.add(barG);
    pkBevelBox(0.9, 0.07, 0.07, MAT.chrome, 0, 0, 0.3, barG, 0.02);
    pkBevelBox(0.07, 0.07, 0.34, MAT.chrome, -0.42, 0, 0.15, barG, 0.02);
    pkBevelBox(0.07, 0.07, 0.34, MAT.chrome, 0.42, 0, 0.15, barG, 0.02);
    row.forEach(function (s) { s.userData.bar = barG; });
    barG.userData.lapBar = true;
    bars.push(barG);
  });
  g.userData.bars = bars;
  g.userData.seats = g.children.filter(function (c) { return c.userData && c.userData.bar; });
  g.userData.carIndex = idx;
  return g;
}

// ── Turnstile: proper rotating arms with stainless cabinet ─────────────
function pkTurnstileBetter(x, z) {
  var g = new THREE.Group(); g.userData.dynamic = true; g.position.set(x, 0, z); scene.add(g);
  var steel = std({ color: 0xc2c7cd, roughness: 0.32, metalness: 0.78 });
  pkBevelBox(0.44, 0.92, 0.5, steel, 0, 0.46, 0, g, 0.03);         // the cabinet
  pkBevelBox(0.48, 0.05, 0.54, MAT.steelDark, 0, 0.945, 0, g, 0.02);
  // the hub stands above the cabinet cap, so the arms sweep at waist height instead of disappearing into the box
  pkRoundCyl(0.055, 0.13, MAT.steelDark, 0, 1.005, 0, g, 12);
  // three tripod arms lying flat in the XZ plane: a bar that reaches most of the way across the gap, with a ball on the
  // end, a third of a turn apart. The old arms were only 0.42 m long and looked like a toy beside the cabinet.
  var arm = new THREE.Group(); arm.position.set(0, 1.06, 0); g.add(arm);
  var reach = 0.62;
  for (var i = 0; i < 3; i++) {
    var a = new THREE.Group(); a.rotation.y = i * 2.0944; arm.add(a);
    var bar = new THREE.Mesh(roundCylGeo(0.024, 0.019, reach, 8), MAT.chrome);
    bar.rotation.x = Math.PI / 2; bar.position.z = reach / 2; bar.castShadow = true; a.add(bar);
    var knob = new THREE.Mesh(new THREE.SphereGeometry(0.033, 10, 8), MAT.chrome);
    knob.position.z = reach; a.add(knob);
  }
  // the reader on the cabinet, and a green pass light
  pkBevelBox(0.3, 0.16, 0.05, MAT.black, 0, 0.8, 0.26, g, 0.02);
  var led = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.02), glowMat(0x5fd38d, 1.1));
  led.position.set(0, 0.855, 0.29); g.add(led);
  PK.turnstiles.push({ x: x, z: z, arm: arm, reach: reach, led: led, spin: 0, pass: 0 });
}

// ── Fence: proper posts with rails ─────────────────────────────────────
function pkFenceRunBetter(x0, z0, x1, z1, opt) {
  var o = opt || {};
  var dx = x1 - x0, dz = z1 - z0, len = Math.sqrt(dx * dx + dz * dz);
  var postSpacing = 2.2;
  var n = Math.ceil(len / postSpacing);
  for (var i = 0; i <= n; i++) {
    var t = i / n, x = x0 + dx * t, z = z0 + dz * t;
    pkRoundCyl(0.09, 1.4, MAT.steelDark, x, 0.7, z, null, 8);
    pkRoundCyl(0.13, 0.1, MAT.steelDark, x, 1.42, z, null, 8);
  }
  [0.5, 1.0].forEach(function (ry) {
    var railGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x0, ry, z0), new THREE.Vector3(x1, ry, z1)]);
    var rail = new THREE.Mesh(railGeo, new THREE.MeshBasicMaterial({ color: 0x4a5058 }));
    rail.castShadow = true; scene.add(rail);
  });
  if (!o.wires) return;
  for (var i = 0; i < n; i++) {
    var t0 = i / n, t1 = (i + 1) / n;
    var xa = x0 + dx * t0, za = z0 + dz * t0, xb = x0 + dx * t1, zb = z0 + dz * t1;
    [0.8, 1.2].forEach(function (wy) {
      var wGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(xa, wy, za), new THREE.Vector3(xb, wy, zb)]);
      var w = new THREE.Mesh(wGeo, new THREE.MeshBasicMaterial({ color: 0x8a8f96 }));
      scene.add(w);
    });
  }
}
