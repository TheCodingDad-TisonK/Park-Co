//@ Park Co, part 43: the Lindenburg Railway - the driving, the AUTO controller, the crossings, the sound, the cab and the depot's services.
  // ── Building everything ───────────────────────────────────────────
  function trBuildAll() {
    if (TR.built) return;
    var R = trState();
    trMats(); trBuildRoute(); trBuildTrack(); trBuildCrossings();
    TR_STATIONS.forEach(function (d, i) { trBuildStation(d, i); });
    TR_GAPS.forEach(function (g) { trPortal(g.axis === 'z' ? g.x : g.x, g.axis === 'z' ? g.z : g.z, g.axis); });
    trBuildDepot(); trBuildTrain();
    TR.t = { s: 0, mode: 'M', v: 0, dir: 1, throttle: 0, brake: 1, engine: false, press: 0, doorsOpen: false, doorAmt: 0, driving: false, seat: null, look: { yaw: 0, pitch: 0 },
      at: 0, departFrom: -1, nextSt: 1, dwell: 0, announced: false, belled: false, atb: '', washT: 0, chuff: 0, idleT: 0, hornOn: false, whistleOn: false, serviceT: 0, msgT: 0, hudT: 0, lapSeen: 0, riders: 0, passengerRoutePage: false, cabDisplayT: 0 };
    R.auto = !!R.auto && pkOpCount() > 0;
    trResetToStation(0);
    trBuildHud();
    TR.built = true;
  }
  function trResetToStation(i) {
    var t = TR.t, st = TR.st[i]; t.mode = 'M'; t.s = st.s + 28; t.v = 0; t.at = i; t.nextSt = (i + 1) % TR.st.length; t.dwell = 0; t.brake = 1; t.throttle = 0;
    trPlaceUnits();
  }
  var _trPrevBuildWorld = GAME.buildWorld;
  GAME.buildWorld = function (loaded) { var r = _trPrevBuildWorld ? _trPrevBuildWorld(loaded) : undefined; try { trBuildAll(); } catch (e) { if (window.console) console.error('railway build failed', e); } return r; };
  var _trPrevTick = GAME.tick;
  GAME.tick = function (dt) { if (_trPrevTick) _trPrevTick(dt); if (TR.built) { try { trTick(dt); } catch (e) { if (!TR.errShown) { TR.errShown = true; if (window.console) console.error('railway tick failed', e); } } } };
  var _trPrevT = GAME.T;
  GAME.T = function () { var t = _trPrevT ? _trPrevT() : {}; t.TR = TR; t.trTick = trTick; t.trState = trState; return t; };
  var _trPrevGuide = pkGuide;
  pkGuide = function () {
    return _trPrevGuide() + '<p><b>The Lindenburg Railway.</b> A steam train rings the park outside its fence: Central Station by the car park, Elfin Woods, Windmill Halt, Dragon Gate and Lakeside Halt, and the depot behind the park. At every station a locked cabinet holds the controls: AUTO (the same everywhere; it needs a hired operator), the platform gates, the lights, ANNOUNCE and the BELL. ' +
      'Climb into the cab from the platform. <b>W/S</b> gas, <b>Space</b> brake, <b>H</b> horn, <b>F</b> whistle, <b>I</b> engine, <b>U</b> wagon doors, <b>R</b> reverser, <b>E</b> out. The train waits two minutes at every station and will not leave with the doors open. ' +
      'Throw the points near the north run to send it through the depot shed, where you can fuel, service and wash it.</p>';
  };

  // ── Sound ─────────────────────────────────────────────────────────
  function trVol(x, z) {   // how loud a thing at (x, z) is for whoever is looking
    var d = Math.hypot(camera.position.x - x, camera.position.z - z); return Math.max(0, Math.min(1, 1.1 - d / 120)) * (d < 8 ? 1 : 8 / d + 0.1);
  }
  function trOk() { try { audio(); return !!AC; } catch (e) { return false; } }
  function trTone(type, f, dur, gain, x, z, opts) { if (!trOk()) return; var v = trVol(x, z) * gain; if (v < 0.002) return; sTone(type, f, AC.currentTime, dur, v, opts); }
  function trHeadPos() { var g = TR.units[0].g; return g.position; }
  // a held whistle or horn: oscillators through one gain that is raised and let fall by hand
  var TR_VOICE = {};
  function trVoice(kind, on) {
    if (!trOk()) return; var V = TR_VOICE[kind];
    if (!V) {
      var gn = AC.createGain(); gn.gain.value = 0; var lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = kind === 'horn' ? 900 : 3200; gn.connect(lp); lp.connect(sfxBus);
      var fs = kind === 'horn' ? [196, 247] : [523, 659, 784], ty = kind === 'horn' ? 'sawtooth' : 'triangle', os = fs.map(function (f) { var o = AC.createOscillator(); o.type = ty; o.frequency.value = f; o.connect(gn); o.start(); return o; });
      var lfo = AC.createOscillator(); lfo.frequency.value = 6; var lg = AC.createGain(); lg.gain.value = kind === 'horn' ? 1.5 : 4; lfo.connect(lg); os.forEach(function (o) { lg.connect(o.frequency); }); lfo.start();
      V = TR_VOICE[kind] = { gn: gn, on: false };
    }
    V.on = on;
  }
  function trVoiceTick(dt) {
    var p = trHeadPos(), vol = TR.t.driving ? 1 : trVol(p.x, p.z);
    ['horn', 'whistle'].forEach(function (k) { var V = TR_VOICE[k]; if (!V) return; var tgt = V.on ? (k === 'horn' ? 0.16 : 0.12) * vol : 0; V.gn.gain.value += (tgt - V.gn.gain.value) * Math.min(1, dt * (V.on ? 14 : 7)); });
  }
  function trBlast(kind, secs) {   // a short press from a click; the keys hold it
    var t = TR.t; trVoice(kind, true); t[kind === 'horn' ? 'hornOn' : 'whistleOn'] = true; t[kind + 'Auto'] = secs;
    if (kind === 'whistle') burst(trWorldOf(TR.units[0], TR.units[0].whistle).x, 3.3, trWorldOf(TR.units[0], TR.units[0].whistle).z, 0xffffff, 6, 'smoke');
  }
  function trWorldOf(u, v) { var g = u.g, c = Math.cos(g.rotation.y), s = Math.sin(g.rotation.y); return { x: g.position.x + v.x * c + v.z * s, z: g.position.z - v.x * s + v.z * c }; }
  function trBell(st) { st.bellT = 6.5; st.strikeT = 0; toast('The station bell rings', ''); }
  function trChime(st) {
    if (!trOk()) return; var t0 = AC.currentTime, x = st.x, z = st.z;
    [[784, 0], [659, 0.55], [523, 1.1]].forEach(function (n) { var v = trVol(x, z) * 0.18; if (v > 0.002) { sTone('sine', n[0], t0 + n[1], 1.2, v, { attack: 0.01 }); sTone('sine', n[0] * 2.01, t0 + n[1], 0.8, v * 0.3, {}); } });
  }
  function trAnnounce(st) {
    trChime(st); toast('Announcement: the train is leaving soon', ''); logEvent(st.name + ': the train is leaving soon', '');
    try { if (window.speechSynthesis && window.SpeechSynthesisUtterance) { var u = new SpeechSynthesisUtterance('Attention please. The train at ' + st.name.toLowerCase() + ' is leaving soon. Please stand clear of the doors.'); u.rate = 0.92; u.volume = Math.max(0.15, trVol(st.x, st.z)); setTimeout(function () { try { window.speechSynthesis.speak(u); } catch (e) {} }, 1700); } } catch (e) {}
  }
  function trTogglePassengerPage() {
    var t = TR.t; if (!t || !t.driving) return;
    t.passengerRoutePage = !t.passengerRoutePage;
    sfx('click'); toast('Passenger display: ' + (t.passengerRoutePage ? 'route list' : 'next stop'), '');
    trCabDisplaysTick(1);
  }
  function trRepeatPassengerInfo() {
    var t = TR.t; if (!t || !t.driving) return;
    var i = t.at >= 0 ? t.at : t.nextSt, st = TR.st[i]; if (!st) return;
    var message = t.at >= 0 ? 'We are now at ' + st.name.toLowerCase() + '. Please mind the gap when leaving the train.' : 'The next stop is ' + st.name.toLowerCase() + '. Please remain seated until the train has stopped.';
    sfx('click'); trChime(st); toast('Passenger announcement: ' + st.name, '');
    try {
      if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
        window.speechSynthesis.cancel();
        var speech = new SpeechSynthesisUtterance(message); speech.rate = 0.92; speech.volume = Math.max(0.15, trVol(camera.position.x, camera.position.z));
        window.speechSynthesis.speak(speech);
      }
    } catch (e) {}
  }

  // ── Switches, buttons, services ───────────────────────────────────
  function trSetAuto(on) {
    var R = trState();
    if (on && pkOpCount() < 1) { sfx('bad'); toast('AUTO needs a hired operator: hire one in the Park office', 'bad'); return; }
    R.auto = on; toast('Railway AUTO ' + (on ? 'on' : 'off'), on ? 'good' : ''); logEvent('Railway AUTO ' + (on ? 'on' : 'off'), '');
    if (on && !TR.t.engine) trToggleEngine();
    if (!on) { TR.t.throttle = 0; }
  }
  function trToggleEngine() {
    var t = TR.t, R = trState();
    if (!t.engine) { if (R.fuel <= 0 || R.water <= 0) { sfx('bad'); toast('No ' + (R.fuel <= 0 ? 'coal' : 'water') + ' to light the boiler', 'bad'); return; } if (R.wear >= 100) { toast('The engine needs a service first', 'bad'); return; } t.engine = true; toast('Engine on: the boiler is coming up to pressure', ''); }
    else { t.engine = false; toast('Engine off', ''); }
  }
  function trToggleDoors(want) {
    var t = TR.t, open = want === undefined ? !t.doorsOpen : want;
    if (open && t.v > 0.3) { sfx('bad'); toast('Doors are locked while the train moves', 'bad'); return; }
    t.doorsOpen = open; sfx('click');
  }
  function trToggleDir() { var t = TR.t; if (t.v > 0.2) { toast('Stop first to change direction', 'bad'); return; } t.dir = -t.dir; }
  function trPointsLocked() { return TR.t.mode === 'D'; }
  function trThrowPoints() { var R = trState(); if (trPointsLocked()) { toast('The points are locked: the train is on them', 'bad'); return; } R.points = R.points === 'depot' ? 'main' : 'depot'; toast('Points set to ' + (R.points === 'depot' ? 'the depot' : 'the main line'), ''); }
  function trInDepot() {
    var t = TR.t; if (t.mode !== 'D' || t.v > 0.25) return false;
    var a = TR.units[0].g.position, b = TR.units[TR.units.length - 1].g.position; return a.x <= 93.5 && b.x >= 26.5 && a.z < TR.N - 8 && b.z < TR.N - 8;
  }
  function trFillCost() { var R = trState(); return ' ($' + Math.round((100 - R.fuel) * 1.5 + (100 - R.water) * 0.2) + ')'; }
  function trServiceCost() { var R = trState(); return '$' + Math.round(40 + R.wear * 2.5); }
  function trPaid(n, why) { if (S.bank < n) { sfx('bad'); toast('Not enough money', 'bad'); return false; } if (n > 0) pay(-n, why); return true; }
  function trDoFill() { var R = trState(); if (!trInDepot()) return; var c = Math.round((100 - R.fuel) * 1.5 + (100 - R.water) * 0.2); if (c < 1) { toast('The tender is already full', ''); return; } if (!trPaid(c, 'Railway fuel')) return; R.fuel = 100; R.water = 100; sfx('ok'); toast('Coal and water filled', 'good'); logEvent('The train is fuelled', 'good'); }
  function trDoService() { var R = trState(); if (!trInDepot()) return; var c = Math.round(40 + R.wear * 2.5); if (!trPaid(c, 'Railway service')) return; R.wear = 0; sfx('ok'); toast('The train is serviced', 'good'); logEvent('The train is serviced', 'good'); }
  function trDoWash() { var R = trState(), t = TR.t; if (!trInDepot() || t.washT > 0) return; if (!trPaid(30, 'Railway wash')) return; t.washT = 10; toast('Washing the train', ''); }

  // ── Player: the cab and the seats ─────────────────────────────────
  function trSeatedIn() { return !!TR.t.seat; }
  function trCanBoard() { var t = TR.t; return !t.driving && !t.seat && t.v < 0.3; }
  function trCanSit(u) { var t = TR.t; if (t.driving || t.seat || t.v > 0.3 || !t.doorsOpen) return false; var st = trStationAtHead(); return !st || st.gatesAmt > 0.5; }
  function trStationAtHead() { return TR.t.at >= 0 ? TR.st[TR.t.at] : null; }
  
  function trEnterCab() { 
    var t = TR.t; if (!trCanBoard()) return; 
    t.driving = true; t.look.yaw = 0; t.look.pitch = -0.05; 
    toast('In the cab: W/S gas, Space brake, H horn, F whistle, I engine, U doors, R reverser, E to get out. C for 3rd person, scroll to zoom.', ''); sfx('click'); 
  }
  
  function trSit(u, seat) { 
    var t = TR.t; if (!trCanSit(u)) return; 
    t.seat = { u: u, seat: seat }; t.look.yaw = 0; t.look.pitch = -0.08; seat.taken = true; 
    toast('Seated. E to get up when the train has stopped. C for 3rd person.', ''); sfx('click'); 
  }
  
  function trLeave() {
    var t = TR.t, u = t.driving ? TR.units[0] : (t.seat ? t.seat.u : null); if (!u) return false;
    if (t.v > 0.3) { toast('Stay on board until the train has stopped', 'bad'); return true; }
    if (t.seat && !t.doorsOpen) { toast('The doors are shut: ask the driver', 'bad'); return true; }
    var g = u.g, c = Math.cos(g.rotation.y), s = Math.sin(g.rotation.y), lx = t.driving ? -2.9 : 0, lz = 2.7;
    var ex = g.position.x + lx * c + lz * s, ez = g.position.z - lx * s + lz * c;
    player.x = ex; player.z = ez; player.y = floorY(ex, ez); player.vy = 0; player.yaw = g.rotation.y - Math.PI / 2 - Math.PI / 2 + t.look.yaw; player.pitch = 0;
    if (t.seat) t.seat.seat.taken = false; t.seat = null; t.driving = false; trVoice('horn', false); trVoice('whistle', false); 
    sfx('click'); return true;
  }
  
  var _trPrevKey = GAME.key;
  GAME.key = function (e) {
    var t = TR.t;
    if (TR.built && t && (t.driving || t.seat) && !e.repeat) {
      if (e.code === 'KeyE') { if (t.driving && focusText) return false; return trLeave(); }
      if (t.driving) {
        if (e.code === 'KeyI') { trToggleEngine(); return true; }
        if (e.code === 'KeyU') { trToggleDoors(); return true; }
        if (e.code === 'KeyR') { trToggleDir(); return true; }
      }
    }
    return _trPrevKey ? _trPrevKey(e) : false;
  };
  
  var _trPrevWheel = GAME.wheel;
  GAME.wheel = function (dir, e) {
    var t = TR.t;
    if (TR.built && t && (t.driving || t.seat) && t.thirdPerson) {
      t.camDist = clamp(t.camDist + dir * 0.5, 2, 15);
      return true;
    }
    return _trPrevWheel ? _trPrevWheel(dir, e) : false;
  };
  
  var _trPrevMouse = GAME.mouseLook;
  GAME.mouseLook = function (e, sx, iy) {
    var t = TR.t;
    if (TR.built && t && (t.driving || t.seat)) { 
      t.look.yaw -= e.movementX * sx; 
      t.look.pitch = Math.max(-1.3, Math.min(1.3, t.look.pitch - e.movementY * sx * iy)); 
      t.look.yaw = Math.max(-2.6, Math.min(2.6, t.look.yaw)); 
      return true; 
    }
    return _trPrevMouse ? _trPrevMouse(e, sx, iy) : false;
  };
  
  var _trPrevOverride = GAME.playerOverride;
  GAME.playerOverride = function (dt) {
    var t = TR.t;
    if (TR.built && t && (t.driving || t.seat)) {
      var u = t.driving ? TR.units[0] : t.seat.u, g = u.g, c = Math.cos(g.rotation.y), s = Math.sin(g.rotation.y);
      var lx = t.driving ? -2.55 : t.seat.seat.x, ly = t.driving ? 3.02 : t.seat.seat.y + 0.75, lz = t.driving ? 0 : t.seat.seat.z, face = t.driving ? 0 : t.seat.seat.face;
      var wx = g.position.x + lx * c + lz * s, wz = g.position.z - lx * s + lz * c;
      player.x = wx; player.z = wz; player.y = ly - 1.62 + (t.driving ? 0 : 0); player.vy = 0;
      
      if (t.thirdPerson) {
        // Position the player body at the cab/seating spot, facing the right way
        if (!t.playerBody) {
          t.playerBody = makeHuman({ shirt: std({ color: 0x2a3f5f, roughness: 0.8 }), pants: std({ color: 0x1a1a1a, roughness: 0.9 }) });
          t.playerBody.visible = false;
          t.playerBody.userData.dynamic = true;
          scene.add(t.playerBody);
        }
        t.playerBody.visible = true;
        t.playerBody.position.set(wx, player.y, wz);
        t.playerBody.rotation.y = g.rotation.y - Math.PI / 2 + face + t.look.yaw;
        animateHuman(t.playerBody, dt, t.driving ? 'idle' : 'sit', 0, null, false);
        
        // Place the camera behind the player, looking at them
        var cx = wx + Math.sin(g.rotation.y - Math.PI / 2 + face + t.look.yaw) * t.camDist;
        var cz = wz + Math.cos(g.rotation.y - Math.PI / 2 + face + t.look.yaw) * t.camDist;
        var cy = ly + 0.5 + t.look.pitch * t.camDist;
        camera.position.set(cx, cy, cz);
        camera.lookAt(wx, ly, wz);
      } else {
        if (t.playerBody) t.playerBody.visible = false;
        camera.position.set(wx, ly, wz); 
        camera.rotation.order = 'YXZ'; 
        camera.rotation.set(t.look.pitch, g.rotation.y - Math.PI / 2 + face + t.look.yaw, 0);
      }
      player.yaw = camera.rotation.y; player.pitch = t.look.pitch;
      return true;
    }
    return _trPrevOverride ? _trPrevOverride(dt) : false;
  };

  // ── The train's tick ──────────────────────────────────────────────
  function trCurveLimit(s, mode) {
    var a = trPos(s, mode, _trA), y0 = a.yaw, b = trPos(s + 8, mode, _trB), d = Math.abs(b.yaw - y0); if (d > Math.PI) d = 2 * Math.PI - d; return d / 8 > 0.012 ? 6.5 : 9;
  }
  function trFwdDist(t, target) { var L = trLoopLen(t.mode), d = ((target - t.s) % L + L) % L; return d; }
  function trTargetS(i, mode) { var s = TR.st[i].s + 28; if (mode === 'D' && s > TR.sJ2) s += TR.dL; return s; }
  function trTick(dt) {
    var t = TR.t, R = trState(), i, k;
    dt = Math.min(dt, 0.1);
    // staff: the boiler comes up to pressure, or falls
    if (t.engine && R.fuel > 0 && R.water > 0 && R.wear < 100) t.press = Math.min(1, t.press + dt / 25); else t.press = Math.max(0, t.press - dt / (t.engine ? 12 : 90));
    if (t.engine && (R.fuel <= 0 || R.water <= 0)) { t.engine = false; toast('Out of ' + (R.fuel <= 0 ? 'coal' : 'water') + ': the fire goes out', 'bad'); }
    if (R.auto && pkOpCount() < 1) { R.auto = false; toast('AUTO off: there is no operator', 'bad'); }
    // the player's hands
    var keys = player.keys || {};
    if (t.driving) {
      if (keys.KeyW) t.throttle = Math.min(1, t.throttle + dt * 0.5); if (keys.KeyS) t.throttle = Math.max(0, t.throttle - dt * 0.6);
      t.brakeKey = !!keys.Space;
      if (keys.KeyH !== !!t.hornKey) { t.hornKey = !!keys.KeyH; trVoice('horn', t.hornKey || t.hornAutoT > 0); }
      if (keys.KeyF !== !!t.whistleKey) { t.whistleKey = !!keys.KeyF; trVoice('whistle', t.whistleKey || t.whistleAutoT > 0); }
    } else { t.brakeKey = false; if (t.hornKey) { t.hornKey = false; trVoice('horn', false); } if (t.whistleKey) { t.whistleKey = false; trVoice('whistle', false); } }
    ['horn', 'whistle'].forEach(function (kd) { var key = kd + 'Auto'; if (t[key] > 0) { t[key] -= dt; if (t[key] <= 0 && !(kd === 'horn' ? t.hornKey : t.whistleKey)) { trVoice(kd, false); t[kd === 'horn' ? 'hornOn' : 'whistleOn'] = false; } } });
    if (R.auto) trAuto(dt);
    // the speed limit and the safety system (ATB)
    var lim = trCurveLimit(t.s, t.mode), want = t.brakeKey ? 1 : t.brake, thr = t.throttle; t.atb = '';
    if (R.wear > 80) lim = Math.min(lim, 5);
    if (t.mode === 'D') lim = Math.min(lim, 4);
    if (t.at >= 0 && t.mode === 'M' && (t.dwell > 0 || t.doorsOpen)) { if (thr > 0.01 && t.v < 0.3) { t.atb = 'DEPARTURE LOCKED'; if (t.msgT <= 0) { t.msgT = 4; toast(t.doorsOpen ? 'Departure locked: the doors are open' : 'Departure locked: ' + Math.ceil(t.dwell) + ' s of waiting left', 'bad'); } } thr = 0; want = 1; }
    if (t.v > lim + 0.8) { want = 1; thr = 0; t.atb = 'ATB: OVERSPEED'; }
    t.msgT -= dt;
    // physics
    var thrust = (t.engine && t.press > 0.35) ? thr * 1.1 * Math.min(1, t.press) * (1 - R.wear / 220) : 0;
    var drag = 0.012 * t.v + (t.v > 0.02 ? 0.05 : 0);
    var a = thrust - drag - want * 3.0 * (t.v > 0.02 ? 1 : 0);
    if (!t.engine || t.press < 0.35) a -= 0.0;
    t.v = Math.max(0, Math.min(11, t.v + a * dt)); if (want >= 0.99 && thrust < 0.05 && t.v < 0.08) t.v = 0;
    var ds = t.v * dt * t.dir, prev = t.s; t.s += ds;
    // the loop, the points, the depot loop
    var L = trLoopLen(t.mode); if (t.s >= L) { t.s -= L; R.laps++; } else if (t.s < 0) t.s += L;
    if (t.mode === 'M' && ds > 0 && prev < TR.sJ1 && t.s >= TR.sJ1) { if (R.points === 'depot') t.mode = 'D'; }
    if (t.mode === 'D' && ds > 0 && t.s - TR.len > TR.sJ1 + TR.byp.L) { t.mode = 'M'; t.s -= TR.dL; R.points = 'main'; }
    if (t.mode === 'D' && ds < 0 && t.s < TR.sJ1) { t.mode = 'M'; }
    // fuel, water, wear, dirt
    var run = Math.abs(ds);
    if (t.engine) { R.fuel = Math.max(0, R.fuel - (0.006 + 0.035 * thrust * (t.v > 0.2 ? 1 : 0)) * dt); R.water = Math.max(0, R.water - (0.008 + 0.045 * thrust * (t.v > 0.2 ? 1 : 0)) * dt); }
    R.wear = Math.min(100, R.wear + run * 0.004); R.dirt = Math.min(100, R.dirt + run * 0.006);
    if (R.wear >= 100 && t.engine) { t.engine = false; toast('The engine has broken down: it needs a service in the depot', 'bad'); }
    // stations: stopped on a stop line
    var atNow = -1;
    if (t.mode === 'M') for (i = 0; i < TR.st.length; i++) { var dd = Math.abs(trFwdDist(t, TR.st[i].s + 28)); dd = Math.min(dd, trLoopLen('M') - dd); if (i === t.departFrom) { if (dd > 5) t.departFrom = -1; continue; } if (dd < 1.6 && t.v < 0.25) atNow = i; }
    if (atNow >= 0 && t.at !== atNow) { t.at = atNow; t.nextSt = (atNow + 1) % TR.st.length; t.dwell = 120; t.announced = false; t.belled = false; if (!R.auto) toast('Arrived at ' + TR.st[atNow].name + '. Wait time: 2 minutes', ''); }
    if (t.at >= 0 && atNow < 0 && t.v > 0.6) { t.at = -1; }
    if (t.at >= 0 && t.v < 0.25) t.dwell = Math.max(0, t.dwell - dt);
    if (TR.washing) { }
    trServicesTick(dt);
    trPlaceUnits();
    trAnimate(dt, run);
    trCrossingsTick(dt);
    trStationsTick(dt);
    trVoiceTick(dt);
    trHud(dt);
    trCabDisplaysTick(dt);
  }
  // ── AUTO ──────────────────────────────────────────────────────────
  function trAuto(dt) {
    var t = TR.t, R = trState(), st;
    if (!t.engine) { trToggleEngine(); }
    if (!t.engine) return;
    var needs = R.fuel < 18 || R.water < 18 || R.wear > 85 || R.dirt > 92;
    if (t.mode === 'D' && t.v < 0.25 && trInDepot()) {   // in the shed: the hired staff do the work, then she goes on
      t.throttle = 0; t.brake = 1; t.serviceT += dt;
      if (t.serviceT > 22) { t.serviceT = 0; var c = Math.round((100 - R.fuel) * 1.5 + (100 - R.water) * 0.2 + (R.wear > 0 ? 40 + R.wear * 2.5 : 0) + 30); if (S.bank >= c) { pay(-c, 'Railway depot'); R.fuel = 100; R.water = 100; R.wear = 0; t.washT = 10; R.dirt = 0; toast('The depot crew serviced the train ($' + c + ')', 'good'); } else { toast('The depot crew cannot work: not enough money', 'bad'); return; } }
      else if (t.serviceT > 20) { }
      if (R.fuel < 99 || R.wear > 0) return; if (t.washT > 0) return;
    }
    if (t.at >= 0) {   // standing at a platform
      st = TR.st[t.at]; t.throttle = 0; t.brake = 1;
      if (t.dwell > 0) {
        st.gatesWant = true; if (!t.doorsOpen) trToggleDoors(true); st.cabOpen = true;
        if (t.dwell <= 30 && !t.announced) { t.announced = true; trAnnounce(st); }
        if (t.dwell <= 10 && !t.belled) { t.belled = true; trBell(st); }
      } else {
        if (t.doorsOpen) trToggleDoors(false); st.gatesWant = false; trState().st[st.id].gates = false;
        if (t.doorAmt < 0.03 && st.gatesAmt < 0.03) { st.cabOpen = false; t.brake = 0; t.departFrom = t.at; t.at = -1; t.dwell = 0; }
      }
      return;
    }
    // running: head for the next stop line; go through the depot when she needs it
    if (needs && t.mode === 'M' && R.points === 'main') { var dj = trFwdDist(t, TR.sJ1); if (dj < 200 && dj > 40) R.points = 'depot'; }
    var tgt, dist;
    if (t.mode === 'D') { tgt = TR.sJ1 + trBypassStopS(); dist = trFwdDist(t, tgt); if (!(R.fuel < 99 || R.wear > 0 || R.dirt > 5) || t.serviceT === 0 && dist > 400) { tgt = trTargetS(t.nextSt, 'D'); dist = trFwdDist(t, tgt); } }
    else { tgt = trTargetS(t.nextSt, 'M'); dist = trFwdDist(t, tgt); }
    if (dist > trLoopLen(t.mode) - 3) dist = 0;
    var lim = Math.min(trCurveLimit(t.s, t.mode), 8.2), vT = Math.min(lim, Math.sqrt(2 * 0.9 * Math.max(0, dist - 0.8))); if (dist < 0.5) vT = 0;
    t.brake = 0;
    if (t.v < vT - 0.25) { t.throttle = Math.min(0.8, 0.25 + (vT - t.v) * 0.3); }
    else if (t.v > vT + 0.35) { t.throttle = 0; t.brake = Math.min(1, (t.v - vT) / 2 + 0.1); }
    else t.throttle = 0.18;
    if (vT === 0 && t.v < 0.6) { t.throttle = 0; t.brake = 1; }
    if (R.fuel <= 0 || R.water <= 0) { t.throttle = 0; t.brake = 1; }
  }
  function trBypassStopS() {   // where on the siding the loco's front stops: just inside the east end of the shed
    if (TR.bypStop !== undefined) return TR.bypStop; var P = TR.byp, best = 1e9, bi = 0; for (var i = 0; i < P.n; i++) { var d = Math.abs(P.x[i] - 88.5); if (d < best) { best = d; bi = i; } } return TR.bypStop = bi * P.ds;
  }
  // ── What the depot does while the train is in the shed ────────────
  function trServicesTick(dt) {
    var t = TR.t, R = trState(), D = TR.depot; if (!D) return;
    if (t.washT > 0) {
      t.washT -= dt; D.brushes.forEach(function (b) { b.rotation.y += dt * 9; });
      for (var i = 0; i < D.spray.length; i++) { var sp = D.spray[i]; sp.visible = true; var ph = (t.washT * 2 + i * 0.37) % 1; sp.position.set(80 + (i % 2 ? 1 : -1) * 1.0 * (1 - ph), 3.6 - ph * 3.2, D.z + (i - 3.5) * 0.5); }
      R.dirt = Math.max(0, R.dirt - dt * 12);
      if (t.washT <= 0) { D.spray.forEach(function (s) { s.visible = false; }); R.dirt = 0; toast('The train is clean', 'good'); }
    }
    D.lever.rotation.z = R.points === 'depot' ? 0.6 : -0.6; D.lamp.material = R.points === 'depot' ? trMats().ledAmber : trMats().ledGreen;
    var soot = R.dirt / 100; trMats().green.color.setHex(0x1d5b3b).lerp(new THREE.Color(0x151a17), soot * 0.55);
  }
  // ── Animation of the rolling stock ────────────────────────────────
  function trAnimate(dt, run) {
    var t = TR.t, R = trState(), i, k;
    t.doorAmt += ((t.doorsOpen ? 1 : 0) - t.doorAmt) * Math.min(1, dt * 3.5);
    if (Math.abs((t.doorsOpen ? 1 : 0) - t.doorAmt) < 0.004) t.doorAmt = t.doorsOpen ? 1 : 0;
    var signed = run * (t.dir >= 0 ? 1 : -1);
    for (i = 0; i < TR.units.length; i++) {
      var u = TR.units[i];
      for (k = 0; k < u.wheels.length; k++) u.wheels[k].w.rotation.z -= signed / u.wheels[k].r;
      if (u.doors) for (k = 0; k < u.doors.length; k++) { var d = u.doors[k]; d.pv.rotation.y = d.side * d.h * (Math.PI / 2) * t.doorAmt; }
      if (u.flag) u.flag.rotation.y = Math.sin(performance.now() / 180) * 0.3;
      if (u.lamp && u.kind === 'wagon') u.lamp.material = (S.time < 7 || S.time > 18.5) ? trMats().lampOn : trMats().lampOff;
    }
    var lo = TR.units[0];
    // the valve gear: connecting rods follow the crank pins
    lo.rods.forEach(function (r) {
      var s = r.s, drv = null, d2 = null; lo.drivers.forEach(function (dv) { if (dv.s === s && dv.x > 1) drv = dv; if (dv.s === s && dv.x < 1) d2 = dv; });
      var a = drv.w.rotation.z + (s > 0 ? 0 : Math.PI / 2), rc = 0.22, px = drv.x + Math.cos(a) * rc, py = 0.88 + Math.sin(a) * rc, cxp = px + Math.sqrt(1.44 - (1.0 - py) * (1.0 - py));
      var mx = (px + cxp) / 2, my = (py + 1.0) / 2, len = Math.hypot(cxp - px, 1.0 - py);
      r.rod.position.set(mx, my, s * 1.2); r.rod.scale.x = len; r.rod.rotation.z = Math.atan2(1.0 - py, cxp - px);
      r.cross.position.set(cxp, 1.0, s * 1.12); r.pr.scale.x = Math.max(0.2, 3.2 - cxp) / 0.9; r.pr.position.set((cxp + 3.2) / 2, 1.0, s * 1.05);
      var a2 = d2.w.rotation.z + (s > 0 ? 0 : Math.PI / 2); r.coup.position.set((d2.x + drv.x) / 2 + Math.cos(a2) * rc, 0.88 + Math.sin(a2) * rc, s * 1.24); r.coup.scale.x = (drv.x - d2.x);
    });
    // chuffs and smoke
    var cw = TR.units[0].g, ch = trWorldOf(lo, lo.chimney);
    if (t.engine && t.press > 0.3) {
      t.chuff += run; var step = 0.97;
      if (run > 0 && t.chuff > step) { t.chuff = 0; burst(ch.x, 3.9, ch.z, 0xdadde0, 3 + Math.round(t.throttle * 5), 'smoke'); trTone('triangle', 90, 0.12, 0.2, ch.x, ch.z, { f1: 55 }); if (trOk()) sNoise(AC.currentTime, 0.1, trVol(ch.x, ch.z) * 0.09, { type: 'lowpass', freq: 500, fade: true }); }
      else if (t.v < 0.3) { t.idleT -= dt; if (t.idleT <= 0) { t.idleT = 2.6; burst(ch.x, 3.9, ch.z, 0xe9ecee, 2, 'smoke'); } }
    }
    lo.lamp.material.color.setHex(t.engine && (S.time < 7 || S.time > 18.5 || true) ? 0xfff0b0 : 0x55503a);
    // the cab
    lo.gasLever.rotation.z = 0.5 - t.throttle; lo.brakeLever.rotation.z = 0.5 - (t.brakeKey ? 1 : t.brake); lo.revLever.rotation.z = t.dir > 0 ? -0.5 : 0.5;
    // The toggle handles pivot in the panel face. Positive X sends the handle clockwise as seen from the cab.
    lo.engSw.rotation.z = 0; lo.doorSw.rotation.z = 0;
    lo.engSw.rotation.x = t.engine ? 0.6 : -0.6; lo.doorSw.rotation.x = t.doorsOpen ? 0.6 : -0.6;
    lo.engSwLed.material = t.engine ? trMats().ledGreen : trMats().ledOff; lo.doorSwLed.material = t.doorsOpen ? trMats().ledAmber : trMats().ledOff;
    lo.hornBtn.position.x = lo.hornBtn.userData.rest + ((t.hornKey || t.hornAuto > 0) ? 0.03 : 0); lo.cord.position.y = 3.55 - ((t.whistleKey || t.whistleAuto > 0) ? 0.12 : 0);
    var G = TR.gauges; if (G) { G.press.rotation.z = 1.1 - t.press * 2.2; G.speed.rotation.z = 1.1 - Math.min(1, t.v * 3.6 / 40) * 2.2; G.fuel.rotation.z = 1.1 - R.fuel / 100 * 2.2; }
    if (TR.waterGlass) TR.waterGlass.scale.y = Math.max(0.02, R.water / 100);
  }
  // ── The crossings ─────────────────────────────────────────────────
  function trCrossingsTick(dt) {
    var t = TR.t, M = trMats(), i, j, k;
    for (i = 0; i < TR.xing.length; i++) {
      var X = TR.xing[i], act = false, p;
      for (j = 0; j < TR.units.length && !act; j++) { p = TR.units[j].g.position; if (Math.hypot(p.x - X.x, p.z - X.z) < 8.5) act = true; }
      if (!act && t.v > 0.3) for (k = 0; k < 8 && !act; k++) { var pp = trPos(t.s + t.dir * (k * 12 + 2), t.mode, _trA); if (Math.hypot(pp.x - X.x, pp.z - X.z) < 6) act = true; }
      X.active = act; X.up += ((act ? 1 : 0) - X.up) * Math.min(1, dt * 1.6); if (Math.abs(X.up - (act ? 1 : 0)) < 0.01) X.up = act ? 1 : 0;
      for (j = 0; j < X.poles.length; j++) X.poles[j].position.y = -1.35 + 1.35 * Math.min(1, X.up);
      if (act) { X.flip += dt * 2.2; X.beepT -= dt; if (X.beepT <= 0 && X.up > 0.1) { X.beepT = 0.42; var hi = Math.floor(X.flip * 2) % 2 === 0; trTone('square', hi ? 1040 : 760, 0.18, 0.1, X.x, X.z, { lp: 2600 }); } }
      for (j = 0; j < X.leds.length; j++) { var on = act && X.up > 0.2 && ((Math.floor(X.flip * 2) + X.leds[j].phase) % 2 === 0); X.leds[j].m.material = on ? M.ledOn : M.led; }
      if (typeof traffic !== 'undefined' && traffic && traffic.cars && X.road) traffic.cars.forEach(function (c) {
        if (c.road) return; var cp = c.g.position, near = Math.abs(cp.z - X.z) < 6 && Math.abs(cp.x - X.x) < 16 && (X.x - cp.x) * c.dir > 0;
        if (act && near) { if (c.hold === undefined) { c.hold = c.v; c.v = 0; } } else if (c.hold !== undefined && !act) { c.v = c.hold; c.hold = undefined; }
      });
    }
  }
  // ── The stations ──────────────────────────────────────────────────
  function trStationsTick(dt) {
    var t = TR.t, R = trState(), M = trMats(), night = S.time < 7 || S.time > 18.5, i, k;
    for (i = 0; i < TR.st.length; i++) {
      var st = TR.st[i];
      if (st.gatesWant !== undefined) { st.gatesAmt += ((st.gatesWant ? 1 : 0) - st.gatesAmt) * Math.min(1, dt * 2.2); if (Math.abs((st.gatesWant ? 1 : 0) - st.gatesAmt) < 0.01) st.gatesAmt = st.gatesWant ? 1 : 0; }
      for (k = 0; k < st.gateLeaves.length; k++) { var gl = st.gateLeaves[k]; gl.pv.rotation.y = -gl.sd * (Math.PI / 2) * st.gatesAmt; }
      var want = st.cabOpen ? 1 : 0; st.cabAmt = (st.cabAmt || 0) + (want - (st.cabAmt || 0)) * Math.min(1, dt * 5); st.doorPv.rotation.y = st.cabAmt * 1.8;
      st.sw.auto.rotation.x = R.auto ? -0.6 : 0.6; st.sw.gates.rotation.x = st.gatesAmt > 0.5 ? -0.6 : 0.6; st.sw.lights.rotation.x = st.lightsOn ? -0.6 : 0.6;
      st.led.auto.material = R.auto ? M.ledGreen : M.ledOff; st.led.gates.material = st.gatesAmt > 0.5 ? M.ledAmber : M.ledOff; st.led.lights.material = st.lightsOn ? M.lampOn : M.ledOff;
      st.sw.bell.position.z = st.sw.bell.userData.rest + (st.bellT > 0 ? 0.015 : 0); st.sw.announce.position.z = st.sw.announce.userData.rest;
      for (k = 0; k < st.lamps.length; k++) st.lamps[k].material = st.lightsOn ? M.lampOn : M.lampOff;
      st.light.intensity = st.lightsOn ? (night ? 1.5 : 0.35) : 0;
      if (st.bellT > 0) {   // tring-tring: a bright double strike every 0.22 s for at least five seconds
        st.bellT -= dt; st.strikeT -= dt; st.bellG.rotation.z = Math.sin(performance.now() / 55) * 0.55 * Math.min(1, st.bellT);
        if (st.strikeT <= 0) { st.strikeT = 0.22; var bx = st.x, bz = st.z; if (trOk()) { var v = trVol(bx, bz) * 0.22; if (v > 0.002) { sTone('sine', 1480, AC.currentTime, 0.4, v, { attack: 0.002 }); sTone('sine', 2960, AC.currentTime, 0.25, v * 0.5, { attack: 0.002 }); sTone('sine', 1975, AC.currentTime + 0.05, 0.3, v * 0.4, { attack: 0.002 }); } } }
      } else st.bellG.rotation.z *= 0.9;
      if (!st.boardT || (st.boardT -= dt) <= 0) { st.boardT = 0.5; trDrawBoard(st); }
    }
  }
  // ── The driver's head-up line ─────────────────────────────────────
  function trBuildHud() {
    var el = document.createElement('div'); el.id = 'tr-hud'; el.hidden = true;
    el.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);background:rgba(5,8,12,0.78);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:8px 14px;color:#eef1f5;font:13px/1.45 Consolas,monospace;pointer-events:none;z-index:20;text-align:center;white-space:pre';
    document.body.appendChild(el); TR.hud = el;
  }
  function trHud(dt) {
    var t = TR.t, R = trState(); if (!TR.hud) return; t.hudT -= dt; if (t.hudT > 0) return; t.hudT = 0.12;
    if (!(t.driving || t.seat)) { if (!TR.hud.hidden) TR.hud.hidden = true; return; }
    var st = TR.st[t.nextSt], dist = Math.round(trFwdDist(t, trTargetS(t.nextSt, t.mode)));
    var l1 = (t.driving ? 'GAS ' + Math.round(t.throttle * 100) + '%   BRAKE ' + Math.round((t.brakeKey ? 1 : t.brake) * 100) + '%   ' : '') + Math.round(t.v * 3.6) + ' km/h   ' + (t.dir > 0 ? 'FWD' : 'REV') + (t.atb ? '   [' + t.atb + ']' : '');
    var l2 = 'STEAM ' + Math.round(t.press * 100) + '%   COAL ' + Math.round(R.fuel) + '%   WATER ' + Math.round(R.water) + '%   WEAR ' + Math.round(R.wear) + '%   DIRT ' + Math.round(R.dirt) + '%';
    var l3 = (t.at >= 0 ? 'AT ' + TR.st[t.at].name + (t.dwell > 0 ? '   DEPARTS IN ' + Math.ceil(t.dwell) + ' s' : '   READY') : 'NEXT ' + st.name + '   ' + dist + ' m') + '   DOORS ' + (t.doorsOpen ? 'OPEN' : 'SHUT') + (R.auto ? '   AUTO' : '') + (t.mode === 'D' ? '   DEPOT LINE' : '');
    TR.hud.textContent = l1 + '\n' + l2 + '\n' + l3; TR.hud.hidden = false;
  }
