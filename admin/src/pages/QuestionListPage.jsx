import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import styles from './QuestionListPage.module.css';
import MathPreview from '../components/MathPreview';
import toast from 'react-hot-toast';
import { PlusCircle, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

const ITEMS_PER_PAGE = 15;

// get page from sessionStorage
const getInitialPage = () => {
  const saved = sessionStorage.getItem('questionListPage');
  return saved ? Number(saved) : 1;
};

const QuestionListPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({ exam: '', subject: '', year: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // ADDED: initialize from sessionStorage
  const [currentPage, setCurrentPage] = useState(getInitialPage);

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: 'questionNumber',
    direction: 'desc',
  });

  //  ADDED: go-to-page input
  const [pageInput, setPageInput] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  //  ADDED: persist page on change
  useEffect(() => {
    sessionStorage.setItem('questionListPage', currentPage);
  }, [currentPage]);

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
      console.error('Error fetching questions:', error);
      toast.error('Could not load questions. Please check server connection.');
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
        console.error('Error deleting question:', error);
        toast.error('Delete failed. Please try again.');
      }
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setCurrentPage(1);
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e) => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetFilters = () => {
    setFilters({ exam: '', subject: '', year: '' });
    setSearchTerm('');
    setCurrentPage(1);
    setSortConfig({ key: 'createdAt', direction: 'desc' });
  };

  // ADDED: go-to-page handler
  const goToPage = () => {
    const page = Number(pageInput);
    if (!page || page < 1 || page > totalPages) {
      toast.error(`Page must be between 1 and ${totalPages}`);
      return;
    }
    setCurrentPage(page);
    setPageInput('');
  };

  const numColumns = 6;

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

          <select name="exam" value={filters.exam} onChange={handleFilterChange}>
            <option value="">All Exams</option>
            <option value="NIMCET">NIMCET</option>
            <option value="IGDTUW"></option>
            <option value="CUET PG">CUET PG</option>
            <option value="JAMIA">JAMIA</option>
            <option value="MAH-CET">MAH-CET</option>
            <option value="NDA">NDA</option>
            <option value="JEE">JEE</option>
          </select>

          <select name="subject" value={filters.subject} onChange={handleFilterChange}>
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Reasoning">Reasoning</option>
            <option value="Computer">Computer</option>
          </select>

          <select name="year" value={filters.year} onChange={handleFilterChange}>
            <option value="">All Years</option>
            {[2025, 2024, 2023, 2022, 2021, 2020].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button onClick={resetFilters} className={styles.clearBtn}>
            Clear Filters
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <p className={styles.countInfo}>
            Showing {questions.length} of {totalCount} total questions.
          </p>

          <table className={styles.questionsTable}>
            <thead>
              <tr>
                <th onClick={() => handleSort('questionNumber')}>
                  <div className={styles.sortableContent}>
                    Q. No. <ArrowUpDown size={14} />
                  </div>
                </th>
                <th onClick={() => handleSort('exam')}>Exam</th>
                <th onClick={() => handleSort('subject')}>Subject</th>
                <th onClick={() => handleSort('year')}>Year</th>
                <th>Question Preview</th>
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={numColumns} className={styles.loader}>Loading...</td>
                </tr>
              ) : questions.length > 0 ? (
                questions.map((question) => (
                  <tr key={question._id}>
                    <td>{question.questionNumber}</td>
                    <td>{question.exam}</td>
                    <td>{question.subject}</td>
                    <td>{question.year}</td>
                    <td>
                      <div className={styles.questionPreview}>
                        <MathPreview latexString={question.questionText} />
                      </div>
                    </td>
                    <td className={styles.actionsCell}>
                      <Link
                        to={`/admin/questions/edit/${question._id}`}
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        title="Edit"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(question._id)}
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={numColumns} className={styles.noResults}>
                    No questions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* EXTENDED PAGINATION */}
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span>Page {currentPage} of {totalPages}</span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </button>

          {/* Go to page */}
          <input
            type="number"
            placeholder="Go to page"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            style={{ width: '90px', marginLeft: '8px' }}
          />
          <button onClick={goToPage}>Go</button>
        </div>
      </div>
    </div>
  );
};

export default QuestionListPage;

