import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { DEMO_ORIGIN, googleMapsUrl, searchFacilities } from './facilitySearch.js'
import { FacilityTypeIcon } from './facilityIcons.jsx'
import './App.css'

const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape']
const QUICK_SEARCHES = ['Diabetes treatment', 'HIV testing', 'TB testing', 'Family planning']
const MAP_KEY = [
  ['Clinic', 'Clinic'],
  ['Community Health Centre', 'Health centre'],
  ['Health Post', 'Health post'],
  ['District Hospital', 'Hospital'],
  ['Medical Centre', 'Medical centre'],
]
const evidenceLabel = (service) => {
  if (service.availability === 'verified_available') return 'Named facility evidence'
  if (service.availability === 'reported_on_official_page' || service.availability === 'reported_available_on_current_page') return 'Named facility report'
  if (service.availability === 'reported_available_by_city') return 'City-wide report'
  if (service.availability === 'reported_available_by_province') return 'Province-wide report'
  return 'Status unknown'
}

const markerIconCache = new Map()
function markerIcon(type, active) {
  const key = `${type}:${active}`
  if (!markerIconCache.has(key)) {
    markerIconCache.set(key, L.divIcon({
      className: `facility-map-icon${active ? ' selected' : ''}`,
      html: renderToStaticMarkup(<FacilityTypeIcon type={type} />),
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    }))
  }
  return markerIconCache.get(key)
}

function FacilityMap({ rows, origin, selectedId, focusResults, onSelect, onMapError }) {
  const container = useRef(null)
  const map = useRef(null)
  const markerLayer = useRef(null)
  const userMarker = useRef(null)

  useEffect(() => {
    if (!container.current) return
    const instance = L.map(container.current, { zoomControl: false }).setView([DEMO_ORIGIN.lat, DEMO_ORIGIN.lng], 11)
    L.control.zoom({ position: 'topright' }).addTo(instance)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).on('tileerror', onMapError).addTo(instance)
    markerLayer.current = L.layerGroup().addTo(instance)
    map.current = instance
    setTimeout(() => instance.invalidateSize(), 0)
    return () => { instance.remove(); map.current = null }
  }, [onMapError])

  useEffect(() => {
    if (!map.current || !markerLayer.current) return
    markerLayer.current.clearLayers()
    const visible = rows.filter(({ facility }) => !facility.coordinateCaution).slice(0, 120)
    visible.forEach(({ facility }) => {
      const active = facility.id === selectedId
      const tooltip = document.createElement('span')
      tooltip.textContent = `${facility.name} · ${facility.type}`
      L.marker([facility.lat, facility.lng], {
        icon: markerIcon(facility.type, active),
        title: `${facility.name} · ${facility.type}`,
        alt: `${facility.name}, ${facility.type}`,
        zIndexOffset: active ? 1000 : 0,
      }).bindTooltip(tooltip).on('click', () => onSelect(facility.id)).addTo(markerLayer.current)
    })
  }, [rows, selectedId, onSelect])

  useEffect(() => {
    if (!focusResults || !map.current) return
    const first = rows.find(({ facility }) => !facility.coordinateCaution)
    if (first) map.current.setView([first.facility.lat, first.facility.lng], 10)
  }, [rows, focusResults])

  useEffect(() => {
    if (!map.current) return
    if (userMarker.current) { userMarker.current.remove(); userMarker.current = null }
    userMarker.current = L.circleMarker([origin.lat, origin.lng], {
      radius: 8, weight: 3, color: '#ffffff', fillColor: '#185fa5', fillOpacity: 1,
    }).bindTooltip(origin.label).addTo(map.current)
    map.current.setView([origin.lat, origin.lng], 11)
  }, [origin])

  useEffect(() => {
    const chosen = rows.find(({ facility }) => facility.id === selectedId)
    if (chosen && !chosen.facility.coordinateCaution && map.current) map.current.flyTo([chosen.facility.lat, chosen.facility.lng], Math.max(map.current.getZoom(), 12), { duration: 0.4 })
  }, [rows, selectedId])

  return <div ref={container} className="facility-map" role="region" aria-label="Map of up to 120 matching facilities with plausible coordinates" />
}

