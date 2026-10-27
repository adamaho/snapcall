import { NodeCrypto, NodeHttpServer, NodeServices } from "@effect/platform-node";
import { it } from "@effect/vitest";
import {
  Card,
  type Puzzle,
  type RoundAttempt,
  type SubmitAnswer,
} from "@snapcall/snapcall-api/rounds";
import * as Client from "@snapcall/snapcall-server-client/client";
import { Crypto, Effect, Layer, Redacted, Schema } from "effect";
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

// Fixed expected selections keep HTTP grading checks independent of the evaluator.
const cards = (text: string): ReadonlyArray<Card> =>
  text.split(" ").map((token) => {
    const suit = new Map([
      ["c", "clubs"],
      ["d", "diamonds"],
      ["h", "hearts"],
      ["s", "spades"],
    ]).get(token.slice(-1));
    return Schema.decodeUnknownSync(Card)({ rank: token.slice(0, -1), suit });
  });
const fixtures = [
  {
    hole: "Ac Kd",
    flop: "Qc Jh 10s",
    turn: "2c",
    river: "3d",
    good: "Ac Kd Qc Jh 10s",
    bad: "Qc Jh 10s 2c 3d",
    hand: "straight",
  },
  {
    hole: "2c 3d",
    flop: "Ah Kh Qh",
    turn: "Jh",
    river: "10h",
    good: "Ah Kh Qh Jh 10h",
    bad: "2c Ah Kh Qh Jh",
    hand: "straight-flush",
  },
  {
    hole: "Ac Ad",
    flop: "Ah Kc Kd",
    turn: "Ks",
    river: "2c",
    good: "Ac Ad Ah Kc Kd",
    bad: "Ac Ah Kc Kd Ks",
    hand: "full-house",
  },
  {
    hole: "Ah 2d",
    flop: "Kh Qh 9h",
    turn: "7h",
    river: "3c",
    good: "Ah Kh Qh 9h 7h",
    bad: "Kh Qh 9h 7h 3c",
    hand: "flush",
  },
  {
    hole: "Ac Qd",
    flop: "As Kc 8d",
    turn: "5s",
    river: "2h",
    good: "Ac As Kc Qd 8d",
    bad: "Ac As Kc 8d 5s",
    hand: "one-pair",
  },
];
const fixtureFor = (puzzle: Puzzle) => {
  const fixture = fixtures[puzzle.position - 1];
  if (fixture === undefined) throw new Error("Missing puzzle fixture");
  return fixture;
};
const correctCards = (puzzle: Puzzle) => cards(fixtureFor(puzzle).good);
const wrongCards = (puzzle: Puzzle) => cards(fixtureFor(puzzle).bad);
const cardSet = (selection: ReadonlyArray<Card>) =>
  new Set(selection.map((card) => JSON.stringify(card)));

const setFixture = Effect.fn("@snapcall/Test.setFixture")(function* (attempt: RoundAttempt) {
  const puzzles: Array<Puzzle> = [];
  for (const [index, fixture] of fixtures.entries()) {
    const [turn] = cards(fixture.turn);
    const [river] = cards(fixture.river);
    if (turn === undefined || river === undefined) throw new Error("Missing board fixture");
    puzzles.push({
      id: yield* newId,
      position: index + 1,
      holeCards: cards(fixture.hole),
      board: { flop: cards(fixture.flop), turn, river },
    });
  }
  const sql = yield* SqlClient.SqlClient;
  yield* sql`UPDATE round_attempts SET puzzles = ${JSON.stringify(puzzles)}::jsonb WHERE id = ${attempt.id}`;
  return { ...attempt, puzzle: puzzles[0] ?? null };
});

