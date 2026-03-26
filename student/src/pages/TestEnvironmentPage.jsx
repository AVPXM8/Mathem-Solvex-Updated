import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Loader2, AlertCircle, 
  RefreshCw, BookOpen, CheckCircle2, ListOrdered, X, Menu, 
  Clock, Save, Award, EyeOff, Flag
} from 'lucide-react';
import ReactPlayer from 'react-player/youtube';
import api from '../api';
import MathPreview from '../components/MathPreview';
import styles from './TestEnvironmentPage.module.css';

// Ordering for sections in palette
const SECTION_ORDER = {
  'mathematics': 1, 'math': 1,
  'quantitative aptitude': 2, 'aptitude': 2, 'quants': 2,
  'logical reasoning': 3, 'reasoning': 3, 'lr': 3,
  'computer science': 4, 'computer awareness': 4, 'computer': 4,
  'english': 5, 'general english': 5
};

const getSectionWeight = (subjectName) => {
  if (!subjectName) return 99;
  return SECTION_ORDER[subjectName.toLowerCase().trim()] || 99;
};

// Exam configs
const EXAM_CONFIGS = {
  'NIMCET': { timeMinutes: 120, type: 'nimcet' },
  'CUET PG': { timeMinutes: 75, type: 'flat', correct: 4, incorrect: -1 },
  'JAMIA': { timeMinutes: 90, type: 'flat', correct: 1, incorrect: -0.25 },
  'MAH-CET': { timeMinutes: 90, type: 'flat', correct: 2, incorrect: -0.5 },
  'DEFAULT': { timeMinutes: 60, type: 'flat', correct: 1, incorrect: 0 }
};

const TestEnvironmentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const examName = searchParams.get('exam') || '';
  const year = searchParams.get('year') || '';
  const subject = searchParams.get('subject') || '';
  const topic = searchParams.get('topic') || '';
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '300';

  const [testState, setTestState] = useState('INSTRUCTIONS'); // INSTRUCTIONS, RUNNING, SUBMITTED, REVIEW
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Test State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { 0: 2, 1: 0 } ... option index
  const [markedForReview, setMarkedForReview] = useState({}); // { 0: true }
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [showPaletteMobile, setShowPaletteMobile] = useState(false);
  const [loadingFullQuestions, setLoadingFullQuestions] = useState({}); // used when reviewing
  const [fullQuestions, setFullQuestions] = useState({});

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const titleQuery = searchParams.get('search') || '';
        const params = { exam: examName, limit, page };
        if (year) params.year = year;
        if (subject) params.subject = subject;
        if (topic) params.topic = topic;
        if (titleQuery) params.search = titleQuery;

        const res = await api.get('/questions/public', { params });
        let fetchedQs = res.data?.questions || [];
        
        // Sort strategically
        fetchedQs.sort((a, b) => {
          const wA = getSectionWeight(a.subject);
          const wB = getSectionWeight(b.subject);
          if (wA !== wB) return wA - wB;
          return (parseInt(a.questionNumber) || 0) - (parseInt(b.questionNumber) || 0);
        });

        setQuestions(fetchedQs);
        
        // Set initial timer
        let config = EXAM_CONFIGS[examName?.toUpperCase()] || EXAM_CONFIGS['DEFAULT'];
        if (!year && topic) config = EXAM_CONFIGS['DEFAULT']; // Topic test default
        setTimeLeft((config.timeMinutes || 60) * 60);

      } catch (err) {
        console.error('Failed to load questions', err);
        setError('Failed to securely load the test. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (examName) fetchQuestions();
  }, [examName, year, subject, topic, page, limit]);

  // Timer Effect
  useEffect(() => {
    let timer;
    if (testState === 'RUNNING' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testState, timeLeft]);

  // Group questions for Palette
  const groupedQuestions = useMemo(() => {
    const groups = {};
    questions.forEach((q, idx) => {
      const subj = q.subject || 'Other';
      if (!groups[subj]) groups[subj] = [];
      groups[subj].push({ question: q, index: idx });
    });
    return groups;
  }, [questions]);

  // Format time (HH:MM:SS)
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Actions
  const startTest = () => {
    if (questions.length === 0) return;
    setTestState('RUNNING');
    window.scrollTo(0, 0);
  };

  const submitTest = () => {
    if (window.confirm("Are you sure you want to completely submit the test?")) {
      setTestState('SUBMITTED');
      window.scrollTo(0, 0);
    }
  };

  const navNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
  };
  const navPrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleOptionSelect = (idx) => {
    if (testState === 'REVIEW') return;
    setAnswers(prev => ({ ...prev, [currentIndex]: idx }));
  };

  const clearAnswer = () => {
    if (testState === 'REVIEW') return;
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentIndex];
      return newAnswers;
    });
  };

  const toggleReviewMark = () => {
    if (testState === 'REVIEW') return;
    setMarkedForReview(prev => ({ ...prev, [currentIndex]: !prev[currentIndex] }));
  };

  const jumpToQuestion = (index) => {
    setCurrentIndex(index);
    setShowPaletteMobile(false);
  };

  // Score Calculation
  const calculateResult = () => {
    let config = EXAM_CONFIGS[examName?.toUpperCase()] || EXAM_CONFIGS['DEFAULT'];
    
    let totalScore = 0;
    let attempted = 0;
    let correct = 0;
    let incorrect = 0;
    let sections = {};

    questions.forEach((q, idx) => {
      const subj = q.subject || 'Other';
      if (!sections[subj]) sections[subj] = { score: 0, count: 0, correct: 0, incorrect: 0 };
      
      const userAnsIdx = answers[idx];
      if (userAnsIdx !== undefined) {
        attempted++;
        sections[subj].count++;
        
        const isCorrect = q.options[userAnsIdx]?.isCorrect;
        
        let marksCorrect = config.correct;
        let marksIncorrect = config.incorrect;
        
        // NIMCET specialized differential scoring
        if (config.type === 'nimcet') {
          const s = subj.toLowerCase();
          if (s.includes('math')) { marksCorrect = 12; marksIncorrect = -3; }
          else if (s.includes('computer') || s.includes('logical') || s.includes('reasoning')) { marksCorrect = 6; marksIncorrect = -1.5; }
          else if (s.includes('english')) { marksCorrect = 4; marksIncorrect = -1; }
          else { marksCorrect = 4; marksIncorrect = -1; } // safe fallback
        }

        if (isCorrect) {
          correct++;
          sections[subj].correct++;
          sections[subj].score += marksCorrect;
          totalScore += marksCorrect;
        } else {
          incorrect++;
          sections[subj].incorrect++;
          sections[subj].score += marksIncorrect;
          totalScore += marksIncorrect;
        }
      }
    });

    return { totalScore, attempted, correct, incorrect, sections };
  };

  const fetchFullQuestion = async (index) => {
    const q = questions[index];
    if (fullQuestions[index]) return; // Already have full info
    setLoadingFullQuestions(prev => ({ ...prev, [index]: true }));
    try {
      const res = await api.get(`/questions/public/${q._id}`);
      setFullQuestions(prev => ({ ...prev, [index]: res.data }));
    } catch (err) {
      console.error('Failed to load full question data', err);
    } finally {
      setLoadingFullQuestions(prev => ({ ...prev, [index]: false }));
    }
  };

  // Fetch full solution when navigating in review mode
  useEffect(() => {
    if (testState === 'REVIEW') {
      fetchFullQuestion(currentIndex);
    }
  }, [currentIndex, testState]);

  // Loading & Error States
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>
          <Loader2 size={40} className={styles.spinner} />
          <h2>Preparing Secure Test Environment...</h2>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <AlertCircle size={48} color="#e11d48" style={{marginBottom: 16}} />
          <h2>{error ? 'Oops, something went wrong' : 'No Questions Found'}</h2>
          <p>{error || "We couldn't load the test. The link might be invalid or there are no questions for this filter yet."}</p>
          <div className={styles.actionArea} style={{justifyContent: 'center', marginTop: 24}}>
            <Link to="/questions" className={styles.backBtn}><ArrowLeft size={18} /> Back to Library</Link>
          </div>
        </div>
      </div>
    );
  }

  // Define dynamic test title
  const testTitle = year 
    ? `${examName} ${year} Full Paper Mock Test` 
    : `${examName} ${subject} - ${topic || 'Practice Test'} ${page !== '1' || limit !== '300' ? `(Test ${page})` : ''}`;

  let maxMarkString = 'Varies';
  if (questions.length > 0) {
    let config = EXAM_CONFIGS[examName?.toUpperCase()] || EXAM_CONFIGS['DEFAULT'];
    if (config.type === 'nimcet') {
      const totalMarks = questions.reduce((sum, q) => {
          const s = (q.subject || '').toLowerCase();
          if (s.includes('math')) return sum + 12;
          if (s.includes('computer') || s.includes('logical') || s.includes('reasoning')) return sum + 6;
          if (s.includes('english')) return sum + 4;
          return sum + 4;
      }, 0);
      maxMarkString = totalMarks.toString();
    } else {
      maxMarkString = (questions.length * (config.correct || 1)).toString();
    }
  } else if (examName.toUpperCase() === 'NIMCET') {
    maxMarkString = '1000';
  }

  // --- RENDER STATES ---

  if (testState === 'INSTRUCTIONS') {
    return (
      <div className={styles.container}>
        <Helmet><title>Instructions | {testTitle}</title></Helmet>
        <div className={styles.instructionsLayout}>
          <div style={{marginBottom: 24}}>
             <Link to="/resources" className={styles.backBtn} style={{marginBottom: 16}}><ArrowLeft size={16} /> Exit Test</Link>
          </div>
          <h1>{testTitle}</h1>
          <p>Read the instructions carefully before starting the test.</p>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <span>Time Allowed</span>
              <span>{Math.floor(timeLeft / 60)} Minutes</span>
            </div>
            <div className={styles.infoCard}>
              <span>Total Questions</span>
              <span>{questions.length}</span>
            </div>
            <div className={styles.infoCard}>
              <span>Max Marks</span>
              <span>{maxMarkString}</span>
            </div>
          </div>

          <div className={styles.markingBox}>
             <h3>General Instructions & Marking Scheme</h3>
             <ul>
               <li>The clock will be set at the server. The countdown timer in the top right corner will display the remaining time available for you to complete the examination.</li>
               <li>When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li>
               <li>The Question Palette displayed on the right side of screen will show the status of each question.</li>
               {examName.toUpperCase() === 'NIMCET' ? (
                 <>
                  <li><strong>Mathematics:</strong> +12 marks for correct answer, -3 marks for incorrect answer.</li>
                  <li><strong>Analytical Ability & Logical Reasoning:</strong> +6 marks for correct, -1.5 marks for incorrect.</li>
                  <li><strong>Computer Awareness:</strong> +6 marks for correct, -1.5 marks for incorrect.</li>
                  <li><strong>General English:</strong> +4 marks for correct, -1 marks for incorrect.</li>
                 </>
               ) : (
                 <li><strong>Marking Scheme:</strong> For every correct answer {EXAM_CONFIGS[examName.toUpperCase()]?.correct || 1} mark(s) will be awarded, and for every incorrect answer {EXAM_CONFIGS[examName.toUpperCase()]?.incorrect || 0} mark(s) will be deducted.</li>
               )}
             </ul>
          </div>

          <button className={styles.startBtn} onClick={startTest}>
            Start Full Test <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (testState === 'SUBMITTED') {
    const result = calculateResult();
    return (
      <div className={styles.container}>
        <Helmet><title>Result | {testTitle}</title></Helmet>
        <div className={styles.resultLayout}>
          <h2>Test Completed!</h2>
          <p>Here is your performance summary for {testTitle}.</p>
          
          <div className={styles.resultScore}>
            {result.totalScore} <span style={{fontSize: '1.2rem', color: '#64748b'}}>Marks</span>
          </div>

          <div className={styles.resultSummaryGrid}>
            <div className={`${styles.rCard} ${styles.attempted}`}>Attempted: {result.attempted}/{questions.length}</div>
            <div className={`${styles.rCard} ${styles.correct}`}>Correct: {result.correct}</div>
            <div className={`${styles.rCard} ${styles.incorrect}`}>Incorrect: {result.incorrect}</div>
          </div>

          {Object.keys(result.sections).length > 0 && (
            <div className={styles.sectionBreakdown}>
              <h3 style={{marginBottom: 16}}>Section-wise Breakdown</h3>
              {Object.entries(result.sections).map(([sec, data]) => (
                <div key={sec} className={styles.breakdownRow}>
                   <span>{sec}</span>
                   <span>Score: <strong style={{color: data.score < 0 ? '#ef4444' : '#1e293b'}}>{data.score}</strong> (Attempted: {data.count})</span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.reviewActions}>
             <button className={styles.startBtn} onClick={() => { setTestState('REVIEW'); setCurrentIndex(0); window.scrollTo(0,0); }}>
               <EyeOff size={20} /> Review Answers & Solutions
             </button>
             <Link to="/resources" className={styles.startBtn} style={{background: '#1e293b'}}>Exit to Resources</Link>
          </div>
        </div>
      </div>
    );
  }

  // --- RUNNING & REVIEW STATES ---
  
  const currentQReq = questions[currentIndex];
  const currentQ = fullQuestions[currentIndex] || currentQReq; // use full if loaded in review
  const totalQ = questions.length;
  const isReview = testState === 'REVIEW';
  const getOptionLetter = (idx) => String.fromCharCode(65 + idx);
  
  return (
    <div style={{background: '#f8fafc', minHeight: '100vh', paddingBottom: 60}}>
      <Helmet><title>{isReview ? 'Review Mode - ' : ''}{formatTime(timeLeft)} | {testTitle}</title></Helmet>
      
      {/* Fixed Test Header */}
      <div className={styles.testHeader}>
        <h2 className={styles.testTitle}>{isReview ? 'Review Mode' : testTitle}</h2>
        <div className={`${styles.timerBadge} ${timeLeft < 300 && !isReview ? styles.warning : ''}`}>
           <Clock size={16} /> 
           {isReview ? 'Test Over' : formatTime(timeLeft)}
        </div>
      </div>

      <div className={styles.container} style={{maxWidth: '1400px', paddingTop: 20}}>
         <div className={styles.contentLayout}>
            
            {/* Main Question Column */}
            <div className={styles.questionArea}>
               {currentQ.subject && (
                 <div>
                   <span className={styles.sectionPill}>
                     <ListOrdered size={14} style={{marginRight: 6}}/> 
                     {currentQ.subject}
                   </span>
                 </div>
               )}

               <div className={styles.questionCard}>
                  <div className={styles.questionHeader}>
                     <div className={styles.questionNumber}>
                        {isReview ? `Reviewing Question ${currentIndex + 1} of ${totalQ}` : `Question ${currentIndex + 1} of ${totalQ}`}
                     </div>
                     <div style={{color: '#64748b'}}>
                        {!isReview && (
                          <button className={`${styles.reviewBtn} ${markedForReview[currentIndex] ? styles.marked : ''}`} onClick={toggleReviewMark} >
                            <Flag size={14} /> {markedForReview[currentIndex] ? 'Marked' : 'Mark for Review'}
                          </button>
                        )}
                     </div>
                  </div>

                  {/* Question Text */}
                  <MathPreview latexString={currentQ.questionText || ''} />
                  {currentQ.questionImageURL && (
                    <img src={currentQ.questionImageURL} alt="Question" style={{maxWidth: '100%', borderRadius: 8, marginTop: 16}} />
                  )}

                  {/* Options */}
                  <div className={styles.optionsList}>
                    {currentQ.options?.map((opt, idx) => {
                      const isSelected = answers[currentIndex] === idx;
                      // In review mode, show correct/incorrect visually
                      const isCorrectNode = isReview && opt.isCorrect;
                      const isWrongNode = isReview && isSelected && !opt.isCorrect;

                      let itemClass = styles.optionItem;
                      if (!isReview && isSelected) itemClass += ` ${styles.selected}`;
                      if (isCorrectNode) itemClass += ` ${styles.correct}`;
                      if (isWrongNode) itemClass += ` ${styles.incorrect}`;
                      // Even if not selected, gray out wrong options in review? No, just highlight correct and selected.

                      return (
                        <div 
                          key={idx} 
                          className={itemClass}
                          onClick={() => handleOptionSelect(idx)}
                          style={{ cursor: isReview ? 'default' : 'pointer' }}
                        >
                          <div className={styles.optionLabel}>{getOptionLetter(idx)}</div>
                          <div className={styles.optionContent}>
                            {opt.text && <MathPreview latexString={opt.text} />}
                            {opt.imageURL && (
                               <img src={opt.imageURL} alt="Option" style={{maxWidth: '200px', display: 'block', marginTop: 8}} />
                            )}
                          </div>
                          {isCorrectNode && <CheckCircle2 color="#10b981" size={24} style={{marginLeft: 'auto'}}/>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Review Solutions Box */}
                  {isReview && (
                    <div className={styles.solutionBox}>
                      <div className={styles.solutionTitle}>
                        <CheckCircle2 size={20} /> Solution & Explanation
                      </div>
                      {loadingFullQuestions[currentIndex] ? (
                        <div style={{padding: 20, textAlign: 'center'}}><Loader2 size={24} className={styles.spinner}/> Loading solution detailed resources...</div>
                      ) : (
                        <>
                          {currentQ.explanationText && <MathPreview latexString={currentQ.explanationText} />}
                          {!currentQ.explanationText && !currentQ.explanationImageURL && !currentQ.videoURL && (
                            <p>No detailed explanation available for this question. The correct option is highlighted above.</p>
                          )}
                          {currentQ.explanationImageURL && (
                            <img src={currentQ.explanationImageURL} alt="Explanation" style={{maxWidth: '100%', borderRadius: 8, marginTop: 16}} />
                          )}
                          {currentQ.videoURL && (
                            <div style={{marginTop: 16, height: 400}}>
                               <ReactPlayer url={currentQ.videoURL} width="100%" height="100%" controls />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Navigation */}
                  <div className={styles.navigationRow}>
                     <div style={{display: 'flex', gap: 12}}>
                       <button className={styles.navBtn} onClick={navPrev} disabled={currentIndex === 0}>
                         <ChevronLeft size={18} /> Prev
                       </button>
                       {!isReview && answers[currentIndex] !== undefined && (
                         <button className={styles.clearBtn} onClick={clearAnswer}>Clear Response</button>
                       )}
                     </div>
                     <button className={`${styles.navBtn} ${styles.next}`} onClick={navNext} disabled={currentIndex === totalQ - 1}>
                       {isReview ? 'Next' : 'Save & Next'} <ChevronRight size={18} />
                     </button>
                  </div>
               </div>
            </div>

            {/* Sidebar Palette */}
            <div className={`${styles.sidebar} ${showPaletteMobile ? styles.showMobileSidebar : ''}`}>
               <div className={styles.paletteCard}>
                 <div className={styles.paletteHeaderRow}>
                   <h3 className={styles.paletteTitle}>Question Palette</h3>
                   <button className={styles.closePaletteBtn} onClick={() => setShowPaletteMobile(false)}><X size={20}/></button>
                 </div>
                 
                 <div className={styles.paletteLegend}>
                    {!isReview && (
                      <>
                        <div className={styles.legendItem}><div className={`${styles.legendBox} ${styles.answered}`}></div> Answered</div>
                        <div className={styles.legendItem}><div className={`${styles.legendBox} ${styles.marked}`}></div> Marked</div>
                        <div className={styles.legendItem}><div className={`${styles.legendBox} ${styles.unattempted}`}></div> Unattempted</div>
                      </>
                    )}
                 </div>

                 <div className={styles.paletteScrollArea}>
                    {Object.entries(groupedQuestions).map(([subj, qs]) => (
                      <div key={subj} className={styles.subjectGroup}>
                        <div className={styles.subjectName}>{subj}</div>
                        <div className={styles.grid}>
                          {qs.map(({ index }) => {
                             let btnClass = styles.gridBtn;
                             if (index === currentIndex) btnClass += ` ${styles.active}`;
                             if (!isReview) {
                               if (answers[index] !== undefined) btnClass += ` ${styles.answered}`;
                               if (markedForReview[index]) btnClass += ` ${styles.marked}`;
                             } else {
                               // For review palette, could show correct/incorrect colors, but keep simple for now
                               if (answers[index] !== undefined) btnClass += ` ${styles.answered}`; // Just to show what was attempted
                             }
                             
                             return (
                               <button key={index} className={btnClass} onClick={() => jumpToQuestion(index)}>
                                  {index + 1}
                               </button>
                             );
                          })}
                        </div>
                      </div>
                    ))}
                 </div>
                 
                 {!isReview && (
                   <div className={styles.submitCard}>
                      <button className={styles.submitBtn} onClick={submitTest}>
                        <Save size={18} /> Submit Test Final
                      </button>
                   </div>
                 )}
                 {isReview && (
                   <div className={styles.submitCard}>
                      <Link to="/resources" className={styles.submitBtn}>
                        <ArrowLeft size={18} /> Back to Library
                      </Link>
                   </div>
                 )}
               </div>
            </div>

            {/* Mobile overlays */}
            {showPaletteMobile && <div className={styles.paletteOverlay} onClick={() => setShowPaletteMobile(false)} />}
            <button className={styles.mobilePaletteToggle} onClick={() => setShowPaletteMobile(true)}>
               <Menu size={20} /> Palette
            </button>
         </div>
      </div>
    </div>
  );
};

export default TestEnvironmentPage;
