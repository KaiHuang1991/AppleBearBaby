import mongoose from 'mongoose'
import productModel from '../models/productModel.js'
import { buildProductOgHtml, normalizeOgImages, stripHtml } from '../utils/buildOgHtml.js'
import { buildOgShareImages } from '../utils/ogCollage.js'

const getFrontendOrigin = () =>
  (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')

export const productOgPage = async (req, res) => {
  try {
    const { productId } = req.params

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(404).type('text/plain').send('Product not found')
    }

    const product = await productModel
      .findById(productId)
      .select('name description image price modelNumber')
      .lean()

    if (!product) {
      return res.status(404).type('text/plain').send('Product not found')
    }

    const frontendOrigin = getFrontendOrigin()
    const canonical = `${frontendOrigin}/product/${productId}`
    const title = product.name || 'Product'
    const description = stripHtml(product.description || '').slice(0, 160)
    const images = normalizeOgImages(product.image, frontendOrigin)
    const shareImages = buildOgShareImages(images, process.env.CLOUDINARY_NAME)

    const html = buildProductOgHtml({
      title,
      description,
      images: shareImages,
      image: shareImages[0],
      canonical,
      siteName: 'AppleBear Baby',
      price: product.price,
      currency: 'USD',
      fbAppId: process.env.FACEBOOK_APP_ID,
    })

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=300')
    return res.status(200).send(html)
  } catch (error) {
    console.error('OG product page error:', error)
    return res.status(500).type('text/plain').send('Failed to render preview')
  }
}
