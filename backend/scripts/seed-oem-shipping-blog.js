/**
 * OEM buyer-decision article: factory shipping from Yiwu.
 * Usage: node scripts/seed-oem-shipping-blog.js
 */
import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { v2 as cloudinary } from 'cloudinary'
import connectDB from '../config/mongodb.js'
import connectCloudinary from '../config/cloudinary.js'
import blogModel from '../models/blogModel.js'
import { invalidateSitemapCache } from '../utils/sitemapService.js'
import { OEM_BLOG_I18N } from './oem-blog-i18n.js'
import { PREFIX_LOCALES, withLocale } from '../utils/locales.js'

function localizeHtml(html, locale) {
  return String(html || '')
    .replace(/href="https:\/\/applebearbaby\.net(\/[^"]*)"/g, (_, path) => `href="https://applebearbaby.net${withLocale(path, locale)}"`)
    .replace(/href="(\/[^"]+)"/g, (_, path) => `href="${withLocale(path, locale)}"`)
}

function translationsFor(slug) {
  const block = OEM_BLOG_I18N[slug]
  if (!block) return undefined
  const out = {}
  for (const loc of PREFIX_LOCALES) {
    const entry = block[loc]
    if (!entry) continue
    out[loc] = {
      title: entry.title || '',
      excerpt: entry.excerpt || '',
      content: localizeHtml(entry.content, loc),
    }
  }
  return out
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const COVER_FILE = path.resolve(__dirname, '../../frontend/src/assets/shipping_hero.jpg')
const FALLBACK_IMAGE = 'https://res.cloudinary.com/dzskx10vu/image/upload/v1763529649/logo_mrflxn.png'

const SLUG = 'how-we-ship-oem-orders-from-yiwu-your-agent-alibaba-logistics-or-fcl'
const title = 'How We Ship OEM Orders from Yiwu: Your China Agent, Alibaba Logistics, or FCL'
const excerpt =
  'Three factory shipping models from Yiwu: deliver to your China agent with a warehouse receipt, book air/sea/express on Alibaba logistics, or stuff a full container — plus how to track the shipment on applebearbaby.net.'

const content = `<p class="geo-answer">AppleBear Baby ships OEM orders from Yiwu in three models: deliver packed cartons to the China warehouse your agent names and keep the signed POD; if you have no agent, we quote air, sea (LCL/FCL), or express on Alibaba logistics from carton count, CBM, and weight; full containers can use Alibaba freight partners or your own line, with factory stuffing labor included when the empty box is loaded at the plant. Paste courier numbers on the <a href="https://applebearbaby.net/shipping#track">shipping tracker</a>.</p>
<h2>Do not ask for a freight table before you pick the delivery model</h2>
<p>A first RFQ to a Yiwu baby-bottle factory often says “please quote CIF” with no carton count, no CBM, and no word on who holds the export file. Freight is not a catalog line. It follows who owns the China-side agent, how many cartons you are moving, and whether this is a courier parcel, an LCL pallet, or a full container. This note is how AppleBear Baby (Zhejiang YouZhi, Yiwu) actually ships OEM and wholesale orders — the same three models we use on the <a href="https://applebearbaby.net/shipping">shipping page</a>.</p>
<p>applebearbaby.net is the brand headquarters. If you already buy on Alibaba, the factory also takes RFQs at ywyouzhi.en.alibaba.com. Treat that store as a sales channel, not a second logistics company.</p>

<h2>1. You already have a shipping agent in China</h2>
<p>This is the cleanest handover. You (or your importer) appoint a freight forwarder who already has a warehouse in China — typically in Yiwu, Ningbo, or Shanghai. Our job is domestic: pack the order, truck it to the warehouse they name, and get a signed receipt.</p>
<ul>
<li>You send the warehouse name, address, contact, and any booking or mark they require.</li>
<li>We deliver the cartons to that door. We do not book the ocean or the air on this model unless you ask separately.</li>
<li>After delivery you get a warehouse receipt / proof of delivery (POD): date, carton count, and who signed. Keep that with your packing list; it is the handoff between factory and your agent.</li>
</ul>
<p>Export declaration, bill of lading, and destination clearance sit with your agent after that receipt. If your agent’s warehouse is not yet appointed, say so in the RFQ — we will not invent a CIF price that assumes we own the file.</p>

<h2>2. You do not have a China agent — we book on Alibaba logistics</h2>
<p>Many first-time OEM buyers do not keep a forwarder in China. In that case we do not guess a courier from a chat screenshot. We take the carton quantity, volume (CBM), and gross weight, then search Alibaba.com’s logistics center for a lane that balances transit time and cost for that shipment.</p>
<p>The platform’s offer set is what we actually use:</p>
<ul>
<li>International express — DHL, FedEx, TNT (and similar) for samples and urgent small lots.</li>
<li>Air freight — when the volume is past a courier envelope but you still need days, not weeks.</li>
<li>Sea freight — LCL for mixed cartons; FCL when the cube fills a box. Transit is longer; the unit cost is usually lower.</li>
</ul>
<p>There is no single “best” lane. A 20 kg sample pack to Europe is a different problem from 12 CBM of PP bottles to a US warehouse. We send you the options with transit and a freight quote; you pick the balance. Freight is quoted with the order. It is not a free retail shipping promo, and it is not a published rate card that ignores destination.</p>

<h2>3. Full container (FCL): Alibaba forwarders, your line, or factory stuffing</h2>
<p>When the order is a full container, we work with established freight partners that Alibaba introduces as service providers. They are the ones who book the box, plan the stuffing window, prepare customs documents, and file the export declaration. That is their profession; the factory’s profession is making the bottles.</p>
<p>You still have a choice of who “owns” the ocean:</p>
<ul>
<li>Let the Alibaba-side forwarder book the container on a suitable sailing.</li>
<li>Appoint your own shipping line / nominated carrier. We then cooperate with that booking instead of forcing our partner’s line.</li>
<li>Ask us to handle only inland trucking: we deliver packed cargo to the CY, CFS, or warehouse your forwarder names — same idea as model 1, at container scale.</li>
<li>Send the empty container to our factory. Your agent (or the line) drops the box at our gate; we stuff it. <strong>Loading labor at the factory is on us</strong> — we do not bill stuffing workers as a surprise line when the container is loaded here.</li>
</ul>
<p>Tell us in the RFQ which of those four you want. Mixing “please book FCL” with “our agent will send a box next Tuesday” on the same message is how sailing dates slip.</p>

<h2>Track the shipment on this website</h2>
<p>Once a sample or a courier production lot leaves Yiwu, we send a tracking number on the shipping notice. You can paste it on the shipping page tracker: <a href="https://applebearbaby.net/shipping#track">applebearbaby.net/shipping#track</a>.</p>
<ul>
<li>Choose China Post / EMS, DHL, FedEx, TNT, or Auto detect (17TRACK) if you are not sure which carrier was used.</li>
<li>The form opens the carrier’s own tracking page. We do not store the number on our server.</li>
<li>Sea freight does not use that box. For FCL/LCL you track on the bill of lading or inside your China forwarder’s portal — the same agent who booked the box.</li>
</ul>
<p>If the number on the notice does not match the dropdown, pick Auto detect first. If it is a warehouse receipt from model 1, there is nothing to paste here: your agent’s inbound scan is the next status, not DHL.</p>

<h2>What to send so the first freight quote is usable</h2>
<ul>
<li>Destination country (and port or airport if you already know it).</li>
<li>Trial vs bulk quantity, and a carton / CBM / kg estimate if you have one — we can also calculate from the packing list.</li>
<li>Whether you already have a China shipping agent, and their warehouse address if yes.</li>
<li>Preferred model: deliver to your agent, Alibaba air/sea/express, or FCL stuffing at the factory / at CY.</li>
<li>If FCL: Alibaba forwarder, your own line, inland only, or empty container to our gate.</li>
</ul>
<p>Reply with those five blocks and we can quote a lane — not a fake door-to-door price that hides who files customs. Use the <a href="https://applebearbaby.net/contact">contact form</a> or WhatsApp on this site, or RFQ on Alibaba if that is already your buying desk.</p>
<p>See also: <a href="https://applebearbaby.net/faq">OEM FAQ</a>, <a href="https://applebearbaby.net/blog/moq-samples-and-lead-time-what-to-ask-before-ordering-baby-bottles">MOQ, samples, and lead time</a>, and <a href="https://applebearbaby.net/shipping">factory shipping &amp; returns</a>.</p>
`

async function uploadCover() {
  try {
    await connectCloudinary()
    const result = await cloudinary.uploader.upload(COVER_FILE, {
      folder: 'blogs',
      public_id: 'oem-shipping-from-yiwu',
      overwrite: true,
      use_filename: true,
    })
    return result?.secure_url || result?.url || FALLBACK_IMAGE
  } catch (error) {
    console.warn('Cover upload failed, using fallback logo:', error.message)
    return FALLBACK_IMAGE
  }
}

async function main() {
  await connectDB()
  const image = await uploadCover()

  const payload = {
    title,
    slug: SLUG,
    excerpt,
    content,
    image,
    category: 'wholesale',
    author: 'AppleBear Baby',
    tags: ['shipping', 'FCL', 'Alibaba logistics', 'freight', 'OEM', 'wholesale', 'tracking'],
    readTime: 8,
    isPublished: true,
    indexable: true,
    translations: translationsFor(SLUG),
  }

  const existing = await blogModel.findOne({ slug: SLUG })
  if (existing) {
    Object.assign(existing, payload)
    await existing.save()
    invalidateSitemapCache()
    console.log(`Updated existing article: ${SLUG}`)
    console.log(`Image: ${image}`)
    process.exit(0)
  }

  await blogModel.create(payload)
  invalidateSitemapCache()
  console.log(`Created article: ${SLUG}`)
  console.log(`Image: ${image}`)
  process.exit(0)
}

main().catch((err) => {
  console.error('seed-oem-shipping-blog failed:', err)
  process.exit(1)
})
