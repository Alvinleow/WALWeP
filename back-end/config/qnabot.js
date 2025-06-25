const fetch = require("node-fetch");
require("dotenv").config();

// Direct Line API details
const directLineSecret =
  "AHIAtTyKIYh7pZThbQSAC7ayxVLBduu4XlAXvuZYepxajnjdhqbNJQQJ99BFAC24pbEAArohAAABAZBS3IZi.Ep1B8qod0NyIVKV9zceCjT1lBtO64nJFvrTfdXtXVAYU1VHEmNwtJQQJ99BFACqBBLyAArohAAABAZBS4BI2";
const botEndpoint =
  "https://qna-walwep-fyp-bot-7a35.azurewebsites.net/api/messages";

async function generateToken() {
  try {
    const response = await fetch(
      "https://directline.botframework.com/v3/directline/tokens/generate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${directLineSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            id: "dl_" + Math.random().toString(36).substr(2, 9), // Generate a unique user ID
          },
        }),
      }
    );

    const data = await response.json();
    if (!data.token) {
      throw new Error("Failed to generate token");
    }

    return data.token; // Return the generated token
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Failed to generate token");
  }
}

// Start a conversation with the bot
async function startConversation() {
  try {
    const token = await generateToken(); // Get token for the conversation

    const response = await fetch(botEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!data.conversationId) {
      throw new Error(
        "Failed to start conversation, no conversationId returned"
      );
    }

    return data.conversationId; // Return the conversationId
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

  try {
    const token = await generateToken(); // Get token for the conversation

    const response = await fetch(
      `${botEndpoint}/${conversationId}/activities`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "message",
          from: { id: "user" },
          text: message,
        }),
      }
    );

    const data = await response.json();
    if (!data) {
      throw new Error("No response from bot API");
    }

    return data; // Return the response data from the bot
  } catch (error) {
    console.error("Error sending message to bot", error);
    throw new Error("Failed to send message");
  }
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
