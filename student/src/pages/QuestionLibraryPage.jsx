import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import { Helmet } from 'react-helmet-async';
import MathPreview from '../components/MathPreview';
import { Filter, Search, X } from 'lucide-react';
import styles from './QuestionLibraryPage.module.css';

const SITE_URL = 'https://question.maarula.in';
const PAGE_URL = `${SITE_URL}/questions`;

const QuestionLibraryPage = () => {
  const [allQuestions, setAllQuestions] = useState([]); // always an array
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({ exams: [], subjects: [], years: [] });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Read current filters from the URL
  const currentFilters = {
    search: searchParams.get('search') || '',
    exam: searchParams.get('exam') || '',
    subject: searchParams.get('subject') || ''
  };
  const [searchTerm, setSearchTerm] = useState(currentFilters.search);

  // Fetch questions + filter options
  useEffect(() => {
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [questionsRes, filtersRes] = await Promise.all([
          api.get('/questions/public'),
          api.get('/questions/filters')
        ]);

        // Defensive parsing for both shapes (array or {questions: [...]})
        const qPayload = questionsRes?.data ?? [];
        const list = Array.isArray(qPayload) ? qPayload : (qPayload.questions ?? []);
        setAllQuestions(Array.isArray(list) ? list : []);

        const fPayload = filtersRes?.data ?? {};
        setFilterOptions({
          exams: fPayload.exams ?? [],
          subjects: fPayload.subjects ?? [],
          years: fPayload.years ?? []
        });
      } catch (err) {
        console.error('Failed to fetch data', err);
        setAllQuestions([]);
        setFilterOptions({ exams: [], subjects: [], years: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
const [expandedById, setExpandedById] = useState({});
const toggleExpand = (id) => {
  setExpandedById(prev => ({ ...prev, [id]: !prev[id] }));
};

  // Client-side filtering
  const filteredQuestions = useMemo(() => {
    const s = currentFilters.search.toLowerCase();
    return (allQuestions ?? []).filter(q => {
      const text = (q?.questionText || '').toLowerCase();
      const examMatch = currentFilters.exam ? q?.exam === currentFilters.exam : true;
      const subjectMatch = currentFilters.subject ? q?.subject === currentFilters.subject : true;
      const searchMatch = s ? text.includes(s) : true;
      return examMatch && subjectMatch && searchMatch;
    });
  }, [allQuestions, currentFilters.search, currentFilters.exam, currentFilters.subject]);

  const handleFilterChange = (name, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(name, value);
    else newParams.delete(name);
    setSearchParams(newParams);
    setIsFilterOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('search', searchTerm);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchParams({});
    setIsFilterOpen(false);
  };

  // --- SEO: Breadcrumbs + ItemList ---
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Question Bank', item: PAGE_URL }
    ]
  };

  // Optional: item list of the first ~20 questions (URLs only) for richer understanding
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: (filteredQuestions.slice(0, 20) || []).map((q, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `${SITE_URL}/question/${q?._id}`
    }))
  };

  const pageTitle = 'NIMCET & CUET-PG Previous Year Question Bank | Maarula Classes';
  const pageDescription =
    'Mathem Solvex by Maarula Classes: Access and solve thousands of Previous Year Questions (PYQs) for NIMCET, CUET-PG, and other MCA entrance exams — with detailed solutions. Filter by exam and subject to boost your preparation.';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={PAGE_URL} />

        {/* Open Graph / Twitter */}
        <meta property="og:title" content="The Ultimate MCA Entrance Question Bank" />
        <meta property="og:description" content="Filter and practice thousands of PYQs for NIMCET, CUET-PG, and more — with solutions." />
        <meta property="og:url" content={PAGE_URL} />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
      </Helmet>

      <div className={styles.pageHeader}>
        <h1>MCA Entrance Previous Year Question Bank (PYQs)</h1>
        <p>
          Mathem Solvex by Maarula Classes — a comprehensive library of solved PYQs for
          NIMCET, CUET-PG, and other MCA entrance exams. Use filters to quickly find the
          right practice questions for your preparation.
        </p>
      </div>

      {isFilterOpen && <div className={styles.overlay} onClick={() => setIsFilterOpen(false)} />}

      <div className={styles.container}>
        <aside className={`${styles.filterSidebar} ${isFilterOpen ? styles.open : ''}`}>
          <button className={styles.closeFilterButton} onClick={() => setIsFilterOpen(false)}>
            <X size={24} /> Close
          </button>

          <form onSubmit={handleSearch} className={styles.searchForm}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </form>

          <div className={styles.filterGroup}>
            <h4>Exam</h4>
            <div className={styles.filterOptionsContainer}>
              {(filterOptions.exams ?? []).map((exam) => (
                <button
                  key={exam}
                  onClick={() => handleFilterChange('exam', exam)}
                  className={searchParams.get('exam') === exam ? styles.activeFilter : ''}
                >
                  {exam}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h4>Subject</h4>
            <div className={styles.filterOptionsContainer}>
              {(filterOptions.subjects ?? []).map((subject) => (
                <button
                  key={subject}
                  onClick={() => handleFilterChange('subject', subject)}
                  className={searchParams.get('subject') === subject ? styles.activeFilter : ''}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          <button onClick={clearFilters} className={styles.clearButton}>Clear All Filters</button>
        </aside>

        <main className={styles.questionList}>
          <div className={styles.listHeader}>
            <span>
              {loading ? 'Loading…' : `Showing ${filteredQuestions.length} question${filteredQuestions.length === 1 ? '' : 's'}`}
            </span>
            <button className={styles.mobileFilterToggle} onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <Filter size={18} /> Filters
            </button>
          </div>

          {loading ? (
            <p>Loading questions...</p>
          ) : (filteredQuestions ?? []).length > 0 ? (
            (filteredQuestions ?? []).map((q) => (
              <Link to={`/question/${q?._id}`} key={q?._id} className={styles.questionCard}>
                <div className={styles.tags}>
                  {q?.exam && <span className={styles.tag}>{q.exam}</span>}
                  {q?.subject && <span className={styles.tag}>{q.subject}</span>}
                  {q?.year && <span className={styles.tag}>{q.year}</span>}
                </div>

                <div className={styles.questionText}>
                  <MathPreview latexString={q?.questionText || ''} />
                </div>

                {/* Removed options preview to avoid undefined.map on list (faster + cleaner) */}
                <div className={styles.viewLink}>Attempt &amp; View Solution &rarr;</div>
              </Link>
            ))
          ) : (
            <div className={styles.noResults}>No questions found for the selected filters.</div>
          )}
        </main>
      </div>
    </>
  );
};

export default QuestionLibraryPage;
