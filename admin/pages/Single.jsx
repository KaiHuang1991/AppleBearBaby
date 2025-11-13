import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl as defaultBackendUrl } from '../src/App.jsx'
import { assets } from '../src/admin_assets/assets'
import RichTextEditor from '../components/RichTextEditor'

const Single = ({ token, backendUrl: propBackendUrl }) => {
  const backendUrl = propBackendUrl || defaultBackendUrl || 'http://localhost:4000'
  const { productId } = useParams()

  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [thirdCategory, setThirdCategory] = useState('')
  const [mainCategoryId, setMainCategoryId] = useState('')
  const [subCategoryId, setSubCategoryId] = useState('')
  const [thirdCategoryId, setThirdCategoryId] = useState('')
  const [categoryOptions, setCategoryOptions] = useState([])
  const [attributeValues, setAttributeValues] = useState({})
  const [bestseller, setBestseller] = useState(false)
  const defaultSizes = useMemo(() => ['Standard Mouth', 'Wide Mouth', 'S', 'M', 'L'], [])
  const [availableSizes, setAvailableSizes] = useState(defaultSizes)
  const [sizes, setSizes] = useState([])
  const [newSizeInput, setNewSizeInput] = useState('')
  const [loadingProduct, setLoadingProduct] = useState(true)

  const image2Ref = useRef(null)
  const image3Ref = useRef(null)
  const image4Ref = useRef(null)

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/categories`)
      if (data.success) {
        const normalized = (data.categories || []).map(cat => ({
          ...cat,
          _id: String(cat._id),
          parent: cat.parent ? String(cat.parent) : null
        }))
        setCategoryOptions(normalized)
      }
    } catch (error) {
      console.error('Failed to load categories', error)
      toast.error(error.response?.data?.message || 'Failed to load categories')
    }
  }

  const syncCategoriesFromProducts = async () => {
    if (!token) return
    try {
      await axios.post(`${backendUrl}/api/categories/sync`, {}, { headers: { token } })
    } catch (error) {
      console.warn('Category sync warning:', error.response?.data?.message || error.message)
    }
  }

  const fetchProduct = async () => {
    setLoadingProduct(true)
    try {
      const apiUrl = backendUrl || 'http://localhost:4000'
      const response = await axios.post(apiUrl + '/api/product/single', { productId }, { headers: { token } })
      const product = response.data.product
      if (!product) {
        toast.error('Product not found')
        return
      }
      setImage1(product.image?.[0] || false)
      setImage2(product.image?.[1] || false)
      setImage3(product.image?.[2] || false)
      setImage4(product.image?.[3] || false)
      setName(product.name || '')
      setDescription(product.description || '')
      setPrice(product.price || '')
      const resolvedCategoryId = product.categoryId ? String(product.categoryId._id || product.categoryId) : ''
      const resolvedSubCategoryId = product.subCategoryId ? String(product.subCategoryId._id || product.subCategoryId) : ''
      const resolvedThirdCategoryId = product.thirdCategoryId ? String(product.thirdCategoryId._id || product.thirdCategoryId) : ''

      const resolvedCategoryName = product.category || product.categoryId?.name || ''
      const resolvedSubCategoryName = product.subCategory || product.subCategoryId?.name || ''
      const resolvedThirdCategoryName = product.thirdCategory || product.thirdCategoryId?.name || ''

      setCategory(resolvedCategoryName)
      setSubCategory(resolvedSubCategoryName)
      setThirdCategory(resolvedThirdCategoryName)
      setMainCategoryId(resolvedCategoryId)
      setSubCategoryId(resolvedSubCategoryId)
      setThirdCategoryId(resolvedThirdCategoryId)
      const attrValues = {}
      if (Array.isArray(product.attributes)) {
        product.attributes.forEach(item => {
          const attr = item.attribute || item.attributeId || item.id
          const attrId = typeof attr === 'object' ? attr._id : attr
          if (attrId && item.value) {
            attrValues[String(attrId)] = item.value
          }
        })
      }
      setAttributeValues(attrValues)
      const sizeList = Array.isArray(product.sizes) ? product.sizes : []
      setSizes(sizeList)
      setAvailableSizes(prev => Array.from(new Set([...prev, ...sizeList])))
      setBestseller(!!product.bestseller)
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    } finally {
      setLoadingProduct(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      await syncCategoriesFromProducts()
      await fetchCategories()
      await fetchProduct()
    }
    init()
  }, [])

  useEffect(() => {
    if (!categoryOptions.length) return

    if (mainCategoryId) {
      const main = categoryOptions.find(cat => cat._id === String(mainCategoryId))
      if (main && category !== main.name) setCategory(main.name)
    } else if (category) {
      const mainByName = categoryOptions.find(cat => !cat.parent && cat.name === category)
      if (mainByName) setMainCategoryId(mainByName._id)
    }

    if (subCategoryId) {
      const sub = categoryOptions.find(cat => cat._id === String(subCategoryId))
      if (sub && subCategory !== sub.name) setSubCategory(sub.name)
    } else if (subCategory && mainCategoryId) {
      const subByName = categoryOptions.find(cat => cat.parent === String(mainCategoryId) && cat.name === subCategory)
      if (subByName) setSubCategoryId(subByName._id)
    }

    if (thirdCategoryId) {
      const third = categoryOptions.find(cat => cat._id === String(thirdCategoryId))
      if (third && thirdCategory !== third.name) setThirdCategory(third.name)
    } else if (thirdCategory && subCategoryId) {
      const thirdByName = categoryOptions.find(cat => cat.parent === String(subCategoryId) && cat.name === thirdCategory)
      if (thirdByName) setThirdCategoryId(thirdByName._id)
    }
  }, [categoryOptions, mainCategoryId, subCategoryId, thirdCategoryId, category, subCategory, thirdCategory])

  const handleMainCategoryChange = (value) => {
    setMainCategoryId(value)
    const selected = categoryOptions.find(cat => cat._id === value)
    setCategory(selected?.name || '')
    setSubCategoryId('')
    setSubCategory('')
    setThirdCategoryId('')
    setThirdCategory('')
    setAttributeValues({})
  }

  const handleSubCategoryChange = (value) => {
    setSubCategoryId(value)
    const selected = categoryOptions.find(cat => cat._id === value)
    setSubCategory(selected?.name || '')
    setThirdCategoryId('')
    setThirdCategory('')
    setAttributeValues({})
  }

  const handleThirdCategoryChange = (value) => {
    setThirdCategoryId(value)
    const selected = categoryOptions.find(cat => cat._id === value)
    setThirdCategory(selected?.name || '')
    setAttributeValues({})
  }

  const updateProducts = async (e) => {
    try {
      e.preventDefault()
      const formData = new FormData()
      formData.append('product_id', productId)
      formData.append('name', name)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('category', category)
      formData.append('subCategory', subCategory)
      formData.append('thirdCategory', thirdCategory)
      if (mainCategoryId) formData.append('categoryId', mainCategoryId)
      if (subCategoryId) formData.append('subCategoryId', subCategoryId)
      if (thirdCategoryId) formData.append('thirdCategoryId', thirdCategoryId)
      formData.append('bestseller', bestseller)
      formData.append('sizes', JSON.stringify(sizes))
      const attributePayload = Object.entries(attributeValues)
        .filter(([_, value]) => value && value.trim())
        .map(([attributeId, value]) => ({ attributeId, value: value.trim() }))
      formData.append('attributes', JSON.stringify(attributePayload))
      formData.append('image1', image1)
      if (image2) formData.append('image2', image2)
      if (image3) formData.append('image3', image3)
      if (image4) formData.append('image4', image4)

      const apiUrl = backendUrl || 'http://localhost:4000'
      const response = await axios.post(apiUrl + '/api/product/update', formData, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message || 'Failed to update product')
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  const attributesSelectorProps = {
    mainCategoryId,
    subCategoryId,
    thirdCategoryId,
    categoryOptions,
    attributeValues,
    onChange: setAttributeValues,
  }

  if (loadingProduct && !image1) {
    return <p className='text-gray-500 text-sm'>Loading product...</p>
  }

  return (
    <form onSubmit={updateProducts} className='flex flex-col w-full items-start gap-3'>
      <div className='w-full'>
        <p className='mb-2'>Upload Images (最多4张，点击图片可单独更换)</p>
        <div className='flex gap-4 overflow-x-auto pb-2' style={{ scrollbarWidth: 'thin' }}>
          {[1, 2, 3, 4].map(index => {
            const imgState = [image1, image2, image3, image4][index - 1]
            const setImageState = [setImage1, setImage2, setImage3, setImage4][index - 1]
            const inputId = `image${index}`
            const ref = index === 2 ? image2Ref : index === 3 ? image3Ref : index === 4 ? image4Ref : null
            return (
              <label key={index} htmlFor={inputId} className='relative group cursor-pointer flex-shrink-0'>
                <img
                  className='w-32 h-32 object-cover rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-colors shadow-sm'
                  src={!imgState ? assets.upload_area : (typeof imgState === 'string' ? imgState : URL.createObjectURL(imgState))}
                  alt={`Product ${index}`}
                />
                <input
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    updateImg(file, index)
                  }}
                  type='file'
                  id={inputId}
                  accept='image/*'
                  hidden
                  ref={ref}
                />
                {imgState && index !== 1 && (
                  <button
                    type='button'
                    onClick={(e) => { e.preventDefault(); updateImg(null, index); setImageState(false) }}
                    className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-md'
                  >
                    ×
                  </button>
                )}
                <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-sm text-center py-1.5 rounded-b-lg'>
                  图片 {index}
                </div>
              </label>
            )
          })}
        </div>
        <p className='text-xs text-gray-500 mt-2'>💡 提示：点击图片可单独更换，鼠标悬停在图片上点击 × 可删除（主图不可删除）</p>
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product Name</p>
        <input onChange={(e) => { setName(e.target.value) }} value={name} className='w-full max-w-[500px] px-3 py-2 border border-gray-300 rounded-lg' type='text' placeholder='Type here' required />
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product Description (Rich Text Editor)</p>
        <div className='w-full max-w-[900px]'>
          <RichTextEditor value={description} onChange={setDescription} token={token} backendUrl={backendUrl} />
        </div>
        <p className='text-xs text-gray-500 mt-2 max-w-[900px]'>💡 Tip: Use the toolbar to format text, add images, create lists, and customize your product description layout.</p>
      </div>

      {/* 所有分类选择在同一行 */}
      <div className='w-full'>
        <p className='mb-2'>Product Categories</p>
        <div className='flex flex-col sm:flex-row gap-3 w-full'>
          {/* 主类目 */}
          <div className='flex-1'>
            <select value={mainCategoryId} onChange={(e) => handleMainCategoryChange(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-lg'>
              <option value=''>Main Category</option>
              {categoryOptions.filter(cat => !cat.parent).map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* 子类目 - 主类目选择后显示 */}
          {mainCategoryId && (
            <div className='flex-1'>
              <select value={subCategoryId} onChange={(e) => handleSubCategoryChange(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-lg'>
                <option value=''>---</option>
                {categoryOptions
                  .filter(cat => cat.parent && cat.parent === String(mainCategoryId))
                  .map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
              </select>
            </div>
          )}

          {/* 三级分类 - 子类目选择后显示 */}
          {subCategoryId && (
            <div className='flex-1'>
              <select value={thirdCategoryId} onChange={(e) => handleThirdCategoryChange(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-lg'>
                <option value=''>---</option>
                {categoryOptions
                  .filter(cat => cat.parent && cat.parent === String(subCategoryId))
                  .map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product Price</p>
        <input onChange={(e) => { setPrice(e.target.value) }} value={price} className='w-full max-w-[300px] px-3 py-2 border border-gray-300 rounded-lg' type='number' placeholder='25' required />
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product Attributes</p>
        <AttributesSelector
          mainCategoryId={mainCategoryId}
          subCategoryId={subCategoryId}
          thirdCategoryId={thirdCategoryId}
          categoryOptions={categoryOptions}
          attributeValues={attributeValues}
          onChange={setAttributeValues}
        />
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product Sizes</p>
        <div className='flex flex-wrap gap-2'>
          {availableSizes.map(sizeLabel => {
            const selected = sizes.includes(sizeLabel)
            return (
              <div key={sizeLabel} className='relative group'>
                <button
                  type='button'
                  onClick={() => setSizes(prev => prev.includes(sizeLabel) ? prev.filter(item => item !== sizeLabel) : [...prev, sizeLabel])}
                  className={`px-3 py-1 rounded-full border transition-all ${selected ? 'bg-pink-100 border-pink-300 text-pink-700' : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                >
                  {sizeLabel}
                </button>
                {availableSizes.length > 1 && (
                  <button
                    type='button'
                    onClick={() => {
                      setAvailableSizes(prev => prev.filter(size => size !== sizeLabel))
                      setSizes(prev => prev.filter(size => size !== sizeLabel))
                    }}
                    className='absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full w-5 h-5 text-[10px] text-gray-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600'
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <div className='flex items-center gap-2 mt-3'>
          <input
            type='text'
            value={newSizeInput}
            onChange={(e) => setNewSizeInput(e.target.value)}
            placeholder='Add new size (e.g. XL)'
            className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <button
            type='button'
            onClick={() => {
              const trimmed = newSizeInput.trim()
              if (!trimmed) return
              if (availableSizes.includes(trimmed)) {
                toast.info('Size already exists')
                return
              }
              setAvailableSizes(prev => [...prev, trimmed])
              setSizes(prev => [...prev, trimmed])
              setNewSizeInput('')
            }}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Add Size
          </button>
        </div>
      </div>

      <div className='flex gap-2 mt-2'>
        <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type='checkbox' id='bestseller' />
        <label className='cursor-pointer' htmlFor='bestseller'>Add to bestSeller</label>
      </div>

      <button className='w-32 py-3 mt-4 bg-black text-white cursor-pointer rounded-lg hover:bg-gray-900 transition-colors' type='submit'>Update Product</button>
    </form>
  )
}

const AttributesSelector = ({ mainCategoryId, subCategoryId, thirdCategoryId, categoryOptions, attributeValues, onChange }) => {
  const categoryMap = useMemo(() => {
    const map = {}
    categoryOptions.forEach(cat => {
      map[cat._id] = cat
    })
    return map
  }, [categoryOptions])

  const mainCategory = mainCategoryId ? categoryMap[mainCategoryId] : null
  const subCategory = subCategoryId ? categoryMap[subCategoryId] : null
  const thirdCategory = thirdCategoryId ? categoryMap[thirdCategoryId] : null

  const availableAttributes = useMemo(() => {
    const ordered = []
    const seen = new Set()

    const pushAttributes = (category) => {
      if (category?.attributes) {
        category.attributes.forEach(attr => {
          if (!attr) return
          const id = attr._id || attr.id || attr
          if (!id || seen.has(String(id))) return
          seen.add(String(id))
          ordered.push(attr)
        })
      }
    }

    pushAttributes(mainCategory)
    pushAttributes(subCategory)
    pushAttributes(thirdCategory)

    return ordered
  }, [mainCategory, subCategory, thirdCategory])

  if (!mainCategory && !subCategory && !thirdCategory) {
    return <p className='text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded-lg px-3 py-2'>Select a category to see available attributes.</p>
  }

  if (!availableAttributes.length) {
    return <p className='text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded-lg px-3 py-2'>No attributes defined for this category yet. Add attributes from the Categories page.</p>
  }

  return (
    <div className='flex flex-col gap-2'>
      {availableAttributes.map(attribute => {
        const rawId = attribute._id || attribute.id
        if (!rawId) return null
        const id = String(rawId)
        const value = attributeValues[id] || ''
        const color = attribute.color || '#3b82f6'
        const handleChange = (nextValue) => {
          onChange(prev => {
            const next = { ...prev }
            if (nextValue && nextValue.trim()) {
              next[id] = nextValue
            } else {
              delete next[id]
            }
            return next
          })
        }
        return (
          <div
            key={id}
            className='inline-flex items-center gap-3 px-4 py-1.5 rounded-full border shadow-sm bg-white'
            style={{ borderColor: color, boxShadow: `0 0 0 1px ${color}20` }}
          >
            <span className='text-sm font-medium' style={{ color }}>{attribute.label || attribute.name}</span>
            <input
              type='text'
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={`Enter ${attribute.label || attribute.name}`}
              className='bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-300'
            />
            {value && (
              <button
                type='button'
                onClick={() => handleChange('')}
                className='text-xs text-gray-400 hover:text-gray-600'
              >
                ×
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Single
