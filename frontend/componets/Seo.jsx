import { Helmet } from 'react-helmet-async'
import { SITE } from '../src/seo/config'
import { formatPageTitle, getCanonicalUrl, toAbsoluteUrl, truncate } from '../src/seo/utils'

/**
 * Unified SEO meta tags (title, description, OG, Twitter, robots, optional JSON-LD).
 */
const Seo = ({
  title,
  description,
  keywords,
  image,
  canonical,
  ogType = 'website',
  robots = 'index, follow',
  includeBrandInTitle = true,
  jsonLd,
}) => {
  const pageTitle = formatPageTitle(title, { includeBrand: includeBrandInTitle })
  const metaDescription = truncate(description || '', 160)
  const metaKeywords = keywords || ''
  const canonicalUrl = getCanonicalUrl(canonical)
  const ogImage = toAbsoluteUrl(image || SITE.defaultImage)

  return (
    <Helmet>
      <title>{pageTitle}</title>
      {metaDescription ? <meta name="description" content={metaDescription} /> : null}
      {metaKeywords ? <meta name="keywords" content={metaKeywords} /> : null}
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content={SITE.locale} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={pageTitle} />
      {metaDescription ? <meta property="og:description" content={metaDescription} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}

      <meta name="twitter:card" content={SITE.twitterCard} />
      <meta name="twitter:title" content={pageTitle} />
      {metaDescription ? <meta name="twitter:description" content={metaDescription} /> : null}
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}

      <meta name="robots" content={robots} />
      <meta name="author" content={SITE.brand} />

      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  )
}

export default Seo
