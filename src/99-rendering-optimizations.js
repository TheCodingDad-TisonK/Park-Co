//@ Rendering optimizations: per-chunk baking, human mesh merging, shadow throttling, pixel ratio tuning
  (function() {
    if (!CO) return;

    // The static bake now chunks into 96m grid cells that cull behind the camera, instead of one whole-site mesh
    var BAKE_CHUNK = 96;
    var _bakeWp = new THREE.Vector3();

    function bakeBatch(mat, items) {
      var pos = [], nor = [], uv = [], hasUv = true;
      items.forEach(function (o) {
        var g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        g.applyMatrix4(o.matrixWorld);
        var pa = g.attributes.position.array, na = g.attributes.normal ? g.attributes.normal.array : null, ua = g.attributes.uv ? g.attributes.uv.array : null;
        for (var i = 0; i < pa.length; i++) pos.push(pa[i]);
        if (na) for (var j = 0; j < na.length; j++) nor.push(na[j]); else for (var j2 = 0; j2 < pa.length; j2++) nor.push(0);
        if (ua) for (var u = 0; u < ua.length; u++) uv.push(ua[u]); else hasUv = false;
        g.dispose();
      });
      var merged = new THREE.BufferGeometry();
      merged.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      merged.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      if (hasUv && uv.length === pos.length / 3 * 2) merged.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      merged.computeBoundingSphere();
      var mesh = new THREE.Mesh(merged, mat); mesh.castShadow = items[0].castShadow; mesh.receiveShadow = items[0].receiveShadow; mesh.frustumCulled = true; mesh.userData.baked = true;
      scene.add(mesh); baked.meshes.push(mesh);
      items.forEach(function (o) { o.visible = false; o.userData.bakedAway = true; baked.hidden++; });
      baked.draws++;
    }

    // Most of the game's dressing calls std({...}) fresh at every placement instead of sharing one cached material, so two
    // visually identical boxes almost never share a material.uuid. Grouping by raw identity left the vast majority of
    // bakeable props as their own singleton "batch" of one, which is a batch in name only. This signature groups by what the
    // material actually looks like (colour, finish, map, transparency), so instances that are merely separately constructed
    // but visually the same still merge into one draw call.
    function bakeMatSig(m) {
      return [m.type, m.color ? m.color.getHexString() : '', (m.roughness || 0).toFixed(2), (m.metalness || 0).toFixed(2),
        m.map ? m.map.uuid : '', m.emissive ? m.emissive.getHexString() : '', (m.emissiveIntensity || 0).toFixed(2),
        m.transparent ? (m.opacity || 1).toFixed(2) : '1', m.side || 0].join('|');
    }
    // Reassign the plain identifier, not a CO.* property: boot.js and rebake() both call bakeStatic() directly by name
    // (they share this file's concatenated scope), so patching only CO.bakeStatic would never actually run.
    bakeStatic = function () {
      scene.updateMatrixWorld(true);
      var byMat = {}, list = [];
      scene.traverse(function (o) { if (bakeable(o)) list.push(o); });
      list.forEach(function (o) {
        var k = bakeMatSig(o.material) + (o.castShadow ? 'c' : '') + (o.receiveShadow ? 'r' : '');
        (byMat[k] = byMat[k] || { mat: o.material, items: [] }).items.push(o);
      });
      Object.keys(byMat).forEach(function (k) {
        var grp = byMat[k];
        if (grp.items.length < 2) return;
        var cells = {}, strays = [];
        grp.items.forEach(function (o) {
          o.getWorldPosition(_bakeWp);
          var ck = Math.floor(_bakeWp.x / BAKE_CHUNK) + ',' + Math.floor(_bakeWp.z / BAKE_CHUNK);
          (cells[ck] = cells[ck] || []).push(o);
        });
        Object.keys(cells).forEach(function (ck) {
          var cell = cells[ck];
          if (cell.length >= 2) bakeBatch(grp.mat, cell); else strays = strays.concat(cell);
        });
        if (strays.length >= 2) bakeBatch(grp.mat, strays);
      });
      CO.shadowDirty = true;
    };

    // Same deal here: npcs.js calls makeHuman(...) by plain name, so the override must reassign that identifier too.
    var originalMakeHuman = makeHuman;
    function mergeHumanGroup(grp, skip) {
      var byMat = {};
      grp.children.forEach(function (c) {
        if (!c.isMesh || !c.material || skip.indexOf(c) >= 0) return;
        (byMat[c.material.uuid] = byMat[c.material.uuid] || []).push(c);
      });
      Object.keys(byMat).forEach(function (k) {
        var parts = byMat[k];
        if (parts.length < 2) return;
        var pos = [], nor = [], uv = [], hasUv = true;
        parts.forEach(function (m) {
          m.updateMatrix();
          var geo = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
          geo.applyMatrix4(m.matrix);
          var pa = geo.attributes.position.array, na = geo.attributes.normal ? geo.attributes.normal.array : null, ua = geo.attributes.uv ? geo.attributes.uv.array : null;
          for (var i = 0; i < pa.length; i++) pos.push(pa[i]);
          if (na) for (var j = 0; j < na.length; j++) nor.push(na[j]); else for (var j2 = 0; j2 < pa.length; j2++) nor.push(0);
          if (ua) for (var u = 0; u < ua.length; u++) uv.push(ua[u]); else hasUv = false;
          geo.dispose();
        });
        var merged = new THREE.BufferGeometry();
        merged.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        merged.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
        if (hasUv && uv.length === pos.length / 3 * 2) merged.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        merged.computeBoundingSphere();
        var nm = new THREE.Mesh(merged, parts[0].material);
        nm.castShadow = parts[0].castShadow; nm.receiveShadow = parts[0].receiveShadow;
        parts.forEach(function (m) { grp.remove(m); });
        grp.add(nm);
      });
    }

    makeHuman = function(opt) {
      var g = originalMakeHuman(opt);
      if (g && g.userData) {
        var u = g.userData;
        var face = u.face;
        var chest = u.chest;
        mergeHumanGroup(u.head, [face]);
        mergeHumanGroup(u.torso, [chest]);
        if (u.legs) u.legs.forEach(function (hip) { mergeHumanGroup(hip, []); if (hip.userData.knee) mergeHumanGroup(hip.userData.knee, []); });
        if (u.arms) u.arms.forEach(function (sh) { mergeHumanGroup(sh, []); if (sh.userData.elbow) mergeHumanGroup(sh.userData.elbow, [sh.userData.elbow.userData.hand]); });
      }
      return g;
    };

    // The sky dome only re-centres on the camera's x/z each tick (26-weather.js), never y, so from anywhere off its
    // built height (a ride platform, a lift hill, an upper gallery) its inner surface shows as a distinct floating
    // shape instead of an enveloping sky. Patch tickSky (same plain-identifier rule as above) to also follow y.
    var originalTickSky = tickSky;
    tickSky = function (dt) {
      originalTickSky(dt);
      if (sky.dome) sky.dome.position.y = camera.position.y + sky.y;
    };

  })();
