import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PatientLayout } from '../../layouts/PatientLayout';
import { SearchBar } from '../../components/common/SearchBar';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
// eslint-disable-next-line no-unused-vars
import { mockFacilities, searchFacilities, filterFacilitiesByProvince } from '../../data/mockFacilities';

// Patient: Healthcare Finder
// Find healthcare facilities (hospitals, clinics)
// Search, filter by type, view details

const facilityTypeIcons = {
  'Hospital': '🏥',
  'Clinic': '🏨',
  'Private Practice': '👨‍⚕️',
};

export const HealthcareFinder = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
  const [isProvinceFilterOpen, setIsProvinceFilterOpen] = useState(false);

  const provinces = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape',
  ];
  // Filter facilities based on search and type
  const filteredFacilities = (() => {
    let results = mockFacilities;

    // Apply search
    if (searchQuery) {
      results = searchFacilities(searchQuery);
    }

    // Apply type filter
    if (selectedType) {
      results = results.filter(f => f.type === selectedType);
    }

    if (selectedProvince) {
    results = filterFacilitiesByProvince(selectedProvince).filter((facility) =>
      results.some((result) => result.id === facility.id)
    );
  }

    return results;
  })();

  // eslint-disable-next-line no-unused-vars
  const handleSearch = (value) => {
    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => setIsSearching(false), 500);
  };

  return (
    <PatientLayout currentPage="Healthcare Finder">
      <div className="space-y-8">
        {/* Page title */}
        <section>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Healthcare</h1>
          <p className="text-gray-600">
            Search and discover healthcare facilities near you
          </p>
        </section>

        {/* Search section */}
        <section className="space-y-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder="Search by facility name, city, or service..."
            size="lg"
            isLoading={isSearching}
          />
        </section>

        {/* Filters */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Filter
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Filter by Type */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsTypeFilterOpen(!isTypeFilterOpen);
                  setIsProvinceFilterOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors"
              >
                <span>
                  By Type
                  {selectedType && (
                    <span className="ml-2 text-blue-600">
                      • {selectedType}
                    </span>
                  )}
                </span>

                <span className="text-gray-400">
                  {isTypeFilterOpen ? '▲' : '▼'}
                </span>
              </button>

              {isTypeFilterOpen && (
                <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedType(null);
                      setIsTypeFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${
                      selectedType === null
                        ? 'text-blue-600 font-medium bg-blue-50'
                        : 'text-gray-700'
                    }`}
                  >
                    All Types
                  </button>

                  {['Hospital', 'Clinic', 'Private Practice'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setSelectedType(type);
                        setIsTypeFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${
                        selectedType === type
                          ? 'text-blue-600 font-medium bg-blue-50'
                          : 'text-gray-700'
                      }`}
                    >
                      {facilityTypeIcons[type]} {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter by Province */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsProvinceFilterOpen(!isProvinceFilterOpen);
                  setIsTypeFilterOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors"
              >
                <span>
                  By Province
                  {selectedProvince && (
                    <span className="ml-2 text-blue-600">
                      • {selectedProvince}
                    </span>
                  )}
                </span>

                <span className="text-gray-400">
                  {isProvinceFilterOpen ? '▲' : '▼'}
                </span>
              </button>

              {isProvinceFilterOpen && (
                <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-80 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProvince(null);
                      setIsProvinceFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${
                      selectedProvince === null
                        ? 'text-blue-600 font-medium bg-blue-50'
                        : 'text-gray-700'
                    }`}
                  >
                    All Provinces
                  </button>

                  {provinces.map((province) => (
                    <button
                      key={province}
                      type="button"
                      onClick={() => {
                        setSelectedProvince(province);
                        setIsProvinceFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${
                        selectedProvince === province
                          ? 'text-blue-600 font-medium bg-blue-50'
                          : 'text-gray-700'
                      }`}
                    >
                      {province}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {filteredFacilities.length} Result{filteredFacilities.length !== 1 ? 's' : ''}
            </h3>
          </div>

          {filteredFacilities.length > 0 ? (
            <div className="grid gap-4">
              {filteredFacilities.map(facility => (
                <Card key={facility.id} className="hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {facilityTypeIcons[facility.type]} {facility.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {facility.city}, {facility.province}
                        </p>
                      </div>
                      <Badge variant="active">Verified</Badge>
                    </div>

                    {/* Address & Contact */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">{facility.address}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{facility.phone}</p>
                        <p className="text-gray-600 text-xs">{facility.hours}</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm font-medium text-gray-900">
                        {facility.rating} ({facility.reviews} reviews)
                      </span>
                    </div>

                    {/* Services */}
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-2">Services:</p>
                      <div className="flex flex-wrap gap-2">
                        {facility.servicesOffered.slice(0, 3).map(service => (
                          <Badge key={service} variant="pending">
                            {service}
                          </Badge>
                        ))}
                        {facility.servicesOffered.length > 3 && (
                          <span className="text-xs text-gray-600">
                            +{facility.servicesOffered.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action button */}
                    <Link
                    to={`/patient/healthcare/${facility.id}`}
                    className="block"
                    >
                    <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        className="mt-2"
                    >
                        View Details
                    </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <p className="text-gray-600">No facilities found matching your search.</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters.</p>
            </Card>
          )}
        </section>
      </div>
    </PatientLayout>
  );
};