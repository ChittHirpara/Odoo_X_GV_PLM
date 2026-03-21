const express = require('express');
const Product = require('../models/Product');
const BOM = require('../models/BOM');
const ECO = require('../models/ECO');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats — Aggregate statistics for all dashboard variants
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [productCount, bomCount, ecoCount, userCount] = await Promise.all([
      Product.countDocuments(),
      BOM.countDocuments(),
      ECO.countDocuments(),
      User.countDocuments()
    ]);

    const ecos = await ECO.find();

    const stageCounts = {
      New: 0,
      'In Review': 0,
      Approval: 0,
      Done: 0,
      Rejected: 0
    };
    const priorityCounts = { High: 0, Medium: 0, Low: 0 };
    const typeCounts = { Product: 0, BoM: 0 };

    ecos.forEach(eco => {
      if (stageCounts[eco.stage] !== undefined) stageCounts[eco.stage]++;
      if (priorityCounts[eco.priority] !== undefined) priorityCounts[eco.priority]++;
      if (typeCounts[eco.type] !== undefined) typeCounts[eco.type]++;
    });

    const activeProducts = await Product.countDocuments({ status: 'Active' });

    res.json({
      success: true,
      data: {
        products: { total: productCount, active: activeProducts },
        boms: { total: bomCount },
        ecos: { total: ecoCount, byStage: stageCounts, byPriority: priorityCounts, byType: typeCounts },
        users: { total: userCount }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;

