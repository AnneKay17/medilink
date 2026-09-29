import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { getPatientById } from '../../data/mockPatients';

// Form for clinicians to add a new clinical record
// This will later save to Firestore
export const AddClinicalRecord = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const patient = getPatientById(patientId);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'visit',
    title: '',
    description: '',
    facility: '',
    clinician: '',
  });

  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.facility.trim() ||
      !formData.clinician.trim()
    ) {
      setError('Please complete all required fields.');
      return;
    }

    // For now, we only simulate saving the record.
    // Firestore persistence will be added in Phase 8.
    console.log('New clinical record:', {
      patientId,
      ...formData,
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
          Add a new clinical entry to {patient.name}'s medical history.
        </p>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">

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
              placeholder="e.g. Dr. Mokoena"
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
              type="submit"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Clinical Record
            </button>

          </div>

        </form>
      </Card>
    </div>
  );
};