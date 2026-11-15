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
- The walk across the park: the engine's path finder, with a walk-along that stays on the paving (a heap A* was tried and dropped, it left the paving); the Wild Hunt forecourt is paved.

## Still open

- [x] Play test of the re-lay, 2026-11-13 (hidden window, key events, a frame every 2 s; harness in `tools/scratch/playtest.js`).
      Of the 19 rides (the coaster and the 18 others), 17 were boarded with E at their own entry and ridden to the end;
      the Arena was boarded but its show outlasted the run, and the Skyline could not be boarded. The Carousel's
      desk was worked from the chair. Flown by day and by night. Two traps found and fixed (Dragon Ride and Log Flume
      exits). What it left open:
- [x] Tracks: tison, 2026-11-13: "every single track of each ride can be MUCH better". Done 2026-11-14 for every ride on the
      coaster kit: the Serpent (201 m to 266 m, worst g 19.6 to 5.1), Baron's Drop (130 m to 204 m, 24.6 to 5.5), The Wild Hunt
      (299 m to 355 m, 9.9 to 4.8), the main coaster (303 m to 333 m, lap 43 s to 53 s, six cars and six station gates now,
      teardrop loop, rising helix), the Dragon Ride (522 m to 411 m per track, 9.3 to 4.1, off the railway and the fence), the
      Puffin Line (38 m to 52 m, a hill and a tunnel) and the Mountain King (left as is: 4.7 g with its real trim). Every one
      was played to the end. Shorter than the brief: Baron's (a fast turn needs 20 m or more of radius and the lawn is
      40 m by 20 m), the main coaster (333 m, not 380 to 420: an east helix overlaps its own approach lane and is too fast for its
      radius), the Wild Hunt (355 m, not 420), the Puffin Line (52 m, not 70 to 90: its lawn is 19 m by 12 m and the radius is 4.2 m).
      The Serpent's train stays at five cars and Baron's at four: neither station straight holds another. Not done: the Log
      Flume's channel (decision 9.3), Dream Flight and the Skyline are not kit tracks.
- [x] Dives corkscrewed: the frame builder spun the train round the track on every near-vertical stretch (the main coaster's
      and Baron's dives). It now holds the roll there.
- [x] The Skyline: the lift lobby's way to the platform was a 0.7 m gap for a walker and the walk-finder found none. The
      Woods Halt landing door is 2 m wide now and the gallery 4.1 m, and a player walks up the gallery, boards and rides a
      lap. (The harness's own walk-finder still cannot route up there; the plan walks the path by a collision check.)
      Done 2026-11-14 (decision 9.6): without stage 1 the lift refuses the ride up and says why.
- [x] Night: the park lamp switch only knew the lamps built before its first look. It looks again every 20 s. The fireflies
      are three times as many, glow (additive, 0.55 m) and 70 more follow the eye over the grass.
- [x] The Arena's exit: a full show was ridden to the end (357 s) and the player was set down at the old exit spot, a
      closed pocket he could not walk out of (no route in any direction). The exit moved to the open ground east of it
      (x CX + 34, z CZ + 11); a player set there walks to the park.
- [x] The Arena (decision 9.4, tison 2026-11-14: shorten board and run time): house closes after 20 s, boarding 45 s at most, show 255 s
      (was 291 s; the training and victory laps cut from 26 s to 8 s each). Not yet sat through in full after the change.
- [x] Looks: the timber of The Wild Hunt and the Dragon Ride is a mid brown and grey now; the Teacups rider's eye is at 1.62 m;
      the topiary is a clipped faceted shape; the doubled QUEUE board is gone (the QUEUE FROM HERE plate was removed).
- [ ] Looks left: the Dance Ride's line waits facing a stone pier (what would move: the entry prompt, about 3 m east, beside
      the line's first post; not moved without tison's word); in Dream Flight the guest on the same bench fills a third of
      the view (what would move: the rider's eye 0.25 m toward the aisle).
- [x] Play tested 2026-11-14 after the tracks: every ride on the kit (each to the end), the main coaster at night and in third person, the Arena, the Skyline, the carousel desk. Still not: a seat on a bench, sound, every desk but the Carousel's (the walk-finder leaves the player seated at a desk; the next desks need a stand-up step in the harness).
- [ ] The other waived clearances (part 54): the Dance Ride and the Arena (2.8 m), the Dance Ride and the coaster (7.9 m),
      Dream Flight and the Arena (4.7 m), and the viaduct piers beside the Dance Ride and the Arena.
- [x] The old ferris wheel plot (decision 9.5, tison: a new indoor kids' ride like Dream Flight): Teddy's Toy Tour stands there now (level 20),
      play tested to the end. Looks left: the roof reads pale in full sun, the interior has no sound yet, and a bench seat is untested.
- [x] The Log Flume's channel (decision 9.3, tison: way bigger and longer): 166 m a lap (was 94), a second pool, three long lanes; ridden to the end.
      It cannot be much longer: the lawn between the paths is 33 m by 50 m and the Dragon Ride and The Serpent need 8 m.
- [x] Notices (tison, 2026-11-14: "i don't need to see what rode and how much"): routine sale and ride lines are gone from the screen (part 60).
      "Rework the UI and notifications, every single element, the main menu too": done 2026-11-15 as part 62 (the Dusk Park skin over the
      start screen, HUD, prompt, toasts, feed, menus, settings, panels and the welcome card), plus the new loading screen (part 27 and index.html)
      and a Co Engine splash of about two seconds. Not touched: the 3D screens in the world (booths, the office PC and its apps).
- [ ] DUO and the platform boxes (2026-11-15): built and tested in headless runs (the box's buttons press with E; dispatch waits for the release; a player at the box becomes the second operator). Not yet play tested by a hired second operator over a long run, and the box position was checked from above for the Serpent, Baron's Drop and the Mountain King only; check every ride's box in your window. Dream Flight's DUO (the release lets the next gondola go) and the main coaster's are the least tested. The Arena and the Skyline have no platform box.
- [x] Editor (tison, 2026-11-15): the platform boxes and the two cabin booths can be moved in the editor (see CHANGELOG). Left: the control rooms of the Dance Ride, Dream Flight, the Arena and the main coaster are not separate items.
- [ ] Booths: "upgrade a lot every booth panel and the booth, an operator room feel": every booth, cabin and control room is dressed (part 66). The desk panels themselves are unchanged (already rich): ask him what he wants on them. Look at the Dance, Dream Flight and Arena rooms in play (only checked by lamp count).
- [ ] Look at the new UI in your own window: sizes at other resolutions and a very wide screen, the Changelog and Credits pages, and the
      save slots screen were not captured.
- [x] Commit (decision 9.1): tison commits himself; nothing is committed. Release notes are on the Desktop (PARK-CO-RELEASE-NOTES-1.8.2.md).
- [x] Dragon Ride (decision 9.2): confirmed, two mirrored tracks, shortened.
- [ ] Ride upgrades, first batch (the coaster, The Serpent, Baron's Drop): scenery, track lights, spray, mist, torches and
      sound are in (part 58). Still owed on these three: better track layouts, longer trains with realistic seat counts,
      and the price retune that goes with them. The sound has not been heard (headless runs are silent).
- [ ] Ride upgrades after that: Joris, Mountain King, teacups, Puffin Line, Skyline, Dance Ride and Dream Flight exteriors.
      Then expansion stages 2 to 5.

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

- [ ] Fullscreen on launch: the window shows windowed for a moment first. The cause is the engine shell (node_modules/co-engine/shell/main.js maximizes on ready-to-show while the game page is busy building the world); it is outside src/, so it needs an engine change.
