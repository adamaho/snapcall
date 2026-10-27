import { PgMigrator } from "@effect/sql-pg";
import { Effect } from "effect";

import rounds from "./migrations/0001-rounds.ts";

/**
 * Explicit migration registry shared by the command and integration tests.
 *
 * @category migrations
 * @since 0.1.0
 */
export const run = Effect.fn("@snapcall/Database.Migrations.run")(function* () {
  return yield* PgMigrator.run({
    loader: PgMigrator.fromRecord({ "0001_rounds": rounds }),
    table: "snapcall_migrations",
  });
});
