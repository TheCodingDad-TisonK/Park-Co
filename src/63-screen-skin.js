//@ Park Co, part 63: the screen skin for the 3D screens (tison, 2026-11-15: "rework the 3D booth screens too"). Part 62 dressed the page's own
//@ UI; this part gives the screens drawn on canvases in the world (the booth status boards, the ticket and stand windows, the HQ boards, the
//@ office PC and tablet that use the engine's drawing helpers) the same Dusk Park look: a night-blue gradient with a soft amber glow and a
//@ thin frame, a title with a status chip, stat cards, buttons that are rounded and lit. It repaints the engine's SCREEN_THEME and
//@ replaces its scBg, scHead and scButton (every screen calls them by name at draw time, so all of them change at once; the taps and
//@ the zones are exactly the engine's), and adds scStat, scCard, scChip and scMeter plus pkScreenBoard, the one status board every
//@ ride's booth and control cabin now draws. The queue boards (an amber dot-matrix sign), the cycle counters (red LEDs) and the time
//@ clocks (a green LCD) are real-world devices and keep their own looks; so do the per-ride panels' themed bodies (part 14).
  SCREEN_THEME.bg = '#0a1019'; SCREEN_THEME.accent = 'rgba(245,181,61,0.13)'; SCREEN_THEME.dot = 'rgba(255,255,255,0.035)';
  SCREEN_THEME.title = '#ffc65a'; SCREEN_THEME.sub = '#9fb0c3'; SCREEN_THEME.rule = 'rgba(245,181,61,0.55)'; SCREEN_THEME.text = '#eef2f7';
  SCREEN_THEME.btn = '#f5b53d'; SCREEN_THEME.btnText = '#1b1405'; SCREEN_THEME.btnOff = 'rgba(255,255,255,0.075)'; SCREEN_THEME.btnOffText = '#e6ecf3';
  var PK_SC = { good: '#6fe0a0', bad: '#ff7a6b', warn: '#ffc65a', mute: '#9fb0c3', ink: '#eef2f7', card: 'rgba(255,255,255,0.055)', edge: 'rgba(255,255,255,0.11)' };
  function pkScRound(c, x, y, w, h, r) { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); }
  function pkScSpaced(c, px) { if ('letterSpacing' in c) c.letterSpacing = px + 'px'; }
  // the ground of every screen: a deep gradient, a glow in the corner, a fine dot grid and a thin frame
  scBg = function (c, w, h, accent) {
    var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#111c2d'); g.addColorStop(1, '#080d15'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    var r = c.createRadialGradient(w * 0.08, 0, 6, w * 0.08, 0, w * 0.9); r.addColorStop(0, accent || SCREEN_THEME.accent); r.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = r; c.fillRect(0, 0, w, h);
    c.fillStyle = SCREEN_THEME.dot; for (var y = 10; y < h; y += 16) for (var x = 10; x < w; x += 16) c.fillRect(x, y, 1.4, 1.4);
    c.strokeStyle = 'rgba(255,255,255,0.075)'; c.lineWidth = 2; pkScRound(c, 3, 3, w - 6, h - 6, 12); c.stroke();
  };
  // a title, a status chip on the right (the time when none is given) and a rule that fades out
  scHead = function (c, w, title, sub) {
    c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.fillStyle = SCREEN_THEME.title; c.font = 'bold 21px ' + SCREEN_THEME.font; pkScSpaced(c, 1);
    var txt = sub === undefined ? (S && isFinite(S.time) ? fmtTime(S.time) : '') : String(sub);
    c.font = '600 13px ' + SCREEN_THEME.font; pkScSpaced(c, 0.4); var shown = scFit(c, txt, w * 0.46 - 26), cw = txt ? Math.ceil(c.measureText(shown).width) + 22 : 0;
    c.font = 'bold 21px ' + SCREEN_THEME.font; pkScSpaced(c, 1); c.fillText(scFit(c, title, w - 40 - cw - 12), 18, 33);
    if (txt) {
      var bad = /LATCHED|FAULT|STOP|LOCKED|OFF|MAINT|CLOSED/i.test(shown), on = /AUTO|OPEN|RUN|READY|BOARD/i.test(shown) && !bad;
      c.fillStyle = bad ? 'rgba(255,122,107,0.16)' : on ? 'rgba(111,224,160,0.14)' : 'rgba(255,255,255,0.075)'; pkScRound(c, w - 16 - cw, 12, cw, 26, 13); c.fill();
      c.fillStyle = bad ? PK_SC.bad : on ? PK_SC.good : SCREEN_THEME.sub; c.font = '600 13px ' + SCREEN_THEME.font; pkScSpaced(c, 0.4); c.textAlign = 'center'; c.fillText(shown, w - 16 - cw / 2, 30);
    }
    pkScSpaced(c, 0); c.textAlign = 'left';
    var rg = c.createLinearGradient(18, 0, w - 18, 0); rg.addColorStop(0, SCREEN_THEME.rule); rg.addColorStop(1, 'rgba(245,181,61,0)'); c.fillStyle = rg; c.fillRect(18, 46, w - 36, 2);
  };
  // a rounded, lit button; the zone it leaves is the engine's
  scButton = function (sc, x, y, w, h, label, on, act, col) {
    var c = sc.ctx, base = col || SCREEN_THEME.btn;
    if (on) { var g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#ffd98a'); g.addColorStop(0.55, base); g.addColorStop(1, '#c98a14'); c.fillStyle = col ? col : g; } else c.fillStyle = SCREEN_THEME.btnOff;
    pkScRound(c, x, y, w, h, Math.min(10, h / 2.4)); c.fill();
    c.strokeStyle = on ? 'rgba(255,236,190,0.55)' : 'rgba(255,255,255,0.16)'; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = on ? SCREEN_THEME.btnText : SCREEN_THEME.btnOffText; c.font = 'bold 15px ' + SCREEN_THEME.font;
    var tw = c.measureText(label).width; if (tw > w - 10) c.font = 'bold ' + Math.max(10, Math.floor(15 * (w - 10) / tw)) + 'px ' + SCREEN_THEME.font;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, x + w / 2, y + h / 2 + 0.5, w - 8); c.textBaseline = 'alphabetic'; c.textAlign = 'left';
    sc.zones.push({ x: x, y: y, w: w, h: h, label: label, act: act });
  };
  // a small label over a big value, in one column
  function scStat(c, x, y, label, value, col, size) {
    c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillStyle = PK_SC.mute; c.font = '600 11px ' + SCREEN_THEME.font; pkScSpaced(c, 1.2); c.fillText(label, x, y);
    pkScSpaced(c, 0); c.fillStyle = col || PK_SC.ink; c.font = 'bold ' + (size || 24) + 'px ' + SCREEN_THEME.font; c.fillText(value, x, y + (size || 24) + 1);
  }
  // a framed card with a label, a lit dot and a value
  function scCard(c, x, y, w, h, label, value, on, warn) {
    c.fillStyle = on ? 'rgba(111,224,160,0.08)' : warn ? 'rgba(255,122,107,0.09)' : PK_SC.card; pkScRound(c, x, y, w, h, 10); c.fill();
    c.strokeStyle = on ? 'rgba(111,224,160,0.5)' : warn ? 'rgba(255,122,107,0.5)' : PK_SC.edge; c.lineWidth = 1.5; c.stroke();
    var dot = on ? PK_SC.good : warn ? PK_SC.bad : 'rgba(159,176,195,0.45)';
    c.fillStyle = dot; c.beginPath(); c.arc(x + w - 14, y + 14, 4.2, 0, 6.283); c.fill();
    c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillStyle = PK_SC.mute; c.font = '600 11px ' + SCREEN_THEME.font; pkScSpaced(c, 1.2); c.fillText(label, x + 12, y + 20); pkScSpaced(c, 0);
    c.fillStyle = on ? PK_SC.good : warn ? PK_SC.bad : PK_SC.ink; c.font = 'bold 18px ' + SCREEN_THEME.font; c.fillText(scFit(c, value, w - 20), x + 12, y + h - 12);
  }
  function scChip(c, x, y, text, col) {
    c.font = '600 12px ' + SCREEN_THEME.font; var w = Math.ceil(c.measureText(text).width) + 18;
    c.fillStyle = 'rgba(255,255,255,0.07)'; pkScRound(c, x, y, w, 22, 11); c.fill(); c.fillStyle = col || PK_SC.mute; c.textAlign = 'left'; c.fillText(text, x + 9, y + 15); return w;
  }
  function scMeter(c, x, y, w, h, f, col) {
    c.fillStyle = 'rgba(255,255,255,0.09)'; pkScRound(c, x, y, w, h, h / 2); c.fill();
    if (f > 0) { c.fillStyle = col || PK_SC.good; pkScRound(c, x, y, Math.max(h, w * Math.min(1, f)), h, h / 2); c.fill(); }
  }
  // the status board of a ride's booth or control cabin: who is aboard, who waits, how long, the gates, the bars and the mode
  function pkScreenBoard(ctx, s, a, C, o) {
    o = o || {};
    var w = s.w, h = s.h, waiting = pkAttrWaiting(a), status = pkBoothStatus(a, C);
    var statusCol = C.fault || C.maint ? PK_SC.bad : (a.state === 'running' ? '#ff9d6b' : (a.state === 'idle' && !waiting ? PK_SC.mute : PK_SC.good));
    scBg(ctx, w, h); scHead(ctx, w, a.name.toUpperCase(), status);
    var pad = 18, gap = 10, cw = (w - 2 * pad - 2 * gap) / 3, y0 = 66;
    scStat(ctx, pad, y0, 'ON RIDE', a.riders + ' / ' + a.seats.length, a.riders ? PK_SC.good : PK_SC.ink, 24);
    scMeter(ctx, pad, y0 + 36, cw - 14, 5, a.seats.length ? a.riders / a.seats.length : 0, PK_SC.good);
    scStat(ctx, pad + cw + gap, y0, 'QUEUE', String(waiting), waiting ? PK_SC.warn : PK_SC.ink, 24);
    scStat(ctx, pad + 2 * (cw + gap), y0, 'WAIT', pkBkWait(a) + ' min', PK_SC.ink, 24);
    var cy = y0 + 58, ch = 58, cards = [['GATES', C.gates ? 'OPEN' : 'SHUT', !!C.gates, false], ['BARS', C.barsWant > 0.5 ? 'DOWN' : 'UP', C.barsWant > 0.5, false], ['MODE', C.maint ? 'MAINT' : (C.auto ? 'AUTO' : 'MANUAL'), C.auto && !C.maint, !!C.maint]];
    for (var i = 0; i < 3; i++) scCard(ctx, pad + i * (cw + gap), cy, cw, ch, cards[i][0], cards[i][1], cards[i][2], cards[i][3]);
    var by = cy + ch + 14;
    var alert = C.fault ? 'STOP LATCHED: TURN THE MUSHROOM TO RESET' : (C.maint ? 'KEY SWITCH IN MAINT: TURN IT TO RUN' : (o.room ? 'CONTROL ROOM  ' + (C.fault ? 'RESET' : 'READY') : ''));
    if (C.fault || C.maint) { ctx.fillStyle = 'rgba(255,122,107,0.13)'; pkScRound(ctx, pad, by, w - 2 * pad, 28, 8); ctx.fill(); ctx.fillStyle = PK_SC.bad; ctx.font = 'bold 13px ' + SCREEN_THEME.font; ctx.textAlign = 'left'; ctx.fillText(alert, pad + 12, by + 19, w - 2 * pad - 20); }
    else { ctx.fillStyle = statusCol; ctx.beginPath(); ctx.arc(pad + 5, by + 12, 4.5, 0, 6.283); ctx.fill(); ctx.fillStyle = PK_SC.ink; ctx.font = '600 13.5px ' + SCREEN_THEME.font; ctx.textAlign = 'left'; ctx.fillText(scFit(ctx, status, w - 2 * pad - 20), pad + 18, by + 17); }
    var fy = by + 40;
    scChip(ctx, pad, fy, 'CYCLES ' + (a.cycles || 0), PK_SC.ink); scChip(ctx, pad + 118, fy, 'TESTS ' + (a.tests || 0), PK_SC.ink);
    var P = a.plat, duo = typeof pkDuo === 'function' && pkDuo(a);   // part 64: SOLO or DUO, and who is on the platform
    scChip(ctx, pad + 226, fy, !duo ? 'SOLO' : (P && P.rel ? 'DUO · RELEASED' : P && P.crew ? 'DUO · ' + pkPlatWho(a) : 'DUO · NO ONE ON PLATFORM'), !duo ? PK_SC.mute : (P && P.rel ? PK_SC.good : P && P.crew ? PK_SC.warn : PK_SC.bad));
    if (h - fy > 44) scText(ctx, pad, h - 16, o.hint || 'Desk: gates, bars, dispatch, test, auto, stop.  Cabinet: key, lamp test, horn.', '#7f8fa1', 11.5);
  }
