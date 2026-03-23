const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setup() {
  const dbName = process.env.DB_NAME || 'whatsapp_blast';
  
  // 1. Connect to default 'postgres' database to create the new DB
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server.');

    // 2. Create Database
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
    if (res.rows.length === 0) {
      console.log(`Creating database "${dbName}"...`);
      await client.query(`CREATE DATABASE ${dbName}`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
    await client.end();

    // 3. Connect to the new database to run schema
    const dbClient = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      database: dbName
    });

    await dbClient.connect();
    console.log(`Connected to database "${dbName}". Applying schema...`);

    const schemaPath = path.join(__dirname, 'src', 'models', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    await dbClient.query(schemaSql);
    console.log('Schema applied successfully!');
    await dbClient.end();

    console.log('\n✅ Setup complete! You can now run "npm run dev".');
  } catch (err) {
    console.error('\n❌ Setup failed:');
    console.error(err.message);
    console.log('\nPlease make sure your DB_PASSWORD is set correctly in the .env file.');
    process.exit(1);
  }
}

setup();
