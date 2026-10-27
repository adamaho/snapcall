# @snapcall/snapcall-server

Effect HTTP implementation of `@snapcall/snapcall-api`, following Goho's server
layout. Node.js runs the TypeScript entry point directly. The first round asks
players to recognize high card or one pair in five-card hands.

## API

Successful responses use `{ data: ... }`. Create an anonymous player once and
retain the returned token; round requests use `Authorization: Bearer <token>`.
The database stores only the token hash. The typed Effect client accepts the
redacted token as `Client.make(baseUrl, token)`.

| Method and path                           | Authentication | Request and result                                                                                                 |
| ----------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------ |
| `POST /players`                           | None           | No payload; returns `{ playerId, token }`.                                                                         |
| `POST /rounds/hand-recognition/attempts`  | Bearer         | Send `{ requestId }` with a UUID; returns the attempt and current puzzle.                                          |
| `GET /round-attempts/:attemptId`          | Bearer         | Returns current progress and puzzle, or the completed result.                                                      |
| `POST /round-attempts/:attemptId/answers` | Bearer         | Send `{ puzzleId, answer }`, where `answer` is `high-card` or `one-pair`; returns feedback and the latest attempt. |

`GET /health` returns `{"data":{"status":"ok"}}` without querying the database.
`GET /openapi.json` serves the shared contract; `GET /docs` serves Swagger UI.

## Round behavior

Each attempt contains five distinct hands and both hand types. Only the current
puzzle is exposed; its solution is returned after an answer is accepted.
Every accepted answer advances to the next puzzle, including wrong answers.
The attempt ends after the fifth answer, with no mistake queue.

| Correct answers | Stars |
| --------------- | ----- |
| 0–2             | 0     |
| 3               | 1     |
| 4               | 2     |
| 5               | 3     |

`stars` is null until completion. `bestScore` and `bestStars` reflect the player's
best completed attempt for this round; unfinished or lower-scoring attempts
cannot reduce that best.

Reuse the same `requestId` when retrying a start request: the same player gets
the existing attempt and its current state. A new `requestId` starts a whole-round
replay with five newly generated hands. Repeating an accepted answer with the
same choice returns its feedback and the latest progress without scoring or
advancing twice, even after completion.

Malformed requests return 400. Missing or invalid credentials return 401
(`Unauthorized`); missing attempts or attempts owned by another player return
404 (`RoundNotFound`). A changed answer, unrelated puzzle, or out-of-order answer
returns 409 (`RoundConflict`). Internal failures return 500 (`InternalServerError`)
without exposing database details.

## Responsibilities

- `src/http.ts`: request handlers and authentication wiring.
- `src/players`: credential creation, token hashing, authentication, and player persistence.
- `src/rounds/rules.ts`: valid hand generation, classification, scoring, and feedback.
- `src/rounds/service.ts`: round operations and mapping private failures to public errors.
- `src/rounds/repository.ts`: owned attempts, atomic answers, repeated-request handling, and best scores.
- `src/database`: connection configuration and the explicit migration registry.
- `src/main.ts`: runtime layer composition and HTTP listener.

See [CONTRIBUTING.md](CONTRIBUTING.md) for startup, client generation, migrations,
and unit and database integration tests. The Android game screen is a separate step.
