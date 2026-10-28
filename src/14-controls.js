//@ Park Co, part 14: the control desks - real hardware on the panels. Push buttons in chrome
// collars with lit rings, bat switches under rubber boots, a rotary selector, a throttle lever,
// a mushroom stop and analogue gauges whose needles follow the ride. Each panel's legend is
// printed once on a canvas plate (section lines, engraved labels, wear) so the hardware sits on
// a real fascia instead of a blank face, and every console is one editable world item.

// ── Materials ────────────────────────────────────────────────────────
var PK_CTL_M = null;
function pkCtlM() {
  if (PK_CTL_M) return PK_CTL_M;
  var M = PK_CTL_M = {};
  M.case  = std({ color: 0x333d45, roughness: 0.58, metalness: 0.35 });   // the cabinet
  M.face  = std({ color: 0x46525b, roughness: 0.55, metalness: 0.28 });   // the fascia plate
  M.well  = std({ color: 0x11161a, roughness: 0.5, metalness: 0.5 });     // the recess a control sits in
  M.bezel = std({ color: 0x1a1f23, roughness: 0.45, metalness: 0.55 });
  M.knob  = std({ color: 0x22282d, roughness: 0.5, metalness: 0.4 });
  M.boot  = std({ color: 0x0f1214, roughness: 0.97, side: THREE.DoubleSide });   // the rubber boot on a switch
  M.yellow = std({ color: 0xe0a51f, roughness: 0.55 });
  M.needle = std({ color: 0xb8362b, roughness: 0.5 });
  M.caps = {
    red:   std({ color: 0xb8362b, roughness: 0.42 }),
    green: std({ color: 0x2f9e44, roughness: 0.42 }),
    amber: std({ color: 0xe2a021, roughness: 0.42 }),
    blue:  std({ color: 0x2f6fb3, roughness: 0.42 }),
    white: std({ color: 0xe6e3d8, roughness: 0.44 }),
    black: std({ color: 0x1b1f23, roughness: 0.5 })
  };
  return M;
}

// ── Gauge faces ──────────────────────────────────────────────────────
var PK_GAUGE_TEX = {};
// a dial's printing: cream is the classic, the others are what a themed booth desk asks for (part 14, the booth panels)
var PK_DIALS = {
  cream: { f: ['#fbf7ec', '#efe9d8', '#d3ccb8'], ink: '#2f3439', sub: '#6c7176', red: '#c0392b', wear: 'rgba(120,110,90,' },
  black: { f: ['#2a3036', '#181c20', '#0d1013'], ink: '#eef1f2', sub: '#9aa6ae', red: '#e0483a', wear: 'rgba(255,255,255,' },
  brass: { f: ['#f6e7b8', '#e2c682', '#b8914e'], ink: '#3a2a14', sub: '#6a5130', red: '#9c2a1c', wear: 'rgba(90,60,20,' },
  bone:  { f: ['#efe4c8', '#d9caa2', '#a8956a'], ink: '#2b1d12', sub: '#5a4630', red: '#8a2318', wear: 'rgba(70,40,20,' },
  night: { f: ['#2c2350', '#1a1534', '#0d0b1e'], ink: '#b9f5c8', sub: '#8fa2d8', red: '#ff6b8a', wear: 'rgba(180,200,255,' },
  toy:   { f: ['#ffffff', '#fff6e0', '#ffe3a8'], ink: '#2a2f6a', sub: '#e0563f', red: '#e0563f', wear: 'rgba(255,180,80,', rainbow: true }
};
function pkCtlGaugeTex(o) {
  var key = [o.label, o.min, o.max, o.unit, o.red || 0, o.ticks || 10, o.dial || 'cream'].join('|');
  if (PK_GAUGE_TEX[key]) return PK_GAUGE_TEX[key];
  var D = PK_DIALS[o.dial] || PK_DIALS.cream;
  var t = tex(256, 256, function (c, W, H) {
    var cx = W / 2, cy = H / 2, R = W * 0.48;
    c.clearRect(0, 0, W, H);
    var g = c.createRadialGradient(cx, cy - R * 0.3, R * 0.12, cx, cy, R);
    g.addColorStop(0, D.f[0]); g.addColorStop(0.72, D.f[1]); g.addColorStop(1, D.f[2]);
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, 6.2832); c.fill();
    // the sweep runs 270 degrees from the lower left, the way a real dial does
    var A = function (v) { return -(135 + 270 * v) * Math.PI / 180; };
    var P = function (v, rr) { var a = A(v); return [cx + Math.cos(a) * rr, cy - Math.sin(a) * rr]; };
    if (D.rainbow) ['#5fd38d', '#8fd3c7', '#f0c04a', '#ff9d6b'].forEach(function (col, k) { var span = o.red || 1; c.beginPath(); c.lineWidth = R * 0.11; c.strokeStyle = col; c.arc(cx, cy, R * 0.80, (135 + 270 * span * k / 4) * Math.PI / 180, (135 + 270 * span * (k + 1) / 4) * Math.PI / 180); c.stroke(); });
    if (o.red) { c.beginPath(); c.lineWidth = R * 0.09; c.strokeStyle = D.red; c.arc(cx, cy, R * 0.80, (135 + 270 * o.red) * Math.PI / 180, (135 + 270) * Math.PI / 180); c.stroke(); }
    var n = o.ticks || 10;
    for (var i = 0; i <= n; i++) {
      var v = i / n, major = i % 2 === 0, a = P(v, R * (major ? 0.74 : 0.80)), b = P(v, R * 0.90);
      c.beginPath(); c.lineWidth = major ? R * 0.028 : R * 0.016; c.strokeStyle = D.ink;
      c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
      if (major) {
        var q = P(v, R * 0.60);
        c.fillStyle = D.ink; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.font = 'bold ' + Math.round(R * 0.13) + 'px Arial';
        c.fillText(String(Math.round((o.min + (o.max - o.min) * v) * 10) / 10), q[0], q[1]);
      }
    }
    c.fillStyle = D.ink; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = 'bold ' + Math.round(R * 0.115) + 'px Arial'; c.fillText(o.label, cx, cy + R * 0.30);
    if (o.unit) { c.fillStyle = D.sub; c.font = Math.round(R * 0.10) + 'px Arial'; c.fillText(o.unit, cx, cy + R * 0.47); }
    // a little wear so the dial is not a clip-art circle
    for (var k = 0; k < 60; k++) { c.fillStyle = D.wear + randf(0.02, 0.07) + ')'; c.fillRect(randf(0, W), randf(0, H), randf(1, 5), randf(1, 3)); }
  });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return (PK_GAUGE_TEX[key] = t);
}

// ── The fascia plate ─────────────────────────────────────────────────
// One canvas per panel: painted steel, section lines, engraved lettering. The hardware is
// mounted on top at the same coordinates the legend is drawn at, so nothing can drift.
var PK_FACE_TEX = {};
// paint(c, W, H), when given, lays the plate's own finish instead of the plain grey steel (the themed booth desks)
function pkCtlFace(key, w, h, draw, paint) {
  if (PK_FACE_TEX[key]) return PK_FACE_TEX[key];
  var W = 2048, H = Math.max(160, Math.round(W * h / w));
  var t = tex(W, H, function (c) {
    if (paint) { paint(c, W, H); draw(c, W, H); return; }
    c.fillStyle = '#46525b'; c.fillRect(0, 0, W, H);
    for (var i = 0; i < 3200; i++) {
      c.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '255,255,255' : '0,0,0') + ',' + randf(0.01, 0.04) + ')';
      c.fillRect(Math.random() * W, Math.random() * H, randf(1, 22), 1);
    }
    var vg = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.12, W / 2, H / 2, Math.max(W, H) * 0.72);
    vg.addColorStop(0, 'rgba(255,255,255,0.06)'); vg.addColorStop(1, 'rgba(0,0,0,0.20)');
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
    draw(c, W, H);
  });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return (PK_FACE_TEX[key] = t);
}
// helpers a fascia drawing gets: metres in, canvas pixels out
function pkCtlRuler(W, H, w, h) {
  var R2 = {
    W: W, H: H, w: w, h: h, sx: W / w, sy: H / h,
    X: function (mx) { return (mx / w + 0.5) * W; },
    Y: function (my) { return (0.5 - my / h) * H; },
    L: function (m) { return m * W / w; }
  };
  R2.txt = function (s, mx, my, sizeM, col, align, weight) {
    var c = R2.c;
    c.save(); c.fillStyle = col || '#dfe6ea'; c.textAlign = align || 'center'; c.textBaseline = 'middle';
    c.font = (weight || '600') + ' ' + Math.max(7, Math.round(sizeM * W / w)) + 'px Bahnschrift, "Segoe UI", Arial, sans-serif';
    c.fillText(s, R2.X(mx), R2.Y(my)); c.restore();
  };
  R2.box = function (mx, my, mw, mh, col, lw) {
    var c = R2.c; c.save();
    c.strokeStyle = col || 'rgba(0,0,0,0.35)'; c.lineWidth = Math.max(1, R2.L(lw || 0.004));
    c.strokeRect(R2.X(mx - mw / 2), R2.Y(my + mh / 2), R2.L(mw), R2.L(mh));
    c.restore();
  };
  R2.engrave = function (s, mx, my, sizeM, align) {
    var c = R2.c; c.save(); c.textAlign = align || 'center'; c.textBaseline = 'middle';
    var px = Math.max(7, Math.round(sizeM * W / w));
    c.font = '700 ' + px + 'px Bahnschrift, "Segoe UI", Arial, sans-serif';
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillText(s, R2.X(mx) + 1, R2.Y(my) + 1);
    c.fillStyle = '#e4ebef'; c.fillText(s, R2.X(mx), R2.Y(my)); c.restore();
  };
  return R2;
}

