/**
 * Server-rendered TDK for indexable static routes.
 * Keep in sync with frontend/src/seo/config.js ROUTE_SEO.
 */
export const STATIC_PAGE_SEO = {
  home: {
    path: '/',
    title: 'Home',
    heading: 'One-Stop Baby Bottle & Sippy Cup Manufacturer',
    description:
      'AppleBear Baby — wholesale supplier of safe baby feeding bottles, pacifiers, and care products for hospitals, daycare centers, and retailers worldwide since 1998.',
    keywords:
      'baby products wholesale, baby feeding bottles, baby care, BPA free bottles, daycare supplies, hospital baby products, AppleBearBaby',
  },
  collection: {
    path: '/collection',
    title: 'Wholesale',
    heading: 'Wholesale Baby Feeding Catalog',
    description:
      'Browse the AppleBear Baby wholesale catalog: anti-colic feeding bottles, pacifiers, brushes, and baby care essentials with bulk pricing for professional buyers.',
    keywords:
      'baby products wholesale, baby feeding bottles, wholesale catalog, bulk baby bottles, AppleBearBaby',
  },
  about: {
    path: '/about',
    title: 'About',
    heading: 'About AppleBear Baby',
    description:
      'Learn about AppleBear Baby — trusted wholesale baby care partner since 1998, serving healthcare facilities, daycare centers, and retailers with quality and reliable supply.',
    keywords:
      'about AppleBear Baby, baby product manufacturer, OEM ODM baby bottles, AppleBearBaby',
  },
  contact: {
    path: '/contact',
    title: 'Contact',
    heading: 'Contact AppleBear Baby',
    description:
      'Contact AppleBear Baby for wholesale quotes, bulk orders, and product inquiries. Our team supports hospitals, daycare centers, and distributors worldwide.',
    keywords: 'contact, wholesale inquiry, request quote, AppleBear Baby',
  },
  shipping: {
    path: '/shipping',
    title: 'Shipping & Returns',
    heading: 'Shipping & returns for wholesale buyers',
    description:
      'AppleBear Baby factory shipping: samples by China Post, Alibaba express, DHL, FedEx or TNT; bulk by FCL/LCL sea freight or your China forwarder. Quality returns within 15 days.',
    keywords:
      'wholesale shipping, sample courier, sea freight, FCL LCL, factory return policy, AppleBearBaby',
  },
  blogs: {
    path: '/blogs',
    title: 'Blog',
    heading: 'Baby Care Blog',
    description:
      'Expert articles on baby nursing, feeding, safety, and wholesale buying guides from the AppleBear Baby team.',
    keywords: 'baby blog, feeding tips, baby care advice, wholesale buying guide, AppleBearBaby',
  },
  videos: {
    path: '/videos',
    title: 'Videos',
    heading: 'Product Videos',
    description:
      'Watch AppleBear Baby product demos, factory tours, and how-to videos for wholesale buyers and childcare professionals.',
    keywords: 'product videos, factory tour, baby bottle demo, AppleBearBaby',
  },
}

export function resolveStaticPageKey(param = '') {
  const key = String(param || 'home')
    .replace(/^\//, '')
    .toLowerCase()
  if (!key || key === 'index') return 'home'
  return STATIC_PAGE_SEO[key] ? key : null
}
