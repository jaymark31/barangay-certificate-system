const db = require('../config/db');
const ApiError = require('../utils/errors');

exports.getAllCertificateTypes = async (req, res, next) => {
    try {
        const result = await db.query(
            'SELECT id, name, description, required_fields as "requiredFields", template_content as "templateContent", template_fields as "templateFields", is_active as "isActive" FROM certificate_types WHERE is_active = TRUE ORDER BY name ASC'
        );

        res.status(200).json({
            status: 'success',
            results: result.rows.length,
            data: {
                certificateTypes: result.rows,
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.createCertificateType = async (req, res, next) => {
    try {
        const { name, description, requiredFields, templateContent = '', templateFields = [] } = req.body;

        const result = await db.query(
            'INSERT INTO certificate_types (name, description, required_fields, template_content, template_fields) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, description, required_fields as "requiredFields", template_content as "templateContent", template_fields as "templateFields", is_active as "isActive"',
            [name, description, JSON.stringify(requiredFields), templateContent, JSON.stringify(templateFields)]
        );

        res.status(201).json({
            status: 'success',
            data: {
                certificateType: result.rows[0],
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.updateCertificateType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, requiredFields, isActive, templateContent, templateFields } = req.body;

        const result = await db.query(
            'UPDATE certificate_types SET name = $1, description = $2, required_fields = $3, is_active = $4, template_content = COALESCE($5, template_content), template_fields = COALESCE($6, template_fields) WHERE id = $7 RETURNING id, name, description, required_fields as "requiredFields", template_content as "templateContent", template_fields as "templateFields", is_active as "isActive"',
            [name, description, JSON.stringify(requiredFields), isActive, templateContent, JSON.stringify(templateFields || []), id]
        );

        if (result.rows.length === 0) {
            return next(new ApiError(404, 'Certificate type not found'));
        }

        res.status(200).json({
            status: 'success',
            data: {
                certificateType: result.rows[0],
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteCertificateType = async (req, res, next) => {
    try {
        const { id } = req.params;

        const countResult = await db.query('SELECT COUNT(*) FROM requests WHERE certificate_type_id = $1', [id]);
        const hasRequests = parseInt(countResult.rows[0].count) > 0;

        if (hasRequests) {
            await db.query('UPDATE certificate_types SET is_active = FALSE WHERE id = $1', [id]);
            return res.status(200).json({
                status: 'success',
                message: 'Certificate type deactivated because it has associated requests.',
            });
        }

        const deleteResult = await db.query('DELETE FROM certificate_types WHERE id = $1 RETURNING id', [id]);
        if (deleteResult.rows.length === 0) {
            return next(new ApiError(404, 'Certificate type not found'));
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};
