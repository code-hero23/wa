const { Client } = require('pg');
require('dotenv').config();

async function diag() {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log('--- VPS DATABASE DIAGNOSTICS ---');
    
    // Inbound Messages
    const inbound = await client.query("SELECT * FROM chat_messages WHERE direction = 'inbound' ORDER BY created_at DESC LIMIT 5");
    console.log('\nLast 5 Inbound Chat Messages:');
    console.table(inbound.rows.map(r => ({ id: r.id, phone: r.contact_id, content: r.content, time: r.created_at })));

    // Outbound Messages
    const outbound = await client.query("SELECT * FROM chat_messages WHERE direction = 'outbound' ORDER BY created_at DESC LIMIT 5");
    console.log('\nLast 5 Outbound Chat Messages:');
    console.table(outbound.rows.map(r => ({ id: r.id, phone: r.contact_id, content: r.content, status: r.status, time: r.created_at })));

    // Messages table (Campaigns)
    const messages = await client.query("SELECT * FROM messages ORDER BY updated_at DESC LIMIT 5");
    console.log('\nLast 5 Campaign Messages:');
    console.table(messages.rows.map(r => ({ id: r.id, campaign: r.campaign_id, status: r.status, error: r.error_message })));

    await client.end();
  } catch (err) {
    console.error('Diag failed:', err.message);
  }
}

diag();
