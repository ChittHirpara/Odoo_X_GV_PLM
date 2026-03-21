const mongoose = require('mongoose');

const changeSchema = new mongoose.Schema({
  fieldName: { type: String },
  oldValue: { type: String },
  newValue: { type: String },
  changeType: {
    type: String,
    enum: ['modified', 'added', 'removed'],
    default: 'modified'
  }
}, { _id: false });

const approvalLogSchema = new mongoose.Schema({
  userName: { type: String },
  action: { type: String },
  timestamp: { type: Date, default: Date.now },
  comment: { type: String }
}, { _id: false });

const imageChangeSchema = new mongoose.Schema({
  id: { type: String },
  label: { type: String },
  changeType: { type: String },
  oldImageUrl: { type: String },
  newImageUrl: { type: String },
  reviewStatus: {
    type: String,
    enum: ['approved', 'rejected', null],
    default: null
  },
  reviewComment: { type: String },
  reviewedBy: { type: String }
}, { _id: false });

const ecoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'ECO title is required'],
    trim: true
  },
  ecoNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  type: {
    type: String,
    enum: ['Product', 'BoM'],
    required: [true, 'ECO type is required']
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  bomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BOM',
    default: null
  },
  stage: {
    type: String,
    enum: ['New', 'In Review', 'Approval', 'Done', 'Rejected'],
    default: 'New'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  effectiveDate: {
    type: Date,
    default: null
  },
  versionUpdate: {
    type: Boolean,
    default: false
  },
  newVersion: {
    type: String,
    default: null
  },
  description: {
    type: String,
    trim: true
  },
  changes: [changeSchema],
  approvalLogs: [approvalLogSchema],
  imageChanges: [imageChangeSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('ECO', ecoSchema);
