import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl as defaultBackendUrl } from '../src/App.jsx'

const flattenCategories = (nodes, depth = 0) => {
  return nodes.reduce((acc, node) => {
    acc.push({
      id: node._id,
      name: node.name,
      depth,
    })
    if (node.children && node.children.length) {
      acc.push(...flattenCategories(node.children, depth + 1))
    }
    return acc
  }, [])
}

const defaultAttributeForm = {
  attributeId: '',
  name: '',
  label: '',
  description: '',
  color: '#3b82f6',
}

const Categories = ({ token, backendUrl: propBackendUrl }) => {
  const backendUrl = propBackendUrl || defaultBackendUrl || 'http://localhost:4000'
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState([])
  const [tree, setTree] = useState([])
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const [attributeForm, setAttributeForm] = useState(defaultAttributeForm)
  const [attributeMode, setAttributeMode] = useState('add')
  const [attributeSubmitting, setAttributeSubmitting] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${backendUrl}/api/categories`)
      if (data.success) {
        setCategories(data.categories || [])
        setTree(data.tree || [])
        if (activeCategory) {
          const updated = (data.categories || []).find(cat => String(cat._id) === String(activeCategory._id))
          setActiveCategory(updated || null)
        }
      }
      return data
    } catch (error) {
      console.error('Failed to load categories', error)
      toast.error(error.response?.data?.message || 'Failed to load categories')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const syncCategories = async () => {
    try {
      await axios.post(`${backendUrl}/api/categories/sync`, {}, {
        headers: { token },
      })
    } catch (error) {
      if (error.response?.status !== 500) {
        console.error('Failed to sync categories', error)
      }
    }
  }

  useEffect(() => {
    const init = async () => {
      await syncCategories()
      await fetchCategories()
    }
    init()
  }, [])

  const options = useMemo(() => flattenCategories(tree), [tree])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Please enter a category name')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        parentId: parentId || null,
      }
      const { data } = await axios.post(`${backendUrl}/api/categories`, payload, {
        headers: { token },
      })
      if (data.success) {
        toast.success('Category created successfully')
        setName('')
        setParentId('')
        fetchCategories()
      } else {
        toast.error(data.message || 'Failed to create category')
      }
    } catch (error) {
      console.error('Failed to create category', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to create category')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAttributeSubmit = async (e) => {
    e.preventDefault()
    if (!activeCategory) return
    if (!attributeForm.name.trim() || !attributeForm.label.trim()) {
      toast.error('Attribute name and label are required')
      return
    }

    setAttributeSubmitting(true)
    try {
      const payload = {
        ...attributeForm,
        name: attributeForm.name.trim(),
        label: attributeForm.label.trim(),
      }
      let response
      if (attributeMode === 'edit' && attributeForm.attributeId) {
        response = await axios.put(`${backendUrl}/api/categories/${activeCategory._id}/attributes/${attributeForm.attributeId}`, payload, {
          headers: { token },
        })
      } else {
        response = await axios.post(`${backendUrl}/api/categories/${activeCategory._id}/attributes`, payload, {
          headers: { token },
        })
      }
      const { data } = response
      if (data.success) {
        toast.success(attributeMode === 'edit' ? 'Attribute updated' : 'Attribute added to category')
        setAttributeForm(defaultAttributeForm)
        setAttributeMode('add')
        const refreshed = await fetchCategories()
        if (refreshed?.categories) {
          const updated = refreshed.categories.find(cat => String(cat._id) === String(data.category?._id || activeCategory._id))
          setActiveCategory(updated || null)
        } else {
          setActiveCategory(null)
        }
      } else {
        toast.error(data.message || 'Failed to add attribute')
      }
    } catch (error) {
      console.error('Failed to submit attribute', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to save attribute')
    } finally {
      setAttributeSubmitting(false)
    }
  }

  const handleOpenAttributeForm = (category) => {
    setActiveCategory(category)
    setAttributeForm(defaultAttributeForm)
    setAttributeMode('add')
  }

  const handleEditAttribute = (category, attribute) => {
    setActiveCategory(category)
    setAttributeMode('edit')
    setAttributeForm({
      attributeId: attribute._id,
      name: attribute.name,
      label: attribute.label,
      description: attribute.description || '',
      color: attribute.color || '#3b82f6',
    })
  }

  const handleDeleteAttribute = async (categoryId, attributeId) => {
    if (!window.confirm('Remove this attribute from the category?')) return
    try {
      const { data } = await axios.delete(`${backendUrl}/api/categories/${categoryId}/attributes/${attributeId}`, {
        headers: { token },
      })
      if (data.success) {
        toast.success('Attribute removed')
        const refreshed = await fetchCategories()
        if (refreshed?.categories) {
          const updated = refreshed.categories.find(cat => String(cat._id) === String(categoryId))
          setActiveCategory(updated || null)
        }
      } else {
        toast.error(data.message || 'Failed to remove attribute')
      }
    } catch (error) {
      console.error('Failed to remove attribute', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to remove attribute')
    }
  }

  const handleRenameCategory = async (category) => {
    const newName = window.prompt('Enter new category name', category.name)
    if (!newName || !newName.trim()) return
    try {
      const { data } = await axios.put(`${backendUrl}/api/categories/${category._id}`, { name: newName.trim() }, {
        headers: { token },
      })
      if (data.success) {
        toast.success('Category renamed')
        await fetchCategories()
      } else {
        toast.error(data.message || 'Failed to rename category')
      }
    } catch (error) {
      console.error('Failed to rename category', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to rename category')
    }
  }

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return
    try {
      const { data } = await axios.delete(`${backendUrl}/api/categories/${category._id}`, {
        headers: { token },
      })
      if (data.success) {
        toast.success('Category deleted')
        await fetchCategories()
        if (activeCategory && String(activeCategory._id) === String(category._id)) {
          setActiveCategory(null)
          setAttributeForm(defaultAttributeForm)
          setAttributeMode('add')
        }
      } else {
        toast.error(data.message || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Failed to delete category', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to delete category')
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-semibold text-gray-800 mb-1'>Category Management</h2>
            <p className='text-sm text-gray-500'>Manage categories, attributes, and sync from existing products.</p>
          </div>
          <button
            type='button'
            onClick={async () => {
              await syncCategories()
              await fetchCategories()
              toast.success('Categories synced from existing products')
            }}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Sync from Products
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Category Name</label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. Feeding Bottle'
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Parent Category (optional)</label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>Main Category</option>
            {options.map(option => (
              <option key={option.id} value={option.id}>
                {`${' '.repeat(option.depth * 2)}${option.depth ? '└ ' : ''}${option.name}`}
              </option>
            ))}
          </select>
        </div>

        <button
          type='submit'
          disabled={submitting}
          className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60'
        >
          {submitting ? 'Saving...' : 'Add Category'}
        </button>
      </form>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>Existing Categories</h3>
        {loading ? (
          <p className='text-gray-500 text-sm'>Loading categories...</p>
        ) : tree.length === 0 ? (
          <p className='text-gray-500 text-sm'>No categories yet. Create your first category above.</p>
        ) : (
          <CategoryTree
            tree={tree}
            activeCategoryId={activeCategory?._id}
            onAddAttribute={handleOpenAttributeForm}
            onEditCategory={handleRenameCategory}
            onDeleteCategory={handleDeleteCategory}
            onEditAttribute={handleEditAttribute}
            onDeleteAttribute={handleDeleteAttribute}
          />
        )}
      </div>

      {activeCategory && (
        <form onSubmit={handleAttributeSubmit} className='bg-white rounded-xl shadow-sm border border-blue-200 p-6 space-y-4'>
          <div className='flex items-start justify-between'>
            <div>
              <h3 className='text-lg font-semibold text-gray-800'>
                {attributeMode === 'edit' ? `Edit Attribute (${attributeForm.label || attributeForm.name})` : `Add Attribute to ${activeCategory.name}`}
              </h3>
              <p className='text-sm text-gray-500'>Attributes created here will be available for products under this category.</p>
            </div>
            <button type='button' onClick={() => { setActiveCategory(null); setAttributeMode('add'); setAttributeForm(defaultAttributeForm) }} className='text-sm text-gray-400 hover:text-gray-600'>Close</button>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Attribute Name (unique)</label>
              <input
                value={attributeForm.name}
                onChange={(e) => setAttributeForm(prev => ({ ...prev, name: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='e.g. bpa_free'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Display Label</label>
              <input
                value={attributeForm.label}
                onChange={(e) => setAttributeForm(prev => ({ ...prev, label: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='e.g. BPA Free'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Tag Color</label>
              <input
                type='color'
                value={attributeForm.color}
                onChange={(e) => setAttributeForm(prev => ({ ...prev, color: e.target.value }))}
                className='w-20 h-10 border border-gray-300 rounded'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Description (optional)</label>
              <input
                value={attributeForm.description}
                onChange={(e) => setAttributeForm(prev => ({ ...prev, description: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Short description'
              />
            </div>
          </div>

          <div className='flex gap-3'>
            <button type='submit' disabled={attributeSubmitting} className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60'>
              {attributeSubmitting ? 'Saving...' : attributeMode === 'edit' ? 'Update Attribute' : 'Add Attribute'}
            </button>
            <button type='button' onClick={() => { setActiveCategory(null); setAttributeMode('add'); setAttributeForm(defaultAttributeForm) }} className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100'>Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}

const CategoryTree = ({
  tree,
  level = 0,
  onAddAttribute,
  onEditCategory,
  onDeleteCategory,
  onEditAttribute,
  onDeleteAttribute,
  activeCategoryId,
}) => {
  return (
    <ul className={level === 0 ? 'space-y-2' : 'space-y-1 pl-4 border-l border-dashed border-gray-300'}>
      {tree.map(node => (
        <li key={node._id} className={`text-sm text-gray-700 flex flex-col gap-2 ${String(activeCategoryId) === String(node._id) ? 'bg-blue-50 border border-blue-100 rounded-lg p-2' : ''}`}>
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='font-medium'>{node.name}</span>
            <button
              type='button'
              onClick={() => onEditCategory?.(node)}
              className='text-xs px-2 py-1 border border-gray-300 rounded-full hover:bg-gray-100'
            >
              Edit
            </button>
            <button
              type='button'
              onClick={() => onDeleteCategory?.(node)}
              className='text-xs px-2 py-1 border border-red-200 text-red-500 rounded-full hover:bg-red-50'
            >
              Delete
            </button>
            <button
              type='button'
              onClick={() => onAddAttribute?.(node)}
              className='text-xs px-2 py-1 border border-gray-300 rounded-full hover:bg-gray-100'
            >
              + Attribute
            </button>
          </div>
          {node.attributes && node.attributes.length > 0 && (
            <div className='flex flex-col gap-1 pl-2'>
              {node.attributes.map(attr => (
                <div
                  key={attr._id}
                  className='inline-flex items-center gap-2 px-2 py-1 rounded-full text-[11px] text-white shadow-sm'
                  style={{ backgroundColor: attr.color || '#3b82f6' }}
                  title={attr.description || ''}
                >
                  <span>{attr.label || attr.name}</span>
                  <button
                    type='button'
                    onClick={() => onEditAttribute?.(node, attr)}
                    className='text-white/80 hover:text-white text-[10px]'
                  >
                    ✎
                  </button>
                  <button
                    type='button'
                    onClick={() => onDeleteAttribute?.(node._id, attr._id)}
                    className='text-white/80 hover:text-white text-[10px]'
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {node.children && node.children.length > 0 && (
            <CategoryTree
              tree={node.children}
              level={level + 1}
              onAddAttribute={onAddAttribute}
              onEditCategory={onEditCategory}
              onDeleteCategory={onDeleteCategory}
              onEditAttribute={onEditAttribute}
              onDeleteAttribute={onDeleteAttribute}
              activeCategoryId={activeCategoryId}
            />
          )}
        </li>
      ))}
    </ul>
  )
}

export default Categories

