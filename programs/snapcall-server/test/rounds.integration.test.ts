import { NodeCrypto, NodeHttpServer, NodeServices } from "@effect/platform-node";
import { it } from "@effect/vitest";
import type { HandType, Puzzle, RoundAttempt, SubmitAnswer } from "@snapcall/snapcall-api/rounds";
import * as Client from "@snapcall/snapcall-server-client/client";
import { Crypto, Effect, Layer, Redacted } from "effect";
import { HttpClient, HttpClientRequest, HttpRouter } from "effect/http";
import { SqlClient } from "effect/sql";
import { expect } from "vitest";

import * as Migrations from "#src/database/migrations.ts";
import * as Http from "#src/http.ts";
import * as PlayerRepository from "#src/players/repository.ts";
import * as Players from "#src/players/service.ts";
import * as RoundRepository from "#src/rounds/repository.ts";
import * as Rounds from "#src/rounds/service.ts";
import * as Database from "#test/database.ts";

const DatabaseLive = Layer.effectDiscard(Migrations.run()).pipe(
  Layer.provideMerge(Database.layer),
  Layer.provide(NodeServices.layer),
);

const RoundsLive = Rounds.layer.pipe(Layer.provide(RoundRepository.layer));

const PlayersLive = Players.layer.pipe(Layer.provide(PlayerRepository.layer));

const TestLive = HttpRouter.serve(Http.layer).pipe(
  Layer.provide([PlayersLive, RoundsLive]),
  Layer.provideMerge(DatabaseLive),
  Layer.provideMerge(NodeCrypto.layer),
  Layer.provideMerge(NodeHttpServer.layerTest),
);

const newId = Effect.gen(function* () {
  return yield* (yield* Crypto.Crypto).randomUUIDv4();
});

const register = Effect.fn("@snapcall/Test.register")(function* () {
  const publicClient = yield* Client.make("");
  const { data: credentials } = yield* publicClient.players.create();
  const client = yield* Client.make("", Redacted.make(credentials.token));
  return { client, credentials };
});

const currentPuzzle = (attempt: RoundAttempt): Puzzle => {
  if (attempt.puzzle === null) throw new Error("Expected an unfinished attempt");
  return attempt.puzzle;
};

// Independent oracle for this slice's two categories; generator validity is tested separately.
const correctAnswer = (puzzle: Puzzle): HandType =>
  new Set(puzzle.cards.map((card) => card.rank)).size === 4 ? "one-pair" : "high-card";
const opposite = (answer: HandType): HandType =>
  answer === "high-card" ? "one-pair" : "high-card";

