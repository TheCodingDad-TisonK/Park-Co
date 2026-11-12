// Park Co's soak: `npm run soak`. Boots the page in a hidden Electron window (the engine's smoke runner sets T.ui.testing, so
// it cannot link into an open editor), opens the gate, turns every key and AUTO on, runs pkTick for SOAK_HOURS game hours
// (default 7, about 5 minutes) and fails on anything that only goes wrong over time: guests frozen in a state, a ride that
// never cycles, a toy sold twice, a line for a ride that cannot run, a tick that throws, a position gone NaN.
// Not part of `npm test`: it takes minutes. It drives pkTick only; systems that tick from the engine's frame hook
// (operators, the railway, the Arena, litter) run at real speed meanwhile and are not covered.
'use strict';
const path = require('path');
const { run } = require('co-engine/tools/smoke-runner');
const HOURS = Math.max(1, Math.min(24, Number(process.env.SOAK_HOURS) || 7));
const body = `
  T.enter(); await wait(800);
  S.gateOpen = true; S.coasterKey = true; T.pkSetAuto(true); S.time = 9;
  T.PK.attractions.forEach((a) => { const C = T.pkCtl(a); C.key = true; C.auto = true; C.fault = ''; C.maint = false; });
  const MOVE = { walkBooth:1, toTurn:1, walkTurn:1, walkQueue:1, walkAttr:1, qmove:1, walkSeat:1, board:1, walkRow:1, toSnack:1, toIce:1, toToy:1, toBin:1, toBench:1, leave:1, toCar:1, trainAlight:1, off:1, toBooth:1 };
  const seen = new Map(); const stuck = {}; let nan = 0, maxG = 0, simT = 0, worst = 0, tickMs = 0, ticks = 0, threw = [];
  const HOURS = ${HOURS}, DT = 0.1, N = HOURS * 300 / DT;
  for (let i = 0; i < N; i++) {
    const t0 = performance.now();
    try { T.pkTick(DT); } catch (e) { if (threw.length < 5) threw.push(String(e && e.stack || e).slice(0, 400)); }
    const d = performance.now() - t0; tickMs += d; ticks++; if (d > worst) worst = d;
    simT += DT;
    if (i % 10 === 0) {
      maxG = Math.max(maxG, T.PK.guests.length);
      T.PK.guests.forEach((g) => {
        if (!isFinite(g.rec.x) || !isFinite(g.rec.z)) nan++;
        const r = seen.get(g.id);
        if (!r || r.state !== g.state || Math.hypot(r.x - g.rec.x, r.z - g.rec.z) > 0.05) { seen.set(g.id, { state: g.state, x: g.rec.x, z: g.rec.z, t: simT, attr: g.attr }); return; }
        const held = simT - r.t;
        const lim = MOVE[g.state] ? 120 : (g.state === 'qwait' || g.state === 'queue' || g.state === 'boothQueue' || g.state === 'rowWait' || g.state === 'trainWait') ? 600 : 1e9;
        if (held > lim && !r.flag) { r.flag = true; const k = g.state + (g.attr ? ':' + g.attr : ''); (stuck[k] = stuck[k] || []).push(Math.round(g.rec.x) + ',' + Math.round(g.rec.z)); }
      });
    }
    if (i % 300 === 0) await wait(0);
  }
  const st = {}; T.PK.guests.forEach((g) => { st[g.state] = (st[g.state] || 0) + 1; });
  info('sim hours ' + HOURS + ', time now ' + S.time.toFixed(2) + ', day ' + S.day + ', bank ' + S.bank + ', xp ' + S.xp + ', level ' + T.PK.level);
  info('tick avg ms ' + (tickMs / ticks).toFixed(3) + ', worst ' + worst.toFixed(1) + ', max guests ' + maxG + ', guests now ' + T.PK.guests.length + ', NaN ' + nan);
  info('today ' + JSON.stringify(T.PK.today) + ' coaster cycles ' + S.cycles + ' ride ' + T.PK.ride.state + ' fault ' + T.PK.ride.fault + ' wear ' + S.wear);
  info('states ' + JSON.stringify(st));
  info('rides ' + T.PK.attractions.map((a) => a.id + ' c' + a.cycles + ' q' + a.queue.length + ' r' + a.riders + ' ' + a.state + (T.pkCtl(a).fault ? ' FAULT:' + T.pkCtl(a).fault : '')).join(' | '));
  info('stuck ' + JSON.stringify(stuck));
  info('threw ' + JSON.stringify(threw));
  ok(threw.length === 0, 'no tick threw');
  ok(nan === 0, 'no guest position went NaN (' + nan + ')');
  ok(Object.keys(stuck).length === 0, 'no guest is frozen in a state: ' + JSON.stringify(stuck));
  const idle = T.PK.attractions.filter((a) => !a.continuous && !(a.canQueue && !a.canQueue()) && !(a.cycles > 0)).map((a) => a.id);
  ok(idle.length === 0, 'every ride that can be queued for cycled at least once' + (idle.length ? ': ' + idle.join(', ') : ''));
  ok(T.PK.today.toys <= T.PK.today.tickets, 'no more toys sold than tickets (' + T.PK.today.toys + ' of ' + T.PK.today.tickets + ')');
  const dead = T.PK.attractions.filter((a) => a.canQueue && !a.canQueue() && a.queue.length > 0).map((a) => a.id);
  ok(dead.length === 0, 'no guest is queued for a ride that cannot run' + (dead.length ? ': ' + dead.join(', ') : ''));
`;
run({ page: path.join(__dirname, '..', 'index.html'), handle: 'PARK_CO', userDataPrefix: 'park-co-soak', timeout: 600000, scenarios: [{ name: 'soak', body }] });
