# Park Co — review pass, 19 Oct 2026

A full visual review of the park (the 41 suite shots in `tests/shots` plus close-ups),
a source review of every `src/` part, a review of Co Engine v0.13.1, and a scripted
three-game-day playtest. Everything below is a suggestion or an observation — **nothing
in the repo was changed**; the only new files are screenshots in `tests/shots`.

What was run:

* `npm run check` — clean.
* Smoke test — 156/156 (draws 2605, baked 212, solids 943).
* `npm run visual` — shots `01-gate` … `41-indoor-cabin` written (first eight frames were
  taken with AUTO off — see E1).
* Playtest via `T.pkTick` over three game-days — numbers in section C.
* Shot-level verification with `tests/oneshot.js` and raycast probes (`tests/probe.js`)
  wherever a vision-model read was contested.

The nemo vision review ran over every frame as eight batched passes; every claim kept
below was re-checked by hand (image re-read and/or raycast), and the ones that turned out
to be illusions or intended are listed in the appendix so nobody re-reports them.

**Fix pass — 20 Oct 2026.** Every actionable item in sections A, B, D1 and E has been
implemented and verified against the built game: `npm run check` clean, smoke 156/156, and a
full 54-frame suite pass (`01-gate` … `49-snack-stand`, plus `booth-back.png` as scratch
evidence) re-taken from the built game. Each fixed item names its evidence shot. Section C
stays unticked — those four need a hands-on session with the game on screen — and D2–D5 are
Co Engine roadmap items: the engine is vendored (`node_modules/co-engine`) and was not
modified in this pass.

---

## A. Look & feel — textures and materials

- [x] **A1. The lawn reads as pencil scribbles at any distance.**
  Root cause found: the whole park stands on one 420 × 420 m plane
  (`src/01-park.js:100`) with the engine's `TEX.grass`, whose texture repeats 30 × 30
  (`Co Engine/engine/10-three.js:87`) — a 14 m tile, so the 3000 hand-drawn grass strokes
  come out half a metre to a metre and a half long on the ground and read as hatching,
  not turf. Probe confirmed `T.MAT.grass.map === T.TEX.grass`, repeat `[30, 30]`.
  Seen in `03-midway`, `05-teacups`, `08-dodgems`, `m-whitebldg` (all lawns).
  Options: smaller, higher-frequency blade texture; a second detail layer; or a coarser
  ground material under the park with the grass only where it is planted.
  **Fixed 20 Oct:** the lawn now gets its own cloned map at repeat `[150, 150]` — a 2.8 m
  tile, so the blades read as turf (`src/01-park.js:100-108`). Re-checked in `03-midway`,
  `05-teacups`, `47-plaza-balloons`.

- [x] **A2. `pk-stone`’s crack layer reads as pencil scrawls on large surfaces.**
  `CO.material("pk-stone", … cracks n:25 sz:120 …)` at `src/00-materials.js:2` is 25
  cracks per 512 px tile at repeat `[3, 3]`; on a big floor the same scrawl repeats and
  reads as marker lines. Best examples: the operator-room floor (`16-operator-room`,
  `17-control-desk`) and the white column at Wobbly Pots (raycast-verified `pk-stone`).
  Options: fewer, lower-contrast cracks (`#505048` on `#b8b6b0` is strong), a wear layer
  instead, or a bigger repeat for floors.
  **Fixed 20 Oct:** the layer is now n:10, sz:170, `#96948b` on `#b8b6b0`
  (`src/00-materials.js:2`) — fewer, softer and slower to repeat. Re-checked in
  `16-operator-room`, `17-control-desk`, `48-pave-close`.

- [x] **A3. The carousel’s interior is nearly black and the horses are flat.**
  `m-carousel`: the canopy underside and the sunburst are invisible — downward faces are
  lit only by the hemisphere’s ground bounce, which is dark; the horses read as one flat
  colour each with chunky grey posts. The build is richer than it looks:
  sunburst panels at `src/05-attractions.js:311-312`, eight horse coats and coloured
  saddles at `331-350`. Needs light (a soft point light or a brighter ground-bounce
  inside the canopy) and a little horse detail (mane/tail, a darker underside, brass
  sleeves on the posts).
  **Fixed 20 Oct:** the sunburst and rounding boards are emissive, two warm point lights
  hang under the canopy (0xffd9a0 high, 0xffc07a low), and the poles are fixed to the
  deck with tapered shafts and gold collars instead of riding the bob group
  (`src/05-attractions.js`). Re-checked in `43-carousel-inside`, `04-carousel`.

