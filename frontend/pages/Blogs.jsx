import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { getBlogPath } from '../src/utils/blogPath';
import { localizeBlog, useShopLocale } from '../src/i18n/localized';
import { dateLocaleFor } from '../src/i18n/locales';
import { useTranslation } from 'react-i18next';
import { LocaleLink } from '../componets/LocaleLink';

const Blogs = () => {
  const { api } = useContext(ShopContext);
  const { t } = useTranslation();
  const locale = useShopLocale();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchBlogs = async () => {
      try {
        if (!blogs.length) setLoading(true);
        const params = searchTerm
          ? { search: searchTerm, page: 1, limit: 12 }
          : { page: 1, limit: 12 };
        const response = await api.blogsAll(params);
        if (cancelled) return;
        if (response.data.success) {
          setBlogs(response.data.blogs);
        }
      } catch (error) {
        if (!cancelled) console.error('Error fetching blogs:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchBlogs();
    return () => { cancelled = true };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, api]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(dateLocaleFor(locale), {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="page-shell bg-white">
      <div className="section-container py-10 md:py-14">
        <div className="text-center mb-12">
          <h1 className="corp-section-title">{t('blogs.title')}</h1>
          <p className="corp-section-subtitle mx-auto">
            {t('blogs.subtitle')}
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t('blogs.searchPlaceholder')}
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
                {t('blogs.search')}
              </button>
            </div>
          </form>
          
          {/* Search Results Info */}
          {searchTerm && (
            <div className="mt-4 text-sm text-gray-600">
              {blogs.length > 0 ? (
                <p>
                  {t('blogs.found', { count: blogs.length, term: searchTerm })}
                </p>
              ) : (
                <p>
                  {t('blogs.noneFor', { term: searchTerm })}
                </p>
              )}
            </div>
          )}
        </div>

        {loading && blogs.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-video bg-slate-100 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                  <div className="h-5 w-full bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-4/5 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📭</span>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? t('blogs.noMatch') : t('blogs.empty')}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? t('blogs.tryKeywords') : t('blogs.checkLater')}
            </p>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="cartoon-btn px-6 py-2 text-white font-semibold text-sm"
              >
                {t('blogs.clear')}
              </button>
            )}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => {
              const display = localizeBlog(blog, locale)
              return (
              <article key={blog._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {blog.image && (
                  <LocaleLink to={getBlogPath(blog)} className="block aspect-video overflow-hidden">
                    <img
                      src={blog.image}
                      alt={display.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </LocaleLink>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {blog.category}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    <LocaleLink to={getBlogPath(blog)} className="hover:text-blue-600">
                      {display.title}
                    </LocaleLink>
                  </h2>
                  <p className="text-gray-600 mb-3 text-sm line-clamp-3">
                    {display.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">{t('blogs.by', { author: blog.author })}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        {formatDate(blog.createdAt)}
                      </span>
                    </div>
                    <LocaleLink
                      to={getBlogPath(blog)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      {t('blogs.readMore')} →
                    </LocaleLink>
                  </div>
                </div>
              </article>
            )})}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Blogs; 