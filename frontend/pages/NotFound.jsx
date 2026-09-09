import { Link } from 'react-router-dom'
import Seo from '../componets/Seo'

const LINKS = [
  { to: '/collection', label: 'Wholesale catalog' },
  { to: '/videos', label: 'Product videos' },
  { to: '/contact', label: 'Request a quote' },
  { to: '/about', label: 'About the factory' },
]

const NotFound = () => (
  <div className='page-shell bg-white'>
    <Seo
      title='Page Not Found'
      description='The page you requested could not be found on AppleBear Baby. Browse our wholesale catalog or contact the factory for a quote.'
      robots='noindex, follow'
    />
    <section className='section-container py-16 md:py-24'>
      <div className='max-w-xl mx-auto text-center'>
        <p className='text-sm font-semibold tracking-[0.18em] uppercase text-blue-600 mb-3'>Error 404</p>
        <p className='text-7xl sm:text-8xl font-extrabold leading-none text-slate-200 mb-4' aria-hidden='true'>
          404
        </p>
        <h1 className='corp-section-title mb-4'>Page not found</h1>
        <p className='text-slate-600 leading-relaxed mb-8'>
          This URL does not exist, or the page has been moved. You can return to the homepage or continue from the wholesale catalog.
        </p>
        <div className='flex flex-wrap items-center justify-center gap-3 mb-10'>
          <Link to='/' className='corp-btn px-6 py-3'>
            Back to homepage
          </Link>
          <Link to='/collection' className='corp-btn-outline px-6 py-3'>
            Browse catalog
          </Link>
        </div>
        <ul className='flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm'>
          {LINKS.map((item) => (
            <li key={item.to}>
              <Link to={item.to} className='text-blue-600 hover:underline'>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  </div>
)

export default NotFound
