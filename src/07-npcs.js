//@ Park Co, part 07: the crowd - the people who are not here to ride, they are here to be here
  // ── The crowd ────────────────────────────────────────────────────
  // The engine's NPC system (CO.npcs) makes people from data: a character, a spawner on a clock, and a list of steps.
  // These are the wanderers and the staff. They do not queue and they do not buy: they walk, they look at the rides,
  // they sit by the midway and they drift home. The queuing guests are a different machine, in part 02.
  // Each visitor takes a tour of one part of the park and back (the spots are on the streets of every land), so the crowd is
  // spread over the whole park rather than the midway; the staff keep their own corners.
  function pkBuildNpcs() {
    var W = function (to, sec, r) { return [{ do: 'walk', to: to }, { do: 'wander', radius: r || 5, seconds: sec || 10 }]; };
    var tour = function (list) { var st = []; list.forEach(function (x) { st = st.concat(Array.isArray(x) ? x : [x]); }); return st.concat([{ do: 'walk', to: 'plaza' }, { do: 'leave' }]); };
    CO.npcs({
      characters: {
        visitorA: {          // the Fairground and the kids' garden
          names: ['Anna', 'Bram', 'Sanne', 'Daan', 'Lotte', 'Sem'],
          look: { shirt: '#3f6a9e', pants: '#2f3440', skin: '#d8a97c', hair: '#3a2a1c' }, speed: 1.35,
          steps: tour([W('midway', 8, 4), W('carousel', 12), { do: 'walk', to: 'fairCross' }, W('teacups', 10), W('kidsLane', 14), { do: 'say', text: 'Look at the little train!' }, W('snack', 6, 3)])
        },
        visitorB: {          // Thrills and the wheel
          names: ['Femke', 'Thijs', 'Noor', 'Jesse', 'Mila', 'Ruben'],
          look: { shirt: '#a8462f', pants: '#3a3f48', skin: '#e8c49b', hair: '#6b4a2a' }, speed: 1.28,
          steps: tour([W('midway', 8, 4), W('ferris', 10), { do: 'walk', to: 'thrillCross' }, W('dodgems', 14), { do: 'face', to: 'baron' }, { do: 'wait', seconds: 6 }, W('station', 6, 3)])
        },
        visitorC: {          // the Dark Woods, the drop tower and the show halls
          names: ['Omar', 'Yara', 'Sven', 'Iris', 'Timo', 'Eva'],
          look: { shirt: '#5b8a52', pants: '#2d333b', skin: '#c99266', hair: '#1e1712' }, speed: 1.42,
          steps: tour([W('fairCross', 4, 3), W('darkWoods', 14), W('dropTower', 10), { do: 'walk', to: 'promWest' }, W('halls', 12), { do: 'say', text: 'Such a nice little park.' }, W('gardenWalk', 10)])
        },
        visitorD: {          // Coaster Country and the East Walk
          names: ['Lars', 'Julia', 'Bas', 'Roos', 'Milan', 'Fleur'],
          look: { shirt: '#7a4a8a', pants: '#2b2f36', skin: '#e2b48a', hair: '#4a2f1c' }, speed: 1.45,
          steps: tour([W('thrillCross', 4, 3), W('coasterCountry', 12), { do: 'walk', to: 'promEast' }, W('eastWalk', 10), W('firebird', 12), { do: 'face', to: 'firebirdTrack' }, { do: 'wait', seconds: 8 }, W('dragon', 12), { do: 'say', text: 'That loop!' }, W('promEast', 6)])
        },
        visitorE: {          // the gardens: the Garden Walk, the flower clock, the bandstand and the maze
          names: ['Wim', 'Ellen', 'Jan', 'Ilse', 'Koen', 'Maud'],
          look: { shirt: '#c9a227', pants: '#3a3f48', skin: '#d39a72', hair: '#8a6a4a' }, speed: 1.2,
          steps: tour([W('fairCross', 4, 3), W('gardenWest', 8), W('gardenWalk', 12), W('clock', 14), W('bandstand', 16), W('maze', 10), W('promWest', 8)])
        },
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
        watcher: {
          names: ['Kees'], look: { shirt: '#4a5a6a', pants: '#2f3440', skin: '#e0b48e', hair: '#2a2a2a' }, speed: 1.05,
          steps: [{ do: 'walk', to: 'station' }, { do: 'face', to: 'coaster' }, { do: 'wait', seconds: 40 }, { do: 'walk', to: 'ferris' },
            { do: 'wait', seconds: 30 }, { do: 'walk', to: 'carousel' }, { do: 'wait', seconds: 30 }]
        }
      },
      spawners: [
        { id: 'crowdA', character: 'visitorA', x: -5, z: 26, every: 13, max: 6, hours: [9, 22] },
        { id: 'crowdB', character: 'visitorB', x: 5, z: 26, every: 15, max: 5, hours: [9, 22] },
        { id: 'crowdC', character: 'visitorC', x: 0, z: 24, every: 17, max: 5, hours: [9, 22] },
        { id: 'crowdD', character: 'visitorD', x: 3, z: 24, every: 17, max: 5, hours: [9, 22] },
        { id: 'crowdE', character: 'visitorE', x: -3, z: 24, every: 19, max: 4, hours: [9, 22] }
      ],
      workers: [
        { id: 'sweeper', character: 'sweeper', x: 0, z: 20, ry: 0, home: [0, 24], hours: [9, 22] },
        { id: 'sweeperNorth', character: 'sweeperNorth', x: 2, z: -44, ry: 0, home: [0, 24], hours: [9, 22] },
        { id: 'gardener', character: 'gardener', x: 4, z: -58, ry: 0, home: [0, 24], hours: [9, 22] },
        { id: 'watcher', character: 'watcher', x: 0, z: 2, ry: Math.PI, home: [0, 24], hours: [9, 22] }
      ],
      spots: {
        plaza: { x: 0, z: 26 }, gate: { x: 0, z: 28 }, midway: { x: 0, z: 14 }, station: { x: 0, z: 4 }, coaster: { x: 0, z: -2 },
        snack: { x: -11, z: 9 }, carousel: { x: -14, z: 19 }, ferris: { x: 13, z: 19 },
        fairCross: { x: -31, z: 3 }, teacups: { x: -40, z: 3 }, kidsLane: { x: -46.8, z: 36 },
        thrillCross: { x: 35, z: 3 }, dodgems: { x: 42, z: 3 }, baron: { x: 57, z: 19 },
        darkWoods: { x: -36, z: -24 }, dropTower: { x: -36, z: -52 }, promWest: { x: -20, z: -60 }, halls: { x: -46.5, z: -70 },
        gardenWest: { x: -28, z: -44 }, gardenWalk: { x: 2, z: -44 }, clock: { x: 6, z: -58 }, bandstand: { x: 2, z: -66 }, maze: { x: 9.5, z: -72 },
        coasterCountry: { x: 40, z: -24 }, promEast: { x: 50, z: -60 }, eastWalk: { x: 76, z: -20 },
        firebird: { x: 77, z: -36 }, firebirdTrack: { x: 100, z: -30 }, dragon: { x: 77, z: -92 }
      }
    });
  }
