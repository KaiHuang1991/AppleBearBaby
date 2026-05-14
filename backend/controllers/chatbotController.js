import {
  searchProductsForChat,
  formatProductsForClient,
  formatCatalogForPrompt,
  shouldAttachProductResults
} from '../utils/chatbotProductSearch.js'
import { buildSiteStructureBlock } from '../utils/siteStructureContext.js'

const MAX_TURNS = 12
const MAX_CONTENT_CHARS = 3500

/** Always injected unless already present (e.g. duplicated custom prompt). */
const SITE_OPERATIONS_KNOWLEDGE = `OFFICIAL SITE OPERATIONS (treat as accurate; do not contradict):

**Inquiries / quotes**
- **Guest (not logged in):** They cannot use the cart-based batch inquiry. Tell them to open the **Contact** page (path: /contact) and reach the store through the options shown there (contact form, email, WhatsApp, etc.).
- **Logged-in user:** They add items to **Cart** (path: /cart), choose sizes/quantities, then submit the **inquiry from the Cart page** so **multiple products** can be included in **one** inquiry with their message.
- If the user asks how to send an inquiry (including in Chinese), cover **both** paths when appropriate, or ask briefly whether they have an account if needed.

**Where things live**
- Browse: **Collection** (/collection). Product details: **Product** (/product/{id}). Cart: **Cart** (/cart). Contact: **Contact** (/contact). Account: **Login** (/login); signed-in users may use **Inquiries** (/inquiries) or **Profile** (/profile) where applicable.
- Adding to cart and the cart inquiry flow generally require being **signed in**; if they are not, point them to Contact for reaching the store.`

const defaultSystemPrompt = `You are the friendly customer assistant for AppleBearBaby, an online baby/kids products shop.
Answer clearly and concisely. If asked about shipping, returns, account issues, or anything you cannot verify from general shopping context, suggest contacting the store via the Contact page or email/WhatsApp shown on the site.
Reply in the same language the customer uses (Chinese or English). Never invent specific prices, stock levels, or policies—give general guidance and invite them to check product pages or staff for exact details.

When SITE_STRUCTURE_CONTEXT is included below, use it for questions about site navigation, which page to open, URL paths, layout, blogs vs shop, and the category tree. Do not invent pages, paths, or menus that are not described there.

${SITE_OPERATIONS_KNOWLEDGE}

When PRODUCT_CATALOG_JSON is included below your instructions, the shopper typed a product-related query; those rows match the same **product name** search used on the Collection (/collection) catalogue page. Recommend only from that JSON; if none fit, say so. If PRODUCT_CATALOG_JSON is omitted, do not imply that matching product cards were shown—answer normally.`

function resolveSystemPrompt() {
  let prompt = process.env.AI_CHATBOT_SYSTEM_PROMPT?.trim() || defaultSystemPrompt
  if (!prompt.includes('OFFICIAL SITE OPERATIONS')) {
    prompt = `${prompt}\n\n${SITE_OPERATIONS_KNOWLEDGE}`
  }
  return prompt
}

/** Supports DeepSeek (default), OpenAI, or any OpenAI-compatible /v1/chat/completions API. */
export const postChatMessage = async (req, res) => {
  try {
    const apiKey =
      process.env.DEEPSEEK_API_KEY?.trim() ||
      process.env.AI_CHAT_API_KEY?.trim() ||
      process.env.OPENAI_API_KEY?.trim()
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message:
          'AI assistant is not configured. Set DEEPSEEK_API_KEY (recommended) or AI_CHAT_API_KEY / OPENAI_API_KEY on the server.'
      })
    }

    const { messages } = req.body
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body must include a non-empty messages array.'
      })
    }

    const normalized = messages
      .slice(-MAX_TURNS)
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content ?? '').slice(0, MAX_CONTENT_CHARS).trim()
      }))
      .filter((m) => m.content.length > 0)

    if (!normalized.length) {
      return res.status(400).json({
        success: false,
        message: 'No valid message content found.'
      })
    }

    const model = process.env.AI_CHATBOT_MODEL || 'deepseek-chat'
    const baseUrl = (
      process.env.DEEPSEEK_BASE_URL ||
      process.env.OPENAI_BASE_URL ||
      'https://api.deepseek.com/v1'
    ).replace(/\/$/, '')
    const systemPrompt = resolveSystemPrompt()
    const siteStructure = await buildSiteStructureBlock()
    let systemContent = `${systemPrompt}\n\nSITE_STRUCTURE_CONTEXT:\n${siteStructure}`

    const lastUserMsg = [...normalized].reverse().find((m) => m.role === 'user')
    let productsOut = []

    if (lastUserMsg?.content && shouldAttachProductResults(lastUserMsg.content)) {
      const matched = await searchProductsForChat(lastUserMsg.content, { limit: 8 })
      productsOut = formatProductsForClient(matched)
      if (matched.length > 0) {
        const catalog = formatCatalogForPrompt(matched)
        systemContent = `${systemContent}\n\nPRODUCT_CATALOG_JSON:\n${JSON.stringify(catalog)}`
      }
    }

    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemContent }, ...normalized],
        max_tokens: 900,
        temperature: 0.55
      })
    })

    const rawText = await upstream.text()
    let data
    try {
      data = JSON.parse(rawText)
    } catch {
      console.error('Chat upstream non-JSON:', upstream.status, rawText.slice(0, 500))
      return res.status(502).json({
        success: false,
        message: 'AI service returned an invalid response.'
      })
    }

    if (!upstream.ok) {
      console.error('Chat upstream error:', upstream.status, rawText.slice(0, 800))
      return res.status(502).json({
        success: false,
        message: data?.error?.message || 'AI service temporarily unavailable.'
      })
    }

    const reply = data?.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      return res.status(502).json({
        success: false,
        message: 'Empty reply from AI.'
      })
    }

    res.json({ success: true, reply, products: productsOut })
  } catch (error) {
    console.error('postChatMessage:', error)
    res.status(500).json({
      success: false,
      message: 'Could not complete chat request.'
    })
  }
}
