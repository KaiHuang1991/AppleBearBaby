import heroModel from '../models/heroModel.js'

// Get hero configuration
const getHeroConfig = async (req, res) => {
  try {
    const config = await heroModel.getHeroConfig()
    
    // Filter out inactive slides if not admin
    const slides = req.user?.isAdmin 
      ? config.slides.sort((a, b) => a.order - b.order)
      : config.slides.filter(slide => slide.isActive).sort((a, b) => a.order - b.order)
    
    res.json({
      success: true,
      config: {
        ...config.toObject(),
        slides
      }
    })
  } catch (error) {
    console.error('Error fetching hero config:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching hero configuration',
      error: error.message
    })
  }
}

// Update hero configuration (admin only)
const updateHeroConfig = async (req, res) => {
  try {
    const { slides, autoPlay, autoPlayInterval, isActive } = req.body
    
    let config = await heroModel.findOne()
    
    if (!config) {
      config = new heroModel({
        slides: slides || [],
        autoPlay: autoPlay !== undefined ? autoPlay : true,
        autoPlayInterval: autoPlayInterval || 3000,
        isActive: isActive !== undefined ? isActive : true
      })
    } else {
      if (slides !== undefined) {
        // Replace slides array - Mongoose will handle subdocument updates
        config.slides = slides.map((slide, index) => ({
          _id: slide._id, // Preserve _id if it exists
          imageUrl: slide.imageUrl,
          linkUrl: slide.linkUrl || '',
          title: slide.title,
          features: Array.isArray(slide.features) ? slide.features : (slide.features || []),
          buttonText: slide.buttonText || 'View All Products',
          order: slide.order !== undefined ? slide.order : index,
          isActive: slide.isActive !== undefined ? slide.isActive : true
        }))
        // Sort by order
        config.slides.sort((a, b) => (a.order || 0) - (b.order || 0))
      }
      if (autoPlay !== undefined) config.autoPlay = autoPlay
      if (autoPlayInterval !== undefined) config.autoPlayInterval = autoPlayInterval
      if (isActive !== undefined) config.isActive = isActive
    }
    
    await config.save()
    
    res.json({
      success: true,
      message: 'Hero configuration updated successfully',
      config
    })
  } catch (error) {
    console.error('Error updating hero config:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating hero configuration',
      error: error.message
    })
  }
}

// Add a new slide
const addSlide = async (req, res) => {
  try {
    const { imageUrl, linkUrl, title, features, buttonText, order } = req.body
    
    console.log('Add slide request body:', { imageUrl, linkUrl, title, features, buttonText, order })
    
    if (!imageUrl || !title) {
      return res.status(400).json({
        success: false,
        message: 'Image URL and title are required'
      })
    }
    
    let config = await heroModel.getHeroConfig()
    console.log('Hero config found:', config ? 'yes' : 'no')
    
    const newSlide = {
      imageUrl: imageUrl.trim(),
      linkUrl: linkUrl ? linkUrl.trim() : '',
      title: title.trim(),
      features: Array.isArray(features) ? features : (features ? features.split(',').map(f => f.trim()).filter(f => f) : []),
      buttonText: buttonText ? buttonText.trim() : 'View All Products',
      order: order !== undefined ? order : config.slides.length,
      isActive: true
    }
    
    console.log('New slide data:', newSlide)
    
    config.slides.push(newSlide)
    await config.save()
    
    console.log('Slide saved successfully')
    
    res.json({
      success: true,
      message: 'Slide added successfully',
      slide: config.slides[config.slides.length - 1]
    })
  } catch (error) {
    console.error('Error adding slide:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({
      success: false,
      message: 'Error adding slide',
      error: error.message
    })
  }
}

// Update a slide
const updateSlide = async (req, res) => {
  try {
    const { slideId } = req.params
    const { imageUrl, linkUrl, title, features, buttonText, order, isActive } = req.body
    
    const config = await heroModel.getHeroConfig()
    const slide = config.slides.id(slideId)
    
    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found'
      })
    }
    
    if (imageUrl !== undefined) slide.imageUrl = imageUrl
    if (linkUrl !== undefined) slide.linkUrl = linkUrl
    if (title !== undefined) slide.title = title
    if (features !== undefined) slide.features = features
    if (buttonText !== undefined) slide.buttonText = buttonText
    if (order !== undefined) slide.order = order
    if (isActive !== undefined) slide.isActive = isActive
    
    await config.save()
    
    res.json({
      success: true,
      message: 'Slide updated successfully',
      slide
    })
  } catch (error) {
    console.error('Error updating slide:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating slide',
      error: error.message
    })
  }
}

// Delete a slide
const deleteSlide = async (req, res) => {
  try {
    const { slideId } = req.params
    
    const config = await heroModel.getHeroConfig()
    const slide = config.slides.id(slideId)
    
    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found'
      })
    }
    
    config.slides.pull(slideId)
    await config.save()
    
    res.json({
      success: true,
      message: 'Slide deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting slide:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting slide',
      error: error.message
    })
  }
}

export {
  getHeroConfig,
  updateHeroConfig,
  addSlide,
  updateSlide,
  deleteSlide
}

