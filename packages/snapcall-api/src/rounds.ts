import { Schema } from "effect";

/**
 * Identity of one five-question round attempt.
 *
 * @category models
 * @since 0.1.0
 */
export const AttemptId = Schema.String.check(Schema.isUUID()).annotate({ identifier: "AttemptId" });

/**
 * Identity of one five-question round attempt.
 *
 * @category models
 * @since 0.1.0
 */
export type AttemptId = typeof AttemptId.Type;

/**
 * Identity of one puzzle within an attempt.
 *
 * @category models
 * @since 0.1.0
 */
export const PuzzleId = Schema.String.check(Schema.isUUID()).annotate({ identifier: "PuzzleId" });

/**
 * Identity of one puzzle within an attempt.
 *
 * @category models
 * @since 0.1.0
 */
export type PuzzleId = typeof PuzzleId.Type;

/**
 * Standard high poker hand categories, weakest first; a royal flush is an ace-high straight flush.
 *
 * @category models
 * @since 0.1.0
 */
export const HandType = Schema.Literals([
  "high-card",
  "one-pair",
  "two-pair",
  "three-of-a-kind",
  "straight",
  "flush",
  "full-house",
  "four-of-a-kind",
  "straight-flush",
]).annotate({ identifier: "HandType" });

/**
 * Standard high poker hand categories, weakest first; a royal flush is an ace-high straight flush.
 *
 * @category models
 * @since 0.1.0
 */
export type HandType = typeof HandType.Type;

/**
 * One card from a standard deck.
 *
 * @category models
 * @since 0.1.0
 */
export const Card = Schema.Struct({
  rank: Schema.Literals(["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]),
  suit: Schema.Literals(["clubs", "diamonds", "hearts", "spades"]),
}).annotate({ identifier: "Card" });

/**
 * One card from a standard deck.
 *
 * @category models
 * @since 0.1.0
 */
export interface Card extends Schema.Schema.Type<typeof Card> {}

/**
 * Five distinct cards chosen as one hand; their order is not significant.
 *
 * @category models
 * @since 0.1.0
 */
export const SelectedCards = Schema.Array(Card)
  .check(Schema.isBetweenLength(5, 5), Schema.isUnique())
  .annotate({ identifier: "SelectedCards" });

/**
 * Five distinct cards chosen as one hand; their order is not significant.
 *
 * @category models
 * @since 0.1.0
 */
export type SelectedCards = typeof SelectedCards.Type;

/**
 * The five shared cards, dealt as a complete flop, turn, and river.
 *
 * @category models
 * @since 0.1.0
 */
export const Board = Schema.Struct({
  flop: Schema.Array(Card).check(Schema.isBetweenLength(3, 3)),
  turn: Card,
  river: Card,
}).annotate({ identifier: "Board" });

/**
 * The five shared cards, dealt as a complete flop, turn, and river.
 *
 * @category models
 * @since 0.1.0
 */
export interface Board extends Schema.Schema.Type<typeof Board> {}

/**
 * The current deal, without its solution; the best five may use zero, one, or two hole cards.
 *
 * @category models
 * @since 0.1.0
 */
export const Puzzle = Schema.Struct({
  id: PuzzleId,
  position: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 5 })),
  holeCards: Schema.Array(Card).check(Schema.isBetweenLength(2, 2)),
  board: Board,
}).annotate({ identifier: "Puzzle" });

/**
 * The current deal, without its solution; the best five may use zero, one, or two hole cards.
 *
 * @category models
 * @since 0.1.0
 */
export interface Puzzle extends Schema.Schema.Type<typeof Puzzle> {}

const Score = Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 5 }));

const Stars = Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 3 }));

/**
 * Current progress or final result; best scores include completed attempts only.
 *
 * @category models
 * @since 0.1.0
 */
