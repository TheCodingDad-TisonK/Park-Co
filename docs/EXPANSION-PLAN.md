# Park Co expansion: the complete build plan

**Version 1, drafted 2026-10-28. Awaiting tison's sign-off. Once signed, this plan is binding.**

This is the whole plan for growing Park Co past its railway, stage by stage. Any agent building a stage builds **exactly what is written here**: the same places, the same sizes, the same names, the same rules. Where this plan does not say something, the agent does not invent it. It stops and asks tison, and his answer is written back into this file before building.

The plan has five stages. tison decides when each one starts. Stages are built in order: 1, 2, 3, 4, 5.

---

## 0. What already exists (stage 0, built 2026-10-28)

All of it is in `src/46-world.js`, part 46: the world past the railway.

| Piece | What it is | Function |
|---|---|---|
| The ground | 1240 m square lawn (part 01). The camera sees 720 m, fog from 300 m to 700 m | `pkGround`, `CO.setup` |
| The expansion site | A band 10 to 50 m outside the railway's centre line, all the way round, wherever it is free. Site fencing (Heras panels); the inner fence is solid | `pkXpSite`, `pkXpBand`, `pkXpFree` |
| Site props | Stumps, log stacks, brush, spoil, excavators, trucks, dozers, rollers, mixers, harvesters, tower cranes, building shells with scaffolding, ride steel, cabins, containers, skips, toilets, floodlights, workers | `pkXp*` kit, `T.pkXpKit` |
| The viaduct | The new railway across the park, north to south, deck at 15 m, 12 piers placed by clearance | `pkXpViaduct`, `PK_XP_VIA`, `PK_XP_DECK` |
| The ground line | Short lengths of new track at grade at the viaduct's two ends, then a buffer stop | `pkXpGroundLine` |
| The viewing platform | At the end of Windmill Halt's footpath, at (-17, -160) | in `pkXpSite` |
| The countryside | The town of Lindenburg (west), farms, wind turbines and pylons (east), the lake (south), the instanced forest and the hills | `pkXpTownBuild`, `pkXpFarms`, `pkXpLakeBuild`, `pkXpForest` |

### The fixed facts every stage must respect
- **The Lindenburg Railway (part 40)** is a rounded rectangle: W -128, E 170, N -134, S 112, corner radius 24.
  - `pkXpRingD(x, z)` gives the signed distance from its centre line (negative inside).
  - **Nothing may stand within 8 m of the centre line**, except a bridge deck at least 6.5 m above the rails.
  - Note: `pkNearTrack` measures the *coaster's* track, not the railway. Never use it for the railway.
- **Stations:**

  | Station | Position |
  |---|---|
  | Central Station | (-128, 34) |
  | Windmill Halt | (-62, -134) |
  | Dragon Gate | (170, -2) |
  | Lakeside Halt | (95, 112) |

  Keep 36 m clear of each, measured along both axes, except for a stage's own footbridge or path.
- **Depot:** x 8 to 112, z -172 to -120. Keep clear.
- **Level crossings:**

  | Crossing | Position | What crosses |
  |---|---|---|
  | West | (-128, 76) | the road |
  | East | (170, 75.5) | the road |
  | North | (-16.7, -134) | Windmill Halt's footpath |

  **No new level crossing is ever added.** Guests cross the railway only by footbridge, or by the existing north footpath crossing.
- **The road** runs along z 76 for the whole width of the world. Keep 7 m clear of its centre line.
- **The new railway never connects to the Lindenburg Railway.** No points, no junction, no shared track, ever. It bridges over the ring and ends at buffer stops.

---

## 1. Rules for every agent, every stage

1. **Source of truth:** edit `src/` only, then `npm run build`. Never edit `game/game.js` or `node_modules/co-engine` by hand. No em dashes or en dashes anywhere shipped (the lint gate enforces this).
2. **Clearance first:** every footprint is tested in code before anything is placed:
   - `pkXpFree` for the railway, stations, depot, crossings and road;
   - the solids and the scene scan (`pkXpNearScan`) for everything else.
   - If a footprint written here fails a test, **stop and ask tison**. Do not shift it on your own.
3. **Every ride gets its own booth and its own desk:**
   - the booth kit of part 17, through `pkBuildBooth`, or for an indoor ride the cabin kit of part 16;
   - its own sheet in `PK_PANEL` (part 14): its own style, crest, mimic kind, second dial, sound, two hood windows and telemetry lines, as the existing 18 rides have.
   - A new style or crest is added to `pkPnStyles` / `PK_PN_CRESTS`. The style is named in this plan for each ride.
