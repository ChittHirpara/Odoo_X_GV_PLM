const express = require('express');
const { body, validationResult } = require('express-validator');
const ECO = require('../models/ECO');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roles');

const router = express.Router();

// GET /api/ecos — List all ECOs
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Operations User') {
      query.stage = 'Done';
    }
    const ecos = await ECO.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: ecos });
  } catch (error) {
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
      return res.status(400).json({
        success: false,
        message: errors.array().map(e => e.msg).join(', ')
      });
    }

    const {
      title, type, productId, productName, bomId, effectiveDate,
      versionUpdate, newVersion, description, changes,
      priority, imageChanges, attachedImages
    } = req.body;

    // Generate ECO number
    const currentYear = new Date().getFullYear();
    const yearPrefix = `ECO-${currentYear}-`;
    const count = await ECO.countDocuments({
      ecoNumber: { $regex: `^${yearPrefix}` }
    });
    const ecoNumber = `${yearPrefix}${(count + 1).toString().padStart(3, '0')}`;

    const eco = await ECO.create({
      id: `eco${Date.now()}`,
      title,
      ecoNumber,
      type,
      productId,
      productName: productName || '',
      bomId: bomId || null,
      stage: 'New',
      priority: priority || 'Medium',
      createdBy: req.user.userId || req.user.id,
      createdByName: req.user.name,
      createdAt: new Date().toISOString().slice(0, 10),
      effectiveDate: effectiveDate || null,
      versionUpdate: versionUpdate || false,
      newVersion: newVersion || null,
      description: description || '',
      changes: changes || [],
      attachedImages: attachedImages || [],
      imageChanges: imageChanges || [],
      approvalLogs: []
    });

    res.status(201).json({ success: true, data: eco });
  } catch (error) {
    console.error('ECO creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create ECO' });
  }
});

// GET /api/ecos/:id — Get single ECO
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const eco = await ECO.findOne({ _id: req.params.id });
    if (!eco) {
      return res.status(404).json({ success: false, message: 'ECO not found' });
    }
    if (req.user.role === 'Operations User' && eco.stage !== 'Done') {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view completed ECOs.' });
    }
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
      return res.status(400).json({
        success: false,
        message: errors.array().map(e => e.msg).join(', ')
      });
    }

    const { stage, comment } = req.body;
    const eco = await ECO.findOne({ _id: req.params.id });

    if (!eco) {
      return res.status(404).json({ success: false, message: 'ECO not found' });
    }

    const userRole = req.user.role;
    const currentStage = eco.stage;

    const validTransitions = {
      'New': ['In Review', 'Approval'],
      'In Review': ['Approval'],
      'Approval': ['Done', 'New'] // New represents 'Rejected' status in the frontend currently
    };

    if (!validTransitions[currentStage] || !validTransitions[currentStage].includes(stage)) {
      if (currentStage !== stage) {
        return res.status(400).json({
          success: false,
          message: `Cannot transition from '${currentStage}' to '${stage}'`
        });
      }
    }

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

    let action;
    switch (stage) {
      case 'In Review': action = 'Submitted for Review'; break;
      case 'Approval': action = 'Submitted for Approval'; break;
      case 'Done': action = 'Approved'; break;
      default: action = `Moved to ${stage}`;
    }

    eco.approvalLogs.push({
      user: req.user.name,
      action,
      timestamp: new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      comment: comment || ''
    });

    eco.stage = stage;
    eco.stageEnteredAt = new Date();
    eco.slaEscalated = false;
    await eco.save();

    res.json({ success: true, data: eco });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update ECO stage' });
  }
});

// POST /api/ecos/:id/reject — Reject ECO
router.post('/:id/reject', authMiddleware, roleMiddleware(['Admin', 'Approver']), [
  body('comment').notEmpty().withMessage('Rejection comment is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map(e => e.msg).join(', ')
      });
    }

    const { comment } = req.body;
    const eco = await ECO.findOne({ _id: req.params.id });

    if (!eco) {
      return res.status(404).json({ success: false, message: 'ECO not found' });
    }

    eco.approvalLogs.push({
      user: req.user.name,
      action: 'Rejected',
      timestamp: new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      comment
    });

    eco.stage = 'New';
    await eco.save();

    res.json({ success: true, data: eco });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject ECO' });
  }
});

// PATCH /api/ecos/:id/images — Update attached images
router.patch('/:id/images', authMiddleware, async (req, res) => {
  try {
    const { images } = req.body;
    const eco = await ECO.findOne({ _id: req.params.id });

    if (!eco) {
      return res.status(404).json({ success: false, message: 'ECO not found' });
    }

    eco.attachedImages = images || [];
    await eco.save();

    res.json({ success: true, data: eco });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update ECO images' });
  }
});

// PATCH /api/ecos/:id/images/review/:imageChangeId — Review image change
router.patch('/:id/images/review/:imageChangeId', authMiddleware, roleMiddleware(['Admin', 'Approver']), [
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map(e => e.msg).join(', ')
      });
    }

    const { status, comment } = req.body;
    const eco = await ECO.findOne({ _id: req.params.id });

    if (!eco) {
      return res.status(404).json({ success: false, message: 'ECO not found' });
    }

    const imageChange = eco.imageChanges.find(ic => ic.id === req.params.imageChangeId);
    if (!imageChange) {
      return res.status(404).json({ success: false, message: 'Image change not found' });
    }

    imageChange.reviewStatus = status;
    imageChange.reviewComment = comment || '';
    imageChange.reviewedBy = req.user.name;

    await eco.save();

    res.json({ success: true, data: eco });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to review image change' });
  }
});

module.exports = router;

