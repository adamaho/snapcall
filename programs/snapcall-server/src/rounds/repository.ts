import {
  type AnswerResult,
  AttemptId,
  PuzzleId,
  type RoundAttempt,
  RoundConflict,
  RoundNotFound,
  SelectedCards,
  type SubmitAnswer,
} from "@snapcall/snapcall-api/rounds";
import { Context, Effect, Layer, Schema } from "effect";
import { SqlClient } from "effect/sql";

import * as Rules from "./rules.ts";

/**
 * A database or persisted-data failure, kept private to the server boundary.
 *
 * @category errors
 * @since 0.1.0
 */
export class PersistenceError extends Schema.TaggedError<
  PersistenceError,
  { readonly brand: unique symbol }
>()("SnapcallServer.RoundRepository.PersistenceError", {
  operation: Schema.String,
  cause: Schema.Defect(),
}) {}

/**
 * Durable round operations; answer validation and insertion share an owned-row lock.
 *
 * @category models
 * @since 0.1.0
 */
export interface Interface {
  readonly start: (
    playerId: string,
    requestId: string,
    attemptId: string,
    puzzles: ReadonlyArray<Rules.StoredPuzzle>,
  ) => Effect.Effect<RoundAttempt, PersistenceError>;
  readonly get: (
    playerId: string,
    attemptId: string,
  ) => Effect.Effect<RoundAttempt, RoundNotFound | PersistenceError>;
  readonly answer: (
    playerId: string,
    attemptId: string,
    payload: SubmitAnswer,
  ) => Effect.Effect<AnswerResult, RoundNotFound | RoundConflict | PersistenceError>;
}

/**
 * Persistence boundary for the Hand Strength round.
 *
 * @category services
 * @since 0.1.0
 */
export class Service extends Context.Service<Service, Interface>()(
  "@snapcall/snapcall-server/RoundRepository",
) {}

const SavedAnswer = Schema.Struct({
  puzzleId: PuzzleId,
  position: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 5 })),
  selectedCards: SelectedCards,
  correct: Schema.Boolean,
});

const SnapshotRow = Schema.Struct({
  id: AttemptId,
  puzzles: Rules.StoredPuzzles,
  answers: Schema.Array(SavedAnswer).check(Schema.isMaxLength(5)),
  bestScore: Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 5 })),
}).check(
  Schema.makeFilter((row) =>
    row.answers.every((answer, index) => {
      const puzzle = row.puzzles[index];
      return (
        puzzle !== undefined &&
        answer.position === index + 1 &&
        answer.puzzleId === puzzle.id &&
        Rules.isSelectionFrom(puzzle, answer.selectedCards) &&
        answer.correct === Rules.feedbackFor(puzzle, answer.selectedCards).correct
      );
    })
      ? undefined
      : "Stored answers must be a valid prefix of this attempt",
  ),
);

type SnapshotRow = typeof SnapshotRow.Type;

const decodeRows = Schema.decodeUnknownEffect(Schema.Array(SnapshotRow));
const persistenceFailure = (operation: string) => (cause: unknown) =>
  Effect.fail(new PersistenceError({ operation, cause }));

const publicSnapshot = (row: SnapshotRow): RoundAttempt => {
  const answeredCount = row.answers.length;
  const score = row.answers.filter((answer) => answer.correct).length;
  const completed = answeredCount === 5;
  const current = row.puzzles[answeredCount];
  return {
    id: row.id,
    roundId: "hand-strength",
    status: completed ? "completed" : "in-progress",
    answeredCount,
    score,
    stars: completed ? Rules.starsForScore(score) : null,
    bestScore: row.bestScore,
    bestStars: Rules.starsForScore(row.bestScore),
    puzzle:
      current === undefined
        ? null
        : {
            id: current.id,
            position: current.position,
            holeCards: current.holeCards,
            board: current.board,
          },
  };
};

/**
 * Stores attempts and derives scores from their accepted answers.
 *
 * @category layers
 * @since 0.1.0
 */