// ── The panel itself ─────────────────────────────────────────────────
function pkCtlPanel(o) {
  var M = pkCtlM();
  var g = new THREE.Group();
  g.rotation.order = 'YXZ';
  g.position.set(o.x, o.y, o.z);
  g.rotation.y = o.ry || 0;
  g.rotation.x = o.tilt || 0;
  parentOf(o.parent).add(g);
  // o.caseMat, o.rim and o.screw dress the plate's case, its machined rim and its screws; o.paint its finish; o.glow,
  // o.rough and o.metal how the printed plate takes the light
  pkBevelBox(o.w + 0.07, o.h + 0.07, 0.055, o.caseMat || M.case, 0, 0, -0.030, g, 0.012);
  var faceTex = pkCtlFace(o.key, o.w, o.h, o.draw, o.paint);
  var glowK = o.glow === undefined ? 0.34 : o.glow;
  var face = new THREE.Mesh(new THREE.PlaneGeometry(o.w, o.h),
    new THREE.MeshStandardMaterial({ map: faceTex, roughness: o.rough === undefined ? 0.55 : o.rough, metalness: o.metal === undefined ? 0.22 : o.metal, emissive: 0xffffff, emissiveMap: faceTex, emissiveIntensity: glowK }));
  face.position.z = 0.0005; face.receiveShadow = true; g.add(face);
  g.userData.pkFace = face;
  g.userData.pkSetPower = function (on) { face.material.emissiveIntensity = on ? glowK : 0.03; };
  var pkWasLive = true;
  pkCtlLive({ tick: function () {
    var live = pkCtlPowered(g);
    if (live !== pkWasLive) { pkWasLive = live; g.userData.pkSetPower(live); }
  } });
  // the machined rim round the plate, and four screws
  pkBevelBox(o.w + 0.10, 0.018, 0.06, o.rim || M.bezel, 0, o.h / 2 + 0.038, -0.028, g, 0.005);
  pkBevelBox(o.w + 0.10, 0.018, 0.06, o.rim || M.bezel, 0, -o.h / 2 - 0.038, -0.028, g, 0.005);
  if (o.rim) [-1, 1].forEach(function (sx) { pkBevelBox(0.018, o.h + 0.094, 0.06, o.rim, sx * (o.w / 2 + 0.041), 0, -0.028, g, 0.005); });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) {
    var sc = new THREE.Mesh(roundCylGeo(0.011, 0.011, 0.005, 10), o.screw || MAT.chrome);
    sc.rotation.x = Math.PI / 2; sc.position.set(s[0] * (o.w / 2 - 0.012), s[1] * (o.h / 2 - 0.012), 0.004); g.add(sc);
  });
  return g;
}

// ── Hardware ─────────────────────────────────────────────────────────
// every moving part sits in a dynamic group: the bake leaves it alone, the editor still
// treats the whole console as one item, and the part can travel.
var PK_CTL_LIVE = [];
function pkCtlLive(o) { PK_CTL_LIVE.push(o); }
// A panel can carry a power supply of its own: the ride's breaker, the coaster key or the
// console master. Every control on that panel asks before it acts, and its lamps, gauges and
// face go dark when the supply is gone. A panel with no supply is always live (the park board).
function pkCtlPowered(g) {
  var f = g && g.userData && g.userData.pkPower;
  return !f || !!f();
}
function pkCtlDead(g) {
  if (pkCtlPowered(g)) return false;
  sfx('bad'); toast('No power - the breaker is off', 'bad');
  return true;
}
function pkCtlSetPower(g, fn) {
  g.userData.pkPower = fn;
  if (g.userData.pkSetPower) g.userData.pkSetPower(!fn || !!fn());
}
var PK_CTL_TICKED = false;
function pkCtlTick(dt) {
  if (dt > 0.2) dt = 0.2;
  for (var i = 0; i < PK_CTL_LIVE.length; i++) PK_CTL_LIVE[i].tick(dt);
}
function pkCtlStart() {
  if (PK_CTL_TICKED) return;
  PK_CTL_TICKED = true;
  animate(pkCtlTick);
}

// a push button: chrome collar, recessed well, coloured cap with a lit ring, and a press travel
function pkCtlBtn(g, x, y, o) {
  o = o || {};
  var M = pkCtlM(), r = o.r || 0.038;
  var collar = new THREE.Mesh(roundCylGeo(r * 1.40, r * 1.46, 0.011, 20), o.collar || MAT.chrome);
  collar.rotation.x = Math.PI / 2; collar.position.set(x, y, 0.006); g.add(collar);
  var well = new THREE.Mesh(roundCylGeo(r * 1.18, r * 1.18, 0.010, 20), M.well);
  well.rotation.x = Math.PI / 2; well.position.set(x, y, 0.010); g.add(well);
  var cg = new THREE.Group(); cg.position.set(x, y, 0.012); cg.userData.dynamic = true; g.add(cg);
  var cap = new THREE.Mesh(roundCylGeo(r, r * 0.93, 0.021, 20), M.caps[o.col || 'green']);
  cap.rotation.x = Math.PI / 2; cap.position.z = 0.010; cap.castShadow = true; cg.add(cap);
  var ledMat = glowMat(o.lampCol || 0x5fd38d, 0.0);
  var led = new THREE.Mesh(new THREE.TorusGeometry(r * 0.70, r * 0.075, 6, 20), ledMat);
  led.position.z = 0.021; cg.add(led);
  var pressT = 0;
  var api = {
    id: o.id, label: o.label, lamp: ledMat, lit: false,
    press: function () {
      pressT = 0.0001;
      if (o.act) o.act();
    },
    setLit: function (on) { api.lit = !!on; }
  };
  pkCtlLive({
    tick: function (dt) {
      if (pressT > 0) {
        pressT += dt;
        var k = pressT / 0.20;
        if (k >= 1) { pressT = 0; cg.position.z = 0.012; }
        else cg.position.z = 0.012 - 0.007 * Math.sin(Math.PI * k);
      }
      var want = api.lit && PK.consoleLamps !== false && pkCtlPowered(g) ? 1 : 0;
      var cur = ledMat.emissiveIntensity || 0;
      ledMat.emissiveIntensity = cur + (want * 1.35 - cur) * Math.min(1, dt * 12);
    }
  });
  hitBox(r * 2.4, r * 2.4, 0.075, x, y, 0.028, {
    prompt: function () { return pkCtlPowered(g) ? (o.prompt || ('Press ' + (o.label || 'the button'))) : 'No power - breaker off'; },
    use: function () { if (pkCtlDead(g)) return; api.press(); }
  }, g);
  return api;
}

// a bat switch under a rubber boot: the lever throws up or down about the plate
function pkCtlToggle(g, x, y, o) {
  o = o || {};
  var M = pkCtlM(), on = !!o.on;
  pkBevelBox(0.072, 0.096, 0.010, M.bezel, x, y, 0.005, g, 0.004);
  var boot = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.024, 0.030, 12, 1, true), M.boot);
  boot.rotation.x = Math.PI / 2; boot.position.set(x, y, 0.025); g.add(boot);
  var piv = new THREE.Group(); piv.position.set(x, y, 0.040); piv.userData.dynamic = true; g.add(piv);
  var arm = new THREE.Mesh(roundCylGeo(0.0055, 0.0055, 0.052, 8), MAT.chrome);
  arm.rotation.x = Math.PI / 2; arm.position.z = 0.026; piv.add(arm);
  var ball = new THREE.Mesh(new THREE.SphereGeometry(0.0105, 10, 8), M.caps.black);
  ball.position.z = 0.055; piv.add(ball);
  var target = on ? -0.42 : 0.42;
  piv.rotation.x = target;
  var api = {
    id: o.id, on: on,
    set: function (v) { api.on = !!v; target = api.on ? -0.42 : 0.42; },
    flip: function () {
      var want = !api.on;
      api.set(want);
      // a switch that is refused falls straight back, the way a real breaker does
      if (o.act && o.act(want) === false) api.set(!want);
    }
  };
  pkCtlLive({ tick: function (dt) { piv.rotation.x += (target - piv.rotation.x) * Math.min(1, dt * 16); } });
  hitBox(0.095, 0.115, 0.085, x, y, 0.035, {
    prompt: function () { return pkCtlPowered(g) ? ((o.prompt || 'Throw the switch') + ' - ' + (o.onName || 'ON') + ' / ' + (o.offName || 'OFF')) : 'No power - breaker off'; },
    use: function () { if (pkCtlDead(g)) return; api.flip(); }
  }, g);
  return api;
}

// a rotary selector: a knurled knob with a pointer that steps between detents
function pkCtlRotary(g, x, y, o) {
  o = o || {};
  var M = pkCtlM(), r = o.r || 0.048, n = o.n || 3, pos = o.pos || 0;
  var plate = new THREE.Mesh(roundCylGeo(r * 1.55, r * 1.62, 0.010, 24), M.bezel);
  plate.rotation.x = Math.PI / 2; plate.position.set(x, y, 0.005); g.add(plate);
  var piv = new THREE.Group(); piv.position.set(x, y, 0.010); piv.userData.dynamic = true; g.add(piv);
  var knob = new THREE.Mesh(roundCylGeo(r, r * 0.92, 0.030, 24), M.knob);
  knob.rotation.x = Math.PI / 2; knob.position.z = 0.016; knob.castShadow = true; piv.add(knob);
  var grip = new THREE.Mesh(new THREE.TorusGeometry(r * 0.80, 0.005, 6, 20), M.well);
  grip.position.z = 0.030; piv.add(grip);
  var ptr = new THREE.Mesh(new THREE.BoxGeometry(0.007, r * 0.66, 0.006), M.caps.white);
  ptr.position.set(0, r * 0.42, 0.032); piv.add(ptr);
  var step = n > 1 ? 0.62 : 0, target = (pos - (n - 1) / 2) * step;
  piv.rotation.z = target;
  var api = {
    id: o.id, pos: pos, n: n,
    set: function (p, quiet) {
      api.pos = (p + n) % n; target = (api.pos - (n - 1) / 2) * step;
      if (!quiet && o.act) o.act(api.pos);
    },
    step: function () { api.set(api.pos + 1); }
  };
  pkCtlLive({ tick: function (dt) { piv.rotation.z += (target - piv.rotation.z) * Math.min(1, dt * 14); } });
  hitBox(r * 3.1, r * 3.1, 0.085, x, y, 0.030, {
    prompt: function () { return pkCtlPowered(g) ? ((o.prompt || 'Turn the selector') + ': ' + (o.names ? o.names[api.pos] : 'position ' + (api.pos + 1))) : 'No power - breaker off'; },
    use: function () { if (pkCtlDead(g)) return; sfx('click'); api.step(); }
  }, g);
  return api;
}