it.effect("protects player-owned attempts and stores only hashed bearer credentials", () =>
  Effect.gen(function* () {
    const { client, credentials } = yield* register();
    const { client: stranger } = yield* register();
    const attempt = yield* setFixture(
      (yield* client.rounds.start({ payload: { requestId: yield* newId } })).data,
    );
    const puzzle = currentPuzzle(attempt);
    expect(attempt).toMatchObject({ answeredCount: 0, score: 0, stars: null, bestScore: 0 });
    expect(puzzle).not.toHaveProperty("correctAnswer");
    expect(puzzle).not.toHaveProperty("explanation");
    expect(puzzle.holeCards).toHaveLength(2);
    expect(puzzle.board.flop).toHaveLength(3);
    expect(puzzle).not.toHaveProperty("bestCards");
    expect(puzzle).not.toHaveProperty("choices");

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
          payload: { puzzleId: puzzle.id, selectedCards: correctCards(puzzle) },
        })
        .pipe(Effect.flip))._tag,
    ).toBe("RoundNotFound");
    expect(
      (yield* client.rounds.get({ params: { attemptId: yield* newId } }).pipe(Effect.flip))._tag,
    ).toBe("RoundNotFound");

    const request = yield* HttpClientRequest.post(`/round-attempts/${attempt.id}/answers`).pipe(
      HttpClientRequest.bearerToken(credentials.token),
      HttpClientRequest.bodyJson({
        puzzleId: puzzle.id,
        selectedCards: correctCards(puzzle),
        score: 5,
      }),
    );
    expect((yield* (yield* HttpClient.HttpClient).execute(request)).status).toBe(400);
    for (const invalidCards of [
      correctCards(puzzle).slice(0, 4),
      [...correctCards(puzzle), puzzle.board.turn],
      cards("Ac Ac Qc Jh 10s"),
    ]) {
      const malformed = yield* HttpClientRequest.post(`/round-attempts/${attempt.id}/answers`).pipe(
        HttpClientRequest.bearerToken(credentials.token),
        HttpClientRequest.bodyJson({ puzzleId: puzzle.id, selectedCards: invalidCards }),
      );
      expect((yield* (yield* HttpClient.HttpClient).execute(malformed)).status).toBe(400);
    }
    expect(
      (yield* client.rounds
        .answer({
          params: { attemptId: attempt.id },
          payload: { puzzleId: puzzle.id, selectedCards: cards("Ac Kd Qc Jh 9s") },
        })
        .pipe(Effect.flip))._tag,
    ).toBe("RoundConflict");
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
      expect(starts[1].data).toEqual(starts[0].data);
      const attempt = yield* setFixture(starts[0].data);
      const sql = yield* SqlClient.SqlClient;
      expect(
        yield* sql`SELECT id FROM round_attempts WHERE player_id = ${credentials.playerId}`,
      ).toHaveLength(1);
      const puzzle = currentPuzzle(attempt);
      const payload = { puzzleId: puzzle.id, selectedCards: correctCards(puzzle) };
      const answers = yield* Effect.all(
        [
          client.rounds.answer({ params: { attemptId: attempt.id }, payload }),
          client.rounds.answer({
            params: { attemptId: attempt.id },
            payload: { ...payload, selectedCards: [...payload.selectedCards].reverse() },
          }),
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
          payload: { ...payload, selectedCards: wrongCards(puzzle) },
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
            payload: { puzzleId: futureId, selectedCards: correctCards(puzzle) },
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
        let attempt = yield* setFixture(
          (yield* client.rounds.start({ payload: { requestId: yield* newId } })).data,
        );
        let firstPayload: SubmitAnswer | undefined;
        for (let index = 0; index < 5; index++) {
          const puzzle = currentPuzzle(attempt);
          expect(puzzle.position).toBe(index + 1);
          const selectedCards = index < target ? correctCards(puzzle) : wrongCards(puzzle);
          // A second, equally strong full house must also be accepted.
          const selection = index === 2 && index < target ? cards("Ac Ad Ah Kc Ks") : selectedCards;
          const payload = { puzzleId: puzzle.id, selectedCards: selection };
          if (index === 0) firstPayload = payload;
          const result = (yield* client.rounds.answer({
            params: { attemptId: attempt.id },
            payload,
          })).data;
          expect(result.feedback).toMatchObject({
            puzzleId: puzzle.id,
            bestHandType: fixtureFor(puzzle).hand,
            correct: index < target,
          });
          expect(cardSet(result.feedback.selectedCards)).toEqual(cardSet(selection));
          if (index < target)
            expect(cardSet(result.feedback.bestCards)).toEqual(cardSet(selection));
          else if (index === 2) {
            // Any of the three king pairs completes aces full of kings.
            const { holeCards, board } = puzzle;
            const dealt = cardSet([...holeCards, ...board.flop, board.turn, board.river]);
            const best = result.feedback.bestCards;
            expect(best.map((card) => card.rank).sort()).toEqual(["A", "A", "A", "K", "K"]);
            expect(best.every((card) => dealt.has(JSON.stringify(card)))).toBe(true);
          } else expect(cardSet(result.feedback.bestCards)).toEqual(cardSet(correctCards(puzzle)));
          expect(result.feedback.explanation.length).toBeGreaterThan(0);
          if (target === 3 && index === 2) {
            // An accepted tie is final: another equally strong set conflicts; reordering does not.
            expect(
              (yield* client.rounds
                .answer({
                  params: { attemptId: attempt.id },
                  payload: { ...payload, selectedCards: correctCards(puzzle) },
                })
                .pipe(Effect.flip))._tag,
            ).toBe("RoundConflict");
            const retried = (yield* client.rounds.answer({
              params: { attemptId: attempt.id },
              payload: { ...payload, selectedCards: [...selection].reverse() },
            })).data;
            expect(retried).toEqual(result);
          }
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
          payload: { ...firstPayload, selectedCards: [...firstPayload.selectedCards].reverse() },
        })).data;
        expect(repeated.attempt).toEqual(attempt);
        expect(
          (yield* client.rounds
            .answer({
              params: { attemptId: attempt.id },
              payload: { puzzleId: yield* newId, selectedCards: cards("Ac Kd Qc Jh 10s") },
            })
            .pipe(Effect.flip))._tag,
        ).toBe("RoundConflict");
      }
    }).pipe(Effect.provide(TestLive)),
);
