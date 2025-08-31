// Load environment variables and validate them FIRST
require('dotenv').config();
require('express-async-errors');
const prerender = require('prerender-node');

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const compression = require('compression');
const helmet = require('helmet');
const { generateSitemap } = require('./controllers/sitemapController');

// Models used in sitemap
const Question = require('./models/Question');
const Post = require('./models/Post');

// --- 1) ENV VALIDATION ---
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('FATAL ERROR: MONGODB_URI or JWT_SECRET is not defined in the .env file.');
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1); // important on Render/behind proxies

// --- 2) CORE MIDDLEWARE (order matters) ---
app.use(compression()); // gzip/br
app.use(
  helmet({
    // Good defaults for APIs; skip CSP to avoid accidental breakage
    contentSecurityPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS: only allow your student/admin frontends
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? [process.env.STUDENT_URL, process.env.ADMIN_URL].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('This origin is not allowed by CORS'));
  },
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Parse JSON bodies with a sane limit
app.use(express.json({ limit: '1mb' }));

// --- 3) UTILITY ROUTES: robots.txt & sitemap.xml ---
app.get('/robots.txt', (req, res) => {
  const host = (process.env.STUDENT_URL || `https://${req.headers.host}`).replace(/\/+$/, '');
  res.type('text/plain').send(
`User-agent: *
Allow: /
Sitemap: ${host}/sitemap.xml
`
  );
});

// --- Sitemap: make URLs match your CURRENT live routes (/question/:id), set host & caching ---
app.get('/sitemap.xml', async (req, res) => {
  try {
    // Use your public site URL (Vercel). Fall back to request host if env missing.
    const hostname = (process.env.STUDENT_URL || `https://${req.headers.host}`).replace(/\/+$/, '');
    const smStream = new SitemapStream({ hostname });

    res.header('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // cache 1 hour

    smStream.pipe(res);

    // Static pages
    smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
    smStream.write({ url: '/questions', changefreq: 'daily', priority: 0.9 });
    smStream.write({ url: '/articles', changefreq: 'daily', priority: 0.9 });

    // Dynamic question pages — KEEPING YOUR CURRENT LIVE ROUTE: /question/:id
    const questions = await Question.find({}, '_id updatedAt')
      .sort({ updatedAt: -1 })
      .limit(5000)
      .lean();

    for (const q of questions) {
      smStream.write({
        url: `/question/${q._id}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: q.updatedAt ? new Date(q.updatedAt).toISOString() : new Date().toISOString()
      });
    }

    // Dynamic post pages — assuming you already use /articles/:slug publicly
    const posts = await Post.find({}, 'slug updatedAt')
      .sort({ updatedAt: -1 })
      .limit(5000)
      .lean();

    for (const p of posts) {
      smStream.write({
        url: `/articles/${p.slug}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString()
      });
    }

    smStream.end();
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});
if (process.env.PRERENDER_TOKEN) {
  console.log('Prerender enabled');

  prerender.set('prerenderToken', process.env.PRERENDER_TOKEN);
  // Tell prerender which public site to fetch and render
  prerender.set('protocol', 'https');
  prerender.set('host', 'question.maarula.in');

  // Only prerender the HTML pages we care about
  prerender.set('whitelisted', [
    /^\/$/,                 // home
    /^\/questions$/,        // questions list
    /^\/articles$/,         // blog index
    /^\/question\/.*/,      // question detail
    /^\/articles\/.*/       // post detail
  ]);

  // Never prerender APIs or static files
  prerender.set('blacklisted', [
    /^\/api\/.*/,           // all APIs
    /\.[0-9a-z]+$/i         // assets: .js .css .png ...
  ]);

  app.use(prerender);
}

// --- 4) API ROUTES (backend only; frontend is on Vercel) ---
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.get('/sitemap.xml', generateSitemap);

app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// --- 5) 404 + ERROR HANDLERS ---
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred on the server.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// --- 6) DB CONNECT & START ---
const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 20000
        });

        // Ensure Question indexes are created/updated
        await mongoose.model('Question').syncIndexes();

        console.log('✅ Connected to MongoDB & indexes synced');
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (err) {
        console.error('❌ Could not connect to MongoDB. Exiting...');
        console.error(err);
        process.exit(1);
    }
};
startServer();


// --- 7) GRACEFUL SHUTDOWN ---
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection is disconnected due to application termination.');
  process.exit(0);
});
