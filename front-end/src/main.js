import { createApp } from "vue";
import App from "./App.vue";
import router from "../src/router";
import store from "../../back-end/store";
import "../src/assets/global.css";

import LoadingModal from "../src/components/LoadingModal/LoadingModal.vue";

const app = createApp(App);

app.component("LoadingModal", LoadingModal);

app.use(router).use(store).mount("#app");
