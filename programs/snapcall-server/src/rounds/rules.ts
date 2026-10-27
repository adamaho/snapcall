import { type AnswerFeedback, type Card, HandType, Puzzle } from "@snapcall/snapcall-api/rounds";
import { Crypto, Effect, Schema } from "effect";

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
const handKey = (cards: ReadonlyArray<Card>) =>
  cards
    .map((card) => `${card.rank}:${card.suit}`)
    .sort()
    .join(",");

/**
 * Recognizes only the two beginner hand categories; invalid or stronger hands return null.
 *
 * @category rules
 * @since 0.1.0
 */
export const classify = (cards: ReadonlyArray<Card>): HandType | null => {
  if (cards.length !== 5 || new Set(cards.map((card) => `${card.rank}:${card.suit}`)).size !== 5) {
    return null;
  }
  const counts = new Map<Card["rank"], number>();
  for (const card of cards) counts.set(card.rank, (counts.get(card.rank) ?? 0) + 1);
  if (counts.size === 4) return "one-pair";
  if (counts.size !== 5 || new Set(cards.map((card) => card.suit)).size === 1) return null;
  const values = cards.map((card) => ranks.indexOf(card.rank) + 2).sort((a, b) => a - b);
  const straight = values.every(
    (value, index) => index === 0 || value === (values[index - 1] ?? 0) + 1,
  );
  const aceLowStraight = values.join(",") === "2,3,4,5,14";
  return straight || aceLowStraight ? null : "high-card";
};

/**
 * Internal puzzle shape; the solution is persisted but never included in a public puzzle.
 *
 * @category schemas
 * @since 0.1.0
 */
export const StoredPuzzle = Schema.Struct({ ...Puzzle.fields, correctAnswer: HandType });

/**
 * A generated puzzle and its private solution.
 *
 * @category models
 * @since 0.1.0
 */
export interface StoredPuzzle extends Schema.Schema.Type<typeof StoredPuzzle> {}

/**
 * Validates persisted hands, solutions, identities, and order before they affect a score.
 *
 * @category schemas
 * @since 0.1.0
 */
export const StoredPuzzles = Schema.Array(StoredPuzzle).check(
  Schema.isBetweenLength(5, 5),
  Schema.makeFilter((puzzles) =>
    puzzles.every(
      (puzzle, index) =>
        puzzle.position === index + 1 &&
        classify(puzzle.cards) === puzzle.correctAnswer &&
        new Set(puzzle.choices).size === 2,
    ) &&
    new Set(puzzles.map((puzzle) => puzzle.id)).size === 5 &&
    new Set(puzzles.map((puzzle) => handKey(puzzle.cards))).size === 5 &&
    new Set(puzzles.map((puzzle) => puzzle.correctAnswer)).size === 2
      ? undefined
      : "Expected five distinct, ordered beginner puzzles with valid solutions",
  ),
);

/**
 * Generates five shuffled, distinct hands containing both beginner categories.
 *
 * @category generation
 * @since 0.1.0
 */
export const generatePuzzles = Effect.fn("@snapcall/RoundRules.generatePuzzles")(function* () {
  const crypto = yield* Crypto.Crypto;
  const extra: HandType = (yield* crypto.randomBoolean) ? "high-card" : "one-pair";
  const categories: ReadonlyArray<HandType> = [
    "high-card",
    "high-card",
    "one-pair",
    "one-pair",
    extra,
  ];
  const order = yield* crypto.randomShuffle(categories);
  const puzzles: Array<StoredPuzzle> = [];
  const usedHands = new Set<string>();
  for (const correctAnswer of order) {
    // Rejection sampling keeps stronger hands out without changing the shuffled deck.
    while (true) {
      const cards = (yield* crypto.randomShuffle(deck)).slice(0, 5);
      const key = handKey(cards);
      if (classify(cards) !== correctAnswer || usedHands.has(key)) continue;
      usedHands.add(key);
      puzzles.push({
        id: yield* crypto.randomUUIDv4(),
        position: puzzles.length + 1,
        cards,
        choices: ["high-card", "one-pair"],
        correctAnswer,
      });
      break;
    }
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

/**
 * Creates stable immediate feedback from the persisted solution.
 *
 * @category rules
 * @since 0.1.0
 */
export const feedbackFor = (puzzle: StoredPuzzle, answer: HandType): AnswerFeedback => ({
  puzzleId: puzzle.id,
  answer,
  correctAnswer: puzzle.correctAnswer,
  correct: answer === puzzle.correctAnswer,
  explanation:
    puzzle.correctAnswer === "one-pair"
      ? "Two cards share the same rank, so this hand is one pair."
      : "All five ranks are different, with no straight or flush, so this is high card.",
});
