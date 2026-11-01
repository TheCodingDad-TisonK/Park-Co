# Handoff: the expansion gate (part 53)

Written 2026-10-30. All subagents are stopped. Nothing is committed. Branch: `feat/expansion-stage-1`.

## What was asked
Plan section 2 and section 8: an Expansion page on the HQ office PC, commissioning that pays the
cost, three in-game days of construction, the land opening on the third night at 06:00, the state in
`S.expansion = { stage, commissioned, opened }`, a tablet readout of the days left, and `pkXpSite`
skipping every land already opened.

## What exists (all on disk, uncommitted)
| File | Change |
|---|---|
| `src/53-expansion.js` (new, 178 lines) | `PK_XP_STAGES` (the plan's five), `PK_XP_LANDS` (north, woods, harbour, eastNorth, eastSouth), `pkExpState`, `pkExpansionOpen`, `pkExpansionNext`, `pkExpansionDaysLeft`, `pkExpansionLandAt`, `pkExpansionOpenedLandAt`, `pkExpansionLandFence`, `pkExpansionFenceOpened`, `pkExpansionCommission`, `pkExpansionTick`, `pkExpansionTabletLine` |
| `src/01-park.js` | `expansion` in `freshState`; `migrate` gives old saves the state |
| `src/04-ui.js` | one `pkExpansionTick()` at the end of `pkTick` |
| `src/25-office-pc.js` | Expansion app, dock reflow for eight apps, `pkPCExpansion`, tablet line |
| `src/46-world.js` | (by the parent) `pkXpBand` and `pkXpClear` skip an opened land; the site fence leaves a gap; `pkXpSite` builds the opened lands' own fences |

Probe evidence: level 26 required (refused at level 1), bank refused when short, commission paid
$250,000 and set `{stage:1,commissioned:1,opened:[]}`, days left 3, the tablet read it, the stage
opened once at 06:00 on the third night and never twice across a reload.

## Known gaps
- Doubled machines and shells rising a floor per day while commissioned: not built (part 46 owns the
  site props and shells). For stage 1 this does not bite, because stage 1 has no land.
- Site props inside a land opened during play are not removed; the fence appears round them.
- The land gate is an open archway; there are no closing leaves.
- The Expansion app is visible in the dock from level 1 (it explains the level and the button is disabled).
- The construction day log repeats once per session after a reload (no saved field for the last logged day).
- `pkExpansionLandFence` uses `pkParkFence`, not `pkPalisade`. The plan says "the park's iron palisade".
  One-line swap if the literal outer palisade is wanted.
