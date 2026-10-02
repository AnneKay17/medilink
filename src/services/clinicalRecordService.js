import { mockTimelineEvents } from '../data/mockMedicalData';

const STORAGE_KEY = 'medilink_clinical_records';

const getStoredRecords = () => {
  const storedRecords = localStorage.getItem(STORAGE_KEY);

  if (storedRecords) {
    return JSON.parse(storedRecords);
  }

  const initialRecords = mockTimelineEvents.map((event) => ({
    ...event,
    patientId: 'patient-001',
    status: 'submitted',
    version: 1,
    locked: true,
  }));

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(initialRecords)
  );

  return initialRecords;
};

export const clinicalRecordService = {
  getRecordsForPatient: (patientId) => {
    return getStoredRecords().filter(
      (record) => record.patientId === patientId
    );
  },

  saveDraft: ({
    patientId,
    clinicianId,
    clinicianName,
    facility,
    date,
    type,
    title,
    description,
  }) => {
    const currentRecords = getStoredRecords();

    const draft = {
      id: `draft-${Date.now()}`,
      patientId,
      clinicianId,
      clinicianName,
      facility,
      date,
      type,
      title,
      description,
      status: 'draft',
      version: 1,
      locked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedRecords = [draft, ...currentRecords];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedRecords)
    );

    return draft;
  },

  submitRecord: ({
    patientId,
    clinicianId,
    clinicianName,
    facility,
    date,
    type,
    title,
    description,
  }) => {
    const currentRecords = getStoredRecords();

    const submittedRecord = {
      id: `record-${Date.now()}`,
      patientId,
      clinicianId,
      clinicianName,
      facility,
      date,
      type,
      title,
      description,
      status: 'submitted',
      version: 1,
      locked: true,
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
    };

    const updatedRecords = [
      submittedRecord,
      ...currentRecords,
    ];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedRecords)
    );

    return submittedRecord;
  },
};