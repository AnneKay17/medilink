import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Card } from '../../components/common/Card';

import { getPatientById } from '../../data/mockPatients';

import { useAuth } from '../../hooks/useAuth';

import { auditService } from '../../services/auditService';
import {
  clinicalRecordService,
} from '../../services/clinicalRecordService';

// Form for clinicians to create a draft or submit a clinical record.

export const AddClinicalRecord = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();

  const patient = getPatientById(patientId);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'visit',
    title: '',
    description: '',
    facility: '',
    clinician: user?.name || '',
  });

  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.facility.trim() ||
      !formData.clinician.trim()
    ) {
      setError('Please complete all required fields.');
      return false;
    }

    return true;
  };

  const handleSaveDraft = () => {
    if (!validateForm()) {
      return;
    }

    clinicalRecordService.saveDraft({
      patientId,
      clinicianId: user?.id,
      clinicianName: formData.clinician,
      facility: formData.facility.trim(),
      date: formData.date,
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description.trim(),
    });

    auditService.addLog({
      clinicianId: user?.id,
      clinicianName: formData.clinician,
      patientId,
      patientName: patient.name,
      action: 'saved_draft',
      description: 'Saved a clinical record draft',
    });

    navigate(`/clinician/patients/${patientId}`);
  };

  const handleSubmitRecord = () => {
    if (!validateForm()) {
      return;
    }

    clinicalRecordService.submitRecord({
      patientId,
      clinicianId: user?.id,
      clinicianName: formData.clinician,
      facility: formData.facility.trim(),
      date: formData.date,
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description.trim(),
    });

    auditService.addLog({
      clinicianId: user?.id,
      clinicianName: formData.clinician,
      patientId,
      patientName: patient.name,
      action: 'submitted_record',
      description: 'Submitted and locked a clinical record',
    });

    navigate(`/clinician/patients/${patientId}`);
  };

  if (!patient) {
    return (
      <div className="space-y-6">
        <Link
          to="/clinician/patients"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Patients
        </Link>

        <Card>
          <div className="py-8 text-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Patient not found
            </h1>

            <p className="mt-2 text-gray-600">
              The patient record could not be found.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <Link
          to={`/clinician/patients/${patientId}`}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Patient Record
        </Link>

        <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900">
          Add Clinical Record
        </h1>

        <p className="mt-2 text-gray-600">
          Create a consultation record for {patient.name}.
        </p>
      </div>

      {/* Workflow notice */}
      <Card className="bg-blue-50 border border-blue-200">
        <p className="text-sm text-gray-700">
          <strong>Clinical record workflow:</strong> You can save your work
          as a draft or submit the completed record. Submitted records are
          treated as locked versions and cannot be overwritten.
        </p>
      </Card>

      {/* Form */}
      <Card>
        <form
          onSubmit={(event) => event.preventDefault()}
          className="space-y-6"
        >

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Date
            </label>

            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Record type */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Record Type
            </label>

            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="visit">Visit</option>
              <option value="diagnosis">Diagnosis</option>
              <option value="procedure">Procedure</option>
              <option value="medication">Medication</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Record Title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Follow-up consultation"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Clinical Notes
            </label>

            <textarea
              id="description"
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter the relevant clinical information..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>

          {/* Facility */}
          <div>
            <label
              htmlFor="facility"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Facility
            </label>

            <input
              id="facility"
              name="facility"
              type="text"
              value={formData.facility}
              onChange={handleChange}
              placeholder="e.g. Hospital B"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Clinician */}
          <div>
            <label
              htmlFor="clinician"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Clinician
            </label>

            <input
              id="clinician"
              name="clinician"
              type="text"
              value={formData.clinician}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">

            <Link
              to={`/clinician/patients/${patientId}`}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={handleSubmitRecord}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit & Lock Record
            </button>

          </div>

        </form>
      </Card>
    </div>
  );
};