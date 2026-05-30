const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'AddexStores' },
  siteDescription: { type: String, default: 'Premium lifestyle store for everyone' },
  supportEmail: { type: String, default: 'support@addexstores.com' },
  supportPhone: { type: String, default: '+91 1800-123-4567' },
  address: { type: String, default: '123, Fashion Street, Mumbai - 400001, India' },
  currency: { type: String, default: 'INR' },
  shipping: {
    freeShippingMin: { type: Number, default: 999 },
    standardRate: { type: Number, default: 99 },
    expressRate: { type: Number, default: 199 },
    shippingZones: [{ type: String }]
  },
  payment: {
    methods: [{ type: String }],
    codEnabled: { type: Boolean, default: true },
    upiEnabled: { type: Boolean, default: true },
    cardEnabled: { type: Boolean, default: true }
  },
  social: {
    facebook: { type: String, default: '#' },
    instagram: { type: String, default: '#' },
    twitter: { type: String, default: '#' },
    youtube: { type: String, default: '#' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
