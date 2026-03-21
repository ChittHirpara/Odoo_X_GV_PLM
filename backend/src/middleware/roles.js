/**
 * Role-Based Access Control Middleware
 * Factory function that returns middleware checking if user role is in allowedRoles.
 *
 * Usage: roleMiddleware(['Admin', 'Engineering User'])
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized for this action. Required: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