- [x] **A4. Moonwood’s interior is unfinished and dark.**
  `m-moonwood` (with `36-moonwood-front`, `41-indoor-cabin`): flat brown walls and
  ceiling, dark floor, a giant black cone hanging over the track, white cube “lamps”
  floating with no cords, and the station and train very dark. Theme block is
  `src/16-coasters.js:461` (indoor kit in `459-461`). Options: panel/beam texture on the
  walls, a cord or bracket for each lamp, a warmer station lamp glow, and something
  other than a bare black cone overhead.
  **Fixed 20 Oct:** the shell is dressed inside — wainscot, pilasters, ceiling beams and
  a ceiling slab (shadowless) — with a theme-tinted floor; the station pendants are
  rehung on brass cords with warm emissive shades and their own point lights, and the
  overhead read is now the lowered tree crown rather than a bare cone
  (`src/16-coasters.js`). Re-checked in `44-moonwood-inside`, `36-moonwood-front`,
  `41-indoor-cabin`.

- [x] **A5. Tree trunks are flat colour, and the tree walls repeat.**
  Trunks are one fill each, and the avenues (`03-midway`, `12-midway-shops`,
  `37-north-wide`, `m-whitebldg`) show the same canopy shape in rows. A vertical
  gradient or bark texture on the trunks, two canopy variants, and a couple of gaps in
  the rows would carry a long way.
  **Fixed 20 Oct:** trunks carry a real bark texture (`pkTexBark`, `src/08-kit.js:67`)
  with a second wrap hull for depth (`src/05-attractions.js:653`), and the avenue rows
  have canopy variants and gaps. Re-checked in `12-midway-shops`, `37-north-wide`,
  `03-midway`.

- [x] **A6. Baron’s Drop rockery reads as scattered rocks with pavement showing through**
  The “rockery” (`m2-baron-ne`, `m2-baron-nw`, `31-baron-wide`) is loose pale boulders
  with paving gaps between them, and the tunnel is a ring with a flat black disc inside
  (`src/16-coasters.js` ~`314-395`). Clustering the boulders into a solid mass, darkening
  the tunnel mouth with a short false barrel, and putting a little rock texture on the
  ring would sell it.
  **Fixed 20 Oct:** rebuilt as a real mass — a ground base course of boulders that pushes
  intruders out, a stacked ring-rock course (flanks, cap, shoulders, back mound), a slim
  darker torus ring, and a bore tube with a dark disc set back so the mouth reads as a
  hole in the pile (`src/16-coasters.js`). Re-checked in `45-baron-rockery`,
  `46-baron-rockery-nw`, `31-baron-wide`.

- [x] **A7. Kiosk and booth fronts are blank white slabs.**
  `m-snack-north` (from `-16,2` looking at `-11,2,9`), `m-whitebldg`, `m-pave-close`: the
  plaza/snack kiosk and the midway shop boxes are plain white, with only tiny white sign
  planes around z ≈ 12.08. Add panel lines, a door and a window (or a printed shutter),
  an awning, and larger hanging signage. Same note, milder, for the ride-operator booths
  (`op-booth-front`, `op-booth-inside`): a notice board or poster on the cabin wall.
  **Fixed 20 Oct:** the snack stand is dressed — awning over the hatch, menu board,
  ice-cream tubs display, larger hanging signage (`src/03-ride.js`) — and the booth backs
  are no longer blank slabs: ribs, downpipe, vent, wall lamp and a `STAFF ONLY` board,
  plus a poster on the solid inside wall (`src/11-models.js`, `pkRideBoothBetter`).
  Re-checked in `49-snack-stand`, `12-midway-shops`, and the scratch evidence
  `booth-back.png` (kept in `tests/shots`).

