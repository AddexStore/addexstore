const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) wishlist = { items: [] };
    res.json({ wishlist: wishlist.items || [] });
  } catch (error) {
    next(error);
  }
};

exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: req.user._id, items: [] });
    }

    if (wishlist.items.some(item => item.productId.toString() === productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    wishlist.items.push({
      productId: product._id,
      name: product.name,
      price: product.discountPercentage
        ? product.price - (product.price * product.discountPercentage) / 100
        : product.price,
      originalPrice: product.originalPrice || product.price,
      image: product.image,
      brand: product.brand,
      addedAt: Date.now()
    });

    await wishlist.save();
    res.json({ wishlist: wishlist.items });
  } catch (error) {
    next(error);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    wishlist.items = wishlist.items.filter(item => item.productId.toString() !== req.params.productId);
    await wishlist.save();
    res.json({ wishlist: wishlist.items });
  } catch (error) {
    next(error);
  }
};
