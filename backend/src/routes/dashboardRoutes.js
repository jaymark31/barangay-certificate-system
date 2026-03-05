const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, restrictTo('ADMIN'), dashboardController.getStats);

module.exports = router;
