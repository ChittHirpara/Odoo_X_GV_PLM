const express = require('express');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/notifications
 * Returns ONLY the logged-in user's notifications
 * Filtered by userId from JWT
 */
router.get('/', authMiddleware, async (req, res) => {
  console.log('[ROUTE] GET /api/notifications called');

  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .populate('ecoId', 'title ecoNumber stage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('[NOTIFICATIONS] List error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Marks notification as read
 */
router.patch('/:id/read', authMiddleware, async (req, res) => {
  console.log(`[ROUTE] PATCH /api/notifications/${req.params.id}/read called`);

  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Ensure user can only mark their own notifications
    if (notification.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only mark your own notifications as read'
      });
    }

    notification.read = true;
    await notification.save();

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('[NOTIFICATIONS] Mark read error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

module.exports = router;
