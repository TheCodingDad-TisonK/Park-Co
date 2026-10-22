//@ Park Co, part 30: the golf cart. Parked on the HQ forecourt; E gets in, WASD drives it (driveStep, part 27 of the
  // engine), the mouse looks around the cabin while it runs, E gets back out. Faster than running, so a big park does
  // not mean a long walk every time you want to check a far ride.
  // local +Z is the travel-forward axis (matches driveStep/vehicleCamera's convention), so the nose sits at +z and the
  // seats at -z: vehicleCamera's "back" offset pulls the camera toward -z, i.e. toward the seats, clear of the dash
  var PK_CART = { x: -10.5, z: 42.5, yaw: Math.PI / 2, speed: 0, driving: false, look: { yaw: 0, pitch: 0 }, wheels: [], sx: 0, sz: 0 };
  var PK_CART_SPEC = { accel: 4.2, top: 7.2, reverse: 3.0, drag: 3.2, steer: 2.1, gears: [1] };
  function pkBuildCart() {
    var M = pkMats();
    var g = new THREE.Group(); g.position.set(PK_CART.x, floorY(PK_CART.x, PK_CART.z), PK_CART.z); g.rotation.y = PK_CART.yaw; g.userData.dynamic = true; scene.add(g);
    var body = pkPaint(0xf6eedd, 0.45, 0.2), body2 = pkPaint(0x2f6a42, 0.45, 0.15), chrome = MAT.chrome || pkPaint(0xd8dde2, 0.15, 0.9), dark = MAT.steelDark, glass = M.glass;
    // the chassis: a bevelled tub with a stepped nose and a square tail, the rocker panel in the dark trim colour
    pkBevelBox(1.26, 0.1, 2.1, body2, 0, 0.36, -0.02, g, 0.04);                            // the rocker/skirt, just proud of the body
    pkBevelBox(1.18, 0.34, 2.0, body, 0, 0.6, -0.04, g, 0.07);                             // the main tub
    pkBevelBox(1.1, 0.3, 0.5, body, 0, 0.78, 0.98, g, 0.06);                                // the raised nose/bonnet
    pkBevelBox(1.14, 0.06, 2.02, body2, 0, 0.95, -0.03, g, 0.02);                           // a waist stripe under the glass line
    // the dash and the windscreen, between the nose and the seats
    pkBevelBox(1.0, 0.3, 0.06, dark, 0, 0.96, 0.62, g, 0.03);                               // the dash
    sphere(0.035, glowMat(0x5fd38d, 1.2), -0.3, 1.02, 0.6, g);                              // a single gauge light
    var ws = box(1.0, 0.46, 0.012, glass, 0, 1.28, 0.78, g); ws.rotation.x = -0.32;
    pkRod(0, 0.9, 0.52, 0, 1.08, 0.56, 0.028, dark, g, 8);                                  // steering column, set lower
    var wheel = pkRing(0.15, 0.022, dark, 0, 1.1, 0.58, g, 16, true); wheel.rotation.x = Math.PI / 2 - 0.3;
    [-1, 1].forEach(function (s) { sphere(0.075, glowMat(0xfff2c0, 0.7), s * 0.62, 0.72, 1.21, g); });   // headlamps, lower on the nose
    [-1, 1].forEach(function (s) { sphere(0.05, glowMat(0xff3b30, 0.6), s * 0.62, 0.62, -1.02, g); });   // tail lamps, lower on the tail
    // a single bench, centred, behind the dash
    pkBevelBox(0.74, 0.44, 0.07, body2, 0, 1.0, -0.42, g, 0.04);                             // backrest shell
    pkBevelBox(0.68, 0.36, 0.05, M.seat, 0, 1.0, -0.38, g, 0.03);                             // backrest cushion
    pkBevelBox(0.68, 0.12, 0.52, M.seat, 0, 0.66, -0.12, g, 0.04);                            // seat cushion
    box(0.68, 0.02, 0.52, body2, 0, 0.6, -0.12, g);                                           // seat base
    // a wire basket on the back deck
    pkBevelBox(0.72, 0.03, 0.4, body2, 0, 0.78, -1.05, g, 0.01);
    [[-0.34, -0.86], [0.34, -0.86], [-0.34, -1.24], [0.34, -1.24]].forEach(function (p) { pkRod(p[0], 0.78, p[1], p[0], 0.98, p[1], 0.015, dark, g, 6); });
    pkRod(-0.34, 0.98, -0.86, 0.34, 0.98, -0.86, 0.015, dark, g, 6); pkRod(-0.34, 0.98, -1.24, 0.34, 0.98, -1.24, 0.015, dark, g, 6);
    pkRod(-0.34, 0.98, -0.86, -0.34, 0.98, -1.24, 0.015, dark, g, 6); pkRod(0.34, 0.98, -0.86, 0.34, 0.98, -1.24, 0.015, dark, g, 6);
    // four posts and a two-tier canopy with a scalloped valance, set lower over the cabin
    [[-0.56, 0.86], [0.56, 0.86], [-0.56, -0.9], [0.56, -0.9]].forEach(function (p) { pkRod(p[0], 0.95, p[1], p[0], 1.52, p[1], 0.032, chrome, g, 10); });
    pkBevelBox(1.32, 0.05, 2.1, body2, 0, 1.56, -0.02, g, 0.03);
    pkBevelBox(1.22, 0.025, 1.98, body, 0, 1.585, -0.02, g, 0.015);
    for (var v = 0; v < 2; v++) { var vz = -0.98 + v * 1.98; box(1.3, 0.1, 0.03, body2, 0, 1.5, vz, g); }
    // the wheels: a rubber tyre, a chrome rim and a dark hub, with a fender arch over each
    [[0.58, 0.82], [-0.58, 0.82], [0.58, -0.82], [-0.58, -0.82]].forEach(function (p) {
      var w = pkRoundCyl(0.27, 0.17, MAT.rubber, p[0], 0.29, p[1], g, 18); w.rotation.z = Math.PI / 2; PK_CART.wheels.push(w);
      pkRoundCyl(0.16, 0.175, chrome, p[0], 0.29, p[1], g, 12).rotation.z = Math.PI / 2;
      pkRoundCyl(0.045, 0.18, dark, p[0], 0.29, p[1], g, 8).rotation.z = Math.PI / 2;
      var arch = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.045, 6, 14, Math.PI), body2); arch.position.set(p[0], 0.33, p[1]); arch.rotation.y = Math.PI / 2 * (p[0] > 0 ? 1 : -1); g.add(arch);
    });
    sign(['PARK CO'], 0.5, 0.13, 0.605, 0.78, -0.1, Math.PI / 2, { w: 256, h: 68, bg: '#2f6a42', fg: '#f6eedd' }, g);
    sign(['PARK CO'], 0.5, 0.13, -0.605, 0.78, -0.1, -Math.PI / 2, { w: 256, h: 68, bg: '#2f6a42', fg: '#f6eedd' }, g);
    hitBox(0.9, 1.0, 2.0, 0, 0.6, -0.2, { prompt: function () { return PK_CART.driving ? '' : 'Get in'; }, use: function () { pkCartEnter(); } }, g);
    PK_CART.g = g;
  }
  // a little stone archway over the forecourt where the cart heads out onto the paths, same kit as a ride's own gateway
  function pkBuildCartGate() {
    var gg = new THREE.Group(); scene.add(gg);
    pkGatewayBetter(PK_CART.x + 5.0, PK_CART.z, 'CART GATE', { a: 0x2f6a42, b: 0xf6eedd }, 1, gg);
  }
  function pkCartEnter() {
    if (PK_CART.driving || PK_SIT || PK.playerRide) return;
    PK_CART.driving = true; PK_CART.sx = player.x; PK_CART.sz = player.z; PK_CART.speed = 0;
    PK_CART.look.yaw = 0; PK_CART.look.pitch = 0.05;
    sfx('click'); toast('Driving - WASD, E to get out', '');
  }
  function pkCartExit() {
    if (!PK_CART.driving) return false;
    PK_CART.driving = false; PK_CART.speed = 0;
    var ex = PK_CART.x + Math.cos(PK_CART.yaw) * 0.9, ez = PK_CART.z - Math.sin(PK_CART.yaw) * 0.9;
    player.x = collides(ex, ez) ? PK_CART.sx : ex; player.z = collides(ex, ez) ? PK_CART.sz : ez;
    player.y = floorY(player.x, player.z); player.vy = 0;
    player.yaw = PK_CART.yaw + Math.PI + PK_CART.look.yaw; player.pitch = PK_CART.look.pitch;
    sfx('click'); return true;
  }
  var _pkCartPrevOverride = GAME.playerOverride;
  GAME.playerOverride = function (dt) {
    if (PK_CART.driving) {
      PK_CART.speed = driveStep(PK_CART, player.keys, dt, { spec: PK_CART_SPEC, blocked: function (nx, nz) { return vehicleBlocked(PK_CART, nx, nz, 0.75, solids.concat(dyn)); } });
      player.x = PK_CART.x; player.z = PK_CART.z; player.y = floorY(PK_CART.x, PK_CART.z); player.vy = 0;
      if (PK_CART.g) { PK_CART.g.position.set(PK_CART.x, player.y, PK_CART.z); PK_CART.g.rotation.y = PK_CART.yaw; }
      PK_CART.wheels.forEach(function (w) { w.rotateX(-PK_CART.speed * dt / 0.27); });
      vehicleCamera(PK_CART, PK_CART.look, 1.35, 0.35);
      return true;
    }
    return _pkCartPrevOverride ? _pkCartPrevOverride(dt) : false;
  };
  var _pkCartPrevMouseLook = GAME.mouseLook;
  GAME.mouseLook = function (e, sx, iy) {
    if (PK_CART.driving) { PK_CART.look.yaw -= e.movementX * sx; PK_CART.look.pitch = clamp(PK_CART.look.pitch - e.movementY * sx * iy, -1.3, 1.3); return true; }
    return _pkCartPrevMouseLook ? _pkCartPrevMouseLook(e, sx, iy) : false;
  };
  var _pkCartPrevKey = GAME.key;
  GAME.key = function (e) {
    if (PK_CART.driving && e.code === 'KeyE' && !e.repeat) return pkCartExit();
    return _pkCartPrevKey ? _pkCartPrevKey(e) : false;
  };
  var _pkCartPrevT = GAME.T;
  GAME.T = function () { var t = _pkCartPrevT(); t.PK_CART = PK_CART; t.pkCartEnter = pkCartEnter; t.pkCartExit = pkCartExit; return t; };
