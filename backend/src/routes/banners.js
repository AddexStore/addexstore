const express = require('express');
const router = express.Router();
const { getBanners, getAllBanners, createBanner, updateBanner, deleteBanner, reorderBanners } = require('../controllers/bannerController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getBanners);
router.get('/all', protect, adminOnly, getAllBanners);
router.post('/', protect, adminOnly, createBanner);
router.put('/reorder', protect, adminOnly, reorderBanners);
router.put('/:id', protect, adminOnly, updateBanner);
router.delete('/:id', protect, adminOnly, deleteBanner);

module.exports = router;
