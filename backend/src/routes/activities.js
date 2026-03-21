const express = require('express');
const Activity = require('../models/Activity');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/activities — List activity timeline, most recent first
router.get('/', authMiddleware, async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 });
    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch activities' });
  }
});

// POST /api/activities — Create activity entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, title, description, user, ecoId } = req.body;
    const activity = await Activity.create({
      id: `a${Date.now()}`,
      type,
      title,
      description,
      timestamp: new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      user,
      ecoId: ecoId || null
    });
    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create activity' });
  }
});

module.exports = router;

