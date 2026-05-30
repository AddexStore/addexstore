const Banner = require('../models/Banner');

exports.getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ active: true }).sort({ order: 1 });
    res.json({ banners });
  } catch (error) {
    next(error);
  }
};

exports.getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json({ banners });
  } catch (error) {
    next(error);
  }
};

exports.createBanner = async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ banner });
  } catch (error) {
    next(error);
  }
};

exports.updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json({ banner });
  } catch (error) {
    next(error);
  }
};

exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    next(error);
  }
};

exports.reorderBanners = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) return res.status(400).json({ message: 'orderedIds array required' });

    for (let i = 0; i < orderedIds.length; i++) {
      await Banner.findByIdAndUpdate(orderedIds[i], { order: i });
    }

    const banners = await Banner.find().sort({ order: 1 });
    res.json({ banners });
  } catch (error) {
    next(error);
  }
};
