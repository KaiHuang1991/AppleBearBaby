import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../src/App.jsx'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

const List = ({ token, currency }) => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  })
  const limit = 20
  
  const fetchList = useCallback(async (targetPage = 1, overrideSearch) => {
    try {
      setLoading(true)
      const apiUrl = backendUrl || 'http://localhost:4000'
      const response = await axios.get(apiUrl + '/api/product/list', {
        params: {
          page: targetPage,
          limit,
          search: overrideSearch !== undefined ? overrideSearch : searchTerm || undefined,
        },
        headers: { token }
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
  }, [token, limit, searchTerm])
  
  const removeProduct = async (id) => {
    try {
      const confirmation = window.confirm("Are you Sure to Delete?")
      if (confirmation) {
        const apiUrl = backendUrl || 'http://localhost:4000'
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
      } else {
        return
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }
  useEffect(() => {
    fetchList(1)
  }, [fetchList])
  
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
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
              onClick={() => {
                setSearchTerm(searchInput.trim())
                fetchList(1, searchInput.trim())
              }}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm'
            >
              Search
            </button>
            {searchTerm && (
              <button
                type='button'
                onClick={() => {
                  setSearchInput('')
                  setSearchTerm('')
                  fetchList(1, '')
                }}
                className='px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-100 transition-colors text-sm'
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className='text-center'>Action</b>
        </div>
        {/* ----product List------- */}
        {list && list.length > 0 ? (
          list.map((item, itemIndex) => (
            <div className='grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border bg-gray-100 text-sm' key={itemIndex}>
              <Link to={`/single/${item._id}`} ><img className='w-20' src={item.image[0]} alt="" /></Link>
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{currency}{item.price}</p>
              <p onClick={() => { removeProduct(item._id) }} className='text-right md:text-center cursor-pointer text-lg'>X</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No products found</p>
          </div>
        )}
        {renderPagination()}
      </div>
    </>
  )
}

export default List
