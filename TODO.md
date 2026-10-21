# Park Co — the live to-do

One list for everything asked for. `[x]` is done, merged into `development` and checked
(smoke tests + screenshots); `[~]` is in progress; `[ ]` is not started yet. Updated with
every piece of work, in the same commit.

Release 0.2.1 (21 Oct) carries everything below that is ticked. Its installer is `dist/Park-Co-Setup-0.2.1.exe`.
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
- [x] 6. Guests arrive by car: a car (1-4 guests) comes along the road, the barrier lifts, it drives up the drive and along the
      aisle into a free bay (41 bays); the party gets out and walks to the ticket windows. At the end of their day they walk
      back, get in, the car backs out and drives away. The lot fills through the morning and empties at closing; the static
      parked cars are gone. Up to 110 guests (was 90). Cars wait for the one in front and never lock up
- [x] 7. The desk panels made better: a hooded status bank on every desk. Booths: six backlit legend windows (KEY ON, AUTO,
      GATES OPEN, BARS LOCKED, RIDE RUNNING, FAULT/MAINT flashing) and an LED readout (queue, riders, time to the end of the
      cycle). The coaster console: a train-position mimic (station, lift, drop and loop, turn and hills, corkscrew, brakes)
      and an LED readout (speed, lap time, riders, queue)
- [x] 8. The whole park in the Efteling vibe (first pass): every path lamp is a deep-green cast-iron lantern with a scrolled
      bracket and a glazed lantern under a little spire; every black sign board is a painted green board in a gilt frame with
      cream-gold lettering; the gate has two towers with pointed slate roofs and a stepped gable with a clock; the land
      arches and the ticket windows have spires; the coaster station has a slate roof, a scalloped valance and a clock
      turret. With items 4 and 5 (the halls' fronts, the flat rides' porches) the park reads as one tale. Not touched: the
      ride booths' striped tent roofs (fairground style already), the coaster control room and the parked HQ
- [x] 9. Two more full coasters, each with its own control house: the park grows east (fence x 72 to 123) with the East Walk
      off the North Promenade. The Dragon (double looper: 21 m lift, a 14 m loop and a tighter second one, 326 m, 69 km/h,
      52 s) and The Firebird (20 m lift, a falling helix, a corkscrew, 299 m, 58 km/h, 47 s), both under 4.8 g. Each has a
      slate-roofed platform canopy and a control house with the full cabin kit (desk and status bank, monitors, cabinet,
      status board, time clock, lights), brick plinth, slate roof and turret
- [x] 9b. The crowd walks the whole park (it only went round the midway: every spot it knew was within 14 m of it): five
      kinds of visitor, each touring a land and back (the Fairground and kids' garden, Thrills, the Dark Woods and the
      halls, Coaster Country and the East Walk, the gardens), up to 25 at a time, and a sweeper and a gardener up north
- [x] 9c. Nobody reached the rides when nobody sold tickets (your save: day 20, no clerk, so every guest waited at the window
      while you ran a booth). A self-service machine beside each window now sells to the front of the line after 6 s when
      the window is not staffed and you are not at it. In your current game: flip TICKET WINDOW to staffed on the park
      services board, or hire the clerk
- [x] 9d. The two ticket windows are proper buildings now (your ask, 21 Oct): timber-framed ticket offices on a brick
      plinth under the slate spires, side windows with flower boxes, a real door with a lantern over it. Inside: the counter
      under the front window (till, ticket printer, bell, the window's screen), a chair, a safe, shelves of ticket rolls, a
      noticeboard, a wall clock, a pendant lamp. The machine is on the outer wall
- [x] 10. The Mountain King, the indoor/outdoor coaster, in the south-east corner the park now takes in (the fence east of the
      car park moves from z 30 to z 71; the East Walk runs on south to it). A castle hall (34 x 29 m, 13 m, four towers
      with spires, battlements, a stepped gable over the west door) holds the station, a control cabin and the dark finale.
      The chain lift carries you out through a portal high in the north wall to 20.5 m, then a drop into a 14.9 m loop, a
      high turnaround, camelbacks, the block brake, and back in through a low portal to spiral down round the Mountain King
      on his throne among glowing crystals. 269 m, 68 km/h, 53 s, at most 4.7 g
- [x] 10b. The paths and the ground corrected across the whole park (your answer, 21 Oct: "the entire pathing and ground should
      be corrected, it's still all over the place"): every paved area, route and plaza laid on one plan, no stray slabs,
      overlaps or gaps, the coaster yard included. Done: 28 editor entries that had moved or copied paving slabs all over
      the park are gone (the forecourt had been dragged west of the teacups; eight station-apron copies paved the coaster
      yard and spots up to the flume; five forecourt copies covered the kids' garden). The ground is laid from code on one
      plan: Station Square stops at the yard fence, the snack apron sits under the snack stand, the HQ has a step out to the
      forecourt, the kids' lane is shown again, and the coaster's yard is a garden (lawn, beds, shrubs, a gravel service path)
- [x] 10c. Editor: every piece of a ride's dressing is its own item (your ask, 21 Oct): the gateway, each bunting run, the
      decoration, and the flat rides' station fence, entrance and exit can each be selected, moved, turned, copied or
      deleted on their own (the pad and the queue lane stay with the ride: guests walk the lane). The ticket offices are
      editable items now too
- [x] 10d. Editor: leaving Scene mode for Game mode puts you down where the scene camera was (on the floor under it, facing
      the way it faced, nudged off any wall), not back where you started (your ask, 21 Oct). Only with the editor attached
- [x] 11. Odd-angle audit: a sweep for overlapping things and screenshots round the park. Found and fixed: every small
      prop built as a group (lamps, benches, bins, beds, hedges, stalls, booths) left its collision behind when moved or
      deleted in the editor, an invisible wall; they now take it with them. The route lamps and benches no longer land on
      each other (three did). The stray paving was 10b. The kids' rides' pads overlap on purpose (one patch)
- [x] 12. Ferris wheel / Baron's Drop: the ferris pad is smaller (1.15 of its radius, was 1.25), clear grass between them
- [x] 13. Cleanup: the old installers (0.1.0, 0.1.1) and the unpacked build gone from `dist/`; the Desktop zip (the 18 Oct
      backup) deleted (your OK, 21 Oct); the old TODO files moved to `docs/archive/`, the scratch probes (oneshot, probe,
      diag, station) to `tools/scratch/`; the co-author lines stripped from every earlier commit (your OK; backup tags
      `backup/before-coauthor-strip-*` keep the old history)
- [x] 14. Installer 0.2.1 built (`dist/Park-Co-Setup-0.2.1.exe`); `main` carries the release (your editor tagged v0.2.0 and v0.2.1). Run it (with the game
      closed) and the Desktop shortcut opens the new park

## Waiting on you

