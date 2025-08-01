const express = require('express');
const router = express.Router();


const { 
    createReport, 
    getReports, 
    deleteReport,
    updateReportStatus 
} = require('../controllers/reportController');

const { protect } = require('../middleware/authMiddleware');

// Public route for creating a report
router.route('/').post(createReport);

// Admin-only route for viewing reports
router.route('/').get(protect, getReports);

// Admin-only routes for a single report
router.route('/:id').delete(protect, deleteReport);

// 2. Add the new route for updating status
// This handles PATCH requests to /api/reports/:id/status
router.patch('/:id/status', protect, updateReportStatus); // <-- ADDED

module.exports = router;