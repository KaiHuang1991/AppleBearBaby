import { matchPath } from 'react-router-dom'
import { buildOrganizationNode } from '../oemFaq'
import i18n from '../i18n'
import { getLocaleFromPath, isHomePath, stripLocale, withLocale } from '../i18n/locales'

export const SITE = {
  name: 'AppleBear Baby',
  brand: 'AppleBearBaby',
  defaultImage: '/applebear.png',
  locale: 'en_US',
  twitterCard: 'summary_large_image',
}

const DEFAULT_KEYWORDS =
  'baby products wholesale, baby feeding bottles, baby care, BPA free bottles, daycare supplies, hospital baby products, AppleBearBaby'

export const ROUTE_SEO = {
  '/': {
    title: 'OEM Wholesale Baby Bottles',
    description:
      'OEM and wholesale baby bottles, sippy cups, and feeding products from AppleBear Baby in Yiwu. Factory quotes for brands, hospitals, and distributors since 1998.',
    keywords: DEFAULT_KEYWORDS,
    ogType: 'website',
    robots: 'index, follow',
  },
  '/collection': {
    title: 'Wholesale',
    description:
      'Browse the AppleBear Baby wholesale catalog: anti-colic feeding bottles, pacifiers, brushes, and baby care essentials with bulk pricing for professional buyers.',
    keywords: `${DEFAULT_KEYWORDS}, wholesale catalog, bulk baby bottles`,
    ogType: 'website',
    robots: 'index, follow',
  },
  '/about': {
    title: 'About',
    description:
      'AppleBear Baby is the brand HQ of Zhejiang YouZhi in Yiwu: ISO 9001, 12,000㎡, 7 lines, 2.5M monthly bottles. Alibaba (ywyouzhi.en.alibaba.com) is a sales channel for RFQs.',
    keywords: `${DEFAULT_KEYWORDS}, about AppleBear Baby, baby bottle factory Yiwu, ISO 9001, Alibaba sales channel`,
    ogType: 'website',
    robots: 'index, follow',
  },
  '/shipping': {
    title: 'Shipping & Returns',
    description:
      'AppleBear Baby factory shipping: samples by China Post, Alibaba express, DHL, FedEx or TNT; bulk by FCL/LCL sea freight or your China forwarder. Quality returns within 15 days.',
    keywords: `${DEFAULT_KEYWORDS}, wholesale shipping, sample courier, sea freight, FCL LCL, factory return policy`,
    ogType: 'website',
    robots: 'index, follow',
  },
  '/contact': {
    title: 'Contact',
    description:
      'Contact AppleBear Baby for wholesale quotes, bulk orders, and product inquiries. Our team supports hospitals, daycare centers, and distributors worldwide.',
    keywords: `${DEFAULT_KEYWORDS}, contact, wholesale inquiry, request quote`,
    ogType: 'website',
    robots: 'index, follow',
  },
  '/blogs': {
    title: 'OEM Buyer Guides',
    description:
      'Factory notes for OEM/ODM buyers: MOQ, samples, lead time, PP vs glass, and AppleBear Baby wholesale packing from Yiwu.',
    keywords: `${DEFAULT_KEYWORDS}, OEM baby bottles, wholesale buying guide, MOQ, samples, lead time`,
    ogType: 'website',
    robots: 'index, follow',
  },
  '/faq': {
    title: 'OEM FAQ',
    description:
      'AppleBear Baby OEM FAQ from the Yiwu factory: MOQ, lead time, ISO 9001, PP and glass bottles, private-label print, samples, and bulk shipping for wholesale buyers.',
    keywords: `${DEFAULT_KEYWORDS}, OEM baby bottle FAQ, baby bottle MOQ China, OEM lead time`,
    ogType: 'website',
    robots: 'index, follow',
  },
  '/videos': {
    title: 'Videos',
    description:
      'Watch AppleBear Baby product demos, factory tours, and how-to videos for wholesale buyers and childcare professionals.',
    keywords: `${DEFAULT_KEYWORDS}, product videos, factory tour, baby bottle demo`,
    ogType: 'website',
    robots: 'index, follow',
  },
  '/cart': {
    title: 'Cart',
    description: 'Your wholesale inquiry cart at AppleBear Baby.',
    robots: 'noindex, nofollow',
  },
  '/login': {
    title: 'Login',
    description: 'Sign in to your AppleBear Baby wholesale account.',
    robots: 'noindex, nofollow',
  },
  '/profile': {
    title: 'Profile',
    description: 'Manage your AppleBear Baby account profile.',
    robots: 'noindex, nofollow',
  },
  '/inquiries': {
    title: 'Inquiries',
    description: 'View your wholesale product inquiries with AppleBear Baby.',
    robots: 'noindex, nofollow',
  },
  '/place-order': {
    title: 'Place Order',
    description: 'Complete your wholesale inquiry with AppleBear Baby.',
    robots: 'noindex, nofollow',
  },
  '/awaiting-verification': {
    title: 'Awaiting Verification',
    description: 'Verify your AppleBear Baby account email address.',
    robots: 'noindex, nofollow',
  },
}

const PATTERN_SEO = [
  { pattern: '/collection/:categorySlug', entry: ROUTE_SEO['/collection'] },
  { pattern: '/inquiries/:id', entry: { title: 'Inquiry', description: 'Inquiry conversation with AppleBear Baby.', robots: 'noindex, nofollow' } },
  { pattern: '/verify-email/:token', entry: { title: 'Verify Email', description: 'Verify your AppleBear Baby email.', robots: 'noindex, nofollow' } },
  { pattern: '/reset-password/:token', entry: { title: 'Reset Password', description: 'Reset your AppleBear Baby account password.', robots: 'noindex, nofollow' } },
]

/** Routes that provide their own full SEO (Helmet) */
export const SEO_OWNED_PATTERNS = [
  '/product/:productId',
  '/blog/:blogKey',
  '/blog/:id',
  '/collection/:categorySlug',
  '/faq',
]

export function isSeoOwnedRoute(pathname) {
  const stripped = stripLocale(pathname)
  return SEO_OWNED_PATTERNS.some((pattern) => matchPath({ path: pattern, end: true }, stripped))
}

export function getRouteSeo(pathname) {
  const locale = getLocaleFromPath(pathname)
  const stripped = stripLocale(pathname)
  const t = i18n.getFixedT(locale)
  let entry = ROUTE_SEO[stripped] ? { ...ROUTE_SEO[stripped] } : null

  if (!entry) {
    for (const { pattern, entry: patternEntry } of PATTERN_SEO) {
      if (matchPath({ path: pattern, end: true }, stripped)) {
        entry = { ...patternEntry }
        break
      }
    }
  }

  if (!entry) {
    return {
      title: t('notFound.title'),
      description: t('notFound.text'),
      ogType: 'website',
      robots: 'noindex, follow',
      locale,
    }
  }

  if (ROUTE_SEO[stripped]) {
    const seoTitle = t(`seo.${stripped}.title`, { defaultValue: entry.title })
    const seoDescription = t(`seo.${stripped}.description`, { defaultValue: entry.description })
    entry.title = seoTitle
    entry.description = seoDescription
  }

  return { ...entry, locale }
}

export function getHomeJsonLd(locale) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const collectionPath = withLocale('/collection', locale)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildOrganizationNode(origin),
      {
        '@type': 'WebSite',
        name: SITE.name,
        url: origin || undefined,
        inLanguage: locale === 'zh' ? 'zh-Hans' : locale,
        potentialAction: {
          '@type': 'SearchAction',
          target: origin ? `${origin}${collectionPath}?search={search_term_string}` : undefined,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }
}
