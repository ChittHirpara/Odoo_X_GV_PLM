const express = require('express');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

// GET /api/approval-rules — List all rules
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await req.db('SELECT * FROM approval_rules ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows || [] });
  } catch (error) {
    console.error('[APPROVAL RULES FETCH ERROR]', {
      message: error.message,
      pgCode: error.code
    });
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch approval rules',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// POST /api/approval-rules — Create rule (Admin only)
router.post('/', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  try {
    const { name, conditions, stage, requiredRole, status } = req.body;
    const result = await req.db(
      `INSERT INTO approval_rules (name, conditions, stage, required_role, status, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [name, JSON.stringify(conditions || []), stage, requiredRole, status || 'Active']
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('[APPROVAL RULES PROB]', error);
    res.status(500).json({ success: false, message: 'Failed to create approval rule' });
  }
});

// PUT /api/approval-rules/:id — Update rule (Admin only)
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  try {
    const { name, conditions, stage, requiredRole, status } = req.body;

    const result = await req.db(
      `UPDATE approval_rules 
       SET name = COALESCE($1, name), 
           conditions = COALESCE($2, conditions), 
           stage = COALESCE($3, stage), 
           required_role = COALESCE($4, required_role), 
           status = COALESCE($5, status),
           updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [name, conditions ? JSON.stringify(conditions) : null, stage, requiredRole, status, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update approval rule' });
  }
});

// DELETE /api/approval-rules/:id — Delete rule (Admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), async (req, res) => {
  try {
    const result = await req.db('DELETE FROM approval_rules WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    res.json({ success: true, message: 'Rule deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete approval rule' });
  }
});

module.exports = router;

