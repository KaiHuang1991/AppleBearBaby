import { useLocation } from 'react-router-dom'
import Seo from './Seo'
import { getHomeJsonLd, getRouteSeo, isSeoOwnedRoute } from '../src/seo/config'

/**
 * Route-based SEO for all pages except product/blog detail (they use <Seo /> directly).
 */
const SiteSeo = () => {
  const { pathname } = useLocation()

  if (isSeoOwnedRoute(pathname)) {
    return null
  }

  const meta = getRouteSeo(pathname)
  const jsonLd = pathname === '/' ? getHomeJsonLd() : undefined

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
