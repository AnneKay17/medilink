// Mock patient data
// Nomsa Dlamini is the main demo patient
// Others for testing search, etc.

export const mockPatients = [
  {
    id: 'patient-001',
    name: 'Nomsa Dlamini',
    email: 'nomsa@example.com',
    dateOfBirth: '1985-06-15',
    gender: 'Female',
    phone: '+27 11 555 0123',
    address: '123 Main Street, Johannesburg, 2000',
    emergencyContact: {
      name: 'Thabo Dlamini',
      relationship: 'Spouse',
      phone: '+27 11 555 0124',
    },
    profileImage: null,
    createdAt: '2022-01-10',
    lastUpdated: '2026-09-26',
  },
  {
    id: 'patient-002',
    name: 'John Smith',
    email: 'john.smith@example.com',
    dateOfBirth: '1978-03-22',
    gender: 'Male',
    phone: '+27 21 555 0125',
    address: '456 Oak Avenue, Cape Town, 8000',
    emergencyContact: {
      name: 'Sarah Smith',
      relationship: 'Sister',
      phone: '+27 21 555 0126',
    },
    profileImage: null,
    createdAt: '2023-05-15',
    lastUpdated: '2026-08-30',
  },
  {
    id: 'patient-003',
    name: 'Amara Okonkwo',
    email: 'amara.okonkwo@example.com',
    dateOfBirth: '1992-11-08',
    gender: 'Female',
    phone: '+27 12 555 0127',
    address: '789 Elm Street, Pretoria, 0001',
    emergencyContact: {
      name: 'Chioma Okonkwo',
      relationship: 'Sister',
      phone: '+27 12 555 0128',
    },
    profileImage: null,
    createdAt: '2024-02-20',
    lastUpdated: '2026-09-15',
  },
  {
    id: 'patient-004',
    name: 'David Pieterse',
    email: 'david.p@example.com',
    dateOfBirth: '1965-07-30',
    gender: 'Male',
    phone: '+27 31 555 0129',
    address: '321 Pine Road, Durban, 4001',
    emergencyContact: {
      name: 'Lisa Pieterse',
      relationship: 'Wife',
      phone: '+27 31 555 0130',
    },
    profileImage: null,
    createdAt: '2021-09-12',
    lastUpdated: '2026-09-20',
  },
  {
    id: 'patient-005',
    name: 'Zara Hassan',
    email: 'zara.hassan@example.com',
    dateOfBirth: '1988-02-14',
    gender: 'Female',
    phone: '+27 11 555 0131',
    address: '654 Sunset Boulevard, Johannesburg, 2000',
    emergencyContact: {
      name: 'Omar Hassan',
      relationship: 'Brother',
      phone: '+27 11 555 0132',
    },
    profileImage: null,
    createdAt: '2023-11-01',
    lastUpdated: '2026-09-19',
  },
];

// Get patient by ID
export const getPatientById = (patientId) => {
  return mockPatients.find(p => p.id === patientId);
};

// Search patients by name or ID
export const searchPatients = (query) => {
  if (!query) return mockPatients;
  
  const lowerQuery = query.toLowerCase();
  return mockPatients.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.id.toLowerCase().includes(lowerQuery) ||
    p.email.toLowerCase().includes(lowerQuery)
  );
};