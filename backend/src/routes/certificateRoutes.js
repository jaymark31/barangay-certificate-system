const express = require('express');
const certificateController = require('../controllers/certificateController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const docUpload = require('../config/docUpload');

const router = express.Router();

router.use(protect);

// Admin can view/edit/download certificates
router.get('/request/:requestId', restrictTo('ADMIN'), certificateController.getByRequestId);
router.put('/request/:requestId', restrictTo('ADMIN'), certificateController.updateByRequestId);
router.get('/request/:requestId/download', restrictTo('ADMIN'), certificateController.downloadPdfByRequestId);
router.get('/request/:requestId/download-docx', restrictTo('ADMIN'), certificateController.downloadDocxByRequestId);
router.post('/request/:requestId/upload-docx', restrictTo('ADMIN'), docUpload.single('file'), certificateController.uploadDocxByRequestId);

module.exports = router;

