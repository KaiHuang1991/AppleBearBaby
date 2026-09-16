/**
 * Unify blog authors and host leftover external images on Cloudinary.
 * Usage: node scripts/fix-blog-authors-and-images.js
 */
import 'dotenv/config'
import connectDB from '../config/mongodb.js'
import connectCloudinary from '../config/cloudinary.js'
import { v2 as cloudinary } from 'cloudinary'
import blogModel from '../models/blogModel.js'
import { invalidateSitemapCache } from '../utils/sitemapService.js'

const EXTERNAL_HOST = /pathways\.org|rokbucket\.rokomari\.io/i

function collectUrls(blog) {
  const urls = new Set()
  if (blog.image && EXTERNAL_HOST.test(blog.image)) urls.add(blog.image)
  const content = String(blog.content || '')
  const matches = content.match(/https?:\/\/[^"'>\s]+/g) || []
  matches.filter((url) => EXTERNAL_HOST.test(url)).forEach((url) => urls.add(url))
  return [...urls]
}

async function uploadRemote(url) {
  const result = await cloudinary.uploader.upload(url, {
    folder: 'blogs',
    use_filename: true,
    unique_filename: true,
  })
  return result?.secure_url || result?.url || ''
}

async function main() {
  await connectDB()
  await connectCloudinary()

  const authorResult = await blogModel.updateMany(
    { author: { $ne: 'AppleBear Baby' } },
    { $set: { author: 'AppleBear Baby' } }
  )
  console.log(`Updated authors: ${authorResult.modifiedCount}`)

  const blogs = await blogModel.find({
    $or: [
      { image: { $regex: 'pathways\\.org|rokbucket\\.rokomari\\.io', $options: 'i' } },
      { content: { $regex: 'pathways\\.org|rokbucket\\.rokomari\\.io', $options: 'i' } },
    ],
  })

  console.log(`Blogs with external images: ${blogs.length}`)
  let changed = 0
  for (const blog of blogs) {
    const urls = collectUrls(blog)
    let nextImage = blog.image || ''
    let nextContent = blog.content || ''
    for (const url of urls) {
      try {
        const hosted = await uploadRemote(url)
        if (!hosted) continue
        if (nextImage === url) nextImage = hosted
        nextContent = nextContent.split(url).join(hosted)
        console.log(`  ${blog.slug || blog._id}: ${url} -> ${hosted}`)
      } catch (error) {
        console.warn(`  failed to upload ${url}: ${error.message}`)
      }
    }
    if (nextImage !== blog.image || nextContent !== blog.content) {
      blog.image = nextImage
      blog.content = nextContent
      await blog.save()
      changed += 1
    }
  }

  if (authorResult.modifiedCount || changed) {
    invalidateSitemapCache()
  }
  console.log(`Rewrote images on ${changed} article(s)`)
  process.exit(0)
}

main().catch((error) => {
  console.error('fix-blog-authors-and-images failed:', error)
  process.exit(1)
})
