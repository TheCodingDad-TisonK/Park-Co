// Temporary arena camera sweep for the scenery pass. Same boot as tools/shots.js.
'use strict';
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const outDir = path.join(root, 'shots', 'arena-pass');
const page = path.join(root, 'index.html');

const CX = -97, CZ = -68;
const SHOTS = [
  { name: 'a-over', pos: [CX, 62, CZ + 40], look: [CX, 0, CZ - 4], fov: 50 },
  { name: 'b-user', pos: [CX - 30, 24, CZ + 34], look: [CX + 4, 1, CZ - 3], fov: 50 },
  { name: 'c-user2', pos: [CX + 34, 26, CZ + 33], look: [CX - 2, 1, CZ - 4], fov: 50 },
  { name: 'd-sand', pos: [CX + 2, 2.4, CZ + 8], look: [CX, 3, CZ - 14], fov: 62 },
  { name: 'e-backstage', pos: [CX + 1, 3.0, CZ - 9], look: [CX - 6, 2.4, CZ - 16], fov: 62 },
  { name: 'f-booth-in', pos: [CX + 2.5, 4.75, CZ + 20.6], look: [CX - 1.2, 4.15, CZ + 17.2], fov: 70 },
  { name: 'g-booth-out', pos: [CX + 11, 7.6, CZ + 29], look: [CX - 1, 5.2, CZ + 17.5], fov: 55 },
  { name: 'h-gate', pos: [CX + 6, 3.4, CZ + 12], look: [CX + 1, 3.2, CZ - 12], fov: 60 }
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

app.commandLine.appendSwitch('enable-unsafe-swiftshader');
app.whenReady().then(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const win = new BrowserWindow({ show: true, width: 1600, height: 900, backgroundColor: '#0b0f14',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false } });
  win.setContentSize(1600, 900);
  const errs = [];
  win.webContents.on('console-message', (e, level, msg) => { if (level >= 2) errs.push(String(msg)); });
  win.webContents.on('render-process-gone', (e, d) => { errs.push('renderer gone: ' + d.reason); });
  const exec = (code) => win.webContents.executeJavaScript(code, true);

  await win.loadFile(page, { query: { autoplay: '1' } });
  await wait(1800);
  const started = await exec("(function(){ var H=window.PARK_CO; if(!H||!H.T) return 'no handle'; var T=H.T; if(T.ui) T.ui.testing=true; T.enter(); return 'entered'; })()");
  console.log('boot: ' + started);
  await wait(700);
  await exec("(() => { const T=window.PARK_CO.T; T.devCommand('setTime',12); T.devCommand('weather','clear'); T.hideCards(); T.closePanel(); T.closeMenu(); for (let i=0;i<3;i++) T.devCommand('spawn',20); return 'set'; })()");
  await wait(300);
  await exec("['dc-start','dc-panel','dc-menu','dc-hud','pk-welcome'].forEach(function(id){ var e=document.getElementById(id); if(e) e.style.display='none'; }); document.body.style.background='#0b0f14'; true;");

  for (const s of SHOTS) {
    await exec('(function(){ var T=window.PARK_CO.T; T.CO.paused=true;' +
      'T.camera.fov=' + (s.fov || 60) + '; T.camera.updateProjectionMatrix();' +
      'T.camera.position.set(' + s.pos.join(',') + ');' +
      'T.camera.lookAt(' + s.look.join(',') + ');' +
      'T.camera.updateMatrixWorld(true); if (T.scene) T.scene.updateMatrixWorld(true); return true; })()');
    await wait(320);
    const img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outDir, s.name + '.png'), img.toPNG());
    console.log(s.name + '.png');
  }
  if (errs.length) console.log('page errors (' + errs.length + '): ' + errs.slice(0, 6).join(' | '));
  app.exit(0);
}).catch((e) => { console.error(e); app.exit(1); });
