import { createServer } from "node:http";

import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Config, Layer, Schema } from "effect";
import { HttpRouter } from "effect/http";

import * as Http from "./http.ts";

const ServerLive = HttpRouter.serve(Http.layer).pipe(
  Layer.provide(
    NodeHttpServer.layerConfig(createServer, {
      host: Config.String("SNAPCALL_SERVER_HOST").pipe(Config.withDefault("127.0.0.1")),
      port: Config.schema(
        Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 65535 })),
        "SNAPCALL_SERVER_PORT",
      ).pipe(Config.withDefault(3001)),
    }),
  ),
);

Layer.launch(ServerLive).pipe(NodeRuntime.runMain);
