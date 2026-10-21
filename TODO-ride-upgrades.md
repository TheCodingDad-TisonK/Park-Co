# Park Co — ride upgrade pass

Goal: every ride in the park gets **both** a proper themed mini-land (full visual treatment)
**and** a gameplay tune-up. 15 rides. Nothing is "done" until it is verified the house way:
`node --check` → `npm run build` → `npm run check` → `npm test` (smoke must stay green or its
expectations updated deliberately) → targeted oneshot(s) → full `npm run visual` at the end of
each batch.

Rules for this pass:

* Batches of 3–4 rides; full verification per batch (see §Batching). Never leave more than one
  batch unbuilt.
* The smoke suite (`tests/park.smoke.js`) asserts exact ride facts (eight horses, eight cabins of
  two, three cars and twelve seats, run-cycle counts…). If a gameplay upgrade changes any of
  those, **update the smoke expectation in the same batch** — green with honest new numbers.
* The engine is vendored (`node_modules/co-engine`) — never edit it. Game-side workarounds only.
* Point-light budget: the engine keeps only the ~10–12 nearest point lights. A land may add 2–3
  lights; more only where nothing else is lit nearby.
* Re-run the three-day playtest probe (`tests/probe.js` with the `pkTick` script from the
  previous review) after each gameplay-touching batch: NaNs 0, stuck guests 0, cycles complete.

## Current state (recon done 20 Oct)

Ride inventory, plot, queue head, current signature piece, gameplay knobs:

| # | id | name | plot (x,z) | queue head | land today | board/run/unload | capacity |
|---|----|------|-----------|-----------|------------|------------------|----------|
| R1 | carousel | Carousel | −34, 20 | −22, 20 | pad+bunting+gateway, gold band + organ box | 10/22/6 | 8 horses |
| R2 | teacups | Teacups | −56, 3 | −44, 3 | pad+bunting, giant teapot | 9/18/5 | recon (cups) |
| R3 | ferris | Ferris wheel | 34, 20 | 22, 20 | pad+bunting, bulb ring + ticket hut | 12/32/7 | 8 cabins × 2 |
| R4 | dodgems | Dodgems | 56, 3 | 44, 3 | pad+bunting, glow strips | 10/26/6 | recon (cars) |
| R5 | droptower | Drop tower | −54, −52 | −44, −52 | pad+bunting, gold discs + gantry | 10/16/5 | recon (gondola) |
| R6 | flume | Log flume | 54, −32 | 46.4, −24 | pad+bunting, boulders + splash wall + log store | 10/30/5 | recon (boats) |
| R7 | haunted | Haunted house | −58, −24 | −44, −24 | pad+bunting, dead trees + fog lights | 6/20/4 | recon (benches) |
| R8 | serpent | The Serpent | 55, −77.5 | 44.5, −65 | pad+gateway+lane only (**no signature**) | coaster | 3 cars × 4 |
| R9 | baron | Baron's Drop | 57, 19 | 48, 19 | rockery rebuilt in review pass (**no signature piece**) | coaster | recon |
| R10 | nocturne | Nocturne | −50, −86.75 | −59.1, −76.4 | pad+gateway+lane only | coaster | recon |
| R11 | wreck | The Wreck | −20, −86.75 | −29.1, −76.4 | pad+gateway+lane only | coaster | recon |
| R12 | moonwood | Moonwood | 30, −86.75 | 39.1, −76.4 | interior + crown (review pass) | coaster | recon |
| R13 | kround | Little Roundabout | −60, 20 | −49, 20 | pad+gateway only | kiddie | recon |
| R14 | kpots | Wobbly Pots | −60, 30 | −49, 30 | pad+gateway only | kiddie | recon |
| R15 | kpuffin | Puffin Line | −60, 40 | −52.5, −44.5 | pad+gateway only | kiddie | recon |

Key architecture facts:

- `src/06-dress.js` `pkDressAll()` runs for every attraction: pad paving → bunting → gateway
  (`pkGatewayBetter`) → queue lane (`pkQueueLaneBetter`) → beds/lamps → `pkSignature()`.
  `pkSignature` has branches only for the 7 flat rides — the 8 coaster/kiddie rides get **nothing**.
  Mini-lands for those go into `pkSignature` (or a new `pkLand()` called from `pkDressAll`).
- `PK_THEME[id]` (`06-dress.js:5`, extended at `16-coasters.js:438-445`) carries the ride colours;
  big coasters set `noBunting/noDecor`. Lands may re-enable selective decor per ride.
- Flat-ride gameplay knobs: the `pkAttr({...})` call in each builder in `src/05-attractions.js`
  (board/run/unload) and the seats array built above it. Coasters: `src/03-ride.js` (dispatch,
  cars, wear) + `pkCoRun` in `src/16-coasters.js` (speed profile per ride via `E.run`, `uPark`…).
- Plot pads: `p.r * (p.pad || 1.25)` — coaster plots set a small pad so lands must extend outward,
  not pave over neighbours. `PK_KEEP` entries protect geometry from tree scatter.

## §0 Shared kit (do once, first batch)

