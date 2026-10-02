// Mock medical assistance requests
// Used for "Medical Assistance" feature (patient can request help, clinician can view requests)

export const mockMedicalAssistanceRequests = [
  {
    id: 'assistance-001',
    patientId: 'patient-001',
    patientName: 'Nomsa Dlamini',
    type: 'medication-refill',     // 'medication-refill', 'prescription', 'appointment', 'urgent', 'question'
    title: 'Request Lisinopril Refill',
    description: 'Running out of blood pressure medication. Need refill for next 3 months.',
    priority: 'normal',             // 'low', 'normal', 'high', 'urgent'
    status: 'pending',              // 'pending', 'in-progress', 'resolved', 'closed'
    createdAt: '2026-09-25T14:30:00',
    assignedTo: null,               // clinician ID if assigned
    resolvedAt: null,
  },
  {
    id: 'assistance-002',
    patientId: 'patient-001',
    patientName: 'Nomsa Dlamini',
    type: 'appointment',
    title: 'Schedule Diabetes Follow-up',
    description: 'Need to book follow-up appointment with endocrinologist. HbA1c test due.',
    priority: 'normal',
    status: 'in-progress',
    createdAt: '2026-09-20T10:15:00',
    assignedTo: 'clinician-002',
    resolvedAt: null,
  },
  {
    id: 'assistance-003',
    patientId: 'patient-002',
    patientName: 'John Smith',
    type: 'question',
    title: 'Question about medication side effects',
    description: 'Experiencing headaches since starting new medication. Is this normal?',
    priority: 'high',
    status: 'resolved',
    createdAt: '2026-09-18T09:00:00',
    assignedTo: 'clinician-001',
    resolvedAt: '2026-09-19T14:20:00',
  },
  {
    id: 'assistance-004',
    patientId: 'patient-003',
    patientName: 'Amara Okonkwo',
    type: 'prescription',
    title: 'New prescription needed',
    description: 'Current allergy medication is not effective. Need to try alternative.',
    priority: 'normal',
    status: 'pending',
    createdAt: '2026-09-24T16:45:00',
    assignedTo: null,
    resolvedAt: null,
  },
];

// Get assistance requests for a patient
export const getPatientAssistanceRequests = (patientId) => {
  return mockMedicalAssistanceRequests.filter(r => r.patientId === patientId);
};

// Get assistance requests assigned to a clinician
export const getClinicianAssistanceRequests = (clinicianId) => {
  return mockMedicalAssistanceRequests.filter(r => r.assignedTo === clinicianId);
};

// Get pending assistance requests
export const getPendingAssistanceRequests = () => {
  return mockMedicalAssistanceRequests.filter(r => r.status === 'pending');
};