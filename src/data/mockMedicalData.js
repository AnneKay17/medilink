// Mock medical data for testing components
// This is fictional/demo data only

export const mockAllergies = [
  {
    id: 'allergy-1',
    allergyName: 'Penicillin',
    severity: 'life-threatening',
    reaction: 'Anaphylaxis',
    recordedDate: '2024-03-22',
    recordingFacility: 'Clinic B',
    recordingClinician: 'Dr. Johnson',
  },
  {
    id: 'allergy-2',
    allergyName: 'Lactose',
    severity: 'mild',
    reaction: 'Digestive upset',
    recordedDate: '2023-06-10',
    recordingFacility: 'General Practice',
    recordingClinician: 'Dr. Patel',
  },
  {
    id: 'allergy-3',
    allergyName: 'Aspirin',
    severity: 'moderate',
    reaction: 'Rash and itching',
    recordedDate: '2023-11-05',
    recordingFacility: 'Hospital A',
    recordingClinician: 'Dr. Smith',
  },
];

export const mockConditions = [
  {
    id: 'condition-1',
    conditionName: 'Hypertension',
    status: 'active',
    onsetDate: '2023-01-15',
    diagnosingFacility: 'Hospital A',
    diagnosingClinician: 'Dr. Smith',
  },
  {
    id: 'condition-2',
    conditionName: 'Type 2 Diabetes',
    status: 'active',
    onsetDate: '2024-06-10',
    diagnosingFacility: 'Clinic C',
    diagnosingClinician: 'Dr. Patel',
  },
  {
    id: 'condition-3',
    conditionName: 'Seasonal Allergies',
    status: 'resolved',
    onsetDate: '2022-03-01',
    diagnosingFacility: 'General Practice',
    diagnosingClinician: 'Dr. Williams',
  },
];

export const mockMedications = [
  {
    id: 'med-1',
    medicationName: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    status: 'active',
    prescribingClinician: 'Dr. Smith',
    prescribingFacility: 'Hospital A',
    prescribedDate: '2023-01-15',
  },
  {
    id: 'med-2',
    medicationName: 'Metformin',
    dosage: '1000mg',
    frequency: 'Twice daily',
    status: 'active',
    prescribingClinician: 'Dr. Patel',
    prescribingFacility: 'Clinic C',
    prescribedDate: '2024-06-10',
  },
  {
    id: 'med-3',
    medicationName: 'Aspirin',
    dosage: '81mg',
    frequency: 'Once daily',
    status: 'discontinued',
    prescribingClinician: 'Dr. Smith',
    prescribingFacility: 'Hospital A',
    prescribedDate: '2023-02-01',
  },
];

// Add these to your existing mockMedicalData.js file

export const mockTimelineEvents = [
  {
    id: 'event-1',
    date: '2026-09-26',
    type: 'visit',
    title: 'Acute rhinitis, follow-up visit',
    description: 'Patient presented with cold-like symptoms. Upper respiratory infection noted.',
    facility: 'Hospital B',
    clinician: 'Dr. Mokoena',
  },
  {
    id: 'event-2',
    date: '2024-06-10',
    type: 'diagnosis',
    title: 'Type 2 Diabetes diagnosed',
    description: 'Fasting glucose elevated. HbA1c test confirms diabetes diagnosis.',
    facility: 'Clinic C',
    clinician: 'Dr. Patel',
  },
  {
    id: 'event-3',
    date: '2024-03-22',
    type: 'allergy',
    title: 'Penicillin allergy confirmed',
    description: 'Patient reported previous reaction. Allergy documented and confirmed.',
    facility: 'Clinic B',
    clinician: 'Dr. Johnson',
  },
  {
    id: 'event-4',
    date: '2023-01-15',
    type: 'diagnosis',
    title: 'Hypertension diagnosed',
    description: 'Blood pressure consistently elevated. Started on antihypertensive therapy.',
    facility: 'Hospital A',
    clinician: 'Dr. Smith',
  },
  {
    id: 'event-5',
    date: '2022-11-30',
    type: 'procedure',
    title: 'Annual health screening',
    description: 'Routine preventive care checkup. All vital signs normal.',
    facility: 'General Practice',
    clinician: 'Dr. Williams',
  },
  {
    id: 'event-6',
    date: '2022-06-05',
    type: 'medication',
    title: 'Aspirin started',
    description: 'Low-dose aspirin for cardiovascular health.',
    facility: 'General Practice',
    clinician: 'Dr. Williams',
  },
];

