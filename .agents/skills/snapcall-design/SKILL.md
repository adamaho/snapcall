---
name: snapcall-design
description: >-
  Snapcall's Broadcast brand and UI rules for the Android poker puzzle game.
  Use this for any Snapcall screen, mockup, component, art board, asset, or UI
  code, including Android views and Compose themes, even if the user does not
  name the brand.
---

# Snapcall Design: Broadcast

Snapcall is an Android-first poker puzzle game for cash-game No-Limit Hold'em.
Rounds are short, like Duolingo, and you learn by playing rather than through
lessons. The brand is called **Broadcast**: every puzzle should feel like the
hole-card camera on a late-night poker broadcast. That means a dark neutral
studio, bright cards, and slanted caption plates that slide in with the verdict.

The main rule: **the cards take center stage.** Everything else is gray and
white, so the cards are the brightest, most saturated thing on screen. Color is
a teaching tool, never decoration.

The living reference is the
[Snapcall art board](https://claude.ai/artifact/Bm6amUamtAUbg4Y7e4T63o), in the
"B · Broadcast" row. If the art board and this skill disagree, ask which one is
current. The brutalist "A" row on the same board was rejected, so do not borrow
from it.

## Color

| Token       | Hex       | Use                                                                 |
| ----------- | --------- | ------------------------------------------------------------------- |
| studio      | `#141414` | Screen background. Card ink for spades and clubs uses the same hex. |
| studio-glow | `#202020` | Center of the soft radial spotlight behind the table.               |
| panel       | `#1E1E1E` | Buttons, plates, and the bottom verdict panel.                      |
| key         | `#2A2A2A` | A–D answer key plates.                                              |
| rule        | `#303030` | 1px borders, table rim, street underlines, empty progress segments. |
| light       | `#F2F2F2` | Primary text, primary buttons, header chip, progress, stars.        |
| muted       | `#9E9E9E` | Labels and secondary text.                                          |
| dim         | `#8C8C8C` | Answers that were not picked, after answering.                      |
| card        | `#FFFFFF` | Card faces only.                                                    |
| suit-red    | `#D7263D` | Hearts and diamonds.                                                |
| **right**   | `#4CC3FF` | Right answers, and the cards that make your hand.                   |
| **wrong**   | `#E5672A` | Wrong answers, wrong verdicts, and retried hands.                   |

How to use color:

- **Blue means right, orange means wrong, and nothing else gets color.** That
  includes primary buttons, the module chip, progress, stars, and the "Next
  round unlocked" plate, which are all white or gray. Before adding color
  somewhere new, ask whether it teaches something. If it does not, use gray.
- After an answer, outline the cards that make the hand in blue (3px outline,
  2px offset) and fade the unused board cards to about 28% opacity. This is the
  teaching moment.
- Blue and orange were chosen over green and red so colorblind players can
  tell them apart. Pair every color state with a second cue as well: a check
  icon, a strike-through, or a label.
- Do not use a brand accent color, felt green, gold chips, or gradient washes.
  The only gradient is the soft radial spotlight on the background.
- Text on blue or orange fills uses studio `#141414`. Keep body text contrast
  at 4.5:1 or higher.

## Type

Load both families from Google Fonts:
`Barlow+Condensed:ital,wght@0,600;0,700;0,800;1,800` and
`Barlow:wght@400;500;600`.

- **Display:** Barlow Condensed ExtraBold Italic (800 italic), uppercase. Use
  it for prompts, such as "WHAT'S YOUR BEST HAND?" at about 40px with 0.92 line
  height, centered. Use it for verdict plates at about 28px.
- **Labels:** Barlow Condensed 700, uppercase, tracked 0.12–0.18em, 11–15px.
  Use it for chips, street names, "HAND 3 OF 5", and recap headers. Use tabular
  numbers for scores and odds.
- **Answers and buttons:** Barlow Condensed 700–800, uppercase, 20–22px.
- **Body:** Barlow 400, 16px, 1.4 line height. Use it only for corrections of
  one or two short sentences.

## Shapes and Parts

- **Slanted plates:** labels and verdicts sit on caption plates with an angled
  right edge: `clip-path: polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)`.
  Chained plates overlap by the slant (`margin-left: -12px`) and slant on both
  sides.
- **Cards:** white, radius 5–7px, with a soft drop shadow such as
  `0 6px 14px rgba(0,0,0,.45)`. The rank sits top-left in Barlow Condensed 700,
  and the suit icon sits bottom-right. Draw suits as inline SVG, never as emoji
  or `♠` characters. Board cards are about 54×76px. Hole cards are about
  80×110px and tilted −6° and +5°, as if just peeked at.
- **Buttons:** radius 4px. Primary buttons use a light fill, studio text, and a
  56px height. Secondary buttons are transparent with a rule border. Pressed
  buttons move down 2px. Tap targets are at least 44px.
- **Answer buttons:** panel fill, rule border, 60px tall, laid out 2×2. Each has
  an A–D key plate on the left with the same slant. After an answer:
  - Right: blue fill, studio text, and a check icon, with the key plate
    inverted.
  - Wrong pick: orange fill, studio text, and a strike-through, with the key
    plate inverted.
  - Other answers: dim text.
- **Progress:** five 4px segments, one per situation in the round. Done
  segments are light, the current segment is light and pulsing, and upcoming
  segments use the rule color.
- **Close:** a 44px round button with a rule border at the top left.
- Do not use rounded cards with a colored left border, and do not use emoji.

## Main Puzzle Layout: Table View

Table view is the chosen layout for the 390×844 phone screen. Do not draw a fake
Android status bar.

1. **Header:** the close button, then two chained chips: a light
   `HAND STRENGTH` module chip and a panel `HAND 3 OF 5` chip. The five
   progress segments sit below.
2. **Prompt:** a centered display headline, such as "WHAT'S YOUR BEST HAND?"
3. **Table:** an oval about 190px tall (`border-radius: 50%`) with a rule rim,
   a soft inner ring, and a faint radial gradient.
   - Street labels sit above the board, underlined in the rule color: FLOP over
     the first three cards, then TURN and RIVER.
   - The five board cards sit centered inside the oval.
   - The two tilted hole cards overlap the bottom edge of the oval, like the
     player's seat.
4. **You plate:** below the hole cards, a light `YOU` plate joins a panel plate
   that shows `?`. After an answer, the panel plate shows the hand name in blue.
5. **Answers:** the 2×2 A–D grid.
6. **Verdict:** a bottom panel slides up after the answer without covering the
   answer grid.
   - Its slanted plate sits half above the panel's top edge. It is blue with
     the hand name for a right answer, plus a "FIRST TRY" sub-plate. It is
     orange with what went wrong for a wrong answer, such as "NOT A FLUSH".
   - One or two sentences of correction follow.
   - On a wrong answer, a muted line with a retry icon says
     "THIS ONE COMES BACK BEFORE THE ROUND ENDS".
   - A full-width primary button closes the panel: "GOT IT" or "NEXT HAND".

## End-of-Round Star Screen

- **Header:** the same chained chips, reading `HAND STRENGTH` and
  `ROUND COMPLETE`.
- **Stars:** three stars, with the middle one larger. Earned stars are filled
  light with a soft white glow. Unearned stars are outlined in the rule color.
  The stars pop in one at a time.
- **Score:** a big italic score, such as `4/5`, with a muted label below it.
- **Status:** a light plate, not a blue one, saying the next round is unlocked.
- **Recap:** a list of the five hands. Each row has a number plate, the hand
  name, and a chip: a blue outlined `FIRST TRY` chip or an orange `RETRIED`
  chip. A note below says that retried hands come back in later rounds.
- **Buttons:** a primary `NEXT ROUND` button and a secondary
  `REPLAY THIS ROUND` button.

## Motion

Use motion only where it teaches or celebrates. Keep each animation under half
a second and ease out with `cubic-bezier(.2,.8,.2,1)`.

- **Deal-in:** cards drop in by street. The first three board cards land
  together, then the fourth, then the fifth, then the hole cards.
- **Answer:** the hand-name plate wipes in from left to right with a clip-path
  animation, and the verdict panel slides up in about 0.32s.
- **Stars:** each star pops in with a slight overshoot, and recap rows slide in
  after the stars.
- Do not loop animations, except for the gentle pulse on the current progress
  segment.

## Voice

Write short, confident, slightly wry copy, like a poker commentator. For
example: "Four spades isn't enough, a flush needs five." or "The four spades
were bait."

- Name the exact cards in corrections, such as "K Q J 10 9".
- Write headlines as questions in caps.
- Do not lecture. Make one teaching point per correction.

## Product Facts

These decisions are settled:

- Hand strength is the only launch module.
- A round has five situations plus retries. A wrong answer gets a quick
  correction and comes back before the round ends. Similar situations return in
  later rounds.
- Probability puzzles offer four percentages, then highlight the helpful cards
  and briefly show the math. Use blue for the helpful cards.
- Scores award 1–3 stars, and a minimum score is needed to move on.

These decisions are still open. **Do not invent answers.** Use visible
placeholders such as `[PASS SCORE]` instead:

- exact pass and star thresholds
- whether stars count first tries only
- whether difficulty or rounds unlock regardless of score
- placement round details
- difficulty tiers

## Handoff Checklist

- Are the cards the brightest thing on screen?
- Is every colored element either blue for right and teaching, or orange for
  wrong? Everything else should be gray, white, or a card.
- Does every color state also have an icon, strike-through, or label?
- Is display type Barlow Condensed italic caps, and body type Barlow?
- Do labels and verdicts sit on slanted plates?
- Are tap targets at least 44px, and does text contrast pass?
- Did you leave the open product questions undecided?
