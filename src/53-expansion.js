//@ Park Co, part 53: the expansion gate. It holds the five stages of docs/EXPANSION-PLAN.md, the land rectangles
//@ each one opens, the construction clock from commissioning to the gate opening, and the tablet's countdown.
//@ The Expansion page itself is part 25, drawn from the table and the state here.
//@ The saved state is S.expansion = { stage: n, commissioned: day, opened: [ids] }. Every reader here builds that
//@ state when it is missing, because an old save has no expansion key at all.
  // ── The stages ───────────────────────────────────────────────────
  // Section 2 of the plan, exactly its table: the same order, the same names, the same levels, the same costs. lands
  // names the entries of PK_XP_LANDS the stage opens. The Skyline is the viaduct, so it has no land of its own.
  var PK_XP_STAGES = [
    { id: 1, name: 'The Skyline', level: 26, cost: 250000, where: 'the viaduct across the park', lands: [] },
    { id: 2, name: 'Northern Heights', level: 28, cost: 600000, where: 'north, behind the depot', lands: ['north'] },
    { id: 3, name: "The Hunter's Woods", level: 30, cost: 450000, where: 'west, north of Central Station', lands: ['woods'] },
    { id: 4, name: 'Lindenburg Harbour', level: 32, cost: 550000, where: 'south, down to the lake', lands: ['harbour'] },
    { id: 5, name: 'The East Fair', level: 34, cost: 500000, where: 'east, either side of Dragon Gate', lands: ['eastNorth', 'eastSouth'] }
  ];
  var PK_XP_BUILD_DAYS = 3;    // the plan: construction runs for three in game days
  var PK_XP_OPEN_HOUR = 6;     // and the land opens on the third night at 06:00
  var PK_XP_LOG = { day: -1 }; // the day the construction line was last written, so it is written once a day
  var PK_XP_FENCED = {};       // the lands whose own fence this session has built

  // ── The lands ────────────────────────────────────────────────────
  // Section 8 of the plan: one named entry per land, from the numbers in sections 4 to 7. The plan writes some of
  // them the other way round (the north as z -176 to -240, the woods as x -140 to -184); here x0 is always the
  // smaller x and z0 the smaller z, the way the rest of the game tests a rectangle. gate is the way in the plan
  // names: the arch stands there, on the edge, and the fence leaves a gap for it.
  var PK_XP_LANDS = {
    north: { id: 'north', stage: 2, name: 'NORTHERN HEIGHTS', x0: -104, x1: 146, z0: -240, z1: -176,
      gate: { x: -17, z: -176, along: 'z' }, a: 0x4a5d6b, b: 0xe8eef2, sign: '#cfe6ff' },
    woods: { id: 'woods', stage: 3, name: "THE HUNTER'S WOODS", x0: -184, x1: -140, z0: -108, z1: -6,
      gate: { x: -140, z: -40, along: 'x' }, a: 0x4a3a28, b: 0xa8854a, sign: '#e8c896' },
    harbour: { id: 'harbour', stage: 4, name: 'LINDENBURG HARBOUR', x0: -104, x1: 59, z0: 122, z1: 188,
      gate: { x: 59, z: 160, along: 'x' }, a: 0x2f5f7a, b: 0xc04a38, sign: '#ffc2b0' },
    eastNorth: { id: 'eastNorth', stage: 5, name: 'THE EAST FAIR', x0: 180, x1: 220, z0: -110, z1: -38,
      gate: { x: 192, z: -38, along: 'z' }, a: 0xc94f4f, b: 0xf0c04a, sign: '#ffd166' },
    eastSouth: { id: 'eastSouth', stage: 5, name: 'THE EAST FAIR', x0: 180, x1: 220, z0: 34, z1: 68,
      gate: { x: 192, z: 34, along: 'z' }, a: 0xc94f4f, b: 0xf0c04a, sign: '#ffd166' }
  };

  // ── The state ────────────────────────────────────────────────────
  // A save from before this part has no expansion key; the engine fills top level keys only, so every reader here
  // asks for the state through pkExpState and gets a good one, without trusting the save to carry it.
  function pkExpState() {
    var E = S.expansion || (S.expansion = { stage: 0, commissioned: 0, opened: [] });
    if (!E.opened || !Array.isArray(E.opened)) E.opened = [];
    E.stage = +E.stage || 0;
    E.commissioned = +E.commissioned || 0;
    return E;
  }
  function pkExpansionStage(n) { for (var i = 0; i < PK_XP_STAGES.length; i++) if (PK_XP_STAGES[i].id === +n) return PK_XP_STAGES[i]; return null; }
  function pkExpansionOpen(n) {
    var E = pkExpState();
    for (var i = 0; i < E.opened.length; i++) if (+E.opened[i] === +n) return true;
    return false;
  }
  // the next stage in the plan's order that is not open: the one the Expansion page shows and a commission buys
  function pkExpansionNext() { for (var i = 0; i < PK_XP_STAGES.length; i++) if (!pkExpansionOpen(PK_XP_STAGES[i].id)) return PK_XP_STAGES[i]; return null; }
  // the days between the commission and the 06:00 that opens the land, for the page and the tablet
  function pkExpansionDaysLeft() {
    var E = pkExpState();
    if (!E.stage || pkExpansionOpen(E.stage)) return 0;
    return Math.max(0, Math.min(PK_XP_BUILD_DAYS, E.commissioned + PK_XP_BUILD_DAYS - S.day));
  }

  // ── The lands as the world asks for them ─────────────────────────
  // Part 46 calls these while it builds the site: is this spot inside a land at all, and is the land it is in open?
  function pkExpansionLandAt(x, z) {
    for (var k in PK_XP_LANDS) { var L = PK_XP_LANDS[k]; if (x >= L.x0 && x <= L.x1 && z >= L.z0 && z <= L.z1) return L; }
    return null;
  }
  function pkExpansionOpenedLandAt(x, z) {
    var L = pkExpansionLandAt(x, z);
    return L && pkExpansionOpen(L.stage) ? L : null;
  }

  // ── The land's own fence and gate ────────────────────────────────
  // The park's iron fence round the rectangle, with the gap the plan's way in asks for, and the land's arch in it.
  // It is idempotent per session: part 46 may call it while it builds, the tick calls it when a stage opens, and a
  // land whose fence already stands is skipped.
  function pkExpansionLandFence(land) {
    if (!land || PK_XP_FENCED[land.id]) return;
    if (typeof pkParkFence !== 'function') return;
    PK_XP_FENCED[land.id] = true;
    var X0 = land.x0, X1 = land.x1, Z0 = land.z0, Z1 = land.z1, g = land.gate, hw = 3.7, opt = { h: 1.9 };
    var sideZ = Math.abs(g.z - Z0) < 0.6 ? Z0 : Math.abs(g.z - Z1) < 0.6 ? Z1 : null;
    var sideX = Math.abs(g.x - X0) < 0.6 ? X0 : Math.abs(g.x - X1) < 0.6 ? X1 : null;
    var run = function (a, b, fix, axis) {
      if (Math.abs(b - a) < 0.8) return;
      if (axis === 'z') pkParkFence(a, fix, b, fix, opt);
      else pkParkFence(fix, a, fix, b, opt);
    };
    var edge = function (fix, from, to, axis, gateAt) {
      if (gateAt === null) { run(from, to, fix, axis); return; }
      run(from, gateAt - hw, fix, axis);
      run(gateAt + hw, to, fix, axis);
    };
    edge(Z0, X0, X1, 'z', sideZ === Z0 ? g.x : null);
    edge(Z1, X0, X1, 'z', sideZ === Z1 ? g.x : null);
    edge(X0, Z0 + 0.12, Z1 - 0.12, 'x', sideX === X0 ? g.z : null);   // the side runs stop just short of the corners
    edge(X1, Z0 + 0.12, Z1 - 0.12, 'x', sideX === X1 ? g.z : null);
    if (typeof pkLandArch === 'function') pkLandArch(g.x, g.z, g.along, land);
  }
  function pkExpansionFenceOpened() {
    for (var s = 0; s < PK_XP_STAGES.length; s++) {
      if (!pkExpansionOpen(PK_XP_STAGES[s].id)) continue;
      for (var j = 0; j < PK_XP_STAGES[s].lands.length; j++) {
        var L = PK_XP_LANDS[PK_XP_STAGES[s].lands[j]];
        if (L && !PK_XP_FENCED[L.id]) pkExpansionLandFence(L);
      }
    }
  }

  // ── Commissioning ────────────────────────────────────────────────
  // The check then pay shape of pkHire (part 03): the level first, then the bank, then the payment and the state.
  function pkExpansionCommission() {
    var st = pkExpansionNext();
    if (!st) { toast('Every stage is already open', 'good'); return 'Every stage is open'; }
    var E = pkExpState();
    if (E.stage === st.id && !pkExpansionOpen(st.id)) { toast(st.name + ' is already under construction', 'bad'); return 'Already commissioned'; }
    if (pkLevel() < st.level) { sfx('bad'); toast('Park level ' + st.level + ' is needed first', 'bad'); return 'Level ' + st.level + ' needed'; }
    if (S.bank < st.cost || S.bank < 0) { sfx('bad'); toast('Not enough money', 'bad'); return 'Not enough money'; }
    pay(-st.cost, 'Commission: ' + st.name);
    E.stage = st.id; E.commissioned = S.day; PK_XP_LOG.day = S.day;
    logEvent(st.name + ' commissioned - the work begins', 'good');
    toast(st.name + ': three days of construction', 'good');
    save(); screenDirtyAll(); hudDirty = true;
    return 'Commissioned';
  }

  // ── The clock ────────────────────────────────────────────────────
  // Called once per frame from pkTick (part 04). The land opens on the third night at 06:00 after the day of the
  // commission. The opened list is the once only latch: a reload finds the stage already open and does nothing.
  function pkExpansionTick() {
    var E = pkExpState();
    if (!E.stage) return;
    if (pkExpansionOpen(E.stage)) { pkExpansionFenceOpened(); return; }
    var st = pkExpansionStage(E.stage);
    if (!st) return;
    if (S.day !== PK_XP_LOG.day) {
      PK_XP_LOG.day = S.day;
      if (S.day > E.commissioned) logEvent(st.name + ': construction day ' + Math.min(PK_XP_BUILD_DAYS, S.day - E.commissioned) + ' of ' + PK_XP_BUILD_DAYS, '');
    }
    if (S.day >= E.commissioned + PK_XP_BUILD_DAYS && S.time >= PK_XP_OPEN_HOUR) {
      E.opened.push(st.id);
      logEvent('Third night: the land opens - ' + st.name, 'good');
      toast(st.name + ' is open', 'good');
      pkExpansionFenceOpened();
      // stage 1 only: the viaduct was drawn under construction at boot (nobody had commissioned it yet). Draw it
      // again now it is actually finished, same as pkXpViaduct draws it for a save that boots with stage 1 already
      // open - a reload is not the only way to see the real line.
      if (st.id === 1) {
        if (typeof pkXpViaduct === 'function') pkXpViaduct();
        if (typeof unbakeStatic === 'function' && typeof bakeStatic === 'function' && typeof baked !== 'undefined' && baked.meshes && baked.meshes.length) { unbakeStatic(); bakeStatic(); }
      }
      save(); screenDirtyAll(); hudDirty = true;
    }
  }

  // ── The tablet's one line ────────────────────────────────────────
  // Part 25 draws it in Park OS while the tablet is the screen, so the line is on the held tablet and never on the PC.
  function pkExpansionTabletLine() {
    var E = pkExpState();
    if (!E.stage || pkExpansionOpen(E.stage)) return '';
    var st = pkExpansionStage(E.stage);
    if (!st) return '';
    var d = pkExpansionDaysLeft();
    return st.name.toUpperCase() + ': ' + (d > 0 ? 'OPENING IN ' + d + (d === 1 ? ' DAY' : ' DAYS') : 'OPENS AT 06:00');
  }

  // ── For the scratch probes and the other parts ───────────────────
  var _pkExpPrevT = GAME.T;
  GAME.T = function () {
    var t = _pkExpPrevT();
    t.pkExpansionOpen = pkExpansionOpen;
    t.pkExpansionTick = pkExpansionTick;
    t.pkExpansionCommission = pkExpansionCommission;
    t.pkExpansionLandAt = pkExpansionLandAt;
    t.pkExpansionOpenedLandAt = pkExpansionOpenedLandAt;
    t.pkExpansionDaysLeft = pkExpansionDaysLeft;
    t.pkExpansionTabletLine = pkExpansionTabletLine;
    t.pkExpansionLandFence = pkExpansionLandFence;
    t.PK_XP_STAGES = PK_XP_STAGES;
    t.PK_XP_LANDS = PK_XP_LANDS;
    return t;
  };
