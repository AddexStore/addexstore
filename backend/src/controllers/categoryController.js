const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ category });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, image } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = await Category.create({ name, slug, description, icon, image });
    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.name) {
      updates.slug = updates.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ category });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await Product.updateMany({ category: category.name }, { $set: { category: 'Uncategorized' } });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

exports.createSubcategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const { name } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    category.subcategories.push({ name, slug });
    await category.save();
    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
};

exports.updateSubcategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.catId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const sub = category.subcategories.id(req.params.subId);
    if (!sub) return res.status(404).json({ message: 'Subcategory not found' });

    const { name } = req.body;
    sub.name = name;
    sub.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await category.save();
    res.json({ category });
  } catch (error) {
    next(error);
  }
};

exports.deleteSubcategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.catId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.subcategories.pull(req.params.subId);
    await category.save();
    res.json({ category });
  } catch (error) {
    next(error);
  }
};
