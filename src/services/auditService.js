import { mockAuditLogs } from '../data/mockAuditLogs';

const STORAGE_KEY = 'medilink_audit_logs';

const getStoredLogs = () => {
  const storedLogs = localStorage.getItem(STORAGE_KEY);

  if (storedLogs) {
    return JSON.parse(storedLogs);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAuditLogs));

  return mockAuditLogs;
};

export const auditService = {
  getLogs: () => {
    return getStoredLogs();
  },

  addLog: ({
    clinicianId,
    clinicianName,
    patientId,
    patientName,
    action,
    description,
  }) => {
    const currentLogs = getStoredLogs();

    const newLog = {
      id: `audit-${Date.now()}`,
      clinicianId,
      clinicianName,
      patientId,
      patientName,
      action,
      description,
      timestamp: new Date().toISOString(),
    };

    const updatedLogs = [newLog, ...currentLogs];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedLogs)
    );

    return newLog;
  },
};