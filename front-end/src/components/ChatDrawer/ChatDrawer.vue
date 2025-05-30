<template>
  <div class="chat-drawer">
    <!-- Chat View -->
    <div v-if="selectedUser">
      <div class="chat-header">
        <button @click="selectedUser = null">←</button>
        <span>{{ selectedUser.username }}</span>
      </div>

      <div class="messages">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="[
            'message-bubble',
            msg.senderUid === userId ? 'sent' : 'received',
          ]"
        >
          <div class="sender-name">{{ msg.senderName }}</div>
          <div class="message-text">{{ msg.message }}</div>
        </div>
      </div>

      <div class="chat-input">
        <input
          v-model="messageText"
          @keyup.enter="sendMessage"
          placeholder="Write a message..."
        />
        <button @click="sendMessage">➤</button>
      </div>
    </div>

    <!-- User List View -->
    <div v-else>
      <!-- Close Button -->
      <div class="drawer-header">
        <button class="close-button" @click="$emit('close')">×</button>
      </div>

      <div class="header">
        <input v-model="search" placeholder="Search users..." />
      </div>

      <div class="section" v-if="starred.length">
        <h4>⭐ Starred</h4>
        <div v-for="user in starred" :key="user._id" @click="startChat(user)">
          {{ user.username }}
        </div>
      </div>

      <div class="section">
        <h4>🔒 Private</h4>
        <div
          v-for="user in filteredUsers"
          :key="user._id"
          @click="startChat(user)"
        >
          {{ user.username }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "../../socket";
import { mapState } from "vuex";

export default {
  name: "ChatDrawer",
  data() {
    return {
      search: "",
      users: [],
      starred: [],
      groups: [],
      selectedUser: null, // 👈 Add this
      messageText: "",
      messages: [],
    };
  },
  computed: {
    ...mapState({
      userId: (state) => state.user?._id,
      username: (state) => state.user?.username,
    }),
    filteredUsers() {
      return this.users.filter((user) =>
        user.username.toLowerCase().includes(this.search.toLowerCase())
      );
    },
    roomId() {
      return [this.userId, this.selectedUser?._id].sort().join("_");
    },
  },
  watch: {
    selectedUser(newUser) {
      if (newUser) {
        const room = [this.userId, newUser._id].sort().join("_");
        socket.emit("join_room", room);
      }
    },
  },
  methods: {
    async fetchUsers() {
      if (!this.userId) return;

      const response = await fetch("http://localhost:8081/api/accounts");
      const data = await response.json();
      this.users = data.filter((u) => u._id !== this.userId);
    },
    async startChat(user) {
      this.selectedUser = user;
      const room = [this.userId, user._id].sort().join("_");

      try {
        const response = await fetch(
          `http://localhost:8081/api/messages/${room}`
        );
        const data = await response.json();
        this.messages = data;
      } catch (error) {
        console.error("Failed to load messages:", error);
        this.messages = [];
      }
    },
    startGroupChat(group) {
      this.$router.push({
        name: "ChatRoom",
        params: { otherUserId: group._id },
      });
      this.$emit("close");
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
  },
  mounted() {
    this.fetchUsers();

    socket.off("receive_message");
    socket.on("receive_message", (data) => {
      const activeRoom = [this.userId, this.selectedUser?._id].sort().join("_");
      if (data.roomId === activeRoom) {
        this.messages.push(data);
      }
    });
  },
};
</script>

<style scoped>
.chat-drawer {
  position: fixed;
  top: 100px;
  right: 0;
  width: 30%;
  height: calc(100% - 100px);
  background: #000;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.3);
  padding: 15px;
  overflow-y: auto;
  z-index: 1001;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.close-button {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #fff;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: red;
}

.header input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  background: #111;
  border: 1px solid #444;
  color: #fff;
}

.section h4 {
  margin-top: 20px;
  color: #ccc;
}
.section div {
  padding: 8px;
  border-bottom: 1px solid #333;
  cursor: pointer;
}
.section div:hover {
  background: #222;
}

.chat-header {
  font-weight: bold;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-header button {
  background: transparent;
  border: none;
  color: #42b983;
  font-size: 1.5rem;
  cursor: pointer;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #444;
  padding: 10px;
  height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
  background-color: #111;
}

.message-bubble {
  max-width: 75%;
  padding: 10px 15px;
  border-radius: 15px;
  line-height: 1.4;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  word-wrap: break-word;
  display: flex;
  flex-direction: column;
}

.sent {
  background: linear-gradient(135deg, #42b983, #36a273);
  color: white;
  align-self: flex-end;
  border-bottom-right-radius: 0;
}

.received {
  background: #2a2a2a;
  color: white;
  align-self: flex-start;
  border-bottom-left-radius: 0;
}

.sender-name {
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 4px;
  opacity: 0.9;
}

.message-text {
  font-size: 1rem;
}

.chat-input {
  display: flex;
  gap: 5px;
  align-items: center;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  background: #222;
  color: #fff;
  border: 1px solid #444;
  border-radius: 4px;
}

.chat-input button {
  padding: 10px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-input button:hover {
  background: #369c6d;
}
</style>
