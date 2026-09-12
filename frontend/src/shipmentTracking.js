export const TRACKING_CARRIERS = [
  {
    id: 'chinapost',
    label: 'China Post / EMS',
    hint: 'Small packet and EMS numbers, often ending in CN',
    buildUrl: (code) => `https://www.17track.net/en/track?nums=${encodeURIComponent(code)}`,
  },
  {
    id: 'dhl',
    label: 'DHL',
    hint: 'Usually 10 digits',
    buildUrl: (code) =>
      `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${encodeURIComponent(code)}`,
  },
  {
    id: 'fedex',
    label: 'FedEx',
    hint: 'Usually 12–15 digits',
    buildUrl: (code) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(code)}`,
  },
  {
    id: 'tnt',
    label: 'TNT',
    hint: 'TNT consignment number',
    buildUrl: (code) =>
      `https://www.tnt.com/express/en_us/site/tracking.html?searchType=con&cons=${encodeURIComponent(code)}`,
  },
  {
    id: 'auto',
    label: 'Auto detect (17TRACK)',
    hint: 'If you are not sure which carrier was used',
    buildUrl: (code) => `https://t.17track.net/en#nums=${encodeURIComponent(code)}`,
  },
]

export function normalizeTrackingCode(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '')
}

export function buildTrackingUrl(carrierId, rawCode) {
  const code = normalizeTrackingCode(rawCode)
  if (!code) return null
  const carrier = TRACKING_CARRIERS.find((item) => item.id === carrierId) || TRACKING_CARRIERS[0]
  return carrier.buildUrl(code)
}
