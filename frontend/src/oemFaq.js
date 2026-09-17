/**
 * OEM buyer FAQs for /faq, product pages, and FAQPage JSON-LD.
 * Keep in sync with backend/utils/oemFaq.js
 */
export const OEM_FAQS = [
  {
    question: 'What is the MOQ for OEM baby bottles at AppleBear Baby?',
    answer:
      'AppleBear Baby (Zhejiang YouZhi, Yiwu, China) typically starts stock PP models with an existing mold from one carton — 144 pieces on models such as AB-101. Custom color, private-label print, or gift-set packing can raise the floor to several thousand pieces when the print or masterbatch sets the minimum. Split the RFQ into stock, custom print, and gift-set lines to get a usable MOQ for each.',
  },
  {
    question: 'How long is the lead time for baby bottle OEM production?',
    answer:
      'After a complete RFQ, AppleBear Baby usually quotes in 1–3 working days. Stock or near-stock samples pack in about 3–7 days plus courier transit. Mass production after sample sign-off is commonly 15–25 days depending on line loading and print. New molds and silicone tools sit on a longer clock and should be quoted as their own line.',
  },
  {
    question: 'What certifications does AppleBear Baby have?',
    answer:
      'The factory in Yiwu holds ISO 9001:2015 quality management. Product-level EU food-contact and other SKU test reports are attached to the relevant bottle family, not as one blanket certificate for every item. Name the destination market (EU, US, or other) in the RFQ so the matching reports go with the quote.',
  },
  {
    question: 'What materials are available for OEM baby bottles?',
    answer:
      'AppleBear Baby’s bottle bodies are mainly food-grade PP for gift sets and volume wholesale, plus borosilicate glass (60ml, 120ml, and 200ml standard-neck SKUs). Nipples are food-grade silicone. We do not manufacture PPSU bottles. Silicone bottle bodies need a silicone line and are quoted separately from PP gift sets.',
  },
  {
    question: 'Can AppleBear Baby do custom logo printing and packaging?',
    answer:
      'Yes. Silk screen and heat transfer are the usual logo methods; color boxes, header cards, and gift-set artwork are OEM packing changes on existing molds. A new cartoon or a blank wall for private label is a print run, not a new bottle tool, unless you also change the mold.',
  },
  {
    question: 'Where is the AppleBear Baby factory located?',
    answer:
      'AppleBear Baby is the brand of Zhejiang YouZhi Maternal and Child Co., Ltd. in Yiwu, Zhejiang, China (No.9 Hengde Road, Niansanli Street). The plant is about 12,000㎡ with 7 production lines and more than 2.5 million bottles of monthly output, exporting to 30+ countries since 1998.',
  },
  {
    question: 'How do I get a sample from AppleBear Baby?',
    answer:
      'Request a sample on the contact form or WhatsApp. Stock samples typically pack in 3–7 days. They ship from Yiwu by China Post small packet, Alibaba online express, or DHL / FedEx / TNT. Freight is quoted with the sample; it is not a free retail shipping promo.',
  },
  {
    question: 'What shipping methods are available for bulk orders?',
    answer:
      'Buyers with a China agent receive cartons at the warehouse they name, with a signed POD. Buyers without an agent are quoted air, sea (LCL/FCL), or express on Alibaba logistics by carton count, CBM, and weight. Full containers can use Alibaba freight partners or the buyer’s own line; factory stuffing labor is included when the empty box is loaded at the plant.',
  },
]

export const PRODUCT_FAQS = OEM_FAQS.filter((item) =>
  [
    'What is the MOQ for OEM baby bottles at AppleBear Baby?',
    'How long is the lead time for baby bottle OEM production?',
    'What certifications does AppleBear Baby have?',
    'Can AppleBear Baby do custom logo printing and packaging?',
    'What shipping methods are available for bulk orders?',
  ].includes(item.question)
)

export function buildFaqPageJsonLd(origin = '', faqs = OEM_FAQS) {
  const site = String(origin || '').replace(/\/$/, '')
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
    url: site ? `${site}/faq` : undefined,
    isPartOf: site
      ? { '@type': 'WebSite', name: 'AppleBear Baby', url: site }
      : undefined,
  }
}

export function buildInlineFaqJsonLd(faqs = PRODUCT_FAQS) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export const ORGANIZATION_SAME_AS = [
  'https://ywyouzhi.en.alibaba.com',
  'https://www.facebook.com/Applebear88',
  'https://www.youtube.com/@user-iy7wk9in6g',
  'https://www.instagram.com/hjyd1234/',
  'https://www.tiktok.com/@applebearhu888',
]

export function buildOrganizationNode(origin = '') {
  const site = String(origin || '').replace(/\/$/, '')
  return {
    '@type': 'Organization',
    name: 'AppleBear Baby',
    legalName: 'Zhejiang YouZhi Maternal and Child Co., Ltd.',
    alternateName: 'AppleBearBaby',
    description:
      'Baby feeding bottle OEM/ODM manufacturer in Yiwu, Zhejiang, China. ISO 9001:2015; EU food-contact reports by SKU.',
    url: site || undefined,
    logo: site ? `${site}/applebear.png` : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'No.9 Hengde Road, Niansanli Street',
      addressLocality: 'Yiwu',
      addressRegion: 'Zhejiang',
      postalCode: '322000',
      addressCountry: 'CN',
    },
    areaServed: 'Worldwide',
    knowsAbout: [
      'OEM baby bottles',
      'wholesale feeding bottles',
      'PP baby bottles',
      'borosilicate glass baby bottles',
    ],
    sameAs: ORGANIZATION_SAME_AS,
  }
}
