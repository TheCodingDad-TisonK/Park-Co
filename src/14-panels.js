//@ Park Co, part 14 (the booth panels): every ride's booth desk is its own. The hardware and the rules are the same on
//@ all of them (part 14, the control desks, and part 09, the booths), but each plate is designed for its ride: its own
//@ enamel and printing, its maker's plate, its crest, a live mimic of the ride drawn from the ride's real geometry (the
//@ coasters' and the flume's plan and profile from their own track, the rotors' seats where they really are), its own
//@ instruments, a dispatch interlock chain, and its own voice. The sheets (PK_PANEL) say what each ride carries.

  // ── The kit ──────────────────────────────────────────────────────
  var PK_PN = { mats: {}, geo: null };
  function pkPnStd(def) { var k = JSON.stringify(def); return PK_PN.mats[k] || (PK_PN.mats[k] = std(def)); }
  function pkPnCaps() {
    var M = pkCtlM(), K = pkMats();
    var add = function (k, col) { if (!M.caps[k]) M.caps[k] = std({ color: col, roughness: 0.42 }); };
    add('pink', 0xe57fa5); add('teal', 0x2f9e9a); add('purple', 0x7a5bc4); add('orange', 0xe0702a); add('sky', 0x5aa9e6);
    add('cream', 0xf1e6c8); add('lime', 0x7fc23a); add('crimson', 0x9a1f2a); add('jade', 0x2f8f6f); add('navy', 0x2a3a6a);
    if (!M.caps.brass) M.caps.brass = K.brass || K.gold;
    return M;
  }
  // a lamp that is the panel's own: its own material, written every frame, so the park's light switches (part 01, which
  // collect the glowing lenses once) can never leave a desk lamp stuck dark or lit
  function pkPnGlow(col) { var m = std({ color: 0x0b0b0b, emissive: col, emissiveIntensity: 0.05, roughness: 0.35 }); m.userData.pkPanelLamp = true; return m; }
  function pkPnDome() { return PK_PN.geo || (PK_PN.geo = new THREE.SphereGeometry(1, 12, 8)); }
  // an indicator on the plate: a bezel and a domed lens. api.on: true (lit), 'dim' (a glow), 'flash', false
  function pkPnLed(P, x, y, o) {
    o = o || {};
    var r = o.r || 0.011, mat = pkPnGlow(o.col || 0x5fd38d);
    var bz = new THREE.Mesh(roundCylGeo(r * 1.5, r * 1.58, 0.006, 14), o.bezel || pkCtlM().bezel); bz.rotation.x = Math.PI / 2; bz.position.set(x, y, 0.003); P.add(bz);
    var lens = new THREE.Mesh(pkPnDome(), mat); lens.scale.set(r, r, r * 0.6); lens.position.set(x, y, 0.007); P.add(lens);
    var api = { on: false, level: 0, mat: mat, k: o.k || 2.2, t: Math.random() * 3 };
    pkCtlLive({ tick: function (dt) {
      api.t += dt;
      var w = api.on === 'flash' ? (Math.sin(api.t * 9) > 0 ? 1 : 0.12) : api.on === 'dim' ? 0.22 : api.on ? 1 : 0;
      if (!pkCtlPowered(P)) w = 0;
      api.level += (w - api.level) * Math.min(1, dt * 14);
      mat.emissiveIntensity = 0.05 + api.level * api.k;
    } });
    return api;
  }
  // a moving light on the mimic: a pip under the glass, in a group of its own that the tick slides about
  function pkPnPip(parent, r, col) {
    var g = new THREE.Group(); g.userData.dynamic = true; parent.add(g);
    var mat = pkPnGlow(col), m = new THREE.Mesh(pkPnDome(), mat); m.scale.set(r, r, r * 0.55); g.add(m);
    return { g: g, mat: mat, level: 0, col: col, set: function (x, y) { g.position.set(x, y, 0.0045); } };
  }
  function pkPnPipLight(p, w, dt, k) { p.level += (w - p.level) * Math.min(1, dt * 10); p.mat.emissiveIntensity = 0.05 + p.level * (k || 2.4); }

  // ── Drawing on the plate ─────────────────────────────────────────
  // the ruler of part 14 (metres in, pixels out) plus a few shapes; S is the plate's style
  function pkPnText(R, S, s, mx, my, size, o) {
    o = o || {};
    var c = R.c; c.save(); c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
    c.font = (o.weight || '700') + ' ' + Math.max(7, Math.round(R.L(size))) + 'px ' + (o.font || S.font);
    if (o.spacing) c.letterSpacing = R.L(o.spacing) + 'px';
    var X = R.X(mx), Y = R.Y(my);
    if (!o.flat && S.engrave !== false) { c.fillStyle = S.shadow || 'rgba(0,0,0,0.5)'; if (o.max) c.fillText(s, X + R.L(0.0013), Y + R.L(0.0013), R.L(o.max)); else c.fillText(s, X + R.L(0.0013), Y + R.L(0.0013)); }
    c.fillStyle = o.col || S.ink;
    if (o.max) c.fillText(s, X, Y, R.L(o.max)); else c.fillText(s, X, Y);
    c.restore();
  }
  function pkPnRect(R, x0, y0, x1, y1, r) { roundRect(R.c, R.X(x0), R.Y(y1), R.L(x1 - x0), R.L(y1 - y0), R.L(r || 0.01)); }
  // a field on the plate: a recessed rounded panel with its edge line and a small title in its corner
  function pkPnZone(R, S, x0, y0, x1, y1, title) {
    var c = R.c; c.save();
    pkPnRect(R, x0, y0, x1, y1, S.zr || 0.012); c.fillStyle = S.zone; c.fill();
    c.lineWidth = R.L(S.zw || 0.0028); c.strokeStyle = S.edge; c.stroke();
    pkPnRect(R, x0 + 0.005, y0 + 0.005, x1 - 0.005, y1 - 0.005, (S.zr || 0.012) * 0.7); c.lineWidth = R.L(0.0011); c.strokeStyle = S.edge2 || 'rgba(255,255,255,0.10)'; c.stroke();
    c.restore();
    if (title) pkPnText(R, S, title, x0 + 0.014, y1 - 0.014, 0.0115, { align: 'left', col: S.dim, weight: '700', spacing: 0.0012 });
  }
  function pkPnLine(R, pts, col, w) { var c = R.c; c.beginPath(); pts.forEach(function (p, i) { if (i) c.lineTo(R.X(p[0]), R.Y(p[1])); else c.moveTo(R.X(p[0]), R.Y(p[1])); }); c.strokeStyle = col; c.lineWidth = R.L(w || 0.002); c.stroke(); }
  function pkPnCircle(R, x, y, r, fill, stroke, w) { var c = R.c; c.beginPath(); c.arc(R.X(x), R.Y(y), R.L(r), 0, 6.2832); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = R.L(w || 0.002); c.stroke(); } }
  // finishes
  function pkPnFill(c, W, H, top, bot) { var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot || top); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  function pkPnStreaks(c, W, H, n, a) { for (var i = 0; i < n; i++) { c.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '255,255,255' : '0,0,0') + ',' + randf(0.008, a || 0.035) + ')'; c.fillRect(Math.random() * W, Math.random() * H, randf(2, 30), 1); } }
  function pkPnVignette(c, W, H, k) { var g = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.7); g.addColorStop(0, 'rgba(255,255,255,0.05)'); g.addColorStop(1, 'rgba(0,0,0,' + (k || 0.3) + ')'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  function pkPnStars(c, W, H, n, col) { for (var i = 0; i < n; i++) { var r = Math.random() < 0.08 ? randf(2, 3.5) : randf(0.6, 1.6); c.globalAlpha = randf(0.3, 0.95); c.fillStyle = col || '#ffffff'; c.beginPath(); c.arc(Math.random() * W, Math.random() * H, r, 0, 6.2832); c.fill(); } c.globalAlpha = 1; }
  function pkPnScales(c, W, H, s, light, dark) {
    for (var row = 0, y = -s; y < H + s; y += s * 0.5, row++) for (var x = (row % 2) * s * 0.5 - s; x < W + s; x += s) {
      var g = c.createRadialGradient(x, y - s * 0.2, s * 0.05, x, y, s * 0.62); g.addColorStop(0, light); g.addColorStop(1, dark);
      c.fillStyle = g; c.beginPath(); c.arc(x, y, s * 0.56, 0, Math.PI); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, s * 0.56, 0, Math.PI); c.stroke();
    }
  }
  function pkPnPlanks(c, W, H, n, a, b) {
    var ph = H / n;
    for (var i = 0; i < n; i++) {
      c.fillStyle = i % 2 ? a : b; c.fillRect(0, i * ph, W, ph);
      for (var k = 0; k < 40; k++) { c.strokeStyle = 'rgba(40,20,5,' + randf(0.06, 0.18) + ')'; c.lineWidth = randf(1, 3); var yy = i * ph + randf(4, ph - 4); c.beginPath(); c.moveTo(0, yy); c.bezierCurveTo(W * 0.3, yy + randf(-6, 6), W * 0.7, yy + randf(-6, 6), W, yy + randf(-4, 4)); c.stroke(); }
      c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(0, i * ph, W, 3);
      for (var j = 0; j < 3; j++) { var bx = (j * 0.37 + i * 0.21) % 1 * W; c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(bx, i * ph, 3, ph); c.fillStyle = '#2a2a2a'; c.beginPath(); c.arc(bx + 18, i * ph + ph * 0.3, 5, 0, 6.28); c.arc(bx + 18, i * ph + ph * 0.7, 5, 0, 6.28); c.fill(); }
    }
  }
  function pkPnTread(c, W, H) {
    pkPnFill(c, W, H, '#7d858b', '#5f676d'); pkPnStreaks(c, W, H, 3000, 0.05);
    for (var y = 0, r = 0; y < H + 40; y += 34, r++) for (var x = (r % 2) * 34; x < W + 40; x += 68) {
      [[0, 1], [1, 0]].forEach(function (d, k) {
        c.save(); c.translate(x + k * 34, y); c.rotate(k ? -0.6 : 0.6);
        c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(-14, -3.5, 28, 4); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(-14, 0.5, 28, 3); c.restore();
      });
    }
  }
  function pkPnHazard(c, x, y, w, h, s, a, b) { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.fillStyle = a; c.fillRect(x, y, w, h); c.fillStyle = b; for (var k = -h; k < w + h; k += s * 2) { c.beginPath(); c.moveTo(x + k, y + h); c.lineTo(x + k + s, y + h); c.lineTo(x + k + s + h, y); c.lineTo(x + k + h, y); c.closePath(); c.fill(); } c.restore(); }
  function pkPnDots(c, W, H, step, r, col) { c.fillStyle = col; for (var y = step / 2, row = 0; y < H; y += step, row++) for (var x = (row % 2) * step / 2 + step / 4; x < W; x += step) { c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill(); } }
  function pkPnStone(c, W, H, a, b) {
    pkPnFill(c, W, H, a, b);
    var bh = H / 5;
    for (var row = 0; row < 5; row++) for (var x = (row % 2) * -90; x < W; x += 180 + randf(-20, 30)) {
      c.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '255,255,255' : '0,0,0') + ',' + randf(0.02, 0.08) + ')'; c.fillRect(x + 3, row * bh + 3, 176, bh - 6);
      c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 4; c.strokeRect(x, row * bh, 180, bh);
    }
    blotches(c, W, H, 30, 20, 120, true, 0.12); cracks(c, W, H, 18, 0.3);
  }
  function pkPnDamask(c, W, H, col) {
    c.fillStyle = col;
    for (var y = 0, r = 0; y < H + 80; y += 90, r++) for (var x = (r % 2) * 70; x < W + 80; x += 140) {
      c.save(); c.translate(x, y);
      for (var k = 0; k < 4; k++) { c.rotate(Math.PI / 2); c.beginPath(); c.ellipse(0, -14, 7, 16, 0, 0, 6.2832); c.fill(); }
      c.beginPath(); c.arc(0, 0, 5, 0, 6.2832); c.fill(); c.restore();
    }
  }
  function pkPnRope(c, x, y, w, h, col) {
    c.save(); c.strokeStyle = col; c.lineWidth = 7; c.strokeRect(x, y, w, h);
    c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 2.5;
    var P = 2 * (w + h);
    for (var d = 0; d < P; d += 14) {
      var px, py; if (d < w) { px = x + d; py = y; } else if (d < w + h) { px = x + w; py = y + d - w; } else if (d < 2 * w + h) { px = x + w - (d - w - h); py = y + h; } else { px = x; py = y + h - (d - 2 * w - h); }
      c.beginPath(); c.moveTo(px - 4, py - 4); c.lineTo(px + 4, py + 4); c.stroke();
    }
    c.restore();
  }
  function pkPnPinstripe(c, W, H, inset, col, lw, r) { c.save(); roundRect(c, inset, inset, W - inset * 2, H - inset * 2, r || 18); c.strokeStyle = col; c.lineWidth = lw || 3; c.stroke(); c.restore(); }
  // a scroll in a corner: two curls of a vine, gold leaf on enamel
  function pkPnScroll(c, x, y, s, sx, sy, col) {
    c.save(); c.translate(x, y); c.scale(sx * s, sy * s); c.strokeStyle = col; c.lineWidth = 2.6 / s; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(40, 0, 60, 20, 50, 40); c.bezierCurveTo(44, 52, 28, 48, 30, 36); c.bezierCurveTo(32, 28, 42, 30, 40, 36); c.stroke();
    c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(0, 40, 20, 60, 40, 50); c.bezierCurveTo(52, 44, 48, 28, 36, 30); c.stroke();
    c.beginPath(); c.moveTo(6, 6); c.lineTo(70, 6); c.moveTo(6, 6); c.lineTo(6, 70); c.stroke();
    c.fillStyle = col; c.beginPath(); c.arc(0, 0, 5 / s, 0, 6.2832); c.fill(); c.restore();
  }
  function pkPnVines(c, W, H, col) {
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 3;
    [[0, 1], [H, -1]].forEach(function (e) {
      c.beginPath(); for (var x = 0; x <= W; x += 8) { var y = e[0] + e[1] * (22 + Math.sin(x / 60) * 10); if (x) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke();
      for (var lx = 30; lx < W; lx += 60) { var ly = e[0] + e[1] * (22 + Math.sin(lx / 60) * 10); c.save(); c.translate(lx, ly); c.rotate((lx / 60) % 2 ? 0.7 : -0.7); c.beginPath(); c.ellipse(0, e[1] * 12, 6, 13, 0, 0, 6.2832); c.fill(); c.restore(); }
    });
    c.restore();
  }
  function pkPnRunes(c, x, y, w, n, col, size) {
    c.save(); c.strokeStyle = col; c.lineWidth = Math.max(2, size * 0.12); c.lineCap = 'round';
    var rnd = 1; var rr = function () { rnd = (rnd * 16807) % 2147483647; return rnd / 2147483647; };
    for (var i = 0; i < n; i++) {
      var cx = x + i * (w / n), cy = y;
      c.beginPath(); c.moveTo(cx, cy - size / 2); c.lineTo(cx, cy + size / 2);
      var k = Math.floor(rr() * 4);
      if (k === 0) { c.moveTo(cx, cy - size / 2); c.lineTo(cx + size * 0.35, cy - size * 0.2); c.moveTo(cx, cy); c.lineTo(cx + size * 0.35, cy - size * 0.3); }
      else if (k === 1) { c.moveTo(cx, cy - size * 0.1); c.lineTo(cx + size * 0.35, cy - size / 2); c.moveTo(cx, cy - size * 0.1); c.lineTo(cx + size * 0.35, cy + size * 0.3); }
      else if (k === 2) { c.moveTo(cx - size * 0.3, cy - size * 0.3); c.lineTo(cx + size * 0.3, cy + size * 0.1); }
      else { c.moveTo(cx, cy - size / 2); c.lineTo(cx + size * 0.3, cy - size * 0.15); c.lineTo(cx, cy + size * 0.2); }
      c.stroke();
    }
    c.restore();
  }
  function pkPnMountains(c, x, y, w, h, col, snow) {
    c.save(); c.fillStyle = col; c.beginPath(); c.moveTo(x, y + h);
    var peaks = [[0, 0.55], [0.12, 0.2], [0.22, 0.5], [0.34, 0.05], [0.48, 0.45], [0.6, 0.15], [0.72, 0.55], [0.84, 0.25], [1, 0.6]];
    peaks.forEach(function (p) { c.lineTo(x + p[0] * w, y + p[1] * h); }); c.lineTo(x + w, y + h); c.closePath(); c.fill();
    if (snow) { c.fillStyle = snow; [[0.12, 0.2], [0.34, 0.05], [0.6, 0.15], [0.84, 0.25]].forEach(function (p) { c.beginPath(); c.moveTo(x + p[0] * w, y + p[1] * h); c.lineTo(x + (p[0] - 0.035) * w, y + (p[1] + 0.14) * h); c.lineTo(x + (p[0] + 0.035) * w, y + (p[1] + 0.14) * h); c.closePath(); c.fill(); }); }
    c.restore();
  }
  function pkPnFlames(c, W, H) {
    for (var i = 0; i < 70; i++) {
      var x = Math.random() * W, y = H - Math.random() * H * 0.3, h = randf(H * 0.2, H * 0.9), w = randf(20, 60);
      var g = c.createLinearGradient(x, y, x, y - h); g.addColorStop(0, 'rgba(255,200,80,0.18)'); g.addColorStop(1, 'rgba(255,90,30,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(x - w, y); c.bezierCurveTo(x - w, y - h * 0.5, x + w * 0.4, y - h * 0.6, x, y - h); c.bezierCurveTo(x + w * 0.2, y - h * 0.5, x + w, y - h * 0.4, x + w, y); c.closePath(); c.fill();
    }
  }

  // ── The crests ───────────────────────────────────────────────────
  // a medallion for each ride, drawn at (x, y) with radius r in pixels, in the style's ink and accent
  var PK_PN_CRESTS = {
    carousel: function (c, x, y, r, S) {
      c.fillStyle = S.acc; c.beginPath(); c.moveTo(x, y - r * 0.78); c.lineTo(x + r * 0.7, y - r * 0.18); c.lineTo(x - r * 0.7, y - r * 0.18); c.closePath(); c.fill();
      for (var k = 0; k < 7; k++) { c.beginPath(); c.arc(x - r * 0.6 + k * r * 0.2, y - r * 0.18, r * 0.1, 0, Math.PI); c.fill(); }
      c.fillRect(x - r * 0.62, y + r * 0.42, r * 1.24, r * 0.12);
      c.fillStyle = S.ink; [-0.4, 0, 0.4].forEach(function (k) { c.fillRect(x + k * r - r * 0.03, y - r * 0.1, r * 0.06, r * 0.52); c.beginPath(); c.ellipse(x + k * r, y + r * 0.16, r * 0.12, r * 0.07, 0, 0, 6.28); c.fill(); });
      c.fillStyle = S.acc; c.beginPath(); c.arc(x, y - r * 0.82, r * 0.08, 0, 6.28); c.fill();
    },
    teacups: function (c, x, y, r, S) {
      c.fillStyle = S.acc; c.beginPath(); c.ellipse(x, y + r * 0.45, r * 0.72, r * 0.14, 0, 0, 6.28); c.fill();
      c.fillStyle = S.ink; c.beginPath(); c.moveTo(x - r * 0.5, y - r * 0.15); c.lineTo(x + r * 0.5, y - r * 0.15); c.bezierCurveTo(x + r * 0.48, y + r * 0.3, x + r * 0.25, y + r * 0.42, x, y + r * 0.42); c.bezierCurveTo(x - r * 0.25, y + r * 0.42, x - r * 0.48, y + r * 0.3, x - r * 0.5, y - r * 0.15); c.fill();
      c.strokeStyle = S.ink; c.lineWidth = r * 0.09; c.beginPath(); c.arc(x + r * 0.55, y + r * 0.06, r * 0.16, -1.4, 1.4); c.stroke();
      c.strokeStyle = S.acc; c.lineWidth = r * 0.06; [-0.2, 0.05, 0.3].forEach(function (k) { c.beginPath(); c.moveTo(x + k * r, y - r * 0.25); c.bezierCurveTo(x + k * r - r * 0.12, y - r * 0.4, x + k * r + r * 0.12, y - r * 0.5, x + k * r, y - r * 0.68); c.stroke(); });
    },
    ferris: function (c, x, y, r, S) {
      c.strokeStyle = S.ink; c.lineWidth = r * 0.08; c.beginPath(); c.arc(x, y - r * 0.1, r * 0.6, 0, 6.28); c.stroke();
      c.lineWidth = r * 0.04; for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4; c.beginPath(); c.moveTo(x, y - r * 0.1); c.lineTo(x + Math.cos(a) * r * 0.6, y - r * 0.1 + Math.sin(a) * r * 0.6); c.stroke(); c.fillStyle = S.acc; c.beginPath(); c.arc(x + Math.cos(a) * r * 0.6, y - r * 0.1 + Math.sin(a) * r * 0.6, r * 0.09, 0, 6.28); c.fill(); }
      c.lineWidth = r * 0.08; c.beginPath(); c.moveTo(x - r * 0.45, y + r * 0.75); c.lineTo(x, y - r * 0.1); c.lineTo(x + r * 0.45, y + r * 0.75); c.stroke();
    },
    dodgems: function (c, x, y, r, S) {
      c.fillStyle = S.acc; c.beginPath(); c.moveTo(x + r * 0.15, y - r * 0.8); c.lineTo(x - r * 0.4, y + r * 0.1); c.lineTo(x - r * 0.02, y + r * 0.1); c.lineTo(x - r * 0.18, y + r * 0.8); c.lineTo(x + r * 0.42, y - r * 0.12); c.lineTo(x + r * 0.04, y - r * 0.12); c.closePath(); c.fill();
      c.strokeStyle = S.ink; c.lineWidth = r * 0.05; c.stroke();
    },
    droptower: function (c, x, y, r, S) {
      c.fillStyle = S.ink; c.fillRect(x - r * 0.08, y - r * 0.85, r * 0.16, r * 1.6); c.fillRect(x - r * 0.3, y - r * 0.9, r * 0.6, r * 0.12);
      c.fillStyle = S.acc; c.beginPath(); c.moveTo(x - r * 0.42, y + r * 0.05); c.lineTo(x + r * 0.42, y + r * 0.05); c.lineTo(x, y + r * 0.7); c.closePath(); c.fill();
      c.fillRect(x - r * 0.16, y - r * 0.45, r * 0.32, r * 0.5);
    },
    flume: function (c, x, y, r, S) {
      c.fillStyle = S.ink; c.beginPath(); c.ellipse(x, y - r * 0.05, r * 0.62, r * 0.2, 0, 0, 6.28); c.fill();
      c.fillStyle = S.acc; c.beginPath(); c.ellipse(x - r * 0.62, y - r * 0.05, r * 0.08, r * 0.2, 0, 0, 6.28); c.fill();
      c.strokeStyle = S.acc; c.lineWidth = r * 0.09; for (var k = 0; k < 2; k++) { c.beginPath(); for (var i = 0; i <= 20; i++) { var xx = x - r * 0.75 + i * r * 0.075, yy = y + r * (0.35 + k * 0.22) + Math.sin(i * 0.9) * r * 0.07; if (i) c.lineTo(xx, yy); else c.moveTo(xx, yy); } c.stroke(); }
    },
    haunted: function (c, x, y, r, S) {
      c.fillStyle = S.acc; c.beginPath(); c.arc(x + r * 0.32, y - r * 0.38, r * 0.3, 0, 6.28); c.fill();
      c.fillStyle = S.zone2 || '#151318'; c.beginPath(); c.arc(x + r * 0.44, y - r * 0.46, r * 0.26, 0, 6.28); c.fill();
      c.fillStyle = S.ink; c.beginPath(); c.moveTo(x - r * 0.7, y + r * 0.75); c.lineTo(x - r * 0.7, y); c.lineTo(x - r * 0.45, y - r * 0.3); c.lineTo(x - r * 0.2, y); c.lineTo(x - r * 0.2, y - r * 0.15); c.lineTo(x + r * 0.15, y - r * 0.5); c.lineTo(x + r * 0.5, y - r * 0.15); c.lineTo(x + r * 0.5, y + r * 0.75); c.closePath(); c.fill();
      c.fillStyle = S.acc; [[-0.55, 0.25], [-0.05, 0.1], [0.25, 0.1], [0.25, 0.45], [-0.05, 0.45]].forEach(function (w) { c.fillRect(x + w[0] * r, y + w[1] * r, r * 0.13, r * 0.17); });
    },
    kround: function (c, x, y, r, S) {
      c.fillStyle = S.acc; for (var k = 0; k < 12; k++) { var a = k * Math.PI / 6; c.beginPath(); c.moveTo(x + Math.cos(a - 0.14) * r * 0.5, y + Math.sin(a - 0.14) * r * 0.5); c.lineTo(x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85); c.lineTo(x + Math.cos(a + 0.14) * r * 0.5, y + Math.sin(a + 0.14) * r * 0.5); c.fill(); }
      c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(x, y, r * 0.5, 0, 6.28); c.fill();
      c.fillStyle = S.ink; c.beginPath(); c.arc(x - r * 0.17, y - r * 0.1, r * 0.06, 0, 6.28); c.arc(x + r * 0.17, y - r * 0.1, r * 0.06, 0, 6.28); c.fill();
      c.strokeStyle = S.ink; c.lineWidth = r * 0.06; c.beginPath(); c.arc(x, y + r * 0.02, r * 0.25, 0.4, Math.PI - 0.4); c.stroke();
    },
    kpots: function (c, x, y, r, S) {
      c.fillStyle = S.ink; c.beginPath(); c.ellipse(x, y + r * 0.1, r * 0.52, r * 0.42, 0, 0, 6.28); c.fill();
      c.fillRect(x - r * 0.3, y - r * 0.38, r * 0.6, r * 0.1); c.beginPath(); c.arc(x, y - r * 0.44, r * 0.09, 0, 6.28); c.fill();
      c.strokeStyle = S.ink; c.lineWidth = r * 0.1; c.beginPath(); c.moveTo(x + r * 0.45, y); c.quadraticCurveTo(x + r * 0.8, y - r * 0.05, x + r * 0.85, y - r * 0.38); c.stroke();
      c.beginPath(); c.arc(x - r * 0.55, y + r * 0.1, r * 0.2, Math.PI * 0.5, Math.PI * 1.5); c.stroke();
      c.fillStyle = S.acc; [-0.22, 0.02, 0.26].forEach(function (k) { c.beginPath(); c.arc(x + k * r, y + r * 0.12, r * 0.07, 0, 6.28); c.fill(); });
    },
    kpuffin: function (c, x, y, r, S) {
      c.fillStyle = '#20232a'; c.beginPath(); c.arc(x, y, r * 0.62, 0, 6.28); c.fill();
      c.fillStyle = '#f4f1e6'; c.beginPath(); c.ellipse(x - r * 0.12, y + r * 0.02, r * 0.36, r * 0.42, 0, 0, 6.28); c.fill();
      c.fillStyle = '#e0563f'; c.beginPath(); c.moveTo(x + r * 0.1, y - r * 0.12); c.quadraticCurveTo(x + r * 0.95, y + r * 0.0, x + r * 0.12, y + r * 0.28); c.closePath(); c.fill();
      c.fillStyle = '#f0c04a'; c.fillRect(x + r * 0.16, y - r * 0.02, r * 0.3, r * 0.05);
      c.fillStyle = '#20232a'; c.beginPath(); c.arc(x - r * 0.12, y - r * 0.12, r * 0.07, 0, 6.28); c.fill();
    },
    serpent: function (c, x, y, r, S) {
      c.strokeStyle = S.acc; c.lineWidth = r * 0.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - r * 0.55, y + r * 0.55); c.bezierCurveTo(x + r * 0.6, y + r * 0.6, x - r * 0.6, y - r * 0.1, x + r * 0.2, y - r * 0.35); c.stroke();
      c.fillStyle = S.acc; c.beginPath(); c.ellipse(x + r * 0.35, y - r * 0.42, r * 0.22, r * 0.15, -0.4, 0, 6.28); c.fill();
      c.fillStyle = S.ink; c.beginPath(); c.arc(x + r * 0.4, y - r * 0.48, r * 0.04, 0, 6.28); c.fill();
      c.strokeStyle = '#c0392b'; c.lineWidth = r * 0.04; c.beginPath(); c.moveTo(x + r * 0.55, y - r * 0.5); c.lineTo(x + r * 0.75, y - r * 0.6); c.moveTo(x + r * 0.65, y - r * 0.55); c.lineTo(x + r * 0.78, y - r * 0.48); c.stroke();
    },
    baron: function (c, x, y, r, S) {
      c.fillStyle = S.acc; c.beginPath(); c.moveTo(x - r * 0.5, y - r * 0.35); c.lineTo(x + r * 0.5, y - r * 0.35); c.lineTo(x + r * 0.5, y + r * 0.1); c.quadraticCurveTo(x + r * 0.5, y + r * 0.6, x, y + r * 0.8); c.quadraticCurveTo(x - r * 0.5, y + r * 0.6, x - r * 0.5, y + r * 0.1); c.closePath(); c.fill();
      c.fillStyle = S.zone2 || '#4a1414'; c.beginPath(); c.moveTo(x - r * 0.42, y + r * 0.25); c.lineTo(x, y - r * 0.12); c.lineTo(x + r * 0.42, y + r * 0.25); c.lineTo(x + r * 0.42, y + r * 0.42); c.lineTo(x, y + r * 0.05); c.lineTo(x - r * 0.42, y + r * 0.42); c.closePath(); c.fill();
      c.fillStyle = S.acc; c.beginPath(); c.moveTo(x - r * 0.4, y - r * 0.45); c.lineTo(x - r * 0.4, y - r * 0.8); c.lineTo(x - r * 0.2, y - r * 0.6); c.lineTo(x, y - r * 0.85); c.lineTo(x + r * 0.2, y - r * 0.6); c.lineTo(x + r * 0.4, y - r * 0.8); c.lineTo(x + r * 0.4, y - r * 0.45); c.closePath(); c.fill();
    },
    nocturne: function (c, x, y, r, S) {
      c.fillStyle = S.acc; c.beginPath(); c.arc(x - r * 0.08, y, r * 0.55, 0, 6.28); c.fill();
      c.fillStyle = S.zone2 || '#1d1a33'; c.beginPath(); c.arc(x + r * 0.14, y - r * 0.12, r * 0.48, 0, 6.28); c.fill();
      c.fillStyle = S.ink; [[0.45, -0.5, 0.07], [0.62, 0.1, 0.05], [0.3, 0.45, 0.04], [0.65, -0.18, 0.03]].forEach(function (s) { c.beginPath(); c.arc(x + s[0] * r, y + s[1] * r, s[2] * r, 0, 6.28); c.fill(); });
    },
    wreck: function (c, x, y, r, S) {
      c.strokeStyle = S.acc; c.lineWidth = r * 0.1; c.lineCap = 'round';
      c.beginPath(); c.arc(x, y - r * 0.62, r * 0.13, 0, 6.28); c.moveTo(x, y - r * 0.5); c.lineTo(x, y + r * 0.62); c.moveTo(x - r * 0.32, y - r * 0.3); c.lineTo(x + r * 0.32, y - r * 0.3); c.stroke();
      c.beginPath(); c.arc(x, y + r * 0.1, r * 0.55, 0.25, Math.PI - 0.25); c.stroke();
      c.fillStyle = S.acc; [-1, 1].forEach(function (s) { c.beginPath(); c.moveTo(x + s * r * 0.6, y + r * 0.25); c.lineTo(x + s * r * 0.42, y + r * 0.1); c.lineTo(x + s * r * 0.4, y + r * 0.34); c.fill(); });
    },
    moonwood: function (c, x, y, r, S) {
      c.fillStyle = S.ink; c.beginPath(); c.arc(x + r * 0.42, y - r * 0.5, r * 0.18, 0, 6.28); c.fill();
      c.fillStyle = S.acc; c.fillRect(x - r * 0.07, y - r * 0.05, r * 0.14, r * 0.8);
      [[0, -0.35, 0.42], [-0.32, -0.12, 0.3], [0.3, -0.1, 0.3], [0, -0.62, 0.25]].forEach(function (b) { c.beginPath(); c.arc(x + b[0] * r, y + b[1] * r, b[2] * r, 0, 6.28); c.fill(); });
      c.strokeStyle = S.acc; c.lineWidth = r * 0.06; c.beginPath(); c.moveTo(x, y + r * 0.75); c.lineTo(x - r * 0.35, y + r * 0.82); c.moveTo(x, y + r * 0.75); c.lineTo(x + r * 0.35, y + r * 0.82); c.stroke();
    },
    dragon: function (c, x, y, r, S) {
      c.fillStyle = S.acc; c.beginPath(); c.moveTo(x - r * 0.75, y); c.quadraticCurveTo(x, y - r * 0.75, x + r * 0.75, y); c.quadraticCurveTo(x, y + r * 0.75, x - r * 0.75, y); c.fill();
      var g = c.createRadialGradient(x, y, 1, x, y, r * 0.42); g.addColorStop(0, '#fff2a8'); g.addColorStop(1, '#d88a1a'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 0.4, 0, 6.28); c.fill();
      c.fillStyle = '#111'; c.beginPath(); c.ellipse(x, y, r * 0.07, r * 0.36, 0, 0, 6.28); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.arc(x - r * 0.14, y - r * 0.14, r * 0.06, 0, 6.28); c.fill();
    },
    firebird: function (c, x, y, r, S) {
      var g = c.createLinearGradient(x, y + r * 0.8, x, y - r * 0.8); g.addColorStop(0, '#ffe08a'); g.addColorStop(0.5, '#ff8a30'); g.addColorStop(1, '#c8452a'); c.fillStyle = g;
      c.beginPath(); c.moveTo(x, y + r * 0.8); c.bezierCurveTo(x - r * 0.75, y + r * 0.2, x - r * 0.1, y - r * 0.2, x - r * 0.3, y - r * 0.85); c.bezierCurveTo(x + r * 0.15, y - r * 0.4, x + r * 0.2, y - r * 0.6, x + r * 0.15, y - r * 0.9); c.bezierCurveTo(x + r * 0.7, y - r * 0.3, x + r * 0.6, y + r * 0.4, x, y + r * 0.8); c.fill();
      c.fillStyle = '#fff6d0'; c.beginPath(); c.ellipse(x + r * 0.05, y + r * 0.35, r * 0.14, r * 0.28, 0, 0, 6.28); c.fill();
    },
    coaster: function (c, x, y, r, S) {
      c.strokeStyle = S.ink; c.lineWidth = r * 0.12; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(x - r * 0.85, y + r * 0.55); c.lineTo(x - r * 0.45, y - r * 0.65); c.quadraticCurveTo(x - r * 0.3, y - r * 0.8, x - r * 0.15, y - r * 0.55); c.lineTo(x + r * 0.05, y + r * 0.2);
      c.bezierCurveTo(x + r * 0.2, y + r * 0.55, x + r * 0.7, y + r * 0.45, x + r * 0.6, y); c.bezierCurveTo(x + r * 0.5, y - r * 0.45, x + r * 0.05, y - r * 0.2, x + r * 0.25, y + r * 0.35); c.lineTo(x + r * 0.85, y + r * 0.55); c.stroke();
      c.fillStyle = S.acc; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.72, r * 0.12, 0, 6.28); c.fill();
      c.strokeStyle = S.acc; c.lineWidth = r * 0.06; c.beginPath(); c.moveTo(x - r * 0.9, y + r * 0.72); c.lineTo(x + r * 0.9, y + r * 0.72); c.stroke();
    },
    arena: function (c, x, y, r, S) {
      c.fillStyle = S.ink;
      c.fillRect(x - r * 0.7, y - r * 0.05, r * 1.4, r * 0.75);
      [[-0.7, 0.32], [-0.12, 0.24], [0.4, 0.32]].forEach(function (t) { c.fillRect(x + t[0] * r, y - r * 0.55, t[1] * r, r * 0.6); c.beginPath(); c.moveTo(x + t[0] * r - r * 0.04, y - r * 0.55); c.lineTo(x + (t[0] + t[1] / 2) * r, y - r * 0.9); c.lineTo(x + (t[0] + t[1]) * r + r * 0.04, y - r * 0.55); c.fill(); });
      c.fillStyle = S.zone2 || '#3a0e14'; c.beginPath(); c.arc(x, y + r * 0.42, r * 0.2, Math.PI, 0); c.fillRect(x - r * 0.2, y + r * 0.42, r * 0.4, r * 0.3); c.fill();
      ['#e04a3a', '#4f8fe0', '#5fae54', '#f0c040', '#9a6ad0'].forEach(function (col, i) { c.fillStyle = col; var fx = x + (i - 2) * r * 0.32; c.beginPath(); c.moveTo(fx, y - r * 0.08); c.lineTo(fx + r * 0.2, y - r * 0.02); c.lineTo(fx, y + r * 0.06); c.fill(); });
    },
    mountain: function (c, x, y, r, S) {
      c.fillStyle = S.ink; c.beginPath(); c.moveTo(x - r * 0.8, y + r * 0.7); c.lineTo(x - r * 0.25, y - r * 0.1); c.lineTo(x - r * 0.05, y + r * 0.15); c.lineTo(x + r * 0.3, y - r * 0.3); c.lineTo(x + r * 0.8, y + r * 0.7); c.closePath(); c.fill();
      c.fillStyle = '#f4f1e6'; c.beginPath(); c.moveTo(x + r * 0.3, y - r * 0.3); c.lineTo(x + r * 0.17, y - r * 0.1); c.lineTo(x + r * 0.42, y - r * 0.1); c.fill();
      c.fillStyle = S.acc; c.beginPath(); c.moveTo(x - r * 0.4, y - r * 0.4); c.lineTo(x - r * 0.4, y - r * 0.82); c.lineTo(x - r * 0.2, y - r * 0.6); c.lineTo(x, y - r * 0.88); c.lineTo(x + r * 0.2, y - r * 0.6); c.lineTo(x + r * 0.4, y - r * 0.82); c.lineTo(x + r * 0.4, y - r * 0.4); c.closePath(); c.fill();
      c.fillStyle = '#c0392b'; c.beginPath(); c.arc(x, y - r * 0.55, r * 0.06, 0, 6.28); c.fill();
    }
  };

  // ── The styles ───────────────────────────────────────────────────
  // a plate's finish and printing. base(c, W, H) lays the enamel; the rest is ink, the zones and the hardware it takes
  function pkPnStyles() {
    if (PK_PN.styles) return PK_PN.styles;
    var K = pkMats(), M = pkCtlM();
    var gold = K.gold || K.brass, brass = K.brass || K.gold, chrome = MAT.chrome;
    var iron = pkPnStd({ color: 0x2a2724, roughness: 0.55, metalness: 0.6 });
    var bronze = pkPnStd({ color: 0x8a5a2a, roughness: 0.35, metalness: 0.85 });
    var white = pkPnStd({ color: 0xf2efe6, roughness: 0.4, metalness: 0.1 });
    var ser = 'Georgia, "Palatino Linotype", "Times New Roman", serif', sans = 'Bahnschrift, "Segoe UI", Arial, sans-serif', toy = '"Segoe UI Black", "Arial Black", "Segoe UI", sans-serif';
    var S = PK_PN.styles = {
      brass: { font: ser, ink: '#f3dfa6', dim: '#c9a86a', acc: '#ffd27a', zone: 'rgba(20,4,8,0.38)', edge: '#c9a050', win: '#120608', grid: 'rgba(255,210,122,0.07)', rim: gold, collar: brass, screw: brass, dial: 'brass', lever: 'brass', tele: '#ffb03a', glow: 0.3,
        base: function (c, W, H) { pkPnFill(c, W, H, '#6a1a26', '#3d0e15'); pkPnDamask(c, W, H, 'rgba(255,210,140,0.04)'); pkPnStreaks(c, W, H, 1500, 0.025); pkPnVignette(c, W, H, 0.35); pkPnPinstripe(c, W, H, 10, '#c9a050', 4, 22); pkPnPinstripe(c, W, H, 20, 'rgba(201,160,80,0.55)', 1.5, 16); pkPnScroll(c, 14, 14, 1, 1, 1, '#d8b060'); pkPnScroll(c, W - 14, 14, 1, -1, 1, '#d8b060'); pkPnScroll(c, 14, H - 14, 1, 1, -1, '#d8b060'); pkPnScroll(c, W - 14, H - 14, 1, -1, -1, '#d8b060'); } },
      pastel: { font: '"Segoe UI", Arial, sans-serif', head: 'Georgia, serif', ink: '#2c4a50', dim: '#5f8a8e', acc: '#d9608a', ok: '#1f7a3a', stop: '#b8362b', wink: '#e8fff9', wdim: '#9fd6cc', wacc: '#ffb3cf', zone: 'rgba(255,255,255,0.42)', edge: '#d98aa8', edge2: 'rgba(255,255,255,0.6)', shadow: 'rgba(255,255,255,0.6)', win: '#183034', grid: 'rgba(159,224,212,0.09)', rim: white, collar: chrome, dial: 'cream', lever: 'pink', tele: '#9fe0d4', glow: 0.2, zr: 0.022,
        base: function (c, W, H) {
          pkPnFill(c, W, H, '#cdeee5', '#a8dccf'); pkPnStreaks(c, W, H, 800, 0.02);
          for (var i = 0; i < 46; i++) { var x = Math.random() * W, y = Math.random() < 0.5 ? randf(8, 46) : H - randf(8, 46); c.fillStyle = ['#f0a6c0', '#ffffff', '#f6d36a'][i % 3]; for (var p = 0; p < 5; p++) { var a = p * 1.2566; c.beginPath(); c.arc(x + Math.cos(a) * 7, y + Math.sin(a) * 7, 5.5, 0, 6.28); c.fill(); } c.fillStyle = '#f6d36a'; c.beginPath(); c.arc(x, y, 4, 0, 6.28); c.fill(); }
          pkPnPinstripe(c, W, H, 12, '#d98aa8', 4, 30); pkPnPinstripe(c, W, H, 22, 'rgba(255,255,255,0.8)', 2, 24);
        } },
      sky: { font: sans, ink: '#e6f0ff', dim: '#9fb8de', acc: '#9fd0ff', zone: 'rgba(4,10,24,0.42)', edge: 'rgba(159,208,255,0.55)', win: '#040a16', grid: 'rgba(159,208,255,0.08)', rim: chrome, collar: chrome, dial: 'black', lever: 'navy', tele: '#9fd0ff', glow: 0.32,
        base: function (c, W, H) { pkPnFill(c, W, H, '#1b3664', '#0a1530'); pkPnStars(c, W, H, 420, '#dfe9ff'); c.strokeStyle = 'rgba(200,220,255,0.18)'; c.lineWidth = 1.5; for (var k = 0; k < 6; k++) { c.beginPath(); var x = Math.random() * W, y = Math.random() * H; c.moveTo(x, y); for (var j = 0; j < 4; j++) { x += randf(-90, 90); y += randf(-50, 50); c.lineTo(x, y); } c.stroke(); } pkPnVignette(c, W, H, 0.3); pkPnPinstripe(c, W, H, 10, 'rgba(220,232,255,0.7)', 2.5, 14); } },
      tread: { font: sans, ink: '#fff4d6', dim: '#e8dcae', acc: '#ffcf3a', zone: 'rgba(16,18,22,0.62)', edge: '#f0c04a', win: '#08090b', grid: 'rgba(255,207,58,0.07)', rim: pkPnStd({ color: 0xc9362b, roughness: 0.4, metalness: 0.3 }), collar: chrome, dial: 'black', lever: 'red', tele: '#ffcf3a', glow: 0.3,
        base: function (c, W, H) { pkPnTread(c, W, H); for (var x = 0, k = 0; x < W; x += 26, k++) { c.fillStyle = k % 2 ? '#111' : '#f2f2f2'; c.fillRect(x, 0, 26, 13); c.fillStyle = k % 2 ? '#f2f2f2' : '#111'; c.fillRect(x, 13, 26, 13); c.fillStyle = k % 2 ? '#111' : '#f2f2f2'; c.fillRect(x, H - 26, 26, 13); c.fillStyle = k % 2 ? '#f2f2f2' : '#111'; c.fillRect(x, H - 13, 26, 13); } pkPnVignette(c, W, H, 0.3); } },
      hazard: { font: '"Bahnschrift SemiBold Condensed", "Bahnschrift Condensed", Bahnschrift, Impact, sans-serif', ink: '#f6cf4a', dim: '#b8ad8a', acc: '#ffdf6a', zone: 'rgba(0,0,0,0.42)', edge: 'rgba(246,207,74,0.6)', win: '#060606', grid: 'rgba(246,207,74,0.07)', rim: pkPnStd({ color: 0x1b1d1f, roughness: 0.7, metalness: 0.4 }), collar: chrome, dial: 'black', lever: 'amber', tele: '#ffd23a', glow: 0.3, zr: 0.004,
        base: function (c, W, H) { pkPnFill(c, W, H, '#2a2d30', '#17191b'); pkPnStreaks(c, W, H, 2500, 0.04); blotches(c, W, H, 20, 30, 140, true, 0.12); pkPnHazard(c, 0, 0, W, 11, 14, '#f0c04a', '#121212'); pkPnHazard(c, 0, H - 11, W, 11, 14, '#f0c04a', '#121212'); } },
      timber: { font: ser, ink: '#f7ecd2', dim: '#dcc49a', acc: '#7fd0ff', zone: 'rgba(14,40,58,0.62)', edge: '#c9a87a', win: '#04141e', grid: 'rgba(127,208,255,0.08)', rim: bronze, collar: brass, screw: brass, dial: 'brass', lever: 'teal', tele: '#7fd0ff', glow: 0.3,
        base: function (c, W, H) { pkPnPlanks(c, W, H, 5, '#8a5d36', '#7a5130'); pkPnVignette(c, W, H, 0.35); pkPnRope(c, 14, 14, W - 28, H - 28, '#d6b886'); } },
      gothic: { font: '"Palatino Linotype", Georgia, serif', head: '"Old English Text MT", "Palatino Linotype", Georgia, serif', ink: '#ead9b2', dim: '#a8977a', acc: '#ff8a3d', zone: 'rgba(8,6,10,0.55)', zone2: '#1d1a20', edge: 'rgba(255,138,61,0.45)', win: '#070508', grid: 'rgba(255,138,61,0.06)', rim: iron, collar: bronze, screw: iron, dial: 'bone', lever: 'black', tele: '#ff9d5a', glow: 0.28,
        base: function (c, W, H) {
          pkPnStone(c, W, H, '#34313a', '#1c1a20');
          var g = c.createRadialGradient(W * 0.5, H * 1.1, 10, W * 0.5, H, W * 0.6); g.addColorStop(0, 'rgba(255,138,61,0.16)'); g.addColorStop(1, 'rgba(255,138,61,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
          c.strokeStyle = 'rgba(230,230,240,0.22)'; c.lineWidth = 1.5; [[0, 0, 1, 1], [W, 0, -1, 1]].forEach(function (k) { for (var i = 1; i <= 5; i++) { c.beginPath(); c.moveTo(k[0], k[1] + i * 18); c.quadraticCurveTo(k[0] + k[2] * i * 9, k[1] + i * 9, k[0] + k[2] * i * 18, k[1]); c.stroke(); } for (var j = 0; j < 6; j++) { var a = j / 5 * Math.PI / 2; c.beginPath(); c.moveTo(k[0], k[1]); c.lineTo(k[0] + k[2] * Math.cos(a) * 110, k[1] + Math.sin(a) * 110); c.stroke(); } });
          pkPnVignette(c, W, H, 0.45); pkPnPinstripe(c, W, H, 12, 'rgba(255,138,61,0.35)', 2, 6);
        } },
      toy: { font: toy, ink: '#2a2f6a', dim: '#5a5f9a', acc: '#e0563f', ok: '#1f7a3a', stop: '#c0392b', wink: '#ffffff', wdim: '#b8c0ff', wacc: '#ffe36a', zone: 'rgba(255,255,255,0.62)', edge: '#2a2f6a', edge2: 'rgba(255,255,255,0.0)', shadow: 'rgba(255,255,255,0.0)', engrave: false, win: '#1a2048', grid: 'rgba(255,255,255,0.08)', rim: pkPnStd({ color: 0xf0c04a, roughness: 0.4 }), collar: white, screw: white, dial: 'toy', lever: 'lime', tele: '#ffe36a', glow: 0.2, zr: 0.03, zw: 0.005, kid: true,
        base: null },
      scales: { font: sans, head: ser, ink: '#f6e2a6', dim: '#b9c9a0', acc: '#f0c04a', zone: 'rgba(4,22,14,0.55)', zone2: '#0c2a1c', edge: 'rgba(240,192,74,0.6)', win: '#03100a', grid: 'rgba(240,192,74,0.07)', rim: gold, collar: brass, dial: 'black', lever: 'jade', tele: '#b8f06a', glow: 0.3,
        base: function (c, W, H) { pkPnFill(c, W, H, '#1f5a44', '#0f3326'); pkPnScales(c, W, H, 44, 'rgba(80,190,140,0.35)', 'rgba(10,50,30,0.0)'); pkPnVignette(c, W, H, 0.4); pkPnPinstripe(c, W, H, 10, '#d8b04a', 3, 12); } },
      heraldic: { font: ser, ink: '#f4e2b0', dim: '#cdb27a', acc: '#e3c26a', zone: 'rgba(18,2,4,0.45)', zone2: '#4a1414', edge: '#c9a050', win: '#0e0405', grid: 'rgba(227,194,106,0.07)', rim: gold, collar: brass, screw: brass, dial: 'brass', lever: 'crimson', tele: '#ffcf6a', glow: 0.3,
        base: function (c, W, H) { pkPnFill(c, W, H, '#6a1d1d', '#3a0c0c'); pkPnDamask(c, W, H, 'rgba(227,194,106,0.07)'); pkPnVignette(c, W, H, 0.4); pkPnPinstripe(c, W, H, 9, '#c9a050', 5, 4); pkPnPinstripe(c, W, H, 21, '#c9a050', 1.5, 4); [[24, 24], [W - 24, 24], [24, H - 24], [W - 24, H - 24]].forEach(function (p) { c.fillStyle = '#e3c26a'; c.save(); c.translate(p[0], p[1]); c.rotate(Math.PI / 4); c.fillRect(-9, -9, 18, 18); c.restore(); }); } },
      night: { font: sans, head: ser, ink: '#ebe6ff', dim: '#a9a0dc', acc: '#cfc4ff', zone: 'rgba(8,6,24,0.5)', zone2: '#1d1a33', edge: 'rgba(185,167,240,0.55)', win: '#05041a', grid: 'rgba(185,167,240,0.08)', rim: chrome, collar: chrome, dial: 'night', lever: 'purple', tele: '#c9b8ff', glow: 0.32,
        base: function (c, W, H) { pkPnFill(c, W, H, '#3a2f78', '#120e2c'); pkPnStars(c, W, H, 520, '#e8e4ff'); var g = c.createRadialGradient(W * 0.86, H * 0.2, 4, W * 0.86, H * 0.2, 160); g.addColorStop(0, 'rgba(255,255,240,0.5)'); g.addColorStop(0.2, 'rgba(255,255,240,0.18)'); g.addColorStop(1, 'rgba(255,255,240,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); pkPnVignette(c, W, H, 0.35); pkPnPinstripe(c, W, H, 10, 'rgba(207,196,255,0.6)', 2, 26); } },
      nautical: { font: ser, ink: '#2a1a0a', dim: '#5a4024', acc: '#7a2a14', ok: '#1f6a30', stop: '#9a1f12', wink: '#f4e2b8', wdim: '#c9a86a', wacc: '#e8bd6a', zone: 'rgba(240,214,150,0.55)', edge: '#6a4a24', edge2: 'rgba(255,240,200,0.5)', shadow: 'rgba(255,240,200,0.45)', win: '#0b1416', grid: 'rgba(232,189,106,0.09)', rim: brass, collar: brass, screw: brass, dial: 'brass', lever: 'brass', tele: '#e8bd6a', glow: 0.24,
        base: function (c, W, H) { pkPnPlanks(c, W, H, 6, '#6a4528', '#5d3c22'); pkPnVignette(c, W, H, 0.3); pkPnRope(c, 12, 12, W - 24, H - 24, '#cfae78'); } },
      forest: { font: sans, head: ser, ink: '#dcfff5', dim: '#9fd6c6', acc: '#9fe0d4', zone: 'rgba(4,22,20,0.5)', zone2: '#123a34', edge: 'rgba(159,224,212,0.55)', win: '#021210', grid: 'rgba(159,224,212,0.07)', rim: bronze, collar: bronze, dial: 'black', lever: 'teal', tele: '#9fe0d4', glow: 0.32,
        base: function (c, W, H) { pkPnFill(c, W, H, '#1e5a52', '#0c2a26'); for (var i = 0; i < 26; i++) { c.fillStyle = 'rgba(159,224,212,' + randf(0.04, 0.1) + ')'; var x = Math.random() * W, y = Math.random() * H, s = randf(20, 70); c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s * 0.35, y + s * 0.4); c.lineTo(x - s * 0.35, y + s * 0.4); c.fill(); } pkPnVines(c, W, H, 'rgba(159,224,212,0.45)'); pkPnVignette(c, W, H, 0.4); } },
      dragon: { font: sans, head: ser, ink: '#fbe6a8', dim: '#c8c08a', acc: '#e0b04a', zone: 'rgba(6,26,14,0.55)', zone2: '#103a22', edge: 'rgba(224,176,74,0.65)', win: '#03100a', grid: 'rgba(224,176,74,0.07)', rim: gold, collar: brass, screw: brass, dial: 'brass', lever: 'jade', tele: '#f6e2a6', glow: 0.3,
        base: function (c, W, H) { pkPnFill(c, W, H, '#2f7a4a', '#14361f'); pkPnScales(c, W, H, 64, 'rgba(240,210,110,0.22)', 'rgba(10,40,20,0.05)'); pkPnVignette(c, W, H, 0.45); pkPnPinstripe(c, W, H, 10, '#e0b04a', 4, 30); } },
      flame: { font: sans, head: ser, ink: '#fff0d0', dim: '#ffc48a', acc: '#ffd08a', zone: 'rgba(40,6,2,0.5)', zone2: '#5a1408', edge: 'rgba(255,208,138,0.6)', win: '#120302', grid: 'rgba(255,208,138,0.07)', rim: gold, collar: brass, dial: 'black', lever: 'orange', tele: '#ffb03a', glow: 0.32,
        base: function (c, W, H) { pkPnFill(c, W, H, '#c8452a', '#5a1408'); pkPnFlames(c, W, H); pkPnVignette(c, W, H, 0.4); pkPnPinstripe(c, W, H, 10, '#ffd08a', 2.5, 30); } },
      mountain: { font: sans, head: ser, ink: '#f2e2b0', dim: '#b8b4c8', acc: '#d8b04a', zone: 'rgba(8,10,22,0.5)', zone2: '#1e2540', edge: 'rgba(216,176,74,0.6)', win: '#060814', grid: 'rgba(216,176,74,0.07)', rim: gold, collar: brass, screw: brass, dial: 'bone', lever: 'navy', tele: '#f2d27a', glow: 0.3,
        base: function (c, W, H) { pkPnStone(c, W, H, '#4f5f8c', '#262e4a'); pkPnMountains(c, 0, H * 0.62, W, H * 0.38, 'rgba(10,14,30,0.4)', 'rgba(255,255,255,0.12)'); pkPnRunes(c, 40, 28, W - 80, 64, 'rgba(216,176,74,0.35)', 16); pkPnRunes(c, 40, H - 28, W - 80, 64, 'rgba(216,176,74,0.35)', 16); pkPnVignette(c, W, H, 0.4); } }
    };
    // the park's flagship coaster: its own deep steel blue, the lattice of its spine behind the printing, Park Co gold
    S.flagship = { font: sans, head: '"Bahnschrift SemiBold", Bahnschrift, sans-serif', ink: '#eef3f8', dim: '#9fb4cc', acc: '#ffcf5a', zone: 'rgba(4,10,22,0.45)', zone2: '#0d1f3a', edge: 'rgba(255,207,90,0.55)', win: '#030810', grid: 'rgba(143,195,255,0.07)', rim: chrome, collar: chrome, dial: 'black', lever: 'black', tele: '#ffcf5a', glow: 0.32,
      base: function (c, W, H) {
        pkPnFill(c, W, H, '#21477c', '#0c1d38'); pkPnStreaks(c, W, H, 4000, 0.04);
        c.strokeStyle = 'rgba(160,200,255,0.06)'; c.lineWidth = 6; for (var x = -H; x < W + H; x += 90) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + H, H); c.moveTo(x + H, 0); c.lineTo(x, H); c.stroke(); }
        c.fillStyle = 'rgba(160,200,255,0.06)'; c.fillRect(0, H * 0.08, W, 8); c.fillRect(0, H * 0.92 - 8, W, 8);
        pkPnVignette(c, W, H, 0.35); pkPnPinstripe(c, W, H, 9, 'rgba(255,207,90,0.75)', 3, 10); pkPnPinstripe(c, W, H, 18, 'rgba(220,232,255,0.25)', 1.5, 8);
      } };
    // the Lindenburg Arena's prompt desks: ebony and stage velvet in a gilt proscenium, the five riders' colours along the foot
    S.arena = { font: '"Palatino Linotype", Georgia, serif', head: '"Palatino Linotype", Georgia, serif', ink: '#f2e2b8', dim: '#c4a878', acc: '#e3c26a', zone: 'rgba(10,2,4,0.45)', zone2: '#3a0e14', edge: 'rgba(227,194,106,0.6)', win: '#0a0406', grid: 'rgba(227,194,106,0.07)', rim: gold, collar: brass, screw: brass, dial: 'brass', lever: 'crimson', tele: '#ffcf6a', glow: 0.3,
      base: function (c, W, H) {
        pkPnFill(c, W, H, '#5a1420', '#2a070c');
        for (var x = 0; x < W; x += 26) { var g = c.createLinearGradient(x, 0, x + 26, 0); g.addColorStop(0, 'rgba(0,0,0,0.18)'); g.addColorStop(0.5, 'rgba(255,255,255,0.04)'); g.addColorStop(1, 'rgba(0,0,0,0.18)'); c.fillStyle = g; c.fillRect(x, 0, 26, H); }
        pkPnDamask(c, W, H, 'rgba(227,194,106,0.05)'); pkPnVignette(c, W, H, 0.45);
        ['#b8322a', '#2f5f9e', '#3f6e34', '#d9a730', '#5e3a80'].forEach(function (col, i) { c.fillStyle = col; c.fillRect(i * W / 5, H - 14, W / 5, 14); });
        c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, H - 16, W, 2);
        pkPnPinstripe(c, W, H, 8, '#c9a050', 5, 4); pkPnPinstripe(c, W, H, 22, 'rgba(201,160,80,0.6)', 1.5, 4);
        pkPnScroll(c, 12, 12, 1.2, 1, 1, '#d8b060'); pkPnScroll(c, W - 12, 12, 1.2, -1, 1, '#d8b060');
      } };
    S.toy.base = function () {};
    return S;
  }
  // a kids' plate is the same toy box in the ride's own colours
  function pkPnToyBase(top, bot, dot) {
    return function (c, W, H) {
      pkPnFill(c, W, H, top, bot); pkPnDots(c, W, H, 70, 13, dot);
      c.save(); roundRect(c, 8, 8, W - 16, H - 16, 40); c.strokeStyle = '#ffffff'; c.lineWidth = 10; c.stroke(); roundRect(c, 20, 20, W - 40, H - 40, 32); c.strokeStyle = 'rgba(42,47,106,0.5)'; c.lineWidth = 4; c.setLineDash([18, 14]); c.stroke(); c.restore();
    };
  }

  // ── The sheets: what each ride's desk carries ────────────────────
  // style, crest, maker's line, the second instrument (g2), the ride's voice (sig), its two extra windows on the hood (ann)
  // and the mimic (kind). The telemetry lines and the instruments read the probe (T) the mimic keeps.
  var PK_PANEL = {
    carousel: { style: 'brass', title: 'The Grand Carousel', model: 'GALLOPER 16 · 3-ABREAST · 1908 PATTERN', kind: 'rotor', seatCol: 0xffd27a,
      g2: { unit: 'rpm', min: 0, max: 8, ticks: 8, red: 0.85, get: function (T) { return T.rpm / 8; } },
      sig: { label: 'BAND ORGAN', sfx: 'pkOrgan', words: 'the band organ strikes up', col: 'crimson' },
      ann: [['voice', 'ORGAN\nON', '#ffd27a'], ['turn', 'PLATFORM\nTURNING', '#f0c04a']],
      tele: function (a, C, T) { return ['PLATFORM ' + T.rpm.toFixed(1) + ' RPM', 'HORSES ' + a.seats.length + '  ABOARD ' + a.riders]; } },
    teacups: { style: 'pastel', title: 'The Tea Garden', model: 'TEA PARTY 6 · TWIN-SPIN PLATTER', kind: 'rotor', sub: true, seatCol: 0xff9dc0,
      caps: { gates: 'teal', bars: 'pink', station: 'cream', test: 'sky', reset: 'cream' },
      g2: { unit: 'rpm', min: 0, max: 10, ticks: 5, red: 0.85, get: function (T) { return T.rpm / 10; } },
      sig: { label: 'MUSIC BOX', sfx: 'pkTeaBell', words: 'the music box plays', col: 'pink' },
      ann: [['voice', 'MUSIC\nBOX', '#ffb3cf'], ['turn', 'PLATTER\nTURNING', '#9fe0d4']],
      tele: function (a, C, T) { return ['PLATTER ' + T.rpm.toFixed(1) + ' RPM', 'CUPS ' + T.n + '  CUP MAX ' + (T.subRpm || 0).toFixed(0) + ' RPM']; } },
    ferris: { style: 'sky', title: 'The Sky Wheel', model: 'SKY WHEEL 24 · 19.4 M · GRAVITY CABINS', kind: 'wheel', seatCol: 0x9fd0ff,
      g2: { unit: 'rpm', min: 0, max: 2, ticks: 4, red: 0.8, get: function (T) { return T.rpm / 2; } },
      sig: { label: 'CHIMES', sfx: 'pkWheelChime', words: 'the wheel chimes ring', col: 'sky' },
      ann: [['voice', 'CHIMES', '#9fd0ff'], ['wind', 'WIND\nOK', '#5fd38d']],
      tele: function (a, C, T) { return ['WHEEL ' + T.rpm.toFixed(2) + ' RPM  WIND ' + T.wind.toFixed(1) + ' M/S', 'CABIN ' + (T.deck + 1) + ' AT DECK  TOP 19.4 M']; } },
    dodgems: { style: 'tread', title: 'The Dodgem Arena', model: 'AUTOSCOOTER 12 · CEILING GRID 96 V DC', kind: 'arena', seatCol: 0xff6b5e,
      caps: { test: 'red' },
      g2: { unit: 'volts DC', min: 0, max: 120, ticks: 6, red: 0.9, get: function (T) { return T.volts / 120; } },
      sig: { label: 'KLAXON', sfx: 'pkKlaxon', words: 'the klaxon sounds', col: 'orange' },
      ann: [['voice', 'KLAXON', '#ffcf3a'], ['live', 'FLOOR\nLIVE', '#ff6b5e']],
      tele: function (a, C, T) { return ['GRID ' + T.volts.toFixed(0) + ' V DC  ' + T.amps.toFixed(0) + ' A', 'CARS ' + T.n + '  MOVING ' + T.moving]; } },
    droptower: { style: 'hazard', title: 'The Drop', model: 'FREEFALL 26 · MAGNETIC BRAKE · 64 KM/H', kind: 'tower', seatCol: 0xffdf6a,
      caps: { test: 'red' },
      g2: { unit: 'km/h', min: 0, max: 80, ticks: 8, red: 0.82, get: function (T) { return T.v * 3.6 / 80; } },
      sig: { label: 'WARN HORN', sfx: 'pkDropHorn', words: 'the warning horn blares', col: 'amber' },
      ann: [['voice', 'WARN\nHORN', '#ffdf6a'], ['fall', 'FREE\nFALL', '#ff6b5e']],
      tele: function (a, C, T) { return ['H ' + T.h.toFixed(1) + ' M  V ' + (T.vy * 3.6).toFixed(0) + ' KM/H', 'G ' + T.g.toFixed(1) + '  ' + T.phase]; } },
    flume: { style: 'timber', title: 'The Log Flume', model: 'LOG CHUTE 3 · 7.5 M DROP · 3 PUMPS', kind: 'track', seatCol: 0x7fd0ff,
      blocks: ['DOCK', 'LIFT', 'CHANNEL', 'SPLASH'],
      g2: { unit: 'flow m3/h', min: 0, max: 2000, ticks: 4, red: 0.9, get: function (T) { return T.flow / 2000; } },
      sig: { label: 'DOCK BELL', sfx: 'pkFlumeBell', words: 'the dock bell rings', col: 'teal' },
      ann: [['voice', 'DOCK\nBELL', '#7fd0ff'], ['pumps', 'PUMPS\nRUNNING', '#5fd38d']],
      tele: function (a, C, T) { return ['FLOW ' + T.flow.toFixed(0) + ' M3/H  LVL ' + T.level.toFixed(0) + '%', 'LOGS ' + T.n + '  ' + T.block + '  ' + (T.v * 3.6).toFixed(0) + ' KM/H']; } },
    haunted: { style: 'gothic', title: 'The Haunted Manor', model: 'DARK RIDE · SIX ROOMS · EST. 1888', kind: 'rooms', seatCol: 0xff8a3d,
      caps: { test: 'purple', station: 'cream' },
      g2: { unit: 'fog %', min: 0, max: 100, ticks: 5, red: 0.0, get: function (T) { return T.fog / 100; } },
      sig: { label: 'THE HOWL', sfx: 'pkHowl', words: 'something howls in the manor', col: 'purple' },
      ann: [['voice', 'HOWLS', '#ff8a3d'], ['fx', 'SCARE\nFX', '#c9a0ff']],
      tele: function (a, C, T) { return ['ROOM ' + (T.room + 1) + ' ' + T.roomName, 'FOG ' + T.fog.toFixed(0) + '%  FX ' + (T.fx ? 'FIRING' : 'ARMED')]; } },
    kround: { style: 'toy', base: ['#ff8a6a', '#e0563f', 'rgba(255,255,255,0.18)'], title: 'Little Roundabout', model: 'TINY TURN 1 · FOR SMALL RIDERS', kind: 'rotor', seatCol: 0xffe36a,
      g2: { unit: 'rpm', min: 0, max: 8, ticks: 4, red: 0, get: function (T) { return T.rpm / 8; } },
      sig: { label: 'TOOT TOOT', sfx: 'pkKidTune', words: 'toot toot', col: 'sky' },
      ann: [['voice', 'TUNES', '#ffe36a'], ['happy', 'HAPPY\nRIDERS', '#5fd38d']],
      tele: function (a, C, T) { return ['ROUND WE GO ' + T.rpm.toFixed(1) + ' RPM', 'HAPPY RIDERS ' + a.riders]; } },
    kpots: { style: 'toy', base: ['#5fc4cf', '#2f7f8f', 'rgba(255,240,140,0.22)'], title: 'Wobbly Pots', model: 'WOBBLE POT 5 · GENTLE SPIN', kind: 'rotor', sub: true, seatCol: 0xffe36a,
      g2: { unit: 'rpm', min: 0, max: 8, ticks: 4, red: 0, get: function (T) { return T.rpm / 8; } },
      sig: { label: 'KETTLE', sfx: 'pkKettle', words: 'the kettle whistles', col: 'orange' },
      ann: [['voice', 'TUNES', '#ffe36a'], ['happy', 'HAPPY\nRIDERS', '#5fd38d']],
      tele: function (a, C, T) { return ['WOBBLE ' + T.rpm.toFixed(1) + ' RPM', 'POTS ' + T.n + '  HAPPY ' + a.riders]; } },
    kpuffin: { style: 'toy', base: ['#7fc8f0', '#3f8fc8', 'rgba(255,255,255,0.2)'], title: 'Puffin Line', model: 'PEDAL LINE 2 · STEADY AS SHE GOES', kind: 'track', seatCol: 0xffe36a,
      blocks: ['STATION', 'HILL', 'TRACK', 'HOME'],
      g2: { unit: 'km/h', min: 0, max: 16, ticks: 4, red: 0, get: function (T) { return T.v * 3.6 / 16; } },
      sig: { label: 'WHISTLE', sfx: 'pkPuffinHoot', words: 'peep peep', col: 'orange' },
      ann: [['voice', 'TUNES', '#ffe36a'], ['happy', 'HAPPY\nRIDERS', '#5fd38d']],
      tele: function (a, C, T) { return ['CHUFF ' + (T.v * 3.6).toFixed(1) + ' KM/H', 'HAPPY RIDERS ' + a.riders + '  ' + T.block]; } },
    serpent: { style: 'scales', title: 'The Serpent', model: 'TERRAIN COASTER SST-5 · LIFT AND LAP', kind: 'track', coaster: true,
      sig: { label: 'THE HISS', sfx: 'pkHiss', words: 'the Serpent hisses', col: 'jade' } },
    baron: { style: 'heraldic', title: "Baron's Drop", model: 'DIVE MACHINE BD-1 · 90 DEGREE DROP', kind: 'track', coaster: true,
      sig: { label: 'FANFARE', sfx: 'pkBaronFanfare', words: 'the Baron is announced', col: 'brass' } },
    nocturne: { style: 'night', title: 'Nocturne', model: 'INDOOR SPIRAL NC-11 · AROUND THE MOON', kind: 'track', coaster: true,
      sig: { label: 'NIGHT BELL', sfx: 'pkNightChime', words: 'a celesta rings in the dark', col: 'purple' } },
    wreck: { style: 'nautical', title: 'The Wreck', model: 'FIGURE EIGHT FW-8 · THROUGH THE HULL', kind: 'track', coaster: true,
      sig: { label: 'FOGHORN', sfx: 'pkFoghorn', words: 'the foghorn sounds', col: 'brass' } },
    moonwood: { style: 'forest', title: 'Moonwood', model: 'CAMELBACK MW-3 · ROUND THE OLD TREE', kind: 'track', coaster: true,
      sig: { label: 'THE OWL', sfx: 'pkOwl', words: 'an owl calls from the crown', col: 'teal' } },
    dragon: { style: 'dragon', title: 'The Dragon', model: 'FAMILY DRAGON DR-21 · OVER THE HILL', kind: 'track', coaster: true,
      sig: { label: 'THE ROAR', sfx: 'pkRoar', words: 'the Dragon roars', col: 'red' } },
    firebird: { style: 'flame', title: 'The Firebird', model: 'LOOP COASTER FB-1 · THROUGH THE ROLL', kind: 'track', coaster: true,
      sig: { label: 'THE CALL', sfx: 'pkFirebirdCall', words: 'the Firebird calls', col: 'orange' } },
    mountain: { style: 'mountain', title: 'The Mountain King', model: 'MINE TRAIN MK-1 · INTO THE HALL', kind: 'track', coaster: true,
      sig: { label: 'THE HALL', sfx: 'pkMountainKing', words: 'in the hall of the Mountain King', col: 'navy' } }
  };
  // every coaster on the kit gets the same instruments and windows, sized to its own top speed
  function pkPnCoasterSheet(sh, a) {
    var E = a.extra || {}, top = Math.max(40, Math.ceil(((E.vTop || 20) * 3.6 + 10) / 20) * 20);
    sh.blocks = sh.blocks || ['STATION', 'LIFT', 'CIRCUIT', 'BRAKES'];
    sh.g2 = sh.g2 || { unit: 'km/h', min: 0, max: top, ticks: top / 20, red: 0.85, get: function (T) { return T.v * 3.6 / top; } };
    sh.ann = sh.ann || [['lift', 'LIFT\nCHAIN', '#f0c04a'], ['brake', 'BRAKES\nSET', '#5fd38d']];
    sh.tele = sh.tele || function (a2, C, T) { return ['V ' + ('  ' + (T.v * 3.6).toFixed(1)).slice(-5) + ' KM/H  H ' + T.h.toFixed(1) + ' M', 'G ' + (T.g >= 0 ? '+' : '') + T.g.toFixed(1) + '  ' + T.block + '  LAP ' + Math.round(T.lap * 100) + '%']; };
    sh.seatCol = sh.seatCol || 0xffd27a;
    return sh;
  }
  // a serial number for the maker's plate, the same for a ride every time
  function pkPnSerial(id) { var h = 7; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 9973; return 'LRW-' + id.slice(0, 3).toUpperCase() + '-' + ('000' + h).slice(-4); }

  // ── The mimics ───────────────────────────────────────────────────
  // the window on the plate the mimic is drawn in (metres, in the panel's frame)
  var PK_PN_WIN = { x0: -0.38, x1: 0.18, y0: -0.12, y1: 0.212 };
  var PK_PN_V = new THREE.Vector3(), PK_PN_M4 = new THREE.Matrix4();
  // the ride's own frame: a world point in the ride group's local coordinates
  function pkPnLocal(a, obj, out) {
    obj.updateWorldMatrix(true, false); out.setFromMatrixPosition(obj.matrixWorld);
    a.g.updateWorldMatrix(true, false); PK_PN_M4.copy(a.g.matrixWorld).invert(); return out.applyMatrix4(PK_PN_M4);
  }
  // the seats grouped by what carries them: a cup, a pot, a horse, a gondola, a car, a log (or the seat itself on a shared deck)
  function pkPnCarriers(a, key) {
    var list = [], by = new Map();
    a.seats.forEach(function (s, i) {
      var o = key ? s[key] : s.par; if (!o) return;
      var shared = !key && a.seats.every(function (t) { return t.par === o; });
      var k = shared ? 'seat' + i : o;
      var e = by.get(k);
      if (!e) { e = { o: o, seats: [], seatAt: shared ? s : null }; by.set(k, e); list.push(e); }
      e.seats.push(s);
    });
    return list;
  }
  function pkPnCarrierPos(a, e, out) {
    if (e.seatAt) { PK_PN_V.set(e.seatAt.x, e.seatAt.y, e.seatAt.z); e.o.updateWorldMatrix(true, false); out.copy(PK_PN_V).applyMatrix4(e.o.matrixWorld); a.g.updateWorldMatrix(true, false); PK_PN_M4.copy(a.g.matrixWorld).invert(); return out.applyMatrix4(PK_PN_M4); }
    return pkPnLocal(a, e.o, out);
  }
  function pkPnFull(e) { for (var i = 0; i < e.seats.length; i++) if (e.seats[i].guest) return true; return false; }
  // a mimic is { draw(R, S) the static print, build(P) the live parts, tick(dt, T) the probe and the lights }
  var PK_PN_KINDS = {};
  // a rotor seen from above: the seats where they really are, turning with the deck, each lit when someone sits in it
  PK_PN_KINDS.rotor = function (a, sh) {
    var list = pkPnCarriers(a), pts = [], cx = 0, cz = 0, rmax = 0.1, v = new THREE.Vector3();
    list.forEach(function (e) { pkPnCarrierPos(a, e, v); pts.push([v.x, v.z]); cx += v.x; cz += v.z; });
    cx /= Math.max(1, pts.length); cz /= Math.max(1, pts.length);
    pts.forEach(function (p) { rmax = Math.max(rmax, Math.hypot(p[0] - cx, p[1] - cz)); });
    var W = PK_PN_WIN, mx = (W.x0 + W.x1) / 2 - 0.06, my = (W.y0 + W.y1) / 2, R0 = Math.min(W.x1 - W.x0, W.y1 - W.y0) / 2 - 0.022, k = R0 / (rmax * 1.12);
    var at = function (x, z) { return [mx + (x - cx) * k, my - (z - cz) * k]; };
    var pips = [], subs = [], ang0 = [], prevAng = null;
    return {
      draw: function (R, S) {
        pkPnCircle(R, mx, my, R0 + 0.008, null, S.edge, 0.0025);
        pkPnCircle(R, mx, my, R0 - 0.004, 'rgba(255,255,255,0.03)', S.grid.replace(/0\.0\d\)/, '0.4)'), 0.0012);
        for (var t = 0; t < 36; t++) { var aa = t / 36 * Math.PI * 2, r1 = R0 + 0.008, r2 = R0 + (t % 3 ? 0.016 : 0.024); pkPnLine(R, [[mx + Math.cos(aa) * r1, my + Math.sin(aa) * r1], [mx + Math.cos(aa) * r2, my + Math.sin(aa) * r2]], S.dim, t % 3 ? 0.0012 : 0.002); }
        pkPnCircle(R, mx, my, 0.012, S.acc, null);
        pkPnText(R, S, 'N', mx, my + R0 + 0.033, 0.011, { col: S.dim });
        var lx = W.x1 - 0.06;
        pkPnText(R, S, 'SEATS', lx, W.y1 - 0.03, 0.0105, { col: S.dim });
        pkPnText(R, S, String(a.seats.length), lx, W.y1 - 0.055, 0.02, { col: S.ink });
        pkPnText(R, S, sh.sub ? 'CUPS' : 'BAYS', lx, W.y1 - 0.09, 0.0105, { col: S.dim });
        pkPnText(R, S, String(list.length), lx, W.y1 - 0.115, 0.02, { col: S.ink });
        pkPnText(R, S, 'DIA ' + (rmax * 2).toFixed(1) + ' M', lx, W.y0 + 0.04, 0.0105, { col: S.dim });
        pkPnText(R, S, 'LIT = SEATED', lx, W.y0 + 0.018, 0.009, { col: S.dim });
      },
      build: function (P) {
        list.forEach(function (e, i) {
          var p = pkPnPip(P, 0.0085, sh.seatCol); var q = at(pts[i][0], pts[i][1]); p.set(q[0], q[1]); pips.push(p);
          if (sh.sub) { var g = new THREE.Group(); g.userData.dynamic = true; g.position.set(q[0], q[1], 0.005); P.add(g); box(0.0025, 0.016, 0.002, pkPnStd({ color: 0xf4f1e6, roughness: 0.5 }), 0, 0.009, 0.002, g); subs.push(g); }
          ang0.push(e.o.rotation.y);
        });
      },
      tick: function (dt, T) {
        T.n = list.length;
        var a0 = null;
        for (var i = 0; i < list.length; i++) {
          var e = list[i]; pkPnCarrierPos(a, e, v); var q = at(v.x, v.z); pips[i].set(q[0], q[1]);
          if (i === 0) a0 = Math.atan2(v.z - cz, v.x - cx);
          pkPnPipLight(pips[i], pkPnFull(e) ? 1 : 0.16, dt);
          if (subs[i]) { subs[i].position.set(q[0], q[1], 0.005); subs[i].rotation.z = e.o.rotation.y - (a0 || 0); }
        }
        if (a0 !== null && prevAng !== null && dt > 0) {
          var d = a0 - prevAng; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
          T.rpm += (Math.abs(d) / dt * 60 / (Math.PI * 2) - T.rpm) * Math.min(1, dt * 3);
        }
        prevAng = a0;
        if (sh.sub && list[0]) { var sr = Math.abs(list[0].o.rotation.y - (T.sub0 === undefined ? list[0].o.rotation.y : T.sub0)) / Math.max(1e-3, dt) * 60 / (Math.PI * 2); T.subRpm = Math.max((T.subRpm || 0) * Math.max(0, 1 - dt * 0.5), sr); T.sub0 = list[0].o.rotation.y; }
        T.moving = T.rpm > 0.3;
      }
    };
  };
  // the dodgem floor from above: the cars where they really are
  PK_PN_KINDS.arena = function (a, sh) {
    var cars = (a.extra && a.extra.cars) || [], W = PK_PN_WIN, mx = (W.x0 + W.x1) / 2 - 0.04, my = (W.y0 + W.y1) / 2, hw = 0.2, hh = hw * 3.8 / 5.9;
    var at = function (x, z) { return [mx + clamp(x / 5.9, -1, 1) * hw, my - clamp(z / 3.8, -1, 1) * hh]; };
    var pips = [], prev = [];
    return {
      draw: function (R, S) {
        var c = R.c; c.save(); pkPnRect(R, mx - hw - 0.014, my - hh - 0.014, mx + hw + 0.014, my + hh + 0.014, 0.012); c.strokeStyle = S.acc; c.lineWidth = R.L(0.003); c.stroke(); c.restore();
        for (var gx = -6; gx <= 6; gx++) pkPnLine(R, [[mx + gx / 6 * hw, my - hh], [mx + gx / 6 * hw, my + hh]], 'rgba(255,207,58,0.14)', 0.001);
        for (var gz = -4; gz <= 4; gz++) pkPnLine(R, [[mx - hw, my + gz / 4 * hh], [mx + hw, my + gz / 4 * hh]], 'rgba(255,207,58,0.14)', 0.001);
        pkPnText(R, S, 'CEILING GRID  +96 V', mx, my + hh + 0.03, 0.0105, { col: S.dim });
        pkPnText(R, S, 'FLOOR  0 V', mx, my - hh - 0.028, 0.0105, { col: S.dim });
        pkPnText(R, S, 'CARS', W.x1 - 0.04, W.y1 - 0.03, 0.0105, { col: S.dim }); pkPnText(R, S, String(cars.length), W.x1 - 0.04, W.y1 - 0.056, 0.02);
      },
      build: function (P) { cars.forEach(function (cr) { var p = pkPnPip(P, 0.009, sh.seatCol); var q = at(cr.g.position.x, cr.g.position.z); p.set(q[0], q[1]); pips.push(p); prev.push([cr.g.position.x, cr.g.position.z]); }); },
      tick: function (dt, T) {
        var mv = 0; T.n = cars.length;
        cars.forEach(function (cr, i) {
          var x = cr.g.position.x, z = cr.g.position.z, q = at(x, z); pips[i].set(q[0], q[1]);
          var moving = Math.hypot(x - prev[i][0], z - prev[i][1]) > 1e-4; prev[i][0] = x; prev[i][1] = z; if (moving) mv++;
          var full = a.seats.some(function (s) { return s.car === cr.g && s.guest; });
          pkPnPipLight(pips[i], full ? 1 : moving ? 0.55 : 0.14, dt);
        });
        T.moving = mv;
        var live = a.state === 'running' && !a.ctl.fault;
        T.volts += ((live ? 96 + Math.sin(PK_BK_T * 3.1) * 2.5 : 0) - T.volts) * Math.min(1, dt * 4);
        T.amps += ((live ? 6 + mv * 7.5 : 0) - T.amps) * Math.min(1, dt * 3);
      }
    };
  };
  // the wheel side on: the cabins round the rim, the spokes turning with it, the deck at the bottom
  PK_PN_KINDS.wheel = function (a, sh) {
    var wheel = a.extra && a.extra.wheel, list = pkPnCarriers(a, 'gon'), pts = [], cy = 0, cz = 0, rmax = 0.1, v = new THREE.Vector3();
    list.forEach(function (e) { pkPnLocal(a, e.o, v); pts.push([v.z, v.y]); cz += v.z; cy += v.y; });
    cz /= Math.max(1, pts.length); cy /= Math.max(1, pts.length);
    pts.forEach(function (p) { rmax = Math.max(rmax, Math.hypot(p[0] - cz, p[1] - cy)); });
    var W = PK_PN_WIN, mx = (W.x0 + W.x1) / 2 - 0.06, my = (W.y0 + W.y1) / 2 + 0.012, R0 = Math.min(W.x1 - W.x0, W.y1 - W.y0) / 2 - 0.035, k = R0 / rmax;
    var pips = [], spokes = null, prev = null;
    return {
      draw: function (R, S) {
        pkPnLine(R, [[mx - R0 * 0.62, W.y0 + 0.018], [mx, my], [mx + R0 * 0.62, W.y0 + 0.018]], S.dim, 0.004);
        pkPnCircle(R, mx, my, R0, null, 'rgba(159,208,255,0.35)', 0.003);
        pkPnLine(R, [[mx - 0.05, my - R0 - 0.012], [mx + 0.05, my - R0 - 0.012]], S.acc, 0.004);
        pkPnText(R, S, 'DECK', mx + 0.075, my - R0 - 0.012, 0.0095, { col: S.acc });
        pkPnText(R, S, '19.4 M', mx, my + R0 + 0.018, 0.0095, { col: S.dim });
        var lx = W.x1 - 0.055;
        pkPnText(R, S, 'CABINS', lx, W.y1 - 0.03, 0.0105, { col: S.dim }); pkPnText(R, S, String(list.length), lx, W.y1 - 0.056, 0.02);
        pkPnText(R, S, 'WIND', lx, W.y0 + 0.07, 0.0105, { col: S.dim }); pkPnText(R, S, 'LIMIT 15', lx, W.y0 + 0.05, 0.009, { col: S.dim });
      },
      build: function (P) {
        spokes = new THREE.Group(); spokes.userData.dynamic = true; spokes.position.set(mx, my, 0.004); P.add(spokes);
        var sm = pkPnStd({ color: 0xcfe0ff, roughness: 0.4, metalness: 0.5 });
        for (var s = 0; s < 8; s++) { var arm = new THREE.Group(); arm.rotation.z = s * Math.PI / 4; spokes.add(arm); box(0.0016, R0, 0.0012, sm, 0, R0 / 2, 0, arm); }
        list.forEach(function (e, i) { var p = pkPnPip(P, 0.0085, sh.seatCol); p.set(mx + (pts[i][0] - cz) * k, my + (pts[i][1] - cy) * k); pips.push(p); });
      },
      tick: function (dt, T) {
        var low = 1e9;
        list.forEach(function (e, i) {
          pkPnLocal(a, e.o, v); var x = mx + (v.z - cz) * k, y = my + (v.y - cy) * k; pips[i].set(x, y);
          if (v.y < low) { low = v.y; T.deck = i; }
          pkPnPipLight(pips[i], pkPnFull(e) ? 1 : 0.16, dt);
        });
        if (wheel) {
          spokes.rotation.z = -wheel.rotation.x;
          if (prev !== null && dt > 0) T.rpm += (Math.abs(wheel.rotation.x - prev) / dt * 60 / (Math.PI * 2) - T.rpm) * Math.min(1, dt * 3);
          prev = wheel.rotation.x;
        }
        T.wind = 3.4 + Math.sin(PK_BK_T * 0.13) * 1.6 + Math.sin(PK_BK_T * 0.71) * 0.7 + Math.sin(PK_BK_T * 2.3) * 0.25;
        T.moving = T.rpm > 0.05;
      }
    };
  };
  // the tower side on: the mast marked in metres, the carriage on it, and the four phases of a drop
  PK_PN_KINDS.tower = function (a, sh) {
    var car = a.extra && a.extra.car, W = PK_PN_WIN, x = W.x0 + 0.1, y0 = W.y0 + 0.02, y1 = W.y1 - 0.025, HMAX = 28;
    var Y = function (h) { return y0 + clamp(h / HMAX, 0, 1) * (y1 - y0); };
    var pip = null, leds = [], prevY = null, prevV = 0;
    var PH = ['LIFT', 'HOLD', 'DROP', 'BRAKE'];
    return {
      draw: function (R, S) {
        var c = R.c;
        c.fillStyle = 'rgba(246,207,74,0.12)'; c.fillRect(R.X(x - 0.012), R.Y(Y(26.6)), R.L(0.024), R.L(Y(26.6) - Y(0)));
        pkPnLine(R, [[x - 0.012, Y(0)], [x - 0.012, Y(26.6)]], S.dim, 0.002); pkPnLine(R, [[x + 0.012, Y(0)], [x + 0.012, Y(26.6)]], S.dim, 0.002);
        c.save(); var bx = R.X(x - 0.012), by = R.Y(Y(10)), bw = R.L(0.024), bh = R.L(Y(10) - Y(2.2)); c.beginPath(); c.rect(bx, by, bw, bh); c.clip(); c.strokeStyle = 'rgba(255,107,94,0.6)'; c.lineWidth = 2; for (var k = -bh; k < bw + bh; k += 8) { c.beginPath(); c.moveTo(bx + k, by); c.lineTo(bx + k - bh, by + bh); c.stroke(); } c.restore();
        for (var h = 0; h <= 25; h += 5) { pkPnLine(R, [[x + 0.016, Y(h)], [x + 0.03, Y(h)]], S.dim, 0.0015); pkPnText(R, S, h + ' M', x + 0.034, Y(h), 0.0095, { col: S.dim, align: 'left' }); }
        pkPnText(R, S, 'BRAKE FINS', x - 0.02, Y(6), 0.0085, { col: '#ff8a7a', align: 'right' });
        pkPnText(R, S, 'TOP 26.2', x - 0.02, Y(26.2), 0.0085, { col: S.acc, align: 'right' });
        var lx = x + 0.15;
        pkPnText(R, S, 'PHASE', lx + 0.05, W.y1 - 0.025, 0.011, { col: S.dim });
        PH.forEach(function (p, i) { pkPnText(R, S, p, lx + 0.03, W.y1 - 0.06 - i * 0.045, 0.014, { align: 'left' }); });
        pkPnText(R, S, 'FALL 1.82 S  64 KM/H', lx + 0.06, W.y0 + 0.022, 0.0095, { col: S.dim });
      },
      build: function (P) {
        pip = pkPnPip(P, 0.011, sh.seatCol); pip.set(x, Y(2.2));
        PH.forEach(function (p, i) { leds.push(pkPnLed(P, x + 0.165, W.y1 - 0.06 - i * 0.045, { col: i === 2 ? 0xff6b5e : i === 3 ? 0xff9d6b : 0xf0c04a, r: 0.009 })); });
      },
      tick: function (dt, T) {
        var hy = car ? car.position.y : 2.2;
        pip.set(x, Y(hy)); pkPnPipLight(pip, a.riders ? 1 : 0.4, dt);
        var fall = Math.sqrt(2 * 16.2 / 9.81), t = a.state === 'running' ? a.t : -1, ph = -1;
        if (t >= 0) ph = t < 12 ? 0 : t < 15 ? 1 : t < 15 + fall ? 2 : t < 15 + fall + 1.2 ? 3 : -1;
        leds.forEach(function (l, i) { l.on = ph === i ? (i === 2 ? 'flash' : true) : 'dim'; });
        T.phase = ph < 0 ? (a.state === 'running' ? 'LANDED' : 'AT BASE') : PH[ph];
        T.fall = ph === 2;
        if (prevY !== null && dt > 0) {
          var vy = (hy - prevY) / dt;
          T.vy += (vy - T.vy) * Math.min(1, dt * 8);
          var ay = (T.vy - prevV) / dt; prevV = T.vy;
          T.g += ((1 + ay / 9.81) - T.g) * Math.min(1, dt * 4);
        }
        prevY = hy; T.h = hy; T.v = Math.abs(T.vy); T.moving = T.v > 0.2;
      }
    };
  };
  // the haunted manor's plan: six rooms, the party lit room by room as it goes through
  PK_PN_KINDS.rooms = function (a, sh) {
    var W = PK_PN_WIN, NAMES = ['FOYER', 'LIBRARY', 'BALLROOM', 'CONSERVATORY', 'CRYPT', 'ATTIC'], leds = [], cells = [];
    var cw = (W.x1 - W.x0 - 0.03) / 3, ch = (W.y1 - W.y0 - 0.05) / 2;
    for (var i = 0; i < 6; i++) { var col = i < 3 ? i : 5 - i, row = i < 3 ? 0 : 1; cells.push([W.x0 + 0.015 + col * cw, W.y1 - 0.03 - (row + 1) * ch]); }
    return {
      draw: function (R, S) {
        var c = R.c;
        cells.forEach(function (p, i) {
          c.save(); pkPnRect(R, p[0] + 0.004, p[1] + 0.004, p[0] + cw - 0.004, p[1] + ch - 0.004, 0.006); c.fillStyle = 'rgba(255,138,61,0.05)'; c.fill(); c.strokeStyle = S.edge; c.lineWidth = R.L(0.0018); c.stroke(); c.restore();
          pkPnText(R, S, (i + 1) + '  ' + NAMES[i], p[0] + cw / 2, p[1] + ch - 0.02, 0.0105, { col: S.ink, max: cw - 0.014 });
        });
        for (var j = 0; j < 5; j++) { var A = cells[j], B = cells[j + 1]; pkPnLine(R, [[A[0] + cw / 2, A[1] + ch / 2 - 0.012], [B[0] + cw / 2, B[1] + ch / 2 - 0.012]], 'rgba(255,138,61,0.5)', 0.0016); }
        pkPnText(R, S, 'THE PARTY GOES ROOM BY ROOM', (W.x0 + W.x1) / 2, W.y1 - 0.016, 0.0095, { col: S.dim });
      },
      build: function (P) { cells.forEach(function (p) { leds.push(pkPnLed(P, p[0] + cw / 2, p[1] + ch / 2 - 0.012, { col: 0xff8a3d, r: 0.012, bezel: pkPnStd({ color: 0x3a2a22, roughness: 0.5, metalness: 0.6 }) })); }); },
      tick: function (dt, T) {
        var run = a.state === 'running', f = run ? clamp(a.t / Math.max(1, a.run), 0, 0.999) : 0, room = run ? Math.floor(f * 6) : 0;
        T.room = room; T.roomName = run ? NAMES[room] : (a.state === 'boarding' ? 'BOARDING' : 'EMPTY');
        T.fx = run && Math.sin(PK_BK_T * 13) * Math.sin(PK_BK_T * 3.1) > 0.4;
        leds.forEach(function (l, i) { l.on = run ? (i === room ? (T.fx ? 'flash' : true) : i < room ? 'dim' : false) : (a.state === 'boarding' && i === 0 ? 'dim' : false); });
        T.fog = clamp(T.fog + (run ? -dt * 1.1 : dt * 0.4), 18, 100);
        T.moving = run;
      }
    };
  };
  // a track in plan and in profile: from the coaster's own curve (or the flume's own course), the lift marked, the train on
  // it car by car, a cursor on the profile, and block lamps that go red where the train is
  PK_PN_KINDS.track = function (a, sh) {
    var E = a.extra || {}, N = 220, P3 = [], i, isFlume = !E.curve;
    if (E.curve) { for (i = 0; i <= N; i++) { var q = E.curve.getPointAt(((E.uPark || 0) + i / N) % 1); P3.push([q.x, q.y, q.z]); } }
    else {
      var PTS = PK_FLUME_PTS, L = [], tot = 0; for (i = 0; i < PTS.length; i++) { var A = PTS[i], B = PTS[(i + 1) % PTS.length]; var l = Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]); L.push(l); tot += l; }
      for (i = 0; i <= N; i++) { var d = i / N * tot, k = 0; while (k < L.length - 1 && d > L[k]) { d -= L[k]; k++; } var A2 = PTS[k], B2 = PTS[(k + 1) % PTS.length], f = L[k] ? d / L[k] : 0; P3.push([A2[0] + (B2[0] - A2[0]) * f, A2[1] + (B2[1] - A2[1]) * f, A2[2] + (B2[2] - A2[2]) * f]); }
    }
    var xmn = 1e9, xmx = -1e9, zmn = 1e9, zmx = -1e9, ymn = 1e9, ymx = -1e9;
    P3.forEach(function (p) { xmn = Math.min(xmn, p[0]); xmx = Math.max(xmx, p[0]); zmn = Math.min(zmn, p[2]); zmx = Math.max(zmx, p[2]); ymn = Math.min(ymn, p[1]); ymx = Math.max(ymx, p[1]); });
    // the lift: the steady climb to the highest point in the first part of the lap
    var top = 0; for (i = 0; i <= N * 0.7; i++) if (P3[i][1] > P3[top][1]) top = i;
    var l0 = top; while (l0 > 1 && P3[l0 - 1][1] < P3[l0][1] - 1e-3) l0--;
    var lift = top - l0 > 3 && (P3[top][1] - P3[l0][1]) > 1.5 ? [l0 / N, top / N] : null;
    var len = 0; for (i = 1; i <= N; i++) len += Math.hypot(P3[i][0] - P3[i - 1][0], P3[i][1] - P3[i - 1][1], P3[i][2] - P3[i - 1][2]);
    var W = sh.win || PK_PN_WIN, px0 = W.x0 + 0.012, px1 = W.x1 - 0.09, py0 = W.y0 + 0.098, py1 = W.y1 - 0.012;
    var k = Math.min((px1 - px0) / Math.max(1, xmx - xmn), (py1 - py0) / Math.max(1, zmx - zmn));
    var ox = (px0 + px1) / 2 - (xmn + xmx) / 2 * k, oy = (py0 + py1) / 2 + (zmn + zmx) / 2 * k;
    var plan = function (x, z) { return [ox + x * k, oy - z * k]; };
    var fx0 = W.x0 + 0.012, fx1 = W.x1 - 0.09, fy0 = W.y0 + 0.014, fy1 = W.y0 + 0.08;
    var prof = function (fr, y) { return [fx0 + fr * (fx1 - fx0), fy0 + (y - ymn) / Math.max(1, ymx - ymn) * (fy1 - fy0)]; };
    var BL = sh.blocks || ['STATION', 'LIFT', 'CIRCUIT', 'BRAKES'];
    var trains = isFlume ? (E.boats || []).map(function (b) { return b.g; }) : (E.cars || []).map(function (c) { return c.g; });
    var pips = [], cur = null, leds = [], prevP = null, prevV = new THREE.Vector3(), vel = new THREE.Vector3(), acc = new THREE.Vector3();
    var NB = BL.length, bstep = Math.min(0.052, (W.y1 - W.y0 - 0.075) / NB);
    var blockOf = sh.blockOf || function (fr) { if (fr < 0.015 || fr > 0.985) return 0; if (lift && fr >= lift[0] && fr <= lift[1]) return 1; if (fr > 0.9) return 3; return 2; };
    return {
      draw: function (R, S) {
        var c = R.c, j;
        // the plan: a dark casing, the rail in the ink, the lift picked out with its chain
        var pl = P3.map(function (p) { return plan(p[0], p[2]); });
        c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
        pkPnLine(R, pl, 'rgba(0,0,0,0.55)', 0.007); pkPnLine(R, pl, S.ink, 0.0028);
        if (lift) { var lp = pl.slice(Math.floor(lift[0] * N), Math.ceil(lift[1] * N) + 1); pkPnLine(R, lp, S.acc, 0.0045); c.setLineDash([R.L(0.003), R.L(0.003)]); pkPnLine(R, lp, 'rgba(0,0,0,0.6)', 0.002); c.setLineDash([]); }
        c.restore();
        var st = plan(P3[0][0], P3[0][2]); c.save(); c.fillStyle = S.acc; c.fillRect(R.X(st[0]) - R.L(0.008), R.Y(st[1]) - R.L(0.008), R.L(0.016), R.L(0.016)); c.restore();
        pkPnText(R, S, isFlume ? 'DOCK' : 'STN', st[0], st[1] - 0.018, 0.0095, { col: S.acc });
        var hp = plan(P3[top][0], P3[top][2]); pkPnText(R, S, '^ ' + (P3[top][1] - ymn).toFixed(1) + ' M', hp[0], hp[1] + 0.016, 0.0095, { col: S.ink });
        // the profile: height over the lap, a grid every five metres
        c.save(); pkPnRect(R, fx0 - 0.004, fy0 - 0.004, fx1 + 0.004, fy1 + 0.006, 0.004); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fill(); c.restore();
        for (var hm = 0; hm <= ymx - ymn; hm += 5) { var gy = prof(0, ymn + hm)[1]; pkPnLine(R, [[fx0, gy], [fx1, gy]], S.grid.replace(/0\.0\d\)/, '0.22)'), 0.0008); }
        var pr = P3.map(function (p, n) { return prof(n / N, p[1]); });
        c.save(); c.beginPath(); c.moveTo(R.X(fx0), R.Y(fy0)); pr.forEach(function (p) { c.lineTo(R.X(p[0]), R.Y(p[1])); }); c.lineTo(R.X(fx1), R.Y(fy0)); c.closePath(); c.fillStyle = S.grid.replace(/0\.0\d\)/, '0.35)'); c.fill(); c.restore();
        pkPnLine(R, pr, S.ink, 0.0018);
        if (lift) pkPnLine(R, pr.slice(Math.floor(lift[0] * N), Math.ceil(lift[1] * N) + 1), S.acc, 0.003);
        pkPnText(R, S, 'PROFILE  ' + Math.round(len) + ' M', fx0 + 0.004, fy1 + 0.012, 0.0085, { col: S.dim, align: 'left' });
        pkPnText(R, S, (ymx - ymn).toFixed(0) + ' M', fx1 - 0.004, fy1 + 0.012, 0.0085, { col: S.dim, align: 'right' });
        // the blocks: one lamp a section, red while the train is in it
        var bx = W.x1 - 0.045;
        pkPnText(R, S, 'BLOCKS', bx, W.y1 - 0.024, 0.0105, { col: S.dim });
        for (j = 0; j < NB; j++) pkPnText(R, S, 'B' + (j + 1) + ' ' + BL[j], bx, W.y1 - 0.075 - j * bstep, 0.0085, { col: S.ink, max: 0.082 });
        pkPnText(R, S, (a.seats.length) + ' SEATS', bx, W.y0 + 0.02, 0.0095, { col: S.dim });
      },
      build: function (P) {
        trains.forEach(function (t, n) { var p = pkPnPip(P, n ? 0.0065 : 0.0085, sh.seatCol); var q = plan(t.position.x, t.position.z); p.set(q[0], q[1]); pips.push(p); });
        cur = pkPnPip(P, 0.007, 0xff6b5e); var q0 = prof(0, P3[0][1]); cur.set(q0[0], q0[1]);
        for (var j = 0; j < NB; j++) leds.push(pkPnLed(P, W.x1 - 0.045, W.y1 - 0.055 - j * bstep, { col: 0xff3b30, r: 0.0085 }));
      },
      tick: function (dt, T) {
        trains.forEach(function (t, n) { var q = plan(t.position.x, t.position.z); pips[n].set(q[0], q[1]); pkPnPipLight(pips[n], a.state === 'running' ? (n ? 0.7 : 1) : (a.riders ? 0.6 : 0.3), dt); });
        var fr = 0;
        if (sh.lap) fr = sh.lap();
        else if (isFlume) { var b0 = E.boats && E.boats[0]; fr = b0 ? ((b0.u % 1) + 1) % 1 : 0; }
        else if (E.uOfF && a.state === 'running') { var M = E.uOfF.length - 1, ff = clamp(a.t / Math.max(1e-3, a.run), 0, 1) * M, kk = Math.min(M - 1, Math.floor(ff)); fr = E.uOfF[kk] + (E.uOfF[kk + 1] - E.uOfF[kk]) * (ff - kk); }
        var n2 = Math.round(clamp(fr, 0, 1) * N), q = prof(fr, P3[Math.min(N, n2)][1]); cur.set(q[0], q[1]); pkPnPipLight(cur, a.state === 'running' ? 1 : 0.3, dt);
        var blk = a.state === 'running' || sh.lap ? blockOf(fr) : 0;
        leds.forEach(function (l, j) { l.on = j === blk ? true : 'dim'; l.mat.emissive.setHex(j === blk ? 0xff3b30 : 0x5fd38d); });
        T.block = BL[blk]; T.blk = blk; T.lap = fr;
        // the probe: speed, height and the load the riders feel, from the lead car's own movement
        var lead = trains[0];
        if (lead && dt > 0) {
          if (prevP) {
            vel.copy(lead.position).sub(prevP).divideScalar(dt);
            acc.copy(vel).sub(prevV).divideScalar(dt); prevV.copy(vel);
            var sp = vel.length(); if (sp > 60) sp = T.v;
            T.v += (sp - T.v) * Math.min(1, dt * 5);
            var gl = Math.sqrt(acc.x * acc.x + (acc.y + 9.81) * (acc.y + 9.81) + acc.z * acc.z) / 9.81 * (acc.y + 9.81 >= 0 ? 1 : -1);
            if (!isFinite(gl) || Math.abs(gl) > 8 || a.state !== 'running') gl = 1;
            T.g += (gl - T.g) * Math.min(1, dt * 2.5);
          } else prevP = new THREE.Vector3();
          prevP.copy(lead.position);
          T.h = Math.max(0, lead.position.y - ymn);
        }
        T.moving = T.v > 0.2;
        if (isFlume) { var on = a.state === 'running' || a.state === 'boarding' || a.state === 'ready'; T.flow += ((on ? 1240 + Math.sin(PK_BK_T * 1.3) * 35 : 0) - T.flow) * Math.min(1, dt * 1.5); T.level += ((on ? 92 : 64) - T.level) * Math.min(1, dt * 0.25); T.n = trains.length; }
      }
    };
  };

  // ── The voices ───────────────────────────────────────────────────
  // every ride's own sound, synthesized like the rest of the park's (part 30 of the engine): the button on the desk plays it,
  // and with the VOICE switch on it plays as the ride goes, when you are near enough to hear it
  SFX.pkOrgan = function (t) {
    var mel = [[784, 0], [659, 0.2], [784, 0.4], [1047, 0.6], [988, 0.95], [880, 1.15], [784, 1.35], [659, 1.7], [698, 1.9], [784, 2.1]];
    mel.forEach(function (n) { sTone('square', n[0], t + n[1], 0.28, 0.03, { lp: 2600 }); sTone('triangle', n[0] * 2, t + n[1], 0.18, 0.012); });
    [0, 0.6, 1.2, 1.8].forEach(function (b, i) { sTone('triangle', i % 2 ? 196 : 131, t + b, 0.22, 0.05); sTone('triangle', 392, t + b + 0.2, 0.12, 0.025); sTone('triangle', 392, t + b + 0.4, 0.12, 0.025); });
  };
  SFX.pkTeaBell = function (t) { [1568, 1976, 2349, 1976, 2637].forEach(function (f, i) { sTone('sine', f, t + i * 0.22, 0.9, 0.035); sTone('sine', f * 2.01, t + i * 0.22, 0.4, 0.008); }); };
  SFX.pkWheelChime = function (t) { [659, 880, 1319, 988].forEach(function (f, i) { sTone('sine', f, t + i * 0.42, 1.6, 0.045); }); };
  SFX.pkKlaxon = function (t) { for (var i = 0; i < 2; i++) { sTone('sawtooth', 210, t + i * 0.55, 0.42, 0.06, { f1: 470, lp: 1800 }); sTone('square', 105, t + i * 0.55, 0.42, 0.025, { f1: 235, lp: 900 }); } };
  SFX.pkDropHorn = function (t) { for (var i = 0; i < 3; i++) { sTone('square', 349, t + i * 0.5, 0.24, 0.035, { lp: 1300 }); sTone('square', 277, t + i * 0.5 + 0.25, 0.24, 0.035, { lp: 1300 }); } };
  SFX.pkFlumeBell = function (t) { [0, 0.35, 0.7].forEach(function (d) { sTone('sine', 1319, t + d, 0.8, 0.05); sTone('sine', 1760, t + d + 0.004, 0.6, 0.025); }); sNoise(t + 1.0, 0.9, 0.08, { type: 'lowpass', freq: 1800, fade: true }); };
  SFX.pkHowl = function (t) { sTone('sine', 220, t, 1.0, 0.05, { f1: 520 }); sTone('sine', 520, t + 1.0, 1.4, 0.045, { f1: 170 }); sTone('sine', 330, t + 0.1, 1.9, 0.015, { f1: 260 }); sNoise(t, 2.6, 0.06, { type: 'lowpass', freq: 500, shape: 'swell', fade: true }); SFX.door(t + 2.2); };
  SFX.pkKidTune = function (t) { [[523, 0], [659, 0.15], [784, 0.3], [659, 0.45], [880, 0.6], [784, 0.85], [1047, 1.1]].forEach(function (n) { sTone('triangle', n[0], t + n[1], 0.24, 0.05); }); sTone('sine', 1568, t + 1.1, 0.5, 0.025); };
  SFX.pkKettle = function (t) { sTone('sine', 1100, t, 1.6, 0.03, { f1: 2400, attack: 0.4 }); sTone('sine', 1650, t + 0.2, 1.4, 0.012, { f1: 3200, attack: 0.4 }); sNoise(t, 1.7, 0.04, { freq: 5000, shape: 'swell' }); };
  SFX.pkPuffinHoot = function (t) { [[0, 0.32], [0.45, 0.7]].forEach(function (p) { sTone('sine', 587, t + p[0], p[1], 0.05, { attack: 0.04 }); sTone('sine', 740, t + p[0], p[1], 0.035, { attack: 0.04 }); sNoise(t + p[0], p[1], 0.03, { type: 'bandpass', freq: 2400, q: 2, shape: 'flat', fade: true }); }); };
  SFX.pkHiss = function (t) { sNoise(t, 1.5, 0.12, { freq: 4200, shape: 'swell', fade: true }); sNoise(t + 0.3, 0.9, 0.05, { type: 'bandpass', freq: 7000, q: 3, fade: true }); sTone('sine', 90, t, 1.2, 0.03, { f1: 60 }); };
  SFX.pkBaronFanfare = function (t) { [[392, 0, 0.2], [523, 0.22, 0.2], [659, 0.44, 0.2], [784, 0.66, 0.9]].forEach(function (n) { sTone('sawtooth', n[0], t + n[1], n[2], 0.035, { lp: 1700 }); sTone('sawtooth', n[0] / 2, t + n[1], n[2], 0.02, { lp: 900 }); }); sThud(t + 0.66, 90, 0.1, 0.4); };
  SFX.pkNightChime = function (t) { [1760, 1568, 1319, 1175, 1047, 880].forEach(function (f, i) { sTone('sine', f, t + i * 0.26, 1.8, 0.035); sTone('sine', f * 3, t + i * 0.26, 0.3, 0.006); }); };
  SFX.pkFoghorn = function (t) { sTone('sawtooth', 87, t, 2.2, 0.08, { lp: 420, attack: 0.15 }); sTone('sawtooth', 174, t, 2.2, 0.03, { lp: 520, attack: 0.15 }); [2.4, 2.75].forEach(function (d) { SFX.bell(t + d); }); };
  SFX.pkOwl = function (t) { [[0, 0.42], [0.62, 0.16], [0.82, 0.38]].forEach(function (p) { sTone('sine', 410, t + p[0], p[1], 0.06, { f1: 360, attack: 0.04 }); }); };
  SFX.pkRoar = function (t) { sNoise(t, 1.8, 0.22, { type: 'lowpass', freq: 650, shape: 'swell', fade: true }); sTone('sawtooth', 140, t, 1.6, 0.06, { f1: 55, lp: 600 }); sTone('sawtooth', 93, t + 0.1, 1.5, 0.04, { f1: 40, lp: 400 }); };
  SFX.pkFirebirdCall = function (t) { sNoise(t, 1.0, 0.1, { type: 'bandpass', freq: 1800, q: 1.2, shape: 'swell' }); for (var i = 0; i < 8; i++) sTone('sine', i % 2 ? 1760 : 1397, t + 0.5 + i * 0.07, 0.09, 0.04); sTone('sine', 1319, t + 1.1, 0.7, 0.04, { f1: 2093 }); };
  // the opening of In the Hall of the Mountain King, plucked, the way it creeps in
  SFX.pkMountainKing = function (t) {
    var B = 246.94, Cs = 277.18, D = 293.66, E = 329.63, Fs = 369.99, F = 349.23, Cn = 261.63;
    [[B, 0], [Cs, 1], [D, 2], [E, 3], [Fs, 4], [D, 5], [Fs, 6], [F, 8], [Cs, 9], [F, 10], [E, 12], [Cn, 13], [E, 14]].forEach(function (n) { sTone('triangle', n[0], t + n[1] * 0.17, 0.16, 0.06); sTone('sine', n[0] / 2, t + n[1] * 0.17, 0.12, 0.03); });
  };

  // ── The desk ─────────────────────────────────────────────────────
  // The plate in four fields, left to right: who it is (crest, maker's plate, LOAD and the ride's own dial, the operator key and
  // the VOICE switch), the mimic and its telemetry, the sequence (the four buttons, the dispatch interlock chain, AUTO, the
  // stop and RESET) and dispatch (the ride's voice, the READY lamp, the lever or, on a kids' ride, a big GO button).
  // Built in `con`'s frame, whose local +Z faces the operator; the status bank stands on the back of the desk as before.
  function pkBoothPanel(a, con) {
    var C = pkCtl(a), M = pkPnCaps(), SS = pkPnStyles();
    var sh = PK_PANEL[a.id] || { style: 'scales', title: a.name, model: 'RIDE CONTROL', kind: 'track', coaster: true, sig: { label: 'HORN', sfx: 'bell', words: 'stand clear', col: 'amber' } };
    if (sh.coaster || (sh.kind === 'track' && !sh.g2)) pkPnCoasterSheet(sh, a);
    var S = SS[sh.style] || SS.scales, kid = !!S.kid;
    if (sh.base) S = Object.assign({}, S, { base: pkPnToyBase(sh.base[0], sh.base[1], sh.base[2]) });
    var caps = Object.assign({ gates: kid ? 'lime' : 'green', bars: kid ? 'orange' : 'amber', station: kid ? 'sky' : 'white', test: kid ? 'purple' : 'blue', reset: 'white' }, sh.caps || {});
    var PW = 1.80, PH = 0.50, TILT = 0.50, TOP = 0.72;
    var PY = TOP + (PH / 2) * Math.cos(TILT), PZ = (PH / 2) * Math.sin(TILT) + 0.06;
    var T = { rpm: 0, v: 0, vy: 0, g: 1, h: 0, volts: 0, amps: 0, wind: 3, deck: 0, n: 0, moving: false, phase: '', block: 'STATION', blk: 0, lap: 0, flow: 0, level: 64, fog: 100, room: 0, roomName: '', fx: false, fall: false };
    var mim = (PK_PN_KINDS[sh.kind] || PK_PN_KINDS.rotor)(a, sh);
    var BX = [0.265, 0.367, 0.469, 0.571], B = [['gates', 'GATES'], ['bars', 'BARS'], ['station', 'STN GATES'], ['test', 'TEST']];
    var IL = ['KEY', 'GATES SHUT', 'BARS DOWN', 'SEATED'];
    var Wn = PK_PN_WIN, serial = pkPnSerial(a.id);
    var P = pkCtlPanel({
      w: PW, h: PH, x: 0, y: PY, z: PZ, tilt: -TILT, key: 'pk-booth-desk-' + a.id, parent: con,
      paint: function (c, W, H) { S.base(c, W, H); },
      rim: S.rim, screw: S.screw, glow: S.glow, rough: S.rough, metal: kid ? 0.05 : S.metal,
      draw: function (c, W, H) {
        var R = pkCtlRuler(W, H, PW, PH); R.c = c;
        var head = S.head || S.font;
        // the four fields
        pkPnZone(R, S, -0.895, -0.245, -0.405, 0.245);
        pkPnZone(R, S, -0.395, -0.245, 0.195, 0.245, 'MIMIC · LIVE');
        pkPnZone(R, S, 0.205, -0.245, 0.635, 0.245, 'SEQUENCE');
        pkPnZone(R, S, 0.645, -0.245, 0.895, 0.245, 'DISPATCH');
        // who it is: the crest in its medallion, the name, the maker's plate
        var cx = R.X(-0.835), cy = R.Y(0.183), cr = R.L(0.046);
        c.save(); c.beginPath(); c.arc(cx, cy, cr * 1.08, 0, 6.2832); c.fillStyle = S.zone2 || 'rgba(0,0,0,0.35)'; c.fill(); c.lineWidth = R.L(0.003); c.strokeStyle = S.acc; c.stroke();
        c.beginPath(); c.arc(cx, cy, cr * 0.98, 0, 6.2832); c.lineWidth = R.L(0.001); c.strokeStyle = S.edge; c.stroke(); c.restore();
        c.save(); c.beginPath(); c.arc(cx, cy, cr * 0.96, 0, 6.2832); c.clip(); (PK_PN_CRESTS[a.id] || PK_PN_CRESTS.carousel)(c, cx, cy, cr * 0.9, S); c.restore();
        pkPnText(R, S, sh.title, -0.775, 0.198, kid ? 0.03 : 0.027, { align: 'left', font: head, max: 0.36, weight: kid ? '900' : '700' });
        pkPnText(R, S, sh.model, -0.775, 0.163, 0.0105, { align: 'left', col: S.dim, max: 0.36 });
        pkPnText(R, S, 'LINDENBURG RIDE WORKS  ·  ' + serial, -0.775, 0.143, 0.0085, { align: 'left', col: S.dim, max: 0.36 });
        // the instruments and what they read
        pkPnText(R, S, 'LOAD', -0.78, -0.052, 0.0135, { col: S.ink });
        pkPnText(R, S, (sh.g2.unit || '').toUpperCase(), -0.55, -0.052, 0.0135, { col: S.ink, max: 0.12 });
        // the operator key and the voice switch
        pkPnText(R, S, 'OPERATOR KEY', -0.78, -0.228, 0.0125, { col: S.acc });
        pkPnText(R, S, 'OFF', -0.82, -0.118, 0.0105, { col: S.dim }); pkPnText(R, S, 'ON', -0.738, -0.118, 0.0105, { col: S.ok || '#5fd38d' });
        pkPnText(R, S, 'VOICE', -0.55, -0.228, 0.0125, { col: S.acc });
        pkPnText(R, S, 'ON DISPATCH', -0.55, -0.104, 0.009, { col: S.dim });
        // the mimic window
        c.save(); pkPnRect(R, Wn.x0, Wn.y0, Wn.x1, Wn.y1, 0.008); c.fillStyle = S.win; c.fill(); c.clip();
        var gs = 0.02; for (var gx = Wn.x0; gx < Wn.x1; gx += gs) pkPnLine(R, [[gx, Wn.y0], [gx, Wn.y1]], S.grid, 0.0007);
        for (var gy = Wn.y0; gy < Wn.y1; gy += gs) pkPnLine(R, [[Wn.x0, gy], [Wn.x1, gy]], S.grid, 0.0007);
        mim.draw(R, Object.assign({}, S, { ink: S.wink || S.ink, dim: S.wdim || S.dim, acc: S.wacc || S.acc, shadow: 'rgba(0,0,0,0.5)', engrave: true }));
        c.restore();
        c.save(); pkPnRect(R, Wn.x0, Wn.y0, Wn.x1, Wn.y1, 0.008); c.strokeStyle = S.edge; c.lineWidth = R.L(0.003); c.stroke(); c.restore();
        // the sequence: button names, the interlock chain, the bottom row
        for (var i = 0; i < B.length; i++) pkPnText(R, S, B[i][1], BX[i], 0.192, 0.0135, { max: 0.098 });
        pkPnLine(R, [[BX[0], 0.03], [BX[3], 0.03]], S.dim, 0.0016);
        for (i = 0; i < 4; i++) pkPnText(R, S, IL[i], BX[i], -0.004, 0.0088, { col: S.dim, max: 0.098 });
        pkPnText(R, S, 'INTERLOCK', 0.42, 0.058, 0.0095, { col: S.dim });
        pkPnText(R, S, 'AUTO', 0.27, -0.226, 0.0125, { col: S.ink });
        pkPnText(R, S, 'E-STOP', 0.42, -0.226, 0.0135, { col: S.stop || '#ff8a7a' });
        pkPnText(R, S, 'RESET', 0.57, -0.226, 0.0125, { col: S.ink });
        // dispatch
        pkPnText(R, S, sh.sig.label, 0.82, 0.208, 0.0115, { max: 0.12 });
        pkPnText(R, S, 'READY', 0.695, 0.208, 0.0115, { col: S.ok || '#5fd38d' });
        pkPnText(R, S, kid ? 'GO!' : 'DISPATCH', 0.77, -0.228, kid ? 0.022 : 0.0135, { col: kid ? '#2f9e44' : S.ink, weight: kid ? '900' : '700' });
        if (!kid) pkPnText(R, S, 'PULL', 0.86, -0.15, 0.009, { col: S.dim });
      }
    });
    pkCtlSetPower(P, function () { return !!a.open; });
    var parts = { buttons: {}, tel: T, sheet: sh };
    parts.panel = P;
    var collar = S.collar || MAT.chrome, bezel = S.collar === MAT.chrome ? undefined : S.collar;
    var lampCol = function (col) { return { green: 0x5fd38d, lime: 0x9fef6a, amber: 0xf0c04a, orange: 0xffa060, blue: 0x5aa9ff, sky: 0x9fd0ff, red: 0xff6b5e, crimson: 0xff6b5e, pink: 0xffb3cf, teal: 0x7fe0d4, jade: 0x7fe0b4, purple: 0xc9a0ff, navy: 0x9fb8ff, brass: 0xffd27a }[col] || 0xe8e4d8; };
    var br = kid ? 0.033 : 0.027;
    for (var i = 0; i < B.length; i++) {
      var b = B[i], col = caps[b[0]];
      parts.buttons[b[0]] = pkCtlBtn(P, BX[i], 0.112, {
        id: b[0], label: b[1], col: col, r: br, collar: collar, lampCol: lampCol(col),
        prompt: 'Press ' + b[1],
        act: function () {
          var id = this.id;
          if (C.fault && id !== 'gates') { sfx('bad'); toast('Reset ' + a.name + ' first', 'bad'); return; }
          if (id === 'gates') return pkBoothGates(a);
          if (id === 'bars') {
            if (!C.key) { sfx('bad'); toast(a.name + ' is locked - turn the operator key on', 'bad'); return; }
            C.barsWant = C.barsWant > 0.5 ? 0 : 1;
            sfx('click'); toast(a.name + ': restraints ' + (C.barsWant > 0.5 ? 'down' : 'up'), '');
            screenDirtyAll(); return true;
          }
          if (id === 'station') return pkStationGatesRide(a);
          if (id === 'test') return pkBoothTest(a);
        }
      });
    }
    // the interlock chain: every link has to be green before the ride will go
    parts.chain = IL.map(function (n, k) { return pkPnLed(P, BX[k], 0.03, { col: 0x5fd38d, r: 0.0095 }); });
    parts.auto = pkCtlToggle(P, 0.27, -0.125, { id: 'auto', on: C.auto, prompt: 'Automatic cycle', onName: 'AUTO', offName: 'MANUAL', act: function () { pkBoothAuto(a); } });
    parts.stop = pkCtlMushroom(P, 0.42, -0.112, { id: 'stop', r: kid ? 0.05 : 0.046, prompt: 'Emergency stop', act: function () { pkBoothStop(a); } });
    parts.reset = pkCtlBtn(P, 0.57, -0.125, { id: 'reset', label: 'RESET', col: caps.reset, r: br, collar: collar, lampCol: 0xe8e4d8, prompt: 'Reset after a stop',
      act: function () { if (C.fault) { pkBoothStop(a); } else { sfx('click'); toast(a.name + ': nothing to reset', ''); } } });
    // the left field: the operator key, the voice switch, LOAD and the ride's own dial
    parts.key = pkCtlKey(P, -0.78, -0.165, { id: 'opKey', on: !!C.key, label: a.name + ' operator key', tag: kid ? 'blue' : 'red', act: function (on) { return pkSetRideKey(a, on); } });
    parts.voice = pkCtlToggle(P, -0.55, -0.16, { id: 'voice', on: pkPnVoice(a.id), prompt: a.name + ': the ride\'s voice on dispatch', onName: 'ON', offName: 'OFF',
      act: function (on) { pkPnSetVoice(a.id, on); sfx('click'); toast(a.name + ': voice ' + (on ? 'on - ' + sh.sig.words + ' on every dispatch' : 'off'), ''); } });
    var gaugeO = { dial: S.dial, bezel: bezel, r: kid ? 0.07 : 0.064 };
    parts.load = pkCtlGauge(P, -0.78, 0.04, Object.assign({}, gaugeO, { id: 'load', label: '', unit: 'riders', min: 0, max: Math.max(4, a.seats.length), red: kid ? 0 : 0.92, ticks: 6,
      get: function () { return a.seats.length ? a.riders / a.seats.length : 0; } }));
    parts.g2 = pkCtlGauge(P, -0.55, 0.04, Object.assign({}, gaugeO, { id: 'g2', label: '', unit: sh.g2.unit, min: sh.g2.min, max: sh.g2.max, red: sh.g2.red, ticks: sh.g2.ticks, ease: 4,
      get: function () { return clamp(sh.g2.get(T), 0, 1); } }));
    // the telemetry strip under the mimic, in the plate's own colour
    parts.tele = pkCtlReadout(P, -0.10, -0.181, 0.54, 0.074, { col: S.tele || '#6dff9a', bg: '#040506' });
    // dispatch: the ride's voice, the READY lamp, the lever (or GO)
    parts.sig = pkCtlBtn(P, 0.82, 0.14, { id: 'sig', label: sh.sig.label, col: sh.sig.col || 'amber', r: 0.03, collar: collar, lampCol: lampCol(sh.sig.col), prompt: 'Press ' + sh.sig.label,
      act: function () { pkPnVoiceNow(a, sh, true); } });
    parts.ready = pkPnLed(P, 0.695, 0.14, { col: 0x5fd38d, r: 0.016 });
    if (kid) parts.go = pkCtlBtn(P, 0.77, -0.085, { id: 'go', label: 'GO', col: 'green', r: 0.058, collar: collar, lampCol: 0x9fef6a, prompt: 'Press GO - off we go', act: function () { pkBoothDispatch(a); } });
    else parts.lever = pkCtlLever(P, 0.70, -0.06, { id: 'dispatchLever', len: 0.13, col: S.lever || 'black', prompt: 'Pull the dispatch lever', act: function () { pkBoothDispatch(a); } });
    // the live parts of the mimic, and the glass over it: aim at it and it reads the telemetry out to you
    mim.build(P);
    var mimTxt = function () { return a.open ? (C.key ? sh.tele(a, C, T).join('  ·  ') : 'key off, telemetry standby') : 'no power'; };
    hitBox(Wn.x1 - Wn.x0, Wn.y1 - Wn.y0, 0.03, (Wn.x0 + Wn.x1) / 2, (Wn.y0 + Wn.y1) / 2, 0.012, {
      prompt: function () { return sh.title + ' mimic: ' + mimTxt(); },
      use: function () { sfx('click'); toast(sh.title + ': ' + mimTxt(), ''); }
    }, P);

    // the status bank on the back of the desk: the six windows every booth has, the ride's own two, and the counts
    var top = TOP + PH * Math.cos(TILT), hz = PZ - (PH / 2) * Math.sin(TILT) - 0.05;
    var HB = pkCtlHood(con, 0, top + 0.15, hz, 1.56, 0.2, 0.22);
    var ANN = [['key', 'KEY\nON', '#5fd38d'], ['auto', 'AUTO', '#8fc3ff'], ['gates', 'GATES\nOPEN', '#f0c04a'], ['bars', 'BARS\nLOCKED', '#f0c04a'], ['run', 'RIDE\nRUNNING', '#5fd38d'], ['fault', 'FAULT\nMAINT', '#ff6b5e']].concat(sh.ann || []);
    parts.ann = {};
    ANN.forEach(function (d, k) { parts.ann[d[0]] = pkCtlAnnun(HB, -0.715 + k * 0.124, 0, 0.112, 0.1, d[1], { col: d[2], flash: d[0] === 'fault' || d[0] === 'fall' || d[0] === 'fx' }); });
    parts.readout = pkCtlReadout(HB, 0.5, -0.025, 0.5, 0.12);
    pkPnHoodPlate(HB, S, sh);

    // ── live ──
    var near = false, nearT = 0, wasRun = false, PV = new THREE.Vector3();
    pkCtlLive({
      tick: function (dt) {
        var power = !!a.open, A = parts.ann;
        var live = power && !C.fault && !!C.key;
        if (parts.key.on !== !!C.key) parts.key.set(!!C.key);
        if (parts.auto.on !== C.auto) parts.auto.set(C.auto);
        if (parts.stop.latched !== !!C.fault) parts.stop.setLatched(!!C.fault);
        if (parts.voice.on !== pkPnVoice(a.id)) parts.voice.set(pkPnVoice(a.id));
        // the key window follows the key itself, so it still shows ON while a fault holds the rest of the panel dead
        A.key.on = power && !!C.key; A.auto.on = live && !!C.auto; A.gates.on = live && !!C.gates; A.bars.on = live && C.barsWant > 0.5;
        A.run.on = live && a.state === 'running';
        // the fault lamp has to stay lit while the ride is faulted, even though a fault drops the rest of the panel dead
        A.fault.on = power && !!C.key && ((C.fault || C.maint) ? 'flash' : false);
        parts.buttons.gates.setLit(live && (a.state === 'idle' || a.state === 'unloading' || a.state === 'boarding'));
        parts.buttons.station.setLit(live && a.stationGates === false);
        parts.buttons.test.setLit(live && !PK.closed && a.state === 'idle' && !a.queue.length && !a.riders);
        parts.buttons.bars.setLit(live && C.barsWant > 0.5);
        // the interlock chain and the READY lamp: the same conditions pkBoothDispatch checks, in the order it checks them
        var walking = pkAttrWalkers(a), loading = a.state === 'boarding' || a.state === 'ready';
        var links = [!!C.key && !C.maint, !C.gates, C.barsWant > 0.5, a.riders > 0 && !walking];
        var ready = live && !C.maint && loading && links[0] && links[1] && links[2] && links[3];
        parts.chain.forEach(function (l, k) { l.on = power ? (links[k] ? true : 'dim') : false; l.mat.emissive.setHex(links[k] ? 0x5fd38d : 0xff6b5e); });
        parts.ready.on = ready ? (C.auto ? true : 'flash') : false;
        if (parts.go) parts.go.setLit(ready);
        parts.sig.setLit(live && pkPnVoice(a.id) && a.state === 'running');
        // the mimic and the probe run while someone is near enough to read the desk
        nearT -= dt;
        if (nearT <= 0) { nearT = 0.5; P.getWorldPosition(PV); near = typeof player !== 'undefined' && player && (PV.x - player.x) * (PV.x - player.x) + (PV.z - player.z) * (PV.z - player.z) < 40 * 40; }
        if (near) mim.tick(Math.max(1e-3, dt), T);
        // the ride's two windows
        if (sh.ann) sh.ann.forEach(function (d) {
          var on = false;
          if (d[0] === 'voice') on = live && pkPnVoice(a.id);
          else if (d[0] === 'turn') on = live && T.rpm > 0.3;
          else if (d[0] === 'wind') on = live && T.wind < 15;
          else if (d[0] === 'live') on = live && T.volts > 40;
          else if (d[0] === 'fall') on = live && T.fall ? 'flash' : false;
          else if (d[0] === 'pumps') on = live && T.flow > 200;
          else if (d[0] === 'fx') on = live && T.fx ? 'flash' : false;
          else if (d[0] === 'happy') on = live && a.riders > 0;
          else if (d[0] === 'lift') on = live && a.state === 'running' && T.blk === 1;
          else if (d[0] === 'brake') on = live && (a.state !== 'running' || T.blk === 3);
          A[d[0]].on = on;
        });
        // the voice on dispatch
        var run = a.state === 'running';
        if (run && !wasRun && power && pkPnVoice(a.id) && near) pkPnVoiceNow(a, sh, false);
        wasRun = run;
        // the counts on the bank and the telemetry strip
        parts.readout.setPower(power); parts.tele.setPower(power);
        if (!power) { parts.readout.set(['NO POWER', 'BREAKER OFF']); parts.tele.set(['NO POWER', '']); return; }
        var left = a.state === 'running' ? Math.max(0, Math.ceil((a.run || 0) - (a.t || 0))) + 's' : '--';
        parts.readout.set(['QUEUE ' + ('  ' + pkAttrWaiting(a)).slice(-3) + '  RIDE ' + a.riders + '/' + a.seats.length,
          (C.fault ? 'FAULT   ' : C.maint ? 'MAINT   ' : !C.key ? 'LOCKED  ' : (a.state.toUpperCase() + '        ').slice(0, 8)) + ' END ' + left]);
        if (near) parts.tele.set(C.fault ? ['E-STOP LATCHED', 'TURN THE STOP, THEN RESET'] : !C.key ? ['KEY OFF', 'TELEMETRY STANDBY'] : sh.tele(a, C, T));
      }
    });
    a.boothPanel = parts;
    return parts;
  }
  // a small brass plate on the hood: the ride's name in its own lettering, so the bank reads as this ride's too
  function pkPnHoodPlate(HB, S, sh, x, y) {
    var t = tex(512, 64, function (c, W, H) {
      c.fillStyle = S.win || '#111'; c.fillRect(0, 0, W, H);
      c.strokeStyle = S.edge; c.lineWidth = 4; c.strokeRect(2, 2, W - 4, H - 4);
      c.fillStyle = S.acc; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '700 34px ' + (S.head || S.font);
      c.fillText(sh.title.toUpperCase(), W / 2, H / 2 + 1, W - 24);
    });
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    var m = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.036), new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.35, roughness: 0.4, metalness: 0.3 }));
    m.position.set(x === undefined ? 0.5 : x, y === undefined ? 0.075 : y, 0.006); HB.add(m);
  }
  // the voice switch remembers where it was left, per ride, in the save
  function pkPnSave() { if (!S.pnVoice) S.pnVoice = {}; return S; }
  function pkPnVoice(id) { return !(S && S.pnVoice && S.pnVoice[id] === false); }
  function pkPnSetVoice(id, on) { pkPnSave().pnVoice[id] = !!on; }
  function pkPnVoiceNow(a, sh, byHand) {
    if (byHand && !a.open) { sfx('bad'); toast(a.name + ' has no power - the breaker is off', 'bad'); return; }
    sfx(sh.sig.sfx || 'bell');
    if (byHand) toast(a.name + ': ' + sh.sig.words, '');
  }

  // the test API: the panels' sheets and their probes
  var _pkPnTestApi = GAME.T;
  GAME.T = function () {
    var o = _pkPnTestApi();
    o.PK_PANEL = PK_PANEL; o.pkPnVoice = pkPnVoice; o.pkPnSetVoice = pkPnSetVoice; o.pkMimicBoard = function () { return PK_MIMIC && PK_MIMIC.board; }; o.pkTestRun = pkTestRun; o.route = route; o.pkAttrSlot = pkAttrSlot; o.pkAttrSeatWorld = pkAttrSeatWorld; o.pkMats = pkMats;
    return o;
  };
