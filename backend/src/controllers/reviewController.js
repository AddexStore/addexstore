const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getReviews = async (req, res, next) => {
  try {
    const { productId } = req.query;
    if (!productId) return res.status(400).json({ message: 'productId is required' });

    const reviews = await Review.find({ productId, status: 'Approved' }).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (error) {
    next(error);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, text } = req.body;

    const existing = await Review.findOne({ productId, userId: req.user._id });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this product' });

    const hasOrdered = await Order.findOne({
      userId: req.user._id,
      'items.productId': productId,
      status: 'Delivered'
    });

    const review = await Review.create({
      productId,
      userId: req.user._id,
      user: req.user.name,
      rating,
      text,
      verified: !!hasOrdered,
      status: 'Approved'
    });

    const stats = await Review.aggregate([
      { $match: { productId: review.productId, status: 'Approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        totalReviews: stats[0].count
      });
    } else {
      await Product.findByIdAndUpdate(productId, { rating, totalReviews: 1 });
    }

    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
};

exports.moderateReview = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });

    res.json({ review });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getAllReviews = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const reviews = await Review.find(filter).populate('productId', 'name image').sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (error) {
    next(error);
  }
};
