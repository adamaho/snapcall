import { createServer } from "node:http";

import { NodeCrypto, NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Config, Layer, Schema } from "effect";
import { HttpRouter } from "effect/http";

import * as Database from "#src/database/client.ts";
import * as PlayerRepository from "#src/players/repository.ts";
import * as Players from "#src/players/service.ts";
import * as RoundRepository from "#src/rounds/repository.ts";
import * as Rounds from "#src/rounds/service.ts";

import * as Http from "./http.ts";

const PlayersLive = Players.layer.pipe(Layer.provide(PlayerRepository.layer));

const RoundsLive = Rounds.layer.pipe(Layer.provide(RoundRepository.layer));

const HttpLive = Http.layer.pipe(
  Layer.provide([PlayersLive, RoundsLive]),
  Layer.provide(Database.layer),
  Layer.provide(NodeCrypto.layer),
);

const ServerLive = HttpRouter.serve(HttpLive).pipe(
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
