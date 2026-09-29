export const ADMIN_CONTENT_LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'es', label: 'Español' },
  { code: 'ar', label: 'العربية' },
  { code: 'fr', label: 'Français' },
]

const LanguageTabs = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-1 mb-3">
    {ADMIN_CONTENT_LOCALES.map((loc) => (
      <button
        key={loc.code}
        type="button"
        onClick={() => onChange(loc.code)}
        className={
          value === loc.code
            ? 'px-3 py-1 text-sm rounded bg-blue-600 text-white'
            : 'px-3 py-1 text-sm rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }
      >
        {loc.label}
      </button>
    ))}
  </div>
)

export default LanguageTabs
