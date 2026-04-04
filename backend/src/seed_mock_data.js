const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('--- SEEDING MOCK DATA ---');
  try {
    // 1. Seed Employees
    const pass = await bcrypt.hash('Employee@2026', 10);
    await db.query(`
      INSERT INTO users (email, password_hash, name, role) 
      VALUES ($1, $2, $3, $4) 
      ON CONFLICT (email) DO NOTHING
    `, ['employee1@cookscape.com', pass, 'John Doe', 'employee']);
    console.log('✅ Mock employee created.');

    // 2. Seed Contacts
    const contacts = [
      ['Aravind R', 'aravind@example.com', '91741841478', 'Villa Project', 'Chennai', 'Leads'],
      ['Sarah Connor', 'sarah@test.com', '91987654321', 'Skyline Apartments', 'Bangalore', 'Customers'],
      ['James Bond', 'bond@mi6.uk', '44700700700', 'Secret Manor', 'London', 'Follow-up']
    ];
    for (const [name, email, phone, project, loc, group] of contacts) {
      await db.query(`
        INSERT INTO contacts (name, email, phone, project_name, location, grouping) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        ON CONFLICT (phone) DO NOTHING
      `, [name, email, phone, project, loc, group]);
    }
    console.log('✅ Mock contacts created.');

    // 3. Seed Templates
    await db.query(`
      INSERT INTO email_templates (name, subject, body) 
      VALUES ($1, $2, $3)
    `, [
      'Welcome Offer', 
      'Welcome to Cookscape, {{name}}!', 
      '<h1>Hello {{name}}!</h1><p>We are excited to help you with your project <strong>{{project}}</strong>. Here is a 10% discount code: WELCOME10</p>'
    ]);
    console.log('✅ Mock templates created.');

    // 4. Seed SMTP (Inactive placeholder)
    await db.query(`
      INSERT INTO smtp_settings (host, port, "user", pass, secure, from_name, from_email, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, ['smtp.mailtrap.io', 2525, 'placeholder_user', 'placeholder_pass', false, 'WHP Team', 'hello@whp.com', true]);
    console.log('✅ Mock SMTP settings created.');

    process.exit(0);
  } catch (err) {
    console.error('SEEDING FAILED:', err.message);
    process.exit(1);
  }
}

seed();
