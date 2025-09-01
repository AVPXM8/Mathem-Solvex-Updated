const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A title is required for the post.'],
    trim: true,
    unique: true,
  },
  content: {
    type: String,
    required: [true, 'Content is required for the post.'],
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  category: {
    type: String,
    required: true,
    default: 'General',
  },
  featuredImage: {
    type: String,
    default: '',
  },
  videoURL: {
    type: String,
    default: '',
  },
  author: {
    type: String,
    required: true,
    default: 'Maarula Classes',
  },
  metaDescription: {
    type: String,
    trim: true,
  },
  keywords: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

// Always auto-generate slug if title is new/changed
postSchema.pre('validate', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

// Helpful indexes for queries/search
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ title: 'text', content: 'text', keywords: 'text' });

module.exports = mongoose.model('Post', postSchema);
