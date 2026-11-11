//@ Rendering: the static bake (vertex-coloured, detached), the sky that follows the eye, the quality levels and the
//@ distance cull. This part must sort BEFORE 99-boot, because the boot bakes the world: the overrides here have to be in
//@ place before CO.boot runs, or the first bake is the engine's and only a later rebake sees them.
  (function() {
    if (!CO) return;

    // ── What actually costs frames ───────────────────────────────────
    // Measured on the park as it stood: 81k meshes in the scene, 20k of them in view, 5.9k draw calls, 4.5M triangles a
    // frame, 66 point lights (10 compiled at a time) and a sky dome whose far side is outside the camera's far plane.
    // The three quality levels only changed the render scale, the shadow map and how many lamps compiled, so all three
    // ran at the same frame rate. These are the dials that matter, and the level now moves them: how far the sharp
    // scenery is drawn, how far the fog has swallowed the rest, how dense the woods were planted and how big the sun map
    // is. A level is a draw distance now, which is what a player expects a level to be.
    var PK_Q = {
      high:   { lights: 8, cull: 150, fog: 110, tree: 1.00, shadow: 1024 },
      medium: { lights: 5, cull: 100, fog: 84,  tree: 0.72, shadow: 1024 },
      low:    { lights: 3, cull: 72,  fog: 60,  tree: 0.45, shadow: 512 }
    };
    function pkQualityName() { return (typeof SET === 'object' && SET && PK_Q[SET.quality]) ? SET.quality : 'high'; }
    function pkQuality() { return PK_Q[pkQualityName()]; }

    // ── The static bake ──────────────────────────────────────────────
    // Two changes to the engine's bake, both about what a frame really pays for:
    //
    // 1. It used to hide the meshes it had merged, never remove them. 60k hidden meshes stayed in the scene graph, so
    //    every frame walked all 81k of them and updated their matrices for nothing. They are taken out of the graph now
    //    (and put back by unbake, so the editor still works), which is where most of the frame's CPU went.
    //
    // 2. It merged one batch per material, and the park builds thousands of materials that differ only in colour. Almost
    //    every prop is an untextured painted box, so those meshes are merged into one batch per chunk that carries the
    //    colour in a vertex attribute instead of in the material: one draw for every painted thing in a cell, not one per
    //    shade of paint. Textured, glowing and flat-shaded things keep their own batch, as before.
    var PK_BAKE_CHUNK = 96;
    var PK_BAKED_AWAY = [];          // { o: mesh, p: its parent }, so unbake can put the world back
    var _bkWp = new THREE.Vector3();

    // shared materials for the vertex-coloured batches: painted matte, painted gloss, metal
    var PK_VC_MATS = null;
    function pkVcMats() {
      if (PK_VC_MATS) return PK_VC_MATS;
      var mk = function (rough, metal) {
        var m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: rough, metalness: metal });
        m.userData.noBake = true; return m;
      };
      PK_VC_MATS = { matte: mk(0.9, 0.02), gloss: mk(0.5, 0.1), metal: mk(0.32, 0.75) };
      return PK_VC_MATS;
    }
    function pkVcBucket(m) {
      if (m.metalness > 0.45) return 'metal';
      if (m.roughness < 0.55) return 'gloss';
      return 'matte';
    }
    // the batch a mesh belongs to. Textured things merge by their map, with the material's own colour carried as a
    // vertex tint (a map times a colour is what the shader did anyway); painted things merge by finish; anything that
    // glows or is flat-shaded keeps its own look.
    function pkBakeKey(m, o) {
      var shadow = (o.castShadow ? 'c' : '') + (o.receiveShadow ? 'r' : '');
      if (m.map) return 'tex|' + m.map.uuid + '|' + (m.side || 0) + '|' + shadow;
      if (m.normalMap || m.alphaMap || m.roughnessMap || m.metalnessMap || m.emissiveMap) return 'texm|' + m.uuid + '|' + shadow;
      if (m.emissive && (m.emissive.r + m.emissive.g + m.emissive.b) > 0.02) {
        return 'emis|' + m.emissive.getHexString() + '|' + (m.emissiveIntensity || 1).toFixed(2) + '|' + shadow;
      }
      if (m.flatShading) {
        return 'flat|' + (m.color ? m.color.getHexString() : '') + '|' + (m.roughness || 0).toFixed(2) + '|' + shadow;
      }
      return 'vc|' + pkVcBucket(m) + '|' + shadow;
    }
    // a textured batch's material: a copy of the first one with vertex colours switched on, one per map
    var PK_TEX_MATS = {};
    function pkTintMat(m) {
      var k = m.uuid; if (PK_TEX_MATS[k]) return PK_TEX_MATS[k];
      var c = m.clone(); c.vertexColors = true; c.userData.noBake = true;
      return (PK_TEX_MATS[k] = c);
    }
    // merge a batch. opts.tint: carry each mesh's colour as a vertex attribute. opts.uv: keep the texture coordinates.
    function pkMakeMerged(mat, items, opts, xf, parent) {
      var pos = [], nor = [], uv = [], col = [], hasUv = true, _m = new THREE.Matrix4();
      items.forEach(function (o) {
        var g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        var xfm = xf ? _m.multiplyMatrices(xf, o.matrixWorld) : o.matrixWorld;
        g.applyMatrix4(xfm);
        var pa = g.attributes.position.array, na = g.attributes.normal ? g.attributes.normal.array : null;
        var ua = opts.uv ? (g.attributes.uv ? g.attributes.uv.array : null) : null;
        for (var i = 0; i < pa.length; i++) pos.push(pa[i]);
        if (na) for (var j = 0; j < na.length; j++) nor.push(na[j]);
        else for (var j2 = 0; j2 < pa.length; j2++) nor.push(0);
        if (ua) for (var u = 0; u < ua.length; u++) uv.push(ua[u]);
        else if (opts.uv) hasUv = false;
        if (opts.tint) {
          var c = o.material.color, r = c ? c.r : 1, gg = c ? c.g : 1, b = c ? c.b : 1;
          for (var k = 0; k < pa.length; k += 3) col.push(r, gg, b);
        }
        g.dispose();
      });
      var merged = new THREE.BufferGeometry();
      merged.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      merged.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      if (opts.tint) merged.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      if (opts.uv && hasUv && uv.length === pos.length / 3 * 2) merged.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      merged.computeBoundingSphere();
      var mesh = new THREE.Mesh(merged, mat);
      mesh.castShadow = items[0].castShadow; mesh.receiveShadow = items[0].receiveShadow;
      mesh.frustumCulled = true;
      parent.add(mesh);
      return mesh;
    }
    // take the merged meshes out of the graph. The parent is kept so unbake can put every one back where it stood.
    // A flat ground piece stays: the path fence (part 24) finds the paving by rendering the scene's ground-level meshes
    // white from above, and it looks them up in the scene graph, so the paving has to remain findable. There are a few
    // hundred of them, they are hidden, and the merged copy is what draws.
    var _pkBB = new THREE.Box3();
    function pkDetach(o) {
      if (!o.parent) return;
      var g = o.geometry;
      if (g && g.attributes && g.attributes.position) {
        if (!g.boundingBox) g.computeBoundingBox();
        if (g.boundingBox) {
          _pkBB.copy(g.boundingBox).applyMatrix4(o.matrixWorld);
          if (_pkBB.max.y < 0.35 && _pkBB.max.y > -0.1 && _pkBB.max.y - _pkBB.min.y < 0.35 && _pkBB.max.x - _pkBB.min.x < 300) {
            o.visible = false; o.userData.bakedAway = true; baked.hidden++;
            return;
          }
        }
      }
      PK_BAKED_AWAY.push({ o: o, p: o.parent });
      o.parent.remove(o);
      o.userData.bakedAway = true;
      baked.hidden++;
    }
    bakeStatic = function () {
      scene.updateMatrixWorld(true);
      var byKey = {}, list = [];
      scene.traverse(function (o) { if (bakeable(o)) list.push(o); });
      list.forEach(function (o) {
        var k = pkBakeKey(o.material, o);
        (byKey[k] = byKey[k] || { mat: o.material, vc: k.indexOf('vc|') === 0, tex: k.indexOf('tex|') === 0, items: [] }).items.push(o);
      });
      var vc = pkVcMats();
      Object.keys(byKey).forEach(function (k) {
        var grp = byKey[k];
        if (grp.items.length < 2) return;   // a lone mesh is no cheaper merged than drawn
        // split into the chunk grid so the cells behind the camera cull away
        var cells = {};
        grp.items.forEach(function (o) {
          o.getWorldPosition(_bkWp);
          var ck = Math.floor(_bkWp.x / PK_BAKE_CHUNK) + ',' + Math.floor(_bkWp.z / PK_BAKE_CHUNK);
          (cells[ck] = cells[ck] || []).push(o);
        });
        var mat = grp.vc ? (k.indexOf('metal') > 0 ? vc.metal : k.indexOf('gloss') > 0 ? vc.gloss : vc.matte)
          : grp.tex ? pkTintMat(grp.mat) : grp.mat;
        var opts = { tint: grp.vc || grp.tex, uv: grp.tex || !grp.vc };
        Object.keys(cells).forEach(function (ck) {
          var cell = cells[ck];
          if (cell.length < 2) return;   // leave the lone one where it is: it is still one draw either way
          var mesh = pkMakeMerged(mat, cell, opts, null, scene);
          mesh.userData.baked = true;
          baked.meshes.push(mesh); baked.draws++;
          cell.forEach(pkDetach);
        });
      });
      shadowDirty = true;
      CO.shadowDirty = true;
    };
    // put the world back exactly as it was: the merged meshes go, the originals return to their parents
    unbakeStatic = function () {
      baked.meshes.forEach(function (m) { scene.remove(m); m.geometry.dispose(); });
      baked.meshes = []; baked.draws = 0; baked.hidden = 0;
      PK_BAKED_AWAY.forEach(function (e) { e.p.add(e.o); e.o.visible = true; e.o.userData.bakedAway = false; });
      PK_BAKED_AWAY.length = 0;
      scene.traverse(function (o) { if (o.userData.bakedAway) { o.visible = true; o.userData.bakedAway = false; } });
    };
    // ── The distance cull for the merged scenery ─────────────────────
    // Every merged chunk carries its own bounding sphere, so a chunk the fog has already swallowed can be skipped. The
    // reach comes from the quality level: high draws everything the far plane allows, low stops at 80 m.
    var PK_CULL_T = 0;
    function pkCullBaked(dt, force) {
      PK_CULL_T -= dt || 0;
      if (!force && PK_CULL_T > 0) return;
      PK_CULL_T = 0.2;
      var q = pkQuality(), reach = q.cull + 30;   // the sphere is tested on its centre, so give it the chunk's half size
      var cx = camera.position.x, cz = camera.position.z, n = 0;
      for (var i = 0; i < baked.meshes.length; i++) {
        var m = baked.meshes[i], g = m.geometry;
        if (!g.boundingSphere) g.computeBoundingSphere();
        var c = g.boundingSphere.center, r = g.boundingSphere.radius;
        var d = Math.sqrt((c.x - cx) * (c.x - cx) + (c.z - cz) * (c.z - cz)) - r;
        var show = d < reach;
        if (m.visible !== show) { m.visible = show; n++; }
      }
    }
    hook('frame', function (dt) { pkCullBaked(dt, false); });

    // ── The distance cull for everything else that never moves ───────
    // The bake only swallows what it is allowed to merge; another 4k meshes in view are single props, glazing and lamp
    // parts, each its own draw. They are collected once the world stands, and the ones the fog has already swallowed are
    // skipped. Ride vehicles and anything else flagged dynamic are never in the list, so nothing that moves goes away.
    var PK_STATIC = [], PK_STATIC_T = 0;
    function pkCollectStatic() {
      PK_STATIC = [];
      scene.updateMatrixWorld(true);
      var _box = new THREE.Box3(), _sp = new THREE.Sphere();
      scene.traverse(function (o) {
        if (!o.isMesh || !o.visible || o.userData.baked || o.userData.it) return;
        if (!o.geometry || !o.geometry.attributes.position) return;
        var m = o.material;
        if (!m || Array.isArray(m) || (m.userData && (m.userData.noBake || m.userData.glow))) return;
        for (var p = o; p; p = p.parent) if (p.userData && p.userData.dynamic) return;
        o.userData.pkStatic = true;
        // a wide object (the ground plane, the outer lawn) reaches far past its own centre: remember how
        // far it stretches, so the cull below hides it only when the player is truly outside it, never
        // because its centre drifted past the fog edge.
        _box.setFromObject(o);
        _box.getBoundingSphere(_sp);
        o.userData.pkStaticR = _sp.radius;
        PK_STATIC.push(o);
      });
    }
    function pkCullStatic(dt, force) {
      PK_STATIC_T -= dt || 0;
      if (!force && PK_STATIC_T > 0) return;
      PK_STATIC_T = 0.3;
      if (CO.editor && CO.editor.on) return;   // the editor sees the whole world
      var q = pkQuality();
      var reach = Math.min(q.cull, (scene.fog ? scene.fog.far : 110) + 25);
      var cx = camera.position.x, cz = camera.position.z, _v = new THREE.Vector3();
      for (var i = 0; i < PK_STATIC.length; i++) {
        var o = PK_STATIC[i];
        o.getWorldPosition(_v);
        var dx = _v.x - cx, dz = _v.z - cz;
        var d = Math.sqrt(dx * dx + dz * dz) - (o.userData.pkStaticR || 0);
        var show = !(d > reach);
        if (o.visible !== show) o.visible = show;
      }
    }
    hook('frame', function (dt) { pkCullStatic(dt, false); });
    // ── The small moving parts ───────────────────────────────────────
    // A ride's vehicles, horses, boats and dodgem cars are each a group of their own, and each is a dozen draws. At
    // eighty metres a carousel horse is four pixels: the group is skipped once the fog has it. Only groups that stand on
    // their own are touched (a wheel inside a car is not a group of its own in this sense), and only small ones, so a
    // train or a big gondola is never dropped.
    var PK_SMALL_DYN = [], PK_SMALL_T = 0;
    function pkCollectSmallDynamic() {
      PK_SMALL_DYN = [];
      scene.updateMatrixWorld(true);
      scene.traverse(function (o) {
        if (!o.userData || !o.userData.dynamic || !o.parent) return;
        for (var p = o.parent; p; p = p.parent) if (p.userData && p.userData.dynamic) return;   // part of a bigger moving thing
        var box = new THREE.Box3().setFromObject(o), size = box.getSize(new THREE.Vector3());
        if (Math.max(size.x, size.y, size.z) > 6) return;   // a carriage, a train, a gondola: never dropped
        o.userData.pkSmallDyn = true;
        PK_SMALL_DYN.push(o);
      });
    }
    function pkCullSmallDynamic(dt, force) {
      PK_SMALL_T -= dt || 0;
      if (!force && PK_SMALL_T > 0) return;
      PK_SMALL_T = 0.3;
      if (!PK_SMALL_DYN.length) return;
      var reach = (scene.fog ? scene.fog.far : 110) + 18, cx = camera.position.x, cz = camera.position.z, _v = new THREE.Vector3();
      for (var i = 0; i < PK_SMALL_DYN.length; i++) {
        var o = PK_SMALL_DYN[i];
        o.getWorldPosition(_v);
        var dx = _v.x - cx, dz = _v.z - cz;
        var show = !(dx * dx + dz * dz > reach * reach);
        if (o.visible !== show) o.visible = show;
      }
    }
    hook('frame', function (dt) { pkCullSmallDynamic(dt, false); });
    hook('boot', function () { pkCollectStatic(); pkCullStatic(0, true); pkCollectSmallDynamic(); pkCullSmallDynamic(0, true);  });
    CO.pkRecollectStatic = pkCollectStatic;

    // ── The moving groups ────────────────────────────────────────────
    // The bake cannot touch anything under a `dynamic` group, and the rides are built from 1,200 of those: a car, a
    // carriage, a dodgem, each a group of a few dozen separate meshes that move together. A group moves as one, so the
    // meshes that hang directly off it can be merged: the geometry goes into the group's space and the group still
    // turns, slides and bobs exactly as before.
    //
    // Direct children only, and that is the whole rule. A part the game animates by itself - a lap bar, a door leaf, a
    // lever's arm - hangs off a pivot of its own, one level down, and is left exactly as it was. Merging the whole
    // subtree instead welded those parts shut (the levers, the keys and the station boom bars came out as blobs), which
    // is why this pass only ever touches the shell of a group.
    function pkMergeDynamic() {
      scene.updateMatrixWorld(true);
      var groups = [];
      scene.traverse(function (o) { if (o.userData && o.userData.dynamic) groups.push(o); });
      var inv = new THREE.Matrix4();
      groups.forEach(function (G) {
        if (!G.parent) return;
        var list = [];
        G.children.forEach(function (c) {
          if (!c.isMesh || c.isInstancedMesh || !c.visible || !c.geometry || !c.material || Array.isArray(c.material)) return;
          if (c.userData.dynamic || c.userData.it || c.userData.noBake || c.userData.pkPathFence) return;
          var m = c.material;
          if (m.userData && (m.userData.noBake || m.userData.glow)) return;
          if (m.transparent || m.emissiveMap || (m.emissive && (m.emissive.r + m.emissive.g + m.emissive.b) > 0.02)) return;
          list.push(c);
        });
        if (list.length < 2) return;
        inv.copy(G.matrixWorld).invert();
        var byKey = {};
        list.forEach(function (o) {
          var k = pkBakeKey(o.material, o);
          (byKey[k] = byKey[k] || { mat: o.material, vc: k.indexOf('vc|') === 0, tex: k.indexOf('tex|') === 0, items: [] }).items.push(o);
        });
        var vc = pkVcMats(), made = [];
        Object.keys(byKey).forEach(function (k) {
          var grp = byKey[k];
          if (grp.items.length < 2) return;
          var mat = grp.vc ? (k.indexOf('metal') > 0 ? vc.metal : k.indexOf('gloss') > 0 ? vc.gloss : vc.matte)
            : grp.tex ? pkTintMat(grp.mat) : grp.mat;
          var mesh = pkMakeMerged(mat, grp.items, { tint: grp.vc || grp.tex, uv: grp.tex || !grp.vc }, inv, G);
          mesh.userData.pkMerged = true;
          made.push(mesh);
        });
        if (made.length) list.forEach(function (o) { if (o.parent) o.parent.remove(o); });
      });
    }

    // ── The sky that follows the eye ─────────────────────────────────
    // The dome is built 230 m out and the camera's far plane is held at 210 m so the sun and the moon (200 m out) are not
    // clipped. The dome sits outside that plane, so it is never drawn: the "sky" is the flat background colour, and
    // whenever the dome lags the camera by a frame or two (a pause, a teleport, leaving a ride) its near side pokes
    // inside the far plane as a hard-edged circle. The dome is pulled in to 150 m here, the sun and moon with it, and
    // the far plane follows, so the dome is always drawn and never clipped.
    var PK_SKY_SCALE = 150 / 230;
    var _origBuildSky = buildSky;
    buildSky = function (opt) {
      var s = _origBuildSky(opt);
      if (sky.dome) { sky.dome.scale.setScalar(PK_SKY_SCALE); sky.dome.userData.pkSky = true; }
      return s;
    };
    // sun, moon and clouds are placed at 200 m and 70-100 m up by the engine's tick; bring them inside the dome
    var _origTickSky = tickSky;
    tickSky = function (dt) {
      _origTickSky(dt);
      var cam = camera.position;
      if (sky.dome) { sky.dome.position.set(cam.x, cam.y + sky.y, cam.z); }
      [sky.sunDisc, sky.moon].forEach(function (sp) {
        if (!sp) return;
        sp.position.set(cam.x + (sp.position.x - cam.x) * 0.65, cam.y + (sp.position.y - cam.y) * 0.65, cam.z + (sp.position.z - cam.z) * 0.65);
      });
      sky.clouds.forEach(function (c) {
        if (c.sp.position.y > 70) c.sp.position.y = 55 + (c.sp.position.y - 70) * 0.6;
      });
    };
    // ── The quality level: cull reach, render scale, shadow map ──────
    // applySettings sets the render scale and the shadow map. Two of the things it used to change are deliberately held
    // still here: the number of compiled point lights and whether shadows are on. Both are baked into the shader
    // program, so changing either recompiles every material in the park (thousands of programs, a freeze of many
    // seconds) and that is why the three levels never behaved like three levels. What is left - how far the scenery is
    // drawn, the render scale and the tree density - changes the frame rate without a single recompile.
    var _applySettings = applySettings;
    applySettings = function () {
      applySettings.q = SET.quality;   // the engine's own guard: do not recompile the park for a quality change
      _applySettings();
      if (renderer) renderer.shadowMap.enabled = true;
      if (sun) sun.castShadow = true;
      lightBudget.n = 8;
      var q = pkQuality();
      if (sun && sun.shadow.mapSize.x !== q.shadow) {
        sun.shadow.mapSize.set(q.shadow, q.shadow);
        if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
      }
      // the draw distance follows the level: the fog closes in with the cull, so what is not drawn is already fogged over
      if (typeof PK_FOG !== 'undefined' && typeof pkFogApply === 'function') {
        PK_FOG.far = q.fog; PK_FOG.near = Math.max(10, Math.round(q.fog * 0.38));
        pkFogApply();
      }
      pkCullBaked(0, true);
      pkCullStatic(0, true);
      shadowDirty = true;
    };

    // ── Humans ───────────────────────────────────────────────────────
    // The engine's figure is a stack of separate meshes per limb; merge each limb's parts by material so a guest is a
    // dozen draws instead of thirty. (The face and the chest stay separate: they are animated on their own.)
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
        var u = g.userData, face = u.face, chest = u.chest;
        mergeHumanGroup(u.head, [face]);
        mergeHumanGroup(u.torso, [chest]);
        if (u.legs) u.legs.forEach(function (hip) { mergeHumanGroup(hip, []); if (hip.userData.knee) mergeHumanGroup(hip.userData.knee, []); });
        if (u.arms) u.arms.forEach(function (sh) { mergeHumanGroup(sh, []); if (sh.userData.elbow) mergeHumanGroup(sh.userData.elbow, [sh.userData.elbow.userData.hand]); });
      }
      return g;
    };
    CO.pkQuality = pkQuality;
    CO.pkTreeDensity = function () { return pkQuality().tree; };
  })();
