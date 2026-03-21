const express = require('express');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications — List all notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ timestamp: -1 });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read — Mark notification as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
});

// POST /api/notifications — Create notification
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, type, ecoId } = req.body;
    const notification = await Notification.create({
      id: `n${Date.now()}`,
      title,
      type: type || 'info',
      ecoId: ecoId || null,
      read: false,
      timestamp: new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    });
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
});

module.exports = router;

