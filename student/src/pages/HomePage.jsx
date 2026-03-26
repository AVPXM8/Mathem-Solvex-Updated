
import React, { lazy, Suspense, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import styles from "./HomePage.module.css";

// Data & components you already have
import { students } from "../data/students";
import StudentCard from "../components/StudentCard";

// Lazy parts (below the fold / heavy)
const SuccessCarousel = lazy(() => import("../components/SuccessCarousel"));
const AwardCarousel  = lazy(() => import("../components/AwardCarousel"));

const SITE_URL = "https://question.maarula.in";

function RevealSection({ children, className = "" }) {
  const sectionRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.revealVisible);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div ref={sectionRef} className={`${styles.reveal} ${className}`}>
      {children}
    </div>
  );
}

export default function HomePage() {
  // Top 8 from 2025 (stable sort that tolerates missing numbers)
  const homepageStudents = useMemo(() => {
    const getRank = (s) =>
      parseInt(String(s?.achievement ?? "").replace(/[^0-9]/g, ""), 10) || 9999;
    return students
      .filter((s) => s.year === 2025)
      .sort((a, b) => getRank(a) - getRank(b))
      .slice(0, 8);
  }, []);

  // Meta + JSON-LD
  const title = "Mathem Solvex | NIMCET & CUET-PG PYQ Bank | Maarula Classes";
  const description = "Access 10+ years of NIMCET, CUET-PG, and MCA entrance PYQs with expert video solutions. Improve your score with Mathem Solvex by Maarula Classes.";

  return (
    <div className={styles.homePage}>
      <Helmet>
        <html lang="en" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="NIMCET PYQ, CUET PG MCA, MCA Entrance Previous Year Questions, Maarula Classes, Mathem Solvex" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={`${SITE_URL}/`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:image" content="https://res.cloudinary.com/dwmj6up6j/image/upload/v1752687380/rqtljy0wi1uzq3itqxoe.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Helmet>

      {/* HERO SECTION */}
      <header className={styles.heroSection}>
        <Suspense fallback={<div className={styles.skeletonHero} />}>
          <SuccessCarousel />
        </Suspense>
      </header>

      {/* PRIMARY SEO INTRO */}
      <section className={styles.pyqIntro}>
        <RevealSection className={styles.pyqContent}>
          <h1 className={styles.h1}>
            Master MCA Entrances with <strong>Mathem Solvex</strong>
          </h1>

          <p className={styles.lede}>
            The most comprehensive <strong>Previous Year Questions (PYQ)</strong> bank for 
            NIMCET, CUET-PG, and major MCA entrances. Expert-verified solutions designed 
            to help you ace your exams.
          </p>

          <div className={styles.pyqButtons}>
            <Link to="/questions?exam=NIMCET" className={styles.primaryBtn}>
              Explore NIMCET PYQs
            </Link>
            <Link to="/questions?exam=CUET-PG" className={styles.secondaryBtn}>
              Explore CUET-PG PYQs
            </Link>
          </div>

          <div className={styles.chipRow}>
            <Link to="/questions?exam=NIMCET&year=2024" className={styles.chip}>NIMCET 2024</Link>
            <Link to="/questions?exam=CUET-PG&year=2024" className={styles.chip}>CUET-PG 2024</Link>
            <Link to="/questions?exam=NIMCET&subject=Mathematics" className={styles.chip}>Mathematics</Link>
            <Link to="/questions?exam=CUET-PG&subject=Reasoning" className={styles.chip}>Reasoning</Link>
            <Link to="/articles" className={styles.chip}>Practice Tips</Link>
          </div>
        </RevealSection>
      </section>

      {/* FEATURES SECTION */}
      <section className={styles.featuresSection}>
        <RevealSection className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Why Choose Mathem Solvex?</h2>
          <p className={styles.sectionSubtitle}>Designed for success, built for MCA aspirants.</p>
        </RevealSection>
        
        <div className={styles.featuresGrid}>
          <RevealSection className={styles.featureCard}>
            <h3>Expert Solutions</h3>
            <p>Step-by-step verified explanations and video solutions for every complex problem.</p>
          </RevealSection>
          <RevealSection className={styles.featureCard} style={{ transitionDelay: '0.1s' }}>
            <h3>Topic-wise Filter</h3>
            <p>Target your weak areas by filtering questions by subject, topic, year, and difficulty.</p>
          </RevealSection>
          <RevealSection className={styles.featureCard} style={{ transitionDelay: '0.2s' }}>
            <h3>Real Exam Interface</h3>
            <p>Practice in an environment that mimics the actual exam to build speed and confidence.</p>
          </RevealSection>
        </div>
      </section>

      {/* HALL OF FAME */}
      <section className={styles.awardSection}>
        <RevealSection className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Our Hall of Fame</h2>
          <p className={styles.sectionSubtitle}>Celebrating the excellence of our top-ranking students.</p>
        </RevealSection>
        
        <Suspense fallback={<div className={styles.skeleton} />}>
          <AwardCarousel />
        </Suspense>

        <div className={styles.viewAllContainer}>
          <Link to="/results" className={styles.viewAllButton}>
            View Full Results (2023–2025) →
          </Link>
        </div>
      </section>

      {/* STUDENT CARDS */}
      <section className={styles.resultsSection}>
        <RevealSection className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Meet Our 2025 Stars</h2>
          <p className={styles.sectionSubtitle}>Top rankers from the latest batch leading the way.</p>
        </RevealSection>
        
        <div className={styles.resultsGrid}>
          {homepageStudents.map((s, index) => (
            <RevealSection key={s.id} style={{ transitionDelay: `${index * 0.05}s` }}>
              <StudentCard student={s} />
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ABOUT MAARULA */}
      <section className={styles.introSection}>
        <RevealSection className={styles.introContent}>
          <h2 className={styles.mainTitle}>
            India’s Premier NIMCET & MCA Entrance Coaching
          </h2>
          <p className={styles.introText}>
            For over a decade, <strong>Maarula Classes</strong> has been the standard-bearer 
            for MCA entrance preparation. Our results speak for themselves.
          </p>
          <ul className={styles.introHighlights}>
            <li>Subject-wise expert faculty mentoring</li>
            <li>In-depth conceptual clarity & shortcut tricks</li>
            <li>The most rigorous mock test series</li>
          </ul>
          <a href="https://maarula.in/" target="_blank" rel="noopener noreferrer" className={styles.primaryBtn}>
            Learn More About Maarula
          </a>
        </RevealSection>

        <RevealSection className={styles.introImageContainer}>
          <div className={styles.dualImageGrid}>
            <img src="/maarula_classroom1.jpg" alt="Maarula Classes Learning environment" className={styles.introImage} loading="lazy" />
            <img src="/maarula_classromm2.jpg" alt="Academic success at Maarula" className={styles.introImage} loading="lazy" />
          </div>
        </RevealSection>
      </section>
    </div>
  );
}
