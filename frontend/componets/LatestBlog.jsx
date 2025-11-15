import React, { useState, useEffect, useContext } from 'react'
import Title from './Title'
import { useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const LatestBlog = () => {
  const navigate = useNavigate()
  const { backendUrl } = useContext(ShopContext)
  const [blogPosts, setBlogPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const slideHeight = 560

  useEffect(() => {
    fetchLatestBlogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // backendUrl is stable, no need to include

  // Auto-scroll effect - scroll up every 5 seconds
  useEffect(() => {
    if (blogPosts.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        return (prev + 1) % blogPosts.length
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [blogPosts.length])

  const fetchLatestBlogs = async () => {
    try {
      setLoading(true)
      const baseUrl = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
      const response = await fetch(`${baseUrl}/api/blogs/all?page=1&limit=10`, {
        credentials: 'include' // Include cookies
      })
      const data = await response.json()
      
      if (data.success && data.blogs && data.blogs.length > 0) {
        const latestBlogs = data.blogs.slice(0, 3)
        setBlogPosts(latestBlogs)
      } else {
        console.error('No blogs found or invalid response')
        setBlogPosts([])
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
      setBlogPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`)
  }

  const handleViewAllBlogs = () => {
    navigate('/blogs')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryLabel = (category) => {
    const labels = {
      'baby-nursing': 'Baby Nursing',
      'baby-feeding': 'Baby Feeding',
      'baby-products': 'Baby Products',
      'baby-care': 'Baby Care',
      'product-guide': 'Product Guide',
      'wholesale': 'Wholesale',
      'safety': 'Safety',
      'sustainability': 'Sustainability',
      'feeding': 'Feeding'
    }
    return labels[category] || category
  }

  if (loading) {
    return (
      <div className='my-16 relative'>
        <div className="absolute inset-0 cartoon-bg rounded-3xl opacity-80"></div>
        <div className='relative z-10'>
          <div className='text-center py-8'>
            <div className='flex items-center justify-center mb-4'>
              <span className='text-3xl mr-4'>📝</span>
              <Title text1="LATEST" text2="BLOG"/>
              <span className='text-3xl ml-4'>📚</span>
            </div>
            <div className='flex justify-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='my-16 relative'>
      {/* Background decoration */}
      <div className="absolute inset-0 cartoon-bg rounded-3xl opacity-80"></div>
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-300/40 rounded-full gentle-float"></div>
      <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-cyan-300/40 rounded-full gentle-bounce"></div>
      
      <div className='relative z-10'>
        <div className='text-center py-8'>
          <div className='flex items-center justify-center mb-4'>
            <span className='text-3xl mr-4 gentle-bounce'>📝</span>
            <Title text1="LATEST" text2="BLOG"/>
            <span className='text-3xl ml-4 gentle-float'>📚</span>
          </div>
          <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600 mt-4'>
            Expert insights, tips, and guides for baby care professionals and parents. Stay updated with the latest in baby product trends and care practices.
          </p>
        </div>
        
        {/* Blog layout */}
        {blogPosts.length === 0 ? (
          <div className='text-center py-12'>
            <h3 className='text-xl font-semibold text-gray-600 mb-2'>No blogs available</h3>
            <p className='text-gray-500'>Check back soon for new content!</p>
          </div>
        ) : (
          <>
            {/* Mobile horizontal cards */}
            <div className='md:hidden -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4'>
              {blogPosts.map((post) => (
                <article
                  key={post._id}
                  className='snap-center min-w-[80vw] max-w-sm rounded-3xl bg-white/90 p-5 shadow-xl ring-1 ring-blue-100'
                  onClick={() => handleBlogClick(post._id)}
                >
                  <div className='h-44 w-full overflow-hidden rounded-2xl shadow-md'>
                    <img
                      src={post.image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop&crop=center'}
                      alt={post.title}
                      className='h-full w-full object-cover'
                    />
                  </div>
                  <div className='mt-4 space-y-3'>
                    <div className='flex items-center justify-between gap-2'>
                      <span className='rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600'>
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className='text-xs font-medium text-gray-500'>
                        {post.readTime || 5} min read
                      </span>
                    </div>
                    <h3 className='text-lg font-bold text-slate-800 line-clamp-2'>{post.title}</h3>
                    <p className='text-sm text-gray-600 line-clamp-3 leading-relaxed'>{post.excerpt}</p>
                    <div className='flex items-center justify-between text-sm text-blue-600 font-semibold'>
                      <span className='text-gray-500 font-medium'>{formatDate(post.createdAt)}</span>
                      <span className='flex items-center gap-1'>
                        Read More
                        <span className='text-lg'>→</span>
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Desktop vertical carousel */}
            <div className='hidden md:flex w-full flex-col items-center'>
              <div className='relative overflow-hidden max-w-6xl w-full h-[560px] lg:h-[620px]'>
              <div 
                className='transition-transform duration-700 ease-in-out'
                style={{ 
                    transform: `translateY(-${currentIndex * slideHeight}px)`,
                    height: `${blogPosts.length * slideHeight}px`
                }}
              >
                  {blogPosts.map((post) => (
                  <div 
                    key={post._id}
                      className='flex items-center justify-center px-10'
                      style={{ height: `${slideHeight}px` }}
                  >
                    <div 
                        className='cartoon-card w-full max-w-5xl cursor-pointer px-10 py-8 lg:px-12 lg:py-10 hover:scale-[1.01] transition-all duration-300'
                      onClick={() => handleBlogClick(post._id)}
                    >
                      <div className='flex flex-col lg:flex-row gap-8 items-center justify-center'>
                          <div className='w-full lg:w-1/2 h-72 rounded-2xl overflow-hidden shadow-lg'>
                          <img 
                            src={post.image || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop&crop=center"} 
                            alt={post.title} 
                              className='w-full h-full object-cover hover:scale-105 transition-transform duration-300' 
                          />
                        </div>
                        
                          <div className='flex-1 text-center lg:text-left max-w-xl space-y-4'>
                            <div className='flex items-center justify-center lg:justify-start gap-4 flex-wrap'>
                            <span className='text-sm bg-blue-100 text-blue-600 px-4 py-2 rounded-full font-bold'>
                              {getCategoryLabel(post.category)}
                            </span>
                            <span className='text-sm text-gray-500 font-medium'>
                              {post.readTime || 5} min read
                            </span>
                          </div>
                            <h3 className='font-bold text-2xl lg:text-3xl text-gray-800 leading-tight'>{post.title}</h3>
                            <p className='text-base lg:text-lg text-gray-600 leading-relaxed'>{post.excerpt}</p>
                          <div className='flex items-center justify-center lg:justify-start gap-3 text-sm flex-wrap'>
                            <span className='text-gray-500 font-medium'>{formatDate(post.createdAt)}</span>
                            <span className='text-blue-500 text-xl'>→</span>
                            <span className='text-blue-600 font-bold hover:text-blue-700 transition-colors'>Read More</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='flex justify-center gap-2 mt-6'>
              {blogPosts.map((_, index) => (
                <button
                  key={index}
                    onClick={() => setCurrentIndex(index)}
                  className={`transition-all duration-300 ${
                    index === currentIndex 
                      ? 'w-8 h-3 bg-blue-500' 
                      : 'w-3 h-3 bg-gray-300 hover:bg-blue-300'
                  } rounded-full`}
                />
              ))}
            </div>
          </div>
          </>
        )}
        
        {/* Call to action */}
        <div className='text-center mt-8'>
          <button 
            className='cartoon-btn px-8 py-3 text-white font-bold text-lg'
            onClick={handleViewAllBlogs}
          >
            View All Blog Posts 📖
          </button>
          <p className='text-gray-600 mt-4 text-sm'>
            <span className='text-blue-500 font-semibold'>🌟 New posts every week!</span> Stay updated with expert baby care advice
          </p>
        </div>
      </div>
    </div>
  )
}

export default LatestBlog 