const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String },
  url: { type: String },
  category: { type: String },
  status: { type: String, default: 'approved' }
}, { _id: false });

const versionEntrySchema = new mongoose.Schema({
  version: { type: String },
  date: { type: String },
  changedBy: { type: String },
  eco: { type: String, default: null },
  summary: { type: String }
}, { _id: false });

const productSchema = new mongoose.Schema({
  _id: { type: String },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true
  },
  version: {
    type: String,
    required: true,
    default: '1.0'
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
  createdAt: {
    type: String
  },
  updatedAt: {
    type: String
  },
  images: [imageSchema],
  versions: [versionEntrySchema],
  bomId: {
    type: String,
    default: null
  }
}, {
  _id: false,
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.virtual('id').get(function() {
  return this._id;
});

module.exports = mongoose.model('Product', productSchema);
