//@ Park Co, part 28: the bed in the office. Whoever placed the hmBed on HQ's top floor (00-layout.js) gets a night's
  // sleep instead of the pack's own "admire it" prompt: E skips to 07:00 the next day, the same wages and day-reset a
  // real midnight runs (02-guests.js pkNewDay).
  hook('propBuilt', function (id, inst, def) {
    if (!def || def.id !== 'hmBed') return;
    inst.g.traverse(function (o) {
      if (!o.userData || !o.userData.it) return;
      o.userData.it = { prompt: function () { return 'Sleep - wake at 07:00'; }, use: function () { pkSleep(); } };
    });
  });
  function pkSleep() {
    S.time = 7; S.day++; PK.lastDay = S.day; pkNewDay();
    hudDirty = true; toast('A good night - Day ' + S.day + ', 07:00', 'good'); sfx('ok');
  }
