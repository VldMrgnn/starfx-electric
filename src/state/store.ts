import {
    createLocalStorageAdapter, createPersistor, createStore, parallel, persistStoreMdw, spawn, take
} from 'starfx';

import { electricApi, electricThunks } from './api';
import { setupDevTool, subscribeToActions } from './devtools';
import { initialState } from './schema';
import { initializeFoo, initializeUsers } from './thunks';

const devtoolsEnabled = process.env.NODE_ENV === "development";

export type AppState = typeof initialState;

const persistor = createPersistor<AppState>({
  adapter: createLocalStorageAdapter<AppState>(),
  allowlist: ["test", "tableA", "users"],
});

const store = createStore({
  initialState: initialState,
  middleware: [persistStoreMdw(persistor)],
});

const tasks = [
  function* devtools() {
    if (!devtoolsEnabled) return;
    while (true) {
      const action = yield* take("*");
      subscribeToActions({ action });
    }
  },
];

export const setupState = (pName = "store") => {
  devtoolsEnabled && setupDevTool(store, { name: pName, enabled: true });
  store.run(function* () {
    yield* persistor.rehydrate();
    const group = yield* parallel([
      electricThunks.bootup,
      electricApi.bootup,
      ...tasks,
      function* () {
        yield* spawn(() => initializeFoo.run());
      },
      function* () {
        yield* spawn(() => initializeUsers.run());
      },
    ]);
    yield* group;
  });
  window.fx = store;
  return {
    store,
  };
};

export const fxDispatch = store.dispatch;
