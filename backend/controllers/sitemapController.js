// controllers/sitemapController.js
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const Question = require('../models/Question');
const Post = require('../models/Post');

exports.generateSitemap = async (req, res) => {
  try {
    // Prefer env; otherwise use the host from the request
    const hostFromReq = `${req.protocol}://${req.headers.host}`.replace(/\/+$/, '');
    const baseUrl = (process.env.STUDENT_URL || hostFromReq).replace(/\/+$/, '');

    const links = [];

    // 1) Static pages
    links.push({ url: '/', changefreq: 'daily', priority: 1.0 });
    links.push({ url: '/questions', changefreq: 'daily', priority: 0.9 });
    links.push({ url: '/articles', changefreq: 'daily', priority: 0.9 });

    // 2) Dynamic QUESTION pages
    // NOTE: do NOT filter by isPublic if you removed that field
    const questions = await Question.find({}, '_id updatedAt', { lean: true })
      .sort({ updatedAt: -1 })
      .limit(10000); // safety cap; increase if needed

    for (const q of questions) {
      links.push({
        url: `/question/${q._id}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: q?.updatedAt ? new Date(q.updatedAt).toISOString() : undefined
      });
    }

    // 3) Dynamic ARTICLE pages
    const posts = await Post.find({}, 'slug updatedAt', { lean: true })
      .sort({ updatedAt: -1 })
      .limit(10000);

    for (const p of posts) {
      if (!p.slug) continue;
      links.push({
        url: `/articles/${p.slug}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: p?.updatedAt ? new Date(p.updatedAt).toISOString() : undefined
      });
    }

    // 4) Build and send
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    // Cache for 1 hour at edge and client
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');

    const smStream = new SitemapStream({ hostname: baseUrl });
    const xml = await streamToPromise(Readable.from(links).pipe(smStream));
    return res.status(200).end(xml.toString());
  } catch (err) {
    console.error('Sitemap generation error:', err);
    return res.status(500).send('Error generating sitemap');
  }
};
