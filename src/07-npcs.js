//@ Park Co, part 07: the people who work here - the staff and the guards. The guests are part 02's: they come by car, pay at the window, queue and ride
  // ── Who walks the park ────────────────────────────────────────────
  // The engine's NPC system (CO.npcs) makes people from data: a character, a worker with a post and hours, and a list of steps.
  // The park's only visitors are its guests (part 02), so everyone here works: the sweepers and the gardener keep their
  // corners, two guards walk a beat (the south lands and the north and east), a guard keeps the car park's barrier, and a
  // cashier stands behind the counter of each ticket office while a clerk is on the payroll.
  var PK_CASHIERS = ['cashierWest', 'cashierEast'];
  function pkBuildNpcs() {
    var W = function (to, sec, r) { return [{ do: 'walk', to: to }, { do: 'wander', radius: r || 5, seconds: sec || 10 }]; };
    var go = function (to, wait) { return wait ? [{ do: 'walk', to: to }, { do: 'wait', seconds: wait }] : [{ do: 'walk', to: to }]; };
    var beat = function (list) { var st = []; list.forEach(function (x) { st = st.concat(x); }); return st; };
    var guard = { shirt: '#23324a', pants: '#1b2230', skin: '#d8a97c', hair: '#2a2a2a' };
    var cashier = { shirt: '#b8362b', pants: '#2f3440', skin: '#e8c49b', hair: '#6b4a2a' };
    var STAFF = [9, 22], GUARDS = [8.5, 22.5];
    CO.npcs({
      characters: {
        sweeper: {
          names: ['Piet'], look: { shirt: '#e0a92c', pants: '#2f3440', skin: '#d8a97c', hair: '#5a5a5a' }, speed: 1.1,
          steps: [].concat(W('midway', 25, 9), W('plaza', 20, 6), W('snack', 18, 5))
        },
        sweeperNorth: {
          names: ['Joop'], look: { shirt: '#e0a92c', pants: '#2f3440', skin: '#c99266', hair: '#3a3a3a' }, speed: 1.1,
          steps: [].concat(W('gardenWalk', 30, 9), W('promWest', 25, 8), W('promEast', 25, 8))
        },
        gardener: {
          names: ['Truus'], look: { shirt: '#4d7a3a', pants: '#3a2f24', skin: '#e0b48e', hair: '#b8b8b8' }, speed: 1.0,
          steps: [].concat(W('clock', 40, 6), W('maze', 30, 5))
        },
        // the south beat: the plaza, the midway, the Fairground and the Thrills
        guardSouth: {
          names: ['Marco'], look: guard, speed: 1.15,
          steps: beat([go('plaza', 10), W('midway', 10, 3), go('fairCross', 6), go('teacups', 8), go('fairCross'), go('station'), [{ do: 'face', to: 'coaster' }, { do: 'wait', seconds: 8 }],
            go('thrillCross', 6), go('dodgems', 8), go('thrillCross'), go('midway')])
        },
        // the north beat: the Dark Woods, the halls, the gardens, Coaster Country and the East Walk
        guardNorth: {
          names: ['Ingrid'], look: guard, speed: 1.15,
          steps: beat([go('gardenWalk', 8), go('darkWoods', 6), go('dropTower', 6), go('promWest'), go('halls', 8), go('promWest'), go('bandstand', 6),
            go('promEast'), go('coasterCountry', 6), go('eastWalk'), go('firebird', 6), go('dragon', 8), go('promEast'), go('gardenWalk')])
        },
        // the car park: beside the barrier, watching the cars come in off the road
        guardGate: {
          names: ['Henk'], look: guard, speed: 1.0,
          steps: [{ do: 'walk', to: 'post' }, { do: 'face', to: 'lotDrive' }, { do: 'wait', seconds: 60 }]
        },
        // behind the counter, facing the window and the line
        cashierWest: { names: ['Sophie'], look: cashier, speed: 1.2, steps: [{ do: 'walk', to: 'post' }, { do: 'wait', seconds: 120 }] },
        cashierEast: { names: ['Tom'], look: cashier, speed: 1.2, steps: [{ do: 'walk', to: 'post' }, { do: 'wait', seconds: 120 }] }
      },
      spawners: [],
      workers: [
        { id: 'sweeper', character: 'sweeper', x: 0, z: 20, ry: 0, home: [0, 24], hours: STAFF },
        { id: 'sweeperNorth', character: 'sweeperNorth', x: 2, z: -44, ry: 0, home: [0, 24], hours: STAFF },
        { id: 'gardener', character: 'gardener', x: 4, z: -58, ry: 0, home: [0, 24], hours: STAFF },
        { id: 'guardSouth', character: 'guardSouth', x: 0, z: 26, ry: 0, home: [0, 24], hours: GUARDS },
        { id: 'guardNorth', character: 'guardNorth', x: 2, z: -44, ry: 0, home: [0, 24], hours: GUARDS },
        // the gate guard comes out of HQ's door on the forecourt; the cashiers are at the counter (no hours of their own: the
        // frame hook below brings them in and sends them off with the clerk and the opening hours)
        { id: 'guardGate', character: 'guardGate', x: -4.6, z: 71.7, ry: Math.PI / 2, home: [-16.6, 42.5], hours: [7.5, 23] },   // by the barrier's post, past the bays and clear of the lane in
        { id: 'cashierWest', character: 'cashierWest', x: PK_BOOTHS[0].x - 0.55, z: PK_BOOTHS[0].z + 0.8, ry: 0 },
        { id: 'cashierEast', character: 'cashierEast', x: PK_BOOTHS[1].x - 0.55, z: PK_BOOTHS[1].z + 0.8, ry: 0 }
      ],
      spots: {
        plaza: { x: 0, z: 26 }, gate: { x: 0, z: 28 }, midway: { x: 0, z: 14 }, station: { x: 0, z: 4 }, coaster: { x: 0, z: -2 },
        snack: { x: -11, z: 9 }, carousel: { x: -14, z: 19 }, ferris: { x: 13, z: 19 },
        fairCross: { x: -31, z: 3 }, teacups: { x: -40, z: 3 }, kidsLane: { x: -46.8, z: 36 },
        thrillCross: { x: 35, z: 3 }, dodgems: { x: 42, z: 3 }, baron: { x: 57, z: 19 },
        darkWoods: { x: -36, z: -24 }, dropTower: { x: -36, z: -52 }, promWest: { x: -20, z: -60 }, halls: { x: -46.5, z: -70 },
        gardenWest: { x: -28, z: -44 }, gardenWalk: { x: 2, z: -44 }, clock: { x: 6, z: -58 }, bandstand: { x: 2, z: -66 }, maze: { x: 9.5, z: -72 },
        coasterCountry: { x: 40, z: -24 }, promEast: { x: 50, z: -60 }, eastWalk: { x: 76, z: -20 },
        firebird: { x: 77, z: -36 }, dragon: { x: 77, z: -92 },
        lotDrive: { x: 0, z: 74 }
      }
    });
  }
  // the cashiers work while the park has a clerk and the windows are open (08:30 to 22:00). They stand in a shut room the
  // route finder cannot walk into, so they are at the counter when the shift starts and gone when it ends, not walked there
  hook('frame', function () {
    if (typeof NPCS !== 'object' || !NPCS.workers) return;
    var on = !!S.clerk && S.time >= 8.5 && S.time < 22;
    NPCS.workers.forEach(function (w) {
      if (PK_CASHIERS.indexOf(w.id) < 0) return;
      w.off = !on;
      if (w.off) npcList.slice().forEach(function (n) { if (n.worker === w) npcRemove(n); });
    });
  });
