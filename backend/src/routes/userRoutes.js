const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, restrictTo('ADMIN'), userController.getResidents);

module.exports = router;
