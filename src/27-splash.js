//@ Park Co, part 27: the loading splash. index.html paints it before the script tags run; it covers the world build and
  // plays its wordmark for a beat once the made-with splash (Co Engine 89-splash) hands the screen over — 1.6 s, then it
  // fades into the start screen. With no #co-splash on the page (an older engine), it still fades at boot, the way it
  // always did. The bar and the tips animate on transform/opacity only, so the compositor keeps them moving while the
  // boot call below blocks the main thread.
  function pkSplashFade() {
    var el = document.getElementById('dc-splash'); if (!el) return;
    el.classList.add('out');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 700);
  }
  if (document.getElementById('co-splash')) hook('co-splash-end', function () { setTimeout(pkSplashFade, 1600); });
  else hook('boot', pkSplashFade);
