const express = require('express');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/products — List all products
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Operations User') {
      query.status = 'Active';
    }
    const products = await Product.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// GET /api/products/:id — Get single product
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (req.user.role === 'Operations User' && product.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view active products.' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

module.exports = router;

