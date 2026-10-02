import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { PatientLayout } from '../../layouts/PatientLayout';
import { SearchBar } from '../../components/common/SearchBar';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

import { getFacilities } from '../../data/facilities';
import {
  DEMO_ORIGIN,
  googleMapsUrl,
  searchFacilities,
} from '../../utils/facilitySearch';

const facilityTypeIcons = {
  Clinic: '🏥',
  'Satellite Clinic': '🏥',
  'Health Post': '⚕️',
  'Community Health Centre': '🏥',
  'Community Health Centre (After hours)': '🏥',
  'Community Health Centre/Clinic': '🏥',
  'District Hospital': '🏥',
  'Regional Hospital': '🏥',
  'Provincial Tertiary Hospital': '🏥',
  'National Central Hospital': '🏥',
  'Medical Centre': '⚕️',
};

const evidenceLabels = {
  verified_available: 'Service evidence available',
  reported_on_official_page: 'Reported on official page',
  reported_available_on_current_page:
    'Reported on current page',
  reported_available_by_city: 'Reported in city',
  reported_available_by_province:
    'Reported in province',
};

const getEvidenceLabel = (service) => {
  return (
    evidenceLabels[service.availability] ||
    'Service status unknown'
  );
};

const formatDistance = (distance) => {
  if (distance === null || distance === undefined) {
    return null;
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m away`;
  }

  return `${distance.toFixed(1)} km away`;
};

export const HealthcareFinder = () => {
  const [facilities, setFacilities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [locationLoading, setLocationLoading] =
    useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFacilities = async () => {
      try {
        setIsLoading(true);
        setError('');

        const data = await getFacilities();
        setFacilities(data);
      } catch (err) {
        console.error(err);
        setError(
          'We could not load healthcare facilities right now.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadFacilities();
  }, []);

  const origin = userLocation || DEMO_ORIGIN;

  const searchResults = useMemo(() => {
    return searchFacilities(facilities, {
      query: searchQuery,
      type: selectedType,
      province: selectedProvince,
      origin,
    });
  }, [
    facilities,
    searchQuery,
    selectedType,
    selectedProvince,
    origin,
  ]);

  const results = searchResults.rows;

  const facilityTypes = useMemo(() => {
    return [
      ...new Set(
        facilities
          .map((facility) => facility.type)
          .filter(Boolean)
      ),
    ].sort();
  }, [facilities]);

  const provinces = useMemo(() => {
    return [
      ...new Set(
        facilities
          .map((facility) => facility.province)
          .filter(Boolean)
      ),
    ].sort();
  }, [facilities]);

  const handleFindNearest = () => {
    if (!navigator.geolocation) {
      setError(
        'Location services are not available in this browser.'
      );
      return;
    }

    setLocationLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: 'Your location',
        });

        setLocationLoading(false);
      },
      () => {
        setError(
          'We could not access your location. Please check your browser permissions.'
        );
        setLocationLoading(false);
      }
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedProvince('');
  };

  return (
    <PatientLayout currentPage="Healthcare Finder">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Find Healthcare
          </h1>

          <p className="mt-2 text-gray-600">
            Find healthcare facilities and services near you.
          </p>
        </div>

        <Card>
          <div className="space-y-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by facility, city, province, or service..."
              size="md"
              isLoading={isLoading}
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedType}
                onChange={(e) =>
                  setSelectedType(e.target.value)
                }
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All facility types</option>

                {facilityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                value={selectedProvince}
                onChange={(e) =>
                  setSelectedProvince(e.target.value)
                }
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All provinces</option>

                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={handleFindNearest}
                disabled={locationLoading}
                isLoading={locationLoading}
              >
                Find Near Me
              </Button>

              {(searchQuery ||
                selectedType ||
                selectedProvince) && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <p className="text-red-800">{error}</p>
          </Card>
        )}

        {!isLoading && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm text-gray-600">
              {results.length} facilities found
            </p>

            {userLocation && (
              <Badge variant="active">
                Sorted by distance from your location
              </Badge>
            )}
          </div>
        )}

        {searchResults.intent &&
          results.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <p className="text-sm text-blue-900">
                Showing facilities with available evidence
                related to your search.
              </p>
            </Card>
          )}

        {isLoading ? (
          <Card>
            <div className="py-10 text-center text-gray-500">
              Loading healthcare facilities...
            </div>
          </Card>
        ) : results.length === 0 ? (
          <Card>
            <div className="py-10 text-center">
              <p className="text-lg font-semibold text-gray-900">
                No facilities found
              </p>

              <p className="mt-2 text-gray-600">
                Try a different search or remove one of the
                filters.
              </p>

              <div className="mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {results.map((facility) => {
              const matchedServices =
                searchResults.intent
                  ? facility.services?.filter((service) =>
                      service.name
                        ?.toLowerCase()
                        .includes(
                          searchResults.intent
                            .replace('-', ' ')
                        )
                    )
                  : [];

              return (
                <Card
                  key={facility.id}
                  className="flex flex-col"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl shrink-0">
                      {facilityTypeIcons[facility.type] ||
                        '🏥'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            {facility.name}
                          </h2>

                          <p className="text-sm text-gray-600">
                            {facility.type}
                          </p>
                        </div>

                        {facility.coordinateCaution ? (
                          <Badge variant="pending">
                            Location caution
                          </Badge>
                        ) : (
                          <Badge variant="active">
                            Location verified
                          </Badge>
                        )}
                      </div>

                      <div className="mt-3 space-y-1 text-sm text-gray-600">
                        {facility.locality && (
                          <p>
                            {facility.locality}
                            {facility.province
                              ? `, ${facility.province}`
                              : ''}
                          </p>
                        )}

                        {facility.district && (
                          <p>{facility.district}</p>
                        )}

                        {facility.address && (
                          <p>{facility.address}</p>
                        )}

                        {formatDistance(
                          facility.distanceKm
                        ) && (
                          <p className="font-medium text-gray-800">
                            {formatDistance(
                              facility.distanceKm
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {matchedServices?.length > 0 && (
                    <div className="mt-5 border-t border-gray-100 pt-4">
                      <p className="text-sm font-medium text-gray-900">
                        Relevant service
                      </p>

                      <div className="mt-2 space-y-2">
                        {matchedServices
                          .slice(0, 3)
                          .map((service) => (
                            <div
                              key={`${facility.id}-${service.name}`}
                              className="rounded-lg bg-gray-50 p-3"
                            >
                              <p className="font-medium text-gray-900">
                                {service.name}
                              </p>

                              <p className="mt-1 text-xs text-gray-600">
                                {getEvidenceLabel(service)}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      to={`/patient/healthcare/${facility.id}`}
                    >
                      <Button type="button">
                        View Details
                      </Button>
                    </Link>

                    <a
                      href={googleMapsUrl(facility)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                      >
                        Google Maps
                      </Button>
                    </a>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PatientLayout>
  );
};