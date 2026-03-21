const express = require('express');
const authMiddleware = require('../middleware/auth');
const cache = require('../utils/cache');
const dbHealth = require('../utils/dbHealth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

// GET /api/boms — List all BOMs (paginated)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM boms WHERE 1=1';
    const params = [];

    if (req.query.search) {
      sql += ` AND (name ILIKE $${params.length + 1} OR product_name ILIKE $${params.length + 1})`;
      params.push(`%${req.query.search}%`);
    }

    // Total count
    const countSql = `SELECT COUNT(*) FROM (${sql}) AS sub`;
    const countRes = await req.db(countSql, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // Paginated result
    sql += ` ORDER BY version DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await req.db(sql, params);

    // Update cache on success
    if (page === 1 && !req.query.search) {
      cache.set('boms_all', { rows: result.rows, total });
    }

    res.json({ 
      success: true, 
      data: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    });
  } catch (error) {
    // Fallback
    if (!dbHealth.getStatus()) {
      const cached = cache.get('boms_all');
      if (cached) {
        return res.json({
          success: true,
          data: cached.rows,
          total: cached.total,
          fallback: true,
          message: 'Serving cached BoM data due to database connection issue'
        });
      }
    }
    console.error('[BOMS PROB]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch BOMs' });
  }
});

// GET /api/boms/:id — Get single BOM  
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await req.db(
      'SELECT * FROM boms WHERE id = $1',
      [req.params.id]
    );

    const bom = result.rows[0];

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
    
    const version = '1.0';
    const status = 'Draft';

    // Insert into boms table (omitting id to let UUID DEFAULT work)
    const result = await req.db(
      `INSERT INTO boms (name, product_id, version, status, components, operations)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        name, 
        productId, 
        version, 
        status, 
        JSON.stringify(components || []), 
        JSON.stringify(operations || [])
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('[BOMS CREATE PROB]', error);
    res.status(500).json({ success: false, message: 'Failed to create BOM' });
  }
});

module.exports = router;

