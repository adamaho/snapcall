import { Effect } from "effect";
import { SqlClient } from "effect/sql";

/**
 * Anonymous identities and durable five-question attempts, applied as one migration.
 *
 * @category migrations
 * @since 0.1.0
 */
export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`
    CREATE TABLE players (
      id uuid PRIMARY KEY,
      token_hash text UNIQUE NOT NULL CHECK (token_hash ~ '^[0-9a-f]{64}$'),
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  yield* sql`
    CREATE TABLE round_attempts (
      id uuid PRIMARY KEY,
      player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      request_id uuid NOT NULL,
      round_id text NOT NULL CHECK (round_id = 'hand-recognition'),
      puzzles jsonb NOT NULL CHECK (jsonb_typeof(puzzles) = 'array' AND jsonb_array_length(puzzles) = 5),
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (player_id, request_id)
    )
  `;
  yield* sql`CREATE INDEX round_attempts_player_round_idx ON round_attempts (player_id, round_id)`;
  yield* sql`
    CREATE TABLE round_answers (
      attempt_id uuid NOT NULL REFERENCES round_attempts(id) ON DELETE CASCADE,
      puzzle_id uuid NOT NULL,
      position smallint NOT NULL CHECK (position BETWEEN 1 AND 5),
      answer text NOT NULL CHECK (answer IN ('high-card', 'one-pair')),
      correct boolean NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (attempt_id, puzzle_id),
      UNIQUE (attempt_id, position)
    )
  `;
});
