// --- 0) INITIALIZATION ---
// Load environment variables and validate them FIRST
require('dotenv').config();
require('express-async-errors');

// NPM Packages
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const compression = require('compression');
const helmet = require('helmet');

// Local Modules
const { generateSitemap } = require('./controllers/sitemapController');

// Ensure Mongoose models are registered for operations like syncIndexes
require('./models/Question');
require('./models/Post');


// --- 1) ENVIRONMENT VALIDATION ---
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('FATAL ERROR: MONGODB_URI or JWT_SECRET is not defined.');
  process.exit(1);
}


// --- 2) EXPRESS APP SETUP ---
const app = express();
app.set('trust proxy', 1); // Required for rate limiting and secure cookies behind a proxy (e.g., on Render)
app.disable('x-powered-by'); // Security: Hide the fact that we are using Express


// --- 3) CORE MIDDLEWARE ---
app.use(compression()); // Compress responses for better performance
app.use(
  helmet({ // Set various security-related HTTP headers
    contentSecurityPolicy: false, // Allow inline scripts, etc., if needed by an admin panel
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// CORS Configuration
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? [process.env.STUDENT_URL, process.env.ADMIN_URL].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    // Disallow other origins without throwing an error
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
};
app.use(cors(corsOptions));

// JSON Body Parser
app.use(express.json({ limit: '1mb' }));

// Tell crawlers not to index any API endpoints
app.use('/api', (req, res, next) => {
  res.set('X-Robots-Tag', 'noindex');
  next();
});


// --- 4) UTILITY ROUTES ---
// These are proxied from the Vercel frontend via vercel.json
app.get('/robots.txt', (req, res) => {
  const host = (process.env.PUBLIC_SITE_URL || `https://${req.headers.host}`).replace(/\/+$/, '');
  res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.type('text/plain').send(
`User-agent: *
Allow: /

Sitemap: ${host}/sitemap.xml
`
  );
});

app.get('/sitemap.xml', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  next();
}, generateSitemap);


// --- 5) API ROUTES ---
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));

app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'no-store'); // Never cache the health check
  res.status(200).json({ status: 'ok', uptimeSec: Math.floor(process.uptime()) });
});


// --- 6) ERROR HANDLING ---
// 404 Handler for routes not found
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred on the server.',
    // Only show error details in development
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});


// --- 7) SERVER & DATABASE STARTUP ---
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 20000,
    });

    // Ensure Mongoose text indexes are created on startup
    await mongoose.model('Question').syncIndexes();
    await mongoose.model('Post').syncIndexes();

    console.log('✅ Connected to MongoDB & indexes synced');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Could not connect to MongoDB. Exiting...');
    console.error(err);
    process.exit(1);
  }
};
startServer();


// --- 8) GRACEFUL SHUTDOWN ---
const shutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Closing MongoDB connection...`);
  await mongoose.connection.close();
  console.log('MongoDB connection closed. Exiting process.');
  process.exit(0);
};

// Listen for termination signals
process.on('SIGINT', () => shutdown('SIGINT')); // Ctrl+C
process.on('SIGTERM', () => shutdown('SIGTERM')); // Standard shutdown signal