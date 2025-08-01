import Report from '../models/Report.js';

// @desc    Create a new report (by a student)
// @route   POST /api/reports
export const createReport = async (req, res) => {
    try {
        const { questionId, issueDescription } = req.body;
        if (!questionId || !issueDescription) {
            return res.status(400).json({ message: 'Question ID and description are required.' });
        }
        const newReport = new Report({ questionId, issueDescription });
        await newReport.save();
        res.status(201).json({ message: 'Issue reported successfully. Thank you!' });
    } catch (error) {
        res.status(400).json({ message: 'Error submitting report', error: error.message });
    }
};

// @desc    Get all reports with status filtering (Admin only)
// @route   GET /api/reports?status=Pending
export const getReports = async (req, res) => {
    try {
        const { status = 'Pending' } = req.query;
        const reports = await Report.find({ status: status })
            .populate('questionId', 'subject exam')
            .sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a report's status (e.g., to "Resolved")
// @route   PATCH /api/reports/:id/status
export const updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['Pending', 'Resolved', 'Dismissed'].includes(status)) {
            return res.status(400).json({ message: 'A valid status is required.' });
        }
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.status(200).json(report);
    } catch (error) {
        console.error('Error updating report status:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a report by its ID (Admin only)
// @route   DELETE /api/reports/:id
export const deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        await report.deleteOne();
        res.status(200).json({ message: 'Report removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};