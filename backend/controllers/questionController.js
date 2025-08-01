import Question from '../models/Question.js';
import cloudinary from '../config/cloudinary.js';

// GET ALL QUESTIONS (with filters)
export const getQuestions = async (req, res) => {
    try {
        // 1. Get query parameters with default values for pagination and sorting
        const { 
            page = 1, 
            limit = 15, 
            search = '', 
            sortBy = 'createdAt', 
            order = 'desc', 
            exam, 
            subject, 
            year 
        } = req.query;

        // 2. Build the filter object for the database query
        const filter = {};
        if (search) {
            filter.questionText = { $regex: search, $options: 'i' };
        }
        if (exam) filter.exam = exam;
        if (subject) filter.subject = subject;
        if (year) filter.year = year;

        // 3. Build the sort object
        const sort = {};
        if (sortBy) {
            sort[sortBy] = order === 'desc' ? -1 : 1;
        }

        // 4. Calculate the number of documents to skip
        const skip = (page - 1) * parseInt(limit);

        // 5. Execute queries to get the current page's data and the total count
        const [questions, totalCount] = await Promise.all([
            Question.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Question.countDocuments(filter)
        ]);
        
        // 6. Calculate total pages
        const totalPages = Math.ceil(totalCount / parseInt(limit));

        // 7. Send the final, structured response back to the frontend
        res.status(200).json({
            questions,
            totalPages,
            totalCount,
            currentPage: parseInt(page)
        });

    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ message: 'Server error while fetching questions.' });
    }
};

// GET A SINGLE QUESTION
export const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: 'Question not found' });
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// CREATE A QUESTION
export const createQuestion = async (req, res) => {
    try {
        const questionData = { ...req.body };
        const parsedOptions = JSON.parse(req.body.options);

        if (req.files) {
            for (const key in req.files) {
                const result = await cloudinary.uploader.upload(req.files[key][0].path);
                if (key === 'questionImage') questionData.questionImageURL = result.secure_url;
                if (key === 'explanationImage') questionData.explanationImageURL = result.secure_url;
                if (key.startsWith('option_')) {
                    const optionIndex = parseInt(key.split('_')[1]);
                    if (parsedOptions[optionIndex]) {
                        parsedOptions[optionIndex].imageURL = result.secure_url;
                    }
                }
            }
        }
        const newQuestion = new Question({ ...questionData, options: parsedOptions });
        const savedQuestion = await newQuestion.save();
        res.status(201).json(savedQuestion);
    } catch (error) {
        res.status(400).json({ message: 'Error creating question', error: error.message });
    }
};

// UPDATE A QUESTION
export const updateQuestion = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (updateData.options) {
            updateData.options = JSON.parse(updateData.options);
        }
        if (req.files) {
            for (const key in req.files) {
                const result = await cloudinary.uploader.upload(req.files[key][0].path);
                if (key === 'questionImage') updateData.questionImageURL = result.secure_url;
                if (key === 'explanationImage') updateData.explanationImageURL = result.secure_url;
                if (key.startsWith('option_')) {
                    const optionIndex = parseInt(key.split('_')[1]);
                    if (updateData.options[optionIndex]) {
                        updateData.options[optionIndex].imageURL = result.secure_url;
                    }
                }
            }
        }
        const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedQuestion) return res.status(404).json({ message: 'Question not found' });
        res.status(200).json(updatedQuestion);
    } catch (error) {
        res.status(400).json({ message: 'Error updating question', error: error.message });
    }
};

// DELETE A QUESTION
export const deleteQuestion = async (req, res) => {
    try {
        const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
        if (!deletedQuestion) return res.status(404).json({ message: 'Question not found' });
        res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

//GET DASHBOARD STATS
export const getQuestionStats = async (req, res) => {
    try {
        const totalQuestions = await Question.countDocuments();
        const subjects = await Question.distinct('subject', { subject: { $ne: null, $ne: "" } });
        const exams = await Question.distinct('exam', { exam: { $ne: null, $ne: "" } });
        res.status(200).json({
            totalQuestions,
            totalSubjects: subjects.length,
            totalExams: exams.length,
        });
    } catch (error) {
        console.error('Error fetching question stats:', error);
        res.status(500).json({ message: 'Server Error while fetching stats' });
    }
};
 
//  // TEMPORARY TESTING VERSION
// exports.getQuestionStats = async (req, res) => {
//     console.log('--- 📊 [TEST] Sending dummy stats data ---');

//     // We are skipping the database and sending back fake numbers
//     const dummyStats = {
//         totalQuestions: 99,
//         totalSubjects: 8,
//         totalExams: 3,
//     };

//     res.status(200).json(dummyStats);
// };
// @desc    Get all unique filter options for the frontend
// @route   GET /api/questions/filters
export const getFilterOptions = async (req, res) => {
    try {
        // This finds all unique values for the 'subject' field, ignoring any empty ones
        const subjects = await Question.distinct('subject', { subject: { $ne: null, $ne: "" } });
        
        // This finds all unique values for the 'exam' field
        const exams = await Question.distinct('exam', { exam: { $ne: null, $ne: "" } });
        
        // This finds all unique values for the 'year' field
        const years = await Question.distinct('year', { year: { $ne: null } });

        // Send the lists back to the frontend
        res.status(200).json({
            subjects: subjects.sort(),
            exams: exams.sort(),
            years: years.sort((a, b) => b - a), // Sorts years from newest to oldest
        });
    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getRelatedQuestions = async (req, res) => {
    try {
        const originalQuestion = await Question.findById(req.params.id);
        if (!originalQuestion) {
            return res.status(404).json({ message: 'Original question not found' });
        }

        // Find other questions with the same TOPIC and EXAM
        const relatedQuestions = await Question.find({
            topic: originalQuestion.topic, // Search by topic
            exam: originalQuestion.exam,
            _id: { $ne: req.params.id } // Exclude the current question
        })
        .limit(5)
        .select('questionText exam subject topic'); // Include topic in the response

        res.status(200).json(relatedQuestions);

    } catch (error) {
        console.error('Error fetching related questions:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
export const getPublicQuestions = async (req, res) => {
    try {
        // Find all questions and sort them, newest year first
        const questions = await Question.find({}).sort({ year: -1 });
        res.status(200).json(questions);
    } catch (error) {
        console.error('Error fetching public questions:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};