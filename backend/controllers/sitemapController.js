const { SitemapStream } = require('sitemap');
const { Readable } = require('stream');
const mongoose = require('mongoose');
const Question = require('../models/Question');
const Post = require('../models/Post');

exports.generateSitemap = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connection.asPromise();
    }

    const hostFromReq = `${req.protocol}://${req.headers.host}`.replace(/\/+$/, '');
    const studentUrlStr = (process.env.STUDENT_URL || '').split(',')[0].trim();
    const hostname = (studentUrlStr || hostFromReq).replace(/\/+$/, '');

    // Static pages
    const links = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/questions', changefreq: 'daily', priority: 0.9 },
      { url: '/articles', changefreq: 'daily', priority: 0.9 },
      { url: '/about', changefreq: 'monthly', priority: 0.7 },
      { url: '/resources', changefreq: 'weekly', priority: 0.8 },
      { url: '/results', changefreq: 'monthly', priority: 0.6 },
      { url: '/contact', changefreq: 'monthly', priority: 0.5 },
    ];

    // QUESTIONS
    const questions = await Question.find({}, '_id updatedAt exam subject', { lean: true })
      .sort({ updatedAt: -1 })
      .limit(50000);

    for (const q of questions) {
      links.push({
        url: `/questions/${q._id}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: q?.updatedAt ? new Date(q.updatedAt).toISOString() : undefined,
      });
    }

    // POSTS
    const posts = await Post.find({}, 'slug updatedAt', { lean: true })
      .sort({ updatedAt: -1 })
      .limit(50000);

    for (const p of posts) {
      if (!p.slug) continue;
      links.push({
        url: `/articles/${p.slug}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: p?.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
      });
    }

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');

    const sm = new SitemapStream({ hostname });
    sm.on('error', (e) => {
      console.error('Sitemap stream error:', e);
      if (!res.headersSent) res.status(500).end('Error generating sitemap');
    });

    sm.pipe(res);
    for (const link of links) sm.write(link);
    sm.end();
  } catch (err) {
    console.error('Sitemap generation error (outer):', err);
    if (!res.headersSent) res.status(500).send('Error generating sitemap');
  }
};

// JSON endpoint for Next.js sitemap builder
exports.getSitemapUrls = async (req, res) => {
  try {
    const questions = await Question.find({}, '_id updatedAt exam subject year', { lean: true })
      .sort({ updatedAt: -1 })
      .limit(50000);
    const posts = await Post.find({}, 'slug updatedAt title category', { lean: true })
      .sort({ updatedAt: -1 })
      .limit(50000);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.json({ questions, posts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sitemap URLs' });
  }
};

