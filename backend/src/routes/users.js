const express = require('express');
const router = express.Router();
const { getUsers, getUser, toggleBlockUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getUsers);
router.get('/:id', protect, adminOnly, getUser);
router.put('/:id/block', protect, adminOnly, toggleBlockUser);

module.exports = router;
