import { NodeCrypto } from "@effect/platform-node";
import { it } from "@effect/vitest";
import { Card, type Puzzle } from "@snapcall/snapcall-api/rounds";
import { Array, Effect, Result, Schema } from "effect";
import { expect } from "vitest";

import * as Rules from "#src/rounds/rules.ts";

const suits: ReadonlyMap<string, Card["suit"]> = new Map([
  ["c", "clubs"],
  ["d", "diamonds"],
  ["h", "hearts"],
  ["s", "spades"],
]);
const cards = (input: string): ReadonlyArray<Card> =>
  Schema.decodeUnknownSync(Schema.Array(Card))(
    input.split(" ").map((code) => ({ rank: code.slice(0, -1), suit: suits.get(code.slice(-1)) })),
  );
const puzzle = (input: string): Puzzle => {
  const deal = cards(input);
  return {
    id: "10000000-0000-4000-8000-000000000001",
    position: 1,
    holeCards: deal.slice(0, 2),
    board: {
      flop: deal.slice(2, 5),
      turn: Array.getUnsafe(deal, 5),
      river: Array.getUnsafe(deal, 6),
    },
  };
};

const categories = [
  { input: "As Kd 9h 7c 3s", handType: "high-card", value: [0, 14, 13, 9, 7, 3] },
  { input: "Ks Kd Ah 7c 3s", handType: "one-pair", value: [1, 13, 14, 7, 3] },
  { input: "Ks Kd 7h 7c As", handType: "two-pair", value: [2, 13, 7, 14] },
  { input: "9s 9d 9h Ac 2s", handType: "three-of-a-kind", value: [3, 9, 14, 2] },
  { input: "9s 8d 7h 6c 5s", handType: "straight", value: [4, 9] },
  { input: "As Js 9s 4s 2s", handType: "flush", value: [5, 14, 11, 9, 4, 2] },
  { input: "7s 7d 7h Kc Ks", handType: "full-house", value: [6, 7, 13] },
  { input: "2s 2d 2h 2c As", handType: "four-of-a-kind", value: [7, 2, 14] },
  { input: "9s 8s 7s 6s 5s", handType: "straight-flush", value: [8, 9] },
];

it.each(categories)(
  "evaluates $handType and its complete tie-break ranks",
  ({ input, handType, value }) => {
    expect(Rules.evaluateFive(cards(input))).toEqual({ handType, value });
  },
);

it("ranks all nine categories in standard poker order", () => {
  for (let index = 1; index < categories.length; index++) {
    const weaker = Rules.evaluateFive(cards(Array.getUnsafe(categories, index - 1).input));
    const stronger = Rules.evaluateFive(cards(Array.getUnsafe(categories, index).input));
    expect(Rules.compareHands(stronger, weaker)).toBe(1);
    expect(Rules.compareHands(weaker, stronger)).toBe(-1);
  }
});

it.each([
  { input: "As 2d 3h 4c 5s", handType: "straight", value: [4, 5] },
  { input: "10s Jd Qh Kc As", handType: "straight", value: [4, 14] },
  { input: "As 2s 3s 4s 5s", handType: "straight-flush", value: [8, 5] },
  { input: "10s Js Qs Ks As", handType: "straight-flush", value: [8, 14] },
  { input: "Qs Kd Ah 2c 3s", handType: "high-card", value: [0, 14, 13, 12, 3, 2] },
])("handles ace boundaries for $input", ({ input, handType, value }) => {
  expect(Rules.evaluateFive(cards(input))).toEqual({ handType, value });
});

