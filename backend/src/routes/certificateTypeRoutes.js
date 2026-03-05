const express = require('express');
const certificateTypeController = require('../controllers/certificateTypeController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router
    .route('/')
    .get(certificateTypeController.getAllCertificateTypes)
    .post(protect, restrictTo('ADMIN'), certificateTypeController.createCertificateType);

router
    .route('/:id')
    .put(protect, restrictTo('ADMIN'), certificateTypeController.updateCertificateType)
    .delete(protect, restrictTo('ADMIN'), certificateTypeController.deleteCertificateType);

module.exports = router;
