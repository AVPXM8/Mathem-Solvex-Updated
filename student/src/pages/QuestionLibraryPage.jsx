import React, { useState, useEffect,useRef,useCallback,useMemo  } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import { Helmet } from 'react-helmet-async';
import MathPreview from '../components/MathPreview';
import { Filter, Search, X } from 'lucide-react';
import styles from './QuestionLibraryPage.module.css';


const QuestionLibraryPage = () => {
    const [allQuestions, setAllQuestions] =useState([]);
    const [loading, setLoading] = useState(true);
    const [filterOptions, setFilterOptions] = useState({ exams: [], subjects: [], years: [] });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    // Get current filter values from URL search params
    const currentFilters = {
        search: searchParams.get('search') || '',
        exam: searchParams.get('exam') || '',
        subject: searchParams.get('subject') || '',
    };
    const [searchTerm, setSearchTerm] = useState(currentFilters.search);

    // Fetch filter options and all public questions once
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [questionsRes, filtersRes] = await Promise.all([
                    api.get('/questions/public'), // Use the simple public endpoint
                    api.get('/questions/filters')
                ]);
                setAllQuestions(questionsRes.data || []);
                setFilterOptions(filtersRes.data || { exams: [], subjects: [] });
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    
    // Filter questions on the client-side
    const filteredQuestions = useMemo(() => {
        return allQuestions.filter(q => {
            const searchMatch = currentFilters.search ? q.questionText.toLowerCase().includes(currentFilters.search.toLowerCase()) : true;
            const examMatch = currentFilters.exam ? q.exam === currentFilters.exam : true;
            const subjectMatch = currentFilters.subject ? q.subject === currentFilters.subject : true;
            return searchMatch && examMatch && subjectMatch;
        });
    }, [allQuestions, searchParams]);

    const handleFilterChange = (name, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) { newParams.set(name, value); } 
        else { newParams.delete(name); }
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

    const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": "https://question.maarula.in/"  
  }, {
    "@type": "ListItem",
    "position": 2,
    "name": "Question Bank",
    "item": "https://question.maarula.in/questions"  
  }]
};

return (
    <>
        <Helmet>
            <title>NIMCET & CUET-PG Previous Year Question Bank | Maarula Classes</title>
            <meta name="description" content="Access and solve thousands of Previous Year Questions (PYQs) for NIMCET, CUET-PG, and other top MCA entrance exams. Filter by subject and year to boost your preparation." />
            <link rel="canonical" href="https://questions.maarula.in/questions" />
            <script type="application/ld+json">
                {JSON.stringify(breadcrumbSchema)}
            </script>
        </Helmet>

            <div className={styles.pageHeader}>
                <h1>The Ultimate Question Bank</h1>
                <p>Here you can get all the PYQs for NIMCET, CUET-PG, and more. Sharpen your skills with the most comprehensive collection of solved papers.</p>
            </div>
            
            {isFilterOpen && <div className={styles.overlay} onClick={() => setIsFilterOpen(false)}></div>}
            
            <div className={styles.container}>
                <aside className={`${styles.filterSidebar} ${isFilterOpen ? styles.open : ''}`}>
                    <button className={styles.closeFilterButton} onClick={() => setIsFilterOpen(false)}><X size={24} /> Close</button>
                    <form onSubmit={handleSearch} className={styles.searchForm}>
                        <Search size={20} className={styles.searchIcon}/>
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
        {filterOptions.exams.map(exam => <button key={exam} onClick={() => handleFilterChange('exam', exam)} className={searchParams.get('exam') === exam ? styles.activeFilter : ''}>{exam}</button>)}
    </div>
</div>
                    <div className={styles.filterGroup}>
    <h4>Subject</h4>
    <div className={styles.filterOptionsContainer}>
        {filterOptions.subjects.map(subject => <button key={subject} onClick={() => handleFilterChange('subject', subject)} className={searchParams.get('subject') === subject ? styles.activeFilter : ''}>{subject}</button>)}
    </div>
</div>
                    <button onClick={clearFilters} className={styles.clearButton}>Clear All Filters</button>
                </aside>

                <main className={styles.questionList}>
                    <div className={styles.listHeader}>
                        <span>Showing {filteredQuestions.length} questions</span>
                        <button className={styles.mobileFilterToggle} onClick={() => setIsFilterOpen(!isFilterOpen)}>
                            <Filter size={18}/> Filters
                        </button>
                    </div>
                    {loading ? <p>Loading questions...</p> : filteredQuestions.length > 0 ? (
                        filteredQuestions.map(q => (
                            <Link to={`/question/${q._id}`} key={q._id} className={styles.questionCard}>
                                <div className={styles.tags}>
                                    <span className={styles.tag}>{q.exam}</span>
                                    <span className={styles.tag}>{q.subject}</span>
                                    {q.year && <span className={styles.tag}>{q.year}</span>}
                                </div>
                                <div className={styles.questionText}>
                                    <MathPreview latexString={q.questionText} />
                                </div>
                                <div className={styles.options}>
                                    {q.options.map((opt, i) => <div key={i} className={styles.option}>{String.fromCharCode(65 + i)}) <MathPreview latexString={opt.text} /></div>)}
                                </div>
                                <div className={styles.viewLink}>
                                    Attempt & View Solution &rarr;
                                </div>
                            </Link>
                        ))
                    ) : <div className={styles.noResults}>No questions found for the selected filters.</div>}
                </main>
            </div>
        </>
    );
};

export default QuestionLibraryPage;