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
function pkCtlGaugeTex(o) {
  var key = [o.label, o.min, o.max, o.unit, o.red || 0, o.ticks || 10].join('|');
  if (PK_GAUGE_TEX[key]) return PK_GAUGE_TEX[key];
  var t = tex(256, 256, function (c, W, H) {
    var cx = W / 2, cy = H / 2, R = W * 0.48;
    c.clearRect(0, 0, W, H);
    var g = c.createRadialGradient(cx, cy - R * 0.3, R * 0.12, cx, cy, R);
    g.addColorStop(0, '#fbf7ec'); g.addColorStop(0.72, '#efe9d8'); g.addColorStop(1, '#d3ccb8');
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, 6.2832); c.fill();
    // the sweep runs 270 degrees from the lower left, the way a real dial does
    var A = function (v) { return -(135 + 270 * v) * Math.PI / 180; };
    var P = function (v, rr) { var a = A(v); return [cx + Math.cos(a) * rr, cy - Math.sin(a) * rr]; };
    if (o.red) { c.beginPath(); c.lineWidth = R * 0.09; c.strokeStyle = '#c0392b'; c.arc(cx, cy, R * 0.80, (135 + 270 * o.red) * Math.PI / 180, (135 + 270) * Math.PI / 180); c.stroke(); }
    var n = o.ticks || 10;
    for (var i = 0; i <= n; i++) {
      var v = i / n, major = i % 2 === 0, a = P(v, R * (major ? 0.74 : 0.80)), b = P(v, R * 0.90);
      c.beginPath(); c.lineWidth = major ? R * 0.028 : R * 0.016; c.strokeStyle = '#2f3439';
      c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
      if (major) {
        var q = P(v, R * 0.60);
        c.fillStyle = '#2f3439'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.font = 'bold ' + Math.round(R * 0.13) + 'px Arial';
        c.fillText(String(Math.round((o.min + (o.max - o.min) * v) * 10) / 10), q[0], q[1]);
      }
    }
    c.fillStyle = '#2f3439'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = 'bold ' + Math.round(R * 0.115) + 'px Arial'; c.fillText(o.label, cx, cy + R * 0.30);
    if (o.unit) { c.fillStyle = '#6c7176'; c.font = Math.round(R * 0.10) + 'px Arial'; c.fillText(o.unit, cx, cy + R * 0.47); }
    // a little wear so the dial is not a clip-art circle
    for (var k = 0; k < 60; k++) { c.fillStyle = 'rgba(120,110,90,' + randf(0.02, 0.07) + ')'; c.fillRect(randf(0, W), randf(0, H), randf(1, 5), randf(1, 3)); }
  });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return (PK_GAUGE_TEX[key] = t);
}

// ── The fascia plate ─────────────────────────────────────────────────
// One canvas per panel: painted steel, section lines, engraved lettering. The hardware is
// mounted on top at the same coordinates the legend is drawn at, so nothing can drift.
var PK_FACE_TEX = {};
function pkCtlFace(key, w, h, draw) {
  if (PK_FACE_TEX[key]) return PK_FACE_TEX[key];
  var W = 2048, H = Math.max(160, Math.round(W * h / w));
  var t = tex(W, H, function (c) {
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
  pkBevelBox(o.w + 0.07, o.h + 0.07, 0.055, M.case, 0, 0, -0.030, g, 0.012);
  var faceTex = pkCtlFace(o.key, o.w, o.h, o.draw);
  var face = new THREE.Mesh(new THREE.PlaneGeometry(o.w, o.h),
    new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.55, metalness: 0.22, emissive: 0xffffff, emissiveMap: faceTex, emissiveIntensity: 0.34 }));
  face.position.z = 0.0005; face.receiveShadow = true; g.add(face);
  // the machined rim round the plate, and four screws
  pkBevelBox(o.w + 0.10, 0.018, 0.06, M.bezel, 0, o.h / 2 + 0.038, -0.028, g, 0.005);
  pkBevelBox(o.w + 0.10, 0.018, 0.06, M.bezel, 0, -o.h / 2 - 0.038, -0.028, g, 0.005);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) {
    var sc = new THREE.Mesh(roundCylGeo(0.011, 0.011, 0.005, 10), MAT.chrome);
    sc.rotation.x = Math.PI / 2; sc.position.set(s[0] * (o.w / 2 - 0.012), s[1] * (o.h / 2 - 0.012), 0.004); g.add(sc);
  });
  return g;
}