// the throttle: a quadrant lever that stands out of the plate and swings down toward the operator
function pkCtlLever(g, x, y, o) {
  o = o || {};
  var M = pkCtlM(), len = o.len || 0.22, rest = -0.30, pulled = 0.62;
  // the quadrant: a raised boss with a slot the lever sweeps through
  pkBevelBox(0.11, 0.11, 0.030, M.bezel, x, y, 0.014, g, 0.006);
  var quad = new THREE.Mesh(new THREE.RingGeometry(0.030, len * 0.98, 26, 1, -1.45, 2.90), M.well);
  quad.position.set(x, y, 0.0305); g.add(quad);
  var piv = new THREE.Group(); piv.position.set(x, y, 0.034); piv.userData.dynamic = true; g.add(piv);
  // the shaft stands out of the plate along +Z, so it never sinks into the fascia
  var shaft = new THREE.Mesh(roundCylGeo(0.012, 0.016, len, 10), MAT.chrome);
  shaft.rotation.x = Math.PI / 2; shaft.position.z = len / 2; shaft.castShadow = true; piv.add(shaft);
  var neck = new THREE.Mesh(new THREE.SphereGeometry(0.020, 12, 10), M.caps[o.col || 'black']);
  neck.position.z = len; piv.add(neck);
  // the grip stands up off the end of the shaft: a hand-sized handle, not a ball
  var grip = new THREE.Mesh(roundCylGeo(0.024, 0.028, 0.115, 14), M.caps[o.col || 'black']);
  grip.position.z = len; grip.castShadow = true; piv.add(grip);
  var capA = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), M.caps[o.col || 'black']);
  capA.position.set(0, 0.058, len); piv.add(capA);
  var capB = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), M.caps[o.col || 'black']);
  capB.position.set(0, -0.058, len); piv.add(capB);
  piv.rotation.x = rest;
  var state = 'rest', t = 0;
  var api = {
    id: o.id, pulled: false,
    pull: function () {
      if (state === 'pull' || state === 'hold') return;
      state = 'pull'; t = 0;
      sfx('lever');
      if (o.act) o.act();
    }
  };
  pkCtlLive({
    tick: function (dt) {
      if (state === 'rest') return;
      t += dt;
      if (state === 'pull') {
        var k = Math.min(1, t / 0.16);
        piv.rotation.x = rest + (pulled - rest) * (1 - Math.pow(1 - k, 2));
        if (k >= 1) { state = 'hold'; t = 0; }
      } else if (state === 'hold') {
        if (t > 0.55) { state = 'back'; t = 0; }
      } else {
        var k2 = Math.min(1, t / 0.35);
        piv.rotation.x = pulled + (rest - pulled) * k2 * k2;
        if (k2 >= 1) { state = 'rest'; piv.rotation.x = rest; }
      }
    }
  });
  hitBox(0.15, 0.20, 0.22, x, y + 0.02, 0.115, {
    prompt: function () { return pkCtlPowered(g) ? (o.prompt || 'Pull the lever') : 'No power - breaker off'; },
    use: function () { if (pkCtlDead(g)) return; api.pull(); }
  }, g);
  return api;
}

// the mushroom: a red head on a yellow plate, and it stays down until it is turned back
function pkCtlMushroom(g, x, y, o) {
  o = o || {};
  var M = pkCtlM(), r = o.r || 0.072;
  var plate = new THREE.Mesh(roundCylGeo(r * 1.42, r * 1.50, 0.012, 24), M.yellow);
  plate.rotation.x = Math.PI / 2; plate.position.set(x, y, 0.006); g.add(plate);
  var collar = new THREE.Mesh(roundCylGeo(r * 0.92, r * 0.98, 0.024, 24), M.bezel);
  collar.rotation.x = Math.PI / 2; collar.position.set(x, y, 0.020); g.add(collar);
  var head = new THREE.Group(); head.position.set(x, y, 0.028); head.userData.dynamic = true; g.add(head);
  var body = new THREE.Mesh(roundCylGeo(r * 0.78, r * 0.86, 0.026, 24), M.caps.red);
  body.rotation.x = Math.PI / 2; body.castShadow = true; head.add(body);
  var dome = new THREE.Mesh(new THREE.SphereGeometry(r * 0.78, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.caps.red);
  dome.rotation.x = Math.PI / 2; dome.position.z = 0.013; dome.scale.z = 0.55; head.add(dome);
  var down = 0, target = 0;
  var api = {
    id: o.id, latched: false,
    press: function () {
      if (api.latched) { api.latched = false; target = 0; sfx('click'); if (o.release) o.release(); }
      else { api.latched = true; target = -0.012; sfx('bad'); if (o.act) o.act(); }
    },
    setLatched: function (v) { api.latched = !!v; target = api.latched ? -0.012 : 0; }
  };
  pkCtlLive({ tick: function (dt) { down += (target - down) * Math.min(1, dt * 20); head.position.z = 0.028 + down; } });
  hitBox(r * 3.0, r * 3.0, 0.09, x, y, 0.030, {
    prompt: function () { return pkCtlPowered(g) ? (api.latched ? 'Turn the stop to reset' : (o.prompt || 'Hit the emergency stop')) : 'No power - breaker off'; },
    use: function () { if (pkCtlDead(g)) return; api.press(); }
  }, g);
  return api;
}

// the operator keyswitch: a brass bezel, a barrel and a key with its tag standing in it. The key turns a quarter turn
// clockwise from OFF to ON; o.act(on) may refuse (return false) and the key turns back.
function pkCtlKey(g, x, y, o) {
  o = o || {};
  var M = pkCtlM(), brass = pkMats().brass || pkMats().gold;
  var bez = new THREE.Mesh(roundCylGeo(0.032, 0.034, 0.012, 20), brass); bez.rotation.x = Math.PI / 2; bez.position.set(x, y, 0.006); g.add(bez);
  var bar = new THREE.Mesh(roundCylGeo(0.022, 0.022, 0.014, 18), M.well); bar.rotation.x = Math.PI / 2; bar.position.set(x, y, 0.012); g.add(bar);
  var piv = new THREE.Group(); piv.position.set(x, y, 0.02); piv.userData.dynamic = true; g.add(piv);
  var blade = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.026, 0.02), brass); blade.position.z = 0.008; piv.add(blade);
  var bow = new THREE.Mesh(roundCylGeo(0.018, 0.018, 0.006, 16), brass); bow.rotation.x = Math.PI / 2; bow.position.set(0, 0, 0.026); bow.scale.set(1, 1, 1); piv.add(bow);
  var hole = new THREE.Mesh(roundCylGeo(0.005, 0.005, 0.008, 8), M.well); hole.rotation.x = Math.PI / 2; hole.position.set(0, 0.009, 0.026); piv.add(hole);
  var tag = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.03, 0.003), M.caps[o.tag || 'red']); tag.position.set(0, -0.03, 0.03); tag.rotation.z = 0.12; piv.add(tag);
  var on = !!o.on, target = on ? -Math.PI / 2 : 0; piv.rotation.z = target;
  var api = {
    id: o.id, on: on,
    set: function (v) { api.on = !!v; target = api.on ? -Math.PI / 2 : 0; },
    turn: function () {
      var want = !api.on; api.set(want); sfx('click');
      if (o.act && o.act(want) === false) api.set(!want);
    }
  };
  pkCtlLive({ tick: function (dt) { piv.rotation.z += (target - piv.rotation.z) * Math.min(1, dt * 12); } });
  hitBox(0.08, 0.08, 0.07, x, y, 0.03, {
    prompt: function () { return pkCtlPowered(g) ? ((o.label || 'Operator key') + ': ' + (api.on ? 'ON - turn it off' : 'OFF - turn it on')) : 'No power - breaker off'; },
    use: function () { if (pkCtlDead(g)) return; api.turn(); }
  }, g);
  return api;
}

// an indicator lamp in a bezel
function pkCtlLamp(g, x, y, o) {
  o = o || {};
  var M = pkCtlM(), r = o.r || 0.026;
  var bez = new THREE.Mesh(roundCylGeo(r * 1.34, r * 1.40, 0.012, 16), M.bezel);
  bez.rotation.x = Math.PI / 2; bez.position.set(x, y, 0.006); g.add(bez);
  var mat = glowMat(o.col || 0x5fd38d, 0.10);
  var lens = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat);
  lens.position.set(x, y, 0.016); lens.scale.z = 0.86; g.add(lens);
  // a bright pip on top of the lens so a lit lamp reads from across the room
  var pip = new THREE.Mesh(new THREE.SphereGeometry(r * 0.52, 10, 8), mat);
  pip.position.set(x, y, 0.020); g.add(pip);
  var api = { id: o.id, mat: mat, col: o.col || 0x5fd38d, on: false, level: 0 };
  pkCtlLive({
    tick: function (dt) {
      var want = api.on && pkCtlPowered(g) ? 1 : 0;
      api.level += (want - api.level) * Math.min(1, dt * 10);
      mat.emissiveIntensity = 0.10 + api.level * 2.1;
    }
  });
  return api;
}

