import { NodeServices } from "@effect/platform-node";
import { PgMigrator } from "@effect/sql-pg";
import { it } from "@effect/vitest";
import { Effect, Exit } from "effect";
import { SqlClient } from "effect/sql";
import { expect } from "vitest";

import * as Migrations from "#src/database/migrations.ts";
import { layer as DatabaseLive } from "#test/database.ts";

const createFixture = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`CREATE TABLE migration_fixture (id integer PRIMARY KEY, value text NOT NULL)`;
  yield* sql`INSERT INTO migration_fixture (id, value) VALUES (1, 'created')`;
});

const updateFixture = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`UPDATE migration_fixture SET value = 'updated' WHERE id = 1`;
});

it.effect("creates the game tables and can run again", () =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    expect(yield* Migrations.run()).toEqual([[1, "rounds"]]);
    expect(yield* Migrations.run()).toEqual([]);
    expect(
      yield* sql`SELECT tablename FROM pg_tables WHERE schemaname = current_schema() ORDER BY tablename`,
    ).toEqual([
      { tablename: "players" },
      { tablename: "round_answers" },
      { tablename: "round_attempts" },
      { tablename: "snapcall_migrations" },
    ]);
    expect(yield* sql`SELECT migration_id, name FROM snapcall_migrations`).toEqual([
      { migration_id: 1, name: "rounds" },
    ]);
  }).pipe(Effect.provide([DatabaseLive, NodeServices.layer])),
);

it.effect("applies ordered migrations once and records their identities", () =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    const migrate = PgMigrator.run({
      loader: PgMigrator.fromRecord({
        "0002_update_fixture": updateFixture,
        "0001_create_fixture": createFixture,
      }),
      table: "snapcall_migrations",
    });
    expect(yield* migrate).toEqual([
      [1, "create_fixture"],
      [2, "update_fixture"],
    ]);
    expect(yield* migrate).toEqual([]);
    expect(yield* sql`SELECT id, value FROM migration_fixture`).toEqual([
      { id: 1, value: "updated" },
    ]);
    expect(
      yield* sql`SELECT migration_id, name FROM snapcall_migrations ORDER BY migration_id`,
    ).toEqual([
      { migration_id: 1, name: "create_fixture" },
      { migration_id: 2, name: "update_fixture" },
    ]);
  }).pipe(Effect.provide([DatabaseLive, NodeServices.layer])),
);

it.effect("rolls back a failed migration batch and permits a corrected retry", () =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    const failed = yield* PgMigrator.run({
      loader: PgMigrator.fromRecord({
        "0001_create_fixture": createFixture,
        "0002_update_fixture": updateFixture.pipe(
          Effect.andThen(
            Effect.fail(
              new PgMigrator.MigrationError({ kind: "Failed", message: "fixture failure" }),
            ),
          ),
        ),
      }),
      table: "snapcall_migrations",
    }).pipe(Effect.exit);
    expect(Exit.isFailure(failed)).toBe(true);
    expect(
      yield* sql`SELECT tablename FROM pg_tables WHERE schemaname = current_schema() AND tablename = 'migration_fixture'`,
    ).toEqual([]);
    expect(yield* sql`SELECT migration_id, name FROM snapcall_migrations`).toEqual([]);

    expect(
      yield* PgMigrator.run({
        loader: PgMigrator.fromRecord({
          "0001_create_fixture": createFixture,
          "0002_update_fixture": updateFixture,
        }),
        table: "snapcall_migrations",
      }),
    ).toEqual([
      [1, "create_fixture"],
      [2, "update_fixture"],
    ]);
    expect(yield* sql`SELECT id, value FROM migration_fixture`).toEqual([
      { id: 1, value: "updated" },
    ]);
  }).pipe(Effect.provide([DatabaseLive, NodeServices.layer])),
);
