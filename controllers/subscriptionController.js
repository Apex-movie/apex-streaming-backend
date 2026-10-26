
const Subscription = require('../models/Subscription');

const PLAN_PRICES = {
  monthly: 199,
  yearly: 1999
};

const PLAN_DAYS = {
  monthly: 30,
  yearly: 365
};

// Activate demo subscription
exports.activateSubscription = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({
        message: 'Please select a valid subscription plan.'
      });
    }

    // User ID comes from verified JWT middleware
    const userId = req.user.id || req.user._id;

    const now = new Date();

    // Check if user already has an active subscription
    const existing = await Subscription.findOne({
      user: userId,
      status: 'active',
      endDate: { $gt: now }
    });

    if (existing) {
      return res.status(409).json({
        message: 'You already have an active subscription.',
        subscription: existing
      });
    }

    // Calculate subscription expiry date
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + PLAN_DAYS[plan]);

    // Create or update user's subscription
    const subscription = await Subscription.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          plan,
          amount: PLAN_PRICES[plan],
          status: 'active',
          startDate: now,
          endDate,
          paymentMode: 'demo'
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    return res.status(201).json({
      message: 'Demo subscription activated successfully!',
      subscription
    });
  } catch (error) {
    console.error('Activate subscription error:', error);

    return res.status(500).json({
      message: 'Unable to activate subscription.'
    });
  }
};

// Get logged-in user's subscription status
exports.getMySubscription = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const subscription = await Subscription.findOne({
      user: userId
    });

    const isActive = Boolean(
      subscription &&
      subscription.status === 'active' &&
      subscription.endDate > new Date()
    );

    return res.status(200).json({
      isActive,
      subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);

    return res.status(500).json({
      message: 'Unable to fetch subscription.'
    });
  }
};

// Get monthly and yearly active subscriber counts
exports.getSubscriptionStats = async (req, res) => {
  try {
    const now = new Date();

    const activeFilter = {
      status: 'active',
      endDate: { $gt: now }
    };

    const [monthlySubscribers, yearlySubscribers] = await Promise.all([
      Subscription.countDocuments({
        ...activeFilter,
        plan: 'monthly'
      }),
      Subscription.countDocuments({
        ...activeFilter,
        plan: 'yearly'
      })
    ]);

    return res.status(200).json({
      monthlySubscribers,
      yearlySubscribers
    });
  } catch (error) {
    console.error('Subscription stats error:', error);

    return res.status(500).json({
      message: 'Unable to fetch subscription statistics.'
    });
  }
};
