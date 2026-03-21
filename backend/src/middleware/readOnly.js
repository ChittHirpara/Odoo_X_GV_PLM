const dbHealth = require('../utils/dbHealth');

/**
 * Middleware to block write operations when the database is unhealthy
 */
function readOnlyMiddleware(req, res, next) {
  const isHealthy = dbHealth.getStatus();
  const isWriteOp = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

  if (!isHealthy && isWriteOp) {
    return res.status(503).json({
      success: false,
      fallback: true,
      message: 'System is currently in READ-ONLY mode due to maintenance or connection issues. Please try again later.'
    });
  }

  next();
}

module.exports = readOnlyMiddleware;
