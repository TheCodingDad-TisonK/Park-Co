//@ Park Co, part 67: better looking train cars (tison, 2026-11-15: "give all the rides also better looking train carts"). Replaces pkCoCar, the
//@ one car the Serpent, Baron's Drop, the Wild Hunt, the Puffin Line, the Mountain King and Teddy's Toy Tour all run (same signature and the same
//@ return, the same seat spots and the same lap bar on its pivot, so riders and restraints are untouched) and dresses pkCoasterCarBetter, the main
//@ coaster's car. A car now has a sculpted nose with lamps and a bumper, wheel arches over the wheels, a belt line and a roundel on each
//@ flank, bucket seats with bolsters and a seam, a padded rail, a tail fin with its lamps, a drawbar to the car behind and a lap bar with
//@ grips and a buckle. Joris' timber carts keep their own look (part 55).
  pkCoCar = function (col, opt) {
    opt = opt || {};
    var g = new THREE.Group(); g.userData.dynamic = true; g.userData.keep = true;
    var W = opt.w || 1.44, D = opt.d || 2.02, hw = W / 2, hd = D / 2;
    var body = std({ color: col, roughness: 0.3, metalness: 0.2 });
    var deep = std({ color: new THREE.Color(col).multiplyScalar(0.55).getHex(), roughness: 0.4, metalness: 0.2 });
    var trim = std({ color: 0xf4f2ea, roughness: 0.45, metalness: 0.1 });
    var rubber = std({ color: 0x15181b, roughness: 0.9 });
    var cush = std({ color: 0x23272d, roughness: 0.85 });
    var seam = std({ color: new THREE.Color(col).lerp(new THREE.Color(0xffffff), 0.25).getHex(), roughness: 0.6 });
    var lamp = std({ color: 0xfff4c8, emissive: 0xffe9a0, emissiveIntensity: 1.1, roughness: 0.3 });
    var tail = std({ color: 0xff3b30, emissive: 0xff2a20, emissiveIntensity: 0.9, roughness: 0.4 });
    // wheels with tyres and hubs, and an arch over each
    [[-0.56, 0.62], [0.56, 0.62], [-0.56, -0.62], [0.56, -0.62]].forEach(function (w) {
      var wh = pkRoundCyl(0.15, 0.11, MAT.steelDark, w[0], 0, w[1], g, 12); wh.rotation.z = Math.PI / 2;
      var tyre = pkRoundCyl(0.153, 0.05, rubber, w[0], 0, w[1], g, 12); tyre.rotation.z = Math.PI / 2;
      var hub = pkRoundCyl(0.055, 0.14, MAT.chrome, w[0], 0, w[1], g, 8); hub.rotation.z = Math.PI / 2;
      pkBevelBox(0.15, 0.05, 0.46, deep, w[0] + (w[0] < 0 ? -0.03 : 0.03), 0.31, w[1], g, 0.02);
    });
    // the frame, the floor and the drawbar to the car behind
    pkBevelBox(W * 0.78, 0.13, D * 0.9, MAT.steelDark, 0, 0.17, 0, g, 0.02);
    pkBevelBox(W - 0.08, 0.08, D - 0.1, deep, 0, 0.27, 0, g, 0.03);
    pkRoundCyl(0.035, 0.34, MAT.steelDark, 0, 0.2, -hd - 0.08, g, 8).rotation.x = Math.PI / 2;
    pkRoundCyl(0.06, 0.07, rubber, 0, 0.2, -hd - 0.02, g, 8).rotation.x = Math.PI / 2;
    // the flanks: the tub, a belt line in white along it, a roundel, and a padded rail on top
    [-1, 1].forEach(function (sx) {
      var fx = sx * (hw - 0.04);
      pkBevelBox(0.08, 0.5, D - 0.1, body, fx, 0.53, 0, g, 0.03);
      pkBevelBox(0.02, 0.05, D - 0.34, trim, sx * (hw + 0.005), 0.5, 0, g, 0.008);
      var rd = pkRoundCyl(0.12, 0.02, trim, sx * (hw + 0.012), 0.6, -0.15, g, 16); rd.rotation.z = Math.PI / 2;
      var rd2 = pkRoundCyl(0.075, 0.025, deep, sx * (hw + 0.018), 0.6, -0.15, g, 16); rd2.rotation.z = Math.PI / 2;
      pkRoundCyl(0.05, D - 0.16, rubber, fx, 0.8, 0, g, 8).rotation.x = Math.PI / 2;
      pkRoundCyl(0.016, D - 0.1, MAT.chrome, fx + sx * 0.05, 0.69, 0, g, 6).rotation.x = Math.PI / 2;
    });
    // the tail: the back panel, a fin in the car's colour with the lamps either side
    pkBevelBox(W - 0.12, 0.5, 0.08, body, 0, 0.53, -(hd - 0.04), g, 0.03);
    pkBevelBox(W * 0.5, 0.3, 0.08, deep, 0, 0.98, -(hd - 0.02), g, 0.03);
    [-1, 1].forEach(function (sx) { box(0.1, 0.07, 0.025, tail, sx * (hw * 0.62), 0.5, -(hd + 0.02), g); });
    // the nose: a bumper, a sloped hood, the headlamps and a chrome strip
    pkBevelBox(W * 0.8, 0.12, 0.16, rubber, 0, 0.3, hd + 0.08, g, 0.04);
    var hood = pkBevelBox(W * 0.82, 0.12, 0.34, body, 0, 0.56, hd - 0.02, g, 0.05); hood.rotation.x = 0.4;
    pkBevelBox(W * 0.84, 0.32, 0.18, body, 0, 0.44, hd + 0.0, g, 0.06);
    pkBevelBox(W * 0.7, 0.045, 0.06, trim, 0, 0.64, hd + 0.1, g, 0.015);
    [-1, 1].forEach(function (sx) {
      var l = pkRoundCyl(0.07, 0.04, MAT.chrome, sx * hw * 0.52, 0.45, hd + 0.115, g, 12); l.rotation.x = Math.PI / 2;
      var l2 = pkRoundCyl(0.052, 0.03, lamp, sx * hw * 0.52, 0.45, hd + 0.13, g, 12); l2.rotation.x = Math.PI / 2;
    });
    // two bucket seats side by side: a cushion with a seam, side bolsters, a high back and a headrest in the car's colour
    [-0.31, 0.31].forEach(function (sx) {
      pkBevelBox(0.5, 0.09, 0.6, cush, sx, 0.66, -0.06, g, 0.03);
      pkBevelBox(0.4, 0.015, 0.5, seam, sx, 0.712, -0.06, g, 0.006);
      pkBevelBox(0.5, 0.56, 0.11, cush, sx, 0.97, -0.4, g, 0.03);
      [-1, 1].forEach(function (b) {
        pkBevelBox(0.06, 0.4, 0.2, cush, sx + b * 0.235, 0.88, -0.34, g, 0.025);
        pkBevelBox(0.06, 0.1, 0.5, cush, sx + b * 0.235, 0.72, -0.06, g, 0.025);
      });
      pkBevelBox(0.34, 0.22, 0.1, body, sx, 1.3, -0.42, g, 0.03);
      pkBevelBox(0.26, 0.012, 0.1, seam, sx, 1.34, -0.365, g, 0.004);
    });
    // lap bar: a padded U on a pivot behind the seats, with grips and a buckle
    var bar = new THREE.Group(); bar.position.set(0, 0.76, -0.55); g.add(bar);
    pkRoundCyl(0.045, 0.94, MAT.steelDark, 0, 0.28, 0.62, bar, 8).rotation.z = Math.PI / 2;
    pkRoundCyl(0.075, 0.7, MAT.rubberMat, 0, 0.28, 0.62, bar, 8).rotation.z = Math.PI / 2;
    [-0.42, 0.42].forEach(function (sx) {
      pkRod(sx, 0, 0, sx, 0.28, 0.62, 0.04, MAT.steelDark, bar, 6);
      pkRoundCyl(0.04, 0.12, rubber, sx, 0.28, 0.62, bar, 8).rotation.x = Math.PI / 2;
    });
    pkBevelBox(0.1, 0.07, 0.1, MAT.chrome, 0, 0.3, 0.62, bar, 0.015);
    pkMergeShell(g, [bar]);   // the car's shell in one draw per material: the lap bar stays a part of its own
    return { g: g, bar: bar, seats: [{ x: -0.31, y: -0.06, z: -0.02 }, { x: 0.31, y: -0.06, z: -0.02 }] };
  };

  // the main coaster's car: the same dress on the car it already has (its tub, seats and bars stay as they were)
  (function () {
    var inner = pkCoasterCarBetter;
    pkCoasterCarBetter = function (idx, x, y, z, ry, col) {
      var g = inner.apply(this, arguments);
      var body = std({ color: col, roughness: 0.3, metalness: 0.2 });
      var deep = std({ color: new THREE.Color(col).multiplyScalar(0.55).getHex(), roughness: 0.4, metalness: 0.2 });
      var trim = std({ color: 0xf4f2ea, roughness: 0.45, metalness: 0.1 });
      var rubber = std({ color: 0x15181b, roughness: 0.9 });
      var lamp = std({ color: 0xfff4c8, emissive: 0xffe9a0, emissiveIntensity: 1.1, roughness: 0.3 });
      var tail = std({ color: 0xff3b30, emissive: 0xff2a20, emissiveIntensity: 0.9, roughness: 0.4 });
      var cush = std({ color: 0x23272d, roughness: 0.85 });
      var seam = std({ color: new THREE.Color(col).lerp(new THREE.Color(0xffffff), 0.25).getHex(), roughness: 0.6 });
      // arches over the wheels
      [[-0.5, 0.9], [0.5, 0.9], [-0.5, -0.9], [0.5, -0.9]].forEach(function (w) { pkBevelBox(0.16, 0.05, 0.46, deep, w[0] + (w[0] < 0 ? -0.04 : 0.04), 0.35, w[1], g, 0.02); });
      // belt line and roundel on each flank
      [-1, 1].forEach(function (sx) {
        pkBevelBox(0.02, 0.05, 2.0, trim, sx * 0.655, 0.52, 0, g, 0.008);
        var rd = pkRoundCyl(0.14, 0.02, trim, sx * 0.66, 0.66, 0, g, 16); rd.rotation.z = Math.PI / 2;
        var rd2 = pkRoundCyl(0.09, 0.025, deep, sx * 0.665, 0.66, 0, g, 16); rd2.rotation.z = Math.PI / 2;
        pkRoundCyl(0.045, 2.4, rubber, sx * 0.6, 0.9, 0, g, 8).rotation.x = Math.PI / 2;
      });
      // the nose: bumper, sloped hood and lamps; the tail: a fin and lamps
      pkBevelBox(1.0, 0.12, 0.16, rubber, 0, 0.3, 1.36, g, 0.04);
      var hood = pkBevelBox(1.1, 0.12, 0.36, body, 0, 0.88, 1.22, g, 0.05); hood.rotation.x = 0.35;
      [-1, 1].forEach(function (sx) {
        var l = pkRoundCyl(0.07, 0.04, MAT.chrome, sx * 0.4, 0.55, 1.28, g, 12); l.rotation.x = Math.PI / 2;
        var l2 = pkRoundCyl(0.052, 0.03, lamp, sx * 0.4, 0.55, 1.3, g, 12); l2.rotation.x = Math.PI / 2;
        box(0.1, 0.07, 0.025, tail, sx * 0.4, 0.55, -1.27, g);
      });
      pkBevelBox(0.7, 0.28, 0.08, deep, 0, 0.98, -1.2, g, 0.03);
      pkRoundCyl(0.035, 0.3, MAT.steelDark, 0, 0.2, -1.4, g, 8).rotation.x = Math.PI / 2;
      // seat bolsters and a seam on the cushions
      g.children.forEach(function (c) {
        if (!c.userData || !c.userData.bar) return;
        [-1, 1].forEach(function (b) { pkBevelBox(0.06, 0.32, 0.18, cush, b * 0.235, 0.82, -0.2, c, 0.025); });
        pkBevelBox(0.4, 0.015, 0.4, seam, 0, 0.665, 0, c, 0.006);
      });
      return g;
    };
  }());

  // Joris' timber carts: the same cart with iron-bound wheel arches, a brass lantern on the prow and a lantern at the tail, leather bolsters,
  // a drawbar and a gold roundel in the shield (the seats, the bar and the pennant are part 55's own)
  (function () {
    var inner = pkJorisCar;
    pkJorisCar = function (col, lead) {
      var r = inner.apply(this, arguments), g = r.g, M0 = pkMats();
      var iron = std({ color: 0x24282c, roughness: 0.5, metalness: 0.6 }), dark = std({ color: 0x3a2716, roughness: 0.85 }), leather = std({ color: 0x3a2418, roughness: 0.75 });
      var lamp = std({ color: 0xffe9a0, emissive: 0xffd070, emissiveIntensity: 1.3, roughness: 0.3 }), tail = std({ color: 0xff5a30, emissive: 0xff4a20, emissiveIntensity: 0.9, roughness: 0.4 });
      [[-0.56, 0.62], [0.56, 0.62], [-0.56, -0.62], [0.56, -0.62]].forEach(function (w) {
        pkBevelBox(0.15, 0.05, 0.46, iron, w[0] + (w[0] < 0 ? -0.03 : 0.03), 0.31, w[1], g, 0.02);
        var tyre = pkRoundCyl(0.153, 0.05, dark, w[0], 0, w[1], g, 12); tyre.rotation.z = Math.PI / 2;
      });
      // a lantern on an iron bracket at the prow, the lead car's under its pennant mast
      pkRod(0, 0.9, 1.1, 0, 1.0, 1.28, 0.02, iron, g, 5);
      pkBevelBox(0.12, 0.17, 0.12, M0.gold, 0, 1.08, 1.3, g, 0.02); sphere(0.055, lamp, 0, 1.08, 1.3, g);
      pkBevelBox(0.1, 0.12, 0.05, tail, 0, 0.62, -1.06, g, 0.02);
      // the drawbar to the cart behind and a leather strap with a buckle across each flank's shield
      pkRoundCyl(0.035, 0.34, iron, 0, 0.2, -1.1, g, 8).rotation.x = Math.PI / 2;
      [-1, 1].forEach(function (sx) {
        pkBevelBox(0.02, 0.07, 0.8, leather, sx * 0.735, 0.34, 0.1, g, 0.006);
        pkBevelBox(0.03, 0.08, 0.06, M0.gold, sx * 0.74, 0.34, 0.38, g, 0.008);
        [-1, 1].forEach(function (b) { pkBevelBox(0.06, 0.3, 0.16, leather, sx * 0.55 + b * 0, 0.9, -0.34, g, 0.02); });
      });
      return r;
    };
  }());
