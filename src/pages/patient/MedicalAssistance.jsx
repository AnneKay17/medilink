import { useState } from 'react';

import { PatientLayout } from '../../layouts/PatientLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

import { getPatientAssistanceRequests } from '../../data/mockMedicalAssistance';

// Patient: Medical Assistance
// Submit requests for help and view request status

const assistanceTypeIcons = {
  'medication-refill': '💊',
  prescription: '📝',
  appointment: '📅',
  urgent: '🚨',
  question: '❓',
};

const priorityConfig = {
  low: { color: 'bg-gray-100 text-gray-700', label: 'Low' },
  normal: { color: 'bg-blue-100 text-blue-700', label: 'Normal' },
  high: { color: 'bg-yellow-100 text-yellow-700', label: 'High' },
  urgent: { color: 'bg-red-100 text-red-700', label: 'Urgent' },
};

const statusConfig = {
  pending: { color: 'pending', label: 'Pending' },
  'in-progress': { color: 'pending', label: 'In Progress' },
  resolved: { color: 'verified', label: 'Resolved' },
  closed: { color: 'pending', label: 'Closed' },
};

export const MedicalAssistance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Keep requests in local state for the mock/demo stage
  const [requests, setRequests] = useState(
    getPatientAssistanceRequests('patient-001')
  );

  const [formData, setFormData] = useState({
    type: 'medication-refill',
    title: '',
    description: '',
    priority: 'normal',
  });

  const [formError, setFormError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formError) {
      setFormError('');
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError('Please provide a title and details for your request.');
      return;
    }

    const newRequest = {
      id: `assistance-${Date.now()}`,
      patientId: 'patient-001',
      patientName: 'Nomsa Dlamini',
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
      assignedTo: null,
      resolvedAt: null,
    };

    setRequests((prev) => [newRequest, ...prev]);

    setIsModalOpen(false);

    setFormData({
      type: 'medication-refill',
      title: '',
      description: '',
      priority: 'normal',
    });

    setFormError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError('');
  };

  return (
    <PatientLayout currentPage="Medical Assistance">
      <div className="space-y-8">

        {/* Page title */}
        <section>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Medical Assistance
          </h1>

          <p className="text-gray-600">
            Request help with medications, appointments, or ask questions
          </p>
        </section>

        {/* New request button */}
        <section>
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
          >
            + New Request
          </Button>
        </section>

        {/* Request form modal */}
        <Modal
          isOpen={isModalOpen}
          title="Submit Medical Assistance Request"
          onClose={handleCloseModal}
          size="md"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                onClick={handleSubmit}
              >
                Submit Request
              </Button>
            </>
          }
        >
          <div className="space-y-4">

            {/* Request type */}
            <div>
              <label
                htmlFor="request-type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Request Type
              </label>

              <select
                id="request-type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="medication-refill">
                  💊 Medication Refill
                </option>
                <option value="prescription">
                  📝 New Prescription
                </option>
                <option value="appointment">
                  📅 Schedule Appointment
                </option>
                <option value="question">
                  ❓ Ask a Question
                </option>
                <option value="urgent">
                  🚨 Urgent Help
                </option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor="request-priority"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Priority
              </label>

              <select
                id="request-priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="request-title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title
              </label>

              <input
                id="request-title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief summary of your request"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="request-description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Details
              </label>

              <textarea
                id="request-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide more details about your request"
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Validation error */}
            {formError && (
              <p className="text-sm text-red-600" role="alert">
                {formError}
              </p>
            )}

          </div>
        </Modal>

        {/* Requests list */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Requests ({requests.length})
          </h2>

          {requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((request) => {
                const typeIcon =
                  assistanceTypeIcons[request.type] || '❓';

                const priorityStyle =
                  priorityConfig[request.priority];

                const statusStyle =
                  statusConfig[request.status];

                return (
                  <Card
                    key={request.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-2">

                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">

                          <span className="text-2xl">
                            {typeIcon}
                          </span>

                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {request.title}
                            </h4>

                            <p className="text-sm text-gray-600 mt-1">
                              {request.description}
                            </p>
                          </div>

                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-200">

                        <Badge variant={statusStyle.color}>
                          {statusStyle.label}
                        </Badge>

                        <span
                          className={`text-xs px-2 py-1 rounded ${priorityStyle.color}`}
                        >
                          {priorityStyle.label} Priority
                        </span>

                        <span className="text-xs text-gray-500">
                          {new Date(
                            request.createdAt
                          ).toLocaleDateString()}
                        </span>

                        {request.assignedTo && (
                          <span className="text-xs text-gray-600">
                            Assigned to clinician
                          </span>
                        )}

                      </div>

                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-8">
              <p className="text-gray-600">
                No assistance requests yet.
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Click "New Request" above to get started.
              </p>
            </Card>
          )}
        </section>

      </div>
    </PatientLayout>
  );
};