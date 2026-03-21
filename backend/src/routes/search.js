const express = require('express');
const ECO = require('../models/ECO');
const Product = require('../models/Product');
const BOM = require('../models/BOM');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/search?q=query&type=all
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: { results: { ecos: [], products: [], boms: [] }, totalCount: 0, query: q } });
    }

    const regex = new RegExp(q, 'i');
    const userRole = req.user.role;

    const [ecos, products, boms] = await Promise.all([
      // Search ECOs
      ECO.find({
        $or: [
          { title: regex },
          { ecoNumber: regex },
          { description: regex }
        ]
      })
      .select('id _id title ecoNumber stage type productId createdAt')
      .limit(5)
      .sort({ createdAt: -1 })
      .lean(),
      
      // Search Products (Operations only see Active)
      Product.find({
        $or: [{ name: regex }, { sku: regex }],
        ...(userRole === 'Operations User' ? { status: 'Active' } : {})
      })
      .select('id _id name sku version status category')
      .limit(5)
      .lean(),
      
      // Search BOMs
      BOM.find({
        $or: [{ name: regex }]
      })
      .select('id _id name version status productId')
      .limit(5)
      .lean()
    ]);

    res.json({
      success: true,
      data: {
        results: {
          ecos: ecos.map(e => ({
            id: e.id || e._id,
            type: 'eco',
            title: e.title,
            subtitle: `${e.ecoNumber || ''} · ${e.stage || ''}`,
            badge: e.stage,
            url: `/eco/${e.id || e._id}`
          })),
          products: products.map(p => ({
            id: p.id || p._id,
            type: 'product',
            title: p.name,
            subtitle: `${p.sku || ''} · ${p.status || ''} · v${p.version || ''}`,
            badge: p.status,
            url: `/products/${p.id || p._id}`
          })),
          boms: boms.map(b => ({
            id: b.id || b._id,
            type: 'bom',
            title: b.name,
            subtitle: `v${b.version || ''}`,
            badge: b.status || b.version,
            url: `/boms/${b.id || b._id}`
          }))
        },
        totalCount: ecos.length + products.length + boms.length,
        query: q
      }
    });

  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ success: false, message: 'Failed to search' });
  }
});

module.exports = router;
