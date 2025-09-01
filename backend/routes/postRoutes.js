const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getPosts,
  getPostBySlug,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  uploadEditorImage
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// Multer: small, safe defaults (images only, size capped)
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const ok = /image\/(png|jpe?g|gif|webp|svg\+xml)/i.test(file.mimetype);
    if (!ok) return cb(new Error('Only image uploads are allowed'));
    cb(null, true);
  }
});

/* -------------------- PUBLIC (students + crawlers) -------------------- */
// Lists and detail by SLUG (keep this below /id/:id to avoid conflicts)
router.get('/', getPosts);

// IMPORTANT: put the ID route BEFORE the slug route to avoid conflicts
/* -------------------- ADMIN (protected) -------------------- */
router.get('/id/:id', protect, getPostById);
router.post('/', protect, upload.single('featuredImage'), createPost);
router.put('/:id', protect, upload.single('featuredImage'), updatePost);
router.delete('/:id', protect, deletePost);

// Public slug route LAST to prevent swallowing /id/:id etc.
router.get('/:slug', getPostBySlug);

/* -------------------- EDITOR IMAGE UPLOAD -------------------- */
router.post('/upload-image', protect, upload.single('file'), uploadEditorImage);

module.exports = router;
