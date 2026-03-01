const { validationResult } = require('express-validator');

// Validate express-validator results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
        });
    }
    next();
};

// Global error handler
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);

    // PostgreSQL unique violation
    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            message: 'A record with this value already exists',
            detail: err.detail
        });
    }

    // PostgreSQL foreign key violation
    if (err.code === '23503') {
        return res.status(400).json({
            success: false,
            message: 'Referenced record does not exist',
            detail: err.detail
        });
    }

    // PostgreSQL check constraint violation
    if (err.code === '23514') {
        return res.status(400).json({
            success: false,
            message: 'Data validation failed',
            detail: err.detail
        });
    }

    // Custom app errors
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
};

// 404 handler
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
};

module.exports = { validate, errorHandler, notFound };