# Snapcall tokens

All values are dp or sp. Broadcast is a dark design; there is no light palette yet.

## Color

| Token           | Value     | Use                                                                     |
| --------------- | --------- | ----------------------------------------------------------------------- |
| `background`    | `#141414` | Screen background ("studio")                                            |
| `spotlight`     | `#202020` | Center of the radial spotlight behind the table, fading to `background` |
| `surface`       | `#1E1E1E` | Answer buttons, panel plates, verdict panel, recap rows                 |
| `surfaceKey`    | `#2A2A2A` | A–D key plates and recap number plates                                  |
| `outline`       | `#303030` | 1dp borders, table rim, street underlines, upcoming progress segments   |
| `tableFelt`     | `#181818` | Edge of the table's radial fill                                         |
| `tableGlow`     | `#222222` | Center of the table's radial fill                                       |
| `textPrimary`   | `#F2F2F2` | Primary text, primary button fill, light plates, done progress, stars   |
| `textSecondary` | `#B8B8B8` | Secondary body text                                                     |
| `textMuted`     | `#9E9E9E` | Labels, street names, secondary captions                                |
| `textDim`       | `#8C8C8C` | Answers that were not picked, once answered                             |
| `onLight`       | `#141414` | Text on light, `right` and `wrong` fills                                |
| `card`          | `#FFFFFF` | Card faces only                                                         |
| `cardInk`       | `#141414` | Spades and clubs, card ranks                                            |
| `suitRed`       | `#D7263D` | Hearts and diamonds                                                     |
| `right`         | `#4CC3FF` | Right answers, cards that make the hand, helpful cards, "First try"     |
| `wrong`         | `#E5672A` | Wrong picks, wrong verdicts, "Retried"                                  |
| `scrim`         | black 50% | Card and panel shadows                                                  |

`right` and `wrong` are the only hues in the interface. They differ in lightness as well as hue, and every use pairs them with an icon, strike-through or label.

Contrast, measured from the opaque sRGB pairs:

- `textPrimary` on `background`: 16.46:1; on `surface`: 14.89:1.
- `textMuted` on `background`: 6.88:1; on `surface`: 6.22:1.
- `textDim` on `surface`: 4.96:1.
- `onLight` on `textPrimary`: 16.46:1; on `right`: 9.26:1; on `wrong`: 5.53:1.
- `right` on `surface`: 8.38:1. `wrong` on `surface`: 5.01:1.
- `suitRed` on `card`: 4.96:1. `cardInk` on `card`: 18.42:1.

## Type

| Style      | Family                      | Size / line height | Tracking | Use                                       |
| ---------- | --------------------------- | ------------------ | -------- | ----------------------------------------- |
| `prompt`   | Barlow Condensed 800 italic | 40 / 37            | 0        | Puzzle question, caps, centered           |
| `score`    | Barlow Condensed 800 italic | 96 / 82            | 0        | Round-complete score                      |
| `verdict`  | Barlow Condensed 800 italic | 28 / 44            | 0        | Verdict plate, caps                       |
| `handName` | Barlow Condensed 800 italic | 18 / 30            | 0.04em   | Hand plate after an answer, caps          |
| `answer`   | Barlow Condensed 700        | 22 / 28            | 0.04em   | Answer buttons, caps                      |
| `button`   | Barlow Condensed 800        | 20 / 24            | 0.08em   | Action buttons, caps                      |
| `chip`     | Barlow Condensed 700–800    | 15 / 32            | 0.06em   | Module chip and chained plates, caps      |
| `label`    | Barlow Condensed 700        | 12 / 16            | 0.16em   | Street names, section labels, notes, caps |
| `cardRank` | Barlow Condensed 700        | 26 board, 40 hole  | 0        | Card ranks                                |
| `body`     | Barlow 400                  | 16 / 22            | 0        | Corrections, one or two sentences         |

Use tabular figures for scores, counts and odds so numbers do not shift while animating.

## Shape

- Plates: flat rectangles with 4dp corners and 12–16dp side padding. Never slanted. Chained plates sit 4dp apart (6dp for the verdict chain).
- Buttons and answer buttons: 4dp corners.
- Cards: 5dp board, 7dp hole.
- Table: a full oval.
- Close button: fully round.

## Spacing and size

- Screen margin: 20dp. Vertical gap between sections: 18dp.
- Board cards: 54×76dp with 6dp gaps (294dp row). Hole cards: 80×110dp with 4dp gaps, tilted −6° and +5° (the second also drops 5dp).
- Table: 190dp tall, extending 6dp past the screen margin on each side. The board sits 54dp from its top; the hole cards sit 148dp from its top, overlapping its lower edge.
- Answer buttons: 60dp tall in a 2×2 grid with 10dp gaps. Key plate: 34dp wide.
- Action buttons: 56dp primary, 48dp secondary.
- Progress segments: 4dp tall with 4dp gaps.
- Close button: 44dp.

## Elevation

- Board cards: shadow y 6, blur 14, `scrim` 45%.
- Hole cards: shadow y 14, blur 30, `scrim` 60%.
- Verdict panel: shadow y −20, blur 40, `scrim` 50%.
- Earned stars: a soft white glow (blur 14, white 22%).

## Motion

Ease out with `cubic-bezier(0.2, 0.8, 0.2, 1)` unless noted. With "Remove animations" on, every animation snaps to its end state.

| Motion          | Duration | Delay                                                           | Notes                                          |
| --------------- | -------- | --------------------------------------------------------------- | ---------------------------------------------- |
| Deal-in         | 420ms    | Flop 100, 180, 260ms; turn 500ms; river 740ms; hole 950, 1050ms | From 36dp above, 92% scale, transparent        |
| Hand plate wipe | 350ms    | 150ms after the answer                                          | Left-to-right reveal                           |
| Verdict slide   | 320ms    | On answer                                                       | Slides up from below the screen                |
| Verdict plate   | 400ms    | 120ms, sub-plate 240ms                                          | Left-to-right wipe                             |
| Card fade       | 250ms    | On answer                                                       | Unused board cards fade to 28%                 |
| Press           | spring   | —                                                               | Moves down 2dp, fill 12% brighter              |
| Progress pulse  | 1.6s     | Looping                                                         | Current segment only, opacity 100% to 45%      |
| Star pop        | 500ms    | 250ms, then every 220ms                                         | Scale from 0 with −30° turn, overshoot to 118% |
| Recap rows      | 300ms    | 1.3s, then every 70ms                                           | Slide in 24dp from the left                    |
| Pass plate      | 450ms    | 1.2s                                                            | Left-to-right wipe                             |
