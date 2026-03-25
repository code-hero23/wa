require('dotenv').config();
const axios = require('axios');

const TOKEN = process.env.WHATSAPP_TOKEN;
const WABA_ID = process.env.WABA_ID;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

async function check() {
  console.log('--- META API DIAGNOSTICS ---');
  console.log('WABA_ID:', WABA_ID);
  console.log('PHONE_NUMBER_ID:', PHONE_NUMBER_ID);

  try {
    // 1. Check Phone Number Status
    console.log('\n1. Checking Phone Number Status...');
    const phoneRes = await axios.get(`https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('Status:', phoneRes.data.status);
    console.log('Quality Rating:', phoneRes.data.quality_rating);
    console.log('Verified Name:', phoneRes.data.verified_name);

    // 2. Check WABA Status
    console.log('\n2. Checking WABA Status...');
    const wabaRes = await axios.get(`https://graph.facebook.com/v22.0/${WABA_ID}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('Message Limit:', wabaRes.data.message_tier_limit);
    console.log('Account Status:', wabaRes.data.account_status);

    // 3. Check Webhook Subscriptions
    console.log('\n3. Checking Webhook Subscriptions for this WABA...');
    const subRes = await axios.get(`https://graph.facebook.com/v22.0/${WABA_ID}/subscribed_apps`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('Subscribed Apps:', JSON.stringify(subRes.data, null, 2));

  } catch (err) {
    console.error('\nFAILED! Check your TOKEN, WABA_ID, and PHONE_NUMBER_ID in .env');
    if (err.response) {
      console.error('API Error:', err.response.status, err.response.data.error.message);
    } else {
      console.error('Error:', err.message);
    }
  }
}

check();
