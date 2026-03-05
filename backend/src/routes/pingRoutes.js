const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/ping', async (req, res, next) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.status(200).json({ status: 'success', time: result.rows[0].now });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
