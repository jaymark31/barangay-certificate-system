const db = require('../config/db');

async function getRequestContext(requestId) {
    const result = await db.query(
        `
        SELECT r.id as "requestId",
               r.status as "status",
               r.form_data as "formData",
               r.created_at as "createdAt",
               u.id as "residentId",
               u.full_name as "residentFullName",
               u.email as "residentEmail",
               ct.name as "certificateTypeName"
        FROM requests r
        JOIN users u ON r.resident_id = u.id
        JOIN certificate_types ct ON r.certificate_type_id = ct.id
        WHERE r.id = $1
        `,
        [requestId]
    );
    return result.rows[0] || null;
}

function buildDefaultContent(ctx) {
    const date = new Date().toISOString().split('T')[0];
    const parsedFormData = (() => {
        const fd = ctx?.formData;
        if (!fd) return {};
        if (typeof fd === 'string') {
            try {
                return JSON.parse(fd) || {};
            } catch {
                return {};
            }
        }
        return fd || {};
    })();

    const purpose = parsedFormData.purpose || '';
    const formLines = Object.entries(parsedFormData)
        .filter(([k, v]) => k !== 'purpose' && v !== null && v !== undefined && String(v).trim())
        .map(([k, v]) => `${k}: ${v}`);

    return [
        'BARANGAY CERTIFICATE',
        '',
        `Date: ${date}`,
        '',
        `This is to certify that ${ctx.residentFullName} is a resident of the barangay.`,
        ctx.certificateTypeName ? `Certificate Type: ${ctx.certificateTypeName}` : '',
        purpose ? `Purpose: ${purpose}` : '',
        formLines.length ? '' : '',
        formLines.length ? 'Submitted Information:' : '',
        ...formLines,
        '',
        'This certificate is issued upon request and is valid for official purposes only.',
        '',
        '______________________________',
        'Authorized Signatory',
    ]
        .filter(Boolean)
        .join('\n');
}

async function getCertificateByRequestId(requestId) {
    const certRes = await db.query('SELECT id, request_id, content, created_at, updated_at FROM certificates WHERE request_id = $1', [requestId]);
    if (certRes.rows[0]) return { source: 'saved', certificate: certRes.rows[0] };

    const ctx = await getRequestContext(requestId);
    if (!ctx) return null;
    return { source: 'default', certificate: { request_id: requestId, content: buildDefaultContent(ctx) } };
}

async function upsertCertificateContent({ requestId, content, userId }) {
    const result = await db.query(
        `
        INSERT INTO certificates (request_id, content, created_by_id, updated_by_id)
        VALUES ($1, $2, $3, $3)
        ON CONFLICT (request_id)
        DO UPDATE SET content = EXCLUDED.content, updated_by_id = $3, updated_at = NOW()
        RETURNING id, request_id, content, created_at, updated_at
        `,
        [requestId, content, userId]
    );
    return result.rows[0];
}

module.exports = {
    getCertificateByRequestId,
    upsertCertificateContent,
    getRequestContext,
    buildDefaultContent,
};

