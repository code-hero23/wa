const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const contactController = require('../controllers/contact.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'tmp/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Contacts
router.get('/', authMiddleware, contactController.getContacts);
router.post('/', authMiddleware, contactController.createContact);
router.put('/:id', authMiddleware, contactController.updateContact);
router.delete('/:id', authMiddleware, contactController.deleteContact);

// Import
router.post('/import', authMiddleware, upload.single('file'), contactController.importContacts);

module.exports = router;
