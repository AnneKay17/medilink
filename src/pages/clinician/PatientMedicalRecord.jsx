import { Link, useParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { getPatientById } from '../../data/mockPatients';
import {
  noomsaMedicalRecord,
  mockTimelineEvents,
  mockFamilyHistory,
} from '../../data/mockMedicalData';

// Patient medical record
// Displays a patient's verified medical information to a clinician
export const PatientMedicalRecord = () => {
  const { patientId } = useParams();

  const patient = getPatientById(patientId);

  // For the hackathon demo, Nomsa is our main patient.
  // This will later be replaced with data loaded from Firebase.
  const medicalRecord =
    patientId === 'patient-001' ? noomsaMedicalRecord : null;

  // Patient could not be found
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
          <div className="text-center py-8">
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
    <div className="space-y-6">

      {/* Back navigation */}
      <Link
        to="/clinician/patients"
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
      >
        ← Back to Patients
      </Link>

      {/* Patient overview */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">

          <div className="flex items-start gap-4">

            {/* Avatar */}
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-xl font-semibold">
                {patient.name.charAt(0)}
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.name}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Patient ID: {patient.id}
              </p>

              <p className="text-sm text-gray-500">
                Date of birth: {patient.dateOfBirth}
              </p>

              <p className="text-sm text-gray-500">
                Gender: {patient.gender}
              </p>
            </div>

          </div>

          {/* Future action */}
          <Link
            to={`/clinician/patients/${patient.id}/add-record`}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Clinical Record
          </Link>

        </div>
      </Card>

      {/* Critical allergies */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Allergies
        </h2>

        <div className="space-y-4">
          {medicalRecord?.allergies.map((allergy) => {
            const isCritical = allergy.severity === 'life-threatening';

            return (
              <Card
                key={allergy.id}
                className={
                  isCritical
                    ? 'border-l-4 border-red-500'
                    : ''
                }
              >
                <div className="flex items-start gap-4">

                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                      ${
                        isCritical
                          ? 'bg-red-100'
                          : 'bg-yellow-100'
                      }
                    `}
                  >
                    <span>
                      {isCritical ? '⚠️' : '!'
                      }
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {allergy.allergyName}
                      </h3>

                      {isCritical && (
                        <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                          LIFE-THREATENING
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mt-1">
                      Reaction: {allergy.reaction}
                    </p>

                    <p className="text-sm text-gray-600">
                      {allergy.notes}
                    </p>

                    <p className="text-xs text-gray-500 mt-2">
                      Recorded {allergy.recordedDate} by{' '}
                      {allergy.recordingClinician} at{' '}
                      {allergy.recordingFacility}
                    </p>
                  </div>

                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Conditions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Conditions
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {medicalRecord?.conditions.map((condition) => (
            <Card key={condition.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {condition.conditionName}
                  </h3>

                  <p className="text-sm text-gray-600 mt-1">
                    {condition.notes}
                  </p>

                  <p className="text-xs text-gray-500 mt-3">
                    Diagnosed {condition.onsetDate} by{' '}
                    {condition.diagnosingClinician}
                  </p>
                </div>

                <span
                  className={`
                    px-2 py-1 text-xs font-medium rounded-full flex-shrink-0
                    ${
                      condition.status === 'active'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  {condition.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Medications */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Medications
        </h2>

        <div className="space-y-4">
          {medicalRecord?.medications.map((medication) => (
            <Card key={medication.id}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {medication.medicationName}
                  </h3>

                  <p className="text-sm text-gray-600 mt-1">
                    {medication.dosage} · {medication.frequency}
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    {medication.notes}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    Prescribed by {medication.prescribingClinician} at{' '}
                    {medication.prescribingFacility}
                  </p>
                </div>

                <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full self-start">
                  {medication.status}
                </span>

              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Medical history */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Medical History
        </h2>

        <Card>
          <div className="space-y-6">
            {mockTimelineEvents.map((event, index) => (
              <div
                key={event.id}
                className="flex gap-4"
              >
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />

                  {index !== mockTimelineEvents.length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 mt-2" />
                  )}
                </div>

                {/* Event */}
                <div className="pb-6 min-w-0">
                  <p className="text-xs text-gray-500">
                    {event.date}
                  </p>

                  <h3 className="font-semibold text-gray-900 mt-1">
                    {event.title}
                  </h3>

                  <p className="text-sm text-gray-600 mt-1">
                    {event.description}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    {event.facility} · {event.clinician}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Family history */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Family History
        </h2>

        <p className="text-sm text-gray-600 mb-6">
          Relevant health conditions reported in the patient's family.
        </p>

        <div className="space-y-8">
          {/* Immediate Family */}
          {(() => {
            const immediateFamily = mockFamilyHistory.filter((history) =>
              ['Mother', 'Father', 'Sister', 'Brother'].includes(history.relative)
            );

            if (immediateFamily.length === 0) return null;

            return (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-800">
                  Immediate Family
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {immediateFamily.map((history) => (
                    <Card key={history.id}>
                      <h4 className="font-semibold text-gray-900">
                        {history.condition}
                      </h4>

                      <p className="text-sm text-gray-600 mt-2">
                        Approximate age at diagnosis: {Math.floor(history.ageAtDiagnosis / 10) * 10}s
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Maternal Family */}
          {(() => {
            const maternalFamily = mockFamilyHistory.filter((history) =>
              history.relative.toLowerCase().includes('maternal')
            );

            if (maternalFamily.length === 0) return null;

            return (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-800">
                  Maternal Family
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {maternalFamily.map((history) => (
                    <Card key={history.id}>
                      <h4 className="font-semibold text-gray-900">
                        {history.condition}
                      </h4>

                      <p className="text-sm text-gray-600 mt-2">
                        Approximate age at diagnosis: {Math.floor(history.ageAtDiagnosis / 10) * 10}s
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Paternal Family */}
          {(() => {
            const paternalFamily = mockFamilyHistory.filter((history) =>
              history.relative.toLowerCase().includes('paternal')
            );

            if (paternalFamily.length === 0) return null;

            return (
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-800">
                  Paternal Family
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {paternalFamily.map((history) => (
                    <Card key={history.id}>
                      <h4 className="font-semibold text-gray-900">
                        {history.condition}
                      </h4>

                      <p className="text-sm text-gray-600 mt-2">
                        Approximate age at diagnosis: {Math.floor(history.ageAtDiagnosis / 10) * 10}s
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

    </div>
  );
};