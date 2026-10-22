//@ Park Co, part 31: the welcome. A first-day card over the park, once per save, with the few controls that get a new
  // owner through the gate: the ticket window, the tablet, the pause guide. It holds the world while it is up, releases
  // the mouse for its button, and remembers that it has been seen so a reload returns straight to the park.
  var PK_WELCOME = { open: false, el: null, btn: null };

  function pkWelcomeBuild() {
    if (PK_WELCOME.el) return;
    var st = document.createElement('style');
    st.id = 'pk-welcome-style';
    st.textContent = [
      '#pk-welcome { position: fixed; inset: 0; z-index: 70; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(4, 8, 12, 0.76); }',
      '#pk-welcome[hidden] { display: none; }',
      '#pk-welcome .pk-welcome-card { width: min(640px, 94vw); max-height: 88vh; overflow: auto; background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 28px 32px 24px; box-shadow: 0 24px 70px rgba(0, 0, 0, 0.65); }',
      '#pk-welcome .pk-welcome-eyebrow { color: var(--amber); font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 8px; }',
      '#pk-welcome h1 { margin: 0 0 6px; font-size: 30px; font-weight: 600; letter-spacing: 0.01em; }',
      '#pk-welcome .pk-welcome-sub { margin: 0 0 20px; color: var(--muted); font-size: 15px; }',
      '#pk-welcome .pk-welcome-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }',
      '#pk-welcome h2 { margin: 0 0 8px; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--amber); }',
      '#pk-welcome p { margin: 0 0 10px; }',
      '#pk-welcome ul { margin: 0; padding-left: 18px; }',
      '#pk-welcome li { margin-bottom: 7px; }',
      '#pk-welcome kbd { display: inline-block; min-width: 16px; padding: 1px 5px; border: 1px solid var(--line); border-bottom-width: 2px; border-radius: 4px; background: rgba(255, 255, 255, 0.06); color: var(--text); font: 12px Consolas, monospace; text-align: center; }',
      '#pk-welcome .pk-welcome-foot { margin: 20px 0 0; padding-top: 14px; border-top: 1px solid var(--line); color: var(--muted); font-size: 13px; }',
      '#pk-welcome .pk-welcome-go { margin-top: 16px; }',
      '@media (max-width: 620px) { #pk-welcome .pk-welcome-cols { grid-template-columns: 1fr; gap: 14px; } #pk-welcome .pk-welcome-card { padding: 22px 20px 20px; } }'
    ].join('\n');
    document.head.appendChild(st);

    var el = document.createElement('div');
    el.id = 'pk-welcome';
    el.hidden = true;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'pk-welcome-title');
    el.innerHTML =
      '<div class="pk-welcome-card">' +
        '<div class="pk-welcome-eyebrow">Park Co · Day one</div>' +
        '<h1 id="pk-welcome-title">Welcome to your park</h1>' +
        '<p class="pk-welcome-sub">One coaster, two ticket windows, and a gate that is yours to work.</p>' +
        '<div class="pk-welcome-cols">' +
          '<section>' +
            '<h2>Your first day</h2>' +
            '<p>The gate is open. Guests park outside, buy a ticket, pass a turnstile and pick a ride.</p>' +
            '<ul>' +
              '<li><kbd>E</kbd> sells a ticket at the window or works the coaster desk.</li>' +
              '<li><kbd>Tab</kbd> brings up your tablet and Park OS anywhere in the park.</li>' +
              '<li><kbd>Esc</kbd> pauses. The pause menu has the full guide and your save.</li>' +
            '</ul>' +
          '</section>' +
          '<section>' +
            '<h2>Keep it running</h2>' +
            '<p>Work the coaster yourself, or hire an operator and set the desk to AUTO. The other rides are open from day one; their queues are out on the midway.</p>' +
            '<p>The park services switchboard in the HQ plant room has a breaker for every ride, plus separate park and ride lights.</p>' +
          '</section>' +
        '</div>' +
        '<p class="pk-welcome-foot">Shut the gate and the park stops taking guests. Have a good first day.</p>' +
        '<button id="pk-welcome-go" class="dc-btn primary pk-welcome-go" type="button">Open the park</button>' +
      '</div>';
    document.body.appendChild(el);
    PK_WELCOME.el = el;
    PK_WELCOME.btn = el.querySelector('#pk-welcome-go');
    if (PK_WELCOME.btn) PK_WELCOME.btn.addEventListener('click', function () { pkWelcomeClose(); });
  }

  function pkWelcomeOpen() {
    if (PK_WELCOME.open) return;
    pkWelcomeBuild();
    PK_WELCOME.open = true;
    PK_WELCOME.el.hidden = false;
    ui.suppressMenu = true;
    try { document.exitPointerLock(); } catch (e) {}
    if (PK_WELCOME.btn) { try { PK_WELCOME.btn.focus({ preventScroll: true }); } catch (e) { try { PK_WELCOME.btn.focus(); } catch (e2) {} } }
    sfx('click');
  }
  function pkWelcomeClose() {
    if (!PK_WELCOME.open) return;
    PK_WELCOME.open = false;
    if (PK_WELCOME.el) PK_WELCOME.el.hidden = true;
    if (S) S.welcomeSeen = true;
    ui.suppressMenu = false;
    if (ui.started) { save(); lockPointer(); }
    hudDirty = true;
  }

  // once after the start screen, on the first load of a save that has not seen it
  hook('enter', function () {
    if (!S || S.welcomeSeen) return;
    setTimeout(function () {
      if (!S || S.welcomeSeen || PK_WELCOME.open) return;
      pkWelcomeOpen();
    }, 380);
  });
  // the dialog owns the keyboard while it is up: Enter or Space accepts, Esc closes, everything else is swallowed
  var _pkWelPrevKey = GAME.key;
  GAME.key = function (e) {
    if (!PK_WELCOME.open) return _pkWelPrevKey ? _pkWelPrevKey(e) : false;
    if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); pkWelcomeClose(); return true; }
    return true;
  };
  var _pkWelPrevEscape = GAME.escape;
  GAME.escape = function () { if (PK_WELCOME.open) { pkWelcomeClose(); return true; } return _pkWelPrevEscape ? _pkWelPrevEscape() : false; };
  var _pkWelPrevBlocked = GAME.blocked;
  GAME.blocked = function () { return PK_WELCOME.open || (_pkWelPrevBlocked ? _pkWelPrevBlocked() : false); };
  var _pkWelPrevT = GAME.T;
  GAME.T = function () {
    var t = _pkWelPrevT();
    t.PK_WELCOME = PK_WELCOME; t.pkWelcomeOpen = pkWelcomeOpen; t.pkWelcomeClose = pkWelcomeClose;
    return t;
  };
