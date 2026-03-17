const express = require('express');
const rateLimit = require('express-rate-limit');
const { chatWithTutor } = require('../controllers/aiController');

const router = express.Router();

// Rate limiter: max 20 AI chat requests per 15 minutes per IP
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests to AI Tutor. Please wait a few minutes and try again.",
  },
});

// Route: POST /api/ai/chat
// Description: Handles chat requests to the AI tutor (Vivek)
router.post('/chat', aiLimiter, chatWithTutor);

module.exports = router;
