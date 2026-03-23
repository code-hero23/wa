const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { sendTemplate } = require("../services/whatsapp.service");
const db = require("../config/db");

const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

const messageWorker = new Worker(
  "messages",
  async (job) => {
    const { messageInternalId, campaignId, phone, template, name, params } = job.data;
    console.log(`Processing message to ${phone} with template ${template}`);
    
    try {
      // Create components for personalization (e.g., {{1}}, {{2}}... replaced by params)
      const parameters = (params && Array.isArray(params) && params.length > 0)
        ? params.map(p => ({ type: "text", text: String(p) }))
        : (name ? [{ type: "text", text: name }] : []);

      const components = parameters.length > 0 ? [
        {
          type: "body",
          parameters: parameters
        }
      ] : [];

      const result = await sendTemplate(phone, template, components);
      console.log(`Successfully sent to ${phone}:`, result);

      // Update message status and store Meta's message ID
      await db.query(
        "UPDATE messages SET message_id = $1, status = 'sent' WHERE id = $2",
        [result.messages[0].id, messageInternalId]
      );

      // Increment campaign total_sent count for the dashboard
      await db.query(
        "UPDATE campaigns SET total_sent = total_sent + 1 WHERE id = $1",
        [campaignId]
      );

      console.log(`✅ Message sent to ${phone}`);
    } catch (error) {
      const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
      await db.query(
        "UPDATE messages SET status = 'failed', error_message = $1 WHERE id = $2",
        [errorMessage, messageInternalId]
      );
      throw error;
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

messageWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed!`);
});

messageWorker.on("failed", (job, err) => {
  console.log(`Job ${job.id} failed with error: ${err.message}`);
});

module.exports = messageWorker;
