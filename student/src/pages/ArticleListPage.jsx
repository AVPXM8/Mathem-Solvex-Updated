import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Helmet } from 'react-helmet-async';
import styles from './ArticleListPage.module.css';

// Helper function to create a clean text excerpt
const createExcerpt = (htmlString) => {
  const div = document.createElement('div');
  div.innerHTML = htmlString;
  const text = div.textContent || div.innerText || '';
  return text.substring(0, 150) + (text.length > 150 ? '...' : '');
};

const ArticleListPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.get('/posts');
                setPosts(response.data);
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const featuredPost = posts[0];
    const otherPosts = posts.slice(1);
    
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://question.maarula.in/"
        }, {
            "@type": "ListItem",
            "position": 2,
            "name": "Articles",
            "item": "https://question.maarula.in/articles"
        }]
    };

    return (
        <div className={styles.container}>
            <Helmet>
                <title>Articles & Exam News | Maarula Classes</title>
                <meta name="description" content="The latest exam updates, preparation strategies, and insights for NIMCET, CUET-PG, and other MCA entrance exams from the experts at Maarula Classes." />
                <link rel="canonical" href="https://question.maarula.in/articles" />
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            </Helmet>

            <div className={styles.pageHeader}>
                <h1>Articles & Exam News</h1>
                <p>The latest updates, strategies, and insights for NIMCET & CUET PG aspirants.</p>
            </div>

            {loading ? (
                <div className={styles.loader}>Loading articles...</div>
            ) : (
                <>
                    {/* Featured Post Section */}
                    {featuredPost && (
                        <Link to={`/articles/${featuredPost.slug}`} className={styles.featuredCard}>
                            <img src={featuredPost.featuredImage || '/success-stories.jpg'} alt={featuredPost.title} className={styles.featuredImage} />
                            <div className={styles.featuredContent}>
                                <span className={styles.postCategory}>{featuredPost.category}</span>
                                <h2 className={styles.postTitle}>{featuredPost.title}</h2>
                                <p className={styles.postExcerpt}>{createExcerpt(featuredPost.content)}</p>
                                <span className={styles.readMore}>Read Full Article &rarr;</span>
                            </div>
                        </Link>
                    )}
                    
                    {/* Grid of Other Posts */}
                    <div className={styles.postGrid}>
                        {otherPosts.map(post => (
                           <Link to={`/articles/${post.slug}`} key={post._id} className={styles.postCard}>
                                <div className={styles.cardImageContainer}>
                                   <img src={post.featuredImage || '/success-stories.jpg'} alt={post.title} className={styles.cardImage}/>
                                </div>
                                <div className={styles.postContent}>
                                   <span className={styles.postCategory}>{post.category}</span>
                                   <h3 className={styles.postTitleSmall}>{post.title}</h3>
                                   <span className={styles.readMoreSmall}>Read More &rarr;</span>
                                </div>
                           </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ArticleListPage;