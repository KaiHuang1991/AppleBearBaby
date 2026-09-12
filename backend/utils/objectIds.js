import mongoose from 'mongoose'

export function normalizeObjectIds(value) {
  const list = Array.isArray(value) ? value : value ? [value] : []
  return [...new Set(
    list
      .map((item) => {
        if (!item) return ''
        if (typeof item === 'object') return String(item._id || item.id || '')
        return String(item)
      })
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
  )]
}
