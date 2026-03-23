const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");

router.get("/", chatController.getChats);
router.get("/:contactId/messages", chatController.getMessages);
router.post("/send", chatController.sendChatMessage);

module.exports = router;
