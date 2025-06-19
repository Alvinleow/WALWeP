<template>
  <div class="chat-room">
    <h2>Chat Room: {{ roomId }}</h2>
    <div class="messages">
      <div v-for="(msg, index) in messages" :key="index">
        <strong>{{ msg.senderName }}:</strong> {{ msg.message }}
      </div>
    </div>
    <input
      v-model="messageText"
      @keyup.enter="sendMessage"
      placeholder="Taip mesej anda..."
    />
    <button @click="sendMessage">Hantar</button>
  </div>
</template>

<script>
import socket from "../socket";
import { mapState } from "vuex";

export default {
  name: "ChatRoom",
  props: ["otherUserId"],
  data() {
    return {
      messages: [],
      messageText: "",
    };
  },
  computed: {
    ...mapState({
      userId: (state) => state.user?._id,
      username: (state) => state.user?.username,
    }),
    roomId() {
      // Generate room ID using both user IDs (sorted for consistency)
      return [this.userId, this.otherUserId].sort().join("_");
    },
  },
  mounted() {
    if (!this.userId || !this.otherUserId) {
      console.warn("Missing user IDs for chat.");
      return;
    }

    socket.emit("join_room", this.roomId);

    socket.on("receive_message", (data) => {
      this.messages.push(data);
    });
  },
  methods: {
    sendMessage() {
      if (!this.messageText.trim()) return;

      const msgData = {
        roomId: this.roomId,
        senderUid: this.userId,
        senderName: this.username,
        message: this.messageText,
        timestamp: Date.now(),
      };

      socket.emit("send_message", msgData);
      this.messageText = "";
    },
  },
};
</script>

<style scoped>
.chat-room {
  max-width: 600px;
  margin: 20px auto;
  background: #000;
  color: #fff;
  padding: 20px;
  border-radius: 10px;
}
.messages {
  border: 1px solid #444;
  padding: 10px;
  height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
  background-color: #111;
}
input {
  width: 80%;
  padding: 10px;
}
button {
  padding: 10px;
  margin-left: 5px;
  background: #42b983;
  border: none;
  color: white;
  cursor: pointer;
}
</style>
