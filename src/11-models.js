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
  // the self-service ticket machine beside the counter on the outer side: a cabinet, a lit screen, a card slot. It sells
  // when nobody staffs the window (part 02, pkGuestMachine); its screen blinks green as it does
  var mx = -side * 2.25, mg = new THREE.Group(); mg.position.set(mx, 0, 1.9); g.add(mg);
  pkBevelBox(0.62, 1.55, 0.46, std({ color: 0x21402e, roughness: 0.6, metalness: 0.2 }), 0, 0.78, 0, mg, 0.05);
  pkBevelBox(0.66, 0.1, 0.5, std({ color: 0xc9a227, roughness: 0.35, metalness: 0.8 }), 0, 1.6, 0, mg, 0.03);
  var mScr = std({ color: 0x0b1a12, emissive: 0x5fd38d, emissiveIntensity: 0.35, roughness: 0.3 });
  pkBevelBox(0.42, 0.3, 0.02, mScr, 0, 1.22, 0.235, mg, 0.01);
  pkBevelBox(0.16, 0.03, 0.02, MAT.steelDark, 0, 0.98, 0.235, mg, 0.005);
  sign(['TICKETS'], 0.5, 0.12, 0, 1.47, 0.24, 0, { bg: '#21402e', fg: '#f6e2a6' }, mg);
  b.machine = { blink: 0, mat: mScr };
  animate(function (dt) { var m = b.machine; if (m.blink > 0) m.blink -= dt; m.mat.emissiveIntensity = m.blink > 0 && Math.sin(m.blink * 18) > 0 ? 1.4 : 0.35; });
  solid(b.x + mx - 0.32, b.x + mx + 0.32, b.z + 1.66, b.z + 2.14, 0, 1.6);
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
  PK.booths.push({ i: i, x: b.x, z: b.z, turnstile: b.turnstile, queue: [], screen: sc, g: g, machine: b.machine });
  solid(b.x - 1.72, b.x + 1.72, b.z - 1.62, b.z - 1.38, 0, 3.0);
  solid(b.x - 1.72, b.x - 1.48, b.z - 1.62, b.z + 1.62, 0, 3.0);
  solid(b.x + 1.48, b.x + 1.72, b.z - 1.62, b.z + 1.62, 0, 3.0);
  solid(b.x - 1.72, b.x + 1.72, b.z + 1.38, b.z + 1.78, 0, 1.0);
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
