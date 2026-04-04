const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('./config/db');

async function migrate() {
  console.log('--- RUNNING MAIL BLAST DATABASE MIGRATION ---');
  try {
    // 1. Users table for role-based access
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'employee', -- 'admin', 'employee'
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('SUCCESS: users table created.');

    // 2. Update contacts table
    await db.query(`
      ALTER TABLE contacts 
      ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS project_name TEXT,
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS grouping TEXT DEFAULT 'Leads'; -- e.g., 'Leads', 'Customers', 'Follow-up'
    `);
    console.log('SUCCESS: contacts table updated.');

    // 3. Email Templates table
    await db.query(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        subject TEXT,
        body TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('SUCCESS: email_templates table created.');

    // 4. Email Campaigns table
    await db.query(`
      CREATE TABLE IF NOT EXISTS email_campaigns (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        status TEXT DEFAULT 'draft', -- 'draft', 'pending', 'sending', 'completed', 'failed'
        total_recipients INTEGER DEFAULT 0,
        sent_count INTEGER DEFAULT 0,
        failed_count INTEGER DEFAULT 0,
        open_count INTEGER DEFAULT 0,
        click_count INTEGER DEFAULT 0,
        template_id INTEGER REFERENCES email_templates(id) ON DELETE SET NULL,
        scheduled_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('SUCCESS: email_campaigns table created.');

    // 5. Email Logs table for tracking
    await db.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id SERIAL PRIMARY KEY,
        campaign_id INTEGER REFERENCES email_campaigns(id) ON DELETE CASCADE,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'opened', 'clicked'
        error_message TEXT,
        sent_at TIMESTAMP,
        tracking_id TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('SUCCESS: email_logs table created.');

    // 6. SMTP Settings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS smtp_settings (
        id SERIAL PRIMARY KEY,
        host TEXT NOT NULL,
        port INTEGER NOT NULL,
        "user" TEXT NOT NULL,
        pass TEXT NOT NULL,
        secure BOOLEAN DEFAULT TRUE,
        from_name TEXT,
        from_email TEXT,
        is_active BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('SUCCESS: smtp_settings table created.');

    process.exit(0);
  } catch (err) {
    console.error('MIGRATION FAILED:', err.message);
    process.exit(1);
  }
}

migrate();
