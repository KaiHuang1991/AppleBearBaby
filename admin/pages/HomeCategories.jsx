import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl as defaultBackendUrl } from '../src/App.jsx'

const flattenCategories = (nodes, depth = 0) => {
  if (!Array.isArray(nodes)) return []
  return nodes.reduce((acc, node) => {
    acc.push({
      id: String(node._id || node.id || ''),
      name: node.name,
      depth,
    })
    if (node.children?.length) {
      acc.push(...flattenCategories(node.children, depth + 1))
    }
    return acc
  }, [])
}

const emptyForm = {
  categoryId: '',
  title: '',
  imageUrl: '',
  order: 0,
  isActive: true,
}

const HomeCategories = ({ token, backendUrl: propBackendUrl }) => {
  const backendUrl = propBackendUrl || defaultBackendUrl
  const [loading, setLoading] = useState(true)
  const [tiles, setTiles] = useState([])
  const [flatCategories, setFlatCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  const usedCategoryIds = useMemo(
    () => new Set(tiles.filter((tile) => tile.isActive !== false).map((tile) => String(tile.categoryId))),
    [tiles]
  )

  const fetchTiles = async () => {
    setLoading(true)
    try {
      const [homeRes, catRes] = await Promise.all([
        axios.get(`${backendUrl}/api/home-categories/admin`, { headers: { token } }),
        axios.get(`${backendUrl}/api/categories`),
      ])
      if (homeRes.data?.success) {
        setTiles(homeRes.data.tiles || [])
      }
      if (catRes.data?.success) {
        setFlatCategories(flattenCategories(catRes.data.tree || []))
      }
    } catch (error) {
      console.error('Failed to load homepage categories', error)
      toast.error(error.response?.data?.message || 'Failed to load homepage categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTiles()
  }, [])

  const openAdd = () => {
    setFormData({ ...emptyForm, order: tiles.length })
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (tile) => {
    setFormData({
      categoryId: String(tile.categoryId || ''),
      title: tile.title || '',
      imageUrl: tile.imageUrl || '',
      order: tile.order || 0,
      isActive: tile.isActive !== false,
    })
    setEditingId(tile._id)
    setShowForm(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!formData.categoryId) {
      toast.error('Pick a catalog category')
      return
    }
    try {
      if (editingId) {
        const response = await axios.put(
          `${backendUrl}/api/home-categories/tile/${editingId}`,
          formData,
          { headers: { token } }
        )
        if (!response.data?.success) {
          toast.error(response.data?.message || 'Failed to update')
          return
        }
        toast.success('Homepage category updated')
      } else {
        const response = await axios.post(
          `${backendUrl}/api/home-categories/tile`,
          formData,
          { headers: { token } }
        )
        if (!response.data?.success) {
          toast.error(response.data?.message || 'Failed to add')
          return
        }
        toast.success('Added to homepage')
      }
      setShowForm(false)
      setEditingId(null)
      fetchTiles()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save homepage category')
    }
  }

  const handleDelete = async (tile) => {
    if (!window.confirm(`Remove “${tile.title}” from the homepage? This does not delete the catalog category.`)) {
      return
    }
    try {
      const response = await axios.delete(`${backendUrl}/api/home-categories/tile/${tile._id}`, {
        headers: { token },
      })
      if (response.data?.success) {
        toast.success(response.data.message || 'Removed from homepage')
        fetchTiles()
      } else {
        toast.error(response.data?.message || 'Failed to remove')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove')
    }
  }

  const handleMove = async (index, direction) => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1
    if (nextIndex < 0 || nextIndex >= tiles.length) return
    const nextTiles = [...tiles]
    ;[nextTiles[index], nextTiles[nextIndex]] = [nextTiles[nextIndex], nextTiles[index]]
    const ordered = nextTiles.map((tile, order) => ({ ...tile, order }))
    setTiles(ordered)
    try {
      await axios.put(
        `${backendUrl}/api/home-categories/reorder`,
        { tiles: ordered.map((tile) => ({ _id: tile._id, order: tile.order })) },
        { headers: { token } }
      )
    } catch (error) {
      toast.error('Failed to save order')
      fetchTiles()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Homepage Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            These tiles appear on the storefront home slider. Removing a tile does not delete the wholesale catalog node.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add category
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{editingId ? 'Edit homepage tile' : 'Add homepage tile'}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catalog category *</label>
              <select
                value={formData.categoryId}
                onChange={(event) => {
                  const categoryId = event.target.value
                  const match = flatCategories.find((cat) => cat.id === categoryId)
                  setFormData((prev) => ({
                    ...prev,
                    categoryId,
                    title: prev.title || match?.name || '',
                  }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a category</option>
                {flatCategories.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    disabled={!editingId && usedCategoryIds.has(cat.id)}
                  >
                    {`${'— '.repeat(cat.depth)}${cat.name}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Bottle Nipples"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover image URL (Cloudinary)</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(event) => setFormData({ ...formData, imageUrl: event.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://res.cloudinary.com/..."
              />
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="" className="mt-3 h-24 w-24 object-cover rounded border" />
              ) : null}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })}
                className="w-4 h-4"
              />
              <span>Show on homepage</span>
            </label>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                {editingId ? 'Update tile' : 'Add tile'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Tiles ({tiles.length})</h2>
        {tiles.length === 0 ? (
          <p className="text-gray-500">No homepage categories yet. Add tiles from the catalog tree.</p>
        ) : (
          <div className="space-y-4">
            {tiles.map((tile, index) => (
              <div
                key={tile._id}
                className={`border-2 rounded-lg p-4 ${tile.isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 flex-shrink-0 bg-white rounded border overflow-hidden">
                    {tile.imageUrl ? (
                      <img src={tile.imageUrl} alt={tile.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800">{tile.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Catalog: {tile.categoryName} · /collection/{tile.slug}
                    </p>
                    <p className="text-xs mt-1">
                      {tile.comingSoon ? (
                        <span className="text-amber-700">Coming soon (0 SKUs)</span>
                      ) : (
                        <span className="text-green-700">{tile.productCount} SKU{tile.productCount === 1 ? '' : 's'}</span>
                      )}
                      {tile.isActive ? '' : ' · Hidden'}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button type="button" onClick={() => handleMove(index, 'up')} disabled={index === 0} className="px-3 py-1 text-sm border rounded disabled:opacity-40">
                        Up
                      </button>
                      <button type="button" onClick={() => handleMove(index, 'down')} disabled={index === tiles.length - 1} className="px-3 py-1 text-sm border rounded disabled:opacity-40">
                        Down
                      </button>
                      <button type="button" onClick={() => openEdit(tile)} className="px-3 py-1 text-sm border rounded">
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(tile)} className="px-3 py-1 text-sm border rounded text-red-600">
                        Remove from homepage
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomeCategories
