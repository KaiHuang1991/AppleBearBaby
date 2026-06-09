const galleryModules = import.meta.glob('./gallery/gallery-*.jpg', { eager: true, import: 'default' })

const byId = Object.fromEntries(
  Object.entries(galleryModules).map(([path, url]) => {
    const id = path.match(/gallery-(\d+)\.jpg/)?.[1]
    return id ? [id, url] : null
  }).filter(Boolean)
)

export const galleryImages = Object.keys(byId)
  .sort((a, b) => Number(a) - Number(b))
  .map((id) => byId[id])

/** Curated picks for marketing pages (not About/Contact) */
export const homeImages = {
  hero: byId['88'],
  categoryBottles: byId['72'],
  categoryCups: byId['61'],
  categoryOther: byId['46'],
  manufacturing: byId['52'],
  certifications: byId['54'],
  office: byId['43'],
  showroom: byId['62'],
  assembly: byId['59'],
  warehouse: byId['66'],
  building: byId['48'],
}

export const factoryCarousel = [
  byId['92'],
  byId['87'],
  byId['74'],
  byId['76'],
  byId['73'],
  byId['64'],
].filter(Boolean)

export default byId
