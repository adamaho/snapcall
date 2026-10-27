import { NodeServices } from "@effect/platform-node";
import { PgMigrator } from "@effect/sql-pg";
import { expect, it } from "@effect/vitest";
import { Config, ConfigProvider, Context, Crypto, Effect, Exit, Layer, Redacted } from "effect";
import { SqlClient } from "effect/sql";

import * as Database from "#src/database/client.ts";
import * as Migrations from "#src/database/migrations.ts";

const databaseAt = (url: string) =>
  Database.layer.pipe(
    Layer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({ DATABASE_URL: url }))),
  );

// Each test owns a schema and pool; closing the pool precedes dropping its schema.
const TestDatabase = Layer.effectContext(
  Effect.gen(function* () {
    const url = yield* Config.Redacted("TEST_DATABASE_URL");
    const adminContext = yield* Layer.build(databaseAt(Redacted.value(url)));
    const admin = Context.get(adminContext, SqlClient.SqlClient);
    const crypto = yield* Crypto.Crypto;
    const schema = `test_${(yield* crypto.randomUUIDv4()).replaceAll("-", "")}`;
    yield* Effect.acquireRelease(admin`CREATE SCHEMA ${admin(schema)}`, () =>
      admin`DROP SCHEMA ${admin(schema)} CASCADE`.pipe(Effect.orDie),
    );
    const testUrl = new URL(Redacted.value(url));
    const options = testUrl.searchParams.get("options") ?? "";
    testUrl.searchParams.set("options", `${options} -c search_path=${schema}`.trim());
    return yield* Layer.build(databaseAt(testUrl.toString()));
  }),
).pipe(Layer.provideMerge(NodeServices.layer));

const createFixture = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`CREATE TABLE migration_fixture (id integer PRIMARY KEY, value text NOT NULL)`;
  yield* sql`INSERT INTO migration_fixture (id, value) VALUES (1, 'created')`;
});

const updateFixture = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql`UPDATE migration_fixture SET value = 'updated' WHERE id = 1`;
});

it.effect("initializes only the migration ledger and can run again", () =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    expect(yield* Migrations.run()).toEqual([]);
    expect(yield* Migrations.run()).toEqual([]);
    expect(
      yield* sql`SELECT tablename FROM pg_tables WHERE schemaname = current_schema() ORDER BY tablename`,
    ).toEqual([{ tablename: "snapcall_migrations" }]);
    expect(yield* sql`SELECT migration_id, name FROM snapcall_migrations`).toEqual([]);
  }).pipe(Effect.provide(TestDatabase)),
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
  }).pipe(Effect.provide(TestDatabase)),
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
  }).pipe(Effect.provide(TestDatabase)),
);
