import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import useMathJax from '../hooks/useMathJax';
import { Helmet } from 'react-helmet-async'; 
import ReactPlayer from 'react-player/youtube';
import styles from './SinglePostPage.module.css';
import { FaWhatsapp, FaTelegram, FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'; 

// ---- helpers: keep SEO text clean & safe ----
const stripHtml = (s = '') => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const truncate = (s = '', n = 160) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
const esc = (s = '') =>
  s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

const SinglePostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useMathJax([post, recentPosts]);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);

        // Your existing API contracts remain unchanged:
        const postResponse = await api.get(`/posts/${slug}`);
        setPost(postResponse.data);

        const recentResponse = await api.get(`/posts?limit=4`);
        const postsArray = Array.isArray(recentResponse.data)
          ? recentResponse.data
          : recentResponse.data.posts;

        if (postsArray) {
          setRecentPosts(postsArray.filter(p => p.slug !== slug).slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch post data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPostData();
  }, [slug]);

  if (loading) return <div className={styles.loading}>Loading Article...</div>;
  if (!post) return <div className={styles.loading}>Article not found.</div>;

  // ---- SEO fields (safe, trimmed, consistent) ----
  const pageUrl = `https://question.maarula.in/articles/${post.slug}`;
  const rawDesc = post.metaDescription || stripHtml(post.content || '');
  const pageDescription = truncate(rawDesc, 160);
  const pageTitle = `${post.title} | Maarula Classes`;
  const imageUrl =
    post.featuredImage ||
    'https://res.cloudinary.com/dwmj6up6j/image/upload/v1752687380/rqtljy0wi1uzq3itqxoe.png';

  const publishedISO = post.createdAt ? new Date(post.createdAt).toISOString() : undefined;
  const modifiedISO = post.updatedAt ? new Date(post.updatedAt).toISOString() : publishedISO;

  // ---- Structured data: BlogPosting is preferred for articles ----
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: pageDescription,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: publishedISO,
    dateModified: modifiedISO,
    author: post.author
      ? { '@type': 'Person', name: post.author }
      : { '@type': 'Organization', name: 'Maarula Classes' },
    publisher: {
      '@type': 'Organization',
      name: 'Maarula Classes',
      logo: {
        '@type': 'ImageObject',
        url: 'https://res.cloudinary.com/dwmj6up6j/image/upload/v1752687380/rqtljy0wi1uzq3itqxoe.png'
      }
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://question.maarula.in/' },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: 'https://question.maarula.in/articles' },
      { '@type': 'ListItem', position: 3, name: post.title, item: pageUrl }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{esc(pageTitle)}</title>
        <meta name="description" content={esc(pageDescription)} />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Maarula Classes" />
        <meta property="og:title" content={esc(pageTitle)} />
        <meta property="og:description" content={esc(pageDescription)} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={imageUrl} />
        {/* helpful for some platforms */}
        {publishedISO && <meta property="article:published_time" content={publishedISO} />}
        {modifiedISO && <meta property="article:modified_time" content={modifiedISO} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={esc(pageTitle)} />
        <meta name="twitter:description" content={esc(pageDescription)} />
        <meta name="twitter:image" content={imageUrl} />

        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <div className={styles.pageWrapper}>
        <header className={styles.postHeader}>
          <p className={styles.category}>{post.category}</p>
          <h1>{post.title}</h1>
          <div className={styles.meta}>
            <span>By {post.author || 'Maarula Classes'}</span>
            <span>&bull;</span>
            <span>
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </header>

        {post.featuredImage && (
          <img
            src={post.featuredImage}
            alt={post.title}
            className={styles.featuredImage}
            loading="lazy"
            decoding="async"
          />
        )}

        <div className={styles.container}>
          <article className={styles.postArticle}>
            <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: post.content }} />

            {post.videoURL && (
              <div className={styles.videoContainer}>
                <h3>Related Video Explanation</h3>
                <div className={styles.playerWrapper}>
                  <ReactPlayer
                    url={post.videoURL}
                    className={styles.reactPlayer}
                    width="100%"
                    height="100%"
                    controls
                  />
                </div>
              </div>
            )}

            <div className={styles.shareButtons}>
              <span>This information is also important for your friend!, share now:</span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${post.title} - ${pageUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on WhatsApp"
                className={`${styles.socialIcon} ${styles.whatsapp}`}
              >
                <FaWhatsapp />
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Telegram"
                className={`${styles.socialIcon} ${styles.telegram}`}
              >
                <FaTelegram />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Facebook"
                className={`${styles.socialIcon} ${styles.facebook}`}
              >
                <FaFacebook />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on X"
                className={`${styles.socialIcon} ${styles.twitter}`}
              >
                <FaXTwitter />
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
                className={`${styles.socialIcon} ${styles.linkedin}`}
              >
                <FaLinkedin />
              </a>
            </div>
          </article>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarWidget}>
              <h3 className={styles.widgetTitle}>Recent Posts</h3>
              {recentPosts.map(recent => (
                <Link to={`/articles/${recent.slug}`} key={recent._id} className={styles.recentPost}>
                  <h4>{recent.title}</h4>
                  <span>{new Date(recent.createdAt).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default SinglePostPage;
