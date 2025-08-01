import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { HelpCircle, Newspaper, FileText, PlusCircle, BookCopy, BarChart3, Clock } from 'lucide-react';
import styles from './DashboardPage.module.css';

const StatCard = ({ title, value, icon, color }) => (
    <div className={styles.statCard}>
        <div className={styles.statIcon} style={{ backgroundColor: color }}>{icon}</div>
        <div className={styles.statInfo}>
            <p>{value}</p>
            <h3>{title}</h3>
        </div>
    </div>
);

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch stats and recent posts at the same time
                const [statsRes, postsRes] = await Promise.all([
                    api.get('/questions/stats'),
                    api.get('/posts?limit=5') // Assumes your API supports a limit query
                ]);
                setStats(statsRes.data);
                setRecentPosts(postsRes.data);
            } catch (err)
            {
                console.error("Failed to fetch dashboard data:", err);
                setError('Could not load dashboard data. Please try refreshing.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading) return <div className={styles.loading}>Loading Dashboard...</div>;
    if (error) return <p className={styles.error}>{error}</p>;

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <h1>{getGreeting()}, {user?.name || 'Admin'}!</h1>
                <p>Here's a quick overview of your question bank.</p>
            </header>

            <div className={styles.statsGrid}>
                <StatCard title="Total Questions" value={stats?.totalQuestions || 0} icon={<HelpCircle />} color="#4f46e5" />
                <StatCard title="Total Subjects" value={stats?.totalSubjects || 0} icon={<BookCopy />} color="#059669" />
                <StatCard title="Total Exams" value={stats?.totalExams || 0} icon={<BarChart3 />} color="#d97706" />
                <StatCard title="Recent Posts" value={recentPosts?.length || 0} icon={<Newspaper />} color="#db2777" />
            </div>

            <div className={styles.mainGrid}>
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Quick Actions</h2>
                    <div className={styles.quickActions}>
                        <Link to="/admin/posts/add" className={styles.actionButton}>
                            <PlusCircle />
                            <span>Add New Post</span>
                        </Link>
                        <Link to="/admin/questions/add" className={styles.actionButton}>
                            <PlusCircle />
                            <span>Add New Question</span>
                        </Link>
                         <Link to="/admin/reports" className={styles.actionButton}>
                            <FileText />
                            <span>View Reports</span>
                        </Link>
                    </div>
                </div>

                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Recent Activity</h2>
                    <ul className={styles.recentActivityList}>
                        {recentPosts.length > 0 ? (
                            recentPosts.map(post => (
                                <li key={post._id}>
                                    <div className={styles.activityInfo}>
                                        <p className={styles.activityTitle}>{post.title}</p>
                                        <span className={styles.activityMeta}>
                                            <Clock size={14} /> 
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <Link to={`/admin/posts/edit/${post._id}`} className={styles.editLink}>Edit</Link>
                                </li>
                            ))
                        ) : (
                            <p>No recent posts found.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;