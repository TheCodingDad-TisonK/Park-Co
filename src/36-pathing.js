//@ Park Co, part 36: the walk. The engine's route finder is a plain A* over the 0.6 m grid: an array it scans for the
//@ best cell each step, a Manhattan guess, and a string pull that refuses every diagonal, so a guest crossing the park
//@ walked a staircase and a long route could run out of steps and fall back to a straight line through the hedges.
//@ This replaces it with a heap, an octile guess and a pull that accepts any straight run that stays on open cells.
  (function () {
    if (typeof NAV === 'undefined' || !NAV) return;
    var SQ2 = Math.SQRT2;
    var pkPullLine = navLine;   // the engine's line test, kept before anything of ours touches the name
    var pkOldRoute = route;     // and the engine's own finder, the fallback for a route the heap does not close
    var AG = null, ACAME = null, ASET = null, AHK = null, AHV = null, Astamp = 0;
    function alloc() {
      var n = NAV.w * NAV.h;
      if (!AG || AG.length !== n) {
        AG = new Float32Array(n); ACAME = new Int32Array(n); ASET = new Uint32Array(n);
        AHK = new Int32Array(n * 9); AHV = new Float32Array(n * 9);   // a cell can be pushed more than once; the heap must hold them all
      }
    }
    // a binary heap of cell keys, ordered by f
    var hn = 0;
    function hPush(k, f) {
      var i = hn++;
      while (i > 0) { var p = (i - 1) >> 1; if (AHV[p] <= f) break; AHK[i] = AHK[p]; AHV[i] = AHV[p]; i = p; }
      AHK[i] = k; AHV[i] = f;
    }
    function hPop() {
      var top = AHK[0], lastK = AHK[--hn], lastV = AHV[hn], i = 0;
      while (true) {
        var l = i * 2 + 1, r = l + 1, c = -1;
        if (l < hn) c = l;
        if (r < hn && AHV[r] < AHV[l]) c = r;
        if (c < 0 || AHV[c] >= lastV) break;
        AHK[i] = AHK[c]; AHV[i] = AHV[c]; i = c;
      }
      AHK[i] = lastK; AHV[i] = lastV;
      return top;
    }
    // the straightest run the paving allows between two points. Walks the grid cell by cell (a DDA), so a line can
    // never slip between two samples through a thin rail or a kerb the way an even sampling can.
    function pkLineClear(a, b) {
      var x0 = (a.x - NAV.x0) / NAV.cell, z0 = (a.z - NAV.z0) / NAV.cell;
      var x1 = (b.x - NAV.x0) / NAV.cell, z1 = (b.z - NAV.z0) / NAV.cell;
      var i = Math.floor(x0), j = Math.floor(z0), i1 = Math.floor(x1), j1 = Math.floor(z1);
      if (!navOpen(i, j)) return false;
      var dx = x1 - x0, dz = z1 - z0, sx = dx > 0 ? 1 : -1, sz = dz > 0 ? 1 : -1;
      var tdx = dx !== 0 ? Math.abs(1 / dx) : Infinity, tdz = dz !== 0 ? Math.abs(1 / dz) : Infinity;
      var tx = dx !== 0 ? (dx > 0 ? (i + 1 - x0) : (x0 - i)) * tdx : Infinity;
      var tz = dz !== 0 ? (dz > 0 ? (j + 1 - z0) : (z0 - j)) * tdz : Infinity;
      var guard = 0;
      while ((i !== i1 || j !== j1) && guard++ < 6000) {
        if (tx < tz) { tx += tdx; i += sx; } else { tz += tdz; j += sz; }
        if (!navOpen(i, j)) return false;
      }
      return true;
    }
    function pkRoute(a, b) {
      if (NAV.dirty || !NAV.grid) navBuild();
      alloc();
      var sc = navNearestOpen(navCell(a)), gc = navNearestOpen(navCell(b));
      var W = NAV.w, key = function (i, j) { return j * W + i; };
      var sk = key(sc.i, sc.j), gk = key(gc.i, gc.j);
      if (sk === gk) return [b];
      var stamp = ++Astamp, heur = function (i, j) {
        var dx = Math.abs(i - gc.i), dz = Math.abs(j - gc.j);
        return (dx + dz) + (SQ2 - 2) * Math.min(dx, dz);
      };
      hn = 0;
      AG[sk] = 0; ACAME[sk] = -1; ASET[sk] = stamp;
      hPush(sk, heur(sc.i, sc.j));
      var found = -1, steps = 0, cap = NAV.steps || 60000;
      while (hn > 0 && steps++ < cap) {
        var cur = hPop();
        if (cur === gk) { found = gk; break; }
        var ci = cur % W, cj = (cur - ci) / W, cg = AG[cur];
        for (var dj = -1; dj <= 1; dj++) for (var di = -1; di <= 1; di++) {
          if (!di && !dj) continue;
          var ni = ci + di, nj = cj + dj;
          if (!navOpen(ni, nj)) continue;
          if (di && dj && (!navOpen(ci + di, cj) || !navOpen(ci, cj + dj))) continue;   // no corner cutting
          var nk = key(ni, nj), ng = cg + (di && dj ? SQ2 : 1);
          if (ASET[nk] === stamp && AG[nk] <= ng) continue;
          ASET[nk] = stamp; AG[nk] = ng; ACAME[nk] = cur;
          hPush(nk, ng + heur(ni, nj));
        }
      }
      if (found < 0) return null;   // the caller falls back to the engine's finder
      var cells = [], k2 = found;
      while (k2 !== sk && k2 >= 0) {
        cells.push({ x: NAV.x0 + ((k2 % W) + 0.5) * NAV.cell, z: NAV.z0 + (Math.floor(k2 / W) + 0.5) * NAV.cell });
        k2 = ACAME[k2];
      }
      cells.reverse();
      cells.push(b);
      // pull the path straight. The engine's own line test does the pulling: it samples the grid and refuses to squeeze
      // a diagonal between two blocked cells, which is what keeps a pulled run on the paving rather than across a
      // flower bed at a corner. A pure cell-by-cell test was tried and cut corners it should not have.
      var out = [], from = a, idx = 0;
      while (idx < cells.length) {
        var far = idx;
        for (var m = cells.length - 1; m > idx; m--) if (pkPullLine(from, cells[m])) { far = m; break; }
        out.push(cells[far]); from = cells[far]; idx = far + 1;
      }
      return out;
    }
    route = function (a, b) {
      var r = pkRoute(a, b);
      return r || pkOldRoute(a, b);   // a long route the heap did not close is the engine's to find, as before
    };
    CO.pkRoute = pkRoute;
  })();
