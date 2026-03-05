const db = require('../config/db');

exports.getStats = async (req, res, next) => {
    try {
        const totalRequestsResult = await db.query('SELECT COUNT(*) FROM requests');
        const pendingCountResult = await db.query("SELECT COUNT(*) FROM requests WHERE status = 'PENDING'");
        const approvedCountResult = await db.query("SELECT COUNT(*) FROM requests WHERE status = 'APPROVED'");
        const rejectedCountResult = await db.query("SELECT COUNT(*) FROM requests WHERE status = 'REJECTED'");
        const releasedCountResult = await db.query("SELECT COUNT(*) FROM requests WHERE status = 'RELEASED'");

        res.status(200).json({
            status: 'success',
            data: {
                totalRequests: parseInt(totalRequestsResult.rows[0].count),
                pendingCount: parseInt(pendingCountResult.rows[0].count),
                approvedCount: parseInt(approvedCountResult.rows[0].count),
                rejectedCount: parseInt(rejectedCountResult.rows[0].count),
                releasedCount: parseInt(releasedCountResult.rows[0].count),
            },
        });
    } catch (error) {
        next(error);
    }
};
