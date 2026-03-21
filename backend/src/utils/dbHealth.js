const pool = require('../config/database');

let isDbHealthy = true;
let healthCheckInterval = null;

const checkHealth = async () => {
  try {
    const { query } = require('../config/database');
    await query('SELECT 1');
    if (!isDbHealthy) {
      console.log('[HEALTH] ✓ Database connection restored. Resuming normal operations.');
      isDbHealthy = true;
    }
  } catch (err) {
    if (isDbHealthy) {
      console.error('[HEALTH] ✗ Database connection lost. Switching to READ-ONLY FALLBACK.');
      isDbHealthy = false;
    }
  }
};

const startHealthCheck = (intervalMs = 15000) => {
  if (healthCheckInterval) clearInterval(healthCheckInterval);
  healthCheckInterval = setInterval(checkHealth, intervalMs);
  // Run once immediately
  checkHealth();
};

const getStatus = () => isDbHealthy;
const setHealthy = (status) => { isDbHealthy = status; };

module.exports = {
  startHealthCheck,
  getStatus,
  setHealthy
};
