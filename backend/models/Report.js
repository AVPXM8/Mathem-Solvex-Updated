import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    issueDescription: {
        type: String,
        required: true,
        trim: true 
    },
    status: {
        type: String,
        enum: ['Pending', 'Resolved', 'Dismissed'],
        default: 'Pending'
    }
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);