const Message = require("../models/message");

function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("send_message", async (data) => {
      // Save message to DB
      const newMessage = new Message({
        roomId: data.roomId,
        senderUid: data.senderUid,
        senderName: data.senderName,
        message: data.message,
        timestamp: data.timestamp,
      });

      try {
        await newMessage.save();
      } catch (err) {
        console.error("Error saving message:", err);
      }

      // Broadcast to the room
      io.to(data.roomId).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}

module.exports = socketHandler;
