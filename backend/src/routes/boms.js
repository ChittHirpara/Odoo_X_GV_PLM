const express = require('express');
const BOM = require('../models/BOM');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

// GET /api/boms — List all BOMs
router.get('/', authMiddleware, async (req, res) => {
  try {
    const boms = await BOM.find().sort({ version: -1 });
    res.json({ success: true, data: boms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch BOMs' });
  }
});

// GET /api/boms/:id — Get single BOM  
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const bom = await BOM.findOne({ _id: req.params.id });
    if (!bom) {
      return res.status(404).json({ success: false, message: 'BOM not found' });
    }
    res.json({ success: true, data: bom });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch BOM' });
  }
});

// POST /api/boms — Create BOM (Engineering/Admin only)
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Engineering User']), async (req, res) => {
  try {
    const { name, productId, productName, components, operations } = req.body;
    const newBom = await BOM.create({
      id: `bom${Date.now()}`,
      name,
      productId,
      productName: productName || '',
      version: '1.0',
      status: 'Draft',
      components: (components || []).map((c, i) => ({
        id: c.id || `comp-${Date.now()}-${i}`,
        name: c.name,
        partNumber: c.partNumber || '',
        quantity: c.quantity || 1,
        unit: c.unit || 'pcs',
        cost: c.cost || 0
      })),
      operations: (operations || []).map((op, i) => ({
        id: op.id || `op-${Date.now()}-${i}`,
        name: op.name,
        workCenter: op.workCenter || '',
        duration: op.duration || ''
      }))
    });
    res.status(201).json({ success: true, data: newBom });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create BOM' });
  }
});

module.exports = router;

