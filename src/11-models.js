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
      { type: 'fill', color: '#b8c8d8', alpha: 0.85 }
    ],
    roughness: 0.15, metalness: 0.05, transparent: true, opacity: 0.85
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
  pkBevelBox(0.42, 0.05, 0.42, MAT.steelDark, 0, 0.94, 0, g, 0.02);
  var lid = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.4, 14), MAT.steelDark);
  lid.position.set(0, 1.0, 0); lid.rotation.x = -Math.PI / 2; g.add(lid);
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

// ── Ticket booth: proper counter, canopy, window frames, sign depth ────
function pkTicketBoothBetter(b, i) {
  var g = new THREE.Group(); g.userData.dynamic = true; g.position.set(b.x, 0, b.z); scene.add(g);
  var side = b.x < 0 ? 1 : -1;
  var plaster = pkMatPlasterRich();
  // the kiosk: a solid back and sides, a base and a header at the front, and a glazed window between
  pkBevelBox(3.2, 2.9, 0.22, plaster, 0, 1.45, -1.5, g, 0.04);
  pkBevelBox(0.22, 2.9, 3.2, plaster, -1.6, 1.45, 0, g, 0.04);
  pkBevelBox(0.22, 2.9, 3.2, plaster, 1.6, 1.45, 0, g, 0.04);
  pkBevelBox(3.2, 0.95, 0.2, plaster, 0, 0.475, 1.5, g, 0.04);    // the base under the window
  pkBevelBox(3.2, 0.7, 0.24, plaster, 0, 2.35, 1.5, g, 0.04);     // the header over it
  pkBevelBox(2.98, 0.9, 0.03, pkMatGlassRich(), 0, 1.45, 1.51, g, 0.01);
  // a projecting counter, with a till and a bell
  pkBevelBox(3.5, 0.09, 0.52, pkMatWoodRich(), 0, 0.965, 1.68, g, 0.03);
  pkBevelBox(0.3, 0.04, 0.12, MAT.steelDark, -0.4, 0.92, 1.86, g, 0.01);
  var tillM = std({ color: 0x2a3138, roughness: 0.55 });
  pkBevelBox(0.36, 0.18, 0.3, tillM, 1.05, 1.1, 1.64, g, 0.03);
  pkBevelBox(0.22, 0.03, 0.15, MAT.black, 1.05, 1.21, 1.64, g, 0.01);
  pkRoundCyl(0.05, 0.07, MAT.chrome, -1.0, 1.045, 1.66, g, 12);
  // inside: a noticeboard, a shelf of ticket rolls, a stool and a warm lamp
  pkBevelBox(1.5, 0.9, 0.05, pkMatWoodRich(), 0.6, 1.65, -1.38, g, 0.02);
  pkBevelBox(1.4, 0.8, 0.01, std({ color: 0xe8e2d2, roughness: 0.92 }), 0.6, 1.65, -1.35, g, 0.004);
  pkBevelBox(1.3, 0.06, 0.28, pkMatWoodRich(), -0.95, 1.55, -1.32, g, 0.01);
  [-1.2, -0.95, -0.7].forEach(function (rx) { pkRoundCyl(0.05, 0.1, MAT.trim, rx, 1.63, -1.32, g, 10); });
  pkRoundCyl(0.17, 0.5, std({ color: 0x2b333a, roughness: 0.8 }), -1.1, 0.25, -0.85, g, 12);
  box(0.42, 0.05, 0.42, std({ color: 0x2b333a, roughness: 0.8 }), -1.1, 0.55, -0.85, g);
  box(0.54, 0.03, 0.54, MAT.trim, 0, 2.87, 0, g);
  sphere(0.09, glowMat(0xffe9b0, 0.9), 0, 2.79, 0, g);
  // the roof, the fascia and the name over the window
  pkBevelBox(3.9, 0.16, 3.9, MAT.roof, 0, 3.02, 0, g, 0.04);
  pkBevelBox(4.0, 0.24, 4.0, MAT.trim, 0, 3.14, 0, g, 0.02);
  pkBevelBox(3.6, 0.3, 0.05, MAT.trim, 0, 2.82, 1.84, g, 0.02);
  pkSign3D(['TICKETS'], 2.5, 0.58, 0, 2.82, 1.88, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);
  pkSign3D(['ADULTS ' + money(S.ticketPrice)], 1.5, 0.3, -0.78, 2.13, 1.64, 0, { bg: '#0d1216', fg: '#eef1f5' }, g);
  // the window under the glass: a small counter display and the serve action
  var win = hitBox(3.0, 1.4, 0.7, 0, 1.45, 1.55, {
    prompt: function () { var q = PK.booths[i] ? PK.booths[i].queue.length : 0; return q ? 'Serve the guest at the window (' + q + ' waiting)' : 'The ticket window'; },
    use: function () { pkServe(i); }
  }, g);
  win.userData.pkWindow = i;
  pkBevelBox(0.14, 0.34, 0.14, MAT.steelDark, -1.22, 1.15, 1.7, g, 0.02);
  var sc = touchScreen({
    w: 300, h: 220, pw: 0.56, ph: 0.4, x: -1.22, y: 1.46, z: 1.76, parent: g, title: 'Ticket window',
    draw: function (ctx, s) {
      scBg(ctx, s.w, s.h); scHead(ctx, s.w, 'TICKETS', 'Day ' + S.day);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f5b53d'; ctx.font = 'bold 34px ' + SCREEN_THEME.font; ctx.fillText(money(S.ticketPrice), 16, 92);
      ctx.fillStyle = '#8b98a4'; ctx.font = '12px ' + SCREEN_THEME.font; ctx.fillText('ADULTS', 18, 110);
      ctx.fillStyle = '#eef1f5'; ctx.font = 'bold 20px ' + SCREEN_THEME.font;
      ctx.fillText('Waiting  ' + (PK.booths[i] ? PK.booths[i].queue.length : 0), 16, 152);
      ctx.fillStyle = '#a0acb8'; ctx.font = '13px ' + SCREEN_THEME.font;
      ctx.fillText('Sold today  ' + PK.today.tickets, 16, 178);
      ctx.fillText('Serve at the window', 16, 202);
    }
  });
  // the queue sign on a post, at the head of the line
  pkRoundCyl(0.05, 1.9, MAT.steelDark, side * 1.55, 0.95, 2.4, g, 8);
  pkSign3D(['QUEUE HERE'], 1.3, 0.28, side * 1.55, 1.9, 2.4, 0, { bg: '#0d1216', fg: '#eef1f5' }, g);
  PK.booths.push({ i: i, x: b.x, z: b.z, turnstile: b.turnstile, queue: [], screen: sc, g: g });
  solid(b.x - 1.72, b.x + 1.72, b.z - 1.62, b.z - 1.38, 0, 3.0);
  solid(b.x - 1.72, b.x - 1.48, b.z - 1.62, b.z + 1.62, 0, 3.0);
  solid(b.x + 1.48, b.x + 1.72, b.z - 1.62, b.z + 1.62, 0, 3.0);
  solid(b.x - 1.72, b.x + 1.72, b.z + 1.38, b.z + 1.78, 0, 1.0);
  return g;
}

