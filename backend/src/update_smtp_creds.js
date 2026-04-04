const db = require('./config/db');

async function updateSmtp() {
  console.log('--- UPDATING SMTP SETTINGS ---');
  try {
    const result = await db.query(`
      INSERT INTO smtp_settings (host, port, "user", pass, secure, from_name, from_email, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET 
        host = EXCLUDED.host, 
        port = EXCLUDED.port, 
        "user" = EXCLUDED.user, 
        pass = EXCLUDED.pass, 
        is_active = true
      RETURNING id
    `, ['smtp.gmail.com', 587, 'webapp.cookscape@gmail.com', 'wlrz hbdc dsfr gbhy', false, 'Cookscape Mail Blast', 'webapp.cookscape@gmail.com', true]);

    console.log('✅ SMTP Settings Updated in Database.');
    process.exit(0);
  } catch (err) {
    console.error('FAILED TO UPDATE SMTP:', err.message);
    process.exit(1);
  }
}

updateSmtp();
