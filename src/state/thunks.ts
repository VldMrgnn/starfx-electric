import { takeEvery } from "starfx";

import { electricApi, electricThunks } from "./api";
import { OPTI_ADDING, OPTI_REMOVING, OPTI_UPDATING } from "./constants";
import { schema } from "./schema";

import type { Result } from "starfx";
import type { ApiCtx, IUser, Next } from "../types";

function isOk<T>(result: Result<T>): result is { readonly ok: true; value: T } {
  return result.ok === true;
}

export const initializeFoo = electricThunks.create(
  "/foo",
  { supervisor: takeEvery },
  function* (ctx, next) {
    ctx.table = "foo";
    yield* next();
  },
);

export const initializeUsers = electricThunks.create(
  "/users",
  { supervisor: takeEvery },
  function* (ctx, next) {
    ctx.table = "users";
    yield* next();
  },
);

export const updateUser = electricApi.post<IUser>(
  "/updateEmail",
  { supervisor: takeEvery },
  function* (ctx: ApiCtx, next: Next) {
    // just ensure a unique key for the table's optimistic update
    const tableKey = `users-${OPTI_UPDATING}`;
    //allow a meta object to be able to hold multiple rows if needed
    yield* schema.update(
      schema.loaders.start({ id: tableKey, meta: { [ctx.payload.id]: ctx.payload } }),
    );
    ctx.request = {
      url: "/users",
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ctx.payload),
    };
    yield* next();
    const response = ctx.json;
    if (!isOk(response)) {
      yield* schema.update(schema.loaders.error({ id: tableKey, meta: ctx.payload }));
      return;
    }
    //it donsn't need to update the schema as it will be updated by the electric middleware
    yield* schema.update(schema.loaders.success({ id: tableKey, meta: ctx.payload }));
  },
);

export const removeUser = electricApi.delete<number[]>(
  "/removeUser",
  { supervisor: takeEvery },
  function* (ctx: ApiCtx, next: Next) {
    const tableKey = `users-${OPTI_REMOVING}`;
    yield* schema.update(schema.loaders.start({ id: tableKey, meta: ctx.payload }));
    ctx.request = {
      url: "/users",
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ctx.payload),
    };
    yield* next();
    const response = ctx.json;
    if (!isOk(response)) {
      yield* schema.update(schema.loaders.error({ id: tableKey, meta: ctx.payload }));
      return;
    }
    //it donsn't need to update the schema as it will be updated by the electric middleware
    yield* schema.update(schema.loaders.success({ id: tableKey, meta: ctx.payload }));
  },
);

export const addUser = electricApi.post<Partial<IUser>>(
  "/addUser",
  { supervisor: takeEvery },
  function* (ctx: ApiCtx, next: Next) {
    const tableKey = `users-${OPTI_ADDING}`;
    const newOptimisticId = -1; //
    const newOptimisticUser = { id: newOptimisticId, ...ctx.payload };

    yield* schema.update(
      schema.loaders.start({ id: tableKey, meta: { [newOptimisticUser.id]: newOptimisticUser } }),
    );
    ctx.request = {
      url: "/users",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ctx.payload),
    };
    yield* next();
    const response = ctx.json;
    if (!isOk(response)) {
      yield* schema.update(schema.loaders.error({ id: tableKey, meta: ctx.payload }));
      return;
    }
    //it donsn't need to update the schema as it will be updated by the electric middleware
    yield* schema.update(schema.loaders.success({ id: tableKey, meta: ctx.json }));
  },
);
