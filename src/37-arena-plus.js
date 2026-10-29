//@ Park Co, part 37: the Lindenburg Arena, finished - everything part 33 left plain, done the way Raveleijn does it. Outside:
//@ a castle front on the grandstand's back wall and a gilded portal over the audience gate. In the stand: the five riders'
//@ colour sections, a lighting truss of moving heads with their beams. On the stage: fire cannons, water jets in the moat,
//@ wind and fog vents, rocks that rise out of the sand, a light blast, fireworks over the city and music cues; each of the
//@ five gifts fires its own effect. Behind the wall: the stables (the horses stand in them between shows), the hydra's lift
//@ pit with its rams, the power unit, cast and wardrobe cabins, the gas store, the pump house and the prop rack. In the
//@ control room: a lighting and sound desk whose faders follow the show, and the PA microphone.
//@ The railway runs 5 m west of the arena's west wall (TR.W = -128): nothing here builds out past that wall.

  // ── The rider banners: a painted cloth for each of the five, used in the stand and on the castle front ──
  var PK_AR = { banner: {} };
  function pkArBanner(i) {
    if (PK_AR.banner[i]) return PK_AR.banner[i];
    var r = PK_TH_RIDERS[i], col = hexCss(r[3]), word = r[2].toUpperCase();
    var t = tex(256, 640, function (c, W, H) {
      c.fillStyle = col; c.fillRect(0, 0, W, H);
      var g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(0,0,0,0.25)'); g.addColorStop(0.5, 'rgba(255,255,255,0.08)'); g.addColorStop(1, 'rgba(0,0,0,0.25)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.strokeStyle = '#e3c26a'; c.lineWidth = 10; c.strokeRect(14, 14, W - 28, H - 120);
      // the swallow tail
      c.fillStyle = 'rgba(0,0,0,0)'; c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.moveTo(0, H); c.lineTo(W / 2, H - 90); c.lineTo(W, H); c.closePath(); c.fill(); c.globalCompositeOperation = 'source-over';
      // the element's sign
      c.save(); c.translate(W / 2, 230); c.strokeStyle = '#f6e7b8'; c.fillStyle = '#f6e7b8'; c.lineWidth = 12; c.lineCap = 'round';
      if (i === 0) { for (var k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-70, -40 + k * 40); c.bezierCurveTo(-20, -70 + k * 40, 20, -10 + k * 40, 70, -40 + k * 40); c.stroke(); } }
      else if (i === 1) { c.beginPath(); c.moveTo(0, 80); c.bezierCurveTo(-90, 20, -20, -40, -30, -100); c.bezierCurveTo(20, -50, 30, -80, 20, -110); c.bezierCurveTo(90, -30, 70, 40, 0, 80); c.fill(); }
      else if (i === 2) { c.beginPath(); c.moveTo(0, -100); c.bezierCurveTo(70, -10, 70, 70, 0, 80); c.bezierCurveTo(-70, 70, -70, -10, 0, -100); c.fill(); }
      else if (i === 3) { c.beginPath(); c.moveTo(-90, 70); c.lineTo(-20, -60); c.lineTo(10, 0); c.lineTo(40, -90); c.lineTo(100, 70); c.closePath(); c.fill(); }
      else { c.beginPath(); c.arc(0, 0, 40, 0, 6.28); c.fill(); for (var q = 0; q < 12; q++) { var a = q * Math.PI / 6; c.beginPath(); c.moveTo(Math.cos(a) * 55, Math.sin(a) * 55); c.lineTo(Math.cos(a) * 95, Math.sin(a) * 95); c.stroke(); } }
      c.restore();
      c.fillStyle = '#f6e7b8'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 54px Georgia, serif'; c.fillText(r[1].toUpperCase(), W / 2, 400);
      c.font = 'bold 30px Georgia, serif'; c.fillText(word, W / 2, 455);
    });
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return (PK_AR.banner[i] = std({ map: t, roughness: 0.85, side: THREE.DoubleSide, transparent: true, alphaTest: 0.5 }));
  }
  // a banner on a gold pole, hanging; w wide, h long, facing +z in its frame
  function pkArHang(parent, i, x, y, z, ry, w, h) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; parent.add(g);
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), pkArBanner(i)); m.position.y = -h / 2; g.add(m);
    pkRoundCyl(0.035, w + 0.3, pkMats().gold, 0, 0.02, 0, g, 8).rotation.z = Math.PI / 2;
    [-1, 1].forEach(function (s) { sphere(0.06, pkMats().gold, s * (w / 2 + 0.17), 0.02, 0, g); });
    return g;
  }

  // ── The particles the effects throw: sparks, flame, spray and shells, additive, each with its own gravity ──
  var PK_AR_SP = [];
  function pkArSpark(x, y, z, col, n, o) {
    o = o || {};
    var geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), vel = [];
    for (var i = 0; i < n; i++) {
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      var th = Math.random() * 6.2832, ph = o.cone !== undefined ? Math.random() * o.cone : Math.acos(2 * Math.random() - 1), sp = (o.speed || 6) * randf(0.6, 1);
      var dx = Math.sin(ph) * Math.cos(th), dy = Math.cos(ph), dz = Math.sin(ph) * Math.sin(th);
      vel.push([dx * sp + (o.wx || 0), dy * sp, dz * sp + (o.wz || 0)]);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({ color: col, size: o.size || 0.16, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending });
    var pts = new THREE.Points(geo, mat); pts.frustumCulled = false; scene.add(pts);
    PK_AR_SP.push({ pts: pts, vel: vel, t: 0, life: o.life || 1.4, grav: o.grav === undefined ? 4 : o.grav, drag: o.drag || 0.6 });
  }
  function pkArSparkTick(dt) {
    for (var i = PK_AR_SP.length - 1; i >= 0; i--) {
      var b = PK_AR_SP[i], p = b.pts.geometry.attributes.position.array, d = Math.max(0, 1 - b.drag * dt);
      b.t += dt;
      for (var k = 0; k < b.vel.length; k++) { var v = b.vel[k]; v[0] *= d; v[2] *= d; v[1] = v[1] * d - b.grav * dt; p[k * 3] += v[0] * dt; p[k * 3 + 1] += v[1] * dt; p[k * 3 + 2] += v[2] * dt; }
      b.pts.geometry.attributes.position.needsUpdate = true; b.pts.material.opacity = Math.max(0, 1 - b.t / b.life);
      if (b.t >= b.life) { scene.remove(b.pts); b.pts.geometry.dispose(); b.pts.material.dispose(); PK_AR_SP.splice(i, 1); }
    }
  }
  animate(pkArSparkTick);
  // the show's music cues: heard in and round the arena, not across the park
  function pkArNear(r) { return typeof player !== 'undefined' && player && Math.hypot(player.x - PK_TH.CX, player.z - PK_TH.CZ) < (r || 70); }
  function pkArSfx(k) { if (pkArNear()) sfx(k); }
  SFX.pkArGate = function (t) { [[392, 0], [523, 0.18], [659, 0.36], [784, 0.54], [659, 0.9], [784, 1.08], [1047, 1.26]].forEach(function (n) { sTone('sawtooth', n[0], t + n[1], 0.3, 0.03, { lp: 1900 }); sTone('triangle', n[0] / 2, t + n[1], 0.3, 0.03); }); sThud(t, 70, 0.12, 0.5); sThud(t + 1.26, 70, 0.12, 0.6); };
  SFX.pkArDread = function (t) { [110, 104, 98].forEach(function (f, i) { sTone('sawtooth', f, t + i * 0.9, 1.2, 0.05, { lp: 500, attack: 0.3 }); sTone('sine', f / 2, t + i * 0.9, 1.4, 0.06); }); sNoise(t, 3.0, 0.05, { type: 'lowpass', freq: 300, shape: 'swell' }); };
  SFX.pkArDrums = function (t) { for (var i = 0; i < 8; i++) { sThud(t + i * 0.25, i % 4 === 3 ? 60 : 85, 0.16, 0.2); sNoise(t + i * 0.25, 0.05, 0.05, { type: 'lowpass', freq: 900 }); } };
  SFX.pkArHeroic = function (t) { [[523, 0, 0.4], [659, 0.4, 0.4], [784, 0.8, 0.4], [1047, 1.2, 1.2], [880, 2.4, 0.3], [1047, 2.7, 1.4]].forEach(function (n) { sTone('sawtooth', n[0], t + n[1], n[2], 0.03, { lp: 2200 }); sTone('triangle', n[0] / 2, t + n[1], n[2], 0.04); sTone('sine', n[0] * 1.5, t + n[1], n[2], 0.01); }); };
  SFX.pkArWhoosh = function (t) { sNoise(t, 0.9, 0.12, { type: 'bandpass', freq: 900, q: 0.8, shape: 'swell' }); };
  SFX.pkArSplash = function (t) { sNoise(t, 1.2, 0.12, { type: 'lowpass', freq: 2400, fade: true }); sNoise(t + 0.1, 0.8, 0.06, { freq: 5000, fade: true }); };
  SFX.pkArRumble = function (t) { sNoise(t, 2.2, 0.3, { type: 'lowpass', freq: 160, shape: 'swell' }); sTone('sine', 38, t, 2.2, 0.15, { f1: 30 }); };
  SFX.pkArShell = function (t) { sNoise(t, 0.05, 0.12, { type: 'lowpass', freq: 1200 }); sTone('sine', 700, t, 0.6, 0.015, { f1: 2200 }); sThud(t + 0.7, 80, 0.2, 0.5); sNoise(t + 0.7, 0.6, 0.12, { type: 'lowpass', freq: 1800, fade: true }); };

  // ── The build ────────────────────────────────────────────────────
  // called by part 33 at the end of the arena's build, in the arena's frame (g at the arena's centre)
  function pkArenaPlus(a, g, M, G, X, BF, BZ0, BZ1, BX, BH, S_) {
    var K = pkMats(), FX = X.fx = { cannon: 0, water: 0, wind: 0, earth: 0, blast: 0, works: 0, sweep: false, rider: -1 };
    var mesh = function (geo, mat, x, y, z, par) { var m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; (par || g).add(m); return m; };
    var iron = M.iron, gold = M.gold, stone = M.stone, timber = M.timber;
    var hazard = pkStripes('#f0c04a', '#1b1b1b');

    // ── 1. The castle front: the grandstand's back wall toward the Dark Woods street ──
    var BZ = G.back + 0.3;                        // the outer face of the back wall
    box(G.x * 2 + 0.6, 1.3, 0.35, stone, 0, 0.65, BZ + 0.17, g);
    box(G.x * 2 + 0.7, 0.18, 0.45, M.stoneDark, 0, 1.36, BZ + 0.2, g);
    for (var bx = -G.x; bx <= G.x + 0.01; bx += G.x / 3.5) {
      pkBevelBox(0.6, 6.6, 0.55, stone, bx, 3.3, BZ + 0.27, g, 0.03);
      pkFtSpire(g, bx, 6.6, BZ + 0.27, 0.38, 0.9, M.slate, 4);
    }
    // arched windows between the buttresses, lit warm by the city circuit, and a banner in every other bay
    var bay = G.x / 3.5;
    for (var wi = 0; wi < 7; wi++) {
      var wx = -G.x + bay * (wi + 0.5);
      box(1.15, 2.6, 0.06, M.win, wx, 3.9, BZ + 0.04, g);
      var ar = mesh(new THREE.CircleGeometry(0.575, 16, 0, Math.PI), M.win, wx, 5.2, BZ + 0.04); ar.castShadow = false;
      var ring = mesh(new THREE.TorusGeometry(0.62, 0.09, 6, 16, Math.PI), stone, wx, 5.2, BZ + 0.08); ring.castShadow = false;
      box(1.4, 0.16, 0.25, stone, wx, 2.52, BZ + 0.12, g);
      box(0.06, 3.1, 0.08, timber, wx, 3.95, BZ + 0.08, g);
      if (wi % 2 === 0) pkArHang(g, (wi / 2) % 5, wx, 7.0, BZ + 0.5, 0, 1.3, 3.4);
    }
    // the crenellated parapet along the top of the wall and corner towers with their spires
    for (var cx2 = -G.x; cx2 < G.x; cx2 += 1.2) box(0.62, 0.7, 0.5, stone, cx2 + 0.31, 7.55, BZ + 0.05, g);
    // the west corner's tower (the east corner is the stair hall's, with its own turret)
    [-1].forEach(function (s) {
      var tx = s * (G.x + 0.4), tz = BZ + 0.2;
      pkRoundCyl(1.35, 9.5, M.cream, tx, 4.75, tz, g, 18);
      pkRoundCyl(1.5, 0.55, M.brick, tx, 0.28, tz, g, 18);
      pkRoundCyl(1.45, 0.3, gold, tx, 6.2, tz, g, 18);
      pkRoundCyl(1.55, 0.35, timber, tx, 9.6, tz, g, 18);
      for (var k = 0; k < 2; k++) box(0.34, 0.9, 0.08, M.win, tx, 3 + k * 3.5, tz + 1.33, g);
      pkFtSpire(g, tx, 9.75, tz, 1.95, 5.2, M.slate, 10);
      S_(tx - 1.4, tx + 1.4, tz - 1.4, tz + 1.4, 0, 9.5);
    });
    // the gilt frame round the arena's name and two lanterns
    pkBevelBox(10.4, 1.7, 0.3, gold, 0, 8.75, BZ + 0.15, g, 0.04);
    sign(['THE LINDENBURG ARENA'], 10, 1.35, 0, 8.75, BZ + 0.31, 0, { bg: '#3a0e14', fg: '#f0c04a' }, g);
    [-1, 1].forEach(function (s) { pkFtSpire(g, s * 5.45, 7.9, BZ + 0.15, 0.35, 1.9, M.slate, 4); });
    [-2.1, 2.1].forEach(function (lx) { box(0.1, 0.5, 0.35, iron, lx, 6.85, BZ + 0.45, g); mesh(new THREE.SphereGeometry(0.2, 12, 10), M.lampGlow, lx, 6.5, BZ + 0.65); });
    // the low stretch west of the stand: a crenellated top and the riders' shields
    for (var cx3 = -26; cx3 < -G.x - 1.6; cx3 += 1.2) box(0.6, 0.6, 0.6, stone, cx3 + 0.3, 3.6, 21.4, g);
    for (var sh = 0; sh < 4; sh++) { var shx = -24.5 + sh * 2.5; pkRoundCyl(0.42, 0.06, gold, shx, 2.2, 21.72, g, 16).rotation.x = Math.PI / 2; pkRoundCyl(0.36, 0.08, std({ color: PK_TH_RIDERS[sh % 5][3], roughness: 0.4, metalness: 0.4 }), shx, 2.2, 21.75, g, 16).rotation.x = Math.PI / 2; }

    // ── 2. The stair hall: the audience's way in. The ride's gates in the hall's east face open on the head of the queue; a
    // lobby, the stair up the hall's west side, the landing at the height of the stand's top walkway, and through the stand's
    // east wall onto it. Nobody sees the city until they come out at the top of the stand. ──
    var HL = PK_TH_HALL, HX0 = G.x + 0.3, HX1 = HL.x1, HZ0 = HL.z0, HZ1 = G.back, HH = 5.6, top = G.h0 + G.rise * (G.rows - 1);
    var hmz = (HZ0 + HZ1) / 2, wallM = M.cream, trimM = stone;
    // the forecourt's paving carried on east, under the queue's new lane and the way out round it
    pkPaved(4.6, 20.4, M.pave, 28.3, 0.021, 19.9, 2.4, g);
    // the walls: north (where the old audience gate stood), the east face with the gates' opening, the south end
    box(HX1 - HX0 + 0.3, HH, 0.3, wallM, (HX0 + HX1) / 2, HH / 2, HZ0, g); S_(HX0, HX1 + 0.15, HZ0 - 0.15, HZ0 + 0.15, 0, HH);
    box(0.6, 5.0, 0.3, wallM, HX1 + 0.3, 2.5, HZ0, g); S_(HX1, 21.0, HZ0 - 0.15, HZ0 + 0.15, 0, 5);
    var GZ0 = 10.6, GZ1 = 13.6, GTOP = 3.8;
    [[HZ0, GZ0], [GZ1, HZ1]].forEach(function (k) { box(0.3, HH, k[1] - k[0], wallM, HX1, HH / 2, (k[0] + k[1]) / 2, g); S_(HX1 - 0.15, HX1 + 0.15, k[0], k[1], 0, HH); });
    box(0.3, HH - GTOP, GZ1 - GZ0, wallM, HX1, GTOP + (HH - GTOP) / 2, (GZ0 + GZ1) / 2, g);
    box(HX1 - HX0 + 0.3, HH, 0.3, wallM, (HX0 + HX1) / 2, HH / 2, HZ1 - 0.15, g); S_(HX0, HX1 + 0.15, HZ1 - 0.3, HZ1, 0, HH);
    // the west face, over the stand's own wall (4.4 m) and over the way through onto the stand, up to the eaves: without it
    // the hall stood open to the stand's roof and the sky
    box(0.3, HH - 4.4, HL.s1 - HZ0, wallM, HX0 + 0.15, (HH + 4.4) / 2, (HZ0 + HL.s1) / 2, g);
    box(0.3, HH - top - 2.55, HZ1 - HL.s1, wallM, HX0 + 0.15, (HH + top + 2.55) / 2, (HL.s1 + HZ1) / 2, g);
    // a stone base course round the outside (broken for the gates, so nobody walks into it) and a cornice all round
    [[HZ0 - 0.05, GZ0 - 0.35], [GZ1 + 0.35, HZ1 + 0.05]].forEach(function (k) { box(0.36, 1.0, k[1] - k[0], trimM, HX1 + 0.02, 0.5, (k[0] + k[1]) / 2, g); });
    [[(HX0 + HX1) / 2, HZ0 - 0.02, HX1 - HX0 + 0.4, 0.36], [(HX0 + HX1) / 2, HZ1 - 0.13, HX1 - HX0 + 0.4, 0.36]].forEach(function (k) { box(k[2], 1.0, k[3], trimM, k[0], 0.5, k[1], g); });
    [[HX1 + 0.02, hmz, 0.36, HZ1 - HZ0 + 0.1], [HX0 + 0.15, hmz, 0.36, HZ1 - HZ0 + 0.1], [(HX0 + HX1) / 2, HZ0 - 0.02, HX1 - HX0 + 0.4, 0.36], [(HX0 + HX1) / 2, HZ1 - 0.13, HX1 - HX0 + 0.4, 0.36]].forEach(function (k) { box(k[2] + 0.1, 0.22, k[3] + 0.1, trimM, k[0], HH + 0.11, k[1], g); });
    var rhw = (HX1 - HX0) / 2 + 0.25, rise = 1.5, slope = Math.atan2(rise, rhw), rlen = Math.hypot(rise, rhw), rmx = (HX0 + HX1) / 2;
    [-1, 1].forEach(function (s) { var r = box(rlen, 0.16, HZ1 - HZ0 + 0.5, M.slate, rmx + s * rhw / 2, HH + 0.22 + rise / 2, hmz, g); r.rotation.z = -s * slope; });
    var gab = new THREE.Shape(); gab.moveTo(-rhw + 0.25, 0); gab.lineTo(rhw - 0.25, 0); gab.lineTo(0, rise - 0.1); gab.closePath();
    [HZ0, HZ1 - 0.15].forEach(function (z) { var gm = mesh(new THREE.ShapeGeometry(gab), wallM, rmx, HH + 0.22, z); gm.material = std({ map: TEX.plaster, color: 0xefe3c8, roughness: 0.9, side: THREE.DoubleSide }); });
    pkRoundCyl(0.06, HZ1 - HZ0 + 0.5, gold, rmx, HH + 0.22 + rise + 0.02, hmz, g, 8).rotation.x = Math.PI / 2;
    // tall windows along the east face, lit from inside at night
    [15.0, 16.8, 18.6, 20.2].forEach(function (z) { box(0.06, 1.6, 0.8, M.win, HX1 + 0.16, 3.6, z, g); var ar = mesh(new THREE.CircleGeometry(0.4, 12, 0, Math.PI), M.win, HX1 + 0.16, 4.4, z); ar.rotation.y = Math.PI / 2; ar.castShadow = false; box(0.2, 0.12, 1.0, trimM, HX1 + 0.18, 2.75, z, g); });
    // the entrance: an arched portal round the gates, pilasters with spires, a frontispiece with the show's name and the crest
    var pmz = (GZ0 + GZ1) / 2, px = HX1 + 0.2;
    // a gilt architrave round the doorway, jambs and a head with a keystone, inside the pilasters
    [GZ0 - 0.06, GZ1 + 0.06].forEach(function (z) { box(0.14, GTOP + 0.06, 0.12, gold, px - 0.08, (GTOP + 0.06) / 2, z, g); });
    box(0.16, 0.22, GZ1 - GZ0 + 0.24, gold, px - 0.07, GTOP + 0.11, pmz, g);
    box(0.2, 0.42, 0.34, gold, px - 0.05, GTOP + 0.12, pmz, g);
    box(0.12, 0.18, GZ1 - GZ0, trimM, HX1 - 0.2, GTOP + 0.09, pmz, g);   // the plain head inside
    [GZ0 - 0.35, GZ1 + 0.35].forEach(function (z) { pkBevelBox(0.55, 6.4, 0.55, trimM, px + 0.1, 3.2, z, g, 0.03); pkFtSpire(g, px + 0.1, 6.4, z, 0.4, 1.6, M.slate, 4); S_(px - 0.2, px + 0.4, z - 0.28, z + 0.28, 0, 6.4); });
    pkBevelBox(0.35, 2.6, GZ1 - GZ0 + 0.5, wallM, px, HH + 1.1, pmz, g, 0.03);
    for (var cm = GZ0 - 0.1; cm <= GZ1 + 0.11; cm += 0.75) box(0.35, 0.45, 0.4, trimM, px, HH + 2.6, cm, g);
    sign(['THE FIVE RIDERS', 'OF LINDENBURG'], 3.3, 0.95, px + 0.2, HH + 0.85, pmz, Math.PI / 2, { bg: '#2a1a12', fg: '#f0c04a' }, g);
    var crestT = tex(256, 256, function (c, W, H) { c.fillStyle = '#3a0e14'; c.beginPath(); c.arc(W / 2, H / 2, 124, 0, 6.28); c.fill(); c.strokeStyle = '#e3c26a'; c.lineWidth = 10; c.stroke(); PK_PN_CRESTS.arena(c, W / 2, H / 2, 105, { ink: '#f2e2b8', acc: '#e3c26a', zone2: '#3a0e14' }); });
    var crest = mesh(new THREE.CircleGeometry(0.6, 32), std({ map: crestT, roughness: 0.5, metalness: 0.2 }), px + 0.19, HH + 1.95, pmz); crest.rotation.y = Math.PI / 2; crest.castShadow = false;
    pkBkWaitBoard(a, g, px + 0.22, GTOP + 0.65, pmz, Math.PI / 2);
    [15.6, 17.6, 19.6].forEach(function (z, i) { pkArHang(g, i * 2 % 5, px + 0.03, 5.1, z, Math.PI / 2, 0.8, 2.0); });
    // the slim turret on the hall's south-east corner, matching the castle front's tower on the far side
    pkRoundCyl(0.65, 8.2, M.cream, 20.2, 4.1, 21.6, g, 14); pkRoundCyl(0.72, 0.3, gold, 20.2, 5.6, 21.6, g, 14);
    pkFtSpire(g, 20.2, 8.2, 21.6, 0.95, 2.8, M.slate, 10); S_(19.55, 20.85, 20.95, 22.25, 0, 8.2);
    // the gates: the ride's own, two iron leaves that swing in to the lobby, clear of the queue (shut, they stop you too)
    [[GZ0, 1], [GZ1, -1]].forEach(function (h) {
      var hinge = pkMover(g, HX1 + 0.18, 0, h[0]), w = (GZ1 - GZ0) / 2 - 0.04;
      // a railed leaf: a kick plate, a lower and a middle rail, the stiles and the bars between, so the gate reads as iron work
      box(0.06, 0.4, w, iron, 0, 0.25, h[1] * w / 2, hinge);
      [0.47, 1.25].forEach(function (ry) { box(0.07, 0.07, w, iron, 0, ry, h[1] * w / 2, hinge); });
      [0.03, w - 0.03].forEach(function (sz) { box(0.08, 1.9, 0.06, iron, 0, 1.0, h[1] * sz, hinge); });
      for (var v = 0.15; v < w; v += 0.16) box(0.03, 1.45, 0.03, iron, 0, 1.2, h[1] * v, hinge);
      box(0.1, 0.12, w, gold, 0, 1.95, h[1] * w / 2, hinge);
      pkCtl(a).gateObjs.push(function (t) { hinge.rotation.y = -h[1] * t * 1.45; });
    });
    var gxw = PK_TH.CX + HX1, gz0 = PK_TH.CZ + GZ0, gz1 = PK_TH.CZ + GZ1, Cg = pkCtl(a), _pkArPrevCollides = GAME.collides;
    GAME.collides = function (x, z, opt) { if (_pkArPrevCollides && _pkArPrevCollides(x, z, opt)) return true; return Cg.gateT < 0.5 && Math.abs(x - gxw) < 0.3 && z > gz0 && z < gz1; };
    // inside: the stair along the west wall, step by step, with its balustrade
    var NST = 15, sd = (HL.s1 - HL.s0) / NST, swx0 = HX0, swx1 = HL.sx1, swm = (swx0 + swx1) / 2;
    for (var st = 0; st < NST; st++) { var sh2 = top * (st + 1) / NST; box(swx1 - swx0, sh2, sd + 0.01, st % 2 ? stone : M.stoneDark, swm, sh2 / 2, HL.s0 + (st + 0.5) * sd, g); box(swx1 - swx0, 0.03, 0.06, M.nosing, swm, sh2 + 0.01, HL.s0 + st * sd + 0.04, g); }
    for (var bp = 0; bp <= NST; bp += 3) { var bz = HL.s0 + bp * sd, by = top * bp / NST; pkRoundCyl(0.03, 1.0, iron, swx1 + 0.04, by + 0.5, bz, g, 6); }
    pkRod(swx1 + 0.04, 1.0, HL.s0, swx1 + 0.04, top + 1.0, HL.s1, 0.04, gold, g, 8);
    S_(swx1 - 0.02, swx1 + 0.1, HL.s0, HL.s1, 0, 1.0);
    // the landing, and under its east half a store that nobody walks through
    box(HX1 - HX0, 0.25, HZ1 - HL.s1 - 0.15, M.wood, (HX0 + HX1) / 2, top - 0.125, (HL.s1 + HZ1 - 0.15) / 2, g);
    box(HX1 - swx1 - 0.15, top - 0.25, 0.2, wallM, (swx1 + HX1 - 0.15) / 2, (top - 0.25) / 2, HL.s1 + 0.1, g);
    box(0.9, 1.9, 0.05, M.wood, (swx1 + HX1) / 2, 0.95, HL.s1 - 0.0, g); sign(['STORE'], 0.6, 0.16, (swx1 + HX1) / 2, 2.05, HL.s1 - 0.03, Math.PI, { bg: '#1b232c', fg: '#e8e4d8' }, g);
    S_(swx1 + 0.05, HX1 - 0.15, HL.s1, HZ1 - 0.3, 0, top - 0.3);
    for (var lp = swx1 + 0.3; lp < HX1 - 0.2; lp += 0.5) pkRoundCyl(0.025, 1.0, iron, lp, top + 0.5, HL.s1 + 0.15, g, 6);
    pkRoundCyl(0.035, HX1 - swx1 - 0.3, gold, (swx1 + HX1) / 2, top + 1.0, HL.s1 + 0.15, g, 8).rotation.z = Math.PI / 2;
    // the way through onto the stand, framed, with the riders' sections signed
    box(0.35, 0.4, HZ1 - HL.s1 - 0.4, trimM, G.x + 0.15, top + 2.35, (HL.s1 + HZ1) / 2, g);
    sign(['TO YOUR SEATS', 'FIND YOUR RIDER\'S COLOUR'], 2.4, 0.5, G.x + 0.33, top + 2.8, (HL.s1 + HZ1) / 2, Math.PI / 2, { bg: '#2a1a12', fg: '#f0c04a' }, g);
    // a velvet curtain in the way through, on the stand's side: drawn across while the show runs, so the hall sees nothing of
    // it, and gathered to the jambs the rest of the time for the audience to come in and go out (the tick draws it)
    var dcZ0 = HL.s1 + 0.05, dcZ1 = G.back - 0.05, dcW = (dcZ1 - dcZ0) / 2, dcTop = top + 1.9, dcX = G.x - 0.08;
    var velvet = std({ color: 0x6a1420, roughness: 0.92 }), dcHalves = [];
    [[dcZ0, 1], [dcZ1, -1]].forEach(function (h) {
      var piv = pkMover(g, dcX, top + 0.02, h[0]);
      for (var f = 0; f < 10; f++) box(0.05, dcTop - top - 0.02, dcW / 10 + 0.03, velvet, (f % 2) * 0.06, (dcTop - top - 0.02) / 2, h[1] * (f + 0.5) * dcW / 10, piv);
      piv.scale.z = 0.12; dcHalves.push(piv);
    });
    box(0.14, 0.4, dcZ1 - dcZ0 + 0.3, velvet, dcX - 0.06, dcTop + 0.2, (dcZ0 + dcZ1) / 2, g);
    box(0.15, 0.06, dcZ1 - dcZ0 + 0.3, gold, dcX - 0.06, dcTop + 0.02, (dcZ0 + dcZ1) / 2, g);
    FX.doorCur = { halves: dcHalves, k: 0 };
    // the stand's side walls carried on up to the roof, both sides: the stand was open above them, so from the seats you
    // looked out over the hall's roof and from the hall into the stand. The roof falls toward the back; the walls follow it.
    var roofUnder = function (z) { return 7.35 - 0.09 - (z - 15.5) * Math.sin(Math.atan2(0.6, 13)) + 0.06; };
    [-1, 1].forEach(function (s) {
      var lo = s > 0 ? [[9.5, 4.4], [HL.s1, 4.4], [HL.s1, top + 2.3], [G.back, top + 2.3]] : [[9.5, 4.4], [G.back, 4.4]];
      var sh = new THREE.Shape(); sh.moveTo(lo[0][0], lo[0][1]); lo.slice(1).forEach(function (p) { sh.lineTo(p[0], p[1]); });
      sh.lineTo(G.back, roofUnder(G.back)); sh.lineTo(9.5, roofUnder(9.5)); sh.closePath();
      var swg = new THREE.ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: false }), uv = swg.attributes.uv;
      for (var ui = 0; ui < uv.count; ui++) uv.setXY(ui, uv.getX(ui) / (G.back - 9.5), uv.getY(ui) / 4.4);   // the stone as the wall below wears it
      var sw = mesh(swg, M.stone, s > 0 ? G.x + 0.3 : -G.x, 0, 0);
      sw.rotation.y = -Math.PI / 2; sw.receiveShadow = true;
    });
    // the lobby: the five riders' banners, a sign up the stair, lamps
    sign(['THE STANDS', 'UP THE STAIR'], 1.6, 0.45, swm, 2.3, HZ0 + 0.17, 0, { bg: '#2a1a12', fg: '#f0c04a' }, g);
    [14.6, 16.4].forEach(function (z, i) { pkArHang(g, [1, 3][i], HX1 - 0.17, 4.6, z, -Math.PI / 2, 0.8, 1.8); });   // clear of the gates' opening (z 10.6 to 13.6) and over head height
    pkArHang(g, 0, 16.2, 4.6, HZ0 + 0.17, 0, 0.8, 1.6); pkArHang(g, 2, 19.2, 4.6, HZ0 + 0.17, 0, 0.8, 1.6);
    [[16.3, 11.2], [19.0, 11.2], [19.0, 14.0], [16.3, 18.6], [19.0, 19.6]].forEach(function (p) { var y = p[1] >= HL.s1 ? top + 2.7 : HH - 0.4; box(0.3, 0.06, 0.3, M.iron, p[0], y + 0.1, p[1], g); mesh(new THREE.SphereGeometry(0.14, 10, 8), M.lampGlow, p[0], y, p[1]); });
    box(2.4, 0.02, 2.2, std({ color: 0x5a1a22, roughness: 0.95 }), 19.0, 0.03, 11.6, g);

    // ── 3. The stand: the five riders' colour sections, their banners on the back wall, the truss and its heads ──
    var cols = [-13, -11, -9, -7, -5, 5, 7, 9, 11, 13];
    (a.seats || []).forEach(function (st) {
      var ci = cols.indexOf(Math.round(st.x)), ri = ci < 0 ? 0 : Math.floor(ci / 2);
      box(1.55, 0.05, 0.38, pkPnStd({ color: PK_TH_RIDERS[ri][3], roughness: 0.75 }), st.x, st.y + 0.76 + 0.045, st.z, g);
      box(1.55, 0.3, 0.05, pkPnStd({ color: PK_TH_RIDERS[ri][3], roughness: 0.75 }), st.x, st.y + 0.76 + 0.25, st.z + 0.2, g);
    });
    [[-12, 0], [-8, 1], [-5, 2], [5, 2], [8, 3], [12, 4]].forEach(function (b) { pkArHang(g, b[1], b[0], 6.4, G.back - 0.05, Math.PI, 1.2, 2.6); });
    // the truss along the roof's front edge: two chords and the lacing, six moving heads hung under it, a speaker stack each end
    var TZ = 8.2, TY = 6.95, trussM = pkPnStd({ color: 0x2a2d31, roughness: 0.45, metalness: 0.7 });
    [[0, 0], [0, 0.4], [0.4, 0], [0.4, 0.4]].forEach(function (o) { pkRoundCyl(0.03, 30, trussM, 0, TY + o[0], TZ + o[1], g, 6).rotation.z = Math.PI / 2; });
    for (var lx = -15; lx < 15; lx += 0.8) { pkRod(lx, TY, TZ, lx + 0.4, TY + 0.4, TZ, 0.015, trussM, g, 4); pkRod(lx, TY, TZ + 0.4, lx + 0.4, TY + 0.4, TZ + 0.4, 0.015, trussM, g, 4); }
    [-1, 1].forEach(function (s) { pkRod(s * 15, TY + 0.4, TZ + 0.2, s * 15, 7.3, 9.3, 0.04, trussM, g, 6); for (var sp = 0; sp < 3; sp++) pkBevelBox(0.7, 0.55, 0.6, pkPnStd({ color: 0x1a1c1f, roughness: 0.8 }), s * 13.8, TY - 0.35 - sp * 0.6, TZ + 0.2, g, 0.03); });
    FX.heads = [];
    var beamGeo = new THREE.ConeGeometry(1.1, 16, 18, 1, true); beamGeo.translate(0, -8, 0);
    [-12, -7.5, -2.5, 2.5, 7.5, 12].forEach(function (hx, i) {
      var yoke = pkMover(g, hx, TY - 0.05, TZ + 0.2);
      box(0.06, 0.32, 0.36, trussM, 0, -0.16, 0, yoke);
      var head = new THREE.Group(); head.position.y = -0.36; yoke.add(head);
      box(0.3, 0.42, 0.3, pkPnStd({ color: 0x1d1f22, roughness: 0.5, metalness: 0.5 }), 0, -0.1, 0, head);
      var lensM = pkThGlow(0xffffff, 0.0), lens = new THREE.Mesh(new THREE.CircleGeometry(0.11, 16), lensM); lens.rotation.x = Math.PI / 2; lens.position.y = -0.32; head.add(lens);
      var beamM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.FrontSide });   // one face: both faces added every beam twice
      beamM.userData.noBake = true;
      var beam = new THREE.Mesh(beamGeo, beamM); beam.position.y = -0.32; beam.castShadow = false; head.add(beam);
      FX.heads.push({ yoke: yoke, head: head, lens: lensM, beam: beamM, i: i, x: hx, aim: new THREE.Vector3(0, 0, -2), cur: new THREE.Vector3(0, 0, -2), col: new THREE.Color(0xffffff), k: 0 });
    });

    // ── 4. The stage's effects hardware ──
    // fire cannons along the foot of the houses: a steel box with its nozzle, the flame a glowing column that the tick sizes
    FX.cannons = [-19, -14, -9, 9.6, 14, 19].map(function (cx) {
      var z = -12.75;
      pkBevelBox(0.5, 0.45, 0.5, pkPnStd({ color: 0x2a2724, roughness: 0.6, metalness: 0.6 }), cx, 0.225, z, g, 0.03);
      box(0.52, 0.06, 0.52, hazard, cx, 0.46, z, g);
      pkRoundCyl(0.08, 0.3, iron, cx, 0.6, z, g, 10);
      var fl = pkMover(g, cx, 0.75, z), fm = pkThGlow(0xff7a1a, 0.0, 0x2a0a04);
      var cone = new THREE.Mesh(new THREE.ConeGeometry(0.45, 4, 12, 1, true), fm); cone.position.y = 2; fl.add(cone); fl.scale.set(1, 0.001, 1); fl.visible = false;
      S_(cx - 0.25, cx + 0.25, z - 0.25, z + 0.25, 0, 0.5);
      return { x: cx, z: z, g: fl, m: fm };
    });
    // the moat's water jets: nozzles under the surface, the column a pale tube the tick raises
    var jetM = new THREE.MeshBasicMaterial({ color: 0xd8f0ff, transparent: true, opacity: 0.55, depthWrite: false }); jetM.userData.noBake = true;
    FX.jets = [9.8, 11.2, 12.6, 14.0, 15.4, 16.6].map(function (jx, i) {
      var jz = -9.6 + (i % 2 ? 1.1 : -1.1), col = pkMover(g, jx, 0.2, jz);
      var tube = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.14, 1, 8, 1, true), jetM); tube.position.y = 0.5; col.add(tube); col.scale.set(1, 0.001, 1); col.visible = false;
      return { x: jx, z: jz, g: col, ph: i * 0.7 };
    });
    // wind and fog vents in the sand by the market side, grilled hatches
    FX.vents = [[-18.5, -4], [-18.5, 2], [-12, -11], [12, 6.5], [-6, 7]].map(function (v) { box(0.7, 0.03, 0.7, pkPnStd({ color: 0x2b2a28, roughness: 0.7, metalness: 0.5 }), v[0], 0.065, v[1], g); for (var q = -2; q <= 2; q++) box(0.66, 0.035, 0.03, iron, v[0], 0.07, v[1] + q * 0.13, g); return { x: v[0], z: v[1] }; });
    // the earth rocks: three boulders on hidden lifts under the sand, sunk until the earth gift calls them up
    FX.rocks = [[-15, -5, 1.1], [-11, -9.6, 0.85], [-16.5, 1.2, 0.95]].map(function (r) {
      var lift = pkMover(g, r[0], -2.2, r[1]);
      var rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r[2], 1), std({ color: 0x8a7a62, roughness: 0.95 })); rock.scale.set(1, 0.8, 1.1); rock.castShadow = true; lift.add(rock);
      var ringS = mesh(new THREE.RingGeometry(r[2] * 0.8, r[2] * 1.05, 20), M.sandDark, r[0], 0.055, r[1]); ringS.rotation.x = -Math.PI / 2; ringS.castShadow = false;
      return { g: lift, y: -2.2, r: r[2], x: r[0], z: r[1] };
    });

    // ── 5. Backstage: the yard behind the city wall (x -26..26, z -29.8..-17.7), clear of the riders' way through the
    // gate (x -3..3) and the hydra's pit (x -4..4, z -26..-19) ──
    var YZ = -29.6;
    // the hydra pit: a steel kerb, the hazard edge, four rams that run up with the body
    box(8.4, 0.04, 7.2, pkPnStd({ color: 0x1a1b1d, roughness: 0.8 }), 0, 0.03, -22.5, g);
    [[0, -26.15, 8.6, 0.25], [0, -18.85, 8.6, 0.25], [-4.3, -22.5, 0.25, 7.5], [4.3, -22.5, 0.25, 7.5]].forEach(function (k) { box(k[2], 0.12, k[3], hazard, k[0], 0.06, k[1], g); });
    FX.rams = [[-3.2, -25.2], [3.2, -25.2], [-3.2, -19.8], [3.2, -19.8]].map(function (p) {
      pkRoundCyl(0.32, 0.5, pkPnStd({ color: 0x3a3d42, roughness: 0.4, metalness: 0.7 }), p[0], 0.25, p[1], g, 14);
      var rod = pkMover(g, p[0], -10, p[1]); pkRoundCyl(0.16, 12, MAT.chrome, 0, -6, 0, rod, 12);
      return rod;
    });
    sign(['HYDRA LIFT', 'KEEP CLEAR WHEN THE BEACON IS LIT'], 3.2, 0.5, 0, 1.6, -26.6, 0, { bg: '#f0c04a', fg: '#1b1b1b' }, g);
    pkBevelBox(0.25, 1.4, 0.25, iron, 0, 0.7, -26.6 - 0.25, g, 0.02);
    FX.beacon = pkThGlow(0xffa020, 0.0); mesh(new THREE.SphereGeometry(0.18, 12, 10), FX.beacon, 4.6, 2.2, -26.4); pkRoundCyl(0.05, 2.1, iron, 4.6, 1.05, -26.4, g, 6);
    // the power unit: motor, oil tank, the valve block with its gauges, the hoses to the rams
    var hx0 = 7.5, hz0 = -27.6;
    pkBevelBox(2.4, 1.2, 1.3, pkPnStd({ color: 0x2f6f9e, roughness: 0.5, metalness: 0.4 }), hx0, 0.6, hz0, g, 0.04);
    pkRoundCyl(0.32, 0.9, pkPnStd({ color: 0x4a7a3a, roughness: 0.5, metalness: 0.4 }), hx0 - 0.6, 1.65, hz0, g, 14).rotation.z = Math.PI / 2;
    box(0.7, 0.6, 0.5, pkPnStd({ color: 0x8a949b, roughness: 0.45, metalness: 0.6 }), hx0 + 0.6, 1.5, hz0, g);
    [-0.15, 0.15].forEach(function (d) { pkRoundCyl(0.09, 0.04, MAT.chrome, hx0 + 0.6 + d, 1.55, hz0 + 0.27, g, 14).rotation.x = Math.PI / 2; });
    sign(['HPU 1', '210 BAR'], 1.0, 0.32, hx0 - 0.3, 0.75, hz0 + 0.66, 0, { bg: '#1b232c', fg: '#e8e4d8' }, g);
    pkRod(hx0 - 1.2, 0.07, hz0, 3.4, 0.07, -25.2, 0.05, pkPnStd({ color: 0x111111, roughness: 0.8 }), g, 6);   // the hoses along the ground to the rams
    pkRod(hx0 - 1.2, 0.07, hz0 + 0.3, 3.4, 0.07, -19.8, 0.05, pkPnStd({ color: 0x111111, roughness: 0.8 }), g, 6);
    S_(hx0 - 1.2, hx0 + 1.2, hz0 - 0.65, hz0 + 0.65, 0, 1.9);
    // the stables along the back wall, west of the pit: five stalls with half doors and their riders' names
    var stallW = 3.0, sx0 = -25.4;
    FX.stalls = [];
    for (var si = 0; si < 5; si++) {
      var x0 = sx0 + si * stallW, xm = x0 + stallW / 2, col = PK_TH_RIDERS[si][3];
      box(0.15, 2.6, 3.2, timber, x0, 1.3, YZ + 1.6, g);
      box(stallW - 0.15, 1.2, 0.12, timber, xm - 0.55, 0.6, YZ + 3.15, g);
      box(1.2, 0.12, 0.14, pkPnStd({ color: col, roughness: 0.7 }), xm + 0.85, 1.25, YZ + 3.15, g);
      sign([PK_TH_RIDERS[si][1].toUpperCase()], 1.1, 0.3, xm, 2.75, YZ + 3.25, 0, { bg: hexCss(col), fg: '#ffffff' }, g);
      box(0.9, 0.5, 0.35, M.straw, xm - 0.6, 1.3, YZ + 0.35, g);
      box(stallW - 0.3, 0.05, 2.8, M.straw, xm, 0.05, YZ + 1.6, g);
      FX.stalls.push({ x: PK_TH.CX + xm + 0.2, z: PK_TH.CZ + YZ + 1.7 });
    }
    box(0.15, 2.6, 3.2, timber, sx0 + 5 * stallW, 1.3, YZ + 1.6, g);
    var sroof = box(5 * stallW + 0.6, 0.12, 4.0, M.slate, sx0 + 2.5 * stallW, 3.05, YZ + 1.8, g); sroof.rotation.x = -0.2;
    S_(sx0, sx0 + 5 * stallW, YZ, YZ + 3.2, 0, 3);
    // the trough and the hay stack by the stables
    box(1.6, 0.5, 0.6, timber, -9.2, 0.25, -27.4, g); box(1.45, 0.02, 0.45, M.water, -9.2, 0.45, -27.4, g);
    [[-8.9, -25.6, 0], [-8.9, -24.4, 0], [-8.9, -25.0, 0.5]].forEach(function (b) { box(0.55, 0.5, 1.1, M.straw, b[0], 0.25 + b[2], b[1], g); });
    S_(-10, -8.4, -27.8, -23.8, 0, 1);
    // the cast and wardrobe cabins on the east side: two portacabins on blocks, steps, a lit window, their names
    [['CAST', 14.2], ['WARDROBE', 20.4]].forEach(function (cb) {
      var ccx = cb[1], ccz = -27.5, cab = pkPnStd({ color: 0xe8e4d8, roughness: 0.7 });
      [-2, 2].forEach(function (d) { box(0.4, 0.3, 2.4, M.stoneDark, ccx + d, 0.15, ccz, g); });
      pkBevelBox(5.0, 2.5, 2.4, cab, ccx, 1.55, ccz, g, 0.04);
      box(5.1, 0.1, 2.5, pkPnStd({ color: 0x5a5f66, roughness: 0.6 }), ccx, 2.85, ccz, g);
      box(0.9, 2.0, 0.05, pkPnStd({ color: 0x2f5f9e, roughness: 0.6 }), ccx - 1.4, 1.3, ccz + 1.23, g);
      [0.4, 1.6].forEach(function (wx2) { box(0.9, 0.7, 0.05, M.win, ccx + wx2, 1.9, ccz + 1.23, g); });
      for (var stp = 0; stp < 3; stp++) box(1.0, 0.12, 0.3, MAT.steelDark, ccx - 1.4, 0.12 + stp * 0.12, ccz + 1.7 - stp * 0.25, g);
      sign([cb[0]], 1.4, 0.32, ccx + 1.0, 2.5, ccz + 1.24, 0, { bg: '#2a1a12', fg: '#f0c04a' }, g);
      S_(ccx - 2.5, ccx + 2.5, ccz - 1.2, ccz + 1.9, 0, 2.9);
    });
    // a costume rail outside the wardrobe, the five riders' cloaks on it
    pkRod(13.6, 1.7, -24.2, 15.6, 1.7, -24.2, 0.025, MAT.chrome, g, 6);
    [13.6, 15.6].forEach(function (rx) { pkRod(rx, 0, -24.2, rx, 1.7, -24.2, 0.025, MAT.chrome, g, 6); });
    for (var ck = 0; ck < 5; ck++) box(0.32, 1.1, 0.08, std({ color: PK_TH_RIDERS[ck][3], roughness: 0.85 }), 13.9 + ck * 0.38, 1.1, -24.2, g);
    S_(13.5, 15.7, -24.4, -24.0, 0, 1.8);
    // the gas store for the fire effects: two tanks behind a mesh fence, their signs
    var gx0 = 23.4, gz0 = -20.4;
    [-0.8, 0.8].forEach(function (d) { var tk = pkRoundCyl(0.55, 2.4, pkPnStd({ color: 0xf2f0ea, roughness: 0.4, metalness: 0.3 }), gx0, 0.8, gz0 + d, g, 16); tk.rotation.x = Math.PI / 2; tk.rotation.z = Math.PI / 2; });
    [[gx0 - 1.6, gz0, 0.06, 2.8], [gx0, gz0 - 1.5, 3.2, 0.06], [gx0, gz0 + 1.5, 3.2, 0.06]].forEach(function (f) { box(f[2], 1.9, f[3], pkPnStd({ color: 0x9aa0a6, roughness: 0.5, metalness: 0.6, transparent: true, opacity: 0.45 }), f[0], 0.95, f[1], g); });
    sign(['FIRE EFFECTS', 'PROPANE - NO NAKED FLAMES'], 2.4, 0.42, gx0 - 1.63, 1.4, gz0, -Math.PI / 2, { bg: '#b8362b', fg: '#ffffff' }, g);
    pkRod(gx0 - 1.6, 0.2, gz0, 19, 0.2, -18.0, 0.04, pkPnStd({ color: 0xc9a227, roughness: 0.5, metalness: 0.6 }), g, 6);
    S_(gx0 - 1.65, gx0 + 1.6, gz0 - 1.55, gz0 + 1.55, 0, 1.9);
    // the pump house for the moat and the jets, in the yard's west end
    var px0 = -22.0, pz0 = -19.8;
    box(3.2, 2.6, 2.4, M.brick, px0, 1.3, pz0, g); box(3.5, 0.15, 2.7, M.slate, px0, 2.65, pz0, g);
    box(0.9, 1.9, 0.05, M.wood, px0 + 0.6, 0.95, pz0 + 1.21, g);
    sign(['PUMP HOUSE', 'MOAT AND JETS'], 1.6, 0.36, px0 - 0.6, 2.0, pz0 + 1.22, 0, { bg: '#1b232c', fg: '#9fd0ff' }, g);
    pkRod(px0 + 1.6, 0.4, pz0, -12, 0.25, -18.0, 0.08, pkPnStd({ color: 0x2f6fb3, roughness: 0.5, metalness: 0.5 }), g, 8);
    S_(px0 - 1.6, px0 + 1.6, pz0 - 1.2, pz0 + 1.2, 0, 2.7);
    // the prop rack: lances, shields and a spare hydra head on a stand
    (function () {
      var rx = -7.2, rz = -19.2;
      [-1, 1].forEach(function (d) { pkBevelBox(0.12, 1.9, 0.12, timber, rx + d * 1.1, 0.95, rz, g, 0.015); });
      box(2.3, 0.08, 0.12, timber, rx, 1.8, rz, g); box(2.3, 0.08, 0.4, timber, rx, 0.3, rz, g);
      for (var i = 0; i < 6; i++) pkRoundCyl(0.03, 2.6, std({ color: PK_TH_RIDERS[i % 5][3], roughness: 0.7 }), rx - 0.9 + i * 0.36, 1.4, rz, g, 6);
      var hd = mesh(new THREE.SphereGeometry(0.55, 12, 9), std({ color: 0x2c4a33, roughness: 0.55 }), rx + 2.2, 1.35, rz + 0.2); hd.scale.set(1, 0.85, 1.2);
      pkRoundCyl(0.06, 0.9, iron, rx + 2.2, 0.45, rz + 0.2, g, 6);
      S_(rx - 1.25, rx + 2.8, rz - 0.4, rz + 0.6, 0, 2);
    })();
    // floodlights on poles at the yard's two ends
    [[-25.3, -18.4], [25.3, -28.8]].forEach(function (p) { pkRoundCyl(0.08, 5.5, iron, p[0], 2.75, p[1], g, 8); box(0.6, 0.4, 0.3, pkPnStd({ color: 0x2a2d31, roughness: 0.5 }), p[0], 5.5, p[1], g); box(0.5, 0.3, 0.02, M.lampGlow, p[0], 5.5, p[1] + (p[1] < -24 ? 0.16 : -0.16), g); });
    // the stage manager's prompt corner by the gate passage: a desk, the cue-light box that follows the show
    pkBevelBox(0.9, 1.1, 0.6, timber, -3.6, 0.55, -19.0, g, 0.02);
    box(0.4, 0.3, 0.12, pkPnStd({ color: 0x1b1d20, roughness: 0.5 }), -3.6, 1.35, -19.0, g);
    FX.cueRed = pkThGlow(0xff3b30, 0.0); FX.cueGreen = pkThGlow(0x5fd38d, 0.0);
    mesh(new THREE.CircleGeometry(0.07, 12), FX.cueRed, -3.7, 1.35, -18.93); mesh(new THREE.CircleGeometry(0.07, 12), FX.cueGreen, -3.5, 1.35, -18.93);
    S_(-4.05, -3.15, -19.3, -18.7, 0, 1.2);

    // ── 6. The control room: the lighting and sound desk on the free end of the desk, the PA microphone ──
    var DX = 1.2, DZ = BZ0 + 0.55, DY = BF + 0.75;
    var mx = new THREE.Group(); mx.position.set(DX, DY, DZ); mx.rotation.x = 0.18; g.add(mx);   // its face tipped up toward the operator's chair (+z)
    pkBevelBox(1.36, 0.08, 0.4, pkPnStd({ color: 0x23262a, roughness: 0.5, metalness: 0.4 }), 0, 0.04, 0, mx, 0.02);
    box(1.3, 0.005, 0.36, pkPnStd({ color: 0x33373c, roughness: 0.6 }), 0, 0.083, 0, mx);
    var CH = ['HOUSE', 'WASH', 'SPOT', 'CITY', 'FIRE', 'JETS', 'FOG', 'MSTR'];
    FX.faders = CH.map(function (n, i) {
      var fx2 = -0.56 + i * 0.16;
      box(0.012, 0.004, 0.26, pkPnStd({ color: 0x0c0d0f }), fx2, 0.087, 0.06, mx);
      var cap = pkMover(mx, fx2, 0.095, 0.06); box(0.05, 0.022, 0.03, pkPnStd({ color: i === 7 ? 0xb8362b : 0xd8d8d0, roughness: 0.5 }), 0, 0, 0, cap);
      var vu = []; for (var v = 0; v < 6; v++) { var m = pkThGlow(v > 4 ? 0xff3b30 : v > 3 ? 0xf0c04a : 0x5fd38d, 0.0); box(0.03, 0.004, 0.012, m, fx2, 0.087, -0.11 - v * 0.018, mx); vu.push(m); }
      return { cap: cap, vu: vu, v: 0 };
    });
    // the PA microphone on its gooseneck at the desk's end: E makes an announcement to the house
    var mic = new THREE.Group(); mic.position.set(1.75, BF + 0.75, BZ0 + 0.27); g.add(mic);
    pkRoundCyl(0.08, 0.03, pkPnStd({ color: 0x1b1d20, roughness: 0.5 }), 0, 0.015, 0, mic, 14);
    pkRod(0, 0.03, 0, 0.02, 0.32, -0.1, 0.008, MAT.chrome, mic, 6);
    pkRoundCyl(0.025, 0.09, pkPnStd({ color: 0x111111, roughness: 0.7 }), 0.02, 0.36, -0.12, mic, 10);
    FX.micLed = pkThGlow(0xff3b30, 0.0); box(0.02, 0.006, 0.02, FX.micLed, 0.04, 0.035, 0.04, mic);
    hitBox(0.2, 0.45, 0.2, 0, 0.2, 0, { prompt: function () { return 'PA microphone: make an announcement to the house'; }, use: function () { pkArAnnounce(a); } }, mic);
    pkArStable(a);
  }

  // the PA: a chime and what the stage manager would say at this point in the show's day
  function pkArAnnounce(a) {
    var C = pkCtl(a), X = a.extra;
    if (!a.open) { sfx('bad'); toast('No power - the breaker is off', 'bad'); return; }
    X.fx.micT = 4; sfx('chime');
    var msg = a.state === 'running' ? 'Ladies and gentlemen, please stay seated until the riders have left the arena.'
      : a.state === 'boarding' || a.state === 'ready' ? 'Ladies and gentlemen, the show is about to begin. Please take your seats in your rider\'s colours.'
      : a.state === 'unloading' ? 'Thank you for visiting Lindenburg. Please mind the steps on your way out.'
      : 'Welcome to the Lindenburg Arena. The next performance of The Five Riders of Lindenburg starts soon.';
    toast('PA: ' + msg, '');
    a.seats.forEach(function (st) { if (st.guest && st.guest.g && Math.random() < 0.15) say(st.guest.g, pick(['Ooh!', 'Here we go!', 'Shh!'])); });
  }
  // between shows the horses stand in their stalls, saddled, riderless
  function pkArStable(a) {
    var X = a.extra, cast = X.cast; if (!cast || !X.fx || !X.fx.stalls) return;
    PK_TH_RIDERS.forEach(function (r, i) {
      var A = cast[r[0]]; if (!A || A.on || !A.horse) return;
      var s = X.fx.stalls[i]; A.stall = new THREE.Vector3(s.x, 0.05, s.z - 0.5); A.root.visible = true; A.g.visible = false; A.root.position.copy(A.stall); A.root.rotation.y = 0;   // looking out over the half door
    });
  }

  // ── The effects, fired by the script ─────────────────────────────
  function pkArFx(a, kind, secs, opt) {
    var FX = a.extra.fx; if (!FX) return;
    FX[kind] = Math.max(FX[kind] || 0, secs);
    if (kind === 'cannon') pkArSfx('pkArWhoosh');
    if (kind === 'water') pkArSfx('pkArSplash');
    if (kind === 'earth') pkArSfx('pkArRumble');
    if (kind === 'blast') { a.extra.flash = Math.max(a.extra.flash || 0, 0.5); pkArSfx('thunder'); }
    if (opt && opt.rider !== undefined) FX.rider = opt.rider;
  }
  // the extra cues part 33's script takes: the music, the effects of the gifts, the lights' moods and the fireworks
  function pkArenaPlusCues(cues, c, each, line) {
    var fx = function (t, kind, secs, opt) { return { t: t, fn: function (a) { pkArFx(a, kind, secs, opt); } }; };
    var mus = function (t, k) { return { t: t, fn: function () { pkArSfx(k); } }; };
    var mood = function (t, m) { return { t: t, fn: function (a) { a.extra.fx.mood = m; } }; };
    var follow = function (t, who) { return { t: t, fn: function (a) { a.extra.fx.follow = who; } }; };
    cues.push(
      mood(2, 'keeper'), mus(26, 'pkArGate'), mood(27, 'gate'), fx(27, 'water', 4), fx(29, 'cannon', 1.2),
      mood(72, 'sweep'), fx(85, 'water', 3), mood(98, 'storm'), mus(102, 'pkArDread'), fx(102, 'wind', 6),
      mood(128, 'chase'), mus(150, 'pkArDrums'), fx(152, 'cannon', 2.5), fx(158, 'cannon', 1.5), mood(152, 'hydra'),
      mus(183, 'pkArHeroic'), mood(183, 'gifts'),
      // the five gifts, one after the other: wind, fire, water, earth, light
      { t: 184, fn: line('fenna', 'Wind!') }, fx(184, 'wind', 3.5, { rider: 0 }),
      { t: 186.5, fn: line('bas', 'Fire!') }, fx(186.5, 'cannon', 2.2, { rider: 1 }),
      { t: 189, fn: line('jet', 'Water!') }, fx(189, 'water', 3, { rider: 2 }),
      { t: 191.5, fn: line('wout', 'Earth!') }, fx(191.5, 'earth', 9, { rider: 3 }),
      { t: 194, fn: line('isa', 'Light!') }, fx(194, 'blast', 2.5, { rider: 4 }),
      fx(205, 'water', 3), mood(205, 'gifts'), mood(219, 'joy'), mus(222, 'pkArGate'), fx(224, 'cannon', 1.0), fx(226, 'water', 4),
      fx(256, 'works', 10), mus(256, 'pkArHeroic'), mood(256, 'joy'), mood(276, 'off'),
      follow(7, 'keeper'), follow(28, 'fenna'), follow(44, 'fenna'), follow(46.5, 'bas'), follow(49, 'jet'), follow(51.5, 'wout'), follow(54, 'isa'),
      follow(66, 'keeper'), follow(72, 'fenna'), follow(102, 'count'), follow(115, 'keeper'), follow(121, 'count'), follow(135, 'guard1'), follow(141, 'bas'),
      follow(146, 'count'), follow(152, null), follow(166, 'wout'), follow(171, 'fenna'), follow(177, 'keeper'),
      follow(184, 'fenna'), follow(186.5, 'bas'), follow(189, 'jet'), follow(191.5, 'wout'), follow(194, 'isa'), follow(199, null),
      follow(205, 'count'), follow(213, null), follow(222, 'keeper'), follow(226, 'isa'), follow(262, 'keeper'), follow(270, null)
    );
  }
  function pkArenaPlusTidy(a) {
    var FX = a.extra.fx; if (!FX) return;
    FX.cannon = FX.water = FX.wind = FX.earth = FX.blast = FX.works = 0; FX.mood = 'off'; FX.rider = -1; FX.follow = null;
    pkArStable(a);
  }

  // ── The tick: the effects, the heads, the rams, the faders, the cue lights ──
  var PK_AR_V = new THREE.Vector3(), PK_AR_D = new THREE.Vector3(), PK_AR_Q = new THREE.Quaternion(), PK_AR_DOWN = new THREE.Vector3(0, -1, 0), PK_AR_C = new THREE.Color();
  var PK_AR_RCOL = [0x9fd0ff, 0xff6a2a, 0x3f8fff, 0x6fd04a, 0xfff2b0];
  function pkArenaPlusTick(a, dt) {
    var X = a.extra, FX = X.fx; if (!FX) return;
    var CX = PK_TH.CX, CZ = PK_TH.CZ, run = a.state === 'running', near = pkArNear(110), t = X.fxT = (X.fxT || 0) + dt, i;
    ['cannon', 'water', 'wind', 'blast', 'works'].forEach(function (k) { if (FX[k] > 0) FX[k] -= dt; });
    if (FX.earth > 0) FX.earth -= dt;
    if (FX.micT > 0) FX.micT -= dt;
    FX.micLed.emissiveIntensity = FX.micT > 0 ? 2 : 0.05;
    // the curtain in the way through: drawn across in about two seconds when the show starts, gathered again when it ends
    var DC = FX.doorCur;
    if (DC) { DC.k += clamp((run ? 1 : 0) - DC.k, -dt * 0.5, dt * 0.5); var dcs = 0.12 + 0.88 * DC.k * DC.k * (3 - 2 * DC.k); DC.halves[0].scale.z = DC.halves[1].scale.z = dcs; }
    // fire cannons: a roaring column and sparks; the braziers' own fire light (part 33) carries the glow
    var fire = FX.cannon > 0;
    FX.cannons.forEach(function (cn, k) {
      var want = fire ? 0.85 + 0.25 * Math.sin(t * 23 + k * 2) : 0.001;
      cn.g.scale.y += (want - cn.g.scale.y) * Math.min(1, dt * 14); cn.g.visible = cn.g.scale.y > 0.02;
      cn.m.emissiveIntensity = fire ? 2.6 : 0;
      if (fire && near && Math.random() < dt * 14) pkArSpark(CX + cn.x, 3.6, CZ + cn.z, pick([0xff8a2a, 0xffc040, 0xff5a10]), 10, { speed: 3, cone: 0.6, grav: -1, life: 0.7, size: 0.22 });
    });
    if (fire) X.fire = Math.max(X.fire || 0, 0.2);
    // water jets: columns that dance, spray at their tops
    var jet = FX.water > 0;
    FX.jets.forEach(function (j) {
      var want = jet ? 3.5 + Math.sin(t * 3 + j.ph) * 1.8 : 0.001;
      j.g.scale.y += (want - j.g.scale.y) * Math.min(1, dt * 5); j.g.visible = j.g.scale.y > 0.05;
      if (jet && near && Math.random() < dt * 6) pkArSpark(CX + j.x, 0.2 + j.g.scale.y, CZ + j.z, 0xcfeaff, 8, { speed: 1.6, grav: 6, life: 0.9, size: 0.12 });
    });
    // wind and fog: smoke from the vents drifting east, leaves on the wind
    if (FX.wind > 0 && near && Math.random() < dt * 8) {
      var v = FX.vents[Math.floor(Math.random() * FX.vents.length)];
      burst(CX + v.x, 0.2, CZ + v.z, 0xe8ecef, 16, 'smoke');
      pkArSpark(CX + v.x, 0.6, CZ + v.z, pick([0x6fae3a, 0xa8c84a, 0xd8b04a]), 6, { speed: 2.5, cone: 0.9, grav: 0.6, life: 2.2, wx: 3.5, size: 0.14 });
    }
    // the earth rocks: up out of the sand, a shake of dust, then back down
    FX.rocks.forEach(function (r) {
      var want = FX.earth > 0 ? r.r * 0.55 : -2.2, was = r.y;
      r.y += (want - r.y) * Math.min(1, dt * (FX.earth > 0 ? 2.2 : 0.8));
      r.g.position.y = r.y; r.g.rotation.y += FX.earth > 0 ? dt * 0.2 : 0;
      if (FX.earth > 0 && near && was < r.r * 0.4 && Math.random() < dt * 10) burst(CX + r.x, 0.2, CZ + r.z, 0xc2a575, 14, 'smoke');
    });
    // fireworks: shells from behind the city wall, bursting over it
    if (FX.works > 0 && near) {
      FX.shellT = (FX.shellT || 0) - dt;
      if (FX.shellT <= 0) {
        FX.shellT = randf(0.35, 0.8); pkArSfx('pkArShell');
        var sx = randf(-18, 18), sy = randf(17, 25), sz = randf(-26, -20), col = pick(PK_AR_RCOL.concat([0xffffff, 0xff3b6a]));
        pkArSpark(CX + sx, 6, CZ + sz, 0xffd27a, 4, { speed: 1, cone: 0.1, grav: -6, life: 0.6, size: 0.1 });
        (function (x, y, z, c2) { setTimeout(function () { pkArSpark(CX + x, y, CZ + z, c2, 70, { speed: 7, grav: 2.5, drag: 1.2, life: 1.8, size: 0.28 }); pkArSpark(CX + x, y, CZ + z, 0xffffff, 20, { speed: 3, grav: 1, life: 0.8, size: 0.2 }); }, 650); })(sx, sy, sz, col);
      }
    }
    // the moving heads follow the cast. Each head has its own rider (head k takes rider k mod 5) and keeps its beam on them
    // wherever they ride; with a rider off stage it falls back to the scene's focus. The mood says how they light: the Keeper
    // alone, the riders in their colours, a storm's flicker, the hydra's heads, every beam on the rider whose gift it is.
    var mood = run ? (FX.mood || 'off') : 'off', heads = FX.heads, cast = X.cast || {};
    var actorAt = function (A, out) { if (!A || !A.on) return false; out.set(A.x, (A.y || 0) + (A.horse ? 2.0 : 1.2), A.z); return true; };
    var focusOf = function (out) { var f = FX.follow && cast[FX.follow]; if (actorAt(f, out)) return true; out.set(X.spotAt.x, X.spotAt.y, X.spotAt.z); return false; };
    heads.forEach(function (H, k) {
      var col = 0xffffff, aim = H.aim, on = 1, rider = cast[PK_TH_RIDERS[k % 5][0]];
      if (mood === 'off') { on = 0; aim.set(H.x * 0.6, 0, 0); }
      else if (mood === 'keeper') { focusOf(aim); col = 0xfff2d0; on = k === 2 || k === 3 ? 1 : 0; }
      else if (mood === 'hydra') {
        // half the rig on the hydra's heads, the rest keeping the riders lit
        if (k % 2 === 0) { var hd = X.hydra && X.hydra.necks[k % 5].head; if (hd) { hd.getWorldPosition(PK_AR_V); aim.set(PK_AR_V.x - CX, PK_AR_V.y, PK_AR_V.z - CZ); } col = 0x9aff6a; }
        else if (!actorAt(rider, aim)) focusOf(aim); else col = PK_AR_RCOL[k % 5];
      }
      else if (mood === 'gifts') {
        var giver = FX.rider >= 0 ? cast[PK_TH_RIDERS[FX.rider][0]] : null;
        if (!actorAt(giver, aim) && !actorAt(rider, aim)) focusOf(aim);
        col = FX.rider >= 0 ? PK_AR_RCOL[FX.rider] : PK_AR_RCOL[k % 5];
        if (FX.blast > 0) { col = 0xffffff; on = 1.6; }
      }
      else {
        // gate, sweep, chase, storm, joy: on their riders; whoever is not out lights the scene's focus
        if (actorAt(rider, aim)) col = mood === 'chase' && k % 2 ? 0xff4a3a : PK_AR_RCOL[k % 5];
        else { focusOf(aim); col = 0xffe9c0; }
        if (mood === 'storm') { col = 0x8fa8ff; on = Math.random() < 0.6 ? 0.9 : 0.15; }
        if (mood === 'sweep') on = 0.75;
      }
      // a fast follow: the head leads its rider a little so a galloping horse stays in the pool
      if (rider && rider.on && rider.path && rider.path.length && mood !== 'keeper' && mood !== 'hydra') { var nx = rider.path[0]; PK_AR_D.set(nx.x - rider.x, 0, nx.z - rider.z); if (PK_AR_D.lengthSq() > 1e-4) aim.addScaledVector(PK_AR_D.normalize(), 0.5); }
      H.cur.lerp(aim, Math.min(1, dt * 6));
      // turn the head so its beam (local -y) runs from the fixture to the aim point
      H.yoke.getWorldPosition(PK_AR_V); PK_AR_D.set(CX + H.cur.x, H.cur.y, CZ + H.cur.z).sub(PK_AR_V).normalize();
      PK_AR_Q.setFromUnitVectors(PK_AR_DOWN, PK_AR_D); H.head.quaternion.copy(PK_AR_Q);
      H.k += ((a.open ? on : 0) - H.k) * Math.min(1, dt * 6);
      PK_AR_C.setHex(col); H.col.lerp(PK_AR_C, Math.min(1, dt * 4));
      H.lens.emissive.copy(H.col); H.lens.emissiveIntensity = H.k * 2.5;
      // the beam is haze lit by the head: a faint shaft by day, a stronger one after dark (it was a solid white cone)
      H.beam.color.copy(H.col); H.beam.opacity = H.k * (S.time > 7.5 && S.time < 19 ? 0.022 : 0.055);
    });
    // the follow spot (part 33's real light) tracks the scene's focus too, whenever the script names one
    if (run && FX.follow && actorAt(cast[FX.follow], PK_AR_V)) { X.spotAt.x = PK_AR_V.x; X.spotAt.y = PK_AR_V.y - 1; X.spotAt.z = PK_AR_V.z; }
    // the hydra's rams follow its body; the beacon turns while it moves
    var Hy = X.hydra, hy = Hy ? Hy.y : -11, moving = Hy && Math.abs((X.hydraUp ? 0 : -11) - Hy.y) > 0.05;
    FX.rams.forEach(function (rd) { rd.position.y = hy + 4.2 - 2.6; });
    FX.beacon.emissiveIntensity = moving ? (Math.sin(t * 12) > 0 ? 2.5 : 0.1) : 0.05;
    // the stage manager's cue lights: red standing by, green go
    var nx = pkThNextOp(a);
    FX.cueRed.emissiveIntensity = nx && !nx.go ? 2 : 0.05; FX.cueGreen.emissiveIntensity = nx && nx.go ? (Math.sin(t * 10) > 0 ? 2 : 0.4) : 0.05;
    // the desk's faders ride the show's levels; the meters dance with what is playing
    var lw = X.lightWant, lev = [lw.house / 1.4, lw.wash / 2.2, lw.spot / 3, lw.city / 1.1, fire ? 1 : 0, jet ? 1 : 0, FX.wind > 0 ? 1 : 0, a.open ? 0.85 : 0];
    FX.faders.forEach(function (f, k) {
      f.v += (clamp(lev[k], 0, 1) - f.v) * Math.min(1, dt * 4); f.cap.position.z = 0.17 - f.v * 0.22;
      var sig = run ? clamp(f.v * (0.55 + 0.45 * Math.abs(Math.sin(t * (4 + k) + k))), 0, 1) : 0;
      f.vu.forEach(function (m, q) { m.emissiveIntensity = sig > (q + 0.5) / 6 ? 1.8 : 0.05; });
    });
  }

  // after a load, the horses are in their stalls
  hook('boot', function () { var a = PK.attrById && PK.attrById.theater; if (a) pkArStable(a); });
