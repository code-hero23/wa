require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
// Start workers
require("./workers/message.worker");

const app = express();

app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: false }));

// Initialize the traffic log file so 'tail' doesn't fail
const logPath = path.join(__dirname, '../webhook_traffic.log');
if (!fs.existsSync(logPath)) {
  fs.writeFileSync(logPath, `[${new Date().toISOString()}] Log initialized\n---\n`);
}

// Detailed Request Logger for Webhook Debugging
app.use((req, res, next) => {
  if (req.url.includes('webhook')) {
    const detail = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      headers: req.headers,
      ip: req.ip,
      rawBody: req.rawBody || "EMPTY_STREAM",
      parsedBody: req.body
    };
    fs.appendFileSync(logPath, JSON.stringify(detail, null, 2) + '\n---\n');
  } else {
    const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${req.ip}\n`;
    console.log(logEntry.trim());
  }
  next();
});

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
