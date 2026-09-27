const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================
// PROTECT — Login verify karo
// ============================================
const protect = async (req, res, next) => {
    try {
        let token;

        // 1. Authorization header check
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }
        // 2. Cookie check (fallback)
        else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please login.',
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // User nikaalo (password hata ke)
        const user = await User.findById(decoded.userId || decoded.id).select(
            '-password'
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Auth error:', err.message);

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Session expire ho gaya. Dobara login karein.',
            });
        }

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Not authorized',
        });
    }
};

// ============================================
// ADMIN ONLY — Role check
// ============================================
const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized',
        });
    }

    if (req.user.role !== 'admin') {
        console.warn(
            `⚠️ Admin access denied for user: ${req.user.email} (role: ${req.user.role})`
        );
        return res.status(403).json({
            success: false,
            message: 'Admin access required',
        });
    }

    next();
};

module.exports = { protect, adminOnly };