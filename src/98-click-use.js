//@ Park Co, part 98: the use button is a setting. Choose the E key or the left mouse button (Settings > Use button, or F6). Saved between sessions.
  (function () {
    var canvasId = 'co-canvas';
    var KEY = 'pk-use-button';            // 'lmb' or 'e'
    var mode = 'lmb';                     // default: left click, as before
    try { var saved = localStorage.getItem(KEY); if (saved === 'e' || saved === 'lmb') mode = saved; } catch (x) {}
    function lmb() { return mode === 'lmb'; }

    function locked() { var c = document.getElementById(canvasId); return !!c && document.pointerLockElement === c; }
    function editing() { return !!(CO.editor && CO.editor.on); }
    function typing(t) { return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT'); }

    // 1) in left-click mode the real E key is swallowed before the engine sees it (typing in a text box still works)
    window.addEventListener('keydown', function (e) {
      if (lmb() && e.code === 'KeyE' && e.isTrusted && !typing(e.target)) { e.stopImmediatePropagation(); e.preventDefault(); }
    }, true);
    window.addEventListener('keyup', function (e) {
      if (lmb() && e.code === 'KeyE' && e.isTrusted && !typing(e.target)) e.stopImmediatePropagation();
    }, true);

    // 2) in left-click mode a click while the mouse is captured sends the engine the keypress E used to (Shift + click = Shift+E)
    document.addEventListener('mousedown', function (e) {
      if (!lmb() || e.button !== 0 || !locked() || editing()) return;
      var opt = { code: 'KeyE', key: 'e', bubbles: true, cancelable: true, shiftKey: e.shiftKey };
      document.dispatchEvent(new KeyboardEvent('keydown', opt));
      document.dispatchEvent(new KeyboardEvent('keyup', opt));
    });

    // 3) in left-click mode, on-screen labels that say E are rewritten as they appear
    var RULES = [
      [/press E to/gi, 'left-click to'],
      [/press E/gi, 'left-click'],
      [/Shift\+E/g, 'Shift+click'],
      [/, E to get out/g, ', left-click to get out'],
      [/\bE or a step\b/g, 'left-click or a step'],
      [/aim at a prop and E grabs/g, 'aim at a prop and left-click grabs'],
      [/\bE places\b/g, 'left-click places']
    ];
    function fixText(s) { for (var i = 0; i < RULES.length; i++) s = s.replace(RULES[i][0], RULES[i][1]); return s; }
    var pending = false;
    function sweep() {
      pending = false;
      if (lmb()) {
        var roots = document.querySelectorAll('#h-prompt, #h-toasts, #h-feed, #h-card, #dc-panel-body, #dc-menu-body, .pk-welcome-card');
        for (var r = 0; r < roots.length; r++) {
          var w = document.createTreeWalker(roots[r], NodeFilter.SHOW_TEXT, null), n;
          while ((n = w.nextNode())) { var t = fixText(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; }
          var keys = roots[r].querySelectorAll('b, kbd');
          for (var k = 0; k < keys.length; k++) if (keys[k].textContent.trim() === 'E') keys[k].textContent = (keys[k].tagName === 'B' ? 'LMB' : 'Left click');
        }
      }
      addSettingRow();
    }
    function queue() { if (!pending) { pending = true; requestAnimationFrame(sweep); } }

    // 4) the setting itself: a row added to the Settings page, and F6 as a shortcut
    function label() { return lmb() ? 'Left mouse button' : 'E key'; }
    function setMode(m) {
      mode = m;
      try { localStorage.setItem(KEY, m); } catch (x) {}
      var b = document.getElementById('pk-use-opt-btn'); if (b) b.textContent = label();
      if (typeof toast === 'function') toast('Use button: ' + label(), '');
      queue();
    }
    function addSettingRow() {
      var body = document.getElementById('dc-menu-body');
      if (!body || document.getElementById('pk-use-opt')) return;
      // only on the Settings page (the start and pause menus have no such heading)
      var holder = body.parentElement || body;
      if (!/settings/i.test(holder.textContent || '')) return;
      if (/how to play|resume|\bplay\b/i.test(body.textContent || '') && !/volume|sensitivity|graphics|sound|mouse/i.test(body.textContent || '')) return;
      var row = document.createElement('div');
      row.id = 'pk-use-opt';
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:12px;margin:10px 0;';
      row.innerHTML = '<span>Use button</span><button id="pk-use-opt-btn" type="button" style="cursor:pointer;padding:6px 12px;"></button>';
      row.lastChild.textContent = label();
      row.lastChild.addEventListener('click', function (e) { e.stopPropagation(); setMode(lmb() ? 'e' : 'lmb'); });
      body.appendChild(row);
    }
    window.addEventListener('keydown', function (e) {
      if (e.code === 'F6' && !typing(e.target)) { e.preventDefault(); setMode(lmb() ? 'e' : 'lmb'); }
    });

    new MutationObserver(queue).observe(document.body, { childList: true, subtree: true, characterData: true });
    queue();
  })();
