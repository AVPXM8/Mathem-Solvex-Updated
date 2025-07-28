import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import useMathJax from '../hooks/useMathJax';
import { Helmet } from 'react-helmet-async'; 
import ReactPlayer from 'react-player/youtube';
import styles from './SinglePostPage.module.css';
import { FaWhatsapp, FaTelegram, FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'; 
const SinglePostPage = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useMathJax([post]);

    useEffect(() => {
        const fetchPostData = async () => {
            try {
                setLoading(true);
                const postResponse = await api.get(`/posts/${slug}`);
                setPost(postResponse.data);

                // Fetch recent posts for the sidebar (you might need to adjust the API endpoint)
                const recentResponse = await api.get(`/posts?limit=3`);
                setRecentPosts(recentResponse.data.filter(p => p.slug !== slug));
            } catch (error) {
                console.error("Failed to fetch post data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPostData();
    }, [slug]);

    if (loading) return <div className={styles.loading}>Loading Article...</div>;
    if (!post) return <div className={styles.loading}>Article not found.</div>;
    
    const pageUrl = `https://question.maarula.in/articles/${post.slug}`;
    const pageTitle = `${post.title} | Maarula Classes`;
    const pageDescription = post.metaDescription || post.content.substring(0, 160).replace(/<[^>]+>/g, '');
    const articleSchema = {

        "@context": "https://schema.org",

        "@type": "Article",

        "headline": post.title,

        "description": pageDescription,

        "image": post.featuredImage || "/maarulalogo.png",

        "author": {

            "@type": "Organization",

            "name": "Maarula Classes"

        },

        "publisher": {

            "@type": "Organization",

            "name": "Maarula Classes",

            "logo": {

                "@type": "ImageObject",

                "url": "https://question.maarula.in/maarulalogo.png"

            }

        },

        "datePublished": post.createdAt,

        "dateModified": post.updatedAt

    };

    return (
        <>
           <Helmet>
               <title>{pageTitle}</title>
               <meta name="description" content={pageDescription} />
               <link rel="canonical" href={pageUrl} />
               <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
           </Helmet>

            <div className={styles.container}>
                <article className={styles.postArticle}>
                    <header className={styles.postHeader}>
                        <p className={styles.category}>{post.category}</p>
                        <h1>{post.title}</h1>
                        <div className={styles.meta}>
                            <span>By {post.author || 'Maarula Classes'}</span>
                            <span>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </header>
                    
                    {post.featuredImage && (
                        <img src={post.featuredImage} alt={post.title} className={styles.featuredImage} />
                    )}

                    <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: post.content }}></div>
                    {post.videoURL && (
                    <div className={styles.videoContainer}>
                        <h3>For detailed information check out the video</h3>
                        <div className={styles.playerWrapper}>
                            <ReactPlayer
                                url={post.videoURL}
                                className={styles.reactPlayer}
                                width="100%"
                                height="100%"
                                controls={true}
                            />
                        </div>
                    </div>
                )}
                    <div className={styles.shareButtons}>
                        <span>This information is also important for your friend!, share now:</span>
                        <a href={`https://wa.me/?text=${encodeURIComponent(post.title + " - " + pageUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className={`${styles.socialIcon} ${styles.whatsapp}`}><FaWhatsapp /></a>
                        <a href={`https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Telegram" className={`${styles.socialIcon} ${styles.telegram}`}><FaTelegram /></a>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className={`${styles.socialIcon} ${styles.facebook}`}><FaFacebook /></a>
                        <a href={`https://twitter.com/intent/tweet?url=${pageUrl}&text=${post.title}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className={`${styles.socialIcon} ${styles.twitter}`}><FaXTwitter /></a>
                        <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${pageUrl}&title=${post.title}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className={`${styles.socialIcon} ${styles.linkedin}`}><FaLinkedin /></a>
                    </div>
                </article>

                <aside className={styles.sidebar}>
                    <div className={styles.sidebarWidget}>
                        <h3 className={styles.widgetTitle}>Recent Posts</h3>
                        {recentPosts.map(recent => (
                            <Link to={`/articles/${recent.slug}`} key={recent._id} className={styles.recentPost}>
                                {recent.title}
                            </Link>
                        ))}
                    </div>
                </aside>
            </div>
        </>
    );
};

export default SinglePostPage;