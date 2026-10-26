
const express = require('express');
const router = express.Router();

const {
  activateSubscription,
  getMySubscription,
  getSubscriptionStats
} = require('../controllers/subscriptionController');

const authMiddleware = require('../middleware/authMiddleware');

router.get('/stats', authMiddleware, getSubscriptionStats);

router.get('/me', authMiddleware, getMySubscription);

router.post('/activate', authMiddleware, activateSubscription);

module.exports = router;
