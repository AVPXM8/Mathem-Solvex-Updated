// export default SingleQuestionPage;
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import ReactPlayer from 'react-player/youtube';
import useMathJax from '../hooks/useMathJax';
import MathPreview from '../components/MathPreview';
import { reRenderMathJax } from '../utils/mathjax';
import { Helmet } from 'react-helmet-async';
import styles from './SingleQuestionPage.module.css';
import { QuestionListSkeleton } from '../components/SkeletonLoader';

// ---- helpers for safe SEO text ----
const stripHtmlAndMath = (s = '') =>
  s
    .replace(/<[^>]+>/g, ' ')          // strip HTML tags
    .replace(/\$+[^$]*\$+/g, ' ')      // strip $...$ LaTeX
    .replace(/\\\[.*?\\\]/gs, ' ')     // strip \[...\] LaTeX blocks
    .replace(/\\\((.|\n)*?\\\)/g, ' ') // strip \( ... \)
    .replace(/\s+/g, ' ')
    .trim();

const truncate = (s = '', n = 160) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
const esc = (s = '') =>
  s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

const SingleQuestionPage = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const explanationRef = useRef(null);
  const feedbackRef = useRef(null);

  // Re-render MathJax when data changes
  useMathJax([question, relatedQuestions]);

  useEffect(() => {
    setLoading(true);
    // reset view for new id
    setQuestion(null);
    setRelatedQuestions([]);
    setShowExplanation(false);
    setShowVideo(false);
    setIsSubmitted(false);
    setSelectedOption(null);

    const fetchAllData = async () => {
      try {
        const [questionRes, relatedRes] = await Promise.all([
          api.get(`/questions/${id}`),
          api.get(`/questions/${id}/related`)
        ]);
        setQuestion(questionRes.data);
        setRelatedQuestions(relatedRes.data);
      } catch (err) {
        console.error('Failed to fetch question data', err);
        setQuestion(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    // scroll to top on route change
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (isSubmitted && feedbackRef.current) {
      feedbackRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isSubmitted]);

  const handleOptionSelect = (index) => {
    if (!isSubmitted) {
      setSelectedOption(index);
      setIsSubmitted(true);
      setShowExplanation(true);
      setTimeout(reRenderMathJax, 0);
    }
  };

  const handleSubmit = () => {
    if (selectedOption === null) {
      alert('Please select an option first.');
      return;
    }
    setIsSubmitted(true);
    setTimeout(reRenderMathJax, 0);
  };

  const handleToggleExplanation = () => {
    setShowExplanation(prev => {
      setTimeout(reRenderMathJax, 0);
      return !prev;
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading Question...</div>;
  }

  if (!question) {
    return (
      <>
        <Helmet>
          <title>Question Not Found | Maarula</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div>Question not found or could not be loaded.</div>
      </>
    );
  }

  const isCorrect = question.options?.[selectedOption]?.isCorrect;

  // ---- SEO fields built from actual data (no backend changes) ----
  const plainTextQuestion = stripHtmlAndMath(question.questionText || '');
  const pageUrl = `https://question.maarula.in/question/${question._id}`;
  const pageTitle = `${plainTextQuestion.slice(0, 60)}... | Maarula`;
  const rawDesc = `Practice problem: ${question.subject || ''} — ${question.exam || ''} ${question.year || ''}. ${plainTextQuestion}`;
  const pageDescription = truncate(rawDesc, 160);
  const imageUrl = question.questionImageURL || 'https://question.maarula.in/maarulalogo.png';

  const publishedISO = question.createdAt ? new Date(question.createdAt).toISOString() : undefined;
  const modifiedISO = question.updatedAt ? new Date(question.updatedAt).toISOString() : publishedISO;

  // QAPage structured data
  const qaSchema = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: plainTextQuestion.slice(0, 180),
      text: plainTextQuestion,
      answerCount: (question.options || []).length,
      ...(question.options
        ? (() => {
            const accepted = question.options.find(o => o.isCorrect);
            return accepted
              ? { acceptedAnswer: { '@type': 'Answer', text: stripHtmlAndMath(accepted.text || '') } }
              : {};
          })()
        : {}),
      dateCreated: publishedISO || modifiedISO,
      about: question.subject || undefined,
      eduQuestionType: question.difficulty || undefined,
      url: pageUrl
    }
  };

  // Breadcrumbs
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://question.maarula.in/' },
      { '@type': 'ListItem', position: 2, name: 'Question Library', item: 'https://question.maarula.in/questions' },
      { '@type': 'ListItem', position: 3, name: question.subject || 'Question', item: pageUrl }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{esc(pageTitle)}</title>
        <meta name="description" content={esc(pageDescription)} />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Maarula" />
        <meta property="og:title" content={esc(pageTitle)} />
        <meta property="og:description" content={esc(pageDescription)} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={imageUrl} />
        {publishedISO && <meta property="article:published_time" content={publishedISO} />}
        {modifiedISO && <meta property="article:modified_time" content={modifiedISO} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={esc(pageTitle)} />
        <meta name="twitter:description" content={esc(pageDescription)} />
        <meta name="twitter:image" content={imageUrl} />

        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(qaSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
      </Helmet>

      <div className={styles.pageLayout}>
        <div className={styles.mainContent}>
          <div className={styles.breadcrumb}>
            <Link to="/questions">Question Library</Link> &rsaquo; {question.subject}
          </div>

          <div className={styles.questionCard}>
            <div className={styles.questionHeader}>
              <span>{question.exam} | {question.subject} | {question.year}</span>
            </div>

            {/* Clear H1 for SEO */}
            <h1 className={styles.questionTitle}>
              {plainTextQuestion.slice(0, 100)}{plainTextQuestion.length > 100 ? '…' : ''}
            </h1>

            <MathPreview latexString={question.questionText} className={styles.questionBody} />

            {question.questionImageURL && (
              <img
                src={question.questionImageURL}
                alt="Question"
                className={styles.mainImage}
                loading="lazy"
                decoding="async"
              />
            )}

            <h3 className={styles.optionsHeader}>Choose the correct answer:</h3>
            <div className={styles.optionsGrid}>
              {question.options.map((option, index) => {
                let buttonClass = styles.optionButton;
                if (isSubmitted) {
                  if (option.isCorrect) buttonClass += ` ${styles.correct}`;
                  else if (index === selectedOption) buttonClass += ` ${styles.incorrect}`;
                } else if (index === selectedOption) {
                  buttonClass += ` ${styles.selected}`;
                }

                return (
                  <button
                    key={index}
                    className={buttonClass}
                    onClick={() => handleOptionSelect(index)}
                    disabled={isSubmitted}
                    aria-pressed={selectedOption === index}
                  >
                    <span className={styles.optionLetter}>{String.fromCharCode(65 + index)}</span>
                    <MathPreview latexString={option.text || ''} className={styles.optionContent} />
                    {option.imageURL && (
                      <img
                        src={option.imageURL}
                        alt={`Option ${index + 1}`}
                        className={styles.optionImage}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {!isSubmitted && (
              <div className={styles.submitContainer}>
                <button onClick={handleSubmit} className={styles.submitBtn} disabled={selectedOption === null}>
                  Choose an Answer to solution
                </button>
              </div>
            )}
          </div>

          {isSubmitted && (
            <div ref={feedbackRef} className={styles.feedbackCard}>
              <p className={isCorrect ? styles.correctText : styles.incorrectText}>
                {isCorrect ? '✅ Correct Answer! Well done.' : "Oops! That's not correct. Please review the explanation for better understanding."}
              </p>
              <div className={styles.buttonGroup}>
                <button onClick={handleToggleExplanation} className={styles.explanationBtn}>
                  {showExplanation ? 'Hide' : 'Show'} Detailed Explanation
                </button>

                {question.videoURL && (
                  <button onClick={() => setShowVideo(!showVideo)} className={styles.explanationBtn}>
                    {showVideo ? 'Hide' : 'Show'} Video Solution
                  </button>
                )}
              </div>
            </div>
          )}

          {showExplanation && (
            <div ref={explanationRef} className={styles.explanationBox}>
              <h3>Explanation</h3>
              {question.explanationText ? (
                <MathPreview latexString={question.explanationText} />
              ) : (
                <p>No text explanation available.</p>
              )}
              {question.explanationImageURL && (
                <img
                  src={question.explanationImageURL}
                  alt="Explanation diagram"
                  className={styles.mainImage}
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
          )}

          {showVideo && question.videoURL && (
            <div className={styles.explanationBox}>
              <h3>Video Explanation</h3>
              <div className={styles.playerContainer}>
                <ReactPlayer
                  url={question.videoURL}
                  width="100%"
                  height="100%"
                  controls
                  className={styles.reactPlayer}
                />
              </div>
            </div>
          )}

          <div className={styles.reportSection}>
            <Link to={`/report-issue/${id}`}>Report an issue with this question</Link>
          </div>
        </div>

        <aside className={styles.sidebar}>
          {relatedQuestions.length > 0 && (
            <div className={styles.sidebarBlock}>
              <h3>Related Questions</h3>
              <div className={styles.relatedList}>
                {relatedQuestions.map(q => (
                  <Link to={`/question/${q._id}`} key={q._id} className={styles.relatedItem}>
                    <MathPreview latexString={(q.questionText || '').substring(0, 80) + '...'} />
                    <span>&rsaquo;</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
};

export default SingleQuestionPage;
