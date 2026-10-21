# Park Co

A small theme park on Co Engine. Guests arrive from the car park, buy a ticket at a window, pass a turnstile and pick a ride: the coaster, or any of the seven rides that stand either side of the midway. You work the window and the coaster: sell the tickets, open the gates, watch the queue file in, pull the restraints down, dispatch, and pull the lever when you would rather the ride ran itself.

```
npm install        # fetches the engine at the tag named in package.json, and Electron
npm run build      # puts three.js beside the page, joins the engine parts and src/ into game/game.js
npm start          # the desktop window
npm run dev        # the same, linked to the Co Engine editor from the first frame
npm test           # the check script, then the smoke in a hidden window
```

Or open this folder in the Co Engine editor: it builds, runs and tests it from there, and links to the running game.

## The park

- **The gate** at the south, with four turnstiles and a fence either side, so the only way in is a turnstile.
- **Two ticket windows** outside the gate. Stand at one and press E to serve the guest at the front of the line; the screen on the counter sells too.
- **The midway** running north to the station, with lamps, benches, bins, hedges, trees and flower beds. A forest wraps the whole park.
- **The coaster**: one closed circuit, 170 m, a station straight at the south, a lift hill in the north-east, a drop, a hill, a turn and a run home. Three cars of four seats. Beside the platform, a fenced queue lane where the guests line up slot by slot.
- **The station platform** sits south of the track, with a ramp up from the apron and four gates along the platform edge.
- **The operator's room** east of the platform: a desk with Gates, Restraints, Dispatch and E-stop, a lever for AUTO, and a screen on the north wall that mirrors the desk.
- **The seven rides**, open from the first day, each with its own colours, gateway and signature piece: the carousel, the teacups, the ferris wheel, the dodgems, the drop tower, the log flume and the haunted house.
- **The park office** on the forecourt, where the owner's PC opens the management panel (park, coaster, staff).
- **The snack stand** on the midway, which opens at level 2.

## The loop

1. A guest arrives from the car park and joins the shorter ticket line.
2. You serve the window: the ticket is sold, the money lands, the guest walks to a turnstile.
3. Past the turnstile the guest picks the ride with the shortest line — the coaster, or any open ride.
4. For the coaster: you open the gates and the front of the queue walks in, one seat at a time; pull the restraints down and dispatch.
5. The train runs the circuit and comes home; the guests get off and either ride again, buy a snack or go home.
6. Tickets, rides and snacks earn xp. The ladder opens the snack stand, a clerk, an operator and the park lights.

Pull the lever and the coaster runs itself: gates, restraints, dispatch, round and round. Hire a clerk and the window serves itself. Hire an operator and the ride runs itself whether the lever is over or not.

## The parts

`src/` is joined in file-name order after the engine's parts, all in one closure.

| Part | What it holds |
|---|---|
| `00-menus.js` | the start, pause and settings menus |
| `01-park.js` | the state, the tables, the ground, the gate, the ticket windows, the midway, the forest, the props, `GAME` and `CO.setup` |
| `02-guests.js` | the guest pool, who arrives, how they queue, how they buy a ticket and how they ride |
| `03-ride.js` | the coaster, the train, the station, the queue lane, the operator's room, the snack stand and the ride state machine |
| `04-ui.js` | the clock and the day, the panel, the guide |
| `05-attractions.js` | the attraction system and the seven rides |
| `06-dress.js` | each ride's own world: gateway, bunting, colours and a signature piece |
| `07-npcs.js` | the crowd: wanderers and staff on the engine's NPC system |
| `99-boot.js` | `CO.boot(GAME)` |

The engine's contract, every hook and every page element, is in the engine repo under `docs/ENGINE.md`. `//@` lines at column 0 are notes for the reader and are left out of the build.