// ── Hardware ─────────────────────────────────────────────────────────
// every moving part sits in a dynamic group: the bake leaves it alone, the editor still
// treats the whole console as one item, and the part can travel.
var PK_CTL_LIVE = [];
function pkCtlLive(o) { PK_CTL_LIVE.push(o); }
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
  var collar = new THREE.Mesh(roundCylGeo(r * 1.40, r * 1.46, 0.011, 20), MAT.chrome);
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
      var want = api.lit && PK.consoleLamps !== false ? 1 : 0;
      var cur = ledMat.emissiveIntensity || 0;
      ledMat.emissiveIntensity = cur + (want * 1.35 - cur) * Math.min(1, dt * 12);
    }
  });
  hitBox(r * 2.4, r * 2.4, 0.075, x, y, 0.028, {
    prompt: function () { return o.prompt || ('Press ' + (o.label || 'the button')); },
    use: function () { api.press(); }
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
    prompt: function () { return (o.prompt || 'Throw the switch') + ' - ' + (o.onName || 'ON') + ' / ' + (o.offName || 'OFF'); },
    use: function () { api.flip(); }
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
    prompt: function () { return (o.prompt || 'Turn the selector') + ': ' + (o.names ? o.names[api.pos] : 'position ' + (api.pos + 1)); },
    use: function () { sfx('click'); api.step(); }
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
    prompt: function () { return o.prompt || 'Pull the lever'; },
    use: function () { api.pull(); }
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
    }
  };
  pkCtlLive({ tick: function (dt) { down += (target - down) * Math.min(1, dt * 20); head.position.z = 0.028 + down; } });
  hitBox(r * 3.0, r * 3.0, 0.09, x, y, 0.030, {
    prompt: function () { return api.latched ? 'Turn the stop to reset' : (o.prompt || 'Hit the emergency stop'); },
    use: function () { api.press(); }
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
      var want = api.on ? 1 : 0;
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
  var bez = new THREE.Mesh(roundCylGeo(r * 1.13, r * 1.17, 0.013, 28), MAT.chrome);
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
      var want = clamp(api.get(), 0, 1);
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
      cab: { lights: false, snack: false, clerk: false },   // what the park has bothered to install
      parts: {}        // the hardware, by id
    };
  }
  return PK.console;
}
function pkCtlGuard() {
  var C = pkCtlState();
  if (!C.on) { sfx('bad'); toast('The console is dead - turn the power on', 'bad'); return false; }
  return true;
}

