// Temporary: capture the locomotive cab so the layout can be reviewed. Not part of the build.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { app, BrowserWindow } = require('electron');

async function main() {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
  app.setPath('userData', fs.mkdtempSync(path.join(os.tmpdir(), 'park-co-cabshot-')));
  app.commandLine.appendSwitch('enable-unsafe-swiftshader');
  await app.whenReady();
  const win = new BrowserWindow({ show: false, width: 1280, height: 720, webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, offscreen: true } });
  const pageErrors = [];
  win.webContents.on('console-message', (e, level, msg, line, src) => { if (level >= 2 && !/Electron Security Warning|GL Driver Message|GPU stall due to ReadPixels/.test(msg)) pageErrors.push(msg + ' @ ' + String(src).split('/').pop() + ':' + line); });
  win.webContents.on('render-process-gone', (e, d) => pageErrors.push('renderer gone: ' + d.reason));
  await win.loadFile(path.join(__dirname, '..', 'index.html'), { query: { autoplay: '1' } });
  await new Promise((r) => setTimeout(r, 2500));
  const run = (js) => win.webContents.executeJavaScript(js, true);

  console.log('welcome: ' + await run(`(() => {
    const T = window.PARK_CO.T;
    if (T.pkWelcomeOpen) { T.pkWelcomeOpen(); T.pkWelcomeClose(); }
    T.closePanel(); T.closeMenu(); T.hideCards();
    return 'closed, blocked=' + !!(T.ui && T.ui.blocked && T.ui.blocked());
  })()`));
  await new Promise((r) => setTimeout(r, 400));
  console.log('setup: ' + await run(`(() => {
    const T = window.PARK_CO.T;
    T.devCommand('setTime', 21.2);
    T.devCommand('weather', 'clear');
    const list = T.inter || [];
    let cab = null, found = [];
    for (const m of list) {
      const it = m.userData && m.userData.it;
      if (!it || !it.prompt) continue;
      let p = ''; try { p = it.prompt(); } catch (e) {}
      if (p) found.push(p);
      if (!cab && /climb into the cab/i.test(p)) cab = it;
    }
    if (cab) cab.use();
    T.player.locked = true;
    const t = T.TR && T.TR.t;
    return (cab ? 'entered' : 'NO CAB') + ' built=' + !!(T.TR && T.TR.built) + ' now=' + !!(t && t.driving) + ' prompts=' + found.length;
  })()`));
  await new Promise((r) => setTimeout(r, 900));

  const outDir = path.join(__dirname, 'cabshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const shoot = async (name) => {
    await new Promise((r) => setTimeout(r, 550));
    const img = await win.webContents.capturePage();
    fs.writeFileSync(path.join(outDir, name + '.png'), img.toPNG());
    console.log('shot ' + name + ' (' + Math.round(fs.statSync(path.join(outDir, name + '.png')).size / 1024) + ' kB)');
  };
  const look = (yaw, pitch) => run(`(() => { const T = window.PARK_CO.T; T.TR.t.look.yaw = ${yaw}; T.TR.t.look.pitch = ${pitch}; return true; })()`);
  const state = (tag) => run(`(() => {
    const T = window.PARK_CO.T, t = T.TR && T.TR.t, u = T.TR && T.TR.units && T.TR.units[0];
    return '${tag}: driving=' + !!(t && t.driving) + ' third=' + !!(t && t.thirdPerson) + ' pitch=' + (t ? t.look.pitch.toFixed(2) : '?') + ' yaw=' + (t ? t.look.yaw.toFixed(2) : '?') + ' player=' + [T.player.x.toFixed(1), T.player.y.toFixed(1), T.player.z.toFixed(1)].join(',') + ' loco=' + (u ? [u.g.position.x.toFixed(1), u.g.position.y.toFixed(1), u.g.position.z.toFixed(1)].join(',') : '?') + ' bulb=' + (u && u.cabBulb && u.cabBulb.material.color ? u.cabBulb.material.color.getHexString() : '?') + ' cabLight=' + (u && u.cabLight ? u.cabLight.intensity.toFixed(1) : '?') + ' fireOpen=' + !!(T.TR && T.TR.fireOpen);
  })()`);

  await shoot('cab-night');
  console.log(await state('night'));

  await look(0, -0.55);
  await shoot('cab-night-controls');

  await run(`(() => { const T = window.PARK_CO.T; T.TR.t.engine = true; T.TR.t.press = 0.55; T.TR.fireOpen = true; return true; })()`);
  await look(0.55, -0.5);
  await shoot('cab-night-fire');

  await run(`(() => { const T = window.PARK_CO.T; T.TR.fireOpen = false; return true; })()`);
  await look(0, 0);
  await run(`(() => { const T = window.PARK_CO.T; T.devCommand('setTime', 12); return true; })()`);
  await shoot('cab-day');
  console.log(await state('day'));

  await look(0, -0.45);
  await shoot('cab-day-controls');

  await look(0.55, -0.5);
  await shoot('cab-day-fire');

  await look(0.85, -0.25);
  await shoot('cab-day-left-down');

  await look(-0.6, -0.45);
  await shoot('cab-day-right-down');

  await look(0, 0);
  await run(`(() => { const T = window.PARK_CO.T; T.TR.t.thirdPerson = true; T.TR.t.camDist = 3.2; return true; })()`);
  await shoot('cab-day-third');

  if (pageErrors.length) console.log('PAGE ERRORS:\n  ' + pageErrors.join('\n  '));
  console.log('shots in ' + outDir);
  app.exit(0);
}
main().catch((e) => { console.error(e); app.exit(1); });
