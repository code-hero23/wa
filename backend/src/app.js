require("dotenv").config();
const express = require("express");
const cors = require("cors");
// Start workers
require("./workers/message.worker");

const app = express();

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/campaigns", require("./routes/campaign.routes"));
app.use("/api/chats", require("./routes/chat.routes"));
app.use("/api/webhook", require("./routes/webhook.routes"));

app.get("/", (req, res) => {
  res.send("WhatsApp Blast Backend is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
