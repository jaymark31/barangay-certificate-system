const crypto = require('crypto');
const db = require('../config/db');

const SESSION_DAYS = 7;
const COOKIE_NAME = 'session_token';

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

async function createSession(userId) {
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
    await db.query(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [userId, token, expiresAt]
    );
    return { token, expiresAt };
}

async function getSessionByToken(token) {
    if (!token) return null;
    const result = await db.query(
        'SELECT s.id, s.user_id, s.expires_at FROM sessions s WHERE s.token = $1 AND s.expires_at > NOW()',
        [token]
    );
    return result.rows[0] || null;
}

async function deleteSessionByToken(token) {
    if (!token) return;
    await db.query('DELETE FROM sessions WHERE token = $1', [token]);
}

async function deleteExpiredSessions() {
    const result = await db.query('DELETE FROM sessions WHERE expires_at <= NOW()');
    return result.rowCount;
}

module.exports = {
    createSession,
    getSessionByToken,
    deleteSessionByToken,
    deleteExpiredSessions,
    COOKIE_NAME,
    SESSION_DAYS,
};
