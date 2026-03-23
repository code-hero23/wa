const axios = require("axios");

/**
 * Sends a message using a pre-approved WhatsApp template.
 * @param {string} to - Recipient phone number in international format (e.g., "91XXXXXXXXXX").
 * @param {string} templateName - The name of the template.
 * @param {string} languageCode - Language code (default: "en").
 * @returns {Promise} Axios response.
 */
exports.sendTemplate = async (to, templateName, components = [], languageCode = "en") => {
  const url = `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`;
  
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: languageCode
      },
      components: components
    }
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    console.error("WhatsApp API Error (Template):", error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Sends a free-form text message.
 * @param {string} to - Recipient phone number in international format.
 * @param {string} body - Message content.
 * @returns {Promise} Axios response.
 */
exports.sendMessage = async (to, body) => {
  const url = `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`;
  
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body }
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    console.error("WhatsApp API Error (Text):", error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Fetches available WhatsApp message templates from the WABA.
 * @returns {Promise} Axios response data.
 */
exports.getTemplates = async () => {
  const url = `https://graph.facebook.com/v18.0/${process.env.WABA_ID}/message_templates`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("WhatsApp API Error (Get Templates):", error.response ? error.response.data : error.message);
    throw error;
  }
};
