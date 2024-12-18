import { createSchema, slice } from "starfx";

import { IUser } from "../types";

export const [schema, initialState] = createSchema({
  cache: slice.table({ empty: {} }),
  loaders: slice.loaders<any>(),
  foo: slice.table({
    empty: {},
    initialState: {},
  }),
  test: slice.obj({
    keyA: "A",
    key1: "",
    key2: "",
  }),
  tableA: slice.table({
    empty: {},
    initialState: {},
  }),
  tableB: slice.table({
    empty: {},
    initialState: {},
  }),
  users: slice.table<IUser>({
    empty: {} as IUser,
    initialState: {},
  }),

  electric_karma_mywork_home: slice.table({
    empty: {},
    initialState: {},
  }),
});
