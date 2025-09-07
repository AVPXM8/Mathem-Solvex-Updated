const express = require('express');
const router = express.Router();
const { 
    getQuestions, 
    getQuestionById, 
    createQuestion, 
    updateQuestion, 
    deleteQuestion, 
    getQuestionStats,
    getFilterOptions,
    getPublicQuestions, 
    getPublicQuestionById, 
    getRelatedQuestions
} = require('../controllers/questionController');

const { protect } = require('../middleware/authMiddleware'); // Assuming this path and export is correct
const upload = require('../middleware/uploadMiddleware');   // Assuming this path and export is correct

// Define image upload fields once for reusability
const imageUploadFields = upload.fields([
    { name: 'questionImage', maxCount: 1 },
    { name: 'explanationImage', maxCount: 1 },
    { name: 'option_0_image', maxCount: 1 },
    { name: 'option_1_image', maxCount: 1 },
    { name: 'option_2_image', maxCount: 1 },
    { name: 'option_3_image', maxCount: 1 }
    // Add more if you anticipate more options, or handle dynamically if options can be arbitrary
]);

// --- Public Routes (no 'protect' middleware) ---
// Order matters: More specific routes should generally come before more generic ones

// GET /api/questions/public - Get paginated questions for students
router.get('/public', getPublicQuestions);

// GET /api/questions/public/:id - Get a single question for students (public view)
router.get('/public/:id', getPublicQuestionById); 
// GET /api/questions/filters - Gets all unique filter options (publicly accessible)
router.get('/filters', getFilterOptions);

// GET /api/questions/:id/related - Gets related questions based on topic and exam (publicly accessible)
router.get('/public/:id/related', getRelatedQuestions);


// --- Admin/Protected Routes (require 'protect' middleware) ---

// GET /api/questions/stats - Gets dashboard stats (Protected)
router.get('/stats', protect, getQuestionStats);

// Routes for /api/questions (GET all, POST new)
router.route('/')
    .get(protect, getQuestions) // GET: All questions for admin, with filters/pagination
    .post(protect, imageUploadFields, createQuestion); // POST: Create a new question

// Routes for /api/questions/:id (GET single, PUT update, DELETE)
router.route('/:id')
    .get(protect, getQuestionById) // GET: A single question (admin view, full details)
    .put(protect, imageUploadFields, updateQuestion) // PUT: Update an existing question
    .delete(protect, deleteQuestion); // DELETE: Delete a question

module.exports = router;