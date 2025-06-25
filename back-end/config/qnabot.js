const fetch = require("node-fetch");
require("dotenv").config();

// Direct Line API details
const directLineSecret = process.env.DIRECT_LINE_SECRET;
const botEndpoint = process.env.BOT_ENDPOINT;

// Start a conversation with the bot
async function startConversation() {
  const response = await fetch(botEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${directLineSecret}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return data.conversationId; // Save the conversationId for further communication
}

// Send a message to the bot
async function sendMessage(conversationId, message) {
  const response = await fetch(`${botEndpoint}/${conversationId}/activities`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${directLineSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "message",
      from: { id: "user" },
      text: message,
    }),
  });

  const data = await response.json();
  return data;
}

// Public API to interact with the bot
async function askQuestion(question) {
  try {
    const conversationId = await startConversation();
    const answer = await sendMessage(conversationId, question);
    return answer;
  } catch (error) {
    throw new Error("Error communicating with the bot");
  }
}

module.exports = { askQuestion };
