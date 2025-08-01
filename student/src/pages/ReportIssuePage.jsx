import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import styles from './ReportIssuePage.module.css'; 

const PREDEFINED_ISSUES = [
    "The correct answer is marked incorrectly.",
    "There is a typo in the question.",
    "There is a typo in the solution/explanation.",
    "The question image is unclear or wrong.",
    "I have issue with video solution",
    "Other issue (please describe below)."
];

const ReportIssuePage = () => {
    const { id: questionId } = useParams();
    const [selectedIssue, setSelectedIssue] = useState('');
    const [clarification, setClarification] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedIssue) {
            setError('Please select an issue type.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        // Combine the predefined issue with the user's clarification
        const finalIssueDescription = `${selectedIssue}\n\nAdditional Clarification:\n${clarification || 'None provided.'}`;

        try {
            await api.post('/reports', {
                questionId,
                issueDescription: finalIssueDescription,
            });
            setSuccess('Thank you! Your report has been submitted. We will review it shortly.');
            toast.success('Report submitted successfully!');
            setTimeout(() => {
                navigate(-1); // Go back to the previous page
            }, 3000);
        } catch (err) {
            setError('Failed to submit report. Please try again later.');
            toast.error('Submission failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
             <Helmet>
                <title>Report an Issue | Maarula Classes</title>
                <meta name="description" content="Report an issue with a question in the Maarula Classes question bank. Help us improve our content." />
            </Helmet>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h1>Report an Issue</h1>
                    <p>Help us improve by selecting the type of problem you found.</p>
                </div>
                <div className={styles.cardBody}>
                    {success ? (
                        <p className={styles.success}>{success}</p>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {error && <p className={styles.error}>{error}</p>}
                            
                            <div className={styles.inputGroup}>
                                <label>1. Select the issue type</label>
                                <div className={styles.issueOptions}>
                                    {PREDEFINED_ISSUES.map(issue => (
                                        <button
                                            type="button"
                                            key={issue}
                                            onClick={() => setSelectedIssue(issue)}
                                            className={`${styles.issueButton} ${selectedIssue === issue ? styles.selected : ''}`}
                                        >
                                            {issue}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {selectedIssue && (
                                <div className={styles.inputGroup}>
                                    <label htmlFor="clarification">2. Provide more details (optional)</label>
                                    <textarea
                                        id="clarification"
                                        value={clarification}
                                        onChange={(e) => setClarification(e.target.value)}
                                        rows="5"
                                        placeholder="e.g., 'Option B seems to be the correct answer because...'"
                                        className={styles.textarea}
                                    />
                                </div>
                            )}

                            <button type="submit" className={styles.submitBtn} disabled={loading || !selectedIssue}>
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportIssuePage;