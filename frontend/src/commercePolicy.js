export const SHIPPING_POLICY_PATH = '/shipping'
export const RETURN_POLICY_DAYS = 15

export const SAMPLE_CARRIERS = [
  'China Post small packet',
  'Alibaba online express',
  'DHL',
  'FedEx',
  'TNT',
]

export const BULK_OPTIONS = [
  'FCL sea container',
  'LCL / shared container',
  'Buyer-appointed China forwarder',
  'Air freight',
  'Rail freight',
]

export const EXPORT_COUNTRIES = ['US', 'GB', 'DE', 'AU', 'CA', 'FR', 'NL', 'IT', 'JP', 'KR', 'AE']

const destinations = () =>
  EXPORT_COUNTRIES.map((code) => ({
    '@type': 'DefinedRegion',
    addressCountry: code,
  }))

export function buildProductOfferExtras({ origin = '', currency = 'USD' } = {}) {
  const site = String(origin || '').replace(/\/$/, '')
  const shippingUrl = site ? `${site}${SHIPPING_POLICY_PATH}` : SHIPPING_POLICY_PATH
  const returnsUrl = `${shippingUrl}#returns`

  return {
    itemCondition: 'https://schema.org/NewCondition',
    shippingDetails: [
      {
        '@type': 'OfferShippingDetails',
        '@id': `${shippingUrl}#sample`,
        shippingLabel: 'Sample: China Post small packet, Alibaba online express, or DHL / FedEx / TNT',
        shippingDestination: destinations(),
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 0,
          currency,
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 5,
            maxValue: 20,
            unitCode: 'DAY',
          },
        },
      },
      {
        '@type': 'OfferShippingDetails',
        '@id': `${shippingUrl}#bulk`,
        shippingLabel: 'Bulk: FCL / LCL sea freight, or buyer-appointed China forwarder (air / rail / sea)',
        shippingDestination: destinations(),
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 0,
          currency,
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 7,
            maxValue: 25,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 18,
            maxValue: 45,
            unitCode: 'DAY',
          },
        },
      },
    ],
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      '@id': returnsUrl,
      applicableCountry: EXPORT_COUNTRIES,
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: RETURN_POLICY_DAYS,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/ReturnShippingFees',
      refundType: 'https://schema.org/StoreCreditRefund',
      url: returnsUrl,
    },
  }
}

export function buildProductJsonLdOffer({ url, price, currency = 'USD', origin = '' }) {
  if (price == null || price === '' || Number.isNaN(Number(price))) return undefined
  return {
    '@type': 'Offer',
    url,
    priceCurrency: currency,
    price: String(price),
    availability: 'https://schema.org/InStock',
    ...buildProductOfferExtras({ origin, currency }),
  }
}
