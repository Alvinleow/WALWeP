const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

router.get("/token", async (req, res) => {
  const secret =
    "AHIAtTyKIYh7pZThbQSAC7ayxVLBduu4XlAXvuZYepxajnjdhqbNJQQJ99BFAC24pbEAArohAAABAZBS3IZi.Ep1B8qod0NyIVKV9zceCjT1lBtO64nJFvrTfdXtXVAYU1VHEmNwtJQQJ99BFACqBBLyAArohAAABAZBS4BI2"; // Replace with your Direct Line Secret
  try {
    const response = await fetch(
      "https://directline.botframework.com/v3/directline/tokens/generate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            id: "user123", // This can be a unique user ID from your system
            name: "John Doe", // User's name
          },
        }),
      }
    );

    const data = await response.json();
    res.json({ token: data.token });
  } catch (error) {
    console.error("Error fetching Direct Line token:", error);
    res.status(500).send("Error generating token.");
  }
});

module.exports = router;
