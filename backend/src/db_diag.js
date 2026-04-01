require("dotenv").config();
const db = require('./config/db');

async function diag() {
  try {
    console.log('--- DB DIAGNOSTICS ---');
    
    const inbound = await db.query("SELECT * FROM chat_messages WHERE direction = 'inbound' ORDER BY created_at DESC LIMIT 5");
    console.log('Inbound Chat Messages:', JSON.stringify(inbound.rows, null, 2));
    
    const statuses = await db.query("SELECT status, count(*) FROM messages GROUP BY status");
    console.log('Campaign Message Statuses:', JSON.stringify(statuses.rows, null, 2));

    const contacts = await db.query("SELECT id, name, phone, last_message_at FROM contacts ORDER BY last_message_at DESC NULLS LAST LIMIT 5");
    console.log('Recent Contacts:', JSON.stringify(contacts.rows, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Diag failed:', err.message);
    process.exit(1);
  }
}

diag();
