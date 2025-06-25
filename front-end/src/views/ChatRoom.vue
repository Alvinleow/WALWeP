<template>
  <div class="chat-room">
    <h2>Chat Room: {{ roomId }}</h2>
    <div class="messages">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="[
          'message-bubble',
          msg.senderUid === userId ? 'sent' : 'received',
        ]"
        @click="onLeftClick(index, msg)"
      >
        <div class="sender-name">{{ msg.senderName }}</div>
        <div class="message-text">{{ msg.message }}</div>

        <div
          v-if="showMenuIndex === index && msg.senderUid === userId"
          class="message-menu"
        >
          <button @click="deleteMessage(index, msg)">🗑 Delete</button>
        </div>
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
      showMenuIndex: null,
    };
  },
  computed: {
    ...mapState({
      userId: (state) => state.user?._id,
      username: (state) => state.user?.username,
    }),
    roomId() {
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

    socket.on("message_deleted", (messageId) => {
      this.messages = this.messages.filter(
        (msg) => msg._id !== messageId && msg.timestamp !== messageId
      );
    });
  },
  methods: {
    onLeftClick(index, msg) {
      if (msg.senderUid === this.userId) {
        this.showMenuIndex = index;
        console.log("Left-clicked on message:", msg);
      }
    },
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
    deleteMessage(index, msg) {
      socket.emit("delete_message", {
        roomId: this.roomId,
        messageId: msg._id || msg.timestamp,
      });
      this.messages.splice(index, 1);
      this.showMenuIndex = null;
    },
  },
  beforeDestroy() {
    this.$nextTick(() => {
      this.$refs.messageBubble.forEach((bubble) => {
        bubble.removeEventListener("contextmenu");
      });
    });
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
  overflow-x: visible;
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

.message-bubble {
  position: relative !important;
  overflow: visible;
  max-width: 75%;
  padding: 10px 15px;
  border-radius: 15px;
  line-height: 1.4;
  word-wrap: break-word;
  display: flex;
  flex-direction: column;
}

.message-menu {
  background: red !important;
  position: absolute;
  background: #222;
  border: 1px solid #555;
  padding: 5px 10px;
  border-radius: 4px;
  right: 10px;
  top: 5px;
  z-index: 100;
}

.message-menu button {
  background: none;
  border: none;
  color: red;
  cursor: pointer;
}
</style>
