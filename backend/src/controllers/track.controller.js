const db = require('../config/db');
const path = require('path');

/**
 * Handle tracking pixel request (Open tracking)
 */
exports.trackOpen = async (req, res) => {
  const { trackingId } = req.params;
  const tid = trackingId.replace('.png', ''); // Remove .png if present

  try {
    // 1. Update the log status to 'opened' if it's not already 'clicked'
    const result = await db.query(`
      UPDATE email_logs 
      SET status = 'opened' 
      WHERE tracking_id = $1 AND status != 'clicked' 
      RETURNING campaign_id, contact_id
    `, [tid]);

    // 2. Increment campaign open_count
    if (result.rows.length > 0) {
      await db.query(`
        UPDATE email_campaigns 
        SET open_count = open_count + 1 
        WHERE id = $1
      `, [result.rows[0].campaign_id]);
    }

    // 3. Return a transparent 1x1 PNG pixel
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    );
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    res.send(pixel);
  } catch (err) {
    console.error('Tracking error:', err);
    res.status(404).end();
  }
};

/**
 * Handle link click tracking (Optional but recommended)
 * This would require replacing links in the body with a redirect link.
 */
exports.trackClick = async (req, res) => {
  const { trackingId } = req.params;
  const { url } = req.query;

  try {
    const result = await db.query(`
      UPDATE email_logs 
      SET status = 'clicked' 
      WHERE tracking_id = $1 
      RETURNING campaign_id
    `, [trackingId]);

    if (result.rows.length > 0) {
      await db.query(`
        UPDATE email_campaigns 
        SET click_count = click_count + 1 
        WHERE id = $1
      `, [result.rows[0].campaign_id]);
    }

    res.redirect(url || '/');
  } catch (err) {
    console.error('Click tracking error:', err);
    res.redirect(url || '/');
  }
};
