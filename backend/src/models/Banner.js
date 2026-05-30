const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  cta: { type: String, default: 'Shop Now' },
  ctaLink: { type: String, default: '/products' },
  bgColor: { type: String, default: '#F5F2ED' },
  image: { type: String, default: '' },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
