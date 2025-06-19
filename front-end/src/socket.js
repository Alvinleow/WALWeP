import { io } from "socket.io-client";

const socket = io("wss://walwep-production.up.railway.app/socket.io", {
  transports: ["websocket"],
  path: "/socket.io",
});

export default socket;
