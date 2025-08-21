// Load environment variables and validate them FIRST
require('dotenv').config();
require('express-async-errors'); 

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { SitemapStream } = require('sitemap');
const Question = require('./models/Question'); 
const Post = require('./models/Post');
const prerender = require('prerender-node');

// --- 1. Environment Variable Validation ---
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    console.error("FATAL ERROR: MONGODB_URI or JWT_SECRET is not defined in the .env file.");
    process.exit(1);
}

const app = express();
app.set('trust proxy', 1);

// --- 2. Standard Middleware & CORS ---
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.STUDENT_URL, process.env.ADMIN_URL,process.env.BACKEND_URL] 
    : ['http://localhost:5173','http://localhost:5174'];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('This origin is not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// --- 3. API Routes ---
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// --- 4. PRERENDER.IO MIDDLEWARE ---
if (process.env.NODE_ENV === 'production' || process.env.PRERENDER_TOKEN) {
    console.log('Prerender middleware enabled.');
    prerender.set('prerenderToken', process.env.PRERENDER_TOKEN);
    prerender.set('protocol', 'https');
    prerender.set('host', 'question.maarula.in'); 
    app.use(prerender);
}

// --- 5. Dynamic Sitemap Route (STABLE VERSION) ---
app.get('/sitemap.xml', async (req, res) => {
    try {
        const hostname = process.env.STUDENT_URL || `http://${req.headers.host}`;
        const smStream = new SitemapStream({ hostname });

        res.header('Content-Type', 'application/xml');
        smStream.pipe(res); // Pipe the stream to the response

        // Add static pages
        smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
        smStream.write({ url: '/questions', changefreq: 'daily', priority: 0.9 });
        smStream.write({ url: '/articles', changefreq: 'daily', priority: 0.9 });

        // Add dynamic question pages
        const questions = await Question.find({ isPublic: true }, '_id updatedAt');
        questions.forEach(q => {
            smStream.write({ 
                url: `/question/${q._id}`, 
                changefreq: 'weekly', 
                priority: 0.7,
                lastmod: q.updatedAt
            });
        });
        
        // Add dynamic post pages
        const posts = await Post.find({}, 'slug updatedAt');
        posts.forEach(p => {
            smStream.write({ 
                url: `/articles/${p.slug}`, 
                changefreq: 'weekly', 
                priority: 0.8,
                lastmod: p.updatedAt
            });
        });

        smStream.end(); // End the stream

    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

// --- 6. SERVE THE REACT STUDENT PORTAL ---
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// --- 7. Centralized Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'An unexpected error occurred on the server.',
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

// --- Graceful Shutdown ---
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection is disconnected due to application termination.');
    process.exit(0);
});
