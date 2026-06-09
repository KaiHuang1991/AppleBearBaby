import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const Blogs = () => {
  const { api } = useContext(ShopContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]); // backendUrl is stable, no need to include

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = searchTerm
        ? { search: searchTerm }
        : {};
      const response = await api.blogsAll(params);
      
      if (response.data.success) {
        setBlogs(response.data.blogs);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="page-shell bg-white">
      <div className="section-container py-10 md:py-14">
        <div className="text-center mb-12">
          <h1 className="corp-section-title">Baby Care Blog</h1>
          <p className="corp-section-subtitle mx-auto">
            Expert advice on baby nursing, feeding, and essential products.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search blogs by title or content..."
                  className="w-full px-5 py-3 pl-12 pr-12 border-2 border-blue-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 shadow-sm"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 text-xl">
                  🔍
                </span>
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="cartoon-btn px-8 py-3 text-white font-semibold rounded-full hover:scale-105 transition-transform"
              >
                Search
              </button>
            </div>
          </form>
          
          {/* Search Results Info */}
          {searchTerm && (
            <div className="mt-4 text-sm text-gray-600">
              {blogs.length > 0 ? (
                <p>
                  Found <span className="font-semibold text-blue-600">{blogs.length}</span> result{blogs.length !== 1 ? 's' : ''} for "<span className="font-semibold">{searchTerm}</span>"
                </p>
              ) : (
                <p>
                  No results found for "<span className="font-semibold">{searchTerm}</span>". Try different keywords.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Blog Grid */}
        {blogs.length === 0 && !loading ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📭</span>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? 'No matching blogs found' : 'No blogs available'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try searching with different keywords' : 'Check back later for new content.'}
            </p>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="cartoon-btn px-6 py-2 text-white font-semibold text-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <article key={blog._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {blog.image && (
                  <Link to={`/blog/${blog._id}`} className="block aspect-video overflow-hidden">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {blog.category}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {blog.title}
                  </h2>
                  <p className="text-gray-600 mb-3 text-sm line-clamp-3">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">By {blog.author}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        {formatDate(blog.createdAt)}
                      </span>
                    </div>
                    <Link
                      to={`/blog/${blog._id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Blogs; 