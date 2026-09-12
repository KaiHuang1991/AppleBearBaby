import React, { useMemo, useState } from 'react'

const RelatedPicker = ({
  label,
  hint,
  items = [],
  selectedIds = [],
  onChange,
  getId = (item) => String(item._id),
  getLabel,
  searchPlaceholder = 'Search…',
}) => {
  const [query, setQuery] = useState('')
  const selectedSet = useMemo(() => new Set(selectedIds.map(String)), [selectedIds])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => String(getLabel(item) || '').toLowerCase().includes(q))
  }, [items, query, getLabel])

  const selectedItems = useMemo(
    () => items.filter((item) => selectedSet.has(getId(item))),
    [items, selectedSet, getId]
  )

  const toggle = (id) => {
    const sid = String(id)
    if (selectedSet.has(sid)) {
      onChange(selectedIds.filter((value) => String(value) !== sid))
    } else {
      onChange([...selectedIds, sid])
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {hint ? <p className="text-xs text-gray-500 mb-2">{hint}</p> : null}
      {selectedItems.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedItems.map((item) => {
            const id = getId(item)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs border border-blue-200"
              >
                <span className="max-w-[220px] truncate">{getLabel(item)}</span>
                <span aria-hidden="true">×</span>
              </button>
            )
          })}
        </div>
      ) : null}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={searchPlaceholder}
        className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <p className="px-3 py-4 text-sm text-gray-500">No matches</p>
        ) : (
          filtered.map((item) => {
            const id = getId(item)
            const checked = selectedSet.has(id)
            return (
              <label key={id} className="flex items-start gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  checked={checked}
                  onChange={() => toggle(id)}
                />
                <span className={checked ? 'text-gray-900 font-medium' : 'text-gray-700'}>
                  {getLabel(item)}
                </span>
              </label>
            )
          })
        )}
      </div>
    </div>
  )
}

export default RelatedPicker
