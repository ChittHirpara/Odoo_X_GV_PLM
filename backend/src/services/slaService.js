const ECO = require('../models/ECO');

const SLA_THRESHOLDS = {
  'New':       { escalate: 48 * 3600000 },
  'In Review': { escalate: 24 * 3600000 },
  'Approval':  { escalate: 16 * 3600000 },
};

let slaInterval = null;

async function checkSLA() {
  try {
    const ecos = await ECO.find({
      stage: { $nin: ['Done', 'Rejected'] },
      slaEscalated: false
    });

    const now = Date.now();
    for (const eco of ecos) {
      if (!eco.stageEnteredAt) continue;

      const timeInStage = now - new Date(eco.stageEnteredAt).getTime();
      const threshold = SLA_THRESHOLDS[eco.stage];

      if (threshold && timeInStage >= threshold.escalate) {
        console.log(`[SLA ESCALATION] 🚨 SLA Breach — ECO ${eco.ecoNumber} has been in ${eco.stage} stage for too long!`);
        // In a real application, trigger an email service here.
        eco.slaEscalated = true;
        await eco.save();
      }
    }
  } catch (err) {
    console.error('[SLA Monitor] Error running check:', err);
  }
}

function startSLAMonitor() {
  if (slaInterval) clearInterval(slaInterval);
  console.log('[SLA Monitor] Started (checking every 15 minutes)');
  // check every 15 minutes (900000 ms)
  slaInterval = setInterval(checkSLA, 900000);
  // initial check
  setTimeout(checkSLA, 5000);
}

module.exports = { startSLAMonitor };