// an analogue gauge: printed dial, chrome bezel, a needle on a pivot, and a glass
function pkCtlGauge(g, x, y, o) {
  o = o || {};
  var M = pkCtlM(), r = o.r || 0.10;
  var bez = new THREE.Mesh(roundCylGeo(r * 1.13, r * 1.17, 0.013, 28), o.bezel || MAT.chrome);
  bez.rotation.x = Math.PI / 2; bez.position.set(x, y, 0.0065); g.add(bez);
  var face = new THREE.Mesh(new THREE.CircleGeometry(r * 0.99, 40),
    new THREE.MeshStandardMaterial({ map: pkCtlGaugeTex(o), roughness: 0.42, metalness: 0.02 }));
  face.position.set(x, y, 0.014); g.add(face);
  var piv = new THREE.Group(); piv.position.set(x, y, 0.019); piv.userData.dynamic = true; g.add(piv);
  var nd = new THREE.Mesh(new THREE.BoxGeometry(0.0055, r * 0.80, 0.004), M.needle);
  nd.position.y = r * 0.30; piv.add(nd);
  var cw = new THREE.Mesh(new THREE.BoxGeometry(0.010, r * 0.16, 0.004), M.needle);
  cw.position.y = -r * 0.07; piv.add(cw);
  var hub = new THREE.Mesh(roundCylGeo(r * 0.10, r * 0.10, 0.010, 12), M.bezel);
  hub.rotation.x = Math.PI / 2; hub.position.z = 0.002; piv.add(hub);
  var glass = new THREE.Mesh(new THREE.CircleGeometry(r * 0.99, 32), MAT.screenGlass);
  glass.position.set(x, y, 0.027); g.add(glass);
  var cur = 0;
  var api = {
    id: o.id, get: o.get || function () { return 0.25; }, cur: 0, piv: piv,
    set: function (t) { cur = clamp(t, 0, 1); }
  };
  pkCtlLive({
    tick: function (dt) {
      var want = pkCtlPowered(g) ? clamp(api.get(), 0, 1) : 0;
      cur += (want - cur) * Math.min(1, dt * (o.ease || 3.0));
      piv.rotation.z = -(225 + 270 * cur) * Math.PI / 180;
    }
  });
  return api;
}

// ── The state the desks share ────────────────────────────────────────
function pkCtlState() {
  if (!PK.console) {
    PK.console = {
      on: true,        // the master switch on the big desk
      lamps: true,     // the lit rings in the buttons
      mode: 0,         // 0 MANUAL, 1 AUTO, 2 TEST
      air: 6.6,        // the air receiver, in bar
      cab: { snack: false, clerk: false },   // what the park has bothered to install
      parts: {}        // the hardware, by id
    };
  }
  return PK.console;
}
function pkCtlGuard() {
  var C = pkCtlState();
  if (!pkCoasterOpen()) { sfx('bad'); toast('The coaster breaker is off at the park board', 'bad'); return false; }
  if (!S.coasterKey) { sfx('bad'); toast('The coaster is locked - turn the operator key on', 'bad'); return false; }
  if (!C.on) { sfx('bad'); toast('The console is dead - turn the power on', 'bad'); return false; }
  return true;
}

