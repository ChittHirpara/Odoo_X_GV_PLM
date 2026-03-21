const express = require('express');
const Setting = require('../models/Setting');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

// GET /api/settings/eco-stages — Get ECO stage configuration
router.get('/eco-stages', authMiddleware, async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'eco_stages' });
    res.json({
      success: true,
      data: setting ? setting.value : ['New', 'In Review', 'Approval', 'Done']
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch ECO stages' });
  }
});

// PUT /api/settings/eco-stages — Update ECO stages (Admin only)
router.put('/eco-stages', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  try {
    const { stages } = req.body;
    if (!Array.isArray(stages)) {
      return res.status(400).json({ success: false, message: 'stages must be an array' });
    }

    const setting = await Setting.findOneAndUpdate(
      { key: 'eco_stages' },
      { value: stages },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: setting.value });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update ECO stages' });
  }
});

// GET /api/settings/rules — Get approval toggle rules
router.get('/rules', authMiddleware, async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'approval_rules' });
    res.json({
      success: true,
      data: setting ? setting.value : []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch approval rules settings' });
  }
});

// PUT /api/settings/rules — Update approval toggle rules (Admin only)
router.put('/rules', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  try {
    const { rules } = req.body;
    if (!Array.isArray(rules)) {
      return res.status(400).json({ success: false, message: 'rules must be an array' });
    }

    const setting = await Setting.findOneAndUpdate(
      { key: 'approval_rules' },
      { value: rules },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: setting.value });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update approval rules settings' });
  }
});

module.exports = router;

