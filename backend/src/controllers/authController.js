const bcrypt = require('bcrypt');
const db = require('../config/db');
const ApiError = require('../utils/errors');
const { createSession, deleteSessionByToken, COOKIE_NAME, SESSION_DAYS } = require('../services/sessionService');

function setSessionCookie(res, token) {
    const maxAge = SESSION_DAYS * 24 * 60 * 60 * 1000;
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
    });
}

function sendUserResponse(user, statusCode, res, message) {
    delete user.password;
    const body = { status: 'success', data: { user } };
    if (message) body.message = message;
    res.status(statusCode).json(body);
}

exports.register = async (req, res, next) => {
    try {
        const { fullName, email, password, contactNumber, address } = req.body;

        if (!fullName || !email || !password) {
            const msg = 'Please provide full name, email, and password.';
            console.error('[REGISTER] Validation failed:', msg);
            return next(new ApiError(400, msg));
        }

        const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            console.error('[REGISTER] Email already in use:', email);
            return next(new ApiError(400, 'Email already in use'));
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const result = await db.query(
            'INSERT INTO users (full_name, email, password, contact_number, address, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [fullName, email, hashedPassword, contactNumber || null, address || null, 'RESIDENT']
        );
        const user = result.rows[0];

        const { token } = await createSession(user.id);
        setSessionCookie(res, token);
        console.log('[REGISTER] User created:', user.email);
        sendUserResponse({ ...user }, 201, res, 'Registration successful');
    } catch (error) {
        console.error('[REGISTER ERROR]', error.message);
        console.error(error.stack);
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            console.error('[LOGIN] Validation failed: email and password required');
            return next(new ApiError(400, 'Please provide email and password!'));
        }

        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            console.error('[LOGIN] Failed for email:', email);
            return next(new ApiError(401, 'Incorrect email or password'));
        }

        const { token } = await createSession(user.id);
        setSessionCookie(res, token);
        console.log('[LOGIN] Success:', user.email);
        sendUserResponse({ ...user }, 200, res, 'Login successful');
    } catch (error) {
        console.error('[LOGIN ERROR]', error.message);
        console.error(error.stack);
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        const token = req.cookies?.[COOKIE_NAME];
        if (token) await deleteSessionByToken(token);
        res.clearCookie(COOKIE_NAME, { path: '/' });
        res.status(200).json({ status: 'success', message: 'Logged out' });
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
        const user = result.rows[0];
        delete user.password;
        res.status(200).json({ status: 'success', data: { user } });
    } catch (error) {
        next(error);
    }
};
