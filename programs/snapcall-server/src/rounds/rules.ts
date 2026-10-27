import {
  type AnswerFeedback,
  type Card,
  type HandType,
  Puzzle,
} from "@snapcall/snapcall-api/rounds";
import { Array, Crypto, Effect, Schema } from "effect";

const ranks: ReadonlyArray<Card["rank"]> = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];
const suits: ReadonlyArray<Card["suit"]> = ["clubs", "diamonds", "hearts", "spades"];
const deck: ReadonlyArray<Card> = ranks.flatMap((rank) => suits.map((suit) => ({ rank, suit })));
const cardKey = (card: Card) => `${card.rank}:${card.suit}`;
const rankValue = (card: Card) => ranks.indexOf(card.rank) + 2;
const canonicalCards = (cards: ReadonlyArray<Card>): ReadonlyArray<Card> =>
  [...cards].sort(
    (left, right) =>
      rankValue(right) - rankValue(left) || suits.indexOf(left.suit) - suits.indexOf(right.suit),
  );

/**
 * Compares selections by physical cards without depending on their submitted order.
 *
 * @category rules
 * @since 0.1.0
 */
export const selectionKey = (cards: ReadonlyArray<Card>): string =>
  cards.map(cardKey).sort().join(",");

/**
 * The seven available cards, in hole-card, flop, turn, and river order.
 *
 * @category rules
 * @since 0.1.0
 */
export const cardsFor = (puzzle: Puzzle): ReadonlyArray<Card> => [
  ...puzzle.holeCards,
  ...puzzle.board.flop,
  puzzle.board.turn,
  puzzle.board.river,
];

/**
 * Requires five distinct cards that were actually dealt in this puzzle.
 *
 * @category rules
 * @since 0.1.0
 */
export const isSelectionFrom = (puzzle: Puzzle, cards: ReadonlyArray<Card>): boolean => {
  const available = new Set(cardsFor(puzzle).map(cardKey));
  return (
    cards.length === 5 &&
    new Set(cards.map(cardKey)).size === 5 &&
    cards.every((card) => available.has(cardKey(card)))
  );
};

/**
 * A deal is sufficient to reproduce its solution; no private answer is persisted.
 *
 * @category models
 * @since 0.1.0
 */
export type StoredPuzzle = Puzzle;

/**
 * Validates ordered puzzle identities and distinct, physically possible seven-card deals.
 *
 * @category schemas
 * @since 0.1.0
 */
export const StoredPuzzles = Schema.Array(Puzzle).check(
  Schema.isBetweenLength(5, 5),
  Schema.makeFilter((puzzles) =>
    puzzles.every(
      (puzzle, index) =>
        puzzle.position === index + 1 && new Set(cardsFor(puzzle).map(cardKey)).size === 7,
    ) &&
    new Set(puzzles.map((puzzle) => puzzle.id)).size === 5 &&
    new Set(puzzles.map((puzzle) => selectionKey(cardsFor(puzzle)))).size === 5
      ? undefined
      : "Expected five distinct, ordered puzzles with seven unique cards each",
  ),
);

/**
 * Category followed by descending tie-break ranks; suits never affect hand strength.
 *
 * @category models
 * @since 0.1.0
 */
export interface EvaluatedHand {
  readonly handType: HandType;
  readonly value: ReadonlyArray<number>;
}

/**
 * Evaluates five distinct, validated cards using standard high poker hand rankings.
 *
 * @category rules
 * @since 0.1.0
 */
export const evaluateFive = (cards: ReadonlyArray<Card>): EvaluatedHand => {
  const values = cards.map(rankValue).sort((left, right) => right - left);
  const counts = new Map<number, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const groups = [...counts].sort(
    ([leftRank, leftCount], [rightRank, rightCount]) =>
      rightCount - leftCount || rightRank - leftRank,
  );
  const [firstRank = 0, firstCount = 0] = groups[0] ?? [];
  const [secondRank = 0, secondCount = 0] = groups[1] ?? [];
  const flush = new Set(cards.map((card) => card.suit)).size === 1;
  const highest = values[0] ?? 0;
  const straightHigh =
    counts.size === 5 && highest - (values[4] ?? 0) === 4
      ? highest
      : values.join(",") === "14,5,4,3,2"
        ? 5
        : 0;

  if (flush && straightHigh > 0) return { handType: "straight-flush", value: [8, straightHigh] };
  if (firstCount === 4) return { handType: "four-of-a-kind", value: [7, firstRank, secondRank] };
  if (firstCount === 3 && secondCount === 2) {
    return { handType: "full-house", value: [6, firstRank, secondRank] };
  }
  if (flush) return { handType: "flush", value: [5, ...values] };
  if (straightHigh > 0) return { handType: "straight", value: [4, straightHigh] };
  if (firstCount === 3) {
    return { handType: "three-of-a-kind", value: [3, ...groups.map(([rank]) => rank)] };
  }
  if (firstCount === 2 && secondCount === 2) {
    return { handType: "two-pair", value: [2, ...groups.map(([rank]) => rank)] };
  }
  if (firstCount === 2) {
    return { handType: "one-pair", value: [1, ...groups.map(([rank]) => rank)] };
  }
  return { handType: "high-card", value: [0, ...values] };
};

