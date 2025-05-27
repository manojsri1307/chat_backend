const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for dev
    methods: ["GET", "POST"],
  },
});
// Map to store userID: socketID
const users = new Map();

io.on("connection", (socket) => {
  console.log(":link: User connected:", socket.id);
  // Step 1: Store userId with socketId when they join
  socket.on("register", (userId) => {
    users.set(userId, socket.id);
    console.log(`:white_check_mark: Registered user: ${userId} -> ${socket.id}`);
  });
  // Step 2: Handle private message
  socket.on("send_private_message", ({ senderId, receiverId, message }) => {
    const receiverSocketId = users.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_private_message", {
        senderId,
        message,
      });
      console.log(`:envelope_with_arrow: Private message from ${message} to ${message}}`);
    } else {
      console.log(`:warning: Receiver ${receiverId} not found`);
    }
  });
  // Step 3: Handle disconnect
  socket.on("disconnect", () => {
    console.log(":x: User disconnected:", socket.id);
    for (const [userId, sockId] of users.entries()) {
      if (sockId === socket.id) {
        users.delete(userId);
        break;
      }
    }
  });
});
server.listen(5000, () => {
  console.log(":rocket: Server is running on http://localhost:5000");
});