require("dotenv").config();
const express = require("express");
const cors = require("cors");
// Start workers
require("./workers/message.worker");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const authMiddleware = require("./middlewares/auth.middleware");

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/campaigns", authMiddleware, require("./routes/campaign.routes"));
app.use("/api/chats", authMiddleware, require("./routes/chat.routes"));
app.use("/api/webhook", require("./routes/webhook.routes"));

app.get("/", (req, res) => {
  res.send("WhatsApp Blast Backend is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
