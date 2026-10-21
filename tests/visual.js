// Park Co's visual pass: `npx electron tests/visual.js` (or `npm run visual`).
// Boots the page the way the smoke runner does (hidden offscreen window), starts the game via ?autoplay=1,
// sets the world up (noon, clear, every ride open, staff hired, guests about), then walks the camera to a
// set of vantage points around the park and saves a PNG of each view into tests/shots/.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { app, BrowserWindow } = require('electron');

// pos is [x, z] on the ground (the engine puts the eye at feet + 1.62), look is [x, y, z] in the world
const SHOTS = [
  { name: '01-gate',          pos: [0, 45],     look: [0, 4.2, 30] },
  { name: '02-turnstiles',    pos: [-2, 34.5],  look: [-4, 1.1, 30] },
  { name: '02b-ticket-booth', pos: [-9, 40.2],  look: [-9, 1.7, 36] },
  { name: '03-midway',        pos: [0, 24],     look: [0, 2, -10] },
  { name: '04-carousel',      pos: [-22, 24],   look: [-34, 2, 20] },
  { name: '05-teacups',       pos: [-22, 5],    look: [-34, 1.5, 3] },
  { name: '06-haunted',       pos: [-36, -16],  look: [-58, 4.5, -24] },
  { name: '07-ferris',        pos: [22, 24],    look: [34, 5, 20] },
  { name: '08-dodgems',       pos: [22, 5],     look: [34, 2, 3] },
  { name: '09-coaster',       pos: [14, 16],    look: [0, 3, -14] },
  { name: '10-coaster-train', pos: [5, 2],      look: [0, 1.2, -4.6] },
  { name: '11-queue',         pos: [10.5, 8],   look: [7, 1.2, 2] },
  { name: '12-midway-shops',  pos: [3, 16],     look: [3, 1.5, 7] },
  { name: '13-droptower',     pos: [-44, -28],  look: [-54, 9, -34] },
  { name: '14-flume',         pos: [44, -26],   look: [54, 3, -32] },
  { name: '15-night-lights',  pos: [0, 24],     look: [0, 3, -10], night: true },
  { name: '16-operator-room', pos: [14.3, 1.1], look: [14.1, 1.1, -3.4] },
  { name: '17-control-desk',  pos: [14.6, -2.1],look: [14.1, 1.05, -3.35] },
  { name: '18-booth-outside', pos: [-19.7, 22.3], look: [-21.7, 1.4, 24.7] },
  { name: '18b-booth-desk',  pos: [-21.25, 25.95], look: [-22.75, 1.35, 25.2] },
  { name: '18c-booth-ferris', pos: [19.6, 22.2], look: [21.9, 1.5, 25.1] },
  { name: '18d-booth-flume',  pos: [43.4, -21.0], look: [46.4, 1.6, -18.4] },
  { name: '18e-booth-dodgems-desk', pos: [43.5, 8.9], look: [44.75, 1.35, 8.25] },
  { name: '19-office-switchboard', pos: [-20.3, 43.55], look: [-22.8, 1.5, 43.55] },
  { name: '20-lever-pulled',  pos: [14.85, -2.35], look: [14.5, 1.34, -3.4], act: 'T.pkConsole().parts.lever.pull()' },
  { name: '21-office-pc',     pos: [-20.0, 42.85], look: [-20.08, 1.22, 41.5] },
  { name: '22-car-park',      pos: [0, 62],      look: [-22, 1.1, 56] },
  { name: '23-car-park-drive', pos: [1, 71],     look: [-6, 1.2, 60] },
  { name: '24-queue-carousel', pos: [-12.2, 20], look: [-22.4, 1.25, 20] },
  { name: '25-queue-coaster', pos: [7, 10.2],    look: [7, 1.45, 1] },
  { name: '26-queue-gate',    pos: [-19.6, 22.9],look: [-22.7, 0.95, 20.1] },
  { name: '27-coaster-control', pos: [13.6, 7.4], look: [13.6, 2.15, 2.05] },
  { name: '28-serpent-wide', pos: [33, -61], look: [57, 9, -80] },
  { name: '29-serpent-station', pos: [46.8, -62.6], look: [53.5, 1.4, -69] },
  { name: '30-serpent-queue', pos: [36.4, -65.6], look: [45.5, 1.3, -65] },
  { name: '31-baron-wide', pos: [38, 26.5], look: [58, 11, 18] },
  { name: '32-baron-drop', pos: [41.5, 27.5], look: [56, 7, 20.5] },
  { name: '33-baron-station', pos: [44, 23.5], look: [52, 2, 17] },
  { name: '34-nocturne-front', pos: [-52, -66], look: [-55, 4, -80] },
  { name: '35-wreck-front', pos: [-19, -66], look: [-24, 4.5, -84] },
  { name: '36-moonwood-front', pos: [39, -65.5], look: [30, 4.5, -84] },
  { name: '37-north-wide', pos: [-6, -61], look: [-14, 5, -86] },
  { name: '38-nocturne-inside', pos: [-48, -81.5], look: [-54, 3, -90] },
  { name: '39-kids-area', pos: [-30, 30], look: [-56, 3, 31] },
  { name: '40-puffin-line', pos: [-49, 37], look: [-60, 2, 41] },
  { name: '41-indoor-cabin', pos: [-55.6, -91.9], look: [-55.6, 1.1, -84] },
  { name: '42-queue-entrance', pos: [6.6, 14.6], look: [7, 1.4, 9.4] },
  { name: '43-carousel-inside', pos: [-24, 21.2], look: [-34, 3.5, 19.6] },
  { name: '44-moonwood-inside', pos: [38.5, -81.2], look: [29, 3.5, -89.5] },
  { name: '45-baron-rockery', pos: [62, 28], look: [55, 3, 21] },
  { name: '46-baron-rockery-nw', pos: [67, 21], look: [56.7, 2.8, 21.7] },
  { name: '47-plaza-balloons', pos: [1.6, 25.3], look: [0, 1.2, 22.5] },
  { name: '48-pave-close', pos: [26, 8], look: [29, 0.15, 4] },
  { name: '49-snack-stand', pos: [-16, 2], look: [-10.25, 1.8, 13.6] }
];

