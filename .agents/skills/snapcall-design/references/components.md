# Snapcall components

Name UI components by their role, never with a `Snapcall` prefix. Every pressable uses the Snapcall press (moves down 2dp, fill 12% brighter, springs back) with `indication = null`. Only the components below are needed; do not add others without a design.

## PlayingCard

- White `card` face with `cardInk` or `suitRed` content. The rank sits top-left in `cardRank`, and the suit sits bottom-right as a vector drawable. Use 18dp suits on board cards and 24dp on hole cards.
- Sizes: board 54×76dp with 5dp corners; hole 64×88dp with 7dp corners. Shadows as in `tokens.md`.
- `highlighted`: a 3dp `right` outline at a 2dp offset. Use it for the cards that make the hand, or the helpful cards in a probability puzzle.
- `faded`: 28% opacity, for board cards that play no part once the answer is shown.
- Announce as "King of spades". Cards are not interactive.

## Plate and PlateChain

- A `Plate` is a text label on a flat fill with 4dp corners. It is never slanted or skewed.
- `PlateColor`: `Light` (`textPrimary` fill, `onLight` text), `Surface` (`surface` fill, `textPrimary` text), `Right` and `Wrong` (`onLight` text on the hue).
- A `PlateChain` sets consecutive plates in a row 4dp apart (6dp for the verdict chain), so they read as one caption.

## ModuleBreadcrumb

- The header's location, as plain text with no plates or fills: the module (`Hand strength`) in `textMuted`, a 12dp chevron in `textMuted`, then the current step (`Hand 3 of 5` or `Round complete`) in `textPrimary`.
- `breadcrumb` style, sentence case, with 6dp gaps between parts.
- Announce as "Hand strength, hand 3 of 5". It is not interactive yet.

## RoundProgress

- Five 4dp segments, one per situation, filling the width beside the close button with 4dp gaps.
- Done segments: `textPrimary`. Current: `textPrimary` with the progress pulse. Upcoming: `outline`.
- Announce as "Situation 3 of 5".

## CloseButton

- 44dp round, `surface` fill, 1dp `outline` border, 16dp cross in `textPrimary`.
- Content description "Quit round" during a round, "Close" on the round-complete screen.

## PokerTable and StreetLabels

- A full oval 190dp tall with a 2dp `outline` rim. Inside it are a 10dp inset ring in `background` and a 1dp `outline` inner line. The fill is a radial gradient from `tableGlow` to `tableFelt`.
- `StreetLabels` sit 30dp from the top of the table, above the board, in `label` style and `textMuted`, each underlined with a 2dp `outline` rule. FLOP spans the first three card columns; TURN and RIVER span one each.
- The board row is centered 54dp from the top. The two hole cards are centered 148dp from the top, so they overlap the table's lower edge like the player's seat.

## AnswerButton and AnswerGrid

- `AnswerGrid` is a 2×2 grid of four `AnswerButton`s with 10dp gaps. Answers are lettered A to D in reading order.
- An `AnswerButton` is 60dp tall with 4dp corners: `surface` fill, 1dp `outline` border, and a 34dp `surfaceKey` key plate holding the letter on the left, square on its inner edge. The label is in `answer` style.
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

- A `surface` card with a 1dp `outline` border, 8dp corners and 16dp padding, placed directly above the `AnswerGrid` with an 18dp gap. It slides up 24dp and fades in on answer, and never covers the answers.
- Right answers get no plate: the highlighted answer already shows what was right.
- Wrong answers start with a `Wrong` plate naming the mistake, such as `Not a flush`, 36dp tall.
- Body: one or two `body` sentences that name the exact cards.
- A primary `ActionButton`, 52dp tall inside the card, closes it: `Got it` after a wrong answer, `Next hand` after a right one.

## StarRow

- Three stars centered in a 104dp row: 80dp on each side and 104dp in the middle, with 10dp gaps.
- Earned: `textPrimary` fill and stroke with the soft white glow. Unearned: transparent fill with a `outline` stroke.
- Stars pop in one at a time. Announce as "2 of 3 stars".

## HandRecapRow

- 42dp tall with 4dp corners: `surface` fill and a 1dp `outline` border, with a 30dp `surfaceKey` number plate on the left.
- The hand name in `handName` style, sentence case.
- A trailing 20dp icon: a check in `right` for a hand answered right, or an X in `wrong` for a missed hand. Announce as "Right" or "Missed".
