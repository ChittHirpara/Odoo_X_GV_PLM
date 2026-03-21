const express = require('express');
const { body, validationResult } = require('express-validator');
const ECO = require('../models/ECO');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');
const { applyECO, addApprovalLog, generateEcoNumber } = require('../services/ecoService');
const { notifyApprovers, notifyRejection } = require('../services/notificationService');

const router = express.Router();

/**
 * GET /api/ecos
 * Returns all ECOs with populated product and user data
 * Operations User sees only ECOs in Done stage
 */
router.get('/', authMiddleware, async (req, res) => {
  console.log('[ROUTE] GET /api/ecos called');

  try {
    let query = {};

    // Operations User can only see Done ECOs
    if (req.user.role === 'Operations User') {
      query.stage = 'Done';
    }

    const ecos = await ECO.find(query)
      .populate('productId', 'name sku version status')
      .populate('bomId', 'name version status')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: ecos
    });
  } catch (error) {
    console.error('[ECOS] List error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ECOs'
    });
  }
});

/**
 * POST /api/ecos
 * Creates new ECO
 * Auth required, roles: Engineering User, Admin only
 */
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Engineering User']), [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['Product', 'BoM']).withMessage('Type must be Product or BoM'),
  body('productId').notEmpty().withMessage('Product ID is required')
], async (req, res) => {
  console.log('[ROUTE] POST /api/ecos called');

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map(e => e.msg).join(', ')
      });
    }

    const {
      title, type, productId, bomId, effectiveDate,
      versionUpdate, newVersion, description, changes,
      priority, imageChanges
    } = req.body;

    // Generate ECO number
    const ecoNumber = await generateEcoNumber();

    const eco = await ECO.create({
      title,
      ecoNumber,
      type,
      productId,
      bomId: bomId || null,
      stage: 'New',
      priority: priority || 'Medium',
      createdBy: req.user.id,
      effectiveDate: effectiveDate || null,
      versionUpdate: versionUpdate || false,
      newVersion: newVersion || null,
      description: description || '',
      changes: changes || [],
      imageChanges: imageChanges || [],
      approvalLogs: [{
        userName: req.user.name,
        action: 'ECO Created',
        timestamp: new Date(),
        comment: `ECO created by ${req.user.name}`
      }]
    });

    // Populate references before returning
    const populatedEco = await ECO.findById(eco._id)
      .populate('productId', 'name sku version status')
      .populate('bomId', 'name version status')
      .populate('createdBy', 'name email role');

    console.log(`[ECOS] Created ECO: ${ecoNumber} — "${title}"`);

    res.status(201).json({
      success: true,
      data: populatedEco
    });
  } catch (error) {
    console.error('[ECOS] Create error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create ECO'
    });
  }
});

/**
 * GET /api/ecos/:id
 * Returns full ECO detail with all nested arrays
 */
router.get('/:id', authMiddleware, async (req, res) => {
  console.log(`[ROUTE] GET /api/ecos/${req.params.id} called`);

  try {
    const eco = await ECO.findById(req.params.id)
      .populate('productId')
      .populate('bomId')
      .populate('createdBy', 'name email role');

    if (!eco) {
      return res.status(404).json({
        success: false,
        message: 'ECO not found'
      });
    }

    // Operations User can only see Done ECOs
    if (req.user.role === 'Operations User' && eco.stage !== 'Done') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view completed ECOs.'
      });
    }

    res.json({
      success: true,
      data: eco
    });
  } catch (error) {
    console.error('[ECOS] Get error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ECO'
    });
  }
});

/**
 * PATCH /api/ecos/:id/stage
 * Advances ECO to next stage
 * Stage rules enforced per role
 */