4. **Shows and dark rides are never revealed early.** Guests reach the seats or the load station through a building (gates, then a corridor or a stair), as the Lindenburg Arena does since 2026-10-28. They never walk past the set at ground level.
5. **Guests cross the railway only by a footbridge.** It has a deck 7 m above the rails, stairs both ends, a solid parapet, and is placed where this plan says.
6. **Each stage removes its own construction.** Before building, the stage clears the site props inside its land rectangle (section 8 has the switch), replaces the site fence round it with the land's own fence and gate, and leaves the rest of the site as it is.
7. **Verification before a stage is called done:**
   - `npm test` is green, and a new smoke check covers each new ride (it opens, boards, runs, unloads) and each footbridge (the route from the park reaches the land).
   - Headless probes: guest routes into every new queue; the new railway's distance from the ring line (at least 8 m, except bridges); no deck or pier clash (as `viaprobe.js` does).
   - Screenshots: every new ride from above, from its queue at eye level, its booth outside and its desk inside, by day and by night. Then tison looks in-game.
8. **Release notes:** write them to tison's Desktop for every stage. Update `CHANGELOG.md` and `TODO.md` only when tison asks for a commit.
9. **Commits:** commit, push or tag only when tison asks. Work on a branch named `feat/expansion-stage-<n>`.

---

## 2. The stages at a glance

| Stage | Name | Where | What it opens | Unlocks at park level | Cost |
|---|---|---|---|---|---|
| 1 | The Skyline | the viaduct across the park | the new railway: 3 stations, a shuttle train | 26 | $250,000 |
| 2 | Northern Heights | north, behind the depot | The Storm, The Avalanche, Frost Swing, The Alpine Hut | 28 | $600,000 |
| 3 | The Hunter's Woods | west, north of Central Station | The Hunter, Woodcutter's Mill, The Lodge | 30 | $450,000 |
| 4 | Lindenburg Harbour | south, down to the lake | The Rapids, The Ferry, Harbour Swings, The Fish House | 32 | $550,000 |
| 5 | The East Fair | east, either side of Dragon Gate | The Ghost Train, Sky Swing, The Breakdance, Top Spin, the fair stalls | 34 | $500,000 |

**How a stage opens in the game:**
- At the unlock level, the HQ office PC (part 25) gets an **Expansion** page. It shows the stage's name, its land on a small map, its cost, and a **Commission** button.
- Commissioning pays the cost. The construction in that land then runs for **3 in-game days**:
  - its machines double in number;
  - its building shells get one more floor per day;
  - the tablet (part 29) shows the days left.
- On the third night at 06:00, the land opens: the site props go, the stage is built, and the land's gate opens.
- Saved in `S.expansion = { stage: n, commissioned: day, opened: [ids] }`.

---

## 3. Stage 1: The Skyline (the new railway)

**What it is:** the viaduct finished, and an elevated steam shuttle running north to south across the park on its own line. It is a ride: guests board at any station and ride to the end and back.

