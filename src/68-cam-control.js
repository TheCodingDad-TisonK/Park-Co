//@ Park Co, part 68: the booth cameras answer you (tison, 2026-11-15: "let me be able to look at a CAM inside a booth and press a KEY when looking
//@ at them to control the camera, like rotate or zoom in"). Every CCTV monitor made by pkCctvFeed (the two over every booth desk, and any other)
//@ keeps its camera's yaw, pitch and field of view. Aim at a monitor: the arrow keys turn the camera left and right and tilt it, + and - (or
//@ the keypad) zoom in and out, and E puts it back on its first view. The camera is the same one that feeds the screen, so the picture follows
//@ at once (a pressed key marks the feed so it draws on the next pass). The keys are taken only while a monitor is aimed at, so walking and
//@ everything else are untouched.
  (function () {
    var inner = pkCctvFeed, FOV0 = 74, V = new THREE.Vector3(), D = new THREE.Vector3();
    function apply(f) {
      var c = f.ctl; c.yaw = c.yaw0 + clamp(c.dyaw, -1.3, 1.3); c.pitch = clamp(c.pitch0 + c.dpitch, -1.2, 0.5);
      f.cam.rotation.order = 'YXZ'; f.cam.rotation.set(c.pitch, c.yaw, 0); f.cam.fov = clamp(c.fov, 24, 90); f.cam.updateProjectionMatrix();
      PK_FEED_T = 0; f.fresh = true;   // draw it on the next pass
    }
    pkCctvFeed = function (parent, x, y, z, ry, tilt, camPos, lookAt, power) {
      var g = inner.apply(this, arguments), f = PK_FEEDS[PK_FEEDS.length - 1];
      f.cam.rotation.order = 'YXZ'; f.cam.lookAt(lookAt[0], lookAt[1], lookAt[2]);
      f.ctl = { yaw0: f.cam.rotation.y, pitch0: f.cam.rotation.x, dyaw: 0, dpitch: 0, fov: FOV0 };
      g.userData.feed = f; f.mon = g;
      hitBox(0.54, 0.4, 0.3, 0, 0, 0.12, {
        prompt: function () { return f.on ? 'Camera: arrows turn and tilt, + and - zoom, E resets' : 'Camera: no power'; },
        use: function () { var c = f.ctl; c.dyaw = 0; c.dpitch = 0; c.fov = FOV0; apply(f); sfx('click'); }
      }, g);
      return g;
    };
    // the monitor the player is looking at: the nearest one in front of the camera, within a few metres and about ten degrees of the view
    function aimed() {
      var best = null, bd = 0.985; camera.getWorldDirection(D);
      for (var i = 0; i < PK_FEEDS.length; i++) {
        var f = PK_FEEDS[i]; if (!f.mon || !f.ctl || !f.on) continue;
        f.mon.getWorldPosition(V); V.sub(camera.position); var d = V.length(); if (d > 4 || d < 0.05) continue;
        var dot = V.dot(D) / d; if (dot > bd) { bd = dot; best = f; }
      }
      return best;
    }
    document.addEventListener('keydown', function (e) {
      if (typeof CO !== 'undefined' && CO.editor && CO.editor.on) return;
      var dy = 0, dp = 0, dz = 0, k = e.code;
      if (k === 'ArrowLeft') dy = 0.12; else if (k === 'ArrowRight') dy = -0.12;
      else if (k === 'ArrowUp') dp = 0.08; else if (k === 'ArrowDown') dp = -0.08;
      else if (k === 'Equal' || k === 'NumpadAdd' || e.key === '+') dz = -6; else if (k === 'Minus' || k === 'NumpadSubtract' || e.key === '-') dz = 6;
      else return;
      var f = aimed(); if (!f) return;
      e.preventDefault(); e.stopImmediatePropagation();
      f.ctl.dyaw += dy; f.ctl.dpitch += dp; f.ctl.fov += dz; apply(f); sfx('click');
    }, true);
    // a pressed key makes its feed draw next, whatever the round robin is on
    hook('frame', function () { /* the round robin in part 17 reaches it within a quarter second per feed */ });
  }());
