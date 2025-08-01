import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import styles from './ReportsPage.module.css'; // A new, dedicated CSS file
import { Edit, CheckCircle } from 'lucide-react';

const ReportsPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Pending'); // 'Pending' or 'Resolved'

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch reports based on the active status tab
            const response = await api.get(`/reports?status=${activeTab}`);
            setReports(response.data || []);
        } catch (error) {
            toast.error("Failed to fetch reports.");
            setReports([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleStatusUpdate = async (id, newStatus) => {
        const confirmAction = window.confirm(`Are you sure you want to mark this report as ${newStatus}?`);
        if (confirmAction) {
            try {
                await api.patch(`/reports/${id}/status`, { status: newStatus });
                toast.success(`Report marked as ${newStatus}.`);
                fetchReports(); // Refresh the list
            } catch (error) {
                toast.error('Failed to update report status.');
            }
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Reported Issues</h1>
            </header>
            
            <div className={styles.card}>
                <div className={styles.tabsContainer}>
                    <button 
                        onClick={() => setActiveTab('Pending')} 
                        className={`${styles.tabButton} ${activeTab === 'Pending' ? styles.activeTab : ''}`}
                    >
                        Pending
                    </button>
                    <button 
                        onClick={() => setActiveTab('Resolved')} 
                        className={`${styles.tabButton} ${activeTab === 'Resolved' ? styles.activeTab : ''}`}
                    >
                        Resolved
                    </button>
                </div>

                <div className={styles.tableWrapper}>
                    <p className={styles.countInfo}>{reports.length} {activeTab.toLowerCase()} reports found.</p>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Question Info</th>
                                <th>Issue Description</th>
                                <th>Date Reported</th>
                                <th className={styles.actionsHeader}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className={styles.loader}>Loading...</td></tr>
                            ) : reports.length > 0 ? (
                                reports.map(report => (
                                    <tr key={report._id}>
                                        <td className={styles.questionInfo}>
                                            <strong>{report.questionId?.exam}</strong> - {report.questionId?.subject}
                                        </td>
                                        <td>{report.issueDescription}</td>
                                        <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                        <td className={styles.actionsCell}>
                                            <Link 
                                                to={`/admin/questions/edit/${report.questionId?._id}`} 
                                                className={`${styles.actionBtn} ${styles.editBtn}`} 
                                                title="Edit this question"
                                            >
                                                <Edit size={18} /> Edit Question
                                            </Link>
                                            {report.status === 'Pending' && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(report._id, 'Resolved')} 
                                                    className={`${styles.actionBtn} ${styles.resolveBtn}`} 
                                                    title="Mark as Resolved"
                                                >
                                                    <CheckCircle size={18} /> Mark Resolved
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className={styles.noResults}>No {activeTab.toLowerCase()} reports found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;