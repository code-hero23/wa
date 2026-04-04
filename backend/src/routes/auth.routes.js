const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/login', authController.login);
router.get('/verify', authMiddleware, authController.verify);

// Admin only
router.post('/employees', authMiddleware, authController.registerEmployee);
router.get('/employees', authMiddleware, authController.getEmployees);
router.delete('/employees/:id', authMiddleware, authController.deleteEmployee);

module.exports = router;
