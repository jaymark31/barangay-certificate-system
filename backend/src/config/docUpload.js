const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/errors');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowedMime = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMime.includes(file.mimetype) || ext === '.docx') {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Invalid file type. Only DOCX is allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});

module.exports = upload;

