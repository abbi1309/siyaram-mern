const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const roomController = require('../controllers/roomController');

// ==================== SAFE ROUTE REGISTRATION ====================
// Ye har function ko check karega — agar missing hai to skip karega
const safeGet = (path, fn, ...middleware) => {
    if (typeof fn === 'function') {
        router.get(path, ...middleware, fn);
    } else {
        console.warn(`⚠️  Skipped GET ${path} — handler undefined`);
    }
};

const safePost = (path, fn, ...middleware) => {
    if (typeof fn === 'function') {
        router.post(path, ...middleware, fn);
    } else {
        console.warn(`⚠️  Skipped POST ${path} — handler undefined`);
    }
};

const safePut = (path, fn, ...middleware) => {
    if (typeof fn === 'function') {
        router.put(path, ...middleware, fn);
    } else {
        console.warn(`⚠️  Skipped PUT ${path} — handler undefined`);
    }
};

const safeDelete = (path, fn, ...middleware) => {
    if (typeof fn === 'function') {
        router.delete(path, ...middleware, fn);
    } else {
        console.warn(`⚠️  Skipped DELETE ${path} — handler undefined`);
    }
};

// ==================== PUBLIC ROUTES ====================
safeGet('/', roomController.getAllRooms || roomController.getRooms);
safeGet('/search', roomController.searchAvailableRooms);
safeGet('/:id', roomController.getRoomById || roomController.getRoom);

// ==================== ADMIN ROUTES ====================
safePost('/', roomController.createRoom || roomController.addRoom, protect, adminOnly);
safePut('/:id', roomController.updateRoom, protect, adminOnly);
safeDelete('/:id', roomController.deleteRoom, protect, adminOnly);

module.exports = router;