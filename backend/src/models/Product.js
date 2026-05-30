const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  subCategory: { type: String, default: '' },
  brand: { type: String, default: '' },
  image: { type: String, default: '' },
  images: [{ type: String }],
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discountPercentage: { type: Number, default: null },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  description: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  colors: [{ type: String }],
  sizes: [{ type: String }],
  featured: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  sku: { type: String, unique: true }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', category: 1, subCategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
