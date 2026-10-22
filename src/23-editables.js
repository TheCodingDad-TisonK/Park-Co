//@ Park Co, part 23: editable props - every small thing the park builds as a group (a lamp, a bench, a bin, a bed, a hedge, a sign) takes its collision with it when the editor moves, turns or deletes it
  // ── Why ──────────────────────────────────────────────────────────
  // The editor moves world items, and an item's solids go with it only when the item lists them (o.userData.solids). A kit
  // call (part 26 of the engine) does that for itself, but most of the park's props are built as plain groups with solid()
  // laid beside them: move one in the editor and its collision stayed where it was built, an invisible wall, and a deleted
  // bench left one too. After the build, and before the editor's saved edits are laid on the world, each small top-level group
  // claims the solids that stand wholly inside its own footprint, so they move, turn and vanish with it.
  var PK_PROP_MAX_AREA = 40;            // m²: a lamp, a bench, a stall, a bed, a ride's booth; never a whole ride's dressing
  function pkClaimPropSolids() {
    var taken = [], items = [], n = 0;
    scene.children.forEach(function (o) { (o.userData.solids || []).forEach(function (s) { taken.push(s); }); });
    scene.children.forEach(function (o) {
      if (!o.isGroup || !o.children.length || o.userData.solids || o.userData.worldItem || o.userData.dynamic || o.userData.person || o.userData.propId || o.userData.baked) return;
      o.updateMatrixWorld(true);
      var b = new THREE.Box3().setFromObject(o); if (b.isEmpty()) return;
      var area = (b.max.x - b.min.x) * (b.max.z - b.min.z); if (area > PK_PROP_MAX_AREA) return;
      items.push({ o: o, b: b, area: area });
    });
    // the smallest first, so a bin standing by a stall is the bin's and not the stall's
    items.sort(function (p, q) { return p.area - q.area; });
    items.forEach(function (it) {
      var b = it.b, m = 0.08, mine = [];
      solids.forEach(function (s) {
        if (taken.indexOf(s) >= 0) return;
        if (s.x0 >= b.min.x - m && s.x1 <= b.max.x + m && s.z0 >= b.min.z - m && s.z1 <= b.max.z + m) mine.push(s);
      });
      if (!mine.length) return;
      it.o.userData.solids = mine; mine.forEach(function (s) { taken.push(s); }); n += mine.length;
    });
    return n;
  }
  // A prop raised off the ground (h, or standing on an upper floor) lifts its meshes but the engine lays its solids from the
  // ground up: a bed on HQ's top floor left an invisible block in the doorway below. Its solids go up with it.
  hook('propBuilt', function (id, inst) {
    var dy = inst && inst.g ? inst.g.position.y : 0; if (!dy) return;
    solids.forEach(function (s) { if (s.prop === id && !s.pkLifted) { s.y0 += dy; s.y1 += dy; s.pkLifted = true; } });
  });
  var _pkEditablesBuild = GAME.buildWorld;
  GAME.buildWorld = function (loaded) {
    var r = _pkEditablesBuild.apply(this, arguments);
    PK.propSolids = pkClaimPropSolids();
    return r;
  };