it.each([
  { name: "high-card last kicker", stronger: "As Kd Qh 9c 4s", weaker: "Ad Kh Qc 9s 3d" },
  { name: "pair rank", stronger: "5s 5d Qh 9c 4s", weaker: "4d 4h Ac Ks Qd" },
  { name: "pair final kicker", stronger: "As Ad Kh Qc Js", weaker: "Ah Ac Kd Qs 10d" },
  { name: "two-pair high pair", stronger: "Qs Qd 2h 2c As", weaker: "Jd Jh 10c 10s Ad" },
  { name: "two-pair low pair", stronger: "As Ad 7h 7c Ks", weaker: "Ah Ac 6d 6s Kd" },
  { name: "two-pair kicker", stronger: "As Ad Kh Kc Qs", weaker: "Ah Ac Kd Ks Jd" },
  { name: "trips final kicker", stronger: "8s 8d 8h Ac Ks", weaker: "8s 8d 8h Ac Qs" },
  { name: "straight over wheel", stronger: "2s 3d 4h 5c 6s", weaker: "As 2d 3h 4c 5s" },
  { name: "flush fifth card", stronger: "As Js 9s 7s 4s", weaker: "Ah Jh 9h 7h 3h" },
  { name: "full-house trips", stronger: "9s 9d 9h 2c 2s", weaker: "8s 8d 8h Ac As" },
  { name: "full-house pair", stronger: "8s 8d 8h Ac As", weaker: "8s 8d 8h Kc Ks" },
  { name: "quads kicker", stronger: "8s 8d 8h 8c As", weaker: "8s 8d 8h 8c Ks" },
])("resolves $name", ({ stronger, weaker }) => {
  expect(
    Rules.compareHands(Rules.evaluateFive(cards(stronger)), Rules.evaluateFive(cards(weaker))),
  ).toBe(1);
});

it("does not use suits to break a tie", () => {
  expect(
    Rules.compareHands(
      Rules.evaluateFive(cards("As Js 9s 7s 4s")),
      Rules.evaluateFive(cards("Ah Jh 9h 7h 4h")),
    ),
  ).toBe(0);
});

it.each([
  {
    name: "two sets of trips",
    input: "As Ad Ah Ks Kd Kh 2c",
    handType: "full-house",
    value: [6, 14, 13],
  },
  {
    name: "three pairs",
    input: "As Ad Ks Kd Qs Qd 2c",
    handType: "two-pair",
    value: [2, 14, 13, 12],
  },
  {
    name: "six suited cards",
    input: "As Js 9s 7s 4s 3s Kd",
    handType: "flush",
    value: [5, 14, 11, 9, 7, 4],
  },
  { name: "six-card straight", input: "As 2d 3h 4c 5s 6h Kd", handType: "straight", value: [4, 6] },
  {
    name: "quads with a paired kicker",
    input: "Ac Ad Ah As Kc Kd 2s",
    handType: "four-of-a-kind",
    value: [7, 14, 13],
  },
])("selects the best five from $name", ({ input, handType, value }) => {
  const deal = cards(input);
  const best = Rules.bestHand(deal);
  expect(best.handType).toBe(handType);
  expect(best.value).toEqual(value);
  expect(best.cards).toHaveLength(5);
  expect(Rules.bestHand([...deal].reverse())).toEqual(best);
});

it.each([
  { holesUsed: 0, input: "2c 3d As Ks Qs Js 10s", best: "As Ks Qs Js 10s" },
  { holesUsed: 1, input: "As 2d Ah Kc Qs Jd 9c", best: "As Ah Kc Qs Jd" },
  { holesUsed: 2, input: "As Ad Ah Kc Qs Jd 9c", best: "As Ad Ah Kc Qs" },
])("allows the best hand to use $holesUsed hole cards", ({ input, best }) => {
  const deal = puzzle(input);
  expect(Rules.selectionKey(Rules.bestHand(Rules.cardsFor(deal)).cards)).toBe(
    Rules.selectionKey(cards(best)),
  );
  expect(Rules.feedbackFor(deal, cards(best)).correct).toBe(true);
});

it("accepts either tied best selection and highlights the accepted cards", () => {
  const deal = puzzle("As Ad Ks Kd Qs Qd 2c");
  for (const selection of ["As Ad Ks Kd Qs", "As Ad Ks Kd Qd"]) {
    const feedback = Rules.feedbackFor(deal, cards(selection));
    expect(feedback.correct).toBe(true);
    expect(feedback.selectedHandType).toBe("two-pair");
    expect(feedback.bestCards).toEqual(feedback.selectedCards);
    expect(Rules.selectionKey(feedback.bestCards)).toBe(Rules.selectionKey(cards(selection)));
    expect(Rules.feedbackFor(deal, [...cards(selection)].reverse())).toEqual(feedback);
  }
});

