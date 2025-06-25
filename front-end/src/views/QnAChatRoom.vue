<template>
  <div class="qna-chat-room">
    <div class="chat-header">
      <h3>QnA Chat Room</h3>
      <button @click="closeChatRoom" class="close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="chat-box">
      <div v-for="(message, index) in messages" :key="index" class="message">
        <div v-if="message.sender === 'bot'" class="bot-message">
          <strong>Bot:</strong> {{ message.text }}
        </div>
        <div v-else class="user-message">
          <strong>You:</strong> {{ message.text }}
        </div>
      </div>
    </div>
    <div class="chat-input">
      <input
        v-model="userInput"
        placeholder="Ask me anything..."
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script>
import { DirectLine } from "botframework-directlinejs"; // Import DirectLine JS SDK

export default {
  data() {
    return {
      messages: [], // Store messages in the chat
      userInput: "", // User input for sending messages
      directLine: null, // DirectLine connection
    };
  },
  mounted() {
    this.initializeBotConnection();
  },
  methods: {
    // Fetch the DirectLine token from the backend
    async getDirectLineToken() {
      try {
        const response = await fetch("/api/directline/token"); // Call the backend for the token
        const data = await response.json();
        return data.token;
      } catch (error) {
        console.error("Error fetching DirectLine token:", error);
      }
    },

    // Initialize Direct Line connection with token
    async initializeBotConnection() {
      const token = await this.getDirectLineToken();
      this.directLine = new DirectLine({ token }); // Create a DirectLine connection

      // Subscribe to incoming messages
      this.directLine.activity$
        .filter((activity) => activity.type === "message")
        .subscribe((activity) => {
          this.messages.push({ sender: "bot", text: activity.text });
        });
    },

    // Send a message to the bot
    sendMessage() {
      if (!this.userInput.trim()) return;

      // Create the activity (message) from the user
      const activity = {
        type: "message",
        from: { id: "user123", name: "John Doe" },
        text: this.userInput,
      };

      // Send the message to the bot
      this.directLine.postActivity(activity).subscribe(
        (id) => {
          // Add the user message to the chat only after sending to bot
          this.messages.push({ sender: "user", text: this.userInput });
          this.userInput = ""; // Clear the input field
          console.log("Message sent with ID:", id);
        },
        (error) => console.error("Error sending message:", error)
      );
    },

    // Close the chat room
    closeChatRoom() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.qna-chat-room {
  position: fixed;
  bottom: 50px;
  right: 20px;
  width: 350px;
  height: 500px;
  background-color: #fff;
  border: 2px solid #42b983;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.chat-header {
  background-color: #42b983;
  padding: 10px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: white;
  cursor: pointer;
}

.chat-box {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  font-size: 1rem;
  background-color: #f9f9f9;
}

.message {
  margin-bottom: 10px;
}

.bot-message {
  background-color: #e0f7fa;
  padding: 8px;
  border-radius: 5px;
}

.user-message {
  background-color: #f1f8e9;
  padding: 8px;
  border-radius: 5px;
}

.chat-input {
  display: flex;
  padding: 10px;
  background-color: #fff;
  border-top: 1px solid #ccc;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.chat-input button {
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
}

.chat-input button:hover {
  background-color: #36a273;
}
</style>
