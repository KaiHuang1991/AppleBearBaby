import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import RelatedProducts from '../componets/RelatedProducts'
import SocialShare from '../componets/SocialShare'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../src/assets/assets.js'
import { toast } from 'react-toastify'
import axios from 'axios'
import { flyToCart } from '../src/utils/flyToCart'
import '../styles/ProductDescription.css'


const Product = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { products, currency, addToCart, submitComment, getProductCategoryPath, token, backendUrl } = useContext(ShopContext)
  const [productData, setProductData] = useState(false)
  const [image, setImage] = useState('')
  const [size, setSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [tabs, setTabs] = useState('description')
  const enlargedImageRef = useRef(null); // 使用 useRef 跟踪放大图片

  const [rating, setRating] = useState(5); // 默认评分 5 星
  const [comment, setComment] = useState(""); // 评论内容
  const [media, setMedia] = useState(false); // 上传的图片文件
  const [error, setError] = useState(""); // 错误提示
  const [message, setMessage] = useState(""); // 成功提示
  const [reviews, setReviews] = useState([])
  const [userNames, setUserName] = useState([])
  const [averageRating, setAverageRating] = useState(5)
  const [loadingComments, setLoadingComments] = useState(true)

  const userId = localStorage.getItem("userId")

  const formatDateTime = (dateString) => {
    const date = new Date(dateString || Date.now())
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-')
  }

  const handleImageClick = (e) => {
    const clickedImage = e.target;
    // 如果点击的图片已经是放大状态，缩小它
    if (enlargedImageRef.current === clickedImage) {
      clickedImage.classList.remove('scale-500', 'z-10', 'origin-top-left','mr-80','mb-80');
      enlargedImageRef.current = null;
    } else {
      // 缩小之前放大的图片（如果存在）
      if (enlargedImageRef.current) {
        enlargedImageRef.current.classList.remove('scale-500', 'z-10', 'origin-top-left','mr-80','mb-80');
      }
      // 放大点击的图片
      clickedImage.classList.add('scale-500', 'z-10', 'origin-top-left','mr-80','mb-80');
      enlargedImageRef.current = clickedImage;
    }
  };

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item)
        //console.log(productData)
        setImage(item.image[0]) //get the first image of current product page
        return null
      }
    })
  }

  const categoryPath = getProductCategoryPath(productData)

  const handleBreadcrumbNavigation = (levelIndex) => {
    if (!categoryPath || !categoryPath[levelIndex]?.id) return

    const params = new URLSearchParams()
    const keys = ['categoryId', 'subCategoryId', 'thirdCategoryId']

    categoryPath.forEach((node, idx) => {
      if (idx > levelIndex) return
      if (node?.id && keys[idx]) {
        params.set(keys[idx], node.id)
      }
    })

    const queryString = params.toString()
    navigate(queryString ? `/collection?${queryString}` : '/collection')
  }
  const fetchCommentsData = async () => {
    try {
      setLoadingComments(true)
      
      // Try to load from cache first for instant display
      const cachedReviews = localStorage.getItem(`reviews_${productId}`)
      if (cachedReviews) {
        try {
          const parsedReviews = JSON.parse(cachedReviews)
          setReviews(parsedReviews)
          if (parsedReviews.length > 0) {
            const ratingArray = parsedReviews.map(review => review.rating)
            const avgRating = ratingArray.reduce((acc, curr) => acc + curr, 0) / ratingArray.length
            setAverageRating(avgRating)
          }
        } catch (e) {
          console.error('Error parsing cached reviews:', e)
        }
      }
      
      console.log('Fetching comments for product:', productId)
      const baseUrl = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
      const response = await axios.post(`${baseUrl}/api/product/listcomment`, {
        productId
      })
      
      if (response.data.success) {
        const reviewsData = response.data.reviews
        const userNames = response.data.userInfo
        
        // reviewsData is already an array, no need to convert
        const reviewsArray = Array.isArray(reviewsData) ? reviewsData : Object.values(reviewsData)
        
        if (reviewsArray.length > 0) {
          const ratingArray = reviewsArray.map(review => review.rating)
          const averageRating = ratingArray.reduce((acc, curr) => acc + curr, 0) / ratingArray.length
          setAverageRating(averageRating)
        } else {
          setAverageRating(5) // Default rating when no reviews
        }
        
        // Data is already sorted from backend, no need to reverse
        setUserName(userNames)
        setReviews(reviewsArray)
        
        // Cache reviews in localStorage with productId as key
        localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviewsArray))
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error(error.message || 'Failed to load comments')
    } finally {
      setLoadingComments(false)
    }
  }
  const handleDeleteComment = async (reviewId) => {
    try {
      // Token is now sent via cookie, but keep header as fallback
      const headers = token ? { token } : {}
      const baseUrl = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
      const response = await axios.delete(`${baseUrl}/api/reviews/delete/${reviewId}`, {
        headers
      })
      if (response.data.success) {
        toast.success('Comment deleted successfully!')
        // Refresh comments after deletion
        fetchCommentsData()
      } else {
        toast.error(response.data.message || 'Failed to delete comment')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  const handleSetImage = (setter) => (e) => {
    const file = e.target.files
    if (file) {
      setter(file)
    }
    else {
      URL.revokeObjectURL(file)
      setter(false)
    }
  }
  useEffect(() => {
    window.scrollTo(0, 0)
    setImage('')
    setQuantity(1)
    if (products.find(item => item._id === productId)) {
      setProductData(products.find(item => item._id === productId))
      setImage(products.find(item => item._id === productId).image[0])
    }
  }, [productId, products])
  useEffect(() => {
    if (productId) {
      fetchCommentsData()
    }
  }, [productId])

  useEffect(() => {
    if (!productData) return

    const stripHtml = (html = '') =>
      (html || '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()

    const ensureAbsoluteUrl = (path = '') => {
      if (!path) return ''
      try {
        return new URL(path).toString()
      } catch (error) {
        const base = window.location.origin
        if (!path.startsWith('/')) {
          return `${base}/${path}`
        }
        return `${base}${path}`
      }
    }

    const canonical = typeof window !== 'undefined' ? window.location.href : ''
    const title = productData.name || 'Product'
    const description = stripHtml(productData.description || '').slice(0, 160)
    const image = Array.isArray(productData.image) && productData.image.length ? ensureAbsoluteUrl(productData.image[0]) : ''

    const metaDefinitions = [
      { selector: 'meta[property="og:type"]', attr: 'property', value: 'og:type', content: 'product' },
      { selector: 'meta[property="og:title"]', attr: 'property', value: 'og:title', content: title },
      { selector: 'meta[property="og:description"]', attr: 'property', value: 'og:description', content: description },
      { selector: 'meta[property="og:image"]', attr: 'property', value: 'og:image', content: image },
      { selector: 'meta[property="og:url"]', attr: 'property', value: 'og:url', content: canonical },
      { selector: 'meta[name="twitter:card"]', attr: 'name', value: 'twitter:card', content: 'summary_large_image' },
      { selector: 'meta[name="twitter:title"]', attr: 'name', value: 'twitter:title', content: title },
      { selector: 'meta[name="twitter:description"]', attr: 'name', value: 'twitter:description', content: description },
      { selector: 'meta[name="twitter:image"]', attr: 'name', value: 'twitter:image', content: image },
    ]

    const previousMeta = metaDefinitions.map(({ selector, attr, value, content }) => {
      let element = document.head.querySelector(selector)
      let created = false
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attr, value)
        document.head.appendChild(element)
        created = true
      }
      const previousContent = element.getAttribute('content')
      element.setAttribute('content', content || '')
      return { element, created, previousContent }
    })

    return () => {
      previousMeta.forEach(({ element, created, previousContent }) => {
        if (created) {
          element.remove()
        } else if (previousContent !== null) {
          element.setAttribute('content', previousContent)
        }
      })
    }
  }, [productData])

  useEffect(() => {
    if (productData?.sizes && productData.sizes.length > 0) {
      if (!size || !productData.sizes.includes(size)) {
        setSize(productData.sizes[0])
      }
    } else {
      setSize('')
    }
  }, [productData?.sizes])


  return productData ? (
    <div className=' mt-20 transition-opacity ease-in duration-500 opacity-100 cartoon-bg min-h-screen pb-20'>
      {/* Breadcrumb Navigation */}
      <div className='bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200'>
        <div className='px-4 sm:px-8 lg:px-12 py-4'>
          <div className='flex flex-wrap items-center gap-2 text-sm sm:text-base text-gray-600'>
            <button
              type='button'
              onClick={() => window.history.back()}
              className='hover:text-blue-600 transition-colors flex items-center gap-1'
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <span className='text-gray-400'>/</span>
            <button
              type='button'
              onClick={() => navigate('/collection')}
              className='hover:text-blue-600 transition-colors'
            >
              Catalog
            </button>
            {categoryPath?.map((node, index) => (
              <React.Fragment key={node?.id || node?.name || index}>
                <span className='text-gray-400'>/</span>
                {node?.id ? (
                  <button
                    type='button'
                    onClick={() => handleBreadcrumbNavigation(index)}
                    className='hover:text-blue-600 transition-colors'
                  >
                    {node?.name || 'Category'}
                  </button>
                ) : (
                  <span className='text-gray-500'>{node?.name || 'Category'}</span>
                )}
              </React.Fragment>
            ))}
            <span className='text-gray-400'>/</span>
            <span className='font-medium text-gray-800 truncate max-w-xs sm:max-w-md'>{productData.name}</span>
          </div>
        </div>
      </div>
      
      {/*Product Data*/}
      <div className='flex gap-8 sm:gap-10 lg:gap-12 flex-col sm:flex-row lg:items-start px-4 sm:px-8 lg:px-0 pt-6 sm:pt-8 w-full max-w-screen-xl mx-auto'>
        {/*Product Images*/}
        <div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-stretch lg:flex-[1] lg:min-w-0 w-full mr-65'>
          {/* Thumbnail Images */}
          <div 
            className='flex sm:flex-col overflow-x-auto sm:overflow-y-auto justify-between sm:justify-start gap-3 pb-2 sm:pb-0 sm:pr-2 w-full sm:w-28 lg:w-32 flex-shrink-0 thumbnail-column'
            style={{ scrollbarWidth: 'none' }}
          >
            {
              productData.image.map((item, itemIndex) => (
                <img 
                  onClick={() => setImage(item)} 
                  src={item} 
                  key={itemIndex} 
                  className={`w-[24%] sm:w-full aspect-square object-cover flex-shrink-0 cursor-pointer rounded-lg border-2 transition-all duration-200 shadow-sm ${
                    image === item 
                      ? 'border-blue-500 ring-2 ring-blue-200 scale-105 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300 hover:scale-105 hover:shadow-md'
                  }`}
                />
              ))
            }
          </div>
          {/* Main Product Image */}
          <div className='product-main-outer flex-1 rounded-xl shadow-lg'>
            <div className='product-main-wrapper relative rounded-lg bg-white'>
              <img 
                src={image} 
                className='product-main-img w-full h-full object-contain transition-transform duration-300 hover:scale-105' 
                alt={productData.name}
              />
            </div>
          </div>
        </div>
        {/*Product Info*/}
        <div className='product-info-panel bg-white rounded-lg shadow-sm flex flex-col lg:flex-[1.7] lg:min-w-0'>
          {/* Quick Info Tags */}
          <div className='bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 flex flex-wrap gap-2 items-center'>
            <span className='bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1'>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {averageRating.toFixed(1)} Rating
            </span>
            {productData.bestseller && (
              <span className='bg-white text-yellow-500 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-sm'>
                <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                </svg>
                Bestseller
              </span>
            )}
            <span className='bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1'>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              In Stock
            </span>
            <span className='bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1'>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              Fast Shipping
            </span>
          </div>
          
          <div className='p-4 sm:p-6'>
            <h4 className='font-medium text-xl sm:text-xl'>{productData.name}</h4>
          <div className='flex items-center gap-1 mt-2'>
            <p onClick={() => setRating(1)} className='cursor-pointer'>{rating >= 1 ? <img src={assets.star_icon} /> : <img src={assets.star_dull_icon} alt="" />}</p>
            <p>{averageRating >= 2 ? <img src={assets.star_icon} /> : <img src={assets.star_dull_icon} alt="" />}</p>
            <p>{averageRating >= 3 ? <img src={assets.star_icon} /> : <img src={assets.star_dull_icon} alt="" />}</p>
            <p>{averageRating >= 4 ? <img src={assets.star_icon} /> : <img src={assets.star_dull_icon} alt="" />}</p>
            <p>{averageRating >= 5 ? <img src={assets.star_icon} /> : <img src={assets.star_dull_icon} alt="" />}</p>
            <p className='pl-2'>({reviews.length})</p>
          </div>
          <p className='mt-2 text-3xl font-medium text-blue-600'>{currency}{productData.price}</p>
          
          {/* 分类标签 */}
          {(productData.category || productData.subCategory || productData.thirdCategory) && (
            <div className='mt-2 flex flex-wrap gap-2 items-center'>
              <span className='text-sm font-semibold text-gray-700'>Category:</span>
              {productData.category && (
                <span className='inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  {productData.category}
                </span>
              )}
              {productData.subCategory && (
                <span className='inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm'>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z" clipRule="evenodd" />
                    <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
                  </svg>
                  {productData.subCategory}
                </span>
              )}
              {productData.thirdCategory && (
                <span className='inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-sm'>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  {productData.thirdCategory}
                </span>
              )}
            </div>
          )}

          {/* 属性标签 */}
          {Array.isArray(productData.attributes) && productData.attributes.length > 0 && (
            <div className='mt-3 flex flex-wrap gap-2 items-center'>
              <span className='text-sm font-semibold text-gray-700'>Features:</span>
              {productData.attributes.map((attribute, index) => {
                if (!attribute) return null
                const attrInfo = attribute.attribute || {}
                const label = attrInfo.label || attrInfo.name || ''
                const value = attribute.value || ''
                if (!label || !value) return null
                const bg = attrInfo.color || '#f0f9ff'
                const textColor = '#0f172a'
                return (
                  <span
                    key={attrInfo._id || `${label}-${index}`}
                    className='inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg shadow-sm border border-gray-200'
                    style={{ backgroundColor: bg, color: textColor }}
                  >
                    <span className='w-2 h-2 rounded-full bg-current opacity-50'></span>
                    <span className='font-semibold'>{label}:</span>
                    <span>{value}</span>
                  </span>
                )
              })}
            </div>
          )}
          {productData.sizes && productData.sizes.length > 0 && (
            <div className='flex flex-col gap-4 my-2'>
              <p>Select Size</p>
              <div className='flex gap-2 flex-wrap'>
                {productData.sizes.map((item, index) => (
                  <button
                    onClick={() => setSize(item)}
                    key={index}
                    className={`border py-2 px-4 rounded-md bg-white transition-all ${item === size ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50 text-blue-600' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className='flex items-center gap-2'>
                <label className='text-sm text-gray-600'>Quantity</label>
                <input
                  type='number'
                  min='1'
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className='w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>
          )}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full'>
          <button onClick={(e) => {
            if (productData.sizes && productData.sizes.length > 0) {
              if (!size) {
                toast.error('Please select a size')
                return
              }
              addToCart(productData._id, size, quantity)
            } else {
              addToCart(productData._id, 'Default', quantity)
            }
            const imgEl = document.querySelector('img.product-main-img')
            if (imgEl) flyToCart(imgEl)
            }} className='cartoon-btn text-white px-8 py-3 text-sm sm:w-auto'>Add & Inquiry</button>
            <div className='flex-1 flex justify-start sm:justify-end'>
              <SocialShare product={productData} />
            </div>
          </div>
          {/* <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original Product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7days</p>
          </div> */}
          </div>
        </div>
      </div>
      {/*Description & Review Section*/}
      <div className='mt-12 px-4 sm:px-8 lg:px-12'>
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='flex justify-center gap-2 p-3'>
            <button
              onClick={() => setTabs("description")}
              aria-selected={tabs==='description'}
              className={`px-5 py-3 text-sm sm:text-base font-semibold cursor-pointer rounded-md transition-colors duration-200
              ${tabs==='description' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
            >
              Description
            </button>
            <button
              onClick={() => setTabs("reviews")}
              aria-selected={tabs==='reviews'}
              className={`px-5 py-3 text-sm sm:text-base font-semibold cursor-pointer rounded-md transition-colors duration-200
              ${tabs==='reviews' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
            >
              Reviews({reviews.length})
            </button>
          </div>
          {tabs === "description" ? (
            <div className='border-t border-blue-100 bg-white px-6 py-6 text-sm text-gray-600'>
              <div
                className='product-description-detail flex flex-col gap-4 w-full max-w-4xl mx-auto'
            dangerouslySetInnerHTML={{ __html: productData.description }}
              />
            </div>
          ) :
            <div className='flex flex-col gap-4 border-t border-blue-100 bg-white px-6 py-6 text-sm text-gray-600'>
              <div className='flex flex-col w-full max-w-4xl mx-auto'>
              {/* <h3 className="text-lg font-semibold text-gray-800 mb-4">Submit</h3> */}

              {/* 错误或成功提示 */}
              {error && <p className="text-red-500 mb-4">{error}</p>}
              {message && <p className="text-green-500 mb-4">{message}</p>}

              {/* 评论表单 */}
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData();
                formData.append("rating", rating);
                formData.append("comment", comment);
                formData.append("productId", productId);
                formData.append("userId", userId);
                if (media && media.length > 0) {
                  Array.from(media).forEach((file, index) => {
                    formData.append('media', file);
                    console.log(`Appending file ${index + 1}: ${file.name}`);
                  });
                }
                const result = await submitComment(formData, userId, productId)
                if (result && result.success) {
                  // Refresh comments after successful submission
                  await fetchCommentsData()
                  // Reset form
                  setComment('')
                  setMedia(false)
                  setRating(5)
                }
              }} className="space-y-4">
                {/* 评分选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <div className='flex items-center gap-1 mt-2'>
                    <p onClick={() => setRating(1)} className='cursor-pointer'>{rating >= 1 ? <img src={assets.star_icon} /> : <img src={assets.star_dull_icon} alt="" />}</p>
                    <p onClick={() => setRating(2)} className='cursor-pointer'>{rating >= 2 ? <img src={assets.star_icon} /> : <img src={assets.star_dull_icon} alt="" />}</p>
                    <p onClick={() => setRating(3)} className='cursor-pointer'>{rating >= 3 ? <img src={assets.star_icon} /> : <img src={assets.star_dull_icon} alt="" />}</p>
                    <p onClick={() => setRating(4)} className='cursor-pointer'>{rating >= 4 ? <img src={assets.star_icon} /> : <img src={assets.star_dull_icon} alt="" />}</p>
                    <p onClick={() => setRating(5)} className='cursor-pointer'>{rating >= 5 ? <img src={assets.star_icon} /> : <img src={assets.star_dull_icon} alt="" />}</p>
                  </div>
                </div>

                {/* 评论内容输入 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Please share your thoughts about this product..."
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
                  />
                </div>

                {/* 图片上传 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (Optional)</label>
                  <div className='flex flex-col sm:flex-row gap-3 items-start'>
                    <input
                      id="review-media-input"
                      multiple
                      type="file"
                      accept="image/*"
                      onChange={handleSetImage(setMedia)}
                      className="hidden"
                    />
                    <label htmlFor="review-media-input" className='inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm cursor-pointer hover:bg-blue-700'>
                      Choose Images
                    </label>
                    <span className='text-sm text-gray-500 mt-1 sm:mt-2'>
                      {media && media.length > 0 ? `${media.length} file(s) selected` : 'No file selected'}
                    </span>
                    {media && media.length > 0 && (
                      <div className='flex flex-row gap-2 flex-wrap'>
                        {Array.from(media).map((element, index) => (
                          <img
                            key={index}
                            src={URL.createObjectURL(element)}
                            alt={`Preview ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-md border-2 border-gray-200"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 提交按钮 */}
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Submit Review
                </button>
              </form>
              {/* Reviews List */}
              <div className="space-y-6 mt-10">
                {loadingComments ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <p className="ml-3 text-gray-600">Loading reviews...</p>
                  </div>
                ) : reviews && reviews.length > 0 ?
                  (
                    reviews <= 10 ?
                      (
                        reviews.map((review, index) => (
                          <div key={index} className="pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-800">
                                  {userNames[index] || 'Anonymous'}
                                </span>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, starIndex) => (
                                    <img
                                      key={starIndex}
                                      src={starIndex < review.rating ? assets.star_icon : assets.star_dull_icon}
                                      alt="Rating star"
                                      className="w-4 h-4"
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-400">
                                  {formatDateTime(review.createdAt)}
                                </span>


                                {JSON.stringify(review.userId) === (`"${userId}"`) && (
                                  <button
                                    onClick={() => handleDeleteComment(review._id)}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-600 mb-3">{review.comment}</p>
                            {review.media && review.media.length > 0 && (
                              <div className="flex flex-row gap-2 flex-wrap">
                                {review.media.map((img, imgIndex) => (
                                  <img
                                    key={imgIndex}
                                    src={img}
                                    alt={`Review image ${imgIndex + 1}`}
                                    className="w-20 h-20 object-cover rounded-md border border-gray-200"
                                  />
                                ))}
                              </div>
                            )}
                            <hr className="mt-4 border-gray-200" />
                          </div>
                        )
                        )
                      ) :
                      (
                        reviews.map((review, index) => (
                          <div key={index} className="pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-800">
                                  {userNames[index] || 'Anonymous'}
                                </span>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, starIndex) => (
                                    <img
                                      key={starIndex}
                                      src={starIndex < review.rating ? assets.star_icon : assets.star_dull_icon}
                                      alt="Rating star"
                                      className="w-4 h-4"
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-400">
                                  {formatDateTime(review.createdAt)}
                                </span>


                                {JSON.stringify(review.userId) === (`"${userId}"`) && (
                                  <button
                                    onClick={() => handleDeleteComment(review._id)}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-600 mb-3">{review.comment}</p>
                            {review.media && review.media.length > 0 && (
                              <div className="flex flex-row gap-2 flex-wrap">
                                {review.media.map((img, imgIndex) => (
                                      <img
                                        onClick={handleImageClick}
                                        key={imgIndex}
                                        src={img}
                                        alt={`Review image ${imgIndex + 1}`}
                                        className='w-20 h-20 object-cover rounded-md border border-gray-200 cursor-pointer '
                                      />
                                ))}
                              </div>
                                )}
                                <hr className="mt-4 border-gray-200" />
                              </div>
                            )
                        )
                            )
                            ) : (
                            <p className="text-gray-500 italic">No reviews yet. Be the first to share your thoughts!</p>
                  )
                }
              </div>
            </div>
          </div>
          }
        </div>
      </div>
      {/*Related Products*/}
      <div className='px-4 sm:px-8 lg:px-12'>
        <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
      </div>
    </div>
  ) : (
    <div className='flex justify-center items-center min-h-screen'>
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
    </div>
  )
}

      export default Product
