const db = require('../config/db');
const ApiError = require('../utils/errors');

exports.getResidents = async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT id, full_name, email, contact_number, address, created_at
             FROM users
             WHERE role = 'RESIDENT'
             ORDER BY created_at DESC`
        );
        const users = result.rows.map((row) => {
            const u = { ...row };
            u.full_name = u.full_name ?? '';
            u.contact_number = u.contact_number ?? '';
            u.address = u.address ?? '';
            return u;
        });
        res.status(200).json({
            status: 'success',
            data: { users },
        });
    } catch (error) {
        next(error);
    }
};
