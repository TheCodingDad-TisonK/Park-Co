# Danse Macabre - design and build plan (replaces the Haunted Manor)

**Version 1, drafted 2026-10-29. Awaiting tison's sign-off. Once signed, this plan is binding.**

This is the complete plan for turning Park Co's Haunted Manor into **Danse Macabre**, the
modern successor to Efteling's Spookslot. It mirrors what happened in the real park: the old
haunted house goes, and a next-generation spooky show ride takes its plot, its level and its
place in the Dark Woods. The ride keeps the park at 20 rides, so the power board, the HQ map and
the "20 unique rides" claim stay true.

Where this plan does not say something, the agent does not invent it. It stops and asks tison,
and the answer is written back into this file before building.

---

## 0. The real attraction (research)

Danse Macabre opened at Efteling (Netherlands, Anderrijk area) on 31 October 2024 on the site of
the old Spookslot haunted castle. It is the first installation of Intamin's **Dynamic Motion
Stage**: a round platform that rises, tilts and spins, carrying six "choir stalls" of guests
inside a ruined Gothic abbey.

**Fixed facts from the sources:**

| Fact | Value |
|---|---|
| Location | Huyverwoud ("Shiverwood"), a forest round the abbey |
| Building | The "Abbey of Huyverwoud" (also called Abbey of Capelle van Kaatsheuvel), a ruined Gothic abbey about 20 m tall |
| Ride system | Intamin Dynamic Motion Stage (world's first), described as a blend of a dynamic show and a thrill ride |
| Vehicles | 6 choir stalls, 18 riders each (3 rows of 6), 108 per cycle |
| Throughput | 1250 riders per hour |
| Duration | 3:30 |
| Drop | 3 m (the finale) |
| Height restriction | 120 cm, minimum age 8, single-rider line, must transfer from a wheelchair |
| Cost | about EUR 35 million |
| Music | Saint-Saens' Danse macabre (1874), rearranged by Audiocult to about 3 minutes |
| Theme manufacture | In-house plus Garner Holt Productions (the animatronics) |

**The story.** On Friday the 13th in 1876 an international music competition was held in the
abbey. Conductor Joseph Charlatan and his orchestra performed the Danse Macabre, then vanished.
They were killed and cursed by **Het Onnoembare** ("The Unnameable"), a shapeshifter that usually
appears as an innocent black kitten. Each night the orchestra replays the piece, and the
Unnameable lures in more victims. In the present, Joseph's descendants Virginie and Otto Charlatan
have set up camp beside the abbey to sell merchandise and warn visitors about the kitten.

**The queue, start to finish** (from the walkthrough report):

1. Two stone pillars at the entrance: a monk statue on one, a black kitten on the other that
   follows guests with its head.
2. The Kruysgang (remains of a cloister), then the Kruydentuyn (herb garden, its plant labels
   shaped like tombstones).
3. A large wooden gate, opened by staff.
4. A graveyard pre-show: a deep voice recounts the 1876 events, the graves of the orchestra
   members, a drinking fountain that squirts water, and a central mausoleum of Joseph Charlatan
   whose door shakes if touched.
5. A gate at the back, a foggy forest path, and a wooden bridge up to the abbey.

**Inside.** The entrance hall holds a violin glowing through a cloth and a window through which
the **operator cabin** can be glimpsed. Six near-black corridors (the Catacomben, lit by reused
Spookslot torches) lead to a decagonal chapel. Six choir stalls face a container of instruments
in the middle, with the kitten hiding between them. After lap bars close, the show runs:
lightning strikes the container, the room goes black, the organ lights, Joseph Charlatan's ghost
appears and conducts; the stalls waltz, the floor rises and tilts; rose-window animatronics (a
pianist, a harpist, a triangle trio) reveal themselves; scrim walls turn transparent to show a
monk choir; at the climax "Vade retro" sounds and the platform drops 3 m; the piece ends and the
kitten meows. Below the tilting floor is a crypt with a sarcophagus and an undead figure.

**Exit.** A staircase to ground level, then the souvenir shop "Dr. Charlatans Kwalycke Zaken" and
a confession booth. Reduced-mobility guests watch a film version in a room called 't Gewelf
(The Vault).

**Sources**

- Dark Ride Database, "Giving Danse Macabre at Efteling a Spin" (walkthrough, Nov 2024): https://darkridedatabase.com/report-giving-danse-macabre-at-efteling-a-spin/
- Coasterpedia, "Danse Macabre" (specs and story): https://coasterpedia.net/wiki/Danse_Macabre
- Wikipedia, "Danse Macabre (Efteling)": https://en.wikipedia.org/wiki/Danse_Macabre_(Efteling)
- Intamin, "Danse Macabre" (the Dynamic Motion Stage): https://www.intamin.com/project/danse-macabre/
- Efteling press, media kit: https://www.efteling.com/en/press/media-kit-danse-macabre---efteling/

---

## 1. What changes in Park Co

Danse Macabre replaces the Haunted Manor in place. The ride id changes from `haunted` to `danse`,
the name to "Danse Macabre", and everything keyed on `haunted` is repointed. The plot position,
queue head and level stay as they were, so the Dark Woods layout, the route and the signpost
direction do not move.

**Decisions signed by tison (2026-10-29):**

- **Placement:** replace the Haunted Manor (its plot, level 11, Dark Woods land). No new land, no
  demolition of anything else.
- **Scale:** Park-Co scale. 6 choir stalls of 6 seats = 36 seats. An abbey about 14 m tall. A show
  of about 60 s. The full motion (spin, tilt, rise, 3 m drop) and the full beat list.
- **Operator room:** an indoor glazed control cabin at the chapel, matching the real one, built on
  the part 16 cabin kit, with a window the queue can glimpse.

The ride count stays 20. The Haunted Manor's existing graveyard becomes the Danse Macabre
graveyard pre-show (the orchestra's graves and Joseph Charlatan's mausoleum), which is exactly the
job the real graveyard does.

---

## 2. Placement and footprint

- **Plot:** `{ id: 'danse', name: 'Danse Macabre', x: -58, z: -24, r: 12, q: [-44, -24], qdx: 1, level: 11, pad: 0.02 }`.
  The old plot is `r: 9.5`; the radius grows to 12 because the abbey and its chapel need the room.
  The centre, the queue head and the level (11) do not change.
- **Clearance (rule 2 of the expansion plan):** test the new pad before anything is placed. The
  west park fence sits at x -72 (2 m clear of the pad edge at x -70), the Dark Woods street runs
  at x -31, and the drop tower stands at (-54, -52). The bigger pad must keep clear of all three.
  If it fails, stop and ask tison; do not shift it on your own.
- The queue lane is the standard switchback (`pkAttrLane`), unchanged in shape: head at
  (-44, -24), running east toward the street, as the Haunted Manor's lane did.

---

## 3. The outside (the exterior)

The Haunted Manor's clapboard Victorian house is rebuilt as a **ruined Gothic abbey**. The front
faces the Dark Woods street (east).

- **Mass:** a stone abbey about 16 m wide, 16 m deep and 14 m tall at the ridge, on a stone base.
  Use the `M.stone` / `M.stoneDark` kit and a slate roof.
- **Ruin dressing:** one collapsed roof section and a cracked, stepped gable over the entrance
  portal, so it reads as a disaster site, not a new build. A round corner tower with a pointed
  slate roof and a few flying-buttress stubs against the walls.
- **The entrance portal:** a pointed Gothic arch over the front doors, with the two story pillars
  beside it: a monk statue on one, a small black kitten on the other (the kitten is a static
  figure; it does not need to track guests, but a small rotation that eases toward the nearest
  queued guest is a nice-to-have and is written here as optional).
- **Sign:** `DANSE MACABRE` over the portal, in the Dark Woods' sign colours
  (bg `#1b232c`, fg `#ff8a3d` / `#ff9a52`), matching the signpost and land arch.
- **The front doors** are the ride's gates (`pkCtl(a).gateObjs`), as the Haunted Manor's doors
  were: they swing open on boarding and shut for the show. Inside them is the entrance hall.

The graveyard already around the plot is kept and rebranded: headstones, dead trees and the iron
fence stay, but the headstones now bear the orchestra's names, and one central stone becomes
Joseph Charlatan's mausoleum (a statue on one side, a door on the other; the door shakes when the
player touches it, using the existing door-interact hook).

