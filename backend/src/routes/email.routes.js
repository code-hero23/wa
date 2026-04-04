const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Campaigns
router.get('/campaigns', authMiddleware, emailController.getEmailCampaigns);
router.post('/campaigns', authMiddleware, emailController.createEmailCampaign);
router.get('/campaigns/:id', authMiddleware, emailController.getEmailCampaignStats);

// Templates
router.get('/templates', authMiddleware, emailController.getEmailTemplates);
router.post('/templates', authMiddleware, emailController.createEmailTemplate);
router.put('/templates/:id', authMiddleware, emailController.updateEmailTemplate);
router.delete('/templates/:id', authMiddleware, emailController.deleteEmailTemplate);

// SMTP Settings (Admin only)
router.get('/smtp', authMiddleware, emailController.getSmtpSettings);
router.post('/smtp', authMiddleware, emailController.updateSmtpSettings);
router.post('/test-send', authMiddleware, emailController.testSendEmail);

module.exports = router;
