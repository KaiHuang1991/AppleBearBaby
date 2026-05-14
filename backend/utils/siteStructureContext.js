import categoryModel from '../models/categoryModel.js'
import productModel from '../models/productModel.js'
import blogModel from '../models/blogModel.js'

/** Matches frontend `App.jsx` routes; keep in sync when routes change. */
export const STATIC_SITE_STRUCTURE = `SITE_MAP (AppleBearBaby storefront — single-page app paths only; do not invent URLs):

Layout: Global NavBar + Footer on all pages. Home (/) is full-width hero/content; other routes render inside a ~80% width main column on larger screens.

Routes:
- / — Home (featured content, entry to shop).
- /collection — Product catalogue with category tree filters and search on this page (filters do not use separate URLs per category).
- /product/{productId} — Product detail (sizes, attributes, images). Add to cart requires sign-in where enforced by the site.
- /cart — Shopping cart; signed-in users submit cart inquiries / batch quote-style messages from here.
- /contact — Reach the store (guest-friendly): contact options shown on the page (form, email, WhatsApp, etc.).
- /login — Sign in / register; email flows include /verify-email/:token, /awaiting-verification, /reset-password/:token.
- /place-order — Order placement step when checkout applies.
- /inquiries — Signed-in: past inquiries list when available.
- /profile — Signed-in: account profile.
- /blogs — Blog listing; /blog/{id} — single article (id from listings API).
- /about — About the shop.

Use these paths when directing users (prepend your public site origin only if the user explicitly needs a full URL).`

function walkCategoryTree(byParent, parentKey, depth, maxDepth) {
  if (depth > maxDepth) return []
  const nodes = byParent.get(parentKey)
  if (!nodes?.length) return []

  const lines = []
  for (const n of nodes) {
    lines.push(`${'  '.repeat(depth)}• ${n.name}`)
    lines.push(...walkCategoryTree(byParent, String(n._id), depth + 1, maxDepth))
  }
  return lines
}

async function formatCategoryTreeText() {
  const cats = await categoryModel
    .find({ isActive: true })
    .select('name parent')
    .sort({ name: 1 })
    .lean()

  if (!cats.length) return '(No active categories in database.)'

  const ids = new Set(cats.map((c) => String(c._id)))
  const byParent = new Map()

  for (const c of cats) {
    const key = c.parent ? String(c.parent) : '__root__'
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key).push(c)
  }

  const lines = walkCategoryTree(byParent, '__root__', 0, 10)
  const orphans = cats.filter((c) => c.parent && !ids.has(String(c.parent)))

  if (orphans.length) {
    lines.push('\n(Unattached categories — parent missing:)')
    for (const o of orphans.slice(0, 30)) {
      lines.push(`• ${o.name}`)
    }
  }

  return lines.join('\n').slice(0, 12000)
}

let cache = { ts: 0, block: '' }
const TTL_MS = Number(process.env.AI_SITE_CONTEXT_CACHE_MS) || 120000

/**
 * Rich context so the model answers navigation / “how do I…” questions from real routes + DB.
 * Cached briefly to limit Mongo reads per chat burst.
 */
export async function buildSiteStructureBlock() {
  const now = Date.now()
  if (cache.block && now - cache.ts < TTL_MS) {
    return cache.block
  }

  try {
    const [productCount, publishedBlogCount, categoryTree] = await Promise.all([
      productModel.countDocuments(),
      blogModel.countDocuments({ isPublished: true }),
      formatCategoryTreeText()
    ])

    const live = `LIVE_SITE_SNAPSHOT (database; cached ~${Math.round(TTL_MS / 1000)}s):
- Active products listed in catalogue (approx.): ${productCount}
- Published blog articles (approx.): ${publishedBlogCount}

ACTIVE_CATEGORY_TREE (shown/filtered mainly on /collection):
${categoryTree}`

    const block = `${STATIC_SITE_STRUCTURE}\n\n${live}`
    cache = { ts: now, block }
    return block
  } catch (err) {
    console.error('buildSiteStructureBlock:', err)
    return `${STATIC_SITE_STRUCTURE}\n\n(LIVE_SITE_SNAPSHOT could not be loaded from the database.)`
  }
}
