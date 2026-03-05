const express = require('express');
const requestController = require('../controllers/requestController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

const router = express.Router();

router.use(protect); // All request routes are protected

// Resident & Admin shared/specific
router
    .route('/')
    .post(restrictTo('RESIDENT'), upload.array('files', 5), requestController.createRequest)
    .get(restrictTo('ADMIN'), requestController.getAllRequests);

router.get('/my-requests', restrictTo('RESIDENT'), requestController.getMyRequests);

router.get('/:id', requestController.getRequestById);

// Admin only status updates
router.put('/:id/approve', restrictTo('ADMIN'), requestController.approveRequest);
router.put('/:id/reject', restrictTo('ADMIN'), requestController.rejectRequest);
router.put('/:id/release', restrictTo('ADMIN'), requestController.releaseRequest);

module.exports = router;
