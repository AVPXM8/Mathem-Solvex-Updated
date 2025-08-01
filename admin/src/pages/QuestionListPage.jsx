// import React, { useState, useEffect, useMemo } from 'react';
// import { Link } from 'react-router-dom';
// import api from '../api';
// import styles from './QuestionListPage.module.css';
// import MathPreview from '../components/MathPreview';
// import toast from 'react-hot-toast';
// import { PlusCircle, Edit, Trash2 } from 'lucide-react';

// const ITEMS_PER_PAGE = 15;

// const QuestionListPage = () => {
//     const [allQuestions, setAllQuestions] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [deletingIds, setDeletingIds] = useState(new Set());
    
//     // New state for filtering and pagination
//     const [filters, setFilters] = useState({ exam: '', subject: '', year: '' });
//     const [searchTerm, setSearchTerm] = useState('');
//     const [currentPage, setCurrentPage] = useState(1);

//     useEffect(() => {
//         const fetchQuestions = async () => {
//             try {
//                 const response = await api.get('/questions');
//                 setAllQuestions(response.data);
//             } catch (error) {
//                 console.error("Failed to fetch questions", error);
//                 toast.error("Could not load questions.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchQuestions();
//     }, []);

//     const handleDelete = async (id) => {
//         if (window.confirm('Are you sure you want to permanently delete this question?')) {
//             setDeletingIds(prev => new Set(prev).add(id));
//             try {
//                 await api.delete(`/questions/${id}`);
//                 setAllQuestions(prev => prev.filter((q) => q._id !== id));
//                 toast.success('Question deleted successfully!');
//             } catch (error) {
//                 toast.error('Delete failed on server. Please refresh.');
//                 console.error('Failed to delete question:', error);
//             } finally {
//                 setDeletingIds(prev => {
//                     const newSet = new Set(prev);
//                     newSet.delete(id);
//                     return newSet;
//                 });
//             }
//         }
//     };

//     // Memoized filtering logic
//     const filteredQuestions = useMemo(() => {
//         return allQuestions
//             .filter(q => q.questionText.toLowerCase().includes(searchTerm.toLowerCase()))
//             .filter(q => filters.exam ? q.exam === filters.exam : true)
//             .filter(q => filters.subject ? q.subject === filters.subject : true)
//             .filter(q => filters.year ? q.year == filters.year : true);
//     }, [allQuestions, searchTerm, filters]);
    
//     const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);

//     const paginatedQuestions = useMemo(() => {
//         const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//         return filteredQuestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
//     }, [filteredQuestions, currentPage]);

//     // Dynamically generate filter options from the data
//     const filterOptions = useMemo(() => {
//         const exams = [...new Set(allQuestions.map(q => q.exam))];
//         const subjects = [...new Set(allQuestions.map(q => q.subject))];
//         const years = [...new Set(allQuestions.map(q => q.year))];
//         return { exams, subjects, years };
//     }, [allQuestions]);

//     const handleFilterChange = (e) => {
//         setCurrentPage(1); // Reset to first page on filter change
//         setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
//     };

//     if (loading) return <div className={styles.loader}>Loading Questions...</div>;

//     return (
//         <div className={styles.container}>
//             <header className={styles.header}>
//                 <h1>Question Management</h1>
//                 <Link to="/admin/questions/add" className={styles.addBtn}>
//                     <PlusCircle size={20} />
//                     Add New Question
//                 </Link>
//             </header>
            
//             <div className={styles.filterControls}>
//                 <input
//                     type="text"
//                     placeholder="Search questions..."
//                     className={styles.searchInput}
//                     onChange={(e) => {
//                         setCurrentPage(1);
//                         setSearchTerm(e.target.value);
//                     }}
//                 />
//                 <select name="exam" onChange={handleFilterChange} className={styles.filterDropdown}>
//                     <option value="">All Exams</option>
//                     {filterOptions.exams.map(opt => <option key={opt} value={opt}>{opt}</option>)}
//                 </select>
//                 <select name="subject" onChange={handleFilterChange} className={styles.filterDropdown}>
//                     <option value="">All Subjects</option>
//                     {filterOptions.subjects.map(opt => <option key={opt} value={opt}>{opt}</option>)}
//                 </select>
//                 <select name="year" onChange={handleFilterChange} className={styles.filterDropdown}>
//                     <option value="">All Years</option>
//                     {filterOptions.years.sort((a,b) => b-a).map(opt => <option key={opt} value={opt}>{opt}</option>)}
//                 </select>
//             </div>
            
//             <p className={styles.countInfo}>Showing {paginatedQuestions.length} of {filteredQuestions.length} matching questions.</p>

//             <div className={styles.tableWrapper}>
//                 <table className={styles.questionsTable}>
//                     <thead>
//                         <tr>
//                             <th>Exam</th>
//                             <th>Subject</th>
//                             <th>Year</th>
//                             <th>Question Preview</th>
//                             <th className={styles.actionsHeader}>Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {paginatedQuestions.length > 0 ? (
//                             paginatedQuestions.map((question) => (
//                                 <tr key={question._id} className={deletingIds.has(question._id) ? styles.deleting : ''}>
//                                     <td>{question.exam}</td>
//                                     <td>{question.subject}</td>
//                                     <td>{question.year}</td>
//                                     <td>
//                                         <div className={styles.questionPreview}>
//                                             <MathPreview latexString={question.questionText} />
//                                         </div>
//                                     </td>
//                                     <td className={styles.actionsCell}>
//                                         <Link to={`/admin/questions/edit/${question._id}`} className={`${styles.actionBtn} ${styles.editBtn}`} title="Edit">
//                                             <Edit size={18} />
//                                         </Link>
//                                         <button onClick={() => handleDelete(question._id)} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete">
//                                             <Trash2 size={18} />
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))
//                         ) : (
//                             <tr>
//                                 <td colSpan="5">No questions found matching your criteria.</td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             <div className={styles.pagination}>
//                 <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
//                 <span>Page {currentPage} of {totalPages}</span>
//                 <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
//             </div>
//         </div>
//     );
// };

// export default QuestionListPage;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import styles from './QuestionListPage.module.css';
import MathPreview from '../components/MathPreview';
import toast from 'react-hot-toast';
import { PlusCircle, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

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
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

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
            toast.error("Could not load questions.");
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
                // Refresh the data after deletion
                fetchQuestions(); 
            } catch (error) {
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

    // Replace with a call to your API to get unique filter options
    const filterOptions = { exams: ['NIMCET', 'CUET-PG'], subjects: ['Mathematics', 'Reasoning', 'Computer'], years: [2025, 2024, 2023] };

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
                        placeholder="Search questions..."
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
                    <button onClick={resetFilters} className={styles.clearBtn}>Clear Filters</button>
                </div>

                <div className={styles.tableWrapper}>
                    <p className={styles.countInfo}>Showing {questions.length} of {totalCount} total questions.</p>
                    <table className={styles.questionsTable}>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('exam')} className={styles.sortable}>Exam <ArrowUpDown size={14} /></th>
                                <th onClick={() => handleSort('subject')} className={styles.sortable}>Subject <ArrowUpDown size={14} /></th>
                                <th onClick={() => handleSort('year')} className={styles.sortable}>Year <ArrowUpDown size={14} /></th>
                                <th>Question Preview</th>
                                <th className={styles.actionsHeader}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className={styles.loader}>Loading...</td></tr>
                            ) : questions.length > 0 ? (
                                questions.map((question) => (
                                    <tr key={question._id}>
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
                                <tr><td colSpan="5" className={styles.noResults}>No questions found matching your criteria.</td></tr>
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