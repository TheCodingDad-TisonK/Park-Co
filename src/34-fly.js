//@ Park Co, part 34: fly mode - F3 lifts the player off the ground to fly the park freely: W A S D along the look, Space up,
  // C down, Shift fast, through walls and roofs. F3 again drops you where you are and you fall to the ground.
  // The engine binds F3 to the FPS counter before a game hears the key, so the plain F3 is taken here, on the capture
  // pass, before the engine's own listener; Shift+F3 still reaches the engine and toggles the counter.
  var PK_FLY = { on: false };
  function pkFlyToggle(on) {
    var want = on === undefined ? !PK_FLY.on : !!on;
    if (want === PK_FLY.on) return PK_FLY.on;
    if (want) {
      if (PK.playerRide || PK_SIT || PK_CART.driving) { sfx('bad'); toast('Get off or stand up first', 'bad'); return false; }
      PK_FLY.on = true; player.vy = 0;
      toast('Fly mode: W A S D along the look, Space up, C down, Shift fast. F3 to land', 'good');
    } else {
      PK_FLY.on = false; player.vy = 0; player.grounded = false;   // gravity takes it from here
      toast('Fly mode off', '');
    }
    sfx('click'); hudDirty = true;
    return PK_FLY.on;
  }
  document.addEventListener('keydown', function (e) {
    if (e.code !== 'F3' || e.shiftKey) return;
    e.preventDefault(); e.stopPropagation();
    if (!ui.started || ui.blocked()) return;
    pkFlyToggle();
  }, true);
  var _pkFlyPrevOverride = GAME.playerOverride;
  GAME.playerOverride = function (dt) {
    if (!PK_FLY.on) return _pkFlyPrevOverride ? _pkFlyPrevOverride(dt) : false;
    var k = player.keys, speed = (k.ShiftLeft || k.ShiftRight ? 26 : 10) * dt;
    var fwd = (k.KeyW ? 1 : 0) - (k.KeyS ? 1 : 0), side = (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0), up = (k.Space ? 1 : 0) - (k.KeyC ? 1 : 0);
    var cp = Math.cos(player.pitch), fx = -Math.sin(player.yaw) * cp, fy = Math.sin(player.pitch), fz = -Math.cos(player.yaw) * cp;
    var rx = Math.cos(player.yaw), rz = -Math.sin(player.yaw);
    player.x += (fx * fwd + rx * side) * speed;
    player.z += (fz * fwd + rz * side) * speed;
    player.y += (fy * fwd + up) * speed;
    player.y = Math.max(player.y, floorY(player.x, player.z), -2);
    player.vy = 0;
    camera.position.set(player.x, player.y + 1.62, player.z);
    camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');
    return true;
  };
  var _pkFlyPrevT = GAME.T;
  GAME.T = function () { var t = _pkFlyPrevT(); t.PK_FLY = PK_FLY; t.pkFlyToggle = pkFlyToggle; return t; };
