<template>
  <div class="chat-drawer">
    <!-- Chat View -->
    <div v-if="selectedUser">
      <div class="chat-header">
        <button class="back-buttton" @click="selectedUser = null">←</button>
        <span>{{ selectedUser.username }}</span>
        <button
          @click="toggleDeleteMode"
          :class="['toggle-delete-btn', deleteMode ? 'active' : '']"
        >
          <i class="fas fa-trash-alt"></i> Delete Message
        </button>
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
          <div class="message-text-container">
            <div class="message-text">{{ msg.message }}</div>

            <div
              v-if="deleteMode && msg.senderUid === userId"
              class="message-menu"
            >
              <button @click="deleteMessage(index, msg)" class="delete-btn">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <input
          v-model="messageText"
          @keyup.enter="sendMessage"
          placeholder="Tulis mesej..."
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
        <input v-model="search" placeholder="Cari pengguna..." />
      </div>

      <div v-if="search && filteredUsers.length" class="section">
        <h4><i class="fas fa-search"></i> Hasil Carian</h4>
        <div v-for="user in filteredUsers" :key="user._id" class="user-item">
          <span class="username">{{ user.username }}</span>

          <div v-if="isInContacts(user)" class="action-icons">
            <button
              class="message-icon btn"
              @click.stop="startChat(user)"
              title="Mulakan Chat"
            >
              <i class="fas fa-comment"></i> Chat
            </button>

            <button
              class="menu-icon btn"
              @click.stop="toggleContactMenu(user._id)"
            >
              <i class="fas fa-ellipsis-v"></i>
            </button>

            <div v-if="contactMenuOpenId === user._id" class="contact-menu">
              <button
                @click="removeFromContacts(user)"
                style="color: red; font-weight: bold"
              >
                🗑️ Buang dari Contact
              </button>
            </div>
          </div>
          <div v-else class="action-icons">
            <button
              class="add-icon btn"
              @click.stop="addToContacts(user)"
              title="Tambah ke Contacts"
            >
              <i class="fas fa-user-plus"></i> Add
            </button>
          </div>
        </div>
      </div>

      <!-- Empty Section for Contacts List -->
      <div v-if="!search && contacts.length" class="section">
        <h4><i class="fas fa-users"></i> Contacts</h4>
        <div v-for="user in contacts" :key="user._id" class="user-item">
          <span class="username">{{ user.username }}</span>

          <div class="action-icons">
            <button
              class="message-icon btn"
              @click.stop="startChat(user)"
              title="Mulakan Chat"
            >
              <i class="fas fa-comment"></i> Chat
            </button>

            <button
              class="menu-icon btn"
              @click.stop="toggleContactMenu(user._id)"
            >
              <i class="fas fa-ellipsis-v"></i>
            </button>

            <div v-if="contactMenuOpenId === user._id" class="contact-menu">
              <button
                @click="removeFromContacts(user)"
                style="color: red; font-weight: bold"
              >
                🗑️ Buang dari Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="modalVisible" class="modal-overlay">
    <div class="modal-content">
      <span class="close-btn" @click="modalVisible = false">×</span>
      <div class="modal-message">
        <p>{{ modalMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import socket from "../../socket";
import { mapState } from "vuex";

export default {
  name: "ChatDrawer",
  emits: ["close"],
  data() {
    return {
      search: "",
      users: [],
      starred: [],
      groups: [],
      selectedUser: null,
      messageText: "",
      messages: [],
      contacts: [],
      modalVisible: false,
      modalMessage: "",
      contactMenuOpenId: null,
      deleteMode: false,
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

      const response = await fetch(
        `${process.env.VUE_APP_API_BASE}/api/accounts`
      );
      const data = await response.json();
      this.users = data.filter((u) => u._id !== this.userId);
    },
    async fetchContacts() {
      try {
        const response = await fetch(
          `${process.env.VUE_APP_API_BASE}/api/accounts/${this.userId}/contacts`
        );
        const data = await response.json();
        this.contacts = data.contacts;
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      }
    },
    toggleDeleteMode() {
      this.deleteMode = !this.deleteMode;
    },
    async startChat(user) {
      this.selectedUser = user;
      const room = [this.userId, user._id].sort().join("_");

      try {
        const response = await fetch(
          `${process.env.VUE_APP_API_BASE}/api/messages/${room}`
        );
        const data = await response.json();
        this.messages = data;
      } catch (error) {
        console.error("Failed to load messages:", error);
        this.messages = [];
      }
    },
    async addToContacts(user) {
      try {
        const response = await fetch(
          `${process.env.VUE_APP_API_BASE}/api/accounts/${this.userId}/add-contact`,
          {
            method: "POST",
            body: JSON.stringify({ contactId: user._id }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        console.log("Added to contacts:", data);
        this.modalMessage = "Pengguna telah ditambah ke contacts!";
        this.modalVisible = true;

        await this.fetchContacts(); // Refresh contacts after adding
      } catch (error) {
        console.error("Failed to add user to contacts:", error);
        this.modalMessage = "Gagal menambah pengguna ke contacts.";
        this.modalVisible = true;
      }
    },
    isInContacts(user) {
      console.log("Checking if user is in contacts:", this.contacts);
      return this.contacts.some((contact) => contact._id === user._id);
    },
    toggleContactMenu(userId) {
      this.contactMenuOpenId =
        this.contactMenuOpenId === userId ? null : userId;
    },
    async removeFromContacts(user) {
      try {
        await fetch(
          `${process.env.VUE_APP_API_BASE}/api/accounts/${this.userId}/remove-contact`,
          {
            method: "POST",
            body: JSON.stringify({ contactId: user._id }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        this.contactMenuOpenId = null;
        this.modalMessage = "Pengguna telah dibuang dari contact anda.";
        this.modalVisible = true;
        await this.fetchContacts(); // Refresh
      } catch (error) {
        console.error("Gagal membuang dari contact:", error);
        this.modalMessage = "Gagal membuang pengguna dari contact anda.";
        this.modalVisible = true;
      }
    },
    /*startGroupChat(group) {
      this.$router.push({
        name: "ChatRoom",
        params: { otherUserId: group._id },
      });
      this.$emit("close");
    },*/
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
    },
  },
  mounted() {
    this.fetchUsers();
    this.fetchContacts();

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

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #333;
  cursor: pointer;
  position: relative;
}

.user-item:hover {
  background: #222;
}

.username {
  color: #fff;
  font-size: 1rem;
}

.action-icons {
  display: flex;
  gap: 10px;
}

.btn {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  background-color: #42b983;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #369c6d;
}

.message-icon,
.add-icon {
  display: flex;
  align-items: center;
  gap: 5px;
}

.message-icon i,
.add-icon i {
  font-size: 1.2rem;
}

.message-icon:hover i,
.add-icon:hover i {
  color: #fff;
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
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.back-buttton {
  background: transparent;
  border: none;
  color: #42b983;
  cursor: pointer;
  font-size: 1.5rem;
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
  justify-content: space-between;
}

.message-text-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.message-text {
  font-size: 1rem;
  flex: 1;
}

.message-menu {
  display: flex;
  align-items: center;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1002;
}

.modal-content {
  background-color: #222;
  color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-message {
  font-size: 1.2rem;
  margin-top: 10px;
}

.menu-icon {
  background-color: #555;
}

.contact-menu {
  position: absolute;
  top: 40px;
  right: 10px;
  background-color: #111;
  border: 1px solid #333;
  border-radius: 5px;
  padding: 5px;
  z-index: 10;
}

.contact-menu button {
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: #fff;
  padding: 8px;
  text-align: left;
  cursor: pointer;
}

.contact-menu button:hover {
  background-color: #222;
}

/* Toggle Delete Button Styling */
.toggle-delete-btn {
  background-color: #e74c3c; /* Prominent red background */
  border: none;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-left: auto;
}

.toggle-delete-btn:hover {
  background-color: #c0392b;
  transform: scale(1.05);
}

.toggle-delete-btn.active {
  background-color: #42b983;
}

.toggle-delete-btn.active:hover {
  background-color: #36a273;
}

.delete-btn {
  margin-left: 20px;
  background: none;
  border: none;
  color: red;
  cursor: pointer;
  transition: color 0.3s ease, transform 0.2s ease;
}

.delete-btn:hover {
  color: #e74c3c;
  transform: scale(1.1);
}
</style>
