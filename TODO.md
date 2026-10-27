# Park Co — the live to-do

One list for everything still open. Updated with every piece of work, in the same commit.
The full build-up history lives in the session handoffs (`PARK-CO-HANDOFF*.md` on the Desktop)
and in `CHANGELOG.md`; this file is the current source of truth for what is left.

**State:** `main` @ v1.0.16 (2026-10-25). Everything through the 0.2.x and 1.0.x sessions is shipped.
Edit `src/` only, then `npm run build` (or `npm test`, which builds first) — the game runs the
generated `game/game.js`. No em dashes in anything shipped (lint gate); never edit `game/game.js`
or `node_modules/co-engine` by hand.

## Shipped (through v1.0.16)

- Park layout (hub + four lands), the garden walk, food plaza, car park and ticket offices
- 20 rides: the main coaster, the Serpent, Baron's Drop, Puffin Line, three indoor coasters
  (Nocturne, The Wreck, Moonwood), The Dragon, The Firebird, The Mountain King, and the flat rides
- The Lindenburg Railway (route, 5 stations, 3 level crossings, rolling stock, train logic)
- The Lindenburg Arena (Raveleijn-style show, control room, cast, cue lights)
- Guests: arrivals by car, ticketing, turnstiles, queue lanes, ride AI, litter/bins/sweepers, idle life
- Operations: operator booths, gate/power/lighting control, economy, workforce (10), HQ office, tablet
- Tools: third-person camera (C), fly mode (F3), dev menu (F4)
- CI (tests + release on tag), smoke suite (203 checks)

## Loose ends

Carried forward from the session handoffs — re-verify each against v1.0.16 before trusting it is still open.

### Look at in-game (from the 10-23 handoff)
- [ ] The Arena: sightline from the chair through the window; the great curtain closed and gathered;
      the hydra's heads clearing the spire/towers/gables; the horses and riders' seat; the Count on the
      moat lift; the Keeper on the balcony; spot targets; fire on the braziers
- [ ] The guest-life arm poses (phone and cigarette) — still unseen
- [ ] The arena's queue is unfenced (lane fences are only built for `PK_THEME` rides)

### Balance / budget (from the 10-23 handoff)
- [ ] The arena adds 8 point/spot lights plus the room light — check the light budget
- [ ] Whether 35% show call and 120 s doors fill the arena the way you want (there is no operator AI for it)

### Verify by hand (from the 10-22 handoff)
- [ ] The 19-breaker park services cabinet: both columns fit the door, handles throw, gauges read
- [ ] All four turnstiles in play: arms at waist height, only turning as the guest reaches the bars
- [ ] The welcome card: open a fresh save, close it every way, reload and confirm it stays gone
- [ ] Dead-hardware pass: each breaker off darkens the panel, lamps, gauges and controls; restore brings
      back the previous light-switch position
- [ ] Booth glazing reads clearly in daylight and at night
- [ ] Queue displays in live play: The Dragon shows 0 while its lane is empty, then counts as guests step on
- [ ] Manual coaster unload: train comes home bars-down/gates-shut; BARS UP releases, GATES boards, BELL rings
- [ ] Older: the plant-room gate toggle, a real mouse play-test of the tablet, the Mountain King entrance gap

### Known issues
- [ ] The teacups "manual boarding waits for the guest to reach a seat" smoke check fails about one run in
      four (pre-existing, intermittent — needs a dedicated look)

### Pre-existing world bugs
- [ ] The catalogue `pkBin` stands on the same spot as a midway bin at (-6, 26)
