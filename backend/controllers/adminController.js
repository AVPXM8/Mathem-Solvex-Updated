// controllers/adminController.js 

// We need axios here to make a request to Google's reCAPTCHA server
const axios = require('axios'); 
const AdminUser = require('../models/AdminUser');
const AdminSession = require('../models/AdminSession');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// This function generates the secure login token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// This function registers a new admin (usually only used once)
exports.registerAdmin = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    const adminExists = await AdminUser.findOne({ username });
    if (adminExists) {
        return res.status(400).json({ message: 'Admin user already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await AdminUser.create({
        username,
        password: hashedPassword,
    });

    if (admin) {
        res.status(201).json({
            _id: admin.id,
            username: admin.username,
            token: generateToken(admin._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid admin data' });
    }
};

// This is the updated login function with the reCAPTCHA check
exports.loginAdmin = async (req, res) => {
    const { username, password, recaptchaToken } = req.body;

    // 1. First, check if the user completed the CAPTCHA on the frontend
    if (!recaptchaToken) {
        return res.status(400).json({ message: 'Please complete the CAPTCHA verification.' });
    }

    // 2. Secretly verify the CAPTCHA response with Google
    try {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
        
        const response = await axios.post(verificationURL);
        
        if (!response.data.success) {
            // If Google says the verification failed, block the login attempt
            return res.status(400).json({ message: 'reCAPTCHA verification failed. Are you a robot?' });
        }
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return res.status(500).json({ message: 'Error during reCAPTCHA verification.' });
    }

    // 3. Only if CAPTCHA is valid, proceed with checking the username and password
    const admin = await AdminUser.findOne({ username });
    if (admin && (await bcrypt.compare(password, admin.password))) {
        res.json({
            _id: admin.id,
            username: admin.username,
            token: generateToken(admin._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid username or password' });
    }
};

// This function gets the current admin's data for secure pages
exports.getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// Sync session heartbeat
exports.syncSession = async (req, res) => {
    try {
        const adminId = req.user._id;
        // Format date string as YYYY-MM-DD
        const dateStr = new Date().toISOString().split('T')[0];

        let session = await AdminSession.findOne({ adminId, dateStr });

        if (!session) {
            // New session record for today
            session = new AdminSession({
                adminId,
                dateStr,
                totalSeconds: 60, // Assume 1 minute for the first ping
                lastHeartbeat: new Date()
            });
        } else {
            // Calculate time difference
            const now = new Date();
            const diffSeconds = Math.floor((now - session.lastHeartbeat) / 1000);

            // If diff is less than 5 minutes (300s), add it. Otherwise, assume they went idle.
            if (diffSeconds > 0 && diffSeconds <= 300) {
                session.totalSeconds += diffSeconds;
            } else if (diffSeconds > 300) {
            	// If they were idle and came back, just add 60s for the current ping
            	session.totalSeconds += 60;
            }
            session.lastHeartbeat = now;
        }

        await session.save();
        res.status(200).json({ success: true, totalSeconds: session.totalSeconds });
    } catch (error) {
        console.error('Error syncing session:', error);
        res.status(500).json({ message: 'Error syncing session' });
    }
};

// Get session stats
exports.getSessionStats = async (req, res) => {
    try {
        const adminId = req.user._id;
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Today
        const todaySession = await AdminSession.findOne({ adminId, dateStr: todayStr });
        const todaySeconds = todaySession ? todaySession.totalSeconds : 0;

        // Last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weeklySessions = await AdminSession.find({
            adminId,
            dateStr: { $gte: sevenDaysAgo.toISOString().split('T')[0] }
        });
        const weeklySeconds = weeklySessions.reduce((acc, sess) => acc + sess.totalSeconds, 0);

        // This month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        const monthlySessions = await AdminSession.find({
            adminId,
            dateStr: { $gte: startOfMonth.toISOString().split('T')[0] }
        });
        const monthlySeconds = monthlySessions.reduce((acc, sess) => acc + sess.totalSeconds, 0);

        res.status(200).json({
            today: { seconds: todaySeconds },
            weekly: { seconds: weeklySeconds },
            monthly: { seconds: monthlySeconds }
        });

    } catch (error) {
        console.error('Error fetching session stats:', error);
        res.status(500).json({ message: 'Error fetching session stats' });
    }
};