// One camera, one shot: `npx electron tests/oneshot.js -- x z lx ly lz name` (a scratch view for framing work).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { app, BrowserWindow } = require('electron');

const a = process.argv.slice(2).filter((s) => s !== '--');
const [x, z, lx, ly, lz] = a.slice(0, 5).map(Number);
const name = a[5] || 'oneshot';

async function main() {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
  app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'park-co-oneshot-')));
  app.commandLine.appendSwitch('enable-unsafe-swiftshader');
  await app.whenReady();
  const win = new BrowserWindow({ show: false, width: 1280, height: 720, webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, offscreen: true } });
  await win.loadFile(path.join(__dirname, '..', 'index.html'), { query: { autoplay: '1' } });
  await new Promise((r) => setTimeout(r, 1500));
  const run = (js) => win.webContents.executeJavaScript(js, true);
  await run(`(() => { const T = window.PARK_CO.T; T.devCommand('setTime', 12); T.devCommand('weather', 'clear'); T.devCommand('xp', 6000); T.hideCards(); T.devCommand('auto'); for (let i = 0; i < 2; i++) T.devCommand('spawn', 20); return true; })()`);
  await new Promise((r) => setTimeout(r, 700));
  await run(`(() => { const T = window.PARK_CO.T; T.closePanel(); T.closeMenu(); T.hideCards(); T.player.x = ${x}; T.player.z = ${z}; T.player.y = 0; T.player.vy = 0; T.player.grounded = true; T.lookAt(${lx}, ${ly}, ${lz}); return true; })()`);
  await new Promise((r) => setTimeout(r, 500));
  const img = await win.webContents.capturePage();
  const out = path.join(__dirname, 'shots', name + '.png');
  fs.writeFileSync(out, img.toPNG());
  console.log('shot ' + out + ' from ' + x + ',' + z + ' look ' + [lx, ly, lz].join(','));
  app.exit(0);
}
main().catch((e) => { console.error(e); app.exit(1); });
