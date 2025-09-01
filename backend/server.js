// Load environment variables and validate them FIRST
require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const compression = require('compression');
const helmet = require('helmet');
const prerender = require('prerender-node');

// Controllers
const { generateSitemap } = require('./controllers/sitemapController');

// --- 1) ENV VALIDATION ---
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('FATAL ERROR: MONGODB_URI or JWT_SECRET is not defined in the .env file.');
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1); // important on Render/behind proxies

// --- 2) CORE MIDDLEWARE (order matters) ---
app.use(compression());
app.use(
  helmet({
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

// (Nice-to-have) Ensure APIs are not indexed by crawlers
app.use('/api', (req, res, next) => {
  res.set('X-Robots-Tag', 'noindex');
  next();
});

// --- 3) PRERENDER FOR BOTS (mount BEFORE your API routes) ---
if (process.env.PRERENDER_TOKEN) {
  console.log('Prerender enabled');

  prerender.set('prerenderToken', process.env.PRERENDER_TOKEN);
  // Tell prerender which public site to fetch and render
  prerender.set('protocol', 'https');
  prerender.set('host', 'question.maarula.in');

  // Only prerender HTML pages we care about
  prerender.set('whitelisted', [
    /^\/$/,                 // home
    /^\/questions$/,        // questions list
    /^\/articles$/,         // blog index
    /^\/question\/.*/,      // question detail
    /^\/articles\/.*/       // post detail
  ]);

  // Never prerender APIs or static files
  prerender.set('blacklisted', [
    /^\/api\/.*/,           // APIs
    /\.[0-9a-z]+$/i         // assets: .js .css .png ...
  ]);

  app.use(prerender);
}

// --- 4) UTILITY ROUTES: robots.txt & sitemap.xml (ONE OF EACH) ---
app.get('/robots.txt', (req, res) => {
  const host = (process.env.STUDENT_URL || `https://${req.headers.host}`).replace(/\/+$/, '');
  res.type('text/plain').send(
`User-agent: *
Allow: /

Sitemap: ${host}/sitemap.xml
`
  );
});

app.get('/sitemap.xml', generateSitemap);

// --- 5) API ROUTES (backend only; frontend is on Vercel) ---
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));

app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// --- 6) 404 + ERROR HANDLERS ---
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

// --- 7) DB CONNECT & START ---
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 20000
    });

    // Ensure Question indexes are created/updated
    await mongoose.model('Question').syncIndexes();
    await mongoose.model('Post').syncIndexes();


    console.log('✅ Connected to MongoDB & indexes synced');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Could not connect to MongoDB. Exiting...');
    console.error(err);
    process.exit(1);
  }
};
startServer();

// --- 8) GRACEFUL SHUTDOWN ---
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection is disconnected due to application termination.');
  process.exit(0);
});
