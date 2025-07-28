import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header'; 
import Footer from './Footer'; 
import { Helmet } from 'react-helmet-async';
import FloatingSocialBar from './FloatingSocialBar';
import styles from './PublicLayout.module.css';

const PublicLayout = () => {
  const siteNavigationSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "SiteNavigationElement",
      "position": 1,
      "name": "Home",
      "url": "https://question.maarula.in"
    },
    {
      "@type": "SiteNavigationElement",
      "position": 2,
      "name": "Question Bank (PYQ)",
      "url": "https://question.maarula.in/questions"
    },
    {
      "@type": "SiteNavigationElement",
      "position": 3,
      "name": "Articles & Exam News",
      "url": "https://question.maarula.in/articles"
    }
  ]
};
  return (
    <div className={styles.pageContainer}>
       <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(siteNavigationSchema)}
            </script>
        </Helmet>
      <Header />
      <main className={styles.mainContent}>
        <Outlet /> {/* This renders your HomePage, etc. */}
      </main>
      <Footer />
      <FloatingSocialBar />
    </div>
  );
};

export default PublicLayout;