export const mockFamilyHistory = [
  {
    id: 'fh-1',
    relative: 'Mother',
    condition: 'Type 2 Diabetes',
    ageAtDiagnosis: 52,
    notes: 'Diagnosed in 2015. Well-controlled with medication and lifestyle changes.',
  },
  {
    id: 'fh-2',
    relative: 'Father',
    condition: 'Hypertension',
    ageAtDiagnosis: 48,
    notes: 'Managed with antihypertensive medication. Had heart attack at age 65.',
  },
  {
    id: 'fh-3',
    relative: 'Paternal Grandmother',
    condition: 'Breast Cancer',
    ageAtDiagnosis: 68,
    notes: 'Diagnosed 2010. Surgery and chemotherapy. Survived.',
  },
  {
    id: 'fh-4',
    relative: 'Maternal Uncle',
    condition: 'Type 2 Diabetes',
    ageAtDiagnosis: 50,
    notes: 'Complicated by kidney disease.',
  },
  {
    id: 'fh-5',
    relative: 'Sister',
    condition: 'Asthma',
    ageAtDiagnosis: 25,
    notes: 'Mild, well-controlled with inhalers.',
  },
];

// Add this to mockMedicalData.js - Add a complete record for Nomsa

export const noomsaMedicalRecord = {
  patientId: 'patient-001',
  patientName: 'Nomsa Dlamini',
  dateOfBirth: '1985-06-15',
  gender: 'Female',
  
  // Allergies specific to Nomsa
  allergies: [
    {
      id: 'allergy-nomsa-001',
      allergyName: 'Penicillin',
      severity: 'life-threatening',
      reaction: 'Anaphylaxis',
      recordedDate: '2024-03-22',
      recordingFacility: 'Clinic B',
      recordingClinician: 'Dr. Johnson',
      notes: 'Previous severe reaction. Avoid all beta-lactams.',
    },
    {
      id: 'allergy-nomsa-002',
      allergyName: 'Lactose',
      severity: 'mild',
      reaction: 'Gastrointestinal discomfort',
      recordedDate: '2023-05-10',
      recordingFacility: 'Clinic C',
      recordingClinician: 'Dr. Patel',
      notes: 'Avoid dairy products or use lactase supplements.',
    },
  ],

  // Conditions specific to Nomsa
  conditions: [
    {
      id: 'condition-nomsa-001',
      conditionName: 'Hypertension',
      status: 'active',
      onsetDate: '2023-01-15',
      diagnosingFacility: 'Hospital A',
      diagnosingClinician: 'Dr. Smith',
      notes: 'Stage 2. Managed with Lisinopril.',
    },
    {
      id: 'condition-nomsa-002',
      conditionName: 'Type 2 Diabetes',
      status: 'active',
      onsetDate: '2024-06-10',
      diagnosingFacility: 'Clinic C',
      diagnosingClinician: 'Dr. Patel',
      notes: 'HbA1c: 7.2%. Managed with Metformin.',
    },
    {
      id: 'condition-nomsa-003',
      conditionName: 'Seasonal Allergies',
      status: 'active',
      onsetDate: '2020-01-01',
      diagnosingFacility: 'General Practice',
      diagnosingClinician: 'Dr. Williams',
      notes: 'Managed with antihistamines.',
    },
  ],

  // Medications specific to Nomsa
  medications: [
    {
      id: 'med-nomsa-001',
      medicationName: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      status: 'active',
      prescribingClinician: 'Dr. Smith',
      prescribingFacility: 'Hospital A',
      prescribedDate: '2023-01-20',
      notes: 'For hypertension. Take in the morning.',
    },
    {
      id: 'med-nomsa-002',
      medicationName: 'Metformin',
      dosage: '1000mg',
      frequency: 'Twice daily',
      status: 'active',
      prescribingClinician: 'Dr. Patel',
      prescribingFacility: 'Clinic C',
      prescribedDate: '2024-06-15',
      notes: 'For Type 2 Diabetes. Take with meals.',
    },
    {
      id: 'med-nomsa-003',
      medicationName: 'Cetirizine',
      dosage: '10mg',
      frequency: 'As needed',
      status: 'active',
      prescribingClinician: 'Dr. Williams',
      prescribingFacility: 'General Practice',
      prescribedDate: '2024-01-10',
      notes: 'For seasonal allergies. May cause drowsiness.',
    },
  ],
};