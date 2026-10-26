
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { askAdminAI } = require('../controllers/adminAiController');

router.post('/ask', authMiddleware, askAdminAI);

module.exports = router;
