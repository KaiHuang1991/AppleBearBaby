import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../src/assets/assets'
import Title from '../componets/Title'
import ProductItem from '../componets/ProductItem'
import { useLocation, useNavigate } from 'react-router-dom'

const Collection = () => {
  const { products, search, setSearch, showSearch, setShowSearch, categoryTree, loadingCategories, getProductCategoryIds, categories } = useContext(ShopContext)
  const location = useLocation()
  const navigate = useNavigate()
  const searchInputRef = useRef(null)
  const [showFilter, setShowFilter] = useState(false)
  const [filterProducts, setFilterProducts] = useState([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([])
  const [sortType, setSortType] = useState('relevent')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedNodes, setExpandedNodes] = useState(() => new Set())
  const resolveItemsPerPage = () => {
    if (typeof window === 'undefined') return 5
    if (window.matchMedia('(min-width: 1024px)').matches) return 16
    if (window.matchMedia('(min-width: 640px)').matches) return 8
    return 5
  }

  const [itemsPerPage, setItemsPerPage] = useState(resolveItemsPerPage)

  useEffect(() => {
    const lgQuery = window.matchMedia('(min-width: 1024px)')
    const smQuery = window.matchMedia('(min-width: 640px)')
    const syncItemsPerPage = () => {
      if (lgQuery.matches) setItemsPerPage(16)
      else if (smQuery.matches) setItemsPerPage(8)
      else setItemsPerPage(5)
    }
    syncItemsPerPage()
    lgQuery.addEventListener('change', syncItemsPerPage)
    smQuery.addEventListener('change', syncItemsPerPage)
    return () => {
      lgQuery.removeEventListener('change', syncItemsPerPage)
      smQuery.removeEventListener('change', syncItemsPerPage)
    }
  }, [])
  const selectedCategorySet = useMemo(() => new Set(selectedCategoryIds), [selectedCategoryIds])
  const categoryMap = useMemo(() => {
    const map = new Map()
    if (Array.isArray(categories)) {
      categories.forEach(cat => {
        const id = String(cat?.id || cat?._id || '')
        if (id) {
          map.set(id, cat)
        }
      })
    }
    return map
  }, [categories])

  const toggleNodeExpansion = (categoryId) => {
    if (!categoryId) return
    const id = String(categoryId)
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const applyFilter = () => {
    let productsCopy = products.slice()

    if (search) {
      const normalized = search.trim().toLowerCase()
      if (normalized) {
        productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(normalized))
      }
    }

    if (selectedCategorySet.size > 0) {
      productsCopy = productsCopy.filter(item => {
        const productCategoryIds = getProductCategoryIds(item)
        if (!productCategoryIds || productCategoryIds.length === 0) return false
        return productCategoryIds.some(id => selectedCategorySet.has(String(id)))
      })
    }

    switch (sortType) {
      case 'low-high':
        productsCopy.sort((a, b) => a.price - b.price)
        break
      case 'high-low':
        productsCopy.sort((a, b) => b.price - a.price)
        break
      default:
        break
    }

    setFilterProducts(productsCopy)
  }

  const renderCategoryTree = (nodes, depth = 0) => {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      return null
    }

    return nodes.map(node => {
      const nodeId = node?.id || node?._id
      if (!nodeId) return null
      const idString = String(nodeId)
      const hasChildren = Array.isArray(node?.children) && node.children.length > 0
      const isExpanded = hasChildren && expandedNodes.has(idString)
      const isSelected = selectedCategoryIds.includes(idString)
      const handleRowClick = () => {
        if (hasChildren) {
          toggleNodeExpansion(idString)
        }
      }
      return (
        <div key={idString} className='flex flex-col'>
          <div
            className={`flex items-center gap-2 select-none ${hasChildren ? 'cursor-pointer' : ''}`}
            style={{ paddingLeft: depth * 16 }}
            onClick={handleRowClick}
          >
            {hasChildren ? (
              <span className={`inline-flex items-center justify-center w-4 h-4 text-blue-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </span>
            ) : (
              <span className='inline-flex w-4 h-4'></span>
            )}
            <button
              type='button'
              onClick={(event) => {
                event.stopPropagation()
                setSelectedCategoryIds(prev => prev.includes(idString) ? [] : [idString])
              }}
              className={`flex-1 text-left text-sm font-medium transition-colors truncate ${isSelected ? 'text-blue-600 underline' : 'text-gray-700 hover:text-blue-500'}`}
            >
              {node?.name}
            </button>
          </div>
          {hasChildren && isExpanded && (
            <div className='flex flex-col gap-1'>
              {renderCategoryTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      )
    })
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const keys = ['categoryId', 'subCategoryId', 'thirdCategoryId']
    const ids = []

    keys.forEach(key => {
      const value = params.get(key)
      if (value) {
        ids.push(String(value))
      }
    })

    const uniqueIds = Array.from(new Set(ids)).slice(-1)

    setSelectedCategoryIds(uniqueIds)

    const searchFromUrl = (params.get('search') || params.get('q') || '').trim()
    setSearch(prev => (prev.trim() === searchFromUrl ? prev : searchFromUrl))

    if (uniqueIds.length || searchFromUrl) {
      setShowFilter(true)
    }
  }, [location.search, setSearch])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const urlSearch = (params.get('search') || params.get('q') || '').trim()
    const normalizedSearch = search.trim()
    if (urlSearch === normalizedSearch) return

    const timer = setTimeout(() => {
      const nextParams = new URLSearchParams(location.search)
      if (normalizedSearch) {
        nextParams.set('search', normalizedSearch)
      } else {
        nextParams.delete('search')
        nextParams.delete('q')
      }
      const query = nextParams.toString()
      navigate(`/collection${query ? `?${query}` : ''}`, { replace: true })
    }, 300)

    return () => clearTimeout(timer)
  }, [search, location.search, navigate])

  useEffect(() => {
    if (!selectedCategoryIds.length || categoryMap.size === 0) return
    setExpandedNodes(prev => {
      const next = new Set(prev)
      let changed = false

      selectedCategoryIds.forEach(id => {
        let current = categoryMap.get(String(id))
        while (current && current.parent) {
          const parentId = String(current.parent)
          if (!next.has(parentId)) {
            next.add(parentId)
            changed = true
          }
          current = categoryMap.get(parentId)
        }
      })

      return changed ? next : prev
    })
  }, [selectedCategoryIds, categoryMap])

  useEffect(() => {
    applyFilter()
    setCurrentPage(1)
  }, [selectedCategoryIds, search, products, getProductCategoryIds])

  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filterProducts.length / itemsPerPage) || 1)
    if (currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [itemsPerPage, filterProducts.length, currentPage])

  useEffect(() => {
    applyFilter()
  }, [sortType])

  useEffect(() => {
    if (showSearch) {
      setShowFilter(true)
      requestAnimationFrame(() => {
        searchInputRef.current?.focus()
        setShowSearch(false)
      })
    }
  }, [showSearch, setShowSearch])

  // Calculate pagination
  const totalPages = Math.ceil(filterProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filterProducts.slice(startIndex, endIndex)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return (
    <div className='mt-0 h-auto flex flex-col lg:flex-row gap-1 lg:gap-10 pt-28 border-t border-blue-200 min-h-screen relative'>
      {/* Blue/Cyan Background Pattern */}
      <div className="absolute inset-0 cartoon-bg"></div>
      <div className="absolute inset-0 cartoon-hearts opacity-10"></div>
      
      {/* Subtle floating elements */}
      <div className="absolute top-32 left-10 w-12 h-12 bg-blue-200 rounded-full gentle-float opacity-40"></div>
      <div className="absolute bottom-40 right-20 w-8 h-8 bg-cyan-200 rounded-full gentle-bounce opacity-40"></div>
      
      <div className='relative z-10 flex flex-col lg:flex-row gap-4 lg:gap-10 w-full max-w-full box-border px-5 lg:px-10'>
      {/*filter options*/}
      <div className='w-full lg:w-auto lg:min-w-40 lg:max-w-[14rem] shrink-0'>
        <p onClick = {()=>setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2 text-blue-600 lg:cursor-default'>
          Filters
          <img className={`h-3 lg:hidden ${showFilter?'rotate-90':''}`} src={assets.dropdown_icon} alt="" />
        </p>
        {/* search input */}
        <div className={`cartoon-card px-4 py-4 ${showFilter ? '' : 'hidden'} lg:block`}>
          <label className='text-xs font-semibold text-blue-600 uppercase tracking-wide'>Search Products</label>
          <div className='mt-2 flex items-center gap-2 rounded-full border border-blue-200 bg-white pl-3 pr-2 py-2 shadow-sm focus-within:border-blue-500 transition-colors'>
            <img src={assets.search_icon} alt='Search' className='w-4 h-4 opacity-70'/>
            <input
              ref={searchInputRef}
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search catalog...'
              className='flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400'
            />
          </div>
        </div>
        {/*category filter*/}
        <div className={`cartoon-card pl-5 pr-4 py-3 mt-6 ${showFilter ? '' : 'hidden'} lg:block`}>
          <p className='mb-3 text-sm font-medium text-blue-600'>CATEGORIES</p>
          <button
            type='button'
            onClick={() => setSelectedCategoryIds([])}
            className={`mb-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${selectedCategoryIds.length === 0 ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
          >
            View All
          </button>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {loadingCategories ? (
              <span className='text-xs text-gray-500'>Loading categories...</span>
            ) : categoryTree && categoryTree.length > 0 ? (
              renderCategoryTree(categoryTree)
            ) : (
              <span className='text-xs text-gray-500'>No categories available.</span>
            )}
          </div>
        </div>
      </div>
      {/*right side*/}
      <div className='flex-1 min-w-0 w-full'>
        <div className='flex flex-wrap items-center justify-between gap-3 text-base lg:text-2xl mb-4'>
          <Title text1="WHOLESALE" text2="CATALOG"/>
          {/*product sort*/}
          <select onChange={(e)=>setSortType(e.target.value)} className='cartoon-border text-sm px-2 py-1.5 bg-white max-w-full shrink-0'>
            <option value={"relevent"}>Sort By: Relevent</option>
            <option value="low-high">Sort By: Low-High</option>
            <option value="high-low">Sort By: High-Low</option>
          </select>
        </div>
         {/*map products*/}
         <div className='catalog-product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-10 gap-y-6 lg:gap-y-15 w-full min-w-0 max-w-full sm:max-w-none lg:max-w-none mx-auto sm:mx-0 box-border'>
          {
            currentProducts.map((product,productIndex)=>(
              <ProductItem key={productIndex} id={product._id} image={product.image} name={product.name} price={product.price} />
            ))
          }
        </div>
       
        {/* Results info */}
        <div className='text-center text-sm text-gray-600 mt-8 mb-3 px-1'>
          Showing {startIndex + 1} - {Math.min(endIndex, filterProducts.length)} of {filterProducts.length} products
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <>
            {/* Phone / tablet: compact controls — always fit within content width */}
            <div className='catalog-pagination lg:hidden flex flex-wrap justify-center items-center gap-2 w-full max-w-full mb-6 px-1'>
              <button
                type='button'
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className='px-3 py-2 text-sm rounded-md bg-white border border-blue-300 text-blue-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors shrink-0'
              >
                Previous
              </button>
              <span className='text-sm font-medium text-gray-600 px-1 shrink-0'>
                Page {currentPage} / {totalPages}
              </span>
              <button
                type='button'
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className='px-3 py-2 text-sm rounded-md bg-white border border-blue-300 text-blue-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors shrink-0'
              >
                Next
              </button>
            </div>

            {/* Desktop: full page numbers */}
            <div className='catalog-pagination hidden lg:flex flex-wrap justify-center items-center gap-2 w-full max-w-full mb-6'>
              <button
                type='button'
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className='px-4 py-2 rounded-md bg-white border border-blue-300 text-blue-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors shrink-0'
              >
                Previous
              </button>
              <div className='flex flex-wrap justify-center gap-2'>
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        type='button'
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-2 rounded-md font-semibold transition-colors shrink-0 ${
                          currentPage === pageNumber
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-blue-300 text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  }
                  if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                    return <span key={pageNumber} className='px-2 py-2 shrink-0'>...</span>
                  }
                  return null
                })}
              </div>
              <button
                type='button'
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className='px-4 py-2 rounded-md bg-white border border-blue-300 text-blue-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors shrink-0'
              >
                Next
              </button>
            </div>
          </>
        )}

        {totalPages <= 1 && <div className='mb-6' />}

      </div>
      </div>

    </div>
  )
}

export default Collection
