const db = require("../config/db");

// Meta Webhook Verification
exports.verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log('--- WEBHOOK VERIFICATION ATTEMPT ---');
  console.log('Mode:', mode);
  console.log('Token:', token);
  console.log('Expected:', process.env.VERIFY_TOKEN);

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    console.log("RESULT: VERIFIED ✅");
    return res.status(200).send(challenge);
  }

  console.log("RESULT: FAILED ❌");
  res.status(403).send("Verification Failed");
};

// Meta Webhook Events (Messages & Status Updates)
exports.handleWebhook = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    console.log('[WEBHOOK] WARNING: Received empty body.');
    return res.sendStatus(200);
  }

  // Log raw body for extreme debugging on VPS
  console.log('[WEBHOOK] RAW BODY RECEIVED:', JSON.stringify(req.body, null, 2));

  const entries = req.body.entry;
  if (!entries || !Array.isArray(entries)) {
    return res.sendStatus(200);
  }

  try {
    for (let entry of entries) {
      const changes = entry.changes;
      if (!changes || !Array.isArray(changes)) continue;

      for (let change of changes) {
        const value = change.value;
        if (!value) continue;

        // 1. Handle Incoming Messages
        const incomingMessages = value.messages;
        if (incomingMessages && Array.isArray(incomingMessages)) {
          for (let msg of incomingMessages) {
            const { from: phone, text, id: message_id, type } = msg;
            let content = "";

            if (type === "text") {
              content = text?.body || "";
            } else if (type === "button") {
              content = msg.button?.text || "[Button Click]";
            } else if (msg.interactive) {
              content = msg.interactive.button_reply?.title || msg.interactive.list_reply?.title || "[Interactive Message]";
            } else {
              content = `[Received ${type} message]`;
              console.log(`[WEBHOOK] Unsupported message type: ${type}`, JSON.stringify(msg, null, 2));
            }

            console.log(`[WEBHOOK] Processing: "${content}" from ${phone}`);

            // 1.1 Find/Upsert Contact
            // We search for exact match first, then partial match, then insert.
            let contactResult = await db.query(
              "SELECT id FROM contacts WHERE phone = $1 OR $1 LIKE '%' || phone",
              [phone]
            );
            
            let contactId;
            if (contactResult.rows.length > 0) {
              contactId = contactResult.rows[0].id;
              console.log(`[WEBHOOK] Matched existing contact ID: ${contactId}`);
            } else {
              // Create new contact if not found
              contactResult = await db.query(
                "INSERT INTO contacts (name, phone) VALUES ($1, $2) ON CONFLICT (phone) DO UPDATE SET last_message = EXCLUDED.last_message RETURNING id",
                [phone, phone]
              );
              contactId = contactResult.rows[0].id;
              console.log(`[WEBHOOK] Created new contact ID: ${contactId}`);
            }

            // 1.2 Store Inbound Message
            await db.query(
              "INSERT INTO chat_messages (contact_id, direction, content, message_id, status) VALUES ($1, $2, $3, $4, $5)",
              [contactId, "inbound", content, message_id, "received"]
            );

            // 1.3 Update contact last message info
            await db.query(
              "UPDATE contacts SET last_message = $1, last_message_at = NOW() WHERE id = $2",
              [content, contactId]
            );
          }
        }

        // 2. Handle Message Statuses
        const statuses = value.statuses;
        if (statuses && Array.isArray(statuses)) {
          for (let s of statuses) {
            const { id: message_id, status } = s;
            console.log(`[WEBHOOK] Status update: ${message_id} -> ${status}`);
            
            await db.query(
              "UPDATE messages SET status = $1, updated_at = NOW() WHERE message_id = $2",
              [status, message_id]
            );

            await db.query(
              "UPDATE chat_messages SET status = $1 WHERE message_id = $2",
              [status, message_id]
            );
          }
        }
      }
    }
  } catch (err) {
    console.error("[WEBHOOK] Critical Error:", err);
  }

  res.sendStatus(200);
};
