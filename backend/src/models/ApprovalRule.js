const mongoose = require('mongoose');

const approvalRuleSchema = new mongoose.Schema({
  _id: { type: String },
  name: {
    type: String,
    required: [true, 'Rule name is required'],
    trim: true
  },
  conditions: {
    type: String,
    required: [true, 'Conditions are required']
  },
  stage: {
    type: String,
    required: true
  },
  requiredRole: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  _id: false,
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

approvalRuleSchema.virtual('id').get(function() {
  return this._id;
});

module.exports = mongoose.model('ApprovalRule', approvalRuleSchema);