- [ ] S1. `pkLand(a, p, th, parent)` helper in `06-dress.js`: one call that gives a plot a themed
      ground patch (tinted pavers or themed material — grass/gravel/mulch per land), a kerb edge,
      and returns coordinates so per-ride code can place against it. Reuses `pkPadMat`/`pkPavedDisc`.
- [ ] S2. Entrance arch variants: a themed gateway builder (`pkGatewayThemed`) that takes a
      material/shape choice (timber, steel, stone, neon) while keeping the same queue contract
      (sign at the back, gate posts, `C.gateObjs` hook). Keep `pkGatewayBetter` for unchanged rides.
- [ ] S3. Land lamp: a low themed lamp/lantern helper (2–3 variants: park lamp exists —
      add festoon/string lights and a bollard lantern) with emissive lenses, cheap on the light
      budget (glow materials + max 1–2 real point lights per land).
- [ ] S4. Land planting: small helper to ring a plot with hedge/rock/plant clusters at varied
      scales (check `13-gardens.js` and `pkFlowerBed` for reuse; keep clear of queue lanes and
      `PK_KEEP`).
- [ ] S5. Visual suite: plan shot additions — one land shot per upgraded ride added to
      `tests/visual.js` at the end of each batch (numbered after 49), re-verified in the full pass.
- [ ] S6. Night check: every land must read at night (`15-night-lights` covers the midway;
      lands get their own night oneshot spot-check per batch).

## §1 The lands + gameplay, per ride

Format per ride: [ ] land (visual), [ ] gameplay, [ ] verified (shot name + smoke/playtest).

### Batch 1 — midway west (R1 R2 R3)

- [ ] R1 carousel 'The Grand Carousel'
  - Land: fairground quarter — brass lamp ring around the pad, a proper ticket kiosk beside the
    gateway, bench pair, flower beds in the ride's red/gold; bandstand-style canopy corner.
  - Gameplay: board 10→8, unload 6→5 (horses load faster than the current 10 s); keep 8 horses,
    run 22 stays. Raise XP per cycle slightly? (recon `pkXp` calls first).
  - Verify: shots 04-carousel, 43-carousel-inside + new land shot; smoke (8 horses assertion).
- [ ] R2 teacups 'The Tea Garden'
  - Land: tea garden quarter — hedge corner with topiary, a tea-table seating group (props),
    oversized cup lamps along the lane, trellis arch on the route side.
  - Gameplay: recon cup capacity; board 9→8; add a slow-rotation idle flavour if `tickRun`
    allows (cups still when idle today?).
  - Verify: 05-teacups + land shot; smoke.
- [ ] R3 ferris 'The Sky Wheel'
  - Land: sky quarter — flag poles with pennants, a cloud-motif viewing deck rail, ticket hut
    upgrade (striped awning), benches; windsock or weather vane mast.
  - Gameplay: run 32→26 (a full turn reads long); recon cabin capacity (8×2 asserted in smoke —
    only change if smoke updated deliberately).
  - Verify: 07-ferris + land shot; smoke (8 cabins of 2).

### Batch 2 — midway east + south (R4 R5 R6 R7)

- [ ] R4 dodgems 'The Dodgem Arena'
  - Land: arcade quarter — marquee light row over the entrance, high-score board (texture),
    queue-rail theming, neon corner posts (glow mats, no extra point lights).
  - Gameplay: recon car/seat counts; bump speed via `tickRun` if exposed; board 10→9.
  - Verify: 08-dodgems + land shot; smoke.
- [ ] R5 droptower 'The Drop'
  - Land: launch-pad quarter — scaffolding frame, hazard stripes on the pad kerb, warning beacons
    (emissive), a countdown pylon sign, cable spools as props.
  - Gameplay: multi-drop sequence in `tickRun` (one big drop today? recon first); run 16→20 if
    the cycle supports it.
  - Verify: 13-droptower + land shot; smoke.
- [ ] R6 flume 'The Log Flume'
  - Land: lumber-camp quarter — stacked log piles (upgrade the existing store), pine clusters,
    a footbridge prop over the channel, dock bollards and rope rail along the splash side.
  - Gameplay: recon boat count/capacity; splash timing in `tickRun`; board 10→8.
  - Verify: 14-flume + land shot; smoke.
- [ ] R7 haunted 'The Haunted Manor'
  - Land: graveyard quarter — headstones + crypt prop behind the fence line, iron gate at the
    land edge, fog-light spheres upgraded to flicker (emissive pulse in a tick), dead-tree row
    completed with varied leans.
  - Gameplay: board 6→5, unload 4→3 (dark ride loads briskly); run 20 stays unless recon shows
    a better story beat.
  - Verify: 06-haunted + land shot; smoke.

### Batch 3 — big coasters east (R8 R9)

- [ ] R8 serpent 'The Serpent'
  - Land: jungle-ruin quarter (serpent green/gold, `noBunting` stays) — stone ruin arch over the
    queue spur, giant serpent-head prow piece near the first drop (signature), bamboo/foliage
    ring outward of the pad, tiki torches (glow).
  - Gameplay: recon `E.run` and speed; consider a second train unlock later (`train2` exists in
    state!) — wire `S.train2` as a serpent upgrade if not wired already.
  - Verify: 28-serpent-wide, 29-serpent-station, 30-serpent-queue + land shot; smoke (3 cars,
    12 seats, peak y/tilt assertions must still hold).