- [x] **A8. The paved inlay rounds are plain grey.**
  The rounds at the spur junctions and the fountain (`src/12-themepark.js:119-127`) are
  three flat discs — seen from the ground in `m-midway-centre`, `m-whitebldg`, `03-midway`.
  A pattern (radial paving, a colour ring, a small medallion) would make them read as
  designed rather than poured.
  **Fixed 20 Oct:** the rounds now carry radial dark courses, the fountain round gets a
  brass medallion and band spokes (`src/12-themepark.js`). Re-checked in
  `47-plaza-balloons`, `48-pave-close`.

- [x] **A9. Tiny white specks on the pavement — low confidence, worth one editor pick.**
  Seen in `05-teacups`, `08-dodgems`, one dot in `m-pave-close` (about x 29, z 4 — the
  raycast there hits only the paver slab). Two candidates now on the list: the people
  rig’s pale shoe soles and laces (`#d8d4cc` / `#f2f2f2`,
  `Co Engine/engine/22-people.js:74,94`) on walking guests, and the lighter grain specks
  in the paver texture (`src/08-kit.js:18` — `grain(…, true)` lightens ~1 px dots, which
  at the slab’s 2.4 m tiling is ≈ 5 mm on the ground). A probe also found one unexplained
  row of six white plates, 0.2 × 0.01 × 0.05 m at (13.05 … 14.15, z 2.32, y 0.07), with
  an auto world-key and no entry in `src/00-world.js`’s edit list. Next time the editor
  is open, pick the speck; if it is a sole, darken it, if it is grain, soften it.
  **Fixed 20 Oct:** the pick landed on grain — the paver’s lightened speck layer was
  toned down (`src/08-kit.js:18`); the guest soles were left alone. Re-checked in
  `48-pave-close`. The probe’s six white plates near (13.6, 2.3) are unchanged and remain
  an editor pick.

---

## B. Layout and placement — things on top of / in front of things

- [x] **B1. The popcorn cart and the balloon stand sit in the middle of the walking lane.**
  `pkPopcornCart(3.9, 16.2)` and `pkBalloons(-3.9, 16.0)` (`src/10-visuals.js:107-108`)
  stand inside the plaza edges the path markers mark at x ±8.5 (`10-visuals.js:87-88`),
  between the hub fountain (0, 10.5) and the inlay round at (0, 20). Their solids —
  1.7 × 1.2 m and 0.6 × 0.6 m (`10-visuals.js:42, 56`) — are in the natural walking line;
  from the midway both also overlap the kiosk fronts visually (`m-whitebldg`). Push them
  toward the edges (|x| ≈ 5.5–6.5) or into the recesses, keeping the hub-to-gate lane clear.
  **Fixed 20 Oct:** the cart is at (7.1, 17.6) against the east hedge and the balloons at
  (−6.8, 18.4) — the hub-to-gate lane is clear (`src/10-visuals.js:107-108`). Re-checked
  in `42-queue-entrance`, `47-plaza-balloons`.

- [x] **B2. A trash bin stands in the queue entrance lane.**
  The dark bin (`#23493a` + `#1f2427`) at about (6.35, 11.55) is in the middle of the
  queue lane in `dbg-queue-a` / `dbg-queue-b`. Move it ~1.5 m off the lane.
  **Fixed 20 Oct:** the bin was moved ~1.5 m off the lane (`src/00-world.js`). Re-checked
  in `42-queue-entrance`, `26-queue-gate`.

- [x] **B3. A lamp post stands directly in front of the QUEUE sign.**
  Visible in `dbg-queue-a` / `dbg-queue-b`: the post crosses the sign face from every
  approach angle. Swap the two, or nudge the lamp.
  **Fixed 20 Oct:** the lamp was nudged clear of the sign face (`src/00-world.js`).
  Re-checked in `42-queue-entrance`, `26-queue-gate`.

- [x] **B4. The totem sign cluster is crowded.**
  `12-midway-shops`: five or six board signs stacked in one knot, so they overlap each
  other from most angles. Space them along the path or keep the three that matter.
  **Fixed 20 Oct:** the totem was split into two knots (3 + 2 boards) at different angles
  so no board hides another (`src/12-themepark.js`). Re-checked in `12-midway-shops`.

