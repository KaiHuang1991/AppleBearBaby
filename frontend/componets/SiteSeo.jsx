import { useLocation } from 'react-router-dom'
import Seo from './Seo'
import { getHomeJsonLd, getRouteSeo, isSeoOwnedRoute } from '../src/seo/config'
import { getLocaleFromPath, isHomePath } from '../src/i18n/locales'

/**
 * Route-based SEO for all pages except product/blog detail (they use <Seo /> directly).
 */
const SiteSeo = () => {
  const { pathname } = useLocation()

  if (isSeoOwnedRoute(pathname)) {
    return null
  }

  const locale = getLocaleFromPath(pathname)
  const meta = getRouteSeo(pathname)
  const jsonLd = isHomePath(pathname) ? getHomeJsonLd(locale) : undefined

  return (
    <Seo
      title={meta.title}
      description={meta.description}
      keywords={meta.keywords}
      ogType={meta.ogType || 'website'}
      robots={meta.robots || 'index, follow'}
      jsonLd={jsonLd}
    />
  )
}

export default SiteSeo
