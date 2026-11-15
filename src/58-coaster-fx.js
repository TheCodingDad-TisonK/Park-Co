//@ Park Co, part 58: the coasters come alive - scenery, track lights, water, smoke and sound for the coaster, The Serpent and Baron's Drop
  // ── Why ──────────────────────────────────────────────────────────
  // The three steel coasters were track on a lawn: a good ride, nothing to look at, and silent. This part is the first batch
  // of the ride upgrades tison asked for ("everything, with effects"). It is one kit, driven by where each train really is,
  // and three sets of scenery built with it.
  //
  // The kit (any coaster can be given to it: pkCfxRide):
  //   - track lights: a bulb under the spine every metre and a half, in three circuits, so at night the track is drawn in
  //     light and the circuits chase (part 57 twinkles them; they are ride lights, on the rides' own switch);
  //   - sound, from the train's own motion: the chain's clack on a lift, a roar that rises with speed, a scream as a drop
  //     begins, the hiss of a splash. All of it fades with distance, so it is loud on the ride and a murmur from the midway;
  //   - effect zones: a place on the ground that answers when the train comes through it: a plume of spray off a pond, mist
  //     in a tunnel, a breath of smoke;
  //   - emitters that run by themselves near the eye: a torch's flame, a drift of mist.
  // The scenery:
  //   - the coaster: a rock-rimmed pond under the low turns that the train skims (spray), a rock tunnel over the run home
  //     (mist), flower beds and topiary in the yard;
  //   - The Serpent: a great stone serpent coiled round the north of the ride, its head raised over the queue, eyes lit,
  //     breathing mist; boulders and clipped planting; the loops fill with mist as the train goes through;
  //   - Baron's Drop: torches burning round the castle yard, and a real plume when the train hits the splash basin.
  var PK_CFX = { rides: [], parts: [], free: [], emit: [], t: 0, built: false, tex: null, roar: null, roarWant: 0, bulbs: 0, fired: 0 };

  // ── The voices ───────────────────────────────────────────────────
  SFX.pkScream = function (t, o) {
    var g = (o && o.g) || 1;
    for (var i = 0; i < 5; i++) sTone('sawtooth', 650 + Math.random() * 520, t + Math.random() * 0.3, 0.9 + Math.random() * 0.5, 0.011 * g, { f1: 380 + Math.random() * 220, lp: 2400 });
  };
  SFX.pkClack = function (t, o) { var g = (o && o.g) || 1; sNoise(t, 0.03, 0.05 * g, { freq: 2600 }); sTone('square', 150, t, 0.035, 0.018 * g, { lp: 700 }); };
  SFX.pkSplash = function (t, o) { var g = (o && o.g) || 1; sNoise(t, 1.1, 0.2 * g, { type: 'lowpass', freq: 1900, fade: true }); sNoise(t + 0.05, 0.5, 0.12 * g, { freq: 5200, fade: true }); };
  SFX.pkHiss = function (t, o) { var g = (o && o.g) || 1; sNoise(t, 0.9, 0.07 * g, { freq: 6500, fade: true }); };
  // how loud something at p is to the eye: 1 on top of it, nothing past 85 m
  function pkCfxNear(p) {
    var d = Math.sqrt((p.x - camera.position.x) * (p.x - camera.position.x) + (p.y - camera.position.y) * (p.y - camera.position.y) + (p.z - camera.position.z) * (p.z - camera.position.z));
    return d > 85 ? 0 : Math.min(1, 9 / (d + 2));
  }
  function pkCfxSay(kind, p, k) { var g = pkCfxNear(p) * (k || 1); if (g > 0.03) sfx(kind, { g: g }); }
  // the roar: one filtered noise that runs all the time and is turned up by the fastest train near the eye
  function pkCfxRoar(dt) {
    var C = PK_CFX, want = C.roarWant; C.roarWant = 0;
    if (!AC || (SET && SET.sound === false)) { if (C.roar) C.roar.gain.gain.value = 0; return; }
    if (!C.roar) {
      if (want < 0.01) return;
      try {
        var len = AC.sampleRate * 2, buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
        for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        var src = AC.createBufferSource(); src.buffer = buf; src.loop = true;
        var flt = AC.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.value = 400; flt.Q.value = 0.7;
        var gn = AC.createGain(); gn.gain.value = 0;
        src.connect(flt); flt.connect(gn); gn.connect(sfxBus || AC.destination); src.start();
        C.roar = { gain: gn, flt: flt, v: 0 };
      } catch (e) { return; }
    }
    var R = C.roar; R.v += (want - R.v) * Math.min(1, dt * 6);
    R.gain.gain.value = Math.min(0.5, R.v * 0.42);
    R.flt.frequency.value = 260 + R.v * 900;
  }

  // ── The particles ────────────────────────────────────────────────
  function pkCfxTex() {
    if (PK_CFX.tex) return PK_CFX.tex;
    PK_CFX.tex = makeAlphaTex(64, 64, function (c, w, h) {
      var gr = c.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = gr; c.fillRect(0, 0, w, h);
    });
    return PK_CFX.tex;
  }
  // one puff: where, which way, how long, how big it starts and ends, its colour, how hard gravity pulls and how see-through
  function pkCfxPuff(x, y, z, vx, vy, vz, life, s0, s1, col, grav, op, add) {
    var C = PK_CFX, p = C.free.pop();
    if (!p) {
      if (C.parts.length >= 170) return;
      var m = new THREE.SpriteMaterial({ map: pkCfxTex(), transparent: true, depthWrite: false }); m.userData.noBake = true;
      var s = new THREE.Sprite(m); s.userData.dynamic = true; s.userData.noBake = true; scene.add(s);
      p = { s: s, on: false }; C.parts.push(p);
    }
    p.on = true; p.x = x; p.y = y; p.z = z; p.vx = vx; p.vy = vy; p.vz = vz; p.t = 0; p.life = life; p.s0 = s0; p.s1 = s1; p.g = grav || 0; p.op = op === undefined ? 0.7 : op;
    p.s.material.color.setHex(col); p.s.material.blending = add ? THREE.AdditiveBlending : THREE.NormalBlending; p.s.visible = true;
  }
  function pkCfxParts(dt) {
    var C = PK_CFX;
    for (var i = 0; i < C.parts.length; i++) {
      var p = C.parts[i]; if (!p.on) continue;
      p.t += dt;
      if (p.t >= p.life || p.y < -0.2) { p.on = false; p.s.visible = false; C.free.push(p); continue; }
      p.vy -= p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      var u = p.t / p.life, sc = p.s0 + (p.s1 - p.s0) * u;
      p.s.position.set(p.x, p.y, p.z); p.s.scale.set(sc, sc, 1);
      p.s.material.opacity = p.op * Math.sin(Math.PI * Math.min(1, u * 1.15 + 0.08));
    }
  }
  // the bursts
  function pkCfxSpray(x, y, z, dx, dz, k) {       // water thrown up and forward, falling back
    for (var i = 0; i < 26 * (k || 1); i++) pkCfxPuff(x + randf(-1.2, 1.2), y + 0.2, z + randf(-1.2, 1.2), dx * randf(1, 4) + randf(-2.2, 2.2), randf(4, 9.5) * (k || 1), dz * randf(1, 4) + randf(-2.2, 2.2), randf(0.9, 1.6), 0.5, randf(1.6, 2.6), 0xe9f6ff, 11, 0.75);
    for (var j = 0; j < 8; j++) pkCfxPuff(x + randf(-2, 2), y + 0.4, z + randf(-2, 2), randf(-0.6, 0.6), randf(0.6, 1.4), randf(-0.6, 0.6), randf(2, 3.2), 1.6, 4.2, 0xffffff, 0, 0.3);
  }
  function pkCfxMist(x, y, z, r, n, col) {        // a slow bank of mist
    for (var i = 0; i < n; i++) pkCfxPuff(x + randf(-r, r), y + randf(0, 0.8), z + randf(-r, r), randf(-0.35, 0.35), randf(0.1, 0.5), randf(-0.35, 0.35), randf(3, 5.5), 1.6, randf(4, 6.5), col || 0xeef2f4, 0, 0.3);
  }
  function pkCfxSmoke(x, y, z, dx, dz, n, col) {  // a breath of smoke, pushed one way
    for (var i = 0; i < n; i++) pkCfxPuff(x, y, z, dx * randf(1.2, 2.6) + randf(-0.3, 0.3), randf(0.3, 1.1), dz * randf(1.2, 2.6) + randf(-0.3, 0.3), randf(1.8, 3.2), 0.5, randf(2.2, 3.6), col || 0xdfe6e2, 0, 0.42);
  }

  // ── The track lights ─────────────────────────────────────────────
  // three circuits of bulbs under the spine: three materials, a third of a turn apart, so the twinkle of part 57 runs
  // along the track as a chase
  function pkCfxBulbs(g, curve, F, len, cols, step) {
    var n = Math.floor(len / (step || 1.5)), mats = [], lists = [[], [], []], i, k;
    for (k = 0; k < 3; k++) { var m = glowMat(cols[k % cols.length], 1.25); m.userData.pkAmbPh = k * 2.0944; m.userData.noBake = true; mats.push(m); }
    var up = new THREE.Vector3(), mx = new THREE.Matrix4();
    for (i = 0; i < n; i++) {
      var u = i / n, p = curve.getPointAt(u), fi = Math.min(F.n - 1, Math.round(u * F.n));
      up.copy(F.up[fi]);
      lists[i % 3].push([p.x - up.x * 0.78, p.y - up.y * 0.78, p.z - up.z * 0.78]);
    }
    var geo = new THREE.SphereGeometry(0.075, 8, 6);
    for (k = 0; k < 3; k++) {
      var im = new THREE.InstancedMesh(geo, mats[k], lists[k].length);
      for (i = 0; i < lists[k].length; i++) { mx.makeTranslation(lists[k][i][0], lists[k][i][1], lists[k][i][2]); im.setMatrixAt(i, mx); }
      im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; im.userData.noBake = true; g.add(im);
      PK_CFX.bulbs += lists[k].length;
    }
  }

  // ── A ride given to the kit ──────────────────────────────────────
  // o: { id, lead: function () -> the lead car's world position, running: function () -> is the train out, zones: [...] }
  // a zone: { x, z, r, yMax, fire: function (p, vx, vz, speed) }
  function pkCfxRide(o) { o.last = null; o.speed = 0; o.vy = 0; o.clack = 0; o.dropped = false; o.zones = o.zones || []; PK_CFX.rides.push(o); return o; }
  function pkCfxRides(dt) {
    var C = PK_CFX;
    for (var i = 0; i < C.rides.length; i++) {
      var r = C.rides[i], p = r.lead(); if (!p) continue;
      if (!r.last) { r.last = p.clone(); continue; }
      var vx = (p.x - r.last.x) / dt, vy = (p.y - r.last.y) / dt, vz = (p.z - r.last.z) / dt, sp = Math.sqrt(vx * vx + vy * vy + vz * vz);
      r.last.copy(p);
      if (sp > 45) continue;                                   // a jump (the train was put back at the station): not motion
      r.speed += (sp - r.speed) * Math.min(1, dt * 8); r.vy += (vy - r.vy) * Math.min(1, dt * 8);
      if (!r.running() || r.speed < 0.3) { r.dropped = false; for (var q = 0; q < r.zones.length; q++) r.zones[q].hot = false; continue; }
      var near = pkCfxNear(p);
      // the lift: slow and climbing
      if (r.vy > 0.7 && r.speed < 5) { r.clack -= dt; if (r.clack <= 0) { r.clack = 0.26; pkCfxSay('pkClack', p); } }
      // a drop begins
      if (r.vy < -6.5 && !r.dropped) { r.dropped = true; pkCfxSay('pkScream', p, 1.3); }
      else if (r.vy > -1.5) r.dropped = false;
      // the roar
      C.roarWant = Math.max(C.roarWant, near * Math.min(1, r.speed / 19));
      // the zones
      for (var z = 0; z < r.zones.length; z++) {
        var Z = r.zones[z], inside = (p.x - Z.x) * (p.x - Z.x) + (p.z - Z.z) * (p.z - Z.z) < Z.r * Z.r && (Z.yMax === undefined || p.y < Z.yMax);
        if (inside && !Z.hot) { Z.hot = true; C.fired++; Z.fire(p, vx / (sp || 1), vz / (sp || 1), r.speed); }
        else if (!inside) Z.hot = false;
      }
    }
  }
  // an emitter that runs on its own while the eye is near: { x, y, z, every, t, fire: function (e) }
  function pkCfxEmit(e) { e.t = Math.random() * e.every; PK_CFX.emit.push(e); return e; }
  function pkCfxEmits(dt) {
    var C = PK_CFX, cx = camera.position.x, cz = camera.position.z;
    for (var i = 0; i < C.emit.length; i++) {
      var e = C.emit[i]; if ((e.x - cx) * (e.x - cx) + (e.z - cz) * (e.z - cz) > 65 * 65) continue;
      if (e.night && !(S.time >= 18 || S.time < 7)) continue;
      e.t -= dt; if (e.t > 0) continue;
      e.t = e.every * randf(0.7, 1.3); e.fire(e);
    }
  }

  // ── The scenery: the coaster ─────────────────────────────────────
  function pkCfxCoaster() {
    var K = pkMats(), g = PK.coasterG; if (!g) return;
    // the pond under the dive's foot at the north of the yard: the train skims it as it pulls out
    var pond = new THREE.Mesh(new THREE.CircleGeometry(1, 40), K.water); pond.rotation.x = -Math.PI / 2; pond.scale.set(9.2, 2.25, 1); pond.position.set(2, 0.05, -33.5); g.add(pond);
    var bank = new THREE.Mesh(new THREE.CircleGeometry(1, 40), K.stoneDark); bank.rotation.x = -Math.PI / 2; bank.scale.set(9.7, 2.6, 1); bank.position.set(2, 0.03, -33.5); g.add(bank);
    for (var a = 0; a < 6.2832; a += 0.19) {
      var bx = 2 + Math.cos(a) * 9.6, bz = -33.5 + Math.sin(a) * 2.55;
      if (Math.sin(a) < -0.55) continue;                       // the north bank is the yard rail's
      pkBoulder(bx + randf(-0.25, 0.25), bz + randf(-0.2, 0.2), randf(0.32, 0.62), g);
    }
    [[-5.5, -30.7, 0.9], [-3.6, -30.4, 0.6], [8.8, -30.6, 1.0], [10.2, -30.9, 0.65], [1.5, -30.6, 0.5]].forEach(function (b) { pkBoulder(b[0], b[1], b[2], g); });
    // the rock tunnel over the run home, along the west side: boulders either side and slabs across
    // (walls of rock leaning in, roof rocks bedded on them, rubble at the feet: one mass with a way through)
    // cut rock, the same faceted stone as the flume's gorge: each piece a boulder's own shape, stretched to a wall or a lintel
    var rock = pkRockMats(), geos = pkCrownGeos(), ri = 0;
    var crag = function (x, y, z, sx, sy, sz) {
      var m = new THREE.Mesh(geos[ri % geos.length], rock[ri % rock.length]); ri++;
      m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.rotation.set(randf(-0.12, 0.12), randf(0, 6.283), randf(-0.12, 0.12)); m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
    };
    for (var tz = -24.6; tz <= -20.4; tz += 1.4) {
      [-1, 1].forEach(function (sd) {
        crag(-17 + sd * randf(2.75, 3.0), 1.9, tz + randf(-0.25, 0.25), randf(2.3, 2.9), randf(4.4, 5.4), randf(2.2, 2.8));
        crag(-17 + sd * randf(4.0, 4.6), 0.8, tz + randf(-0.5, 0.5), randf(1.8, 2.6), randf(1.8, 2.6), randf(1.8, 2.4));
      });
      crag(-17 + randf(-0.4, 0.4), 4.55 + randf(-0.1, 0.3), tz, randf(6.6, 7.4), randf(2.0, 2.6), randf(2.2, 2.8));
    }
    [[-18.9, -26.6, 1.2], [-15.1, -26.4, 1.0], [-19.0, -18.9, 1.1], [-15.0, -19.0, 0.9], [-21.2, -22.5, 0.9], [-12.6, -13.0, 0.8]].forEach(function (b) { pkBoulder(b[0], b[1], b[2], g); });
    // the yard: beds and clipped planting on the lawn inside the rail, clear of every support
    [[-12, -11.5, 2.6, 1.3], [-2, -11.5, 2.6, 1.3], [8, -11.5, 2.6, 1.3], [22, -11, 2.6, 1.3], [-12, -23.2, 1.3, 2.6], [10, -23.2, 2.6, 1.3]].forEach(function (b) { pkFlowerBed(b[0], b[1], b[2], b[3], null, true); });
    [[-7, -11.5], [3, -11.5], [15, -11], [-12, -26], [24, -14]].forEach(function (q) { pkTopiary(q[0], q[1], g, 1); });
    pkCfxBulbs(g, PK.curve, PK.F, PK.len, [0xfff2c0, 0x7fc8ff, 0xfff2c0], 1.5);
    var spray = function (p, dx, dz, sp) { if (sp < 5) return; pkCfxSpray(p.x, 0.1, p.z, dx, dz, Math.min(1.3, sp / 14)); pkCfxSay('pkSplash', p); };
    pkCfxRide({
      id: 'coaster',
      lead: function () { var c = PK.cars[0]; c = c && (c.g || c); return c ? c.position : null; },
      running: function () { var s = PK.ride.state; return s === 'running' || s === 'dispatch' || s === 'arrive'; },
      zones: [
        { x: 1.2, z: -33.5, r: 3.0, yMax: 2.6, fire: spray }, { x: -5.4, z: -33.5, r: 3.0, yMax: 2.8, fire: spray },
        { x: -17, z: -22.5, r: 3.4, yMax: 2.4, fire: function (p) { pkCfxMist(-17, 0.8, -22.5, 2.6, 12); pkCfxSay('pkHiss', p); } }
      ]
    });
    pkCfxEmit({ x: -17, y: 0.6, z: -22.5, every: 2.4, fire: function (e) { pkCfxMist(e.x, e.y, e.z + randf(-3, 3), 1.2, 2); } });
  }

  // ── The scenery: The Serpent ─────────────────────────────────────
  function pkCfxSerpent() {
    var a = PK.attrById.serpent; if (!a || !a.g || !a.extra) return;
    var g = a.g, E = a.extra, K = pkMats(), th = PK_THEME.serpent;
    // its skin: dark green scales, each with a paler edge, and a gold diamond band down the back
    var skinTex = tex(256, 256, function (c, w, h) {
      c.fillStyle = '#1f5a40'; c.fillRect(0, 0, w, h);
      for (var yy = -1; yy < 9; yy++) for (var xx = -1; xx < 9; xx++) {
        var sx = xx * 32 + (yy % 2 ? 16 : 0), sy = yy * 32;
        c.fillStyle = (xx + yy) % 3 ? '#2b7a55' : '#236848'; c.beginPath(); c.moveTo(sx, sy + 16); c.lineTo(sx + 16, sy); c.lineTo(sx + 32, sy + 16); c.lineTo(sx + 16, sy + 34); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(160,220,170,0.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx, sy + 16); c.lineTo(sx + 16, sy + 34); c.lineTo(sx + 32, sy + 16); c.stroke();
      }
      c.fillStyle = '#c9a227'; for (var d = 0; d < 4; d++) { c.beginPath(); c.moveTo(d * 64 + 32, 104); c.lineTo(d * 64 + 54, 128); c.lineTo(d * 64 + 32, 152); c.lineTo(d * 64 + 10, 128); c.closePath(); c.fill(); }
    }, 14, 2);
    var skin = std({ map: skinTex, roughness: 0.6, metalness: 0.1 }), belly = pkPaint(0xd8c98a, 0.6, 0.1), gold = K.gold, mouthM = pkPaint(0x8a1f1a, 0.6, 0.05), skinPlain = pkPaint(0x236848, 0.6, 0.1);
    // the stone serpent: coiled in the open middle of the ride, inside the great curve of the first drop, its body rising
    // and falling, its head lifted at the south side, looking down on the queue and the Promenade
    var cx = 54.6, cz = -87.6, R = 8.6, pts = [], n = 44, i;   // the track keeps 5 m clear of this ring all round
    for (i = 0; i <= n; i++) {
      var f = i / n, ang = -2.7 + f * 3.4, lift = f > 0.86 ? (f - 0.86) / 0.14 : 0;        // from the north-west, round the north and the east, to the south side
      var rr = R + Math.sin(f * 21) * 0.6 - lift * 1.2;
      pts.push([cx + Math.cos(ang) * rr, 0.55 + Math.max(0, Math.sin(f * 17)) * 0.9 + lift * lift * 3.4, cz + Math.sin(ang) * rr * 0.93]);
    }
    // the body in three girths: the tail, the middle, the neck
    pkTube(pts.slice(0, 10), 0.34, skin, g, false, 40, 10); pkTube(pts.slice(9, 38), 0.62, skin, g, false, 90, 12); pkTube(pts.slice(37), 0.5, skin, g, false, 36, 12);
    sphere(0.2, skin, pts[0][0], pts[0][1], pts[0][2], g);
    for (i = 4; i < n - 2; i += 3) { var b = pts[i]; var ring = pkRing(i < 10 ? 0.37 : i > 37 ? 0.53 : 0.65, 0.05, gold, b[0], b[1], b[2], g, 16); var nx = pts[i + 1][0] - b[0], nz = pts[i + 1][2] - b[2]; ring.rotation.set(0, Math.atan2(nx, nz), 0); ring.rotateX(Math.PI / 2); }
    // the head
    var H = pts[n], Hp = pts[n - 2], hd = Math.atan2(H[0] - Hp[0], H[2] - Hp[2]);
    var head = new THREE.Group(); head.position.set(H[0], H[1], H[2]); head.rotation.y = hd; g.add(head);
    // the skull, the snout, the hood behind the head, and the lower jaw hanging open on its own hinge
    pkBlob(0.95, 0.5, 1.2, skinPlain, 0, 0.28, 0.6, head); pkBlob(0.62, 0.34, 0.8, skinPlain, 0, 0.2, 1.5, head);
    pkBlob(1.5, 0.95, 0.28, skinPlain, 0, 0.1, -0.35, head).rotation.x = -0.25; pkBlob(1.25, 0.8, 0.1, belly, 0, 0.08, -0.16, head).rotation.x = -0.25;
    pkBlob(0.7, 0.07, 1.25, mouthM, 0, 0.0, 0.95, head);
    var jaw = new THREE.Group(); jaw.position.set(0, -0.05, 0.1); jaw.rotation.x = 0.42; head.add(jaw);
    pkBlob(0.72, 0.2, 1.15, belly, 0, -0.16, 0.85, jaw); pkBlob(0.6, 0.05, 1.05, mouthM, 0, 0.0, 0.9, jaw);
    [-1, 1].forEach(function (s) { var lf = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.26, 6), std({ color: 0xf4f1e6, roughness: 0.4 })); lf.position.set(s * 0.22, 0.14, 1.75); jaw.add(lf); });
    [-1, 1].forEach(function (s) {
      sphere(0.17, glowMat(0xffc21a, 1.6), s * 0.56, 0.5, 1.0, head); pkBlob(0.03, 0.13, 0.04, std({ color: 0x101010, roughness: 0.3 }), s * 0.66, 0.5, 1.12, head);
      var fang = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.42, 6), std({ color: 0xf4f1e6, roughness: 0.4 })); fang.position.set(s * 0.3, -0.18, 1.95); fang.rotation.x = Math.PI; head.add(fang);
      pkBlob(0.2, 0.1, 0.34, skinPlain, s * 0.5, 0.66, 0.95, head);   // the brow
    });
    var tongue = box(0.06, 0.03, 1.1, pkPaint(0xc8342a, 0.5, 0.1), 0, -0.12, 2.2, head); tongue.rotation.x = 0.25;
    [-1, 1].forEach(function (s) { var fk = box(0.04, 0.03, 0.34, pkPaint(0xc8342a, 0.5, 0.1), s * 0.07, -0.26, 2.86, head); fk.rotation.set(0.25, s * 0.35, 0); });
    var mouth = new THREE.Vector3(0, -0.1, 1.9).applyAxisAngle(new THREE.Vector3(0, 1, 0), hd).add(head.position);
    var dirx = Math.sin(hd), dirz = Math.cos(hd);
    // boulders and clipped green under the coils
    for (i = 2; i < n - 4; i += 4) { pkBoulder(pts[i][0] + randf(-1.2, 1.2), pts[i][2] + randf(-1.2, 1.2), randf(0.5, 1.0), g); if (i % 8 === 2) pkTopiary(pts[i][0] + randf(-1.6, 1.6), pts[i][2] + 1.6, g, randf(0.9, 1.3)); }
    PK_KEEP.push([cx, cz, 12]);
    pkCfxBulbs(g, E.curve, E.F, E.len, [0x7fffb0, 0xfff2c0, 0x2fd08a], 1.4);
    // the lowest the track comes, away from the station: the loops' foot, where the mist lies
    var low = null; for (i = 0; i < 200; i++) { var u = i / 200, du = Math.abs(u - E.uPark); if (Math.min(du, 1 - du) < 0.12) continue; var p = E.curve.getPointAt(u); if (!low || p.y < low.y) low = p; }
    pkCfxRide({
      id: 'serpent',
      lead: function () { return E.cars[0] ? E.cars[0].g.position : null; },
      running: function () { return a.state === 'running'; },
      zones: [
        { x: low.x, z: low.z, r: 4.2, fire: function (p) { pkCfxMist(low.x, 0.6, low.z, 3.2, 14, 0xe6f4ea); pkCfxSay('pkHiss', p); } },
        { x: mouth.x, z: mouth.z, r: 13, fire: function (p) { pkCfxSmoke(mouth.x, mouth.y, mouth.z, dirx, dirz, 12, 0xd8f0dc); pkCfxSay('pkHiss', mouth, 1.4); } }
      ]
    });
    pkCfxEmit({ x: mouth.x, y: mouth.y, z: mouth.z, every: 3.2, fire: function (e) { pkCfxSmoke(e.x, e.y, e.z, dirx, dirz, 3, 0xd8f0dc); } });
    pkCfxEmit({ x: low.x, y: 0.5, z: low.z, every: 2.2, fire: function (e) { pkCfxMist(e.x, e.y, e.z, 3.5, 2, 0xe6f4ea); } });
    PK_CFX.serpent = { head: head, mouth: mouth };
  }

  // ── The scenery: Baron's Drop ────────────────────────────────────
  function pkCfxTorch(x, z, g) {
    var K = pkMats();
    pkBevelBox(0.36, 0.26, 0.36, K.stoneDark, x, 0.13, z, g, 0.03);
    pkRoundCyl(0.06, 2.5, K.iron, x, 1.25, z, g, 8);
    pkLathe([[0, 0], [0.12, 0], [0.3, 0.22], [0.26, 0.26], [0.1, 0.06], [0, 0.06]], K.iron, x, 2.5, z, g, 12);
    sphere(0.13, glowMat(0xff8a2a, 1.8), x, 2.74, z, g);
    solid(x - 0.18, x + 0.18, z - 0.18, z + 0.18, 0, 2.6);
    pkCfxEmit({ x: x, y: 2.8, z: z, every: 0.09, fire: function (e) {
      pkCfxPuff(e.x + randf(-0.05, 0.05), e.y, e.z + randf(-0.05, 0.05), randf(-0.12, 0.12), randf(0.9, 1.5), randf(-0.12, 0.12), randf(0.35, 0.6), 0.42, 0.12, Math.random() < 0.5 ? 0xffb030 : 0xff6a1a, 0, 0.85, true);
      if (Math.random() < 0.08) pkCfxPuff(e.x, e.y + 0.5, e.z, randf(-0.2, 0.2), randf(0.5, 0.9), randf(-0.2, 0.2), 1.6, 0.3, 0.9, 0x55504a, 0, 0.25);
    } });
  }
  function pkCfxBaron() {
    var a = PK.attrById.baron; if (!a || !a.g || !a.extra) return;
    var g = a.g, E = a.extra;
    [[40.4, 11.6], [40.4, 19.4], [60.6, 26.6], [60.6, 31.0]].forEach(function (q) { pkCfxTorch(q[0], q[1], g); });
    pkCfxBulbs(g, E.curve, E.F, E.len, [0xff5a3a, 0xffc24a, 0xff5a3a], 1.5);
    var zones = [];
    if (E.splash) zones.push({ x: E.splash.x, z: E.splash.z, r: 3.4, yMax: 3.2, fire: function (p, dx, dz, sp) { pkCfxSpray(E.splash.x, 0.5, E.splash.z, dx, dz, 1.5); pkCfxSay('pkSplash', p, 1.4); } });
    pkCfxRide({ id: 'baron', lead: function () { return E.cars[0] ? E.cars[0].g.position : null; }, running: function () { return a.state === 'running'; }, zones: zones });
  }

  // ── Building it, and the beat ────────────────────────────────────
  function pkCoasterFxBuild() {
    if (PK_CFX.built) return;
    PK_CFX.built = true;
    pkCfxCoaster(); pkCfxSerpent(); pkCfxBaron();
  }
  function pkCoasterFxTick(dt) {
    if (!PK_CFX.built || !dt) return;
    var d = Math.min(dt, 0.1); PK_CFX.t += d;
    pkCfxRides(d); pkCfxEmits(d); pkCfxParts(d); pkCfxRoar(d);
  }
  var _pkCfxPrevTheme = pkThemeBuild;
  pkThemeBuild = function () { _pkCfxPrevTheme(); pkCoasterFxBuild(); };
  hook('frame', function (dt) { pkCoasterFxTick(dt); });

  var _pkCfxPrevT = GAME.T;
  GAME.T = function () { var t = _pkCfxPrevT(); t.PK_CFX = PK_CFX; t.pkCoasterFxTick = pkCoasterFxTick; t.pkCfxSpray = pkCfxSpray; t.pkCfxMist = pkCfxMist; return t; };
