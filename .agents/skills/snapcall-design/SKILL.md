---
name: snapcall-design
description: Snapcall's Broadcast visual design system and screen specs for the native Android (Jetpack Compose) poker puzzle app. Use when creating or reviewing any Snapcall UI, theme, component, screen, mockup, art board or brand asset, even if the brand is not named. Follow the approved references instead of Material defaults, and do not invent undecided product rules.
---

# Snapcall design

Design handoff: October 27, 2026 Broadcast direction, neutral palette, table view puzzle and end-of-round star screen. The written specs take precedence over the art board if they disagree.

Snapcall is an Android-first poker puzzle game for cash-game No-Limit Hold'em. Rounds are short, like Duolingo, and players learn by playing rather than through lessons. The look is **Broadcast**: every puzzle feels like the hole-card camera on a late-night poker broadcast. That means a near-black neutral studio, bright white cards, Barlow Condensed italic caps, and flat caption plates that slide in with the verdict.

Think "poker broadcast graphics with the cards lit up", never "casino app" or "Material starter template".

## The cards take center stage

Everything that is not a card is gray or white, so the cards are the brightest and most saturated thing on screen. Color is a teaching tool, never decoration:

- **Blue (`right`) means right.** It marks the right answer, the cards that make the hand, and the probability puzzle's helpful cards.
- **Orange (`wrong`) means wrong.** It marks a wrong pick, a wrong verdict and a retried hand.
- Nothing else gets color. That includes primary buttons, the module chip, progress, stars and pass status, which are all white or gray.

Blue and orange were chosen over green and red so colorblind players can tell them apart. Every color state also has a second cue: a check, a strike-through or a label.

## Component names

Name UI components by their role, never with a `Snapcall` prefix: `PlayingCard`, `Plate`, `PlateChain`, `ModuleChip`, `RoundProgress`, `CloseButton`, `PokerTable`, `StreetLabels`, `HandPlate`, `AnswerButton`, `AnswerGrid`, `ActionButton`, `VerdictPanel`, `StarRow` and `HandRecapRow`. Use the same convention for component-specific types (`AnswerState`, `PlateColor`) and matching filenames. See [references/components.md](references/components.md).

## Typography

Bundle Barlow Condensed SemiBold (600), Bold (700), ExtraBold (800) and ExtraBold Italic (800 italic), plus Barlow Regular (400) and Medium (500). Both are SIL Open Font License families from Google Fonts. Display and verdict text is Barlow Condensed ExtraBold Italic in caps. Labels and answers are Barlow Condensed in tracked caps. Corrections are Barlow. Apply the sizes, weights and tracking in [references/tokens.md](references/tokens.md#type).

## Non-negotiables

1. **Use the tokens.** Every color, text style, shape, spacing value and motion spec comes from `SnapcallTheme`. Do not hard-code hex values, dp values or `MaterialTheme.typography` styles in screens.
2. **Color only teaches.** Use `right` and `wrong` only for answer feedback and teaching highlights. Do not add a brand accent, felt green, gold, gradients beyond the studio spotlight, or decorative color.
3. **Cards are real cards.** Use white faces, the rank top-left and the suit bottom-right. Draw suits as vector drawables, never emoji or `♠` text. Hearts and diamonds use `suitRed`; spades and clubs use `cardInk`.
4. **Flat plates, no angles.** Labels, chips and verdicts sit on flat rectangular plates with 4dp corners. Never slant, skew or clip them into parallelograms. Buttons also have 4dp corners and cards have 5–7dp corners. Only the close button is round.
5. **No ripples.** Press feedback moves the control down 2dp and brightens its fill slightly, then springs back. Use `indication = null` with the press modifier.
6. **Dark only, for now.** Broadcast is designed as a dark studio. A light theme is not designed; ask before adding one.
7. **Motion teaches or celebrates.** Deal-in by street, the verdict slide, the plate wipe and the star pop are the only animations. Everything else is static, and all of it snaps when "Remove animations" is on.

## Scope: build only what is decided

The product decisions so far, which the specs follow:

- Hand strength is the only launch module. Modules are freely selectable with independent difficulty, and a placement round is required on first entry.
- A regular round has five situations plus retries. A wrong answer gets a quick correction and comes back before the round ends. Similar situations return in later rounds.
- Puzzles progress from identifying hands, to comparing players' hands, to finding hands that beat yours.
- Probability puzzles offer four percentages, then highlight the helpful cards and briefly show the math. They start with improving on the next card; flop probabilities come at higher difficulties.
- Scores award 1–3 stars, and a minimum score is needed to move on to the next round.

**Do not decide these yourself.** Use visible placeholders such as `[PASS SCORE]`, or ask:

- exact pass and star thresholds
- whether stars count first-try answers only
- whether difficulty or rounds unlock regardless of score
- placement round details and difficulty tiers
- a light theme, sound and haptics

## How to work

1. Read [references/tokens.md](references/tokens.md) and extend the existing app theme in `programs/snapcall-android/app/src/main/kotlin/com/adamaho/snapcall/theme/` with the tokens the screen needs. That theme still carries the starter palette and Geist; replace them as Broadcast screens are built rather than mixing the two. [assets/compose/SnapcallTheme.kt](assets/compose/SnapcallTheme.kt) is an uncompiled reference for the tokens.
2. Build the primitives in [references/components.md](references/components.md).
3. Build screens from [references/screens.md](references/screens.md), which gives the layout top to bottom with measurements, copy, states and motion.
4. Compare against the art board listed in [assets/mockups/README.md](assets/mockups/README.md). The written spec wins if they disagree.
5. When an approved design change alters the look, update the affected specs, the Compose reference and the art board together.
6. Verify server support for a behavior before implementing it. Mockups do not establish backend support.

## Definition of done

- Every state in `screens.md` renders: question, right, wrong, and the round-complete screen at 1, 2 and 3 stars.
- Every colored element is `right`, `wrong`, `suitRed` or a card. Everything else is gray or white.
- No Material ripple appears anywhere.
- Text contrast is at least 4.5:1, using the measured pairs in `tokens.md`.
- All touch targets are at least 44dp, and icon-only buttons have content descriptions. Cards announce their rank and suit.
- Animations stop or become static when "Remove animations" is on.
- Edge-to-edge: content respects the status bar and navigation bar insets, and no fake status bar is drawn in mockups.
