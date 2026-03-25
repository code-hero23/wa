const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');

const TOKEN = process.env.WHATSAPP_TOKEN;
const WABA_ID = process.env.WABA_ID;

async function subscribe() {
  console.log('--- ESTABLISHING WABA SUBSCRIPTION ---');
  console.log('WABA_ID:', WABA_ID);

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v22.0/${WABA_ID}/subscribed_apps`,
      {},
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    
    console.log('API Response:', JSON.stringify(res.data, null, 2));
    
    if (res.data.success) {
      console.log('SUCCESS! Your App is now subscribed to this WABA.');
      console.log('Real messages should now reach your server.');
    } else {
      console.log('FAILED! Subscription was not successful.');
    }

  } catch (err) {
    if (err.response) {
      console.error('API Error:', err.response.status, err.response.data.error.message);
    } else {
      console.error('Error:', err.message);
    }
  }
}

subscribe();
