const mongoose = require('mongoose');

const changeSchema = new mongoose.Schema({
  field: { type: String },
  oldValue: { type: String },
  newValue: { type: String },
  type: {
    type: String,
    enum: ['modified', 'added', 'removed'],
    default: 'modified'
  }
}, { _id: false });

const imageRefSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String },
  url: { type: String },
  category: { type: String }
}, { _id: false });

const attachedImageSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String },
  url: { type: String },
  category: { type: String },
  uploadedAt: { type: String },
  status: { type: String, default: 'pending' },
  size: { type: Number },
  type: { type: String }
}, { _id: false });

const approvalLogSchema = new mongoose.Schema({
  user: { type: String },
  action: { type: String },
  timestamp: { type: String },
  comment: { type: String }
}, { _id: false });

const imageChangeSchema = new mongoose.Schema({
  id: { type: String },
  label: { type: String },
  changeType: { type: String },
  oldImage: { type: imageRefSchema, default: null },
  newImage: { type: imageRefSchema, default: null },
  reviewStatus: {
    type: String,
    enum: ['approved', 'rejected', null],
    default: null
  },
  reviewComment: { type: String, default: null },
  reviewedBy: { type: String, default: null }
}, { _id: false });

const ecoSchema = new mongoose.Schema({
  _id: { type: String },
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
    type: String,
    required: [true, 'Product reference is required']
  },
  productName: {
    type: String,
    default: ''
  },
  bomId: {
    type: String,
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
    type: String
  },
  createdByName: {
    type: String,
    default: ''
  },
  createdAt: {
    type: String
  },
  effectiveDate: {
    type: String,
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
  attachedImages: [attachedImageSchema],
  imageChanges: [imageChangeSchema],
  approvalLogs: [approvalLogSchema],
  stageEnteredAt: { type: Date, default: Date.now },
  slaEscalated: { type: Boolean, default: false }
}, {
  _id: false,
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ecoSchema.virtual('id').get(function() {
  return this._id;
});

ecoSchema.index({ title: 'text', ecoNumber: 'text', description: 'text' });

module.exports = mongoose.model('ECO', ecoSchema);
