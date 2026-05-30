const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = { userId: req.user._id, items: [] };
    }
    res.json({ cart: cart.items || [] });
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size = '', color = '' } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const compositeKey = `${productId}-${size}-${color}`;
    const existingIndex = cart.items.findIndex(item =>
      item.productId.toString() === productId &&
      item.size === size &&
      item.color === color
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        price: product.discountPercentage
          ? product.price - (product.price * product.discountPercentage) / 100
          : product.price,
        originalPrice: product.originalPrice || product.price,
        image: product.image,
        quantity,
        size,
        color,
        stock: product.stock
      });
    }

    await cart.save();
    res.json({ cart: cart.items });
  } catch (error) {
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const [productId, size, color] = req.params.itemKey.split('-');
    const item = cart.items.find(item =>
      item.productId.toString() === productId &&
      item.size === (size || '') &&
      item.color === (color || '')
    );

    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.quantity = quantity;
    await cart.save();
    res.json({ cart: cart.items });
  } catch (error) {
    next(error);
  }
};

exports.removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const [productId, size, color] = req.params.itemKey.split('-');
    cart.items = cart.items.filter(item =>
      !(item.productId.toString() === productId &&
        item.size === (size || '') &&
        item.color === (color || ''))
    );

    await cart.save();
    res.json({ cart: cart.items });
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ cart: [] });
  } catch (error) {
    next(error);
  }
};
