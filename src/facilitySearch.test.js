import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { DEMO_ORIGIN, googleMapsUrl, searchFacilities } from './facilitySearch.js'

const data = JSON.parse(readFileSync(new URL('../public/facilities.json', import.meta.url)))

test('the uploaded directory loads completely and flags suspect coordinates', () => {
  const rows = searchFacilities(data.facilities, { origin: DEMO_ORIGIN }).rows
  assert.equal(rows.length, data.facilityCount)
  assert.equal(data.coordinateCautionCount, 9)
  assert.equal(rows.slice(0, 100).some(({ facility }) => facility.coordinateCaution), false)
})

test('diabetes search does not claim unsupported facility services', () => {
  const result = searchFacilities(data.facilities, { query: 'diabetes treatment' })
  assert.equal(result.hasServiceEvidence, false)
  assert.equal(result.isFallback, true)
  assert.equal(result.rows[0].matchedServices.length, 0)
})

test('HIV search returns recorded service evidence and ranks questionable coordinates last', () => {
  const result = searchFacilities(data.facilities, { query: 'HIV testing' })
  assert.equal(result.hasServiceEvidence, true)
  assert.ok(result.rows.length > 0)
  assert.ok(result.rows.every(({ matchedServices }) => matchedServices.length > 0))
  assert.equal(result.rows[0].facility.coordinateCaution, false)
})

test('province and type filters work together', () => {
  const result = searchFacilities(data.facilities, { province: 'Gauteng', type: 'Clinic' })
  assert.ok(result.rows.length > 0)
  assert.ok(result.rows.every(({ facility }) => facility.province === 'Gauteng' && facility.type === 'Clinic'))
})

test('a supplied location ranks the closest plausible facility first', () => {
  const facilities = [
    { id: 'far', name: 'Far Clinic', lat: -26.6, lng: 28.2, services: [], coordinateCaution: false },
    { id: 'near', name: 'Near Clinic', lat: -26.205, lng: 28.048, services: [], coordinateCaution: false },
    { id: 'suspect', name: 'Suspect Clinic', lat: -26.2041, lng: 28.0473, services: [], coordinateCaution: true },
  ]
  const rows = searchFacilities(facilities, { origin: DEMO_ORIGIN }).rows
  assert.deepEqual(rows.map(({ facility }) => facility.id), ['near', 'far', 'suspect'])
})

test('Google Maps link searches by facility name and address', () => {
  const facility = data.facilities.find(({ address }) => address)
  const url = new URL(googleMapsUrl(facility))
  assert.equal(url.origin, 'https://www.google.com')
  assert.equal(url.searchParams.get('api'), '1')
  assert.match(url.searchParams.get('query'), new RegExp(facility.name, 'i'))
  assert.ok(url.searchParams.get('query').includes(facility.address))
  assert.ok(url.searchParams.get('query').includes(facility.province))
})
