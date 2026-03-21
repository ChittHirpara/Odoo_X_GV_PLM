const express = require('express');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/products
 * Returns all products
 * Auth required, all roles
 */
router.get('/', authMiddleware, async (req, res) => {
  console.log('[ROUTE] GET /api/products called');

  try {
    let query = {};

    // Operations User can only see Active products
    if (req.user.role === 'Operations User') {
      query.status = 'Active';
    }

    const products = await Product.find(query)
      .populate('bomId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('[PRODUCTS] List error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

/**
 * GET /api/products/:id
 * Returns single product with full versions array
 * Auth required, all roles
 */
router.get('/:id', authMiddleware, async (req, res) => {
  console.log(`[ROUTE] GET /api/products/${req.params.id} called`);

  try {
    const product = await Product.findById(req.params.id).populate('bomId');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Operations User can only see Active products
    if (req.user.role === 'Operations User' && product.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view active products.'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('[PRODUCTS] Get error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

module.exports = router;
