//@ Park Co, part 59: the people, remodelled - a new figure for every guest and member of staff, on the engine's own rig
  // ── Why ──────────────────────────────────────────────────────────
  // The engine's figure is a mannequin: a head a quarter of its height, limbs that are plain tubes, and one silhouette for
  // every man, woman and child in the park. tison asked for the guests and the staff to be remodelled.
  //
  // This part replaces makeHuman. The rig is the engine's, to the pivot: two hips with a knee each, a torso, two
  // shoulders with an elbow and a hand each, a head and a face, all under the same names in userData, so animateHuman,
  // the seats, the benches, the carried things and the speech bubble work exactly as before. What hangs on the rig is new:
  //   - proportions: a smaller head on a longer neck (about six and a half heads tall), shoulders, a waist, tapered limbs
  //     with calves, proper hands, trainers with a toe and a sole;
  //   - builds: slim, medium and broad, so a crowd is not one outline;
  //   - clothes: a T-shirt with a print, a buttoned shirt, a hoodie with its hood down, an open jacket over a top, a dress;
  //     long trousers or shorts with socks;
  //   - hair: cropped, side-parted, long, a ponytail, a bun, curls, bald; a cap, a sun hat or a beanie on some;
  //   - things carried: a backpack, a shoulder bag, a camera on a strap;
  //   - staff keep what they were given: the vest with its bands, the name tag, the cap, the hard hat.
  // Guests also come in sizes now: about one in seven is a child.
  var PK_PPL = { G: null, M: null, made: 0 };
  function pkPplGeo() {
    if (PK_PPL.G) return PK_PPL.G;
    var G = PK_PPL.G = {
      thigh: roundCylGeo(0.082, 0.062, 0.42, 14), thighTop: roundCylGeo(0.084, 0.074, 0.22, 14), thighLow: roundCylGeo(0.07, 0.06, 0.2, 14),
      knee: new THREE.SphereGeometry(0.06, 12, 8), shin: roundCylGeo(0.058, 0.04, 0.38, 14), calf: new THREE.SphereGeometry(0.056, 12, 8),
      sock: roundCylGeo(0.046, 0.043, 0.07, 12), hem: roundCylGeo(0.062, 0.06, 0.035, 14),
      shoe: bevelGeo(0.1, 0.075, 0.2, 0.03, 3), toe: new THREE.SphereGeometry(0.052, 12, 8), sole: bevelGeo(0.108, 0.028, 0.275, 0.012, 1), stripe: bevelGeo(0.104, 0.02, 0.09, 0.006, 1),
      hips: bevelGeo(0.33, 0.18, 0.2, 0.075, 3), waist: taperGeo(bevelGeo(0.37, 0.34, 0.2, 0.08, 3).clone(), 0.34, 0.84, 0.92), chest: bevelGeo(0.4, 0.26, 0.22, 0.095, 3),
      yoke: bevelGeo(0.52, 0.11, 0.18, 0.05, 3),
      belt: bevelGeo(0.335, 0.04, 0.205, 0.01, 1), buckle: bevelGeo(0.045, 0.034, 0.016, 0.004, 1),
      collar: bevelGeo(0.08, 0.034, 0.012, 0.004, 1), placket: bevelGeo(0.028, 0.5, 0.01, 0.004, 1), button: roundCylGeo(0.008, 0.008, 0.006, 8),
      print: bevelGeo(0.17, 0.12, 0.008, 0.003, 1), band: bevelGeo(0.405, 0.05, 0.225, 0.01, 1), pouch: bevelGeo(0.2, 0.1, 0.012, 0.006, 1),
      hood: new THREE.SphereGeometry(0.12, 14, 10), drawstr: roundCylGeo(0.005, 0.005, 0.12, 6),
      lapel: bevelGeo(0.12, 0.52, 0.016, 0.006, 1), skirt: roundCylGeo(0.15, 0.25, 0.44, 18),
      shoulder: new THREE.SphereGeometry(0.056, 12, 10), upperArm: roundCylGeo(0.05, 0.04, 0.29, 12), sleeve: roundCylGeo(0.056, 0.052, 0.16, 12),
      elbow: new THREE.SphereGeometry(0.041, 10, 8), foreArm: roundCylGeo(0.039, 0.03, 0.27, 12), cuff: roundCylGeo(0.036, 0.034, 0.03, 12),
      hand: bevelGeo(0.058, 0.085, 0.03, 0.013, 2), thumb: roundCylGeo(0.011, 0.01, 0.045, 8),
      neck: roundCylGeo(0.04, 0.048, 0.1, 12), skull: new THREE.SphereGeometry(0.125, 24, 18), jaw: new THREE.SphereGeometry(0.1, 18, 12),
      ear: new THREE.SphereGeometry(0.024, 8, 6), nose: new THREE.SphereGeometry(0.017, 10, 8),
      hairCap: new THREE.SphereGeometry(0.13, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), hairBack: new THREE.SphereGeometry(0.13, 18, 10, Math.PI * 1.1, Math.PI * 0.8, Math.PI * 0.38, Math.PI * 0.32),
      fringe: new THREE.SphereGeometry(0.13, 18, 6, Math.PI * 0.18, Math.PI * 0.64, Math.PI * 0.27, Math.PI * 0.2), part: new THREE.SphereGeometry(0.13, 14, 6, Math.PI * 0.1, Math.PI * 0.5, Math.PI * 0.2, Math.PI * 0.3),
      fall: new THREE.CylinderGeometry(0.136, 0.15, 0.3, 18, 2, true, Math.PI * 0.42, Math.PI * 1.16), bun: new THREE.SphereGeometry(0.058, 12, 10),
      tail: roundCylGeo(0.036, 0.016, 0.26, 10), curl: new THREE.SphereGeometry(0.05, 9, 7),
      beard: new THREE.SphereGeometry(0.105, 16, 8, -Math.PI * 0.1, Math.PI * 1.2, Math.PI * 0.55, Math.PI * 0.38),
      capDome: new THREE.SphereGeometry(0.137, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), peak: bevelGeo(0.16, 0.012, 0.12, 0.005, 1), capBtn: new THREE.SphereGeometry(0.016, 8, 6),
      brim: roundCylGeo(0.25, 0.25, 0.012, 24), hatBand: roundCylGeo(0.139, 0.139, 0.03, 20), beanie: new THREE.SphereGeometry(0.139, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.56), pom: new THREE.SphereGeometry(0.035, 8, 6),
      hardDome: new THREE.SphereGeometry(0.146, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), hardRim: roundCylGeo(0.165, 0.165, 0.014, 22), hardPeak: bevelGeo(0.13, 0.012, 0.07, 0.004, 1),
      vest: bevelGeo(0.43, 0.46, 0.25, 0.055, 3), vband: bevelGeo(0.44, 0.04, 0.26, 0.012, 1), vstrap: bevelGeo(0.045, 0.26, 0.26, 0.012, 1),
      pack: bevelGeo(0.26, 0.34, 0.12, 0.04, 2), packPocket: bevelGeo(0.18, 0.13, 0.03, 0.012, 1), strap: bevelGeo(0.035, 0.36, 0.25, 0.01, 1),
      bag: bevelGeo(0.2, 0.15, 0.07, 0.025, 2), bagStrap: bevelGeo(0.025, 0.62, 0.025, 0.006, 1), cam: bevelGeo(0.1, 0.065, 0.05, 0.012, 1), lens: roundCylGeo(0.026, 0.028, 0.045, 12),
      lensRing: new THREE.TorusGeometry(0.031, 0.005, 6, 16), bridge: bevelGeo(0.024, 0.005, 0.005, 0.002, 1)
    };
    G.skull.scale(0.93, 1.13, 0.99); G.jaw.scale(0.86, 0.74, 0.9); G.ear.scale(0.5, 1.2, 0.85); G.nose.scale(0.85, 1.25, 1.1); G.calf.scale(1, 1.9, 1.05); G.toe.scale(1, 0.72, 1.25);
    G.hairCap.scale(1.0, 1.14, 1.03); G.hairBack.scale(1.01, 1.16, 1.04); G.fringe.scale(1.005, 1.145, 1.04); G.part.scale(1.01, 1.15, 1.04); G.beard.scale(0.9, 0.95, 0.95);
    G.hood.scale(1.15, 0.75, 0.9); G.capDome.scale(1, 0.92, 1.04); G.beanie.scale(1, 1.05, 1.03); G.hardDome.scale(1, 0.95, 1.05);
    for (var k in G) keepShared(G[k]);
    var M = PK_PPL.M = {
      sole: std({ color: 0xece8de, roughness: 0.9 }), sock: std({ color: 0xf2f0ea, roughness: 0.95 }), belt: std({ color: 0x3a2a1a, roughness: 0.5 }), button: std({ color: 0xf2f2f2, roughness: 0.8 }),
      band: std({ color: 0xc9ced3, roughness: 0.3, metalness: 0.4, emissive: 0x666666, emissiveIntensity: 0.25 }), frame: std({ color: 0x222222, roughness: 0.4, metalness: 0.5 }),
      cam: std({ color: 0x1c1e22, roughness: 0.45, metalness: 0.3 }), glass: std({ color: 0x223040, roughness: 0.1, metalness: 0.6 }), straw: std({ color: 0xd9c08a, roughness: 0.95 })
    };
    for (var m in M) keepShared(M[m]);
    return G;
  }
  var PK_PPL_BUILDS = { slim: [0.9, 0.92, 0.225], mid: [1.0, 1.0, 0.243], broad: [1.12, 1.1, 0.268] };   // [torso width, depth, shoulder x]
  var PK_PPL_SHOES = [0xf4f1e6, 0x2a2d33, 0xd94f4f, 0x3b5b8a, 0x6b4a2a, 0x8a8f96];
  var PK_PPL_PACKS = [0x2f5d8a, 0xb8452f, 0x3a3f48, 0x5fa86a, 0x7a5a9a, 0xd8a23c];
  // opt, as the engine's: skin, hair, style, shirt, pants, vest, name, rolled, mood, cap, capMat, hardhat, noBeard, beard, glasses, key.
  // New, all optional (picked at random when not given, except on staff in a vest or a hard hat, who get the plain shirt):
  // build ('slim' | 'mid' | 'broad'), outfit ('tee' | 'shirt' | 'hoodie' | 'jacket' | 'dress'), shorts, hat ('sun' | 'beanie'),
  // carry ('pack' | 'bag' | 'camera'), accent (a colour for the print, the stripe and the lining)
  // The Park Co uniform, worn by everyone who works here and by the player: a navy shirt, charcoal trousers, a gold vest with
  // silver bands, a navy cap and a PARK CO name tag. Asked for with opt.uniform, and given on its own to the engine's staff
  // characters (the sweepers, the gardener, the guards, the cashiers) and the ride operators, found by the key they are made with.
  var PK_PPL_STAFFKEY = /^(sweeper|sweeperNorth|gardener|guard[A-Za-z]*|cashier[A-Za-z]*|operator):/;
  function pkUniformOpt(opt) {
    var U = PK_PPL.U || (PK_PPL.U = { shirt: std({ map: TEX.cloth, color: 0x1d3b63, roughness: 0.92 }), pants: std({ map: TEX.cloth, color: 0x2a2d33, roughness: 0.95 }), vest: std({ color: 0xf2b632, roughness: 0.7 }), cap: std({ color: 0x1d3b63, roughness: 0.8 }) });
    var o = {}; for (var k in opt) o[k] = opt[k];
    o.shirt = U.shirt; o.pants = U.pants; o.vest = U.vest; o.cap = true; o.capMat = U.cap; o.outfit = 'shirt'; o.hardhat = null; o.name = o.name || 'PARK CO'; o.shorts = false;
    return o;
  }
  function pkMakeHuman(opt) {
    opt = opt || {};
    if (opt.uniform || PK_PPL_STAFFKEY.test(opt.key || '')) opt = pkUniformOpt(opt);
    var G = pkPplGeo(), M = PK_PPL.M, staff = !!(opt.vest || opt.hardhat || opt.name);
    var skinCol = opt.skin || pick(SKINS), hairCol = opt.hair || pick(HAIRS);
    var style = opt.style || pick(['short', 'short', 'part', 'long', 'pony', 'bun', 'curly', 'bald', 'cap']);
    var build = PK_PPL_BUILDS[opt.build || (staff ? 'mid' : pick(['slim', 'slim', 'mid', 'mid', 'mid', 'broad']))] || PK_PPL_BUILDS.mid;
    var outfit = opt.outfit || (staff ? 'shirt' : pick(['tee', 'tee', 'tee', 'shirt', 'hoodie', 'jacket', 'dress']));
    var shorts = opt.shorts !== undefined ? !!opt.shorts : (!staff && outfit !== 'dress' && Math.random() < 0.38);
    var skin = std({ color: skinCol, roughness: 0.72 }), shirt = opt.shirt || std({ map: TEX.cloth, color: pick(SHIRTS), roughness: 0.92 }), pants = opt.pants || std({ map: TEX.cloth, color: pick(PANTS), roughness: 0.95 });
    var hair = std({ color: hairCol, roughness: 0.6 }), hairSide = hair.clone(); hairSide.side = THREE.DoubleSide;
    var shoeM = std({ color: pick(PK_PPL_SHOES), roughness: 0.6 });
    var accentCol = opt.accent || pick([0xf4f1e6, 0xf0c04a, 0x2f3440, 0xd94f4f, 0x4f8fd9, 0xffffff]);
    var accent = std({ color: accentCol, roughness: 0.85 });
    var rolled = opt.rolled !== undefined ? !!opt.rolled : Math.random() < 0.4;
    var longSleeve = outfit === 'hoodie' || outfit === 'jacket' || (outfit === 'shirt' && !rolled);
    var shortSleeve = outfit === 'tee' || outfit === 'dress';
    var g = new THREE.Group(), u = g.userData; u.dynamic = true;
    u.key = opt.key || 'f' + Math.floor(Math.random() * 100000); u.mood = opt.mood || 'neutral'; u.blink = 0; u.blinkIn = randf(2, 6); u.walk = 0; u.idleT = Math.random() * 10; u.lookYaw = 0; u.lookPitch = 0; u.skinKey = skinCol.toString(16); u.phase = Math.random() * 6.28;
    u.pkLook = { build: opt.build, outfit: outfit, shorts: shorts, style: style };
    g.scale.setScalar(HUMAN_SCALE);
    function mesh(geo, mat, x, y, z, parent) { var m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; (parent || g).add(m); return m; }
    // ── the legs ──
    var legSkin = outfit === 'dress';
    function leg(side) {
      var hip = new THREE.Group(); hip.position.set(side * 0.095, 0.86, 0); g.add(hip);
      if (legSkin) mesh(G.thigh, skin, 0, -0.21, 0, hip);
      else if (shorts) { mesh(G.thighTop, pants, 0, -0.11, 0, hip); mesh(G.thighLow, skin, 0, -0.31, 0, hip); mesh(G.hem, pants, 0, -0.215, 0, hip); }
      else mesh(G.thigh, pants, 0, -0.21, 0, hip);
      var knee = new THREE.Group(); knee.position.set(0, -0.42, 0); hip.add(knee); hip.userData.knee = knee;
      var lower = (shorts || legSkin) ? skin : pants;
      mesh(G.knee, lower, 0, 0, 0, knee); mesh(G.shin, lower, 0, -0.19, 0, knee); mesh(G.calf, lower, 0, -0.14, -0.012, knee);
      if (shorts || legSkin) mesh(G.sock, M.sock, 0, -0.345, 0, knee); else mesh(G.hem, pants, 0, -0.355, 0, knee);
      // a trainer: the upper, a rounded toe, a pale sole and a stripe across the laces
      mesh(G.shoe, shoeM, 0, -0.4, 0.035, knee); mesh(G.toe, shoeM, 0, -0.41, 0.135, knee); mesh(G.sole, M.sole, 0, -0.444, 0.05, knee); mesh(G.stripe, accent, 0, -0.37, 0.07, knee);
      return hip;
    }
    u.legs = [leg(-1), leg(1)];
    // ── the torso ──
    var torso = new THREE.Group(); torso.position.y = 0.86; g.add(torso); u.torso = torso;
    var bw = build[0], bd = build[1];
    var sc = function (m, w, d) { m.scale.set(w === undefined ? bw : w, 1, d === undefined ? bd : d); return m; };
    var lowerM = outfit === 'dress' ? shirt : pants;
    sc(mesh(G.hips, lowerM, 0, 0.02, 0, torso));
    if (outfit !== 'dress' && outfit !== 'hoodie') { sc(mesh(G.belt, M.belt, 0, 0.105, 0, torso)); mesh(G.buckle, MAT.chrome, 0, 0.105, 0.105 * bd, torso); }
    sc(mesh(G.waist, shirt, 0, 0.29, 0, torso)); u.chest = sc(mesh(G.chest, shirt, 0, 0.5, 0, torso));
    sc(mesh(G.yoke, shirt, 0, 0.585, -0.005, torso), bw * (build[2] / 0.243) * 0.98, bd);   // the shoulders: one line from arm to arm, so an arm grows out of the body
    var fz = 0.112 * bd;                                           // the front of the chest
    if (outfit === 'tee') { mesh(G.print, accent, 0, 0.47, fz + 0.002, torso); }
    else if (outfit === 'shirt') {
      [-1, 1].forEach(function (sd) { var cl = mesh(G.collar, shirt, sd * 0.045, 0.635, fz - 0.004, torso); cl.rotation.set(-0.35, sd * -0.25, sd * -0.62); });
      mesh(G.placket, shirt, 0, 0.38, fz, torso); for (var b = 0; b < 4; b++) mesh(G.button, M.button, 0, 0.2 + b * 0.11, fz + 0.006, torso).rotation.x = Math.PI / 2;
    } else if (outfit === 'hoodie') {
      mesh(G.hood, shirt, 0, 0.62, -0.1 * bd, torso); mesh(G.pouch, shirt, 0, 0.2, fz - 0.008, torso); sc(mesh(G.band, shirt, 0, 0.115, 0, torso));
      [-1, 1].forEach(function (sd) { mesh(G.drawstr, M.button, sd * 0.035, 0.55, fz + 0.004, torso); });
    } else if (outfit === 'jacket') {
      mesh(G.lapel, accent, 0, 0.39, fz - 0.004, torso).scale.x = 0.8;   // the top underneath, showing down the open front
      [-1, 1].forEach(function (sd) { var cl = mesh(G.collar, shirt, sd * 0.07, 0.635, fz - 0.002, torso); cl.rotation.set(-0.3, sd * -0.3, sd * -0.7); cl.scale.set(1.3, 1.3, 1); });
    } else if (outfit === 'dress') {
      sc(mesh(G.skirt, shirt, 0, -0.14, 0, torso), bw * 1.02, bd * 0.95); sc(mesh(G.band, accent, 0, 0.14, 0, torso), bw * 0.9, bd * 0.92);
    }
    if (opt.vest) { sc(mesh(G.vest, opt.vest, 0, 0.33, 0, torso)); sc(mesh(G.vband, M.band, 0, 0.22, 0, torso)); sc(mesh(G.vband, M.band, 0, 0.38, 0, torso)); mesh(G.vstrap, M.band, -0.13 * bw, 0.5, 0, torso).scale.z = bd; mesh(G.vstrap, M.band, 0.13 * bw, 0.5, 0, torso).scale.z = bd; }
    if (opt.name) { var tag = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.046), new THREE.MeshBasicMaterial({ map: textTex([opt.name], { w: 128, h: 48, bg: '#fff', fg: '#1b232c' }) })); tag.position.set(0.09, 0.46, (opt.vest ? 0.132 : 0.116) * bd); torso.add(tag); }
    // what they carry
    var carry = opt.carry !== undefined ? opt.carry : (staff ? null : (Math.random() < 0.26 ? 'pack' : Math.random() < 0.16 ? 'bag' : Math.random() < 0.09 ? 'camera' : null));
    if (carry === 'pack') {
      var packM = std({ color: pick(PK_PPL_PACKS), roughness: 0.85 });
      mesh(G.pack, packM, 0, 0.42, -0.17 * bd, torso); mesh(G.packPocket, accent, 0, 0.36, -0.235 * bd, torso);
      [-1, 1].forEach(function (sd) { mesh(G.strap, packM, sd * 0.12 * bw, 0.47, -0.005, torso).scale.z = bd; });
    } else if (carry === 'bag') {
      var bagM = std({ color: pick([0x6b4a2a, 0x2a2d33, 0xb8452f, 0xd9c08a]), roughness: 0.7 });
      mesh(G.bag, bagM, -0.22 * bw, 0.06, 0.02, torso); var bs = mesh(G.bagStrap, bagM, -0.03, 0.4, fz + 0.004, torso); bs.rotation.z = -0.62; var bs2 = mesh(G.bagStrap, bagM, -0.03, 0.4, -fz - 0.004, torso); bs2.rotation.z = -0.62;
    } else if (carry === 'camera') {
      mesh(G.cam, M.cam, 0, 0.36, fz + 0.03, torso); mesh(G.lens, M.cam, 0, 0.36, fz + 0.075, torso).rotation.x = Math.PI / 2; mesh(G.lensRing, M.glass, 0, 0.36, fz + 0.1, torso);
      [-1, 1].forEach(function (sd) { var st = mesh(G.bagStrap, M.cam, sd * 0.06, 0.5, fz + 0.01, torso); st.scale.set(0.6, 0.45, 0.6); st.rotation.z = sd * 0.25; });
    }
    // ── the arms ──
    function arm(side) {
      var sh = new THREE.Group(); sh.position.set(side * build[2], 0.6, 0); torso.add(sh);
      mesh(G.shoulder, shirt, 0, 0, 0, sh);
      if (shortSleeve) { mesh(G.sleeve, shirt, 0, -0.08, 0, sh); mesh(G.upperArm, skin, 0, -0.16, 0, sh); }
      else mesh(G.upperArm, shirt, 0, -0.16, 0, sh);
      var el = new THREE.Group(); el.position.set(0, -0.31, 0); sh.add(el); sh.userData.elbow = el;
      var foreM = longSleeve ? shirt : skin;
      mesh(G.elbow, foreM, 0, 0, 0, el); mesh(G.foreArm, foreM, 0, -0.14, 0, el);
      if (longSleeve) mesh(G.cuff, outfit === 'hoodie' ? shirt : accent, 0, -0.265, 0, el); else if (outfit === 'shirt') mesh(G.cuff, shirt, 0, -0.02, 0, el);
      var hand = mesh(G.hand, skin, 0, -0.325, 0, el); el.userData.hand = hand;
      var th = mesh(G.thumb, skin, side * 0.032, -0.305, 0.012, el); th.rotation.z = side * 0.6;
      return sh;
    }
    u.arms = [arm(-1), arm(1)];
    // ── the head ──
    var head = new THREE.Group(); head.position.set(0, 0.66, 0); torso.add(head); u.head = head;
    var hy = 0.2;
    mesh(G.neck, skin, 0, 0.04, 0, head); mesh(G.skull, skin, 0, hy, 0, head); mesh(G.jaw, skin, 0, hy - 0.07, 0.012, head); mesh(G.nose, skin, 0, hy - 0.012, 0.124, head);
    [-1, 1].forEach(function (s) { mesh(G.ear, skin, s * 0.116, hy, -0.008, head); });
    var hat = opt.hat !== undefined ? opt.hat : (staff || opt.cap || style === 'cap' ? null : (Math.random() < 0.1 ? 'sun' : Math.random() < 0.06 ? 'beanie' : null));
    var capOn = (style === 'cap' || !!opt.cap) && !opt.hardhat, covered = capOn || !!opt.hardhat || hat === 'beanie';
    if (style !== 'bald') {
      if (!covered) mesh(G.hairCap, hair, 0, hy + 0.005, 0, head);
      mesh(G.hairBack, hair, 0, hy + 0.002, 0, head);
      if (style === 'long') mesh(G.fall, hairSide, 0, hy - 0.13, -0.01, head);
      else if (style === 'pony') { var tl = mesh(G.tail, hair, 0, hy - 0.05, -0.16, head); tl.rotation.x = -0.5; mesh(G.bun, hair, 0, hy + 0.06, -0.13, head).scale.setScalar(0.7); }
      else if (style === 'bun') mesh(G.bun, hair, 0, hy + 0.13, -0.085, head);
      else if (style === 'curly' && !covered) for (var c = 0; c < 11; c++) { var ca = c / 11 * Math.PI * 2, cr = c % 2 ? 0.1 : 0.075; mesh(G.curl, hair, Math.cos(ca) * cr, hy + 0.105 + (c % 3) * 0.018, Math.sin(ca) * cr - 0.005, head); }
      if (!covered || capOn) { if (style === 'part') mesh(G.part, hair, 0, hy + 0.004, 0, head); else if (style !== 'curly') mesh(G.fringe, hair, 0, hy + 0.003, 0, head); }
    }
    if ((opt.beard === true || (opt.beard === undefined && Math.random() < 0.22)) && !opt.noBeard && outfit !== 'dress') mesh(G.beard, hairSide, 0, hy - 0.015, 0.006, head);
    var face = new THREE.Mesh(new THREE.PlaneGeometry(0.215, 0.215), new THREE.MeshBasicMaterial({ map: faceTex(u.key, u.mood, u.skinKey), transparent: true, depthWrite: false })); face.position.set(0, hy + 0.004, 0.124); head.add(face); u.face = face;
    if (opt.glasses === true || (opt.glasses === undefined && Math.random() < 0.22)) { [-0.046, 0.046].forEach(function (x) { mesh(G.lensRing, M.frame, x, hy + 0.012, 0.13, head); }); mesh(G.bridge, M.frame, 0, hy + 0.014, 0.131, head); }
    // hats sit on the brows, never over the eyes
    if (capOn) { var capM = opt.capMat || MAT.blue; mesh(G.capDome, capM, 0, hy + 0.04, 0, head); var peak = mesh(G.peak, capM, 0, hy + 0.045, 0.165, head); peak.rotation.x = 0.16; mesh(G.capBtn, capM, 0, hy + 0.166, 0, head); }
    else if (opt.hardhat) { mesh(G.hardDome, opt.hardhat, 0, hy + 0.045, 0, head); mesh(G.hardRim, opt.hardhat, 0, hy + 0.047, 0, head); var hp = mesh(G.hardPeak, opt.hardhat, 0, hy + 0.047, 0.19, head); hp.rotation.x = 0.12; }
    else if (hat === 'sun') { mesh(G.capDome, M.straw, 0, hy + 0.045, 0, head); mesh(G.brim, M.straw, 0, hy + 0.05, 0, head); mesh(G.hatBand, accent, 0, hy + 0.066, 0, head); }
    else if (hat === 'beanie') { var bn = opt.capMat || accent; mesh(G.beanie, bn, 0, hy + 0.035, 0, head); mesh(G.hatBand, bn, 0, hy + 0.045, 0, head); mesh(G.pom, M.button, 0, hy + 0.185, 0, head); }
    // each pivot's fixed pieces become one mesh per material; the face, the chest and the hands stay their own (they animate, or things are put in them)
    mergeHumanGroup(head, [face]);
    mergeHumanGroup(torso, [u.chest]);
    u.legs.forEach(function (hip) { mergeHumanGroup(hip, []); if (hip.userData.knee) mergeHumanGroup(hip.userData.knee, []); });
    u.arms.forEach(function (shd) { mergeHumanGroup(shd, []); if (shd.userData.elbow) mergeHumanGroup(shd.userData.elbow, [shd.userData.elbow.userData.hand]); });
    groundBlob(0.8, 0.8, 0, 0, g, 0.002);
    PK_PPL.made++;
    runHooks('humanMade', g, opt);
    return g;
  }
  makeHuman = pkMakeHuman;

  var _pkPplPrevT = GAME.T;
  GAME.T = function () { var t = _pkPplPrevT(); t.PK_PPL = PK_PPL; t.pkMakeHuman = pkMakeHuman; t.makeHuman = function (o) { return makeHuman(o); }; t.animateHuman = animateHuman; return t; };
