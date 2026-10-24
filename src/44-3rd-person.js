//@ Park Co, part 44: Free-roam 3rd-person camera and player body.
(function() {
  var PK_3P = { on: false, camDist: 5.5, body: null };
  Object.defineProperty(GAME, 'crosshair', {
    configurable: true,
    get: function () { return !(PK_3P.on || (TR && TR.t && TR.t.thirdPerson)); }
  });

  // Create the body when needed
  function ensureBody() {
    if (!PK_3P.body) {
      PK_3P.body = makeHuman({ shirt: std({ color: 0x2a3f5f, roughness: 0.8 }), pants: std({ color: 0x1a1a1a, roughness: 0.9 }) });
      PK_3P.body.visible = false;
      PK_3P.body.userData.dynamic = true;
      scene.add(PK_3P.body);
    }
  }

  // Toggle 3rd person
  function toggle3P() {
    PK_3P.on = !PK_3P.on;
    ensureBody();
    if (!PK_3P.on) {
      PK_3P.body.visible = false;
    }
    sfx('click');
    if (PK_3P.on) toast('3rd person view. Scroll to zoom.', '');
    else toast('1st person view.', '');
  }

  // Handle C key
  var _prevKey = GAME.key;
  GAME.key = function(e) {
    if (e.code === 'KeyC' && !e.repeat && ui.started && !ui.blocked()) {
      // Ignore if we are in the train, train logic handles its own 3rd person
      if (TR && TR.t && (TR.t.driving || TR.t.seat)) return _prevKey ? _prevKey(e) : false;
      toggle3P();
      return true;
    }
    return _prevKey ? _prevKey(e) : false;
  };

  // Handle Scroll Wheel zoom
  var _prevWheel = GAME.wheel;
  GAME.wheel = function(dir, e) {
    if (PK_3P.on && !(TR && TR.t && (TR.t.driving || TR.t.seat))) {
      PK_3P.camDist = clamp(PK_3P.camDist + dir * 0.5, 1.5, 15);
      return true;
    }
    return _prevWheel ? _prevWheel(dir, e) : false;
  };

  // Keep train camera ownership in the train hook. Free-roam movement remains with the engine.
  var _prevOverride = GAME.playerOverride;
  GAME.playerOverride = function(dt) {
    if (TR && TR.t && (TR.t.driving || TR.t.seat)) {
      if (PK_3P.on) toggle3P();
      return _prevOverride ? _prevOverride(dt) : false;
    }
    return _prevOverride ? _prevOverride(dt) : false;
  };

  // Present runs after the engine moves the player and sets the first-person camera.
  // Updating the third-person view here keeps normal walking and gravity active.
  var _prevPresent = GAME.present;
  GAME.present = function(dt) {
    var result = _prevPresent ? _prevPresent(dt) : undefined;
    if (PK_3P.on && ui.started && !ui.blocked() && !(TR && TR.t && (TR.t.driving || TR.t.seat))) {
      ensureBody();
      var px = player.x, py = player.y, pz = player.z, yaw = player.yaw;
      PK_3P.body.visible = true;
      PK_3P.body.rotation.y = yaw + Math.PI;
      animateHuman(PK_3P.body, dt, player.keys && (player.keys.KeyW || player.keys.KeyA || player.keys.KeyS || player.keys.KeyD) ? 'walk' : 'idle', 1, null, false);
      // animateHuman resets the model's vertical offset, so reapply the player's position after animating.
      PK_3P.body.position.set(px, py, pz);
      if (!player.grounded) {
        var B = PK_3P.body.userData;
        B.legs[0].rotation.x = -0.6; B.legs[1].rotation.x = -0.85;
        B.legs[0].userData.knee.rotation.x = 0.65; B.legs[1].userData.knee.rotation.x = 0.9;
        B.arms[0].rotation.x = -1.0; B.arms[1].rotation.x = -1.0;
        B.arms[0].userData.elbow.rotation.x = -0.25; B.arms[1].userData.elbow.rotation.x = -0.25;
      }

      // Camera follows behind the direction the player is facing.
      var cx = px + Math.sin(yaw) * PK_3P.camDist;
      var cz = pz + Math.cos(yaw) * PK_3P.camDist;
      var cy = py + 1.5 - Math.sin(player.pitch) * PK_3P.camDist;
      camera.position.set(cx, cy, cz);
      camera.lookAt(px, py + 1.5, pz);
    } else if (PK_3P.body) {
      PK_3P.body.visible = false;
    }
    return result;
  };
})();
