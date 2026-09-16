import floatContactModel from '../models/floatContactModel.js'
import {
  DEFAULT_FLOAT_CONTACTS,
  isFloatContactChannel,
  serializeFloatContact,
} from '../utils/floatContact.js'

export async function ensureDefaultFloatContacts() {
  const config = await floatContactModel.getConfig()
  if (config.contacts.length) return config
  DEFAULT_FLOAT_CONTACTS.forEach((item) => config.contacts.push(item))
  await config.save()
  return config
}

function listContacts(config, { includeInactive = false } = {}) {
  return config.contacts
    .filter((contact) => includeInactive || contact.isActive !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(serializeFloatContact)
}

export const listFloatContacts = async (req, res) => {
  try {
    const config = await ensureDefaultFloatContacts()
    res.json({ success: true, contacts: listContacts(config) })
  } catch (error) {
    console.error('Error listing float contacts:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const adminListFloatContacts = async (req, res) => {
  try {
    const config = await ensureDefaultFloatContacts()
    res.json({ success: true, contacts: listContacts(config, { includeInactive: true }) })
  } catch (error) {
    console.error('Error listing admin float contacts:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

function readContactBody(body = {}) {
  const name = String(body.name || '').trim()
  const channel = String(body.channel || '').trim().toLowerCase()
  const value = String(body.value || '').trim()
  if (!name) return { error: 'Salesperson name is required' }
  if (!isFloatContactChannel(channel)) return { error: 'Choose WhatsApp, WeChat, Email, Phone, or Telegram' }
  if (!value) return { error: 'Contact value is required' }
  return {
    name,
    channel,
    value,
    label: String(body.label || '').trim(),
    qrImageUrl: String(body.qrImageUrl || '').trim(),
    order: body.order !== undefined ? Number(body.order) : undefined,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
  }
}

export const addFloatContact = async (req, res) => {
  try {
    const payload = readContactBody(req.body)
    if (payload.error) {
      return res.status(400).json({ success: false, message: payload.error })
    }
    const config = await floatContactModel.getConfig()
    config.contacts.push({
      ...payload,
      order: payload.order !== undefined ? payload.order : config.contacts.length,
      isActive: payload.isActive !== undefined ? payload.isActive : true,
    })
    await config.save()
    const contact = config.contacts[config.contacts.length - 1]
    res.json({ success: true, message: 'Sales contact added', contact: serializeFloatContact(contact) })
  } catch (error) {
    console.error('Error adding float contact:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const updateFloatContact = async (req, res) => {
  try {
    const { contactId } = req.params
    const config = await floatContactModel.getConfig()
    const contact = config.contacts.id(contactId)
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Sales contact not found' })
    }

    const { name, channel, value, label, qrImageUrl, order, isActive } = req.body
    if (name !== undefined) {
      const nextName = String(name).trim()
      if (!nextName) return res.status(400).json({ success: false, message: 'Salesperson name is required' })
      contact.name = nextName
    }
    if (channel !== undefined) {
      const nextChannel = String(channel).trim().toLowerCase()
      if (!isFloatContactChannel(nextChannel)) {
        return res.status(400).json({ success: false, message: 'Invalid channel' })
      }
      contact.channel = nextChannel
    }
    if (value !== undefined) {
      const nextValue = String(value).trim()
      if (!nextValue) return res.status(400).json({ success: false, message: 'Contact value is required' })
      contact.value = nextValue
    }
    if (label !== undefined) contact.label = String(label).trim()
    if (qrImageUrl !== undefined) contact.qrImageUrl = String(qrImageUrl).trim()
    if (order !== undefined) contact.order = Number(order)
    if (isActive !== undefined) contact.isActive = Boolean(isActive)

    await config.save()
    res.json({ success: true, message: 'Sales contact updated', contact: serializeFloatContact(contact) })
  } catch (error) {
    console.error('Error updating float contact:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const deleteFloatContact = async (req, res) => {
  try {
    const { contactId } = req.params
    const config = await floatContactModel.getConfig()
    const contact = config.contacts.id(contactId)
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Sales contact not found' })
    }
    config.contacts.pull(contactId)
    await config.save()
    res.json({ success: true, message: 'Removed from the floating window' })
  } catch (error) {
    console.error('Error deleting float contact:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const reorderFloatContacts = async (req, res) => {
  try {
    const { contacts } = req.body
    if (!Array.isArray(contacts)) {
      return res.status(400).json({ success: false, message: 'contacts array is required' })
    }
    const config = await floatContactModel.getConfig()
    for (const incoming of contacts) {
      const contact = incoming?._id ? config.contacts.id(incoming._id) : null
      if (!contact) continue
      if (incoming.order !== undefined) contact.order = Number(incoming.order)
    }
    await config.save()
    res.json({ success: true, message: 'Sales contact order saved' })
  } catch (error) {
    console.error('Error reordering float contacts:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
