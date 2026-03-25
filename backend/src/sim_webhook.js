const axios = require('axios');

async function test() {
  console.log('--- SIMULATING META WEBHOOK ---');
  const payload = {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "ENTRY_1",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: { display_phone_number: "123", phone_number_id: "123" },
              contacts: [{ profile: { name: "Test User" }, wa_id: "917418414780" }],
              messages: [{
                from: "917418414780",
                id: `TEST_MSG_1_${Date.now()}`,
                timestamp: Date.now().toString(),
                text: { body: "First message in first entry" },
                type: "text"
              }]
            },
            field: "messages"
          },
          {
            value: {
              messaging_product: "whatsapp",
              metadata: { display_phone_number: "123", phone_number_id: "123" },
              messages: [{
                from: "917418414780",
                id: `TEST_MSG_2_${Date.now()}`,
                timestamp: Date.now().toString(),
                text: { body: "Second message in first entry" },
                type: "text"
              }]
            },
            field: "messages"
          }
        ]
      },
      {
        id: "ENTRY_2",
        changes: [{
          value: {
            messaging_product: "whatsapp",
            metadata: { display_phone_number: "123", phone_number_id: "123" },
            messages: [{
              from: "917418414780",
              id: `TEST_MSG_3_${Date.now()}`,
              timestamp: Date.now().toString(),
              text: { body: "Message in second entry" },
              type: "text"
            }]
          },
          field: "messages"
        }]
      }
    ]
  };

  try {
    const res = await axios.post('http://localhost:5000/api/webhook', payload);
    console.log('Response Status:', res.status);
    console.log('Success! The backend logic is working locally.');
  } catch (err) {
    console.error('FAILED! Local request could not reach backend:', err.message);
    console.log('Ensure your backend is running on port 5000.');
  }
}

test();
