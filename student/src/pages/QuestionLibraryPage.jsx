// QuestionLibraryPage.jsx
// FINAL — Staged filters (apply on Search/Done), focus-safe search (stable subcomponent),
// AbortController in-effect, SEO & pagination preserved.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import api from '../api';
import { Helmet } from 'react-helmet-async';
import MathPreview from '../components/MathPreview';
import { Filter, Search, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import styles from './QuestionLibraryPage.module.css';

const SITE_URL = 'https://question.maarula.in';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og/maarula-question-bank.png`;

// Build absolute URLs for SEO tags (canonical, prev/next, schema.org)
const absUrl = (path, query = '') => `${SITE_URL}${path}${query ? `?${query}` : ''}`;

// Sanitize any accidental double slashes in path fragments
const sanitizePath = (p) => p.replace(/\/{2,}/g, '/');

/* -------------------------------------------------------------------------- */
/*  STABLE FILTER FORM (OUTSIDE PARENT) — prevents input losing focus          */
/*  Now uses STAGED state (pendingExam/pendingSubject) and BUTTONS (not Links) */
/* -------------------------------------------------------------------------- */
const FilterFormContent = React.memo(function FilterFormContent({
  onSubmitSearch,           // submit handler from parent (applies + closes)
  searchTerm,
  setSearchTerm,
  filterOptions,
  // staged selections
  pendingExam,
  setPendingExam,
  pendingSubject,
  setPendingSubject,
  // apply all staged changes (also closes)
  applyFilters,
  // clear helpers
  clearAllFilters,
}) {
  return (
    <div className={styles.filterContent}>
      <form
        className={styles.searchForm}
        role="search"
        aria-label="Question search"
        onSubmit={onSubmitSearch}
      >
        <Search size={20} className={styles.searchIcon} />
        <input
          type="search"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
          aria-label="Search questions by text"
        />
        <button type="submit" className={styles.searchSubmitButton} aria-label="Apply search">
          Search
        </button>
      </form>

      <div className={styles.filterGroup}>
        <h4>Exam</h4>
        <div className={styles.filterOptionsContainer}>
          {(filterOptions.exams ?? []).map((exam) => {
            const isActive = pendingExam === exam;
            return (
              <button
                type="button"
                key={exam}
                className={`${styles.filterLink} ${isActive ? styles.activeFilter : ''}`}
                aria-pressed={isActive}
                onClick={() => setPendingExam((prev) => (prev === exam ? '' : exam))}
              >
                {exam}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.filterGroup}>
        <h4>Subject</h4>
        <div className={styles.filterOptionsContainer}>
          {(filterOptions.subjects ?? []).map((subject) => {
            const isActive = pendingSubject === subject;
            return (
              <button
                type="button"
                key={subject}
                className={`${styles.filterLink} ${isActive ? styles.activeFilter : ''}`}
                aria-pressed={isActive}
                onClick={() => setPendingSubject((prev) => (prev === subject ? '' : subject))}
              >
                {subject}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.filterActions}>
        {/* APPLY staged selections + search; also closes panel */}
        <button type="button" onClick={applyFilters} className={styles.applyFiltersButton}>
          Done
        </button>

        {/* Clear both applied & staged selections */}
        <button
          type="button"
          onClick={() => {
            setPendingExam('');
            setPendingSubject('');
            clearAllFilters();
          }}
          className={styles.clearAllFiltersButton}
        >
          Clear All
        </button>
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*                               PAGE COMPONENT                                */
/* -------------------------------------------------------------------------- */

const QuestionLibraryPage = () => {
  // Data + UI state
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({ exams: [], subjects: [], years: [] });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Router + pagination
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Search input (uncommitted text)
  const [searchTerm, setSearchTerm] = useState('');

  // STAGED selections (not applied until Search/Done)
  const [pendingExam, setPendingExam] = useState('');
  const [pendingSubject, setPendingSubject] = useState('');

  // Refs
  const questionListRef = useRef(null);
  const filterToggleBtnRef = useRef(null);

  // URL → applied filters
  const currentAppliedFilters = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      exam: searchParams.get('exam') || '',
      subject: searchParams.get('subject') || '',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '10', 10),
    }),
    [searchParams]
  );

  // Keep input synced with URL
  useEffect(() => {
    setSearchTerm(currentAppliedFilters.search);
  }, [currentAppliedFilters.search]);

  // When opening the filter panel, hydrate STAGED selections from applied ones
  useEffect(() => {
    if (isFilterOpen) {
      setPendingExam(currentAppliedFilters.exam || '');
      setPendingSubject(currentAppliedFilters.subject || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFilterOpen]);

  // Build & apply URL (used by Search submit and Done button)
  const applyFilters = () => {
    const newParams = new URLSearchParams(searchParams);

    // staged exam/subject
    if (pendingExam) newParams.set('exam', pendingExam);
    else newParams.delete('exam');

    if (pendingSubject) newParams.set('subject', pendingSubject);
    else newParams.delete('subject');

    // current search text
    const trimmed = searchTerm.trim();
    if (trimmed) newParams.set('search', trimmed);
    else newParams.delete('search');

    newParams.set('page', '1');
    setSearchParams(newParams);

    // close panel & return focus
    setIsFilterOpen(false);
    filterToggleBtnRef.current?.focus();
  };

  // Submit-to-apply search (Enter or Search button) — also applies staged filters
  const onSubmitSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // Fetch filters once
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get('/questions/filters');
        if (!active) return;
        const f = res?.data ?? {};
        setFilterOptions({
          exams: f.exams ?? [],
          subjects: f.subjects ?? [],
          years: f.years ?? [],
        });
      } catch (e) {
        console.error('Failed to fetch filters', e);
        setFilterOptions({ exams: [], subjects: [], years: [] });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Fetch questions on applied URL change
  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    const { signal } = controller;

    const params = {
      page: currentAppliedFilters.page,
      limit: currentAppliedFilters.limit,
      search: currentAppliedFilters.search,
      exam: currentAppliedFilters.exam,
      subject: currentAppliedFilters.subject,
    };

    api
      .get('/questions/public', { params, signal })
      .then((res) => {
        const q = res?.data ?? {};
        setQuestions(Array.isArray(q.questions) ? q.questions : []);
        setTotalDocs(q.totalDocs ?? 0);
        setTotalPages(q.totalPages ?? 1);
        setCurrentPage(q.page ?? 1);
        setLimit(q.limit ?? 10);
      })
      .catch((err) => {
        if (err?.name !== 'CanceledError' && err?.message !== 'canceled') {
          console.error('Failed to fetch data', err);
          setQuestions([]);
          setTotalDocs(0);
          setTotalPages(1);
          setCurrentPage(1);
          setLimit(10);
        }
      })
      .finally(() => {
        setLoading(false);
        if (questionListRef.current) {
          questionListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });

    return () => controller.abort();
  }, [currentAppliedFilters]);

  // Clamp URL page to server-corrected page
  useEffect(() => {
    if (!loading && totalPages > 0) {
      const urlPage = parseInt(searchParams.get('page') || '1', 10);
      if (urlPage !== currentPage) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', String(currentPage));
        setSearchParams(newParams);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, totalPages, currentPage]);

  // Clear filters (applied + staged)
  const clearAllFilters = () => {
    setSearchTerm('');
    setPendingExam('');
    setPendingSubject('');
    setSearchParams({ page: '1', limit: String(limit) });
    setIsFilterOpen(false);
    filterToggleBtnRef.current?.focus();
  };

  const clearIndividualFilter = (filterName) => {
    const newParams = new URLSearchParams(searchParams);
    if (filterName === 'search') {
      setSearchTerm('');
      newParams.delete('search');
    } else {
      newParams.delete(filterName);
      // also sync staged if panel open
      if (isFilterOpen) {
        if (filterName === 'exam') setPendingExam('');
        if (filterName === 'subject') setPendingSubject('');
      }
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Pagination helpers
  const goToPage = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages && pageNumber !== currentPage) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', String(pageNumber));
      setSearchParams(newParams);
    }
  };
  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  // Active filter chips
  const activeFilterDisplay = useMemo(() => {
    const active = [];
    if (currentAppliedFilters.exam)
      active.push({ name: 'Exam', value: currentAppliedFilters.exam, key: 'exam' });
    if (currentAppliedFilters.subject)
      active.push({ name: 'Subject', value: currentAppliedFilters.subject, key: 'subject' });
    if (currentAppliedFilters.search)
      active.push({ name: 'Search', value: currentAppliedFilters.search, key: 'search' });
    return active;
  }, [currentAppliedFilters]);

  const hasActiveFilters = !!(
    currentAppliedFilters.exam ||
    currentAppliedFilters.subject ||
    currentAppliedFilters.search
  );

  // SEO
  const pageTitle = useMemo(() => {
    const bits = [];
    if (currentAppliedFilters.exam) bits.push(currentAppliedFilters.exam);
    if (currentAppliedFilters.subject) bits.push(currentAppliedFilters.subject);
    if (currentAppliedFilters.search) bits.push(`"${currentAppliedFilters.search}"`);
    const prefix = bits.length ? `${bits.join(' ')} PYQs | ` : '';
    const pageNum = totalPages > 1 ? `Page ${currentPage} of ${totalPages} | ` : '';
    return `${prefix}MCA Entrance Question Bank ${pageNum}| Maarula Classes`;
  }, [currentAppliedFilters, currentPage, totalPages]);

  const pageDescription = useMemo(() => {
    const bits = [];
    if (currentAppliedFilters.exam) bits.push(currentAppliedFilters.exam);
    if (currentAppliedFilters.subject) bits.push(currentAppliedFilters.subject);
    if (currentAppliedFilters.search) bits.push(`matching "${currentAppliedFilters.search}"`);
    const filterDesc = bits.length ? `Filtered by ${bits.join(', ')}. ` : '';
    return `Practice 17 years of MCA entrance PYQs (NIMCET, CUET-PG & more) with detailed solutions and video explanations across Mathematics, Computer Science, English, Logical Reasoning, and Aptitude. ${filterDesc}Search and filter to prepare smarter.`;
  }, [currentAppliedFilters]);

  // Canonical + prev/next
  const canonicalUrl = absUrl(location.pathname, searchParams.toString());
  const prevQuery = new URLSearchParams(searchParams);
  prevQuery.set('page', String(currentPage - 1));
  const nextQuery = new URLSearchParams(searchParams);
  nextQuery.set('page', String(currentPage + 1));
  const showPrevNext = totalPages > 1;
  const prevPageUrl =
    showPrevNext && currentPage > 1 ? absUrl(location.pathname, prevQuery.toString()) : null;
  const nextPageUrl =
    showPrevNext && currentPage < totalPages ? absUrl(location.pathname, nextQuery.toString()) : null;

  // Structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Question Bank', item: absUrl('/questions') },
    ],
  };

  const itemListSchema =
    questions.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: (questions.slice(0, 20) || []).map((q, idx) => ({
            '@type': 'ListItem',
            position: idx + 1 + (currentPage - 1) * limit,
            url: absUrl(sanitizePath(`/question/${q?._id}`)),
            name: (q?.questionText || 'Question').slice(0, 120),
          })),
        }
      : null;

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'MCA Entrance PYQ Question Bank',
    url: canonicalUrl,
    description: pageDescription,
    isPartOf: { '@type': 'WebSite', name: 'Maarula Classes', url: SITE_URL },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Are these questions updated for the latest NIMCET/CUET-PG pattern?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. We continuously update question tags and solutions to reflect the latest pattern and syllabus.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do all questions have solutions or videos?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All listed questions include detailed step-by-step solutions, and many also include short video explanations.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I filter by subject or specific topics?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use the filters for exam and subject, and the search box for topics, keywords, or formula names.',
        },
      },
    ],
  };

  return (
    <>
      {/* SEO Head */}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        {prevPageUrl && <link rel="prev" href={prevPageUrl} />}
        {nextPageUrl && <link rel="next" href={nextPageUrl} />}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
        {!loading && (questions.length === 0 || hasActiveFilters) && (
          <meta name="robots" content="noindex,follow" />
        )}
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
        {itemListSchema && <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>}
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Hero / Intro */}
      <section className={styles.heroSection}>
        <h1>MCA Entrance Previous Year Question Bank (PYQs)</h1>
        <p className={styles.subheading}>
          Practice 17 years of solved questions from NIMCET, CUET-PG, and more.
          Each problem includes detailed, step-by-step solutions to help you prepare smarter.
        </p>

        <h3>What you’ll find here</h3>
        <ul className={styles.benefitList}>
          <li>Topic-wise PYQs mapped to the latest exam patterns</li>
          <li>Step-by-step solutions, many with concise video explanations</li>
          <li>Fast filters and search to target your weak areas</li>
        </ul>

        <nav className={styles.hubNav} aria-label="Browse by category">
          <ul>
            <li><Link to="/questions?exam=NIMCET">NIMCET PYQs</Link></li>
            <li><Link to="/questions?exam=CUET-PG">CUET-PG PYQs</Link></li>
            <li><Link to="/questions?subject=Mathematics">Mathematics</Link></li>
            <li><Link to="/questions?subject=Computer">Computer Science</Link></li>
            <li><Link to="/questions?subject=English">English</Link></li>
            <li><Link to="/questions?subject=Logical%20Reasoning">Logical Reasoning</Link></li>
            <li><Link to="/questions?subject=Aptitude">Aptitude</Link></li>
          </ul>
        </nav>
      </section>

      {/* Mobile overlay + sidebar */}
      {isFilterOpen && (
        <div
          className={styles.overlay}
          onClick={() => {
            setIsFilterOpen(false);
            filterToggleBtnRef.current?.focus();
          }}
          aria-hidden="true"
          role="presentation"
        />
      )}

      <aside
        className={`${styles.filterSidebar} ${isFilterOpen ? styles.open : ''}`}
        aria-label="Filters"
      >
        <button
          className={styles.closeFilterButton}
          onClick={() => {
            setIsFilterOpen(false);
            filterToggleBtnRef.current?.focus();
          }}
        >
          <X size={24} /> Close Filters
        </button>

        {/* Mobile filter form (staged) */}
        <FilterFormContent
          onSubmitSearch={onSubmitSearch}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterOptions={filterOptions}
          pendingExam={pendingExam}
          setPendingExam={setPendingExam}
          pendingSubject={pendingSubject}
          setPendingSubject={setPendingSubject}
          applyFilters={applyFilters}
          clearAllFilters={clearAllFilters}
        />
      </aside>

      {/* Main content */}
      <div className={styles.container}>
        <main>
          {/* List header & controls */}
          <div className={styles.listControlsContainer}>
            <div className={styles.listHeader}>
              <span role="status" aria-live="polite">
                {loading ? (
                  <>
                    <Loader2 size={18} className={styles.spinner} /> Loading…
                  </>
                ) : (
                  `Showing ${questions.length} of ${totalDocs} questions`
                )}
              </span>

              <button
                ref={filterToggleBtnRef}
                className={styles.filterToggleButton}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                aria-expanded={isFilterOpen}
                aria-controls="filter-panel"
              >
                <Filter size={18} /> Filters
              </button>
            </div>

            {/* Inline filter panel (desktop) */}
            <div
              id="filter-panel"
              className={`${styles.filterPanel} ${isFilterOpen ? styles.open : ''}`}
            >
              <FilterFormContent
                onSubmitSearch={onSubmitSearch}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterOptions={filterOptions}
                pendingExam={pendingExam}
                setPendingExam={setPendingExam}
                pendingSubject={pendingSubject}
                setPendingSubject={setPendingSubject}
                applyFilters={applyFilters}
                clearAllFilters={clearAllFilters}
              />
            </div>

            {/* Active filter chips */}
            {activeFilterDisplay.length > 0 && (
              <div className={styles.activeFiltersDisplay}>
                {activeFilterDisplay.map((f) => (
                  <span key={f.key} className={styles.activeFilterTag}>
                    {f.name}: <strong>{f.value}</strong>
                    <button
                      onClick={() => clearIndividualFilter(f.key)}
                      className={styles.clearFilterTagButton}
                      aria-label={`Clear ${f.name} filter: ${f.value}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAllFilters}
                  className={styles.clearAllActiveTagsButton}
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Results */}
          <div className={styles.questionList} ref={questionListRef}>
            {loading ? (
              <div className={styles.skeletonContainer}>
                {Array.from({ length: limit }).map((_, i) => (
                  <div key={i} className={styles.questionCardSkeleton}>
                    <div className={styles.skeletonLine} style={{ width: '30%' }} />
                    <div className={styles.skeletonLine} style={{ width: '90%' }} />
                    <div className={styles.skeletonLine} style={{ width: '75%' }} />
                    <div className={styles.skeletonLine} style={{ width: '20%', marginTop: 20 }} />
                  </div>
                ))}
              </div>
            ) : questions.length > 0 ? (
              <>
                {questions.map((q) => (
                  <Link to={`/question/${q?._id}`} key={q?._id} className={styles.questionCard}>
                    <div className={styles.tags}>
                      {q?.exam && <span className={styles.tag}>{q.exam}</span>}
                      {q?.subject && <span className={styles.tag}>{q.subject}</span>}
                      {q?.year && <span className={styles.tag}>{q.year}</span>}
                    </div>
                    <div className={styles.questionText}>
                      <MathPreview latexString={q?.questionText || ''} />
                    </div>
                    <div className={styles.viewLink}>View Solution &rarr;</div>
                  </Link>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className={styles.paginationControls} aria-label="Pagination">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1 || loading}
                      className={styles.paginationButton}
                    >
                      <ChevronLeft size={20} /> Previous
                    </button>
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages || loading}
                      className={styles.paginationButton}
                    >
                      Next <ChevronRight size={20} />
                    </button>
                  </nav>
                )}
              </>
            ) : (
              <div className={styles.noResults} role="status" aria-live="polite">
                <h3>No Questions Found</h3>
                <p>Try clearing some filters or adjusting your search term.</p>
                <button onClick={clearAllFilters} className={styles.clearAllFiltersButton}>
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* FAQ */}
          <section className={styles.faq}>
            <h2>FAQs</h2>
            <details>
              <summary>Are these questions updated for the latest NIMCET/CUET-PG pattern?</summary>
              <p>
                Yes. We continuously update question tags and solutions to reflect the latest pattern and syllabus.
              </p>
            </details>
            <details>
              <summary>Do all questions have solutions or videos?</summary>
              <p>
                All listed questions include detailed step-by-step solutions, and many also include short video explanations.
              </p>
            </details>
            <details>
              <summary>Can I filter by subject or specific topics?</summary>
              <p>
                Use the filters for exam and subject, and the search box for topics, keywords, or formula names.
              </p>
            </details>
          </section>
        </main>
      </div>
    </>
  );
};

export default QuestionLibraryPage;
