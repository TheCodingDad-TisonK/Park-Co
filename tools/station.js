// Captures the coaster station in three states so the gate arm and the restraint bars can be checked by eye.
//   electron tools/station.js
'use strict';
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'shots');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

app.commandLine.appendSwitch('enable-unsafe-swiftshader');
app.whenReady().then(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const win = new BrowserWindow({ show: true, width: 1400, height: 800, backgroundColor: '#0b0f14',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false } });
  win.setContentSize(1400, 800);
  const exec = (code) => win.webContents.executeJavaScript(code, true);
  await win.loadFile(path.join(root, 'index.html'));
  await wait(1800);
  await exec("(function(){ var H=window.PARK_CO; if(!H||!H.T) throw new Error('no handle'); var T=H.T; if(T.ui) T.ui.testing=true; T.enter(); return true; })()");
  await wait(600);
  // hide the shell, put a train at the station, and seat four guests
  await exec("['dc-start','dc-panel','dc-menu','dc-hud'].forEach(function(id){ var e=document.getElementById(id); if(e) e.style.display='none'; }); true;");
  const n = await exec("(function(){ var T=window.PARK_CO.T, R=T.PK.ride; T.CO.paused=true;" +
    "R.u=T.PK.stationU; R.v=0; R.state='loading'; R.bars=0; R.barsWant=0; T.pkPlaceTrain();" +
    "for (var i=0;i<4;i++){ var g=T.pkSpawnGuest(); g.state='board'; T.PK.queue.push(g); }" +
    "T.pkRideLoad(); R.state='loading'; return R.riders; })()");
  console.log('seated: ' + n);

  async function shot(name, code) {
    await exec('(function(){ var T=window.PARK_CO.T; T.camera.fov=52; T.camera.updateProjectionMatrix();' +
      'T.player.x=3.2; T.player.z=-1.2; T.player.y=0.6; T.lookAt(1.4, 1.0, -3.9); return true; })()');
    await exec(code);
    await wait(1000);
    const img = await win.webContents.capturePage();
    const file = path.join(outDir, name + '.png');
    fs.writeFileSync(file, img.toPNG());
    console.log(name + '.png  ' + Math.round(fs.statSync(file).size / 1024) + ' KB' +
      '   state=' + await exec("window.PARK_CO.T.PK.ride.state") +
      ' open=' + await exec("window.PARK_CO.T.PK.gates[0].open") +
      ' gateZ=' + (await exec("window.PARK_CO.T.PK.gates[0].bar.rotation.z")).toFixed(3) +
      ' barX=' + (await exec("window.PARK_CO.T.PK.cars[0].userData.bars[0].rotation.x")).toFixed(3));
  }

  // a warm-up frame: the first capture after a load can come back before the page has painted
  await wait(1200);
  await win.webContents.capturePage();

  // the gates swing up, the bars come down over the riders: three states, each eased over a few frames
  await shot('station-1-closed', "(function(){ var T=window.PARK_CO.T; T.pkCloseGates(); T.pkBarsUp(); for (var i=0;i<40;i++) T.pkRideTick(0.05); })(true)");
  await shot('station-2-gates-open', "(function(){ var T=window.PARK_CO.T; T.pkOpenGates(); for (var i=0;i<40;i++) T.pkRideTick(0.05); })(true)");
  await shot('station-3-bars-down', "(function(){ var T=window.PARK_CO.T; T.pkBarsDown(); for (var i=0;i<60;i++) T.pkRideTick(0.05); })(true)");
  console.log('gates open t=' + await exec("window.PARK_CO.T.PK.gates[0].t") + '  bars=' + await exec("window.PARK_CO.T.PK.ride.bars"));
  // the entrance, from the forecourt
  await exec('(function(){ var T=window.PARK_CO.T; T.player.x=0; T.player.z=54; T.player.y=0; T.lookAt(0, 4.6, 30); return true; })()');
  await wait(1100);
  const ent = await win.webContents.capturePage();
  fs.writeFileSync(path.join(outDir, 'entrance.png'), ent.toPNG());
  console.log('entrance.png  ' + Math.round(fs.statSync(path.join(outDir, 'entrance.png')).size / 1024) + ' KB');
  app.exit(0);
}).catch((e) => { console.error(e); app.exit(1); });
