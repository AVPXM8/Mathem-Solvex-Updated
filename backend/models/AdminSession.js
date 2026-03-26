const mongoose = require('mongoose');

const adminSessionSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser',
        required: true
    },
    dateStr: {
        type: String, // String format 'YYYY-MM-DD' for easy querying
        required: true,
        index: true
    },
    totalSeconds: {
        type: Number,
        default: 0
    },
    lastHeartbeat: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Compound index to quickly find a user's session for a specific day
adminSessionSchema.index({ adminId: 1, dateStr: 1 }, { unique: true });

module.exports = mongoose.model('AdminSession', adminSessionSchema);
