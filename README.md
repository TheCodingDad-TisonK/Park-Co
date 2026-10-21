# Park Co

A small theme park on Co Engine. Guests arrive from the car park, buy a ticket at a window, pass a turnstile and pick a ride: the coaster, or any of the fifteen rides in the park's four lands. You work the window and the coaster: sell the tickets, open the gates, watch the queue file in, pull the restraints down, dispatch, and pull the lever when you would rather the ride ran itself.

```
npm install        # fetches the engine at the tag named in package.json, and Electron
npm run build      # puts three.js beside the page, joins the engine parts and src/ into game/game.js
npm start          # the desktop window
npm run dev        # the same, linked to the Co Engine editor from the first frame
npm test           # the check script, then the smoke in a hidden window
```

Or open this folder in the Co Engine editor: it builds, runs and tests it from there, and links to the running game.

## The park

A hub and four lands. The midway runs from the gate to **Station Square**, where the coaster's station stands like the castle at the end of the street. A ring of streets joins the lands, and the Garden Walk cuts across the middle, so there are no dead ends and no long walks past nothing.

- **The gate** at the south, with four turnstiles and a fence either side, so the only way in is a turnstile. **Two ticket offices** outside it, little timber-framed houses under slate spires you can walk into through the side door: the counter under the front window with the till, the ticket printer and the window's screen, a chair to serve from, a safe, shelves of ticket rolls, a noticeboard, a clock and a pendant lamp. Press E at the window to serve the guest at the front of the line; a self-service machine on the outer wall sells when nobody staffs the window.
- **The coaster**: a 303 m looper that fills its fenced yard behind the station. A 20 m chain lift up the east side, a steep drop along the north fence into a 14 m vertical loop, a high banked turnaround, camelbacks across the middle under the lift, a turn at the east fence, back under the lift into a corkscrew, a trim brake and home: 67 km/h at the top, a 48 s lap, at most 4.6 g. The train banks into the turns and goes properly upside down in the loop and the corkscrew. Three cars of four seats, a fenced queue lane beside the platform, and the operator's room east of it with the full desk.
- **The flat rides' stations**: every flat ride (the carousel, the teacups, the ferris wheel, the dodgems, the drop tower and the two kids' rides) stands in its own ring of ornamental iron fence with gold finials, its booth set into the ring, an entrance toward the line under a little pointed-roof porch with the ride's name and lanterns (a low arch where the ride's own canopy leaves no room), and a separate exit round the ring with an EXIT board, where the riders come off.
- **The queue lanes**: every ride's line folds into switchbacks (rows of up to six, an odd number of rows so the entry is at the outer end) under the ride's gateway arch, so a line takes a block no wider than the old straight lane and at most 6.6 m long (the ferris wheel's was 18.6 m). Guests walk the rows slot by slot and shuffle up as the line moves.
- **The east strip**: the park reaches east to x 123 for two more full coasters, each in its own fenced yard down the East Walk (reached from the North Promenade), with a slate-roofed station canopy and a control house beside the platform (the halls' cabin kit, bigger: the desk with its status bank under a long window over the platform, monitors, the cabinet, the status board, a turret on the roof). **The Dragon** is a double looper: a 21 m lift, a big drop into a 14 m loop, a high turnaround, camelbacks and back through a second, tighter loop (326 m, 69 km/h). **The Firebird** dives from its 20 m lift along the far fence into a falling helix, then camelbacks and a corkscrew (299 m, 58 km/h).
- **The Mountain King**: the indoor/outdoor coaster in the south-east corner, at the end of the East Walk. A stone castle hall with four spired towers holds the station; the chain lift carries the train out through a portal high in the north wall to 20.5 m, into a 14.9 m loop, a high turnaround and camelbacks, then back in through a low portal into the dark to spiral round the Mountain King on his throne among glowing crystals (269 m, 68 km/h, 53 s).
- **The Fairground** (south-west): the carousel, the teacups, and the kids' garden with the Little Roundabout, Wobbly Pots, the Puffin Line and the playhouse, down the kids' lane.
- **Thrills** (south-east): the ferris wheel, the dodgems and Baron's Drop.
- **The Dark Woods** (north-west): the haunted manor, the drop tower, and the Nocturne and The Wreck show buildings.
- **Coaster Country** (north-east): the log flume, The Serpent and the Moonwood show building.
- **The indoor coasters** stand in three show halls along the north fence, 24 × 31.5 m and 14 m tall, with fairy-tale fronts in the Efteling manner (a stepped gable with a lit round window, a pointed tower and a corbelled turret, the ride's emblem, a marquee board and bulbs). Inside, each climbs an 11 m chain lift up the far wall, dives along the back and flies its own 117–141 m circuit round its own centrepiece at up to 45-47 km/h: Nocturne U-turns up to the moon and spirals a turn and a half down round it under a starfield; The Wreck flies a figure-eight round the ship, high through the crossing the first time and low the second; Moonwood runs a camelback up the portal side and three quarters round the trunk under the crown, back under its own way in. Each has a control cabin at the end of its platform.
- **The Garden Walk** across the middle, with a food plaza looking over the fence at the coaster's drop, and **the North Promenade** with the flower clock, the bandstand, the windmill, the hedge maze and the picnic lawn.
- **The status banks**: every desk carries a hooded bank above its fascia. A booth's has six backlit legend windows (KEY ON, AUTO, GATES OPEN, BARS LOCKED, RIDE RUNNING, and FAULT/MAINT, which flashes) and an LED readout of the queue, the riders and the time to the end of the cycle; the coaster console's has a mimic that lights the section the train is in (station, lift, drop and loop, turn and hills, corkscrew, brakes) and an LED readout of speed, lap time, riders and queue.
- **The operator booths**: every ride has a raised control cabin beside its queue. Outside, a signal tower shows the ride's state, a camera sweeps the ride and an LED board tells the queue the wait. Inside, the ride's desk, two CCTV monitors, the ride control cabinet (meters, a lamp column, a lamp test, the horn, a cycle counter and a RUN/MAINT key switch that locks the ride out), the status board, a clock on park time and the rest of a working room.
- **The park office** on the forecourt, where the owner's PC opens the management panel, and the park services switchboard on its wall.
- **The snack stand** on Station Square, which opens at level 2.

Fifteen rides beside the coaster, all open from the first day.

## The look

A fairy-tale park in the Efteling manner rather than sheds with signs: deep-green cast-iron lanterns along every path, painted sign boards in gilt frames, a gatehouse with two towers under pointed slate roofs and a stepped gable with a clock, spires on the land arches and the ticket windows, a slate roof and a clock turret on the coaster station, and the three show halls with their stepped gables and towers.

## The loop

1. Guests come by car, one to four to a car: off the road, under the barrier and up the drive into a free bay. They get out and join the shorter ticket line. The lot fills through the day (41 bays, up to 110 guests in the park) and empties at closing: at the end of their day each party walks back to its car, gets in, backs out and drives away.
2. You serve the window (or the clerk does): the ticket is sold, the money lands, the guest walks to a turnstile. With nobody at the window, the guest at the front of the line buys at the self-service machine beside it after a few seconds, so the park keeps filling while you run a ride.
3. Past the turnstile the guest picks the ride with the shortest line — the coaster, or any open ride. A ride whose operator key is still OFF takes a line too: the guests stand and wait for it to open, and give up after a minute or two. Up to 90 guests are in the park at once, and each rides up to four times before going home.
4. For the coaster: you open the gates and the front of the queue walks in, one seat at a time; pull the restraints down and dispatch.
5. The train runs the circuit and comes home; the guests get off and either ride again, buy a snack or go home.
6. Tickets, rides and snacks earn xp. The ladder opens the snack stand, a clerk, an operator and the park lights.

Pull the lever and the coaster runs itself: gates, restraints, dispatch, round and round. Hire a clerk and the window serves itself. Hire an operator and the ride runs itself whether the lever is over or not.

## The parts

`src/` is joined in file-name order after the engine's parts, all in one closure.

| Part | What it holds |
|---|---|
| `00-*.js` | written by the Co Engine editor: the layout, materials, menus, NPCs and world edits. Edit them in the editor |
| `01-park.js` | the state, the tables, the ground, the gate, the ticket windows, the midway, the forest, the props, `GAME` and `CO.setup` |
| `02-guests.js` | the guest pool, who arrives, how they queue, how they buy a ticket and how they ride |
| `03-ride.js` | the coaster, the train, the station, the queue lane, the operator's room, the snack stand and the ride state machine |
| `04-ui.js` | the clock and the day, the panel, the guide |
| `05-attractions.js` | the attraction system and the flat rides |
| `06-dress.js` | each ride's own world: pad, gateway, queue lane, bunting and a signature piece |
| `07-npcs.js` | the crowd: wanderers and staff on the engine's NPC system |
| `08-kit.js` | the materials and shapes the park is built from |
| `09-booths.js` | the per-ride control state: gates, restraints, AUTO, the stop and the MAINT lockout |
| `10-visuals.js` | the festive layer |
| `11-models.js` | the richer models: ticket windows, office, gateways, turnstiles, fences |
| `12-themepark.js` | the four lands, the routes, the land arches, the hub fountain, the coaster's yard and the signposts |
| `13-gardens.js` | the food plazas and the North Promenade's gardens |
| `14-controls.js` | the control hardware: buttons, bat switches, selectors, levers, stops, lamps and gauges, and the desks |
| `15-rider.js` | the player's own turn on the rides |
| `16-coasters.js` | the coaster kit (track frames rolled by the felt force, speeds by physics), The Serpent, Baron's Drop, the three indoor coasters and the kids' rides |
| `17-booths.js` | the operator booths and their kit, shared with the indoor coasters' cabins |
| `18-hq.js` | Park Co HQ: Guest Services, Operations and the owner's office over three floors |
| `19-arrivals.js` | the guests' cars: the bays, the drive and its barrier, a car's way in and out, the party getting out and back in |
| `20-fairytale.js` | the park in the Efteling manner: the lanterns on every path, the painted gilt-framed signs, the gatehouse towers and clock gable, spires on the land arches and the ticket windows, the coaster station's slate roof and clock turret |
| `21-east.js` | the east strip: The Dragon and The Firebird (circuits laid in the main coaster's frame and turned into the strip), their stations, canopies, control houses, yard fences and the East Walk |
| `22-mountain.js` | The Mountain King: the castle hall with its portals, the king and the crystals, the circuit, the station and its cabin |
| `99-boot.js` | `CO.boot(GAME)` |

The engine's contract, every hook and every page element, is in the engine repo under `docs/ENGINE.md`. `//@` lines at column 0 are notes for the reader and are left out of the build.