export const RoundAttempt = Schema.Struct({
  id: AttemptId,
  roundId: Schema.Literal("hand-strength"),
  status: Schema.Literals(["in-progress", "completed"]),
  answeredCount: Score,
  score: Score,
  stars: Schema.NullOr(Stars).annotate({
    description: "Null until all five answers are accepted.",
  }),
  bestScore: Score,
  bestStars: Stars,
  puzzle: Schema.NullOr(Puzzle).annotate({
    description: "The next puzzle, or null when complete.",
  }),
}).annotate({ identifier: "RoundAttempt" });

/**
 * Current progress or final result; best scores include completed attempts only.
 *
 * @category models
 * @since 0.1.0
 */
export interface RoundAttempt extends Schema.Schema.Type<typeof RoundAttempt> {}

/**
 * Reuse the request ID when retrying a start request; use a new ID to replay the round.
 *
 * @category models
 * @since 0.1.0
 */
export const StartAttempt = Schema.Struct({
  requestId: Schema.String.check(Schema.isUUID()),
}).annotate({ identifier: "StartAttempt" });

/**
 * Reuse the request ID when retrying a start request; use a new ID to replay the round.
 *
 * @category models
 * @since 0.1.0
 */
export interface StartAttempt extends Schema.Schema.Type<typeof StartAttempt> {}

/**
 * The five cards selected from the current puzzle's seven as its strongest hand.
 *
 * @category models
 * @since 0.1.0
 */
export const SubmitAnswer = Schema.Struct({
  puzzleId: PuzzleId,
  selectedCards: SelectedCards,
}).annotate({ identifier: "SubmitAnswer" });

/**
 * The five cards selected from the current puzzle's seven as its strongest hand.
 *
 * @category models
 * @since 0.1.0
 */
export interface SubmitAnswer extends Schema.Schema.Type<typeof SubmitAnswer> {}

/**
 * Feedback for an accepted answer; repeating that answer does not change it.
 * Any selection tied with the strongest hand is correct; suits never break ties.
 *
 * @category models
 * @since 0.1.0
 */
export const AnswerFeedback = Schema.Struct({
  puzzleId: PuzzleId,
  selectedCards: SelectedCards,
  bestCards: SelectedCards,
  selectedHandType: HandType,
  bestHandType: HandType,
  correct: Schema.Boolean,
  explanation: Schema.String,
}).annotate({
  identifier: "AnswerFeedback",
  description:
    "bestCards repeats the accepted selection when it is correct; otherwise it is one strongest five-card hand.",
});

/**
 * Feedback for an accepted answer; repeating that answer does not change it.
 * Any selection tied with the strongest hand is correct; suits never break ties.
 *
 * @category models
 * @since 0.1.0
 */
export interface AnswerFeedback extends Schema.Schema.Type<typeof AnswerFeedback> {}

/**
 * Accepted answer feedback together with the latest attempt state.
 *
 * @category models
 * @since 0.1.0
 */
export const AnswerResult = Schema.Struct({
  feedback: AnswerFeedback,
  attempt: RoundAttempt,
}).annotate({ identifier: "AnswerResult" });

/**
 * Accepted answer feedback together with the latest attempt state.
 *
 * @category models
 * @since 0.1.0
 */
export interface AnswerResult extends Schema.Schema.Type<typeof AnswerResult> {}

/**
 * The requested attempt does not belong to the authenticated player.
 *
 * @category errors
 * @since 0.1.0
 */
export class RoundNotFound extends Schema.Error<RoundNotFound, { readonly brand: unique symbol }>(
  "RoundNotFound",
)(
  Schema.TaggedStruct("RoundNotFound", { id: AttemptId }).annotate({ identifier: "RoundNotFound" }),
  { httpApiStatus: 404, description: "This player has no attempt with the requested ID." },
) {}

/**
 * The answer conflicts with the current attempt state.
 *
 * @category errors
 * @since 0.1.0
 */
export class RoundConflict extends Schema.Error<RoundConflict, { readonly brand: unique symbol }>(
  "RoundConflict",
)(
  Schema.TaggedStruct("RoundConflict", { message: Schema.String }).annotate({
    identifier: "RoundConflict",
  }),
  { httpApiStatus: 409, description: "The answer conflicts with the current attempt state." },
) {}
