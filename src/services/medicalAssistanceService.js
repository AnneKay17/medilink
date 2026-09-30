import {
  mockMedicalAssistanceRequests,
} from '../data/mockMedicalAssistance';

const STORAGE_KEY = 'medilink_medical_assistance';

const getStoredRequests = () => {
  const storedRequests = localStorage.getItem(STORAGE_KEY);

  if (storedRequests) {
    return JSON.parse(storedRequests);
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(mockMedicalAssistanceRequests)
  );

  return mockMedicalAssistanceRequests;
};

const saveRequests = (requests) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(requests)
  );
};

export const medicalAssistanceService = {
  getAll: () => {
    return getStoredRequests();
  },

  getForPatient: (patientId) => {
    return getStoredRequests().filter(
      (request) => request.patientId === patientId
    );
  },

  createRequest: ({
    patientId,
    patientName,
    type,
    title,
    description,
    priority,
  }) => {
    const currentRequests = getStoredRequests();

    const newRequest = {
      id: `assistance-${Date.now()}`,
      patientId,
      patientName,
      type,
      title,
      description,
      priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
      assignedTo: null,
      resolvedAt: null,
    };

    saveRequests([newRequest, ...currentRequests]);

    return newRequest;
  },

  updateRequest: (requestId, updates) => {
    const currentRequests = getStoredRequests();

    const updatedRequests = currentRequests.map(
      (request) =>
        request.id === requestId
          ? {
              ...request,
              ...updates,
            }
          : request
    );

    saveRequests(updatedRequests);

    return updatedRequests.find(
      (request) => request.id === requestId
    );
  },
};