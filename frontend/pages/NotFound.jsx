import Seo from '../componets/Seo'
import { LocaleLink } from '../componets/LocaleLink'
import { useTranslation } from 'react-i18next'

const LINKS = [
  { to: '/collection', key: 'catalog' },
  { to: '/videos', key: 'videos' },
  { to: '/contact', key: 'quote' },
  { to: '/about', key: 'about' },
]

const NotFound = () => {
  const { t } = useTranslation()
  return (
  <div className='page-shell bg-white'>
    <Seo
      title={t('notFound.title')}
      description={t('notFound.text')}
      robots='noindex, follow'
    />
    <section className='section-container py-16 md:py-24'>
      <div className='max-w-xl mx-auto text-center'>
        <p className='text-sm font-semibold tracking-[0.18em] uppercase text-blue-600 mb-3'>Error 404</p>
        <p className='text-7xl sm:text-8xl font-extrabold leading-none text-slate-200 mb-4' aria-hidden='true'>
          404
        </p>
        <h1 className='corp-section-title mb-4'>{t('notFound.title')}</h1>
        <p className='text-slate-600 leading-relaxed mb-8'>
          {t('notFound.text')}
        </p>
        <div className='flex flex-wrap items-center justify-center gap-3 mb-10'>
          <LocaleLink to='/' className='corp-btn px-6 py-3'>
            {t('notFound.home')}
          </LocaleLink>
          <LocaleLink to='/collection' className='corp-btn-outline px-6 py-3'>
            {t('notFound.catalog')}
          </LocaleLink>
        </div>
        <ul className='flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm'>
          {LINKS.map((item) => (
            <li key={item.to}>
              <LocaleLink to={item.to} className='text-blue-600 hover:underline'>
                {t(`notFound.links.${item.key}`)}
              </LocaleLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  </div>
  )
}

export default NotFound
