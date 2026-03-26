import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SpeedInsights } from '@vercel/speed-insights/react';

// --- Import All Page Components ---
import HomePage from './pages/HomePage';
import QuestionLibraryPage from './pages/QuestionLibraryPage';
import SingleQuestionPage from './pages/SingleQuestionPage';
import ReportIssuePage from './pages/ReportIssuePage';
import ArticleListPage from './pages/ArticleListPage';
import SinglePostPage from './pages/SinglePostPage';
import ResultsPage from './pages/ResultsPage';
import PYQResourcesPage from './pages/PYQResourcesPage';
import FullPaperViewPage from './pages/FullPaperViewPage';
import TestEnvironmentPage from './pages/TestEnvironmentPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
// --- Import Layout Components ---
import PublicLayout from './components/PublicLayout';


function App() {
  return (
    <HelmetProvider>
      <SpeedInsights />
      <Routes>
        {/* === Public Routes (for students) === */}

        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="questions" element={<QuestionLibraryPage />} />
          <Route path="question/:id" element={<SingleQuestionPage />} />
          <Route path="report-issue/:id" element={<ReportIssuePage />} />
          <Route path="articles" element={<ArticleListPage />} />
          <Route path="articles/:slug" element={<SinglePostPage />} />
          <Route path="resources" element={<PYQResourcesPage />} />
          <Route path="resources/:examName" element={<PYQResourcesPage />} />
          <Route path="paper/:examName/:year" element={<FullPaperViewPage />} />
          <Route path="test" element={<TestEnvironmentPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>
        {/* Any other URL that doesn't match will be redirected to the public homepage */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HelmetProvider>
  );
}

export default App;