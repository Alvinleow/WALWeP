require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcrypt");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const { connectDB } = require("./config/database");
const Account = require("./models/account");
const socketHandler = require("./controllers/socketController");

const saltRounds = 10;
// test again
const allowedOrigins = [
  //process.env.VUE_APP_FRONTEND_URL,
  "https://walwep.netlify.app",
  "https://walwep-production.up.railway.app",
  "http://localhost:8081",
  "http://localhost:8082",
];

connectDB()
  .then(async () => {
    try {
      const adminUsername = "Admin";
      const adminEmail = "admin@gmail.com";

      let account = await Account.findOne({ email: adminEmail });

      if (!account) {
        const hashedPassword = await bcrypt.hash("admin12345", saltRounds);

        account = new Account({
          username: adminUsername,
          email: adminEmail,
          password: hashedPassword,
          accountLevel: 1,
        });

        await account.save();
        console.log("Default admin account created successfully.");
      } else {
        console.log("Default admin account already exists.");
      }
    } catch (err) {
      console.error("Error creating default admin account:", err);
    }

    const app = express();
    const server = http.createServer(app);

    const io = socketIO(server, {
      path: "/socket.io",
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    socketHandler(io);

    const corsOptions = {
      origin: function (origin, callback) {
        if (allowedOrigins.includes(origin) || !origin) {
          callback(null, true);
        } else {
          console.log("Blocked CORS request from origin:", origin);
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };

    app.use(cors(corsOptions));
    app.use(bodyParser.json({ limit: "50mb" }));
    app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    });

    // Routes
    app.use("/api/accounts", require("./routes/account"));
    app.use("/api/contact", require("./routes/contact"));
    app.use("/api/courses", require("./routes/course"));
    app.use("/api/userProgress", require("./routes/userProgress"));
    app.use("/api/quizzes", require("./routes/quiz"));
    app.use("/api/messages", require("./routes/message"));

    // Serve the Vue.js app
    app.use(express.static(path.join(__dirname, "../front-end/dist")));

    // Catch-all route to serve Vue.js index.html
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.resolve(__dirname, "../front-end/dist", "index.html"));
    });

    const PORT = 8081;
    server.listen(PORT, () =>
      console.log(`Server + Socket.IO running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
