# Snapcall components

Name UI components by their role, never with a `Snapcall` prefix. Every pressable uses the Snapcall press (moves down 2dp, fill 12% brighter, springs back) with `indication = null`. Only the components below are needed; do not add others without a design.

## PlayingCard

- White `card` face with `cardInk` or `suitRed` content. The rank sits top-left in `cardRank`, and the suit sits bottom-right as a vector drawable. Use 18dp suits on board cards and 24dp on hole cards.
- Sizes: board 54×76dp with 5dp corners; hole 64×88dp with 7dp corners. Shadows as in `tokens.md`.
- `highlighted`: a 3dp `right` outline at a 2dp offset. Use it for the cards that make the hand, or the helpful cards in a probability puzzle.
- `faded`: 28% opacity, for board cards that play no part once the answer is shown.
- `selected`: lifted 10dp and scaled to 110%, with a 3dp `textPrimary` outline at a 2dp offset, while the player is picking.
- `wrongPick`: a 3dp `wrong` outline, for a picked card that is not in the best five once the pick is locked in.
- Announce as "King of spades", adding ", selected" while selected. Cards are only interactive inside a `CardPicker`.

## InlineCard

- Any card named in text (verdicts, corrections, tutorial copy) is an `InlineCard`, never letters like "K Q J". It is a 20dp-tall white `card` chip with 3dp corners and 5dp side padding, holding the rank in `cardRank` at 16sp and a 9dp suit 2dp apart, centered, in `cardInk` or `suitRed`.
- It is centered on the line's cap height (baseline offset −3dp), with 2dp between chips and a 2dp shadow. A run of cards does not wrap. Body text around inline cards uses a 1.6 line height so the chips don't crowd the lines.
- Announce each as "King of spades".

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

## CardPicker and LockInButton

How the player answers a hand-strength puzzle. There is no multiple choice: the answer is the five cards themselves.

- `CardPicker` makes the seven cards on the `PokerTable` (five board, two hole) toggleable. A tap selects or deselects a card (`selected`). Once five are selected, the other two dim to 40% and further taps on them do nothing until a card is deselected.
- `LockInButton` is pinned to the bottom of the screen, 60dp tall and full width, with 4dp corners and an `answer` style label. With fewer than five cards selected it is disabled: `surface` fill, 1dp `outline` border, `textDim` label counting the pick ("3 of 5 picked"). With five it reads `Lock in` with a `textPrimary` fill and `onLight` label.
- There is no prompt line or separate counter; the lifted cards and the button carry it.
- On lock in, the picker locks. Cards in the best five get the `right` outline, selected cards outside it get `wrongPick`, and both stay at 110%; the rest fade to 28%. The `VerdictPanel` replaces the `LockInButton`.
- The pick is right when it ties the best hand (same category and kickers), even if it uses different cards.
- Announce the result, for example "King high, wrong. Your best hand is a straight."

## ActionButton

- Full width inside the screen margin with 4dp corners and a `button` style label.
- Primary: `textPrimary` fill, `onLight` label, 56dp tall.
- Secondary: transparent with a 1dp `outline` border, `textPrimary` label, 48dp tall.
- There is no colored or destructive button yet.

## VerdictPanel

- A `surface` card with a 1dp `outline` border, 8dp corners and 16dp padding, pinned to the bottom of the screen in place of the `LockInButton`. It slides up 24dp and fades in on lock in, and never covers the table.
- It starts with a 36dp plate naming the hand the player built: a `Right` plate for a right pick (`Straight, king high`), or a `Wrong` plate for a wrong one (`King high`).
- Body: one or two `body` sentences that name the exact cards as `InlineCard`s.
- A primary `ActionButton`, 52dp tall inside the card, closes it: `Got it` after a wrong pick, `Next hand` after a right one.

## StarRow

- Three stars centered in a 104dp row: 80dp on each side and 104dp in the middle, with 10dp gaps.
- Earned: `textPrimary` fill and stroke with the soft white glow. Unearned: transparent fill with a `outline` stroke.
- Stars pop in one at a time. Announce as "2 of 3 stars".

## HandRecapRow

- 42dp tall with 4dp corners: `surface` fill and a 1dp `outline` border, with a 30dp `surfaceKey` number plate on the left.
- The hand name in `handName` style, sentence case.
- A trailing 20dp icon: a check in `right` for a hand answered right, or an X in `wrong` for a missed hand. Announce as "Right" or "Missed".
