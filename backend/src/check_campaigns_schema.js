const db = require('./config/db');

async function checkCampaigns() {
  try {
    const result = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'campaigns'");
    console.log('Campaigns columns:', JSON.stringify(result.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Query failed:', err.message);
    process.exit(1);
  }
}

checkCampaigns();
