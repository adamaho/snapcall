import { PgClient } from "@effect/sql-pg";
import { Config } from "effect";

/**
 * Server-owned connection settings shared by the runtime and migration command.
 *
 * @category layers
 * @since 0.1.0
 */
export const layer = PgClient.layerConfig({
  url: Config.Redacted("DATABASE_URL"),
  applicationName: Config.succeed("snapcall-server"),
  maxConnections: Config.succeed(5),
  connectTimeout: Config.succeed("5 seconds"),
  idleTimeout: Config.succeed("30 seconds"),
});
