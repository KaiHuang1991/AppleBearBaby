import React, { lazy, Suspense, useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import SocialShare from '../componets/SocialShare'
import { buildOgShareImages } from '../src/utils/ogCollage'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../src/assets/assets.js'
import { toast } from 'react-toastify'
import { flyToCart } from '../src/utils/flyToCart'
import '../styles/ProductDescription.css'
import YouTubeEmbed from '../componets/YouTubeEmbed'
import { getProductPath, isMongoObjectId } from '../src/utils/productPath'
import { getProductCanonicalUrl } from '../src/utils/productShareUrl'
import { optimizeCloudinaryUrl } from '../src/utils/cloudinaryUrl'

const RelatedProducts = lazy(() => import('../componets/RelatedProducts'))

const Product = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { products, currency, addToCart, submitComment, getProductCategoryPath, api } = useContext(ShopContext)
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
  const [productVideos, setProductVideos] = useState([])
  const [zoomViewer, setZoomViewer] = useState(null)

  const userId = localStorage.getItem("userId")

  const recordVideoView = async (videoId) => {
    try {
      await api.videosRecordView(videoId)
    } catch (err) {
      console.error(err)
    }
  }

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
      if (item._id === productId || item.slug === productId) {
        setProductData(item)
        //console.log(productData)
        setImage(item.image[0]) //get the first image of current product page
        return null
      }
    })
  }

  const resolvedProductId = productData?._id || (isMongoObjectId(productId) ? productId : null)

  const categoryPath = getProductCategoryPath(productData)

  const breadcrumbCollectionTo = (levelIndex) => {
    if (!categoryPath || levelIndex < 0) return '/collection'
    const params = new URLSearchParams()
    const keys = ['categoryId', 'subCategoryId', 'thirdCategoryId']
    categoryPath.forEach((node, idx) => {
      if (idx > levelIndex) return
      if (node?.id && keys[idx]) params.set(keys[idx], node.id)
    })
    const queryString = params.toString()
    return queryString ? `/collection?${queryString}` : '/collection'
  }
  const fetchCommentsData = async () => {
    if (!resolvedProductId) return
    try {
      setLoadingComments(true)
      
      // Try to load from cache first for instant display
      const cachedReviews = localStorage.getItem(`reviews_${resolvedProductId}`)
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
      
      console.log('Fetching comments for product:', resolvedProductId)
      const response = await api.productListComment({
        productId: resolvedProductId
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
        localStorage.setItem(`reviews_${resolvedProductId}`, JSON.stringify(reviewsArray))
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
      const response = await api.reviewsDelete(reviewId)
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
    let cancelled = false

    const applyProduct = (match) => {
      if (!match || cancelled) return
      setProductData(match)
      setImage(match.image?.[0] || '')
      if (match.slug && isMongoObjectId(productId) && productId !== match.slug) {
        navigate(getProductPath(match), { replace: true })
      }
    }

    const match = products.find(
      (item) => item._id === productId || item.slug === productId
    )
    if (match) {
      applyProduct(match)
      return () => {
        cancelled = true
      }
    }

    ;(async () => {
      try {
        const { data } = await api.productGet(productId)
        if (data?.success && data.product) applyProduct(data.product)
      } catch (err) {
        console.error(err)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [productId, products, navigate, api])
  useEffect(() => {
    if (resolvedProductId) {
      fetchCommentsData()
    }
  }, [resolvedProductId])

  useEffect(() => {
    if (!resolvedProductId) return
    const loadVideos = async () => {
      try {
        const { data } = await api.videosByProduct(resolvedProductId)
        if (data?.success) setProductVideos(data.videos || [])
        else setProductVideos([])
      } catch {
        setProductVideos([])
      }
    }
    loadVideos()
  }, [resolvedProductId, api])

  useEffect(() => {
    if (tabs !== 'description' || !productData) return
    const root = document.querySelector('.product-description-detail')
    if (!root) return
    root.querySelectorAll('img').forEach((img) => {
      if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy')
      img.setAttribute('decoding', 'async')
      const src = img.getAttribute('src') || ''
      if (src.includes('res.cloudinary.com') && !src.includes('w_')) {
        img.setAttribute('src', optimizeCloudinaryUrl(src, { width: 900 }))
      }
    })
  }, [tabs, productData])

  const openZoomViewer = (urls, startIndex = 0, alt = '') => {
    const list = (urls || []).filter(Boolean).map((url) => optimizeCloudinaryUrl(url, { width: 1600 }))
    if (!list.length) return
    const index = Math.min(Math.max(0, startIndex), list.length - 1)
    setZoomViewer({ list, index, alt })
  }

  useEffect(() => {
    if (!zoomViewer) return
    const onKey = (event) => {
      if (event.key === 'Escape') setZoomViewer(null)
      if (event.key === 'ArrowRight' && zoomViewer.list.length > 1) {
        setZoomViewer((prev) => prev && ({ ...prev, index: (prev.index + 1) % prev.list.length }))
      }
      if (event.key === 'ArrowLeft' && zoomViewer.list.length > 1) {
        setZoomViewer((prev) => prev && ({ ...prev, index: (prev.index - 1 + prev.list.length) % prev.list.length }))
      }
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [zoomViewer])

  // 生成SEO相关的meta信息
  const generateSEOMeta = () => {
    if (!productData) return null

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
        const base = typeof window !== 'undefined' ? window.location.origin : ''
        if (!path.startsWith('/')) {
          return `${base}/${path}`
        }
        return `${base}${path}`
      }
    }

    const normalizeImages = (rawImages = []) => {
      const list = Array.isArray(rawImages) ? rawImages.filter(Boolean) : []
      const seen = new Set()
      const normalized = []
      for (const src of list) {
        let url = ensureAbsoluteUrl(src)
        if (url.startsWith('http://')) {
          url = url.replace(/^http:\/\//i, 'https://')
        }
        if (url && !seen.has(url)) {
          seen.add(url)
          normalized.push(url)
        }
      }
      return normalized
    }

    const canonical = getProductCanonicalUrl(productData)
    const title = productData.name || 'Product'
    const description = stripHtml(productData.description || '').slice(0, 160)
    const sourceImages = normalizeImages(productData.image)
    const images = buildOgShareImages(sourceImages)
    const image = images[0] || ''

    // 生成关键词：产品名称、分类、属性值等组合
    const keywordsArray = []
    if (productData.name) keywordsArray.push(productData.name)
    if (productData.modelNumber && String(productData.modelNumber).trim()) {
      keywordsArray.push(String(productData.modelNumber).trim())
    }
    if (productData.category) keywordsArray.push(productData.category)
    if (productData.subCategory) keywordsArray.push(productData.subCategory)
    if (productData.thirdCategory) keywordsArray.push(productData.thirdCategory)
    
    // 添加属性值到关键词
    if (Array.isArray(productData.attributes) && productData.attributes.length > 0) {
      productData.attributes.forEach(attr => {
        if (attr?.value) {
          keywordsArray.push(attr.value)
        }
        // 也添加属性名称（如果有）
        if (attr?.attribute) {
          const attrName = typeof attr.attribute === 'object' ? attr.attribute.name || attr.attribute.label : attr.attribute
          if (attrName) keywordsArray.push(attrName)
        }
      })
    }
    
    // 添加尺寸到关键词
    if (Array.isArray(productData.sizes) && productData.sizes.length > 0) {
      productData.sizes.forEach(size => {
        if (size) keywordsArray.push(size)
      })
    }

    // 限制关键词数量，避免过长（最多15个关键词）
    const keywords = keywordsArray.slice(0, 15).join(', ')

    return {
      title,
      description, // 移除价格信息，价格已有专门的product:price meta标签
      keywords,
      image,
      images,
      canonical,
      ogType: 'product',
      // 添加产品价格（用于结构化数据）
      price: productData.price,
      currency: currency.replace('$', 'USD'),
      // 添加产品可用性
      availability: 'in stock',
      // 添加品牌信息（如果有）
      brand: productData.brand || 'AppleBearBaby'
    }
  }

  const seoMeta = generateSEOMeta()

  useEffect(() => {
    if (productData?.sizes && productData.sizes.length > 0) {
      if (!size || !productData.sizes.includes(size)) {
        setSize(productData.sizes[0])
      }
    } else {
      setSize('')
    }
  }, [productData?.sizes])

  const handleAddToInquiry = () => {
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
  }

  const specRows = []
  if (productData) {
    if (productData.modelNumber && String(productData.modelNumber).trim()) {
      specRows.push({ label: 'Model', value: String(productData.modelNumber).trim() })
    }
    if (productData.category) specRows.push({ label: 'Category', value: productData.category })
    if (productData.subCategory) specRows.push({ label: 'Subcategory', value: productData.subCategory })
    if (productData.thirdCategory) specRows.push({ label: 'Type', value: productData.thirdCategory })
    if (Array.isArray(productData.attributes)) {
      productData.attributes.forEach((attribute, index) => {
        if (!attribute) return
        const attrInfo = attribute.attribute || {}
        const label = attrInfo.label || attrInfo.name || ''
        const value = attribute.value || ''
        if (!label || !value) return
        specRows.push({ label, value, key: attrInfo._id || `${label}-${index}` })
      })
    }
  }

  const categoryEyebrow = productData
    ? [productData.category, productData.subCategory, productData.thirdCategory].filter(Boolean).join(' / ')
    : ''

  const tabClass = (id) =>
    `product-tab ${tabs === id ? 'product-tab--active' : ''}`

  return productData ? (
    <main className='mt-20 transition-opacity ease-in duration-500 opacity-100 cartoon-bg min-h-screen pb-28 lg:pb-20'>
      {/* SEO Meta Tags */}
      {seoMeta && (
        <Helmet>
          {/* 基础Meta标签 */}
          <title>{seoMeta.title}</title>
          <meta name="description" content={seoMeta.description} />
          <meta name="keywords" content={seoMeta.keywords} />
          {seoMeta.canonical ? <link rel="canonical" href={seoMeta.canonical} /> : null}
          {image ? (
            <link
              rel="preload"
              as="image"
              href={optimizeCloudinaryUrl(image, { width: 800 })}
              fetchPriority="high"
            />
          ) : null}
          
          {/* Open Graph Meta标签（Facebook, LinkedIn等） */}
          <meta property="og:type" content={seoMeta.ogType} />
          <meta property="og:title" content={seoMeta.title} />
          <meta property="og:description" content={seoMeta.description} />
          {seoMeta.images.map((imgUrl) => (
            <React.Fragment key={imgUrl}>
              <meta property="og:image" content={imgUrl} />
              <meta property="og:image:secure_url" content={imgUrl} />
            </React.Fragment>
          ))}
          {seoMeta.canonical ? <meta property="og:url" content={seoMeta.canonical} /> : null}
          {import.meta.env.VITE_FACEBOOK_APP_ID ? (
            <meta property="fb:app_id" content={import.meta.env.VITE_FACEBOOK_APP_ID} />
          ) : null}
          {seoMeta.price && (
            <>
              <meta property="product:price:amount" content={seoMeta.price.toString()} />
              <meta property="product:price:currency" content={seoMeta.currency} />
            </>
          )}
          <meta property="product:availability" content={seoMeta.availability} />
          <meta property="product:brand" content={seoMeta.brand} />
          
          {/* Twitter Card Meta标签 */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={seoMeta.title} />
          <meta name="twitter:description" content={seoMeta.description} />
          <meta name="twitter:image" content={seoMeta.image} />
          
          {/* 额外的SEO标签 */}
          <meta name="robots" content="index, follow" />
          <meta name="author" content={seoMeta.brand} />
        </Helmet>
      )}
      {/* Breadcrumb Navigation */}
      <div className='bg-[var(--color-surface)] border-b border-slate-200'>
        <div className='section-container py-3'>
          <nav className='flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[var(--color-ink-muted)]' aria-label='Breadcrumb'>
            <button
              type='button'
              onClick={() => window.history.back()}
              className='hover:text-[var(--color-brand)] transition-colors flex items-center gap-1'
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <span aria-hidden="true">/</span>
            <Link to='/collection' className='hover:text-[var(--color-brand)] transition-colors'>
              Catalog
            </Link>
            {categoryPath?.map((node, index) => (
              <React.Fragment key={node?.id || node?.name || index}>
                <span aria-hidden="true">/</span>
                {node?.id ? (
                  <Link
                    to={breadcrumbCollectionTo(index)}
                    className='hover:text-[var(--color-brand)] transition-colors'
                  >
                    {node?.name || 'Category'}
                  </Link>
                ) : (
                  <span>{node?.name || 'Category'}</span>
                )}
              </React.Fragment>
            ))}
            <span aria-hidden="true">/</span>
            <span className='font-medium text-[var(--color-ink)] truncate max-w-[10rem] sm:max-w-md md:max-w-lg'>{productData.name}</span>
          </nav>
        </div>
      </div>
      
      {/* Product Data */}
      <div className='section-container product-detail-row pt-6 sm:pt-8'>
        {/* Product Images */}
        <div className='product-gallery'>
          <div className='thumbnail-column'>
            {(productData.image || []).map((item, itemIndex) => (
              <button
                type='button'
                key={itemIndex}
                onClick={() => setImage(item)}
                className={`thumbnail-item ${image === item ? 'thumbnail-item--active' : ''}`}
                aria-label={`${productData.name} thumbnail ${itemIndex + 1}`}
                aria-pressed={image === item}
              >
                <img
                  src={optimizeCloudinaryUrl(item, { width: 200 })}
                  alt={`${productData.name} thumbnail ${itemIndex + 1}`}
                  width={200}
                  height={200}
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
          <div className='product-main-outer'>
            <div className='product-main-wrapper'>
              <img
                src={optimizeCloudinaryUrl(image, { width: 800 })}
                className='product-main-img'
                alt={productData.name}
                width={800}
                height={800}
                fetchPriority="high"
                decoding="async"
                onClick={() => {
                  const gallery = productData.image || []
                  const index = Math.max(0, gallery.indexOf(image))
                  openZoomViewer(gallery, index, productData.name)
                }}
              />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className='product-info-panel'>
          {categoryEyebrow ? (
            <p className='text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)] mb-2'>
              {categoryEyebrow}
            </p>
          ) : null}

          <h1 className='text-xl sm:text-2xl font-semibold text-[var(--color-ink)] leading-snug'>
            {productData.name}
          </h1>

          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-[var(--color-ink-muted)]'>
            {productData.modelNumber && String(productData.modelNumber).trim() ? (
              <span>Model {String(productData.modelNumber).trim()}</span>
            ) : null}
            <span className='flex items-center gap-1' aria-label={`${averageRating.toFixed(1)} star rating`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <img
                  key={star}
                  src={averageRating >= star ? assets.star_icon : assets.star_dull_icon}
                  alt=""
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
              ))}
            </span>
            <button
              type='button'
              className='hover:text-[var(--color-brand)]'
              onClick={() => setTabs('reviews')}
            >
              {reviews.length} review{reviews.length === 1 ? '' : 's'}
            </button>
          </div>

          <div className='product-price-panel'>
            <span className='text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]'>Wholesale price</span>
            <p className='text-3xl font-semibold text-[var(--color-brand)] leading-none mt-1'>
              {currency}{productData.price}
            </p>
          </div>

          {specRows.length > 0 ? (
            <dl className='product-spec-list'>
              {specRows.map((row) => (
                <div key={row.key || row.label} className='product-spec-row'>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {productData.sizes && productData.sizes.length > 0 ? (
            <div className='mt-5'>
              <p className='text-sm font-medium text-[var(--color-ink)] mb-2'>Select size</p>
              <div className='flex gap-2 flex-wrap'>
                {productData.sizes.map((item, index) => (
                  <button
                    type='button'
                    onClick={() => setSize(item)}
                    key={index}
                    className={`min-w-[3rem] border py-2 px-4 rounded-md bg-white text-sm transition-colors ${
                      item === size
                        ? 'border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]'
                        : 'border-slate-200 text-[var(--color-ink)] hover:border-[var(--color-brand)]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className='flex items-center gap-3 mt-4'>
            <label htmlFor='product-quantity' className='text-sm font-medium text-[var(--color-ink)]'>Quantity</label>
            <input
              id='product-quantity'
              type='number'
              min='1'
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className='w-20 px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)]'
            />
          </div>

          <div className='product-cta-block'>
            <button
              type='button'
              onClick={handleAddToInquiry}
              className='cartoon-btn text-white px-8 py-3 text-sm w-full sm:w-auto'
            >
              Add & Inquiry
            </button>
            <SocialShare product={productData} />
          </div>

          <ul className='product-trust-row'>
            <li>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              In Stock
            </li>
            <li>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              Fast Shipping
            </li>
            {productData.bestseller ? (
              <li>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Bestseller
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      {/* Description / Videos / Reviews */}
      <div className='section-container mt-10 sm:mt-12 min-w-0'>
        <div className='product-tabs' role="tablist" aria-label="Product details">
          <button
            type="button"
            role="tab"
            id="tab-description"
            aria-controls="panel-description"
            onClick={() => setTabs("description")}
            aria-selected={tabs === 'description'}
            className={tabClass('description')}
          >
            Description
          </button>
          {productVideos.length > 0 ? (
            <button
              type="button"
              role="tab"
              id="tab-videos"
              aria-controls="panel-videos"
              onClick={() => setTabs('videos')}
              aria-selected={tabs === 'videos'}
              className={tabClass('videos')}
            >
              Videos ({productVideos.length})
            </button>
          ) : null}
          <button
            type="button"
            role="tab"
            id="tab-reviews"
            aria-controls="panel-reviews"
            onClick={() => setTabs("reviews")}
            aria-selected={tabs === 'reviews'}
            className={tabClass('reviews')}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {tabs === 'videos' && productVideos.length > 0 ? (
          <div
            id="panel-videos"
            role="tabpanel"
            aria-labelledby="tab-videos"
            className="product-tab-panel"
          >
            <div className="flex flex-col gap-8 w-full min-w-0 max-w-3xl">
              {productVideos.map((video) => (
                <div key={video._id}>
                  <h2 className="text-lg font-semibold text-[var(--color-ink)] mb-3">{video.title}</h2>
                  <YouTubeEmbed
                    youtubeId={video.youtubeId}
                    title={video.title}
                    onActivate={() => recordVideoView(video._id)}
                  />
                  {video.description ? (
                    <p className="text-sm text-[var(--color-ink-muted)] mt-3">{video.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : tabs === "description" ? (
          <div
            id="panel-description"
            role="tabpanel"
            aria-labelledby="tab-description"
            className="product-tab-panel text-sm text-[var(--color-ink-muted)]"
          >
            <div
              className="product-description-detail w-full min-w-0"
              dangerouslySetInnerHTML={{ __html: productData.description }}
            />
          </div>
        ) : (
          <div
            id="panel-reviews"
            role="tabpanel"
            aria-labelledby="tab-reviews"
            className="product-tab-panel text-sm text-[var(--color-ink-muted)]"
          >
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {message && <p className="text-green-600 mb-4">{message}</p>}

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData();
              formData.append("rating", rating);
              formData.append("comment", comment);
              formData.append("productId", resolvedProductId);
              formData.append("userId", userId);
              if (media && media.length > 0) {
                Array.from(media).forEach((file) => {
                  formData.append('media', file);
                });
              }
              const result = await submitComment(formData, userId, resolvedProductId)
              if (result && result.success) {
                await fetchCommentsData()
                setComment('')
                setMedia(false)
                setRating(5)
              }
            }} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-1">Rating</label>
                <div className='flex items-center gap-1 mt-2'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      aria-label={`${star} star${star === 1 ? '' : 's'}`}
                      className="cursor-pointer"
                    >
                      <img
                        src={rating >= star ? assets.star_icon : assets.star_dull_icon}
                        alt=""
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="review-comment" className="block text-sm font-medium text-[var(--color-ink)] mb-2">Comments</label>
                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Please share your thoughts about this product..."
                  required
                  className="w-full p-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)] h-32 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">Upload Images (Optional)</label>
                <div className='flex flex-col sm:flex-row gap-3 items-start'>
                  <input
                    id="review-media-input"
                    multiple
                    type="file"
                    accept="image/*"
                    onChange={handleSetImage(setMedia)}
                    className="hidden"
                  />
                  <label htmlFor="review-media-input" className='corp-btn-outline text-sm cursor-pointer'>
                    Choose Images
                  </label>
                  <span className='text-sm text-[var(--color-ink-muted)] mt-1 sm:mt-2'>
                    {media && media.length > 0 ? `${media.length} file(s) selected` : 'No file selected'}
                  </span>
                  {media && media.length > 0 && (
                    <div className='flex flex-row gap-2 flex-wrap'>
                      {Array.from(media).map((element, index) => (
                        <img
                          key={index}
                          src={URL.createObjectURL(element)}
                          alt={`Preview ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-md border border-slate-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="cartoon-btn text-white px-8 py-3 text-sm">
                Submit Review
              </button>
            </form>

            <div className="space-y-6 mt-10 max-w-2xl">
              {loadingComments ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-brand)]"></div>
                  <p className="ml-3">Loading reviews...</p>
                </div>
              ) : reviews && reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={review._id || index} className="pb-4 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-2 gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-[var(--color-ink)]">
                          {userNames[index] || 'Anonymous'}
                        </span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, starIndex) => (
                            <img
                              key={starIndex}
                              src={starIndex < review.rating ? assets.star_icon : assets.star_dull_icon}
                              alt=""
                              className="w-4 h-4"
                              width={16}
                              height={16}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-xs text-slate-400">
                          {formatDateTime(review.createdAt)}
                        </span>
                        {JSON.stringify(review.userId) === (`"${userId}"`) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(review._id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[var(--color-ink-muted)] mb-3">{review.comment}</p>
                    {review.media && review.media.length > 0 && (
                      <div className="flex flex-row gap-2 flex-wrap">
                        {review.media.map((img, imgIndex) => (
                          <img
                            onClick={handleImageClick}
                            key={imgIndex}
                            src={img}
                            alt={`Review image ${imgIndex + 1}`}
                            className="w-20 h-20 object-cover rounded-md border border-slate-200 cursor-pointer"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="italic">No reviews yet. Be the first to share your thoughts!</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className='section-container'>
        <Suspense fallback={null}>
          <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
        </Suspense>
      </div>

      <div className='product-sticky-cta lg:hidden'>
        <div className='product-sticky-cta-inner'>
          <div className='min-w-0'>
            <p className='text-xs text-[var(--color-ink-muted)] truncate'>{productData.name}</p>
            <p className='text-lg font-semibold text-[var(--color-brand)] leading-tight'>
              {currency}{productData.price}
            </p>
          </div>
          <button
            type='button'
            onClick={handleAddToInquiry}
            className='cartoon-btn text-white px-5 py-2.5 text-sm shrink-0'
          >
            Add & Inquiry
          </button>
        </div>
      </div>
      {zoomViewer ? (
        <div
          className="product-zoom-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged product image"
          onClick={() => setZoomViewer(null)}
        >
          <button
            type="button"
            className="product-zoom-close"
            aria-label="Close enlarged image"
            onClick={() => setZoomViewer(null)}
          >
            ×
          </button>
          {zoomViewer.list.length > 1 ? (
            <button
              type="button"
              className="product-zoom-nav product-zoom-prev"
              aria-label="Previous image"
              onClick={(event) => {
                event.stopPropagation()
                setZoomViewer((prev) => prev && ({ ...prev, index: (prev.index - 1 + prev.list.length) % prev.list.length }))
              }}
            >
              ‹
            </button>
          ) : null}
          <img
            src={zoomViewer.list[zoomViewer.index]}
            alt={zoomViewer.alt || 'Enlarged product image'}
            className="product-zoom-image"
            onClick={(event) => event.stopPropagation()}
          />
          {zoomViewer.list.length > 1 ? (
            <button
              type="button"
              className="product-zoom-nav product-zoom-next"
              aria-label="Next image"
              onClick={(event) => {
                event.stopPropagation()
                setZoomViewer((prev) => prev && ({ ...prev, index: (prev.index + 1) % prev.list.length }))
              }}
            >
              ›
            </button>
          ) : null}
          {zoomViewer.list.length > 1 ? (
            <p className="product-zoom-count" onClick={(event) => event.stopPropagation()}>
              {zoomViewer.index + 1} / {zoomViewer.list.length}
            </p>
          ) : null}
        </div>
      ) : null}
    </main>
  ) : (
    <div className='flex justify-center items-center min-h-screen'>
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
    </div>
  )
}

export default Product
