const db = require('../config/db');
const emailQueue = require('../queues/email.queue');
const { v4: uuidv4 } = require('uuid');

/**
 * Campaigns
 */
exports.createEmailCampaign = async (req, res) => {
  const { name, subject, body, templateId, contactIds, scheduledAt } = req.body;

  if (!name || !subject || !body || !contactIds || !Array.isArray(contactIds)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Create Campaign
    const campaignResult = await db.query(
      `INSERT INTO email_campaigns (name, subject, body, template_id, status, total_recipients, scheduled_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [name, subject, body, templateId, 'pending', contactIds.length, scheduledAt]
    );
    const campaignId = campaignResult.rows[0].id;

    // 2. Add individual logs and queue jobs
    for (const contactId of contactIds) {
      const trackingId = uuidv4();
      
      // Create log entry
      await db.query(
        `INSERT INTO email_logs (campaign_id, contact_id, status, tracking_id) 
         VALUES ($1, $2, $3, $4)`,
        [campaignId, contactId, 'pending', trackingId]
      );

      // Add to BullMQ
      await emailQueue.add('send-email', {
        campaignId,
        contactId,
        trackingId
      }, {
        delay: scheduledAt ? new Date(scheduledAt).getTime() - Date.now() : 0
      });
    }

    res.json({ success: true, campaignId, message: 'Email campaign created and queued' });
  } catch (err) {
    console.error('Create campaign error:', err);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
};

exports.getEmailCampaigns = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM email_campaigns ORDER BY created_at DESC');
    res.json({ success: true, campaigns: result.rows });
  } catch (err) {
    console.error('Get email campaigns error:', err);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
};

exports.getEmailCampaignStats = async (req, res) => {
  const { id } = req.params;
  try {
    const campaign = await db.query('SELECT * FROM email_campaigns WHERE id = $1', [id]);
    const logs = await db.query(`
      SELECT l.*, c.name as contact_name, c.email as contact_email 
      FROM email_logs l 
      JOIN contacts c ON l.contact_id = c.id 
      WHERE l.campaign_id = $1 
      ORDER BY l.sent_at DESC
    `, [id]);
    
    res.json({ success: true, campaign: campaign.rows[0], logs: logs.rows });
  } catch (err) {
    console.error('Get campaign stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

/**
 * Templates
 */
exports.getEmailTemplates = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM email_templates ORDER BY created_at DESC');
    res.json({ success: true, templates: result.rows });
  } catch (err) {
    console.error('Get templates error:', err);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

exports.createEmailTemplate = async (req, res) => {
  const { name, subject, body } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO email_templates (name, subject, body) VALUES ($1, $2, $3) RETURNING *',
      [name, subject, body]
    );
    res.json({ success: true, template: result.rows[0] });
  } catch (err) {
    console.error('Create template error:', err);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

exports.updateEmailTemplate = async (req, res) => {
  const { id } = req.params;
  const { name, subject, body } = req.body;
  try {
    const result = await db.query(
      'UPDATE email_templates SET name = $1, subject = $2, body = $3 WHERE id = $4 RETURNING *',
      [name, subject, body, id]
    );
    res.json({ success: true, template: result.rows[0] });
  } catch (err) {
    console.error('Update template error:', err);
    res.status(500).json({ error: 'Failed to update template' });
  }
};

exports.deleteEmailTemplate = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM email_templates WHERE id = $1', [id]);
    res.json({ success: true, message: 'Template deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete template' });
  }
};

/**
 * SMTP Settings
 */
exports.getSmtpSettings = async (req, res) => {
  try {
    const result = await db.query('SELECT id, host, port, "user", secure, from_name, from_email, is_active FROM smtp_settings');
    res.json({ success: true, settings: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch SMTP settings' });
  }
};

exports.updateSmtpSettings = async (req, res) => {
  const { host, port, user, pass, secure, from_name, from_email, is_active, id } = req.body;
  try {
    if (is_active) {
      // Deactivate all others if this one is active
      await db.query('UPDATE smtp_settings SET is_active = false');
    }

    if (id) {
      // Update existing
      const result = await db.query(
        `UPDATE smtp_settings 
         SET host = $1, port = $2, "user" = $3, pass = $4, secure = $5, from_name = $6, from_email = $7, is_active = $8 
         WHERE id = $9 RETURNING *`,
        [host, port, user, pass, secure, from_name, from_email, is_active, id]
      );
      res.json({ success: true, settings: result.rows[0] });
    } else {
      // Create new
      const result = await db.query(
        `INSERT INTO smtp_settings (host, port, "user", pass, secure, from_name, from_email, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [host, port, user, pass, secure, from_name, from_email, is_active]
      );
      res.json({ success: true, settings: result.rows[0] });
    }
  } catch (err) {
    console.error('SMTP update error:', err);
    res.status(500).json({ error: 'Failed to update SMTP settings' });
  }
};
