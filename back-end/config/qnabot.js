const fetch = require("node-fetch");
require("dotenv").config();

// Direct Line API details
const directLineSecret = process.env.DIRECT_LINE_SECRET;
const botEndpoint = process.env.BOT_ENDPOINT;

// Start a conversation with the bot
async function startConversation() {
  try {
    const response = await fetch(botEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${directLineSecret}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!data.conversationId) {
      throw new Error(
        "Failed to start conversation, no conversationId returned"
      );
    }

    return data.conversationId;
  } catch (error) {
    console.error("Error starting conversation:", error);
    throw new Error("Failed to start conversation");
  }
}

// Send a message to the bot
async function sendMessage(conversationId, message) {
  if (!conversationId) {
    throw new Error("conversationId is missing");
  }

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
  if (!data) {
    throw new Error("No response from bot API");
  }

  return data; // Return the response data from the bot
}

// Public API to interact with the bot
async function askQuestion(question) {
  try {
    const conversationId = await startConversation(); // Get conversationId
    const answer = await sendMessage(conversationId, question); // Send question to bot
    return answer; // Return bot's response
  } catch (error) {
    console.error("Error communicating with the bot:", error);
    throw new Error("Error communicating with the bot");
  }
}

module.exports = { askQuestion };
