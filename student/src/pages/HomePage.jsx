import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styles from './HomePage.module.css';

// Import Data and Components
import { students } from '../data/students';
import StudentCard from '../components/StudentCard';
import SuccessCarousel from '../components/SuccessCarousel';

const examTabs = ['All', ...new Set(students.map(s => s.exam))];

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('All');

  const filteredStudents = useMemo(() => {
    if (activeTab === 'All') return students;
    return students.filter(student => student.exam === activeTab);
  }, [activeTab]);


  return (
    <div className={styles.homePage}>
      <Helmet>
<title>Mathem Solvex | NIMCET PYQ, CUET PG Previous Year Paper, Syllabus & Exam Notifications MCA Entrance Prep by Maarula Classes</title>

  <meta 
    name="description" 
          content="Practice NIMCET PYQs, CUET PG previous year papers, and expert-level MCA entrance questions on Mathem Solvex by Maarula Classes. Get access to solved papers, mock tests, and preparation tips from India’s best MCA coaching."
  />

  <meta 
    name="keywords" 
          content="NIMCET PYQ, CUET PG previous year paper, MCA entrance exam 2025, how to prepare for NIMCET, best NIMCET coaching, NIMCET solved papers, CUET PG MCA preparation, NIMCET question bank, Maarula Classes, MCA entrance mock test"
  />

  <link rel="canonical" href="https://question.maarula.in/" />
{/* Open Graph */}
        <meta property="og:title" content="Mathem Solvex | NIMCET & CUET PG PYQ Bank by Maarula Classes" />
        <meta property="og:description" content="Access NIMCET & CUET PG previous year question papers, MCA entrance solved papers, and expert mock tests. Powered by Maarula Classes." />
        <meta property="og:url" content="https://question.maarula.in/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://res.cloudinary.com/dwmj6up6j/image/upload/v1752683439/maarulalogo_lywhdo.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mathem Solvex | MCA Entrance PYQs & Prep Guide" />
        <meta name="twitter:description" content="Best platform to practice NIMCET PYQs, CUET PG solved papers, and mock tests. Maarula Classes brings top-notch MCA prep content." />
        <meta name="twitter:image" content="https://question.maarula.in/og-cover.jpg" />

        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Mathem Solvex by Maarula Classes",
            "url": "https://question.maarula.in/",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://question.maarula.in/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
</Helmet>


      {/* Section 1: Top Carousel */}
      <SuccessCarousel />

      {/* Section 2: Student Results  */}
      <section className={styles.resultsSection}>
        <h1 className={styles.sectionTitle}>Meet Our 2025 Stars</h1>
        <div className={styles.tabsContainer}>
          {examTabs.map(tab => (
            <button
              key={tab}
              className={`${styles.tabButton} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className={styles.resultsGrid}>
          {filteredStudents.map(student => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      </section>

      {/* Section 3: Call to Action Hub */}
      <section className={styles.ctaHub}>
        <h2 className={styles.sectionTitle}>The Tools Behind The Toppers</h2>
        <p className={styles.ctaText}>
          Our success is built on a foundation of strategic practice. Access our comprehensive question bank with detailed, expert-verified solutions and prepare with the confidence of a champion.
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

      {/* Section 4: Key Features */}
      <section className={styles.featuresSection}>
       <h2 className={styles.sectionTitle}>Why Maarula Classes?</h2>
       <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
             <h3>Expert Faculty</h3>
             <p>Maarula classes has experienced faculty for every individual subject and specialized in the subject that they will teach you.</p>
          </div>
          <div className={styles.featureCard}>
             <h3>Strategic Organization</h3>
             <p>We target weak areas with questions organized by year, topic, and difficulty, helping students progress from basic to advanced levels.</p>
          </div>
          <div className={styles.featureCard}>
             <h3>Real Exam Experience</h3>
             <p>Our test series provides a platform with the same format as the real exam, allowing you to build confidence and mastery before test day.</p>
          </div>
       </div>
      </section>

      {/* Section 5: Introduction/About Text (MOVED TO THE END) */}
      <section className={styles.introSection}>
  <h2 className={styles.mainTitle}>India’s No. 1 NIMCET & MCA Entrance Coaching Institute</h2>
  <div className={styles.introParagraphs}>
    <p className={styles.introText}>
      With over a decade of proven results, <strong>Maarula Classes</strong> stands as the undisputed leader in <strong>NIMCET</strong> and <strong>MCA entrance exam preparation</strong>. From top NITs to elite central universities, our students consistently achieve exceptional ranks thanks to our focused, strategic, and result-driven teaching methodology.
    </p>
    <p className={styles.introText}>
      Our expert faculty specialize in subject-wise mentoring, delivering a personalized learning experience backed by India’s most comprehensive <strong>question bank of NIMCET and CUET PG previous year papers</strong>. Whether you’re targeting NIMCET, CUET PG, or other MCA entrances like Jamia and BHU, Maarula provides you the tools, guidance, and confidence to succeed.
    </p>
    <p className={styles.introText}>
      Thousands of MCA aspirants trust us every year not only for our high-quality mock tests, solved PYQs, and detailed strategies — but for the community and success mindset we nurture. <strong>Join Maarula, and crack MCA entrances with the best.</strong>
    </p>
  </div>
</section>

    </div>
  );
};

export default HomePage;