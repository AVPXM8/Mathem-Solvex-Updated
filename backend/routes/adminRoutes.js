const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getMe, syncSession, getSessionStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimitMiddleware');

//router.post('/register', registerAdmin);
router.post('/login',loginLimiter, loginAdmin);
router.get('/me', protect, getMe);

// Session endpoints
router.post('/session/sync', protect, syncSession);
router.get('/session/stats', protect, getSessionStats);

module.exports = router;