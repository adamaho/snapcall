import { NodeCrypto } from "@effect/platform-node";
import { it } from "@effect/vitest";
import { type Card } from "@snapcall/snapcall-api/rounds";
import { Effect, Result, Schema } from "effect";
import { expect } from "vitest";

import * as Rules from "#src/rounds/rules.ts";

const hand = (ranks: ReadonlyArray<Card["rank"]>): ReadonlyArray<Card> => {
  const suits: ReadonlyArray<Card["suit"]> = ["clubs", "diamonds", "hearts", "spades", "clubs"];
  return ranks.map((rank, index) => ({ rank, suit: suits[index] ?? "clubs" }));
};

it.each([
  { name: "high card", cards: hand(["2", "5", "8", "J", "A"]), expected: "high-card" },
  { name: "one pair", cards: hand(["K", "K", "3", "7", "A"]), expected: "one-pair" },
  { name: "straight", cards: hand(["5", "6", "7", "8", "9"]), expected: null },
  { name: "ace-low straight", cards: hand(["A", "2", "3", "4", "5"]), expected: null },
  { name: "ace-high straight", cards: hand(["10", "J", "Q", "K", "A"]), expected: null },
  { name: "two pairs", cards: hand(["2", "2", "7", "7", "A"]), expected: null },
  { name: "three of a kind", cards: hand(["2", "2", "2", "7", "A"]), expected: null },
  { name: "four of a kind", cards: hand(["2", "2", "2", "2", "A"]), expected: null },
  { name: "too few cards", cards: hand(["2", "5", "8", "J"]), expected: null },
  {
    name: "flush",
    cards: hand(["2", "5", "8", "J", "A"]).map((card) => ({ ...card, suit: "hearts" as const })),
    expected: null,
  },
  {
    name: "duplicate physical card",
    cards: hand(["K", "K", "3", "7", "A"]).map((card) => ({ ...card, suit: "hearts" as const })),
    expected: null,
  },
])("classifies $name without accepting stronger or invalid hands", ({ cards, expected }) => {
  expect(Rules.classify(cards)).toBe(expected);
});

it.each([
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 1],
  [4, 2],
  [5, 3],
])("awards %i correct answers %i stars", (score, stars) =>
  expect(Rules.starsForScore(score)).toBe(stars),
);

it.effect(
  "generates complete rounds with both categories, valid cards, and five distinct hands",
  () =>
    Effect.gen(function* () {
      for (let index = 0; index < 64; index++) {
        const puzzles = yield* Rules.generatePuzzles();
        expect(puzzles).toHaveLength(5);
        expect(puzzles.map((puzzle) => puzzle.position)).toEqual([1, 2, 3, 4, 5]);
        expect(new Set(puzzles.map((puzzle) => puzzle.correctAnswer))).toEqual(
          new Set(["high-card", "one-pair"]),
        );
        expect(new Set(puzzles.map((puzzle) => puzzle.id)).size).toBe(5);
        expect(
          new Set(
            puzzles.map((puzzle) =>
              puzzle.cards
                .map((card) => `${card.rank}:${card.suit}`)
                .sort()
                .join(","),
            ),
          ).size,
        ).toBe(5);
        for (const puzzle of puzzles) {
          expect(puzzle.cards).toHaveLength(5);
          expect(new Set(puzzle.cards.map((card) => `${card.rank}:${card.suit}`)).size).toBe(5);
          expect(Rules.classify(puzzle.cards)).toBe(puzzle.correctAnswer);
          expect(puzzle.choices).toEqual(["high-card", "one-pair"]);
        }
        yield* Schema.decodeEffect(Rules.StoredPuzzles)(puzzles);
      }
    }).pipe(Effect.provide(NodeCrypto.layer)),
);

it.effect("rejects stored solutions or puzzle order that disagree with the hands", () =>
  Effect.gen(function* () {
    const puzzles = yield* Rules.generatePuzzles();
    const wrongSolutions = puzzles.map((puzzle) => ({
      ...puzzle,
      correctAnswer: puzzle.correctAnswer === "high-card" ? "one-pair" : "high-card",
    }));
    for (const invalid of [wrongSolutions, [...puzzles].reverse()]) {
      expect(
        Result.isFailure(
          yield* Schema.decodeUnknownEffect(Rules.StoredPuzzles)(invalid).pipe(Effect.result),
        ),
      ).toBe(true);
    }
  }).pipe(Effect.provide(NodeCrypto.layer)),
);
