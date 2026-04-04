const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('./config/db');

async function activate() {
  console.log('--- ACTIVATING SMTP CONFIGURATION ---');
  try {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT) || 587;

    if (!smtpUser || !smtpPass) {
      console.error('Error: SMTP_USER or SMTP_PASS not found in .env');
      process.exit(1);
    }

    // Deactivate existing
    await db.query('UPDATE smtp_settings SET is_active = false');

    // Insert or Update the row
    await db.query(`
      INSERT INTO smtp_settings (host, port, "user", pass, secure, from_name, from_email, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT DO NOTHING
    `, [smtpHost, smtpPort, smtpUser, smtpPass, smtpPort === 465, 'Mail Blast', smtpUser, true]);

    // Just in case it existed but wasn't active
    await db.query(`
      UPDATE smtp_settings 
      SET is_active = true 
      WHERE "user" = $1
    `, [smtpUser]);

    console.log('SUCCESS: SMTP settings have been activated in the database.');
    process.exit(0);
  } catch (err) {
    console.error('ACTIVATION FAILED:', err.message);
    process.exit(1);
  }
}

activate();
