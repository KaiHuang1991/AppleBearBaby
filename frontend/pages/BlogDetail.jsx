import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import '../styles/ProductDescription.css';
import BlogShare from '../componets/BlogShare';
import Seo from '../componets/Seo';
import { SITE } from '../src/seo/config';
import { toAbsoluteUrl } from '../src/seo/utils';
import NotFound from './NotFound';
import { getBlogPath, isMongoObjectId } from '../src/utils/blogPath';
import { getProductPath } from '../src/utils/productPath';

const BlogDetail = () => {
  const { blogKey, id } = useParams();
  const articleKey = blogKey || id;
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  
  const { getBlogComments, addBlogComment, updateBlogComment, deleteBlogComment, token, user, api } = useContext(ShopContext);

  useEffect(() => {
    fetchBlog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleKey]); // backendUrl is stable, no need to include

  useEffect(() => {
    if (blog) {
      fetchComments();
    }
  }, [blog]);

  const fetchComments = async () => {
    if (!blog?._id) return;
    const commentsData = await getBlogComments(blog._id);
    setComments(commentsData);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please login to add a comment');
      return;
    }
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    setCommentLoading(true);
    const userName = user?.name || 'Anonymous';
    const result = await addBlogComment(blog._id, newComment.trim(), userName);
    if (result) {
      setNewComment('');
      fetchComments();
    }
    setCommentLoading(false);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim()) {
      alert('Please enter a comment');
      return;
    }

    const result = await updateBlogComment(commentId, editContent.trim());
    if (result) {
      setEditingComment(null);
      setEditContent('');
      fetchComments();
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      const result = await deleteBlogComment(commentId);
      if (result) {
        fetchComments();
      }
    }
  };

  const fetchBlog = async () => {
    try {
      const response = await api.blogsGetById(articleKey);
      const data = response.data;
      
      if (data.success) {
        setBlog(data.blog);
        if (data.blog.slug && isMongoObjectId(articleKey) && articleKey !== data.blog.slug) {
          navigate(getBlogPath(data.blog), { replace: true });
        }
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const computedExcerpt = useMemo(() => {
    if (!blog || !blog.content) return ''
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = blog.content
    const text = tempDiv.textContent || tempDiv.innerText || ''
    return text.replace(/\s+/g, ' ').trim().slice(0, 180)
  }, [blog])

  const blogJsonLd = useMemo(() => {
    if (!blog) return null
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: blog.title,
      description: computedExcerpt || blog.excerpt || '',
      image: blog.image ? [blog.image] : undefined,
      datePublished: blog.createdAt,
      dateModified: blog.updatedAt || blog.createdAt,
      author: { '@type': 'Organization', name: SITE.brand },
      publisher: {
        '@type': 'Organization',
        name: SITE.name,
        logo: origin ? { '@type': 'ImageObject', url: `${origin}${SITE.defaultImage}` } : undefined,
      },
      mainEntityOfPage: origin ? `${origin}${getBlogPath(blog)}` : undefined,
    }
  }, [blog, computedExcerpt])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 cartoon-bg"></div>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 relative z-10"></div>
      </div>
    );
  }

  if (!blog) {
    return <NotFound />
  }

  return (
    <div className="min-h-screen py-8 relative">
      <div className="absolute inset-0 cartoon-bg"></div>
      <div className="absolute inset-0 cartoon-hearts opacity-10"></div>
      <Seo
        title={blog.title}
        description={computedExcerpt || blog.excerpt}
        image={blog.image}
        keywords={Array.isArray(blog.tags) ? blog.tags.join(', ') : undefined}
        canonical={toAbsoluteUrl(getBlogPath(blog))}
      />
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 right-10 w-12 h-12 bg-blue-300/40 rounded-full gentle-float"></div>
      <div className="absolute bottom-40 left-20 w-8 h-8 bg-cyan-300/40 rounded-full gentle-bounce"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/blogs" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
            ← Back to Blogs
          </Link>
        </div>

        {/* Blog Content */}
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {blog.image && (
            <div className="aspect-video overflow-hidden">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {blog.category}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent prata-regular mb-4">
              {blog.title}
            </h1>

            <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
              <span>By {blog.author}</span>
              <span>•</span>
              <span>{formatDate(blog.createdAt)}</span>
            </div>

            <div 
              className="prose prose-lg max-w-none product-description-detail"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
            <BlogShare blog={{ ...blog, excerpt: computedExcerpt || blog.excerpt }} />
          </div>
        </article>

        {Array.isArray(blog.productIds) && blog.productIds.some((item) => item && typeof item === 'object') ? (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              Related products
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {blog.productIds
                .filter((item) => item && typeof item === 'object')
                .map((product) => (
                  <Link
                    key={product._id}
                    to={getProductPath(product)}
                    className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    {product.image?.[0] ? (
                      <img
                        src={product.image[0]}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      {product.modelNumber ? (
                        <p className="text-sm text-gray-500">Model {product.modelNumber}</p>
                      ) : null}
                      <span className="text-sm text-blue-600">View product →</span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        ) : null}

        {/* Comments Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">💬</span>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Comments ({comments.length})
            </h3>
          </div>
          
          {/* Add Comment Form */}
          {token ? (
            <form onSubmit={handleAddComment} className="mb-8">
              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Add a comment
                </label>
                <textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows="4"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={commentLoading}
                className="cartoon-btn px-6 py-3 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commentLoading ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-600">
                Please <Link to="/login" className="text-blue-600 hover:text-blue-700">login</Link> to add a comment.
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  {editingComment === comment._id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        rows="3"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateComment(comment._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingComment(null);
                            setEditContent('');
                          }}
                          className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{comment.userName}</span>
                          <span className="text-sm text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                          {comment.isEdited && (
                            <span className="text-xs text-gray-400">(edited)</span>
                          )}
                        </div>
                        {token && (comment.userId === user?._id || comment.userId?._id === user?._id) && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingComment(comment._id);
                                setEditContent(comment.content);
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail; 