it.effect("protects player-owned attempts and stores only hashed bearer credentials", () =>
  Effect.gen(function* () {
    const { client, credentials } = yield* register();
    const { client: stranger } = yield* register();
    const { data: attempt } = yield* client.rounds.start({ payload: { requestId: yield* newId } });
    const puzzle = currentPuzzle(attempt);
    expect(attempt).toMatchObject({ answeredCount: 0, score: 0, stars: null, bestScore: 0 });
    expect(puzzle).not.toHaveProperty("correctAnswer");
    expect(puzzle).not.toHaveProperty("explanation");
    expect(puzzle.cards).toHaveLength(5);

    const sql = yield* SqlClient.SqlClient;
    const rows = yield* sql<{
      token_hash: string;
    }>`SELECT token_hash FROM players WHERE id = ${credentials.playerId}`;
    expect(rows[0]?.token_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(rows[0]?.token_hash).not.toBe(credentials.token);

    expect((yield* HttpClient.get(`/round-attempts/${attempt.id}`)).status).toBe(401);
    expect(
      (yield* HttpClient.get(`/round-attempts/${attempt.id}`, {
        headers: { authorization: "Bearer invalid" },
      })).status,
    ).toBe(401);
    const failure = yield* stranger.rounds
      .get({ params: { attemptId: attempt.id } })
      .pipe(Effect.flip);
    expect(failure._tag).toBe("RoundNotFound");
    expect(
      (yield* stranger.rounds
        .answer({
          params: { attemptId: attempt.id },
          payload: { puzzleId: puzzle.id, answer: correctAnswer(puzzle) },
        })
        .pipe(Effect.flip))._tag,
    ).toBe("RoundNotFound");
    expect(
      (yield* client.rounds.get({ params: { attemptId: yield* newId } }).pipe(Effect.flip))._tag,
    ).toBe("RoundNotFound");

    const request = yield* HttpClientRequest.post(`/round-attempts/${attempt.id}/answers`).pipe(
      HttpClientRequest.bearerToken(credentials.token),
      HttpClientRequest.bodyJson({ puzzleId: puzzle.id, answer: correctAnswer(puzzle), score: 5 }),
    );
    expect((yield* (yield* HttpClient.HttpClient).execute(request)).status).toBe(400);
    expect(
      (yield* client.rounds.get({ params: { attemptId: attempt.id } })).data.answeredCount,
    ).toBe(0);
  }).pipe(Effect.provide(TestLive)),
);

it.effect(
  "deduplicates concurrent starts and answers, rejects conflicting or out-of-order answers, and reloads progress",
  () =>
    Effect.gen(function* () {
      const { client, credentials } = yield* register();
      const requestId = yield* newId;
      const starts = yield* Effect.all(
        [
          client.rounds.start({ payload: { requestId } }),
          client.rounds.start({ payload: { requestId } }),
        ],
        { concurrency: "unbounded" },
      );
      const attempt = starts[0].data;
      expect(starts[1].data).toEqual(attempt);
      const sql = yield* SqlClient.SqlClient;
      expect(
        yield* sql`SELECT id FROM round_attempts WHERE player_id = ${credentials.playerId}`,
      ).toHaveLength(1);
      const puzzle = currentPuzzle(attempt);
      const payload = { puzzleId: puzzle.id, answer: correctAnswer(puzzle) };
      const answers = yield* Effect.all(
        [
          client.rounds.answer({ params: { attemptId: attempt.id }, payload }),
          client.rounds.answer({ params: { attemptId: attempt.id }, payload }),
        ],
        { concurrency: "unbounded" },
      );
      expect(answers[0].data.feedback).toEqual(answers[1].data.feedback);
      expect(answers[0].data.attempt).toMatchObject({ answeredCount: 1, score: 1, bestScore: 0 });
      expect(answers[1].data.attempt).toMatchObject({ answeredCount: 1, score: 1 });
      expect(
        yield* sql`SELECT puzzle_id FROM round_answers WHERE attempt_id = ${attempt.id}`,
      ).toHaveLength(1);

      const conflict = yield* client.rounds
        .answer({
          params: { attemptId: attempt.id },
          payload: { ...payload, answer: opposite(payload.answer) },
        })
        .pipe(Effect.flip);
      expect(conflict._tag).toBe("RoundConflict");
      const future = yield* sql<{
        id: string;
      }>`SELECT puzzles -> 2 ->> 'id' AS id FROM round_attempts WHERE id = ${attempt.id}`;
      const futureId = future[0]?.id;
      if (futureId === undefined) throw new Error("Expected a third stored puzzle");
      expect(
        (yield* client.rounds
          .answer({
            params: { attemptId: attempt.id },
            payload: { puzzleId: futureId, answer: "one-pair" },
          })
          .pipe(Effect.flip))._tag,
      ).toBe("RoundConflict");

      const reloaded = yield* Effect.gen(function* () {
        return yield* (yield* Rounds.Service).get(credentials.playerId, attempt.id);
      }).pipe(Effect.provide(RoundsLive));
      expect(reloaded).toEqual(answers[0].data.attempt);
      expect((yield* client.rounds.start({ payload: { requestId } })).data).toEqual(reloaded);
      const replay = (yield* client.rounds.start({ payload: { requestId: yield* newId } })).data;
      expect(replay.id).not.toBe(attempt.id);
      expect(currentPuzzle(replay).id).not.toBe(puzzle.id);
      expect(replay).toMatchObject({ answeredCount: 0, score: 0, stars: null });
    }).pipe(Effect.provide(TestLive)),
);

it.effect(
  "ends after five answers, awards stars, and retains the best completed score across full-round replays",
  () =>
    Effect.gen(function* () {
      const { client } = yield* register();
      for (const target of [3, 4, 5, 0]) {
        let attempt = (yield* client.rounds.start({ payload: { requestId: yield* newId } })).data;
        let firstPayload: SubmitAnswer | undefined;
        for (let index = 0; index < 5; index++) {
          const puzzle = currentPuzzle(attempt);
          expect(puzzle.position).toBe(index + 1);
          const correct = correctAnswer(puzzle);
          const answer = index < target ? correct : opposite(correct);
          const payload = { puzzleId: puzzle.id, answer };
          if (index === 0) firstPayload = payload;
          const result = (yield* client.rounds.answer({
            params: { attemptId: attempt.id },
            payload,
          })).data;
          expect(result.feedback).toMatchObject({
            puzzleId: puzzle.id,
            answer,
            correctAnswer: correct,
            correct: index < target,
          });
          expect(result.feedback.explanation.length).toBeGreaterThan(0);
          attempt = result.attempt;
          expect(attempt.answeredCount).toBe(index + 1);
          if (index < 4) expect(attempt.stars).toBeNull();
          if (target === 3 && index === 3) expect(attempt.bestScore).toBe(0);
          if (target === 4 && index === 3) expect(attempt.bestScore).toBe(3);
        }
        expect(attempt).toMatchObject({
          status: "completed",
          answeredCount: 5,
          score: target,
          stars: target < 3 ? 0 : target - 2,
          bestScore: target === 0 ? 5 : target,
          bestStars: target === 0 ? 3 : target - 2,
          puzzle: null,
        });
        expect((yield* client.rounds.get({ params: { attemptId: attempt.id } })).data).toEqual(
          attempt,
        );
        if (firstPayload === undefined) throw new Error("Expected the first accepted answer");
        const repeated = (yield* client.rounds.answer({
          params: { attemptId: attempt.id },
          payload: firstPayload,
        })).data;
        expect(repeated.attempt).toEqual(attempt);
        expect(
          (yield* client.rounds
            .answer({
              params: { attemptId: attempt.id },
              payload: { puzzleId: yield* newId, answer: "high-card" },
            })
            .pipe(Effect.flip))._tag,
        ).toBe("RoundConflict");
      }
    }).pipe(Effect.provide(TestLive)),
);
