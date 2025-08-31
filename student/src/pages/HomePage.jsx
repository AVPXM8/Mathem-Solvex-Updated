import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styles from './HomePage.module.css';

// Data & Components (your existing ones)
import { students } from '../data/students';
import StudentCard from '../components/StudentCard';
import SuccessCarousel from '../components/SuccessCarousel';
import AwardCarousel from '../components/AwardCarousel';
import { useHasMounted } from '../hooks/useHasMounted';

const SITE_URL = 'https://question.maarula.in';

const examTabs = ['All', ...new Set(students.map((s) => s.exam))];

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const hasMounted = useHasMounted();

  const filteredStudents = useMemo(() => {
    if (activeTab === 'All') return students;
    return students.filter((student) => student.exam === activeTab);
  }, [activeTab]);

  // --- Structured Data ---
  const siteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mathem Solvex by Maarula Classes',
    url: `${SITE_URL}/`,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/questions?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Maarula Classes',
    url: SITE_URL,
    logo:
      'https://res.cloudinary.com/dwmj6up6j/image/upload/v1752687380/rqtljy0wi1uzq3itqxoe.png'
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What does Mathem Solvex offer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'A large, organized bank of previous year questions (PYQs) with solutions for MCA entrances such as NIMCET and CUET-PG, plus guided practice.'
        }
      },
      {
        '@type': 'Question',
        name: 'Are solutions included for PYQs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Yes. Each question page includes detailed explanations, and some have video solutions to help you master concepts.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I filter questions by exam and subject?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Absolutely. Use filters on the Question Bank page to narrow by exam (e.g., NIMCET, CUET-PG), subject, and more.'
        }
      }
    ]
  };

  // --- Meta (tight, benefit-driven, no keyword stuffing) ---
  const pageTitle = 'Mathem Solvex | NIMCET PYQ, CUET PG Previous Year Paper & MCA Prep';
  const pageDescription =
    'Mathem Solvex by Maarula Classes is India’s most comprehensive platform for MCA entrance preparation. Practice NIMCET PYQs, CUET PG previous year papers, and solved questions with detailed explanations, mock tests, and expert tips.';

  return (
    <div className={styles.homePage}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta
          name="keywords"
          content="NIMCET PYQ, CUET PG previous year paper, MCA entrance exam 2025, NIMCET solved papers, CUET PG MCA preparation, Maarula Classes"
        />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Mathem Solvex | NIMCET & CUET PG PYQ Bank by Maarula Classes"
        />
        <meta
          property="og:description"
          content="Explore NIMCET & CUET PG PYQs, solved MCA entrance papers, and mock tests with detailed explanations. Powered by Maarula Classes."
        />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://res.cloudinary.com/dwmj6up6j/image/upload/v1752687380/rqtljy0wi1uzq3itqxoe.png"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Mathem Solvex | MCA Entrance PYQs & Prep Guide"
        />
        <meta
          name="twitter:description"
          content="The best platform to practice NIMCET PYQs, CUET PG solved papers, and mock tests with detailed solutions. From Maarula Classes."
        />
        <meta
          name="twitter:image"
          content="https://res.cloudinary.com/dwmj6up6j/image/upload/v1752687380/rqtljy0wi1uzq3itqxoe.png"
        />

        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(siteSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* 1) Poster/Top images first (as you requested) */}
      {hasMounted && <SuccessCarousel />}

      {/* 2) SEO-rich PYQ intro (single H1 on page) */}
      <section className={styles.pyqIntro}>
        <div className={styles.pyqContent}>
          <h1>NIMCET & CUET-PG Previous Year Questions — with Solutions</h1>
          <p>
            <strong>Mathem Solvex by Maarula Classes</strong> is India’s most focused
            PYQ (Previous Year Questions) bank for MCA entrances. Our platform brings
            together <strong>10+ years of NIMCET PYQs</strong>,{' '}
            <strong>CUET-PG solved papers</strong>, and other top MCA entrance questions
            in one place — all with detailed explanations and step-by-step solutions.
          </p>
          <p>
            Why PYQs? Because the smartest preparation strategy is to{' '}
            <em>learn from the past</em>. By practicing topic-wise PYQs, you uncover exam
            trends, build familiarity with question patterns, and strengthen conceptual
            clarity where it matters most. Every question on Mathem Solvex is carefully
            tagged by <strong>exam</strong>, <strong>year</strong>, <strong>subject</strong>,
            and <strong>topic</strong> so you can filter exactly what you need.
          </p>
          <p>
            Whether you’re starting your MCA preparation journey or aiming for a top rank,
            our PYQ bank is designed to give you a <strong>real exam experience</strong> —
            practice, attempt solutions, watch video explanations, and track your progress
            across subjects. Join thousands of aspirants already using Maarula Classes to
            sharpen their skills and stay ahead of the competition.
          </p>

          <div className={styles.pyqButtons}>
            <Link to="/questions?exam=NIMCET" className={styles.primaryBtn}>
              Explore NIMCET PYQs
            </Link>
            <Link to="/questions?exam=CUET-PG" className={styles.primaryBtn}>
              Explore CUET-PG PYQs
            </Link>
            <Link to="/articles" className={styles.secondaryBtn}>
              Read Articles & Tips
            </Link>
          </div>
        </div>
      </section>

      {/* 3) Awards / Hall of Fame (kept after intro for trust) */}
      {hasMounted && (
        <section className={styles.awardSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our 2025 Hall of Fame</h2>
            <p className={styles.sectionSubtitle}>
              Celebrating students who secured top ranks in premier MCA entrance exams.
            </p>
          </div>
          <AwardCarousel />
          <div className={styles.sectionCta}>
            <a
              href="https://maarula.in/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaButtonPrimary}
              aria-label="Visit Maarula Classes website"
            >
              Learn more about Maarula Classes
            </a>
          </div>
        </section>
      )}

      {/* 4) Results / Student cards */}
      <section className={styles.resultsSection}>
        <h2 className={styles.sectionTitle}>Meet Our 2025 Stars</h2>

        <div className={styles.tabsContainer}>
          {examTabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.tabButton} ${
                activeTab === tab ? styles.activeTab : ''
              }`}
              onClick={() => setActiveTab(tab)}
              aria-pressed={activeTab === tab}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={styles.resultsGrid}>
          {filteredStudents.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      </section>

      {/* 5) CTA Hub */}
      <section className={styles.ctaHub}>
        <h2 className={styles.sectionTitle}>The Tools Behind The Toppers</h2>
        <p className={styles.ctaText}>
          Build exam confidence with structured practice. Access our comprehensive question
          bank with expert-verified solutions and targeted filters.
        </p>

        <div className={styles.ctaButtonContainer}>
          <Link to="/questions?exam=NIMCET" className={styles.ctaButton}>
            <strong>Explore NIMCET Bank</strong>
            <span>10+ years of topic-wise papers</span>
          </Link>
          <Link to="/questions?exam=CUET-PG" className={styles.ctaButton}>
            <strong>Access CUET-PG Bank</strong>
            <span>Master concepts with detailed solutions</span>
          </Link>
        </div>
      </section>

      {/* 6) Features */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>Why Maarula Classes?</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <h3>Expert Faculty</h3>
            <p>Experienced, subject-specialist mentors for every core area.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Strategic Organization</h3>
            <p>Questions organized by year, topic and difficulty to pace your progress.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Real Exam Experience</h3>
            <p>Practice in exam-style format to reduce surprises on test day.</p>
          </div>
        </div>
      </section>

      {/* 7) About / Intro */}
      <section className={styles.introSection}>
        <div className={styles.introContent}>
          <h2 className={styles.mainTitle}>
            India’s No. 1 NIMCET & MCA Entrance Coaching Institute
          </h2>
          <p className={styles.introText}>
            With over a decade of results, <strong>Maarula Classes</strong> leads
            <strong> NIMCET</strong> and <strong>MCA entrance</strong> preparation through
            focused teaching and practice.
          </p>
          <ul className={styles.introHighlights}>
            <li>Expert faculty for subject-wise mentoring.</li>
            <li>India’s comprehensive PYQ bank with detailed solutions.</li>
            <li>A results-driven learning community.</li>
          </ul>
          <p className={styles.introText}>
            <strong>Join Maarula and prepare with the best.</strong>
          </p>
        </div>
        <div className={styles.introImageContainer}>
          <img
            src="https://maarula.in/wp-content/uploads/2024/06/2R1A0289-1024x683.jpg"
            alt="Students at Maarula Classes during a session"
            className={styles.introImage}
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