// ── The coaster's control desk ───────────────────────────────────────
// One group at the top of the world: the editor selects, moves and turns the whole console as
// one item, and nothing on the fascia can be nudged out of place on its own.
// at: where the desk stands and which way it faces ({ x, z, ry }; its front, the operator's side, is local +z). Every part
// hangs off one group, so the whole desk is placed and turned as one.
// The BELL is a call bell, not the dispatch chime: three quick trings, then a second and a third
// burst. The last strike starts at two seconds and rings on after it, so one press is heard for
// well over two seconds. It uses the engine's own bell voice, so the sound setting and volume
// still apply.
SFX.pkCallBell = function (t) {
  var ring = [0, 0.16, 0.32, 0.84, 1.00, 1.16, 1.68, 1.84, 2.00];
  for (var i = 0; i < ring.length; i++) SFX.bell(t + ring[i]);
};
SFX.pkCallBell.ringSeconds = 2.6;
function pkBuildCoasterConsole(at) {
  pkCtlStart();
  var C = pkCtlState();
  if (C.built) return C;
  C.built = true;
  var M = pkCtlM();
  at = at || { x: 14.30, z: -3.50, ry: 0 };
  var G = new THREE.Group(); G.position.set(at.x, 0, at.z); G.rotation.y = at.ry || 0; scene.add(G);
  var CX = 0, CZ = 0, TOP = 0.91, PW = 2.60, PH = 0.72, TILT = 0.52;

  // ── the cabinet: a steel pedestal with two doors, a kick plate and a vent ──
  pkBevelBox(2.72, 0.84, 0.68, M.case, CX, 0.43, CZ, G, 0.025);
  pkBevelBox(2.78, 0.05, 0.72, M.face, CX, TOP - 0.025, CZ, G, 0.012);
  pkBevelBox(2.72, 0.14, 0.03, M.well, CX, 0.08, CZ + 0.345, G, 0.008);
  [-0.69, 0.69].forEach(function (dx) {
    pkBevelBox(1.22, 0.52, 0.022, M.face, CX + dx, 0.46, CZ + 0.344, G, 0.008);
    pkBevelBox(0.28, 0.045, 0.035, MAT.chrome, CX + dx, 0.62, CZ + 0.365, G, 0.008);
  });
  // a vent grille low on the right, and the maker's plate on the cabinet
  for (var v = 0; v < 5; v++) pkBevelBox(0.34, 0.016, 0.014, M.well, CX + 0.96, 0.20 + v * 0.045, CZ + 0.352, G, 0.004);
  pkSign3D(['PARK CO', 'COASTER CONTROL'], 0.62, 0.20, CX - 0.72, 0.40, CZ + 0.365, 0, { bg: '#1b232c', fg: '#e8e4d8' }, G);

  // ── the fascia ──
  // The flagship's own plate (part 14, the booth panels, has the styles): three fields. DRIVE: the crest and the maker's
  // plate, the four lamps, the three dials, master power, panel lamps and the mode knob. CONTROL: the eight buttons over the
  // train and station mimic, every seat of the train, its restraints car by car, the platform gates and the air that works
  // them. DISPATCH: the stop, the operator key, the telemetry strip, the READY lamp and the lever. The track itself is on the
  // mimic board on the wall (part 03).
  var SS = pkPnStyles(), ST = SS.flagship; pkPnCaps();
  var B = [
    ['gates', 'GATES', 'green', -0.28, 0.245],
    ['barsDown', 'BARS DN', 'amber', -0.04, 0.245],
    ['barsUp', 'BARS UP', 'white', 0.20, 0.245],
    ['station', 'STN GATES', 'white', 0.44, 0.245],
    ['reset', 'RESET', 'white', -0.28, 0.105],
    ['test', 'TEST RUN', 'blue', -0.04, 0.105],
    ['maint', 'MAINT', 'amber', 0.20, 0.105],
    ['horn', 'BELL', 'white', 0.44, 0.105]
  ];
  var GA = [
    ['speed', 'SPEED', 'km/h', 0, 80, 0.80, -1.14],
    ['air', 'AIR', 'bar', 0, 10, 0.72, -0.88],
    ['load', 'LOAD', 'riders', 0, 12, 0.90, -0.62]
  ];
  var LA = [['power', 'POWER'], ['gate', 'GATES'], ['bars', 'BARS'], ['fault', 'FAULT']];
  var LAX = [-1.17, -1.0, -0.83, -0.66];
  var MW = { x0: -0.44, x1: 0.60, y0: -0.345, y1: -0.005 };   // the train and station mimic's window
  // the mimic's layout: three cars nose to tail along the platform, the gates under them, the air plant to the right
  var CARW = 0.17, CARH = 0.085, CAR0 = MW.x0 + 0.05, CARY = MW.y0 + 0.2, PNX = MW.x0 + 0.72;
  var carX = function (i) { return CAR0 + (PK.cars.length - 1 - i) * (CARW + 0.035); };   // the lead car on the right, as the train runs
  var serial = pkPnSerial('coaster');

  var P = pkCtlPanel({
    w: PW, h: PH, x: CX, y: TOP + (PH / 2) * Math.cos(TILT), z: CZ + 0.31 - (PH / 2) * Math.sin(TILT),
    tilt: -TILT, key: 'pk-coaster-desk', parent: G,
    paint: function (c, W, H) { ST.base(c, W, H); }, rim: ST.rim, glow: ST.glow,
    draw: function (c, W, H) {
      var R = pkCtlRuler(W, H, PW, PH), i; R.c = c;
      pkPnZone(R, ST, -1.29, -0.35, -0.47, 0.35);
      pkPnZone(R, ST, -0.46, -0.35, 0.62, 0.35, 'CONTROL');
      pkPnZone(R, ST, 0.63, -0.35, 1.29, 0.35, 'DISPATCH');
      // who it is
      var cx = R.X(-1.215), cy = R.Y(0.285), cr = R.L(0.046);
      c.save(); c.beginPath(); c.arc(cx, cy, cr * 1.08, 0, 6.2832); c.fillStyle = ST.zone2; c.fill(); c.lineWidth = R.L(0.003); c.strokeStyle = ST.acc; c.stroke(); c.restore();
      c.save(); c.beginPath(); c.arc(cx, cy, cr * 0.96, 0, 6.2832); c.clip(); PK_PN_CRESTS.coaster(c, cx, cy, cr * 0.9, ST); c.restore();
      pkPnText(R, ST, 'The Coaster', -1.15, 0.302, 0.036, { align: 'left', font: ST.head, max: 0.6 });
      pkPnText(R, ST, 'PARK CO FLAGSHIP  ·  LIFT, LOOP AND CORKSCREW  ·  STATION 01', -1.15, 0.262, 0.0125, { align: 'left', col: ST.dim, max: 0.66 });
      pkPnText(R, ST, 'LINDENBURG RIDE WORKS  ·  ' + serial + '  ·  400 V 3~ 50 HZ', -1.15, 0.24, 0.0105, { align: 'left', col: ST.dim, max: 0.66 });
      for (i = 0; i < LA.length; i++) pkPnText(R, ST, LA[i][1], LAX[i], 0.138, 0.0145, { col: ST.dim });
      pkPnText(R, ST, 'MASTER', -1.15, -0.322, 0.0145, { col: ST.dim });
      pkPnText(R, ST, 'PANEL LAMPS', -0.92, -0.322, 0.0145, { col: ST.dim });
      pkPnText(R, ST, 'MODE', -0.64, -0.322, 0.0145, { col: ST.dim });
      pkPnText(R, ST, 'MAN', -0.712, -0.2, 0.0095, { col: ST.dim, align: 'right' }); pkPnText(R, ST, 'AUTO', -0.64, -0.158, 0.0095, { col: ST.dim }); pkPnText(R, ST, 'TEST', -0.568, -0.2, 0.0095, { col: ST.dim, align: 'left' });
      // the buttons' names under them
      for (i = 0; i < B.length; i++) pkPnText(R, ST, B[i][1], B[i][3], B[i][4] - 0.062, 0.0165, { max: 0.2 });
      // the train and station mimic
      c.save(); pkPnRect(R, MW.x0, MW.y0, MW.x1, MW.y1, 0.008); c.fillStyle = ST.win; c.fill(); c.clip();
      for (var gx = MW.x0; gx < MW.x1; gx += 0.02) pkPnLine(R, [[gx, MW.y0], [gx, MW.y1]], ST.grid, 0.0007);
      for (var gy = MW.y0; gy < MW.y1; gy += 0.02) pkPnLine(R, [[MW.x0, gy], [MW.x1, gy]], ST.grid, 0.0007);
      pkPnText(R, ST, 'TRAIN AND STATION', MW.x0 + 0.012, MW.y1 - 0.016, 0.011, { align: 'left', col: ST.dim });
      // the platform edge, the rails under the train, the direction of travel
      var x0 = CAR0 - 0.02, x1 = carX(0) + CARW + 0.03;
      pkPnLine(R, [[x0, CARY - 0.012], [x1, CARY - 0.012]], 'rgba(200,215,230,0.55)', 0.0022);
      pkPnLine(R, [[x0, CARY - 0.019], [x1, CARY - 0.019]], 'rgba(200,215,230,0.35)', 0.0014);
      c.save(); c.fillStyle = 'rgba(201,162,39,0.25)'; c.fillRect(R.X(x0), R.Y(CARY - 0.05), R.L(x1 - x0), R.L(0.012)); c.restore();
      pkPnText(R, ST, 'PLATFORM', x0 + 0.004, CARY - 0.064, 0.009, { align: 'left', col: ST.dim });
      pkPnText(R, ST, 'TRAVEL  >', x1 - 0.004, CARY + CARH + 0.03, 0.009, { align: 'right', col: ST.dim });
      for (i = 0; i < PK.cars.length; i++) {
        var X0 = carX(i);
        c.save(); pkPnRect(R, X0, CARY, X0 + CARW, CARY + CARH, 0.014); c.fillStyle = 'rgba(80,140,220,0.16)'; c.fill(); c.strokeStyle = 'rgba(200,220,255,0.7)'; c.lineWidth = R.L(0.002); c.stroke(); c.restore();
        pkPnText(R, ST, 'CAR ' + (i + 1) + (i === 0 ? '  LEAD' : ''), X0 + CARW / 2, CARY + CARH + 0.014, 0.0095, { col: ST.ink });
        pkPnText(R, ST, 'BAR', X0 + CARW - 0.028, CARY - 0.03, 0.0085, { col: ST.dim });
        pkPnText(R, ST, 'GATE ' + (i + 1), X0 + 0.04, CARY - 0.03, 0.0085, { col: ST.dim });
      }
      // the air plant: compressor, receiver, the brake and gate valves, piped up
      var ax = PNX, ay = MW.y0 + 0.07;
      pkPnText(R, ST, 'PNEUMATICS', ax + 0.1, MW.y1 - 0.016, 0.011, { col: ST.dim });
      c.save(); c.strokeStyle = 'rgba(255,207,90,0.6)'; c.lineWidth = R.L(0.0025);
      c.beginPath(); c.arc(R.X(ax + 0.025), R.Y(ay + 0.16), R.L(0.022), 0, 6.2832); c.stroke();
      pkPnRect(R, ax + 0.07, ay + 0.13, ax + 0.18, ay + 0.19, 0.02); c.stroke();
      c.restore();
      pkPnText(R, ST, 'COMP', ax + 0.025, ay + 0.122, 0.0085, { col: ST.dim });
      pkPnText(R, ST, 'RECEIVER', ax + 0.125, ay + 0.118, 0.0085, { col: ST.dim });
      pkPnLine(R, [[ax + 0.047, ay + 0.16], [ax + 0.07, ay + 0.16]], 'rgba(255,207,90,0.6)', 0.0025);
      pkPnLine(R, [[ax + 0.18, ay + 0.16], [ax + 0.21, ay + 0.16], [ax + 0.21, ay + 0.02], [ax + 0.02, ay + 0.02]], 'rgba(255,207,90,0.6)', 0.0025);
      [['BRAKES', ax + 0.05], ['GATES', ax + 0.12], ['BARS', ax + 0.19]].forEach(function (v) { pkPnLine(R, [[v[1], ay + 0.02], [v[1], ay + 0.055]], 'rgba(255,207,90,0.6)', 0.0025); pkPnText(R, ST, v[0], v[1], ay - 0.002, 0.0085, { col: ST.dim }); });
      pkPnText(R, ST, '6.9 BAR  ·  MIN 5.5', ax + 0.125, ay + 0.21, 0.0085, { col: ST.dim });
      c.restore();
      c.save(); pkPnRect(R, MW.x0, MW.y0, MW.x1, MW.y1, 0.008); c.strokeStyle = ST.edge; c.lineWidth = R.L(0.003); c.stroke(); c.restore();
      // dispatch
      pkPnText(R, ST, 'EMERGENCY STOP', 0.80, 0.093, 0.0175, { col: '#ff8a7a' });
      pkPnText(R, ST, 'turn to release', 0.80, 0.072, 0.012, { col: ST.dim, weight: '600' });
      pkPnText(R, ST, 'OPERATOR KEY', 1.14, 0.152, 0.0145, { col: ST.acc });
      pkPnText(R, ST, 'OFF', 1.095, 0.282, 0.012, { col: ST.dim }); pkPnText(R, ST, 'ON', 1.19, 0.282, 0.012, { col: '#5fd38d' });
      pkPnText(R, ST, 'READY', 1.15, -0.098, 0.013, { col: '#5fd38d' });
      pkPnText(R, ST, 'DISPATCH', 1.15, -0.25, 0.019, { col: ST.ink });
      pkPnText(R, ST, 'PULL', 1.15, -0.282, 0.012, { col: ST.dim });
      // a hazard band along the foot of the dispatch field
      var hy = R.Y(-0.334), hh = R.L(0.012);
      c.save(); c.beginPath(); c.rect(R.X(0.645), hy, R.L(0.63), hh); c.clip();
      c.fillStyle = '#151a1e'; c.fillRect(R.X(0.645), hy, R.L(0.63), hh); c.fillStyle = '#c9a227';
      for (var hz = 0; hz < 40; hz++) { var hx0 = R.X(0.645) + hz * R.L(0.024); c.beginPath(); c.moveTo(hx0, hy + hh); c.lineTo(hx0 + R.L(0.012), hy + hh); c.lineTo(hx0 + R.L(0.012) + hh, hy); c.lineTo(hx0 + hh, hy); c.closePath(); c.fill(); }
      c.restore();
    }
  });
  pkCtlSetPower(P, pkCoasterOpen);

  // hardware, in the order a hand would find it
  var gauges = {}, lamps = {}, buttons = {};
  for (var gi = 0; gi < GA.length; gi++) {
    var gd = GA[gi];
    gauges[gd[0]] = pkCtlGauge(P, gd[6], 0.0, {
      id: gd[0], label: gd[1], unit: gd[2], min: gd[3], max: gd[4], red: gd[5], ticks: 8, r: 0.09, dial: ST.dial,
      get: gd[0] === 'speed' ? function () { return (PK.ride.v || 0) * 3.6 / 80; }
        : gd[0] === 'air' ? function () { return pkCtlState().air / 10; }
        : function () { return PK.seats.length ? PK.ride.riders / PK.seats.length : 0; }
    });
  }
  for (var li = 0; li < LA.length; li++) {
    lamps[LA[li][0]] = pkCtlLamp(P, LAX[li], 0.178, { id: LA[li][0], r: 0.02, col: li === 0 ? 0x5fd38d : li === 3 ? 0xff4d3d : 0xf0c04a });
  }
  for (var bi = 0; bi < B.length; bi++) {
    var bd = B[bi];
    buttons[bd[0]] = pkCtlBtn(P, bd[3], bd[4], {
      id: bd[0], label: bd[1], col: bd[2], r: 0.038,
      lampCol: bd[2] === 'green' ? 0x5fd38d : bd[2] === 'amber' ? 0xf0c04a : bd[2] === 'blue' ? 0x5aa9ff : 0xe8e4d8,
      prompt: 'Press ' + bd[1],
      act: function () {
        if (!pkCtlGuard()) return;
        var id = this.id;
        if (id === 'gates') return pkGatesToggle();
        if (id === 'barsDown') return pkBarsDown();
        if (id === 'barsUp') return pkBarsUp();
        if (id === 'station') return pkStationGates();
        if (id === 'reset') return pkReset();
        if (id === 'test') return pkTestRun();
        if (id === 'maint') return pkService();
        if (id === 'horn') { sfx('pkCallBell'); return true; }
      }
    });
  }
  // the buttons carry a live lamp: green when the thing they do is ready
  var toggles = {};
  toggles.powerSw = pkCtlToggle(P, -1.15, -0.225, {
    id: 'powerSw', on: true, prompt: 'Master power',
    act: function (on) {
      C.on = on; sfx('click');
      toast(on ? 'Console live' : 'Console dead', on ? 'good' : 'bad');
    }
  });
  toggles.lampSw = pkCtlToggle(P, -0.92, -0.225, {
    id: 'lampSw', on: true, prompt: 'Panel lamps',
    act: function (on) { C.lamps = on; PK.consoleLamps = on; sfx('click'); }
  });
  var mode = pkCtlRotary(P, -0.64, -0.235, {
    id: 'mode', n: 3, pos: S.auto ? 1 : 0, r: 0.040, names: ['MANUAL', 'AUTO', 'TEST'],
    prompt: 'Mode selector',
    act: function (pos) {
      C.mode = pos;
      if (pos === 2) { pkSetAuto(false); toast('Mode: test run', ''); }
      else pkSetAuto(pos === 1);
    }
  });
  var stop = pkCtlMushroom(P, 0.80, 0.215, {
    id: 'estop', r: 0.070, prompt: 'Emergency stop',
    act: function () { pkStop(); },
    release: function () { pkReset(); }
  });
  var lever = pkCtlLever(P, 0.79, -0.21, {
    id: 'throttle', len: 0.15, col: 'black', prompt: 'Pull the dispatch lever',
    act: function () { if (!pkCtlGuard()) return; if (C.mode === 2) pkTestRun(); else pkDispatch(); }
  });

  var key = pkCtlKey(P, 1.14, 0.225, { id: 'opKey', on: !!S.coasterKey, label: 'Coaster operator key',
    act: function (on) { return pkSetCoasterKey(on); } });
  // the train and station mimic's live parts: a lamp per seat, per restraint and per gate, the air plant's valves
  var seatPips = PK.seats.map(function (st, k) {
    var ci = st.car, n = k - ci * 4, X0 = carX(ci);
    var p = pkPnPip(P, 0.011, 0xffd27a); p.set(X0 + 0.03 + (n >> 1) * 0.06, CARY + 0.025 + (n & 1) * 0.035); return p;
  });
  var barLeds = PK.cars.map(function (cr, i) { return pkPnLed(P, carX(i) + CARW - 0.028, CARY - 0.03 + 0.017, { col: 0xf0c04a, r: 0.0085 }); });
  var gateLeds = PK.gates.map(function (gt, i) { return pkPnLed(P, carX(i) + 0.04, CARY - 0.03 + 0.017, { col: 0x5fd38d, r: 0.0085 }); });
  var trainHome = pkPnLed(P, MW.x0 + 0.16, MW.y1 - 0.016, { col: 0x5fd38d, r: 0.008 });
  var airLeds = { comp: pkPnLed(P, PNX + 0.025, MW.y0 + 0.23, { col: 0x5fd38d, r: 0.009 }), brakes: pkPnLed(P, PNX + 0.05, MW.y0 + 0.125 + 0.0, { col: 0xff6b5e, r: 0.0085 }),
    gates: pkPnLed(P, PNX + 0.12, MW.y0 + 0.125, { col: 0x5fd38d, r: 0.0085 }), bars: pkPnLed(P, PNX + 0.19, MW.y0 + 0.125, { col: 0xf0c04a, r: 0.0085 }) };
  // the receiver's gauge glass: a bar that fills with the pressure
  var rcvBar = new THREE.Group(); rcvBar.userData.dynamic = true; rcvBar.position.set(PNX + 0.075, MW.y0 + 0.07 + 0.16, 0.004); P.add(rcvBar);
  var rcvM = pkPnGlow(0x8fc3ff); var rcv = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.018), rcvM); rcv.position.x = 0.5; rcvBar.add(rcv);
  var tele = pkCtlReadout(P, 0.96, 0.0, 0.6, 0.085, { col: ST.tele, bg: '#040506' });
  var ready = pkPnLed(P, 1.15, -0.14, { col: 0x5fd38d, r: 0.022 });
  C.parts = { gauges: gauges, lamps: lamps, buttons: buttons, toggles: toggles, mode: mode, stop: stop, lever: lever, key: key, panel: P, seats: seatPips, tele: tele, ready: ready };
  var pv = null, pvV = new THREE.Vector3(), gLoad = 1, prevVel = new THREE.Vector3(), velNow = new THREE.Vector3(), ymin = 1e9;
  for (var yi = 0; yi < 120; yi++) ymin = Math.min(ymin, PK.curve.getPointAt(yi / 120).y);
  pkCtlLive({ tick: function (dt) {
    var R = PK.ride, live = C.on && !!S.coasterKey && pkCoasterOpen(), home = R.state !== 'running' && R.state !== 'dispatch' && R.state !== 'arrive';
    PK.seats.forEach(function (st, k) { pkPnPipLight(seatPips[k], !pkCoasterOpen() ? 0 : st.guest ? 1 : (home ? 0.14 : 0.05), Math.max(1e-3, dt)); });
    barLeds.forEach(function (l) { l.on = live ? (R.bars > 0.5 ? true : R.barsWant > 0.5 ? 'flash' : 'dim') : false; });
    gateLeds.forEach(function (l, i) { var gt = PK.gates[i]; l.on = live ? (gt.open ? true : 'dim') : false; l.mat.emissive.setHex(gt.open ? 0x5fd38d : 0xff6b5e); });
    trainHome.on = live && home;
    var moving = R.state === 'dispatch' || R.state === 'running';
    airLeds.comp.on = live ? (C.air < 6.7 ? 'flash' : 'dim') : false;
    airLeds.brakes.on = live && (home || R.state === 'arrive'); airLeds.gates.on = live && PK.gates.some(function (gt) { return gt.open; }); airLeds.bars.on = live && R.barsWant > 0.5;
    rcvBar.scale.x = Math.max(0.001, 0.1 * clamp(C.air / 10, 0, 1)); rcvM.emissiveIntensity = live ? 0.9 : 0.03;
    // dispatch: the same order pkDispatch asks for
    var ok = live && !R.fault && R.state === 'ready' && !pkStillBoarding() && (S.wear || 0) < 90 && !(PK.closed && R.riders === 0);
    ready.on = ok ? (S.auto ? true : 'flash') : false;
    // the telemetry: speed, height and the load, from the lead car
    var car = PK.cars[0];
    if (car && dt > 0) {
      if (pv) { velNow.copy(car.position).sub(pv).divideScalar(dt); var acc = velNow.clone().sub(prevVel).divideScalar(dt); prevVel.copy(velNow); var g2 = Math.sqrt(acc.x * acc.x + (acc.y + 9.81) * (acc.y + 9.81) + acc.z * acc.z) / 9.81; if (!isFinite(g2) || g2 > 7 || !moving) g2 = 1; gLoad += (g2 - gLoad) * Math.min(1, dt * 2.5); }
      else pv = new THREE.Vector3();
      pv.copy(car.position);
    }
    tele.setPower(live);
    if (!pkCoasterOpen()) { tele.set(['NO POWER', 'BREAKER OFF']); return; }
    if (!live) { tele.set([!S.coasterKey ? 'KEY OFF' : 'CONSOLE DEAD', 'TELEMETRY STANDBY']); return; }
    tele.set(['V ' + ('  ' + ((R.v || 0) * 3.6).toFixed(1)).slice(-5) + ' KM/H  H ' + Math.max(0, car ? car.position.y - ymin : 0).toFixed(1) + ' M',
      'G ' + gLoad.toFixed(1) + '  AIR ' + C.air.toFixed(1) + '  WEAR ' + Math.round(S.wear || 0) + '%']);
  } });

  // ── the status bank: where the train is on the track, and the counts ──
  // the mimic's sections start at points on the track, laid in lap order from the station
  var HB = pkCtlHood(G, CX, TOP + PH * Math.cos(TILT) + 0.16, CZ + 0.31 - PH * Math.sin(TILT) - 0.06, 2.44, 0.22, 0.2);
  var at0 = function (x, z) { return ((pkCoUAt(PK.curve, x, z) - PK.stationU) % 1 + 1) % 1; };
  var SEC = [['STATION', 0], ['LIFT', ((PK.liftU[0] - PK.stationU) % 1 + 1) % 1], ['DROP\nLOOP', ((PK.liftU[1] - PK.stationU) % 1 + 1) % 1],
    ['TURN\nHILLS', at0(-12.4, -28.9)], ['CORK-\nSCREW', at0(16, -28.3)], ['BRAKES', at0(-9, -28.3)], ['STATION', at0(-19, -14)]];
  PK.coasterSections = SEC;   // the wall's track display (part 03) names the same sections
  var mimic = [];
  for (var si = 0; si < 6; si++) mimic.push(pkCtlAnnun(HB, -1.08 + si * 0.2, 0, 0.18, 0.12, SEC[si][0], { col: si === 0 ? '#5fd38d' : si === 5 ? '#ff9a52' : '#8fc3ff' }));
  var ro = pkCtlReadout(HB, 0.62, -0.025, 1.0, 0.13), lapT = 0, lastLap = 0;
  pkPnHoodPlate(HB, ST, { title: 'The Coaster' }, 0.62, 0.08);
  C.parts.mimic = mimic; C.parts.readout = ro;
  pkCtlLive({
    tick: function (dt) {
      var R = PK.ride, live = C.on && !!S.coasterKey && pkCoasterOpen(), d = ((R.u - PK.stationU) % 1 + 1) % 1, k = 0;
      for (var i = 1; i < SEC.length; i++) if (d >= SEC[i][1]) k = i;
      if (k === 6) k = 0;
      for (var j = 0; j < 6; j++) mimic[j].on = live && j === k;
      if (R.state === 'running') lapT += dt; else if (lapT > 0) { lastLap = lapT; lapT = 0; }
      PK.lastLap = lastLap; PK.lapT = lapT;
      ro.setPower(live);
      if (!live) { ro.set(['NO POWER', 'BREAKER OFF']); return; }
      ro.set(['SPEED ' + ('  ' + Math.round((R.v || 0) * 3.6)).slice(-3) + ' KM/H  LAP ' + ('  ' + Math.round(lapT || lastLap)).slice(-3) + 's',
        'RIDE ' + R.riders + '/' + PK.seats.length + '   QUEUE ' + pkQueueWaiting()]);
    }
  });

  // ── the desk keeps itself in step with the ride ──
  var airT = 0;
  pkCtlLive({
    tick: function (dt) {
      var R = PK.ride, live = C.on && !!S.coasterKey && pkCoasterOpen();
      if (key.on !== !!S.coasterKey) key.set(!!S.coasterKey);
      airT += dt;
      var wantAir = (R.state === 'dispatch' || R.state === 'running') ? 5.9 : 6.9;
      C.air += (wantAir - C.air) * Math.min(1, dt * 0.8);
      if (airT > 0.25) { airT = 0; }
      // the mode knob follows the game when AUTO is set elsewhere
      if (C.mode !== 2 && mode.pos !== (S.auto ? 1 : 0)) mode.set(S.auto ? 1 : 0, true);
      // lamps
      lamps.power.on = live && !PK.closed;
      lamps.gate.on = live && PK.gates.length > 0 && !!PK.gates[0].open;
      lamps.bars.on = live && (R.barsWant > 0.5);
      lamps.fault.on = live && (!!R.fault || (S.wear || 0) >= 90);
      // button lamps say what is ready to press
      var ready = live && !R.fault;
      buttons.gates.setLit(ready && (R.state === 'idle' || R.state === 'unload'));
      buttons.barsDown.setLit(ready && R.barsWant < 0.5);
      buttons.barsUp.setLit(ready && R.barsWant > 0.5);
      buttons.station.setLit(ready && !pkStnOpen());   // lit while the station gates are shut, like the ride desks
      buttons.reset.setLit(live && !!R.fault);
      buttons.test.setLit(ready && R.state === 'idle');
      buttons.maint.setLit(live && (S.wear || 0) > 0);
      if (toggles.powerSw.on !== C.on) toggles.powerSw.set(C.on);
      if (toggles.lampSw.on !== C.lamps) toggles.lampSw.set(C.lamps);
      // the stop stays latched while the ride is faulted
      if (stop.latched !== !!R.fault) stop.setLatched(!!R.fault);
    }
  });
  // the console is a fixture of the room: it is solid so nobody walks through the doors
  var rc = Math.abs(Math.cos(at.ry || 0)), rs = Math.abs(Math.sin(at.ry || 0)), hx = 1.36 * rc + 0.34 * rs, hz = 1.36 * rs + 0.34 * rc;
  solid(at.x - hx, at.x + hx, at.z - hz, at.z + hz, 0, 0.95);
  return C;
}

