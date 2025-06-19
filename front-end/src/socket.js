import { io } from "socket.io-client";

const socket = io(process.env.VUE_APP_API_BASE || "http://localhost:8081", {
  path: "/socket.io",
});

export default socket;
