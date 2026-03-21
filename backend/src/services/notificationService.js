const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Create a single notification
 */
const createNotification = async ({ userId, title, type = 'info', ecoId = null }) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      type,
      ecoId,
      read: false
    });

    console.log(`[Notification] Created for user ${userId}: "${title}"`);
    return notification;
  } catch (error) {
    console.error('[Notification] Error creating notification:', error.message);
    throw error;
  }
};

/**
 * Notify all users with a specific role
 */
const notifyUsersByRole = async (role, title, type = 'info', ecoId = null) => {
  try {
    const users = await User.find({ role });
    const notifications = [];

    for (const user of users) {
      const notification = await createNotification({
        userId: user._id,
        title,
        type,
        ecoId
      });
      notifications.push(notification);
    }

    console.log(`[Notification] Notified ${notifications.length} ${role}(s): "${title}"`);
    return notifications;
  } catch (error) {
    console.error('[Notification] Error notifying by role:', error.message);
    throw error;
  }
};

/**
 * Notify all Approvers when an ECO reaches Approval stage
 */
const notifyApprovers = async (eco) => {
  return notifyUsersByRole(
    'Approver',
    `ECO "${eco.title}" is ready for your approval`,
    'approval',
    eco._id
  );
};

/**
 * Notify ECO creator when ECO is rejected
 */
const notifyRejection = async (eco, rejectedBy, comment) => {
  if (!eco.createdBy) return null;

  return createNotification({
    userId: eco.createdBy,
    title: `ECO "${eco.title}" was rejected by ${rejectedBy}: ${comment}`,
    type: 'review',
    ecoId: eco._id
  });
};

module.exports = {
  createNotification,
  notifyUsersByRole,
  notifyApprovers,
  notifyRejection
};
