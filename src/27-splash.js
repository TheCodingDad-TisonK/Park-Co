//@ Park Co, part 27: the loading screen's timing. The screen itself (a dusk sky over the park's skyline, the wordmark, a track whose car rolls
//@ along as the bar fills, a line for each stage of opening the park and a tip) is static markup and CSS in index.html (tison, 2026-11-15:
//@ a new loading screen, a bit longer, and a shorter Co Engine splash). It has to be there at first paint: the world build blocks the
//@ page, and only animations the browser already runs on its own (transform and opacity) keep moving through it. The made-with splash
//@ (Co Engine 89-splash) fades out by a CSS animation after 1.9 s, so it goes even while the build blocks the page (it used to stay
//@ for the whole build); this screen is under it and its bar fills over 5.2 s from that moment. Once the build is done (the engine's
//@ 'co-splash-end') this part keeps the screen up until the bar has run its full hold and at least half a second more, then fades it
//@ into the start screen. A click or a key after 2.5 s skips the rest. The three numbers below must match index.html's CSS
//@ (1900ms delay, 5200ms hold). With no #co-splash on the page (an older engine) it fades at boot, the way it always did.
  var PK_SPL_HOLD = 5200, PK_SPL_SKIP = 2500, PK_SPL_CO = 1900;
  var PK_SPL_T0 = Date.now();   // the page's clock for this screen: the bar runs from PK_SPL_T0 + PK_SPL_CO
  var PK_SPL_TIPS = [
    'Work a ride by hand from its booth: the desk has the gates, the bars and dispatch.',
    'Press E at a ride\'s entry to board it yourself, or take the operator\'s chair.',
    'Guests like short lines. Feature a ride on the park board to bring them in.',
    'F3 lifts you off the ground to fly over the park; F3 again to land.',
    'The park lights switch on at dusk when the park board says so.',
    'A new ride unlocks with each level. The expansion stages come later.',
    'Every desk, every lever and every key in the booths does something.'
  ];
  (function () {
    var tip = document.getElementById('pk-spl-tip');
    if (tip) tip.innerHTML = '<b>DID YOU KNOW</b>' + PK_SPL_TIPS[Math.floor(Math.random() * PK_SPL_TIPS.length)];
  })();
  function pkSplashFade() {
    var el = document.getElementById('dc-splash'); if (!el) return;
    el.classList.add('out');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 700);
  }
  // the build is done: stay until the bar has run its full hold, and at least half a second more
  function pkSplashHold() {
    var el = document.getElementById('dc-splash'); if (!el) return;
    var done = false, shown = PK_SPL_T0 + PK_SPL_CO;
    var fade = function () { if (done) return; done = true; window.removeEventListener('keydown', skip, true); window.removeEventListener('pointerdown', skip, true); pkSplashFade(); };
    var skip = function () { if (Date.now() - shown >= PK_SPL_SKIP) fade(); };
    var left = Math.max(500, shown + PK_SPL_HOLD - Date.now());
    setTimeout(function () { el.classList.add('skip'); }, Math.max(0, shown + PK_SPL_SKIP - Date.now()));
    window.addEventListener('keydown', skip, true); window.addEventListener('pointerdown', skip, true);
    setTimeout(fade, left);
  }
  if (document.getElementById('co-splash')) hook('co-splash-end', function () { pkSplashHold(); });
  else hook('boot', pkSplashFade);