function FacilityCard({ row, selected, onClick }) {
  const { facility, distance, matchedServices } = row
  const namedEvidence = matchedServices.some((service) => ['verified_available', 'reported_on_official_page', 'reported_available_on_current_page'].includes(service.availability))
  return <div className={`facility-card ${selected ? 'selected' : ''}`}>
    <button type="button" className="facility-card-main" onClick={onClick} aria-label={`View details for ${facility.name}`}>
    <span className="facility-icon"><FacilityTypeIcon type={facility.type} /></span>
    <span className="facility-card-content">
      <span className="facility-name">{facility.name}</span>
      <span className="facility-meta">{facility.type} · {facility.locality || facility.district || facility.province}</span>
      <span className="facility-pills">
        {matchedServices.length > 0 ? <span className={`evidence-pill ${namedEvidence ? 'named' : ''}`}>{namedEvidence ? 'Named facility evidence' : 'Area-wide service report'}</span> : <span className="evidence-pill unknown">Services not confirmed</span>}
        {facility.coordinateCaution ? <span className="evidence-pill caution">Location needs review</span> : <span className="distance-pill">{distance < 1 ? distance.toFixed(1) : Math.round(distance)} km straight-line</span>}
      </span>
    </span>
    <span className="facility-arrow" aria-hidden="true">›</span>
    </button>
    <a className="facility-map-link" href={googleMapsUrl(facility)} target="_blank" rel="noopener noreferrer" aria-label={`Find ${facility.name} on Google Maps`}>Find on Google Maps ↗</a>
  </div>
}

