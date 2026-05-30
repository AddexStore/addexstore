const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

const generateOrderId = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${num}`;
};

exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.name}`
        });
      }
    }

    const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      orderId: generateOrderId(),
      userId: req.user._id,
      items: cart.items.map(item => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      })),
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes
    });

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    cart.items = [];
    await cart.save();

    await Notification.create({
      userId: req.user._id,
      type: 'order_confirmation',
      title: 'Order Confirmed',
      message: `Your order ${order.orderId} has been placed successfully. Total: ₹${totalAmount.toFixed(2)}`
    });

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const typeMap = {
      Processing: 'processing_update',
      Shipped: 'shipping_update',
      Delivered: 'delivery_confirmation',
      Cancelled: 'cancellation'
    };

    await Notification.create({
      userId: order.userId,
      type: typeMap[status] || 'system',
      title: `Order ${status}`,
      message: `Your order ${order.orderId} has been updated to ${status}.`
    });

    res.json({ order });
  } catch (error) {
    next(error);
  }
};
