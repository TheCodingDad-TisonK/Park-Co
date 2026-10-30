// Boots the game in a real window, lets it run so guests arrive, freezes it, and captures camera views to shots/*.png
//   electron tools/shots.js [--out <dir>]
// Each shot is a name and a camera position and look-at point. CO.paused stops the frame loop touching the camera,
// and the shell (start card, HUD, panels) is hidden so the capture is the game alone.
'use strict';
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
const at = argv.indexOf('--out');
const outDir = path.resolve(at >= 0 ? argv[at + 1] : path.join(root, 'shots'));
const page = path.join(root, 'index.html');

// pos = where the camera stands, look = the point it looks at, fov = field of view
const SHOTS = [
  { name: '01-approach',      pos: [0, 3.4, 78],    look: [0, 4.2, 30],    fov: 52 },
  { name: '02-entrance',      pos: [0, 2.0, 52],    look: [0, 4.0, 30],    fov: 55 },
  { name: '03-ticket-window', pos: [0, 1.7, 45],    look: [-9, 1.5, 36],   fov: 58 },
  { name: '04-midway',        pos: [0, 2.2, 27],    look: [0, 1.6, -2],    fov: 62 },
  { name: '05-station',       pos: [1, 2.4, 9],     look: [0, 1.2, -4],    fov: 62 },
  { name: '06-coaster',       pos: [-2, 9, 18],     look: [2, 10, -34],    fov: 62 },
  { name: '07-coaster-high',  pos: [0, 40, 44],     look: [0, 2, -28],     fov: 55 },
  { name: '08-operator-room', pos: [14, 1.75, 1.2], look: [13, 1.3, -3.6], fov: 62 },
  { name: '09-office',        pos: [-14, 1.7, 44],  look: [-20, 1.5, 43],  fov: 58 },
  { name: '10-carousel',      pos: [-4, 3.4, 25],   look: [-34, 2.4, 20],  fov: 62 },
  { name: '11-ferris',        pos: [10, 5.2, 30],   look: [34, 7, 20],     fov: 55 },
  { name: '12-dodgems',       pos: [10, 4.4, 12],   look: [34, 1.6, 3],    fov: 55 },
  { name: '13-overview',      pos: [105, 78, 125],  look: [0, -6, 0],      fov: 45 }
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

  await win.loadFile(page);
  await wait(1800);
  const started = await exec("(function(){ var H=window.PARK_CO; if(!H||!H.T) return 'no handle'; var T=H.T; if(T.ui) T.ui.testing=true; T.enter(); return 'entered'; })()");
  console.log('boot: ' + started);
  await wait(700);

  // let the park fill: a couple of minutes of game time so guests walk in, queue and ride
  await exec("window.PARK_CO.T.run(150)");
  await exec("['carousel','teacups','ferris','dodgems','droptower','flume','danse','droom'].forEach(function(id){ window.PARK_CO.T.pkOpenRide(id); }); true;");
  await wait(300);
  await exec("['dc-start','dc-panel','dc-menu','dc-hud'].forEach(function(id){ var e=document.getElementById(id); if(e) e.style.display='none'; }); document.body.style.background='#0b0f14'; true;");

  for (const s of SHOTS) {
    await exec('(function(){ var T=window.PARK_CO.T; T.CO.paused=true;' +
      'T.camera.fov=' + (s.fov || 60) + '; T.camera.updateProjectionMatrix();' +
      'T.camera.position.set(' + s.pos.join(',') + ');' +
      'T.camera.lookAt(' + s.look.join(',') + ');' +
      'T.camera.updateMatrixWorld(true); if (T.scene) T.scene.updateMatrixWorld(true); return true; })()');
    await wait(s.wait || 320);
    const img = await win.webContents.capturePage();
    const file = path.join(outDir, s.name + '.png');
    fs.writeFileSync(file, img.toPNG());
    const sz = img.getSize();
    console.log(s.name + '.png  ' + sz.width + 'x' + sz.height + '  ' + Math.round(fs.statSync(file).size / 1024) + ' KB');
  }
  if (errs.length) console.log('page errors (' + errs.length + '): ' + errs.slice(0, 6).join(' | '));
  console.log('wrote ' + SHOTS.length + ' shots to ' + outDir);
  app.exit(0);
}).catch((e) => { console.error(e); app.exit(1); });