// ── Office: proper door, window trim, roof overhang, sign depth ────────
function pkOfficeBetter(X, Z) {
  var W = 6, D = 5.4, H = 3.0;
  pkSlab(9, 9, X, Z, 0.022);
  var g = new THREE.Group(); g.position.set(X, 0, Z); scene.add(g);
  pkBevelBox(W, H, 0.22, pkMatPlasterRich(), 0, H / 2, -D / 2, g, 0.04);
  pkBevelBox(0.22, H, D, pkMatPlasterRich(), -W / 2, H / 2, 0, g, 0.04);
  pkBevelBox(W, H, 0.22, pkMatPlasterRich(), 0, H / 2, D / 2, g, 0.04);
  pkBevelBox(0.22, H, 1.7, pkMatPlasterRich(), W / 2, H / 2, -D / 2 + 0.85, g, 0.04);
  pkBevelBox(0.22, H, 1.7, pkMatPlasterRich(), W / 2, H / 2, D / 2 - 0.85, g, 0.04);
  pkBevelBox(W + 0.8, 0.18, D + 0.8, MAT.roof, 0, H + 0.1, 0, g, 0.04);
  pkBevelBox(W + 0.6, 0.12, D + 0.6, MAT.trim, 0, H + 0.18, 0, g, 0.02);
  pkBevelBox(2.6, 1.4, 0.1, pkMatWoodRich(), 0, 1.8, D / 2 + 0.06, g, 0.02);
  pkBevelBox(2.8, 1.6, 0.06, pkMatGlassRich(), 0, 1.8, D / 2 + 0.08, g, 0.01);
  pkBevelBox(0.12, H, 0.1, pkMatWoodRich(), W / 2 - 0.06, H / 2, -0.85, g, 0.02);
  pkBevelBox(0.12, H, 0.1, pkMatWoodRich(), W / 2 - 0.06, H / 2, 0.85, g, 0.02);
  pkBevelBox(1.4, 0.12, 0.1, pkMatWoodRich(), W / 2 - 0.7, H - 0.06, 0, g, 0.02);
  pkSign3D(['PARK OFFICE'], 3.2, 0.6, 0, H + 0.7, D / 2 + 0.14, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);
  pkBevelBox(2.4, 0.06, 1.0, pkMatWoodRich(), 0, 0.8, -1.4, g, 0.03);
  [[-1.05, 0.45, -1.4], [1.05, 0.45, -1.4]].forEach(function (l) {
    pkRoundCyl(0.04, 0.8, MAT.steelDark, l[0], l[1], l[2], g, 6);
  });
  pkBevelBox(2.3, 0.5, 0.04, std({ color: 0x2b333a, roughness: 0.7 }), 0, 0.53, -1.89, g, 0.01);

  // ── the workstation: a real desk machine, not a prop ──
  var caseM = std({ color: 0x232a30, roughness: 0.42, metalness: 0.5 });
  var pc = new THREE.Group(); pc.position.set(-0.08, 0.83, -1.62); g.add(pc);
  var mon = new THREE.Group(); mon.position.set(0, 0.22, 0); mon.rotation.x = -0.07; pc.add(mon);
  pkBevelBox(1.04, 0.64, 0.05, caseM, 0, 0.13, 0, mon, 0.02);
  pkBevelBox(0.96, 0.56, 0.02, MAT.black, 0, 0.13, 0.032, mon, 0.007);
  pkRoundCyl(0.048, 0.20, MAT.steelDark, 0, 0.02, -0.035, pc, 10);
  pkBevelBox(0.36, 0.02, 0.22, caseM, 0, -0.09, -0.02, pc, 0.008);
  pkBevelBox(0.05, 0.03, 0.012, std({ color: 0xd8d2c4, roughness: 0.5 }), 0, 0.30, -0.028, mon, 0.004);
  var scr = touchScreen({ w: 560, h: 320, pw: 0.92, ph: 0.54, x: 0, y: 0.13, z: 0.046, parent: mon, title: 'Park office',
    draw: function (ctx, s) {
      scBg(ctx, s.w, s.h); scHead(ctx, s.w, 'PARK CO  ·  OFFICE', 'Day ' + S.day + '   ' + fmtTime(S.time));
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      // the bank, in the size it deserves
      ctx.fillStyle = '#eef1f5'; ctx.font = 'bold 36px ' + SCREEN_THEME.font;
      ctx.fillText(money(S.bank), 18, 86);
      ctx.fillStyle = '#8b98a4'; ctx.font = '12px ' + SCREEN_THEME.font;
      ctx.fillText('BANK', 20, 102);
      // the day's counters
      var st = [['GUESTS', PK.guests.length], ['RIDES', pkOpenCount() + '/8'], ['TICKETS', PK.today.tickets], ['SNACKS', PK.today.snacks]];
      for (var si = 0; si < st.length; si++) {
        var sx = 186 + si * 96;
        ctx.fillStyle = '#8b98a4'; ctx.font = '12px ' + SCREEN_THEME.font; ctx.fillText(st[si][0], sx, 72);
        ctx.fillStyle = '#eef1f5'; ctx.font = 'bold 20px ' + SCREEN_THEME.font; ctx.fillText(String(st[si][1]), sx, 96);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(16, 112, s.w - 32, 1);
      // the rides, two columns, with a live dot each
      var atts = PK.attractions || [];
      for (var r = 0; r < atts.length; r++) {
        var ax = 22 + (r % 2) * 268, ay = 138 + Math.floor(r / 2) * 32, open = !!atts[r].open;
        ctx.fillStyle = open ? '#5fd38d' : '#ff6b5e';
        ctx.beginPath(); ctx.arc(ax + 4, ay - 4, 4.5, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#c9d2d9'; ctx.font = '14px ' + SCREEN_THEME.font; ctx.fillText(atts[r].name, ax + 16, ay);
        ctx.fillStyle = open ? '#5fd38d' : '#ff6b5e'; ctx.font = '12px ' + SCREEN_THEME.font;
        ctx.textAlign = 'right'; ctx.fillText(open ? 'open' : 'shut', ax + 244, ay); ctx.textAlign = 'left';
      }
      scButton(s, 16, 268, 168, 38, 'Manage', true, function () { openPanel('admin'); });
      scButton(s, 192, 268, 168, 38, 'Rides', true, function () { openPanel('admin', 'coaster'); });
      scButton(s, 368, 268, 176, 38, 'Service', true, function () { pkService(); });
    } });
  // keyboard, keys and mouse on a mat
  pkBevelBox(0.48, 0.018, 0.16, std({ color: 0x2a3036, roughness: 0.75 }), 0, 0.012, 0.34, pc, 0.006);
  var keyM = std({ color: 0x3b434a, roughness: 0.62 });
  for (var kr = 0; kr < 5; kr++) for (var kc = 0; kc < 13; kc++)
    pkBevelBox(0.026, 0.008, 0.022, keyM, -0.198 + kc * 0.033, 0.024, 0.247 + kr * 0.028, pc, 0.003);
  pkBevelBox(0.3, 0.006, 0.24, std({ color: 0x1d2328, roughness: 0.9 }), 0.38, 0.006, 0.34, pc, 0.01);
  pkBevelBox(0.07, 0.035, 0.11, std({ color: 0x2f363c, roughness: 0.6 }), 0.38, 0.024, 0.34, pc, 0.03);
  pkBevelBox(0.02, 0.006, 0.03, std({ color: 0xd8d2c4, roughness: 0.5 }), 0.38, 0.042, 0.30, pc, 0.003);
  // the tower under the desk, with a lit button and a drive slot
  pkBevelBox(0.24, 0.46, 0.48, caseM, 0.78, 0.23, -1.56, g, 0.02);
  pkBevelBox(0.16, 0.012, 0.012, MAT.black, 0.78, 0.38, -1.315, g, 0.003);
  box(0.03, 0.03, 0.014, glowMat(0x5fd38d, 1.6), 0.78, 0.12, -1.313, g);
  for (var vt = 0; vt < 4; vt++) pkBevelBox(0.14, 0.012, 0.012, MAT.black, 0.78, 0.045 + vt * 0.028, -1.318, g, 0.002);
  // desk clutter: a printer, a lamp, papers and a mug
  pkBevelBox(0.42, 0.20, 0.34, std({ color: 0xd9d5cb, roughness: 0.7 }), -0.92, 0.10, -1.62, g, 0.02);
  pkBevelBox(0.34, 0.02, 0.22, MAT.paper, -0.92, 0.205, -1.55, g, 0.004);
  box(0.02, 0.02, 0.01, glowMat(0x5fd38d, 1.2), -0.72, 0.06, -1.44, g);
  var lampBase = pkRoundCyl(0.10, 0.03, MAT.steelDark, 1.0, 0.845, -1.82, g, 14);
  pkRod(1.0, 0.86, -1.82, 1.0, 1.30, -1.78, 0.018, MAT.steelDark, g, 6);
  pkRod(1.0, 1.30, -1.78, 0.88, 1.30, -1.60, 0.018, MAT.steelDark, g, 6);
  var lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.13, 14, 1, true), std({ color: 0x25402f, roughness: 0.55, side: THREE.DoubleSide }));
  lampShade.position.set(0.86, 1.26, -1.58); g.add(lampShade);
  box(0.01, 0.01, 0.01, glowMat(0xffe9b0, 1.4), 0.86, 1.21, -1.58, g);
  var paperA = pkBevelBox(0.28, 0.008, 0.38, MAT.paper, 0.52, 0.845, -1.16, g, 0.004); paperA.rotation.y = 0.16;
  pkBevelBox(0.28, 0.008, 0.38, MAT.paper, 0.56, 0.853, -1.20, g, 0.004);
  pkRoundCyl(0.05, 0.11, std({ color: 0xf2efe6, roughness: 0.5 }), 0.82, 0.885, -1.16, g, 12);
  // the chair, and a bin
  var chairM = std({ color: 0x252f37, roughness: 0.85 });
  pkBevelBox(0.5, 0.09, 0.5, chairM, 0.06, 0.47, -0.62, g, 0.03);
  pkBevelBox(0.5, 0.5, 0.09, chairM, 0.06, 0.72, -0.86, g, 0.03);
  pkRoundCyl(0.045, 0.42, MAT.steelDark, 0.06, 0.23, -0.62, g, 8);
  for (var ca = 0; ca < 5; ca++) {
    var ang = ca / 5 * Math.PI * 2;
    var armC = pkBevelBox(0.05, 0.04, 0.32, MAT.steelDark, 0.06 + Math.sin(ang) * 0.15, 0.05, -0.62 + Math.cos(ang) * 0.15, g, 0.01);
    armC.rotation.y = ang;
  }
  pkRoundCyl(0.14, 0.34, std({ color: 0x39424a, roughness: 0.8 }), -1.55, 0.17, -0.55, g, 12);
  // a park map on the east wall by the door
  pkBevelBox(0.04, 0.8, 1.1, pkMatWoodRich(), 2.86, 1.75, -1.75, g, 0.02);
  pkBevelBox(0.01, 0.7, 1.0, std({ color: 0xe8e2d2, roughness: 0.9 }), 2.84, 1.75, -1.75, g, 0.004);
  // a ceiling light and a filing cabinet to fill the room out
  box(0.9, 0.05, 0.5, MAT.trim, 0, H - 0.03, 0.1, g);
  box(0.8, 0.02, 0.4, MAT.lamp, 0, H - 0.06, 0.1, g);
  pkBevelBox(0.5, 1.1, 0.6, std({ color: 0x555f68, roughness: 0.6, metalness: 0.3 }), -2.45, 0.55, -1.6, g, 0.02);
  [0.32, 0.62, 0.92].forEach(function (dy) { pkBevelBox(0.44, 0.02, 0.02, MAT.chrome, -2.45, dy, -1.29, g, 0.004); });
  hitBox(1.5, 1.3, 0.9, -0.08, 1.2, -1.5, {
    prompt: function () { return 'Park management'; },
    use: function () { openPanel('admin'); }
  }, g);
  // the park services switchboard goes on the west wall of the office
  pkBuildParkCabinet(-22.85, 1.66, 43.55, Math.PI / 2);
  PK.office = { g: g, x: X, z: Z, screen: scr };
  solid(X - W / 2 - 0.15, X - W / 2 + 0.15, Z - D / 2, Z + D / 2, 0, H);
  solid(X - W / 2, X + W / 2, Z - D / 2 - 0.15, Z - D / 2 + 0.15, 0, H);
  solid(X - W / 2, X + W / 2, Z + D / 2 - 0.15, Z + D / 2 + 0.15, 0, H);
  solid(X + W / 2 - 0.15, X + W / 2 + 0.15, Z - D / 2, Z - 0.85, 0, H);
  solid(X + W / 2 - 0.15, X + W / 2 + 0.15, Z + 0.85, Z + D / 2, 0, H);
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

// ── Ride booth: proper control booth with door, window, sign ───────────
function pkRideBoothBetter(a, plot, th) {
  // ── where it stands ──
  // Beside the head of the queue, 5.6 m off the lane: clear of the pair of lamp
  // standards that flank every queue mouth (they stand 3.8 m out). Of the two
  // sides the one further from the ride is chosen, so the booth never stands on
  // the ride's pad or in the middle of the lane. The window (local +Z) looks at
  // the ride; the door is cut in the side wall that faces the queue.
  var q = plot.q || [plot.x, plot.z];
  var OFF = 6.6;
  // a step toward the ride, along the lane, so the booth clears the end of the
  // hedge rows that dress the queue
  var dx = plot.x - q[0], dz = plot.z - q[1], L = Math.sqrt(dx * dx + dz * dz) || 1;
  var ax = q[0] + (dx / L) * 4.4;
  var c1x = ax, c1z = q[1] + OFF, c2x = ax, c2z = q[1] - OFF;
  var bx = c1x, bz = c1z;
  if (dist2(c2x, c2z, plot.x, plot.z) > dist2(c1x, c1z, plot.x, plot.z)) { bx = c2x; bz = c2z; }
  // a plot can name its side outright (boothSide: 1 south of the lane, -1 north) where the far side is taken by a street
  if (plot.boothSide === 1) { bx = c1x; bz = c1z; } else if (plot.boothSide === -1) { bx = c2x; bz = c2z; }
  var ry = Math.atan2(plot.x - bx, plot.z - bz);
  var toQ = Math.atan2(q[0] - bx, q[1] - bz);
  var doorSide = Math.cos(toQ - (ry + Math.PI / 2)) >= 0 ? 1 : -1;

  var BW = 3.4, BD = 2.5, WALL_H = 2.45, HALF = BW / 2, THICK = 0.14, FLOOR = 0.32;
  var WINW = 2.96, SILL = 0.95, HEAD = 1.95, DOORW = 0.95, DOORH = 2.02;
  var g = new THREE.Group();
  g.position.set(bx, 0, bz); g.rotation.y = ry;
  var anchor = new THREE.Object3D();
  anchor.position.set(bx, 0, bz); anchor.rotation.y = ry;
  anchor.userData.editor = true;
  anchor.userData.doorSide = doorSide;
  anchor.userData.half = BW / 2;
  scene.add(anchor);
  a.booth = anchor;
  var plaster = pkMatPlasterRich(), timber = pkMatWoodRich(), trim = MAT.trim, iron = MAT.steelDark;
  var steel = std({ color: 0x39434a, roughness: 0.45, metalness: 0.45 });
  var dark = std({ color: 0x20272c, roughness: 0.62, metalness: 0.30 });
  var wallY = FLOOR + WALL_H / 2;
  var frontZ = BD / 2 - THICK / 2, backZ = -BD / 2 + THICK / 2;

  // ── the shell: a control cabin, not a cottage ──
  // stone plinth strips, boarded floor, a steel-framed band of glazing
  // across the ride side, ribbed side panels, striped tented canopy.
  // theme walls: cream bays with the ride colour picked up in trim/roof.
  var wallMat = std({ color: 0xece2cc, roughness: 0.9 });
  var themeTrim = std({ color: th.a, roughness: 0.6, metalness: 0.1 });
  pkBoothPlinth(BW, BD, pkMats().stoneDark, g);
  pkBevelBox(BW, 0.09, BD, timber, 0, FLOOR - 0.045, 0, g, 0.012);
  pkBevelBox(BW, WALL_H, THICK, plaster, 0, wallY, backZ, g, 0.02);

  // the ride-facing elevation: solid sill panel, 1 m of glass, solid header
  // cream bays with theme-red sill band, window/door openings unchanged
  pkBevelBox(BW, SILL, THICK, wallMat, 0, FLOOR + SILL / 2, frontZ, g, 0.015);
  pkBevelBox(BW, 0.22, THICK + 0.03, themeTrim, 0, FLOOR + 0.30, frontZ + 0.01, g, 0.01);
  pkBevelBox(BW, WALL_H - HEAD, THICK, wallMat, 0, FLOOR + HEAD + (WALL_H - HEAD) / 2, frontZ, g, 0.02);
  pkBevelBox(WINW, HEAD - SILL, 0.045, pkMatGlassRich(), 0, FLOOR + (SILL + HEAD) / 2, frontZ + 0.035, g, 0.01);
  // the glazing frame: rails, two mullions and the outer posts
  pkBevelBox(BW, 0.10, 0.12, steel, 0, FLOOR + SILL, frontZ + 0.02, g, 0.012);
  pkBevelBox(BW, 0.10, 0.12, steel, 0, FLOOR + HEAD, frontZ + 0.02, g, 0.012);
  [-0.50, 0.50].forEach(function (mx) { pkBevelBox(0.06, HEAD - SILL, 0.10, steel, mx, FLOOR + (SILL + HEAD) / 2, frontZ + 0.03, g, 0.01); });
  [-1, 1].forEach(function (sx) { pkBevelBox(0.12, WALL_H, 0.18, steel, sx * (HALF - 0.06), wallY, BD / 2 - 0.09, g, 0.012); });

  // the sill panel: louvres and a hazard band along the kick plate
  for (var lv = 0; lv < 5; lv++) pkBevelBox(1.5, 0.035, 0.03, iron, 0.62, FLOOR + 0.26 + lv * 0.075, frontZ + 0.075, g, 0.006);
  for (var hz = 0; hz < 20; hz++) {
    var hzc = -HALF + 0.10 + hz * 0.162;
    pkBevelBox(0.075, 0.13, 0.03, std({ color: 0x111417, roughness: 0.7 }), hzc, FLOOR + 0.075, frontZ + 0.08, g, 0.004);
    pkBevelBox(0.075, 0.13, 0.03, std({ color: 0xc9a227, roughness: 0.7 }), hzc + 0.081, FLOOR + 0.075, frontZ + 0.08, g, 0.004);
  }

  // side walls: one ribbed panel, one with the service door
  var openSide = doorSide;
  [-1, 1].forEach(function (sx) {
    var wx = sx * (HALF - THICK / 2);
    if (sx !== openSide) {
      pkBevelBox(THICK, WALL_H, BD, wallMat, wx, wallY, 0, g, 0.02);
      for (var rb = 0; rb < 4; rb++) pkBevelBox(0.05, WALL_H - 0.2, 0.05, steel, wx + sx * 0.06, wallY, -0.75 + rb * 0.5, g, 0.008);
      // a safety poster on the inside face, so the cabin reads as worked in
      pkSign3D(['SAFETY', 'FIRST'], 0.46, 0.34, wx - sx * 0.09, FLOOR + 1.32, 0.55, sx > 0 ? -Math.PI / 2 : Math.PI / 2, { bg: '#e9e4d8', fg: '#8a2b22' }, g);
      return;
    }
    var seg = (BD - DOORW) / 2;
    pkBevelBox(THICK, WALL_H, seg, wallMat, wx, wallY, -(DOORW / 2 + seg / 2), g, 0.02);
    pkBevelBox(THICK, WALL_H, seg, wallMat, wx, wallY, DOORW / 2 + seg / 2, g, 0.02);
    pkBevelBox(THICK, WALL_H - DOORH, DOORW, wallMat, wx, FLOOR + DOORH + (WALL_H - DOORH) / 2, 0, g, 0.02);
    // steel jambs and a cream service door with timber trim + wired window
    [-1, 1].forEach(function (dz2) { pkBevelBox(THICK + 0.07, DOORH + 0.07, 0.10, themeTrim, wx, FLOOR + DOORH / 2, dz2 * (DOORW / 2 + 0.02), g, 0.012); });
    pkBevelBox(THICK + 0.07, 0.10, DOORW + 0.12, themeTrim, wx, FLOOR + DOORH + 0.04, 0, g, 0.012);
    var leaf = new THREE.Group(); leaf.position.set(wx + sx * 0.02, FLOOR, -DOORW / 2); leaf.rotation.y = sx * 1.62; g.add(leaf);
    pkBevelBox(0.06, DOORH - 0.04, DOORW - 0.06, wallMat, 0, DOORH / 2, DOORW / 2, leaf, 0.012);
    pkBevelBox(0.05, 0.52, 0.34, pkMatGlassRich(), 0, 1.45, DOORW / 2 + 0.01, leaf, 0.01);
    pkBevelBox(0.07, 0.10, 0.26, MAT.chrome, sx * 0.03, 0.98, DOORW - 0.16, leaf, 0.012);
    pkBevelBox(0.07, 0.16, 0.40, dark, 0, 0.12, DOORW / 2, leaf, 0.008);
    // the ride name over the doorway, for the queue side
    pkSign3D([th.name.toUpperCase()], 1.15, 0.20, sx * (HALF + 0.04), FLOOR + DOORH + 0.19, 0, sx * Math.PI / 2, { bg: '#1b232c', fg: '#f5b53d' }, g);
  });

  // the back wall faces the path, so it carries the same order as the sides: ribs, a downpipe,
  // a vent and a framed notice, instead of reading as a blank cream panel from the midway
  for (var rb2 = 0; rb2 < 5; rb2++) pkBevelBox(0.05, WALL_H - 0.2, 0.05, steel, -1.3 + rb2 * 0.65, wallY, backZ - 0.08, g, 0.008);
  pkRoundCyl(0.045, WALL_H, iron, HALF - 0.16, FLOOR + WALL_H / 2, backZ - 0.09, g, 8);
  pkBevelBox(0.56, 0.42, 0.12, dark, -0.95, FLOOR + 1.72, backZ - 0.10, g, 0.02);
  for (var ac2 = 0; ac2 < 4; ac2++) pkBevelBox(0.06, 0.34, 0.015, steel, -1.15 + ac2 * 0.13, FLOOR + 1.72, backZ - 0.17, g, 0.006);
  pkBevelBox(0.64, 0.48, 0.035, timber, 0.66, FLOOR + 1.5, backZ - 0.09, g, 0.012);
  pkSign3D(['STAFF ONLY'], 0.54, 0.34, 0.66, FLOOR + 1.5, backZ - 0.115, Math.PI, { bg: '#e8e3d6', fg: '#1b232c' }, g);
  var backLamp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), glowMat(0xffe3b0, 0.9));
  backLamp.position.set(-HALF + 0.34, FLOOR + 2.15, backZ - 0.16); g.add(backLamp);

  // striped tented canopy with scalloped valance, fascia + finial.
  // wallTop clears the fascia sign + door head; eave lamps + beacon
  // sit under the eave so the roofline stays clean.
  var wallTop = FLOOR + WALL_H;
  var roofInfo = pkBoothTentRoof(g, { w: BW, d: BD, wallTop: wallTop, roofA: pkCss(th.a), roofB: '#f3ead6', trimMat: themeTrim, roofH: 0.95 });
  var lampMats = [0, 1].map(function () { return glowMat(0x5fd38d, 1.2); });
  var lamp1 = sphere(0.06, lampMats[0], -1.52, roofInfo.eaveY + 0.02, BD / 2 + 0.12, g);
  var lamp2 = sphere(0.06, lampMats[1], 1.52, roofInfo.eaveY + 0.02, BD / 2 + 0.12, g);
  var C = pkCtl(a); C.lamps = [lamp1, lamp2];
  // roof beacon on a short mast at the back corner, clear of the valance
  pkRoundCyl(0.04, 0.22, iron, HALF - 0.30, roofInfo.roofY - 0.55, -BD / 2 + 0.30, g, 8);
  sphere(0.09, glowMat(0xff5a4a, 1.1), HALF - 0.30, roofInfo.roofY - 0.40, -BD / 2 + 0.30, g);
  // wall lanterns flanking the window + front planter boxes
  pkBoothLantern(g, -HALF - 0.05, FLOOR + 1.90, BD / 2 - 0.10);
  pkBoothLantern(g, HALF + 0.05, FLOOR + 1.90, BD / 2 - 0.10);
  pkPlanter(1.6, g, -0.90, FLOOR, BD / 2 + 0.75);
  pkPlanter(1.6, g, 0.90, FLOOR, BD / 2 + 0.75);
  // fascia sign sits on the header band, below the eave (clears door head)
  pkSign3D(['PARK CO · RIDE CONTROL', th.name.toUpperCase()], 2.30, 0.36, 0, FLOOR + HEAD + 0.22, BD / 2 + 0.09, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);

  // ── inside: wainscot, a ceiling light, a board and the desk ──
  pkBevelBox(BW - 0.2, 0.86, 0.05, timber, 0, FLOOR + 0.43, backZ + 0.08, g, 0.015);
  pkBevelBox(BW - 0.1, 0.05, 0.07, trim, 0, FLOOR + 0.88, backZ + 0.09, g, 0.01);
  box(0.5, 0.04, 0.34, MAT.trim, 0, FLOOR + WALL_H - 0.02, 0, g);
  sphere(0.1, glowMat(0xffe9b0, 0.9), 0, FLOOR + WALL_H - 0.08, 0, g);

  // the desk: a steel cabinet the width of the booth, against the window
  var con = new THREE.Group();
  con.position.set(0, FLOOR, 0.80); con.rotation.y = Math.PI; g.add(con);
  var caseM = std({ color: 0x2b333a, roughness: 0.5, metalness: 0.35 });
  pkBevelBox(1.98, 0.70, 0.56, caseM, 0, 0.35, 0, con, 0.02);
  pkBevelBox(2.02, 0.05, 0.60, std({ color: 0x39434a, roughness: 0.45, metalness: 0.45 }), 0, 0.72, 0, con, 0.012);
  pkBevelBox(1.9, 0.10, 0.02, std({ color: 0x171d22, roughness: 0.9 }), 0, 0.05, 0.285, con, 0.006);
  [-0.52, 0.52].forEach(function (dx2) {
    pkBevelBox(0.82, 0.44, 0.02, std({ color: 0x333c44, roughness: 0.55 }), dx2, 0.40, 0.285, con, 0.008);
    pkBevelBox(0.20, 0.035, 0.03, MAT.chrome, dx2, 0.52, 0.30, con, 0.006);
  });
  pkBoothPanel(a, con);

  // a swivel chair, tucked in behind the desk
  var chairM = std({ color: 0x222a31, roughness: 0.85 });
  pkBevelBox(0.46, 0.08, 0.46, chairM, 0.12, FLOOR + 0.42, -0.02, g, 0.03);
  pkBevelBox(0.46, 0.46, 0.08, chairM, 0.12, FLOOR + 0.66, -0.25, g, 0.03);
  pkRoundCyl(0.04, 0.38, iron, 0.12, FLOOR + 0.20, -0.02, g, 8);
  for (var ca = 0; ca < 5; ca++) {
    var ang = ca / 5 * Math.PI * 2;
    var armC = pkBevelBox(0.04, 0.035, 0.28, iron, 0.12 + Math.sin(ang) * 0.13, FLOOR + 0.04, -0.02 + Math.cos(ang) * 0.13, g, 0.008);
    armC.rotation.y = ang;
  }

  // ── the status board on the back wall ──
  var screen = touchScreen({
    w: 420, h: 380, pw: 1.10, ph: 0.96, x: 0, y: FLOOR + 1.52, z: backZ + 0.06, ry: 0, parent: g, title: a.name,
    draw: function (ctx, s) {
      scBg(ctx, s.w, s.h);
      var status = pkBoothStatus(a, C);
      var statusCol = C.fault ? '#ff6b5e' : (a.state === 'running' ? '#ff6b5e' : (a.state === 'idle' && !a.queue.length ? '#a0acb8' : '#5fd38d'));
      scHead(ctx, s.w, a.name.toUpperCase(), status);
      scText(ctx, 16, 66, 'ON RIDE', '#a0acb8');
      scText(ctx, 16, 92, a.riders + ' / ' + a.seats.length, a.riders ? '#5fd38d' : '#eef1f5');
      scText(ctx, 220, 66, 'QUEUE', '#a0acb8');
      scText(ctx, 220, 92, String(a.queue.length), a.queue.length ? '#f0c04a' : '#eef1f5');
      scText(ctx, 16, 124, 'GATES  ' + (C.gates ? 'OPEN' : 'CLOSED'), C.gates ? '#5fd38d' : '#a0acb8');
      scText(ctx, 220, 124, 'RESTRAINTS  ' + (C.barsWant > 0.5 ? 'DOWN' : 'UP'), C.barsWant > 0.5 ? '#f0c04a' : '#a0acb8');
      scText(ctx, 16, 150, C.fault ? 'FAULT: ' + C.fault : (C.auto ? 'CONTROL: AUTO' : 'CONTROL: MANUAL'), C.fault ? '#ff6b5e' : '#f5b53d');
      var pills = [['GATES', C.gates ? 'OPEN' : 'SHUT', C.gates], ['RESTRAINTS', C.barsWant > 0.5 ? 'DOWN' : 'UP', C.barsWant > 0.5], ['CONTROL', C.auto ? 'AUTO' : 'MANUAL', C.auto]];
      for (var pl = 0; pl < pills.length; pl++) {
        var px2 = 16 + pl * 132, py2 = 160;
        ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(px2, py2, 120, 56);
        ctx.strokeStyle = pills[pl][2] ? 'rgba(95,211,141,0.55)' : 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5; ctx.strokeRect(px2, py2, 120, 56);
        ctx.fillStyle = '#8b98a4'; ctx.font = '12px ' + SCREEN_THEME.font; ctx.fillText(pills[pl][0], px2 + 10, py2 + 20);
        ctx.fillStyle = pills[pl][2] ? '#5fd38d' : '#d7dee4'; ctx.font = 'bold 17px ' + SCREEN_THEME.font; ctx.fillText(pills[pl][1], px2 + 10, py2 + 44);
      }
      scText(ctx, 16, 244, 'Work the desk: gates, restraints, dispatch, test, auto and the stop.', '#8b98a4', 13);
      scText(ctx, 16, 266, C.fault ? 'STOP LATCHED - TURN THE MUSHROOM TO RESET' : 'SIGNAL  ' + status, C.fault ? '#ff6b5e' : statusCol, 14);
      scText(ctx, 16, 330, 'TODAY', '#a0acb8');
      scText(ctx, 116, 330, 'Cycles ' + (a.cycles || 0), '#eef1f5');
      scText(ctx, 270, 330, 'Tests ' + (a.tests || 0), '#eef1f5');
      scText(ctx, 16, 356, 'SIGNAL', '#a0acb8');
      scText(ctx, 116, 356, status, statusCol);
    }
  });
  a.boothScreen = screen;
  pkCtlLamps(a);

  // ── collision: the walls, in world space, and the open doorway left clear ──
  // Every wall is cut into short pieces so a booth standing off the axes gets a
  // collider that follows the wall instead of one big box across the room.
  function wp(lx, lz) { var c = Math.cos(ry), s = Math.sin(ry); return [bx + lx * c + lz * s, bz - lx * s + lz * c]; }
  function wallSolid(lx0, lz0, lx1, lz1) {
    var N = 8;
    for (var i = 0; i < N; i++) {
      var t0 = i / N, t1 = (i + 1) / N;
      var p0 = wp(lx0 + (lx1 - lx0) * t0, lz0 + (lz1 - lz0) * t0);
      var p1 = wp(lx0 + (lx1 - lx0) * t1, lz0 + (lz1 - lz0) * t1);
      solid(Math.min(p0[0], p1[0]) - 0.07, Math.max(p0[0], p1[0]) + 0.07,
            Math.min(p0[1], p1[1]) - 0.07, Math.max(p0[1], p1[1]) + 0.07, 0, FLOOR + WALL_H + 0.3);
    }
  }
  wallSolid(-HALF, backZ, HALF, backZ);
  wallSolid(-HALF, frontZ, HALF, frontZ);
  var owx = openSide * (HALF - THICK / 2);
  var dgap = DOORW / 2 + 0.10;
  wallSolid(owx, -BD / 2, owx, -dgap);
  wallSolid(owx, dgap, owx, BD / 2);
  wallSolid(-owx, -BD / 2, -owx, BD / 2);
  // the desk is solid; the floor and the doorway stay walkable
  function boxSolid(lx, lz, hw, hd, y1) {
    var pts = [wp(lx - hw, lz - hd), wp(lx + hw, lz - hd), wp(lx - hw, lz + hd), wp(lx + hw, lz + hd)];
    var x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (var k = 0; k < 4; k++) { x0 = Math.min(x0, pts[k][0]); x1 = Math.max(x1, pts[k][0]); z0 = Math.min(z0, pts[k][1]); z1 = Math.max(z1, pts[k][1]); }
    solid(x0, x1, z0, z1, 0, y1 || (FLOOR + WALL_H + 0.3));
  }
  for (var ci = 0; ci < 8; ci++) boxSolid(-0.99 + (ci + 0.5) * 0.2475, 0.80, 0.124, 0.28, 1.30);

  // ── hand the parts to the world, so each can be moved in the editor ──
  g.updateMatrixWorld(true);
  var parts = g.children.slice();
  for (var pi = 0; pi < parts.length; pi++) {
    var part = parts[pi];
    g.remove(part);
    part.applyMatrix4(g.matrixWorld);
    part.updateMatrixWorld(true);
    scene.add(part);
  }
  PK_BOOTH[a.id] = anchor;
  return anchor;
}

