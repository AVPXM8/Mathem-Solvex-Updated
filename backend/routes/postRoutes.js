const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getPosts, getPostBySlug, getPostById, createPost, updatePost, deletePost, uploadEditorImage } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = multer({ dest: 'uploads/' }); 

// ===--- Public Routes (for students and SEO crawlers) ---===
router.get('/', getPosts);
router.get('/:slug', getPostBySlug);
router.post('/upload-image', protect, upload.single('file'), uploadEditorImage);

// ===--- Admin-Only Protected Routes ---===
router.get('/id/:id', protect, getPostById);
router.post('/', protect, upload.single('featuredImage'), createPost);
router.put('/:id', protect, upload.single('featuredImage'), updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
