const express = require('express');
const router = express.Router();
const {
  getCategories, getCategory, createCategory, updateCategory, deleteCategory,
  createSubcategory, updateSubcategory, deleteSubcategory
} = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getCategories);
router.get('/:slug', getCategory);
router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);
router.post('/:id/subcategories', protect, adminOnly, createSubcategory);
router.put('/:catId/subcategories/:subId', protect, adminOnly, updateSubcategory);
router.delete('/:catId/subcategories/:subId', protect, adminOnly, deleteSubcategory);

module.exports = router;
