// ============================================
// SERVER ENTRY POINT
// Siyaram Palace — Main Server File
// Isme: Config, Middleware, Routes, Server Start
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');

// -------- Custom Imports --------
const connectDB = require('./config/database');
const initializeRooms = require('./utils/initializeRooms');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// -------- App Initialize --------
const app = express();

// ============================================
// 0. TRUST PROXY
// Render/Heroku reverse proxy ke peeche hai
// Iske bina rate-limit galat IP track karta hai
// ============================================
app.set('trust proxy', 1);


// ============================================
// 1. SECURITY HEADERS (Helmet)
// XSS, clickjacking, MIME sniffing se bachata hai
// crossOriginResourcePolicy: images ke liye zaroori
// ============================================
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);


// ============================================
// 2. LOGGING
// Production me detailed, dev me short
// ============================================
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));   // Full detailed logs
} else {
    app.use(morgan('dev'));        // Colorful short logs
}


// ============================================
// 3. CORS CONFIG
// Kaunse frontend URLs allowed hain
// Local dev + production URLs dono
// ============================================
const allowedOrigins = [
    'http://localhost:5173',        // Vite default
    'http://localhost:3000',        // CRA default
];

// Production frontend URL (Render environment variable se)
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

// Multiple URLs (comma separated) — optional
if (process.env.FRONTEND_URLS) {
    process.env.FRONTEND_URLS.split(',').forEach((url) => {
        const trimmed = url.trim();
        if (trimmed) allowedOrigins.push(trimmed);
    });
}

app.use(
    cors({
        origin: (origin, callback) => {
            // Postman/curl jaise requests (origin undefined)
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
// 4. BODY PARSER
// JSON aur URL-encoded data parse karta hai
// 10kb limit — DoS attack se bachata hai
// ============================================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));


// ============================================
// 5. NOSQL INJECTION PREVENTION
// MongoDB me `$` aur `.` operators block karta hai
// ============================================
app.use(mongoSanitize());


// ============================================
// 6. RATE LIMITING
// Har IP ke liye request limit
// ============================================

// General API — 15 min me 200 requests
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

// Login/Register — strict, 15 min me 10 attempts
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

// Booking create — 1 ghante me 20 bookings
const bookingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: 'Bahut zyada bookings. 1 ghante baad try karein.',
    },
});

// Limiters apply karo
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/bookings', bookingLimiter);


// ============================================
// 7. GALLERY FOLDER AUTO-CREATE
// Uploads folder nahi hai to banao
// ============================================
const galleryDir = path.join(__dirname, 'public', 'uploads', 'gallery');
fs.mkdirSync(galleryDir, { recursive: true });


// ============================================
// 8. STATIC FILES
// Uploaded images aur static images serve karo
// ============================================
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));


// ============================================
// 9. DATABASE CONNECT
// MongoDB se connect karo
// ============================================
connectDB();


// ============================================
// 10. ROUTES
// Har module ke apne routes hain
// Naya route add karna ho to yahan likho
// ============================================
app.use('/api/auth', require('./routes/authRoutes'));                // Login/Register/OTP
app.use('/api/rooms', require('./routes/roomRoutes'));                // Rooms CRUD
app.use('/api/bookings', require('./routes/bookingRoutes'));          // Bookings
app.use('/api/reviews', require('./routes/reviewRoutes'));            // Reviews
app.use('/api/admin', require('./routes/adminRoutes'));                // Admin actions
app.use('/api/chat', require('./routes/chatRoutes'));                  // Chatbot
app.use('/api/payment', require('./routes/paymentRoutes'));            // Payments
app.use('/api/gallery', require('./routes/galleryRoutes'));            // Gallery
app.use('/api/coupons', require('./routes/couponRoutes'));              // Coupons
app.use('/api/settings', require('./routes/settingRoutes'));            // Hotel settings
app.use('/api/messages', require('./routes/messageRoutes'));            // Contact messages
app.use('/api/notifications', require('./routes/notificationRoutes'));  // 🔔 Admin notifications (NAYA)


// ============================================
// ROOT ROUTE
// Health check — server chal raha hai ya nahi
// ============================================
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Siyaram Palace API is running',
        version: '1.0.0',
    });
});


// ============================================
// 11. ERROR HANDLING
// Agar koi route match nahi hua — 404
// Agar koi error aaya — error handler
// ⚠️ Ye sabse last me hone chahiye
// ============================================
app.use(notFound);
app.use(errorHandler);


// ============================================
// 12. START SERVER
// Server start karo aur rooms initialize karo
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`\n🚀 Siyaram Palace Server running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`🔒 Security: Helmet + RateLimit + Sanitize\n`);
    console.log(`✅ Allowed origins:`, allowedOrigins);

    // Rooms auto-create (agar DB khaali hai)
    await initializeRooms();
});