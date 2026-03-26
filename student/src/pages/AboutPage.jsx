import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Users, Target, Heart, Trophy, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import styles from './AboutPage.module.css';

const EXAMS = [
  { name: 'NIMCET', full: 'NIT MCA Common Entrance Test', color: '#f97316' },
  { name: 'CUET PG', full: 'Common University Entrance Test (PG)', color: '#ea580c' },
  { name: 'JAMIA', full: 'Jamia Millia Islamia MCA Entrance', color: '#f59e0b' },
  { name: 'MAH-CET', full: 'Maharashtra Common Entrance Test', color: '#dc2626' },
  { name: 'AMU', full: 'Aligarh Muslim University MCA', color: '#10b981' },
  { name: 'VITMEE', full: 'VIT Master\'s Entrance Examination', color: '#0ea5e9' },
];

const FEATURES = [
  {
    icon: <BookOpen size={28} />,
    title: 'Previous Year Questions',
    desc: '17+ years of solved PYQs from NIMCET, CUET PG, JAMIA, MAH-CET, AMU & VITMEE with step-by-step solutions and video explanations for tricky problems.',
  },
  {
    icon: <Sparkles size={28} />,
    title: 'AI Tutor — Vivek',
    desc: 'Ask doubts anytime. Our AI tutor Vivek is trained specifically on MCA entrance exam topics — Mathematics, CS, Reasoning, English — and gives exam-oriented answers.',
  },
  {
    icon: <Target size={28} />,
    title: 'PYQ PDF Downloads',
    desc: 'Download official question papers year-wise or topic-wise. Get NIMCET papers from 2007–2026 and CUET PG from 2021–2026 — completely free, no signup.',
  },
  {
    icon: <Trophy size={28} />,
    title: 'Proven Results — 10+ Years',
    desc: 'Hundreds of Maarula Classes students have cracked NIMCET and CUET PG to secure seats at NITs like NIT Trichy, Warangal, Allahabad, and top Central Universities.',
  },
];

