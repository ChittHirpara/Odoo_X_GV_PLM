const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['approval', 'review', 'info'],
    default: 'info'
  },
  ecoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ECO',
    default: null
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
