import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  BookOpen,
  CheckCircle2,
  ListOrdered,
  X,
  Menu
} from 'lucide-react';
import ReactPlayer from 'react-player/youtube';
import api from '../api';
import MathPreview from '../components/MathPreview';
import styles from './FullPaperViewPage.module.css';

// Predefined ordering for sections
const SECTION_ORDER = {
  'mathematics': 1,
  'math': 1,
  'quantitative aptitude': 2,
  'aptitude': 2,
  'quants': 2,
  'logical reasoning': 3,
  'reasoning': 3,
  'lr': 3,
  'computer science': 4,
  'computer awareness': 4,
  'computer': 4,
  'english': 5,
  'general english': 5
};

const getSectionWeight = (subjectName) => {
  if (!subjectName) return 99;
  const normalized = subjectName.toLowerCase().trim();
  return SECTION_ORDER[normalized] || 99;
};

const FullPaperViewPage = () => {
  const { examName, year } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [fullQuestions, setFullQuestions] = useState({});
  const [showSolutionFor, setShowSolutionFor] = useState({});
  const [loadingSolution, setLoadingSolution] = useState(false);
  const [showPaletteMobile, setShowPaletteMobile] = useState(false);

  // Group questions by section for the palette
  const groupedQuestions = React.useMemo(() => {
    const groups = {};
    questions.forEach((q, idx) => {
      const subject = q.subject || 'Other';
      if (!groups[subject]) groups[subject] = [];
      groups[subject].push({ question: q, index: idx });
    });
    return groups;
  }, [questions]);

  // Fetch paper
  useEffect(() => {
    const fetchPaper = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/questions/public', {
          params: {
            exam: examName,
            year: year,
            limit: 300 // ensure we get the full paper
          }
        });

        let fetchedQs = res.data?.questions || [];
        
        // Sort strategically by subject order as requested by user
        fetchedQs.sort((a, b) => {
          const wA = getSectionWeight(a.subject);
          const wB = getSectionWeight(b.subject);
          if (wA !== wB) return wA - wB;
          // Sub-sort by question number if available
          const numA = parseInt(a.questionNumber) || 0;
          const numB = parseInt(b.questionNumber) || 0;
          return numA - numB;
        });

        setQuestions(fetchedQs);
      } catch (err) {
        console.error('Failed to fetch paper', err);
        setError('Failed to load the paper. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (examName && year) {
      fetchPaper();
    }
  }, [examName, year]);

  // Handle navigation
  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const jumpToQuestion = (index) => {
    setCurrentIndex(index);
    setShowPaletteMobile(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOptionSelect = (idx) => {
    if (showSolutionFor[currentIndex]) return;
    setSelectedOptions(prev => ({ ...prev, [currentIndex]: idx }));
  };

  const handleViewSolution = async () => {
    const q = questions[currentIndex];
    if (!q || !q._id) return;
    
    if (fullQuestions[currentIndex]) {
      setShowSolutionFor(prev => ({ ...prev, [currentIndex]: true }));
      return;
    }

    setLoadingSolution(true);
    try {
      const res = await api.get(`/questions/public/${q._id}`);
      setFullQuestions(prev => ({ ...prev, [currentIndex]: res.data }));
      setShowSolutionFor(prev => ({ ...prev, [currentIndex]: true }));
    } catch (err) {
      console.error('Failed to fetch explanation', err);
    } finally {
      setLoadingSolution(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>
          <Loader2 size={40} className={styles.spinner} />
          <h2>Loading Paper...</h2>
          <p>Compiling {examName} {year} questions</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <AlertCircle size={48} color="#e11d48" style={{marginBottom: 16}} />
          <h2>{error ? 'Oops, something went wrong' : 'Paper Not Found'}</h2>
          <p>{error || `We couldn't find the questions for ${examName} ${year}.`}</p>
          <div className={styles.actionArea} style={{justifyContent: 'center', marginTop: 24}}>
            <button className={styles.retryBtn} onClick={() => window.location.reload()}>
              <RefreshCw size={18} /> Retry
            </button>
            <Link to="/resources" className={styles.backBtn} style={{background: '#1e293b', border: 'none'}}>
              <ArrowLeft size={18} /> Back to Resources
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = fullQuestions[currentIndex] || questions[currentIndex];
  const totalQ = questions.length;
  const isShowingSolution = showSolutionFor[currentIndex] || false;
  const selectedOptionIdx = selectedOptions[currentIndex];
  // Calculate letters for options (A, B, C, D)
  const getOptionLetter = (index) => String.fromCharCode(65 + index);

  return (
    <>
      <Helmet>
        <title>{`${examName} ${year} Full Paper | MCA Entrance PYQ`}</title>
        <meta name="description" content={`Practice the complete ${examName} ${year} previous year question paper with section-wise questions and detailed solutions.`} />
      </Helmet>

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h1>{examName} {year} Paper</h1>
            <p>Interactive Mock Paper &bull; {totalQ} Questions</p>
          </div>
          <Link to={`/resources/${encodeURIComponent(examName)}`} className={styles.backBtn}>
            <ArrowLeft size={18} /> Exit Paper
          </Link>
        </div>

        <div className={styles.contentLayout}>
          {/* Main Question Area */}
          <div className={styles.questionArea}>
            {currentQ.subject && (
              <div>
                <span className={styles.sectionPill}>
                  <ListOrdered size={14} style={{display: 'inline', marginRight: 6, verticalAlign: 'text-bottom'}}/> 
                  Section: {currentQ.subject}
                </span>
              </div>
            )}
            
            <div className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <div className={styles.questionNumber}>Question {currentIndex + 1} of {totalQ}</div>
                {currentQ.topic && <div style={{color: '#64748b', fontSize: '0.9rem'}}>{currentQ.topic}</div>}
              </div>

              {/* Question Text */}
              <MathPreview latexString={currentQ.questionText || ''} />
              
              {/* Question Image (if any) */}
              {currentQ.questionImageURL && (
                <img 
                  src={currentQ.questionImageURL} 
                  alt="Question Visual" 
                  style={{maxWidth: '100%', borderRadius: 8, marginTop: 16}} 
                />
              )}

              {/* Options */}
              <div className={styles.optionsList}>
                {currentQ.options?.map((opt, idx) => {
                  const isCorrectNode = isShowingSolution && opt.isCorrect;
                  const isSelected = selectedOptionIdx === idx;
                  const isWrongNode = isShowingSolution && isSelected && !opt.isCorrect;
                  
                  let itemClass = styles.optionItem;
                  if (isSelected) itemClass += ` ${styles.selected}`;
                  if (isCorrectNode) itemClass += ` ${styles.correct}`;
                  if (isWrongNode) itemClass += ` ${styles.incorrect}`;

                  return (
                    <div 
                      key={idx} 
                      className={itemClass}
                      onClick={() => handleOptionSelect(idx)}
                      style={{ cursor: isShowingSolution ? 'default' : 'pointer' }}
                    >
                      <div className={styles.optionLabel}>{getOptionLetter(idx)}</div>
                      <div className={styles.optionContent}>
                        {opt.text && <MathPreview latexString={opt.text} />}
                        {opt.imageURL && (
                           <img 
                            src={opt.imageURL} 
                            alt={`Option ${getOptionLetter(idx)}`} 
                            style={{maxWidth: '200px', display: 'block', marginTop: 8, borderRadius: 4}} 
                           />
                        )}
                      </div>
                      {isCorrectNode && <CheckCircle2 color="#34d399" size={24} />}
                    </div>
                  );
                })}
              </div>

              {/* Toggle Solution Button */}
              {!isShowingSolution && (
                <button className={styles.toggleSolBtn} onClick={handleViewSolution} disabled={loadingSolution}>
                  {loadingSolution ? <Loader2 size={18} className={styles.spinner} /> : <BookOpen size={18} />} 
                  {loadingSolution ? ' Loading...' : ' View Solution'}
                </button>
              )}

              {/* Explanation section */}
              {isShowingSolution && (
                <div className={styles.solutionBox}>
                  <div className={styles.solutionTitle}>
                    <CheckCircle2 size={20} /> Solution & Explanation
                  </div>
                  {currentQ.explanationText && <MathPreview latexString={currentQ.explanationText} />}
                  {!currentQ.explanationText && !currentQ.explanationImageURL && (
                    <p>No detailed explanation available for this question. The correct option is highlighted above.</p>
                  )}
                  {currentQ.explanationImageURL && (
                    <img 
                      src={currentQ.explanationImageURL} 
                      alt="Solution Explanation" 
                      style={{maxWidth: '100%', borderRadius: 8, marginTop: 16}} 
                    />
                  )}
                  {currentQ.videoURL && (
                    <div style={{marginTop: 16}}>
                      <div className={styles.playerContainer}>
                        <ReactPlayer
                          url={currentQ.videoURL}
                          width="100%"
                          height="100%"
                          controls
                          className={styles.reactPlayer}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className={styles.navigationRow}>
                <button 
                  className={`${styles.navBtn} ${styles.prev}`} 
                  onClick={goToPrev} 
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft size={20} /> Previous
                </button>
                <button 
                  className={`${styles.navBtn} ${styles.next}`} 
                  onClick={goToNext} 
                  disabled={currentIndex === totalQ - 1}
                >
                  Next <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Palette - Desktop and Mobile Dropdown */}
          <div className={`${styles.sidebar} ${showPaletteMobile ? styles.showMobileSidebar : ''}`}>
            <div className={styles.paletteCard}>
              <div className={styles.paletteHeaderRow}>
                <h3 className={styles.paletteTitle}>Question Palette</h3>
                <button className={styles.closePaletteBtn} onClick={() => setShowPaletteMobile(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className={styles.paletteScrollArea}>
                {Object.entries(groupedQuestions).map(([subject, qs]) => (
                  <div key={subject} className={styles.subjectGroup}>
                    <div className={styles.subjectName}>{subject}</div>
                    <div className={styles.grid}>
                      {qs.map(({ index }) => (
                        <button
                          key={index}
                          className={`${styles.gridBtn} ${index === currentIndex ? styles.active : ''} ${showSolutionFor[index] ? styles.answered : ''}`}
                          onClick={() => jumpToQuestion(index)}
                          aria-label={`Go to question ${index + 1}`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Overlay for Sidebar */}
          {showPaletteMobile && (
            <div className={styles.paletteOverlay} onClick={() => setShowPaletteMobile(false)} />
          )}

          {/* Floating Mobile Toggle Button */}
          <button 
            className={styles.mobilePaletteToggle} 
            onClick={() => setShowPaletteMobile(true)}
          >
            <Menu size={24} /> <span>Questions</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default FullPaperViewPage;
