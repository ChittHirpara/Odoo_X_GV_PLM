const express = require('express');
const ApprovalRule = require('../models/ApprovalRule');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

// GET /api/approval-rules — List all rules
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rules = await ApprovalRule.find();
    res.json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch approval rules' });
  }
});

// POST /api/approval-rules — Create rule (Admin only)
router.post('/', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  try {
    const { name, conditions, stage, requiredRole, status } = req.body;
    const rule = await ApprovalRule.create({
      id: `ar${Date.now()}`,
      name,
      conditions,
      stage,
      requiredRole,
      status: status || 'Active'
    });
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create approval rule' });
  }
});

// PUT /api/approval-rules/:id — Update rule (Admin only)
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  try {
    const rule = await ApprovalRule.findOne({ _id: req.params.id });
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    const { name, conditions, stage, requiredRole, status } = req.body;
    if (name) rule.name = name;
    if (conditions) rule.conditions = conditions;
    if (stage) rule.stage = stage;
    if (requiredRole) rule.requiredRole = requiredRole;
    if (status) rule.status = status;

    await rule.save();
    res.json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update approval rule' });
  }
});

// DELETE /api/approval-rules/:id — Delete rule (Admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  try {
    const rule = await ApprovalRule.findOneAndDelete({ _id: req.params.id });
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }
    res.json({ success: true, message: 'Rule deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete approval rule' });
  }
});

module.exports = router;

