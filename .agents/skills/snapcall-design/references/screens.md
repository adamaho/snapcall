# Snapcall screens

Widths assume a 390dp-wide phone in portrait; everything is fluid horizontally. Copy is provisional sample content unless marked final. Anything not described here is out of scope (see "Scope" in `SKILL.md`).

## 1. Hand-strength puzzle (table view)

The approved layout for every hand-strength situation. The sample situation: hole K♠ Q♠, board J♠ 10♦ 4♠ 9♣ 2♥, answers Pair, Two pair, Straight and Flush. Straight is right, and Flush is the trap because there are only four spades.

**Background**: `background` with a radial `spotlight` centered about 42% down the screen.

**Header** (status bar inset + 20dp top, 20dp screen margin)

- A row at least 44dp tall: `CloseButton`, then the `ModuleChip` (`HAND STRENGTH` / `HAND 3 OF 5`).
- `RoundProgress` below it, 10dp under the row.

**Prompt**: the question in `prompt` style, centered and balanced over two lines, such as "WHAT'S YOUR BEST HAND?" Ask one question per situation.

**Table**: the `PokerTable` with `StreetLabels`, five board cards and two tilted hole cards (see components.md). For situations before the river, leave the missing streets' columns empty and keep their labels.

**Hand plate**: the `HandPlate`, 6dp below the table area's bottom.

**Answers**: the `AnswerGrid`.

### States

- **Question**: cards deal in by street, then the hole cards. Answers are idle. Nothing else moves except the progress pulse.
- **Answered right**: the picked answer turns `Right`, and the others dim. The cards that make the hand get the `right` outline, and unused board cards fade. The hand plate wipes in the hand name. The `VerdictPanel` slides up with the right plate chain, such as "K Q J 10 9 in a row. The four spades were bait, there's no flush here." and `NEXT HAND`.
- **Answered wrong**: the picked answer turns `Wrong`, the right answer turns `Right`, and the others dim. Card highlighting and the hand plate are the same as for a right answer. The `VerdictPanel` names the mistake, such as "Four spades isn't enough, a flush needs five. Your best five cards are K Q J 10 9: a straight." It adds the retry note and `GOT IT`.

Wrong situations are retried before the round ends. A retried situation is the same screen; its result counts as a retry on the round-complete screen.

## 2. Probability puzzle (planned)

Not yet designed beyond the decided behavior. Use the table view with four percentage answers. After an answer, outline the helpful cards in `right` and show the calculation briefly in the `VerdictPanel` body. Ask before designing more.

## 3. Round complete

**Header**: `CloseButton` ("Close") and the `ModuleChip` with `ROUND COMPLETE`. There is no progress bar.

**Stars**: the `StarRow`, 6dp below the header.

**Score**: the first-try count in `score` style with a smaller `/5` in `textMuted`, then a `label` line: `RIGHT ON THE FIRST TRY`. Whether stars count first tries only is undecided; keep this copy marked provisional.

**Pass status**: a light plate with a check, `NEXT ROUND UNLOCKED`, when the score meets the minimum. The failing state is not designed yet, and the pass threshold is undecided; ask before designing it.

**Recap**: a `label` header, `THE HANDS`, then five `HandRecapRow`s in round order. Below them, in `body` and `textSecondary`: "Hands like the one you retried will come back in later rounds."

**Actions** at the bottom: primary `NEXT ROUND`, then secondary `REPLAY THIS ROUND`.

Motion: stars pop, then the pass plate wipes in, then recap rows slide in (see tokens.md).
