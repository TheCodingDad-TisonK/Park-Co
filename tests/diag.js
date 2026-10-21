// Park Co textual diagnostics: `npx electron tests/diag.js` (or `npm run diag`).
// Boots the page like tests/visual.js, then dumps a top-down ASCII occupancy map and a
// scene inventory so the layout can be judged without looking at screenshots.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { app, BrowserWindow } = require('electron');

async function main() {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
  app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'park-co-diag-')));
  app.commandLine.appendSwitch('enable-unsafe-swiftshader');
  await app.whenReady();
  const win = new BrowserWindow({ show: false, width: 1280, height: 720, webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, offscreen: true } });
  const pageErrors = [];
  win.webContents.on('console-message', (e, level, msg, line, src) => { if (level >= 2 && !/Electron Security Warning|GL Driver Message|GPU stall due to ReadPixels/.test(msg)) pageErrors.push(msg + ' @ ' + String(src).split('/').pop() + ':' + line); });
  await win.loadFile(path.join(__dirname, '..', 'index.html'), { query: { autoplay: '1' } });
  await new Promise((r) => setTimeout(r, 3000));

  const data = await win.webContents.executeJavaScript(`(() => {
    const T = window.PARK_CO && window.PARK_CO.T;
    const scene = (T && T.scene) || (window.CO && window.CO.three && window.CO.three.scene);
    if (!scene) return { error: 'no scene', hasT: !!T };
    const THREE = window.THREE;
    const out = { count: 0, mats: {}, big: [], plots: null, rides: null, error: null };
    try { out.plots = JSON.parse(JSON.stringify(window.PK_PLOTS || null)); } catch (e) { out.plotsErr = String(e); }
    try { out.rides = (window.PK_ATTRACTIONS || []).map((a) => ({ n: a.name, x: a.x, z: a.z })); } catch (e) { out.ridesErr = String(e); }

    const cell = 2.0;
    const X0 = -80, Z0 = -100, X1 = 80, Z1 = 80;
    const cols = Math.ceil((X1 - X0) / cell), rows = Math.ceil((Z1 - Z0) / cell);
    const grid = new Int8Array(cols * rows);
    const box = new THREE.Box3();
    scene.traverse((o) => {
      if (!o.isMesh || !o.visible) return;
      out.count++;
      const m = Array.isArray(o.material) ? o.material[0] : o.material;
      const nm = (m && m.name) || 'noname';
      out.mats[nm] = (out.mats[nm] || 0) + 1;
      box.setFromObject(o);
      if (!isFinite(box.min.x)) return;
      const dy = box.max.y - box.min.y, dx = box.max.x - box.min.x, dz = box.max.z - box.min.z;
      if (dx > 200 || dz > 200) return;
      let code = 2;
      if (dy < 0.35) code = 1;
      else if (dy > 6) code = 3;
      const nmL = nm.toLowerCase();
      if (nmL.includes('water')) code = 4;
      else if ((nmL.includes('grass') || nmL.includes('hedge') || nmL.includes('leaf') || nmL.includes('flower')) && dy < 4) code = 5;
      const gx0 = Math.max(0, Math.floor((box.min.x - X0) / cell));
      const gx1 = Math.min(cols - 1, Math.floor((box.max.x - X0) / cell));
      const gz0 = Math.max(0, Math.floor((box.min.z - Z0) / cell));
      const gz1 = Math.min(rows - 1, Math.floor((box.max.z - Z0) / cell));
      for (let gz = gz0; gz <= gz1; gz++) for (let gx = gx0; gx <= gx1; gx++) {
        const i = gz * cols + gx;
        if (grid[i] < code) grid[i] = code;
      }
      if (dx * dz > 40 && dy > 1.5) out.big.push({ n: nm, x: +((box.min.x + box.max.x) / 2).toFixed(1), z: +((box.min.z + box.max.z) / 2).toFixed(1), w: +dx.toFixed(1), d: +dz.toFixed(1), h: +dy.toFixed(1) });
    });
    const chars = ['.', ':', '#', 'R', '~', '*'];
    out.map = [];
    for (let gz = 0; gz < rows; gz++) {
      let s = '';
      for (let gx = 0; gx < cols; gx++) s += chars[grid[gz * cols + gx]];
      out.map.push(s);
    }
    out.meta = { X0, Z0, cell, cols, rows };
    return out;
  })()`);

  if (data.error) { console.error('DIAG ERROR', data); await app.quit(); return; }
  console.log('mesh count:', data.count);
  console.log('plots:', JSON.stringify(data.plots));
  console.log('rides:', JSON.stringify(data.rides));
  console.log('big structures:', JSON.stringify(data.big));
  const top = Object.entries(data.mats).sort((a, b) => b[1] - a[1]).slice(0, 40);
  console.log('materials by mesh count:', JSON.stringify(top));
  console.log('MAP (cell=' + data.meta.cell + 'm; header = x, left = z; . empty  : low<0.35  # structure  R tall ride  ~ water  * garden)');
  let ruler = '      ';
  for (let i = 0; i < data.meta.cols; i += 10) ruler += String(data.meta.X0 + i * data.meta.cell).padEnd(10, ' ');
  console.log(ruler);
  data.map.forEach((row, i) => {
    const z = data.meta.Z0 + i * data.meta.cell;
    console.log(String(z).padStart(5) + ' |' + row);
  });
  if (pageErrors.length) console.log('PAGE ERRORS:', JSON.stringify(pageErrors.slice(0, 20)));
  app.quit();
}

main().catch((e) => { console.error('FATAL', e); app.quit(); process.exit(1); });