function FacilityDetails({ row, onClose }) {
  const { facility, matchedServices, distance } = row
  const shownServices = matchedServices.length ? matchedServices : facility.services
  return <section className="detail-panel" aria-label="Facility details">
    <div className="detail-heading"><div><span className="eyebrow">Facility details</span><h2>{facility.name}</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close facility details">×</button></div>
    <p className="detail-sub">{facility.type} · {facility.province}</p>
    <div className="detail-block"><strong>Location</strong><p>{[facility.address, facility.locality, facility.district, facility.province].filter(Boolean).join(', ')}</p><p>{facility.coordinateCaution ? 'The supplied coordinates conflict with broad province bounds. Check the address before using this location.' : `${distance < 1 ? distance.toFixed(1) : Math.round(distance)} km straight-line from your selected location`}</p></div>
    <div className="detail-block"><strong>Service evidence</strong>
      {shownServices.length ? shownServices.map((service, index) => <div className="service-row" key={`${service.name}-${index}`}>
        <span>{service.name}</span><small>{evidenceLabel(service)}. {service.note}</small>
        {service.sources.filter((source) => /^https:\/\//.test(source.url)).map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">Source: {source.publisher || 'view evidence'} ↗</a>)}
      </div>) : <p>Service information has not been verified for this facility. This does not mean a service is unavailable. Contact the facility before visiting.</p>}
    </div>
    <div className="detail-block"><strong>Contact</strong><p>No contact number was supplied in this dataset.</p></div>
    <a className="primary-link" href={googleMapsUrl(facility)} target="_blank" rel="noopener noreferrer">Find on Google Maps ↗</a>
  </section>
}

function App() {
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')
  const [province, setProvince] = useState('all')
  const [type, setType] = useState('all')
  const [origin, setOrigin] = useState(DEMO_ORIGIN)
  const [locationStatus, setLocationStatus] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [mapError, setMapError] = useState(false)
  const [visibleCount, setVisibleCount] = useState(100)
  const mapErrorHandler = useCallback(() => setMapError(true), [])

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${import.meta.env.BASE_URL}facilities.json`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('Facility data could not be loaded'); return response.json() })
      .then(setData)
      .catch((error) => { if (error.name !== 'AbortError') setLoadError(error.message) })
    return () => controller.abort()
  }, [])

  const search = useMemo(() => searchFacilities(data?.facilities || [], { query, province, type, origin }), [data, query, province, type, origin])
  const selected = search.rows.find(({ facility }) => facility.id === selectedId)
  const nearest = origin.label === 'Your location' ? search.rows.find(({ facility }) => !facility.coordinateCaution) : null
  const types = useMemo(() => [...new Set((data?.facilities || []).map((facility) => facility.type))].sort(), [data])

  function locate() {
    if (!navigator.geolocation) { setLocationStatus('Location is unavailable here. Distances still use the Johannesburg demo location.'); return }
    setLocationStatus('Finding your location…')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setOrigin({ lat: coords.latitude, lng: coords.longitude, label: 'Your location' }); setLocationStatus('Sorted by distance from your current location.'); setSelectedId(null); setVisibleCount(100) },
      () => setLocationStatus('Location was unavailable. Distances still use the Johannesburg demo location.'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    )
  }

  function updateQuery(value) { setQuery(value); setSelectedId(null); setVisibleCount(100) }
  function updateProvince(value) { setProvince(value); setSelectedId(null); setVisibleCount(100) }
  function updateType(value) { setType(value); setSelectedId(null); setVisibleCount(100) }
  function selectFromList(id) {
    setSelectedId(id)
    if (window.matchMedia('(max-width: 760px)').matches) {
      document.querySelector('.map-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return <div className="app-shell">
    <header className="app-header"><div className="brand"><span className="brand-mark">✚</span><span>MediLink</span></div><span className="header-label">Healthcare finder</span></header>
    <main className="finder-layout">
      <section className="finder-panel" aria-label="Find healthcare facilities">
        <div className="panel-intro"><div className="eyebrow">FIND CARE</div><h1>Care, closer to you.</h1><p>Explore South African facilities. Service availability depends on the evidence shown for each result.</p></div>
        <div className="search-box"><span aria-hidden="true">⌕</span><input aria-label="Search facilities or services" type="search" value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Service, clinic, hospital or place" /></div>
        <div className="quick-searches" aria-label="Suggested searches">{QUICK_SEARCHES.map((item) => <button type="button" className={query.toLowerCase() === item.toLowerCase() ? 'active' : ''} onClick={() => updateQuery(item)} key={item}>{item}</button>)}</div>
        <div className="filter-row"><label>Province<select value={province} onChange={(event) => updateProvince(event.target.value)}><option value="all">All provinces</option>{PROVINCES.map((name) => <option key={name}>{name}</option>)}</select></label><label>Facility type<select value={type} onChange={(event) => updateType(event.target.value)}><option value="all">All types</option>{types.map((name) => <option key={name}>{name}</option>)}</select></label></div>
        <div className="results-heading"><div><span className="eyebrow">DIRECTORY</span><h2>{data ? `${search.rows.length.toLocaleString()} ${search.isFallback ? 'nearby facilities to contact' : 'facilities found'}` : 'Loading facilities…'}</h2></div><button className="location-button" type="button" onClick={locate}>◎ Find nearest to me</button></div>
        <p className="location-label" role="status">{locationStatus || `Distances from ${origin.label}`}</p>
        {nearest && <div className="nearest-result"><strong>{search.isFallback ? 'Nearest facility to contact' : 'Nearest matching facility'}: {nearest.facility.name}</strong><span>{nearest.distance < 1 ? nearest.distance.toFixed(1) : Math.round(nearest.distance)} km straight-line · {nearest.facility.type}</span><button type="button" onClick={() => selectFromList(nearest.facility.id)}>View details</button><a href={googleMapsUrl(nearest.facility)} target="_blank" rel="noopener noreferrer">Find on Google Maps ↗</a></div>}
        {search.intent && <p className={`evidence-notice ${search.isFallback ? 'warning' : ''}`} role="status">{search.isFallback ? `No facility in this data has evidence for ${search.intent.label}. Showing nearby facilities to contact; these are not confirmed providers of that service.` : `Showing facilities with recorded evidence for ${search.intent.label}. Check each source and contact the facility to confirm current availability.`}</p>}
        {!search.intent && <p className="evidence-notice">Missing service data means unknown, not unavailable. Facility identity details have not been independently reverified.</p>}
        <p className="map-link-note">Google Maps links search by the listed name and address. Check the result before travelling.</p>
        {data?.coordinateCautionCount > 0 && <p className="data-note">{data.coordinateCautionCount} entries have coordinates outside broad province bounds. Their distance and map pins are withheld pending review.</p>}
        {loadError && <p className="load-error" role="alert">{loadError}</p>}
        <div className="results-list">{search.rows.slice(0, visibleCount).map((row) => <FacilityCard key={row.facility.id} row={row} selected={selectedId === row.facility.id} onClick={() => selectFromList(row.facility.id)} />)}
          {data && search.rows.length === 0 && <p className="empty-state">No facilities match. Try another name, province or facility type.</p>}
          {search.rows.length > visibleCount && <button type="button" className="load-more" onClick={() => setVisibleCount((count) => count + 100)}>Show more facilities ({Math.min(visibleCount, search.rows.length).toLocaleString()} of {search.rows.length.toLocaleString()})</button>}
        </div>
      </section>
      <section className="map-panel" aria-label="Facility map"><FacilityMap rows={search.rows} origin={origin} selectedId={selectedId} focusResults={(Boolean(query.trim()) && !search.isFallback) || province !== 'all'} onSelect={setSelectedId} onMapError={mapErrorHandler} />
        <details className="map-legend"><summary>Map key</summary><div className="map-legend-content">{MAP_KEY.map(([iconType, label]) => <span className="map-legend-item" key={iconType}><FacilityTypeIcon type={iconType} />{label}</span>)}<p>Letters identify subtypes: S satellite, D district, R regional, T tertiary, C central. A clock marks after-hours centres.</p></div></details>
        {mapError && <div className="map-error" role="status">Map tiles could not load. You can still browse the facility list.</div>}
        {selected && <FacilityDetails row={selected} onClose={() => setSelectedId(null)} />}
        <div className="map-caption">{data?.facilityCount?.toLocaleString() || '…'} listed facilities · Dataset: {data?.generatedOn || '…'} · Map markers: up to 120 results</div>
      </section>
    </main>
  </div>
}

export default App