router.patch('/:id/stage', authMiddleware, roleMiddleware(['Admin', 'Engineering User', 'Approver']), [
  body('stage').isIn(['New', 'In Review', 'Approval', 'Done']).withMessage('Invalid stage')
], async (req, res) => {
  console.log(`[ROUTE] PATCH /api/ecos/${req.params.id}/stage called`);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map(e => e.msg).join(', ')
      });
    }

    const { stage, comment } = req.body;
    const eco = await ECO.findById(req.params.id);

    if (!eco) {
      return res.status(404).json({
        success: false,
        message: 'ECO not found'
      });
    }

    const userRole = req.user.role;
    const currentStage = eco.stage;

    // Stage transition validation
    const validTransitions = {
      'New': ['In Review'],
      'In Review': ['Approval'],
      'Approval': ['Done'],
      'Rejected': ['In Review']
    };

    if (!validTransitions[currentStage] || !validTransitions[currentStage].includes(stage)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${currentStage}' to '${stage}'`
      });
    }

    // Role-based stage advancement rules
    if ((stage === 'In Review' || stage === 'Approval') && !['Admin', 'Engineering User'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only Admin and Engineering User can advance to this stage'
      });
    }

    if (stage === 'Done' && !['Admin', 'Approver'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Only Admin and Approver can approve ECOs'
      });
    }

    // Determine action label
    let action;
    switch (stage) {
      case 'In Review': action = 'Submitted for Review'; break;
      case 'Approval': action = 'Advanced to Approval'; break;
      case 'Done': action = 'Approved'; break;
      default: action = `Moved to ${stage}`;
    }

    // Add approval log
    eco.approvalLogs.push({
      userName: req.user.name,
      action,
      timestamp: new Date(),
      comment: comment || ''
    });

    // If moving to Approval, notify all Approvers
    if (stage === 'Approval') {
      await notifyApprovers(eco);
    }

    // If moving to Done, apply the ECO
    if (stage === 'Done') {
      eco.stage = 'Approval'; // Save log first
      await eco.save();
      await applyECO(eco._id, req.user.id);
    } else {
      eco.stage = stage;
      await eco.save();
    }

    // Fetch fresh data with populates
    const updatedEco = await ECO.findById(eco._id)
      .populate('productId', 'name sku version status')
      .populate('bomId', 'name version status')
      .populate('createdBy', 'name email role');

    console.log(`[ECOS] Stage updated: ${eco.ecoNumber} → ${stage}`);

    res.json({
      success: true,
      data: updatedEco
    });
  } catch (error) {
    console.error('[ECOS] Stage update error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update ECO stage'
    });
  }
});

/**
 * POST /api/ecos/:id/reject
 * Rejects ECO — moves stage back to 'New'
 * Auth required, roles: Approver, Admin only
 */
router.post('/:id/reject', authMiddleware, roleMiddleware(['Admin', 'Approver']), [
  body('comment').notEmpty().withMessage('Rejection comment is required')
], async (req, res) => {
  console.log(`[ROUTE] POST /api/ecos/${req.params.id}/reject called`);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map(e => e.msg).join(', ')
      });
    }

    const { comment } = req.body;
    const eco = await ECO.findById(req.params.id);

    if (!eco) {
      return res.status(404).json({
        success: false,
        message: 'ECO not found'
      });
    }

    // Add rejection approval log
    eco.approvalLogs.push({
      userName: req.user.name,
      action: 'Rejected',
      timestamp: new Date(),
      comment: `Rejected by ${req.user.name}: ${comment}`
    });

    eco.stage = 'Rejected';
    await eco.save();

    // Notify ECO creator about rejection
    await notifyRejection(eco, req.user.name, comment);

    const updatedEco = await ECO.findById(eco._id)
      .populate('productId', 'name sku version status')
      .populate('bomId', 'name version status')
      .populate('createdBy', 'name email role');

    console.log(`[ECOS] ECO rejected: ${eco.ecoNumber}`);

    res.json({
      success: true,
      data: updatedEco
    });
  } catch (error) {
    console.error('[ECOS] Reject error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to reject ECO'
    });
  }
});

/**
 * PATCH /api/ecos/:id/images/review/:imageChangeId
 * Reviews a specific image change
 * Auth required, roles: Approver, Admin
 */
router.patch('/:id/images/review/:imageChangeId', authMiddleware, roleMiddleware(['Admin', 'Approver']), [
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected')
], async (req, res) => {
  console.log(`[ROUTE] PATCH /api/ecos/${req.params.id}/images/review/${req.params.imageChangeId} called`);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map(e => e.msg).join(', ')
      });
    }

    const { status, comment } = req.body;
    const eco = await ECO.findById(req.params.id);

    if (!eco) {
      return res.status(404).json({
        success: false,
        message: 'ECO not found'
      });
    }

    // Find the image change
    const imageChange = eco.imageChanges.find(ic => ic.id === req.params.imageChangeId);

    if (!imageChange) {
      return res.status(404).json({
        success: false,
        message: 'Image change not found'
      });
    }

    imageChange.reviewStatus = status;
    imageChange.reviewComment = comment || '';
    imageChange.reviewedBy = req.user.name;

    await eco.save();

    const updatedEco = await ECO.findById(eco._id)
      .populate('productId', 'name sku version status')
      .populate('bomId', 'name version status')
      .populate('createdBy', 'name email role');

    console.log(`[ECOS] Image review: ${eco.ecoNumber} — image ${req.params.imageChangeId} → ${status}`);

    res.json({
      success: true,
      data: updatedEco
    });
  } catch (error) {
    console.error('[ECOS] Image review error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to review image change'
    });
  }
});

module.exports = router;
