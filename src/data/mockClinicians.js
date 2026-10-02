// Mock clinician data
// Dr. Mokoena is the main demo clinician

export const mockClinicians = [
  {
    id: 'clinician-001',
    name: 'Dr. Mokoena',
    specialization: 'General Practitioner',
    email: 'dr.mokoena@example.com',
    phone: '+27 11 555 0201',
    licenseNumber: 'ZA-GP-12345',
    facility: 'Hospital A',
    facilityId: 'facility-001',
    profileImage: null,
    createdAt: '2020-03-15',
  },
  {
    id: 'clinician-002',
    name: 'Dr. Patel',
    specialization: 'Endocrinologist',
    email: 'dr.patel@example.com',
    phone: '+27 11 555 0202',
    licenseNumber: 'ZA-ED-54321',
    facility: 'Clinic C',
    facilityId: 'facility-003',
    profileImage: null,
    createdAt: '2019-07-22',
  },
  {
    id: 'clinician-003',
    name: 'Dr. Johnson',
    specialization: 'Allergist',
    email: 'dr.johnson@example.com',
    phone: '+27 21 555 0203',
    licenseNumber: 'ZA-AL-67890',
    facility: 'Clinic B',
    facilityId: 'facility-002',
    profileImage: null,
    createdAt: '2021-01-10',
  },
  {
    id: 'clinician-004',
    name: 'Dr. Williams',
    specialization: 'Cardiologist',
    email: 'dr.williams@example.com',
    phone: '+27 12 555 0204',
    licenseNumber: 'ZA-CD-11111',
    facility: 'General Practice',
    facilityId: 'facility-004',
    profileImage: null,
    createdAt: '2018-05-05',
  },
  {
    id: 'clinician-005',
    name: 'Dr. Smith',
    specialization: 'Internal Medicine',
    email: 'dr.smith@example.com',
    phone: '+27 31 555 0205',
    licenseNumber: 'ZA-IM-22222',
    facility: 'Hospital A',
    facilityId: 'facility-001',
    profileImage: null,
    createdAt: '2017-09-18',
  },
];

// Get clinician by ID
export const getClinicianById = (clinicianId) => {
  return mockClinicians.find(c => c.id === clinicianId);
};

// Get clinicians by facility
export const getCliniciansByFacility = (facilityId) => {
  return mockClinicians.filter(c => c.facilityId === facilityId);
};