- [x] **B5. Moonwood’s helix clips the tree canopy.**
  The lift/helix passes through the canopy of the trees at the box corner
  (`m-moonwood`, `41-indoor-cabin`). Deepen the tree clearing, move the trees, or raise
  the helix by a metre.
  **Fixed 20 Oct:** the tree crown was shrunk and lowered (trunk 5.8, crown spheres down
  to r ≈ 1.45–1.67 at y 5.9–6.6) so the helix (r 3.4) clears it with room to spare
  (`src/16-coasters.js`). Re-checked in `44-moonwood-inside`, `36-moonwood-front`,
  `41-indoor-cabin`.

---

## C. Gameplay — verified this pass

Three game-days simulated with `T.pkTick(1)` (1 s = 1 game minute), guest AI on, all 15
attractions open, plus the smoke suite. Results — all healthy:

| check | result |
|---|---|
| NaNs in state | 0 |
| Guests stuck | 0 |
| Ride-cart contacts (guests vs coaster trains) | 0 |
| Closest approach between a cart and a guest | 1.86 m |
| Coaster automatic operation | 12 complete cycles |
| Attractions that cycled | 15 / 15 (cycle counts 3–17) |
| Tickets sold | yes — $25 toasts on sale |
| Bank after three days | $54,615 |
| Ride wear after three days | 18 % |
| Boarding | “Ride: boarding”, 16/16 open, guests seated and delivered |

So the rides and booths do run: dispatch, boarding, unload, queue, ticket, cash and wear
all move. What a scripted pass cannot show is *how it looks while it happens* — worth a
hands-on pass next time the game is open:

  **Status 20 Oct:** C1–C4 deliberately left open — the fix pass was verified with scripted
  shots and the smoke suite; these four still need a person at the controls.

- [ ] C1. Watch one boarding/unload cycle per ride class on screen (a coaster, the flume,
  a flat ride, the indoor coasters) — the probe proved counts, not frames.
- [ ] C2. Stand in the queue for a while at peak and watch guest reactions, the booth
  window and the operator animation.
- [ ] C3. Push wear from 18 % toward 100 % and see what breaks first (does it stall, who
  fixes it, do guests notice).
- [ ] C4. Save/load round trip after a full day — bank, wear, guest count, ride states.

---

## D. Co Engine (v0.13.1)

  **Status 20 Oct:** D1 is done; D2–D5 stay open — Co Engine is vendored here
  (`node_modules/co-engine`) and was not modified in this pass. Several of their symptoms
  now have game-side workarounds (cloned lawn map for the D2 tiling, softened `cracks`
  for D4, interior point lights for D3), but the engine-level helpers are still owed.

- [x] **D1. `docs/ENGINE.md` is stale.** The header still says “as of v0.1.4” (line 3)
  while the engine is v0.13.1 and the doc describes 0.13.0 features. Refresh the
  version line and scan the contract for drift.
  **Fixed 20 Oct:** the version line now reads v0.13.1 in the Co Engine repo
  (`Desktop\Co Engine\docs\ENGINE.md`). The copy inside Park Co’s `node_modules` is a
  stale snapshot of that repo and is regenerated on the next install — left alone.

- [ ] **D2. There is no world-scale ground detail out of the box.** `TEX.grass` tiles
  14 m at its default repeat (`engine/10-three.js:87`) — fine for terrain cells, scribbles
  on any game that puts one plane under a whole map (A1). A ground-detail blend helper, or
  a per-material detail scale, would stop every game hitting this.

- [ ] **D3. Interiors go black from below.** Downward faces receive only the hemisphere’s
  ground bounce, so canopies and ceilings read near-black (A3 carousel, A4 Moonwood).
  A per-scene bounce-colour/ambient-floor setting, or an interior light preset, would fix
  a whole class of shots.

- [ ] **D4. The material graph’s `cracks` layer is not scale-aware.** Fixed count and size
  per 512 px tile means repeat `[3, 3]` on a big floor prints the same 25 scrawls over and
  over (A2). A scale-aware variant, or an editor warning when a tiled material is stretched
  past some size, would catch it.

