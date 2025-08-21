import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styles from './HomePage.module.css';

// Import Data and Components
import { students } from '../data/students';
import StudentCard from '../components/StudentCard';
import SuccessCarousel from '../components/SuccessCarousel';
import AwardCarousel from '../components/AwardCarousel'; 
import { useHasMounted } from '../hooks/useHasMounted';

const examTabs = ['All', ...new Set(students.map(s => s.exam))];

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const hasMounted = useHasMounted();

  const filteredStudents = useMemo(() => {
    if (activeTab === 'All') return students;
    return students.filter(student => student.exam === activeTab);
  }, [activeTab]);

       const siteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Mathem Solvex by Maarula Classes",
        "url": "https://question.maarula.in/",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://question.maarula.in/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };
  return (
    <div className={styles.homePage}>
       <Helmet>
                <title>Mathem Solvex | NIMCET PYQ, CUET PG Previous Year Paper & MCA Prep</title>
                <meta name="description" content="Practice NIMCET PYQs, CUET PG previous year papers, and expert-level MCA entrance questions on Mathem Solvex by Maarula Classes. Get access to solved papers, mock tests, and preparation tips." />
                <link rel="canonical" href="https://question.maarula.in/" />
                <meta name="keywords" content="NIMCET PYQ, CUET PG previous year paper, MCA entrance exam 2025, NIMCET solved papers, CUET PG MCA preparation, Maarula Classes" />

                {/* Open Graph Tags for Social Sharing */}
                <meta property="og:title" content="Mathem Solvex | NIMCET & CUET PG PYQ Bank by Maarula Classes" />
                <meta property="og:description" content="Access NIMCET & CUET PG previous year question papers, MCA entrance solved papers, and expert mock tests. Powered by Maarula Classes." />
                <meta property="og:url" content="https://question.maarula.in/" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://res.cloudinary.com/dwmj6up6j/image/upload/v1752687380/rqtljy0wi1uzq3itqxoe.png" /> {/* Use a default share image */}

                {/* Twitter Card Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Mathem Solvex | MCA Entrance PYQs & Prep Guide" />
                <meta name="twitter:description" content="The best platform to practice NIMCET PYQs, CUET PG solved papers, and mock tests. From Maarula Classes." />
                <meta name="twitter:image" content="https://res.cloudinary.com/dwmj6up6j/image/upload/v1752687380/rqtljy0wi1uzq3itqxoe.png" />

                {/* Structured Data */}
                <script type="application/ld+json">{JSON.stringify(siteSchema)}</script>
            </Helmet>


       {hasMounted && (
        <>
          <SuccessCarousel />
          
          {/* Section for the new Award Carousel */}
          <section className={styles.awardSection}>
    <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Our 2025 Hall of Fame</h2>
        <p className={styles.sectionSubtitle}>
            Celebrating the hard work and dedication of our students who secured top ranks in premier MCA entrance exams. Your success story starts here.
        </p>
    </div>
    <AwardCarousel />
    <div className={styles.sectionCta}>
        <a href="https://maarulaclasses.classx.co.in/new-courses" target="_blank" rel="noopener noreferrer" className={styles.ctaButtonPrimary}>
            Join Our New Batch For 2026
        </a>
    </div>
</section>
        </>
      )}

      {/* Section 2: Student Results */}
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
    <div className={styles.introContent}>
        <h2 className={styles.mainTitle}>India’s No. 1 NIMCET & MCA Entrance Coaching Institute</h2>
        <p className={styles.introText}>
            With over a decade of proven results, <strong>Maarula Classes</strong> stands as the undisputed leader in <strong>NIMCET</strong> and <strong>MCA entrance exam preparation</strong>. Our students consistently achieve exceptional ranks thanks to our focused, strategic, and result-driven teaching methodology.
        </p>
        <ul className={styles.introHighlights}>
            <li><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>Expert faculty specializing in subject-wise mentoring.</li>
            <li><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>India’s most comprehensive question bank of solved PYQs.</li>
            <li><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>A nurturing community with a success-driven mindset.</li>
        </ul>
        <p className={styles.introText}>
            <strong>Join Maarula, and crack MCA entrances with the best.</strong>
        </p>
    </div>
    <div className={styles.introImageContainer}>
        {/* You can replace this with a real, high-quality image of your classes or students */}
        <img src="https://maarula.in/wp-content/uploads/2024/06/2R1A0289-1024x683.jpg" alt="Maarula Classes students in a classroom" className={styles.introImage} />
    </div>
</section>

    </div>
  );
};

export default HomePage;