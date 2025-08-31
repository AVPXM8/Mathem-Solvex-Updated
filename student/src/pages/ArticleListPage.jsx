import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Helmet } from 'react-helmet-async';
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

const ArticleListPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all posts (uses your existing endpoint)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/posts'); // no change to your API
        // Accept array or {posts: []}
        const data = Array.isArray(res.data) ? res.data : res.data?.posts || [];
        setPosts(data);
      } catch (err) {
        console.error('Failed to fetch posts', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Feature the newest post (first), list the rest
  const featured = posts[0];
  const others = posts.slice(1);

  // JSON-LD: Breadcrumbs
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: `${SITE_ORIGIN}/articles` },
    ],
  };

  // JSON-LD: ItemList of articles + Blog (helps AI Overviews/Discover)
  const itemListSchema = useMemo(() => {
    const list = posts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_ORIGIN}/articles/${p.slug}`,
      name: p.title,
    }));
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListOrder: 'http://schema.org/ItemListUnordered',
      numberOfItems: posts.length,
      itemListElement: list,
    };
  }, [posts]);

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
        <title>Articles & Exam News | Maarula Classes</title>
        <meta
          name="description"
          content="Latest exam updates, strategy guides, and insights for NIMCET, CUET-PG, and other MCA entrances from Maarula Classes."
        />
        <link rel="canonical" href={`${SITE_ORIGIN}/articles`} />

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

      {/* Featured article */}
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
      {!loading && others.length > 0 && (
        <section aria-label="More articles" className={styles.postGrid}>
          {others.map(post => (
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
