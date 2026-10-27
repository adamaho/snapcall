# Snapcall screens

Widths assume a 390dp-wide phone in portrait; everything is fluid horizontally. Copy is provisional sample content unless marked final. Anything not described here is out of scope (see "Scope" in `SKILL.md`).

## 1. First-round tutorial

Shown once, before the player's first round in a module, so the puzzle screens never need to repeat the question. Three steps, advanced with one primary `ActionButton` (`Next`, then `Start round` on the last step). The `CloseButton` ("Skip tutorial") skips it.

- **Header**: `CloseButton` and the `ModuleBreadcrumb` ending in `How it works`.
- **Illustration**, centered in the free space, 230dp tall:
  1. A small `PokerTable` with five board cards and two hole cards outlined in `right`. Title "The table": "The five cards in the middle are shared. The two at the bottom are yours."
  2. A 2×2 `AnswerGrid` with the right answer shown. Title "Find your best hand": "Use any five of the seven cards. Tap the strongest hand you can make."
  3. Two of three stars above five recap rows, each ending in a `right` check or a `wrong` X. Title "Earn your stars": "Each round is five hands, and your score earns up to three stars. Retry a round any time to play five new hands."
- **Text**, centered: a `label` line (`STEP 1 OF 3`), the title in `title` style, then `body` in `textSecondary`.
- **Step dots** above the button: 6dp dots in `outline`, with the current step a 20dp `textPrimary` pill.
- Steps slide in 24dp from the right.

Placement round details are undecided; the tutorial does not describe them.

## 2. Hand-strength puzzle (table view)

The approved layout for every hand-strength situation. The sample situation: hole K♠ Q♠, board J♠ 10♦ 4♠ 9♣ 2♥, answers Pair, Two pair, Straight and Flush. Straight is right, and Flush is the trap because there are only four spades.

**Background**: `background` with a radial `spotlight` centered about 42% down the screen.

**Header** (status bar inset + 20dp top, 20dp screen margin)

- A row at least 44dp tall: `CloseButton`, then the `ModuleBreadcrumb` (`Hand strength › Hand 3 of 5`).
- `RoundProgress` below it, 10dp under the row.

**Table**: 48dp below the progress bar, the `PokerTable` with `StreetLabels`, five board cards and two tilted hole cards (see components.md). There is no question heading: the tutorial explains the game type once, and the breadcrumb names it. For situations before the river, leave the missing streets' columns empty and keep their labels.

**Answers**: the `AnswerGrid`, pinned to the bottom of the screen above the navigation bar inset, so it sits under the thumb. Flexible space separates it from the table.

### States

- **Question**: cards deal in by street, then the hole cards. Answers are idle. Nothing else moves except the progress pulse.
- **Answered right**: the picked answer turns `Right`, and the others dim. The cards that make the hand get the `right` outline, and unused board cards fade. The `VerdictPanel` slides in above the answers with no plate, just the explanation, such as "[K♠ Q♠ J♠ 10♦ 9♣] in a row. The four spades were bait, there's no flush here." and `Next hand`.
- **Answered wrong**: the picked answer turns `Wrong`, the right answer turns `Right`, and the others dim. Card highlighting is the same as for a right answer. The `VerdictPanel` names the mistake, such as "Four spades isn't enough, a flush needs five. Your best five cards are [K♠ Q♠ J♠ 10♦ 9♣] for a straight." (bracketed cards are `InlineCard`s) It ends with `Got it`.

A missed hand is not repeated within the round. Retrying means replaying the whole round: five new hands, dealt as different permutations of the same skills.

## 3. Probability puzzle (planned)

Not yet designed beyond the decided behavior. Use the table view with four percentage answers. After an answer, outline the helpful cards in `right` and show the calculation briefly in the `VerdictPanel` body. Ask before designing more.

## 4. Round complete

**Header**: `CloseButton` ("Close") and the `ModuleBreadcrumb` ending in `Round complete`. There is no progress bar.

**Stars**: the `StarRow`, 6dp below the header.

**Score**: the count in `score` style with a smaller `/5` in `textMuted`, with no caption. The number is the hands answered right out of five; keep the star thresholds provisional.

**Pass status**: a light plate with a check, `NEXT ROUND UNLOCKED`, when the score meets the minimum. The failing state is not designed yet, and the pass threshold is undecided; ask before designing it.

**Recap**: a `label` header, `THE HANDS`, then five `HandRecapRow`s in round order. Below them, in `body` and `textSecondary`: "Retry this round any time to play five new hands."

**Actions** at the bottom: primary `Next round`, then secondary `Retry this round`, which deals five new hands.

Motion: stars pop, then the pass plate wipes in, then recap rows slide in (see tokens.md).
