/**
 * OEM product article: AB-125B 60ml standard-neck glass bottle.
 * Usage: node scripts/seed-oem-glass-60ml-blog.js
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/mongodb.js'
import blogModel from '../models/blogModel.js'
import { invalidateSitemapCache } from '../utils/sitemapService.js'

const PRODUCT_ID = '690c3b8e5fb5c56102517527'
const PRODUCT_URL =
  'https://applebearbaby.net/product/applebear-60ml-standard-caliber-glass-baby-feeding-bottle-bpa-free-anti-colic'
const IMG = {
  pack: 'https://res.cloudinary.com/dzskx10vu/image/upload/v1762409353/xj3bffvngq5fxcjcfwot.jpg',
  scale: 'https://res.cloudinary.com/dzskx10vu/image/upload/v1762409352/zdcpicldqjkl4ugnsabo.jpg',
  nipple: 'https://res.cloudinary.com/dzskx10vu/image/upload/v1762409353/uekemaaxzykk0nizojil.jpg',
}

const SLUG = '60ml-standard-neck-glass-baby-bottle-oem-model-ab-125b-for-wholesale'
const title = '60ml Standard-Neck Glass Baby Bottle OEM: Model AB-125B for Wholesale and Private Label'
const excerpt =
  'Factory notes on AppleBear Model AB-125B — a 60ml standard-neck borosilicate glass bottle with slow-flow silicone nipple, color-box packing, and OEM options for newborn SKUs.'

const content = `<p class="geo-answer">Model AB-125B is AppleBear Baby’s 60ml (2 oz) standard-neck borosilicate glass feeding bottle with a slow-flow silicone nipple and hang-tab color box. It is a newborn / trial-feed SKU, not a 240ml daytime bottle. Pair it with the 120ml and 200ml standard-neck glass bottles in the same neck family. A logo swap is a print run on the same bottle, not a new mold. Carton quantity and MOQ are confirmed on the packing list with the quote.</p>
<p>Importers building a newborn glass line usually start with a small capacity, a standard neck that matches their existing collars, and packing that can hang in a pharmacy or supermarket. Model AB-125B is that SKU. It is a 60ml (2 oz) borosilicate glass feeding bottle with a food-grade silicone slow-flow nipple, sold from our Yiwu factory for wholesale and private-label programs.</p>
<p>This article walks through the bottle as a buyer would inspect it — body, scale, nipple, and color box — using the same photos as the <a href="${PRODUCT_URL}">product page</a>.</p>

<h2>What the listing actually is</h2>
<p><div class="product-description-image-wrapper"><img src="${IMG.pack}" alt="AB-125B 60ml standard-neck glass bottle next to AppleBear color box"></div></p>
<p>The catalog shot is the bottle on the left and the hang-tab color box on the right. The box is printed “STANDARD CALIBER GLASS BOTTLE,” with badges for BPA-free, glass, and 60ml. That is the current retail packing for this SKU — not an OPP bag. If you refill your own brand carton, say so in the RFQ; the bottle and thread stay AB-125B, only the box artwork changes.</p>
<p>The body is clear borosilicate glass. Cap, collar, and dome cover on the stock photos are light blue PP. The AppleBear mark is printed on the glass wall. A logo swap or a blank wall for your brand is an OEM print run on the same bottle — it is not a new mold.</p>

<h2>60ml, standard neck, readable scale</h2>
<p><div class="product-description-image-wrapper"><img src="${IMG.scale}" alt="60ml glass bottle with 30ml and 60ml scale marks and silicone nipple under dust cover"></div></p>
<p>Capacity is 60ml / 2 oz, with an intermediate 30ml / 1 oz mark. That is a newborn / trial-feed size, not a 240ml daytime bottle. If you need a glass size run in one container, pair this SKU with our <a href="https://applebearbaby.net/product/applebear-glass-feeding-bottle-120ml-premium-borosilicate-glass-baby-milk-bottle-with-silicone-nipple">120ml</a> and <a href="https://applebearbaby.net/product/applebear-glass-feeding-bottle-200ml-pure-and-gentle-for-your-little-one">200ml</a> standard-neck glass bottles — same neck family, different fill lines.</p>
<p>The neck is standard caliber (narrow neck), not wide-mouth. Buyers specify this when they already stock standard-neck nipples and collars, or when they want the smaller glass diameter for a 60ml fill. Do not assume a wide-neck teat will screw on. If your market is wide-neck only, this is the wrong SKU; ask for the wide-neck PP or glass line instead.</p>
<p>Glass is heavier than PP and needs export packing that accounts for breakage. We confirm inner packing, carton qty, and MOQ on the packing list — those numbers are not a published rate card on the product page. Lead time on a running glass SKU is typically samples in 3–7 days, bulk 15–25 days after deposit, same window as our other feeding bottles unless a new print plate is in the order.</p>

<h2>Silicone nipple, collar, and anti-colic vent</h2>
<p><div class="product-description-image-wrapper"><img src="${IMG.nipple}" alt="Food-grade silicone slow-flow nipple on a light-blue PP collar for AB-125B"></div></p>
<p>Each bottle is fitted with a food-grade silicone nipple on a PP collar. The close-up shows the slow-flow geometry used on this 60ml SKU, with a vent hole in the nipple wall (the anti-colic feature named in the catalog slug). The stock collar is light blue with a light animal/cloud emboss. Dust cover sits over the nipple for shelf packing.</p>
<p>Flow can be confirmed on the order. If your market needs a different teat profile, say so in the RFQ — the glass body and standard-neck thread stay AB-125B, only the nipple SKU changes. Do not treat a nipple change as a new bottle mold.</p>

<h2>Why buyers pick glass for this size</h2>
<p>PP remains the volume material for most OEM gift sets because it is light for sea freight and drop-resistant. Glass is the ask when the importer’s customer wants a newborn bottle that does not pick up odor, shows the fill clearly, and can go with a “glass / BPA-free” claim on the box — which is already printed on the AB-125B carton. It is not a cheaper substitute for 60ml PP; it is a different material line, quoted separately, with glass packing.</p>
<p>The product page price is a reference EXW figure. Final quote depends on MOQ, print, packing (stock color box vs your artwork), and destination (FOB / CIF). Samples usually go by courier; bulk goes FCL / LCL or to the China warehouse your forwarder names. The three delivery models are on <a href="https://applebearbaby.net/blog/how-we-ship-oem-orders-from-yiwu-your-agent-alibaba-logistics-or-fcl">How we ship OEM orders from Yiwu</a>.</p>

<h2>What to send in an RFQ</h2>
<p>We quote faster when the message includes:</p>
<ul>
<li>Quantity for AB-125B, and whether 120ml / 200ml glass ships in the same lot</li>
<li>Stock color box or your own carton artwork</li>
<li>Whether the AppleBear print stays, or you need a blank / private-label print</li>
<li>Nipple flow if you already sell a standard in your market</li>
<li>Destination and whether you already have a China forwarder</li>
</ul>
<p>See the live spec and gallery: <a href="${PRODUCT_URL}">60ml Standard-Neck Borosilicate Glass Bottle — OEM / Wholesale (Model AB-125B)</a>. Factory: No.9 Hengde Road, Niansanli Street, Yiwu, Zhejiang. Use the site contact form or WhatsApp for a quote.</p>
<p>See also: <a href="https://applebearbaby.net/faq">OEM FAQ</a>, <a href="https://applebearbaby.net/blog/pp-vs-ppsu-vs-glass-baby-bottles-which-material-to-specify-in-an-oem-rfq">PP vs glass</a>, and <a href="https://applebearbaby.net/blog/how-we-ship-oem-orders-from-yiwu-your-agent-alibaba-logistics-or-fcl">factory shipping from Yiwu</a>.</p>
`

async function main() {
  await connectDB()

  const payload = {
    title,
    slug: SLUG,
    excerpt,
    content,
    image: IMG.pack,
    category: 'baby-products',
    author: 'AppleBear Baby',
    tags: [
      'OEM baby bottle',
      'glass feeding bottle',
      '60ml bottle',
      'standard neck',
      'borosilicate',
      'AB-125B',
      'wholesale China',
    ],
    readTime: 6,
    isPublished: true,
    indexable: true,
    productIds: [new mongoose.Types.ObjectId(PRODUCT_ID)],
  }

  const existing = await blogModel.findOne({ slug: SLUG })
  if (existing) {
    Object.assign(existing, payload)
    await existing.save()
    invalidateSitemapCache()
    console.log(`Updated existing article: ${SLUG}`)
    process.exit(0)
  }

  await blogModel.create(payload)
  invalidateSitemapCache()
  console.log(`Created article: ${SLUG}`)
  process.exit(0)
}

main().catch((err) => {
  console.error('seed-oem-glass-60ml-blog failed:', err)
  process.exit(1)
})
