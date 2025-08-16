// Load environment variables and validate them FIRST
require('dotenv').config();

// This package must be required at the top, before any routes, to handle async errors
require('express-async-errors'); 

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const Question = require('./models/Question'); 
const Post = require('./models/Post');

// --- 1. Environment Variable Validation ---
// This check ensures the application exits immediately if critical secrets are missing.
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    console.error("FATAL ERROR: MONGODB_URI or JWT_SECRET is not defined in the .env file.");
    process.exit(1); // Exit the process with a failure code
}

const app = express();

// This tells Express to trust the 'X-Forwarded-For' header that Render adds.
// It is essential for rate-limiting to work correctly in a deployed environment.
app.set('trust proxy', 1);
// ---  PRERENDER.IO MIDDLEWARE ---
// This should be one of the first middleware to run.
// It will intercept requests from crawlers and serve a cached, rendered version.
const prerender = require('prerender-node');
if (process.env.NODE_ENV === 'production' || process.env.PRERENDER_TOKEN) {
    console.log('Prerender middleware enabled.'); 
    prerender.set('prerenderToken', process.env.PRERENDER_TOKEN);
    app.use(prerender);
}

// --- 2. Secure CORS Configuration ---
// This allows requests from your local frontend and your deployed frontend,
// but blocks all other unknown origins in a production environment.
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.STUDENT_URL, process.env.ADMIN_URL] 
    : ['http://localhost:5173','http://localhost:5174'];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('This origin is not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


// --- Standard Middleware ---
app.use(express.json()); // for parsing application/json
// This serves any files placed in the 'public' folder.
app.use(express.static(path.join(__dirname, 'public')));

// --- API Routes ---
// The modular routing structure is excellent and remains the same.
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// --- Dynamic Sitemap Route ---
app.get('/sitemap.xml', async (req, res) => {
    try {
        const links = [
            { url: '/', changefreq: 'daily', priority: 1.0 },
            { url: '/questions', changefreq: 'daily', priority: 0.9 },
            { url: '/articles', changefreq: 'daily', priority: 0.9 },
        ];

        // Fetch questions with updatedAt for the 'lastmod' sitemap field
        const questions = await Question.find({ isPublic: true }, '_id updatedAt');
        questions.forEach(q => {
            links.push({ 
                url: `/question/${q._id}`, 
                changefreq: 'weekly', 
                priority: 0.7,
                lastmod: q.updatedAt // SEO Improvement
            });
        });
        
        // Fetch posts with updatedAt for the 'lastmod' sitemap field
        const posts = await Post.find({}, 'slug updatedAt');
        posts.forEach(p => {
            links.push({ 
                url: `/articles/${p.slug}`, 
                changefreq: 'weekly', 
                priority: 0.8,
                lastmod: p.updatedAt // SEO Improvement
            });
        });
        
        const hostname = process.env.STUDENT_URL || `http://${req.headers.host}`;
        const stream = new SitemapStream({ hostname });

        res.header('Content-Type', 'application/xml');

        const xml = await streamToPromise(Readable.from(links));
        res.send(xml.toString());

    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

// --- SERVE THE REACT STUDENT PORTAL ---
// This must come AFTER your API routes.
app.use(express.static(path.join(__dirname, '..', 'student', 'dist')));
// app.get('*', (req, res) => {
//     // This check prevents API routes from being overridden by the React app
//     if (!req.originalUrl.startsWith('/api')) {
//         res.sendFile(path.resolve(__dirname, '..', 'student', 'dist', 'index.html'));
//     }
// });
app.get('*', (req, res) => {
    if (!req.originalUrl.startsWith('/api')) {
        res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
    }
});







// --- 3. Centralized Error Handling Middleware ---
// This special middleware will catch any errors that occur in your async route handlers,
// preventing the server from crashing. It must be placed AFTER all your routes.
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the full error stack for debugging
    res.status(500).json({ 
        message: 'An unexpected error occurred on the server.',
        // Only send detailed error message in development mode for security
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});


// --- Database Connection & Server Start ---
const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    } catch (err) {
        console.error('❌ Could not connect to MongoDB. Exiting...');
        console.error(err);
        process.exit(1);
    }
};

startServer();

// --- 4. Graceful Shutdown ---
// This ensures that if the server process is stopped (e.g., with Ctrl+C),
// the database connection is closed gracefully.
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection is disconnected due to application termination.');
    process.exit(0);
});
