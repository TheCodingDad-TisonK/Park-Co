//@ Park Co, part 62: the UI skin (tison, 2026-11-15: "rework the UI ... every single UI element, the main menu too"). One look for every
//@ element of the page's own UI, called Dusk Park: deep night-blue glass panels, one warm amber accent, one radius scale, one type
//@ scale, motion that is short and never in the way. It is a style sheet laid over the engine's and the page's, plus one small
//@ script that gives the start screen its wordmark and version and keeps the panel's focus. The engine draws the markup (the menus
//@ are data in part 00-menus.js); this part only dresses it, so nothing here changes what a button does. It covers: the start
//@ screen, the HUD bar, the key prompt, the toasts and the feed, the level card, the pause menu and its settings, the panels
//@ and their tabs, buttons, sliders, switches, selects, tables, scroll bars and the welcome card. The 3D screens in the world (the
//@ booths, the office PC) are not part of it.
  var PK_UI = { css: null };
  function pkUiCss() {
    return [
      // ── Tokens ─────────────────────────────────────────────────
      ':root { --pk-glass: linear-gradient(180deg, rgba(26,38,56,0.93), rgba(13,20,31,0.95)); --pk-glass-soft: rgba(14,21,32,0.66); --pk-edge: rgba(255,255,255,0.10); --pk-edge-hi: rgba(255,255,255,0.18); --pk-amber: #f5b53d; --pk-amber-hi: #ffd27a; --pk-amber-lo: #d9951c; --pk-green: #6fe0a0; --pk-red: #ff7a6b; --pk-blue: #7fb4ff; --pk-text: #eef2f7; --pk-muted: #9fb0c3; --pk-r: 14px; --pk-r-sm: 9px; --pk-shadow: 0 22px 60px rgba(0,0,0,0.55), 0 2px 0 rgba(255,255,255,0.04) inset; --pk-ease: cubic-bezier(0.2, 0.8, 0.2, 1); }',
      'body { --panel: #101822; --line: rgba(255,255,255,0.10); --amber: #f5b53d; --muted: #9fb0c3; --text: #eef2f7; }',
      'body ::selection { background: rgba(245,181,61,0.35); }',
      'body * { scrollbar-width: thin; scrollbar-color: rgba(159,176,195,0.32) transparent; }',
      'body *::-webkit-scrollbar { width: 7px; height: 7px; } body *::-webkit-scrollbar-thumb { background: rgba(159,176,195,0.3); border-radius: 8px; border: 2px solid transparent; background-clip: padding-box; } body *::-webkit-scrollbar-track { background: transparent; }',
      'body :focus-visible { outline: 2px solid var(--pk-amber); outline-offset: 2px; }',
      // ── Buttons, everywhere ───────────────────────────────────
      'body .dc-btn, body .dc-menu-btns button, body .dc-menu-row button, body #dc-panel-tabs button, body .co-mm .co-mm-btns button, body .co-mm .co-mm-body button, body #dc-panel-body button, body #dc-menu-body button { border: 1px solid var(--pk-edge); border-radius: var(--pk-r-sm); background: rgba(255,255,255,0.055); color: var(--pk-text); font: inherit; font-weight: 600; letter-spacing: 0.01em; transition: transform 0.14s var(--pk-ease), background 0.14s, border-color 0.14s, box-shadow 0.14s, color 0.14s; }',
      'body .dc-btn:hover, body .dc-menu-btns button:hover, body .dc-menu-row button:hover, body #dc-panel-tabs button:hover, body .co-mm .co-mm-btns button:hover, body .co-mm .co-mm-body button:hover, body #dc-panel-body button:hover, body #dc-menu-body button:hover { background: rgba(255,255,255,0.11); border-color: rgba(245,181,61,0.55); }',
      'body .dc-btn:active, body .dc-menu-btns button:active, body #dc-panel-body button:active, body .co-mm .co-mm-btns button:active { transform: translateY(1px) scale(0.99); }',
      'body .dc-btn.primary, body .dc-menu-btns button.primary, body .co-mm button.primary, body #dc-panel-tabs button.on { background: linear-gradient(180deg, rgba(245,181,61,0.26), rgba(245,181,61,0.12)); border-color: rgba(245,181,61,0.6); color: var(--pk-amber-hi); }',
      'body #dc-panel-body button, body #dc-menu-body button { padding: 6px 12px; margin: 2px; }',
      // ── The start screen ──────────────────────────────────────
      'body #dc-start.co-mm { justify-content: flex-start; padding-left: 8vw; background: linear-gradient(90deg, rgba(4,7,12,0.94) 0%, rgba(4,7,12,0.78) 34%, rgba(4,7,12,0.30) 72%, rgba(4,7,12,0.12) 100%), radial-gradient(120% 90% at 85% 100%, rgba(240,164,85,0.22), transparent 60%); }',
      'body #dc-start.co-mm .co-mm-card { width: min(430px, 92vw); text-align: left; padding: 22px 28px 20px; border-radius: 20px; background: var(--pk-glass-soft); border: 1px solid var(--pk-edge-hi); box-shadow: var(--pk-shadow); backdrop-filter: blur(16px) saturate(1.2); -webkit-backdrop-filter: blur(16px) saturate(1.2); animation: pk-rise 0.55s var(--pk-ease) both; }',
      'body #dc-start.co-mm .pk-wordmark { display: block; width: min(250px, 78%); height: auto; margin: -4px 0 6px -4px; filter: drop-shadow(0 6px 22px rgba(0,0,0,0.5)); }',
      'body #dc-start.co-mm h1.co-mm-title { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }',
      'body #dc-start.co-mm .co-mm-subtitle { margin: 0 0 10px; color: var(--pk-muted); font-size: 14.5px; line-height: 1.45; }',
      'body #dc-start.co-mm #dc-start-stats { justify-content: flex-start; margin: 0 0 6px; gap: 6px; }',
      'body #dc-start.co-mm #dc-start-stats span { background: rgba(255,255,255,0.06); border: 1px solid var(--pk-edge); border-radius: 999px; padding: 3px 11px 3px 9px; font-size: 12px; font-weight: 600; color: var(--pk-text); }',
      'body #dc-start.co-mm #dc-start-stats span::before { content: ""; display: inline-block; width: 6px; height: 6px; margin-right: 7px; border-radius: 50%; background: var(--pk-amber); vertical-align: 1px; }',
      'body #dc-start.co-mm #dc-start-note { margin: 4px 0 0; font-size: 12.5px; color: var(--pk-muted); }',
      'body #dc-start.co-mm .co-mm-btns { margin-top: 14px; gap: 6px; align-items: stretch; }',
      'body #dc-start.co-mm .co-mm-btns button { position: relative; padding: 8px 16px; font-size: 14.5px; text-align: left; background: rgba(255,255,255,0.045); border-color: var(--pk-edge); }',
      'body #dc-start.co-mm .co-mm-btns button::after { content: "\\203A"; position: absolute; right: 14px; top: 50%; transform: translateY(-52%); color: var(--pk-muted); font-size: 20px; transition: transform 0.16s var(--pk-ease), color 0.16s; }',
      'body #dc-start.co-mm .co-mm-btns button:hover { transform: translateX(4px); }',
      'body #dc-start.co-mm .co-mm-btns button:hover::after { color: var(--pk-amber-hi); transform: translate(3px, -52%); }',
      'body #dc-start.co-mm .co-mm-btns button.primary { padding: 12px 18px; font-size: 17px; font-weight: 700; letter-spacing: 0.04em; color: #1b1405; background: linear-gradient(180deg, var(--pk-amber-hi), var(--pk-amber) 55%, var(--pk-amber-lo)); border-color: rgba(255,226,160,0.9); box-shadow: 0 8px 26px rgba(245,181,61,0.30), 0 1px 0 rgba(255,255,255,0.5) inset; }',
      'body #dc-start.co-mm .co-mm-btns button.primary::after { color: #1b1405; }',
      'body #dc-start.co-mm .co-mm-btns button.primary:hover { filter: brightness(1.06); box-shadow: 0 10px 32px rgba(245,181,61,0.42), 0 1px 0 rgba(255,255,255,0.5) inset; }',
      'body #dc-start.co-mm .co-mm-btns button:last-child:not(.primary):hover { border-color: rgba(255,122,107,0.6); }',
      'body #dc-start.co-mm::after { content: attr(data-ver); position: absolute; left: 8vw; bottom: 22px; color: rgba(159,176,195,0.75); font-size: 12px; letter-spacing: 0.08em; }',
      '@keyframes pk-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }',
      '@keyframes pk-fade { from { opacity: 0; } to { opacity: 1; } }',
      '@keyframes pk-pop { from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); } to { opacity: 1; transform: translate(-50%, -50%); } }',
      '@keyframes pk-slide-in { from { opacity: 0; transform: translateX(26px); } to { opacity: 1; transform: none; } }',
      // ── The pause menu and its pages ──────────────────────────
      'body #dc-menu.co-mm { background: radial-gradient(100% 100% at 50% 40%, rgba(5,8,14,0.78), rgba(3,5,9,0.92)); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); animation: pk-fade 0.22s ease both; }',
      'body #dc-menu .dc-menu-card, body #dc-menu .co-mm-card { background: var(--pk-glass); border: 1px solid var(--pk-edge-hi); border-radius: 20px; box-shadow: var(--pk-shadow); padding: 26px 30px 24px; width: min(480px, 92vw); animation: pk-rise 0.32s var(--pk-ease) both; }',
      'body #dc-menu h2.co-mm-title, body #dc-menu h2 { margin: 0 0 4px; font-size: 13px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: var(--pk-amber); }',
      'body #dc-menu .dc-sub { color: var(--pk-muted); font-size: 13px; margin: 0 0 12px; }',
      'body #dc-menu .dc-menu-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; margin-top: 12px; }',
      'body #dc-menu .dc-menu-btns button { margin: 0; padding: 11px 12px; font-size: 14.5px; text-align: center; }',
      'body #dc-menu .dc-menu-btns button.primary { grid-column: 1 / -1; padding: 14px; font-size: 16px; font-weight: 700; letter-spacing: 0.04em; color: #1b1405; background: linear-gradient(180deg, var(--pk-amber-hi), var(--pk-amber) 55%, var(--pk-amber-lo)); border-color: rgba(255,226,160,0.9); box-shadow: 0 6px 22px rgba(245,181,61,0.26); }',
      'body #dc-menu .dc-menu-btns button[data-menu="reset"], body #dc-menu .dc-menu-btns button[data-menu="quit"] { color: #ffb4aa; }',
      'body #dc-menu .dc-menu-btns button[data-menu="reset"]:hover, body #dc-menu .dc-menu-btns button[data-menu="quit"]:hover { border-color: rgba(255,122,107,0.65); background: rgba(255,122,107,0.10); }',
      'body #dc-menu-body, body .co-mm-body { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--pk-edge); }',
      'body .dc-menu-row { margin: 0 0 10px; }',
      // ── Forms: rows, sliders, switches, selects ───────────────
      'body .dc-form label, body .co-mm .co-mm-body .dc-form label { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 9px 2px; border-bottom: 1px solid var(--pk-edge); color: var(--pk-text); font-size: 14px; }',
      'body .dc-form label:last-child { border-bottom: 0; }',
      'body input[type=range] { -webkit-appearance: none; appearance: none; height: 5px; width: 170px; border-radius: 5px; background: rgba(255,255,255,0.14); outline-offset: 6px; }',
      'body input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, var(--pk-amber-hi), var(--pk-amber)); border: 2px solid #1b1405; box-shadow: 0 2px 8px rgba(0,0,0,0.5); cursor: pointer; transition: transform 0.12s; }',
      'body input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.18); }',
      'body input[type=checkbox] { -webkit-appearance: none; appearance: none; position: relative; width: 38px; height: 22px; border-radius: 999px; background: rgba(255,255,255,0.16); border: 1px solid var(--pk-edge); cursor: pointer; transition: background 0.16s, border-color 0.16s; margin: 0; flex: none; }',
      'body input[type=checkbox]::after { content: ""; position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; border-radius: 50%; background: #dfe6ee; transition: transform 0.16s var(--pk-ease), background 0.16s; box-shadow: 0 1px 4px rgba(0,0,0,0.4); }',
      'body input[type=checkbox]:checked { background: rgba(245,181,61,0.85); border-color: rgba(255,226,160,0.8); }',
      'body input[type=checkbox]:checked::after { transform: translateX(16px); background: #fff; }',
      'body select, body input[type=number], body input[type=text] { background: rgba(0,0,0,0.32); color: var(--pk-text); border: 1px solid var(--pk-edge); border-radius: var(--pk-r-sm); padding: 6px 10px; font: inherit; font-size: 13.5px; }',
      'body select:hover, body input[type=number]:hover, body input[type=text]:hover { border-color: rgba(245,181,61,0.5); }',
      'body .dc-ta { background: rgba(0,0,0,0.34); border: 1px solid var(--pk-edge); border-radius: var(--pk-r-sm); color: var(--pk-text); }',
      // ── Panels and their tabs ─────────────────────────────────
      'body #dc-panel { background: var(--pk-glass); border: 1px solid var(--pk-edge-hi); border-radius: 18px; box-shadow: var(--pk-shadow); padding: 18px 22px 20px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); animation: pk-pop 0.22s var(--pk-ease) both; }',
      'body #dc-panel header { padding-bottom: 12px; margin-bottom: 14px; border-bottom: 1px solid var(--pk-edge); gap: 12px; }',
      'body #dc-panel header h2 { font-size: 13px; font-weight: 700; letter-spacing: 0.26em; text-transform: uppercase; color: var(--pk-amber); }',
      'body #dc-panel-tabs { display: flex; gap: 3px; padding: 3px; border-radius: 12px; background: rgba(0,0,0,0.30); border: 1px solid var(--pk-edge); }',
      'body #dc-panel-tabs button { margin: 0; padding: 6px 13px; border: 0; border-radius: 9px; background: transparent; font-size: 13.5px; color: var(--pk-muted); }',
      'body #dc-panel-tabs button:hover { color: var(--pk-text); background: rgba(255,255,255,0.07); }',
      'body #dc-panel-tabs button.on { color: #1b1405; background: linear-gradient(180deg, var(--pk-amber-hi), var(--pk-amber)); box-shadow: 0 2px 10px rgba(245,181,61,0.3); }',
      'body #dc-panel-close { width: 34px; height: 34px; padding: 0; margin: 0; border-radius: 50%; font-size: 15px; line-height: 1; }',
      'body #dc-panel-body { line-height: 1.5; font-size: 14px; }',
      'body #dc-panel-body h3, body #dc-menu-body h3 { margin: 16px 0 6px; font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--pk-amber); }',
      'body #dc-panel-body p { margin: 0 0 8px; }',
      'body #dc-panel-body table { border-collapse: collapse; width: 100%; } body #dc-panel-body th { text-align: left; font-size: 11.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--pk-muted); font-weight: 600; } body #dc-panel-body td, body #dc-panel-body th { padding: 6px 8px; border-bottom: 1px solid var(--pk-edge); } body #dc-panel-body tr:hover td { background: rgba(255,255,255,0.035); }',
      'body .dc-grid { gap: 10px; } body .dc-card { background: rgba(255,255,255,0.045); border: 1px solid var(--pk-edge); border-radius: 12px; padding: 10px 12px; transition: border-color 0.14s, background 0.14s; } body .dc-card:hover { border-color: rgba(245,181,61,0.4); background: rgba(255,255,255,0.07); } body .dc-card small { color: var(--pk-muted); }',
      'body kbd, body code { background: rgba(255,255,255,0.09); border: 1px solid var(--pk-edge-hi); border-bottom-width: 2px; border-radius: 6px; padding: 1px 7px; font: 600 12px Consolas, monospace; color: var(--pk-amber-hi); }',
      // ── The HUD ───────────────────────────────────────────────
      'body #dc-hud .top { top: 12px; left: 14px; gap: 0; padding: 4px; border-radius: 999px; background: var(--pk-glass-soft); border: 1px solid var(--pk-edge); box-shadow: 0 10px 30px rgba(0,0,0,0.35); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }',
      'body #dc-hud .top span { background: transparent; border: 0; border-radius: 0; padding: 5px 14px; font-size: 14px; font-weight: 600; color: var(--pk-text); font-variant-numeric: tabular-nums; }',
      'body #dc-hud .top span + span { border-left: 1px solid var(--pk-edge); }',
      'body #dc-hud #h-day { color: var(--pk-amber-hi); letter-spacing: 0.04em; }',
      'body #dc-hud #h-cash { color: var(--pk-green); font-weight: 700; }',
      'body #dc-hud #h-guests { color: var(--pk-muted); font-weight: 500; }',
      'body #dc-hud #h-ride { color: var(--pk-amber-hi); font-weight: 500; }',
      'body #h-prompt { bottom: 17%; padding: 8px 16px 8px 10px; border-radius: 999px; background: var(--pk-glass-soft); border: 1px solid var(--pk-edge-hi); box-shadow: 0 8px 26px rgba(0,0,0,0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); font-weight: 600; animation: pk-rise 0.18s var(--pk-ease) both; }',
      'body #h-prompt b { display: inline-block; min-width: 22px; margin-right: 10px; padding: 1px 8px; text-align: center; border-radius: 7px; background: linear-gradient(180deg, var(--pk-amber-hi), var(--pk-amber)); color: #1b1405; font-weight: 800; box-shadow: 0 2px 0 rgba(120,80,10,0.8); }',
      'body #h-toasts { right: 16px; bottom: 16px; gap: 8px; align-items: flex-end; }',
      'body #h-toasts div { max-width: 340px; padding: 9px 14px 9px 12px; border: 1px solid var(--pk-edge); border-left: 3px solid var(--pk-blue); border-radius: 11px; background: var(--pk-glass); box-shadow: 0 10px 28px rgba(0,0,0,0.45); font-weight: 600; font-size: 13.5px; animation: pk-slide-in 0.28s var(--pk-ease) both; }',
      'body #h-toasts .good { border-left-color: var(--pk-green); border-color: var(--pk-edge); } body #h-toasts .bad { border-left-color: var(--pk-red); border-color: var(--pk-edge); } body #h-toasts .rare { border-left-color: var(--pk-amber); }',
      'body #h-feed { left: 16px; bottom: 16px; display: flex; flex-direction: column; gap: 3px; max-width: 360px; font-size: 12.5px; text-shadow: 0 1px 3px rgba(0,0,0,0.8); }',
      'body #h-feed div { padding: 3px 10px 3px 8px; border-radius: 8px; background: rgba(8,12,19,0.5); color: #cbd6e2; animation: pk-fade 0.3s ease both; }',
      'body #h-feed .t { color: var(--pk-amber); font-variant-numeric: tabular-nums; margin-right: 8px; font-weight: 700; }',
      'body #h-feed .bad { color: #ffb4aa; } body #h-feed .rare, body #h-feed .good { color: #c9f2d9; }',
      'body #h-card { top: 14%; padding: 16px 24px; min-width: 280px; text-align: center; border-radius: 16px; background: var(--pk-glass); border: 1px solid var(--pk-edge-hi); box-shadow: var(--pk-shadow); animation: pk-rise 0.35s var(--pk-ease) both; }',
      'body #h-card b { display: block; margin-bottom: 4px; font-size: 12px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; color: var(--pk-amber); }',
      'body #h-fps, body #h-devlink, body #h-edit { border-radius: 999px; background: var(--pk-glass-soft); border: 1px solid var(--pk-edge); font-variant-numeric: tabular-nums; }',
      // ── The welcome card ──────────────────────────────────────
      'body #pk-welcome { background: radial-gradient(100% 100% at 50% 40%, rgba(5,8,14,0.7), rgba(3,5,9,0.9)); backdrop-filter: blur(5px); animation: pk-fade 0.3s ease both; }',
      'body #pk-welcome .pk-welcome-card { background: var(--pk-glass); border: 1px solid var(--pk-edge-hi); border-radius: 22px; box-shadow: var(--pk-shadow); padding: 30px 34px 26px; animation: pk-rise 0.4s var(--pk-ease) both; }',
      'body #pk-welcome h1 { font-size: 32px; font-weight: 700; } body #pk-welcome .pk-welcome-eyebrow { letter-spacing: 0.3em; font-weight: 700; }',
      'body #pk-welcome h2 { letter-spacing: 0.2em; font-size: 12px; }',
      'body #pk-welcome button { padding: 12px 24px; font-size: 16px; font-weight: 700; letter-spacing: 0.03em; color: #1b1405; background: linear-gradient(180deg, var(--pk-amber-hi), var(--pk-amber) 55%, var(--pk-amber-lo)); border: 1px solid rgba(255,226,160,0.9); border-radius: 12px; box-shadow: 0 8px 24px rgba(245,181,61,0.28); cursor: pointer; }',
      'body #pk-ask { position: fixed; left: 50%; bottom: 22%; transform: translateX(-50%); z-index: 60; min-width: 340px; padding: 14px 22px 16px; border-radius: 18px; text-align: center; background: var(--pk-glass); border: 1px solid var(--pk-edge-hi); box-shadow: var(--pk-shadow); animation: pk-rise 0.25s var(--pk-ease) both; }',
      'body #pk-ask .who { font-size: 12px; font-weight: 700; letter-spacing: 0.28em; text-transform: uppercase; color: var(--pk-amber); } body #pk-ask .q { margin: 5px 0 12px; font-size: 17px; font-weight: 700; }',
      'body #pk-ask .keys { display: flex; gap: 12px; justify-content: center; } body #pk-ask .keys span { padding: 6px 14px 6px 8px; border-radius: 999px; background: rgba(255,255,255,0.07); border: 1px solid var(--pk-edge); font-weight: 600; } body #pk-ask .keys b { display: inline-block; min-width: 22px; margin-right: 8px; padding: 1px 7px; text-align: center; border-radius: 7px; background: linear-gradient(180deg, var(--pk-amber-hi), var(--pk-amber)); color: #1b1405; font-weight: 800; box-shadow: 0 2px 0 rgba(120,80,10,0.8); }',
      '@media (prefers-reduced-motion: reduce) { body *, body *::before, body *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }',
      '@media (max-width: 720px) { body #dc-start.co-mm { padding-left: 0; justify-content: center; } body #dc-start.co-mm::after { left: 50%; transform: translateX(-50%); } body #dc-menu .dc-menu-btns { grid-template-columns: 1fr; } }'
    ].join('\n');
  }
  function pkUiMount() {
    if (PK_UI.css) return;
    var st = document.createElement('style'); st.id = 'pk-ui-skin'; st.textContent = pkUiCss();
    document.head.appendChild(st); PK_UI.css = st;
  }
  // the start screen is drawn by the engine from data, so its wordmark and version go in once it is on the page (and again if it is redrawn)
  function pkUiStart() {
    var s = document.getElementById('dc-start'); if (!s) return;
    s.setAttribute('data-ver', 'v' + (window.PARK_VERSION || '') + '  ·  Co Engine');
    var fix = function () {
      var card = s.querySelector('.co-mm-card'); if (!card || card.querySelector('.pk-wordmark')) return;
      var img = document.createElement('img'); img.className = 'pk-wordmark'; img.src = 'game/wordmark.png'; img.alt = 'Park Co';
      card.insertBefore(img, card.firstChild);
    };
    fix();
    if (window.MutationObserver) new MutationObserver(fix).observe(s, { childList: true });
  }
  pkUiMount();
  hook('boot', pkUiStart);
