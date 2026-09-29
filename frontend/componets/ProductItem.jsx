import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useTranslation } from 'react-i18next'
import { LocaleLink } from './LocaleLink'
import { flyToCart } from '../src/utils/flyToCart'
import { getProductPath } from '../src/utils/productPath'
import { optimizeCloudinaryUrl } from '../src/utils/cloudinaryUrl'
import { getProductMoq } from '../src/utils/productMoq'

const ProductItem = ({ id, slug, image, name, price, modelNumber }) => {
  const { currency, addToCart, products } = useContext(ShopContext)
  const { t } = useTranslation()
  const productPath = getProductPath({ _id: id, slug })
  const thumb = image?.[0]
    ? optimizeCloudinaryUrl(image[0], { width: 400 })
    : ''

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const product = products.find((p) => String(p._id) === String(id))
    addToCart(id, 'Default', getProductMoq(product))
    const card = e.currentTarget.closest('.cartoon-card')
    const imgEl = card ? card.querySelector('img.product-item-img') : null
    if (imgEl) flyToCart(imgEl)
  }

  return (
    <LocaleLink
      className="catalog-product-item block min-w-0 max-w-full w-full text-gray-700 cursor-pointer h-full"
      to={productPath}
    >
      <div className="w-full min-w-0 max-w-full box-border cartoon-card p-4 transition-all duration-300 h-full flex flex-col overflow-hidden">
        <div className="overflow-hidden rounded-xl mb-3 flex-shrink-0 aspect-square bg-slate-50">
          {thumb ? (
            <img
              className="product-item-img hover:scale-105 transition ease-in-out duration-300 w-full h-full max-w-full aspect-square object-cover"
              src={thumb}
              alt={name || 'Product'}
              width={400}
              height={400}
              loading="lazy"
              decoding="async"
            />
          ) : null}
        </div>
        <div className="space-y-2 flex-1 flex flex-col">
          <p className="text-base font-medium text-gray-800 line-clamp-2 min-h-[3rem]">{name}</p>
          {modelNumber && String(modelNumber).trim() ? (
            <p className="text-xs text-slate-500 -mt-1">{t('common.model', { code: String(modelNumber).trim() })}</p>
          ) : null}
          <div className="flex flex-col  flex-start justify-between sm:flex-row">
            <p className="text-base font-bold text-blue-600">
              {currency}
              {price}
            </p>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium border border-blue-100">
              {t('product.bestValue', { defaultValue: t('common.bestValue') })}
            </span>
          </div>
          <button
            type="button"
            className="w-full cartoon-btn py-2 text-white font-semibold text-sm mt-auto"
            onClick={handleAddToCart}
          >
            {t('common.addToInquiry')}
          </button>
        </div>
      </div>
    </LocaleLink>
  )
}

export default ProductItem