// ── The coaster's control desk ───────────────────────────────────────
// One group at the top of the world: the editor selects, moves and turns the whole console as
// one item, and nothing on the fascia can be nudged out of place on its own.
function pkBuildCoasterConsole() {
  pkCtlStart();
  var C = pkCtlState();
  if (C.built) return C;
  C.built = true;
  var M = pkCtlM();
  var G = new THREE.Group(); scene.add(G);
  var CX = 14.30, CZ = -3.50, TOP = 0.91, PW = 2.60, PH = 0.72, TILT = 0.52;

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
  var B = [
    ['gates', 'GATES', 'green', -0.35, 0.17],
    ['barsDown', 'BARS DN', 'amber', -0.11, 0.17],
    ['barsUp', 'BARS UP', 'white', 0.13, 0.17],
    ['dispatch', 'DISPATCH', 'green', 0.37, 0.17],
    ['reset', 'RESET', 'white', -0.35, -0.04],
    ['test', 'TEST RUN', 'blue', -0.11, -0.04],
    ['maint', 'MAINT', 'amber', 0.13, -0.04],
    ['horn', 'BELL', 'white', 0.37, -0.04]
  ];
  var GA = [
    ['speed', 'SPEED', 'km/h', 0, 80, 0.80, -1.14],
    ['air', 'AIR', 'bar', 0, 10, 0.72, -0.85],
    ['load', 'LOAD', 'riders', 0, 12, 0.90, -0.56]
  ];
  var LA = [['power', 'POWER'], ['gate', 'GATES'], ['bars', 'BARS'], ['fault', 'FAULT']];
  var TOG = [['powerSw', 'POWER', -1.15], ['lampSw', 'LAMPS', -0.88]];

  var P = pkCtlPanel({
    w: PW, h: PH, x: CX, y: TOP + (PH / 2) * Math.cos(TILT), z: CZ + 0.31 - (PH / 2) * Math.sin(TILT),
    tilt: -TILT, key: 'pk-coaster-desk', parent: G,
    draw: function (c, W, H) {
      var R2 = pkCtlRuler(W, H, PW, PH); R2.c = c;
      // section boxes
      R2.box(-0.87, 0, 0.86, 0.70, 'rgba(0,0,0,0.30)', 0.006);
      R2.box(0.08, 0, 1.04, 0.70, 'rgba(0,0,0,0.30)', 0.006);
      R2.box(0.95, 0, 0.70, 0.70, 'rgba(0,0,0,0.30)', 0.006);
      R2.engrave('DRIVE', -0.87, 0.300, 0.030);
      R2.engrave('CONTROL', 0.08, 0.300, 0.030);
      R2.engrave('DISPATCH', 0.95, 0.300, 0.030);
      // section 1: lamp captions, gauge captions, switch captions
      for (var i = 0; i < LA.length; i++) R2.txt(LA[i][1], -1.14 + i * 0.19, 0.262, 0.020, '#aebcc4');
      R2.txt('MASTER', -1.15, -0.272, 0.020, '#aebcc4');
      R2.txt('PANEL LAMPS', -0.88, -0.272, 0.020, '#aebcc4');
      R2.txt('MODE', -0.57, -0.272, 0.020, '#aebcc4');
      // section 2: button captions
      for (var b = 0; b < B.length; b++) R2.txt(B[b][1], B[b][3], B[b][4] - 0.068, 0.024, '#d6dee3');
      R2.txt('PARK CO  ·  COASTER CONTROL  ·  STATION 01', 0.08, -0.268, 0.021, '#8f9ca4');
      // section 3: the emergency stop
      R2.engrave('EMERGENCY STOP', 0.80, 0.058, 0.026);
      R2.txt('turn to release', 0.80, 0.028, 0.017, '#c8d2d8');
      R2.txt('DISPATCH', 1.03, -0.258, 0.024, '#d6dee3');
      R2.txt('PULL', 1.03, -0.228, 0.016, '#8f9ca4');
      // a hazard band along the bottom edge
      var hy = R2.Y(-0.322), hh = R2.L(0.028);
      c.save();
      c.beginPath(); c.rect(R2.X(-1.30), hy, R2.L(2.60), hh); c.clip();
      c.fillStyle = '#151a1e'; c.fillRect(R2.X(-1.30), hy, R2.L(2.60), hh);
      c.fillStyle = '#c9a227';
      for (var hz = 0; hz < 62; hz++) {
        var x0 = R2.X(-1.30) + hz * R2.L(0.048);
        c.beginPath(); c.moveTo(x0, hy + hh); c.lineTo(x0 + R2.L(0.022), hy + hh);
        c.lineTo(x0 + R2.L(0.022) + hh, hy); c.lineTo(x0 + hh, hy); c.closePath(); c.fill();
      }
      c.restore();
    }
  });

  // hardware, in the order a hand would find it
  var gauges = {}, lamps = {}, buttons = {};
  for (var gi = 0; gi < GA.length; gi++) {
    var gd = GA[gi];
    gauges[gd[0]] = pkCtlGauge(P, gd[6], 0.115, {
      id: gd[0], label: gd[1], unit: gd[2], min: gd[3], max: gd[4], red: gd[5], ticks: 8, r: 0.098,
      get: gd[0] === 'speed' ? function () { return (PK.ride.v || 0) * 3.6 / 80; }
        : gd[0] === 'air' ? function () { return pkCtlState().air / 10; }
        : function () { return PK.seats.length ? PK.ride.riders / PK.seats.length : 0; }
    });
  }
  for (var li = 0; li < LA.length; li++) {
    lamps[LA[li][0]] = pkCtlLamp(P, -1.14 + li * 0.19, 0.305, { id: LA[li][0], r: 0.022, col: li === 0 ? 0x5fd38d : li === 3 ? 0xff4d3d : 0xf0c04a });
  }
  for (var bi = 0; bi < B.length; bi++) {
    var bd = B[bi];
    buttons[bd[0]] = pkCtlBtn(P, bd[3], bd[4], {
      id: bd[0], label: bd[1], col: bd[2], r: 0.040,
      lampCol: bd[2] === 'green' ? 0x5fd38d : bd[2] === 'amber' ? 0xf0c04a : bd[2] === 'blue' ? 0x5aa9ff : 0xe8e4d8,
      prompt: 'Press ' + bd[1],
      act: function () {
        if (!pkCtlGuard()) return;
        var id = this.id;
        if (id === 'gates') return pkGatesToggle();
        if (id === 'barsDown') return pkBarsDown();
        if (id === 'barsUp') return pkBarsUp();
        if (id === 'dispatch') return pkCtlState().mode === 2 ? pkTestRun() : pkDispatch();
        if (id === 'reset') return pkReset();
        if (id === 'test') return pkTestRun();
        if (id === 'maint') return pkService();
        if (id === 'horn') { sfx('bell'); return true; }
      }
    });
  }
  // the buttons carry a live lamp: green when the thing they do is ready
  var toggles = {};
  toggles.powerSw = pkCtlToggle(P, -1.15, -0.19, {
    id: 'powerSw', on: true, prompt: 'Master power',
    act: function (on) {
      C.on = on; sfx('click');
      toast(on ? 'Console live' : 'Console dead', on ? 'good' : 'bad');
    }
  });
  toggles.lampSw = pkCtlToggle(P, -0.88, -0.19, {
    id: 'lampSw', on: true, prompt: 'Panel lamps',
    act: function (on) { C.lamps = on; PK.consoleLamps = on; sfx('click'); }
  });
  var mode = pkCtlRotary(P, -0.57, -0.19, {
    id: 'mode', n: 3, pos: S.auto ? 1 : 0, r: 0.040, names: ['MANUAL', 'AUTO', 'TEST'],
    prompt: 'Mode selector',
    act: function (pos) {
      C.mode = pos;
      if (pos === 2) { pkSetAuto(false); toast('Mode: test run', ''); }
      else pkSetAuto(pos === 1);
    }
  });
  var stop = pkCtlMushroom(P, 0.80, 0.175, {
    id: 'estop', r: 0.070, prompt: 'Emergency stop',
    act: function () { pkStop(); },
    release: function () { pkReset(); }
  });
  var lever = pkCtlLever(P, 1.03, -0.045, {
    id: 'throttle', len: 0.215, col: 'black', prompt: 'Pull the dispatch lever',
    act: function () { if (!pkCtlGuard()) return; if (C.mode === 2) pkTestRun(); else pkDispatch(); }
  });

  C.parts = { gauges: gauges, lamps: lamps, buttons: buttons, toggles: toggles, mode: mode, stop: stop, lever: lever };

  // ── the desk keeps itself in step with the ride ──
  var airT = 0;
  pkCtlLive({
    tick: function (dt) {
      var R = PK.ride, live = C.on;
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
      buttons.dispatch.setLit(ready && (R.state === 'ready' || (R.state === 'loading' && R.riders > 0)));
      buttons.reset.setLit(live && !!R.fault);
      buttons.test.setLit(ready && R.state === 'idle');
      buttons.maint.setLit(live && (S.wear || 0) > 0);
      if (toggles.powerSw.on !== C.on) toggles.powerSw.set(C.on);
      if (toggles.lampSw.on !== C.lamps) toggles.lampSw.set(C.lamps);
      // the stop stays latched while the ride is faulted
      if (stop.latched !== !!R.fault) { stop.latched = !!R.fault; }
    }
  });
  // the console is a fixture of the room: it is solid so nobody walks through the doors
  solid(CX - 1.36, CX + 1.36, CZ - 0.34, CZ + 0.34, 0, 0.95);
  return C;
}

