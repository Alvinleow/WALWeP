import { io } from "socket.io-client";

// const socket = io(process.env.VUE_APP_API_BASE || "http://localhost:8081", {
//   transports: ["websocket"],
//   path: "/socket.io",
// });

const socket = io("https://walwep-production.up.railway.app", {
  transports: ["websocket"],
  path: "/socket.io",
});

export default socket;
