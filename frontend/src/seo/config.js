import { matchPath } from 'react-router-dom'

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
    title: 'Home',
    description:
      'AppleBear Baby — wholesale supplier of safe baby feeding bottles, pacifiers, and care products for hospitals, daycare centers, and retailers worldwide since 1998.',
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
      'Learn about AppleBear Baby — trusted wholesale baby care partner since 1998, serving healthcare facilities, daycare centers, and retailers with quality and reliable supply.',
    keywords: `${DEFAULT_KEYWORDS}, about AppleBear Baby, baby product manufacturer`,
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
    title: 'Blog',
    description:
      'Expert articles on baby nursing, feeding, safety, and wholesale buying guides from the AppleBear Baby team.',
    keywords: `${DEFAULT_KEYWORDS}, baby blog, feeding tips, baby care advice`,
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
  { pattern: '/inquiries/:id', entry: { title: 'Inquiry', description: 'Inquiry conversation with AppleBear Baby.', robots: 'noindex, nofollow' } },
  { pattern: '/verify-email/:token', entry: { title: 'Verify Email', description: 'Verify your AppleBear Baby email.', robots: 'noindex, nofollow' } },
  { pattern: '/reset-password/:token', entry: { title: 'Reset Password', description: 'Reset your AppleBear Baby account password.', robots: 'noindex, nofollow' } },
]

/** Routes that provide their own full SEO (Helmet) */
export const SEO_OWNED_PATTERNS = ['/product/:productId', '/blog/:id']

export function isSeoOwnedRoute(pathname) {
  return SEO_OWNED_PATTERNS.some((pattern) => matchPath({ path: pattern, end: true }, pathname))
}

export function getRouteSeo(pathname) {
  if (ROUTE_SEO[pathname]) {
    return { ...ROUTE_SEO[pathname] }
  }

  for (const { pattern, entry } of PATTERN_SEO) {
    if (matchPath({ path: pattern, end: true }, pathname)) {
      return { ...entry }
    }
  }

  return {
    title: 'AppleBear Baby',
    description: ROUTE_SEO['/'].description,
    keywords: DEFAULT_KEYWORDS,
    ogType: 'website',
    robots: 'index, follow',
  }
}

export function getHomeJsonLd() {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: SITE.name,
        url: origin || undefined,
        logo: origin ? `${origin}${SITE.defaultImage}` : undefined,
      },
      {
        '@type': 'WebSite',
        name: SITE.name,
        url: origin || undefined,
        potentialAction: {
          '@type': 'SearchAction',
          target: origin ? `${origin}/collection?search={search_term_string}` : undefined,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }
}
