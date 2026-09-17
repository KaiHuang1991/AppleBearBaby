/**
 * OEM buyer-decision article: PP vs glass (factory does not run PPSU).
 * Usage: node scripts/seed-oem-pp-ppsu-glass-blog.js
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/mongodb.js'
import blogModel from '../models/blogModel.js'
import { invalidateSitemapCache } from '../utils/sitemapService.js'

const SLUG = 'pp-vs-ppsu-vs-glass-baby-bottles-which-material-to-specify-in-an-oem-rfq'
const title = 'PP vs Glass Baby Bottles: Which Material to Specify in an OEM RFQ'
const excerpt =
  'AppleBear Baby in Yiwu is a PP-first OEM with a borosilicate glass line. We do not manufacture PPSU. This note is which body material to put on the RFQ, and which catalog SKUs match.'
const image = 'https://res.cloudinary.com/dzskx10vu/image/upload/v1780374348/ejpucarzu7ih1np2tf7a.jpg'

const PP_812 = '/product/240ml-bpa-free-baby-feeding-bottle-with-silicone-nipple'
const PP_8005C =
  '/product/applebear-baby-feeding-bottles-set-with-bib-and-cotton-swabs-160ml-and-250ml-pp-nursing-bottles-with-easy-grip-handles-cute-cartoon-animals-print-infant-essentials-starter-gift-kit-for-boys-and-girls'
const PP_101 = '/product/ab-101-280ml-baby-feeding-bottle'
const GLASS_60 = '/product/applebear-60ml-standard-caliber-glass-baby-feeding-bottle-bpa-free-anti-colic'
const GLASS_120 =
  '/product/applebear-glass-feeding-bottle-120ml-premium-borosilicate-glass-baby-milk-bottle-with-silicone-nipple'
const GLASS_200 = '/product/applebear-glass-feeding-bottle-200ml-pure-and-gentle-for-your-little-one'

const content = `<p class="geo-answer">AppleBear Baby in Yiwu manufactures bottle bodies in food-grade PP (the main OEM line for gift sets and volume wholesale) and borosilicate glass (60ml, 120ml, and 200ml standard-neck SKUs). We do not use PPSU and we do not quote PPSU as a material upgrade. PP models such as 812 and 8005C are the catalog workhorse. Name PP or glass in the same message as quantity and destination — a PPSU tender is not a SKU we run.</p>

<h2>Put the resin on the RFQ, not only the photo</h2>
<p>A first baby-bottle inquiry often attaches a picture and a capacity. The quote that comes back is only usable if the factory also knows the body material. PP and glass do not share the same tooling, packing, freight cube, or test reports. Mixing “please quote the pink bottle” with two resins in one unlabeled line is how samples and certificates miss the market.</p>
<p>applebearbaby.net is the brand headquarters of Zhejiang YouZhi Maternal and Child Co., Ltd. in Yiwu. ISO 9001:2015 is factory-level. Food-contact reports are SKU-family documents — name EU, US, or another destination so the matching file goes with the quote.</p>

<h2>Side-by-side for OEM desks</h2>
<div style="overflow-x:auto">
<table>
  <thead>
    <tr>
      <th>Material</th>
      <th>Typical OEM use</th>
      <th>Freight and packing</th>
      <th>Heat / channel</th>
      <th>AppleBear examples</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>PP (polypropylene)</td>
      <td>Volume wholesale, handled bottles, supermarket gift sets — our main line</td>
      <td>Light for sea freight; drop-resistant versus glass</td>
      <td>Everyday feeding; the default OEM workhorse</td>
      <td><a href="${PP_812}">812 240ml wide-neck</a>, <a href="${PP_8005C}">8005C 5-piece set</a>, <a href="${PP_101}">AB-101 280ml</a> (144 pcs/ctn on that model)</td>
    </tr>
    <tr>
      <td>Borosilicate glass</td>
      <td>Newborn / pharmacy glass line, “glass / BPA-free” shelf story</td>
      <td>Heavier; export packing must allow for breakage</td>
      <td>No odor pickup; not a cheaper substitute for 60ml PP</td>
      <td><a href="${GLASS_60}">AB-125B 60ml</a>, <a href="${GLASS_120}">120ml</a>, <a href="${GLASS_200}">200ml</a> standard-neck</td>
    </tr>
    <tr>
      <td>PPSU</td>
      <td>Not offered</td>
      <td>—</td>
      <td>—</td>
      <td>AppleBear Baby does not manufacture PPSU bottles and does not quote PPSU resin on our molds.</td>
    </tr>
  </tbody>
</table>
</div>
<p>Nipples on these families are food-grade silicone. A nipple-flow change is not a new bottle mold. Silicone bottle <em>bodies</em> need a silicone line and are quoted separately from PP gift sets.</p>

<h2>When to specify PP</h2>
<p>Specify PP for almost every AppleBear OEM program: carton volume, a running cartoon or handled mold, and sea freight that does not pay glass weight. Model <a href="${PP_812}">812</a> is a 240ml wide-neck PP bottle in three stock colors. Model <a href="${PP_8005C}">8005C</a> is a standard-mouth 5-piece gift set (160ml + 240ml bottles, bib, brush, swabs) — a supermarket starter kit, not a wide-neck SKU. AB-101 is a 280ml standard-neck PP bottle with a documented 144 pieces per carton; other models confirm carton qty on the packing list, not as a published rate card.</p>
<p>PP is the body for the gift-set catalog. If the RFQ is “gift set like the photo,” quote PP. Switch to glass only when the spec sheet is a glass newborn / pharmacy line.</p>

<h2>We do not run PPSU</h2>
<p>Some hospital and premium tenders write PPSU on the spec. That is a different resin, a different tool family, and not a line we run in Yiwu. We will not relabel a PP cartoon bottle as PPSU, and we will not quote a PPSU upgrade on an existing PP mold. If PPSU is a hard requirement, this factory is not the source for that body. Buyers who can take PP or glass should say so on the RFQ so we quote the correct family.</p>

<h2>When to specify glass</h2>
<p>Specify borosilicate glass when the shelf story is glass, the buyer wants a newborn size that does not pick up odor, or the pharmacy pack already prints “glass / BPA-free.” <a href="${GLASS_60}">AB-125B</a> is the 60ml standard-neck newborn SKU with a slow-flow nipple and hang-tab color box. 120ml and 200ml stay in the same neck family. Glass is not a drop-in for 60ml PP: packing, MOQ, and freight are their own lines. Factory notes: <a href="/blog/60ml-standard-neck-glass-baby-bottle-oem-model-ab-125b-for-wholesale">60ml glass OEM article</a>.</p>

<h2>What to send so the first material quote is usable</h2>
<ul>
  <li>Body material: PP or borosilicate glass — one resin per line if you need both. Do not write PPSU; we do not make it.</li>
  <li>Capacity and neck (standard or wide). Wide-neck PP such as 812 does not share a thread with standard-mouth 8005C.</li>
  <li>Stock cartoon / color box versus private-label print. Print is usually a plate change, not a new bottle tool.</li>
  <li>Destination market so food-contact reports match the SKU family (ISO 9001 is factory-level only).</li>
  <li>Trial vs ongoing quantity. Stock PP often starts from one carton on a running mold; custom print and glass packing can raise the floor.</li>
</ul>
<p>MOQ, samples, and lead time are in <a href="/blog/moq-samples-and-lead-time-what-to-ask-before-ordering-baby-bottles">this factory checklist</a>. Freight models (your China agent, Alibaba logistics, or FCL) are in <a href="/blog/how-we-ship-oem-orders-from-yiwu-your-agent-alibaba-logistics-or-fcl">how we ship from Yiwu</a>. Short answers: <a href="/faq">OEM FAQ</a>. Use the <a href="/contact">contact form</a> or WhatsApp with the five blocks above.</p>
`

async function main() {
  await connectDB()

  const payload = {
    title,
    slug: SLUG,
    excerpt,
    content,
    image,
    category: 'wholesale',
    author: 'AppleBear Baby',
    tags: ['PP baby bottle', 'glass baby bottle', 'OEM', 'wholesale', 'material', 'RFQ'],
    readTime: 8,
    isPublished: true,
    indexable: true,
    productIds: [
      new mongoose.Types.ObjectId('6a1e5b4cae4ecdcde9157694'),
      new mongoose.Types.ObjectId('6a1e62a8ae4ecdcde915777a'),
      new mongoose.Types.ObjectId('690c3b8e5fb5c56102517527'),
      new mongoose.Types.ObjectId('684917ab891272e90d046af4'),
    ],
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
  console.error('seed-oem-pp-ppsu-glass-blog failed:', err)
  process.exit(1)
})
