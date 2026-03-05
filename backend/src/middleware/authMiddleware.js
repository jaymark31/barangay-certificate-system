const db = require('../config/db');
const ApiError = require('../utils/errors');
const { getSessionByToken, COOKIE_NAME } = require('../services/sessionService');

const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.[COOKIE_NAME];

        if (!token) {
            return next(new ApiError(401, 'You are not logged in! Please log in to get access.'));
        }

        const session = await getSessionByToken(token);
        if (!session) {
            return next(new ApiError(401, 'Invalid or expired session. Please log in again.'));
        }

        const result = await db.query('SELECT * FROM users WHERE id = $1', [session.user_id]);
        const currentUser = result.rows[0];

        if (!currentUser) {
            return next(new ApiError(401, 'The user for this session no longer exists.'));
        }

        req.user = currentUser;
        next();
    } catch (error) {
        next(new ApiError(401, 'Invalid session. Please log in again.'));
    }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, 'You do not have permission to perform this action'));
        }
        next();
    };
};

module.exports = { protect, restrictTo };