// ── The compact desk in a ride booth ────────────────────────────────
// Four buttons, a bat switch, a mushroom and a load gauge on the booth's console: the screen
// above still explains the ride, but the operator works it with hands, not a mouse.
function pkBoothPanel(a, con) {
  // The console lives in `con`'s frame, whose local +Z faces the operator.
  var C = pkCtl(a);
  var PW = 1.72, PH = 0.50, TILT = 0.50;
  var TOP = 0.72;
  var PY = TOP + (PH / 2) * Math.cos(TILT);
  var PZ = (PH / 2) * Math.sin(TILT) + 0.06;

  var B = [
    ['gates', 'GATES', 'green', -0.18],
    ['bars', 'BARS', 'amber', 0.04],
    ['dispatch', 'DISPATCH', 'green', 0.26],
    ['test', 'TEST', 'blue', 0.48]
  ];
  var P = pkCtlPanel({
    w: PW, h: PH, x: 0, y: PY, z: PZ, tilt: -TILT, key: 'pk-booth-desk-' + a.id, parent: con,
    draw: function (c, W, H) {
      var R2 = pkCtlRuler(W, H, PW, PH); R2.c = c;
      R2.box(-0.60, 0.0, 0.50, 0.44, 'rgba(0,0,0,0.26)', 0.005);
      R2.box(0.09, 0.0, 1.00, 0.44, 'rgba(0,0,0,0.26)', 0.005);
      R2.box(0.66, 0.0, 0.34, 0.44, 'rgba(0,0,0,0.26)', 0.005);
      R2.engrave('PARK CO  ·  ' + a.name.toUpperCase(), -0.60, 0.205, 0.020);
      R2.txt('LOAD', -0.70, -0.092, 0.019, '#aebcc4');
      R2.txt('SPEED', -0.50, -0.092, 0.019, '#aebcc4');
      for (var i = 0; i < B.length; i++) R2.txt(B[i][1], B[i][3], 0.192, 0.021, '#d6dee3');
      R2.txt('AUTO', -0.18, -0.206, 0.018, '#aebcc4');
      R2.txt('E-STOP', 0.04, -0.206, 0.018, '#d6dee3');
      R2.txt('RESET', 0.26, -0.206, 0.018, '#aebcc4');
      R2.txt('DISPATCH', 0.66, -0.206, 0.018, '#d6dee3');
    }
  });
  var parts = { buttons: {} };
  for (var i = 0; i < B.length; i++) {
    var b = B[i];
    parts.buttons[b[0]] = pkCtlBtn(P, b[3], 0.105, {
      id: b[0], label: b[1], col: b[2], r: 0.034,
      lampCol: b[2] === 'green' ? 0x5fd38d : b[2] === 'amber' ? 0xf0c04a : b[2] === 'blue' ? 0x5aa9ff : 0xe8e4d8,
      prompt: 'Press ' + b[1],
      act: function () {
        var id = this.id;
        if (C.fault && id !== 'gates') { sfx('bad'); toast('Reset ' + a.name + ' first', 'bad'); return; }
        if (id === 'gates') return pkBoothGates(a);
        if (id === 'bars') {
          C.barsWant = C.barsWant > 0.5 ? 0 : 1;
          sfx('click'); toast(a.name + ': restraints ' + (C.barsWant > 0.5 ? 'down' : 'up'), '');
          screenDirtyAll(); return true;
        }
        if (id === 'dispatch') return pkBoothDispatch(a);
        if (id === 'test') return pkBoothTest(a);
      }
    });
  }
  parts.auto = pkCtlToggle(P, -0.18, -0.135, {
    id: 'auto', on: C.auto, prompt: 'Automatic cycle',
    act: function () { pkBoothAuto(a); }
  });
  parts.stop = pkCtlMushroom(P, 0.04, -0.118, {
    id: 'stop', r: 0.050, prompt: 'Emergency stop',
    act: function () { pkBoothStop(a); }
  });
  parts.reset = pkCtlBtn(P, 0.26, -0.135, {
    id: 'reset', label: 'RESET', col: 'white', r: 0.034, lampCol: 0xe8e4d8,
    prompt: 'Reset after a stop',
    act: function () { if (C.fault) { pkBoothStop(a); } else { sfx('click'); toast(a.name + ': nothing to reset', ''); } }
  });
  parts.lever = pkCtlLever(P, 0.66, -0.010, {
    id: 'dispatchLever', len: 0.19, col: 'black', prompt: 'Pull the dispatch lever',
    act: function () { pkBoothDispatch(a); }
  });
  parts.load = pkCtlGauge(P, -0.70, 0.025, {
    id: 'load', label: '', unit: 'riders', min: 0, max: Math.max(4, a.seats.length), red: 0.92, ticks: 6, r: 0.075,
    get: function () { return a.seats.length ? a.riders / a.seats.length : 0; }
  });
  parts.speed = pkCtlGauge(P, -0.50, 0.025, {
    id: 'speed', label: '', unit: 'cycle', min: 0, max: 1, red: 0.94, ticks: 5, r: 0.075,
    get: function () { return a.state === 'running' ? Math.min(1, (a.t || 0) / Math.max(1, a.run || 1)) : 0; }
  });
  pkCtlLive({
    tick: function (dt) {
      var live = !C.fault;
      if (parts.auto.on !== C.auto) parts.auto.set(C.auto);
      if (parts.stop.latched !== !!C.fault) parts.stop.latched = !!C.fault;
      parts.buttons.gates.setLit(live && (a.state === 'idle' || a.state === 'unloading' || a.state === 'boarding'));
      parts.buttons.dispatch.setLit(live && !PK.closed && (a.state === 'boarding' || a.state === 'ready') && !a.queue.length && !a.boarding && a.riders > 0);
      parts.buttons.test.setLit(live && !PK.closed && a.state === 'idle' && !a.queue.length && !a.riders);
    }
  });
  a.boothPanel = parts;
  return parts;
}

