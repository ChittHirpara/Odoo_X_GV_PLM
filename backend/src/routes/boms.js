const express = require('express');
const BOM = require('../models/BOM');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/boms
 * Returns all BOMs
 * Auth required, all roles
 */
router.get('/', authMiddleware, async (req, res) => {
  console.log('[ROUTE] GET /api/boms called');

  try {
    let query = {};

    // Operations User can only see Active BOMs
    if (req.user.role === 'Operations User') {
      query.status = 'Active';
    }

    const boms = await BOM.find(query)
      .populate('productId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: boms
    });
  } catch (error) {
    console.error('[BOMS] List error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch BOMs'
    });
  }
});

/**
 * GET /api/boms/:id
 * Returns full BOM with components and operations arrays
 * Auth required, all roles
 */
router.get('/:id', authMiddleware, async (req, res) => {
  console.log(`[ROUTE] GET /api/boms/${req.params.id} called`);

  try {
    const bom = await BOM.findById(req.params.id).populate('productId');

    if (!bom) {
      return res.status(404).json({
        success: false,
        message: 'BOM not found'
      });
    }

    // Operations User can only see Active BOMs
    if (req.user.role === 'Operations User' && bom.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view active BOMs.'
      });
    }

    res.json({
      success: true,
      data: bom
    });
  } catch (error) {
    console.error('[BOMS] Get error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch BOM'
    });
  }
});

module.exports = router;
