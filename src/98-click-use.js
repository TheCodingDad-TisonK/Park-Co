//@ Park Co, part 98: the left mouse button is the use button. The E key does nothing; labels that said E are rewritten on screen.
  (function () {
    var canvasId = 'co-canvas';
    function locked() { var c = document.getElementById(canvasId); return !!c && document.pointerLockElement === c; }
    function editing() { return !!(CO.editor && CO.editor.on); }
    function typing(t) { return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT'); }

    // 1) the real E key is swallowed before the engine sees it (typing in a text box still works)
    window.addEventListener('keydown', function (e) {
      if (e.code === 'KeyE' && e.isTrusted && !typing(e.target)) { e.stopImmediatePropagation(); e.preventDefault(); }
    }, true);
    window.addEventListener('keyup', function (e) {
      if (e.code === 'KeyE' && e.isTrusted && !typing(e.target)) e.stopImmediatePropagation();
    }, true);

    // 2) a left click while the mouse is captured sends the engine the same keypress E used to (Shift + click = the old Shift+E)
    document.addEventListener('mousedown', function (e) {
      if (e.button !== 0 || !locked() || editing()) return;
      var opt = { code: 'KeyE', key: 'e', bubbles: true, cancelable: true, shiftKey: e.shiftKey };
      document.dispatchEvent(new KeyboardEvent('keydown', opt));
      document.dispatchEvent(new KeyboardEvent('keyup', opt));
    });

    // 3) every on-screen label that still says E is rewritten as it appears
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
    function sweep() {
      pending = false;
      var roots = document.querySelectorAll('#h-prompt, #h-toasts, #h-feed, #h-card, #dc-panel-body, #dc-menu-body, .pk-welcome-card');
      for (var r = 0; r < roots.length; r++) {
        var w = document.createTreeWalker(roots[r], NodeFilter.SHOW_TEXT, null), n;
        while ((n = w.nextNode())) { var t = fixText(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; }
        var keys = roots[r].querySelectorAll('b, kbd');
        for (var k = 0; k < keys.length; k++) if (keys[k].textContent.trim() === 'E') keys[k].textContent = (keys[k].tagName === 'B' ? 'LMB' : 'Left click');
      }
    }
    var pending = false;
    function queue() { if (!pending) { pending = true; requestAnimationFrame(sweep); } }
    new MutationObserver(queue).observe(document.body, { childList: true, subtree: true, characterData: true });
    queue();
  })();