- [ ] R9 baron 'Baron's Drop'
  - Land: baron's camp — castle banner poles + a wooden siege-trebuchet/crane prop on the
    rockery flank (signature), torch brackets on the rock mouth, themed queue shelter (timber
    lean-to). Rockery itself is done — do not disturb.
  - Gameplay: recon drop profile (`pkCoRun`); board 10→8 on the platform.
  - Verify: 31-baron-wide, 32-baron-drop, 45/46-rockery + land shot; smoke (peak y 21.2, tilt).

### Batch 4 — indoor row north (R10 R11 R12)

- [ ] R10 nocturne 'Nocturne'
  - Land: moonlit quarter — stained-glass facade panel over the entry, moon-dial medallion
    (signature), iron lantern posts, lavender planting; interior: organ-pipe wall (recon interior
    first — 38-nocturne-inside).
  - Gameplay: helix speed profile recon; board 10→8; night-early flavour if cheap.
  - Verify: 34-nocturne-front, 38-nocturne-inside + land shot; smoke (peak y 7.0, tilt, door walk).
- [ ] R11 wreck 'The Wreck'
  - Land: shipwreck quarter — broken hull/bow piece as signature, cargo crates + barrels along
    the lane, rope rigging between masts, anchor prop, gull figures on the roofline.
  - Gameplay: same recon as nocturne (shared `pkBuildIndoor`); board 10→8.
  - Verify: 35-wreck-front + land shot; smoke (door walk assertion shared with nocturne).
- [ ] R12 moonwood 'Moonwood'
  - Land: forest-floor quarter — mushroom cluster ring, stump benches, mossy boulders, lantern
    path lights along the lane; exterior: moon shrine piece (signature). Interior + crown are
    done in the review pass — extend only, do not rebuild.
  - Gameplay: recon helix profile; board 10→8.
  - Verify: 36-moonwood-front, 44-moonwood-inside + land shot; smoke.

### Batch 5 — kids' west lawn (R13 R14 R15)

- [ ] R13 kround 'Little Roundabout'
  - Land: kids' quarter — low picket fence ring, balloon-figure props, play-shape blocks,
    parent bench row + shade sail, safety-surface ground patch (S1 themed).
  - Gameplay: recon speed/seats; make it the slowest kindest ride (run stays short);
    capacity up if smoke is updated.
  - Verify: 39-kids-area + land shots (one per ride, new); smoke (kid-ride assertions).
- [ ] R14 kpots 'Wobbly Pots'
  - Land: tea-party-mini — giant spoons, sugar-cube blocks, a small teapot fountain prop.
  - Gameplay: recon; spin tuning only if exposed.
  - Verify: 39-kids-area + land shot; smoke.
- [ ] R15 kpuffin 'Puffin Line'
  - Land: arctic-mini — rock outcrops, puffin figures on the rocks (signature), ice-blue
    ground patch, fishing-boat carriage prop beside the track.
  - Gameplay: recon; keep crawl pace (7.8 m oval asserted).
  - Verify: 40-puffin-line + land shot; smoke (oval length assertion).

### Batch 6 — regression + full pass

- [ ] G1. Three-day playtest probe re-run (NaNs 0, stuck 0, cycles 15/15, bank sane, wear sane).
- [ ] G2. Every smoke expectation that changed is updated and honest — full `npm test` green.
- [ ] G3. Full `npm run visual` (all shots incl. new land shots); review every changed frame.
- [ ] G4. Tick this TODO off honestly per item with evidence shot names; leave anything not
      actually verified UNticked with a one-line status.
- [ ] G5. Update `docs`/README ride list if it names rides or counts (grep for '15 rides'/'ten rides').

## Batching & verification protocol

1. Edit batch's `src/` files → `node --check` each → `npm run build` → `npm run check` → `npm test`
   (fix or deliberately update smoke in the same batch).
2. Targeted oneshots (`npx electron tests/oneshot.js -- x z lx ly lz name`) for each ride in the
   batch — day AND one night check if the land adds lights.
3. Add the batch's land shots to `tests/visual.js` (after 49); take one full `npm run visual` at
   the end of the batch so the suite stays truthful.
4. Gameplay-touching batches (1–5) also re-run the playtest probe.
5. Tick items in this file as they are verified — never ahead of verification.

## Open questions (recon before committing)

- Seat/car/boat/bench counts for R2 R4 R5 R6 R7 R9–R15 (recon first: `seats.push` in each builder).
- `pkXp` per-ride reward values — where do they live, are they uniform?
- `S.train2` (second serpent train?) — wired or vestigial? (`src/01-park.js:385`, `pkOpenRide`?)
- Wear rates per ride — global or per-ride (`src/03-ride.js` + attr tick)?
- Does `pkCtl` (control hardware) get built per attraction — booth screens list rides; new
  rides-none needed, but land changes must not shadow booth hitboxes.
