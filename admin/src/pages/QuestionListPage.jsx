import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import styles from './QuestionListPage.module.css';
import MathPreview from '../components/MathPreview';
import toast from 'react-hot-toast';
import { PlusCircle, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce'; // Assuming you have this hook

const ITEMS_PER_PAGE = 15;

const QuestionListPage = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State for server-side operations
    const [filters, setFilters] = useState({ exam: '', subject: '', year: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: 'questionNumber', direction: 'desc' });

    const debouncedSearchTerm = useDebounce(searchTerm, 400);

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                search: debouncedSearchTerm,
                exam: filters.exam,
                subject: filters.subject,
                year: filters.year,
                sortBy: sortConfig.key,
                order: sortConfig.direction,
            });
            const response = await api.get(`/questions?${params.toString()}`);
            setQuestions(response.data.questions || []);
            setTotalPages(response.data.totalPages || 1);
            setTotalCount(response.data.totalCount || 0);
        } catch (error) {
            console.error("Error fetching questions:", error);
            toast.error("Could not load questions. Please check server connection.");
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters, debouncedSearchTerm, sortConfig]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this question?')) {
            try {
                await api.delete(`/questions/${id}`);
                toast.success('Question deleted successfully!');
                fetchQuestions(); 
            } catch (error) {
                console.error("Error deleting question:", error);
                toast.error('Delete failed. Please try again.');
            }
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setCurrentPage(1); // Reset to first page on sort
        setSortConfig({ key, direction });
    };

    const handleFilterChange = (e) => {
        setCurrentPage(1);
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const resetFilters = () => {
        setFilters({ exam: '', subject: '', year: '' });
        setSearchTerm('');
        setCurrentPage(1);
        setSortConfig({ key: 'createdAt', direction: 'desc' });
    };

    const filterOptions = { exams: ['NIMCET', 'CUET PG', 'JEE'], subjects: ['Mathematics', 'Reasoning', 'Computer'], years: [2025, 2024, 2023, 2022, 2021,2020,2019,2018,2017,2016,2015,2014,2013] };

    const numColumns = 6; // Q.No, Exam, Subject, Year, Question Preview, Actions

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Question Management</h1>
                <Link to="/admin/questions/add" className={styles.addBtn}>
                    <PlusCircle size={20} />
                    Add New Question
                </Link>
            </header>
            
            <div className={styles.card}>
                <div className={styles.filterControls}>
                    <input
                        type="text"
                        value={searchTerm}
                        placeholder="Search questions by text or Q.No..."
                        className={styles.searchInput}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select name="exam" value={filters.exam} onChange={handleFilterChange} className={styles.filterDropdown}>
                        <option value="">All Exams</option>
                        {filterOptions.exams.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <select name="subject" value={filters.subject} onChange={handleFilterChange} className={styles.filterDropdown}>
                        <option value="">All Subjects</option>
                        {filterOptions.subjects.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                     <select name="year" value={filters.year} onChange={handleFilterChange} className={styles.filterDropdown}>
                        <option value="">All Years</option>
                        {filterOptions.years.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <button onClick={resetFilters} className={styles.clearBtn}>Clear Filters</button>
                </div>

                <div className={styles.tableWrapper}>
                    <p className={styles.countInfo}>Showing {questions.length} of {totalCount} total questions.</p>
                    <table className={styles.questionsTable}>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('questionNumber')}>
                                    <div className={styles.sortableContent}>Q. No. <ArrowUpDown size={14} /></div>
                                </th>
                                <th onClick={() => handleSort('exam')}>
                                    <div className={styles.sortableContent}>Exam <ArrowUpDown size={14} /></div>
                                </th>
                                <th onClick={() => handleSort('subject')}>
                                    <div className={styles.sortableContent}>Subject <ArrowUpDown size={14} /></div>
                                </th>
                                <th onClick={() => handleSort('year')}>
                                    <div className={styles.sortableContent}>Year <ArrowUpDown size={14} /></div>
                                </th>
                                <th>Question Preview</th>
                                <th className={styles.actionsHeader}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={numColumns} className={styles.loader}>Loading...</td></tr>
                            ) : questions.length > 0 ? (
                                questions.map((question) => (
                                    <tr key={question._id}>
                                        <td>{question.questionNumber}</td>
                                        <td>{question.exam}</td>
                                        <td>{question.subject}</td>
                                        <td>{question.year}</td>
                                        <td>
                                            <div className={styles.questionPreview}><MathPreview latexString={question.questionText} /></div>
                                        </td>
                                        <td className={styles.actionsCell}>
                                            <Link to={`/admin/questions/edit/${question._id}`} className={`${styles.actionBtn} ${styles.editBtn}`} title="Edit"><Edit size={18} /></Link>
                                            <button onClick={() => handleDelete(question._id)} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={numColumns} className={styles.noResults}>No questions found matching your criteria.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={styles.pagination}>
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>Next</button>
                </div>
            </div>
        </div>
    );
};

export default QuestionListPage;