const express = require('express');
const ECO = require('../models/ECO');
const Product = require('../models/Product');
const BOM = require('../models/BOM');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/ecos/:id/export/pdf
router.get('/:id/export/pdf', authMiddleware, async (req, res) => {
  try {
    const _id = req.params.id;
    
    // Find ECO by string id (either _id or id)
    const eco = await ECO.findOne({ $or: [{ _id }, { id: _id }] }).lean();
    
    if (!eco) {
      return res.status(404).json({ success: false, message: 'ECO not found' });
    }

    // Manually populate Product based on productId string
    let productData = null;
    if (eco.productId) {
      productData = await Product.findOne({ $or: [{ _id: eco.productId }, { id: eco.productId }] }).lean();
    }

    // Manually populate BOM based on bomId string
    let bomData = null;
    if (eco.bomId) {
      bomData = await BOM.findOne({ $or: [{ _id: eco.bomId }, { id: eco.bomId }] }).lean();
    }

    // Manually populate CreatedBy User
    let createdByUser = null;
    if (eco.createdBy) {
      createdByUser = await User.findOne({ 
        $or: [{ _id: eco.createdBy }, { id: eco.createdBy }, { userId: eco.createdBy }] 
      }).select('name email role').lean();
    }

    const exportedEco = {
      ...eco,
      product: productData,
      bom: bomData,
      createdBy: createdByUser || { name: eco.createdByName || 'Unknown', role: 'Engineering User' }
    };

    res.json({
      success: true,
      data: {
        eco: exportedEco,
        generatedAt: new Date(),
        generatedBy: {
          name: req.user.name,
          role: req.user.role
        }
      }
    });

  } catch (error) {
    console.error('Error exporting ECO PDF data:', error);
    res.status(500).json({ success: false, message: 'Failed to generate export data' });
  }
});

module.exports = router;
