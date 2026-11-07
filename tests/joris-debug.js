// temporary diagnostic: verify fill-during-run and walk-out
'use strict';
module.exports = `
  T.enter();
  await wait(400);
  const a = T.PK.attrById.joris;
  a.open = true;
  T.pkSetRideKey(a, true);
  const C = T.pkCtl(a);
  C.auto = true; C.maint = false; C.fault = '';
  a.state = 'idle'; a.t = 0; a.stationGates = undefined; a.queue.length = 0;
  a.seats.forEach(s => { s.guest = null; s.player = null; });
  a.riders = 0; a.extra.held = [];
  for (let i = 0; i < 30; i++) {
    const g = T.pkSpawnGuest();
    g.rec.x = 82 + (i % 6) * 2; g.rec.z = 3 + Math.floor(i / 6) * 2; g.rec.path = [];
    T.pkAttrQueueJoin(g, a);
  }
  const report = (label) => {
    const states = {};
    T.PK.guests.forEach(g => { states[g.state] = (states[g.state] || 0) + 1; });
    ok(true, label + ': a.state=' + a.state + ' riders=' + a.riders + ' queue=' + a.queue.length +
      ' seated=' + a.seats.filter(s => s.guest).length + ' held=' + (a.extra.held ? a.extra.held.length : 0) +
      ' states=' + JSON.stringify(states));
  };
  report('start');
  for (let t = 0; t < 600; t++) { T.pkGuestTick(0.05); T.pkAttrTick(a, 0.05); }
  report('t+600 (30s)');
  for (let t = 0; t < 600; t++) { T.pkGuestTick(0.05); T.pkAttrTick(a, 0.05); }
  report('t+1200 (60s)');
  for (let t = 0; t < 600; t++) { T.pkGuestTick(0.05); T.pkAttrTick(a, 0.05); }
  report('t+1800 (90s)');
  for (let t = 0; t < 600; t++) { T.pkGuestTick(0.05); T.pkAttrTick(a, 0.05); }
  report('t+2400 (120s)');
  ok(true, 'debug done');
`;
