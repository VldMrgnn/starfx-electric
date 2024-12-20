/* 
To start this, you need to have the packages
we are playin remote, so install "remotedev": "^0.2.1
then run the "npm  run redux-devtools" command


(if we are playing local redux-devtools-extension)
npm run redux-devtools | which is  "redux-devtools --open --hostname=localhost --port=9555",

NOTE: on version 0.0.0.30 it breaks on pressure (loading DEMO0). Just fails and crashes the app.
*/
import { connectViaExtension } from "remotedev";

import type { FxStore } from "starfx";

type Options = {
  action?: any;
  enabled?: boolean;
  name?: string;
};

let devToolsInstance: any;

export function setupDevTool<T extends FxStore<any>>(store: T, options?: Options) {
  // Initialize the DevTools instance and connect to the Redux DevTools extension
  devToolsInstance = connectViaExtension({
    name: options?.name || "starfx",
    hostname: "localhost",
    port: 9555,
    realtime: true,
    enabled: true,
    autoReconnect: true,
  });

  // Initialize the DevTools instance with the initial state
  devToolsInstance.init(store.getState());

  // Return the DevTools instance for later use
  return devToolsInstance;
}

export function subscribeToActions(options?: Options) {
  if (!devToolsInstance) {
    console.error("DevTools not initialized");
    // Not initialized
    return;
  }
  const unSubscribe = () => {
    try {
      // options?.action &&
      devToolsInstance.send(options?.action, window.fx.getState());
    } catch (e) {
      console.error("Failed to send action", e);
    }
  };

  // Return the unsubscribe function for later use
  return unSubscribe();
}
