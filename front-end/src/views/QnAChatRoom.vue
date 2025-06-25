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
import axios from "axios";

export default {
  name: "QnAChatRoom",
  data() {
    return {
      userInput: "",
      messages: [], // Store conversation
      conversationId: null, // To manage the conversation
    };
  },
  methods: {
    // Close the chat room
    closeChatRoom() {
      this.$emit("close");
    },

    // Start the conversation
    async startConversation() {
      const response = await axios.post(
        `${process.env.VUE_APP_API_BASE}/api/ask`,
        {
          question: "start",
        }
      );
      this.conversationId = response.data.conversationId;
    },

    // Send the user's message to the bot
    async sendMessage() {
      if (!this.userInput) return;

      // Add user message to the chat
      this.messages.push({ sender: "user", text: this.userInput });

      try {
        // Send user message to the backend
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE}/api/ask`,
          {
            question: this.userInput,
          }
        );

        // Get the bot's response
        const botAnswer =
          response.data.answers?.[0]?.answer || "Sorry, I didn't get that.";

        // Add bot message to the chat
        this.messages.push({ sender: "bot", text: botAnswer });
      } catch (error) {
        console.error("Error sending message to bot", error);
        this.messages.push({
          sender: "bot",
          text: "There was an issue with the bot. Please try again.",
        });
      }

      // Clear input field
      this.userInput = "";
    },
  },
  mounted() {
    this.startConversation(); // Start conversation when the chat is opened
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
  color: white;
  font-size: 1.2rem;
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
