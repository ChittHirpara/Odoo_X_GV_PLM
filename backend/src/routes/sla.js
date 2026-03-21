const express = require('express');
const ECO = require('../models/ECO');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const SLA_THRESHOLDS = {
  'New':       { warn: 24 * 3600000, escalate: 48 * 3600000 },
  'In Review': { warn: 12 * 3600000, escalate: 24 * 3600000 },
  'Approval':  { warn: 8 * 3600000,  escalate: 16 * 3600000 },
};

// GET /api/ecos/sla/status
router.get('/sla/status', authMiddleware, async (req, res) => {
  try {
    const ecos = await ECO.find({
      stage: { $nin: ['Done', 'Rejected'] }
    }).select('_id id ecoNumber title stage stageEnteredAt slaEscalated approvalLogs');

    const slaData = ecos.map(eco => {
      // Fallback: if stageEnteredAt missing, use last log timestamp or Date.now()
      let enteredAt = eco.stageEnteredAt ? new Date(eco.stageEnteredAt) : null;
      if (!enteredAt && eco.approvalLogs && eco.approvalLogs.length > 0) {
         enteredAt = new Date(eco.approvalLogs[eco.approvalLogs.length - 1].timestamp);
      }
      if (!enteredAt) enteredAt = new Date();

      const timeInStageMs = Date.now() - enteredAt.getTime();
      const thresholds = SLA_THRESHOLDS[eco.stage] || { warn: Infinity, escalate: Infinity };
      
      let status = 'OK';
      if (timeInStageMs >= thresholds.escalate) status = 'CRITICAL';
      else if (timeInStageMs >= thresholds.warn) status = 'WARNING';

      const formatTime = (ms) => {
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        if (h > 48) return `${Math.floor(h/24)}d ${h%24}h`;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
      };

      const percentageVal = Math.min((timeInStageMs / thresholds.escalate) * 100, 150);

      return {
        ecoId: eco._id,
        ecoNumber: eco.ecoNumber,
        title: eco.title,
        stage: eco.stage,
        timeInStage: timeInStageMs,
        timeInStageHuman: formatTime(timeInStageMs),
        slaStatus: status,
        warnThreshold: thresholds.warn,
        escalateThreshold: thresholds.escalate,
        percentageUsed: percentageVal,
        enteredAt: enteredAt.toISOString(),
        escalationDue: new Date(enteredAt.getTime() + thresholds.escalate).toISOString()
      };
    });

    res.json({ success: true, data: slaData });
  } catch (error) {
    console.error('Error fetching SLA status:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch SLA data' });
  }
});

module.exports = router;
