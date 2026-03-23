const db = require("../config/db");
const { sendMessage } = require("../services/whatsapp.service");

// Get a list of all chat contacts
exports.getChats = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM contacts ORDER BY last_message_at DESC NULLS LAST, id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get message history for a specific contact
exports.getMessages = async (req, res) => {
  const { contactId } = req.params;
  try {
    const result = await db.query(
      "SELECT * FROM chat_messages WHERE contact_id = $1 ORDER BY created_at ASC",
      [contactId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Send a free-form message
exports.sendChatMessage = async (req, res) => {
  const { contactId, body } = req.body;

  if (!contactId || !body) {
    return res.status(400).json({ error: "Contact ID and message body are required" });
  }

  try {
    // 1. Get contact phone
    const contactResult = await db.query("SELECT phone FROM contacts WHERE id = $1", [contactId]);
    if (contactResult.rows.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }
    const phone = contactResult.rows[0].phone;

    // 2. Send via WhatsApp API
    const response = await sendMessage(phone, body);
    const message_id = response.messages[0].id;

    // 3. Store in DB
    await db.query(
      "INSERT INTO chat_messages (contact_id, direction, content, message_id, status) VALUES ($1, $2, $3, $4, $5)",
      [contactId, "outbound", body, message_id, "sent"]
    );

    // 4. Update contact last message
    await db.query(
      "UPDATE contacts SET last_message = $1, last_message_at = NOW() WHERE id = $2",
      [body, contactId]
    );

    res.json({ success: true, message_id });
  } catch (err) {
    console.error("Error sending chat message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};
