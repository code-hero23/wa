const express = require('express');
const router = express.Router();
const trackController = require('../controllers/track.controller');

// Open tracking pixel (e.g., tracking-id.png)
router.get('/track/:trackingId', trackController.trackOpen);

// Click tracking (Optional, requires link replacement)
router.get('/click/:trackingId', trackController.trackClick);

module.exports = router;
