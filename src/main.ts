import "./style.css";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// Ask the browser to treat our stored data (Cache, IndexedDB, localStorage) as
// durable so iOS doesn't evict it after a period of disuse. No-op where the API
// is unsupported; installed PWAs are often granted this automatically.
if (navigator.storage?.persist) {
  navigator.storage
    .persisted()
    .then((isPersisted) => {
      if (!isPersisted) return navigator.storage.persist();
    })
    .catch(() => {
      /* storage manager unavailable — ignore */
    });
}

createApp(App).use(router).mount("#app");
