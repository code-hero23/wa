require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function updateSchema() {
  console.log('--- Starting Database Schema Update ---');
  
  const queries = [
    'ALTER TABLE contacts ADD COLUMN IF NOT EXISTS email TEXT;',
    'ALTER TABLE contacts ADD COLUMN IF NOT EXISTS project_name TEXT;',
    'ALTER TABLE contacts ADD COLUMN IF NOT EXISTS location TEXT;',
    'ALTER TABLE contacts ADD COLUMN IF NOT EXISTS grouping TEXT;'
  ];

  try {
    for (const query of queries) {
      console.log(`Executing: ${query}`);
      await pool.query(query);
    }
    console.log('✅ Database Schema updated successfully!');
  } catch (err) {
    console.error('❌ Error updating database:', err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

updateSchema();
