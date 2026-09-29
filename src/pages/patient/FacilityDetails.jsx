import { Link, useParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { getFacilityById } from '../../data/mockFacilities';

const facilityTypeIcons = {
  Hospital: '🏥',
  Clinic: '🏨',
  'Private Practice': '👨‍⚕️',
};

// Patient: Facility Details
// Shows detailed information about a healthcare facility
export const FacilityDetails = () => {
  const { facilityId } = useParams();

  const facility = getFacilityById(facilityId);

  if (!facility) {
    return (
      <div className="space-y-6">
        <Link
          to="/patient/healthcare"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Healthcare Finder
        </Link>

        <Card className="text-center py-10">
          <h1 className="text-xl font-semibold text-gray-900">
            Facility not found
          </h1>

          <p className="text-gray-600 mt-2">
            We could not find the healthcare facility you are looking for.
          </p>
        </Card>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${facility.name}, ${facility.address}`
  )}`;

  return (
    <div className="space-y-6">

      {/* Back button */}
      <Link
        to="/patient/healthcare-finder"
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
      >
        ← Back to Healthcare Finder
      </Link>

      {/* Header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {facilityTypeIcons[facility.type]}
              </span>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {facility.name}
              </h1>
            </div>

            <p className="text-gray-600 mt-2">
              {facility.type} · {facility.city}, {facility.province}
            </p>
          </div>

          {facility.verified && (
            <Badge variant="active">
              Verified
            </Badge>
          )}
        </div>
      </Card>

      {/* Contact information */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h2>

        <div className="space-y-4">

          <div>
            <p className="text-sm font-medium text-gray-700">
              Address
            </p>
            <p className="text-gray-600 mt-1">
              {facility.address}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">
              Phone
            </p>
            <a
              href={`tel:${facility.phone}`}
              className="text-blue-600 hover:text-blue-700 mt-1 inline-block"
            >
              {facility.phone}
            </a>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">
              Email
            </p>
            <a
              href={`mailto:${facility.email}`}
              className="text-blue-600 hover:text-blue-700 mt-1 inline-block"
            >
              {facility.email}
            </a>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">
              Website
            </p>
            <a
              href={facility.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 mt-1 inline-block break-all"
            >
              Visit website
            </a>
          </div>

        </div>
      </Card>

      {/* Hours */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Opening Hours
        </h2>

        <p className="text-gray-600">
          {facility.hours}
        </p>
      </Card>

      {/* Rating */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Rating
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-xl">⭐</span>

          <span className="text-lg font-semibold text-gray-900">
            {facility.rating}
          </span>

          <span className="text-gray-500">
            ({facility.reviews} reviews)
          </span>
        </div>
      </Card>

      {/* Services */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Services Offered
        </h2>

        <div className="flex flex-wrap gap-2">
          {facility.servicesOffered.map((service) => (
            <Badge key={service} variant="pending">
              {service}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Insurance */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Accepted Insurance
        </h2>

        <div className="flex flex-wrap gap-2">
          {facility.acceptedInsurance.map((insurance) => (
            <span
              key={insurance}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
            >
              {insurance}
            </span>
          ))}
        </div>
      </Card>

      {/* Location */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Location
        </h2>

        <p className="text-gray-600">
          {facility.address}
        </p>

        <p className="text-sm text-gray-500 mt-2">
          {facility.city}, {facility.province}
        </p>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          View location on Google Maps
          <span aria-hidden="true">→</span>
        </a>

        <p className="text-xs text-gray-400 mt-3">
          Coordinates: {facility.coordinates.lat},{' '}
          {facility.coordinates.lng}
        </p>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={`tel:${facility.phone}`}
          className="flex-1"
        >
          <Button
            variant="primary"
            size="md"
            fullWidth
          >
            Call Facility
          </Button>
        </a>

        <Link
          to="/patient/healthcare-finder"
          className="flex-1"
        >
          <Button
            variant="secondary"
            size="md"
            fullWidth
          >
            Back to Facilities
          </Button>
        </Link>
      </div>

    </div>
  );
};