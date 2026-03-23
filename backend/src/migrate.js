const db = require('./config/db');

async function migrate() {
  try {
    console.log('Starting migration...');
    await db.query(`
      ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS total_sent INTEGER DEFAULT 0;
      ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS delivered_count INTEGER DEFAULT 0;
      ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS read_count INTEGER DEFAULT 0;
      ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS failed_count INTEGER DEFAULT 0;
    `);
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