---

## 4. The queue (the lane and the pre-show)

The switchback lane is unchanged mechanically. The theming around it tells the story in order:

1. **Entry (street side):** the two stone pillars stand at the lane entry, monk and kitten as in
   section 3.
2. **The cloister and herb garden:** along the first run of the lane, low ruined cloister walls and
   a strip of herb garden with tombstone-shaped plant labels.
3. **The graveyard pre-show:** the rebranded graveyard (section 3) wraps the lane. A soft spoken
   line plays on a loop near the lane (reuse the narration hook the Arena and booth voices use; the
   exact text is the 1876 story from section 0).
4. **The gate:** the lane ends at the boarding gate in front of the abbey doors. The switchback
   fence is the standard `PK_THEME` lane fence (part 24), so the lane is fenced like the other
   themed rides.

**Indoor reveal rule (rule 4 of the expansion plan):** guests reach the stalls through the
entrance hall and a corridor; they never see the chapel set from the queue. The doors and the
`pkLocalSolid` walls enforce this, as the Haunted Manor's did.

---

## 5. The ride itself (the chapel and the Dynamic Motion Stage)

The ride is a show inside the abbey: six choir stalls on a round platform that spins, tilts and
rises, with a 3 m drop at the end.

### 5.1 The chapel

- A decagonal (10-sided) room about 12 m across and 10 m high, dimly lit by a few point lights
  plus torch points on the walls (the Catacomben torches). The only bright object at rest is the
  **organ** high on one wall.