it("rejects a weaker selection of the same category and explains the kicker difference", () => {
  const feedback = Rules.feedbackFor(puzzle("As Ad Ks Qd Jc 9h 2s"), cards("As Ad Ks Qd 9h"));
  expect(feedback.correct).toBe(false);
  expect(feedback.selectedHandType).toBe("one-pair");
  expect(feedback.bestHandType).toBe("one-pair");
  expect(Rules.selectionKey(feedback.bestCards)).toBe(Rules.selectionKey(cards("As Ad Ks Qd Jc")));
  expect(feedback.explanation).toBe(
    "Your pair of aces with king, queen, nine kickers is beaten by pair of aces with king, queen, jack kickers.",
  );
});

it("explains an ace-low straight correctly", () => {
  const feedback = Rules.feedbackFor(puzzle("As 2d 3h 4c 5s 9d Kc"), cards("As 2d 3h 4c 5s"));
  expect(feedback.explanation).toContain("five-high straight (ace plays low)");
});

it.each([
  { name: "too few cards", selection: "As Ad Ks Qd", valid: false },
  { name: "too many cards", selection: "As Ad Ks Qd Jc 10h", valid: false },
  { name: "duplicate physical card", selection: "As As Ks Qd Jc", valid: false },
  { name: "card not in the deal", selection: "As Ad Ks Qd Jh", valid: false },
  { name: "valid reordered cards", selection: "Jc Ad Qd As Ks", valid: true },
])("validates $name", ({ selection, valid }) => {
  expect(Rules.isSelectionFrom(puzzle("As Ad Ks Qd Jc 10h 2s"), cards(selection))).toBe(valid);
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

it.effect("generates five ordered, distinct Hold'em deals with seven unique cards", () =>
  Effect.gen(function* () {
    for (let index = 0; index < 64; index++) {
      const puzzles = yield* Rules.generatePuzzles();
      expect(puzzles.map((deal) => deal.position)).toEqual([1, 2, 3, 4, 5]);
      expect(new Set(puzzles.map((deal) => deal.id)).size).toBe(5);
      expect(new Set(puzzles.map((deal) => Rules.selectionKey(Rules.cardsFor(deal)))).size).toBe(5);
      for (const deal of puzzles) {
        expect(deal.holeCards).toHaveLength(2);
        expect(deal.board.flop).toHaveLength(3);
        const available = Rules.cardsFor(deal);
        expect(available).toHaveLength(7);
        expect(new Set(available.map((card) => `${card.rank}:${card.suit}`)).size).toBe(7);
      }
      yield* Schema.decodeEffect(Rules.StoredPuzzles)(puzzles);
    }
  }).pipe(Effect.provide(NodeCrypto.layer)),
);

it.effect("rejects persisted duplicate cards, duplicate deals or identities, and wrong order", () =>
  Effect.gen(function* () {
    const puzzles = yield* Rules.generatePuzzles();
    const first = Array.getUnsafe(puzzles, 0);
    const repeatedCard = {
      ...first,
      board: { ...first.board, river: Array.getUnsafe(first.holeCards, 0) },
    };
    const repeatedDeal = puzzles.map((deal) => ({
      ...first,
      id: deal.id,
      position: deal.position,
    }));
    const repeatedId = puzzles.map((deal) => ({ ...deal, id: first.id }));
    for (const invalid of [
      [repeatedCard, ...puzzles.slice(1)],
      repeatedDeal,
      repeatedId,
      [...puzzles].reverse(),
    ]) {
      expect(
        Result.isFailure(
          yield* Schema.decodeEffect(Rules.StoredPuzzles)(invalid).pipe(Effect.result),
        ),
      ).toBe(true);
    }
  }).pipe(Effect.provide(NodeCrypto.layer)),
);
