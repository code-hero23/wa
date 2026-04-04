const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { sendEmail, replaceVariables } = require("../services/email.service");
const db = require("../config/db");

const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

const emailWorker = new Worker(
  "emails",
  async (job) => {
    const { campaignId, contactId, trackingId } = job.data;
    console.log(`[EMAIL WORKER] Processing campaign ${campaignId} for contact ${contactId}`);
    
    try {
      // 1. Fetch Campaign and Contact Data
      const { rows: campaignRows } = await db.query('SELECT * FROM email_campaigns WHERE id = $1', [campaignId]);
      const { rows: contactRows } = await db.query('SELECT * FROM contacts WHERE id = $1', [contactId]);

      if (campaignRows.length === 0 || contactRows.length === 0) {
        throw new Error('Campaign or Contact not found');
      }

      const campaign = campaignRows[0];
      const contact = contactRows[0];

      // 2. Prepare Email Body with Variables
      const finalBody = replaceVariables(campaign.body, contact);

      // 3. Send Email
      await sendEmail({
        to: contact.email,
        subject: campaign.subject,
        body: finalBody,
        trackingId,
        campaignId,
        contactId
      });

      // 4. Update Logs & Campaign Stats
      const now = new Date();
      await db.query(`
        UPDATE email_logs 
        SET status = 'sent', sent_at = $1 
        WHERE tracking_id = $2
      `, [now, trackingId]);

      await db.query(`
        UPDATE email_campaigns 
        SET sent_count = sent_count + 1 
        WHERE id = $1
      `, [campaignId]);

      console.log(`✅ [EMAIL WORKER] Sent email to ${contact.email} for tracking_id ${trackingId}`);
    } catch (error) {
      console.error(`❌ [EMAIL WORKER] Error sending email:`, error.message);
      await db.query(`
        UPDATE email_logs 
        SET status = 'failed', error_message = $1 
        WHERE tracking_id = $2
      `, [error.message, trackingId]);

      await db.query(`
        UPDATE email_campaigns 
        SET failed_count = failed_count + 1 
        WHERE id = $1
      `, [campaignId]);

      throw error;
    }
  },
  {
    connection,
    concurrency: 5, // Send 5 emails simultaneously
    limiter: {
      max: 50, // Rate limit: maximum 50 emails
      duration: 60000, // per 60 seconds (1 minute)
    }
  }
);

emailWorker.on("completed", (job) => {
  console.log(`[EMAIL WORKER] Job ${job.id} completed!`);
});

emailWorker.on("failed", (job, err) => {
  console.log(`[EMAIL WORKER] Job ${job.id} failed: ${err.message}`);
});


console.log("🚀 Email Marketing Worker Started and Listening for Jobs...");

module.exports = emailWorker;
