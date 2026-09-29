/**
 * Server-rendered TDK for indexable static routes.
 * Keep in sync with frontend/src/seo/config.js ROUTE_SEO.
 */
import { DEFAULT_LOCALE, normalizeLocale, withLocale } from './locales.js'

export const STATIC_PAGE_SEO = {
  home: {
    path: '/',
    title: 'OEM Wholesale Baby Bottles',
    heading: 'One-Stop Baby Bottle & Sippy Cup Manufacturer',
    description:
      'OEM and wholesale baby bottles, sippy cups, and feeding products from AppleBear Baby in Yiwu. Factory quotes for brands, hospitals, and distributors since 1998.',
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
      'AppleBear Baby is the brand HQ of Zhejiang YouZhi in Yiwu: ISO 9001, 12,000㎡, 7 lines, 2.5M monthly bottles. Alibaba (ywyouzhi.en.alibaba.com) is a sales channel for RFQs.',
    keywords:
      'about AppleBear Baby, baby bottle factory Yiwu, ISO 9001, OEM ODM baby bottles, Alibaba sales channel, AppleBearBaby',
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
    title: 'OEM Buyer Guides',
    heading: 'OEM & Wholesale Buyer Guides',
    description:
      'Factory notes for OEM/ODM buyers: MOQ, samples, lead time, PP vs glass, and AppleBear Baby wholesale packing from Yiwu.',
    keywords: 'OEM baby bottles, wholesale buying guide, MOQ, samples, lead time, PP vs glass, AppleBearBaby',
  },
  videos: {
    path: '/videos',
    title: 'Videos',
    heading: 'Product Videos',
    description:
      'Watch AppleBear Baby product demos, factory tours, and how-to videos for wholesale buyers and childcare professionals.',
    keywords: 'product videos, factory tour, baby bottle demo, AppleBearBaby',
  },
  faq: {
    path: '/faq',
    title: 'OEM FAQ',
    heading: 'OEM FAQ for AppleBear Baby',
    description:
      'AppleBear Baby OEM FAQ from the Yiwu factory: MOQ, lead time, ISO 9001, PP and glass bottles, private-label print, samples, and bulk shipping for wholesale buyers.',
    keywords:
      'OEM baby bottle FAQ, baby bottle MOQ China, OEM lead time, ISO 9001 baby bottle factory Yiwu, AppleBearBaby',
  },
}