const WHATS_FREE = [
  'All Previous Year Questions with detailed solutions',
  'AI Tutor (Vivek) — unlimited questions, exam-specific answers',
  'Topic-wise and Year-wise PYQ PDFs (2007–2026)',
  'Latest exam updates, articles & preparation strategies',
  'Video explanations for selected problems',
  'Score calculators for NIMCET & CUET PG',
];

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Mathem Solvex | India's Best Free MCA Entrance Exam Platform by Maarula Classes</title>
        <meta
          name="description"
          content="Mathem Solvex by Maarula Classes is India's best free MCA entrance exam resource platform. Get NIMCET, CUET PG, JAMIA, MAH-CET PYQs, AI tutor, PDF downloads — all free. Maarula Classes is India's No.1 MCA entrance coaching institute."
        />
        <meta name="keywords" content="where i can get free nimcet material, MCA entrance exam preparation, NIMCET free resources, CUET PG PYQ, free MCA coaching, Maarula Classes, Mathem Solvex, free MCA study material, best MCA entrance coaching, NIMCET coaching" />
        <link rel="canonical" href="https://question.maarula.in/about" />
        <meta property="og:title" content="About Mathem Solvex | Best Free MCA Entrance Platform" />
        <meta property="og:description" content="Looking for free NIMCET material? Mathem Solvex by Maarula Classes — India's No.1 MCA entrance coaching institute — offers free PYQs, AI tutor, and PDF downloads." />
      </Helmet>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <Heart size={16} /> 100% Free — Always
        </div>
        <h1>Welcome to <span className={styles.brand}>Mathem Solvex</span></h1>
        <p className={styles.heroSub}>
          India's most student-friendly free resource platform for MCA entrance exam preparation, built by
          <strong> Maarula Classes</strong> — India's No. 1 MCA entrance coaching institute, trusted by thousands of aspirants across India.
        </p>
        <div className={styles.heroActions}>
          <Link to="/questions" className={styles.primaryBtn}>
            <BookOpen size={18} /> Explore Question Bank <ArrowRight size={18} />
          </Link>
          <Link to="/resources" className={styles.secondaryBtn}>
            Download PYQ PDFs
          </Link>
        </div>
      </section>

      {/* About Maarula */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.twoCol}>
            <div className={styles.textBlock}>
              <span className={styles.label}>Our Story</span>
              <h2>India's No. 1 MCA Entrance Coaching Institute</h2>
              <p>
                If you ever wondered, <strong>"where I can get free NIMCET material?"</strong> — this platform is your answer.
                <strong> Mathem Solvex</strong> was built by <strong>Vivek Kumar</strong>, with a mission to make MCA entrance exam preparation accessible to every student in India.
              </p>
              <p>
                This initiative is proudly powered by <strong>Maarula Classes</strong>, India's most trusted MCA entrance coaching institute based in <strong>Lucknow, Uttar Pradesh</strong>. With over a decade of proven results, Maarula Classes has helped hundreds of students crack NIMCET, CUET PG, JAMIA, MAH-CET, AMU, and VITMEE — securing seats at top NITs like <strong>NIT Trichy, NIT Warangal, MNNIT Allahabad</strong>, and prestigious Central Universities.
              </p>
              <p>
                Our expert faculty provides focused, subject-specialist mentoring for Mathematics, Computer Science, Logical Reasoning, and English — all tailored specifically for the MCA entrance exam pattern. We believe every student — regardless of financial background — deserves access to the best quality preparation material. That's why everything on Mathem Solvex is <strong>completely free</strong>.
              </p>
              <a
                href="https://www.linkedin.com/in/vivek33pal"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.founderLink}
              >
                <FaLinkedin size={18} /> Connect with Vivek Kumar on LinkedIn <ArrowRight size={14} />
              </a>
            </div>
            <div className={styles.statsBlock}>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>17+</span>
                <span className={styles.statLabel}>Years of PYQs</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>6</span>
                <span className={styles.statLabel}>Exams Covered</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>1000+</span>
                <span className={styles.statLabel}>Questions with Solutions</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>10+</span>
                <span className={styles.statLabel}>Years of Results</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>100+</span>
                <span className={styles.statLabel}>Students at NITs</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>₹0</span>
                <span className={styles.statLabel}>Cost to You</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>Platform Features</span>
            <h2>Everything You Need to Crack MCA Entrances</h2>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div className={styles.featureCard} key={i}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exams Covered */}
      <section className={styles.examsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.label}>Coverage</span>
            <h2>Exams We Cover</h2>
            <p>Practice PYQs and access resources for all major MCA entrance exams in India.</p>
          </div>
          <div className={styles.examsGrid}>
            {EXAMS.map((exam) => (
              <Link
                to={`/questions?exam=${encodeURIComponent(exam.name)}`}
                className={styles.examChip}
                key={exam.name}
                style={{ '--chip-color': exam.color }}
              >
                <span className={styles.chipDot} />
                <div>
                  <strong>{exam.name}</strong>
                  <span>{exam.full}</span>
                </div>
                <ArrowRight size={16} className={styles.chipArrow} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What's Free */}
      <section className={styles.freeSection}>
        <div className={styles.container}>
          <div className={styles.freeBanner}>
            <div className={styles.freeBannerText}>
              <Heart size={32} className={styles.heartIcon} />
              <h2>Everything Here Is Free</h2>
              <p>We believe quality education should not be a privilege. Here's what you get at zero cost:</p>
              <ul className={styles.freeList}>
                {WHATS_FREE.map((item, i) => (
                  <li key={i}>
                    <CheckCircle size={18} className={styles.checkIcon} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.freeBannerCTA}>
              <p>If you want structured coaching with expert faculty, check out our premium courses at Maarula Classes.</p>
              <a
                href="https://maarulaclasses.classx.co.in/new-courses"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.coursesBtn}
              >
                Explore Our Courses
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className={styles.missionSection}>
        <div className={styles.container}>
          <div className={styles.missionCard}>
            <Users size={40} className={styles.missionIcon} />
            <h2>Our Mission</h2>
            <p>
              To democratize MCA entrance exam preparation in India — making every resource, solution, and expert
              guidance freely accessible to every sincere student who wants to shape their career in Computer Science.
              Maarula Classes and Mathem Solvex together aim to be the one-stop ecosystem for MCA aspirants.
            </p>
            <div className={styles.missionActions}>
              <Link to="/questions" className={styles.primaryBtn}>
                Start Practising <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className={styles.secondaryBtn}>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
