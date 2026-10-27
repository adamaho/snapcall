import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Effect, Layer, Schema } from "effect";

import * as Database from "./client.ts";
import * as Migrations from "./migrations.ts";

class MigrationCommandError extends Schema.TaggedError<
  MigrationCommandError,
  { readonly brand: unique symbol }
>()("SnapcallServer.Database.MigrationCommandError", { message: Schema.String }) {}

Migrations.run().pipe(
  Effect.tap((applied) => Effect.logInfo("Database migrations applied", { count: applied.length })),
  Effect.provide(Layer.merge(Database.layer, NodeServices.layer)),
  // The migrator reports failing migration bodies as defects. Redact both error
  // channels at the command boundary so SQL and connection details stay private.
  Effect.catchCause(() =>
    Effect.fail(
      new MigrationCommandError({
        message: "Database migration failed; verify configuration and schema",
      }),
    ),
  ),
  NodeRuntime.runMain,
);
