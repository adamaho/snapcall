import { NodeCrypto } from "@effect/platform-node";
import { Postgres } from "@snapcall/core";
import { Config, Context, Crypto, Effect, Layer, Redacted } from "effect";
import { SqlClient } from "effect/sql";

/**
 * Gives each test its own schema and pool; closes the pool before dropping the schema.
 *
 * @category layers
 * @since 0.1.0
 */
export const layer = Layer.effectContext(
  Effect.gen(function* () {
    const url = yield* Config.Redacted("TEST_DATABASE_URL");
    const adminContext = yield* Layer.build(Postgres.layer({ url }));
    const admin = Context.get(adminContext, SqlClient.SqlClient);
    const crypto = yield* Crypto.Crypto;
    const schema = `test_${(yield* crypto.randomUUIDv4()).replaceAll("-", "")}`;
    yield* Effect.acquireRelease(admin`CREATE SCHEMA ${admin(schema)}`, () =>
      admin`DROP SCHEMA ${admin(schema)} CASCADE`.pipe(Effect.orDie),
    );
    const testUrl = new URL(Redacted.value(url));
    const options = testUrl.searchParams.get("options") ?? "";
    testUrl.searchParams.set("options", `${options} -c search_path=${schema}`.trim());
    return yield* Layer.build(Postgres.layer({ url: Redacted.make(testUrl.toString()) }));
  }),
).pipe(Layer.provide(NodeCrypto.layer));
