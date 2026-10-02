import { PatientLayout } from '../../layouts/PatientLayout';
import { AllergyCard } from '../../components/medical/AllergyCard';
import { MedicationCard } from '../../components/medical/MedicationCard';
import { Card } from '../../components/common/Card';
// eslint-disable-next-line no-unused-vars
import { Badge } from '../../components/common/Badge';
import { noomsaMedicalRecord } from '../../data/mockMedicalData';

// Patient: My Health
// Shows allergies and medications in detail

export const MyHealth = () => {
  const medicalData = noomsaMedicalRecord;
  const allergies = medicalData.allergies;
  const medications = medicalData.medications;

  return (
    <PatientLayout currentPage="My Health">
      <div className="space-y-8">
        {/* Page title */}
        <section>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Health</h1>
          <p className="text-gray-600">
            Your allergies and current medications
          </p>
        </section>

        {/* Allergies */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Allergies</h2>
          {allergies.length > 0 ? (
            <div className="space-y-4">
              {allergies.map(allergy => (
                <AllergyCard
                  key={allergy.id}
                  allergyName={allergy.allergyName}
                  severity={allergy.severity}
                  reaction={allergy.reaction}
                  recordedDate={allergy.recordedDate}
                  recordingFacility={allergy.recordingFacility}
                  recordingClinician={allergy.recordingClinician}
                />
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-gray-600">No allergies recorded.</p>
            </Card>
          )}
        </section>

        {/* Medications */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Medications</h2>
          {medications.length > 0 ? (
            <div className="space-y-4">
              {medications.map(med => (
                <MedicationCard
                  key={med.id}
                  medicationName={med.medicationName}
                  dosage={med.dosage}
                  frequency={med.frequency}
                  status={med.status}
                  prescribingClinician={med.prescribingClinician}
                  prescribingFacility={med.prescribingFacility}
                  prescribedDate={med.prescribedDate}
                />
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-gray-600">No medications recorded.</p>
            </Card>
          )}
        </section>

        {/* Important notice */}
        <Card className="bg-blue-50 border border-blue-100">
          <p className="text-sm text-gray-700">
            <strong>ℹ️ Note:</strong> You can view but not edit your medical records. 
            If you need to report an error or update information, please contact your healthcare provider or 
            use the <strong>"Request Assistance"</strong> feature.
          </p>
        </Card>
      </div>
    </PatientLayout>
  );
};