async function main() {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
  app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'park-co-visual-')));
  app.commandLine.appendSwitch('enable-unsafe-swiftshader');   // a software GL driver, same as the smoke runner
  await app.whenReady();
  const win = new BrowserWindow({ show: false, width: 1280, height: 720, webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, offscreen: true } });
  const pageErrors = [];
  win.webContents.on('console-message', (e, level, msg, line, src) => { if (level >= 2 && !/Electron Security Warning|GL Driver Message|GPU stall due to ReadPixels/.test(msg)) pageErrors.push(msg + ' @ ' + String(src).split('/').pop() + ':' + line); });
  win.webContents.on('render-process-gone', (e, d) => pageErrors.push('renderer gone: ' + d.reason));
  await win.loadFile(path.join(__dirname, '..', 'index.html'), { query: { autoplay: '1' } });   // presses start on the first frame
  await new Promise((r) => setTimeout(r, 1500));
  const run = (js) => win.webContents.executeJavaScript(js, true);
  // set the park up: midday, clear, staffed, every ride open, guests about and the coaster running itself
  const setup = await run(`(() => {
    const T = window.PARK_CO.T;
    const say = [];
    say.push(T.devCommand('setTime', 12));
    say.push(T.devCommand('weather', 'clear'));
    say.push(T.devCommand('cash', 50000));
    say.push(T.devCommand('xp', 6000)); T.hideCards();
    say.push(T.pkHire('clerk')); say.push(T.pkHire('operator'));
    ['carousel', 'teacups', 'ferris', 'dodgems', 'droptower', 'flume', 'haunted'].forEach((id) => say.push(T.devCommand('open', id)));
    say.push(T.devCommand('auto'));
    for (let i = 0; i < 4; i++) T.devCommand('spawn', 20);
    return say.join(' | ');
  })()`);
  console.log('setup: ' + setup);
  await new Promise((r) => setTimeout(r, 800));   // let the guests take a step and the cards fade
  const outDir = path.join(__dirname, 'shots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  for (const s of SHOTS) {
    if (s.night) { await run(`(() => { const T = window.PARK_CO.T; T.devCommand('setTime', 21.2); return true; })()`); await new Promise((r) => setTimeout(r, 500)); }
    await run(`(() => {
      const T = window.PARK_CO.T;
      T.closePanel(); T.closeMenu(); T.hideCards();
      ${s.night ? '' : "T.devCommand('setTime', 12); T.devCommand('weather', 'clear');"}
      T.player.x = ${s.pos[0]}; T.player.z = ${s.pos[1]}; T.player.y = 0; T.player.vy = 0; T.player.grounded = true;
      T.lookAt(${s.look[0]}, ${s.look[1]}, ${s.look[2]});
      return true;
    })()`);
    await new Promise((r) => setTimeout(r, s.act ? 120 : 450));   // a few frames so the scene settles (gravity, lighting)
    if (s.act) {
      await run(`(() => { const T = window.PARK_CO.T; ${s.act}; return true; })()`);
      await new Promise((r) => setTimeout(r, 240));
    }
    const img = await win.webContents.capturePage();
    const file = path.join(outDir, s.name + '.png');
    fs.writeFileSync(file, img.toPNG());
    console.log('shot ' + s.name + ' (' + Math.round(fs.statSync(file).size / 1024) + ' kB)');
  }
  if (pageErrors.length) console.log('PAGE ERRORS:\n  ' + pageErrors.join('\n  '));
  console.log('shots in ' + outDir);
  app.exit(0);
}
main().catch((e) => { console.error(e); app.exit(1); });
