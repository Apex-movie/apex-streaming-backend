
const Subscription = require('../models/Subscription')

module.exports = async function requireSubscription(req, res, next) {
  try {
    const userId = req.user.id || req.user._id

    const subscription = await Subscription.findOne({
      user: userId,
      status: 'active',
      endDate: { $gt: new Date() }
    })

    if (!subscription) {
      return res.status(403).json({
        message: 'An active subscription is required to watch this premium movie.',
        code: 'SUBSCRIPTION_REQUIRED'
      })
    }

    req.subscription = subscription
    next()
  } catch (error) {
    console.error('Subscription check error:', error)

    return res.status(500).json({
      message: 'Unable to verify subscription.'
    })
  }
}
