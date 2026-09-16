const CHANNELS = ['whatsapp', 'wechat', 'email', 'phone', 'telegram']

export function isFloatContactChannel(value) {
  return CHANNELS.includes(String(value || '').toLowerCase())
}

export function digitsOnly(value) {
  return String(value || '').replace(/[^\d]/g, '')
}

export function buildContactHref(channel, value) {
  const type = String(channel || '').toLowerCase()
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (type === 'whatsapp') {
    const digits = digitsOnly(raw)
    return digits ? `https://wa.me/${digits}` : ''
  }
  if (type === 'email') return `mailto:${raw}`
  if (type === 'phone') {
    const tel = raw.replace(/[^\d+]/g, '')
    return tel ? `tel:${tel}` : ''
  }
  if (type === 'telegram') {
    if (/^https?:\/\//i.test(raw)) return raw
    const handle = raw.replace(/^@/, '')
    return handle ? `https://t.me/${handle}` : ''
  }
  return ''
}

export function buildContactLabel({ name, value, label } = {}) {
  const custom = String(label || '').trim()
  if (custom) return custom
  const person = String(name || '').trim()
  const contact = String(value || '').trim()
  if (person && contact) return `${person}: ${contact}`
  return contact || person
}

export function serializeFloatContact(contact) {
  const channel = String(contact.channel || 'whatsapp').toLowerCase()
  const name = String(contact.name || '').trim()
  const value = String(contact.value || '').trim()
  return {
    _id: contact._id,
    name,
    channel,
    value,
    label: buildContactLabel({ name, value, label: contact.label }),
    href: buildContactHref(channel, value),
    qrImageUrl: String(contact.qrImageUrl || '').trim(),
    order: contact.order || 0,
    isActive: contact.isActive !== false,
  }
}

export const DEFAULT_FLOAT_CONTACTS = [
  {
    name: 'Sales',
    channel: 'email',
    value: '1034201254@qq.com',
    label: '1034201254@qq.com',
    order: 0,
    isActive: true,
  },
  {
    name: 'Kai',
    channel: 'whatsapp',
    value: '+86-15867976938',
    label: 'Kai:+86-15867976938',
    order: 1,
    isActive: true,
  },
]