// ── Turnstile: proper rotating arms with stainless cabinet ─────────────
function pkTurnstileBetter(x, z) {
  var g = new THREE.Group(); g.userData.dynamic = true; g.position.set(x, 0, z); scene.add(g);
  var steel = std({ color: 0xc2c7cd, roughness: 0.32, metalness: 0.78 });
  pkBevelBox(0.44, 0.92, 0.5, steel, 0, 0.46, 0, g, 0.03);         // the cabinet
  pkBevelBox(0.48, 0.05, 0.54, MAT.steelDark, 0, 0.945, 0, g, 0.02);
  pkRoundCyl(0.055, 0.06, MAT.steelDark, 0, 0.98, 0, g, 12);
  // three proper tripod arms off a low hub: a short bar with a ball on the end
  var arm = new THREE.Group(); arm.position.set(0, 0.88, 0); g.add(arm);
  for (var i = 0; i < 3; i++) {
    var a = new THREE.Group(); a.rotation.x = i * 2.0944; arm.add(a);
    var bar = new THREE.Mesh(roundCylGeo(0.018, 0.014, 0.42, 8), MAT.chrome);
    bar.rotation.x = Math.PI / 2; bar.position.z = 0.21; bar.castShadow = true; a.add(bar);
    var knob = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), MAT.chrome);
    knob.position.z = 0.43; a.add(knob);
  }
  // the reader on the cabinet, and a green pass light
  pkBevelBox(0.3, 0.16, 0.05, MAT.black, 0, 0.8, 0.26, g, 0.02);
  var led = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.02), glowMat(0x5fd38d, 1.1));
  led.position.set(0, 0.855, 0.29); g.add(led);
  PK.turnstiles.push({ x: x, z: z, arm: arm, led: led, spin: 0, pass: 0 });
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
