import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import { trackInquiryFormConversions } from '../src/googleAds'
import { homeImages } from '../src/assets/galleryAssets'

const WHATSAPP_URL = 'https://wa.me/8615867976938'

const BENEFITS = [
  'Response within 24 hours',
  'Free sample available',
  'Export to 30+ countries',
  'Flexible MOQ for wholesale partners',
]

const GetQuoteSection = () => {
  const { sendInquiryEmail, token } = useContext(ShopContext)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  })

  useEffect(() => {
    if (!token) return
    const userName = localStorage.getItem('userName')
    const userEmail = localStorage.getItem('userEmail')
    setForm((prev) => ({
      ...prev,
      ...(userName ? { name: userName } : {}),
      ...(userEmail ? { email: userEmail } : {}),
    }))
  }, [token])

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const parts = []
      if (form.company.trim()) parts.push(`Company: ${form.company.trim()}`)
      parts.push('')
      parts.push(form.message.trim())
      const message = parts.join('\n').trim()

      const formData = new FormData()
      formData.append('email', form.email.trim())
      formData.append('name', form.name.trim())
      formData.append('number', '')
      formData.append('products', JSON.stringify([]))
      formData.append('message', message)
      formData.append('attachments', JSON.stringify([]))

      const result = await sendInquiryEmail(formData)
      toast.success('Your request has been sent. We will respond within 24 hours.')
      if (result?.conversion) {
        trackInquiryFormConversions(result.conversion)
      }
      setForm({ name: '', email: '', company: '', message: '' })
    } catch (error) {
      toast.error(error.message || 'Failed to send your request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className='section-alt py-16 md:py-20'>
      <div className='section-container'>
        <div className='text-center mb-10 md:mb-12'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 mb-2'>Wholesale Inquiries</p>
          <h2 className='corp-section-title'>
            Get a <span className='text-blue-600'>Quote</span>
          </h2>
          <p className='corp-section-subtitle mx-auto mt-3'>
            Tell us your product requirements and order volume — our team will provide customized pricing within 24 hours.
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-10 lg:gap-14 items-stretch max-w-5xl mx-auto'>
          <div className='flex flex-col'>
            <div className='overflow-hidden rounded-xl border border-slate-200 mb-6 aspect-[16/10] lg:aspect-auto lg:flex-1 lg:min-h-[220px]'>
              <img
                src={homeImages.showroom}
                alt='Applebear product showroom'
                className='w-full h-full object-cover'
              />
            </div>
            <ul className='space-y-3 mb-6'>
              {BENEFITS.map((item) => (
                <li key={item} className='flex items-center gap-2.5 text-sm text-slate-600'>
                  <span className='flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold'>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={WHATSAPP_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] text-white font-semibold text-sm py-3 px-6 hover:bg-[#20bd5a] transition-colors w-full sm:w-auto'
            >
              WhatsApp Us
            </a>
          </div>

          <div className='corp-feature-card p-6 sm:p-8 h-full flex flex-col'>
            <h3 className='text-xl font-bold text-slate-800 mb-1'>Get a Free Quote</h3>
            <p className='text-slate-500 text-sm mb-6'>
              Fill in the form below or{' '}
              <Link to='/contact' className='text-blue-600 hover:underline'>
                visit our contact page
              </Link>
              {' '}for more options.
            </p>

            <form onSubmit={handleSubmit} className='space-y-4 flex-1 flex flex-col'>
              <div className='grid sm:grid-cols-2 gap-4'>
                <label className='block'>
                  <span className='text-sm font-medium text-slate-700'>
                    Your Name <span className='text-red-500'>*</span>
                  </span>
                  <input
                    type='text'
                    required
                    value={form.name}
                    onChange={updateField('name')}
                    placeholder='John Smith'
                    className='mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  />
                </label>
                <label className='block'>
                  <span className='text-sm font-medium text-slate-700'>
                    Email Address <span className='text-red-500'>*</span>
                  </span>
                  <input
                    type='email'
                    required
                    value={form.email}
                    onChange={updateField('email')}
                    placeholder='john@company.com'
                    className='mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  />
                </label>
              </div>

              <label className='block'>
                <span className='text-sm font-medium text-slate-700'>Company Name</span>
                <input
                  type='text'
                  value={form.company}
                  onChange={updateField('company')}
                  placeholder='Your Company Ltd.'
                  className='mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                />
              </label>

              <label className='block flex-1 flex flex-col'>
                <span className='text-sm font-medium text-slate-700'>
                  Message <span className='text-red-500'>*</span>
                </span>
                <textarea
                  required
                  value={form.message}
                  onChange={updateField('message')}
                  placeholder='Product type, quantity, customization requirements...'
                  rows={4}
                  className='mt-1.5 w-full flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none resize-y min-h-[100px] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                />
              </label>

              <button
                type='submit'
                disabled={loading}
                className='corp-btn w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed'
              >
                {loading ? 'Sending…' : 'Submit Quote Request'}
                {!loading && <span aria-hidden='true'>→</span>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default GetQuoteSection
