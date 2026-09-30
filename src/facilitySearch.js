export const DEMO_ORIGIN = { lat: -26.2041, lng: 28.0473, label: 'Johannesburg (demo location)' }

export function googleMapsUrl(facility) {
  const place = [facility.name, facility.address, facility.locality, facility.district, facility.province, 'South Africa']
    .filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`
}

export function distanceKm(a, b) {
  const radians = (degrees) => degrees * Math.PI / 180
  const dLat = radians(b.lat - a.lat)
  const dLng = radians(b.lng - a.lng)
  const term = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(term), Math.sqrt(1 - term))
}

export function serviceIntent(query) {
  const q = query.trim().toLowerCase()
  if (/diabet|blood sugar/.test(q)) return { label: 'diabetes treatment', match: (service) => /diabet/i.test(service.name) }
  if (/\bhiv\b|aids/.test(q)) return { label: 'HIV services', match: (service) => /hiv|aids/i.test(service.name + ' ' + service.category) }
  if (/\btb\b|tubercul/.test(q)) return { label: 'TB services', match: (service) => /tb|tubercul/i.test(service.name + ' ' + service.category) }
  if (/family planning|contracep/.test(q)) return { label: 'family planning', match: (service) => /family planning|contracep/i.test(service.name + ' ' + service.category) }
  if (/mental|psych/.test(q)) return { label: 'mental health', match: (service) => /mental|psych/i.test(service.name + ' ' + service.category) }
  if (/matern|pregnan|antenatal/.test(q)) return { label: 'maternal care', match: (service) => /matern|pregnan|antenatal/i.test(service.name + ' ' + service.category) }
  return null
}

export function searchFacilities(facilities, { query = '', type = 'all', province = 'all', origin = DEMO_ORIGIN }) {
  const intent = serviceIntent(query)
  const needle = query.trim().toLowerCase()
  const available = facilities.filter((facility) =>
    Number.isFinite(facility.lat) && Number.isFinite(facility.lng) &&
    (type === 'all' || facility.type === type) &&
    (province === 'all' || facility.province === province),
  )
  const nearby = available.map((facility) => ({ facility, distance: distanceKm(origin, facility), matchedServices: [] }))
    .sort((a, b) => Number(a.facility.coordinateCaution) - Number(b.facility.coordinateCaution) || a.distance - b.distance)

  if (intent) {
    const matches = nearby.map((row) => ({ ...row, matchedServices: row.facility.services.filter(intent.match) }))
      .filter((row) => row.matchedServices.length)
    return { rows: matches.length ? matches : nearby, intent, hasServiceEvidence: matches.length > 0, isFallback: !matches.length }
  }

  if (needle) {
    const matches = nearby.filter(({ facility }) =>
      [facility.name, facility.type, facility.locality, facility.district, facility.province, facility.address]
        .some((value) => String(value || '').toLowerCase().includes(needle)),
    )
    return { rows: matches, intent: null, hasServiceEvidence: false, isFallback: false }
  }
  return { rows: nearby, intent: null, hasServiceEvidence: false, isFallback: false }
}
