// SingleQuestionPage.jsx — FINAL (SEO-friendly title, keyboard UX, public API, robust fetching)
import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactPlayer from 'react-player/youtube';
import api from '../api';
import useMathJax from '../hooks/useMathJax';
import MathPreview from '../components/MathPreview';
import { reRenderMathJax } from '../utils/mathjax';
import styles from './SingleQuestionPage.module.css';

/* ----------------------------- helpers ----------------------------- */
const toPlainText = (s = '') => {
  const noTags = s
    .replace(/<[^>]+>/g, ' ')
    .replace(/\$+[^$]*\$+/g, ' ')
    .replace(/\\\[.*?\\\]/gs, ' ')
    .replace(/\\\((.|\n)*?\\\)/g, ' ');
  const decoded = noTags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
  return decoded.replace(/\s+/g, ' ').trim();
};
const truncate = (s = '', n = 160) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
const esc = (s = '') => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ----------------------------- component ----------------------------- */
export default function SingleQuestionPage() {
  const { id } = useParams();

  const [question, setQuestion] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);

  const feedbackRef = useRef(null);

  useMathJax([question, related, showExplanation]);

  /* ----------------------------- fetch ----------------------------- */
  useEffect(() => {
    let alive = true;
    const qCtrl = new AbortController();
    const rCtrl = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);
        setQuestion(null);
        setRelated([]);
        setSelectedOption(null);
        setIsSubmitted(false);
        setShowExplanation(false);
        setShowVideo(false);
        setShowCorrect(false);

        const [qRes, rRes] = await Promise.all([
          api.get(`/questions/public/${id}`, { signal: qCtrl.signal }),
          api.get(`/questions/public/${id}/related`, { signal: rCtrl.signal })
        ]);

        if (!alive) return;
        setQuestion(qRes.data);
        setRelated(Array.isArray(rRes.data) ? rRes.data : []);
      } catch (err) {
        if (err?.name !== 'CanceledError' && err?.message !== 'canceled') {
          console.error('Failed to load question', err);
          setQuestion(null);
          setRelated([]);
        }
      } finally {
        alive && setLoading(false);
        window.scrollTo(0, 0);
      }
    }

    fetchData();
    return () => {
      alive = false;
      qCtrl.abort();
      rCtrl.abort();
    };
  }, [id]);

  /* ----------------------------- keyboard shortcuts ----------------------------- */
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (!question) return;

      if (['1','2','3','4'].includes(k)) {
        const idx = Number(k) - 1;
        if (idx < question.options.length && !isSubmitted) {
          e.preventDefault();
          handleOptionSelect(idx);
        }
      }
      if (['a','b','c','d'].includes(k)) {
        const idx = {a:0,b:1,c:2,d:3}[k];
        if (idx < question.options.length && !isSubmitted) {
          e.preventDefault();
          handleOptionSelect(idx);
        }
      }
      if (k === 'e') { e.preventDefault(); toggleExplanation(); }
      if (k === 'v') { if (question.videoURL) { e.preventDefault(); setShowVideo(s => !s); } }
      if (k === 's') { e.preventDefault(); revealAnswer(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, isSubmitted]);

  /* ----------------------------- actions ----------------------------- */
  const handleOptionSelect = (idx) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
    setIsSubmitted(true);
    setShowExplanation(true);
    setShowCorrect(false);
    setTimeout(reRenderMathJax, 0);
    setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior:'smooth', block:'center'}), 10);
  };

  const submitIfChosen = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    setTimeout(reRenderMathJax, 0);
  };

  const toggleExplanation = () => {
    setShowExplanation(prev => {
      setTimeout(reRenderMathJax, 0);
      return !prev;
    });
  };

  const revealAnswer = () => {
    setShowCorrect(true);
    setIsSubmitted(true);
    if (!showExplanation) setShowExplanation(true);
    setTimeout(reRenderMathJax, 0);
    setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior:'smooth', block:'center'}), 10);
  };

  /* ----------------------------- states/seo ----------------------------- */
  if (loading) return <div className={styles.loading}>Loading question…</div>;
  if (!question) {
    return (
      <>
        <Helmet>
          <title>Question Not Found | Mathem Solvex</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className={styles.loading}>Question not found or could not be loaded.</div>
      </>
    );
  }

  const isCorrect = question.options?.[selectedOption]?.isCorrect || false;

  const plainText = toPlainText(question.questionText || '');
  const seoTitle =
    plainText.slice(0, 100) + (plainText.length > 100 ? '…' : '');
  const pageUrl = `https://question.maarula.in/question/${question._id}`;
  const pageTitle = `${seoTitle} | Mathem Solvex`;
  const pageDescription = truncate(
    `Practice problem: ${question.subject || ''} — ${question.exam || ''} ${question.year || ''}. ${plainText}`,
    160
  );
  const ogImage = question.questionImageURL || 'https://question.maarula.in/maarulalogo.png';

  const publishedISO = question.createdAt ? new Date(question.createdAt).toISOString() : undefined;
  const modifiedISO  = question.updatedAt ? new Date(question.updatedAt).toISOString() : publishedISO;

  // QAPage + optional video structured data
  const qaSchema = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: seoTitle,
      text: plainText,
      answerCount: (question.options || []).length,
      acceptedAnswer: (() => {
        const a = (question.options || []).find(o => o.isCorrect);
        if (!a) return undefined;
        return { '@type': 'Answer', text: toPlainText(a.text || '') };
      })(),
      dateCreated: publishedISO || modifiedISO,
      about: question.subject || undefined,
      eduQuestionType: question.difficulty || undefined,
      url: pageUrl
    }
  };

  const videoSchema = question.videoURL ? {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: `${seoTitle} – video solution`,
    description: pageDescription,
    uploadDate: publishedISO || modifiedISO,
    contentUrl: question.videoURL,
    embedUrl: question.videoURL,
    thumbnailUrl: ogImage
  } : null;

  /* ----------------------------- render ----------------------------- */
  return (
    <>
      <Helmet>
        <title>{esc(pageTitle)}</title>
        <meta name="description" content={esc(pageDescription)} />
        <link rel="canonical" href={pageUrl} />

        {/* OG/Twitter */}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Mathem Solvex" />
        <meta property="og:title" content={esc(pageTitle)} />
        <meta property="og:description" content={esc(pageDescription)} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={ogImage} />
        {publishedISO && <meta property="article:published_time" content={publishedISO} />}
        {modifiedISO && <meta property="article:modified_time" content={modifiedISO} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={esc(pageTitle)} />
        <meta name="twitter:description" content={esc(pageDescription)} />
        <meta name="twitter:image" content={ogImage} />

        {/* Structured data */}
        <script type="application/ld+json">{JSON.stringify(qaSchema)}</script>
        {videoSchema && <script type="application/ld+json">{JSON.stringify(videoSchema)}</script>}
        <script type="application/ld+json">{JSON.stringify({
          '@context':'https://schema.org',
          '@type':'BreadcrumbList',
          itemListElement:[
            { '@type':'ListItem', position:1, name:'Home', item:'https://question.maarula.in/' },
            { '@type':'ListItem', position:2, name:'Question Library', item:'https://question.maarula.in/questions' },
            { '@type':'ListItem', position:3, name: question.subject || 'Question', item: pageUrl }
          ]
        })}</script>
      </Helmet>

      <div className={styles.pageLayout}>
        <div className={styles.mainContent}>
          <div className={styles.breadcrumb}>
            <Link to="/questions">Question Library</Link> &rsaquo; {question.subject}
          </div>

          <div className={styles.tipBar}>
            <strong>Tip:</strong>
            <span>Press <span className={styles.kbd}>A–D</span> or <span className={styles.kbd}>1–4</span> to answer.</span>
            <span><span className={styles.kbd}>E</span> = explanation</span>
            <span><span className={styles.kbd}>V</span> = video</span>
            <span><span className={styles.kbd}>S</span> = show answer</span>
          </div>

          <div className={styles.questionCard}>
            <div className={styles.questionHeader}>
              {question.exam} | {question.subject} | {question.year}
            </div>

            {/* SEO/A11y H1 hidden visually */}
            <h1 className={styles.srOnly}>{seoTitle}</h1>

            <div className={styles.questionBody}>
              <MathPreview latexString={question.questionText} />
            </div>

            {question.questionImageURL && (
              <img
                src={question.questionImageURL}
                alt={`${question.subject} question image`}
                className={styles.mainImage}
                loading="lazy"
                decoding="async"
              />
            )}

            <h3 className={styles.optionsHeader}>Choose the correct answer:</h3>

            <div className={styles.optionsGrid}>
              {question.options.map((opt, idx) => {
                let cls = styles.optionButton;
                if (isSubmitted) {
                  if (opt.isCorrect) cls += ` ${styles.correct}`;
                  else if (idx === selectedOption && !opt.isCorrect) cls += ` ${styles.incorrect}`;
                } else if (idx === selectedOption) {
                  cls += ` ${styles.selected}`;
                }
                return (
                  <button
                    key={idx}
                    className={cls}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={isSubmitted}
                    aria-pressed={selectedOption === idx}
                  >
                    <span className={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
                    <MathPreview latexString={opt.text || ''} className={styles.optionContent} />
                    {opt.imageURL && (
                      <img
                        src={opt.imageURL}
                        alt={`Option ${idx + 1}`}
                        className={styles.optionImage}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className={styles.submitContainer}>
              {!isSubmitted && (
                <>
                  <button className={styles.primaryBtn} onClick={submitIfChosen} disabled={selectedOption === null}>
                    Submit
                  </button>
                  <button className={styles.ghostBtn} onClick={revealAnswer}>
                    Show Answer
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Feedback + controls */}
          {isSubmitted && (
            <div ref={feedbackRef} className={styles.feedbackCard} aria-live="polite">
              <p className={isCorrect || showCorrect ? styles.correctText : styles.incorrectText}>
                {showCorrect
                  ? '✅ Answer shown.'
                  : isCorrect
                  ? '✅ Correct! Well done.'
                  : '❌ Not correct. Review the explanation below.'}
              </p>
              <div className={styles.buttonGroup}>
                <button className={styles.primaryBtn} onClick={toggleExplanation}>
                  {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                </button>
                {question.videoURL && (
                  <button className={styles.ghostBtn} onClick={() => setShowVideo(v => !v)}>
                    {showVideo ? 'Hide Video' : 'Watch Video Solution'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Explanation */}
          {showExplanation && (
            <div className={styles.explanationBox}>
              <h3>Explanation</h3>
              {question.explanationText ? (
                <MathPreview latexString={question.explanationText} />
              ) : (
                <p className={styles.incorrectText}>No text explanation available.</p>
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

          {/* Video */}
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

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {related.length > 0 && (
            <div className={styles.sidebarBlock}>
              <h3>Related Questions</h3>
              <div className={styles.relatedList}>
                {related.map(r => (
                  <Link to={`/question/${r._id}`} key={r._id} className={styles.relatedItem}>
                    <MathPreview latexString={(r.questionText || '').slice(0, 120) + '…'} />
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
}