/**
 * Positive means the left hand wins; zero means an exact poker tie, regardless of suits.
 *
 * @category rules
 * @since 0.1.0
 */
export const compareHands = (left: EvaluatedHand, right: EvaluatedHand): number => {
  for (let index = 0; index < Math.max(left.value.length, right.value.length); index++) {
    const difference = (left.value[index] ?? 0) - (right.value[index] ?? 0);
    if (difference !== 0) return Math.sign(difference);
  }
  return 0;
};

/**
 * Finds the best of all 21 five-card subsets of seven distinct, validated cards.
 * Zero, one, or two hole cards can contribute; card order does not affect the result.
 *
 * @category rules
 * @since 0.1.0
 */
export const bestHand = (
  cards: ReadonlyArray<Card>,
): EvaluatedHand & { readonly cards: ReadonlyArray<Card> } => {
  const available = canonicalCards(cards);
  const candidates: Array<EvaluatedHand & { readonly cards: ReadonlyArray<Card> }> = [];
  for (let first = 0; first < 6; first++) {
    for (let second = first + 1; second < 7; second++) {
      const five = available.filter((_, index) => index !== first && index !== second);
      candidates.push({ ...evaluateFive(five), cards: five });
    }
  }
  return candidates.reduce((best, candidate) =>
    compareHands(candidate, best) > 0 ? candidate : best,
  );
};

const rankNames = [
  "",
  "",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "jack",
  "queen",
  "king",
  "ace",
];
const pluralNames = [
  "",
  "",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
  "sevens",
  "eights",
  "nines",
  "tens",
  "jacks",
  "queens",
  "kings",
  "aces",
];
const describe = ({ handType, value }: EvaluatedHand): string => {
  const first = value[1] ?? 0;
  const second = value[2] ?? 0;
  const kickers = (offset: number) =>
    value
      .slice(offset)
      .map((rank) => rankNames[rank])
      .join(", ");
  switch (handType) {
    case "high-card":
      return `${rankNames[first]}-high hand with ${kickers(2)} kickers`;
    case "one-pair":
      return `pair of ${pluralNames[first]} with ${kickers(2)} kickers`;
    case "two-pair":
      return `two pair, ${pluralNames[first]} and ${pluralNames[second]}, with a ${rankNames[value[3] ?? 0]} kicker`;
    case "three-of-a-kind":
      return `three ${pluralNames[first]} with ${kickers(2)} kickers`;
    case "straight":
      return `${rankNames[first]}-high straight${first === 5 ? " (ace plays low)" : ""}`;
    case "flush":
      return `${rankNames[first]}-high flush (${kickers(1)})`;
    case "full-house":
      return `${pluralNames[first]} full of ${pluralNames[second]}`;
    case "four-of-a-kind":
      return `four ${pluralNames[first]} with a ${rankNames[second]} kicker`;
    case "straight-flush":
      return `${rankNames[first]}-high straight flush${first === 14 ? " (royal flush)" : first === 5 ? " (ace plays low)" : ""}`;
  }
};

/**
 * Grades a valid selection by strength, accepting every tied best five-card selection.
 *
 * @category rules
 * @since 0.1.0
 */
export const feedbackFor = (puzzle: Puzzle, selectedCards: ReadonlyArray<Card>): AnswerFeedback => {
  const selected = evaluateFive(selectedCards);
  const best = bestHand(cardsFor(puzzle));
  const correct = compareHands(selected, best) === 0;
  const canonicalSelection = canonicalCards(selectedCards);
  return {
    puzzleId: puzzle.id,
    selectedCards: canonicalSelection,
    bestCards: correct ? canonicalSelection : best.cards,
    selectedHandType: selected.handType,
    bestHandType: best.handType,
    correct,
    explanation: correct
      ? `Your ${describe(selected)} is the best available hand.`
      : `Your ${describe(selected)} is beaten by ${describe(best)}.`,
  };
};

/**
 * Generates five distinct shuffled deals without restricting hand categories.
 *
 * @category generation
 * @since 0.1.0
 */
export const generatePuzzles = Effect.fn("@snapcall/RoundRules.generatePuzzles")(function* () {
  const crypto = yield* Crypto.Crypto;
  const puzzles: Array<StoredPuzzle> = [];
  const usedDeals = new Set<string>();
  while (puzzles.length < 5) {
    const cards = (yield* crypto.randomShuffle(deck)).slice(0, 7);
    const key = selectionKey(cards);
    if (usedDeals.has(key)) continue;
    usedDeals.add(key);
    puzzles.push({
      id: yield* crypto.randomUUIDv4(),
      position: puzzles.length + 1,
      holeCards: cards.slice(0, 2),
      board: {
        flop: cards.slice(2, 5),
        turn: Array.getUnsafe(cards, 5),
        river: Array.getUnsafe(cards, 6),
      },
    });
  }
  return puzzles;
});

/**
 * Awards stars only at the agreed three-, four-, and five-answer thresholds.
 *
 * @category rules
 * @since 0.1.0
 */
export const starsForScore = (score: number): 0 | 1 | 2 | 3 =>
  score === 5 ? 3 : score === 4 ? 2 : score === 3 ? 1 : 0;
