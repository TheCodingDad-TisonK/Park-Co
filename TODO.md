# Park Co — the live to-do

One list for everything asked for. `[x]` is done, merged into `development` and checked
(smoke tests + screenshots); `[~]` is in progress; `[ ]` is not started yet. Updated with
every piece of work, in the same commit.

Nothing below is in the installed game (the Desktop shortcut runs the old 0.1.1 install).
To see it: open this folder in the Co Engine editor, or `npm run dev`.

## Done

- [x] Git: `main` holds the 0.1.1 baseline, work lands on feature branches merged into `development`
- [x] Park layout: hub + four lands (arches, tinted paths, signposts), the Garden Walk and food plaza
      through the middle, the lake gone
- [x] The main coaster pulled into its own fenced yard behind the station; guests walk round it
- [x] Kids' garden inside the park fence, with its own lane (Wobbly Pots and Puffin Line were unreachable)
- [x] Smoke check: every ride can be walked to from Station Square
- [x] Indoor coasters: a separate track each (the shared one was broken), cabin at the platform end
- [x] Ride booths rebuilt inside and out: signal tower, camera, LED wait board, control cabinet with
      meters, lamp column, lamp test, horn, cycle counter and a RUN/MAINT key switch, CCTV monitors
- [x] Booth doors are real (E opens/shuts, they block when shut) and every booth can be walked into
- [x] Flower beds, lamps, bunting, festoons and flag poles round the rides are movable in the editor
- [x] AUTO fixed: the coaster no longer flaps its restraints; flat rides no longer freeze on a long queue
- [x] The coaster's control room rebuilt inside and out (equipment bay, lift drive, PLC rack, track
      mimic, station desk with CCTV, staff corner); door wall fixed; AUTO warns when a service is due
- [x] README brought up to date

## Next, in this order

- [x] 1. HUD: the pill now reads "Coaster: boarding (auto) · 16 of 16 rides open", and "Riding …" only while you are on one
- [x] 1b. Coaster control room: the coaster desk moved under the long window, facing the platform; the
      station desk with the CCTV moved to the north wall
- [x] 1c. Sit in the chairs: E on any booth, cabin or control-room chair sits you at the desk; E or a step stands you up
- [~] 2. Every coaster's station dead level, straight and unbanked where the train stands
      (measured: Serpent 60° bank / 27° slope, Baron 17°, indoor 37–44°, Puffin 42°; main coaster OK)
- [ ] 3. New outdoor tracks: The Serpent (18 m lift, big drop, turnaround, camelback, both loops),
      Baron's Drop (keep lift, dive and tunnel; new south-east run; fix its hairpin approach),
      Puffin Line (bigger loop, straight station)
- [ ] 3b. Speed test on every ride: top speed and lap time on the coasters, spin rate on the flat rides,
      against real rides; tune the ones that are far too fast or too slow
- [ ] 4. Indoor coasters bigger and better looking: bigger, taller halls (north fence moves back),
      longer tracks, proper facades and theming
- [ ] 5. A proper station for every flat ride: platform, entry and exit, gates, canopy, sign
- [ ] 6. Guests arrive by car: drive in off the road, park in a free bay, get out, queue at the
      ticket window, walk in; and go home the same way. More guests in the park
- [ ] 7. The desk panels made even better (booth desks; the coaster console too)
- [ ] 8. The park office as a big building with floors; the top floor is your office
- [ ] 9. More full coasters like the main one, each with its own big control room
- [ ] 10. One big coaster that runs partly indoors and partly outdoors
- [ ] 11. Odd-angle audit of the whole park: overlaps, floating things, odd placement — and fix them
- [ ] 12. Ferris wheel / Baron's Drop pads overlap by ~1 m
- [ ] 13. Cleanup: delete old installers in `dist/` and the Desktop zip (the zip is an 18 Oct backup that
      git does not have — your call), move the old TODO-*.md files and one-off probes out of the root
- [ ] 14. New installer (0.2.0) so the Desktop shortcut runs the new park

## Waiting on you

- [ ] "The controls of the coaster seem messed up": in my tests the console works end to end (gates,
      load, bars, dispatch, home, AUTO). What exactly looks wrong?
- [ ] Moving the main coaster into the north-east (the layout map) — still wanted now that more
      coasters are coming (item 9), or keep it at the station?
- [ ] Play it hands-on: everything here is checked by the smoke suite and screenshots, not by playing
