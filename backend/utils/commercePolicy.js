const EXPORT_COUNTRIES = ['US', 'GB', 'DE', 'AU', 'CA', 'FR', 'NL', 'IT', 'JP', 'KR', 'AE']
const RETURN_POLICY_DAYS = 15

const destinations = () =>
  EXPORT_COUNTRIES.map((code) => ({
    '@type': 'DefinedRegion',
    addressCountry: code,
  }))

export function getCommercePolicyOrigin() {
  return (process.env.SITE_URL || process.env.FRONTEND_URL || 'https://applebearbaby.net').replace(/\/$/, '')
}

export function buildProductOfferExtras({ origin = '', currency = 'USD' } = {}) {
  const site = String(origin || getCommercePolicyOrigin()).replace(/\/$/, '')
  const shippingUrl = `${site}/shipping`
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