- [ ] **D5. From `docs/PLAN.md`, still owed:** material-graph GLSL nodes; clip blending
  (one clip per object today) and the people rig’s walk as a clip; the model tab’s 3-axis
  gizmo and vertex editing; physics — tumbling boxes, sliders and springs, throwables;
  traffic that follows road pieces a game lays; and the Grow Co kit merge (people rig,
  props, screens).

---

## E. Review housekeeping (shots and the harness)

- [x] **E1. Re-run the first eight shots with AUTO on.** `01-gate` … `08-dodgems` were
  captured with AUTO off (different HUD and lighting budget from the rest); one clean run
  of `npm run visual` will make all 41 frames comparable.
  **Fixed 20 Oct:** the suite setup turns AUTO on before shot 01; the whole pass
  (`01-gate` … `08-dodgems` included) is now one consistent run.

- [x] **E2. Re-frame two shots.** `06-haunted` puts the camera ~1 m behind the corn planter
  at (−45.1, 22.4), so the planter dominates the frame (it is a planter with pale stalks —
  not a defect; see `m-myst2` / `m-myst3`). `09-coaster` frames the fountain and puts the
  coaster at the edge of the frame.
  **Fixed 20 Oct:** `06-haunted` was re-aimed to [−36,−16] → [−58, 4.5, −24] — the planter
  is out of frame and the tree canopy now frames the facade on purpose (a probe confirmed
  the camera sits in a tree triangle: trunks at (−28.3, −10.5), (−33.7, −19.5),
  (−35.5, −21.2), plus the house fence — no position in that pocket is canopy-free).
  `09-coaster` was re-aimed to [14, 16] → [0, 3, −14] so the coaster is centre frame.
  Re-checked in `06-haunted`, `09-coaster`.

- [x] **E3. Tidy the scratch shots.** Promote the useful ones into `tests/visual.js`’s
  table — `m-carousel`, `m-moonwood`, `m2-baron-ne`, `m2-baron-nw`, `m-pave-close`,
  `m-midway-centre` — and delete `m-mystery-sw`, `m-mystery-ne` (mis-positioned/failed)
  and `m-baron-tunnel` (inside geometry).
  **Fixed 20 Oct:** their suite equivalents are `43-carousel-inside`, `44-moonwood-inside`,
  `45/46-baron-rockery*`, `48-pave-close` and `47-plaza-balloons`, and the old `m-*`,
  `dbg-*`, `op-*`, `bldg-*` scratch set is deleted; `tests/shots` now holds exactly the
  suite plus one kept evidence file (`booth-back.png`, for A7). The scratch snack-stand
  view was promoted to `49-snack-stand`.

- [x] **E4. Add two shots to the suite** for the frames that found real items: the queue
  entrance (`dbg-queue-a` / `dbg-queue-b` style — found B2, B3) and the operator booth row
  (`op-booth-*`).
  **Fixed 20 Oct:** `42-queue-entrance` covers the queue entrance, and the operator booths
  are covered by `18-booth-outside`, `18b-booth-desk`, `18c-booth-ferris`,
  `18d-booth-flume` and `18e-booth-dodgems-desk`.

---

## Appendix — checked and *not* defects (do not re-report)

- Carousel “C” valance letters (`04`, `24`) — intended.
- “Poles sticking into the pond” in `09` — that is the fountain’s jets; the camera is
  inside the fountain’s paving.
- Snake / Baron “track clips the canopy” — a depth illusion; the track passes behind.
- The guest resting on the railing in `24-queue-carousel` — a normal lean.
- `18-booth-outside` — the flag does not actually pass through the wall at any approach
  angle we could frame; `18c`’s lamp base against the booth is fine; `op-booth-close`’s
  door jamb does not clip.
- `dbg-queue` “pole over the sign” and the black blob — the pole is a lamp in front of the
  sign from that angle (kept as B3 for layout, not a clip), and the blob is a trash bin
  (kept as B2 for placement, not a bug).
- Wobbly Pots column “grass squiggles” — the column is `pk-stone` (white, 512 px, repeat 3);
  it is the crack layer (see A2), not moss.
- The mystery prop near the haunted house — a planter: brown box (~1.7 × 1.9 × 1.0 m at
  −45.1, 22.4) with a dark soil slab and pale stalks. Fine as decor.
