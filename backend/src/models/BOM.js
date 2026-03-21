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
  name: {
    type: String,
    required: [true, 'BOM name is required'],
    trim: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  version: {
    type: String,
    required: true,
    default: 'v1'
  },
  status: {
    type: String,
    enum: ['Active', 'Archived'],
    default: 'Active'
  },
  components: [componentSchema],
  operations: [operationSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('BOM', bomSchema);