// ── The park services cabinet ───────────────────────────────────────
// The coaster desk is the coaster's. Everything that belongs to the whole park - a breaker per
// ride, the park lights, the ticket window, the snack bar - lives on one steel switchboard on
// the office wall, with a supply dial, a load dial, a lamp per circuit and a breaker per ride.
var PK_CAB_RIDES = [
  ['carousel', 'CAROUSEL'], ['teacups', 'TEACUPS'], ['ferris', 'FERRIS WHEEL'],
  ['dodgems', 'DODGEMS'], ['droptower', 'DROP TOWER'], ['flume', 'LOG FLUME'],
  ['haunted', 'HAUNTED HOUSE']
];
function pkBuildParkCabinet(px, py, pz, ry) {
  pkCtlStart();
  var C = pkCtlState();
  if (C.cabinet) return C.cabinet;
  var M = pkCtlM();
  var PW = 1.34, PH = 1.26, CX = px === undefined ? -22.86 : px, CY = py === undefined ? 1.66 : py, CZ = pz === undefined ? 43.55 : pz;

  // the enclosure hangs off a holder so the whole board can be moved as one item
  var H = new THREE.Group();
  H.position.set(CX, CY, CZ); H.rotation.order = 'YXZ';
  H.rotation.y = ry === undefined ? Math.PI / 2 : ry; H.rotation.x = -0.055; scene.add(H);
  pkBevelBox(PW + 0.16, PH + 0.16, 0.13, M.case, 0, 0, -0.105, H, 0.02);
  pkBevelBox(PW + 0.24, 0.05, 0.22, M.face, 0, PH / 2 + 0.115, -0.045, H, 0.012);
  // the conduit up into the roof, and a pair of hinges down the near edge
  cyl(0.030, 0.62, MAT.steelDark, 0, PH / 2 + 0.44, -0.085, H, 10);
  cyl(0.038, 0.03, MAT.steelDark, 0, PH / 2 + 0.13, -0.085, H, 10);
  [0.36, -0.36].forEach(function (hy) {
    pkBevelBox(0.05, 0.11, 0.06, MAT.chrome, -PW / 2 - 0.055, hy, -0.02, H, 0.008);
  });

  var P = pkCtlPanel({
    w: PW, h: PH, x: 0, y: 0, z: 0, parent: H, key: 'pk-park-services',
    draw: function (c, W, H2) {
      var R2 = pkCtlRuler(W, H2, PW, PH); R2.c = c;
      R2.engrave('PARK SERVICES', 0, 0.552, 0.033);
      R2.txt('MAIN SWITCHBOARD   ·   STATION 01', 0, 0.512, 0.016, '#a6b4bc');
      // three bays, ruled the way a real board is ruled
      R2.box(-0.51, 0.01, 0.30, 1.00, 'rgba(0,0,0,0.20)', 0.005);
      R2.box(-0.02, 0.01, 0.46, 1.00, 'rgba(0,0,0,0.20)', 0.005);
      R2.box(0.48, 0.01, 0.32, 1.00, 'rgba(0,0,0,0.20)', 0.005);
      R2.txt('SUPPLY', -0.51, 0.192, 0.018, '#a6b4bc');
      R2.txt('LOAD', -0.51, -0.078, 0.018, '#a6b4bc');
      R2.txt('MAINS', -0.51, -0.292, 0.017, '#a6b4bc');
      R2.txt('PARK OPEN', -0.51, -0.452, 0.017, '#a6b4bc');
      for (var i = 0; i < PK_CAB_RIDES.length; i++)
        R2.txt(PK_CAB_RIDES[i][1], -0.028, 0.400 - i * 0.135, 0.021, '#eef2f4', 'left');
      R2.txt('PARK LIGHTS', 0.48, 0.297, 0.018, '#d6dee3');
      R2.txt('TICKET WINDOW', 0.48, 0.067, 0.018, '#d6dee3');
      R2.txt('SNACK BAR', 0.48, -0.163, 0.018, '#d6dee3');
      R2.txt('BREAKERS', 0.48, -0.310, 0.017, '#8f9ca4');
      R2.txt('UP = OPEN', 0.48, -0.342, 0.017, '#8f9ca4');
      R2.txt('DOWN = SHUT', 0.48, -0.374, 0.017, '#8f9ca4');
      R2.txt('ISOLATE BEFORE SERVICE', 0.48, -0.448, 0.014, '#7d8a96');
      // a hazard strip along the bottom lip
      var hy = R2.Y(-0.588), hh = R2.L(0.022);
      c.save();
      c.beginPath(); c.rect(R2.X(-0.67), hy, R2.L(1.34), hh); c.clip();
      c.fillStyle = '#151a1e'; c.fillRect(R2.X(-0.67), hy, R2.L(1.34), hh);
      c.fillStyle = '#c9a227';
      for (var hz = 0; hz < 40; hz++) {
        var x0 = R2.X(-0.67) + hz * R2.L(0.046);
        c.beginPath(); c.moveTo(x0, hy + hh); c.lineTo(x0 + R2.L(0.020), hy + hh);
        c.lineTo(x0 + R2.L(0.020) + hh, hy); c.lineTo(x0 + hh, hy); c.closePath(); c.fill();
      }
      c.restore();
    }
  });

  var parts = { rides: {}, lamps: {}, gauges: {} };
  for (var i = 0; i < PK_CAB_RIDES.length; i++) {
    var rid = PK_CAB_RIDES[i][0], ry2 = 0.400 - i * 0.135;
    parts.rides[rid] = pkCtlToggle(P, -0.11, ry2, {
      id: 'ride_' + rid, on: true, prompt: PK_CAB_RIDES[i][1] + ' breaker',
      onName: 'open', offName: 'shut',
      act: function (on) { return pkSetRideOpen(this.id.slice(5), on); }
    });
    parts.lamps[rid] = pkCtlLamp(P, -0.205, ry2, { id: 'lamp_' + rid, r: 0.011, col: 0x5fd38d });
  }
  parts.gauges.supply = pkCtlGauge(P, -0.51, 0.305, {
    id: 'supply', label: 'SUPPLY', unit: 'volts', min: 0, max: 300, red: 0.88, ticks: 6, r: 0.093,
    get: function () { return 0.82; }
  });
  parts.gauges.load = pkCtlGauge(P, -0.51, 0.035, {
    id: 'load', label: 'LOAD', unit: 'amps', min: 0, max: 60, red: 0.85, ticks: 6, r: 0.093,
    get: function () {
      var n = 0;
      for (var i = 0; i < PK_CAB_RIDES.length; i++) {
        var at = PK.attrById && PK.attrById[PK_CAB_RIDES[i][0]];
        if (at && at.open) n++;
      }
      return 0.10 + (n / PK_CAB_RIDES.length) * 0.72;
    }
  });
  parts.lamps.mains = pkCtlLamp(P, -0.51, -0.245, { id: 'mains', r: 0.020, col: 0x5fd38d });
  parts.lamps.park = pkCtlLamp(P, -0.51, -0.405, { id: 'park', r: 0.020, col: 0xf0c04a });

  parts.lights = pkCtlToggle(P, 0.48, 0.38, {
    id: 'parkLights', on: !!S.lights, prompt: 'Park lights', onName: 'on', offName: 'off',
    act: function (on) {
      if (on && !C.cab.lights) { sfx('bad'); toast('The park lights are not installed yet', 'bad'); return false; }
      S.lights = on; PK.lights = on;
      sfx('click'); toast('Park lights ' + (on ? 'on' : 'off'), on ? 'good' : '');
      logEvent('Park lights ' + (on ? 'on' : 'off'), '');
      screenDirtyAll(); hudDirty = true; return true;
    }
  });
  parts.ticket = pkCtlToggle(P, 0.48, 0.15, {
    id: 'ticket', on: !!S.clerk, prompt: 'Ticket window', onName: 'staffed', offName: 'shut',
    act: function (on) {
      if (on && !C.cab.clerk) { sfx('bad'); toast('No clerk on the payroll', 'bad'); return false; }
      S.clerk = on; PK.clerk = on;
      sfx('click'); toast('Ticket window ' + (on ? 'staffed' : 'shut'), on ? 'good' : '');
      logEvent('Ticket window ' + (on ? 'staffed' : 'shut'), ''); screenDirtyAll(); hudDirty = true; return true;
    }
  });
  parts.snack = pkCtlToggle(P, 0.48, -0.08, {
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
      if (S.lights) C.cab.lights = true;
      if (S.snackOpen || (PK.level || 1) >= 2) C.cab.snack = true;
      if (S.clerk) C.cab.clerk = true;
      for (var i = 0; i < PK_CAB_RIDES.length; i++) {
        var rid = PK_CAB_RIDES[i][0], at = PK.attrById && PK.attrById[rid];
        var open = at ? !!at.open : true;
        if (parts.rides[rid].on !== open) parts.rides[rid].set(open);
        parts.lamps[rid].on = !!at && open;
      }
      if (parts.lights.on !== !!S.lights) parts.lights.set(!!S.lights);
      if (parts.ticket.on !== !!S.clerk) parts.ticket.set(!!S.clerk);
      if (parts.snack.on !== !!S.snackOpen) parts.snack.set(!!S.snackOpen);
      parts.lamps.mains.on = true;
      parts.lamps.park.on = !PK.closed;
    }
  });

  C.cabinet = parts;
  return parts;
}
