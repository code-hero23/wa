const db = require('./config/db');

async function migrate() {
  console.log('--- RUNNING BOT SCHEMA MIGRATION ---');
  try {
    // 1. Add bot_state to track conversation flow
    await db.query(`
      ALTER TABLE contacts 
      ADD COLUMN IF NOT EXISTS bot_state TEXT DEFAULT 'START';
    `);
    
    // 2. Add bot_data to store gathered info (Name, Inquiry, Email)
    await db.query(`
      ALTER TABLE contacts 
      ADD COLUMN IF NOT EXISTS bot_data JSONB DEFAULT '{}';
    `);

    // 3. Add bot_enabled to toggle bot per contact
    await db.query(`
      ALTER TABLE contacts 
      ADD COLUMN IF NOT EXISTS bot_enabled BOOLEAN DEFAULT TRUE;
    `);

    console.log('SUCCESS: Bot columns added to contacts table.');
    process.exit(0);
  } catch (err) {
    console.error('MIGRATION FAILED:', err.message);
    process.exit(1);
  }
}

migrate();
