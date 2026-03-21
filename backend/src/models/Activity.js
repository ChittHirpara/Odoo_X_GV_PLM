const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  _id: { type: String },
  type: {
    type: String,
    enum: ['eco_created', 'eco_submitted', 'eco_approved', 'product_updated'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  timestamp: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  ecoId: {
    type: String,
    default: null
  }
}, {
  _id: false,
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

activitySchema.virtual('id').get(function() {
  return this._id;
});

module.exports = mongoose.model('Activity', activitySchema);
