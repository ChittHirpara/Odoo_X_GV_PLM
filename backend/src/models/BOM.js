const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  partNumber: { type: String },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: 'pcs' },
  cost: { type: Number, default: 0 }
}, { _id: false });

const operationSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  workCenter: { type: String },
  duration: { type: String }
}, { _id: false });

const bomSchema = new mongoose.Schema({
  _id: { type: String },
  name: {
    type: String,
    required: [true, 'BOM name is required'],
    trim: true
  },
  productId: {
    type: String,
    required: [true, 'Product reference is required']
  },
  productName: {
    type: String,
    default: ''
  },
  version: {
    type: String,
    required: true,
    default: '1.0'
  },
  status: {
    type: String,
    enum: ['Active', 'Archived', 'Draft'],
    default: 'Active'
  },
  components: [componentSchema],
  operations: [operationSchema]
}, {
  _id: false,
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

bomSchema.virtual('id').get(function() {
  return this._id;
});

bomSchema.index({ name: 'text' });

module.exports = mongoose.model('BOM', bomSchema);
