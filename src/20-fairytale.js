//@ Park Co, part 20: the fairy tale - the park in the Efteling manner: lanterns on every path, a gatehouse with towers and a stepped gable, pointed roofs on the land arches and the ticket windows
  // ── Why ──────────────────────────────────────────────────────────
  // A theme park is a story, not a set of sheds with signs: warm lanterns, towers with pointed roofs, stepped Dutch gables,
  // gold finials and rich colour, so every street looks like the way into a tale. This part restyles the pieces every
  // corner shares and dresses the big set pieces; the rides keep their own themes.
  var PK_FT = null;
  function pkFtM() {
    if (PK_FT) return PK_FT;
    PK_FT = {
      iron: std({ color: 0x1f2a24, roughness: 0.45, metalness: 0.55 }),            // deep green cast iron
      gold: std({ color: 0xc9a227, roughness: 0.35, metalness: 0.8 }),
      glass: std({ color: 0xffe2a0, emissive: 0xffc966, emissiveIntensity: 1.1, roughness: 0.3 }),
      slate: std({ color: 0x3b3550, roughness: 0.7, metalness: 0.1 }),              // the pointed roofs
      brick: std({ color: 0x9a5b45, roughness: 0.9 }),
      cream: std({ color: 0xf1e6cc, roughness: 0.85 }),
      wood: std({ color: 0x6a4a30, roughness: 0.8 })
    };
    return PK_FT;
  }
  // a pointed roof: an n-sided cone with a gold finial; (x, y, z) is the eaves' centre
  function pkFtSpire(parent, x, y, z, r, h, mat, n) {
    var M = pkFtM(), c = new THREE.Mesh(new THREE.ConeGeometry(r, h, n || 8, 1), mat || M.slate);
    c.position.set(x, y + h / 2, z); c.castShadow = true; parentOf(parent).add(c);
    if ((n || 8) === 4) c.rotation.y = Math.PI / 4;
    pkRoundCyl(Math.max(0.02, r * 0.04), h * 0.25, M.gold, x, y + h + h * 0.1, z, parent, 6);
    sphere(Math.max(0.05, r * 0.08), M.gold, x, y + h + h * 0.25, z, parent);
    return c;
  }
  // a round tower with a pointed roof, a band and two lit slit windows facing fz (+1 or -1 along z)
  function pkFtTower(x, z, r, h, wallMat, fz) {
    var M = pkFtM(), g = new THREE.Group(); scene.add(g);
    pkRoundCyl(r + 0.12, 0.5, M.brick, x, 0.25, z, g, 16);
    pkRoundCyl(r, h, wallMat || M.cream, x, h / 2, z, g, 16);
    pkRoundCyl(r + 0.1, 0.28, M.gold, x, h * 0.62, z, g, 16);
    pkRoundCyl(r + 0.18, 0.32, M.wood, x, h + 0.1, z, g, 16);
    for (var k = 0; k < 2; k++) box(0.34, 0.9, 0.1, M.glass, x, h * 0.35 + k * h * 0.4, z + fz * (r - 0.02), g);
    pkFtSpire(g, x, h + 0.26, z, r + 0.45, r * 2.6 + 1.4, M.slate, 10);
    solid(x - r, x + r, z - r, z + r, 0, h);
    return g;
  }

  // ── The lanterns ─────────────────────────────────────────────────
  // Every path lamp in the park: a fluted cast-iron post in deep green on a stepped foot, a scrolled bracket and a glazed
  // lantern with a little pointed roof and a gold finial, glowing warm. Replaces the plain steel post everywhere it is used.
  pkLamp = function (x, z, h, parent, twin) {
    var M = pkFtM(), g = new THREE.Group(); g.position.set(x, 0, z); parentOf(parent).add(g);
    h = h || 4.2;
    pkBevelBox(0.46, 0.18, 0.46, M.iron, 0, 0.09, 0, g, 0.04);
    pkRoundCyl(0.16, 0.6, M.iron, 0, 0.48, 0, g, 12);
    pkRoundCyl(0.07, h - 0.9, M.iron, 0, 0.78 + (h - 0.9) / 2, 0, g, 8);
    pkRoundCyl(0.11, 0.08, M.gold, 0, 0.82, 0, g, 12);
    pkRoundCyl(0.11, 0.08, M.gold, 0, h - 0.6, 0, g, 12);
    var arms = twin ? [1, -1] : [1], lens = null;
    arms.forEach(function (s) {
      // the scroll: an arm out and a curl under it
      pkRod(0, h - 0.45, 0, s * 0.62, h - 0.32, 0, 0.03, M.iron, g, 6);
      var curl = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 6, 14, Math.PI * 1.5), M.iron);
      curl.position.set(s * 0.26, h - 0.58, 0); curl.rotation.z = s > 0 ? 0.3 : Math.PI - 0.3; g.add(curl);
      // the lantern hanging from the arm's end
      var lx = s * 0.66;
      pkRoundCyl(0.012, 0.16, M.iron, lx, h - 0.38, 0, g, 6);
      pkBevelBox(0.3, 0.05, 0.3, M.iron, lx, h - 0.48, 0, g, 0.01);
      lens = pkBevelBox(0.24, 0.34, 0.24, M.glass, lx, h - 0.68, 0, g, 0.02);
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (c) { box(0.025, 0.36, 0.025, M.iron, lx + c[0] * 0.125, h - 0.68, c[1] * 0.125, g); });
      pkBevelBox(0.26, 0.05, 0.26, M.iron, lx, h - 0.87, 0, g, 0.01);
      sphere(0.04, M.gold, lx, h - 0.92, 0, g);
      pkFtSpire(g, lx, h - 0.46, 0, 0.24, 0.3, M.iron, 4);
    });
    g.userData.lampLens = lens;
    solid(x - 0.22, x + 0.22, z - 0.22, z + 0.22, 0, h);
    return lens;
  };

  // ── The gatehouse ────────────────────────────────────────────────
  // The gate gets its fairy tale on top: the piers become towers with pointed roofs, a stepped Dutch gable rises over the
  // middle with a clock in it, and lanterns hang at the corners. The turnstiles, the solids and the signs below stay.
  function pkFtGatehouse() {
    var M = pkFtM(), Z = PK_GATE_Z;
    [-10, 10].forEach(function (x) { pkFtTower(x, Z, 2.0, 8.6, M.cream, 1); });
    var gG = new THREE.Group(); gG.position.set(0, 7.9, Z); scene.add(gG);
    var steps = [[9.0, 1.3], [7.0, 1.3], [5.0, 1.3], [3.0, 1.2]];
    var y = 0;
    steps.forEach(function (s) {
      box(s[0], s[1], 0.7, M.brick, 0, y + s[1] / 2, 0, gG);
      box(s[0] + 0.3, 0.14, 0.86, M.cream, 0, y + s[1], 0, gG);
      y += s[1];
    });
    sphere(0.22, M.gold, 0, y + 0.3, 0, gG); pkRoundCyl(0.04, 0.5, M.gold, 0, y + 0.1, 0, gG, 6);
    // the clock, on both faces
    [1, -1].forEach(function (f) {
      var rim = pkRoundCyl(1.0, 0.12, M.gold, 0, 2.6, f * 0.38, gG, 28); rim.rotation.x = Math.PI / 2;
      var dial = pkRoundCyl(0.88, 0.14, M.cream, 0, 2.6, f * 0.4, gG, 28); dial.rotation.x = Math.PI / 2;
      for (var k = 0; k < 12; k++) { var a = k / 12 * Math.PI * 2; box(0.06, 0.16, 0.02, M.iron, Math.sin(a) * 0.72, 2.6 + Math.cos(a) * 0.72, f * 0.48, gG).rotation.z = -a; }
      box(0.06, 0.5, 0.02, M.iron, 0, 2.82, f * 0.5, gG);
      var mh = box(0.05, 0.66, 0.02, M.iron, 0.2, 2.75, f * 0.5, gG); mh.rotation.z = -0.9;
    });
    // lanterns hung at the four outer corners of the beam
    [[-12.2, Z + 2.3], [12.2, Z + 2.3], [-12.2, Z - 2.3], [12.2, Z - 2.3]].forEach(function (p) {
      pkRoundCyl(0.02, 0.5, M.iron, p[0], 5.0, p[1], null, 6);
      pkBevelBox(0.3, 0.42, 0.3, M.glass, p[0], 4.5, p[1], null, 0.03);
      pkFtSpire(null, p[0], 4.71, p[1], 0.24, 0.32, M.iron, 4);
    });
  }

  // ── The land arches and the ticket windows ───────────────────────
  // each land arch gains a pointed roof over each pillar; each ticket window a pointed roof over its flat one
  function pkFtArches() {
    PK_ARCHES.forEach(function (ar) {
      var L = PK_LANDS[ar[3]], along = ar[2], HW = 3.15, H = 4.6;
      var mat = std({ color: new THREE.Color(L.a).multiplyScalar(0.8), roughness: 0.6, metalness: 0.15 });
      [-1, 1].forEach(function (s) {
        var px = ar[0] + (along === 'x' ? 0 : s * HW), pz = ar[1] + (along === 'x' ? -s * HW : 0);
        pkFtSpire(null, px, H + 0.55, pz, 0.62, 1.7, mat, 8);
      });
    });
  }
  // the coaster's station at the end of the midway: a pitched slate roof over the flat canopy, a scalloped valance along the
  // platform edge and a little clock turret on the ridge, so Station Square ends at a station, not a bus shelter
  function pkFtStation() {
    var M = pkFtM(), g = new THREE.Group(); scene.add(g);
    pkGableRoof(20.6, 3.6, 1.5, M.slate, M.cream, 0, 4.0, -2.1, g, 0.35);
    for (var i = 0; i < 26; i++) { var v = new THREE.Mesh(new THREE.CircleGeometry(0.4, 10, Math.PI, Math.PI), M.cream); v.position.set(-10 + i * 0.8, 3.86, -0.37); g.add(v);
      var v2 = v.clone(); v2.position.z = -3.83; v2.rotation.y = Math.PI; g.add(v2); }
    box(1.6, 1.6, 1.6, M.cream, 0, 6.1, -2.1, g);
    box(1.8, 0.14, 1.8, M.wood, 0, 6.95, -2.1, g);
    [1, -1].forEach(function (f) { var d = pkRoundCyl(0.5, 0.06, M.cream, 0, 6.15, -2.1 + f * 0.82, g, 20); d.rotation.x = Math.PI / 2;
      var r = pkRoundCyl(0.56, 0.05, M.gold, 0, 6.15, -2.1 + f * 0.8, g, 20); r.rotation.x = Math.PI / 2;
      box(0.04, 0.34, 0.02, M.iron, 0, 6.27, -2.1 + f * 0.86, g); var mh = box(0.04, 0.4, 0.02, M.iron, 0.12, 6.2, -2.1 + f * 0.86, g); mh.rotation.z = -0.9; });
    pkFtSpire(g, 0, 7.02, -2.1, 1.25, 2.4, M.slate, 4);
  }
  function pkFtTicketRoofs() {
    PK_BOOTHS.forEach(function (b) { pkFtSpire(null, b.x, 3.1, b.z, 2.5, 2.1, pkFtM().slate, 4); });
  }

  // ── The signs ────────────────────────────────────────────────────
  // Every board in the park was a black panel with amber type, like a car park. Now they are painted boards: a deep green
  // (or the colour the sign asks for) in a gilt frame, cream-gold lettering. A sign that asks for its own colours keeps them,
  // and only the old black panels change.
  var PK_FT_DARK = { '#1b232c': 1, '#151a20': 1, '#0d1216': 1, '#151a1e': 1 };
  pkSign3D = function (lines, w, h, x, y, z, ry, opt, parent) {
    var M = pkFtM(), g = new THREE.Group();
    if (parent) parent.add(g); else scene.add(g);
    if (x !== undefined) g.position.set(x, y, z);
    if (ry !== undefined) g.rotation.y = ry;
    var o = opt || {}, dark = !o.bg || PK_FT_DARK[o.bg];
    var bg = dark ? '#21402e' : o.bg, fg = o.fg || '#f5b53d';
    if (dark && (fg === '#f5b53d' || fg === '#eef1f5' || fg === '#ffffff')) fg = '#f6e2a6';
    pkBevelBox(w, h, 0.16, std({ color: bg, roughness: 0.75 }), 0, 0, 0.1, g, 0.04);
    pkBevelBox(w + 0.1, h + 0.1, 0.07, M.gold, 0, 0, 0.13, g, 0.025);
    pkBevelBox(w - 0.02, h - 0.02, 0.02, std({ color: bg, roughness: 0.75 }), 0, 0, 0.17, g, 0.01);
    sign(lines, w * 0.9, h * 0.7, 0, 0, 0.19, 0, { bg: bg, fg: fg }, g);
    return g;
  };

  // after the world is built: the set pieces that sit on top of what the other parts made
  var _pkFtBuild = GAME.buildWorld;
  GAME.buildWorld = function (loaded) {
    var r = _pkFtBuild.apply(this, arguments);
    pkFtGatehouse(); pkFtArches(); pkFtTicketRoofs(); pkFtStation();
    return r;
  };
