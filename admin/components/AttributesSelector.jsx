import { useMemo } from 'react'

const AttributesSelector = ({
  mainCategoryId,
  subCategoryId,
  thirdCategoryId,
  categoryOptions,
  attributeValues,
  onChange,
  locale = 'en',
  translations,
  onTranslationsChange,
}) => {
  const categoryMap = useMemo(() => {
    const map = {}
    categoryOptions.forEach((cat) => {
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
        category.attributes.forEach((attr) => {
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
      {availableAttributes.map((attribute) => {
        const rawId = attribute._id || attribute.id
        if (!rawId) return null
        const id = String(rawId)
        const englishValue = attributeValues[id] || ''
        const translatedValue = translations?.[locale]?.attributes?.[id] || ''
        const value = locale === 'en' ? englishValue : translatedValue
        const color = attribute.color || '#3b82f6'
        const handleChange = (nextValue) => {
          if (locale === 'en') {
            onChange((prev) => {
              const next = { ...prev }
              if (nextValue && nextValue.trim()) next[id] = nextValue
              else delete next[id]
              return next
            })
            return
          }
          onTranslationsChange?.(locale, id, nextValue)
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
              placeholder={
                locale === 'en'
                  ? `Enter ${attribute.label || attribute.name}`
                  : (englishValue || `${locale.toUpperCase()} (optional, English fallback)`)
              }
              className='bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-300 min-w-[12rem]'
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

export default AttributesSelector
