import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import styles from './PostListPage.module.css';
import { PlusCircle, Edit, Trash2, ArrowUpDown, Search } from 'lucide-react';
const ITEMS_PER_PAGE = 10;

const PostListPage = () => {
    const [allPosts, setAllPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State for client-side filtering and pagination
    const [filters, setFilters] = useState({ category: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    // 1. Fetch ALL posts once, just like your original code
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.get('/posts');
                setAllPosts(response.data || []);
            } catch (error) {
                toast.error("Failed to fetch posts.");
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this post?')) {
            try {
                await api.delete(`/posts/${id}`);
                setAllPosts(prevPosts => prevPosts.filter(post => post._id !== id));
                toast.success('Post deleted successfully!');
            } catch (error) {
                toast.error('Failed to delete post.');
            }
        }
    };

    // 2. Filter, search, and sort the posts here in the browser
    const filteredAndSortedPosts = useMemo(() => {
        let sortedPosts = [...allPosts];

        // Filtering
        sortedPosts = sortedPosts.filter(post => {
            const searchMatch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = filters.category ? post.category === filters.category : true;
            return searchMatch && categoryMatch;
        });

        // Sorting
        if (sortConfig.key) {
            sortedPosts.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        
        return sortedPosts;
    }, [allPosts, searchTerm, filters, sortConfig]);

    const totalPages = Math.ceil(filteredAndSortedPosts.length / ITEMS_PER_PAGE);

    // 3. Paginate the final list
    const paginatedPosts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAndSortedPosts, currentPage]);

    const handleSort = (key) => {
        const direction = (sortConfig.key === key && sortConfig.direction === 'asc') ? 'desc' : 'asc';
        setCurrentPage(1);
        setSortConfig({ key, direction });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Content Management</h1>
                <Link to="/admin/posts/add" className={styles.addBtn}>
                    <PlusCircle size={20} />
                    Add New Post
                </Link>
            </header>
            
            <div className={styles.card}>
                <div className={styles.filterControls}>
                    <div className={styles.searchInputContainer}>
    <Search className={styles.searchIcon} size={20} />
    <input
        type="text"
        value={searchTerm}
        placeholder="Search by title..."
        className={styles.searchInput}
        onChange={(e) => { setCurrentPage(1); setSearchTerm(e.target.value); }}
    />
</div>

                    <select name="category" value={filters.category} onChange={(e) => { setCurrentPage(1); setFilters({ category: e.target.value }); }} className={styles.filterDropdown}>
                        <option value="">All Categories</option>
                        <option value="Blog">Blog Post</option>
                        <option value="News">News</option>
                        <option value="Notification">Exam Notification</option>
                        <option value="Strategy">Strategy Guide</option>
                    </select>
                </div>

                <div className={styles.tableWrapper}>
                    <p className={styles.countInfo}>Showing {paginatedPosts.length} of {filteredAndSortedPosts.length} posts.</p>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('title')} className={styles.sortable}>Title <ArrowUpDown size={14} /></th>
                                <th onClick={() => handleSort('category')} className={styles.sortable}>Category <ArrowUpDown size={14} /></th>
                                <th onClick={() => handleSort('createdAt')} className={styles.sortable}>Date Published <ArrowUpDown size={14} /></th>
                                <th className={styles.actionsHeader}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className={styles.loader}>Loading...</td></tr>
                            ) : paginatedPosts.length > 0 ? (
                                paginatedPosts.map(post => (
                                    <tr key={post._id}>
                                        <td className={styles.titleCell}>{post.title}</td>
                                        <td><span className={styles.categoryBadge}>{post.category}</span></td>
                                        <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                                        <td className={styles.actionsCell}>
                                            <Link to={`/admin/posts/edit/${post._id}`} className={`${styles.actionBtn} ${styles.editBtn}`} title="Edit"><Edit size={18} /></Link>
                                            <button onClick={() => handleDelete(post._id)} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className={styles.noResults}>No posts found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={styles.pagination}>
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
                    <span>Page {currentPage} of {totalPages || 1}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>Next</button>
                </div>
            </div>
        </div>
    );
};

export default PostListPage;