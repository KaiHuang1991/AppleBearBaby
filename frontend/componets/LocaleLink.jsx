import { Link, NavLink } from 'react-router-dom'
import { stripLocale, withLocale } from '../src/i18n/locales'
import { useShopLocale } from '../src/i18n/localized'

function localizeTo(to, locale) {
  if (typeof to === 'string' && to.startsWith('/') && !to.startsWith('//')) {
    return withLocale(to, locale)
  }
  if (to && typeof to === 'object' && typeof to.pathname === 'string') {
    return { ...to, pathname: withLocale(to.pathname, locale) }
  }
  return to
}

function isHomeTo(to) {
  if (typeof to === 'string') return stripLocale(to) === '/'
  if (to && typeof to === 'object' && typeof to.pathname === 'string') {
    return stripLocale(to.pathname) === '/'
  }
  return false
}

export const LocaleLink = ({ to, ...props }) => {
  const locale = useShopLocale()
  return <Link to={localizeTo(to, locale)} {...props} />
}

export const LocaleNavLink = ({ to, end, ...props }) => {
  const locale = useShopLocale()
  return <NavLink to={localizeTo(to, locale)} end={end ?? isHomeTo(to)} {...props} />
}

export default LocaleLink
