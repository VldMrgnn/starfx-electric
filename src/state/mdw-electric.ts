import { IdProp, Next, TableOutput } from "starfx";

import { Message, ShapeStream, isChangeMessage } from "@electric-sql/client";

import { schema } from "../state/schema";
import { AppState, EleCtx } from "../types";

export function electricMdw(baseUrl = "") {
  return function* (ctx: EleCtx, next: Next) {
    const shape = new ShapeStream({
      url: baseUrl,
      params: {
        table: ctx.table,
        replica: ctx.replica || `default`,
      },
    });

    console.log("shape", shape);
    shape.subscribe(async (messages: Message[]) => {
      const acts = messages.filter(isChangeMessage).map((message) => {
        const tableActions = schema[ctx.table as keyof AppState] as TableOutput<
          Partial<AppState>,
          AppState,
          any
        >;
        if (!tableActions) throw new Error(`Invalid table: ${ctx.table}`);

        switch (message.headers.operation) {
          case `delete`:
            return tableActions.remove([message.value.id as IdProp]);
          case `insert`:
            return tableActions.add({ [message.value.id as IdProp]: message.value });
          case `update`:
            return ctx.replica === `full`
              ? tableActions.patch({ [message.value.id as IdProp]: message.value })
              : tableActions.merge({ [message.value.id as IdProp]: message.value });
          default:
            throw new Error(`Unknown operation: ${message.headers.operation}`);
        }
      });

      try {
        await window.fx.run(function* () {
          yield* schema.update(acts);
        });
      } catch (error) {
        console.error("Failed to update schema:", error);
      }
    });

    yield* next();
  };
}
