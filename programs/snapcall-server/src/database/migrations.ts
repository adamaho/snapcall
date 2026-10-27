import { PgMigrator } from "@effect/sql-pg";
import { Effect } from "effect";

/**
 * Initializes the migration ledger; domain migrations join this explicit registry.
 *
 * @category migrations
 * @since 0.1.0
 */
export const run = Effect.fn("@snapcall/Database.Migrations.run")(function* () {
  return yield* PgMigrator.run({
    loader: PgMigrator.fromRecord({}),
    table: "snapcall_migrations",
  });
});
