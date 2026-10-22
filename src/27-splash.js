//@ Park Co, part 27: the loading splash. index.html paints it before the script tags run; it covers the world build and
  // fades out once boot is done. The bar and the tips animate on transform/opacity only, so the compositor keeps them
  // moving while the boot call below blocks the main thread.
  hook('boot', function () {
    var el = document.getElementById('dc-splash'); if (!el) return;
    el.classList.add('out');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 700);
  });
