const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['order_confirmation', 'shipping_update', 'delivery_confirmation', 'processing_update', 'cancellation', 'promotion', 'review_request', 'system'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
