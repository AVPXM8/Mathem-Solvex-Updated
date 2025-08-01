import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { Editor } from '@tinymce/tinymce-react';
import { Save, Image as ImageIcon, Trash2 } from 'lucide-react';
import styles from './AddPostPage.module.css';

const AddPostPage = () => {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();
    const editorRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'Blog',
        metaDescription: '',
        keywords: '',
        featuredImage: '',
        videoURL: ''
    });

    const [featuredImageFile, setFeaturedImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const tinymceApiKey = import.meta.env.VITE_TINYMCE_API_KEY;

    // Fetch post data in edit mode
    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            api.get(`/posts/id/${id}`)
                .then(res => {
                    const post = res.data;
                    setFormData({
                        title: post.title || '',
                        content: post.content || '',
                        category: post.category || 'Blog',
                        metaDescription: post.metaDescription || '',
                        keywords: (post.keywords || []).join(', '),
                        featuredImage: post.featuredImage || '',
                        videoURL: post.videoURL || ''
                    });
                    if (post.featuredImage) {
                        setImagePreview(post.featuredImage);
                    }
                })
                .catch(() => toast.error("Failed to load post data."))
                .finally(() => setLoading(false));
        }
    }, [id, isEditMode]);

    

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFeaturedImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    const removeImage = () => {
        setFeaturedImageFile(null);
        setImagePreview('');
        setFormData(prev => ({ ...prev, featuredImage: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const submissionData = new FormData();
        Object.keys(formData).forEach(key => {
            submissionData.append(key, formData[key]);
        });
        
        if (featuredImageFile) {
            submissionData.append('featuredImage', featuredImageFile);
        }
        
        try {
            const response = isEditMode
                ? await api.put(`/posts/${id}`, submissionData)
                : await api.post('/posts', submissionData);

            toast.success(`Post ${isEditMode ? 'updated' : 'created'} successfully!`);
            navigate('/admin/posts');
        } catch (error) {
            toast.error('Failed to save post.');
        } finally {
            setLoading(false);
        }
    };
   const editorConfig = {
        height: 500,
        menubar: false, // This removes the "File, Edit, Format" menu for a cleaner look
        plugins: [
            'autolink', 'lists', 'link', 'image', 'media', 
            'code', // 1. The 'code' plugin MUST be in this list
            'fullscreen', 'wordcount', 'table'
        ],
        toolbar: 
            'undo redo | blocks | bold italic underline | ' +
            'bullist numlist | alignleft aligncenter alignright | ' +
            'link image media | ' +
            'code fullscreen', // 2. The 'code' button MUST be in the toolbar string

        extended_valid_elements: 'h1[class|style],h2[class|style],h3[class|style],h4[class|style],p[class|style],strong,em,u,ul,li,ol,a[href|target|rel],img[src|alt|width|height|style],blockquote,code',
        paste_block_drop: true,
        paste_merge_formats: true,
        
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
        
        automatic_uploads: true,
        images_upload_url: '/api/posts/upload-image',
        images_upload_handler: (blobInfo, progress) => new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', blobInfo.blob(), blobInfo.filename());
            api.post('/posts/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
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
    
   return (
        <form className={styles.container} onSubmit={handleSubmit}>
            <header className={styles.header}>
                <h1>{isEditMode ? 'Edit Post' : 'Create New Post'}</h1>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                    <Save size={18} />
                    {loading ? 'Saving...' : (isEditMode ? 'Update Post' : 'Publish Post')}
                </button>
            </header>

            <div className={styles.editorLayout}>
                <div className={styles.mainContent}>
                    <fieldset className={styles.card}>
                        <legend className={styles.cardTitle}>Main Content</legend>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Post Title"
                            className={styles.titleInput}
                            required
                        />
                    </fieldset>
                    <fieldset className={styles.card}>
                         <legend className={styles.cardTitle}>Body Content</legend>
                        <Editor
                            apiKey={tinymceApiKey}
                            onInit={(evt, editor) => editorRef.current = editor}
                            value={formData.content}
                            init={editorConfig}
                            onEditorChange={(newContent) => setFormData(prev => ({ ...prev, content: newContent }))}
                        />
                    </fieldset>
                </div>

                
                <aside className={styles.sidebar}>
                    <fieldset className={styles.card}>
                        <legend className={styles.cardTitle}>Publish</legend>
                        <div className={styles.inputGroup}>
                            <label>Category</label>
                            <select name="category" value={formData.category} onChange={handleInputChange} className={styles.selectInput}>
                                <option value="Blog">Blog Post</option>
                                <option value="News">News</option>
                                <option value="Notification">Exam Notification</option>
                                <option value="Strategy">Strategy Guide</option>
                            </select>
                        </div>
                        <button type="submit" className={styles.submitBtnFull} disabled={loading}>
                            <Save size={18} />
                            {loading ? 'Saving...' : (isEditMode ? 'Update' : 'Publish')}
                        </button>
                    </fieldset>

                    <fieldset className={styles.card}>
                        <legend className={styles.cardTitle}>Media</legend>
                        <div className={styles.inputGroup}>
                             <label>Featured Image</label>
                            <div className={styles.imageUploader}>
                                {imagePreview ? (
                                    <div className={styles.imagePreview}>
                                        <img src={imagePreview} alt="Featured preview" />
                                        <button type="button" onClick={removeImage} className={styles.removeImageBtn}><Trash2 size={16}/></button>
                                    </div>
                                ) : (
                                    <label htmlFor="file-upload" className={styles.uploadLabel}>
                                        <ImageIcon size={48} />
                                        <span>Click to upload image</span>
                                    </label>
                                )}
                                <input id="file-upload" type="file" onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>YouTube/Instagram Video URL (Optional)</label>
                            <input type="text" name="videoURL" value={formData.videoURL} onChange={handleInputChange} placeholder="Paste video link here" />
                        </div>
                    </fieldset>

                    <fieldset className={styles.card}>
                        <legend className={styles.cardTitle}>SEO Settings</legend>
                        <div className={styles.inputGroup}>
                            <label>Meta Description</label>
                            <textarea name="metaDescription" value={formData.metaDescription} onChange={handleInputChange} rows="4" placeholder="Short description for Google (160 chars)"></textarea>
                            <span className={styles.charCount}>{formData.metaDescription.length} / 160</span>
                        </div>
                         <div className={styles.inputGroup}>
                            <label>Keywords (comma-separated)</label>
                            <input type="text" name="keywords" value={formData.keywords} onChange={handleInputChange} placeholder="nimcet 2025, cuet pg" />
                        </div>
                    </fieldset>
                </aside>
            </div>
        </form>
    );
};

export default AddPostPage;