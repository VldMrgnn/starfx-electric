import type { ActionWithPayload, LoaderCtx, ThunkCtx as OriginalThunkCtx, Result } from "starfx";

export type { ApiCtx, Next, Result } from "starfx";

export interface ThunkCtx<P = any, D = any> extends OriginalThunkCtx<P>, LoaderCtx<P> {
  actions: ActionWithPayload<P>[];
  json: D | null;
  result: Result<any>;
}

export interface EleCtx extends ThunkCtx {
  table: string;
  where?: string;
  replica?: `full` | `default`;
  columns?: string[];
}
