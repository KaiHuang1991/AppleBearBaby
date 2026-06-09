import React, { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../src/App.jsx'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

const GRID_COLS = 'grid-cols-[1fr_3fr_1.2fr_0.8fr_1.2fr_0.6fr]'

const formatModifiedTime = (item) => {
  const ts = item.updatedAt || item.date
  if (!ts) return '-'
  return new Date(ts).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const SortArrows = ({ column, sortBy, sortOrder, onSort }) => {
  const isActive = sortBy === column
  return (
    <span className='inline-flex flex-col leading-none ml-0.5'>
      <button
        type='button'
        title='升序'
        onClick={() => onSort(column, 'asc')}
        className={`px-0.5 text-[10px] leading-[10px] hover:text-blue-600 ${
          isActive && sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-400'
        }`}
      >
        ▲
      </button>
      <button
        type='button'
        title='降序'
        onClick={() => onSort(column, 'desc')}
        className={`px-0.5 text-[10px] leading-[10px] hover:text-blue-600 ${
          isActive && sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-400'
        }`}
      >
        ▼
      </button>
    </span>
  )
}

const CategoryFilter = ({ categories, value, onChange }) => {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const ref = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus()
    }
  }, [open])

  const filteredCategories = searchQuery.trim()
    ? categories.filter(cat => cat.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : categories

  const closeMenu = () => {
    setOpen(false)
    setSearchQuery('')
  }

  return (
    <div className='relative inline-block' ref={ref}>
      <button
        type='button'
        title='筛选类目'
        onClick={() => setOpen(prev => !prev)}
        className={`p-0.5 rounded hover:bg-gray-200 ${value ? 'text-blue-600' : 'text-gray-500'}`}
      >
        <svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
          <path d='M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z' />
        </svg>
      </button>
      {open && (
        <div className='absolute left-0 top-full z-20 mt-1 min-w-[200px] bg-white border border-gray-200 rounded-md shadow-lg text-sm font-normal'>
          <div className='p-2 border-b border-gray-100 sticky top-0 bg-white'>
            <input
              ref={searchRef}
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='搜索类目...'
              className='w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className='max-h-52 overflow-y-auto py-1'>
            <button
              type='button'
              className={`block w-full text-left px-3 py-1.5 hover:bg-gray-100 ${!value ? 'text-blue-600 font-medium' : ''}`}
              onClick={() => {
                onChange('')
                closeMenu()
              }}
            >
              全部类目
            </button>
            {filteredCategories.length > 0 ? (
              filteredCategories.map(cat => (
                <button
                  key={cat}
                  type='button'
                  className={`block w-full text-left px-3 py-1.5 hover:bg-gray-100 truncate ${
                    value === cat ? 'text-blue-600 font-medium' : ''
                  }`}
                  onClick={() => {
                    onChange(cat)
                    closeMenu()
                  }}
                >
                  {cat}
                </button>
              ))
            ) : (
              <p className='px-3 py-2 text-gray-400 text-xs'>无匹配类目</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const List = ({ token, currency }) => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categoryOptions, setCategoryOptions] = useState([])
  const [sortBy, setSortBy] = useState('updatedAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  })
  const limit = 20

  const apiUrl = backendUrl || 'http://localhost:4000'

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${apiUrl}/api/categories`)
        if (data.success) {
          const topLevel = (data.categories || [])
            .filter(cat => !cat.parent)
            .map(cat => cat.name)
            .filter(Boolean)
          setCategoryOptions(topLevel)
        }
      } catch (error) {
        console.error('Failed to load categories', error)
      }
    }
    fetchCategories()
  }, [apiUrl])

  const fetchList = useCallback(async (targetPage = 1) => {
    try {
      setLoading(true)
      const response = await axios.get(apiUrl + '/api/product/list', {
        params: {
          page: targetPage,
          limit,
          search: searchTerm || undefined,
          category: categoryFilter || undefined,
          sortBy,
          sortOrder,
        },
        headers: { token },
      })
      if (response.data.success && response.data.products) {
        setList(response.data.products)
        const serverPagination = response.data.pagination || {}
        setPagination(prev => ({
          page: serverPagination.page || targetPage,
          limit: serverPagination.limit || prev.limit || limit,
          total: serverPagination.total ?? prev.total,
          totalPages: serverPagination.totalPages || prev.totalPages || 1,
        }))
        return response.data.pagination
      } else {
        setList([])
        toast.error(response.data.message || 'Failed to fetch products')
        return null
      }
    } catch (error) {
      console.log(error)
      setList([])
      toast.error(error.message || 'Failed to fetch products')
      return null
    } finally {
      setLoading(false)
    }
  }, [token, limit, searchTerm, categoryFilter, sortBy, sortOrder, apiUrl])

  const removeProduct = async (id) => {
    try {
      const confirmation = window.confirm('Are you Sure to Delete?')
      if (confirmation) {
        const response = await axios.post(apiUrl + '/api/product/remove', { id }, { headers: { token } })
        if (response.data.success) {
          toast.success(response.data.message)
          const currentPage = pagination.page || 1
          const data = await fetchList(currentPage)
          if (data && data.totalPages && currentPage > data.totalPages) {
            await fetchList(data.totalPages)
          }
        } else {
          toast.error(response.data.message)
        }
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchList(1)
  }, [fetchList])

  const handleSort = (column, order) => {
    setSortBy(column)
    setSortOrder(order)
  }

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category)
  }

  const handlePageChange = async (pageNumber) => {
    if (pageNumber === pagination.page || pageNumber < 1 || pageNumber > pagination.totalPages) return
    await fetchList(pageNumber)
  }

  const handleNext = () => {
    if (pagination.page < pagination.totalPages) {
      handlePageChange(pagination.page + 1)
    }
  }

  const handlePrevious = () => {
    if (pagination.page > 1) {
      handlePageChange(pagination.page - 1)
    }
  }

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null
    const pages = []
    for (let i = 1; i <= pagination.totalPages; i += 1) {
      if (i === 1 || i === pagination.totalPages || Math.abs(i - pagination.page) <= 1) {
        pages.push(i)
      }
    }

    return (
      <div className='flex flex-wrap items-center justify-center gap-2 mt-6'>
        <button
          onClick={handlePrevious}
          disabled={pagination.page <= 1}
          className='px-3 py-1 rounded-md border border-blue-200 text-blue-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors'
        >
          Previous
        </button>
        {pages.map((pageNumber, idx) => {
          const prev = pages[idx - 1]
          const showEllipsis = prev && pageNumber - prev > 1
          return (
            <React.Fragment key={pageNumber}>
              {showEllipsis && <span className='px-2 text-sm text-gray-500'>...</span>}
              <button
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  pagination.page === pageNumber
                    ? 'bg-blue-600 text-white'
                    : 'border border-blue-200 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {pageNumber}
              </button>
            </React.Fragment>
          )
        })}
        <button
          onClick={handleNext}
          disabled={pagination.page >= pagination.totalPages}
          className='px-3 py-1 rounded-md border border-blue-200 text-blue-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors'
        >
          Next
        </button>
      </div>
    )
  }

  if (loading && list.length === 0) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  return (
    <>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4'>
        <div>
          <p className='font-semibold text-lg'>All Product List</p>
          <p className='text-sm text-gray-600'>
            {pagination.total > 0
              ? `Showing ${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} products`
              : 'No products found'}
            {categoryFilter && (
              <span className='ml-2 text-blue-600'>
                · 类目: {categoryFilter}
              </span>
            )}
          </p>
        </div>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:min-w-[320px]'>
          <input
            type='text'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder='Search by product title...'
            className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={() => setSearchTerm(searchInput.trim())}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm'
            >
              Search
            </button>
            {(searchTerm || categoryFilter) && (
              <button
                type='button'
                onClick={() => {
                  setSearchInput('')
                  setSearchTerm('')
                  setCategoryFilter('')
                }}
                className='px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-100 transition-colors text-sm'
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
      <div className={`flex flex-col gap-2 ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className={`hidden md:grid ${GRID_COLS} items-center py-1 px-2 border bg-gray-100 text-sm`}>
          <b>Image</b>
          <b>Name</b>
          <b className='flex items-center gap-0.5'>
            Category
            <CategoryFilter
              categories={categoryOptions}
              value={categoryFilter}
              onChange={handleCategoryFilter}
            />
          </b>
          <b>Price</b>
          <b className='flex items-center gap-0.5'>
            修改时间
            <SortArrows column='updatedAt' sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
          </b>
          <b className='text-center'>Action</b>
        </div>
        {list && list.length > 0 ? (
          list.map((item) => (
            <div
              className={`grid ${GRID_COLS} items-center gap-2 py-1 px-2 border bg-gray-100 text-sm`}
              key={item._id}
            >
              <Link to={`/single/${item._id}`}>
                <img className='w-20' src={item.image[0]} alt='' />
              </Link>
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{currency}{item.price}</p>
              <p className='text-gray-600 text-xs whitespace-nowrap'>{formatModifiedTime(item)}</p>
              <p
                onClick={() => { removeProduct(item._id) }}
                className='text-right md:text-center cursor-pointer text-lg'
              >
                X
              </p>
            </div>
          ))
        ) : (
          <div className='text-center py-8'>
            <p className='text-gray-600'>No products found</p>
          </div>
        )}
        {renderPagination()}
      </div>
    </>
  )
}

export default List