export function resolveStaticPageKey(param = '') {
  const key = String(param || 'home')
    .replace(/^\//, '')
    .toLowerCase()
  if (!key || key === 'index') return 'home'
  return STATIC_PAGE_SEO[key] ? key : null
}

export const STATIC_PAGE_I18N = {
  zh: {
    home: {
      title: 'OEM 批发奶瓶工厂',
      heading: '一站式奶瓶与学饮杯工厂',
      description: '义乌 AppleBear Baby 提供 OEM 与批发奶瓶、学饮杯及喂养用品。自 1998 年起为品牌、医院与经销商提供工厂报价。',
    },
    collection: {
      title: '批发目录',
      heading: '批发婴幼儿喂养目录',
      description: '浏览 AppleBear Baby 批发目录：防胀气奶瓶、安抚奶嘴、奶瓶刷及婴幼儿护理用品，专业买家批量价格。',
    },
    about: {
      title: '关于我们',
      heading: '关于 AppleBear Baby',
      description: 'AppleBear Baby 是浙江佑智在义乌的品牌总部：ISO 9001、12,000㎡、7 条产线、月产 250 万只奶瓶。阿里巴巴是询盘销售渠道。',
    },
    contact: {
      title: '联系我们',
      heading: '联系 AppleBear Baby',
      description: '联系 AppleBear Baby 获取批发报价、批量订单与产品咨询。团队服务全球医院、托幼机构与经销商。',
    },
    shipping: {
      title: '物流与退货',
      heading: '批发买家的物流与退货',
      description: 'AppleBear Baby 工厂物流：样品走中国邮政、阿里国际快递、DHL、FedEx 或 TNT；大货整柜/拼柜海运或您的国内货代。质量问题 15 日内处理。',
    },
    blogs: {
      title: 'OEM 采购指南',
      heading: 'OEM 与批发采购指南',
      description: '面向 OEM/ODM 买家的工厂说明：起订量、样品、交期、PP 与玻璃，以及义乌 AppleBear Baby 批发包装。',
    },
    videos: {
      title: '视频',
      heading: '产品视频',
      description: '观看 AppleBear Baby 产品演示、工厂参观与操作视频，面向批发买家与托幼专业人士。',
    },
    faq: {
      title: 'OEM 常见问题',
      heading: 'AppleBear Baby OEM 常见问题',
      description: '义乌工厂 AppleBear Baby OEM 常见问题：起订量、交期、ISO 9001、PP 与玻璃奶瓶、贴牌印刷、样品与大货运费。',
    },
  },
  es: {
    home: {
      title: 'Biberones OEM al por mayor',
      heading: 'Fábrica integral de biberones y vasos de aprendizaje',
      description: 'Biberones, vasos y productos de alimentación OEM y mayoristas de AppleBear Baby en Yiwu. Cotizaciones de fábrica para marcas, hospitales y distribuidores desde 1998.',
    },
    collection: {
      title: 'Mayoreo',
      heading: 'Catálogo mayorista de alimentación infantil',
      description: 'Catálogo mayorista AppleBear Baby: biberones anticólicos, chupetes, cepillos y esenciales de cuidado infantil con precios por volumen.',
    },
    about: {
      title: 'Nosotros',
      heading: 'Sobre AppleBear Baby',
      description: 'AppleBear Baby es la sede de marca de Zhejiang YouZhi en Yiwu: ISO 9001, 12.000㎡, 7 líneas, 2,5 M de biberones al mes. Alibaba es un canal de RFQ.',
    },
    contact: {
      title: 'Contacto',
      heading: 'Contactar AppleBear Baby',
      description: 'Contacte AppleBear Baby para cotizaciones mayoristas, pedidos a granel y consultas de producto. Equipo para hospitales, guarderías y distribuidores.',
    },
    shipping: {
      title: 'Envíos y devoluciones',
      heading: 'Envíos y devoluciones para mayoristas',
      description: 'Logística de fábrica AppleBear Baby: muestras por China Post, express Alibaba, DHL, FedEx o TNT; granel FCL/LCL o su forwarder en China. Reclamaciones de calidad en 15 días.',
    },
    blogs: {
      title: 'Guías OEM',
      heading: 'Guías OEM y mayoristas',
      description: 'Notas de fábrica para compradores OEM/ODM: MOQ, muestras, plazos, PP vs vidrio y empaque mayorista AppleBear Baby desde Yiwu.',
    },
    videos: {
      title: 'Videos',
      heading: 'Videos de producto',
      description: 'Demos de producto, tours de fábrica y videos prácticos de AppleBear Baby para compradores mayoristas.',
    },
    faq: {
      title: 'FAQ OEM',
      heading: 'FAQ OEM de AppleBear Baby',
      description: 'FAQ OEM de AppleBear Baby en Yiwu: MOQ, plazos, ISO 9001, biberones de PP y vidrio, impresión de marca privada, muestras y flete a granel.',
    },
  },
  ar: {
    home: {
      title: 'زجاجات رضاعة OEM بالجملة',
      heading: 'مصنع متكامل لزجاجات الرضاعة وأكواب الشرب',
      description: 'زجاجات رضاعة وأكواب إطعام OEM وجملة من AppleBear Baby في ييوو. عروض أسعار المصنع للعلامات والمستشفيات والموزعين منذ 1998.',
    },
    collection: {
      title: 'الجملة',
      heading: 'كتالوج تغذية الأطفال بالجملة',
      description: 'تصفح كتالوج AppleBear Baby: زجاجات مضادة للمغص وتهدئة وفرش ومستلزمات عناية بأسعار الكميات.',
    },
    about: {
      title: 'من نحن',
      heading: 'عن AppleBear Baby',
      description: 'AppleBear Baby مقر علامة Zhejiang YouZhi في ييوو: ISO 9001 ومساحة 12,000㎡ و7 خطوط و2.5 مليون زجاجة شهريًا. علي بابا قناة RFQ.',
    },
    contact: {
      title: 'اتصل بنا',
      heading: 'اتصل بـ AppleBear Baby',
      description: 'تواصل مع AppleBear Baby لعروض الجملة والطلبات والاستفسارات. الفريق يدعم المستشفيات والحضانات والموزعين.',
    },
    shipping: {
      title: 'الشحن والإرجاع',
      heading: 'الشحن والإرجاع لمشتري الجملة',
      description: 'شحن مصنع AppleBear Baby: عينات عبر البريد الصيني أو علي بابا أو DHL/FedEx/TNT؛ كميات FCL/LCL أو وكيلكم في الصين. مطالبات الجودة خلال 15 يومًا.',
    },
    blogs: {
      title: 'أدلة OEM',
      heading: 'أدلة OEM والجملة',
      description: 'ملاحظات المصنع لمشتري OEM/ODM: الحد الأدنى والعينات ومدة التوريد وPP مقابل الزجاج وتعبئة الجملة من ييوو.',
    },
    videos: {
      title: 'الفيديو',
      heading: 'فيديوهات المنتجات',
      description: 'عروض المنتجات وجولات المصنع وفيديوهات عملية من AppleBear Baby لمشتري الجملة.',
    },
    faq: {
      title: 'أسئلة OEM',
      heading: 'أسئلة OEM لـ AppleBear Baby',
      description: 'أسئلة OEM من مصنع ييوو: الحد الأدنى ومدة التوريد وISO 9001 وزجاجات PP والزجاج والطباعة الخاصة والعينات وشحن الكميات.',
    },
  },
  fr: {
    home: {
      title: 'Biberons OEM en gros',
      heading: 'Usine complète de biberons et tasses d’apprentissage',
      description: 'Biberons, tasses et produits d’alimentation OEM et gros d’AppleBear Baby à Yiwu. Devis usine pour marques, hôpitaux et distributeurs depuis 1998.',
    },
    collection: {
      title: 'Gros',
      heading: 'Catalogue gros alimentation bébé',
      description: 'Catalogue gros AppleBear Baby : biberons anti-colique, sucettes, brosses et essentiels de puériculture à tarifs volume.',
    },
    about: {
      title: 'À propos',
      heading: 'À propos d’AppleBear Baby',
      description: 'AppleBear Baby est le QG de marque de Zhejiang YouZhi à Yiwu : ISO 9001, 12 000㎡, 7 lignes, 2,5 M de biberons/mois. Alibaba est un canal RFQ.',
    },
    contact: {
      title: 'Contact',
      heading: 'Contacter AppleBear Baby',
      description: 'Contactez AppleBear Baby pour devis gros, commandes volume et demandes produits. Équipe pour hôpitaux, crèches et distributeurs.',
    },
    shipping: {
      title: 'Expédition et retours',
      heading: 'Expédition et retours pour acheteurs gros',
      description: 'Logistique usine AppleBear Baby : échantillons par China Post, express Alibaba, DHL, FedEx ou TNT ; volumes FCL/LCL ou votre transitaire en Chine. Réclamations qualité sous 15 jours.',
    },
    blogs: {
      title: 'Guides OEM',
      heading: 'Guides OEM et gros',
      description: 'Notes d’usine pour acheteurs OEM/ODM : MOQ, échantillons, délais, PP vs verre et packing gros AppleBear Baby depuis Yiwu.',
    },
    videos: {
      title: 'Vidéos',
      heading: 'Vidéos produits',
      description: 'Démos produits, visites d’usine et tutoriels AppleBear Baby pour acheteurs gros.',
    },
    faq: {
      title: 'FAQ OEM',
      heading: 'FAQ OEM AppleBear Baby',
      description: 'FAQ OEM AppleBear Baby à Yiwu : MOQ, délais, ISO 9001, biberons PP et verre, impression private label, échantillons et fret volume.',
    },
  },
}

export function getStaticPageSeo(pageKey, locale = DEFAULT_LOCALE) {
  const base = STATIC_PAGE_SEO[pageKey]
  if (!base) return null
  const loc = normalizeLocale(locale)
  const overlay = loc === DEFAULT_LOCALE ? null : STATIC_PAGE_I18N[loc]?.[pageKey]
  return {
    ...base,
    ...(overlay || {}),
    path: withLocale(base.path, loc),
  }
}

