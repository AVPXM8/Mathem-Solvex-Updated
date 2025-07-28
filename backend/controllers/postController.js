const Post = require('../models/Post');
const cloudinary = require('../config/cloudinary');

// This is a helper function to create a URL-friendly slug.
// By placing it here, it's available to all functions in this file.
const generateSlug = (title) => {
    if (!title) return '';
    return title
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9\s-]/g, '') // Remove all special characters
        .replace(/\s+/g, '-')       // Replace spaces with hyphens
        .replace(/-+/g, '-');        // Remove any duplicate hyphens
};

// @desc    Get all posts
exports.getPosts = async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
};

// @desc    Get a single post by its ID (for admin editing)
exports.getPostById = async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
};

// @desc    Get a single post by its slug (for public viewing)
exports.getPostBySlug = async (req, res) => {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
};

// @desc    Create a new post
exports.createPost = async (req, res) => {
    const { title, content, category, metaDescription, keywords,videoURL } = req.body;
    
    if (!title || !content || !category) {
        return res.status(400).json({ message: 'Title, content, and category are required.' });
    }

    // 1. Generate the slug from the title
    const slug = generateSlug(title);

    // 2. Check if a post with this slug already exists
    const slugExists = await Post.findOne({ slug });
    if (slugExists) {
        return res.status(400).json({ message: 'A post with this title already exists. Please choose a unique title.' });
    }

    const postData = {
        title,
        content,
        slug, // Add the generated slug
        category,
        metaDescription,
        keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
        author: req.user.username,
        videoURL,
    };

    // 3. Handle the featured image upload, if it exists
    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        postData.featuredImage = result.secure_url;
    }

    const newPost = new Post(postData);
    await newPost.save();
    res.status(201).json(newPost);
};

// @desc    Update a post
exports.updatePost = async (req, res) => {
    const updateData = { ...req.body };

    // If the title is being updated, we must regenerate the slug
    if (updateData.title) {
        updateData.slug = generateSlug(updateData.title);
    }
    
    // If keywords are provided, convert them into an array
   if (updateData.keywords && typeof updateData.keywords === 'string') {
        updateData.keywords = updateData.keywords.split(',').map(k => k.trim());
    }

    // Handle a new featured image upload during an update
    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        updateData.featuredImage = result.secure_url;
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedPost) {
        return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(updatedPost);
};
// @desc    Delete a post
exports.deletePost = async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: 'Post not found' });
    }
    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted successfully' });
};
exports.uploadEditorImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided.' });
        }
        // Upload the image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);

        // The editor expects a specific JSON format back with the URL
        res.status(200).json({ location: result.secure_url });

    } catch (error) {
        console.error('Editor image upload error:', error);
        res.status(500).json({ message: 'Server error during image upload.' });
    }
};
