// ============================================
// NOT FOUND — 404 handler
// Koi bhi unknown route pe chalega
// ============================================
const notFound = (req, res, next) => {
    const error = new Error(`Not Found — ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

// ============================================
// ERROR HANDLER — Central error catcher
// Saare errors yahan aate hain
// ============================================
const errorHandler = (err, req, res, next) => {
    // Default status code
    let statusCode = err.statusCode || res.statusCode || 500;
    if (statusCode === 200) statusCode = 500;

    // Log internally (full details)
    console.error(`❌ [${new Date().toISOString()}] Error:`);
    console.error(`   URL: ${req.method} ${req.originalUrl}`);
    console.error(`   IP: ${req.ip}`);
    console.error(`   Status: ${statusCode}`);
    console.error(`   Message: ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
        console.error(`   Stack: ${err.stack}`);
    }

    // ---------- Mongoose Validation Error ----------
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(statusCode).json({
            success: false,
            message: messages.join(', '),
        });
    }

    // ---------- Mongoose Duplicate Key Error ----------
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        return res.status(statusCode).json({
            success: false,
            message: `Ye ${field} already exist karta hai`,
        });
    }

    // ---------- Mongoose Cast Error (invalid ObjectId) ----------
    if (err.name === 'CastError') {
        statusCode = 400;
        return res.status(statusCode).json({
            success: false,
            message: 'Invalid ID format',
        });
    }

    // ---------- JWT Errors ----------
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        return res.status(statusCode).json({
            success: false,
            message: 'Invalid token',
        });
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        return res.status(statusCode).json({
            success: false,
            message: 'Session expire ho gaya. Dobara login karein.',
        });
    }

    // ---------- Multer Errors ----------
    if (err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        return res.status(statusCode).json({
            success: false,
            message: 'File 5MB se badi hai',
        });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        statusCode = 400;
        return res.status(statusCode).json({
            success: false,
            message: 'Ek baar me max 10 files upload kar sakte hain',
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        statusCode = 400;
        return res.status(statusCode).json({
            success: false,
            message: 'Unexpected file field',
        });
    }

    // ---------- CORS Errors ----------
    if (err.message === 'Not allowed by CORS') {
        statusCode = 403;
        return res.status(statusCode).json({
            success: false,
            message: 'Access denied — CORS policy',
        });
    }

    // ---------- Final Response ----------
    const message =
        process.env.NODE_ENV === 'production' && statusCode === 500
            ? 'Something went wrong. Please try again.'
            : err.message || 'Server error';

    res.status(statusCode).json({
        success: false,
        message,
        // Stack sirf development me dikhao
        ...(process.env.NODE_ENV !== 'production' && {
            stack: err.stack,
        }),
    });
};

module.exports = { notFound, errorHandler };