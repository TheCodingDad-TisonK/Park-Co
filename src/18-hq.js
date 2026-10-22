//@ Park Co, part 18: Park Co HQ - the park's own building on the forecourt, three floors, the owner's office at the top
  // ── What it is ────────────────────────────────────────────────────
  // Where the little office stood: a three-storey building on a stone base, brick between cream cornices, steel-framed
  // windows, a flat roof with PARK CO on it. Ground floor: Guest Services, a lobby with the park map, and the plant room with
  // the park services switchboard. First floor: Operations - the security room with a monitor wall (one screen a land), the
  // meeting room with a live whiteboard and the staff room. Top floor: the owner's office - the desk at the windows with the
  // management PC, the executive chair, a sofa corner, the bookcase, the trophy cabinet, the wall TV and the minibar.
  // A switchback stair in the west wing joins the floors; floorY knows which floor you are on from how high you stand.
  var PK_HQ = { x0: -31, x1: -19, z0: 37, z1: 47, lv: [0, 3.6, 7.2], top: 10.8, slab: 0.25,
    st: { xa: [-30.8, -29.7], xb: [-29.65, -28.55], z0: 41.0, zl: 43.7, z1: 44.9, voidX: -28.4 } };

  // ── Where you stand: the floors, the stairs ───────────────────────
  // every surface under a point, and the highest one within a step of your feet
  function pkHQFloor(x, z, y) {
    var H = PK_HQ, S = H.st;
    if (x < H.x0 || x > H.x1 || z < H.z0 || z > H.z1) return null;
    var best = 0, lim = (y === undefined ? 99 : y) + 0.55;
    function take(h) { if (h <= lim && h > best) best = h; }
    var inVoid = x < S.voidX && z > S.z0 - 0.1 && z < S.z1 + 0.1;
    for (var i = 0; i < H.lv.length; i++) if (i === 0 || !inVoid) take(H.lv[i]);
    for (var f = 0; f < H.lv.length - 1; f++) {
      var b = H.lv[f], half = (H.lv[f + 1] - b) / 2, run = S.zl - S.z0;
      if (z >= S.z0 && z <= S.zl) {
        if (x >= S.xa[0] && x <= S.xa[1]) take(b + half * (z - S.z0) / run);              // the first flight, up toward the landing
        if (x >= S.xb[0] && x <= S.xb[1]) take(b + half + half * (S.zl - z) / run);       // the second flight, back up to the floor
      }
      if (z > S.zl && z <= S.z1 && x >= S.xa[0] && x <= S.xb[1]) take(b + half);          // the landing
    }
    return best;
  }
  var _pkHQPrevFloor = GAME.floorY, _pkHQPrevIndoors = GAME.indoors, _pkHQPrevRoof = GAME.roofAt;
  GAME.floorY = function (x, z, y) { var h = pkHQFloor(x, z, y); return h === null ? _pkHQPrevFloor(x, z, y) : h; };
  GAME.indoors = function (x, z) { var H = PK_HQ; return (x > H.x0 && x < H.x1 && z > H.z0 && z < H.z1) || _pkHQPrevIndoors(x, z); };
  GAME.roofAt = function (x, z) { var H = PK_HQ; return x > H.x0 && x < H.x1 && z > H.z0 && z < H.z1 ? H.top : _pkHQPrevRoof(x, z); };

  // ── The building ──────────────────────────────────────────────────
  function pkBuildHQ() {
    var H = PK_HQ, X0 = H.x0, X1 = H.x1, Z0 = H.z0, Z1 = H.z1, CX = (X0 + X1) / 2, CZ = (Z0 + Z1) / 2, W = X1 - X0, D = Z1 - Z0;
    var M = pkMats(), S2 = pkBkStd, T = 0.25, FH = 3.6;
    var brick = pkMatBrick(), stone = pkMatStone(), cream = S2({ color: 0xece5d7, roughness: 0.9 }), inner = S2({ color: 0xe9e4d8, roughness: 0.92 });
    var steel = S2({ color: 0x2f3a42, roughness: 0.45, metalness: 0.45 }), glass = pkMatGlassRich(), oak = pkMatWoodRich();
    var navy = S2({ color: 0x23324a, roughness: 0.6 }), gold = M.gold;
    pkSlab(13.6, 11.6, CX, CZ, 0.024, M.paversWarm);
    // a run of wall along one axis at one floor: the openings are windows ([s0, s1]) or doors ([s0, s1, 'door'])
    function run(axis, at, a0, a1, y0, opens, out) {
      var cuts = (opens || []).slice().sort(function (p, q) { return p[0] - q[0]; }), pos = a0, sill = 0.9, head = 2.75, h = FH;
      function piece(s0, s1, yb, yh, mat) {
        if (s1 - s0 < 0.01 || yh < 0.01) return;
        var m = (s0 + s1) / 2, len = s1 - s0;
        if (axis === 'x') box(len, yh, T, mat, m, yb + yh / 2, at); else box(T, yh, len, mat, at, yb + yh / 2, m);
      }
      cuts.forEach(function (c) {
        piece(pos, c[0], y0, h, brick);
        var len = c[1] - c[0], m = (c[0] + c[1]) / 2;
        if (c[2] === 'door') { piece(c[0], c[1], y0 + 2.5, h - 2.5, brick); }
        else {
          piece(c[0], c[1], y0, sill, brick); piece(c[0], c[1], y0 + head, h - head, brick);
          if (axis === 'x') { box(len - 0.06, head - sill, 0.05, glass, m, y0 + (sill + head) / 2, at + out * 0.06); box(len + 0.1, 0.08, 0.32, stone, m, y0 + sill - 0.04, at + out * 0.08); }
          else { box(0.05, head - sill, len - 0.06, glass, at + out * 0.06, y0 + (sill + head) / 2, m); box(0.32, 0.08, len + 0.1, stone, at + out * 0.08, y0 + sill - 0.04, m); }
          // the frame: head, two jambs and a transom
          if (axis === 'x') { box(len, 0.08, 0.14, steel, m, y0 + head, at + out * 0.08); [c[0], c[1]].forEach(function (s) { box(0.08, head - sill, 0.14, steel, s, y0 + (sill + head) / 2, at + out * 0.08); }); box(len, 0.05, 0.1, steel, m, y0 + head - 0.55, at + out * 0.08); }
          else { box(0.14, 0.08, len, steel, at + out * 0.08, y0 + head, m); [c[0], c[1]].forEach(function (s) { box(0.14, head - sill, 0.08, steel, at + out * 0.08, y0 + (sill + head) / 2, s); }); box(0.1, 0.05, len, steel, at + out * 0.08, y0 + head - 0.55, m); }
        }
        pos = c[1];
      });
      piece(pos, a1, y0, h, brick);
      // collision: the wall is solid all along at this floor except at a door
      var segs = [[a0, a1]]; cuts.forEach(function (c) { if (c[2] !== 'door') return; var o = []; segs.forEach(function (s) { if (c[1] <= s[0] || c[0] >= s[1]) { o.push(s); return; } if (c[0] > s[0]) o.push([s[0], c[0]]); if (c[1] < s[1]) o.push([c[1], s[1]]); }); segs = o; });
      segs.forEach(function (s) { if (axis === 'x') solid(s[0], s[1], at - 0.15, at + 0.15, y0, y0 + FH); else solid(at - 0.15, at + 0.15, s[0], s[1], y0, y0 + FH); });
    }
    // ── the walls, floor by floor ──
    for (var f = 0; f < 3; f++) {
      var y0 = H.lv[f];
      // north, toward the gate and the park: big windows on every floor (the top floor all glass but the piers)
      run('x', Z0, X0, X1, y0, f === 2 ? [[-30.6, -28.2], [-27.6, -24.4], [-23.8, -20.6]] : [[-30.4, -28.6], [-27.6, -25.2], [-24.4, -22.0], [-21.2, -19.6]], -1);
      // east, to the forecourt: the entrance on the ground floor, windows above
      run('z', X1, Z0, Z1, y0, f === 0 ? [[37.6, 40.6], [41.4, 43.6, 'door'], [44.4, 46.4]] : [[37.6, 40.4], [41.0, 43.8], [44.4, 46.4]], 1);
      // south, to the car park; west, to the fence
      run('x', Z1, X0, X1, y0, [[-27.4, -25.0], [-23.6, -21.2]], 1);
      run('z', X0, Z0, Z1, y0, [[37.6, 39.8]], -1);
      // the cornice at each floor line and the band over it, cream on the brick: round the outside, so they never close the
      // stair well inside
      pkPlinthRing(X0, X1, Z0, Z1, 0.22, 0.25, cream, null, null, y0 + FH - 0.16);
      pkPlinthRing(X0, X1, Z0, Z1, 0.08, 0.31, stone, null, null, y0 + FH + 0.03);
    }
    // the stone base round the foot of the walls (outside them, not a block under the ground floor), open at the entrance,
    // and the corner quoins up the building
    pkPlinthRing(X0, X1, Z0, Z1, 0.8, 0.18, stone, null, [{ side: 'x1', a: 41.4, b: 43.6 }]);
    [[X0, Z0], [X1, Z0], [X0, Z1], [X1, Z1]].forEach(function (c) { for (var q = 0; q < 14; q++) box(q % 2 ? 0.5 : 0.7, 0.36, q % 2 ? 0.7 : 0.5, stone, c[0], 1.0 + q * 0.72, c[1]); });
    // ── floors and the roof ──
    var vx = H.st.voidX, vz0 = H.st.z0 - 0.1, vz1 = H.st.z1 + 0.1;
    // a ceiling under a floor that has the stair coming up through it: three panels round the well, the well left open
    function wellCeiling(y) {
      var a = X0 + 0.15, b = X1 - 0.15, c = Z0 + 0.15, d = Z1 - 0.15;
      box(b - vx, 0.05, d - c, inner, (vx + b) / 2, y, (c + d) / 2);
      box(vx - a, 0.05, vz0 - c, inner, (a + vx) / 2, y, (c + vz0) / 2);
      box(vx - a, 0.05, d - vz1, inner, (a + vx) / 2, y, (vz1 + d) / 2);
    }
    for (var lv = 1; lv < 3; lv++) {
      var ly = H.lv[lv];
      box(X1 - vx, T, D, inner, (vx + X1) / 2, ly - T / 2, CZ);
      box(vx - X0, T, vz0 - Z0, inner, (X0 + vx) / 2, ly - T / 2, (Z0 + vz0) / 2);
      box(vx - X0, T, Z1 - vz1, inner, (X0 + vx) / 2, ly - T / 2, (vz1 + Z1) / 2);
      // the floor finish: carpet on the office floors
      pkPaved(X1 - vx - 0.3, D - 0.3, lv === 2 ? S2({ color: 0x3a4a5e, roughness: 0.95 }) : S2({ color: 0x6b6f72, roughness: 0.92 }), (vx + X1) / 2, ly + 0.012, CZ, 1.2);
    }
    // the stair well is walled on its south and east sides through every floor, open at its north end where the flights are
    // got on and off, so nobody walks off a landing or a flight
    box(0.14, H.top, S0z1() - 41.6, cream, vx + 0.05, H.top / 2, (41.6 + S0z1()) / 2);
    box(vx + 0.12 - X0, H.top, 0.14, cream, (X0 + vx + 0.12) / 2, H.top / 2, S0z1());
    solid(vx - 0.03, vx + 0.13, 41.6, S0z1() + 0.07, 0, H.top);
    solid(X0, vx + 0.13, S0z1() - 0.07, S0z1() + 0.07, 0, H.top);
    function S0z1() { return H.st.z1 + 0.1; }
    // the top floor has no flight going up: a rail over the first flight's well
    box(H.st.xa[1] - X0, 1.0, 0.06, steel, (X0 + H.st.xa[1]) / 2, H.lv[2] + 0.5, vz0); solid(X0, H.st.xa[1] + 0.05, vz0 - 0.06, vz0 + 0.06, H.lv[2], H.lv[2] + 1.1);
    box(W - 0.3, T, D - 0.3, inner, CX, H.top - T / 2, CZ);                                  // the top floor's ceiling
    box(W + 0.4, 0.3, D + 0.4, MAT.roof, CX, H.top + 0.15, CZ);                              // the roof
    [[CX, Z0 - 0.1, W + 0.4, 0.2], [CX, Z1 + 0.1, W + 0.4, 0.2]].forEach(function (p) { box(p[2], 0.7, p[3], brick, p[0], H.top + 0.65, p[1]); box(p[2] + 0.1, 0.08, p[3] + 0.12, stone, p[0], H.top + 1.04, p[1]); });
    [[X0 - 0.1, CZ], [X1 + 0.1, CZ]].forEach(function (p) { box(0.2, 0.7, D + 0.4, brick, p[0], H.top + 0.65, p[1]); box(0.32, 0.08, D + 0.5, stone, p[0], H.top + 1.04, p[1]); });
    // PARK CO on the roof, lit, facing the forecourt; and over the gate
    [-2.6, 2.6].forEach(function (dz) { box(0.12, 0.8, 0.12, MAT.steelDark, X1 - 0.6, H.top + 1.1, CZ + dz); });
    box(0.24, 1.3, 6.0, MAT.steelDark, X1 - 0.6, H.top + 2.0, CZ);
    pkSign3D(['PARK CO'], 5.6, 1.1, X1 - 0.46, H.top + 2.0, CZ, Math.PI / 2, { bg: '#151a20', fg: '#f5b53d' });
    pkSign3D(['PARK CO HQ'], 4.2, 0.6, CX, H.top + 0.6, Z0 - 0.22, Math.PI, { bg: '#151a20', fg: '#f5b53d' });
    // two flag poles on the roof, and the plant
    [[X0 + 1.0, Z0 + 1.0], [X0 + 1.0, Z1 - 1.0]].forEach(function (p, i) {
      pkRoundCyl(0.06, 4.0, MAT.steelDark, p[0], H.top + 2.3, p[1], null, 8); sphere(0.1, gold, p[0], H.top + 4.35, p[1]);
      box(1.3, 0.8, 0.02, S2({ color: i ? 0xf5b53d : 0x1b232c, roughness: 0.8, side: THREE.DoubleSide }), p[0] + 0.68, H.top + 3.8, p[1]);
    });
    var acG = new THREE.Group(); acG.position.set(CX - 1.5, H.top + 0.3, CZ + 2.2); scene.add(acG);
    pkBevelBox(2.0, 0.9, 1.2, S2({ color: 0xd9d6cc, roughness: 0.5 }), 0, 0.45, 0, acG, 0.03);
    var acFan = new THREE.Group(); acFan.position.set(0, 0.91, 0); acFan.userData.dynamic = true; acG.add(acFan);
    for (var fb = 0; fb < 4; fb++) { var fbl = box(0.08, 0.015, 0.4, MAT.steel, 0, 0, 0.2, null); var fa = new THREE.Group(); fa.rotation.y = fb * Math.PI / 2; acFan.add(fa); fa.add(fbl); }
    pkCtlLive({ tick: function (dt) { acFan.rotation.y += dt * 7; } });

    // ── the entrance ──
    var dz0 = 41.4, dz1 = 43.6, dm = (dz0 + dz1) / 2;
    pkBkDoor(scene, X1 + 0.02, 0, dz0, 0, 1.45, (dz1 - dz0) / 2, 2.45, { leaf: glass, glass: glass, kick: steel }, 'the HQ door').setNow(1);
    pkBkDoor(scene, X1 + 0.02, 0, dz1, Math.PI, -1.45, (dz1 - dz0) / 2, 2.45, { leaf: glass, glass: glass, kick: steel }, 'the HQ door').setNow(1);
    box(0.16, 2.6, 0.16, steel, X1 + 0.05, 1.3, dz0 - 0.08); box(0.16, 2.6, 0.16, steel, X1 + 0.05, 1.3, dz1 + 0.08); box(0.16, 0.16, dz1 - dz0 + 0.32, steel, X1 + 0.05, 2.52, dm);
    // the canopy over it on two posts, the name on its fascia
    box(2.2, 0.16, 3.6, navy, X1 + 1.1, 3.0, dm); box(0.1, 0.4, 3.6, gold, X1 + 2.2, 2.85, dm);
    [dz0 - 0.5, dz1 + 0.5].forEach(function (z) { pkRoundCyl(0.07, 3.0, steel, X1 + 2.05, 1.5, z, null, 10); solid(X1 + 1.95, X1 + 2.15, z - 0.1, z + 0.1, 0, 3); });
    pkSign3D(['PARK CO HQ', 'GUEST SERVICES'], 2.6, 0.42, X1 + 2.26, 2.75, dm, Math.PI / 2, { bg: '#151a20', fg: '#f5b53d' });
    pkPaved(3.2, 3.6, M.paversWarm, X1 + 1.6, 0.046, dm, 0);
    pkPlanter(1.6, null, X1 + 0.9, 0, dz0 - 1.4); pkPlanter(1.6, null, X1 + 0.9, 0, dz1 + 1.4);
    pkBoothLantern(null, X1 + 0.2, 2.2, dz0 - 0.5); pkBoothLantern(null, X1 + 0.2, 2.2, dz1 + 0.5);

    // ── the stair: a switchback flight pair per floor, steps you can see and a handrail ──
    var S = H.st;
    for (var fl = 0; fl < 2; fl++) {
      var b = H.lv[fl], half = (H.lv[fl + 1] - b) / 2, n = 12, tr = (S.zl - S.z0) / n;
      for (var k = 0; k < n; k++) {
        var hA = b + half * (k + 1) / n, hB = b + half + half * (k + 1) / n;
        box(S.xa[1] - S.xa[0], 0.06, tr, stone, (S.xa[0] + S.xa[1]) / 2, hA - 0.03, S.z0 + (k + 0.5) * tr);
        box(S.xa[1] - S.xa[0], half / n, 0.03, steel, (S.xa[0] + S.xa[1]) / 2, hA - half / n / 2, S.z0 + k * tr);
        box(S.xb[1] - S.xb[0], 0.06, tr, stone, (S.xb[0] + S.xb[1]) / 2, hB - 0.03, S.zl - (k + 0.5) * tr);
      }
      box(S.xb[1] - S.xa[0], 0.12, S.z1 - S.zl, stone, (S.xa[0] + S.xb[1]) / 2, b + half - 0.06, (S.zl + S.z1) / 2);   // the landing
      // the stringers and the rail between the flights
      pkRod((S.xa[1] + S.xb[0]) / 2, b + 0.95, S.z0, (S.xa[1] + S.xb[0]) / 2, b + half + 0.95, S.zl, 0.025, oak, null, 6);
      pkRod((S.xa[1] + S.xb[0]) / 2, b + half + 0.95, S.zl, (S.xa[1] + S.xb[0]) / 2, b + 2 * half + 0.95, S.z0, 0.025, oak, null, 6);
      // under the landing and the second flight a player on the floor below is kept out (the well's own floor is open)
      // (1.2 m high: a walker on the floor is kept out, someone on the steps - never lower than 1.5 m by the landing - is not)
      if (fl === 0) { solid(S.xa[0], S.xb[1], S.zl, S.z1, 0, 1.2); solid(S.xb[0], S.xb[1], S.z0, S.zl, 0, 1.2); }
    }

    // ── ground floor: Guest Services ──
    var gy = 0.02;
    pkPaved(W - 0.3, D - 0.3, S2({ color: 0xcfc6b4, roughness: 0.6 }), CX, gy + 0.01, CZ, 0.9);        // a polished stone floor
    wellCeiling(FH - T - 0.03);
    [-26, -22].forEach(function (x) { pkBkBatten(scene, x, FH - T - 0.08, 39.5, 0, 1.4); pkBkBatten(scene, x, FH - T - 0.08, 44.5, 0, 1.4); });
    // the counter along the north side, facing the lobby, with its screen
    pkBevelBox(4.6, 1.05, 0.7, navy, -24.6, 0.53, 38.9, null, 0.03);
    pkBevelBox(4.7, 0.06, 0.8, oak, -24.6, 1.08, 38.95, null, 0.02);
    box(4.6, 0.12, 0.04, gold, -24.6, 0.9, 39.26);
    solid(-26.95, -22.25, 38.5, 39.3, 0, 1.1);
    pkSign3D(['GUEST SERVICES'], 2.6, 0.4, -24.6, 2.6, Z0 + 0.15, 0, { bg: '#151a20', fg: '#f5b53d' });
    var gs = touchScreen({ w: 360, h: 200, pw: 0.9, ph: 0.5, x: -22.9, y: 1.85, z: Z0 + 0.16, parent: null, title: 'Guest Services',
      draw: function (c, s) {
        scBg(c, s.w, s.h); scHead(c, s.w, 'PARK CO TODAY', fmtTime(S.time));
        scText(c, 16, 76, 'Guests in the park', '#a0acb8'); scText(c, 250, 76, String(PK.guests.length), '#eef1f5', 20);
        scText(c, 16, 108, 'Rides open', '#a0acb8'); scText(c, 250, 108, pkOpenCount() + ' / ' + (PK.attractions.length + 1), '#5fd38d', 20);
        scText(c, 16, 140, 'Tickets sold', '#a0acb8'); scText(c, 250, 140, String(PK.today.tickets), '#eef1f5', 20);
        scText(c, 16, 172, PK.closed ? 'THE PARK IS CLOSED' : 'OPEN 09:00 - 22:00', PK.closed ? '#ff6b5e' : '#f5b53d', 14);
      } });
    PK_BK_LIVE.push({ sc: gs, g: gs.mesh, every: 2 });
    // the lobby: a sofa and a low table, plants, the park map, a bench, lost property and first aid
    pkHQSofa(-24.6, 0, 45.9, 0, S2({ color: 0x8a3b2c, roughness: 0.85 }));
    pkBevelBox(1.2, 0.08, 0.6, oak, -24.6, 0.42, 44.8, null, 0.02); [-0.5, 0.5].forEach(function (dx) { box(0.05, 0.4, 0.5, steel, -24.6 + dx, 0.2, 44.8); });
    solid(-25.3, -23.9, 44.4, 46.5, 0, 0.8);
    [[-20.0, 37.8], [-20.0, 46.2], [-27.9, 46.2]].forEach(function (p) { pkHQPlant(p[0], 0, p[1], 1.2); });
    pkHQMap(-21.6, 1.75, Z1 - 0.15, Math.PI, 2.2, 1.3);
    pkBkFirstAid(scene, X0 + 0.15, 1.7, 38.6, Math.PI / 2);
    pkBkNotice(scene, X0 + 0.14, 1.75, 39.5, Math.PI / 2, ['LOST PROPERTY', 'ASK AT THE DESK'], 0.6, 0.3, { bg: '#1b232c', fg: '#f5b53d' });
    // the plant room behind a partition by the stair: the park services switchboard on its wall
    box(0.15, FH - T, 2.0, cream, -25.4, (FH - T) / 2, 46.0); box(2.0, FH - T, 0.15, cream, -26.4, (FH - T) / 2, 44.95); box(1.0, FH - T - 2.2, 0.15, cream, -27.9, 2.2 + (FH - T - 2.2) / 2, 44.95);
    solid(-25.48, -25.32, 44.95, Z1, 0, FH); solid(-27.4, -25.4, 44.88, 45.02, 0, FH);   // the doorway is the metre by the stair
    pkSign3D(['PLANT ROOM'], 0.8, 0.18, -27.9, 2.35, 44.86, Math.PI, { bg: '#e8e3d6', fg: '#1b232c' });
    pkBuildParkCabinet(-25.55, 1.66, 46.0, -Math.PI / 2);

    // ── first floor: Operations ──
    var oy = H.lv[1];
    wellCeiling(oy + FH - T - 0.03);
    [-26, -22].forEach(function (x) { pkBkBatten(scene, x, oy + FH - T - 0.08, 39.5, 0, 1.4); pkBkBatten(scene, x, oy + FH - T - 0.08, 44.5, 0, 1.4); });
    // a corridor wall down the middle (north rooms, south staff room), with two doorways
    box(1.6, FH - T, 0.15, cream, -27.6, oy + (FH - T) / 2, 42.0); box(2.8, FH - T, 0.15, cream, -23.9, oy + (FH - T) / 2, 42.0); box(2.4, FH - T, 0.15, cream, -20.3, oy + (FH - T) / 2, 42.0);
    box(0.15, FH - T, D / 2 - 0.2, cream, -24.4, oy + (FH - T) / 2, 39.5);
    solid(-28.4, -26.8, 41.93, 42.07, oy, oy + FH); solid(-25.3, -22.5, 41.93, 42.07, oy, oy + FH); solid(-21.5, -19.1, 41.93, 42.07, oy, oy + FH);
    solid(-24.48, -24.32, Z0, 42, oy, oy + FH);
    pkSign3D(['SECURITY'], 0.8, 0.18, -22.0, oy + 2.35, 42.09, 0, { bg: '#e8e3d6', fg: '#1b232c' });
    pkSign3D(['MEETING ROOM'], 0.9, 0.18, -26.0, oy + 2.35, 42.09, 0, { bg: '#e8e3d6', fg: '#1b232c' });
    // the security room: a wall of monitors, one a land, and the desk in front of it
    pkHQMonitorWall(-21.75, oy + 1.75, Z0 + 0.16);
    pkBevelBox(3.6, 0.05, 0.8, oak, -21.75, oy + 0.78, 38.6, null, 0.015); box(3.5, 0.72, 0.04, steel, -21.75, oy + 0.38, 38.25);
    solid(-23.55, -19.95, 38.2, 39.0, oy, oy + 1.0);
    pkBkChair(scene, -22.6, 39.7, Math.PI, oy); pkBkChair(scene, -20.9, 39.7, Math.PI, oy);
    pkBkRadio(scene, -20.3, oy + 0.805, 38.55, 0); pkBkIntercom(scene, X1 - 0.15, oy + 1.5, 40.6, -Math.PI / 2);
    // the meeting room: a table, chairs round it, the whiteboard with the day's numbers
    pkBevelBox(2.4, 0.06, 1.1, oak, -26.4, oy + 0.75, 39.5, null, 0.02); [-0.9, 0.9].forEach(function (dx) { box(0.08, 0.72, 0.9, steel, -26.4 + dx, oy + 0.36, 39.5); });
    solid(-27.6, -25.2, 38.95, 40.05, oy, oy + 0.9);
    [[-27.2, 38.4, 0], [-25.6, 38.4, 0], [-27.2, 40.6, Math.PI], [-25.6, 40.6, Math.PI]].forEach(function (c) { pkHQSideChair(c[0], oy, c[1], c[2]); });
    var wb = touchScreen({ w: 400, h: 220, pw: 1.6, ph: 0.88, x: -26.4, y: oy + 1.75, z: Z0 + 0.16, parent: null, title: 'The whiteboard',
      draw: function (c, s) {
        c.fillStyle = '#f4f4f0'; c.fillRect(0, 0, s.w, s.h); c.strokeStyle = '#2f5d8a'; c.lineWidth = 3;
        c.fillStyle = '#1b232c'; c.font = 'bold 22px ' + SCREEN_THEME.font; c.textAlign = 'left'; c.fillText('TODAY  ·  DAY ' + S.day, 14, 32);
        c.fillStyle = '#2f5d8a'; c.font = '18px ' + SCREEN_THEME.font;
        c.fillText('Bank  ' + money(S.bank), 14, 70); c.fillText('Tickets  ' + PK.today.tickets, 14, 100); c.fillText('Rides ridden  ' + PK.today.rides, 14, 130); c.fillText('Snacks  ' + PK.today.snacks, 14, 160);
        c.fillStyle = '#b8362b'; c.fillText('Level ' + PK.level + '   coaster wear ' + Math.round(S.wear || 0) + ' %', 14, 196);
        c.strokeRect(230, 50, 150, 130); c.beginPath(); for (var i = 0; i < 8; i++) { var hh = 20 + ((PK.today.tickets * 7 + i * 31) % 90); c.moveTo(240 + i * 17, 175); c.lineTo(240 + i * 17, 175 - hh); } c.stroke();
      } });
    PK_BK_LIVE.push({ sc: wb, g: wb.mesh, every: 3 });
    box(1.7, 0.95, 0.03, steel, -26.4, oy + 1.75, Z0 + 0.14);
    // the staff room: a kitchenette along the south wall, a table, the vending machine, lockers and a coat rack
    pkBevelBox(4.0, 0.92, 0.62, S2({ color: 0xd8d4c8, roughness: 0.5 }), -22.0, oy + 0.46, Z1 - 0.45, null, 0.02);
    pkBevelBox(4.05, 0.05, 0.66, S2({ color: 0x3a3f45, roughness: 0.4 }), -22.0, oy + 0.94, Z1 - 0.45, null, 0.01);
    box(0.6, 0.02, 0.4, MAT.chrome, -23.3, oy + 0.97, Z1 - 0.45);
    pkBevelBox(0.5, 0.35, 0.4, MAT.black, -21.2, oy + 1.15, Z1 - 0.48, null, 0.02);
    pkBevelBox(0.3, 0.4, 0.3, S2({ color: 0xb8362b, roughness: 0.4 }), -20.5, oy + 1.17, Z1 - 0.45, null, 0.02);
    pkBevelBox(0.7, 1.8, 0.65, S2({ color: 0xe8e6e0, roughness: 0.45 }), -19.75, oy + 0.9, Z1 - 0.45, null, 0.02);
    solid(-24.1, -19.3, Z1 - 0.8, Z1, oy, oy + 1.9);
    pkBevelBox(1.6, 0.05, 0.9, oak, -24.0, oy + 0.75, 44.3, null, 0.02); box(0.08, 0.72, 0.08, steel, -24.0, oy + 0.36, 44.3);
    solid(-24.8, -23.2, 43.85, 44.75, oy, oy + 0.9);
    [[-24.7, 43.4, 0], [-23.3, 43.4, 0], [-24.7, 45.2, Math.PI], [-23.3, 45.2, Math.PI]].forEach(function (c) { pkHQSideChair(c[0], oy, c[1], c[2]); });
    pkBevelBox(0.9, 1.9, 0.75, S2({ color: 0x2f6fb3, roughness: 0.4 }), -27.7, oy + 0.95, 46.4, null, 0.02);
    box(0.6, 1.1, 0.02, S2({ color: 0xd8e8f8, roughness: 0.2, emissive: 0x6fa8e0, emissiveIntensity: 0.4 }), -27.7, oy + 1.2, 46.0);
    pkSign3D(['SNACKS'], 0.5, 0.12, -27.7, oy + 1.86, 45.99, Math.PI, { bg: '#1b232c', fg: '#f5b53d' });
    solid(-28.2, -27.2, 46.0, Z1, oy, oy + 1.9);
    for (var lk = 0; lk < 3; lk++) pkBevelBox(0.48, 1.85, 0.46, S2({ color: lk % 2 ? 0x5a6f7c : 0x51656f, roughness: 0.5, metalness: 0.35 }), -26.6 + lk * 0.5, oy + 0.925, 46.55, null, 0.01);
    solid(-26.9, -25.1, 46.3, Z1, oy, oy + 1.9);
    pkBkClock(scene, -22.0, oy + 2.55, Z1 - 0.15, Math.PI, 0.17);

    // ── top floor: the owner's office ──
    var ty = H.lv[2];
    box(W - 0.3, 0.05, D - 0.3, S2({ color: 0x2a2f36, roughness: 0.8 }), CX, ty + FH - T - 0.03, CZ);
    [-25.5, -21.5].forEach(function (x) { [39.5, 44.5].forEach(function (z) { pkRoundCyl(0.22, 0.06, S2({ color: 0x1b1f23, roughness: 0.5 }), x, ty + FH - T - 0.08, z, null, 16); sphere(0.12, glowMat(0xfff0d0, 1.1), x, ty + FH - T - 0.13, z); }); });
    pkPaved(4.2, 3.0, S2({ color: 0x8a6a4a, roughness: 0.95 }), -21.6, ty + 0.02, 44.4, 1.0);   // a rug under the sofa corner
    // the desk at the north windows: walnut on a steel frame, the workstation that runs the park, a lamp, papers and a nameplate
    var desk = S2({ color: 0x4a3426, roughness: 0.55 });
    pkBevelBox(2.6, 0.07, 1.1, desk, -23.6, ty + 0.78, 38.8, null, 0.02);
    pkBevelBox(0.6, 0.74, 1.0, desk, -24.6, ty + 0.38, 38.8, null, 0.02); pkBevelBox(0.6, 0.74, 1.0, desk, -22.6, ty + 0.38, 38.8, null, 0.02);
    pkBevelBox(1.5, 0.5, 0.04, desk, -23.6, ty + 0.48, 38.3, null, 0.01);
    solid(-24.95, -22.25, 38.2, 39.4, ty, ty + 1.0);
    pkHQOwnerPC(-23.6, ty + 0.815, 38.8);   // the workstation and Park OS, part 25
    pkSign3D(['THE OWNER'], 0.42, 0.1, -23.0, ty + 0.86, 39.32, 0, { bg: '#d8c9a8', fg: '#1b232c' });
    // the lamp on the front corner, clear of the second screen
    pkRoundCyl(0.08, 0.03, MAT.steelDark, -22.45, ty + 0.83, 39.05, null, 12); pkRod(-22.45, ty + 0.84, 39.05, -22.55, ty + 1.25, 39.0, 0.015, gold, null, 6);
    sphere(0.06, glowMat(0xfff0c8, 1.2), -22.55, ty + 1.24, 39.0);
    var pc1 = pkBevelBox(0.3, 0.008, 0.4, MAT.paper, -24.3, ty + 0.82, 39.0, null, 0.003); pc1.rotation.y = 0.2;
    // the owner's chair, high-backed, facing the desk and the view
    pkHQExecChair(-23.6, ty, 39.85);
    // the sofa corner by the east windows: a sofa, two armchairs, a low table
    pkHQSofa(-21.6, ty, 45.9, 0, S2({ color: 0x2f3a46, roughness: 0.85 }));
    pkHQArmchair(-19.9, 44.3, -Math.PI / 2); pkHQArmchair(-23.3, 44.3, Math.PI / 2);
    pkBevelBox(1.2, 0.06, 0.7, desk, -21.6, ty + 0.42, 44.3, null, 0.02); box(1.0, 0.36, 0.5, MAT.steelDark, -21.6, ty + 0.2, 44.3);
    solid(-22.3, -20.9, 43.9, 44.7, ty, ty + 0.5);
    // the bookcase on the west of the room, the trophy cabinet, the wall TV, the minibar, the map and plants
    pkHQBookcase(-27.9, ty, 39.2, Math.PI / 2);
    pkHQTrophies(-27.9, ty, 46.2, Math.PI / 2);
    pkHQWallTV(-24.4, ty + 1.85, Z1 - 0.14);
    pkBevelBox(1.2, 0.95, 0.5, desk, -26.4, ty + 0.48, Z1 - 0.4, null, 0.02);
    [0, 1, 2, 3].forEach(function (i) { pkRoundCyl(0.035, 0.28, S2({ color: [0x2f5d3a, 0x6b3a2a, 0x8fb0d4, 0xd8c9a8][i], roughness: 0.2 }), -26.8 + i * 0.25, ty + 1.1, Z1 - 0.4, null, 8); });
    solid(-27.05, -25.75, Z1 - 0.7, Z1, ty, ty + 1.0);
    pkHQMap(-20.2, ty + 1.75, Z1 - 0.15, Math.PI, 1.6, 1.0);
    [[-19.9, 37.9], [-27.9, 41.0]].forEach(function (p) { pkHQPlant(p[0], ty, p[1], 1.5); });
    pkBkClock(scene, X1 - 0.15, ty + 2.4, 42.6, -Math.PI / 2, 0.2);

    PK.office = { x: CX, z: CZ, hq: H };
  }

  // ── The furniture ─────────────────────────────────────────────────
  function pkHQSofa(x, y, z, ry, mat) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; scene.add(g);
    return pkHQSofaAt(g, mat);
  }
  function pkHQSofaAt(g, mat) {
    pkBevelBox(2.2, 0.42, 0.85, mat, 0, 0.21, 0, g, 0.08); pkBevelBox(2.2, 0.55, 0.22, mat, 0, 0.66, 0.32, g, 0.08);
    pkBevelBox(0.22, 0.6, 0.85, mat, -1.0, 0.4, 0, g, 0.06); pkBevelBox(0.22, 0.6, 0.85, mat, 1.0, 0.4, 0, g, 0.06);
    [-0.5, 0.5].forEach(function (dx) { pkBevelBox(0.95, 0.12, 0.6, mat, dx, 0.46, -0.08, g, 0.05); });
    return g;
  }
  function pkHQArmchair(x, z, ry) {
    var y = pkHQLevelAt(x, z), g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; scene.add(g);
    var mat = pkBkStd({ color: 0x6b3a2a, roughness: 0.75 });
    pkBevelBox(0.85, 0.42, 0.8, mat, 0, 0.21, 0, g, 0.08); pkBevelBox(0.85, 0.55, 0.2, mat, 0, 0.66, -0.3, g, 0.08);
    pkBevelBox(0.16, 0.55, 0.8, mat, -0.36, 0.4, 0, g, 0.06); pkBevelBox(0.16, 0.55, 0.8, mat, 0.36, 0.4, 0, g, 0.06);
    return g;
  }
  function pkHQSideChair(x, y, z, ry) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; scene.add(g);
    var m = pkBkStd({ color: 0x2b333a, roughness: 0.7 });
    pkBevelBox(0.45, 0.06, 0.45, m, 0, 0.45, 0, g, 0.02); pkBevelBox(0.45, 0.45, 0.05, m, 0, 0.7, -0.21, g, 0.02);
    [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(function (l) { box(0.03, 0.45, 0.03, MAT.steelDark, l[0], 0.22, l[1], g); });
    return g;
  }
  // the owner's chair: high-backed leather on a five-star base, and you can sit in it
  function pkHQExecChair(x, y, z) {
    var g = pkBkChair(scene, x, z, Math.PI, y);
    var leather = pkBkStd({ color: 0x3a2418, roughness: 0.6 });
    pkBevelBox(0.5, 0.42, 0.09, leather, 0, 1.15, -0.27, g, 0.04);
    return g;
  }
  function pkHQPlant(x, y, z, h) {
    var M = pkMats();
    pkRoundCyl(0.24, 0.42, pkBkStd({ color: 0xd8c9a8, roughness: 0.7 }), x, y + 0.21, z, null, 14);
    pkRoundCyl(0.03, h * 0.5, M.bark || MAT.wood, x, y + 0.42 + h * 0.25, z, null, 6);
    [[0, 0.9, 0, 0.36], [0.16, 0.75, 0.1, 0.26], [-0.14, 0.8, -0.1, 0.28]].forEach(function (b) { sphere(b[3] * h / 1.2, M.hedge, x + b[0], y + 0.42 + b[1] * h * 0.75, z + b[2]); });
    solid(x - 0.25, x + 0.25, z - 0.25, z + 0.25, y, y + 0.5);
  }
  function pkHQBookcase(x, y, z, ry) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; scene.add(g);
    var wood = pkBkStd({ color: 0x4a3426, roughness: 0.6 });
    pkBevelBox(2.2, 2.4, 0.4, wood, 0, 1.2, 0, g, 0.02);
    var cols = [0x8a3b2c, 0x2f4f7a, 0x2f6f4f, 0xc9a227, 0x6b4f8a, 0xd8c9a8];
    for (var sh = 0; sh < 5; sh++) {
      var sy = 0.3 + sh * 0.44; box(2.1, 0.03, 0.34, wood, 0, sy, 0.02, g);
      for (var bk = 0; bk < 14; bk++) { var bh = 0.26 + ((bk * 7 + sh * 3) % 5) * 0.02; box(0.12, bh, 0.24, pkBkStd({ color: cols[(bk + sh) % cols.length], roughness: 0.8 }), -0.95 + bk * 0.145, sy + 0.015 + bh / 2, 0.04, g); }
    }
    var c = Math.cos(ry), s = Math.sin(ry), hx = 1.1 * Math.abs(c) + 0.2 * Math.abs(s), hz = 1.1 * Math.abs(s) + 0.2 * Math.abs(c);
    solid(x - hx, x + hx, z - hz, z + hz, y, y + 2.4);
  }
  function pkHQTrophies(x, y, z, ry) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; scene.add(g);
    var wood = pkBkStd({ color: 0x4a3426, roughness: 0.6 }), M = pkMats();
    pkBevelBox(1.4, 2.0, 0.45, wood, 0, 1.0, 0, g, 0.02);
    box(1.3, 1.5, 0.02, M.glass, 0, 1.2, 0.23, g);
    [0.6, 1.1, 1.6].forEach(function (sy, r) {
      box(1.3, 0.03, 0.38, wood, 0, sy, 0.02, g);
      [-0.4, 0, 0.4].forEach(function (dx, i) {
        pkRoundCyl(0.06, 0.06, M.gold, dx, sy + 0.05, 0.02, g, 10); pkRoundCyl(0.025, 0.12, M.gold, dx, sy + 0.14, 0.02, g, 6);
        var cup = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.05, 0.14, 12, 1, true), M.gold); cup.position.set(dx, sy + 0.27, 0.02); g.add(cup);
      });
    });
    pkSign3D(['BEST PARK', 'OF THE YEAR'], 0.6, 0.16, 0, 2.15, 0.24, 0, { bg: '#1b232c', fg: '#f5b53d' }, g);
    var c = Math.cos(ry), s = Math.sin(ry), hx = 0.7 * Math.abs(c) + 0.23 * Math.abs(s), hz = 0.7 * Math.abs(s) + 0.23 * Math.abs(c);
    solid(x - hx, x + hx, z - hz, z + hz, y, y + 2.0);
  }
  // the park map: the lands, the routes and every ride, drawn from the park's own tables
  function pkHQMap(x, y, z, ry, w, h) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; scene.add(g);
    pkBevelBox(w + 0.1, h + 0.1, 0.05, pkMatWoodRich(), 0, 0, -0.02, g, 0.015);
    var cv = tex(512, Math.round(512 * h / w), function (c, W2, H2) {
      c.fillStyle = '#e8e2cc'; c.fillRect(0, 0, W2, H2);
      var P = PK_PARK, k = Math.min(W2 / (P.x1 - P.x0 + 8), H2 / (P.z1 - P.z0 + 8)), ox = W2 / 2 - (P.x0 + P.x1) / 2 * k, oz = H2 / 2 - (P.z0 + P.z1) / 2 * k;
      function X(v) { return ox + v * k; } function Z(v) { return oz + v * k; }
      c.fillStyle = '#9cbb7a'; c.fillRect(X(P.x0), Z(P.z0), (P.x1 - P.x0) * k, (30 - P.z0) * k);
      c.strokeStyle = '#c9a77a'; c.lineCap = 'round';
      PK_ROUTES.forEach(function (r) { c.lineWidth = Math.max(2, r[4] * k); c.beginPath(); c.moveTo(X(r[0]), Z(r[1])); c.lineTo(X(r[2]), Z(r[3])); c.stroke(); });
      c.lineWidth = 14 * k; c.beginPath(); c.moveTo(X(0), Z(30)); c.lineTo(X(0), Z(-2)); c.stroke();
      c.strokeStyle = '#2f5d8a'; c.lineWidth = 2; c.beginPath(); PK_TRACK_PTS.forEach(function (p, i) { if (i) c.lineTo(X(p[0]), Z(p[2])); else c.moveTo(X(p[0]), Z(p[2])); }); c.closePath(); c.stroke();
      PK_PLOTS.forEach(function (p) { c.fillStyle = '#c94f4f'; c.beginPath(); c.arc(X(p.x), Z(p.z), Math.max(3, p.r * k * 0.6), 0, 6.283); c.fill(); });
      c.fillStyle = '#1b232c'; c.font = 'bold 18px sans-serif'; c.textAlign = 'center'; c.fillText('PARK CO', W2 / 2, 22);
      c.fillStyle = '#f5b53d'; c.beginPath(); c.arc(X(PK_HQ.x0 + 6), Z(PK_HQ.z0 + 5), 5, 0, 6.283); c.fill();
      c.fillStyle = '#1b232c'; c.font = '11px sans-serif'; c.fillText('YOU ARE HERE', X(PK_HQ.x0 + 6), Z(PK_HQ.z0 + 5) - 9);
    }, 1, 1);
    var mp = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: cv, roughness: 0.8 })); mp.position.z = 0.01; g.add(mp);
    return g;
  }
  // the security room's monitor wall: one screen for each land and one for the coaster, every ride with its state and queue
  function pkHQMonitorWall(x, y, z) {
    var g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
    pkBevelBox(3.5, 1.4, 0.1, MAT.steelDark, 0, 0, -0.04, g, 0.02);
    var LANDS = [['THE FAIRGROUND', ['carousel', 'teacups', 'kround', 'kpots', 'kpuffin']], ['THRILLS', ['ferris', 'dodgems', 'baron']], ['THE DARK WOODS', ['haunted', 'droptower', 'nocturne', 'wreck']],
      ['COASTER COUNTRY', ['flume', 'serpent', 'moonwood']], ['THE COASTER', []], ['THE GATE', null]];
    LANDS.forEach(function (L, i) {
      var cx = -1.15 + (i % 3) * 1.15, cy = 0.33 - Math.floor(i / 3) * 0.66;
      var sc = touchScreen({ w: 300, h: 180, pw: 1.08, ph: 0.6, x: cx, y: cy, z: 0.02, parent: g, title: 'Security: ' + L[0].toLowerCase(),
        draw: function (c, s) {
          c.fillStyle = '#060a0d'; c.fillRect(0, 0, s.w, s.h);
          c.fillStyle = '#8fe0a0'; c.font = 'bold 14px monospace'; c.textAlign = 'left'; c.fillText(L[0], 8, 18);
          c.textAlign = 'right'; c.fillText(fmtTime(S.time), s.w - 8, 18); c.textAlign = 'left'; c.font = '13px monospace';
          if (L[1] === null) {
            c.fillText('TICKET LINES  ' + PK.booths.map(function (b) { return b.queue.length; }).join(' / '), 8, 50);
            c.fillText('SOLD TODAY    ' + PK.today.tickets, 8, 74); c.fillText('IN THE PARK   ' + PK.guests.length, 8, 98);
          } else if (!L[1].length) {
            var R = PK.ride; c.fillText('STATE   ' + pkRideWord().toUpperCase(), 8, 50); c.fillText('QUEUE   ' + PK.queue.length, 8, 74); c.fillText('RIDERS  ' + R.riders, 8, 98); c.fillText('SPEED   ' + (R.v || 0).toFixed(1) + ' m/s', 8, 122);
          } else L[1].forEach(function (id, j) {
            var a = PK.attrById[id]; if (!a) return;
            var w = a.ctl && a.ctl.fault ? 'STOP' : a.ctl && a.ctl.maint ? 'MAINT' : (a.state || '').toUpperCase().slice(0, 7);
            c.fillStyle = a.ctl && (a.ctl.fault || a.ctl.maint) ? '#ff6b5e' : '#8fe0a0';
            c.fillText((a.name.toUpperCase() + '            ').slice(0, 15) + ' ' + (w + '        ').slice(0, 8) + ' Q' + a.queue.length, 8, 46 + j * 22);
          });
          if (Math.floor(PK_BK_T + i) % 2 === 0) { c.fillStyle = '#ff3b30'; c.beginPath(); c.arc(s.w - 12, s.h - 12, 4, 0, 6.283); c.fill(); }
          pkBkScanlines(c, s.w, s.h);
        } });
      PK_BK_LIVE.push({ sc: sc, g: g, every: 1.0 });
    });
  }
  // the wall TV in the office: the park's day, big
  function pkHQWallTV(x, y, z) {
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = Math.PI; scene.add(g);
    pkBevelBox(1.7, 1.0, 0.06, MAT.black, 0, 0, -0.03, g, 0.02);
    var sc = touchScreen({ w: 480, h: 270, pw: 1.6, ph: 0.9, x: 0, y: 0, z: 0.005, parent: g, title: 'The office TV',
      draw: function (c, s) {
        scBg(c, s.w, s.h); scHead(c, s.w, 'PARK CO  ·  DAY ' + S.day, fmtTime(S.time));
        c.fillStyle = '#eef1f5'; c.font = 'bold 44px ' + SCREEN_THEME.font; c.textAlign = 'left'; c.fillText(money(S.bank), 18, 104);
        c.fillStyle = '#8b98a4'; c.font = '14px ' + SCREEN_THEME.font; c.fillText('IN THE BANK', 20, 124);
        var st = [['GUESTS', PK.guests.length], ['TICKETS', PK.today.tickets], ['RIDES', PK.today.rides], ['LEVEL', PK.level]];
        st.forEach(function (q, i) { var sx = 18 + i * 116; c.fillStyle = '#8b98a4'; c.font = '13px ' + SCREEN_THEME.font; c.fillText(q[0], sx, 170); c.fillStyle = '#f5b53d'; c.font = 'bold 30px ' + SCREEN_THEME.font; c.fillText(String(q[1]), sx, 206); });
        c.fillStyle = PK.closed ? '#ff6b5e' : '#5fd38d'; c.font = 'bold 16px ' + SCREEN_THEME.font; c.fillText(PK.closed ? 'THE GATE IS SHUT' : 'THE GATE IS OPEN', 18, 250);
      } });
    PK_BK_LIVE.push({ sc: sc, g: g, every: 2 });
  }
  // the armchairs only stand in the owner's office, on the top floor
  function pkHQLevelAt(x, z) { return PK_HQ.lv[2]; }
