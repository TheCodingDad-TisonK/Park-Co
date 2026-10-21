// A scratch probe: boot the park offscreen, let it settle, then print what a script asks for.
// `npx electron tests/probe.js`  (edit the SCRIPT string below)
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { app, BrowserWindow } = require('electron');

const SCRIPT = process.argv[2] || '';

async function main() {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
  app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'park-co-probe-')));
  app.commandLine.appendSwitch('enable-unsafe-swiftshader');
  await app.whenReady();
  const win = new BrowserWindow({ show: false, width: 1280, height: 720, webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, offscreen: true } });
  const errs = [];
  win.webContents.on('console-message', (e, level, msg, line, src) => { if (level >= 2 && !/Electron Security Warning|GL Driver|GPU stall/.test(msg)) errs.push(msg + ' @ ' + String(src).split('/').pop() + ':' + line); });
  await win.loadFile(path.join(__dirname, '..', 'index.html'), { query: { autoplay: '1' } });
  await new Promise((r) => setTimeout(r, 1800));
  const run = (js) => win.webContents.executeJavaScript(js, true);
  const out = await run(`(async () => {
    const T = window.PARK_CO.T;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    T.devCommand('setTime', 12); T.devCommand('weather', 'clear'); T.devCommand('xp', 6000); T.hideCards();
    T.devCommand('auto');
    const say = {};
    ${SCRIPT || 'say.ok = true;'}
    return say;
  })()`);
  console.log(JSON.stringify(out, null, 2));
  if (errs.length) console.log('ERRORS:\n  ' + errs.join('\n  '));
  app.exit(0);
}
main().catch((e) => { console.error(e); app.exit(1); });
