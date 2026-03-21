const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async ({ title, type = 'info', ecoId = null }) => {
  try {
    const notification = await Notification.create({
      id: `n${Date.now()}`,
      title,
      type,
      ecoId,
      read: false,
      timestamp: new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    });
    return notification;
  } catch (error) {
    throw error;
  }
};

const notifyApprovers = async (eco) => {
  return createNotification({
    title: `ECO "${eco.title}" (${eco.ecoNumber}) is ready for your approval`,
    type: 'approval',
    ecoId: eco.id
  });
};

const notifyRejection = async (eco, rejectedBy, comment) => {
  return createNotification({
    title: `ECO "${eco.title}" was rejected by ${rejectedBy}: ${comment}`,
    type: 'review',
    ecoId: eco.id
  });
};

module.exports = {
  createNotification,
  notifyApprovers,
  notifyRejection
};

