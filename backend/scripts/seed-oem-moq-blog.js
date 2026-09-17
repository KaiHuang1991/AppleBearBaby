/**
 * OEM buyer-decision article: MOQ, samples, lead time.
 * Usage: node scripts/seed-oem-moq-blog.js
 */
import 'dotenv/config'
import connectDB from '../config/mongodb.js'
import blogModel from '../models/blogModel.js'
import { invalidateSitemapCache } from '../utils/sitemapService.js'

const SLUG = 'moq-samples-and-lead-time-what-to-ask-before-ordering-baby-bottles'
const title = 'MOQ, Samples, and Lead Time: What to Ask Before Ordering Baby Bottles'
const excerpt =
  'A Yiwu factory checklist for OEM buyers: realistic MOQ, how many samples to request, and lead time from mold to FCL — before you send a baby-bottle RFQ.'
const image = 'https://res.cloudinary.com/dzskx10vu/image/upload/v1763529649/logo_mrflxn.png'

const content = `<p class="geo-answer">AppleBear Baby (Zhejiang YouZhi, Yiwu) typically starts stock PP bottles with an existing mold from one carton — 144 pieces on models such as AB-101. Custom color, private-label print, or gift-set packing can raise the floor to several thousand pieces. Quotes take 1–3 working days; stock samples pack in about 3–7 days; mass production after sample sign-off is commonly 15–25 days. Split the RFQ into stock, print, and gift-set lines so each MOQ is usable.</p>
<h2>Start with the decision, not the SKU photo</h2>
<p>Most first RFQs to a Chinese baby-bottle factory list a capacity and a color. The quote that comes back is only useful if you also lock three commercial facts: minimum order quantity, what a sample run actually includes, and how many calendar days sit between approved sample and loaded container. This note is how AppleBear Baby (Zhejiang YouZhi, Yiwu) answers those three questions for OEM and wholesale buyers.</p>
<p>applebearbaby.net is the brand headquarters. If you already source on Alibaba, the same factory also takes RFQs at ywyouzhi.en.alibaba.com — treat that store as a sales channel, not a second brand.</p>

<h2>MOQ: ask for the real bottleneck</h2>
<p>MOQ on feeding bottles is rarely “one carton.” It is usually the larger of: (1) one injection / blow-molding batch for the bottle body, (2) one silicone nipple or collar color run, and (3) printed sleeve or gift-box print minimum. A 240ml PP bottle that looks like a stock SKU on the catalog can still have a print MOQ of a few thousand pieces if you want your logo on the sleeve.</p>
<p>When you write the RFQ, split the quantity:</p>
<ul>
<li>Stock color / stock print — we can often start from a lower carton MOQ on running models.</li>
<li>Custom color or private-label print — expect the print or color masterbatch to set the floor.</li>
<li>Gift set (bottle + bib + brush) — MOQ follows the slowest component, not the bottle alone.</li>
</ul>
<p>If you only need 500–1,000 pieces to test a market, say so. We will tell you whether that is a sample-price run, a mixed-carton trial, or not economical on that mold.</p>

<h2>Samples: what to request before you approve a mold</h2>
<p>A useful sample pack is not one pretty bottle. Ask for:</p>
<ul>
<li>The bottle body in the resin you will buy (PP or glass) and the neck type (standard or wide).</li>
<li>The nipple/teat in the silicone grade and hole size you will sell.</li>
<li>The collar, handle, and any gift-set extras in the same color family.</li>
<li>Export carton markings and a photo of inner packing, so your warehouse can plan.</li>
</ul>
<p>Samples from Yiwu usually go by China Post small packet, Alibaba online express, or DHL / FedEx / TNT. Freight is quoted with the sample; it is not a free retail shipping promo. If you later change the mold or the print plate, treat that as a new sample — do not assume the first courier parcel is the production standard.</p>

<h2>Lead time: sample, mass production, and the ocean</h2>
<p>A realistic calendar for a running PP bottle with existing mold looks like this:</p>
<ul>
<li>Quote and packing list: 1–3 working days after a complete RFQ (model, resin, volume, print, destination port).</li>
<li>Stock or near-stock sample: about 3–7 days to pack, plus courier transit.</li>
<li>Mass production after sample sign-off: commonly 15–25 days depending on line loading and print.</li>
<li>Ocean FCL/LCL: add the lane (often 18–45 days transit depending on destination). Air is faster and priced separately.</li>
</ul>
<p>New molds, new silicone tools, or a full gift-set redesign sit on a longer clock. Ask for mold lead time as its own line — do not bury it inside “production 20 days.”</p>

<h2>PP vs glass, EU vs US — put it in the same RFQ</h2>
<p>Resin and market decide testing, not just price. PP is the everyday OEM workhorse for gift sets and handled bottles — that is the line we run. We also make borosilicate glass (60ml / 120ml / 200ml standard-neck). We do not manufacture PPSU; do not send a PPSU spec expecting a quote on our PP molds. If you sell into the EU, say so and we attach the food-contact reports that match that SKU family. US buyers should name the state or channel so packing and warnings can follow. Mixing “EU listing” and “US daycare” on one unlabeled RFQ is how quotes miss a test or a carton mark.</p>

<h2>What to send so the first quote is usable</h2>
<ul>
<li>Target monthly or first-order quantity, and whether that is trial or ongoing.</li>
<li>Resin (PP or glass), capacity, neck, and whether you need private-label print. We do not run PPSU.</li>
<li>Destination country, sample vs bulk, and whether you already have a China forwarder.</li>
<li>Any certificate you must show your customer (ISO 9001 is factory-level; product reports are SKU-level).</li>
</ul>
<p>Reply with those four blocks and we can quote MOQ, sample contents, and a dated production window — not a catalog unit price that looks like retail. Use the contact form or WhatsApp on this site, or RFQ on Alibaba if that is already your buying desk.</p>
<p>See also: <a href="https://applebearbaby.net/faq">OEM FAQ</a>, <a href="https://applebearbaby.net/blog/how-we-ship-oem-orders-from-yiwu-your-agent-alibaba-logistics-or-fcl">how we ship OEM orders from Yiwu</a>, <a href="https://applebearbaby.net/blog/pp-vs-ppsu-vs-glass-baby-bottles-which-material-to-specify-in-an-oem-rfq">PP vs glass</a>, and stock PP models such as <a href="https://applebearbaby.net/product/240ml-bpa-free-baby-feeding-bottle-with-silicone-nipple">812 240ml wide-neck</a> or <a href="https://applebearbaby.net/blog/8005c-5-piece-pp-bottle-gift-set-oem-160ml-and-240ml-with-bib-and-brush">8005C gift set</a>.</p>
`

async function main() {
  await connectDB()

  const existing = await blogModel.findOne({ slug: SLUG })
  const payload = {
    title,
    slug: SLUG,
    excerpt,
    content,
    image,
    category: 'wholesale',
    author: 'AppleBear Baby',
    tags: ['MOQ', 'samples', 'lead time', 'OEM', 'wholesale', 'PP bottles'],
    readTime: 7,
    isPublished: true,
    indexable: true,
  }

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
  console.error('seed-oem-moq-blog failed:', err)
  process.exit(1)
})
