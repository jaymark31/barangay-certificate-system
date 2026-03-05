const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Log incoming register requests in CMD (helps debug)
router.post('/register', (req, res, next) => {
    console.log('[REGISTER] Request received. Body keys:', req.body ? Object.keys(req.body) : 'none');
    next();
}, authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
