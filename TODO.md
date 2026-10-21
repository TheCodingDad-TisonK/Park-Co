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

**The look, for everything from here on (your call, 21 Oct): the Efteling vibe.** A fairy-tale park, not sheds with signs:
every ride, building and corner tells its own story - stepped Dutch gables, towers with pointed roofs, carved trim, warm
lamps, rich colour, planting and ornament, a themed entrance for every ride. Each item below is built to that.

- [x] 1. HUD: the pill now reads "Coaster: boarding (auto) · 16 of 16 rides open", and "Riding …" only while you are on one
- [x] 1b. Coaster control room: the coaster desk moved under the long window, facing the platform; the
      station desk with the CCTV moved to the north wall
- [x] 1c. Sit in the chairs: E on any booth, cabin or control-room chair sits you at the desk; E or a step stands you up.
      Chairs 25% bigger, seated eye higher; booth and cabin chairs turned to face their desks.
      Seated, E works the control you aim at (stands you up only when aiming at nothing); a chair never
      takes the aim from a control behind it
- [x] 1e. Gates open and shut any time the ride is in the station: no line needed, bars up or down; only a
      moving ride, a stop or the MAINT key holds them
- [x] 1d. Park Co HQ: three floors on the forecourt (Guest Services, Operations with the monitor wall, your
      office at the top with the management PC), a walkable stair. Parked, not polished: the floors show a
      scribble texture and the top floor's ceiling is too dark
- [x] 1f. Operator key on every ride's desk (booths, cabins, the coaster console): a keyswitch with a key;
      OFF = desk dead, gates locked, the ride will not board or run (AUTO too); ON = unlocked. Every key starts
      OFF (your call) - you go round and turn them on
- [x] 1g. Clock in at a ride's booth (a time clock by the door; the HUD shows where you are on duty; your own
      dispatches there earn a little more) and a light switch for the booth's lights (they start off)
- [x] 2. Every coaster's station dead level, straight and unbanked where the train stands
      (was: Serpent 60° bank / 27° slope, Baron 17°, indoor 37–44°, Puffin 42°; now all ≤ 0.5°)
- [x] 3. New outdoor tracks: The Serpent (18 m lift, big drop, turnaround, camelback, both loops),
      Baron's Drop (keep lift, dive and tunnel; new south-east run; fix its hairpin approach),
      Puffin Line (bigger loop, straight station)
- [x] 3b. Speed test on every ride, tuned to real rides. Coasters now run on physics (station tyres, chain lift
      at 9 km/h, speed from the drop with friction, a brake run): the coaster 53 km/h / 25 s lap (was 62 / 11 s),
      Serpent 64 km/h / 34 s (was 108 / 15 s), Baron 70 / 27 s (was 84 / 12 s), indoor 32-35 / ~20 s, Puffin 6 km/h.
      Ferris wheel one slow turn in 45 s (1.3 rpm), dodgems up to ~8 km/h, drop tower a true free fall to 63 km/h
      with a hold at the top and no bounce (was 118). Also fixed on the way: the tracks' roll wound up round the
      lap (the Serpent's lift was ridden 134° on its side, the indoor lifts ~120°); every lift is upright now,
      turns bank by speed, loops invert, Baron crests upright
- [x] 4a. Guests you can see: every new guest was made but never put in the world, so the crowd walked, queued and rode
      unseen (only the odd one recycled from the pool showed). Fixed. Also: a ride whose key is OFF now takes a line (the guests
      wait for it to open and give up after 1-3 minutes), up to 90 guests (was 40) arrive faster and ride up to four times
- [x] 4. Indoor coasters bigger and better looking: the halls are 31.5 m deep (was 15.5) and 14 m tall (was 9), the north
      fence moved back to z -118 with trees behind the halls. New circuits 117-141 m (were 70-84), an 11 m lift (was 6.4),
      up to 45-47 km/h, laps 27-30 s, all under 4.5 g: Nocturne's turn-and-a-half helix round a bigger moon, The Wreck's
      figure-eight round a bigger ship, Moonwood's camelback and three-quarter ring under the crown. Fairy-tale fronts after
      Efteling (stepped gable, towers, emblem, marquee); a starfield, a sea floor and lanterns, fireflies inside
- [x] 4c. The main coaster made far better (your call, 21 Oct: keep it in the middle): a 303 m looper filling its yard (was
      a 141 m oval). 20 m lift, a steep drop into a 14 m vertical loop, a high banked turnaround, camelbacks under the lift, a
      corkscrew, a trim brake; 67 km/h, 48 s lap, at most 4.6 g. The train now banks and inverts (it had no roll at all). The
      track kit gained loops, corkscrews and trim brakes, and no coaster stands a leg up through its own loop or a lower pass
- [x] 4b. Queue lanes fold into switchbacks: rows of up to six slots, an odd number of rows (the entry stays at the outer
      end), centred on where the straight lane stood. The longest lane is 6.6 m (the ferris wheel's was 18.6 m, the teacups'
      and dodgems' 14.4); guests walk the rows slot by slot, never through a fence
- [x] 5. A station for every flat ride (carousel, teacups, ferris, dodgems, drop tower, the two kids' rides): a solid ring of
      ornamental iron fence round the ride with the booth set into it, an entrance facing the line under a pointed-roof porch
      with the name and lanterns (a low arch under the kids' canopies and the dodgems' eaves), a separate EXIT round the ring
      where riders come off. The flume and the haunted manor keep the stations they have
- [ ] 6. Guests arrive by car: drive in off the road, park in a free bay, get out, queue at the
      ticket window, walk in; and go home the same way. More guests in the park
- [ ] 7. The desk panels made even better (booth desks; the coaster console too)
- [ ] 8. The whole park in the Efteling vibe: a pass over every ride's surroundings and entrance, the gate and the ticket
      windows, the shops and stands, the lamps, the signs, the paths and the planting, so the park reads as one fairy tale
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
- [ ] The coaster yard is paved wall to wall by three copies of the station apron you (or an earlier session) placed in the
      editor (`00-world.js`: wc-mvhzvjn6-14, wc-mvhzv6j3-13, wc-mvgv2tw3-6). Keep the paving, or turn the yard into a garden
      under the coaster (lawn, beds, a pond under the loop) in the Efteling way? I left it alone
- [ ] Play it hands-on: everything here is checked by the smoke suite and screenshots, not by playing
