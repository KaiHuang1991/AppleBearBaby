import React, { useContext, useEffect, useMemo, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import { trackInquiryFormConversions } from '../src/googleAds'

const PREFERRED_SOFTWARE = ['WhatsApp', 'Email', 'Phone', 'WeChat', 'Telegram']

const WHATSAPP_URL = 'https://wa.me/8615867976938'
const PHONE_DISPLAY = '(+86) 15867976938'
const EMAIL_ADDRESS = '1034201254@qq.com'
const ALIBABA_URL = 'https://ywyouzhi.en.alibaba.com'
const ALIBABA_DISPLAY = 'ywyouzhi.en.alibaba.com'

const ContactInfoCard = ({ icon, title, children }) => (
  <div className='flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm h-full'>
    <div className='corp-icon-circle w-10 h-10 shrink-0' aria-hidden='true'>
      {icon}
    </div>
    <div className='min-w-0'>
      <p className='text-sm font-semibold text-slate-800 mb-1'>{title}</p>
      <div className='text-sm text-slate-500 leading-relaxed'>{children}</div>
    </div>
  </div>
)

const ContactIcons = {
  location: (
    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
    </svg>
  ),
  phone: (
    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
    </svg>
  ),
  email: (
    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
    </svg>
  ),
  whatsapp: (
    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
      <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
    </svg>
  ),
  clock: (
    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
    </svg>
  ),
  globe: (
    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' />
    </svg>
  ),
}

const Contact = () => {
  const { sendInquiryEmail, token } = useContext(ShopContext)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    country: '',
    phone: '',
    preferredSoftware: 'WhatsApp',
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

  const emailHref = useMemo(() => {
    if (typeof navigator === 'undefined') return `mailto:${EMAIL_ADDRESS}`
    if (/MicroMessenger/i.test(navigator.userAgent)) {
      return 'https://mail.qq.com/cgi-bin/qm_share?t=qm_mailto&email=MTAzNDIwMTI1NEBxcS5jb20%3D'
    }
    return `mailto:${EMAIL_ADDRESS}`
  }, [])

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const buildMessage = () => {
    const parts = []
    if (form.company.trim()) parts.push(`Company: ${form.company.trim()}`)
    if (form.country.trim()) parts.push(`Country: ${form.country.trim()}`)
    if (form.preferredSoftware) parts.push(`Preferred contact: ${form.preferredSoftware}`)
    if (form.message.trim()) {
      parts.push('')
      parts.push(form.message.trim())
    }
    return parts.join('\n').trim()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Please enter your name and email address')
      return
    }
    const message = buildMessage()
    if (!message) {
      toast.error('Please enter a message')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('email', form.email.trim())
      formData.append('name', form.name.trim())
      formData.append('number', form.phone.trim())
      formData.append('products', JSON.stringify([]))
      formData.append('message', message)
      formData.append('attachments', JSON.stringify([]))

      const result = await sendInquiryEmail(formData)
      toast.success('Your request has been sent. We will respond within 24 hours.')
      if (result?.conversion) {
        trackInquiryFormConversions(result.conversion)
      }
      setForm({
        name: '',
        email: '',
        company: '',
        country: '',
        phone: '',
        preferredSoftware: 'WhatsApp',
        message: '',
      })
    } catch (error) {
      toast.error(error.message || 'Failed to send your request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='page-shell bg-white'>
      <section
        className='page-hero page-hero--tall'
        style={{
          backgroundImage: 'url(https://s.alicdn.com/@sc02/kf/H56c71f1d8533465987410054de80328as.jpg?hasNWGrade=1)',
        }}
      >
        <div className='page-hero-content'>
          <h1>Contact Applebear</h1>
          <p>Reach our wholesale team for pricing, bulk orders, and partnership inquiries.</p>
        </div>
      </section>

      <section className='section-container py-16 md:py-24'>
        <div className='grid lg:grid-cols-2 gap-10 lg:gap-14 items-stretch'>
          <div className='flex flex-col h-full min-h-0'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 auto-rows-fr'>
              <ContactInfoCard icon={ContactIcons.location} title='Factory Address'>
                No.9 Hengde Road, Niansanli Street,<br />
                Yiwu City, Jinhua City,<br />
                Zhejiang Province, China
              </ContactInfoCard>
              <ContactInfoCard icon={ContactIcons.phone} title='Phone'>
                <a href={WHATSAPP_URL} target='_blank' rel='noopener noreferrer' className='hover:text-blue-600 transition-colors'>
                  {PHONE_DISPLAY}
                </a>
                <span className='block mt-1 text-xs'>(Add on WeChat as well)</span>
              </ContactInfoCard>
              <ContactInfoCard icon={ContactIcons.email} title='Email'>
                <a
                  href={emailHref}
                  {...(emailHref.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className='hover:text-blue-600 transition-colors break-all'
                >
                  {EMAIL_ADDRESS}
                </a>
              </ContactInfoCard>
              <ContactInfoCard icon={ContactIcons.whatsapp} title='WhatsApp'>
                <a href={WHATSAPP_URL} target='_blank' rel='noopener noreferrer' className='hover:text-blue-600 transition-colors'>
                  +86 15867976938
                </a>
              </ContactInfoCard>
              <ContactInfoCard icon={ContactIcons.clock} title='Business Hours'>
                Monday – Friday:<br />
                9:00 AM – 6:00 PM (CST)
              </ContactInfoCard>
              <ContactInfoCard icon={ContactIcons.globe} title='Alibaba'>
                <a href={ALIBABA_URL} target='_blank' rel='noopener noreferrer' className='hover:text-blue-600 transition-colors break-all'>
                  {ALIBABA_DISPLAY}
                </a>
              </ContactInfoCard>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 shrink-0'>
              <a
                href={emailHref}
                {...(emailHref.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className='inline-flex items-center justify-center gap-2 rounded-lg bg-sky-100 text-sky-700 font-semibold text-sm py-3.5 px-4 hover:bg-sky-200 transition-colors'
              >
                {ContactIcons.email}
                Send Email
              </a>
              <a
                href={WHATSAPP_URL}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] text-white font-semibold text-sm py-3.5 px-4 hover:bg-[#20bd5a] transition-colors'
              >
                {ContactIcons.whatsapp}
                WhatsApp Chat
              </a>
            </div>
          </div>

          <div className='corp-feature-card p-6 sm:p-8 md:p-10 h-full flex flex-col'>
            <h2 className='text-2xl font-bold text-slate-800 mb-2'>Get a Free Quote</h2>
            <p className='text-slate-500 text-sm mb-8'>
              Tell us your requirements and we&apos;ll respond within 24 hours
            </p>

            <form onSubmit={handleSubmit} className='space-y-5 flex-1 flex flex-col'>
              <div className='grid sm:grid-cols-2 gap-5'>
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

              <div className='grid sm:grid-cols-2 gap-5'>
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
                <label className='block'>
                  <span className='text-sm font-medium text-slate-700'>Country</span>
                  <input
                    type='text'
                    value={form.country}
                    onChange={updateField('country')}
                    placeholder='United States'
                    className='mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  />
                </label>
              </div>

              <div className='grid sm:grid-cols-2 gap-5'>
                <label className='block'>
                  <span className='text-sm font-medium text-slate-700'>Phone</span>
                  <input
                    type='tel'
                    value={form.phone}
                    onChange={updateField('phone')}
                    placeholder='Phone'
                    className='mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  />
                </label>
                <label className='block'>
                  <span className='text-sm font-medium text-slate-700'>Preferred Software</span>
                  <select
                    value={form.preferredSoftware}
                    onChange={updateField('preferredSoftware')}
                    className='mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  >
                    {PREFERRED_SOFTWARE.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className='block'>
                <span className='text-sm font-medium text-slate-700'>Message</span>
                <textarea
                  value={form.message}
                  onChange={updateField('message')}
                  placeholder='Message'
                  rows={5}
                  className='mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none resize-y min-h-[120px] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                />
              </label>

              <button
                type='submit'
                disabled={loading}
                className='corp-btn w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
                </svg>
                {loading ? 'Sending...' : 'Send Your Request'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
