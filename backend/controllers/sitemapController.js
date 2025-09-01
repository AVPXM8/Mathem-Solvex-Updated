const { SitemapStream } = require('sitemap');
const { Readable } = require('stream');
const mongoose = require('mongoose');
const Question = require('../models/Question'); // CommonJS export
const Post = require('../models/Post');         // CommonJS export

exports.generateSitemap = async (req, res) => {
  try {
    // Ensure DB is connected (avoids cold-start race)
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connection.asPromise();
    }

    const hostFromReq = `${req.protocol}://${req.headers.host}`.replace(/\/+$/, '');
    const hostname = (process.env.STUDENT_URL || hostFromReq).replace(/\/+$/, '');

    // Build links
    const links = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/questions', changefreq: 'daily', priority: 0.9 },
      { url: '/articles', changefreq: 'daily', priority: 0.9 },
    ];

    // QUESTIONS — no isPublic filter if you removed that field
    const questions = await Question.find({}, '_id updatedAt', { lean: true })
      .sort({ updatedAt: -1 })
      .limit(10000);

    for (const q of questions) {
      links.push({
        url: `/question/${q._id}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: q?.updatedAt ? new Date(q.updatedAt).toISOString() : undefined,
      });
    }

    // POSTS
    const posts = await Post.find({}, 'slug updatedAt', { lean: true })
      .sort({ updatedAt: -1 })
      .limit(10000);

    for (const p of posts) {
      if (!p.slug) continue;
      links.push({
        url: `/articles/${p.slug}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: p?.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
      });
    }

    // Stream out XML
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