**The line**
- The alignment is exactly `PK_XP_VIA`: (-67, -178), (-67, 34), (-74, 52), (-90, 70), (-108, 86), (-112, 100), (-112, 152).
- The rail top is at 15.4 m (deck top 15.0 plus ballast).
- **Piers:** add piers to every span longer than 30 m, at clear spots found by `pkXpPierOK` (ruling of section 1, rule 2). The two spans of about 46 m and 54 m inside the park get one intermediate pier each. If no clear spot exists, the span becomes a steel truss span (lattice sides 3 m deep, painted Park Co green 0x1d5b3b), not a girder span.
- **Every span** gets deck, parapets, ballast, sleepers every 0.65 m and two rails, gauge 1.0 m (the Lindenburg Railway's gauge).
- **Ends:** buffer stops at both ends, on the deck, exactly where the stage 0 buffer stops stand.

**The stations** (platforms on the deck, 40 m long, 3 m wide, on the east side of the track)

| Station | Platform | Way up |
|---|---|---|
| Skyline North | deck from (-67, -178) to (-67, -138) | stair tower and lift at (-60, -172), in the north land |
| Woods Halt | deck from (-67, -34) to (-67, -6) | stair tower and lift at (-61, -40), landing on the Dark Woods street (route z -40) on its north side |
| Skyline South | deck from (-112, 112) to (-112, 152) | stair tower and lift at (-104, 146), in the south land |

- Each platform has a canopy, two benches, a lamp every 8 m and a station name board in the Lindenburg Railway's style (part 41).
- Each stair tower is a brick tower 5 × 5 m, with a stair round a lift shaft and a slate roof.

**The train:** the "Skyline Shuttle".
- The part 42 loco kit, as a tank engine (no tender), painted 0x2f5f9e with gold lining, plus two open-sided coaches with 16 seats each.
- It shuttles: North to Woods Halt to South, then back.
- It dwells 25 s at each station, runs at most 8 m/s, and always runs on AUTO.
- No player driving in this stage.

**Booth:** the Skyline's control cabin stands at Skyline North on the ground, beside the stair tower at (-56, -170).
- Panel sheet style: a new `skyline` style (Park Co green with cream lining). Mimic kind `track` on the line's own points.
- Sound: a two-tone whistle. Hood windows: `DOORS SHUT`, `ON LINE`.

**Ride id** `skyline`, name "The Skyline", unlock level 26.

---

## 4. Stage 2: Northern Heights (north)

**The land:** x -104 to 146, z -176 to -240. Fell the forest inside it, keeping a 6 m tree screen along its north and west edges. Ground: paths in grey granite pavers.

**Way in:**
- Windmill Halt's footpath, through the existing north crossing, up to the viewing platform at (-17, -160). The platform becomes the land's entrance plaza: an iron arch reading "NORTHERN HEIGHTS".
- Skyline North station.

**Theme:** an alpine village. Timber chalets with carved balconies and steep slate roofs, painted shutters, snow on the roof ridges (white caps), fir trees.

| Ride | Type | Footprint | Limits | Panel sheet |
|---|---|---|---|---|
| **The Storm** (id `storm`) | steel hyper coaster, lift-hill, out and back with an airtime finale | x -100 to 10, z -182 to -236 | lift 46 m, top speed about 26 m/s, track about 820 m, 3 cars of 4 seats | style `storm` (slate grey and ice blue, lightning crest), mimic `track` |
| **The Avalanche** (id `avalanche`) | family spinning coaster, cars that turn on their bogie | x 20 to 70, z -186 to -232 | 14 m tall, about 380 m of track, 4 cars of 4 | style `glacier` (white and teal, snowflake crest), mimic `track` |
| **Frost Swing** (id `frost`) | giant pendulum swing with a spinning gondola of 24 seats | centre (100, -208), radius 16 | 32 m swing, 120 degrees | style `frost` (deep blue and silver, pendulum crest), mimic `tower` variant showing the swing angle |
| **The Alpine Hut** | food: soup, waffles, hot chocolate | 16 × 10 m chalet at (124, -196) | - | - |

---

## 5. Stage 3: The Hunter's Woods (west)

**The land:** x -140 to -184, z -108 to -6, the west band plus the forest out to x -184. Stop 2 m short of the town (x -186). Keep a 4 m tree screen along x -184. Paths in bark and log edging.

**Way in:** the **West Footbridge**. A new path runs west along z -40 from the Arena forecourt (-74, -40) to (-122, -40), passing south of the Arena wall at z -46.5. The footbridge then crosses the line from (-122, -40) to (-140, -40), deck 7 m above the rails, with stairs both ends.

**Theme:** a hunting forest. Timber lodges, stag antlers, lanterns, mossy rocks, a ruined watchtower.

| Ride | Type | Footprint | Limits | Panel sheet |
|---|---|---|---|---|
| **The Hunter** (id `hunter`) | wooden coaster, twister layout folded tightly | x -142 to -182, z -104 to -40 | lift 26 m, about 560 m of track, 4 cars of 4 seats; trains enter and leave through the station building | style `hunter` (dark oak and brass, antler crest), mimic `track` |
| **Woodcutter's Mill** (id `mill`) | water-wheel themed flat ride: a turntable of 8 tubs under a turning 14 m mill wheel | centre (-162, -24), radius 10 | 14 m tall | style `mill` (oak and moss green, cog crest), mimic `rotor` |
| **The Lodge** | restaurant | 20 × 12 m timber lodge at (-160, -10) | - | - |

---

## 6. Stage 4: Lindenburg Harbour (south)

**The land:** x -104 to 59, z 122 to 188, the south band out to the lake's north shore (the lake is centred at (95, 236), radii 70 × 44). Paths in brick, and a quay along the lake shore.

**Way in:**
- **Skyline South** station.
- The **Lakeside Footbridge**: from Lakeside Halt's platform at (95, 108), over the line, to (95, 126). Then a quay path west along z 160 to the land.

**Theme:** an old Dutch harbour. Brick warehouses with stepped gables, a lighthouse, moored barges, cranes for cargo (theming, not working), nets and crates.

| Ride | Type | Footprint | Limits | Panel sheet |
|---|---|---|---|---|
| **The Rapids** (id `rapids`) | river rapids, round boats of 8, a channel with waterfalls and geysers | x -100 to -20, z 124 to 186 | channel about 420 m, boats load inside a boathouse, a lift of 6 m | style `rapids` (river blue and timber, wave crest), mimic `track` on the channel's points (as the Log Flume) |
| **The Ferry** (id `ferry`) | a slow paddle steamer round the lake | quay at (60, 190); route a loop of the lake at 0.8 of its radii | 40 seats, a 6 minute round, the quay's gangway is the gate | style `ferry` (white and red, anchor and paddle crest), mimic `track` on the lake loop |
| **Harbour Swings** (id `swings`) | chairoplane, 32 seats under a lighthouse-themed top | centre (0, 150), radius 12 | 14 m tall | style `harbour` (red and white, lighthouse crest), mimic `rotor` |
| **The Fish House** | food: herring, chips, ice cream | 18 × 10 m warehouse at (30, 168) | - | - |

---

## 7. Stage 5: The East Fair (east)

**The land:** two parts of the east band, x 180 to 220, between z -110 and -38 (north fair) and between z 34 and 68 (south fair). The farms start at x 222: keep a hedge on x 221. Paths in grey and red pavers.

**Way in:** the **Dragon Gate Footbridge**, from Dragon Gate's platform at (166, -2) over the line to (182, -2). Its foot opens onto a square at (192, -2). Paths run north and south from it, and the square itself stays clear of rides.

**Theme:** a travelling fair (a Dutch kermis). Painted fronts, light chases, organ music, striped awnings, stalls.

| Ride | Type | Footprint | Limits | Panel sheet |
|---|---|---|---|---|
| **The Ghost Train** (id `ghost`) | dark ride, cars of 2 through a painted fairground front; **guests board inside the front, never seeing the interior from outside** | x 182 to 218, z -108 to -76 | building 9 m tall | style `ghost` (black and acid green, skull crest), mimic `rooms` with 8 rooms |
| **Sky Swing** (id `skyswing`) | swing tower | centre (200, -58), radius 9 | tower 40 m, 24 seats | style `skyswing` (gold and sky blue, star crest), mimic `tower` |
| **The Breakdance** (id `breakdance`) | breakdance: 4 arms of 4 cars on a turning platform | centre (200, 50), radius 12 | 6 m tall | style `kermis` (red, yellow and chrome, light-bulb crest), mimic `rotor` |
| **Top Spin** (id `topspin`) | top spin: a gondola of 20 between two arms | centre (204, 64), radius 8 | 16 m | style `topspin` (purple and neon, spiral crest), mimic `tower` variant showing the arm angle |
| **The fair stalls** | food: a candy floss stall, a poffertjes stall, a hook-a-duck game, a shooting gallery | along the path z -30 to -38 and z 26 to 34 | - | - |

---

## 8. The construction from stage to stage

- `pkXpSite` reads `S.expansion` and **skips every land rectangle already opened**. Each land rectangle is a named entry in a new table `PK_XP_LANDS` (id, x0, x1, z0, z1), using the numbers in sections 4 to 7.
- While a stage is **commissioned but not open**, its land gets twice the machines, and the building shells on it rise one floor per in-game day (from the stage 0 count to the count + 3).
- **The Skyline (stage 1)** turns every viaduct span to `track`, and the crawler cranes and pier scaffolds go. Before stage 1 the viaduct stays exactly as stage 0 built it.
- Site fencing round an opened land is replaced by the land's own fence: the park's iron palisade (part 24) with the land's gate at its way in.
- The countryside (town, farms, lake, forest, hills) is **not** changed by any stage, except the felling each stage names.

---

## 9. What is not part of this plan

Each of these needs tison's word and a new version of this file:
- Any land, ride or building not written above.
- Driving the Skyline Shuttle.
- Any change to the existing 20 rides, the Arena, the Lindenburg Railway or the park's gate.
- Moving the town, the farms or the lake.
- Prices for rides and food in the new lands. They follow the existing rides' pricing (part 05) unless tison sets them.

---

## 10. Sign-off

- [ ] tison approves this plan (date: ______). After that, any change is a new version, with the change listed here:

| Version | Date | Change | Approved by |
|---|---|---|---|
| 1 | 2026-10-28 | First draft | (pending) |
