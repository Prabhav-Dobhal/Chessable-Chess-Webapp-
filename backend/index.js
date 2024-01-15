const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(express.json());

const Rooms = new Map();
let choices = {};
let roomClocks = {};
let chance = {};

app.post("/validate", (req, res) => {
  if (req.body.room !== undefined && Rooms.has(req.body.room)) {
    console.log(req.body.room);
    res.status(200).json({ status: true });
  } else {
    res.status(200).json({ status: false });
  }
});

app.post("/create_room", (req, res) => {
  try {
    const newroom = uuidv4();
    console.log(newroom, "room created");
    choices[newroom] = { first: null, second: null };
    Rooms.set(newroom, 1);
    res.status(200).json({ room: newroom });
  } catch (e) {
    console.error(e);
  }
});

function updateClock(room, color, socket) {
  // Decrease the clock time for the given color in seconds
  roomClocks[room][color]--;

  // Emit the updated time to all users in the room
  io.to(room).emit("updateClock", {
    color: color,
    time: roomClocks[room][color],
  });
  // console.log(roomClocks[room][color]);
  // Check if the time has run out
  if (roomClocks[room][color] <= 0) {
    if (roomClocks[room].w <= 0) {
      io.to(room).emit("timeUp", { color: "w" });
    } else {
      io.to(room).emit("timeUp", { color: "b" });
    }
    clearInterval(roomClocks[room].intervalId); // Stop the interval when time is up
    socket.disconnect();
  }
}

function startClock(room, socket) {
  // Initialize the clock for both colors
  roomClocks[room] = { w: 600, b: 600 };

  // Set the initial chance to white (w)
  chance[room] = "w";

  // Start the clock interval
  roomClocks[room].intervalId = setInterval(() => {
    updateClock(room, chance[room], socket);
  }, 1000);
}

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);

  socket.on("joinRoom", ({ room, color }) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);

    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
    console.log(roomSize);

    if (roomSize === 2) {
      io.to(room).emit("startGame");
      startClock(room, socket);
    }
  });

  socket.on("move", (move, room) => {
    console.log(move);
    console.log("move made");

    // Switch the chance to the other color after each move
    chance[room] = chance[room] === "w" ? "b" : "w";
    console.log(chance[room]);
    // Emit the updated chance to all users in the room
    // io.to(room).emit("updateChance", { color: chance[room] });

    io.to(room).emit("move", move);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
