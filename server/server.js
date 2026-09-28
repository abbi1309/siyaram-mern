require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');

const connectDB = require('./config/database');
const initializeRooms = require('./utils/initializeRooms');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// ⚠️ NAYA — Render reverse proxy ke peeche hai isliye ye zaroori hai
app.set('trust proxy', 1);

// ============================================
// 1. SECURITY HEADERS (Helmet)
// ============================================
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);

// ============================================
// LOGGING
// ============================================
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

// ============================================
// 2. CORS
// ============================================
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
];

if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.FRONTEND_URLS) {
    process.env.FRONTEND_URLS.split(',').forEach((url) => {
        const trimmed = url.trim();
        if (trimmed) allowedOrigins.push(trimmed);
    });
}

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.warn('❌ CORS blocked:', origin);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// ============================================
// 3. BODY PARSER
// ============================================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================
// 4. NOSQL INJECTION PREVENTION
// ============================================
app.use(mongoSanitize());

// ============================================
// 5. RATE LIMITING
// ============================================
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        success: false,
        message: 'Bahut zyada requests. 15 minute baad try karein.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Bahut zyada login attempts. 15 minute baad try karein.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const bookingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: 'Bahut zyada bookings. 1 ghante baad try karein.',
    },
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/bookings', bookingLimiter);

// ============================================
// 6. GALLERY FOLDER
// ============================================
const galleryDir = path.join(__dirname, 'public', 'uploads', 'gallery');
fs.mkdirSync(galleryDir, { recursive: true });

// ============================================
// 7. STATIC FILES
// ============================================
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// ============================================
// 8. DATABASE
// ============================================
connectDB();

// ============================================
// 9. ROUTES
// ============================================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Root
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Siyaram Palace API is running',
        version: '1.0.0',
    });
});

// ============================================
// 10. ERROR HANDLING
// ============================================
app.use(notFound);
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`\n🚀 Siyaram Palace Server running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`🔒 Security: Helmet + RateLimit + Sanitize\n`);
    console.log(`✅ Allowed origins:`, allowedOrigins);
    await initializeRooms();
});