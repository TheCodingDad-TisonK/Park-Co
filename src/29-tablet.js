//@ Park Co, part 29: the tablet. Tab brings up a held device in front of the camera, its screen running the same Park OS
  // (part 25's pkPCDraw) the office PC shows, so prices, staff and rides are a glance away anywhere in the park, every
  // button included. Open, it releases the mouse: a real cursor aims and clicks the screen (no crosshair-and-E aiming),
  // the same way every other panel in the game already works. A child of the camera, so it always sits in view.
  var PK_TABLET = { open: false, g: null, sc: null };
  var PK_TAB_PW = 0.42, PK_TAB_PH = PK_TAB_PW * PK_PC_H / PK_PC_W;
  var PK_TAB_MOUSE = new THREE.Vector2(0, 0), PK_TAB_RAY = new THREE.Raycaster();
  function pkBuildTablet() {
    if (camera.parent !== scene) scene.add(camera);   // items held on the camera only render once the camera is in the scene graph; the bake already excludes anything under it (11-bake.js)
    var dark = MAT.steelDark, chrome = MAT.chrome || pkPaint(0xd8dde2, 0.15, 0.9);
    var g = new THREE.Group(); g.position.set(0.0, 0.0, -0.55); g.rotation.x = 0.16; g.visible = false; camera.add(g);
    pkBevelBox(PK_TAB_PW + 0.035, PK_TAB_PH + 0.045, 0.014, dark, 0, 0, -0.008, g, 0.012);
    pkBevelBox(PK_TAB_PW + 0.012, PK_TAB_PH + 0.014, 0.004, chrome, 0, 0, -0.0005, g, 0.006);
    sphere(0.004, MAT.black, 0, PK_TAB_PH / 2 + 0.012, -0.003, g);
    var sc = touchScreen({ w: PK_PC_W, h: PK_PC_H, res: 1.2, pw: PK_TAB_PW, ph: PK_TAB_PH, x: 0, y: 0, z: 0.004, parent: g, title: 'Tablet', draw: pkPCDraw });
    sc.mesh.raycast = pkTabletNoRaycast;   // shut until Tab opens it (three.js raycasts invisible meshes too, so visible alone will not gate it)
    PK_TABLET.g = g; PK_TABLET.sc = sc;
    PK_BK_LIVE.push({ sc: sc, g: g, every: 0.5 });
  }
  function pkTabletNoRaycast() {}
  // where the real mouse cursor currently points on the screen, in the canvas's own logical pixels (not the crosshair)
  function pkTabletHit() {
    PK_TAB_RAY.setFromCamera(PK_TAB_MOUSE, camera);
    var hit = PK_TAB_RAY.intersectObject(PK_TABLET.sc.mesh, false);
    if (!hit.length || !hit[0].uv) return null;
    return { x: hit[0].uv.x * PK_TABLET.sc.w, y: (1 - hit[0].uv.y) * PK_TABLET.sc.h };
  }
  function pkTabletMouseMove(e) {
    var r = renderer.domElement.getBoundingClientRect();
    PK_TAB_MOUSE.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    PK_TAB_MOUSE.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  }
  function pkTabletClick() {
    if (!PK_TABLET.open) return;
    var p = pkTabletHit(); if (!p) return;
    var sc = PK_TABLET.sc; sc.cur = p; screenTap(sc, screenZoneAt(sc, p.x, p.y));
  }
  document.addEventListener('mousemove', pkTabletMouseMove);
  document.addEventListener('mousedown', pkTabletClick);
  hook('frame', function () { if (PK_TABLET.open) { pkTabletFit(); PK_TABLET.sc.cur = pkTabletHit(); } });
  var PK_TAB_FOV = 32;   // a tight zoom while it is up, so the screen fills most of the view instead of floating small in it
  // dead centre, and pulled in or out until the whole bezel fits: a wide window or a narrow one, the tablet never slides
  // off the bottom of the screen the way a fixed offset did
  function pkTabletFit() {
    var g = PK_TABLET.g; if (!g) return;
    var half = Math.tan(camera.fov * Math.PI / 360), aspect = camera.aspect || 1.6;
    var z = Math.max(0.46, (PK_TAB_PW / 2 + 0.03) / (half * aspect), (PK_TAB_PH / 2 + 0.03) / half);
    g.position.set(0, 0, -z);
  }
  function pkTabletToggle(force) {
    if (PK_CART.driving || PK_SIT || PK.playerRide) return;
    var open = force === undefined ? !PK_TABLET.open : force;
    if (open === PK_TABLET.open) return;
    PK_TABLET.open = open;
    if (PK_TABLET.g) PK_TABLET.g.visible = open;
    if (PK_TABLET.sc) { PK_TABLET.sc.mesh.raycast = open ? THREE.Mesh.prototype.raycast : pkTabletNoRaycast; if (open) PK_TABLET.sc.dirty = true; else PK_TABLET.sc.cur = null; }
    if (open) { PK_TABLET.fov0 = camera.fov; camera.fov = PK_TAB_FOV; camera.updateProjectionMatrix(); pkTabletFit(); ui.suppressMenu = true; try { document.exitPointerLock(); } catch (e) {} }
    else { camera.fov = PK_TABLET.fov0 || SET.fov; camera.updateProjectionMatrix(); lockPointer(); }
    sfx('click');
  }
  var _pkTabletPrevKey = GAME.key;
  GAME.key = function (e) {
    if (e.code === 'Tab' && !e.repeat) { e.preventDefault(); pkTabletToggle(); return true; }
    return _pkTabletPrevKey ? _pkTabletPrevKey(e) : false;
  };
  // Esc is checked before the engine's own blocked-gate (90-boot.js), which is how a blocked screen gets to close itself
  var _pkTabletPrevEscape = GAME.escape;
  GAME.escape = function () { if (PK_TABLET.open) { pkTabletToggle(false); return true; } return _pkTabletPrevEscape ? _pkTabletPrevEscape() : false; };
  // open, the tablet owns input: the world holds, the crosshair hides, the mouse is free to aim and click the screen
  var _pkTabletPrevBlocked = GAME.blocked;
  GAME.blocked = function () { return PK_TABLET.open || (_pkTabletPrevBlocked ? _pkTabletPrevBlocked() : false); };
  var _pkTabletPrevT = GAME.T;
  GAME.T = function () { var t = _pkTabletPrevT(); t.PK_TABLET = PK_TABLET; t.pkTabletToggle = pkTabletToggle; return t; };
