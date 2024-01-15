// Socket.js

import socketIo from "socket.io-client";

const socket = socketIo("https://chessable-backend-u08b.onrender.com", {
  transports: ["websocket"],
});

export default socket;
