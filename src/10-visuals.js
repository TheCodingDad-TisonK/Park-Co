//@ Park Co, part 10: visuals - the festive layer.
// String lights across the midway on their own masts, a popcorn cart and a balloon seller by the hub fountain.
// Everything here is additive. Gone: the second gate arch (the gate already has one), the ride-to-ride bunting garlands (each ride
// dresses itself in part 06; one had a typo that put its bunting at NaN) and the old string lights (every span was skipped, so none drew).
// Kept: the hanging baskets and path markers, because the editor's world file moves, hides and copies them.

// ── String lights across the midway ─────────────────────────────────
// Three spans on masts either side of the walk, sagging in the middle. The bulbs are one instanced mesh per span.
function pkStringLights() {
  var M = pkMats(), X = 5.2;
  [6.5, 16.5, 25.0].forEach(function (z) {
    [-X, X].forEach(function (x) {
      pkRoundCyl(0.07, 5.4, M.iron, x, 2.7, z, null, 10);
      pkBevelBox(0.34, 0.12, 0.34, M.stoneDark, x, 0.06, z, null, 0.03);
      sphere(0.1, M.gold, x, 5.5, z);
      solid(x - 0.12, x + 0.12, z - 0.12, z + 0.12, 0, 5.4);
    });
    var wire = [], bulbs = [], n = 18;
    for (var i = 0; i <= n; i++) {
      var t = i / n, x = -X + 2 * X * t, y = 5.3 - Math.sin(t * Math.PI) * 0.85;
      wire.push([x, y, z]);
      if (i > 0 && i < n) bulbs.push([x, y - 0.1, z]);
    }
    pkTube(wire, 0.012, M.iron, null, false, 40, 4);
    pkBulbs(bulbs, M.bulbWarm, 0.075);
  });
}

// ── A popcorn cart and a balloon seller ─────────────────────────────
function pkPopcornCart(x, z, ry) {
  var M = pkMats(), g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; scene.add(g);
  pkBevelBox(1.5, 0.8, 0.95, M.cream, 0, 0.75, 0, g, 0.05);
  pkBevelBox(1.56, 0.1, 1.0, M.iron, 0, 1.2, 0, g, 0.03);
  pkBevelBox(1.3, 0.62, 0.8, M.glass, 0, 1.55, 0, g, 0.03);
  pkBevelBox(1.5, 0.1, 0.95, M.iron, 0, 1.9, 0, g, 0.03);
  [-0.7, 0.7].forEach(function (wx) { var w = pkRoundCyl(0.32, 0.1, M.iron, wx, 0.32, 0.5, g, 14); w.rotation.z = Math.PI / 2; });
  pkRod(-0.7, 0.9, -0.5, -1.5, 0.9, -0.5, 0.03, M.iron, g, 6);
  pkRoundCyl(0.04, 2.5, M.iron, 0, 2.3, 0, g, 6);
  var brolly = new THREE.Mesh(new THREE.ConeGeometry(1.35, 0.55, 10), pkStripes('#d94f4f', '#f4f4f0')); brolly.position.set(0, 3.45, 0); brolly.castShadow = true; g.add(brolly);
  sphere(0.07, M.gold, 0, 3.78, 0, g);
  sign(['POPCORN'], 1.2, 0.3, 0, 1.0, 0.5, 0, { bg: '#d94f4f', fg: '#ffffff' }, g);
  solid(x - 0.85, x + 0.85, z - 0.6, z + 0.6, 0, 1.9);
  return g;
}
function pkBalloons(x, z) {
  var M = pkMats(), g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  pkRoundCyl(0.05, 1.5, M.iron, 0, 0.75, 0, g, 6);
  pkBevelBox(0.5, 0.12, 0.5, M.stoneDark, 0, 0.06, 0, g, 0.03);
  var cols = [0xd94f4f, 0xf0c04a, 0x4f8fd9, 0xe08fc0, 0x5fd38d, 0xff8a3d, 0xb85cc7], rng = pkRng(55);
  for (var i = 0; i < 14; i++) {
    var a = rng() * 6.283, r = 0.2 + rng() * 0.7, h = 2.6 + rng() * 1.4, bx = Math.cos(a) * r, bz = Math.sin(a) * r;
    var b = new THREE.Mesh(new THREE.SphereGeometry(0.27, 10, 8), std({ color: cols[i % cols.length], roughness: 0.25, metalness: 0.05 }));
    b.scale.y = 1.2; b.position.set(bx, h, bz); b.castShadow = true; g.add(b);
    pkRod(0, 1.5, 0, bx, h - 0.3, bz, 0.005, M.iron, g, 3);
  }
  solid(x - 0.3, x + 0.3, z - 0.3, z + 0.3, 0, 1.6);
  return g;
}

// ── Hanging baskets on lamp posts ───────────────────────────────────
function pkHangingBaskets() {
  var M = pkMats();
  var posts = [
    [-7, 24, PK_THEME.carousel], [7, 24, PK_THEME.teacups],
    [-7, 12, PK_THEME.ferris], [7, 12, PK_THEME.dodgems],
    [-7, 0, PK_THEME.droptower], [7, 0, PK_THEME.flume]
  ];
  posts.forEach(function (p) {
    var bas = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.5, 8),
      std({ color: 0x8a5a3a, roughness: 0.8 }));
    bas.position.set(p[0], 3.6, p[1]); bas.rotation.x = Math.PI;
    scene.add(bas);
    pkRod(p[0], 4.6, p[1], p[0], 4.1, p[1], 0.015, M.iron, null, 4);
    var cols = [0xd94f4f, 0xf0c04a, 0xe08fc0, 0xf2f2f2];
    for (var f = 0; f < 6; f++) {
      var fa = f / 6 * Math.PI * 2;
      sphere(0.09, std({ color: cols[f % 4], roughness: 0.85 }),
        p[0] + Math.cos(fa) * 0.28, 3.5, p[1] + Math.sin(fa) * 0.28);
    }
  });
}

// ── Path edge markers along the midway ─────────────────────────────
function pkPathMarkers() {
  var M = pkMats();
  var edges = [
    { x0: -8.5, z0: 6, x1: -8.5, z1: 26 },
    { x0: 8.5,  z0: 6, x1: 8.5,  z1: 26 },
    { x0: -14, z0: 30, x1: 14,  z1: 30 },
  ];
  edges.forEach(function (e) {
    var dx = e.x1 - e.x0, dz = e.z1 - e.z0, len = Math.sqrt(dx * dx + dz * dz);
    var n = Math.max(4, Math.round(len / 2.2));
    for (var i = 0; i <= n; i++) {
      var t = i / n, x = e.x0 + dx * t, z = e.z0 + dz * t;
      box(0.14, 0.5, 0.14, M.stoneDark, x, 0.25, z);
      box(0.22, 0.06, 0.22, M.brass, x, 0.55, z);
    }
  });
}

// ── Hook into the build ─────────────────────────────────────────────
var _pkBuildAttractions2 = pkBuildAttractions;
pkBuildAttractions = function () {
  _pkBuildAttractions2();
  pkStringLights();
  pkPopcornCart(7.1, 17.6, -Math.PI / 2 + 0.3);
  pkBalloons(-6.8, 18.4);
  pkHangingBaskets();   // kept as the editor left them: most are hidden, a few stand
  pkPathMarkers();      // ditto - the little marker row by the gate is yours
};