export const layer = Layer.effect(
  Service,
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    // One statement observes answers and completed best scores from one database snapshot.
    const selectSnapshot = sql.literal(`
      SELECT attempt.id::text AS id, attempt.puzzles,
        COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'puzzleId', answer.puzzle_id::text, 'position', answer.position,
            'selectedCards', answer.selected_cards, 'correct', answer.correct
          ) ORDER BY answer.position)
          FROM round_answers answer WHERE answer.attempt_id = attempt.id
        ), '[]'::jsonb) AS answers,
        COALESCE((
          SELECT MAX(completed.score) FROM (
            SELECT COUNT(*) FILTER (WHERE answer.correct)::integer AS score
            FROM round_attempts prior
            JOIN round_answers answer ON answer.attempt_id = prior.id
            WHERE prior.player_id = attempt.player_id AND prior.round_id = attempt.round_id
            GROUP BY prior.id HAVING COUNT(*) = 5
          ) completed
        ), 0)::integer AS "bestScore"
      FROM round_attempts attempt
    `);

    const readOwned = Effect.fn("@snapcall/RoundRepository.readOwned")(function* (
      playerId: string,
      attemptId: string,
    ) {
      const rows =
        yield* sql`${selectSnapshot} WHERE attempt.id = ${attemptId} AND attempt.player_id = ${playerId}`.pipe(
          Effect.flatMap(decodeRows),
        );
      const row = rows.at(0);
      if (row === undefined) return yield* new RoundNotFound({ id: attemptId });
      return row;
    });

    const start = Effect.fn("@snapcall/RoundRepository.start")(
      (
        playerId: string,
        requestId: string,
        attemptId: string,
        puzzles: ReadonlyArray<Rules.StoredPuzzle>,
      ) =>
        sql.withTransaction(
          Effect.gen(function* () {
            const stored = yield* Schema.decodeEffect(Rules.StoredPuzzles)(puzzles);
            yield* sql`
            INSERT INTO round_attempts (id, player_id, request_id, round_id, puzzles)
            VALUES (${attemptId}, ${playerId}, ${requestId}, 'hand-strength', ${JSON.stringify(stored)}::jsonb)
            ON CONFLICT (player_id, request_id) DO NOTHING
          `;
            // The second statement sees a concurrent winner after its insert commits.
            const rows = yield* sql`
            ${selectSnapshot} WHERE attempt.player_id = ${playerId} AND attempt.request_id = ${requestId}
          `.pipe(Effect.flatMap(decodeRows));
            const row = rows.at(0);
            if (row === undefined)
              return yield* new PersistenceError({
                operation: "start",
                cause: "Inserted attempt missing",
              });
            return publicSnapshot(row);
          }),
        ),
      Effect.catchTags({
        SqlError: persistenceFailure("start"),
        SchemaError: persistenceFailure("start"),
      }),
    );

    const get = Effect.fn("@snapcall/RoundRepository.get")(
      (playerId: string, attemptId: string) =>
        readOwned(playerId, attemptId).pipe(Effect.map(publicSnapshot)),
      Effect.catchTags({
        SqlError: persistenceFailure("get"),
        SchemaError: persistenceFailure("get"),
      }),
    );

    const answer = Effect.fn("@snapcall/RoundRepository.answer")(
      (playerId: string, attemptId: string, payload: SubmitAnswer) =>
        sql.withTransaction(
          Effect.gen(function* () {
            const locked = yield* sql`
            SELECT id FROM round_attempts WHERE id = ${attemptId} AND player_id = ${playerId} FOR UPDATE
          `;
            if (locked.length === 0) return yield* new RoundNotFound({ id: attemptId });
            const row = yield* readOwned(playerId, attemptId);
            const puzzle = row.puzzles.find((candidate) => candidate.id === payload.puzzleId);
            if (puzzle === undefined)
              return yield* new RoundConflict({
                message: "This puzzle does not belong to this attempt.",
              });
            const previous = row.answers.find((saved) => saved.puzzleId === payload.puzzleId);
            // Check retries before completion or current position: even the fifth answer is retryable.
            if (previous !== undefined) {
              if (
                Rules.selectionKey(previous.selectedCards) !==
                Rules.selectionKey(payload.selectedCards)
              )
                return yield* new RoundConflict({
                  message: "This puzzle already has a different answer.",
                });
              return {
                feedback: Rules.feedbackFor(puzzle, previous.selectedCards),
                attempt: publicSnapshot(row),
              };
            }
            if (row.puzzles[row.answers.length]?.id !== payload.puzzleId) {
              return yield* new RoundConflict({
                message: "Answer the current puzzle before continuing.",
              });
            }
            if (!Rules.isSelectionFrom(puzzle, payload.selectedCards)) {
              return yield* new RoundConflict({
                message: "Select five cards dealt in this puzzle.",
              });
            }
            const feedback = Rules.feedbackFor(puzzle, payload.selectedCards);
            yield* sql`
            INSERT INTO round_answers (attempt_id, puzzle_id, position, selected_cards, correct)
            VALUES (${attemptId}, ${puzzle.id}, ${puzzle.position}, ${JSON.stringify(feedback.selectedCards)}::jsonb, ${feedback.correct})
          `;
            return { feedback, attempt: publicSnapshot(yield* readOwned(playerId, attemptId)) };
          }),
        ),
      Effect.catchTags({
        SqlError: persistenceFailure("answer"),
        SchemaError: persistenceFailure("answer"),
      }),
    );

    return Service.of({ start, get, answer });
  }),
);
