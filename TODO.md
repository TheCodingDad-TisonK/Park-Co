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

- [ ] Quality levels: verify high / medium / low on a real GPU and tune the cull distances (the three now differ in
      draw distance and tree density, but the frame is draw-call bound, so the gap is smaller than it should be).
- [ ] Pathing: the heap finder still gives up on some long routes (it falls back to the engine's). Find out why and
      raise `NAV.steps`.
- [ ] The moving-group merge (part 98, `PK_MERGE_DYNAMIC`) is off: merging a group's own meshes welded the parts the
      game animates inside it (levers, keys, gates, doors, lap bars). Re-enable only with a way to know what a group's
      animation touches.
- [ ] The trains' carriages are still built from hundreds of meshes each; `pkMergeShell` could be applied to them with
      the doors kept out.
- [ ] Re-check in game: the flume's station house from the queue side; the Baron's gatehouse sightlines from the
      station; the Wild Hunt's gate canopies at night.