- A short, near-black entrance corridor leads from the entrance hall to the chapel, so guests'
  eyes "adjust" as they enter. Static torch meshes line it.
- The **organ** is on the west wall, high up; its middle section rotates 180 degrees during the
  show to reveal the ghost of Joseph Charlatan (a simple posed figure with a baton; no full
  animatronic is required, but the rotation is).
- A **container of instruments** stands at the centre of the platform, with a small black kitten
  figure tucked between them.
- Around the walls: three rose windows holding the orchestra - a pianist, a harpist and a triangle
  trio (simple figures or lit silhouettes; the pianist's head turn is a nice-to-have). The walls
  in front of them use a scrim that can turn transparent during the show to reveal a monk choir.
- Below the floor, the **crypt**: a sarcophagus with an undead figure half out of it, visible only
  when the platform tilts.

### 5.2 The ride system (mapped onto the part 05 seat/mover kit)

- A `pkMover` "spin" group carries the platform; a parent group carries the tilt; the height is
  animated on the platform's own `y`. This is the same pattern as the carousel's spin plus the
  drop tower's height, so no new machinery code is invented, only a `tickRun` that drives all
  three together.
- **Six choir stalls** in a ring, each holding 6 seats in 3 rows of 2 (36 seats total). Each stall
  is themed as a church bench with a carved back and a lap bar. Seats are `{ par: stall, x, y, z, ry }`
  so a guest sits and rides with the stall, and the whole ring turns with the platform.
- **Restraints:** one lap bar per stall, added to `pkCtl(a).barObjs` (a bar over each of the 6
  seats lowers and raises together, like the flume's per-boat bars).
- **Gates:** the abbey's front doors (section 3) via `gateObjs`; boarding happens inside, so the
  doors close for the show and reopen to unload.

### 5.3 The show (the beats, driven from `start` and `tickRun`)

The ride runs about 60 s (`run: 60`). The beats, in order, mapped to `at.t`:

| t (s) | Beat | What the code does |
|---|---|---|
| 0 | Lightning | a white flash light + the container "smokes" (a `burst`/particle puff, the flume's `burst` reuse) |
| 1-3 | Blackout | kill the room lights; play footsteps; the kitten meow turns to a growl (sfx) |
| 3-6 | The organ | organ lights up; the stalls rotate to face it (spin the platform to the organ heading) |
| 6-8 | The ghost | the organ's middle section rotates 180 deg to reveal Joseph Charlatan; he conducts |
| 8-30 | The waltz | the music plays; stalls spin slowly; the platform begins to rise and tilt side to side |
| 30-36 | Intermezzo | stalls stop; room lights once; a violin plays |
| 36-50 | The build | spin speeds up; dynamic lights chase; the rose-window orchestra reveals itself |
| 50-54 | The scrim | the scrim walls turn transparent to show the monk choir |
| 54-57 | Climax | platform rises to its maximum height; lights dim; "Vade retro" (sfx) |
| 57-58 | The drop | lightning; the platform drops 3 m back to the deck |
| 58-60 | The end | violin finishes; the ghost and orchestra are gone; the kitten meows |

**Motion envelope:** platform diameter about 11 m, spin up to about 0.6 rad/s, tilt up to about
12 degrees, rise of about 1.5 m, then the 3 m drop. All eased in and out so it "dances" rather
than whips; the ferris's eased-curve trick in `tickRun` is the reference for the easing.

**The music and sounds:** the ride needs its own sfx hooks (an organ/violin sting for the desk's
voice button and the beats). These are new `sfx` entries; list them in section 8 as new, not
reused. The in-game piece is a short loop of a waltz, not a licensed recording.

---

## 6. The operator room (the control cabin)

Built on the part 16 indoor-cabin kit (`pkIndoorCabin`), which already delivers the glazed cabin,
desk, cabinet, monitors, clock, key box, chair, lights, switch, camera and status screen. The
differences from the coaster cabins:

- **Position:** in the chapel's north-west corner, glazed toward the chapel so the operator sees
  the platform and the stalls. The cabin's own glazing doubles as the "window the queue can
  glimpse" from the entrance hall, matching the real ride (the DRdb walkthrough notes this
  window).
- **Theme:** stone and dark timber, not the coaster cabins' steel band; the `* · CONTROL` sign
  reads `DANSE MACABRE · CONTROL` in the Dark Woods sign colours.
- **The desk** carries the ride's own panel sheet (section 6.1) via `pkBoothPanel`, and the booth
  hardware is registered on the ride (`a.booth`, `a.boothScreen`, `a.boothLights`, `a.boothClock`,
  `a.boothDoor`) exactly as `pkIndoorCabin` does.

### 6.1 The panel sheet (`PK_PANEL.danse`)

- **Style:** reuse the existing `gothic` style (stone, candle-glow, iron rim), which the Haunted
  Manor already wears, so the crest and mimic carry the new identity without a new style. A new
  `danse` style (stone plus a music-staff pinstripe) is optional polish and is noted, not built.
- **Crest (`PK_PN_CRESTS.danse`):** a conductor's baton crossed with a violin, or a black kitten's
  silhouette under a skull - tison picks one at build time; the plan defaults to the baton and
  violin.
- **Sheet fields:**

| Field | Value |
|---|---|
| `style` | `'gothic'` |
| `title` | `'Danse Macabre'` |
| `model` | `'DYNAMIC MOTION STAGE 6 · 36 SEATS · 3 M DROP'` |
| `kind` | `'stage'` (new mimic, section 6.2) |
| `seatCol` | `0xff8a3d` |
| `caps` | `{ test: 'purple', station: 'cream' }` |
| `g2` (second dial) | `{ unit: 'deg', min: 0, max: 14, ticks: 7, red: 0.86, get: function (T) { return T.tilt / 14; } }` |
| `sig` (voice button) | `{ label: 'ORGAN', sfx: 'pkDanseOrgan', words: 'the organ strikes up the danse', col: 'purple' }` |
| `ann` (hood windows) | `[['voice', 'ORGAN', '#ff8a3d'], ['motion', 'PLATFORM\nTILT', '#c9a0ff']]` |
| `tele` | `function (a, C, T) { return ['PLATFORM ' + T.h.toFixed(1) + ' M  TILT ' + T.tilt.toFixed(0) + ' DEG', 'STALLS ' + T.n + '  BEAT ' + T.beat]; }` |

### 6.2 The mimic (`PK_PN_KINDS.stage`)

A new mimic, drawn in the same window as the others. It shows the six stalls as six small boxes in
a ring (their real positions, as `rotor` does for the cups), a centre pip for the instrument
container, a tilt bar beside the ring, and a beat readout. Each stall's pip lights when a rider is
in it, and dims as it unloads, mirroring the `rooms` mimic's room-by-room lighting but for stalls
instead of rooms. The probe `T` exposes `{ n, h, tilt, beat }`.

---

## 7. The full touch-point list (every edit)

Edit `src/` only, then `npm run build`. Never edit `game/game.js` (it is generated). No em dashes
or en dashes anywhere shipped.

| File | Change |
|---|---|
| `src/01-park.js` (line 24) | plot id `haunted` -> `danse`, name `Danse Macabre`, `r: 9.5` -> `12`; keep x, z, q, level |
| `src/04-ui.js` (line 161) | help text "haunted house" -> "Danse Macabre" |
| `src/05-attractions.js` (line 345) | makers map `haunted: pkBuildHaunted` -> `danse: pkBuildDanse` |
| `src/05-attractions.js` (795-872) | replace `pkBuildHaunted` with `pkBuildDanse` (exterior, chapel, 6 stalls, platform, show) |
| `src/06-dress.js` (line 12) | `PK_THEME.haunted` -> `PK_THEME.danse` (new colours: e.g. `a: 0x4a4a55, b: 0xff8a3d, ground: 0x6e6a60` kept, name `'Danse Macabre'`) |
| `src/06-dress.js` (line 190, 345) | the `haunted` special cases -> `danse` (keep or adapt the station handling) |
| `src/12-themepark.js` (line 21, 272) | comment; signpost `HAUNTED MANOR` -> `DANSE MACABRE` |
| `src/14-controls.js` (line 905) | name table `['haunted', 'HAUNTED HOUSE']` -> `['danse', 'DANSE MACABRE']` |
| `src/14-panels.js` (line 212) | `PK_PN_CRESTS.haunted` -> `PK_PN_CRESTS.danse` (new crest) |
| `src/14-panels.js` (line 420) | `PK_PANEL.haunted` -> `PK_PANEL.danse` (the sheet in 6.1) |
| `src/14-panels.js` (line 665) | add `PK_PN_KINDS.stage` (6.2); the `rooms` kind stays only if still referenced, otherwise it can be removed with the manor |
| `src/18-hq.js` (line 383) | `LANDS` Dark Woods `'haunted'` -> `'danse'` |
| `tests/visual.js` (line 19, 90) | shot `06-haunted` -> `06-danse`; open list `'haunted'` -> `'danse'` |
| `tools/shots.js` (line 54) | open list `'haunted'` -> `'danse'` |
| new `src/` part | the sfx entries for `pkDanseOrgan` and the show beats (organ, growl, footsteps, "Vade retro", meow) |

The Haunted Manor's `PK_PN_KINDS.rooms` mimic and its `gothic` style are the pieces Danse Macabre
inherits; the `rooms` mimic is replaced by `stage`, the `gothic` style is reused.

---

## 8. Ride parameters

| Field | Value |
|---|---|
| `id` | `danse` |
| `name` | `Danse Macabre` |
| `level` | 11 (unchanged) |
| `cap` | 36 (6 stalls of 6) |
| `board` | 14 |
| `run` | 60 |
| `unload` | 6 |
| `exit` | the chapel's exit stairs to the south-east, then to the shop |
| `panel` | as in section 6.1 |

**Pricing:** follows the existing rides' pricing (part 05), as the expansion plan's rule 9 says,
unless tison sets a price.

---

## 9. Verification (before it is called done)

- `npm test` is green, and the smoke suite covers `danse`: it opens, boards 36, runs the full show,
  unloads. The old `haunted` check is repointed or removed with the manor.
- Headless probes: guests route from the Dark Woods street into the queue and through the doors to
  a stall; the pad clears the west fence, the street and the drop tower (section 2).
- Screenshots: the abbey from above and from the queue at eye level, the chapel by day and by
  night, the control cabin outside and its desk inside. Then tison looks in-game.
- Release notes to tison's Desktop. `CHANGELOG.md` and `TODO.md` are updated only when tison asks
  for a commit. Work on a branch named `feat/danse-macabre`.

---

## 10. Open items (ask tison, then write back here)

- [ ] The crest: baton and violin (default) or black kitten under a skull.
- [ ] Whether to add the `danse` panel style (stone + music-staff pinstripe) instead of reusing
      `gothic`.
- [ ] The show's music: a new short waltz loop is assumed; confirm no licensed recording is wanted.
- [ ] The kitten: static figure (built) or a head that eases toward the nearest queued guest
      (optional, small extra).

---

## 11. Sign-off

- [ ] tison approves this plan (date: ______). After that, any change is a new version:

| Version | Date | Change | Approved by |
|---|---|---|---|
| 1 | 2026-10-29 | First draft | (pending) |
