const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true },
  productCount: { type: Number, default: 0 }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String, default: '' },
  icon: { type: String, default: '' },
  description: { type: String, default: '' },
  productCount: { type: Number, default: 0 },
  subcategories: [subcategorySchema]
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
