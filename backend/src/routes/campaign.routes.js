const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaign.controller");

router.post("/send", campaignController.createCampaign);
router.get("/", campaignController.getCampaigns);
router.get("/templates", campaignController.getTemplates);
router.get("/messages", campaignController.getMessages);

module.exports = router;
