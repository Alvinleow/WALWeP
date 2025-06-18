import { createApp } from "vue";
import App from "../front-end/src/App.vue";
import router from "../front-end/src/router";
import store from "../back-end/store";
import "../front-end/src/assets/global.css";

import LoadingModal from "../front-end/src/components/LoadingModal/LoadingModal.vue";

const app = createApp(App);

app.component("LoadingModal", LoadingModal);

app.use(router).use(store).mount("#app");
