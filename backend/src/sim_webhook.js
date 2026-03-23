const axios = require('axios');

async function test() {
  console.log('--- SIMULATING META WEBHOOK ---');
  const payload = {
    object: "whatsapp_business_account",
    entry: [{
      id: "123",
      changes: [{
        value: {
          messaging_product: "whatsapp",
          metadata: { display_phone_number: "123", phone_number_id: "123" },
          contacts: [{ profile: { name: "Test User" }, wa_id: "917418414780" }],
          messages: [{
            from: "917418414780",
            id: `TEST_${Date.now()}`,
            timestamp: Date.now().toString(),
            text: { body: "Simulated Hello!" },
            type: "text"
          }]
        },
        field: "messages"
      }]
    }]
  };

  try {
    const res = await axios.post('http://localhost:5000/webhook', payload);
    console.log('Response Status:', res.status);
    console.log('Success! The backend logic is working locally.');
  } catch (err) {
    console.error('FAILED! Local request could not reach backend:', err.message);
    console.log('Ensure your backend is running on port 5000.');
  }
}

test();
