const mongoose = require('mongoose');

const versionEntrySchema = new mongoose.Schema({
  version: { type: String },
  date: { type: Date, default: Date.now },
  changedBy: { type: String },
  ecoId: { type: String },
  summary: { type: String }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true
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
  category: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    min: 0
  },
  weight: {
    type: String
  },
  material: {
    type: String
  },
  bomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BOM',
    default: null
  },
  versions: [versionEntrySchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
