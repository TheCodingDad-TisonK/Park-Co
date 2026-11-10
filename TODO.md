# Park Co — the live to-do

One list for everything still open. Updated with every piece of work, in the same commit.
The full build-up history lives in the session handoffs (`PARK-CO-HANDOFF*.md` on the Desktop)
and in `CHANGELOG.md`; this file is the current source of truth for what is left.

**State:** `main` @ v1.7.7 (2026-11-10). Edit `src/` only, then `npm run build` (or `npm test`, which builds first) —
the game runs the generated `game/game.js`. No em dashes in anything shipped (lint gate); never edit `game/game.js`
or `node_modules/co-engine` by hand.

## Shipped in 1.7.7

- Performance: the bake detaches what it merges (81k scene nodes down to ~11k), painted props merge by colour into
  vertex-coloured batches, a car's shell merges but its lap bar stays its own part, booth cameras render at 4 Hz.
  About 6,400 draw calls a frame became about 3,500 in the same view.
- The sky dome fits inside the camera far plane: the hard circle in the sky is gone.
- The flower clock and the hedge maze are removed; the bandstand moved south to the new ride's forecourt.
- The Wild Hunt replaces Nocturne, The Wreck and Moonwood: 167 m, 26 m crest, 65 km/h, 6 cars, its own booth.
- The Log Flume is a timber mill (station house, water wheel, rock gorge); Baron's Drop has a gatehouse tower.
- Guests: coordinated outfit palettes, hats/glasses, slight height variation; arrivals spread over the forecourt and
  queued instead of built twenty at a time.
- The walk across the park: heap + octile A* with the engine's finder as the fallback; the Wild Hunt forecourt is paved.

## Still open

- [ ] Trains: the carriages of the Lindenburg Railway are still built from hundreds of meshes each. `pkMergeShell` could
      be applied to them with the doors and the clock hands kept out; that is the biggest single draw saving left.
- [ ] The moving-group merge (part 98, `pkMergeDynamic`) stays off: merging a group's own meshes welded the parts the
      game animates inside it (levers, keys, gates, doors, lap bars). Re-enable only with a way to know what a group's
      animation touches.
- [ ] Check the quality levels on the player's GPU: the dev box is draw-bound, so high/medium/low read 21/25/29 fps
      there. The draw counts (3,068 / 2,350 / 1,916 from the gate) are the honest measure of the work.
- [ ] Re-check in game: the flume's station house from the queue side; the Baron's gatehouse sightlines from the
      station; the Wild Hunt's gate canopies at night.
- [ ] The visual suite's shots are not in git; run `npm run visual` after a change to look at them.
