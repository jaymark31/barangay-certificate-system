const requestService = require('../services/requestService');
const ApiError = require('../utils/errors');
const db = require('../config/db');

exports.createRequest = async (req, res, next) => {
    try {
        const residentId = req.user.id;
        const files = req.files || [];

        try {
            const request = await requestService.createRequest(residentId, req.body, files);
            res.status(201).json({
                status: 'success',
                data: { request },
            });
        } catch (err) {
            return next(new ApiError(400, err.message));
        }
    } catch (error) {
        next(error);
    }
};

exports.getMyRequests = async (req, res, next) => {
    try {
        const filters = { residentId: req.user.id };
        const pagination = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
        };

        const result = await requestService.getRequests(filters, pagination);
        res.status(200).json({
            status: 'success',
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllRequests = async (req, res, next) => {
    try {
        const filters = {
            status: req.query.status,
            certificateTypeId: req.query.certificateTypeId,
            search: req.query.search,
        };
        const pagination = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
        };

        const result = await requestService.getRequests(filters, pagination);
        res.status(200).json({
            status: 'success',
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

exports.getRequestById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            SELECT r.*, 
                   u.full_name as "residentFullName", u.email as "residentEmail", u.contact_number as "residentContact", u.address as "residentAddress",
                   ct.name as "certificateTypeName", ct.description as "certificateTypeDesc",
                   (SELECT json_agg(f) FROM uploaded_files f WHERE f.request_id = r.id) as files,
                   rb.full_name as "reviewedByName"
            FROM requests r
            JOIN users u ON r.resident_id = u.id
            JOIN certificate_types ct ON r.certificate_type_id = ct.id
            LEFT JOIN users rb ON r.reviewed_by_id = rb.id
            WHERE r.id = $1
        `, [id]);

        const request = result.rows[0];

        if (!request) {
            return next(new ApiError(404, 'Request not found'));
        }

        if (req.user.role !== 'ADMIN' && request.resident_id !== req.user.id) {
            return next(new ApiError(403, 'You are not authorized to view this request'));
        }

        res.status(200).json({
            status: 'success',
            data: { request }
        });
    } catch (error) {
        next(error);
    }
};

exports.approveRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;
        const reviewedById = req.user.id;

        const request = await requestService.updateRequestStatus(id, 'APPROVED', remarks, reviewedById);

        res.status(200).json({
            status: 'success',
            data: { request },
        });
    } catch (error) {
        next(error);
    }
};

exports.rejectRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;
        const reviewedById = req.user.id;

        const request = await requestService.updateRequestStatus(id, 'REJECTED', remarks, reviewedById);

        res.status(200).json({
            status: 'success',
            data: { request },
        });
    } catch (error) {
        next(error);
    }
};

exports.releaseRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;
        const reviewedById = req.user.id;

        const request = await requestService.updateRequestStatus(id, 'RELEASED', remarks, reviewedById);

        res.status(200).json({
            status: 'success',
            data: { request },
        });
    } catch (error) {
        next(error);
    }
};
