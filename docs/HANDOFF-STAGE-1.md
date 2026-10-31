# Handoff: stage 1 status

Written 2026-10-30, after stopping every subagent at tison's instruction. Nothing is committed.

## State in one line
The expansion gate works and is probed. The Skyline is built and stands in the world. The tree does
not yet pass `npm test`: 5 checks fail, all of them queue-lane and booth integration for the Skyline.
The stage is **not** done and was **not** marked done.

## Branch and tree
`feat/expansion-stage-1` (created from `feat/booth-panels`). Uncommitted:
`docs/EXPANSION-PLAN.md` (signed), `game/game.js` (built), `src/01-park.js`, `src/02-guests.js`,
`src/04-ui.js`, `src/05-attractions.js`, `src/25-office-pc.js`, `src/46-world.js`,
`tests/park.smoke.js`, `tools/scratch/oneshot.js`, `tools/scratch/probe.js`, and new
`src/52-skyline.js`, `src/53-expansion.js`, `tools/scratch/sky-probe.js`, `tools/scratch/test-log.txt`.

## The five failing checks
1. every attraction has an operator booth and screen (skyline: no screen)
2. every booth: the shut door keeps you out, the open door lets you up the steps and in: skyline (could not get in)
3. twenty rides besides the main coaster: 21 (needs 22)
4. every ride has a fenced queue lane and a boarding gate (skyline: no lane)
5. the switchback rule: skyline 5.5x7.7

3 is a test expectation. 1, 2, 4 and 5 are one job: give the Skyline a proper ground-level plot,
queue lane and a booth whose door and steps work, at Woods Halt, without disturbing the deck.

## What was changed beyond the plan, and why
- `PK_LEVELS` extended from 7 to 34 levels (plan levels 26, 28, 30, 32, 34 have to exist).
  Approved by tison when asked.
- `pkGuestFloor` in part 52 and two call sites in part 02: guests cannot stand on a 15 m deck,
  and `pkFloor` is 2D and shared with the player.
- The gate is at Woods Halt only, because the other two stations are outside the park's nav.
  Raised with tison.

## Not done
Screenshots, the guest-route and pier-clash probes, release notes, and the `CHANGELOG.md`/`TODO.md`
updates (both only on request before a commit).

## Commands
```
cd "C:\Users\tison\Desktop\Park Co"
npm run build; npm run check          # both green right now
Remove-Item Env:ELECTRON_RUN_AS_NODE  # the shell sets it and electron will not boot with it
npm test                              # red: 5 failures above
```
