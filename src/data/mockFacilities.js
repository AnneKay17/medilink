// Mock healthcare facility data
// Hospitals and clinics in South Africa

export const mockFacilities = [
  {
    id: 'facility-001',
    name: 'Hospital A',
    type: 'Hospital',           // 'Hospital', 'Clinic', 'Private Practice'
    address: '100 Main Street, Johannesburg, 2000',
    city: 'Johannesburg',
    province: 'Gauteng',
    phone: '+27 11 555 1000',
    email: 'info@hospitala.co.za',
    website: 'https://hospitala.co.za',
    hours: '24/7',
    servicesOffered: ['Emergency', 'General Surgery', 'Internal Medicine', 'Cardiology'],
    acceptedInsurance: ['MediShield', 'Discovery', 'Momentum'],
    coordinates: { lat: -26.1672, lng: 28.0472 },
    rating: 4.5,
    reviews: 187,
    verified: true,
  },
  {
    id: 'facility-002',
    name: 'Clinic B',
    type: 'Clinic',
    address: '250 Sea Point Road, Cape Town, 8000',
    city: 'Cape Town',
    province: 'Western Cape',
    phone: '+27 21 555 1001',
    email: 'info@clinicb.co.za',
    website: 'https://clinicb.co.za',
    hours: 'Monday-Friday 8am-6pm, Saturday 9am-1pm',
    servicesOffered: ['General Practice', 'Allergy Testing', 'Vaccinations'],
    acceptedInsurance: ['Discovery', 'Momentum', 'Bonitas'],
    coordinates: { lat: -33.9249, lng: 18.3983 },
    rating: 4.7,
    reviews: 92,
    verified: true,
  },
  {
    id: 'facility-003',
    name: 'Clinic C',
    type: 'Clinic',
    address: '400 Main Road, Johannesburg, 2000',
    city: 'Johannesburg',
    province: 'Gauteng',
    phone: '+27 11 555 1002',
    email: 'info@clinicc.co.za',
    website: 'https://clinicc.co.za',
    hours: 'Monday-Friday 7am-5pm',
    servicesOffered: ['General Practice', 'Diabetes Management', 'Chronic Disease'],
    acceptedInsurance: ['MediShield', 'Discovery'],
    coordinates: { lat: -26.1850, lng: 28.0506 },
    rating: 4.3,
    reviews: 65,
    verified: true,
  },
  {
    id: 'facility-004',
    name: 'General Practice',
    type: 'Private Practice',
    address: '500 Oak Lane, Pretoria, 0001',
    city: 'Pretoria',
    province: 'Gauteng',
    phone: '+27 12 555 1003',
    email: 'info@generalpractice.co.za',
    website: 'https://generalpractice.co.za',
    hours: 'Monday-Friday 8am-4pm',
    servicesOffered: ['General Practice', 'Cardiology', 'Health Screening'],
    acceptedInsurance: ['All major schemes'],
    coordinates: { lat: -25.7461, lng: 28.2313 },
    rating: 4.6,
    reviews: 124,
    verified: true,
  },
  {
    id: 'facility-005',
    name: 'Durban Medical Centre',
    type: 'Hospital',
    address: '150 Smith Street, Durban, 4001',
    city: 'Durban',
    province: 'KwaZulu-Natal',
    phone: '+27 31 555 1004',
    email: 'info@durbanmedical.co.za',
    website: 'https://durbanmedical.co.za',
    hours: '24/7',
    servicesOffered: ['Emergency', 'Surgery', 'Pediatrics', 'Maternity'],
    acceptedInsurance: ['Discovery', 'Momentum', 'MediShield'],
    coordinates: { lat: -29.8587, lng: 30.8116 },
    rating: 4.4,
    reviews: 201,
    verified: true,
  },
];

// Get facility by ID
export const getFacilityById = (facilityId) => {
  return mockFacilities.find(f => f.id === facilityId);
};

// Search facilities by name or city
export const searchFacilities = (query) => {
  if (!query) return mockFacilities;
  
  const lowerQuery = query.toLowerCase();
  return mockFacilities.filter(f =>
    f.name.toLowerCase().includes(lowerQuery) ||
    f.city.toLowerCase().includes(lowerQuery) ||
    f.type.toLowerCase().includes(lowerQuery)
  );
};

// Filter facilities by type
export const filterFacilitiesByType = (type) => {
  return mockFacilities.filter(f => f.type === type);
};

// Filter facilities by province
export const filterFacilitiesByProvince = (province) => {
  return mockFacilities.filter(f => f.province === province);
};

// Filter facilities by service
export const filterFacilitiesByService = (service) => {
  return mockFacilities.filter(f =>
    f.servicesOffered.some(s => 
      s.toLowerCase().includes(service.toLowerCase())
    )
  );
};