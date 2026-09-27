// ============================================
// GALLERY ROUTES
// Admin gallery images upload/delete
// Public gallery display
// ============================================

// Imports
const express = require('express');
const router = express.Router();

// File upload middleware
const multer = require('multer');

// File system + path handling
const path = require('path');
const fs = require('fs');

// Gallery database model
const Gallery = require('../models/Gallery');

// Auth middleware — login check + admin check
const { protect, adminOnly } = require('../middleware/authMiddleware');


// ============================================
// MULTER CONFIGURATION
// File upload settings
// ============================================

// Disk storage config — kahan aur kaise save karna hai
const storage = multer.diskStorage({
    // Upload destination folder
    destination: (req, file, cb) => {
        const dir = path.join(
            __dirname,
            '..',
            'public',
            'uploads',
            'gallery'
        );

        // Folder nahi hai to banao (recursive = parent folders bhi)
        fs.mkdirSync(dir, { recursive: true });

        cb(null, dir);
    },

    // Filename generate karo — unique rakho taaki overwrite na ho
    filename: (req, file, cb) => {
        // Timestamp + random number = unique filename
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);

        // Original extension preserve karo (.jpg, .png, etc.)
        cb(null, `gallery-${unique}${path.extname(file.originalname)}`);
    },
});

// ⚠️ Upload middleware with security
// Sirf images allow karo, size limit lagao
const upload = multer({
    storage,

    // File size limit — 5 MB max
    limits: {
        fileSize: 5 * 1024 * 1024,   // 5MB in bytes
        files: 10,                    // Max 10 files at once
    },

    // File type filter — sirf images
    fileFilter: (req, file, cb) => {
        // Allowed extensions regex
        const allowedExtensions = /jpeg|jpg|png|webp/;

        // Allowed MIME types regex
        const allowedMimeTypes = /image\/(jpeg|jpg|png|webp)/;

        // Extension check
        const extName = allowedExtensions.test(
            path.extname(file.originalname).toLowerCase()
        );

        // MIME type check
        const mimeType = allowedMimeTypes.test(file.mimetype);

        // Dono check pass ho to allow karo
        if (extName && mimeType) {
            return cb(null, true);
        }

        // Warna reject karo
        cb(
            new Error(
                'Only images allowed (jpg, png, webp). Max 5MB per file.'
            )
        );
    },
});


// ============================================
// PUBLIC ROUTES
// Koi bhi access kar sakta hai (bina login)
// ============================================

// GET /api/gallery — Saari gallery images
router.get('/', async (req, res) => {
    try {
        // Order ke hisaab se sort karo, fir latest
        const images = await Gallery.find().sort({
            order: 1,
            createdAt: -1,
        });

        res.json({ success: true, images });
    } catch (err) {
        console.error('Gallery fetch error:', err);
        res.status(500).json({
            success: false,
            message: 'Gallery load nahi hui',
        });
    }
});


// ============================================
// ADMIN ROUTES — Sirf admin access
// Login + admin role zaroori
// ============================================

// POST /api/gallery — Single image upload
router.post(
    '/',
    protect,           // Login check
    adminOnly,         // Admin role check
    upload.single('image'),   // Ek image accept karo
    async (req, res) => {
        try {
            // File aayi ya nahi?
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No image uploaded',
                });
            }

            // Public URL banao
            const imageUrl = `/uploads/gallery/${req.file.filename}`;

            // Database me save karo
            const image = await Gallery.create({
                title: req.body.title || '',
                category: req.body.category || 'Hotel',
                imageUrl,
                order: Number(req.body.order) || 0,
                uploadedBy: req.user._id,
            });

            res.status(201).json({ success: true, image });
        } catch (err) {
            console.error('Gallery upload error:', err);
            res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }
);

// POST /api/gallery/bulk — Multiple images upload (max 10)
router.post(
    '/bulk',
    protect,                      // Login check
    adminOnly,                    // Admin check
    upload.array('images', 10),   // Array accept karo, max 10
    async (req, res) => {
        try {
            // Files aayi ya nahi?
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No images uploaded',
                });
            }

            // Har file ke liye document banao
            const docs = req.files.map((f, i) => ({
                title: req.body.title || '',
                category: req.body.category || 'Hotel',
                imageUrl: `/uploads/gallery/${f.filename}`,
                order: i,
                uploadedBy: req.user._id,
            }));

            // Sab ek saath save karo
            const images = await Gallery.insertMany(docs);

            res.status(201).json({ success: true, images });
        } catch (err) {
            console.error('Bulk upload error:', err);
            res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    }
);

// DELETE /api/gallery/:id — Image delete (DB + file dono)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        // Image dhundo DB me
        const image = await Gallery.findById(req.params.id);

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found',
            });
        }

        // ⚠️ Path traversal attack se bachao
        // Sirf 'uploads/gallery' folder ke andar hi file delete karo
        const uploadsRoot = path.join(__dirname, '..', 'public');

        // Full absolute path banao
        const relativePath = image.imageUrl.replace(/^\/+/, '');
        const filePath = path.resolve(uploadsRoot, relativePath);

        // Verify karo — file uploads folder ke andar hai?
        if (!filePath.startsWith(uploadsRoot)) {
            console.warn('⚠️ Path traversal attempt:', image.imageUrl);
            return res.status(400).json({
                success: false,
                message: 'Invalid file path',
            });
        }

        // File exist karti hai to delete karo
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Database se bhi delete karo
        await Gallery.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Image deleted' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});


// ============================================
// EXPORT
// ============================================
module.exports = router;