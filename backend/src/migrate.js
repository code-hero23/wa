const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('./config/db');

async function migrate() {
  console.log('--- RUNNING DATABASE MIGRATION ---');
  try {
    await db.query(`
      ALTER TABLE chat_messages 
      ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE;
    `);
    console.log('SUCCESS: is_read column added to chat_messages table.');
    process.exit(0);
  } catch (err) {
    console.error('MIGRATION FAILED:', err.message);
    process.exit(1);
  }
}

migrate();
