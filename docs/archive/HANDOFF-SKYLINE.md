# Handoff: The Skyline, stage 1 of the expansion plan (part 52)

Written 2026-10-30. All subagents are stopped. Nothing is committed. Branch: `feat/expansion-stage-1`.

## What was asked
Build stage 1 exactly as written in `docs/EXPANSION-PLAN.md` section 3 (and obey sections 1 and 8):
the finished viaduct as a new railway, three deck stations with stair towers, the Skyline Shuttle,
its booth and panel sheet, ride id `skyline` at park level 26. Then verify per section 1 rule 7 and
mark the stage done.

## What exists
`src/52-skyline.js` (642 lines, new, uncommitted). Top-level pieces:

| Area | Functions / data |
|---|---|
| Line | `PK_SKY_PTS` (the plan's `PK_XP_VIA`), `pkSkyLine`, `pkSkyAt`, `pkSkySOf`, `pkSkySide` |
| Stations | `PK_SKY_ST` (3), `pkSkyStationAt`, `pkSkyPlatformRun`, `pkSkyEastEdge`, `pkSkyPlatform` |
| Stair towers | `pkSkyTower`, `pkSkyGallery` |
| Deck floors | `PK_SKY_FLOORS`, `pkSkyFloorAt`, `pkGuestFloor` |
| Stock | `pkSkyLoco`, `pkSkyCoach` (2 x 16 seats), `pkSkyOffsets`, `pkSkyPlace` |
| Running | `pkSkylineTick` (three-station timetable), `pkSkyArrive`, `pkSkyDepart`, `pkSkyTick` |
| Boarding | `PK_SKY_WAY`, `pkSkySeatPath`, `pkSkyWalkOut` |
| Build | `pkSkyBuild`, `pkBuildSkyline`, `pkSkyLink`, `pkSkyForecourt` |

Integrations it made: `src/02-guests.js` (two `pkFloor` calls become `pkGuestFloor`),
`src/05-attractions.js` (one guarded line at the top of `pkAttrTick`: `if (a.skyline && ...) return;`),
`src/46-world.js` (finished viaduct when `pkExpansionOpen(1)`, long-span piers).

Probe evidence (headless, `tools/scratch/sky-probe.js`):
`has true, seats 32, level 26, booth true at (-56.2,-170), stations 3, vehicles 3`.

## What is broken (5 failing smoke checks, 206 passing)
`npm test` on this tree fails exactly these:
1. `every attraction has an operator booth and screen` - the Skyline booth exists but its screen is not registered (`a.boothScreen`).
2. `every booth: the shut door keeps you out, the open door lets you up the steps and in: skyline (could not get in)` - the cabin at (-56,-170) is unreachable from its door: check `pkRideBooth` door side, plinth and `pkBkFloorAt`, and that the booth is not inside the stair tower or a solid.
3. `twenty rides besides the main coaster: 21` - this check now needs 22 (the Skyline is the 22nd). One-line test fix.
4. `every ride has a fenced queue lane and a boarding gate` - no lane is drawn for the Skyline.
5. `the lanes fold into switchbacks, none longer than 8.5 m: ... skyline 5.5x7.7` - the plot `{x:-55.5,z:-45,r:6,q:[-55.5,-44.0]}` produces a lane block that fails the rule.

Probable shared cause for 4 and 5: the plot and its dressing were chosen for the station, not for a
laned queue, and `pkQueueLaneBetter` / `pkAttrLane` were never tuned for it. `PK_FLAT_STATIONS` has
no `skyline` entry (deliberate: the flat station dressing does not apply to a deck station).

## What was never done
- Screenshots (plan section 1 rule 7): no day/night shots of the ride, queue, booth or desk.
- Headless probes for guest routes into the queue and for no deck/pier clash.
- Any tuning of the three-station timetable: only Woods Halt boards (see below).
- Release notes to the Desktop.
- No commit, no tag.

## The one design conflict, already raised with tison
The plan says guests board at any station. Only Woods Halt (-61,-40) is inside the park's walkable
area; Skyline North (-60,-172) and Skyline South (-104,146) are outside it, and the ways into those
lands are stages 2 and 4. The build therefore has all three stations and stops at all three, but only
Woods Halt boards. Widening the nav is not done.

## How to resume
```
cd "C:\Users\tison\Desktop\Park Co"
npm run build && npm run check
# ELECTRON_RUN_AS_NODE is set in this shell and breaks electron; clear it first:
Remove-Item Env:ELECTRON_RUN_AS_NODE; npm test
```
`npm test` writes nothing on its own; pipe it to a file to read the FAIL lines.
