const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.put('/:itemKey', protect, updateCartItem);
router.delete('/clear', protect, clearCart);
router.delete('/:itemKey', protect, removeCartItem);

module.exports = router;
