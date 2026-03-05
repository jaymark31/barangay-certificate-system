const ApiError = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Always log to CMD so you can see what went wrong
    console.error('\n--- [API ERROR] ---');
    console.error('Status:', err.statusCode, err.status);
    console.error('Message:', err.message);
    if (err.stack) console.error('Stack:', err.stack);
    console.error('---\n');

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    } else {
        // Production mode
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Something went very wrong!',
            });
        }
    }
};

module.exports = errorHandler;
