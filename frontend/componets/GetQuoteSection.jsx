import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LocaleLink } from './LocaleLink'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import { trackInquiryFormConversions } from '../src/googleAds'
import { homeImages } from '../src/assets/galleryAssets'
import HomeSection, { SectionHeader } from './HomeSection'

const WHATSAPP_URL = 'https://wa.me/8615867976938'

const BENEFITS = [
  'Response within 24 hours',
  'Free sample available',
  'Export to 30+ countries',
  'Flexible MOQ for wholesale partners',
]

const GetQuoteSection = () => {
  const { sendInquiryEmail, token } = useContext(ShopContext)
  const { t } = useTranslation()
  const benefits = t('home.benefits', { returnObjects: true })
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
      toast.error(t('common.required'))
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
      toast.success(t('home.quoteSent'))
      if (result?.conversion) {
        trackInquiryFormConversions(result.conversion)
      }
      setForm({ name: '', email: '', company: '', message: '' })
    } catch (error) {
      toast.error(error.message || t('home.quoteFail'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <HomeSection variant='quote' innerClassName='home-quote-inner'>
      <SectionHeader
        index={8}
        eyebrow={t('home.quoteEyebrow')}
        title={t('home.quoteTitle')}
        highlight={t('home.quoteHighlight')}
        subtitle={t('home.quoteSubtitle')}
        dark
      />

      <div className='home-quote-grid'>
        <div className='home-quote-info'>
          <div className='home-quote-showroom'>
            <img
              src={homeImages.showroom}
              alt={t('home.showroomAlt')}
              className='w-full h-full object-cover'
            />
          </div>
          <ul className='home-quote-benefits'>
            {(Array.isArray(benefits) ? benefits : []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <a
            href={WHATSAPP_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='home-quote-whatsapp'
          >
            {t('common.whatsapp')}
          </a>
        </div>

        <div className='home-quote-form-card'>
          <h3 className='text-xl font-bold text-slate-800 mb-1'>{t('home.quoteCardTitle')}</h3>
          <p className='text-slate-500 text-sm mb-6'>
            {t('home.quoteCardHint')}{' '}
            <LocaleLink to='/contact' className='text-blue-600 hover:underline'>
              {t('home.contactPage')}
            </LocaleLink>
          </p>

          <form onSubmit={handleSubmit} className='space-y-4 flex-1 flex flex-col'>
            <div className='grid sm:grid-cols-2 gap-4'>
              <label className='block'>
                <span className='text-sm font-medium text-slate-700'>
                  {t('common.name')} <span className='text-red-500'>*</span>
                </span>
                <input
                  type='text'
                  required
                  value={form.name}
                  onChange={updateField('name')}
                  placeholder={t('home.namePh')}
                  className='mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                />
              </label>
              <label className='block'>
                <span className='text-sm font-medium text-slate-700'>
                  {t('common.email')} <span className='text-red-500'>*</span>
                </span>
                <input
                  type='email'
                  required
                  value={form.email}
                  onChange={updateField('email')}
                  placeholder={t('home.emailPh')}
                  className='mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                />
              </label>
            </div>

            <label className='block'>
              <span className='text-sm font-medium text-slate-700'>{t('common.company')}</span>
              <input
                type='text'
                value={form.company}
                onChange={updateField('company')}
                placeholder={t('home.companyPh')}
                className='mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              />
            </label>

            <label className='block flex-1 flex flex-col'>
              <span className='text-sm font-medium text-slate-700'>
                {t('common.message')} <span className='text-red-500'>*</span>
              </span>
              <textarea
                required
                value={form.message}
                onChange={updateField('message')}
                placeholder={t('home.messagePh')}
                rows={4}
                className='mt-1.5 w-full flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none resize-y min-h-[100px] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              />
            </label>

            <button
              type='submit'
              disabled={loading}
              className='corp-btn w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed'
            >
              {loading ? t('common.sending') : t('common.submit')}
              {!loading && <span aria-hidden='true'>→</span>}
            </button>
          </form>
        </div>
      </div>
    </HomeSection>
  )
}

export default GetQuoteSection
