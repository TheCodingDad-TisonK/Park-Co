//@ Park Co, part 35: the F4 menu - a dev and sandbox panel: money and xp, teleport to any ride or building, spawn or send
  // home guests, the weather, the time of day, and a few tools (every ride key on, fly mode, tidy the park).
  // F4 opens and closes it. Like F3 it is taken on the capture pass, so it works with the panel already open.
  var PK_DEV_TABS = [['money', 'Money'], ['teleport', 'Teleport'], ['people', 'People'], ['world', 'Weather & time'], ['tools', 'Tools']];
  var PK_DEV_WEATHER = [['clear', 'Clear'], ['overcast', 'Overcast'], ['rain', 'Rain'], ['storm', 'Storm'], ['snow', 'Snow']];
  // where the teleport tab can take you: the fixed places, then every ride at its queue
  function pkDevPlaces() {
    var out = [
      ['gate', 'The gate', 0, 27], ['square', 'Station Square', 0, 6], ['hq', 'Park Co HQ (door)', -16.5, 42.5], ['carpark', 'The car park', 0, 60],
      ['oproom', 'The coaster operator room', (PK_OP.x0 + PK_OP.x1) / 2, (PK_OP.z0 + PK_OP.z1) / 2],
      ['arenabooth', 'Lindenburg Arena: control room', PK_TH.CX - 1.2, PK_TH.CZ + 18.6], ['arena', 'Lindenburg Arena: the sand', PK_TH.CX, PK_TH.CZ]
    ];
    PK.attractions.forEach(function (a) { if (a.id !== 'theater') out.push(['ride:' + a.id, a.name, a.qx, a.qz]); });
    return out;
  }
  function pkDevPanel(tab) {
    tab = tab || 'money';
    var body = '';
    if (tab === 'money') {
      body = '<p>Bank ' + money(S.bank) + '<br>Level ' + PK.level + ' (' + PK.xp + ' xp)</p>' +
        '<p><b>Money</b><br>' + [1000, 10000, 100000].map(function (n) { return btn('devCash', n, '+' + money(n), 'primary'); }).join('') + btn('devCash', -1000, '-' + money(1000), '') + '</p>' +
        '<p><b>Experience</b><br>' + [100, 1000].map(function (n) { return btn('devXp', n, '+' + n + ' xp', ''); }).join('') + '</p>';
    } else if (tab === 'teleport') {
      body = '<p>You are at ' + Math.round(player.x) + ', ' + Math.round(player.z) + '. Pick a place.</p><p>' +
        pkDevPlaces().map(function (p) { return btn('devTp', p[0], esc(p[1]), ''); }).join('') + '</p>';
    } else if (tab === 'people') {
      body = '<p>Guests in the park: ' + PK.guests.length + '</p>' +
        '<p><b>At the gate</b> (they walk in and buy a ticket)<br>' + [1, 5, 10, 20].map(function (n) { return btn('devSpawn', 'gate:' + n, '+' + n, ''); }).join('') + '</p>' +
        '<p><b>Inside the park</b> (ticket in hand, on Station Square)<br>' + [5, 10, 20].map(function (n) { return btn('devSpawn', 'in:' + n, '+' + n, 'primary'); }).join('') + '</p>' +
        '<p>' + btn('devHome', '', 'Send everyone home', '') + '</p>';
    } else if (tab === 'world') {
      var W = S.weather ? S.weather.kind : 'clear';
      body = '<p>' + fmtTime(S.time) + ', day ' + S.day + ' - ' + W + '</p>' +
        '<p><b>Weather</b><br>' + PK_DEV_WEATHER.map(function (w) { return btn('devWeather', w[0], w[1], w[0] === W ? 'primary' : ''); }).join('') + '</p>' +
        '<p><b>Time</b><br>' + [6, 9, 12, 15, 18, 21, 0].map(function (h) { return btn('devTime', h, (h < 10 ? '0' : '') + h + ':00', ''); }).join('') +
        btn('devTime', '+1', '+1 hour', '') + '</p>';
    } else {
      body = '<p>' + btn('devTool', 'keys', 'Every ride key ON', 'primary') + btn('devTool', 'fly', PK_FLY.on ? 'Fly mode: on' : 'Fly mode: off', '') + '</p>' +
        '<p>' + btn('devTool', 'tidy', 'Tidy the park (bins and litter)', '') + btn('devTool', 'arena', 'Arena: TEST SHOW', '') + '</p>' +
        '<p class="muted">F3 fly mode · Shift+F3 frame rate · F4 this menu</p>';
    }
    return { title: 'Dev menu (F4)', tabs: PK_DEV_TABS, tab: tab, body: body };
  }
  function pkDevTeleport(id) {
    if (PK.playerRide || PK_SIT || PK_CART.driving) { sfx('bad'); toast('Get off or stand up first', 'bad'); return false; }
    var p = pkDevPlaces().filter(function (q) { return q[0] === id; })[0]; if (!p) return false;
    player.x = p[2]; player.z = p[3]; player.y = floorY(p[2], p[3]); player.vy = 0;
    closePanel(); sfx('ok'); toast('Teleported: ' + p[1], 'good');
    return true;
  }
  function pkDevSpawn(arg) {
    var m = /^(gate|in):(\d+)$/.exec(String(arg)); if (!m) return false;
    var n = Math.min(+m[2], Math.max(0, PK_GUEST_MAX - PK.guests.length));
    for (var i = 0; i < n; i++) {
      var gu = pkSpawnGuest();
      if (m[1] === 'in') { gu.ticket = true; gu.state = 'off'; gu.rec.x = randf(-5, 5); gu.rec.z = randf(4, 16); gu.rec.path = []; gu.rides = 0; }
    }
    toast(n ? n + ' guests ' + (m[1] === 'in' ? 'in the park' : 'at the gate') : 'The park is full (' + PK_GUEST_MAX + ')', n ? 'good' : 'bad');
    return true;
  }
  function pkDevTool(name) {
    if (name === 'keys') { var n = 0; PK.attractions.forEach(function (a) { if (a.open && !pkCtl(a).key) { pkCtl(a).key = true; if (!S.ctlKey) S.ctlKey = {}; S.ctlKey[a.id] = true; n++; } }); if (!S.coasterKey && pkCoasterOpen()) { pkSetCoasterKey(true); n++; } toast(n + ' keys turned ON', 'good'); screenDirtyAll(); return true; }
    if (name === 'fly') { closePanel(); pkFlyToggle(); return true; }
    if (name === 'tidy') { (PK.bins || []).forEach(function (b) { b.fill = 0; pkBinRefreshLook(b); }); pkLitterClear(0, 0, 1e4); toast('Every bin emptied, the litter swept', 'good'); return true; }
    if (name === 'arena') { var a = PK.attrById.theater; if (a) { closePanel(); pkBoothTest(a); } return true; }
    return false;
  }
  // the menu's own actions; everything else goes to the park's panel as before
  var _pkDevPrevAct = pkPanelAct;
  pkPanelAct = function (act, arg) {
    var done = true;
    if (act === 'devCash') pay(+arg || 0, 'Dev menu');
    else if (act === 'devXp') pkXp(+arg || 0);
    else if (act === 'devTp') return pkDevTeleport(arg);
    else if (act === 'devSpawn') pkDevSpawn(arg);
    else if (act === 'devHome') { pkCloseGuests(); toast('Everyone not on a ride heads for the gate', ''); }
    else if (act === 'devWeather') { devCommand('weather', arg); logEvent('Weather set to ' + arg, ''); }
    else if (act === 'devTime') { devCommand('setTime', arg === '+1' ? (S.time + 1) % 24 : +arg); }
    else if (act === 'devTool') done = pkDevTool(arg);
    else return _pkDevPrevAct(act, arg);
    hudDirty = true; renderPanel();
    return done;
  };
  var _pkDevPrevPanel = pkPanel;
  pkPanel = function (kind, tab) { return kind === 'dev' ? pkDevPanel(tab) : _pkDevPrevPanel(kind, tab); };
  document.addEventListener('keydown', function (e) {
    if (e.code !== 'F4') return;
    e.preventDefault(); e.stopPropagation();
    if (!ui.started) return;
    if (ui.panelOpen) { if (panel.kind === 'dev') closePanel(); return; }
    if (ui.blocked()) return;
    openPanel('dev');
  }, true);