// ── The status bank ──────────────────────────────────────────────────
// A hooded bank that stands on the back of a desk above its fascia, the way a real ride desk carries its annunciator: a
// row of backlit legend windows that light (or flash) with the ride's state, and an LED readout of the counts. Built in
// the parent's frame facing +z, leaning back a little toward the operator's eye.
var PK_ANN_TEX = {};
function pkCtlAnnTex(label, col) {
  var key = label + '|' + col;
  if (PK_ANN_TEX[key]) return PK_ANN_TEX[key];
  var t = tex(256, 128, function (c, W, H) {
    var g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0.0)');
    c.fillStyle = col; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(255,255,255,0.10)'; c.fillRect(0, 0, W, H * 0.45);
    c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 6; c.strokeRect(3, 3, W - 6, H - 6);
    c.fillStyle = '#111417'; c.textAlign = 'center'; c.textBaseline = 'middle';
    var lines = label.split('\n'), fs = lines.length > 1 ? 40 : 50;
    c.font = '800 ' + fs + 'px Bahnschrift, "Segoe UI", Arial, sans-serif';
    lines.forEach(function (ln, i) { c.fillText(ln, W / 2, H / 2 + (i - (lines.length - 1) / 2) * fs * 1.05); });
  });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return (PK_ANN_TEX[key] = t);
}
// one legend window: o.col the glass colour ('#f0c04a'), o.flash to blink while lit
function pkCtlAnnun(g, x, y, w, h, label, o) {
  o = o || {};
  var M = pkCtlM(), map = pkCtlAnnTex(label, o.col || '#f0c04a');
  pkBevelBox(w + 0.014, h + 0.014, 0.014, M.bezel, x, y, 0.004, g, 0.003);
  var mat = new THREE.MeshStandardMaterial({ map: map, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 0.05, roughness: 0.3, metalness: 0.05 });
  var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, 0.0115); g.add(m);
  var api = { label: label, on: false, mat: mat, level: 0, t: 0 };
  pkCtlLive({
    tick: function (dt) {
      api.t += dt;
      var want = api.on ? (o.flash && api.on === 'flash' && Math.sin(api.t * 9) < 0 ? 0.25 : 1) : 0;
      api.level += (want - api.level) * Math.min(1, dt * 14);
      mat.emissiveIntensity = api.level * 1.0;                  // dark glass when off, lit from behind when on
      mat.color.setScalar(0.12 + api.level * 0.88);
    }
  });
  return api;
}
// an LED readout: a recessed window of green segments behind smoked glass. set(text) redraws only when the text changes
function pkCtlReadout(g, x, y, w, h, o) {
  o = o || {};
  var M = pkCtlM(), cv = document.createElement('canvas'); cv.width = 512; cv.height = Math.round(512 * h / w);
  var t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  pkBevelBox(w + 0.03, h + 0.03, 0.02, M.bezel, x, y, 0.004, g, 0.004);
  var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.9, roughness: 0.25 }));
  m.position.set(x, y, 0.0145); g.add(m);
  var last = null, col = o.col || '#6dff9a';
  var api = {
    set: function (lines) {
      var s = lines.join('\n'); if (s === last) return; last = s;
      var c = cv.getContext('2d'), W = cv.width, H = cv.height;
      c.fillStyle = o.bg || '#050a07'; c.fillRect(0, 0, W, H);
      // the unlit segments behind the lit ones, so it reads as a real display
      var fs = Math.floor(H / lines.length * 0.62);
      c.font = '700 ' + fs + 'px "Consolas", "Courier New", monospace'; c.textBaseline = 'middle';
      lines.forEach(function (ln, i) {
        var yy = H * (i + 0.5) / lines.length;
        c.globalAlpha = 0.08; c.fillStyle = col; c.textAlign = 'left'; c.fillText(ln.replace(/[^ ]/g, '8'), W * 0.05, yy); c.globalAlpha = 1;
        c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 10; c.fillText(ln, W * 0.05, yy); c.shadowBlur = 0;
      });
      for (var k = 0; k < H; k += 3) { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(0, k, W, 1); }
      t.needsUpdate = true;
    },
    setPower: function (on) { m.material.emissiveIntensity = on ? 0.9 : 0; }
  };
  return api;
}
// the hood itself: a steel box with a sloped cap; returns its front face group (local +z toward the operator)
function pkCtlHood(parent, x, y, z, w, h, lean) {
  var M = pkCtlM(), H = new THREE.Group(); H.position.set(x, y, z); H.rotation.order = 'YXZ'; H.rotation.x = -(lean || 0.18); parentOf(parent).add(H);
  pkBevelBox(w + 0.06, h + 0.06, 0.11, M.case, 0, 0, -0.06, H, 0.012);
  var cap = pkBevelBox(w + 0.10, 0.025, 0.16, M.face, 0, h / 2 + 0.045, -0.03, H, 0.006); cap.rotation.x = 0.25;
  pkBevelBox(w + 0.02, h + 0.02, 0.005, M.well, 0, 0, -0.002, H, 0.002);
  return H;
}

