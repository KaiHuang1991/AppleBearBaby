import React, { useEffect, useMemo, useState } from 'react'
import { assets } from '../src/admin_assets/assets'
import axios from 'axios'
import { backendUrl as defaultBackendUrl } from '../src/App.jsx'
import { toast } from 'react-toastify'
import RichTextEditor from '../components/RichTextEditor'
import LanguageTabs from '../components/LanguageTabs'
import AttributesSelector from '../components/AttributesSelector'
import { emptyProductTranslations, setTranslationMapValue } from '../src/productI18n'

const Add = ({ token, backendUrl: propBackendUrl }) => {
  const backendUrl = propBackendUrl || defaultBackendUrl
  const [images, setImages] = useState([]) // 改用数组存储多张图片
  const [name, setName] = useState('')
  const [modelNumber, setModelNumber] = useState('')
  const [description, setDescription] = useState('')
  const [contentLocale, setContentLocale] = useState('en')
  const [translations, setTranslations] = useState(emptyProductTranslations)
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
      return data
    } catch (error) {
      console.error('Failed to load categories', error)
      toast.error(error.response?.data?.message || 'Failed to load categories')
      throw error
    }
  }

  const syncCategoriesFromProducts = async () => {
    if (!token) return
    try {
      await axios.post(`${backendUrl}/api/categories/sync`, {}, { headers: { token } })
    } catch (error) {
      if (error.response?.status && error.response.status < 500) {
        console.error('Sync categories warning:', error.response.data?.message)
      } else {
        console.error('Failed to sync categories', error)
      }
    }
  }

  useEffect(() => {
    const init = async () => {
      await syncCategoriesFromProducts()
      await fetchCategories()
    }
    init()
  }, [])

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

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault()
      if (!name.trim()) {
        toast.error('English product title is required')
        setContentLocale('en')
        return
      }
      const englishDescriptionText = String(description || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').trim()
      if (!englishDescriptionText) {
        toast.error('English product description is required')
        setContentLocale('en')
        return
      }
      const formData = new FormData()

      formData.append("name", name)
      formData.append("modelNumber", modelNumber.trim())
      formData.append("description", description)
      formData.append('translations', JSON.stringify(translations))
      formData.append("price", price)
      formData.append("category", category)
      formData.append("subCategory", subCategory)
      formData.append("thirdCategory", thirdCategory)
      if (mainCategoryId) {
        formData.append('categoryId', mainCategoryId)
      }
      if (subCategoryId) {
        formData.append('subCategoryId', subCategoryId)
      }
      if (thirdCategoryId) {
        formData.append('thirdCategoryId', thirdCategoryId)
      }
      formData.append("bestseller", bestseller) 
      formData.append("sizes", JSON.stringify(sizes))
      const attributePayload = Object.entries(attributeValues)
        .filter(([_, value]) => value && value.trim())
        .map(([attributeId, value]) => ({ attributeId, value: value.trim() }))
      formData.append('attributes', JSON.stringify(attributePayload))

      // 添加所有选中的图片
      images.forEach((image, index) => {
        formData.append(`image${index + 1}`, image)
      })

      const apiUrl = backendUrl
      const response = await axios.post(apiUrl + "/api/product/add", formData, { headers: { token } })

      console.log(response.data)
      if (response.data.success) {
        toast.success(response.data.message)
        setImages([]) // 重置图片数组
        setName('')
        setModelNumber('')
        setDescription('')
        setTranslations(emptyProductTranslations())
        setContentLocale('en')
        setPrice('')
        setSizes([])
        setMainCategoryId('')
        setSubCategoryId('')
        setCategory('')
        setSubCategory('')
        setAttributeValues({})
      }else{
        toast.error(response.data.message)
      }
      
    } catch (error) {
      console.log(error);
      toast.error(error.message)

    }

  }

  // 处理多文件选择
  const handleMultipleImages = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const MAX_IMAGES = 4
    const remainingSlots = MAX_IMAGES - images.length

    if (remainingSlots <= 0) {
      toast.warn('最多只能上传 4 张图片，请先删除已有图片再添加新的。')
      e.target.value = ''
      return
    }

    const filesToAdd = files.slice(0, remainingSlots)
    if (filesToAdd.length) {
      setImages(prev => [...prev, ...filesToAdd])
      toast.success(`成功添加 ${filesToAdd.length} 张图片${files.length > remainingSlots ? '（多余的图片已自动忽略）' : ''}`)
    }

    if (files.length > remainingSlots) {
      toast.info(`已达到上传上限，仅保留前 ${remainingSlots} 张。`)
    }

    e.target.value = ''
  }

  // 删除单张图片
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    toast.info('已删除图片')
  }

  // 移动图片顺序
  const moveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= images.length) return
    setImages(prev => {
      const updated = [...prev]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      return updated
    })
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <div className='w-full'>
        <p className='mb-2'>Upload Images (最多4张)</p>
        <div className='flex gap-4 overflow-x-auto pb-2' style={{ scrollbarWidth: 'thin' }}>
          {/* 已上传的图片预览 */}
          {images.map((image, index) => (
            <DraggableImage
              key={index}
              index={index}
              total={images.length}
              image={image}
              moveImage={moveImage}
              removeImage={removeImage}
            />
          ))}
          
          {/* 上传按钮 - 只在少于4张时显示 */}
          {images.length < 4 && (
            <label htmlFor="images" className='cursor-pointer flex-shrink-0'>
              <div className='w-32 h-32 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors'>
                <img className='w-16' src={assets.upload_area} alt="Upload" />
                <p className='text-xs text-gray-500 mt-2'>点击上传</p>
              </div>
              <input 
                onChange={handleMultipleImages} 
                type="file" 
                id='images' 
                multiple 
                accept="image/*"
                hidden 
              />
            </label>
          )}
        </div>
        <p className='text-xs text-gray-500 mt-2 leading-relaxed'>
          💡 提示：可一次选择多张图片（最多4张），点击图片右上角 × 可删除。拖拽预览图即可调整显示顺序。
        </p>
      </div>
      <div className='w-full'>
        <p className='mb-2'>Product Name & Description</p>
        <LanguageTabs value={contentLocale} onChange={setContentLocale} />
        <p className='text-xs text-gray-500 mb-2'>
          English is required. Other languages can stay empty — the storefront shows English for any blank name, description, attribute, or size.
        </p>
        {contentLocale === 'en' ? (
          <>
            <input onChange={(e) => { setName(e.target.value) }} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='English title' required />
          </>
        ) : (
          <input
            onChange={(e) => setTranslations((prev) => ({
              ...prev,
              [contentLocale]: { ...prev[contentLocale], name: e.target.value },
            }))}
            value={translations[contentLocale]?.name || ''}
            className='w-full max-w-[500px] px-3 py-2'
            type="text"
            placeholder={`${contentLocale.toUpperCase()} title (optional, falls back to English)`}
          />
        )}
      </div>
      <div className='w-full'>
        <p className='mb-2'>Model (optional)</p>
        <input
          onChange={(e) => setModelNumber(e.target.value)}
          value={modelNumber}
          className='w-full max-w-[500px] px-3 py-2 border border-gray-300 rounded-lg'
          type='text'
          placeholder='e.g. 8007E'
        />
      </div>
      <div className='w-full'>
        <p className='mb-2'>Product Description (Rich Text Editor)</p>
        <div className='w-full max-w-[900px]'>
          <RichTextEditor
            value={contentLocale === 'en' ? description : (translations[contentLocale]?.description || '')}
            onChange={(value) => {
              if (contentLocale === 'en') setDescription(value)
              else setTranslations((prev) => ({
                ...prev,
                [contentLocale]: { ...prev[contentLocale], description: value },
              }))
            }}
            token={token}
            backendUrl={backendUrl}
          />
        </div>
        <p className='text-xs text-gray-500 mt-2 max-w-[900px]'>
          💡 Tip: Use the toolbar to format text, add images, create lists, and customize your product description layout.
        </p>
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
          locale={contentLocale}
          translations={translations}
          onTranslationsChange={(loc, id, value) => {
            setTranslations((prev) => setTranslationMapValue(prev, loc, 'attributes', id, value))
          }}
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
        {contentLocale !== 'en' && sizes.length > 0 ? (
          <div className='mt-3 space-y-2 max-w-[500px]'>
            <p className='text-xs text-gray-500'>
              Optional {contentLocale.toUpperCase()} size labels. Empty uses the English name.
            </p>
            {sizes.map((sizeLabel) => (
              <div key={sizeLabel} className='flex items-center gap-2'>
                <span className='w-40 shrink-0 text-sm text-gray-500 truncate'>{sizeLabel}</span>
                <input
                  type='text'
                  value={translations[contentLocale]?.sizes?.[sizeLabel] || ''}
                  onChange={(e) => setTranslations((prev) => setTranslationMapValue(prev, contentLocale, 'sizes', sizeLabel, e.target.value))}
                  placeholder={sizeLabel}
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-lg'
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className='flex gap-2 mt-2'>
        <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id="bestseller" />
        <label className='cursor-pointer' htmlFor="bestseller">Add to bestSeller</label>
      </div>
      <button className='w-28 py-3 mt-4 bg-black text-white cursor-pointer' type='submit'>ADD</button>
    </form>
  )
}

export default Add

const DraggableImage = ({ image, index, total, moveImage, removeImage }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const fromIndex = Number(e.dataTransfer.getData('text/plain'))
    if (Number.isNaN(fromIndex) || fromIndex === index) return
    moveImage(fromIndex, index)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className='relative group flex-shrink-0 cursor-move'
    >
      <img
        className='w-32 h-32 object-cover rounded-lg border-2 border-gray-300 shadow-sm'
        src={URL.createObjectURL(image)}
        alt={`Product ${index + 1}`}
      />
      <button
        type='button'
        onClick={() => removeImage(index)}
        className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover: opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10'
      >
        ×
      </button>
      <div className='absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm text-center py-1.5 rounded-b-lg'>
        图片 {index + 1}
      </div>
      <div className='absolute inset-0 rounded-lg border border-transparent group-hover:border-blue-500 group-active:border-blue-600 transition-colors pointer-events-none'></div>
    </div>
  )
}
