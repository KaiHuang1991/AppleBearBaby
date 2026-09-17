/**
 * Prepend GEO answer leads + see-also on 812 and 8005C product articles.
 * Usage: node scripts/patch-b2b-blog-geo-answers.js
 */
import 'dotenv/config'
import connectDB from '../config/mongodb.js'
import blogModel from '../models/blogModel.js'
import { invalidateSitemapCache } from '../utils/sitemapService.js'

const PATCHES = [
  {
    slug: '240ml-wide-neck-pp-baby-bottle-oem-model-812-for-wholesale-and-private-label',
    lead: `<p class="geo-answer">Model 812 is AppleBear Baby’s 240ml wide-neck PP feeding bottle with a food-grade silicone nipple, sold from Yiwu for wholesale and private label. Stock colors are pink, blue, and green on one mold. Packing is OPP bag or a hang-tab 3-pack — a packing change, not a new tool. The wide-neck thread is not compatible with standard-mouth gift sets such as 8005C. Carton quantity and MOQ are confirmed on the packing list with the quote.</p>`,
    seeAlso: `<p>See also: <a href="https://applebearbaby.net/faq">OEM FAQ</a>, <a href="https://applebearbaby.net/blog/pp-vs-ppsu-vs-glass-baby-bottles-which-material-to-specify-in-an-oem-rfq">PP vs glass</a>, <a href="https://applebearbaby.net/blog/8005c-5-piece-pp-bottle-gift-set-oem-160ml-and-240ml-with-bib-and-brush">8005C gift set</a>, and <a href="https://applebearbaby.net/blog/moq-samples-and-lead-time-what-to-ask-before-ordering-baby-bottles">MOQ, samples, and lead time</a>.</p>`,
  },
  {
    slug: '8005c-5-piece-pp-bottle-gift-set-oem-160ml-and-240ml-with-bib-and-brush',
    lead: `<p class="geo-answer">Model 8005C is AppleBear Baby’s 5-piece standard-mouth PP gift set: a 160ml handled bottle, a 240ml handled bottle, bib, brush, and cotton swabs, packed in a hang-tab OPP bag. It is a supermarket starter kit, not a wide-neck SKU. Pink and sky blue are stock hardware colors. Custom cartoon or gift-box artwork is an OEM packing/print change on the same two bottles. MOQ follows the slowest component in the set, not the bottle alone.</p>`,
    seeAlso: `<p>See also: <a href="https://applebearbaby.net/faq">OEM FAQ</a>, <a href="https://applebearbaby.net/blog/pp-vs-ppsu-vs-glass-baby-bottles-which-material-to-specify-in-an-oem-rfq">PP vs glass</a>, <a href="https://applebearbaby.net/blog/240ml-wide-neck-pp-baby-bottle-oem-model-812-for-wholesale-and-private-label">812 wide-neck PP</a>, and <a href="https://applebearbaby.net/blog/moq-samples-and-lead-time-what-to-ask-before-ordering-baby-bottles">MOQ, samples, and lead time</a>.</p>`,
  },
]

async function main() {
  await connectDB()
  let changed = 0

  for (const patch of PATCHES) {
    const blog = await blogModel.findOne({ slug: patch.slug })
    if (!blog) {
      console.warn(`Skip missing slug: ${patch.slug}`)
      continue
    }
    let html = String(blog.content || '')
    if (!html.includes('class="geo-answer"')) {
      html = `${patch.lead}\n${html}`
    }
    if (!html.includes('/faq')) {
      html = `${html}\n${patch.seeAlso}`
    }
    html = html.replaceAll('PP vs PPSU vs glass', 'PP vs glass')
    if (html === blog.content) {
      console.log(`Unchanged: ${patch.slug}`)
      continue
    }
    blog.content = html
    await blog.save()
    changed += 1
    console.log(`Patched: ${patch.slug}`)
  }

  if (changed) invalidateSitemapCache()
  console.log(`Done. Updated ${changed} article(s).`)
  process.exit(0)
}

main().catch((err) => {
  console.error('patch-b2b-blog-geo-answers failed:', err)
  process.exit(1)
})
