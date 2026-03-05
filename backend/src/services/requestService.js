const db = require('../config/db');

exports.createRequest = async (residentId, data, files) => {
    const { certificateTypeId, formData } = data;

    const existingPending = await db.query(
        'SELECT id FROM requests WHERE resident_id = $1 AND certificate_type_id = $2 AND status = $3',
        [residentId, certificateTypeId, 'PENDING']
    );

    if (existingPending.rows.length > 0) {
        throw new Error('You already have a pending request for this certificate type.');
    }

    // Start a transaction
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        const requestResult = await client.query(
            'INSERT INTO requests (resident_id, certificate_type_id, form_data) VALUES ($1, $2, $3) RETURNING *',
            [residentId, certificateTypeId, typeof formData === 'string' ? formData : JSON.stringify(formData)]
        );

        const request = requestResult.rows[0];

        if (files && files.length > 0) {
            for (const file of files) {
                await client.query(
                    'INSERT INTO uploaded_files (request_id, file_path, file_name) VALUES ($1, $2, $3)',
                    [request.id, file.path, file.originalname]
                );
            }
        }

        await client.query('COMMIT');
        return request;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

exports.getRequests = async (filters, pagination) => {
    const { status, certificateTypeId, search, residentId } = filters;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = `
    SELECT r.*, 
           u.full_name as "residentFullName", u.email as "residentEmail", 
           ct.name as "certificateTypeName"
    FROM requests r
    JOIN users u ON r.resident_id = u.id
    JOIN certificate_types ct ON r.certificate_type_id = ct.id
    WHERE 1=1
  `;
    const params = [];

    if (status) {
        params.push(status);
        query += ` AND r.status = $${params.length}`;
    }
    if (certificateTypeId) {
        params.push(certificateTypeId);
        query += ` AND r.certificate_type_id = $${params.length}`;
    }
    if (residentId) {
        params.push(residentId);
        query += ` AND r.resident_id = $${params.length}`;
    }
    if (search) {
        params.push(`%${search}%`);
        query += ` AND u.full_name ILIKE $${params.length}`;
    }

    const countQuery = query.replace('SELECT r.*, u.full_name as "residentFullName", u.email as "residentEmail", ct.name as "certificateTypeName"', 'SELECT COUNT(*)');

    query += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [resRows, countRes] = await Promise.all([
        db.query(query, params),
        db.query(countQuery, params.slice(0, -2))
    ]);

    return {
        requests: resRows.rows,
        total: parseInt(countRes.rows[0].count),
        pages: Math.ceil(parseInt(countRes.rows[0].count) / limit)
    };
};

exports.updateRequestStatus = async (id, status, remarks, reviewedById) => {
    const result = await db.query(
        'UPDATE requests SET status = $1, remarks = $2, reviewed_by_id = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
        [status, remarks, reviewedById, id]
    );
    return result.rows[0];
};
