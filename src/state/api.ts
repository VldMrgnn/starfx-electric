
import { createApi, createThunks, mdw } from 'starfx';

import { createLog } from './helpers';
import { electricMdw } from './mdw-electric';
import { schema } from './schema';

import type { ApiCtx, Next } from "starfx";
import type { EleCtx, ThunkCtx } from "../types";

const log = createLog("fx");
function* debugMdw(ctx: ThunkCtx | ApiCtx, next: Next) {
  log(`${ctx.name}`, ctx);
  yield* next();
}

const electricService = `${import.meta.env.VITE_ELECTRIC_SERVICE}/v1/shape`;
const electricBackend = `${import.meta.env.VITE_PROXY_URL}/rest/api/elsfx`;

export const electricThunks = createThunks<EleCtx>();
electricThunks.use(debugMdw);
electricThunks.use(mdw.err);
electricThunks.use(electricThunks.routes());
electricThunks.use(electricMdw(electricService));

export const electricApi = createApi<ApiCtx>();
electricApi.use(debugMdw);
electricApi.use(mdw.err);
electricApi.use(mdw.api({ schema }));
electricApi.use(electricApi.routes());
electricApi.use(mdw.fetch({ baseUrl: electricBackend }));
