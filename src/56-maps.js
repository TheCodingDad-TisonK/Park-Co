//@ Park Co, part 56: the park maps - big map boards across the park, each with its own YOU ARE HERE
  // ── Why ──────────────────────────────────────────────────────────
  // The park grew to three hundred metres across, with a whole strip of rides beyond the Dragon Ride that cannot be seen
  // from the gate. A guest (and the player) needs to be able to stop and look: where am I, where is the wheel, how do I get
  // to the kids' rides. So there are map boards: six metres wide, under a little slate roof with a lamp at each end, at the
  // gate, on Station Square and at the main junctions. Each is the same map with its own red YOU ARE HERE.
  //
  // The map is drawn once, from the park's own tables: the paving is the list part 12 lays (so the map is the streets as
  // they are, not a sketch of them), the rides are the plots, the railway is the ring, the Skyline is the viaduct's line.
  // Move a ride or a street and the map follows at the next load.
  var PK_MAP = { tex: null, boards: [], W: 2048, H: 1408, X0: -137, X1: 167, Z0: -128, Z1: 80, TOP: 104, PW: 6.0, PH: 4.125 };
  // where the boards stand: [x, z, ry, name]. ry turns the front to face the street; both faces carry the map
  var PK_MAP_SPOTS = [
    [10.5, 52.2, Math.PI, 'the forecourt'],
    [8.15, 15.5, -Math.PI / 2, 'the midway'],
    [-24, -63.7, 0, 'the Promenade, west'],
    [26, -63.7, 0, 'the Promenade, east'],
    [-34.3, -50, Math.PI / 2, 'West Street'],
    [66, -1.0, 0, 'the Avenue, at the East Walk'],
    [-40.5, 34.6, Math.PI, 'the Fairground lane'],
    [134, -5.4, 0, 'the East Parade, at Dragon Gate'],
    [130.5, -90, -Math.PI / 2, 'The Little Meadow']
  ];
  // the big rides as the ground they cover, [x0, x1, z0, z1]: a plot's circle says nothing useful about a coaster
  var PK_MAP_BOX = {
    joris: [79, 122, -133, -3], mountain: [82, 121, 5, 69], wildhunt: [-43, 28, -116, -81], serpent: [44, 69, -92, -66],
    baron: [46, 68, 15, 32], flume: [47, 68, -54, -12], danse: [-63, -32, -39, -11], droom: [-113, -76, -32, 30],
    theater: [-124, -67, -98, -38]
  };
  function pkMapX(x) { var M = PK_MAP; return (x - M.X0) / (M.X1 - M.X0) * M.W; }
  function pkMapZ(z) { var M = PK_MAP; return M.TOP + (z - M.Z0) / (M.Z1 - M.Z0) * (M.H - M.TOP); }
  function pkMapHex(c) { return '#' + ('000000' + (c >>> 0).toString(16)).slice(-6); }
  function pkMapDraw(c, W, H) {
    var M = PK_MAP, k = W / (M.X1 - M.X0), X = pkMapX, Z = pkMapZ, i;
    var label = function (t, x, y, size, col, bold) {
      c.font = (bold === false ? '' : 'bold ') + size + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.lineJoin = 'round'; c.lineWidth = Math.max(4, size * 0.3); c.strokeStyle = 'rgba(250,246,232,0.95)'; c.strokeText(t, x, y);
      c.fillStyle = col || '#1b232c'; c.fillText(t, x, y);
    };
    // the country round the park, and the title band
    c.fillStyle = '#c9d2b0'; c.fillRect(0, 0, W, H);
    // the park inside its fence
    var P = PK_PARK;
    var lawn = c.createLinearGradient(0, Z(P.z0), 0, Z(71)); lawn.addColorStop(0, '#b4d294'); lawn.addColorStop(1, '#a3c683');
    c.fillStyle = lawn;
    c.fillRect(X(P.x0), Z(P.z0), (P.x1 - P.x0) * k, (Z(71) - Z(P.z0)));
    c.fillStyle = '#c9d2b0';
    c.fillRect(X(P.x0) - 2, Z(PK_KIDS_Z), (X(-32.5) - X(P.x0)) + 2, Z(71) - Z(PK_KIDS_Z) + 2);                  // south of the west lawn's fence
    c.fillRect(X(-32.5), Z(PK_GATE_Z), X(32.5) - X(-32.5), Z(71) - Z(PK_GATE_Z) + 2);                             // the forecourt and the car park lie outside
    c.fillRect(X(PK_EAST_BAY.x), Z(PK_EAST_BAY.z0), X(P.x1) - X(PK_EAST_BAY.x) + 2, Z(PK_EAST_BAY.z1) - Z(PK_EAST_BAY.z0));   // Dragon Gate's bay
    // the road and the car parks
    c.fillStyle = '#8f9499'; c.fillRect(X(-137), Z(72), W, Z(80) - Z(72));
    c.fillRect(X(-31), Z(53), X(31) - X(-31), Z(71) - Z(53));
    c.fillRect(X(33), Z(33), X(64) - X(33), Z(72) - Z(33));
    label('P', X(0), Z(62), 44, '#ffffff'); label('P', X(48.5), Z(52), 44, '#ffffff');
    // the Lindenburg Railway: the ring, sleepered, and its stations
    var R = TR.R, rw = TR.W, re = TR.E, rn = TR.N, rs = TR.S;
    var ring = function () {
      c.beginPath(); c.moveTo(X(rw + R), Z(rn)); c.lineTo(X(re - R), Z(rn)); c.arcTo(X(re), Z(rn), X(re), Z(rn + R), R * k);
      c.lineTo(X(re), Z(rs - R)); c.arcTo(X(re), Z(rs), X(re - R), Z(rs), R * k); c.lineTo(X(rw + R), Z(rs));
      c.arcTo(X(rw), Z(rs), X(rw), Z(rs - R), R * k); c.lineTo(X(rw), Z(rn + R)); c.arcTo(X(rw), Z(rn), X(rw + R), Z(rn), R * k); c.closePath();
    };
    c.strokeStyle = '#4b3a2a'; c.lineWidth = 9; ring(); c.stroke();
    c.strokeStyle = '#e8e2cc'; c.lineWidth = 5; c.setLineDash([10, 10]); ring(); c.stroke(); c.setLineDash([]);
    // the paving: every shape part 12 lays, as it lays it
    var pave = function (grow, col) {
      c.fillStyle = col; c.strokeStyle = col;
      PK_PAVE.shapes.forEach(function (s) {
        if (s.k === 'disc') { c.beginPath(); c.arc(X(s.x), Z(s.z), (s.r + grow) * k, 0, 6.2832); c.fill(); }
        else if (s.k === 'rect') c.fillRect(X(s.x0 - grow), Z(s.z0 - grow), (s.x1 - s.x0 + 2 * grow) * k, (s.z1 - s.z0 + 2 * grow) * k);
        else { c.lineCap = 'square'; c.lineWidth = (s.w + 2 * grow) * k; c.beginPath(); c.moveTo(X(s.x0), Z(s.z0)); c.lineTo(X(s.x1), Z(s.z1)); c.stroke(); }
      });
    };
    pave(0.45, '#8a7a5c'); pave(0, '#ead9b4');
    // the Skyline: the viaduct's line across the park
    if (typeof PK_XP_VIA !== 'undefined') {
      c.strokeStyle = '#108080'; c.lineWidth = 6; c.lineJoin = 'round'; c.beginPath();
      PK_XP_VIA.forEach(function (p, n) { if (n) c.lineTo(X(p[0]), Z(p[1])); else c.moveTo(X(p[0]), Z(p[1])); });
      c.stroke();
    }
    // the fence
    c.strokeStyle = '#3a3f36'; c.lineWidth = 3; c.setLineDash([3, 5]);
    c.strokeRect(X(P.x0), Z(P.z0), (P.x1 - P.x0) * k, Z(71) - Z(P.z0)); c.setLineDash([]);
    // the lands, named large and faint under the rides
    var land = function (t, x, z, size, turn) {
      c.save(); c.translate(X(x), Z(z)); if (turn) c.rotate(-Math.PI / 2);
      c.font = 'bold ' + size + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(40,70,40,0.5)'; c.fillText(t, 0, 0); c.restore();
    };
    land('THE FAIRGROUND', -52, 22, 30); land('THE DARK WOODS', -50, -71, 30); land('THE GARDENS', 2, -52.5, 26);
    land('COASTER COUNTRY', 55, -3.5, 26); land('DREAM REALM', -118, -1, 30, true);
    land('THE LITTLE MEADOW', 156, -70, 30, true); land('THRILLS', 156.5, 50, 30, true);
    // the rides: the ground each covers, in its own colour, numbered; the names are in the list along the bottom
    var names = [], n = 0;
    var pin = function (x, z, num) {
      c.fillStyle = '#1d5b3b'; c.beginPath(); c.arc(x, z, 17, 0, 6.2832); c.fill();
      c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.stroke();
      c.font = 'bold 20px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffffff'; c.fillText(String(num), x, z + 1);
    };
    var rides = [{ id: 'coaster', name: 'The Coaster', x: 3, z: -20, col: 0xb02020, box: [-23, 29, -36, -8] }];
    PK_PLOTS.forEach(function (p) { var th = PK_THEME[p.id]; rides.push({ id: p.id, name: (th && th.name) || p.name, x: p.x, z: p.z, r: p.r, col: th ? th.a : 0x888888, box: PK_MAP_BOX[p.id] }); });
    rides.forEach(function (r) {
      n++; names.push(n + '  ' + r.name);
      c.fillStyle = pkMapHex(r.col); c.strokeStyle = pkMapHex(r.col); c.lineWidth = 3; c.lineJoin = 'round';
      var px, pz, fillSoft = function () { c.globalAlpha = 0.34; c.fill(); c.globalAlpha = 0.9; c.stroke(); };
      if (r.id === 'skyline') { c.globalAlpha = 1; px = X(-67); pz = Z(-43); c.fillStyle = '#108080'; c.fillRect(px - 9, pz - 16, 18, 32); }
      else if (r.box) { var b = r.box; roundRect(c, X(b[0]), Z(b[2]), (b[1] - b[0]) * k, (b[3] - b[2]) * k, 14); fillSoft(); px = X((b[0] + b[1]) / 2); pz = Z((b[2] + b[3]) / 2); }
      else { c.beginPath(); c.arc(X(r.x), Z(r.z), Math.max(4, Math.min(r.r, 11)) * k, 0, 6.2832); fillSoft(); px = X(r.x); pz = Z(r.z); }
      c.globalAlpha = 1;
      pin(px, pz, n);
      label(r.name, px, pz + 32, 19, '#1b232c');
    });
    // the playhouse, the stations, the gate
    if (typeof PK_PLAYHOUSE !== 'undefined') label('playhouse', X(PK_PLAYHOUSE.x), Z(PK_PLAYHOUSE.z), 17, '#3a2a1a');
    if (typeof TR_STATIONS !== 'undefined') TR_STATIONS.forEach(function (s) {
      c.fillStyle = '#12301f'; c.fillRect(X(s.x) - 9, Z(s.z) - 9, 18, 18); c.strokeStyle = '#f2e6b8'; c.lineWidth = 2; c.strokeRect(X(s.x) - 9, Z(s.z) - 9, 18, 18);
      var dx = s.x < -100 ? 62 : s.x > 150 ? -8 : 0, dz = s.z < -100 ? -22 : s.z > 100 ? 24 : (s.x > 150 ? -26 : -22);
      label(s.name, X(s.x) + dx, Z(s.z) + dz, 17, '#12301f');
    });
    label('ENTRANCE', X(0), Z(41), 22, '#1b232c'); label('HQ', X(-25), Z(42), 17, '#1b232c');
    label('LINDENBURG RAILWAY', X(20), Z(TR.S) + 22, 17, '#4b3a2a'); label('THE SKYLINE', X(-67) + 4, Z(-150), 17, '#0c5c5c');
    // north
    c.save(); c.translate(X(-128), Z(-112)); c.fillStyle = '#1b232c'; c.beginPath(); c.moveTo(0, -30); c.lineTo(12, 12); c.lineTo(0, 4); c.lineTo(-12, 12); c.closePath(); c.fill();
    c.font = 'bold 22px sans-serif'; c.textAlign = 'center'; c.fillText('N', 0, 36); c.restore();
    // the title band, and the list of rides along it
    c.fillStyle = '#1d5b3b'; c.fillRect(0, 0, W, M.TOP);
    c.fillStyle = '#f5b53d'; c.fillRect(0, M.TOP - 5, W, 5);
    c.font = 'bold 54px sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = '#f5e9c2'; c.fillText('PARK CO', 28, 38);
    c.font = 'bold 22px sans-serif'; c.fillStyle = '#f5b53d'; c.fillText('PARK MAP', 30, 80);
    c.font = 'bold 19px sans-serif'; c.fillStyle = '#f5e9c2';
    var cols = Math.ceil(names.length / 4), cw = (W - 330) / cols;
    names.forEach(function (t, q) { c.fillText(t, 310 + Math.floor(q / 4) * cw, 16 + (q % 4) * 23); });
  }
  function pkMapTex() {
    var M = PK_MAP;
    if (!M.tex) { M.tex = tex(M.W, M.H, pkMapDraw, 1, 1); if (renderer.capabilities && renderer.capabilities.getMaxAnisotropy) M.tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); }
    return M.tex;
  }
  // one board: two oak posts, the framed map on both faces, a slate roof, a lamp at each end and its own red marker
  function pkMapBoard(x, z, ry, name) {
    var M = PK_MAP, K = pkMats(), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
    var oak = pkMatWoodRich(), PW = M.PW, PH = M.PH, Y0 = 0.75, CY = Y0 + PH / 2, HW = PW / 2 + 0.2;
    var face = new THREE.MeshStandardMaterial({ map: pkMapTex(), roughness: 0.85, emissive: 0xffffff, emissiveMap: pkMapTex(), emissiveIntensity: 0.22 });
    // posts on stone feet, the frame, the backing
    [-HW, HW].forEach(function (px) {
      pkBevelBox(0.5, 0.3, 0.5, K.stone, px, 0.15, 0, g, 0.04);
      pkBevelBox(0.24, Y0 + PH + 0.5, 0.24, oak, px, (Y0 + PH + 0.5) / 2, 0, g, 0.03);
    });
    pkBevelBox(PW + 0.16, PH + 0.16, 0.1, oak, 0, CY, 0, g, 0.02);
    pkBevelBox(PW + 0.6, 0.14, 0.2, oak, 0, Y0 - 0.12, 0, g, 0.03);
    [1, -1].forEach(function (s) {
      var side = new THREE.Group(); side.position.set(0, CY, s * 0.056); side.rotation.y = s > 0 ? 0 : Math.PI; g.add(side);
      var mp = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), face); side.add(mp);
      // YOU ARE HERE: a red stud on the map where this board stands, ringed in white, and its plate
      var u = (pkMapX(x) / M.W - 0.5) * PW, v = (0.5 - pkMapZ(z) / M.H) * PH;
      var ringM = new THREE.Mesh(new THREE.CircleGeometry(0.105, 24), std({ color: 0xffffff, roughness: 0.5 })); ringM.position.set(u, v, 0.006); side.add(ringM);
      var stud = new THREE.Mesh(new THREE.CircleGeometry(0.075, 24), std({ color: 0xd8231c, emissive: 0xd8231c, emissiveIntensity: 0.45, roughness: 0.4 })); stud.position.set(u, v, 0.009); stud.userData.pkMapStud = true; side.add(stud);
      var py = v + (v > PH / 2 - 0.5 ? -0.2 : 0.2), pu = Math.max(-PW / 2 + 0.45, Math.min(PW / 2 - 0.45, u));
      pkSign3D(['YOU ARE HERE'], 0.72, 0.13, pu, py, 0.012, 0, { bg: '#b8231c', fg: '#ffffff' }, side);
    });
    // the roof: a ridge beam and two slate slopes, wider than the board so the map stays dry
    var RY = Y0 + PH + 0.5;
    pkBevelBox(PW + 1.2, 0.16, 0.18, oak, 0, RY + 0.42, 0, g, 0.03);
    [1, -1].forEach(function (s) {
      var sl = box(PW + 1.4, 0.08, 1.05, K.slate, 0, RY + 0.2, s * 0.45, g); sl.rotation.x = s * 0.5;
    });
    // a lamp under the eaves at each end, on both faces: they light with the park's lamps
    [-1, 1].forEach(function (sx) { [1, -1].forEach(function (s) {
      box(0.06, 0.06, 0.5, K.iron, sx * (PW / 2 - 0.5), RY - 0.05, s * 0.3, g);
      pkRoundCyl(0.11, 0.2, glowMat(0xfff2c0, 1.1), sx * (PW / 2 - 0.5), RY - 0.2, s * 0.52, g, 10);
    }); });
    // solid: nobody walks through the board
    var cs = Math.cos(ry), sn = Math.sin(ry), ex = Math.abs(cs) * (HW + 0.25) + Math.abs(sn) * 0.3, ez = Math.abs(sn) * (HW + 0.25) + Math.abs(cs) * 0.3;
    solid(x - ex, x + ex, z - ez, z + ez, 0, RY + 0.6);
    PK_KEEP.push([x, z, 3.4]);
    var b = { g: g, x: x, z: z, ry: ry, name: name };
    M.boards.push(b);
    return b;
  }
  function pkMapBoards() {
    // the HQ hangs its map before the streets are laid (part 18 builds first): draw it again now they are
    if (PK_MAP.tex) { var cv = PK_MAP.tex.image, cx = cv.getContext('2d'); cx.setTransform(1, 0, 0, 1, 0, 0); pkMapDraw(cx, PK_MAP.W, PK_MAP.H); PK_MAP.tex.needsUpdate = true; }
    PK_MAP_SPOTS.forEach(function (s) { pkMapBoard(s[0], s[1], s[2], s[3]); });
  }
  // built with the theme (part 12), once the streets are laid: the map is drawn from them
  var _pkMapPrevTheme = pkThemeBuild;
  pkThemeBuild = function () { _pkMapPrevTheme(); pkMapBoards(); };

  var _pkMapPrevT = GAME.T;
  GAME.T = function () { var t = _pkMapPrevT(); t.PK_MAP = PK_MAP; t.PK_MAP_SPOTS = PK_MAP_SPOTS; t.PK_PAVE = PK_PAVE; t.pkMapX = pkMapX; t.pkMapZ = pkMapZ; return t; };
