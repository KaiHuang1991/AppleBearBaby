/**
 * Fill zh/es/ar/fr labels on known product attributes.
 * Usage: node scripts/patch-attribute-i18n.js
 */
import 'dotenv/config'
import connectDB from '../config/mongodb.js'
import attributeModel from '../models/attributeModel.js'
import { PREFIX_LOCALES, hasLocalizedText } from '../utils/locales.js'

const ATTRIBUTE_LABEL_I18N = {
  Capacity: { zh: '容量', es: 'Capacidad', ar: 'السعة', fr: 'Capacité' },
  Material: { zh: '材质', es: 'Material', ar: 'المادة', fr: 'Matière' },
  MOQ: { zh: '起订量', es: 'CMO', ar: 'الحد الأدنى للطلب', fr: 'Qté min.' },
}

async function main() {
  await connectDB()
  const attributes = await attributeModel.find({})
  let changed = 0
  for (const attribute of attributes) {
    const map = ATTRIBUTE_LABEL_I18N[attribute.name] || ATTRIBUTE_LABEL_I18N[attribute.label]
    if (!map) continue
    const translations = { ...(attribute.translations?.toObject?.() || attribute.translations || {}) }
    let touched = false
    for (const loc of PREFIX_LOCALES) {
      if (map[loc] && !hasLocalizedText(translations[loc]?.label)) {
        translations[loc] = { ...(translations[loc] || {}), label: map[loc] }
        touched = true
      }
    }
    if (!touched) continue
    attribute.translations = translations
    attribute.markModified('translations')
    await attribute.save()
    changed += 1
    console.log(`Patched attribute label: ${attribute.name}`)
  }
  console.log(`Done. Attributes: ${changed}`)
  process.exit(0)
}

main().catch((err) => {
  console.error('patch-attribute-i18n failed:', err)
  process.exit(1)
})
