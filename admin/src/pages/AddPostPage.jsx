
// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import api from '../api';
// import toast from 'react-hot-toast';

// // Use the TinyMCE Editor, just like in your AddQuestionPage
// import { Editor } from '@tinymce/tinymce-react';

// import styles from './AddQuestionPage.module.css'; // We can reuse the same form styles

// const AddPostPage = () => {
//     const { id } = useParams();
//     const isEditMode = Boolean(id);
//      const navigate = useNavigate();

//      const [formData, setFormData] = useState({
//         title: '',
//         content: '',
//         category: 'Blog',
//         metaDescription: '',
//         keywords: ''
//     });
//     const [featuredImageFile, setFeaturedImageFile] = useState(null);
//     const [loading, setLoading] = useState(false);

   
//     const tinymceApiKey = import.meta.env.VITE_TINYMCE_API_KEY;

//     useEffect(() => {
//         if (isEditMode) {
//             setLoading(true);
//             // This route gets a single post by its ID, which we need to add to the backend
//             api.get(`/posts/id/${id}`)
//                 .then(res => {
//                     setTitle(res.data.title);
//                     setContent(res.data.content);
//                     setCategory(res.data.category);
//                 })
//                 .catch(() => toast.error("Failed to load post data."))
//                 .finally(() => setLoading(false));
//         }
//     }, [id, isEditMode]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
        
//         const submissionData = new FormData();
//         submissionData.append('title', formData.title);
//         submissionData.append('content', formData.content);
//         submissionData.append('category', formData.category);
//         submissionData.append('metaDescription', formData.metaDescription);
//         submissionData.append('keywords', formData.keywords);

//         if (featuredImageFile) {
//             submissionData.append('featuredImage', featuredImageFile);
//         }
        
//         try {
//             if (isEditMode) {
//                 await api.put(`/posts/${id}`, submissionData);
//                 toast.success('Post updated successfully!');
//             } else {
//                 await api.post('/posts', submissionData);
//                 toast.success('Post created successfully!');
//             }
//             navigate('/admin/posts');
//         } catch (error) {
//             toast.error('Failed to save post.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Configuration for the TinyMCE editor for writing blog posts
//    const editorConfig = {
//     height: 500,
//     menubar: true,
//     plugins: [
//         'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
//         'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
//         'insertdatetime', 'media', 'table', 'help', 'wordcount'
//     ],
//     toolbar: 
//         'undo redo | styles | bold italic underline | ' +
//         'alignleft aligncenter alignright | bullist numlist outdent indent | ' +
//         'link image media | code',



//     // 1. Enable automatic image uploads
//     automatic_uploads: true,
    
//     // 2. Point to your new backend endpoint. This is a relative URL.
//     images_upload_url: '/api/posts/upload-image',

//     // 3. This function attaches your admin login token to the upload request for security
//     images_upload_handler: (blobInfo, progress) => new Promise((resolve, reject) => {
//         const formData = new FormData();
//         formData.append('file', blobInfo.blob(), blobInfo.filename());

//         api.post('/posts/upload-image', formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data'
//             }
//         })
//         .then(res => {
//             if (res.data && res.data.location) {
//                 resolve(res.data.location);
//             } else {
//                 reject('Invalid JSON response from server');
//             }
//         })
//         .catch(err => {
//             reject('Image upload failed: ' + (err.response?.data?.message || err.message));
//         });
//     })
// };

//     if (loading && isEditMode) return <h2>Loading Post...</h2>;

//     return (
//         <div className={styles.container}>
//              <form onSubmit={handleSubmit} encType="multipart/form-data">
//                 <div className={styles.header}>
//                     <h1>{isEditMode ? 'Edit Post' : 'Create New Post'}</h1>
//                     <button type="submit" className={styles.submitBtn} disabled={loading}>
//                         {loading ? 'Saving...' : 'Publish Post'}
//                     </button>
//                 </div>
                
//                 <fieldset className={styles.fieldset}>
//                     <legend>Post Details</legend>
//                     <div className={styles.inputGroup}>
//                         <label>Post Title</label>
//                         <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a catchy title" required />
//                     </div>
//                     <div className={styles.inputGroup}>
//                         <label>Category</label>
//                         <select value={category} onChange={(e) => setCategory(e.target.value)}>
//                             <option value="Blog">Blog Post</option>
//                             <option value="News">News</option>
//                             <option value="Notification">Exam Notification</option>
//                         </select>
//                     </div>
//                 </fieldset>

//                 <fieldset className={styles.fieldset}>
//                     <legend>Content</legend>
//                     <Editor
//                         apiKey={tinymceApiKey}
//                         value={formData.content}
//                         init={editorConfig}
//                         onEditorChange={(newContent) => setFormData(prev => ({...prev, content: newContent}))}
//                     />
//                 </fieldset>
//                  <fieldset className={styles.fieldset}>
//                     <legend>Media & SEO</legend>
//                     <div className={styles.inputGroup}>
//                         <label>Featured Image</label>
//                         <input type="file" name="featuredImage" onChange={handleFileChange} accept="image/*" />
//                     </div>
//                     <div className={styles.inputGroup}>
//                         <label>Meta Description (for SEO)</label>
//                         <textarea name="metaDescription" value={formData.metaDescription} onChange={handleInputChange} rows="3" placeholder="A short, catchy description for Google (max 160 characters)"></textarea>
//                     </div>
//                     <div className={styles.inputGroup}>
//                         <label>Keywords (for SEO, comma-separated)</label>
//                         <input type="text" name="keywords" value={formData.keywords} onChange={handleInputChange} placeholder="e.g., nimcet 2025, cuet pg tips" />
//                     </div>
//                 </fieldset>
//             </form>
//         </div>
//     );
// };

