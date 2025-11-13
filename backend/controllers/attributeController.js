import attributeModel from '../models/attributeModel.js'

export const createAttribute = async (req, res) => {
  try {
    const { name, label, description, color } = req.body

    if (!name || !label) {
      return res.status(400).json({ success: false, message: 'Attribute name and label are required' })
    }

    const attribute = new attributeModel({
      name: name.trim(),
      label: label.trim(),
      description,
      color,
    })

    await attribute.save()

    res.status(201).json({ success: true, message: 'Attribute created successfully', attribute })
  } catch (error) {
    console.error('Error creating attribute:', error)
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Attribute name must be unique' })
    }
    res.status(500).json({ success: false, message: error.message })
  }
}

export const listAttributes = async (req, res) => {
  try {
    const attributes = await attributeModel.find({ isActive: true }).sort({ label: 1 }).lean()
    res.json({ success: true, attributes })
  } catch (error) {
    console.error('Error listing attributes:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}


