const db = require("../config/db");
const messageQueue = require("../queues/message.queue");
const whatsappService = require("../services/whatsapp.service");

exports.createCampaign = async (req, res) => {
  const { name, template, contacts, headerImageUrl } = req.body;
  
  if (!name || !template || !contacts || !Array.isArray(contacts)) {
    return res.status(400).json({ error: "Name, template, and contacts (array) are required" });
  }

  try {
    // 1. Create Campaign in DB
    const campaignResult = await db.query(
      "INSERT INTO campaigns (name, template, status) VALUES ($1, $2, $3) RETURNING id",
      [name, template, "processing"]
    );
    const campaignId = campaignResult.rows[0].id;

    // 2. Process Contacts and Add to Queue
    for (let contact of contacts) {
      // Find or Create contact
      let contactResult = await db.query(
        "INSERT INTO contacts (name, phone) VALUES ($1, $2) ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name RETURNING id",
        [contact.name, contact.phone]
      );
      const contactId = contactResult.rows[0].id;

      // Create message record
      const messageResult = await db.query(
        "INSERT INTO messages (campaign_id, contact_id, status) VALUES ($1, $2, $3) RETURNING id",
        [campaignId, contactId, "pending"]
      );
      const messageInternalId = messageResult.rows[0].id;

      // Add to Blasting Queue
      await messageQueue.add("send-message", {
        messageInternalId,
        campaignId,
        contactId,
        phone: contact.phone,
        template: template,
        params: contact.params || [],
        headerImageUrl: headerImageUrl || contact.headerImageUrl // Global or per-contact header image
      });
    }

    res.json({ success: true, campaignId, message: "Campaign blast started" });
  } catch (error) {
    console.error("Campaign Creation Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM campaigns ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT m.*, c.name as contact_name, c.phone as contact_phone, cp.name as campaign_name 
      FROM messages m
      JOIN contacts c ON m.contact_id = c.id
      JOIN campaigns cp ON m.campaign_id = cp.id
      ORDER BY m.updated_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch Messages Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getTemplates = async (req, res) => {
  try {
    const data = await whatsappService.getTemplates();
    res.json(data);
  } catch (error) {
    const errorMessage = error.response ? error.response.data : error.message;
    console.error("Fetch Templates Error:", errorMessage);
    res.status(500).json({ 
      error: "Failed to fetch templates from WhatsApp API",
      details: errorMessage
    });
  }
};
