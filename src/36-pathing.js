//@ Park Co, part 36: the walk. The route finder itself is the engine's (part 25): its paths keep to the paving, which
//@ a brighter A* of ours did not, and a route it cannot close still walks its guest along the straight line to the
//@ target. What is improved here is the walk itself. The engine walks a guest from waypoint to waypoint and turns on the
//@ spot at each one, so a path down a switchback lane reads as a series of right angles. This steers toward a point a
//@ short way ahead on the path instead, so the guest rounds the corner the way a person does.
  (function () {
    if (typeof NAV === 'undefined' || !NAV) return;
    function pkWalkAlong(rec, path, speed, dt) {
      if (!path || !path.length) return true;
      var step = speed * dt, look = Math.max(0.6, Math.min(1.5, speed * 0.6));
      // a waypoint within the look-ahead is already behind the guest's turn: aim at the next one, so the corner is
      // rounded off rather than walked as two straight legs with a pivot on the corner
      while (path.length > 1) {
        var ax = path[0].x - rec.x, az = path[0].z - rec.z;
        if (ax * ax + az * az > look * look) break;
        path.shift();
      }
      var p = path[0], dx = p.x - rec.x, dz = p.z - rec.z, d0 = Math.sqrt(dx * dx + dz * dz), d = d0 || 1;
      // already standing on the waypoint (a walk to the spot the guest is on): it is reached, not a step of length 1 away
      if (d0 < 0.001) { if (path.length === 1) { path.length = 0; return true; } path.shift(); return path.length === 0; }
      var move = Math.min(step, d);
      rec.x += dx / d * move; rec.z += dz / d * move;
      rec.yaw = easeYaw(rec.yaw || 0, Math.atan2(dx, dz), Math.min(1, dt * 9));
      if (d <= Math.max(step, 0.06)) {
        if (path.length === 1) { rec.x = p.x; rec.z = p.z; path.length = 0; return true; }
        path.shift();
      }
      return path.length === 0;
    }
    walkAlong = pkWalkAlong;
    CO.pkWalk = pkWalkAlong;
  })();
