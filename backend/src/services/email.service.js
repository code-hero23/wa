const nodemailer = require('nodemailer');
const db = require('../config/db');

/**
 * Replace dynamic variables in the template body.
 * Format: {{name}}, {{project}}, {{email}}, etc.
 */
const replaceVariables = (content, contact) => {
  if (!content) return '';
  let replaced = content;
  const vars = {
    name: contact.name || 'Customer',
    email: contact.email || '',
    phone: contact.phone || '',
    project: contact.project_name || '',
    location: contact.location || '',
  };

  Object.entries(vars).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    replaced = replaced.replace(regex, value);
  });

  return replaced;
};

/**
 * Get active SMTP settings from the database.
 */
const getActiveSmtp = async () => {
  const result = await db.query('SELECT * FROM smtp_settings WHERE is_active = true LIMIT 1');
  if (result.rows.length === 0) {
    throw new Error('No active SMTP configuration found. Please save your SMTP settings in the Settings page first.');
  }
  return result.rows[0];
};

/**
 * Send an email using Nodemailer.
 */
const sendEmail = async ({ to, subject, body, trackingId, campaignId, contactId }) => {
  const smtp = await getActiveSmtp();

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure, // true for 465, false for other ports
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  // Inject tracking pixel if trackingId is provided
  let finalBody = body;
  if (trackingId) {
    const trackingPixel = `<img src="${process.env.BACKEND_URL || 'http://localhost:5150'}/api/email/track/${trackingId}.png" width="1" height="1" style="display:none;" />`;
    finalBody += trackingPixel;
  }

  const info = await transporter.sendMail({
    from: `"${smtp.from_name || 'Mail Blast'}" <${smtp.from_email || smtp.user}>`,
    to,
    subject,
    html: finalBody,
  });

  return info;
};

module.exports = {
  sendEmail,
  replaceVariables,
};
