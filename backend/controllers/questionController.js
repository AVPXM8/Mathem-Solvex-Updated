import mongoose from 'mongoose';
import Question from '../models/Question.js';
import cloudinary from '../config/cloudinary.js';

// Small helper for cache headers (tune if you publish very frequently)
const setCache = (res, seconds = 60, sMax = 300) => {
  res.set('Cache-Control', `public, max-age=${seconds}, s-maxage=${sMax}, stale-while-revalidate=600`);
};

/**
 * GET /api/questions
 * Paginated list with optional filters + search
 */
// GET ALL QUESTIONS (with filters + optional $text search)
export const getQuestions = async (req, res) => {
  try {
    // 1) Parse inputs safely
    const page = Math.max(parseInt(req.query.page ?? '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit ?? '15', 10), 1), 50); // cap at 50
    const search = (req.query.search ?? '').trim();
    const sortBy = ['createdAt', 'updatedAt', 'year'].includes(req.query.sortBy)
      ? req.query.sortBy
      : 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;
    const { exam, subject, year } = req.query;

    // 2) Build filter (note: $text replaces regex when search is present)
    const filter = {};
    if (exam) filter.exam = exam;
    if (subject) filter.subject = subject;
    if (year) filter.year = year;

    if (search) {
      // Uses the questionText text index
      filter.$text = { $search: search };
    }

    // 3) Build projection (include textScore ONLY when searching)
    const projection = {
      questionText: 1,
      exam: 1,
      subject: 1,
      year: 1,
      difficulty: 1,
      updatedAt: 1,
      createdAt: 1,
      ...(search ? { score: { $meta: 'textScore' } } : {})
    };

    // 4) Build sort: textScore when searching, else your chosen sort
    const sort = search ? { score: { $meta: 'textScore' } } : { [sortBy]: order };

    // 5) Pagination
    const skip = (page - 1) * limit;

    // 6) Query + count
    const [questions, totalCount] = await Promise.all([
      Question.find(filter, projection).sort(sort).skip(skip).limit(limit).lean(),
      Question.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // 7) Cache headers (optional but good for UX/SEO crawl speed)
    res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

    // 8) Respond
    res.status(200).json({
      questions,
      totalPages,
      totalCount,
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error while fetching questions.' });
  }
};


/**
 * GET /api/questions/:id
 * Single question by ID
 */
export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid question id' });
    }

    // Projection: only the fields SingleQuestionPage actually renders
    const projection = {
      questionText: 1,
      questionImageURL: 1,
      explanationText: 1,
      explanationImageURL: 1,
      options: 1,            // [{ text, imageURL, isCorrect }]
      videoURL: 1,
      exam: 1,
      subject: 1,
      year: 1,
      difficulty: 1,
      createdAt: 1,
      updatedAt: 1
    };

    const question = await Question.findById(id, projection).lean();
    if (!question) return res.status(404).json({ message: 'Question not found' });

    setCache(res, 120, 600); // 2 min browser, 10 min CDN/proxy
    res.status(200).json(question);
  } catch (error) {
    console.error('Error fetching question by id:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * POST /api/questions
 * Create a question
 */
export const createQuestion = async (req, res) => {
  try {
    const questionData = { ...req.body };
    const parsedOptions = JSON.parse(req.body.options || '[]');

    if (req.files) {
      for (const key in req.files) {
        const result = await cloudinary.uploader.upload(req.files[key][0].path);
        if (key === 'questionImage') questionData.questionImageURL = result.secure_url;
        if (key === 'explanationImage') questionData.explanationImageURL = result.secure_url;
        if (key.startsWith('option_')) {
          const optionIndex = parseInt(key.split('_')[1], 10);
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
    console.error('Error creating question:', error);
    res.status(400).json({ message: 'Error creating question', error: error.message });
  }
};

/**
 * PATCH /api/questions/:id
 * Update a question
 */
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid question id' });
    }

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
          const optionIndex = parseInt(key.split('_')[1], 10);
          if (updateData.options?.[optionIndex]) {
            updateData.options[optionIndex].imageURL = result.secure_url;
          }
        }
      }
    }

    const updatedQuestion = await Question.findByIdAndUpdate(id, updateData, { new: true, lean: true });
    if (!updatedQuestion) return res.status(404).json({ message: 'Question not found' });

    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(400).json({ message: 'Error updating question', error: error.message });
  }
};

/**
 * DELETE /api/questions/:id
 */
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid question id' });
    }
    const deletedQuestion = await Question.findByIdAndDelete(id).lean();
    if (!deletedQuestion) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * GET /api/questions/stats
 */
export const getQuestionStats = async (req, res) => {
  try {
    const totalQuestions = await Question.estimatedDocumentCount();
    const subjects = await Question.distinct('subject', { subject: { $ne: null, $ne: '' } });
    const exams = await Question.distinct('exam', { exam: { $ne: null, $ne: '' } });
    setCache(res, 300, 900);
    res.status(200).json({
      totalQuestions,
      totalSubjects: subjects.length,
      totalExams: exams.length
    });
  } catch (error) {
    console.error('Error fetching question stats:', error);
    res.status(500).json({ message: 'Server Error while fetching stats' });
  }
};

/**
 * GET /api/questions/filters
 * Unique values used by the UI’s filter controls
 */
export const getFilterOptions = async (req, res) => {
  try {
    const subjects = await Question.distinct('subject', { subject: { $ne: null, $ne: '' } });
    const exams = await Question.distinct('exam', { exam: { $ne: null, $ne: '' } });
    const years = await Question.distinct('year', { year: { $ne: null } });
    setCache(res, 3600, 7200); // 1h browser, 2h edge
    res.status(200).json({
      subjects: subjects.sort(),
      exams: exams.sort(),
      years: years.sort((a, b) => b - a)
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * GET /api/questions/:id/related
 * Based on same topic + exam; exclude current
 */
export const getRelatedQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid question id' });
    }

    const original = await Question.findById(id, { topic: 1, exam: 1 }).lean();
    if (!original) return res.status(404).json({ message: 'Original question not found' });

    const related = await Question.find(
      { topic: original.topic, exam: original.exam, _id: { $ne: id } },
      { questionText: 1, exam: 1, subject: 1, topic: 1 } // projection
    )
      .limit(5)
      .lean();

    setCache(res, 300, 900);
    res.status(200).json(related);
  } catch (error) {
    console.error('Error fetching related questions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * GET /api/public-questions
 * (If you truly need all) — but keep projection and sort.
 */
export const getPublicQuestions = async (req, res) => {
  try {
    const questions = await Question.find({}, { questionText: 1, subject: 1, exam: 1, year: 1, updatedAt: 1 })
      .sort({ year: -1 })
      .limit(1000)     // protect against unbounded result sets
      .lean();
    setCache(res, 120, 600);
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching public questions:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