// export default AddPostPage;
// src/pages/AddPostPage.jsx - FINAL CORRECTED VERSION

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { Editor } from '@tinymce/tinymce-react';
import styles from './AddQuestionPage.module.css';

const AddPostPage = () => {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();

    // Use a single state object for the entire form
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'Blog',
        metaDescription: '',
        keywords: '',
        videoURL: ''
    });
    const [featuredImageFile, setFeaturedImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const tinymceApiKey = import.meta.env.VITE_TINYMCE_API_KEY;

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            api.get(`/posts/id/${id}`)
                .then(res => {
                    // Populate the form data from the fetched post
                    setFormData({
                        title: res.data.title || '',
                        content: res.data.content || '',
                        category: res.data.category || 'Blog',
                        metaDescription: res.data.metaDescription || '',
                        keywords: (res.data.keywords || []).join(', ')
                    });
                })
                .catch(() => toast.error("Failed to load post data."))
                .finally(() => setLoading(false));
        }
    }, [id, isEditMode]);

    // Single handler for text inputs and select dropdowns
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler for the rich text editor
    const handleEditorChange = (content) => {
        setFormData(prev => ({ ...prev, content }));
    };
    const handleFileChange = (e) => {
    // We only care about the first file if the user selects multiple
    if (e.target.files[0]) {
        setFeaturedImageFile(e.target.files[0]);
    }
};

   const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const submissionData = new FormData();
        submissionData.append('title', formData.title);
        submissionData.append('content', formData.content);
        submissionData.append('category', formData.category);
        submissionData.append('metaDescription', formData.metaDescription);
        submissionData.append('keywords', formData.keywords);
        submissionData.append('videoURL', formData.videoURL); 

        if (featuredImageFile) {
            submissionData.append('featuredImage', featuredImageFile);
        }
        
        try {
            if (isEditMode) {
                await api.put(`/posts/${id}`, submissionData);
                toast.success('Post updated successfully!');
            } else {
                await api.post('/posts', submissionData);
                toast.success('Post created successfully!');
            }
            navigate('/admin/posts');
        } catch (error) {
            toast.error('Failed to save post.');
        } finally {
            setLoading(false);
        }
    };
    
    const editorConfig = {
    height: 500,
    menubar: true,
    plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', // This enables video and social media embeds
        'table', 'help', 'wordcount'
    ],
    toolbar: 
        'undo redo | styles | bold italic underline | ' +
        'alignleft aligncenter alignright | bullist numlist outdent indent | ' +
        'link image media | code', // Added 'media' to the toolbar

    

    // 1. Enable automatic image uploads when pasting or dropping
    automatic_uploads: true,
    
    // 2. Point to your new backend endpoint. This is a relative URL.
    images_upload_url: '/api/posts/upload-image',

    // 3. This function attaches your admin login token to the upload request for security
    images_upload_handler: (blobInfo, progress) => new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());

        api.post('/posts/upload-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(res => {
            if (res.data && res.data.location) {
                resolve(res.data.location);
            } else {
                reject('Invalid JSON response from server');
            }
        })
        .catch(err => {
            reject('Image upload failed: ' + (err.response?.data?.message || err.message));
        });
    })
};

    if (loading && isEditMode) return <h2>Loading Post...</h2>;

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit}>
                <div className={styles.header}>
                    <h1>{isEditMode ? 'Edit Post' : 'Create New Post'}</h1>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Saving...' : (isEditMode ? 'Update Post' : 'Publish Post')}
                    </button>
                </div>
                
                <fieldset className={styles.fieldset}>
                    <legend>Post Details</legend>
                    <div className={styles.inputGroup}>
                        <label>Post Title</label>
                        {/* Corrected: Use formData.title */}
                        <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter a catchy title" required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Category</label>
                        {/* Corrected: Use formData.category */}
                        <select name="category" value={formData.category} onChange={handleInputChange}>
                            <option value="Blog">Blog Post</option>
                            <option value="News">News</option>
                            <option value="Notification">Exam Notification</option>
                            <option value="Strategy">Strategy Guide</option>
                        </select>
                    </div>
                </fieldset>

               <fieldset className={styles.fieldset}>
                    <legend>Content</legend>
                    <Editor
                        apiKey={tinymceApiKey}
                        value={formData.content}
                        init={editorConfig}
                        onEditorChange={(newContent) => setFormData(prev => ({...prev, content: newContent}))}
                    />
                </fieldset>
                
                <fieldset className={styles.fieldset}>
                    <legend>Media & SEO</legend>
                    <div className={styles.inputGroup}>
                        <label>Featured Image</label>
                        <input type="file" name="featuredImage" onChange={handleFileChange} accept="image/*" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>YouTube/Instagram Video URL (Optional)</label>
                        <input type="text" name="videoURL" value={formData.videoURL} onChange={handleInputChange} placeholder="Paste video link here" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Meta Description (for SEO)</label>
                        <textarea name="metaDescription" value={formData.metaDescription} onChange={handleInputChange} rows="3" placeholder="A short, catchy description for Google (max 160 characters)"></textarea>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Keywords (for SEO, comma-separated)</label>
                        <input type="text" name="keywords" value={formData.keywords} onChange={handleInputChange} placeholder="e.g., nimcet 2025, cuet pg tips" />
                    </div>
                </fieldset>
            </form>
        </div>
    );
};

export default AddPostPage;