import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ArticleListPage.module.css';

// Safe excerpt builder (client-side)
const toPlainText = (html = '') => {
  const el = document.createElement('div');
  el.innerHTML = html;
  const text = el.textContent || el.innerText || '';
  return text.replace(/\s+/g, ' ').trim();
};
const excerpt = (html = '', n = 160) => {
  const t = toPlainText(html);
  return t.length > n ? `${t.slice(0, n).trim()}…` : t;
};

const FALLBACK_IMAGE =
  'https://res.cloudinary.com/dwmj6up6j/image/upload/f_auto,q_auto,w_1200/v1752687380/rqtljy0wi1uzq3itqxoe.png';

const SITE_ORIGIN = 'https://question.maarula.in';
const POSTS_PER_PAGE = 12;

const ArticleListPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Pagination state
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Fetch posts with pagination
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/posts', {
          params: { page: currentPage, limit: POSTS_PER_PAGE }
        });
        const data = res.data;
        // Backend returns { posts, total, page, totalPages }
        setPosts(Array.isArray(data.posts) ? data.posts : (Array.isArray(data) ? data : []));
        setTotalPosts(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('Failed to fetch posts', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Page navigation
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', String(page));
      setSearchParams(newParams);
    }
  };

  // Feature the newest post (page 1 only), list the rest
  const isFirstPage = currentPage === 1;
  const featured = isFirstPage ? posts[0] : null;
  const gridPosts = isFirstPage ? posts.slice(1) : posts;

  // Generate page buttons with ellipses
  const renderPageButtons = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) end = Math.min(totalPages, maxVisible);
    if (currentPage > totalPages - 3) start = Math.max(1, totalPages - maxVisible + 1);

    if (start > 1) {
      pages.push(
        <button key={1} onClick={() => goToPage(1)} className={`${styles.pageBtn} ${currentPage === 1 ? styles.activePageBtn : ''}`}>1</button>
      );
      if (start > 2) pages.push(<span key="sep-s" className={styles.ellipsis}>…</span>);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button key={i} onClick={() => goToPage(i)} className={`${styles.pageBtn} ${currentPage === i ? styles.activePageBtn : ''}`} disabled={loading}>{i}</button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push(<span key="sep-e" className={styles.ellipsis}>…</span>);
      pages.push(
        <button key={totalPages} onClick={() => goToPage(totalPages)} className={`${styles.pageBtn} ${currentPage === totalPages ? styles.activePageBtn : ''}`}>{totalPages}</button>
      );
    }

    return pages;
  };

  // JSON-LD: Breadcrumbs
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: `${SITE_ORIGIN}/articles` },
    ],
  };

  // JSON-LD: ItemList
  const itemListSchema = useMemo(() => {
    const list = posts.map((p, i) => ({
      '@type': 'ListItem',
      position: (currentPage - 1) * POSTS_PER_PAGE + i + 1,
      url: `${SITE_ORIGIN}/articles/${p.slug}`,
      name: p.title,
    }));
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListOrder: 'http://schema.org/ItemListUnordered',
      numberOfItems: totalPosts,
      itemListElement: list,
    };
  }, [posts, currentPage, totalPosts]);

  const blogSchema = useMemo(() => {
    const items = posts.slice(0, 12).map(p => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: excerpt(p.content, 180),
      url: `${SITE_ORIGIN}/articles/${p.slug}`,
      image: p.featuredImage || FALLBACK_IMAGE,
      datePublished: p.createdAt,
      dateModified: p.updatedAt || p.createdAt,
      author: { '@type': 'Organization', name: 'Maarula Classes' },
      publisher: {
        '@type': 'Organization',
        name: 'Maarula Classes',
        logo: { '@type': 'ImageObject', url: FALLBACK_IMAGE },
      },
    }));
    return {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Maarula Articles & Exam News',
      url: `${SITE_ORIGIN}/articles`,
      blogPost: items,
    };
  }, [posts]);

  return (
    <div className={styles.container}>
      <Helmet>
        <title>{currentPage > 1 ? `Page ${currentPage} | ` : ''}Articles & Exam News | Maarula Classes</title>
        <meta
          name="description"
          content="Latest exam updates, strategy guides, and insights for NIMCET, CUET-PG, and other MCA entrances from Maarula Classes."
        />
        <link rel="canonical" href={`${SITE_ORIGIN}/articles${currentPage > 1 ? `?page=${currentPage}` : ''}`} />

        {/* Open Graph / Twitter */}
        <meta property="og:title" content="Latest Articles & Exam News for MCA Aspirants" />
        <meta
          property="og:description"
          content="Stay updated with preparation strategies and insights from Maarula Classes."
        />
        <meta property="og:url" content={`${SITE_ORIGIN}/articles`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={FALLBACK_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={FALLBACK_IMAGE} />
        <meta name="twitter:title" content="Latest Articles & Exam News for MCA Aspirants" />
        <meta
          name="twitter:description"
          content="Stay updated with preparation strategies and insights from Maarula Classes."
        />

        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(blogSchema)}</script>
      </Helmet>

      {/* Header */}
      <header className={styles.pageHeader}>
        <h1 className={styles.h1}>Articles &amp; Exam News</h1>
        <p className={styles.subhead}>
          The latest updates, strategies, and insights for NIMCET & CUET-PG aspirants.
        </p>
      </header>

      {/* Loading */}
      {loading && <div className={styles.loader}>Loading articles…</div>}

      {/* Featured article (page 1 only) */}
      {!loading && featured && (
        <Link
          to={`/articles/${featured.slug}`}
          className={styles.featuredCard}
          aria-label={`Read: ${featured.title}`}
        >
          <figure className={styles.featuredMedia}>
            <img
              src={featured.featuredImage || FALLBACK_IMAGE}
              alt={featured.title}
              className={styles.featuredImage}
              loading="lazy"
              decoding="async"
              width="1200"
              height="630"
            />
          </figure>
          <div className={styles.featuredContent}>
            {featured.category && <span className={styles.postCategory}>{featured.category}</span>}
            <h2 className={styles.postTitle}>{featured.title}</h2>
            <p className={styles.postExcerpt}>{excerpt(featured.content, 180)}</p>
            <span className={styles.readMore}>Read Full Article →</span>
          </div>
        </Link>
      )}

      {/* Article grid */}
      {!loading && gridPosts.length > 0 && (
        <section aria-label="More articles" className={styles.postGrid}>
          {gridPosts.map(post => (
            <Link
              to={`/articles/${post.slug}`}
              key={post._id}
              className={styles.postCard}
              aria-label={`Read: ${post.title}`}
            >
              <div className={styles.cardImageContainer}>
                <img
                  src={post.featuredImage || FALLBACK_IMAGE}
                  alt={post.title}
                  className={styles.cardImage}
                  loading="lazy"
                  decoding="async"
                  width="600"
                  height="338"
                />
              </div>
              <div className={styles.postContent}>
                {post.category && <span className={styles.postCategory}>{post.category}</span>}
                <h3 className={styles.postTitleSmall}>{post.title}</h3>
                <p className={styles.cardExcerpt}>{excerpt(post.content, 120)}</p>
                <span className={styles.readMoreSmall}>Read More →</span>
              </div>
            </Link>
          ))}
        </section>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Article pagination">
          <button
            className={styles.paginationArrow}
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={20} /> Prev
          </button>

          <div className={styles.pageNumbers}>
            {renderPageButtons()}
          </div>

          <button
            className={styles.paginationArrow}
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            Next <ChevronRight size={20} />
          </button>
        </nav>
      )}

      {/* Empty state */}
      {!loading && posts.length === 0 && (
        <div className={styles.emptyState}>
          No articles found. Please check back soon.
        </div>
      )}
    </div>
  );
};

export default ArticleListPage;
