# Snapcall components

Name UI components by their role, never with a `Snapcall` prefix. Every pressable uses the Snapcall press (moves down 2dp, fill 12% brighter, springs back) with `indication = null`. Only the components below are needed; do not add others without a design.

## PlayingCard

- White `card` face with `cardInk` or `suitRed` content. The rank sits top-left in `cardRank`, and the suit sits bottom-right as a vector drawable. Use 18dp suits on board cards and 30dp on hole cards.
- Sizes: board 54×76dp with 5dp corners; hole 80×110dp with 7dp corners. Shadows as in `tokens.md`.
- `highlighted`: a 3dp `right` outline at a 2dp offset. Use it for the cards that make the hand, or the helpful cards in a probability puzzle.
- `faded`: 28% opacity, for board cards that play no part once the answer is shown.
- Announce as "King of spades". Cards are not interactive.

## Plate and PlateChain

- A `Plate` is a text label on a fill with a slanted trailing edge. A plate in the middle of a chain slants on both sides.
- `PlateColor`: `Light` (`textPrimary` fill, `onLight` text), `Surface` (`surface` fill, `textPrimary` text), `Right` and `Wrong` (`onLight` text on the hue).
- A `PlateChain` overlaps consecutive plates by the slant, so they read as one strip.
- `ModuleChip` is the header's chain: a light `HAND STRENGTH` plate then a surface plate showing the round position (`HAND 3 OF 5`) or `ROUND COMPLETE`.

## RoundProgress

- Five 4dp segments, one per situation, filling the width beside the close button with 4dp gaps.
- Done segments: `textPrimary`. Current: `textPrimary` with the progress pulse. Upcoming: `outline`.
- Announce as "Situation 3 of 5". Retries do not add segments.

## CloseButton

- 44dp round, `surface` fill, 1dp `outline` border, 16dp cross in `textPrimary`.
- Content description "Quit round" during a round, "Close" on the round-complete screen.

## PokerTable and StreetLabels

- A full oval 190dp tall with a 2dp `outline` rim. Inside it are a 10dp inset ring in `background` and a 1dp `outline` inner line. The fill is a radial gradient from `tableGlow` to `tableFelt`.
- `StreetLabels` sit 30dp from the top of the table, above the board, in `label` style and `textMuted`, each underlined with a 2dp `outline` rule. FLOP spans the first three card columns; TURN and RIVER span one each.
- The board row is centered 54dp from the top. The two hole cards are centered 148dp from the top, so they overlap the table's lower edge like the player's seat.

## HandPlate

- Centered below the table: a light `YOU` plate chained to a surface plate.
- Before an answer, the surface plate shows `?` in `textPrimary`. After an answer, it shows the hand name in `handName` style and `right`, revealed with the plate wipe.

## AnswerButton and AnswerGrid

- `AnswerGrid` is a 2×2 grid of four `AnswerButton`s with 10dp gaps. Answers are lettered A to D in reading order.
- An `AnswerButton` is 60dp tall with 4dp corners: `surface` fill, 1dp `outline` border, and a 34dp `surfaceKey` key plate holding the letter on the left with an 8dp slant. The label is in `answer` style.
- `AnswerState`:
  - `Idle`: as above, tappable.
  - `Right`: `right` fill and border, `onLight` label with a trailing check, inverted key plate (`onLight` fill, `right` letter).
  - `Wrong`: `wrong` fill, `onLight` label with a strike-through, inverted key plate (`onLight` fill, `wrong` letter).
  - `Dimmed`: other answers, with `textDim` labels.
- After one answer the grid locks. The answer's state is announced, for example "Flush, wrong. Straight is right."

## ActionButton

- Full width inside the screen margin with 4dp corners and a `button` style label.
- Primary: `textPrimary` fill, `onLight` label, 56dp tall.
- Secondary: transparent with a 1dp `outline` border, `textPrimary` label, 48dp tall.
- There is no colored or destructive button yet.

## VerdictPanel

- A `surface` panel pinned to the bottom edge, with 20dp side padding and 24dp bottom padding plus the navigation bar inset. It slides up on answer without covering the `AnswerGrid`.
- Its verdict `PlateChain` sits 20dp above the panel's top edge:
  - Right: a `Right` plate with the hand name, then a `Surface` sub-plate with `FIRST TRY` in `right` on a first try.
  - Wrong: a `Wrong` plate naming the mistake, such as `NOT A FLUSH`.
- Body: one or two `body` sentences that name the exact cards.
- Wrong answers add a `label` line in `textMuted` with a retry icon: `THIS ONE COMES BACK BEFORE THE ROUND ENDS`.
- A primary `ActionButton` closes it: `GOT IT` after a wrong answer, `NEXT HAND` after a right one.

## StarRow

- Three stars centered in a 104dp row: 80dp on each side and 104dp in the middle, with 10dp gaps.
- Earned: `textPrimary` fill and stroke with the soft white glow. Unearned: transparent fill with a `outline` stroke.
- Stars pop in one at a time. Announce as "2 of 3 stars".

## HandRecapRow

- 42dp tall with 4dp corners: `surface` fill and a 1dp `outline` border, with a 30dp `surfaceKey` number plate on the left.
- The hand name in Barlow Condensed 700, 19sp, caps.
- A trailing chip: `FIRST TRY` with a 1dp `right` outline and `right` text, or `RETRIED` with a `wrong` fill, `onLight` text and a retry icon.
