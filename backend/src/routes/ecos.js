const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');
const cache = require('../utils/cache');
const dbHealth = require('../utils/dbHealth');

const router = express.Router();

// GET /api/ecos — List all ECOs (paginated)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT e.*, p.name AS product_name, u.name AS creator_name
      FROM ecos e
      LEFT JOIN products p ON e.product_id = p.id
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'Operations User') {
      sql += ' AND e.stage = $1';
      params.push('Done');
    }

    if (req.query.search) {
      const pIdx = params.length + 1;
      sql += ` AND (e.title ILIKE $${pIdx} OR e.eco_number ILIKE $${pIdx} OR p.name ILIKE $${pIdx})`;
      params.push(`%${req.query.search}%`);
    }

    if (req.query.stage && req.query.stage !== 'All') {
      const pIdx = params.length + 1;
      sql += ` AND e.stage = $${pIdx}`;
      params.push(String(req.query.stage));
    }

    const countSql = `SELECT COUNT(*) FROM (${sql}) AS sub`;
    const countRes = await req.db(countSql, params);
    const total = parseInt(countRes.rows[0].count, 10);

    sql += ` ORDER BY e.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await req.db(sql, params);

    // Update cache on success
    if (page === 1 && !req.query.search && !req.query.stage) {
      cache.set('ecos_all', { rows: result.rows, total });
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
      const cached = cache.get('ecos_all');
      if (cached) {
        return res.json({
          success: true,
          data: cached.rows,
          total: cached.total,
          fallback: true,
          message: 'Serving cached ECO data due to database connection issue'
        });
      }
    }
    console.error('[ECOS LIST PROB]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ECOs' });
  }
});

// POST /api/ecos — Create ECO
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Engineering User']), [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['Product', 'BoM']).withMessage('Type must be Product or BoM'),
  body('productId').notEmpty().withMessage('Product ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array().map(e => e.msg).join(', ') });
    }

    const {
      title, type, productId, productName, bomId, effectiveDate,
      versionUpdate, newVersion, description, changes,
      priority, attachedImages
    } = req.body;

    const yearPrefix = `ECO-${new Date().getFullYear()}-`;
    
    // Get count for number generation
    const countRes = await req.db("SELECT COUNT(*) FROM ecos WHERE eco_number LIKE $1", [`${yearPrefix}%`]);
    const ecoNumber = `${yearPrefix}${(parseInt(countRes.rows[0].count) + 1).toString().padStart(3, '0')}`;

    // 1. Insert into ecos (omitting id to let UUID DEFAULT work)
    const ecoResult = await req.db(
      `INSERT INTO ecos (title, eco_number, type, product_id, bom_id, stage, priority, created_by, description, effective_date, version_update, new_version, attached_images, created_at)
       VALUES ($1, $2, $3, $4, $5, 'New', $6, $7, $8, $9, $10, $11, $12, NOW()) RETURNING *`,
      [title, ecoNumber, type, productId, bomId || null, priority || 'Medium', req.user.id, description || '', effectiveDate || null, versionUpdate || false, newVersion || null, JSON.stringify(attachedImages || [])]
    );

    const eco = ecoResult.rows[0];
    const newId = eco.id; // Get the auto-generated UUID

    // 2. Insert into eco_changes
    if (changes && changes.length > 0) {
      for (const change of changes) {
        await req.db(
          `INSERT INTO eco_changes (eco_id, field_name, old_value, new_value, change_type)
           VALUES ($1, $2, $3, $4, $5)`,
          [newId, change.field || change.fieldName, change.oldValue || '', change.newValue || '', change.type || 'modified']
        );
      }
    }

    res.status(201).json({ success: true, data: eco });
  } catch (error) {
    console.error('ECO creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create ECO' });
  }
});

// GET /api/ecos/:id — Get single ECO
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const ecoRes = await req.db('SELECT * FROM ecos WHERE id = $1', [req.params.id]);
    const eco = ecoRes.rows[0];

    if (!eco) {
      return res.status(404).json({ success: false, message: 'ECO not found' });
    }

    if (req.user.role === 'Operations User' && eco.stage !== 'Done') {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view completed ECOs.' });
    }

    // Fetch changes
    const changesRes = await req.db('SELECT * FROM eco_changes WHERE eco_id = $1', [req.params.id]);
    eco.changes = changesRes.rows;

    // Fetch logs
    const logsRes = await req.db('SELECT * FROM approval_logs WHERE eco_id = $1 ORDER BY created_at ASC', [req.params.id]);
    eco.approvalLogs = logsRes.rows;

    res.json({ success: true, data: eco });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch ECO' });
  }
});

// PATCH /api/ecos/:id/stage — Update ECO stage
router.patch('/:id/stage', authMiddleware, roleMiddleware(['Admin', 'Engineering User', 'Approver']), [
  body('stage').isIn(['New', 'In Review', 'Approval', 'Done']).withMessage('Invalid stage')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array().map(e => e.msg).join(', ') });
    }

    const { stage, comment } = req.body;
    const ecoRes = await req.db('SELECT * FROM ecos WHERE id = $1', [req.params.id]);
    const eco = ecoRes.rows[0];

    if (!eco) return res.status(404).json({ success: false, message: 'ECO not found' });

    // Transition Logic
    if (stage === 'Done') {
      if (!['Admin', 'Approver'].includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Only Admin and Approver can approve ECOs' });
      }

      // --- CRITICAL DONE LOGIC ---
      // 1. Fetch Product
      const prodRes = await req.db('SELECT * FROM products WHERE id = $1', [eco.product_id]);
      const product = prodRes.rows[0];

      if (product) {
        // 2. Generate New Version (e.g., v1 -> v2)
        const currentRaw = String(product.version || '1.0').replace(/[vV]/g, '').trim();
        const currentVersion = parseFloat(currentRaw) || 1.0;
        const nextVersion = (currentVersion + 1).toFixed(1);

        // 3. Apply changes (In a real app, you'd iterate over eco_changes, 
        // here we'll update the main product record with new version)
        await req.db(
          'UPDATE products SET version = $1, updated_at = NOW() WHERE id = $2',
          [String(nextVersion), product.id]
        );
      }
    }

    // 4. Update ECO Stage
    console.log('[DEBUG] Updating stage for ECO:', req.params.id, 'to', stage);
    await req.db(
      'UPDATE ecos SET stage = $1, updated_at = NOW() WHERE id = $2',
      [stage, req.params.id]
    );

    // 5. Insert Approval Log
    console.log('[DEBUG] Inserting approval log for ECO:', req.params.id);
    await req.db(
      `INSERT INTO approval_logs (eco_id, user_name, action, comment, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [req.params.id, req.user.name, `Moved to ${stage}`, comment || '']
    );

    res.json({ 
      success: true, 
      message: `ECO status updated to ${stage}`,
      data: { ...eco, stage }
    });
  } catch (error) {
    console.error('[ECO STAGE PROB] FAILED AT STAGE UPDATE:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update ECO stage: ' + error.message });
  }
});

// POST /api/ecos/:id/reject — Reject ECO
router.post('/:id/reject', authMiddleware, roleMiddleware(['Admin', 'Approver']), [
  body('comment').notEmpty().withMessage('Rejection comment is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array().map(e => e.msg).join(', ') });
    }

    await req.db('UPDATE ecos SET stage = $1, updated_at = NOW() WHERE id = $2', ['New', req.params.id]);

    await req.db(
      `INSERT INTO approval_logs (eco_id, user_name, action, comment, created_at)
       VALUES ($1, $2, 'Rejected', $3, NOW())`,
      [req.params.id, req.user.name, req.body.comment]
    );

    res.json({ success: true, message: 'ECO rejected and moved back to New' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject ECO' });
  }
});

module.exports = router;

