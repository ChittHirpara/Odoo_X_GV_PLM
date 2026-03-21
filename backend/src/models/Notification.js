const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  _id: { type: String },
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
    type: String,
    default: null
  },
  read: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: String
  }
}, {
  _id: false,
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

notificationSchema.virtual('id').get(function() {
  return this._id;
});

module.exports = mongoose.model('Notification', notificationSchema);
