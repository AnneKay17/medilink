import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

import { getFacilityById } from '../../data/facilities';
import { googleMapsUrl } from '../../utils/facilitySearch';

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
  verified_available: 'Verified available',
  reported_on_official_page:
    'Reported on official page',
  reported_available_on_current_page:
    'Reported on current page',
  reported_available_by_city:
    'Reported at city level',
  reported_available_by_province:
    'Reported at province level',
};

const getEvidenceLabel = (availability) => {
  return (
    evidenceLabels[availability] ||
    'Status unknown'
  );
};

export const FacilityDetails = () => {
  const { facilityId } = useParams();

  const [facility, setFacility] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFacility = async () => {
      try {
        setIsLoading(true);
        setError('');

        const data = await getFacilityById(facilityId);

        setFacility(data || null);
      } catch (err) {
        console.error(err);
        setError(
          'We could not load this facility.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadFacility();
  }, [facilityId]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card>
          <div className="py-10 text-center text-gray-500">
            Loading facility...
          </div>
        </Card>
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Link
          to="/patient/healthcare-finder"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Healthcare Finder
        </Link>

        <Card>
          <h1 className="text-xl font-semibold text-gray-900">
            Facility not found
          </h1>

          <p className="mt-2 text-gray-600">
            {error ||
              'We could not find this healthcare facility.'}
          </p>
        </Card>
      </div>
    );
  }

  const icon =
    facilityTypeIcons[facility.type] || '🏥';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        to="/patient/healthcare-finder"
        className="inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        ← Back to Healthcare Finder
      </Link>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="text-4xl">{icon}</div>

          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {facility.name}
                </h1>

                <p className="mt-1 text-gray-600">
                  {facility.type}
                </p>
              </div>

              {facility.coordinateCaution ? (
                <Badge variant="pending">
                  Location caution
                </Badge>
              ) : (
                <Badge variant="active">
                  Facility data
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900">
          Location
        </h2>

        <div className="mt-4 space-y-2 text-gray-700">
          {facility.address && (
            <p>
              <strong>Address:</strong>{' '}
              {facility.address}
            </p>
          )}

          {facility.locality && (
            <p>
              <strong>Locality:</strong>{' '}
              {facility.locality}
            </p>
          )}

          {facility.district && (
            <p>
              <strong>District:</strong>{' '}
              {facility.district}
            </p>
          )}

          {facility.province && (
            <p>
              <strong>Province:</strong>{' '}
              {facility.province}
            </p>
          )}
        </div>

        {facility.coordinateCaution && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-900">
              The coordinates for this facility have been
              flagged for caution. Check the location before
              travelling.
            </p>
          </div>
        )}

        <div className="mt-5">
          <a
            href={googleMapsUrl(facility)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button type="button">
              Open in Google Maps
            </Button>
          </a>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Services
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Service information and its evidence status.
            </p>
          </div>

          <span className="text-sm text-gray-500">
            {facility.services?.length || 0} listed
          </span>
        </div>

        {!facility.services ||
        facility.services.length === 0 ? (
          <div className="mt-5 rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              No service information is currently available
              for this facility.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {facility.services.map((service, index) => (
              <div
                key={`${service.name}-${index}`}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {service.name}
                    </h3>

                    {service.category && (
                      <p className="mt-1 text-sm text-gray-500">
                        {service.category}
                      </p>
                    )}
                  </div>

                  <Badge variant="active">
                    {getEvidenceLabel(
                      service.availability
                    )}
                  </Badge>
                </div>

                {service.note && (
                  <p className="mt-3 text-sm text-gray-600">
                    {service.note}
                  </p>
                )}

                {service.sources?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900">
                      Sources
                    </p>

                    <div className="mt-2 space-y-1">
                      {service.sources.map(
                        (source, sourceIndex) => (
                          <a
                            key={`${source.url}-${sourceIndex}`}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                          >
                            {source.publisher ||
                              source.url}
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};