// ── The compact desk in a ride booth ────────────────────────────────
// Every ride's booth desk is its own design now: pkBoothPanel and the per-ride sheets live in part 14 (the booth panels).

// ── The park services cabinet ───────────────────────────────────────
// The coaster desk is the coaster's. Everything that belongs to the whole park - a breaker per
// ride, the park lights, the ticket window, the snack bar - lives on one steel switchboard on
// the office wall, with a supply dial, a load dial, a lamp per circuit and a breaker per ride.
var PK_CAB_RIDES = [
  ['coaster', 'THE COASTER'], ['carousel', 'CAROUSEL'], ['teacups', 'TEACUPS'], ['ferris', 'FERRIS WHEEL'],
  ['dodgems', 'DODGEMS'], ['droptower', 'DROP TOWER'], ['flume', 'LOG FLUME'], ['haunted', 'HAUNTED HOUSE'],
  ['kround', 'LITTLE ROUNDABOUT'], ['kpots', 'WOBBLY POTS'], ['kpuffin', 'PUFFIN LINE'],
  ['serpent', 'THE SERPENT'], ['baron', "BARON'S DROP"], ['nocturne', 'NOCTURNE'], ['wreck', 'THE WRECK'],
  ['moonwood', 'MOONWOOD'], ['dragon', 'THE DRAGON'], ['firebird', 'THE FIREBIRD'], ['mountain', 'THE MOUNTAIN KING']
];
var PK_CAB_PER_COL = 10;
function pkCabRideSlot(i) {
  var col = i < PK_CAB_PER_COL ? 0 : 1, row = i % PK_CAB_PER_COL;
  return { labelX: col ? 0.06 : -0.84, switchX: col ? 0.80 : -0.10, lampX: col ? 0.70 : -0.20, y: 0.400 - row * 0.112 };
}
function pkBuildParkCabinet(px, py, pz, ry) {
  pkCtlStart();
  var C = pkCtlState();
  if (C.cabinet) return C.cabinet;
  var M = pkCtlM();
  var PW = 1.78, PH = 1.86, CX = px === undefined ? -22.86 : px, CY = py === undefined ? 1.66 : py, CZ = pz === undefined ? 43.55 : pz;

  // the enclosure hangs off a holder so the whole board can be moved as one item
  var H = new THREE.Group();
  H.position.set(CX, CY, CZ); H.rotation.order = 'YXZ';
  H.rotation.y = ry === undefined ? Math.PI / 2 : ry; H.rotation.x = -0.055; scene.add(H);
  pkBevelBox(PW + 0.16, PH + 0.16, 0.13, M.case, 0, 0, -0.105, H, 0.02);
  pkBevelBox(PW + 0.24, 0.05, 0.22, M.face, 0, PH / 2 + 0.115, -0.045, H, 0.012);
  // the conduit up into the roof, and a pair of hinges down the near edge
  cyl(0.030, 0.62, MAT.steelDark, 0, PH / 2 + 0.44, -0.085, H, 10);
  cyl(0.038, 0.03, MAT.steelDark, 0, PH / 2 + 0.13, -0.085, H, 10);
  [0.55, -0.55].forEach(function (hy) {
    pkBevelBox(0.05, 0.11, 0.06, MAT.chrome, -PW / 2 - 0.055, hy, -0.02, H, 0.008);
  });

  var P = pkCtlPanel({
    w: PW, h: PH, x: 0, y: 0, z: 0, parent: H, key: 'pk-park-services',
    draw: function (c, W, H2) {
      var R2 = pkCtlRuler(W, H2, PW, PH); R2.c = c;
      R2.engrave('PARK SERVICES', 0, 0.845, 0.032);
      R2.txt('MAIN SWITCHBOARD   ·   STATION 01', 0, 0.805, 0.015, '#a6b4bc');
      // the top service strip: supply and load dials, the two lighting circuits, the window, the snack bar and the gate
      R2.box(0, 0.635, 1.70, 0.27, 'rgba(0,0,0,0.20)', 0.005);
      R2.txt('PARK LIGHTS', -0.25, 0.725, 0.012, '#d6dee3');
      R2.txt('RIDE LIGHTS', 0.01, 0.725, 0.012, '#d6dee3');
      R2.txt('TICKET', 0.27, 0.725, 0.012, '#d6dee3');
      R2.txt('SNACK', 0.53, 0.725, 0.012, '#d6dee3');
      R2.txt('GATE', 0.76, 0.725, 0.012, '#d6dee3');
      // the breakers: two columns, ten rows on the left and nine on the right
      R2.box(-0.46, -0.11, 0.82, 1.14, 'rgba(0,0,0,0.20)', 0.005);
      R2.box(0.46, -0.11, 0.82, 1.14, 'rgba(0,0,0,0.20)', 0.005);
      R2.txt('RIDE BREAKERS', 0, 0.475, 0.014, '#a6b4bc');
      for (var i = 0; i < PK_CAB_RIDES.length; i++) {
        var rs = pkCabRideSlot(i);
        R2.txt(PK_CAB_RIDES[i][1], rs.labelX, rs.y, 0.015, '#eef2f4', 'left');
      }
      R2.txt('UP = OPEN   ·   DOWN = SHUT', 0, -0.710, 0.013, '#8f9ca4');
      R2.txt('ISOLATE BEFORE SERVICE', 0, -0.748, 0.012, '#7d8a96');
      // a hazard strip along the bottom lip
      var hy = R2.Y(-0.885), hh = R2.L(0.022);
      c.save();
      c.beginPath(); c.rect(R2.X(-0.89), hy, R2.L(1.78), hh); c.clip();
      c.fillStyle = '#151a1e'; c.fillRect(R2.X(-0.89), hy, R2.L(1.78), hh);
      c.fillStyle = '#c9a227';
      for (var hz = 0; hz < 42; hz++) {
        var x0 = R2.X(-0.89) + hz * R2.L(0.046);
        c.beginPath(); c.moveTo(x0, hy + hh); c.lineTo(x0 + R2.L(0.020), hy + hh);
        c.lineTo(x0 + R2.L(0.020) + hh, hy); c.lineTo(x0 + hh, hy); c.closePath(); c.fill();
      }
      c.restore();
    }
  });

  var parts = { rides: {}, lamps: {}, gauges: {} };
  for (var i = 0; i < PK_CAB_RIDES.length; i++) {
    var rid = PK_CAB_RIDES[i][0], rs = pkCabRideSlot(i);
    parts.rides[rid] = pkCtlToggle(P, rs.switchX, rs.y, {
      id: 'ride_' + rid, on: true, prompt: PK_CAB_RIDES[i][1] + ' breaker',
      onName: 'open', offName: 'shut',
      act: function (on) { return pkSetRideOpen(this.id.slice(5), on); }
    });
    parts.lamps[rid] = pkCtlLamp(P, rs.lampX, rs.y, { id: 'lamp_' + rid, r: 0.011, col: 0x5fd38d });
  }
  parts.gauges.supply = pkCtlGauge(P, -0.77, 0.635, {
    id: 'supply', label: 'SUPPLY', unit: 'volts', min: 0, max: 300, red: 0.88, ticks: 6, r: 0.075,
    get: function () { return 0.82; }
  });
  parts.gauges.load = pkCtlGauge(P, -0.57, 0.635, {
    id: 'load', label: 'LOAD', unit: 'amps', min: 0, max: 60, red: 0.85, ticks: 6, r: 0.075,
    get: function () {
      var n = 0;
      for (var i = 0; i < PK_CAB_RIDES.length; i++) {
        var rid = PK_CAB_RIDES[i][0], at = PK.attrById && PK.attrById[rid];
        if (rid === 'coaster' ? pkCoasterOpen() : (at && at.open)) n++;
      }
      return 0.10 + (n / PK_CAB_RIDES.length) * 0.72;
    }
  });
  parts.lamps.mains = pkCtlLamp(P, -0.43, 0.665, { id: 'mains', r: 0.018, col: 0x5fd38d });
  parts.lamps.park = pkCtlLamp(P, -0.43, 0.600, { id: 'park', r: 0.018, col: 0xf0c04a });
  parts.gate = pkCtlToggle(P, 0.76, 0.635, {
    id: 'gate', on: !!S.gateOpen, prompt: 'The park gate', onName: 'open', offName: 'shut',
    act: function (on) { pkGateToggle(); return true; }
  });

  parts.lights = pkCtlToggle(P, -0.25, 0.635, {
    id: 'parkLights', on: !!S.lights, prompt: 'Park lights', onName: 'on', offName: 'off',
    act: function (on) {
      S.lights = on; PK.lights = on;
      sfx('click'); toast('Park lights ' + (on ? 'on' : 'off'), on ? 'good' : '');
      logEvent('Park lights ' + (on ? 'on' : 'off'), '');
      screenDirtyAll(); hudDirty = true; return true;
    }
  });
  parts.rideLights = pkCtlToggle(P, 0.01, 0.635, {
    id: 'rideLights', on: !!S.rideLights, prompt: 'Ride lights', onName: 'on', offName: 'off',
    act: function (on) {
      S.rideLights = on; PK.rideLights = on;
      sfx('click'); toast('Ride lights ' + (on ? 'on' : 'off'), on ? 'good' : '');
      logEvent('Ride lights ' + (on ? 'on' : 'off'), '');
      screenDirtyAll(); hudDirty = true; return true;
    }
  });
  parts.ticket = pkCtlToggle(P, 0.27, 0.635, {
    id: 'ticket', on: !!S.clerk, prompt: 'Ticket window', onName: 'staffed', offName: 'shut',
    act: function (on) {
      if (on && !C.cab.clerk) { sfx('bad'); toast('No clerk on the payroll', 'bad'); return false; }
      S.clerk = on; PK.clerk = on;
      sfx('click'); toast('Ticket window ' + (on ? 'staffed' : 'shut'), on ? 'good' : '');
      logEvent('Ticket window ' + (on ? 'staffed' : 'shut'), ''); screenDirtyAll(); hudDirty = true; return true;
    }
  });
  parts.snack = pkCtlToggle(P, 0.53, 0.635, {
    id: 'snack', on: !!S.snackOpen, prompt: 'Snack bar', onName: 'serving', offName: 'shut',
    act: function (on) {
      if (on && !C.cab.snack) { sfx('bad'); toast('The snack stand is not built yet', 'bad'); return false; }
      S.snackOpen = on; PK.snackOpen = on;
      sfx('click'); toast('Snack bar ' + (on ? 'serving' : 'shut'), on ? 'good' : '');
      logEvent('Snack bar ' + (on ? 'open' : 'shut'), ''); screenDirtyAll(); hudDirty = true; return true;
    }
  });

  pkCtlLive({
    tick: function (dt) {
      // a service counts as installed once the park has unlocked or opened it anywhere else
      if (S.snackOpen || (PK.level || 1) >= 2) C.cab.snack = true;
      if (S.clerk) C.cab.clerk = true;
      for (var i = 0; i < PK_CAB_RIDES.length; i++) {
        var rid = PK_CAB_RIDES[i][0], at = PK.attrById && PK.attrById[rid];
        var open = rid === 'coaster' ? pkCoasterOpen() : (at ? !!at.open : true);
        if (parts.rides[rid].on !== open) parts.rides[rid].set(open);
        parts.lamps[rid].on = open;
      }
      if (parts.lights.on !== !!S.lights) parts.lights.set(!!S.lights);
      if (parts.rideLights.on !== !!S.rideLights) parts.rideLights.set(!!S.rideLights);
      if (parts.ticket.on !== !!S.clerk) parts.ticket.set(!!S.clerk);
      if (parts.snack.on !== !!S.snackOpen) parts.snack.set(!!S.snackOpen);
      if (parts.gate.on !== !!S.gateOpen) parts.gate.set(!!S.gateOpen);
      parts.lamps.mains.on = true;
      parts.lamps.park.on = !PK.closed;
    }
  });

  C.cabinet = parts;
  return parts;
}
